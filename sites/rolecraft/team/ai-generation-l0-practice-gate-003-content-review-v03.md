# AI-PRACTICE-GATE-003 内容审校 v0.3

## 范围与依据

本次独立内容审校只读核对 v03 门禁报告与 JSON、`ai-generation-l0-practice-gate-003-v03/` 工件、v02 内容审校及 `ai-generation-engineer-practice-pack-v02.json` 的 GATE-003 合同。核对迁移 hash 统一、run-2 独立状态轨迹、schema/`legacy_status` 删除、五类首失败、单约束 holdout、人工 gate 和限制措辞。不修改学习者产物、教材、应用、账户数据或历史报告，不授 L1/L2 或岗位等级。

## 结论

**`reviewed_with_limitations`。** v03 已解决 v02 的两个明确内容缺陷：run-1/run-2 迁移文件实际 SHA-256、manifest 顶层值和逐项条目统一为 `9eb142631b1117394cfa0cf083fb992630b46a89dd73795ff523852b36d412dd`；run-2 提供从冻结 v2 输入到 validator/handoff 的 7 步独立状态与 hash 轨迹。schema v3 明确禁止并实际删除 `legacy_status`，五类首失败、单约束 holdout、`external_action=null` 和 L1/L2 未授予均有证据支持。

仍有证据边界：manifest 的若干历史工件路径指向 v02 目录（例如 approval、schema、validator、migration plan），虽然路径对应文件可读且核心 v03 工件有独立 hash，但本审校未把跨目录引用当作 v03 全包字节重建证明。run-2 轨迹由提交工件声明并可与其输入/输出 hash 对照，未由本审校执行真实迁移程序或第三方运行器重放。`local-reviewer` 收据只代表本地练习状态机中的模拟 gate，不是真人专家审批、生产审批、身份认证、岗位认证或发布授权。

## 核对结果

- **迁移 hash：通过（范围内）**：run-1/run-2 `migrated_checkpoint.json` 字节均为 433，实算 SHA-256 均为 `9eb142...d412dd`；manifest 顶层、逐项条目、evidence card 与 v03 JSON 一致；规范化迁移 hash `118c508e...ba99c4` 也成对一致。
- **run-2 独立轨迹：通过（范围内）**：独立输入声明为冻结原始 v2 checkpoint（非 run-1 输出），轨迹覆盖 `old_version_detected → migration_planned → v3_migrated → schema_checked → awaiting_human_approval → human_intervention → handed_off`，并记录输入/输出 hash；validator 输入指向 run-2 自身迁移文件。
- **schema 与字段迁移：通过**：schema v3 required/allowed 均为 v3 字段，`legacy_status` 在 forbidden；迁移计划只新增 schema/status、保留 tenant/source_refs/hash/external_action；run-1/run-2 输出不含 `legacy_status`，validator 报告无错误。
- **失败与 holdout：通过（范围内）**：五类首失败文件保留；holdout 仅改变 `human_approval_required_for_handoff`，结果为 `awaiting_human_approval`，其他字段列为 unchanged；审批 receipt 的 `production_approval=false` 且 scope 为 review_only。
- **限制措辞：通过**：v03 报告/evidence card 保留 `insufficient_evidence`、`handoff_qa=pending`、`self_signed=false` 与 L1/L2 `not_granted`，未把模拟收据写成真人或生产授权。

## 保留问题与复验要求

1. QA 应核对 manifest 中跨版本目录路径是否为有意的历史引用；如 v03 要求可独立接收，应将所有引用工件复制或重建到 v03 目录并重新计算 bytes/hash，再复验整包。
2. QA/工程师应以独立运行器重放两次迁移、五类首失败及单约束 holdout；本审校仅核静态证据，未验证实际脚本执行、数据库迁移、并发/回滚、进程恢复或外部契约。
3. 人工 gate 仍保持本地模拟边界；需真人专家、真实接收方签收和生产审批证据时另行获取，不能由此报告关闭。

## 限制边界

本地确定性夹具、JSON、hash 和 `local-reviewer` 收据不证明真实模型行为、真实数据库迁移、并发一致性、回滚、生产 RPO/RTO、真人专家审核、身份认证、岗位能力、学习效果或生产发布。结论仅覆盖本 v03 静态工件审校范围；L1/L2 保持 `not_granted`。
