# 十五岗位专业学习资料与培养体系 · 项目经理协调记录

日期：2026-10-14（Asia/Shanghai）  
版本：`professional-learning-resources-pm-v01`  
责任岗位：项目经理（范围、依赖、状态、交接和复盘）

## 目标与范围

用户要求在培养体系中为各岗位补充专业理论资料，并以 Agent 工程师学习吴恩达 Agent 课程为示例扩展到全部岗位。本轮沿用课程架构师已有的共同基础、L0–L4 成长层级、D0 诊断、沙箱到陌生任务和 30/60/90 日复验规则，只新增资料研究、目录整合和独立检查；不修改应用、服务、数据库、冻结教材、用户记录或既有产品门槛。

## 实际调用岗位与交付

| 岗位 | 交付 | 结果 |
|---|---|---|
| 课程架构师 | `role-training-framework-v01.md`；`professional-learning-resources-v01.md/.json` | 形成“共同基础→专业理论→受控作品→陌生迁移→产品创造”路径；返修后目录 59 条、15 个 `role_id`、每岗至少 3 条 |
| 资源研究 A 批 | `resource-research-a.md` | 产品、课程、设计、软件、测试、教材、AI生成、后端 8 岗共 25 条 |
| 资源研究 B 批 | `resource-research-b.md` | AI、用户研究、竞品、实训、运营、内容审校、内容检索 7 岗共 31 条 |
| 内容审校员 | `professional-learning-resources-content-review-v01/.json`、`v02/.json` | 首检保留结构缺陷；返修复核为 `reviewed_with_limitations` |
| 测试工程师 | `professional-learning-resources-qa-v01/.json`、`v02/.json` | 首检 `not_met`；返修后目录限定配置 `met_with_limitations`，学习效果 `not_assessed` |
| 项目经理 | 本记录与复盘 | 维护范围、交接、状态、缺口、责任人与复验条件；不代写资源或独立验收 |

## 已关闭与仍开放

已关闭的是目录结构缺陷：首版仅 PM 3 条可识别、B 批 31 条为 `null`、A 批 25 条漏入；返修后 A25+B31+PM3 全部可回溯，59 个 ID 唯一，15 岗均有稳定短码，Markdown/JSON 关键字段一致。Andrew Ng 的 `Agentic AI` A/B 两条均绑定 `AI`，并保留重复来源批次；重复条目不计作两门独立课程。

仍开放的专业缺口由课程架构师/资源研究员负责返修，内容审校与 QA 再复核：LangGraph 旧 alpha 链接、欧盟 2020 咨询页、Google Cloud 认证页与学习路径错配、DDIA 版本页；OpenStax 的 LLM 摄入许可限制、Anthropic 日期化文章说明；以及 `source_version`、`language`、`cost_and_access`、`prerequisites`、`estimated_effort`、`authority_reason`、`maintenance_or_publication_date`、`theory_check`、`required_artifact`、`transfer_case`、`reviewer`、`status` 等资料卡字段。上述问题不阻断当前目录按岗位消费，但在正式训练开始前必须重新打开并登记。

## 证据状态

- 目录 Markdown SHA256：`3c1506ab5c77f0c547078d3acd522848e0553ebb2a23fadcf785c0c57bbc058d`
- 目录 JSON SHA256：`40b087a59dbf24dc6ec75fa390984a460bf1110128e5600bd60534444433d259`
- 独立 QA v0.2：`met_with_limitations`；报告 SHA256：`19eea143d9d720835367472c2c206515e31e3d6dc2f79b68bcbebed357cea67b`
- 独立 QA v0.2 JSON SHA256：`3dc90f517899ce898f931d521b524c583afadaf4da2fe953a3d6e2bba118a47a`
- 独立内容审校 v0.2：`reviewed_with_limitations`
- 目录结构通过不等于课程已执行。尚未执行理论核验、岗位作品、陌生迁移、真实学习者、真人专家、真实用户、生产成本或行业比较，因此学习效果与职业能力保持 `not_assessed`，完整培养与行业先进目标沿用既有 `not_met`。

## 下一步交接与复验

1. 课程架构师先冻结每岗主资料/互补资料、先修和理论核验；把资料卡缺失字段补齐或明确标 `insufficient_evidence`。
2. 资源研究员在开训前重开 59 条链接，记录版本、语言、费用、许可、地区和维护日期；优先修复 v0.2 列出的 P1 条目。
3. 教材研发员将资料转成岗位术语卡、反例、练习和参考分析；不得把外部课程或证书写成岗位胜任。
4. 内容审校员复核修订后的来源、论证边界和许可说明；测试工程师按新 hash 重跑目录字段、链接与状态边界检查。
5. 产品经理冻结首个隔离教学项目和 L0–L4/L0–L3 映射后，才开始 D0；实训评估员评价陌生任务，真实学习效果另行取证。

当前行政状态：**资料目录可消费但带限制；学习与能力未评估；下一轮待资料卡/链接复核后再启动训练。**
