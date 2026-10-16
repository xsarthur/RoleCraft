# AI-PRACTICE-DURABLE-002 独立 QA v01

- 复核对象：`AI-PRACTICE-DURABLE-002` / `v0.1`
- 证据目录：`sites/rolecraft/team/ai-generation-l0-practice-durable-002/`
- 复核身份：测试工程师（独立复核，未修改学习者产物）
- 结论：`met_with_limitations`
- 局部范围：`met_within_scope`
- L1/L2：`not_granted`（本报告不授予）

## 核查结果

1. practice pack v02 SHA256 与交付声明一致：`b1cb993bfb6310f5f872c23980ad60a8d6dbc91c64462bbf253302328ffa0f1a`；fixture `F-AI-DURABLE-v1` 声明与 manifest 计算值一致：`b186af6b08d2a5bf426a5529e19f4465452b620b98c802b8097b404e15d5efd2`。
2. 顶层 manifest SHA256 与交付声明一致：`4e9fc683c3b6c5712b0fd6738930687fcf6bed071268f9a1c55d21243f27702b`；manifest 的三次运行、fixture、practice pack 和 `run_byte_replay_equal=true` 均一致。EvidenceCard SHA256 与声明一致：`a715850d9dfd6a933c15b8fd93f99bae1a385d4ea46e678f85503d118aa50089`。
3. `run-1`、`run-2`、`run-3` 的 contract/tool/draft/final checkpoint hash、事件 hash、最终 payload hash 和文件内容一致；每次只有一个 `draft-run-durable-002`。checkpoint manifest 中四类 checkpoint hash 均可由对应文件重算。
4. 正常序列完整：`contract_checkpointed → tool_checkpointed → callback_accepted → duplicate_reused → single_draft_written → final_checkpointed`。`callback_id=cb-001` 的重复回调使用同一 payload hash，dedupe table 只保留一个结果；所有 contract 的 `external_action` 为 `null`。
5. 崩溃恢复收据完整且顺序正确：`restarted → manual_stop → replay_required → replayed → checked → handed_off`。不完整结果首失败明确为 `INCOMPLETE_RESULT_AFTER_CRASH`，状态为 `handoff_denied`；恢复从完整 tool checkpoint 重放，最终 draft/final 完整。
6. 四类首失败原件均存在且停止语义明确：`DUPLICATE_CALLBACK_PAYLOAD_MISMATCH`（不覆盖）、`CHECKPOINT_CORRUPT`（manual stop）、`CHECKPOINT_VERSION_MISMATCH`（v2 对 v3 拒绝）、`INCOMPLETE_RESULT_AFTER_CRASH`（handoff denied）。未发现原失败被覆盖。
7. holdout 仅改变事件到达顺序；checkpoint、dedupe table、draft、final 和最终 payload 保持一致。holdout 记录 callback 去重与 partial-result hold 均为 true，`external_action` 仍为 `null`。
8. handoff 明确为 QA pending、`self_signed=false`；未见学习者自签收。`external_action` 在 contract 和最终产物中均为空/null。

## 限制与未关闭项

- 证据是本地确定性原子 JSON；未证明真实进程崩溃、数据库/队列耐久性、RPO/RTO、并发一致性、LangGraph checkpoint 或生产恢复。
- 未进行真实真人 QA 签收；handoff 仍 pending。未进行真实外部工具或收费模型调用。
- 本次复核为静态文件/hash/序列复验，不能把本地 replay 解释为 L1/L2 能力或生产可靠性证明。

## 复验状态

当前局部范围通过，整体结论保留为 `met_with_limitations`；L1/L2 不授予。后续若要升级，须由责任岗位补充真实运行/恢复与独立真人验收证据，再由测试岗位按同一合同复验。
