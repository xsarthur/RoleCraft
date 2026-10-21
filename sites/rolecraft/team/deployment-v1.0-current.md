# Rolecraft 1.0 远程单环境部署记录

> **2026-10-21 更正：** 生产账户与业务数据在腾讯云 **CloudBase**。下文出现的 `/opt/rolecraft/.runtime/rolecraft.sqlite` 是当时实例上的进程本地文件，不是生产数据库。不要按本文的 sqlite 路径备份或回滚生产数据。现行主机、SSH、Nginx、PM2、OpenClaw 共存和更新步骤见 `deploy/deploy-guide.md`。本文件保留 2026-10-15 的部署经过，不改写当时的哈希和备份路径。



更新时间：2026-10-15T19:10:55Z（服务器 UTC）  
部署目标：`ubuntu@111.231.8.78:/opt/rolecraft`  
环境策略：按用户授权，远程服务器作为唯一开发环境；代码、接口和数据库更新直接部署到此环境。

## 已完成

- 通过文档支持的 `ubuntu` 账号 SSH 连接成功。服务器为 Ubuntu，Node.js `v24.20.0`，Nginx `1.24.0`，PM2 `7.0.4`；PM2 单实例 `rolecraft` 在线，监听 `127.0.0.1:4318`，Nginx 监听 `0.0.0.0:80`。
- 部署前已停止旧应用并保存回滚点：
  - SQLite：`/opt/rolecraft/.runtime/backups/20261015T190023Z/rolecraft.sqlite`，SHA-256 `8c594babbf87f3dcf59ded346a32b9f7a4f6ee508c4081dfb18af7df7ad7dd89`。
  - 环境文件副本：同目录 `deploy.env`，未在报告中输出内容。
  - 代码包：同目录 `app-before.tar.gz`，SHA-256 `258b85deee343bf0f110a7f151ffc3e6e500912e6ad51a1e4d8bf22c2a601e94`。
- 同步了当前 `sites/rolecraft` 应用、客户端、服务端、检索索引和 `deploy`/启动脚本；保留远程 `.runtime`、`deploy/.env`、检索 `node_modules`、模型目录、历史 `team/docs/textbooks` 内容。检索严格绑定的 `textbooks/v12` 当前源随后同步，以修复旧 `c01-selection.md` 与索引不一致。
- 远程补齐本地已有的 BGE ONNX 文件（不联网、不调用付费模型）：`model_int8.onnx` SHA-256 `b9837c19ce154ff0726d398ee77abbc03a7faf0476c6f93016c84e531be7ebb5`。
- 已用当前 PM2 进程清单执行 `pm2 save`，重启后仍使用 `/opt/rolecraft/scripts/start-local.mjs` 和 Node 24。

## 验证证据

- 本机 `GET /api/health`：HTTP 200；`releaseVersion=rolecraft-1.0`，`contentRetrieval.available=true`，`contentVersion=textbook-v12`，`corpusHash=c56def0f8eaf17207c10bc794a771650b0c9f52207815ce11aa7a7a00f29f757`，30 个单元，`localSemanticPrepared=true`，`providerCalled=false`。生成配置仍明确未配置。
- 公网 `http://111.231.8.78/api/health`：HTTP 200，返回同一检索版本与语料哈希。
- 公网 `GET /api/content/catalog`：HTTP 200，93470 字节；公网 `POST /api/content/recommend`（Agent ReAct 查询）：HTTP 200，`status=recommended`、`engineMode=local_semantic_retrieval`、`providerCalled=false`。
- 公网 `POST /api/agent/learning/query`（带当前冻结的 `workbenchVersion=local-workbench-0.11` 与 `agentVersion=agent-system-v0.12`）：HTTP 200，`status=recommended`，返回教材小节、原文摘录、版本和来源哈希。
- 远程 `node self-check-v12.mjs`：12 个固定查询全部 `pass`，包括 ReAct、planning、replanning、recovery、多意图、否定、前端 React 无匹配、歧义澄清和 no-match。
- 核心同步校验：`server/index.mjs` SHA-256 `7011f6eb4bae4f9082b7a1c3506a83cb33f410bf88354691052b7c71a2ba4ef0`；`server/retrieval/index.mjs` SHA-256 `cda0aae5d8ee6bee8eacba9ae5402392a8fc45e3cff0f36d5551ec2932e976c2`；`dist/index.html` SHA-256 `de8647133091a34e767816c02cc47d2d792d88ff41b5e851a1b6002bf2dc817b`。

## 当前限制与下一步

- 这是 2026-10-15 的单一远程环境记录。生产数据现已明确为腾讯云 CloudBase；更新前要保留的是服务器 `deploy/.env` 与 CloudBase 数据，不是磁盘上的 SQLite。代码回滚仍使用当时的 `app-before.tar.gz`。
- 生成服务没有配置供应商密钥、模型和预算，因此健康接口会明确标记 generation 未配置；本轮没有付费调用，也没有上传或广泛发布。
- 本记录是部署与 TCP/API 冒烟证据，不替代测试工程师的独立浏览器验收、真实用户理解、真人专家审核或完整职业/行业目标判断。当前完整产品仍需按既有门槛独立复核。
- 部署过程中曾出现两次可恢复启动阻力：模型目录原先缺少 ONNX 文件，以及远程 `textbooks/v12/c01-selection.md` 与新索引不一致；补齐本地模型并同步当前 v12 源后已复验通过。PM2 当前重启计数为 3，状态为 online。

## 回滚点

2026-10-15 的代码包仍在 `/opt/rolecraft/.runtime/backups/20261015T190023Z/app-before.tar.gz`，可用 `tar -xzf app-before.tar.gz -C /opt/rolecraft` 恢复当时的应用文件，再以 Node 24 执行 `pm2 restart rolecraft` 并重跑 health/catalog/recommend。同目录的 `rolecraft.sqlite` 只是当时的进程本地文件。生产数据在 CloudBase，不要用这个 sqlite 备份恢复或覆盖生产账户数据。
