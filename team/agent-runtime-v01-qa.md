# Agent Runtime v0.1 独立验收报告

日期：2026-10-14（Asia/Shanghai）  
责任岗位：测试工程师（独立质量验证）  
输入门槛：`team/agent-development-architecture-qa-v01.md`  
本报告不修改 `server/agent/index.mjs` 或 `dev-check.mjs`，也不把作者自检当作独立通过证据。

## 结论

当前新增运行时在**本地、内存、只读工具范围**通过本报告的独立夹具；该范围结论为 **`pass_with_limitations`**。独立夹具覆盖非法 `AgentSpec`/状态迁移、工具 effect/scope/schema 拒绝、重复 action、`unknown_effect` 恢复闸门、checkpoint hash/篡改、事件敏感字段脱敏、step/cost/timeout 预算。

架构蓝图的完整验收结论仍为 **`insufficient_evidence`**：当前运行时没有持久任务库、跨进程租约、外部效果账本、模型网关、HTTP 交接、真实检索/索引冲突、回滚包或生产证据。README 已声明这些限制；本地通过不能升级为生产 Agent 或职业能力通过。未发现本轮夹具中的 P0/P1 越权、秘密明文泄露、重复只读业务效果或无界步数执行。

## 冻结输入与环境

| 项目 | 收到值 |
| --- | --- |
| Runtime | `agent-runtime-0.1.0` |
| Runtime 源 | `sites/rolecraft/server/agent/index.mjs` |
| Runtime SHA-256 | `b56dc7571f1c581600d1e4229e4b32c4a8836cc3cd8bd4260004dff4a253ebc2` |
| Self-check | `sites/rolecraft/server/agent/dev-check.mjs`，SHA-256 `1766543d3c4ef3704109eef98b56a9769bcea6187625f6f60d5f5a3053ee0952` |
| Node | `v24.16.0` |
| 日期/时区 | `2026-10-14T23:41:22+08:00` |
| 独立 fixture | `/private/tmp/agent-runtime-independent-qa.mjs`，SHA-256 `667d0b702d2ad797577528cc9a7910a5eea1a04f8b3979a0c25738d19b316ff9` |
| Fixture 输出 | `/private/tmp/agent-runtime-independent-qa.json`，SHA-256 `6d97f5fc4515fb2f14913d1ae9599717a95b9b8ff6e07145efec2ecaa3b0e93c` |

所有调用均使用内存夹具；`modelCalled=false`、`providerCalled=false`、`network=false`、`database=false`、`userDataMigrated=false`。未读取或修改用户数据库、密钥、外部账号或正式服务。

## 执行收据

1. `node --check sites/rolecraft/server/agent/index.mjs`：退出码 `0`。
2. `node sites/rolecraft/server/agent/dev-check.mjs`：退出码 `0`，作者自检 JSON `status=passed`，7 项自检通过。它只作为工程自检记录，不替代下列独立夹具。
3. `node /private/tmp/agent-runtime-independent-qa.mjs`：退出码 `0`；独立断言 9 项，其中 `pass=8`、`pass_with_limitations=1`、`fail=0`。

## 独立夹具结果

| 独立检查 | 结果 | 实际断言与证据 |
| --- | --- | --- |
| 非法 spec 与状态迁移 | `pass` | 错误 schema 版本返回 `spec_version_unsupported`；非法 budget/taskType 返回 `invalid_input`；从 `received` 成功结束返回 `state_invalid`；非等待状态传给 `waitFor` 返回 `invalid_input`。 |
| 工具 effect/scope/schema 门禁 | `pass` | 注册 `write`/禁用工具分别拒绝；缺 `content:read` 返回 `scope_missing`；额外参数违反 `additionalProperties:false` 返回 `tool_args_invalid`；handler 调用计数在拒绝路径保持 0。 |
| 重复 action 与参数冲突 | `pass` | 同一 `actionId`、同一 args 第二次返回 `idempotentReplay=true`，handler 物理调用数保持 1；同 actionId 改 args 返回 `idempotency_conflict`。 |
| `unknown_effect` 恢复闸门 | `pass` | 延迟工具在动作登记后标记 unknown；任务进入 `unknown_effect`，`resumeTask` 返回 `recovery_requires_effect_check`，未直接恢复执行。 |
| unknown 的迟到观察 | `pass_with_limitations` | 释放延迟只读 handler 后观察结果为 `succeeded`，任务仍保留 `unknown_effect`，需要显式恢复；这是保守的显式核对行为。由于本运行时没有外部效果账本，未能证明真实外部动作的查询/去重。 |
| checkpoint hash 与篡改 | `pass` | 返回 hash 与包含 `idempotencyIndexKey` 的 canonical payload 重算一致；新 runtime 可恢复；篡改 `state.step` 返回 `checkpoint_hash_mismatch`。 |
| 敏感字段脱敏 | `pass` | `wait_started` 夹具中的 `apiKey`、嵌套 `password` 均变为 `[REDACTED]`，原敏感标记不出现在事件 JSON；redaction paths 正确记录。 |
| step/cost/timeout 限制 | `pass` | `maxSteps=1` 的第二次 `beginStep` 将任务置为 `failed` 且 stop reason `step_limit`；费用超过 `maxCostUsd` 置为 `failed/budget_exceeded`；人工时钟越过 timeout 置为 `failed/timeout`。 |

独立 fixture 没有把错误结果吞成成功：预期拒绝均按 `AgentRuntimeError.code` 断言；只在全部必需断言通过后退出码为 0。

## 与架构门槛的映射

| 架构 ID | 本轮状态 | 依据与边界 |
| --- | --- | --- |
| `ARC-C-02` | `pass_with_limitations` | 本地 ToolDescriptor、JSON schema、scope、允许工具、只读 effect 和错误码均实测；未测跨岗位 producer/consumer、旧协议兼容和取消迟到 HTTP 回执。 |
| `ARC-C-06` | `pass_with_limitations` | `maxSteps`、timeout、cost 上限实测；未接模型/队列/速率限制，不能证明跨层预算一致。 |
| `ARC-T-01` | `pass`（本地范围） | 越权 scope 和 schema 在 handler 前拒绝；没有真实租户/私有资源或网络发送。 |
| `ARC-T-02` | `pass_with_limitations` | `write`/`external_side_effect` 描述在注册时拒绝；没有可供本轮实测的批准、下游幂等或真实写工具。 |
| `ARC-T-03` | `pass_with_limitations` | 只读 action 重放和参数冲突通过，物理调用数为 1；没有外部业务效果账本，不能证明下游 exactly-once。 |
| `ARC-T-04` | `pass_with_limitations` | `unknown_effect` 闸门实际阻止 resume；无原操作查询接口/外部效果账本，未知效果跨进程恢复为 `insufficient_evidence`。 |
| `ARC-R-01`/`R-02` | `pass_with_limitations` | 同进程 checkpoint hash、恢复和事件保留通过；未执行数据库或真实进程崩溃重启。 |
| `ARC-R-03`/`R-04`/`R-05`/`R-06` | `insufficient_evidence` | 没有持久 store、lease/fencing、迁移或外部回执替身，不能用内存测试代替。 |
| `ARC-M-01..06` | `insufficient_evidence` | 本 runtime 未调用模型；没有供应商密钥、API、格式错误模型响应或真实账单。 |
| `ARC-O-01` | `pass_with_limitations` | 已核 trace/run/task/sequence、状态 revision 和已知 key 脱敏；未覆盖全链路跨组件 trace、保留期、未知秘密/编码泄漏。 |
| `ARC-E-01..03` | `insufficient_evidence` | 本轮是有限夹具，不是冻结评估集、分母报告、p50/p95 或独立指标重算。 |
| `ARC-P-01..04` | `insufficient_evidence` | 本 runtime 未挂真实检索适配器、索引版本冲突、撤回、缓存或权限变化。 |
| `ARC-V-01..05` | `insufficient_evidence` | 没有发布包、停止领取/排空、迁移或回滚演练。 |

静态蓝图的职责/组件/版本图仍应由架构 QA 按 `ARC-S-*` 单独审查；本报告只验收新增本地运行时代码的可执行子集。

## 未覆盖与后续复验

- 需要后端数据工程师提供隔离持久 store、租约/fencing 与迁移夹具后，复验 `ARC-R-*`，包含发送前/中/后崩溃及迟到回执。
- 需要 AI 生成工程师提供无密钥、超时、5xx、限流、部分 JSON 和预算账本替身后，复验 `ARC-M-*` 与跨层预算。
- 需要内容检索工程师提供冻结版本/源 hash/撤回/无匹配/多意图夹具后，复验 `ARC-P-*`。
- 需要发布包与隔离环境后，执行 `ARC-V-*` 回滚演练；不能用本地 checkpoint 恢复替代发布回滚。
- `unknown_effect` 的迟到观察已保留为限制项；下一版应提供“按原 action ID 查询效果”的显式接口和跨进程证据，再决定是否能把该项提升为 `pass`。

本报告没有修改实现、数据库、教材或正式服务；首次结果、限制和未验证项均保留。
