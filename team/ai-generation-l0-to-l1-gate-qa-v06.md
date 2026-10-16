# AI生成工程师 L0→L1 门槛独立复核 v0.6

- 日期：2026-10-15（Asia/Shanghai）
- 复核岗位：测试工程师（独立复核）
- 诊断：`D0-AI-20261015-001`
- 输入：learner-evidence-v04 及其 QA/内容审校 v04、D0 learner-demo-v02 QA/内容审校 v02、B-denial-transfer v01 QA/内容审校、SOURCE-001 QA/内容审校、DURABLE-002 QA/内容审校 v04、GATE-003 QA/内容审校 v06、既有 gate-qa-v05。
- 决定：`remain_L0_guided`
- L1 review：`insufficient_evidence`
- 等级：不授予 L0/L1/L2，不授生产权限。

## gate.must 逐项判断

| gate.must | 状态 | 独立判断 |
|---|---|---|
| 五项 D0 同诊断学习者回答 + 实际 demo | **fail** | learner-evidence-v04 与 D0/demo 绑定同一诊断，但 learner `qa_status=pending`、`self_signed=false`，未形成五项回答逐项对应实际运行输出的完整 learner EvidenceCard。D0 demo-v02 是独立 QA/审校通过的确定性修复包，不能替代学习者自证；B-denial 也不能替代。 |
| D1–D5 初步证据 | **partial_fail** | SOURCE、DURABLE、GATE 分别覆盖来源边界、失败恢复/回放、schema/人工 gate 的局部切片；缺完整学习者绑定的 D1–D5 EvidenceCard、未知任务解释和真人接收证据。 |
| 两个非同构 sandbox | **partial_pass（局部）** | SOURCE-001 与 B-denial 有正常/拒绝、改变 document/source/text 的 holdout；DURABLE/GATE 有可重放工件。它们是本地 JSON/确定性夹具，不是学习者提交的完整双 sandbox，也不证明真实运行时能力。 |
| 原例、回归、失败/迁移 | **partial_pass（局部）** | D0-04 恢复、D0-05 回归、SOURCE/B-denial 拒绝与 holdout、DURABLE 三次回放/首失败/事件顺序 holdout、GATE unknown-field 首失败与迁移 holdout 均有局部收据。真实模型/供应商/API、数据库/队列、进程崩溃、生产 RPO/RTO、未知任务迁移仍未验证。 |
| QA / REV 独立记录 | **partial_pass** | learner、D0、B-denial、SOURCE、DURABLE、GATE 均有独立 QA/内容审校，结论带范围限制并明确不授等级；真人 QA/接收岗位签收仍 pending。 |
| D6 方案取舍 | **partial_fail** | learner-evidence-v04 仅提供 fixture 字段计数：source/version/tenant/schema 1/1，claim 0/1，并保留失败样本；没有完整逐字段分母、真实模型对照或可迁移质量/成本决策证据。 |
| P1 无未关闭项 | **fail** | 五项 D0-to-demo 绑定、完整 EvidenceCard、D6 完整证据、学习者未知迁移/真实运行时、真人签收仍开放；局部 QA 不能关闭。 |
| 真人接收签收 | **pending** | handoff 仍是本地收据、`recipient=QA`、`status=pending` 或 `self_signed=false`；未见真人接收方有据签收或拒收。 |

## 失败与未知迁移边界

B-denial QA 在其范围内确认 `SOURCE_SCOPE_DENIED`、生成前停止、无 draft/handoff/external action 及非同构 holdout；learner-evidence-v04 仍将该项标记 `unverified` 且 `must_not_count_as_pass=true`，因此不计为学习者通过。DURABLE/GATE 的失败注入、schema/迁移和回放只证明本地状态机/JSON 夹具可复核，不证明真实进程崩溃、持久数据库、并发、回滚或未知任务下的学习者迁移。

## QA/REV 与证据范围

各专项报告的独立 QA/内容审校结论在声明范围内可接受（`met_with_limitations`/`reviewed_with_limitations`），但它们不能互相拼接成学习者职业能力认证。固定夹具的 hash、manifest、停止边界和 `external_action=null` 可作为本地机制证据；不能外推真实模型质量、供应商契约、生产耐久性、真人专家判断、真实用户效果或行业等级。

## 复验条件

进入 `l1_reviewable` 前，必须在同一 diagnostic 下补齐五项 learner-to-demo 绑定和完整 EvidenceCard；由学习者本人提交两个非同构 sandbox（正常、首失败、回归、holdout、失败解释与迁移边界）；补齐 D6 逐字段样本/失败分母并声明无真实模型对照；完成独立 QA/REV 后的真人签收或有据拒收；再逐项复验 P1，并明确已验证运行时范围。此前保持 `remain_L0_guided`，不授任何等级或生产权限。
