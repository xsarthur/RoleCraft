# D0 learner demo 独立内容审校 v02

- 审校对象：`/private/tmp/ai-demo-v02/`（D0 learner demo v02 repair package）
- 诊断 ID：`D0-AI-20261015-001`
- 审校范围：manifest 自包含/诊断绑定、D0-04 恢复语义、D0-05 schema/source 回归字段、限制措辞
- 审校结论：`reviewed_with_limitations`
- 能力等级：不授予；`learner_raw.json` 仍为 `L0_guided` / `not_assessed`

## 复核结果

1. **Manifest 与诊断绑定**：manifest `artifact_count=15` 且 `files` 列出 15 个 JSON 工件，包括 `manifest.json` 自身；自引用条目明确使用 `self_hash=intentionally_unset_due_to_self_reference`，并将自身 bytes/SHA-256 留空，规则透明但不能对 manifest 自身做普通哈希闭环。其余 14 个 JSON 的记录字节数和 SHA-256 与当前文件逐一匹配；每个非 manifest JSON 都含诊断 ID `D0-AI-20261015-001`，manifest、repair_record、EvidenceCard 与 learner_raw 也绑定同一 ID。`artifact_count` 与清单长度一致，v01 的“清单遗漏/数量表述”问题已修复。
2. **D0-04 恢复语义**：`DURABLE-002-v04-first-failure.json` 明确 `checkpoint_write_failed`、`first_failure=true`、`state=recovery_required`；`recovery.json` 指向同一工具工件，保留 `D0-04:tool:1` 幂等键、schema、租户 A、来源版本与 `source_refs`，状态为 `recovered`；`final.json` 保留同一来源引用并落到 `draft_ready_for_review`。语义支持“本地 JSON 替身中的失败—重放—恢复—可审阅结果”链路，不支持真实进程崩溃、持久数据库耐久性、RPO/RTO 或生产恢复保证。
3. **D0-05 schema/source 回归字段**：`GATE-003-v06-regression.json` 已具备 `schema_checked=true`、`schema_version=ai-generation-d0-output-v3`、`source_refs`（document_id/hash/location/source_version）、顶层 `source_version`、租户、恢复状态，补齐 v01 指出的缺失证据。baseline、首失败和 holdout 是约束/停止决策夹具；它们未伪装成已生成答案，也不需要在无输出状态下提供完整来源引用。该集合可复核单约束变化与回归字段，但不能替代完整生成链路或真实外部契约测试。
4. **限制与等级措辞**：v02 正文清楚写明本地确定性夹具、未使用真实模型/LangGraph/API/DB/云/付费调用/真实用户数据，`qa_status=pending`、`self_signed=false`、`external_action=null`，并保留 `L0 guided / D0 not_assessed`，没有把修复包或 manifest 完整性写成模型能力、生产安全、专家审核、学习迁移或等级认证。限制措辞与工件状态一致。

## 保留限制

- manifest 自身只能按显式自引用规则列入，不能提供自哈希/自字节闭环；这是可审计的约定，不是密码学完整包签名。
- `SOURCE-001.json` 注册文档位置与版本，但不单独携带来源内容哈希；输出中的来源哈希在同一批工件间一致，仍不等于对外部原文的独立内容校验。
- `qa_status` 仍为 pending；本审校不替代测试工程师的运行/重生成验收，也不证明真实模型、外部接口、数据库、崩溃恢复、生产权限、真人专家审核或学习效果。

## 结论

v02 已解决 v01 指出的 manifest 清单范围、逐工件诊断绑定和 D0-05 regression 字段缺口；D0-04 恢复链与限制叙述在本地夹具范围内自洽。结论为 `reviewed_with_limitations`，不授予学习者等级，不改变任何既有产品门槛或 QA 结论。
