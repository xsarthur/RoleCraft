# 十五岗位专业学习资料目录 v0.1：独立 QA

日期：2026-10-14（Asia/Shanghai）  
独立岗位：测试工程师（`/root/resource_qa`）  
核验对象：`resource-research-a.md`、`resource-research-b.md`、`role-training-framework-v01.md`、`professional-learning-resources-v01.md`、`professional-learning-resources-v01.json`  
核验方式：对收到文件做静态结构、字段、交叉完整性和边界声明检查；未执行课程、未进行理论核验、未运行岗位作品或陌生迁移；URL仅做格式与重复检查，未把网页可访问性写成通过。

## 结论

**目录配置范围：`not_met`。** 当前整合目录有 34 项，但只有 3 项的 `role_id` 是 `PM`，其余 31 项为 JSON `null`/表格 `null`。研究 A 批的 25 项（产品经理、课程架构师、设计师、软件工程师、测试工程师、教材研发员、AI 生成工程师、后端数据工程师）没有进入整合目录；目录中的“15 岗均有资源条目”“每个 role_id 至少 3 项”因此没有当前数据支持。不能依据 B 批章节出现顺序推测岗位归属，因为索引消费者需要稳定的 `role_id`。

**学习与能力范围：`not_assessed`。** 目录和框架明确把资源、阅读、证书、示范和命中与岗位胜任、作品、陌生迁移、真人专家、真实用户、生产成本及行业比较分开；本 QA 没有执行任何学习活动或能力评价。目录通过后仍不能给任何岗位授予等级或专业能力结论。

## 实际静态证据

| 检查项 | 结果 | 证据与影响 |
|---|---|---|
| JSON 可解析 | pass | JSON 可解析为数组，34 个对象。 |
| 15 岗位枚举 | fail | 期望 `PM, PROD, CURR, DES, FE, QA, ED, AI, BE, UR, COMP, PRACT, OPS, REV, RETR`；实际唯一非空 role_id 只有 `PM`。 |
| 每岗至少 3 项 | fail | 按实际索引：`PM=3`，其余 14 岗没有可索引条目；31 项 `null` 不能计入任一岗位。 |
| A 批进入整合目录 | fail | A 批有 25 个资料项（8 岗：3/3/3/3/3/3/3/4），整合目录没有这些 URL/标题；当前仅见 PM 补充 3 项和 B 批 31 项。 |
| B 批可追溯到岗位 | fail | B 批章节本身有 AI/UR/COMP/PRACT/OPS/REV/RETR，整合表和 JSON 全部写成 `null`，无法按合同消费。 |
| URL 格式 | pass_with_limitations | 34 条的 URL 字符串均以 `http` 开头且未发现字面重复；但 OpenAI Agents SDK、NIST、BEIR 等把多个页面放在单一字符串并用 `；` 分隔，没有 canonical URL 或链接数组。 |
| 机构/作者 | pass | 34 条均有非空 `provider`，机构/作者文本可读。 |
| 阶段 | pass | 34 条均有非空 `stage`，使用 L0–L3 视图。 |
| 用途/学习出口 | partial | Markdown 有 `主题` 与 `学习产出`，但 B 批整合行统一写“岗位作品与陌生任务证据”，丢失研究文件中的岗位差异；JSON 没有 `theme`、`learning_output` 或等价用途字段。 |
| 局限 | pass_with_limitations | 34 条均有非空 `limitations`；多数旧课程的年份、供应商前提、付费/登录和不可替代能力边界已有文字说明。 |
| 访问日期 | pass | 34 条均有 `accessed_at=2026-10-14`；尚未有独立二次打开记录。 |
| 版本/语言/费用/先修等资料卡字段 | fail | JSON 只有 `role_id/title/provider/url/stage/limitations/accessed_at/batch`；缺 `resource_id、canonical_url、source_version、language、cost_and_access、prerequisites、estimated_effort、theory_domains、learning_objectives、textbook_or_task_mapping、authority_reason、maintenance_or_publication_date` 等框架合同字段。 |
| 明显过期/版本风险 | partial | A/B 研究已在局限中披露 2002、2006、2008/09、2010、2012、2014、2016/17 等资料的年代风险；整合索引没有结构化发布日期/复核状态，不能据此确认当前版本或可用性。 |
| 重复 | pass_with_limitations | 当前 34 条 URL 字面无重复；A/B 中 `Agentic AI` 等同一资料在跨批出现，A 被漏掉使当前去重结果不完整。返修须保留来源批次或给出明确去重关系。 |
| Andrew Ng / Agentic AI | partial | 目录有 Andrew Ng/DeepLearning.AI 的 Agentic AI 条目，但 `role_id=null`；资源存在不等于已正确挂到 AI 岗位。 |
| PM 资源 | partial | PM 补充的 3 条有 `PM`；A 批没有 PM 条目。当前 PM 仅满足数量，不能代表与全 15 岗合同一致。 |
| 职责边界 | pass_with_limitations | 目录声明课程架构师整合、内容审校核来源、QA 核字段/版本/链接，且不把阅读写成能力；但 null 归属和通用产出会使职责交接无法执行。 |
| 阅读是否被写成能力 | pass（声明层）/not_assessed（效果层） | Markdown 明确课程完成、证书、示范、资源命中不能关闭能力门槛；未执行理论核验、作品、陌生迁移或真实证据。 |

## 缺陷与返修要求

| ID | 严重度 | 缺陷 | 责任领域 | 复验条件 |
|---|---|---|---|---|
| PLR-QA-01 | P0 | 31 条 `role_id=null`，A 批 25 项漏入整合目录，不能按岗位发放或证明 15 岗覆盖。 | 课程架构师/目录整合责任人 | 重新生成 MD/JSON；15 个 role_id 全部出现，每岗至少 3 条；每条一对一保留来源和可追溯标题/URL。 |
| PLR-QA-02 | P1 | JSON 与 Markdown 不同构：JSON 丢失主题/用途/学习出口；B 批统一泛化产出，无法核岗位作品映射。 | 课程架构师 | 每项资源有结构化用途/理论域/学习产出或等价字段，且与岗位框架对应；随机抽各岗位 1 项核对。 |
| PLR-QA-03 | P1 | 资料卡合同字段大量缺失：版本、语言、费用/访问、先修、维护/发布日期、权威性理由等未进入索引。 | 课程架构师/资源研究 | 补齐字段或逐项标 `insufficient_evidence`；缺失项不得直接进入正式先修。 |
| PLR-QA-04 | P1 | 多链接塞入一个 URL 字符串，缺少 canonical URL/链接数组；访问性与版本未独立复验。 | 资源研究/目录整合 | 每个资源拆成规范 URL 列表或明确主链接与补充链接，重新执行格式、重复和访问状态检查；不得把检索摘要当访问证据。 |
| PLR-QA-05 | P2 | 旧课程虽有文字局限，但索引无结构化发布日期/复核日期，难以管理版本漂移。 | 资源研究/课程架构 | 添加出版/维护/复核字段，并对 2002–2017 等条目标出理论可用范围和现代补充资料。 |

## 职责与完整目标边界

本轮 QA 只检查资料目录的可消费性和声明边界。资源研究员负责来源搜集，课程架构师负责岗位主题、先修、产出和目录整合，内容审校员独立核论断/来源，岗位责任人决定领域适用性，测试工程师核结构与后续证据；项目经理只协调。QA 没有代写研究或课程，也没有把目录问题改写为学习者问题。

现有资料明确要求先做理论核验，再交岗位作品、陌生迁移和跨岗产品创造。上述活动在本轮没有执行，故真实学习效果、职业胜任、用户价值、真人专家认可、生产经济性和行业先进性均保持 `not_assessed`/`not_met`（依既有八门槛分别记录），不能因目录修复自动继承通过。

## 收到版本与证据绑定

- `professional-learning-resources-v01.md` SHA256：`7669ff2e307e3143993ae8e826619e532499f94333b7b6aa8a2caac56fed5b10`
- `professional-learning-resources-v01.json` SHA256：`5deeea6f6ce114a43d49edeedf8bbd5810a7b6534115c6e25b9d33c0d1709416`
- `resource-research-a.md` SHA256：`ab5168eadd2a56b74391de35579e4dacc5d49ec961d75eeb5fea4f268b93c0c2`
- `resource-research-b.md` SHA256：`8114608fd79a86e6f7ba7170bcdd4e57db006ff0ce1fbacf9c50b8579d21cff5`
- `role-training-framework-v01.md` SHA256：`081ee0f07b1a9b0a18585ca1d1f8bce361d2452edf02340d0e98193d686cabb1`

本报告是当前收到版本的独立静态 QA；目录返修后必须使用新版本重新核验，不能把本报告的缺陷关闭或旧结论自动迁移。
