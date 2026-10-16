# 四项专业资料链接与元数据复核：独立 QA v0.2

- 日期：2026-10-15（Asia/Shanghai）
- 独立岗位：测试工程师（`/root/current_link_qa`）
- 范围：`PLR-AI-006` LangGraph、`PLR-COMP-004` 欧盟市场定义、`PLR-BE-003` Google Cloud Professional Data Engineer、`PLR-BE-004` DDIA。
- 输入：`resource-link-reverification-v02.md/.json`、`professional-learning-resources-metadata-v02.json`、冻结目录 `professional-learning-resources-v01.json`。
- 方法：JSON 解析、字段非空和类型检查、四项 ID/岗位映射、canonical/旧链接分离、两个候选文件交叉检查，以及 2026-10-15 官方页面/索引只读复核。没有执行课程、认证考试、云实验室、代码样例、法律适用判断或学习者能力评价。

## 分层结论

| 层次 | 结论 | 说明 |
|---|---|---|
| 结构层 | `met` | 两个候选 JSON 均可解析，均只包含四项目标资源；字段完整、无空值，ID 与冻结目录角色一致。 |
| 来源元数据层 | `met_with_limitations` | 2024 欧盟公告、Google Skills 路径/认证页、O'Reilly DDIA 第2版的版本与入口得到官方页面支持；LangGraph 当前课程页的搜索索引支持元数据，但直接抓取返回 403。动态价格、地区、逐活动语言、课程许可及出版页更新时间仍按 `insufficient_evidence`/访问限制保留。 |
| 正式训练准入层 | `not_met`（`pending_integration`） | 元数据补丁尚未合并冻结目录；Google 记录要求拆分学习路径与认证，EU 两候选文件的 canonical 字符串一处使用 CELEX、一处使用 OJ 别名，许可字段名也有 `license_or_usage`/`license_or_use` 漂移。四项的 `theory_check` 仍为 `pending`，因此不能据此放行正式训练。 |

当前可交付状态是“**复核证据可供目录维护人接入，正式训练仍未放行**”。这不是对资料价值或岗位能力的否定，而是保留了集成和运行前的必要验证。

## 检查结果

| ID | 检查 | 状态 | 证据 |
|---|---|---|---|
| RLQA-01 | 复核文件 JSON 可解析且范围正确 | `pass` | 链接复核 4 条；元数据补丁 4 条；ID 集合完全为 AI-006、COMP-004、BE-003、BE-004。 |
| RLQA-02 | 资料卡字段非空 | `pass` | 每条均有版本、语言、费用/访问、先修、许可/使用、维护/发布日期、复核日、审阅者、状态、限制和证据 URL；元数据补丁另有非空 `legacy_urls`；未知项以 `insufficient_evidence` 或访问限制明确标记。 |
| RLQA-03 | 岗位绑定 | `pass` | 与冻结目录一致：AI-006→`AI`，COMP-004→`COMP`，BE-003/BE-004→`BE`。 |
| RLQA-04 | canonical 与旧链接分离 | `pass_with_mapping` | 四项均有新 canonical 和旧 URL；旧链接不与 canonical 重复。元数据补丁已显式声明 EU CELEX canonical、OJ 仅作等价 source alias；GCP 路径/认证拆分规则也已记录。 |
| RLQA-05 | LangGraph 当前入口与访问限制 | `pass_with_limitations` | `/courses/ai-agents-in-langgraph` 为当前课程入口；索引显示 Intermediate、1h32m、9 lessons、6 code examples、PRO 作业和中级 Python。直接抓取当日 403，未把索引当成固定发布日期证据。 |
| RLQA-06 | 欧盟市场定义版本 | `pass` | EUR-Lex 文档 `52024XC01645` 显示 C/2024/1645、2024-02-22、24 种官方语言；文档称 2024 Notice，且为 1997 Notice 的更新。2020 URL 被保留为历史评估/咨询背景。 |
| RLQA-07 | Google Cloud 入口拆分 | `pass_with_limitations` | Google Skills `/paths/16` 显示 Professional Data Engineer Certification、13 activities、Managed by Google Cloud、Sign in or join；Google Cloud 认证页另给出 USD 200 标准考试、USD 100 续期、英语/日语、无硬性先修和推荐经验。路径与认证不可共用同一费用/语言字段。 |
| RLQA-08 | DDIA 版本与许可边界 | `pass_with_limitations` | O'Reilly 第2版页显示 Kleppmann/Riccomini、February 2026、ISBN 9781098119058、672页、English、Intermediate to advanced、21h56m；O'Reilly rights 页说明内容复用需经 Copyright Clearance Center。旧 `dataintensive.net` 仅作为第1版历史页。 |
| RLQA-09 | 两候选文件交叉一致 | `pass_with_mapping` | 四个 ID、角色、资源状态和主要入口一致；候选补丁新增 `field_mapping`（包括 `license_or_use→license_or_usage`）与 `canonical_normalization`（EU CELEX/OJ、GCP path/cert split），因此证据集合差异有明确映射。 |
| RLQA-10 | 冻结目录未被 QA 意外修改 | `pass` | `professional-learning-resources-v01.json` 仍保持收到版本 SHA256；QA 未写入作者目录、教材或应用。 |
| RLQA-11 | 正式训练放行条件 | `not_met` | 元数据补丁 `integration_status=candidate_not_integrated`，`formal_training_gate=pending_independent_qa_and_catalog_integration`；四项 `theory_check=pending`，未知费用/区域/许可和动态页面仍需训练批次前复开。 |

## 四项独立判断

### `PLR-AI-006` — AI Agents in LangGraph

- **入口判断**：`https://www.deeplearning.ai/courses/ai-agents-in-langgraph` 可作为候选 canonical；`/alpha/short-courses/...` 与旧 `/short-courses/...` 只保留迁移检查用途。
- **元数据判断**：课程级别、时长、课程结构、中级 Python、beta 限时免费与 PRO 门槛均有索引/候选记录；页面未给固定版本号、发布日期、其他语言或具体再分发许可。
- **训练准入**：`not_ready`。目录合并前可作为候选学习输入；运行课程代码前须单独核当前 LangGraph 依赖、模型/工具凭据和环境，不能把课程完成当作通用 Agent 能力。

### `PLR-COMP-004` — Commission Notice C/2024/1645

- **入口判断**：EUR-Lex CELEX 查询 URL 与 OJ 查询 URL解析为同一文档；训练目录应固定一个字符串（建议保留含 CELEX 的 canonical），另列 OJ/Commission 索引作为来源。
- **元数据判断**：文号、日期、24 个语言版本和 1997 Notice 更新关系得到 EUR-Lex 官方页面支持；2020 咨询页只能作为历史评估背景。重用须保留文号和遵守 EU/EUR-Lex 政策，不能把公告当法律意见。
- **训练准入**：`not_ready`。合并后可作为竞争法语境下的理论输入；仍需课程架构补竞争法先修和案例证据，不能据此得出本项目市场结论。

### `PLR-BE-003` — Google Cloud Professional Data Engineer

- **入口判断**：`https://www.skills.google/paths/16` 是学习路径 canonical；`https://cloud.google.com/learn/certification/data-engineer` 是独立认证入口。当前候选已标记 `verified_current_split_required`。
- **元数据判断**：路径页支持 13 activities、登录/加入和相对更新时间；认证页支持考试费用、语言、有效期和推荐经验。路径总价、逐活动语言、实验室订阅/地区价格仍需按活动和账号复核。
- **训练准入**：`not_ready`。必须拆成学习路径记录和可选认证记录，不能把 USD 200 考试费或英语/日语考试语言套给全部学习活动，也不能把证书登记当作品证据。

### `PLR-BE-004` — DDIA 第2版

- **入口判断**：O'Reilly 第2版页可作为 canonical；`dataintensive.net` 只标第1版历史介绍。O'Reilly 页与作者书目月份差异应保留，不自行裁定具体出版日。
- **元数据判断**：作者、ISBN、2026 版本、语言、阅读级别、时长和访问方式得到 O'Reilly 官方页支持；价格随方案/地区变化，全文访问需订阅或购买；权利页明确内容复用应走 Copyright Clearance Center。
- **训练准入**：`not_ready`。合并后可作为后端系统设计理论输入；需把第1/2版章节和示例分开，实际 SQLite/Node 恢复和分布式行为仍须隔离实测。

## 待处理缺陷与复验

| 缺陷 ID | 严重度 | 当前状态 | 责任人 | 复验条件 |
|---|---|---|---|---|
| RLQA-01 | P1 | `closed_by_mapping`：候选补丁 `canonical_normalization` 已声明 EU CELEX canonical，OJ 查询串只作等价 `source_urls`。 | 内容检索/目录维护人 | 目录集成后检查主字段仍为 CELEX、别名未丢失。 |
| RLQA-02 | P1 | `closed_by_mapping`：候选补丁 `field_mapping` 已声明 `license_or_use→license_or_usage`，资料卡正文使用 `license_or_usage`。 | 目录维护人 | 目录集成后检查字段统一且保留未知许可边界。 |
| RLQA-03 | P1 | `pending`：补丁尚未接入 59 条冻结目录。 | 课程架构师/目录维护人 | 生成新目录版本，核四条资源的角色、链接、版本和字段，保留 v01 原文件。 |
| RLQA-04 | P2 | `pending`：LangGraph 课程页直接访问受 403，Google 路径的逐活动费用/语言和动态更新时间未完全暴露。 | 资源研究员 | 每个训练批次前重开页面；无法访问时记录原因，不用索引片段替代固定版本。 |
| RLQA-05 | P2 | `pending`：四项 `theory_check` 未执行。 | 课程架构师/内容审校员 | 完成理论核对、岗位作品规格和必要离线例后，QA 按新目录版本复验。 |

## 正式训练闸门

在以下证据完成前，四项只能出现在“候选资料/待接入”区：

1. 目录维护人将两份候选记录规范化并合并为新版本，保留 v01 和本轮差异；
2. 候选补丁已经显式统一 EU canonical 和许可字段映射；目录集成时保持该映射，并补齐 Google 学习路径/认证的分立记录；
3. 按目标学习者确认访问、语言、费用、先修和许可，未知项继续显式标记；
4. 课程架构师完成理论核对，并为每项绑定可观察作品、隔离练习和失败/边界反例；
5. 新目录版本由测试工程师复验后，才可将状态改为 `training_eligible_with_limits`。阅读、证书、课程完成或目录命中仍不等于岗位胜任、真实产品效果、真人专家审核或行业先进性。

## 输入哈希

- `sites/rolecraft/team/resource-link-reverification-v02.json`：`2db717c1e3b6762265467d7d5dd86117cf13ca4cf5dc77db7dfcb622715f0bd6`
- `sites/rolecraft/team/resource-link-reverification-v02.md`：`48c2460d61eafebea0be11cde89c83929183e83fbe74b88d69943aa1ef2576e1`
- `sites/rolecraft/team/professional-learning-resources-metadata-v02.json`：`ffa11722d446717b1f397c7c4614176ce0da0e9848b030715b35bb2176ce63c1`
- `sites/rolecraft/team/professional-learning-resources-v01.json`：`40b087a59dbf24dc6ec75fa390984a460bf1110128e5600bd60534444433d259`

