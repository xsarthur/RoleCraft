import {readFileSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
const here=path.dirname(fileURLToPath(import.meta.url)),project=path.resolve(here,'../..'),phase=process.argv[2]||'candidate';
const sha=s=>createHash('sha256').update(s).digest('hex');
const current=JSON.parse(readFileSync(path.join(project,'server/retrieval/content-v12-index.json'),'utf8')),old=JSON.parse(readFileSync(path.join(project,'server/retrieval/content-v10-index.json'),'utf8'));
const oldUnit=old.units.find(u=>u.unitId==='e01'),oldSection=oldUnit.sections.find(s=>s.level===2);
const oldRecord={startingPoint:'developer',visits:[{unitId:'e01',sectionId:oldSection.sectionId,corpusHash:old.corpusHash,at:'2026-10-11T12:00:00.000Z'}],bookmarks:[{unitId:'e01',sectionId:oldSection.sectionId,corpusHash:old.corpusHash}],notes:{e01:'QA synthetic v10 note preserved'},project:{title:'QA synthetic old project',problem:'old problem',evidence:'old evidence',result:'old result',gap:'old gap',next:'old next'}};
function fixture(extraLocal={},extraSession={}){
 const storage=new Map([['rolecraft-learning-v11',JSON.stringify(oldRecord)],['rolecraft-v1','{"qaSyntheticLegacy":true}'],...Object.entries(extraLocal)]),session=new Map(Object.entries(extraSession)),listeners={},nodes=new Map(),downloads=[],blobs=new Map();
 const noop=()=>{};
 const node=(tag='div')=>({tagName:tag,id:'',value:'',innerHTML:'',textContent:'',hidden:false,dataset:{},isConnected:true,classList:{toggle:noop,add:noop,remove:noop,contains:()=>false},setAttribute:noop,removeAttribute:noop,hasAttribute:()=>false,addEventListener:noop,appendChild:noop,focus:noop,scrollIntoView:noop,querySelector:()=>node(),querySelectorAll:()=>[],closest(){return this;},click(){downloads.push({name:this.download,url:this.href,blob:blobs.get(this.href)});}});
 const body=node('body');body.appendChild=n=>nodes.set(n.id,n);
 const document={body,activeElement:null,getElementById:id=>nodes.get(id)||null,querySelectorAll:()=>[],querySelector:()=>null,createElement:node,addEventListener:(type,fn)=>{(listeners[type]??=[]).push(fn);}};
 const localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
 const sessionStorage={getItem:k=>session.get(k)??null,setItem:(k,v)=>session.set(k,String(v)),removeItem:k=>session.delete(k)};
 class FixtureURL extends URL { static createObjectURL(blob){const key='blob:qa-'+blobs.size;blobs.set(key,blob);return key;} static revokeObjectURL(){} }
 const location={hash:'#home',protocol:'http:'};
 const sandbox={document,localStorage,sessionStorage,location,Blob,URL:FixtureURL,URLSearchParams,AbortController,setTimeout:()=>0,clearTimeout:noop,requestAnimationFrame:fn=>{fn();return 1;},cancelAnimationFrame:noop,navigator:{clipboard:{writeText:async()=>{}}},window:{addEventListener:noop},console};
 sandbox.globalThis=sandbox;
 vm.runInNewContext(readFileSync(path.join(project,'dist/content-v10-data.js'),'utf8'),sandbox);
 vm.runInNewContext(readFileSync(path.join(project,'dist/content-v12-data.js'),'utf8'),sandbox);
 vm.runInNewContext(readFileSync(path.join(project,'dist/learning-workbench.js'),'utf8'),sandbox);
 return {storage,session,listeners,nodes,downloads,location,api:sandbox.LearningWorkbench,node};
}
const errors=[],f=fixture(),oldBytes=f.storage.get('rolecraft-learning-v11'),legacyBytes=f.storage.get('rolecraft-v1');
const home=f.api.page('home');if(!home.includes('30')||home.includes('课程目录 <small>20'))errors.push('current catalog count');
f.location.hash='#records';const oldRecordsHtml=f.api.page('records');
if(!oldRecordsHtml.includes(oldRecord.notes.e01)||!oldRecordsHtml.includes('textbook-v10'))errors.push('old record view/identity');
f.location.hash='#learn/agent/e01';const currentE01=f.api.page('learn');if(currentE01.includes(oldRecord.notes.e01)||!currentE01.includes('textbook-v12'))errors.push('old note silently attached to current source');
f.location.hash=`#learn/agent/e01/${oldSection.sectionId}?version=textbook-v10`;const legacyReader=f.api.page('learn');
if(!legacyReader.includes('textbook-v10')||!legacyReader.includes(oldUnit.sourceSha256))errors.push('explicit historical route identity');
const newUnit=current.units.find(u=>u.unitId==='n03-planning-reflection');
f.location.hash='#learn/agent/n03-planning-reflection';f.api.page('learn');f.api.mount('learn');
const note=f.node('textarea');note.id='lw-note';note.value='QA synthetic new n03 note';f.nodes.set(note.id,note);
for(const handler of f.listeners.input||[])handler({target:note});
const saved=JSON.parse(f.storage.get('rolecraft-learning-v12')||'{}');
if(!JSON.stringify(saved).includes(note.value))errors.push('new note not stored');
if(f.storage.get('rolecraft-learning-v11')!==oldBytes||f.storage.get('rolecraft-v1')!==legacyBytes)errors.push('old keys mutated');
f.location.hash='#records';const updatedRecordsHtml=f.api.page('records');
if(!updatedRecordsHtml.includes(note.value)||!updatedRecordsHtml.includes(oldRecord.notes.e01))errors.push('current/historical notes not separately available');
const button=f.node('button');button.hasAttribute=name=>name==='data-lw-export';
for(const handler of f.listeners.click||[])handler({target:button,preventDefault:()=>{}});
let exportText='';if(f.downloads.length)exportText=await f.downloads.at(-1).blob.text();
if(!exportText.includes(note.value)||!exportText.includes(oldRecord.notes.e01)||!exportText.includes('textbook-v10')||!exportText.includes('textbook-v12'))errors.push('synthetic export lacks historical/current identity or value');
const exported=JSON.parse(exportText||'{}');
if(exported.historical?.originalStorageValue!==oldBytes||exported.current?.corpusVersion!=='textbook-v12'||exported.historical?.corpusVersion!=='textbook-v10')errors.push('raw historical bytes/version not exported separately');
if(saved.notes?.[newUnit.unitId]?.sourceSha256!==newUnit.sourceSha256||saved.notes?.[newUnit.unitId]?.corpusVersion!=='textbook-v12')errors.push('new note has no current source identity');
const oldExcerpt=oldSection.bodyMarkdown.slice(0,120);
const oldResponse={status:'recommended',engineMode:'local_concept_retrieval',providerCalled:false,corpusVersion:old.corpusVersion,corpusHash:old.corpusHash,results:[{unitId:oldUnit.unitId,sectionId:oldSection.sectionId,unitTitle:oldUnit.title,sectionTitle:oldSection.title,version:old.corpusVersion,sourcePath:oldUnit.sourcePath,sourceSha256:oldUnit.sourceSha256,evidenceExcerpt:oldExcerpt,reason:'QA synthetic stale response',href:`#learn/agent/e01/${oldSection.sectionId}`} ]};
let rejectedOldResponse=false;try{f.api.validateResponse(oldResponse,{query:'QA stale',context:{corpusVersion:'textbook-v12'}});}catch{rejectedOldResponse=true;}
if(!rejectedOldResponse)errors.push('stale current response accepted');
const historicalFixture=fixture();historicalFixture.location.hash=`#learn/agent/e01/${oldSection.sectionId}?version=textbook-v10`;historicalFixture.api.page('learn');historicalFixture.api.mount('learn');
const historicalNewStorageBefore=historicalFixture.storage.get('rolecraft-learning-v12');
const forcedNote=historicalFixture.node('textarea');forcedNote.id='lw-note';forcedNote.value='QA synthetic attempt on historical view';historicalFixture.nodes.set('lw-note',forcedNote);
for(const handler of historicalFixture.listeners.input||[])handler({target:forcedNote});
const historicalCurrentAfter=JSON.parse(historicalFixture.storage.get('rolecraft-learning-v12')||'{}');
const historicalNoLearningFacts=!(historicalCurrentAfter.visits?.length||historicalCurrentAfter.bookmarks?.length||Object.keys(historicalCurrentAfter.notes||{}).length||Object.values(historicalCurrentAfter.project||{}).some(Boolean));
if(!historicalNoLearningFacts||historicalFixture.storage.get('rolecraft-learning-v11')!==oldBytes)errors.push('historical readonly view wrote learning facts');
const oldQueryValue=JSON.stringify({query:'QA synthetic old search',response:oldResponse,submission:{query:'QA synthetic old search',context:{corpusVersion:'textbook-v10'}},assistantOpen:true});
const oldCache=fixture({}, {'rolecraft-content-query-v11':oldQueryValue});oldCache.api.mount('home');
const oldCacheMarkup=oldCache.nodes.get('lw-assistant-host')?.innerHTML||'';
if(oldCache.session.get('rolecraft-content-query-v11')!==oldQueryValue||oldCacheMarkup.includes('QA synthetic old search')||oldCacheMarkup.includes('QA synthetic stale response'))errors.push('old query cache mutated or imported as current');
const mislabeledCache=fixture({}, {'rolecraft-content-query-v12':oldQueryValue});mislabeledCache.api.mount('home');
const rejectedCacheMarkup=mislabeledCache.nodes.get('lw-assistant-host')?.innerHTML||'';
if(!rejectedCacheMarkup.includes('暂时无法检索')||rejectedCacheMarkup.includes('QA synthetic stale response'))errors.push('stale response inside current cache not unavailable');
const links=[];
for(const u of current.units){
 f.location.hash='#learn/agent/'+u.unitId;
 const html=f.api.markdown(u);
 if(html.includes('lw-unavailable-link'))errors.push('source reference rendered unavailable '+u.unitId);
 for(const s of u.sections)if(!html.includes(`id="${s.sectionId}"`))errors.push('missing rendered target '+u.unitId+'/'+s.sectionId);
 for(const m of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)){
  const href=m[1].replaceAll('&amp;','&');let valid=true;
  if(href.startsWith('#learn/agent/')){const [uid,sid]=href.slice('#learn/agent/'.length).split('?')[0].split('/'),target=current.units.find(v=>v.unitId===uid);valid=!!target&&(!sid||target.sections.some(s=>s.sectionId===sid));}
  else if(href.startsWith('/api/content/reference/'))valid=current.references.some(r=>r.href===href);
  else if(href.startsWith('/api/content/assets/'))valid=current.assets.some(r=>r.href===href);
  else if(!href.startsWith('https://')&&!href.startsWith('http://')&&href!=='#learn')valid=false;
  links.push({unitId:u.unitId,href,valid});if(!valid)errors.push('unknown rendered link '+href);
 }
}
const result={atUtc:new Date().toISOString(),runtime:process.version,phase,scope:'Independent execution of current client source in a Node VM with disposable synthetic storage and document/Blob fixture. Static markup and state logic only; no real DOM/browser, page visibility, click, download or clipboard claim.',sourceSha256:sha(readFileSync(path.join(project,'dist/learning-workbench.js'))),errors,status:errors.length?'fail':'pass',checks:{oldLearningKeyBytesPreserved:f.storage.get('rolecraft-learning-v11')===oldBytes,oldV1BytesPreserved:f.storage.get('rolecraft-v1')===legacyBytes,rejectedOldResponse,historicalReadonlyNoNewLearningWrite:historicalNoLearningFacts,rawHistoricalBytesExported:exported.historical?.originalStorageValue===oldBytes,oldQueryCachePreserved:oldCache.session.get('rolecraft-content-query-v11')===oldQueryValue,currentCacheRejectsOldVersion:rejectedCacheMarkup.includes('暂时无法检索')},historicalCurrentAfter,savedCurrentRecord:saved,syntheticExport:exportText,oldRecordsHtml,legacyReaderHtml:legacyReader,links};
writeFileSync(path.join(here,`client-logic-${phase}.json`),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({phase,status:result.status,errors,links:links.length,checks:result.checks}));
