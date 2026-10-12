import {readFileSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const here=path.dirname(fileURLToPath(import.meta.url)),project=path.resolve(here,'../..');
const sha=s=>createHash('sha256').update(s).digest('hex');
const phase=process.argv[2]||'candidate',ids=process.argv[3]?process.argv[3].split(','):null;
const caseFile=process.argv[4]||'frozen-query-cases.json';
const frozen=JSON.parse(readFileSync(path.join(here,caseFile),'utf8'));
const corpus=JSON.parse(readFileSync(path.join(project,'server/retrieval/content-v12-index.json'),'utf8'));
const files=['dist/content-retrieval-core.js','server/retrieval/index.mjs','server/retrieval/semantic.mjs','server/index.mjs','dist/learning-workbench.js','server/retrieval/content-v12-index.json','server/retrieval/vectors-v12.json'];
const binding=files.map(name=>({path:name,sha256:sha(readFileSync(path.join(project,name)))}));
const records=[];
for(const c of frozen.cases.filter(c=>!ids||ids.includes(c.id))){
 const request={query:c.query,corpusVersion:'textbook-v12'},startedAtUtc=new Date().toISOString(),t=Date.now(),errors=[];
 let httpStatus,output;
 try{
  const http=await fetch('http://127.0.0.1:4453/api/content/recommend',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(request)});
  httpStatus=http.status;output=await http.json();
  if(httpStatus!==200)errors.push('HTTP status');
  if(output.corpusVersion!=='textbook-v12'||output.corpusHash!==corpus.corpusHash)errors.push('current corpus identity');
  if(output.providerCalled!==false)errors.push('external provider claim');
  if(!['recommended','needs_clarification','no_match'].includes(output.status))errors.push('unexpected result status');
  if(c.kind==='no-match'&&output.status!=='no_match')errors.push('unrelated task incorrectly matched');
  if(c.kind==='needs-clarification'&&output.status!=='needs_clarification')errors.push('ambiguous meanings not clarified');
  if(c.kind==='frontend-no-certain-agent'&&!['no_match','needs_clarification'].includes(output.status))errors.push('frontend framework incorrectly recommended as Agent');
  const results=output.results||[];
  if(results.length>6)errors.push('original total result bound');
  const counts=new Map();for(const r of results)counts.set(r.intentId,(counts.get(r.intentId)||0)+1);
  if([...counts.values()].some(n=>n>3))errors.push('original per-intent result bound');
  for(const uid of c.expectedUnitIds)if(!results.some(r=>r.unitId===uid))errors.push('expected actual topic: '+uid);
  if(c.expectedSectionTitlePattern&&!results.some(r=>r.unitId===c.expectedUnitIds[0]&&new RegExp(c.expectedSectionTitlePattern).test(r.sectionTitle)))errors.push('expected actual section');
  if(c.kind==='old-negation'&&results.some(r=>r.unitId==='n03-planning-reflection'))errors.push('excluded ReAct topic shown');
  for(const r of results){
   const u=corpus.units.find(u=>u.unitId===r.unitId),s=u?.sections.find(s=>s.sectionId===r.sectionId);
   if(!u||!s){errors.push('unknown unit/section');continue;}
   if(r.sourcePath!==u.sourcePath||r.sourceSha256!==u.sourceSha256||r.version!==corpus.corpusVersion||r.unitTitle!==u.title||r.sectionTitle!==s.title)errors.push('source/title/version binding');
   if(!r.evidenceExcerpt?.trim()||!s.bodyMarkdown.includes(r.evidenceExcerpt))errors.push('quote is not exact current prose');
   if(r.href!==`#learn/agent/${u.unitId}/${s.sectionId}`)errors.push('unstable section href');
  }
  if(output.status==='recommended'&&(output.engineMode!=='local_semantic_retrieval'||output.semanticProvenance?.dimensions!==512||output.semanticProvenance?.remoteModelsAllowed!==false||output.semanticProvenance?.querySentExternally!==false))errors.push('default actual local model provenance');
 }catch(e){errors.push(e.message);}
 records.push({...c,request,startedAtUtc,elapsedMs:Date.now()-t,httpStatus,output,errors,status:errors.length?'fail':'pass'});
}
const result={completedAtUtc:new Date().toISOString(),runtime:process.version,executable:process.execPath,phase,inputFile:caseFile,frozenInputSha256:sha(readFileSync(path.join(here,caseFile))),implementationBinding:binding,scope:'Finite default Node24 real HTTP query/source assertions; not UI, arbitrary-language reliability or occupational qualification.',records};
writeFileSync(path.join(here,`http-${phase}.json`),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({phase,count:records.length,pass:records.filter(r=>r.status==='pass').length,failures:records.filter(r=>r.status==='fail').map(r=>({id:r.id,errors:r.errors,status:r.output?.status,targets:r.output?.results?.map(r=>r.unitId+'/'+r.sectionId)}))}));
