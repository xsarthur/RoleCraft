# AI-PRACTICE-DURABLE-002 内容审校 v0.3

## 范围与依据

本次独立内容审校只读核对 `ai-generation-l0-practice-durable-002-v03.md/.json`、v03 工件目录（checkpoint manifest、run-1/run-2/run-3、holdout、四个首失败、恢复收据、EvidenceCard、repair record）、v02 内容审校及本练习包相关交接。未修改学习者产物、教材、应用、账户数据或历史报告；不授 L1/L2 或岗位等级。

## 结论

**`reviewed_with_limitations`（本地练习范围；不构成生产耐久性、RPO/RTO、LangGraph checkpoint 能力、真人能力或发布定稿证据）**。

v03 已落实 v02 的范围语义修复。逐一检查 holdout 及 run-1/2/3 的 `final.json` 与 `final_output.json`：均使用 `local_draft_ready`；嵌套 final checkpoint 与 holdout 输出含 `scope: fixture-only`，三次 `final_output.json` 含 `status_scope: deterministic_local_fixture_only`，语义一致且没有 `status: final` 残留。根 checkpoint manifest SHA256 为 `7a8447a8a4354f00225718a791a815246628cee6a5752317c5e90dbab5926312`，与 v03 记录一致；manifest 的 12 项路径、bytes 与 SHA256 可由工件重算匹配。

幂等与恢复叙述在本地夹具范围内相互支持：event log 保留 callback 首次接收、重复复用、单 draft、final checkpoint 顺序；recovery receipt 保留从 tool checkpoint 重启、部分结果 hold、replay、manifest/draft 检查和 QA handoff；四个首失败原件仍保留，repair record 明确 `self_signed=false`、`qa_status=pending`。这些证据足以支持练习目标的本地状态机说明，不能外推到生产耐久性或恢复目标。

## 已核对的支持证据

- v03 所有 final 输出均为 `local_draft_ready`；fixture-only 范围在 final checkpoint、holdout 与 final_output 语义中均有明确表示。
- checkpoint manifest 与三次运行的 12 个 checkpoint 文件逐项 bytes/SHA256 一致；三次运行内容可重放且 manifest 哈希与记录绑定。
- holdout event log 和 recovery receipt 支持 callback 去重、payload 一致性、单 draft、从 tool checkpoint replay 及最终完整性检查的练习叙述。
- 四个首失败（损坏、版本不匹配、重复 callback payload 不一致、崩溃后不完整结果）以及 v01/v02 产物均保留；EvidenceCard 标记 `pending_QA`、L1/L2 `not_granted`。

## 限制与未决项

1. 证据仍是确定性本地 JSON/文件状态机；未进行真实进程 kill、数据库/队列持久化、fsync/rename 故障注入、并发事务、跨节点或外部供应商重放测试，不能声称生产 crash recovery、耐久性、RPO/RTO 或 LangGraph checkpoint 能力。
2. callback 去重、payload hash 和单 draft 只在给定夹具及顺序下成立；未证明多进程竞态、真实接收方签收或跨服务一致性。
3. QA 仍为 pending，作者未自签收；本审校不能替代测试工程师独立运行复验、真人专家审核、真实学习者结果或职业能力认证。
4. `final_output.json` 使用 `status_scope: deterministic_local_fixture_only` 而非字段名 `scope`；其范围含义清楚，但下游若要求统一字段名仍应由工程/QA在接口合同中明确，不得以字段形式差异推断生产语义。

## 复验要求

责任人：测试工程师独立重跑三次主运行、holdout、四首失败及字节/hash 校验，并记录实际环境；AI 生成工程师维护输出合同与字段兼容说明。QA 完成前保持 `reviewed_with_limitations`，不得授予等级或将本地替身写成生产耐久、RPO/RTO、真人能力或发布证据。

## 保护边界

本报告不修改学习者目录、冻结教材、应用、账户数据库或历史审校；不构成生产验收、真人专家审核、职业认证、RPO/RTO 承诺或发布授权。
