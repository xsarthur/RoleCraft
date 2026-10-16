# AI-PRACTICE-GATE-003 内容审校 v0.2

## 范围与依据

本次独立内容审校只读核对 v02 门禁报告与 JSON、`ai-generation-l0-practice-gate-003-v02/` 全部工件、v01 内容审校及 `ai-generation-engineer-practice-pack-v02.json` 中 GATE-003 合同。检查 schema v3 的字段迁移与删除语义、run-2 是否从冻结 v2 输入独立迁移、事件/状态轨迹、五类首失败、单约束 holdout、manifest 字节/hash 与限制措辞。不修改学习者产物、教材、应用、账户数据或历史报告，不授 L1/L2 或岗位等级。

## 结论

**`fail`（v02 修复了 v01 的主要 schema 与 run-2 provenance 缺陷，但可审计的 manifest hash 仍与实际产物冲突，门禁证据不能闭合）。**

已确认的修复：`schema-v3.json` 明确将 `legacy_status` 列为 forbidden，迁移差异明确删除该 v2 字段；run-1 与 run-2 的迁移结果均不含 `legacy_status`，均从同一冻结 v2 输入形成，run-2 validator 指向自身 `run-2/migrated_checkpoint.json`；五类首失败、事件状态序列、单约束 holdout 和 `external_action=null` 均有文件或字段支持。

关键未闭合项是 manifest 的迁移结果 hash：`manifest.json` 对 run-1/run-2 `migrated_checkpoint.json` 记录 `9eb142...d412dd`，与实际文件 SHA-256 一致；但同一 manifest 的 `run_1_migrated_hash` 与 `run_2_migrated_hash` 顶层字段写成 `3cbff8...67009a`，并非实际 SHA-256。该冲突使“逐项 manifest/hash 证据”不能作为完整已验证结论，需工程师重生成或修正 manifest 后由 QA 重验。

此外，事件轨迹只列 run-1；它可以支持正常状态序列的练习记录，但不能单独证明 run-2 也执行了每一状态。run-2 独立性由冻结输入声明、run-2 输出及自有 validator 路径部分支持，仍应在修正 manifest 时补齐 run-2 的输入/输出 bytes/hash 与对应轨迹绑定。

## 支持证据

- schema v3 的 `allowed`/`required` 不含 `legacy_status`，`forbidden` 明确包含它；两份迁移 checkpoint 均含 v3 字段且不含旧字段。
- `migration-diff.patch` 与 `repair_record.json` 记录显式删除 `legacy_status`，并保留 tenant、source_refs/hash、`external_action=null`。
- run-2 validator 的 `input` 为 `run-2/migrated_checkpoint.json`；两份迁移文件实际 SHA-256 相同，支持从同一冻结输入得到相同结果，但不得忽略 manifest 顶层 hash 冲突。
- 五类首失败文件均存在；`holdout.json` 仅改变 `human_approval_required_for_handoff`，结果为 `awaiting_human_approval`。
- approval 收据写明 `approve_for_review_only`、`production_approval=false`、`scope=review_only`；这只能表示本地练习状态机的模拟 gate，不能表述为真人专家审批、生产审批、身份认证、岗位认证或发布授权。
- v02 报告、evidence card 和 practice pack 均保留 `handoff_qa=pending`、`self_signed=false`、`insufficient_evidence`/`not_granted` 限制。

## 缺陷与复验要求

1. **P0 证据一致性：** 修正 manifest 顶层 `run_1_migrated_hash`/`run_2_migrated_hash`，使其与实际文件 SHA-256 及 per-item 条目一致；由 QA 重新验证所有 manifest bytes/hash、两次迁移及 validator 输入路径。
2. **P1 状态轨迹完整性：** 若声称 run-2 独立完整重放，补充 run-2 的输入 provenance、逐项 bytes/hash 与状态轨迹绑定；否则将报告措辞限定为“run-2 输出独立迁移/校验证据已提供，完整状态轨迹未提供”。
3. QA 应重跑正常序列、五类首失败、两次从冻结 v2 输入的迁移和单约束 holdout；内容审校在上述复验完成前保持 `fail`，不得授等级。

## 限制边界

本地 `simulated_human_gate`/`local-reviewer` 收据只证明练习保留了人工 gate 的状态与收据字段，不是真人专家审核、生产审批、身份认证、岗位认证或发布授权。夹具与本地 JSON 不证明真实数据库迁移、并发/回滚、真实进程恢复、真实模型行为、接收方签收、学习效果或职业能力。`L1/L2` 保持 `not_granted`。
