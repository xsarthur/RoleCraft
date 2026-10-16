# D0-03 学习者提交包独立 QA（retry-02）

日期：2026-10-16（Asia/Shanghai）  
范围：`raw-receipts-retry-02/` 及其入口收据的只读复核。

## 结论

在本地只读复验中，retry-02 收据完整且内部一致（`met_within_submission_scope`）。`SHA256SUMS` 全部 32 项校验通过，`BYTES` 与文件实际大小一致；两轮四场景共 8 个退出码均为 0；两轮 stdout/stderr 逐场景完全一致。

## 核对证据

- 入口 `learner-run-v02-retry-02.sh` 与 `learner-entrypoint.sha256` 一致：`83ac0091ab39bebaea166d028a42595182dd07601e65cffefc99b8ca09ed0dfa`。
- `SHA256SUMS` 文件哈希：`dd3be1b30b614d41d4421c1d32be0ad4280dff21405552c2ffc8506ad52e5535`。
- `BYTES` 文件哈希：`e2781d7f882b9dc95ace2fc7e8e2d83c9f598fbb3db5896f38a4552e248df50f`。
- A-normal 两条声明均绑定 `doc-A-refund-v2`、`refund-policy-v2` 及内容哈希 `4a1fa4040c1c2840d176fc35da81c5df23984e68e44ed7e299e9cba2a6a1361d`。
- B-tenant-denied 未进入正文或模型上下文，`first_failure=SOURCE_SCOPE_DENIED`，`stop_before_draft=true`。
- source-missing 首失败为 `SOURCE_MISSING`；source-conflict 首失败为 `SOURCE_VERSION_MISMATCH`，均在草稿前停止。
- 旧 `raw-receipts/` 与 `raw-receipts-retry-01/` 未检测到工作区改动。

## 身份与待办边界

`learner-statement.txt` 已由学习者 Larry 签署，状态为 `signed_by_learner`。本 QA 不把签署声明当作接收确认或独立 holdout 结果：receiver 确认仍 `pending`，holdout 复核仍 `pending`。学习者文件未修改。

限制：本记录只证明提交包、哈希、隔离和重放输出的一致性，不证明真人能力、外部服务行为或生产效果。
