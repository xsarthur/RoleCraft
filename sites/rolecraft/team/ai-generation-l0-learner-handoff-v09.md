# Consolidated Learner Handoff v0.9

保留历史 v01–v08 与首失败。本版新增并登记：

- `d0-03-A-output.json`：本地命令生成的 A normal draft，含 output/source hash。
- `d0-03-B-output.json`：B 租户拒绝收据，`no_output_by_contract=true`，含输入与拒绝 receipt hash，不伪造 draft。
- `d0-04-recovery-chain.json`：逐项记录 first failure、checkpoint before/after、idempotency key、recovery input/output、schema/source assertions，链为 `recovery_required → replayed → draft_ready`。
- `d0-05-assertion-mapping.json`：映射至 v09 实际 schema、source、tenant、source_version、status 工件。

manifest 已重建并登记当前工件 path、bytes、SHA-256。状态限制：human receipt pending、QA pending、`self_signed=false`、`external_action=null`、L0/D0 `not_assessed`、L1/L2 `not_granted`。本地确定性运行不代表真实模型、外部 API、生产恢复或职业能力认证。
