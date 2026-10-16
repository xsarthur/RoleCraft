# UI/UX 设计教材 v0.1 · 独立交付 QA

日期：2026-10-14（Asia/Shanghai）  
责任岗位：测试工程师  
测试结论：**met_with_limitations（限定于本次静态交付检查）**；完整职业培养、真实学习效果、真人专家认可和就业结果：**not_met**。

本报告在收到版本后先记录文件基线，再核对目录、链接、章节结构、课程规格映射、研究来源 JSON 可解析性、题型 ID、哈希绑定和正文的验证边界。未修改作者正文、研究源或课程规格；未运行浏览器/Figma/读屏/外部 URL、模型、真实用户或付费服务。静态检查不替代内容审校、课程架构复核、用户试读、真人行业专家或岗位证据。

## 收到版本与范围

收到并冻结以下十个文件的字节数和 SHA-256：

| 文件 | 字节 | SHA-256 | 状态 |
| --- | ---: | --- | --- |
| `sites/rolecraft/textbooks/uiux-design-v01/README.md` | 4,064 | `ff2b47e37cf6c3d2ff54f9ae5e0ccfdb172584c2cf043117d9818902be42a622` | received |
| `sites/rolecraft/textbooks/uiux-design-v01/uiux-design-textbook.md` | 34,852 | `80518da47d06fc7f58f42e879269a9e9df01a91dc3e089ebae2340208371dfd0` | received |
| `sites/rolecraft/textbooks/uiux-design-v01/sources-and-interview-map.md` | 6,328 | `2b5b07265fd9a540beaa7eb025a0fea064d33758cc131508f6af2467662ecc0d` | received |
| `sites/rolecraft/textbooks/uiux-design-v01/author-handoff.md` | 4,796 | `d1e15d6b35ca01f6aee51b1897ee0eae78b55339e6df81ede81468a2d26612bd` | received |
| `sites/rolecraft/team/uiux-textbook-course-architecture.md` | 26,444 | `d4efafb8c73ac1864c5befb459e61cee3d9f7a0528faa79ddb33997b1d093cc7` | received |
| `sites/rolecraft/team/uiux-textbook-course-architecture.json` | 21,093 | `00e75abf5b359cc79c90296cb725a54c65d9f09ff57b49def10f0c6c8386a26e` | received |
| `sites/rolecraft/team/uiux-textbook-product-scope.md` | 13,617 | `f4680194e0bd7a458f7320a375cc66bd57dbd83ec6c5ce5815353655e9c0633e` | received |
| `sites/rolecraft/team/uiux-textbook-product-scope.json` | 3,709 | `7af720642b07d23271b68c99265cd8b71470c29f012a521c1824379ccb9be09f` | received |
| `sites/rolecraft/team/uiux-interview-questions-3m-research.md` | 34,551 | `a78c8bf2f574bb2869493d0e37d3b995879ad40f0bfd0b6264f59702d1fee175` | received |
| `sites/rolecraft/team/uiux-interview-questions-3m-research.json` | 86,179 | `0f2df0d9b0c9e179fc5a60de169c6ff2dc6ce837928cc0812038719f416443f8` | received |

检查范围包含 `textbooks/uiux-design-v01/` 的 README、正文、来源映射、作者交接，以及课程架构、产品范围、公开题型研究的 Markdown/JSON 交接源。

## 静态检查结果

| 检查 ID | 检查内容 | 结果 | 证据与限制 |
| --- | --- | --- | --- |
| UXT-QA-01 | 文件存在、版本与范围 | pass | 4 个教材交付文件和 6 个规格/研究交接文件均可读取；README、正文和来源图均标 v0.1。上述基线绑定当前收到状态。 |
| UXT-QA-02 | 本地 Markdown 链接 | pass | 7 个本地链接全部解析到现存文件：README 的正文/来源/交接/课程规格，来源图的研究 Markdown，产品范围的视觉教材和研究 Markdown。外部 URL 未联网复测。 |
| UXT-QA-03 | JSON 可解析性与题型记录 | pass（当前文件） | Python `json.loads` 成功解析课程架构 JSON、产品范围 JSON、面试研究 JSON；研究 JSON `items=103`、`item_id` 唯一 103 个，完整覆盖 `UIUX-3M-001`—`UIUX-3M-103`。 |
| UXT-QA-04 | 版本/哈希绑定 | **partial，见 UXT-F-01** | 当前研究 JSON SHA-256 为 `0f2df0d9b0c9e179fc5a60de169c6ff2dc6ce837928cc0812038719f416443f8`，但课程架构 JSON/Markdown 仍登记旧哈希 `7aa79f...da6b4` 并称第 73 行 JSON 语法错误；当前第 73 行可解析。课程规格登记的 v12 Agent 教材哈希也与当前文件不一致（规格末尾 `...c280e1`，当前为 `...c2801e`）。 |
| UXT-QA-05 | 正文章节标题与活动 | pass（概要范围） | 正文存在连续 `## 1.` 至 `## 12.` 共 12 章；章节包含练习/失败或综合任务，章节 9 使用内联“练习”，章节 12 用综合任务和量规。没有把 12 章误报为 26 个独立单元。 |
| UXT-QA-06 | 章节—课程规格映射 | **partial，见 UXT-F-03** | README 12 章表逐章列出问题、产物和先修，并明确课程规格有 26 单元、当前正文是概要版；尚无独立的可机器复核 `12章→26单元` 反向矩阵，不能据目录推断 26 单元已完整交付。 |
| UXT-QA-07 | 题型 ID 与章节映射 | **partial，见 UXT-F-02/04** | 架构 JSON 的 `question_mapping` 有 103 个 ID，均能在研究 JSON 找到；来源映射表按能力簇列出 77 个唯一 ID（91 次出现），均来自 103 个有效 ID。UI 视觉簇把 `057—061` 后又列 `059、060`，形成重复。来源表是章节级映射，不是正文逐条近邻引用。 |
| UXT-QA-08 | 题型统计和证据口径 | pass（限静态） | 研究 JSON/Markdown 都写明 103 是公开题库/指南逐字去重记录，含语义变体，不是 103 条独立热门真题；S06 的 27 场候选人自述单列且不外推。教材 README、来源映射和架构规格均禁止把样本覆盖解释为市场频率、录用概率或能力认证。 |
| UXT-QA-09 | 目录入口和章节定位 | **partial，见 UXT-F-03** | README 有 12 章表和 4 个文件入口，但表格中的章号不是可点击锚点，正文也没有目录/反向锚点链接；读者仍可用标题搜索定位。 |
| UXT-QA-10 | 正文真实验证声明 | pass（限静态） | README/作者交接明确案例、伪代码、AI 推荐、视觉/a11y、研究与指标均未运行或未取得真实参与者；正文明确不把候选、示意结果、自评或练习写成上线结果、就业证明或 WCAG 合规。未执行代码/原型/浏览器行为验证。 |

## 指定静态反例

| 反例 | 结果 | 证据 |
| --- | --- | --- |
| 公开题库 103 条被写成全国热度、固定真题或录用概率 | 关闭 | 研究文件和来源映射均说明来源类型、语义变体和地域限制；S06 单列。 |
| 教学夹具、AI 响应、指标、用户反馈被写成真实运行结果 | 关闭 | README 第 30、34、42—45 行及作者交接第 31—40 行明确为假设/计划/未运行。 |
| 伪代码、视觉 token、WCAG 检查被写成生产实现或自动合规 | 关闭 | 作者交接区分接口级伪代码与未接 API；来源表要求按目标版本和辅助技术实测。 |
| 12 章概要被写成 26 单元全部交付 | 关闭 | README 第 38 行直接声明当前仅 12 章概要版，26 单元独立深读/夹具/未知任务复验尚未完成。 |

## 开放发现、责任与复验

| ID | 严重度 | 状态 | 发现 | 责任岗位 | 复验条件 |
| --- | --- | --- | --- | --- | --- |
| UXT-F-01 | P1 | open | 课程架构规格记录的研究 JSON 哈希和“第 73 行语法错误”与当前收到文件不一致；规格登记的 v12 输入哈希也有一处不一致。当前 JSON 已可解析，但来源版本链不闭合。 | 竞品研究员/课程架构师 | 明确当前研究 JSON 是否为修复后版本；更新规格输入哈希/状态，或保留旧快照并给新版本独立 ID；重新计算所有绑定。 |
| UXT-F-02 | P2 | open | `sources-and-interview-map.md:34` 在 `UIUX-3M-057—061` 后再次列 `UIUX-3M-059、060`，造成同一能力簇重复计数。 | 竞品研究员/课程架构师 | 去除重复或注明有意强调；重新运行 ID 去重、章节映射和题型计数检查。 |
| UXT-F-03 | P2 | open | README 12 章表没有章节锚点/可点击目录，且没有独立 12→26 单元机器矩阵；章节存在但入口定位和规格反向复核较弱。 | 课程架构师/教材研发员 | 增加每章锚点/目录和受版本绑定的章节—单元矩阵；重新跑本地链接、锚点和映射复验。 |
| UXT-F-04 | P2 | open | 研究 ID 只在来源映射表按能力簇列出，正文没有近邻 `UIUX-3M` 引用标识或反向正文断言矩阵；章节级可追溯存在，逐条正文断言核对成本较高。 | 竞品研究员/课程架构师/教材研发员 | 为依赖市场样本的章节或断言增加来源 ID/反向表，核对所有 ID 仍指向同一冻结研究版本。 |

## 限制与完整目标判断

本轮未进行外部 URL 实时可用性、Figma/浏览器/读屏/键盘/缩放、TypeScript 编译、模型或 API 调用、真实用户研究、学习者陌生任务、真人专家审校、真实岗位反馈、就业或商业结果检查。当前结论只支持“文件与静态交付在限定范围内可审阅，且研究样本边界声明存在”，不支持“教材已证明能让人入行、满足行业先进标准或得到用户/专家认可”。完整产品和职业培养目标继续为 **not_met**。

返修 UXT-F-01—04 后需以新 SHA-256 重新冻结，保留本报告作为收到版本记录；新稿不得直接继承本次静态结论。
