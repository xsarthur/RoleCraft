# Agent 双输入系统 v0.12 项目经理收口记录

- **版本**：`agent-system-v0.12-continuation-pm-2026-10-15`
- **日期**：2026-10-15（Asia/Shanghai）
- **责任岗位**：项目经理（范围、依赖、交接、状态与复盘）
- **范围**：职业选择输入 `career_input`、学习内容输入 `learning_input`
- **当前结论**：`coordination_closed_with_open_dependencies`
- **完整产品结论**：`not_met`

## 原事项与本轮判断

原“ai产品经理”事项的核心产品合同已经存在：PRD、UX、后端接口、客户端修复交接和第二轮独立 QA 均已落盘。本轮确认原事项最后未收口的是项目级延续交接，而不是重新设计两个 Agent。产品经理交付的延续记录确认，两个入口的范围、状态、确认边界、来源绑定和旧路由兼容一致；软件工程师交付的续接记录进一步核对当前源码，发现历史限定 QA 不能直接覆盖当前字节。

本轮没有重置、覆盖或删除旧 PRD、UX、工程交接、首轮失败 QA、教材、数据库、用户记录或历史复盘。没有上传、发布、外部联系或付费模型调用。

## 实际岗位调用与交接

| 岗位 | 实际交付 | 当前判断 |
|---|---|---|
| 产品经理 | `agent-system-v0.12-continuation-product.md`：双层版本口径、开放项、CONT-01..06、CONT-FE/RET/BE/DES/QA/PM 任务拆分 | 产品合同已重新对齐；开放项保留 |
| 软件工程师 | `agent-system-v0.12-continuation-engineering.md`：当前源码哈希、入口实现、接口消费、字段缺口与工程依赖 | 核心链路已实现；当前源码需重新冻结和复验 |
| 后端数据工程师 | 既有 `agent-system-v0.12-backend.md` 与 `server/index.mjs` | 推荐、确认、学习查询路由和写入边界已交接；跨重启幂等未证 |
| 内容检索工程师 | `agent-system-v0.12-continuation-retrieval.md`：职业→教材能力矩阵、动态职业 `unavailable` 边界和当前 corpus 来源核对 | 已发现 `c01-selection` 源—索引失配；不得把目录存在写成教材已覆盖 |
| 设计师 | 既有 `agent-system-v0.12-ux.md`、状态 SVG；本轮按 CONT-DES-01 继续提供当前运行版状态稿 | 视觉稿和状态合同已有；当前版本桌面/窄屏/IME 仍待实现后独立验收 |
| 测试工程师 | 既有 `agent-system-v0.12-qa.md/.json` 第二轮 43/43；工程续接子代理正在对当前源码做独立核对 | 历史结论仅限旧绑定；当前版真实 HTTP/UI 证据未收口 |
| 项目经理 | 本文件及 `RETROSPECTIVES.md` 本轮记录 | 维护依赖、差距、责任和复验，不代写实现或代验收 |

检索专项随后完成并落盘为 `agent-system-v0.12-continuation-retrieval.md`；当前默认运行库只有 `agent-developer` 一个 `published` 职业。该专项发现当前 `textbook-v12` 的 `c01-selection` 正文与派生索引确实失配：索引 SHA `123f00a89c54dc0e0b18f7752ec5dcb443bf5490c8388068d38b1e7b421b7cd4`，当前正文 SHA `4ee70a19c07d14a550ff9f1fbcfb46ec26a3e236aef30b5d3f2b1ce3f190d982`，`getContentCatalog('textbook-v12')` 安全失败。因此学习查询当前不能称为成功，修复责任属于内容数据/教材责任人与检索岗位，不能由客户端绕过来源核验。

## 当前源与历史证据边界

当前工作区收到的关键源哈希：

| 文件 | 当前 SHA-256 | 说明 |
|---|---|---|
| `dist/auth-career-v15.js` | `119ee8cacf91587065e52d23e476c0ceab05a3d30017a93212c859ebbfa03cf6` | 职业入口与确认客户端 |
| `dist/learning-workbench.js` | `24d1963aa5737b825d4b718767960c359b7ef67050b2aba472dc0dee1a01e0d2` | 当前学习输入客户端 |
| `dist/learning-workbench.css` | `e158928612de4763a1d87434e770311556c7e043fa1b1ac9d0c501e8bab2a1b5` | 当前抽屉与状态样式 |
| `server/index.mjs` | `cbd88d07a1f1c6a25706b7daed1d1878de4da8c81517315d25463b41e90f5154` | 当前 Agent 路由服务 |

历史 P0 QA 收到的 `learning-workbench.js` SHA 为 `0f55ffd8…`，与当前 `24d1963a…` 不同。因此 P0 的 `met_within_scope` 只证明旧冻结字节的静态/隔离 VM 范围，不能被写成当前源码已通过。v0.12 第二轮 43/43 同样只证明其报告绑定的版本和进程内 handler，不替代当前真实 TCP、浏览器或当前字节的独立 QA。

运行时版本采用双层解释：当前运行版为 `local-workbench-0.15-p0`，v0.12 请求协议继续使用服务已冻结的 `workbenchVersion=local-workbench-0.11`。在另行批准协议迁移前，客户端不得自行把运行版写入协议字段；新证据必须同时记录两层身份。

## 当前已确认范围

- 职业入口已实现推荐、React 澄清、published 候选、版本快照、确认前不写入、确认后的幂等与旧路由回退。
- 学习入口已实现显式当前章节开关、`/api/agent/learning/query` 优先调用、来源/原文/hash 校验、加载/无匹配/失败/规则降级状态和迟到响应隔离。
- 后端保留既有 `/api/careers`、`/api/content/recommend`、`/api/content/dialog`、`GET/PUT /api/profile/career`；推荐和学习查询不写账户或学习记录。
- 动态职业没有独立教材 corpus 时服务应返回 `unavailable`/`career_content_unavailable`，不得回退到 Agent 教材。
- A1-00 路线图是否采用、信息量和状态集合仍由产品经理与设计师决定；P0“继续学习”三态不等于路线图已采用。

## 当前开放缺口、责任与复验

| 缺口 | 责任人 | 复验条件 | 状态 |
|---|---|---|---|
| 当前源码重新冻结并绑定运行版/协议版 | 软件工程师 + PM | 记录四份当前源 SHA，客户端/服务/QA同一绑定 | `open` |
| `textbook-v12` 当前源与派生索引失配 | 内容数据/教材责任人 + 内容检索工程师 | 决定批准正文版本；重建索引/向量并由 QA 重核 30 单元、manifest、来源和对话样例；保留历史 hash | `blocked` |
| 职业卡缺 `gaps`、`matchedSignals`、只读 `compare/browse_content` 展示 | 产品经理→设计师→软件工程师 | 先冻结字段层级，再按服务返回字段实现，确认前不写入 | `open` |
| 学习卡未完整呈现 `indexVersion`、`corpusHash` | 产品经理→设计师→软件工程师 | 主卡/详情层级定稿，版本与 hash 均来自服务并可核对 | `open` |
| 动态职业→教材能力矩阵 | 内容检索工程师 | 无 corpus 的职业在接口和 UI 均保持 `unavailable`，不回退 | `open` |
| 跨重启幂等 | 后端数据工程师 | 重启服务后同幂等键只产生一次写入，冲突键 409 | `open` |
| 当前版本真实 HTTP/UI | 测试工程师 | 真实 socket、桌面/390/320、焦点/IME/迟到响应、职业确认/学习定位 | `open` |
| A1-00 路线图决定 | 产品经理 + 设计师 | 书面决定采用或暂不采用；决定前不加路线状态字段 | `open` |

## 复盘与整体判断

本轮完成了原事项所缺的项目级产品—工程—检索—设计—测试协调绑定，明确了当前源码与历史 QA 的版本边界，并把剩余工作拆到唯一责任岗位。局部实现仍可称为双输入 Agent 的候选接入，产品合同处于 `reconciled_with_open_dependencies`；当前版本尚不能称真实 HTTP/UI 已通过，也不能据此证明职业胜任、真实学习效果、真人专家审核、行业先进性、生产交付或运营经济性。

续测独立 QA `app-v0.12-continuation-qa.md/.json` 针对当前源码得到 `not_met`（17 项中 10 项通过、4 项失败、3 项证据不足）：职业推荐/澄清/确认边界通过，但教材目录、对话、推荐和学习查询被上述 c01 来源失配阻断；真实 TCP、浏览器和 Node24 运行证据仍不足。该报告不覆盖历史 43/43，反而冻结了当前版本的新缺口。

整体八门槛继续为：`real_generation=fail`、`reliable_delivery=fail`，`user_value`、`teaching_quality`、`comparative_advantage`、`learner_creation`、`operating_economics=insufficient`，仅已有改进轨迹在其限定范围内保持 `pass`。任何新产物完成后都必须按当前版本重新独立 QA，并把失败、修复和复验分别记录。

## c01 与卡片字段修复复验增量

用户随后明确授权先修复 c01 失配并补齐卡片字段。本轮由内容检索工程师重建 canonical `textbook-v12` 派生包，由后端数据工程师同步职业快照 corpus hash，由软件工程师补齐职业卡/学习卡展示，再由测试工程师独立以 Node `v24.16.0` 复验当前字节。

修复结果：c01 正文与索引均为 `4ee70a19…`；canonical corpus hash 为 `c56def0f…`；30 单元、273 分节；passage vectors 562 条，向量 corpus hash 与索引一致。旧 index、vectors、派生数据、assembly manifest 和旧 QA 已复制到 `team/app-v0.12-c01-retrieval-repair-history/received/`，历史身份保留。

职业卡现在展示服务提供的 `matchedSignals`、`gaps`、教材/索引/教材身份/语料 hash，以及只读 `browse_content`/`compare` 状态；学习卡展示教材身份、索引版本、corpus hash、source hash 和稳定定位。客户端最终 QA 绑定为 auth `48f6b833…`、learning `00164fb5…`；早先客户端交接中的 `160d267b…` 与中间观察字节均作为历史证据保留，未冒充当前 QA 绑定。

独立 QA `app-v0.12-c01-card-fields-qa.md/.json`：23/23 通过，`met_within_limitations`。覆盖 catalog hash、Node24 readiness、职业推荐/澄清/no_match/确认/幂等/版本冲突、学习澄清/no_match/来源摘录/普通查询/context opt-in/旧路由/动态职业 unavailable、两类卡片字段和协议版本。真实 TCP 为 `insufficient`，浏览器、IME、焦点、窄屏和迟到响应未运行；完整产品仍 `not_met`。

本轮新增 c01 失配已关闭于限定范围；剩余真实 HTTP/UI、跨重启幂等、动态职业检索适配和完整产品八门槛继续开放，必须由对应岗位在当前版本重新复验。

## 真实 TCP 与浏览器补测增量

测试岗位随后在 Node `v24.16.0`、隔离临时 SQLite 和真实 socket 上补做业务请求，并通过 Codex IAB 打开 `http://127.0.0.1:4391/#home` 完成浏览器操作。归档记录见 `app-v0.12-c01-tcp-browser-qa.md/.json`。真实 TCP 子集覆盖首页、注册、职业推荐/澄清/确认/幂等、学习查询、章节上下文和版本快照；浏览器覆盖职业确认边界、学习抽屉开收与 launcher 焦点回收、普通 Enter/Shift+Enter、来源定位和题外无匹配。

本轮补测共 24 项，21 项通过、3 项证据不足、0 项失败。390/320px 窄屏已观察到结构可操作；原生中文 IME composition Enter、完整读屏顺序/播报和可控迟到网络响应仍为 `insufficient`。该补测不覆盖原 23/23 限定报告，也不把已观察的浏览器子集扩大为完整 UI 通过；完整产品仍 `not_met`。

