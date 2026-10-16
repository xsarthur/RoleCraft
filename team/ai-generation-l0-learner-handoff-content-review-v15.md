# AI L0 learner handoff 内容审校 v15

## 范围与结论

本次独立内容审校只读核对 `/private/tmp/ai-generation-l0-learner-handoff-v15` 的 run bundle、manifest、v15 handoff、D0-04 工件、D0-05 矩阵及五张 EvidenceCard。重点是 D0-05 是否真正使用独立 holdout、五张卡的题目语义与工件边界、哈希/路径绑定，以及状态与角色边界。未执行 `run_bundle.py` 或其他代码，未调用真实模型/API，未修改练习、教材、应用、账户数据或历史报告；不授 D0/L0/L1/L2 等级。

结论：**`reviewed_with_limitations`**；在本次静态内容范围内：**`met_within_scope`**。

## 核对结果

- **manifest、A 收据和版本边界：通过（静态）**。manifest 列出的 bytes/SHA-256 与现场工件可复算一致；`manifest_bytes`/`manifest_sha256` 明确按 self-reference rule 保持 null。A 收据绑定 `A-stdout.txt`，source_refs 为 `doc-A-shipping-v3`，状态为 `draft_ready`。这证明工件绑定关系，不证明运行在真实模型、供应商或生产租户中。
- **D0-04 语义：通过但证据有限**。事件序列保留 `tool_called → tool_returned → checkpoint_write_failed → recovery_required → replayed → final`；输入、输出、失败、恢复及前后 checkpoint 的路径和哈希均列入 manifest，idempotency key 在输入/恢复中一致，夹具结果为 `draft_ready` 且 `side_effect:null`。事件文件只有事件名称，缺少逐事件时间、输入/输出 hash、真实外部副作用观察和并发/持久性证据；因此只能支持确定性夹具的恢复叙述。
- **D0-05 独立 holdout：实质改进，仍有矩阵边界问题**。`holdout-input.json` 使用全新的 `doc-A-returns-v9`、`source_version=v9`、`returns policy`，与 first_failure/recovery-event 使用的 `doc-A-shipping-v3`/v3/shipping policy 不同；`holdout-output.json` 保留同一 returns 身份并给出 `recovery_required`，所以本轮确实有独立输入/输出 fixture，修复了 v14 holdout 与 first_failure 同文档同内容的问题。可是 `d0-05/holdout.json` 仍逐字复制 `first_failure.json`（shipping/v3），matrix 的 holdout 行仍指向该旧工件；这会让矩阵标签与独立 holdout 工件语义不一致，不能把矩阵整体读成一次干净的未知迁移结论。`holdout-output` 还没有一份对应的 holdout status/assertion 记录来说明输入如何产生输出。
- **五张 EvidenceCard：绑定完整性通过，语义边界有限**。`EVID-D0-01-V15` 至 `EVID-D0-05-V15` 均逐一列出路径、bytes 和 SHA，且 manifest hash 一致。D0-04 卡绑定输入/输出、事件和恢复，D0-05 卡绑定矩阵、独立 holdout input/output；但 D0-05 卡额外绑定 `d0-04/checkpoint-after.json`，这是跨题目工件，未说明其作为 D0-05 证据的语义用途。五张卡的 `purpose` 均仅为 `learner evidence`，没有题目断言、观察值、通过条件、生成时间或执行者；卡片可以证明引用了哪些文件，不能单独证明学习者完成、未知任务泛化或真实系统行为。D0-01/02/03 也只有路径集合，不能从卡片名称推断相应能力已达成。
- **角色与状态边界：通过**。manifest/handoff 保持 `qa_status=pending`、`human_receipt=pending`、`self_signed=false`、`external_action=null`，并保持 `l0_status/d0_status=not_assessed`、`l1/l2=not_granted`。没有将本地夹具、EvidenceCard 或自生成 hash 写成真人签收、真实租户授权、生产恢复或职业认证。

## 限制与后续

本轮未重放命令或故障注入，未验证真实模型/API、供应商来源、权限、外部副作用、持久性、并发一致性、RPO/RTO、未知任务迁移、真人签收、学习效果或职业能力。建议由交付责任人修正 `d0-05/holdout.json` 与 matrix 的 holdout 行，使其指向 returns/v9 的独立 holdout，并补一份与 holdout input/output 配对的断言或执行收据；同时为 EvidenceCard 增加题目断言、观测值和工件用途，移除或解释 D0-05 对 D0-04 checkpoint 的跨题目引用。修正前，D0-05 只能作为“有独立 fixture 输入/输出但矩阵绑定不一致”的受限证据。继续保持 D0/L0 `not_assessed`、L1/L2 `not_granted`。
