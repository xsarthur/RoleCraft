# 后端数据工程师：真实模型端点与 503 诊断

版本：`backend-v1.0-provider-diagnosis-20261016`
角色：后端数据工程师
目标：在不重复完整生成、不输出密钥或完整响应的前提下，核对远程真实模型端点、适配器版本、HTTP 503 诊断线索与下一步调用门槛。
状态：`reachable_auth_gated_contract_unverified`

## 已确认

- 远程配置端点主机为 `www.9898.ai`，base path 为 `/v1`；模型字段为 `gpt-5.5`，远程同时保留 `OPENAI_MODEL` 与兼容字段 `GENERATE_MODEL`。没有输出 API Key。
- 适配器与后端代码已部署且哈希一致：
  - `server/generation/index.mjs`: `9797e8053769a8bfa1f4ba6203933106fa28be649e44fedee323948f4a95477d`
  - `server/index.mjs`: `23fe1071d490e8042cd408ad1b3b7bd445529ac432ab5b6327f5d8047de4a6a7`
- PM2 `rolecraft` 在线，服务监听 `127.0.0.1:4318`；远程 health 仍为 `generation.configured=true`、`missing=[]`。
- PM2 error log 为空；out log 仅包含服务启动地址，没有保存供应商完整响应或密钥。因此本地日志不能解释 503 的上游原因。

## 不携带凭据的诊断

只读网络探测没有发送 API Key、模型输入或 JSON Schema：

| 请求 | 结果 | 结论 |
| --- | --- | --- |
| `GET /v1/models` | HTTP 401，JSON 错误响应 | 网关可达，但模型目录需要认证 |
| `POST /v1/responses`，空 JSON | HTTP 401，JSON 错误响应 | Responses 路径到达认证层，尚未执行模型/Schema 校验 |
| `GET /v1/` | HTTP 301 | base route 可达 |
| `OPTIONS /v1/responses` | HTTP 404 | 不能据此判断 POST 路由不可用；无凭据 POST 已到认证层 |

因此 DNS/TLS/公网路由不是当前已证实的阻塞；上次真实调用的 HTTP 503 可能发生在认证后的模型路由、上游容量或供应商暂时故障，但没有证据区分这些原因。

## 认证探测限制

为避免把 API Key 再次外发给第三方诊断端点，尝试携带远程密钥执行只读 `/v1/models` 与 `/v1/responses` 探测时被自动审批拒绝；没有绕过该拒绝，也没有再次提交生成请求。当前不能从认证模型列表确认 `gpt-5.5` 是否对该账号可用，不能确认 Responses strict JSON Schema、usage 和输出结构是否被目标通道接受。

## 与上次 503 的关系

测试工程师唯一一次完整 e03 调用已记录为 `simulation=false`、`providerCalled=true`，供应商返回 HTTP 503 / `provider_unavailable`，`providerOutcomeUnknown=true`；没有 usage、provider request/response ID 或成功草稿，且未执行 retry。该调用证实真实 transport 已触发，但不证明模型名称、端点通道或结构化输出合同正确。

## 下一步门槛

1. 由具有供应商控制台或明确授权的责任人确认账号实际可用模型 ID、Responses 通道和 strict JSON Schema 支持；不能从 `gpt-5.5` 字符串或网关版本推断。
2. 由测试工程师使用隔离账户和固定短输入，执行一次最低成本的认证结构化探测，核对 `status=completed`、响应 `id/model`、合法 usage、单一 `output_text` 和本地 Schema 校验。
3. 探测未成功前禁止完整章节生成和自动重试；若仍为 5xx，保留未知外部结果并暂停。探测成功且估算成本不超过 `$1` 后，才可取得新的明确授权，以新的幂等键进行完整生成。

本记录不包含 API Key、Authorization、完整请求、完整供应商响应或私密错误正文。
