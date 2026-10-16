# 专业学习资料内容审校 v0.1

- 审校日期：2026-10-14（Asia/Shanghai）
- 审校岗位：内容审校员（独立审校）
- 审校范围：`team/resource-research-a.md`、`team/resource-research-b.md`、`team/role-training-framework-v01.md`、`team/professional-learning-resources-v01.md`、`team/professional-learning-resources-v01.json`
- 方法：逐项阅读标题、机构/作者、URL、相关性和局限；对代表性及高时效条目打开官方/大学/标准/原作者页面核对标题、提供者和主要描述；未执行课程、未参加考试、未运行代码、未评价学习者能力。
- 结论：`reviewed_with_limitations`

## 结论先行

A、B两批研究清单的大部分资料确实来自大学、标准组织、政府、供应商官方文档或原作者页面，且总体上把“阅读输入”与“岗位胜任”分开。Andrew Ng/DeepLearning.AI 的 `Agentic AI` 条目、Wharton 六周产品课程、Stanford 学习结果指南、MIT 6.005、ISTQB CTFL v4.0.1、OpenStax `Writing Guide with Handbook`、OpenAI Agents SDK 文档、GOV.UK 用户研究、ISO 9241-210、NIST AI RMF、Stanford IR/Elastic/BEIR/Sentence Transformers 等主要标题与用途描述均能在所列来源中找到支撑。

整合目录当前不能通过内容审校验收，原因是结构会改变资料含义：目录只有 PM 行有 `role_id`，其余 31 行均为 `null`；A 批资源没有进入目录；目录声称“34 项、15 岗均有资源条目”无法由当前 JSON/Markdown 证明。当前可识别的目录角色只有 `PM`，无法把资料交给对应岗位，也不能核对每岗主资料/互补资料覆盖。该问题属于整合缺陷，不是来源质量通过。

## 已核事项

### 来源身份和主要用途

- **A 批**：Wharton、MIT Professional Education、Stanford Teaching Commons、ASCD/UbD、Carnegie Mellon OLI、W3C、Apple、Stanford d.school、MIT OCW、University of Helsinki、Google SRE、ISTQB、ISO/IEC/IEEE、Oxford、Google Developers、OpenStax、DeepLearning.AI、Anthropic、OpenAI、Stanford、Google Cloud、Martin Kleppmann 等来源与列出的提供者/原作者身份基本相符。
- **B 批**：DeepLearning.AI、Anthropic、OpenAI、GOV.UK、ISO、Harvard Business School、MIT OCW、美国司法部、European Commission、AERA/APA/NCME、ETS、Ofqual、MIT、Microsoft Learn、Google Analytics、NIST、COPE、University of Chicago Press、W3C、U.S. Government、Stanford NLP、Elastic、BEIR/NeurIPS、Sentence Transformers 等来源与列出的提供者身份基本相符。
- NN/g、Elastic、Sentence Transformers 和 BEIR 是专业研究/项目/厂商材料，应继续标为补充资料、方法指南或评测资源，不能写成国际标准或独立职业资格。
- `Agentic AI` 页面可核对到 Andrew Ng、DeepLearning.AI、Intermediate、7h45m、31 lessons、7 code examples、8 个 PRO graded assignments 以及 reflection/tool use/planning/multi-agent/evaluation 等学习要点。将其描述为 Agent 工程入门输入有来源支持；不能由课程时长或证书推出生产能力。
- Anthropic 文章确实区分预定义 workflow 与动态 agent，并建议从简单方案开始；这是 Anthropic 的工程经验和日期化文章，不是跨厂商基准。来源页面还提示 2024 年文章中的工具版图已经变化，正式目录应保留这一时效提示。
- OpenAI Agents SDK 的官方 Python 文档和 `developers.openai.com` 指南确实包含 agent、tools、handoffs、guardrails、sessions、MCP、tracing、testing 等原语；文档示例需要 API key、SDK/模型版本和运行成本记录，作者稿的边界方向正确。
- `Writing Guide with Handbook` 的 CC BY-NC-SA 4.0 表述是正确的。OpenStax 页面还明确说明该书内容不得在未获书面许可时用于训练大型语言模型或摄入生成式 AI 服务；这一限制应进入正式资源卡和再利用说明。
- ISO 9241-210:2019 页面显示该版本在 2025 年复核后仍为 current；正文需要购买，且标准仅提供人本设计活动框架，不是完整 HCI 方法包或本项目合规证明。
- AERA/APA/NCME 2014 Testing Standards 的联合机构和效度、公平、可靠性、测试使用范围描述有来源支持；AERA页面仍将 2014 版列为权威版本。它不能直接替本项目设定岗位分数。
- NIST AI RMF Core 当前页面明确为 Govern/Map/Measure/Manage 四函数，并说明 1.0 正在更新；B 批“自愿框架、需关注后续 Profile/生成式 AI 更新”的限制是必要的。
- GOV.UK `Plan user research for your service` 页面在审校日显示 2026-10-06 更新，研究目标、用户群、招募、无障碍参与和持续研究的描述可核；其英国政府服务语境限制应保留。
- MIT ESD.36 补充条目是 2012 年研究生课程，官方课程描述确实包含 CPM/PERT、DSM、系统动力学、风险、成本/进度/技术进展和复杂项目案例，并明确不提供项目经理认证；PM 补充资源的方向合理。
- PMI 页面当前显示 PMBOK Guide Eighth Edition，并列出 408 页、六项原则、七个绩效域及 AI/PMO/采购扩展；整合目录应保留 `Eighth Edition`、访问权限和 PMI 认证边界。

## 待复核或需修订事项

### 1. 整合目录的结构和遗漏（高优先级）

- `professional-learning-resources-v01.md/.json` 共 34 条，其中 3 条为 `PM`，31 条 `role_id: null`。预期十五个岗位，当前仅有一个可识别角色。
- A 批的 Wharton、MIT 产品、SVPG、Stanford/UbD/OLI、WCAG/Apple/d.school、MIT 6.005/Full Stack/SRE、ISTQB/ISO/Oxford、Google 写作/OpenStax、AI 三条、后端四条均未进入整合目录。该遗漏使产品经理、课程架构师、设计师、软件工程师、测试工程师、教材研发员、AI 生成工程师和后端数据工程师失去目录绑定。
- 目录的“当前整合共 34 项，15 岗均有资源条目”是当前版本不支持的陈述，应在恢复 A 批并为 B 批补 role_id 后重新计数。不能以 PM 补充三条抵销 A 批遗漏。
- A、B均包含 AI 生成工程师资料，整合时需去重并保留来源批次；不要把重复条目误报为额外岗位覆盖。

### 2. URL、标题和版本

- B 批 `AI Agents in LangGraph` 使用 `https://www.deeplearning.ai/alpha/short-courses/ai-agents-in-langgraph`。审校时可访问的 canonical 页面是 `https://www.deeplearning.ai/courses/ai-agents-in-langgraph`；旧路径带有 `alpha/short-courses`，应更新并记录课程页面当前的 1h32m、9 lessons、PRO/阶段性免费等状态。
- B 批 `European Commission Market Definition Notice` 链接是 2020 年咨询/评估页面，页面明确标出咨询期已结束，并指向 1997 Notice 的评估。欧盟当前相关 Notice 已于 2024-02-22 发布，建议改用 EUR-Lex `CELEX:52024XC01645`（`https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ%3AC_202401645`），保留“欧盟竞争法语境”限制。
- A 批 `Professional Data Engineer Learning Path — Google Cloud` 的 URL 实际是 **Professional Data Engineer Certification** 页面；该页再链接 Data Engineer Learning Path。标题和 URL 需要拆分，分别记录认证页、备考学习路径、考试费用/语言/有效期和“推荐三年以上经验”。
- A 批 `Designing Data-Intensive Applications` 所列 `dataintensive.net` 是 Martin Kleppmann 的第一版书籍落地页，页面版权年份为 2014–2019。作者网站和 O’Reilly 当前资料显示 2026 年第二版由 Martin Kleppmann 与 Chris Riccomini 合著。若保留“2026 年已有第 2 版”，必须换成版本明确的出版社/作者链接，并在作者栏加入 Chris Riccomini；旧版与新版的命令、章节和示例不能混用。
- A 批 MIT 产品课程当前页面显示 9–12 个月和 $15,950（页面随地区/批次变化）；研究稿只写“周期长且学费高”，方向不冲突，但正式资料卡应写访问日、币种、批次、语言、报名/退款与地区限制。
- Wharton 页面当前显示 6 周、每周 4–6 小时并有项目费；A 批写“6 周项目型课程”得到页面支撑，但费用、批次和是否含 AI Tutor 等动态内容仍需按学习启动日重查。
- Elastic `Ranking and reranking` 页面当前文档标注 v9.0+，并将 BM25、向量检索和 RRF 作为 Elasticsearch 能力。资料可以作为厂商实现案例，不能把其 API 或效果外推成所有检索系统的标准；正式卡需绑定文档版本和本项目中文测试集。

### 3. 许可、费用、区域和语言字段不完整

- framework 要求 `cost_and_access`、`language`、`source_version`、`maintenance_or_publication_date`、`known_limits` 等字段；当前整合 JSON 只保留 `role_id/title/provider/url/stage/limitations/accessed_at/batch`，缺少这些字段，不能直接进入正式先修目录。
- A/B研究稿虽在多处写了“可能付费、PRO、需购买、英国/美国语境、英文材料”，但没有逐条记录访问方式、地区、语言、当前版本和许可。所有条目在目录修复时都需补齐。
- OpenStax除 CC BY-NC-SA 4.0 外，还有限制将内容用于 LLM 训练/生成式 AI 摄入；教材研发员若要摘引或改编，必须把授权范围和署名要求交给项目经理/课程架构师登记。
- ISO、Chicago Manual、PMBOK、MIT Professional Education、Wharton、Google Cloud 认证、DeepLearning.AI PRO 等费用/登录/地区条件要以访问日记录，不能用“公开网页”统一标为免费。

### 4. 描述边界

- 研究稿中的“可支撑本项目定义八门槛”“直接对应本项目生成服务”“帮助形成端到端工程能力”等句子属于项目映射推断，不能当作来源本身的学习成效或保证。正式目录应使用“可作为……输入/用于设计练习”，并把映射理由和项目证据分开。
- 课程、文章、厂商文档、标准摘要和证书只能提供理论输入或能力地图。阅读、完成课程、通过考试、获得证书、一次 demo 成功、一次检索成功都不支持“已胜任、已认证、已具备生产能力、已达到行业先进”的结论。A/B稿和整合目录已有这条总边界，应在每个资源卡保留。
- `PMBOK`、`ISO`、AERA、Ofqual等材料属于标准/监管语境，不能直接宣称项目遵循后即合规；需说明适用辖区、版本和本项目采用的具体条款。
- `NN/g`、SVPG、Anthropic、Elastic、Google Cloud、Microsoft Learn、Google Analytics等材料属于作者/厂商/工具语境，必须保留其立场、产品或规模前提；不能改写成无争议通用理论。

## 不支持项（当前版本不得保留为通过结论）

1. 当前整合目录已经完成十五岗覆盖：`role_id` 空值和 A 批遗漏直接否定该结论。
2. 目录中的 31 条 `null` 资料已经属于 AI、UR、COMP、PRACT、OPS、REV 或 RETR 中某一岗位：当前文件没有可审计绑定。
3. 仅凭课程/证书/阅读就能授予岗位等级、职业资格、PMI/ISTQB/Google Cloud认证之外的能力结论：来源与项目规则均不支持。
4. `European Commission Market Definition Notice` 2020 咨询页可以作为 2026 训练的当前欧盟 Notice：该页是评估/咨询入口，应替换为 2024 Notice 或明确标为历史背景。
5. `Designing Data-Intensive Applications` 的第一版作者页可以直接证明 2026 第二版章节/命令：版本和合著者不一致，需改为版本明确的出版社/作者来源。

## 复验交接

- **课程架构师/资源研究员**：恢复 A 批全部条目，给 B 批和 PM 条目补齐十五个 `role_id`，去重 AI，更新 LangGraph、欧盟 Notice、GCP Data Engineer、DDIA 链接和版本；补齐费用/语言/许可/访问字段。
- **教材研发员**：若摘引 OpenStax 或其他受许可内容，先记录许可和署名；把“来源学习输入”和“本项目作品要求”分成两层。
- **产品经理**：确认 PM 的理论主题和资料目录是否满足项目经理岗位，确认“主资料/互补资料”判定口径。
- **测试工程师**：待目录返修后独立核 role_id、十五岗覆盖、URL可访问性、版本/访问日、费用/许可字段和不把课程写成能力结论；保留本次 null/A批遗漏作为首失败。
- **内容审校员**：待返修目录出现后复核上述高优先级条目；本报告不因作者修复自动变为通过。

## 当前范围结论

本审校只确认资料身份、主要描述与限制是否有来源支撑。没有执行任何课程、代码、API、考试、实训、用户研究或专家评审；学习效果、职业胜任、真实用户价值、生产可用性和行业先进性继续为 `not_assessed`。整合目录当前状态应保持 `catalogued_not_assessed`，并登记结构性首失败。

## 审校输入哈希

- `resource-research-a.md`: `ab5168eadd2a56b74391de35579e4dacc5d49ec961d75eeb5fea4f268b93c0c2`
- `resource-research-b.md`: `8114608fd79a86e6f7ba7170bcdd4e57db006ff0ce1fbacf9c50b8579d21cff5`
- `role-training-framework-v01.md`: `081ee0f07b1a9b0a18585ca1d1f8bce361d2452edf02340d0e98193d686cabb1`
- `professional-learning-resources-v01.md`: `7669ff2e307e3143993ae8e826619e532499f94333b7b6aa8a2caac56fed5b10`
- `professional-learning-resources-v01.json`: `5deeea6f6ce114a43d49edeedf8bbd5810a7b6534115c6e25b9d33c0d1709416`
