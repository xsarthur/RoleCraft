// Author checks for the narrow source-term fix; not independent acceptance.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { recommendContent,closeContentRetrieval } from './index.mjs';
const here=path.dirname(fileURLToPath(import.meta.url)),project=path.resolve(here,'../..');
const corpus=JSON.parse(readFileSync(path.join(here,'content-v10-index.json'),'utf8'));
const target='00-learning-route/s-7547e5ce91f8';
const cases=[
 ['original','react',{target}],['case-mixed','ReAct',{target}],['case-upper','REACT',{target}],
 ['agent-sense','ReAct 的推理和行动是怎样交错的？',{target}],
 ['framework','React 前端框架',{status:'no_match'}],['framework-jsx','React 的 JSX 和 Hooks',{status:'no_match'}],
 ['ambiguous','React 是前端框架还是 Agent 的方法？我想学它。',{status:'needs_clarification'}],
 ['negated','先不看 ReAct，我想知道程序崩了后怎样接着干。',{unit:'e01',notTarget:true}],
 ['only-excluded','不要推荐 react。',{status:'no_match'}],
 ['recovery','程序崩了以后怎么接着干，又不把已经做过的事情再做一遍？',{unit:'e01'}],
 ['multi-intent','想知道中断后不重复做事，以及整个任务一共花了多少钱。',{units:['e01','e05']}],
 ['another-term','OpenTelemetry',{term:'opentelemetry'}],['another-lower','opentelemetry',{term:'opentelemetry'}],['another-upper','OPENTELEMETRY',{term:'opentelemetry'}],
 ['another-sqlite','SQLite',{term:'sqlite'}],
 ['unrelated','装修厨房台面怎么选材料？',{status:'no_match'}],
 ['word-boundary','preact',{status:'no_match'}],
 ['code-only','analysis_candidate',{status:'no_match'}],
 ['mixed-term-task','想看 ReAct 的推理行动交错，以及程序崩溃后怎样继续任务。',{target,unit:'e01'}]
];
const observations=[];
try{
 for(const [id,query,expected] of cases){
  const started=Date.now(),result=await recommendContent({query,startingPoint:'developer'}),failures=[];
  if(expected.status&&result.status!==expected.status)failures.push('status');
  if(expected.target&&!result.results.some(r=>r.unitId+'/'+r.sectionId===expected.target&&r.evidenceExcerpt.includes('ReAct')))failures.push('target/excerpt');
  if(expected.notTarget&&result.results.some(r=>r.unitId+'/'+r.sectionId===target))failures.push('excluded target');
  for(const unit of [...(expected.units||[]),...(expected.unit?[expected.unit]:[])])if(!result.results.some(r=>r.unitId===unit))failures.push('unit '+unit);
  if(expected.term&&!result.results.some(r=>r.matchingBasis==='source_term'&&r.matchedSourceTerms.includes(expected.term)))failures.push('source term');
  if(result.results.length>6)failures.push('total limit');
  for(const r of result.results){const u=corpus.units.find(u=>u.unitId===r.unitId),s=u?.sections.find(s=>s.sectionId===r.sectionId);if(!s||!s.bodyMarkdown.includes(r.evidenceExcerpt)||r.sourceSha256!==u.sourceSha256||r.href!==s.href||r.version!==corpus.corpusVersion)failures.push('source binding');}
  observations.push({id,query,expected,durationMs:Date.now()-started,passed:!failures.length,failures,result});
 }
}finally{await closeContentRetrieval();}
const files=['dist/content-retrieval-core.js','server/retrieval/index.mjs','server/retrieval/semantic.mjs','server/retrieval/content-v10-index.json','dist/content-v10-data.js'];
const binding=files.map(file=>({path:file,sha256:createHash('sha256').update(readFileSync(path.join(project,file))).digest('hex')}));
const output={kind:'author_development_check',executedAt:new Date().toISOString(),runtime:process.version,execPath:process.execPath,retrievalVersion:'content-retrieval-0.11.1-source-terms',corpusVersion:corpus.corpusVersion,corpusHash:corpus.corpusHash,bookSha256:corpus.bookSha256,binding,passed:observations.every(o=>o.passed),observations};
writeFileSync(path.join(project,'team/app-v11-search-fix-retrieval-dev-check.json'),JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify({passed:output.passed,cases:observations.length,failed:observations.filter(o=>!o.passed).map(o=>({id:o.id,failures:o.failures,status:o.result.status,units:o.result.results.map(r=>r.unitId)})),binding}));
process.exitCode=output.passed?0:1;
