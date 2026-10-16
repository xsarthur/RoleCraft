# AI 生成工程师 L0→L1 B 租户拒绝迁移记录 v0.1

- 记录：`AI-L0-B-DENIAL-TRANSFER-20261015-001`
- 来源：`AI-PRACTICE-SOURCE-001` / v0.1；承接 D0 v04 租户边界合同
- 结果：`pass_with_limitations`（仅本地确定性夹具）；QA handoff `pending`；`self_signed=false`；L1/L2 `not_granted`

## 实操证据

使用本地 `retrieve_authorized_doc(actor_tenant, requested_tenant, document_id)`。A/`doc-A-refund-v2` 正常收据带正文 SHA-256、版本、位置和租户，生成一个 `draft_ready_for_review` 草稿。请求 B 私有 `doc-B-private-v1`，以及 actor A 代表错误 requested tenant B 的同一文档，均在生成前得到 `SOURCE_SCOPE_DENIED`；两条 denial receipt 的 `draft`、`handoff`、`external_action` 均为 `null`。

留出输入改用非同构的 `doc-B-private-v9`（`private-v9`、全新正文），只改变 `document_id/source_version/text`，仍动态得到 `SOURCE_SCOPE_DENIED`。因此拒绝绑定于租户、可读权限和请求上下文，而不是固定文档字符串。

`runs/run-1/output.json` 与 `runs/run-2/output.json` 由同一冻结夹具重放，字节与 SHA-256 相同。首失败在 `first-failure/` 保留，来源收据在 `receipts/denials.json`，输入变化及输出在 `holdout/changed-keys.json`，文件清单与哈希在 `manifest.json`，EvidenceCard 为 `evidence-card.json`。

## 边界

该结果只证明本地确定性租户拒绝和迁移留出路径。没有调用真实供应商来源 API、真实模型、云、LangGraph 或生产权限系统，未验证并发、进程恢复、真实数据保密、真人审批和接收方签收。内容审校与 QA 尚待独立完成，学习者不自签收。
