# AI 生成工程师 L0→L1 门槛独立 QA v0.8

- QA 编号：AI-GEN-L0-TO-L1-GATE-QA-v08
- 日期：2026-10-16（Asia/Shanghai）
- 岗位：测试工程师
- 诊断：D0-AI-20261015-001
- 决策：`remain_L0_guided`
- L1 复核：`insufficient_evidence`；未授予 L1、L2 或生产权限

## 复核范围与证据边界

复核了学习者原始 D0 五答、D0-03 QA v02 及隔离回放、learner-demo/B-denial/DURABLE/GATE 证据及其 QA/content 记录、handoff v0.19。学习者原始记录为 `ai-generation-l0-learner-handoff-v08/learner_raw.json`；v0.19 handoff 仍标为 `qa_status=pending`、`human_receipt=pending`、`l0_status=not_assessed`、`d0_status=not_assessed`、`l1_decision=not_granted`。

本轮把学习者本人提交与 QA 回放严格分开。D0-03 QA v02 明确 `learner_execution.available=false`，没有学习者拥有的运行入口或原始回执；其成功案例只能证明 QA 的本地确定性夹具回放。未调用真实模型、供应商 API、云/付费服务、数据库或生产队列，也未证明进程崩溃 RPO/RTO、未知任务迁移、真人签收或职业能力。

## 逐项判断

| 门槛 | 状态 | 依据与缺口 |
|---|---|---|
| D0 五答与实际 D0-03 | `fail` | 五答内容完整且同诊断，但学习者 `self_signed=false`、QA/handoff pending；D0-03 的 A/B、缺源、冲突案例是 QA 回放，不是学习者执行，不能替代本人证据。 |
| D1-D5 | `partial_fail` | 仅有 SOURCE/DURABLE/GATE 的本地机制切片和 v0.19 的 D0-05 manifest；没有完整学习者绑定 EvidenceCard、D1-D5逐项原始回答、未知任务解释及真人接收。 |
| 两个非同构 sandbox | `partial_pass_local_only` | A 正常/B 租户拒绝、改变 key/source/text 的 holdout 与 DURABLE/GATE fixtures 存在；未见学习者提交的两个非同构 sandbox 及其迁移解释。 |
| 失败/回归/holdout/迁移 | `partial_pass_local_only` | D0-03 denial、D0-04 first-failure/recovery、D0-05 baseline/regression/holdout 和 GATE 首错均有本地记录；真实运行时、未知 schema/任务迁移和生产持久性未验证。 |
| QA/REV | `partial_pass` | demo-v02、B-denial、real-learner D0 execution QA 与 content review 均有独立记录且范围受限；它们明确不能扩大为学习者能力结论，且真人 QA/receiver 签收缺失。 |
| D6 trade-off | `partial_fail` | `quality/d6-failure-sample.json` 仅有 source/version/tenant/schema 1/1，claim 否定样本 0/1；失败被保留，但分母不足且没有真实模型对照。 |
| P1 开放项 | `fail` | learner-to-demo 绑定、完整 D1-D5、D6 分母、运行时/迁移范围与真人签收仍未关闭；未发现可据此关闭 P1 的新证据。 |
| 真人签收 | `pending` | handoff v0.19 明确 `human_receipt=pending`；无真人接受或拒绝回执。 |

## 保留的限制与下一步

本地夹具证据可支持机制级的 L0 指导练习记录，不能授 L1。下一门槛需由学习者本人提交五题同诊断 EvidenceCard、两个非同构 sandbox 的失败/回归/holdout/迁移说明，补足 D6 字段分母并保留无真实模型对照的声明；独立 QA/REV 后取得真人接收或拒绝回执，再重跑 P1 并明确已验证的运行时范围。
