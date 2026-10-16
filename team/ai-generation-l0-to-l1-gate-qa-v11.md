# AI生成工程师 L0→L1 Gate 独立 QA v0.11

- report_id: `AI-GEN-L0-TO-L1-GATE-QA-v11`
- date: 2026-10-16（Asia/Shanghai）
- diagnostic_id: `D0-AI-20261015-001`
- decision: `remain_L0_guided`
- l1_review: `insufficient_evidence`
- level_granted: L0/L1/L2 均不授予

## 复核范围与运行结论

复核原始 learner-receipts、`learner-receipts-qa-v01`、新增 normalization QA，以及目录外 `ai-generation-real-learner-d0-execution-learner-signoff-v01.txt`。

原始收据的本地行为仍在限定范围通过：29 项 SHA/BYTES 一致，四场景 run-1/run-2 一致，stderr 全为 0，退出码全为 0；B 首失败为 `SOURCE_SCOPE_DENIED` 且正文未进入输出，source-missing/conflict 首失败正确，A 两条 claim 有来源绑定。

## Signoff 与归档规范化边界

目录外 signoff-v01 新增了学习者本人声明，并给出执行/签收时间，但“姓名或内部标识：未提供”。因此它缺少匿名 `learner_id` 或其他可独立绑定的学习者标识。signoff 的 provenance（文件如何提交、由谁接收、是否与收据目录原始哈希绑定）也未由本轮独立核对。

normalization QA 明确新增的 `learner-receipt.json`、`manifest.sha256`、`learner-statement.txt`、`handoff-to-qa.json` 均为 `derived_by=QA`。它们是派生索引、声明副本或待填模板，不是本人原始收据或独立接收签收；其中 `learner_id=unknown`、`human_receipt_pending=true`，receiver identity/accepted/accepted_at/signature 均为空。

## Gate 判定

原始收据可证明可复核的本地行为和机制收据；signoff 可证明有一份本人声明文本，但不足以建立匿名身份绑定、目录外 provenance 或独立接收签收。不得把 QA 派生归档文件当作本人原始证据，不得把声明文本当作接收方签收。

因此保持 **remain_L0_guided**，L1 为 **insufficient_evidence**，不授任何等级或生产权限。

## 后续条件

补交带匿名 `learner_id`、目录/输入/脚本哈希和提交 provenance 的本人原始 receipt；由独立接收方填写真实身份、复跑结果及 accepted/拒收时间签名；再核对目录外 signoff 与原始目录绑定，并执行独立 holdout 复验。完成前不得改为 L1 reviewable。

