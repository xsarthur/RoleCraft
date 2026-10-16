# AI 生成工程师 D0-01/02/04/05 预检盘点 v0.1

- 日期：2026-10-16（Asia/Shanghai）
- 角色：测试工程师（独立只读盘点）
- 范围：D0-01、D0-02、D0-04、D0-05 的既有合同、练习包、学习者证据、QA/接收状态和可复用脚手架。
- 目的：为下一次真实学习者会话给出动作、复验、收据、脚手架和缺口矩阵；不判定学习者通过，不授 D0/L1/L2。
- 只读边界：未修改学习者文件、旧 QA、教材、应用、数据库或用户记录。

## 证据基线

1. 练习规格是 `team/ai-generation-engineer-practice-pack-v01.json/.md`（三个练习：SOURCE-001、DURABLE-002、GATE-003），状态 `training_specification_ready_not_assessed`；其 progression gate 明确要求 D0-01/02 学习者原始诊断、独立 QA、接收方签收和非作者留出。
2. 三个练习已有独立 QA，均为本地确定性范围的 `met_with_limitations`：`ai-generation-l0-practice-source-001-qa-v01.md`、`...durable-002-qa-v04.md`、`...gate-003-qa-v06.md`。它们是可复用夹具/QA基线，不是学习者本人执行证据。
3. 最新汇总包 `ai-generation-l0-learner-handoff-v19/` 只有 D0-05 的执行工件；D0-01、D0-02、D0-04 卡片各只指向 `d0-05/first_failure.json`，且卡片/manifest/script 内 `version=v18` 与目录/ID v19 不一致。最新 handoff QA（`ai-generation-l0-learner-handoff-qa-v19.md`）因此为 `met_with_limitations`，并保留版本一致性缺口。
4. 真实学习者目前已有 D0 原始文字回答（`ai-generation-real-learner-d0-20261016-v01.md`），但此前独立记录明确 A/B 实际执行、来源停止、幂等/超时/schema/部分响应及接收签收仍待补齐；D0 仍 `not_assessed`。

## 预检矩阵

| 题目 | 现有合同/练习与可复用脚手架 | 下一次学习者必须亲自完成并保存 | QA 独立动作与接收收据 | 真正缺口/当前状态 | 能否合并到一次会话 |
|---|---|---|---|---|---|
| **D0-01 生成服务边界与来源/权限责任** | 可复用 SOURCE-001 的 `F-AI-SOURCE-CLAIM-v1`、`frozen_input.json`、`replay_verify.py`、四类 `first_failure/`、claim matrix、run-1/run-2、holdout；原始回答已有边界文字（`learner_raw.json`/`ai-generation-real-learner-d0-20261016-v01.md`）。 | 在本人会话写出责任边界、授权工具/租户/版本、事实/推断/未知及 stop 条件；亲自运行 A-normal、B-tenant-denied、source-missing、source-conflict；提交每条 claim 四元组+正文 hash、原始 stdout/stderr、退出码、输入/输出 hash、未访问/B 文本不泄漏证据、EvidenceCard。 | QA 从冻结输入独立重跑四 case，核首失败发生在 draft 前、B 正文未进输出/缓存、A claim 与工具收据逐字一致，比较 run-1/run-2 字节并执行未公开 holdout；接收方写 `accepted` 或有据 `rejected`，不得由学习者自签。 | 当前只有文字回答和作者/代理夹具；没有 D0-01 独立学习者四 case 原始收据、完整独立 card 或真实 receiver receipt。SOURCE-001 QA 只能复用本地夹具结论。 | **可合并**：与 D0-02 共用一次说明/运行前置；但四 case 和 card 必须逐题分开。 |
| **D0-02 显式状态、输出契约与未知处理** | 可复用 D0 输出 schema `ai-generation-d0-output-v3`、状态序列和 SOURCE-001 deterministic renderer；旧 handoff 里的 `mechanism-state-receipt.json` 只证明文本标签，不能替代执行。 | 亲自定义并运行状态机：`start→tool_returned→source_checked→draft_ready`；缺失/冲突/不确定时进入 `recovery_required` 或 `blocked`，不猜测；逐字段记录 schema、unknown、source_refs、external_action=null，并保留首失败与修复 diff。 | QA 独立注入空工具、schema 缺字段/未知字段、来源冲突、超时/部分响应，核 schema 失败先于 draft/handoff、状态迁移合法、unknown 不伪造、外部动作为空；重放并收取逐字段 EvidenceCard 与 receiver receipt。 | 既有 D0-01/02 card 在 v19 只复用 D0-05 first_failure；无本人状态执行日志、无逐字段输出/错误矩阵、无独立超时/部分响应复验。状态名历史还有 `source_checked`/`checked` 漂移，需会话前冻结。 | **可合并**：与 D0-01 同一实现/输入可产生状态收据；QA 要保留 D0-02 独立断言和 card。 |
| **D0-04 durable checkpoint、幂等回调与恢复** | 可复用 `ai-generation-l0-practice-durable-002-v04`、三次 run manifest、事件日志、checkpoint hashes、四类 first_failure、recovery receipt、event-order holdout；独立 QA v04 已核本地幂等/重放。 | 本人实现/运行隔离 checkpoint：同 callback_id 相同 payload 重用、不同 payload 首失败；注入半 JSON、旧版本、崩溃后部分草稿；保留 `manual_stop→replay_required→replayed→checked→handed_off` 全链、每事件/检查点 bytes+SHA、run-1/run-2、顺序 holdout，不删除首失败。 | QA 在独立临时目录重跑、篡改 checkpoint、执行反向 callback 顺序和未知故障；核不生成第二份 draft、旧/损坏 checkpoint 不被采用、manifest 可重算；接收方核本地 handoff 只代表 fixture scope 并签收/拒收。 | 本地 Durable-002 QA 通过仅限作者夹具；没有真实学习者本人运行收据、真实进程崩溃/持久库、并发/RPO/RTO、真人签收。v19 D0-04 card 未绑定任何 D0-04 工件。 | **部分可合并**：可与 D0-05 在同一隔离目录/一次会话运行，但故障注入、manifest、card 和 QA 断言必须独立。 |
| **D0-05 单约束迁移/回归/陌生留出与停止** | 可复用 handoff v19 的 `d0-05/{matrix,execution-log,first_failure,holdout-input,holdout-output}` 及 `run_bundle.py`；但该包的 holdout/first_failure 绑定和版本字段仍有已知限制。GATE-003 v06 另有 schema/人工 gate/迁移、validator、单约束 holdout 的可复用完整夹具和 QA。 | 本人从冻结 baseline 运行 first_failure→repair regression→独立未知 holdout；只改变一个约束，逐字段记录 `schema/source_refs/tenant/source_version/status`、输入/输出 hash、停止点、execution log、未验证项；提交与题目独立的 D0-05 card，不借用 D0-04 文件。 | QA 不预先公开 holdout，独立核字段级预期/观察映射、事件序号、first_failure 与 holdout 内容差异、run 重放和 single-constraint；接收方核版本、范围、人工 gate 只作模拟并签收/拒收。 | v19 D0-05 已有结构性执行工件，但 handoff QA 发现目录/ID v19 对内部 `version=v18`；历史 v15/v18 还出现 holdout 路径/重复绑定缺陷。没有真实学习者本人执行和接收签收；未知任务仍非真实迁移能力。 | **可合并但需隔离收据**：与 D0-04 同会话共享 runner/manifest 工具，D0-05 的 baseline/holdout/card/QA 判定不能与 D0-04 合并成一张证据卡。 |

## 建议的一次用户会话编排

可以把四题安排在一次**真实学习者**会话中，但需把“说明/实现/运行/收据”按题目分段，不能生成一个总卡替代逐题证据：

1. 会话开始冻结合同版本、四个输入 fixture 的规范化 hash、状态命名和隔离目录；学习者本人确认命令和网络/模型/付费/外部动作均关闭。
2. 先做 D0-01→D0-02：同一来源场景完成边界说明、A/B/缺失/冲突和显式状态输出；分别写 D0-01、D0-02 原始 stdout/stderr 与 EvidenceCard。
3. 再做 D0-04：使用独立 durable fixture 注入重复回调、损坏/旧 checkpoint、崩溃后部分结果；保存逐事件/检查点 hash、首失败和恢复链。
4. 最后做 D0-05：从冻结 baseline 做单约束 regression 与未公开 holdout；保存字段级矩阵和版本一致的执行日志。
5. 学习者提交四张独立 card 和 manifest；QA 在作者不改结论的临时副本中依序做原例、受影响回归、未知 holdout；QA 与接收方分别产生独立收据。

“一次会话”只能节省前置说明和隔离环境成本，不能合并四题的输入、首失败、hash、QA 判定或签收。若时间不足，应保留未完成题的 `pending/insufficient_evidence`，不得用 D0-05 结构卡填充 D0-01/02/04。

## 预检结论

当前可复用资产足以快速重建四题本地预检，但**不存在四题完整的真实学习者原始动作+逐题独立 QA+接收收据闭环**。下一次会话的最小收口是：D0-01/02 真实四场景与状态故障收据；D0-04 个人幂等/崩溃链；D0-05 字段级单约束未知留出；四张独立 EvidenceCard；QA 原例/回归/holdout 报告；接收方逐题签收或有据拒收。完成前保持 `D0/L0 not_assessed`、`L1/L2 not_granted`。
