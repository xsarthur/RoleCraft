# AI 生成工程师 L0→L1 Gate 独立 QA v0.12

- report_id: `AI-GEN-L0-TO-L1-GATE-QA-v12`
- date: 2026-10-16（Asia/Shanghai）
- role: 测试工程师
- diagnostic_id: `D0-AI-20261015-001`
- scope: D0-03 learner-submission-v02、本人声明、Chenny receiver replay/动态 holdout、dynamic runner v0.2 QA 的只读 gate 复核
- decision: `remain_L0_guided`
- l1_review: `insufficient_evidence`
- level_granted: `false`（`pending`）

## 复核输入

本轮读取并交叉核对：

- `ai-generation-real-learner-d0-execution-learner-submission-v02/learner-receipt.json`
- `ai-generation-real-learner-d0-execution-learner-submission-v02/learner-statement.txt`
- `ai-generation-real-learner-d0-execution-learner-submission-v02/raw-receipts-retry-02/`
- `ai-generation-real-learner-d0-execution-learner-submission-v02/receiver-acceptance-v03-dynamic-v02.json`
- `chenny-receiver-holdout-v02-qa-addendum.md/.json`
- `ai-generation-real-learner-d0-execution-qa-v04-dynamic-v02.md/.json`
- v11 gate 报告作为历史对照；未覆盖或改写 v11/v02 文件。

学习者提交包、签名声明及历史收据均保持原样。本报告没有代学习者作答、重写正文或修改收据。

## 复核结果

### 学习者收据与本人声明

在本地只读检查中，入口脚本 SHA、声明 SHA、输入快照 SHA、SHA256SUMS SHA 和 BYTES SHA 均与 receipt 声明一致；清单中的 34 个文件均可复算，BYTES 与实际大小一致。两轮四场景共 8 个退出码为 0，stdout 按场景逐字节一致，stderr 为空。A-normal 的两条 claim 绑定授权来源；B-tenant-denied 在生成前 `SOURCE_SCOPE_DENIED`、正文为空；source-missing 与 source-conflict 分别在草稿前以 `SOURCE_MISSING`、`SOURCE_VERSION_MISMATCH` 停止；外部动作为 `null`。

本人声明末尾为 `签名：Larry`、`声明状态：signed_by_learner`，且 learner_id、合同、诊断、时间、入口和哈希与 receipt 对齐。因此，本人收据在当前提交范围可接受，但保留两项文档限定：声明首行仍写“待本人签署”，以及 receipt 的 `raw_manifest_entries=32` 与实际清单 34 项不一致。两项不改变已复算的文件和运行结果，但在后续门禁中应修正或解释，不能把声明文案当成额外能力证据。

### 人工接收收据

`receiver-acceptance-v03-dynamic-v02.json` 记录独立接收方 Chenny、`accepted=true`、签收时间 `2026-10-16T12:59:19+08:00`、签名 `Chenny`；四场景 replay 为 `pass`，`human_receipt_pending=false`。因此 **human receipt：`pass_with_limitations`**（已接收证据包，不等于能力评级）。Chenny addendum 的范围只覆盖 holdout 证据且不主张签名；这与接收 JSON 的签名记录是不同范围，不能互相替代。

### 动态 holdout 与 runner QA

Chenny 的动态 holdout addendum 为 `met_within_scope` / `pass_dynamic_binding`：SHA256SUMS、BYTES、checks.json 状态、两次运行退出码、空 stderr、stdout/退出码字节一致，以及 variant metadata、claim refs、receipt refs 的动态绑定均有记录。holdout 改变文档、版本和文本后，输出仍为 `draft_ready_for_review`，未知项保留，外部动作为 `null`。`ai-generation-real-learner-d0-execution-qa-v04-dynamic-v02` 另证实 runner v0.2 的 3/3 实现自检、8 次 replay smoke、两个 shell 语法检查和 v01 保护；该记录本身没有运行 Chenny holdout，holdout 结论来自后续 Chenny 独立会话。

因此 **dynamic holdout：`pass_with_limitations`（证据状态 `pass_dynamic_binding`）**。这只证明离线 fixture 的动态来源绑定和接收方复验，不证明真实模型、外部来源服务、生产并发或真人任务迁移。

## Gate 判定与未验证范围

本轮 D0-03 的本人收据、人工接收和动态 holdout 在上述限定范围内通过；但 D0 gate 合同要求 D0-01 至 D0-05 的全部学习者原始提交、独立审查和交接收据，不能用单一 D0-03 收据闭合。故整体保持 `remain_L0_guided`，L1 review 为 `insufficient_evidence`，`level_granted=false/pending`，不授 D0、L1、L2 或生产权限。

仍未验证或未达到的门槛包括：

- D0-01、D0-02、D0-04、D0-05 的本人原始提交及其逐项独立审查；
- 学习者对未知任务的迁移、真实失败/恢复、跨约束重建和完整交接能力；
- L1 所需的两个独立 sandbox、返修/回归、独立 holdout 与独立接收的整体证据链；
- L2 所需的真实形态任务、迁移、恢复和完整 handoff；
- 真实模型/API 质量、外部来源契约、真实进程崩溃恢复、并发/缓存一致性、生产 RPO/RTO、安全与经济性；
- 真人专家复核、真实用户学习结果、职业胜任或行业先进性。

接收方签名只确认本次证据包已被接收；动态 holdout 通过也不构成等级授予。后续应先修正文案/清单计数并补齐其余 D0 项，再由独立 QA 按新版本复验。
