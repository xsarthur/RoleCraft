#!/usr/bin/env bash
# ============================================================
# Rolecraft 内测部署 — 服务器端初始化脚本
#
# 在腾讯云 Lighthouse 上以普通用户（如 ubuntu）执行：
#   bash deploy/setup.sh
#
# 系统级操作（apt/nginx）会自动使用 sudo，如需密码会提示
# 用户级操作（nvm/npm/pm2）在当前用户下执行
#
# 前置条件：
#   - Ubuntu 22.04 / Debian 12 / CentOS Stream 9
#   - 已有项目代码同步到 /opt/rolecraft
#   - 至少 2C4G 配置（推荐 4C8G，向量推理需要内存）
# ============================================================
set -euo pipefail

PROJECT_ROOT="/opt/rolecraft"
NODE_VERSION="v24.20.0"

echo "=========================================="
echo "  Rolecraft 内测部署初始化"
echo "  当前用户: $(whoami)"
echo "=========================================="

# ---------- 1. 系统依赖 ----------
echo "[1/6] 安装系统依赖（需要 sudo）..."
if command -v apt &>/dev/null; then
    sudo apt update -y
    sudo apt install -y curl git nginx python3 build-essential
elif command -v dnf &>/dev/null; then
    sudo dnf install -y curl git nginx python3 gcc-c++ make
else
    echo "不支持的系统，请手动安装 curl git nginx"
    exit 1
fi

# ---------- 2. Node.js 24 (NVM) ----------
echo "[2/6] 安装 Node.js ${NODE_VERSION} (NVM)..."
if [ ! -d "$HOME/.nvm" ]; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
fi
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

if ! nvm ls ${NODE_VERSION} &>/dev/null; then
    nvm install ${NODE_VERSION}
fi
nvm use ${NODE_VERSION}
nvm alias default ${NODE_VERSION}

NODE_PATH=$(which node)
echo "  Node.js: $(node -v) at ${NODE_PATH}"

# ---------- 3. PM2 ----------
echo "[3/6] 安装 PM2..."
npm install -g pm2
echo "  PM2: $(pm2 --version)"

# ---------- 4. 项目目录 ----------
echo "[4/6] 检查项目文件..."
if [ ! -d "${PROJECT_ROOT}/sites/rolecraft/server" ]; then
    echo "  [警告] ${PROJECT_ROOT}/sites/rolecraft/server 不存在"
    echo "  请先将项目代码同步到 ${PROJECT_ROOT}"
    echo "  例如：rsync -avz --exclude node_modules --exclude .runtime ./ root@SERVER_IP:${PROJECT_ROOT}/"
    echo "  或在服务器上 git clone 后软链接到 ${PROJECT_ROOT}"
    exit 1
fi

# 创建运行时数据目录
mkdir -p ${PROJECT_ROOT}/.runtime

# ---------- 5. 检索模块依赖与模型 ----------
RETRIEVAL_DIR="${PROJECT_ROOT}/sites/rolecraft/server/retrieval"
echo "[5/6] 准备内容检索模块..."

if [ -f "${RETRIEVAL_DIR}/package.json" ]; then
    echo "  安装 @huggingface/transformers..."
    cd "${RETRIEVAL_DIR}"
    npm ci --ignore-scripts --no-audit --no-fund
    cd "${PROJECT_ROOT}"
    echo "  node_modules 安装完成"
fi

if [ ! -f "${RETRIEVAL_DIR}/model-lock.json" ] && [ -f "${RETRIEVAL_DIR}/prepare-model.mjs" ]; then
    echo "  下载本地向量模型 (BGE-small-zh, ~23MB)..."
    cd "${RETRIEVAL_DIR}"
    node prepare-model.mjs || echo "  [警告] 模型下载失败，可稍后手动执行或从本地上传"
    cd "${PROJECT_ROOT}"
else
    echo "  模型已存在或不需要下载"
fi

# 验证内容索引
if [ ! -f "${RETRIEVAL_DIR}/content-v12-index.json" ]; then
    echo "  [警告] content-v12-index.json 不存在"
    echo "  如果需要从源文件重建索引，请在 ${RETRIEVAL_DIR} 下执行："
    echo "    node build-content-v12.mjs"
    echo "    node semantic.mjs  (构建向量缓存)"
else
    echo "  内容索引已就绪"
fi

# ---------- 6. 环境变量与 Nginx ----------
echo "[6/6] 配置环境变量与 Nginx..."

DEPLOY_DIR="${PROJECT_ROOT}/deploy"
if [ ! -f "${DEPLOY_DIR}/.env" ]; then
    if [ -f "${DEPLOY_DIR}/.env.example" ]; then
        cp "${DEPLOY_DIR}/.env.example" "${DEPLOY_DIR}/.env"
        echo "  已创建 ${DEPLOY_DIR}/.env，请编辑填写实际配置"
    fi
fi

if [ -f "${DEPLOY_DIR}/nginx-rolecraft.conf" ]; then
    sudo cp "${DEPLOY_DIR}/nginx-rolecraft.conf" /etc/nginx/conf.d/rolecraft.conf
    sudo nginx -t && sudo systemctl reload nginx
    echo "  Nginx 配置已部署"
fi

# ---------- 启动 ----------
echo ""
echo "=========================================="
echo "  初始化完成！下一步："
echo "=========================================="
echo ""
echo "1. 编辑环境变量："
echo "   nano ${DEPLOY_DIR}/.env"
echo ""
echo "2. 加载环境变量并启动 PM2："
echo "   set -a; source ${DEPLOY_DIR}/.env; set +a"
echo "   export NODE24_PATH=\$(which node)"
echo "   export ROLECRAFT_PROJECT_ROOT=${PROJECT_ROOT}"
echo "   pm2 start ${DEPLOY_DIR}/ecosystem.config.cjs"
echo ""
echo "3. 设置开机自启（pm2 startup 会输出一条 sudo 命令，复制执行）："
echo "   pm2 save"
echo "   pm2 startup  # 按提示复制粘贴输出的 sudo 命令并执行"
echo ""
echo "4. 验证服务："
echo "   curl http://127.0.0.1:4318/api/health"
echo "   curl http://localhost/api/health"
echo ""
echo "5. 如需 HTTPS（有域名时）："
echo "   sudo apt install -y certbot python3-certbot-nginx"
echo "   sudo certbot --nginx -d your-domain.com"
echo ""
