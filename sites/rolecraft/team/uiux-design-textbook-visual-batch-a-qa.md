# UI/UX v0.2 视觉优化批次 A（第 01–04 章）独立 QA

- 日期：2026-10-16（Asia/Shanghai）
- 岗位：测试工程师
- 范围：`textbooks/uiux-design-v02/chapters/01–04`、批次 A 四张 SVG、正文绑定、Mermaid 与 `visual_downgrade` 边界、旧版本保护。
- 结论：**`met_with_limitations`**（本次静态文件与可追溯字段检查在范围内通过；集成、视觉运行和真人证据仍未完成）。

## 已执行检查

| 检查 | 方法与结果 | 状态 |
| --- | --- | --- |
| 正文图片语法与路径 | 01–04 共 7 个 Markdown 图片引用；alt 文本均非空，所有 `../assets/` 目标存在（批次 A 主图及复用图均可解析）。 | pass |
| 四张 SVG 资产 | `v02-batch-a-01-role-evidence.svg`、`02-problem-causality.svg`、`03-research-methods.svg`、`04-evidence-synthesis.svg` 均存在，`xmllint --noout` 四次退出 0。 | pass |
| SVG 可访问元数据 | 四图根元素均有 `role="img"`、`aria-labelledby="title desc"`；`title`/`desc` ID 可解析且非空。 | pass |
| 可读文本与教学边界 | 四图共 129 个 `<text>` 节点（04 图有一个空白占位节点，不承载信息）；可见标题、节点、来源字段均为中文/ID 文本，底部明确 `教学构造 · 未验证`。图内没有把合成记录写成真实结果。 | pass（静态） |
| 来源字段 | 四图均含 `chapter_id`、`asset_id`、`source_type=教学构造`、`verification=未验证`；正文逐图图注提供文字替代、设计师批次 A 来源和浏览器/读屏/真实任务限制。 | pass |
| Mermaid 与降级边界 | 01、02、03 各有 1 个 `flowchart` Mermaid 块，04 有 2 个；代码块非空，邻近说明均声明教学构造、箭头为论证关系并保留 `visual_downgrade`。未使用 Mermaid 渲染器或浏览器像素验收。 | pass（边界记录） |
| 旧版本保护 | `git status` 对受检目录无未登记改动；manifest 中旧 8 张 SVG、`tokens.json`、`design-source-selfcheck.json` 的 SHA256 与当前文件一致。未修改正文以外的旧资产、应用或数据库。 | pass |

## 当前缺口与独立复验要求

1. `source-index.md` 和 `assembly-manifest.json` 仍是旧合订版本：未列出批次 A 四图，合订本 `uiux-design-textbook.md` 也不含 `v02-batch-a-*` 引用；当前检查只证明四章源文件可读和路径存在，不能称整本组装已接入。由课程/作者或组装责任人更新后，需按新版本重新核链接、manifest 与 SHA256。
2. 未运行 Mermaid 渲染器；未在浏览器中验证 SVG 像素渲染、字体回退、裁切、缩放、窄屏/灰度/大字号或 390/320 关系保持。
3. 未运行键盘、读屏或其他辅助技术检查，`aria-labelledby` 的静态存在不等于实际读序或辅助技术可用。
4. 未取得真人读者/学习者理解、设计专家或真实研究/产品效果证据；教学构造和 `visual_downgrade` 只保留证据边界。

## 版本与证据

- 章节 SHA256：01 `265e373b72aec19be909eb5feef1202fc48dd165865c5a30ecc2a03130bd9c28`；02 `e8619bbe481c0befa16b6f12e0dd16704eab1d6e659c79cce2e7544e14568366`；03 `0e2381811bff89bf57c14b85411dd650720191890c55e08c9e4673d6666f275a`；04 `c7bee98dae744e98469dd7b5c82cfc125ec6e065fea12cd2c3af6c476d97b0de`。
- 批次 A SVG SHA256：01 `87be8126f211d7a05c6811e82051e1c6b52211ae97ac6ec041b15603a88133b0`；02 `5676139256354bcb2ac771fea37f5376761424e10dd843756d7b8dbdd4a2146f`；03 `b9523c5934ff1015d8880a02d5a5e6815ce0259078073433851cc7618a94f94c`；04 `898e962ae31ec7eeb85cab6205290e9cb15dbe3d049194fae69f987b64609511`。

完整产品、真实学习效果、无障碍使用、浏览器/读屏、真人理解和行业先进性仍不能由本 QA 推断为通过；新组装或资产返修后应按上述缺口重新独立验收。
