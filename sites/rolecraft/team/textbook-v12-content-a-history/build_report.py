from pathlib import Path
import json,hashlib,collections
ROOT=Path('.')
TEAM=Path('sites/rolecraft/team')
V10=Path('sites/rolecraft/textbooks/v10'); V12=Path('sites/rolecraft/textbooks/v12')
old=json.loads((TEAM/'interview100-coverage-01-50.json').read_text())
market=json.loads((TEAM/'textbook-v12-market.json').read_text())

def h(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def evidence(p,a,b=None,usage='support'):
 p=Path(p); lines=p.read_text().splitlines(); b=b or a
 section=next((lines[i] for i in range(a-1,-1,-1) if lines[i].startswith('#')),lines[0])
 meaningful=[(i+1,t) for i,t in enumerate(lines[a-1:b],a-1) if t.strip() and not t.startswith(('#','```','| ---'))]
 pick=next(((i,t) for i,t in meaningful if not t.startswith('|')),meaningful[0] if meaningful else (a,lines[a-1]))
 return {'file':str(p),'line':pick[0],'startLine':a,'endLine':b,'section':section,'quote':pick[1][:220],'sha256':h(p),'usage':usage}
def byphrase(file,phrase,end=None,version=V12):
 p=version/file; ls=p.read_text().splitlines(); a=next(i+1 for i,t in enumerate(ls) if phrase in t)
 b=next((i+1 for i,t in enumerate(ls) if end and end in t and i+1>=a),a)
 return evidence(p,a,b)

# 本表是独立读当前正文后形成的逐题判断；旧JSON仅提供不可改题面及已知定位。
claims={
1:'定义及同目标下观察改变路径的可观察例，区分模型提议与宿主执行。',
2:'材料齐全、路径可枚举、路径依新观察三条件对应单调用/固定/动态，并给反向选择条件。',
3:'从真实角色、当前任务和障碍提问，明确材料、权限、成功/等待和替代方案再选择。',
4:'n02四类状态与一次报告/长任务/跨会话偏好对照，补齐长期记忆与持久状态区别。',
5:'同目标、权限、模型和预算比较合格/错误完成/费用/等待，按失败来源决定动态性是否值得。',
6:'规则可表达且资料稳定时选择普通程序，ADR记录实际备选、证据与维护代价。',
7:'单运行多工具与独立子任务/交接/整合不同，多Agent新增版本冲突、统一预算和唯一写入责任。',
8:'n06同时解释自研状态机、框架调度能力与成本、低代码导出/恢复/权限限制，以及同任务故障合同对照。',
9:'从需求证据、完成合同、权限与运行恢复，延伸到评测、发布回退、复现和成本；不是demo即服务。',
10:'提供真实问题、同条件效果验证与本人贡献/事故证据组织方法；教材不能提供学习者本人真实经历。',
11:'n03同任务比较逐观察ReAct与预先依赖计划，指出动态路径、轮次、短视和假设失效区别。',
12:'三策略机制、任务输入条件、正常与失败轨迹，以及同预算选择条件均已进入正文。',
13:'权威状态/上下文、TOOLS/FINAL/ASK_INPUT、校验、执行、观察、验收/等待/停止具完整合同骨架。',
14:'候选声明不等于业务完成，完成条件关联原文、批准、回执、目标版本且无未决效果。',
15:'各类尝试/动作/恢复额度及期限分离；预留结算跨暂停保留，停止新工作但保留核对责任。',
16:'n03从验收产物逆向展开recipe，检查图/输入可达/目标完整性/授权/预算并计算前沿。',
17:'n03区分假设/目标/权限/预算变化与临时重试，传播失效、保留有效证据并用实质指纹限循环。',
18:'n03将反思变为失败证据、假设、干预与复验，解释自强化/评估偏差，给同预算消融设计。',
19:'观察更新权威状态，部分效果逐项保留，计划假设失效不抹外部事实，下一轮基于具体拒绝/观察。',
20:'唯一槽位/意图指纹处理重复效果，新证据与无进展分开，重复搜索带索引版本并受总预算约束。',
21:'完整模型输出、调用绑定、参数/工具/身份/批准/预算、意图与尝试记录后才执行，再关联观察。',
22:'n04用search/read/create相邻能力给名称、何时用/不用、Schema/单位/返回失败及错选实验。',
23:'结构合法不能证明资源归属、准确批准或内容事实；这些闸门来自运行时而非模型参数。',
24:'n04权限分区→能力候选→读回Schema/版本→渐进暴露→调用前再核；分开候选漏召回与模型错选。',
25:'只读超时可受限重试、写超时先核对、格式可修、权限拒绝/额度失败不盲重试；尝试归统一账本。',
26:'意图身份/唯一槽位/原参数/批准持久化，同键核对与下游原子去重有契约前提，未知不换键。',
27:'n04给host/client/server连接层及模型Tool Calling提议到宿主/MCP调用的完整关系。',
28:'n04解释操作、URI数据和参数化消息模板，给发现/读取/调用的不同消息轨迹及控制/权限边界。',
29:'n04将受众/签发者/scope/期限撤销/刷新、对象权限、版本协商、协议业务错误和未知效果分层。',
30:'n04比较工具提议、能力连接协议、可复用技能资料包、跨系统任务交接，给组合例及不采用条件。',
31:'n02会话事件、权威任务状态、当轮投影和跨会话记忆分别给保存内容、生命周期与权威。',
32:'外部权威账本不截断；按相关性删探索噪声、摘要旧讨论、检索原文，预留约束/输出预算并核保真。',
33:'n02保存目标revision、否定/数值/未决效果与原文引用，摘要与事实账本比较并有边界损失反例。',
34:'n02按来源/类型/作用域/确认过滤写入，expected revision更新，实体时间相同才合并；到期撤回及删除传播。',
35:'n02来源更正后沿反向依赖冻结记忆/产物，重取证与版本替代，不静改历史外部效果，缺依赖保留未知。',
36:'n02可信tenant/user/session或team范围，召回前过滤、读回重核；作用域用于读写/删除/输出绑定。',
37:'当前明确要求可覆盖旧偏好但不改权限；同权威事实冲突待确认；外部指令仍是数据。',
38:'n02职责/工具规则/输出合同/示例分层提示，身份批准独立；以错选/参数/等待/误执行等测试而非只测格式。',
39:'n02用相近工具、缺ID和否定边界示范，讨论token挤压、失真/顺序/类别偏置及四组对照。',
40:'开发/回归/保留分开，冻结模型提示资料权限预算；配对重复与原例、关联、新条件复验，记录错误与未知。',
41:'n05比较版本化外部知识、整份长上下文和行为/分布微调的更新/引用/长度/训练代价与组合条件。',
42:'摄取→合法快照→召回→重排→读回→上下文→逐主张支持，按第一处证据丢失定位。',
43:'代码/测试结构保留关键条件和引用哈希位置；块大小、邻块扩展以必要证据召回实验选择；n05补复杂文档出处。',
44:'n05固定模型空间/编码前缀与切块，按术语/中文/多语/否定/ID分层相关标签测召回排序/误答/成本。',
45:'词法保存精确身份、向量补词面差异但不证真，混合用排名融合而非异尺度直接相加，按查询组公平评估。',
46:'n05说明双塔召回与cross-encoder逐对评分，漏召回无法救回；固定候选比较上下文证据增益、质量与时延。',
47:'n05区分同问题多表达与由证据驱动的多跳，保留原ID/数值/否定/权限并记录每跳增益和停止。',
48:'来源版本/块哈希/位置读回与主张支持分别检查；引用存在不等于蕴含，声明拆成事实/推断/效果。',
49:'不足、冲突与旧版本分别处理，保留可用补证范围；不为完整答案编造事实或透露受限对象。',
50:'n05自适应选择子问题/资料域/停止，维持证据状态；五类任务与强固定基线在同预算比较。',
101:'n01解释await协作、阻塞和无界Task，固定worker+有界队列及TaskGroup取消/清理，最小离线例可定位边界。',
102:'n01以嵌套别名/深浅拷贝/tuple内部可变重建污染，函数对象/同步异步包装保留返回、异常和元数据。',
103:'n01完整OrderedDict LRU及哈希/链表机制、平均复杂度前提、容量0/覆盖/淘汰轨迹与独立编码练习。',
105:'n05三种公式、单位向量排序等价及非单位反例、零/非有限/维度拒绝均有正文。',
106:'n05 flat精确近邻不等于语义真值；HNSW/IVF机制参数、召回/内存/构建/查询实验及合法集合过滤基线。',
107:'n05来源/块/解析器manifest、变更/删除/tombstone、staging原子发布与读回当前ACL；重复/混版检测。',
108:'n05区分文字/扫描/OCR层，保留坐标/页/表头/跨页结构，分层对原页核解析质量；未核关键OCR不得作事实。',
109:'n01从token/embedding/位置、QKV因果多头、FFN残差归一到logits和采样，手算小例并区分外部检索与权重。',
110:'n01将提示JSON、JSON模式、Schema生成保障分别讲明；拒绝/截断先分类，随后类型与业务语义校验。',
112:'n02分会话与任务，作用域候选消歧、明确切换、revision/epoch迟到拒绝与返回旧任务重核。'
}
add={
4:[('n02-context-memory-prompt.md','会话历史保存','跨会话反复')],
8:[('n06-graph-orchestration.md','若只有几个稳定状态','低代码平台还需')],
10:[('n10-evaluation-projects.md','选择客服知识或长研究场景','作品证明的是')],
11:[('n03-planning-reflection.md','固定状态机预先','策略可以组合')],
12:[('n03-planning-reflection.md','固定状态机预先','策略可以组合')],
16:[('n03-planning-reflection.md','先把“做好分析”','节点完成必须')],
17:[('n03-planning-reflection.md','触发重规划','重复动作还应')],
18:[('n03-planning-reflection.md','反思的输入','比较三组')],
19:[('n03-planning-reflection.md','触发重规划','只有核实')],
20:[('n03-planning-reflection.md','步数、总期限','重复动作还应')],
22:[('n04-tools-mcp.md','`process_data`','名称和描述可以实验')],
24:[('n04-tools-mcp.md','本篇采用的目录项','完整例构造')],
27:[('n04-tools-mcp.md','宿主 host','初始化说明')],
28:[('n04-tools-mcp.md','Tools 是可调用操作','`prompts/get` 返回')],
29:[('n04-tools-mcp.md','对未知方法','接入验收需'),('n04-tools-mcp.md','若服务器回复另一版本')],
30:[('n04-tools-mcp.md','| Tool Calling','一个具体组合')],
31:[('n02-context-memory-prompt.md','会话历史保存','长任务可用压缩')],
32:[('n02-context-memory-prompt.md','输入预算先','内存与存储还有')],
33:[('n02-context-memory-prompt.md','压缩策略按','例如把 `days < 7`')],
34:[('n02-context-memory-prompt.md','写入流程由事件','本篇离线例的'),('n02-context-memory-prompt.md','删除先阻止召回')],
35:[('n02-context-memory-prompt.md','假设记忆 m1','将失效扩展到')],
36:[('n02-context-memory-prompt.md','租户标识','团队共享是')],
37:[('n02-context-memory-prompt.md','冲突分两类'),('n02-context-memory-prompt.md','写入流程由事件')],
38:[('n02-context-memory-prompt.md','本篇提示模板','此轮无真实模型')],
39:[('n02-context-memory-prompt.md','Few-shot 是','此轮无真实模型')],
41:[('n05-retrieval-ingestion.md','RAG 适合知识多','三者可组合')],
43:[('n05-retrieval-ingestion.md','坐标要说明','解析质量抽样必须')],
44:[('n05-retrieval-ingestion.md','相同维度不表示','通用榜单只能')],
46:[('n05-retrieval-ingestion.md','双塔嵌入','端到端延迟')],
47:[('n05-retrieval-ingestion.md','查询改写适合','每一跳保存')],
50:[('n05-retrieval-ingestion.md','固定 RAG 预先','若 Agentic 只在')],
101:[('n01-python-model-foundations.md','协程函数调用','演算轨迹'),('n01-python-model-foundations.md','完整离线例：[examples/n01-runtime-boundaries.py]')],
102:[('n01-python-model-foundations.md','`state2 = state1`','真实日志接收器')],
103:[('n01-python-model-foundations.md','LRU 淘汰','容量 2 时'),('n01-python-model-foundations.md','EX-N01-C 实现练习')],
105:[('n05-retrieval-ingestion.md','对非零同维向量','例中 `metrics`')],
106:[('n05-retrieval-ingestion.md','小数据先做 flat','过滤会改变问题')],
107:[('n05-retrieval-ingestion.md','块标识应绑定','完整例的 `build`')],
108:[('n05-retrieval-ingestion.md','PDF 里的字符','本地例使用')],
109:[('n01-python-model-foundations.md','这里采用 decoder-only','模型参数保存')],
110:[('n01-python-model-foundations.md','提示“请返回 JSON”','结构无法证明')],
112:[('n02-context-memory-prompt.md','会话 ID 不是','检测话题变化')]
}
capabilities=['定义与控制权','选型条件','需求澄清','组件必要性','自主性收益评估','简单方案选择','多工具与多Agent','平台选型','交付工程能力','真实项目方法与证据','ReAct机制','策略选择','控制循环','完成判定','预算与停止','依赖计划生成验证','重规划与进展','反思纠错','观察冲突与计划','重复与无进展','Function Calling执行链','工具辨识与Schema','合法性与授权','工具发现与渐进暴露','错误与重试','副作用去重','MCP连接架构','MCP三原语','第三方接入合同','四层能力职责','状态与记忆类型','上下文预算','压缩保真','记忆生命周期','污染撤回','记忆隔离','来源与偏好冲突','提示设计','Few-shot工具选择','策略评测','RAG/长上下文/微调','检索错误定位','切块策略','嵌入选型','混合检索','重排','查询改写与多跳','引用支持','缺证与冲突','Agentic RAG']
srcgroup={1:['https://www.nowcoder.com/discuss/916713177822298112','https://github.com/amitshekhariitbhu/ai-engineering-interview-questions'],2:['https://arxiv.org/abs/2210.03629','https://www.anthropic.com/engineering/building-effective-agents'],3:['https://github.com/landedjobs/awesome-ai-engineer-interview/blob/main/questions/agents.md','https://www.anthropic.com/engineering/writing-tools-for-agents','https://github.com/modelcontextprotocol/modelcontextprotocol'],4:['https://github.com/ishandutta2007/Awesome-AI-Agent-Architect-Interview-QA','https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents'],5:['https://github.com/amitshekhariitbhu/ai-engineering-interview-questions','https://gettarmac.com/interview-questions/ai-engineering-agentic-rag-interview-questions']}
items=[]
for q in old['items']:
 i=q['id'];be=[evidence(e['file'],e['start_line'],e['end_line'],'adjacent_not_support' if q['status']=='未覆盖' else 'support') for e in q['evidence']]
 fe=[evidence(e['file'].replace('/v10/','/v12/'),e['start_line'],e['end_line']) for e in q['evidence'] if q['status']=='充分' or i==10]
 fe += [byphrase(*z) for z in add.get(i,[])]
 item={'id':i,'set':'fixed100','question':q['question'],'sourceRefs':srcgroup[(i-1)//10+1],'sourceType':'既有聊天题组的主题参考；原题为重组题，非逐题企业原题认证','publishedDate':'原题组未逐题记录/混合或未知','accessDate':'2026-10-11（读取本地固定题，不冒称重检每个旧URL）','dedupGroup':f'fixed100-Q{i}','roleLevel':'初中级核心' if i!=10 else '项目经历（方法核心，个人证据另核）','capabilities':[capabilities[i-1]],'baselineVersion':'v10 received 2026-10-11','baselineEvidence':be,'baselineSupport':q['status'],'baselineSupported':q['supported_answer_points'],'baselineReview':'独立读取收到v10原段落与上下文，按本轮产品规则重新判；历史记录只供题面/定位，支持证据来自当前正文。','missingSubquestions':q['missing_answer_points'] if q['status']!='充分' else '未发现本题关键正文缺口','finalVersion':'v12 author frozen chapters with review repairs pending','finalEvidence':fe,'finalSupport':'部分' if i==10 else '充分','methodSupport':'充分（真实项目方法，不代个人履历）' if i==10 else '正文方法支持；实际运行另由QA核','personalEvidenceStatus':'未提供学习者本人真实项目证据' if i==10 else '未验证学习者掌握/职业结果','owner':'教材研发员B／实训评估员与用户研究员' if i==10 else ('教材研发员B（n06）' if i==8 else '教材研发员A；课程架构师整合'),'rationale':claims[i],'finalMissingSubquestions':'本人真实项目、角色、效果与可核原始证据' if i==10 else '未发现本题主要子问的正文缺口；外部与学习效果另列未验证','reviewer':'内容审校员A','dispute':None,'retest':[]}
 items.append(item)
newbaseline={
101:('部分',[('c01-control-loop.md',278,295),('c01-control-loop.md',690,707)],'教本地取消不等于远端撤销及依赖波次，但未教Python事件循环、阻塞/无界Task和清理最小例。'),
102:('未覆盖',[('01-foundation.md',85,92)],'基础篇只讲JSON对象、列表和函数调用；没有别名/浅拷贝/内部可变边界或日志装饰器机制。'),
103:('未覆盖',[('e05.md',146,150)],'缓存隔离与版本是相邻背景，没有LRU实现、复杂度或容量边界。'),
105:('部分',[('c02.md',38,38),('c02.md',99,108)],'旧代码有余弦与同维非零校验，但没有点积/L2公式、归一化排序等价及其反例。'),
106:('未覆盖',[('c02.md',18,26)],'有词法/语义/融合，不含flat与ANN、HNSW/IVF机制及过滤后的精确比较基线。'),
107:('部分',[('c02.md',8,16),('c02.md',222,234)],'已有不可变快照/源修订/权限读回与混版拒绝，缺增量manifest、局部替换/删除/tombstone和漏删对账。'),
108:('未覆盖',[('c02.md',8,16)],'基线从可用文本分块开始，未讲扫描/OCR/表格和跨页结构解析。'),
109:('未覆盖',[('f02.md',8,24)],'基线消费模型响应，没有Transformer token到分布的内部机制。'),
110:('部分',[('f02.md',14,24),('f02.md',188,204)],'拒绝/截断/Schema与业务检查已教，但提示JSON、JSON模式与Schema约束生成三者未完整区分。'),
112:('部分',[('c01-control-loop.md',50,58),('c01-control-loop.md',362,366)],'单任务版本与澄清恢复已有，但没有同会话多任务选择、指代消歧、切回和迟到结果隔离。')}
sources={s['id']:s for s in market['sources']}
for q in market['questions']:
 i=q['id']
 if i not in newbaseline:continue
 bs,refs,missing=newbaseline[i]; ss=[sources[k] for k in q['sources']]
 items.append({'id':i,'set':'market14','question':q['question'],'sourceRefs':[s['url'] for s in ss],'sourceIds':q['sources'],'sourceType':[s['source_type'] for s in ss],'publishedDate':[s['publication_date'] for s in ss],'accessDate':'2026-10-11','dedupGroup':f'v12-market-Q{i}','sourceIndependentGroups':[s['independent_group'] for s in ss],'roleLevel':q['level'],'capabilities':[q['capability']],'sourceDerivation':q['derivation'],'baselineVersion':'v10 received 2026-10-11','baselineEvidence':[evidence(V10/f,a,b,'adjacent_not_support' if bs=='未覆盖' else 'support') for f,a,b in refs],'baselineSupport':bs,'baselineSupported':'相邻内容与缺口详见missingSubquestions；不借关键词或评审者知识补分。','baselineReview':'实际读v10基础/检索/候选/控制循环原段及全书相关主题检索，单独按完整新题判定。','missingSubquestions':missing,'finalVersion':'v12 author frozen chapters with review repairs pending','finalEvidence':[byphrase(*z) for z in add[i]],'finalSupport':'充分','methodSupport':'正文方法支持；实跑范围另由QA核','personalEvidenceStatus':'未验证学习者独立实现或实际外部效果','owner':'教材研发员A；课程架构师整合','rationale':claims[i],'finalMissingSubquestions':'未发现主要子问的正文教学缺口；真实外部性能与学习结果仍未验证','reviewer':'内容审校员A','dispute':None,'retest':[]})
issues=json.loads((TEAM/'textbook-v12-content-a-history/r1-counterexamples.json').read_text())['issues']
report={'version':'v12-content-review-a-r1','date':'2026-10-11','role':'独立内容审校员A','scope':'n01–n05正文/五例静态；Q1–50与市场101/102/103/105/106/107/108/109/110/112共60题','status':'repair_pending','method':'先独立读取v10当前实际段落，再读v12正文及代码；官方/论文仅核事实，不补正文分。未读QA保留变体，未执行代码。当前finalSupport为知识映射候选，CA反例关闭前不授终审。','baselineCounts':{},'finalCounts':{},'items':items,'issues':issues,'officialChecks':[],'limits':['AI静态审校不是代码实跑、真人专家认可或真实学习效果。','模型提示/规划/记忆/RAG效果、MCP真实传输/OAuth、PDF/OCR、ANN性能和生产存储未由此验证。','Q10真实项目经历最多部分，方法与本人证据分开。'],'chapterReviews':[]}
for s in ['fixed100','market14']:
 report['baselineCounts'][s+'_subset']=dict(collections.Counter(x['baselineSupport'] for x in items if x['set']==s))
 report['finalCounts'][s+'_subset']=dict(collections.Counter(x['finalSupport'] for x in items if x['set']==s))
(TEAM/'textbook-v12-content-a.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print('wrote',len(items),report['baselineCounts'],report['finalCounts'])
