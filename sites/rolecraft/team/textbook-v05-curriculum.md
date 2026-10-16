# Agent 全书重生成 · 冻结课程规格

2026-10-10；课程架构师交接。`textbook-v05-spec.json` 是编写规格，不是教材正文；作者输出版本冻结为 `textbook-draft-0.5`。本轮覆盖原十二模块，保留模块 ID、目标、先修、深度、九段式及原 0—3 教学量规。职业能力与从 0 到 1 的产品创造同时培养，不降低原真实模型调用、独立复现或安全要求。

## 作者执行顺序与产物

作者按规格先确认目标—知识点—题—作品证据，再逐章编正文、完整案例、分层练习及解析，最后做跨章一致性自查。各章规划四个聚焦点，共四十八点；数量是本轮主题选择，不是后续配额。每点写机制、具体例子、误区与边界，直接情景题附结论、条件推理、参考解析和新条件迁移；每章三个综合层级任务可覆盖多个点，避免机械复制大量练习。

九项 `scope/outcomes/concepts/case/example/practice/validation/sources/reflection` 每项均写实质内容，不能只有标题、摘要或链接。案例给输入夹具、处理链、输出及失败分支；练习给输入、提交物、参考解法和反馈；正常、边界、失败的验证有对应预期与证据。不设字数或题量认证门槛，沿既定标准检查任务深度。

输出使用前端契约兼容形态：独立总包 `chapters`，章 `id/moduleId` 都是原模块 ID，章版本单列；`sections` 使用原九项与 `bodyMarkdown`。`knowledgePoints` 保留规格 ID、`objectiveIndexes`（零基）及派生 `objectiveIds`（如 f01-o1）、`sectionIds/exerciseIds`；三个综合练习 ID 为 `moduleId-scaffold/independent/transfer`，直接题 ID 为各点 `-q`。另有 `claims/examples/sources/review/limits`；已读来源范围不等于新正文已审校。

## 主项目、先修与分层

全书统一“受控售后知识助手”：虚构 A/B 租户、DEMO-42 工单、退款手册和版本；读取获授权资料、给有据建议并保存草稿。外发仅无网络替身且精确批准，不发生真实退款。模型建议、任务状态与实际业务结果分别记录，不混为完成。

零基础在 f01 先做变量/函数/列表/字典、JSON、HTTP、脚本断言和版本环境诊断，作者补实际入门脚手架，不新增模块或假设已有编程能力。后续各章按原先修核作品；基础缺证先补学，可预览而不授予进阶通过。已有基础减少提示，进阶增加未知任务、异常、比较和改进；目标及量规不变。

p01 要把假设场景与真实用户记录分开，安排用户问题发现、替代方案与行业基线、差异假设、事前比较条件、MVP 范围及反馈任务；p02 串联真实试用、独立评审、未知任务和二次复验。其余章分别交代码、资料、工具、状态、安全、评估、部署及成本证据。未取得用户/市场数据不得补造，负面结果仍可证明严谨学习，但不证明产品先进。

## 来源、参考与环境

只读检查领航 v3 全书目标/知识点索引，并抽样阅读机制、迁移与综合项目段落，借鉴逐点映射、情景题、反馈与版本边界；未做全量技术核验，不复制全文、题量配额或 demo 审核结论。领航面向已有编程基础，不能作为我们零基础先修已满足的依据。

规格来源清单记录十二份实际访问官方页及定位：Anthropic 的[模式](https://www.anthropic.com/engineering/building-effective-agents)与[评估](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)，OWASP 的[注入](https://genai.owasp.org/llmrisk/llm01-prompt-injection/)与[防御清单](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html)，OpenAI 的[提示](https://developers.openai.com/api/docs/guides/prompt-engineering)、[评价方法](https://developers.openai.com/api/docs/guides/evaluation-best-practices)、[工具链](https://developers.openai.com/api/docs/guides/function-calling)、[检索](https://developers.openai.com/api/docs/guides/retrieval)，LangGraph 概览、Python 异常与 SQLite、Microsoft 事前实验方法。只采用标注机制，不以来源为效果背书；场景、数字、审批字段及练习为原创教学设计。OpenAI Evals 页有产品弃用提示，本书仅引用方法，不要求该收费产品。

环境统一可选 Python 标准库及隔离替身，不新增必须外部付费依赖。真实模型质量与 f02 真调用目标保持待接入验证；替身只能验证执行器合同。示例区分“未执行代码”“伪代码”“推演”，正文需命令/输入/预期/排查，实际执行记录未产生则留空。官方 Python 页当前 3.15，不照搬新特性到 3.10+环境；具体版本由实际执行核对。

## 领域自查与复盘交接

自查核十二原目标/先修、九项模板和量规逐项一致，全部目标映射到知识点与证据；没有写教材正文、改网站/原课程或代学员取证。作者自查不授通过；内容审校独立核事实、解析与衔接，案例实现和运行交工程/测试岗位，真人专家与真实学习迁移单列未完成。新全书不继承 e03 原初稿审核，既有受控生成包也不被静默改写。

当前交付只完成编写规格，作者仍需产十二章实质草稿，再经问题登记、返修及复验。完整教学质量与行业先进性未达标，不以四十八点覆盖或结构自查关闭门槛。
