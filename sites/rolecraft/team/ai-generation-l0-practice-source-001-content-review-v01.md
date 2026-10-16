# 内容审校：AI 生成工程师 L0 SOURCE-001（v01）

- 审校身份：内容审校员（REV）
- 审校范围：`ai-generation-l0-practice-source-001-v01.md/.json`、冻结练习包 v0.2、`ai-generation-l0-practice-source-001/` 全部提交物
- 结论：`reviewed_with_limitations`
- 审校日期：2026-10-15（Asia/Shanghai）

## 核对结果

1. **来源四元组与租户边界：通过（本地范围）**。正常输出的两条 fact claim 均绑定 `document_id=doc-A-refund-v2`、`source_version=refund-policy-v2`、`location=fixture://docs/doc-A-refund-v2#rules` 与内容 `hash=4a1f…1361d`；工具收据中的同一字段逐字一致。请求租户与执行租户均为 A，B 租户文档 `allow_read=false`，并保留 `SOURCE_SCOPE_DENIED` 首失败。四元组之外的 tenant 权限约束也被显式保留。
2. **版本/hash/动态替换：通过（本地范围）**。v1/v2 错配、正文篡改旧 hash、未绑定 claim 均在生成前停止；holdout 将 `doc-A-refund-v2` 替换为 `doc-A-shipping-v3`，三项 changed keys 触发新 hash 绑定并保留人工复核标记，未见固定字符串白名单式结论。
3. **机制论证：通过但仅证明夹具守卫**。练习目的、停止条件、首失败与 `draft=null/handoff=null/external_action=null` 的因果链相互一致；claim matrix、tool receipt、deterministic output、first-failure 文件和 replay verifier 共同支撑“先核来源再出草稿”的机制。`python3 .../replay_verify.py` 实际返回 `replay: pass`，run-1/run-2 字节与 SHA 一致。
4. **EvidenceCard：完整且未自签收**。卡片包含输入 fixture 标识/hash、环境与命令、正常结果、四类失败收据、holdout changed keys、repair diff、重放字节/hash、交接对象与 residual unknowns；`self_signoff=forbidden_pending_QA_REV`、交接状态 `pending` 与学习者不自签收相符。QA 独立结论仍需其自身报告，不由本审校代替。
5. **限制措辞：通过**。正文和 EvidenceCard 明确声明网络/真实模型/LangGraph/API/云/付费服务/真实用户数据/外部动作均关闭，并将供应商 API、真实模型忠实度、缓存并发、进程恢复/RPO-RTO、真人审批、接收方签收及非作者未知迁移列为未验证；未把本地确定性替身表述成生产能力，也未授予 D0/L1/L2。

## 未验证与边界

- 未验证真实供应商来源 API、真实模型生成与引用忠实度、生产缓存/并发一致性、进程崩溃恢复及 RPO/RTO。
- 未验证真人审批、接收方签收、真实数据库/队列/LangGraph 集成，亦未验证学习者在非作者未知任务中的迁移能力。
- `handoff` 仍为 QA pending；本审校不能把内容关系核对结论升级为独立 QA 通过、岗位等级或生产上线证据。

未发现需要教材作者返修的来源绑定、机制解释或限制夸大问题。在上述限定范围内，内容审校结论为 `reviewed_with_limitations`。
