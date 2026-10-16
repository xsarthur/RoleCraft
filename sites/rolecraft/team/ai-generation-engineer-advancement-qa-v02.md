# AI 生成工程师进阶方案与实训包独立 QA v0.2

- QA ID：`AI-ADV-TRAINING-QA-20261015-02`
- 日期/时区：2026-10-15（Asia/Shanghai）
- 责任岗位：测试工程师（QA）
- 目标岗位：AI 生成工程师（`AI`）
- 独立范围：只读复核课程架构修复后的进阶方案与三项本地隔离实训合同；不代学员执行，不修改作者文件，不授予 L1/L2。

## 收到版本与方法

| 文件 | SHA-256 |
| --- | --- |
| [进阶方案 v0.2](ai-generation-engineer-advancement-v02.md) | `d61e2d71eede535e8df4ea25a526650390ce401e453fe63219fe1a8e5fd9e30e` |
| [进阶方案 JSON](ai-generation-engineer-advancement-v02.json) | `0bdf99d6e679ec8755d0e79f29cf26e8df98b377d113a22f8c347d8bd9305f61` |
| [实训包 v0.2](ai-generation-engineer-practice-pack-v02.md) | `d205a81f3ae1d41810710e072bc3c906db83cb8cda469a4a5261ef1e13816077` |
| [实训包 JSON](ai-generation-engineer-practice-pack-v02.json) | `b1cb993bfb6310f5f872c23980ad60a8d6dbc91c64462bbf253302328ffa0f1a` |

在 Python 3.14.5 上完成 JSON 解析、跨文件 ID/字段、阶段闸门、`practice_crosswalk`、替身边界和状态检查。按实训包规定的 UTF-8、排序键、无尾换行、紧凑 JSON 规则重算三个 fixture hash；均匹配声明值。未使用网络、模型、LangGraph/API、云服务、付费 API、真实用户数据或外部动作。

| 练习 | 声明 hash | 重算结果 |
| --- | --- | --- |
| `AI-PRACTICE-SOURCE-001` | `5dc9f33ed3972dbff5118bc6977a66ccbd376bc6fcc54f15c9b1e26fda8db5e0` | 匹配 |
| `AI-PRACTICE-DURABLE-002` | `b186af6b08d2a5bf426a5529e19f4465452b620b98c802b8097b404e15d5efd2` | 匹配 |
| `AI-PRACTICE-GATE-003` | `9002b8bcef99feaa63d88c4c4d8f3eb16d22107b0ceb61e3820240bf709fe364` | 匹配 |

## 结论

- **本轮三个 P1 修复的静态规格：`met_within_scope`。** `E-AI-L0-003` 已成为 Stage A 的显式必交 D6 证据；Stage B 已使用独立 `U-AI-L1-001` 与新 EvidenceCard；两个 JSON 之间的机器可读 `practice_crosswalk` 一致且可重建。
- **方案与实训合同静态可执行性：`met_with_limitations`。** 三项练习的目标、夹具、正常/边界/失败、停止、首失败、回放、留出、交接、复核人和限制均保留。发现一项不阻断训练合同的 P2 数据形状问题：进阶方案 JSON 的 `source_records` 最后一项是裸字符串，前六项是带 `path/status` 的对象，机器消费时字段形状不一致。
- **实训执行：`not_assessed`。** 三项练习的 `decision` 仍为 `insufficient_evidence`；没有学习者原始诊断、原始工件、实际命令输出、首失败目录、返修差异、接收签收或独立运行报告。
- **当前等级：保持 `L0_guided`；D0 `not_assessed`；L1 `not_granted`；生产权限 `not_granted`。** 本轮关闭的是规格缺口，不是员工能力缺口；本地替身或静态 crosswalk 不能升级为真实模型/LangGraph/API 或生产耐久性证据。

## 检查结果

| 检查项 | 结论 | 证据与限制 |
| --- | --- | --- |
| 文件版本、JSON 可解析、角色和状态 | `pass` | 两份 v0.2 JSON 可解析；角色均为 `AI`；方案/实训包为 `training_specification_ready_not_assessed`；当前状态是 `L0_guided`/`not_granted`。 |
| Stage A 的 D6 产物是否进入 L0→L1 gate | `pass` | `stages[0].exercises` 含 `E-AI-L0-003`；`gate.must` 明确必交对应 EvidenceCard、D6 用户问题—质量/成本假设—停止线—方案取舍证据，并要求内容审校与 QA 复核。 |
| Stage B 是否使用独立迁移任务 | `pass` | `stages[1].transfer_tasks` 仅使用 `U-AI-L1-001`；artifacts 有其新 EvidenceCard；正文明确新 fixture、新卡和独立提示/停止计数，不复用 `U-AI-L0-001`。 |
| 机器可读 crosswalk | `pass` | 方案 JSON 与实训包 JSON 的 5 条数组逐项一致；每条都有 `practice_id/gap_id/stage_id/task_ids/evidence_card_ids/capability_dims/required_for_gate/gate/reviewers/limitations`；practice ID、阶段、任务、复核人均可解析。三项夹具练习和 Stage B 留出均有映射。 |
| 练习—证据—复核一致性 | `pass_with_limitations` | 三项练习 ID 唯一、每项有 EvidenceCard 提交、首失败/回归/留出/交接字段和独立 reviewer；`E-AI-L0-003` 作为独立 D6 产物写入 gate，但不作为 `practice_crosswalk` 的一条夹具练习记录，须按 gate 的 EvidenceCard 字段单独归档。 |
| 三个 fixture hash | `pass` | 三个声明 hash 均与规范化 `fixture` 重算值一致；这只证明合同夹具没有漂移，不证明练习已运行。 |
| 本地替身边界 | `pass` | `scope`、`execution_policy` 和各练习限制均写明网络/真实模型/LangGraph/API/付费 API/云/真实用户数据/外部动作关闭；各 exercise 为 `sandbox_independent`。 |
| 训练状态与晋级防误报 | `pass` | 三个 exercise 的 `decision` 均为 `insufficient_evidence`；progression gate 写明不授 D0、L1、生产权限、真实模型能力或岗位认证，且 `current_decision=not_assessed`、`l1_decision=not_granted`。 |
| 独立职责与接收边界 | `pass` | QA 负责运行/失败/迁移，内容审校员负责机制/来源/限制，接收岗位负责签收或拒收，PM 只汇总；作者不得用自评签署晋级。 |
| 来源记录机器形状 | `pass_with_limitations` | `advancement-v02.json source_records` 前六项为对象，末项为裸字符串 `ai-generation-engineer-advancement-qa-v01.json`；不改变本轮 P1 修复判断，但会阻碍严格的 `path/status` 机器消费。 |

## P2 缺陷与修复条件

### QA-AI-ADV-P2-001：`source_records` 混用对象和裸字符串

- **位置**：`ai-generation-engineer-advancement-v02.json` 的 `source_records` 最后一项。
- **事实**：前六项都包含 `path` 与 `status`（其中一项还有 `resource_id`），最后一项只是一段文件名字符串。
- **影响**：严格按来源记录合同读取时，无法对最后一项取得 `path/status`；来源审计和自动交接需要特判。
- **修复条件**：改为对象，例如 `{ "path": "sites/rolecraft/team/ai-generation-engineer-advancement-qa-v01.json", "status": "reviewed_with_limitations" }`，或明确既有报告的状态字段并同步 MD/JSON 版本。修复后由 QA 重算文件 hash 和 source_records 形状。
- **责任人**：课程架构师负责源文件，项目经理负责版本交接。
- **本轮门槛影响**：P2，不重新打开已经关闭的三个 P1；在严格机器索引接入前应修复。

## 未执行和不能推断的事项

- 没有学习者五项 D0 原始回答、原始作品、独立 EvidenceCard 或能力评分。
- 没有执行三项实训的正常/边界/故障注入、返修、原例回归或非作者留出；没有验证学习者是否保存首失败或按停止条件停线。
- 没有真实 LangGraph/API、模型、供应商失败、费用、延迟、限流、生产持久存储、进程重启或真人审批。
- 没有后端数据工程师对权限/持久性的实际签收，也没有接收岗位实际签收/有据拒收或综合未知任务。
- 没有真实用户、同行、专家或生产反馈，因此不能判定 L1/L2/L3/L4、职业认证、用户价值或行业先进性。

## 下一步

1. 课程架构师/PM 修复 `source_records` 的对象形状并保留本 v0.2 QA 证据。
2. PM 冻结 v0.2 四个文件及 crosswalk，先收集学习者 D0 原始诊断，再执行三项隔离练习。
3. 学习者提交每项 EvidenceCard、首失败、返修差异、原例回归和非作者留出；QA 与内容审校员分开复核，接收岗位签收或有据拒收。
4. 收齐真实或明确授权的 LangGraph/API、模型质量/成本/限流、真实持久恢复和综合未知任务证据后，再单独评估 L1；本报告不授予 L1。

**最终 QA 结论：`met_with_limitations`（规格范围，三个 P1 已关闭）；训练执行与员工能力：`not_assessed`；当前保持 `L0_guided`，L1 未授予。**
