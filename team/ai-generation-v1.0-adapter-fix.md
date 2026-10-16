# AI 生成工程师：1.0 OpenAI 兼容端点适配修复

版本：`ai-generation-v1.0-adapter-fix-20261016`  
状态：`implemented_not_deployed`  
责任岗位：AI 生成工程师

## 交付结论

已对真实模型适配器做最小修改，支持通过服务端环境变量指定安全的 OpenAI-compatible Responses 端点，同时保留原有官方端点默认值。模型变量仍以 `OPENAI_MODEL` 为规范名，并兼容已有的 `GENERATE_MODEL` 别名；若两者同时存在，`OPENAI_MODEL` 优先。

本轮只改适配器和离线模拟合同检查；没有把任何密钥值复制、记录、写入交付物或对外输出，没有修改数据库，没有部署，也没有发起真实供应商请求。

## 修改内容

### `server/generation/index.mjs`

- `OPENAI_BASE_URL` 可选；缺省为 `https://api.openai.com/v1`。
- 端点必须是 HTTPS，禁止用户名、密码、查询参数和 hash；末尾斜杠会被规范化。
- 请求仍固定为 `${baseUrl}/responses`，继续使用 Responses REST 合同，不改成 Chat Completions，不从用户请求接受端点。
- `OPENAI_MODEL` 优先，缺失时兼容读取 `GENERATE_MODEL`。
- 保留 `OPENAI_MAX_OUTPUT_TOKENS` 256–16000、预算/预估成本关系、100–300000ms 超时、2MiB 响应上限、严格 JSON Schema、来源绑定和未知外部结果语义。

### `server/generation/dev-check.mjs`

增加了三个离线合同断言：

1. 合法 HTTPS 自定义端点可通过就绪校验。
2. HTTP 端点 fail closed。
3. 自定义端点只追加 `/responses`，不改变请求合同。

## 验证证据

执行命令：

```text
node sites/rolecraft/server/generation/dev-check.mjs
```

结果：`19/19 passed`，`simulation=true`，`realProviderCalled=false`。

修改后文件摘要：

| 文件 | SHA-256 |
| --- | --- |
| `sites/rolecraft/server/generation/index.mjs` | `9797e8053769a8bfa1f4ba6203933106fa28be649e44fedee323948f4a95477d` |
| `sites/rolecraft/server/generation/dev-check.mjs` | `3cbc76b69f12b45887b36f1f54d012e9f8d8f7e0bbf79ae04b8a3fc42937da6b` |
| `sites/rolecraft/server/generation/dev-check-results.json` | `d042ac3cc90ad706648547a4359aaee493fbe8df3986a8f8a76ba9eb5b2f0740` |

## 后端部署交接

后端只在远程受控环境注入以下字段，不同步本地 `.env.external-services.local`，不将秘密写入 PM2 参数或日志：

```text
OPENAI_API_KEY=<secret value; do not place in reports or chat>
OPENAI_BASE_URL=<https OpenAI-compatible base; default is official /v1>
OPENAI_MODEL=<authorized model id; canonical>
OPENAI_MAX_OUTPUT_TOKENS=<integer 256..16000>
ROLECRAFT_GENERATION_BUDGET_USD=<positive total experiment budget>
ROLECRAFT_ESTIMATED_MAX_COST_USD=<positive estimate <= budget>
OPENAI_TIMEOUT_MS=<integer 100..300000>
```

现有本地配置中的端点和模型变量只能作为待核对线索；在真实调用前必须确认目标端点支持 `POST /responses`、`text.format.type=json_schema` 的严格结构化输出，以及返回 `status/id/model/usage/output[].content[].output_text`。若供应商只支持 Chat Completions 或不同结构，应另交适配，不得静默降级。

后端还应在入队快照中记录规范化的模型和非敏感端点引用（模型使用 `OPENAI_MODEL || GENERATE_MODEL`），使任务审计不出现“实际使用别名但快照为 null”的差异；不得记录 API Key。

## QA 交接条件

测试工程师在后端报告 `/api/health` 显示 `generation.configured=true` 后，使用隔离测试账户和无个人资料的固定 e03 输入执行一次受控真实调用，确认：

- 事件序列为 `sources_validating → generating → structure_validating → draft_ready`；
- `provenance.simulation=false`，存在受限 provider request/response ID 与 usage；
- 章节来源、结构和 `verification` 未审状态仍由服务校验；
- 认证、响应不完整、严格结构失败及超时语义不把失败写成成功；
- 日志、事件、浏览器和报告不出现 API Key、Authorization header 或原始供应商错误正文；
- 账单/实际成本另由运营记录，不能用 `ROLECRAFT_ESTIMATED_MAX_COST_USD` 冒充实际费用。

在测试完成前，本交付只能称为“适配器和模拟合同已通过”，不能称为真实模型已接入、模型质量通过或内容已完成专业审核。

