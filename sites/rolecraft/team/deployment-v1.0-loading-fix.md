# 1.0 加载交互修复部署记录

> **2026-10-21 更正：** 下文备份的 `rolecraft.sqlite` 是实例上的进程本地文件。生产数据库是腾讯云 CloudBase，不是该文件。现行说明见 `deploy/deploy-guide.md`。



- 部署时间（UTC）：2026-10-16 00:20:58
- 目标环境：`ubuntu@111.231.8.78:/opt/rolecraft`
- 环境策略：远程服务器作为当前唯一开发环境；本次只更新客户端加载交互资源。
- 授权：用户已明确要求请求等待时增加加载交互，并授权数据库/接口服务更新直接部署到远程环境。本次未修改数据库、接口、教材、题库或模型。

## 同步范围

只同步以下两个文件：

| 文件 | 本地 SHA-256 | 远程文件 SHA-256 | 结果 |
|---|---|---|---|
| `sites/rolecraft/dist/learning-workbench.js` | `9aebdadaab45e47f6f6dcd4d8fa2168f167bdb802ed22e022b087abd039a74d3` | `9aebdadaab45e47f6f6dcd4d8fa2168f167bdb802ed22e022b087abd039a74d3` | 一致 |
| `sites/rolecraft/dist/learning-workbench.css` | `1a53e9fc115513b04404fa9656b626c9945efc483e36f5da30beb36e65b63c52` | `1a53e9fc115513b04404fa9656b626c9945efc483e36f5da30beb36e65b63c52` | 一致 |

JS 远程文件已核对包含 `lw-query-submit-spinner`、`disabled`、`aria-busy`，对应请求期间旋转指示、提交按钮禁用和表单忙碌状态。

## 备份与替换

替换前通过 PM2 短暂停服，并将数据库及旧静态资源保存至：

`/opt/rolecraft/.runtime/backups/20261016T002058Z-loading-fix/`

- 备份数据库：`rolecraft.sqlite`，180224 bytes，SHA-256 `bfb96708b34b3b44e8703479db7854d05f1ebd5c586dffade49b78fbd68d79f6`。
- 停服备份时 SQLite 已完成 WAL 检查点，备份目录中没有待复制的 `rolecraft.sqlite-wal` 或 `rolecraft.sqlite-shm`；服务重启后运行目录按 WAL 模式重新生成这两个文件。
- 旧 JS SHA-256：`2086c9ae26ee158e1bf4c89a296513b24b9173fb65a098bf03f9cd27c065668e`。
- 旧 CSS SHA-256：`b35eaef44e73a56e2b1df0985fdfe8c960393ca086ffecaeba96b51bf798336c`。
- 备份目录保留 `before-sha256.txt`、`after-sha256.txt` 与 `manifest.txt`，可用于回滚和审计。

文件使用临时路径安装后原子替换，未覆盖 `.env`、数据库、后端、教材、题库 data、检索模型或 `node_modules`。

## 重启与公网验证

- PM2 进程：`rolecraft`，Node.js `v24.20.0`，单实例，重启后 PID `2803971`，已执行 `pm2 save`。
- `/api/health`：HTTP 200。
- `/learning-workbench.js`：HTTP 200，公网下载 SHA 与本地一致。
- `/learning-workbench.css`：HTTP 200，公网下载 SHA 与本地一致。
- 健康响应仍报告 `releaseVersion: rolecraft-1.0`、`contentRetrieval.available: true`、`providerCalled: false`；本次未调用付费模型。

本记录证明远程文件部署、进程恢复和静态资源传输正确；UI/UX 的独立浏览器键盘、读屏、缩放及真实用户理解验收仍由测试岗位按独立报告负责，不能由本次服务器健康检查替代。
