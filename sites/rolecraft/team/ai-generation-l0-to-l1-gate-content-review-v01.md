# AI 生成工程师 L0→L1 门槛内容复核 v0.1

- 复核 ID：`AI-L0-L1-GATE-CONTENT-20261015-01`
- 复核日期：2026-10-15（Asia/Shanghai）
- 责任岗位：内容审校员（独立复核，不授予等级）
- 复核范围：进阶方案 v0.3、D0 v0.4 内容审校、SOURCE-001 内容审校、DURABLE-002 v04 内容审校、GATE-003 v06 内容审校及当前 EvidenceCard/learner_raw
- 内容复核结论：`reviewed_with_limitations`
- L0→L1 review 准入建议：`not_ready_hold_L0_guided`
- 等级决定：`not_granted`（本报告不授予等级）

## 结论

既有资料能够支持“本地确定性夹具对来源绑定、租户拒绝、checkpoint/回放、schema unknown-field 和单约束迁移的有限机制示范”，不能支持学习者已经满足 L0→L1 review 的内容门槛。建议 PM 维持 `L0_guided`，补齐学习者原始回答、可归属于真实学习者的两套非同构 sandbox 作品、E-AI-L0-003 方案取舍证据、U-AI-L0-001 留出迁移及独立 QA/接收签收后，再申请 L1 review。

## 已支持的内容判断

| 维度 | 支持范围 | 边界 |
| --- | --- | --- |
| 机制 | SOURCE-001 对来源四元组、版本/hash、租户拒绝、生成前停止和 holdout 动态绑定的机制关系自洽；DURABLE-002 v04 对原子 JSON checkpoint、callback 去重、从工具 checkpoint replay 和首失败保留的关系自洽；GATE-003 v06 对 schema unknown-field 在人工 gate 前停止、迁移状态和 hold/approval 收据的关系自洽。 | 均为本地 fixture/文件状态机，不能推出真实 LangGraph、真实模型、生产数据库、并发、RPO/RTO 或真人审批能力。 |
| 来源/版本 | SOURCE-001 的 claim 绑定 document_id/source_version/location/hash，DURABLE/GATE 的 manifest、README 和 EvidenceCard 哈希关系在既有内容审校中可审计。 | 没有真实供应商/API/框架运行版本证据；D0 v04 已指出外部 claim_type、课程/API 段落和包版本绑定仍不足。 |
| 限制边界 | 各版本明确 `network disabled`、`real_model=false`、`paid_api=false`、`external_action=null`；GATE 的 `approve_for_review_only`、`handoff pending` 和 L1/L2 `not_granted` 没有被改写成真人审批或生产状态。 | 这些限制措辞只证明作者声明和工件语义一致，不证明学习者理解、迁移或岗位交付。 |
| 失败机制 | 四类 SOURCE 首失败、DURABLE 四类首失败、GATE 五类首失败均被保留；既有审校未发现机制解释越界。 | 本轮不替代 QA 重放，也不把历史代理/夹具报告当学习者能力证据。 |

## 学习者产物与 EvidenceCard 真实性检查

1. SOURCE-001 EvidenceCard 标明 owner 为“AI生成工程师（学习者）”，但卡片目录没有 `learner_raw.json`；EvidenceCard 的 `training_status=completed_pending_independent_review`、handoff `pending`、`self_signoff=forbidden_pending_QA_REV`。因此可审校内容关系，不能独立确认原始回答来自学习者或由学习者在未逐步提示下完成。
2. DURABLE-002 v04 只有三条 `raw_observations`，`learner_id=local-sandbox-learner`；没有姓名/稳定学习者身份、原始回答、提示次数、执行记录或非作者冻结迁移计划。其 EvidenceCard 仍为 `pending_QA`、`self_signed=false`。这是一张夹具证据卡，不足以证明 D1–D5 的真实学习者作品。
3. GATE-003 v06 的 `learner_raw.json` 只有“按原 v2 输入独立生成 run-1/run-2，未复用上次输出”一句说明；没有逐题机制解释、首次失败分析、权限/来源判断或迁移指标。EvidenceCard 的 `handoff_qa=pending`、`review_status=pending_QA`、`self_signed=false`，故不能视为独立签收或真人审批。
4. 三项练习均使用 `local-sandbox-learner`/本地 fixture 形态，且当前卡片未绑定同一 diagnostic_id 下的“五项 D0 原始回答”。进阶方案要求的 D1–D5 初步证据、E-AI-L0-003、U-AI-L0-001 和两套非同构 sandbox 仍未形成可复核的学习者证据链。

## 门槛逐项判断

| L0→L1 条件 | 判断 | 内容审校意见 |
| --- | --- | --- |
| 五项 D0 原始回答和两套 sandbox EvidenceCard | `fail` | 当前只有夹具观察/简短 learner_raw；缺五项 D0 原答、统一 diagnostic_id 和可归属学习者的两套非同构作品。 |
| D1–D5 初步证据 | `insufficient_evidence` | 机制和限制写得清楚，但证据主要是代理/夹具工件；D1/D4/D5 的拒绝、恢复、交接能力未由学习者原始产物和独立接收证明。 |
| `E-AI-L0-003` D6 方案取舍 | `fail` | 未见绑定的学习者方案卡，缺用户问题—质量/成本假设—停止线—固定工作流/规则/图 Agent 取舍链。 |
| D7 计划及一次留出尝试 | `insufficient_evidence` | SOURCE holdout、DURABLE holdout、GATE holdout 是工件级变体；没有学习者重写假设、提示次数、停止决定和未测范围的完整原始记录。 |
| 原例、受影响回归、留出可重建 | `met_within_local_fixture_scope` | 既有内容审校支持工件引用、哈希和局部语义一致；QA/工程独立运行及真实学习者重建仍不能由本报告代替。 |
| 无未关闭 P0/P1 | `not_satisfied_for_gate` | 内容审校历史 P1 多数在局部 fixture 关闭，但“学习者证据缺失/身份不可核/独立签收缺失”是本门槛的实质 P1，不得用夹具通过抵销。 |
| 人工 gate / 接收签收 | `fail` | 所有记录均为 simulated/approve-for-review-only 或 pending；没有真人 approve/reject/escalate 与相邻岗位签收。 |

## P1 与误读风险

- **P1-CONTENT-L1-001：学习者证据不可充分归属。** `local-sandbox-learner` 和简短 raw observations 不能证明真实学习者独立完成；责任：AI 生成工程师补齐原始作答与稳定身份绑定，QA核证。
- **P1-CONTENT-L1-002：必交练习缺失。** 未见 E-AI-L0-003 方案取舍卡及 U-AI-L0-001 完整留出迁移卡；责任：AI 生成工程师补交，课程架构师确认格式。
- **P1-CONTENT-L1-003：接收/人工 gate 未发生。** `pending`、`simulated-human-gate`、`approve_for_review_only` 不能当真人审批或交接通过；责任：接收岗位与 QA 分别记录。
- **P1-CONTENT-L1-004：本地替身误读风险。** 原子 JSON、文件 replay、schema validator 和确定性迁移器不能被写成生产耐久、真实模型、LangGraph、数据库迁移或 RPO/RTO 证据；责任：PM/作者在汇总和晋级记录中保持范围标签。

## 可进入 L1 review 的前置条件

1. 绑定同一诊断/练习版本的五项 D0 学习者原始回答、原始工件和自评；
2. 提交两套非同构 sandbox，并由 QA 复跑原例、受影响回归和留出；
3. 补交 E-AI-L0-003 和 U-AI-L0-001，保留首次失败、提示次数、停止/降级决定及未测项；
4. 每张 EvidenceCard 补齐稳定 learner_id、owner、reviewer、contract/fixture hash、environment、source_refs、run receipts、first_failure/stop、handoff/signoff 和 independent_review；
5. 完成一次真人拒绝或升级与一次相邻岗位接收签收，不能由作者代签；
6. 将真实模型、LangGraph/API、生产权限和外部动作保持 `not_run`/`not_granted`，除非另有授权和独立证据。

## 复核范围与保留项

本报告不运行真实供应商、付费 API、外部服务或生产数据库，不修改练习工件、教材、应用、账户和历史报告；不代替测试工程师运行复验，不代学习者作答，不进行等级授予。历史 D0、SOURCE-001、DURABLE-002、GATE-003 报告及其首失败记录继续保留，返修须建立新版本卡片。
