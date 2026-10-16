# AI L0 learner handoff 内容审校 v16

## 范围与结论

本次独立内容审校静态读取 v16 handoff、README、run_bundle、manifest、D0-05 工件及 EvidenceCard，并与 v15 对照。未执行脚本或故障重放，未调用真实模型/API/云/付费服务，未修改教材、应用、练习、账户数据或历史报告；不授 D0/L0/L1/L2 等级。

结论为 **`reviewed_with_limitations`**；本次静态范围为 **`not_met`**。v16 有 returns/v9 独立输入、输出文件，但矩阵和卡片仍绑定旧语义或跨题目工件。

## 核对结果

- **独立 holdout：部分通过。** `holdout-input.json` 使用 `doc-A-returns-v9`、`source_version=v9`、`returns policy`，与 shipping/v3 的 baseline/first_failure 不同；`holdout-output.json` 保留同一 returns/v9 身份并标为 `recovery_required`。这只支持“存在独立 fixture 输入/输出”。
- **矩阵绑定：未通过。** `matrix.json` 的 holdout 行仍指向 `d0-05/holdout.json`，而该文件是 shipping/v3，与 returns/v9 输入/输出不一致，不能支持干净的未知迁移结论。
- **断言链：证据不足。** holdout-output 没有配对的 status/assertion/执行收据说明输入如何产生输出；应补充或明确其为预置确定性 fixture。
- **EvidenceCard：未通过。** `evidence_cards/d0-05.json` 的 ID 仍是 `EVID-D0-05-V15`，并额外绑定 `d0-04/checkpoint-after.json`，跨题目用途未说明。卡片没有题目断言、观察值、通过条件或执行上下文，不能证明学习者完成、未知任务泛化或真实系统恢复；handoff 所称“仅绑定自身工件”与现场 JSON 不一致。
- **版本/状态：有限通过。** manifest 保持 `qa_status=pending`、`human_receipt=pending`、`self_signed=false`、`external_action=null`、D0/L0 `not_assessed`、L1/L2 `not_granted`。但脚本和 manifest `version` 仍为 v15，与 v16 目录不一致。
- **限制措辞：基本正确。** 应删除或改写与现场不符的 EvidenceCard 绑定声明，并明确 fixture 不是未知任务实测或能力证据。

## 后续

修正 matrix 的 returns/v9 holdout 绑定，补配对断言/执行收据，更新 EvidenceCard 版本 ID、断言字段和跨题目引用用途，并同步修正 v15/v16 版本标识。修正前保持 D0/L0 `not_assessed`、L1/L2 `not_granted`。
