# AI 生成工程师 L0→L1 Gate 独立 QA v0.14

- report_id：`AI-GEN-L0-TO-L1-GATE-QA-v14`
- 日期：2026-10-16（Asia/Shanghai）
- 岗位：测试工程师
- diagnostic_id：`D0-AI-20261015-001`
- 范围：当前 `learner-submission-v02` 最终包的 Chenny 真人确认、接收/交接状态、修正版学习者声明、34 项原始收据及 dynamic holdout addendum 的只读 Gate 复核
- 判定：`remain_L0_guided`
- L1 review：`insufficient_evidence`
- `level_granted=false`，等级状态 `pending`

## 本轮输入与边界

本轮读取并独立复算：

- `ai-generation-real-learner-d0-execution-learner-submission-v02/chenny-receiver-confirmation-v01.txt`
- `receiver-acceptance-v03-dynamic-v02.json`
- `handoff-to-qa-submission.json`
- `learner-receipt.json`
- `package-meta.json`
- `learner-statement-v02.txt`（旧 `learner-statement.txt` 保留）
- `raw-receipts-retry-02/SHA256SUMS`、`BYTES` 及 34 项列出文件
- Chenny dynamic holdout `/private/tmp/chenny-receiver-holdout-v02.fekHQb/evidence/`
- `chenny-receiver-holdout-v02-qa-addendum.md/.json`
- v13 Gate QA 作为历史对照

本轮只读；没有修改学习者声明、收据、接收记录、交接文件、包元数据、v13 历史或任何学习者原始文件。v13 的保守 pending 结论保留为历史，不覆盖为本轮结论；README 和旧 v01 QA 中的待接收文字也只作历史，不作为当前状态来源。

## 复核结果

### Chenny 确认与状态同步

`chenny-receiver-confirmation-v01.txt` 明确写出独立接收方为 Chenny（不是学习者 Larry）、独立复核新版 replay 和 dynamic holdout、`Holdout 状态：pass_dynamic_binding`、确认时间 `2026-10-16T13:31:30+08:00`、`Chenny 签名：Chenny` 和 `确认状态：confirmed_by_chenny`。文件 SHA-256 为 `8bab7b3848b53d87072f789ebf920cfee23c141fb643d92f74fdf4dd3a02ed40`，与接收记录、交接、学习者收据、包清单中的绑定一致。

四个当前状态摘要的接收字段均已同步：

- `receiver-acceptance-v03-dynamic-v02.json`：`status=accepted_with_evidence`，`receiver.accepted=true`，身份 `chenny`，签名 `Chenny`，`human_receipt_pending=false`，`level_decision=pending`。
- `handoff-to-qa-submission.json`：`status=accepted_with_evidence`，接收方已接受并签名，`human_receipt_pending=false`，`level_decision=pending`。
- `learner-receipt.json`：`receiver_candidate.acceptance_status=accepted_with_evidence`，接收方身份/签名一致，`human_receipt_pending=false`，`level_granted=null`；顶层 `status=receiver_accepted_evidence_pending_level_review` 表示仍待等级复核，不是等级授予。
- `package-meta.json`：`receiver_acceptance_status=accepted_with_evidence`，`human_receipt_pending=false`，`level_decision=pending`，`statement_correction_status=signed_by_learner`。

因此 human receipt 在本轮为 **`pass_with_limitations`**：Chenny 的受控确认和接收链已可审计，关闭了本包的真人接收待办；该确认仅证明证据包接收，不证明学习者能力、D0/L1/L2 或生产资格。

发现一项包内路径限定：`handoff-to-qa-submission.json` 的 `learner_statement` 仍写 `learner-statement.txt`，而当前修正版收据 provenance 写的是 `learner-statement-v02.txt`。旧文件仍保留且正文标题仍为“待本人签署”；本轮不改学习者文件，因此把它记录为包元数据/交接路径待修复项，不据此撤销已核实的修正版声明哈希或 Chenny 接收结论。

`package-meta.json` 的 `signature_required=false`、`execution_required=false` 及其“执行/签名前不是学习者原始证据”的 evidence boundary 是准备阶段元数据，未随最终确认事实重写；README 也保留旧的 pending 描述。它们不覆盖本轮已核对的接收字段，但仍是包 provenance 的陈旧文字，不能当作当前 Gate 状态。

### 修正版 learner statement 与 34 项收据

`learner-statement-v02.txt` SHA-256 为 `7c6bf32f985c3e6c5fcb90398987fd66e33de9db74060cc07bc542a3e11961c4`，与 `learner-receipt.json` 的 provenance 和 statement correction 绑定一致；末尾为 `签名：Larry`、`声明状态：signed_by_learner`，标题不再含待签署措辞，旧声明仍保留。

`raw-receipts-retry-02/SHA256SUMS` 实际列出 34 项，SHA-256 为 `dd3be1b30b614d41d4421c1d32be0ad4280dff21405552c2ffc8506ad52e5535`；`BYTES` SHA-256 为 `e2781d7f882b9dc95ace2fc7e8e2d83c9f598fbb3db5896f38a4552e248df50f`。34 项文件逐一复算哈希和字节数均通过，入口、输入快照和 receipt 字段一致。目录中的 34 项是清单对象，另有 `SHA256SUMS` 与 `BYTES` 两个清单文件，不把它们计入 34 项。

两轮四场景共 8 个退出码均为 0；按场景 stdout 字节一致，stderr 为空。A-normal 的来源 claim 有绑定；B-tenant-denied 在读取正文前以 `SOURCE_SCOPE_DENIED` 停止；source-missing 和 source-conflict 分别以 `SOURCE_MISSING`、`SOURCE_VERSION_MISMATCH` 在草稿前停止；外部动作均为 `null`。据此，**D0-03：`met_with_limitations`**，限定为学习者声明、离线 fixture 收据和可复算的本地执行证据；不外推为职业能力或等级证据。

### Dynamic holdout addendum

`chenny-receiver-holdout-v02-qa-addendum.md/.json` 的 addendum 状态为 `met_within_scope`，证据状态为 `pass_dynamic_binding`；`checks.json` 的 11 项检查全部为 `true`，SHA-256 为 `b6ebf7fd10a7a387a0b07092a24369d990b6a646f24c9b073cbad090d694192c`，与接收记录一致。holdout `SHA256SUMS` SHA-256 为 `55e4a61b9bd0c4cbe63e4124eb225da05409a0912ee385321599ad1026a320d0`，清单文件和列出文件哈希均通过；`BYTES` 的列出文件字节数均匹配（末尾 `10662 total` 是 wc 汇总行，不是文件条目）。

两次 holdout 运行均退出 0、stderr 为空，stdout/stderr/退出码字节一致，动态 claim/source refs 与变体文档、版本、位置、文本和哈希绑定，未知项保留，外部动作 `null`。接收方 replay 的 `SHA256SUMS`/`BYTES` 哈希分别为 `4446b5fe879a1579eb9db61ee578eddb3ecf8b55b2a2d8a55d8b1588fb60e0c7` 和 `6b3308bb4a2f616897c11a8659c10f706f282fc8191885a6cd24a6f121a93307`，列出文件复算通过。

因此 dynamic holdout 为 **`pass_with_limitations`**：它证明 Chenny 独立会话中固定离线 runner 的动态来源绑定和收据一致性；不证明实时模型质量、真实外部来源、学习结果、真人专家判断或生产就绪。

## Gate 判定与未验证范围

本轮 D0-03 在指定范围内为 **`met_with_limitations`**；human receipt 为 **`pass_with_limitations`**；dynamic holdout 为 **`pass_with_limitations`**。D0 总门槛仍要求 D0-01 至 D0-05 的完整学习者提交、逐项独立复验和接收链，因此整体保持 `remain_L0_guided`，L1 为 `insufficient_evidence`，L2 未评估，`level_granted=false` 且状态 `pending`，不授予 D0、L1、L2 或生产权限。

仍未验证或未达成：

- D0-01、D0-02、D0-04、D0-05 的学习者本人提交、逐项独立复验和 handoff receipt；
- D0 全量聚合门槛、未知任务迁移、真实失败恢复、跨约束重建和完整 handoff 能力；
- L1 的两个独立 sandbox、返修/回归、独立 holdout 与整体接收证据；
- L2 的真实形态任务、迁移、恢复和完整交接；
- 真实模型/API 质量、外部来源契约、真实进程崩溃恢复、并发/缓存一致性、生产 RPO/RTO、安全和运营经济性；
- 真人专家复核、真实学习者结果、职业胜任或行业先进性。

后续动作：修正 handoff 对修正版声明的路径引用并重新复核包一致性；补齐 D0-01/02/04/05 后，按新版本重新执行整体 Gate。v13 及更早历史报告保持原样。
