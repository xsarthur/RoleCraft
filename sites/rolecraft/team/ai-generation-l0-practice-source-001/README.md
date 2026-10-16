# AI-PRACTICE-SOURCE-001 本地 L0 实操

- 练习：`AI-PRACTICE-SOURCE-001` / `v0.1`
- 冻结 practice pack SHA-256：`b1cb993bfb6310f5f872c23980ad60a8d6dbc91c64462bbf253302328ffa0f1a`
- fixture：`F-AI-SOURCE-CLAIM-v1`，规范化 SHA-256：`5dc9f33ed3972dbff5118bc6977a66ccbd376bc6fcc54f15c9b1e26fda8db5e0`
- 离线 Python 确定性渲染；仅读本地夹具；无真实模型、LangGraph、API、云、付费服务、网络、真实用户数据或外部动作。

正常输出为 `draft_ready_for_review`；两条事实 claim 绑定 A/v2 来源四元组和正文 hash，未说明条件列为 unknown。四个首失败保留于 `first_failure/`：`SOURCE_VERSION_MISMATCH`、`SOURCE_HASH_MISMATCH`、`UNBOUND_CLAIM`、`SOURCE_SCOPE_DENIED`；各自 `draft=null`、`handoff=null`、`external_action=null`。

`run-1/` 与 `run-2/` 输出字节和 SHA-256 相等；holdout 替换 `document_id/source_version/text` 后动态绑定新 hash 并保留人工复核标记。EvidenceCard 已交 QA，学习者不自签收。决定为 `pass_with_limitations`（仅本地范围），不授予 D0/L1/L2。真实供应商 API、缓存/并发、进程恢复、真实模型忠实度、真人审批、接收方签收和非作者未知迁移未验证。
