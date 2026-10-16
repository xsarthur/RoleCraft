# AI生成工程师 D0-03 学习者执行收据清单审计 v0.1

- report_id: `AI-REAL-LEARNER-D0-03-RUN-KIT-AUDIT-v01`
- date: 2026-10-16 (Asia/Shanghai)
- role: 测试工程师
- contract_id: `AI-REAL-LEARNER-D0-EXEC-20261016-001`
- diagnostic_id: `D0-AI-20261015-001`
- decision: `learner_owned_receipt_required`
- learner_execution: `false`（本审计不代执行）
- level_granted: `D0=false, L1=false, L2=false`

## 审计结论

现有 D0-03 合同、SOURCE-001 夹具和 QA v0.9 足以作为学习者执行入口。现有四场景回放、两次输出比较和哈希清单只能证明测试/工程回放，不能证明学习者本人执行。学习者须在隔离环境实际填写入口并提交原始文件；QA 再独立复跑，接收方最后签收或有据拒收。

## 学习者执行前必须确认

学习者在收据元数据中填写：`learner_id`（可用项目内部匿名 ID）、`learner_statement`（本人执行声明）、`execution_started_at`、`execution_finished_at`、`workspace_path`、`contract_id`、`diagnostic_id`、`fixture_id`、`fixture_sha256`、实际 `command`、`environment`、网络/模型/云/付费/真实数据均关闭的确认，以及 `external_action=null`。不得填入真实用户数据、密钥或 B 租户正文。

## 必须提交的原始文件

1. `learner-receipt.json`：每个 case 的 EvidenceCard，字段按合同完整填写；`run_id` 必须由学习者本次生成，不能复制 QA run_id。
2. `run-1/` 与 `run-2/`：四个 case 各自的原始 stdout、stderr、退出码、输入快照和运行时间。
3. `manifest.sha256` 与 `bytes.txt`：对所有原始文件计算 bytes/SHA-256；保留命令原文和命令输出。
4. `learner-statement.txt`：学习者本人声明实际执行、未读取/缓存/暴露 B 文本、未执行外部动作，并注明任何中断或重跑。
5. `handoff-to-qa.json`：提交路径、文件清单、顶层 SHA、已知限制和 QA 接收状态；初始 `qa_receipt_pending=true`。

A-normal 收据须包含两条 A/v2 claim 的 document_id、source_version、location、hash、必要摘录及 unknown；B 必须记录 `SOURCE_SCOPE_DENIED`，并证明 B 文本未进入 stdout、stderr、缓存或上下文；缺失和冲突均须记录首失败、停止点及空的 draft/handoff/external_action。

## 禁止的替代证据

不能用 QA 命令、代理回放、已有 v02/v09 工件、复制的 run_id/哈希、截图摘要、报告文字或代理声明填充 `learner_execution=true`。不能由 QA 代签、代答或授等级。

## QA 接手后的独立复跑

QA 在独立临时目录冻结并核对合同、fixture、学习者输入和 manifest；计算输入哈希后按四 case 重跑 run-1/run-2，不使用学习者 stdout 作为测试输出。QA 核对四类首失败、A claim 四元组、B 文本未访问/未缓存/未入上下文、draft/handoff/external_action 空值、退出码、stderr、bytes/SHA 和逐字节一致性；再执行合同规定的未公开等价 holdout。QA 将学习者原始工件与独立复跑逐项对照，保留首失败与差异，不覆盖原件。

## 接收方签收条件

接收方从交接包重建最小命令，确认文件可读、哈希一致、四 case 结果和限制清晰，并填写 `recipient_id`、`received_at`、`rebuild_command`、`receipt_status`（`accepted`/`rejected`）、理由和签名。签收只证明收到并能复核交接包，不等于职业能力或等级授予；拒收须记录缺件或失败原因。

## 关闭条件

只有学习者原始收据、QA 独立复跑、未公开 holdout、接收方签收/有据拒收全部归档后，D0-03 才可进入 L0→L1 gate 重新评估。即使 D0-03 通过，D1–D5、第二非同构 sandbox、未知迁移和 D6 分母仍需独立证据；在这些证据完成前不得授予 L1。
