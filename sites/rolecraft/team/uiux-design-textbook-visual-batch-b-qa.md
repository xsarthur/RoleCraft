# UI/UX v0.2 视觉优化批次 B（第 05–08 章）独立 QA

- 日期：2026-10-16（Asia/Shanghai）
- 岗位：测试工程师
- 范围：`textbooks/uiux-design-v02/chapters/05–08`、批次 B 四张 SVG、正文图片语法与相对路径、SVG XML/可访问元数据/可读文本、来源与教学构造边界、Mermaid/`visual_downgrade`、旧资产保护。
- 结论：**`met_with_limitations`**（静态文件范围内通过；合订集成、浏览器/读屏和真人证据未完成）。

## 已执行检查

| 检查 | 方法与结果 | 状态 |
| --- | --- | --- |
| 正文图片语法与路径 | 第05–08章共 15 个 Markdown 图片引用；alt 均非空，15/15 相对 `../assets/` 目标存在。四章首图分别绑定 `v02-batch-b-05-domain-ia.svg`、`06-task-recovery.svg`、`07-state-contract.svg`、`08-fidelity-compare.svg`；其余为明确图注的既有资产复用。 | pass |
| 四张 SVG 资产 | 四文件存在；对每个执行 `xmllint --noout`，4/4 退出码 0。 | pass |
| SVG 可访问元数据 | 四图根元素均为 `role="img"`、`aria-labelledby="title desc"`；`title` 与 `desc` 各 1 个、ID 可解析且文本非空。 | pass（静态） |
| 可读文本与教学边界 | 四图共有 130 个 `<text>` 节点、合计约 2,583 个字符；标题、节点、状态、来源行均有可见文本。每图写入 `教学构造 · 未验证`，并含 `chapter_id`、`asset_id`、`source_type=教学构造`、`verification=未验证`。 | pass（静态） |
| 正文来源与替代文本 | 四章首图图注均给出 `asset_id`、相对路径、短/长替代文本和未验证边界；第07/08章还明确列出既有复用图的来源。 | pass |
| Mermaid 与 `visual_downgrade` | 第05章 3 个 Mermaid flowchart、9 处降级标记；第06章 2 个 flowchart、9 处标记；第07/08章无 Mermaid 块，但各有 4 处 `visual_downgrade` 文字降级。相邻说明保留教学构造、静态图不等于运行时/用户证据的边界；未运行 Mermaid 渲染器。 | pass（边界记录） |
| 旧资产保护 | 按当前 `assembly-manifest.json` 对 8 张原有 SVG、`tokens.json`、`design-source-selfcheck.json` 及批次 A 4 张 SVG 逐项重算 SHA256，14/14 与 manifest 一致。未修改旧资产、应用或数据库。 | pass |
| 合订本集成 | `README.md`、`source-index.md`、`assembly-manifest.json` 和 `uiux-design-textbook.md` 均未列出 `v02-batch-b`；本次只能证明四章源文件绑定可读，不能证明合订本已接入。 | insufficient |

## 资产指纹

| 资产 | SHA256 |
| --- | --- |
| `v02-batch-b-05-domain-ia.svg` | `ba0351dba39d7be3a4317fcf0ec003dfe02eb6b9376711265848584e7b0369bf` |
| `v02-batch-b-06-task-recovery.svg` | `0f82521b45e30f2a1180c74ab917000b0eed7339f8bc49fad721e40647203f15` |
| `v02-batch-b-07-state-contract.svg` | `145eb6317c7c52009422486b952cbae35aa6e2df9f46e10d1640021777301397` |
| `v02-batch-b-08-fidelity-compare.svg` | `58605fd3af0a9cf9160941d8e4c79526f6176ceaa15ff9b7ac87afe295e4268c` |

## 未验证与复验要求

未验证浏览器像素渲染、字体回退、箭头层叠、缩放/裁切、760px/窄屏布局、灰度与大字号；未验证 Markdown 渲染器呈现。未执行键盘、读屏或其他辅助技术检查，因此 `aria-labelledby` 静态存在不等于实际读序可用。未取得真人读者/学习者理解、设计专家、真实服务/业务效果证据。未运行 Mermaid 渲染器。`source-index`、`assembly-manifest` 和合订本接入批次 B 后，需重新核路径、章节锚点、资产版本/SHA256 与旧资产保护，并在浏览器、键盘/读屏和真人场景独立复验。

本 QA 不修改正文、SVG、旧资产、应用、数据库或用户记录；`met_with_limitations` 不代表完整教材、产品无障碍或职业能力达标。
