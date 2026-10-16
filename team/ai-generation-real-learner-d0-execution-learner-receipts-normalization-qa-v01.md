# D0-03 学习者收据归档规范化 QA v0.1

- `derived_by`: QA
- 原始收据：保留不动；原 `SHA256SUMS` 仍是原始收据清单
- 规范化结论：`met_with_limitations`
- 学习者归属：仍 `unknown`
- 接收方签收：仍 `pending`
- 等级：不授予 D0、L1 或 L2

本轮仅新增派生归档文件：每个 run 的 `aggregate.json`、根目录 `learner-receipt.json`、`manifest.sha256`、`learner-statement.txt` 和 `handoff-to-qa.json`。它们均标注 `derived_by=QA`。`learner-statement.txt` 是原 `ai-generation-real-learner-d0-execution-learner-signoff-v01.txt` 的带来源说明副本，不构成新的学习者声明；姓名/内部标识仍未提供。`handoff-to-qa.json` 是待接收模板，未填写接收方身份、签收时间或 accepted。

汇总索引只解析已有原始 stdout/stderr、`exit-codes.tsv` 和原 `SHA256SUMS`，没有修改、重写或替代原始文件。规范化改善了归档可读性，不能补足本人执行归属、独立接收签收或学习者能力证据。下一步仍需接收方独立重跑和真实签收，之后才能重新评估门槛。
