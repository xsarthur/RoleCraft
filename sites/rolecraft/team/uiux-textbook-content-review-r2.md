# UI/UX 设计教材 v0.1 · v2 返修窄复核

日期：2026-10-14（Asia/Shanghai）  
责任岗位：内容审校员  
复核身份：AI 技术内容审校；不能替代真人 UI/UX 设计专家、无障碍专家、测试工程师、真实学习者、真人专家或就业评估。

## 结论

本轮只复核原 C01—C10 涉及的返修范围，结论为 **reviewed_with_limitations**。

作者已补上 00—25 单元入口/先修/产物概要映射，直接链接 WCAG 2.2、WAI-ARIA 1.2 和 ATAG 2.0，收窄 ATAG 边界，修复同一视觉题型簇内的 059/060 重复，增加状态 SVG，并把保真度改写为由当前未知决定。C01 的“范围诚实性”、C03、C04 和 C10 可在静态范围关闭。

仍保留：AI 状态契约虽然扩展了取消、低置信和受控重试，但 ResultCard、状态表和 RetrievalState 仍不完全一致；200% 缩放仍没有 320 CSS px/400% 等价重排验收；跨能力题型重复没有 primary/secondary 标注；研究 JSON 哈希仍与课程架构绑定漂移；来源身份和语义支持仍未分层；SVG 未经渲染且把无匹配与不可用合并、没有单独呈现 Cancelled/Ignored。完整 26 单元深读/实作、真实无障碍行为和真人理解仍未验证。

## 本轮绑定文件

| 文件 | SHA-256 |
| --- | --- |
| textbooks/uiux-design-v01/uiux-design-textbook.md | a5406a6db125c3174af7d6228d0fcd57c9030131c4bc321325abf483278ccbd4 |
| textbooks/uiux-design-v01/README.md | d58bd229fe2c6a89064a9eb3d44502e4ba94ac320f006207fc44cd3a60d93ff7 |
| textbooks/uiux-design-v01/sources-and-interview-map.md | 5bf979843e2e97e743afad840becca1cd9dca44f828c7f25d00d3a57428c1229 |
| textbooks/uiux-design-v01/author-handoff-v2.md | ebb98b401e4a9df3008e7ae262683d9e67d91fb51a96676c3bda1d09c063fa43 |
| textbooks/uiux-design-v01/assets/uiux-state-map-v01.svg | 97ea6a67ed5ac29ba5f244ff9e35b1392a38486c13d1986c436230fd343b1254 |

## 逐项结果

### C01 — 26 单元映射诚实性

**状态：closed_static_with_scope_limit。**

README 第 36—73 行新增 00—25 的入口、先修、本稿产物和“主线覆盖/概要”状态，并明确 12 章只是概要版；author-handoff-v2 第 17—31 行继续列出未独立完成的研究编码、RTL、Figma 可编辑原型、多模态/Agent 夹具、服务蓝图、陌生任务和独立评估。这解决了原来可能把 12 章目录误读为 26 单元已完成的问题。

保留限制：这只是导航和责任交接，不是 26 个单元的深读/实作交付。不得将本项关闭解释为课程完整通过。

复验责任：课程架构师逐单元核真实正文、练习、失败夹具和作品位置；QA 核文件可打开和状态可达性。

### C02 — AI 状态契约一致性

**状态：open，P2（原 P1 范围已收窄但未闭合）。**

已改善证据：

- 正文第 120—145 行加入 LowConfidence、Cancelled/Ignored、迟到响应、受控重试和新 queryId/幂等键。
- 第 232—247 行类型加入 cancelRequested、low_confidence、retryCount、cancelled，并明确取消仅停止客户端等待。
- 第 186 行要求组件状态与第 3 章一致，并说明低置信、来源核对中和取消的用户动作。

残留矛盾：

- ResultCard 第 177 行仍只有 recommended/source-checking/blocked；第 186 行又要求 low_confidence/cancelled，RetrievalState 第 235—244 行却没有 source-checking 或 handoff 状态。
- ResultCard 的 excerpt 标为 optional，第 240 行 RetrievalState.result 仍要求 excerpt: string。
- Recommendation 第 84 行仍有 confidenceLabel/createdAt，但结果类型没有对应字段；sourceVersion/sectionId 也没有把语义支持状态纳入同一契约。
- SVG 第 40—43 行把“无匹配 / 不可用”合并为一框，未与正文分别的 NoMatch、Unavailable 状态对应；SVG 没有独立 Cancelled/Ignored 节点或取消箭头。

影响是读者仍不能从同一契约重建来源核对中、人工接管、摘录缺失、取消后迟到响应和无匹配/服务不可用的不同文案与操作。

复验责任：教材研发员统一状态机、字段和图稿；课程架构师确认 15—17 单元覆盖；QA 以确定性夹具逐边对照图、表、伪代码和组件状态。未编译、未接 API、未测取消/幂等。

### C03 — 规范邻近引用

**状态：closed_static_with_runtime_limit。**

正文第 212—214 行已直接链接 WCAG 2.2、WAI-ARIA 1.2 和 ATAG 2.0，并说明这些链接不能替案例提供合规结论；sources-and-interview-map 第 7—14 行也将规范一手来源与方法建议、设计系统参考分开。当前可关闭“没有邻近引用”的静态缺陷。

仍需 QA/工程按目标浏览器、辅助技术和版本实测；本轮没有验证 ARIA 语义、动态结果或焦点行为。

### C04 — ATAG 适用范围

**状态：closed_static_with_runtime_limit。**

正文第 214 行和来源表第 11 行已将 ATAG 收窄为作者工具如何支持可访问内容的背景，明确不声称 Figma 文件或案例符合 ATAG；最终网页实现仍按 WCAG/ARIA 和实测负责。静态边界已修正。

本项不代表任何创作工具、设计文件或产品实现获得 ATAG/WCAG 合规结论。

### C05 — 200% 缩放与可观察语义

**状态：open，P2。**

已改善：正文第 212 行补了 WCAG/ARIA 邻近链接、语义名称、动态结果和工程实测边界，并要求 200% 缩放检查内容重排、焦点和遮挡；第 190 行要求设计师提供可观察语义而不是只写 aria-live。

残留问题：练习第 218 行仍只要求 200% 缩放，没有 320 CSS px/400% 等价重排、文本间距或横向双向滚动验收；“具体 aria 属性交给工程”仍未给出一个不绑定框架的最小交接例。200% 可以作为早期版式检查，不能替代 WCAG 2.2 Reflow AA 场景。

责任与复验：作者补充 320 CSS px/400% 等价和最小语义交接条件；QA 以目标浏览器/读屏/键盘/缩放实际复验。静态链接不等于通过。

### C06 — 题型重复与来源分类

**状态：partially_closed_open，P2。**

已关闭部分：sources-and-interview-map 第 34 行删除了同一视觉题型簇内重复的 059/060，并新增规范一手来源、方法建议、设计系统参考等类别；表中注明该簇每条 ID 在该簇内只出现一次。

保留问题：跨能力簇仍重复 047—050、061、073、100—103 等题号，且没有 primary_unit/secondary_unit 字段或单独的交叉训练说明。课程架构规格要求对跨单元变体保留主/次映射；当前来源表只能说明题型存在，不能唯一计数或复现 26 单元主映射。

责任与复验：课程架构师/竞品研究员补主次映射和 001—103 展开计数；QA 复核唯一主映射，不能用行数替代唯一 ID 数。

### C07 — 面试研究来源版本/哈希

**状态：open，P2。**

课程架构仍登记 JSON SHA-256 7aa79f20...，工作区当前 JSON SHA-256 为 0f2dfd9d...；当前 JSON 可解析，但架构文件仍写“第 73 行存在 JSON 语法错误”。author-handoff-v2 没有重新绑定研究文件哈希，只保留 103 条限制说明。因此题型证据仍不能按课程架构登记版本直接复现。

责任与复验：竞品研究员冻结唯一来源版本，课程架构师更新 hash、解析状态和变更记录；QA 重新运行 ID、来源和主次映射检查。当前文件可解析不等于旧绑定已恢复。

### C08 — 来源完整性与语义支持分层

**状态：open，P2。**

正文仍以 sourceVersion、sectionId、excerpt 和 provenance.checkedAt 表达来源，但没有把版本/哈希身份与“摘录是否支持推荐理由”的语义证据分开。第 240 行仍只提供 sourceVersion、sectionId、excerpt；没有摘录范围、support 状态、责任人核验或版本变化状态。正文虽然禁止把候选当答案，却没有让学习者能从契约区分“能定位原文”和“原文确实支持理由”。

责任与复验：作者补 identity/provenance 与 support/evidence 两层；检索/AI 生成岗位交接真实字段；用歧义、来源冲突和版本更新夹具复核文案边界。未运行检索或模型。

### C09 — SVG 视觉稿

**状态：partially_closed_open，P2。**

已关闭部分：README 第 73 行绑定 assets/uiux-state-map-v01.svg；SVG 有 title/desc、教学静态稿声明，包含输入、检索中、带来源结果、低置信/澄清、来源失配、人工接管和重新提交，且 XML 解析成功。它补上了原来没有可直接审阅视觉稿的缺口。

保留问题：

- SVG 第 40—43 行把 NoMatch 与 Unavailable 合并；正文第 141—143 行把它们定义为不同失败原因、操作和失败信号。
- SVG 第 25—29 行只在“检索中”文字写取消=忽略迟到结果，没有单独 Cancelled/Ignored 节点和箭头；第 60—70 行的连线也没有标注取消动作。
- SVG 没有明确图例说明颜色只作辅助、键盘/读屏/200% 及真人任务测试依赖，虽然底部文字有概括性声明；没有浏览器或真实设备渲染证据，不能判断中文字体、文字裁切和小字可读性。
- SVG 标题写 v0.1，未在作者交接中绑定哈希，当前报告才记录哈希。

责任与复验：设计师/教材研发员拆分 NoMatch/Unavailable、补 Cancelled/Ignored 或明确合并条件；QA 实际渲染并核视力、键盘、读屏、缩放和窄屏。真人理解仍需用户研究。

### C10 — 保真度条件

**状态：closed_static。**

正文第 163—165 行已按当前未知分类：任务/流程用低保真，长文案/状态/键盘/跨屏用中保真，视觉层级/品牌/动效/工程精确边界才投入高保真；还给出“视觉冻结但异常状态未知时退回低保真状态图”的反例。已解决固定线性流水线的表述问题。

## 静态验证与限制

1. 四个教材 Markdown 文件的相对链接均存在；SVG 由 Python XML 解析器读取成功，包含 title、desc、9 个 rect 和 11 条 path；未做浏览器/设计软件渲染。
2. 产品范围和课程架构 JSON 语法有效；当前面试研究 JSON 语法有效但哈希仍与课程架构绑定不一致。
3. 未编译 TypeScript，未运行 AI/检索服务、浏览器、Figma、读屏、键盘、缩放、真实模型、真实用户或可用性测试。
4. 本轮只复核 C01—C10 的返修范围；没有把作者新增 SVG 或概要映射当成完整课程、真实应用或职业能力证据。
5. 外部规范只用于静态边界核对；没有据此声称教材或产品合规。

## 下一步复验

1. 作者修正 C02、C05、C08，并让 SVG 的状态粒度与正文一致后，提交新 hash；内容审校复读相关行。
2. 课程架构师/竞品研究员冻结 C06/C07 的题型版本、主次映射和哈希；QA 运行唯一 ID、来源和章节检查。
3. 设计师与 QA 实际渲染 SVG，执行键盘、读屏、缩放和窄屏检查；用户研究员另取真人任务理解。
4. C01 的 26 单元深读/实作、真实学习效果、真人专家、生产运行和求职证据继续由对应岗位分别取证。

本报告不修改作者正文、README、来源映射、作者交接或 SVG；原 v1 审校记录保留，r2 只绑定本次文件版本。