# UI/UX 视觉资产优化设计交接 v0.1

- **岗位**：设计师（视觉资产审计与优化交接）
- **日期**：2026-10-16
- **范围**：只读审阅 `textbooks/uiux-design-v02/` 的 24 章、其 `assets/`，以及 `textbooks/uiux-design-v03/` 的 VA01–VA04；本交接不修改正文、SVG、PNG、预览或 manifest。
- **目的**：让每章的核心判断有可直接审阅的视觉工件，减少同一图跨章重复使用，并为可访问性、响应式、灰度及大字号复验提供统一合同。
- **证据边界**：本文件是资产设计建议，不等于已制作、已渲染、浏览器/读屏实测或真人理解通过。

## 现状盘点

### v02 资产

当前有 8 个主 SVG 和 8 个预览 PNG：`01-workbench-before-after`、`02-ticket-ai-evidence`、`03-refund-state-board`、`04-responsive-390-320`、`05-components-tokens-focus`、`06-role-state-swimlanes`、`07-edge-state-board`、`08-approval-component-migration`。它们均具备 `role="img"`、`aria-labelledby`、`title`、`desc`，并明确标注教学合成/静态设计/未验证边界；这是可保留的元数据基线。

8 个 SVG 在 24 章中被引用 42 次（另有 `tokens.json` 2 次），合计 44 次，且第 24 章一次性复用全部 8 个。复用本身可作为跨章案例锚点，但不能代替本章独立的视觉问题工件。`tokens.json` 是数据工件，不应当被当作一张视觉图；需要配套一张“Token → 状态 → 组件”关系图。

### v03 资产

- **VA01**：正文绑定 `VA01-focus-scan`、`VA01-proportion-scale`、`VA01-rhythm-pause`、`VA01-density-tension`、`VA01-judgment-taxonomy`，另有 `VA01-critique-board`；覆盖较完整，缺一张带真实内容约束的响应式/灰度综合板。
- **VA02**：正文绑定 `VA02-content-state`、`VA02-grid-baseline`、`VA02-whitespace-density`、`VA02-proportion-conditions`、`VA02-density-rhythm`、`VA02-responsive-reflow`、`VA02-fold-line`、`VA02-balance-focus`、`VA02-composition-study`；覆盖完整，但部分小图属于抽象示意，需与同一 R-81 内容的可读版本配对。
- **VA03**：正文声明 `visual_downgrade`，没有独立 SVG/PNG；缺少视觉语言系统总览、Token 分层及四状态对照板。
- **VA04**：正文声明未绑定插图、原型帧或动效视频；缺少精修前后板、动效时间线/降级板、多端字体回退板和交付验收板。

## v02 逐章资产矩阵

“现有”只记录正文实际绑定；“重复/缺口”同时指出该章是否只有跨章图，或缺少标题级首图。建议新图先满足标题下的核心问题，再补练习图；没有新图时应明确 `visual_downgrade`，不能用别章截图冒充。

| 章 | 现有绑定 | 重复与标题级缺口 | 首批建议视觉工件（类型） |
|---|---|---|---|
| 01 角色与证据 | 06 | 角色泳道被 06/16/18 重复；标题要回答“谁对决定与证据负责”，缺责任—证据总览 | `c01-evidence-ownership-map`（责任矩阵+证据链） |
| 02 问题框定 | 无 | 标题级缺图；问题→完成定义→假设→可推翻证据没有图 | `c02-problem-to-test-map`（问题树/假设漏斗） |
| 03 研究设计 | 无 | 标题级缺图；采样、脚本、记录和质量控制全靠文字 | `c03-research-plan-board`（研究计划/采样覆盖板） |
| 04 证据综合 | 02 | 02 是工作台而非编码/矛盾证据图；与 05/14 重复 | `c04-evidence-synthesis-trace`（原子记录→主题→决定链） |
| 05 领域信息架构 | 02 | 复用工作台造成“IA=三栏”误读；缺对象、导航、筛选、租户边界图 | `c05-domain-object-navigation-map`（对象关系+导航上下文图） |
| 06 任务流 | 06、03 | 两张图分别被多章复用；缺进入/退出条件与部分成功的完整流 | `c06-task-recovery-flow`（正常/失败/恢复泳道图） |
| 07 状态契约 | 03、07 | 03/07 被 15/17/19 重复；缺对象、请求、事件、守卫四维状态矩阵 | `c07-state-contract-matrix`（状态机+事件表） |
| 08 线框与原型 | 01、02、03、04 | 四图是结果示例，缺“问题→保真度选择→原型回答什么”的决策图 | `c08-fidelity-decision-ladder`（原型保真度梯子） |
| 09 视觉层级 | 01、02、tokens | 01/02 已被多个章节引用；缺灰度缩略图、扫描路径、非颜色编码对照 | `c09-hierarchy-grayscale-scan`（灰度/焦点对照板） |
| 10 响应式/本地化/无障碍 | 04 | 04 被 08/17/19/21 重复；缺 RTL、长文本、多币种、键盘/读屏语义板 | `c10-inclusive-reflow-board`（320/390/760/RTL/大字矩阵） |
| 11 组件系统 | 05、tokens | 05 只给一套示例；缺组件状态全量矩阵和 Token 关系 | `c11-component-state-contract`（组件状态矩阵） |
| 12 设计系统治理 | 08 | 08 只覆盖审批迁移；缺提案→影响面→例外→回滚治理地图 | `c12-governance-change-map`（迁移/回滚路线图） |
| 13 AI 辅助设计 | 无 | 标题级缺图；缺人工证据与 AI 摘要的边界、输入输出记录 | `c13-ai-assist-evidence-boundary`（人工/AI证据分界图） |
| 14 AI 任务体验 | 02 | 02 已在 04/05/21/24 重复；缺来源卡、生成草稿、人工核验控制链 | `c14-source-grounded-draft-flow`（来源→草稿→核验流程） |
| 15 AI 控制与恢复 | 07、03 | 07/03 重复；缺停止等待、查询、人工接管与副作用边界 | `c15-control-recovery-state-board`（控制/恢复状态板） |
| 16 Agent 多模态体验 | 06 | 泳道不足以表达附件、OCR 修订、计划差异；缺原图→候选→纠正链 | `c16-multimodal-correction-chain`（多模态纠正链） |
| 17 复杂平台 | 07、04 | 两图在多章重复；缺租户/批量/并发/新鲜度的作用域叠层 | `c17-scope-concurrency-map`（作用域与并发叠层图） |
| 18 服务生态 | 06 | 角色泳道不能替代五层服务蓝图；缺渠道—前台—后台—证据—结果断点图 | `c18-service-blueprint-evidence`（服务蓝图） |
| 19 可用性评估 | 01、03、04 | 复用静态稿无法证明用户测试；缺研究任务、观察、关键错误、修订闭环图 | `c19-evaluation-to-revision-loop`（评估闭环板） |
| 20 指标与实验 | 无 | 标题级缺图；缺指标字典、分母、实验分支和停止条件 | `c20-metric-experiment-ledger`（指标/实验台账） |
| 21 工程交接 | 02、03、04、05 | 四图高频复用；缺设计合同字段、事件、验收证据的交接包图 | `c21-handoff-contract-package`（交接包剖面图） |
| 22 协作与产品策略 | 无 | 标题级缺图；缺立场→证据→决定→异议保留→退出条件 | `c22-decision-record-map`（决策记录与路线图） |
| 23 作品集批评 | 01、03、08 | 复用案例图，缺贡献/结果/边界/追问的证据叙事板 | `c23-portfolio-evidence-story`（案例证据叙事板） |
| 24 未知任务结业 | 01–08 全部 | 全量复用造成视觉噪声；缺“未知输入→冻结条件→独立评审→缺口闭环”总图 | `c24-capstone-assessment-map`（独立评审与迁移地图） |

## 标题级配图优先级

优先补 02、03、05、07、10、13、18、20、22、24；这些章节的核心机制目前不能从标题下第一视觉工件直接理解。第二批补 01、04、06、08、09、11、12、14、15、16、17、19、21、23。现有 8 图只做“案例锚点”，不再为缺图章节复制同一文件并改标题。

## 视觉资产制作合同

### SVG 元数据与替代文本

每个最终 SVG 必须包含：

```xml
<svg role="img" aria-labelledby="asset-title asset-desc" ...>
  <title id="asset-title">章节编号 / 视觉命题（含状态）</title>
  <desc id="asset-desc">对象、关系、关键动作、教学构造/未验证边界；不把装饰写进替代文本。</desc>
</svg>
```

同时在 `visual-manifest.json` 登记 `asset_id`、`chapter`、`purpose`、`status`（`teaching_construct`/`implemented`/`validated`）、`source`、`alt_short`、`alt_long`、`language`、`direction`、`min_width_css_px`、`gray_check`、`large_text_check`、`reduced_motion`、`owner`、`version`、`checksum`。短替代文本用于图注/目录；长描述按读者需要复述对象顺序、状态和因果，不复制整章正文。教学构造、静态设计、未验证、合成数据等边界须同时出现在图注和 manifest，不能仅藏在文件名。

### 响应式、灰度和大字号规则

- **响应式**：每张涉及界面的资产至少提供桌面、760 CSS px、390 CSS px、320 CSS px 四个检查视图；记录重排顺序、折叠字段和保留的主动作。不得用等比缩小代替重排；二维表格若需横滚，只限表格自身区域。
- **灰度**：状态必须由文字、形状/图标、位置或边界中的至少两种非颜色线索共同表达。灰度预览中成功、错误、未知、无结果仍须可区分；不可把红/绿或单色点作为唯一语义。
- **大字号/缩放**：正文与关键标签按 200% 放大和系统大字检查；容器可增高，禁止裁切、遮挡、强制固定高度。长中文姓名、英文长词、阿拉伯文、日期、货币和代码样本必须纳入检查。
- **键盘/读屏提示**：图中焦点环、顺序和状态通知只表达设计意图；验收时另测真实 DOM、焦点回归、名称/角色/值和实时状态，不以 SVG 视觉稿宣称合规。
- **动效**：静态资产不含必需动效。若后续制作动效，另交默认/`prefers-reduced-motion`/慢设备三套规格，保留等价文本和状态节点。

## 命名、目录与版本

推荐目录 `textbooks/uiux-design-v03/assets/`（新增图与 VA 图共用版本化目录），文件名格式：

`<chapter-id>-<semantic-purpose>-v<major>.<minor>.<ext>`

示例：`c07-state-contract-matrix-v01.svg`、`va03-token-state-layers-v01.svg`。预览使用同名 `.png` 放在 `previews/`；不要使用 `final.svg`、`new2.svg` 或仅颜色命名。跨章复用保留原 `asset_id`，正文引用写明“本章复用 + 本章读法”，不得复制出无来源的同名变体。

## 分批制作与交接

1. **批次 A：标题级缺口**（02/03/05/07/10/13/18/20/22/24，共 10 张）。先做低保真结构稿和替代文本，由课程架构师确认它回答本章核心问题，再制作 SVG。
2. **批次 B：机制深化**（01/04/06/08/09/11/12/14/15/16/17/19/21/23，共 14 张）。复用已有案例数据但每张绑定独立判断，避免继续扩大高频图的语义负担。
3. **批次 C：VA03/VA04**（至少 6 张）：`VA03-token-state-layers`、`VA03-state-four-way`、`VA03-theme-exception-map`、`VA04-polish-before-after`、`VA04-motion-spec-timeline`、`VA04-cross-platform-fallback-board`。
4. 每批完成后由设计师提供 SVG、PNG 预览、manifest、短/长替代文本和灰度/大字号/响应式检查记录；内容审校核论断与边界，测试工程师独立核可访问性与布局证据。未完成这些检查，状态保持 `design_draft`。

## 验收条件与未关闭项

- 24 章和 VA01–VA04 均有明确资产状态：已有、复用、缺图或 `visual_downgrade`，不留无主标题级缺口。
- 每张新增图能由单一章节问题解释其对象、关系、动作和限制，且不把教学构造写成产品/用户/合规证据。
- SVG 元数据、替代文本、manifest 字段、命名和 checksum 齐全。
- 响应式、灰度、大字号、键盘/读屏的检查结果分别记录；静态设计稿不代替浏览器、辅助技术或真人测试。
- 当前审计未制作任何新资产，也未验证 v02/v03 在浏览器或读屏中的实际表现；这些是下一批设计与 QA 的责任项。
