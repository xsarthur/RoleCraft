# AI L0 Learner Handoff 内容审校 v12

- 记录：`AI-L0-LEARNER-HANDOFF-CONTENT-REVIEW-20261015-V12`
- 审校岗位：内容审校员（独立核内容语义、证据绑定与边界；不执行代码、不授等级）
- 目标：`/private/tmp/ai-generation-l0-learner-handoff-v12`
- 诊断：`D0-AI-20261015-001`
- 结论：`reviewed_with_limitations`
- 范围决定：`met_within_scope`

## 核查结果

### A 正常运行收据：`met_with_limitations`

v12 新增 `A-stdout.txt`、`A-receipt.json` 与 `A-run-receipt.json`，manifest 中列出的字节数/SHA-256 均与实际文件可复算一致。`A-stdout.txt` 实际包含 `DEMO-42 draft A\\n`（16 bytes）；`A-receipt.stdout_sha256` 覆盖这段原始 stdout，`A-run-receipt.output_hash` 则覆盖去掉换行的文本值。两种哈希目前能够解释为不同字节规范，不能把它们视为同一收据；`A-run-receipt` 没有显式声明其 hash 的原始字节规则，且 `log: stdout captured` 是声明而非独立进程日志。该证据已明显优于 v11，但仍应明确单一规范或把两者命名为不同摘要，避免误读为命令重新执行证据。

### D0-04 event / 工具 / 副作用语义：`met_with_limitations`

实际引用文件覆盖 baseline、tool input/output、checkpoint before/after、故障、恢复、重放、idempotency 和 event trace；恢复链 `recovery_required -> replayed -> draft_ready` 与 `U-AI-L0-001` 重用语义连贯。checkpoint 不可用、预算耗尽停线及 `external_action: null` 能表达本地故障夹具的停止边界。

不过 `event-trace.json` 的 `tool_input_hash: input-hash-local`、`tool_output_hash: output-hash-local` 仍是不可复算的占位标签，与已提供的 JSON 字节/SHA 不同。`side_effect: null` 只表达夹具声明，没有逐事件的副作用观测、事务/回滚边界、真实进程崩溃恢复或外部系统观察。`recovery-event` 仅记录重放后的结果，不能独立证明恢复动作实际执行。

### D0-05 四状态矩阵：`met_with_limitations`

`baseline`、`first_failure`、`regression`、`holdout` 四行均绑定到现有 artifact，并逐行提供 `schema_version`、`source_refs`、`tenant`、`source_version` 和 `status`；状态从 `tool_returned`、`recovery_required` 到 `draft_ready` 的路径与 D0-04 文件基本一致。矩阵因此可作为本地文件级映射证据。

但矩阵没有字段级断言值与对应事件序号，也没有把 holdout 变成实际陌生任务执行；`holdout` 仍是记录的 recovery-required 状态。它不能单独证明迁移能力、真实未知输入泛化或四状态在生产运行中的稳定性。

### EvidenceCard 绑定与限制：`met_with_limitations`

五张 EvidenceCard 可读且均有 diagnostic_id；D0-04、D0-05 至少绑定了 `d0-04/regression.json`。但这两张卡没有逐题绑定新增的 A receipt、event trace、tool input/output、recovery chain 与 D0-05 matrix，且 evidence_id 仍为 `V10`，与 v12 handoff 版本不一致。卡片是索引，不是学习者完整答案正文，也不能替代独立 QA 或真人签收。

## 结论与后续

v12 在收据可复算性、恢复文件和四状态矩阵方面较 v11 有实质补证，达到本次“内容与证据绑定语义”审校范围；仍保持 `reviewed_with_limitations`。建议后续：

1. 在 A 收据中明确每个 hash 的精确原始字节规范，并保留命令、环境和 stdout 文件的关系。
2. 将 D0-04 工具输入/输出 hash 改为对实际文件字节可复算的摘要，补逐事件输入、输出、时间、重放和副作用判定。
3. 为 D0-05 增加字段级断言、事件序号与真实 holdout 执行证据，区分声明性矩阵和运行结果。
4. 让 EvidenceCard 逐题绑定 A 收据、event trace、工具收据、matrix 和版本化 ID，并补学习者答案正文/接收签收关系。
5. 保持 `human_receipt=pending`、`qa_status=pending`、D0/L0 `not_assessed`、L1/L2 `not_granted`；不得由本审校授予等级或推断真实模型、生产恢复、职业能力、真人专家审核或学习效果。

## 未验证边界

没有真实模型/API、供应商来源、真实租户权限、真实进程/数据库恢复、并发/RPO-RTO、外部工具副作用、未知任务迁移、真人签收、学习者能力或职业认证证据。所有正面判断限于该本地确定性 handoff 文件及其可复算静态关系。
