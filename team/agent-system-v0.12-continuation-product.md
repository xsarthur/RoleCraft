# Agent 双输入系统 v0.12 产品延续交接

- **交接版本**：`agent-system-v0.12-continuation-product-2026-10-15`
- **责任岗位**：产品经理（范围、流程、接口合同和验收条件）
- **日期**：2026-10-15（Asia/Shanghai）
- **状态**：`product_contract_reconciled_with_open_dependencies`
- **工作范围**：职业选择输入 `career_input` 与学习内容输入 `learning_input`
- **本文件性质**：对既有 v0.12 产品合同的延续核对和交接补充；不覆盖旧 PRD、UX、工程交接或 QA 历史，不修改应用代码、教材、数据库和用户记录。

## 1. 当前状态判断

原“ai产品经理”事项已经完成了主要产品合同，但尚未完成当前版本的产品收口。既有 [Agent 双输入 PRD](agent-system-v0.12-prd.md)、[UX 交接](agent-system-v0.12-ux.md)、[后端交接](agent-system-v0.12-backend.md) 和 [客户端修复交接](agent-system-v0.12-frontend-repair.md) 对两个入口的对象、状态、确认边界、来源绑定和旧路由兼容约定是一致的。`agent-system-v0.12-qa.md/.json` 的第二轮证据为 43/43 项通过、`met_within_scope`，但证据是 Node 24.16 进程内 HTTP handler + 临时 SQLite；真实 TCP、浏览器焦点/滚动、中文输入法、响应式布局和迟到响应尚未验证。首轮失败 `agent-system-v0.12-qa-r1.json` 仍保留，不能覆盖。

当前项目交接已把运行时增量基线推进到 `local-workbench-0.15-p0`，而 v0.12 请求协议仍发送并校验 `workbenchVersion=local-workbench-0.11`。这不是可忽略的命名差异：它需要被定义为“运行时发布版本”和“Agent 请求兼容协议标识”两层身份。当前工程源码和服务确实使用这两个不同值；本交接冻结该兼容解释，直到另行批准协议版本迁移，避免客户端自行把 `0.15-p0` 填进当前服务会拒绝的协议字段。

因此，本轮产品结论是：**两个入口的产品范围、交互流程、字段协议和任务拆分已经可交接；当前版本仍为限定范围完成，未完成真实 HTTP/浏览器复验、重启后幂等证据、动态职业教材范围和 A1 路线呈现决策，完整职造产品仍 `not_met`。**

## 2. 已完成且保持不变的产品合同

### 2.1 职业选择输入

- 输入只探索已发布职业目录，返回 1–3 个候选；候选必须有 `careerId`、标题、匹配理由、可核对的教材/索引快照和真实 `matchSource`。
- `React` 等多义输入返回 `needs_clarification`，选项明确区分 Agent ReAct 与前端 React；系统不能替用户选定职业。
- `recommended`、目录浏览和“查看路径”均不写账户；只有用户明确点击“确认选择”并得到成功响应，才允许进入 `POST /api/agent/career/confirm` 或兼容的既有职业选择写入。
- 确认必须携带推荐请求 ID、版本快照和新的幂等键；服务端重新核对 `published`、教材版本、索引版本、教材版本 ID 和 corpus hash。取消、关闭、换候选和版本冲突均不得改变当前职业。
- 没有独立教材 corpus 的动态职业必须返回 `unavailable`/`career_content_unavailable`，不能回退到 Agent 开发者教材。

### 2.2 学习内容输入

- 输入只消费当前职业绑定的公开教材索引和原文，支持定位、解释、比较、规划、复习和下一步练习；不生成教材外答案、不改教材、不自动写学习记录或能力字段。
- 每个肯定结果都必须绑定当前 `contentVersion`、`textbookVersionId`、`corpusHash`、`indexVersion`、`unitId`、`sectionId`、逐字摘录、来源 SHA 和稳定 `href`。客户端不得补写服务未提供的字段。
- `useCurrentContext` 默认 `false`；只有用户主动开启当前章节后才发送章节位置。未开启却携带章节位置必须被拒绝。
- `needs_clarification`、`no_match`、`unavailable`、`invalid_input`、`stale_version` 和 `anchor_unavailable` 仍是诚实状态；规则降级必须明确标记实际 `engineMode`，不能伪装成语义模型或外部供应商回答。
- `related_uncovered` 与 `unrelated` 可以在视觉上共享“无匹配”容器，但原始子状态、限制和改写建议必须在响应/诊断中保留，测试不能只核一个空结果。

### 2.3 共同边界

- 两个入口各自保存输入、上下文快照、请求 ID、状态和历史卡；新请求只取消同一入口在途请求，迟到响应不得覆盖另一个入口、当前职业或当前阅读位置。
- `providerCalled=false` 只在服务真实未调用供应商时使用；当前版本禁止付费模型、外部网络、上传、发布和外部联系。
- “继续学习”唯一主入口属于 `local-workbench-0.15-p0` 的阅读位置呈现，不等于 `product-learning-optimization-scope-v2.md` 中尚待产品/设计决定的 A1 路线图。A1-00 未决定前，不新增路线状态字段，不把 P0 三态卡写成路线图采用。

## 3. 入口、接口和责任一致性核对

| 入口/接口 | 产品对象与确认动作 | 当前实现交接 | 产品判断 | 尚未收口的独立证据 |
|---|---|---|---|---|
| `career_input` → `POST /api/agent/career/recommend` | 目录候选；推荐不写入 | `auth-career-v15.js` 已接入；后端只读 published 目录、返回快照 | 与 CAR-01..06、AGP-02 一致 | 真实 TCP 状态码/headers、浏览器对话框焦点和中文输入法 |
| `career_input` → `POST /api/agent/career/confirm` | 明确确认后写当前职业；必须快照/幂等 | 后端复用 `switchCareer`；客户端只从确认动作调用 | 与 CAR-07/08、AGP-03 一致 | 跨服务重启幂等恢复；真实账户浏览器写入复验 |
| `learning_input` → `POST /api/agent/learning/query` | 当前教材定位/解释/计划；打开真实小节 | `learning-workbench.js` 已优先调用；保留旧 `/api/content/dialog` 适配 | 与 LRN-01..09、AGP-04..06 一致 | 真实 HTTP；抽屉定位、焦点回收、迟到时序和窄屏证据 |
| 旧 `/api/careers?q`、`/api/content/recommend`、`/api/content/dialog` | 只作兼容适配，不补造新字段 | 后端和客户端均保留 | 兼容边界正确 | 需在当前 `0.15-p0` 运行版重新复验，而非只引用旧 QA |
| 当前工作台身份 | `VERSION=local-workbench-0.15-p0`；协议字段仍 `workbenchVersion=local-workbench-0.11` | 当前服务严格校验后者；客户端 career/learning 请求都发送后者 | **冻结为双层版本解释**，不得单方面改字段 | 新版本绑定记录需同时记录两个版本；若要迁移，另开产品版本和 QA |

## 4. 原任务最后未收口项

1. **当前版本复验没有完成**：v0.12 QA 通过的是进程内 handler；P0 和 v15 工程交接也没有替代测试岗位的真实 HTTP/浏览器证据。
2. **跨重启幂等尚未证明**：职业确认幂等键目前由服务进程内 map 保存；同进程重复请求已核，重启后恢复没有证据。该项由后端数据工程师实现或明确列为版本不支持，并由测试工程师复验。
3. **动态职业内容范围未闭合**：职业目录可以有多个已发布职业，但没有独立教材 corpus 时必须保持 `unavailable`。内容检索工程师需要交目录—教材版本能力矩阵，不得把“目录可检索”误写成“教材可学习”。
4. **A1-00 未决**：是否采用路线图、要解决的用户任务、允许信息量和最小状态集合仍由产品经理与设计师共同决定；在决定前，设计/编辑/客户端不得制作或实现路线状态图。
5. **当前运行版交接未统一**：需由客户端岗位确认 `local-workbench-0.15-p0` 只作为运行时版本显示/绑定，协议请求继续使用 `local-workbench-0.11`，并在新证据中同时记录，避免旧协议字段与新运行版被误判为错配。
6. **项目经理收口记录缺失**：PRD 指定的 `agent-system-v0.12-pm.md` 尚未在现有目录发现；本文件只完成产品侧延续交接，不代替项目经理的调用、依赖、证据和整体复盘记录。

## 5. 延续任务拆分与交接

| 新任务 ID | 责任岗位 | 输入/依赖 | 交付物 | 产品验收条件 |
|---|---|---|---|---|
| `CONT-PM-01` | 产品经理 | 本文件、v0.12 PRD/UX、P0 与 v15 交接 | 双层版本口径、入口范围和开放项冻结 | 客户端、后端、检索、设计、QA 引用同一口径；本文件已完成 |
| `CONT-FE-01` | 软件工程师 | `auth-career-v15.js`、`learning-workbench.js`、本文件第 3 节 | 当前 `0.15-p0` 运行版的双入口绑定说明/必要局部修复 | 两入口请求保留 `workbenchVersion=0.11` 协议值，同时在运行版证据中标 `0.15-p0`；确认前不写入；学习结果不改记录 |
| `CONT-RET-01` | 内容检索工程师 | 职业目录、各 corpus manifest、v0.12 检索合同 | 职业→教材版本能力矩阵及动态职业 `unavailable` 样例 | 无独立 corpus 的职业绝不回退 Agent 教材；版本/hash/来源字段由服务返回 |
| `CONT-BE-01` | 后端数据工程师 | 确认路由、幂等键存储、现有 profile API | 跨重启幂等支持或明确不支持的版本声明 | 同一幂等键跨进程重启仍只产生一次写入；冲突键返回 409；不改旧 profile 字段合同 |
| `CONT-DES-01` | 设计师 | v0.12 UX、P0 设计复盘、本文件状态映射 | 两入口当前运行版状态稿（桌面/390/320、焦点和 IME） | 职业确认与学习定位动作分离；无匹配与不可用可视区分；不把 A1 路线图当作已采用 |
| `CONT-QA-01` | 测试工程师 | 所有新版本源、隔离数据库、当前服务 | 真实 HTTP/UI 独立报告及版本绑定 | 桌面/390/320、键盘/读屏/中文 IME、迟到响应、职业确认/取消/冲突、学习定位/刷新/后退全部留证；失败返修后复验 |
| `CONT-PM-02` | 项目经理 | `CONT-*` 全部报告 | `agent-system-v0.12-pm.md` 与 R 本轮复盘 | 明确限定通过、开放缺口、责任人、复验方式和整体 `not_met`；不以本文件替代独立 QA |

## 6. 当前版本验收合同补充

以下条件是 v0.12 在当前 `0.15-p0` 运行版可称为“限定接入交付”的必要条件；它们不提升为完整产品或职业能力结论：

- **CONT-01 版本双绑定**：每份请求/响应/截图/日志同时记录运行时 `local-workbench-0.15-p0` 与协议 `workbenchVersion=local-workbench-0.11`；服务拒绝未知协议值时不得由客户端静默重试或改写。
- **CONT-02 职业写入边界**：推荐、澄清、查看路径和取消前后账户职业快照相同；只有明确确认成功后变化，且变化可由既有 `profile/career` 语义解释。
- **CONT-03 学习来源边界**：推荐、解释和计划卡逐项可回到当前教材正文；动态职业无 corpus 时只显示 `unavailable`；历史 v10 不替代当前 v12。
- **CONT-04 状态可区分**：`recommended`、`needs_clarification`、`no_match`、`unavailable`、`invalid_input` 和版本/锚点失配在接口、视觉文字和恢复动作中可区分；`related_uncovered`/`unrelated` 的原因不丢失。
- **CONT-05 并发与恢复**：两个入口相互隔离；同一入口新请求丢弃迟到响应；关闭/收起不清空输入；确认幂等和版本冲突可复现。
- **CONT-06 范围声明**：新报告必须明确真实浏览器、真实学习效果、真人专家、职业胜任、行业先进性、生产部署和经济性仍不由本版证明。

## 7. 证据与整体结论

本次核对使用：

- `agent-system-v0.12-prd.md` SHA `985655a4fee90c795f4c5c83b52145a8b5733ec1ee09335c5b3158a7ea9bfd04`；
- `agent-system-v0.12-ux.md` SHA `ba87321b74ea03e855026264fe6a556f28a8ae8ee76f67abc41727a878ce1777`；
- `agent-system-v0.12-qa.md/.json`：第二轮 `43/43`，`met_within_scope`，Node `v24.16.0`，进程内 HTTP + 临时 SQLite，浏览器 `not_run`；
- `app-p0-frontend-implementation.md` 与 `app-p0-qa.md`：`local-workbench-0.15-p0` 的 P0 交接和静态/隔离 VM `met_within_scope`，真实浏览器/HTTP `insufficient`；
- `app-v15-auth-career-implementation.md`：本地登录、多职业、职业检索与确认工程交接；不是 v0.12 的独立 QA；
- `project-handoff-2026-10-15.md`、`product-learning-optimization-scope-v2.md`、`design-product-review-2026-10-15.md`：当前开放依赖和 A1-00 约束。

产品侧延续交接完成，产品合同状态为 `reconciled_with_open_dependencies`。当前两个入口可以交给各责任岗位继续执行；不能写成真实浏览器已通过、动态职业教材已齐全、跨重启幂等已证明或完整职造产品已达标。项目整体仍为 `not_met`，由项目经理在 `CONT-PM-02` 收集后续独立报告并复盘。
