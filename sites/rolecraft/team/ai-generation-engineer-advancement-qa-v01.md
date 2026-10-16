# AI 生成工程师进阶方案与实训包独立 QA v0.1

- QA ID：`AI-ADV-TRAINING-QA-20261015-01`
- 日期/时区：2026-10-15（Asia/Shanghai）
- 责任岗位：测试工程师（QA）
- 目标岗位：AI 生成工程师（`AI`）
- 独立范围：只读检查进阶方案和三项实训合同；不代学员执行，不修改作者文件，不授予 L1/L2

## 收到版本与检查方法

本次收到并冻结了以下版本：

| 文件 | SHA-256 |
| --- | --- |
| [进阶方案 v0.1](ai-generation-engineer-advancement-v01.md) | `5aa3d9b0598aa2bfc3eff5c448018c57782f61008fcfe82861b0ba8ce9b3842f` |
| [进阶方案 JSON](ai-generation-engineer-advancement-v01.json) | `ba460ad904e1b3e187cdf946868bd9af8397254fc155943eb1455ba469607c8c` |
| [实训包 v0.1](ai-generation-engineer-practice-pack-v01.md) | `04ac9db9dc611882efc54457a7912bffbdf7a1b0711306fe4f758af79495e171` |
| [实训包 JSON](ai-generation-engineer-practice-pack-v01.json) | `7e679a5600e8be4de5787633859d4ed91afeaa396bce255e81e6e88aa77e07e0` |

在 Python 3.14.5 上完成了 JSON 解析、字段和跨文件静态检查，并按实训包规定的 UTF-8、排序键、无尾换行、紧凑分隔符规则重新计算三个 `input_fixture_hash`。三个哈希均与文件声明一致：

| 练习 | 结果 |
| --- | --- |
| `AI-PRACTICE-SOURCE-001` | `5dc9f33ed3972dbff5118bc6977a66ccbd376bc6fcc54f15c9b1e26fda8db5e0`，匹配 |
| `AI-PRACTICE-DURABLE-002` | `b186af6b08d2a5bf426a5529e19f4465452b620b98c802b8097b404e15d5efd2`，匹配 |
| `AI-PRACTICE-GATE-003` | `9002b8bcef99feaa63d88c4c4d8f3eb16d22107b0ceb61e3820240bf709fe364`，匹配 |

## 结论

- **方案与实训合同静态可执行性：`met_with_limitations`。** L0/L1/L2 的目标、证据类型、停止条件、职责分离和不自动晋级规则已写出；两个门槛映射缺陷需要责任人修订后才能稳定执行。
- **实训执行：`not_assessed`。** 三项练习的 `decision` 仍为 `insufficient_evidence`，没有学习者原始回答、运行输出、首失败目录、返修差异、接收签收或 QA 实跑记录。
- **当前等级：保持 `L0_guided`；D0 `not_assessed`；L1 `not_granted`；L2 不可评估。** 本地替身规格、阅读或方案完成不构成能力证据。

## 检查结果

| 检查项 | 结论 | 证据与限制 |
| --- | --- | --- |
| 文件版本、JSON 可解析、角色和状态 | `pass` | 两份 JSON 可解析；角色均为 `AI`；方案和实训包均写明 `training_specification_ready_not_assessed`；当前状态仍是 `L0_guided`/`not_granted`。 |
| L0→L1 可观察门槛 | `pass_with_limitations` | 有五项学习者 D0 原始回答、两个沙箱、D1–D5、失败/迁移、独立复核和 P0/P1 阻断条件；但 Stage A 已新增 `E-AI-L0-003`，门槛仍只写“两个可重建沙箱/上述两个沙箱工件”，未明确方案取舍卡是否是必交及 D6 如何计入。见 `QA-AI-ADV-P1-001`。 |
| L1 受指导贡献门槛 | `pass_with_limitations` | 有两个沙箱持续通过、失败恢复、拒收/补件、来源字段和 QA/REV 条件；Stage B 的 `transfer_tasks` 仍复用 `U-AI-L0-001`，没有独立的 L1 留出任务或明确“新卡/新约束”规则。见 `QA-AI-ADV-P1-002`。 |
| L1→L2 门槛 | `pass_with_limitations` | 隔离真实形状任务、留出、恢复、质量/成本/延迟、跨岗签收和最差案例复验均列出；方案明确真实运行时/模型不可访问时不能以离线替身判定 L2。尚无任何实际运行证据。 |
| L2 稳固与 61–90 日迁移 | `pass` | 双约束未知任务、盲测反例、连续情境、辅导复用、最差案例和外部证据边界均有退出条件；当前只完成规格。 |
| EvidenceCard 合同 | `pass` | 方案列出 42 个唯一必填字段，含 `learner_raw`、环境、授权、来源四元组、首失败、停止、回归、迁移、签收、独立复核和 `external_action`；缺关键字段保持 `insufficient_evidence`。 |
| 来源与版本字段 | `pass` | `document_id/source_version/location/hash/hash_type/claim_type/recheck_at/access` 已列出；练习一的 claim 绑定验收与夹具 hash 可重算。逐条内容是否真实支持仍须 REV 实审。 |
| 三项练习合同 | `pass` | `SOURCE-001`、`DURABLE-002`、`GATE-003` 均有目标、先修、夹具、正常/边界/失败、停止条件、提交物、哈希/重放、留出、交接和限制。 |
| 首失败、回归、留出、停止 | `pass` | 三项均明确 `first_failure/`、修复差异、run-1/run-2、非作者留出和停止条件；SOURCE 留出替换来源，DURABLE 只改事件顺序，GATE 只改人工审批要求。是否实际发生需训练后复验。 |
| Durable/GATE 特殊边界 | `pass` | GATE 明确由 `legacy_status=draft_ready_for_review` 映射 v3 `status`，缺失则 `MIGRATION_MISSING_STATE`；DURABLE holdout 只改 `event_order`。这仍是本地文件替身，不能写成生产耐久性。 |
| 本地替身与真实能力边界 | `pass` | 方案和实训包均明确不运行真实模型、LangGraph/API、云、收费 API、生产库或外部动作；未运行项必须写 `not_run`，不能替代 L2 或生产能力。 |
| 独立复核和职责分离 | `pass` | AI 生成工程师执行，QA 复跑运行/失败/迁移，REV 核机制/来源/边界，涉及账户和持久性时由后端复核，接收岗位签收/拒收，PM 只汇总；作者不得自审晋级。 |
| 30/60/90 节奏 | `pass` | D0–D7、D8–D14、D15–D30、D31–D45、D46–D60、D61–D75、D76–D90 均有产物和闸门；训练尚未执行。 |
| 方案—实训包交接 | `fail_with_open_p1` | 方案使用 `E-AI-L0-*`、`W-*`、`U-*` 等任务 ID，实训包使用 `AI-PRACTICE-*`，未给出三项练习如何满足具体阶段/缺口/闸门的机器可读 crosswalk。见 `QA-AI-ADV-P1-003`。 |

## 缺陷与修复条件

### QA-AI-ADV-P1-001：Stage A 的 D6 产物未纳入 L0→L1 闸门

- **位置**：`ai-generation-engineer-advancement-v01.md` 阶段 A 练习与“L0→L1 准入条件”；对应 JSON `stages[0].exercises` 与 `stages[0].gate.must`。
- **事实**：阶段 A 现在有 `E-AI-L0-001`、`E-AI-L0-002`、`E-AI-L0-003`，其中 `E-AI-L0-003` 是方案取舍卡；闸门仍要求“两个可重建沙箱/上述两个沙箱工件”，没有写出第三项是否必交，也没有明确 D6 的最低证据。
- **影响**：两个独立复核者可能用不同的作品集合判断 L1，导致门槛不可重复执行；D6 可能被“有计划”或被完全忽略。
- **修复条件**：产品/课程责任人明确 `E-AI-L0-003` 为必交并为其定义 EvidenceCard、D6 观察断言和复核人，或明确其为可选补学并从阶段 A 交付集合移除；同步 MD、JSON 和 30 日闸门。
- **责任人**：课程架构师；PM 负责版本交接；QA 复验。

### QA-AI-ADV-P1-002：Stage B 复用 Stage A 留出任务

- **位置**：`ai-generation-engineer-advancement-v01.json` 的 `stages[1].transfer_tasks`；目前值为 `U-AI-L0-001`，与 Stage A 相同。
- **影响**：L1 受指导贡献没有明确的阶段内迁移夹具；重复同一任务不能证明在新情境中的独立迁移，也与“两个不同沙箱持续通过”不完全对应。
- **修复条件**：新建 `U-AI-L1-001`（非作者冻结、至少一项新约束），或在 JSON/MD 明确这是一次独立重冻结、使用新 fixture hash、重新计数提示/停止/未测范围并生成新 EvidenceCard；不能只复用旧卡片。
- **责任人**：课程架构师/AI 生成工程师；QA 复验。

### QA-AI-ADV-P1-003：方案与实训包缺少 crosswalk

- **位置**：进阶方案 `gaps/stages/promotion_rules` 与实训包 `exercises/progression_gate` 之间。
- **事实**：三项练习 `AI-PRACTICE-SOURCE-001`、`AI-PRACTICE-DURABLE-002`、`AI-PRACTICE-GATE-003` 各自有缺口和结果，但没有字段说明它们分别关闭 `G-AI-04/05/06`，也没有说明它们属于 Stage A 的哪个 E/U/W 任务、哪些练习结果计入 L1 闸门。
- **影响**：执行者需要临场解释任务关系，无法从单一版本重建“练习 → 能力维度 → 晋级闸门”的证据链。
- **修复条件**：新增并冻结 `practice_crosswalk`（MD 表和 JSON 数组均需有）：`practice_id`、`gap_id`、`stage_id`、`evidence_card_ids`、`capability_dims`、`required_for_gate`、`reviewers`、`limitations`；更新训练入口，不覆盖旧 D0。
- **责任人**：课程架构师；PM 负责交接；QA 复验。

## 未执行和不能推断的事项

以下不是本次静态 QA 的通过项：

- 没有学习者五项 D0 原始回答、原始作品、独立 EvidenceCard 或能力评分。
- 没有执行三项实训的正常、边界、故障注入、返修、原例回归或留出；没有验证学习者是否保存首失败或按停止条件停线。
- 没有真实 LangGraph/API、模型、供应商失败、费用、延迟、限流、生产持久存储、进程结束恢复或真人审批。
- 没有后端数据工程师对账户/权限/持久性签收，也没有 QA/REV/接收岗位的实际签收或有据拒收。
- 没有综合未知任务、真实内部授权、真实用户/同行/专家/生产反馈，因此不能判定 L1/L2/L3/L4、职业认证、用户价值或行业先进性。
- 三个夹具 hash 的静态匹配只证明合同数据未漂移；不能证明实现、运行输出、模型质量或迁移能力。

## 可执行性与下一步

在三个 P1 修复前，方案适合作为“有明确限制的训练规格”，不适合作为唯一晋级判定合同。修复后建议按以下顺序执行：冻结 crosswalk 和阶段 A/B 任务版本 → 由学习者完成 D0 原始诊断 → QA 冻结夹具并记录环境/命令 → 学习者独立提交三项练习和 EvidenceCard → REV 与 QA 分开复核 → 原例两次字节重放 → 受影响回归 → 非作者留出 → 接收岗位签收或有据拒收 → PM 引用具体 EvidenceCard、复核报告和缺陷状态后，才评估 L1。真实运行时、模型、耐久存储、成本/质量、真人审批和真实形状任务只能在另外的授权合同下进入 L2 评估。

**最终 QA 结论：`met_with_limitations`（静态规格范围）。训练执行与员工能力：`not_assessed`；当前等级保持 `L0_guided`，L1 未授予。**
