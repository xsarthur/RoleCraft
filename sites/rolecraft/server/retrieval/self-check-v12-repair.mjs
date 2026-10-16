import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {recommendContent,getContentCatalog,getContentChapter,closeContentRetrieval} from './index.mjs';
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const hash=name=>createHash('sha256').update(readFileSync(path.join(project,name))).digest('hex');
const cases=[
 ['QI12-RET01','保存的偏好后来被证明是错的，依赖这条记忆的结果应该怎样撤回？',r=>r.results.some(x=>x.unitId==='n02-context-memory-prompt'&&x.sectionTitle==='3 错误记忆要沿来源和依赖撤回')],
 ['QI12-RET02','A2A 和 MCP 的交接边界有什么区别，多个 Agent 怎样保留控制责任？',r=>r.results.some(x=>x.unitId==='n07-multiagent-a2a')],
 ['QI12-RET03','英文任务正常，中文任务失败，怎样找到第一处证据偏离并交给另一位工程师复现？',r=>r.results.some(x=>x.unitId==='n10-evaluation-projects'&&x.sectionTitle==='英文正常、中文失败：找第一处证据偏离')&&r.results.some(x=>x.unitId==='n10-evaluation-projects'&&x.sectionTitle==='技术移交是一次接收方实验')],
 ['ambiguous-memory','我想让系统记住之前的东西，应该学哪里？',r=>r.status==='needs_clarification'],
 ['old-recovery','程序崩了以后怎么接着干，又不把已经做过的事情再做一遍？',r=>r.results[0]?.unitId==='e01'],
 ['old-multi','想知道中断后不重复做事，以及整个任务一共花了多少钱。',r=>r.results.some(x=>x.unitId==='e01')&&r.results.some(x=>x.unitId==='e05')],
 ['negation','先不看 ReAct，我只想知道中断后怎样继续。',r=>r.results[0]?.unitId==='e01'&&!r.results.some(x=>x.intentId==='react_strategy')]
];
const catalog=getContentCatalog(),runs=[];
try{
 for(const [id,query,check] of cases){
  const response=await recommendContent({query,corpusVersion:'textbook-v12'});
  const evidenceValid=response.corpusVersion===catalog.corpusVersion&&response.corpusHash===catalog.corpusHash&&response.results.every(r=>{const u=getContentChapter(r.unitId).unit;const s=u.sections.find(x=>x.sectionId===r.sectionId);return r.version===catalog.corpusVersion&&r.sourceSha256===u.sourceSha256&&r.sourcePath===u.sourcePath&&s?.bodyMarkdown.includes(r.evidenceExcerpt)&&r.href===s.href;});
  const counts=new Map();for(const r of response.results)counts.set(r.intentId,(counts.get(r.intentId)||0)+1);const limits=response.results.length<=6&&[...counts.values()].every(n=>n<=3);
  const pass=check(response)&&evidenceValid&&limits;runs.push({id,query,pass,evidenceValid,limits,response});console.log(JSON.stringify({id,pass,status:response.status,targets:response.results.map(x=>x.unitId+'/'+x.sectionId)}));
 }
}finally{await closeContentRetrieval();}
const files=['dist/content-retrieval-core.js','server/retrieval/index.mjs','server/retrieval/semantic.mjs','server/retrieval/content-v12-index.json','server/retrieval/vectors-v12.json','server/retrieval/intent-vectors-v12.json'];
const report={kind:'author_repair_check_not_independent_acceptance',scope:'three_independent_defects_and_four_adjacent_controls',nodeVersion:process.version,corpusVersion:catalog.corpusVersion,corpusHash:catalog.corpusHash,sourceBinding:Object.fromEntries(files.map(f=>[f,hash(f)])),runs,pass:runs.every(x=>x.pass)};
writeFileSync(path.join(project,'team/app-v12-textbook-integration-retrieval-repair-check.json'),JSON.stringify(report,null,2)+'\n');if(!report.pass)process.exitCode=1;
