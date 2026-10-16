# 后端数据工程交接：Rolecraft 1.0 发布身份

- **日期**：2026-10-15（Asia/Shanghai）
- **责任岗位**：后端数据工程师
- **范围**：产品合同 `product-v1.0-scope.md` 的 V1-06 后端最小接入
- **状态**：`met_within_backend_scope`
- **源码**：`server/index.mjs`（本次自检 SHA256：`fad1ba848029ee6dfdf41a60d866df9a9d5561ee231689923990b61fe1d2ecfd`）

## 变更

1. 新增公开发布常量 `RELEASE_VERSION = 'rolecraft-1.0'`。
2. JSON 响应统一附带 `releaseVersion: 'rolecraft-1.0'`，因此健康、教材目录/章节、推荐/对话、职业内容、职业 Agent 推荐与学习查询，以及其余服务响应都能报告当前发布身份。
3. JSON、教材图/引用资源和静态文件响应统一附带 `X-Rolecraft-Release-Version: rolecraft-1.0`，不改变静态文件内容。
4. 保留 `PRODUCT_VERSION = 'local-mvp-0.4'` 作为旧账户/生成兼容字段；未改变 `workbenchVersion = local-workbench-0.11`、`agent-system-v0.12` 的请求校验或生成协议语义。

本次未改教材、检索算法、客户端、账户表结构、正式数据库、用户服务进程或外部接口配置。

## 自检证据

| 检查 | 结果 | 证据 |
|---|---|---|
| 语法 | pass | `node --check sites/rolecraft/server/index.mjs`（Node `v24.16.0`） |
| 隔离服务健康/目录/推荐/职业内容 | pass | 临时 SQLite 目录、进程内 HTTP handler；`GET /api/health`、`GET /api/content/catalog`、`POST /api/content/recommend`（`ReAct`）、`GET /api/careers/agent-developer/content` 均返回 200，并逐项核对 `releaseVersion` 与响应头 |
| 兼容身份 | pass | 健康响应仍为 `productVersion=local-mvp-0.4`；推荐请求使用 `corpusVersion=textbook-v12`，返回 `providerCalled=false` 与 `status=recommended` |
| 正式运行环境 | 未触碰 | 未启动或停止用户服务；未调用外部网络或付费模型；自检数据目录在 `/private/tmp`，已清理 |

## 边界与后续复验

这是后端字段与响应头的自检，不是 1.0 独立 QA，也不证明页面、构建清单、教材索引、题库数据或浏览器展示已绑定同一版本。客户端、内容检索与测试岗位应在各自 1.0 收到版本冻结后复核 `releaseVersion`、兼容字段及 V1-06 的跨产物一致性。
