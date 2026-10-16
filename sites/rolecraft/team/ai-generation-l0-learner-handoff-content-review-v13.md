# AI L0 learner handoff 内容审校 v13

## 范围与结论

本次独立内容审校只读核对 `/private/tmp/ai-generation-l0-learner-handoff-v13` 与 handoff v13：manifest 自引用规则、A 正常运行收据及 stdout hash 范围、D0-04 事件/工具输入输出/副作用语义、D0-05 独立留出矩阵、EvidenceCard 绑定、状态和限制边界。未执行代码或真实模型/API，不修改练习、教材、应用、账户数据或历史报告，不授 D0/L0/L1/L2 等级。

结论：**`reviewed_with_limitations`**；范围决定：**`met_within_scope`**。

## 核对结果

- **hash scope 与 manifest：通过（静态范围）**。handoff 声明 manifest bytes/SHA 为 null，避免自引用循环；列出的 artifact 路径均可在 `/private/tmp/ai-generation-l0-learner-handoff-v13` 解析，声明 bytes 与 SHA-256 与实物一致。A-receipt 明确 `stdout_hash_scope=raw stdout bytes`，A-stdout 为 16 bytes，hash 与 receipt 一致；A-run-receipt 的 output_hash 仍是另一字段，不能替代原始 stdout 证据。
- **D0-04 事件、工具与副作用语义：通过但有限制**。event-trace 保留 `tool_called → tool_returned → checkpoint_write_failed → recovery_required → replayed → final`，并链接 checkpoint/idempotency 收据；tool_input/tool_output 有实际 JSON 的 SHA、event_seq、timestamp 与 `side_effect:null`。这支持本地确定性夹具中的调用/恢复语义，不证明真实外部副作用不存在；timestamp 为 `local-deterministic`，且未观测外部系统。holdout 只改变 `outage_duration`，语义边界清楚。
- **D0-05 独立留出：部分通过**。matrix 分列 baseline、first_failure、regression、holdout，保留 schema/source/tenant/version/status 字段并绑定工件；holdout 的变化约束独立记录，未把它当统计未知样本或能力等级证据。但该 holdout 仍引用同一 doc/tenant/版本，不能证明真实未知任务迁移或泛化。
- **EvidenceCard 绑定：有限通过**。五张卡可读并覆盖 D0-01 至 D0-05，且 v13 handoff 状态保持 `pending`、`not_assessed`、`not_granted`、`self_signed=false`、`external_action=null`。D0-04 卡当前只直接列 `d0-04/regression.json`，未逐项绑定 event-trace、tool input/output、checkpoint、idempotency 与 holdout；因此不能以卡片替代完整事件证据或学习者答案正文。卡片 evidence_id 仍含 `V10`，是追踪清洁度限制。
- **角色与状态边界：通过**。文档没有把静态收据写成真人签收、真实租户授权、生产恢复或职业认证；D0/L0 保持未评估，L1/L2 未授予。

## 限制与后续

本轮未重放命令、故障注入或 recovery；未验证真实模型/API、供应商来源、权限、并发一致性、生产持久性/RPO/RTO、未知任务转移、真人签收、学习效果或职业能力。后续若需运行时结论，应保留实际 stdout 原始字节及环境，并为 D0-04 逐事件绑定可复算输入/输出 hash、时间和副作用观测；为 D0-05 明确真正独立的未知任务留出；EvidenceCard 应逐项绑定上述收据并修正 v10 标识。不得据本报告授予 D0/L0/L1/L2 等级或生产准入。
