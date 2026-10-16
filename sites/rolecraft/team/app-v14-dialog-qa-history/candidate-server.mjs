import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
for(const key of ['OPENAI_API_KEY','OPENAI_MODEL','OPENAI_MAX_OUTPUT_TOKENS','ROLECRAFT_GENERATION_BUDGET_USD','ROLECRAFT_ESTIMATED_MAX_COST_USD'])delete process.env[key];
const {createRolecraftServer}=await import('../../server/index.mjs');
const dataDir=mkdtempSync(path.join(tmpdir(),'rolecraft-qa-v14-'));
const app=createRolecraftServer({dataDir});
app.server.listen(4485,'127.0.0.1',()=>console.log(JSON.stringify({phase:'qa-v14-candidate',pid:process.pid,node:process.version,url:'http://127.0.0.1:4485/',dataDir,generationConfigured:false})));
let stopping=false;for(const sig of ['SIGINT','SIGTERM'])process.on(sig,async()=>{if(stopping)return;stopping=true;await app.close();console.log(JSON.stringify({phase:'qa-v14-candidate',closed:true}));process.exitCode=0;});
