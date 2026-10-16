# AI 生成工程师 D0-03 本地四场景独立 QA 复核（最终）

- QA 记录：`AI-REAL-LEARNER-D0-EXEC-RUN-QA-20261016-FINAL-001`
- 合同：`AI-REAL-LEARNER-D0-EXEC-20261016-001`
- 结论：`met_with_limitations`
- 复核范围：四个冻结场景各执行 run-1/run-2 的本地、无网络、确定性回放；QA 不冒充学习者本人执行。

## 证据范围

证据根目录为 [`ai-generation-real-learner-d0-execution-run-v01-artifacts`](ai-generation-real-learner-d0-execution-run-v01-artifacts)。每个场景和每个 run 都有独立原始 stdout/stderr、结构输出和 EvidenceCard。卡片逐项记录了命令、Asia/Shanghai 时间、工作目录与 Python 环境、退出码、输入/输出 bytes 与 SHA-256、首失败、停止原因、来源收据、未访问来源、`external_action` 和 `human_receipt_pending`。

冻结来源摘要与完整夹具文件摘要分别保留：合同 `fixture_sha256=5dc9f33...8db5e0` 是 `root.fixture` 规范化对象，夹具文件 SHA-256 为 `f6cc25...f446`；输入快照为 1452 bytes、SHA-256 `9187e3...84976`。对象范围差异已明确记录，不能把两个摘要混称为同一对象。

## 场景判定

| 场景 | 独立复核结果 | 首失败/状态 | 停止与副作用 |
|---|---|---|---|
| A-normal | 通过本地范围 | `draft_ready_for_review`；两条 fact claim 均 bound 到 `doc-A-refund-v2` / `refund-policy-v2` / `fixture://docs/doc-A-refund-v2#rules` / 正文 hash `4a1fa4...1361d` | 订单状态和客户身份保留 unknown；handoff=QA pending；`external_action=null` |
| B-tenant-denied | 通过本地范围 | 首失败 `SOURCE_SCOPE_DENIED` | 生成前停；`draft=null`、handoff=null、`external_action=null`；`doc-B-private-v1` 正文未访问/缓存/摘要/进入上下文 |
| source-missing | 通过本地范围 | 首失败 `SOURCE_MISSING` | 生成前停；`draft=null`、handoff=null、`external_action=null`；保留 `required source unavailable`，未换源 |
| source-conflict | 通过本地范围 | 首失败 `SOURCE_VERSION_MISMATCH`；冲突键 `source_version`、`content_hash` | 生成前停；`draft=null`、handoff=null、`external_action=null`；期望/观察版本与 hash 已收据化，冲突替代来源未访问 |

对 `sites/rolecraft/team/ai-generation-real-learner-d0-execution-run-v01-artifacts` 全部生成收据、输出、卡片、日志、环境、manifest、comparison 和 runner 文件扫描，未发现 B 私有正文标记；输入快照本身也只含 A 授权元数据，未含 B 正文。B 拒绝卡片只保留权限拒绝元数据。

## run-1/run-2 与修复回归

最终 `run-comparison.json` 显示四个场景的 raw output 均 `byte_equal=true`，每个场景首失败码一致，且两次 `external_action` 均为 `null`。此前复核发现输出携带 `run_id` 导致 raw byte 不一致，已保留在 [`qa-pre-fix`](ai-generation-real-learner-d0-execution-run-v01-qa-pre-fix.json)；责任工程师移除该非语义字段后从同一冻结输入重跑，四场景逐字节和 SHA-256 均一致。原始失败记录没有被覆盖。

## 限定与未验证项

本轮工件由本地隔离执行器生成，manifest 和每张 EvidenceCard 均保持 `learner_execution=false`、`human_receipt_pending=true`。因此它不能代替学习者本人执行、真人审批/签收或职业能力证据，也不授予 D0/L1/L2。真实供应商来源 API、真实模型引用忠实度、生产权限、缓存/并发/进程恢复和未知任务迁移仍未验证。source-conflict 使用期望版本与期望 content hash 注入冲突，证明版本/hash 冲突的首失败停线；实际冲突正文没有被访问。

下一步如进入学习者验收，应由学习者本人按冻结合同提交实际入口和原始 stdout/stderr，再由测试工程师独立重放原例并保留本轮首失败与修复复验链。
