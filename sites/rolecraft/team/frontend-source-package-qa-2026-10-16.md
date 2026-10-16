# 前端源码交付包独立 QA（2026-10-16）

- **岗位**：测试工程师
- **范围**：只读核对当前工作区的前端静态入口、脚本/样式/素材相对引用、启动入口、Git 状态、`local-workbench-0.15-p0` 历史交接与既有线上部署记录。
- **明确未做**：未启动服务、未访问公网 URL、未浏览器测试、未部署、未修改源码/数据库/运行配置，也未读取或输出任何凭据值。
- **审计结论**：静态前端引用完整且语法可解析；交付包尚未生成，Git/全量线上版本对应和浏览器证据仍不足。不能把本审计扩大为线上原型已核实或产品通过。

## 1. Git 与版本来源

当前工作区：`/Users/shengxiong/Desktop/One People Company`。

- 分支：`main`。
- `HEAD`：`2e29fc7ab296c98389ad4fc1b7b73f4ecdf386a5`（提交信息 `WIP`，2026-10-12 13:42:31 +08:00）。
- Git remote：未配置，无法从仓库确认线上提交。
- 未提交状态：`AGENTS.md` 已修改；`.workbuddy-ai/`、`deploy/`、`sites/rolecraft/` 为未跟踪目录。项目源码和团队交接大部分不在当前 Git 提交中，因此不能用提交号证明当前源码包对应某个发布版本。

`local-workbench-0.15-p0` 仅在 P0/项目交接和历史 QA 中作为运行版基线出现。当前源码实际可见的身份是：

- `sites/rolecraft/dist/learning-workbench.js`：`VERSION='rolecraft-1.0'`，请求兼容字段 `WORKBENCH_VERSION='local-workbench-0.11'`。
- `sites/rolecraft/dist/auth-career-v15.js`：请求兼容字段同为 `local-workbench-0.11`。
- `sites/rolecraft/dist/learning-experience-v13.js`：`VERSION='rolecraft-1.0'`。
- `sites/rolecraft/server/index.mjs`：`RELEASE_VERSION='rolecraft-1.0'`，兼容 `PRODUCT_VERSION='local-mvp-0.4'`。

这与 `team/agent-system-v0.12-continuation-product.md` 所述的“双层版本解释”一致：运行版标签和协议兼容字段不能混用。但当前文件没有直接写入 `local-workbench-0.15-p0`，所以 `0.15-p0` 到当前源码字节的绑定仍应标为**交接身份、尚未由 Git/统一发布清单确认**。P0 QA 冻结的 JS `0f55ffd8…`、CSS `e1589286…` 不是当前字节；不能把其 `met_within_scope` 直接继承给当前包。

## 2. 当前前端静态入口与相对引用

当前页面入口为 `sites/rolecraft/dist/index.html`。它声明 `#learn` 由 `app.js` 路由、`learning-experience-v13.js` 学习页和 `learning-workbench.js` 阅读/检索工作台共同消费；`learning-workbench.js` 的路由解析明确支持 `#learn`、`#learn/agent/<unitId>` 和小节锚点。

`index.html` 的 22 个脚本和 5 个样式引用全部在 `dist/` 中存在，静态引用检查为通过。脚本加载顺序也保留了数据先于页面挂载的关系：

```text
curriculum-data.js
product-gates-data.js
creation-path-data.js
product-audit-data.js
generation-curriculum-data.js
generation.js
textbook-v05-data.js
textbook-v05-content-review-data.js
textbook-data.js
textbook-content-review-data.js
textbook-pilot.js
textbook.js
content-v10-data.js
content-v12-data.js
content-retrieval-core.js
learning-workbench.js
auth-career-v15.js
learning-v13-data.js
interview-answers-v1-data.js
interview-answer-renderer.js
learning-experience-v13.js
app.js
```

样式引用为：`styles.css`、`learning-workbench.css`、`learning-experience-v13.css`、`auth-career-v15.css`、`interview-answer-reader.css`。

v12 与历史 v10 正文的图形素材引用也已检查：

- `dist/content-v12-assets/` 的 5 个 PNG/SVG/DOT 素材全部存在。
- `dist/content-v10-assets/` 的 6 个 PNG/SVG/DOT 素材全部存在。

需要保留相对路径的静态预览候选范围是整个 `sites/rolecraft/dist/`，因为 `index.html` 会加载上述全部脚本和样式；若交付包只保留 `learning-workbench.js` 等少数文件，`#learn` 以外的初始化依赖会缺失，不能称为当前页面源码包。

## 3. 当前主要源码哈希（工作区收到状态）

| 文件 | SHA-256 |
|---|---|
| `sites/rolecraft/dist/index.html` | `de8647133091a34e767816c02cc47d2d792d88ff41b5e851a1b6002bf2dc817b` |
| `sites/rolecraft/dist/styles.css` | `47850ba437e3598424846361bb10463fc83513a3eae4d5ff7f1abcd6ad404139` |
| `sites/rolecraft/dist/learning-workbench.js` | `9aebdadaab45e47f6f6dcd4d8fa2168f167bdb802ed22e022b087abd039a74d3` |
| `sites/rolecraft/dist/learning-workbench.css` | `1a53e9fc115513b04404fa9656b626c9945efc483e36f5da30beb36e65b63c52` |
| `sites/rolecraft/dist/learning-experience-v13.js` | `3b17e6ce3b1d06c6aecea39f2f69a8745233f85192b275c7168016b556e89d65` |
| `sites/rolecraft/dist/learning-experience-v13.css` | `bd29b71eed6e7742b1e39ac13dabc9ef07ac5dfd9bd018e2d16b82b4a55cf509` |
| `sites/rolecraft/dist/auth-career-v15.js` | `48f6b83354c89546cd884ab505e73653814f03cf323c20aad5d7561869be078c` |
| `sites/rolecraft/dist/auth-career-v15.css` | `1d5c799bb641056b051bf4a522d960f6863fee8ab6686e55fbd42f297f0fb13a` |
| `sites/rolecraft/dist/app.js` | `68415ce3c8e2695cbb7807fb4ddb02abf929c76ab9b22563e791081002817289` |
| `sites/rolecraft/dist/content-v12-data.js` | `3eb094b460e0a1f545820232058d3b58b4c85d1353c87895709af3784d408b12` |
| `sites/rolecraft/dist/content-v10-data.js` | `0a2537f32ea2ddc2c5a020cc7a72937f0bfb7813ee2b701a3bdeec9035d02d58` |
| `sites/rolecraft/dist/content-retrieval-core.js` | `b3535b2249effdb0118713295ae9b86e117e0d86c86041aade3e8c33a0fc092d` |
| `sites/rolecraft/dist/learning-v13-data.js` | `6d27dabc1cedc15236de846c44dae8f66c4f82b77c2ede543941d3589e8772a4` |
| `sites/rolecraft/server/index.mjs` | `23fe1071d490e8042cd408ad1b3b7bd445529ac432ab5b6327f5d8047de4a6a7` |

本轮对 `app.js`、`learning-workbench.js`、`learning-experience-v13.js`、`auth-career-v15.js`、`server/index.mjs` 和 `scripts/start-local.mjs` 执行 `node --check`，均退出码 0。此项只证明语法可解析。

## 4. 预览入口和依赖边界

- 启动入口：`scripts/start-local.mjs`。
- 命令：从工作区根目录运行 `node scripts/start-local.mjs`。
- 启动器要求 Node 主版本 24，然后 spawn `sites/rolecraft/server/index.mjs`；服务端默认绑定 `127.0.0.1:4318`。
- 页面入口：`http://127.0.0.1:4318/#learn`（服务器预览）；直接打开 `sites/rolecraft/dist/index.html` 可得到 file:// 静态阅读壳，检索会按客户端规则/静态回退边界运行，不能当作真实 HTTP 检索证据。
- 语义检索依赖：`sites/rolecraft/server/retrieval/package.json` / `package-lock.json`（`@huggingface/transformers` 3.8.1）；服务端完整语义检索还需要本地模型目录。依赖应在包外安装，不能把 `node_modules` 作为源码包交付。
- 检索状态合同：`sites/rolecraft/team/app-p0-retrieval-contract.md`，接口实现及自检说明还在 `sites/rolecraft/server/retrieval/README.md`、`sites/rolecraft/server/CONTRACT.md` 和 `sites/rolecraft/server/README.md`。

## 5. 已有前端/UX/检索交接文件

当前工作区已有、可作为交接资料单独收录的文件：

- `sites/rolecraft/team/app-p0-frontend-implementation.md`
- `sites/rolecraft/team/app-p0-qa.md`、`app-p0-qa.json`
- `sites/rolecraft/team/app-p0-retrieval-contract.md`
- `sites/rolecraft/team/app-v15-auth-career-implementation.md`
- `sites/rolecraft/team/frontend-v1.0-loading-fix.md`、`frontend-v1.0-loading-fix.json`
- `sites/rolecraft/team/frontend-v1.0-p0-fixes.md`、`frontend-v1.0-p0-fixes.json`
- `sites/rolecraft/team/design-v1.0-learning-workbench.md`、`design-v1.0-learning-workbench.svg`
- `sites/rolecraft/team/design-v1.0-loading-state-review.md`、`.json`
- `sites/rolecraft/team/design-v1.0-p0-reacceptance.md`、`.json`
- `sites/rolecraft/team/deployment-v1.0-current.md`、`.json`
- `sites/rolecraft/team/deployment-v1.0-p0-fix.md`、`.json`
- `sites/rolecraft/team/deployment-v1.0-loading-fix.md`、`.json`
- `sites/rolecraft/team/project-handoff-2026-10-15.md`

这些文件保留了历史失败、局部通过和限制，交付时不能只保留“通过”结论而删除旧证据。

## 6. 线上版本对应：已有证据与尚未核实

本审计未访问 `http://111.231.8.78/#learn`，只读引用已有部署记录：

- `deployment-v1.0-current.*` 记录了 2026-10-15 的 `rolecraft-1.0` 远程部署，公网 health/catalog/recommend/learning-query 均曾返回 HTTP 200；它只绑定了少数核心 hash（server、retrieval、index、c01 源和模型），未绑定整个 `dist/` 文件集合。
- `deployment-v1.0-p0-fix.*` 记录了 `auth-career-v15.css`、`learning-v13-data.js` 的公网 HTTP 200 和哈希一致。
- `deployment-v1.0-loading-fix.*` 记录了 `learning-workbench.js` `9aeb…` 与 `learning-workbench.css` `1a53…` 的公网 HTTP 200、远程哈希与工作区一致，并记录 `rolecraft-1.0` 发布头。
- `backend-v1.0-real-model-deployment.*` 后续绑定了 `server/index.mjs` `23fe…`，并说明远程环境已写入真实供应商配置；它不构成完整前端包绑定，也不应把真实凭据带入交付包。
- `deployment-online-health-review-2026-10-15.md` 同期记录从当前检查环境连接公网 `:80` 失败，首页、health、catalog、recommend 均为 `not_verified`。这与部署记录中“公网 HTTP 200”的声明相互冲突；本审计不擅自选择其中一方作为当前事实。

因此可取得的结论是：**两个加载交互资源和两个 P0 资源有既有部署记录的传输声明/哈希记录；但现有记录之间存在公网可达性冲突，不能确认公网 `#learn` 当前加载的全部脚本、样式、v12/v10 素材与工作区这一整套文件完全对应。** 全量线上包对应应标为“尚未核实”，不能为此启动生产测试或部署。

## 7. 排除项检查

当前工作区确实存在必须排除的内容：

- `sites/rolecraft/.env.external-services.local`：存在非空 API 凭据、端点和模型字段；本审计只记录变量名/存在性，不输出值。禁止打包。
- `sites/rolecraft/.runtime/rolecraft.sqlite`：本地账户/任务数据库；禁止打包。
- `sites/rolecraft/server/retrieval/node_modules/`：约 376 MB；禁止打包。由 `package-lock.json` 重装。
- `sites/rolecraft/server/retrieval/models/`：本机语义模型缓存；前端源码包不应带入；若另行提供检索运行包，须独立声明模型来源和哈希。
- 团队历史目录中存在多份 `.sqlite` 测试夹具和 `environment.json` 收据；交付包只选择明确的交接文档，不能递归复制整个 `team/`。
- 可保留的无密钥模板：`deploy/.env.example`。它含变量名和示例/空值，不含真实密钥；不要将 `deploy/.env` 或远程环境副本带入。

本审计没有发现当前工作区中名为 `deploy/.env` 的文件，但 `.gitignore` 明确排除 `.env*`，且敏感 `.env.external-services.local` 仍在工作区，故包构建必须使用显式 allowlist，不能靠“复制后再删除”假定安全。

## 8. 缺口与复验条件

1. 先生成带相对路径的实际源码包，再在包目录独立列出 `node_modules`、`.env*`、`.runtime`、SQLite、模型缓存和会话/生产数据均不存在；本审计未对尚不存在的包签收。
2. 包的 manifest 应绑定当前工作区文件 SHA，尤其是 `index.html`、两个工作台 JS/CSS、`learning-experience-v13.*`、`auth-career-v15.*`、`content-v12-data.js`、v12/v10 素材及 `scripts/start-local.mjs`。
3. `local-workbench-0.15-p0`、`rolecraft-1.0`、`workbenchVersion=local-workbench-0.11` 的双层身份应在包说明中并列；不要把任何一个值单独写成“当前全量线上版本”。
4. 线上全量 `#learn` 对应、全资源 hash、浏览器渲染和实时检索状态仍是 `尚未核实`；按用户要求不通过部署或生产测试补证据。

本报告只读写入测试岗位独立审计路径，不改变原源码、数据库或运行配置。
