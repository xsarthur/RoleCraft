# AI-PRACTICE-DURABLE-002 v01

本地隔离确定性原子 JSON 实操交付。practice pack SHA256 `b1cb993bfb6310f5f872c23980ad60a8d6dbc91c64462bbf253302328ffa0f1a`；fixture SHA256 `b186af6b08d2a5bf426a5529e19f4465452b620b98c802b8097b404e15d5efd2`。

## 结果
- 正常序列：`contract_checkpointed → tool_checkpointed → callback_accepted → duplicate_reused → single_draft_written → final_checkpointed`
- 崩溃恢复：`restarted → manual_stop → replay_required → replayed → checked → handed_off`
- 四类首失败均保留原件：DUPLICATE_CALLBACK_PAYLOAD_MISMATCH、CHECKPOINT_CORRUPT、CHECKPOINT_VERSION_MISMATCH、INCOMPLETE_RESULT_AFTER_CRASH。
- run-1/run-2/第三次工具 checkpoint 重放最终 payload hash 一致；holdout 仅改变 event_order，callback_id 去重与部分结果 hold 通过。

## 交接
交给 QA 独立核事件、checkpoint、hash、恢复和措辞边界，状态 pending；未自签收，L1/L2 均 not_granted。

## 限制
本地原子 JSON 替身不证明生产数据库、真实进程恢复、RPO/RTO、并发一致性、LangGraph 或真实模型。

产物见 `ai-generation-l0-practice-durable-002/`，EvidenceCard、manifest、事件/检查点、恢复收据、首失败原件、repair_diff（本例无代码修复，首失败均保留）与 learner_raw 均已归档。
