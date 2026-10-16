import json, hashlib, re
from pathlib import Path
root=Path('/Users/shengxiong/Desktop/One People Company')
r=root/'sites/rolecraft'; out=r/'team/agent-interview-answer-revision-content-a'
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def read(p): return json.loads(p.read_text())
notes=sum([read(out/f'notes-{s}.json') for s in ['01-20','21-40','41-62']],[])
notes[55]['notes'][6]='v12固定框架与官方持久说明支持；官方langchain-ai/docs中断源页检索独立核对节点重入，直接页面取回超时；不沿用旧运行结论。'
orig=read(r/'team/agent-interview-answer-content-review.json')
old={x['id']:x for x in orig['items']}
assessment={x['id']:x for x in read(r/'team/agent-interview-answer-audit-assessment.json')['items']}
course={x['id']:x for x in read(r/'team/agent-interview-answer-revision-curriculum.json')['items']}
received={x['id']:x for x in read(out/'received/bindings.json')}
man={x['id']:x for f in ['author-a.json','author-b.json'] for x in read(r/'textbooks/interview-answers-v1'/f)['items']}
criteria_names=['直接回答','多角度机制','可操作路径','具体案例与分支','条件与取舍','验证方法','来源与不确定性','可读与可用']
items=[]; errors=[]; source_set={}; old_n=0
for row in notes:
 id=row['id']; m=man[id]; p=r/'textbooks/interview-answers-v1'/m['answerPath']; lines=p.read_text().splitlines(); h=sha(p)
 if h!=m['answerSha256'] or h!=received[id]['sha256']:errors.append([id,'answer_sha_mismatch'])
 start=9 if int(id[1:])>=41 else 5
 end=next(i+1 for i,l in enumerate(lines) if l.startswith('## 参考'))-1
 refs=[]
 for b in m['sourceBindings']:
  if 'path' not in b: continue
  sp=root/b['path']; actual=sha(sp)
  if actual!=b['sha256']:errors.append([id,'source_sha_mismatch',b['path']])
  refs.append({**b,'actualSha256':actual,'bindingMatches':actual==b['sha256'],'reviewMethod':'对应小节原文语义核对，支持范围见本题AQS理由；不继承该教材旧执行结论。'})
  source_set[b['path']]=actual
 criteria=[]
 for i,n in enumerate(row['notes']):
  cid=f'AQS-{i+1:02}'
  loc=[start,start] if i==0 else ([end+1,len(lines)] if i==6 else ([1,len(lines)] if i==7 else [start,end]))
  criteria.append({'id':cid,'name':criteria_names[i],'applicable':True,'status':'pass','reason':n,'evidence':{'path':str(p.relative_to(root)),'lineRange':loc},'impact':'本题静态参考解析满足该项；不表示其建议方法已实测。'})
 opens=set(assessment[id]['openContentDefectIds']); prior=[]
 for d in old[id]['defects']:
  if d['id'] not in opens: continue
  idx=int(d['criterion'].split('-')[-1])-1;old_n+=1
  prior.append({'id':d['id'],'criterion':d['criterion'],'previousReason':d['reason'],'previousCounterexample':d.get('firstCounterexample'),'currentStatus':'closed_by_new_answer_static_recheck','newEvidence':criteria[idx]['reason'],'currentAnswerSha256':h,'limits':'关闭仅指本轮新答案的原静态内容缺口；历史失败记录保留，不关闭应用行为或真人效果。'})
 ce=course[id]['firstCounterexample']
 items.append({'id':id,'collection':'fixed100','question':m['question'],'answerPath':str(p.relative_to(root)),'answerVersion':m['answerVersion'],'answerSha256':h,'receivedSha256':received[id]['sha256'],'receivedUnchangedAtReviewEnd':h==received[id]['sha256'],'author': '教材研发员A' if int(id[1:])<=40 else '教材研发员B','decision':'met_within_reviewed_scope','scope':'当前62题新答案逐题静态语义与来源审校；不是QA执行或真实效果。','criteria':criteria,'sourceBindings':refs,'priorFinalDecision':assessment[id]['decision'],'priorDefectRechecks':prior,'originalCounterexampleRecheck':{'counterexample':ce,'method':'阅读全文后的静态反例推演，未执行代码','result':'pass','basis':row['notes'][2]+' '+row['notes'][3]+' '+row['notes'][5]},'newDefects':[],'personalEvidenceRequired':m.get('personalEvidenceRequired',False),'runtimeExecutionByReviewer':0,'limits':['案例/数字/测试均为教学设计或计划；未作模型、框架、外部接口执行','Q10为真实经历整理框架与明确虚构例；不证明读者有该经历'] if id=='Q10' else ['静态通过不等于代码、真实接口、框架/模型或用户效果已验证']})
primary=[
('https://arxiv.org/abs/2210.03629v3','ReAct v3','Q11','推理与行动交错、环境信息进入后续决策；只核该研究机制。','direct_open'),
('https://www.anthropic.com/engineering/building-effective-agents','2024-12-19文，当前带工具生态变更声明','Q1–Q8/Q12','预定义workflow与动态路径及先简单方案的概念范围；不引用平台排名。','direct_open'),
('https://modelcontextprotocol.io/specification/2025-11-25/basic/lifecycle','MCP 2025-11-25','Q27/Q29','initialize、initialized、协议与能力协商，不支持版本应停止。','direct_open'),
('https://modelcontextprotocol.io/specification/2025-11-25/server/tools','MCP 2025-11-25','Q27/Q28','工具发现调用、Schema和返回对象；协议不授业务权限。','direct_open'),
('https://modelcontextprotocol.io/specification/2025-11-25/server/resources','MCP 2025-11-25','Q28','URI资源与读取对象，区别操作与模板。','direct_open'),
('https://modelcontextprotocol.io/specification/2025-11-25/server/prompts','MCP 2025-11-25','Q28','参数化模板及用户选择取向，不等执行任务。','direct_open_and_find'),
('https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization','MCP 2025-11-25','Q29','HTTP/stdio差异、受众绑定及令牌透传限制。','direct_open_and_find'),
('https://agentskills.io/specification','2026-10-14滚动规范','Q30','SKILL.md必需文件、可选资源目录和渐进读取。','direct_open_and_find'),
('https://a2a-protocol.org/v0.3.0/specification/','A2A 0.3.0固定页面','Q30','任务、消息和产物交换的职责；不核具体互操作。','direct_open_and_find'),
('https://www.rfc-editor.org/rfc/rfc9110.html#section-10.2.3','RFC 9110','Q25','Retry-After表达后续请求应等待的时间；应用仍控制总期限。','direct_open_and_find'),
('https://docs.langchain.com/oss/python/releases/langchain-v1','LangChain v1滚动说明','Q51','create_agent为高层构造入口且建在LangGraph上；未将最新新增API带入固定包环境。','direct_open'),
('https://docs.langchain.com/oss/python/langgraph/persistence','2026-10-14滚动说明','Q51/Q56','checkpointer与线程关联保存执行状态；耐久后端和实际部署需另验。','direct_open'),
('https://github.com/langchain-ai/docs/blob/main/src/oss/langgraph/interrupts.mdx','官方文档源main滚动页','Q56','官方源检索返回规则：resume从整个节点起点重入，之前代码重新执行。未把直接页面取回失败说成成功。','official_source_search_excerpt')
]
input_files=['team/ANSWER_QUALITY_STANDARD.md','team/agent-interview-answer-revision-product.md','team/agent-interview-answer-revision-product.json','team/agent-interview-answer-revision-curriculum.md','team/agent-interview-answer-revision-curriculum.json','team/agent-interview-answer-audit-assessment.json','team/agent-interview-answer-content-review.json','team/agent-interview-answer-content-review/reconciliation.json','team/employees/core/content-reviewer/ROLE.md','team/employees/core/content-reviewer/MEMORY.md','textbooks/interview-answers-v1/author-a.json','textbooks/interview-answers-v1/author-b.json']
report={'schemaVersion':1,'version':'agent-interview-answer-revision-content-a-1','date':'2026-10-14','timezone':'Asia/Shanghai','owner':'独立内容审校员A','assignment':'Q1–Q62，共62题','answerSetVersion':'interview-answers-v1','status':'reviewed_with_limitations','answerDecision':'met_within_reviewed_scope','all124AnswersMeetStandard':'not_determined_by_this_62_question_report','completeProductStatus':'not_met','counts':{'questions':62,'met_within_reviewed_scope':62,'not_met':0,'insufficient':0,'criteriaApplicable':496,'criteriaPass':496,'newDefects':0,'priorOpenContentDefectsRecheckedClosed':old_n,'sourceBindingsChecked':sum(len(x['sourceBindings']) for x in items),'uniqueLocalSources':len(source_set),'reviewerRuntimeExecutions':0},'method':['逐篇读取当前完整题面、解析和出处，依据题意而非字数/固定栏目审查八项标准','逐题对照课程推理链及原反例；旧静态通过仅作为历史输入不自动继承','本地具体来源小节语义核对；源/答案哈希只做版本绑定，不能替代语义判断','代码/JSON/伪代码与算例只做静态契约/逻辑核；执行验证由QA岗位承担','第一批收到状态保存在received/，本报告保留该批快照与当前绑定；作者已有r2的题不冒充首个r1审校'], 'limitations':['本报告只覆盖Q1–Q62，不能替Q63–Q100、M101–M114、P01–P10或整体124题通过','内容审校并非独立QA；未运行应用、教材例、框架、模型或外部服务','真实学习者、本人经历、真人行业专家、面试结果、行业先进和生产经济性均未由此确认','官方滚动文档仅用于声明的机制范围；固定LangGraph依赖的完整兼容性和持久运行未测','Q56直接官方中断页面与GitHub正文打开未完成，独立一手依据使用官方仓库源检索返回的明确重入说明；保留取回失败过程'], 'firstCandidateArchive':{'path':str((out/'received').relative_to(root)),'count':62,'allAnswersUnchangedAtEnd':not errors},'bindingErrors':errors,'inputBindings':[{'path':str((r/p).relative_to(root)),'sha256':sha(r/p)} for p in input_files], 'localSourceBindings':[{'path':p,'sha256':h} for p,h in sorted(source_set.items())], 'primarySourceChecks':[{'url':u,'versionOrDate':v,'questionScope':q,'support':s,'method':m,'checkedAt':'2026-10-14','executionEvidence':False} for u,v,q,s,m in primary], 'items':items,'nextActions':[{'owner':'测试工程师','action':'按当前哈希继续逐题独立语义核验及其必要有限执行；本报告不替其验收。'},{'owner':'项目经理','action':'与另一内容审校批次、QA及工程接入证据整合；新改动重绑定并由原审校岗位复验受影响项。'}]}
assert not errors, errors
p=r/'team/agent-interview-answer-revision-content-a.json';p.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
md=['# Agent答案返修独立内容审校A：Q1–Q62','', '日期：2026-10-14。责任岗位：独立内容审校员A。版本：`agent-interview-answer-revision-content-a-1`。', '', '**结论：当前62题正文在静态内容与来源审校范围内全部满足适用AQS要求，状态为 `reviewed_with_limitations`。** 未发现新关键缺陷；不是124题整体通过，也不是应用、模型/框架运行、真人专业或学习效果通过。完整产品仍为 `not_met`。', '', f'逐篇阅读全文与题面，核八项AQS共496项；对前轮仍开放的{old_n}项内容缺口按当前答案逐项静态复核。旧19题结论不继承。没有执行应用、教材例、框架、模型或真实接口；JSON字段/哈希检查只用于绑定，不代替本次语义审校。', '', '逐题八项理由、受检行范围、原缺陷与原反例结果、完整哈希及168条来源绑定见[机器可读矩阵](agent-interview-answer-revision-content-a.json)。收到快照保存在[received](agent-interview-answer-revision-content-a/received/bindings.json)。', '', '## 逐题结果', '', '| 题目 | AQS01–08 | 当前版本 | 原反例的本轮静态依据 |', '| --- | --- | --- | --- |']
for x in items:
 summary=x['criteria'][3]['reason']+' '+x['criteria'][5]['reason']
 summary=summary.replace('|','／')
 md.append(f"| [{x['id']}](../textbooks/interview-answers-v1/answers/{x['id']}.md) | 8项pass | {x['answerVersion']} · `{x['answerSha256'][:12]}` | {summary} |")
md+=['','## 来源和实际核查范围','','本地来源按具体小节核对机制、反例、适用条件；当前62题与作者manifest、收到快照的哈希全部一致，168个逐题来源绑定一致。原始内容与审校记录均未改写。','', '独立一手查核覆盖ReAct v3、Anthropic架构定义、固定MCP 2025-11-25生命周期/Tools/Resources/Prompts/授权、Agent Skills规范、A2A 0.3.0、RFC 9110、LangChain v1与LangGraph持久化。Q56的官方中断直达页迟迟未返回，官方仓库文档源检索返回明确节点重入规则，作为其独立一手依据；不假称直达页已成功读完。','']
for x in report['primarySourceChecks']:md.append(f"- [{x['versionOrDate']}]({x['url']})：{x['questionScope']}；{x['support']}")
md+=['','## 静态限制与交接','','- Q10仅提供真实经历的组织方法与明确虚构示范，不证明任何读者拥有该经历。','- Q13等伪代码、Q22 JSON、Q54合并性质与各题故障/算例仅静态核查；必要执行由测试工程师独立定案。','- 框架固定依赖完整兼容、真实MCP/A2A/OAuth互操作、并发持久性、任意中文召回均未据此验证。','- 源码、派生数据、原型展示与124题最终结论须由各责任岗另验；不得把本批状态写成全部交付或完整培养目标已达标。','- 任何作者后续变更须重算绑定并复验原例与受影响范围，本次结论仅对JSON所列字节有效。','','本岗只写此报告、同名JSON及同名前缀证据目录；未改正文、作者manifest、程序、旧审计或QA记录。']
(r/'team/agent-interview-answer-revision-content-a.md').write_text('\n'.join(md)+'\n')
print(json.dumps(report['counts'],ensure_ascii=False))
print('report_sha256',sha(p))
