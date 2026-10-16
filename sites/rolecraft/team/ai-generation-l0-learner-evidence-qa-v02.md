# AI生成工程师 L0 学习者证据 QA v0.2

日期：2026-10-15（Asia/Shanghai）  
QA角色：测试工程师（独立复核）  
范围：v02 learner evidence、SOURCE/DURABLE/GATE 绑定及 U-AI-L0-001；不授予 L1/L2。

## 结论

**`met_with_limitations`**。v02 已修复 v01 的统一 diagnostic_id、D0-03 版本绑定、D6 取舍字段和 U-AI-L0-001 实际基线/首失败/回归/holdout 工件；QA 状态仍为 `pending`，`self_signed=false`，`external_action=null`，L1/L2 均未授予。

## 核对结果

| 项目 | 结果 | 证据与限制 |
|---|---|---|
| 五项 D0 与 diagnostic_id | **met_within_scope** | learner_raw、manifest 与四个 U 工件统一 `D0-AI-20261015-001`。 |
| D0-03 SOURCE fixture/version/hash | **met_with_limitations** | JSON/manifest/SOURCE 均绑定 `F-AI-SOURCE-CLAIM-v1`、`doc-A-refund-v1`、规范 hash `5dc9f33ed3972dbff5118bc6977a66ccbd376bc6fcc54f15c9b1e26fda8db5e0`；Markdown 少了 `d`，需修正文案。 |
| E-AI-L0-003 D6 | **met_with_limitations** | 有用户问题、两方案、质量/成本/延迟指标、取舍与停止线；`json.tool` 收据通过且网络/付费 API 关闭，但未提供 CPU/p95 数值。 |
| U-AI-L0-001 | **met_within_scope** | baseline、first_failure、regression、holdout 均实际存在；约束为 checkpoint 暂不可用，首失败及 holdout 均停止下游/超预算停止，回归恢复同一幂等键、schema、租户与来源版本。 |
| manifest/EvidenceCard/README | **met_with_limitations** | SOURCE、DURABLE、GATE 路径存在且可解析；learner manifest 未列 learner_raw/U 文件哈希，GATE README hash 仅由其 manifest 声明。 |
| 控制字段 | **met_within_scope** | `qa_status=pending`、`self_signed=false`、`external_action=null`，L1/L2=`not_granted`。 |

## 未测与复验

本次为只读核对，未重放练习、未调用网络/API、未修改学习者文件。未测范围保留：真实进程崩溃恢复、模型质量、外部 API 契约、生产 RPO/RTO。

复验前需修正 Markdown hash，补交 CPU/p95 数值收据，并在 learner manifest 登记 learner_raw 与四个 U 工件的哈希。
