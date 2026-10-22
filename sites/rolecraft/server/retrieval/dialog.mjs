import { createHash } from 'node:crypto';
import { getExtractor,semanticScores } from './semantic.mjs';

export const DIALOG_VERSION='content-dialog-0.14-extractive';
const sha=s=>createHash('sha256').update(s).digest('hex');
const core=globalThis.RolecraftContentRetrieval;
// Natural-language domain descriptions are classification metadata, never answers.
const domains={
 related:[
  '理解智能体与大模型应用的机制、运行循环、工具和系统架构。',
  '软件执行一半失败，应该保存事实并恢复任务，避免重复外部动作。',
  '程序改版后需要通过相同条件的评估和实验判断结果是否更好。',
  '观测与日志应能重建系统决定和模型工具调用，使用结构化记录保护敏感数据，先建立可验证运行协议再接入真实模型。',
  'Python语言的对象引用、浅拷贝深拷贝、异步并发、缓存和事件循环。',
  '处理软件网络接口、HTTP请求、状态码、超时、异常、重试和幂等性。',
  '大模型输出不可靠，检查结构化JSON格式以及实际业务候选是否正确。',
  '为知识检索建立文档切分、向量索引、权限过滤、版本和证据引用。',
  '管理模型的提示词、上下文、记忆、规划、反思和任务重规划。',
  '比较ReAct推理行动交错、固定工作流、先计划后执行和图编排策略。',
  '为智能体产品发现真实用户问题，收集用户反馈，比较方案，定义MVP与交付。',
  '设计软件测试、评估、授权、安全、沙箱、部署、运行维护和成本。',
  '调用工具的可靠性、授权边界与返回结果验证，包括天气、旅游和烹饪工具场景。',
  '开发Agent所需的芯片、驱动、GPU推理、模型服务和工程基础知识。',
  '学习软件编程、前端框架、数据库和应用实现的工程原理。'
 ],
 unrelated:[
  '教我烹饪晚餐，红烧肉怎么做，需要哪些食材和做菜步骤。',
  '查询明天上海天气、气温、下雨和穿什么衣服。',
  '安排旅游行程，推荐景点、航班、酒店和餐厅。',
  '娱乐聊天、电影、小说、歌曲、游戏、笑话和八卦。',
  '体育比赛比分、球员和赛程。',
  '身体症状、医疗诊断、健康饮食和药物建议。',
  '个人投资、股票走势、理财、金融预测和买卖建议。',
  '个人情感、家庭生活、购物、星座和运势。',
  '当前新闻、政治人物、城市政策和社会事件。',
  '让我执行现实生活任务，订餐订票、查天气、登录账号、发消息而不是解释软件知识。'
 ]
};
const descriptionHash=sha(JSON.stringify(domains));let prototypePromise=null,active=0;
const topicUnits=[['00-learning-route'],['e01','c01-control-loop'],['e02'],['c01-control-loop','e01'],['n01-python-model-foundations'],['f01','c03'],['f02'],['c02','n05-retrieval-ingestion'],['n02-context-memory-prompt','n03-planning-reflection'],['n03-planning-reflection','c01-fixed-workflow'],['p01-discovery','p01-mvp'],['e02','e03','e05'],['f01','c03'],['n09-runtime-delivery'],['01-foundation']];
const specialistTopics=[
 {id:'recovery',text:'任务工作流中断或执行失败以后，从权威动作账本和持久提交点继续；先核对未知效果，不重复已经做过的工具动作。',units:['e01','c01-control-loop'],hints:/保存动作事实|先核对未决|提交点|提交边界|恢复/,cues:/中断|恢复|重复.{0,10}(?:执行|工具|动作)|继续.{0,8}(?:任务|执行)/},
 {id:'evaluation',text:'新版本有没有真正进步，需要事前固定代表任务样本，在同一资料权限资源条件下配对比较结果和执行过程。',units:['e02'],hints:/判断版本|案例|配对|冻结|比较|统计/,cues:/(?:新|改|两个).{0,6}版本|改版|进步|样本.{0,8}对照/},
 {id:'observability',text:'日志和模型接入的先后取舍：先让事实记录、追踪与运行协议可以验证，再接入真实模型；日志要能重建决定而非存所有聊天。',units:['c01-control-loop','e01'],hints:/观测|故障注入矩阵|控制权|用动作账本/,cues:/日志|观测|追踪|tracing|telemetry/i},
 {id:'replanning',text:'正在执行计划时出现新的观察、约束、规则或目标变化，应触发重规划；保留仍有效事实与外部效果，只让受影响依赖和后继失效。',units:['n03-planning-reflection'],hints:/重规划保留事实/,cues:/重规划|新.{0,8}(?:约束|观察|证据|规则)|计划.{0,12}(?:调整|改变|失效)/},
 {id:'reflection',text:'计划或工具失败以后如何反思：先定位具体失败证据，提出可验证原因假设，只改一个可归因因素并复验，不靠反复自述。',units:['n03-planning-reflection'],hints:/Reflection/,cues:/反思|reflection|reflexion/i},
 {id:'react',text:'边推理边行动的ReAct策略根据新观察逐步决定下一工具；重复失败可能来自短视、上下文污染和没有实质进展，需要事实指纹、重复检测和有界停止。',units:['n03-planning-reflection'],hints:/三种策略|实质进展/,cues:/\breact\b|边推理边行动|推理.{0,8}行动/i,focusTerm:'ReAct'},
 {id:'effect',text:'Agent调用预订、创建或其他写工具以后，如何确认远端操作真的成功：核对回执与原逻辑动作，超时或丢响应保留未知效果并查询，不能把模型说成功当事实。',units:['c03','e01'],hints:/本地事务和下游接口|保存动作事实|回执|响应|发送|核对|恢复/,cues:/(?:确认|核对).{0,20}(?:成功|效果)|(?:工具|调用|请求).{0,16}(?:成功|结果)/},
 {id:'planning',text:'从目标验收产物倒推依赖计划，验证节点输入输出、依赖图、工具授权和预算，而不是只检查生成计划的JSON格式。',units:['n03-planning-reflection'],hints:/倒推候选计划|验证计划/,cues:/候选计划|计划.{0,8}(?:验证|检查)|规划器/}
];
const metadataHash=sha(JSON.stringify({domains,specialistTopics:specialistTopics.map(t=>({...t,hints:String(t.hints),cues:String(t.cues)}))}));
const dot=(a,b)=>a.reduce((sum,x,i)=>sum+x*b[i],0);
async function prototypes(){
 if(!prototypePromise)prototypePromise=(async()=>{
  const extractor=await getExtractor(),items=[...Object.entries(domains).flatMap(([category,texts])=>texts.map(text=>({category,text}))),...specialistTopics.map(t=>({...t,category:'topic'}))],vectors=[];
  for(let i=0;i<items.length;i+=4)vectors.push(...await extractor(items.slice(i,i+4).map(x=>x.text)));
  return items.map((x,i)=>({...x,vector:vectors[i],units:x.category==='related'?topicUnits[i]:x.units||[]}));
 })().catch(error=>{prototypePromise=null;throw error;});
 return prototypePromise;
}
function parts(query){
 return query.split(/[，,。；;！？!?\n]|(?:顺便|另外|同时|还有|以及|并且|而是)/).map(raw=>{
  const text=raw.trim();const excluded=/^(?:我|请)?(?:先|暂时|暂)?(?:不看|不学|不讨论|不要(?:讲|说|学|看|推荐|介绍)|别(?:讲|推荐)|不想(?:学|看)|不是(?:要学|想学|\s*(?:react\b|前端))|跳过)/i.test(text);
  return {text,excluded};
 }).filter(x=>x.text);
}
const injection=/(?:忽略|无视|绕过|覆盖|忘记).{0,12}(?:限制|规则|教材|指令|提示)|伪造.{0,12}(?:章节|来源|引用)|编(?:造)?答案|(?:把|将).{0,12}(?:source|来源|审核|hash).{0,12}(?:改|设|标)/i;
function cleanInstruction(text){
 if(!injection.test(text))return {text,removed:null};
 const suffix=text.match(/(?:忽略|无视|绕过|忘记).{0,12}?(?:教材限制|所有规则|规则|限制|教材|指令|提示)(?:后|并|再|，|,|\s)*(?:请)?(.+)$/);
 if(suffix&&suffix[1]&&!injection.test(suffix[1])&&(mechanism.test(suffix[1])||knowledge.test(suffix[1])||literalOutside.test(suffix[1])))return {text:suffix[1].trim(),removed:text.slice(0,text.length-suffix[1].length)};
 return {text:'',removed:text};
}
const mechanism=/Agent|智能体|大模型|模型|工具|工作流|中断|恢复|版本|反思|重规划|软件|程序|编程|代码|系统|日志|接口|HTTP|API|Python|RAG|ReAct|MCP|A2A|LangGraph|向量|检索|上下文|幂等|沙箱|数据库|框架/i;
const knowledge=/原理|机制|设计|开发|实现|可靠|失败|恢复|故障|验证|评估|比较|工程|代码|系统|程序|工具|模型|怎么(?:判断|证明)|如何(?:判断|证明)/i;
const literalOutside=/红烧肉|菜谱|食谱|做饭|烹饪|炒菜|天气|气温|景点|酒店|航班|餐厅|星座|运势|八卦|电影|喜剧|股票.{0,6}(?:买|卖|走势)|彩票/;
const deictic=/^(?:那|它|这个|这里|这(?:一)?节|刚才|上面|继续|还有|有(?:什么|哪些)|怎么|如何|为什么|什么时候|失败模式|缺点|优点|举(?:个)?例)/;
const shortFollowup=text=>text.length<=36&&deictic.test(text)&&!mechanism.test(text)&&!literalOutside.test(text);
const plain=text=>text.replace(/```[^\n]*\n[\s\S]*?```/g,'').replace(/!\[[^\]]*\]\([^)]*\)/g,'').replace(/\[([^\]]+)\]\([^)]*\)/g,'$1').replace(/`([^`]+)`/g,'$1');
function shell(corpus){const version=corpus?.corpusVersion||'textbook-v13';return {status:'no_match',retrievalVersion:version==='textbook-v12'?'content-retrieval-0.12-v12':'content-retrieval-0.13-v13',dialogVersion:DIALOG_VERSION,engineMode:'local_dialog_rules',providerCalled:false,corpusVersion:version,corpusHash:corpus?.corpusHash||null,interpretedIntents:[],excludedIntents:[],results:[],clarification:null,limitations:[],dialog:{status:'related_uncovered',answerMode:'extractive',sentences:[],citations:[],scope:{relatedSegments:[],filteredSegments:[],contextUsed:null},message:'当前教材中尚未找到足够依据。',context:null}};}
function finish(base,status,message){base.dialog.status=status;base.dialog.message=message;base.status=({answered:'recommended',related_uncovered:'no_match',unrelated:'no_match'})[status]||status;if(status!=='answered'){base.results=[];base.dialog.sentences=[];base.dialog.citations=[];base.dialog.context=null;}delete base.dialogTopic;return base;}
function verifyContext(corpus,input){
 if(input==null)return {context:null};
 if(typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!['unitId','sectionId','corpusVersion','sourceSha256','focusTerm'].includes(k)))return {error:'上一主题字段不合法，请清除上下文重试。'};
 if(input.corpusVersion!==corpus.corpusVersion)return {error:'上一主题的教材版本与本次不同，请清除上下文重试。'};
 const unit=corpus.units.find(u=>u.unitId===input.unitId),section=unit?.sections.find(s=>s.sectionId===input.sectionId);
 if(!unit||!section||input.sourceSha256!=null&&input.sourceSha256!==unit.sourceSha256)return {error:'上一主题的章节或来源已失配，请清除上下文重试。'};
 if(input.focusTerm!=null&&(typeof input.focusTerm!=='string'||!/^[-A-Za-z0-9]{2,40}$/.test(input.focusTerm)||!plain(section.bodyMarkdown).toLowerCase().includes(input.focusTerm.toLowerCase())))return {error:'上一主题术语未通过公开原文核对，请清除上下文重试。'};
 return {context:{unitId:unit.unitId,sectionId:section.sectionId,corpusVersion:corpus.corpusVersion,sourceSha256:unit.sourceSha256,...(input.focusTerm?{focusTerm:input.focusTerm}:{})},unit,section};
}
function ambiguous(text){
 const bareReact=/\breact\b/i.test(text)&&!(/\bReAct\b/.test(text)||/Agent|智能体|推理|行动|不是.*前端|不是.*React|前端|网页|按钮|jsx|hooks|reactjs|react\.js/i.test(text));
 const barePlanning=/^(?:请|解释|讲讲|说说|我想了解|什么是)?\s*(?:规划|计划|planning)(?:是什么|怎么用|怎么做|如何做)?$/i.test(text);
 return bareReact||barePlanning;
}
const administrative=/v\d+\s*学习衔接|编辑交接说明|来源与版本|审校|本轮|历史验证|原版验证|代码运行说明|导航|学习路线|从演算到作品/;
function sentencePool(section){
 if(administrative.test(section.title))return [];
 const withoutCode=section.bodyMarkdown.replace(/```[^\n]*\n[\s\S]*?```/g,'');
 return withoutCode.split(/\n\s*\n/).filter(p=>!/^\s*(?:#|\||>|(?:[-*]|\d+[.)])\s)/.test(p)&&!/^\s*(?:来源|资料访问|验证状态|本轮|原版|历史|EX-|运行说明|导航|上一|下一|先完成|先学|本单元)/.test(p)).flatMap(p=>{
  const clean=p.trim();return [...clean.matchAll(/[^。！？\n]*[。！？]|[^。！？\n]+$/g)].map(m=>({sentence:m[0].trim(),paragraph:clean}));
 }).filter(({sentence:s})=>s.length>=12&&s.length<=200&&!/https?:\/\/|^\s*(?:#|\||```|\*\*)|\]\(/.test(s)&&!/(?:本篇|本文|本稿|旧|历史).{0,18}(?:未运行|未实测|验证|迁移|复制)|下一节|下一单元|这几个反例|这些字段|这些结果|上(?:一|文)|下方|下表|本单元为\d+|正式先修|运行\s*`|^本例.{0,20}(?:不结算|不实现|只验证|没有)|^第[一二三]次\s*`/.test(s)&&section.bodyMarkdown.includes(s));
}
function sourceResult(corpus,u,s,text){
 const excerpt=sentencePool(s)[0]?.sentence;if(!excerpt)return null;
 return {unitId:u.unitId,sectionId:s.sectionId,order:u.order,unitTitle:u.title,sectionTitle:s.title,title:s.title,reason:'根据职业知识语义定位到当前教材原文。',evidenceExcerpt:excerpt,sourcePath:u.sourcePath,sourceSha256:u.sourceSha256,version:corpus.corpusVersion,href:s.href,intentId:'dialog_semantic_topic',matchingBasis:'local_semantic_topic',matchedSourceTerms:[],prerequisiteUnitIds:u.prerequisiteUnitIds};
}
async function answerFrom(corpus,recommendation,text,usedContext,rawQuestion=text){
 let results=recommendation.results.slice(0,3);
 if(usedContext){
  const preferred=results.find(r=>r.unitId===usedContext.unitId&&r.sectionId===usedContext.sectionId);
  if(preferred)results=[preferred,...results.filter(r=>r!==preferred)].slice(0,3);
 }
 const pool=results.flatMap((r,index)=>{const u=corpus.units.find(u=>u.unitId===r.unitId),s=u?.sections.find(s=>s.sectionId===r.sectionId);return !s?[]:sentencePool(s).map(candidate=>({...candidate,r,index,u,s}));});
 if(/先.{0,35}还是|先.{0,35}再/.test(text)&&recommendation.dialogTopic){
  for(const u of corpus.units.filter(u=>recommendation.dialogTopic.unitIds.includes(u.unitId)))for(const s of u.sections){const r=sourceResult(corpus,u,s,text);if(!r)continue;for(const candidate of sentencePool(s).filter(x=>/先.{3,160}再/.test(x.sentence)))pool.unshift({...candidate,r,index:0,u,s});}
 }
 if(!pool.length)return {results:[],sentences:[],citations:[]};
 const extractor=await getExtractor(),[q]=await extractor(text),vectors=[];
 // Limit extraction work to selected source sections; never encode an entire book per question.
 const limited=pool.slice(0,72);for(let i=0;i<limited.length;i+=6)vectors.push(...await extractor(limited.slice(i,i+6).map(x=>plain(x.sentence))));
 const tokens=core.tokenize(rawQuestion),failure=/失败模式|缺点|风险|不足|局限|代价/.test(rawQuestion),repetition=recommendation.dialogTopic?.id==='react'&&/反复|重复|无进展|空转/.test(rawQuestion),definition=/是什么|什么是|定义/.test(rawQuestion),when=/什么时候|何时|触发/.test(rawQuestion);
 const focus=usedContext?.focusTerm||recommendation.dialogTopic?.focusTerm||(/\bReAct\b/.test(rawQuestion)?'ReAct':null),sequence=/先.{0,35}还是|先.{0,35}再/.test(rawQuestion);
 const ranked=limited.filter(x=>(!focus||!/(?:固定状态机|Plan-and-Execute|先计划)/.test(x.paragraph)||plain(x.paragraph).toLowerCase().includes(focus.toLowerCase()))&&(!/^(?:三者|两者|它|这|其|此|该|前者|后者)/.test(x.sentence)||focus&&plain(x.paragraph).toLowerCase().includes(focus.toLowerCase()))).map(x=>{const i=limited.indexOf(x);return {...x,score:dot(q,vectors[i])*10+tokens.reduce((n,t)=>n+(plain(x.sentence).toLowerCase().includes(t)?0.32:0),0)+(failure?(/成本|风险|短视|污染|不保证|代价|局限/.test(x.sentence)?2:/失败|不能|错误/.test(x.sentence)?0.5:0):0)+(repetition&&/实质进展|指纹|重复动作|相同状态|STOP_NO_PROGRESS|无进展/.test(x.sentence)?3:0)+(recommendation.dialogTopic?.id==='effect'&&/成功回执|查询|核对|UNRESOLVED|UNKNOWN/.test(x.sentence)?1.5:0)+(definition&&/是|指|将/.test(x.sentence)?0.4:0)+(when&&/当|改变|变化|失效|触发|新证据|规则版本/.test(x.sentence)?0.5:0)+(sequence&&/^先.{3,150}再/.test(x.sentence)?2.5:0)+(focus?(plain(x.paragraph).toLowerCase().includes(focus.toLowerCase())?1.5:0):0)-x.index*0.5};}).sort((a,b)=>b.score-a.score);
 const selected=[];let total=0;for(const x of ranked){if(selected.some(y=>y.sentence===x.sentence))continue;if(total+x.sentence.length>320&&selected.length)continue;selected.push(x);total+=x.sentence.length;if(selected.length>=2)break;}
 if(recommendation.dialogTopic?.id==='observability'&&sequence){const record=ranked.find(x=>/账本负责|记录政策|tracing\s*负责|记录.{0,20}决定/i.test(x.sentence));if(record&&!selected.some(x=>x.sentence===record.sentence)){selected.splice(1,selected.length-1,record);}}
 if(focus&&selected.some(x=>/^(?:其|它|这)/.test(x.sentence))){const dependent=selected.find(x=>/^(?:其|它|这)/.test(x.sentence)),anchor=limited.find(x=>x.paragraph===dependent.paragraph&&plain(x.sentence).toLowerCase().includes(focus.toLowerCase()));if(anchor&&anchor.sentence!==dependent.sentence){selected.splice(0,selected.length,anchor,dependent);}}
 // Put an explicit definition before a dependent sentence such as “其成本…”.
 selected.sort((a,b)=>definition?(Number(/ReAct 将|Agent 是|是指/.test(b.sentence))-Number(/ReAct 将|Agent 是|是指/.test(a.sentence))):0);
 const citations=[],sentences=[],usedResults=[];for(const x of selected){let ci=citations.find(c=>c.unitId===x.r.unitId&&c.sectionId===x.r.sectionId);if(!ci){const id='c'+(citations.length+1);ci={id,...x.r,corpusVersion:corpus.corpusVersion,corpusHash:corpus.corpusHash,quote:x.sentence,quoteStart:x.s.bodyMarkdown.indexOf(x.sentence),quoteEnd:x.s.bodyMarkdown.indexOf(x.sentence)+x.sentence.length};citations.push(ci);usedResults.push(x.r);}else{ci.quote=ci.quote+'\n'+x.sentence; /* Replace below with a single continuous supporting passage. */ const first=Math.min(ci.quoteStart,x.s.bodyMarkdown.indexOf(x.sentence)),last=Math.max(ci.quoteEnd,x.s.bodyMarkdown.indexOf(x.sentence)+x.sentence.length);ci.quote=x.s.bodyMarkdown.slice(first,last);ci.quoteStart=first;ci.quoteEnd=last;}
  sentences.push({text:x.sentence,citationIds:[ci.id]});}
 return {results:usedResults,sentences,citations};
}
export async function answerContentDialog(corpus,input,recommend,options={}){
 const base=shell(corpus);
 if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!['query','startingPoint','currentUnitId','currentSectionId','corpusVersion','previousContext'].includes(k)))return finish(base,'invalid_input','请求字段不合法，请重新输入。');
 const {previousContext,...oldInput}=input;const error=core.validate(corpus,oldInput);if(error)return finish(base,error,error==='unavailable'?'教材暂不可用。':'请输入1–1200字问题，并使用合法的教材位置。');
 const previous=verifyContext(corpus,previousContext);if(previous.error)return finish(base,'invalid_input',previous.error);
 const filtered=[],positive=[];for(const p of parts(input.query)){if(p.excluded){filtered.push({text:p.text,reason:'excluded'});continue;}const clean=cleanInstruction(p.text);if(clean.removed)filtered.push({text:clean.removed,reason:'untrusted_instruction'});if(clean.text)positive.push(clean.text);}
 base.dialog.scope.filteredSegments=filtered;
 if(!positive.length)return finish(base,'unrelated','这里只回答 Agent 开发职业知识，请提出一个相关学习问题。');
 let context=null,expanded=positive;
 if(positive.length===1&&shortFollowup(positive[0])){
  const current=input.currentUnitId&&input.currentSectionId?verifyContext(corpus,{unitId:input.currentUnitId,sectionId:input.currentSectionId,corpusVersion:corpus.corpusVersion}):null;
  const selected=current?.context?current:previous;
  if(!selected.context){base.clarification={question:'你指哪一个职业知识主题？请补充名称，或在对应章节中继续问。',options:[]};return finish(base,'needs_clarification',base.clarification.question);}
  const inheritedFocus=current?.context&&previous.context?.unitId===current.context.unitId&&previous.context?.sectionId===current.context.sectionId?previous.context.focusTerm:null;
  context={...selected.context,...(inheritedFocus?{focusTerm:inheritedFocus}:{}),origin:current?.context?'current_section':'previous_answer'};expanded=[(context.focusTerm||selected.unit.title)+'。'+selected.section.title+'。'+positive[0]];
 }
 base.dialog.scope.contextUsed=context;
 if(!context&&positive.some(ambiguous)){
  const reactQuestion=/react/i.test(positive.join(' '));
  base.clarification=reactQuestion?{question:'你指 Agent 的 ReAct 方法，还是前端 React 框架？',options:[{label:'Agent 的 ReAct 方法',query:'Agent ReAct 的推理和行动如何交错'},{label:'前端 React 框架',query:'React 前端框架如何实现网页按钮'}]}:{question:'你指 Agent 任务规划，还是其他类型的规划？',options:[{label:'Agent 的推理与行动策略',query:'Agent ReAct 的推理和行动如何交错'},{label:'Agent 的任务规划',query:'Agent 候选计划如何验证'}]};
  return finish(base,'needs_clarification',base.clarification.question);
 }
 const mode=options.mode||process.env.ROLECRAFT_RETRIEVAL_MODE||'semantic';
 if(mode==='concept')return finish(base,'unavailable','当前仅启用规则检索；语义问答暂不可用，可直接阅读课程目录。');
 if(active>=2)return finish(base,'unavailable','本地问答正在处理其他问题，请稍后再试。');active++;
 try{
  const [extractor,proto]=await Promise.all([getExtractor(),prototypes()]);const allVectors=await extractor([...expanded,expanded.join('，')]),vectors=allVectors.slice(0,-1),wholeVector=allVectors.at(-1),retained=[],evidence=[];
  const wholeRelated=Math.max(...proto.filter(p=>p.category!=='unrelated').map(p=>dot(wholeVector,p.vector))),wholeUnrelated=Math.max(...proto.filter(p=>p.category==='unrelated').map(p=>dot(wholeVector,p.vector)));
  const relatedContext=expanded.some(mechanism.test.bind(mechanism))||wholeRelated>=0.5&&wholeRelated-wholeUnrelated>=0.035;
  for(let i=0;i<expanded.length;i++){
   const text=positive[i],related=Math.max(...proto.filter(p=>p.category!=='unrelated').map(p=>dot(vectors[i],p.vector))),unrelated=Math.max(...proto.filter(p=>p.category==='unrelated').map(p=>dot(vectors[i],p.vector)));
   let decision;
   if(literalOutside.test(text)&&!(mechanism.test(text)&&knowledge.test(text)&&!/^(?:Agent|智能体).{0,8}(?:帮我|给我|写|推荐|查)/i.test(text)))decision='unrelated';
   else if(context||mechanism.test(text)&&(!literalOutside.test(text)||knowledge.test(text)))decision='related';
   else if(related>=0.53&&related-unrelated>=0.025)decision='related';
   else if(unrelated>=0.45&&unrelated-related>=0.06)decision='unrelated';
   else if(relatedContext&&related>=0.43&&related-unrelated>=0.025)decision='related';
   else decision='uncertain';
   evidence.push({text,decision,relatedSimilarity:Number(related.toFixed(4)),unrelatedSimilarity:Number(unrelated.toFixed(4))});
   if(decision==='related'){const topic=proto.filter(p=>p.category==='related').map(p=>({...p,similarity:dot(vectors[i],p.vector)})).sort((a,b)=>b.similarity-a.similarity)[0];retained.push({text,retrievalText:expanded[i],topic});}else if(decision==='unrelated')filtered.push({text,reason:'outside_career_scope'});
  }
  base.engineMode='local_semantic_extractive_dialog';base.dialog.scope.classification={descriptionHash:metadataHash,method:'local_bge_domain_comparison_with_explicit_scope_guards',segments:evidence};base.dialog.scope.relatedSegments=retained.map(x=>x.text);
  if(!retained.length){if(evidence.some(x=>x.decision==='uncertain')){base.clarification={question:'请说明它与 Agent 开发、软件工程或产品实现有什么关系。',options:[]};return finish(base,'needs_clarification',base.clarification.question);}return finish(base,'unrelated','这里只回答 Agent 开发职业知识；这次问题与职业知识无关，已过滤。');}
  const query=retained.map(x=>x.retrievalText).join('，'),sourceText=corpus.units.map(u=>u.bodyMarkdown).join('\n').toLowerCase();
  if(/\breact\b/i.test(query)&&/前端|网页|按钮|jsx|hooks|reactjs|react\.js/i.test(query)&&!/ReAct|Agent.{0,12}(?:策略|推理)|推理.{0,12}行动/.test(query))return finish(base,'related_uncovered','问题属于软件工程知识，但当前教材没有 React 前端实现的足够依据；Agent ReAct 内容不适用于这个问题。');
  const unknown=retained.flatMap(x=>[...x.text.matchAll(/\b[A-Za-z]{2,}[A-Za-z0-9]*(?:[-_][A-Za-z0-9]+)+\b/g)].map(m=>m[0])).filter(t=>!sourceText.includes(t.toLowerCase()));
  if(unknown.length)return finish(base,'related_uncovered','问题属于职业知识，但当前教材中尚未找到这些具体对象的足够依据：'+unknown.join('、')+'。');
  const retrievalInput={...oldInput,query,...(context?{currentUnitId:context.unitId,currentSectionId:context.sectionId}:{})};
  let recommendation=await recommend(retrievalInput,options);
  const rankedTopics=proto.filter(p=>p.category==='topic').map(p=>({...p,similarity:dot(wholeVector,p.vector),rank:dot(wholeVector,p.vector)+(p.cues.test(query)?0.12:0)})).sort((a,b)=>b.rank-a.rank),topic=rankedTopics[0];
  const domainTopic=proto.filter(p=>p.category==='related').map(p=>({...p,similarity:dot(wholeVector,p.vector)})).sort((a,b)=>b.similarity-a.similarity)[0];
  if(recommendation.status!=='unavailable'&&topic&&(topic.cues.test(query)||topic.similarity>=0.52&&topic.rank>=domainTopic.similarity+0.02)){
   const {scores,provenance}=await semanticScores(corpus,query+'。'+topic.text);
   const candidates=corpus.units.filter(u=>topic.units.includes(u.unitId)).flatMap(u=>u.sections.map(s=>({u,s,score:(scores.get(u.unitId+'/'+s.sectionId)||0)+(topic.hints.test(s.title)?0.12:0)+(u.unitId===topic.units[0]?0.06:0)+(s.level===1?0.03:0)}))).filter(x=>sentencePool(x.s).length&&!administrative.test(x.s.title)&&!/^练习|从演算到作品/.test(x.s.title)).sort((a,b)=>b.score-a.score);
   const selected=candidates.slice(0,3).map(x=>sourceResult(corpus,x.u,x.s,query)).filter(Boolean);
   recommendation={...recommendation,status:selected.length?'recommended':'no_match',results:selected,clarification:null,interpretedIntents:[{id:'dialog_topic_'+topic.id,label:topic.text,evidence:[query],unitIds:topic.units}],matchingMethods:['local_semantic_vectors','local_dialog_topic_vectors'],semanticProvenance:provenance,dialogTopic:{id:topic.id,unitIds:topic.units,description:topic.text,focusTerm:topic.focusTerm||null}};
  }else if(recommendation.status==='no_match'&&retained.some(x=>x.topic.similarity>=0.58)){
   const expandedTopic=query+'。'+retained.filter(x=>x.topic.similarity>=0.58).map(x=>x.topic.text).join('。');
   const {scores,provenance}=await semanticScores(corpus,expandedTopic);
   const semanticIntents=retained.filter(x=>x.topic.similarity>=0.58).map((x,i)=>({id:'dialog_semantic_'+i,label:x.topic.text,evidence:[x.text],unitIds:x.topic.units}));
   recommendation={...core.recommend(corpus,retrievalInput,{semanticScores:scores,semanticThreshold:0.66,semanticIntents}),engineMode:'local_semantic_retrieval',matchingMethods:['local_semantic_vectors','local_dialog_topic_vectors'],semanticProvenance:provenance};
   const primaryUnit=corpus.units.find(u=>u.unitId===semanticIntents[0]?.unitIds[0]),intro=primaryUnit?.sections.find(s=>s.level===1),first=recommendation.results[0];
   if(intro&&first&&((scores.get(primaryUnit.unitId+'/'+intro.sectionId)||0)>=(scores.get(first.unitId+'/'+first.sectionId)||0)-0.05)){const r=sourceResult(corpus,primaryUnit,intro,query);if(r)recommendation.results=[r,...recommendation.results.filter(x=>x.unitId!==r.unitId||x.sectionId!==r.sectionId)].slice(0,3);}
   recommendation.dialogTopic={unitIds:semanticIntents[0]?.unitIds||[],description:semanticIntents[0]?.label||''};
  }
  Object.assign(base,{...recommendation,dialog:base.dialog,dialogVersion:DIALOG_VERSION});
  if(recommendation.status==='unavailable')return finish(base,'unavailable',recommendation.limitations?.[0]||'本地语义资源暂不可用。');
  if(recommendation.status==='needs_clarification')return finish(base,'needs_clarification',recommendation.clarification?.question||'请补充问题的具体方向。');
  if(recommendation.status!=='recommended')return finish(base,'related_uncovered','问题属于职业知识，但当前教材中尚未找到足够依据。');
  const answerQuery=context?(context.focusTerm||'')+' '+retained.map(x=>x.text).join('，'):query+(recommendation.dialogTopic?'。'+recommendation.dialogTopic.description:'');
  const rawQuestion=(context?.focusTerm||'')+' '+retained.map(x=>x.text).join('，');
  const answer=await answerFrom(corpus,recommendation,answerQuery,context,rawQuestion);Object.assign(base.dialog,{sentences:answer.sentences,citations:answer.citations});base.results=answer.results;
  if(!answer.sentences.length)return finish(base,'related_uncovered','已找到相关方向，但现有正文尚不足以提取可靠的简短回答，请直接查看课程目录。');
  const first=answer.citations[0],firstSection=corpus.units.find(u=>u.unitId===first.unitId)?.sections.find(s=>s.sectionId===first.sectionId),suggestedFocus=context?.focusTerm||recommendation.dialogTopic?.focusTerm||(/\bReAct\b/.test(query)?'ReAct':null),focusTerm=suggestedFocus&&plain(firstSection?.bodyMarkdown||'').toLowerCase().includes(suggestedFocus.toLowerCase())?suggestedFocus:null;base.dialog.context={unitId:first.unitId,sectionId:first.sectionId,corpusVersion:corpus.corpusVersion,sourceSha256:first.sourceSha256,...(focusTerm?{focusTerm}:{})};
  base.limitations=[...(recommendation.limitations||[]),'回答为教材原文提取，不是生成式模型辅导；有限语义分类仍可能需要澄清。'];
  return finish(base,'answered',filtered.some(x=>x.reason!=='excluded')?'只回答职业知识部分；其余内容已过滤。':'以下是教材中的简要回答。');
 }catch(error){return finish(base,'unavailable',error?.code==='runtime_unsupported'?'语义问答需要 Node.js 24，请用支持版本启动。':'本地语义资源暂不可用，请重试或阅读课程目录。');}
 finally{active--;}
}
export function clearDialogCache(){prototypePromise=null;}
