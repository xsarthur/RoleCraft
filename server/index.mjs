import http from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { randomBytes, randomUUID, scryptSync, timingSafeEqual, createHash } from 'node:crypto';
import { readFileSync, mkdirSync, statSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getContentReadiness, getContentCatalog, getContentChapter, getContentAsset, getContentReference, recommendContent, dialogContent, closeContentRetrieval } from './retrieval/index.mjs';

export const PRODUCT_VERSION = 'local-mvp-0.4';
const serverDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.dirname(serverDir);
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
    CREATE TABLE IF NOT EXISTS submissions(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),chapter_id TEXT,module_id TEXT NOT NULL,data TEXT NOT NULL,created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS reviews(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),submission_id TEXT NOT NULL REFERENCES submissions(id),data TEXT NOT NULL,created_at TEXT NOT NULL);`);
  const workerId=randomUUID();
  const leaseMs=Math.max(1000,Number(options.leaseMs || process.env.ROLECRAFT_LEASE_MS || 15000));
  let closed=false, busy=false;
  const controllers=new Map(), authRate=new Map();
  const stmt=(sql,...args)=>db.prepare(sql);
  const one=(sql,...args)=>stmt(sql).get(...args);
  const all=(sql,...args)=>stmt(sql).all(...args);
  const run=(sql,...args)=>stmt(sql).run(...args);
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
  function jobView(j) { const input=parse(j.input); return {id:j.id,moduleId:input.moduleId,status:j.status,inputHash:j.input_hash,createdAt:j.created_at,updatedAt:j.updated_at,retryOfJobId:j.retry_of,chapterId:j.chapter_id,error:parse(j.error),profileSnapshot:input.profileSnapshot,versions:input.versions}; }
  function chapterView(c) { return {id:c.id,jobId:c.job_id,attemptId:c.attempt_id,version:c.version,moduleId:c.module_id,createdAt:c.created_at,outputHash:c.output_hash,result:parse(c.result),reviewStatus:{content:'unreviewed',professional:'unreviewed',examples:'not_run'}}; }
  function dataView(r) { return {id:r.id,...parse(r.data),createdAt:r.created_at}; }
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
    const token=randomBytes(32).toString('hex'), csrf=randomBytes(32).toString('hex');
    run('INSERT INTO sessions VALUES(?,?,?,?)',hash(token),user.id,csrf,Date.now()+86400000);
    res.setHeader('Set-Cookie',`rolecraftSession=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=86400`);
    return {user:{id:user.id,email:user.email},csrfToken:csrf};
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
      snapshot={moduleId:c.moduleId,profileSnapshot:p,competencyVersion:c.curriculumVersion,templateVersion:c.chapterTemplate.id,rubricVersion:c.curriculumVersion,sourceBundle:{version:c.version,sources:c.allowedSources,claims:c.supportedClaims,policy:c.sourcePolicy},chapterSchema:c.chapterSchema||null,chapterSpecification:c,promptVersion:'controlled-e03-v04',generationConfig:{version:'server-environment-v04',model:process.env.OPENAI_MODEL||null,maxOutputTokens:Number(process.env.OPENAI_MAX_OUTPUT_TOKENS)||null,budgetUsd:Number(process.env.ROLECRAFT_GENERATION_BUDGET_USD)||null,estimatedMaxCostUsd:Number(process.env.ROLECRAFT_ESTIMATED_MAX_COST_USD)||null,timeoutMs:Number(process.env.OPENAI_TIMEOUT_MS||60000)},versions:{product:PRODUCT_VERSION,curriculum:c.curriculumVersion,template:c.chapterTemplate.id,rubric:c.curriculumVersion,sourceBundle:c.version}};
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
    const send=(status,payload)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(payload));};
    try {
      const host=req.headers.host || '';
      if(!/^127\.0\.0\.1:\d+$/.test(host)) reject(400,'host_invalid','仅接受127.0.0.1本地地址');
      const origin=`http://${host}`;
      if(req.headers.origin && req.headers.origin!==origin)reject(403,'origin_rejected','拒绝跨来源请求');
      if(req.headers['sec-fetch-site']==='cross-site')reject(403,'origin_rejected','拒绝跨站请求');
      const u=new URL(req.url,origin), pathname=u.pathname, method=req.method;
      if(pathname.startsWith('/api/')) {
        if(method==='GET' && pathname==='/api/health')return send(200,{productVersion:PRODUCT_VERSION,mode:'local-development',generation:await readiness(),contentRetrieval:getContentReadiness()});
        if(method==='GET' && pathname==='/api/curriculum')return send(200,curriculum());
        // Public read-only current v12 and explicitly selected historical v10 content.
        const contentVersion=u.searchParams.get('version')||'textbook-v12';
        if(pathname.startsWith('/api/content/')&&!['textbook-v12','textbook-v10'].includes(contentVersion))reject(400,'content_version_invalid','请选择当前v12或明确历史v10教材');
        if(method==='GET' && pathname==='/api/content/catalog')return send(200,getContentCatalog(contentVersion));
        const contentChapter=pathname.match(/^\/api\/content\/chapter\/([-a-z0-9]+)$/);
        if(method==='GET' && contentChapter){const found=getContentChapter(contentChapter[1],contentVersion);if(!found)reject(404,'not_found','所选教材没有这个章节');return send(200,found);}
        const contentAsset=pathname.match(/^\/api\/content\/assets\/([-a-z0-9]+\.(?:png|svg|dot))$/);
        if(method==='GET' && contentAsset){const found=getContentAsset(contentAsset[1],contentVersion);if(!found)reject(404,'not_found','所选教材没有这个公开图');res.writeHead(200,{'Content-Type':found.mime,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});return res.end(found.buffer);}
        const contentReference=pathname.match(/^\/api\/content\/reference\/([-a-zA-Z0-9_]+\.(?:md|json|py))$/);
        if(method==='GET' && contentReference){const found=getContentReference(contentReference[1],contentVersion);if(!found)reject(404,'not_found','所选教材没有这个公开引用');res.writeHead(200,{'Content-Type':found.mime,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});return res.end(found.buffer);}
        if(method==='POST' && pathname==='/api/content/recommend')return send(200,await recommendContent(await body(req)));
        if(method==='POST' && pathname==='/api/content/dialog')return send(200,await dialogContent(await body(req)));
        if(method==='POST' && ['/api/auth/register','/api/auth/login'].includes(pathname)) {
          const key=req.socket.remoteAddress;const current=authRate.get(key)||{count:0,reset:Date.now()+60000};
          if(Date.now()>current.reset){current.count=0;current.reset=Date.now()+60000;}if(++current.count>30)reject(429,'rate_limited','研发认证请求过多，请稍后再试');authRate.set(key,current);
          const c=credentials(await body(req));
          if(pathname.endsWith('/register')) {
            const salt=randomBytes(16).toString('hex'), passwordHash=scryptSync(c.password,salt,64).toString('hex');
            if(one('SELECT id FROM users WHERE email=?',c.email))reject(409,'account_exists','该研发账户已存在');
            const user={id:randomUUID(),email:c.email};run('INSERT INTO users VALUES(?,?,?,?,?)',user.id,user.email,passwordHash,salt,now());return send(201,newSession(user,res));
          }
          const user=one('SELECT * FROM users WHERE email=?',c.email);
          const candidate=scryptSync(c.password,user?.salt||'invalid-login-placeholder',64);
          if(!user || !timingSafeEqual(candidate,Buffer.from(user.password_hash,'hex')))reject(401,'login_invalid','邮箱或密码不正确');
          return send(200,newSession(user,res));
        }
        const s=session(req),uid=s.user_id;
        if(['POST','PUT','PATCH','DELETE'].includes(method) && req.headers['x-csrf-token']!==s.csrf)reject(403,'csrf_rejected','请求缺少有效会话 CSRF token');
        if(method==='GET'&&pathname==='/api/auth/me')return send(200,{user:{id:uid,email:s.email},csrfToken:s.csrf});
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
          const b=await body(req);fields(b,['chapterId','moduleId','productTitle','productVersion','artifactUrl','runEvidence','actualResult']);
          const c=curriculum();if(b.moduleId!==c.moduleId)reject(400,'module_not_allowed','当前作品只关联受控e03模块');
          if(b.chapterId!=null){str(b.chapterId,'chapterId',128,true);const chapter=owned('chapters',b.chapterId,uid);if(chapter.module_id!==b.moduleId)reject(400,'chapter_mismatch','章节与模块不符');}
          const data={chapterId:b.chapterId||null,moduleId:b.moduleId,productTitle:str(b.productTitle,'productTitle',300,true),productVersion:str(b.productVersion,'productVersion',200,true),artifactUrl:artifactUrl(b.artifactUrl),runEvidence:refs(b.runEvidence,'runEvidence'),actualResult:str(b.actualResult,'actualResult',8000),artifactVerification:'not_fetched_or_executed'};
          data.evidenceStatus=data.artifactUrl&&data.runEvidence.length&&data.actualResult?'self_reported':'incomplete';
          const id=randomUUID(),createdAt=now();run('INSERT INTO submissions VALUES(?,?,?,?,?,?)',id,uid,data.chapterId,data.moduleId,JSON.stringify(data),createdAt);return send(201,{submission:{id,...data,createdAt}});
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
          if(method==='GET'&&pathname===`/api/${table}`)return send(200,{[table]:all(`SELECT * FROM ${table} WHERE user_id=? ORDER BY created_at DESC`,uid).map(dataView)});
          const m=pathname.match(new RegExp(`^/api/${table}/([^/]+)$`));if(method==='GET'&&m)return send(200,{[table==='reviews'?'review':'submission']:dataView(owned(table,m[1],uid))});
        }
        if(method==='GET'&&pathname==='/api/export')return send(200,{productVersion:PRODUCT_VERSION,exportedAt:now(),profile:profile(uid),jobs:all('SELECT * FROM jobs WHERE user_id=? ORDER BY created_at',uid).map(jobView),chapters:all('SELECT * FROM chapters WHERE user_id=? ORDER BY created_at',uid).map(chapterView),submissions:all('SELECT * FROM submissions WHERE user_id=? ORDER BY created_at',uid).map(dataView),reviews:all('SELECT * FROM reviews WHERE user_id=? ORDER BY created_at',uid).map(dataView)});
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
      res.writeHead(200,{'Content-Type':mime,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin'});res.end(method==='HEAD'?undefined:readFileSync(real));
    } catch(e) {if(!res.headersSent)send(e.status||500,{error:{code:e.code||'server_error',message:e instanceof ApiError?e.message:'本地服务未能完成请求；请检查服务端运行状态'}});else res.end();}
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
