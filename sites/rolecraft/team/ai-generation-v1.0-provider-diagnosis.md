# AI 生成工程师：自定义供应商端点诊断

版本：`ai-generation-v1.0-provider-diagnosis-20261016`  
状态：`reachable_auth_gated_contract_unverified`  
范围：`https://www.9898.ai/v1` 的网络可达性、路径和公开协议线索；不读取或输出密钥，不提交生成请求。

## 结论

上次真实调用返回 HTTP 503 后，本轮只做了无密钥探测。端点的 DNS/TLS/HTTP 边缘可达，且 `/v1/models` 与 `/v1/responses` 都返回了统一的 `401 Unauthorized`，说明请求到达了 New API 网关的认证层；这不是 DNS、TLS 或公网端口不可达。根路径 `/v1/` 也能正常返回重定向。

但这组结果**不能证明具体模型、上游通道或 strict JSON Schema 已可用**：认证层在读取模型和执行请求前拒绝了无密钥请求。端点返回头标识 `X-New-Api-Version: v1.0.0-rc.30`，公开首页为 New API 管理界面。New API 的公开文档说明其支持 OpenAI Responses 的 `POST /v1/responses`，并区分 sync、stream、background 模式；具体模型是否绑定到 Responses 通道、是否接受本项目的 `text.format.type=json_schema`，仍须在该账号下做一次受控协议探测。

因此，当前建议是：**不要因 503 自动重试或直接重复完整章节生成**。后端先确认账号可用的模型 ID 与端点通道；确认后由测试工程师使用最小、无个人资料的结构化输出探测，再决定是否执行完整生成。

## 无密钥探测证据

| 探测 | 结果 | 可得结论 |
| --- | --- | --- |
| `GET https://www.9898.ai/v1/models` | `401 Unauthorized`，JSON 错误为无效 token | 网关可达，模型列表需要认证；未证明模型名 |
| `POST https://www.9898.ai/v1/responses`，空 JSON body | `401 Unauthorized`，同一网关版本头 | 请求到达认证层；未执行模型或 schema 校验 |
| `GET https://www.9898.ai/v1/` | `301` 到 `/v1` | base URL 的 HTTP 路由可达 |
| `GET https://www.9898.ai/docs` | `200`，New API 管理界面 | 主机运行 New API 风格网关；不代表账号/模型可用 |
| `GET https://www.9898.ai/v1/docs`、`/v1/openapi.json` | `404 Invalid URL` | API 前缀没有公开 OpenAPI 文档入口 |

探测使用了 `curl` 的有限超时与无 Authorization 头；没有携带模型、输入、章节内容、JSON Schema 或 API Key。没有发生供应商生成调用，也没有产生本轮可归因的费用。

## 协议和模型判断

### 已确认的网络层

- `https://www.9898.ai/v1` 使用 HTTPS，可建立连接并获得网关响应。
- `/v1/models` 和 `/v1/responses` 的认证错误格式一致，网关版本头为 `v1.0.0-rc.30`。
- 上次 503 更可能发生在认证之后的模型路由、上游供应商或暂时容量层；仅凭 503 不能区分模型不存在、渠道不可用、上游超时或网关故障。

### 有公开资料支持但仍需账号验证的部分

New API 官方项目资料列出 OpenAI Chat/Responses 兼容接口；文档描述 `POST /v1/responses`，并要求 Responses 调用选择已支持的模型和 sync/stream/background 请求形式：

- [New API README：OpenAI Chat / Responses](https://github.com/QuantumNous/new-api/blob/main/README.en.md)
- [New API user API：Responses Compatible Interface](https://github.com/QuantumNous/new-api-docs-v1/blob/main/content/docs/en/guide/feature-guide/user/api.mdx)

这些资料只能证明该网关软件具备相关接口，不证明 `9898.ai` 的具体账号已绑定 `gpt-5.5`，也不证明该模型支持本项目的严格结构化输出。`text.format`、schema 名称、`strict:true` 和完整 JSON Schema 仍需实际响应确认；不能用网关版本或模型名称推断。

## 对上次 503 的处理建议

1. 后端不要把 503 改写成成功，也不要无限重试；当前适配器已把 5xx 映射为可显式重试的 `provider_unavailable`。
2. 在供应商控制台或经认证的 `GET /v1/models` 中确认实际可用模型 ID；若列表没有 `gpt-5.5`，更新 `OPENAI_MODEL`，不要用别名猜测。
3. 先做一次最小协议探测：固定短输入、`store:false`、低 `max_output_tokens`、同一 `text.format` JSON Schema，且使用隔离测试账号；仅当返回 `status=completed`、`id`、`model`、合法 `usage` 和可解析 `output_text` 时，才允许进入完整 e03 生成。
4. 若最小探测返回 400，按错误字段区分模型/协议/schema 不兼容；若返回 401/403，修复凭据或权限；若返回 429，记录限流并等待显式重试；若继续 5xx，保留 request ID，暂停完整生成并由后端核对供应商状态。
5. 只有在最小探测通过、预算预估不超过总预算且后端已完成备份后，才运行一次完整章节生成。不要用重启清除未知外部结果。

## 当前状态与责任

- AI 生成工程师：已完成无密钥网络/协议线索诊断；不部署、不复制密钥、不执行真实生成。
- 后端数据工程师：确认远程环境的实际端点、模型、预算和权限；保留 503 request ID 与 PM2/HTTP 时间线；不把本地密钥文件原样同步。
- 测试工程师：在后端确认模型和预算后，执行一次最小结构化协议探测，再独立决定是否进行完整真实调用。

结论为 `reachable_auth_gated_contract_unverified`，不是“真实模型已接入”，也不是“供应商永久不可用”。

