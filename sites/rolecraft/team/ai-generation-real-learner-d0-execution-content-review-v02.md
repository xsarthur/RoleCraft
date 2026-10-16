# AI生成工程师 D0-03 执行内容审校 v0.2

- 审校 ID：`AI-REAL-LEARNER-D0-EXEC-CONTENT-20261016-02`
- 目标 QA：`AI-REAL-LEARNER-D0-EXEC-QA-20261016-002`
- 合同：`AI-REAL-LEARNER-D0-EXEC-20261016-001`
- 目标学习者记录：`AI-REAL-LEARNER-D0-20261016-001`
- 审校岗位：内容审校员（独立核查；不代答、不代签、不授等级）
- 日期：2026-10-16（Asia/Shanghai）
- 结论：`reviewed_with_limitations`
- 学习者状态：`not_assessed`；D0/L1/L2 均未授

## 审校范围与证据边界

只读核对学习者原始回答及 JSON、D0-03 执行合同及 JSON、QA v0.2 报告及 JSON、run-1/run-2 四场景收据、holdout、SHA 收据和隔离环境。学习者未提供实际入口、本人 stdout/stderr 或签收；QA 明确是测试工程师的本地确定性回放。因此以下结论只确认合同机制在冻结夹具中的表达和回放证据，不能把 replay、退出码、哈希一致或 holdout 当作学习者能力证据。

## 已核实的机制

- **A-normal 与来源绑定**：两条 claim 均绑定 `doc-A-refund-v2`、`refund-policy-v2`、固定 location 与正文 hash；tool receipt 的 actor/requested tenant、版本、hash 和 `side_effect=none` 一致。订单状态、客户身份缺失被保留为 `unknown`，结果只到 `draft_ready_for_review`，没有被解释为退款决定。
- **租户边界与 B 拒绝**：B 场景在生成前以 `SOURCE_SCOPE_DENIED` 停止，`draft=null`、`handoff=null`、`external_action=null`；QA 收据只包含拒绝元数据，记录 B 文本未读取、未缓存、未进上下文。学习者原答也明确禁止打开、摘要、缓存或绕过权限。混合 A/B 拆分、B 标识在 prompt/cache/log 中不泄漏及依赖不清时整单阻断仍未验证。
- **缺失、冲突与 unknown**：`source-missing` 首失败为 `SOURCE_MISSING`，不换源、不猜测，保留缺失和未访问来源；`source-conflict` 首失败为 `SOURCE_VERSION_MISMATCH`，在 draft 前停止，列出冲突/alternate 未访问。学习者原答将无法确认的金额、订单、身份、时间和规则标为未知，符合“证据不足不得补全”；QA 未把 unknown 转成结论。
- **首失败停止与交接**：四场景均有 `first_failure`、`stop_before_draft`、草稿/交接/外部动作收据；正常场景 handoff 为 QA pending，失败场景 handoff 为空。run-1/run-2 的渲染结果逐字节一致并有 SHA；holdout 改变文档标识、版本和文本后动态绑定新 hash，并保留人工复核标记。QA 交接内容包含输入、来源、未访问项、unknown、停止点和环境边界，且明确 `human_receipt_pending=true`。

## 证据与内容限制

1. 本轮只能确认冻结夹具的本地机制。未确认学习者本人执行、真实供应商来源 API、真实模型忠实度、生产权限、缓存/上下文隔离、并发、恢复、有效期、schema/超时/部分响应、重试幂等或真人审批。
2. 合同声明 fixture SHA 为 `5dc9f33...8db5e0`，QA `input-frozen.json` 实际 SHA 为 `f6cc25...f446`，但 JSON 保留 expected SHA 为合同值。该差异应由 QA/工程师解释并在下一轮重新冻结或明确“输入快照哈希”与“夹具包哈希”的关系；在解释前不能把哈希链称为完全一致。
3. A 的 `fact` claim 只证明与夹具原文绑定，不证明模型生成的事实/规则/推导分类、引用忠实度或人工复核通过；`draft_ready_for_review` 不是最终退款判断。
4. holdout 是 QA 的等价夹具变体，不能证明未知任务迁移、真实学习效果、真人专家审核、职业胜任或行业先进性。

## QA 交接与复验要求

责任交给 AI 生成工程师学习者/课程责任人补交四场景本人原始 stdout/stderr、实际命令、输入与脚本 hash、退出码、停止收据和本人签收；测试工程师独立复跑并保留原例。下一轮应增加混合 A/B、旧版本/有效期、schema 错、超时、部分响应、重试幂等、恢复及日志/上下文泄漏检查，并先解释 fixture/input SHA 差异。所有缺证据项保持 `insufficient_evidence`，不得以作者自检或 QA replay 关闭，不授 D0/L1/L2。

本报告不修改原始回答、合同、QA 报告、冻结教材、数据库或等级记录。
