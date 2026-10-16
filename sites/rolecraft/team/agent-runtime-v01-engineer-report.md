# Agent runtime v0.1 软件工程师交付记录

- **岗位**：Agent 开发工程师（AGDEV）
- **范围**：第一阶段本地只读、离线可测试运行时骨架
- **版本**：`agent-runtime-0.1.0`，`agent-spec-v1`，`tool-descriptor-v1`
- **授权边界**：只写 `server/agent/` 与本岗交付记录；未接 HTTP、生成服务、检索索引、SQLite、账户数据或客户端。

## 已交付

- `server/agent/index.mjs`：AgentSpec 校验与默认只读规范、状态机、任务/动作幂等键、版本/输入 hash、事件轨迹、预算/步数/超时停止、取消、澄清、成功/失败提交、只读工具注册与 scope/参数 schema 门禁、action intent/sent/observed、checkpoint/restore、unknown effect 恢复闸门。
- `server/agent/dev-check.mjs`：纯内存自检夹具，覆盖工具副作用拒绝、spec/envelope、重复任务、状态停止、只读调用与 action replay、权限缺失、工具失败、checkpoint 恢复和事件脱敏/单调序列。
- `server/agent/README.md`：运行方式、接口边界和未实现项。

## 实际自检

命令：`node sites/rolecraft/server/agent/dev-check.mjs`

结果：`passed`，8 项通过。自检 JSON 明确记录 `modelCalled=false`、`providerCalled=false`、`externalNetwork=false`、`databaseTouched=false`、`userDataMigrated=false`。

## 未实现与不能外推

本交付没有真实模型 gateway、检索适配器、HTTP 路由、持久 `jobs/events` 映射、跨进程 lease、外部效果账本、release/rollback、长期记忆或生产工具。没有执行真实供应商、外部工具、浏览器、数据库、用户账户、付费调用或真人/专家验证；自检不等于独立 QA，也不代表自然语言理解、学习效果、职业能力或生产可靠性。

## 交接

- AI 生成工程师：后续通过版本化 `ModelGateway` 接口接入模型；本阶段不提供模型成功假象。
- 内容检索工程师：后续可注册只读教材目录/章节/证据工具；来源版本和 hash 仍由检索模块校验。
- 后端数据工程师：评估将 TaskState、事件、checkpoint 和 action 状态映射到现有持久任务表；本阶段没有私改 SQLite schema。
- 测试工程师：按架构蓝图失败矩阵独立复验正常、无匹配/澄清、工具失败/超时、取消、重复和恢复；本报告只记录工程自检。

