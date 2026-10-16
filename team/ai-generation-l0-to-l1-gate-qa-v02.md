# AI生成工程师 L0→L1 门槛独立复核 v0.2

- 复核日期：2026-10-15（Asia/Shanghai）
- 复核岗位：测试工程师（独立复核）
- 诊断：`D0-AI-20261015-001`
- 范围：按 advancement-v03 的 gate.must，复核学习者 evidence v03、D0 v04、SOURCE-001、DURABLE-002 v03、GATE-003 v06 及其 QA/内容审校记录。
- 决定：`remain_L0_guided`
- L1 review：`not_reviewable`; 等级授予：`not_granted`

## 逐项门槛判断

| gate.must | 状态 | 证据与边界 |
|---|---|---|
| 五项学习者 D0 原始回答 | **fail** | learner evidence v03 仍将 D0 总结为 `not_assessed`；B 租户拒绝为 `unverified`，不能以代理 D0 QA 补齐五项原始回答或能力。 |
| D1–D5 初步证据 | **partial_fail** | SOURCE-001、DURABLE-002、GATE-003 覆盖局部来源/恢复/schema/人工 gate；缺同一学习者绑定的完整 EvidenceCard、未知任务迁移和真人接收证据。 |
| 原例、回归、留出 | **partial_pass** | SOURCE-001 与 GATE-003 的局部回放/holdout 可复核；DURABLE-002 v03 因三份 final manifest bytes/hash 失配、三份 final_output 缺顶层 `scope` 判定 fail，故不能作为完整耐久回放通过。 |
| QA / 内容审校 | **partial_pass** | learner evidence QA v03 为 `met_with_limitations`，D0/SOURCE/GATE 有独立记录；DURABLE-002 QA 为 `fail`。真人 QA/接收岗位签收仍 pending。 |
| 无未关闭 P0/P1 | **fail** | 学习者 D0、DURABLE manifest/scope 缺陷、B 租户实际拒绝、未知迁移、真人签收等开放项使无未关闭 P1 条件不成立。 |
| 两套可重建 sandbox + EvidenceCard | **partial_fail** | SOURCE-001 与 GATE-003 本地包可重放且来源/哈希可绑定；DURABLE-002 关键 manifest/scope 验收失败，且没有学习者完整双沙箱提交。 |
| E-AI-L0-003 D6 方案取舍卡 | **partial_pass** | learner evidence v03 已提供本地规则 vs 供应商模型、质量/成本/延迟指标与停止线；QA确认数值仅 fixture，缺失败样本、逐字段计数和真实模型对照，不能视为完整方案能力。 |

## 必须保留的边界

D0 五项、D6 与 U-AI-L0-001 的本地收据可证明有限的确定性 fixture 行为：U 保留 baseline/first_failure/regression/holdout 和停止决策；但不证明真实进程崩溃恢复、持久数据库/RPO/RTO、真实模型/API、供应商失败、成本/限流、LangGraph 或未知任务迁移。两个 sandbox 的 `external_action=null`、`self_signed=false`/handoff pending 与局部哈希一致性不能替代真人审批和接收签收。代理报告、作者自签或静态报告完成均不构成学习者职业能力认证。

## 复验条件

1. 同一 diagnostic_id 下补齐五项学习者 D0 原始回答与完整 EvidenceCard，并实际执行 B 租户拒绝路径。
2. 修复 DURABLE-002 三次 run final manifest 的 bytes/SHA256，并为三份 final_output 增加顶层 `scope: fixture-only`，然后由 QA 重新独立复验。
3. 提交非同构第二 sandbox、未知任务留出与学习者本人解释；补 D6 逐字段质量计数、失败样本及明确的真实模型未比较声明。
4. 完成真人 QA/接收岗位有据签收或拒收，逐项关闭并复验 P1；在此之前保持 `remain_L0_guided`、`not_granted`。

本报告不授予 L1/L2、生产权限、真人专家认可或职业认证；历史报告和原始失败记录保留。
