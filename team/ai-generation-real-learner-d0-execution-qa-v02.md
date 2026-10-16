# AI生成工程师 D0-03 本地确定性 QA 执行报告 v0.2

- QA record: `AI-REAL-LEARNER-D0-EXEC-QA-20261016-002`
- Contract: `AI-REAL-LEARNER-D0-EXEC-20261016-001`
- Decision: **`met_with_limitations`**
- Scope: D0-03 本地隔离回放；D0/L1/L2 均未授，`human_receipt_pending=true`。

## 执行边界

本轮是测试工程师独立 QA 回放，不冒充学习者本人执行。原始学习者记录未提供实际入口、命令或本人 stdout/stderr，因此学习者执行状态仍 pending；QA 证据仅证明冻结夹具在本地确定性回放下的行为。网络、真实模型/API、云、付费服务、真实用户数据和外部动作均关闭。

## 场景结果

| case | run-1/run-2 | 首失败/结果 | 停止收据 |
|---|---|---|---|
| `A-normal` | True / SHA 相等 | `draft_ready_for_review` | draft=draft_ready_for_review; handoff=QA pending; external_action=null |
| `B-tenant-denied` | True / SHA 相等 | `SOURCE_SCOPE_DENIED` | draft=null; handoff=null; external_action=null |
| `source-missing` | True / SHA 相等 | `SOURCE_MISSING` | draft=null; handoff=null; external_action=null |
| `source-conflict` | True / SHA 相等 | `SOURCE_VERSION_MISMATCH` | draft=null; handoff=null; external_action=null |

A-normal 两条 claim 均绑定 `doc-A-refund-v2` / `refund-policy-v2` / `fixture://docs/doc-A-refund-v2#rules` 与正文 hash；订单状态和客户身份保留 unknown。B 场景首失败为 `SOURCE_SCOPE_DENIED`，B 私有正文未出现在 QA 输出或收据。来源缺失首失败为 `SOURCE_MISSING`；来源冲突首失败为 `SOURCE_VERSION_MISMATCH`；三者均在 draft 前停止。

## run-1 / run-2 与 holdout

四场景 JSON 输出逐字节一致，SHA 已写入 JSON 和 `SHA256SUMS`。holdout 仅改变 `document_id/source_version/text`，动态绑定新 hash 且保留人工复核标记；不据此授予等级。

## 限制与后续

未验证学习者本人执行、真实供应商来源 API、真实模型引用忠实度、缓存/并发/恢复、生产权限、真人审批/签收、迁移能力。需学习者按合同填写真实入口并提交原始 receipts 后，QA 才能复核“本人执行”证据。

隔离工件：`sites/rolecraft/team/ai-generation-real-learner-d0-execution-qa-v02-artifacts`
