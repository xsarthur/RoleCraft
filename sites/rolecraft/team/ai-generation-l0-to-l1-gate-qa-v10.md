# AI生成工程师 L0→L1 Gate 独立 QA v0.10

- report_id: `AI-GEN-L0-TO-L1-GATE-QA-v10`
- date: 2026-10-16（Asia/Shanghai）
- role: 测试工程师
- diagnostic_id: `D0-AI-20261015-001`
- decision: `remain_L0_guided`
- l1_review: `insufficient_evidence`
- level_granted: L0/L1/L2 均不授予
- production_permission: false

## 复核范围

独立核对 `ai-generation-real-learner-d0-execution-learner-receipts/` 及 `ai-generation-real-learner-d0-execution-learner-receipts-qa-v01.md/.json`。本报告不把 raw receipts 自动归属学习者本人，也不把收据 QA 回放当作学习者能力展示。

## 已核验的运行证据

- SHA256SUMS 对目录列出的 **29 项文件**逐项通过，BYTES 与文件大小一致；frozen-input 与 replay-verify 哈希指针存在。
- run-1/run-2 均覆盖 A-normal、B-tenant-denied、source-missing、source-conflict，四场景 stdout 逐字节一致。
- 8 个场景的 stderr 均为 0 bytes，exit code 均为 0。
- 输出大小与 SHA：A-normal 2211 bytes / `c4642281…33adf4c`；B 633 / `2c4c40dc…377d04`；source-missing 559 / `fb9abbdc…316fa7`；source-conflict 1063 / `dc391a72…60cf4c`。
- 首失败一致：B 为 `SOURCE_SCOPE_DENIED`，missing 为 `SOURCE_MISSING`，conflict 为 `SOURCE_VERSION_MISMATCH`；A 无首失败。
- A-normal 两条 claim 含来源 ID、版本、hash、定位和 claim_type，状态为 `draft_ready_for_review`，`external_action=null`。
- B 输出仅含拒绝元数据和未访问声明，B 文档正文未进入输出；draft 前停止。
- source-missing 标记 unknown 并停止；source-conflict 在生成前停止并记录版本/hash 冲突。

## 学习者归属缺口

以下文件均缺失：

- `learner-receipt.json`
- `learner-statement.txt`
- `handoff-to-qa.json`
- `manifest.sha256`

目录也没有匿名 `learner_id`、本人声明、本人执行确认、提交时间绑定或接收签收。共享 `command.txt`、目录命名和文件哈希只能证明收据可复核，不能证明由学习者本人执行。因此本轮不得将 raw receipts 标记为 learner-owned execution，也不得据此授予 D0/L1/L2。

## Gate 判定

运行完整性和四场景机制证据在收据范围内通过；学习者身份归属、本人声明、交接和真人签收仍缺失。故保持 **remain_L0_guided**，L1 保持 **insufficient_evidence**，不授任何等级或生产权限。

## 后续条件

由学习者补交绑定本目录哈希、时间、匿名 learner_id 和本人声明的 `learner-receipt.json`，以及 `learner-statement.txt`、`handoff-to-qa.json` 和独立 `manifest.sha256`；随后 QA 独立重跑四场景及 holdout，并由接收方重建命令、签收或有据拒收。补齐前不得将收据完整性扩大为学习者能力或 L1 reviewable。

