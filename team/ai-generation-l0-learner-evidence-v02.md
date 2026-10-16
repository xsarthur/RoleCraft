# AI生成工程师 L0 学习者原始证据 v0.2（修复）

诊断 ID：`D0-AI-20261015-001`（所有 learner_raw、D0、D6、U 记录统一）。QA 状态 `pending`；`self_signed=false`；`external_action=null`；L1/L2 `not_granted`。

## D0 与来源绑定

D0-03 已明确绑定 SOURCE-001 的同一 fixture：`F-AI-SOURCE-CLAIM-v1`，`doc-A-refund-v1`，fixture SHA-256 `5dc9f33e3972dbff5118bc6977a66ccbd376bc6fcc54f15c9b1e26fda8db5e0`。因此不把跨版本内容列为通过；任何版本/hash不匹配仍触发 `SOURCE_VERSION_MISMATCH`/`SOURCE_HASH_MISMATCH` 并停线。五项原始回答、D6 与 U 均见工件目录 `learner_raw.json`。

## E-AI-L0-003 D6 取舍

用户问题是：来源受限草稿生成怎样平衡质量、成本、延迟与安全？比较本地确定性规则适配器与真实供应商模型适配器。指标：fixture 上 schema/来源完整率 100%；付费调用 0；本地 p95 延迟 ≤2 秒并记录 CPU 时间。规则方案零费用、可复现但不证明模型质量；供应商方案潜在质量更高但有费用、延迟与外发风险。若质量低于100%或 p95 超过2秒先停线修复；只有预算、脱敏与 QA 批准齐备才切换供应商。已实际执行本地 `python3 -m json.tool learner_raw.json`，结果通过，网络/付费 API 均关闭。

## U-AI-L0-001 实际执行

仅注入“checkpoint temporarily unavailable”，其余身份、输入、schema、工具契约、版本冻结。保留基线、首失败、回归和留出：`u-ai-l0-001/{baseline,first_failure,regression,holdout}.json`。首失败进入 `recovery_required` 并停止下游生成；恢复回归保持同一 run/幂等键、schema、租户 A 和 `doc-A-refund-v1`；留出改变故障持续时间，超重试预算停止。未测范围：真实进程崩溃恢复、模型质量、外部 API 契约、生产 RPO/RTO。

## 证据绑定与复验

SOURCE：`ai-generation-l0-practice-source-001-v01.json`；DURABLE：`ai-generation-l0-practice-durable-002-v04/evidence-card.json`；GATE：`ai-generation-l0-practice-gate-003-v06/manifest.json`。本轮 manifest 与 learner_raw 记录哈希及 fixture 绑定。仅本地确定性环境（Python 3.14.5/macOS，网络关闭），未使用真实模型、API、云、付费或真实数据。等待独立 QA 与内容审校。
