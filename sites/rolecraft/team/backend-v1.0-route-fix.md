# Backend v1.0 route fix

日期：2026-10-16

## 范围

后端岗位仅修改 `server/index.mjs` 的 `POST /api/agent/learning/query` 返回组装。保留已有 `status` 与面向旧客户端的 `resultType`，同时透传检索服务的意图、结果类型、不确定性、引擎和真实 provider 调用状态。

## 变更

- 新增 `intent`：优先使用 `retrieval.intent`，否则回退到既有 `learningResultType(query)`。
- 新增 `retrievalResultType`：优先使用 `retrieval.resultType`，其次使用 `dialog.resultType`，最后才回退到映射状态。
- 新增 `uncertainty`：透传检索或对话层值，无值时为 `null`。
- `engineMode` 优先透传检索值，其次对话值，最后使用既有本地语义检索默认值。
- `providerCalled` 仅在检索层明确为 `true` 时返回 `true`。
- 继续透传 `dialog`；因此 `related_uncovered` 会在 `retrievalResultType` 中保留原值，不被误标为普通 `no_match`。

## 验证

执行：`node --check sites/rolecraft/server/index.mjs`

结果：通过（退出码 0）。本记录未进行 HTTP 运行或浏览器验收。
