# 四项专业资料链接与元数据复核 v0.2

- 复核日期：2026-10-15（Asia/Shanghai）
- 复核角色：资源研究员（内容来源与访问条件核查）
- 范围：`PLR-AI-006` LangGraph、`PLR-COMP-004` 欧盟市场定义、`PLR-BE-003` Google Cloud Professional Data Engineer、`PLR-BE-004` DDIA。
- 目的：在进入正式训练前确认当前官方入口、版本/发布日期、费用与访问、语言、先修及使用限制；本记录不改正式 `professional-learning-resources-v01.md/.json`，也不把阅读或证书当作能力证据。
- 访问日：所有页面均按本记录日期核对。DeepLearning.AI课程页的搜索索引可读但直接抓取返回403；EUR-Lex文本页的直接抓取触发机器人校验，使用欧盟委员会目录、EUR-Lex搜索结果及可下载PDF交叉核对，并保留该访问限制。

## 复核结论

| 资源 | 当前结论 | 训练前动作 |
|---|---|---|
| LangGraph | `verified_current_with_fetch_limitations`；官方当前课程页为 `/courses/ai-agents-in-langgraph`，旧 `/alpha/short-courses` 路径不再作为主入口 | 正式目录把旧 `canonical_url` 换成当前课程页；保留旧路径为 legacy alias，训练时在课程代码运行前再次核 API/环境 |
| 欧盟市场定义 | `verified_current`；2024/C 1645 公告已替代 1997 Notice，2020 页面只是评估/咨询背景 | 将现有咨询页换成 EUR-Lex 2024 Notice；将 2020 页面保留为历史来源，不当作现行规则 |
| Google Cloud PDE | `verified_current_split_required`；认证页与学习路径是两个不同对象，当前目录标题/URL混用 | 正式目录拆为“学习路径”和“认证考试”两条资源；保留认证页为相关链接并记录考试费用、语言、有效期与经验建议 |
| DDIA | `verified_current_with_edition_note`；O’Reilly列出第2版（2026，ISBN 9781098119058），作者书目月份与出版商页面存在月度差异 | 正式目录主链接换为第2版；旧 `dataintensive.net` 只标为第1版历史介绍，不作为当前版本依据 |

## 1. `PLR-AI-006` — AI Agents in LangGraph

- **当前 canonical URL**：<https://www.deeplearning.ai/courses/ai-agents-in-langgraph>
- **旧 URL**：<https://www.deeplearning.ai/alpha/short-courses/ai-agents-in-langgraph>（目录当前值）；历史短课路径还见 <https://www.deeplearning.ai/short-courses/ai-agents-in-langgraph/>。
- **页面标题**：AI Agents in LangGraph
- **提供方/讲师**：DeepLearning.AI；Harrison Chase（LangChain 联合创始人/CEO）、Rotem Weiss（Tavily 联合创始人/CEO）。
- **当前可确认版本信息**：课程页当前标为 Intermediate、1h32m、9 Video Lessons、6 Code Examples、1 Graded Assignment（PRO）。页面未显示发布日期或固定课程版本号；因此版本字段应写“页面现行快照（2026-10-15），发布日期未显示”，不要虚构发布日。
- **费用与访问**：页面标注“课程访问在 DeepLearning.AI 学习平台 beta 期间限时免费”，需注册/登录后报名；页面把 graded assignment 与 accomplishment 标为 PRO，不能把免费旁听与完整PRO功能混为一谈。未来价格和beta结束时间未在页面固定，应训练前重开确认。
- **语言**：页面与课程标题/大纲为英文；官方课程页未提供独立的多语言字段，本记录写“英文（页面未声明其他语言）”。
- **先修**：官方“Who should join?”明确要求 intermediate Python knowledge；课程还使用LLM、工具调用、agentic search等概念，正式训练可把“能读写基础异步/类与调用LLM API”作为本项目补充先修，但该补充不是官方硬门槛。
- **许可/使用限制**：课程页未列出可复制或再分发的开放许可；按 DeepLearning.AI/合作方平台条款访问，训练材料应链接原页、不要抓取或重新发布视频、讲义和代码包。LangGraph开源库的许可不等于课程内容许可；代码示例运行仍需按当前依赖/API文档复核。
- **旧链接处理建议**：把 `/alpha/short-courses/...` 标为 `legacy_superseded`，主链接改 `/courses/...`；保留旧串用于迁移/重定向检查，不在教材中继续引用 `alpha` 作为“当前版本”。
- **可确认内容**：课程覆盖从Python手写Agent迁移到LangGraph、组件、agentic search、持久化/流式、人机协同和essay-writer工作流；用于“显式状态、工具边界、可恢复执行”基础训练。课程完成不代表通用Agent架构或生产能力。
- **证据来源**：
  - <https://www.deeplearning.ai/courses/ai-agents-in-langgraph>（官方课程页；搜索索引显示以上标题、时长、讲师、先修和免费beta说明；直接抓取受403限制）
  - <https://www.deeplearning.ai/courses>（官方课程目录，用于确认现行 `/courses` 路径）

## 2. `PLR-COMP-004` — 欧盟相关市场定义公告

- **当前 canonical URL**：<https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ:C_202401645>
- **官方索引页**：<https://competition-policy.ec.europa.eu/mergers/legislation/notices-and-guidelines_en>
- **可下载PDF**：<https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX:52024XC01645>
- **旧 URL**：<https://competition-policy.ec.europa.eu/public-consultations/2020-market-definition-notice_en>（2020评估/咨询页）。
- **页面标题**：Communication from the Commission – Commission Notice on the definition of the relevant market for the purposes of Union competition law
- **机构/文号**：European Commission（Directorate-General for Competition）；OJ C/2024/1645；CELEX 52024XC01645；文件内部 C/2023/6789。
- **当前可确认版本/发布日期**：Official Journal C/2024/1645，发布日期 2024-02-22。公告第116段明确 supersedes 1997 Commission Notice（97/C 372/03）。
- **费用与访问**：EUR-Lex、委员会目录和PDF均为公开免费访问，无课程注册或付费要求；下载和语言切换由EUR-Lex提供。
- **语言**：EUR-Lex记录列出24种语言版本：BG、ES、CS、DA、DE、ET、EL、EN、FR、GA、HR、IT、LV、LT、HU、MT、NL、PL、PT、RO、SK、SL、FI、SV。训练默认使用英文版，并在需要时链接目标语言版本。
- **先修**：公告本身没有课程式先修。正式训练前建议先具备基本竞争法/反垄断、产品与地理市场、需求/供给替代和市场份额概念；这些是课程架构补充，不应写成欧盟公告的硬性入学要求。
- **许可/使用限制**：这是欧盟官方法律/政策公告，不是咨询公司市场规模报告，也不是商业策略模板；适用范围是Union competition law执法。重用和翻译应遵守EUR-Lex/欧盟法律信息政策并保留文号与来源；不能把学习摘录当法律意见或对具体案件的结论。
- **旧链接处理建议**：2020页面保留为评估背景（页面说明1997 Notice的评估过程），状态改为 `historical_evaluation_context`；正式训练和引用改用2024/C 1645。不要继续把“2020 Market Definition Notice”称为当前公告。
- **可确认内容**：2024公告说明相关产品和地理市场、需求/供给替代、事实依赖和市场定义在竞争评估中的中间工具作用；具体案件仍需个案法律分析。
- **证据来源**：
  - <https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ:C_202401645>（EUR-Lex官方文本；直接HTML抓取当日触发机器人校验，但搜索结果与PDF可读）
  - <https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX:52024XC01645>（EUR-Lex官方PDF）
  - <https://competition-policy.ec.europa.eu/mergers/legislation/notices-and-guidelines_en>（欧盟委员会当前法规/公告索引，列出 C/2024/1645）
  - <https://competition-policy.ec.europa.eu/public-consultations/2020-market-definition-notice_en>（仅历史评估页）

## 3. `PLR-BE-003` — Google Cloud Professional Data Engineer

现有目录把认证页误称为“Learning Path”。两者都是真实官方资源，但训练用途、费用和先修不同，必须拆分记录。

### 3.1 学习路径（主学习资源）

- **canonical URL**：<https://www.skills.google/paths/16>（旧域名 <https://www.cloudskillsboost.google/paths/16> 会重定向到 Google Skills 路径）。
- **页面标题**：Professional Data Engineer Certification（Google Skills）；Managed by Google Cloud；13 activities；页面显示“Last updated 4/5 months”（相对时间，随访问日变化）。
- **内容/访问**：路径由按需课程、实验室和 skill badges 组成，需 Sign in or join。官方路径页未给出固定总时长或统一价格；实验室可能需要订阅/积分，活动和促销的免费额度会变化。不可把“路径存在”写成免费完整实验环境。
- **语言**：路径总页未暴露完整语言字段；官方路径中的“Preparing for your Professional Data Engineer Journey”页面列出 English、日语、西班牙语（拉美）和葡萄牙语（巴西）。因此记录为“路径语言需逐活动确认；至少该准备课程提供上述四种语言”。
- **先修**：路径定位为 advanced；认证页给出的建议经验是3年以上行业经验，其中1年以上设计和管理Google Cloud解决方案。认证页的硬性 Prerequisites 为 None；这两句话要分别记录，不能把推荐经验写成强制门槛。
- **许可/使用限制**：课程、实验室和skill badge受 Google Skills/Google Cloud 使用条款约束；无公开再分发许可。仅链接或在内部学习笔记中做必要引用，实验环境和账号数据不得复制到项目仓库。
- **证据来源**：
  - <https://www.skills.google/paths/16>（当前路径；13 activities、登录、更新时间和内容描述）
  - <https://www.cloudskillsboost.google/paths/16>（旧域名入口/重定向）
  - <https://www.cloudskillsboost.google/paths/16/course_templates/72?locale=en>（官方准备课程：5h、Advanced、No cost；课程页说明视频/文档通常可免费消费，但实验室需要订阅/credits）

### 3.2 认证考试（相关但独立）

- **canonical URL**：<https://cloud.google.com/learn/certification/data-engineer>
- **页面标题**：Professional Data Engineer Certification | Learn | Google Cloud
- **版本/状态**：官方认证说明页当前版本（2026-10-15访问）；页面未给固定发布日期，考试指南由Google Cloud单独维护。
- **费用与访问**：标准考试注册费 **USD 200 + applicable tax**；续期考试 **USD 100 + applicable tax**。标准考试2小时、40–50题；可远程监考或考试中心。认证有效期2年；通过Google Skills指定课程/skill badges续期路径有效期1年（需符合资格）。
- **语言**：标准与续期考试均列 English、Japanese；这不是学习路径全部活动的语言清单。
- **先修/推荐经验**：Prerequisites: None；Recommended experience: 3+ years industry experience including 1+ year designing and managing Google Cloud solutions。正式训练应把证书考试作为可选外部认证，不把报名或通过当作后端岗位能力证据。
- **许可/使用限制**：考试内容、标准考试指南、条款和数据共享政策受Google Cloud/考试供应商条款约束；不得复制题目或共享考试内容。认证有效期和价格会变，训练前需重开页面。
- **旧链接处理建议**：原目录 `PLR-BE-003` URL保留为认证相关链接，但标题改为“Professional Data Engineer Certification（考试）”；新增单独学习路径记录，避免把考试费用/语言误套到学习路径，也避免把路径学习完成称为认证。
- **证据来源**：
  - <https://cloud.google.com/learn/certification/data-engineer>（考试费用、语言、有效期、Prerequisites、推荐经验及路径链接）
  - <https://www.skills.google/paths/16>（学习路径本体）

## 4. `PLR-BE-004` — Designing Data-Intensive Applications（DDIA）

- **当前 canonical URL**：<https://www.oreilly.com/library/view/designing-data-intensive-applications/9781098119058/>
- **作者确认页**：<https://martin.kleppmann.com/>
- **旧 URL**：<https://dataintensive.net/?lang=en>（第1版作者宣传页，页面仍可访问，但不应当作第2版版本证据）。
- **页面标题/作者**：Designing Data-Intensive Applications, 2nd Edition；Martin Kleppmann、Chris Riccomini；O’Reilly Media, Inc.
- **当前可确认版本/发布日期**：O’Reilly页面列 **February 2026**、ISBN **9781098119058**、672页、Intermediate to advanced、English；作者书目列 **O’Reilly Media, March 2026**。月份存在出版商页面与作者书目的差异，正式目录应固定“第2版（2026，ISBN 9781098119058）”，并保留该月度差异作为复核注记，不自行裁定具体日。
- **费用与访问**：O’Reilly页面提供 “Read now / Unlock full access” 与 “Buy online”；完整内容需O’Reilly订阅或购买，价格随地区/方案变化。作者旧宣传页称可购买纸书和电子书，不代表全文开放。
- **语言**：O’Reilly页面明确 English；其他语言版本需另行核对，不从旧宣传页推断。
- **先修**：页面级别为 Intermediate to advanced，没有正式入学先修。课程架构可要求软件工程、数据库、分布式系统基础和能阅读技术英文；这些是本项目学习路径的补学要求，不是出版商硬门槛。
- **许可/使用限制**：书籍由O’Reilly出版并受版权/订阅条款保护，未发现允许复制或再分发正文的开放许可；只保留书目信息、链接和必要的短引。作者个人网站除特别说明外为 CC BY 3.0，但该许可不自动覆盖O’Reilly书籍正文。书中产品命令和云服务示例必须按当前官方文档另行核对。
- **旧链接处理建议**：`dataintensive.net` 作为第1版历史介绍和作者背景保留；正式训练主链接换为O’Reilly第2版，并在课程笔记中明确“第1版（2017，Martin Kleppmann）”与“第2版（2026，Martin Kleppmann/Chris Riccomini）”不可混写。
- **可确认内容**：第2版介绍覆盖现代数据系统设计、可扩展性、一致性、可靠性、效率、可维护性、云服务和分布式系统权衡；阅读不替代本项目实际SQLite/Node任务、恢复演练或生产实测。
- **证据来源**：
  - <https://www.oreilly.com/library/view/designing-data-intensive-applications/9781098119058/>（O’Reilly第2版书页、作者、2026、ISBN、语言、级别和访问方式）
  - <https://martin.kleppmann.com/>（作者书目：第2版与第1版、出版月份和作者背景）
  - <https://dataintensive.net/?lang=en>（第1版历史宣传页，旧链接处理依据）

## 进入正式训练前的最低处理

1. 将四条复核记录（或其结构化字段）交给内容目录维护人；本文件不直接覆盖冻结目录。
2. 先修与语言按学习者实际情况分流：LangGraph需中级Python；Google路径按活动检查实验室账号；DDIA按中高级技术阅读安排补学；欧盟公告先补竞争法术语。
3. 每条资源首次训练任务记录访问日期、版本/文号、费用支付或免费条件、语言、许可提示和失败/无法访问原因。
4. 版本敏感资料只把本次复核作为“当前入口证据”；课程代码、云服务命令、法律适用和书中产品示例仍要在任务执行时另行验证。
5. 资源阅读、完成课程、获得证书或生成笔记，都不能单独证明岗位胜任、真实产品效果、真人专家审核或行业先进性。
