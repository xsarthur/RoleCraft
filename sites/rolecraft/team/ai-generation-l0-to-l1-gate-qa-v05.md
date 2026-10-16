# AI生成工程师 L0→L1 门槛独立复核 v0.5

- 日期：2026-10-15（Asia/Shanghai）
- 复核岗位：测试工程师（独立复核）
- 诊断：`D0-AI-20261015-001`
- 输入：learner-evidence-v04 及其 QA/内容审校、D0 learner-demo-v02 QA/内容审校、B-denial-transfer QA/内容审校、SOURCE-001、DURABLE-002 v02、GATE-003 v03、既有 gate-qa-v04。
- 决定：`remain_L0_guided`
- L1 review：`insufficient_evidence`
- 等级：不授予 L0/L1/L2，不授生产权限。

## 门槛逐项判断

| 项目 | 状态 | 独立判断 |
|---|---|---|
| 五项 D0 同诊断学习者回答 + 实际 demo | **fail** | v04 learner 原始回答绑定同一诊断，但 `qa_status=pending`、`self_signed=false`；D0 demo-v02 仅是独立 QA/审校通过的确定性修复包，未形成五项回答逐项对应实际运行输出的完整 learner EvidenceCard。B-denial QA 不能替代学习者自证。 |
| D1–D5 初步证据 | **partial_fail** | SOURCE-001、DURABLE-002、GATE-003 分别提供来源边界、失败恢复、schema/gate 局部切片；缺完整 learner 绑定、未知任务解释和真人接收证据。 |
| 两个非同构 sandbox | **partial_pass（局部）** | SOURCE-001 与 B-denial 有正常/拒绝及 changed-key holdout，DURABLE/GATE 亦有本地可重放工件；不是学习者提交的完整双 sandbox，且均为 JSON/确定性夹具。 |
| 原例、回归、失败/迁移 | **partial_pass** | D0-04 恢复、D0-05 回归、SOURCE/B-denial 拒绝与 holdout 有局部收据；真实模型、供应商/API、数据库/队列、进程崩溃、生产 RPO/RTO、未知任务迁移未验证。 |
| QA / REV 独立记录 | **partial_pass** | learner、D0、B-denial、SOURCE、DURABLE、GATE 均有独立 QA/审校并保留限制；不授等级，真人 QA/接收签收仍 pending。 |
| D6 方案取舍 | **partial_fail** | v04 D6 仅 fixture 字段计数：source/version/tenant/schema 1/1，claim 0/1；失败样本已保留，不能当总体质量率，也无真实模型对照。 |
| P1 未关闭项 | **fail** | 五项 D0 完整绑定、learner EvidenceCard、D6 完整证据、真实/未知任务迁移、真人签收及真实运行时范围仍开放；局部 QA 不能关闭。 |
| 真人接收签收 | **pending** | 各 handoff 均 `recipient=QA`、`status=pending`、`self_signed=false`；未见真人接收方有据签收或拒收。 |

## B-denial 边界

B-denial 独立 QA 在其范围内复核了 `SOURCE_SCOPE_DENIED`、生成前停止、无 draft/handoff/external action 与动态 holdout；内容审校结论为 `reviewed_with_limitations`。但 learner-evidence-v04 将 `B_tenant_rejection.status=unverified` 且 `must_not_count_as_pass=true`，因此本复核不把 B-denial QA 计作学习者 pass。

## 证据边界与复验要求

当前证据支持有限本地机制演示和夹具可重建，不支持真实模型质量、外部契约、生产耐久性、职业能力或等级认证。要进入 L1 reviewable，应在同一诊断下补齐五项 learner-to-demo 绑定与完整 EvidenceCard；提交学习者本人执行的两个非同构 sandbox（含正常、首失败、回归、holdout、失败解释和迁移边界）；扩充 D6 逐字段样本/失败分母并明确无真实模型对照；完成独立 QA/REV 后的真人签收或有据拒收；再逐项复验 P1。未执行的真实运行时继续标记未验证。
