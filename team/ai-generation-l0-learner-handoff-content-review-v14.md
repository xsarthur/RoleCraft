# AI L0 learner handoff 内容审校 v14

## 范围与结论

本次独立内容审校只读核对 `/private/tmp/ai-generation-l0-learner-handoff-v14` 的一次性 `run_bundle.py` 收据、v14 handoff、manifest 与五张 EvidenceCard，重点检查 manifest/hash scope、A 正常运行收据、D0-04 事件/工具/恢复语义、D0-05 新 fixture 与未知迁移边界、EvidenceCard 完整绑定及状态限制。未执行代码或真实模型/API，不修改练习、教材、应用、账户数据或历史报告，不授 D0/L0/L1/L2 等级。

结论：**`reviewed_with_limitations`**；范围决定：**`met_within_scope`**。

## 核对结果

- **manifest 与 A 收据：通过（静态范围）**。manifest 对列出的 18 个工件均给出可复算 bytes/SHA-256；`manifest_bytes` 与 `manifest_sha256` 为 null，并明确 self-reference null by construction，避免自引用循环。A-stdout 实物为 16 bytes，hash 与 A-receipt 及 manifest 一致；receipt 的 source_refs 指向 `doc-A-shipping-v3`，但这仍是本地夹具收据。
- **D0-04 事件、工具与恢复语义：通过但有限制**。event trace 保留 `tool_called → tool_returned → checkpoint_write_failed → recovery_required → replayed → final`；tool input/output、failure、recovery、checkpoint-before/after 与 idempotency key 可相互对读，恢复结果为 `draft_ready` 且 `side_effect:null`。这足以表达该确定性夹具中的失败后重放路径，但 event-trace 只有事件名称，没有每事件时间、输入/输出 hash 或外部副作用观测；`side_effect:null` 是夹具字段，不能证明真实供应商或生产系统没有副作用、重复写入或并发冲突。
- **D0-05 新 fixture 与未知迁移：部分通过**。v14 使用新的 `doc-A-shipping-v3`/`source_version=v3`/`shipping policy` fixture，矩阵明确分列 baseline、first_failure、regression、holdout，并保留 schema、tenant、source_version 与 source_refs，较 v13 的旧 fixture 有版本与文档变更。但 holdout 与 first_failure 是同一 document/source/text/tenant/schema 且 JSON 内容完全相同，仅状态同为 `recovery_required`；因此它不是独立未知任务，也不能支持跨文档、跨租户或未知迁移/泛化结论。
- **EvidenceCard 绑定：通过（绑定完整性有限）**。五张卡均为 `EVID-D0-*-V14`，逐一列出 A、D0-04 全部事件相关工件和 D0-05 四状态/矩阵工件，诊断 ID 一致，解决了 v13 仅列 regression 的缺口。卡片只做路径绑定，不附逐工件语义说明或观测时间；不能以卡片本身替代对运行环境、外部系统和学习者实际作答的证据。
- **角色与状态边界：通过**。handoff 保持 `qa_status= pending`、`human_receipt=pending`、`self_signed=false`、`external_action=null`，并明确 `l0_status/d0_status=not_assessed`、`l1/l2=not_granted`；没有把本地夹具运行写成真人签收、真实租户授权、生产恢复或职业认证。

## 限制与后续

本轮未重放命令或故障注入，未验证真实模型/API、供应商来源、权限、外部副作用、持久性、并发一致性、RPO/RTO、未知任务转移、真人签收、学习效果或职业能力。若要支持 D0-04 的运行时强结论，应保存逐事件原始输入/输出、可复算 hash、观测时间和外部副作用检查；若要支持 D0-05 未知迁移或泛化，应另设不同 document/source/tenant 或真正未知任务并保持测试者不可见。继续保持 D0/L0 `not_assessed`、L1/L2 `not_granted`。
