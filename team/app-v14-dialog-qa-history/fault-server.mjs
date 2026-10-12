import {createServer} from 'node:http';
import {writeFileSync,readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const events=[];const counter=new Map();const base='http://127.0.0.1:4485';const replayOld=process.env.QA_V14_REPLAY_OLD==='1';const oldReact=replayOld?JSON.parse(readFileSync(fileURLToPath(new URL('./candidate02/independent-http.json',import.meta.url)))).responses.find(x=>x.id==='DV14-05-a').body:null;
const server=createServer(async(req,res)=>{
 try{
  if(replayOld&&req.method==='GET'&&req.url.split('?')[0]==='/learning-workbench.js'){const b=readFileSync(fileURLToPath(new URL('./candidate04/snapshot/dist/learning-workbench.js',import.meta.url)));res.writeHead(200,{'content-type':'text/javascript; charset=utf-8','cache-control':'no-store'});res.end(b);events.push({fixture:'received frontend3 snapshot static only'});return;}let body='';for await(const c of req)body+=c;
  let input=null;try{input=body?JSON.parse(body):null;}catch{}
  const query=input?.query;let scenario=null;if(replayOld&&req.method==='POST'&&req.url==='/api/content/dialog'&&query==='React怎么用'){res.writeHead(200,{'content-type':'application/json','cache-control':'no-store'});res.end(JSON.stringify(oldReact));events.push({at:new Date().toISOString(),fixture:'exact captured candidate2 React clarification response replay, not new model inference',query});return;}
  if(req.method==='POST'&&req.url==='/api/content/dialog'){
   scenario=String(query||'').startsWith('QA ')?String(query):null;
   const n=(counter.get(scenario)||0)+1;counter.set(scenario,n);
   if(query==='QA 故障重试'&&n===1){events.push({at:new Date().toISOString(),scenario,fixture:'HTTP503 one-time'});res.writeHead(503,{'content-type':'application/json'});res.end(JSON.stringify({error:'QA isolated transport failure'}));return;}
   if(scenario){input.query=query.includes('重规划')?'重规划什么时候触发':'ReAct是什么';body=JSON.stringify(input);}
  }
  const upstream=await fetch(base+req.url,{method:req.method,headers:body?{'content-type':'application/json'}:{},body:body||undefined});
  const headers=Object.fromEntries(upstream.headers);delete headers['content-length'];delete headers['content-encoding'];
  let bytes=Buffer.from(await upstream.arrayBuffer());
  if(scenario){
   let data=JSON.parse(bytes.toString());
   if(query==='QA 篡改来源hash'&&data.dialog?.citations?.length)data.dialog.citations[0].sourceSha256='0'.repeat(64);
   if(query==='QA 篡改小节'&&data.dialog?.citations?.length)data.dialog.citations[0].sectionId='s-qa-does-not-exist';
   if(query==='QA 篡改句引用'&&data.dialog?.sentences?.length)data.dialog.sentences[0].citationIds=['qa-unknown-reference'];
   if(query==='QA 篡改原文'&&data.dialog?.citations?.length)data.dialog.citations[0].quote='QA invented unsupported quote';
   if(query==='QA 篡改版本'&&data.dialog)data.corpusVersion='textbook-v10';
   if(query==='QA 延迟ReAct')await new Promise(resolve=>setTimeout(resolve,5500));
   bytes=Buffer.from(JSON.stringify(data));events.push({at:new Date().toISOString(),scenario,fixture:'QA transport only, upstream semantic query '+input.query,returnedStatus:data.status,dialogStatus:data.dialog?.status});
  }
  res.writeHead(upstream.status,headers);res.end(bytes);
 }catch(error){res.writeHead(502,{'content-type':'application/json'});res.end(JSON.stringify({error:'QA proxy upstream unavailable'}));events.push({at:new Date().toISOString(),error:error.message});}
});
server.listen(4496,'127.0.0.1',()=>console.log(JSON.stringify({phase:'qa-v14-fault-only',pid:process.pid,node:process.version,url:'http://127.0.0.1:4496/',meaning:'Finite fault transport fixtures; normal assets exact upstream; no application writes/storage access'})));
for(const sig of ['SIGINT','SIGTERM'])process.on(sig,()=>server.close(()=>{writeFileSync(fileURLToPath(new URL('./fault-events.json',import.meta.url)),JSON.stringify(events,null,2)+'\n');console.log(JSON.stringify({phase:'qa-v14-fault-only',closed:true,events:events.length}));process.exitCode=0;}));
