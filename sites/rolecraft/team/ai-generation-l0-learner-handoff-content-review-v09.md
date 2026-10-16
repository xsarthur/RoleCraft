# AI生成工程师 L0 Consolidated Learner Handoff v0.9 内容审校

- 审校角色：内容审校员；只读核对 D0-01..05 的语义、证据绑定、A/B 输出契约、拒绝语义、D0-04 恢复链、D0-05 字段映射、来源限制与岗位边界。不执行代码、不替作者补正文、不授等级。
- 审校对象：`sites/rolecraft/team/ai-generation-l0-learner-handoff-v09.md`、同目录 v09 工件及 v08 内容审校记录。
- 诊断 ID：`D0-AI-20261015-001`
- 结论：`reviewed_with_limitations`
- 范围结论：`met_within_scope`

## 结论

v09 对 v08 的关键缺陷有针对性修订。D0-03 现在给出 A normal 的命令、正文输出、output/source hash；B 路径明确 `no_output_by_contract=true`，保存输入哈希和拒绝收据，语义上正确表达“拒绝发生在产生 draft 之前”。changed-key holdout 也有明确的 `source_version` 变化和停止结果。D0-04 新增 first-failure、checkpoint 前后、幂等键、恢复输入/输出、schema/source assertion，并把链条写成 `recovery_required → replayed → draft_ready`。D0-05 仍列出五个字段并与工件相连。manifest 与版本状态保持可索引，`self_signed=false`、`qa_status/human_receipt=pending`、`external_action=null`、D0/L0 `not_assessed`、L1/L2 `not_granted` 未越界。

这些改动支持“交接合同和本地确定性证据的有限语义核对”，不支持真实模型/API、生产恢复、真人学习者能力或等级判断。若要求逐字段可复核，D0-04 使用的 `baseline.json`、`first_failure.json`、`regression.json` 仍只以文件名或占位 hash 出现，D0-05 的映射也没有展开四类工件中的实际字段值、断言 ID 和行/路径定位。D0-03 B 的无输出是契约要求，不能被错误解释为缺少产物；但它仍不是学习者真实租户 ACL 或真实供应商拒绝的证据。

## 逐项核对

### D0-01/02：机制与状态语义

v09 handoff 延续 v08 的短 receipt 和 learner raw 绑定，主题上仍能对应生成职责、来源关联、持久化优先、`recovery_required` 与状态推进。当前交付没有新增答案正文、题目级章节/练习 `source_ref`、具体状态字段或输入/输出哈希的逐断言展开。因此只能判为 `met_with_limitations`：声明与题意相符，但不能证明学习者已完整、正确解释或运行这些机制。

### D0-03：A/B 输出契约与拒绝

A 文件包含命令、`draft A: DEMO-42`、`output_hash` 和 `source_hash`，形成比 v08 更可复核的 normal 输出索引。B 文件明确 `no_output_by_contract=true`，记录同一输入哈希、`tenant B denied; no draft` 和 receipt hash；这符合“权限/租户拒绝后不得产生 draft”的契约，拒绝收据本身就是预期结果，不应要求伪造 output 文件。holdout 只改变 `source_version` 并给出 `stop mismatch`，与版本不匹配即停的语义一致。

仍有限制：A 的 output hash 没有同时给出独立可读的输出文件、状态码、source_refs 或命令运行收据；B 没有明确拒绝码、零下游调用计数或学习者原始执行日志；holdout 没有输入/输出哈希、预期/实际结构化结果和断言 ID。QA 的 B-denial 夹具不能替代学习者执行或真实 ACL。该项结论为 `met_with_limitations`，不是能力通过。

### D0-04：首失败保留与恢复链

`d0-04-recovery-chain.json` 显式保留 `recovery_required`、checkpoint before/after、`U-AI-L0-001` 幂等键、恢复输入/输出、schema/source assertions 和恢复顺序；`d0-04-regression.json` 与 outage-duration holdout 的 retry-budget stop 也与主题一致。相较 v08，路径和链条语义已补齐，可判 `met_with_limitations`。

但 `first_failure` 的 hash 是占位字符串，checkpoint 和恢复输出只有文件名，没有绑定文件的实际摘要、字段值、事件时间、工具收据或未知副作用观察。该链条仍只支持本地确定性夹具中的叙述，不能证明真实进程崩溃、耐久数据库、并发竞态、幂等外部副作用或生产 RPO/RTO。

### D0-05：字段映射

`d0-05-assertion-mapping.json` 明列 `schema_version/source_refs/tenant/source_version/status`，并分别指向 recovery、A、B、holdout 与 recovery 工件，方向比 v08 清楚，主题上可判 `met_with_limitations`。但是 `schema_version` 实际填写为 `d0-04-recovery-chain.json` 文件名，而非可核对的 schema 值；`source_refs`/`tenant` 仍只指向简短输出/拒绝工件；`source_version` 只有 changed-key 记录；`status` 未展开 baseline/first_failure/regression/holdout 的具体字段与断言。没有四类工件逐字段值、断言 ID、来源定位和失败/停止条件的完整矩阵，不能支持端到端迁移或未知任务证据。

## 来源、角色与限制

manifest 的 path/bytes/SHA 可作为目录索引；本审校不把 manifest、QA 或历史 v08 报告当作学习者答案。当前来源以本地夹具、通用练习和文件级 hash 为主，缺逐题教材段落、版本及 claim-level `source_ref`。

AI 生成工程师仅负责真实模型调用、生成流程、来源关联与生成失败处理；账户/数据库、前端、QA、教材正文、内容审校和产品等级判断仍由其他岗位负责。内容审校不代替测试工程师、真人专家、产品验收或职业评定。`self_signed=false`、QA/人工签收 pending、D0/L0 未评估、L1/L2 未授予和无外部动作的状态应继续保留。

本地 JSON、哈希、固定命令和无外部动作不证明真实供应商协议、模型质量、租户隔离、生产权限、数据库恢复、并发、安全保密、成本、真实学习效果或职业能力。

## 缺陷与后续动作

1. 为 D0-01/02 补充学习者答案正文或可定位段落、状态字段、输入/输出哈希及逐题课程/练习 `source_ref`。
2. 保留 D0-03 B 的“按契约无输出”语义，同时补拒绝码、零下游调用/状态收据和独立学习者执行记录；为 A 与 changed-key holdout 补可读输出、预期/实际、断言 ID 和独立复验。
3. 将 D0-04 的 first failure、checkpoint、恢复输入/输出和工具结果绑定到实际文件摘要、字段/事件和未知副作用观察；去除占位 hash 后重建 manifest。
4. 将 D0-05 扩展为 baseline/first_failure/regression/holdout 的逐字段值、schema 真值、断言 ID、来源定位及停止条件矩阵。
5. 继续保持 `D0/L0=not_assessed`、`L1/L2=not_granted`、`human_receipt=pending`、`external_action=null`；不得以本审校关闭能力或等级缺口。

本审校只覆盖 handoff 内容语义、证据匹配、来源限制和岗位边界，不构成代码验收、独立 QA、真实模型/外部契约测试、真实学习效果、真人专家审核、职业认证或行业先进性判断。
