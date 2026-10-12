import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {recommendContent,getContentCatalog,getContentChapter,closeContentRetrieval} from './index.mjs';
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const sha=raw=>createHash('sha256').update(raw).digest('hex');
const cases=[
 ['react','react',r=>r.results.some(x=>x.unitId==='n03-planning-reflection'&&x.sectionId==='s-da63f3dcff17')],
 ['react-mechanism','ReAct 怎么把推理和动作交错？',r=>r.results.some(x=>x.unitId==='n03-planning-reflection'&&x.sectionId==='s-da63f3dcff17')],
 ['planning-term','Planning',r=>r.results.some(x=>x.unitId==='n03-planning-reflection'&&['s-7b6b3d9e9b99','s-c9f93b25fb1f'].includes(x.sectionId))],
 ['planning-meaning','怎样从目标倒推步骤，再检查计划能不能执行？',r=>r.results.some(x=>x.unitId==='n03-planning-reflection'&&['s-7b6b3d9e9b99','s-c9f93b25fb1f'].includes(x.sectionId))],
 ['replanning-term','Replanning',r=>r.results.some(x=>x.unitId==='n03-planning-reflection'&&x.sectionId==='s-7ee14c15626d')],
 ['replanning-meaning','新证据推翻计划后，哪些步骤要重做，哪些事实该保留？',r=>r.results.some(x=>x.unitId==='n03-planning-reflection'&&x.sectionId==='s-7ee14c15626d')],
 ['recovery','程序崩了以后怎么接着干，又不把已经做过的事情再做一遍？',r=>r.results[0]?.unitId==='e01'],
 ['multi','想知道中断后不重复做事，以及整个任务一共花了多少钱。',r=>r.results.some(x=>x.unitId==='e01')&&r.results.some(x=>x.unitId==='e05')],
 ['negation','先不看 ReAct，我只想知道中断后怎样继续。',r=>r.results[0]?.unitId==='e01'&&!r.results.some(x=>x.intentId==='react_strategy')],
 ['frontend','React 前端框架的 JSX 和 Hooks',r=>r.status==='no_match'],
 ['ambiguity','React 是前端框架还是 Agent 的方法？我想学它。',r=>r.status==='needs_clarification'],
 ['no-match','装修厨房台面怎么选材料？',r=>r.status==='no_match']
];
const sourceFiles=['server/retrieval/index.mjs','server/retrieval/semantic.mjs','server/retrieval/build-content-v12.mjs','dist/content-retrieval-core.js','server/index.mjs','server/retrieval/content-v12-index.json','server/retrieval/vectors-v12.json','server/retrieval/intent-vectors-v12.json','dist/content-v12-data.js'];
const binding=Object.fromEntries(sourceFiles.map(name=>[name,sha(readFileSync(path.join(project,name)))]));
const catalog=getContentCatalog();const runs=[];
try{
 for(const [id,query,check] of cases){
  const response=await recommendContent({query,corpusVersion:'textbook-v12',startingPoint:'practitioner'});
  const evidenceValid=response.corpusVersion===catalog.corpusVersion&&response.corpusHash===catalog.corpusHash&&response.results.every(r=>{const u=getContentChapter(r.unitId).unit;const s=u.sections.find(x=>x.sectionId===r.sectionId);return r.version===catalog.corpusVersion&&r.sourceSha256===u.sourceSha256&&r.sourcePath===u.sourcePath&&s?.bodyMarkdown.includes(r.evidenceExcerpt)&&r.href===s.href;});
  const groupCounts=new Map();for(const r of response.results)groupCounts.set(r.intentId,(groupCounts.get(r.intentId)||0)+1);
  const limits=response.results.length<=6&&[...groupCounts.values()].every(n=>n<=3);
  const pass=check(response)&&evidenceValid&&limits;
  runs.push({id,query,pass,evidenceValid,limits,response});console.log(JSON.stringify({id,pass,status:response.status,mode:response.engineMode,targets:response.results.map(x=>x.unitId+'/'+x.sectionId)}));
 }
}finally{await closeContentRetrieval();}
const report={kind:'author_self_check_not_independent_acceptance',startedFromProductFiniteCases:true,nodeVersion:process.version,providerCalled:false,corpusVersion:catalog.corpusVersion,corpusHash:catalog.corpusHash,bookSha256:catalog.bookSha256,units:catalog.units.length,sourceBinding:binding,runs,pass:runs.every(x=>x.pass)};
writeFileSync(path.join(project,'team/app-v12-textbook-integration-retrieval-self-check.json'),JSON.stringify(report,null,2)+'\n');
if(!report.pass)process.exitCode=1;
