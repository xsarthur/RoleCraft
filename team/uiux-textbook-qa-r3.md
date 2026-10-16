# UI/UX 设计教材 v0.1 · 独立交付 QA（r3 最终窄复验）

日期：2026-10-14（Asia/Shanghai）  
责任岗位：测试工程师  
测试结论：**met_with_limitations（仅限本次静态 r3 交付检查）**；完整职业培养、真实学习效果、真人专家认可和就业结果：**not_met**。

本轮重新冻结当前教材目录、canonical 课程架构 Markdown/JSON、修复后的研究 JSON 和作者 v3。复验 R2-F-01（26 单元先修）与 R2-F-02（研究 JSON provenance），并重跑关键静态项；不继承 r2 baseline 或结论。没有修改任何源文件、正文或规格，未运行浏览器/Figma/读屏/真实用户/外部 URL/模型/API。

## 当前 r3 基线（先于检查）

| 文件 | 字节 | SHA-256 | 状态 |
| --- | ---: | --- | --- |
| `sites/rolecraft/textbooks/uiux-design-v01/README.md` | 6,377 | `d19cd6678fd094822330d98f2801c40371a1010df4e8e7dee4ea1f5a3324def8` | received |
| `sites/rolecraft/textbooks/uiux-design-v01/uiux-design-textbook.md` | 37,512 | `a5406a6db125c3174af7d6228d0fcd57c9030131c4bc321325abf483278ccbd4` | received |
| `sites/rolecraft/textbooks/uiux-design-v01/sources-and-interview-map.md` | 6,586 | `5bf979843e2e97e743afad840becca1cd9dca44f828c7f25d00d3a57428c1229` | received |
| `sites/rolecraft/textbooks/uiux-design-v01/author-handoff-v3.md` | 1,442 | `c33a9e31f82c10cdceb5f97fbae56643ba62664471c92f1cb8e5dac3db516b7d` | received |
| `sites/rolecraft/textbooks/uiux-design-v01/assets/uiux-state-map-v01.svg` | 4,609 | `97ea6a67ed5ac29ba5f244ff9e35b1392a38486c13d1986c436230fd343b1254` | received |
| `sites/rolecraft/team/uiux-textbook-course-architecture.md` | 28,095 | `a1702312c6f526a8ad00decdc9a6b32e44f453e003032503858803272281ada5` | received |
| `sites/rolecraft/team/uiux-textbook-course-architecture.json` | 23,546 | `3eca639d9d7a8408686b0cfd19e185ec3fe9a68c6ca02e1d074932ba46b5dbc1` | received |
| `sites/rolecraft/team/uiux-interview-questions-3m-research.json` | 86,179 | `0f2df0d9b0c9e179fc5a60de169c6ff2dc6ce837928cc0812038719f416443f8` | received |
| `sites/rolecraft/team/uiux-interview-questions-3m-research-fix.md` | 766 | `aaf1c5280a6bd6c29095451e45ffb444b5a8d67c7035ba3ebeaacf195190d258` | received |

## 静态复验结果

| 检查 ID | 检查内容 | 结果 | 证据与限制 |
| --- | --- | --- | --- |
| R3-QA-01 | 新基线与范围 | pass | 9 个当前教材/规格/研究文件重新冻结，未复用 r2 baseline；canonical 课程架构为 v0.1-r3。 |
| R3-QA-02 | R2-F-01：26 单元先修闭合 | **closed** | README 00—25 共 26 行，ID 全集与 canonical `reading_order` 对齐；26 行先修逐项一致（含单元 24 的 21、单元 25 的 23、24）。 |
| R3-QA-03 | R2-F-02：研究 JSON provenance 闭合 | **closed** | canonical 架构 JSON/Markdown 顶层绑定 `0f2df0d9…6443f8`，与当前研究 JSON SHA-256 一致；旧 `7aa79f…da6b4` 与语法错误被明确标为历史记录，未作为当前失败状态。 |
| R3-QA-04 | 本地链接与当前作者交接入口 | **partial，见 R3-F-01** | 7 个本地链接均存在，SVG 入口可读；README 仍链接 v2/v1 交接，未列出当前 `author-handoff-v3.md`，虽不影响文件可读取。 |
| R3-QA-05 | 章节标题与课程入口 | pass（静态） | README 有 12 行路线，正文有连续 1—12 章标题；路线描述与正文标题语义对应。 |
| R3-QA-06 | JSON、来源 ID 与架构题型映射 | pass（静态） | 研究 JSON、canonical 架构 JSON 均可解析；研究 103 条 `item_id` 全唯一且覆盖 001—103；架构映射 103 个 ID 全在研究集合；来源表 89 次引用、77 个唯一有效 ID，各能力簇行内无重复。 |
| R3-QA-07 | SVG/XML 与状态标签 | pass（限结构） | SVG XML 可解析，根元素有 `viewBox`、`title`、`desc`、`aria-labelledby`；文本覆盖输入、检索、带来源、低置信/澄清、无匹配/不可用、来源失配、人工接管、重新提交，并声明未连接真实服务。未做渲染/读屏/设备 QA。 |
| R3-QA-08 | 正文契约字符串与未验证声明 | pass（限静态） | 14 个状态/字段契约字符串均出现；README、正文和作者 v3 继续明确静态示意、伪代码、研究/AI/用户/生产/就业证据未验证。未编译 TypeScript 或接 API。 |

## 指定反例复验

| 反例 | 结果 | 证据 |
| --- | --- | --- |
| R2-F-01 先修差异仍存在 | 关闭 | README 与 canonical `reading_order` 26 行逐项比较无差异。 |
| R2-F-02 修复后 JSON 仍被当前规格当作坏文件 | 关闭 | canonical 输入绑定修复哈希，历史旧哈希/错误说明已标注为历史，当前 JSON 解析成功。 |
| 12 章概要被写成 26 个完整单元 | 关闭 | README 和作者 v3 明确 12 章概要、26 单元入口，仍有概要/计划单元。 |
| AI 状态/静态 SVG 被写成真实实现或验证 | 关闭（静态边界） | 正文契约、SVG desc、README 和作者 v3 均保留未连接/未验证声明。 |

## 开放发现、责任与复验

| ID | 严重度 | 状态 | 发现 | 责任岗位 | 复验条件 |
| --- | --- | --- | --- | --- | --- |
| R3-F-01 | P2 | open | `author-handoff-v3.md` 已存在且为当前返修记录，但 README 第 9 行仍只列 v2 和 v1 交接链接；目录入口未直接指向最新作者记录。 | 教材研发员/课程架构师 | 在 README 加 v3 链接，或明确 v2 为主交接并把 v3 作为附加记录；重跑本地链接和入口版本检查。 |

## 限制与完整目标判断

- 本轮只支持文件/哈希、26 单元先修、章节标题、JSON/来源 ID、链接、SVG XML、契约字符串与未验证边界的静态结论；未进行浏览器/Figma/读屏/键盘/缩放/对比度、TypeScript 编译、模型/API、用户研究、真人专家或求职验证。
- 因此本轮支持“R2-F-01 与 R2-F-02 已在当前 canonical 文件绑定下关闭，v2 关键静态项未回归”，不支持教材已证明用户理解、职业胜任、WCAG 合规、就业或行业先进。完整培养目标仍 **not_met**。

修复 R3-F-01 后需重新冻结相关文件并复验；未来正文、课程规格或研究版本变化不得自动继承本结论。
