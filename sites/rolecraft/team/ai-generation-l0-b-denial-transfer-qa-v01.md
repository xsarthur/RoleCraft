# QA 独立复核：AI L0→L1 B 租户拒绝迁移 v0.1

- QA记录：`AI-L0-B-DENIAL-TRANSFER-QA-20261015-001`
- 复核范围：A 正常基线、B 私有/错误租户拒绝、首失败停止收据、非同构 holdout 动态拒绝、run-1/run-2 重放、manifest/EvidenceCard/README、handoff 状态。
- 复核命令：`python3 sites/rolecraft/team/ai-generation-l0-b-denial-transfer-v01/implementation/run.py`
- 执行结果：命令成功；返回 `denials=[SOURCE_SCOPE_DENIED,SOURCE_SCOPE_DENIED]`、holdout `SOURCE_SCOPE_DENIED`，正常基线 SHA-256 `dec9bcd157a6b007d5f56ac71750f281877aba5ddafafee082c973df891e7bee`。

## 证据核对

- A/`doc-A-refund-v2` 基线输出为 `draft_ready_for_review`，租户 A，来源四元组含 document_id、source_version、location 和正文 hash；输出 948 bytes。
- B 私有文档和 actor A 请求 tenant B 均在生成前返回 `SOURCE_SCOPE_DENIED`；首失败、停止及 denial receipt 的 `draft`、`handoff`、`external_action` 均为 `null`，工具收据为 rejected/side_effect none。
- 非同构留出 `doc-B-private-v9` 实际改变 `document_id/source_version/text`，仍动态返回 `SOURCE_SCOPE_DENIED`，`dynamic_binding_verified=true`，不是固定文档字符串白名单。
- `run-1` 与 `run-2` 均 948 bytes，SHA-256 `dec9bcd157a6b007d5f56ac71750f281877aba5ddafafee082c973df891e7bee`，字节一致；manifest 声明的 8 个文件 bytes/hash 全部与实际一致。manifest SHA-256 为 `14c3b4b5216d1b920d02762f2e942ec93824989ddecb2d185ac9d509acba71b3`，EvidenceCard SHA-256 为 `ea0d55cab665894471ee37fcf53292bee7cedf138f1bb400e296d8c01e3210d1`。
- handoff 收件人为 QA、状态 `pending`、`self_signed=false`；L1/L2 均 `not_granted`。环境明确 network disabled、real_model/cloud/paid_api/real_user_data=false、`external_action=null`。

## 决定

`met_with_limitations`（本地范围）。证据支持本地确定性租户拒绝、生成前停线、动态非同构拒绝、确定性重放、来源绑定基线和未自签收交接。不得据此授予 L1/L2，也不得推断真实权限系统、真实模型/API、并发恢复、真人审批或生产行为已验证。

## 保留未验证项

真实权限/供应商来源 API、真实模型、并发与进程恢复、真实数据保密、真人审批及接收方签收、生产网络和外部动作。
