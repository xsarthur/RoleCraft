# AI 生成工程师 D0 v0.3 故障注入与陌生约束迁移 · 内容审校

- **审校 ID**：`AI-D0-V03-CONTENT-REVIEW-20261015-01`
- **审校日期**：2026-10-15（Asia/Shanghai）
- **审校责任**：内容审校员
- **目标岗位**：AI 生成工程师（`AI`）
- **审校结论**：`reviewed_with_limitations`
- **D0/训练结论**：`not_assessed`；L1 与真实模型/生产权限均未授予

## 审校范围与输入

本次独立审校针对 v0.3 新增的四类故障注入和一个陌生约束迁移，检查故障机制是否讲清、首失败与停止/恢复证据是否与声明相称、状态合同是否一致，以及是否把本地确定性替身误写成真实模型、真实 LangGraph 或生产恢复能力。此前 v0.1/v0.2 的开放缺陷继续保留；本报告不覆盖旧记录，也不替学习者作答。

| 输入 | 用途 | 收到版本/哈希 |
| --- | --- | --- |
| `sites/rolecraft/team/ai-generation-d0-v03-fault-transfer.md/.json` | 本轮故障与迁移说明、运行摘要 | MD `7f85e10abd3adba65ea9951095563b96c85d91949d78dda4ac79b3843fc416a9`；JSON `1b4fcbe6f7dbbfb65c745558630d774321e9902406ea9744a113a7f8f2a93906` |
| `/private/tmp/ai_generation_d0_fault_transfer_v1.py` | 可重建夹具 | `37c18726cc2391bc7997b93e0bafa1bf626367d0d5686956316101e3f3f9ee34` |
| `/private/tmp/ai_generation_d0_fault_transfer_run_v3.json` | 作者记录的运行输出 | `6a74928b13d8fc28499b1d591d2ad5c0679852c4e9c52d9571e7f9a09d13c062` |
| `sites/rolecraft/team/professional-learning-theory-check-v01.md/.json` | `E-AI-006-S1` 与 `U-AI-006-T1` 的题目、边界和停机条件 | MD `175b31a81ad4bc0692e7d1db22c57cec138b4b33ab509876a7e7138629b28749`；JSON `881a3a7cc11ca48010d8c84613d4ca93752aa1cdb3da39e5c0af2436a087eac0` |

我在同一工作区重新执行夹具，命令与作者记录相同，得到 `/private/tmp/ai_generation_d0_fault_transfer_review_run.json`，哈希为 `6a74928b13d8fc28499b1d591d2ad5c0679852c4e9c52d9571e7f9a09d13c062`，与作者输出一致。该重跑只证明夹具可重复，不增加真实系统证据。

## 本轮结果与证据边界

| 场景 | 夹具实际展示 | 内容判断 |
| --- | --- | --- |
| `FI-AI-EMPTY-001` | 记录 `EMPTY_TOOL_RESULT`，在生成前进入 `failed → stopped → recovery_required`，随后以固定来源重试并交接；无外部动作 | `pass_with_limitations`。停止顺序清楚，但“可安全重试”来自夹具声明的 `side_effect=none`，没有真正的工具调用、幂等性证明或失败后持久化。 |
| `FI-AI-DUP-001` | 以 `callback_id=cb-001` 检测重复，声称复用首个结果、没有第二个草稿或外发 | `pass_with_limitations`。去重逻辑的意图正确；“first callback persisted/durable result reused”实际只是内存状态列表与固定结果，不能证明耐久存储、并发竞态或重复回调到达顺序。 |
| `FI-AI-OLD-001` | 不信任 `v0` 的 `completed` 标记，要求 `tool_result_ref/source_refs`，随后恢复并交接 | `pass_with_limitations`。旧状态不应单独决定完成这一机制方向正确；但 `source_result()` 是函数内重新生成的固定字典，并非从耐久存储找回，恢复证据应降级为“合成状态重建”。 |
| `FI-AI-TIMEOUT-001` | 固定写入 50ms 超时，丢弃部分输出，停止并做一次有界重试 | `adequate_with_limitations`。异常分支与停止条件可读；脚本没有等待、取消、部分输出或真实工具超时，不能证明 deadline、取消传播、重试竞态或预算控制。 |
| `U-AI-006-T1` | 只改变 checkpoint 暂时不可用标签，记录首失败，暂停草稿/外发，恢复写入 `v2` 后才生成、检查和交接 | `pass_with_limitations`。保持输入契约的教学意图清楚；恢复仍是手写状态机分支，没有真实队列、checkpoint 存储、进程中止、并发或留出任务。 |

五个场景的局部断言、输出哈希和环境声明可复现：Python `3.14.5`、macOS `26.6.2`、禁网、未导入 `langgraph`、未调用真实模型/付费 API、无外部写入。它们共同支持的最强结论是：**该确定性夹具能够按预设路径记录首失败、停止、有限恢复和无外发动作**。它们不支持真实模型质量、LangGraph API 兼容、耐久持久化、生产崩溃恢复、模型费用或岗位能力。

## 机制、状态合同和故障解释

内容方向总体合理：在来源、schema 或 checkpoint 不可信时停止下游生成；在只读工具且有界预算成立时才允许重试；在 checkpoint 可用前不发布草稿。v0.3 也明确写出“恢复是确定性状态机演示，不是真实耐久存储或进程崩溃恢复”，避免了把替身结果直接写成生产能力的主要风险。

仍有以下机制缺口：

1. `BASE` 的工具契约只写 `side_effect=none` 和一个幂等键格式；空结果的重试使用了新的 `run-empty:2` 键，脚本没有证明供应商/工具会按该键去重，也没有耗尽重试、重试后再次为空或来源冲突的处理。
2. `scenario_duplicate_callback` 的“持久化”和 `scenario_old_checkpoint` 的“durable result found”没有对应存储操作。脚本只是追加状态字典，并由 `source_result()` 重新构造来源；这不能作为 checkpoint 或工具结果耐久性证据。
3. `scenario_timeout` 直接写入 `timeout` 状态，没有真实时钟、取消、线程/任务中止、部分输出保留或超时后迟到回调，因此不能证明真实超时安全。
4. `draft()` 固定产生完整字典，所谓“schema checks passed”只是取值和相等断言；没有版本化 JSON Schema（或同等校验器）、类型错误、缺字段、额外字段、空引用和来源冲突反例。
5. `source_result()` 不接收租户或文档参数，也不执行授权检查；所有场景都直接得到 A 的固定文档。没有请求 B 文档并记录拒绝收据，因而未满足原题的租户隔离负例。
6. 状态词仍未与早期 D0 合同显式映射：旧记录使用 `tool_requested/source_checked/draft_ready`，本轮使用 `tool_called/tool_returned/checked/handed_off`。`handed_off` 不是明确的终态枚举，`checked` 也未区分 schema 检查、来源检查和无发送条件。
7. 迁移任务标题提到状态、持久化和人工介入，但夹具没有人工批准、拒绝、升级或恢复事件；不能把“人工介入模式已迁移”写成已运行结论。

## LangGraph、来源、版本和许可边界

`PLR-AI-006` 仍是 DeepLearning.AI 的《AI Agents in LangGraph》课程快照（中级 Python、1h32m、9 个视频、6 个代码示例和 1 个 PRO 作业；课程页面没有公开发行版本/日期）。本轮只引用资源 ID 和理论核验包，不提供逐条课程章节或代码位置；课程页访问限制和课程版本未知仍然有效。

本轮运行明确 `langgraph_imported=false`，没有真实 LangGraph 包、API 或课程示例执行证据。因而必须分开表述：课程/官方文档是学习来源，项目设计假设是待验证规范，本地夹具是合成行为证据；三者都不能互相替代。课程内容/代码许可未被推断，框架许可也与课程许可分开；在许可未核实前只能链接或做必要短引，不得复制课程代码进入教材、训练数据或产品。

## 缺陷与返修要求

| 缺陷 ID | 严重度 | 状态 | 证据与返修要求 |
| --- | --- | --- | --- |
| `AI-D0-V03-CR-01` | P1 | `open` | **租户拒绝路径仍未执行。** 固定 `source_result()` 绕过 B 文档请求与授权拒绝。需加入明确 B 请求、拒绝代码/状态、无下游生成和 A 回归，并由 QA 冻结一个未预告租户/文档变体。 |
| `AI-D0-V03-CR-02` | P1 | `open` | **没有耐久 checkpoint/恢复证据。** “persisted/durable/recovered”均来自内存夹具或重新生成的固定字典。需使用可审计的本地耐久介质，注入写失败/进程中止，记录旧检查点、工具结果引用、恢复键和实际重放。 |
| `AI-D0-V03-CR-03` | P1 | `open` | **逐条来源/版本绑定不足。** 只有 `PLR-AI-006` 和 `fixture-source-v2` 字段，没有 `source_ref`、`claim_type`、课程段落/API 位置或 `langgraph` 包版本。需为每项机制主张标记课程事实、官方文档、项目假设或本地观察，并记录版本/访问日；取不到时保持 `insufficient_evidence`。 |
| `AI-D0-V03-CR-04` | P1 | `open` | **授权工具契约未实际执行。** 工具函数不接收或校验租户/文档参数，无法证明拒绝越权读取。需运行授权、越权、无匹配和来源冲突路径。 |
| `AI-D0-V03-CR-05` | P1 | `open` | **“耐久结果复用”与恢复语义可能误导。** duplicate/old-checkpoint 文字使用 `persisted/durable`，而夹具没有存储操作。需改为合成状态重建，或补足真实本地存储和恢复证据；两者不可混写。 |
| `AI-D0-V03-CR-06` | P2 | `open` | **超时是符号分支而非时间故障。** 未执行真实等待、取消、迟到回调、部分输出或预算耗尽。需在隔离环境注入可控时钟/任务中止并保留前后证据。 |
| `AI-D0-V03-CR-07` | P2 | `open` | **结构化输出检查仍不是 schema 验证。** 需提供版本化 schema、malformed/partial/extra-field/empty-citation 反例与拒绝状态。 |
| `AI-D0-V03-CR-08` | P2 | `open` | **状态合同词汇漂移。** 需冻结版本化 enum、转移条件和旧词到新词的映射，并分别记录工具请求/调用、来源核对、草稿准备、交接和人工审批。 |
| `AI-D0-V03-CR-09` | P2 | `open` | **人工介入与迁移留出不足。** 没有 approve/reject/escalate 事件，也没有未知队列或 checkpoint 变体。需补人工拒绝恢复和一个非作者冻结的留出约束。 |
| `AI-D0-V03-CR-10` | P2 | `open` | **重试安全只由 `side_effect=none` 推定。** 需记录工具实际幂等合同、相同/不同 idempotency key 行为、重试耗尽和来源冲突；否则保留 `retry_safety_unverified`。 |

## 交接结论

本轮相较 v0.2 新增了四类故障和一个单约束迁移，局部夹具执行完整且没有把真实模型/LangGraph/生产能力写成已验证事实；这部分内容审校可记为 `reviewed_with_limitations`。由于租户拒绝、耐久恢复、schema 反例、逐条来源绑定、人工介入和留出迁移仍缺证，D0 总结论保持 `not_assessed`，不得授予 L1、真实模型调用或无监督生产权限。

返修由 AI 生成工程师完成，课程架构师协助补来源和状态合同，测试工程师独立执行原例—受影响回归—未预告变体。不得删除或覆盖 v0.1/v0.2/v0.3 失败记录；首次失败与返修后复验必须分开保存。本报告未修改学习者原始回答、训练题包、教材、应用、账户/数据库或外部系统。

