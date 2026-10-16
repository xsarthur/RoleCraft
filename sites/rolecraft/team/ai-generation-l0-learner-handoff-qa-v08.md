# Independent QA — AI-generation L0 learner handoff v0.8

结论：`met_with_limitations`（范围内交付结构与收据核验通过；不授 L0/D0 等级）。

## 核验范围

独立读取 `/private/tmp/ai-generation-l0-learner-handoff-v08/` 及工作区交接文件，核对 D0-01/02 机制收据、D0-03 A/B 输出与来源哈希/停止收据、D0-04 regression/holdout 分离、D0-05 断言映射，以及 manifest 声明的 bytes/SHA256 和状态字段。

## 结果

- D0-01/02：收据存在，分别声明 `generation only / stop ambiguity` 与 `persist before validate / recovery_required`，且含外部动作为空或 source checked 断言。收据文件 bytes/SHA 与 manifest 一致。
- D0-03：A、B、holdout 文件存在并与 manifest 一致；A 记录 input/source hash 与 `output_hash=unavailable-local`；B 记录 `output_hash=unavailable: no raw output file`、`stop_receipt=tenant B denied`。B 的拒绝停止收据存在，但没有可供复核的原始 B 输出，因此不能证明生成结果内容。
- D0-04：`d0-04-regression.json` 与 `d0-04-holdout.json` 分列，分别覆盖 recovery/idempotency 与 outage-duration/retry-budget-stop；未发现 regression 与 holdout 文件混用。
- D0-05：映射覆盖 `schema_version`、`source_refs`、`tenant`、`source_version`、`status` 五字段，指向对应 D0 文件；映射文件哈希/大小一致。该映射是字段级引用收据，不等同于实际运行通过。
- Manifest：逐一对 v08 manifest 中存在的 29 个 artifacts 重新计算 bytes/SHA256，全部一致；manifest 自身声明版本 v08、`self_signed=false`、`external_action=null`、`qa_status=pending`、`human_receipt=pending`、`l0_status/d0_status=not_assessed`、L1/L2 `not_granted`。证据卡中仍有 v06/v07 临时路径，属于可追溯性限制，未改写。
- 失败/未验证边界：manifest 明确保留 SOURCE_VERSION_MISMATCH、SOURCE_HASH_MISMATCH、UNBOUND_CLAIM、SOURCE_SCOPE_DENIED、checkpoint unavailable 等 first failures，并列出 real model/API、production RPO/RTO、human receipt、B-tenant denial learner execution 未验证；这些限制与实际 B output unavailable 相符。

## 独立结论与后续

在“交接包完整性、字段收据存在、regression/holdout 分离”范围内达到要求，故为 `met_with_limitations`。由于 A/B 原始输出不可得（尤其 B tenant denial learner execution 未提供原始输出），且未验证真实模型/API、人类回执、生产 RPO/RTO，不能标记 `met`，也不授任何能力等级。后续需补齐可审阅的 A/B 原始输出或可验证的受控拒绝执行日志，并在新版本中重新计算和绑定 manifest 后再复验。
