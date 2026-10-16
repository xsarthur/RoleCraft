# 第16岗 Agent 开发工程师项目经理协调记录 v0.1

日期：2026-10-14（Asia/Shanghai）
状态：architecture_plan_ready；运行代码尚未修改，架构和岗位均未通过独立验收

## 用户授权与岗位新增

用户明确要求新增一名专业 Agent 开发工程师，负责程序后续 AI 需求和已完成 Agent 的架构。该岗位编号为第16岗，稳定 role_id 为 `AGDEV`。

## 与现有岗位的边界

- `AGDEV`：Agent 需求拆解、运行时编排、状态机、工具策略、恢复/停止、观测和架构版本。
- `AI` AI生成工程师：真实模型调用、模型适配、结构化生成、供应商配置和生成失败处理。
- `RETR` 内容检索工程师：版本化教材索引、召回/排序、出处和只读检索接口。
- `BE` 后端数据工程师：账户、权限、持久任务、迁移、恢复存储和版本数据。
- `FE` 软件工程师：客户端界面、状态呈现和接口消费。
- `QA` 测试工程师：独立夹具、运行复现、缺陷和验收结论。
- `PROD` 产品经理：用户问题、范围、非目标和验收门槛。

## 当前交付

- [岗位契约](agent-development-engineer-product-v01.md)
- [Agent架构蓝图](agent-development-architecture-v01.md)
- [独立架构QA方案](agent-development-architecture-qa-v01.md)
- [本地运行时骨架](../server/agent/README.md)
- [软件工程师交付记录](agent-runtime-v01-engineer-report.md)
- [独立运行时验收](agent-runtime-v01-qa.md)
- [架构方案静态读取依据](../server/index.mjs、../server/generation/index.mjs、../server/retrieval/index.mjs)

## 当前事实

现有程序已有受控单章生成任务、SQLite jobs/attempts/events 租约与事件、版本化教材检索、语义/抽取式对话和来源 hash 校验。现有程序尚未形成通用 Agent orchestrator、AgentSpec 注册、工具注册与策略引擎、外部效果账本、长期记忆存储或 release registry。现有能力不能直接声称支持 ReAct、计划/重规划、多工具恢复或多 Agent 委派。

## 首个派工顺序

1. `PROD` 冻结一个窄 AI 场景、用户目标、非目标、验收ID和权限范围。
2. `AGDEV` 冻结 AgentSpec、状态图、事件合同、工具目录和失败矩阵；先做本地只读、离线隔离切片。
3. `BE` 评估 jobs/attempts/events 的扩展、checkpoint/action ledger/release registry 迁移；不得由 AGDEV 私改用户数据库。
4. `AI` 和 `RETR` 分别提供模型与检索适配器；保持 providerCalled、simulation、source hash和无匹配状态诚实。
5. `FE` 接收运行状态、澄清、引用、失败和未知效果显示合同。
6. `QA` 按 G0–G5 独立执行静态、契约、工具权限、恢复、降级、观测、评估和回滚验收。

## 授权边界

本轮只授权架构设计、接口交接和隔离本地准备；未授权真实付费模型调用、外部工具副作用、上传、发布、生产流量或真实账户数据迁移。架构文件存在、模拟成功和静态自查不能代表代码实现或生产验收通过。

## 当前状态

方案范围内已进入架构交接。第一阶段本地内存只读运行时骨架已实现并由独立QA验收为 `pass_with_limitations`：9项独立夹具为8项 `pass`、1项 `pass_with_limitations`、0项 `fail`。完整 Agent 架构仍为 `insufficient_evidence`，因为持久存储、跨进程恢复、外部效果账本、真实模型/HTTP/检索冲突、发布回滚尚未实现或实测。`AGDEV` 员工能力仍为 `not_assessed`。每个后续版本必须重新冻结 AgentSpec、模型/检索/工具/状态/记忆版本和评估样本，并由 QA 独立复验。
