# UI/UX 教材 v0.1 · 项目经理交接与达标复盘

日期：2026-10-14（Asia/Shanghai） 责任岗位：项目经理

## 本轮目标与范围

用户要求生成一份借鉴 Agent 教材结构的 AI 时代 UI/UX 设计教材。范围冻结为 UI/UX 产品设计：用户问题、信息架构、流程、界面与组件、设计系统、AI 交互与不确定性、可用性研究、工程交接、指标、作品集和面试。AI视觉内容设计、AIGC生产、前端实现、真实模型服务和应用接入不在本轮教材交付范围。

## 实际交付

- 产品范围：[uiux-textbook-product-scope.md](uiux-textbook-product-scope.md) 与 JSON，定义目标学习者、岗位边界、核心产物和五维成熟度。
- 课程规格：[uiux-textbook-course-architecture.md](uiux-textbook-course-architecture.md)，当前规范为 26 个单元、13 项能力、8 阶段实作和 103 条题型映射；当前研究输入 SHA256 为 `0f2df0d9b0c9e179fc5a60de169c6ff2dc6ce837928cc0812038719f416443f8`。
- 教材目录：[textbooks/uiux-design-v01/README.md](../textbooks/uiux-design-v01/README.md)。
- 教材正文：[uiux-design-textbook.md](../textbooks/uiux-design-v01/uiux-design-textbook.md)，为 12 章专业概要版。
- 来源与面试映射：[sources-and-interview-map.md](../textbooks/uiux-design-v01/sources-and-interview-map.md)，保留 103 条公开题型及 S06 单人 27 场面试样本的证据限制。
- 可审阅教学视觉稿：[uiux-state-map-v01.svg](../textbooks/uiux-design-v01/assets/uiux-state-map-v01.svg)。

## 独立复核结论

内容审校 r2 为 `reviewed_with_limitations`；其已确认 26 单元映射、AI状态/规范/视觉稿等返修的大部分静态改进，同时保留以下限制：12章并未交付26个独立深读/实作；AI状态契约仍有 ResultCard 与 RetrievalState 的字段/状态差异；无障碍尚未做浏览器、读屏、键盘和实际缩放验证；题型主次语义与来源支持层级仍不完全；SVG未做浏览器渲染核对。

测试工程师 r4 最终静态 QA 为 `met_within_scope`，且 `open_findings=[]`。它实际复验了当前 canonical 课程绑定、26单元先修、103个唯一题型、JSON、12章目录、SVG XML/title/desc/状态标签、状态契约关键字符串和未验证声明。该结论只覆盖文件/结构/静态证据。

## 达标判断

- 本轮教材文件在静态交付范围内：`met_within_scope`。
- 内容专业审校：`reviewed_with_limitations`。
- 26 个单元的完整深读/实作：`not_met`，当前是 12 章概要版。
- 真实 UI/UX 职业胜任、真实用户理解、真人设计专家认可、求职结果、产品上线和行业先进性：`not_met`，本轮没有这些证据。

## 缺口与责任

| 缺口 | 责任领域 | 下一步证据 |
| --- | --- | --- |
| 26 单元仍有概要入口 | 课程架构/教材研发 | 逐单元正文、练习、参考分析和独立审校 |
| AI 状态契约与视觉状态需进一步统一 | 教材研发/设计 | 统一状态字典、可审阅视觉稿和设计 QA |
| 无障碍和响应式未运行 | 设计/测试 | 目标浏览器、键盘、读屏、200%缩放和真实设备复验 |
| 研究与可用性计划未执行 | 用户研究/实训评估 | 陌生参与者任务、原始记录、返修和未知任务作品证据 |
| 面试题型不能证明热度或录用 | 竞品研究/产品 | 新版本来源复核；保留题库、个人面经和真实招聘证据的分层 |

## 版本证据

以下是当前交付的 SHA256，后续修改必须重新冻结并独立复验：

- `textbooks/uiux-design-v01/uiux-design-textbook.md`: `a5406a6db125c3174af7d6228d0fcd57c9030131c4bc321325abf483278ccbd4`
- `textbooks/uiux-design-v01/README.md`: `2223b1faaa4c2793e18626c2653dad9369fa5e9e68cbc8bde310dae57c8fa2e9`
- `textbooks/uiux-design-v01/sources-and-interview-map.md`: `5bf979843e2e97e743afad840becca1cd9dca44f828c7f25d00d3a57428c1229`
- `textbooks/uiux-design-v01/assets/uiux-state-map-v01.svg`: `97ea6a67ed5ac29ba5f244ff9e35b1392a38486c13d1986c436230fd343b1254`
- `textbooks/uiux-design-v01/author-handoff-v2.md`: `ebb98b401e4a9df3008e7ae262683d9e67d91fb51a96676c3bda1d09c063fa43`
- `textbooks/uiux-design-v01/author-handoff-v3.md`: `c33a9e31f82c10cdceb5f97fbae56643ba62664471c92f1cb8e5dac3db516b7d`
- `textbooks/uiux-design-v01/author-handoff-v4.md`: `43d1a474a9e5a429ea88dcc9f8385d2ad842632fd21f25fd739206379265b116`
- `team/uiux-textbook-product-scope.md`: `f4680194e0bd7a458f7320a375cc66bd57dbd83ec6c5ce5815353655e9c0633e`
- `team/uiux-textbook-course-architecture.md`: `a1702312c6f526a8ad00decdc9a6b32e44f453e003032503858803272281ada5`
- `team/uiux-interview-questions-3m-research.json`: `0f2df0d9b0c9e179fc5a60de169c6ff2dc6ce837928cc0812038719f416443f8`
- `team/uiux-textbook-content-review-r2.md`: `a171ffb1fc134550f7b0ce37db0afd63f013897cc29d632343cd4fd9326c01f8`
- `team/uiux-textbook-qa-r4.md`: `8f09a15be2043f5d04407424361f3d20f3bf0bb445460143cd086567912328b4`
- `team/uiux-textbook-qa-r4-final-binding.json`: `5d81d5fb5ec3359ce035da0cb024f581bcfafc7d153a2b01f71d5dc776d9bca0`

本记录不把教材完成率、自查、题型覆盖或静态 QA 推导为职业胜任、就业概率或行业先进。
