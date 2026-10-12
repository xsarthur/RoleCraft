import { writeFileSync } from 'node:fs';
const results=[];
for(const resource of ['/','/learning-experience-v13.js','/learning-experience-v13.css','/learning-v13-data.js']) {
 const response=await fetch('http://127.0.0.1:4318'+resource),body=await response.text();
 results.push({path:resource,status:response.status,contentType:response.headers.get('content-type'),bytes:Buffer.byteLength(body),fiveNavPresent:resource==='/'?['首页','课程学习','题库浏览','学习记录','个人设置'].every(label=>body.includes(label)):null});
 if(!response.ok)throw Error('Static public resource unavailable '+resource);
}
const receipt={createdAt:new Date().toISOString(),scope:'engineering public static point receipt only; no private records, BGE or service restart',origin:'http://127.0.0.1:4318',results};
writeFileSync(new URL('./app-v13-prototype-frontend-preview.json',import.meta.url),JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify(receipt));
