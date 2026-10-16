// Developer regression against the independently reported source-link failures.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../../..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const hash=name=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,name))).digest('hex');
const original=JSON.parse(read('team/agent-interview-answer-revision-qa/integration-data/link-label-result.json'));
const decode=text=>text.replace(/&(amp|lt|gt|quot|#39);/g,(_,name)=>({amp:'&',lt:'<',gt:'>',quot:'"','#39':"'"}[name]));
function inspect(prefix=''){
 const context={URL};vm.createContext(context);
 vm.runInContext(read(prefix+'dist/interview-answers-v1-data.js'),context);
 vm.runInContext(read(prefix+'dist/interview-answer-renderer.js'),context);
 const data=context.RolecraftInterviewAnswersV1,renderer=context.RolecraftInterviewAnswerRenderer;
 const rows=[];
 for(const item of data.items){
  const html=renderer.markdown(item.bodyMarkdown,item,{textbookBase:'index.html'});
  const actual=[...html.matchAll(/<a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].filter(match=>match[1].startsWith('index.html#learn/agent/')).map(match=>({href:decode(match[1]),label:decode(match[2].replace(/<[^>]*>/g,''))}));
  const expected=original.rows.filter(row=>row.id===item.id);
  assert.equal(actual.length,expected.length,item.id+' local link occurrence count');
  for(let i=0;i<expected.length;i++)rows.push({id:item.id,linkOccurrence:i+1,label:actual[i].label,expectedLabel:expected[i].label,actual:actual[i].href,expected:expected[i].expected,status:actual[i].href===expected[i].expected&&actual[i].label===expected[i].label?'pass':'fail'});
 }
 return {kind:'frontend_developer_regression_not_independent_qa',rendererVersion:renderer.version,answerSetSha256:data.answerSetSha256,checked:rows.length,failedCount:rows.filter(row=>row.status==='fail').length,affectedIds:[...new Set(rows.filter(row=>row.status==='fail').map(row=>row.id))],rows};
}
const beforePath=path.join(__dirname,'before-renderer-links.json');
if(!fs.existsSync(beforePath))fs.writeFileSync(beforePath,JSON.stringify(inspect('team/agent-interview-answer-revision-frontend/link-fix-01/received/'),null,2)+'\n');
if(process.argv.includes('--before-only')){console.log(JSON.stringify(JSON.parse(fs.readFileSync(beforePath)),(key,value)=>key==='rows'?undefined:value,2));process.exit(0);}
const result=inspect();
result.bindings=['dist/interview-answer-renderer.js','dist/interview-answers-v1-data.js'].map(file=>({path:file,sha256:hash(file)}));
fs.writeFileSync(path.join(__dirname,'after-renderer-links.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({...result,rows:undefined},null,2));
assert.equal(result.checked,372);
assert.equal(result.failedCount,0,'source labels must resolve to their own exact sections');
