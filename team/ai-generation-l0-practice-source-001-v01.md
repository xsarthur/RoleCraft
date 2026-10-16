# AI生成工程师 L0 实操：SOURCE-001（v01）

- 练习：`AI-PRACTICE-SOURCE-001` / `v0.1`
- 冻结 practice pack SHA-256：`b1cb993bfb6310f5f872c23980ad60a8d6dbc91c64462bbf253302328ffa0f1a`；fixture `F-AI-SOURCE-CLAIM-v1` / `5dc9f33ed3972dbff5118bc6977a66ccbd376bc6fcc54f15c9b1e26fda8db5e0`
- 范围：本地确定性隔离目录；网络、真实模型、LangGraph/API、云、付费调用、真实用户数据和外部动作均关闭。
- 产物目录：`sites/rolecraft/team/ai-generation-l0-practice-source-001/`

## 正常与边界
正常输出为 `draft_ready_for_review`，两条 A/v2 事实 claim 均携带 `document_id/source_version/location/hash`，工具收据逐字一致；未说明条件标为 unknown。留出替换 `doc-A-refund-v2 → doc-A-shipping-v3` 后，`document_id/source_version/text` 三个 changed_keys 触发动态绑定，新 hash 与人工复核标记保留。

## 首失败与停止
保留四类原始首失败：`SOURCE_VERSION_MISMATCH`、`SOURCE_HASH_MISMATCH`、`UNBOUND_CLAIM`、`SOURCE_SCOPE_DENIED`。每类失败首个违反点停止，`draft=null`、`handoff=null`、`external_action=null`。

## 重放与交接
`run-1`/`run-2` 输出字节和 SHA-256 相等；manifest、claim matrix、tool receipts、final output 均有哈希；复验命令为 `python3 sites/rolecraft/team/ai-generation-l0-practice-source-001/replay_verify.py`，结果为 `pass`。修复差异见 `repair_diff.patch`。EvidenceCard 见 `evidence-card.json`，已交 QA，状态 `pending`，学习者不自签收。

## 决定和限制
本次为 `pass_with_limitations` / `met_within_scope`，仅证明本地夹具内来源绑定与停线逻辑；不授予 D0、L1、L2。真实供应商 API、缓存与并发、真实进程恢复、RPO/RTO、真实模型忠实度、真人审批、接收方签收和非作者未知迁移仍未验证。
