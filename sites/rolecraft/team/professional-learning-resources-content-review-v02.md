# 专业学习资料内容审校 v0.2（整合目录返修复核）

- 复核日期：2026-10-14（Asia/Shanghai）
- 审校岗位：内容审校员（独立复核）
- 复核对象：`team/professional-learning-resources-v01.md`、`team/professional-learning-resources-v01.json`
- 前置记录：`team/professional-learning-resources-content-review-v01.md/.json` 的首检缺陷记录保留，不因本次返修覆盖。
- 结论：`reviewed_with_limitations`

## 返修已关闭的结构问题

- 当前目录共 59 条：A 批 25 条、B 批 31 条、PM 补充 3 条；A 批已进入目录。
- 59 个 `resource_id` 唯一，15 个 `role_id` 均出现，计数为 PM 3、PROD 3、CURR 3、DES 3、FE 3、QA 3、ED 3、AI 8、BE 4、UR 4、COMP 4、PRACT 4、OPS 5、REV 4、RETR 5。
- 初检的 `role_id=null`、A批遗漏和资源无法交接问题已关闭。目录仍不能由结构修复推出学习效果、岗位胜任或专家审核。

## 高时效来源复核结果

以下条目在本次复核中重新打开了官方/大学/标准/原作者页面；其余资源沿用 v0.1 的来源审校结果，本次没有逐页重开。

| 条目 | 结果 | 证据与动作 |
|---|---|---|
| `PLR-AI-006` AI Agents in LangGraph | **未关闭** | 目录仍使用 `https://www.deeplearning.ai/alpha/short-courses/ai-agents-in-langgraph`；当前 canonical 页面为 `https://www.deeplearning.ai/courses/ai-agents-in-langgraph`。应更新 URL，并记录当前 1h32m、9 lessons、PRO/阶段性免费状态。 |
| `PLR-COMP-004` European Commission Market Definition Notice | **未关闭** | 目录仍指向 2020 咨询/评估页；当前欧盟 Notice 为 2024-02-22 的 EUR-Lex `CELEX:52024XC01645`（`https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ%3AC_202401645`）。需替换或明确旧页仅作历史评估背景。 |
| `PLR-BE-003` Professional Data Engineer Learning Path — Google Cloud | **未关闭** | 当前 URL 是 Professional Data Engineer Certification 页，页内另有 Data Engineer learning path。标题需拆为认证页/学习路径，另记考试 $200、英语/日语、认证有效期和推荐经验等动态字段。 |
| `PLR-BE-004` Designing Data-Intensive Applications | **未关闭** | `dataintensive.net` 仍是第一版作者落地页；2026 第二版由 Martin Kleppmann 与 Chris Riccomini 合著。需改用版本明确的 O’Reilly/作者链接，不能由旧页直接支持第二版章节或命令。 |
| `PLR-ED-003` OpenStax Writing Guide | **部分关闭** | CC BY-NC-SA 4.0 表述正确，但目录 limitation 仍未写出 OpenStax 页面关于“未经书面许可不得用于 LLM 训练或摄入生成式 AI 服务”的限制。要把该许可边界写入资源卡和改编交接。 |
| `PLR-AI-003` / `PLR-AI-008` OpenAI Agents SDK | **已核来源，需版本登记** | `developers.openai.com` 指南和 `openai.github.io/openai-agents-python` Python 文档均可打开，内容支持 tools/handoffs/guardrails/sessions/MCP/tracing/testing 等描述；目录仍缺 `source_version`、模型/SDK版本和访问/成本字段。 |
| `PLR-AI-001` / `PLR-AI-004` Andrew Ng Agentic AI | **已核来源，需去重说明** | DeepLearning.AI 页面仍支持 Andrew Ng、7h45m、Agentic patterns、tools、evaluation 等描述。A/B 两条保留来源批次是可追溯的，但应注明它们是同一课程，不把重复条目计作两门不同课程。 |
| `PLR-AI-002` / `PLR-AI-007` Anthropic | **已核为原作者材料，需补时效句** | 页面说明 2024 年文章中的工具版图已变化；目录只写模型/API会变化，需补“本文为日期化厂商经验，当前工具版图另查”这一限制。 |

## 仍存在的内容/元数据缺口

### 资料卡合同尚未满足

framework 要求的 `resource_id / role_id / title / provider / resource_type / url / canonical_url / source_version / accessed_at / language / cost_and_access / prerequisites / estimated_effort / theory_domains / learning_objectives / textbook_or_task_mapping / authority_reason / maintenance_or_publication_date / known_limits / theory_check / required_artifact / transfer_case / reviewer / status` 尚未全部进入 JSON。当前 59 条记录共同缺少或未单列：

- `source_version`
- `language`
- `cost_and_access`
- `prerequisites`
- `estimated_effort`
- `authority_reason`
- `maintenance_or_publication_date`
- `known_limits`（目前多为 `limitations`，字段名未与合同一致）
- `theory_check`
- `required_artifact`（目前有 `learning_output`，但字段名未与合同一致）
- `transfer_case`
- `reviewer`
- `status`

目录 Markdown 的“字段完整”陈述因此超出当前 JSON 证据。`canonical_url`、`source_urls`、`source_relevance` 和 `learning_output` 是有益补充，但不能静默代替合同字段；需要课程架构师/资源研究员决定字段映射后再由 QA 复核。

### 描述边界仍需收紧

- `PLR-AI-001` 的 `source_relevance` 写“直接对应本项目AI生成服务与内容检索Agent的工程基础”；课程内容相关性有来源，但“直接对应本项目”是项目映射推断。建议改为“可作为……相关理论输入”，并另列本项目练习映射。
- `PLR-PROD-001` 的 `resource_type` 仍为 `article_or_reference`，但 Wharton 官方页是六周在线课程，应改为 `course` 并保留收费/批次复核字段。
- AI 条目 A/B 重复是来源追溯需要，不应在学习计划中当作八门独立课程；目录计数应说明“8条资料、其中3组跨批次重复”。
- 目录已有“阅读/证书/一次演示不等于能力”的总边界；在每条 `learning_output` 和训练合同中仍需保持“建议产出”措辞，不把阶段 L0–L3 写成学习者已达等级。

## 未重新打开的条目

本次没有逐页重开 PM、PROD（除 Wharton）、CURR、DES、FE、QA、ED（除 OpenStax）、BE（除 Google Cloud/DDIA）、UR、COMP（除 EU）、PRACT、OPS、REV、RETR 其余链接。其来源身份、标题和大范围局限沿用 v0.1 审校；开训前仍需要 QA 按访问日重开链接并记录版本/费用/许可/地域。

## 当前复核结论

- 目录结构：`met_within_structure_scope`（15 个岗位、59 条、ID 唯一、A/B/PM 来源齐全）。
- 来源与描述：`reviewed_with_limitations`（高时效条目中仍有 4 个链接/版本未修复，OpenStax许可限制缺项，Anthropic时效句缺项，部分映射语句需收紧）。
- 资料卡合同：`not_met`（13 个合同字段仍未单列）。
- 学习效果、岗位胜任、证书价值、真实用户/运营效果、真人专家审核、生产运行、行业先进性：`not_assessed`。

## 返修交接

- 课程架构师/资源研究员：先修复 LangGraph、欧盟 2024 Notice、GCP 学习路径、DDIA 版本、OpenStax 许可和 Anthropic 时效；决定 `limitations→known_limits`、`learning_output→required_artifact` 等字段映射并补齐缺失字段。
- 内容审校员：字段和链接修复后再复核，不把本次 `met_within_structure_scope` 当作全部目录通过。
- 测试工程师：保持 v0.1 首失败记录，独立复核 59 条链接、15 岗计数、重复课程说明、字段完整度和状态边界。

## 最新输入哈希

- `professional-learning-resources-v01.md`: `3c1506ab5c77f0c547078d3acd522848e0553ebb2a23fadcf785c0c57bbc058d`
- `professional-learning-resources-v01.json`: `40b087a59dbf24dc6ec75fa390984a460bf1110128e5600bd60534444433d259`
- v0.1 内容审校首检哈希：见 `professional-learning-resources-content-review-v01.md/.json`。
