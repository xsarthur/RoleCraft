# AI生成工程师 L0→L1 门槛独立复核 v0.4

- 日期：2026-10-15（Asia/Shanghai）
- 岗位：测试工程师（独立复核）
- 诊断：`D0-AI-20261015-001`
- 复核输入：D0 learner demo v02 及其 QA/内容审校、learner-evidence v03 及其 QA/内容审校、B-denial-transfer v01 及其 QA/内容审校、SOURCE-001、DURABLE-002 v04、GATE-003 v06 当前 QA/内容审校、`l0-to-l1-gate-qa-v03` 与 `content-review-v02`。
- 决定：`remain_L0_guided`
- L1 review：`insufficient_evidence`
- 等级：不授予 L1/L2，不授生产权限

## gate.must 逐项判断

| gate.must | 状态 | 证据与边界 |
|---|---|---|
| 五项 D0 同诊断学习者原始回答 + 实际 demo | **fail** | learner-evidence-v03 含 D0-01…05 的学习者文字与同一 diagnostic_id，但 `qa_status=pending`、B 租户路径仍 `unverified`；D0 demo v02 已有独立 QA/内容审校且局部通过，却是确定性修复包，尚未证明五项回答逐项对应实际运行输出并形成完整 learner EvidenceCard。独立 B-denial-transfer 收据不能替代同一学习者 D0 五项绑定。 |
| D1–D5 初步证据 | **partial_fail** | SOURCE-001 覆盖来源/租户/拒绝，DURABLE-002 v04 覆盖失败—恢复—回放，GATE-003 v06 覆盖 schema/人工 gate；均为局部练习切片。缺完整学习者绑定的 D1–D5 卡、未知任务解释和真人接收证据。 |
| 两个非同构 sandbox | **partial_pass（局部）** | SOURCE-001 与 B-denial-transfer v01 有正常、拒绝、改变 document_id/source_version/text 的 holdout，独立 QA 复跑字节一致；DURABLE-002/GATE-003 也有本地可重放工件。它们不是学习者独立提交的完整双 sandbox，且仅是进程内 JSON/确定性夹具。 |
| 原例、回归、失败/迁移 | **partial_pass** | D0-04、DURABLE-002 v04 三次回放/首失败/事件顺序 holdout，GATE-003 schema_unknown_field 失败与留出，B-denial 非同构拒绝均有局部收据。证据未覆盖真实模型、供应商/API、数据库/队列、崩溃恢复、未知任务迁移或生产 RPO/RTO。 |
| QA / REV 独立记录 | **partial_pass** | learner-evidence QA/content、D0 v02 QA/content、B-denial QA/content、DURABLE v04、GATE v06 均有独立记录并保留限制；这些记录明确不授等级，且 B-denial 内容审校未执行运行。真人 QA/接收岗位签收仍 pending。 |
| D6 方案取舍 | **partial_fail** | learner-evidence-v03 给出规则适配器与供应商模型的质量/成本/延迟/停止线，5 次本地 CPU/p95 记录可复核；质量仅“fixture schema/source completeness=100%”，无逐字段样本计数、失败样本或真实模型对照，不能证明方案取舍能力。 |
| P1 无未关闭项 | **fail** | 同诊断 D0 绑定、真实/未知任务迁移、完整 learner EvidenceCard、D6 质量证据、真人签收、真实运行时范围仍开放。局部 QA 通过不能关闭这些 P1。 |
| 接收签收 | **pending** | B-denial、GATE 等 handoff 均为本地 `recipient=QA`、`self_signed=false`、`status=pending`；未见真人接收方有据签收或拒收。 |

## 证据边界

D0 v02 的 manifest 自包含规则、逐文件哈希、D0-04 恢复状态和 D0-05 schema/source 字段在本地范围内可复核；B-denial-transfer v01 的 `SOURCE_SCOPE_DENIED` 在生成前停止、无 draft/handoff/external_action，且非同构输入双次输出一致；DURABLE-002 v04 和 GATE-003 v06 的指定回放与留出也有局部 QA。以上支持“有限本地机制演示”和“夹具可重建”，不支持真实模型质量、LangGraph/API/数据库/云服务、进程崩溃恢复、并发、费用/限流、真实权限与保密、真人专家判断、未知任务迁移、职业能力认证或生产权限。

## 复验条件

1. 在同一 `diagnostic_id` 下补齐五项学习者原始回答到实际 demo 输出的逐项绑定，并提交完整 EvidenceCard；实际执行并留存 B 租户拒绝。
2. 由学习者本人提交两个非同构可重建 sandbox，含正常、首失败、回归、holdout、失败解释和迁移边界；保留原始失败记录。
3. 补 D6 逐字段质量计数、失败样本、成本/延迟测量方法及真实模型未比较声明；不得以 fixture 通过替代真实对照。
4. 完成独立 QA/内容审校后的真人接收方签收或有据拒收，逐项关闭并重新复验 P1。
5. 明确真实运行时（模型/API/数据库/崩溃恢复）执行范围；未执行部分继续标为未验证。

本报告只作门槛证据复核，决定保持 `remain_L0_guided`，L1 为 `insufficient_evidence`；不授任何等级或生产权限，历史报告和失败记录保留。
