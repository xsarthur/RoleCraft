/* Explicit resource preparation. Runtime inference never downloads from a remote host. */
import { spawnSync } from 'node:child_process';
import { mkdirSync,readFileSync,writeFileSync,existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
export const MODEL_ID='Xenova/bge-small-zh-v1.5';
export const REVISION='75c43b069aac4d136ba6bc1122f995fedcfd2781';
const modelRoot=path.join(here,'models',MODEL_ID);
const names=['config.json','tokenizer.json','tokenizer_config.json','special_tokens_map.json','onnx/model_int8.onnx'];
const records=[];
for(const name of names){
 const dest=path.join(modelRoot,name);mkdirSync(path.dirname(dest),{recursive:true});
 const url=`https://huggingface.co/${MODEL_ID}/resolve/${REVISION}/${name}`;
 const result=spawnSync('curl',['--fail','--location','--retry','2','--max-time','120','--silent','--show-error','--output',dest,url],{stdio:'inherit'});
 if(result.status!==0)throw Error(`Public model download failed: ${name}`);
 const body=readFileSync(dest);records.push({name,url,bytes:body.length,sha256:createHash('sha256').update(body).digest('hex')});
}
writeFileSync(path.join(here,'model-lock.json'),JSON.stringify({modelId:MODEL_ID,revision:REVISION,dtype:'int8',sourceModel:'BAAI/bge-small-zh-v1.5',license:'MIT (upstream model card)',preparedAt:new Date().toISOString(),files:records},null,2)+'\n');
console.log(JSON.stringify({prepared:true,modelId:MODEL_ID,revision:REVISION,totalBytes:records.reduce((n,r)=>n+r.bytes,0)}));
