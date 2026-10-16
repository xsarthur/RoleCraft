// Real frozen backend + disposable SQLite + blocked external transport. Never a real provider result.
import fs from 'node:fs';
import {createRolecraftServer} from '../server/index.mjs';
import {response} from './qa-v04-provider-fixture.mjs';
const [dataDir,control]=process.argv.slice(2);
const fixtureConfig={OPENAI_API_KEY:'QA_SENTINEL_NOT_A_REAL_KEY',OPENAI_MODEL:'qa-synthetic-model',OPENAI_MAX_OUTPUT_TOKENS:'2048',ROLECRAFT_GENERATION_BUDGET_USD:'1',ROLECRAFT_ESTIMATED_MAX_COST_USD:'0.1',OPENAI_TIMEOUT_MS:'5000'};
for(const k of Object.keys(fixtureConfig))delete process.env[k];
if(process.env.ROLECRAFT_QA_CONFIG==='fixture')Object.assign(process.env,fixtureConfig);
globalThis.fetch=async(url,options)=>{
 if(url!=='https://api.openai.com/v1/responses')throw Error('QA blocked external request');
 const mode=JSON.parse(fs.readFileSync(control,'utf8')).mode;
 if(mode==='authfail')return response({error:{message:'QA_PRIVATE_PROVIDER_SECRET'}},401);
 if(mode==='hold'||mode==='late')await new Promise((resolve,reject)=>{let n=0;const t=setInterval(()=>{if(++n>300){clearInterval(t);reject(Error('QA fixture deadline'));}else if(JSON.parse(fs.readFileSync(control,'utf8')).mode==='success'){clearInterval(t);resolve();}},20);if(mode==='hold')options.signal.addEventListener('abort',()=>{clearInterval(t);reject(Error('QA_SECRET_ABORT'));},{once:true});});
 return response();
};
const app=createRolecraftServer({dataDir,leaseMs:1000});
app.server.on('error',e=>{console.error('QA_BIND_ERROR '+e.code);process.exit(2);});
app.server.listen(0,'127.0.0.1',()=>console.log(JSON.stringify({url:'http://127.0.0.1:'+app.server.address().port})));
process.on('SIGTERM',async()=>{await app.close();process.exit(0);});
