# v0.7 教材研发交接：Agent 控制循环试读

日期：2026-10-11。责任岗位：教材研发员。交付类型：一篇专业试读正文及本作者交接；本轮不改应用程序，不改写全书。

正文：`sites/rolecraft/textbooks/agent-control-loop-v07.md`。
当前候选 SHA256：`996e5aeb084b66405a0dd1023a375743d2e359c335b29517ac923f9f6a033c5c`。
状态：正文按当前 SHA256 冻结，独立内容审校已通知 CRV07-01—04 在 AI 静态检查范围内完成返修复核；正式结论以 v0.7 独立内容审校报告为准。作者自查不是独立通过结论。正文中的接口级伪代码 **not_run**，没有实际外部服务、真实模型或业务执行记录，也没有用户认可的结果。

## 输入与写作决定

已完整只读转换并阅读 `/Users/shengxiong/Desktop/提示词.rtf` 和 `/Users/shengxiong/Desktop/agent控制循环.rtf`。提示词按用户明确要求作为本轮写作标准；控制循环样稿作为深度与组织参考，不继承其中未核实论断。样稿 Mermaid CSS 导出残片、半截伪代码未复制。

已读工作区 `AGENTS.md`，课程岗位的 `team/textbook-v07-spec.md` 与 `team/TEXTBOOK_WRITING_STANDARD.md`。采用专业同行前提，不沿用 v0.6 的“小林/商城”初学者叙事，也不把 v0.5 九栏规格表当正文。主线始终是一个运行如何受控推进；主案例保持“指定仓库修订的失败测试分析，经审批创建唯一缺陷工单”，没有扩为全部 Agent 技术百科。

本作者只创建/修改当前新正文、本交接和本作者历史快照。未改 `dist`、服务器、脚本、数据库、v0.5/v0.6 教材、职业量规、既有八门槛或发布配置。

## 实际内容位置与自查

| 用户要求/关键机制 | 正文位置及实际落实 | 本作者自查范围与剩余限制 |
| --- | --- | --- |
| 直接结论、同行假设、单一主问题 | 开篇结论和适用条件；第1节固定主目标与四项完成证据；第2节职责与状态投影 | 所有展开都用于同一控制循环；未用 A/B 代称组件，未用类比代替机制 |
| 状态、数据、控制权具体 | 第2—4节职责、State/Context、Run/Action/Attempt/CallBinding/Plan、三类身份、事务边界 | 接口为自研设计；数据库和网络适配器未实现，不能宣称运行保障已兑现 |
| 完整关键路径 | 第5节完整流输出与互斥决策；第8节类型、12类事务契约、主循环/工具/恢复函数 | 明写 not_run；不以 TODO 或省略号跳过工具、等待、验收拒绝、失败、预算或恢复分支 |
| 副作用未知与恢复 | 第6节查询/重发前提；第8节效果状态与调度状态分离、全部尝试聚合、原操作重发许可 | 同键重发只在自定义下游契约有效时允许，不解除历史未知；下游能力尚未实测 |
| 审批/取消/预算跨暂停 | 第7节不可变指纹、批准范围、分开账本与最后检查点；第8节 BeginTool 的原子停止分支 | 权限与取消检查仍存在发送竞态；不会声称本地取消撤销远端效果或估计费用等于账单 |
| 并发与持久化取舍 | 第9节工具依赖与恢复者租约分别说明；第12节四种可行形态的选择和放弃条件 | 串行伪代码不冒充并发实现；本地 fencing 不被解释为外部请求撤销 |
| 正常与异常路径可追踪 | 第10节正常十事件、验收负反馈、工单成功未提交、提交回执丢失、超时取消及双恢复者 | 轨迹都是原创教学推演，不是实际 trace 或测试证据 |
| 调试与评估有操作依据 | 第13节身份链、脱敏记录、指标分母与15类故障注入；第14节四项推理练习及参考分析 | 故障注入是待执行检查设计；不声称运行通过、学习者胜任或生产已验证 |

作者在编写中自查并修正：等待满足后必须事务清除而不重置预算；最后一次获准模型/工具结果仍可验收；费用未确认与业务效果未决不混淆；恢复重发未发出要持久化核对等待；动作显式保存目标修订；不同等待分别采用 WAIT_INPUT/WAIT_APPROVAL/WAIT_RETRY/WAIT_VERIFICATION/WAIT_RESOLUTION。上述为作者修正，最终是否自洽由独立审校判断。

## 已发现问题与返修记录

| 问题 | 原因及位置 | 已做返修 | 状态 |
| --- | --- | --- | --- |
| CRV07-01：复用逻辑动作丢失新协议调用关联 | 初稿 Action 只有首次 `tool_call_id`，不能向新轮调用回传匹配结果 | 第3节增加 CallBinding/Plan；意图提交为每个新调用建绑定；FinishPlan 按本轮调用 ID 回传原回执或拒绝观察 | 独立AI静态返修复核完成；正式结论见v0.7内容审校报告，非运行或用户认可 |
| CRV07-02：安全重发资格误解除先前未知效果 | 工单已创建但查不到→safe_replay置READY→取消把READY当未发送，可能干净停止；相邻新尝试无效果也不能证明旧尝试无效果 | Action 独立 effect_resolution；所有尝试聚合；safe_replay只生成原动作许可且仍UNRESOLVED；主循环专用恢复发送；停止/终态不丢未决；正文加入反例 | 独立AI静态返修复核完成，含原序列及相邻反例；正式结论见v0.7内容审校报告 |
| CRV07-03：普通工具预算拒绝可能空转 | BeginTool 额度为0却统一返回NOT_SENT，契约没有明确保存停止意图，READY可无限重试 | 第8节新增 BeginToolResult 及明确事务语义：硬拒绝原子写 stop_intent/放弃无未决效果动作，返回STOP；审批等待、权限拒绝、版本重查分别处理；加入零额度路径 | 独立AI静态返修复核完成，含预算0、审批等待与权限拒绝路径；正式结论见v0.7内容审校报告 |
| CRV07-04：逻辑动作额度在提交边界缺失 | 第7节列出逻辑动作预算，但意图提交没有原子新增计数，两个新读动作/剩余1额度结果未定 | 第8.1节明确事务内解析槽位复用、统计不同新动作、原子额度检查/扣计；不足则整批不建动作、绑定拒绝、消费响应并保存停止意图 | 独立AI静态返修复核完成，绑定当前996e5aeb正文；正式结论见v0.7内容审校报告 |
| 交付 QA：本篇执行状态不够显式 | 原文说明伪代码与非上线实现，未明确本篇是否执行 | 第8节仅一处补“本篇伪代码未运行，实际外部服务契约也未实测”；本交接同步 not_run | 已补事实，待最终交付 QA 核对当前哈希 |

历史保留，不能用新稿覆盖缺陷发现依据：

- `team/textbook-v07-history/author-partial-before-call-binding.md`：不完整阶段稿，SHA256 `1249b09d4424f1282d13e82eead79c8bcd06b66ee914a0448d425a922d6d66e2`，保留 CRV07-01 原字段。
- `team/textbook-v07-history/author-initial-complete-before-effect-resolution.md`：首个完整问题稿，SHA256 `96c30358f2735ad7d532348d6625b9d7c04442c55a3f3b18c33ae36d7164893d`，保留 CRV07-02 原 READY/UNKNOWN 混用。
- `team/textbook-v07-history/author-revision-01-before-tool-gate-fix.md`：SHA256 `829548aa1474a9bca0d341525f8dddfff2dfcf3509f450bedfec813aaeb97e4c`，保留 CRV07-03 原非 DISPATCH 统一返回。
- `team/textbook-v07-history/author-revision-02-before-action-budget-fix.md`：SHA256 `9113ec45e404cf9afece361153a88cebc3034c445b3de4b799a3410d724fc7a3`，保留 CRV07-04 原逻辑动作额度缺口。

## 来源核对与支持范围

以下资料通过实际网页读取核对，查询日期均为2026-10-11。正文只对邻近事实使用来源，不把它们当自研运行时的实现证明。没有采用未确认 SDK 行为、性能数值、账单或专家意见。

| 来源 | 本次核到的事实范围 | 不据此推出的结论 |
| --- | --- | --- |
| [AWS Making retries safe with idempotent APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/) | caller 提供的意图请求 ID、同 ID 参数冲突、服务端 token/效果原子记录及保留窗口问题 | 客户端 checkpoint 与外部服务共享事务；所有下游永久 exactly-once |
| [Stripe Idempotent requests](https://docs.stripe.com/api/idempotent_requests) | 当前官方页明确区分 API v1/v2；v1保存首次执行后响应含500、可至少24h后清理、参数比较 | 把 v1 500/24h处理泛化到v2；将本例工单工具当实际Stripe接口 |
| [Python3.14 Coroutines and tasks](https://docs.python.org/3.14/library/asyncio-task.html) | 本地取消异常与超时等待语义；网页当前为3.14系列文档 | 本地协程取消意味着远端取消或回滚；本篇代码实际运行 |
| [SQLite Atomic Commit](https://www.sqlite.org/atomiccommit.html) | 原子提交对日志/刷盘/存储系统假设有依赖 | 任意磁盘/文件系统设置下 commit 都有同等断电保证 |
| [AWS Timeouts, retries, and backoff with jitter](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/) | 当前链接转AWS Builder Center；副作用超时不证明未发生，重试放大与退避/抖动 | 增加退避使非幂等操作安全；任何固定次数有普遍最优性能 |
| [etcd3.6 API guarantees](https://etcd.io/docs/v3.6/learning/api_guarantees/) | KV一致性/原子性、租约、超时后客户端可能不确定 | 本地租约能取消已到达第三方服务的旧请求 |
| [OpenTelemetry Tracing API](https://opentelemetry.io/docs/specs/otel/trace/api/) | span、事件和link可表达执行关系 | 本篇自定义字段是统一Agent语义标准；trace导出等于持久动作账本 |
| [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html) | 必要事件关联、敏感数据排除/脱敏和日志访问保护 | 任意源代码/用户正文可无条件写入公共telemetry |

额外预读 LangGraph 持久化及中断官方页，但原 `durable-execution` 地址跳转到 Persistence，未以它支持本篇所有恢复细节，也未引入具体 LangGraph API。本文主要采用自研契约，避免框架版本行为分散唯一主线。

## 尚未验证与交接下一步

作者没有执行伪代码或故障注入，也没有使用真实工单接口、付费模型请求、用户记录或默认业务数据库。外部幂等协议、操作查询一致性、实际批准服务与权限撤销、费用计价上界、真实持久化设置均需实现/契约测试。本篇的来源核对和推演不代替这些证据。

独立内容审校负责当前正文的技术主张、分支、来源与表达检查；测试岗位本轮只按授权核对文稿交付、哈希和证据范围，不把教材伪代码当已实现产品。用户是否认可试读、真人专家认可、真实学习结果及完整产品八门槛仍分别保留，作者不自行授予通过。

当前作者交接完成，正文不再修改。下一步由项目经理汇总独立审校及文稿交付 QA，先交用户试读；用户是否满意、真实运行及外部契约仍待相应证据，不自动推广全书或改程序。
