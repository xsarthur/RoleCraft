// Isolated client developer fixtures. Not browser, model, HTTP, or independent QA.
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const files=['dist/learning-workbench.js','dist/learning-experience-v13.js','dist/learning-experience-v13.css','dist/app.js'];
const sha=file=>createHash('sha256').update(readFileSync(path.join(root,file))).digest('hex');
const classes=()=>{const values=new Set();return {toggle(k,v){const on=v??!values.has(k);if(on)values.add(k);else values.delete(k);return on;},add(k){values.add(k);},remove(k){values.delete(k);},contains:k=>values.has(k)};};
function runtime({sessionEntries=[],localEntries=[]}={}){
 const session=new Map(sessionEntries),local=new Map(localEntries),events=new Map(),nodes=new Map(),writes=[],requests=[];
 const storage=(m,p)=>({getItem:k=>m.get(k)??null,setItem(k,v){m.set(k,v);writes.push(p+':'+k);},removeItem(){throw Error('Fixture does not allow record deletion');}});
 const node=()=>({id:'',dataset:{},value:'',innerHTML:'',textContent:'',hidden:false,scrollTop:0,isConnected:true,attributes:{},classList:classes(),style:{setProperty(){}},setAttribute(k,v){this.attributes[k]=v;},removeAttribute(k){delete this.attributes[k];},hasAttribute(k){return Object.hasOwn(this.attributes,k);},addEventListener(){},focus(){document.activeElement=this;},scrollIntoView(){},querySelector:()=>node(),querySelectorAll:()=>[],setSelectionRange(){}});
 const document={documentElement:{style:{setProperty(){}}},activeElement:null,body:{classList:classes(),dataset:{},appendChild(n){nodes.set(n.id,n);}},addEventListener(n,f){events.set(n,[...(events.get(n)||[]),f]);},getElementById:n=>nodes.get(n)||null,querySelectorAll:()=>[],querySelector:sel=>nodes.get(sel)||null,createElement:()=>node()};
 const context=vm.createContext({document,location:{hash:'#home',protocol:'http:',href:'http://fixture/#home'},localStorage:storage(local,'local'),sessionStorage:storage(session,'session'),navigator:{},URL,URLSearchParams,Blob,Map,Set,AbortController,console,setTimeout(){return 1;},clearTimeout(){},requestAnimationFrame(fn){fn();return 1;},cancelAnimationFrame(){},fetch(url,options){return new Promise((resolve,reject)=>requests.push({url,options,resolve,reject}));}});
 for(const f of ['content-v10-data.js','content-v12-data.js','learning-workbench.js','learning-v13-data.js','learning-experience-v13.js'])vm.runInContext(readFileSync(path.join(root,'dist',f),'utf8'),context,{filename:f});
 const emit=(name,target,rest={})=>{for(const fn of events.get(name)||[])fn({target,preventDefault(){},...rest});};
 const click=(attribute,dataset={})=>{const n=node();n.dataset=dataset;n.hasAttribute=k=>k===attribute;n.closest=()=>n;emit('click',n);};
 const field=node();field.id='lw-query';nodes.set(field.id,field);const results=node();results.id='lw-find-results';nodes.set(results.id,results);
 context.LearningWorkbench.mount('home');context.LearningExperienceV13.mount('home');
 const submit=q=>{field.value=q;emit('submit',{id:'lw-find-form'});};
 const cache=()=>JSON.parse(session.get('rolecraft-content-dialog-v14'));
 return {context,events,nodes,node,requests,local,session,writes,emit,click,field,submit,cache,workbench:context.LearningWorkbench,html:()=>nodes.get('lw-assistant-host').innerHTML};
}
const css=readFileSync(path.join(root,'dist/learning-experience-v13.css'),'utf8');
const tests=[];
for(const [hash,view,expected] of [['#home','home','course-home'],['#learn','learn','course-home'],['#learn/agent/n03-planning-reflection','learn','learn'],['#learn/agent/c02?version=textbook-v10','learn','learn'],['#questions','questions','questions'],['#records','records','records'],['#settings','settings','settings']]){const rt=runtime();rt.context.location.hash=hash;rt.context.LearningExperienceV13.mount(view);assert.equal(rt.context.document.body.dataset.learningPage,expected);tests.push({name:hash+' carries expected page attribute for narrow footer selector',status:'pass'});}
assert(css.endsWith('body[data-learning-page="learn"] main>footer>span{display:none}\n'));tests.push({name:'Only routine footer span selected on detail; brand/footer element and other page selectors untouched',status:'pass'});
const before=readFileSync(path.join(root,'team/app-v14-dialog-frontend-history/candidate02/dist/learning-experience-v13.css'),'utf8');assert(css.startsWith(before));for(const file of ['dist/index.html','dist/app.js','dist/learning-workbench.js','dist/learning-experience-v13.js','dist/learning-v13-data.js'])assert.equal(sha(file),createHash('sha256').update(readFileSync(path.join(root,'team/app-v14-dialog-frontend-history/candidate02',file))).digest('hex'));tests.push({name:'Candidate2 CSS prefix and all non-CSS client source bytes retained',status:'pass'});
const rt=runtime();rt.context.location.hash='#learn/agent/c02?version=textbook-v10';assert(rt.context.LearningExperienceV13.page('learn').includes('历史教材 v10'));tests.push({name:'Explicit historical reader identity still present',status:'pass'});
const report={version:'app-v14-dialog-frontend-footer-dev-check-3',runtime:process.version,clientVersion:rt.workbench.version,scope:'Narrow developer VM page-attribute/source checks; no actual CSS/browser/HTTP/model or independent QA',files:Object.fromEntries(files.map(f=>[f,{sha256:sha(f)}])),tests,privateRecordsAccessed:false,modelInvoked:false,actualBrowserTested:false};writeFileSync(path.join(root,'team/app-v14-dialog-frontend-footer-dev-check.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:'pass',checks:tests.length,files:report.files}));
