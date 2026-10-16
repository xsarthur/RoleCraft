// Independent v0.2 logic QA. Minimal form-aware DOM stub; no browser/real storage.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url));
const files=['index.html','app.js','curriculum-data.js'];
const content=Object.fromEntries(files.map(f=>[f,fs.readFileSync(path.join(dir,'../dist',f),'utf8')]));
const curriculum=JSON.parse(fs.readFileSync(path.join(dir,'curriculum-data.json'),'utf8'));
const checks=[];
const decode=v=>v.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&amp;/g,'&');
function harness({raw=null,hash='',writeError=false,confirm=true}={}){
 const nodes=new Map(),events={},windowEvents={},blobs=[],writes=[],history=[];
 const flags={writeError,confirm},storage=new Map(raw===null?[]:[['rolecraft-v1',raw]]);
 function node(id){if(!nodes.has(id)){
  const n={id,name:'',value:'',textContent:'',dataset:{},attrs:{},checked:false,hidden:false,
   classList:{add(){},remove(){},toggle(){}},
   setAttribute(k,v){this.attrs[k]=v;},removeAttribute(k){delete this.attrs[k];},
   focus(){n.focused=true;},click(){},scrollIntoView(){},
   showModal(){this.open=true;},close(){this.open=false;},addEventListener(t,fn){this[t]=fn;},querySelector:node,
  };let html='';Object.defineProperty(n,'innerHTML',{get(){return html;},set(v){html=v;if(id==='app')parseForm(v);else if(id==='reflection-type'||id==='reflection-artifactId')n.value=selectedOption(v);}});nodes.set(id,n);
 }return nodes.get(id);}
 function selectedOption(html){const options=[...html.matchAll(/<option\b([^>]*)>([\s\S]*?)<\/option>/g)];const option=options.find(o=>/\bselected\b/.test(o[1]))||options[0];return option?decode(/value="([^"]*)"/.exec(option[1])?.[1]??option[2]):'';}
 function parseForm(html){const match=/<form id="reflection-form"[^>]*>([\s\S]*?)<\/form>/.exec(html);node('reflection-form').elements=match?{}:null;if(!match)return;for(const element of match[1].matchAll(/<input\b([^>]*)>|<(textarea|select)\b([^>]*)>([\s\S]*?)<\/\2>/g)){
  const tag=element[2]||'input',attributes=element[1]??element[3],inner=element[4]||'';const id=/id="([^"]*)"/.exec(attributes)?.[1],name=/name="([^"]*)"/.exec(attributes)?.[1];if(!id||!name)continue;const n=node(id);n.name=name;n.value=tag==='select'?selectedOption(inner):tag==='textarea'?decode(inner):decode(/value="([^"]*)"/.exec(attributes)?.[1]||'');n.closest=selector=>selector==='#reflection-form'?node('reflection-form'):null;node('reflection-form').elements[name]=n;
 }}
 const context=vm.createContext({
  document:{getElementById:node,querySelectorAll(selector){if(selector==='nav button')return ['home','path','book','projects','standards','curriculum','reflections','sources'].map(v=>{const n=node('nav-'+v);n.dataset.view=v;return n;});return[];},addEventListener(t,fn){events[t]=fn;},createElement:node},
  window:{scrollY:0,scrollTo(){},confirm(){return flags.confirm;},addEventListener(t,fn){windowEvents[t]=fn;}},
  location:{hash},history:{pushState(...args){history.push(args);context.location.hash=args[2];}},
  localStorage:{getItem(k){return storage.get(k)??null;},setItem(k,v){if(flags.writeError)throw Error('qa simulated quota');storage.set(k,v);writes.push(v);}},
  FormData:class{constructor(form){this.form=form;}get(k){return this.form.elements?.[k]?.value??'';}},
  Blob:class{constructor(parts,opts){this.parts=parts;this.type=opts.type;blobs.push(this);}},
  URL:{createObjectURL(){return'blob:qa-v02-only';},revokeObjectURL(){}},setTimeout(){return 1;},clearTimeout(){},
 });
 vm.runInContext(content['curriculum-data.js'],context,{filename:'curriculum-data.js'});
 vm.runInContext(content['app.js'],context,{filename:'app.js'});
 const run=code=>vm.runInContext(code,context);
 const click=dataset=>events.click({target:{closest:()=>({dataset})}});
 function field(name,value,event='input'){const n=node('reflection-'+name);n.value=value;if(event)events[event]({target:n});}
 function submit(){events.submit({preventDefault(){},target:node('reflection-form')});}
 return{run,click,field,submit,node,events,windowEvents,flags,storage,writes,blobs,history,context};
}
function test(id,label,fn){try{fn();checks.push({id,label,status:'PASS'});}catch(error){checks.push({id,label,status:'FAIL',error:error.message,actual:error.actual,expected:error.expected});}}
function fill(h,overrides={}){for(const [k,v]of Object.entries({artifactId:'foundation',goal:'中文目标',result:'中文实际结果',...overrides}))h.field(k,v,k==='artifactId'?'change':'input');}
function saved(h){return JSON.parse(h.run('JSON.stringify(state.reflections)'));}
function resetDraft(h){h.click({action:'discard-reflection'});}

test('V01','Script order and curriculum JSON parity',()=>{assert.ok(content['index.html'].indexOf('src="curriculum-data.js"')<content['index.html'].indexOf('src="app.js"'));const h=harness();assert.deepEqual(JSON.parse(h.run('JSON.stringify(curriculum)')),curriculum);});
test('V02','Three added pages render with draft status',()=>{const h=harness();for(const view of ['standards','curriculum','reflections']){h.run(`navigate('${view}')`);assert.match(h.node('app').innerHTML,/<h1>/);assert.match(h.node('app').innerHTML,view==='reflections'?/自述不代表独立审核/:/草案/);}});
test('V03','Competency matrix includes all valid module buttons',()=>{const h=harness({hash:'#standards'});for(const m of curriculum.modules)assert.ok(h.node('app').innerHTML.includes(`data-module="${m.id}"`),m.id);assert.match(h.node('app').innerHTML,/企业公开岗位描述/);assert.match(h.node('app').innerHTML,/官方技术参考/);});
test('V04','Curriculum maps 12 modules, 8 samples and 4 missing-text modules',()=>{const h=harness({hash:'#curriculum'});for(const m of curriculum.modules)assert.ok(h.node('app').innerHTML.includes(`module-title-${m.id}`));assert.equal((h.node('app').innerHTML.match(/data-lesson=/g)||[]).length,8);assert.equal((h.node('app').innerHTML.match(/<p>完整教材待编写<\/p>/g)||[]).length,4);assert.match(h.node('app').innerHTML,/九项教材结构/);});
test('V05','Module and chapter links create deep locations',()=>{const h=harness();h.click({module:'e03'});assert.equal(h.run('selectedModule'),'e03');assert.equal(h.context.location.hash,'#curriculum/e03');h.click({lesson:'tools'});assert.equal(h.context.location.hash,'#book/tools');assert.equal(h.run('selected'),'tools');});
test('V06','Eight visible navigation labels',()=>{const text=content['index.html'];for(const label of ['学习概览','职业路线','我的教材','项目工坊','能力标准','课程地图','复盘中心','知识来源'])assert.ok(text.includes(label));});
test('V07','Learning chapter and exercise prefill object/version',()=>{for(const type of ['chapter','exercise']){const h=harness();h.click({reflect:type,artifact:'tools'});assert.equal(h.run('view'),'reflections');assert.equal(h.run('state.reflectionDraft.type'),type);assert.equal(h.node('reflection-artifactId').value,'tools');assert.equal(h.node('reflection-version').value,'sample-0.1');}});
test('V08','Learning project prefill',()=>{const h=harness();h.click({reflect:'project',artifact:'p2'});assert.equal(h.run('state.reflectionDraft.type'),'project');assert.equal(h.node('reflection-artifactId').value,'p2');assert.equal(h.node('reflection-version').value,'project-draft-0.2');});
test('V09','Employee selection forces deliverable type and role/version',()=>{const h=harness();h.click({action:'new-reflection'});h.field('kind','employee','change');h.field('artifactId','application','change');assert.equal(h.node('reflection-type').value,'deliverable');assert.equal(h.node('reflection-ownerRole').value,'软件工程师');assert.equal(h.node('reflection-version').value,'prototype-0.2');h.field('goal','工程目标');h.field('result','工程证据');h.submit();assert.equal(saved(h)[0].ownerRole,'软件工程师');});
test('V10','Missing artifact/goal/result independently reject with first-invalid field',()=>{for(const key of ['artifactId','goal','result']){const h=harness();h.click({action:'new-reflection'});fill(h);h.field(key,'',key==='artifactId'?'change':'input');h.submit();assert.equal(saved(h).length,0);assert.equal(h.node('reflection-'+key).attrs['aria-invalid'],'true');assert.match(h.node('reflection-feedback').textContent,/未保存/);}});
test('V11','Optional evidence/cause/retest may remain unknown',()=>{const h=harness();h.click({action:'new-reflection'});fill(h);h.submit();assert.equal(saved(h).length,1);assert.equal(saved(h)[0].retestResult,'');assert.match(h.node('app').innerHTML,/未复验/);});
test('V12','Multiple learning/employee records coexist',()=>{const h=harness();h.click({action:'new-reflection'});fill(h);h.submit();resetDraft(h);h.click({reflect:'deliverable',artifact:'application'});fill(h,{artifactId:'application',goal:'工程目标',result:'工程结果'});h.submit();assert.equal(saved(h).length,2);assert.equal(saved(h)[0].kind,'learning');assert.equal(saved(h)[1].kind,'employee');assert.notEqual(saved(h)[0].id,saved(h)[1].id);});
test('V13','Editing retains ID and does not overwrite another record',()=>{const h=harness();h.click({action:'new-reflection'});fill(h);h.submit();const first=saved(h)[0];resetDraft(h);h.click({reflect:'project',artifact:'p1'});fill(h,{artifactId:'p1',goal:'第二目标',result:'第二结果'});h.submit();const second=saved(h)[1];h.click({editReflection:first.id});h.field('result','编辑后的结果');h.submit();assert.equal(saved(h).length,2);assert.equal(saved(h)[0].id,first.id);assert.equal(saved(h)[0].result,'编辑后的结果');assert.deepEqual(saved(h)[1],second);});
test('V14','Refresh restores all reflection fields and existing learning records',()=>{const h=harness();h.run("state.passed=['tools'];state.notes.p1='旧备注';state.checks.p1=[0]");h.click({reflect:'deliverable',artifact:'application'});fill(h,{artifactId:'application'});for(const[k]of JSON.parse(h.run('JSON.stringify(reflectionFields)')))h.field(k,k==='plannedDate'?'2026-10-12':k+'中文证据');h.field('version','revision-123');h.field('selfStatus','已改进','change');h.submit();const r=saved(h);const reload=harness({raw:h.storage.get('rolecraft-v1'),hash:'#reflections'});assert.deepEqual(saved(reload),r);assert.equal(reload.run('state.notes.p1'),'旧备注');assert.ok(reload.run("state.passed.includes('tools')"));assert.equal(reload.run('state.checks.p1[0]'),0);});
test('V15','Chinese/HTML content is preserved and safely escaped',()=>{const h=harness();h.click({action:'new-reflection'});const payload='中文</textarea><img src=x onerror=alert(1)>\"\'&';fill(h,{goal:payload,result:payload});h.submit();assert.equal(saved(h)[0].goal,payload);const html=h.node('app').innerHTML;assert.ok(!html.includes('<img src=x onerror=alert(1)>'));assert.ok(html.includes('中文&lt;/textarea&gt;'));});
test('V16','Export preserves every field, ID, type, version, role, date and states',()=>{const h=harness();h.click({reflect:'deliverable',artifact:'application'});fill(h,{artifactId:'application'});for(const[k]of JSON.parse(h.run('JSON.stringify(reflectionFields)')))h.field(k,k==='plannedDate'?'2026-10-12':k+'中文测试');h.field('version','revision-xyz');h.field('selfStatus','待复验','change');h.submit();h.run('exportReflections()');const text=h.blobs[0].parts.join('');for(const[k]of JSON.parse(h.run('JSON.stringify(reflectionFields)')))assert.ok(text.includes(k==='plannedDate'?'2026-10-12':k+'中文测试'),k);for(const t of ['revision-xyz','软件工程师','application','独立审核状态：未独立审核','自述状态：待复验',saved(h)[0].id,saved(h)[0].createdAt])assert.ok(text.includes(t),t);});
test('V17','Self report and retest success never grant independent review',()=>{const h=harness();h.click({action:'new-reflection'});fill(h);h.field('selfStatus','已改进','change');h.field('retestResult','全部通过，已经优秀');h.submit();assert.equal(saved(h)[0].independentReview,'未独立审核');assert.match(h.node('app').innerHTML,/独立审核：未独立审核/);});
test('V18','Forged stored review states, invalid IDs and duplicates normalize',()=>{const raw={reflections:[{id:'same',kind:'learning',type:'chapter',artifactId:'foundation',independentReview:'专家通过',selfStatus:'认证通过'},{id:'same',artifactId:'models'},{id:'bad',artifactId:'missing',ownerRole:'管理员'}],checks:{p1:[0,0,99,-1]},passed:['tools','tools','unknown'],notes:{p1:{bad:true}}};const h=harness({raw:JSON.stringify(raw),hash:'#reflections'});assert.equal(saved(h).length,2);assert.equal(saved(h)[0].independentReview,'未独立审核');assert.equal(saved(h)[0].selfStatus,'待改进');assert.equal(saved(h)[1].artifactId,'');assert.equal(h.run('state.checks.p1.length'),1);assert.equal(h.run('state.passed.length'),1);assert.equal(h.run('state.notes.p1'),'');h.run('exportReflections();exportPlan()');assert.equal(h.blobs.length,2);});
test('V19','Input save failure keeps form/draft and supports export/recovery',()=>{const h=harness();h.click({action:'new-reflection'});h.flags.writeError=true;fill(h);h.field('evidence','失败仍需保留的证据');assert.equal(h.node('reflection-evidence').value,'失败仍需保留的证据');assert.equal(h.run('state.reflectionDraft.evidence'),'失败仍需保留的证据');assert.match(h.node('save-status').textContent,/保存失败/);h.run('exportReflections()');assert.match(h.blobs[0].parts.join(''),/失败仍需保留的证据/);h.flags.writeError=false;h.submit();assert.equal(saved(h).length,1);assert.equal(h.run('storageAvailable'),true);assert.match(h.node('save-status').textContent,/已保存/);});
test('V20','Submitted save failure keeps memory record and input/export',()=>{const h=harness();h.click({action:'new-reflection'});fill(h);h.flags.writeError=true;h.submit();assert.equal(saved(h).length,1);assert.equal(h.node('reflection-goal').value,'中文目标');assert.equal(h.run('storageAvailable'),false);assert.match(h.node('reflection-feedback').textContent,/保存失败/);h.run('exportReflections()');assert.match(h.blobs[0].parts.join(''),/中文目标/);});
test('V21','Dirty draft navigation cancel/allow preserves input',()=>{const h=harness();h.click({action:'new-reflection'});fill(h);h.flags.confirm=false;h.run("navigate('curriculum')");assert.equal(h.run('view'),'reflections');h.flags.confirm=true;h.run("navigate('curriculum'); navigate('reflections')");assert.equal(h.node('reflection-goal').value,'中文目标');});
test('V22','Popstate restores selected chapter and clears quiz feedback',()=>{const h=harness();h.click({lesson:'tools'});h.click({choice:'1'});h.click({action:'quiz'});h.context.location.hash='#book/state';h.windowEvents.popstate();assert.equal(h.run('selected'),'state');assert.equal(h.run('quizResult'),null);});
test('V23','New reflection after saved record starts blank rather than old form',()=>{const h=harness();h.click({action:'new-reflection'});fill(h,{goal:'旧目标',result:'旧结果'});h.submit();h.click({action:'new-reflection'});assert.equal(h.node('reflection-artifactId').value,'');assert.equal(h.node('reflection-goal').value,'');assert.equal(h.node('reflection-result').value,'');});
test('V24','Starting different object within reflection center keeps new object',()=>{const h=harness();h.click({reflect:'chapter',artifact:'foundation'});fill(h);h.submit();h.click({reflect:'project',artifact:'p2'});assert.equal(h.node('reflection-type').value,'project');assert.equal(h.node('reflection-artifactId').value,'p2');assert.equal(h.node('reflection-version').value,'project-draft-0.2');});
test('V25','Failed submitted save remains guarded before closing',()=>{const h=harness();h.click({action:'new-reflection'});fill(h);h.flags.writeError=true;h.submit();let prevented=false;h.windowEvents.beforeunload({preventDefault(){prevented=true;}});assert.equal(prevented,true);});
test('V26','Nine structure sections and unimplemented review states are rendered',()=>{const h=harness({hash:'#curriculum'});for(const s of curriculum.chapterStructure.sections)assert.ok(h.node('app').innerHTML.includes(s.title),s.id);for(const word of ['示例测试：未实施','教学审核：未实施','专家审核未完成'])assert.ok(h.node('app').innerHTML.includes(word),word);});

for(const t of checks)console.log(`${t.status} ${t.id} ${t.label}${t.error?': '+t.error.split('\n')[0]:''}`);
for(const t of checks.filter(t=>t.status==='FAIL'))console.log('FAIL_DETAILS '+JSON.stringify({id:t.id,actual:t.actual,expected:t.expected}));
const fail=checks.filter(t=>t.status==='FAIL').length;
console.log(`TOTAL ${checks.length}; PASS ${checks.length-fail}; FAIL ${fail}`);
for(const f of files)console.log(`SHA256 ${f} ${crypto.createHash('sha256').update(content[f]).digest('hex')}`);
console.log('Scope: form-aware VM only; no real browser/layout/storage/network or application modifications.');
process.exitCode=fail?1:0;
