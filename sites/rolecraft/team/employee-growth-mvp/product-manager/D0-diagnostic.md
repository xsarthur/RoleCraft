# 产品经理 D0 隔离诊断规格（范围草稿）

- `diagnostic_id`: `PROD-D0-001`
- `diagnostic_version`: `product-manager-d0-v01`
- `contract_id`: `PROD-D0-001`
- `contract_version`: `product-manager-d0-v01`
- `contract_status`: `planned`
- `role_id`: `product-manager`
- `diagnostic_status`: `not_assessed`
- `status`: `not_assessed`
- `assessment_status`: `not_assessed`
- `owner`: 学习者本人；`learner_id` 必须匿名填写
- `mode`: `sandbox_scaffold`
- `fixture`: `fixtures/fixtures.product-recommendation-v01.json`
- `fixture_sha256`: `pending_freeze`

本文件只冻结产品经理 D0 的题目范围、预期观察、原始证据字段和交接条件，不包含学习者作答、评分、QA 结论或能力晋级。所有输入均来自合成夹具；未获得学习者原始提交、隔离执行收据、独立复核和接收签收前，保持 `not_assessed`。

## 岗位范围

产品经理把用户问题转成可交付、可验证的产品范围，负责用户场景、价值假设、版本边界、验收条件、失败/歧义状态和跨岗交接。产品经理不实现界面、教材、模型服务、数据库、检索或独立 QA，也不能把原型、一次 Demo、模拟用户、自查或营销材料写成真实用户、专家、生产或行业先进证据。

学习者在每题中声明自己的判断、明确不负责的实现或验收、需要接手的岗位、缺证时的停止/升级条件。默认不访问正式数据库、真实用户、生产系统、外部服务、付费模型，也不执行外部写入、上传或发布。

隔离环境固定为：`network_disabled=true`、`real_model=false`、`paid_api=false`、`real_user_data=false`、`external_action=null`。夹具只用于产品判断，不执行真实推荐、模型调用或外部动作。

## 五项诊断

### D0-01 边界复述

**题目范围**：针对“按自然语言推荐教材小节”的学习工作台功能，提交一页岗位合同，包含目标用户、问题、产品经理负责范围、非目标、设计/检索/软件工程/QA 交接点、未验证假设、越权请求拒绝和升级条件。

**预期观察**：区分需求与实现、产品验收与独立测试、原型与真实用户证据；在用户价值证据或授权缺失时停止或升级；不替工程岗位写接口或替 QA 宣布通过。

**原始产物**：学习者的未经代理改写的岗位合同及边界判断。

### D0-02 机制与专业判断

**题目范围**：解释“价值假设 → 指标/护栏 → 实验 → 结论”的因果链，说明功能存在、点击量和一次 Demo 各自不能证明什么；给出正常、失败和未知结果；区分用户原话、观察事实、作者假设和推断。

**预期观察**：解释可复核，写明适用边界、证据分母和未知；将课程标准或营销材料与当前产品实测分开，不把合成夹具当用户研究。

**来源绑定**：`product-creation-curriculum.md`、`product-creation-standard.md`、`product-standard.md` 及岗位 `ROLE.md`，执行包必须记录路径、版本标识和 SHA-256。

**逐主张来源字段**：每个主要机制或产品判断主张都必须写 `source_id`、`source_location`、`source_sha256`、`document_version` 和 `source_version_status`。`source_location` 的最小格式是“文档标题 + 稳定标题/锚点 + 快照行范围”；只写文件名或裸链接不够。当前 `product-creation-standard.md` 没有声明 `document_version`，其 `source_version_status` 必须保持 `missing_document_version_blocking`；仅有哈希快照不能解除该阻断。

**结果类别字段**：必须分别记录 `normal`、`failure`、`unknown` 三类，每类含 `expected`、`actual`、`evidence` 和 `next_action`。`actual` 在学习者提交前只能是 `learner_observed_result_required`，不能由诊断规格预填实测结论。

### D0-03 熟悉脚手架：版本化产品合同

**题目范围**：在隔离夹具中为“教材推荐入口”写 `W-PROD-D0-001`，不得写代码或教材正文。合同应覆盖目标用户与问题、场景、产品目标、非目标、版本范围、依赖、输入/输出、正常/边界/失败预期、验收条件、来源与版本、未验证项、跨岗交接和回滚/停止线。

**执行收据要求**：记录实际命令或操作步骤、输入快照 SHA-256、输出路径与 SHA-256、环境、开始/结束时间、stdout、stderr、退出码和首次失败（如有）。没有学习者执行证据不得将产物当作 D0 证据。

**预期观察**：产品契约可被接收岗位重建；版本、来源、失败状态和停止线可观察；没有把实现细节冒充产品目标。

**执行边界**：本夹具只测产品判断，推荐执行状态为 `not_executed`，不能声称已重建真实出处或已验证推荐结果。夹具提供合成 section catalog（`source_id`、`version`、`section_id`、`title`、内容快照、哈希和定位快照）供合同引用；候选推荐输出仍必须标记 `not_executed`。

### D0-04 失败识别

**题目范围**：审阅故意缺陷包：合同把“推荐命中”写成“学习有效”证明，缺少版本、来源和用户验证；另有“前端已通过 QA”但无独立报告。记录预期/实际差异、缺陷等级、受影响门槛、立即停止动作、责任岗位、返修顺序和复验顺序。

**预期观察**：指出功能数量或营销声称不能替代用户价值证据；产品经理不能替 QA 宣布通过；缺版本/来源时结论为 `unknown` 或 `insufficient_evidence`；保留首个失败，不用覆盖或改写关闭缺口。

**缺陷等级字段**：学习者必须输出 `severity_unclassified`，或引用产品负责人明确确认的等级。QA 不得自行创造严重级别阈值；没有产品确认时不能把等级写成已确定结论。

### D0-05 迁移预告

**题目范围**：未知变体把目标改为“为新岗位选择补学路径”，并加入来源版本冲突或预算上限中的一个约束。只提交计划，不执行，不引用未公开答案。

**预期观察**：先确认用户目标、版本、权限和约束；冻结范围；定义指标、护栏、证据分母和停止/升级条件；列出设计、课程/内容、检索、工程、QA 和项目经理的接收内容；明确未知，不预先调参或代答。

**留出变体计划字段**：`variant_id`、`version`、`frozen_by`、`frozen_at`、`input_hash`、`change_dimension`、`independence_proof`。D0-05 仅允许提交计划；QA 可以独立检查结构，但不能提供计划内容或执行计划。

## 原始提交与 EvidenceCard 字段

每项原始提交至少包含：

- `diagnostic_id`, `exercise_id`, `exercise_version`, `role_id`, 匿名 `learner_id`
- 学习者原始回答/产品合同/失败判断/迁移计划，未经代理改写
- `fixture_id`, `fixture_version`, `fixture_sha256`, 输入快照路径与 SHA-256、输出路径与 SHA-256
- 实际环境、命令或操作、开始/结束时间、stdout、stderr、退出码
- 事实、来源、假设、推断、未知、停止/升级决定
- 首次失败、返修版本、原例回归、受影响回归、留出变体；尚无则为 `pending`
- 学习者本人执行声明、未访问禁止数据声明、未执行外部动作声明、签名和时间戳
- `learner_execution: true`；QA 派生文件只能标 `derived_by: QA`

每张 EvidenceCard 至少包含：`diagnostic_id`, `exercise_id`, `exercise_version`, `role_id`, `learner_id`, `fixture_id`, `fixture_version`, `fixture_sha256`, `learner_execution`, `derived_by`, `card_id`, `claim`, `evidence_level`, `source_id`, `source_version`, `source_location`, `source_sha256`, `document_version`, `source_version_status`, `artifact_path`, `artifact_sha256`, `environment`, `observed_result`, `expected_result`, `failure_first_seen`, `reviewer`, `review_status`, `unknowns`, `next_action`。缺原始收据、来源定位、独立复核或学习者归属时只能保持 `insufficient_evidence`。

## 独立复核与接收

测试工程师独立核对夹具/输入哈希、原始收据、失败识别、停止动作和可复现性，并使用非作者冻结的短变体检查 D0-05 是否代答。课程架构师或内容审校员核机制、来源版本和事实/假设/推断分类。另一名产品责任人或项目经理核范围和验收字段；学习者不得自审晋级。

交接包必须包含诊断/题目/岗位/学习者元数据、夹具 ID/版本/哈希、`learner_execution`、`derived_by`、输入/输出路径、版本与哈希、验收状态、未关闭缺口、责任人、接收方、停止线、依赖、已验证/未验证、风险、复验命令、复验顺序（原例 → 首失败/停止 → 修复 → 原例回归 → 受影响回归 → 留出）和签收时间。接收方需重建最小命令/步骤并签 `accepted` 或提供有据 `rejected`；没有接收签名不能关闭 D0-03。

## 停止线与状态

无法确认岗位范围、用户目标（`missing_user_goal`）、来源版本、夹具哈希、权限/数据边界、原始收据或学习者归属时，停止受影响路径并标记 `unknown`、`blocked` 或 `forbidden`。越权访问、外部动作、覆盖首失败、伪造用户反馈或将自查写成独立通过属于 P0 阻断。

本诊断只允许 `not_assessed`、`insufficient_evidence`、`fail` 或有限观察记录。五项学习者原始回答、隔离收据、独立 QA、内容/产品复核及接收签收齐全后，项目经理才可评估 L0 起点；本诊断不授予 L0、L1 或 L2。

## 来源绑定（只作为规格依据）

| source_id | path | document_version | source_version_status | source_sha256 |
|---|---|---|---|---|
| `ROLE-PM` | `sites/rolecraft/team/employees/core/product-manager/ROLE.md` | `not_declared` | `hash_bound_only` | `56f932f3621b64469b3136ff3d1cafa3af900608f5c82947e33e0012ffd614c7` |
| `GROWTH-CURRICULUM` | `sites/rolecraft/team/employee-growth-curriculum.md` | `employee-growth-v1.0` | `declared` | `d9d56934223ea7e63be768c9f0eb765761ea7da18d81267c3e74fa7defc1c5aa` |
| `PRODUCT-CREATION-CURRICULUM` | `sites/rolecraft/team/product-creation-curriculum.md` | `教学草案 v0.1` | `declared` | `495520a042239de9ed3ec7544c496f42052d9e0eaff53b2f8e9450e09e74b9fd` |
| `PRODUCT-CREATION-STANDARD` | `sites/rolecraft/team/product-creation-standard.md` | `not_declared` | `missing_document_version_blocking` | `b57e4ee78b58773377c73088068e6b036c8c52d53a48382424de5bdbcfd609ff` |
| `PRODUCT-STANDARD` | `sites/rolecraft/team/product-standard.md` | `not_declared` | `hash_bound_only` | `76d0aac23a5573112967a01061b0ee97db3877ced58ec41f758d96ee439f4eb6` |

表中最后一列是 `source_sha256`；共同培养课程和产品创造课程已绑定各自文件内声明的版本。岗位章程、产品标准和产品创造标准仍没有正式 `document_version`，只能作为哈希绑定快照；其中 `product-creation-standard.md` 的缺失版本仍是 D0-02 阻断。

## 夹具哈希口径

夹具不在自身内容中写入自身文件的真实哈希。这里的 `canonical_path` 是 `fixtures/fixtures.product-recommendation-v01.json`，与合同夹具 basename `fixtures.product-recommendation-v01.json` 一一对应；合同中的 `fixture_sha256` 只从外部冻结清单回填，不由文件自身计算。执行冻结前，`canonical_content_sha256` 和 `fixture_file_sha256` 均保持 `pending_freeze`，由外部冻结清单绑定；规范化内容计算时排除 `fixture_sha256`、`canonical_content_sha256`、`fixture_file_sha256` 及哈希状态字段。夹具当前只声明清单路径和口径，不构造哈希值。

`product-creation-standard.md` 当前只有哈希绑定快照而没有声明 `document_version`，因此来源表的 `missing_document_version_blocking` 是诊断阻断状态；未补齐版本前，D0-02 不能以该来源完成可复核主张绑定。

