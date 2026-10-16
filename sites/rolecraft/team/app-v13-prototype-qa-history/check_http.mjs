import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const history=path.dirname(fileURLToPath(import.meta.url)),site=path.resolve(history,'../..'),base='http://127.0.0.1:4473';
const idx=JSON.parse(readFileSync(path.join(site,'server/retrieval/content-v12-index.json'))),binding=JSON.parse(readFileSync(path.join(site,'team/app-v13-prototype-frontend-binding.json')));
const tests=[],errors=[],responses=[];const sha=v=>createHash('sha256').update(v).digest('hex');
const check=(ok,name,details)=>{tests.push({name,status:ok?'pass':'fail',details});if(!ok)errors.push(name);};
for(const file of ['dist/index.html','dist/learning-experience-v13.js','dist/learning-experience-v13.css','dist/learning-v13-data.js']){
 const r=await fetch(base+'/'+(file==='dist/index.html'?'':path.basename(file))),bytes=Buffer.from(await r.arrayBuffer());check(r.status===200&&sha(bytes)===binding.files[file],'served candidate exact bytes '+file,{http:r.status,sha256:sha(bytes)});
}
for(const route of ['/api/health','/api/content/catalog']){const r=await fetch(base+route),body=await r.json();responses.push({route,http:r.status,body});check(r.status===200,'HTTP '+route);if(route.endsWith('/catalog'))check(body.corpusVersion===idx.corpusVersion&&body.corpusHash===idx.corpusHash&&body.units.length===30,'catalog same current corpus and30');}
for(const uid of ['00-learning-route','n03-planning-reflection','p02']){const r=await fetch(base+'/api/content/chapter/'+uid),body=await r.json();responses.push({route:'chapter/'+uid,http:r.status,body});const u=idx.units.find(u=>u.unitId===uid);check(r.status===200&&body.unit?.sourceSha256===u.sourceSha256&&body.unit?.bodyMarkdown===u.bodyMarkdown,'chapter same body '+uid,{http:r.status,sourceSha256:body.unit?.sourceSha256});}
const cases=[
 {id:'PT13-08-ReAct',query:'react',status:'recommended',unit:'n03-planning-reflection',section:'s-da63f3dcff17'},
 {id:'PT13-08-Replan',query:'新证据推翻计划后哪些步骤要重做',status:'recommended',unit:'n03-planning-reflection',section:'s-7ee14c15626d'},
 {id:'PT13-09-Ambiguity',query:'React 是前端框架还是 Agent 的方法？我想学它。',status:'needs_clarification'},
 {id:'PT13-09-NoMatch',query:'装修厨房台面怎么选材料？',status:'no_match'}
];
for(const c of cases){const input={query:c.query,corpusVersion:idx.corpusVersion,startingPoint:null,currentUnitId:null,currentSectionId:null},r=await fetch(base+'/api/content/recommend',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(input)}),body=await r.json();responses.push({id:c.id,input,http:r.status,body});check(r.status===200&&body.status===c.status,c.id+' expected status',{http:r.status,status:body.status});check(body.corpusVersion===idx.corpusVersion&&body.corpusHash===idx.corpusHash&&body.providerCalled===false&&(c.status==='needs_clarification'?/concept/.test(body.engineMode||''):/semantic/.test(body.engineMode||'')),c.id+' truthful local mode/version identity',{engineMode:body.engineMode,providerCalled:body.providerCalled});if(c.unit)check(body.results?.some(x=>x.unitId===c.unit&&x.sectionId===c.section),c.id+' precise mechanism target');for(const x of body.results||[]){const u=idx.units.find(u=>u.unitId===x.unitId),s=u?.sections.find(s=>s.sectionId===x.sectionId);check(u&&s&&x.version===idx.corpusVersion&&x.sourceSha256===u.sourceSha256&&x.sourcePath===u.sourcePath&&x.href===s.href&&s.bodyMarkdown.includes(x.evidenceExcerpt),c.id+' source target '+x.unitId+'/'+x.sectionId);}}
const result={atUtc:new Date().toISOString(),runtime:process.version,scope:'Independent real localhost HTTP with finite semantic and truthful fast concept clarification, not browser actions, arbitrary language reliability, generation or whole legacy regression',status:errors.length?'fail':'pass',tests,errors,responses};writeFileSync(path.join(history,'candidate01/independent-http.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({status:result.status,checks:tests.length,errors,responses:responses.map(x=>({id:x.id||x.route,http:x.http,status:x.body.status,keys:Object.keys(x.body)}))}));process.exitCode=errors.length?1:0;
