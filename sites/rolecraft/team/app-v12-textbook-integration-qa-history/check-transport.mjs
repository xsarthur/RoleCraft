import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
const here=path.dirname(fileURLToPath(import.meta.url)),project=path.resolve(here,'../..');
const sha=s=>createHash('sha256').update(s).digest('hex');
const phase=process.argv[2]||'candidate',base='http://127.0.0.1:4453';
const index=JSON.parse(readFileSync(path.join(project,'server/retrieval/content-v12-index.json'),'utf8'));
const curriculum=JSON.parse(readFileSync(path.join(project,'team/textbook-v12-curriculum.json'),'utf8'));
const assembly=JSON.parse(readFileSync(path.join(project,'textbooks/v12/assembly-manifest.json'),'utf8'));
const catalogHttp=await fetch(base+'/api/content/catalog'),catalog=await catalogHttp.json();
const errors=[],units=[],resources=[];
const expectedOrder=curriculum.readingOrder;
if(catalogHttp.status!==200||catalog.corpusVersion!=='textbook-v12'||catalog.corpusHash!==index.corpusHash)errors.push('default catalog identity');
if(index.units.length!==30||new Set(index.units.map(u=>u.unitId)).size!==30||JSON.stringify(index.units.map(u=>u.unitId))!==JSON.stringify(expectedOrder)||JSON.stringify(assembly.order)!==JSON.stringify(expectedOrder))errors.push('30 authoritative ordered units');
const bookSha256=sha(readFileSync(path.join(project,'textbooks/v12/agent-engineering-textbook.md')));
if(bookSha256!=='25ce2aaa1be0ba0f2814dd1247ac6299d106c3d2e48f43867c49055490c2801e'||index.bookSha256!==bookSha256||catalog.bookSha256!==bookSha256)errors.push('frozen book identity');
const sandbox={};vm.runInNewContext(readFileSync(path.join(project,'dist/content-v12-data.js'),'utf8'),sandbox);
const data=sandbox.RolecraftContentV12;
if(!data||JSON.stringify(data)!==JSON.stringify(index))errors.push('browser data and index differ');
for(const [position,u] of index.units.entries()){
 const checks=[],source=readFileSync(path.join(project,u.sourcePath),'utf8'),sourceSha=sha(source);
 const expected=curriculum.units.find(v=>v.id===u.unitId),c=catalog.units?.find(v=>v.unitId===u.unitId);
 if(u.order!==position+1||c?.order!==u.order||c?.sourceSha256!==sourceSha||u.sourceSha256!==sourceSha||assembly.hashes[u.unitId+'.md']!==sourceSha)checks.push('source/order hash mismatch');
 if(u.sourcePath!==`textbooks/v12/${u.unitId}.md`||u.bodyMarkdown!==source)checks.push('not exact frozen v12 full source');
 if(JSON.stringify(u.prerequisiteUnitIds)!==JSON.stringify(expected?.prerequisites)||JSON.stringify(c?.prerequisiteUnitIds)!==JSON.stringify(expected?.prerequisites))checks.push('formal prerequisite mismatch');
 if(u.prerequisiteUnitIds.some(id=>!expectedOrder.includes(id)||expectedOrder.indexOf(id)>=position))checks.push('prerequisite order');
 const headings=[];let fenced=false;
 source.split('\n').forEach((line,i)=>{if(/^\s*```/.test(line)){fenced=!fenced;return;}if(!fenced){const m=line.match(/^(#{1,6})\s+(.+)$/);if(m)headings.push({title:m[2],level:m[1].length,line:i+1});}});
 if(u.sections.length!==headings.length||new Set(u.sections.map(s=>s.sectionId)).size!==u.sections.length)checks.push('section coverage/uniqueness');
 for(const h of headings){const s=u.sections.find(s=>s.startLine===h.line);if(!s||s.title!==h.title||s.level!==h.level||!source.includes(s.bodyMarkdown))checks.push('heading/source section mismatch line '+h.line);}
 const http=await fetch(base+'/api/content/chapter/'+u.unitId),returned=await http.json();
 if(http.status!==200||returned.corpusVersion!=='textbook-v12'||returned.corpusHash!==index.corpusHash||JSON.stringify(returned.unit)!==JSON.stringify(u))checks.push('actual current chapter transport');
 units.push({unitId:u.unitId,order:u.order,sourcePath:u.sourcePath,sourceSha256:sourceSha,bytes:Buffer.byteLength(source),sections:u.sections.length,prerequisites:u.prerequisiteUnitIds,checks:checks.length?checks:['all checked'],status:checks.length?'fail':'pass'});
}
for(const [kind,entries] of [['asset',index.assets],['reference',index.references]])for(const r of entries){
 const checks=[],raw=readFileSync(path.join(project,r.sourcePath)),http=await fetch(new URL(r.href,base)),received=Buffer.from(await http.arrayBuffer());
 if(http.status!==200||sha(raw)!==r.sha256||sha(received)!==r.sha256)checks.push('actual resource/source binding');
 if(!existsSync(path.join(project,'dist',r.staticHref))||sha(readFileSync(path.join(project,'dist',r.staticHref)))!==r.sha256)checks.push('derived static resource binding');
 resources.push({kind,name:r.name,sourcePath:r.sourcePath,href:r.href,sourceSha256:r.sha256,checks:checks.length?checks:['all checked'],status:checks.length?'fail':'pass'});
}
const old=JSON.parse(readFileSync(path.join(project,'server/retrieval/content-v10-index.json'),'utf8'));
const legacy=[];
for(const id of ['00-learning-route','e01']){
 const http=await fetch(base+`/api/content/chapter/${id}?version=textbook-v10`),out=await http.json(),expected=old.units.find(u=>u.unitId===id);
 const pass=http.status===200&&out.corpusVersion==='textbook-v10'&&out.corpusHash===old.corpusHash&&JSON.stringify(out.unit)===JSON.stringify(expected);
 legacy.push({unitId:id,httpStatus:http.status,version:out.corpusVersion,sourceSha256:out.unit?.sourceSha256,status:pass?'pass':'fail'});
}
const vectors=JSON.parse(readFileSync(path.join(project,'server/retrieval/vectors-v12.json'),'utf8'));
const vectorChecks={currentCorpus:vectors.corpusHash===index.corpusHash,newCorpusDiffersFromV10:vectors.corpusHash!==old.corpusHash,dimensions512:vectors.dimensions===512,allThirtyActualUnitKeys:index.units.every(u=>vectors.items.some(v=>v.key.startsWith(u.unitId+'/'))),allFiniteVectors:vectors.items.every(v=>v.vector.length===512&&v.vector.every(Number.isFinite)),modelHash:vectors.modelHash,chunkHash:vectors.chunkHash,items:vectors.items.length};
if(Object.values(vectorChecks).includes(false))errors.push('actual v12 vectors identity');
const result={atUtc:new Date().toISOString(),runtime:process.version,phase,scope:'All30 exact source/catalog/chapter transport, resource bytes, authoritative order/prerequisites and vector cache identity; static/service only, no rendered layout or browser operation claim.',catalog,corpusHash:index.corpusHash,bookSha256,units,resources,legacy,vectorChecks,errors,status:errors.length||[...units,...resources,...legacy].some(r=>r.status==='fail')?'fail':'pass'};
writeFileSync(path.join(here,`transport-${phase}.json`),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({phase,status:result.status,units:units.length,resources:resources.length,errors,unitFailures:units.filter(u=>u.status==='fail'),resourceFailures:resources.filter(r=>r.status==='fail'),legacy,vectorChecks}));
