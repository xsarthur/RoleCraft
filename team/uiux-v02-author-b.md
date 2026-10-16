# UI/UX v02 教材研发员B交接

日期：2026-10-14。岗位：教材研发员；独占第13–24章及 `exercises/13-24/`。当前状态：十二章正文与可复算工件已交付，待独立内容审校和QA；总书组装等待PM通知A冻结。

## 实际读取与沿用

已读产品 `uiux-v02-product.md`、课程 `uiux-v02-curriculum.md`、`UIUX_TEXTBOOK_WRITING_STANDARD.md`，参考Agent `v12/c01-control-loop.md` 的状态/恢复/逐事件解法；已读长期 `TEXT-MEM-0002` 与 `CORE-PREF-EDITOR-001`、`ANSWER_QUALITY_STANDARD.md` 和课程交接。沿用多角度细致解释、条件/机制/实践/反例，未沿用Agent的语言先修。旧教材、应用、数据库和历史报告未编辑。

所有B稿使用澄明售后工作台：t-lotus云帆家居美国站、t-maple、林晓/许然、Maya、杯子破损、T-1042/O-7819、R-81、P-07@v3、Draft-17。按PM与A统一，退款当前批准版本R-81@v4、修改后v5；Draft-17@2是独立草稿版本，不随之更改。¥268 CNY明确为合成教学结算。

## 逐章产物与作者自查位置

| 章/文件 | 已写核心机制与实际工件 | 失败/参考解析 | 未验证 |
| --- | --- | --- | --- |
| 13-ai-assisted-design | 六段合成片段、原句→摘要→核对表、两方案与AI使用记录 | “普遍/显著”假结论撤回、三层分析 | 无真实研究或模型调用 |
| 14-ai-task-experience | Draft-17任务合同、identity/support、四句完整修订 | 过期/不支持/人工编辑保护、模板与生成选择 | 无实际语义核验服务 |
| 15-ai-control-recovery | 双对象状态矩阵、R-81绑定、完整失联核对轨迹 | 取消/迟到/并发/不可查询、确认无效果边界 | 无真实退款与幂等测试 |
| 16-agent-multimodal-experience | 原图/OCR/解释/决定分层、三版计划diff、接管包 | OCR误读、两设备/人工接管/预算到期 | 无OCR、录音或Agent运行 |
| 17-complex-platforms | 多租户权限矩阵、十项逐行批次、并发版本差异 | 3/10成功、权限撤销/冲突/未知分开恢复 | 无真实隔离/键盘/并发测试 |
| 18-service-ecosystem | 五层服务蓝图、H-81接收、三系统状态映射 | 队列无人接收/夜间/回执延迟、两种集成路径 | 时限与队列均合成 |
| 19-usability-evaluation | 两中立任务、八条合成观察、竞争根因、修订矩阵 | 提示污染、焦点/范围/危险重试原例复验 | 无真人或辅助技术执行 |
| 20-metrics-experiments | 2×2、32行CSV、分母/缺失敏感性/角色劳动、可复算脚本 | 采用者偏差、集群/顺序/混杂、风险护栏 | 仅合成计算，无效果/因果证据 |
| 21-engineering-handoff | 字段/事件、六验收场景、差异DQ-03、签收边界 | unknown被实现为error、缺查询的降级 | 无真实工程签收 |
| 22-collaboration-product-strategy | 四立场证据、两MVP、权责/异议、路线/退出条件 | AI优先与安全冲突、预算减半、复议条件 | 人力/会议/预算均合成 |
| 23-portfolio-critique | 两不同能力案例、贡献证据表、完整面试答、现场critique | 撤回虚构30%、不自动退款的多条件解释 | 无学员亲历或求职结果 |
| 24-unknown-capstone | 完整案例链、交付包、未知冻结协议、角色证据评价 | 新领域重建、原例/受影响复验、条件解 | 不代学员完成留出题，无L4认证 |

D01–D10对应检查：各章首节固定核心条件，主体表格和轨迹给出D02–D04，方案比较和失败节对应D05–D07，末节三层展开分析对应D08；邻近官方链接/合成标签对应D09–D10。此表是作者自查定位，不是独立通过结论。

## 官方来源实际浏览

2026-10-14通过web工具打开并阅读：Microsoft Research Human-AI Interaction研究页（2019），NIST AI RMF入口，NIST实验设计选择，Microsoft租户随机实验方法，GOV.UK完整旅程/主持式可用性测试/深访方法，W3C WCAG重排/状态消息/焦点不遮挡，APG Grid与Dialog，AWS超时重试与抖动。正文按实际相关主张邻近链接；不以方法页证明本案例效果。没有使用外部付费API、上传、发布或联系他人。

## 计算与工件执行状态

`exercises/13-24/synthetic-experiment.csv`有32行显式synthetic数据、8个构造参与者×4条件。`analyze_experiment.py`只使用标准库，实际于本机Python 3.14.5执行退出0，结果保存 `calculation-output.json`。当前每格8分配任务；安全率75/87.5/62.5/75%；01时间缺失一项；合成计算得A差+12.5pp、B差−12.5pp、交互0。它们不能解释为真实效果/统计显著/因果；重复参与者与仅两租户不支持独立样本推断。Wilson只展示教学公式，不作推断。脚本执行是作者开发自查，独立QA仍待执行。

八幅SVG由设计师独占，作者只引用，没有写、改或审校自己的图。已向PM反馈图03部分面板CNY显式呈现需由设计/QA核。正文没有声称浏览器、键盘、读屏、320px或200%缩放实际通过；静态图不等于可交互原型。

## 已知边界与下一步

1. 正文/表/假设是完整教学演示，无真实用户/专家/市场/生产/求职结果；高级训练供给不授高级任职。
2. 教学业务规则与权限不是法律/财务规定；真实参数与运营SLA需要责任人确认。
3. 无真实模型、OCR、语音、退款、数据隔离或外部接口调用；服务语义均需工程实现并独立验收。
4. 当前12章与A章状态名语义需独立跨章核对，退款版本已统一；图/文/合订的最终一致性待组装后复验。
5. B不修改A章节，待PM通知A冻结再做README、完整合订、来源索引及组装绑定。任何发现交原岗位返修。

## 当前文件SHA256

以下绑定为本次作者交付时刻；独立审校后返修必须重新绑定，不以本表代QA。

| 文件 | SHA256 |
| --- | --- |
| `chapters/13-ai-assisted-design.md` | `6c41855ff9db05ed5bfddd9c7059ed9a75a6a38558764972373c2524bb966eff` |
| `chapters/14-ai-task-experience.md` | `2dc59fcaeacb21e2e5b45463e796189ea1c747aa125035e23bf8070b4859fe41` |
| `chapters/15-ai-control-recovery.md` | `fa2b017230792f532a50ed701927ee0eeeafb46493b404a8a43026c395daaeaf` |
| `chapters/16-agent-multimodal-experience.md` | `52f4623419b0c76120da15af7aade268706dcc73ba2629d2fc4ecefbc3a7ffb1` |
| `chapters/17-complex-platforms.md` | `c5cedaec689df05d31e9185c72f844cb0a3a5eb4fd3e8b5cd711e91e49c377e8` |
| `chapters/18-service-ecosystem.md` | `086e25c2f76ef22d200ac266bfc980da8af7d43e92e1db99b2ca0b56860e316c` |
| `chapters/19-usability-evaluation.md` | `295e55c225fd8f23c2128cba7ef472c6f9368e74a884310d93b75692ae7104ba` |
| `chapters/20-metrics-experiments.md` | `621dd39089e7c306e13f533c78c7bb35fcf578d2328a6d4956d35e8f7a5c19d6` |
| `chapters/21-engineering-handoff.md` | `d58e4193d94cefcafa8e36ef71a1e7a4abca1c9f872b060b3b536aacfc5fd689` |
| `chapters/22-collaboration-product-strategy.md` | `1f40bc0f66fc6b7b31548177844a5c9ae0037f5563a007c1b716a43f5c1a86b9` |
| `chapters/23-portfolio-critique.md` | `c46a0da2c2c3909233ef905c364a96f176e27214b3b5b9fc0497b23c5908d619` |
| `chapters/24-unknown-capstone.md` | `55319c722491917d9642317b9a8d88c05a3212abd0aab2d021911da0f2b7d3d6` |
| `exercises/13-24/analyze_experiment.py` | `fe2cd58151f517e6ccdf008698f8b18638a76b354ad5ee0152dded8abd8252cf` |
| `exercises/13-24/calculation-output.json` | `a13f21b9d82cfab07f80a2d2f0c5aad6624bd379fe62e69aa52e99eff6a6bda4` |
| `exercises/13-24/synthetic-experiment.csv` | `3a069e4253606738a54727a4bd03fbb34876bc33acfebfa00fa4e6027f7626a2` |
