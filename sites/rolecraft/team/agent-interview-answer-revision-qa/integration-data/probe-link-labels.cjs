const fs=require('fs'),vm=require('vm'),path=require('path');
const out=path.resolve('sites/rolecraft/team/agent-interview-answer-revision-qa/integration-data');
const packageDir=process.argv[2]?path.resolve(process.argv[2]):path.join(out,'received/dist');
const context=vm.createContext({URL});
vm.runInContext(fs.readFileSync(path.join(packageDir,'interview-answers-v1-data.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(packageDir,'interview-answer-renderer.js'),'utf8'),context);
const norm=x=>String(x).replace(/[#\s`*·：:、，,。.!！?？（）()—–\-《》“”]/g,'').toLowerCase();
const short=x=>norm(x.replace(/^\d+(?:\.\d+)*\s+/,''));
const rows=[],unresolved=[];
// Q99's prose contains six human-readable abbreviated source labels; these are
// resolved against the same approved source references after reading the prose.
const q99Labels={'控制循环10.3节':'10.3 最关键的崩溃窗口','写工具“一个意图 多个协议调用与发送尝试”':'一个意图 多个协议调用与发送尝试','持久状态“三个提交点定义可恢复事实”':'三个提交点定义可恢复事实','控制循环第6节':'6 先核对未决动作','控制循环第9节':'9 并发要分开处理','写工具下游合同':'本地事务和下游接口各承担哪一半'};
for(const item of context.RolecraftInterviewAnswersV1.items){
 let index=0;
 for(const match of item.bodyMarkdown.matchAll(/\[([^\]]+)\]\(([^\s)]+)\)/g)){
  index++;const [raw,label,href]=match;if(!href.startsWith('../../v12/'))continue;
  const sourcePath=path.posix.normalize(path.posix.join(path.posix.dirname(item.answerPath),href));
  let candidates=item.sourceReferences.filter(ref=>ref.sourcePath===sourcePath&&(norm(label).endsWith(norm(ref.section))||norm(label).endsWith(short(ref.section))));
  if(item.id==='Q99'&&q99Labels[label])candidates=item.sourceReferences.filter(ref=>ref.sourcePath===sourcePath&&ref.section.startsWith(q99Labels[label]));
  const expectedTargets=[...new Set(candidates.map(ref=>ref.readingHref))];
  if(expectedTargets.length!==1){unresolved.push({id:item.id,index,label,href,candidates:expectedTargets});continue;}
  const html=context.RolecraftInterviewAnswerRenderer.markdown(raw,item,{textbookBase:'index.html'});
  const actual=html.match(/href="([^"]+)"/)?.[1]||'';
  const expected='index.html'+expectedTargets[0];
  rows.push({id:item.id,linkOccurrence:index,label,originalHref:href,actual,expected,status:actual===expected?'pass':'fail'});
 }
}
const failed=rows.filter(x=>x.status==='fail');
const result={version:'source-label-probe-1',scope:'Each of 372 actual local Markdown link occurrences resolves to the exact section named in the source label, cross-checked against approved sourceReferences; abbreviated Q99 prose labels manually resolved.',packageDir,status:failed.length||unresolved.length?'not_met':'met_within_tested_scope',checked:rows.length,failedCount:failed.length,affectedIds:[...new Set(failed.map(x=>x.id))],unresolved,rows};
fs.writeFileSync(path.join(out,process.argv[3]||'link-label-result.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:result.status,checked:rows.length,failed:failed.length,affectedIds:result.affectedIds.length,unresolved},null,2));
