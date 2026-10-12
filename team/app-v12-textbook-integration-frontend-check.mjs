// Client developer checks in a VM with isolated storage fixtures. This is not a browser or independent QA.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sources = ['dist/index.html','dist/app.js','dist/learning-workbench.js'];
const files = Object.fromEntries(sources.map(f => [f, { sha256: createHash('sha256').update(readFileSync(path.join(project,f))).digest('hex') }]));
const staticData = ['content-v10-data.js','content-v12-data.js'];
const classes = () => ({toggle(){},add(){},remove(){},contains(){return false;}});
function runtime({localEntries = [], sessionEntries = []} = {}) {
  const local = new Map(localEntries), session = new Map(sessionEntries), writes = [], events = new Map(), nodes = new Map(), downloads = [];
  const store = (map, prefix) => ({getItem:k=>map.get(k)??null,setItem(k,v){writes.push(prefix+':'+k);map.set(k,v);},removeItem(){throw Error('Deleting records forbidden in this fixture');}});
  const node = () => ({dataset:{},classList:classes(),innerHTML:'',textContent:'',value:'',hidden:false,isConnected:true,setAttribute(){},removeAttribute(){},addEventListener(){},focus(){},scrollIntoView(){},querySelector(){return node();},querySelectorAll(){return [];},click(){},showModal(){},close(){}});
  const document = {body:{classList:classes(),appendChild(n){nodes.set(n.id,n);}},activeElement:null,getElementById:id=>nodes.get(id)||null,querySelectorAll:()=>[],createElement:()=>node(),addEventListener:(name,fn)=>{events.set(name,[...(events.get(name)||[]),fn]);}};
  class FixtureURL extends URL {static createObjectURL(blob){downloads.push(blob);return 'blob:fixture';}static revokeObjectURL(){}}
  const context = vm.createContext({document,location:{hash:'#home',protocol:'http:',href:'http://fixture/#home'},navigator:{},localStorage:store(local,'local'),sessionStorage:store(session,'session'),URL:FixtureURL,URLSearchParams,Blob,Map,Set,AbortController,console,setTimeout(fn){fn();return 1;},clearTimeout(){},requestAnimationFrame(fn){fn();return 1;},cancelAnimationFrame(){}});
  for (const file of staticData) vm.runInContext(readFileSync(path.join(project,'dist',file),'utf8'),context,{filename:file});
  vm.runInContext(readFileSync(path.join(project,'dist/learning-workbench.js'),'utf8'),context,{filename:'learning-workbench.js'});
  const emit = (name,target) => { for(const fn of events.get(name)||[]) fn({target,preventDefault(){}}); };
  const click = (attribute,dataset={}) => {const button=node();button.dataset=dataset;button.hasAttribute=name=>name===attribute;button.closest=()=>button;emit('click',button);};
  return {context,local,session,writes,nodes,node,downloads,emit,click,workbench:context.LearningWorkbench};
}
const tests = [];
function check(name,fn){fn();tests.push({name,status:'pass'});}
const app=runtime(), c=app.context.RolecraftContentV12, old=app.context.RolecraftContentV10;
const curriculum=JSON.parse(readFileSync(path.join(project,'team/textbook-v12-curriculum.json'),'utf8'));
check('Default v12 catalog, formal reading order, 30 chapter readers and prerequisites',()=>{
 assert.equal(app.workbench.version,'local-workbench-0.12-textbook');assert.equal(c.corpusVersion,'textbook-v12');
 assert.deepEqual(Array.from(c.units,u=>u.unitId),curriculum.readingOrder);
 app.context.location.hash='#learn';const catalog=app.workbench.page('learn');assert.match(catalog,/30 篇/);assert.doesNotMatch(catalog,/20 篇|v0\.10/);
 const route=app.workbench.page('path');let previous=-1;
 for(const u of c.units){const at=route.indexOf('href="#learn/agent/'+u.unitId+'"');assert(at>previous,u.unitId);previous=at;}
 for(const u of c.units){app.context.location.hash='#learn/agent/'+u.unitId;const html=app.workbench.page('learn');assert.match(html,/教材 v12/);assert(html.includes(u.sourcePath));assert(html.includes(u.sourceSha256));for(const id of u.prerequisiteUnitIds)assert(html.includes('href="#learn/agent/'+id+'"'));}
 assert.equal(c.units[17].unitId,'n03-planning-reflection');assert.equal(c.units[29].unitId,'p02');
 app.context.location.hash='#home';assert(app.workbench.page('home').includes('agent-engineering-landscape-v12.png'));
});
let unavailableLinks=[];
check('All v12 prose links resolve to public original targets; code and tables retained',()=>{
 for(const u of c.units){const html=app.workbench.markdown(u);let matches=Array.from(html.matchAll(/<span class="lw-unavailable-link">(.*?)<\/span>/gs));unavailableLinks.push(...matches.map(m=>({unitId:u.unitId,label:m[1]})));for(const s of u.sections)assert(html.includes('id="'+s.sectionId+'"'));}
 assert.deepEqual(unavailableLinks,[]);
 const n03=c.units[17],html=app.workbench.markdown(n03);assert.match(html,/<table>/);assert(html.includes('/api/content/reference/n03-plan-execution.py?version=textbook-v12'));
 const sample={...n03,bodyMarkdown:'[示例说明](examples/README.md)\n\n[正文入口](README.md)'};
 const rendered=app.workbench.markdown(sample);assert(rendered.includes('/api/content/reference/examples-README.md?version=textbook-v12'));assert(rendered.includes('/api/content/reference/textbook-README.md?version=textbook-v12'));
});
const oldSection=old.units.find(u=>u.unitId==='e01').sections.find(s=>s.level===2);
const fixture={startingPoint:'developer',visits:[{unitId:'e01',sectionId:oldSection.sectionId,corpusHash:old.corpusHash,at:'2026-10-11T00:00:00Z'}],bookmarks:[{unitId:'e01',sectionId:oldSection.sectionId,corpusHash:old.corpusHash}],notes:{e01:'旧笔记 <不能覆盖> & 原文'},project:{title:'旧项目',result:'本人自述'}};
const historicalRaw=JSON.stringify(fixture), legacyRaw='{"notes":{"agent":"更早记录"}}',oldSession='{"query":"react","response":{"status":"recommended","corpusVersion":"textbook-v10"}}';
const isolated=runtime({localEntries:[['rolecraft-learning-v11',historicalRaw],['rolecraft-v1',legacyRaw]],sessionEntries:[['rolecraft-content-query-v11',oldSession]]});
check('Old records read-only; new n03 note/bookmark/visit separate with source identity; history deep links and missing position',()=>{
 let html=isolated.workbench.page('records');assert(html.includes('旧笔记 &lt;不能覆盖&gt; &amp; 原文'));assert(html.includes('?version=textbook-v10'));assert(html.includes('旧项目'));
 isolated.context.location.hash='#learn/agent/e01/'+oldSection.sectionId+'?version=textbook-v10';html=isolated.workbench.page('learn');assert(html.includes('正在阅读历史教材 v10'));assert(html.includes('textbooks/v10/e01.md'));assert(!html.includes('id="lw-note"'));
 isolated.workbench.mount('learn');assert.equal(isolated.workbench.currentContext().currentUnitId,null);assert.equal(isolated.local.get('rolecraft-learning-v12'),undefined);
 isolated.context.location.hash='#learn/agent/e01/'+oldSection.sectionId;html=isolated.workbench.page('learn');assert(html.includes('教材 v12'));assert(html.includes('id="'+oldSection.sectionId+'"'));assert(!html.includes('旧笔记 &lt;不能覆盖&gt;'));
 isolated.context.location.hash='#learn/agent/e01/s-does-not-exist';html=isolated.workbench.page('learn');assert(html.includes('这处教材位置在所选版本中不可用'));
 isolated.context.location.hash='#learn/agent/n03-planning-reflection/s-da63f3dcff17';isolated.workbench.mount('learn');
 const note=isolated.node();note.id='lw-note';note.value='新版 n03 笔记 & 保留';isolated.nodes.set(note.id,note);isolated.emit('input',note);isolated.click('data-lw-bookmark');
 const stored=JSON.parse(isolated.local.get('rolecraft-learning-v12'));assert.equal(stored.notes['n03-planning-reflection'].text,note.value);assert.equal(stored.notes['n03-planning-reflection'].sourceSha256,c.units[17].sourceSha256);assert.equal(stored.notes['n03-planning-reflection'].corpusVersion,'textbook-v12');assert.equal(stored.visits.length,1);assert.equal(stored.bookmarks.length,1);assert.equal(stored.visits[0].corpusVersion,'textbook-v12');
 assert.equal(isolated.local.get('rolecraft-learning-v11'),historicalRaw);assert.equal(isolated.local.get('rolecraft-v1'),legacyRaw);assert.equal(isolated.session.get('rolecraft-content-query-v11'),oldSession);assert(!isolated.writes.some(w=>/v11|rolecraft-v1$/.test(w)));
});
isolated.click('data-lw-export');const exported=JSON.parse(await isolated.downloads.at(-1).text());
check('Export contains unchanged v10 original bytes and separate v12 records',()=>{
 assert.equal(exported.historical.originalStorageValue,historicalRaw);assert.deepEqual(exported.historical.records,fixture);assert.equal(exported.current.records.notes['n03-planning-reflection'].text,'新版 n03 笔记 & 保留');assert.equal(exported.current.corpusVersion,'textbook-v12');
});
const u=c.units[17],sec=u.sections.find(s=>s.sectionId==='s-da63f3dcff17');
const response={status:'recommended',corpusVersion:c.corpusVersion,corpusHash:c.corpusHash,engineMode:'local_semantic_retrieval',providerCalled:false,results:[{unitId:u.unitId,sectionId:sec.sectionId,sourceSha256:u.sourceSha256,sourcePath:u.sourcePath,version:c.corpusVersion,unitTitle:u.title,sectionTitle:sec.title,reason:'正文解释策略的控制对象',evidenceExcerpt:sec.bodyMarkdown.slice(0,120),href:sec.href}]};
const submission={query:'react',context:{corpusVersion:'textbook-v12'}};
check('Current original recommendation accepted; old corpus/source/submission rejected',()=>{
 assert.equal(app.workbench.validateResponse(response,submission).status,'recommended');
 assert.throws(()=>app.workbench.validateResponse({...response,corpusVersion:'textbook-v10',corpusHash:old.corpusHash},submission),/版本不一致/);
 assert.throws(()=>app.workbench.validateResponse({...response,results:[{...response.results[0],sourceSha256:old.units[0].sourceSha256}]},submission),/来源或原文/);
 assert.throws(()=>app.workbench.validateResponse(response,{...submission,context:{corpusVersion:'textbook-v10'}}),/查询缓存属于其他教材版本/);
});
check('Old cache ignored; injected stale current-key result displayed as unavailable',()=>{
 isolated.workbench.mount('home');assert(isolated.nodes.get('lw-assistant-host').innerHTML.includes('v10 旧查询已保留'));assert(!isolated.nodes.get('lw-assistant-host').innerHTML.includes('推荐阅读'));
 const stale=runtime({sessionEntries:[['rolecraft-content-query-v12',JSON.stringify({query:'react',submission,response:{...response,corpusVersion:'textbook-v10',corpusHash:old.corpusHash},assistantOpen:true})]]});stale.workbench.mount('home');const html=stale.nodes.get('lw-assistant-host').innerHTML;assert(html.includes('暂时无法检索'));assert(html.includes('版本不一致'));assert(!html.includes('推荐阅读'));
});
const report={schemaVersion:'1',scope:'client developer isolated VM checks only; no real browser, HTTP, model, user storage or independent QA',createdAt:new Date().toISOString(),runtime:process.version,clientVersion:app.workbench.version,corpusVersion:c.corpusVersion,corpusHash:c.corpusHash,files,tests,unavailableLinks,protectedFixtureKeysUnchanged:true,realBrowserTested:false};
writeFileSync(path.join(project,'team/app-v12-textbook-integration-frontend-check.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({scope:report.scope,tests:tests.length,status:'pass',files,corpusHash:c.corpusHash}));
