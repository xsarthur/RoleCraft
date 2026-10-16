# v12证据专项员工名册

八个岗位已按上方提示词配置，并实际分批启动独立代理完成职责与首任务接单。独立组织验收为 **met_within_configuration_scope**。它们复用既有十五岗中的八岗；提示词及岗位资料持久保存，代理按需调用，不是常驻后台或独立账号。真人专家须实际参与，不能生成AI专家身份代替。

| 编号 | 员工/完整提示词 | 唯一领域 | 本次首任务 | 接单证据 |
| --- | --- | --- | --- | --- |
| EV12-01 | [内容审校员](content-reviewer/prompt.md) | 技术内容审校 | 确认v12审校输入、专业复核包的范围与待真人验证项 | [已接单](content-reviewer/onboarding.md) |
| EV12-02 | [实训评估员](practicum-evaluator/prompt.md) | 学习者实训评价 | 定位既有量规，列作品、帮助范围、陌生任务评价所需输入 | [已接单](practicum-evaluator/onboarding.md) |
| EV12-03 | [用户研究员](user-researcher/prompt.md) | 用户研究 | 列真实用户研究前置条件、证据记录与跨岗位交接 | [已接单](user-researcher/onboarding.md) |
| EV12-04 | [AI生成工程师](generation-engineer/prompt.md) | 模型生成服务 | 确认当前生成服务交接资料、配置/预算依赖及后续验证分类 | [已接单](generation-engineer/onboarding.md) |
| EV12-05 | [后端数据工程师](backend-data-engineer/prompt.md) | 服务端数据与任务 | 确认现有后端交接、隔离验证边界与当前生产缺证 | [已接单](backend-data-engineer/onboarding.md) |
| EV12-06 | [竞品研究员](benchmark-researcher/prompt.md) | 行业对比研究 | 确认已有市场样本与公平比较前置条件，不重新编造排名 | [已接单](benchmark-researcher/onboarding.md) |
| EV12-07 | [运营分析员](operations-analyst/prompt.md) | 运营经济分析 | 确认运营数据来源、成本口径前置依赖与估算/实测分栏 | [已接单](operations-analyst/onboarding.md) |
| EV12-08 | [测试工程师](qa-engineer/prompt.md) | 质量验证 | 独立验收本次八岗配置、实际接单、领域边界和版本保护 | [已接单](qa-engineer/onboarding.md) |

[共同规则](COMMON.md) · [机器可读名册](manifest.json) · [实际派工与交接](dispatch-log.md)

[独立配置验收](qa-engineer/audit.md) · [QA数据](qa-engineer/audit.json) · [稳定产物绑定](qa-engineer/artifact-binding.json) · [收到版本台账](received-baseline.json)

八岗均为accepted_with_dependencies：配置和接单完成，真实专业任务的前置条件分别保留。QA核对809个收到的教材与team非行政命名文件保持一致，九份稳定配置、80项输入身份、128个导航目标完成核查。首版QA解析器的11条误报保留，修正本岗解析后按原数据复验，最终异常0；没有员工配置缺陷。该范围不等于整个程序、实际用户数据库或真实行为验证。

后续按领域交接：内容审校员组织真实专业复核；实训评估员核真实作品/陌生任务；用户研究员采集真实学习与求职反馈；AI生成工程师与后端数据工程师交模型/持久任务的新证据；竞品研究员做公平比较；运营分析员核实际经济性；测试工程师独立验证当前版本和原缺陷。产品经理、课程架构师等原负责人继续负责范围、门槛、量规和领域整合。

本轮只完成员工组织配置、接单和配置验收，未执行真人研究、专业评审、付费调用、生产或外部集成。未修改教材/应用/数据库/旧专业报告，不自动接入或发布新教材。完整培养及行业先进目标仍以收到的[v12产品评估](../../textbook-v12-product-assessment.md)为 **not_met**；配置不关闭任何原八门槛。后续具体任务由PM按有效授权和输入派工，缺真实参与者、实际运行或求职结果时如实留缺证。
