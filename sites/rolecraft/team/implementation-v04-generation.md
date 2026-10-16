# v04 · 模型生成服务实施预检

2026-10-10，AI生成工程师；仅模型服务领域。输入：AGENTS、两工程专项交接、E09独立核对。此文件为本地实施交接，不修改门槛和历史审计。

## 实际环境与缺口

本轮只执行版本、项目内配置文件名及两项环境变量存在性检查：Node `v24.16.0`，Python `3.14.5`；`sites/rolecraft` 无 `.env*`、名称含 config 的文件或 package.json；进程 `OPENAI_API_KEY=false`、`OPENAI_MODEL=false`。未读取值、系统凭据或用户浏览器存储，未请求真实模型、未付费。只证明当前进程及项目配置未提供这些输入，不推断用户没有账号。

最快无需安装路线：Node ESM、内置 fetch、AbortController、crypto，直接 `POST https://api.openai.com/v1/responses`；服务端环境指定模型与凭据。禁止静默选择模型、用旧教材冒充生成或降级成成功的假数据。当前可实现缺配置失败和注入 transport 的逻辑检查；真正单章生成仍缺安全服务端密钥、明确模型、实际调用及预算授权，以及产品/课程冻结输入包。该条件缺失时保持 `config_missing`，不能关闭 real_generation。

## 官方接口核对

已检索并实际打开 [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses)，确认 Responses 使用 `text.format={type:"json_schema",name,schema,strict:true}`；各对象要求 `additionalProperties:false`，必需字段全部 required，可选值以 null 表达。输出从 `output[].content[]` 中的 `output_text` 提取；`refusal` 与 incomplete 单独失败处理。结构合法不等于事实、教学或行业先进性正确。未指定当前可用模型，须由配置明确。完整 API reference 抓取因内容过大失败，接口细节以成功打开的指南及其 HTTP 示例为依据。

## 内部契约提议（待三岗冻结）

`generateChapter(input, options)` 执行一次 attempt，全部 camelCase。

- input：`jobId, attemptId, leaseToken, inputHash, profileSnapshot, moduleId, competencyVersion, templateVersion, rubricVersion, sourceBundle, promptVersion, generationConfig`；课程岗位提供 chapterSchema、九节要求与资料 bundle。
- options：`signal`（AbortSignal）、`onEvent`（后端拥有顺序、租约与持久化）、`transport`（开发/QA注入，仅替身记录）、服务端配置。不接受客户端密钥、审核结论或成功状态。
- 成功返回：`chapterDraft, claims, examples, provenance{provider,modelActual,providerResponseId,providerRequestId,inputHash,outputHash,promptVersion,sourceBundleVersion}, usage, timings, checks`。这是待审草稿，后端原子保存后才将任务 succeeded，生成服务不发布/认证。
- 失败返回或抛稳定 GenerationError：`code,retryable,message,evidence`；不转发供应商原始错误/headers/密钥。`evidence` 仅安全请求ID、HTTP状态、实际 usage/阶段/耗时、是否可能已调用。
- 阶段事件建议 `sources_validating → generating → structure_validating → draft_ready`；后端分别映射 queued/running/succeeded/failed/cancelled。取消抛 `cancelled`，未知结果保留 `providerOutcomeUnknown=true`，不声称撤销外部费用。

错误类别建议：`config_missing,input_invalid,source_insufficient,budget_missing,budget_exceeded,provider_auth,provider_rate_limit,provider_unavailable,provider_refusal,provider_incomplete,provider_invalid_response,structure_invalid,source_reference_invalid,timeout,cancelled,network_error`。本次不自行规定教学阈值/预算数字；产品冻结后按配置执行。单 attempt 无自动重试，重试与幂等交后端，可避免内部无上限追加调用，但不能保证外部恰好一次。

## 实施和复验边界

授权实施目录为 `server/generation/`。后端负责 HTTP、会话、库、队列、租约、恢复；前端负责交互；课程负责教学规格与片段；内容审校负责论断支持；运营负责价格和账单核算。生成服务只做协议/结构/引用ID检查，示例固定 `not_run`。

独立QA需覆盖缺配置、取消、超时、拒绝、截断、无效结构、未知引用及敏感错误脱敏；替身只验证程序。真实复验另外要有请求ID/响应ID/实际模型、usage、产物哈希、两种学习者档案和内容复核，模型输出不能直接成为行业通过证据。领域自查：本轮资料读取、官方文档、环境存在性和接口提议已完成；实际生成、持久化联调、内容检查与独立测试均未完成。

## I06 实际实现交付

已实现 `server/generation/index.mjs`：导出 `generateChapter(input,options)`、`getGenerationReadiness(config?)`、`GenerationError` 和协议结构函数。按后端冻结 CONTRACT，`chapterSpecification` 是完整课程JSON；`sourceBundle={version,sources,claims,policy}`；profile起点为 beginner/intermediate/advanced。课程没有JSON Schema，生成岗仅为原九项教学结构建立HTTP输出协议，未改课程目标、先修、量规或审校状态。

配置必需 `OPENAI_API_KEY`、`OPENAI_MODEL`、`OPENAI_MAX_OUTPUT_TOKENS`（整数256—16000）、`ROLECRAFT_GENERATION_BUDGET_USD`、`ROLECRAFT_ESTIMATED_MAX_COST_USD`（两项正数且运行前估计不超试验预算）；可选 `OPENAI_TIMEOUT_MS`（默认60000、100—300000）。缺配置拒绝，预算缺项/估计超限分别报稳定错误。预算为运行前人工申明的预估，**不是供应商收费硬上限**；不提供默认报价或默认收费尝试，actualCostUsd保留null。

单 attempt、无自动重试；仅调用官方固定endpoint，`store:false`，受控输入最长100000字符、响应2MiB。AbortSignal覆盖请求及流读取，超时/取消保留外部结果未知；无供应商原错误正文转发。校验九节顺序/标题/非空正文、原先修及目标、五项原主张与定位、双向节关联、允许URL/来源ID、未执行示例，拒绝额外审核字段。ID和URL结构检查不能证明新正文语义正确，也不能证明引文总量或教学深度，交内容审校员逐稿复核。

成功整包为 `{chapterDraft,claims,examples,provenance,usage,timings,checks}`；后端result保存整包。草稿具有AI草稿标记和独立审校/专业/学习效果未验证状态，不继承原作者审校；provenance保存实际模型、真实request/response ID（缺request ID为null）、输入/请求/输出/schema哈希、来源短片段哈希和定位；usage是用量非账单。开发显式 `options.transport` 注入标记 `provider:'simulation'`、`simulation:true`，HTTP不暴露此选项，默认不会用模拟数据。

实际命令 `node sites/rolecraft/server/generation/dev-check.mjs`：开发自检16/16，全部显式模拟，无网络/真实模型/费用。记录 `server/generation/dev-check-results.json`；覆盖缺配置不调用、预算、成功状态分离、画像/来源拒绝、refusal/incomplete/缺节/伪引用/伪执行、脱敏、取消/超时/大小及先修防跳过。这是生成工程开发自查，独立QA未完成；真实生成门槛仍未通过，行业先进性/教学效果未验证。
