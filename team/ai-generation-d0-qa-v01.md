# AI生成工程师 D0 独立 QA v0.1

- QA ID：`AI-D0-QA-20261015-LOCAL-01`
- 日期：2026-10-15（Asia/Shanghai）
- 独立复核岗位：测试工程师（本报告不代写学习者答案、不修改 learner 产物）
- 目标岗位：`AI` / AI生成工程师
- D0 结论：`insufficient_evidence`
- L1 决定：**不可进入 L1，保持 L0/未评估的受指导状态**

## 结论

当前没有可作为 **AI生成工程师（`role_id=AI`）D0** 的学习者证据。收到的五项回答、D0评定和后续 T1–T3 运行包全部位于 `employee-growth-mvp/agent-developer/`，并绑定 `AGDEV`（Agent 开发工程师，第16岗）。`AGDEV` 契约明确不负责模型供应商调用、提示模板、模型适配器和生成质量；这些属于 `AI` 岗位。训练规范的允许 `role_id` 也固定为十五岗列表，其中 `AI` 是模型调用、生成流程、来源关联和失败处理，未包含 `AGDEV`。

因此，现有材料不能转移、合并或外推为 AI 岗位 D0。它们可以作为相邻 AGDEV 岗位的独立记录继续保留；本报告不改写其历史结论。AI 岗位需要重新冻结自己的任务合同、夹具和 learner 原始产物。

## 输入与身份核对

本次 QA 读取并计算了以下输入的 SHA-256；哈希只用于本报告的收到版本定位，不表示内容已通过专业审校：

| 输入 | SHA-256 | QA 观察 |
| --- | --- | --- |
| `team/employee-professional-training-v01.md` | `7932430580052d30c39d8228241b78d7654f142daeb7cd12807ef721480fde14` | `AI` 的统一身份、领域和 L1/L2 作品规格 |
| `team/employee-growth-training-plan.md` | `316be37879d5f436588d89d022a29d406a5272237af77bd924ab17f983d06b4c` | D0 五项、隔离梯度和 L1 门槛 |
| `team/employee-professional-qa-v01.md` | `64bee762f1244a2ead2f3f3bdd97e9425626bc17d1ab03db4ed61a8099bcb7dd` | AI 强制反例、证据和独立复验规则 |
| `team/agent-development-engineer-product-v01.md` | `142a051ff8590af24d40f3ab85da357b81069baf7ca4beeb9d7d89960c36dadd` | `AGDEV` 独立契约，明确不承担 AI 模型服务责任 |
| `employee-growth-mvp/agent-developer/D0-diagnostic.json` | `1ed19a91d50604628cf28a67231990389c60cac61718a4ad3a5f2a8c7e6473af` | `role_id=AGDEV`，夹具仍 `draft_for_freeze`，无 fixture hash |
| `employee-growth-mvp/agent-developer/D0-learner-responses.json` | `157a44371deeefa527daa400ef6900d0672305cf5aa9f8b998dafd18e32d203a` | `role_id=AGDEV`，五项是静态回答/计划，QA 尚未复核 |
| `employee-growth-mvp/agent-developer/D0-evaluation.json` | `407088bf4221a3c168fd513b4508723e610339f808d8d1b0860c0164dbdc850d` | `role_id=AGDEV`，评定 `insufficient_evidence`，但与 learner 文件的 D0-03 执行状态矛盾 |
| `employee-growth-mvp/agent-developer/run-20261015/QA-FINAL.md` | `5a3b6ed956c7224fff0d0fedc02f4eb2c5462d20c87cede9e634fa5ba5f7db74` | 后续 QA 明确复核的是 AGDEV T1/T2/T3，不是 AI D0 |

身份核对结果：`AI` 期望值与所有收到的 D0/运行包 `AGDEV` 实际值不一致，记录为 `AI-D0-P1-ROLE-MISMATCH`。不能用显示名“Agent/AI”相似性消除唯一 `role_id` 要求。

## 环境、隔离和副作用

`D0-learner-responses.json` 的执行声明为 `local_static_only`：应用未启动、网络调用 0、真实模型调用 0、付费调用 0、工具写调用 0、数据库和账户改动 0，且 `qa_replay=false`、`runtime_receipt=null`。这支持“没有产生外部副作用”的范围结论，但不是实际模型或运行能力证据。

同目录的 AGDEV 后续 T1–T3 包另外记录 Node `24.16.0`、Python `3.14.5`、网络禁用和本地确定性 stub；其范围是 AGDEV 的 `agent-developer-mvp-20261015`，不能补齐 AI D0 的运行时环境或岗位契约。D0 自身没有 learner runtime 版本、执行命令、输入/输出哈希或 QA 回放收据。

## 五项 D0 字段核对

| D0 项 | AI 岗位应观察的内容 | 收到证据 | 结构状态 | QA 判断 |
| --- | --- | --- | --- | --- |
| D0-01 职责边界 | 模型服务契约、结构化输出、来源/预算字段、失败降级；明确不负责账户、前端、独立 QA | AGDEV 的 Agent 编排边界书面回答，含交接与停止条件 | 有五项回答，但 `role_id` 错；无 AI 交接签收或留出拒收 | `insufficient_evidence`；不能转为 AI 通过 |
| D0-02 机制解释 | 解释模型提议与宿主执行、schema 校验、部分输出/超时、来源冲突、预算和重试语义 | AGDEV 状态机与控制循环静态解释 | 只有静态文字；未观察 AI 模型服务或生成降级 | `insufficient_evidence` |
| D0-03 熟悉任务 | 无模型配置/确定性替身下交 `ModelRequest/Response` 或结构化输出和来源绑定；正常/部分/无配置可重放 | learner 文件中的 AgentSpec 与命中/no_match 轨迹标为 `not_run`；`source_hash=null`、`checkpoint_hash=null`；D0 评定另称两次内存 stub 已执行 | 执行状态、hash 与 QA 状态互相矛盾；没有 AI 任务产物 | `insufficient_evidence`，并登记 `AI-D0-P1-EVIDENCE-CONFLICT` |
| D0-04 失败识别 | 无配置、schema 错、部分输出、超时、预算不足、来源冲突时停止、保留原输出并交接 | AGDEV 静态失败台账；未做 AI 故障注入，未观察真实生成/调用计数 | 反例描述存在，实际失败收据缺失 | `insufficient_evidence` |
| D0-05 迁移预告 | 版本/模型/预算/权限变化下保留旧契约、迁移/回滚、未知效果和批准人 | AGDEV 迁移计划；无 AI 模型版本、配置版本、调用预算或回滚运行记录 | 只有计划，没有执行、接收或留出未知任务 | `insufficient_evidence` |

五项均未达到 AI D0 的可复核通过条件。静态回答的表达质量不等于 AI 岗位能力，AGDEV 后续 T1–T3 的通过也不能回填本次 D0。

## 原始失败、未知与交接

- **D0 原始失败**：没有 AI learner 的实际模型/替身运行失败收据。D0-04 是题目中的构造缺陷识别，不能写成学习者实际触发的失败。
- **相邻 AGDEV 开发失败**：后续运行包保留了路径编码、夹具重试次数和证据检查器的首次失败/返修；这些是 AGDEV harness 记录，不应移入 AI D0 的失败账本。
- **未知**：AI 模型配置是否存在、请求/响应 schema 是否可用、部分输出保留和来源绑定、供应商错误/超时、预算/usage、真实调用计费、模型版本漂移和降级行为均未验证。
- **交接**：D0 诊断的项目经理分派为 pending；learner 文件的独立复核为 `not_started`；没有 AI → FE/BE/CURR/ED/QA 的 AI 任务接收签收。AGDEV T1–T3 handoff 的接收只覆盖 AGDEV 本地 MVP。
- **侧效应**：按 learner 声明，网络、真实模型、付费服务、账户、数据库、外部写工具和应用入口均未使用；因此本轮没有外部副作用，也没有真实调用成功证据。

## L1 决定和缺陷

统一门槛要求 L1 至少有两个不同、可重建的沙箱工件、D1–D7 初步证据、版本/环境/输入输出哈希、一次停止/拒收/升级、相邻岗位签收和 QA 原例—回归—留出复验，并且没有开放 P0/P1。当前 AI 岗位缺少 AI 身份绑定、AI 任务夹具、运行收据、独立复验和签收，故：

| 项目 | 结论 |
| --- | --- |
| AI D0 结构 | `insufficient_evidence` |
| 临时起点 | `L0` / 受指导、无副作用沙箱；这是证据起点，不是能力否定 |
| L1 | `not_granted`；不可进入独立或受指导贡献门 |
| 真实职业能力 | `not_assessed` |
| 真实模型/用户价值/生产可靠性/成本/行业优势 | `not_assessed`，不由本报告推断 |

缺陷登记：

| 缺陷 ID | 严重级别 | 直接原因与影响 | 责任人 | 修复与复验 |
| --- | --- | --- | --- | --- |
| `AI-D0-P1-ROLE-MISMATCH` | P1 | D0 输入与后续运行均是 `AGDEV`，不满足目标 `AI`；若沿用会把 Agent 编排能力误报为模型生成能力 | PM + 课程架构师 | 重新冻结 `role_id=AI` 的合同、五项夹具和 learner 身份；QA 校验唯一 ID 后重审 |
| `AI-D0-P1-EVIDENCE-CONFLICT` | P1 | learner JSON/MD 将 D0-03 标成 `not_run`/无 hash，D0 evaluation 却记录两次已执行；无法判断是否有真实收据 | 课程架构师 + AI生成工程师 | 保留旧版；提供带 run_id、命令、环境、输入/输出/源 hash 的原始收据，QA 原例→回归→留出重放 |
| `AI-D0-P1-NO-D0-FIXTURE` | P1 | 诊断仍 `draft_for_freeze`、`fixture_hash=null`、PM assignment pending | PM + QA | 冻结 AI 任务合同、夹具哈希、环境、独立 reviewer，再开始新 D0 |

## 可执行的下一步

1. 项目经理为 `AI` 单独指定 learner、QA reviewer 和接收岗位，建立新的 `diagnostic_id`；不要复用 `D0-AGDEV-20261015-LOCAL-01`。
2. 课程架构师与 AI 岗位责任人冻结五项 AI 夹具：职责边界、生成机制、确定性结构化输出熟悉任务、无配置/部分输出/来源冲突失败识别、模型/预算/版本迁移预告。
3. 先在本地无网络确定性替身完成正常、无配置、schema 错/部分输出、来源冲突和超时五类可回放收据；严禁把替身写成真实模型调用。
4. 收集 learner 原始回答、产物、命令、运行时、fixture/source/input/output hash、首次失败和交接签收；QA 再按原例、受影响回归和未预告变体独立复验。
5. 在上述证据完成前，AI 岗位只允许阅读、观察和可重置无副作用练习；真实供应商、付费模型、外部写工具、账户/数据库和生产发布仍不在本次 D0 授权内。

本报告只判断当前 AI D0 证据是否可复核，未评价 AGDEV 产物的专业正确性，也未修改任何 learner、AGDEV 运行包、教材、应用、账户或数据库文件。
