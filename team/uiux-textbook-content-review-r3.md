# UI/UX 设计教材 v0.1 · r3 最终窄复核

日期：2026-10-14（Asia/Shanghai）  
责任岗位：内容审校员  
审校身份：AI 技术内容审校；不能替代真人课程架构师、QA、真人设计专家、无障碍专家、真实学习者或就业评估。

## 结论

本轮只核对两件事：

1. 原 C07：面试研究 JSON 的语法历史、当前哈希与 canonical 课程规格绑定；
2. README 的 26 单元先修和作者入口是否与 canonical 规格一致。

结论为 **reviewed_with_limitations**。C07 已在当前静态绑定范围关闭：修复记录保留原始坏版本和差异，当前 JSON SHA-256 已写入 canonical 课程架构，Python 解析成功，items=103、sources=5。README 的 26 行先修逐行与 canonical JSON reading_order 一致，单元 24、25 的 r3 修订已正确应用；README 作者入口指向 author-handoff-v3，author-handoff-v4 明确该 v3 为当前入口并保留 v1/v2 历史链接，链接均可解析。

本轮不重新审阅全文。C02、C05、C06、C08、C09 的 r2 限制按原报告保留；完整 26 单元深读/实作、真实用户、真人专家、运行时和无障碍证据仍未验证。

## 文件绑定

| 文件 | SHA-256 |
| --- | --- |
| textbooks/rolecraft/uiux-design-v01/README.md | 2223b1faaa4c2793e18626c2653dad9369fa5e9e68cbc8bde310dae57c8fa2e9 |
| sites/rolecraft/textbooks/uiux-design-v01/README.md | 2223b1faaa4c2793e18626c2653dad9369fa5e9e68cbc8bde310dae57c8fa2e9 |
| sites/rolecraft/textbooks/uiux-design-v01/author-handoff-v3.md | c33a9e31f82c10cdceb5f97fbae56643ba62664471c92f1cb8e5dac3db516b7d |
| sites/rolecraft/textbooks/uiux-design-v01/author-handoff-v4.md | 43d1a474a9e5a429ea88dcc9f8385d2ad842632fd21f25fd739206379265b116 |
| sites/rolecraft/team/uiux-textbook-course-architecture.md | a1702312c6f526a8ad00decdc9a6b32e44f453e003032503858803272281ada5 |
| sites/rolecraft/team/uiux-textbook-course-architecture.json | 3eca639d9d7a8408686b0cfd19e185ec3fe9a68c6ca02e1d074932ba46b5dbc1 |
| sites/rolecraft/team/uiux-interview-questions-3m-research.json | 0f2df0d9b0c9e179fc5a60de169c6ff2dc6ce837928cc0812038719f416443f8 |
| sites/rolecraft/team/uiux-interview-questions-3m-research-fix.md | aaf1c5280a6bd6c29095451e45ffb444b5a8d67c7035ba3ebeaacf195190d258 |
| sites/rolecraft/team/uiux-interview-questions-3m-research-fix.json | b52ef8c6532391ae78fdb18ad2e66e0f73457aa1ce4c3e2178d04b62fb6d36c5 |

注：第一行保留了用户任务中给出的路径写法；实际绑定文件为 sites/rolecraft/textbooks/uiux-design-v01/README.md。

## C07 研究 JSON 绑定

**状态：closed_static_with_history。**

canonical 课程规格 v0.1-r3 的 MD/JSON 均将当前研究文件绑定为：

- SHA-256：0f2df0d9b0c9e179fc5a60de169c6ff2dc6ce837928cc0812038719f416443f8
- 结构：items=103、sources=5，JSON 解析成功
- 修复记录：uiux-interview-questions-3m-research-fix，明确只把第 73 行非法键 bu"S05" 改为合法键 "S05"，题目、来源和限制未改

canonical 规格同时把旧 SHA-256 7aa79f20… 和语法错误保留为 initial_received_binding 历史，不再作为当前绑定。当前文件的实际哈希与 canonical 规格一致，历史差异可追溯；因此原 C07 的“当前文件漂移且无法按登记版本复现”已关闭。

本项只关闭版本/语法/结构绑定。它不重新证明公开来源主张、题型代表性、103 条是否为独立真题或就业概率。

## README 先修与作者入口

### 26 行先修核对

对 canonical JSON reading_order 与 README 的 00—25 表格做脚本化集合比较，结果为 **26/26 行一致，差异 0**。重点修订已正确落地：

| 单元 | canonical 正式先修 | README 当前先修 | 结果 |
| --- | --- | --- | --- |
| 24 portfolio-interview | 10、13、18、20、21、23 | 10、13、18、20、21、23 | 一致 |
| 25 capstone-independent-evaluation | 23、24 | 23、24 | 一致 |
| 22 service-ecosystem | 作为单元 25 的进阶关联，不是正式先修 | README 明确“22 为进阶关联，不是正式先修” | 一致 |

这项检查只验证声明的先修集合，不验证学习者是否真的能按这些先修完成任务。

### 作者入口核对

- README 第 9 行将当前作者入口指向 author-handoff-v3，并保留 v2、v1 历史链接。
- author-handoff-v3 记录正是 r3 先修微调：单元 24 加入 21，单元 25 从 22、23、24 改为 23、24。
- author-handoff-v4 明确本次只修正 README 的入口，当前入口仍是 v3，v1/v2 作为历史保留；因此 README、v3 和 v4 对“当前作者入口”的声明一致。
- README、v3、v4 的相对链接均存在。

状态：**closed_static_with_scope_limit**。作者入口和先修声明一致，但作者交接仍明确 12 章只是 26 单元概要，不能由映射一致推出完整课程交付或可学性通过。

## 按要求保留的 r2 限制

以下不在本轮重审，沿用 r2：

- **C02：** AI 状态契约仍有 ResultCard/RetrievalState 状态集合和 excerpt 字段不一致，SVG 状态粒度也未完全对应。
- **C05：** 仍缺 320 CSS px/400% 等价重排和不绑定框架的最小语义交接例；200% 仅是早期版式检查。
- **C06：** 跨能力题型仍有重复 ID，未建立 primary_unit/secondary_unit 主次映射。
- **C08：** 来源身份完整性与语义支持仍未分层。
- **C09：** SVG 尚未浏览器/设备渲染，视觉状态粒度与正文仍有合并差异。

## 静态验证与限制

1. 当前研究 JSON 由 Python JSON 解析成功，items=103、sources=5；修复记录的原始/修复哈希与实际文件一致。
2. README 26 行先修与 canonical JSON 逐行集合比较通过；相对链接检查通过。
3. 未执行真人学习验证、陌生任务迁移、浏览器/辅助技术、模型/API、Figma 或可用性测试。
4. 本报告仅覆盖 C07 与先修/作者入口；不改变、不关闭 r2 的其他限制。

本报告不修改正文、README、课程规格、研究 JSON 或作者交接文件。