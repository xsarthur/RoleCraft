# AI生成工程师 L0 学习者证据 v0.2 内容审校

- 审校角色：内容审校员
- 日期：2026-10-15（Asia/Shanghai）
- 范围：`ai-generation-l0-learner-evidence-v02.md/.json`、其 `learner_raw.json`、`manifest.json` 与 `u-ai-l0-001/{baseline,first_failure,regression,holdout}.json`
- 诊断：`D0-AI-20261015-001`
- 结论：**`reviewed_with_limitations`**

## 核对结论

### D0 五项机制与边界

内容上，D0-01 的岗位边界、D0-02 的状态序列和失败态、D0-03 的租户/来源约束、D0-04 的持久化失败停线原则，以及 D0-05 的单约束实验设计彼此一致。`manifest.json`、`learner_raw.json` 与 SOURCE-001 均绑定 `F-AI-SOURCE-CLAIM-v1`、`doc-A-refund-v1` 和同一 fixture hash `5dc9f33e…8db5e0`，没有把跨版本内容写成已通过。

但 D0-03 文本要求拒绝 B 来源，而本轮 v0.2 目录没有对应 B 租户拒绝收据；其依据只能追溯到旧 SOURCE-001 工件，不能当作本诊断下学习者已执行的独立证据。D0-04 的“结果先持久化”与“未知副作用不重放”是正确边界表述，但当前四个 U 文件是静态 JSON，未提供真实持久化/进程恢复执行证据。

### D6 用户问题、指标、成本/延迟与安全

E-AI-L0-003 确实提出了一个可判定的来源受限草稿生成问题，覆盖质量、成本、延迟和外发安全，并比较了本地规则适配器与供应商模型适配器。规则的可重复/零费用与供应商的质量潜力/费用、延迟、外发风险的取舍方向正确；“预算、脱敏、QA 批准”作为切换前置条件也符合安全边界。

限制在于，`schema/source citation completeness >=100%`、`paid calls=0` 和 `p95 <=2s` 只有目标/停止线，没有样本数、实际延迟分布、CPU 时间、schema 逐项计数或模型质量测量。唯一的验证收据是 `python3 -m json.tool learner_raw.json`，它只能证明 JSON 可解析，不能验证 D6 指标、方案质量或切换门槛。因此两方案仍是定性取舍，尚未形成可复核的实测决策。

### U-AI-L0-001 未知迁移

四份 JSON 互相支持一个“仅改变 checkpoint 短暂不可用/持续时间”的本地演示：baseline 可用，首失败进入 `recovery_required` 并停止下游，regression 使用同一 run 语义、幂等键、schema、来源版本和租户，holdout 只改变 outage duration，并在重试预算后停止。文件中没有发现第二个约束被同时改写；`external_action=null` 与未测范围措辞也保持一致。

不过，v0.2 没有执行命令、运行日志、哈希或独立回放收据，无法仅凭四个手写 JSON 证明“实际执行”而非计划/静态填充。`regression.json` 的状态 `draft_ready_for_review` 与 D0-02 的 `draft_ready` 命名存在轻微漂移；应在后续合同中统一。该任务因此只能支持“静态证据显示单约束设计成立”，不能支持未知任务迁移能力已验证。

### 来源版本与限制措辞

`F-AI-SOURCE-CLAIM-v1`、`doc-A-refund-v1`、fixture hash 在 v0.2 主文档、JSON、manifest 中一致；正文明确未测真实进程崩溃、模型质量、外部 API 和生产 RPO/RTO，也没有把本地替身写成真实供应商成功。`self_signed=false`、`qa_status=pending`、L1/L2 `not_granted` 的措辞准确。需要补充的是：D0-03 的 B 租户拒绝、D6 实测指标、U 的运行收据目前仍应显式标为“本轮未提供”，不能由旧 SOURCE-001 或 JSON 解析通过替代。

## 必须返修的内容缺口

1. 为同一 `diagnostic_id` 补交 D0-03 B 租户拒绝的本轮执行收据，或明确将其降为未验证项。
2. 为 D6 提供真实本地样本、质量计数、CPU/延迟测量方法和结果；若无供应商调用，保留“未比较真实模型质量”的限制。
3. 为 U-AI-L0-001 保存可重放执行命令/日志/哈希，并由 QA 独立复跑；统一 `draft_ready_for_review` 与状态合同名称。

本审校不修改学习者文件、不授予 L0/L1 等级，也不把静态 JSON 或旧练习报告当作本轮能力认证。
