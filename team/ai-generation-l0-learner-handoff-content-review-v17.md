# AI L0 learner handoff 内容审校 v17

## 范围与结论

独立静态读取 v17 handoff、manifest、D0-05 工件、五张 EvidenceCard 与 `run_bundle.py`。未执行脚本或故障重放，未调用真实模型/API/云/付费服务，未修改教材、应用、账户数据或历史报告；不授 D0/L0/L1/L2 等级。结论为 **`reviewed_with_limitations`**，范围为 **`not_met`**。

## 核对结果

- **D0-05 留出语义：部分通过。** holdout 与 first_failure 文本不同，holdout 额外有 `outage_duration=7`，脚本源码有相应断言。这支持两个确定性 fixture 内容不同；但两者共享 `doc-A-shipping-v3` 与 `shipping-v3` 身份，未证明独立文档、独立来源或未知任务。
- **matrix 绑定：静态通过。** `holdout_path` 指向 `d0-05/holdout.json`，内嵌内容与文件一致；只证明路径/内容绑定，不证明学习者实际通过或迁移能力。
- **D0-05 EvidenceCard：部分通过。** 使用 `EVID-D0-05-V17`、`version=v17`，只列 D0-05 工件，无旧版本或显式跨题工件；仍缺题目断言、观察值、通过条件、执行时间/环境、产出签名和学习者主体，不能证明完成、泛化或真实恢复。
- **跨题边界：未通过。** d0-01 至 d0-04 卡片均引用 `d0-05/first_failure.json`，未说明共享 fixture 的授权、归属或隔离，存在跨题工件污染/归属歧义。
- **脚本断言：有限通过。** 覆盖 holdout 身份/字段、文本差异、matrix 路径和 V17 ID；未覆盖 manifest 哈希、卡片一一对应、来源独立性、执行收据，且本轮未运行。
- **版本与状态：声明通过。** manifest/handoff 为 v17，状态仍 pending/not_assessed/not_granted，未升级等级。

## 后续与限制

修正 d0-01 至 d0-04 的跨题引用，或明确共享 fixture 的隔离与用途；补 D0-05 执行收据、断言结果、环境/时间和通过条件；若需独立留出，使用不同文档/来源身份或明确仅为语义 fixture。修正后由 QA 重新运行复验。此前保持 D0/L0 `not_assessed`、L1/L2 `not_granted`。未验证真实模型/API、未知迁移、持久性、并发、外部副作用、真人签收、学习效果、职业能力或生产部署。
