# UI/UX 设计教材 v0.1 · 独立交付 QA（r4 最终窄复验）

日期：2026-10-14（Asia/Shanghai）  
责任岗位：测试工程师  
测试结论：**met_within_scope（仅限本次静态 r4 检查）**；完整职业培养、真实学习效果、真人专家认可和就业结果：**not_met**。

本轮只复验 README 作者交接入口、作者 v4、canonical 课程规格绑定、26 单元先修、103 条题型、SVG XML、正文状态契约与未验证声明，并重跑关键静态项。使用全新 r4 基线，不继承 r3 baseline 或结论；未修改任何源文件，未做真实用户、浏览器、专家、模型/API 或生产验证。

## 当前 r4 基线（先于检查）

| 文件 | 字节 | SHA-256 | 状态 |
| --- | ---: | --- | --- |
| `sites/rolecraft/textbooks/uiux-design-v01/README.md` | 6,419 | `2223b1faaa4c2793e18626c2653dad9369fa5e9e68cbc8bde310dae57c8fa2e9` | received |
| `sites/rolecraft/textbooks/uiux-design-v01/uiux-design-textbook.md` | 37,512 | `a5406a6db125c3174af7d6228d0fcd57c9030131c4bc321325abf483278ccbd4` | received |
| `sites/rolecraft/textbooks/uiux-design-v01/author-handoff-v4.md` | 561 | `43d1a474a9e5a429ea88dcc9f8385d2ad842632fd21f25fd739206379265b116` | received |
| `sites/rolecraft/textbooks/uiux-design-v01/author-handoff-v3.md` | 1,442 | `c33a9e31f82c10cdceb5f97fbae56643ba62664471c92f1cb8e5dac3db516b7d` | received |
| `sites/rolecraft/textbooks/uiux-design-v01/assets/uiux-state-map-v01.svg` | 4,609 | `97ea6a67ed5ac29ba5f244ff9e35b1392a38486c13d1986c436230fd343b1254` | received |
| `sites/rolecraft/team/uiux-textbook-course-architecture.md` | 28,095 | `a1702312c6f526a8ad00decdc9a6b32e44f453e003032503858803272281ada5` | received |
| `sites/rolecraft/team/uiux-textbook-course-architecture.json` | 23,546 | `3eca639d9d7a8408686b0cfd19e185ec3fe9a68c6ca02e1d074932ba46b5dbc1` | received |
| `sites/rolecraft/team/uiux-interview-questions-3m-research.json` | 86,179 | `0f2df0d9b0c9e179fc5a60de169c6ff2dc6ce837928cc0812038719f416443f8` | received |
| `sites/rolecraft/team/uiux-interview-questions-3m-research-fix.md` | 766 | `aaf1c5280a6bd6c29095451e45ffb444b5a8d67c7035ba3ebeaacf195190d258` | received |

## 静态复验结果

| 检查 ID | 检查内容 | 结果 | 证据与限制 |
| --- | --- | --- | --- |
| R4-QA-01 | README 作者交接链接 | pass | README 现列 v3 当前入口以及 v2/v1 历史记录；所有 7 个本地 README 链接均解析到现存文件。 |
| R4-QA-02 | canonical 课程规格绑定 | pass | canonical 课程架构为 v0.1-r3；JSON/Markdown 的当前研究绑定为 `0f2df0d9…6443f8`，与研究 JSON 实际 SHA-256 一致；旧研究哈希仅作为历史记录。 |
| R4-QA-03 | 26 单元正式先修 | pass | README 00—25 共 26 行，ID 和先修与 canonical `reading_order` 全部一致；单元 24 含 21，单元 25 为 23、24，22 标为可选进阶关联。 |
| R4-QA-04 | 103 条题型与 JSON | pass | 研究 JSON 可解析，103 条 `item_id` 唯一并覆盖 `UIUX-3M-001`—`UIUX-3M-103`；canonical 架构题型映射 103 个 ID，全部存在于研究集合。 |
| R4-QA-05 | SVG/XML 静态完整性 | pass（限结构） | SVG 可由 XML 解析，根元素有 `viewBox`、`title`、`desc`、`aria-labelledby`；状态文本覆盖输入、检索、结果、低置信/澄清、无匹配/不可用、来源失配、人工接管、重新提交和未连接真实服务。未做渲染/读屏/设备 QA。 |
| R4-QA-06 | 正文状态契约 | pass（静态） | 14 个状态/字段字符串均存在：idle/pending/clarify/low_confidence/result/empty/unavailable/integrity_error/cancelled、`queryId`、`sourceVersion`、`sectionId`、`retryCount`、`ignoreLateResponses`。未编译 TypeScript 或接 API。 |
| R4-QA-07 | 未验证声明与 r3 关键项无回归 | pass（限静态） | 正文 12 个连续章节仍在；README、正文、作者 v4 明确教学示意、伪代码、AI/用户/生产/就业证据未验证。无新增真实验证声称。 |

## 指定复验反例

| 反例 | 结果 | 证据 |
| --- | --- | --- |
| README 未暴露作者 v3 当前入口 | 关闭 | README 第 9 行已链接返修交接 v3，并保留 v2/v1 历史记录；v4 记录该入口修正。 |
| R2-F-01 先修差异回归 | 关闭 | 26 行 README 先修与 canonical `reading_order` 零差异。 |
| R2-F-02 研究 JSON provenance 回退 | 关闭 | canonical 当前绑定和实际研究 JSON 均为修复后哈希，旧值标注历史。 |
| 12 章/静态 SVG/AI 状态被写成完整产品验证 | 关闭（静态边界） | README、正文、SVG desc、作者 v4 保留未连接/未验证声明；本轮不替代运行证据。 |

## 限制与完整目标判断

- 本轮只支持链接、哈希绑定、26 单元先修、JSON/题型 ID、SVG/XML、正文契约和未验证边界的静态结果；未进行浏览器/Figma/读屏/键盘/缩放/对比度、TypeScript/API、模型、真实用户、真人专家、学习效果、就业或生产验证。
- 因此本轮支持“README 作者入口已修复，R2-F-01/F-02 及 r3 关键静态项未回归”，不支持教材已证明用户理解、职业胜任、WCAG 合规、就业或行业先进。完整培养目标仍 **not_met**。

未来正文、课程规格、研究或作者入口变化必须重新冻结并独立复验。
