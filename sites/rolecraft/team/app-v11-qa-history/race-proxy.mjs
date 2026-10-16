import http from 'node:http';
import {writeFileSync} from 'node:fs';
const base='http://127.0.0.1:4421',rows=[];
const server=http.createServer(async(req,res)=>{
 if(req.headers.host!=='127.0.0.1:4434'||!((req.method==='GET'&&!req.url.startsWith('/api/'))||(req.method==='POST'&&req.url==='/api/content/recommend'))){res.writeHead(403);return res.end();}
 const chunks=[];for await(const c of req)chunks.push(c);const body=Buffer.concat(chunks).toString();
 const record=req.method==='POST'?{receivedAtUtc:new Date().toISOString(),query:JSON.parse(body).query,closedBeforeDelivery:false}:null;if(record){rows.push(record);res.on('close',()=>{if(!record.deliveredAtUtc)record.closedBeforeDelivery=true;});}
 const upstream=await fetch(base+req.url,{method:req.method,headers:body?{'content-type':'application/json'}:{},...(body?{body}:{})});
 const data=Buffer.from(await upstream.arrayBuffer());
 if(record){record.upstreamAtUtc=new Date().toISOString();record.status=JSON.parse(data).status;record.mode=JSON.parse(data).engineMode;if(record.query.includes('程序中断'))await new Promise(r=>setTimeout(r,1400));record.deliveredAtUtc=new Date().toISOString();record.writableEnded=res.writableEnded;}
 res.writeHead(upstream.status,{'content-type':upstream.headers.get('content-type')||'text/plain','cache-control':'no-store'});res.end(data);
});
server.listen(4434,'127.0.0.1',()=>console.log(JSON.stringify({purpose:'finite independent stale-response UI fault timing',base,url:'http://127.0.0.1:4434',startedAtUtc:new Date().toISOString()})));
process.on('SIGINT',()=>server.close(()=>{writeFileSync(new URL('race-proxy-results.json',import.meta.url),JSON.stringify({runtime:process.version,endedAtUtc:new Date().toISOString(),rows},null,2)+'\n');process.exitCode=0;}));
