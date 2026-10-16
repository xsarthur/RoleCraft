# MEMORY.md

## 服务器信息

- 腾讯云 Lighthouse：IP 111.231.8.78，Ubuntu，默认用户 `ubuntu`（非 root）
- 项目部署路径：`/opt/rolecraft`
- Node.js 通过 NVM 安装：`/home/ubuntu/.nvm/versions/node/v24.20.0/bin/node`
- PM2 进程名：`rolecraft`，通过 `scripts/start-local.mjs` 启动（非直接指向 server/index.mjs）

## 部署注意事项

- PM2 fork 模式会修改 `process.argv[1]`，导致 `server/index.mjs` 第 487 行的启动检查不匹配——必须用 `scripts/start-local.mjs` 启动器绕过
- 系统命令需 sudo（apt/nginx），用户级命令（nvm/npm/pm2）不需 sudo
- `deploy/setup.sh` 已适配非 root 用户

## 参考答案质量标准（2026-10-14）

用户明确要求多角度细致回答作为长期质量底线，适用于所有职业的教材编辑和参考答案。详见 AGENTS.md 和 `sites/rolecraft/team/ANSWER_QUALITY_STANDARD.md`。
