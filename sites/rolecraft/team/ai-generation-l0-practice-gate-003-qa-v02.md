# AI-PRACTICE-GATE-003 QA v0.2

- 复核岗位：测试工程师（独立 QA）
- 对象：`team/ai-generation-l0-practice-gate-003-v02/`
- 结论：**fail**（manifest 中两项迁移产物声明哈希与实际内容不一致）；不授 L0/L1/L2 等级。

## 复核结果

| 检查项 | 结果 | 证据 |
|---|---|---|
| v3 schema required/allowed/forbidden | pass | `schema-v3.json` 要求 `schema_version/status`，禁止 `legacy_status`；迁移产物无该字段且无未知字段。 |
| 迁移 diff 与边界 | pass | `migration-diff.patch` 只新增 v3/status、删除 v2 legacy_status，并保留 tenant、source_refs/hash、external_action=null。 |
| frozen-v2 输入与 validator 自身输入 | pass（静态） | fixture 声明规范化 hash 为 `9002b8…`；run-1/run-2 validator 分别指向自身 `migrated_checkpoint.json`，均 valid。 |
| run-1/run-2 重放 | pass（有限） | 两份迁移文件字节相同；规范化 SHA-256 均为 `118c508e…`。提交物不能证明独立运行过程本身。 |
| event/state trace | pass（静态） | 7 步顺序为 old_version_detected → migration_planned → v3_migrated → schema_checked → awaiting_human_approval → human_intervention → handed_off。 |
| manifest 逐项完整性 | **fail** | 文件路径、bytes、原始 SHA-256 均与列项匹配，但 `run_1_migrated_hash`/`run_2_migrated_hash` 写为旧值 `3cbff8…`，与当前规范化文件 hash `118c508e…` 不一致。 |
| 正常序列与五类首失败 | pass（静态收据） | 五个首失败均保留 `preserved_old_checkpoint=true` 或停止字段；schema 错误在 gate 前停止。 |
| holdout 单约束 | pass | 仅改变 `human_approval_required_for_handoff`，其余列出的 schema/tenant/source_refs/answer/external_action unchanged。 |
| handoff/external_action | pass | approval 为 review_only、production_approval=false；hold 为 awaiting_human_approval；`self_signed=false`、`external_action=null`。 |

## 必须复验

1. 用合同规定的规范化 JSON SHA-256 更新 manifest 两个迁移产物 hash，保留本 v02 失败记录并重新核 manifest。
2. 提供 run-2 独立执行的命令/环境或运行时事件证据；当前只能核提交文件与路径。

本地夹具不证明真实数据库迁移、并发回滚、真人审批、身份认证、生产审批、真实模型或外部动作。`L0/L1/L2` 均未授予。
