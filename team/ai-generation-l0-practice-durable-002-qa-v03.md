# AI-PRACTICE-DURABLE-002 独立 QA v03

- 复核对象：`AI-PRACTICE-DURABLE-002` / v03（record `AI-L0-DURABLE-002-20261015-003`）
- 复核身份：测试工程师，独立复验；未修改学习者产物、v01/v02 报告或冻结文件
- 结论：`fail`
- 局部范围结论：`insufficient_evidence`
- L1/L2：`not_granted` / `not_granted`

## 复验结果

1. **输出状态检查未完全通过**：holdout 的 `final.json` 与 `final_output.json` 均为 `status=local_draft_ready` 且 `scope=fixture-only`。但 run-1/2/3 的 `final.json` 均具备该 scope，三个 `final_output.json` 只有 `status=local_draft_ready` 和 `status_scope=deterministic_local_fixture_only`，缺少要求的顶层 `scope: fixture-only`。因此“所有 final.json/final_output.json 含 scope”未满足。
2. **checkpoint manifest 字段完整性复验失败**：顶层声明 SHA256 `7a8447a8a4354f00225718a791a815246628cee6a5752317c5e90dbab5926312` 可重算一致；contract/tool/draft 的 path、bytes、SHA256 均一致。但 run-1/2/3 的 final 条目声明 `bytes=261`、SHA256 `2c21f9...d366`，实际 `final.json` 为 302 bytes、SHA256 `ae2cfd...32496`，三次均不一致。故不能确认 checkpoint manifest 对 final checkpoint 有效。
3. **三次运行事件/去重回放静态检查**：run-1/2/3 的 event_log 均为 contract → tool → callback_accepted → duplicate_reused → single_draft_written → final_checkpointed；单一 draft、`cb-001` 去重及 payload hash 一致。三次 checkpoint 文件内容彼此一致，但 final manifest 失配使端到端 replay 证据不完整。
4. **holdout/失败停线/恢复/交接/外部动作**：holdout 只改变 callback 到达顺序，`result.json` 记录 `callback_id_deduped=true`、`partial_result_hold=true`，且最终状态为 `local_draft_ready`/`fixture-only`。四个 `first_failure` 原件均保留。contract 的 `external_action=null`。`repair_record.json` 标记 `self_signed=false`、`qa_status=pending`；handoff 仍待 QA。
5. **版本与来源**：v03 repair record 从 v01 到 v03，保留 v01/v02 和首失败；根 manifest 的 `input_fixture_hash_computed` 与 declared 一致，三次运行字节回放声明为 true。上述声明未能覆盖实际 final manifest 失配及 final_output scope 缺失。

## 未关闭限制

- 本地确定性 JSON 夹具未证明真实进程崩溃、持久数据库/队列耐久性、RPO/RTO、并发一致性或生产 checkpoint。
- 未发生真人 QA 签收；handoff pending，不能授予 L1/L2 或岗位认证。
- 未执行真实外部工具或收费模型调用。
- 需修复三份 run final manifest 的 bytes/SHA256，并为 run-1/2/3 `final_output.json` 增加顶层 `scope: fixture-only`，再重新独立复验。

## 结论

v03 通过了多数静态事件、holdout、失败停线、去重、恢复字段和外部动作空值检查，但关键验收条件仍失败：三份 run final checkpoint 的 manifest path/bytes/SHA256 不匹配，且三份 run `final_output.json` 缺少顶层 fixture-only scope。因此本轮判定 `fail`，局部范围为 `insufficient_evidence`；不授予 L1/L2、岗位认证或生产验收。
