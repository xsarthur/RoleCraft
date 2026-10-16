# AI生成工程师 L0 学习者证据 QA v0.1

日期：2026-10-15（Asia/Shanghai）  
QA角色：测试工程师（独立复核）  
范围：`ai-generation-l0-learner-evidence-v01.md`、其 `learner_raw.json` 及 SOURCE/DURABLE/GATE 三张 EvidenceCard。仅核对 L0→L1 gate，不授予 L1/L2。

## 结论

**`fail`**。绑定目录和本地夹具卡真实存在，且 `qa_status=pending`、`self_signed=false`、`external_action=null`；但 L0→L1 必需学习者证据仍不完整，不能进入 reviewable。

## 逐项核对

| 门槛 | 结果 | 证据与缺口 |
|---|---|---|
| 五项 D0 原始回答同一 `diagnostic_id` | **fail** | `learner_raw.json` 有 D0-01…D0-05 五段文字，均含机制/边界/首失败或停止条件的部分表述；文件没有 `diagnostic_id`，无法证明五答属于同一次诊断。`D0-03` 还写 `doc-A-refund-v1`，而 SOURCE 正常卡绑定 `doc-A-refund-v2`，存在版本不一致待解释。 |
| E-AI-L0-003 D6 方案取舍卡 | **fail** | 有 choice、两方案方向的取舍、停止条件和 `external_action=null`，但缺明确用户问题、质量/成本假设、至少两项可比较方案及验证结果/证据卡绑定；不能以三项练习卡替代独立 D6 EvidenceCard。 |
| U-AI-L0-001 单约束未知迁移 | **fail** | 明确只改变 checkpoint 短暂不可用并冻结其余条件，状态为 `planned_local_only`；但没有实际基线、首失败产物、回归结果、留出结果或复验命令/工件，故计划不能算迁移证据。 |
| SOURCE/DURABLE/GATE EvidenceCard 绑定 | **met_within_scope** | 三个目录、三张 `evidence-card.json`、各自 README/manifest 及顶层 v01/v04/v06 JSON/MD 均存在；卡片自报 `review_status=pending_QA`/`handoff_qa=pending`，历史练习范围和限制可追溯。 |
| `learner_raw`、哈希、环境/命令 | **met_with_limitations** | `learner_raw.json` 可解析，SHA256=`9a1e36bfe59d7b84f03b684d48d63af6a07ab61b1427877eeb488ef77e732281`；MD 给出 Python/Node 环境和 `json.tool`/`sha256sum` 命令。但没有逐项 diagnostic_id/工件哈希清单，命令未证明 D0/D6/U 的实际运行。 |
| QA 状态与外部动作 | **met_within_scope** | `qa_status=pending`、`self_signed=false`、`external_action=null`，`training_status=L0_guided`、`advancement=not_granted`；未发现付费/联网/真实数据调用声明。 |

## 复核记录

直接读取并解析 learner raw 与三张 EvidenceCard；确认三项绑定路径存在，并计算 learner_raw SHA256。未执行练习重放、未改写学习者文件、未调用网络/API、未授予任何等级。`SOURCE` 卡的 `python3 .../replay_verify.py` 是其历史工件声明，不作为本次重新执行证据。

## 关闭条件

补交同一 `diagnostic_id` 的五项 D0 原答及完整 EvidenceCard；补齐含用户问题、质量/成本假设、至少两方案、取舍、停止线和验证结果的 E-AI-L0-003；实际执行 U-AI-L0-001 并绑定基线、首失败、回归、留出、环境/命令和哈希。完成后由测试工程师重新独立复核。
