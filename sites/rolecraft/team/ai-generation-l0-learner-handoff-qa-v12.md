# AI 生成工程师 L0 学习者交接 v12 独立 QA

日期：2026-10-15（Asia/Shanghai）  
范围：`ai-generation-l0-learner-handoff-v12` 及其 `manifest.json`/handoff JSON；仅核字节、SHA、路径绑定和字段证据，不授 L0/L1 等级。

## 结论

**met_with_limitations**（限定为本地交接包结构与静态证据）。

manifest 列出的 27 个工件均存在，实际 bytes/SHA 与 manifest 一致；manifest 自引用 bytes/SHA 为 null，规则一致；相对路径未发现越界或缺失。A stdout 为原始 16 bytes（含换行），SHA 与 A-receipt 一致，命令、status、draft、source_refs 均可核对。D0-05 四状态矩阵包含 schema/source_refs/tenant/source_version/status 并引用包内相对路径。

## 核查结果

- **A stdout/receipt：通过（静态）**：`A-stdout.txt` 实际为 `DEMO-42 draft A\\n`，16 bytes，SHA `05ba5f…31573`；`A-receipt.json` 的 path/bytes/SHA、`draft_ready`、draft、`doc-A-refund-v1` 一致。`A-run-receipt.output_hash` 是无换行 draft 字符串 SHA `ba62d…43027`，与 stdout SHA 不同但语义可解释；交接没有声明二者同一 hash 口径，存在口径限制。
- **D0-04 tool/event/checkpoint/recovery：部分通过**：tool input/output、checkpoint before/after、failure/recovery、idempotency、side_effect 字段和回放链均存在，实际工件 bytes/SHA 已绑定到 manifest；回放状态链为 `recovery_required → replayed → draft_ready`，副作用为 null。`event-trace.tool_input_hash`/`tool_output_hash` 为字符串 `input-hash-local`/`output-hash-local`，不是对应文件的实际 SHA；trace 也未逐项携带各事件 bytes/SHA，因此不能证明事件记录与 tool 文件的密码学绑定。
- **D0-05：部分通过**：baseline/first_failure/regression/holdout 均有字段矩阵，路径相对且实际存在；但 matrix 的 artifact 只指向 checkpoint/failure/recovery-event，未包含各状态工件的 bytes/SHA，且 holdout 使用 `recovery-event.json`（状态 `draft_ready`）而非独立 holdout 工件，无法据此证明真实留出执行。
- **Evidence cards：不足但非结构失败**：D0-03 卡片绑定 A/B 输出；D0-01、D0-02 仅绑定同一 `rebuild-receipt.json`；D0-04、D0-05 仅绑定 `d0-04/regression.json`，未绑定 event-trace、failure/recovery、idempotency、D0-05 matrix 等新增证据。因此 cards 未完整覆盖其声明的 D0 证据集合。
- **manifest/状态：通过（静态）**：manifest 与 handoff JSON 的版本、diagnostic_id、artifact bytes/SHA、`human_receipt=pending`、`qa_status=pending`、`self_signed=false`、`external_action=null`、`l0/d0=not_assessed`、L1/L2 `not_granted` 一致；未将本次 QA 结果回写学习者 manifest。

## 限制与后续

未运行生成命令、真实模型/API、真实 checkpoint 崩溃/恢复、权限系统、并发或真人签收；本 QA 不能推出 D0 能力、职业能力、生产安全或 L1。后续应统一 stdout/hash 口径，使用实际 tool input/output SHA，补齐事件逐项绑定；D0-05 为每状态绑定独立 holdout 产物与 bytes/SHA；EvidenceCard 分别绑定完整 trace/matrix/失败/恢复/idempotency 工件，并由独立 QA 复验。
