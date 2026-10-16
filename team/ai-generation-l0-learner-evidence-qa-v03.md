# AI生成工程师 L0 学习者证据独立 QA v0.3

- QA ID: `AI-GEN-L0-LEARNER-EVIDENCE-QA-v03`
- 日期: 2026-10-15（Asia/Shanghai）
- 范围：只读复核 `ai-generation-l0-learner-evidence-v03` 的 D0/E/U 证据、版本绑定、D6 收据与控制状态；不代学员执行训练，不授 L1/L2，不修改作者产物。

## 结论

`met_with_limitations`（限定本地 fixture 证据）。v03 的 JSON、manifest、U 工件可解析，canonical fixture 重算一致；D6 给出 CPU/p95 数值且在门槛内；U-AI-L0-001 的 baseline→首失败→回归→holdout 状态和停止决策一致，所有 external_action 为 `null`。B 租户拒绝路径明确为 `unverified`，未计为通过。未验证真实进程崩溃恢复、真实模型/API、生产 RPO/RTO、真人审阅或未知任务迁移，因此不授等级，L1/L2 继续 `not_granted`。

## 复核证据

- canonical fixture `F-AI-SOURCE-CLAIM-v1` / `doc-A-refund-v1`：对 `frozen_input.json` 的 UTF-8 sorted-key compact JSON fixture 重算 SHA-256 为 `5dc9f33e3972dbff5118bc6977a66ccbd376bc6fcc54f15c9b1e26fda8db5e0`；与 learner_raw、manifest、SOURCE-001 一致。
- D6 execution log：5 次本地 runs `[1.71,1.84,1.76,1.89,1.80] ms`，记录 CPU `1.84 ms`、p95 `1.89 ms`；p95 ≤ 2 s，fixture-only、network=false、paid_api=false。
- U 工件均可 JSON 解析；首失败为 `recovery_required` 且停止下游，回归恢复至 `draft_ready_for_review` 并保持同幂等键，holdout 超重试预算停止。四个工件的 input/output 哈希与 execution_log 一致。
- manifest 逐项核对 path、bytes、SHA-256：learner_raw 3492 bytes；execution_log 572；baseline 145；first_failure 225；regression 203；holdout 170，均与实际文件一致。
- 控制字段：`qa_status=pending`、`self_signed=false`、`external_action=null`、`l1_decision=not_granted`、`l2_decision=not_granted`。

## 限制与后续

B 租户拒绝未执行，不能作为通过证据；需在后续独立测试中实际运行隔离拒绝路径。D6 质量声明仅限给定 deterministic fixture，不能推出真实模型质量。真实进程恢复、外部 API、生产 RPO/RTO、真人审批/签收和非作者未知任务迁移仍需对应岗位证据。
