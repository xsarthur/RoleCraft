# AI 生成工程师 D0 replay 内容审校 v0.1

- 审校 ID：`AI-D0-REPLAY-CONTENT-REVIEW-20261015-01`
- 目标岗位：`AI`（AI 生成工程师）
- 审校责任：内容审校员
- 审校日期：2026-10-15（Asia/Shanghai）
- 审校结论：`reviewed_with_limitations`
- D0/训练结论：`not_assessed`；本报告不授予 L0 以上级别，不替学习者补答

## 审校范围与输入

本次只审校 AI 生成工程师 D0 原始输入及其本地确定性替身 replay，重点核对：

1. 五项 D0 机制解释是否与证据相称；
2. 故障边界、停止条件、来源和版本绑定是否说清；
3. `PLR-AI-006`（DeepLearning.AI《AI Agents in LangGraph》）的课程边界是否被正确表达；
4. replay 是否把确定性替身结果写成真实模型、真实 LangGraph 或生产能力。

收到的主要文件：

| 文件 | 用途 | 收到版本 |
|---|---|---|
| `sites/rolecraft/team/ai-generation-d0-v01-initial.md/.json` | D0 原始输入副本 | 与原 `ai-generation-d0-v01.md/.json` 哈希一致 |
| `sites/rolecraft/team/ai-generation-d0-v02-replay.md/.json` | 追加的本地确定性替身 replay | `D0-AI-20261015-001-R1` |
| `/private/tmp/ai_generation_d0_fixture_v1.py` | replay 夹具脚本 | SHA-256 `fddcf6f9660b5c68079057ffb0fb170aa11e39e0c9379ff9ad95c32be7d39bde` |
| `/private/tmp/ai_generation_d0_run_v2.json` | replay 输出 | SHA-256 `399797452164d129d1e733159545f757bf8ae665981a4728ef5ddda132bd268b` |
| `sites/rolecraft/team/professional-learning-resources-v02.json` | `PLR-AI-006` 资源卡 | 当前课程页快照，课程发布版本未公开 |
| `sites/rolecraft/team/professional-learning-theory-check-v01.md` | LangGraph 理论题、反例、作品和迁移规格 | `PLR-AI-006` 仍为 `planned` |

原始 D0 与 replay 差异必须保留：原始 D0 的 `D0-AI-03` 是 `not_run`，其余内容是回答和计划；replay 后仅新增一次 `local_deterministic_stand_in_replay`，状态为 `passed_local_fixture`，总体 `decision` 仍为 `not_assessed`。本报告不覆盖初始输入，也不把 replay 结果回写成原始 D0 已运行。

## 对原始 D0 五项的内容判断

| D0 项 | 审校观察 | 内容状态 |
|---|---|---|
| `D0-AI-01` 职责边界 | 明确模型生成服务、结构化输出、来源关联、重试/恢复与交接属于 AI 岗位；同时明确不负责账户/数据库最终权限、前端、教材正文、独立 QA 和产品范围。边界方向正确，但没有绑定一份冻结的 AI 任务合同、输入 schema 或接收签收。 | `adequate_with_limitations` |
| `D0-AI-02` 机制解释 | “结果持久化后才能完成”、状态检查、来源校验、幂等性未知时暂停的原则合理，且主动声明真实 LangGraph、模型、外部工具和生产存储未验证。当前只是概念解释；replay 没有持久化后崩溃、检查点损坏或恢复运行，不能把这段原则写成已验证的 LangGraph 机制。 | `adequate_with_limitations` |
| `D0-AI-03` 确定性熟悉任务 | replay 证明了合成 A 租户的一个正常路径、引用字段和 `external_action=null`。但夹具没有真正请求 B 文档并观察拒绝；没有 crash/恢复、schema 错误或部分输出。原始“not_run”和 replay 的有限通过须分开记录。 | `pass_with_limitations` |
| `D0-AI-04` 故障识别 | 能识别“先写 completed、持久化失败、恢复跳过工具”的危险，以及非幂等重放的副作用风险；停止、保留错误和升级动作方向正确。该故障是题面/推演识别，replay 未注入或观察此故障，不能写成实际失败修复证据。 | `adequate_with_limitations` |
| `D0-AI-05` 陌生任务计划 | 计划固定只改变检查点可用性，并要求记录基线、检查点、幂等键、来源校验、首次失败和留出变体，符合边界意识。任务尚未运行，无迁移或未知变体证据。 | `planned_not_run` |

## replay 证据可以支持的结论

夹具脚本在 Python 3.14.5、macOS 26.6.2、任务约束禁网、无付费 API 的环境中执行。脚本的 `result` 是固定字典；“模型”没有被调用，检索工具也是脚本内的合成只读数据。当前证据支持以下有限结论：

- 该脚本在一次正常路径中记录了 `start → tool_called → tool_returned → drafted → checked → handed_off`；
- A 租户的 `doc-A-refund-v1` 被写入合成引用，输出没有 `B-PRIVATE`，`external_action` 为 `null`；
- replay 输出、夹具版本和环境可按记录重建；
- 输出已交 `draft_ready_for_review`，未执行外部写入。

这里的 `generated_text` 是确定性替身拼接出的合成文本“DEMO-42：退款需复核。”，不是供应商模型输出，也不是 LangGraph 节点执行结果。`passed_local_fixture` 只能描述该夹具的局部断言，不可改写为真实模型质量、真实 API 兼容性、生产恢复安全、费用或通用 Agent 能力。

## 发现的边界和缺陷

### `AI-D0-REPLAY-CR-01`（P1）：未验证未授权读取的拒绝路径

脚本直接用 `next(...)` 选中已授权的 `doc-A-refund-v1`，没有提交一次请求读取 `doc-B-private-v1` 并记录拒绝状态。因此“B 文档未进入结果”只能证明输出没有该字符串，不能证明应用在恶意/错误请求下执行了租户拒绝。D0 任务的“必须拒绝租户 B”尚未满足完整证据条件。

返修要求：加入明确的 B 文档请求和拒绝收据（状态、错误类型、无下游生成、无来源引用），同时保留 A 正常路径；再由 QA 做原例、回归和一个未预告文档/租户变体。

### `AI-D0-REPLAY-CR-02`（P1）：没有持久化或恢复故障证据

`states` 只存在于进程内列表，最终 JSON 是脚本正常结束后的整体输出。没有耐久 checkpoint、工具结果先后写入、进程崩溃、旧检查点、空 `tool_result_ref/source_refs` 或恢复后的重放判断。因此 D0-02 的持久化不变量和 D0-04 的故障处置仍是合理推演，而非已运行机制。

返修要求：在无网络夹具中加入单次 checkpoint 写失败/进程中止和恢复路径，记录旧检查点、耐久工具结果、重放键、恢复状态和人工暂停条件；若不模拟真正耐久存储，必须把结论限定为“内存状态演示”。

### `AI-D0-REPLAY-CR-03`（P1）：来源/版本绑定不足，不能证明课程 API

D0 只在 `resource_id=PLR-AI-006` 层面绑定 LangGraph 课程；没有逐条机制主张的课程章节/视频/代码示例位置、课程版本号或 LangGraph 包版本。当前资源卡说明课程页未公开发布版本，且复核时课程页直接抓取为 HTTP 403；这一限制已被记录，但不能用索引信息补成课程正文证据。官方 LangGraph 文档是另一个来源，不能自动证明 DeepLearning.AI 课程示例所用 API。

返修要求：逐项标 `source_ref`、`claim_type`（课程事实 / 官方框架文档 / 项目设计假设 / 本地观察），记录访问日期；执行代码时记录 `langgraph` 包版本和 API 兼容结果，无法获取时保持 `insufficient_evidence`。

### `AI-D0-REPLAY-CR-04`（P2）：结构化输出检查不是 schema 验证

脚本通过固定字典取值和相等断言检查字段，没有 schema 版本、类型/必填字段错误、额外字段或部分输出反例；`checked` 的原因文字不能证明通用结构化输出验证已实现。

返修要求：加入版本化 JSON Schema（或等价可审计校验器）及 malformed/partial output 夹具，记录拒绝状态和原始输出保留规则。

### `AI-D0-REPLAY-CR-05`（P2）：合成来源有字段但无来源完整性证明

`document_id`、`source_version=fixture-source-v1` 和 quote 正确回传，适合作为字段绑定示例；但来源是夹具内联文本，没有来源文件哈希、章节/定位、更新时间、内容篡改检测或真实检索链。不能由此推出真实教材/知识库来源可靠。

返修要求：为合成来源登记 fixture 文档 hash/版本和定位；真实内容接入前另行核授权、版本、新鲜度和引用策略。

### `AI-D0-REPLAY-CR-06`（P2）：异常边界与未知迁移尚未执行

replay 未注入题包要求的超时、重复回调、旧检查点、空工具结果，也未运行 `U-AI-006-T1` 或留出变体。replay 文档已正确列出这些 `unverified`，应继续保持未验证，不能以正常路径断言覆盖。

### `AI-D0-REPLAY-CR-07`（P2）：初始和 replay 状态词汇没有显式映射

原始 D0 预期序列使用 `tool_requested → source_checked → draft_ready`，replay 实际使用 `tool_called → checked → handed_off`。这些词可能表达不同语义（请求、调用、来源校验、交接），当前没有状态映射或版本化状态合同。直接说“序列完全一致”容易把不同层级状态误当同一状态。

返修要求：为状态机声明版本化 enum、转移条件和旧词到新词的映射；在下一次 replay 同时记录请求/调用、来源校验、草稿准备和交接的细粒度事件。

## LangGraph 课程的适用边界

`PLR-AI-006` 是 DeepLearning.AI 面向中级 Python 学习者的框架专题课（页面快照列出 1h32m、9 个视频、6 个代码示例和 1 个 PRO 作业）。它适合作为显式状态、工具调用、持久化、人机介入和 Agentic Search 的学习输入，但内容绑定一个供应商/框架的课程示例；课程页没有公开发布版本号，beta/PRO 访问和课程许可仍需按资源卡限制处理。

官方 LangGraph 文档把 LangGraph描述为低层编排框架/运行时，并强调可将确定性步骤与 LLM 驱动步骤放在同一图中，同时提供持久化、流式和 human-in-the-loop 能力；这些是官方框架文档的当前描述，不是本 replay 的运行事实，也不等于课程代码或生产保证。课程、框架许可和项目自己的设计假设必须分开记录。

当前 D0 回答没有把课程示例直接写成已运行的 LangGraph API，这是优点；但也没有逐条来源定位，且 replay 完全没有导入 `langgraph`。后续训练必须明确：

- “课程/官方文档说明”只作为理论来源；
- “本地确定性替身”只作为夹具行为证据；
- “真实 LangGraph 包/API”必须另有版本、安装和运行收据；
- “真实模型输出/费用/生产恢复”仍需单独授权和契约，不能由本地 replay 推断。

## 审校结论与交接

本次审校认为 D0 原始回答和 replay 的边界表达总体诚实，机制和故障推演方向合理；但关键租户拒绝、持久化/恢复、schema 反例、逐题来源绑定和异常迁移仍缺证。故内容审校结果为 `reviewed_with_limitations`，D0 训练结论保持 `not_assessed`，不得授予 L1 或真实模型交付权限。

返修由 AI 生成工程师/课程架构师完成；测试工程师独立复验。不得删改原始 D0、首次 replay 或本报告来关闭缺陷。下一次复核需收到：

1. B 租户拒绝收据与 A 正常回归；
2. 持久化失败/进程中止/恢复状态快照；
3. schema 版本、错误输出和部分输出处理；
4. LangGraph 依赖版本或明确未运行证明；
5. 逐项来源定位与课程/官方文档/项目假设标签；
6. 超时、重复回调、旧检查点、空工具结果和 `U-AI-006-T1` 留出证据；
7. QA 原例—受影响回归—未预告变体及非作者签收。

本报告没有修改 learner 原始回答、D0 replay、课程教材、应用、账户、数据库或外部系统。
