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

## 门禁主动接力（2026-10-23）

用户明确：岗位验收通过后必须立刻主动交给下一门岗，不得等用户再追问「发给 XX 了吗」。设计签发 Pass → 立即交测试工程师做合入前功能验证；有问题走修正流程；用户只验收各部门已通过内容（优先决策板图片，少长文）。设计 Pass ≠ 可合入；合入前必须设计门与 QA 门都过。触发背景：PR #12 设计门通过后未主动交 QA，需用户再推一步才派测。

接力协调归项目经理。设计、QA、工程执行并签发本领域结论，结果报给项目经理。项目经理立刻派下一门（例如设计 Pass 后派 core-qa-engineer），跟踪设计门与 QA 门都过才可合入，缺陷交给修正责任人，只把各部门已通过的决策板交给 Sheng。

岗位常驻流程见 `sites/rolecraft/team/GATE_HANDOFF_RULE.md`。
