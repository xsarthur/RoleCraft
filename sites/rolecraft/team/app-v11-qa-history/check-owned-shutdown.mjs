import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {writeFileSync} from 'node:fs';
const here=new URL('.',import.meta.url),script=fileURLToPath(new URL('start-server.mjs',here));
const rows=[];
for(const [bin,port] of [['/Users/shengxiong/.nvm/versions/node/v24.16.0/bin/node',4431],[process.execPath,4432]]){
 const child=spawn(bin,[script,String(port)],{env:{...process.env,ROLECRAFT_RETRIEVAL_MODE:'semantic'},stdio:['pipe','pipe','pipe']});
 let stdout='',stderr='';child.stdout.on('data',b=>stdout+=b);child.stderr.on('data',b=>stderr+=b);
 const exit=new Promise(resolve=>child.on('exit',(code,signal)=>resolve({code,signal})));
 let ready=false;
 for(let i=0;i<60;i++){if(stdout.includes('qaOwned')){ready=true;break;}await new Promise(r=>setTimeout(r,50));}
 if(!ready){child.kill('SIGTERM');rows.push({bin,port,ready:false,exit:await exit,stdout,stderr});continue;}
 const response=await fetch(`http://127.0.0.1:${port}/api/content/recommend`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({query:'中断后恢复任务时，怎样避免重复外部动作？'})});
 const output=await response.json();const sentAtUtc=new Date().toISOString();child.kill('SIGINT');
 const outcome=await Promise.race([exit,new Promise(resolve=>setTimeout(()=>resolve({timedOut:true}),15000))]);
 if(outcome.timedOut)child.kill('SIGTERM');
 const supported=bin.includes('/v24.16.0/');
 const behavior=supported?output.engineMode==='local_semantic_retrieval'&&output.status==='recommended':output.status==='unavailable'&&output.errorCode==='runtime_unsupported';
 rows.push({bin,port,ready,supportedRuntime:supported,queryOutput:output,httpStatus:response.status,signalSent:'SIGINT',signalSentAtUtc:sentAtUtc,exit:outcome,stdout,stderr,status:outcome.code===0&&behavior?'pass':'fail'});
 console.log(JSON.stringify({bin,exit:outcome,status:rows.at(-1).status}));
}
writeFileSync(new URL('owned-shutdown-natural-final.json',here),JSON.stringify({executedAtUtc:new Date().toISOString(),method:'QA owned subprocesses, isolated temp databases, Node24 one real CPU query and unsupported Node26 controlled unavailable; exact SIGINT then natural exitCode handler matching repaired CLI. No user service signalled.',rows},null,2)+'\n');
