# Agent 双输入系统 v0.12 客户端修复交接

- 责任岗位：软件工程师
- 日期：2026-10-15（Asia/Shanghai）
- 交付版本：`agent-system-v0.12` 客户端修复
- 修改范围：仅 `dist/auth-career-v15.js`、`dist/learning-workbench.js`

## 已完成

### 职业输入

- 首选调用 `POST /api/agent/career/recommend`，请求体包含客户端 UUID `requestId`、`workbenchVersion=local-workbench-0.11`、`agentVersion=agent-system-v0.12`；旧本地服务返回 404/405 时回退 `GET /api/careers?q=...`。
- 统一适配新旧候选字段，保留 published、教材版本、索引版本、教材身份和服务提供的理由；候选响应不写入账户。
- 支持 `needs_clarification` 卡片和最多三项澄清操作；没有自动替用户选择职业。
- 确认仅由候选确认按钮触发。优先调用 `POST /api/agent/career/confirm`，发送新的确认 UUID、推荐请求 UUID、`expected` 版本快照（含 status/contentVersion/indexVersion/textbookVersionId/corpusHash）、`confirmation=user_explicit` 和新的幂等键；旧服务不可用时只向既有 `PUT /api/profile/career` 发送 `{careerId}`。
- 确认前检查查询序号和候选版本，确认响应再次核对职业身份和版本；响应失配不更新当前职业。
- 未登录顶栏提供“选择职业”入口；确认前会要求登录，未确认候选不写入。

### 学习内容输入

- 使用 UUID 作为每次提交的请求 ID，并将其放在新查询请求体、请求头、响应适配、等待态和结果卡元信息中；响应 ID 与请求 ID 不一致时拒绝显示。
- 默认 `useCurrentContext=false`，不发送当前章节位置；只有用户点击“结合当前阅读”后才带 `currentUnitId/currentSectionId`。
- 首选调用 `POST /api/agent/learning/query`，显式发送 career/content/textbook 版本、工作台版本和 Agent 版本；旧静态 Agent 职业在新路由不存在时回退到兼容 `/api/content/dialog`，兼容请求仅发送旧合同字段。
- 动态职业在新接口返回不可用或服务未接入时保留诚实 `unavailable` 状态，不使用默认 Agent 教材冒充回答。
- 学习结果和历史卡继续执行当前语料、原文、来源 hash 和定位校验；请求不会自动改学习记录。

## 验证

- `node --check dist/auth-career-v15.js`：通过。
- `node --check dist/learning-workbench.js`：通过。
- 隔离 Node VM 加载两份客户端脚本：通过。VM 使用无 DOM 副作用桩，确认脚本可安全初始化，不代表浏览器交互验收。

## 限制与交接

- 本交付未修改后端、检索服务、PRD、UX 或 QA 报告；新确认/学习路由的实际 HTTP 行为由后端和测试岗位独立复验。
- 未执行浏览器 CUA、真实账户写入或真实 4318 服务操作；未调用外部模型或付费服务。
- 旧接口 fallback 仅用于服务路由尚未部署的本地兼容，不会把新字段伪装成旧接口能力。
