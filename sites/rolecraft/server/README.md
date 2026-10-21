# Local development service

Requires Node.js 24.16.0 (built-in `node:sqlite` used; no installed dependencies).

From workspace root: `node scripts/start-local.mjs`, then `http://127.0.0.1:4318`. Stop with Ctrl-C. Bind is always 127.0.0.1; `ROLECRAFT_PORT` optionally changes the port. Do not expose this development service publicly. New users register their own local development accounts; no seed accounts or production authentication claim.

Default SQLite path for **local development**: `sites/rolecraft/.runtime/rolecraft.sqlite`, ignored by Git, with WAL/SHM companions in the same directory. `ROLECRAFT_DATA_DIR` sets an alternative location; independent QA must use a disposable temporary directory. No automatic import from browser storage, no read of old browser records.

The public production store is Tencent Cloud **CloudBase**, not this SQLite file. A copy under `/opt/rolecraft/.runtime` on the Lighthouse host is a process-local file and is not the production database. Host, SSH, Nginx, PM2, and the rsync update flow are in `deploy/deploy-guide.md`. Do not put CloudBase credentials in this tree.

Real generation configuration is read exclusively by `server/generation/index.mjs` from environment. Required: `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_MAX_OUTPUT_TOKENS`, `ROLECRAFT_GENERATION_BUDGET_USD`, `ROLECRAFT_ESTIMATED_MAX_COST_USD`. Optional timeout: `OPENAI_TIMEOUT_MS`. Do not put secrets in the browser, HTTP request, command history, source or report. Missing configuration explicitly blocks generation. No default provider model, cost estimate, budget or mock success is selected. Declared estimated cost is not a provider-enforced spending cap or an invoice.

Every queued job freezes profile/curriculum/source/template/rubric, model and declared resource-budget parameters without the credential. One attempt per new job; retry makes a linked new job and never replaces old chapters. Single worker holds a 15-second renewing lease (`ROLECRAFT_LEASE_MS`, at least 1000ms, only for local recovery experiments). On abrupt loss, a lease expires before recovery marks the running attempt interrupted with unknown provider outcome. No automatic repeat of a possibly chargeable request. Queued work resumes. Graceful shutdown fences running work and records unknown outcome. SQLite gives atomic local output/job/event commits, not exactly-once external calls.

Sessions last 24h; password scrypt, token hash, CSRF and same-origin checks enforced server-side. Private reads, associations and exports filter owner. Development security lacks production identity verification, TLS, password recovery, automated backups, multiworker hosting, global rate limit and operational monitoring.

Developer check: `node sites/rolecraft/server/dev-check.mjs`; uses only synthetic accounts and isolated temporary SQLite/HTTP, removes the directory, never sends provider requests. Independent QA must review results separately. API schema is [CONTRACT.md](./CONTRACT.md).

## v11 公开教材检索增量

前述无额外依赖的说明描述原账户/任务服务。新增内容检索使用独立 `retrieval/` 依赖和离线模型，不改变原账户、持久任务或真实生成规则。默认本机中文向量检索，不要求 API key，不在查询时联网。第一次需显式准备公开资源，下载与推理分别执行；资源缺失/校验失败显示 unavailable，不能冒充无匹配或大模型调用。

准备、恢复、固定模型与接口见 [检索模块说明](retrieval/README.md)。公开新增 `/api/content/catalog`、`/chapter/:unitId`、`/recommend`、图和已引用公开资料的白名单；不允许任意路径或私有资源。本地检索不会消除真实教材生成的配置缺口。正常停止会在原服务关闭后释放 ONNX pipeline。
