# v0.8 专业正文独立内容审校

责任岗位：内容审校员。日期：2026-10-11。当前状态：`in_progress`。第二阶段已读齐十二新篇及冻结v07，跨章规范指纹/发送映射 CR08-10、分析候选到完整交付及Result映射 CR08-11 正在作者返修，最终SHA与交接尚待同步，不能授整套通过。首批阶段原报告保存在 `textbook-v08-content-review-history/stage01-in-progress.md/.json`。

审校依据为用户专业写作标准、v0.8规格、原目标与知识点，以及实际新正文。逐章阅读全部论述、接口、核心代码分支、案例和参考分析；使用具体事件顺序与反例核机制。技术事实直接打开一手来源。正文由对应作者返修，审校员不改作者稿、不执行代码、不改网站或旧教材。文稿静态审校、QA示例执行、人类专家、用户阅读认可及真实学习/产品效果各自独立。

## 首轮问题及复核记录

| ID | 章节 | 首轮反例及机制缺陷 | 返修条件 | 当前状态 |
| --- | --- | --- | --- | --- |
| CR08-01 | f01 | 200完整JSON含孤立代理字符，类型及资源校验通过后`content.encode('utf-8')`抛UnicodeEncodeError，越过受控结果 | 编码失败明确归约INVALID_RESPONSE，保持零可用证据，并在练习给出该反例 | 已独立静态复核：编码catch返回CONTENT_NOT_UTF8，原例不再越过归约 |
| CR08-02 | f02 | 顶层响应为[]/null，consumer先拒绝PROTOCOL_OBJECT，包装层仍调用response.get导致AttributeError | 包装前核顶层对象，元数据不从非法对象取值 | 已独立静态复核：非dict先返回PROVIDER_PROTOCOL_OBJECT |
| CR08-03 | c01补篇 | f02的WAIT_INPUT没有code，固定流程将所有非CANDIDATE按generated.code停止，丢失合法缺证等待；另hypothesis与hypotheses类型衔接未定义 | 保留缺证等待，明确适配归约及单假设到本地列表，说明返回后的deadline判断 | 已独立静态复核：等待分支先处理、元数据解包合同及假设映射明确，增加返回后deadline |
| CR08-04 | e02 | 已知结果错/语义REJECT/回执指纹不符会被前置轨迹缺口或未决效果归INSUFFICIENT，违反已有反证与未知并记 | 累计独立可确认反证与缺证，FAIL保留未知；拒绝非法负数效果计数 | 已独立静态复核：已知反证优先且带missing，引用未观测/批准未找到按完整性区分，非法计数归HARNESS_ERROR |
| CR08-05 | e03 | 已知敏感值含引号/反斜杠/换行，序列化后原字符串不在JSON字符串中，工具闸和四通道断言均可能漏检 | 原始叶字符串递归核标记，特殊字符反例与合法断言成对验证 | 已独立静态复核：contains_marker递归字典键/值与列表/元组，载荷闸和四通道使用同一逻辑 |
| CR08-06 | c02 | index_snapshot_id仅回显，集合无快照绑定；包内冲突扫描不能发现top_k外矛盾 | 明确冻结Snapshot成员与版本合同/边界，缩小无冲突主张并处理已知冲突组和召回缺证 | 原例已静态复核关闭：内容地址成员核对，已知事实组在top_k前扫描；返修新增组身份问题见CR08-08 |
| CR08-07 | f01 | 零基础独立桥接仅有path类型分支手算，未完整落实JSON/命令行/请求响应/断言等规格明确诊断 | 增加独立短诊断与参考分析，原专业主线保持深度 | 原例已静态复核关闭：四项独立诊断实际含文本→JSON对象/列表、函数参数返回与零调用、终端环境与退出、请求/业务/断言定位，逐题有推理和补学入口 |
| CR08-08 | c02 | 已知冲突组仅按actual/expected等字段名，另一个测试不同结果被错当同一事实矛盾 | 事实身份包含subject及条件，再按同一事实组比较值，不同测试actual不同不冲突 | 原例已静态复核关闭：subject绑定失败对象+输入条件，冲突按subject/predicate；相同字段不同测试不冲突，同一对象条件相反值仍拦截 |
| CR08-09 | c03 | dispatch直接调downstream.create，未显示与IssueStub签名/超时归约的适配；reconcile成功仅检查hash不能排除另一操作同内容回执 | 补完整局部发送归约，已落效果后超时同attempt记UNKNOWN；确认操作/项目/意图绑定才采纳 | 原例已静态复核关闭：完整IssueAdapter解包Dispatch，TimeoutError归原attempt的UNKNOWN；成功核原operation/project/hash/issue/version，查询外来operation不采纳 |
| CR08-10 | c03/e01 | c03证据ID按集合排序去重，但canonical_issue_hash无完整字节合同；e01另算ensure_ascii=True的digest({tool_version,args})，未定义统一规范载荷。中文标题/正文和调换证据顺序可产生不同指纹；e01 DISPATCH映射缺action/attempt与c03类型衔接 | 明确一套完整规范化/哈希合同，两篇共同采用，审批只绑定入库原指纹；补原action/attempt/operation/args到Dispatch及Outcome事件映射，不静默迁移旧批准 | 已向原作者及PM交具体反例，待返修/原例独立复核 |
| CR08-11 | c01补篇 | fixed_analysis成功record只传摘要，无完整generated.value；fixed_delivery却需failed_test/repo_revision/report_id/expected/actual/hypothesis/source_refs，前节点未交该候选。Result声明WAIT_RESOLUTION必须action_id但首等待遗漏，complete的COMPLETED到对外CREATED亦未定义 | 明确完整已校验候选的持久快照/hash/目标/证据绑定；所有等待关联原动作；完成事务到统一Result的明确转换，不用record隐式读取全局代替数据交接 | 已向原作者及PM交正常主夹具分析→记录→交付的反例，待返修/原例独立复核 |

首稿保存于各作者history，审校不覆盖首次问题。以上均为文稿静态推演，未执行反例。

## 已实际读取的一手来源

目前已打开并核正文相关段落：

- RFC9110 §9.2.2：幂等方法的预期效果与自动重试条件；不支持把任意写工具超时当无效果。
- Python3.14 json与urllib.request：默认解析可接受孤立代理字符/重复键，timeout约束阻塞操作；不保证业务正确或端到端deadline。
- OpenAI Structured Outputs（Responses模式）、Text generation、Prompt engineering、Error codes：text.format、严格schema、拒绝/未完成、REST output多类项目、角色优先级与429错误原因。采用OpenAI Docs技能核官方页面，未调用模型。
- Anthropic Building effective agents（2024-12-19，当前页面有工具生态变化说明）：固定代码路径与动态决策的架构区别；不是当前性能排名。
- Anthropic Demystifying evals for AI agents（2026-01-09）：trial/trajectory/outcome差别、多类grader及人类校准。
- scikit-learn1.9.1 Common pitfalls：测试信息用于选择会产生乐观估计，Agent调优应用标作设计推断。
- OpenTelemetry Traces：span关联是观测组织，不是外部业务效果证明。
- Zheng等原论文摘要（arXiv2306.05685）：位置、冗长、自我偏好及推理限制，不继承工单评分有效性。
- OWASP Prompt Injection Prevention、Authorization、Logging：外部注入入口、模型外核权、每请求对象权限和敏感日志排除。
- Stanford IR Book BM25与OpenAI Retrieval：词频/长度与检索前attribute filtering、融合权重；原创最小词项交集及RRF实现不冒充服务内部代码。
- AWS Making retries safe与Stripe Idempotent requests、OpenAI Function calling：调用者意图ID、参数冲突、去重记录与效果的原子关联及保留窗口；Stripe当前页明确所述v1语义不能推广v2；函数建议、应用执行与结果回传分开。

## 历史阶段交接（首批七篇，非当前整套结论）

已全文及全部核心代码审读f01、f02、c01选型补篇、c02、c03、e02、e03；已全文读取冻结v0.7及完整控制骨架用于跨章语义核对，原hash仍一致，但不重授或推广它的局部审核。f01/f02/c01/e02/e03返修经原反例静态复核，c02首返修原例已复核，新增CR08-08、f01桥接CR08-07及c03CR08-09尚未关闭。实际阶段SHA见同名JSON，不用其代表未来终版。

原目标实际覆盖：f01输入/网络/业务/断言与Git环境复现已入正文；f02供应商请求方法和结构/业务闸、角色/上下文已入正文，但真实调用未发生；c01的普通程序/单调用/workflow/动态及多Agent协作在补篇，反馈、预算及恢复主讲v0.7；c02版本/权限/策略比较/引用与无答案已有机制，组身份仍返修；e02案例、分组与泄漏、判定器、配对重复/失败归因和评分校准已有机制；e03注入路径、模型外授权、四通道和准确批准及并发教学合同已有机制。不是manifest计划文字代替正文。

当前未齐未审：e01、e04、e05、p01、p02。c03已经审读动作ID/槽位、批准与合法恢复、发送/核对骨架、下游幂等窗口及独立效果账本替身，核心异常适配待修。最终需读齐并核各篇四个原知识点实际位置、作者交接、跨章一致性及最终hash。规范末尾“课程架构师本次自查”是v0.7历史单篇记录，开头v0.8授权已更新，本轮采用当前专业条款而不把历史范围当阻止全书授权。

静态闭合问题不等于运行闭合，QA后续安全替身可执行另行留证；供应商模型、真实工单、真实语义检索、生产持久/部署、真人专业审核、学习者迁移和行业比较均未由本审校取得。当前完整产品仍`not_met`，本审校不关闭产品门槛。

## 第二阶段全文和机制复核

十二篇新正文现已齐稿并全文审读，所有关键代码/接口分支均检查。e01实际读了SQLite建表、显式事务、事件去重、代次/修订、意图/批准/预算、发送/核对、操作级取代旧观察、candidate/verdict与完成/停止事务；静态推演外部创建后本地提交前崩溃、旧代次迟到、取消后成功和预算不复位。e04的规划器只是版本兼容规划，实际发布另须库存/准入暂停/任务接管提交；回退不撤销远端效果。e05全分配任务分母、冻结接受数、未知费用下界、删失等待和开放到达负载与质量护栏共同成立，缓存只返回候选且先核当前权限及固定快照。p01有实际访谈方法、观察/解释/假设分离、人工/程序/单调用/行业替代比较、事前契约与完整暂定ADR。p02有字节校验与真实性分离、作品/职业/先进性三层判断、原例/回归/未知任务复验与历史效果处置分离，构造结果没有冒充真实证据。

每篇围绕单一工程问题；跨章相同术语用于连接合同，不以模板九栏或长故事灌水。实现的限制明确到服务边界，完整必要逻辑有正文或指定前篇，不用“还需注意安全”替代核心分支。专业主线外的f01先修桥接补齐原零基础入口；这只说明补学路径有可操作诊断，不声称零基础学员已经具备基础。每篇实作/反例有条件、交付和参考推理，公开题未计作保留任务。

### 原二十四目标的实际正文定位

下面的“覆盖”表示当前教材讲了实现/判断与作业方法，绝不是学员完成或产品达标。原目标文本来自 `curriculum-data.json`，原知识点来自 `textbook-v05-spec.json`；不以新manifest的planned destination授覆盖。

| 原目标 | 实际正文位置与判断依据 |
| --- | --- |
| f01-o1 输入/异常/API | f01“成功需要跨过四道边界”“一个完整的只读适配器”：非法类型零请求，HTTP/解析/编码/业务归约及异常范围 |
| f01-o2 Git/依赖/复现 | f01“让另一个开发者复现”“三个推理与实作任务”“独立先修诊断”：运行时/标准库真实依赖范围、第三方锁定说明、Git快照和失败断言交接；没有伪造陌生环境结果 |
| f02-o1 真实调用与双校验 | f02“一次真实协议请求与完整候选闸门”“完成原目标所需的练习证据”：真实REST方法、status/output完整解析和候选业务闸，真实调用作业保持；尚未实际调用 |
| f02-o2 来源/上下文 | f02“把任务状态与模型输入拆开”“三种失败”：可信宿主状态与来源资料分开，关键约束摘要不可删，缺证/上下文容量/输出截断分别处理 |
| c01-o1 选固定或动态 | c01补篇“同一任务，四种控制权”“TaskContract”“完整决策骨架”“三种输入”：普通程序/单调用/workflow/动态共享完成目标及明确升级反例；完整候选及Result衔接CR08-11待修 |
| c01-o2 反馈与停止预算 | 冻结v07 §5–9、补篇“多Agent的升级点”：观察改变下一允许动作，硬预算/期限/未知核对优先与总协作预算；原v07不继承新篇结论 |
| c02-o1 来源版本范围 | c02“本次回答看到的是哪一个资料版本”“完整链”：冻结成员内容地址、权限/修订过滤、源读回和location/hash |
| c02-o2 策略/引用/无答案 | c02“检索策略”“关联与支持”“无答案”“检索比较”：词法/余弦/RRF取舍、规范事实subject组支持、top_k前已知冲突、各层缺证分开；真实向量/语义比较未做 |
| c03-o1 工具与授权 | c03“工具名与合法JSON”“本地事务和下游”“适配代码”：提议≠效果，精确字段/范围/证据/批准与协议绑定；CR08-10共同指纹待修 |
| c03-o2 幂等与反馈 | c03“三身份”“审批绑定”“效果账本替身”：稳定槽位、原键/参数、超时UNKNOWN、回执/无效果证明范围与有效去重窗口 |
| e01-o1 状态/完成动作 | e01“三个提交点”“存储最小实现”“终态保证”：权威表/事件、CAS/epoch、批准/尝试预算、candidate/verdict与终态同事务；CR08-10发送桥接待修 |
| e01-o2 中断核对恢复 | e01“恢复轨迹”“故障位置”“版本变化”：新所有者先核原操作、未决不转无效果、停止后迟到效果仍记录、schema/tool/批准迁移不猜默认 |
| e02-o1 能力/回归/保留 | e02“案例执行契约”“信息使用”“先冻结比较”：source family隔离、公开题污染、全部轮次配对/重复和未完成分母 |
| e02-o2 结果/轨迹/成本 | e02“命题”“判定器”“Trace”“评分器”“回归”：已知反证优先且保留缺证，关键过程从账本核，模型评分校准/竞争归因；构造分数不授能力 |
| e03-o1 不可信资料 | e03“威胁模型”“读取边界”：报告/工具/历史资料入口，提示标签与服务端核权分离，拒答不能挽回已读秘密 |
| e03-o2 最小权限/敏感/人工 | e03“四通道”“精确批准”“完整替身”“成对练习”：叶字符串敏感检查、合法信息保留、准确意图/期限/消费/并发与当前权限；未知秘密另待验证 |
| e04-o1 配置/观察/回退 | e04“发布对象”“分环境”“兼容规划”“控制路径”“状态迁移”：配置秘密引用、健康/就绪区别、暂停库存、兼容接管/排空与schema回退边界 |
| e04-o2 阶段故障定位 | e04“观测记录”“故障处理说明”“同伴复现”：版本/run/action/attempt/event关联、ledger与trace区别、按存储/模型/未知写/旧worker分类的runbook |
| e05-o1 尾延迟/每任务成本 | e05“成本”“延迟”“汇总器”“负载”：全群体计费、未知冻结分母、nearest-rank、成功与失败/在途删失分开、吞吐时间窗 |
| e05-o2 优化比较 | e05“缓存”“路由”“预算/限流”“练习”：先当前权限+固定源核缓存、候选非批准、正常/撤权/新修订/突发对照，路由升级全成本与并发共享预算 |
| p01-o1 问题映射任务 | p01“问题证据”“研究方法”“基线”“差异假设”“公平实验”“MVP契约”：真实观察转可推翻命题、共同资源和护栏；没有真实访谈/成绩 |
| p01-o2 评审/文档取舍 | p01“架构决定”“两类受众”“真实反馈”“练习”：完整暂定ADR、评审反例/拒绝项、同事实使用/维护/复现交接及负反馈改变决策 |
| p02-o1 证据/外部评审 | p02“证据包”“完整性”“三类结论”“独立评阅”“真实使用”：定义→工件→原证据→判断链，独立复现与真人专业身份/原意见，行业同条件比较；真实评阅尚缺 |
| p02-o2 复盘/未知迁移 | p02“写后中断复盘”“未知任务”“关闭了吗”：竞争原因→组合修复→原例/正常/相关回归→非作者新条件；代码修复与旧对象影响处置分开 |

### 原四十八知识点的实文机制定位

| 模块 | k01 | k02 | k03 | k04 |
| --- | --- | --- | --- | --- |
| f01 | 四道边界/adapter：字段类型、长度、revision与非法输入零请求 | adapter：状态/网络/解析分层，403不重试，超时无证据 | 他人复现：解释器、标准库/第三方锁定、配置/目录与Git快照 | 五项断言/三个任务/桥接：正常与非法、失败退出、变更记录 |
| f02 | 请求/consumer：完成、refusal、incomplete、protocol/transport分类 | verify_candidate：报告归属、事实字段、引用和未验证根因 | 上下文投影：宿主身份/指令与用户/外部源分开，资料自称system不授权 | 上下文容量/摘要任务：保留目标约束/证据/已执行/未知，WAIT_INPUT |
| c01 | 四方案表/固定骨架：单次候选与完整目标区分，简单基线 | 三类输入/控制权：多次调用不等于动态控制，升级须效果证据 | v07 §5/6/9：模型建议→观察→验收/再规划，工具拒绝不变成功 | v07 §6/7/8及多Agent合同：硬停止预算、恢复独立额度、唯一写所有者/总费用 |
| c02 | Source/IndexSnapshot/QueryScope：不可变源和摄取索引两种版本、ACL前过滤 | EvidenceRef/读回/judge：ref存在不等于蕴含，哈希位置与subject事实支持 | lexical/cosine/RRF：精确查询与同义语义查询的召回机制/版本条件/比较 | 全集已知冲突/无答案：同subject条件冲突拦截，缺摄取/缺召回/过期/无权分开 |
| c03 | 工具建议/协议绑定：call ID与执行观察、实际回执分开 | validate/Policy/approval：可信身份注入、对象范围与准确参数不由模型授予 | 唯一槽位/IssueStub：action/attempt/key区别，同键同指纹/变参、去重窗口 | IssueAdapter/reconcile：效果后丢回执UNKNOWN，操作级核对/冲突/原键许可 |
| e01 | runs/actions/events：权威状态与聊天摘要分离，事件payload去重 | transact/reduce：修订/代次、取消/complete事务、迟到效果不恢复工作 | begin/lookup/result：三个提交窗口、未知扫描、原键查询/旧观察合法取代 | metadata/迁移/练习：未知schema先拒，新字段不能猜，批准指纹不得迁移 |
| e02 | 信息使用：开发/回归/保留source family隔离，污染后换题 | 冻结比较：版本/权限/资源/所有轮次/顺序与随机不确定性 | Grade/ledger/账目：业务结果、关键过程、费用各自证据；拒答不抵越权 | 评分校准/干预归因：人工争议/混淆类型、固定检索或输出隔离原因，不借模型赞同授专家 |
| e03 | 威胁模型：报告/工具/历史记忆三入口、资产与攻击路径 | 读取准入/执行准入：不可信标签不等于强制ACL或发送撤销 | 投影/contains_marker：context/result/payload/log四通道，特殊字符及合法信息成对 | LocalIssueDesk：意图范围/期限边界/消费/并发唯一槽位，改变对象/正文拒绝 |
| e04 | ConfigContract：分环境、秘密引用、存储/队列/工具版本与启动前核验 | task兼容/rollback_plan/控制路径：冻结库存、当前所有者、原核对器、状态可读与回退范围 | telemetry/ledger/runbook：阶段关联、采样与事实账本、首次偏离而非猜根因 | 故障说明/复现练习：独立执行者、三中断点、旧者迟到/安全日志和未决移交 |
| e05 | TaskAccounting：全任务全尝试支出、单位/人工单列、未知费用与冻结接受分母 | elapsed/nearest_rank：成功p95范围、失败与在途删失、阶段分位不能相加 | lookup_analysis/route：当前授权、源注册表、scope/snapshot/model key，缓存候选和升级全成本 | 工作负载/预算：开放到达、队列拒绝/吞吐窗口、所有子尝试共享预留与限流 |
| p01 | ProblemEvidence：观察/解释/方案、实际研究和反例，demo记录不充用户 | AlternativeBaseline/ValueHypothesis：代表替代、冻结共同条件、能失败的指标护栏 | MVP TaskContract/ADR：选择固定workflow理由、拒绝多写/自动修复、升级条件 | 业务/技术交接/反馈：同事实文档、非作者复现、使用/退出/返工与改变假设 |
| p02 | DeliveryBundle/Index/GateVerdict：版本→记录→独立判断，字节一致不等于真实专家 | 真实使用/比较：全部负反馈及退出，版本/任务/资源/后处理一致，小样本有限范围 | Issue/RetestRecord：竞争原因、组合修复、原例/回归及新缺陷，旧效果处置独立 | IndependentTask/答辩：非作者未见资料、污染替换、实际帮助、识别停止与有限能力结论 |

### 本阶段新增一手资料核对

- [SQLite Transactions](https://www.sqlite.org/lang_transaction.html) 与 [Atomic Commit](https://www.sqlite.org/atomiccommit.html)、[Python3.14 sqlite3](https://docs.python.org/3.14/library/sqlite3.html)：IMMEDIATE请求写事务及busy、显式事务/legacy默认、日志/flush/文件系统假设；不支持远端网络原子性。
- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/) 与 [Deployment rollback](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#rolling-back-a-deployment)：startup/liveness/readiness不同，回退仅Pod模板，不逆转数据库或远端对象。
- [SRE Monitoring](https://sre.google/sre-book/monitoring-distributed-systems/) 与 [Handling Overload](https://sre.google/sre-book/handling-overload/)：成功/失败等待应区分、尾部分布和资源限制/拒绝；本篇具体credit/nearest-rank/缓存协议是教学定义，不冒充Google实测。
- [GOV.UK用户需要](https://www.gov.uk/service-manual/user-research/start-by-learning-user-needs) 与 [深度访谈](https://www.gov.uk/service-manual/user-research/using-in-depth-interviews)：真实任务/渠道/困难、无用户来源意见当假设，开放中性提问/真实例子/同意；不能推广为本产品已有市场效果。
- [GitHub Copilot on GitHub](https://docs.github.com/en/copilot/concepts/copilot-surfaces/copilot-on-github)：当前仓库研究/计划/编码/测试及issue/PR功能使它可进入待测候选；官方功能描述不代比较实测。
- [NeurIPS Paper Checklist](https://neurips.cc/public/guides/PaperChecklist)：可复现或核验途径、命令/环境/主要结果与基线范围；没有赋予教学作品研究资格或行业领先。
- [Python unittest](https://docs.python.org/3.14/library/unittest.html)、[Errors](https://docs.python.org/3.14/tutorial/errors.html)、[Git Book](https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository)：断言报告/命令入口、选定异常传播、暂存与提交快照的区别；诊断示例仍须学习者自己执行。

### 当前跨章及证据边界

已核主夹具源全文、失败报告输入/预期/实际及两引用ID一致。c02规范事实只证明该报告记录，不升级为真实退款规则；f02单hypothesis经c01明确转换，WAIT_INPUT保留；候选/意图/准确批准/物理尝试/原操作回执/独立verdict/完成各自字段与作用区分。e01不自动重发是明确最小实现子集，c03/v07有效原键重发合同未被它删改；e03当前进程原子替身不冒充远端或持久库。e02已知失败优先和p02原门槛判定一致，e05费用未知不归零，e04回退不消除未决，p01/p02真实用户/行业/学习迁移不以构造数据替代。跨章开放项为CR08-10规范化/发送桥接，以及CR08-11完整候选与交付结果数据桥接。

已读核心作者freeze-1及工程作者完整交接和最新范围差异；工程报告当前SHA为cf820ade894129236f6ed0576f65df426812b5e1b058a7622f4caa0d1ba831b3。QA阶段01/02范围与阶段03/04 source/execution/stdout实读：阶段03在Python3.12.14/SQLite3.53.1对两个独立教学库真实终止解释器exit23，再新进程核原操作及完成/停止等21条记录；不是实际远端或硬件断电。阶段04为自造临时包8条索引记录，INDEX_OK不授真实性。c03/e01将受CR08-10合同修订影响，旧块运行不可直接绑定新块，需QA按影响复验。e02—e05及p02执行描述差异已实读：只是改成“作者未执行，QA在3.12.14对限定离线夹具运行”，代码块未改，真实接口/业务/专家仍不受该句授通过。当前p02 SHA为05aff19b4ff1a33c72ffa854626b528a62cecba74cf25b281f18bf2572c5eee7。全部源SHA见同名JSON，终稿变化须读取差异后绑定，审校结论不继承旧稿。
