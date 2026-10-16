# v0.11 应用独立验收与当前八门槛复盘

本轮本地学习工作台、v10 完整阅读、受限自然语言教材推荐及原文定位 **在明确范围内通过（met_within_scope）**。完整职业学习产品 **未达标（not_met）**。真实教材生成与正式生产交付未通过，其余用户、专业内容、行业比较、学习者创造及经济证据不足；只有本轮应用改进轨迹在限定范围通过。原八门槛 ID、条件和历史报告没有改写，局部功能结论不能替代完整培养目标。

日期：2026-10-11。独立岗位：测试工程师 `/root/qa_app_retrieval_v11`。应用 `local-workbench-0.11`；教材 `textbook-v10`。功能依据为产品 `app-v11-product-1` 的 APP11-01..06、R11-01..24 与本轮设计。正式语义运行限定 Node.js 24，本机实际验证 24.16.0；其他主版本在原生模型初始化前受控不可用。

## 当前实际证据

真实页面逐篇点击正式目录的 20 篇，DOM 有 174 个标题节点与 39 段原教材代码围栏，全文及末段、层级列表、表格、公开引用完整。39 段只是原文保存/渲染，本轮没有执行其教学程序或伪代码。两张 PNG 实际加载；桌面任务运行图/工程全景与 375px 工程全景放大可看全貌，可切原尺寸再适配，Esc 关闭后回原按钮。320px 页面无整体横向溢出，代码和表格在自己的区域滚动。图与正文可见不证明真实读者已经理解。

开篇、六阶段路线、20篇目录、阅读器、项目工坊与学习记录实际可达，11个旧工具实际点击后有对应标题，控制台无错误。项目档案明确是自述未评价，学习记录不换算完成率/能力。跨章笔记实际测试：p02 输入测试笔记后未按保存就切至 e05，e05为空；回 p02 原笔记保留。新学习及查询键分别为 `rolecraft-learning-v11`、`rolecraft-content-query-v11`，不写旧掌握字段。测试使用独立本机端口/临时数据库，未读取或迁移真实用户记录；旧数据全体内容未作本轮认证。

本机真实 `Xenova/bge-small-zh-v1.5` int8 ONNX（512维、CLS、归一化、CPU）完成查询推理，结合32个通用任务描述向量、368原文段向量与否定/上下文约束。它不是精确输入的预制回答；`providerCalled:false` 表示无外部供应商调用，不能据此说没执行模型。固定revision、实际权重与配置字节都独立核对，Transformers.js为3.8.1；运行时禁止远程模型。模型依据来自 [Xenova ONNX 模型仓库](https://huggingface.co/Xenova/bge-small-zh-v1.5) 与 [BAAI 原模型说明](https://huggingface.co/BAAI/bge-small-zh-v1.5)。向量相关性不是匹配概率，也不是中文任意表达的可靠性认证。

固定用户场景加第一轮7个独立冻结输入共27条先实跑；6条保留改述/混合/歧义失败。机制返修后，另4条有限改述在未透露给开发前冻结，形成31条实际复验。第一返修仍有版本比较改述失败，第二返修31条明确检查均通过；观察到未明示的停止方向干扰恢复后，仅核4个受影响原场景，恢复/独立停止/多意图均通过。原记录和首轮源码点未覆盖。不是继续扩句子直到凑数，也不能从31条推出总体准确率。

这31条执行时工具实际为 Node26.3，发生于版本保护前；最后受影响4条也在保护前。最终 Node24 的实际服务另核代表恢复/成本推理、完整 UI 及时序、资源/运输和退出。报告不虚称所有31条在Node24重跑，排序冻结后只有运行版本/关闭保护改动，复验范围明确。

所有肯定推荐逐项核章节、小节、标题、版本、来源SHA、href以及目标原文逐字摘录。真实R02推荐到 `#learn/agent/e01/s-2cd345377707`，点击聚焦“用一次恢复轨迹读懂提交边界”，刷新仍是同H2；返修后原查询→点击→刷新→后退保留原表达与经验证结果。实际复制按钮得到完整小节地址。起点/当前章节清除后再选澄清方向，提交使用当前可见范围，旧结果保留自己的提交快照。

63项当前公共HTTP运输/边界核全部通过：20篇原文、6图源资源、9参考文件静态和API、公开目录、未知/私有路径/无账户请求、非法合同/跨站/写方法。第一次服务尚载旧4图资源时新增两个DOT返回404的WIP记录保留，最终重新载入的6资源已原点核对。参考文件来自明确白名单，不暴露任意team/private路径。

三个临时公开源副本分别缺索引、源SHA不符、缺模型文件，均返回unavailable而非no_match且无伪造结果；工作教材/模型没有破坏。UI实际停自有QA服务后新查询显示不可用/重试/目录并移除旧卡；重启后重试得到真实e05，空白新提交明确invalid并清空旧卡。有限时序代理实际使旧恢复请求延1.4秒，新成本结果先返回；旧连接已被中止，迟到输出未覆盖成本卡，输入焦点保留。代理仅本机公共只读内容，不是绕浏览器访问限制或改变实现。

## 反例、返修与原例复验

| ID | 原反例 | 责任人 / 实际改进 | 复验结果 |
| --- | --- | --- | --- |
| Q11-RET01 | H11-01/02/03/04 missed everyday task meaning or definitively picked release rather than version evaluation. | 内容检索工程师：Real BGE vectors for32 generic task descriptions, positive/negative scope and strong contextual intent handling; final explicit recovery suppresses unstated stop. | Original four and finite H11-08..11, plus four affected R02/03/08/12 after final recovery change.；closed_within_tested_scope |
| Q11-RET02 | H11-05 explicitly negated retrieval but c02 returned;write dedup/uncertain result and cost omitted. | 内容检索工程师：Negation scope and semantic clause aggregation mechanism. | Same mixed input excluded retrieval, returned write/dedup plus cost as separate legitimate groups;quotes exact.；closed_within_tested_scope |
| Q11-RET03 | H11-07 nonliteral remembering returned no_match instead of concrete ambiguity. | 内容检索工程师：Clarify among actual context/retrieval/task-fact directions. | Original memory wording and fixedR15 return needs_clarification; no certain article before choice.；closed_within_tested_scope |
| Q11-UI01 | R02 query→e01 section→reload→back lost original expression/results. | 软件工程师：Separate query session cache, revalidate current corpus/full source identity/quote on restore. | New post-repair original sequence preserved query/result;exact H2/reload/back and copied section URL.；closed_within_tested_scope |
| Q11-UI02 | Beginner opening memory query→clear start/chapter→clarification choice reused old beginner/reading context. | 软件工程师：Clarification/retry uses currentContext;explicit restoration and scope flags. | Same sequence new submission unlimited/all20 no forced foundations;prior result retains original snapshot.；closed_within_tested_scope |
| Q11-OPS01 | Actual Node24 and26 CPU inference then forced process.exit after close produced SIGABRT, not26-only. | 内容检索工程师：Await pipeline dispose/active requests and native natural CLI process.exitCode;restrict supported model runtime before initialization. | Node24.16 actual HTTP semantic→SIGINT code0/no stderr;Node26.3 unavailable/runtime_unsupported without model load→SIGINT code0.；closed_within_Node24_supported_scope_and_Node26_guard |

Q11-OPS01 原反例不是只发生于Node26：独立的24和26实际推理后强制进程退出都曾SIGABRT。原记录保留。最终实现等待pipeline dispose并采用CLI自然 `process.exitCode=0`；Node24实际HTTP推理后SIGINT退出0、stderr空。Node26现模型加载前返回 `runtime_unsupported`/unavailable，SIGINT退出0。闭合范围是Node24支持运行及其他版本防护，没有声称原生跨版本根因全部修复。

UI-OBS01“原尺寸首次进入左上空白”经默认适配全貌修复，375px切换/关闭复验已完成。另网络错误可能在中文不可用标题下显示英文 `Failed to fetch`，保留为非阻断文案观察；错误状态、重试和隔离证据不受它影响。本轮没有实际驱动中文IME组合输入；只核源中的组合输入防护以及实测Enter/Escape/焦点，不标为真实IME通过。工具可显示真实截图但未提供文档支持的保存截图文件接口，本轮没有声称保存PNG，也没有换浏览器驱动获取图片。

## 本轮功能判定

| 产品条件 | 当前判定 | 对应实际依据 |
| --- | --- | --- |
| APP11-01 | pass | 20 actual source bodies/formal order and 174 sections;39 original fences preserved, six source diagram assets and nine public references allowlisted. Actual all20 browser render/two zoom dialogs/desktop375320. |
| APP11-02 | pass | Actual home/path/catalog/reader/project/records and11 legacy routes; explicit beginner path and direct experienced query, current chapter can be cleared. |
| APP11-03 | pass_within_scope | Fixed meaning/synonym pairs plus independently frozen paraphrases, negation/multi-intent and finite related variants passed after mechanism repairs. Real BGE query/prototype/chunk vectors plus concept constraints; no fixed query response templates. |
| APP11-04 | pass | All actual positive responses validated unit/section/source hash/version/href/exact substring. Actual source expansion and H2 navigation/reload/back/section-copy; caches validated against current corpus. |
| APP11-05 | pass | Blank/long/unknown/ambiguity/temporary resource failures distinct; no false quotation or no-match for loading failure; retry and old-result removal/late-response isolation actual. |
| APP11-06 | pass_within_scope | Local-only public read-only routes, private paths/method/cross-site/invalid contract blocked, no paid API/private data access; isolated new record keys. Supported Node24 actual semantic inference+natural signal close0;Node26 blocked before native model initialization. |

R11-01..24逐项依据在 [机器记录](app-v11-qa.json)；APP11-03只授当前Agent工程意图和有限反例范围，不授通用语言、教学效果或行业标准。工程自查文件与独立证据分别记录，不采用开发检查次数作为独立通过数。

## 当前完整产品八门槛

| 固定门槛 | 当前状态 | 当前证据缺口 / 责任人和下一步 |
| --- | --- | --- |
| user_value | insufficient | No new real target-user study or predeclared success metric results. UI/test input is constructed QA, not customer approval. 产品经理 / 用户研究员：Run authorized real target-user pilot against predeclared problem/metrics; retain original positive and negative evidence. |
| teaching_quality | insufficient | v10 source/version/body maps preserved; no new human industry-expert review or whole-book behavior/learning verification. Earlier AI limited review stays historical. 课程架构师 / 教材研发员 / 内容审校员：Obtain actual professional review and meaningful implementation/learning evidence for frozen教材; do not infer from39 rendered fences. |
| real_generation | fail | Current generationConfigured:false; real local embedding retrieves existingv10, does not generate教材 from learner profile or dynamic source validation. 软件工程师（原门槛owner）；AI生成工程师负责模型生成服务：Once configuration/budget authorized, actual profile-bound generation+source/version/example/failure evidence then independent QA. |
| comparative_advantage | insufficient | No frozen same-task industry/research baselines, comparable measured outcomes or professional advantage review for current product. 产品经理 / 竞品研究员：Define comparable tasks/versions/resources/metrics first; measure actual baselines and current product. |
| learner_creation | insufficient | No real learner independent unknown-task MVP, user validation or third-party作品评审; project fields explicitly self-report. 课程架构师 / 实训评估员：Collect actual learner artifacts/unknown-task runs and independent assessment against existing量规. |
| reliable_delivery | fail | Current deliverable expressly local development/browser records, not formal production account-synced learning system. Historical local account/job tests not repeated or inherited. Node24 graceful close/local transport do not establish formal delivery. 软件工程师 / 后端数据工程师 / 内容检索工程师（仅检索服务）：Freeze formal operating scope; verify current account isolation/persistence/recovery/versioning and deployment independently. |
| operating_economics | insufficient | Local timings/provenance do not supply actual generation bills, production budget+quality+maintenance evidence. 产品经理 / 运营分析员：Predeclare resource budget then collect real current task cost/time/quality and maintenance records. |
| iteration_trace | pass | Within this local app iteration: received WIP/timestamps protected93, first failures retained, owner repairs and actual original/affected reruns, final hashes+gaps/owners/actions. Does not close external professional/user evidence. 项目经理 / 测试工程师：PM integrate R14 final scope and future actions; every new artifact obtains its own versioned review. |

判定按不变 `product-creation-2026-10-10`：必需项存在fail，因此整体not_met；未通过不能用其余局部功能平均抵消。现模型是教材检索，生成服务 `configured:false`，不等于依学员档案真实生成教材；当前交付明示本地研发与浏览器记录，也不等于正式生产学习系统。历史账户与持久任务的本地证据仍保留，本轮没有认定那些能力不存在，只是未为当前完整系统重新授通过。每个缺口须由对应责任岗取得真实新证据，再冻结新产物供独立复验，不能以新增员工、报告、自述或旧版pass代替。

## 版本、保护范围与运行点

收到基线时间UTC `2026-10-11T07:52:12.713012—07:52:12.715463`，此前工程已经开始；22程序文件只记“收到的WIP”，新检索文件另列，不造开发前基线。93个命名的旧教材/历史审校QA/标准文件在最终记录点全部字节及SHA一致，行政AGENTS/TASKS/RETROSPECTIVES/teamREADME/SPECIALISTS更新不在教学/审计冻结范围。这是命名文件端点核对，不是全工作区连续取证；不读私有DB、.env、密钥或用户浏览器记录。

教材合订本SHA `6707a4f03b298a5b234ce56a88edcbd9d79af6d40cb978227461a9d9d522f76e`；corpus SHA `436ec1edab6c394d0d19ce3769e3a95eadb162d0d2f6564c7442988bd37328e5`。产品交接当前SHA `4ed9bdd50c4a2cb4371f0943a968727630e2446eabe2f65007923fd5eda1cbfb`；两项责任/模式澄清未改R11/APP11/原八门槛。检索交接绑定所有声明文件当前匹配；客户端与当前证据独立SHA见最终绑定。

最终用户展示点 `http://127.0.0.1:4318/#home` 由原服务责任岗安全更新并保留原数据库，QA只读核健康/20篇目录/corpus/教材SHA/Node24.16，generation仍false；不触碰该用户服务。QA自有4421使用临时独立DB，有限时序4434临时服务已关闭，临时浏览器页与4421在交付时关闭并单列记录，未清理实际用户数据。

主要可审查证据：

- [收到基线](app-v11-qa-history/received-baseline.json)、[93保护文件终点](app-v11-qa-history/protected-final.json)、[最终版本绑定](app-v11-qa-history/final-version-binding.json)。
- [第一轮实际失败](app-v11-qa-history/retrieval-http-first.json)、[两次机制返修复验](app-v11-qa-history/retrieval-http-repair2.json)、[最后4受影响原例](app-v11-qa-history/retrieval-http-recovery-final.json)，两份独立输入冻结及源码起点同目录保留。
- [真实浏览器观察](app-v11-qa-history/browser-evidence-final.json)、[当前HTTP运输](app-v11-qa-history/http-boundary-final.json)、[真实迟到响应时序](app-v11-qa-history/race-proxy-results.json)、[三资源反例](app-v11-qa-history/resource-faults-final.json)。
- [原24/26退出失败](app-v11-qa-history/owned-shutdown-recheck.json)、[当前支持及防护退出](app-v11-qa-history/owned-shutdown-natural-final.json)、[实际模型资源](app-v11-qa-history/model-resources-final.json)、[正式展示身份](app-v11-qa-history/final-preview-identity.json)。

本轮无外部付费调用、上传发布、外部联系、实际账户操作或教学代码行为运行。用户对教材和新应用的阅读认可仍须真实反馈，QA不能代用户满意或代真人专家认可。
