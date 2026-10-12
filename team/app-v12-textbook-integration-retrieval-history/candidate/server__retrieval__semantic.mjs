import { readFileSync,writeFileSync,existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const sha=s=>createHash('sha256').update(s).digest('hex');
const MODEL_ID='Xenova/bge-small-zh-v1.5';
const MODEL_REVISION='75c43b069aac4d136ba6bc1122f995fedcfd2781';
let extractorPromise=null;
// Domain task descriptions are retrieval metadata, not pre-written responses or exact query cases.
const intentDescriptions={
 recovery:['保存执行进度和动作事实，服务或电脑意外中断后恢复现场，从最后可靠提交点继续工作，已经完成的事情不再重新做。','记录请求发送、外部效果和确认结果；重开程序时先核对未决动作，再继续任务，防止未知效果造成重复。'],
 deduplication:['同一动作可能被反复提交或重新发送；用固定逻辑身份和效果账本保证写入、建立工单和生成记录不会重复。','请求已经发出却没有回音，应该先查最终效果和回执，不能把未确认状态当成失败后再次创建。'],
 retrieval:['从知识库或资料集中找当前有效的事实，失效、作废和旧版本的规定不能用于指导现在的任务。','查询资料时按使用者所在范围过滤版本与阅读权限，只取允许查看且适合本次问题的证据。'],
 security:['不同部门和不同使用者不能随意获取别人的数据；敏感资料返回之前必须强制检查权限并过滤内容。','不相信外部网页中的指令，读取和执行工具之前检查真实授权，防止数据泄露和越权动作。'],
 evaluation:['在同样的任务和数据条件下比较两个版本、两种实现或前后两次改进，证明后者结果确实更好。','排除偶然演示成功、抽样难度和挑选案例造成的假改进，用固定实验与回归证据判断质量是否提高。'],
 stopping:['任务完成和无法继续时需要及时结束，设置步数、时长、资源上限和无进展判定，防止无休止地尝试。','让程序知道何时成功、何时等待、何时放弃，没有继续成功的合理依据时收尾，避免反复换计划浪费资源。'],
 cost:['统计一次逻辑任务从开始到结束的全部支出，包含所有调用、失败、重试和未确认的费用。','比较总花费、等待时间、吞吐性能和不同模型价格，省钱不能丢掉质量与失败样本。'],
 foundation:['没有编程基础的人从入口诊断和补学开始，先掌握可运行、可检查输入输出的小程序，再做专业项目。','不知道从哪里入门，需要理解先修知识、程序控制流和基础数据处理，确定自己的学习起点。'],
 model_candidate:['接入大模型并处理返回的数据，验证格式、字段与结构，使模型输出成为可检查的业务候选。','模型响应可能乱写、编造或不完整，应严格校验JSON和业务条件，而不是直接相信生成文本。'],
 http:['对第三方接口发送网络请求，正确处理状态码、连接故障、超时、重试和错误边界。','外部API调用失败时区分是否已发送与未知结果，使用可判错的数据契约接收响应。'],
 selection:['根据任务选择普通程序、一次模型调用、固定工作流程或动态Agent，先采用足够简单的可用方案。','比较单Agent和多个Agent是否必要，不因为系统流行就上复杂框架，先验证方案解决真实任务。'],
 runtime:['由模型依据新观察决定下一步，设计受控可恢复的工具调用循环和可信运行时。','动态代理在每一步核对事实、提出计划、检查执行限制，再使用工具和接收新的观察。'],
 problem:['从真实用户任务和访谈取得需求证据，确认问题值得解决，不靠想象创建产品。','用可失败的差异假设与用户反馈决定最小产品范围，找出已有方案不能解决的需求。'],
 release:['将新版本部署上线和逐步放量，出现问题时回滚版本，不能丢掉正在进行的任务和外部效果。','升级时保留在途状态、核对版本与存储契约，准备发布和回退计划。'],
 delivery:['用独立作品、未知任务和运行证据评价交付，复盘问题原因并验证改进是否真的关闭。','项目结束时保留可重复核查的作品和质量证据，不把自评或完成率当作职业胜任。'],
 orientation:['理解Agent是什么、适合解决哪些需求，以及完整工程包含哪些环节和对应学习章节。','先看工程全景和一次任务运行闭环，找到模型、工具、事实、授权、验收和交付的位置。']
};
const v12Descriptions={
 python_foundations:['解释Python对象引用、嵌套拷贝和并发状态污染；使用有界异步任务与正确清理，并理解模型输出的结构和业务边界。','学习事件循环、装饰器、缓存淘汰、注意力演算和模型候选消费，补齐Agent实现所需的语言基础。'],
 context_memory:['在多轮任务中组织提示和上下文，保存可追溯事实；长期记忆需要来源、纠正、遗忘和当前权限。','任务切换时哪些信息可以继承，如何防止摘要变成错误事实或把过去批准当成现在的授权。'],
 react_strategy:['比较推理和行动交错的ReAct、固定流程与先计划后执行；根据新观察决定下一动作而不把思考当成执行许可。','选择逐步观察后行动还是先形成依赖计划，理解不同策略的控制对象、成本和失败边界。'],
 planning:['从目标需要的验收产物倒推工具、步骤和依赖，形成可检查的候选计划，再验证它是否可执行。','计划包含节点输入输出、依赖和预算；检查图无环、来源合法、工具授权和产物验收，不能只验证JSON格式。'],
 replanning:['新证据推翻计划假设以后，只让受影响的依赖和后继失效，保留仍然有效的事实和已有外部效果。','重规划依据目标、规则或工具版本改变；重新计算可执行前沿，不能清空历史或删除已发生的动作。'],
 tool_catalog:['工具数量很多时，需要目录、能力描述、发现和选择，校验工具来源、调用参数和权限后接入协议。','使用MCP连接工具时区分服务能力、宿主批准和外部效果，协议连接成功不等于授权可以执行。'],
 ingestion:['把原始文档解析和切分成有版本来源的资料，再建立向量索引、更新删除和可比较的检索重排链。','文档摄取需要处理解析、OCR、结构边界、索引发布和证据保留；比较自适应检索时不能把多次调用收益混为算法优势。'],
 graph_orchestration:['把运行循环映射成状态图，明确节点、边、归约、子图和检查点，故障以后按已提交状态恢复。','用LangGraph组织可恢复图编排，区分内存演示和真正持久存储，流式消费不能提前执行副作用。'],
 delegation:['多个Agent分工时，明确委派目标、任务身份、交接资料与回执；协作不能稀释负责人的任务责任。','通过A2A消息交换任务与结果，核对身份、能力和授权；超时取消以后仍要保留已经发生的外部效果。'],
 sandbox:['执行模型生成的代码前限制文件、网络、进程和资源能力，并用实际隔离机制验证准入边界。','沙箱策略检查不等于操作系统隔离，容器和代码执行环境需要测试逃逸、秘密读取和未批准外部动作。'],
 long_runtime:['长任务受到容量、费用和故障约束，使用补偿、熔断、内存诊断与可恢复交付，但不能撤销已发生的事实。','推理服务需要批处理和显存预算，在吞吐、延迟和质量之间核对真实运行证据，故障后继续保持任务身份。'],
 transfer_evaluation:['把工程能力迁移到客服知识和研究任务，用分层实验、跨语言排错与独立技术移交检验真实作品。','使用新场景和未知任务评价交付，冻结比较条件，报告资料来源、实现、失败和专业判断的证据边界。']
};
const intentVectorsPromises=new Map();
async function intentVectors(corpusVersion='textbook-v12'){
 if(!['textbook-v10','textbook-v12'].includes(corpusVersion))throw Error('Unsupported semantic corpus');
 if(!intentVectorsPromises.has(corpusVersion))intentVectorsPromises.set(corpusVersion,(async()=>{
  const extractor=await getExtractor();const metadata=corpusVersion==='textbook-v12'?{...intentDescriptions,...v12Descriptions}:intentDescriptions;
  const descriptions=Object.entries(metadata).flatMap(([id,list])=>list.map(text=>({id,text})));const key=sha(JSON.stringify(descriptions));const cachePath=path.join(here,corpusVersion==='textbook-v12'?'intent-vectors-v12.json':'intent-vectors-v10.json');
  if(existsSync(cachePath)){const cache=JSON.parse(readFileSync(cachePath,'utf8'));if(cache.descriptionHash===key&&cache.revision===MODEL_REVISION&&cache.items.length===descriptions.length&&cache.items.every((x,i)=>x.id===descriptions[i].id&&x.vector.length===512&&x.vector.every(Number.isFinite))&&(corpusVersion==='textbook-v10'||cache.corpusVersion===corpusVersion))return cache.items;throw Error('Task vector identity differs; explicitly prepare current resources');}
  const vectors=await extractor(descriptions.map(x=>x.text));const items=descriptions.map((x,i)=>({id:x.id,vector:vectors[i]}));
  writeFileSync(cachePath,JSON.stringify({corpusVersion,descriptionHash:key,revision:MODEL_REVISION,items})+'\n');return items;
 })().catch(e=>{intentVectorsPromises.delete(corpusVersion);throw e;}));return intentVectorsPromises.get(corpusVersion);
}
export async function semanticIntents(parts,corpusVersion='textbook-v12'){
 const [extractor,prototypes]=await Promise.all([getExtractor(),intentVectors(corpusVersion)]);const texts=parts.map(p=>p.text);if(!texts.length)return [];
 const positive=parts.filter(p=>!p.excluded).map(p=>p.text).join('，');
 const scopes=[...(positive?[{text:positive,excluded:false,scope:'whole'}]:[]),...parts];
 const vectors=await extractor(scopes.map(p=>p.text));const matches=[];
 for(let i=0;i<vectors.length;i++){
  const scores=new Map();for(const p of prototypes){const value=p.vector.reduce((n,x,j)=>n+x*vectors[i][j],0);scores.set(p.id,Math.max(value,scores.get(p.id)||-1));}
  const ranked=[...scores].sort((a,b)=>b[1]-a[1]);
  // Whole positive context identifies the principal topic; only strong clauses add extra topics.
  // Weak short clauses must not manufacture a product-discovery intent.
  if(ranked[0][1]>=0.58&&ranked[0][1]-ranked[1][1]>=0.015)matches.push({id:ranked[0][0],evidence:[scopes[i].text],excluded:scopes[i].excluded});
 }
 return matches;
}
function lock(){
 const record=JSON.parse(readFileSync(path.join(here,'model-lock.json'),'utf8'));
 if(record.modelId!==MODEL_ID||record.revision!==MODEL_REVISION||record.dtype!=='int8')throw Error('Semantic model lock differs');
 for(const r of record.files){if(!/^(?:[a-z_]+\.json|onnx\/model_int8\.onnx)$/.test(r.name))throw Error('Unsafe model file');const raw=readFileSync(path.join(here,'models',MODEL_ID,r.name));if(sha(raw)!==r.sha256)throw Error('Semantic model checksum differs');}
 return record;
}
export async function getExtractor(){
 if(Number(process.versions.node.split('.')[0])!==24){const error=new Error('Local semantic retrieval requires verified Node.js 24');error.code='runtime_unsupported';throw error;}
 if(!extractorPromise)extractorPromise=(async()=>{
  lock();const {pipeline,env}=await import('@huggingface/transformers');
  env.localModelPath=path.join(here,'models')+path.sep;
  env.allowRemoteModels=false;env.allowLocalModels=true;env.useBrowserCache=false;env.useFSCache=false;
  const instance=await pipeline('feature-extraction',MODEL_ID,{dtype:'int8',device:'cpu',session_options:{intra_op_num_threads:2,inter_op_num_threads:1}});
  const extract=async texts=>{const output=await instance(texts,{pooling:'cls',normalize:true,truncation:true,max_length:512});const dim=output.dims.at(-1);const raw=Array.from(output.data);return Array.isArray(texts)?texts.map((_,i)=>raw.slice(i*dim,(i+1)*dim)):[raw];};
  extract.dispose=()=>instance.dispose();return extract;
 })().catch(e=>{extractorPromise=null;throw e;});
 return extractorPromise;
}
export async function disposeSemantic(){
 const pending=extractorPromise;extractorPromise=null;intentVectorsPromises.clear();
 if(pending){try{const extractor=await pending;await extractor.dispose();}catch{}}
}
function passages(corpus){return corpus.units.flatMap(u=>u.sections.flatMap(s=>{
 const text=s.searchText;
 if(text.length<35||/下一步|来源与版本|审校|本轮|历史验证|原版验证|原文验证|代码运行说明/.test(s.title))return [];
 const chunks=[];for(let i=0;i<text.length;i+=340)chunks.push({key:u.unitId+'/'+s.sectionId,text:u.title+'。'+s.title+'。'+text.slice(i,i+450)});return chunks;
}));}
export async function prepareVectors(corpus,{persist=true,onProgress,rebuild=false}={}){
 if(!['textbook-v10','textbook-v12'].includes(corpus.corpusVersion))throw Error('Unsupported semantic corpus');
 const record=lock();const modelHash=record.files.find(f=>f.name==='onnx/model_int8.onnx').sha256;
 const chunks=passages(corpus),chunkHash=sha(JSON.stringify(chunks));const cachePath=path.join(here,corpus.corpusVersion==='textbook-v12'?'vectors-v12.json':'vectors-v10.json');
 if(existsSync(cachePath)){
  const cache=JSON.parse(readFileSync(cachePath,'utf8'));
  if(cache.corpusHash===corpus.corpusHash&&cache.modelHash===modelHash&&cache.chunkHash===chunkHash&&cache.items.length===chunks.length&&cache.items.every((x,i)=>x.key===chunks[i].key&&x.vector.length===512&&x.vector.every(Number.isFinite))&&(corpus.corpusVersion==='textbook-v10'||cache.corpusVersion===corpus.corpusVersion))return cache;
  if(!rebuild)throw Error('Passage vector identity differs; explicitly prepare current resources');
 }
 const extractor=await getExtractor();const items=[];
 for(let i=0;i<chunks.length;i+=4){const batch=chunks.slice(i,i+4);const vectors=await extractor(batch.map(c=>c.text));items.push(...batch.map((c,j)=>({key:c.key,vector:vectors[j]})));onProgress?.(items.length,chunks.length);}
 const cache={schemaVersion:'1',corpusVersion:corpus.corpusVersion,corpusHash:corpus.corpusHash,modelHash,chunkHash,modelId:MODEL_ID,revision:MODEL_REVISION,dtype:'int8',pooling:'cls',dimensions:512,items};
 if(persist)writeFileSync(cachePath,JSON.stringify(cache)+'\n');return cache;
}
export async function semanticScores(corpus,text){
 const [extractor,cache]=await Promise.all([getExtractor(),prepareVectors(corpus)]);
 const [vector]=await extractor('为这个句子生成表示以用于检索相关文章：'+text);
 const scores=new Map();for(const item of cache.items){const similarity=item.vector.reduce((n,x,i)=>n+x*vector[i],0);if(similarity>(scores.get(item.key)??-1))scores.set(item.key,similarity);}
 return {scores,provenance:{modelId:cache.modelId,revision:cache.revision,dtype:cache.dtype,pooling:cache.pooling,dimensions:cache.dimensions,modelHash:cache.modelHash,corpusVersion:corpus.corpusVersion,corpusHash:cache.corpusHash,chunkHash:cache.chunkHash,passages:cache.items.length,remoteModelsAllowed:false,querySentExternally:false}};
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
 const corpus=JSON.parse(readFileSync(path.join(here,'content-v12-index.json'),'utf8'));
 const start=Date.now();const cache=await prepareVectors(corpus,{rebuild:true,onProgress:(n,total)=>{if(n%100===0)console.log(JSON.stringify({embedded:n,total}));}});await intentVectors(corpus.corpusVersion);
 console.log(JSON.stringify({prepared:true,corpusVersion:corpus.corpusVersion,passages:cache.items.length,dimensions:cache.dimensions,durationMs:Date.now()-start,corpusHash:cache.corpusHash,chunkHash:cache.chunkHash,modelHash:cache.modelHash}));await disposeSemantic();
}
