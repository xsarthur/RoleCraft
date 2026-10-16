import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createRolecraftServer} from '../../server/index.mjs';
const dataDir=mkdtempSync(path.join(tmpdir(),'rolecraft-v12-integration-independent-qa-'));
const app=createRolecraftServer({dataDir});
app.server.listen(4453,'127.0.0.1',()=>console.log(JSON.stringify({qaOwned:true,url:'http://127.0.0.1:4453',dataDir,runtime:process.version,executable:process.execPath,startedAtUtc:new Date().toISOString()})));
let stopping=false;
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,async()=>{if(stopping)return;stopping=true;await app.close();process.exitCode=0;});
