# AI-PRACTICE-GATE-003 QA v0.4

- 复核岗位：测试工程师（独立 QA）
- 对象：`ai-generation-l0-practice-gate-003-v04/`、`ai-generation-engineer-practice-pack-v02.json`
- 范围：v04 manifest/EvidenceCard/repair 路径与 bytes hash、双次迁移 hash/trace、validator 输入、schema unknown-field 负例停线、legacy_status 删除、五类首失败、holdout 单约束、handoff/external_action。
- 环境：本地 Python 3.14，只读 JSON/文本、路径、哈希核对；未联网、未调用模型/数据库/外部动作。
- 结论：`met_with_limitations`；不授 L0/L1/L2 或岗位等级。

## 复核结果

| 检查项 | 结果 | 证据 |
|---|---|---|
| manifest 逐项存在、bytes/hash 一致 | pass | v04 manifest 所列 15 项全部存在；逐项重算 bytes 与 SHA-256 一致 |
| v04 路径统一 | pass | manifest、EvidenceCard、repair_record 的当前产物路径均指向 v04；repair_record 的 `from` 历史字段保留为 v03，属于历史来源元数据；未发现当前 artifact 路径误指 v02/v03 |
| fixture/practice pack | pass | fixture `9002b8…fe364` 声明与重算一致；practice pack SHA-256 `b1cb993b…ffa0f1a` 与 manifest 一致 |
| run-1/run-2 migration hashes | pass | 两次 migrated bytes hash `9eb142…d412dd`，normalized hash `118c508…ba99c4`；manifest/top-level/evidence-card 对齐 |
| 双次 frozen input 与 validator 自身输入 | pass（产物级） | 两次 seq1/2 输入均为 `frozen-v2-input.json` 且 hash `03e33c…0ec39a`；run-2 validator 输入为 `run-2/migrated_checkpoint.json`，未串用 run-1 输出 |
| run traces | pass（产物级） | 合并 trace 与 run-2 独立 trace 均含 7 状态：old_version_detected → migration_planned → v3_migrated → schema_checked → awaiting_human_approval → human_intervention → handed_off；输入/输出 hash 有记录 |
| schema/legacy_status | pass（静态） | schema-v3 allowed/required 不含 `legacy_status`；迁移 diff 标记删除；两次 migrated checkpoint 与 validator 输出均无该字段 |
| unknown-field 负例 | pass（静态负例） | `first_failure/schema_unknown_field/receipt.json` 注入 `legacy_status`，receipt=`SCHEMA_VALIDATION_ERROR`、result=`rejected`、`stopped_before_human_gate=true`；另有五类首失败文件。未运行独立 validator 进程 |
| 五类首失败 | pass | `SCHEMA_VALIDATION_ERROR`、`HUMAN_APPROVAL_REQUIRED_OR_INVALID_REVIEW_RECEIPT`、`MIGRATION_SCOPE_VIOLATION`、`MIGRATION_MISSING_STATE`、`INVALID_HOLDOUT_CONTRACT` 均存在 |
| holdout 单约束 | pass（静态） | 仅 `human_approval_required_for_handoff` 改变；schema_version、tenant、source_refs、answer、external_action 均列 unchanged，结果 awaiting_human_approval |
| handoff/external_action | pass（练习状态机） | approval 为 `approve_for_review_only`、`production_approval=false`、`scope=review_only`；`self_signed=false`、`external_action=null`；不构成生产审批 |

## 限制与后续

1. 结论基于已生成 v04 产物和只读哈希/结构核对，未执行真实迁移或 validator 进程；unknown-field 拒绝仍是 receipt 级静态证据。
2. 未验证真实数据库迁移、并发/回滚、进程恢复、真人身份审批、生产外部动作、真实模型行为、学习效果或职业能力。
3. `repair_record.json` 的 `from` 字段保留 v03 历史来源，未视为当前 artifact 路径缺陷；v04 目录未提供独立 README 文件，README 路径统一无法作为单独文件证据核验。

本报告仅说明 GATE-003 v04 在上述本地产物范围内达到 `met_with_limitations`，不授等级，不把本地 reviewer 收据写成专家审核或生产授权。
