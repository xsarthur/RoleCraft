from pathlib import Path
import json, hashlib, collections, re
root=Path('sites/rolecraft'); out=root/'team/agent-interview-answer-content-review'
baseline=json.loads((out/'received-evidence.json').read_text())
raw={}
for line in (out/'judgments.tsv').read_text().splitlines():
    qid,strength,gap=line.split('\t'); raw[qid]=(strength,gap)
assert len(raw)==124
# Positive judgments are individually reasoned, not inferred from text length or presence of keywords.
positive={
'Q33':[
'直接回答摘要不能替换不可变证据，需结构化保留约束、未决动作及来源。',
'区分原始证据、摘要、权威状态和投影，说明比较符丢失怎样改变判断。',
'按无关删除、旧讨论摘要、大原文外置，列出摘要必要字段并与权威状态比对。',
'days<7被压成“七天内”的反例有错误原因和修正；“已创建”对UNKNOWN时明确拒绝摘要。',
'说明放不下时检索/分拆及允许压缩的信息类型，不用省token掩盖语义损失。',
'要求提交变更前后请求和候选、重查边界；事实校验可能通过但根因仍错是明确反例。'],
'Q37':[
'先按冲突种类区分本次偏好覆盖、权限不可覆盖和可信事实待确认。',
'区分当前/长期、偏好/事实、资料/授权，说明为什么不能模型投票。',
'当前明确要求本次执行，永久撤回才更新；写入要保留来源、过滤、分域和查冲突。',
'“以后中文”与“这次英文”给出作用域不同的决定；同权威同时间事实冲突则请求确认。',
'模型猜测职业/薪资不得变成已核事实；用户要求不能改变服务端权限。',
'用本次英文不得自动改长期偏好、资料指令不得改变权限的可判定反例校验理解。'],
'Q55':[
'直接提出权限/批准/预算等确定条件用规则，允许目标内的下一调查可交模型。',
'把控制权、路径可枚举性、动态调查与固定写操作拆开，说明动态不等于无限授权。',
'示例先判现有分支能否枚举，再选动态只读；模型输出映射白名单，未知节点澄清或停止。',
'同一失败报告分别讨论已知实现/调用者路径和需观察后追踪新文件；创建仍固定审批。',
'动态适用于无法合理穷举的调查，资料/预算不扩大，普通条件分支仍可包含循环。',
'“模型用了while即动态Agent”与“未知节点名可执行”均给出拒绝理由和期望动作。'],
'Q61':[
'直接用可证伪的业务/实验证据决定多Agent，而不是Agent数量。',
'独立子问题、共同偏差、串行写瓶颈与多Agent收益的因果关系已解释。',
'冻结同任务/输入/权限/配置/预算，记录完整目标、错误、用量、等待和成本。',
'控制路径与夹具调查是可分问题；结果只变长不减少漏错则放弃，串行写瓶颈不升级。',
'总预算不增且不增加越权/无支持结论是明确约束，不以更多引用代替价值。',
'假设可由漏问题是否减少、错误是否增加推翻；共同资料错误反驳“两模型同意即证明”。'],
'Q67':[
'答案提出原子主张、逐项证据和执行回执，避免子Agent结论自动变事实。',
'解释共同偏差、版本/权限核对、引用存在与支持关系及内容/执行两类证据。',
'交接携带主张/版本/输入哈希/状态，先核版本权限，拆分报告事实、根因假设、执行结果。',
'days<7只证明代码比较而不证明业务规则；整句复合结论拆成三个对象再验证。',
'不按投票或最后到达覆盖冲突，INCOMPLETE不当没有问题。',
'对引用存在但推断越界以及报告不能证明工单创建的反例给出可判定边界。'],
'Q72':[
'区分内容结果、过程安全与资源使用能发现的不同错误。',
'无依据根因、越权读取和重复调用分别是不同故障层，均分不能定位。',
'以run/model_attempt/action/attempt身份将判断关联到相应事件，关键事实用完整账本。',
'即便最终拒答仍可能先越权读到资料；读对文件却反复二十次的例子揭示资源问题。',
'trace采样/导出失败不能证明没有违法动作，秘密不应进入普通trace。',
'使用相同结果但不同轨迹的反例可区分两类评测，要求读取不同证据。'],
'Q75':[
'先说明模型评分能初筛但有偏差，不能把评分器当无误裁判。',
'覆盖位置/冗长/自偏好、误放/误拒、校准过拟合与裁判版本变化。',
'人先标多类样本并保留分歧，再比误放/误拒，高风险人审，独立新材料重验。',
'10拒/20收的虚构样本给出2/10误放、6/20误拒和22/30一致，明确标虚构。',
'安全争议优先人审，改变裁判要重评两版本，不外推论文基准成绩。',
'始终拒绝可误放为零但功能失败，反例直接检验为何不能只看一致率。'],
'Q78':[
'说明要分开模型、reranker和工具变化，不能从一起变好归因任一项。',
'包含主效应、交互、不可行任务与oracle替身的不同解释边界。',
'固定输入/资源，单变量比较及基础/新模型/重排/两者四组合，保留每次轨迹。',
'去掉唯一订单工具导致不可解，不能当模型变弱；理想观察只能是oracle对照。',
'共同可行子集与全量不可行标记分别报告，小样本不作精确统计承诺。',
'联合变化与单项和对照、独立数据、重复运行与严重错误监控构成可证伪检验。'],
'Q81':[
'明确直接来源于对话，间接来源于被处理资料。',
'解释入口差异与权限不由文本文风产生；检测器与执行隔离职责不同。',
'实际阻断点在可信身份下的工具资源/动作/预算和执行环境，而非仅引号包裹。',
'对话要求读别账户、PDF伪造授权上传目录是两个可辨来源的反例，说明拒绝依据。',
'用户也只能授权自己可控资源，检测漏过与模型可能被影响均不扩大执行权。',
'分别记录提议越界和实际越权，防止“攻击未得逞=模型不受影响”的错误检验。'],
'Q82':[
'直接指出提示文本无法拦读取服务返回秘密，也无法撤回已发送操作。',
'区分模型提议、外部资料、可信身份与对象授权；强调读前和发前两道控制点。',
'由宿主取身份并按每次请求核对象/操作，不能使用模型提供tenant_id证明归属。',
'完全合理的跨组织凭据读取仍拒绝；先读全部再让模型选会先泄露的反例解释结果。',
'不能以注入检测成功为授权前提，内部工具请求同样要鉴权。',
'改写攻击措辞后授权规则仍成立；最终拒答但资料已进入模型必须判读取边界失败。'],
'Q89':[
'先说明补偿是新业务动作，不是数据库时光倒流。',
'把原效果、补偿效果、依赖次序、未知状态和用户任务结果拆开。',
'先判可撤/权限/窗口，按逆依赖撤草稿再释放预留，分别记原操作与补偿身份/回执。',
'预留→草稿→发布失败有后续撤销次序；原unknown先查、补偿超时仍查原补偿动作。',
'不能恢复排队位置或抹掉已读通知，持续失败交人工并保留责任。',
'“发起补偿≠全部恢复”“原任务失败不因补偿成功变成功”提供具体状态反例。'],
'M111':[
'明确先定位跨语言失效层，而非直接换模型。',
'覆盖输入/分词、检索、提示、工具参数和评测偏差，并说明各层如何影响同一任务。',
'先人工核等价配对，再逐层读观测，首偏离处最小修改，重测端到端及其他语言。',
'同政策检索成功但订单ID被译成汉字先修参数；中文检索为空则不能把流畅回答当恢复。',
'保护ID前导零、否定和业务约束，不以机器翻译或单例通过推任意语言可靠。',
'配对任务包含长短句/否定/实体，观测召回、参数与评价标签，可推翻误归模型的解释。'],
'M114':[
'直接以接收者能独立重建、评测、解释架构及处理失败来定义接手成功。',
'覆盖定义/工件、版本、环境、架构决策、运行证据、安全和运维责任。',
'冻结包→非作者空环境重建→正常/故障/恢复验收→记录差异→作者修包→重新验收。',
'无法启动、配置目标错、快照缺、外部服务没权限分别诊断并决定修订或保留缺证。',
'不附密钥、不用口头补关键步骤后冒称独立复现，无真实接收者不称接手成功。',
'验收含自选输入、失败例、架构说明、暂停恢复/回退，记录人/环境/版本/命令/输出。']}
labels=['直接回答','多角度机制','可操作路径','具体案例与分支','条件与取舍','验证方法','来源与不确定性','可读与可用']
items=[]
for e in baseline['entries']:
    qid=e['id']; strength,gap=raw[qid]
    gaps={} if gap=='-' else {part[:2]:part[3:] for part in re.split(r'；(?=[0-9]{2}:)',gap)}
    assert all(k in [f'{i:02d}' for i in range(1,9)] for k in gaps),(qid,gaps)
    loc=f"{e['file']}:{e['line']}"
    ev=e.get('evidence',[])
    refs=[{'id':x['id'],'answerDataLocation':f"{e['file']}:{x['dataLine']}",'source':x['sourcePath'],'startLine':x['startLine'],'endLine':x['endLine'],'sha256':x['sourceSha256']} for x in ev]
    criteria=[]
    for n,label in enumerate(labels,1):
        num=f'{n:02d}'; c=f'AQS-{num}'
        if num in gaps:
            status='not_met'; reason=gaps[num]
        elif qid in positive and n<=6:
            status='pass'; reason=positive[qid][n-1]
        elif n==7:
            status='pass'; reason='当前v12教材文件/小节/行号/哈希已绑定；本次逐条核对原文范围及哈希，327条均一致。仅支持给定教学主张，不继承旧QA或宣称外部服务已实测。'
        elif n==8:
            status='pass'; reason='此项未发现阻断理解的独立问题；以当前显示顺序审读，其他AQS缺失不因语句可读而获得通过。'
        else:
            status='pass'; reason='本项可观察内容见本题已具备部分及其当前文本；不表示其他子问齐备。'+strength
        criteria.append({'id':c,'name':label,'applicable':True,'status':status,'reason':reason,'evidenceLocation':loc,'evidenceRefs':[r['id'] for r in refs] or [e.get('originalId',qid)]})
    status='pass_within_content_review_scope' if not gaps else 'not_met'
    defects=[{'id':f'CR-{qid}-{n}','criterion':f'AQS-{n}','reason':s,'owner':'教材研发员','status':'open','repairAction':'在保留现有正确内容和题意的前提下补齐：'+s,'firstCounterexample':{'type':'静态当前答案与明确子问/必要机制对照','receivedQuestion':e['question'],'observed':s,'location':loc},'retest':'对当前题面、返修后的完整显示文本、原反例及受影响关联题重新逐项审读；涉及行为保证时由QA另定并执行必要的安全反例。'} for n,s in gaps.items()]
    items.append({'id':qid,'question':e['question'],'set':e['set'],'answerLocation':loc,'sourceRefs':refs,'contentStatus':status,'scope':'当前实际参考材料的静态内容质量，不授予运行/真人/整体产品通过','strength':strength,'criteria':criteria,'defects':defects,'personalExperienceStatus':'requires_learner_evidence_not_authored' if qid in ['Q10','Q99','P05'] else 'not_applicable','authorRevision':None,'retestStatus':'pending_author_revision' if gaps else 'QA_independent_review_pending','nonBlockingNote':('原文摘录仍可编排得更顺畅；不得把此内容结论升级为运行通过或真人专家认可。' if not gaps else None)})
counts={}
for group in ['fixed100','market14','prototype10']:
    rows=[q for q in items if q['set']==group]
    counts[group]={'total':len(rows),'contentPassWithinScope':sum(q['contentStatus'].startswith('pass') for q in rows),'notMet':sum(q['contentStatus']=='not_met' for q in rows)}
counts['all']={'total':len(items),'contentPassWithinScope':sum(q['contentStatus'].startswith('pass') for q in items),'notMet':sum(q['contentStatus']=='not_met' for q in items)}
assert sum(counts[k]['total'] for k in ['fixed100','market14','prototype10'])==124
assert counts['all']=={'total':124,'contentPassWithinScope':13,'notMet':111}
summary={
'reviewer':'内容审校员（独立代理）','date':'2026-10-14 Asia/Shanghai','version':'agent-interview-answer-content-review-1','standard':'ANSWER_QUALITY_STANDARD.md 1.0 AQS-01–08','status':'reviewed_with_limitations','allAnswersMeetStandard':False,'completeProductStatus':'not_met','counts':counts,
'method':['读取当前两个答案载体及实际渲染函数，不用题库历史supportStatus判质量。','人工逐题对照题面、显示摘录与AQS，124题全部完成。判断理由在judgments.tsv，最终展开矩阵见items。','按实际教学内容判断；不以摘录形式、字数、篇幅、字段名或模板匹配直接判不合格。','327条摘录均只读核对当前来源哈希和指定行范围；这是身份辅助，不是语义通过判据。','Q75论文特定偏差主张另核一手论文摘要；没有将原论文基准成绩外推到本项目。','未修改任何答案、教材、应用或历史报告；没有执行应用、教材代码、外部工具业务或付费调用。'],
'currentSourceFacts':['114题来源为dist/learning-v13-data.js的327条evidence.quote；实际逐条渲染在dist/learning-experience-v13.js:65。','当前page()在dist/learning-experience-v13.js:81将questions/review/check路由显示为后续开放；本审读覆盖保留内容资产，不声称当前用户入口已经开放。','原型P01–P10保留原q1–q10身份，参考回答位于prototype.html:44–53，显示逻辑:103。','Q10/Q99/P05的真实经历由学习者提供；本审校只判参考方法质量，不要求作者编造经历。'],
'limitations':['pass_within_content_review_scope仅为当前显示材料已满足本次静态教学语义检查，最终逐题产品met尚须QA独立核验及解决分歧。','未重跑旧教材例、未实测任何提供商/框架/生产服务；主要未达标原因是当前显示内容明确缺问/缺核心机制，非推断代码错误。','除Q75外没有把所有教材外链逐一重新网络访问；对已发现内容缺口的题，不用旧外链/审校结论予以通过。','真人专家、真实读者理解、求职/职业能力、真实产品与行业先进性无新增证据。','未查看QA保留变体题面，不将作者接触过的公开题组冒称独立保留测试。'],
'primarySourceCheck':{'url':'https://arxiv.org/abs/2306.05685','title':'Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena','checked':'2026-10-14','scope':'摘要确认位置/冗长/自增强偏差和推理限制，不验证项目内评分器'},
'nextActions':[{'owner':'教材研发员','action':'逐题按开放缺陷补齐独立参考材料，优先P02/Q11–Q15/Q26/Q57；保留题意/正确内容/来源，不自行改变历史教材。'},{'owner':'内容审校员','action':'收到返修后按每项原反例和受影响题复验，保留首次收到结论。'},{'owner':'测试工程师','action':'独立通读当前题目/答案与来源，对分歧给反例，验证必要的行为承诺及发布材料身份。'},{'owner':'项目经理','action':'保持124工件分母并协调当前版本回归，不能以检查报告完成关闭111题内容缺口。'}],
'items':items}
(root/'team/agent-interview-answer-content-review.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
# Readable report: one complete entry per current answer with all eight criteria.
text=['# Agent 全部面试参考答案：独立内容审校','', '日期：2026-10-14（Asia/Shanghai）；标准：AQS-01–08；审校范围：当前124个答案工件。','', '**全量检查已完成，但答案没有全部达标：13题在当前静态教学内容范围内通过，111题存在明确待补缺口。** 这不是整体产品或代码运行验收，完整职业培养/行业先进目标仍为 `not_met`。','', '## 范围与方法','', '检查100道固定题、14道市场题和10道原型题，按原题ID分别记录。同主题不合并，历史副本不加分母；未读取QA保留变体。114题当前是327条教材摘录，原型10题是三条预写提纲。判断依据是实际文字对题面的覆盖和推理深度，不因形式或字数统一判失败。', '', '实际答案渲染位于 `dist/learning-experience-v13.js:65`；该文件第81行当前将题库相关入口置为后续开放，本次不重开入口。原型答案在 `dist/interview-prep-v1-prototype.html:44–53`，渲染第103行。', '', '所有327条摘录均核对当前教材哈希与指定原文行范围一致；这只证明没有错绑，不能证明摘录足够回答问题。本文不继承历史98/2/0或旧“充分”标签。Q75偏差类别另核一手[原论文摘要](https://arxiv.org/abs/2306.05685)，没有外推其基准分数。','', '## 汇总','', '| 集合 | 工件数 | 内容范围通过 | 不达标 |','| --- | ---: | ---: | ---: |']
for group,label in [('fixed100','固定Q1–Q100'),('market14','市场M101–M114'),('prototype10','原型P01–P10'),('all','合计')]:
    c=counts[group];text.append(f"| {label} | {c['total']} | {c['contentPassWithinScope']} | {c['notMet']} |")
text+=['','当前可保留的通过题：'+ '、'.join(q['id'] for q in items if q['contentStatus'].startswith('pass'))+'。通过仅指当前静态教学语义的限定结论，须与QA独立结论合并；不能由13题推导全库通过。','', '主要缺陷包括只显示冒号前导语、核心子问未回答、缺完整案例/分支、把“应测试”当作测试方法，以及原型无逐题来源。接下来作者按逐项缺陷补齐，审校与QA保留初判再复验。','', '## 逐题记录','', 'P表示本轮对旧小写q的独立命名空间；AQS编号依次为直接回答、机制、路径、案例、取舍、验证、来源、可读。以下“通过”只指该项静态审读，没有运行保证。','']
for it in items:
    text += [f"### {it['id']}　{it['question']}",'',f"- 结论：`{it['contentStatus']}`。当前答案：`{it['answerLocation']}`。",'- 已具备：'+it['strength'], '- AQS：'+'；'.join(c['id']+' '+c['status'] for c in it['criteria'])+'。']
    if it['sourceRefs']:
        text.append('- 原文证据：'+'；'.join(f"{r['id']} `{r['source']}:{r['startLine']}`" for r in it['sourceRefs'])+'。')
    for d in it['defects']:text.append('- '+d['id']+'：'+d['reason']+'责任：教材研发员；状态：open，待返修及原例复验。')
    if not it['defects']:
        for c in it['criteria'][:6]:text.append('- '+c['id']+'依据：'+c['reason'])
    if it['id'] in ['Q10','Q99','P05']:text.append('- 本人真实项目/事故证据仍由学习者提供；上述内容缺口不是要求作者虚构个人经历。')
    text.append('')
text += ['## 交接与限制','', '作者只补公开题的当前参考材料；具体缺陷ID、原始题面、每项判定和来源位置保存在同名JSON。返修版本应逐题绑定来源、AQS位置及自查；审校员按原例复核，QA独立检内容和必要运行证据。13题已有可用内容无需机械扩写，但后续修改后须重新核对。','', '本轮没有改题库/教材/程序，没有应用或教材例执行，没有真实模型/外部业务调用。除注明的一手论文核查外，没有重新抓取全部旧外链。AI内容审校不等于真人专家、真实读者理解或实际学习成效。当前全部答案目标与完整产品目标均未达标。','', '领域自查：124个唯一ID、100/14/10分母、992项AQS记录完整；所有缺项都有具体说明与作者责任；同名JSON与逐条初判TSV一致；本岗只写`team/agent-interview-answer-content-review*`。']
(root/'team/agent-interview-answer-content-review.md').write_text('\n'.join(text)+'\n')
# Verify only the report assembly consistency; not application or textbook behavior.
assert len(items)==len(raw)==124
assert sum(len(x['criteria']) for x in items)==992
assert all(len(x['criteria'])==8 for x in items)
assert all(x['defects'] or x['id'] in positive for x in items)
print(json.dumps(counts,ensure_ascii=False))
