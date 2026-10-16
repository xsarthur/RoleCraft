# Rolecraft 内测部署指南 — 腾讯云 Lighthouse

> **适用场景**：在已有腾讯云 Lighthouse 实例上部署 Rolecraft 服务，供内测团队访问。
>
> **技术栈**：Node.js 24（内置 `node:sqlite`）+ SQLite + 本地 ONNX 向量检索 + Nginx 反向代理 + PM2 进程管理
>
> **最低配置要求**：2C4G（推荐 4C8G，向量模型推理需内存）；磁盘 20GB+；Ubuntu 22.04 / Debian 12 / CentOS Stream 9

---

## 目录

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

## 1. 部署架构

```
                    ┌──────────────────────────────────┐
                    │     腾讯云 Lighthouse 实例        │
                    │     (公网 IP / 域名)              │
                    │                                  │
  内测用户 ────80/443──▶ Nginx (反向代理 + 限流)       │
  (浏览器)           │      │                            │
                    │      ▼ 127.0.0.1:4318              │
                    │    Node.js 24 进程 (PM2 守护)     │
                    │      ├── HTTP API 路由             │
                    │      ├── 静态文件 (dist/)          │
                    │      ├── SQLite (.runtime/)        │
                    │      ├── 内容检索 (BGE ONNX)       │
                    │      └── 章节生成 (OpenAI API)     │
                    │                                  │
                    └──────────────────────────────────┘
```

**关键设计**：

| 层 | 组件 | 说明 |
|---|---|---|
| 接入层 | Nginx | TLS 终止、限流、静态缓存、请求转发 |
| 应用层 | Node.js 24 | 单进程，内置 HTTP + SQLite + 检索 |
| 数据层 | SQLite (WAL) | 零安装，文件级数据库，在 `.runtime/` 目录 |
| 检索层 | BGE-small-zh ONNX | 本地 CPU 推理，无需 GPU，~24MB 模型 |
| 生成层 | OpenAI API | 可选，内测阶段按需配置密钥 |

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

```bash
# 本地终端
ssh root@你的公网IP
```

---

## 3. 同步项目代码

选择以下任一方式将代码传到服务器 `/opt/rolecraft`：

### 方式 A：rsync（推荐，排除大文件）

```bash
# 在本地项目根目录执行
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.runtime' \
  --exclude '.git' \
  --exclude 'sites/rolecraft/.env' \
  ./ root@你的公网IP:/opt/rolecraft/
```

### 方式 B：Git（如果已推送到远程仓库）

```bash
# 在服务器上
git clone <你的仓库地址> /opt/rolecraft
```

> **注意**：检索模块的 `node_modules/`（376MB）和 `models/`（24MB）不在 Git 中，会在初始化脚本中重新安装/下载。向量缓存文件 `vectors-*.json` 和内容索引 `content-*-index.json` 已包含在代码中，会同步过去。

---

## 4. 一键初始化

```bash
# SSH 到服务器
ssh root@你的公网IP

# 执行初始化脚本（安装 Node 24 + PM2 + Nginx + 检索依赖 + 模型）
cd /opt/rolecraft
bash deploy/setup.sh
```

脚本会自动完成：
1. 安装系统依赖（curl, git, nginx, build-essential）
2. 通过 NVM 安装 Node.js 24
3. 全局安装 PM2
4. 安装检索模块依赖 `@huggingface/transformers`
5. 下载本地向量模型 BGE-small-zh（~23MB）
6. 部署 Nginx 反向代理配置

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
cp deploy/.env.example deploy/.env
nano deploy/.env
# 按需修改：数据目录、OpenAI 密钥等
```

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

# 从公网访问
curl http://你的公网IP/api/health
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

打开 `http://你的公网IP`，应看到 Rolecraft 学习平台首页。

---

## 7. HTTPS 配置

有域名时建议启用 HTTPS：

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
pm2 restart rolecraft   # 重启服务
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

### 8.3 SQLite 备份

```bash
# 备份（WAL checkpoint 后复制）
sqlite3 /opt/rolecraft/.runtime/rolecraft.sqlite ".backup '/opt/rolecraft/.runtime/backup-$(date +%Y%m%d).sqlite'"

# 定时备份（crontab）
echo "0 3 * * * sqlite3 /opt/rolecraft/.runtime/rolecraft.sqlite \".backup '/opt/rolecraft/.runtime/backup-\$(date +\%Y\%m\%d).sqlite'\"" | crontab -
```

### 8.4 更新代码

```bash
# 在服务器上拉取最新代码
cd /opt/rolecraft
git pull origin main   # 或 rsync 同步

# 如果检索模块依赖有变化
cd sites/rolecraft/server/retrieval && npm ci && cd /opt/rolecraft

# 重启服务
pm2 restart rolecraft
```

---

## 9. 故障排查

### 9.1 服务无法启动

```bash
pm2 logs rolecraft --lines 50   # 查看最近日志
```

常见原因：
- **Node 版本不对**：`node -v` 必须是 v24.x，检查 PM2 的 interpreter 路径
- **端口被占**：`lsof -i :4318` 查看占用
- **SQLite 目录不存在**：确保 `.runtime/` 目录已创建
- **环境变量未加载**：确认 `source deploy/.env` 已执行

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

### 9.4 内存不足

向量模型推理 + Node.js + SQLite 在 2GB 内存机器上可能紧张。解决方案：

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
| `ROLECRAFT_DATA_DIR` | `/opt/rolecraft/.runtime` | SQLite 数据目录 |
| `ROLECRAFT_RETRIEVAL_MODE` | `semantic` | 检索模式（semantic / concept） |
| `OPENAI_API_KEY` | — | OpenAI 密钥（可选） |
| `OPENAI_MODEL` | — | 模型名称（可选） |
| `OPENAI_MAX_OUTPUT_TOKENS` | — | 最大输出 token（可选） |
| `ROLECRAFT_GENERATION_BUDGET_USD` | — | 生成预算（可选） |
| `ROLECRAFT_ESTIMATED_MAX_COST_USD` | — | 预估最大成本（可选） |

---

## 安全注意事项

1. **`.env` 文件不进 Git**：已在 `.gitignore` 中排除
2. **SQLite 数据不进 Git**：`.runtime/` 已排除
3. **Node.js 仅监听 127.0.0.1**：公网流量必须经 Nginx
4. **Nginx 限流**：内测阶段每 IP 每秒 10 请求
5. **OpenAI 密钥**：仅在需要生成功能时填写，不填则生成功能不可用但不影响其余服务
6. **HTTPS**：有域名时务必启用，内测阶段可用 HTTP 但不应传输敏感数据
