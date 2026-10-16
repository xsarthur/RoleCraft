# AI生成工程师 L0 学习者原始证据 v0.1

日期：2026-10-15（Asia/Shanghai）  
范围：D0 五项原始回答、E-AI-L0-003 方案取舍卡、U-AI-L0-001 单约束未知迁移。仅本地确定性练习；未联网、未调用真实模型/API、云、付费服务或真实数据。

## learner_raw

原始 JSON：[`learner_raw.json`](ai-generation-l0-learner-evidence-v01/learner_raw.json)。五项回答分别记录责任边界、显式状态/工具契约/来源绑定、租户 A 本地任务、持久化失败停线、以及只改变检查点可用性的未知迁移计划。原始措辞保留在 JSON，不把计划写成已执行结果。

## 练习卡

- **E-AI-L0-003 D6 方案取舍卡**：选择本地确定性规则适配器，理由是可重复、无费用、无外发；代价是不能证明真实模型质量、供应商契约或生产延迟。来源/版本/副作用无法核对时停线；`external_action=null`。
- **U-AI-L0-001 单约束未知迁移**：仅改变“检查点短暂不可用”，冻结其余条件；预期进入 `recovery_required`，保留首失败，以同一 run/幂等键恢复并交独立 QA。当前状态为 `planned_local_only`，不是执行通过。

## EvidenceCard 绑定

| card | 绑定工件 | 证据状态 |
|---|---|---|
| `SOURCE-AI-L0-001` | `ai-generation-l0-practice-source-001/` 及 `ai-generation-l0-practice-source-001-v01.md/.json` | 已有本地确定性来源矩阵；学习者证据待 QA 汇总 |
| `DURABLE-AI-L0-002` | `ai-generation-l0-practice-durable-002-v04/`（含 `learner_raw.json`、首失败、run/holdout、evidence-card） | 本地夹具链存在；不外推生产恢复 |
| `GATE-AI-L0-003` | `ai-generation-l0-practice-gate-003-v06/`（schema、人工 gate、迁移、holdout） | 本地工件存在；U-AI-L0-001为计划性单约束迁移，QA pending |

工件目录均以各自 README/manifest、声明哈希和首失败记录为准；本文件不改写其历史结论。

## 环境与复现

环境：本地工作区，Python 3.12/Node 24 可用；未启用网络，未设置真实密钥。命令仅做确定性文件/JSON检查，例如：

```sh
python3 -m json.tool sites/rolecraft/team/ai-generation-l0-learner-evidence-v01/learner_raw.json
sha256sum sites/rolecraft/team/ai-generation-l0-learner-evidence-v01/learner_raw.json
```

## 边界

`qa_status=pending`，`self_signed=false`，`external_action=null`。训练保持 `L0_guided`；不授予 L1/L2，不声称真实模型质量、外部契约、生产恢复、真人审批、用户价值或职业能力认证。
