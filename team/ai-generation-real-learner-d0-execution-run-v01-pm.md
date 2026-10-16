# D0-03 四场景本地执行项目经理复盘 v0.1

- 记录：`AI-REAL-LEARNER-D0-EXEC-RUN-PM-20261016-001`
- 合同：`AI-REAL-LEARNER-D0-EXEC-20261016-001`
- 诊断：`D0-AI-20261015-001`
- 日期：2026-10-16（Asia/Shanghai）

## 本轮范围与岗位

AI生成工程师在隔离本地夹具上执行 A-normal、B-tenant-denied、source-missing、source-conflict，各执行 run-1/run-2；测试工程师独立复核最终工件。项目经理负责交接、首失败修复复验和范围结论。本轮不调用真实模型/API、云、付费服务、网络、真实用户数据或外部动作。

## 达标复盘

本轮在“本地确定性夹具行为”范围内达到合同要求：A 生成带 `doc-A-refund-v2` / `refund-policy-v2` 来源四元组的两条 fact claim，并保留未知项；B 在生成前以 `SOURCE_SCOPE_DENIED` 停止；缺失来源以 `SOURCE_MISSING` 停止并标记未知；版本/content hash 冲突以 `SOURCE_VERSION_MISMATCH` 停止。四场景均 `external_action=null`，每个 case/run 均有原始 stdout/stderr、命令、时间、环境、退出码、输入/输出 bytes 与 SHA-256；最终 run-1/run-2 四场景逐字节相等。

独立 QA 最终结论为 `met_with_limitations`，见 `ai-generation-real-learner-d0-execution-run-v01-qa-final-v2.json/.md`。初次回归因 stdout 携带非语义 `run_id` 造成 raw byte 不相等，随后还发现 runner 修改后哈希清单暂未重算；两项首失败均保留在旧 QA/首失败记录中。责任工程师移除该字段、补充 B 文档租户元数据、从最终输入快照重跑并重算 `SHA256SUMS`，测试岗复验通过。

## 完整标准与缺口

完整 D0-03 学习者合同仍未关闭，整体状态保持 `pending_learner_execution`：本轮由 AI生成工程师执行，`learner_execution=false`、`human_receipt_pending=true`，不能代替学习者本人提交、真人审批/签收或能力证据。真实供应商来源 API、真实模型引用忠实度、生产权限、缓存/并发/进程恢复和未知任务迁移也未验证，不能授予 D0/L1/L2。

责任与复验：学习者本人按冻结合同提交实际入口和原始收据；测试工程师在收到后独立复跑四场景并复核本人执行链；AI生成工程师维护本地模型/来源接口及冲突停线契约。不得用本轮夹具结果覆盖历史报告或把本地通过扩大为生产、职业能力或真人签收结论。

## 证据入口

`ai-generation-real-learner-d0-execution-run-v01-artifacts/` 保存最终输入快照（1474 bytes，SHA-256 `33be9e47edd1c9652b59d1bdac0e1fbe33a5f288f110eda1ff114c175f881939`）、实现入口、两次逐场景 stdout/stderr、EvidenceCard、执行日志、环境、manifest、SHA256SUMS 和回归比较；最终清单 40 项全部匹配。旧 `ai-generation-real-learner-d0-execution-qa-v02-artifacts/` 保留不变。

## 学习者本人执行收据复核

用户随后运行了 `ai-generation-real-learner-d0-execution-learner-run-v01.sh`，执行时间为 2026-10-16T09:24:39+08:00，并提交了 `ai-generation-real-learner-d0-execution-learner-receipts/`。该目录含四场景各两轮原始 stdout/stderr、命令、时间、退出码、bytes 和 SHA-256；29/29 收据载荷通过 `BYTES` 与 `SHA256SUMS` 核对，8/8 退出码为 0，四场景双跑逐字节一致。签收声明记录于 `ai-generation-real-learner-d0-execution-learner-signoff-v01.txt`，签收时间为 2026-10-16T09:28:39+08:00。

测试工程师独立报告 `ai-generation-real-learner-d0-learner-execution-qa-v01.json/.md`，结论为 `met_with_limitations`：A 来源绑定、B 受控拒绝及未访问声明、缺失/冲突首失败、`external_action=null` 均通过。姓名/内部标识未提供；QA 未读取收据目录外的冻结输入和回放目标，因此输入 provenance 仍有限。冻结合同文件保持原样，不据此授予 D0/L1/L2 或生产能力结论。
