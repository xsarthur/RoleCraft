# Agent 教材 v13 剩余批次 C 交接

日期：2026-10-16

本批由教材研发员完成，输出六篇 v13 隔离稿，未覆盖 v12 原文：

- `textbooks/v13/e05.md`：质量护栏下的性能与成本
- `textbooks/v13/n08-sandbox-security.md`：沙箱与安全边界
- `textbooks/v13/n09-runtime-delivery.md`：运行时交付
- `textbooks/v13/n10-evaluation-projects.md`：评价与项目
- `textbooks/v13/p01-mvp.md`：MVP 决定
- `textbooks/v13/p02.md`：交付证据与独立复验

每篇保留 v12 的原能力、先修、来源、练习、构造演算与未验证边界，并增加：

- 开篇核心判断和阅读方法；
- 对应 v13 彩色总览图；
- 正文中段的读图停顿，提示读者回到机制、失败和证据；
- 超过 10 行的代码块使用 `details` 默认收起，摘要说明语言、行数、用途与验证状态；
- 一页复盘卡，要求记录任务、边界、失败/未知轨迹和证据缺口。

视觉资产绑定：

- `assets/e05-cost-performance-visual-map-v01.svg`
- `assets/n08-sandbox-security-visual-map-v01.svg`
- `assets/n09-runtime-delivery-visual-map-v01.svg`
- `assets/n10-evaluation-projects-visual-map-v01.svg`
- `assets/p01-mvp-visual-map-v01.svg`
- `assets/p02-delivery-evidence-visual-map-v01.svg`

交接给项目经理：

1. 将六篇纳入 v13 全套教材组装清单，并保持 v12 与 v13 版本隔离。
2. 交由产品、设计和客户端确认代码折叠功能合同、图示中段节奏、窄屏与无障碍表达，再决定部署入口。
3. 交由内容审校员核对新增导语、图示说明、代码摘要未改变原机制；交由测试工程师独立验证默认折叠、展开/收起、深链、脚本降级和图片加载失败。
4. 浏览器渲染、窄屏布局、读屏、真实接口、真人学习效果和生产证据尚未在本批声明通过；本批只是教材 v13 正文交付，不等于整套产品达标。

本批未修改应用代码、数据库、用户记录、v12 教材或正式部署入口。
