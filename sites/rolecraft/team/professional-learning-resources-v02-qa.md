# 岗位专业学习资料目录 v0.2 · 最终独立 QA

- QA 日期：2026-10-15（Asia/Shanghai）
- QA 岗位：测试工程师（独立复验）
- QA 编号：`PLR-QA-V02-FINAL`
- 范围：v0.2 目录的结构完整性、v01 保护、四项高时效资料的链接/版本和资料卡字段，以及正式训练准入闸门。
- 四项目标：`PLR-AI-006` LangGraph、`PLR-COMP-004` 欧盟市场定义、`PLR-BE-003` Google Cloud Professional Data Engineer、`PLR-BE-004` DDIA 第二版。
- 本 QA 不执行课程、考试、云实验室、代码样例、法律适用判断或学习者能力评价，也不修改作者目录。

## 分层结论

| 层次 | 结论 | 依据与限制 |
|---|---|---|
| 结构层 | `met` | v0.2 JSON 可解析；59 条顶层记录、59 个唯一稳定 `resource_id`；15 个 `role_id`，计数为 3/4/5/8 的既有分布；Markdown 表格同样为 59 行且 ID 唯一；四项元数据字段在目标记录均非空。 |
| 来源元数据层 | `met_with_limitations` | EUR-Lex、Google Skills/Google Cloud、O'Reilly 当前入口可复核；LangGraph 当前入口直接抓取返回 403，保留第一方索引和访问限制。动态价格、地区、逐活动语言、课程许可、发布日期缺失及 DDIA 月份差异均被显式保留，不能当作稳定事实。 |
| 正式训练准入层 | `not_met`（阻断） | 四项 `theory_check` 均为 `pending`，`training_eligibility` 均为 `not_ready_pending_final_qa_and_theory_check`；尚无与资料绑定的完成作品、隔离练习、失败/边界反例和真实学习效果证据。目录通过不等于岗位能力、认证或行业先进性。 |

## 输入与保护证据

| 文件 | SHA256 | 用途 |
|---|---|---|
| `professional-learning-resources-v01.json` | `40b087a59dbf24dc6ec75fa390984a460bf1110128e5600bd60534444433d259` | 冻结基线；本次读取哈希与 v0.1 记录一致 |
| `professional-learning-resources-v02.json` | `fe03b43087ac42d708e4db9bc8c5ec16aa3eec18d9e184defac29581f1295dc9` | 待验收整合目录 |
| `professional-learning-resources-v02.md` | `127b7ece967838192db5c7020aca8a4b392d392a6293764df0e7f29f6dc31f41` | 同步人读目录 |
| `professional-learning-resources-v02-change-record.md/.json` | 记录中声明同上哈希 | 变更边界、旧链接保留和训练闸门 |

ID 顺序、集合和岗位绑定与 v01 相同。v0.2 只改变四项目标记录的元数据；v01 原文件未被本 QA 或整合写入覆盖。

## 结构与字段检查

| 检查 ID | 检查 | 结论 | 证据 |
|---|---|---|---|
| `PLRQA-V02-01` | 顶层记录数 | `pass` | JSON 为 59 条；无嵌套认证记录计入顶层。 |
| `PLRQA-V02-02` | 稳定 ID | `pass` | JSON 为 59 个唯一 ID；与 v01 集合和顺序相同。 |
| `PLRQA-V02-03` | 15 岗位计数 | `pass` | PM/PROD/CURR/DES/FE/QA/ED 各 3；AI 8；BE/UR/COMP/PRACT/REV 各 4；OPS/RETR 各 5；合计 59。 |
| `PLRQA-V02-04` | Markdown 同步 | `pass` | Markdown 主表解析到 59 行、59 个唯一 ID；岗位计数与 JSON 一致；四项详细卡的 canonical、版本和元数据值可在 Markdown 找到。 |
| `PLRQA-V02-05` | 四项字段合同 | `pass` | 四项均有 `source_version`、`language`、`cost_and_access`、`prerequisites`、`license_or_usage`、`maintenance_or_publication_date`、`recheck_at`、`reviewer`、`status`；另有 `known_limits`、`theory_check`、`training_eligibility`。 |
| `PLRQA-V02-06` | 理论状态 | `pass`（闸门仍阻断） | 四项 `theory_check` 均精确为 `pending`，未被目录元数据伪装为已掌握。 |

## 四项来源与链接复验

### `PLR-AI-006` · LangGraph

- canonical：`https://www.deeplearning.ai/courses/ai-agents-in-langgraph`。
- legacy：`/alpha/short-courses/...` 和旧 `/short-courses/...` 均保留在 `legacy_urls`，没有与 canonical 混用。
- 资料卡记录 Intermediate、1h32m、9 lessons、6 code examples、中级 Python、beta 限时访问和 PRO 作业；没有虚构课程发行号或发布日期。
- 本轮直接抓取返回 HTTP 403，因此 `status=verified_current_with_fetch_limitations` 合理；语言、未来价格、区域访问、课程/代码再分发许可继续标为证据不足或需另核。
- 训练限制：课程是框架特定输入；运行代码前仍须独立核当前 LangGraph API、模型/工具凭据和隔离环境。

### `PLR-COMP-004` · 欧盟市场定义

- canonical 统一为 `https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:52024XC01645`，即 CELEX `52024XC01645`。
- OJ 查询地址只在 `canonical_aliases`/`source_urls`，2020 咨询页只在 `legacy_urls`；没有把 OJ 字符串当第二个 canonical。
- 当前 EUR-Lex 页面显示文书标题、`C/2024/1645`、2024-02-22 和 24 个官方语言版本，支持资料卡版本和语言字段。
- 许可字段使用正式名称 `license_or_usage`，并保留归属、变更标示、第三方作品/标志例外；这不是项目市场结论或法律意见。

### `PLR-BE-003` · Google Cloud

- canonical：`https://www.skills.google/paths/16`；Google Skills 页面显示 Professional Data Engineer Certification、Managed by Google Cloud、13 activities、相对更新时间和登录入口。
- 认证页 `https://cloud.google.com/learn/certification/data-engineer` 只放在 `related_certification`/`related_certification_url` 和 `legacy_urls`，未成为学习路径 canonical。
- 路径字段只描述课程/实验/徽章的访问，未把 USD 200/100 考试费、考试语言或认证有效期复制到路径字段；这些只在嵌套认证记录中。
- 认证页当前可见标准考试 2 小时、USD 200、English/Japanese、2 年有效期、无硬性先修和推荐经验；路径总费用、逐活动语言和实验室地区价格仍是 `insufficient_evidence`。
- `status=verified_current_split_required` 正确表达了“来源可用但正式训练需保持路径/认证分离”。若未来目录合同要求每条记录一个证书，需再生成独立顶层认证记录并重新 QA。

### `PLR-BE-004` · DDIA 第二版

- canonical：`https://www.oreilly.com/library/view/designing-data-intensive-applications/9781098119058/`；旧 `dataintensive.net` 只在 `legacy_urls`/来源中作为第一版历史背景。
- O'Reilly 当前页显示第二版、Martin Kleppmann 与 Chris Riccomini、February 2026、ISBN `9781098119058`、672 页、Intermediate to advanced、21h56m 和 English。
- 价格/访问记录为会员或购买、区域/机构价格未稳定公开；许可字段按版权内容和 Copyright Clearance Center 复用边界表达，未当作开放教材。
- 作者书目与出版方月份存在 February/March 2026 差异，资料卡保留差异并以 ISBN 标识版本，没有擅自裁定具体日期。

## 缺陷、阻断与复验条件

| 缺陷/状态 | 严重度 | 当前结论 | 责任人与复验条件 |
|---|---|---|---|
| `PLRQA-V02-GATE` | P1 | `pending`：四项理论核验、作品规格、隔离练习和失败/边界反例尚未完成。 | 课程架构师/内容审校员交付理论映射与作品；测试工程师按新目录版本重验后，才可改为 `training_eligible_with_limits`。 |
| `PLRQA-V02-LANGGRAPH` | P2 | `open_with_limitations`：直接页面 403，课程发行号/日期/其他语言/再分发许可未证实。 | 资源研究员在每期训练前重开第一方页面；受阻时保留访问证据，不用索引片段补写版本。 |
| `PLRQA-V02-GCLOUD` | P2 | `open_with_limitations`：路径总价、逐活动语言、实验室订阅/地区价格和更新时间不完整。 | 目录维护人在具体学习活动和学习者地区确认后更新；认证字段继续独立。 |
| `PLRQA-V02-DDIA` | P2 | `open_with_limitations`：区域/机构价格和具体代码许可未独立确定，出版月份有差异。 | 训练采购前按学习者地区和使用方式重查；不复制受版权保护的章节、图表或大段示例。 |
| `PLRQA-V02-REVIEWER` | P2 | `open_with_limitations`：四条资料卡的 `reviewer` 文本仍写有“测试工程师待独立复验”，属于生成时快照。 | 本报告是本轮独立 QA 证据；下一目录版本由维护人更新审阅状态并重新计算哈希。 |

## 最终判定

本 v0.2 目录的**结构层通过**，四项链接/版本和资料卡元数据达到**带限制的来源复核**，但**正式训练闸门阻断**。允许把四项放入“候选资料/待训练”区，不能标为正式必修、已掌握或岗位认证。清除阻断需要：

1. 保留 v01，按本 v0.2 映射生成目录正式版本；
2. 对四项完成理论核验并绑定可观察作品、隔离练习和失败/边界反例；
3. 在实际学习者地区确认费用、语言、先修和许可，未知项继续显式保留；
4. 由测试工程师复验新版本，且不把目录阅读、证书登记或自评当作能力证据。

## 外部来源复验入口

- [DeepLearning.AI AI Agents in LangGraph](https://www.deeplearning.ai/courses/ai-agents-in-langgraph)（本轮直接抓取 403）
- [EUR-Lex CELEX 52024XC01645](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:52024XC01645)
- [Google Skills Professional Data Engineer path](https://www.skills.google/paths/16)
- [Google Cloud Professional Data Engineer certification](https://cloud.google.com/learn/certification/data-engineer)
- [O'Reilly DDIA 2nd Edition](https://www.oreilly.com/library/view/designing-data-intensive-applications/9781098119058/)
