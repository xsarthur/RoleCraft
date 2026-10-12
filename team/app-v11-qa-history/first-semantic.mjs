import { readFileSync,writeFileSync,existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const sha=s=>createHash('sha256').update(s).digest('hex');
const MODEL_ID='Xenova/bge-small-zh-v1.5';
const MODEL_REVISION='75c43b069aac4d136ba6bc1122f995fedcfd2781';
let extractorPromise=null;
function lock(){
 const record=JSON.parse(readFileSync(path.join(here,'model-lock.json'),'utf8'));
 if(record.modelId!==MODEL_ID||record.revision!==MODEL_REVISION||record.dtype!=='int8')throw Error('Semantic model lock differs');
 for(const r of record.files){if(!/^(?:[a-z_]+\.json|onnx\/model_int8\.onnx)$/.test(r.name))throw Error('Unsafe model file');const raw=readFileSync(path.join(here,'models',MODEL_ID,r.name));if(sha(raw)!==r.sha256)throw Error('Semantic model checksum differs');}
 return record;
}
export async function getExtractor(){
 if(!extractorPromise)extractorPromise=(async()=>{
  lock();const {pipeline,env}=await import('@huggingface/transformers');
  env.localModelPath=path.join(here,'models')+path.sep;
  env.allowRemoteModels=false;env.allowLocalModels=true;env.useBrowserCache=false;env.useFSCache=false;
  const instance=await pipeline('feature-extraction',MODEL_ID,{dtype:'int8',device:'cpu',session_options:{intra_op_num_threads:2,inter_op_num_threads:1}});
  return async texts=>{const output=await instance(texts,{pooling:'cls',normalize:true,truncation:true,max_length:512});const dim=output.dims.at(-1);const raw=Array.from(output.data);return Array.isArray(texts)?texts.map((_,i)=>raw.slice(i*dim,(i+1)*dim)):[raw];};
 })().catch(e=>{extractorPromise=null;throw e;});
 return extractorPromise;
}
function passages(corpus){return corpus.units.flatMap(u=>u.sections.flatMap(s=>{
 const text=s.searchText;
 if(text.length<35||/下一步|来源与版本|审校|本轮|历史验证|原版验证|原文验证|代码运行说明/.test(s.title))return [];
 const chunks=[];for(let i=0;i<text.length;i+=340)chunks.push({key:u.unitId+'/'+s.sectionId,text:u.title+'。'+s.title+'。'+text.slice(i,i+450)});return chunks;
}));}
export async function prepareVectors(corpus,{persist=true,onProgress}={}){
 const record=lock();const modelHash=record.files.find(f=>f.name==='onnx/model_int8.onnx').sha256;
 const chunks=passages(corpus),chunkHash=sha(JSON.stringify(chunks));const cachePath=path.join(here,'vectors-v10.json');
 if(existsSync(cachePath)){
  const cache=JSON.parse(readFileSync(cachePath,'utf8'));
  if(cache.corpusHash===corpus.corpusHash&&cache.modelHash===modelHash&&cache.chunkHash===chunkHash&&cache.items.length===chunks.length&&cache.items.every((x,i)=>x.key===chunks[i].key&&x.vector.length===512&&x.vector.every(Number.isFinite)))return cache;
 }
 const extractor=await getExtractor();const items=[];
 for(let i=0;i<chunks.length;i+=4){const batch=chunks.slice(i,i+4);const vectors=await extractor(batch.map(c=>c.text));items.push(...batch.map((c,j)=>({key:c.key,vector:vectors[j]})));onProgress?.(items.length,chunks.length);}
 const cache={schemaVersion:'1',corpusHash:corpus.corpusHash,modelHash,chunkHash,modelId:MODEL_ID,revision:MODEL_REVISION,dtype:'int8',pooling:'cls',dimensions:512,items};
 if(persist)writeFileSync(cachePath,JSON.stringify(cache)+'\n');return cache;
}
export async function semanticScores(corpus,text){
 const [extractor,cache]=await Promise.all([getExtractor(),prepareVectors(corpus)]);
 const [vector]=await extractor('为这个句子生成表示以用于检索相关文章：'+text);
 const scores=new Map();for(const item of cache.items){const similarity=item.vector.reduce((n,x,i)=>n+x*vector[i],0);if(similarity>(scores.get(item.key)??-1))scores.set(item.key,similarity);}
 return {scores,provenance:{modelId:cache.modelId,revision:cache.revision,dtype:cache.dtype,pooling:cache.pooling,dimensions:cache.dimensions,modelHash:cache.modelHash,remoteModelsAllowed:false,querySentExternally:false}};
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
 const corpus=JSON.parse(readFileSync(path.join(here,'content-v10-index.json'),'utf8'));
 const start=Date.now();const cache=await prepareVectors(corpus,{onProgress:(n,total)=>{if(n%100===0)console.log(JSON.stringify({embedded:n,total}));}});
 console.log(JSON.stringify({prepared:true,passages:cache.items.length,dimensions:cache.dimensions,durationMs:Date.now()-start,corpusHash:cache.corpusHash,modelHash:cache.modelHash}));
}
