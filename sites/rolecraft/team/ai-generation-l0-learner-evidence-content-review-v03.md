# AI生成工程师 L0 学习者证据 v0.3 内容审校

- 审校角色：内容审校员
- 日期：2026-10-15（Asia/Shanghai）
- 范围：`ai-generation-l0-learner-evidence-v03.md/.json`、v03 `learner_raw.json`、`manifest.json` 及 `u-ai-l0-001` 五项工件
- 诊断：`D0-AI-20261015-001`
- 结论：**`reviewed_with_limitations`**
- 等级决定：不授予 L0/L1/L2 等级；`qa_status=pending`、`self_signed=false` 与 `l1/l2_decision=not_granted` 表述保持正确。

## 审校结论

### D0 机制与边界

D0-01 至 D0-05 的概念链条一致：模型生成岗只负责生成、schema、来源、失败恢复和证据交接；状态为 `start→tool_returned→source_checked→draft_ready`，失败进入 `recovery_required`；结果先持久化且未知副作用不重放；实验只改变 checkpoint 可用性并保留首错、恢复和 holdout。D0-03 的 A 租户、`F-AI-SOURCE-CLAIM-v1`、`doc-A-refund-v1` 和完整 fixture hash 在正文、原始 JSON 与 manifest 中一致。

v03 明确写出 B 租户拒绝路径“本轮未验证，不计为通过”，这是正确的边界声明，但仍不是 D0-03 的执行证据。四个 U 工件仍是本地 fixture JSON；它们显示状态和来源字段，却不能证明真实持久化失败、进程崩溃恢复或未知副作用控制。

### D6 用户问题、指标、取舍与切换门槛

用户问题覆盖来源受限草稿生成中质量、成本、延迟和安全的方案选择；本地确定性规则与真实供应商适配器的优缺点、外发风险和前置批准条件解释合理。v03 新增 CPU `1.84ms`、五次运行值和 `p95=1.89ms`，并记录 fixture-only、无网络、无付费调用及输入/输出 hash，较 v02 可复核性有实质改善。质量门槛仍仅声明 schema/source completeness 100%，没有逐字段计数、样本规模或真实模型质量对照；p95 是五个本地命令/fixture 读盘运行的结果，不能外推供应商模型或生产延迟。`质量<100%或p95>2ms先停线；预算、脱敏、QA批准后才切供应商` 是清楚的防越界门槛，但其触发效果尚未被失败样本实测。

### U-AI-L0-001 实际执行与未知迁移

v03 提供 `execution_log.json`、命令、五次耗时、输入/输出 hash，并登记 learner_raw 与四个 U 工件的 bytes/hash；逐项 SHA-256 与 manifest 声明一致，支持“本地 JSON/fixture 执行过”的有限结论。baseline、first_failure、regression、holdout 保留同一约束，首失败停止下游，holdout 超过重试预算停止，单约束设计未见改写第二变量。

限制仍然关键：执行命令只是 `json.load` 四个文件，不能证明真实过程崩溃、持久化或恢复回放；`regression.state=draft_ready_for_review` 与 D0-02 的 `draft_ready` 仍有状态命名漂移。未知迁移能力、真实模型质量、外部 API 契约和生产 RPO/RTO 未验证，因此不能把本地执行收据写成能力认证。

### 来源、hash 与本地替身限制

v03 正文中的 canonical fixture hash 与 `SOURCE-001`、JSON、manifest 一致；manifest 对 learner_raw、execution_log 和四个 U 工件登记的 hash/bytes 与当前文件一致。`external_action=null`、fixture-only、无网络/付费 API、未测真实供应商/API 等限制措辞准确。SOURCE-001 的 B/来源拒绝失败类型可作为历史背景，但不能替代本诊断下 B 租户拒绝收据，也不能把本地规则适配器写成真实供应商生成。

## 必须保留或返修的缺口

1. 补交同一诊断下 B 租户拒绝的可重放执行收据；在此之前继续标为未验证。
2. 若主张质量 100%，提供 schema/source 逐项计数、样本定义和失败样本；若无真实模型，明确“未比较模型质量”。
3. 由 QA 独立重跑并统一 `draft_ready_for_review`/`draft_ready` 状态合同；保存真实故障注入或明确仅为静态 fixture 演示。

本审校只评价内容与证据边界，不修改学习者文件，不代替 QA、真人专家、真实供应商测试或等级授予。
