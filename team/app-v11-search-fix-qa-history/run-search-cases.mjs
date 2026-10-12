import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('../../',import.meta.url),here=new URL('.',import.meta.url),base='http://127.0.0.1:4452';
const corpus=JSON.parse(readFileSync(new URL('server/retrieval/content-v10-index.json',root),'utf8'));
const sha=path=>createHash('sha256').update(readFileSync(new URL(path,root))).digest('hex');
const unitById=new Map(corpus.units.map(u=>[u.unitId,u]));
const frozen=JSON.parse(readFileSync(new URL('sf-cases-frozen.json',here),'utf8'));
const original=JSON.parse(readFileSync(new URL('independent-inputs-before-repair.json',here),'utf8'));
const cases=frozen.cases.map(c=>({...c,kind:'product-fixed'}));
const independentChecks={S04:'react',S05:'react_retrieval',S06:'cost_exclude_term',S07:'react',S08:'framework',S09:'framework',S10:'rag',S12:'no_match'};
for(const c of original.cases)if(!cases.some(x=>x.query===c.query))cases.push({...c,expectation:independentChecks[c.id]||'independent_observation',kind:'independent'});
const selectedIds=new Set((process.argv[3]||'').split(',').filter(Boolean));
const selectedCases=selectedIds.size?cases.filter(x=>selectedIds.has(x.id)):cases;
const records=[];
for(const item of selectedCases){
 const startedAtUtc=new Date().toISOString(),start=performance.now(),request={query:item.query};
 const http=await fetch(base+'/api/content/recommend',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(request)});const output=await http.json(),errors=[];
 const actual=output.results||[];const units=actual.map(x=>x.unitId);const hasTerm=actual.some(x=>x.unitId==='00-learning-route'&&x.sectionId==='s-7547e5ce91f8'&&x.evidenceExcerpt.includes('ReAct'));
 for(const result of actual){const u=unitById.get(result.unitId),s=u?.sections.find(s=>s.sectionId===result.sectionId);if(!u||!s)errors.push('unknown target');else{
  for(const [key,value]of Object.entries({sourcePath:u.sourcePath,sourceSha256:u.sourceSha256,version:corpus.corpusVersion,unitTitle:u.title,sectionTitle:s.title,href:s.href}))if(result[key]!==value)errors.push('incorrect '+key);
  if(!result.evidenceExcerpt||!s.bodyMarkdown.includes(result.evidenceExcerpt))errors.push('excerpt not exact target subset');
  if(result.reason?.includes('完整教程')||result.unitTitle?.includes('ReAct 完整'))errors.push('fabricated depth');
 }}
 if(output.corpusVersion!==corpus.corpusVersion||output.corpusHash!==corpus.corpusHash)errors.push('corpus identity');
 if(output.providerCalled!==false)errors.push('external provider unexpected');
 if(actual.length>6)errors.push('result count');
 const ex=item.expectation;
 if(ex==='react_retrieval'&&(!hasTerm||!units.includes('c02')))errors.push('ReAct and retrieval group coverage');
 if(ex==='cost_exclude_term'&&(!units.includes('e05')||hasTerm))errors.push('cost/excludedterm mismatch');
 if(ex==='rag'&&!units.includes('c02'))errors.push('RAG regression');
 if(output.engineMode==='local_semantic_retrieval'&&(!output.semanticProvenance||output.semanticProvenance.remoteModelsAllowed!==false||output.semanticProvenance.querySentExternally!==false))errors.push('semantic execution provenance');
 if(ex==='react'&&!(output.status==='recommended'&&hasTerm))errors.push('missing actual ReAct prose target');
 if(ex==='framework'&&!['no_match','needs_clarification'].includes(output.status))errors.push('frontend meaning answered as Agent');
 if(ex==='ambiguous'&&output.status!=='needs_clarification')errors.push('unresolved two meanings not clarified');
 if(ex==='exclude_only'&&actual.some(x=>x.unitId==='00-learning-route'&&x.sectionId==='s-7547e5ce91f8'))errors.push('excluded term recommended');
 if(ex==='recover_exclude_term'&&(!units.includes('e01')||actual.some(x=>x.unitId==='00-learning-route'&&x.sectionId==='s-7547e5ce91f8')))errors.push('recovery/exclusion mismatch');
 if(ex==='recover'&&!units.includes('e01'))errors.push('recovery regression');
 if(ex==='recover_cost'&&(!units.includes('e01')||!units.includes('e05')))errors.push('multiintent regression');
 if(ex==='schema'&&!(output.status==='recommended'&&actual.some(x=>x.evidenceExcerpt.toLowerCase().includes('json schema'))))errors.push('second actual prose term missing');
 if(ex==='no_match'&&output.status!=='no_match')errors.push('no-match regression');
 records.push({...item,startedAtUtc,elapsedMs:Math.round(performance.now()-start),request,httpStatus:http.status,output,errors,status:errors.length?'fail':ex==='independent_observation'?'needs_human_inspection':'pass'});
}
const run={completedAtUtc:new Date().toISOString(),runtime:process.version,base,scope:'Finite narrow term-fix HTTP validation and actual source identity, isolated QA tempDB. Independent cases retain human semantic review separately; no UI or textbook code behavior run claimed.',sourceHashes:Object.fromEntries(['server/retrieval/index.mjs','server/retrieval/semantic.mjs','dist/content-retrieval-core.js','server/retrieval/content-v10-index.json'].map(p=>[p,sha(p)])),records};
const label=process.argv[2]||'candidate';writeFileSync(new URL('http-'+label+'.json',here),JSON.stringify(run,null,2)+'\n');console.log(JSON.stringify({count:records.length,failed:records.filter(x=>x.status==='fail').map(x=>({id:x.id,query:x.query,errors:x.errors,status:x.output.status,units:x.output.results?.map(r=>r.unitId)})),independent:records.filter(x=>x.status==='needs_human_inspection').map(x=>({id:x.id,query:x.query,status:x.output.status,units:x.output.results?.map(r=>r.unitId),clarification:x.output.clarification}))}));
