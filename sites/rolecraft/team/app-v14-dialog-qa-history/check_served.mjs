import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const h=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(h,'../..'),target=process.env.QA_V14_CANDIDATE||'candidate02',binding=JSON.parse(readFileSync(path.join(root,'team/'+(process.env.QA_V14_FRONT_BINDING||'app-v14-dialog-frontend-binding2.json')))),out=path.join(h,target);
mkdirSync(out,{recursive:true});const rows=[];
for(const name of ['index.html','app.js','learning-workbench.js','learning-experience-v13.js','learning-experience-v13.css','learning-v13-data.js','content-v12-data.js']){
 const response=await fetch('http://127.0.0.1:4485/'+(name==='index.html'?'':name)),bytes=Buffer.from(await response.arrayBuffer()),sha256=createHash('sha256').update(bytes).digest('hex'),expected=binding.files['dist/'+name]||createHash('sha256').update(readFileSync(path.join(root,'dist',name))).digest('hex');rows.push({name,http:response.status,sha256,expected,matches:response.status===200&&sha256===expected});
}
for(const route of ['/api/health','/api/content/catalog']){const response=await fetch('http://127.0.0.1:4485'+route),body=await response.json();rows.push({route,http:response.status,body});}
const result={atUtc:new Date().toISOString(),candidate:target,node:process.version,rows,status:rows.every(x=>x.matches!==false)?'pass':'fail'};writeFileSync(path.join(out,'served-transport-binding.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({status:result.status,rows:rows.map(x=>({name:x.name||x.route,matches:x.matches,http:x.http,sha256:x.sha256}))}));process.exitCode=result.status==='pass'?0:1;
