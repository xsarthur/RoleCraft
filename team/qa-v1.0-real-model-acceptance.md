# 测试工程师：1.0 真实模型受控调用验收

版本：`qa-v1.0-real-model-acceptance-20261016`
岗位：测试工程师
目标：在唯一远程开发环境对已配置的真实模型执行一次受控验收，核对真实传输、阶段、错误语义、来源/版本冻结、预算参数和数据保存边界。
状态：`provider_unavailable_provider_outcome_unknown`

## 验收范围与隔离

- 目标环境：`http://111.231.8.78`，release `rolecraft-1.0`。
- 使用新建隔离测试账户；账户邮箱、密码和会话令牌不写入本报告。测试画像为固定合成输入：`startingPoint=beginner`，目标为“理解受控Agent工程闭环并准备面试”，不含个人资料。
- 只提交一次新任务，未对该任务执行 retry；供应商结果未知时不重复发送可能计费的请求。
- 模块固定为 `e03`，幂等键与会话凭据不写入报告。测试于 2026-10-16（UTC）执行。

## 前置配置核对

`GET /api/health` 返回 HTTP 200，生成配置为 `configured=true`、`missing=[]`。本轮已签收的资源参数为：`max_output_tokens=1200`、应用预算 `$1`、调用前估算 `$0.05`、超时 `30s`。未读取、输出或记录 API Key、完整端点、Authorization、完整请求或供应商响应。

## 实际调用证据

- 任务 ID：`b8502cef-edc3-4860-a1e2-249ce738a780`
- 输入 hash：`eee901f52299752c9ec55a9161b5649376b899966cd4ba6b50f1daa5e801d30d`
- 任务时间：`2026-10-16T01:18:29.463Z` 至 `2026-10-16T01:18:31.558Z`。
- 任务状态：`queued → running → failed`。
- 事件序列：`queued → running → sources_validating → generating → failed`。
- `generating` 事件中的 `simulation=false`，说明使用真实 transport；本次 `providerCalled=true`（已发出真实供应商请求）。
- 供应商返回 HTTP `503`，应用语义为 `provider_unavailable`；错误消息为“生成未完成（provider_unavailable）；草稿未被保存为成功产物”。
- `providerOutcomeUnknown=true`。适配器已发出请求，但未获得可确认的供应商响应标识，不能断言请求是否在供应商侧计费或完成。
- `usage=null`、`providerRequestId=null`、`providerResponseId=null`；本次 503 没有可记录的合规请求/响应标识，也没有伪造 usage。
- 未进入 `structure_validating` 或 `draft_ready`；章节数为 `0`，未保存成功草稿。

## 冻结与数据核对

任务记录保留固定输入 hash、模块和版本快照：

- product：`local-mvp-0.4`
- curriculum：`curriculum-draft-0.2`
- template：`uniform-v1`
- rubric：`curriculum-draft-0.2`
- sourceBundle：`generation-curriculum-draft-0.4`
- profile version：`1`，起点 `beginner`

由于供应商在生成阶段返回 503，未产生章节正文，因此无法对成功草稿中的逐主张来源绑定执行正向核验；系统在失败路径没有保存不完整草稿，符合当前失败语义。任务的版本冻结与输入 hash 已保留，可供后续经确认的显式 retry 复验。

## 验收结论

本次真实调用验收为 `not_met_provider_unavailable`，原因是目标供应商端点返回 HTTP 503。真实调用链、非模拟标记、错误语义、超时/预算前置配置、版本冻结和失败不落库通过；真实模型生成成功、usage、request/response ID、结构化章节、来源绑定和成本账单未通过或未获得证据。

不应把本次 503 解释为模型已成功接入，也不应立即 retry。由 AI 生成工程师与后端数据工程师核对端点可用性、Responses API/严格 JSON Schema 支持和供应商状态；待外部原因确认后，由测试工程师在新的明确授权下使用新的幂等键执行一次重试。若要核对本次请求是否产生费用，应以供应商控制台账单或请求日志为准，应用返回没有该信息。
