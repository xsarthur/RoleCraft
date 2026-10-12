from pathlib import Path
import json,hashlib,collections
T=Path('sites/rolecraft/team');P=T/'textbook-v12-content-a.json';r=json.loads(P.read_text())
def h(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
r['version']='v12-content-review-a-r2';r['status']='reviewed_with_limitations';r['method']='独立重新读取收到v10实际正文形成基线，再核v12完整n01–n05及五例源码；官方/论文仅核事实不补正文分。未读QA保留变体；没有执行任何教材示例。CA-01至03由原作者修正后按相同事件顺序静态复验；运行留给QA。'
fixes={
'CA-01':'返修把冲突/已有证据核验置于新调用准入前；最后一次检索补齐后calls_left=0可返回已核事实表。新生成/外部核验仍需预算；无效提议计数且模型调用先扣预算，不能无限拒绝。已读control_gate与五断言，但未运行。',
'CA-02':'MemoryRecord枚举新增requires_recheck，派生产物状态另定义；来源revoked、直接来源source_invalid与依赖传播requires_recheck区分，active为消费必要条件。原m1→m2/o1事件不再产生未声明状态。',
'CA-03':'invalidate只把pending/confirmed_no_effect写节点转stale，done/in_flight/unknown/EFFECT_RECHECK和不明写状态均保留核对。原rule→draft→issue=unknown变EFFECT_RECHECK；新增五状态断言，未由本岗运行。'}
for issue in r['issues']:
 issue['status']='closed_static';issue['retest']=fixes[issue['id']];issue['executionStatus']='本岗未运行；QA独立执行另授结论';issue['finalFileHash']=h('sites/rolecraft/textbooks/v12/'+issue['file'])
 if issue.get('code'):issue['finalCodeHash']=h('sites/rolecraft/textbooks/v12/'+issue['code'])
for q in r['items']:
 q['finalVersion']='v12 author-A-r2; 2026-10-11; exact chapter hashes in finalEvidence'
 q['retest']=[{'issue':k,'result':'closed_static','detail':fixes[k]} for k,ids in [('CA-01',[50]),('CA-02',[34,35]),('CA-03',[17,19])] if q['id'] in ids]
 if not q['retest']:q['retest']=[{'result':'current_text_reviewed','detail':'按本题所有主要子问核当前正文；没有用外链/程序/自有知识补分。无本题返修反例则不虚构缺陷关闭。'}]
 # 原题和引用保持，不把来源组推成逐题出处认证。

urls=[
('Python asyncio','https://docs.python.org/3.14/library/asyncio-task.html','3.14系列；页面当次显示3.14.8，作者实跑版本另记','TaskGroup普通异常取消同伴、退出等待；gather默认其他任务继续；timeout与CancelledError清理语义一致。'),
('MCP lifecycle','https://modelcontextprotocol.io/specification/2025-11-25/basic/lifecycle','2025-11-25','initialize协商、initialized通知、能力协商及不支持服务端版本断开，与正文消息轨迹一致。'),
('MCP tools','https://modelcontextprotocol.io/specification/2025-11-25/server/tools','2025-11-25','tools/list/call、content、isError、inputSchema及协议/业务错误分层支持文中说明。'),
('MCP resources','https://modelcontextprotocol.io/specification/2025-11-25/server/resources','2025-11-25','URI资源、list/read及contents形状可支撑该章资源例。'),
('MCP prompts','https://modelcontextprotocol.io/specification/2025-11-25/server/prompts','2025-11-25','参数化消息模板、list/get、通常用户选择且规范不强制唯一UI，与正文一致。'),
('MCP auth','https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization','2025-11-25','HTTP授权与stdio不同；受众、保护资源元数据、令牌验证及禁止透传等边界与文中一致。正文非完整OAuth实现。'),
('MCP transports','https://modelcontextprotocol.io/specification/2025-11-25/basic/transports','2025-11-25','stdio与Streamable HTTP、协议版本头与日志通道边界；未做互操作。'),
('ReAct','https://arxiv.org/abs/2210.03629v3','v3','推理/行动交错并从环境取得观察；教材DAG与权限为另加工程设计，不冒充论文保证。'),
('Reflexion','https://arxiv.org/abs/2303.11366','v4语境','语言反馈/经验缓冲适配而非每轮权重更新；教材正确保留反馈偏误与实测边界。'),
('Transformer','https://arxiv.org/abs/1706.03762','原论文；正文明确decoder-only教学适配','缩放点积注意力、多头/位置等为基础；正文未把编码器—解码器原文误当所有商用模型内部。小矩阵演算手算一致。'),
('Faiss metrics','https://github.com/facebookresearch/faiss/wiki/MetricType-and-distances','2026-10-11动态文档','单位向量下L2平方=2-2IP及余弦映射成立；非归一化排序不等价；API可能返回平方距离。'),
('Faiss indexes','https://github.com/facebookresearch/faiss/wiki/Faiss-indexes','2026-10-11动态文档','flat、HNSW图/M/efConstruction/efSearch、IVF及nprobe等机制/资源权衡得到支持，无实测排名。'),
('pypdf extraction','https://pypdf.readthedocs.io/en/stable/user/extract-text.html','页面显示6.20.0；未安装/运行','PDF缺语义层、扫描/OCR文字层区别及pypdf非OCR工具，支撑摄取错误与溯源边界。'),
('Claude structured output','https://platform.claude.com/docs/en/build-with-claude/structured-outputs','2026-10-11动态文档','结构约束仍有refusal、max_tokens截断等例外；正文先分类后消费且不保证事实准确。')]
r['officialChecks']=[{'title':a,'url':b,'versionContext':c,'finding':d,'accessDate':'2026-10-11','status':'read_official_or_paper_not_runtime'} for a,b,c,d in urls]
r['chapterReviews']=[
{'chapter':'n01','finding':'对象/函数/并发/LRU/模型推理/输出消费围绕运行边界串联；含数据结构与失败轨迹，正文字面足够回应新增基础题。','limits':'实际模型/远端撤销/持久事务不由标准库替身证明。'},
{'chapter':'n02','finding':'四对象生命周期、来源版本、反向依赖和指代epoch构成可重建方案；Few-shot含失真/排序对照；CA-02静态关闭。','limits':'记忆抽取与多层持久图、物理擦除、团队权限尚非例子实装。'},
{'chapter':'n03','finding':'同任务比较固定/ReAct/先计划、验收逆推DAG及依赖验证、失效闭包、进展指纹和反馈消融；CA-03静态关闭。','limits':'recipe为确定性替身，不能推导真实模型规划效果或任意任务可解。'},
{'chapter':'n04','finding':'工具近邻描述、百工具目录分层、三原语完整消息与接入合同均有具体内容；协议与业务效果严格分开。','limits':'103工具词项例不等于中文语义或MCP传输/OAuth验签成功。'},
{'chapter':'n05','finding':'PDF/OCR结构、增量索引、距离演算、ANN精确基线、rerank、多跳及Agentic对照形成连贯检索链；CA-01静态关闭。','limits':'页块/向量为人工夹具，PDF/OCR、Embedding/ANN/Agentic效果没有实测。'}]
r['crossChapterReview']={'status':'reviewed_with_limitations','finding':'n01明确基础后回问题主线；n02先修f02/信任；n04建立在写工具/身份；n03在完整循环后；n05在检索/基础/规划后。前向引用n06/n09是延伸，不替代前置机制。各章维持候选≠事实、状态≠上下文、当前权限≠历史批准、未知效果≠未发生的同一语义。','limits':'跨章阅读可学性尚无真实读者证据；未逐段替B岗审n06–n10，Q8/Q10仅读取所需实际段落并绑定。'}
r['maturity']=[
{'dimension':'知识覆盖广度','finding':'本岗原50题由24/21/5至49/1/0；新10题0/5/5至10/0/0。主要必要机制在正文有实质教学。','limitation':'只是固定和便利市场样本内正文支持，不是全市场或招聘概率。','owner':'课程架构师/竞品研究员'},
{'dimension':'教学深度','finding':'五专题具有状态/接口/实现、失败反例与方案取舍；三个实质静态问题返修后关闭。','limitation':'AI静态结论不能替代真人专家技术深度认可。','owner':'内容审校员/后续真人专家'},
{'dimension':'可执行性','finding':'存在五个完整离线例，已静态检查；作者自查另记录。','limitation':'本岗未运行，独立执行须QA；真实模型、协议/OCR/ANN与持久生产机制未获本审校验证。','owner':'测试工程师'},
{'dimension':'迁移与项目训练','finding':'有EX-N01至N05与W-N01至N05，跨场景设计通向n10及既有p01/p02真实作品链。','limitation':'未读取保留题，也无真实学习者陌生任务成绩，不能认证迁移能力。','owner':'测试工程师/实训评估员'},
{'dimension':'真实学习者与求职','finding':'Q10保留部分；方法充分但本人项目、用户效果和录用证据未提供。','limitation':'未验证，完整培养与行业先进仍需原八门槛真实证据。','owner':'实训评估员/用户研究员/产品经理'}]
r['authorBinding']={'path':'sites/rolecraft/team/textbook-v12-author-a.json','sha256':h(T/'textbook-v12-author-a.json'),'version':'textbook-v12-author-a-r2'}
r['sourceBindings']={e['file']:e['sha256'] for x in r['items'] for f in ['baselineEvidence','finalEvidence'] for e in x[f]}
r['selfCheck']={'roleSeparation':'只写本岗审校与历史；不改教材、不执行示例、不读QA保留题。','scope':'60条完整题面，原50和新10分开计；每条有当前正文定位/短引文/hash，原100仅题组出处。','limitationsPreserved':True,'qaRequired':True}
P.write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
# 单独留当次终审快照，便于后续B交叉引用变化时只增新历史。
(T/'textbook-v12-content-a-history/r2-final-static.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
lines=['# v12 独立内容审校 A：机制、检索与前50题','', '日期：2026-10-11。岗位：独立内容审校员A。结论：`reviewed_with_limitations`。','',r['method'],'','## 本岗计数与范围','', '| 题集 | 改前充分/部分/未覆盖 | 改后充分/部分/未覆盖 |','| --- | --- | --- |','| 原Q1–50 | 24 / 21 / 5 | 49 / 1 / 0 |','| 新101/102/103/105/106/107/108/109/110/112 | 0 / 5 / 5 | 10 / 0 / 0 |','', '以上不是全100/14集汇总。Q10本人真实经历保留部分；方法教学有支持，教材不能提供履历。原100题只保留原聊天题组来源，不作逐题企业真题认证。当前v10实际复核与本岗历史计数一致，但没有借旧报告授新结论。','', '结构化完整矩阵及所有哈希见 [JSON](textbook-v12-content-a.json)。初次问题与原绑定见 [r1反例](textbook-v12-content-a-history/r1-counterexamples.json)，当前快照见 [r2终审](textbook-v12-content-a-history/r2-final-static.json)。','', '## 发现、返修与原例静态复验','']
for x in r['issues']:lines += [f"### {x['id']} · {x['severity']} · {x['status']}",'',x['reason'],'',f"原例：{x['counterexample']}",'',f"复验：{x['retest']}",'', '责任：教材研发员A返修，内容审校A静态复核；执行由QA另核。','']
lines+=['## 专题与跨章判断','']
for x in r['chapterReviews']:lines += [f"- **{x['chapter']}**：{x['finding']} 限制：{x['limits']}"]
lines+=['',r['crossChapterReview']['finding'],'',r['crossChapterReview']['limits'],'','## 五维成熟度（本岗证据范围）','']
for x in r['maturity']: lines += [f"- **{x['dimension']}**：{x['finding']} 限制：{x['limitation']} 后续责任：{x['owner']}。"]
lines+=['','## 一手材料核对','']
for x in r['officialChecks']:lines += [f"- [{x['title']}]({x['url']})（{x['versionContext']}）：{x['finding']}"]
lines+=['','资料访问于2026-10-11。来源用于核事实，外链全文不参与教材支持评分；未验证互操作或供应商当前行为。','', '## 逐题结论与正文定位','']
for q in r['items']:
 lines += [f"### Q{q['id']} {q['question']}",'',f"题集：{q['set']}；层级：{q['roleLevel']}；能力：{'、'.join(q['capabilities'])}。",'',f"改前：**{q['baselineSupport']}**。{q['missingSubquestions']}",'']
 for e in q['baselineEvidence']:lines += [f"- v10 `{e['file']}` L{e['startLine']}–{e['endLine']}：{e['quote']}"]
 lines += ['',f"改后：**{q['finalSupport']}**。{q['rationale']}",'']
 for e in q['finalEvidence']:lines += [f"- v12 `{e['file']}` L{e['startLine']}–{e['endLine']}：{e['quote']}"]
 lines += ['',f"剩余：{q['finalMissingSubquestions']}。责任：{q['owner']}。",'']
lines+=['## 领域自查','',r['selfCheck']['roleSeparation'],r['selfCheck']['scope'],'','本轮未执行教材代码；本报告不关闭真实模型、专业专家、用户认可、学员能力、求职和行业先进证据缺口。独立QA须核当前矩阵、原例、示例和交付绑定。']
(T/'textbook-v12-content-a.md').write_text('\n'.join(lines)+'\n')
print(r['status'],len(r['items']),r['finalCounts'])
