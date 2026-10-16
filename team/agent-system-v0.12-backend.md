# Agent 双输入系统 v0.12 后端交接

- 责任岗位：后端数据工程师
- 版本：`agent-system-v0.12`
- 基线：`local-workbench-0.11`
- 实现文件：`server/index.mjs`
- 交接日期：2026-10-15

## 已实现

### `POST /api/agent/career/recommend`

公开只读路由，严格校验 `requestId`（UUID）、`query`（1–1200 字符）、`workbenchVersion`、`agentVersion` 和已知字段。服务复用现有 `availableCareers`，只读取 `status='published'` 职业，最多返回 3 个候选；每个候选绑定 `contentVersion`、`indexVersion`、`textbookVersionId`、`corpusHash`，并标记真实 `matchSource` 与 `providerCalled=false`。响应同时提供 `snapshot`（单候选时）、`corpus`、`index` 快照、`requestId`、`status`、`writePolicy='confirm_required'`。无匹配返回 `no_match`；裸 `React` 返回 Agent ReAct/前端 React 两项 `needs_clarification`，不会自动选择或写入账户。

### `POST /api/agent/career/confirm`

登录会话内的确认路由，沿用现有 CSRF 检查。只接受 `confirmation='user_explicit'`，要求 `careerId` 与 `expected` 快照（职业状态、教材版本、索引版本、教材版本身份、语料 hash）一致，并核对 `recommendationRequestId`、幂等键和工作台/Agent 版本。服务重新读取职业目录；职业被撤回或任一快照变化时返回 `409 career_version_mismatch`，不写账户。校验通过后复用统一 `switchCareer` 写入既有 `user_careers` 和 `user_preferences`，返回 `status='confirmed'` 与 `write.idempotent`；同一进程内重复幂等键回放原确认结果，换用同键确认其他职业返回 `409 idempotency_conflict`。原 `PUT /api/profile/career` 改为调用同一写入辅助函数，旧协议保持不变。

### `POST /api/agent/learning/query`

公开只读路由，适配现有 `dialogContent`。按职业快照核对 `contentVersion` 与 `textbookVersionId`，可选 `useCurrentContext=true` 时服务端验证 `currentUnitId/currentSectionId`；关闭上下文时拒绝携带章节位置。返回 `requestId`、`status`、`resultType`、`contentVersion`、`indexVersion`、`textbookVersionId`、`corpusVersion`、`corpusHash` 和带 `sourcePath`、`sourceSha256`、原文摘录、`href` 的结果卡，并回传 `dialog`/`clarification`。`answered` 映射为 `recommended`，`related_uncovered`/`unrelated` 映射为 `no_match`；不匹配、不可用和澄清状态保留。响应固定 `providerCalled=false`，限制语句说明结果只来自当前教材原文，不写账户、教材或学习记录。

不支持为非 Agent 职业调用 v0.12 本地索引时，返回受控 `unavailable`，不会误用 Agent 教材回答其他职业。

## 保留的旧行为

`/api/careers`、`/api/content/recommend`、`/api/content/dialog`、`GET/PUT /api/profile/career` 以及账户、课程目录、进度、收藏和笔记接口未改变其字段和权限边界。没有数据库迁移；推荐和学习查询不写入数据库。

## 自检证据

- `node --check sites/rolecraft/server/index.mjs`：通过。
- `node --check sites/rolecraft/server/retrieval/index.mjs`：通过。
- 隔离临时 SQLite 的进程内 HTTP 请求夹具：推荐成功、`React` 澄清、学习结果来源/版本绑定、版本冲突 `409`、登录后显式职业确认成功；provider 调用为 0。
- 现有 `server/dev-check.mjs` 在当前受限沙箱无法监听 `127.0.0.1`（`listen EPERM`），因此没有把监听失败误报为 HTTP 通过；夹具使用相同请求处理器并清理临时数据库。

## 交接限制

本交付只覆盖后端协议适配和账户确认边界。客户端入口、卡片视觉与浏览器交互由客户端/设计岗位负责，独立协议和浏览器验收由测试岗位负责。真实外部模型、付费调用、上传和生产部署未发生。
