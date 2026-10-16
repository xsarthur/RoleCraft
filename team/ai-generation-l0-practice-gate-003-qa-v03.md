# AI-PRACTICE-GATE-003 QA v0.3

- 复核岗位：测试工程师（独立 QA）
- 对象：`ai-generation-l0-practice-gate-003-v03/`、`ai-generation-engineer-practice-pack-v02.json`
- 范围：规范化迁移 hash、文件 bytes hash、manifest 顶层/逐项一致、双次冻结 v2 输入、validator 输入、run-2 完整状态轨迹与合并轨迹、schema-v3 字段删除/未知字段拒绝、五类首失败、holdout 单约束、handoff/external_action。
- 环境：本地 Python 3，只读 JSON/文本与哈希；未调用网络、模型、数据库或外部动作。
- 结论：`met_with_limitations`；不授 L0/L1/L2 或岗位等级。

## 复核结果

| 检查项 | 结果 | 证据 |
|---|---|---|
| practice pack 与 fixture | pass | practice pack bytes SHA-256 `b1cb993bfb6310f5f872c23980ad60a8d6dbc91c64462bbf253302328ffa0f1a`；声明/重算 fixture hash `9002b8bcef99feaa63d88c4c4d8f3eb16d22107b0ceb61e3820240bf709fe364` 一致 |
| 文件 bytes hash 与 manifest 逐项 | pass（路径元数据限 制） | v03 目录内 manifest 所列文件均存在，bytes 与 sha256 逐项重算一致；但若干 `path` 字符串仍写 `ai-generation-l0-practice-gate-003-v02/...`，应在后续修正为 v03 路径 |
| 规范化迁移 hash | pass | run-1/run-2 migrated normalized SHA-256 均 `118c508e04e579686f10c7db7bba041c79ddfdc930b44967f961567474ba99c4`；两者 bytes SHA-256 均 `9eb142631b1117394cfa0cf083fb992630b46a89dd73795ff523852b36d412dd`；manifest 顶层与 per-item 一致 |
| 双次冻结 v2 输入及 validator | pass（静态 provenance） | 两份 event trace 的 seq1/2 input 均 `frozen-v2-input.json`，run-2 validator input 为 `run-2/migrated_checkpoint.json`；run hashes 相等。未执行真实迁移程序，属于产物级证据 |
| 正常状态序列 | pass（产物级） | 合并 `event-state-trace.json` 含 run-1 与 run-2，各自完整 7 步：old_version_detected → migration_planned → v3_migrated → schema_checked → awaiting_human_approval → human_intervention → handed_off；run-2 独立 trace 同步一致 |
| schema-v3 删除 legacy/未知字段拒绝 | pass（静态） | schema-v3 `forbidden=[legacy_status]`，allowed/required 均不含该字段；迁移 diff 明确删除；两份 migrated checkpoint 无 `legacy_status`；`unknown_fields_rejected` 列出 `legacy_status`。未运行独立未知字段注入 validator |
| 五类首失败停线 | pass | `SCHEMA_VALIDATION_ERROR`、`HUMAN_APPROVAL_REQUIRED_OR_INVALID_REVIEW_RECEIPT`、`MIGRATION_SCOPE_VIOLATION`、`MIGRATION_MISSING_STATE`、`INVALID_HOLDOUT_CONTRACT` 五文件均存在并记录停止/保留旧 checkpoint |
| holdout 单约束 | pass（静态） | `holdout.json` 仅改变 `human_approval_required_for_handoff`；schema_version、tenant、source_refs、answer、external_action 列为 unchanged，结果 awaiting_human_approval |
| handoff / external_action | pass（练习状态机） | approval 为 `approve_for_review_only`、`production_approval=false`、`scope=review_only`；`self_signed=false` 且 `external_action=null`；不构成真人或生产审批 |

## 限制与后续

1. manifest 的文件内容 hash、bytes 和顶层迁移 hash 已闭合；应修正 artifact `path` 中遗留的 v02 目录字符串，避免接收方按路径复验时误指向历史版本。
2. 未执行真实迁移/validator 进程；未知字段拒绝由 schema/diff/失败收据支持，需工程运行注入 `legacy_status` 与任意未知 key 的负例后复验。
3. 未验证真实数据库迁移、并发/回滚、进程恢复、真人身份审批、生产外部动作、真实模型行为、学习效果或职业能力。

本报告仅说明 GATE-003 v03 在上述本地产物范围内达到 `met_with_limitations`，不授等级，不把本地 reviewer 收据写成专家审核或生产授权。
