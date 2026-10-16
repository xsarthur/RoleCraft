/**
 * PM2 进程管理配置 — Rolecraft 内测部署
 *
 * 使用方式（在项目根目录）：
 *   pm2 start deploy/ecosystem.config.cjs
 *   pm2 save && pm2 startup   # 开机自启
 *
 * 环境变量从 deploy/.env 加载（通过 --env-file 或在 shell 中 source）
 */
const path = require('path');

const PROJECT_ROOT = process.env.ROLECRAFT_PROJECT_ROOT || '/opt/rolecraft';
const ENV_FILE = path.join(__dirname, '.env');

module.exports = {
  apps: [{
    name: 'rolecraft',
    // 使用启动器而非直接指向 server/index.mjs
    // PM2 fork 模式会修改 process.argv[1]，导致服务器的启动检查不匹配
    // 启动器 spawn 子进程，子进程的 process.argv[1] 正确指向脚本路径
    script: path.join(PROJECT_ROOT, 'scripts', 'start-local.mjs'),
    cwd: PROJECT_ROOT,
    interpreter: process.env.NODE24_PATH || 'node',

    // 环境变量：PM2 不原生支持 .env 文件，通过 env 传入或 shell source
    env: {
      NODE_ENV: 'production',
      PORT: process.env.PORT || 4318,
      HOST: process.env.HOST || '127.0.0.1',
      PUBLIC_DEPLOYMENT: process.env.PUBLIC_DEPLOYMENT || 'true',
      ROLECRAFT_DATA_DIR: process.env.ROLECRAFT_DATA_DIR || path.join(PROJECT_ROOT, '.runtime'),
      ROLECRAFT_CAREERS_DIR: process.env.ROLECRAFT_CAREERS_DIR || 'server/careers',
      ROLECRAFT_RETRIEVAL_MODE: process.env.ROLECRAFT_RETRIEVAL_MODE || 'semantic',
      // OpenAI 配置（可选）
      OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
      OPENAI_MODEL: process.env.OPENAI_MODEL || '',
      OPENAI_MAX_OUTPUT_TOKENS: process.env.OPENAI_MAX_OUTPUT_TOKENS || '',
      ROLECRAFT_GENERATION_BUDGET_USD: process.env.ROLECRAFT_GENERATION_BUDGET_USD || '',
      ROLECRAFT_ESTIMATED_MAX_COST_USD: process.env.ROLECRAFT_ESTIMATED_MAX_COST_USD || '',
      OPENAI_TIMEOUT_MS: process.env.OPENAI_TIMEOUT_MS || '',
    },

    // 实例数：单实例，因 SQLite + 内存态检索不支持多进程并发写
    instances: 1,
    exec_mode: 'fork',

    // 重启策略
    max_restarts: 10,
    restart_delay: 3000,
    min_uptime: '10s',
    max_memory_restart: '512M',

    // 日志
    error_file: path.join(PROJECT_ROOT, '.runtime', 'pm2-error.log'),
    out_file: path.join(PROJECT_ROOT, '.runtime', 'pm2-out.log'),
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,

    // 优雅关闭：给 SQLite WAL checkpoint 和检索模型释放 10 秒
    kill_timeout: 10000,
    listen_timeout: 8000,
  }],
};
