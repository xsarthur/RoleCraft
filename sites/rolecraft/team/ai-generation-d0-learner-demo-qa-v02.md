# AI生成工程师 D0 learner demo v02 独立 QA

- QA ID：`AI-D0-LEARNER-DEMO-QA-20261015-V02`
- 日期：2026-10-15（Asia/Shanghai）
- 复核岗位：测试工程师
- 诊断：`D0-AI-20261015-001`
- 结论：`met_with_limitations`
- 等级决定：`not_assessed`（不授 L1/L2）

## 范围与方法

只读复核 `sites/rolecraft/team/ai-generation-d0-learner-demo-v02/`，并参考 v01 学习者记录及历史 QA。重新计算目录内 15 个 JSON 的字节数、SHA-256 和 `diagnostic_id`；对 `manifest.json` 使用自引用规则（`bytes=null`、`sha256=null`、明确 `self_hash`）。逐项复验 D0-03 A/B、D0-04 首失败/恢复、D0-05 基线/单约束失败/回归/留出，以及 `external_action`、`self_signed` 和交接状态。

## 证据结果

| 检查 | 结果 |
|---|---|
| `artifact_count` | 声明 15，目录实际 JSON 15，一致 |
| 文件清单 | 14 个非 manifest 文件 bytes/SHA 与收到版本一致；manifest 自引用规则有效 |
| 诊断绑定 | 所有 JSON 均绑定 `D0-AI-20261015-001` |
| D0-03 | A 正常路径带 `doc-A-refund-v1` 的来源引用；B 在生成前以 `tenant_scope_denied` 拒绝，`answer=null`、来源为空 |
| D0-04 | 工具结果、`checkpoint_write_failed` 首失败、同幂等键恢复和最终可审阅状态链完整 |
| D0-05 | 基线、唯一约束 `checkpoint_available:false` 失败停止、故障持续时间留出、回归恢复链完整；回归含 `schema_version` 与 `source_refs` |
| 副作用/签名 | `external_action` 均为 `null`；`self_signed=false`；`qa_status=pending`；`handoff=pending`；未授等级 |

## 独立判断

在本地确定性夹具和本轮结构范围内，v02 修复包达到清单、来源边界、失败恢复和回归字段的复核条件，因此标记 `met_within_scope` 子项，整体为 `met_with_limitations`。该结论只说明证据包结构和演示路径在限定范围内可复核，不表示真实模型生成质量、生产耐久性、外部供应商契约、真人专家审核、用户学习迁移或职业能力达标。v01 中“非真实模型/无外部副作用/不授等级”的限制继续有效。

未发现需登记的 v02 P0/P1 缺陷；交接仍为 `pending`，不能将 QA 复核误写成已签收或能力认证。

## 复验要求

若应用接入或更换 schema/source 版本，须重新构建 manifest 并复跑 D0-03 原例、D0-04 首失败与恢复、D0-05 回归与留出；保留首次失败、版本和来源绑定。
