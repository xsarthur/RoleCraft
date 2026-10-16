# AI 生成工程师：1.0 真实模型参数核对

版本：`ai-generation-v1.0-real-model-param-review-20261016`  
角色：AI 生成工程师（参数、协议与证据边界）  
状态：`reviewed_with_blockers`

## 结论

当前生成适配器已经具备真实 OpenAI Responses REST 请求、严格 JSON Schema、响应结构校验、超时/取消和敏感错误映射，但**尚不能把远程环境称为已接入真实模型**。本次核对没有发起供应商调用；没有把任何密钥值复制、记录、写入交付物或对外输出。

后端可以部署真实配置，但必须先明确供应商协议。当前代码固定请求 `https://api.openai.com/v1/responses`，只读取 `OPENAI_MODEL`；它不会读取 `OPENAI_BASE_URL` 或 `GENERATE_MODEL`。本地外部服务配置中出现了非默认 base URL 和不同的模型变量名，因此不能直接把该文件复制到远程并宣称调用成功。若远程使用标准 OpenAI Responses 端点，按下列字段配置；若使用兼容供应商，须先由后端增加明确的 endpoint/协议适配并由测试验证，不能静默改成 Chat Completions 或把失败当成功。

## 核对依据

| 文件 | SHA-256 | 核对内容 |
| --- | --- | --- |
| `sites/rolecraft/server/generation/index.mjs` | `52ef3ffefe3028187192fa7712693a1929949403f651daaeb09999a7a12d5beb` | 配置读取、Responses 请求、输出/错误校验 |
| `sites/rolecraft/server/generation/dev-check.mjs` | `f032c63ff03d89b724eb5ba9645cf644c94a8004f7f9fe038bc42db8415892b0` | 仅模拟传输的工程自检 |
| `sites/rolecraft/server/README.md` | `79e2d2dcbbedacb6a0cab7050e35f145e9f0c948e1bbc2777b9b44ca7c1f53d9` | 生成配置和证据边界 |
| `deploy/.env.example` | `c40cde7279c46c98705dd823efde069911cf716a6c5f547c1ff9e1923288f9dd` | 远程部署变量模板 |
| `deploy/ecosystem.config.cjs` | `dadc7d190255936b6c509d8d3d66f4e080f8c2d0ed1e40b51f58e56deef00576` | PM2 变量传递 |

本地 `.env.external-services.local` 仅作为存在性线索，不作为部署输入；其中的秘密值、私有端点和凭据均不进入本报告、浏览器、源码、命令历史或 PM2 日志。

## 后端部署参数清单

### 当前适配器实际读取的变量

| 变量 | 约束 | 说明 |
| --- | --- | --- |
| `OPENAI_API_KEY` | 非空字符串 | 只在远程受控环境变量中注入，不写入请求日志和报告 |
| `OPENAI_MODEL` | `[-a-zA-Z0-9_.:]{1,128}` | 必须是目标端点实际授权的模型 ID |
| `OPENAI_MAX_OUTPUT_TOKENS` | 整数 `256–16000` | 发送为 Responses API 的 `max_output_tokens` |
| `ROLECRAFT_GENERATION_BUDGET_USD` | 有限正数 | 本轮试验总预算声明 |
| `ROLECRAFT_ESTIMATED_MAX_COST_USD` | 有限正数，且 `<=` 预算 | 调用前估算；不是供应商硬性限额或账单 |
| `OPENAI_TIMEOUT_MS` | 整数 `100–300000`，默认 `60000` | 超时后保留“外部结果未知” |

当前代码没有读取 `OPENAI_BASE_URL`、`GENERATE_MODEL`、供应商价格或自动成本上限。后端若配置标准 OpenAI 端点，应只设置上述变量；若必须使用自定义端点，应先交付并复验 endpoint 适配，不要仅改变量名。

### 请求合同

- `POST https://api.openai.com/v1/responses`，认证为 `Bearer`，请求体 `store:false`。
- 请求包含固定 system 指令、冻结的学习档案/章节规格/允许来源和 `text.format` 严格 JSON Schema；模型只提出 `ai_generated_draft`，不授予完成、专家审核、就业或职业认证。
- 输出必须是九节 `e03` 章节，所有 claim、source、section 双向关联一致；示例固定 `verificationStatus=not_run`。
- 输入超过 `100000` 字符、来源缺失或预算预估超过预算时，在供应商 dispatch 前拒绝。

### 响应合同和错误语义

成功必须同时满足：HTTP 2xx、`status=completed`、安全格式的 `id` 和 `model`、整数 `usage.input_tokens/output_tokens/total_tokens` 且三者相加一致、恰好一个 `output_text`、无 refusal/incomplete；响应体超过 2 MiB 或 JSON/结构/来源校验失败均不保存成功草稿。

401/403 映射 `provider_auth`；429 映射 `provider_rate_limit`；5xx 映射 `provider_unavailable`；超时、取消、网络异常保留 `providerOutcomeUnknown=true`，不能自动重复可能计费的请求。持久化只允许安全错误码、HTTP 状态、受限 request/response ID、usage 和阶段信息，禁止保存凭据、响应原文和供应商私密错误正文。

## 参数阻塞项

1. **端点与变量不一致（P0）**：现适配器固定标准 OpenAI Responses URL；本地线索使用了自定义 base URL 和另一模型变量名。请后端确认远程目标是标准 OpenAI 端点，或先提交明确的兼容端点适配。
2. **模型与价格未签收（P0）**：`OPENAI_MODEL`、最大输出 token、单次估算成本和试验总预算必须由后端/运营记录实际授权值；不能用 `gpt-5.5` 或任意模型名推断价格和可用性。
3. **真实调用证据尚无（P0）**：`server/generation/dev-check.mjs` 的 16 项均是模拟 transport；它证明失败关闭和协议校验，不证明供应商可用、输出质量或费用。
4. **供应商账单边界未闭合（P1）**：适配器的 `actualCostUsd` 仍为 `null`，声明预算不等于供应商硬上限。测试完成受控调用后，须保留 usage、request/response ID 和账单核对状态，不把估算当实际费用。

## 交给后端的部署顺序

1. 在远程受控秘密配置中写入标准字段，权限设为仅服务用户可读；不要同步本地 `.env.external-services.local`，不要把 Key 放进 rsync、PM2 参数、shell 历史或报告。
2. 先在不发起生成的情况下运行 `/api/health`，确认仅显示 `generation.configured=true` 和非敏感缺失列表；保存部署版本和配置字段摘要，不保存值。
3. 用隔离测试账户和无个人资料的固定 e03 输入排队一次任务，由测试工程师观察 `sources_validating → generating → structure_validating → draft_ready`、job/attempt/chapter provenance、usage 和响应 ID。
4. 失败时保留对应错误类别和 `providerOutcomeUnknown`；不通过重启、清库或改状态掩盖可能已计费的外部请求。
5. 真实调用后由测试工程师独立验收；在此之前，整体状态仍是“已实现适配器，真实供应商调用未验证”。

## 当前可宣称范围

- 可宣称：本地模拟协议检查通过；缺配置/超预算会 fail closed；真实调用适配器具备来源、结构、超时和敏感数据边界。
- 不可宣称：远程真实模型已接通、模型质量通过、费用已核对、教材内容已专家审核、用户获得职业认证或就业结果。

