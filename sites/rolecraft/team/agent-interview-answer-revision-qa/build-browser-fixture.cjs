// QA-only offline visual fixture. Never modifies application or approved answers.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');
const root = path.resolve('sites/rolecraft');
const out = path.join(root, 'team/agent-interview-answer-revision-qa/browser-fixture');
fs.mkdirSync(out,{recursive:true});
const ctx = vm.createContext({URL, URLSearchParams, structuredClone, console});
const inputs=[];
const read = p=>{const s=fs.readFileSync(path.join(root,p),'utf8');inputs.push({path:'sites/rolecraft/'+p,sha256:crypto.createHash('sha256').update(s).digest('hex')});return s;};
for(const f of ['content-v12-data.js','learning-v13-data.js','interview-answers-v1-data.js','interview-answer-renderer.js'])vm.runInContext(read('dist/'+f),ctx);
ctx.localStorage={getItem(){return null;},setItem(){throw Error('Unexpected fixture storage write');}};
ctx.location={hash:'#questions/Q99'};ctx.document={addEventListener(){}};
const client=read('dist/learning-experience-v13.js').replace('globalThis.LearningExperienceV13={','globalThis.__qaEvidenceHTML=evidenceHTML;globalThis.LearningExperienceV13={');
vm.runInContext(client,ctx);
const css=read('dist/interview-answer-reader.css');fs.writeFileSync(path.join(out,'interview-answer-reader.css'),css);
const ids=ctx.RolecraftInterviewAnswersV1.items.map(x=>x.id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const wrap=(id,html)=>'<!doctype html><html lang="zh-CN"><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>QA fixture '+id+'</title><link rel="stylesheet" href="interview-answer-reader.css"><style>body{font:16px/1.8 system-ui;margin:0;color:#262722;background:#f8f7f3}main{max-width:850px;margin:auto;padding:24px;background:white;min-width:0}nav{display:flex;flex-wrap:wrap;gap:8px;font-size:13px}blockquote{border-left:3px solid #aaa;padding-left:16px}code{overflow-wrap:anywhere}.test-only{background:#fff0cb;padding:10px}</style><main><p class="test-only">QA 隔离静态夹具，仅验证展示；不开放产品延期功能，不读写账户或浏览器记录。</p><nav>'+ids.map(x=>'<a href="'+x+'.html">'+x+'</a>').join(' ')+'</nav>'+html.replace(/href="#learn\//g,'href="http://127.0.0.1:4464/index.html#learn/')+'</main></html>';
for(const item of ctx.RolecraftInterviewAnswersV1.items){const q=ctx.RolecraftLearningV13.questions.find(q=>q.id===item.id);const html=q?ctx.__qaEvidenceHTML(q):ctx.RolecraftInterviewAnswerRenderer.answerHTML(item.id);fs.writeFileSync(path.join(out,item.id+'.html'),wrap(item.id,html));}
fs.writeFileSync(path.join(out,'index.html'),wrap('index','<h1>124 题实际渲染产物</h1><p>Q/M 使用当前内部 evidenceHTML 的完整解析＋原教材摘录。P 使用当前答案渲染器。上述私有函数只在内存中暴露，未修改应用文件。</p>'));
fs.writeFileSync(path.join(out,'fixture-binding.json'),JSON.stringify({createdAt:new Date().toISOString(),runtime:process.version,inputs,answers:ids.length,internalEvidenceCount:ctx.RolecraftLearningV13.questions.length,readOnly:true},null,2)+'\n');
console.log(JSON.stringify({files:ids.length,internalEvidence:ctx.RolecraftLearningV13.questions.length,out}));
