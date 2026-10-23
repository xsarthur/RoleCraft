# 专项员工与缺口交接

## 门禁主动接力（常驻，2026-10-23）

任一验收岗位 Pass 后，必须立刻主动交给下一门岗，不必等用户追问是否已派发。常驻规则：[GATE_HANDOFF_RULE.md](GATE_HANDOFF_RULE.md)。设计签发 Pass 后立即交测试工程师做合入前功能验证；设计门与 QA 门都过，才可合入。

项目经理拥有门禁接力协调：设计、QA 与工程签发本领域并回报项目经理，由项目经理立刻派下一门、跟踪设计+QA 双门、把缺陷交给修正责任人，且只把已通过的决策板交给 Sheng。

日期：2026-10-10。用户要求对未通过问题新增agent员工专项支持。项目经理据当前prototype-0.3审计安排八位新增员工；六位原岗位保留，共十四岗。并发数量有限，按三位专业员工一批运行。

每位员工本轮首次任务是只读诊断专项缺口，交付实施准备材料、所需输入和可核验产物；实际实现、用户研究、学员试点及专业审核依后续派工执行，不把建立员工当作产品已修复。每份交付必须注明实际完成/未执行、证据来源、领域自查及复验条件。

| 员工/代理任务名 | 唯一领域 | 对应门槛 | 原领域交接人 | 本轮交付路径 |
| --- | --- | --- | --- | --- |
| 教材研发员 / textbook_author | 正文及练习编写 | teaching_quality | 课程架构师 | specialists/textbook-author.md |
| AI生成工程师 / generation_engineer | 模型生成服务 | real_generation | 软件工程接口交接，经项目经理协调 | specialists/generation-engineer.md |
| 后端数据工程师 / backend_data_engineer | 账户、持久任务与数据 | reliable_delivery | 网站工程接口交接，经项目经理协调 | specialists/backend-data-engineer.md |
| 用户研究员 / user_researcher | 用户证据研究 | user_value | 产品经理 | specialists/user-researcher.md |
| 竞品研究员 / benchmark_researcher | 可比行业研究 | comparative_advantage | 产品经理 | specialists/benchmark-researcher.md |
| 实训评估员 / practicum_evaluator | 真实作品与学习评价 | learner_creation | 课程架构师 | specialists/practicum-evaluator.md |
| 运营分析员 / operations_analyst | 成本与运营证据 | operating_economics | 产品经理 | specialists/operations-analyst.md |
| 内容审校员 / content_reviewer | 独立技术内容审校 | teaching_quality及专业证据 | 课程架构师 | specialists/content-reviewer.md |

旧门槛中的“软件工程师”责任是原完整软件领域，扩编后AI生成与服务端数据分别由对应专项员工执行，原工程师收敛为网站客户端实现；项目经理安排三个软件领域的接口交接。旧审计保留原责任与证据，后续审计以新任务和实际执行人记录，不回写历史。

作者不审核自己的内容；审校员不重写正文。AI生成工程师不修改账户数据库；后端数据工程师不调用模型推理实现。用户研究员准备和分析真实用户证据，不代产品经理调整门槛；其他专项员工亦不改变产品标准。测试工程师负责独立验收，不由专项员工自检替代。

外部访谈、招募、消息、付费服务、部署和真实账号配置须有相应授权及真实输入。本轮没有授权发送访谈邀请，员工准备材料而不联系外部人士。证据缺失保留为空；AI审校不等于人类行业专家评审。

当前网站仍prototype-0.3，正式产品整体未达标：3fail/4insufficient/1pass仅本次追踪。扩编不改变版本及结论。

## 首次实际执行与复核

八位新员工均已实际运行并完成对应路径的首次交付。教材研发员写成e03九项结构正文初稿；内容审校员发现两项P2并交回原作者，draft-0.2后按原问题独立复核文稿改进，原记录保留。其余岗位交付实施/验证准备，未调用模型、部署服务或制造真实研究结果。

原测试员工独立核对并交付[specialist-onboarding-review.md](specialist-onboarding-review.md)，材料完整性4/4通过，岗位与准备材料可接收。工程接口的命名映射、取消/终态及路径需共同冻结；初稿须课程正式接收、受控运行及实际专业审核。当前完整产品仍未达标，组织扩编验收不能关闭产品门槛。

项目经理负责下一阶段范围、依赖、接口交接、实际实施派工及版本达标复盘，具体记录见[TASKS.md](TASKS.md) E轮结尾及[RETROSPECTIVES.md](RETROSPECTIVES.md) R06。

## v0.11 内容检索专项

2026-10-11，用户要求按领航原型与v10教材推进应用，并增加根据表达意思推荐教材内容的Agent。PM新增内容检索工程师 `/root/retrieval_agent_engineer_v11`，唯一领域为教材内容检索：版本化分节索引、意图/语义召回与排序、原文引用核对、稳定章小节目标及相关公共只读接口。当前共十五岗位，按工具槽位分批；网站运行时的检索组件另由程序实现，不以员工会话本身当作已经可用的功能。

检索岗只写其新模块/派生数据和独占的新检索运输接口，不改账户任务逻辑、客户端、教材源、产品门槛或独立QA。前端消费统一合同，产品定义范围，设计定义交互，QA用独立改述与实际应用验证，PM协调派工及R14。角色资料与实际工作见[检索交接](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/team/app-v11-retrieval.md)、[当前任务](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/team/TASKS.md)。工程交付和独立验收分别记录，以实际报告状态为准。

规则扩展、本地语义向量和外部模型意图理解分别说明，缺配置不模拟模型成功。本轮实际实现了本机BGE中文向量推荐，结合分句、否定、任务概念与原文向量检索，不以精确问题预置回答；20篇教材、174个分节、368个原文段落和32条任务描述属于版本化索引。查询时禁止远程模型，正常模式不需要API key；有限场景效果与原反例复验由[当前独立QA](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/team/app-v11-qa.md)给出，不承诺任意中文或其他职业检索。旧标准和历史审计不因增加岗位改写；完整职业培养、真实教材生成、行业比较与生产经济性仍需各自证据。


## v12证据专项：八岗提示词更新与接单

用户“根据上方提示词生成对应员工”授权本次组织配置。八岗已存在于十五岗名册，沿用唯一领域与原门槛负责人，不重复扩编。新[员工名册](employees/v12-evidence/README.md)与[共同规则](employees/v12-evidence/COMMON.md)保存八份提示词、首任务、写入边界和实际接单；旧specialists资料及审计保留。

- 专业复核准备：内容审校员；真实学员评价：实训评估员；真实学习和求职反馈：用户研究员。
- 模型生成：AI生成工程师；持久任务和数据交付：后端数据工程师。
- 公平行业比较：竞品研究员；实际经济性：运营分析员；独立证据验收：测试工程师。

并发按可用四个槽分批，员工会话结束后以文件再次派工，不承诺后台常驻。真人专业意见、学习者作品、实际调用和生产效果不会由建队自动产生；原八门槛及完整产品not_met保持。

本轮八岗配置与实际接单已独立验收，结论met_within_configuration_scope；详见[验收报告](employees/v12-evidence/qa-engineer/audit.md)。岗位后续专业执行依赖保留，团队仍十五岗，完整目标仍not_met。
