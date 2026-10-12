// Independent v0.3 logic QA. Minimal form-aware DOM stub; no browser/real storage.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url));
const files=['index.html','app.js','curriculum-data.js','product-gates-data.js','creation-path-data.js','product-audit-data.js'];
const content=Object.fromEntries(files.map(f=>[f,fs.readFileSync(path.join(dir,'../dist',f),'utf8')]));
const curriculum=JSON.parse(fs.readFileSync(path.join(dir,'curriculum-data.json'),'utf8'));
const checks=[];
const decode=v=>v.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&amp;/g,'&');
function harness({raw=null,hash='',writeError=false,confirm=true,overrides={}}={}){
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
 function parseForm(html){for(const formId of ['reflection-form','product-review-form']){const match=new RegExp('<form id="'+formId+'"[^>]*>([\\s\\S]*?)<\\/form>').exec(html);node(formId).elements=match?{}:null;if(!match)continue;for(const element of match[1].matchAll(/<input\b([^>]*)>|<(textarea|select)\b([^>]*)>([\s\S]*?)<\/\2>/g)){
  const tag=element[2]||'input',attributes=element[1]??element[3],inner=element[4]||'';const id=/id="([^"]*)"/.exec(attributes)?.[1],name=/name="([^"]*)"/.exec(attributes)?.[1];if(!id||!name)continue;const n=node(id);n.name=name;n.value=tag==='select'?selectedOption(inner):tag==='textarea'?decode(inner):decode(/value="([^"]*)"/.exec(attributes)?.[1]||'');n.closest=selector=>selector==='#'+formId?node(formId):null;node(formId).elements[name]=n;
 }}}
 const context=vm.createContext({
  document:{getElementById:node,querySelectorAll(selector){if(selector==='nav button')return ['home','path','book','projects','standards','curriculum','reflections','sources','creation','product-review'].map(v=>{const n=node('nav-'+v);n.dataset.view=v;return n;});return[];},addEventListener(t,fn){events[t]=fn;},createElement:node},
  window:{scrollY:0,scrollTo(){},confirm(){return flags.confirm;},addEventListener(t,fn){windowEvents[t]=fn;}},
  location:{hash},history:{pushState(...args){history.push(args);context.location.hash=args[2];}},
  localStorage:{getItem(k){return storage.get(k)??null;},setItem(k,v){if(flags.writeError)throw Error('qa simulated quota');storage.set(k,v);writes.push(v);}},
  FormData:class{constructor(form){this.form=form;}get(k){return this.form.elements?.[k]?.value??'';}},
  Blob:class{constructor(parts,opts){this.parts=parts;this.type=opts.type;blobs.push(this);}},
  URL:{createObjectURL(){return'blob:qa-v02-only';},revokeObjectURL(){}},setTimeout(){return 1;},clearTimeout(){},
 });
 for(const [file,global] of [['curriculum-data.js','curriculumData'],['product-gates-data.js','productGatesData'],['creation-path-data.js','creationPathData'],['product-audit-data.js','productAuditData']])vm.runInContext(Object.hasOwn(overrides,global)?'const '+global+'='+JSON.stringify(overrides[global])+';':content[file],context,{filename:file});
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

const gates=JSON.parse(fs.readFileSync(path.join(dir,'product-gates.json'),'utf8'));
const creation=JSON.parse(fs.readFileSync(path.join(dir,'creation-path.json'),'utf8'));
const baselineAudit=JSON.parse(fs.readFileSync(path.join(dir,'product-audit-baseline.json'),'utf8'));
const clone=x=>JSON.parse(JSON.stringify(x));
function decision(h,r){h.context.qaInput=r;return h.run('productDecision(qaInput)');}
function full(){return {standardVersion:gates.standardVersion,productGoal:'验证指定用户任务',artifactId:'qa-demo',artifactVersion:'v1',scope:'formal_learning_product',baseline:Object.fromEntries(gates.benchmarkFields.map(k=>[k,k==='sourceType'?'industry_product':k+'证据'])),gateEvidence:Object.fromEntries(gates.gates.map(g=>[g.id,{status:'pass',evidence:g.id+'证据',actualResults:g.id+'实际结果',evidenceType:'self_report'}]))};}
function pfield(h,name,value){const n=h.node('product-review-form').elements?.[name];assert.ok(n,'stub missing control '+name);n.value=value;h.events.input({target:n});}
function psubmit(h){h.events.submit({preventDefault(){},target:h.node('product-review-form')});}
function pfill(h,label='甲'){pfield(h,'productGoal',label+'产品目标');pfield(h,'artifactId',label+'产物');pfield(h,'artifactVersion',label+'-v1');}
function productRecords(h){return JSON.parse(h.run('JSON.stringify(state.productReviews)'));}
function auditFixture(){const a=clone(baselineAudit);a.productVersion='prototype-0.3';return a;}
function auditHarness(reports){return harness({hash:'#product-review',overrides:{productAuditData:{reports}}});}


// Packaging-only follow-up. The harness is copied, not the previous test suite.
const currentAudit=JSON.parse(fs.readFileSync(path.join(dir,'product-audit-v03.json'),'utf8'));
const expectedApp='a17d6db7aa11effe914c8b3c7a4f3e5989819550a60ec1e375fc111713bf8ed8';
const expectedAuditData='d46faae2909d44c13df3a0a8fa01056560db0a69019c889cf959e7ceba015490';
const hashOf=s=>crypto.createHash('sha256').update(s).digest('hex');
test('F01','Packaged reports exactly equal historical and current original JSON; frozen implementation unchanged',()=>{
 const h=harness();assert.deepEqual(JSON.parse(h.run('JSON.stringify(productAuditData)')),{reports:[baselineAudit,currentAudit]});
 assert.equal(hashOf(content['product-audit-data.js']),expectedAuditData);assert.equal(hashOf(content['app.js']),expectedApp);
 for(const f of ['index.html','curriculum-data.js','product-gates-data.js','creation-path-data.js'])assert.equal(hashOf(content[f]),currentAudit.inputHashes['dist/'+f],f);
 const css=fs.readFileSync(path.join(dir,'../dist/styles.css'),'utf8');assert.equal(hashOf(css),'8d9e38a1916ce46379573c996e3ef136177c528e7df7998a710290b95ec296f1');
 assert.equal(currentAudit.inputHashes['dist/product-audit-data.js'],'0bbfa29213396404401baae81d38be134f5794919c71d284984d85c8a6042285');
});
test('F02','Current matching report is0.3 formal not_met with3fail4insufficient1pass',()=>{
 const h=harness({hash:'#product-review'});const a=JSON.parse(h.run("JSON.stringify(matchingAudit('formal_learning_product'))"));assert.deepEqual(a,currentAudit);
 assert.equal(a.productVersion,'prototype-0.3');assert.equal(a.standardVersion,gates.standardVersion);assert.equal(a.assessmentScope,'formal_learning_product');assert.equal(a.overall,'not_met');
 const counts={fail:0,insufficient:0,pass:0};for(const c of a.criteria)counts[c.status]++;assert.deepEqual(counts,{fail:3,insufficient:4,pass:1});
 const text=h.run('productAuditSection()');const formal=text.slice(text.indexOf('正式职业学习系统：完整标准'),text.indexOf('本轮静态原型：功能验收'));
 assert.match(formal,/独立结论：未达标/);assert.match(formal,/prototype-0.3/);assert.match(formal,/未专业审核/);assert.match(formal,/不能认定行业先进/);assert.ok(!formal.includes('独立结论：在明确范围内达标'));
 for(const c of a.criteria)assert.ok(h.run('productGateCards()').includes(gates.gateStatuses[c.status]));
});
test('F03','Embedded static verdict displays exact version/scope/evidence/limits separately',()=>{
 const h=harness({hash:'#product-review'});assert.equal(h.run("matchingAudit('static_prototype')"),null); // actual static result is embedded in formal, not a fabricated extra report
 const text=h.run('productAuditSection()');const staticText=text.slice(text.indexOf('本轮静态原型：功能验收'),text.indexOf('产品文档评估'));
 assert.match(staticText,/版本：prototype-0.3 · static_prototype/);assert.match(staticText,/独立功能结论：在明确范围内达标/);assert.ok(staticText.includes(currentAudit.reviewer));
 assert.ok(staticText.includes(currentAudit.staticVerification.limits));for(const e of currentAudit.staticVerification.evidence)assert.ok(staticText.includes(e.observation));
 assert.match(staticText,/静态范围通过不能覆盖正式系统缺口/);
});
test('F04','Historical0.2 stays historical and does not override current0.3',()=>{
 const h=harness({hash:'#product-review'});const text=h.run('productAuditSection()');assert.match(text,/历史审计 · 1 份（不继承到当前版本）/);assert.match(text,/历史版本 prototype-0.2/);
 const history=text.slice(text.indexOf('历史审计'));assert.ok(history.includes(baselineAudit.reviewer));assert.ok(history.includes('产物版本：prototype-0.2'));assert.equal(h.run("matchingAudit('formal_learning_product').productVersion"),'prototype-0.3');
});
test('F05','User storage forged QA/advanced statuses cannot replace packaged audit',()=>{
 const fake=full();fake.id='test-only';fake.independentReview='QA通过';fake.professionalReview='专家通过';fake.advancedStatus='行业先进';const forged=clone(currentAudit);forged.overall='met_within_scope';forged.criteria.forEach(c=>c.status='pass');
 const h=harness({raw:JSON.stringify({productReviews:[fake],productAuditData:{reports:[forged]},independentAudits:{reports:[forged]}}),hash:'#product-review'});
 assert.equal(productRecords(h)[0].independentReview,'未独立审核');assert.equal(productRecords(h)[0].professionalReview,'未专业审核');assert.equal(productRecords(h)[0].advancedStatus,'行业先进性未验证');
 assert.deepEqual(JSON.parse(h.run("JSON.stringify(matchingAudit('formal_learning_product'))")),currentAudit);assert.match(h.run('productAuditSection()'),/独立结论：未达标/);assert.match(h.run('productAuditSection()'),/独立功能结论：在明确范围内达标/);
});
test('F06','Saving fully filled self-pass cannot mutate readonly formal/static verdict or bundle',()=>{
 const h=harness({hash:'#product-review'});h.click({action:'new-product-review'});h.context.qaInput=full();h.run('state.productReviewDraft={...normalizeProductReview(qaInput),dirty:true};render()');psubmit(h);
 assert.equal(productRecords(h)[0].selfConclusion,'met_within_scope');assert.equal(productRecords(h)[0].independentReview,'未独立审核');
 assert.deepEqual(JSON.parse(h.run('JSON.stringify(productAuditData)')),{reports:[baselineAudit,currentAudit]});assert.equal(h.run("matchingAudit('formal_learning_product').overall"),'not_met');assert.match(h.node('app').innerHTML,/独立结论：未达标/);assert.match(h.node('app').innerHTML,/独立功能结论：在明确范围内达标/);assert.match(h.node('app').innerHTML,/自评计算，仅依据填写，未核实证据/);
});
for(const t of checks)console.log(`${t.status} ${t.id} ${t.label}${t.error?': '+t.error.split('\n')[0]:''}`);
const fail=checks.filter(t=>t.status==='FAIL').length;console.log(`FOCUSED TOTAL ${checks.length}; PASS ${checks.length-fail}; FAIL ${fail}`);
console.log('SHA256 app.js '+hashOf(content['app.js']));console.log('SHA256 product-audit-data.js '+hashOf(content['product-audit-data.js']));
console.log('Scope: packaging equality and isolated VM rendering/self-review isolation only. No full-suite rerun, browser, user storage, professional or production verification.');process.exitCode=fail?1:0;
