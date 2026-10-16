# AI生成工程师 L0→L1 门槛独立复核 v0.1

- 复核日期：2026-10-15（Asia/Shanghai）
- 复核岗位：测试工程师（独立复核）
- 范围：按 `ai-generation-engineer-advancement-v03.json` Stage A/L0→L1 gate.must，核对 D0、SOURCE-001、DURABLE-002 v04、GATE-003 v06 及其 QA/内容审校证据。
- 结论：`remain_L0_guided`
- 说明：本报告只评估证据，不授予 L1，也不替学习者、内容审校、真人接收方签收。

## 门槛逐项核对

| gate.must | 结果 | 证据与判断 |
|---|---|---|
| 五项学习者 D0 原始回答 | **未满足** | `ai-generation-d0-v04-p1-repair.json` 的 `diagnostic_id=D0-AI-20261015-001` 仍为 `decision=not_assessed`；D0 QA 明确 D0-01/02 原始回答、完整 EvidenceCard、学习者迁移仍未完成。现有 practice `learner_raw.json` 仅为 local-sandbox-learner 的观察笔记，不能替代五项 D0 原始回答。 |
| D1–D5 初步证据 | **部分/未满足** | SOURCE-001 覆盖来源绑定、边界、拒绝；DURABLE-002 覆盖局部恢复/回放；GATE-003 覆盖 schema/人工 gate 模拟。三份 QA 均保留 local-only 限制，缺同一学习者绑定的完整 D1–D5 EvidenceCard、真实/未知任务作品与接收签收。 |
| 原例/回归/留出 | **局部满足** | SOURCE-001 原例、四类首失败、动态 holdout 和双回放通过；DURABLE-002 v04 三次 run 字节一致、四类首失败和事件顺序 holdout 通过；GATE-003 v06 manifest/hash/逻辑一致、schema_unknown_field 首失败和 holdout 存在。均为本地确定性夹具，不能外推真实运行时能力。 |
| 独立 QA 与内容复核 | **部分满足** | D0 v04 有独立 QA 与内容审校，SOURCE-001、DURABLE-002 v04、GATE-003 v06 均有独立 QA/内容复核记录；结论都带 `met_with_limitations`/`reviewed_with_limitations`。GATE-003 QA 仍记真人 QA 签收待完成，不能作为完整 gate 关闭。 |
| 无未关闭 P0/P1 | **未满足** | D0 v04 内容审校仍列 CR-06～CR-10 开放 P2，且 D0/训练未评估；advancement v03 的 G-AI-01/02/03/05/07/08/09/10 等准入缺口没有被本轮材料完整关闭。至少学习者 D0、第二独立沙箱/真实运行、真人审批签收与未知迁移仍未闭合，故不能判定“无未关闭 P1”。 |
| 两个可重建沙箱工件（E-AI-L0-002 及 EvidenceCard） | **局部满足，gate 未满足** | DURABLE-002 v04 与 GATE-003 v06 各自有可重放本地工件和 EvidenceCard/manifest；但不是已绑定学习者五项 D0 的完整 E-AI-L0-002 双沙箱提交，且 GATE-003 QA 明确 local-only、真人签收待完成。 |
| E-AI-L0-003 方案取舍卡及 EvidenceCard（D6） | **未满足/未提供** | 输入集合未见独立的 E-AI-L0-003 方案取舍卡，亦未见满足“用户问题—质量/成本假设—停止线—方案取舍”并经内容审校与 QA 复核的 EvidenceCard。不能以现有 SOURCE/DURABLE/GATE 夹具替代。 |

## 关键边界与未验证项

- 证据显示的是本地 Python/原子 JSON/确定性状态机夹具；未验证真实模型、LangGraph、供应商 API、数据库/队列持久恢复、真实进程崩溃、RPO/RTO、并发、费用、延迟或限流。
- 人工 gate/审批和 handoff 为模拟收据；未有真人专家或接收岗位签收，作者不得自签晋级。
- 未有非作者冻结的未知迁移任务及可复核的学习者解释；不能把原题回放当迁移能力。
- D0、三项实训的局部 QA 通过不等于学习者能力认证；L1 仍未授予，生产权限仍未授予。

## 决定与复验条件

当前决定为 `remain_L0_guided`，而非 `l1_reviewable`：Stage A 的必需学习者原始证据、D6 方案取舍卡及 P1 关闭证据尚不齐全。下一次复核应至少收到：同一 diagnostic_id 绑定的五项 D0 原始回答与完整 EvidenceCard；两个非同构可重建沙箱及失败/回归/留出；E-AI-L0-003 方案取舍卡；独立 QA、内容审校和接收方有据签收/拒收；对真实运行时或明确未运行范围的可核证记录；以及所有 P1 的逐项关闭与复验记录。

### 输入记录

- `sites/rolecraft/team/ai-generation-engineer-advancement-v03.json`
- `sites/rolecraft/team/ai-generation-engineer-advancement-qa-v03.json`
- `sites/rolecraft/team/ai-generation-d0-v04-qa.json` / `ai-generation-d0-v04-content-review.json`
- `sites/rolecraft/team/ai-generation-l0-practice-source-001-qa-v01.json` / `ai-generation-l0-practice-source-001-content-review-v01.json`
- `sites/rolecraft/team/ai-generation-l0-practice-durable-002-qa-v04.json` / `ai-generation-l0-practice-durable-002-content-review-v04.json`
- `sites/rolecraft/team/ai-generation-l0-practice-gate-003-qa-v06.json` / `ai-generation-l0-practice-gate-003-content-review-v06.json`
