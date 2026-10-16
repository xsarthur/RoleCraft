# AI L0 learner handoff 内容审校 v18

## 范围与结论

独立静态读取 v18 handoff、manifest、D0-05 工件、五张 EvidenceCard 与 `run_bundle.py`，并尝试运行脚本；脚本因工作区只读权限在写回既有工件时失败，未完成断言执行。未调用真实模型/API/云/付费服务，未修改教材、应用、账户数据或历史报告；不授 D0/L0/L1/L2 等级。结论为 **`reviewed_with_limitations`**，范围为 **`not_met`**。

## 核对结果

- **D0-05 执行日志：部分通过。** `execution-log.json` 新增 `expected`、`observed`、`pass`、`source_refs` 与 `source_hash`，能表达一次声明性的观察结果；但 `source_hash` 为字面 `local-hash`，没有可核对的实际来源摘要，缺执行时间、环境、命令/运行者和产出签名。`holdout-input.json`、`holdout-output.json` 被 D0-05 EvidenceCard 引用但目录中不存在，manifest 也未登记，故证据链不完整。
- **D0-05 留出语义：仍部分通过。** holdout 与 first_failure 文本不同且 holdout 增加 `outage_duration=7`，但两者仍共享 `doc-A-shipping-v3` 与 `shipping-v3` 身份；未证明独立文档、独立来源或未知任务，`independent` 仍只是文本标签。
- **matrix 绑定：静态部分通过。** `holdout_path` 与内嵌字段指向/对应 `holdout.json`，但未核验 manifest 哈希、矩阵全字段、执行日志与卡片的一一绑定；脚本未能在本环境运行完成。
- **EvidenceCard D0-05：部分通过。** 版本 ID 正确，新增执行日志引用；仍缺题目断言、可复核观察值来源、运行环境/时间、学习者主体、产出签名与完整通过条件。引用了不存在的 input/output 工件。
- **跨题边界：未通过。** d0-01、d0-02、d0-04 仍共同引用 `d0-05/first_failure.json`，d0-03 引用 `holdout.json`，没有说明共享 fixture 的授权、归属或隔离；v17 的跨题污染/归属歧义未修复。
- **脚本与版本状态：有限通过。** 源码断言 holdout 字段、文本差异、matrix 路径及 V18 ID，但未覆盖来源独立性、卡片与 manifest 一一对应、缺失文件、真实执行收据或哈希完整性。manifest/handoff 仍声明 `pending/not_assessed/not_granted`，未升级等级。

## 后续与限制

补齐并登记 `holdout-input.json`/`holdout-output.json`，提供可核对的真实 source hash、执行时间/环境/命令、观察值和通过条件；修正 d0-01 至 d0-04 的跨题引用或明确共享 fixture 的隔离与用途；为独立留出使用不同文档/来源身份或明确其仅为语义 fixture。由 QA 在可写隔离副本中重新运行脚本并逐项复验 manifest、EvidenceCard 和来源边界。此前保持 D0/L0 `not_assessed`、L1/L2 `not_granted`。未验证真实模型/API、未知迁移、持久性、并发、外部副作用、真人签收、学习效果、职业能力或生产部署。
