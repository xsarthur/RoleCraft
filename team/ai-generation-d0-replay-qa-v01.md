# AI 生成工程师 D0 本地重放独立 QA v0.1

- QA ID：`AI-D0-REPLAY-QA-20261015-01`
- 日期/时区：2026-10-15 / Asia/Shanghai
- 复核岗位：测试工程师（独立复核；未修改作者文件）
- 目标岗位：`AI` / AI 生成工程师
- 诊断：`D0-AI-20261015-001`
- 重放：`D0-AI-20261015-001-R1`
- 总体结论：`insufficient_evidence`；D0 仍 `not_assessed`
- L1：`not_granted`；保持 L0/受指导状态

本轮只复核 `ai-generation-d0-v01-initial.*`、`ai-generation-d0-v02-replay.*` 及 `/private/tmp` 本地确定性夹具和输出。没有把历史 AGDEV 记录迁移为 AI 证据，没有调用真实模型/API，没有修改教材、应用、账户、数据库或作者文件。

## 复核方法和收到版本

先计算收到文件和运行物的 SHA-256，再用同一命令独立重放一次到临时输出，并对 JSON 和字节结果比较。QA 重放命令为：

```text
python3 /private/tmp/ai_generation_d0_fixture_v1.py > /private/tmp/ai_generation_d0_qa_rerun.json
```

| 证据 | 观察到的 SHA-256 | 结果 |
| --- | --- | --- |
| `sites/rolecraft/team/ai-generation-d0-v01.md` | `4a97347a91e96c07e2d84e37f22011be15890a5d955da950fd8b1a27c0aeef6d` | 与 `v01-initial.md` 一致 |
| `sites/rolecraft/team/ai-generation-d0-v01-initial.md` | `4a97347a91e96c07e2d84e37f22011be15890a5d955da950fd8b1a27c0aeef6d` | 保留原始输入 |
| `sites/rolecraft/team/ai-generation-d0-v01.json` | `069cee385c47889cadcfa32e4605cd368eb089d62c529af629ad443d2f1ebebf` | 与 `v01-initial.json` 一致 |
| `sites/rolecraft/team/ai-generation-d0-v01-initial.json` | `069cee385c47889cadcfa32e4605cd368eb089d62c529af629ad443d2f1ebebf` | 保留原始输入 |
| `/private/tmp/ai_generation_d0_fixture_v1.py` | `fddcf6f9660b5c68079057ffb0fb170aa11e39e0c9379ff9ad95c32be7d39bde` | 与 replay 记录一致 |
| `/private/tmp/ai_generation_d0_run_v2.json` | `399797452164d129d1e733159545f757bf8ae665981a4728ef5ddda132bd268b` | 与 replay 记录一致 |
| QA 独立重放 `/private/tmp/ai_generation_d0_qa_rerun.json` | `399797452164d129d1e733159545f757bf8ae665981a4728ef5ddda132bd268b` | 与 v2 字节相同，JSON 也相同 |

运行环境为 Python `3.14.5`、`macOS-26.6.2-arm64-arm-64bit-Mach-O`。脚本是确定性本地替身，未见网络、真实模型、付费 API、真实密钥、真实用户数据或外部写入；临时输出只写入 `/private/tmp`。

## 重放证据

| 检查项 | QA 观察 | 结论 |
| --- | --- | --- |
| 身份 | initial/replay 均为 `role_id=AI`、AI 生成工程师；诊断和重放 ID 一致 | pass |
| 原始/返修保留 | initial 副本与 v01 原始文件逐字一致；replay 是追加记录，没有覆盖旧输入 | pass |
| 命令和夹具 | replay 中命令、脚本路径、脚本 hash、fixture hash 与实际文件一致 | pass |
| 状态序列 | QA 重放为 `start → tool_called → tool_returned → drafted → checked → handed_off`；与 v02 JSON 的 expected/actual 一致，输出字节相同 | pass（见状态名限制） |
| 租户边界 | 身份租户 A；读取 `doc-A-refund-v1`；结果不含 `doc-B-private-v1` 或 `B-PRIVATE` | pass |
| 引用 | `document_id=doc-A-refund-v1`、`source_version=fixture-source-v1`、原文“退款需复核。”均出现在结果和交接草稿 | pass |
| 结构化输出 | 文本、citations、`external_action=null` 和交接状态 `draft_ready_for_review` 存在 | pass |
| 外部动作 | `external_action` 为 JSON null；脚本没有外发调用；不能外推真实供应商/生产安全 | pass（仅本地范围） |
| 未验证声明 | replay 保留真实模型、LangGraph、外部副作用/生产恢复、未知任务、独立复核、迁移和能力认证等未知项 | pass |

### 状态合同限制

原始 D0 规划中的预期序列写作 `... → drafted → source_checked → handed_off`，而 v02/replay fixture 使用 `... → drafted → checked → handed_off`。`checked` 的原因文本确实包含 schema、来源绑定、租户边界和无发送检查，但没有记录状态命名变更或合同版本升级。因而重放相对 v02 自身可复现，跨原始 D0 合同的状态名称追踪为 `partial`，登记 `AI-D0-REPLAY-QA-P2-STATE-NAME-DRIFT`，责任人 AI + CURR；应在下一版合同中明确别名/迁移并对原例复验。

## D0 五项完整性

| D0 项 | 当前证据 | QA 结论 |
| --- | --- | --- |
| `D0-AI-01` 职责边界 | role_id 正确，Markdown/JSON 有 AI 模型生成服务边界、禁区和升级描述；没有独立 learner session/EvidenceCard 或留出反例 | `partial_static` |
| `D0-AI-02` 机制解释 | 有显式状态、工具契约、来源和恢复规则的书面解释；真实 LangGraph、模型和生产存储未验证 | `partial_static` |
| `D0-AI-03` 熟悉任务 | 一个本地确定性替身实际通过上述租户、引用、结构化和无外发断言；没有第二个不同夹具 | `passed_local_fixture_only` |
| `D0-AI-04` 失败识别 | 书面识别“持久化失败后错误 completed”的风险及停止动作；没有实际故障注入、原始失败轨迹或恢复重放 | `insufficient_evidence` |
| `D0-AI-05` 迁移预告 | 有 `U-AI-D0-T1` 计划、停止条件和复核步骤；陌生任务、留出变体和交接尚未执行 | `insufficient_evidence` |

因此，D0 五项的记录存在且身份正确，但并未全部形成可运行、可独立复验的原始证据。`training_status=in_progress`、总体 `decision=not_assessed` 仍是正确状态；本次本地重放不能把 D0 改成通过。

## L1 门槛与决定

训练规范要求 L1 至少有两个不同夹具的可重建工件、每个工件的完整 EvidenceCard、相邻岗位签收或有据拒收、关键维度证据和无 P0/P1。当前只有一个正常确定性替身重放；没有第二夹具、失败/降级工件、完整 EvidenceCard、相邻岗位签收、未知任务或独立内容审校/QA 之前的复验记录。因此：

- `replay_evidence`: `met_within_scope`（v02 本地 fixture 的哈希、输出和边界可重放）；
- `d0_integrity`: `insufficient_evidence`（五项中 D0-04/D0-05 未运行，D0-01/D0-02 只有静态回答）；
- `l1_decision`: `not_granted`；维持 L0/受指导状态；
- 不允许据此恢复真实模型/API 训练、进入无监督交付或宣称职业能力。

后续由 AI 生成工程师在保持原始版本和首次失败的前提下补齐失败/降级夹具、第二不同夹具、EvidenceCard 和相邻岗位交接；内容审校员先核机制边界，QA 再按原例→受影响回归→未预告变体独立复验。真实模型、外部写工具、付费调用和生产恢复仍需另行授权。

## 缺陷与复验记录

| 缺陷 ID | 严重级别 | 影响 | 责任人 | 状态/复验 |
| --- | --- | --- | --- | --- |
| `AI-D0-REPLAY-QA-P2-STATE-NAME-DRIFT` | P2 | 原始计划使用 `source_checked`，v02 使用 `checked`，缺少状态合同迁移说明，可能影响跨版本重放追踪 | `AI` + `CURR` | open；下一版合同固定名称/别名，QA 原例复验 |

本报告仅记录独立复核结果，没有关闭作者文件中既有的 `review.pending` 字段，也没有把本报告视作作者自审或能力认证。完整职业培养、真实模型质量、用户价值、生产可靠性、成本和行业先进性均仍为未验证。
