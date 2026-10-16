# AI generation L0 learner handoff v07 — 独立 QA

- QA ID: `AI-L0-LEARNER-HANDOFF-QA-20261015-V07`
- Diagnostic: `D0-AI-20261015-001`
- 范围：仅核 handoff v07 本地证据包、D0-01..05 EvidenceCard、manifest/hash、B-denial、D6、U-AI-L0-001 及门禁状态；不执行模型/API，不授级别。
- 结论：`met_with_limitations`
- 改进轨迹范围：`met_within_scope`；整体能力/等级仍 `not_assessed`，L1/L2 `not_granted`。

## 核验结果

1. v07 目录内已存在 learner raw、五张 v07 card、D0-01..05 输入/输出引用、B-denial、D6、U baseline/first-failure/regression/holdout、来源与状态 receipt。五个 `evidence_id` 唯一且均绑定同一 diagnostic；card 文件路径、字节数和 SHA256 与 v07 `manifest.json.evidence_cards_v07` 一致。
2. 主 manifest 的 18 个声明 artifact 均逐项重算 bytes/SHA 一致；v07 目录中的实际文件也与其相应声明一致。fixture hash 与 `learner_raw.json` 的文件 SHA 不相等，但该差异与既有 v06 QA 的同一边界一致，不能当作 fixture 内容绑定通过。
3. 每张 card 都有 `learner_answer_hash`、输入 artifacts、output artifact、stop judgement、regression、source_refs 和 unverified；D0-01..05 的 learner_answer_hash 彼此不同，source_refs/stop/unverified 结构一致。证据仍偏结构声明：卡片未提供可独立重算的逐题答案正文绑定。
4. regression/holdout 约束未完全满足“各自不同”：D0-01..03 的 `holdout_artifact` 为 null；D0-04 把同一 `u-ai-l0-001/regression.json` 同时列为 regression 与 holdout；D0-05 的 regression 与 holdout 才分别指向 regression/holdout 文件。因此只能认定存在局部回归与 holdout 证据，不能认定五题均有独立 holdout。
5. B-denial learner execution 标注 `result=denied`、`external_action=null`，fixture hash 与 diagnostic 原始 fixture 一致；但 `output_sha256=unavailable-local-receipt`，且 v07 evidence scope 明确将 B-denial learner execution 列为 unverified。B-denial QA 只能支持本地夹具拒绝边界，不能支持可复核的学习者输出回执。
6. D6 `positive` 五字段均 1/1，`negative_claim` 为 0/1，且保留“negative denial required”阈值和 `real_model_control=false`；这符合保守停线语义，但负向样本不足以证明泛化或真实模型控制。
7. `first_failure` 明确 checkpoint temporarily unavailable、`recovery_required`、stop downstream generation；regression 明确同 idempotency key、schema/source/tenant 检查和 draft_ready；holdout 改变 outage duration 并回到 recovery_required。U 证据可复核为本地 fixture，不能外推生产 RPO/RTO。
8. manifest 与状态字段保持一致：`qa_status=pending`、`self_signed=false`、`human_receipt=pending`、`d0_status/l0_status=not_assessed`、`l1_decision/l2_decision=not_granted`、`external_action=null`。gate QA v07 的 `remain_L0_guided`、`insufficient_evidence`、`production_permission=false` 与本复核一致。

## 缺口与复验

- 为 D0-01..05 补逐题可重算的 answer/input/output 绑定，并为每题提供独立 regression 与 holdout；修正 D0-04 regression/holdout 同一文件的问题。
- 提供 B-denial learner 可复核输出回执及其 bytes/SHA；保持 denial 与 QA review 的角色分离。
- 补齐 D1-D5、D6 分母/负向样本、两个非同构 learner sandbox、未知任务迁移、真实运行时/恢复及 human receipt 后再重跑门禁。
- 保留未验证、pending、not_assessed、not_granted 状态；不得据本地 deterministic fixture 授予 L1/L2 或生产权限。
