import http from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { randomBytes, randomUUID, scryptSync, timingSafeEqual, createHash } from 'node:crypto';
import { readFileSync, mkdirSync, statSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getContentReadiness, getContentCatalog, getContentChapter, getContentAsset, getContentReference, recommendContent, dialogContent, closeContentRetrieval } from './retrieval/index.mjs';
import { getExtractor } from './retrieval/semantic.mjs';
import { loadCareerImports } from './careers.mjs';
import { loadUiuxCareer, presentUiuxCatalog, uiuxChapter, queryUiuxLearning, getUiuxAsset, UIUX_CAREER_ID, UIUX_CONTENT_VERSION } from './uiux-catalog.mjs';
import { analyzeVoiceRequest, probeLocalAsr } from './voice/index.mjs';

export const PRODUCT_VERSION = 'local-mvp-0.4';
// Public 1.0 release identity. PRODUCT_VERSION remains the legacy account/
// generation compatibility field and is intentionally not replaced.
export const RELEASE_VERSION = 'rolecraft-1.0';
const serverDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.dirname(serverDir);
const fileSha = relative => createHash('sha256').update(readFileSync(path.join(projectDir, relative))).digest('hex');
const agentContentIndex = JSON.parse(readFileSync(path.join(serverDir, 'retrieval/content-v13-index.json'), 'utf8'));
const rollbackContentIndex = JSON.parse(readFileSync(path.join(serverDir, 'retrieval/content-v12-index.json'), 'utf8'));
if (agentContentIndex.corpusVersion !== 'textbook-v13' || agentContentIndex.bookSha256 !== fileSha('textbooks/v13/agent-engineering-textbook.md') || agentContentIndex.corpusHash !== createHash('sha256').update(JSON.stringify(agentContentIndex.units.map(unit => [unit.unitId, unit.sourceSha256]))).digest('hex')) throw Error('textbook-v13 index does not match the book');
if (rollbackContentIndex.corpusVersion !== 'textbook-v12' || rollbackContentIndex.bookSha256 !== fileSha('textbooks/v12/agent-engineering-textbook.md')) throw Error('textbook-v12 rollback index does not match the book');
const hash = value => createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
const now = () => new Date().toISOString();
const parse = value => value ? JSON.parse(value) : null;
class ApiError extends Error { constructor(status, code, message) { super(message); this.status=status; this.code=code; } }
const reject = (status, code, message) => { throw new ApiError(status,code,message); };
function fields(input, allowed) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) reject(400,'input_invalid','需要 JSON 对象');
  for (const key of Object.keys(input)) if (!allowed.includes(key)) reject(400,'input_invalid',`不支持字段：${key}`);
}
function str(value, name, max=4000, required=false) {
  if (value == null && !required) return '';
  if (typeof value !== 'string' || value.length > max || (required && !value.trim())) reject(400,'input_invalid',`${name} 格式或长度不合法`);
  return value.trim();
}
function refs(value, name) {
  if (value == null) return [];
  if (!Array.isArray(value) || value.length > 30) reject(400,'input_invalid',`${name} 必须为最多30项引用`);
  return value.map(item=>str(item,name,2000,true));
}
const SUBMISSION_RECORD_TYPES = new Set(['draft','self_report','ai_suggestion','professional_review','human_review']);
const SUBMISSION_WORKFLOW_STATUS = new Map([
  ['draft','draft'],['草稿','draft'],['未开始','draft'],
  ['submitted','submitted'],['提交','submitted'],['已提交','submitted'],
  ['pending_reverify','pending_reverify'],['pending_review','pending_reverify'],['待复验','pending_reverify'],['待独立复验','pending_reverify'],
  ['issues_found','issues_found'],['issue_found','issues_found'],['发现问题','issues_found'],
  ['evidence_insufficient','evidence_insufficient'],['insufficient_evidence','evidence_insufficient'],['证据不足','evidence_insufficient'],
]);
const CLIENT_VERDICT_FIELDS = new Set([
  'professionalVerdict','humanVerdict','professionalReview','humanReview',
  'professionalStatus','humanStatus','reviewOutcome','reviewVerdict','independentVerdict',
]);
const P01_IDENTITY = Object.freeze({
  practiceId:'V1-PILOT-P01-MVP-001',
  unitId:'p01-mvp',
  textbookVersion:'textbook-v13',
  sourceSha:fileSha('textbooks/v13/p01-mvp.md'),
  reviewScope:'limited_to_constructed_fixture',
});
function recordTypes(value, name='recordTypes') {
  if (!Array.isArray(value) || value.length>10 || !value.length) reject(400,'input_invalid',`${name} 必须是1–10项记录类型`);
  const unique=[];
  for (const item of value) {
    const v=str(item,name,64,true);
    if (!SUBMISSION_RECORD_TYPES.has(v)) reject(400,'input_invalid',`${name} 含有不支持的记录类型`);
    if (!unique.includes(v)) unique.push(v);
  }
  return unique;
}
function workflowStatus(value, name='workflowStatus') {
  const v=str(value,name,64,true);
  const code=SUBMISSION_WORKFLOW_STATUS.get(v);
  if (!code) reject(400,'input_invalid',`${name} 不是允许的作品状态`);
  return {value:v,code};
}
function artifactUrl(value) {
  const v=str(value,'artifactUrl',2000);
  if (!v) return v;
  try { const u=new URL(v); if (!['http:','https:'].includes(u.protocol) || u.username || u.password) throw Error(); }
  catch { reject(400,'input_invalid','作品链接仅支持不含凭据的 http/https URL；不会抓取'); }
  return v;
}

export function createRolecraftServer(options={}) {
  const dataDir=options.dataDir || process.env.ROLECRAFT_DATA_DIR || path.join(projectDir,'.runtime');
  mkdirSync(dataDir,{recursive:true,mode:0o700});
  const db=new DatabaseSync(path.join(dataDir,'rolecraft.sqlite'));
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,email TEXT UNIQUE NOT NULL,password_hash TEXT NOT NULL,salt TEXT NOT NULL,created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),csrf TEXT NOT NULL,expires_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS profiles(user_id TEXT PRIMARY KEY REFERENCES users(id),version INTEGER NOT NULL,data TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS jobs(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),idem TEXT NOT NULL,input_hash TEXT NOT NULL,input TEXT NOT NULL,status TEXT NOT NULL,retry_of TEXT,chapter_id TEXT,error TEXT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL,lease_token INTEGER NOT NULL DEFAULT 0,lease_until INTEGER,worker_id TEXT,UNIQUE(user_id,idem));
    CREATE TABLE IF NOT EXISTS attempts(id TEXT PRIMARY KEY,job_id TEXT NOT NULL REFERENCES jobs(id),number INTEGER NOT NULL,status TEXT NOT NULL,lease_token INTEGER NOT NULL,started_at TEXT NOT NULL,ended_at TEXT,error TEXT,provider_unknown INTEGER NOT NULL DEFAULT 0,UNIQUE(job_id,number));
    CREATE TABLE IF NOT EXISTS events(id INTEGER PRIMARY KEY AUTOINCREMENT,job_id TEXT NOT NULL REFERENCES jobs(id),sequence INTEGER NOT NULL,type TEXT NOT NULL,data TEXT NOT NULL,created_at TEXT NOT NULL,UNIQUE(job_id,sequence));
    CREATE TABLE IF NOT EXISTS chapters(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),job_id TEXT UNIQUE NOT NULL REFERENCES jobs(id),attempt_id TEXT NOT NULL,version INTEGER NOT NULL,module_id TEXT NOT NULL,result TEXT NOT NULL,output_hash TEXT NOT NULL,created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS submissions(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),chapter_id TEXT,module_id TEXT NOT NULL,data TEXT NOT NULL,created_at TEXT NOT NULL,
      previous_submission_id TEXT REFERENCES submissions(id),practice_id TEXT,unit_id TEXT,textbook_version TEXT,source_sha TEXT,artifact_version TEXT,workflow_status TEXT,record_types TEXT,evidence_refs TEXT,review_scope TEXT);
    CREATE TABLE IF NOT EXISTS reviews(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),submission_id TEXT NOT NULL REFERENCES submissions(id),data TEXT NOT NULL,created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS careers(career_id TEXT PRIMARY KEY,slug TEXT NOT NULL UNIQUE,title TEXT NOT NULL,summary TEXT NOT NULL DEFAULT '',status TEXT NOT NULL CHECK(status IN ('preparing','published','retired')),content_version TEXT NOT NULL,index_version TEXT NOT NULL,textbook_id TEXT NOT NULL,textbook_version_id TEXT NOT NULL,corpus_hash TEXT,book_sha256 TEXT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS user_careers(user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,career_id TEXT NOT NULL REFERENCES careers(career_id) ON DELETE RESTRICT,status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','hidden')),joined_at TEXT NOT NULL,selected_at TEXT,PRIMARY KEY(user_id,career_id));
    CREATE TABLE IF NOT EXISTS user_preferences(user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,active_career_id TEXT,updated_at TEXT NOT NULL,FOREIGN KEY(user_id,active_career_id) REFERENCES user_careers(user_id,career_id));
    CREATE TABLE IF NOT EXISTS user_favorites(favorite_id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,career_id TEXT NOT NULL,textbook_version_id TEXT NOT NULL,unit_id TEXT NOT NULL,section_id TEXT,source_sha256 TEXT NOT NULL,created_at TEXT NOT NULL,removed_at TEXT,FOREIGN KEY(user_id,career_id) REFERENCES user_careers(user_id,career_id));
    CREATE UNIQUE INDEX IF NOT EXISTS user_favorites_active_target ON user_favorites(user_id,career_id,textbook_version_id,unit_id,COALESCE(section_id,'')) WHERE removed_at IS NULL;
    CREATE INDEX IF NOT EXISTS user_favorites_lookup ON user_favorites(user_id,career_id,created_at DESC) WHERE removed_at IS NULL;
    CREATE TABLE IF NOT EXISTS user_progress(user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,career_id TEXT NOT NULL,textbook_version_id TEXT NOT NULL,unit_id TEXT NOT NULL,state TEXT NOT NULL CHECK(state IN ('opened','in_progress','reviewed')),last_section_id TEXT,source_sha256 TEXT NOT NULL,updated_at TEXT NOT NULL,PRIMARY KEY(user_id,career_id,textbook_version_id,unit_id),FOREIGN KEY(user_id,career_id) REFERENCES user_careers(user_id,career_id));
    CREATE TABLE IF NOT EXISTS user_recent(recent_id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,career_id TEXT NOT NULL,textbook_version_id TEXT NOT NULL,unit_id TEXT NOT NULL,section_id TEXT,visited_at TEXT NOT NULL,source_sha256 TEXT NOT NULL,FOREIGN KEY(user_id,career_id) REFERENCES user_careers(user_id,career_id));
    CREATE TABLE IF NOT EXISTS user_notes(note_id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,career_id TEXT NOT NULL,textbook_version_id TEXT NOT NULL,unit_id TEXT NOT NULL,section_id TEXT,note_text TEXT NOT NULL,source_sha256 TEXT NOT NULL,created_at TEXT NOT NULL,updated_at TEXT NOT NULL,FOREIGN KEY(user_id,career_id) REFERENCES user_careers(user_id,career_id));`);
  // The original submissions table predates the versioned P01 boundary.  Keep
  // old rows and contracts readable while adding nullable columns for a safe
  // in-place migration of an existing local SQLite database.
  const submissionColumns = new Set(db.prepare('PRAGMA table_info(submissions)').all().map(row=>row.name));
  for (const [name,type] of [['previous_submission_id','TEXT'],['practice_id','TEXT'],['unit_id','TEXT'],['textbook_version','TEXT'],['source_sha','TEXT'],['artifact_version','TEXT'],['workflow_status','TEXT'],['record_types','TEXT'],['evidence_refs','TEXT'],['review_scope','TEXT']]) {
    if (!submissionColumns.has(name)) db.exec(`ALTER TABLE submissions ADD COLUMN ${name} ${type}`);
  }
  db.exec("CREATE UNIQUE INDEX IF NOT EXISTS submissions_version_identity ON submissions(user_id,practice_id,artifact_version) WHERE practice_id IS NOT NULL AND artifact_version IS NOT NULL");
  // Live databases may already have users.account_type. Add it when missing so
  // both the fresh 5-column schema and the extended schema accept the same INSERT.
  // Existing rows keep their data; the default fills the new column.
  const userColumns = new Set(db.prepare('PRAGMA table_info(users)').all().map(row=>row.name));
  if (!userColumns.has('account_type')) db.exec("ALTER TABLE users ADD COLUMN account_type TEXT NOT NULL DEFAULT 'member'");
  const workerId=randomUUID();
  const leaseMs=Math.max(1000,Number(options.leaseMs || process.env.ROLECRAFT_LEASE_MS || 15000));
  let closed=false, busy=false;
  const controllers=new Map(), authRate=new Map();
  const stmt=(sql,...args)=>db.prepare(sql);
  const one=(sql,...args)=>stmt(sql).get(...args);
  const all=(sql,...args)=>stmt(sql).all(...args);
  const run=(sql,...args)=>stmt(sql).run(...args);
  const submissionAllowedFields=['chapterId','moduleId','productTitle','productVersion','artifactUrl','runEvidence','actualResult',
    'previousSubmissionId','practiceId','unitId','textbookVersion','textbookVersionId','sourceSha','sourceSha256','artifactVersion','workflowStatus','recordTypes','evidenceRefs','reviewScope',
    // The course exchange uses snake_case in its YAML examples; accept those
    // aliases so the client can submit the same versioned record unchanged.
    'previous_submission_id','practice_id','unit_id','textbook_version','textbook_version_id','source_sha','source_sha256','artifact_version','workflow_status','record_types','evidence_refs','review_scope'];
  const submissionBoundaryFields=['previousSubmissionId','practiceId','unitId','textbookVersion','textbookVersionId','sourceSha','sourceSha256','artifactVersion','workflowStatus','recordTypes','evidenceRefs','reviewScope',
    'previous_submission_id','practice_id','unit_id','textbook_version','textbook_version_id','source_sha','source_sha256','artifact_version','workflow_status','record_types','evidence_refs','review_scope'];
  const seededCareer={careerId:'agent-developer',slug:'agent-developer',title:'Agent 开发者',summary:'从需求、检索到可靠交付的 Agent 工程学习空间',status:'published',contentVersion:'textbook-v13',indexVersion:'content-retrieval-0.13-v13',textbookId:'agent-engineering',textbookVersionId:'agent-engineering-v13',corpusHash:agentContentIndex.corpusHash,bookSha256:agentContentIndex.bookSha256,keywords:['agent','ai','智能体','大模型','模型','检索','工具','工作流'],semanticExamples:['设计和开发能使用工具完成任务的 Agent 应用','学习大模型、检索增强、工作流和智能体运行时工程','让模型根据新观察规划下一步并调用外部工具']};
  const verifiedContentIdentity={
    'textbook-v13':{corpusHash:agentContentIndex.corpusHash,bookSha256:agentContentIndex.bookSha256},
    'textbook-v12':{corpusHash:rollbackContentIndex.corpusHash,bookSha256:rollbackContentIndex.bookSha256},
  };
  run(`INSERT INTO careers(career_id,slug,title,summary,status,content_version,index_version,textbook_id,textbook_version_id,corpus_hash,book_sha256,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(career_id) DO UPDATE SET title=excluded.title,summary=excluded.summary,status=excluded.status,content_version=excluded.content_version,index_version=excluded.index_version,textbook_id=excluded.textbook_id,textbook_version_id=excluded.textbook_version_id,corpus_hash=excluded.corpus_hash,book_sha256=excluded.book_sha256,updated_at=excluded.updated_at`,seededCareer.careerId,seededCareer.slug,seededCareer.title,seededCareer.summary,seededCareer.status,seededCareer.contentVersion,seededCareer.indexVersion,seededCareer.textbookId,seededCareer.textbookVersionId,seededCareer.corpusHash,seededCareer.bookSha256,now(),now());
  const careerCatalog = new Map();
  let careerSemanticCache=null;
  const agentConfirmKeys=new Map();
  function registerCareer(meta, corpus=null) {
    const identity=verifiedContentIdentity[meta.contentVersion];
    if(corpus && corpus.corpusVersion!==meta.contentVersion) throw Error(`职业 ${meta.careerId} 的教材版本与导入元数据不一致`);
    // The seeded Agent career is tied to the bundled, verified corpus. An imported
    // career may use the same content version label while carrying its own corpus;
    // its own corpus hash is the identity and must not be compared with Agent's.
    if(!corpus && meta.careerId===seededCareer.careerId && identity && ((meta.corpusHash&&meta.corpusHash!==identity.corpusHash)||(meta.bookSha256&&meta.bookSha256!==identity.bookSha256))) throw Error(`职业 ${meta.careerId} 的教材 hash 与已验证版本不一致`);
    const duplicateSlug=one('SELECT career_id FROM careers WHERE slug=? AND career_id<>?',meta.slug||meta.careerId,meta.careerId);
    if(duplicateSlug) throw Error(`职业 slug 已被占用：${meta.slug||meta.careerId}`);
    const values=[meta.careerId,meta.slug||meta.careerId,meta.title,meta.summary||'',meta.status||'preparing',meta.contentVersion,meta.indexVersion||`content-retrieval-${meta.contentVersion}`,meta.textbookId||meta.careerId,meta.textbookVersionId||`${meta.careerId}-${meta.contentVersion}`,meta.corpusHash||corpus?.corpusHash||null,meta.bookSha256||null,now(),now()];
    run(`INSERT INTO careers(career_id,slug,title,summary,status,content_version,index_version,textbook_id,textbook_version_id,corpus_hash,book_sha256,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(career_id) DO UPDATE SET slug=excluded.slug,title=excluded.title,summary=excluded.summary,status=excluded.status,content_version=excluded.content_version,index_version=excluded.index_version,textbook_id=excluded.textbook_id,textbook_version_id=excluded.textbook_version_id,corpus_hash=excluded.corpus_hash,book_sha256=excluded.book_sha256,updated_at=excluded.updated_at`,...values);
    careerCatalog.set(meta.careerId,{...meta,corpus});
  }
  registerCareer(seededCareer);
  // Data-layer imports are read at startup. The client has no write path for this catalog.
  const importDir=options.careersDir || process.env.ROLECRAFT_CAREERS_DIR || path.join(serverDir,'careers');
  for(const imported of loadCareerImports(importDir)) registerCareer(imported,imported.corpus);
  const uiuxCareer=loadUiuxCareer(projectDir);
  registerCareer(uiuxCareer.meta, uiuxCareer.corpus);
  // Keep the earlier single-file metadata import compatible, but only allow the two
  // source-verified corpora exposed by retrieval/index.mjs.
  const importedCareerFile=options.careersFile || process.env.ROLECRAFT_CAREERS_FILE;
  if(importedCareerFile){
    let payload;try{payload=JSON.parse(readFileSync(importedCareerFile,'utf8'));}catch{throw Error('ROLECRAFT_CAREERS_FILE 无法读取或不是 JSON');}
    const items=Array.isArray(payload)?payload:payload?.careers;
    if(!Array.isArray(items)||items.length>500)throw Error('ROLECRAFT_CAREERS_FILE 必须是最多500项职业数组');
    for(const item of items){
      if(!item||typeof item!=='object'||!/^[a-z0-9][a-z0-9-]{1,127}$/.test(String(item.careerId||''))||!String(item.title||'').trim())throw Error('ROLECRAFT_CAREERS_FILE 含有无效职业记录');
      if(!verifiedContentIdentity[String(item.contentVersion||'')])throw Error('导入职业的 contentVersion 必须是已验证的 textbook-v13 或 textbook-v12');
      const identity=verifiedContentIdentity[String(item.contentVersion)];
      if((item.corpusHash&&String(item.corpusHash)!==identity.corpusHash)||(item.bookSha256&&String(item.bookSha256)!==identity.bookSha256))throw Error('导入职业的教材 hash 与已验证版本不一致');
      registerCareer({...item,careerId:String(item.careerId),slug:String(item.slug||item.careerId),title:String(item.title).trim().slice(0,200),summary:String(item.summary||'').trim().slice(0,2000),status:['preparing','published','retired'].includes(item.status)?item.status:'preparing',contentVersion:String(item.contentVersion),semanticExamples:Array.isArray(item.semanticExamples)?item.semanticExamples:[],keywords:Array.isArray(item.keywords)?item.keywords:[]});
    }
  }
  function tx(fn) { db.exec('BEGIN IMMEDIATE'); try { const v=fn(); db.exec('COMMIT'); return v; } catch(e) {db.exec('ROLLBACK');throw e;} }
  function event(jobId,type,data={}) {
    const seq=Number(one('SELECT COALESCE(MAX(sequence),0)+1 n FROM events WHERE job_id=?',jobId).n);
    run('INSERT INTO events(job_id,sequence,type,data,created_at) VALUES(?,?,?,?,?)',jobId,seq,type,JSON.stringify(data),now());
  }
  function curriculum() { return JSON.parse(readFileSync(path.join(projectDir,'team/generation-curriculum-v04.json'),'utf8')); }
  async function generator() { return import('./generation/index.mjs'); }
  async function readiness(config) {
    try { const g=await generator(); if (typeof g.getGenerationReadiness==='function') return g.getGenerationReadiness(config);
      return {configured:false,missing:['generation_readiness_interface']};
    } catch { return {configured:false,missing:['generation_service']}; }
  }
  function profile(uid) { const p=one('SELECT * FROM profiles WHERE user_id=?',uid); return p ? {...parse(p.data),version:p.version} : null; }
  function owned(table,id,uid) { const v=one(`SELECT * FROM ${table} WHERE id=? AND user_id=?`,id,uid); if (!v) reject(404,'not_found','记录不存在'); return v; }
  function versionedSubmissionInput(body,{previousId=null,forceVersioned=false}={}) {
    for (const key of Object.keys(body||{})) if (CLIENT_VERDICT_FIELDS.has(key)) reject(400,'client_verdict_forbidden','客户端不能写入专业或真人评审结论');
    const hasBoundary=forceVersioned||submissionBoundaryFields.some(key=>Object.hasOwn(body||{},key));
    if (!hasBoundary) return null;
    fields(body,submissionAllowedFields);
    const value=(camel,snake)=>body[camel]==null?body[snake]:body[camel];
    const suppliedParent=value('previousSubmissionId','previous_submission_id');
    if (previousId!=null && suppliedParent!=null && str(suppliedParent,'previousSubmissionId',128,true)!==previousId) reject(409,'revision_parent_mismatch','修订父提交与路径不一致');
    const parentId=previousId||((suppliedParent==null||suppliedParent==='')?null:str(suppliedParent,'previousSubmissionId',128,true));
    const practiceId=str(value('practiceId','practice_id'),'practiceId',160,true);
    const unitId=str(value('unitId','unit_id'),'unitId',256,true);
    const textbookVersionValue=value('textbookVersion','textbook_version')==null?value('textbookVersionId','textbook_version_id'):value('textbookVersion','textbook_version');
    const textbookVersion=str(textbookVersionValue,'textbookVersion',200,true);
    const textbookIdValue=value('textbookVersionId','textbook_version_id');
    if (value('textbookVersion','textbook_version')!=null&&textbookIdValue!=null&&str(textbookIdValue,'textbookVersionId',200,true)!==textbookVersion) reject(409,'content_version_mismatch','教材版本字段不一致');
    const sourceValue=value('sourceSha','source_sha')==null?value('sourceSha256','source_sha256'):value('sourceSha','source_sha');
    const sourceSha=str(sourceValue,'sourceSha',128,true);
    const sourceSha256Value=value('sourceSha256','source_sha256');
    if (value('sourceSha','source_sha')!=null&&sourceSha256Value!=null&&str(sourceSha256Value,'sourceSha256',128,true)!==sourceSha) reject(409,'content_version_mismatch','正文 hash 字段不一致');
    if (practiceId===P01_IDENTITY.practiceId && (unitId!==P01_IDENTITY.unitId||textbookVersion!==P01_IDENTITY.textbookVersion||sourceSha!==P01_IDENTITY.sourceSha)) reject(409,'practice_version_mismatch','P01-MVP 的练习、教材版本或正文 hash 不匹配');
    const artifactVersion=str(value('artifactVersion','artifact_version'),'artifactVersion',200,true);
    const status=workflowStatus(value('workflowStatus','workflow_status'));
    const types=recordTypes(value('recordTypes','record_types'));
    const evidenceRefs=refs(value('evidenceRefs','evidence_refs'),'evidenceRefs');
    const reviewScope=str(value('reviewScope','review_scope'),'reviewScope',300,true);
    const data={
      previousSubmissionId:parentId,practiceId,unitId,textbookVersion,textbookVersionId:textbookVersion,
      sourceSha,sourceSha256:sourceSha,artifactVersion,workflowStatus:status.value,workflowStatusCode:status.code,
      recordTypes:types,evidenceRefs,reviewScope,artifactVerification:'not_fetched_or_executed',
      professionalStatus:'unreviewed',humanStatus:'not_started',
      chapterId:body.chapterId==null?null:str(body.chapterId,'chapterId',128),
      moduleId:body.moduleId==null?unitId:str(body.moduleId,'moduleId',128),
      productTitle:body.productTitle==null?'':str(body.productTitle,'productTitle',300),
      productVersion:body.productVersion==null?'':str(body.productVersion,'productVersion',200),
      artifactUrl:artifactUrl(body.artifactUrl),
      runEvidence:refs(body.runEvidence,'runEvidence'),
      actualResult:body.actualResult==null?'':str(body.actualResult,'actualResult',8000),
    };
    data.evidenceStatus=(data.evidenceRefs.length||data.runEvidence.length||data.artifactUrl||data.actualResult)?'self_reported':'incomplete';
    return {data,parentId,practiceId,unitId,textbookVersion,sourceSha,artifactVersion,status,types,evidenceRefs,reviewScope};
  }
  function insertVersionedSubmission(uid,versioned,id,createdAt) {
    try {
      run('INSERT INTO submissions(id,user_id,chapter_id,module_id,data,created_at,previous_submission_id,practice_id,unit_id,textbook_version,source_sha,artifact_version,workflow_status,record_types,evidence_refs,review_scope) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',id,uid,versioned.data.chapterId,versioned.data.moduleId,JSON.stringify(versioned.data),createdAt,versioned.parentId,versioned.practiceId,versioned.unitId,versioned.textbookVersion,versioned.sourceSha,versioned.artifactVersion,versioned.status.value,JSON.stringify(versioned.types),JSON.stringify(versioned.evidenceRefs),versioned.reviewScope);
    } catch (error) {
      if (String(error?.message||'').includes('submissions.user_id') || String(error?.message||'').includes('submissions_version_identity')) reject(409,'artifact_version_conflict','该 artifactVersion 已存在；旧提交不会被覆盖');
      throw error;
    }
  }
  function jobView(j) { const input=parse(j.input); return {id:j.id,moduleId:input.moduleId,status:j.status,inputHash:j.input_hash,createdAt:j.created_at,updatedAt:j.updated_at,retryOfJobId:j.retry_of,chapterId:j.chapter_id,error:parse(j.error),profileSnapshot:input.profileSnapshot,versions:input.versions}; }
  function chapterView(c) { return {id:c.id,jobId:c.job_id,attemptId:c.attempt_id,version:c.version,moduleId:c.module_id,createdAt:c.created_at,outputHash:c.output_hash,result:parse(c.result),reviewStatus:{content:'unreviewed',professional:'unreviewed',examples:'not_run'}}; }
  function dataView(r) { return {id:r.id,...parse(r.data),createdAt:r.created_at}; }
  function submissionView(r) {
    const data=parse(r.data)||{};
    // Legacy rows retain their exact data shape. Versioned rows additionally
    // expose first-class columns so clients can bind and filter without
    // trusting mutable free-form JSON.
    if (r.practice_id!=null) {
      data.previousSubmissionId=r.previous_submission_id||null;
      data.previous_submission_id=data.previousSubmissionId;
      data.practiceId=r.practice_id;
      data.practice_id=r.practice_id;
      data.unitId=r.unit_id;
      data.unit_id=r.unit_id;
      data.textbookVersion=r.textbook_version;
      data.textbook_version=r.textbook_version;
      data.sourceSha=r.source_sha;
      data.sourceSha256=r.source_sha;
      data.source_sha=r.source_sha;
      data.source_sha256=r.source_sha;
      data.artifactVersion=r.artifact_version;
      data.artifact_version=r.artifact_version;
      data.workflowStatus=r.workflow_status;
      data.workflow_status=r.workflow_status;
      data.workflowStatusCode=SUBMISSION_WORKFLOW_STATUS.get(r.workflow_status)||data.workflowStatusCode||null;
      data.recordTypes=parse(r.record_types)||[];
      data.record_types=data.recordTypes;
      data.evidenceRefs=parse(r.evidence_refs)||[];
      data.evidence_refs=data.evidenceRefs;
      data.reviewScope=r.review_scope;
      data.review_scope=r.review_scope;
      // A client can submit record type labels, but never an independent
      // verdict. These read-only placeholders make that boundary explicit.
      data.professionalStatus='unreviewed';
      data.humanStatus='not_started';
    }
    return {id:r.id,submissionId:r.id,submission_id:r.id,...data,createdAt:r.created_at};
  }
  function careerView(c,match={}) { return {careerId:c.career_id,slug:c.slug,title:c.title,summary:c.summary,status:c.status,contentVersion:c.content_version,indexVersion:c.index_version,textbookId:c.textbook_id,textbookVersionId:c.textbook_version_id,corpusHash:c.corpus_hash,bookSha256:c.book_sha256,available:c.status==='published',...match}; }
  const AGENT_VERSION='agent-system-v0.12';
  const WORKBENCH_VERSION='local-workbench-0.11';
  const UUID_RE=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  function agentRequestId(value) { const id=str(value,'requestId',128,true); if(!UUID_RE.test(id)) reject(400,'input_invalid','requestId 必须是 UUID'); return id; }
  function agentVersionFields(input, allowed, { request=true }={}) {
    fields(input,allowed);
    if(request) agentRequestId(input.requestId);
    const workbench=str(input.workbenchVersion,'workbenchVersion',128,true); if(workbench!==WORKBENCH_VERSION) reject(400,'input_invalid','workbenchVersion 与当前工作台不匹配');
    const agent=str(input.agentVersion,'agentVersion',128,true); if(agent!==AGENT_VERSION) reject(400,'input_invalid','agentVersion 与当前 Agent 协议不匹配');
  }
  function contentSnapshot(c) { return { contentVersion:c.content_version??c.contentVersion,indexVersion:c.index_version??c.indexVersion,textbookVersionId:c.textbook_version_id??c.textbookVersionId,corpusHash:c.corpus_hash??c.corpusHash }; }
  function candidateView(c,match={}) {
    const careerId=c.career_id??c.careerId, meta=careerCatalog.get(careerId)||{};
    const snapshot=contentSnapshot(c);
    return { careerId,slug:c.slug,title:c.title,summary:c.summary,status:c.status,
      matchReason:match.matchReason||match.reason||'来自已发布职业目录的匹配结果。',matchedSignals:Array.isArray(match.matchedSignals)?match.matchedSignals:[],
      gaps:Array.isArray(meta.gaps)?meta.gaps:['服务未提供差距说明'],careerContent:{...snapshot,available:c.status==='published'},
      matchSource:match.matchSource||'catalog_keyword',actions:['confirm','compare','browse_content'],provenance:{matchSource:match.matchSource||'catalog_keyword',providerCalled:false} };
  }
  function inferSignals(query,c) {
    const meta=careerCatalog.get(c.career_id??c.careerId)||{}; const hay=[c.title,c.slug,c.summary,...(meta.keywords||[])].join(' ').toLowerCase();
    return String(query||'').split(/[^\p{L}\p{N}_-]+/u).filter(Boolean).filter(t=>t.length>1&&hay.includes(t.toLowerCase())).slice(0,8);
  }
  function learningResultView(result,c) {
    const snapshot=contentSnapshot(c); const matchingBasis={source_term:'source_term_recall',source_term_recall:'source_term_recall',task_intent:'task_intent',local_semantic_vectors:'local_semantic_vectors',local_semantic_topic:'local_semantic_topic'}[result.matchingBasis]||'rule_fallback';
    return {...result,unitId:String(result.unitId||''),sectionId:String(result.sectionId||''),unitTitle:String(result.unitTitle||''),sectionTitle:String(result.sectionTitle||result.title||''),reason:String(result.reason||''),evidenceExcerpt:String(result.evidenceExcerpt||''),sourcePath:String(result.sourcePath||''),sourceSha256:String(result.sourceSha256||''),version:result.version||snapshot.contentVersion,href:String(result.href||''),matchingBasis,contentVersion:snapshot.contentVersion,indexVersion:snapshot.indexVersion,textbookVersionId:snapshot.textbookVersionId,corpusHash:snapshot.corpusHash};
  }
  function learningResultType(query) {
    const q=String(query||''); if((/[，,；;]/.test(q)&&/(?:和|并|以及|同时|另外|还要|还想|然后)/.test(q))||/(?:并且|同时|以及|另外|还要|还想|然后).{1,80}(?:并且|同时|以及|另外|还要|还想|然后)/.test(q)) return 'multi_intent'; if(/比较|区别|怎么选|哪个更|对比|取舍/.test(q)) return 'compare'; if(/先学|从零|接下来|下一步|路线|规划|怎么开始/.test(q)) return 'plan'; if(/练习|实作|项目|动手/.test(q)) return 'practice_next'; if(/在哪|哪一节|定位|原文|出处/.test(q)) return 'locate'; return 'explain';
  }
  function switchCareer(uid,c) {
    const current=one('SELECT active_career_id FROM user_preferences WHERE user_id=?',uid)?.active_career_id||'';
    const idempotent=current===c.career_id;
    ensureUserCareer(uid,c.career_id);
    run('UPDATE user_careers SET selected_at=? WHERE user_id=? AND career_id=?',now(),uid,c.career_id);
    run('INSERT INTO user_preferences(user_id,active_career_id,updated_at) VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET active_career_id=excluded.active_career_id,updated_at=excluded.updated_at',uid,c.career_id,now());
    return {idempotent};
  }
  async function availableCareers(query='',options={}) {
    const rawQuery=String(query||''); if(rawQuery.length>1200) reject(400,'input_invalid','职业搜索内容不能超过1200字');
    const q=rawQuery.trim().toLowerCase();
    const terms=q.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
    const rows=all("SELECT * FROM careers WHERE status='published' ORDER BY title");
    let semanticAvailable=false;
    const semanticScores=new Map();
    if(q && rows.length){
      try{
        const extractor=await getExtractor();
        const descriptions=rows.map(c=>{const meta=careerCatalog.get(c.career_id)||{};return [c.title,c.summary,...(meta.keywords||[]),...(meta.semanticExamples||[])].filter(Boolean).join('；');});
        const cacheKey=rows.map((c,i)=>`${c.career_id}:${descriptions[i]}`).join('|');
        if(!careerSemanticCache||careerSemanticCache.key!==cacheKey){
          const candidateVectors=await extractor(descriptions);
          careerSemanticCache={key:cacheKey,vectors:candidateVectors};
        }
        const [queryVector]=await extractor([q]); const candidateVectors=careerSemanticCache.vectors;
        for(let i=0;i<candidateVectors.length;i++)semanticScores.set(rows[i].career_id,candidateVectors[i].reduce((sum,value,index)=>sum+value*queryVector[index],0));
        semanticAvailable=true;
      }catch{/* Missing/invalid local model is reported to the client; lexical fallback stays explicit. */}
    }
    const careers=rows.map(c=>{
      const meta=careerCatalog.get(c.career_id)||{};
      const hay=(c.title+' '+c.slug+' '+c.summary+' '+(meta.keywords||[]).join(' ')).toLowerCase();
      const lexical=terms.length?terms.reduce((n,t)=>n+(hay.includes(t)?1:0),0)/terms.length:0;
      const semantic=semanticScores.get(c.career_id)??0;
      const score=semanticAvailable?Math.max(semantic,lexical):lexical;
      const matched=!q || (semanticAvailable?score>=0.52:lexical>0);
      const reason=!q?'已导入职业，可直接选择':semanticAvailable&&semantic>=0.52?'你的描述与该职业的课程方向相近':lexical>0?'职业名称、关键词或简介与搜索词匹配':'当前职业库暂无直接匹配';
      return {...careerView(c,{score,matched,reason,matchSource:semanticAvailable&&semantic>=0.52?'local_bge':'catalog_keyword'})};
    }).filter(c=>c.matched).sort((a,b)=>b.score-a.score);
    return {careers,semanticAvailable,matchingMode:semanticAvailable?'local_bge+catalog_keyword':'catalog_keyword',autoSwitch:false,requestId:options.requestId||null,status:careers.length?'recommended':'no_match'};
  }
  function careerRow(careerId) { const c=one('SELECT * FROM careers WHERE career_id=?',careerId); if(!c) reject(404,'career_not_found','职业不存在或尚未导入'); if(c.status!=='published') reject(409,'career_unavailable','该职业内容尚未开放'); return c; }
  function ensureUserCareer(uid,careerId=seededCareer.careerId) { careerRow(careerId); run('INSERT OR IGNORE INTO user_careers(user_id,career_id,status,joined_at) VALUES(?,?,?,?)',uid,careerId,'active',now()); }
  function activeCareer(uid) {
    const p=one('SELECT p.active_career_id FROM user_preferences p WHERE p.user_id=?',uid);
    let chosen=p?.active_career_id;
    if(chosen&&!one("SELECT career_id FROM careers WHERE career_id=? AND status='published'",chosen)) chosen=null;
    if(!chosen) chosen=one("SELECT uc.career_id FROM user_careers uc JOIN careers c ON c.career_id=uc.career_id WHERE uc.user_id=? AND uc.status='active' AND c.status='published' ORDER BY uc.joined_at LIMIT 1",uid)?.career_id||seededCareer.careerId;
    ensureUserCareer(uid,chosen); return careerRow(chosen);
  }
  function careerCatalogFor(c) {
    const imported=careerCatalog.get(c.career_id);
    if(imported?.corpus) return imported.corpus;
    return c.career_id===seededCareer.careerId ? getContentCatalog(c.content_version) : null;
  }
  function careerChapterFor(c,unitId) {
    const imported=careerCatalog.get(c.career_id);
    if(imported?.corpus){const unit=imported.corpus.units.find(item=>item.unitId===unitId);return unit?{corpusVersion:imported.corpus.corpusVersion,corpusHash:imported.corpus.corpusHash,unit}:null;}
    return c.career_id===seededCareer.careerId ? getContentChapter(unitId,c.content_version) : null;
  }
  function validateContentTarget(careerId,textbookVersionId,unitId,sectionId='') {
    const c=careerRow(careerId); if(textbookVersionId && textbookVersionId!==c.textbook_version_id) reject(409,'content_version_mismatch','章节不属于当前职业版本');
    const chapter=careerChapterFor(c,unitId); if(!chapter) reject(404,'unit_not_found','章节不存在');
    const section=sectionId?chapter.unit.sections?.find(s=>s.sectionId===sectionId):null; if(sectionId&&!section) reject(404,'section_not_found','小节不存在');
    return {career:c,chapter:chapter.unit,section};
  }
  function credentials(body) {
    fields(body,['email','password']);
    const email=str(body.email,'email',254,true).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) reject(400,'input_invalid','请输入研发账户邮箱');
    if (typeof body.password!=='string'||body.password.length<12||body.password.length>128) reject(400,'input_invalid','密码须为12–128字符');
    return {email,password:body.password};
  }
  function session(req) {
    const cookie=req.headers.cookie||'';
    const token=cookie.split(';').map(x=>x.trim()).find(x=>x.startsWith('rolecraftSession='))?.split('=')[1];
    if (!token || !/^[a-f0-9]{64}$/.test(token)) reject(401,'unauthenticated','请先登录本地研发账户');
    const s=one('SELECT sessions.*,users.email FROM sessions JOIN users ON users.id=sessions.user_id WHERE token_hash=? AND expires_at>?',hash(token),Date.now());
    if (!s) reject(401,'unauthenticated','会话无效或过期'); return s;
  }
  function newSession(user,res) {
    ensureUserCareer(user.id);
    const token=randomBytes(32).toString('hex'), csrf=randomBytes(32).toString('hex');
    run('INSERT INTO sessions VALUES(?,?,?,?)',hash(token),user.id,csrf,Date.now()+86400000);
    res.setHeader('Set-Cookie',`rolecraftSession=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=86400`);
    return {user:{id:user.id,email:user.email},csrfToken:csrf,activeCareer:careerView(activeCareer(user.id))};
  }
  async function body(req) {
    if (!(req.headers['content-type']||'').toLowerCase().startsWith('application/json')) reject(415,'content_type','仅接受 application/json');
    let chunks=[],size=0; for await (const chunk of req) {size+=chunk.length;if(size>131072) reject(413,'body_too_large','请求超过128 KiB');chunks.push(chunk);}
    try { return JSON.parse(Buffer.concat(chunks).toString('utf8')||'{}'); } catch {reject(400,'input_invalid','JSON 格式无效');}
  }
  function safeError(e) {
    const codes=['config_missing','input_invalid','source_insufficient','budget_missing','budget_exceeded','provider_auth','provider_rate_limit','provider_unavailable','provider_refusal','provider_incomplete','provider_invalid_response','structure_invalid','source_reference_invalid','timeout','cancelled','network_error','interrupted'];
    const code=codes.includes(e?.code)?e.code:'generation_failed';
    const source=e?.evidence||{};
    const evidence={};
    for (const key of ['providerRequestId','providerResponseId','httpStatus','stage','elapsedMs','providerOutcomeUnknown','providerCallAttempted','usage']) {
      if (source[key]!=null) evidence[key]=source[key];
    }
    // Never persist arbitrary provider exception text, headers, credentials, or raw response.
    return {code,message:`生成未完成（${code}）；草稿未被保存为成功产物`,retryable:e?.retryable===true,evidence};
  }
  function recover() {
    tx(()=>{for(const j of all("SELECT * FROM jobs WHERE status='running' AND lease_until<?",Date.now())) {
      const error={code:'interrupted',message:'执行租约已失效；外部调用结果未知，请核对预算后显式重试',retryable:true,evidence:{providerOutcomeUnknown:true}};
      run("UPDATE jobs SET status='failed',error=?,updated_at=?,lease_token=lease_token+1,lease_until=NULL,worker_id=NULL WHERE id=?",JSON.stringify(error),now(),j.id);
      run("UPDATE attempts SET status='failed',ended_at=?,error=?,provider_unknown=1 WHERE job_id=? AND status='running'",now(),JSON.stringify(error),j.id);
      event(j.id,'interrupted',error);
    }});
  }
  async function tick() {
    if(closed||busy)return; busy=true;
    let heartbeat;
    try {
      recover();
      const claimed=tx(()=>{
        const j=one("SELECT * FROM jobs WHERE status='queued' ORDER BY created_at LIMIT 1");if(!j)return null;
        const token=Number(j.lease_token)+1, attemptId=randomUUID();
        const number=Number(one('SELECT COUNT(*) n FROM attempts WHERE job_id=?',j.id).n)+1;
        run("UPDATE jobs SET status='running',lease_token=?,lease_until=?,worker_id=?,updated_at=? WHERE id=? AND status='queued'",token,Date.now()+leaseMs,workerId,now(),j.id);
        run('INSERT INTO attempts(id,job_id,number,status,lease_token,started_at) VALUES(?,?,?,?,?,?)',attemptId,j.id,number,'running',token,now());
        event(j.id,'running',{attemptId,number});return {...j,lease_token:token,attemptId};
      });
      if(!claimed)return;
      const ctrl=new AbortController();controllers.set(claimed.id,ctrl);
      const active=()=>!!one("SELECT id FROM jobs WHERE id=? AND status='running' AND lease_token=? AND worker_id=? AND lease_until>=?",claimed.id,claimed.lease_token,workerId,Date.now());
      heartbeat=setInterval(()=>{if(closed)return;const v=run("UPDATE jobs SET lease_until=? WHERE id=? AND status='running' AND lease_token=? AND worker_id=? AND lease_until>=?",Date.now()+leaseMs,claimed.id,claimed.lease_token,workerId,Date.now());if(!v.changes)ctrl.abort();},Math.max(250,Math.floor(leaseMs/3)));
      try {
        const g=await generator(); const snap=parse(claimed.input);
        const result=await g.generateChapter({...snap,jobId:claimed.id,attemptId:claimed.attemptId,leaseToken:claimed.lease_token,inputHash:claimed.input_hash},{signal:ctrl.signal,onEvent:(stage,details={})=>{if(!active())throw Object.assign(Error('cancelled'),{code:'cancelled'});tx(()=>event(claimed.id,stage,{...details,attemptId:claimed.attemptId}));}});
        if(!result?.chapterDraft || typeof result.chapterDraft!=='object' || !Array.isArray(result.claims) || !Array.isArray(result.examples) || !result.provenance) throw Object.assign(Error(),{code:'structure_invalid'});
        const serialized=JSON.stringify(result);if(Buffer.byteLength(serialized)>1048576)throw Object.assign(Error(),{code:'structure_invalid'});
        tx(()=>{
          if(!active())return;
          const chapterId=randomUUID(), version=Number(one('SELECT COALESCE(MAX(version),0)+1 n FROM chapters WHERE user_id=? AND module_id=?',claimed.user_id,snap.moduleId).n);
          const outputHash=hash(result.chapterDraft);
          run('INSERT INTO chapters VALUES(?,?,?,?,?,?,?,?,?)',chapterId,claimed.user_id,claimed.id,claimed.attemptId,version,snap.moduleId,serialized,outputHash,now());
          run("UPDATE jobs SET status='succeeded',chapter_id=?,updated_at=?,lease_until=NULL,worker_id=NULL WHERE id=?",chapterId,now(),claimed.id);
          run("UPDATE attempts SET status='succeeded',ended_at=? WHERE id=?",now(),claimed.attemptId);
          event(claimed.id,'succeeded',{chapterId,version,outputHash});
        });
      } catch(e) {
        const error=safeError(e);
        tx(()=>{if(!active())return;
          run("UPDATE jobs SET status='failed',error=?,updated_at=?,lease_until=NULL,worker_id=NULL WHERE id=?",JSON.stringify(error),now(),claimed.id);
          run("UPDATE attempts SET status='failed',ended_at=?,error=?,provider_unknown=? WHERE id=?",now(),JSON.stringify(error),error.evidence.providerOutcomeUnknown?1:0,claimed.attemptId);
          event(claimed.id,'failed',error);
        });
      } finally {clearInterval(heartbeat);controllers.delete(claimed.id);}
    } catch { /* Infrastructure failures keep persisted lease for explicit interruption recovery. */ }
    finally {clearInterval(heartbeat);busy=false;}
  }
  async function enqueue(uid,request,retryOf=null) {
    const idem=str(request.idempotencyKey,'idempotencyKey',128,true);
    if(!/^[a-zA-Z0-9_-]{8,128}$/.test(idem))reject(400,'input_invalid','幂等键须为8–128字母数字、下划线或短横线');
    let snapshot;
    if(retryOf) {
      const old=owned('jobs',retryOf,uid);if(!['failed','cancelled'].includes(old.status))reject(409,'invalid_state','仅失败或取消任务可重试');snapshot=parse(old.input);
    } else {
      const c=curriculum(),p=profile(uid);if(!p)reject(409,'profile_required','请先保存学习档案');
      if(request.moduleId!==c.moduleId)reject(400,'module_not_allowed','本轮只允许受控 e03 章节');
      if(request.profileVersion!=null&&request.profileVersion!==p.version)reject(409,'version_conflict','学习档案版本已变化');
      snapshot={moduleId:c.moduleId,profileSnapshot:p,competencyVersion:c.curriculumVersion,templateVersion:c.chapterTemplate.id,rubricVersion:c.curriculumVersion,sourceBundle:{version:c.version,sources:c.allowedSources,claims:c.supportedClaims,policy:c.sourcePolicy},chapterSchema:c.chapterSchema||null,chapterSpecification:c,promptVersion:'controlled-e03-v04',generationConfig:{version:'server-environment-v04',model:process.env.OPENAI_MODEL||process.env.GENERATE_MODEL||null,maxOutputTokens:Number(process.env.OPENAI_MAX_OUTPUT_TOKENS)||null,budgetUsd:Number(process.env.ROLECRAFT_GENERATION_BUDGET_USD)||null,estimatedMaxCostUsd:Number(process.env.ROLECRAFT_ESTIMATED_MAX_COST_USD)||null,timeoutMs:Number(process.env.OPENAI_TIMEOUT_MS||60000)},versions:{product:PRODUCT_VERSION,curriculum:c.curriculumVersion,template:c.chapterTemplate.id,rubric:c.curriculumVersion,sourceBundle:c.version}};
    }
    const inputHash=hash(snapshot);
    const existing=one('SELECT * FROM jobs WHERE user_id=? AND idem=?',uid,idem);
    if(existing) {if(existing.input_hash!==inputHash || existing.retry_of!==retryOf)reject(409,'idempotency_conflict','幂等键已用于不同输入');return jobView(existing);}
    const ready=await readiness(snapshot.generationConfig); if(!ready.configured)reject(409,ready.missing?.includes('estimated_cost_exceeds_budget')?'budget_exceeded':ready.missing?.every(x=>/budget|cost/i.test(x))?'budget_missing':'config_missing',`真实生成已阻止；缺少 ${ready.missing?.join('、')||'供应商配置'}。不会使用模拟教材冒充成功`);
    return tx(()=>{
      const duplicate=one('SELECT * FROM jobs WHERE user_id=? AND idem=?',uid,idem);
      if(duplicate) {if(duplicate.input_hash!==inputHash||duplicate.retry_of!==retryOf)reject(409,'idempotency_conflict','幂等键已用于不同输入');return jobView(duplicate);}
      const id=randomUUID(),time=now();run('INSERT INTO jobs(id,user_id,idem,input_hash,input,status,retry_of,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)',id,uid,idem,inputHash,JSON.stringify(snapshot),'queued',retryOf,time,time);event(id,'queued',{inputHash,retryOfJobId:retryOf});return jobView(one('SELECT * FROM jobs WHERE id=?',id));
    });
  }
  const server=http.createServer(async(req,res)=>{
    const send=(status,payload)=>{const body=payload&&typeof payload==='object'&&!Buffer.isBuffer(payload)&&!Array.isArray(payload)?{...payload,releaseVersion:RELEASE_VERSION}:payload;res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Rolecraft-Release-Version':RELEASE_VERSION});res.end(JSON.stringify(body));};
    let requestIdForError='';
    try {
      const host=req.headers.host || '';
      // Mode follows PUBLIC_DEPLOYMENT, the same switch that accepts a
      // non-loopback Host. deploy/ecosystem.config.cjs sets it true for the
      // public Lighthouse process. scripts/start-local.mjs does not, so a
      // local run stays local-development. generation.configured is unchanged
      // and still comes only from readiness(); this label does not select
      // CloudBase versus the local SQLite file.
      const publicDeployment=process.env.PUBLIC_DEPLOYMENT==='true';
      const deploymentMode=publicDeployment?'public-deployment':'local-development';
      if(!publicDeployment && !/^127\.0\.0\.1:\d+$/.test(host)) reject(400,'host_invalid','仅接受127.0.0.1本地地址');
      const forwardedProto=String(req.headers['x-forwarded-proto']||'http').split(',')[0].trim();
      const origin=`${forwardedProto==='https'?'https':'http'}://${host}`;
      if(req.headers.origin && req.headers.origin!==origin)reject(403,'origin_rejected','拒绝跨来源请求');
      if(req.headers['sec-fetch-site']==='cross-site')reject(403,'origin_rejected','拒绝跨站请求');
      const u=new URL(req.url,origin), pathname=u.pathname, method=req.method;
      if(pathname.startsWith('/api/')) {
        if(method==='GET' && pathname==='/api/health')return send(200,{productVersion:PRODUCT_VERSION,mode:deploymentMode,generation:await readiness(),contentRetrieval:getContentReadiness()});
        // Thin read for mid-session textbook identity. Does not change the pinned corpus.
        if(method==='GET' && pathname==='/api/content/identity'){
          const readiness=getContentReadiness();
          return send(200,{contentVersion:readiness.contentVersion||null,corpusVersion:readiness.corpusVersion||readiness.contentVersion||null,textbookVersionId:readiness.textbookVersionId||null,corpusHash:readiness.corpusHash||null,indexVersion:readiness.indexVersion||null,retrievalVersion:readiness.retrievalVersion||null,available:readiness.available===true,units:Number.isInteger(readiness.units)?readiness.units:null});
        }
        if(method==='GET' && pathname==='/api/voice/readiness')return send(200,{voice:probeLocalAsr(),limitations:['仅本机配置的 whisper.cpp 与模型可用；不会自动下载模型或调用外部服务。']});
        if(method==='POST' && pathname==='/api/voice/transcribe'){
          const b=await body(req);
          if(!b || typeof b!=='object') reject(400,'input_invalid','需要 JSON 对象');
          return send(200,analyzeVoiceRequest(b));
        }
        if(method==='GET' && pathname==='/api/curriculum')return send(200,curriculum());
        // Public read-only Agent content. textbook-v13 is current; textbook-v12 stays available for rollback.
        // UI/UX figures use the same asset route with their published content version.
        const contentVersion=u.searchParams.get('version')||'textbook-v13';
        const contentAsset=pathname.match(/^\/api\/content\/assets\/([A-Za-z0-9][A-Za-z0-9_-]*\.(?:png|svg|dot))$/);
        const uiuxPublicAsset=method==='GET' && contentAsset && contentVersion===UIUX_CONTENT_VERSION;
        if(pathname.startsWith('/api/content/')&&!verifiedContentIdentity[contentVersion]&&!uiuxPublicAsset)reject(400,'content_version_invalid','请使用 textbook-v13（当前 Agent 教材）或 textbook-v12（回滚）。其他版本未接入。');
        if(method==='GET' && pathname==='/api/content/catalog')return send(200,getContentCatalog(contentVersion));
        const contentChapter=pathname.match(/^\/api\/content\/chapter\/([-a-z0-9]+)$/);
        if(method==='GET' && contentChapter){const found=getContentChapter(contentChapter[1],contentVersion);if(!found)reject(404,'not_found','所选教材没有这个章节');return send(200,found);}
        if(method==='GET' && contentAsset){const found=uiuxPublicAsset?getUiuxAsset(projectDir,contentAsset[1]):getContentAsset(contentAsset[1],contentVersion);if(!found)reject(404,'not_found','所选教材没有这个公开图');const headers={'Content-Type':found.mime,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Rolecraft-Release-Version':RELEASE_VERSION};if(uiuxPublicAsset&&found.mime==='image/svg+xml')headers['Content-Security-Policy']="default-src 'none'; style-src 'unsafe-inline'; sandbox";res.writeHead(200,headers);return res.end(found.buffer);}
        const contentReference=pathname.match(/^\/api\/content\/reference\/([-a-zA-Z0-9_]+\.(?:md|json|py))$/);
        if(method==='GET' && contentReference){const found=getContentReference(contentReference[1],contentVersion);if(!found)reject(404,'not_found','所选教材没有这个公开引用');res.writeHead(200,{'Content-Type':found.mime,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Rolecraft-Release-Version':RELEASE_VERSION});return res.end(found.buffer);}
        const careerContent=pathname.match(/^\/api\/careers\/([-a-z0-9]+)\/content(?:\/(catalog|chapter\/([-a-z0-9]+)))?$/);
        if(method==='GET' && careerContent){
          const career=careerRow(careerContent[1]);
          const catalog=careerCatalogFor(career);
          if(!catalog) reject(409,'career_content_unavailable','该职业尚未配置独立教材内容');
          if(!careerContent[2]||careerContent[2]==='catalog') {
            const publicCatalog=career.career_id===UIUX_CAREER_ID ? presentUiuxCatalog(projectDir) : catalog;
            return send(200,{career:careerView({...career,corpus_hash:publicCatalog.corpusHash||career.corpus_hash,content_version:publicCatalog.corpusVersion||career.content_version,textbook_version_id:publicCatalog.textbookVersionId||career.textbook_version_id,index_version:publicCatalog.indexVersion||career.index_version}),catalog:publicCatalog});
          }
          if(career.career_id===UIUX_CAREER_ID) {
            const fresh=uiuxChapter(projectDir,careerContent[3]);
            if(!fresh) reject(404,'not_found','所选职业教材没有这个章节');
            if(fresh.stale) reject(409,'content_stale','该章节来源与清单不一致，已停止作为当前发布正文提供');
            return send(200,{career:careerView(career),chapter:fresh});
          }
          const found=careerChapterFor(career,careerContent[3]); if(!found)reject(404,'not_found','所选职业教材没有这个章节');
          return send(200,{career:careerView(career),chapter:found});
        }
        if(method==='POST' && pathname==='/api/content/recommend')return send(200,await recommendContent(await body(req)));
        if(method==='POST' && pathname==='/api/content/dialog')return send(200,await dialogContent(await body(req)));
        // v0.12 Agent career discovery is read-only until the explicit confirm route below.
        if(method==='POST' && pathname==='/api/agent/career/recommend') {
          const b=await body(req); if(typeof b?.requestId==='string'&&UUID_RE.test(b.requestId)) requestIdForError=b.requestId; agentVersionFields(b,['requestId','query','activeCareerId','locale','workbenchVersion','agentVersion','sessionId']);
          const requestId=agentRequestId(b.requestId), query=str(b.query,'query',1200,true);
          if(b.activeCareerId!=null && b.activeCareerId!=='') str(b.activeCareerId,'activeCareerId',128,true);
          const result=await availableCareers(query,{requestId});
          const normalized=query.normalize('NFKC').trim();
          if(/^react$/i.test(normalized)) return send(200,{requestId,status:'needs_clarification',agentVersion:AGENT_VERSION,engineMode:result.semanticAvailable?'local_semantic_retrieval':'catalog_keyword',providerCalled:false,matchingMode:result.matchingMode,candidates:[],clarification:{question:'你说的 React 是 Agent 的 ReAct 方法，还是前端 React 框架？',options:[{id:'agent-react',label:'Agent 的 ReAct 方法',query:'我想学习 Agent ReAct 方法'},{id:'frontend-react',label:'前端 React 框架',query:'我想学习前端 React 框架'}]},snapshot:null,corpus:null,index:null,limitations:['当前职业目录不能仅凭“React”确定方向；请先选择技术语义。'],writePolicy:'confirm_required'});
          const candidates=result.careers.slice(0,3).map(c=>candidateView(c,{matchReason:c.reason,matchedSignals:inferSignals(query,c),matchSource:c.matchSource}));
          const snapshots=candidates.map(c=>({careerId:c.careerId,...c.careerContent}));
          const snapshot=snapshots.length===1?snapshots[0]:null;
          const status=candidates.length?'recommended':'no_match';
          return send(200,{requestId,status,agentVersion:AGENT_VERSION,engineMode:result.semanticAvailable?'local_semantic_retrieval':'catalog_keyword',providerCalled:false,matchingMode:result.matchingMode,candidates,clarification:null,snapshot,corpus:snapshot?{contentVersion:snapshot.contentVersion,textbookVersionId:snapshot.textbookVersionId,corpusHash:snapshot.corpusHash}:null,index:snapshot?{indexVersion:snapshot.indexVersion}:null,limitations:[candidates.length?'候选来自当前已发布职业目录，不是职业测评或就业承诺。':'当前职业目录没有足够匹配；可以浏览目录或改写目标。'],writePolicy:'confirm_required'});
        }
        // v0.12 learning Agent adapts the existing extractive dialog service. It is
        // deliberately public/read-only and never writes account or learning state.
        if(method==='POST' && pathname==='/api/agent/learning/query') {
          const b=await body(req); if(typeof b?.requestId==='string'&&UUID_RE.test(b.requestId)) requestIdForError=b.requestId; agentVersionFields(b,['requestId','query','careerId','contentVersion','textbookVersionId','currentUnitId','currentSectionId','useCurrentContext','intentHint','locale','workbenchVersion','agentVersion','sessionId']);
          const requestId=agentRequestId(b.requestId), query=str(b.query,'query',1200,true);
          const careerId=b.careerId==null||b.careerId===''?seededCareer.careerId:str(b.careerId,'careerId',128,true);
          const career=careerRow(careerId), snapshot=contentSnapshot(career);
          if(b.contentVersion!=null && str(b.contentVersion,'contentVersion',128,true)!==snapshot.contentVersion) reject(409,'content_version_mismatch','学习内容版本已变化，请刷新职业教材后重试');
          if(b.textbookVersionId!=null && str(b.textbookVersionId,'textbookVersionId',200,true)!==snapshot.textbookVersionId) reject(409,'content_version_mismatch','学习教材版本已变化，请刷新职业教材后重试');
          const useCurrentContext=b.useCurrentContext===true;
          if(b.useCurrentContext!=null && typeof b.useCurrentContext!=='boolean') reject(400,'input_invalid','useCurrentContext 必须为布尔值');
          const currentUnitId=b.currentUnitId==null?'':str(b.currentUnitId,'currentUnitId',256);
          const currentSectionId=b.currentSectionId==null?'':str(b.currentSectionId,'currentSectionId',256);
          if(useCurrentContext && !currentUnitId) reject(400,'input_invalid','开启当前章节上下文时必须提供 currentUnitId');
          if(!useCurrentContext && (currentUnitId||currentSectionId)) reject(400,'input_invalid','只有用户开启当前章节上下文时才可发送章节位置');
          let context={};
          if(useCurrentContext){
            const target=validateContentTarget(career.career_id,snapshot.textbookVersionId,currentUnitId,currentSectionId);
            context={currentUnitId:target.chapter.unitId,currentSectionId:currentSectionId||null};
          }
          if(career.career_id===UIUX_CAREER_ID) {
            const retrieval=queryUiuxLearning(projectDir,query);
            const results=(retrieval.results||[]).slice(0,3).map(r=>learningResultView(r,career));
            return send(200,{requestId,status:retrieval.status,agentVersion:AGENT_VERSION,engineMode:'local_lexical_retrieval',providerCalled:false,resultType:learningResultType(query),...snapshot,corpusVersion:snapshot.contentVersion,corpusHash:snapshot.corpusHash,results,dialog:null,clarification:null,limitations:retrieval.limitations||[]});
          }
          if(career.career_id!==seededCareer.careerId) return send(200,{requestId,status:'unavailable',agentVersion:AGENT_VERSION,engineMode:'local_semantic_retrieval',providerCalled:false,resultType:learningResultType(query),...snapshot,corpusVersion:snapshot.contentVersion,results:[],dialog:null,clarification:null,limitations:['当前职业的教材已发布，但 v0.12 本地检索适配器尚未为该职业准备独立索引；可以打开课程目录。']});
          const retrieval=await dialogContent({query,corpusVersion:snapshot.contentVersion,...context});
          const mappedStatus=retrieval.status==='recommended'||retrieval.status==='answered'?'recommended':retrieval.status==='needs_clarification'?'needs_clarification':retrieval.status==='unavailable'?'unavailable':retrieval.status==='invalid_input'?'invalid_input':'no_match';
          const retrievalResultType=retrieval.resultType||retrieval.dialog?.resultType||mappedStatus;
          const results=(retrieval.results||[]).slice(0,6).map(r=>learningResultView(r,career));
          const limitations=[...(Array.isArray(retrieval.limitations)?retrieval.limitations:[]),'结果来自当前已核验教材原文；本版本未调用外部模型，不自动写入学习记录。'];
          return send(200,{requestId,status:mappedStatus,agentVersion:AGENT_VERSION,intent:retrieval.intent||learningResultType(query),retrievalResultType,uncertainty:retrieval.uncertainty||retrieval.dialog?.uncertainty||null,engineMode:retrieval.engineMode||retrieval.dialog?.engineMode||'local_semantic_retrieval',providerCalled:retrieval.providerCalled===true,resultType:learningResultType(query),...snapshot,corpusVersion:retrieval.corpusVersion||snapshot.contentVersion,corpusHash:retrieval.corpusHash||snapshot.corpusHash,results,dialog:retrieval.dialog||null,clarification:retrieval.clarification||null,limitations});
        }
        if(method==='GET' && pathname==='/api/careers') {
          const query=u.searchParams.get('q')||'';
          const result=await availableCareers(query);
          return send(200,{query,...result,importedCareerCount:Math.max(0,careerCatalog.size-1)});
        }
        if(method==='POST' && ['/api/auth/register','/api/auth/login'].includes(pathname)) {
          const key=req.socket.remoteAddress;const current=authRate.get(key)||{count:0,reset:Date.now()+60000};
          if(Date.now()>current.reset){current.count=0;current.reset=Date.now()+60000;}if(++current.count>30)reject(429,'rate_limited','研发认证请求过多，请稍后再试');authRate.set(key,current);
          const c=credentials(await body(req));
          if(pathname.endsWith('/register')) {
            const salt=randomBytes(16).toString('hex'), passwordHash=scryptSync(c.password,salt,64).toString('hex');
            if(one('SELECT id FROM users WHERE email=?',c.email))reject(409,'account_exists','该研发账户已存在');
            const user={id:randomUUID(),email:c.email};
            run('INSERT INTO users(id,email,password_hash,salt,created_at,account_type) VALUES(?,?,?,?,?,?)',user.id,user.email,passwordHash,salt,now(),'member');
            return send(201,newSession(user,res));
          }
          const user=one('SELECT * FROM users WHERE email=?',c.email);
          const candidate=scryptSync(c.password,user?.salt||'invalid-login-placeholder',64);
          if(!user || !timingSafeEqual(candidate,Buffer.from(user.password_hash,'hex')))reject(401,'login_invalid','邮箱或密码不正确');
          return send(200,newSession(user,res));
        }
        const s=session(req),uid=s.user_id;
        if(['POST','PUT','PATCH','DELETE'].includes(method) && req.headers['x-csrf-token']!==s.csrf)reject(403,'csrf_rejected','请求缺少有效会话 CSRF token');
        if(method==='GET'&&pathname==='/api/auth/me') { const c=activeCareer(uid); return send(200,{user:{id:uid,email:s.email},csrfToken:s.csrf,activeCareer:careerView(c)}); }
        if(method==='GET'&&pathname==='/api/profile/career') { const c=activeCareer(uid); return send(200,{career:careerView(c)}); }
        if(method==='POST'&&pathname==='/api/agent/career/confirm') {
          const b=await body(req); if(typeof b?.requestId==='string'&&UUID_RE.test(b.requestId)) requestIdForError=b.requestId; agentVersionFields(b,['requestId','recommendationRequestId','careerId','expected','confirmation','idempotencyKey','workbenchVersion','agentVersion']);
          const requestId=agentRequestId(b.requestId), recommendationRequestId=agentRequestId(b.recommendationRequestId), careerId=str(b.careerId,'careerId',128,true);
          const confirmation=str(b.confirmation,'confirmation',64,true); if(confirmation!=='user_explicit') reject(400,'confirmation_required','职业确认必须来自用户明确操作');
          const idempotencyKey=str(b.idempotencyKey,'idempotencyKey',128,true); if(!/^[a-zA-Z0-9_-]{8,128}$/.test(idempotencyKey)) reject(400,'input_invalid','幂等键须为8–128字母数字、下划线或短横线');
          if(!b.expected||typeof b.expected!=='object'||Array.isArray(b.expected)) reject(400,'input_invalid','expected 必须是职业版本快照');
          fields(b.expected,['careerId','status','contentVersion','indexVersion','textbookVersionId','corpusHash']);
          const expected={careerId:b.expected.careerId==null?'':str(b.expected.careerId,'expected.careerId',128),status:str(b.expected.status,'expected.status',32,true),contentVersion:str(b.expected.contentVersion,'expected.contentVersion',128,true),indexVersion:b.expected.indexVersion==null?'':str(b.expected.indexVersion,'expected.indexVersion',200),textbookVersionId:str(b.expected.textbookVersionId,'expected.textbookVersionId',200,true),corpusHash:str(b.expected.corpusHash,'expected.corpusHash',128,true)};
          if(expected.careerId && expected.careerId!==careerId) reject(409,'career_version_mismatch','确认职业与推荐快照不一致，请重新推荐');
          const confirmKey=`${uid}:${idempotencyKey}`,fingerprint=hash([recommendationRequestId,careerId,expected.status,expected.contentVersion,expected.indexVersion,expected.textbookVersionId,expected.corpusHash,confirmation].join('|')),previous=agentConfirmKeys.get(confirmKey);
          if(previous){
            if(previous.fingerprint!==fingerprint) reject(409,'idempotency_conflict','幂等键已用于不同职业确认');
            return send(200,{...previous.response,requestId,recommendationRequestId,write:{...previous.response.write,idempotent:true}});
          }
          const current=one('SELECT * FROM careers WHERE career_id=?',careerId); if(!current) reject(404,'career_not_found','职业不存在或尚未导入');
          const actual=contentSnapshot(current);
          if(current.status!=='published'||expected.status!=='published'||expected.contentVersion!==actual.contentVersion||expected.textbookVersionId!==actual.textbookVersionId||expected.corpusHash!==actual.corpusHash||(expected.indexVersion&&expected.indexVersion!==actual.indexVersion)) reject(409,'career_version_mismatch','职业目录或教材版本已变化，请重新推荐');
          const c=careerRow(careerId),write=switchCareer(uid,c);
          const response={requestId,recommendationRequestId,status:'confirmed',agentVersion:AGENT_VERSION,career:{careerId:c.career_id,title:c.title,status:c.status,...actual},write:{target:'active_career',source:'agent_confirmed',idempotent:write.idempotent,idempotencyKey},next:{open:'learning_home'}};
          agentConfirmKeys.set(confirmKey,{fingerprint,response}); if(agentConfirmKeys.size>10000) agentConfirmKeys.delete(agentConfirmKeys.keys().next().value);
          return send(200,response);
        }
        if(method==='PUT'&&pathname==='/api/profile/career') {
          const b=await body(req);fields(b,['careerId']);const c=careerRow(str(b.careerId,'careerId',128,true));
          switchCareer(uid,c);
          return send(200,{career:careerView(c)});
        }
        if(method==='GET'&&pathname==='/api/me/favorites') {
          const careerId=u.searchParams.get('careerId')||activeCareer(uid).career_id;
          careerRow(careerId);
          return send(200,{careerId,favorites:all("SELECT favorite_id AS favoriteId,career_id AS careerId,textbook_version_id AS textbookVersionId,unit_id AS unitId,section_id AS sectionId,source_sha256 AS sourceSha256,created_at AS createdAt FROM user_favorites WHERE user_id=? AND career_id=? AND removed_at IS NULL ORDER BY created_at DESC",uid,careerId)});
        }
        if(method==='POST'&&pathname==='/api/me/favorites') {
          const b=await body(req);fields(b,['careerId','textbookVersionId','unitId','sectionId']);
          const target=validateContentTarget(str(b.careerId||activeCareer(uid).career_id,'careerId',128,true),str(b.textbookVersionId,'textbookVersionId',128),str(b.unitId,'unitId',256,true),b.sectionId?str(b.sectionId,'sectionId',256):'');
          ensureUserCareer(uid,target.career.career_id); const existing=one("SELECT * FROM user_favorites WHERE user_id=? AND career_id=? AND textbook_version_id=? AND unit_id=? AND COALESCE(section_id,'')=COALESCE(?, '') AND removed_at IS NULL",uid,target.career.career_id,target.career.textbook_version_id,target.chapter.unitId,b.sectionId||null);
          if(existing)return send(200,{favorite:{favoriteId:existing.favorite_id,careerId:existing.career_id,textbookVersionId:existing.textbook_version_id,unitId:existing.unit_id,sectionId:existing.section_id,sourceSha256:existing.source_sha256,createdAt:existing.created_at},idempotent:true});
          const id=randomUUID(),created=now();run('INSERT INTO user_favorites(favorite_id,user_id,career_id,textbook_version_id,unit_id,section_id,source_sha256,created_at) VALUES(?,?,?,?,?,?,?,?)',id,uid,target.career.career_id,target.career.textbook_version_id,target.chapter.unitId,b.sectionId||null,target.section?.sourceSha256||target.chapter.sourceSha256,created);
          return send(201,{favorite:{favoriteId:id,careerId:target.career.career_id,textbookVersionId:target.career.textbook_version_id,unitId:target.chapter.unitId,sectionId:b.sectionId||null,sourceSha256:target.section?.sourceSha256||target.chapter.sourceSha256,createdAt:created}});
        }
        const favoriteMatch=pathname.match(/^\/api\/me\/favorites\/([^/]+)$/);
        if(favoriteMatch&&method==='DELETE') { const fav=one('SELECT * FROM user_favorites WHERE favorite_id=? AND user_id=? AND removed_at IS NULL',favoriteMatch[1],uid);if(!fav)reject(404,'favorite_not_found','收藏不存在');run('UPDATE user_favorites SET removed_at=? WHERE favorite_id=? AND user_id=?',now(),favoriteMatch[1],uid);return send(200,{ok:true,favoriteId:favoriteMatch[1]}); }
        if(method==='POST'&&pathname==='/api/me/progress') {
          const b=await body(req);fields(b,['careerId','textbookVersionId','unitId','sectionId','state']);const target=validateContentTarget(str(b.careerId||activeCareer(uid).career_id,'careerId',128,true),str(b.textbookVersionId,'textbookVersionId',128),str(b.unitId,'unitId',256,true),b.sectionId?str(b.sectionId,'sectionId',256):'');const state=str(b.state,'state',32,true);if(!['opened','in_progress','reviewed'].includes(state))reject(400,'input_invalid','进度状态无效');ensureUserCareer(uid,target.career.career_id);run('INSERT INTO user_progress(user_id,career_id,textbook_version_id,unit_id,state,last_section_id,source_sha256,updated_at) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(user_id,career_id,textbook_version_id,unit_id) DO UPDATE SET state=excluded.state,last_section_id=excluded.last_section_id,source_sha256=excluded.source_sha256,updated_at=excluded.updated_at',uid,target.career.career_id,target.career.textbook_version_id,target.chapter.unitId,state,b.sectionId||null,target.chapter.sourceSha256,now());return send(200,{ok:true,careerId:target.career.career_id,textbookVersionId:target.career.textbook_version_id,unitId:target.chapter.unitId,sectionId:b.sectionId||null,state});
        }
        if(method==='POST'&&pathname==='/api/me/recent') {
          const b=await body(req);fields(b,['careerId','textbookVersionId','unitId','sectionId']);const target=validateContentTarget(str(b.careerId||activeCareer(uid).career_id,'careerId',128,true),str(b.textbookVersionId,'textbookVersionId',128),str(b.unitId,'unitId',256,true),b.sectionId?str(b.sectionId,'sectionId',256):'');ensureUserCareer(uid,target.career.career_id);
          const sectionId=b.sectionId||null, visitedAt=now(), sourceSha256=target.section?.sourceSha256||target.chapter.sourceSha256;
          const existing=one('SELECT * FROM user_recent WHERE user_id=? AND career_id=? AND textbook_version_id=? AND unit_id=? AND COALESCE(section_id,\'\')=COALESCE(?,\'\')',uid,target.career.career_id,target.career.textbook_version_id,target.chapter.unitId,sectionId);
          if(existing){run('UPDATE user_recent SET visited_at=?,source_sha256=? WHERE recent_id=? AND user_id=?',visitedAt,sourceSha256,existing.recent_id,uid);return send(200,{recentId:existing.recent_id,idempotent:true});}
          const id=randomUUID();run('INSERT INTO user_recent(recent_id,user_id,career_id,textbook_version_id,unit_id,section_id,visited_at,source_sha256) VALUES(?,?,?,?,?,?,?,?)',id,uid,target.career.career_id,target.career.textbook_version_id,target.chapter.unitId,sectionId,visitedAt,sourceSha256);return send(201,{recentId:id,idempotent:false});
        }
        if(method==='GET'&&pathname==='/api/me/progress') {
          const careerId=u.searchParams.get('careerId')||activeCareer(uid).career_id; careerRow(careerId);
          return send(200,{careerId,progress:all('SELECT career_id AS careerId,textbook_version_id AS textbookVersionId,unit_id AS unitId,state,last_section_id AS lastSectionId,source_sha256 AS sourceSha256,updated_at AS updatedAt FROM user_progress WHERE user_id=? AND career_id=? ORDER BY updated_at DESC',uid,careerId)});
        }
        if(method==='GET'&&pathname==='/api/me/recent') {
          const careerId=u.searchParams.get('careerId')||activeCareer(uid).career_id; careerRow(careerId);
          return send(200,{careerId,recent:all('SELECT recent_id AS recentId,career_id AS careerId,textbook_version_id AS textbookVersionId,unit_id AS unitId,section_id AS sectionId,visited_at AS visitedAt,source_sha256 AS sourceSha256 FROM user_recent WHERE user_id=? AND career_id=? ORDER BY visited_at DESC LIMIT 50',uid,careerId)});
        }
        if(method==='GET'&&pathname==='/api/me/notes') {
          const careerId=u.searchParams.get('careerId')||activeCareer(uid).career_id; careerRow(careerId);
          return send(200,{careerId,notes:all('SELECT note_id AS noteId,career_id AS careerId,textbook_version_id AS textbookVersionId,unit_id AS unitId,section_id AS sectionId,note_text AS noteText,source_sha256 AS sourceSha256,created_at AS createdAt,updated_at AS updatedAt FROM user_notes WHERE user_id=? AND career_id=? ORDER BY updated_at DESC',uid,careerId)});
        }
        if(method==='PUT'&&pathname==='/api/me/notes') {
          const b=await body(req);fields(b,['noteId','careerId','textbookVersionId','unitId','sectionId','noteText']);
          const target=validateContentTarget(str(b.careerId||activeCareer(uid).career_id,'careerId',128,true),str(b.textbookVersionId,'textbookVersionId',128),str(b.unitId,'unitId',256,true),b.sectionId?str(b.sectionId,'sectionId',256):'');
          const noteText=str(b.noteText,'noteText',12000,true); ensureUserCareer(uid,target.career.career_id); const noteId=str(b.noteId||randomUUID(),'noteId',128,true); const created=now();
          const existing=one('SELECT * FROM user_notes WHERE note_id=? AND user_id=?',noteId,uid);
          const owner=one('SELECT user_id FROM user_notes WHERE note_id=?',noteId);
          if(owner && owner.user_id!==uid) reject(409,'note_not_owned','不能修改其他账户的笔记');
          if(existing && (existing.career_id!==target.career.career_id || existing.textbook_version_id!==target.career.textbook_version_id || existing.unit_id!==target.chapter.unitId || (existing.section_id||'')!==(b.sectionId||''))) reject(409,'note_target_mismatch','笔记目标不一致');
          run('INSERT INTO user_notes(note_id,user_id,career_id,textbook_version_id,unit_id,section_id,note_text,source_sha256,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?) ON CONFLICT(note_id) DO UPDATE SET note_text=excluded.note_text,section_id=excluded.section_id,source_sha256=excluded.source_sha256,updated_at=excluded.updated_at',noteId,uid,target.career.career_id,target.career.textbook_version_id,target.chapter.unitId,b.sectionId||null,noteText,target.section?.sourceSha256||target.chapter.sourceSha256,existing?.created_at||created,created);
          return send(200,{note:{noteId,careerId:target.career.career_id,textbookVersionId:target.career.textbook_version_id,unitId:target.chapter.unitId,sectionId:b.sectionId||null,noteText,sourceSha256:target.section?.sourceSha256||target.chapter.sourceSha256,createdAt:existing?.created_at||created,updatedAt:created}});
        }
        const noteMatch=pathname.match(/^\/api\/me\/notes\/([^/]+)$/);
        if(noteMatch&&method==='DELETE') { const note=one('SELECT note_id FROM user_notes WHERE note_id=? AND user_id=?',noteMatch[1],uid); if(!note)reject(404,'note_not_found','笔记不存在'); run('DELETE FROM user_notes WHERE note_id=? AND user_id=?',noteMatch[1],uid); return send(200,{ok:true,noteId:noteMatch[1]}); }
        if(method==='POST'&&pathname==='/api/auth/logout'){fields(await body(req),[]);run('DELETE FROM sessions WHERE token_hash=?',s.token_hash);res.setHeader('Set-Cookie','rolecraftSession=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');return send(200,{ok:true});}
        if(method==='GET'&&pathname==='/api/profile')return send(200,{profile:profile(uid)});
        if(method==='PUT'&&pathname==='/api/profile') {
          const b=await body(req);fields(b,['startingPoint','goal']);const c=curriculum();if(!c.profileLevels.includes(b.startingPoint))reject(400,'input_invalid','学习起点不在课程允许列表');
          const p={startingPoint:b.startingPoint,goal:str(b.goal,'goal',2000),updatedAt:now()};
          const v=tx(()=>{const previous=profile(uid),version=(previous?.version||0)+1;run('INSERT INTO profiles VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET version=excluded.version,data=excluded.data',uid,version,JSON.stringify(p));return {...p,version};});return send(200,{profile:v});
        }
        if(pathname==='/api/generation-jobs'&&method==='POST'){const b=await body(req);fields(b,['moduleId','idempotencyKey','profileVersion']);return send(202,{job:await enqueue(uid,b)});}
        if(pathname==='/api/generation-jobs'&&method==='GET')return send(200,{jobs:all('SELECT * FROM jobs WHERE user_id=? ORDER BY created_at DESC',uid).map(jobView)});
        const match=pathname.match(/^\/api\/generation-jobs\/([^/]+)(?:\/(cancel|retry))?$/);
        if(match){const j=owned('jobs',match[1],uid);
          if(method==='GET'&&!match[2])return send(200,{job:jobView(j),attempts:all('SELECT * FROM attempts WHERE job_id=? ORDER BY number',j.id).map(a=>({id:a.id,number:a.number,status:a.status,leaseToken:a.lease_token,startedAt:a.started_at,endedAt:a.ended_at,error:parse(a.error),providerOutcomeUnknown:!!a.provider_unknown})),events:all('SELECT * FROM events WHERE job_id=? ORDER BY sequence',j.id).map(e=>({sequence:e.sequence,type:e.type,data:parse(e.data),createdAt:e.created_at}))});
          if(method==='POST'&&match[2]==='retry'){const b=await body(req);fields(b,['idempotencyKey']);return send(202,{job:await enqueue(uid,b,j.id)});}
          if(method==='POST'&&match[2]==='cancel'){
            fields(await body(req),[]);
            tx(()=>{const current=owned('jobs',j.id,uid);if(!['queued','running'].includes(current.status))return;
              const unknown=current.status==='running';const error={code:'cancelled',message:'本地任务已取消；不能据此确认供应商撤销费用',retryable:true,evidence:{providerOutcomeUnknown:unknown}};
              run("UPDATE jobs SET status='cancelled',error=?,updated_at=?,lease_token=lease_token+1,lease_until=NULL,worker_id=NULL WHERE id=?",JSON.stringify(error),now(),j.id);
              run("UPDATE attempts SET status='cancelled',ended_at=?,error=?,provider_unknown=? WHERE job_id=? AND status='running'",now(),JSON.stringify(error),unknown?1:0,j.id);event(j.id,'cancelled',error);
            });controllers.get(j.id)?.abort();return send(200,{job:jobView(owned('jobs',j.id,uid))});
          }
        }
        if(method==='GET'&&pathname==='/api/chapters')return send(200,{chapters:all('SELECT * FROM chapters WHERE user_id=? ORDER BY created_at DESC',uid).map(chapterView)});
        const chapterMatch=pathname.match(/^\/api\/chapters\/([^/]+)$/);if(method==='GET'&&chapterMatch)return send(200,{chapter:chapterView(owned('chapters',chapterMatch[1],uid))});
        if(method==='POST'&&pathname==='/api/submissions'){
          const b=await body(req);const versioned=versionedSubmissionInput(b);
          if(versioned){
            const parent=versioned.parentId?owned('submissions',versioned.parentId,uid):null;
            if(parent){
              if(!parent.practice_id) reject(409,'revision_requires_versioned_submission','旧版提交不能直接作为1.0修订父项');
              if(parent.practice_id!==versioned.practiceId||parent.unit_id!==versioned.unitId||parent.textbook_version!==versioned.textbookVersion||parent.source_sha!==versioned.sourceSha) reject(409,'revision_target_mismatch','修订必须绑定同一练习和正文版本');
              if(parent.artifact_version===versioned.artifactVersion) reject(409,'artifact_version_conflict','修订必须使用新的 artifactVersion');
            }
            if(one('SELECT id FROM submissions WHERE user_id=? AND practice_id=? AND artifact_version=?',uid,versioned.practiceId,versioned.artifactVersion)) reject(409,'artifact_version_conflict','该 artifactVersion 已存在；旧提交不会被覆盖');
            const id=randomUUID(),createdAt=now();
            insertVersionedSubmission(uid,versioned,id,createdAt);
            return send(201,{submission:submissionView(one('SELECT * FROM submissions WHERE id=?',id))});
          }
          // Preserve the pre-1.0 submission contract for existing clients.
          fields(b,['chapterId','moduleId','productTitle','productVersion','artifactUrl','runEvidence','actualResult']);
          const c=curriculum();if(b.moduleId!==c.moduleId)reject(400,'module_not_allowed','当前作品只关联受控e03模块');
          if(b.chapterId!=null){str(b.chapterId,'chapterId',128,true);const chapter=owned('chapters',b.chapterId,uid);if(chapter.module_id!==b.moduleId)reject(400,'chapter_mismatch','章节与模块不符');}
          const data={chapterId:b.chapterId||null,moduleId:b.moduleId,productTitle:str(b.productTitle,'productTitle',300,true),productVersion:str(b.productVersion,'productVersion',200,true),artifactUrl:artifactUrl(b.artifactUrl),runEvidence:refs(b.runEvidence,'runEvidence'),actualResult:str(b.actualResult,'actualResult',8000),artifactVerification:'not_fetched_or_executed'};
          data.evidenceStatus=data.artifactUrl&&data.runEvidence.length&&data.actualResult?'self_reported':'incomplete';
          const id=randomUUID(),createdAt=now();run('INSERT INTO submissions(id,user_id,chapter_id,module_id,data,created_at) VALUES(?,?,?,?,?,?)',id,uid,data.chapterId,data.moduleId,JSON.stringify(data),createdAt);return send(201,{submission:{id,...data,createdAt}});
        }
        const submissionRevision=pathname.match(/^\/api\/submissions\/([^/]+)$/);
        if(submissionRevision&&['PUT','PATCH'].includes(method)){
          const previous=owned('submissions',submissionRevision[1],uid);const b=await body(req);
          const versioned=versionedSubmissionInput(b,{previousId:previous.id,forceVersioned:true});
          if(!versioned) reject(400,'input_invalid','修订必须提供版本化提交字段');
          if(!previous.practice_id) reject(409,'revision_requires_versioned_submission','旧版提交不能直接作为1.0修订父项');
          if(previous.practice_id!==versioned.practiceId||previous.unit_id!==versioned.unitId||previous.textbook_version!==versioned.textbookVersion||previous.source_sha!==versioned.sourceSha) reject(409,'revision_target_mismatch','修订必须绑定同一练习和正文版本');
          if(previous.artifact_version===versioned.artifactVersion) reject(409,'artifact_version_conflict','修订必须使用新的 artifactVersion');
          if(one('SELECT id FROM submissions WHERE user_id=? AND practice_id=? AND artifact_version=?',uid,versioned.practiceId,versioned.artifactVersion)) reject(409,'artifact_version_conflict','该 artifactVersion 已存在；旧提交不会被覆盖');
          const id=randomUUID(),createdAt=now();
          insertVersionedSubmission(uid,versioned,id,createdAt);
          return send(201,{submission:submissionView(one('SELECT * FROM submissions WHERE id=?',id)),previousSubmissionId:previous.id});
        }
        if(method==='POST'&&pathname==='/api/reviews'){
          const b=await body(req);fields(b,['submissionId','goal','evidence','result','gap','cause','owner','nextAction','retestMethod','retestResult']);
          const submission=owned('submissions',str(b.submissionId,'submissionId',128,true),uid);const d=parse(submission.data);
          const data={submissionId:submission.id,productVersion:d.productVersion,type:'self_assessment',independentStatus:'unreviewed',professionalStatus:'unreviewed',evidence:refs(b.evidence,'evidence')};
          for(const field of ['goal','result','gap','cause','owner','nextAction','retestMethod','retestResult'])data[field]=str(b[field],field,8000);
          data.evidenceStatus=data.evidence.length&&data.result?'self_reported':'incomplete';
          const id=randomUUID(),createdAt=now();run('INSERT INTO reviews VALUES(?,?,?,?,?)',id,uid,submission.id,JSON.stringify(data),createdAt);return send(201,{review:{id,...data,createdAt}});
        }
        for(const table of ['submissions','reviews']) {
          if(method==='GET'&&pathname===`/api/${table}`)return send(200,{[table]:all(`SELECT * FROM ${table} WHERE user_id=? ORDER BY created_at DESC`,uid).map(table==='submissions'?submissionView:dataView)});
          const m=pathname.match(new RegExp(`^/api/${table}/([^/]+)$`));if(method==='GET'&&m)return send(200,{[table==='reviews'?'review':'submission']:(table==='submissions'?submissionView:dataView)(owned(table,m[1],uid))});
        }
        if(method==='GET'&&pathname==='/api/export')return send(200,{productVersion:PRODUCT_VERSION,exportedAt:now(),profile:profile(uid),jobs:all('SELECT * FROM jobs WHERE user_id=? ORDER BY created_at',uid).map(jobView),chapters:all('SELECT * FROM chapters WHERE user_id=? ORDER BY created_at',uid).map(chapterView),submissions:all('SELECT * FROM submissions WHERE user_id=? ORDER BY created_at',uid).map(submissionView),reviews:all('SELECT * FROM reviews WHERE user_id=? ORDER BY created_at',uid).map(dataView)});
        reject(404,'not_found','API不存在');
      }
      if(!['GET','HEAD'].includes(method))reject(405,'method_not_allowed','静态资源仅支持读取');
      let relative;try{relative=decodeURIComponent(pathname);}catch{reject(400,'path_invalid','路径编码不合法');}
      if(relative==='/' )relative='/index.html';
      const root=realpathSync(path.join(projectDir,'dist'));
      const filename=path.resolve(root,'.'+relative);
      if(!filename.startsWith(root+path.sep))reject(403,'path_rejected','拒绝非法静态路径');
      let real;try{real=realpathSync(filename);}catch{reject(404,'not_found','页面不存在');}
      if(!real.startsWith(root+path.sep)||!statSync(real).isFile())reject(403,'path_rejected','拒绝非法静态路径');
      const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.txt':'text/plain; charset=utf-8','.md':'text/plain; charset=utf-8','.dot':'text/plain; charset=utf-8'}[path.extname(real)];
      if(!mime)reject(403,'path_rejected','资源类型不允许');
      res.writeHead(200,{'Content-Type':mime,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin','X-Rolecraft-Release-Version':RELEASE_VERSION});res.end(method==='HEAD'?undefined:readFileSync(real));
    } catch(e) {if(!res.headersSent){const error={code:e.code||'server_error',message:e instanceof ApiError?e.message:'本地服务未能完成请求；请检查服务端运行状态'};if(requestIdForError)error.requestId=requestIdForError;send(e.status||500,{error});}else res.end();}
  });
  const timer=setInterval(tick,500);timer.unref();
  async function close() {
    closed=true;clearInterval(timer);for(const ctrl of controllers.values())ctrl.abort();
    await new Promise(resolve=>server.close(resolve));
    // Give cancelled generation callbacks time to finish; persist unknown interruption, never success.
    tx(()=>{for(const j of all("SELECT * FROM jobs WHERE status='running' AND worker_id=?",workerId)){
      const error={code:'interrupted',message:'本地服务停止；外部调用结果未知',retryable:true,evidence:{providerOutcomeUnknown:true}};
      run("UPDATE jobs SET status='failed',error=?,updated_at=?,lease_token=lease_token+1,lease_until=NULL,worker_id=NULL WHERE id=?",JSON.stringify(error),now(),j.id);
      run("UPDATE attempts SET status='failed',ended_at=?,error=?,provider_unknown=1 WHERE job_id=? AND status='running'",now(),JSON.stringify(error),j.id);event(j.id,'interrupted',error);
    }});
    while(busy)await new Promise(r=>setTimeout(r,10));db.close();await closeContentRetrieval();
  }
  return {server,close,dataDir};
}

if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const port=Number(process.env.PORT || process.env.ROLECRAFT_PORT || 4318);
  if(!Number.isInteger(port)||port<1024||port>65535)throw Error('ROLECRAFT_PORT must be 1024–65535');
  const host=process.env.HOST || '127.0.0.1';
  const app=createRolecraftServer();
  app.server.listen(port,host,()=>process.stdout.write(`Rolecraft ${PRODUCT_VERSION}: http://${host}:${port}\nPersistent SQLite in ${app.dataDir}\n`));
  let stopping=false;for(const signal of ['SIGINT','SIGTERM'])process.on(signal,async()=>{if(stopping)return;stopping=true;await app.close();process.exitCode=0;});
}
