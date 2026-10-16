# AI-PRACTICE-DURABLE-002 独立 QA v02

- 复核对象：`AI-PRACTICE-DURABLE-002` / v02（record `AI-L0-DURABLE-002-20261015-002`）
- 复核身份：测试工程师，独立复验；未修改学习者产物、v01 报告或冻结文件
- 结论：`met_with_limitations`
- 局部范围：`met_within_scope`
- L1/L2：`not_granted` / `not_granted`

## 复验结果

1. **checkpoint manifest 修复通过**：顶层 `checkpoint_manifest.json` 非空，三次运行各含 contract/tool/draft/final 四项，path、bytes、SHA256 均可由对应文件重算；无差异。manifest SHA256 为 `69d8daa4dc46c20db9641de727ae9e91e9bdf8c9cc7e367b9f58be268e77afe8`，与 v02 声明一致。
2. **repair record 指向 v01 缺陷**：`repair_record.json` 明确 `from_version=v01`，记录空 manifest 与 final 语义问题，保留 v01 与四个首失败；`self_signed=false`、`qa_status=pending`。
3. **三次运行回放通过**：run-1/2/3 的 contract、tool、draft、final、event_log、dedupe_table、final_output 文件字节哈希一致；事件序列为 `contract_checkpointed → tool_checkpointed → callback_accepted → duplicate_reused → single_draft_written → final_checkpointed`。每次仅有一个 `draft-run-durable-002`，callback `cb-001` 去重结果一致。
4. **失败停线通过**：四个首失败原件仍保留，并指向正确停止语义：`DUPLICATE_CALLBACK_PAYLOAD_MISMATCH`（no overwrite）、`CHECKPOINT_CORRUPT`（manual_stop）、`CHECKPOINT_VERSION_MISMATCH`（v2 拒绝 v3）、`INCOMPLETE_RESULT_AFTER_CRASH`（handoff_denied）。未发现首失败被覆盖。
5. **恢复、holdout、交接与外部动作**：恢复收据顺序为 `restarted → manual_stop → replay_required → replayed → checked → handed_off`，并显示 `checkpoint_manifest_valid=true`、`draft_complete=true`；holdout 仅改变 callback 到达顺序，仍保留单 draft 与同 payload；contract 中 `external_action=null`。handoff 为 QA pending，`self_signed=false`。
6. **`final_output.status` 修复部分通过**：run-1/2/3 已明确为 `local_draft_ready`，且带 `deterministic_local_fixture_only`。但 holdout 的 `final_output.json` 与 `final.json` 仍为 `status=final`，没有同步局部草稿语义，留下范围误读风险。因此 v02 不能无条件标记为完全修复。

## 限制与未关闭项

- 证据仍是本地确定性原子 JSON；未证明真实进程崩溃、数据库/队列耐久性、RPO/RTO、并发一致性、LangGraph checkpoint 或生产恢复。
- 未进行真人 QA 签收；handoff 仍 pending；未进行真实外部工具或收费模型调用。
- holdout final 状态应改为 `local_draft_ready`（并保留 fixture-only scope）后再复验；在此之前不得把 `final` 解释为生产定稿。

## 结论

本轮 v02 在声明范围内通过 checkpoint manifest、三次回放、首失败保留、恢复/holdout/外部动作与交接字段核验，故局部为 `met_within_scope`；因 holdout 仍保留 `status=final` 及上述真实耐久性限制，总结为 `met_with_limitations`。本报告不授予 L1/L2、岗位认证或生产验收。
