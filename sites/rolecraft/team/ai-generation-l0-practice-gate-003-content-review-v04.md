# AI-PRACTICE-GATE-003 内容审校 v0.4

## 范围与依据

本次独立内容审校只读核对 v04 门禁报告/JSON、`ai-generation-l0-practice-gate-003-v04/` 全部工件、v03 内容审校及 practice pack v02。核对路径与元数据、迁移 schema、unknown-field 负例、五类首失败、事件轨迹、单约束 holdout、人工 gate 与停止条件。未修改学习者产物、教材、应用、账户数据或历史报告，不授 L1/L2 或岗位等级。

## 结论

**`reviewed_with_limitations`**。v04 已将 manifest 所列工件统一置于 v04 目录，逐项 bytes/SHA-256 与实际文件一致；run-1/run-2 的迁移文件和规范化 hash 一致，run-2 保留独立冻结 v2 输入及完整 7 状态轨迹。schema-v3 明确禁止 `legacy_status`，新增 unknown-field 注入收据并在到达人工 gate 前停止，`SCHEMA_VALIDATION_ERROR` 首失败机制可读且边界清楚。五类首失败、`external_action=null`、单约束 holdout、人工等待和 L1/L2 未授予均在工件中有对应证据。

## 核对结果

- **路径与元数据：通过（范围内）**：manifest 全部路径指向 v04 工件；实算 14 项列出工件的 bytes/SHA-256 均匹配；顶层 fixture hash、practice-pack hash、version 与 artifact 内容一致。
- **schema 与 unknown-field 负例：通过（范围内）**：schema-v3 required/allowed 字段完整，`legacy_status` 明确 forbidden；负例收据声明注入未知字段、validator 拒绝、网络与真实服务均为 false，并明确 `stopped_before_human_gate=true`。正常 validator 报告 unknown_fields 为空且 source hash 保持。
- **迁移与停止条件：通过（范围内）**：迁移计划仅新增 v3/status，保护 tenant、source_refs/hash、external_action；两次轨迹均按 old-version → planned → migrated → schema-checked → awaiting approval → human intervention → handed off，输入/输出 hash 可追溯。首失败清单含 schema、人工审批收据、scope、missing-state、holdout 五类；unknown-field 失败在人工 gate 前停止。
- **holdout 与人工 gate：通过（范围内）**：holdout 只改变 `human_approval_required_for_handoff`，其余字段列为 unchanged，结果为 `awaiting_human_approval`；approval 收据 scope 为 review_only 且 `production_approval=false`，evidence card 保留 `handoff_qa=pending`、`self_signed=false`、L1/L2 `not_granted`。
- **保留与限制：通过**：v01/v02/v03 保留声明存在，v04 不覆盖历史报告；真实迁移程序、并发/回滚、外部契约未由本审校重放。

## 保留问题与复验要求

1. 本审校依据静态工件和哈希核对，未执行独立迁移运行器；应由 QA/工程师重放正常迁移、unknown-field 首失败、五类首失败及单约束 holdout，并记录运行时证据。
2. `local-reviewer` 仅为练习状态机的模拟 reviewer；它不等于真人专家、真实接收方签收、生产审批、身份认证、岗位认证或发布授权。人工 gate 仍待真实授权证据。
3. 需要真实数据库、并发恢复、回滚、生产 RPO/RTO 或外部服务契约时，必须另行获取证据；本报告不能关闭这些缺口。

## 限制边界

结论仅覆盖 GATE-003 v04 静态内容审校范围。`reviewed_with_limitations` 不表示真实模型、生产迁移、真人审核、学习效果、职业胜任或行业等级已验证；L1/L2 保持 `not_granted`。
