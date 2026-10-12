# 后端数据工程师 · local-mvp-0.4 实施交付

2026-10-10；唯一领域账户、持久任务和服务端数据。依据 AGENTS、implementation-v04-product、generation-curriculum-v04 与模型服务交接。仅写 server（不含 generation）、scripts/start-local.mjs、.gitignore 和本报告。没有前端、教学、模型推理、独立测试或发布修改。

## 已实现与交接

Node 24.16.0 内置 http/crypto/node:sqlite，零 npm 依赖，bind 127.0.0.1。启动 `node scripts/start-local.mjs`，默认端口4318，Ctrl-C停止；默认 `.runtime/rolecraft.sqlite`，可用 ROLECRAFT_DATA_DIR 指定隔离测试目录。该目录及项目 .env 被 Git 忽略，密钥只由模型岗位从环境读取，没有种子账号或默认模型/预算。

CONTRACT.md 已冻结 camelCase HTTP。两个真实研发账户可以注册/登录，服务端校验会话，密码 scrypt、token 哈希、24h到期、退出撤销、CSRF token、同源/Host校验；资源归属、跨账户章节/任务/作品/复盘关联和导出均校验。profile canonical 起点 beginner/intermediate/advanced，对旧浏览器三层不读取、不迁移。认证未配置生产身份核验/TLS/找回；仅本机研发用途。

profile写入版本；generation job冻结课程包、允许来源、档案、模板、量规、提示版本、模型及声明预算参数，无密钥。幂等键按账户唯一，输入冲突409；配置缺项直接409且无假成功任务。单 worker事务领取、递增 lease token、心跳；输出+版本+成功事件单事务，失效/取消worker不能提交。取消保留外部结果可能未知；运行中丢失租约转failed/interrupted，不自动重复潜在付费请求；queued重启继续。显式重试创建新linked job，旧job/attempt/chapter保留。SQLite非供应商恰好一次保证。

章节只读、reviewStatus固定未审/示例未运行。作品和本次复盘允许缺证保存；链接不抓取、代码不执行，evidenceStatus仅incomplete/self_reported。用户不能提交type/reviewer/verdict独立通过字段，自评固定self_assessment，专业/独立审核固定unreviewed。导出不含密码/session/密钥。静态服务只读dist，路径实路径限制、禁止外部URL fetch、请求128KiB/产物1MiB限制。

## 实际开发自查（不是独立验收）

server/index.mjs 和 scripts/start-local.mjs语法检查完成。`node server/dev-check.mjs` 从项目相应路径执行：**37/37**，真实临时SQLite和127.0.0.1 HTTP；双研发账户、未认证/CSRF/跨来源/自报身份拒绝、跨账户读取/关联/导出拒绝、partial作品、自评不能认证、非法URL/超大请求、重启后档案/作品/复盘/会话保留、退出撤销。开发夹具明确 synthetic：queued取消、重复取消、expired running fenced与unknown记录、queued调用缺配置失败且无章节、显式retry配置阻止、attempt及顺序事件保留。未调用供应商、未读取用户数据、没有模拟成功产物。

首次本地bind因沙盒EPERM未执行，自查命令经自动审批允许本地loopback临时服务后实际运行；这不是线上发布权限。独立QA须另用临时DB复验HTTP、异常输入、幂等、真正kill/restart、模拟成功原子提交及stale lease。当前真实模型配置缺项，真实生成未执行；成功事务真实模型路径尚无真实调用证据，不能凭开发夹具关闭real_generation。

## 当前缺口与责任

缺真实配置/模型/预算和供应商证据交AI生成工程师及用户授权输入；可运行教材/独立内容检查交课程/教材/审校；生产认证、备份恢复、运行监控仍由后端岗后续实现。本地功能不关闭完整产品reliable_delivery。真实用户、行业比较、学习者实训、成本账单仍交各专项。八门槛、历史审计保持不变；总体完整标准未达到。

冻结源码SHA256：
- server/index.mjs：`f111fa0f17389a0b586d34f75748b844fa042f9ab88985189c77a30563daf0d8`。
- server/CONTRACT.md：`feb23aef7f3de4f86f40db52a72356197f204e8fdfb3f7542ddebfd05e8de33f`。
- server/dev-check.mjs：`e23d015a3a28e07f5822a76fd7019f258451b3f1a31fad547f408e1b878e5bcd`。
- scripts/start-local.mjs：`42c47994401f1fef3a67ad3ac130746e4270f8f56348ccd8bfb4180237c6066f`。

交接：前端只消费CONTRACT和真实任务/草稿/自评，不接触供应商凭据；模型服务单attempt返回result整包；QA独立验收；PM汇总本轮完整标准判定。

## 独立QA交接后真实启动记录

项目经理通知独立QA已复验后端临时HTTP/SQLite及真SIGKILL重启15/15，本岗位未代替独立QA。按项目经理安排，2026-10-10从**工作区根目录**执行 `node scripts/start-local.mjs`，不是从sites/rolecraft执行；启动前未种入测试账号、未删除/重置任何数据库或记录。默认数据库由正常启动创建/恢复。源码维持上述冻结哈希。

本地服务已运行：`http://127.0.0.1:4318/#generation`；exec_command PTY会话ID **26981**。服务保留供用户使用；项目经理可通过该会话发送Ctrl-C停止。首次默认沙盒bind EPERM，随后本地服务启动通过自动审批；只读健康请求首次connect EPERM后经自动审批执行，没有外部部署或源码同步。

实际公开HTTP读取：`GET /api/health`=200，`productVersion=local-mvp-0.4`，`mode=local-development`，`generation.configured=false`，缺OPENAI_API_KEY、OPENAI_MODEL、OPENAI_MAX_OUTPUT_TOKENS、ROLECRAFT_GENERATION_BUDGET_USD、ROLECRAFT_ESTIMATED_MAX_COST_USD；仅列名称，无凭据值。`GET /`及`GET /#generation`均200、text/html。fragment由客户端处理，此HTTP检查不证明浏览器路由交互或视觉完成。

没有登录用户账户、访问私有API、填入用户数据、真实模型调用或收费；服务正在运行不等于真实生成或生产达标。当前配置缺口仍由模型岗位和安全授权输入解决，整体产品门槛需以当前版独立审计为准。
