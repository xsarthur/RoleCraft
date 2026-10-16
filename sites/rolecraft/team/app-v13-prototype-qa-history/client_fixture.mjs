import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const history=path.dirname(fileURLToPath(import.meta.url)),site=path.resolve(history,'../..');
export const fixtureDetails=[];const details=fixtureDetails;
export function instance({local={},session={},failWrites=false,sourceOverrides={}}={}){
 const stored=new Map(Object.entries(local)),cached=new Map(Object.entries(session)),writes=[],events=new Map(),nodes=new Map(),blobs=[],focus=[];
 const listeners=(type,fn)=>events.set(type,[...(events.get(type)||[]),fn]);
 const classList={add(){},remove(){},toggle(){return false;},contains(){return false;}};
 function element(id='') {return{id,dataset:{},style:{setProperty(){}},classList,value:'',textContent:'',innerHTML:'',hidden:false,isConnected:true,offsetWidth:500,offsetHeight:900,setAttribute(){},removeAttribute(){},addEventListener(){},querySelector(){return null;},querySelectorAll(){return[];},getAttribute(){return null;},closest(){return null;},focus(){focus.push(id);},scrollIntoView(){},click(){},showModal(){},close(){}};}
 nodes.set('save-status',element('save-status'));
 const document={body:{dataset:{},classList,appendChild(e){nodes.set(e.id,e);}},documentElement:{style:{setProperty(name,value){details.push({style:name,value});}}},activeElement:null,getElementById:id=>nodes.get(id)||null,querySelector:()=>null,querySelectorAll:()=>[],createElement:()=>element(),addEventListener:listeners};
 const storage=(map,label)=>({getItem:k=>map.get(k)??null,setItem(k,v){if(failWrites)throw Error('QA forced storage quota failure');writes.push({storage:label,key:k,value:v});map.set(k,String(v));},removeItem(){throw Error('Unexpected fixture deletion');}});
 class ExportURL extends URL{static createObjectURL(blob){blobs.push(blob);return'blob:qa-captured';}static revokeObjectURL(){}}
 const context=vm.createContext({document,window:{scrollY:0,scrollTo(){}},innerWidth:1200,location:{hash:'#home',protocol:'http:',href:'http://qa-isolated/'},localStorage:storage(stored,'local'),sessionStorage:storage(cached,'session'),URL:ExportURL,URLSearchParams,Blob,AbortController,Map,Set,console,requestAnimationFrame:fn=>{fn();return 1;},cancelAnimationFrame(){},setTimeout(){return 1;},clearTimeout(){}});
 for(const name of ['content-v10-data.js','content-v12-data.js','learning-workbench.js','learning-v13-data.js','learning-experience-v13.js'])vm.runInContext(sourceOverrides[name]??readFileSync(path.join(site,'dist',name),'utf8'),context,{filename:name});
 function fire(type,target){for(const fn of events.get(type)||[])fn({target,preventDefault(){},key:target.key});}
 function action(attribute,dataset={},value){const e=element();e.dataset=dataset;e.hasAttribute=a=>a===attribute;e.closest=()=>e;if(value)e.getAttribute=a=>a==='href'?value:null;fire('click',e);}
 function field(id,value,extra={}){const e=Object.assign(element(id),{value},extra);nodes.set(id,e);return e;}
 function visit(href){context.location.hash=href;context.LearningWorkbench.mount('learn');context.LearningExperienceV13.mount('learn');}
 return{context,stored,cached,writes,nodes,blobs,focus,element,fire,action,field,visit,lw:context.LearningWorkbench,ex:context.LearningExperienceV13};
}
