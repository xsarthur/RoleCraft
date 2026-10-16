# 教材 v0.5 · 本机服务恢复记录

2026-10-10；后端数据工程师。唯一任务为恢复现有本机研发服务，向独立 QA 和项目经理交接；未编写教材、修改前端或执行教材验收。

## 原状态与恢复动作

项目经理交接 QA 访问 `http://127.0.0.1:4318` 得到 `ERR_CONNECTION_REFUSED`。本岗位先读取根目录 AGENTS.md、scripts/start-local.mjs、server/README.md 与 implementation-v04-backend.md；启动前 `lsof -nP -iTCP:4318 -sTCP:LISTEN` 无监听记录。普通 `ps` 因沙盒权限未执行，没有读取进程环境或任何凭据。

从工作区根目录 `/Users/shengxiong/Documents/ChatGPT/一人公司建设` 执行：

```sh
node scripts/start-local.mjs
```

正常沙盒首轮启动因 `listen EPERM 127.0.0.1:4318` 退出；随后相同命令请求本机服务沙盒提升，自动审批允许后启动成功。没有外网发布、源码同步、修改监听地址或新增模型配置。

运行中的 exec_command PTY 会话：**84210**；`lsof` 实际监听进程 PID：**48023**；地址仅 **127.0.0.1:4318**。会话保留供用户使用，项目经理需要停止时可向该会话发送 Ctrl-C。记录只证明本次观测时正在运行，不保证未来会话存活。

默认数据库为 `sites/rolecraft/.runtime/rolecraft.sqlite`，正常启动保留／恢复该路径；仅核对文件存在，没有查询私有表、访问用户账户、reset、删除或 seed。未设置替代数据库目录、模型、密钥、预算或付费调用参数。

## 实际公开检查（开发运维自查，非独立 QA）

启动后 `lsof` 返回 `node 48023 ... TCP 127.0.0.1:4318 (LISTEN)`。

curl 首轮请求被已有代理路径送往 `127.0.0.1:7897` 而失败；使用 `--noproxy 127.0.0.1` 直接访问，沙盒仍无法连接已经监听的服务。相同只读本机请求获得沙盒提升后实际成功，没有读取或打印代理／其他环境值：

| 公开请求 | 实际响应 | 范围 |
| --- | --- | --- |
| `GET /api/health` | HTTP 200、application/json；服务器 `productVersion=local-mvp-0.4`、`mode=local-development` | 本机服务和公开配置准备状态 |
| `HEAD /` | HTTP 200、text/html | 网站入口响应头 |

公开 health 的 `generation.configured=false`。缺项为 `OPENAI_API_KEY`、`OPENAI_MODEL`、`OPENAI_MAX_OUTPUT_TOKENS`、`ROLECRAFT_GENERATION_BUDGET_USD`、`ROLECRAFT_ESTIMATED_MAX_COST_USD`；只列名称，没有凭据值。未发起模型请求。

当前前端源码 `currentProductVersion=local-mvp-0.5-textbook`，服务器仍是原 `local-mvp-0.4`；两者分别描述本轮教材客户端和未修改的研发后端，不将其混为同一个审核版本。公开检查未执行浏览器路由、DOM、视觉、教材内容、用户数据或生成成功测试，独立 QA 另行复验。

## 源码未变与交接

本岗位只新增此运维记录，未修改应用源码。与 implementation-v04-backend.md 的已记录 SHA256 相同：

- `server/index.mjs`：`f111fa0f17389a0b586d34f75748b844fa042f9ab88985189c77a30563daf0d8`
- `scripts/start-local.mjs`：`42c47994401f1fef3a67ad3ac130746e4270f8f56348ccd8bfb4180237c6066f`

可访问教材入口：`http://127.0.0.1:4318/#book/agent`。恢复服务本身不关闭完整教材、真实生成、行业专业审核、学习效果或正式生产运行缺口。本轮客户端及教材产出由对应岗位和独立 QA 检查，本岗位不继承或宣布这些领域通过。

## QA 再次连接失败后的持久启动修正

上述首次恢复是当时的真实观测，但未在代理结束后持续保持。项目经理随后交接 QA 获准直连仍得到 `ECONNREFUSED`。本岗位复查：`write_stdin` 会话 **84210** 返回 `Unknown process id`，`kill -0 48023` 返回 `no such process`，`lsof` 4318 没有监听。保留这些失败记录，原先“会话保留”不能作为当前存活证据。前台 PTY 对工具／代理生命周期的依赖未解决，不能用同样前台方式再次宣布持续可用；进程具体收到的终止信号没有证据。

根脚本未提供后台参数，只是前台 spawn 后端并转发 SIGINT/SIGTERM。按项目经理授权，使用 Node `spawn` 的 `detached:true` 与 `unref()`，仍执行同一个 `scripts/start-local.mjs`，标准输入 ignore、输出进入项目 `.runtime/local-service-v05.log`，启动 PID 进入 `.runtime/local-service-v05.pid`。没有增加常驻监控、重启服务或修改应用代码。

本次实际启动命令从工作区根执行，经本机服务沙盒提升允许：

```sh
node -e 'const fs=require("node:fs");const {spawn}=require("node:child_process");const log=fs.openSync("sites/rolecraft/.runtime/local-service-v05.log","a",0o600);const child=spawn(process.execPath,["scripts/start-local.mjs"],{cwd:process.cwd(),detached:true,stdio:["ignore",log,log]});child.unref();fs.closeSync(log);fs.writeFileSync("sites/rolecraft/.runtime/local-service-v05.pid",String(child.pid)+"\n",{mode:0o600});console.log("Detached starter PID "+child.pid);'
```

**新的当前进程**：启动脚本 PID **50111**，后端监听 PID **50114**；`lsof` 实际显示 `TCP 127.0.0.1:4318 (LISTEN)`。后台进程与工具 PTY 分离，没有可继续使用的 exec session；若用户要求停止，项目经理可对启动脚本 PID `50111` 发送 SIGTERM，由原脚本转发后端。应先核对 PID 与监听，避免今后误用旧 PID。日志和 PID 位于既有 ignored `.runtime`，本次命令没有记录凭据值，未读取用户账户或任务。

独立于启动调用的随后工具调用，通过 Node 内置 HTTP 直接访问本机（避免先前 curl 代理干扰），只读公开 5 条请求实际成功：

| 公开请求 | 结果 | 返回内容的 SHA256／可见状态 |
| --- | --- | --- |
| `/api/health` | HTTP 200 JSON | 后端 `local-mvp-0.4`，`configured=false`，原五项配置仍缺 |
| `/` | HTTP 200 HTML，4127 bytes | `1aab6c6f461c162ccef31f223c24461b0e80b75fb797c12e28815b92e62abba1`；含 `local-mvp-0.5-textbook` |
| `/textbook-data.js` | HTTP 200 JavaScript，523654 bytes | `6fa6a704f46d26adc38bbdc90256d27919309e98177c69459899aa77a3413d73` |
| `/textbook-content-review-data.js` | HTTP 200 JavaScript，41401 bytes | `9969bb86e62ffa5bd1709ea63a892410c13e99933f1ab3480553abbb268dd5ef` |
| `/textbook.js` | HTTP 200 JavaScript，22811 bytes | `b9f543f2bd01c13335ca17d4700f9399cb4f7d97b20fcc7082a6e1de6a4ca0dd` |

这些哈希仅记录本次 HTTP 返回字节，客户端后续打包可能继续修改，应由 QA 结合最终包独立复验。已通知项目经理恢复状态，由其转交 QA 在本岗位结束后验证存活和浏览器访问。进程脱离临时会话不等于生产可靠性；没有新增自动重启、监控、生产安全或备份保证，完整产品缺口保持。
