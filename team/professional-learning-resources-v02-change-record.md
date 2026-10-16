# 岗位专业学习资料目录 v0.2 · 四项高时效资料接入变更记录

- 日期：2026-10-15（Asia/Shanghai）
- 输出：`team/professional-learning-resources-v02.json`
- 基线：`team/professional-learning-resources-v01.json`（保留，不覆盖）
- 变更范围：`PLR-AI-006`、`PLR-COMP-004`、`PLR-BE-003`、`PLR-BE-004`
- 候选补丁：`team/professional-learning-resources-metadata-v02.json`

## 变更

- **LangGraph**：canonical 改为 DeepLearning.AI `/courses/ai-agents-in-langgraph`；旧 alpha/short-courses 地址保留为 legacy；记录 1h32m、9 lessons、6 code examples、PRO 作业、中级 Python、beta 限时访问及课程许可未明确的限制。
- **欧盟市场定义**：canonical 固定为 EUR-Lex CELEX `52024XC01645`；OJ 查询地址作为等价来源别名，2020 咨询页标为历史评估背景；记录 2024-02-22、24 种语言和 EU/EUR-Lex 复用条件。
- **Google Cloud**：PLR-BE-003 以 Google Skills `/paths/16` 作为学习路径 canonical；认证页单独放入 `related_certification`，费用、考试语言和有效期不并入学习路径字段。
- **DDIA**：canonical 改为 O’Reilly 第二版页面，记录 Kleppmann/Riccomini、ISBN `9781098119058`、February 2026、English、Intermediate to advanced、21h56m和 Copyright Clearance Center 复用边界；旧作者页仅作第一版历史来源。
- **合同字段**：四项补齐 `source_version`、`language`、`cost_and_access`、`prerequisites`、`license_or_usage`、`maintenance_or_publication_date`、`recheck_at`、`reviewer`、`status`，以及 `known_limits`、`estimated_effort`、`authority_reason`、`theory_check`、`required_artifact`、`transfer_case`。

## 保护与状态

- v01 原文件未修改，v02 顶层仍为 59 条、59 个唯一 `resource_id`；Google 认证关系当前嵌套保存，未新增顶层 ID。
- 旧 URL、历史评估页和第一版作者页均保留在 `legacy_urls`/`source_urls`，不静默删除历史来源。
- `license_or_use`（复核资料命名）统一映射为正式目录字段 `license_or_usage`；EU OJ 地址只作 `source_urls` 别名。
- 当前状态：`final_qa_complete_formal_training_blocked`；正式训练闸门：`not_ready_pending_theory_check_and_access_reverification`。四项 `theory_check` 仍为 `pending`，动态价格、区域、逐活动语言、课程许可和直接抓取限制继续显式标记。

## 哈希

- v01：`40b087a59dbf24dc6ec75fa390984a460bf1110128e5600bd60534444433d259`
- 候选补丁：`ffa11722d446717b1f397c7c4614176ce0da0e9848b030715b35bb2176ce63c1`
- v02 JSON：`fe03b43087ac42d708e4db9bc8c5ec16aa3eec18d9e184defac29581f1295dc9`
- v02 Markdown：`127b7ece967838192db5c7020aca8a4b392d392a6293764df0e7f29f6dc31f41`

## 最终独立 QA

- QA：`team/professional-learning-resources-v02-qa.md/.json`（`PLR-QA-V02-FINAL`）。
- 结果：结构 `met`；来源元数据 `met_with_limitations`；正式训练 `not_met`（阻断）。四项 `theory_check` 均为 `pending`，当前仅允许 `candidate_resources_only`。
- 未验证限制：LangGraph 直接抓取 403；Google Cloud 路径总价/逐活动语言/实验室地区价格不稳定；DDIA 地区价格/具体代码许可和出版月份差异保留。

## 复验交接

测试工程师需以 v02 JSON 和本记录重跑：四项 ID/岗位映射、canonical/legacy 分离、EU CELEX 统一、`license_or_usage` 字段、Google 学习路径/认证隔离、未知项状态与 59 条保护。QA 通过后才能把条目状态调整为带限制的训练可用；阅读、证书或目录接入不等于岗位胜任、专家审核、真实学习效果或行业先进。
