# AI生成工程师 L0→L1 闸门内容审校 v0.2

- 审校日期：2026-10-15（Asia/Shanghai）
- 岗位：AI生成工程师（role_id=AI）
- 诊断：D0-AI-20261015-001
- 审校角色：内容审校员
- 结论：**reviewed_with_limitations**
- L1 review：**暂不可进入正式 L1 review**（可进入补证据/预审准备，不代表等级）
- 等级授予：L0/L1/L2 均不授予

## 范围与依据

本审校读取并交叉核对 `ai-generation-engineer-advancement-v03.md/.json`、D0 v04 修复与内容/QA记录、SOURCE-001 v01、DURABLE-002 v04、GATE-003 v06、`ai-generation-l0-learner-evidence-v03.json` 及其 v03 内容审校。仅评价机制、来源、边界、方案论证和证据措辞；不代替 QA 运行、不把代理报告或本地替身写成学习者能力。

## 核对结果

### D0 机制、来源与边界

D0-01—D0-05 的职责边界、状态链、先持久化后交接、首失败保留和单约束迁移逻辑彼此一致。SOURCE-001 的来源四元组、版本/hash、租户 A/B 拒绝和生成前停止叙述在其练习包内可审计；D0 v04 也明确租户拒绝、只读工具、schema/空工具/重复回调和 checkpoint 重放的局部夹具行为。GATE-003 v06 的 unknown-field 收据、manifest/EvidenceCard 哈希与 `external_action=null` 边界一致。

这些结论只成立于确定性本地夹具和静态引用范围。D0 仍为 `not_assessed`；B 租户在本诊断学习者证据中明确 `unverified`，不能用代理 D0 报告补齐。未验证真实 LangGraph/API、模型、进程/数据库耐久性、RPO/RTO、真人审批、接收签收及学习者独立执行。

### D6 方案质量、成本、延迟

E-AI-L0-003 正确提出来源受限草稿生成的用户问题，并比较本地确定性规则与供应商模型，写出质量、成本、延迟、安全指标和预算/脱敏/QA切换门槛。CPU 1.84ms、p95 1.89ms、零网络/付费调用及输入输出 hash 支持“本地 fixture 运行过”的有限判断；DURABLE/GATE 的内容审校也未发现越界表述。

质量门槛仍只覆盖 fixture 内 schema/source 完整度，缺少逐字段计数、样本定义、失败样本和真实模型对照；五次本地读盘耗时不能外推供应商或生产延迟。切换门槛尚未由失败样本触发，方案质量、成本和限流判断因此仍属受限论证。

### U-AI-L0-001 未知迁移

U 只改变 checkpoint 暂不可用，保留 baseline、first_failure、regression、holdout、停止决定和未测项，输入输出 hash 与 manifest 可绑定；但执行命令主要是 `json.load` 四个 fixture 文件，不能证明真实故障注入、过程崩溃、持久恢复或未知情境下的学习者迁移。`draft_ready_for_review` 与 D0 `draft_ready` 的状态命名仍需 QA 统一。不得把该卡片写成岗位迁移能力。

### 两个 sandbox EvidenceCard 真实性

SOURCE-001 与 DURABLE-002/GATE-003 均保留 fixture-only、无网络/真实模型/API/生产数据库、`external_action=null`、QA/handoff pending 或 self-signed=false 等限制；来源、哈希、首失败和修复边界的静态内容可审校。它们证明的是练习包/代理或学习者本地工件的可追溯性，不是两套非同构沙箱中学习者独立重建的能力证据。DURABLE 的幂等、单 draft、checkpoint replay 仍未经真实进程 kill、并发、跨节点或持久存储测试；GATE 的迁移/validator 亦未由本审校独立重放。

## 闸门判断

advancement-v03 要求五项 D0 原始回答、两套沙箱 EvidenceCard、D1–D5 初步证据、D6 方案取舍证据、D7 留出尝试、QA独立复跑、内容审校和接收签收。当前只有学习者 JSON 与静态内容审校；`qa_status=pending`，B租户拒绝未验证，真人/接收签收缺失，真实运行时与未知迁移未证明。因此**不满足正式 L0→L1 review 准入**。可继续补交同诊断的可重放收据、QA独立复验和非作者冻结的第二沙箱/留出任务后重新审校。

## 必须保留的限制与后续

1. 由 QA 独立重跑两套练习的正常、最差、首失败、holdout，并统一状态合同；保留命令、环境、hash 与未运行项。
2. 补交学习者本人完成的第二非同构 sandbox 和 B 租户拒绝收据；不得用代理或历史报告代替。
3. 对 D6 增加样本/逐字段质量计数、失败样本及成本/延迟测量；无真实模型时明确“未比较模型质量”。
4. 完成人工审批/接收岗位的真实签收或有据拒收；在此之前保持 `not_granted`。

本报告不授予等级、生产权限、真人专家认可或职业能力认证；历史 D0、SOURCE、DURABLE、GATE 报告保持原结论。
