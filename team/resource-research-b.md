# 岗位专业学习资料研究（B批）

日期：2026-10-14（Asia/Shanghai）  
责任岗位：项目经理协调下的资源研究专项；本文件由资源研究代理交付  
覆盖岗位：`AI`（Agent/AI 生成工程师）、`UR`（用户研究员）、`COMP`（竞品研究员）、`PRACT`（实训评估员）、`OPS`（运营分析员）、`REV`（内容审校员）、`RETR`（内容检索工程师）  
资料核查方式：2026-10-14 通过公开网页检索；优先机构官方课程、标准、官方文档和原作者材料。链接可访问性和版本状态仍需在正式训练开始时再次核对。

## 使用边界

这些资料是岗位学习的输入，不是岗位通过证据、职业资格、真人专家审核或行业先进性证明。完成课程、阅读文档或得到证书不能替代本项目的隔离练习、作品、陌生任务、独立复核和真实用户/运营证据。版本敏感的框架文档应在练习前固定版本、记录发布日期，并把旧版本与当前版本差异单列。

建议按训练方案的 L0→L1→L2→L3 使用：先读基础概念和边界，再用小任务复现方法，随后在受限真实形状任务中记录失败/恢复，最后把作品交给相邻专业岗位和 QA 独立复核。

## `AI` Agent/AI 生成工程师

| 资源 | 机构/作者 | URL | 学习阶段 | 为什么相关 | 时效/局限 |
|---|---|---|---|---|---|
| Agentic AI | Andrew Ng；DeepLearning.AI | https://www.deeplearning.ai/courses/agentic-ai | L0–L2：概念、模式、实作 | 7 小时 45 分课程覆盖任务分解、反思、工具使用、规划、多 Agent 工作流、评估和部署，正好对应本项目的模型服务、来源关联、失败处理与评估能力。 | 课程和示例随平台更新；PRO 订阅/证书条件可能变化。框架示例不能代替本项目真实供应商契约、安全审查或生产成本实测。 |
| Building Systems with the ChatGPT API | Isa Fulford（OpenAI）、Andrew Ng（DeepLearning.AI） | https://www.deeplearning.ai/courses/chatgpt-building-system | L0–L1：单调用到工作流 | 用链式提示、Python 编排、分类、审核、输出检查和评估把复杂任务拆成可观察步骤，适合建立模型生成服务的最小可测闭环。 | 页面说明使用 OpenAI API；代码/接口可能随 API 版本变化。课程偏工作流基础，不涵盖完整账户、持久任务和多租户权限。 |
| AI Agents in LangGraph | Harrison Chase、Rotem Weiss；DeepLearning.AI/LangChain/Tavily | https://www.deeplearning.ai/alpha/short-courses/ai-agents-in-langgraph | L1–L2：状态、工具、人工介入 | 从 Python 手写 Agent 再迁移到 LangGraph，覆盖状态持久化、流式处理、Agentic Search 和 human-in-the-loop，可练习显式状态机、可恢复执行和工具边界。 | 短课页面标注为 beta/阶段性免费；LangGraph API 变化快。不要把框架使用经验当成通用 Agent 架构结论。 |
| Building effective agents | Anthropic Engineering | https://www.anthropic.com/engineering/building-effective-agents | L1–L2：架构选择与权衡 | 原作者材料区分预定义工作流与动态 Agent，讨论单 Agent、多 Agent、工具和编排的取舍，适合训练“先选择最简单可验证架构”的判断。 | 这是厂商工程经验，不是跨厂商基准；案例、模型能力和推荐会随模型版本变化。 |
| OpenAI Agents SDK 文档与 Quickstart | OpenAI | https://openai.github.io/openai-agents-python/；https://openai.github.io/openai-agents-python/quickstart/ | L1–L3：实现、护栏、追踪和评估 | 官方文档说明 Agent、工具、handoff、guardrail、session、tracing 和沙箱等最小原语，适合把任务拆解、权限、恢复与可观测性落实到可运行夹具。 | 绑定 OpenAI SDK/Responses API；依赖安装和模型可用性会变。需记录 SDK 版本、模型版本、密钥隔离和实际成本，不能以文档示例宣称已调用成功。 |

**建议练习序列：**先用 Andrew Ng 的 Agentic AI 建立模式词汇；用 Building Systems 做单调用/工作流对照；用 LangGraph 或 Agents SDK 实现可恢复的隔离小任务；再依据 Anthropic 的架构权衡写选择记录，并由 QA 用无配置、超时、部分输出和来源冲突夹具复验。

## `UR` 用户研究员

| 资源 | 机构/作者 | URL | 学习阶段 | 为什么相关 | 时效/局限 |
|---|---|---|---|---|---|
| User research – Service Manual | UK Government Digital Service | https://www.gov.uk/service-manual/user-research | L0–L1：研究目标、招募与计划 | 提供政府服务用户研究入口，连接发现、计划、方法和敏感用户/可访问性要求，适合产出中立任务脚本、同意说明和研究计划。 | 面向英国政府服务；页面会更新，法规/隐私要求要按实际地区另核。不是本项目用户价值结论。 |
| Plan user research for your service | UK Government Digital Service | https://www.gov.uk/service-manual/user-research/plan-user-research-for-your-service | L1–L2：研究设计与证据记录 | 强调研究目标、参与者覆盖（包括残障用户和需要支持的用户）、方法与记录，可直接转成访谈/可用性测试的夹具和证据卡。 | 指导发布较早但持续维护；应结合当前产品风险、隐私审批和样本可得性更新。 |
| When to Use Which User-Experience Research Methods | Christian Rohrer；Nielsen Norman Group | https://www.nngroup.com/articles/which-ux-research-methods/ | L0–L2：方法选择与三角验证 | 按态度/行为、定性/定量、使用情境和产品阶段映射 20 种方法，帮助研究员解释为何选择访谈、现场研究、可用性测试或分析，而非机械套用单一方法。 | NN/g 的研究和咨询材料；方法分类是一般指南，不能替代特定样本的偏差分析和伦理审批。 |
| ISO 9241-210:2019 Human-centred design | International Organization for Standardization | https://committee.iso.org/standard/77520.html | L1–L3：生命周期与人本设计 | 规定交互系统生命周期中的人本设计原则和活动，可帮助把用户研究连接到需求、设计、开发、部署和维护交接。 | 标准正文通常需购买；摘要不足以完成合规判断。2019 版本需检查是否有后续修订或项目适用的其他部分。 |

## `COMP` 竞品研究员

| 资源 | 机构/作者 | URL | 学习阶段 | 为什么相关 | 时效/局限 |
|---|---|---|---|---|---|
| The Five Forces | Michael Porter；Harvard Business School Institute for Strategy and Competitiveness | https://www.isc.hbs.edu/strategy/business-strategy/Pages/the-five-forces.aspx | L0–L1：行业结构与比较问题 | 原作者/机构页面解释供应商、买方、替代品、新进入者和竞争强度，帮助竞品研究员先定义比较单位和竞争机制，再填功能矩阵。 | 结构分析框架不能给出当前市场份额或产品质量；需要与实际版本、价格、用户场景和实测证据绑定。 |
| 15.902 Strategic Management I | MIT Sloan / MIT OpenCourseWare | https://ocw.mit.edu/courses/sloan-school-of-management/15-902-strategic-management-i-fall-2006/ | L0–L2：战略、产业与企业层分析 | 公开课程材料提供战略管理课程结构，可作为行业分析、竞争优势和战略选择的系统基础。 | 课程为 2005–2006 学年材料，商业环境和平台市场已变化；用作理论基础，不作为当前市场事实。 |
| 2023 Merger Guidelines – Market Definition | U.S. Department of Justice Antitrust Division | https://www.justice.gov/atr/merger-guidelines/tools/market-definition | L1–L2：市场边界、替代品与可比条件 | 说明产品/地域市场、需求替代、实际竞争证据、市场参与者和集中度工具，能约束“把所有相似产品都算竞品”的常见错误。 | 这是美国反垄断执法指南且为非约束性政策说明，不是通用产品策略手册；法律版本和辖区差异必须注明。 |
| European Commission Market Definition Notice | European Commission Competition Policy | https://competition-policy.ec.europa.eu/public-consultations/2020-market-definition-notice_en | L1–L2：多辖区市场定义 | 欧盟官方材料解释相关产品/地理市场定义及竞争政策中的透明度，适合做跨市场比较时记录口径和辖区。 | 欧盟竞争法语境；2024 年后数字市场政策和数据可用性可能变化，需核当前公告/法规。 |

## `PRACT` 实训评估员

| 资源 | 机构/作者 | URL | 学习阶段 | 为什么相关 | 时效/局限 |
|---|---|---|---|---|---|
| Standards for Educational and Psychological Testing (2014) | AERA、APA、NCME | https://www.aera.net/Publications/Books/Standards-for-Educational-PsychologicalTesting-2014-Edition | L0–L2：效度、公平、可靠性与使用 | 三个专业组织联合标准覆盖测试开发、解释和使用，是制定能力量规、证据要求、偏差检查和“不足证据”结论的核心基线。 | 2014 版；完整文本及后续修订以官方页面为准。标准不能直接替本项目决定岗位达标分数。 |
| Evidence-Centered Design for Learning | ETS Research | https://www.ets.org/research/policy_research_reports/publications/report/2011/imbu.html | L1–L2：从能力主张到任务与证据 | ETS 介绍 Evidence-Centered Design（ECD），把学习主张、可观察证据和任务设计连成可审计结构，适合把“会解释”与“能完成陌生实训”区分开。 | 报告较早且面向学习评估；需补充本项目的职业任务、真实作品和跨岗复核。 |
| Ofqual Handbook – Validity and assessment requirements | Ofqual / UK Government | https://www.gov.uk/guidance/ofqual-handbook/section-d-general-requirements-for-regulated-qualifications | L1–L3：效度论证、语言、公平与结果使用 | 强调效度是由证据和理论支持的解释，要求关注任务语言、障碍、公平和评估用途，可用于审查量规是否真的支持所作结论。 | 英国受监管资格体系语境；本项目不自动受其法律约束，需按本地政策和实际用途调整。 |
| Principles of AI use in marking | Ofqual / UK Government | https://www.gov.uk/government/publications/principles-of-ai-use-in-marking/principles-of-ai-use-in-marking | L2–L3：AI 辅助评分的验证边界 | 讨论黑箱评分、可接受证据、重复使用时的效度证据和人工责任，适合本项目在模型生成/自动评估参与时坚持“AI 检查不等于真人专业审核”。 | 针对英国资格评估和 AI marking；不提供本项目量规或模型阈值，需要独立设计盲测与人工复核。 |

## `OPS` 运营分析员

| 资源 | 机构/作者 | URL | 学习阶段 | 为什么相关 | 时效/局限 |
|---|---|---|---|---|---|
| The Analytics Edge | MIT Sloan / MIT OpenCourseWare | https://www.ocw.mit.edu/courses/15-071-the-analytics-edge-spring-2017/pages/an-introduction-to-analytics/ | L0–L2：数据分析与决策 | 课程从数据分析、统计摘要、可视化和模型化决策入门，适合建立成本/耗时/质量账本和分母、缺失值、异常值的基本纪律。 | 2017 课程；工具和案例可能旧。数据分析理论需结合当前业务指标定义和隔离账单。 |
| Data analyst learning path | Microsoft Learn | https://learn.microsoft.com/en-us/training/paths/data-analytics-microsoft/ | L0–L1：数据准备、建模、报告 | 官方学习路径覆盖 Power BI 数据准备、建模和交互报告，适合运营分析员把原始运行记录转成可审阅指标和趋势图。 | 偏 Microsoft/Power BI 工具；不等于通用统计或成本会计能力，模块内容可能更新。 |
| Analytics Academy on Skillshop | Google Analytics | https://support.google.com/analytics/answer/15440208?hl=en | L0–L1：事件、指标与数字产品分析 | Google 官方课程集合帮助理解事件、维度、指标和在线产品效果测量，适合学习“行为数据如何定义和解释”。 | 强绑定 Google Analytics；站点数据、隐私和事件模型不一定适合本地应用，需防止把营销指标当产品价值证据。 |
| AI Risk Management Framework 1.0 / AI RMF Core | NIST | https://www.nist.gov/itl/ai-risk-management-framework；https://airc.nist.gov/airmf-resources/airmf/5-sec-core/ | L1–L3：风险指标、监控和持续运营 | NIST 的 MAP/MEASURE/MANAGE 结构要求记录风险、指标、监控、反馈、事件响应和变更管理，适合运营分析员核对真实生成服务的成本、延迟、质量和异常恢复。 | AI RMF 是自愿框架，不是业务 KPI 模板；2023 版及配套资源需关注后续 Profile/生成式 AI 更新。 |
| Operations Management | MIT Sloan / MIT OpenCourseWare | https://ocw.mit.edu/courses/sloan-school-of-management/15-760a-operations-management-spring-2002/ | L0–L2：流程、质量、排程和持续改进 | 课程把产品开发、流程管理、供应链、质量改进和排程联系起来，可帮助运营分析员理解吞吐、等待、返工和质量之间的权衡。 | 2002 课程，案例和技术明显较旧；保留流程理论，指标和工具按当前服务重建。 |

## `REV` 内容审校员

| 资源 | 机构/作者 | URL | 学习阶段 | 为什么相关 | 时效/局限 |
|---|---|---|---|---|---|
| COPE Core Practices | Committee on Publication Ethics | https://publication-ethics.org/resources/cope-core-practices/ | L0–L2：来源伦理、利益冲突与更正 | COPE 核心实践提供编辑和出版伦理、利益冲突、研究诚信、投诉、撤回/更正等处理入口，适合建立技术内容的来源、冲突和错误升级清单。 | 面向学术出版；商业教材和内部内容需按项目合同扩展，不能把“遵循 COPE”写成专业专家审核。 |
| The Chicago Manual of Style Online – Manuscript Editing and Proofreading | University of Chicago Press | https://www.chicagomanualofstyle.org/book/ed18/part1/ch02/toc.html | L0–L1：编辑流程、引用和校样 | 第 18 版内容目录覆盖稿件准备、编辑、校对、引用和校样阶段记录，可作为文字层面一致性、术语、引用和版本变更的基础工作法。 | 付费手册且主要针对英文出版；不替代技术事实核查或中文术语规范。 |
| W3C Manual of Style | World Wide Web Consortium | https://www.w3.org/guide/manual-of-style/ | L1–L2：技术文档清晰度与版本表达 | W3C 作为标准组织公开的写作手册，强调定义、链接、状态段、避免失效的时间词和编辑一致性，适合技术教材和接口文档的可维护审校。 | W3C 文档语境；其规则需与本项目中文教材、引用格式和教学深度标准协调。 |
| Federal Plain Language Guidelines | Plain Language Action and Information Network / U.S. Government | https://www.plainlanguage.gov/guidelines/ | L0–L1：读者理解与可执行表达 | 政府公开指南帮助审校员检查组织、词语、句子和可读性，让复杂技术说明能被目标读者执行；可作为解释深度之外的清晰度检查。 | 政府公众沟通语境，且主要为英文；清晰不等于省略机制、边界、案例和证据。 |

## `RETR` 内容检索工程师

| 资源 | 机构/作者 | URL | 学习阶段 | 为什么相关 | 时效/局限 |
|---|---|---|---|---|---|
| Introduction to Information Retrieval | Christopher Manning、Prabhakar Raghavan、Hinrich Schütze；Stanford NLP | https://nlp.stanford.edu/IR-book/ | L0–L2：倒排索引、词法检索、排序与评估 | 经典教材提供信息检索的计算机科学基础，可系统学习索引、布尔/向量模型、评价指标和排序，避免只依赖 embedding。 | 2008/2009 时代教材；神经检索、现代向量数据库和大模型部分需要新资料补充。 |
| CS 276: Information Retrieval and Web Search | Stanford University | https://web.stanford.edu/class/cs276/ | L0–L2：大学课程与实验 | Stanford 课程覆盖构建文本信息系统的基础和高级技术，并以 IR 书为教材，适合作为分节索引、召回、排序、评估的完整课程入口。 | 课程页面/学期材料会变；作业环境可能停用或依赖旧软件，需固定可复现版本。 |
| Ranking and reranking | Elastic | https://www.elastic.co/docs/solutions/search/ranking | L1–L2：BM25、向量检索和融合排序 | 官方文档说明词法 BM25、向量搜索和 Reciprocal Rank Fusion（RRF）等组合方式，可直接对应本项目术语精确召回、语义召回、候选排序和版本过滤。 | Elastic 产品文档有厂商实现偏好；算法需在本项目语料和中文输入上用固定查询集测 precision/recall、MRR/nDCG 和引用正确性。 |
| BEIR: A Heterogeneous Benchmark for Zero-shot Evaluation of Information Retrieval Models | Nils Reimers 等；NeurIPS 2021 / BEIR 项目 | https://github.com/beir-cellar/beir；论文：https://datasets-benchmarks-proceedings.neurips.cc/paper/2021/file/65b9eea6e1cc6bb9f0cd2a47751a186f-Paper-round2.pdf | L1–L3：跨数据集评估与基准意识 | BEIR 提供多任务、多领域检索数据集和可复现实验/排行榜，训练检索工程师记录查询集、相关性判断和跨域泛化，而不是只报一次演示成功。 | 基准以英文和公开数据集为主，不能直接代表中文教材语料；应建立本项目版本化中文测试集并保留原失败。 |
| Semantic Search – Sentence Transformers | Sentence Transformers project | https://www.sbert.net/examples/sentence_transformer/applications/semantic-search/README.html | L1–L2：embedding 与语义召回 | 官方文档给出 query/document 编码、向量相似度和 top-k 搜索路径，适合本项目 BGE/本地语义模型的隔离实现和 CPU 资源估计。 | 文档示例使用特定模型/库版本；embedding 模型对语言、领域和分块敏感，必须绑定模型哈希和语料版本。 |

## 推荐的共通学习记录

每个岗位至少保留一张 `EvidenceCard`，并填写：资源 URL、访问日期、版本/发布日期、学习阶段、关键概念、一个可复现练习、一个反例、未知/局限、交接对象和 QA 复验链接。对工具型资源记录安装版本和环境；对标准/框架记录适用范围和不适用场景；对市场/课程资源区分“原作者主张”“组织材料”“本项目实测”。

建议首批训练选题：

1. `AI`：Andrew Ng Agentic AI 的模式卡 + 一次单调用/工作流选择；再用 Agents SDK 或 LangGraph 完成可恢复小任务。
2. `UR`：GOV.UK 研究计划 + NN/g 方法选择矩阵，针对同一学习工作台写一份中立任务脚本和观察表。
3. `COMP`：Porter 五力 + DOJ/欧盟市场定义，建立版本、地域、替代品和可比条件台账。
4. `PRACT`：ECD 的主张—证据—任务三联表 + AERA/APA/NCME 效度与公平检查；用陌生任务检验迁移，而不是只问记忆。
5. `OPS`：MIT Analytics Edge 的指标基础 + NIST MEASURE/MANAGE，做成本、耗时、质量和失败率的隔离账本。
6. `REV`：COPE 来源/更正检查 + W3C/Chicago 清晰度和版本表达检查；技术事实仍需逐条回到原始来源。
7. `RETR`：Stanford IR 词法基础 + Elastic 融合排序 + BEIR 评估方法，建立本项目中文查询和无匹配/歧义反例集。

## 统一风险与复核事项

- 课程、SDK、产品文档和市场指南变化快，正式训练前应重新打开链接并记录版本；失效链接不能静默替换为搜索摘要。
- 厂商课程和文档适合学习其系统，不构成跨厂商事实或独立效果证据；至少保留一个大学/标准/原作者材料作为理论锚点。
- 付费课程、订阅、证书、API 调用和云资源不在本轮授权内；无预算时只做公开阅读和隔离本地练习。
- 任何资源都不能把阅读完成率、课程证书、模型演示或一次成功检索推导为职业胜任、用户满意、真实学习效果或行业先进。以上结论要由相应岗位作品、独立 QA、真实用户/运营证据分别支持。

