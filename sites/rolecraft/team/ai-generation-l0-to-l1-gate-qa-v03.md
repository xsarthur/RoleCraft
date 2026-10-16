# AI生成工程师 L0→L1 门槛独立复核 v0.3

- 日期：2026-10-15（Asia/Shanghai）
- 岗位：测试工程师（独立复核）
- 诊断：`D0-AI-20261015-001`
- 决定：`remain_L0_guided`
- L1 review：`insufficient_evidence`；不授 L1/L2

本次只复核相对 v0.2 的变化：B 租户拒绝转移包已实际独立运行，且包含改变 document_id、source_version、text 的非同构第二输入；DURABLE-002 已修复并由 QA v04 复验。上述新增证据关闭了“B 路径未执行”和“第二输入变体缺失”两个局部缺口，但不构成学习者五项 D0 或等级证据。

## 逐项门槛

| 门槛 | 状态 | 判断 |
|---|---|---|
| 五项 D0 原始回答 | fail | learner evidence v03 与 D0 v04 仍 `not_assessed`；B 拒绝收据来自独立练习包，不能替代同一学习者的五项原始回答。 |
| D1–D5 初步证据 | partial_fail | SOURCE、B-denial、DURABLE、GATE 覆盖局部机制；缺完整学习者绑定 EvidenceCard、未知任务迁移与真人接收证据。 |
| U（未知迁移） | partial_fail | U-AI-L0-001 的 baseline/首失败/回归/holdout 和停止决策可重建，但执行仍是 fixture JSON 读盘，未证明真实故障注入、崩溃恢复或未知任务迁移。 |
| 两个 sandbox | partial_pass | SOURCE-001 与 B-denial-transfer 的正常、拒绝、非同构 holdout、双次重放通过（本地范围）；DURABLE-002/GATE-003 亦各自通过限定 QA，但不是学习者独立双 sandbox 提交。 |
| QA/REV | partial_pass | learner evidence QA/content 为 `met_with_limitations`/`reviewed_with_limitations`；B-denial QA/content 与 DURABLE v04、GATE v06 有独立记录。真人 QA/接收签收仍 pending。 |
| D6 方案取舍 | partial_fail | E-AI-L0-003 有本地规则/供应商比较、CPU/p95、停止线；缺逐字段样本计数、失败样本及真实模型对照，不能证明方案能力。 |
| 无未关闭 P1 | fail | 学习者 D0、未知迁移、真人签收、真实运行时及 D6 质量证据仍开放，故 P1 不可视为关闭。 |
| 接收签收 | pending | 所有 handoff 仍为本地收据、`self_signed=false` 或 pending；没有真人接收方签收/拒收。 |

## 证据边界与能力状态

B-denial-transfer v01 证明 actor/requested tenant 不匹配和私有文档拒绝在生成前停止，非同构输入仍返回 `SOURCE_SCOPE_DENIED`，双次输出哈希一致；这只证明本地确定性夹具。DURABLE-002 v04 的三次重放、首失败和事件顺序 holdout 通过；GATE-003 v06 的 manifest/schema/逻辑复验通过。SOURCE/DURABLE/GATE 及 learner evidence 的 network、真实模型、生产数据库、并发、RPO/RTO、供应商、真实用户数据和外部动作均未验证。

当前真实能力状态：学习者仍为 **L0 guided**，证据不足以进入正式 L1 review；不授等级、不授生产权限、不作职业能力认证。

## 复验条件

补齐同诊断五项 D0 原始回答及完整 EvidenceCard；提交学习者本人第二非同构 sandbox 与未知任务解释；补 D6 逐字段质量计数/失败样本/真实模型未比较声明；完成真人 QA 与接收方有据签收或拒收；逐项关闭并复验 P1。历史报告与失败记录保留。

## 输入

`ai-generation-l0-to-l1-gate-qa-v02.json`; `ai-generation-l0-to-l1-gate-content-review-v02.json`; learner-evidence v03 QA/content; B-denial-transfer v01 QA/content; SOURCE-001 QA/content; DURABLE-002 v04 QA/content; GATE-003 v06 QA/content; SOURCE/DURABLE/GATE 当前工件与 manifest。
