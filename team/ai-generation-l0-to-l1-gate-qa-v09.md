# AI生成工程师 L0→L1 Gate 独立 QA v0.9

- report_id: `AI-GEN-L0-TO-L1-GATE-QA-v09`
- date: 2026-10-16（Asia/Shanghai）
- role: 测试工程师
- diagnostic_id: `D0-AI-20261015-001`
- contract_id: `AI-REAL-LEARNER-D0-EXEC-20261016-001`
- decision: `remain_L0_guided`
- l1_review: `insufficient_evidence`
- level_granted: L0=false, L1=false, L2=false
- production_permission: false

## 独立复核范围

复核最新 D0-03 四场景冻结工件、两次回放比较、SHA256 清单、D0 学习者原始回答、D0-03 内容审校和既有 SOURCE/DURABLE/GATE 证据。复核只判断证据是否满足等级 gate；不把测试回放当作学习者执行，不代签、不补答、不授等级。

## 核验结果

- **A-normal：通过本地夹具范围。** 两条 A/v2 claim 均绑定 document/version/location/hash，未知项保留，状态为 `draft_ready_for_review`，无外部动作。
- **B-tenant-denied：通过本地夹具范围。** 首失败 `SOURCE_SCOPE_DENIED`，在 draft 前停止；draft、handoff、external_action 均为空。B 文本未进入生成工件/收据扫描范围。
- **source-missing：通过本地夹具范围。** 首失败 `SOURCE_MISSING`，停止且未换源、未猜测。
- **source-conflict：通过本地夹具范围。** 首失败 `SOURCE_VERSION_MISMATCH`，冲突键已记录，冲突替代内容未访问。
- **回放一致性：通过。** run-1/run-2 四场景均 byte_equal=true、首失败一致、external_action 两次均为 null。比较文件给出的输出为：A 2211 bytes/SHA `c4642281…33adf4c`；B 633/`2c4c40dc…377d04`；missing 559/`fb9abbdc…316fa7`；conflict 1063/`dc391a72…60cf4c`。
- **收据与完整性：通过本地证据范围。** 8 张 EvidenceCard 字段齐全，含 stdout/stderr、命令、时间、环境、输入/输出 bytes/SHA、退出码；SHA256SUMS 40 项全部匹配（exit 0）。
- **隔离边界：通过。** network、real model、cloud、paid API、real user data 均关闭；所有 external_action=null。
- **学习者绑定：未通过。** 最新 QA 明确 `learner_execution=false`、`human_receipt_pending=true`；D0 原始回答仍 `self_signed=false`、`not_assessed`。本轮由 AI生成工程师/QA 执行，不能证明学习者本人按合同执行或签收。
- **既有能力 gate：未通过/仅局部。** SOURCE/DURABLE/GATE 与本地失败机制有可追溯片段，但没有学习者绑定的完整 D1–D5、两套非同构 sandbox 的本人提交、未知任务迁移、真实运行时/生产权限或真人接收证据。D6 质量/成本/延迟分母及真实模型对照仍不足。

## Gate 判定

当前保持 **remain_L0_guided**。本轮证明了隔离本地夹具中的来源绑定、越权拒绝、缺失/冲突首失败、停止动作和可重复收据；它不能证明学习者已独立执行，也不能把局部机制通过扩大为 D0/L1 能力或生产许可。L1 继续为 **insufficient_evidence**，不授 L0/L1/L2。

## 关闭条件与责任

1. 学习者本人按冻结合同提交四场景实际入口、原始 stdout/stderr、命令、哈希、退出码和签收；责任：学习者/课程责任人。
2. QA 对本人提交独立复跑并核对 B 正文未读、缓存/上下文证据、source missing/conflict 首失败和 run-1/run-2 比较；责任：测试工程师。
3. 补齐同诊断的完整 D1–D5、两套非同构 sandbox、未知任务/迁移解释，并扩展 D6 样本与失败分母；责任：AI生成工程师与课程责任人。
4. 补充真实来源 API、模型忠实度、权限/恢复/并发等边界（若进入相应 gate），并获得真人接收或有据拒收；责任：AI生成工程师、测试工程师及接收人。

在上述证据完成并经独立复核前，状态不得改为 L1 reviewable，历史失败与修复记录必须保留。

