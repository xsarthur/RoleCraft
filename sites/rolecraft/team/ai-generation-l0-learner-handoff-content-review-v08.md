# AI生成工程师 L0 Consolidated Learner Handoff v0.8 内容审校

- 审校角色：内容审校员；只读核对逐题语义、证据绑定、来源/限制与岗位边界，不执行代码、不替作者补正文、不授等级。
- 审校对象：`sites/rolecraft/team/ai-generation-l0-learner-handoff-v08.md`、`sites/rolecraft/team/ai-generation-l0-learner-handoff-v08/`及 v07 内容审校记录。
- 诊断 ID：`D0-AI-20261015-001`
- 结论：`reviewed_with_limitations`
- 范围结论：`met_within_scope`

## 结论

v08 对 v07 的主要缺陷有实质修订：D0-03 现在分别提供 A normal、B denial 和 changed-key holdout 文件；D0-04 将 `holdout.json` 与 `regression.json` 分开绑定；D0-05 明列 `schema_version/source_refs/tenant/source_version/status` 字段映射。manifest 的路径、字节数和 SHA 记录与目录结构可作为索引，`self_signed=false`、QA/人工签收 pending、`external_action=null`、D0/L0 `not_assessed` 与 L1/L2 `not_granted` 保持边界。

这些改动改善了交接语义，但不能把缺失的真实输出或通用占位来源当成逐题可复核证据。D0-01/02 仍只有短 receipt，缺少学习者答案正文、具体状态字段与章节/练习段落绑定；D0-03 的 A 与 B `output_hash` 均明确不可用（A 为 `unavailable-local`，B 为 `unavailable: no raw output file`），B 仅有拒绝停止收据，不能证明可复核的 A 输出或学习者执行的 B 拒绝；D0-05 映射存在字段名，但部分映射指向这些不可用输出且没有断言级值/路径展开。v08 因而仍只能支持本地确定性夹具范围的有限交接语义，不支持学习者能力或等级判断。

## 逐题核对

### D0-01：模型生成边界与职责

- `learner_raw.json`明确生成、schema、来源、失败恢复与证据交接属于 AI 生成服务，并写明权限、账户、前端、QA、教材不越界；`d0-01-mechanism-receipt.json`给出 `generation only`、歧义停止和 `external_action null`。
- 绑定仍是 `answer_hash=learner_raw.json` 的文件名级指针，receipt 没有答案片段、输入哈希、具体边界断言或来源位置。它支持题意/职责标签对应，不能证明学习者对模型生成边界作出完整、正确且可复核的机制解释。
- 真实模型/API、供应商契约、生产权限和真人签收未验证，不能把岗位边界声明扩大为生产授权。

### D0-02：显式状态与持久化

- learner 原答写出 `start→tool_returned→source_checked→draft_ready`、结果先持久化和 `recovery_required`；receipt 写出 `persist before validate`、`recovery_required` 和 `source checked`，主题一致。
- receipt 没有具体状态记录、checkpoint 字段、失败输入/输出哈希或章节来源；`answer_hash`仍只指向整份 raw 文件。因此可确认学习者声明与题目语义相符，不能确认状态机已被正确解释、运行或耐久保存。
- `u-ai-l0-001/first_failure.json`、`regression.json` 的本地字段支持受控夹具中的停线/恢复叙述，但不证明真实进程崩溃、数据库耐久性、并发或 RPO/RTO。

### D0-03：租户/来源拒绝及 A/B 输出

- learner 原答固定租户 A、`F-AI-SOURCE-CLAIM-v1/doc-A-refund-v1` 并标记 B 拒绝；v08 将 A、B 和 changed-key holdout 分文件，改进了 v07 的 A/B 混指和 holdout 缺失。
- `d0-03-A-output.json` 的 `input_hash` 与 `source_hash`相同，但 `output_hash=unavailable-local`，没有正文、状态、source_refs 或可复核输出文件；`d0-03-B-output.json` 的 `output_hash=unavailable: no raw output file`，只有 `stop_receipt=tenant B denied`。因此 A 允许路径和 B 生成前拒绝尚未在学习者交接中形成完整输出闭环。
- `d0-03-holdout.json`只记录 `source_version` 变化和 `stop mismatch`，没有输入/输出哈希、预期拒绝码或实际拒绝收据。QA 的 B-denial 夹具另有 `SOURCE_SCOPE_DENIED` 证据，但属于独立 QA，不可替代学习者 B 输出或真实 ACL。
- 本题仍应保持 B 租户拒绝 `unverified`、`must_not_count_as_pass=true`；不能把缺失输出解释成“安全拒绝已证明”。

### D0-04：持久化失败、首错保留与恢复

- v08 已把 `d0-04-regression.json` 与 `d0-04-holdout.json` 分开，修复 v07 将 holdout 错指 regression 的路径缺陷。regression 断言 `recovery_required`、`idempotency preserved`；holdout 改变 outage duration 并设 retry-budget stop，与 learner 原答及 U-AI-L0-001 主题一致。
- 两个文件都是简短断言，没有首失败记录、旧 checkpoint、工具结果、重放键值、输入/输出哈希或人工暂停字段；不能逐字段核对“先冻结、保留首错、未知副作用不重放”。`u-ai-l0-001/first_failure.json` 与 `regression.json` 提供了本地夹具字段，但 handoff card 没把它们逐项连接到 D0-04 答案。
- 结论限于本地确定性 JSON 夹具的故障/恢复语义；真实崩溃恢复、耐久存储、外部副作用和 RPO/RTO 未验证。

### D0-05：基线、首失败、回归与 holdout 及字段映射

- learner 原答明确“只改变 checkpoint 可用性”，先基线、首失败、回归、holdout，并设停止门槛；`u-ai-l0-001` 四文件和 execution log 具备对应工件。v08 新增 `d0-05-assertion-mapping.json`，显式列出 `schema_version/source_refs/tenant/source_version/status`。
- 映射方向可读，但 `schema_version` 只写 `regression.json`，`source_refs` 指向输出哈希不可用的 A 文件，`tenant` 指向没有 raw 输出的 B 文件，`source_version` 指向仅有 changed-key/result 的 holdout，`status` 只指向 regression；没有给出每个断言在 baseline/first_failure/regression/holdout 中的字段和值，也没有首失败和停止断言映射。
- 因而该项可支持“已提出字段映射并与主题相符”，不能支持 D0-05 的端到端字段级证据或未知任务迁移。execution log 的 `pass_local_deterministic` 只证明 JSON 读取命令和固定夹具本地耗时，不证明真实模型质量或 schema/source 合同。

## 来源、角色与限制

- manifest 宣称的路径、bytes、SHA 可作为交接目录索引；本审校不把 manifest 自身或 QA 文件当成学习者答案。v08 的来源仍以通用练习/夹具 ID 为主，缺少逐题教材段落、版本和断言级 `source_ref/claim_type`，不能声称每项机制由具体课程正文支持。
- learner execution、independent QA、content review、`self_signed=false`、`qa_status=pending`、`human_receipt=pending` 与等级状态保持分离；QA 的 `met_with_limitations` 只适用于其独立夹具范围。
- 角色边界表述正确：AI 生成岗位负责模型生成流程、来源关联与生成失败处理；账户/数据库、前端、QA、教材和专业审校不归该岗位。内容审校不代替测试、真人专家、产品验收或职业评定。
- 本地 fixture、JSON 读取、哈希和无外部动作不支持真实模型/API、供应商来源、生产租户隔离、数据库恢复、并发、保密、成本、用户学习效果或职业能力结论。

## 缺陷与后续动作

1. 补齐 D0-01/02 学习者答案正文或可定位段落、输入/输出哈希、状态字段和课程/练习 `source_ref`；receipt 需从标签提升为题目级证据。
2. 补齐 D0-03 A normal 的实际输出或明确可复核的 unavailable receipt（含原因、状态、来源引用和停止条件），以及 B denial 的拒绝码、空输出字段、输入哈希和独立于 QA 的学习者执行收据；补齐 changed-key holdout 的预期/实际结果并独立复验。
3. 为 D0-04 绑定 `first_failure`、checkpoint、工具结果、幂等键、恢复状态和 holdout 断言；保留 v07 首失败和路径修复历史。
4. 将 D0-05 五个字段映射扩展为 baseline/first_failure/regression/holdout 的逐字段值、断言 ID 与来源定位；缺失或不可用输出继续标为 unknown，不用 QA 结果补齐。
5. 继续保持 `D0/L0=not_assessed`、`L1/L2=not_granted`、`human_receipt=pending`、`external_action=null`；不得用本审校关闭能力或等级缺口。

本审校仅覆盖 handoff 的内容语义、题目绑定、证据匹配、来源限制和岗位边界，不构成代码验收、独立 QA、真实模型/外部契约测试、学习效果、真人专家审核、职业认证或行业先进性判断。
