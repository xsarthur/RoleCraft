# 后端数据工程师：1.0 真实模型部署记录

> **2026-10-21 更正：** 回滚段里的 `.runtime/rolecraft.sqlite` 是实例上的进程本地文件。生产数据库是腾讯云 CloudBase，不能靠恢复该 sqlite 文件回滚生产数据。现行主机与更新步骤见 `deploy/deploy-guide.md`。



版本：`backend-v1.0-real-model-deployment-20261016`
角色：后端数据工程师
目标：按用户授权把真实模型配置部署到唯一远程开发环境，并交由 AI 生成工程师核对参数、测试工程师验收真实调用。
状态：`deployed_provider_unavailable_pending_endpoint_review`

## 已完成

- 已只读核对本地环境变量和本地安全文件；未输出、复制或写入任何 API Key 值。
- 本地 `sites/rolecraft/.env.external-services.local` 存在非空凭据、非默认 `OPENAI_BASE_URL`、`GENERATE_MODEL` 及嵌入配置字段。该文件没有被原样同步。
- AI 生成工程师随后完成最小适配：生成适配器现在可读取并校验 HTTPS `OPENAI_BASE_URL`，并兼容 `GENERATE_MODEL`；离线合同自检为 19/19。该适配仍未证明目标供应商支持 Responses API 与严格 JSON Schema，且尚未部署到远程。
- 已只读核对远程 `ubuntu@111.231.8.78:/opt/rolecraft`：服务用户为 `ubuntu`，Node 24.20.0，当前服务直接由 Node 进程监听 `127.0.0.1:4318`；PM2 命令未在非登录 shell 的 PATH 中发现，未执行重启。
- 已完成部署前可回滚备份：
  - `/opt/rolecraft/.runtime/backups/real-model-predeploy-20261016T005124Z/rolecraft.sqlite`
  - `/opt/rolecraft/.runtime/backups/real-model-predeploy-20261016T005124Z/deploy.env`
  - `/opt/rolecraft/.runtime/backups/real-model-predeploy-20261016T005124Z/ecosystem.config.cjs`
  - 备份校验文件：同目录 `SHA256SUMS`
- AI 适配器与后端快照文件已用唯一目标文件名同步，远程哈希分别与本地一致：生成适配器 `9797e8053769a8bfa1f4ba6203933106fa28be649e44fedee323948f4a95477d`，后端 `23fe1071d490e8042cd408ad1b3b7bd445529ac432ab5b6327f5d8047de4a6a7`。
- 远程环境已通过 SSH 受控管道写入已有凭据、端点和模型字段，以及已签收的保守参数：`OPENAI_MAX_OUTPUT_TOKENS=1200`、`ROLECRAFT_ESTIMATED_MAX_COST_USD=0.05`、`ROLECRAFT_GENERATION_BUDGET_USD=1`、`OPENAI_TIMEOUT_MS=30000`。环境文件权限为 `600`，没有输出任何密钥值。
- PM2 使用 Node 24 的绝对 PATH 执行 `restart rolecraft --update-env`，进程在线，最新 PID 为 `2817513`。
- 重启后远程 `http://127.0.0.1:4318/api/health` 返回 `generation_configured=true`、缺失字段数量为 0；尚未发起生成请求，`providerCalled` 尚未产生真实值。
- 公网 `http://111.231.8.78/api/health` 同样返回 `generation.configured=true`，缺失字段数量为 0；只读检查未发起生成请求。
- 测试工程师随后使用隔离账户和固定 e03 输入完成唯一一次真实调用：`simulation=false`、`providerCalled=true`，事件到 `generating` 后供应商返回 HTTP 503，应用记录 `provider_unavailable` 和 `providerOutcomeUnknown=true`；未保存成功草稿，也未执行 retry。详见 `qa-v1.0-real-model-acceptance.md/.json`。

## 当前剩余门槛

AI 生成工程师先发现端点/变量不一致，随后交付最小适配并完成 19/19 离线合同自检。当前剩余门槛为：

1. 真实请求已发出，但目标端点返回 HTTP 503；Responses API 与严格 JSON Schema 的成功能力尚未得到证据。
2. 本次请求没有 usage、provider request/response ID，外部结果未知；不得立即 retry，先核对供应商状态和协议。
3. 供应商实际账单成本尚未可核对；`0.05 USD` 是调用前估算，`1 USD` 是应用侧声明预算，不是供应商硬性费用上限。

因此本次已写入远程生成变量并重启服务，health 配置状态已通过；真实调用已由测试工程师执行但供应商返回 503，系统保留未知外部结果并阻止成功草稿，未执行 retry。PM2 `save` 未执行，因为自动审批拒绝把可能含密钥的进程环境复制到 `dump.pm2`；服务当前仍由受控环境文件加载。

## 需要的交接

- 后端数据工程师：保留本次配置和回滚路径；开机持久化需要另行采用不复制密钥的启动方案。
- AI 生成工程师：核对模型 ID、Responses 请求合同、结构化输出支持、输入/输出限制和参数映射；不得只改变量名掩盖端点不兼容。
- 测试工程师：保留本次唯一尝试；待 AI/后端核对 503 与端点协议、并取得新的明确授权后，才可用新的幂等键发起一次 retry。

## 回滚

本次未产生远程应用变更。若回滚当时的应用配置，先停止 PM2 进程 `rolecraft`，再恢复备份里的 `deploy/.env` 与 `ecosystem.config.cjs`，并重新检查 `/api/health`。同目录的 `rolecraft.sqlite` 是进程本地文件，不是生产库；生产数据在 CloudBase，不要靠恢复该文件回滚账户数据，也不要覆盖历史验收记录。

本记录不包含密钥、私有端点值、模型私有响应或请求正文。
