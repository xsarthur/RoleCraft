# AI生成工程师 L0→L1 门槛独立复核 v0.7

- 日期：2026-10-15（Asia/Shanghai）
- 复核岗位：测试工程师（独立复核）
- 诊断：`D0-AI-20261015-001`
- 输入：Consolidated Learner Handoff v0.6 及其 QA/内容审校 v06、D0 learner-demo-v02 QA/内容审校 v02、B-denial learner/QA/content、SOURCE-001、DURABLE-002、GATE-003 QA/content、SOURCE/DURABLE/GATE 证据、既有 gate QA v06。
- 决定：`remain_L0_guided`
- L1 review：`insufficient_evidence`
- 等级：不授予 L0/L1/L2，不授生产权限。

## gate.must 逐项判断

| 项目 | 状态 | 独立判断 |
|---|---|---|
| 五项 D0 同诊断学习者回答 + 实际 demo | **fail** | 五张卡、raw 与 demo 均带同一 diagnostic_id，且结构上存在首失败/停止/回归/holdout字段；但 demo learner_raw 仍 `not_assessed`、`qa_status=pending`、`self_signed=false`，卡片只是通用引用同一 execution_log，未逐题证明学习者回答与对应实际输出的一一语义绑定。不能以独立确定性 demo QA替代学习者自证。 |
| D1–D5 初步证据 | **partial_fail** | SOURCE、DURABLE、GATE与 handoff 提供来源边界、持久失败恢复、schema/人工 gate 的局部夹具证据；没有完整学习者绑定的 D1–D5 逐项 EvidenceCard、未知任务解释和真人接收证据。 |
| 两个非同构 sandbox | **partial_pass_local_only** | 正常/拒绝、改变 document/source/text 的 holdout 及 DURABLE/GATE 可回放工件存在；仍是本地 JSON/确定性夹具，不是学习者提交的完整双 sandbox，也未证明真实运行时。 |
| 原例、回归、失败/迁移 | **partial_pass_local_only** | D0-03/04/05、SOURCE/B-denial、DURABLE 首失败/恢复/回放、GATE unknown-field 与 holdout 均有局部收据；真实模型/供应商/API、真实数据库队列、进程崩溃、生产 RPO/RTO 与未知任务迁移未验证。 |
| QA / REV 独立记录 | **partial_pass** | learner、demo、B-denial、SOURCE、DURABLE、GATE 均有独立 QA/内容审校，并明确范围限制；真人 QA/接收签收仍 pending。 |
| D6 方案取舍 | **partial_fail** | D6保留正向 claim/source/version/tenant/schema 各1/1及负向 claim 0/1，阈值和切换线已写明；样本量、失败分母、质量/成本可迁移证据和真实模型对照不足，负向样本仍是失败记录，不构成通过。 |
| P1 无未关闭项 | **fail** | 学习者逐题绑定、D1–D5完整卡、D6充分分母、未知迁移/真实运行时和真人签收仍开放，不能由局部 QA 关闭。 |
| 真人接收签收 | **pending** | handoff、B-denial与 demo 均为 QA pending/self_signed=false；无真人接收方有据签收或拒收。 |

## 边界与结论

B-denial 在其声明范围内可复验 `SOURCE_SCOPE_DENIED`、生成前停止、无 draft/handoff/external action及非同构 holdout，但 learner 记录明确 `unverified` 且 `must_not_count_as_pass=true`，不计学习者通过。DURABLE/GATE 的状态机与 JSON 回放可作为本地机制证据，不能外推真实进程耐久、并发、回滚、供应商契约、模型质量、生产安全或职业等级。

现有独立 QA/REV 结论在各自范围内可接受（`met_with_limitations`/`reviewed_with_limitations`），不能拼接为 L1 能力。保持 `remain_L0_guided`，L1 review 为 `insufficient_evidence`。

## 进入下一门槛的复验条件

1. 在同一 diagnostic 下逐题绑定 D0-01..05 的学习者回答、实际 demo 输出与可核对断言，重新取得 learner QA/REV。
2. 由学习者提交两个非同构 sandbox，分别包含正常、首失败、回归、holdout、失败解释和迁移边界。
3. 扩充 D6 逐字段样本与失败分母，并明确无真实模型对照及其影响。
4. 完成独立 QA/REV 后的真人接收签收或有据拒收。
5. 复跑 P1，并明确已验证的运行时范围。
