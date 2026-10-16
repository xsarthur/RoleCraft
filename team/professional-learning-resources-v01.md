# 岗位专业学习资料整合目录 v0.1

- 日期：2026-10-14（Asia/Shanghai）
- 目录用途：为十五个岗位提供可复查的专业理论与实践学习入口；资源是学习输入，不是职业胜任、项目通过、真人专家审核、真实用户效果或行业先进性证据。
- 研究来源：`resource-research-a.md`（A批25项）与 `resource-research-b.md`（B批31项），另保留项目经理补充3项；本目录共 **59 项**。
- 训练边界：开训前复查链接、版本、许可、费用和地区限制；课程阅读、证书、笔记或一次演示不能替代岗位作品、陌生任务、独立QA、真实用户/运营和真人专业复核。

## 首检缺陷与修复记录

- 初始整合版首检发现：仅有项目经理补充3项带稳定 `role_id`；A批25项未合入；B批31项的 `role_id` 均为 `null`；记录缺少 `resource_id`、`canonical_url`、`resource_type`、`theme/theory_domains`、`learning_output` 等字段。
- 本次修复：保留PM补充、A批与B批全部研究来源，按 `employee-professional-qa-v01.md` 的十五个稳定短码映射岗位，补齐统一字段和来源批次；未修改两份研究原文。
- 状态：目录结构达到“15个 `role_id` 均出现、每岗至少3项、每条记录字段完整”的限定范围；学习效果、职业能力、专家审核和完整产品门槛仍为 `not_assessed`/未达标，须另行取证。

## 每岗资源计数

| role_id | 岗位 | 条目数 |
|---|---|---:|
| `PM` | 项目经理 | 3 |
| `PROD` | 产品经理 | 3 |
| `CURR` | 课程架构师 | 3 |
| `DES` | 设计师 | 3 |
| `FE` | 软件工程师 | 3 |
| `QA` | 测试工程师 | 3 |
| `ED` | 教材研发员 | 3 |
| `AI` | AI生成工程师 | 8 |
| `BE` | 后端数据工程师 | 4 |
| `UR` | 用户研究员 | 4 |
| `COMP` | 竞品研究员 | 4 |
| `PRACT` | 实训评估员 | 4 |
| `OPS` | 运营分析员 | 5 |
| `REV` | 内容审校员 | 4 |
| `RETR` | 内容检索工程师 | 5 |

## 字段与使用约定

- `resource_id` 是本目录稳定条目键；`url` 保留研究记录中的原始链接串，`canonical_url` 取首个可直接打开的链接，必要的多链接另列 `source_urls`。
- `resource_type` 只描述资料形态；`stage` 沿用研究批次的 L0–L3 建议，不代表学习者已达到对应等级。
- `theme` 和 `theory_domains` 指出学习主题；`learning_output` 是建议交付物，必须由岗位责任人和测试工程师按任务合同独立核验。
- `limitations` 保留研究员的版本、许可、供应商、语言、收费与适用边界；`batch` 用于回溯 A、B 或 PM 补充来源。

## PM · 项目经理（3项）

| resource_id | title | provider | resource_type | stage | theme / theory_domains | learning_output | canonical_url | limitations | batch |
|---|---|---|---|---|---|---|---|---|---|
| PLR-PM-001 | PMI Standards & Publications | Project Management Institute (PMI) | standard_or_guideline | L0–L2：标准与项目治理 | 项目协调与治理；项目治理；依赖与风险；交付证据；复验与状态管理 | 围绕《PMI Standards & Publications》制作概念卡、一次受限练习和一个失败/边界反例，并交付项目任务板、依赖/风险登记、复验计划和状态交接记录。 | https://www.pmi.org/standards/ | 标准页和具体出版物版本/访问权限可能变化；标准学习不等于项目交付或 PMI 认证。 | PM补充 |
| PLR-PM-002 | PMBOK Guide — Eighth Edition | Project Management Institute (PMI) | standard_or_guideline | L1–L3：方法与取舍 | 项目协调与治理；项目治理；依赖与风险；交付证据；复验与状态管理 | 围绕《PMBOK Guide — Eighth Edition》制作概念卡、一次受限练习和一个失败/边界反例，并交付项目任务板、依赖/风险登记、复验计划和状态交接记录。 | https://www.pmi.org/pt-br/standards/pmbok | 完整指南可能需付费或登录；以官方当前版本为准，不把读完或持证写成能力通过。 | PM补充 |
| PLR-PM-003 | ESD.36 System Project Management | MIT OpenCourseWare | course | L0–L2：系统项目管理 | 项目协调与治理；项目治理；依赖与风险；交付证据；复验与状态管理 | 围绕《ESD.36 System Project Management》制作概念卡、一次受限练习和一个失败/边界反例，并交付项目任务板、依赖/风险登记、复验计划和状态交接记录。 | https://ocw.mit.edu/courses/esd-36-system-project-management-fall-2012/ | 2012 年课程材料，案例和工具较旧；公开课程不提供当前项目或行业认证结论。 | PM补充 |

## PROD · 产品经理（3项）

| resource_id | title | provider | resource_type | stage | theme / theory_domains | learning_output | canonical_url | limitations | batch |
|---|---|---|---|---|---|---|---|---|---|
| PLR-PROD-001 | Product Management and Strategy — Wharton Executive Education | University of Pennsylvania, Wharton Executive Education | article_or_reference | 基础→中级（6周项目型课程） | 产品需求与价值；产品发现与策略；用户场景与范围；验收合同；可比与运营证据 | 围绕《Product Management and Strategy — Wharton Executive Education》制作概念卡、一次受限练习和一个失败/边界反例，并交付用户问题卡、范围与非目标、验收合同和可比证据台账。 | https://online-execed.wharton.upenn.edu/product-management-and-strategy | 收费、开课批次和课程结构可能变化；商学院课程强调管理视角，仍需结合真实用户研究、技术约束和可比产品证据。 | A |
| PLR-PROD-002 | Professional Certificate Program in Product Management — MIT Professional Education | MIT Professional Education | course | 中级→高级（产品战略、平台、创新和AI产品组合） | 产品需求与价值；产品发现与策略；用户场景与范围；验收合同；可比与运营证据 | 围绕《Professional Certificate Program in Product Management — MIT Professional Education》制作概念卡、一次受限练习和一个失败/边界反例，并交付用户问题卡、范围与非目标、验收合同和可比证据台账。 | https://professional.mit.edu/programs/certificate-programs/professional-certificate-program-product-management | 项目周期长且学费高；其“AI-enabled”内容会随版本演化，不应把课程完成或证书当作市场成功证据。 | A |
| PLR-PROD-003 | Empowered Product Teams — Silicon Valley Product Group（Marty Cagan） | Marty Cagan, SVPG（原作者文章） | framework_or_article | 基础→中级（自主阅读和讨论） | 产品需求与价值；产品发现与策略；用户场景与范围；验收合同；可比与运营证据 | 围绕《Empowered Product Teams — Silicon Valley Product Group（Marty Cagan）》制作概念卡、一次受限练习和一个失败/边界反例，并交付用户问题卡、范围与非目标、验收合同和可比证据台账。 | https://www.svpg.com/empowered-product-teams/ | 属于作者立场与行业经验，非普适标准；需与本项目真实用户证据、运营成本、合规和技术实测结合。 | A |

## CURR · 课程架构师（3项）

| resource_id | title | provider | resource_type | stage | theme / theory_domains | learning_output | canonical_url | limitations | batch |
|---|---|---|---|---|---|---|---|---|---|
| PLR-CURR-001 | Creating Learning Outcomes — Stanford Teaching Commons | Stanford University Teaching Commons | article_or_reference | 基础 | 教学架构与学习证据；学习结果设计；逆向课程设计；练习与评价对齐；学习数据与迭代 | 围绕《Creating Learning Outcomes — Stanford Teaching Commons》制作概念卡、一次受限练习和一个失败/边界反例，并交付学习结果—活动—证据映射、练习规格和补学路径。 | https://teachingcommons.stanford.edu/teaching-guides/foundations-course-design/course-planning/creating-learning-outcomes | 是课程设计指南而非某职业的完整课程；学习结果仍需与Agent工程、产品创造和测试岗位的实际任务映射。 | A |
| PLR-CURR-002 | Understanding by Design（UbD）框架 — Grant Wiggins & Jay McTighe / ASCD | ASCD；原作者 Grant Wiggins、Jay McTighe | article_or_reference | 基础→中级（逆向设计） | 教学架构与学习证据；学习结果设计；逆向课程设计；练习与评价对齐；学习数据与迭代 | 围绕《Understanding by Design（UbD）框架 — Grant Wiggins & Jay McTighe / ASCD》制作概念卡、一次受限练习和一个失败/边界反例，并交付学习结果—活动—证据映射、练习规格和补学路径。 | https://ascd.org/ASCD/pdf/siteASCD/publications/UbD_WhitePaper0312.pdf | 框架是通用教育方法，不能代替领域能力标准、真实工作样本或学习效果研究；ASCD材料版权和许可需遵守。 | A |
| PLR-CURR-003 | Open Learning Initiative（OLI）— Carnegie Mellon University | Carnegie Mellon University, Simon Initiative | article_or_reference | 中级→高级（学习科学与数据反馈） | 教学架构与学习证据；学习结果设计；逆向课程设计；练习与评价对齐；学习数据与迭代 | 围绕《Open Learning Initiative（OLI）— Carnegie Mellon University》制作概念卡、一次受限练习和一个失败/边界反例，并交付学习结果—活动—证据映射、练习规格和补学路径。 | https://oli.cmu.edu/about/ | OLI介绍页是平台/方法概览，具体课程和数据接口有各自许可；不能直接推导本项目学习效果，需真实学习者试点。 | A |

## DES · 设计师（3项）

| resource_id | title | provider | resource_type | stage | theme / theory_domains | learning_output | canonical_url | limitations | batch |
|---|---|---|---|---|---|---|---|---|---|
| PLR-DES-001 | Web Content Accessibility Guidelines (WCAG) 2.2 | W3C Web Accessibility Initiative | standard_or_guideline | 基础→中级（可访问性标准） | 用户体验与视觉设计；以人为本设计；可访问性；交互模式与反馈；原型与研究验证 | 围绕《Web Content Accessibility Guidelines (WCAG) 2.2》制作概念卡、一次受限练习和一个失败/边界反例，并交付可审阅视觉稿、交互状态说明、无障碍检查和研究记录。 | https://www.w3.org/TR/WCAG22/ | WCAG是网页内容标准，不是完整视觉风格或用户研究方法；应核目标地区法规、产品平台和辅助技术兼容性。 | A |
| PLR-DES-002 | Human Interface Guidelines — Apple Developer | Apple | standard_or_guideline | 基础→中级（交互模式、布局、反馈与可访问性） | 用户体验与视觉设计；以人为本设计；可访问性；交互模式与反馈；原型与研究验证 | 围绕《Human Interface Guidelines — Apple Developer》制作概念卡、一次受限练习和一个失败/边界反例，并交付可审阅视觉稿、交互状态说明、无障碍检查和研究记录。 | https://developer.apple.com/design/human-interface-guidelines/ | 偏Apple平台，不能照搬到Web；页面会随系统版本更新，应按目标设备复查。 | A |
| PLR-DES-003 | Design Thinking Bootleg — Stanford d.school | Stanford d.school | article_or_reference | 基础→中级（用户研究到原型测试） | 用户体验与视觉设计；以人为本设计；可访问性；交互模式与反馈；原型与研究验证 | 围绕《Design Thinking Bootleg — Stanford d.school》制作概念卡、一次受限练习和一个失败/边界反例，并交付可审阅视觉稿、交互状态说明、无障碍检查和研究记录。 | https://dschool.stanford.edu/tools/design-thinking-bootleg | 是开放工具包而非完整HCI学位课程；方法需按项目风险、研究伦理和真实样本调整，不能凭卡片自称用户价值已验证。 | A |

## FE · 软件工程师（3项）

| resource_id | title | provider | resource_type | stage | theme / theory_domains | learning_output | canonical_url | limitations | batch |
|---|---|---|---|---|---|---|---|---|---|
| PLR-FE-001 | 6.005 Software Construction — MIT OpenCourseWare | MIT EECS | course | 基础→中级 | 网站客户端实现；软件构造；Web与接口集成；可维护性与测试；可靠性与运行反馈 | 围绕《6.005 Software Construction — MIT OpenCourseWare》制作概念卡、一次受限练习和一个失败/边界反例，并交付可运行客户端切片、接口消费说明、错误状态和开发验证记录。 | https://ocw.mit.edu/courses/6-005-software-construction-spring-2016/ | 课程为2016年版本，示例语言/工具可能老旧；工程原则仍有价值，现代框架和运行时需查官方最新文档。 | A |
| PLR-FE-002 | Full Stack Open — University of Helsinki | University of Helsinki Open University / MOOC | course | 基础→中级（现代Web实作） | 网站客户端实现；软件构造；Web与接口集成；可维护性与测试；可靠性与运行反馈 | 围绕《Full Stack Open — University of Helsinki》制作概念卡、一次受限练习和一个失败/边界反例，并交付可运行客户端切片、接口消费说明、错误状态和开发验证记录。 | https://www.helsinki.fi/en/admissions-and-education/open-university/multidisciplinary-themed-modules/full-stack | 技术栈和课程单元会迭代；完成课程不等同于本项目代码质量，需按当前Node版本、浏览器和合同实测。 | A |
| PLR-FE-003 | Site Reliability Engineering（SRE）— Google | Google SRE团队 | documentation | 中级→高级（生产可靠性） | 网站客户端实现；软件构造；Web与接口集成；可维护性与测试；可靠性与运行反馈 | 围绕《Site Reliability Engineering（SRE）— Google》制作概念卡、一次受限练习和一个失败/边界反例，并交付可运行客户端切片、接口消费说明、错误状态和开发验证记录。 | https://sre.google/ | Google规模和组织前提与本地MVP不同；新版会持续更新，不能直接套用其SLO或成本阈值。 | A |

## QA · 测试工程师（3项）

| resource_id | title | provider | resource_type | stage | theme / theory_domains | learning_output | canonical_url | limitations | batch |
|---|---|---|---|---|---|---|---|---|---|
| PLR-QA-001 | CTFL v4.0.1 Syllabus — ISTQB | International Software Testing Qualifications Board | standard_or_guideline | 基础→中级 | 独立质量验证；测试设计；风险驱动与独立性；缺陷与复验；证据边界 | 围绕《CTFL v4.0.1 Syllabus — ISTQB》制作概念卡、一次受限练习和一个失败/边界反例，并交付风险驱动测试设计、可复现缺陷、原始证据和独立复验报告。 | https://www.istqb.org/sdm_downloads/istqb-certified-tester-foundation-level-syllabus-v4-0/ | 当前英文基线为v4.0.1（2024-09-15，需以ISTQB页面为准）；认证与考试是知识证明，不能替代针对本应用的探索式、接口、内容和用户路径测试。 | A |
| PLR-QA-002 | ISO/IEC/IEEE 29119-1:2022 — General concepts | ISO、IEC、IEEE | article_or_reference | 中级→高级（组织化、风险驱动测试） | 独立质量验证；测试设计；风险驱动与独立性；缺陷与复验；证据边界 | 围绕《ISO/IEC/IEEE 29119-1:2022 — General concepts》制作概念卡、一次受限练习和一个失败/边界反例，并交付风险驱动测试设计、可复现缺陷、原始证据和独立复验报告。 | https://www.iso.org/standard/81291.html?browse=tc | 完整标准可能需购买；第1部分是概念，实际流程和技术还涉及其他分册，需按产品规模裁剪并记录理由。 | A |
| PLR-QA-003 | Software Testing — University of Oxford Department of Computer Science | University of Oxford | course | 中级→高级 | 独立质量验证；测试设计；风险驱动与独立性；缺陷与复验；证据边界 | 围绕《Software Testing — University of Oxford Department of Computer Science》制作概念卡、一次受限练习和一个失败/边界反例，并交付风险驱动测试设计、可复现缺陷、原始证据和独立复验报告。 | https://www.cs.ox.ac.uk/softeng-temp/subjects/STE.html | 页面对应特定年度课程，开课与名额会变；课程介绍不是本项目的测试报告，必须在当前版本执行并留存日志。 | A |

## ED · 教材研发员（3项）

| resource_id | title | provider | resource_type | stage | theme / theory_domains | learning_output | canonical_url | limitations | batch |
|---|---|---|---|---|---|---|---|---|---|
| PLR-ED-001 | Technical Writing courses — Google for Developers | Google Technical Writing team | course | 基础→中级 | 技术教材研发；技术写作；信息组织与可读性；引用与版权；教程与练习设计 | 围绕《Technical Writing courses — Google for Developers》制作概念卡、一次受限练习和一个失败/边界反例，并交付多角度专业正文、案例/练习、引用绑定和作者自查包。 | https://developers.google.com/tech-writing | 课程面向工程技术写作，英文材料；不能代替本项目中文专业深度标准、事实核查和同行审校。 | A |
| PLR-ED-002 | Google Developer Documentation Style Guide | Google for Developers | documentation | 基础（写作参考）→中级（团队编辑规范） | 技术教材研发；技术写作；信息组织与可读性；引用与版权；教程与练习设计 | 围绕《Google Developer Documentation Style Guide》制作概念卡、一次受限练习和一个失败/边界反例，并交付多角度专业正文、案例/练习、引用绑定和作者自查包。 | https://developers.google.com/style | 是Google开发者文档风格，不是中文教材的唯一规范；项目特定风格、读者和领域术语优先。 | A |
| PLR-ED-003 | Writing Guide with Handbook — OpenStax | OpenStax（Rice University） | standard_or_guideline | 基础→中级（论证、写作过程与编辑） | 技术教材研发；技术写作；信息组织与可读性；引用与版权；教程与练习设计 | 围绕《Writing Guide with Handbook — OpenStax》制作概念卡、一次受限练习和一个失败/边界反例，并交付多角度专业正文、案例/练习、引用绑定和作者自查包。 | https://openstax.org/books/writing-guide/pages/preface | 偏通用学术写作，不专门针对软件/Agent教材；CC BY-NC-SA许可及衍生作品署名要求需保留。 | A |

## AI · AI生成工程师（8项）

| resource_id | title | provider | resource_type | stage | theme / theory_domains | learning_output | canonical_url | limitations | batch |
|---|---|---|---|---|---|---|---|---|---|
| PLR-AI-001 | Agentic AI — Andrew Ng / DeepLearning.AI | Andrew Ng, DeepLearning.AI | course | 中级→高级（约7小时45分钟，代码和练习） | 模型生成服务；Agent架构；工作流与工具调用；护栏与可观测性；评估与失败恢复 | 围绕《Agentic AI — Andrew Ng / DeepLearning.AI》制作概念卡、一次受限练习和一个失败/边界反例，并交付隔离生成/Agent夹具、状态与失败矩阵、来源关联和评估记录。 | https://www.deeplearning.ai/courses/agentic-ai | 课程和代码会随模型/SDK更新；付费会员功能、示例供应商和课程完成不能证明生产可靠性，需以本地离线、真实接口和预算证据分开记录。 | A |
| PLR-AI-002 | Building Effective AI Agents — Anthropic | Anthropic工程团队 | article_or_reference | 中级→高级（架构模式和实现权衡） | 模型生成服务；Agent架构；工作流与工具调用；护栏与可观测性；评估与失败恢复 | 围绕《Building Effective AI Agents — Anthropic》制作概念卡、一次受限练习和一个失败/边界反例，并交付隔离生成/Agent夹具、状态与失败矩阵、来源关联和评估记录。 | https://www.anthropic.com/engineering/building-effective-agents | 以Anthropic产品与实践为背景，模型能力、API和推荐模式会变化；应与实际供应商契约、隐私/安全要求和本项目接口验证结合。 | A |
| PLR-AI-003 | Agents SDK — OpenAI API | OpenAI开发者文档 | documentation | 中级→高级（代码实现与运行时） | 模型生成服务；Agent架构；工作流与工具调用；护栏与可观测性；评估与失败恢复 | 围绕《Agents SDK — OpenAI API》制作概念卡、一次受限练习和一个失败/边界反例，并交付隔离生成/Agent夹具、状态与失败矩阵、来源关联和评估记录。 | https://developers.openai.com/api/docs/guides/agents/sdk | SDK/API属于高频变更的供应商资料，模型、价格、区域和条款必须按当前版本复查；本项目未授权的付费调用不能以阅读文档代替实测。 | A |
| PLR-AI-004 | Agentic AI | Andrew Ng；DeepLearning.AI | course | L0–L2：概念、模式、实作 | 模型生成服务；Agent架构；工作流与工具调用；护栏与可观测性；评估与失败恢复 | 围绕《Agentic AI》制作概念卡、一次受限练习和一个失败/边界反例，并交付隔离生成/Agent夹具、状态与失败矩阵、来源关联和评估记录。 | https://www.deeplearning.ai/courses/agentic-ai | 课程和示例随平台更新；PRO 订阅/证书条件可能变化。框架示例不能代替本项目真实供应商契约、安全审查或生产成本实测。 | B |
| PLR-AI-005 | Building Systems with the ChatGPT API | Isa Fulford（OpenAI）、Andrew Ng（DeepLearning.AI） | article_or_reference | L0–L1：单调用到工作流 | 模型生成服务；Agent架构；工作流与工具调用；护栏与可观测性；评估与失败恢复 | 围绕《Building Systems with the ChatGPT API》制作概念卡、一次受限练习和一个失败/边界反例，并交付隔离生成/Agent夹具、状态与失败矩阵、来源关联和评估记录。 | https://www.deeplearning.ai/courses/chatgpt-building-system | 页面说明使用 OpenAI API；代码/接口可能随 API 版本变化。课程偏工作流基础，不涵盖完整账户、持久任务和多租户权限。 | B |
| PLR-AI-006 | AI Agents in LangGraph | Harrison Chase、Rotem Weiss；DeepLearning.AI/LangChain/Tavily | course | L1–L2：状态、工具、人工介入 | 模型生成服务；Agent架构；工作流与工具调用；护栏与可观测性；评估与失败恢复 | 围绕《AI Agents in LangGraph》制作概念卡、一次受限练习和一个失败/边界反例，并交付隔离生成/Agent夹具、状态与失败矩阵、来源关联和评估记录。 | https://www.deeplearning.ai/alpha/short-courses/ai-agents-in-langgraph | 短课页面标注为 beta/阶段性免费；LangGraph API 变化快。不要把框架使用经验当成通用 Agent 架构结论。 | B |
| PLR-AI-007 | Building effective agents | Anthropic Engineering | framework_or_article | L1–L2：架构选择与权衡 | 模型生成服务；Agent架构；工作流与工具调用；护栏与可观测性；评估与失败恢复 | 围绕《Building effective agents》制作概念卡、一次受限练习和一个失败/边界反例，并交付隔离生成/Agent夹具、状态与失败矩阵、来源关联和评估记录。 | https://www.anthropic.com/engineering/building-effective-agents | 这是厂商工程经验，不是跨厂商基准；案例、模型能力和推荐会随模型版本变化。 | B |
| PLR-AI-008 | OpenAI Agents SDK 文档与 Quickstart | OpenAI | documentation | L1–L3：实现、护栏、追踪和评估 | 模型生成服务；Agent架构；工作流与工具调用；护栏与可观测性；评估与失败恢复 | 围绕《OpenAI Agents SDK 文档与 Quickstart》制作概念卡、一次受限练习和一个失败/边界反例，并交付隔离生成/Agent夹具、状态与失败矩阵、来源关联和评估记录。 | https://openai.github.io/openai-agents-python/ | 绑定 OpenAI SDK/Responses API；依赖安装和模型可用性会变。需记录 SDK 版本、模型版本、密钥隔离和实际成本，不能以文档示例宣称已调用成功。 | B |

## BE · 后端数据工程师（4项）

| resource_id | title | provider | resource_type | stage | theme / theory_domains | learning_output | canonical_url | limitations | batch |
|---|---|---|---|---|---|---|---|---|---|
| PLR-BE-001 | 6.830 Database Systems — MIT OpenCourseWare | MIT EECS | course | 中级→高级 | 服务端数据与任务；数据建模；事务与恢复；索引与查询；分布式系统与治理 | 围绕《6.830 Database Systems — MIT OpenCourseWare》制作概念卡、一次受限练习和一个失败/边界反例，并交付数据模型、迁移/恢复方案、任务版本和可重建验证记录。 | https://ocw.mit.edu/courses/6-830-database-systems-fall-2010/pages/syllabus/ | 课程为2010年版本，数据库产品生态已变；理论和项目练习仍可用，具体SQLite/Node/云服务行为必须查当前官方文档并运行验证。 | A |
| PLR-BE-002 | CS145 Intro to Modern Data Systems — Stanford University | Stanford University Computer Science | article_or_reference | 中级→高级 | 服务端数据与任务；数据建模；事务与恢复；索引与查询；分布式系统与治理 | 围绕《CS145 Intro to Modern Data Systems — Stanford University》制作概念卡、一次受限练习和一个失败/边界反例，并交付数据模型、迁移/恢复方案、任务版本和可重建验证记录。 | https://bulletin.stanford.edu/courses/1056751 | 课程目录说明不包含完整讲义/项目；先修要求包括算法、系统和内存/磁盘基础，需按学习者诊断补学。 | A |
| PLR-BE-003 | Professional Data Engineer Learning Path — Google Cloud | Google Cloud | course | 中级→高级（云数据平台与运维） | 服务端数据与任务；数据建模；事务与恢复；索引与查询；分布式系统与治理 | 围绕《Professional Data Engineer Learning Path — Google Cloud》制作概念卡、一次受限练习和一个失败/边界反例，并交付数据模型、迁移/恢复方案、任务版本和可重建验证记录。 | https://cloud.google.com/learn/certification/data-engineer | 围绕Google Cloud服务和认证，考试内容、费用、有效期及服务名会变；本地SQLite/Node项目只能选择相应原则，不能宣称已具备云生产能力。 | A |
| PLR-BE-004 | Designing Data-Intensive Applications — Martin Kleppmann | Martin Kleppmann（剑桥大学；原作者） | book | 中级→高级（系统设计与权衡） | 服务端数据与任务；数据建模；事务与恢复；索引与查询；分布式系统与治理 | 围绕《Designing Data-Intensive Applications — Martin Kleppmann》制作概念卡、一次受限练习和一个失败/边界反例，并交付数据模型、迁移/恢复方案、任务版本和可重建验证记录。 | https://dataintensive.net/?lang=en | 书籍内容需按版本购买/阅读；2026年已有第2版信息，旧版示例和具体产品命令要与当前实现分开核对，不能只读书宣称系统已验证。 | A |

## UR · 用户研究员（4项）

| resource_id | title | provider | resource_type | stage | theme / theory_domains | learning_output | canonical_url | limitations | batch |
|---|---|---|---|---|---|---|---|---|---|
| PLR-UR-001 | User research – Service Manual | UK Government Digital Service | documentation | L0–L1：研究目标、招募与计划 | 用户研究；研究计划与招募；方法选择；中立任务与观察；伦理与证据解释 | 围绕《User research – Service Manual》制作概念卡、一次受限练习和一个失败/边界反例，并交付研究计划、中立脚本、观察表、同意说明和证据摘要。 | https://www.gov.uk/service-manual/user-research | 面向英国政府服务；页面会更新，法规/隐私要求要按实际地区另核。不是本项目用户价值结论。 | B |
| PLR-UR-002 | Plan user research for your service | UK Government Digital Service | article_or_reference | L1–L2：研究设计与证据记录 | 用户研究；研究计划与招募；方法选择；中立任务与观察；伦理与证据解释 | 围绕《Plan user research for your service》制作概念卡、一次受限练习和一个失败/边界反例，并交付研究计划、中立脚本、观察表、同意说明和证据摘要。 | https://www.gov.uk/service-manual/user-research/plan-user-research-for-your-service | 指导发布较早但持续维护；应结合当前产品风险、隐私审批和样本可得性更新。 | B |
| PLR-UR-003 | When to Use Which User-Experience Research Methods | Christian Rohrer；Nielsen Norman Group | article_or_reference | L0–L2：方法选择与三角验证 | 用户研究；研究计划与招募；方法选择；中立任务与观察；伦理与证据解释 | 围绕《When to Use Which User-Experience Research Methods》制作概念卡、一次受限练习和一个失败/边界反例，并交付研究计划、中立脚本、观察表、同意说明和证据摘要。 | https://www.nngroup.com/articles/which-ux-research-methods/ | NN/g 的研究和咨询材料；方法分类是一般指南，不能替代特定样本的偏差分析和伦理审批。 | B |
| PLR-UR-004 | ISO 9241-210:2019 Human-centred design | International Organization for Standardization | standard_or_guideline | L1–L3：生命周期与人本设计 | 用户研究；研究计划与招募；方法选择；中立任务与观察；伦理与证据解释 | 围绕《ISO 9241-210:2019 Human-centred design》制作概念卡、一次受限练习和一个失败/边界反例，并交付研究计划、中立脚本、观察表、同意说明和证据摘要。 | https://committee.iso.org/standard/77520.html | 标准正文通常需购买；摘要不足以完成合规判断。2019 版本需检查是否有后续修订或项目适用的其他部分。 | B |

## COMP · 竞品研究员（4项）

| resource_id | title | provider | resource_type | stage | theme / theory_domains | learning_output | canonical_url | limitations | batch |
|---|---|---|---|---|---|---|---|---|---|
| PLR-COMP-001 | The Five Forces | Michael Porter；Harvard Business School Institute for Strategy and Competitiveness | framework_or_article | L0–L1：行业结构与比较问题 | 行业对比研究；竞争战略；市场定义；替代品与可比条件；版本化实测 | 围绕《The Five Forces》制作概念卡、一次受限练习和一个失败/边界反例，并交付版本/地域/替代品可比矩阵、市场定义依据和实测报告。 | https://www.isc.hbs.edu/strategy/business-strategy/Pages/the-five-forces.aspx | 结构分析框架不能给出当前市场份额或产品质量；需要与实际版本、价格、用户场景和实测证据绑定。 | B |
| PLR-COMP-002 | 15.902 Strategic Management I | MIT Sloan / MIT OpenCourseWare | course | L0–L2：战略、产业与企业层分析 | 行业对比研究；竞争战略；市场定义；替代品与可比条件；版本化实测 | 围绕《15.902 Strategic Management I》制作概念卡、一次受限练习和一个失败/边界反例，并交付版本/地域/替代品可比矩阵、市场定义依据和实测报告。 | https://ocw.mit.edu/courses/sloan-school-of-management/15-902-strategic-management-i-fall-2006/ | 课程为 2005–2006 学年材料，商业环境和平台市场已变化；用作理论基础，不作为当前市场事实。 | B |
| PLR-COMP-003 | 2023 Merger Guidelines – Market Definition | U.S. Department of Justice Antitrust Division | standard_or_guideline | L1–L2：市场边界、替代品与可比条件 | 行业对比研究；竞争战略；市场定义；替代品与可比条件；版本化实测 | 围绕《2023 Merger Guidelines – Market Definition》制作概念卡、一次受限练习和一个失败/边界反例，并交付版本/地域/替代品可比矩阵、市场定义依据和实测报告。 | https://www.justice.gov/atr/merger-guidelines/tools/market-definition | 这是美国反垄断执法指南且为非约束性政策说明，不是通用产品策略手册；法律版本和辖区差异必须注明。 | B |
| PLR-COMP-004 | European Commission Market Definition Notice | European Commission Competition Policy | framework_or_article | L1–L2：多辖区市场定义 | 行业对比研究；竞争战略；市场定义；替代品与可比条件；版本化实测 | 围绕《European Commission Market Definition Notice》制作概念卡、一次受限练习和一个失败/边界反例，并交付版本/地域/替代品可比矩阵、市场定义依据和实测报告。 | https://competition-policy.ec.europa.eu/public-consultations/2020-market-definition-notice_en | 欧盟竞争法语境；2024 年后数字市场政策和数据可用性可能变化，需核当前公告/法规。 | B |

## PRACT · 实训评估员（4项）

| resource_id | title | provider | resource_type | stage | theme / theory_domains | learning_output | canonical_url | limitations | batch |
|---|---|---|---|---|---|---|---|---|---|
| PLR-PRACT-001 | Standards for Educational and Psychological Testing (2014) | AERA、APA、NCME | standard_or_guideline | L0–L2：效度、公平、可靠性与使用 | 学习者实训评价；效度与公平；证据中心设计；量规与任务；AI评分边界 | 围绕《Standards for Educational and Psychological Testing (2014)》制作概念卡、一次受限练习和一个失败/边界反例，并交付主张—证据—任务量规、陌生任务、评分记录和公平检查。 | https://www.aera.net/Publications/Books/Standards-for-Educational-PsychologicalTesting-2014-Edition | 2014 版；完整文本及后续修订以官方页面为准。标准不能直接替本项目决定岗位达标分数。 | B |
| PLR-PRACT-002 | Evidence-Centered Design for Learning | ETS Research | research_report | L1–L2：从能力主张到任务与证据 | 学习者实训评价；效度与公平；证据中心设计；量规与任务；AI评分边界 | 围绕《Evidence-Centered Design for Learning》制作概念卡、一次受限练习和一个失败/边界反例，并交付主张—证据—任务量规、陌生任务、评分记录和公平检查。 | https://www.ets.org/research/policy_research_reports/publications/report/2011/imbu.html | 报告较早且面向学习评估；需补充本项目的职业任务、真实作品和跨岗复核。 | B |
| PLR-PRACT-003 | Ofqual Handbook – Validity and assessment requirements | Ofqual / UK Government | standard_or_guideline | L1–L3：效度论证、语言、公平与结果使用 | 学习者实训评价；效度与公平；证据中心设计；量规与任务；AI评分边界 | 围绕《Ofqual Handbook – Validity and assessment requirements》制作概念卡、一次受限练习和一个失败/边界反例，并交付主张—证据—任务量规、陌生任务、评分记录和公平检查。 | https://www.gov.uk/guidance/ofqual-handbook/section-d-general-requirements-for-regulated-qualifications | 英国受监管资格体系语境；本项目不自动受其法律约束，需按本地政策和实际用途调整。 | B |
| PLR-PRACT-004 | Principles of AI use in marking | Ofqual / UK Government | article_or_reference | L2–L3：AI 辅助评分的验证边界 | 学习者实训评价；效度与公平；证据中心设计；量规与任务；AI评分边界 | 围绕《Principles of AI use in marking》制作概念卡、一次受限练习和一个失败/边界反例，并交付主张—证据—任务量规、陌生任务、评分记录和公平检查。 | https://www.gov.uk/government/publications/principles-of-ai-use-in-marking/principles-of-ai-use-in-marking | 针对英国资格评估和 AI marking；不提供本项目量规或模型阈值，需要独立设计盲测与人工复核。 | B |

## OPS · 运营分析员（5项）

| resource_id | title | provider | resource_type | stage | theme / theory_domains | learning_output | canonical_url | limitations | batch |
|---|---|---|---|---|---|---|---|---|---|
| PLR-OPS-001 | The Analytics Edge | MIT Sloan / MIT OpenCourseWare | course | L0–L2：数据分析与决策 | 运营经济分析；统计与数据分析；指标与可视化；成本质量耗时；风险监控与持续改进 | 围绕《The Analytics Edge》制作概念卡、一次受限练习和一个失败/边界反例，并交付成本/耗时/质量/失败率账本、指标定义和运营复盘。 | https://www.ocw.mit.edu/courses/15-071-the-analytics-edge-spring-2017/pages/an-introduction-to-analytics/ | 2017 课程；工具和案例可能旧。数据分析理论需结合当前业务指标定义和隔离账单。 | B |
| PLR-OPS-002 | Data analyst learning path | Microsoft Learn | course | L0–L1：数据准备、建模、报告 | 运营经济分析；统计与数据分析；指标与可视化；成本质量耗时；风险监控与持续改进 | 围绕《Data analyst learning path》制作概念卡、一次受限练习和一个失败/边界反例，并交付成本/耗时/质量/失败率账本、指标定义和运营复盘。 | https://learn.microsoft.com/en-us/training/paths/data-analytics-microsoft/ | 偏 Microsoft/Power BI 工具；不等于通用统计或成本会计能力，模块内容可能更新。 | B |
| PLR-OPS-003 | Analytics Academy on Skillshop | Google Analytics | course | L0–L1：事件、指标与数字产品分析 | 运营经济分析；统计与数据分析；指标与可视化；成本质量耗时；风险监控与持续改进 | 围绕《Analytics Academy on Skillshop》制作概念卡、一次受限练习和一个失败/边界反例，并交付成本/耗时/质量/失败率账本、指标定义和运营复盘。 | https://support.google.com/analytics/answer/15440208?hl=en | 强绑定 Google Analytics；站点数据、隐私和事件模型不一定适合本地应用，需防止把营销指标当产品价值证据。 | B |
| PLR-OPS-004 | AI Risk Management Framework 1.0 / AI RMF Core | NIST | article_or_reference | L1–L3：风险指标、监控和持续运营 | 运营经济分析；统计与数据分析；指标与可视化；成本质量耗时；风险监控与持续改进 | 围绕《AI Risk Management Framework 1.0 / AI RMF Core》制作概念卡、一次受限练习和一个失败/边界反例，并交付成本/耗时/质量/失败率账本、指标定义和运营复盘。 | https://www.nist.gov/itl/ai-risk-management-framework | AI RMF 是自愿框架，不是业务 KPI 模板；2023 版及配套资源需关注后续 Profile/生成式 AI 更新。 | B |
| PLR-OPS-005 | Operations Management | MIT Sloan / MIT OpenCourseWare | course | L0–L2：流程、质量、排程和持续改进 | 运营经济分析；统计与数据分析；指标与可视化；成本质量耗时；风险监控与持续改进 | 围绕《Operations Management》制作概念卡、一次受限练习和一个失败/边界反例，并交付成本/耗时/质量/失败率账本、指标定义和运营复盘。 | https://ocw.mit.edu/courses/sloan-school-of-management/15-760a-operations-management-spring-2002/ | 2002 课程，案例和技术明显较旧；保留流程理论，指标和工具按当前服务重建。 | B |

## REV · 内容审校员（4项）

| resource_id | title | provider | resource_type | stage | theme / theory_domains | learning_output | canonical_url | limitations | batch |
|---|---|---|---|---|---|---|---|---|---|
| PLR-REV-001 | COPE Core Practices | Committee on Publication Ethics | standard_or_guideline | L0–L2：来源伦理、利益冲突与更正 | 技术内容审校；出版伦理；编辑与校样；技术文档清晰度；事实来源与版本 | 围绕《COPE Core Practices》制作概念卡、一次受限练习和一个失败/边界反例，并交付来源与事实核查表、边界/版本意见、修订记录和更正建议。 | https://publication-ethics.org/resources/cope-core-practices/ | 面向学术出版；商业教材和内部内容需按项目合同扩展，不能把“遵循 COPE”写成专业专家审核。 | B |
| PLR-REV-002 | The Chicago Manual of Style Online – Manuscript Editing and Proofreading | University of Chicago Press | standard_or_guideline | L0–L1：编辑流程、引用和校样 | 技术内容审校；出版伦理；编辑与校样；技术文档清晰度；事实来源与版本 | 围绕《The Chicago Manual of Style Online – Manuscript Editing and Proofreading》制作概念卡、一次受限练习和一个失败/边界反例，并交付来源与事实核查表、边界/版本意见、修订记录和更正建议。 | https://www.chicagomanualofstyle.org/book/ed18/part1/ch02/toc.html | 付费手册且主要针对英文出版；不替代技术事实核查或中文术语规范。 | B |
| PLR-REV-003 | W3C Manual of Style | World Wide Web Consortium | standard_or_guideline | L1–L2：技术文档清晰度与版本表达 | 技术内容审校；出版伦理；编辑与校样；技术文档清晰度；事实来源与版本 | 围绕《W3C Manual of Style》制作概念卡、一次受限练习和一个失败/边界反例，并交付来源与事实核查表、边界/版本意见、修订记录和更正建议。 | https://www.w3.org/guide/manual-of-style/ | W3C 文档语境；其规则需与本项目中文教材、引用格式和教学深度标准协调。 | B |
| PLR-REV-004 | Federal Plain Language Guidelines | Plain Language Action and Information Network / U.S. Government | standard_or_guideline | L0–L1：读者理解与可执行表达 | 技术内容审校；出版伦理；编辑与校样；技术文档清晰度；事实来源与版本 | 围绕《Federal Plain Language Guidelines》制作概念卡、一次受限练习和一个失败/边界反例，并交付来源与事实核查表、边界/版本意见、修订记录和更正建议。 | https://www.plainlanguage.gov/guidelines/ | 政府公众沟通语境，且主要为英文；清晰不等于省略机制、边界、案例和证据。 | B |

## RETR · 内容检索工程师（5项）

| resource_id | title | provider | resource_type | stage | theme / theory_domains | learning_output | canonical_url | limitations | batch |
|---|---|---|---|---|---|---|---|---|---|
| PLR-RETR-001 | Introduction to Information Retrieval | Christopher Manning、Prabhakar Raghavan、Hinrich Schütze；Stanford NLP | book | L0–L2：倒排索引、词法检索、排序与评估 | 教材内容检索；信息检索基础；词法与语义召回；排序与重排；检索评估与引用定位 | 围绕《Introduction to Information Retrieval》制作概念卡、一次受限练习和一个失败/边界反例，并交付版本化分节索引、查询/反例集、排序指标和原文定位报告。 | https://nlp.stanford.edu/IR-book/ | 2008/2009 时代教材；神经检索、现代向量数据库和大模型部分需要新资料补充。 | B |
| PLR-RETR-002 | CS 276: Information Retrieval and Web Search | Stanford University | article_or_reference | L0–L2：大学课程与实验 | 教材内容检索；信息检索基础；词法与语义召回；排序与重排；检索评估与引用定位 | 围绕《CS 276: Information Retrieval and Web Search》制作概念卡、一次受限练习和一个失败/边界反例，并交付版本化分节索引、查询/反例集、排序指标和原文定位报告。 | https://web.stanford.edu/class/cs276/ | 课程页面/学期材料会变；作业环境可能停用或依赖旧软件，需固定可复现版本。 | B |
| PLR-RETR-003 | Ranking and reranking | Elastic | documentation | L1–L2：BM25、向量检索和融合排序 | 教材内容检索；信息检索基础；词法与语义召回；排序与重排；检索评估与引用定位 | 围绕《Ranking and reranking》制作概念卡、一次受限练习和一个失败/边界反例，并交付版本化分节索引、查询/反例集、排序指标和原文定位报告。 | https://www.elastic.co/docs/solutions/search/ranking | Elastic 产品文档有厂商实现偏好；算法需在本项目语料和中文输入上用固定查询集测 precision/recall、MRR/nDCG 和引用正确性。 | B |
| PLR-RETR-004 | BEIR: A Heterogeneous Benchmark for Zero-shot Evaluation of Information Retrieval Models | Nils Reimers 等；NeurIPS 2021 / BEIR 项目 | benchmark | L1–L3：跨数据集评估与基准意识 | 教材内容检索；信息检索基础；词法与语义召回；排序与重排；检索评估与引用定位 | 围绕《BEIR: A Heterogeneous Benchmark for Zero-shot Evaluation of Information Retrieval Models》制作概念卡、一次受限练习和一个失败/边界反例，并交付版本化分节索引、查询/反例集、排序指标和原文定位报告。 | https://github.com/beir-cellar/beir | 基准以英文和公开数据集为主，不能直接代表中文教材语料；应建立本项目版本化中文测试集并保留原失败。 | B |
| PLR-RETR-005 | Semantic Search – Sentence Transformers | Sentence Transformers project | documentation | L1–L2：embedding 与语义召回 | 教材内容检索；信息检索基础；词法与语义召回；排序与重排；检索评估与引用定位 | 围绕《Semantic Search – Sentence Transformers》制作概念卡、一次受限练习和一个失败/边界反例，并交付版本化分节索引、查询/反例集、排序指标和原文定位报告。 | https://www.sbert.net/examples/sentence_transformer/applications/semantic-search/README.html | 文档示例使用特定模型/库版本；embedding 模型对语言、领域和分块敏感，必须绑定模型哈希和语料版本。 | B |

## 跨岗位训练交接

1. 课程架构师按岗位先修和 L0→L3 设计阅读—练习—作品路径；产品经理冻结任务与验收条件。
2. 各岗位责任人把资源转成术语卡、关键权衡、一个可复现实作和一个反例；内容审校员核来源，测试工程师独立核产出证据。
3. 版本敏感资源在训练前重新打开并记录发布日期/版本、许可和环境；不把静态资料阅读写成真实模型调用、生产运行、学习效果或行业比较结果。
