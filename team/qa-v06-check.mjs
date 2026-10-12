// Independent QA for v06 c01 pilot and preserved full v05 source.
// VM uses synthetic storage/DOM. No real browser storage, accounts, DB or provider calls.
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url)),root=path.join(dir,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8'),json=p=>JSON.parse(read(p));
const digest=p=>crypto.createHash('sha256').update(read(p)).digest('hex');
const clone=x=>JSON.parse(JSON.stringify(x));
const chapterIds=['f01','f02','c01','c02','c03','e01','e02','e03','e04','e05','p01','p02'];
const sectionIds=['scope','outcomes','concepts','case','example','practice','validation','sources','reflection'];
const checks=[];
const chosen=process.argv.find(a=>a.startsWith('--only='))?.slice(7).split(',');
async function test(id,label,fn){if(chosen&&!chosen.includes(id))return;try{await fn();checks.push({id,label,status:'PASS'});}catch(e){checks.push({id,label,status:'FAIL',error:e.message+(e.cause?.code?' [cause='+e.cause.code+']':'')});}}
function harness({hash='#book/agent',raw=null,overrides={},omit=[]}={}){
 const nodes=new Map(),events={},windowEvents={},storage=new Map(raw===null?[]:[['rolecraft-v1',raw]]),writes=[],history=[],blobs=[];
 const decode=s=>s.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&amp;/g,'&');
 function node(id){if(!nodes.has(id)){const n={id,name:'',value:'',textContent:'',dataset:{},attrs:{},hidden:false,isConnected:true,
 classList:{add(){},remove(){},toggle(){}},setAttribute(k,v){this.attrs[k]=v;},removeAttribute(k){delete this.attrs[k];},focus(){this.focused=true;},click(){},scrollIntoView(){},showModal(){this.open=true;},close(){this.open=false;},querySelector:node,addEventListener(t,f){this[t]=f;}};
 let html='';Object.defineProperty(n,'innerHTML',{get(){return html;},set(v){html=v;if(id==='app')parseForms(v);}});nodes.set(id,n);}return nodes.get(id);}
 function parseForms(html){for(const id of ['reflection-form','product-review-form']){const m=new RegExp('<form id="'+id+'"[^>]*>([\\s\\S]*?)<\\/form>').exec(html);node(id).elements=m?{}:null;if(!m)continue;for(const f of m[1].matchAll(/<input\b([^>]*)>|<(textarea|select)\b([^>]*)>([\s\S]*?)<\/\2>/g)){const attr=f[1]??f[3],tag=f[2]||'input',fid=/id="([^"]*)"/.exec(attr)?.[1],name=/name="([^"]*)"/.exec(attr)?.[1];if(!fid||!name)continue;const n=node(fid);n.name=name;const options=[...(f[4]||'').matchAll(/<option\b([^>]*)>([\s\S]*?)<\/option>/g)],option=options.find(x=>/\bselected\b/.test(x[1]))||options[0];n.value=decode(tag==='select'?(option?/value="([^"]*)"/.exec(option[1])?.[1]??option[2]:''):tag==='textarea'?f[4]||'':/value="([^"]*)"/.exec(attr)?.[1]||'');n.closest=s=>s==='#'+id?node(id):null;node(id).elements[name]=n;}}}
 const QaURL=class extends URL{};QaURL.createObjectURL=()=> 'blob:qa-v06';QaURL.revokeObjectURL=()=>{};
 const context=vm.createContext({
 document:{getElementById:node,querySelectorAll(s){return s==='nav button'?['home','path','book','projects','standards','curriculum','reflections','sources','creation','product-review','generation'].map(v=>Object.assign(node('nav-'+v),{dataset:{view:v}})):[];},addEventListener(t,f){(events[t]??=[]).push(f);},createElement:node},
 window:{scrollY:0,scrollTo(){},confirm(){return true;},addEventListener(t,f){(windowEvents[t]??=[]).push(f);}},
 location:{hash,protocol:'http:'},history:{pushState(...a){history.push(a);context.location.hash=a[2];}},
 localStorage:{getItem(k){return storage.get(k)??null;},setItem(k,v){storage.set(k,v);writes.push({k,v});}},
 FormData:class{constructor(f){this.f=f;}get(k){return this.f.elements?.[k]?.value??'';}*[Symbol.iterator](){for(const [k,v]of Object.entries(this.f.elements||{}))yield[k,v.value];}},
 Blob:class{constructor(parts,opts){this.parts=parts;this.type=opts.type;blobs.push(this);}},URL:QaURL,AbortController,crypto,
 setTimeout(){return 1;},clearTimeout(){},fetch(){throw Error('No network in textbook QA VM');}
 });
 const globals={'curriculum-data.js':'curriculumData','product-gates-data.js':'productGatesData','creation-path-data.js':'creationPathData','product-audit-data.js':'productAuditData','generation-curriculum-data.js':'generationCurriculumData','textbook-v05-data.js':'textbookV05Data','textbook-v05-content-review-data.js':'textbookV05ContentReviewData','textbook-data.js':'textbookData','textbook-content-review-data.js':'textbookContentReviewData'};
 for(const name of [...Object.keys(globals),'generation.js','textbook-pilot.js','textbook.js','app.js']){if(omit.includes(name))continue;const p=path.join(root,'dist',name);if(!fs.existsSync(p))continue;let code=read('dist/'+name);for(const [key,value] of Object.entries(overrides)){const expression=new RegExp('(?:const|let) '+key+'\\s*=\\s*[\\s\\S]*?;(?=\\n|$)');if(expression.test(code))code=code.replace(expression,()=> 'const '+key+'='+JSON.stringify(value)+';');}vm.runInContext(code,context,{filename:name});}
 const run=code=>vm.runInContext(code,context);const click=dataset=>{for(const f of events.click||[])f({target:{closest(selector){return selector==='button'||selector==='[data-textbook-anchor]'&&dataset.textbookAnchor?{dataset}:null;}},preventDefault(){}});};
 return {context,run,node,click,events,windowEvents,storage,writes,history,blobs};
}
export {harness as createTextbookHarness};
const pilotVersion='textbook-draft-0.6-pilot',productVersion='local-mvp-0.6-textbook-pilot';
const specHash='d26744412162ac73416ff3ba3585470d118d61800d4477e72bb42715c4762925';
const oldHash='bec38479047f9158ac0b218c3e3b921601a5ab90ed5caeddb9c1e370562796fd';
// Synthetic only: tests renderer contracts, never author quality or actual learning.
function fixture(){
 const book=clone(json('team/textbook-v05.json')),spec=json('team/textbook-v06-spec.json');
 book.version=pilotVersion;const c=book.chapters.find(c=>c.id==='c01');c.version=pilotVersion;c.readingTitle='Agent 控制循环';
 c.readingIntro={problem:'QA 合成主问题',learningOutcome:'QA 合成动作',prerequisiteSummary:'先修 f02',caseSummary:'小林 / 海岚商城 / 星河耳机，QA 合成场景'};
 c.chapterCase={names:spec.pilotCase.names,contentOrigin:'QA synthetic, not authored'};
 c.readingLessons=spec.pilotReadingLessons.map(l=>({...l,bodyMarkdown:'QA 独立合成正文 '+l.id+'。\n\n第二段解释。',checkQuestion:'QA 合成题 '+l.id,checkAnswer:'QA 合成解 '+l.id}));
 return book;
}
function fixtureHarness(options={}){
 const overrides={textbookData:fixture(),textbookPackageMeta:{sourceSha256:'a'.repeat(64),sourcePath:'QA synthetic'},...options.overrides};
 return harness({...options,overrides});
}
export async function runPreparationChecks(){
 checks.length=0;
 await test('P01','frozen spec, preserved original source and unmodified eight-gate standard',()=>{
  assert.equal(digest('team/textbook-v06-spec.json'),specHash);assert.equal(digest('team/textbook-v05.json'),oldHash);
  const old=json('team/product-audit-v05.json');assert.equal(digest('team/product-gates.json'),old.inputHashes['team/product-gates.json']);
 });
 await test('P02','missing current author is explicit; original full draft is independently available',()=>{
  const h=harness({overrides:{textbookData:null,textbookPackageMeta:null}});assert.equal(h.run('textbookData'),null);assert.match(h.node('app').innerHTML,/本轮c01示范正文尚未加载/);
  assert(!h.node('app').innerHTML.includes('textbook-pilot-lesson'));
  assert.deepEqual(JSON.parse(h.run('JSON.stringify(textbookV05Data)')),json('team/textbook-v05.json'));
  assert.equal(h.run('textbookV05PackageMeta.sourceSha256'),oldHash);
 });
 await test('P03','complete v05 c01 and twelve original chapters use distinct comparison routes',()=>{
  const h=harness({hash:'#book/agent/c01/original'}),book=json('team/textbook-v05.json');assert.equal(h.run('textbookReader.source'),'v05');
  for(const s of book.chapters.find(c=>c.id==='c01').sections)assert(h.node('app').innerHTML.includes('id="textbook-c01-'+s.id+'"'));
  assert(!h.node('app').innerHTML.includes('data-action="quiz"'));
  const all=harness({hash:'#book/agent/all/original'}).node('app').innerHTML;
  for(const id of chapterIds)assert(all.includes('id="textbook-chapter-'+id+'"'));
 });
 await test('P04','four synthetic full lessons precede closed evidence and retain teaching detail',()=>{
  const h=fixtureHarness(),html=h.node('app').innerHTML;assert.equal(h.run('currentProductVersion'),productVersion);
  const lessons=fixture().chapters.find(c=>c.id==='c01').readingLessons;
  for(const l of lessons){assert(html.includes('id="textbook-lesson-'+l.id+'"'));assert(html.includes(l.bodyMarkdown.split('\n')[0]));assert(html.includes(l.checkAnswer));}
  assert(html.indexOf('QA 独立合成正文')<html.indexOf('class="textbook-pilot-evidence"'));
  assert(html.includes('<details class="textbook-pilot-evidence"><summary>来源与验证说明'));
  assert(!html.includes('<details class="textbook-pilot-evidence" open'));
  for(const id of sectionIds)assert(html.includes('id="textbook-c01-'+id+'"'));
  assert.match(html,/人类行业专家审核和真实学习效果待完成/);
 });
 await test('P05','partial lessons, wrong order and unknown chapter never masquerade as full pilot',()=>{
  const a=fixture();a.chapters[2].readingLessons.pop();assert.match(fixtureHarness({overrides:{textbookData:a}}).node('app').innerHTML,/小课正文尚不完整/);
  const b=fixture();b.chapters[2].readingLessons.reverse();assert.match(fixtureHarness({overrides:{textbookData:b}}).node('app').innerHTML,/小课正文尚不完整/);
  assert.match(fixtureHarness({hash:'#book/agent/not-a-chapter'}).node('app').innerHTML,/章节不存在/);
 });
 await test('P06','comparison, current routes, anchors and exports leave synthetic original records untouched',()=>{
  const raw=JSON.stringify({profile:{level:'developer',goal:'product',hours:8},passed:['agent'],lastLesson:'tools',notes:{p1:'既有作品'},checks:{p1:[0]}}),h=fixtureHarness({raw}),state=h.run('JSON.stringify(state)'),written=h.writes.length;
  h.click({textbookChapter:'c01',textbookSource:'v05'});assert.equal(h.context.location.hash,'#book/agent/c01/original');
  h.click({textbookChapter:'all'});assert.equal(h.context.location.hash,'#book/agent/all/original');
  h.click({textbookChapter:'c01',textbookSource:'current'});assert.equal(h.context.location.hash,'#book/agent/c01');
  h.click({textbookAnchor:'textbook-lesson-c01-read-loop'});assert(h.node('h3,h4').focused);
  h.click({textbookDownload:'c01'});h.click({textbookDownload:'all',textbookDownloadSource:'v05'});
  assert.equal(h.writes.length,written);assert.equal(h.run('JSON.stringify(state)'),state);assert.equal(h.storage.get('rolecraft-v1'),raw);
  assert.equal(h.blobs.length,2);assert.equal(h.blobs[0].type,'text/markdown;charset=utf-8');
 });
 await test('P07','synthetic current and real original export exact prose, answers, nine sections and status',()=>{
  const h=fixtureHarness(),book=fixture(),old=json('team/textbook-v05.json'),current=h.run("textbookMarkdownExport('c01','current')"),original=h.run("textbookMarkdownExport('all','v05')");
  const c=book.chapters[2];for(const l of c.readingLessons)for(const k of ['coreQuestion','bodyMarkdown','checkQuestion','checkAnswer'])assert(current.includes(l[k]));
  for(const s of c.sections)assert(current.includes(s.bodyMarkdown));assert(current.includes(pilotVersion));
  for(const ch of old.chapters)for(const s of ch.sections)assert(original.includes(s.bodyMarkdown));
  assert(original.includes(oldHash));assert(original.includes(old.version));assert(!original.includes('QA 独立合成正文'));
  assert.match(current,/人类专家审核未完成，真实学习效果未验证/);
 });
 await test('P08','new lesson/case/title text and Markdown safely escape HTML and reject unsafe source URLs',()=>{
  const b=fixture(),bad='</div><img src=x onerror=alert(1)><script>QA_BAD</script>',c=b.chapters[2];
  c.readingTitle=bad;c.readingIntro.problem=bad;c.readingLessons[0].bodyMarkdown=bad;c.readingLessons[0].checkQuestion=bad;c.readingLessons[0].checkAnswer=bad;c.chapterCase.names.customer=bad;
  const h=fixtureHarness({overrides:{textbookData:b}}),html=h.node('app').innerHTML;assert(!html.includes('<script>QA_BAD'));assert(!html.includes('<img src=x'));assert(html.includes('&lt;script&gt;QA_BAD'));
  for(const url of ['javascript:alert(1)','data:text/html,xx','file:///private/xx','https://evil.invalid','https://u:p@www.anthropic.com/a','https://www.anthropic.com.evil.invalid/a']){h.context.input=url;assert.equal(h.run('textbookAllowedSource(input)'),null);}
 });
 await test('P09','synthetic c01 review only exact current version/hash; original review remains distinct',()=>{
  const r={textbookVersion:pilotVersion,inputSha256:'a'.repeat(64),status:'reviewed_with_limitations',reviewScope:{moduleIds:['c01'],limits:'QA synthetic only'},chapterResults:[{moduleId:'c01',status:'draft_review'}]},h=fixtureHarness({overrides:{textbookContentReviewData:r}});
  assert(h.run('textbookContentReview(textbookData)'));assert.match(h.run("textbookReviewHTML(textbookData,'e03')"),/不对本章重新授审核/);
  assert.equal(h.run('textbookContentReview(textbookV05Data).inputSha256'),oldHash);
  for(const key of ['textbookVersion','inputSha256']){const wrong=clone(r);wrong[key]='mismatch';assert.equal(fixtureHarness({overrides:{textbookContentReviewData:wrong}}).run('textbookContentReview(textbookData)'),null);}
 });
 await test('P10','historical audit and fabricated learner claims cannot approve current product on either reader',()=>{
  const previous=['product-audit-baseline.json','product-audit-v03.json','product-audit-v04.json','product-audit-v05.json'].map(f=>json('team/'+f)),raw=JSON.stringify({productReviews:[{id:'fake',independentReview:'通过',professionalReview:'专家通过'}]});
  for(const hash of ['#book/agent/c01','#book/agent/c01/original']){const h=fixtureHarness({hash,raw,overrides:{productAuditData:{reports:previous}}});assert.equal(h.run("matchingAudit('formal_learning_product')"),null);assert.match(h.run('productAuditSection()'),/当前版本未独立审计 · local-mvp-0.6-textbook-pilot/);assert.equal(h.run('state.productReviews[0].independentReview'),'未独立审核');assert.equal(h.run('state.productReviews[0].professionalReview'),'未专业审核');}
 });
 await test('P11','synthetic current audit stays current while reading original and rejects changed author hash',()=>{
  const report=clone(json('team/product-audit-v05.json'));report.productVersion=productVersion;report.textbookVersion=pilotVersion;report.textbookInputSha256='a'.repeat(64);
  Object.assign(report.staticVerification,{productVersion,textbookVersion:pilotVersion,textbookInputSha256:report.textbookInputSha256});
  const h=fixtureHarness({hash:'#book/agent/c01/original',overrides:{productAuditData:{reports:[report]}}});assert(h.run("matchingAudit('formal_learning_product')"));assert.match(h.run('productAuditSection()'),/独立功能结论：在明确范围内达标/);
  report.textbookInputSha256='b'.repeat(64);assert.equal(fixtureHarness({overrides:{productAuditData:{reports:[report]}}}).run("matchingAudit('formal_learning_product')"),null);
 });
 await test('P12','backend, generation curriculum and frozen original teaching standard remain unchanged',()=>{
  const old=json('team/product-audit-v05.json');
  for(const p of ['dist/generation.js','dist/generation-curriculum-data.js','server/index.mjs','server/generation/index.mjs','team/curriculum-data.json','team/product-gates.json'])assert.equal(digest(p),old.inputHashes[p],p);
 });
 for(const t of checks)console.log(t.status+' '+t.id+' '+t.label+(t.error?': '+t.error.split('\n')[0]:''));
 console.log('PREPARATION '+checks.length+'; PASS '+checks.filter(t=>t.status==='PASS').length+'; FAIL '+checks.filter(t=>t.status==='FAIL').length);
 console.log('Synthetic contracts only. Actual author quality, final package, c01 execution, review and audit remain pending. No real browser DOM/visual/keyboard/native-download or learner evidence.');
 return checks;
}
export async function runPublicCheck(){
 checks.length=0;
 await test('HTTP01','read-only public loopback health/root/pilot/current and preserved original assets equal disk',async()=>{
  const r=await fetch('http://127.0.0.1:4318/api/health');assert.equal(r.status,200);assert.equal((await r.json()).productVersion,'local-mvp-0.4');
  for(const f of ['index.html','textbook.js','textbook-pilot.js','textbook-data.js','textbook-v05-data.js','textbook-content-review-data.js','textbook-v05-content-review-data.js']){const x=await fetch('http://127.0.0.1:4318/'+f);assert.equal(x.status,200,f);assert.equal(await x.text(),read('dist/'+f),f);}
 });
 for(const t of checks)console.log(t.status+' '+t.id+' '+t.label+(t.error?': '+t.error:''));
 return checks;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){const result=process.argv.includes('--http')?await runPublicCheck():await runPreparationChecks();process.exitCode=result.some(t=>t.status==='FAIL')?1:0;}
