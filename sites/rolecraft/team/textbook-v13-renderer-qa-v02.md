# v13 教材渲染与中段视觉 QA v02

日期：2026-10-16  
岗位：测试工程师  
范围：v13 三篇优化试读稿、当前 `dist/learning-workbench.js` 的教材 Markdown 渲染器；本轮不修改代码。

## 结论

本轮可执行的静态与 Node/VM 检查通过，但当前产品仍不能证明用户实际看到了 v13 优化稿。`learning-workbench.js` 的 `CURRENT` 仍为 `textbook-v12`，静态语料入口仍只接受 `RolecraftContentV12`；因此 v13 的中段图片、v13 的 `details` 代码折叠和新增 Mermaid 内容没有被当前应用接入。这个集成缺口是本轮 `not_met` 的主要原因。

## 已实际检查

| ID | 检查 | 结果 | 证据 |
| --- | --- | --- | --- |
| RENDER-01 | 渲染器识别编辑稿的原生 `<details><summary>…</summary>```…```</details>` 结构 | pass | `detailsCode()` 要求结构完整；不完整结构不会静默丢弃 |
| RENDER-02 | 10 行代码默认展开 | pass | Node/VM 调用 `LearningWorkbench.markdown()`：输出 `<details ... open>`，含一个 `<pre>` |
| RENDER-03 | 11 行代码默认收起 | pass | Node/VM 调用同上：输出无 `open` 属性，仍保留 `<pre>` 和完整 11 行源文 |
| RENDER-04 | 折叠摘要保留语言、行数和未执行状态 | pass | 输出包含 `python · 11 行 · 网页不执行代码`；摘要正文保留编辑稿说明 |
| RENDER-05 | 普通 Mermaid 围栏降级可读 | pass_with_limitations | 普通 ` ```mermaid ` 被保留为 `lw-code`，显示 `mermaid · 网页不执行代码` 与源码；当前渲染器不会把 Mermaid 转成 SVG |
| ASSET-01 | v13 三篇正文图片引用存在 | pass | `02-task-acceptance.md`、`03-trust-boundary.md`、`c01-control-loop.md` 共 6 个引用，均能解析到 `textbooks/v13/assets/` 文件 |
| ASSET-02 | v13 SVG XML 基本解析 | pass | `textbooks/v13/assets/*.svg` 逐个通过 `xmllint --noout` |
| ASSET-03 | 正文中段存在额外图片引用 | pass | 三篇均在前 20 行之后出现 `![…](assets/…)`；任务验收篇和信任边界篇各 2 张，控制循环篇 2 张 |
| INTEGRATION-01 | 当前客户端接入 v13 内容 | fail | `dist/learning-workbench.js:5` 的 `CURRENT = 'textbook-v12'`；`staticCorpus()` 只读取 `RolecraftContentV12`，没有 v13 分支 |
| INTEGRATION-02 | 当前客户端能实际渲染 v13 资产路径 | not_run | 由于 v13 未接入当前语料，无法把 v13 正文传入真实页面完成此项验证 |

## 发现的问题

1. 当前渲染器已经具备折叠逻辑，但产品数据仍是 v12。此前 v13 文件中写入的折叠标签不会自动出现在当前学习工作台。
2. Mermaid 的降级路径是可读源码块，不是图像渲染。若产品要求中段 Mermaid 以图形呈现，需要产品、设计、开发共同定义 Mermaid 渲染或预生成 SVG 的合同；QA 不能把源码可见误记为图形效果通过。
3. v13 图片资产本身存在且 XML 可解析，但尚未由当前页面真实加载；因此图片布局、箭头是否覆盖文字、字体回退和窄屏裁切仍没有浏览器证据。

## 未能验证的范围

- 浏览器真实页面中的 v13 内容是否被加载；
- 320px/窄屏下正文、图片和 Mermaid 降级的布局；
- 键盘操作、焦点顺序、读屏对 `details/summary` 与图片放大控件的表达；
- 实际字体、网络/静态 file 路径下的资源加载；
- 真人读者是否能比连续文字更快理解中段视觉卡。

## 交接与复验条件

由产品确认当前版本是否正式切换到 v13，以及 Mermaid 采用源码降级、预生成图片还是运行时渲染。开发接入版本化 v13 语料和资产解析后，QA 复验：

1. 10 行与 11 行边界、刷新和深链状态；
2. v13 三篇的开头图和中段图真实加载、路径、替代文本与放大行为；
3. Mermaid 图形/降级的实际呈现；
4. 窄屏、键盘、读屏和无脚本降级；
5. 图中箭头、节点文字和说明没有重叠。

当前范围结论：渲染器局部逻辑 `met_within_scope`；v13 产品接入与真实阅读体验 `not_met`。本报告不把静态文件检查当作浏览器或真人理解证据。
