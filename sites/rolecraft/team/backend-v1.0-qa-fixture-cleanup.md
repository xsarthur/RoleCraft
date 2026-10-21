# Rolecraft 1.0 远程 QA fixture 清理记录

> **2026-10-21 更正：** 本记录操作的 `/opt/rolecraft/.runtime/rolecraft.sqlite` 是当时实例上的进程本地文件，不是生产数据库。生产数据在腾讯云 CloudBase。现行说明见 `deploy/deploy-guide.md`。



- **责任岗位**：后端数据工程师
- **执行时间**：2026-10-16 04:17–04:18（Asia/Shanghai；UTC 2026-10-15 20:17–20:18）
- **远程单环境**：`ubuntu@111.231.8.78:/opt/rolecraft`
- **数据库**：`/opt/rolecraft/.runtime/rolecraft.sqlite`
- **范围**：只清理本轮 P0 远程 QA 建立的 `example.invalid` 隔离账户；不修改代码、教材、客户端、产品报告或正式账户。
- **执行结论**：`executed_and_verified`

## 定位与安全边界

远程只读统计发现 `@example.invalid` 账户共 2 个。目标账户由同一用户同时拥有且仅拥有 `artifact_version=qa-p0-v1`、`qa-p0-v2` 两条 P01 提交唯一锁定；该账户创建时间为 `2026-10-15T20:04:37.126Z`，仅记录匿名化的本地前缀哈希 `cd42fff57389`。旧账户的提交版本为 `acceptance-revision-01`，不符合目标条件，保留。

删除前检查到目标提交没有其他用户的 review 引用或版本链子节点（均为 0）。未读取、记录或输出密码、会话 token、CSRF 值、完整用户 ID 或私有正文。

## 清理前后计数

| 关联表 | 清理前 | 删除数 | 清理后 |
|---|---:|---:|---:|
| `sessions` | 2 | 2 | 0 |
| `profiles` | 0 | 0 | 0 |
| `user_careers` | 1 | 1 | 0 |
| `user_preferences` | 1 | 1 | 0 |
| `user_favorites` | 0 | 0 | 0 |
| `user_progress` | 0 | 0 | 0 |
| `user_recent` | 0 | 0 | 0 |
| `user_notes` | 0 | 0 | 0 |
| `jobs` | 0 | 0 | 0 |
| `attempts` | 0 | 0 | 0 |
| `events` | 0 | 0 | 0 |
| `chapters` | 0 | 0 | 0 |
| `submissions` | 2 | 2 | 0 |
| `reviews` | 0 | 0 | 0 |
| `users` | 1 | 1 | 0 |

清理使用 `BEGIN IMMEDIATE` 事务并启用外键检查，先删除 reviews、P01 提交链（v2 后 v1）、任务关联表、会话、账户学习记录、职业关联，最后删除用户。事务提交后按目标用户 ID 重查，所有关联计数均为 0。

## 保留数据核对

旧的 `example.invalid` 账户（创建于 `2026-10-15T19:19:27.401Z`，匿名化前缀哈希 `fd292cd82757`）前后计数一致：1 session、1 user_careers、1 user_progress、1 submission（`acceptance-revision-01`）和 1 review。远程数据库中的 `example.invalid` 用户数由 2 降为 1，总用户数为 1。

## 回滚依据

清理前使用 SQLite `VACUUM INTO` 建立一致性备份：

- `/opt/rolecraft/.runtime/backups/20261015T201748Z-qa-fixture-cleanup/rolecraft.sqlite`
- 大小：180224 bytes
- SHA-256：`9a705ad3546a69e59101a39956f3d133a1398eb73df78afac0aba978f870e6ee`

如确需回滚，须由项目经理协调后端岗位停止写入、校验该备份哈希并按服务端恢复流程替换数据库；本记录不自动执行回滚。

## 清理后服务复核

- SQLite `PRAGMA integrity_check`：`ok`
- 远程本机 `GET http://127.0.0.1:4318/api/health`：HTTP 200
- 公网 `GET http://111.231.8.78/api/health`：HTTP 200
- release：`rolecraft-1.0`
- Node：`v24.20.0`
- PM2：`rolecraft` online
- 生成服务仍未配置供应商密钥，`providerCalled=false`；本次清理没有调用模型或外部付费服务

本记录只证明本轮 QA fixture 已按目标范围清理并完成数据库/服务复核，不改变产品、UI/UX 或独立验收报告的结论。
