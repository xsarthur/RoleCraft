# D0-03 学习者收据归档规范化 QA v0.2

- `derived_by`: QA
- 复验时间：2026-10-16（Asia/Shanghai）
- 规范化范围结论：`met_with_limitations`
- 整体学习者门槛：`not_met`；保持 `remain_L0_guided`
- v0.1 记录：`ai-generation-real-learner-d0-execution-learner-receipts-normalization-qa-v01.md` 保留，不覆盖

## 本轮修复

1. 将修复前的错误派生包装原样保留为 `ai-generation-real-learner-d0-execution-learner-receipts/learner-statement-qa-wrapper-v01.txt`。其内容未改，大小为 968 bytes，SHA-256 为 `a1adc4b61ec9e876b7c7a9c64ce4ee74f3ccd2bf8762b581a557d5b30a115e4b`。该文件是历史失败包装，不能当作字节副本或新的学习者声明。
2. 将 `learner-statement.txt` 改为 `../ai-generation-real-learner-d0-execution-learner-signoff-v01.txt` 的字节精确副本。两者均为 766 bytes，SHA-256 均为 `b8a4cafebf54c52d25ee3fb8f6df84c92979282d96e533df01c2625248f665c4`；逐字节比较通过。
3. 新增 `learner-statement.meta.json`，标明 `derived_by=QA`、来源别名、`source_sha256`、`copy_mode=byte_exact`，并记录历史包装文件及其失败状态。

## 独立复验

- `learner-statement.txt` 与原 signoff：字节数、SHA-256、逐字节比较均通过。
- 历史包装：`learner-statement-qa-wrapper-v01.txt` 保留原错误内容，未被修正覆盖。
- 原始 `SHA256SUMS` 当前 SHA-256 为 `7768f8af1a89c2830ba3dca945320f3b46722008f8400e8120eba7293f4deae7`；文件未被本轮修改。`manifest.sha256` 的派生头以下 payload 与原 `SHA256SUMS` 字节一致：`True`。
- `run-1.aggregate.json`、`run-2.aggregate.json` 仍为 QA 派生索引；原 stdout/stderr、退出码与原清单未被本轮修改。

## 证据边界

- `learner_id` 仍为 `unknown`，姓名/内部标识仍未提供。
- `learner-receipt.json` 的 `human_receipt_pending=true`。
- `handoff-to-qa.json` 仍为 `pending` 模板；接收方身份、`accepted`、签收时间和签名均为空，未有接收方签收。
- `level_granted` 仍为 `null`；本轮不得授予 D0、L1 或 L2。
- 字节精确归一化只修复归档表示，不能证明学习者本人执行、能力展示、真人接收或学习等级。

机器可读记录：`ai-generation-real-learner-d0-execution-learner-receipts-normalization-qa-v02.json`。
