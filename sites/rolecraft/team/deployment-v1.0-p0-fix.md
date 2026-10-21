# Rolecraft 1.0 P0 静态资源部署记录

> **2026-10-21 更正：** 下文的 `rolecraft.sqlite` 备份是实例上的进程本地文件。生产数据库是腾讯云 CloudBase，不是该文件。不要用它恢复生产账户数据。现行说明见 `deploy/deploy-guide.md`。



## 结果

- 状态：`deployed_verified`
- 时间：2026-10-15T19:55:33Z（部署窗口）
- 单环境：`ubuntu@111.231.8.78:/opt/rolecraft`
- 服务：Node.js 24.20.0，PM2 单实例 `rolecraft`，Nginx 公网 80
- 变更范围：只更新 `dist/auth-career-v15.css` 与 `dist/learning-v13-data.js`
- 未更新：SQLite、WAL/SHM、`.env`、Node 依赖、模型、教材、后端接口

## 部署前基线与备份

部署前读取到接口 `200`，`releaseVersion=rolecraft-1.0`，PM2 进程在线。

为保证 SQLite 一致性，先通过 PM2 停止单实例并等待 `4318` 端口释放，再复制数据库与归档旧静态文件。停服后 SQLite 已完成 WAL 回收，因此备份目录中只有主库；停服前存在的 WAL/SHM 没有继续存在，未被遗漏或覆盖。

- 备份目录：`/opt/rolecraft/.runtime/backups/20261015T195300Z`
- 数据库备份：`rolecraft.sqlite`
- 数据库 SHA256：`5626f0392a0a55cbbfe77529821d830a62c557c687901daa6913aab5df26505d`
- 旧静态文件回滚包：`static-p0-before.tar.gz`
- 回滚包 SHA256：`e24f3523c855255ece1aefc91806e7d4ffdac92139c85347c7dde5946be2ad7a`
- 旧 CSS SHA256：`7ee6e33b9cc7c1406b26143475b85c45d8a2cb67c7403bee616bf13e7bfb119e`
- 旧学习数据 SHA256：`48c20be31392254e0a39c19cacd5054b35d9bd65708f7b48ac8eb22f7e16dccb`

## 已部署版本

- `auth-career-v15.css` SHA256：`1d5c799bb641056b051bf4a522d960f6863fee8ab6686e55fbd42f297f0fb13a`
- `learning-v13-data.js` SHA256：`6d27dabc1cedc15236de846c44dae8f66c4f82b77c2ede543941d3589e8772a4`
- 同步方式：rsync 仅传上述两个文件，未使用删除模式
- 重启方式：PM2 `restart rolecraft --update-env`

## 验证证据

1. 本地 Node 端口 `http://127.0.0.1:4318/api/health`：HTTP 200；`releaseVersion=rolecraft-1.0`；Node `v24.20.0`；内容检索可用；`providerCalled=false`。
2. 远程静态路由：`/auth-career-v15.css` 和 `/learning-v13-data.js` 均 HTTP 200，Content-Type 分别为 CSS/JavaScript，响应哈希与部署哈希一致；响应头包含 `X-Rolecraft-Release-Version: rolecraft-1.0`。
3. 公网 Nginx：`http://111.231.8.78/api/health`、`/auth-career-v15.css`、`/learning-v13-data.js` 均 HTTP 200。
4. 远程 Node VM 只读加载 `learning-v13-data.js`：`RolecraftLearningV13` 已加载，`questions.length=114`、`knowledgePoints.length=240`，且元数据计数同为 114/240；`corpusVersion=textbook-v12`。
5. PM2 重启后 `rolecraft` 状态为 `online`，单实例 PID 2740356。

## 回滚

如 P0 资源需要回退：停止 PM2 进程 `rolecraft`，从上述 `static-p0-before.tar.gz` 解出两个文件到 `/opt/rolecraft`，按服务启动配置重新启动该进程，并复验 health 与两个静态资源。同次备份里的 `rolecraft.sqlite` 是进程本地文件，不是 CloudBase 生产库；静态回滚不要触碰它，也不要用它恢复生产账户数据。

## 限制

本记录只证明远程部署、资源可下载、版本头和学习数据结构加载成功；不等同于 UI/UX 视觉验收、产品最终验收、独立浏览器交互验收或真实用户效果结论。生成服务仍未配置付费模型密钥，本次没有模型调用。
