# AI D0 学习者 B-denial 实作独立内容审校 v01

- 审校 ID：`AI-D0-LEARNER-B-DENIAL-CONTENT-REVIEW-20261015-01`
- 目标岗位：`AI`（AI 生成工程师）
- 诊断：`D0-AI-20261015-001`
- 审校结论：`reviewed_with_limitations`
- 学习者状态：`L0_guided` / `not_assessed`；不授等级或生产权限
- 审校范围：只读核对学习者 B-denial 原始包、相关独立 QA/门槛记录中的 learner/QA 边界、租户与来源 scope、首失败/holdout 语义及限制措辞。

## 证据与边界判断

学习者包 `ai-generation-d0-learner-b-denial-v01/` 明确记录 A 基线、B 私有文档、错误租户请求及非同构 holdout；`learner_raw.json` 标为 `qa_status=pending`、`self_signed=false`、`decision=not_assessed`。这正确保留了学习者原始执行与独立验证的角色分离。学习者报告所述 `TENANT_SCOPE_DENIED`、生成前停止、空 `answer/source_refs/draft_handoff/external_action` 与 `recovery_required/hold_for_human_review` 能描述本地夹具观察，但不能单独证明能力通过。

独立 QA `ai-generation-l0-b-denial-transfer-qa-v01` 在其 QA 范围内复跑 A 正常、B 私有、actor A/requested tenant B 错误租户及非同构 `doc-B-private-v9`，确认双次重放字节一致、manifest 哈希与 dynamic binding。门槛 QA v04/v05 同时明确：B-denial QA 不能替代同一学习者五项 D0 证据，`B_tenant_rejection` 仍为 `unverified` / `must_not_count_as_pass`。本审校接受该边界，不把 QA 通过改写为 learner pass，也不把独立夹具证据并入学习者等级证据。

## 专项核对

| 项目 | 审校结论 |
|---|---|
| Learner 与 QA 边界 | 表述清楚：学习者原始包待 QA，QA 使用独立命令和独立记录；`self_signed=false`。仍缺同一诊断下把五项 D0 原答逐项绑定到 B-denial 实际输出的完整 EvidenceCard。 |
| 租户/来源 scope | A 文档带 tenant、document_id、source_version、location、hash；B 私有和错误租户在生成前拒绝，来源引用为空。夹具只实现字典/确定性授权检查，不是生产 ACL、供应商来源 API 或跨租户隔离证明。 |
| 首失败 | 学习者记录 B-private 为首失败且下游不执行；错误租户与 holdout 也保留停止结果。需保持首次失败原件，不能用 QA 重跑或后续修复覆盖学习者首次记录。 |
| Holdout | `doc-B-private-v9` 改变 document_id/source_version/text，QA 确认动态拒绝；学习者 holdout 混合 A 草稿与不可读 B 文档并进入人工 hold。它支持本地非同构约束检查，不证明未知任务迁移、恶意输入覆盖或生产并发恢复。 |
| 限制措辞 | 报告正确声明未调用真实模型/API/权限系统/数据库/云/付费服务/真实用户数据，未授 L1/L2。应继续明确“本地确定性夹具/有限机制演示”，避免写成真实授权安全、保密、生产恢复或职业能力。 |

## 发现与后续

1. **P1（证据绑定）**：B-denial 包自身是学习者原始实作，但门槛记录仍不承认其为同一学习者五项 D0 的完整证据。补齐同一 `diagnostic_id` 的逐项映射和完整 EvidenceCard 后，重新由 QA/内容审校复核；不得回写或删除现有首失败记录。
2. **P2（夹具范围）**：补充真实运行时前，所有断言应标为本地字典/JSON fixture；生产 ACL、供应商来源、日志泄漏、并发、进程崩溃/RPO-RTO、真人接收签收保持 `unverified`。
3. **P2（holdout 语义）**：将 `recovery_required`/`hold_for_human_review` 与普通 `SOURCE_SCOPE_DENIED` 的状态合同、停止条件和 handoff 接收责任分别定义，避免把人工 hold 当作已恢复或已授权。

## 结论

本包在本地确定性夹具范围内对租户拒绝、来源 scope、首失败保留和非同构 holdout 的叙述自洽；独立 QA 的限定结论可作为 QA 证据保存。它不构成学习者能力认证、L1/L2 授予、真实权限系统安全或生产行为证明。整体保持 `reviewed_with_limitations`、`L0_guided`、`not_assessed`；历史报告与失败记录保留。
