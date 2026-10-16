/* Shared deterministic fallback. This is a bounded concept engine, not a language model. */
(function(root){
'use strict';
const frames=[
 {id:'recovery',label:'中断后恢复任务',units:['e01','c01-control-primer'],patterns:[/持久|恢复|重启|中断|崩|宕机|程序挂|挂了|挂掉/,/接着(?:干|执行|运行|做)|继续(?:上次|执行|任务)|做过.*(?:再做|重复)|不重复做/]},
 {id:'deduplication',label:'避免重复外部动作',units:['c01-control-primer','c03'],patterns:[/幂等|去重|动作身份/,/(重复|再三|两次|多次|两条).{0,16}(提交|请求|写入|记录|工单|发送)|(?:提交|写入|请求).{0,20}(重复|两条|两次)/]},
 {id:'retrieval',label:'检索当前且有权限的资料',units:['c02','e03'],patterns:[/rag\b|检索|查资料|找资料|证据包/i,/(旧|过期|几个月前|过去|老|以前).{0,16}(资料|文档|规矩|规定|规则)|(?:资料|文档).{0,16}(最新|现在|版本|过期|权限)|过滤.{0,12}(资料|文档)/]},
 {id:'security',label:'执行数据和动作权限',units:['e03','03-trust-boundary'],patterns:[/权限|越权|不该看|无权|不应该看|别人看到|访问控制|授权/,/(恶意|网页|文档).{0,12}(指令|命令)|提示.{0,6}注入|prompt injection/i]},
 {id:'evaluation',label:'比较版本是否改善任务结果',units:['e02'],patterns:[/回归|评估|评价|评测|评分|固定比较|比较两个版本/,/(改.{0,6}版|两个版本|版本|改动).{0,35}(变好|改好|好|结果|实际|改善|比较)|(?:比较|变好).{0,12}版本|不是碰巧|演示成功|真的变好了/]},
 {id:'stopping',label:'设置完成和合理停止条件',units:['02-task-acceptance','c01-control-loop'],patterns:[/停止|停下来|该停|步数|死循环|反复折腾|终止|验收|成功条件|一直跑|无限循环|结束条件|预算耗尽/]},
 {id:'cost',label:'核算任务性能与费用',units:['e05'],patterns:[/费用|多少钱|成本|总费用|花.{0,8}钱|一共花|账单|耗时|延迟|性能|并发|限流|缓存/]},
 {id:'foundation',label:'确定起点并补齐程序基础',units:['01-foundation','00-learning-route'],patterns:[/零基础|没学过编程|不会编程|不会写代码|初学|从零|入门|从哪.{0,4}开始|基础预备|补学|先修/]},
 {id:'model_candidate',label:'校验模型响应与业务候选',units:['f02'],patterns:[/接模型|调用模型|模型接口|模型响应|模型输出|结构化|json|编造|乱输出|大模型返回/i]},
 {id:'http',label:'处理外部请求和失败边界',units:['f01'],patterns:[/http|api|网络请求|接口请求|第三方接口|请求超时|网络异常|状态码/i]},
 {id:'selection',label:'选择最小可用方案',units:['c01-selection'],patterns:[/选型|方案选择|工作流|workflow|多.?agent|固定流程|要不要.{0,8}agent|普通程序|最小可用方案/i]},
 {id:'runtime',label:'实现受控的动态循环',units:['c01-control-loop'],patterns:[/控制循环|动态循环|运行时|自己决定下一步|工具调用|下一步.{0,10}决定/]},
 {id:'problem',label:'确认值得解决的真实问题',units:['p01-discovery','p01-mvp'],patterns:[/用户访谈|真实需求|需求证据|值得.{0,8}解决|痛点|产品需求|mvp|最小产品/i]},
 {id:'release',label:'发布和回退时保留任务事实',units:['e04'],patterns:[/发布|上线|部署|回退|回滚|灰度/]},
 {id:'delivery',label:'用作品证据复盘交付',units:['p02'],patterns:[/独立作品|交付|复盘|作品证据|实训/]},
 {id:'orientation',label:'认识 Agent 与工程全貌',units:['00-learning-route'],patterns:[/agent.{0,8}(是什么|全貌|架构|组成)|什么是.{0,8}agent|工程全景|运行闭环|全貌|架构/i]}
];
const frameById=new Map(frames.map(f=>[f.id,f]));
const norm=s=>s.normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim();
function tokenize(s){const n=norm(s),out=n.match(/[a-z0-9_]{2,}/g)||[];for(const run of n.match(/[\p{Script=Han}]+/gu)||[])for(let i=0;i<run.length-1;i++)out.push(run.slice(i,i+2));return [...new Set(out)].filter(t=>!['怎么','怎样','一个','什么','我想','想学','可以','如何','不是','但是','知道','内容','详细','解法'].includes(t));}
function clauses(query){return query.split(/[，,。；;！？!?\n]|(?:但是|而是|我只想|我只要|只想学)/).map(text=>({text:text.trim(),excluded:/^(?:先|暂时|暂且|暂)?(?:不看|不学|不要学|不想学|不是要学|不是想学|不想看|不用看|不需要学|不需要看)/.test(text.trim())})).filter(x=>x.text);}
function interpret(input){
 const parts=clauses(input.query),positive=parts.filter(p=>!p.excluded),negative=parts.filter(p=>p.excluded);
 const collect=list=>frames.flatMap(f=>{const evidence=list.flatMap(p=>f.patterns.flatMap(re=>{const m=p.text.match(re);return m?[m[0]]:[]}));return evidence.length?[{id:f.id,label:f.label,evidence:[...new Set(evidence)],unitIds:f.units}]:[];});
 const excludedIntents=collect(negative),excludedIds=new Set(excludedIntents.map(f=>f.id));
 let interpretedIntents=collect(positive).filter(f=>!excludedIds.has(f.id));
 // A read-evidence permissions request is one retrieval need plus an enforcement supplement.
 if(interpretedIntents.some(f=>f.id==='retrieval')&&interpretedIntents.some(f=>f.id==='security'))interpretedIntents=interpretedIntents.filter(f=>f.id!=='security');
 if(interpretedIntents.some(f=>f.id==='stopping'))interpretedIntents=interpretedIntents.filter(f=>!['runtime','model_candidate'].includes(f.id));
 if(interpretedIntents.some(f=>f.id==='recovery'))interpretedIntents=interpretedIntents.filter(f=>f.id!=='deduplication');
 if(interpretedIntents.some(f=>f.id==='retrieval'))interpretedIntents=interpretedIntents.filter(f=>f.id!=='http');
 if(!interpretedIntents.length&&input.currentUnitId&&/(?:这一节|这里|刚才|上面|继续学|接着学)/.test(input.query)){
  const f=frames.find(f=>f.units[0]===input.currentUnitId);if(f&&!excludedIds.has(f.id))interpretedIntents=[{id:f.id,label:f.label,evidence:['当前阅读上下文'],unitIds:f.units}];
 }
 return {interpretedIntents,excludedIntents,positiveText:positive.map(p=>p.text).join('，')};
}
function excerpt(section,query){
 const body=section.bodyMarkdown,tokens=tokenize(query);const paragraphs=body.split(/\n\s*\n/).filter(p=>!/^\s*(?:#|```|\|)/.test(p)&&p.trim().length>18);
 const candidates=paragraphs.length?paragraphs:[body];
 const best=candidates.map(p=>({p,score:tokens.reduce((n,t)=>n+(norm(p).includes(t)?1:0),0)})).sort((a,b)=>b.score-a.score)[0].p;
 // Exact original substring, not a generated summary or typography-normalized quote.
 return best.trim().slice(0,220);
}
function base(corpus){return {status:'no_match',engineMode:'local_concept_retrieval',providerCalled:false,corpusVersion:corpus?.corpusVersion||'textbook-v10',corpusHash:corpus?.corpusHash||null,interpretedIntents:[],excludedIntents:[],results:[],clarification:null,limitations:['本地任务概念规则只覆盖当前 Agent 教材；没有调用大模型。']};}
function validate(corpus,input){
 if(!corpus||corpus.corpusVersion!=='textbook-v10'||!Array.isArray(corpus.units)||corpus.units.length!==20)return 'unavailable';
 if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!['query','startingPoint','currentUnitId','currentSectionId','corpusVersion'].includes(k)))return 'invalid_input';
 if(typeof input.query!=='string'||!input.query.trim()||input.query.length>1200)return 'invalid_input';
 if(input.startingPoint!=null&&!['beginner','developer','practitioner'].includes(input.startingPoint))return 'invalid_input';
 if(input.corpusVersion!=null&&input.corpusVersion!=='textbook-v10')return 'invalid_input';
 const u=input.currentUnitId&&corpus.units.find(u=>u.unitId===input.currentUnitId);
 if(input.currentUnitId&&!u||input.currentSectionId&&(!u||!u.sections.some(s=>s.sectionId===input.currentSectionId)))return 'invalid_input';
 return null;
}
function clarification(question,options){return {question,options:options.map(([label,query])=>({label,query}))};}
function recommend(corpus,input,options={}){
 const result=base(corpus),error=validate(corpus,input);if(error){result.status=error;result.limitations=[error==='unavailable'?'当前教材索引不可用，请重试或打开目录。':'请填写 1–1200 字的学习需求，并使用当前教材的有效上下文。'];return result;}
 const interpreted=interpret(input);Object.assign(result,{interpretedIntents:interpreted.interpretedIntents,excludedIntents:interpreted.excludedIntents});
 if(/记忆/.test(input.query)&&!/(上下文|资料|任务|持久|重启|中断|恢复|检索)/.test(input.query)){
  result.status='needs_clarification';result.clarification=clarification('你希望解决哪一种记忆问题？',[['模型上下文与资料证据','模型回答时怎样找到合适的资料证据'],['中断后继续任务','程序中断以后怎样恢复任务并避免重复动作']]);return result;
 }
 if(!result.interpretedIntents.length&&/agent/i.test(input.query)&&/(做好|帮助|帮我|更好|优化)/.test(input.query)){
  result.status='needs_clarification';result.clarification=clarification('你现在想解决哪一个环节的问题？',[['先了解整体','Agent 是什么，工程全貌是什么'],['运行与恢复','程序中断以后怎样恢复任务'],['比较改版结果','怎样比较两个 Agent 版本的实际结果']]);return result;
 }
 const forbiddenUnitIds=new Set(result.excludedIntents.flatMap(i=>i.unitIds));
 const queryTokens=tokenize(interpreted.positiveText);
 const allSections=corpus.units.flatMap(u=>u.sections.map(s=>({u,s}))).filter(({u,s})=>s.searchText.length>35&&(s.level>1||u.unitId==='00-learning-route')&&!/下一步|来源与版本|审校|本轮|历史验证|原版验证|原文验证|代码运行说明/.test(s.title));
 const score=({u,s},intent)=>{
  const text=norm(s.searchText),title=norm(s.title),whole=norm(u.title),terms=queryTokens.reduce((n,t)=>n+(title.includes(t)?4:text.includes(t)?1:0)+(whole.includes(t)?0.3:0),0);
  const semantic=options.semanticScores?.get(u.unitId+'/'+s.sectionId)||0;
  const intentTerms=tokenize(intent?.label||'').reduce((n,t)=>n+(title.includes(t)?2:text.includes(t)?0.2:0),0);
  return Math.min(terms,6)+semantic*50+intentTerms+(intent?.unitIds.indexOf(u.unitId)===0?5:0)+(s.level===2?0.5:0);
 };
 let intents=result.interpretedIntents;
 if(!intents.length&&options.semanticScores){
  const best=allSections.filter(({u})=>!forbiddenUnitIds.has(u.unitId)).sort((a,b)=>score(b)-score(a))[0];
  const similarity=best&&options.semanticScores.get(best.u.unitId+'/'+best.s.sectionId);
  if(similarity>=options.semanticThreshold){intents=[{id:'semantic_topic',label:'与当前教材小节相关的学习需求',evidence:[input.query],unitIds:[best.u.unitId]}];result.interpretedIntents=intents;}
 }
 if(!intents.length){result.limitations=['当前 Agent v10 教材中未找到有足够依据的对应内容；这不表示其他行业没有答案。'];return result;}
 const requestedBeginner=input.startingPoint==='beginner'||result.interpretedIntents.some(i=>i.id==='foundation');
 if(requestedBeginner&&intents.some(i=>!['foundation','orientation'].includes(i.id))&&!intents.some(i=>i.id==='foundation'))intents=[{id:'foundation',label:'先确定基础起点',evidence:['用户选择零基础'],unitIds:['01-foundation','00-learning-route']},...intents];
 if(requestedBeginner)intents=[...intents.filter(i=>i.id==='foundation'),...intents.filter(i=>i.id!=='foundation')];
 const selected=new Set();
 for(const intent of intents.slice(0,3)){
  const candidates=allSections.filter(({u})=>intent.unitIds.includes(u.unitId)&&!forbiddenUnitIds.has(u.unitId)).sort((a,b)=>score(b,intent)-score(a,intent));
  const primary=candidates.find(x=>x.u.unitId===intent.unitIds[0])||candidates[0];
  const secondary=candidates.find(x=>x.u.unitId!==primary?.u.unitId)||candidates.find(x=>x!==primary);
  for(const c of [primary,secondary].filter(Boolean)){
   const key=c.u.unitId+'/'+c.s.sectionId;if(selected.has(key))continue;selected.add(key);
   const evidenceExcerpt=excerpt(c.s,interpreted.positiveText);if(!c.s.bodyMarkdown.includes(evidenceExcerpt))continue;
   result.results.push({unitId:c.u.unitId,sectionId:c.s.sectionId,order:c.u.order,unitTitle:c.u.title,sectionTitle:c.s.title,title:c.s.title,reason:`你表达了“${intent.evidence.join('、')}”；这一小节说明${intent.label}的具体机制。${requestedBeginner&&!['foundation','orientation'].includes(intent.id)?'这是目标预览，请先完成基础诊断与相关先修。':''}`,evidenceExcerpt,sourcePath:c.u.sourcePath,sourceSha256:c.u.sourceSha256,version:corpus.corpusVersion,href:c.s.href,intentId:intent.id,prerequisiteUnitIds:c.u.prerequisiteUnitIds});
  }
 }
 result.results=result.results.slice(0,6);result.status=result.results.length?'recommended':'no_match';return result;
}
root.RolecraftContentRetrieval={recommend,interpret,validate,frames:frames.map(f=>({id:f.id,label:f.label,units:f.units})),tokenize};
})(globalThis);
