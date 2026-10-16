const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve('sites/rolecraft/team/agent-interview-answer-revision-qa/integration-data');
const out=path.join(root,'r2'),c=vm.createContext({URL,structuredClone});
for(const f of ['interview-answers-v1-data.js','interview-answer-renderer.js'])vm.runInContext(fs.readFileSync(path.join(out,'received/dist',f),'utf8'),c);
const initial=vm.createContext({});vm.runInContext(fs.readFileSync(path.join(root,'received/dist/interview-answers-v1-data.js'),'utf8'),initial);
const pack=c.RolecraftInterviewAnswersV1,renderer=c.RolecraftInterviewAnswerRenderer;
const checks=[];
function check(id,pass,evidence){checks.push({id,status:pass?'pass':'fail',evidence});}
check('CONTENT-UNCHANGED-SINCE-R1',pack.answerSetSha256===initial.RolecraftInterviewAnswersV1.answerSetSha256&&pack.items.every(item=>{
 const prev=initial.RolecraftInterviewAnswersV1.byId[item.id];
 return item.bodyMarkdown===prev.bodyMarkdown&&item.answerSha256===prev.answerSha256&&item.answerVersion===prev.answerVersion&&item.question===prev.question;
}),{items:pack.items.length,answerSetSha256:pack.answerSetSha256});
const first=JSON.parse(fs.readFileSync(path.join(root,'link-label-result.json'),'utf8'));
const second=JSON.parse(fs.readFileSync(path.join(out,'link-label-result.json'),'utf8'));
const originalFails=first.rows.filter(x=>x.status==='fail');
check('ORIGINAL-118-RETEST',originalFails.length===118&&originalFails.every(old=>second.rows.some(now=>now.id===old.id&&now.linkOccurrence===old.linkOccurrence&&now.label===old.label&&now.status==='pass'&&now.expected===old.expected)),{oldFailCount:originalFails.length,oldAffectedAnswerCount:first.affectedIds.length,newFailCount:second.failedCount});
const externals=[];
for(const item of pack.items)for(const m of item.bodyMarkdown.matchAll(/\[([^\]]+)\]\(([^\s)]+)\)/g)){
 if(!/^https?:/.test(m[2]))continue;
 const html=renderer.markdown(m[0],item),actual=html.match(/href="([^"]+)"/)?.[1].replace(/&amp;/g,'&')||'';
 externals.push({id:item.id,label:m[1],original:m[2],actual,pass:actual===new URL(m[2]).href&&html.includes('target="_blank" rel="noopener noreferrer"')});
}
check('EXTERNAL-28-ACTUAL-HTML',externals.length===28&&externals.every(x=>x.pass),{count:externals.length,rows:externals});
const answer={sourceLinks:[{originalHref:'same.md',label:'first',occurrence:1,kind:'local_textbook',href:'#learn/agent/c03/s-one'},{originalHref:'same.md',label:'second',occurrence:2,kind:'local_textbook',href:'#learn/agent/c03/s-two'}]};
check('DISTINCT-LABELS-SELECT-EXACT-TARGET',renderer.textbookLink('same.md',answer,{}, {label:'first'})==='#learn/agent/c03/s-one'&&renderer.textbookLink('same.md',answer,{}, {label:'second'})==='#learn/agent/c03/s-two',{case:'same file, two declared labels, two declared sections'});
check('NO-LABEL-AMBIGUOUS-REJECTED',renderer.textbookLink('same.md',answer,{})==='',{case:'old URL-only lookup with multiple targets'});
check('UNKNOWN-LABEL-REJECTED',renderer.textbookLink('same.md',answer,{}, {label:'third'})===''&&!renderer.markdown('[third](same.md)',answer).includes('href='),{case:'missing exact label is not mapped to first target'});
const collision=structuredClone(answer);collision.sourceLinks[1].label='first';
check('SAME-LABEL-DIFFERENT-SECTION-REJECTED',renderer.textbookLink('same.md',collision,{}, {label:'first'})===''&&!renderer.markdown('[first](same.md)',collision).includes('href='),{case:'same label and raw URL cannot silently choose first differing target'});
check('OCCURRENCE-DISAMBIGUATION',renderer.textbookLink('same.md',collision,{}, {label:'first',occurrence:2})==='#learn/agent/c03/s-two'&&renderer.textbookLink('same.md',collision,{}, {label:'first',occurrence:3})==='',{case:'explicit declared occurrence identifies the exact tuple; undeclared occurrence rejected'});
const malformed=[];
for(const links of [null,{},'invalid',[]]){
 let pass=false;try{pass=renderer.textbookLink('same.md',{sourceLinks:links},{},{label:'first'})==='';}catch{}
 malformed.push({value:links,pass});
}
check('MALFORMED-MAPPING-REJECTED',malformed.every(x=>x.pass),{cases:malformed});
const protocols=[];
for(const href of ['javascript:alert(1)','data:text/html,Hi','file:///tmp/a','//evil.invalid/','https://user:pass@evil.invalid/x','https:\\evil.invalid\\x','https://evil.invalid/\nx']){
 const a={sourceLinks:[{originalHref:'probe',label:'bound',kind:'external',href}]};
 protocols.push({href,pass:renderer.textbookLink('probe',a,{}, {label:'bound'})===''&&!renderer.markdown('[bound](probe)',a).includes('href=')});
}
check('LABELLED-DANGEROUS-URLS-REJECTED',protocols.every(x=>x.pass),{cases:protocols});
const poisoned={sourceLinks:[{originalHref:'safe.md',label:'<img src=x onerror=alert(1)>',kind:'local_textbook',href:'#learn/agent/c03/s-one'}]};
const poisonHtml=renderer.markdown('[<img src=x onerror=alert(1)>](safe.md)',poisoned);
check('LABEL-HTML-ESCAPED',!poisonHtml.includes('<img')&&poisonHtml.includes('&lt;img')&&poisonHtml.includes('href='),{output:poisonHtml});
const result={version:'additional-probes-r2',status:checks.every(x=>x.status==='pass')?'met_within_tested_scope':'not_met',checks};
fs.writeFileSync(path.join(out,'additional-result.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:result.status,checks:checks.length,failed:checks.filter(x=>x.status==='fail')},null,2));
