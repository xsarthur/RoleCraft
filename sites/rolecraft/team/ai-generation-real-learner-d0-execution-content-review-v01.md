# AI生成工程师 D0-03 执行内容审校 v0.1

- 审校 ID：`AI-REAL-LEARNER-D0-EXEC-CONTENT-20261016-01`
- 目标 QA：`AI-REAL-LEARNER-D0-EXEC-QA-20261016-002`
- 合同：`AI-REAL-LEARNER-D0-EXEC-20261016-001`
- 目标学习者记录：`AI-REAL-LEARNER-D0-20261016-001`
- 审校岗位：内容审校员（独立核查，不代写、不代签、不授等级）
- 日期：2026-10-16（Asia/Shanghai）
- 结论：`reviewed_with_limitations`
- 学习者状态：保持 `not_assessed`；D0/L1/L2 均未授予

## 审校范围与证据

只读核对 QA 报告及 JSON、冻结合同及 JSON、隔离工件（run-1/run-2 四场景、收据、holdout、SHA）、以及学习者原始回答及 JSON。QA 明确记录为测试工程师的本地确定性回放，学习者没有提交本人入口或 learner-owned raw receipts；因此本审校核机制表达和 QA 证据边界，不把 replay 重新解释为学习者执行。

## 已核实的机制

- **A-normal**：两条事实 claim 均带 `document_id=doc-A-refund-v2`、`source_version=refund-policy-v2`、fixture location 和正文 hash，状态为 `bound`；tool receipt 的租户、版本、hash、只读副作用和原文一致。订单状态、客户身份缺失被保留为 `unknown`，草稿停在 `draft_ready_for_review`，handoff 仍为 QA pending，未执行外部动作。
- **B-tenant-denied**：首失败为 `SOURCE_SCOPE_DENIED`，在 draft 前停止，`draft`、`handoff`、`external_action` 均为空；QA 输出与收据不含 B 私有正文，并记录未读取/未缓存/未进入上下文。学习者原答也明确要求读取前拒绝，禁止绕权。
- **source-missing**：首失败为 `SOURCE_MISSING`，生成前停止，不猜测、不换源；保留 required source unavailable 和未访问来源。
- **source-conflict**：首失败为 `SOURCE_VERSION_MISMATCH`，生成前停止，保留冲突版本/未访问 alternate；没有以可读文本覆盖冲突。
- **停止语义**：四场景均有 `first_failure`、`stop_before_draft`、draft/handoff/external action 收据；run-1/run-2 四场景逐字节一致，SHA 已落盘。错误场景与正常场景的停止点符合合同，且无外部动作。
- **来源绑定与 holdout**：holdout 改变 document_id/source_version/text 后动态计算新 hash 并绑定新来源，保留人工复核标记；没有据此授等级。它证明绑定不是写死的字段替换，但只覆盖同类夹具变体。
- **unknown/边界**：A 的个案判断所需订单状态和客户身份没有被规则摘要冒充；合同和学习者回答均要求未知时阻断或转人工。QA 未把 unknown 变成最终退款决定。

## 内容限制与待返修

1. QA 只渲染/回放冻结夹具，未证明真实学习者能够按合同独立实现或复现；学习者原始 JSON 仍 `self_signed=false`、`qa_status=pending`、`real_model_called=false`。不得将 QA replay 的 exit code、SHA 一致性或 holdout 绑定当作本人能力证据。
2. 来源绑定虽足以核对本夹具的 document/version/location/hash，但未验证真实供应商来源 API、访问时序、有效期、缓存/并发/恢复，亦未证明模型上下文中实际只含授权文本。合同要求的 learner receipts 尚缺。
3. B 场景覆盖单一越权文档；学习者回答提到混合 A/B 请求，但 QA 未回放输入拆分、B 标识不进 prompt/cache/log、依赖不清整单阻断等细粒度反例。该机制只能记为未验证。
4. source-missing 与 source-conflict 的首失败和停止收据已通过夹具验证，但未覆盖 schema 错、超时、部分响应、重复回调、旧版本有效期、重试/幂等或恢复后的首失败语义。
5. A 的两条 claim 被标作 `fact`，但当前夹具只证明它们与原文绑定；没有真实模型生成忠实度、事实/规则/推导分型或人工审批证据。不能把 `draft_ready_for_review` 解释为正确退款结论。
6. holdout 仅是 QA 运行变体，不能替代学习者未知任务迁移、真实用户反馈、真人专家审核或生产权限验证。

## 结论与交接

在“QA 本地确定性回放”范围内，A/B、缺失、冲突、首失败停止、来源绑定、unknown 保留和 holdout 动态绑定的证据逻辑一致，报告可评为 `reviewed_with_limitations`。未达到学习者执行合同的完成条件，不能关闭本人执行、不能授 D0/L1/L2。

返修/复验责任交给 AI 生成工程师学习者与课程责任人：按冻结合同补交四场景本人原始 stdout/stderr、输入与脚本 hash、退出码和停止收据；再由测试工程师独立复跑并验证混合租户、来源有效期/旧版本、schema/超时/部分响应和缓存上下文边界。缺少真实运行证据的项目继续标 `insufficient_evidence`，不得以作者自检或 QA replay 代替。

本报告不修改学习者原答、QA 报告、合同、冻结教材或等级记录。

