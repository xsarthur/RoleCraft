# AI生成工程师 L0 学习者证据独立 QA v0.4

- QA ID: `AI-GEN-L0-LEARNER-EVIDENCE-QA-v04`
- 日期：2026-10-15（Asia/Shanghai）
- 角色：测试工程师
- 范围：独立只读复核 v04 learner evidence、D0/D6/U 绑定、demo-v02 与 B-denial QA、manifest 工件、角色区分和状态字段；不代学员执行训练，不授 L0/L1/L2。

## 结论

`met_with_limitations`（仅限本地 deterministic fixture 和已绑定 QA 工件）。v04 learner JSON、manifest 与 U 工件均可解析，manifest 声明的 9 个 path 的 bytes/SHA-256 全部与当前文件重算一致；diagnostic、fixture hash 和 `external_action=null` 一致。learner 原始记录明确 `qa_status=pending`、`self_signed=false`，并把 demo/B-denial 评审绑定为独立 QA，角色与执行主体区分清楚。

D0 的 demo-v02 QA 为 `met_with_limitations`，不授等级；B-denial QA 为 `met_with_limitations`，其拒绝案例在 QA 工件中有 `SOURCE_SCOPE_DENIED`、停止于 draft 之前、无外部动作，但 handoff 仍 pending。v04 learner 自身仍将 B 拒绝标记为 `unverified`，因此不把它误计为 learner 通过。

U-AI-L0-001 的 baseline→first_failure→regression→holdout 顺序、`recovery_required`/停止决策、回归状态、同幂等键及 input/output hash 与 execution log 一致；只证明 JSON/fixture 级回放。D6 质量工件逐字段计数可读：source/version/tenant/schema 为 1/1，claim 为 0/1，失败样本说明 B-denial 负例缺 claim。该失败应作为负例拒绝/质量缺口保留，不能被改写为全字段 100%。当前没有 real-model control。

## 复核记录

- Manifest 9 项逐项重算：`learner_raw.json` 3840 bytes；execution_log 572；baseline 145；first_failure 225；regression 203；holdout 170；demo QA 5803；B-denial QA 1864；D6 sample 657，全部 bytes/SHA 匹配。
- canonical fixture hash `5dc9f33e3972dbff5118bc6977a66ccbd376bc6fcc54f15c9b1e26fda8db5e0` 与 learner/manifest 一致。
- execution log 五次本地耗时 `[1.71,1.84,1.76,1.89,1.80] ms`，p95 `1.89 ms`，低于 2000 ms；network=false、paid_api=false、fixture_only=true。
- D6 阈值声明为正向字段全 100%，未知租户/版本即停止升级；当前正向四字段达 100%，claim 负样本为 0/1，且无真实模型对照。应保留该失败样本和阈值语义，不能据此声称真实模型质量。
- 控制状态：`qa_status=pending`、`self_signed=false`、`human_receipt=pending`、`l1_decision=not_granted`、`l2_decision=not_granted`；没有 external action。

## 限制与后续

真实进程崩溃恢复、生产 RPO/RTO、外部 API/供应商、真实模型质量、未知任务迁移、真人审批与接收方签收均未验证。B-denial 虽有独立 QA 记录，learner 证据仍应保持 `unverified`，待在同 diagnostic 下完成可重放的学习者拒绝收据后再更新。若将 D6 claim 作为正向字段，应补充明确样本定义并重新计算；在此之前维持 `met_with_limitations`，不授任何等级。
