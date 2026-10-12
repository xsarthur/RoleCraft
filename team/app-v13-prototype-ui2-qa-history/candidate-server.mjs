import {mkdtempSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
for(const key of ['OPENAI_API_KEY','OPENAI_MODEL','OPENAI_MAX_OUTPUT_TOKENS','ROLECRAFT_GENERATION_BUDGET_USD','ROLECRAFT_ESTIMATED_MAX_COST_USD'])delete process.env[key];
process.env.ROLECRAFT_RETRIEVAL_MODE='semantic';
const {createRolecraftServer}=await import('../../server/index.mjs');
const dataDir=mkdtempSync(path.join(tmpdir(),'rolecraft-ui2-qa-v13-'));const app=createRolecraftServer({dataDir});
const request=app.server.listeners('request')[0];app.server.removeAllListeners('request');
const files=['index.html','app.js','learning-workbench.js','learning-experience-v13.js','learning-experience-v13.css','learning-v13-data.js'];const frozen=new Map(files.map(name=>['/'+name,readFileSync(new URL('./frozen-client/'+name,import.meta.url))]));
let mode='real';const controls='<!doctype html><meta charset="UTF-8"><h1>UI2隔离运输夹具</h1><p>此页面只控制本机4486虚构测试服务。不改变应用代码或用户数据。</p>'+['real','503','stale','delay'].map(m=>`<form method="post" action="/__qa/mode/${m}"><button>${m}</button></form>`).join('');
app.server.on('request',async(req,res)=>{const u=new URL(req.url,'http://127.0.0.1:4486');let p=u.pathname;if(p==='/')p='/index.html';
if(u.pathname==='/__qa/fixtures'){res.writeHead(200,{'content-type':'text/html;charset=utf-8'});res.end(controls+'<p>当前 '+mode+'</p>');return;}
if(req.method==='POST'&&u.pathname.startsWith('/__qa/mode/')){mode=u.pathname.split('/').at(-1);res.writeHead(303,{location:'/__qa/fixtures'});res.end();return;}
if(frozen.has(p)){res.writeHead(200,{'Content-Type':p.endsWith('.html')?'text/html;charset=utf-8':p.endsWith('.css')?'text/css;charset=utf-8':'text/javascript;charset=utf-8','Cache-Control':'no-store'});res.end(frozen.get(p));return;}
if(u.pathname==='/api/content/dialog'||(u.pathname.startsWith('/api/')&&u.pathname!='/api/health'&&!u.pathname.startsWith('/api/content/'))){res.writeHead(404,{'content-type':'application/json'});res.end(JSON.stringify({error:{code:'qa_endpoint_disabled'}}));return;}
if(req.method==='POST'&&u.pathname==='/api/content/recommend'&&mode!=='real'){
if(mode==='503'){res.writeHead(503,{'content-type':'application/json'});res.end(JSON.stringify({error:{code:'qa_transport_503',message:'明确UI运输故障夹具'}}));return;}
if(mode==='stale'){res.writeHead(200,{'content-type':'application/json'});res.end(JSON.stringify({status:'recommended',corpusVersion:'textbook-v10',corpusHash:'qa_explicit_wrong_version',engineMode:'concept_expanded_retrieval',providerCalled:false,results:[],limitations:['明确旧版本运输夹具；不是模型调用']}));return;}
if(mode==='delay')await new Promise(resolve=>setTimeout(resolve,1800));
}
return request(req,res);});
app.server.listen(4486,'127.0.0.1',()=>console.log(JSON.stringify({phase:'ui2-qa-frozen-v13-client-current-compatible-server',pid:process.pid,node:process.version,url:'http://127.0.0.1:4486/',dataDir,generationConfigured:false,dialogEndpointDisabled:true,frozenWorkbenchSha256:'55c6f5db634d1b723e863fe9a94f604fadcf895c15acbb984025d35be15c6266'})));let stopping=false;for(const sig of ['SIGINT','SIGTERM'])process.on(sig,async()=>{if(stopping)return;stopping=true;await app.close();console.log(JSON.stringify({phase:'ui2-qa-candidate',closed:true}));process.exitCode=0;});
