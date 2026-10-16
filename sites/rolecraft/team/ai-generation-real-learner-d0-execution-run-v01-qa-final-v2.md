# AI 生成工程师 D0-03 本地四场景独立 QA 复核（最终冻结 v2）

- QA 记录：`AI-REAL-LEARNER-D0-EXEC-RUN-QA-20261016-FINAL-V2-001`
- 合同：`AI-REAL-LEARNER-D0-EXEC-20261016-001`
- 结论：`met_with_limitations`
- 范围：最终冻结工件的四个本地场景，各执行 run-1/run-2；测试工程师独立复核，不冒充学习者本人。

最终证据根目录为 [`ai-generation-real-learner-d0-execution-run-v01-artifacts`](ai-generation-real-learner-d0-execution-run-v01-artifacts)。当前输入快照为 1474 bytes，SHA-256 `33be9e47edd1c9652b59d1bdac0e1fbe33a5f288f110eda1ff114c175f881939`；冻结夹具的规范化对象 SHA-256 为 `5dc9f33ed3972dbff5118bc6977a66ccbd376bc6fcc54f15c9b1e26fda8db5e0`，完整夹具文件 SHA-256 为 `f6cc25edad6403c052f66167adecf666d770f12b82170f2fc996119ef118f446`。三者对象范围已分别记录。

## 场景结果

| 场景 | 首失败/状态 | 停止与来源证据 |
|---|---|---|
| A-normal | `draft_ready_for_review` | 两条 fact claim 均绑定 `doc-A-refund-v2` / `refund-policy-v2` / `fixture://docs/doc-A-refund-v2#rules` / hash `4a1fa4...1361d`；订单状态和客户身份保持 unknown；handoff=QA pending；`external_action=null` |
| B-tenant-denied | `SOURCE_SCOPE_DENIED` | 生成前停止；`draft=null`、handoff=null、`external_action=null`。收据明确 `actor_tenant=A`、`requested_tenant=A`、`document_id=doc-B-private-v1`、`document_tenant=B`；B正文未读取、缓存、摘要或进入上下文 |
| source-missing | `SOURCE_MISSING` | 生成前停止；`draft=null`、handoff=null、`external_action=null`；`required source unavailable` 保留为 unknown/blocked，未换源 |
| source-conflict | `SOURCE_VERSION_MISMATCH` | 生成前停止；`draft=null`、handoff=null、`external_action=null`；冲突键为 `source_version`、`content_hash`，期望/观察值和未访问替代来源均有收据 |

8 张 EvidenceCard（四场景 × 两次运行）均具备合同要求字段：原始 stdout/stderr 路径、bytes 与 SHA-256，命令、时间、环境、退出码、首失败、停止原因、草稿/交接、来源收据、unknown、未访问来源、`external_action` 和 `human_receipt_pending`。每张卡均为 `learner_execution=false`、`human_receipt_pending=true`。

## 回归与哈希复验

`run-comparison.json` 显示四场景 `byte_equal=true`、首失败相等、两次 `external_action` 均为 `null`。最终 `sha256sum -c sites/rolecraft/team/ai-generation-real-learner-d0-execution-run-v01-artifacts/SHA256SUMS` 返回 0；40 项清单全部匹配。B正文标记在最终生成收据、输出、卡片、日志、环境、manifest、comparison 和 runner 文件中均未发现；仅保留 `doc-B-private-v1` 与 `document_tenant=B` 等拒绝元数据。

此前出现过两项首失败：raw output 携带 `run_id` 导致双跑 bytes 不一致，以及 runner 修改后 SHA256SUMS 暂未重算。两项均保留在旧 QA/首失败记录中；最终冻结已移除非语义差异、补充 B 文档租户字段并重算清单，当前四场景双跑和哈希清单均通过。旧报告和 [`qa-pre-fix`](ai-generation-real-learner-d0-execution-run-v01-qa-pre-fix.json) 不覆盖。

## 限定

本轮是无网络、无真实模型、无云、无付费 API、无真实用户数据的确定性本地回放，不能替代学习者本人执行、真人审批或签收，不授予 D0/L1/L2。真实供应商来源 API、模型引用忠实度、生产权限、缓存/并发/进程恢复、未知任务迁移和职业能力仍未验证。来源冲突使用期望版本与期望 content hash 注入，证明版本/hash 冲突停线；实际冲突正文没有被访问。

若进入学习者验收，须由学习者本人按冻结合同提交实际入口和原始 stdout/stderr，再由测试工程师独立重放并保留本轮最终工件及历史首失败链。
