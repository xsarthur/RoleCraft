# D0 learner demo v02 repair package

`diagnostic_id`: `D0-AI-20261015-001`

本 v02 保留 v01 与独立 QA/内容审校记录，仅修复证据绑定。目录包含 15 个 JSON 工件（其中 manifest.json 与 learner_raw.json 也纳入清单；manifest 的自引用哈希按 self-reference 规则留空）以及 EvidenceCard.json、repair_record.json 与本报告。所有非 manifest JSON 均写入 diagnostic_id；manifest 逐项记录 bytes、SHA-256 与 diagnostic_id。

D0-03 保留 A 正常草稿和 B 租户拒绝；D0-04 保留工具结果、首失败、recovery_required、恢复后 schema/source/idempotency 核对；D0-05 regression 已补齐 schema_version、source_refs（document_id/source_version/location/hash）、tenant 和 source_version。

执行仍为本地确定性夹具；未使用真实模型、LangGraph、API、DB、云、付费调用或真实用户数据。`qa_status=pending`、`self_signed=false`、`external_action=null`；状态为 L0 guided / D0 not_assessed，不授 L1/L2。
