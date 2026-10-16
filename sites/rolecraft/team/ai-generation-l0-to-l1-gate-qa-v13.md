# AI 生成工程师 L0→L1 Gate 独立 QA v0.13

- report_id：`AI-GEN-L0-TO-L1-GATE-QA-v13`
- 日期：2026-10-16（Asia/Shanghai）
- 岗位：测试工程师
- diagnostic_id：`D0-AI-20261015-001`
- 范围：D0-03 `learner-submission-v02` 修正版声明、34 项原始收据、receiver replay 与动态 holdout 的只读复核
- 判定：`remain_L0_guided`
- L1 review：`insufficient_evidence`
- `level_granted=false`，状态 `pending`

## 本轮输入与边界

本轮读取并交叉核对：

- `ai-generation-real-learner-d0-execution-learner-submission-v02/learner-statement-v02.txt`
- `ai-generation-real-learner-d0-execution-learner-submission-v02/learner-receipt.json`
- `ai-generation-real-learner-d0-execution-learner-submission-v02/raw-receipts-retry-02/`
- `ai-generation-real-learner-d0-execution-learner-submission-v02/receiver-acceptance-v03-dynamic-v02.json`
- `chenny-receiver-holdout-v02-qa-addendum.md/.json`
- v12 Gate QA 作为历史对照

未修改学习者文件、原始收据、receiver 文件或 v12 历史报告。本报告只新增 v13 Gate QA 证据。

## 复核结果

### 学习者声明与 34 项收据

`learner-statement-v02.txt` 的 SHA-256 为
`7c6bf32f985c3e6c5fcb90398987fd66e33de9db74060cc07bc542a3e11961c4`，与 `learner-receipt.json` 的声明绑定一致。声明末尾为 `签名：Larry`、`声明状态：signed_by_learner`，标题不再含“待本人签署”。旧声明仍保留，未被覆盖。

`raw-receipts-retry-02/SHA256SUMS` 实际列出 34 项，清单 SHA-256 为
`dd3be1b30b614d41d4421c1d32be0ad4280dff21405552c2ffc8506ad52e5535`，与 receipt 的 `manifest_sha256`、`raw_sha256sums_sha256` 和 `raw_manifest_entries=34` 对齐。34 项文件的哈希均可复算；`BYTES` 清单及其哈希
`e2781d7f882b9dc95ace2fc7e8e2d83c9f598fbb3db5896f38a4552e248df50f` 与文件大小一致。入口脚本、输入快照和收据字段也一致。

两轮四场景共 8 个退出码均为 0，stdout 按场景逐字节一致，stderr 为空。A-normal 的两条 claim 绑定授权来源；B-tenant-denied 在读取正文前以 `SOURCE_SCOPE_DENIED` 停止，正文未进入草稿或模型上下文；source-missing 与 source-conflict 分别以 `SOURCE_MISSING`、`SOURCE_VERSION_MISMATCH` 在草稿前停止；所有外部动作为 `null`。因此，**D0-03 学习者提交在本地 fixture/收据范围内通过**，不外推为能力或等级证据。

### Human receipt

学习者本人声明可核为通过，签署者是 Larry。新版 receiver 记录中有 `receiver.accepted=true`、`signature=Chenny` 和四场景 replay `pass` 字段，但该文件顶层仍是 `status=pending_chenny_confirmation`，同时保留 `human_receipt_pending=true`，其 `decision_reason` 也写明等待 Chenny 确认。Chenny holdout addendum 的范围只覆盖 holdout 证据，并明确“不提供或主张 Chenny 签名”。

`learner-receipt.json` 自身的 `human_receipt_pending=false` 只反映提交方记录，且其 `level_granted` 仍为 `null`；它不能覆盖 receiver 记录的待确认状态，也不等价于 Gate 的等级授予。

由于同一记录的接受字段互相冲突，且 addendum 没有可独立审计的 Chenny 本人签署，QA 不以字段中的名字推断真人签收。故 **human receipt：`pending`**。这只影响真人接收状态，不否定已经核验的本地收据和动态 holdout。

### 动态 holdout 与 replay

Chenny addendum 的结论是 `met_within_scope`，证据状态 `pass_dynamic_binding`。`checks.json` 的 11 项检查全为 true；动态 holdout 的 SHA256SUMS、BYTES、variant metadata、claim refs 和 receipt refs 均可对齐。两轮运行退出码均为 0，stderr 为空，stdout、stderr、退出码字节一致，未知项保留，外部动作为 `null`。本地复核还确认 evidence 清单列出的文件哈希与大小一致。

新版 receiver replay 记录为四场景 `pass`，其自身 SHA256SUMS/BYTES 哈希分别为 `4446b5fe879a1579eb9db61ee578eddb3ecf8b55b2a2d8a55d8b1588fb60e0c7` 和 `6b3308bb4a2f616897c11a8659c10f706f282fc8191885a6cd24a6f121a93307`。因此 **dynamic holdout：`pass_with_limitations`（证据状态 `pass_dynamic_binding`）**。它证明离线 fixture 的动态来源绑定和收据一致性，不证明真人签署、真实模型质量、学习结果或生产就绪。

## Gate 判定与未验证范围

本轮 **D0-03 限定范围为 `met_with_limitations`**：学习者修正版声明、34 项收据和动态 holdout 已通过相应的本地/离线检查；human receipt 因 Chenny 独立签名不可审计仍为 `pending`。D0 总门槛要求 D0-01 至 D0-05 的完整学习者提交、独立复验和接收链，不能用单一 D0-03 收据闭合。因此整体保持 `remain_L0_guided`，L1 为 `insufficient_evidence`，L2 未评估，`level_granted=false` 且状态仍为 `pending`，不授予 D0、L1、L2 或生产权限。

仍未验证或未达到的门槛包括：

- D0-01、D0-02、D0-04、D0-05 的学习者本人提交、逐项独立复验和 handoff receipt；
- D0-03 可审计的 Chenny 本人签署/接收确认；
- 未知任务迁移、真实失败恢复、跨约束重建和完整 handoff 能力；
- L1 所需两个独立 sandbox、返修/回归、独立 holdout 与整体接收证据；
- L2 所需真实形态任务、迁移、恢复和完整交接；
- 真实模型/API 质量、外部来源契约、真实进程崩溃恢复、并发/缓存一致性、生产 RPO/RTO、安全与运营经济性；
- 真人专家复核、真实学习者结果、职业胜任或行业先进性。

后续 Gate 需要 Chenny 本人补交可审计的新版 receiver acceptance 签署记录并消除字段冲突，再补齐其余 D0 项并按新版本重新独立复验。v12 历史结论保持原样，不因本报告自动改写。
