# UI/UX v0.3 视觉美学专项独立 QA

- **测试岗位：** 测试工程师
- **日期：** 2026-10-16（Asia/Shanghai）
- **范围：** VA01/VA02 正文、配套视觉资产、课程架构与产品合同的静态交付检查；不修改教材、资产、产品或应用实现。
- **结论：** `met_with_limitations`
- **范围结论：** `met_within_scope`

## 检查结果

1. **文件与正文—资产绑定。** 两篇正文可读且存在：
   - [VA01-visual-perception.md](../textbooks/uiux-design-v03/VA01-visual-perception.md)
   - [VA02-composition-rhythm.md](../textbooks/uiux-design-v03/VA02-composition-rhythm.md)

   两份正文所对应的视觉资产均存在并可由本报告直接定位：
   - [VA01-critique-board.svg](../textbooks/uiux-design-v03/assets/VA01-critique-board.svg)
   - [VA02-composition-study.svg](../textbooks/uiux-design-v03/assets/VA02-composition-study.svg)

   版本复验：VA01 正文 273 行（SHA-256 `e5e1e547f8cd74aa28fc1b6fce71f56577446a906195038e1f5f7e9dd938b0be`）在标题级分别引用比例 `VA01-proportion-scale.svg`（第 36 行）、节奏 `VA01-rhythm-pause.svg`（第 51 行）、密度 `VA01-density-tension.svg`（第 66 行），并保留焦点、判断及 `VA01-critique-board.svg` 总览；VA02 正文 426 行（SHA-256 `2010b2eed04db3b7d597c37e0490b122b8e28b55acb8c9b704c175ef5e12e367`）在标题级分别引用内容/状态 `VA02-content-state.svg`（第 27 行）、比例条件（第 100 行）、密度/节奏（第 121 行）、折叠线（第 148 行）、局部平衡（第 171 行），并保留 `VA02-composition-study.svg` 总览。两篇共 15 个 SVG 文件、15 处独立图片语法（总览点击包装产生重复目标引用）均存在，alt 文本和正文均标注教学构造/未验证边界。

   课程架构 `uiux-v03-visual-aesthetics-curriculum.md` 将 VA01/VA02 与上述工件、文字替代和未验证边界交接；产品场景/接收条件以 `uiux-visual-harmony-product-v01.md` 为合同来源。

   2. **SVG XML 与结构。** 对 assets 目录内 15 份 SVG（总览图及标题级概念图）分别运行 `xmllint --noout`，均退出码 `0`；根元素为 SVG，声明 `role="img"` 与 `aria-labelledby`，并含对应 `title`/`desc`、唯一 ID 和非空文本节点。这证明 XML 可解析及基本结构完整，不证明字体度量或平台像素布局。

3. **内容审校返修状态。** 内容审校记录的 VA01-ART-001（批评板工件缺失）与 VA02-ART-001（构图研究工件缺失）均标记为已关闭；本 QA 保留该原始缺陷与返修关闭身份，并记录审校所列中等限制（VA01 第二看点/组群边界、VA02 逐屏网格/基线及降级标注仍可加强）。关闭原始缺陷不等于产品或学习效果通过。

## 未运行或未验证

- 具体 Markdown 渲染器的图片呈现、浏览器像素渲染、字体回退、文字裁切及 760px/窄屏真实布局；
- 键盘、焦点、读屏名称/顺序及其他辅助技术（含灰度、色觉、大字号、减少动效、高对比）；
- 真实用户/学习者理解、任务成功与学习效果；
- 真人设计专家或行业专家评审；
- 应用实现、动态行为、性能及生产交付。

静态正文、SVG 解析或结构检查不能替代上述证据，也不关闭既有产品门槛或完整职业目标。

## 复验条件

资产或正文后续返修后，重跑本报告的文件/链接与 `xmllint` 检查；在可用浏览器和辅助技术环境独立复验默认屏、760px、窄屏、灰度/大字号/减少动效，并由用户研究/实训岗位另行取得真实理解与学习证据。
