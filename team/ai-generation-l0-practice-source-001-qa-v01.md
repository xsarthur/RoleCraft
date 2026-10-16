# QA 独立复核：AI-PRACTICE-SOURCE-001（v0.1）

- QA记录：`AI-L0-SOURCE-001-QA-20261015-001`
- 复核范围：本地隔离夹具、manifest/evidence-card/fixture/practice-pack 哈希、四类首失败与停止、run-1/run-2、holdout 动态绑定、交接状态及 external_action。
- 复核命令：`python3 sites/rolecraft/team/ai-generation-l0-practice-source-001/replay_verify.py`
- 执行结果：`replay=pass`；输出 975 bytes，SHA-256 `9a1ba7597364b5d19a019f1f31263bd9feef28926786cb7c90a133d3be614b7d`。

## 证据核对

- manifest 声明的 practice pack、fixture、claim matrix、tool receipts、repair diff、replay verifier、final output 哈希与实际文件一致；manifest 自身 SHA-256 为 `ef09d2e2d83276b9efa6599c5001584228f81378bf0676a49879406fe44a3619`。
- `evidence-card.json` SHA-256 `377f16848f0ef36cc2449349014d75c146d065d32a8fc6ae032eefcc583c4e07`，与源记录一致；四条正常 claim 均有 A/v2 的 document_id、source_version、location、内容 hash，工具收据逐字对应。
- `run-1/run-2/deterministic_output.json` 均 975 bytes、SHA-256 `9a1ba7597364b5d19a019f1f31263bd9feef28926786cb7c90a133d3be614b7d`，字节一致。
- holdout `U-AI-SOURCE-001-H` 实际改变 `document_id/source_version/text` 三个键，`dynamic_binding_verified=true`，新 hash `3d4e99c382a2a0c4ceacb0f19890bd65df4728dc7dd2ab77b71cbed47b37d0f1`，人工复核标记保留。
- 四类注入均在 draft 生成前停止，首失败分别为 `SOURCE_VERSION_MISMATCH`、`SOURCE_HASH_MISMATCH`、`UNBOUND_CLAIM`、`SOURCE_SCOPE_DENIED`；每类 `draft=null`、`handoff=null`、`external_action=null`。
- 交接收件人为 QA、状态 `pending`，`handoff_not_self_signed=true`；L1/L2 均 `not_granted`。
- manifest/environment 与 practice pack 一致：network disabled、real_model/cloud/paid_api/real_user_data=false、external_action=null。

## 决定

`met_with_limitations`（本地范围）。证据足以支持本地确定性来源绑定、版本/hash 校验、租户范围拒绝、首失败停线、确定性重放和未签收交接要求。不得据此授予 D0、L1 或 L2，也不得推断真实模型、供应商来源 API 或生产行为已验证。

## 保留未验证项

真实供应商/API 与模型引用忠实度；缓存、并发、真实进程恢复及 RPO/RTO；真人审批和接收方签收；非作者未知任务迁移；生产网络、外部动作、云服务与真实用户数据。
