# AI生成工程师 L0 学习者证据 v0.4 内容审校

- 诊断：`D0-AI-20261015-001`
- 审校岗位：内容审校员
- 范围：v04 learner evidence 正文/JSON、D0 demo 与 B-denial 独立 QA 绑定、D6 计数、U-AI-L0-001、本地替代证据的边界声明。
- 结论：`reviewed_with_limitations`
- 等级/能力授予：不授予 `L0`、`L1` 或 `L2`；`d0_status`/`l0_status` 仍为 `not_assessed`。

## 审校结论

1. **D0 demo 与 B-denial 的证据身份区分清楚，但不能合并成学习者已完成的自证。** v04 明确写出学习者只执行 D0/D6/U 本地确定性夹具，`quality/demo-v02-qa.json` 与 `quality/b-denial-qa.json` 是独立 QA 复核，且 `review_is_independent=true`、`learner_execution_separate=true`。QA 文件也明确“不授等级”。因此可把它们作为当前诊断的独立复核绑定，不能把 QA 的通过范围改写为学习者能力或 D0/B 已由学习者证明。B 拒绝案例的 QA 运行证据在范围内支持 `SOURCE_SCOPE_DENIED`、拒绝早于草稿生成、holdout 动态绑定；但 learner_raw 的 `B_tenant_rejection.status=unverified` 仍应保留，且 `must_not_count_as_pass=true` 是正确边界。

2. **D6 计数与失败样本边界基本清楚，但计数不能被解释成总体质量率。** `claim` 的 `0/1` 明确对应 B denial 负向样本中没有 claim，并列出错误；`source/version/tenant/schema` 各 `1/1` 只代表当前确定性 fixture 的一个正向样本/字段检查。文档同时声明正向字段阈值为 100%、负向拒绝必须拒绝，且无真实模型对照。该定义足以支持“该夹具样本的结构检查结果”，不足以支持真实模型、跨任务、跨版本或总体质量率；后续若扩充样本，必须保留正负样本分母、字段级规则、样本集合和失败样本，不得把 `claim 0/1` 与正向字段 `1/1` 混为同一指标。

3. **U-AI-L0-001 的未知迁移边界明确。** baseline、首失败、回归和 holdout 文件形成了单一约束（checkpoint unavailable）的本地静态/JSON 重放链；执行日志、输入/输出 hash 与 `fixture_only=true` 支持文件解析和本地确定性证据。`unmeasured` 明确列出真实进程崩溃恢复、真实模型质量、外部 API contract、生产 RPO/RTO；QA 还列出未知任务迁移未测。这些限制写法准确，不能将一个 changed key 的 holdout 迁移为未见任务、不同供应商、并发、真实数据或生产可靠性。

4. **真实能力与签收边界得到正确保留。** D0/D6/U 的本地证据没有证明真实模型生成、真实权限/来源 API、生产耐久性、成本、职业能力或学习者迁移。`qa_status=pending`、`self_signed=false`、`human_receipt=pending`、`external_action=null` 与各 QA 文件的 pending handoff 一致；真人签收、专家审核和职业认证仍是待办，不应通过记录存在或 QA 复核状态来推断完成。

## 需要保持的限制/后续

- B denial 可作为独立 QA 复核的范围性结果；若要计入学习者完成证据，需同诊断下可追溯的学习者执行记录，并继续由 QA 独立复验。
- D6 继续标注 fixture-only；不要用 `1/1`、`0/1` 或 p95 1.89 ms 计算总体能力、模型质量或生产 SLA。
- U 的真实崩溃/恢复、未知任务迁移、外部契约和生产 RPO/RTO 仍未验证；迁移实验需新输入、独立记录和独立 QA。
- 真人接收签收/专家审核/实际学习效果仍 pending；任何等级或职业能力结论都必须等待相应责任岗位和真人证据。

审校未修改工作区源文件，未执行付费模型调用、外部动作或发布。
