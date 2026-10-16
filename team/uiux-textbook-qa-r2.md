# UI/UX 设计教材 v0.1 · 独立交付 QA（v2 复验）

日期：2026-10-14（Asia/Shanghai）  
责任岗位：测试工程师  
测试结论：**met_with_limitations（仅限本次静态 v2 交付检查）**；完整职业培养、真实学习效果、真人专家认可和就业结果：**not_met**。

本轮重新读取 v2 当前目录和修复后的研究 JSON，先冻结新基线，再独立核对本地链接、26 单元映射、章节标题、来源 ID、JSON、SVG/XML、状态契约字符串与未验证声明。没有继承上一轮 baseline 或结论；未修改正文、研究源、规格或资产，未进行浏览器/Figma/读屏/真实用户/外部 URL/模型调用。静态检查不替代内容审校、设计师复核、真人试读、专家评价或岗位证据。

## 当前 v2 基线（先于检查）

以下 12 个文件是本轮重新收到版本：

| 文件 | 字节 | SHA-256 | 状态 |
| --- | ---: | --- | --- |
| `sites/rolecraft/textbooks/uiux-design-v01/README.md` | 6,332 | `d58bd229fe2c6a89064a9eb3d44502e4ba94ac320f006207fc44cd3a60d93ff7` | received |
| `sites/rolecraft/textbooks/uiux-design-v01/uiux-design-textbook.md` | 37,512 | `a5406a6db125c3174af7d6228d0fcd57c9030131c4bc321325abf483278ccbd4` | received |
| `sites/rolecraft/textbooks/uiux-design-v01/sources-and-interview-map.md` | 6,586 | `5bf979843e2e97e743afad840becca1cd9dca44f828c7f25d00d3a57428c1229` | received |
| `sites/rolecraft/textbooks/uiux-design-v01/author-handoff-v2.md` | 3,982 | `ebb98b401e4a9df3008e7ae262683d9e67d91fb51a96676c3bda1d09c063fa43` | received |
| `sites/rolecraft/textbooks/uiux-design-v01/author-handoff-v1.md` | 4,796 | `d1e15d6b35ca01f6aee51b1897ee0eae78b55339e6df81ede81468a2d26612bd` | received |
| `sites/rolecraft/textbooks/uiux-design-v01/assets/uiux-state-map-v01.svg` | 4,609 | `97ea6a67ed5ac29ba5f244ff9e35b1392a38486c13d1986c436230fd343b1254` | received |
| `sites/rolecraft/team/uiux-interview-questions-3m-research-fix.md` | 766 | `aaf1c5280a6bd6c29095451e45ffb444b5a8d67c7035ba3ebeaacf195190d258` | received |
| `sites/rolecraft/team/uiux-interview-questions-3m-research.json` | 86,179 | `0f2df0d9b0c9e179fc5a60de169c6ff2dc6ce837928cc0812038719f416443f8` | received |
| `sites/rolecraft/team/uiux-textbook-course-architecture.md` | 26,444 | `d4efafb8c73ac1864c5befb459e61cee3d9f7a0528faa79ddb33997b1d093cc7` | received |
| `sites/rolecraft/team/uiux-textbook-course-architecture.json` | 21,093 | `00e75abf5b359cc79c90296cb725a54c65d9f09ff57b49def10f0c6c8386a26e` | received |
| `sites/rolecraft/team/uiux-textbook-product-scope.md` | 13,617 | `f4680194e0bd7a458f7320a375cc66bd57dbd83ec6c5ce5815353655e9c0633e` | received |
| `sites/rolecraft/team/uiux-textbook-product-scope.json` | 3,709 | `7af720642b07d23271b68c99265cd8b71470c29f012a521c1824379ccb9be09f` | received |

研究修复记录声明原始哈希为 `7aa79f...da6b4`、修复后哈希为 `0f2df...6443f8`；当前研究 JSON 的实际哈希与修复后记录一致。

## 静态复验结果

| 检查 ID | 检查内容 | 结果 | 证据与限制 |
| --- | --- | --- | --- |
| R2-QA-01 | v2 文件与新基线 | pass | 12 个当前教材/规格/研究文件可读取并已在本报告前冻结 SHA-256；未继承旧 QA baseline。 |
| R2-QA-02 | 本地 Markdown 链接与资产入口 | pass | 7 个本地链接全部存在：README 的正文、来源、v1/v2 交接、课程规格和 SVG，来源图的研究 Markdown；外部 URL 未联网复测。 |
| R2-QA-03 | 12 章标题与目录行 | pass（静态） | README 有 12 行路线，正文有连续 `## 1.`—`## 12.` 共 12 个标题；路线短题与正文扩展标题语义对应。 |
| R2-QA-04 | 26 单元入口、标题/先修与规格映射 | **partial，见 R2-F-01** | README 00—25 共 26 行，ID 全集与课程规格 26 个 `reading_order` 对齐；24、25 单元先修与架构 JSON 不一致。标题以架构 JSON 为规范标题，README 使用入口/问题描述。 |
| R2-QA-05 | 研究 JSON 可解析与来源 ID 唯一 | pass（当前文件） | Python `json.loads` 成功；研究 `items=103`、`item_id` 103 个且唯一，覆盖 `UIUX-3M-001`—`103`；映射表 9 个能力簇共 89 次引用、77 个唯一有效 ID，各行无重复。相同题型跨能力簇重复出现是交叉训练映射，不是研究源重复。 |
| R2-QA-06 | 修复后 JSON 来源绑定 | **partial，见 R2-F-02** | 修复记录哈希与当前 JSON 一致，S01—S05 可定位；课程架构规格仍保留旧研究 JSON 哈希与“第73行语法错误”说明，规格输入链尚未更新。 |
| R2-QA-07 | 状态视觉 SVG 存在与 XML | pass（限结构） | SVG 可由 `ElementTree` 解析；根元素有 `viewBox=0 0 1200 530`、`title`、`desc`、`aria-labelledby`，文本包含输入、检索中、来源结果、低置信/澄清、无匹配/不可用、来源失配、人工接管和重新提交，并写明未连接真实服务。未做浏览器/屏幕阅读器视觉 QA。 |
| R2-QA-08 | 正文状态契约字符串 | pass（静态） | TypeScript 伪代码含 idle/pending/clarify/low_confidence/result/empty/unavailable/integrity_error/cancelled、`queryId`、`sourceVersion`、`sectionId`、`retryCount`、`ignoreLateResponses`；正文状态表/组件状态说明含对应低置信、取消、来源核对与旧响应处理。未编译或接 API。 |
| R2-QA-09 | 未验证与真实结果边界 | pass（限静态） | README、v2 交接和正文均明确教学假设、静态 SVG、伪代码、研究/指标/AI 推荐未实际运行；不声称模型、生产、用户理解、WCAG 合规或就业结果。 |

## 指定反例复验

| 反例 | 结果 | 证据 |
| --- | --- | --- |
| 旧研究 JSON 语法错误仍被当作当前文件失败 | 关闭（当前文件） | 修复记录给出原/修复哈希；当前 JSON 成功解析且 103 条记录完整。课程规格陈旧说明另列 R2-F-02。 |
| 12 章被声称为 26 单元完整深读 | 关闭 | README 和 v2 交接明确 26 行是入口映射，部分为“概要”，正文仍为 12 章概要版。 |
| AI 状态把低置信/取消/迟到结果伪装为成功 | 关闭（静态） | 第3/4/6章统一 `low_confidence`、`cancelled`/忽略迟到、重试计数、来源失配和人工核验路径。 |
| SVG 被写成应用实现或视觉验收 | 关闭（声明范围） | README 与 SVG desc 都说是教学静态稿/未连接真实服务；v2 交接保留浏览器、读屏、设备 QA 未完成。 |
| 公开题型 103 条写成全国频率/录用证据 | 关闭 | 来源图、v2 交接和 README 继续区分公开题型与 S06 单人样本，禁止外推。 |

## 开放发现、责任与复验

| ID | 严重度 | 状态 | 发现 | 责任岗位 | 复验条件 |
| --- | --- | --- | --- | --- | --- |
| R2-F-01 | P1 | open | README 单元 24 先修列 `10、13、18、20、23`，架构 JSON 为 `10、13、18、20、21、23`；单元 25 列 `22、23、24`，架构 JSON 为 `23、24`。26 单元入口存在，但先修映射不完全一致。 | 课程架构师/教材研发员 | 决定哪份先修为规范，修正另一份，重算 26 行逐项映射与入口哈希。 |
| R2-F-02 | P2 | open | `uiux-textbook-course-architecture.md/.json` 仍登记研究 JSON 旧哈希 `7aa79f...da6b4` 并称第 73 行有语法错误；当前修复后 JSON 哈希为 `0f2df...6443f8` 且可解析。修复记录本身已闭合，但规格 provenance 未同步。 | 竞品研究员/课程架构师 | 更新规格输入哈希与状态，或保留旧快照并给修复版独立引用；重新冻结规格绑定。 |

## 限制与完整目标判断

- 本轮只完成静态文件、链接、章节/单元表、JSON、来源 ID、SVG/XML 和文本契约检查；没有编译 TypeScript、运行浏览器/Figma、做屏幕阅读器/键盘/缩放/对比度测试。
- 没有运行模型、检索、外部 API、用户研究、学习者陌生任务、真人专家审校、生产发布或求职验证；来源外链未联网复测。
- 因此本轮支持“v2 文件在限定静态范围内基本可交付，研究修复后 JSON 可读，状态视觉稿和契约可定位”，不支持“教材已证明用户能理解、能就业、符合 WCAG 或达到行业先进水平”。完整培养目标仍 **not_met**。

修复 R2-F-01—02 后需对新文件重新冻结 SHA-256 并独立复验；不能把本轮结论自动继承给新稿。
