# AI-PRACTICE-DURABLE-002 内容审校 v0.4

## 范围与依据

本次独立内容审校只读核对 `ai-generation-l0-practice-durable-002-v04.md/.json`、v04 工件目录（README、manifest、checkpoint manifest、run-1/run-2/run-3、holdout、四个首失败、恢复收据、EvidenceCard、repair record）、v03 内容审校及 practice pack 交接。未修改学习者产物、教材、应用、账户数据或历史报告；不授 L1/L2 或岗位等级。

## 结论

**`reviewed_with_limitations`（本地夹具范围；不构成生产耐久性、RPO/RTO、LangGraph checkpoint 能力、真人能力或发布定稿证据）**。

v04 所述修复可由工件核实：checkpoint manifest 的 12 个条目逐项重算，bytes/SHA256 全部匹配；manifest 文件 SHA256 为 `10c62dea585228af90cdd88bf4842cf1cece28c35fcd7e9bf71820960d285b56`，与 v04 报告/JSON 绑定一致。四个 run/holdout 的 `final.json` 均为 `local_draft_ready` 且嵌套 `scope=fixture-only`；四个 `final_output.json` 均有顶层 `scope=fixture-only` 和 `status=local_draft_ready`，run 输出还保留明确的 `status_scope=deterministic_local_fixture_only`。未见 `status: final` 生产性残留。

幂等 callback、单 draft、从 tool checkpoint replay、manifest/draft 检查及四类首失败保留在本地确定性 JSON/文件夹状态机中相互支持。repair record 保留 `self_signed=false`、`qa_status=pending`，handoff 仍 pending；因此 v04 是范围语义和完整性修复后的可审校夹具，不是独立 QA 完成。

## 已核对的支持证据

- `checkpoint_manifest.json` 的 run-1/2/3 各 4 个 checkpoint 共 12 项，实际 bytes/SHA256 全部相符。
- manifest 声明的版本、fixture hash、三次 run、回放相等和 practice-pack hash 与证据卡/报告一致。
- run-1/2/3、holdout 的 final checkpoint 与 final output 均使用 `local_draft_ready`；顶层 fixture-only 范围已补齐。
- recovery receipt 记录从 tool checkpoint 重启、部分结果 hold、replay、去重回放、完整性检查及 QA handoff；四个 first-failure 原件未被修复覆盖。

## 限制与未决项

1. 证据仍是确定性本地 JSON/文件状态机；未进行真实进程 kill、数据库或队列持久化、fsync/rename 故障注入、并发事务、跨节点或外部供应商重放测试，不能声称生产 crash recovery、耐久性、RPO/RTO 或 LangGraph checkpoint 能力。
2. callback 去重、payload hash、单 draft 与恢复只在给定 fixture 及事件顺序下成立；未证明多进程竞态、真实接收方签收或跨服务一致性。
3. QA handoff 仍 pending 且作者未自签收；本审校不能替代测试工程师独立运行复验、真人专家审核、真实学习者结果或职业能力认证。
4. run 输出同时保留 `scope` 与 `status_scope`，语义明确但下游统一字段合同仍需 QA/工程确认；字段补齐不产生生产语义。

## 复验要求

责任人：测试工程师独立重跑三次主运行、holdout、四首失败及字节/hash 校验，并记录实际环境；AI 生成工程师维护输出字段兼容说明。QA 完成前保持 `reviewed_with_limitations`，不得授予等级或把本地替身写成生产耐久、RPO/RTO、真人能力或发布证据。

## 保护边界

本报告不修改学习者目录、冻结教材、应用、账户数据库或历史审校；不构成生产验收、真人专家审核、职业认证、RPO/RTO 承诺或发布授权。
