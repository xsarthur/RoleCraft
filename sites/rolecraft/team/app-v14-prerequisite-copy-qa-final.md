# v14 前置与课程简化：候选 3 最终窄 QA

测试工程师；2026-10-12（Asia/Shanghai）。本记录只覆盖候选 3 的路线节点浏览状态增量；候选 2 的前置、课程控件、继续阅读、学习衔接隐藏及详情按钮证据仍保存在 `app-v14-prerequisite-copy-ui-qa.md`，本次不重跑候选 2 全量项目。

## 收到与静态核对

已收到 `app-v14-prerequisite-copy-frontend-binding3.json`、`app-v14-prerequisite-copy-frontend-node-repair.md` 和 `frontend-history/node-source-change.diff`。差异范围与交接一致：节点依据当前版本阅读记录显示开/合书 SVG，移除可见“本章打开过 / 尚无本版足迹 / 有本人待复习题”小段，保留章节链接、知识点折叠、网格顺序和键盘目标。图形 `aria-hidden`，链接内 screen-reader 文案只描述“本版有阅读记录 / 本版暂无阅读记录”，不表示掌握或完成。

候选 3 binding 中的源哈希和六项公开静态字节均已由客户端收据声明；`learning-workbench.js`、教材、索引、阅读记录及候选 2 资源不在差异中。正式预览进程的会话后健康与静态运输收据也已保存，不能替代渲染验收。

## 独立窄验收状态

独立 UI 专项已使用官方 Codex In-app Browser（IAB，browser id 2）在正式入口完成候选 3 窄复验；测试 tab 为自有背景 tab，正式 4318、用户记录和数据库未操作。候选 3 实际加载资源与 `app-v14-prerequisite-copy-frontend-binding3.json` 公开源绑定一致。候选 2 的阶段性七项结果继续保留，未被本次窄验重复扩大。

| 窄条件 | 状态 | 需要的证据 |
| --- | --- | --- |
| 已访问章节显示开书图标与浅暖边界 | passed | “认识Agent工程”“基础预备”实际显示开页书图标和浅暖边界 |
| 未访问章节显示闭书图标与中性边界 | passed | “Python与模型基础”等实际显示合页书图标和中性边界 |
| 可见状态长文案和多余留白已消失 | passed | 状态说明行不可见，节点路线保留 30 篇且无对应大块空白 |
| 章节点击、知识点折叠、Tab/Enter 入口保持可用 | passed | 知识点真实展开/收起；Enter 与 Tab 实际移动焦点到下一章 |

候选 2 的既有独立 UI 结果不能覆盖上述候选 3 增量。完整职业培养、真实学习效果、用户理解、真人专家和行业先进目标仍为 `not_met`。

## 结论

当前候选 3 结论为 `met_within_tested_ui_scope`。证据见 [独立 UI 专项](app-v14-prerequisite-copy-ui-qa.md)、[UI JSON](app-v14-prerequisite-copy-ui-qa.json) 及其 binding；本次仅覆盖新增节点状态、紧凑留白和键盘/折叠交互，不扩大为候选 2 的旧矩阵。正式 4318 与用户数据未被本专项操作。
