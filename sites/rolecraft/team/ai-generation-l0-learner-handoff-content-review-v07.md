# AI生成工程师 L0 Consolidated Learner Handoff v0.7 内容审校

- 审校角色：内容审校员（独立核对内容语义、证据绑定与边界；不执行代码、不授等级）
- 审校对象：`sites/rolecraft/team/ai-generation-l0-learner-handoff-v07.md`、`/private/tmp/ai-generation-l0-learner-handoff-v07/`及 v06 内容审校记录
- 诊断 ID：`D0-AI-20261015-001`
- 结论：`reviewed_with_limitations`
- 范围结论：`met_within_scope`

## 结论

v07 相比 v06 为 D0-01..05 建立了不同 `evidence_id`、不同 learner answer hash 和不同输入/输出路径，因而形式上不再是五张完全相同的 EvidenceCard。每张卡仍引用同一份 PM/练习来源，且部分卡的收据或工件只提供极短的标签；因此只能确认交接索引和有限的题目语义绑定，不能据此认定五题均有充分、独立、可复核的内容证据。

D0-03、D0-04 存在证据字段与实际工件不完全匹配：D0-03 输入含 B-denial learner execution，但输出/回归只指向 demo raw，且无 holdout；D0-04 的 `holdout_artifact` 错指向 regression，而实际 holdout 是另一个文件。D0-01/02 的 mechanism receipt 仅写“边界已记录/状态契约已记录”，能表明主题，但没有正文答案或机制字段，不能证明学习者真正解释了对应机制。D0-05 的 baseline/holdout/regression 路径与 U-AI-L0-001 主题匹配，但 source_refs 仍是通用练习来源，未给出题目级断言到具体字段的逐项映射。

## 逐项核对

### D0-01：模型生成边界与职责

- `learner_raw.json`给出生成、schema、来源、失败恢复、交接及不越界的题意；card 绑定 `mechanism-boundary-receipt.json`，语义标签与 D0-01 对应。
- 收据只有 `learner answer D0-01 mechanism/boundary recorded` 和 `local_only`，无答案正文、输入 hash、具体边界断言或来源段落；属于主题级绑定，不能作为独立机制论证证据。
- `real model/API`、生产恢复、真人签收未验证，角色边界表述本身没有把 QA、数据、前端或教材工作归给 AI 生成岗位。

### D0-02：显式状态与持久化

- card 绑定 `mechanism-state-receipt.json`，与 `start→tool_returned→source_checked→draft_ready` 主题相符。
- 收据仅为短文本，未绑定状态序列的具体字段或执行日志；`regression_artifact` 写为 `mechanism receipt` 而非可定位文件，且无 holdout。可支持“声明了状态契约”，不能支持状态机已被学习者正确解释或运行。
- `learner_raw`、U-AI- L0-001 另有持久化失败限制，但 card 未把这些字段逐项连到 D0-02 的答案。

### D0-03：租户/来源拒绝与 A/B 输出

- 题意要求租户 A、固定来源 `F-AI-SOURCE-CLAIM-v1/doc-A-refund-v1`，拒绝 B 来源；card 的输入同时列 `b-denial-learner-execution.json` 与 demo raw，说明有 A/B 语境。
- 输出和 regression 均只指向 demo raw；B-denial 输出回执的 `output_sha256` 为 `unavailable-local-receipt`，且 card `holdout_artifact=null`。因此 A 允许与 B 拒绝的双向结果未在同一 card 中形成完整、可复核的题目级闭环。
- 只能保留 `B_tenant_rejection.status=unverified` 和 `must_not_count_as_pass=true`；不能把 QA 的 denied 夹具结果写成真实租户权限或供应商来源证明。

### D0-04：持久化失败、首错保留与恢复

- 输入绑定 `first_failure.json` 与 `regression.json`，主题与“先失败后恢复、保留首错、同幂等键、不重放未知副作用”一致。
- card 的 `holdout_artifact` 错写为 `u-ai-l0-001/regression.json`，没有绑定实际 `holdout.json`；这使 holdout 证据字段不可信，需修正后复验。
- 实际 first_failure/ regression 文件能显示受控夹具状态，但不能证明真实进程崩溃恢复、RPO/RTO 或外部副作用控制。

### D0-05：基线、首失败、回归与 holdout

- 输入列出 baseline、holdout、regression，输出/回归为 regression，停止判断与 U-AI-L0-001 的“缺 source/schema/tenant 或持久化失败即停止”一致；这是五题中路径最完整的一项。
- 仍只有通用 source 练习作为 `source_refs`，未逐项列出 baseline 的断言、注入变化、holdout 预期与结果对应关系；execution log 只证明固定 JSON 读取及本地确定性运行。
- 不能外推真实模型质量、生产恢复或统计泛化。

## 证据与角色边界

- 五张卡有不同 ID/hash/path，改善了 v06 的统一模板问题，但 `source_refs` 全部相同，且不同卡仍缺题目级来源段落和执行字段。
- learner execution、independent review、QA 状态与 `self_signed=false`、`human_receipt=pending`、`qa_status=pending`、D0/L0 `not_assessed`、L1/L2 `not_granted` 保持一致。
- B-denial learner 与 QA 必须分开：QA 的本地 `denied` 夹具不等于学习者独立证明，也不等于真实租户隔离。
- 本地 fixture、JSON hash、Python 读取命令、无外部动作不应扩大解释为真实供应商 API、生产数据库、权限、保密、并发一致性、RPO/RTO、真人审批或职业能力。

## 限制与后续动作

1. 为 D0-01/02 补充学习者答案正文、具体机制字段、输入 hash 与对应教材/练习来源；将 receipt 变成可复核的题目级证据。
2. 修正 D0-03 的 A/B 输出、B-denial 回执与 holdout 绑定；在回执不可用时继续保持 `unverified`，不得关闭缺口。
3. 修正 D0-04 `holdout_artifact` 路径并重新计算 manifest/hash；独立 QA 复验首错、恢复和 holdout 的对应关系。
4. 为 D0-05 增加断言到 baseline/首失败/regression/holdout 的字段映射，保留 fixture-only 与未验证清单。
5. 继续保持真人签收、真实模型/API、生产恢复与外部动作未验证，不授予 D0/L0/L1/L2 等级。

本审校只覆盖交接包的内容语义、EvidenceCard 绑定、证据匹配和角色边界，不构成代码验收、学习效果、真人专家审核、职业认证或行业先进性判断。
