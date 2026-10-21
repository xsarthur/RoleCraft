# Rolecraft / 职造 部署指南 — 腾讯云 Lighthouse

> **适用场景**：在已有腾讯云 Lighthouse 实例上部署并更新 Rolecraft（职造）。公网入口已在 2026-10-21 核实。
>
> **技术栈**：Node.js 24 + 腾讯云 CloudBase（生产数据）+ 本地 ONNX 向量检索 + Nginx 反向代理 + PM2 进程管理
>
> **生产数据库是腾讯云 CloudBase（云开发），不是这台机器磁盘上的 SQLite。** 实例上若存在 `/opt/rolecraft/.runtime/rolecraft.sqlite`，那只是当前 Node 进程仍会打开的本地文件，不是生产账户库，也不能当作生产备份或回滚对象。仓库里的服务代码目前仍按 `ROLECRAFT_DATA_DIR` 打开这个本地文件；这不改变生产数据所在的位置。
>
> **最低配置要求**：2C4G（推荐 4C8G，向量模型推理需内存）；磁盘 20GB+；Ubuntu 22.04 / Debian 12 / CentOS Stream 9

---

## 目录

- [当前生产环境（2026-10-21 核实）](#当前生产环境2026-10-21-核实)
1. [部署架构](#1-部署架构)
2. [服务器准备](#2-服务器准备)
3. [同步项目代码](#3-同步项目代码)
4. [一键初始化](#4-一键初始化)
5. [手动配置（可选，了解细节）](#5-手动配置可选了解细节)
6. [启动与验证](#6-启动与验证)
7. [HTTPS 配置](#7-https-配置)
8. [日常运维](#8-日常运维)
9. [故障排查](#9-故障排查)
10. [配置文件清单](#10-配置文件清单)

---

## 当前生产环境（2026-10-21 核实）

| 项 | 事实 |
|---|---|
| 产品 | RoleCraft / 职造 |
| 公网 HTTP | `http://111.231.8.78/`。首页与 `/api/health` 均为 HTTP 200 |
| 主机 | 腾讯云 Lighthouse 轻量服务器，控制台名称 `OpenClaw(龙虾)-psIi`，公网 IP `111.231.8.78` |
| SSH | 用户 `ubuntu`（不要用 root）。控制台密钥名 `larry_key`，对应 Sheng 的 Mac 上的 `~/.ssh/id_rsa` |
| 应用目录 | `/opt/rolecraft` |
| 进程 | PM2 进程名 `rolecraft`；应用只在本机 `127.0.0.1:4318` 监听 |
| 反向代理 | Nginx 站点 `/etc/nginx/conf.d/rolecraft.conf`（来自 `deploy/nginx-rolecraft.conf`），端口 80 转发到 4318 |
| 防火墙 | 放行 22 / 80 / 443。4318 不对外 |
| 生产数据库 | **腾讯云 CloudBase**。不要把生产写成 SQLite，也不要备份 `/opt/rolecraft/.runtime` 来代替生产库 |
| HTTPS / 域名 | 尚未配置。当前是明文 HTTP + IP |
| 同机邻居 | OpenClaw 仍以自己的 node 进程监听 `0.0.0.0:37088`，不经过本 PM2。80 只给职造的 Nginx，两边不冲突。更新职造时不要改 OpenClaw |
| 职业目录 | `ROLECRAFT_CAREERS_DIR=/opt/rolecraft/sites/rolecraft/server/careers`（绝对路径）。不要写成相对的 `server/careers` |

CloudBase 的环境 ID、密钥和其他连接参数只存在于服务器 `/opt/rolecraft/deploy/.env`。本文只记录变量名占位，不记录任何密钥值。更新时保留这份已有 `.env`，不要用示例文件覆盖，也不要重新生成已有密钥。

### 已使用的更新步骤

在操作者 Mac 的项目根目录执行（不要加 `--delete-excluded`，否则会删掉服务器上被排除的 `.env`）：

```bash
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.runtime' \
  --exclude '.git' \
  --exclude 'deploy/.env' \
  --exclude 'sites/rolecraft/.env' \
  --exclude 'sites/rolecraft/.env.*' \
  ./ ubuntu@111.231.8.78:/opt/rolecraft/
```

然后 SSH 上去，保留已有 `.env`，跑初始化并只重启职造：

```bash
ssh -i ~/.ssh/id_rsa ubuntu@111.231.8.78
cd /opt/rolecraft
# setup.sh 发现已有 deploy/.env 时不会覆盖、不会重新生成密钥
bash deploy/setup.sh
# 改过 deploy/.env 时必须 --update-env。ROLECRAFT_CAREERS_DIR 必须是绝对路径。
pm2 restart rolecraft --update-env
curl -fsS http://127.0.0.1:4318/api/health
curl -fsS http://127.0.0.1/api/health
```

公网再确认：`curl -fsS http://111.231.8.78/api/health` 与浏览器打开 `http://111.231.8.78/`。

重启只针对 PM2 进程名 `rolecraft`。不要 `pm2 delete all`、不要停掉监听 `37088` 的 node 进程、不要改 OpenClaw 的端口或它的配置。`setup.sh` 只会安装/重载职造的 Nginx 站点。

---

## 1. 部署架构

```
                    ┌──────────────────────────────────────────┐
                    │  Lighthouse  OpenClaw(龙虾)-psIi         │
                    │  111.231.8.78                            │
                    │                                          │
  浏览器 ── HTTP:80 ─▶ Nginx rolecraft.conf ──▶ 127.0.0.1:4318 │
                    │                         PM2 rolecraft    │
                    │                         Node.js 24       │
                    │                           │              │
                    │                           ├─ 静态 dist/  │
                    │                           ├─ BGE ONNX    │
                    │                           └─ 生产数据 ──▶ 腾讯云 CloudBase
                    │                                          │
                    │  OpenClaw 自己的 node 进程 :37088        │
                    │  （不要在更新职造时改动）                 │
                    └──────────────────────────────────────────┘
```

**关键设计**：

| 层 | 组件 | 说明 |
|---|---|---|
| 接入层 | Nginx `rolecraft.conf` | 当前只监听 80，转发到 4318。TLS / 自定义域名尚未启用 |
| 应用层 | Node.js 24，PM2 名 `rolecraft` | 单进程，只绑定 127.0.0.1:4318 |
| 数据层 | 腾讯云 CloudBase | 生产账户与业务数据。实例上的 SQLite 文件不是生产库 |
| 进程本地文件 | `/opt/rolecraft/.runtime` | PM2 日志，以及当前代码仍会打开的本地 `rolecraft.sqlite`。排除在 rsync 之外，不作为生产数据 |
| 检索层 | BGE-small-zh ONNX | 本地 CPU 推理，无需 GPU，~24MB 模型 |
| 生成层 | 模型 API | 可选。密钥只在服务器 `.env`，不进仓库 |
| 同机进程 | OpenClaw `:37088` | 独立 node 进程，不由本 PM2 管理 |

---

## 2. 服务器准备

### 2.1 Lighthouse 防火墙

在腾讯云控制台 → Lighthouse → 防火墙，放行端口：

| 端口 | 协议 | 用途 |
|------|------|------|
| 80 | TCP | HTTP（Nginx） |
| 443 | TCP | HTTPS（Nginx + Let's Encrypt） |
| 22 | TCP | SSH（已有） |

> 端口 4318 **不需要**放行，Node.js 仅监听 127.0.0.1。

### 2.2 SSH 连接

当前生产机使用 `ubuntu`，密钥是控制台里的 `larry_key`（Sheng 的 Mac 上的 `~/.ssh/id_rsa`）。不要用 root 登录。

```bash
ssh -i ~/.ssh/id_rsa ubuntu@111.231.8.78
```

---

## 3. 同步项目代码

选择以下任一方式将代码传到服务器 `/opt/rolecraft`：

### 方式 A：rsync（推荐，排除大文件）

```bash
# 在 Mac 项目根目录执行。--delete 不会删除被 exclude 的服务器文件，
# 但不要加 --delete-excluded，否则会删掉服务器上的 deploy/.env。
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.runtime' \
  --exclude '.git' \
  --exclude 'deploy/.env' \
  --exclude 'sites/rolecraft/.env' \
  --exclude 'sites/rolecraft/.env.*' \
  ./ ubuntu@111.231.8.78:/opt/rolecraft/
```

同步之后保留服务器上已有的 `/opt/rolecraft/deploy/.env`。不要用 `.env.example` 覆盖它，也不要重新生成里面的 CloudBase 或模型密钥。

### 方式 B：Git（如果已推送到远程仓库）

```bash
# 在服务器上
git clone <你的仓库地址> /opt/rolecraft
```

> **注意**：检索模块的 `node_modules/`（376MB）和 `models/`（24MB）不在 Git 中，会在初始化脚本中重新安装/下载。向量缓存文件 `vectors-*.json` 和内容索引 `content-*-index.json` 已包含在代码中，会同步过去。

---

## 4. 一键初始化

```bash
ssh -i ~/.ssh/id_rsa ubuntu@111.231.8.78
cd /opt/rolecraft
bash deploy/setup.sh
```

脚本会自动完成：
1. 安装系统依赖（curl, git, nginx, build-essential）
2. 通过 NVM 安装 Node.js 24
3. 全局安装 PM2
4. 安装检索模块依赖 `@huggingface/transformers`
5. 下载本地向量模型 BGE-small-zh（~23MB）
6. 部署 Nginx 反向代理配置到 `/etc/nginx/conf.d/rolecraft.conf` 并重载 Nginx

已有 `deploy/.env` 时脚本只保留它。文件不存在时才会从 `.env.example` 复制一份空模板；那份模板不含 CloudBase 密钥。脚本不会停止或修改监听 `37088` 的 OpenClaw。

---

## 5. 手动配置（可选，了解细节）

如果一键脚本失败或想手动操作，按以下步骤：

### 5.1 安装 Node.js 24

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install 24
nvm alias default 24
node -v  # 应输出 v24.x
```

### 5.2 安装 PM2

```bash
npm install -g pm2
```

### 5.3 安装检索模块依赖

```bash
cd /opt/rolecraft/sites/rolecraft/server/retrieval
npm ci --ignore-scripts --no-audit --no-fund
cd /opt/rolecraft
```

### 5.4 下载向量模型

```bash
cd /opt/rolecraft/sites/rolecraft/server/retrieval
node prepare-model.mjs
# 输出 {"prepared":true,"modelId":"Xenova/bge-small-zh-v1.5",...}
cd /opt/rolecraft
```

> 此步骤从 HuggingFace 下载 ONNX 模型文件（~24MB），需要服务器能访问 huggingface.co。如果无法访问，可在本地执行 `node prepare-model.mjs` 后用 rsync 把 `models/` 目录传上去。

### 5.5 配置环境变量

```bash
# 仅当服务器上还没有 deploy/.env 时才从示例复制。
# 生产机已有该文件：不要覆盖，不要重新生成密钥，不要把内容贴进仓库或聊天。
cp deploy/.env.example deploy/.env
nano deploy/.env
```

生产账户数据走 CloudBase，连接参数写在这份服务器本地 `.env` 里。`ROLECRAFT_DATA_DIR` 只是进程本地目录，默认 `/opt/rolecraft/.runtime`，里面的 sqlite 文件不是生产库。

`ROLECRAFT_CAREERS_DIR` 在 Lighthouse 上必须是绝对路径：

```bash
ROLECRAFT_CAREERS_DIR=/opt/rolecraft/sites/rolecraft/server/careers
```

PM2 进程 `rolecraft` 的 cwd 是 `/opt/rolecraft`。相对值 `server/careers` 会指到 `/opt/rolecraft/server/careers`，那里没有职业 JSON。真正的文件在 `sites/rolecraft/server/careers/*.json`。目录读不到时，进程不会导入 `uiux-product-designer` 等职业；SQLite 里只剩已经种入的 `agent-developer`。访客引导 `POST /api/guest/bootstrap` 对 `uiux-product-designer` 返回 `career_not_found`，对应教材也不加载。

2026-10-21 晚（Asia/Shanghai）生产上就是这个配置。修正是把服务器 `deploy/.env` 改成上面的绝对路径，然后执行 `pm2 restart rolecraft --update-env`（必须带 `--update-env`，否则 PM2 继续用旧环境）。修正后 `GET /api/careers` 列出 `uiux-product-designer` 为可用，`POST /api/guest/bootstrap` 返回 201，`activeCareer` 为 `uiux-product-designer`。不要把 `.env` 内容或密钥写进仓库。

### 5.6 部署 Nginx 配置

```bash
cp deploy/nginx-rolecraft.conf /etc/nginx/conf.d/rolecraft.conf
nginx -t && systemctl reload nginx
```

---

## 6. 启动与验证

### 6.1 加载环境变量并启动

```bash
# 加载 .env
set -a; source /opt/rolecraft/deploy/.env; set +a

# 告知 PM2 Node.js 路径
export NODE24_PATH=$(which node)
export ROLECRAFT_PROJECT_ROOT=/opt/rolecraft

# 启动
pm2 start /opt/rolecraft/deploy/ecosystem.config.cjs

# 保存 + 开机自启
pm2 save
pm2 startup
```

### 6.2 验证

```bash
# 本地健康检查（直接访问 Node.js）
curl http://127.0.0.1:4318/api/health

# 经 Nginx 访问
curl http://localhost/api/health

# 从公网访问（当前没有 HTTPS，也没有自定义域名）
curl http://111.231.8.78/api/health
```

期望输出类似：
```json
{
  "productVersion": "local-mvp-0.4",
  "mode": "local-development",
  "generation": { "configured": false, "missing": [...] }
}
```

### 6.3 浏览器访问

打开 `http://111.231.8.78/`，应看到职造首页。2026-10-21 核实首页与 `/api/health` 均为 HTTP 200。

---

## 7. HTTPS 配置

截至 2026-10-21，生产入口仍是明文 HTTP + IP（`http://111.231.8.78/`），没有证书，也没有自定义域名。防火墙已放行 443，供以后启用 TLS。有域名后再做下面的步骤：

```bash
# 安装 Certbot
apt install -y certbot python3-certbot-nginx   # Ubuntu/Debian
# dnf install -y certbot python3-certbot-nginx  # CentOS

# 自动配置 TLS 证书（会修改 Nginx 配置）
certbot --nginx -d your-domain.com

# 自动续期（Certbot 会自动设置 systemd timer）
certbot renew --dry-run
```

然后编辑 `/etc/nginx/conf.d/rolecraft.conf`，将 HTTP server 块替换为 HTTPS（参考配置文件中的注释模板）。

---

## 8. 日常运维

### 8.1 常用 PM2 命令

```bash
pm2 status              # 查看进程状态
pm2 logs rolecraft      # 实时日志
pm2 restart rolecraft --update-env   # 重启并加载当前环境。改过 .env 时不要省略 --update-env
pm2 stop rolecraft      # 停止服务
pm2 monit               # 监控面板（CPU/内存）
```

### 8.2 Nginx 操作

```bash
systemctl reload nginx    # 重载配置（改完 conf 后）
systemctl restart nginx   # 重启
nginx -t                  # 检查配置语法
tail -f /var/log/nginx/access.log  # 访问日志
tail -f /var/log/nginx/error.log    # 错误日志
```

### 8.3 数据：CloudBase，不是磁盘上的 SQLite

生产账户与业务数据在腾讯云 **CloudBase**。备份、恢复和权限以 CloudBase 控制台 / 正式备份策略为准。不要把下面这个文件当成生产库：

- `/opt/rolecraft/.runtime/rolecraft.sqlite`

该路径是 rsync 排除的进程本地目录。当前仓库里的 Node 进程仍会按 `ROLECRAFT_DATA_DIR` 创建并打开它；它可能留下历史本地行，但不是 2026-10-21 核实的生产存储。不要用 `sqlite3 .backup` 或 crontab 复制它来代替 CloudBase 备份，也不要在更新职造时删除、迁移或用它覆盖 CloudBase。

CloudBase 凭据只留在服务器 `deploy/.env`。不要把环境 ID、密钥或文件内容写进仓库。

### 8.4 更新代码

按 [当前生产环境](#当前生产环境2026-10-21-核实) 的 rsync 命令从 Mac 同步。同步时排除 `node_modules`、`.runtime`、`.git`、`deploy/.env`。然后：

```bash
ssh -i ~/.ssh/id_rsa ubuntu@111.231.8.78
cd /opt/rolecraft
bash deploy/setup.sh          # 已有 .env 会保留
# 若改过 deploy/.env（尤其是 ROLECRAFT_CAREERS_DIR），必须加 --update-env
pm2 restart rolecraft --update-env   # 只重启职造，不要动 OpenClaw :37088
curl -fsS http://127.0.0.1:4318/api/health
curl -fsS http://127.0.0.1/api/health
curl -fsS http://111.231.8.78/api/health
```

检索依赖有变化时，`setup.sh` 会在 `sites/rolecraft/server/retrieval` 执行 `npm ci`。不要 `pm2 delete all`，不要重启或修改监听 37088 的 OpenClaw node 进程。

---

## 9. 故障排查

### 9.1 服务无法启动

```bash
pm2 logs rolecraft --lines 50   # 查看最近日志
```

常见原因：
- **Node 版本不对**：`node -v` 必须是 v24.x，检查 PM2 的 interpreter 路径
- **端口被占**：`lsof -i :4318` 查看占用
- **本地数据目录不存在**：`mkdir -p /opt/rolecraft/.runtime`。这只解决进程本地文件，不能代替 CloudBase
- **环境变量未加载**：确认服务器上已有 `deploy/.env` 且已 `source`。改过 `.env` 后用 `pm2 restart rolecraft --update-env`。缺少文件时不要凭空重新生成生产密钥

### 9.2 检索不可用（返回 unavailable）

```bash
# 检查模型文件
ls -la /opt/rolecraft/sites/rolecraft/server/retrieval/models/Xenova/bge-small-zh-v1.5/onnx/
# 应看到 model_int8.onnx (~23MB)

# 检查向量缓存
ls -la /opt/rolecraft/sites/rolecraft/server/retrieval/vectors-v12.json
# 应看到 ~5.8MB 文件

# 检查 node_modules
ls /opt/rolecraft/sites/rolecraft/server/retrieval/node_modules/@huggingface/transformers/
# 应存在

# 临时降级为纯规则匹配（不走向量模型）
# 编辑 .env，设置 ROLECRAFT_RETRIEVAL_MODE=concept
# pm2 restart rolecraft
```

### 9.3 Nginx 502 Bad Gateway

```bash
# Node.js 未运行
pm2 status

# 检查是否监听 4318
ss -tlnp | grep 4318

# 检查 Nginx 配置
nginx -t
cat /var/log/nginx/error.log | tail -20
```

### 9.4 访客引导 `career_not_found`，或新职业教材没有加载

2026-10-21 晚（Asia/Shanghai）生产症状：`uiux-product-designer` 的访客引导返回 `career_not_found`。当时 `deploy/.env` 里是 `ROLECRAFT_CAREERS_DIR=server/careers`。PM2 的 cwd 是 `/opt/rolecraft`，相对路径对不上 `sites/rolecraft/server/careers/*.json`，导入为空，SQLite 里只剩已种入的 `agent-developer`。

在服务器上把该变量改成绝对路径后重启：

```bash
# 只改这一项。不要打印或提交 deploy/.env。
# ROLECRAFT_CAREERS_DIR=/opt/rolecraft/sites/rolecraft/server/careers
pm2 restart rolecraft --update-env
curl -fsS http://127.0.0.1:4318/api/careers
```

修正后的核对：`/api/careers` 中 `uiux-product-designer` 为可用；`POST /api/guest/bootstrap` 返回 201，且 `activeCareer` 为 `uiux-product-designer`。不要把相对值 `server/careers` 写回去。

### 9.5 内存不足

向量模型推理与 Node.js 在 2GB 内存机器上可能紧张。同机还有 OpenClaw 的 node 进程，排查内存时不要把它停掉。解决方案：

```bash
# 1. 使用 swap
fallocate -l 2G /swapfile
chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# 2. 降级检索模式（不走向量模型）
# .env 中设置 ROLECRAFT_RETRIEVAL_MODE=concept
```

---

## 10. 配置文件清单

| 文件 | 位置 | 用途 |
|------|------|------|
| `.env.example` | `deploy/.env.example` | 环境变量模板 |
| `.env` | `deploy/.env` | 实际环境变量（不进 Git） |
| `ecosystem.config.cjs` | `deploy/ecosystem.config.cjs` | PM2 进程配置 |
| `nginx-rolecraft.conf` | `deploy/nginx-rolecraft.conf` | Nginx 反向代理配置 |
| `setup.sh` | `deploy/setup.sh` | 服务器一键初始化脚本 |

### 环境变量速查

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PORT` | `4318` | Node.js 监听端口 |
| `HOST` | `127.0.0.1` | 绑定地址（保持 127.0.0.1） |
| `PUBLIC_DEPLOYMENT` | `true` | 接受 Nginx 转发的请求 |
| `ROLECRAFT_DATA_DIR` | `/opt/rolecraft/.runtime` | 进程本地目录。当前代码会在这里打开 sqlite 文件；**生产数据在 CloudBase，不在这个目录** |
| `ROLECRAFT_CAREERS_DIR` | `/opt/rolecraft/sites/rolecraft/server/careers` | **Lighthouse 必须用这个绝对路径。** 相对值 `server/careers` 在 PM2 cwd `/opt/rolecraft` 下找不到职业 JSON，访客引导报 `career_not_found`，教材不加载。改完后 `pm2 restart rolecraft --update-env` |
| `ROLECRAFT_RETRIEVAL_MODE` | `semantic` | 检索模式（semantic / concept） |
| `OPENAI_API_KEY` | — | OpenAI 密钥（可选） |
| `OPENAI_MODEL` | — | 模型名称（可选） |
| `OPENAI_MAX_OUTPUT_TOKENS` | — | 最大输出 token（可选） |
| `ROLECRAFT_GENERATION_BUDGET_USD` | — | 生成预算（可选） |
| `ROLECRAFT_ESTIMATED_MAX_COST_USD` | — | 预估最大成本（可选） |

---

## 安全注意事项

1. **`.env` 不进 Git**：`deploy/.env`、`sites/rolecraft/.env` 与 `sites/rolecraft/.env.*` 已在 `.gitignore` 排除。文档和聊天里只写变量名，不写值
2. **进程本地目录不进 Git**：`.runtime/` 已排除。同步时也要排除它，避免覆盖服务器上的本地文件
3. **生产数据在 CloudBase**：不要把本地 sqlite 文件提交、打包或当成生产备份发布
4. **Node.js 仅监听 127.0.0.1**：公网流量必须经 Nginx 的 80 端口
5. **Nginx 限流**：内测阶段每 IP 每秒 10 请求
6. **模型与 CloudBase 密钥**：只放在服务器 `.env`。更新时保留原文件
7. **HTTPS**：尚未配置。当前是 `http://111.231.8.78/`。有域名后再启用 TLS
8. **同机 OpenClaw**：更新职造时不要改它的进程、端口 37088 或配置
