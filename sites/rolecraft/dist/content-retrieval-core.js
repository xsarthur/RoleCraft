/* Shared deterministic concept + source-term recall. This is not a language model. */
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
const v12Frames=[
 {id:'python_foundations',label:'理解对象并发与模型输出边界',units:['n01-python-model-foundations'],patterns:[/python|浅拷贝|深拷贝|事件循环|装饰器|lru|注意力|因果掩码/i]},
 {id:'context_memory',label:'维护跨轮上下文与可纠正的长期记忆',units:['n02-context-memory-prompt'],patterns:[/上下文|长期记忆|记忆生命周期|任务切换|提示词|prompt|遗忘|跨轮|偏好|错误记忆|记忆.{0,12}(?:纠正|撤回|失效|过期|删除)|(?:纠正|撤回|失效|删除).{0,12}记忆/i]},
 {id:'react_strategy',label:'比较推理行动交错与先计划的策略',units:['n03-planning-reflection'],patterns:[/\breact\b|推理.{0,8}(?:行动|动作).{0,8}交错/i]},
 {id:'planning',label:'从验收产物倒推并验证候选计划',units:['n03-planning-reflection'],patterns:[/\bplanning\b|plan-and-execute|候选计划|倒推.{0,12}(?:步骤|计划)|(?:检查|验证).{0,8}计划|规划器/i]},
 {id:'replanning',label:'重规划时保留事实并失效依赖假设',units:['n03-planning-reflection'],patterns:[/\breplanning\b|重规划|计划.{0,8}(?:失效|过时)|(?:新证据|新观察).{0,12}(?:推翻|否定|改变).{0,8}计划/i]},
 {id:'tool_catalog',label:'发现选择工具并接入MCP协议',units:['n04-tools-mcp'],patterns:[/\bmcp\b|工具目录|工具发现|上百.{0,6}工具|工具.{0,8}(?:太多|选择|发现)/i]},
 {id:'ingestion',label:'构建文档摄取与可比较的检索链',units:['n05-retrieval-ingestion'],patterns:[/摄取|文档切分|\bocr\b|\bann\b|agentic.?rag|重排|向量索引|索引.{0,8}(?:更新|删除|生命周期)/i]},
 {id:'graph_orchestration',label:'映射可恢复状态图与子图',units:['n06-graph-orchestration'],patterns:[/langgraph|状态图|子图|图编排|checkpoint|checkpointer/i]},
 {id:'delegation',label:'协调多Agent交接与消息身份',units:['n07-multiagent-a2a'],patterns:[/\ba2a\b|多.?agent.{0,12}(?:协作|协调|交接|消息)|委派|分工交接/i]},
 {id:'sandbox',label:'限制模型生成代码的执行边界',units:['n08-sandbox-security'],patterns:[/沙箱|sandbox|生成代码|代码执行|容器隔离/i]},
 {id:'long_runtime',label:'约束长任务补偿容量与推理服务',units:['n09-runtime-delivery'],patterns:[/长任务|补偿|熔断|内存泄漏|推理服务|动态批处理|显存|gpu/i]},
 {id:'transfer_evaluation',label:'用跨场景实验与技术移交检验能力',units:['n10-evaluation-projects'],patterns:[/跨场景|客服知识|研究任务|跨语(?:排错|诊断)|技术移交|迁移.{0,8}(?:任务|评价)|(?:证据|轨迹).{0,8}(?:偏离|分歧)|(?:交给|移交).{0,16}(?:工程师|接收者).{0,8}复现/i]}
];
const frameById=new Map([...frames,...v12Frames].map(f=>[f.id,f]));
const expectedUnits={'textbook-v10':20,'textbook-v12':30};
const norm=s=>s.normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim();
function tokenize(s){const n=norm(s),out=n.match(/[a-z0-9_]{2,}/g)||[];for(const run of n.match(/[\p{Script=Han}]+/gu)||[])for(let i=0;i<run.length-1;i++)out.push(run.slice(i,i+2));return [...new Set(out)].filter(t=>!['怎么','怎样','一个','什么','我想','想学','可以','如何','不是','但是','知道','内容','详细','解法'].includes(t));}
function clauses(query){return query.split(/[，,。；;！？!?\n]|(?:但是|但(?=不是|不想|不要|不看|不学)|而是|我只想|我只要|只想学|以及|同时|还有|还想|还得)/).map(text=>({text:text.trim(),excluded:/^(?:先|暂时|暂且|暂)?(?:不看|不学|不讨论|不谈|不要(?:学|看|讨论|推荐|介绍)|不推荐|别推荐|跳过|不想学|不是要学|不是想学|不是\s*(?:react\b|agent\b|智能体|前端)|不想看|不用看|不需要学|不需要看)/i.test(text.trim())})).filter(x=>x.text);}
// Build a literal vocabulary only from public teaching prose. Code, file paths,
// link destinations and administrative sections cannot supply term evidence.
const termIndexes=new WeakMap();
const ordinaryWords=new Set('a an and are as at be been but by can do for from how if in into is it may of on or that the their then there these they this to use using was were what when where which who why will with without you your agent agents'.split(' '));
function prose(text){return text.replace(/```[^\n]*\n[\s\S]*?```/g,'').replace(/!\[[^\]]*\]\([^)]*\)/g,'').replace(/\[([^\]]+)\]\([^)]*\)/g,'$1').replace(/`[^`\n]*`/g,'').replace(/https?:\/\/\S+|(?:[\w.-]+\/)+[\w.-]+|\b[\w.-]+\.(?:md|json|py|mjs|js|html|png|svg|dot)\b/gi,'').replace(/^\s*#{1,6}\s.*$/gm,'');}
function englishTerms(text){const normalized=text.normalize('NFKC');return [...normalized.matchAll(/[A-Za-z][A-Za-z0-9]*(?:-[A-Za-z0-9]+)*/g)].filter(m=>!/[A-Za-z0-9_]/.test(normalized[m.index-1]||'')&&!/[A-Za-z0-9_]/.test(normalized[m.index+m[0].length]||'')).map(m=>({key:m[0].toLowerCase(),display:m[0]})).filter(t=>t.key.length>1&&!ordinaryWords.has(t.key));}
function sourceTermIndex(corpus,sections){
 if(termIndexes.has(corpus))return termIndexes.get(corpus);
 const index=new Map();for(const c of sections){const seen=new Set();for(const term of englishTerms(prose(c.s.bodyMarkdown))){if(seen.has(term.key))continue;seen.add(term.key);if(!index.has(term.key))index.set(term.key,[]);index.get(term.key).push({...c,display:term.display});}}
 termIndexes.set(corpus,index);return index;
}
function termRecall(corpus,sections,text,forbidden){const index=sourceTermIndex(corpus,sections),seen=new Set();return englishTerms(text).filter(t=>!seen.has(t.key)&&seen.add(t.key)).flatMap(t=>{const hits=(index.get(t.key)||[]).filter(c=>!forbidden.has(c.u.unitId));return hits.length?[{term:t.key,display:hits[0].display,hits}]:[];});}
function interpret(input,options={}){
 const availableFrames=(options.corpusVersion||input.corpusVersion||'textbook-v12')==='textbook-v12'?[...frames,...v12Frames]:frames;
 const parts=clauses(input.query),positive=parts.filter(p=>!p.excluded),negative=parts.filter(p=>p.excluded);
 const collect=list=>availableFrames.flatMap(f=>{const evidence=list.flatMap(p=>f.patterns.flatMap(re=>{const m=p.text.match(re);return m?[m[0]]:[]}));return evidence.length?[{id:f.id,label:f.label,evidence:[...new Set(evidence)],unitIds:f.units}]:[];});
 const excludedIntents=collect(negative),excludedIds=new Set(excludedIntents.map(f=>f.id));
 let interpretedIntents=collect(positive).filter(f=>!excludedIds.has(f.id));
 const explicitIds=new Set(interpretedIntents.map(i=>i.id));
 if(options.semanticIntents?.length){
  const semantic=options.semanticIntents.filter(i=>!excludedIds.has(i.id)).map(i=>({id:i.id,label:frameById.get(i.id)?.label||i.label,evidence:i.evidence,unitIds:frameById.get(i.id)?.units||i.unitIds}));
  const seen=new Set();interpretedIntents=[...semantic,...interpretedIntents].filter(i=>!seen.has(i.id)&&seen.add(i.id));
  if(semantic.some(i=>i.id==='evaluation'))interpretedIntents=interpretedIntents.filter(i=>i.id!=='release');
  // “Do not redo completed work after interruption” is a recovery objective, not a request
  // to learn stopping. Keep both only when the user also states a distinct stopping need.
  if(explicitIds.has('recovery')&&!explicitIds.has('stopping'))interpretedIntents=interpretedIntents.filter(i=>i.id!=='stopping');
  // New specialist topics have explicit source-backed cues. A weaker inferred
  // broad class must not consume the three-topic budget before these clear needs.
  if((options.corpusVersion||input.corpusVersion)==='textbook-v12'){
   const specialistIds=new Set(v12Frames.filter(f=>explicitIds.has(f.id)).map(f=>f.id));
   interpretedIntents=[...interpretedIntents.filter(i=>specialistIds.has(i.id)),...interpretedIntents.filter(i=>!specialistIds.has(i.id))];
  }
 }
 // A read-evidence permissions request is one retrieval need plus an enforcement supplement.
 if(interpretedIntents.some(f=>f.id==='retrieval')&&interpretedIntents.some(f=>f.id==='security'))interpretedIntents=interpretedIntents.filter(f=>f.id!=='security');
 if(interpretedIntents.some(f=>f.id==='stopping'))interpretedIntents=interpretedIntents.filter(f=>!['runtime','model_candidate'].includes(f.id));
 if(interpretedIntents.some(f=>f.id==='recovery'))interpretedIntents=interpretedIntents.filter(f=>f.id!=='deduplication');
 if(interpretedIntents.some(f=>f.id==='retrieval'))interpretedIntents=interpretedIntents.filter(f=>f.id!=='http');
 if(!interpretedIntents.length&&input.currentUnitId&&/(?:这一节|这里|刚才|上面|继续学|接着学)/.test(input.query)){
  const f=availableFrames.find(f=>f.units[0]===input.currentUnitId);if(f&&!excludedIds.has(f.id))interpretedIntents=[{id:f.id,label:f.label,evidence:['当前阅读上下文'],unitIds:f.units}];
 }
 return {interpretedIntents,excludedIntents,positiveText:positive.map(p=>p.text).join('，')};
}
function excerpt(section,query,exactTerms=[]){
 const body=section.bodyMarkdown,tokens=tokenize(query);const paragraphs=body.split(/\n\s*\n/).filter(p=>!/^\s*(?:#|```|\|)/.test(p)&&p.trim().length>18);
 const candidates=paragraphs.length?paragraphs:[body];
 const paragraphScore=p=>tokens.reduce((n,t)=>n+(norm(p).includes(t)?1:0),0)+englishTerms(prose(p)).reduce((n,t)=>n+(exactTerms.includes(t.key)?100:0),0);
 const best=candidates.map(p=>({p,score:paragraphScore(p)})).sort((a,b)=>b.score-a.score)[0].p;
 // Exact original substring, not a generated summary or typography-normalized quote.
 const original=best.trim();if(original.length<=260)return original;
 const sentences=[...original.matchAll(/[^。！？\n]*[。！？]|[^。！？\n]+$/g)].map(m=>m[0].trim()).filter(s=>s.length>=18&&s.length<=260);
 if(sentences.length)return sentences.map(p=>({p,score:paragraphScore(p)})).sort((a,b)=>b.score-a.score)[0].p;
 // Keep a complete source paragraph if it contains an unusually long technical sentence.
 return original;
}
function base(corpus){return {status:'no_match',retrievalVersion:'content-retrieval-0.12-v12',engineMode:'local_concept_retrieval',matchingMethods:['local_task_concepts','source_term_recall'],providerCalled:false,corpusVersion:corpus?.corpusVersion||'textbook-v12',corpusHash:corpus?.corpusHash||null,interpretedIntents:[],excludedIntents:[],results:[],clarification:null,limitations:['本地任务概念规则与原文术语查找只覆盖所选 Agent 教材；没有调用大模型。']};}
function validate(corpus,input){
 if(!corpus||!expectedUnits[corpus.corpusVersion]||!Array.isArray(corpus.units)||corpus.units.length!==expectedUnits[corpus.corpusVersion])return 'unavailable';
 if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!['query','startingPoint','currentUnitId','currentSectionId','corpusVersion'].includes(k)))return 'invalid_input';
 if(typeof input.query!=='string'||!input.query.trim()||input.query.length>1200)return 'invalid_input';
 if(input.startingPoint!=null&&!['beginner','developer','practitioner'].includes(input.startingPoint))return 'invalid_input';
 if(input.corpusVersion!=null&&input.corpusVersion!==corpus.corpusVersion)return 'invalid_input';
 const u=input.currentUnitId&&corpus.units.find(u=>u.unitId===input.currentUnitId);
 if(input.currentUnitId&&!u||input.currentSectionId&&(!u||!u.sections.some(s=>s.sectionId===input.currentSectionId)))return 'invalid_input';
 return null;
}
function clarification(question,options){return {question,options:options.map(([label,query])=>({label,query}))};}
function recommend(corpus,input,options={}){
 const result=base(corpus),error=validate(corpus,input);if(error){result.status=error;result.limitations=[error==='unavailable'?'当前教材索引不可用，请重试或打开目录。':'请填写 1–1200 字的学习需求，并使用当前教材的有效上下文。'];return result;}
 const interpreted=interpret(input,{...options,corpusVersion:corpus.corpusVersion});Object.assign(result,{interpretedIntents:interpreted.interpretedIntents,excludedIntents:interpreted.excludedIntents});
 const positiveParts=clauses(input.query).filter(p=>!p.excluded),positive=interpreted.positiveText;
 const frontendCue=/前端|jsx|hooks|网页.{0,8}(?:组件|界面)|虚拟\s*dom|front.?end|web.{0,8}components?|reactjs|react\.js/i;
 const agentCue=/\bagent\b|智能体|推理.{0,8}(?:行动|动作)/i;
 const hasReact=positiveParts.some(p=>englishTerms(p.text).some(t=>t.key==='react'));
 const hasFrontend=hasReact&&positiveParts.some(p=>frontendCue.test(p.text));
 const hasAgentMeaning=positiveParts.some(p=>agentCue.test(p.text));
 // Resolve a shared subject over its positive/negative contrast clauses, rather
 // than assuming every clause repeats the name ("not that method, but web UI").
 const frontendReact=hasFrontend?positiveParts.filter(p=>frontendCue.test(p.text)||englishTerms(p.text).some(t=>t.key==='react')):[];
 if(hasFrontend&&hasAgentMeaning&&/还是|或是|区别|哪个|哪种|两种|到底|whether|versus|\bvs\b/i.test(positive)){
  result.status='needs_clarification';result.clarification=clarification('你想找哪个方向的内容？当前教材讲解 Agent ReAct，不提供前端 React 教程。',[['Agent 的 ReAct 方法','ReAct 的推理和行动是怎样交错的？'],['前端 React 框架','React 前端框架的 JSX 和 Hooks']]);return result;
 }
 if(!positive){result.limitations=['你排除了所提内容；请补充一个希望学习的目标。'];return result;}
 if(/记忆|记住/.test(input.query)&&!/(上下文|资料|任务|持久|重启|中断|恢复|检索|动作|效果|工单|执行)/.test(input.query)&&!(corpus.corpusVersion==='textbook-v12'&&result.interpretedIntents.some(i=>i.id==='context_memory'))){
  result.status='needs_clarification';result.clarification=clarification('你希望解决哪一种记忆问题？',[['模型上下文与资料证据','模型回答时怎样找到合适的资料证据'],['中断后继续任务','程序中断以后怎样恢复任务并避免重复动作']]);return result;
 }
 if(!result.interpretedIntents.length&&/agent/i.test(input.query)&&/(做好|帮助|帮我|更好|优化)/.test(input.query)){
  result.status='needs_clarification';result.clarification=clarification('你现在想解决哪一个环节的问题？',[['先了解整体','Agent 是什么，工程全貌是什么'],['运行与恢复','程序中断以后怎样恢复任务'],['比较改版结果','怎样比较两个 Agent 版本的实际结果']]);return result;
 }
 const forbiddenUnitIds=new Set(result.excludedIntents.flatMap(i=>i.unitIds));
 const queryTokens=tokenize(interpreted.positiveText);
 const allSections=corpus.units.flatMap(u=>u.sections.map(s=>({u,s}))).filter(({u,s})=>s.searchText.length>35&&(s.level>1||u.unitId==='00-learning-route')&&!/下一步|来源与版本|审校|本轮|历史验证|原版验证|原文验证|代码运行说明/.test(s.title));
 const termText=positiveParts.filter(p=>!frontendReact.includes(p)).map(p=>p.text).join('，');
 const recalled=termRecall(corpus,allSections,termText,forbiddenUnitIds);
 const preferredUnits=result.interpretedIntents.flatMap(i=>i.unitIds);
 const sourceIntents=recalled.map((r,i)=>({id:'source_term_'+i,label:`查找正文中的 ${r.display}`,evidence:[r.display],unitIds:[...new Set([...preferredUnits.filter(id=>r.hits.some(c=>c.u.unitId===id)),...r.hits.map(c=>c.u.unitId)])],sectionKeys:r.hits.map(c=>c.u.unitId+'/'+c.s.sectionId),term:r.term,preferredUnit:preferredUnits.find(id=>r.hits.some(c=>c.u.unitId===id))}));
 const matchedTerms=c=>recalled.filter(r=>r.hits.some(h=>h.u.unitId===c.u.unitId&&h.s.sectionId===c.s.sectionId)).map(r=>r.term);
 const otherTask=positiveParts.filter(p=>!frontendReact.includes(p)&&!agentCue.test(p.text)).some(p=>frames.some(f=>f.patterns.some(re=>re.test(p.text))));
 if(hasFrontend&&!otherTask){result.interpretedIntents=[];result.limitations=['所选 Agent 教材未提供 React 前端框架、JSX 或 Hooks 的对应教学内容；Agent ReAct 的同名提及不适用于这个需求。'];return result;}
 const score=({u,s},intent)=>{
  const text=norm(s.searchText),title=norm(s.title),whole=norm(u.title),terms=queryTokens.reduce((n,t)=>n+(title.includes(t)?4:text.includes(t)?1:0)+(whole.includes(t)?0.3:0),0);
  const semantic=options.semanticScores?.get(u.unitId+'/'+s.sectionId)||0;
  const intentTerms=tokenize(intent?.label||'').reduce((n,t)=>n+(title.includes(t)?2:text.includes(t)?0.2:0),0);
  return Math.min(terms,6)+semantic*50+intentTerms+matchedTerms({u,s}).length*35+(intent?.unitIds.indexOf(u.unitId)===0?5:0)+(s.level===2?0.5:0)+(input.currentUnitId===u.unitId?0.2:0);
 };
 let intents=result.interpretedIntents;
 if(!intents.length&&!sourceIntents.length&&options.semanticScores){
  const best=allSections.filter(({u})=>!forbiddenUnitIds.has(u.unitId)).sort((a,b)=>(options.semanticScores.get(b.u.unitId+'/'+b.s.sectionId)||0)-(options.semanticScores.get(a.u.unitId+'/'+a.s.sectionId)||0))[0];
  const similarity=best&&options.semanticScores.get(best.u.unitId+'/'+best.s.sectionId);
  if(similarity>=options.semanticThreshold){intents=[{id:'semantic_topic',label:'与当前教材小节相关的学习需求',evidence:[input.query],unitIds:[best.u.unitId]}];result.interpretedIntents=intents;}
 }
 // A single term-focused request starts with literal source evidence. With several
 // task clauses, retain the existing task groups before adding a term group.
 intents=positiveParts.length===1&&sourceIntents.length&&intents.length<2?[...sourceIntents,...intents]:[...intents,...sourceIntents];
 result.interpretedIntents=intents;
 if(!intents.length){result.limitations=['所选 Agent 教材中未找到有足够依据的对应内容；这不表示其他行业没有答案。'];return result;}
 const requestedBeginner=input.startingPoint==='beginner'||result.interpretedIntents.some(i=>i.id==='foundation');
 if(requestedBeginner&&intents.some(i=>!['foundation','orientation'].includes(i.id))&&!intents.some(i=>i.id==='foundation'))intents=[{id:'foundation',label:'先确定基础起点',evidence:['用户选择零基础'],unitIds:['01-foundation','00-learning-route']},...intents];
 if(requestedBeginner)intents=[...intents.filter(i=>i.id==='foundation'),...intents.filter(i=>i.id!=='foundation')];
 const selected=new Set();
 for(const intent of intents.slice(0,3)){
  const candidates=allSections.filter(({u,s})=>intent.unitIds.includes(u.unitId)&&!forbiddenUnitIds.has(u.unitId)&&(!intent.sectionKeys||intent.sectionKeys.includes(u.unitId+'/'+s.sectionId))).sort((a,b)=>score(b,intent)-score(a,intent));
  const primary=(intent.id==='foundation'&&candidates.find(x=>x.u.unitId==='01-foundation'&&x.s.title==='先做入口诊断'))||(intent.preferredUnit&&candidates.find(x=>x.u.unitId===intent.preferredUnit))||(intent.term?candidates[0]:candidates.find(x=>x.u.unitId===intent.unitIds[0]))||candidates[0];
  const secondary=candidates.find(x=>x.u.unitId!==primary?.u.unitId)||candidates.find(x=>x!==primary);
  for(const c of [primary,secondary].filter(Boolean)){
   const key=c.u.unitId+'/'+c.s.sectionId;if(selected.has(key))continue;selected.add(key);
   const exactTerms=intent.term?[intent.term]:matchedTerms(c),evidenceExcerpt=excerpt(c.s,interpreted.positiveText,exactTerms);if(!c.s.bodyMarkdown.includes(evidenceExcerpt))continue;
   if(intent.term&&!englishTerms(prose(evidenceExcerpt)).some(t=>t.key===intent.term))continue;
   const reason=intent.term?`本节正文实际提及“${intent.evidence.join('、')}”；这里只定位已有论述，内容范围请以原文为准。`:`你表达了“${intent.evidence.join('、')}”；这一小节说明${intent.label}的具体机制。${requestedBeginner&&!['foundation','orientation'].includes(intent.id)?'这是目标预览，请先完成基础诊断与相关先修。':''}`;
   result.results.push({unitId:c.u.unitId,sectionId:c.s.sectionId,order:c.u.order,unitTitle:c.u.title,sectionTitle:c.s.title,title:c.s.title,reason,evidenceExcerpt,sourcePath:c.u.sourcePath,sourceSha256:c.u.sourceSha256,version:corpus.corpusVersion,href:c.s.href,intentId:intent.id,matchingBasis:intent.term?'source_term':'task_intent',matchedSourceTerms:exactTerms,prerequisiteUnitIds:c.u.prerequisiteUnitIds});
  }
 }
 result.results=result.results.slice(0,6);result.status=result.results.length?'recommended':'no_match';return result;
}
root.RolecraftContentRetrieval={recommend,interpret,validate,clauses,frames:[...frames,...v12Frames].map(f=>({id:f.id,label:f.label,units:f.units})),tokenize};
})(globalThis);
