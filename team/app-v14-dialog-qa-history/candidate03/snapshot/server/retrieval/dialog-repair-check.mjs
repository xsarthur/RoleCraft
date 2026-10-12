import {readFileSync,writeFileSync} from 'node:fs';
import {dialogContent,closeContentRetrieval,getContentChapter} from './index.mjs';
const review=JSON.parse(readFileSync(new URL('../../team/app-v14-dialog-qa-history/candidate01/manual-semantic-review.json',import.meta.url)));
const cases=review.defects.flatMap(d=>d.cases.map(c=>({id:c.case,defectId:d.id,query:c.query,expected:c.case==='HV14-06'?'unrelated':'answered'})));
const output=[];let failures=0;
for(const c of cases){const response=await dialogContent({query:c.query,corpusVersion:'textbook-v12'});const text=response.dialog.sentences.map(s=>s.text).join(' ');let sourceValid=true;for(const citation of response.dialog.citations){const chapter=getContentChapter(citation.unitId),section=chapter.unit.sections.find(s=>s.sectionId===citation.sectionId);if(!section||section.bodyMarkdown.slice(citation.quoteStart,citation.quoteEnd)!==citation.quote)sourceValid=false;}
 let semanticBasic=!/完整迁移|历史验证|下一节|未运行|这几个反例/.test(text);
 if(c.id==='HV14-01')semanticBasic&&=/账本|未决|核对|恢复/.test(text);
 if(c.id==='HV14-02')semanticBasic&&=/固定|冻结|配对|案例|比较|样本/.test(text);
 if(c.id==='HV14-04')semanticBasic&&=/重规划|失效|新证据|约束|规则/.test(text);
 if(c.id==='HV14-08')semanticBasic&&=/回执|查询|核对|未知|效果/.test(text);
 if(c.id==='HV14-10')semanticBasic&&=/反思|修正|原因|干预|假设|复验/.test(text);
 if(c.id==='HV14-03')semanticBasic&&=!/固定状态机|路径稳定|预先编更多分支/.test(text);
 const pass=response.dialog.status===c.expected&&sourceValid&&semanticBasic;if(!pass)failures++;output.push({...c,pass,sourceValid,semanticBasic,response});console.log(JSON.stringify({id:c.id,status:response.dialog.status,pass,answer:response.dialog.sentences.map(s=>s.text),targets:response.results.map(r=>r.unitId+'/'+r.sectionId)}));}
await closeContentRetrieval();writeFileSync(new URL('../../team/app-v14-dialog-retrieval-repair-check.json',import.meta.url),JSON.stringify({version:'dialog-owner-repair-check-2',at:new Date().toISOString(),node:process.version,failures,scope:'Published QA failed cases only; basic source/mechanism owner check, independent semantic judgment remains QA.',cases:output},null,2)+'\n');process.exitCode=failures?1:0;
