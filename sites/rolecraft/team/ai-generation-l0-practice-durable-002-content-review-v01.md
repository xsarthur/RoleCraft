# AI-PRACTICE-DURABLE-002 内容审校 v0.1

## 范围与依据

本审校只读核对 `AI-PRACTICE-DURABLE-002/v0.1` 合同、学习者报告/JSON、practice pack v02 对应练习、隔离产物目录、四个首失败、三次正常运行、留出运行、EvidenceCard、manifest 与恢复收据。未修改学习者产物，也未授予 L1/L2 或岗位等级。

## 结论

**`reviewed_with_limitations`（本地范围；不能作为生产耐久性证据）**。

学习者产物对幂等 callback、不同 payload 拒绝、单 draft、首失败保留、恢复状态序列和留出事件顺序的叙述与 practice pack 合同基本一致。报告和 EvidenceCard 明确声明本地原子 JSON 不证明生产数据库、真实进程崩溃、RPO/RTO、并发一致性或 LangGraph checkpoint；没有把这些限制写成已通过能力。

## 已核对的支持证据

- run-1/run-2/run-3 的事件序列均为 `contract_checkpointed → tool_checkpointed → callback_accepted → duplicate_reused → single_draft_written → final_checkpointed`，最终 payload hash 和四个 checkpoint hash 一致，且 dedupe 表仅有一个 `cb-001` 结果。
- 四个首失败原件均保留：`DUPLICATE_CALLBACK_PAYLOAD_MISMATCH`（no overwrite）、`CHECKPOINT_CORRUPT`、`CHECKPOINT_VERSION_MISMATCH`、`INCOMPLETE_RESULT_AFTER_CRASH`（handoff denied）。失败动作符合停止/hold 要求。
- recovery receipt 给出 `restarted → manual_stop → replay_required → replayed → checked → handed_off`；holdout 只改变 callback 到达顺序，仍生成单一 draft，未见按到达顺序覆盖 payload。
- EvidenceCard 的 objective、fixture hash、practice-pack hash、限制、`self_signed=false`、`review_status=pending_QA` 与交接状态一致，未将本地结果写成 L1/L2 通过。

## 缺陷与限制

1. **checkpoint manifest 证据不完整（需返修/复验）**：`run-1/checkpoint_manifest.json`（以及 v01 对应运行目录）为空文件，但 `run-1/manifest.json` 和 `recovery.json` 声称 checkpoint manifest 有效。故无法独立重算/核对“每个 checkpoint 的 hash/bytes manifest”这一合同要求；`checkpoint_manifest_valid:true` 目前只能视为自述，不能当作已验证证据。
2. **恢复证据是确定性文件状态机，不是真实崩溃恢复**：没有进程 kill、真实数据库/队列、并发写入、fsync/rename 故障或 RPO/RTO 测量。学习者和 EvidenceCard 已正确保留这一限制；不得使用“durable”“crash recovery”作无限定生产能力表述。
3. **`final_output.status=final` 可能造成范围误读**：练习合同目标是 review-only 草稿和 `final_checkpointed`，不是生产最终发布。报告已写“仅本地替身”，但下游展示应改用 `draft_ready_for_review` 或明确“本地练习最终快照”，避免把 `final` 解读为生产定稿/发送。
4. **恢复收据与空 manifest 存在内部矛盾**：在补齐实际 checkpoint manifest 前，不能声称“manifest valid”“所有 checkpoint 可验证”已通过。补齐后须重跑原例、受影响回归和 holdout，并更新独立 QA 证据；不得删除首失败。

## EvidenceCard / 未知项核对

EvidenceCard 已列出输入、动作、四类 checks、结果、限制和未授等级；未见伪造真人签收。仍未知或未验证：真实进程崩溃、生产持久存储语义、并发一致性、RPO/RTO、LangGraph 实现、真实供应商/API、真实接收方签收和真实学习效果。`handoff.status=pending` 与 `self_signed=false` 应保持，不能改成已验收。

## 返修与复验要求

责任人：AI 生成工程师补齐每次运行的非空 checkpoint manifest（规范化 bytes/hash、版本、文件路径、完整性结果），并修正 `final` 的范围措辞；测试工程师独立复验原例、四首失败、run-1/run-2 字节重放、第三次工具 checkpoint 重放和 holdout。内容审校员复核耐久性、RPO/RTO、生产审批及 LangGraph 限制措辞。缺陷关闭前结论保持 `reviewed_with_limitations`，不授等级。

## 保护边界

本报告没有修改学习者目录、冻结教材、应用、账户数据库或历史报告；不构成真人专家审核、生产验收或职业认证。
