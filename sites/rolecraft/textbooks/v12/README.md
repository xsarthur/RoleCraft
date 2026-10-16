# Agent工程教材 v12

先读[认识Agent工程](00-learning-route.md)，再按下表完成组件与集成；[完整合订本](agent-engineering-textbook.md)包含同一30单元。本版将市场面试样本暴露的能力缺口融入机制、实现和练习，专业正文保留深度，面试题不是章节组织方式。

## 概要、补学与实作入口

概要先看问题、任务验收、信任边界和方案选择。基础不足者先做[入口诊断](01-foundation.md#先做入口诊断)，再补[Python与模型基础](n01-python-model-foundations.md)。有基础者也应保留诊断记录，确认对象/并发/输出契约后再跳过对应补学。完整实现按先修推进；高级ANN与推理服务选读不自动成为初级门槛。

实作从组件夹具进入固定流程，再按任务需要采用动态循环/图/协作，最后迁移到客服知识或研究任务。首次真实敏感读取或外部写入前须落实强制安全并取得实际授权；本教材和示例不自动授予真实服务调用或发布权限。

## 30单元阅读顺序

| 阅读位置 | 正文 | 工程环节 |
| --- | --- | --- |
| 1 | [认识 Agent 工程](00-learning-route.md) | Agent定义、适用需求与工程全貌 |
| 2 | [把文本输入变成可运行可判错的小程序](01-foundation.md) | 程序、异常、断言与基础诊断 |
| 3 | [让 Agent 的语言运行时与模型输出具有可解释的边界](n01-python-model-foundations.md) | 对象、并发、LRU与模型推理/输出契约 |
| 4 | [从真实任务取得值得解决的问题证据](p01-discovery.md) | 真实问题、现有方案与可证伪假设 |
| 5 | [动手前定义任务成功与合理停止](02-task-acceptance.md) | 任务成功、停止和证据条件 |
| 6 | [分清事实资料与动作授权](03-trust-boundary.md) | 事实与授权来源分离 |
| 7 | [外部 API 请求的可判错边界](f01.md) | 外部请求与受控错误边界 |
| 8 | [把模型响应变成经校验的业务候选](f02.md) | 模型候选结构与业务核验 |
| 9 | [让跨轮上下文保留事实，让长期记忆可以被纠正](n02-context-memory-prompt.md) | 提示、记忆生命周期与任务切换 |
| 10 | [为一个任务选择最小可用方案 程序 单次模型 流程与动态 Agent](c01-selection.md) | 普通程序、单调用、流程与Agent选型 |
| 11 | [在重复提议和发送中识别同一个动作](c01-control-primer.md) | 提议、动作、发送与效果身份 |
| 12 | [构造符合版本和权限的证据包](c02.md) | 权限和版本正确的证据包 |
| 13 | [把模型提议变成可授权可去重的写工具](c03.md) | 授权、去重与效果核对 |
| 14 | [工具增长到上百个时，怎样发现、选择并安全接入](n04-tools-mcp.md) | 工具目录、MCP与第三方接入 |
| 15 | [用持久状态保存动作事实](e01.md) | 持久账本、恢复和并发事实 |
| 16 | [用固定路径完成同一受控任务](c01-fixed-workflow.md) | 连接组件的固定路径 |
| 17 | [Agent 控制循环 设计一个可恢复 受控并能验收的运行时](c01-control-loop.md) | 依据观察推进的受控完整循环 |
| 18 | [让计划依据观察前进，而不是在反复规划中空转](n03-planning-reflection.md) | ReAct、计划、重规划与反思 |
| 19 | [从原始文档到可比较的自适应检索链](n05-retrieval-ingestion.md) | 摄取、向量/索引、重排与Agentic RAG |
| 20 | [把控制循环映射为可恢复的状态图](n06-graph-orchestration.md) | LangGraph状态、子图与流消费 |
| 21 | [让多个 Agent 协作而不稀释任务责任](n07-multiagent-a2a.md) | 协作模式、交接和A2A |
| 22 | [判断版本改动是否改善任务结果](e02.md) | 版本结果、轨迹与回归评测 |
| 23 | [用新场景、分层实验和独立移交检验工程能力](n10-evaluation-projects.md) | 客服/研究迁移、跨语排错、技术移交 |
| 24 | [依据问题和评价证据冻结 MVP 决定](p01-mvp.md) | 依据问题和评价冻结MVP |
| 25 | [在数据返回和动作发送前强制执行权限](e03.md) | 数据与动作的强制权限 |
| 26 | [把模型生成代码限制在可验证的执行边界内](n08-sandbox-security.md) | 生成代码的隔离与准入 |
| 27 | [发布回退时保住在途任务事实](e04.md) | 发布、迁移和回退 |
| 28 | [在质量护栏下比较性能与成本](e05.md) | 质量约束下的性能与成本 |
| 29 | [让长任务在故障、容量和成本约束下交付](n09-runtime-delivery.md) | 长任务、补偿、熔断、内存与推理服务 |
| 30 | [用独立作品证据判定交付并复验改进](p02.md) | 真实作品、独立复验和迭代 |

## 正式先修

| 单元 | 正式先修 |
| --- | --- |
| [认识Agent工程](00-learning-route.md) | 无 |
| [基础预备](01-foundation.md) | [认识Agent工程](00-learning-route.md) |
| [Python与模型基础](n01-python-model-foundations.md) | [基础预备](01-foundation.md) |
| [问题发现](p01-discovery.md) | [认识Agent工程](00-learning-route.md) |
| [任务验收](02-task-acceptance.md) | [问题发现](p01-discovery.md) |
| [信任边界](03-trust-boundary.md) | [任务验收](02-task-acceptance.md) |
| [外部API](f01.md) | [基础预备](01-foundation.md)、[任务验收](02-task-acceptance.md)、[信任边界](03-trust-boundary.md) |
| [模型候选](f02.md) | [外部API](f01.md) |
| [上下文、记忆与提示](n02-context-memory-prompt.md) | [模型候选](f02.md)、[信任边界](03-trust-boundary.md) |
| [方案选择](c01-selection.md) | [模型候选](f02.md)、[任务验收](02-task-acceptance.md) |
| [动作身份](c01-control-primer.md) | [方案选择](c01-selection.md)、[信任边界](03-trust-boundary.md) |
| [检索证据](c02.md) | [模型候选](f02.md)、[信任边界](03-trust-boundary.md) |
| [写工具](c03.md) | [外部API](f01.md)、[方案选择](c01-selection.md)、[动作身份](c01-control-primer.md) |
| [工具目录与MCP](n04-tools-mcp.md) | [写工具](c03.md)、[外部API](f01.md)、[动作身份](c01-control-primer.md) |
| [持久恢复](e01.md) | [写工具](c03.md)、[动作身份](c01-control-primer.md) |
| [固定流程](c01-fixed-workflow.md) | [模型候选](f02.md)、[检索证据](c02.md)、[写工具](c03.md)、[持久恢复](e01.md) |
| [动态循环](c01-control-loop.md) | [固定流程](c01-fixed-workflow.md)、[写工具](c03.md)、[持久恢复](e01.md) |
| [规划与反思](n03-planning-reflection.md) | [动态循环](c01-control-loop.md)、[任务验收](02-task-acceptance.md) |
| [进阶检索与摄取](n05-retrieval-ingestion.md) | [检索证据](c02.md)、[Python与模型基础](n01-python-model-foundations.md)、[规划与反思](n03-planning-reflection.md) |
| [图编排](n06-graph-orchestration.md) | [持久恢复](e01.md)、[动态循环](c01-control-loop.md)、[规划与反思](n03-planning-reflection.md) |
| [多Agent与A2A](n07-multiagent-a2a.md) | [图编排](n06-graph-orchestration.md)、[上下文、记忆与提示](n02-context-memory-prompt.md)、[工具目录与MCP](n04-tools-mcp.md) |
| [版本评价](e02.md) | [检索证据](c02.md)、[写工具](c03.md)、[动态循环](c01-control-loop.md) |
| [跨场景评价与移交](n10-evaluation-projects.md) | [版本评价](e02.md)、[进阶检索与摄取](n05-retrieval-ingestion.md)、[多Agent与A2A](n07-multiagent-a2a.md) |
| [MVP决定](p01-mvp.md) | [问题发现](p01-discovery.md)、[方案选择](c01-selection.md)、[版本评价](e02.md) |
| [强制安全](e03.md) | [检索证据](c02.md)、[写工具](c03.md)、[版本评价](e02.md)、[信任边界](03-trust-boundary.md) |
| [代码沙箱](n08-sandbox-security.md) | [强制安全](e03.md)、[Python与模型基础](n01-python-model-foundations.md) |
| [发布回退](e04.md) | [持久恢复](e01.md)、[版本评价](e02.md)、[强制安全](e03.md) |
| [性能成本](e05.md) | [版本评价](e02.md)、[发布回退](e04.md) |
| [运行交付](n09-runtime-delivery.md) | [发布回退](e04.md)、[性能成本](e05.md)、[代码沙箱](n08-sandbox-security.md)、[持久恢复](e01.md) |
| [独立作品与复盘](p02.md) | [持久恢复](e01.md)、[强制安全](e03.md)、[发布回退](e04.md)、[性能成本](e05.md)、[MVP决定](p01-mvp.md) |

## 版本、练习和证据

[能力与练习/作品映射](../../team/textbook-v12-curriculum.md)及[结构化规格](../../team/textbook-v12-curriculum.json)保留原12模块/24目标/48知识点，新增W-N01至W-N10。[示例运行说明](examples/README.md)区分作者自查与独立QA。19篇原专业正文完整迁移，仅追加v12导航；旧例未因复制重授运行。

独立评审结论以team目录内当前v12内容审校和QA绑定为准。题目支持度、代码执行、真实学习者表现、专家认可及实际入行分别记录；本版不自动接入网站，不声称通过完整职业与产品目标。
