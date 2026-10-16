# v13 Agent 教材批次三交接

日期：2026-10-16
责任岗位：教材研发员
范围：`n03-planning-reflection.md`、`n04-tools-mcp.md`、`n05-retrieval-ingestion.md`

## 交付

三篇优化稿位于 `sites/rolecraft/textbooks/v13/`，没有覆盖 v12 源稿。每篇保留原章节的能力目标、来源、示例限制、未验证边界和练习方向，并加入：

- 开篇结论和总览视觉卡；
- 中段失败处理视觉卡，穿插在长篇阅读中；
- 11 行及以上代码使用 `<details>` 默认折叠，摘要标明语言、行数和未运行状态；
- 一页复盘卡，把阅读内容转为目标、证据、权限、预算和停止条件；
- 图像不可用时使用邻近正文、表格或代码作为降级信息。

视觉资产：

- `textbooks/v13/assets/n03-planning-reflection-overview-v01.svg`
- `textbooks/v13/assets/n03-planning-reflection-mid-card-v01.svg`
- `textbooks/v13/assets/n04-tools-mcp-overview-v01.svg`
- `textbooks/v13/assets/n04-tools-mcp-mid-card-v01.svg`
- `textbooks/v13/assets/n05-retrieval-ingestion-overview-v01.svg`
- `textbooks/v13/assets/n05-retrieval-ingestion-mid-card-v01.svg`

## 内容交接

课程架构师：核对三篇与原课程能力、先修、跨章链接和练习去向。

设计师：检查色彩语义、箭头与文字是否分离、节点内边距、窄屏布局、图例、文字替代和中段图的阅读节奏。

软件工程师：确认工作台支持 `<details>` 折叠、静态 SVG、资源路径、深链接和脚本不可用时的可读降级；11 行阈值属于跨端产品功能。

内容审校员：逐篇核对新增结论、图注和复盘卡没有扩大原文证据，也没有把离线演算写成真实互操作或模型效果。

测试工程师：独立复验默认折叠、展开/收起、键盘与读屏语义、窄屏、刷新、图像加载失败和章节链接；记录浏览器实际结果。

## 当前限制

本交接只确认文件已落盘和结构已加入。浏览器渲染、窄屏字体、无障碍操作、真实 MCP 互操作、真实向量/ANN 结果、真实模型规划效果和真人学习效果尚未由本批次证明。v12 仍为历史基线，v13 尚未自动接入正式教材入口。
