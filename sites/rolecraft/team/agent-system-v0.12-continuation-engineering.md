# Agent 双输入 v0.12 续接工程交接

- **责任岗位**：软件工程师（网站客户端实现）
- **续接日期**：2026-10-15（Asia/Shanghai）
- **范围**：职业选择输入、学习内容输入、前端状态与接口消费、开发任务拆分；不改产品范围、教材、检索算法、账户数据或独立 QA 结论。
- **输入**：`agent-system-v0.12-prd.md`、`agent-system-v0.12-ux.md`、`agent-system-v0.12-backend.md`、`agent-system-v0.12-frontend-repair.md`、`app-p0-frontend-implementation.md`、`app-p0-retrieval-contract.md`、`app-p0-qa.md`、`project-handoff-2026-10-15.md`。
- **当前整体状态**：工程实现存在，限定范围曾以进程内 HTTP/隔离 VM 通过；当前工作区源码哈希与 P0/v0.12 既有冻结记录不一致，真实浏览器、真实 TCP、焦点/IME/响应式和动态职业独立 QA 未完成。因此本文件是续接交接，不把已有报告扩展为当前源码的最终验收。

## 当前收到状态与自查证据

| 路径 | 当前实现 | 当前源码 SHA-256 | 自查结果 | 边界 |
|---|---|---|---|---|
| `sites/rolecraft/dist/auth-career-v15.js` | 顶栏“选择职业”入口；匿名可打开；自然语言推荐优先 `POST /api/agent/career/recommend`，404/405 时兼容 `GET /api/careers?q`；候选、React 澄清、序号/版本防迟到；确认按钮才调用 `POST /api/agent/career/confirm`，旧服务回退 `PUT /api/profile/career` | `119ee8cacf91587065e52d23e476c0ceab05a3d30017a93212c859ebbfa03cf6` | `node --check` 通过 | 未有当前源码的真实浏览器、登录会话、CSRF、确认失败后焦点/重试证据；未确认推荐不写入的独立当前版本证据仍由测试岗补 |
| `sites/rolecraft/dist/learning-workbench.js` | 底部“问教材”胶囊/抽屉；默认不发送当前章节；用户点击“结合当前阅读”后才发送章节位置；优先 `POST /api/agent/learning/query`，默认 Agent 职业在 404/405 时兼容 `/api/content/dialog`；递增 requestId + AbortController 丢弃迟到结果；来源、原文、版本/hash 重新核对；加载/无匹配/失败/规则降级状态 | `24d1963aa5737b825d4b718767960c359b7ef67050b2aba472dc0dee1a01e0d2` | `node --check` 通过 | `app-p0-qa.md` 收到 SHA 为 `0f55ffd8…`，与当前源码不同；其 `met_within_scope` 不能直接覆盖当前字节。当前仍没有真实浏览器/HTTP/窄屏/IME/焦点证据 |
| `sites/rolecraft/server/index.mjs` | 已有 `/api/agent/career/recommend`、`/api/agent/career/confirm`、`/api/agent/learning/query`；版本/来源/上下文/CSRF/幂等合同在后端交接中定义；旧路由保留 | `cbd88d07a1f1c6a25706b7daed1d1878de4da8c81517315d25463b41e90f5154` | `node --check` 通过；后端交接记录进程内 handler/临时 SQLite 证据 | 无真实 TCP；确认幂等键在进程内 map，服务重启恢复未验证；动态职业无专属检索索引时返回 `unavailable` 是当前预期 |
| `sites/rolecraft/dist/learning-workbench.css` | 已有 P0 抽屉、状态和 ≤600px 样式 | `e158928612de4763a1d87434e770311556c7e043fa1b1ac9d0c501e8bab2a1b5` | 与 P0 QA 收到 SHA 一致 | 仍需当前源码浏览器截图与键盘/读屏检查 |

## 入口逐项判断

### 职业选择输入

已形成从“选择职业”到“确认写入”的客户端链路。`render()` 在匿名和登录态都挂载入口；`careerDialog()` 的提交只发推荐请求，`renderCareers()` 将候选置于会话状态；点击“确认并切换职业”前检查查询序号、候选身份与内容/索引版本，随后发送新确认 UUID、推荐请求 UUID、`expected` 快照和幂等键。确认响应还会再次核对职业与版本，失败不会刷新当前职业。

当前未收口的客户端合同点：

1. PRD/UX 要求候选卡呈现 `gaps`、匹配信号/学习起点及 `compare`、`browse_content` 等只读动作；当前 `renderCareers()` 仅呈现标题、简介、理由、教材版本/匹配模式和“查看并确认职业”，未展示服务返回的 `gaps` 或只读路径入口。此项交给产品经理确认字段优先级后，由设计师提供卡片稿，客户端实现消费已有字段，后端/检索不新增客户端猜测字段。
2. 当前职业、推荐、确认和教材加载在不同脚本间通过 `RolecraftAuthCareer` 事件衔接；真实确认后切换期间的加载、失败及不抢焦点行为需测试岗在可访问服务中独立复验。
3. 当前源码没有独立冻结绑定，不能直接引用历史 v0.12 第二轮或 P0 结论作为当前职业弹窗通过证据。

### 学习内容输入

`currentContext()` 将职业、内容版本、教材身份、可选章节上下文和起点构造成只读请求上下文；`find()` 为每次提交生成 UUID，提交前保留输入，响应 ID 不一致或来源/原文/hash/版本失配即显示不可用；用户显式选择“结合当前阅读”后才带 `currentUnitId/currentSectionId`。`resultHTML()` 区分回答、澄清、无匹配、不可用、非法输入和规则降级，并提供改写、重试、课程目录或真实小节链接。

当前未收口的客户端合同点：

1. 代码对来源和 corpus hash 做了严格核对，但来源详情主视图仍主要显示路径、原稿 SHA 和固定的“Agent 工程教材 v12”文案；`indexVersion`、`corpusHash` 等服务返回身份没有完整呈现。产品/设计需先决定主卡与折叠详情的最小可见字段，再由客户端消费服务字段，不能前端补写版本。
2. 当前学习脚本支持动态职业的 `unavailable` 诚实状态，但不代表动态职业检索已接入；内容检索岗需提供独立索引或明确支持范围，客户端只消费其状态。
3. 当前 `learning-workbench.js` SHA 与 `app-p0-qa.md/.json` 冻结 SHA 不同，必须重新冻结当前源后再做 P0/v0.12 浏览器复验。

## 具体开发任务与依赖

| 顺序 | 任务 | 唯一责任岗位 | 输入/依赖 | 完成条件 |
|---:|---|---|---|---|
| 1 | 冻结当前双输入源和版本绑定 | 软件工程师 + 项目经理 | 当前三份源码 SHA、历史 QA 绑定 | 记录当前 `auth-career-v15.js`、`learning-workbench.js`、`server/index.mjs`、CSS SHA；历史冻结保留，不覆盖 |
| 2 | 候选卡字段与只读动作对齐 | 产品经理→设计师→软件工程师 | PRD CAR-02/03、UX 3.3、后端 candidate contract | 先冻结是否显示 gaps/matchedSignals/起点；设计交付可审阅稿；客户端仅渲染服务返回字段；未确认不写入 |
| 3 | 学习卡版本/来源信息层级 | 产品经理→设计师→软件工程师 + 内容检索工程师 | PRD LRN-03/04、检索状态合同 | 冻结主卡/折叠详情字段；版本、索引、corpus hash、source hash 与 href 均来自服务并可核对；来源失配保留 unavailable |
| 4 | 后端/检索接口联调 | 后端数据工程师 + 内容检索工程师 | `agent-system-v0.12-backend.md`、`app-p0-retrieval-contract.md` | 新旧路由、状态、版本冲突、动态职业 unavailable 通过进程内夹具和可访问 HTTP 分开记录；不改客户端兜底语义 |
| 5 | 当前源码客户端自检 | 软件工程师 | 当前源、设计稿、接口字段 | `node --check`、隔离 VM 仅记录开发自检；不写独立 QA 结论，不覆盖历史报告 |
| 6 | 独立双输入 QA | 测试工程师（续接子代理） | 当前 SHA、PRD/UX/后端合同 | 浏览器与真实 HTTP 可用时核职业澄清/确认边界、学习四态、焦点/滚动/IME/迟到响应、来源版本；不可用环境明确标记 insufficient |
| 7 | 版本复盘与整体判断 | 项目经理 | 工程交接、子 QA、产品/设计/检索/后端报告 | 将当前局部证据与完整八门槛分开，保留整体 `not_met`；未通过项登记责任、复验方法和状态 |

## 安全和范围边界

- 不上传、发布、外联或付费模型调用；本轮所有推荐/学习查询继续标记 `providerCalled=false`，不得改成供应商生成。
- 不迁移、删除或覆盖正式账户数据库、旧教材、历史 QA、旧路由或浏览器记录；测试优先临时 SQLite/隔离目录。
- 不把本客户端自检、历史进程内 HTTP、静态 VM 或一次用户反馈写成真实浏览器、真实学习效果、真人专家审核、职业胜任或行业先进证据。
- 设计字段未冻结前不由客户端自行扩展产品范围；后端、检索和数据任务由各责任岗位完成后再消费。

## 工程岗位自查结论

当前客户端确实已经消费 v0.12 双输入协议并保留 v0.11 兼容路由，核心写入边界和版本/来源校验在代码层可定位；Node 语法自检通过。续接未完成事项集中在候选卡/来源信息的字段与视觉收口、当前源码重新冻结以及真实浏览器/HTTP 独立证据。当前交接范围可继续开发，但不能把历史 `met_within_scope` 扩大为当前版本最终通过或完整产品达标。

## 独立续测交接结果

测试工程师子代理的独立报告为 [`app-v0.12-continuation-qa.md`](app-v0.12-continuation-qa.md) / [`app-v0.12-continuation-qa.json`](app-v0.12-continuation-qa.json)，结论 `not_met`（17 项：10 pass、4 fail、3 insufficient）。该报告不修改客户端或本文件历史证据。

本次发现的首要工程依赖是当前 v12 检索索引与教材源失配：`textbooks/v12/c01-selection.md` 当前 SHA-256 为 `4ee70a19…`，`server/retrieval/content-v12-index.json` 对该源仍声明 `123f00a8…`；`getContentCatalog('textbook-v12')` 因此拒绝加载。内容检索/内容数据构建责任人需在保留旧绑定和历史报告的前提下重建索引；客户端不应绕过版本核对或将 `unavailable` 映射为 `no_match`/成功。索引修复后，测试岗位再按 Node24 重跑 React 澄清、题外域、来源摘录、学习上下文 opt-in、版本冲突和旧路由。

该子 QA 同时确认职业推荐/澄清/确认/幂等/版本冲突、客户端静态边界和动态职业无专属索引时的诚实 `unavailable`；真实 TCP、真实浏览器焦点/滚动/中文 IME/窄屏/迟到网络及 Node24 运行环境仍未验证。完整产品与八门槛继续由项目经理汇总为 `not_met`。
