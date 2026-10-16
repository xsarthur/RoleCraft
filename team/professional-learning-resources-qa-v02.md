# 岗位专业学习资料目录 v0.1：独立 QA 复验 v0.2

- 日期：2026-10-14（Asia/Shanghai）
- 独立岗位：测试工程师（`/root/resource_qa_retest`）
- 核验对象：`professional-learning-resources-v01.md/.json`（返修后当前版本）及 v01 首检、内容审校 v0.1/v0.2 报告
- 方法：静态解析、15 岗计数、字段非空、Markdown/JSON 交叉一致、A/B/PM来源回溯和能力边界扫描；交叉读取内容审校 v0.2 对部分高时效页面的复核，但本QA没有重新打开外部链接，没有执行课程、理论考试、岗位作品或能力评价。

## 结论

**目录配置限定范围：`met_with_limitations`。** 当前 JSON 可解析，共 59 条；15 个稳定 `role_id` 均出现且每岗至少 3 条；Markdown 与 JSON 的 59 条关键记录字段一致；14 项本轮合同字段全部非空；A 批 25 项、B 批 31 项和 PM 补充 3 项均能按批次/标题/链接回溯。Andrew Ng/DeepLearning.AI 的 `Agentic AI` A、B 两条均绑定 `role_id=AI`。这些结论只说明目录可消费性。

**高时效资料仍待复核但不阻断上述限定配置。** v01 内容审校指出的 LangGraph 旧路径、欧盟市场定义 2020 咨询页、DDIA 版本页、Google Cloud 标题/链接错配、Anthropic 日期化文章、Elastic 文档版本等问题在当前字符串/结构中仍未得到在线复验或结构化修复；本报告将其分级为 `open_not_retested`/`partial_not_retested`，训练前必须重新打开并记录版本、访问、费用、许可和地区状态。

**学习效果：`not_assessed`。** 资源、阅读、证书、演示和目录命中仍被明确写成学习输入，不能推出岗位胜任、项目通过、真人专家审核、真实用户价值、生产能力或行业先进性。

## 静态结果

### 岗位和批次计数

| role_id | 条目数 |
|---|---:|
| `PM` | 3 |
| `PROD` | 3 |
| `CURR` | 3 |
| `DES` | 3 |
| `FE` | 3 |
| `QA` | 3 |
| `ED` | 3 |
| `AI` | 8 |
| `BE` | 4 |
| `UR` | 4 |
| `COMP` | 4 |
| `PRACT` | 4 |
| `OPS` | 5 |
| `REV` | 4 |
| `RETR` | 5 |

| 来源批次 | 条目数 |
|---|---:|
| `A` | 25 |
| `B` | 31 |
| `PM补充` | 3 |

### 检查项

| ID | 检查 | 状态 | 证据 |
|---|---|---|---|
| PLR-QA-V02-01 | JSON可解析 | pass | 顶层数组 59 条。 |
| PLR-QA-V02-02 | 15个稳定 `role_id`、每岗至少3条 | pass | 计数为 PM3、PROD3、CURR3、DES3、FE3、QA3、ED3、AI8、BE4、UR4、COMP4、PRACT4、OPS5、REV4、RETR5。 |
| PLR-QA-V02-03 | Markdown/JSON 59条关键字段一致 | pass | 59/59 行；`resource_id`、role、标题、提供者、类型、阶段、主题/理论域、产出、canonical_url、局限、batch、accessed_at 均无差异。 |
| PLR-QA-V02-04 | 本轮字段非空 | pass | `resource_id/role_id/title/provider/url/canonical_url/resource_type/accessed_at/stage/theme/theory_domains/learning_output/limitations/batch` 共14项、59条，空值0。 |
| PLR-QA-V02-05 | A25+B31+PM3来源回溯 | pass_with_limitations | A标题/URL匹配25/25；B匹配31/31；PM补充3条有稳定ID、batch和canonical_url，但无独立PM研究文件。 |
| PLR-QA-V02-06 | Andrew Ng Agentic AI绑定AI | pass | `PLR-AI-001`（A）和`PLR-AI-004`（B）均为 `role_id=AI`，保留重复来源批次。 |
| PLR-QA-V02-07 | 不把阅读写成能力 | pass（声明层） | 目录总边界和条目limitations明确分离学习输入与能力证据；未执行能力评价。 |
| PLR-QA-V02-08 | 高时效链接/版本在线复开 | not_retested | 本轮不做外部网络复验；问题另列并标为不阻断目录配置的待复核项。 |

## v01首检缺陷复验

| v01缺陷 | 当前状态 | 说明 |
|---|---|---|
| PLR-QA-01：role_id空值、A批遗漏 | **closed** | 15岗均有绑定，A/B/PM批次均进入目录。 |
| PLR-QA-02：结构化资料卡字段缺失 | **partial** | 本轮字段和主题/产出已补齐；框架合同的 `source_version/language/cost_and_access/prerequisites/estimated_effort/learning_objectives/textbook_or_task_mapping/authority_reason/maintenance_or_publication_date` 等仍缺。 |
| PLR-QA-03：JSON丢主题/产出、B批泛化 | **closed** | 59条关键字段与岗位化产出已对齐。 |
| PLR-QA-04：canonical URL/多链接结构 | **partial** | 所有记录有 `canonical_url`；3条有 `source_urls`，但 `url` 原字段仍保留复合字符串；在线可访问性未测。 |
| PLR-QA-05：provider/stage/局限/访问日 | **closed_with_limitations** | 59条均有四项字段；维护/发布日期仍未结构化。 |
| PLR-QA-06：旧资料版本/复核日期 | **open_not_retested** | 旧资料的版本、维护/复核状态未结构化，未在线重开。 |
| PLR-QA-07：Agentic AI未绑定AI | **closed** | A、B 两条 Andrew Ng/DeepLearning.AI 资源均绑定AI。 |
| PLR-QA-08：PM条目合同不一致 | **closed_with_limitations** | PM3条已采用同一基本字段；PM无单独研究源文件。 |
| PLR-QA-09：职责边界 | **closed_with_limitations** | 角色和岗位化产出可交接；实际学习和领域适用性仍未执行。 |
| PLR-QA-10：阅读与能力边界 | **pass_declaration_only** | 仅确认声明层，能力效果仍 `not_assessed`。 |

## 高时效和版本待复核（不阻断限定目录配置）

| ID | 条目 | 级别 | 状态 | 复核要求 |
|---|---|---|---|---|
| PLR-TIME-01 | `PLR-AI-006` LangGraph | P1 high | `open_not_retested` | 当前仍为 `deeplearning.ai/alpha/short-courses/...`；训练前复核 canonical 课程页、时长、访问条件。 |
| PLR-TIME-02 | `PLR-COMP-004` 欧盟 Market Definition | P1 high | `open_not_retested` | 当前仍为 2020 咨询页；复核并记录 2024 Notice 或明确历史语境。 |
| PLR-TIME-03 | `PLR-BE-004` DDIA | P1 high | `open_not_retested` | 当前无明确版本字段；核对第1/第2版作者、章节和示例来源。 |
| PLR-TIME-04 | `PLR-BE-003` Google Cloud Data Engineer | P2 medium | `open_not_retested` | 认证页与学习路径需拆分，复核费用、语言、有效期和经验要求。 |
| PLR-TIME-05 | `PLR-AI-002` Anthropic | P2 medium | `open_not_retested` | 保留日期化厂商经验边界，补当前复核日期/跟进链接。 |
| PLR-TIME-06 | `PLR-RETR-003` Elastic | P2 medium | `open_not_retested` | 绑定文档版本并用本项目中文查询集实测。 |
| PLR-TIME-07 | 全部旧/动态资料 | P2 medium | `open_not_retested` | 补 `source_version/language/cost_and_access/maintenance_or_publication_date/recheck` 等字段。 |
| PLR-TIME-08 | `PLR-AI-008/OPS-004/RETR-004` 多链接 | P2 medium | `partial_not_retested` | 保留 `source_urls` 数组并清理 `url` 复合字符串；复核主/补充链接。 |
| PLR-TIME-09 | JSON `source_relevance` 映射措辞 | P2 medium | `open_not_retested` | 将“可支撑/直接对应”改为学习输入映射，来源主张与项目证据分层。 |

这些项目不推翻 59 条目录的限定配置结论，但也不能标为当前版本已完成版本/访问复核。未重新打开链接，不能声称页面现在可访问或状态未变。

## 输入哈希

- 当前目录 Markdown：`3c1506ab5c77f0c547078d3acd522848e0553ebb2a23fadcf785c0c57bbc058d`
- 当前目录 JSON：`40b087a59dbf24dc6ec75fa390984a460bf1110128e5600bd60534444433d259`
- `resource-research-a.md`：`ab5168eadd2a56b74391de35579e4dacc5d49ec961d75eeb5fea4f268b93c0c2`
- `resource-research-b.md`：`8114608fd79a86e6f7ba7170bcdd4e57db006ff0ce1fbacf9c50b8579d21cff5`
- `role-training-framework-v01.md`：`081ee0f07b1a9b0a18585ca1d1f8bce361d2452edf02340d0e98193d686cabb1`
- v01首检 Markdown/JSON：`9b267ed3ccb1988d05e5a265336e6430e82d913b03b54c3e4d879e882de86a85` / `3ef7468a602c8a46533b623d049dbb0f5ffb3c3dce20bd78b3566d1790756b57`
- v01内容审校 Markdown/JSON：`7e72d14fb2820e34458b39ba3cc4271164fd9442b815a01a4283effa57190e0c` / `548f6abe30b80295d82f837ec24f03bf2530c7adf888401de71885d7849fd6b8`
- v02内容审校 Markdown/JSON：`a60aecf068fa911fa8a7ea65f972bbc4c7341f26ac92088635d00028ed162102` / `32318f89fa9cfbb01045d35976ca58cc07f8657c761cdb88046d8156b54acbee`

## 不可由本报告推出

本报告没有执行课程、理论核验、岗位作品、陌生任务迁移、许可证/费用/地区实时复核、真人专家复核、真实学习者效果、真实用户价值、生产经济性或行业先进性。目录通过限定结构检查，不代表任何岗位已经学会或胜任。
