# AI-PRACTICE-GATE-003 内容审校 v0.5

## 范围与依据

本次独立内容审校只读核对 v05 README、v05 `manifest.json`、`evidence-card.json`、v05 门禁报告/JSON、v05 目录工件及 v04 内容审校记录。检查 README 对练习范围与限制的表述、manifest/EvidenceCard 的 README 哈希与引用、handoff 状态和等级边界。未修改学习者产物、教材、应用、账户数据或历史报告，不授 L1/L2 或岗位等级。

## 结论

**`reviewed_with_limitations`**。

README 明确将 v05 定义为本地确定性隔离练习，声明不联网、不调用真实模型/API/LangGraph/云/生产数据库/真实用户数据，并保留 `external_action=null`；同时明确 `handoff pending`、不代表真人专家审批、生产认证或 L1/L2 授予。README 的实际 SHA-256 与 `manifest.json.readme_hash`、`evidence-card.json.manifest_readme_hash` 一致，EvidenceCard 也保留 `handoff_qa=pending`、`self_signed=false`、L1/L2 `not_granted`，因此 README 补丁没有把本地练习扩写成生产能力或等级证据。

但 v05 manifest 的多项路径仍指向 `ai-generation-l0-practice-gate-003-v04/`，与当前 v05 目录及 README 所述复验文件不一致；其声明的 `schema_unknown_field` 收据路径在 v05 目录中不存在（v05 `first_failure/` 只有五个 JSON 文件）。这些引用/工件缺口使本轮不能给出无保留通过，需由责任人修正 manifest 或补齐并重新哈希后再复验。

## 核对结果

- **README 范围和限制：通过（范围内）**：local-only、无真实模型/API/云/生产数据库/真实用户数据及 `external_action=null` 均有明确文字；未将本地状态机练习称作生产迁移或真实生成。
- **README 哈希绑定：通过（范围内）**：实算 README 790 bytes、SHA-256 `f542af36e1da1b2c17bc2943ff20aefa0dce4de88c79f6a6e7a23944b837d0e4`，与 manifest 和 EvidenceCard 声明一致。
- **manifest 工件引用：有缺口**：列出的哈希值对当前同名 v05 工件内容可匹配，但路径字段仍大量写为 v04；README 路径按 manifest 原值无法在 v05 目录下解析。`schema_unknown_field/receipt.json` 被 manifest/EvidenceCard 引用但当前 v05 目录不存在。
- **EvidenceCard/handoff 边界：通过（范围内）**：`review_status=pending_QA`、`handoff_qa=pending`、`self_signed=false`、`external_action=null`、L1/L2 `not_granted` 与 README 的待交接和非生产限制一致；残余未知项保留真人 QA 与真实并发迁移/回滚。
- **历史与复验边界：通过（范围内）**：v05 报告声明 v01–v04 保留；本审校未执行迁移运行器、真实外部契约、并发/回滚或真人审批。

## 修复与复验要求

1. 将 `manifest.json.artifacts[*].path`、相关 README/EvidenceCard 引用统一到实际 v05 目录，或明确记录这些是受控历史 v04 引用；修复后重新计算并核对 manifest 哈希。
2. 补齐 `first_failure/schema_unknown_field/receipt.json` 或删除不再适用的 schema-unknown-field 声明，并同步 manifest、EvidenceCard 与 README 后复验。
3. QA/工程师独立重放正常迁移、五类首失败、unknown-field 首失败及单约束 holdout；本审校不能替代运行时证据。

## 限制边界

结论仅覆盖 GATE-003 v05 静态内容和引用审校。`reviewed_with_limitations` 不表示真实模型、生产迁移、真人审核、学习效果、职业胜任、行业等级或生产发布授权已验证；L1/L2 保持 `not_granted`。
