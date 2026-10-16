import { readFileSync, existsSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import '../../dist/content-retrieval-core.js';
const here=path.dirname(fileURLToPath(import.meta.url)),project=path.resolve(here,'../..');
const sha=s=>createHash('sha256').update(s).digest('hex');
const core=globalThis.RolecraftContentRetrieval;
const CURRENT_VERSION='textbook-v12',versions={'textbook-v10':{folder:'v10',units:20},'textbook-v12':{folder:'v12',units:30}};
const cachedCorpora=new Map();let active=0;
function loadCorpus(version=CURRENT_VERSION){
 const definition=versions[version];if(!definition)throw Error('Content version unsupported');
 if(!cachedCorpora.has(version))cachedCorpora.set(version,JSON.parse(readFileSync(path.join(here,'content-'+definition.folder+'-index.json'),'utf8')));
 const corpus=cachedCorpora.get(version);
 if(corpus.corpusVersion!==version||corpus.units?.length!==definition.units)throw Error('Content corpus invalid');
 const textbookRoot=realpathSync(path.join(project,'textbooks',definition.folder));
 for(const u of corpus.units){
  if(!/^[-a-z0-9]+$/.test(u.unitId)||u.sourcePath!==`textbooks/${definition.folder}/${u.unitId}.md`)throw Error('Unapproved public source');
  const filename=realpathSync(path.join(project,u.sourcePath));if(!filename.startsWith(textbookRoot+path.sep))throw Error('Source escaped public corpus');
  const raw=readFileSync(filename,'utf8');if(sha(raw)!==u.sourceSha256||u.bodyMarkdown!==raw)throw Error('Current source differs; rebuild content');
 }
 if(sha(JSON.stringify(corpus.units.map(u=>[u.unitId,u.sourceSha256])))!==corpus.corpusHash)throw Error('Corpus version differs');
 if(sha(readFileSync(path.join(textbookRoot,'agent-engineering-textbook.md')))!==corpus.bookSha256)throw Error('Book source differs');
 if(version===CURRENT_VERSION&&(sha(readFileSync(path.join(textbookRoot,'assembly-manifest.json')))!==corpus.sourceBinding.assemblyManifestSha256||sha(readFileSync(path.join(project,'team/textbook-v12-curriculum.json')))!==corpus.sourceBinding.curriculumSha256))throw Error('Curriculum source binding differs');
 return corpus;
}
export function getContentReadiness(version=CURRENT_VERSION){
 try{const corpus=loadCorpus(version);return {available:true,retrievalVersion:'content-retrieval-0.12-v12',corpusVersion:corpus.corpusVersion,corpusHash:corpus.corpusHash,units:corpus.units.length,localSemanticPrepared:existsSync(path.join(here,'model-lock.json'))&&existsSync(path.join(here,'vectors-'+versions[version].folder+'.json')),runtimeSupported:Number(process.versions.node.split('.')[0])===24,requiredNodeMajor:24,nodeVersion:process.version,providerCalled:false};}
 catch{return {available:false,corpusVersion:version,localSemanticPrepared:false,providerCalled:false};}
}
const versionedResource=(entry,version)=>({...entry,href:entry.href.includes('?')?entry.href:entry.href+'?version='+version});
export function getContentCatalog(version=CURRENT_VERSION){const c=loadCorpus(version);return {corpusVersion:c.corpusVersion,corpusHash:c.corpusHash,bookSha256:c.bookSha256,units:c.units.map(({bodyMarkdown,...u})=>({...u,sections:u.sections.map(({bodyMarkdown,searchText,...s})=>s)})),assets:c.assets.map(e=>versionedResource(e,version)),references:c.references.map(e=>versionedResource(e,version)),compatibility:c.compatibility||null,readiness:getContentReadiness(version)};}
export function getContentChapter(unitId,version=CURRENT_VERSION){const c=loadCorpus(version);const unit=c.units.find(u=>u.unitId===unitId);return unit?{corpusVersion:c.corpusVersion,corpusHash:c.corpusHash,unit}:null;}
export function getContentAsset(name,version=CURRENT_VERSION){const c=loadCorpus(version);const entry=c.assets.find(a=>a.name===name);if(!entry)return null;const buffer=readFileSync(path.join(project,entry.sourcePath));if(sha(buffer)!==entry.sha256)throw Error('Diagram source changed');return {buffer,mime:name.endsWith('.png')?'image/png':name.endsWith('.svg')?'image/svg+xml':'text/plain; charset=utf-8'};}
export function getContentReference(name,version=CURRENT_VERSION){const c=loadCorpus(version);const entry=c.references.find(a=>a.name===name);if(!entry)return null;const buffer=readFileSync(path.join(project,entry.sourcePath));if(sha(buffer)!==entry.sha256)throw Error('Public reference source changed');return {buffer,mime:name.endsWith('.json')?'application/json; charset=utf-8':'text/plain; charset=utf-8'};}
function unavailable(message,version=CURRENT_VERSION){return {status:'unavailable',retrievalVersion:'content-retrieval-0.12-v12',engineMode:'local_semantic_retrieval',providerCalled:false,corpusVersion:version,corpusHash:null,interpretedIntents:[],excludedIntents:[],results:[],clarification:null,limitations:[message]};}
export async function recommendContent(input,options={}){
 const version=versions[input?.corpusVersion]?input.corpusVersion:CURRENT_VERSION;
 let corpus;try{corpus=loadCorpus(version);}catch{return unavailable('所选教材索引与源文件不可用或不一致，请重新准备资源。',version);}
 const validation=core.validate(corpus,input);if(validation)return core.recommend(corpus,input);
 const local=core.recommend(corpus,input);
 const mode=options.mode||process.env.ROLECRAFT_RETRIEVAL_MODE||'semantic';
 if(mode==='concept')return local;
 if(!['recommended','no_match'].includes(local.status))return local;
 if(active>=2)return {...unavailable('本地检索正在处理其他请求，请稍后重试。',version),corpusHash:corpus.corpusHash};
 active++;
 try{
  const {semanticScores,semanticIntents}=await import('./semantic.mjs');
  const positive=core.interpret(input,{corpusVersion:version}).positiveText;
  const [similarities,meaning]=await Promise.all([semanticScores(corpus,positive),semanticIntents(core.clauses(input.query),version)]);
  const {scores,provenance}=similarities;
  const excluded=meaning.filter(i=>i.excluded).map(i=>i.id);
  const inferred=meaning.filter(i=>!i.excluded&&!excluded.includes(i.id));
  const result=core.recommend(corpus,input,{semanticScores:scores,semanticThreshold:0.66,semanticIntents:inferred});
  if(excluded.length){const inferredExcluded=core.frames.filter(f=>excluded.includes(f.id)).map(f=>({id:f.id,label:f.label,evidence:meaning.filter(i=>i.id===f.id&&i.excluded).flatMap(i=>i.evidence),unitIds:f.units}));const excludedUnits=new Set(inferredExcluded.flatMap(i=>i.unitIds));result.excludedIntents=[...result.excludedIntents,...inferredExcluded];result.results=result.results.filter(r=>!excludedUnits.has(r.unitId));if(!result.results.length&&result.status==='recommended')result.status='no_match';}
  return {...result,engineMode:'local_semantic_retrieval',matchingMethods:['local_semantic_vectors','local_task_concepts','source_term_recall'],providerCalled:false,semanticProvenance:provenance,limitations:['使用本机中文向量模型结合任务概念、原文术语查找与否定规则检索；术语提及不等于完整课程。没有调用外部大模型。未知或复杂表达可能需要澄清。']};
 }catch(error){return {...unavailable(error?.code==='runtime_unsupported'?'当前 Node 主版本不在本地语义服务支持范围，请用 Node.js 24 启动；教材目录仍可阅读。':'本地语义资源或向量版本校验失败，请重新准备对应版本；也可以打开课程目录。',version),corpusHash:corpus.corpusHash,...(error?.code==='runtime_unsupported'?{errorCode:'runtime_unsupported'}:{})};}
 finally{active--;}
}
export async function closeContentRetrieval(){
 while(active>0)await new Promise(resolve=>setTimeout(resolve,10));
 const {disposeSemantic}=await import('./semantic.mjs');await disposeSemantic();
}
