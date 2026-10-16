# v12 独立QA逐题矩阵

原100：54/36/10 → **98/2/0**；新增14：1/7/6 → **14/0/0**，顺序均为充分/部分/未覆盖。保留10题另列10/0/0，不并入这114题。

全文、来源/时间/层级、能力、改前改后短引文/行号/SHA256、缺失子问和责任人见[完整JSON](textbook-v12-qa-matrix.json)。A/B原报告保留。本文支持等级只表示教材正文可支持回答，不是学习者成绩或录用率。

| 题号 | 完整题目 | v10 | v12 | 当前正文证据入口 |
| --- | --- | --- | --- | --- |
| 1 | 如何界定 LLM Agent？你会用哪些可观察行为区分它与普通聊天应用？ | 充分 | 充分 | [00-learning-route.md](../textbooks/v12/00-learning-route.md)，行3；全部引用见JSON |
| 2 | 单次模型调用、固定 Workflow 和动态 Agent，分别适合什么业务条件？ | 充分 | 充分 | [c01-selection.md](../textbooks/v12/c01-selection.md)，行9；全部引用见JSON |
| 3 | 用户说“帮我做一个 Agent”时，你先澄清哪些需求，才能决定实现方案？ | 充分 | 充分 | [p01-discovery.md](../textbooks/v12/p01-discovery.md)，行9；全部引用见JSON |
| 4 | 工具调用、状态维护、规划和长期记忆，哪些取决于具体场景，并非每个 Agent 都需要？ | 部分 | 充分 | [n02-context-memory-prompt.md](../textbooks/v12/n02-context-memory-prompt.md)，行9；全部引用见JSON |
| 5 | 怎样判断增加自主决策带来的收益，足以抵消不确定性与运行成本？ | 充分 | 充分 | [c01-selection.md](../textbooks/v12/c01-selection.md)，行45；全部引用见JSON |
| 6 | 如果需求可以用 SQL、规则或传统搜索解决，你如何解释自己的技术选择？ | 充分 | 充分 | [c01-selection.md](../textbooks/v12/c01-selection.md)，行18；全部引用见JSON |
| 7 | 单 Agent 多工具与多 Agent 协作，在架构上有什么区别？ | 充分 | 充分 | [c01-control-loop.md](../textbooks/v12/c01-control-loop.md)，行26；全部引用见JSON |
| 8 | 你会如何评估自研 Agent 运行时、开源框架和低代码平台？ | 部分 | 充分 | [n06-graph-orchestration.md](../textbooks/v12/n06-graph-orchestration.md)，行82；全部引用见JSON |
| 9 | 从演示原型到可交付的 Agent 服务，需要补齐哪些工程能力？ | 充分 | 充分 | [00-learning-route.md](../textbooks/v12/00-learning-route.md)，行46；全部引用见JSON |
| 10 | 请用一个真实项目说明：Agent 改善了谁的什么工作，你如何证明改善成立？ | 部分 | 部分 | [p01-discovery.md](../textbooks/v12/p01-discovery.md)，行23；全部引用见JSON |
| 11 | ReAct 如何组织推理、行动与观察？它与一次性生成计划有什么不同？ | 部分 | 充分 | [n03-planning-reflection.md](../textbooks/v12/n03-planning-reflection.md)，行11；全部引用见JSON |
| 12 | ReAct、Plan-and-Execute 和固定状态机，你会如何按任务特征选择？ | 部分 | 充分 | [n03-planning-reflection.md](../textbooks/v12/n03-planning-reflection.md)，行11；全部引用见JSON |
| 13 | 不依赖现成框架，手写一个最小 Agent 控制循环，需要哪些状态和分支？ | 充分 | 充分 | [c01-control-loop.md](../textbooks/v12/c01-control-loop.md)，行38；全部引用见JSON |
| 14 | 如何区分“模型宣布完成”和“任务实际上完成”？ | 充分 | 充分 | [c01-control-loop.md](../textbooks/v12/c01-control-loop.md)，行17；全部引用见JSON |
| 15 | 怎样设置最大步数、时间和费用限制，同时避免过早中止任务？ | 充分 | 充分 | [c01-control-loop.md](../textbooks/v12/c01-control-loop.md)，行278；全部引用见JSON |
| 16 | 面对带前置依赖的复杂任务，如何生成和验证可执行计划？ | 部分 | 充分 | [n03-planning-reflection.md](../textbooks/v12/n03-planning-reflection.md)，行28；全部引用见JSON |
| 17 | 什么信号应触发 Replanning？如何避免反复改计划却没有实际进展？ | 部分 | 充分 | [n03-planning-reflection.md](../textbooks/v12/n03-planning-reflection.md)，行64；全部引用见JSON |
| 18 | Reflection 或自我纠错在哪些情况下有帮助，又可能怎样放大原始错误？ | 部分 | 充分 | [n03-planning-reflection.md](../textbooks/v12/n03-planning-reflection.md)，行93；全部引用见JSON |
| 19 | 工具结果与原计划冲突时，运行时应该如何更新状态和后续决策？ | 充分 | 充分 | [c01-control-loop.md](../textbooks/v12/c01-control-loop.md)，行237；全部引用见JSON |
| 20 | 如何识别和处理重复动作、无效搜索以及循环卡死？ | 充分 | 充分 | [c01-control-loop.md](../textbooks/v12/c01-control-loop.md)，行175；全部引用见JSON |
| 21 | Function Calling 从模型输出到函数真正执行，中间经过哪些步骤？ | 充分 | 充分 | [c03.md](../textbooks/v12/c03.md)，行10；全部引用见JSON |
| 22 | 如何设计工具名称、描述和参数 Schema，减少错选工具与错误参数？ | 部分 | 充分 | [n04-tools-mcp.md](../textbooks/v12/n04-tools-mcp.md)，行9；全部引用见JSON |
| 23 | 工具参数的 JSON 格式正确，为什么不等于调用安全、业务合法？ | 充分 | 充分 | [c03.md](../textbooks/v12/c03.md)，行10；全部引用见JSON |
| 24 | 工具数量达到数百个时，怎样降低选择错误和上下文负担？ | 未覆盖 | 充分 | [n04-tools-mcp.md](../textbooks/v12/n04-tools-mcp.md)，行23；全部引用见JSON |
| 25 | 工具超时、限流、参数错误和业务拒绝，应采用同一种重试策略吗？ | 充分 | 充分 | [f01.md](../textbooks/v12/f01.md)，行10；全部引用见JSON |
| 26 | 对可能产生外部副作用的工具，如何防止重试导致重复执行？ | 充分 | 充分 | [c03.md](../textbooks/v12/c03.md)，行18；全部引用见JSON |
| 27 | MCP 解决哪一层集成问题？它与模型的 Tool Calling 有什么关系？ | 未覆盖 | 充分 | [n04-tools-mcp.md](../textbooks/v12/n04-tools-mcp.md)，行44；全部引用见JSON |
| 28 | MCP 中的 Tools、Resources 和 Prompts，各自适合表达什么能力？ | 未覆盖 | 充分 | [n04-tools-mcp.md](../textbooks/v12/n04-tools-mcp.md)，行60；全部引用见JSON |
| 29 | 接入第三方工具服务时，如何处理认证、权限、版本与错误契约？ | 部分 | 充分 | [n04-tools-mcp.md](../textbooks/v12/n04-tools-mcp.md)，行99；全部引用见JSON |
| 30 | Tool Calling、MCP、Agent Skills（可复用技能说明与资源包）和 A2A，分别解决什么问题？ | 部分 | 充分 | [n04-tools-mcp.md](../textbooks/v12/n04-tools-mcp.md)，行124；全部引用见JSON |
| 31 | 会话历史、任务工作状态和长期记忆有什么不同？应分别存储什么？ | 部分 | 充分 | [n02-context-memory-prompt.md](../textbooks/v12/n02-context-memory-prompt.md)，行9；全部引用见JSON |
| 32 | 上下文不足时，如何在截断、摘要、检索和外部状态之间选择？ | 充分 | 充分 | [f02.md](../textbooks/v12/f02.md)，行10；全部引用见JSON |
| 33 | 摘要压缩如何避免丢失用户约束、未完成事项和关键事实？ | 充分 | 充分 | [c01-control-loop.md](../textbooks/v12/c01-control-loop.md)，行50；全部引用见JSON |
| 34 | 长期记忆应该在什么条件下写入、更新、合并或删除？ | 未覆盖 | 充分 | [n02-context-memory-prompt.md](../textbooks/v12/n02-context-memory-prompt.md)，行37；全部引用见JSON |
| 35 | 如何发现错误记忆对后续任务的持续污染，并修正受影响结果？ | 部分 | 充分 | [n02-context-memory-prompt.md](../textbooks/v12/n02-context-memory-prompt.md)，行45；全部引用见JSON |
| 36 | 如何隔离不同用户、组织和会话的记忆？ | 部分 | 充分 | [n02-context-memory-prompt.md](../textbooks/v12/n02-context-memory-prompt.md)，行68；全部引用见JSON |
| 37 | 检索材料、历史记忆与当前用户要求相冲突时，应如何处理？ | 部分 | 充分 | [n02-context-memory-prompt.md](../textbooks/v12/n02-context-memory-prompt.md)，行72；全部引用见JSON |
| 38 | 如何设计系统提示，使角色、工具使用规则和输出要求清晰而可测试？ | 部分 | 充分 | [n02-context-memory-prompt.md](../textbooks/v12/n02-context-memory-prompt.md)，行90；全部引用见JSON |
| 39 | Few-shot 示例如何帮助工具选择？示例过多或失真会带来什么问题？ | 未覆盖 | 充分 | [n02-context-memory-prompt.md](../textbooks/v12/n02-context-memory-prompt.md)，行86；全部引用见JSON |
| 40 | 如何验证一次提示或记忆策略调整确实改善了结果，而非只修好几个演示样例？ | 充分 | 充分 | [e02.md](../textbooks/v12/e02.md)，行65；全部引用见JSON |
| 41 | RAG、长上下文直接阅读和模型微调，分别适合解决哪些知识问题？ | 部分 | 充分 | [n05-retrieval-ingestion.md](../textbooks/v12/n05-retrieval-ingestion.md)，行132；全部引用见JSON |
| 42 | 一个完整 RAG 管线包含哪些环节？如何逐段定位回答错误？ | 充分 | 充分 | [c02.md](../textbooks/v12/c02.md)，行10；全部引用见JSON |
| 43 | 如何根据文档结构、查询类型和引用需求设计切块策略？ | 充分 | 充分 | [c02.md](../textbooks/v12/c02.md)，行10；全部引用见JSON |
| 44 | 如何选择 Embedding 模型，评估领域术语、中文与多语言查询效果？ | 部分 | 充分 | [n05-retrieval-ingestion.md](../textbooks/v12/n05-retrieval-ingestion.md)，行57；全部引用见JSON |
| 45 | 关键词检索、向量检索和混合检索分别有什么优势与盲区？ | 充分 | 充分 | [c02.md](../textbooks/v12/c02.md)，行20；全部引用见JSON |
| 46 | Reranker 改善的是哪一阶段？怎样衡量它带来的质量与时延代价？ | 部分 | 充分 | [n05-retrieval-ingestion.md](../textbooks/v12/n05-retrieval-ingestion.md)，行77；全部引用见JSON |
| 47 | 查询改写、多查询和多跳检索什么时候有效，什么时候容易改变原意？ | 部分 | 充分 | [n05-retrieval-ingestion.md](../textbooks/v12/n05-retrieval-ingestion.md)，行85；全部引用见JSON |
| 48 | 如何让答案引用与实际支持结论的原文、版本及位置对应？ | 充分 | 充分 | [c02.md](../textbooks/v12/c02.md)，行10；全部引用见JSON |
| 49 | 没有足够证据、资料互相矛盾或知识已经过期时，系统应怎样响应？ | 充分 | 充分 | [c02.md](../textbooks/v12/c02.md)，行230；全部引用见JSON |
| 50 | Agentic RAG 相对固定 RAG 增加了什么决策能力？如何证明额外复杂度值得？ | 部分 | 充分 | [n05-retrieval-ingestion.md](../textbooks/v12/n05-retrieval-ingestion.md)，行95；全部引用见JSON |
| 51 | 在你采用的版本中，LangChain 和 LangGraph 分别承担什么职责？ | 未覆盖 | 充分 | [n06-graph-orchestration.md](../textbooks/v12/n06-graph-orchestration.md)，行5；全部引用见JSON |
| 52 | 用图表示 Agent 时，节点、边和共享状态分别应该包含什么？ | 部分 | 充分 | [n06-graph-orchestration.md](../textbooks/v12/n06-graph-orchestration.md)，行19；全部引用见JSON |
| 53 | 状态字段应如何建模，避免把全部消息和中间数据无限累积？ | 部分 | 充分 | [n02-context-memory-prompt.md](../textbooks/v12/n02-context-memory-prompt.md)，行9；全部引用见JSON |
| 54 | 并行节点同时更新状态时，如何处理合并规则和写入冲突？ | 部分 | 充分 | [n06-graph-orchestration.md](../textbooks/v12/n06-graph-orchestration.md)，行21；全部引用见JSON |
| 55 | 条件路由由规则决定还是由模型决定，各有什么适用场景？ | 充分 | 充分 | [c01-selection.md](../textbooks/v12/c01-selection.md)，行9；全部引用见JSON |
| 56 | Checkpoint 应保存什么，才能支持失败恢复与人工介入？ | 充分 | 充分 | [e01.md](../textbooks/v12/e01.md)，行10；全部引用见JSON |
| 57 | 恢复执行时，如何保证已经完成的外部操作不会再次产生副作用？ | 充分 | 充分 | [c01-control-loop.md](../textbooks/v12/c01-control-loop.md)，行256；全部引用见JSON |
| 58 | 子图怎样封装独立任务？父图与子图之间如何交接状态？ | 未覆盖 | 充分 | [n06-graph-orchestration.md](../textbooks/v12/n06-graph-orchestration.md)，行68；全部引用见JSON |
| 59 | 流式输出怎样区分文本、工具进度、暂停、错误和最终结果？ | 部分 | 充分 | [n06-graph-orchestration.md](../textbooks/v12/n06-graph-orchestration.md)，行74；全部引用见JSON |
| 60 | 如果去掉 LangGraph，你如何实现等价的状态机，并说明取舍？ | 部分 | 充分 | [n06-graph-orchestration.md](../textbooks/v12/n06-graph-orchestration.md)，行82；全部引用见JSON |
| 61 | 什么实验或业务证据会使你选择多 Agent，而不是给单 Agent 增加工具或步骤？ | 充分 | 充分 | [c01-selection.md](../textbooks/v12/c01-selection.md)，行35；全部引用见JSON |
| 62 | Supervisor、交接式协作和共享讨论，分别适合什么任务？ | 未覆盖 | 充分 | [n07-multiagent-a2a.md](../textbooks/v12/n07-multiagent-a2a.md)，行9；全部引用见JSON |
| 63 | 如何定义各 Agent 的输入、输出、职责边界和完成条件？ | 充分 | 充分 | [c01-selection.md](../textbooks/v12/c01-selection.md)，行37；全部引用见JSON |
| 64 | 如何把任务拆成可以并行的部分，并保留必要的依赖顺序？ | 充分 | 充分 | [c01-selection.md](../textbooks/v12/c01-selection.md)，行35；全部引用见JSON |
| 65 | 多 Agent 应共享完整上下文，还是只传递必要材料？怎样判断？ | 部分 | 充分 | [n07-multiagent-a2a.md](../textbooks/v12/n07-multiagent-a2a.md)，行39；全部引用见JSON |
| 66 | 子 Agent 返回互相矛盾的结果时，协调者应如何处理？ | 充分 | 充分 | [c01-selection.md](../textbooks/v12/c01-selection.md)，行31；全部引用见JSON |
| 67 | 如何防止子 Agent 的错误结论在汇总过程中变成“已验证事实”？ | 充分 | 充分 | [c01-selection.md](../textbooks/v12/c01-selection.md)，行35；全部引用见JSON |
| 68 | 某个子 Agent 超时或失败时，整体任务应等待、重分派还是部分交付？ | 部分 | 充分 | [n07-multiagent-a2a.md](../textbooks/v12/n07-multiagent-a2a.md)，行49；全部引用见JSON |
| 69 | 多 Agent 的通信次数、费用和时延怎样纳入统一预算？ | 充分 | 充分 | [c01-selection.md](../textbooks/v12/c01-selection.md)，行39；全部引用见JSON |
| 70 | A2A 与应用内部的多 Agent 编排有何区别？跨系统任务交接需要哪些契约？ | 未覆盖 | 充分 | [n07-multiagent-a2a.md](../textbooks/v12/n07-multiagent-a2a.md)，行57；全部引用见JSON |
| 71 | 如何定义 Agent 的任务成功率，避免把“生成了回答”当成任务成功？ | 充分 | 充分 | [e02.md](../textbooks/v12/e02.md)，行12；全部引用见JSON |
| 72 | 最终结果评测和执行轨迹评测分别能够发现什么问题？ | 充分 | 充分 | [e02.md](../textbooks/v12/e02.md)，行12；全部引用见JSON |
| 73 | 如何构建包含正常、边界、歧义、失败和恶意输入的评测集？ | 充分 | 充分 | [e02.md](../textbooks/v12/e02.md)，行26；全部引用见JSON |
| 74 | 如何区分检索失败、规划失败、工具失败和最终表达失败？ | 充分 | 充分 | [e02.md](../textbooks/v12/e02.md)，行221；全部引用见JSON |
| 75 | 如何使用 LLM-as-a-Judge，并控制评判偏差及与人工结论的不一致？ | 充分 | 充分 | [e02.md](../textbooks/v12/e02.md)，行233；全部引用见JSON |
| 76 | 同一个任务多次运行结果不同，应该怎样报告成功率与稳定性？ | 充分 | 充分 | [e02.md](../textbooks/v12/e02.md)，行77；全部引用见JSON |
| 77 | 一条 Agent Trace 应记录什么，才能定位问题且避免泄露敏感信息？ | 充分 | 充分 | [e02.md](../textbooks/v12/e02.md)，行221；全部引用见JSON |
| 78 | 如何设计模型、工具和检索组件的消融实验？ | 部分 | 充分 | [n10-evaluation-projects.md](../textbooks/v12/n10-evaluation-projects.md)，行19；全部引用见JSON |
| 79 | 模型、提示、工具或知识库升级后，如何判断新版本能否发布？ | 充分 | 充分 | [e02.md](../textbooks/v12/e02.md)，行75；全部引用见JSON |
| 80 | 用户报告一个偶发失败，但你本地无法复现，下一步怎么调查？ | 充分 | 充分 | [e02.md](../textbooks/v12/e02.md)，行243；全部引用见JSON |
| 81 | 直接提示注入和来自网页、文档或工具结果的间接注入，有什么不同？ | 部分 | 充分 | [n08-sandbox-security.md](../textbooks/v12/n08-sandbox-security.md)，行7；全部引用见JSON |
| 82 | Agent 为什么不能仅靠系统提示保证工具权限与数据安全？ | 充分 | 充分 | [e03.md](../textbooks/v12/e03.md)，行3；全部引用见JSON |
| 83 | 如何让工具执行权限与当前用户身份、资源归属和操作范围一致？ | 充分 | 充分 | [e03.md](../textbooks/v12/e03.md)，行36；全部引用见JSON |
| 84 | 高风险操作的人类确认应展示什么，才能构成有意义的批准？ | 充分 | 充分 | [e03.md](../textbooks/v12/e03.md)，行56；全部引用见JSON |
| 85 | 如何防止确认后参数被修改，或一次确认被用于后续不同操作？ | 充分 | 充分 | [e03.md](../textbooks/v12/e03.md)，行58；全部引用见JSON |
| 86 | 执行模型生成代码时，沙箱应限制哪些资源与外部访问？ | 未覆盖 | 充分 | [n08-sandbox-security.md](../textbooks/v12/n08-sandbox-security.md)，行24；全部引用见JSON |
| 87 | 如何防止检索内容、日志和错误消息泄露跨租户资料或密钥？ | 充分 | 充分 | [e03.md](../textbooks/v12/e03.md)，行36；全部引用见JSON |
| 88 | 外部工具声称操作成功，你如何核实真实状态？ | 充分 | 充分 | [c01-control-loop.md](../textbooks/v12/c01-control-loop.md)，行243；全部引用见JSON |
| 89 | 多步骤任务部分成功后失败，如何设计补偿、恢复和用户告知？ | 部分 | 充分 | [n09-runtime-delivery.md](../textbooks/v12/n09-runtime-delivery.md)，行24；全部引用见JSON |
| 90 | 如何把安全反例纳入自动化回归，并验证修复没有破坏正常任务？ | 充分 | 充分 | [e03.md](../textbooks/v12/e03.md)，行62；全部引用见JSON |
| 91 | 设计一个客服工单 Agent：如何确定自动处理范围、转人工条件及验收指标？ | 部分 | 充分 | [n10-evaluation-projects.md](../textbooks/v12/n10-evaluation-projects.md)，行7；全部引用见JSON |
| 92 | 设计一个企业知识 Agent：如何同时保证检索质量、权限和更新时效？ | 充分 | 充分 | [c02.md](../textbooks/v12/c02.md)，行10；全部引用见JSON |
| 93 | 设计一个长时间运行的研究 Agent：如何保存进度、取消任务和恢复执行？ | 部分 | 充分 | [n09-runtime-delivery.md](../textbooks/v12/n09-runtime-delivery.md)，行11；全部引用见JSON |
| 94 | 请求量增长十倍时，如何识别模型、工具、队列或存储中的主要瓶颈？ | 充分 | 充分 | [e05.md](../textbooks/v12/e05.md)，行136；全部引用见JSON |
| 95 | 如何设计并发限制、超时、退避和熔断，避免故障扩大？ | 部分 | 充分 | [n09-runtime-delivery.md](../textbooks/v12/n09-runtime-delivery.md)，行34；全部引用见JSON |
| 96 | 怎样分解一次任务的费用和时延，找到最值得优化的环节？ | 充分 | 充分 | [e05.md](../textbooks/v12/e05.md)，行10；全部引用见JSON |
| 97 | 什么时候使用小模型路由、大模型升级或缓存？如何量化质量损失？ | 充分 | 充分 | [e05.md](../textbooks/v12/e05.md)，行148；全部引用见JSON |
| 98 | 从质量、成本和运维角度，怎样选择本地模型与托管 API？ | 部分 | 充分 | [n09-runtime-delivery.md](../textbooks/v12/n09-runtime-delivery.md)，行56；全部引用见JSON |
| 99 | 请介绍一次实际 Agent 故障或失败案例：原因是什么，如何修复，怎样证明修复有效？ | 部分 | 部分 | [n10-evaluation-projects.md](../textbooks/v12/n10-evaluation-projects.md)，行58；全部引用见JSON |
| 100 | 如果必须在两周内交付一个可用 Agent，你会怎样确定最小范围、基线、风险与上线条件？ | 充分 | 充分 | [p01-mvp.md](../textbooks/v12/p01-mvp.md)，行3；全部引用见JSON |
| 101 | 调用多个模型或工具API时，如何用Python asyncio组织并发？阻塞调用、无界任务创建和取消清理分别会导致什么问题，怎样用最小例定位？ | 部分 | 充分 | [n01-python-model-foundations.md](../textbooks/v12/n01-python-model-foundations.md)，行50；全部引用见JSON |
| 102 | 把请求状态放进Python列表或字典时，别名与浅拷贝会怎样污染另一个任务？请说明不可变容器的边界，并解释如何用装饰器封装工具日志而保持函数行为。 | 未覆盖 | 充分 | [n01-python-model-foundations.md](../textbooks/v12/n01-python-model-foundations.md)，行9；全部引用见JSON |
| 103 | 实现容量受限的LRU缓存，说明get/put复杂度，并给出容量为零、覆盖已有键和淘汰次序的测试。 | 未覆盖 | 充分 | [n01-python-model-foundations.md](../textbooks/v12/n01-python-model-foundations.md)，行81；全部引用见JSON |
| 104 | Agent服务运行数小时后内存持续增长，但请求量平稳。如何区别对象仍被引用、缓存无界、待完成任务堆积与暂时内存峰值，并验证修复？ | 未覆盖 | 充分 | [n09-runtime-delivery.md](../textbooks/v12/n09-runtime-delivery.md)，行46；全部引用见JSON |
| 105 | 余弦相似度、点积和欧氏距离如何计算？向量归一化会怎样改变它们的排序关系，零向量和维度不符怎样处理？ | 部分 | 充分 | [n05-retrieval-ingestion.md](../textbooks/v12/n05-retrieval-ingestion.md)，行49；全部引用见JSON |
| 106 | 如何用精确向量检索建立基线，再比较HNSW与IVF的召回、内存、构建和查询代价？过滤条件加入后还需要怎样测量？ | 未覆盖 | 充分 | [n05-retrieval-ingestion.md](../textbooks/v12/n05-retrieval-ingestion.md)，行65；全部引用见JSON |
| 107 | 文档局部修改、删除或权限变化时，怎样增量更新分块和向量索引？如何检测漏删、重复块及新旧版本混用？ | 部分 | 充分 | [n05-retrieval-ingestion.md](../textbooks/v12/n05-retrieval-ingestion.md)，行31；全部引用见JSON |
| 108 | 包含扫描页、表格和跨页段落的PDF怎样进入RAG？如何保留页码与结构、测解析质量，并防止OCR错误被引用成原文事实？ | 未覆盖 | 充分 | [n05-retrieval-ingestion.md](../textbooks/v12/n05-retrieval-ingestion.md)，行9；全部引用见JSON |
| 109 | 解释decoder-only Transformer从token到下一token分布的基本推理过程：因果注意力、多头、位置、前馈层各起什么作用？这与检索外部事实有什么区别？ | 未覆盖 | 充分 | [n01-python-model-foundations.md](../textbooks/v12/n01-python-model-foundations.md)，行114；全部引用见JSON |
| 110 | 提示模型返回JSON、使用JSON模式和按Schema约束生成分别能保证什么？遇到拒绝、截断、类型合法但语义错误时，应用怎样处理？ | 部分 | 充分 | [n01-python-model-foundations.md](../textbooks/v12/n01-python-model-foundations.md)，行128；全部引用见JSON |
| 111 | 同一Agent英语任务表现正常，中文或混合语言却失败，怎样分别检查分词/检索、提示、工具参数与评测样本，而不是直接换模型？ | 部分 | 充分 | [n10-evaluation-projects.md](../textbooks/v12/n10-evaluation-projects.md)，行36；全部引用见JSON |
| 112 | 用户在多轮任务中突然换话题，又用“继续刚才那个”返回，怎样识别任务切换、保存各自状态并澄清指代，防止旧任务动作误执行？ | 部分 | 充分 | [n02-context-memory-prompt.md](../textbooks/v12/n02-context-memory-prompt.md)，行108；全部引用见JSON |
| 113 | 部署本地推理服务时，怎样区分prefill与decode瓶颈，解释KV cache与批处理对吞吐、首token和尾延迟的影响，并设计公平比较而非先认定某框架更快？ | 部分 | 充分 | [n09-runtime-delivery.md](../textbooks/v12/n09-runtime-delivery.md)，行62；全部引用见JSON |
| 114 | 面对客户工程团队，怎样交付一份可复现的Agent技术移交包，使对方能重建环境、运行评测、理解架构决策并报告失败？如何证明接手成功？ | 充分 | 充分 | [p02.md](../textbooks/v12/p02.md)，行16；全部引用见JSON |

Q10、Q99仍需真实个人项目/失败经历。其余题的正文充分不代表全部代码、模型、协议、生产、用户反馈和行业对比已验证。
