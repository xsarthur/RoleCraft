# Agent 系统 v0.12 两处输入独立 QA

- **复验日期**：2026-10-15（Asia/Shanghai）
- **QA 角色**：测试工程师
- **范围**：职业输入、学习内容输入、v0.11 学习工作台接入，以及 v0.12 `/api/agent/*` 协议。
- **当前结论**：`met_within_scope`
- **当前证据**：[agent-system-v0.12-qa.json](agent-system-v0.12-qa.json)
- **独立脚本**：[agent-system-v0.12-qa-check.mjs](agent-system-v0.12-qa-check.mjs)
- **首轮冻结结果**：[agent-system-v0.12-qa-r1.json](agent-system-v0.12-qa-r1.json)

本轮没有修改应用代码、接口协议、产品需求或设计。首轮失败保留为历史证据；当前结论只针对修复后的源文件和第二轮复验，不能把首轮失败覆盖为“从未发生”。

## 首轮与第二轮

首轮在客户端/后端补齐前执行，结论为 `not_met`，30 项中 13 项通过、9 项失败，主要缺口是：没有 `/api/agent/*` 推荐/确认/学习路由，缺少 React 澄清和版本快照确认，学习上下文默认开启，requestId 没有 body/response 闭环，结果卡没有展示请求 ID，动态职业问答未接入，匿名职业入口缺失。完整记录保存在 `agent-system-v0.12-qa-r1.json`。

第二轮针对这些门槛重新冻结当前源码并复验，结果为 43 项全部通过。检查包含直接检索样例、语法、静态客户端合同和进程内 HTTP 路由案例；旧路由兼容、失败状态和版本冲突也实际运行，没有把旧结论自动继承为新结论。

## 第二轮执行证据

### 静态与语法

- `node --check` 通过：职业脚本、学习工作台、学习体验、主服务、检索入口、对话检索模块。
- 页面同时挂载职业 Agent 和学习工作台；职业推荐、确认、学习查询都生成 UUID requestId。
- 职业推荐响应带 `status`、`requestId`、候选身份/教材快照、`providerCalled=false` 和确认边界。
- 职业确认发送 `expected` 版本快照和幂等键；服务端重新核对 published 状态、教材版本、索引版本、教材版本 ID 和 corpus hash。
- 学习上下文默认关闭，只有用户开启当前章节后才发送章节位置；响应来源继续核对章节、摘录、来源 SHA256、corpus hash 和版本。
- 同一入口继续使用 `AbortController` 和递增序列丢弃迟到响应；历史卡重新核对当前教材版本。

### 进程内 HTTP 与临时 SQLite

为避免修改用户数据库，测试用临时 SQLite 目录创建服务实例，并直接调用 Node HTTP handler；没有绑定真实 TCP 端口。实际通过的场景包括：

- `POST /api/agent/career/recommend`：有效 Agent 目标返回 `recommended`、published 候选、教材/索引/corpus 快照。
- 职业输入 `React`：返回 `needs_clarification`，两个选项分别说明 Agent ReAct 和前端 React。
- 目录外职业：返回 `no_match`、零候选，不创建职业。
- 注册隔离测试账户后，`POST /api/agent/career/confirm`：用户确认后写入 `active_career`，来源为 `agent_confirmed`。
- 使用同一幂等键重复确认：返回 `idempotent=true`，没有重复写入。
- 使用过期 corpus hash 确认：返回 `409 career_version_mismatch`，错误 envelope 回显 requestId。
- `POST /api/agent/learning/query`：`React` 返回 `needs_clarification`；`ReAct` 返回当前教材结果、版本和来源信息，`providerCalled=false`。
- 显式开启当前章节：请求接受并保持当前 v12 版本核对；未开启却发送章节位置：返回 `400 input_invalid`。
- 发送错误教材版本：返回 `409 content_version_mismatch`，错误 envelope 回显 requestId。
- 旧 `GET /api/careers?q` 与旧 `POST /api/content/recommend` 仍可用，作为兼容入口保留。

### 内容检索直接运行

v12 语料直接运行核对为 30 篇，`corpusVersion=textbook-v12`，`corpusHash=1a385b179c0cb8a5b838d17b9d2606a0c1a7e27636d97db45dba5e2a52b284e0`。恢复轨迹/幂等、否定多意图、`React` 澄清、伪造来源和天气题外域样例均通过；所有本地样例均未调用外部供应商。

## 真实 HTTP 与浏览器边界

同一幂等键的证据覆盖同一服务进程；确认键当前保存在进程内 map，尚未验证服务重启后的幂等恢复。若需要跨重启幂等，应由后端数据工程师增加持久记录并另行复验。

当前沙箱仍不允许测试脚本绑定本地 TCP 端口（`listen EPERM`），所以第二轮 HTTP 证据是**进程内 handler + 临时 SQLite**，不是网络 socket 证据。此前尝试用 Chrome 访问已有 `127.0.0.1:4318/#learn` 返回 `origin_rejected`，本轮没有声称真实浏览器焦点、滚动、中文输入法 Enter、响应式布局或真实迟到响应已经通过。

仍需在可访问本地服务和浏览器的环境补做：真实 HTTP 状态码/headers、职业弹窗键盘焦点、学习抽屉定位焦点、中文输入法组合提交、375px/760px 响应式、浏览器双提交时序和动态职业的真实教材目录交互。动态职业未准备专属本地索引时，当前服务会诚实返回 `unavailable`，不能把该状态表述为推荐成功。

当前 `met_within_scope` 仅表示本轮 PRD/协议、静态客户端逻辑、进程内服务路由、临时数据隔离和直接检索证据达到限定范围；不代表真实浏览器用户理解、真实学习效果、职业胜任、专家审核、生产发布或行业先进性目标完成。

