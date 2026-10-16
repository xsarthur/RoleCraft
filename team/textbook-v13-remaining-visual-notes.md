# Agent 教材剩余单元视觉资产交接 v13

## 交付范围

本次为尚未优化的 17 个单元制作统一的中段/概览视觉资产，未修改任何教材正文：

- `00-learning-route`
- `01-foundation`
- `n01-python-model-foundations`
- `p01-discovery`
- `c02`
- `c03`
- `c01-control-primer`
- `c01-fixed-workflow`
- `e01`
- `e03`
- `e04`
- `e05`
- `n08`
- `n09`
- `n10`
- `p01-mvp`
- `p02`

## 资产清单

所有文件位于 `sites/rolecraft/textbooks/v13/assets/`，命名为 `<单元>-visual-map-v01.svg`。每张图使用 1080×370 画布，四个语义区块依次表达输入、控制/决策、验证/证据与边界/停止；箭头只位于卡片之间的空白区域。

| 单元 | 资产 | 视觉任务 |
|---|---|---|
| 00 | `00-learning-route-visual-map-v01.svg` | 从问题识别到工程证据 |
| 01 | `01-foundation-visual-map-v01.svg` | 输入诊断到可判错小程序 |
| n01 | `n01-python-model-foundations-visual-map-v01.svg` | 共享对象、队列、输出边界 |
| p01-discovery | `p01-discovery-visual-map-v01.svg` | 用户任务、反例、现实基线 |
| c02 | `c02-evidence-package-visual-map-v01.svg` | 资料版本到支持判断 |
| c03 | `c03-tool-write-visual-map-v01.svg` | 提议、校验、授权、去重发送 |
| c01-control-primer | `c01-control-primer-visual-map-v01.svg` | 提议、动作身份、尝试、效果 |
| c01-fixed-workflow | `c01-fixed-workflow-visual-map-v01.svg` | 合同、固定步骤、校验、闸门 |
| e01 | `e01-persistent-state-visual-map-v01.svg` | 提交点与可恢复事实 |
| e03 | `e03-permission-visual-map-v01.svg` | 威胁、读取、投影、发送授权 |
| e04 | `e04-release-rollback-visual-map-v01.svg` | 版本组合、启动校验、回退 |
| e05 | `e05-cost-performance-visual-map-v01.svg` | 质量护栏、延迟、成本、价值 |
| n08 | `n08-sandbox-security-visual-map-v01.svg` | 不可信输入到隔离执行 |
| n09 | `n09-runtime-delivery-visual-map-v01.svg` | 长任务状态、容量、熔断、补偿 |
| n10 | `n10-evaluation-projects-visual-map-v01.svg` | 业务责任、基线、实验、移交 |
| p01-mvp | `p01-mvp-visual-map-v01.svg` | 问题证据到 MVP 决定 |
| p02 | `p02-delivery-evidence-visual-map-v01.svg` | 入口、运行证据、结果、独立结论 |

另提供可复用模板：`v13-visual-card-template-v01.svg`。

## 使用规则

- 色彩用于分组：蓝色表示输入/目标，琥珀表示控制/决策，绿色表示验证/证据，红色表示边界/停止；颜色不能成为唯一编码。
- 箭头不穿过文字、卡片或图例；修改文本后必须重新检查卡片内边距和箭头空隙。
- 每张图在正文附近配一条阅读任务和文字替代；图片不可用时，正文仍需能独立表达机制。
- 图内短句只保留机制名、状态名和证据名，详细解释放在邻近正文，避免把图变成连续段落。
- 画布按 1080px 设计，窄屏时允许横向滚动或降级为四步列表；最终如何呈现由产品、设计和客户端岗位共同确认。
- 统一保留“设计稿 v01｜来源：对应单元正文｜浏览器、窄屏与读屏尚未验证”标记，不能把静态视觉稿称为已完成产品功能。

## 交接与边界

- 设计师：确认信息层级、视觉语义、箭头避让、窄屏与无障碍表达。
- 课程架构师/教材研发员：确认图中四步确实来自对应单元的教学机制，并补充每图的邻近阅读任务。
- 产品经理：决定这些资产在章节开头、中段或学习工作台中的展示位置与密度。
- 软件工程师：实现 SVG 安全渲染、降级文本、深链与折叠/展开共存行为。
- 测试工程师：独立复核渲染、窄屏、键盘/读屏、箭头不遮字、图片失败时的正文可读性。

本交付只提供视觉资产和设计交接，未触发教材接入、应用发布或最终验收。真实浏览器渲染、窄屏和真人理解仍待各责任岗位复核。
