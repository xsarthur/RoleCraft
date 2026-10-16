# 职造项目总交接

- **项目**：职造（Rolecraft）本地学习工作台、版本化教材与内容检索
- **交接版本**：`project-handoff-2026-10-15`；当前应用增量基线 `local-workbench-0.15-p0`
- **日期**：2026-10-15（Asia/Shanghai）
- **交接人**：项目经理
- **当前整体判断**：`not_met`
- **本文件状态**：项目级交接已生成；各专业结论仍以对应岗位文件和版本绑定为准

## 本项目目标

职造同时服务三类任务：帮助新人理解岗位和进入路径，帮助业内人士准备面试并梳理经验，帮助专业人士发现知识盲区并找到可定位、可学习、可验证的补学内容。推荐必须与用户表达的意图相匹配，并带教材版本、章节/小节、原文摘录和定位；无匹配、歧义、未覆盖和资源不可用时保留诚实状态。阅读、练习、自评和局部功能通过都不能直接解释为职业胜任、录用、真人专家认可或行业先进。

## 必须读取的输入

### 项目规则与用户确认偏好

- [AGENTS.md](/Users/shengxiong/Desktop/One%20People%20Company/AGENTS.md)：岗位边界、交接、独立 QA、证据状态和授权边界。
- [产品目的基线](product-purpose-2026-10-15.md)：三类用户价值及内容推荐边界。
- [用户确认的跨项目偏好](employees/core/user-profile/approved-preferences.md)：视觉优先、编辑质量底线、来源和证据边界、岗位独立性。
- [项目经理长期记忆](employees/core/project-manager/MEMORY.md)：员工记忆可跨项目复用，但不等于运行时自动加载或能力证据。
- [交接模板](employees/core/HANDOFF_TEMPLATE.md)：项目级交接沿用目标、输入、特例、限制、记忆候选字段。

### 产品、设计与工程合同

- [Agent 双输入 PRD](agent-system-v0.12-prd.md) 与 [UX 交接](agent-system-v0.12-ux.md)：职业输入、学习输入、状态、确认边界和验收 ID。
- [Agent v0.12 后端交接](agent-system-v0.12-backend.md) 与 [客户端修复交接](agent-system-v0.12-frontend-repair.md)：最终实现范围和接口边界。
- [P0 检索状态合同](app-p0-retrieval-contract.md)、[P0 客户端实现](app-p0-frontend-implementation.md)、[P0 独立 QA](app-p0-qa.md)：当前工作台主入口、检索抽屉和四种状态。
- [学习产品优化合同](product-learning-optimization-scope-v2.md) 与 [设计复盘](design-product-review-2026-10-15.md)：A1–A4 的先决关系、视觉优先和后续验收。
- [线上健康复盘](deployment-online-health-review-2026-10-15.md)：公网、健康端点、目录和推荐接口仍待服务器侧证据。

### 教材、面试答案与训练证据

- [v12 教材 QA](textbook-v12-qa.md)、[v12 产品判断](textbook-v12-product-assessment.md)、[v12 内容复盘](textbook-v12-content-review-r2.md)。
- [Agent 面试答案返修产品整合](agent-interview-answer-revision-assessment.md)：Q1–Q100、M101–M114、P01–P10 共 124 题的内容/数据状态。
- [AI 生成工程师 D0 项目经理记录](ai-generation-d0-pm-v01.md)、[L0 交接 v0.10](ai-generation-l0-learner-handoff-v10.md)、[L0 QA v0.10](ai-generation-l0-learner-handoff-qa-v10.md)、[L0 内容审校 v0.10](ai-generation-l0-learner-handoff-content-review-v10.md)。
- [用户反馈：c01-selection](user-feedback-c01-selection-v01.md) 与 [方案选择视觉草稿](visuals/c01-selection-control-map-v01.md)：仅一位参与者的表达方式反馈和未接入的设计草稿。

## 当前版本与证据地图

| 领域 | 当前身份 | 已有证据 | 当前结论与边界 | 下一责任人/复验 |
|---|---|---|---|---|
| 产品目的 | `purpose-2026-10-15` | 三类用户任务、推荐出处与能力边界已冻结 | 目的基线已交接，不代表用户价值已验证 | 产品经理与用户研究员补真实任务证据 |
| Agent 双输入 | `agent-system-v0.12` | 历史第二轮 QA 43 项全通过，`met_within_scope`；Node 24.16、进程内 HTTP handler、临时 SQLite；续测当前源码为 17 项 10/4/3、`not_met`，因 c01 来源—索引失配阻断学习路径 | 没有真实 TCP、真实浏览器焦点/滚动/中文 IME/响应式/迟到时序证据；动态职业无专属索引时诚实 `unavailable`。首轮 30 项 13/9 的 `not_met` 保留为历史 | 内容数据/检索工程师先修复当前 corpus；测试工程师在可访问服务和浏览器环境重做当前版本复验 |
| 登录与多职业 | `app-v15-auth-career-implementation` | 本地注册/会话/CSRF、published 职业、BGE/关键词降级、多职业内容隔离、收藏/进度/笔记隔离；隔离临时服务和本地页面检查通过 | 这是工程实现交接，不是同前缀独立 QA；生成服务、短信/OAuth/找回密码和历史 v10 动态阅读仍未接入 | 测试工程师建立 `app-v15-*` 独立 QA；后端/客户端按缺口复验 |
| P0 学习工作台 | `local-workbench-0.15-p0` | 首页三态唯一主入口、问教材胶囊/侧抽屉、输入保留、加载/无匹配/失败/规则降级、ARIA、窄屏 CSS 和版本/来源校验在隔离 VM/静态范围 `met_within_scope`；收到 JS SHA `0f55ffd8…`，CSS SHA `e1589286…` | 未获得真实浏览器/HTTP 截图和网络时序；当前 QA 不扩展为完整产品通过 | 测试工程师补桌面、390/320px、键盘/读屏、真实状态切换和焦点证据 |
| 内容检索 | `content-retrieval-0.12-v12` / `textbook-v12` | 历史绑定曾记录 30 篇语料与推荐/澄清通过；续测发现当前 `c01-selection` 正文与派生索引 SHA 失配，当前加载安全失败；无外部供应商调用 | 规则/离线语义/真实 API 模式必须分开显示；历史自检不替代当前来源核对、真实 HTTP 和独立浏览器验收 | 内容数据/检索工程师先修复并重建索引；测试工程师按当前版本复验 |
| v12 Agent 工程教材 | `textbooks/v12`，合订本 SHA `25ce2aaa1be0ba0f2814dd1247ac6299d106c3d2e48f43867c49055490c2801e` | 30 单元；原固定 100 题正文支持 98/2/0，市场新增 14 题 14/0/0，作者冻结变体 10/0/0；12 个新增离线例及有限 LangGraph/标准库检查；QA `met_with_limitations` | Q10/Q99 仍需本人真实经历；真人专家、真实学习效果、陌生任务、外部协议/模型/生产恢复/成本未证；完整产品仍 `not_met` | 课程架构师、教材研发员、内容审校员补视觉/轨迹/对照实验与真人复核；QA 独立复验 |
| 124 题答案 | `interview-answers-v1` | Q1–Q100、M101–M114、P01–P10 共 124 题内容审校、数据绑定和隔离 VM 原例通过；当前数据包 SHA `4a9e3ce4…`，渲染器 SHA `27c67c8f…`，manifest SHA `e3bb9ec…` | 当前 `pending_final_browser_qa`；主 QA 尚未完成真实点击、刷新、窄屏、题目定位及延期路由检查；不能以数据/VM 通过宣布完整交付 | 测试工程师完成浏览器 QA 与最终绑定；产品经理更新交付结论 |
| AI 生成工程师 L0 | `D0-AI-20261015-001` / handoff v0.10 | v10 manifest 使用相对路径和 self-reference 规则；D0-04 七类工件、D0-05 五字段矩阵、B 租户拒绝码和无下游调用有文件哈希；QA `met_within_scope`，内容审校 `reviewed_with_limitations` | `human_receipt/qa_status=pending`，`self_signed=false`，D0/L0 `not_assessed`，L1/L2 `not_granted`；真实模型/API、ACL、生产恢复/RPO-RTO、未知任务迁移、真人签收和职业能力未证 | AI 生成工程师补 A 路径运行收据、事件/工具/未知副作用观察；接收岗签收；QA/内容审校复验后再评估门槛 |
| 线上部署 | 腾讯云目标 `111.231.8.78` | 本地合同静态核对完成；部署记录声称 Node 24、4318、Nginx | 当前环境无法连接公网 80 端口；`/api/health`、`catalog`、`recommend` 未验证；线上可达性与生产就绪 `not_verified`，PM2 自启和生成配置待服务器证据 | 部署/软件工程师在服务器本机与外部网络补收据；QA 按当前版本重新验收 |

## 项目特例

1. **版本不可互相覆盖**：`agent-system-v0.12-qa-r1.json` 是首轮历史失败；当前结论以同名最新 `agent-system-v0.12-qa.md/.json` 的第二轮绑定为准。旧失败必须保留，不能写成从未发生。
2. **局部范围通过与整体目标分开**：v0.12、P0、v12 教材和局部数据/VM 均只形成限定范围证据；完整职造产品仍为 `not_met`。
3. **工程自检不替代独立 QA**：`app-v15-auth-career-implementation.md`、检索岗位自检、静态 VM、模块直调和作者自查都必须标注其范围，不能替代浏览器、真实 HTTP、真人用户或真人专家证据。
4. **教材来源必须可定位**：当前检索只可推荐已存在的 v12 章节/小节；无匹配、歧义、来源失配、动态职业无语料时不得编造答案或回退到 Agent 教材。
5. **用户反馈仅一人**：`UF-C01-20261015-01` 支持“连续长文本拖慢理解、需要视觉化”的机会判断，不支持所有读者偏好、阅读效率提升或产品通过结论。
6. **旧数据与账户边界**：测试应使用临时 SQLite/隔离目录；不删除或迁移正式用户数据库、浏览器历史、旧教材、旧报告和冻结题集。
7. **当前线上与付费边界**：本轮未获得公网接口证据；未进行付费模型调用、上传、发布或外部联系。配置密钥不得写入网页、源码、记录或 localStorage。

## 责任交接与下一步顺序

| 顺序 | 任务 | 唯一责任岗位 | 交接输入 | 完成条件 |
|---:|---|---|---|---|
| 1 | 补 Agent v0.12 与 P0 的真实 HTTP/浏览器证据 | 测试工程师 | 当前源文件、QA 合同、临时数据方案 | 真实 socket 状态码/headers、桌面与窄屏、焦点/IME/迟到响应、四种状态和动态职业行为有独立记录 |
| 2 | 为 v15 登录/多职业实现建立独立 QA | 测试工程师 | `app-v15-auth-career-implementation.md` | 登录、切换、职业教材隔离、收藏/进度/笔记隔离及不可用职业的真实浏览器/HTTP证据；不读正式数据库 |
| 3 | 完成 124 题最终浏览器验收 | 测试工程师 | `agent-interview-answer-revision-assessment.md`、当前数据/渲染器绑定 | 真实点击、刷新、窄屏、原文定位、Q/P/M 集合入口与延期路由复验；更新 `pending_final_browser_qa` |
| 4 | 冻结 A1-00 产品/设计决定 | 产品经理 + 设计师 | `product-learning-optimization-scope-v2.md`、v12 课程关系 | 明确是否采用路线呈现、用户任务、最小状态集合；决定前不实现路线状态字段 |
| 5 | 交付视觉优先教材材料 | 设计师 + 课程架构师 + 教材研发员 | `textbook-v12-content-review-r2.md`、`visuals/c01-selection-control-map-v01.svg` | A2 轨迹图、A3 三屏导览、A4 来源/运行状态徽章有来源、文字替代和窄屏稿；内容审校后再实现 |
| 6 | 复验 AI D0/L0 门槛 | AI 生成工程师 + 接收岗 + QA + 内容审校员 | handoff v0.10 与 v10 QA/审校 | 补 A 运行/事件/未知副作用证据、真人签收；重新评估 D0/L0/L1，不得直接授级 |
| 7 | 核实公网部署 | 软件/部署工程师 + 内容检索工程师 + QA | `deployment-online-health-review-2026-10-15.md` | 服务器本机、外部网络、Nginx/PM2、health/catalog/recommend 和恢复证据齐全后再讨论线上状态 |
| 8 | 更新项目复盘账本 | 项目经理 | 本交接及以上各岗位最终报告 | 在 `RETROSPECTIVES.md` 新增本轮记录，列目标、结果、差距、原因、责任、复验和整体 `not_met`；不得覆盖历史 R45 |

## 本地运行与安全操作

- 当前开发运行时为 Node `v24.16.0`；历史 README 的启动入口是从工作区根目录运行 `node scripts/start-local.mjs`，默认 `http://127.0.0.1:4318/`。启动前确认是否会读取正式 `.runtime`，测试优先指定隔离数据目录。
- `textbook-v12` 是当前 Agent 内容索引身份；读取/推荐只读，不自动写学习记录、账户、教材正文或能力结论。
- 真实服务未通过本沙箱 TCP/浏览器复验时，不得用模块直调结果替代 HTTP/浏览器证据；服务不可用应保留 `unavailable`，不能改写为 `no_match` 或成功。
- 任何真实供应商调用、付费预算、上传、发布、外部联系或正式数据迁移都需要新的明确授权和独立验收；当前交接不包含这些动作。

## 当前完整目标复盘

| 原八门槛 | 当前状态 | 说明 |
|---|---|---|
| `user_value` | `insufficient` | 有三类目的和一位参与者反馈，无真实用户效果样本 |
| `teaching_quality` | `insufficient` | v12 与 124 题有内容/AI审校/限定 QA，真人专家和学习效果未证 |
| `real_generation` | `fail` | 未完成真实模型/学习档案驱动的生产生成证据 |
| `comparative_advantage` | `insufficient` | 没有同条件行业产品/研究比较 |
| `learner_creation` | `insufficient` | 没有真实学员陌生任务、作品和独立评价 |
| `reliable_delivery` | `fail` | 局部本地和隔离环境证据存在，正式生产交付/公网健康未证 |
| `operating_economics` | `insufficient` | 没有真实供应商成本、质量、维护和预算证据 |
| `iteration_trace` | `pass`（仅当前已记录闭环范围） | v0.12/P0/教材/训练局部缺陷有返修记录；新版本仍须重新复验 |

因此，本项目可以交接为“有版本化教材、自然语言内容检索和双输入协议的本地候选实现，局部限定范围已通过；真实浏览器/公网/真人学习与完整职业目标仍未完成”。交接接收方应按上表顺序继续推进，不能把任务记录完成、内容覆盖率、静态自查或局部 QA 通过当作完整产品完成。

## 可复用的已确认偏好

- 优先使用视觉表达程序意图；设计交接先提供可直接审阅的图、状态和步骤关系，同时保留必要的短标签、无障碍名称和真实错误说明。来源：[approved-preferences.md](employees/core/user-profile/approved-preferences.md)。
- 教材、解释型内容和面试题解须多角度、细致、可实践并有依据；具体职业的案例和证据按领域适配，不机械复制 Agent 术语。来源：[approved-preferences.md](employees/core/user-profile/approved-preferences.md)。
- 经验必须标明来源、适用范围、确认状态和版本；未验证推断不能写成稳定事实；岗位不得越界代写或代验收。来源：[approved-preferences.md](employees/core/user-profile/approved-preferences.md)。

## 本项目限制与不适用项

- 本文件不替代产品、设计、课程、工程、检索、内容审校或测试岗位的专业报告；链接到报告不等于继承其全部结论。
- 本文件不授予职业等级、学习认证、生产权限、真人专家认可、行业先进性或用户满意度。
- 本文件不把 v0.12 进程内 HTTP、P0 隔离 VM、v12 示例运行、答案数据/VM 链接核对或 AI handoff manifest 当作真实公网、浏览器、模型、跨进程恢复、生产数据库或真人能力证据。
- A1 路线呈现、A2–A4 视觉材料、124 题最终浏览器验收、AI D0/L0 晋级、公网可达性和真实学习效果仍是开放事项。
- `RETROSPECTIVES.md` 已追加本轮 R48–R50 双输入交接与补测；其中历史 v0.12 第二轮 QA、P0 和用户反馈仍保持各自原始身份，本交接不能把限定复验冒称为完整产品通过。

## 任务结束时的记忆候选

本轮没有新的跨项目长期记忆候选。v0.12、P0、v15、v12、124 题和 AI handoff 的版本事实均为本项目状态，应留在项目记录中；如用户后续明确确认新的跨项目偏好，再按 `MEMORY_SCHEMA.md` 申请写入对应员工记忆。

## v0.12 双输入延续交接增量（2026-10-15）

原“ai产品经理”事项的产品合同已由产品经理续接为[产品延续交接](agent-system-v0.12-continuation-product.md)，软件工程师续接为[工程交接](agent-system-v0.12-continuation-engineering.md)，内容检索工程师补充[职业—教材绑定交接](agent-system-v0.12-continuation-retrieval.md)，测试工程师对当前源码补做[独立续测](app-v0.12-continuation-qa.md)。项目经理收口见[PM记录](agent-system-v0.12-pm.md)。这些文件不覆盖旧版 v0.12 第二轮 43/43 或首轮失败证据。

当前续测发现 `textbooks/v12/c01-selection.md` 与派生索引的 SHA 不一致（正文 `4ee70a19…`，索引声明 `123f00a8…`），`getContentCatalog('textbook-v12')` 安全失败，学习对话、推荐和普通学习查询因此处于 `unavailable`/阻断状态；该缺口由内容数据/教材责任人与内容检索工程师修复后，测试工程师按 Node24 重新复验。当前续测结论为 `not_met`（17 项：10 通过、4 失败、3 证据不足），真实 TCP/浏览器、焦点/IME/窄屏和迟到响应仍无证据。项目整体仍 `not_met`，动态职业无独立检索适配器时必须保持 `unavailable`，不得回退 Agent 教材。

## c01 修复与当前双输入复验（2026-10-15 后续）

内容检索工程师已将当前批准的 `c01-selection.md`（SHA `4ee70a19…`）重建为 canonical corpus `c56def0f…`，30 单元/273 分节，562 条 passage vectors；后端职业快照同步至同一 corpus hash。软件工程师补齐职业卡和学习卡字段展示，当前 QA 绑定 auth `48f6b833…`、learning `00164fb5…`、server `53d0eab…`。

最新独立 QA [app-v0.12-c01-card-fields-qa](app-v0.12-c01-card-fields-qa.md/.json) 在 Node24.16 进程内 handler/临时 SQLite 范围 23/23 通过，结论 `met_with_limitations`。真实 TCP 仍 `insufficient`，浏览器/IME/焦点/窄屏/迟到响应未运行；旧 17 项 `not_met` 续测报告和旧客户端 hash 继续保留，完整项目仍 `not_met`。

随后测试岗位补做真实 TCP 与 Codex IAB 浏览器验证，归档于 [app-v0.12-c01-tcp-browser-qa](app-v0.12-c01-tcp-browser-qa.md/.json)：24 项中 21 项通过、3 项证据不足。真实 TCP 8 项业务子集通过；浏览器职业确认、学习抽屉、焦点回收、普通 Enter/Shift+Enter、来源定位、题外无匹配和约 390/320px 窄屏均有记录。原生 IME composition Enter、读屏顺序/播报与可控迟到响应仍不足；服务已停止，临时数据未触碰正式库。旧 23/23 与更早 10/17 报告继续保留，完整产品仍 `not_met`。
