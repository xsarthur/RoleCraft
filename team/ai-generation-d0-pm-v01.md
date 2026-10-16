# AI生成工程师 D0 正式训练 · 项目经理收口记录

日期：2026-10-15（Asia/Shanghai）  
版本：`ai-generation-d0-pm-v01`  
责任岗位：项目经理（协调、状态、交接与复盘）

## 启动与范围

用户明确要求从 AI 生成工程师开始 D0 正式训练。本轮只执行 `role_id=AI` 的 D0，不复用相邻 `AGDEV` Agent 开发工程师记录；训练使用 `PLR-AI-006`、本地无网络确定性替身和 v0.2 资料字段。未调用真实模型、付费 API、LangGraph 运行时、外部工具或真实用户数据。

## 实际结果

- AI 学习者原始记录：`ai-generation-d0-v01.md/.json`，五项 D0 已写入；原始版本保留为 `ai-generation-d0-v01-initial.md/.json`。
- 本地重放补证：`ai-generation-d0-v02-replay.md/.json`，状态序列、租户 A 边界、来源引用、无外发动作和哈希经独立测试重放一致。
- 内容审校：`reviewed_with_limitations`；指出未实际验证 B 租户拒绝路径、持久化/崩溃恢复、逐条课程/API/版本绑定、超时/重复回调/旧检查点/空工具和未知迁移。
- 独立 QA：重放证据 `met_within_scope`；D0 整体 `insufficient_evidence / not_assessed`；保持 L0 受指导状态，L1 不授予。

## 阻断与未完成

当前只有一个本地确定性夹具，D0-04 故障注入和 D0-05 陌生任务尚未实际运行；没有第二个沙箱工件、完整 EvidenceCard 或接收方签收。真实模型、LangGraph API、外部协议、持久化崩溃恢复、模型费用、用户效果和生产能力均未验证。状态命名存在 `source_checked` 与 `checked` 漂移，已登记 P2，后续需统一状态合同。

这些缺口不能由课程阅读、一次本地成功、报告完成或 AGDEV 既有结果抵消。AI 岗位不能继承 AGDEV 的 D0/T1–T3 结论。

## 下一步交接

1. AI生成工程师按原 D0 记录补跑第二个确定性夹具：无配置、schema 错、部分输出、来源冲突和超时至少覆盖一项，并保留首次失败。
2. 在无外部副作用的本地环境执行 D0-04 崩溃/恢复模拟，区分 `source_checked`/`checked` 状态并更新状态迁移合同。
3. 由非作者冻结并执行 `U-AI-D0-T1`，只改变检查点短暂不可用这一约束；测试工程师独立复跑原例、受影响回归和留出变体。
4. 内容审校员补齐逐题 `source_refs/claim_type`；接收岗位完成签收或有据拒收后，PM 再安排 D0 复验和 L1 评估。

当前行政状态：**D0 已启动并产生限定范围重放证据；正式能力训练未完成，L1 未授，真实职业能力仍 `not_assessed`。**

## D0追加复验（v0.3）

本地故障/迁移任务已执行并由测试工程师在限定范围 `met_within_scope`：原例、空工具结果、重复回调、旧检查点、超时和一个未预告来源变体均有回归证据。内容审校仍为 `reviewed_with_limitations`，保留 P1：B 租户拒绝路径、耐久 checkpoint/崩溃恢复、逐条来源/版本绑定、授权工具契约、人工介入与留出迁移尚未实际验证。D0 仍 `not_assessed`，L1 未授予。

证据：[v0.3故障迁移记录](ai-generation-d0-v03-fault-transfer.md)、[v0.3 QA](ai-generation-d0-v03-qa.md)、[v0.3内容审校](ai-generation-d0-v03-content-review.md)。

## P1补证与最终独立复验（v0.4）

v0.4本地修复覆盖租户B拒绝、授权工具契约与来源范围拒绝、checkpoint崩溃/不完整结果/人工停止与重放、逐条来源四元组、单约束留出迁移，以及schema/空工具/重复回调首失败。测试工程师独立重放原例与未预告来源变体，58项检查通过且输出字节一致，局部结论 `met_within_scope`。

内容审校为 `reviewed_with_limitations`：外部来源/版本 claim 绑定、重复回调持久化措辞、通用 schema、真实进程恢复、真实人工审批和学习者能力证据仍未闭合。D0整体仍 `not_assessed`，L1 `not_granted`，保持 `L0_guided`。真实LangGraph/模型/生产存储/外部工具仍未运行。

证据：[v0.4修复](ai-generation-d0-v04-p1-repair.md)、[v0.4 QA](ai-generation-d0-v04-qa.md)、[v0.4内容审校](ai-generation-d0-v04-content-review.md)。


## L0 首个来源绑定实操（SOURCE-001）

进阶方案 v0.3 的 `source_records` P2 结构缺陷已由独立 QA 复验关闭；训练状态仍为 `L0_guided`、D0 `not_assessed`、L1 `not_granted`。随后执行首个 L0 本地隔离实操 `AI-PRACTICE-SOURCE-001`：冻结 practice pack SHA256 `b1cb993bfb6310f5f872c23980ad60a8d6dbc91c64462bbf253302328ffa0f1a`，fixture SHA256 `5dc9f33e3972dbff5118bc6977a66ccbd376bc6fcc54f15c9b1e26fda8db5e0`。学习者提交来源矩阵、确定性输出、四类首失败/停线、run-1/run-2、动态留出绑定、EvidenceCard 和 QA 交接；仅使用本地确定性替身，未调用真实模型、供应商 API、LangGraph、云、付费服务或真实用户数据。

独立 QA 实际运行 `replay_verify.py` 并判定 `met_with_limitations`（仅本地范围）；内容审校判定 `reviewed_with_limitations`。两者均确认来源四元组、版本/hash/租户边界、首失败、重放和 holdout 在夹具范围内成立，同时保留真实供应商/API、模型忠实度、生产并发/缓存、真实进程恢复、真人审批/接收签收和未知任务迁移等未验证项。学习者原始报告为 `pass_with_limitations`，不作为自证晋级；L1/L2 仍未授予。

证据：[SOURCE-001学习者产物](ai-generation-l0-practice-source-001-v01.md)、[隔离工件](ai-generation-l0-practice-source-001/README.md)、[独立QA](ai-generation-l0-practice-source-001-qa-v01.md)、[独立内容审校](ai-generation-l0-practice-source-001-content-review-v01.md)、[进阶方案v0.3 QA](ai-generation-engineer-advancement-qa-v03.md)。

下一项按原练习合同进入 `AI-PRACTICE-DURABLE-002`，继续保留首失败、回归、留出和交接签收；完成后再由 QA/内容审校独立复验。不得因首个 L0 实操局部通过而关闭 D0、授予 L1 或推导生产能力。


## L0 Durable-002 实操与修复收口

`AI-PRACTICE-DURABLE-002` 首版在独立内容审校中发现 `run-1/checkpoint_manifest.json` 为空，v02 补齐了 12 个 checkpoint 的 path/bytes/SHA，但 QA/内容审校又发现 holdout 和部分 final 输出仍写 `status=final`，v03 统一为 `local_draft_ready`；随后 QA 发现三份 run 的 final.json manifest bytes/SHA 与实际文件不符、final_output 缺顶层 `scope`，v04 已重新计算并补齐。v04 的独立 QA 判定 `met_with_limitations`（仅本地确定性夹具），内容审校判定 `reviewed_with_limitations`；首失败、回归、留出和修复链均保留。

当前训练状态仍为 `L0_guided`，D0 `not_assessed`，L1/L2 `not_granted`。本轮只证明隔离 JSON 替身中的回调去重、checkpoint 清单、崩溃后停线/重放和单份本地草稿；真实数据库、进程崩溃、并发/RPO/RTO、LangGraph、供应商、真人审批、接收签收和学习者能力仍未验证。下一项按练习包转入 `AI-PRACTICE-GATE-003`（schema、人工 gate、版本迁移与单约束留出），仍需独立 QA/内容审校后再评估。

证据：[Durable-002 v04学习者产物](ai-generation-l0-practice-durable-002-v04.md)、[独立QA](ai-generation-l0-practice-durable-002-qa-v04.md)、[独立内容审校](ai-generation-l0-practice-durable-002-content-review-v04.md)、[v03失败复验](ai-generation-l0-practice-durable-002-qa-v03.md)。


## L0→L1 门槛复核与学习者证据补齐（2026-10-15）

三项 L0 隔离实操已分别完成独立 QA/内容审校；Durable-002 v04 与 Gate-003 v06 在本地夹具范围为 `met_with_limitations`/`reviewed_with_limitations`，SOURCE-001 同样仅为限定范围通过。学习者证据 v0.3 已统一 diagnostic_id、绑定 canonical fixture、补齐 D6 本地 CPU/p95 收据和 U-AI-L0-001 的执行日志/哈希；独立 QA 为 `met_with_limitations`，内容审校为 `reviewed_with_limitations`。

独立 L0→L1 复核仍判定 `remain_L0_guided`，不进入 L1 review：B 租户拒绝仍明确未验证，D6 质量只覆盖本地 schema/source 夹具，U-AI-L0-001 不是真实进程故障或未知迁移；两个 sandbox 的学习者证据和接收签收仍不足，真实模型/API/LangGraph/DB/并发/RPO-RTO/真人审批未验证。现有证据不得写成岗位能力、生产权限或 L1。

下一项由 AI生成工程师学习者执行受限 B 租户拒绝实操，生成独立 denial receipt 和第二种输入变体；QA/内容审校随后复验，并更新 L0→L1 门槛。


## B 租户拒绝与第二输入变体补证

为回应 L0→L1 复核缺口，学习者执行 `ai-generation-l0-b-denial-transfer-v01`：A/doc-A-refund-v2 正常基线可生成 draft；B 私有文档和错误租户请求均在生成前返回 `SOURCE_SCOPE_DENIED`，首失败时 `draft/handoff/external_action` 均为空；非同构 `doc-B-private-v9` 留出仍动态拒绝。独立 QA 为 `met_with_limitations`，内容审校为 `reviewed_with_limitations`，均限定在本地字典夹具，真实权限系统、跨租户生产隔离、并发恢复、日志泄漏、真实模型和真人审批未验证。

L0→L1 门槛仍待重新复核；不得把这项补证单独解释为 L1 或生产安全能力。


## L0→L1 门槛最终复核（v03）

B-denial-transfer 补证经独立 QA `met_with_limitations`、内容审校 `reviewed_with_limitations`；最终 L0→L1 QA 复核写入 `ai-generation-l0-to-l1-gate-qa-v03.md/.json`，结论 `remain_L0_guided`，`l1_reviewable=insufficient_evidence`。B 拒绝、第二输入变体和双次重放在本地范围闭合，DURABLE-002 v04 亦已复验；但五项 D0、D1-D5、U、D6、两 sandbox 学习者能力、P1 完整关闭及接收签收仍不足，真实运行/学习者迁移/真人签收未验证。L1/L2 和生产权限继续未授予。

下一步优先补真实形状的隔离任务前置证据与跨岗签收；在此之前不得进入 L1，也不能把本地夹具通过写成职业能力。


## D0 学习者实际演示与 L0→L1 复核 v04

学习者同一 `D0-AI-20261015-001` 生成 D0 learner demo v02，实际覆盖 D0-03 A 正常/B 拒绝、D0-04 checkpoint 写入失败与幂等恢复、D0-05 单约束基线/首失败/回归/留出；修复后独立 QA 为 `met_with_limitations`，内容审校为 `reviewed_with_limitations`。

最新独立门槛 QA v04 仍判 `remain_L0_guided`、`l1_reviewable=insufficient_evidence`：五项 D0 与 demo 仍未形成完整同一学习者能力闭环，B 拒绝尚未绑定为学习者五项证据；两 sandbox 仍是本地 fixture 复放，D6 缺逐字段失败样本/真实模型对照，接收签收 pending。L1/L2 与生产权限继续未授予。

证据：[D0 learner demo v02](ai-generation-d0-learner-demo-v02/ai-generation-d0-learner-demo-v02.md)、[demo QA](ai-generation-d0-learner-demo-qa-v02.md)、[demo内容审校](ai-generation-d0-learner-demo-content-review-v02.md)、[L0→L1 QA v04](ai-generation-l0-to-l1-gate-qa-v04.md)。


## 学习者证据 v04 与 L0→L1 门槛复核 v05

学习者证据 v04 将 D0 learner demo v02、B-denial QA范围证据和 D6 逐字段失败样本绑定到同一 diagnostic_id，并明确学习者执行与独立 QA 角色边界；独立 QA 为 `met_with_limitations`，内容审校为 `reviewed_with_limitations`。

最新门槛 QA v05 仍判 `remain_L0_guided`、L1 `insufficient_evidence`：五项 D0 与 demo 未形成完整学习者能力闭环；B-denial 虽有独立 QA，通过范围不计作学习者 pass；D6 仍仅 fixture 指标，两个 sandbox、U迁移、P1 和真人签收仍不足。L1/L2 与生产权限继续未授予。


## 同诊断学习者 B-denial 实作与 L0→L1 复核 v06

学习者在同一 `D0-AI-20261015-001` 下完成 B-denial 实作，独立 QA 为 `met_within_scope`（24/24本地检查），内容审校为 `reviewed_with_limitations`；A 基线、B 私有/错误租户拒绝、非同构 holdout、首失败和无外部动作均有证据。

门槛 QA v06 仍判 `remain_L0_guided`、L1 `insufficient_evidence`：五项 D0 仍未闭合为完整学习者能力证据，两个 sandbox 只达本地限定，D6和U仍非真实运行/迁移，真人签收 pending。L1/L2和生产权限继续未授予。


## Consolidated learner handoff v05

统一交接包已收拢 D0 五答、demo、B-denial、SOURCE/DURABLE/GATE、D6 与 U 证据，manifest 17 项 bytes/SHA 全部匹配；独立 QA `met_with_limitations`、内容审校 `reviewed_with_limitations`。仍保留关键边界：B-denial 学习者执行在汇总包中尚未被独立确认，D6 claim 负向样本为 0/1，真人签收 pending，真实模型/API/生产恢复/权限未验证；L0/D0 not_assessed，L1/L2 未授。


## Consolidated learner handoff v10–v11 结构复验

hand-off v10 重建了相对路径、D0-04 全链文件、A/B 输出契约、D0-05 字段矩阵和 manifest 自引用规则；QA 为 `met_with_limitations`，内容审校为 `reviewed_with_limitations`。v11 又补充了 A 运行收据、D0-04 事件/工具/副作用收据和 D0-05 四状态矩阵，QA 仍为 `met_with_limitations`，内容审校仍为 `reviewed_with_limitations`。

当前仍未达到 L1：A 收据 hash 规范未明、D0-04 tool hash 仍是占位/未实测真实故障、D0-05 断言仍偏声明性、EvidenceCard 未完全绑定新增 trace/matrix，真实模型/API/生产恢复/真人签收未验证。L0/D0 `not_assessed`，L1/L2 未授。


## Consolidated learner handoff v12 复验

hand-off v12 补入 A stdout、D0-04 工具/检查点/恢复文件与 D0-05 四状态矩阵；独立 QA 为 `met_with_limitations`，内容审校为 `reviewed_with_limitations`。仍开放：A hash 规范口径、D0-04 tool input/output hash 占位、D0-05 缺字段级 bytes/SHA 与独立未知 holdout、EvidenceCard 未完全绑定新增 trace/matrix/failure/recovery。D0/L0 `not_assessed`，L1/L2 未授，真人签收和真实运行时未验证。


## 一次性运行 handoff v14 复验

本轮改用一次性 `run_bundle.py` 实际生成全部收据，修复了 A stdout hash 口径、D0-04 实际文件 hash、D0-05 新 fixture `doc-A-shipping-v3`、manifest 和五张 EvidenceCard 的基础绑定。独立 QA 实际隔离重跑通过，结论 `met_with_limitations`；内容审校 `reviewed_with_limitations`。

仍开放两项门槛缺口：D0-05 holdout 与 first_failure 字节相同，不能证明独立未知迁移；五张 EvidenceCard 虽有独立 ID，仍重复同一工件清单，缺逐工件可解释绑定。D0/L0 `not_assessed`，L1/L2 未授，真实模型/API/生产/真人签收未验证。


## 真实学习者证据阻塞（2026-10-16）

用户已说明暂时无法作为学习者配合完成任务。本项目停止把代理生成的 learner handoff 作为晋级依据，保留 v01–v19 失败/复验链和 QA/内容审校记录。当前 AI 生成工程师保持 `L0/D0 not_assessed`、`L1/L2 not_granted`。

在真实学习者原始作答、本人运行记录和接收方签收出现前，项目经理只继续维护可独立验证的课程/练习合同、版本和 QA 记录，不授予岗位能力或生产权限。


## 真实学习者 D0 原始回答首次收录（2026-10-16）

用户本人提交 AI 生成工程师 D0 原始回答，已原样保存并绑定 `D0-AI-20261015-001`：[原始回答](ai-generation-real-learner-d0-20261016-v01.md)。独立 QA 在结构范围判定 `met_within_scope`；内容审校判定 `reviewed_with_limitations`。

这首次形成真实学习者原始输入，但尚未形成能力通过：A/B 实际执行、来源缺失/冲突停止、零外部动作收据、逐 claim source hash、幂等/超时/schema/部分响应等故障证据和接收签收仍待完成。D0 继续 `not_assessed`，L1/L2 未授。


## 用户确认持续推进至 L2（2026-10-16）

用户明确要求持续训练 AI 生成工程师及其他岗位，直到达到 L2 独立交付门槛。当前轮巡保持 AI 岗位高优先级；D0 原始回答已收录，但 D0 实际运行、独立 QA、接收签收和 L1/L2 门槛仍未完成。后续继续按原门槛推进，保留首失败、回归、留出、EvidenceCard 和未验证边界；不得以代理生成或一次本地成功替代学习者能力证据。


## 真实学习者 D0-03 回放与 L0→L1 复核 v08

在不替学习者作答的前提下，测试工程师完成了 D0-03 A/B、来源缺失和来源冲突的独立本地 QA 回放；内容审校判定 `reviewed_with_limitations`，QA 判定 `met_with_limitations`。合同 fixture SHA 与 QA input-frozen SHA 不一致，已登记为哈希链缺口。

最终 L0→L1 QA v08 仍判 `remain_L0_guided` / `insufficient_evidence`：QA 回放不计作学习者本人执行，D0-03 learner_execution.available=false；D0 五答、D1-D5、D6、P1、真人签收仍不足。L1/L2 与生产权限继续未授予。


## D0-03 fixture hash 链修复（2026-10-16）

QA 发现合同 fixture SHA 与 frozen input SHA 不一致；独立修复确认两者均正确，差异仅是哈希对象范围：合同 hash 覆盖 `root.fixture` 子对象（949 bytes），QA hash 覆盖完整 `input-frozen.json` 根对象（1388 bytes）。修复记录已保存，原始学习者回答和历史 QA 不修改。该修复只消除哈希对象歧义，不改变 D0/L0 未评估、L1/L2 未授状态。
