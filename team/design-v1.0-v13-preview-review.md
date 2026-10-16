# Agent 教材 v13 隔离预览视觉资产复核

- **复核岗位**：设计师
- **日期**：2026-10-16（Asia/Shanghai）
- **复核对象**：`sites/rolecraft/textbooks/v13/`、`textbooks/v13/assets/` 与隔离预览交接条件
- **依据**：`team/textbook-v13-pm-deployment-handoff.md`、`team/textbook-v13-visual-system-and-asset-plan.md`、`textbooks/v13/README.md`、`textbooks/v13/assembly-manifest.json`
- **方法**：只读检查 manifest、资产路径与 SHA-256、SVG XML 解析、Markdown 图片替代文字和 `<details>` 摘要；未修改正文、资产或应用。

## 结论

本轮视觉资产交接为 **insufficient（隔离预览尚未具备完整视觉验收证据）**，并包含一个必须先修的资产错误：`assets/f01-api-boundary-map-v01.svg` XML 结构不完整，根级 `<g>` 未闭合，无法通过 XML 解析，浏览器可能无法显示该图。

其余文件的 manifest 路径、字节数和 SHA-256 一致；正文引用的图片均存在，Markdown 图片均提供非空替代文字；远程服务器当前仍运行 `textbook-v12`，没有把 v13 资产混入正式 v12 入口。13 个被正文引用的 SVG 没有嵌入 `<title>/<desc>`，虽然正文有 Markdown alt，仍不满足视觉资产计划要求的资产内嵌无障碍元数据。两处长代码折叠摘要没有写验证状态。浏览器实际渲染、箭头避让、字体回退、灰度/200%/窄屏、键盘读屏和脚本不可用降级尚未验证，不能把 v13 写成可进入更广试读或正式入口。

## 当前版本隔离

远程只读 health 返回 `contentVersion=textbook-v12`、`textbookVersionId=agent-engineering-v12`、`retrievalVersion=content-retrieval-0.12-v12`、30 个单元和 `releaseVersion=rolecraft-1.0`。PM 交接明确 v13 是 `isolated_preview_only`，未替换 v12 工作台、记录或数据库。本轮没有改变远程环境。

## 逐项检查

| ID | 检查项 | 结果 | 证据与边界 | 责任/下一步 |
| --- | --- | --- | --- | --- |
| V13-ASM-01 | 30 篇、62 个资产、manifest 与实际文件一致 | **pass（文件范围）** | manifest 标记 `chapterCount=30`、`assetCount=62`；62 个文件均存在且实际 SHA-256/字节数与 manifest 一致。 | PM 保留版本绑定；浏览器加载仍需 QA。 |
| V13-REF-01 | 图片引用路径可解析 | **pass（文件范围）** | 章节 Markdown 的图片引用均能在 `assets/` 找到；未发现缺失路径。 | 客户端接入后再测深链/缓存。 |
| V13-ALT-01 | Markdown 图片替代文字 | **pass（源码范围）** | 章节中的图片 Markdown alt 均非空，且多数描述了图的关系、状态或阅读顺序。 | QA 在实际读屏中核语义是否可用。 |
| V13-SVG-VALID-01 | SVG 可解析并可作为图片加载 | **fail** | `f01-api-boundary-map-v01.svg` XML 解析失败：外层 `<g font-family=...>` 未闭合；正文仍引用该图。 | 设计/教材研发员修复并重新生成 hash；QA 重新解析和浏览器加载。 |
| V13-A11Y-01 | SVG 内嵌 title/desc | **fail（资产合同范围）** | 13 个被正文引用的 SVG 缺少 `<title>` 或 `<desc>`：`agent-runtime-loop.svg`、`e05-cost-performance-visual-map-v01.svg`、`n03-planning-reflection-mid-card-v01.svg`、`n03-planning-reflection-overview-v01.svg`、`n04-tools-mcp-mid-card-v01.svg`、`n04-tools-mcp-overview-v01.svg`、`n05-retrieval-ingestion-mid-card-v01.svg`、`n05-retrieval-ingestion-overview-v01.svg`、`n08-sandbox-security-visual-map-v01.svg`、`n09-runtime-delivery-visual-map-v01.svg`、`n10-evaluation-projects-visual-map-v01.svg`、`p01-mvp-visual-map-v01.svg`、`p02-delivery-evidence-visual-map-v01.svg`。Markdown alt 不能替代资产自身的 title/desc 交接要求。 | 设计师补齐并更新 manifest；内容审校核图文语义。 |
| V13-LEGEND-01 | 颜色角色、形状/位置与文字冗余 | **insufficient** | 资产源码中可见多套蓝/黄/绿/紫/红/灰填充和节点文字；但没有实际渲染、灰阶、色盲或低亮度证据，不能确认全套图保持统一和可辨识。 | 设计/QA 在隔离预览逐图复核。 |
| V13-ARROW-01 | 箭头不穿过标题、节点和说明 | **insufficient** | 交接说明要求箭头避让；源码静态路径可见，但没有截图或渲染层级证据确认所有 62 个资产。 | 设计/QA 生成桌面及窄屏预览并记录缺陷。 |
| V13-RESP-01 | 760px/窄屏降级 | **insufficient** | 资产没有单独窄屏变体；多数 SVG viewBox 为 980–1600 宽，是否缩放可读、横向滚动或转纵向卡片尚未由隔离预览确认。 | 客户端实现降级策略，设计确认，QA 在 760/390/320 复验。 |
| V13-FONT-01 | 真实字体、长标签、裁切和比例 | **insufficient** | 未执行目标浏览器渲染；无法确认中文字体回退、长句换行、节点内边距及图片边界。 | QA 使用目标字体与浏览器截图复验。 |
| V13-FOLD-01 | 11 行以上代码默认折叠摘要 | **fail（摘要合同范围）** | 64 个 `<summary>` 中，两处“展开派工契约示例（13 行）”缺少验证状态：合订本与 `n07-multiagent-a2a.md`；其余长代码摘要大多包含用途/行数/验证状态。 | 教材研发员补验证状态，内容审校复核关键输入/输出不能被隐藏。 |
| V13-FOLD-02 | 折叠视觉与键盘/读屏/刷新/深链 | **insufficient** | `<details>` 标记存在且摘要可读，但没有产品隔离预览实现或浏览器操作证据。 | 软件工程师接入后由 QA 独立验收。 |
| V13-FALLBACK-01 | 图片不可用时的邻近文字降级 | **insufficient** | README 和章节提供 alt/邻近文字替代约定；未切断图片、禁用脚本或模拟加载失败验证实际呈现。 | 客户端/QA 测试图片缺失与脚本不可用。 |
| V13-ISOLATION-01 | v13 不覆盖 v12 正式入口和记录 | **pass（交接范围）** | manifest 状态为 `isolated_preview_only`；远程 health 仍是 v12，未进行应用或数据库写入。 | PM 维持隔离，未齐专业结论前不替换。 |

## 必须推进的修复与复验

1. 修复 `f01-api-boundary-map-v01.svg` 未闭合的 SVG 分组，重新计算 manifest hash，并确认浏览器能加载该图。
2. 为上述 13 个 SVG 补 `<title>`、`<desc>`，保留正文中描述关系和状态的 Markdown alt；内容审校核替代文字没有把示意图写成真实运行证据。
3. 为两个“派工契约示例”折叠摘要补充用途、语言、行数、验证状态和关键输入/输出提示。
4. 组装只读隔离预览，至少截图并复验桌面、760px、390px、320px：图片不裁切、文字可读、箭头不压字、图例在灰阶/色盲条件下仍能理解、折叠默认状态和展开/收起可操作。
5. 由 QA 追加键盘 Tab/Shift+Tab、读屏、刷新/深链、图片缺失、脚本不可用、真实字体回退和长标签结果；PM 根据产品、内容审校、开发和 QA 的限定结论决定是否进入更广试读。

## 证据限制

- 本报告只复核 v13 隔离资产，不改写 v12 内容、旧 QA 或远程正式入口。
- 文件存在、hash 一致、Markdown alt 存在和源码颜色不能替代浏览器渲染、无障碍和真人阅读证据。
- v13 资产交接不等于教材已部署、产品已验收、职业能力已认证或真实学习效果已确认。

