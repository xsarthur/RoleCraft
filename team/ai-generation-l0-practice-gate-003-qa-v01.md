# AI-PRACTICE-GATE-003 QA v0.1

- 复核岗位：测试工程师（独立 QA）
- 复核对象：`team/ai-generation-l0-practice-gate-003/`，练习包 `ai-generation-engineer-practice-pack-v02.json`（gate exercise v0.1）
- 复核范围：哈希、正常状态序列、五类首失败、schema 先于人工 gate、迁移边界、原 v2 输入双次重放、单约束 holdout、handoff 字段
- 环境：本地 Python 3（仅读取和规范化 JSON；未调用网络、模型、数据库或外部动作）
- 结论：`insufficient_evidence`
- L0 局部门槛：未授予等级；L1/L2：`not_granted`

## 复核结果

| 检查项 | 结果 | 证据 |
|---|---|---|
| practice pack v02 与 fixture | pass | 练习包文件 SHA-256 `b1cb993bfb6310f5f872c23980ad60a8d6dbc91c64462bbf253302328ffa0f1a`；嵌入 gate fixture 规范化 JSON SHA-256 `9002b8bcef99feaa63d88c4c4d8f3eb16d22107b0ceb61e3820240bf709fe364`，与声明一致 |
| fixture/manifest/schema/migration/validator/human receipt hash | pass（声明范围） | run-1/run-2 migrated checkpoint 规范化 SHA-256 均为 `3cbff8c6f484bf88a4dad98de26ebd583628ab82b884661c29eab1b65267009a`；validator 输出规范化 SHA-256 为 `e49c89f33aa8d044703bef373173d6a019ab0ce6278203cdd67ad4f7ecf5015c`；approval receipt `7c51e4bbe2325149557bb6394a15c9eeb8b8aa142622310fcd6f5fa5d25bbe10`；holdout receipt `0f66f9f6a0152f5d8ae2ed9f1c002798507f2e4d23799593536bdb882b242089`。这些值与文件内容可重算；manifest 未逐项列出上述全部 receipt/hash，故仅作局部证据。 |
| 正常状态序列 | pass（静态） | manifest/evidence-card 声明 `old_version_detected → migration_planned → v3_migrated → schema_checked → awaiting_human_approval → human_intervention → handed_off`；没有独立 event log/state trace 文件可复验实际运行顺序。 |
| 五类首失败停线 | pass（静态） | `first_failure/` 保留 `SCHEMA_VALIDATION_ERROR`、`HUMAN_APPROVAL_REQUIRED_OR_INVALID_REVIEW_RECEIPT`、`MIGRATION_SCOPE_VIOLATION`、`MIGRATION_MISSING_STATE`、`INVALID_HOLDOUT_CONTRACT`；各收据记录 stopped、preserved_old_checkpoint 或 stopped_before_gate。 |
| schema 先于人工 gate | pass（静态） | schema 错误收据注明 `stopped_before_gate`；run-1 validator `result=valid` 且 `external_action_null=true`，迁移后状态为 `awaiting_human_approval`。 |
| 合法/非法迁移边界 | pass（静态） | migration plan 仅新增 `schema_version=v3` 与状态、保留 tenant/source_refs/hash/external_action；scope violation 与 missing state 均保留旧 checkpoint 并停止。 |
| run-1/run-2 从原 v2 输入独立且 hash 一致 | **insufficient evidence** | 两个 migrated checkpoint hash 一致，`learner_raw.json` 声称从原 v2 独立生成；但 `run-2/validator-output.json` 的 `input` 错指向 `run-1/migrated_checkpoint.json`，不是 `run-2/migrated_checkpoint.json`，无法证明 run-2 validator 从原 v2 输入独立完成。 |
| holdout 单约束 | pass | `holdout.json` 仅列 `human_approval_required_for_handoff`，其余 schema/tenant/source_refs/answer/external_action unchanged；结果 `awaiting_human_approval`。 |
| handoff 字段 | pass | 主记录 `handoff_qa=pending`、`self_signed=false`、`external_action=null`；approval 仅 `scope=review_only` 且 `production_approval=false`。 |

## 必须修复/复验

1. 重新独立执行 run-2：输入必须是冻结的原 v2 checkpoint，而不是 run-1 迁移产物；`run-2/validator-output.json.input` 应指向 run-2 自己的 migrated checkpoint（或明确的独立路径）。保留当前失败/矛盾记录，不覆盖。
2. 提交可重建的状态序列或 event trace，证明正常路径实际按合同顺序执行；当前只有 manifest/evidence-card 的声明。
3. manifest 增加 schema-v2、schema-v3、migration-plan、两次 migrated checkpoint、两次 validator、approval/holdout receipt 的逐项 hash，便于接收方复验。

## 未验证范围

真实数据库迁移/回滚、真实进程恢复、并发一致性、真人审批与身份认证、真实模型行为、LangGraph/API、生产权限和外部动作均未验证；本地人工 receipt 不等于生产审批。本报告不授予 L0/L1/L2 等级，也不把练习记录推断为职业胜任或行业先进证据。
