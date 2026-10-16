import http from 'node:http';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const html=readFileSync(new URL('./seed.html',import.meta.url));const server=http.createServer((req,res)=>{res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store'});res.end(html);});server.listen(4486,'127.0.0.1',()=>console.log(JSON.stringify({phase:'qa-seed',pid:process.pid,url:'http://127.0.0.1:4486/'})));let stopping=false;for(const sig of ['SIGINT','SIGTERM'])process.on(sig,()=>{if(stopping)return;stopping=true;server.close(()=>{console.log(JSON.stringify({phase:'qa-seed',closed:true}));process.exitCode=0;});});
