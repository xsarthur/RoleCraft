# 四项高时效资料复核与正式训练入口 · 项目经理记录

日期：2026-10-15（Asia/Shanghai）  
版本：`professional-learning-training-entry-pm-v01`  
责任岗位：项目经理（范围、依赖、状态、交接和复盘）

## 本轮完成

资源研究员已复核四项高时效资料并补齐候选元数据：

- LangGraph：DeepLearning.AI 当前 `/courses/ai-agents-in-langgraph`；旧 alpha 路径保留为 legacy，直接抓取 403、动态访问和许可未知项保留。
- 欧盟市场定义：EUR-Lex CELEX `52024XC01645`，2024-02-22；2020 咨询页降为历史背景，OJ 查询地址仅保留为别名。
- Google Cloud：Google Skills `/paths/16` 学习路径与 Google Cloud 认证页分开；认证费用、考试语言、有效期不混入学习路径字段。
- DDIA：O’Reilly 第2版、ISBN `9781098119058`、Martin Kleppmann/Chris Riccomini；第一版作者页保留为历史来源，版本月份差异保留。

课程架构师生成正式目录 v0.2，保留 v0.1 和 59 个稳定 ID；四项记录补齐 `source_version`、`language`、`cost_and_access`、`prerequisites`、`license_or_usage`、`maintenance_or_publication_date`、`recheck_at`、`reviewer`、`status` 等字段。

## 独立复核结论

- 目录最终 QA：结构 `met`；来源元数据 `met_with_limitations`；正式训练准入 `not_met`。
- 理论核验包 QA：规格完整性、来源绑定、评审职责均 `met`；正式训练准入仍 `not_met`。
- 理论内容审校：`reviewed_with_limitations`；逐题 `source_refs/claim_type` 仍需补齐，尤其是 LangGraph 当前 API、Google 批/流语义、欧盟零价格与后续案例、DDIA 重试与复制交互。

## 为什么尚未放行正式训练

目录和理论核验包已经准备好，但四项 `theory_check` 仍为 `pending`。尚未产生学习者的原始回答、隔离练习、岗位作品、失败/边界证据或留出迁移结果。项目规则禁止把阅读、证书、理论题包、自评或自动检查写成岗位能力，也禁止代理替学习者作答。因此当前状态是：**训练规格已建立，正式训练入口仍阻断，候选资料可以进入准备区。**

## 下一步交接

1. 内容审校员补齐四项理论题逐题 `source_refs/claim_type`，并复核版本与许可边界。
2. 由项目经理指定实际学习者/岗位执行 D0→理论核验→隔离练习；学习者保留原始回答和失败记录，不能由作者或审校员代答。
3. 测试工程师冻结夹具和环境，独立核原例、反例、失败/边界和留出迁移；任何未执行项保持 `planned` 或 `insufficient_evidence`。
4. 只有四项理论核验和第一轮作品证据完成、复验通过后，才能把相应条目从 `not_ready_pending_final_qa_and_theory_check` 改为带限制的训练可用。真实学习效果、职业能力、真人专家和行业先进性仍需另行取证。

## 证据绑定

- v0.2 JSON：`fe03b43087ac42d708e4db9bc8c5ec16aa3eec18d9e184defac29581f1295dc9`
- v0.2 Markdown：`127b7ece967838192db5c7020aca8a4b392d392a6293764df0e7f29f6dc31f41`
- v0.2 最终 QA：`af7ec17b2ee52fe0057d866bcf9f9dce20640dc8139950549c021fb32769c043`
- 理论核验 JSON：`881a3a7cc11ca48010d8c84613d4ca93752aa1cdb3da39e5c0af2436a087eac0`

本记录不修改应用、服务、数据库、用户数据或冻结教材。
