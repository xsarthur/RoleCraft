# AI-PRACTICE-GATE-003 内容审校 v0.1

## 范围与依据

本次独立内容审校只读核对 `ai-generation-l0-practice-gate-003-v01.md/.json`、`ai-generation-l0-practice-gate-003/` 工件（schema-v2/v3、迁移计划与 diff、两次迁移、validator 输出、五类首失败、approval/hold 收据、holdout、manifest、EvidenceCard、learner_raw）以及 `ai-generation-engineer-practice-pack-v02.json` 中 GATE-003 的练习合同。未修改学习者产物、教材、应用、账户数据或历史报告；不授 L1/L2 或岗位等级。

## 结论

**`fail`（本地内容合同存在关键不一致；不构成真人专家审批、生产审批、身份认证、真实数据库迁移或能力认证）**。

工件基本保留了预期状态序列、来源/hash、租户与 `external_action=null`，五类首失败文件均存在且记录停止/旧 checkpoint 保留，holdout 只改变 `human_approval_required_for_handoff`，两次迁移文件内容相同。但核心 schema 证据不能闭合：`schema-v3.json` 的 `allowed`/`required` 未包含 `legacy_status`，而两份 `migrated_checkpoint.json` 仍包含该字段；在按声明的 allowed-fields 进行通用校验时应当触发未知字段错误，和两份 validator 的 `result=valid` 相互矛盾。另一个可追溯性问题是 `run-2/validator-output.json` 的 `input` 仍指向 `run-1/migrated_checkpoint.json`，不能证明 run-2 从旧 v2 输入独立迁移，尽管 run-1/run-2 hash 相等。

因此目前不能把“schema 通过”“两次独立迁移重放”作为已证实结论；`handoff_qa=pending`、`self_signed=false` 和 `insufficient_evidence` 也应继续保留。

## 已核对的支持证据

- 输入 fixture hash `9002b8...fe364` 在报告、manifest 与 learner 目录声明一致；practice pack hash 与产物绑定一致。
- 迁移计划只新增 `schema_version=v3` 与 `status=awaiting_human_approval`，声明保留 tenant、source_refs/hash、answer、external_action；两份迁移结果的这些值一致，`external_action` 为 null。
- 正常序列包含 `awaiting_human_approval`、`human_intervention`、`handed_off`；approval 收据明确 `approve_for_review_only` 且 `production_approval=false`，holdout 收据为 hold。
- `SCHEMA_VALIDATION_ERROR`、`HUMAN_APPROVAL_REQUIRED_OR_INVALID_REVIEW_RECEIPT`、`MIGRATION_SCOPE_VIOLATION`、`MIGRATION_MISSING_STATE`、`INVALID_HOLDOUT_CONTRACT` 五类首失败均单独保留。

## 关键缺陷与限制

1. v3 schema 的 allowed/required 字段集合与迁移产物不一致；需由 AI 生成工程师明确移除 `legacy_status` 或把它纳入 v3 合同，并由 QA 重新实际校验。
2. run-2 validator 输入路径指向 run-1，独立迁移重放证据不足；应从冻结 v2 输入重新迁移并记录 run-2 自身输入、bytes/hash。
3. 本地 `simulated_human_gate`/local-reviewer 收据只证明练习状态机保留了人工 gate；不能写成真人专家审核、生产审批、身份认证、岗位认证或发布授权。
4. 本地 JSON 夹具不证明真实数据库迁移、并发/回滚、真实进程恢复、真实模型行为或接收方签收；QA handoff 仍 pending。

## 复验要求

责任人：AI 生成工程师修正 v3 schema/迁移字段合同并修正 run-2 输入 provenance；测试工程师独立重跑正常序列、五类首失败、两次原 v2 迁移及单约束 holdout，逐项核 schema unknown-field 行为、来源/hash、停止边界和字节/hash。内容审校在复验前保持 `fail`，不得授予等级。

## 保护边界

本报告不修改学习者目录、冻结教材、应用、账户数据库或历史审校；不构成生产验收、真人专家审核、职业认证、RPO/RTO 承诺或发布授权。
