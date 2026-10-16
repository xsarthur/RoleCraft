# Agent 全部面试参考答案：独立内容审校

日期：2026-10-14（Asia/Shanghai）；标准：AQS-01–08；审校范围：当前124个答案工件。

**全量检查已完成，但答案没有全部达标：13题在当前静态教学内容范围内通过，111题存在明确待补缺口。** 这不是整体产品或代码运行验收，完整职业培养/行业先进目标仍为 `not_met`。

## 范围与方法

检查100道固定题、14道市场题和10道原型题，按原题ID分别记录。同主题不合并，历史副本不加分母；未读取QA保留变体。114题当前是327条教材摘录，原型10题是三条预写提纲。判断依据是实际文字对题面的覆盖和推理深度，不因形式或字数统一判失败。

实际答案渲染位于 `dist/learning-experience-v13.js:65`；该文件第81行当前将题库相关入口置为后续开放，本次不重开入口。原型答案在 `dist/interview-prep-v1-prototype.html:44–53`，渲染第103行。

所有327条摘录均核对当前教材哈希与指定原文行范围一致；这只证明没有错绑，不能证明摘录足够回答问题。本文不继承历史98/2/0或旧“充分”标签。Q75偏差类别另核一手[原论文摘要](https://arxiv.org/abs/2306.05685)，没有外推其基准分数。

## 汇总

| 集合 | 工件数 | 内容范围通过 | 不达标 |
| --- | ---: | ---: | ---: |
| 固定Q1–Q100 | 100 | 11 | 89 |
| 市场M101–M114 | 14 | 2 | 12 |
| 原型P01–P10 | 10 | 0 | 10 |
| 合计 | 124 | 13 | 111 |

当前可保留的通过题：Q33、Q37、Q55、Q61、Q67、Q72、Q75、Q78、Q81、Q82、Q89、M111、M114。通过仅指当前静态教学语义的限定结论，须与QA独立结论合并；不能由13题推导全库通过。

主要缺陷包括只显示冒号前导语、核心子问未回答、缺完整案例/分支、把“应测试”当作测试方法，以及原型无逐题来源。接下来作者按逐项缺陷补齐，审校与QA保留初判再复验。

## 逐题记录

P表示本轮对旧小写q的独立命名空间；AQS编号依次为直接回答、机制、路径、案例、取舍、验证、来源、可读。以下“通过”只指该项静态审读，没有运行保证。

### Q1　如何界定 LLM Agent？你会用哪些可观察行为区分它与普通聊天应用？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:6284`。
- 已具备：已给行为定义，区分模型提议与宿主控制、固定流程与动态决策。
- AQS：AQS-01 pass；AQS-02 pass；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 pass。
- 原文证据：Q1-E1 `textbooks/v12/00-learning-route.md:3`；Q1-E2 `textbooks/v12/c01-selection.md:9`。
- CR-Q1-03：没有将可观察行为组织成读者可执行的辨别步骤责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q1-04：缺同一任务分别由聊天应用和Agent处理的完整对照轨迹责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q1-06：缺会反驳“有工具就是Agent”等误解的具体反例判定。责任：教材研发员；状态：open，待返修及原例复验。

### Q2　单次模型调用、固定 Workflow 和动态 Agent，分别适合什么业务条件？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:6378`。
- 已具备：区分单次生成、代码定义路径与模型动态选路。
- AQS：AQS-01 not_met；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 not_met；AQS-06 not_met；AQS-07 pass；AQS-08 pass。
- 原文证据：Q2-E1 `textbooks/v12/c01-selection.md:9`。
- CR-Q2-01：只解释三种架构定义，未直接回答分别适合什么业务条件责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q2-02：未展开输入完整性、路径可枚举性及动态调查收益之间的关系责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q2-03：没有从需求到方案的选择路径责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q2-04：缺三类业务各自对应的可走通案例责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q2-05：没有成本、风险、可控性与升级条件的取舍责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q2-06：缺验证选型收益的对照方法。责任：教材研发员；状态：open，待返修及原例复验。

### Q3　用户说“帮我做一个 Agent”时，你先澄清哪些需求，才能决定实现方案？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:6444`。
- 已具备：从真实任务、用户痛点与同条件比较切入，避免先决定用Agent。
- AQS：AQS-01 pass；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 not_met；AQS-06 not_met；AQS-07 pass；AQS-08 pass。
- 原文证据：Q3-E1 `textbooks/v12/p01-discovery.md:9`；Q3-E2 `textbooks/v12/02-task-acceptance.md:10`；Q3-E3 `textbooks/v12/c01-selection.md:24`。
- CR-Q3-02：澄清项遗漏资料可得性、权限/副作用、失败代价及资源时限如何影响选型责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q3-03：task字段只是单行示例，缺澄清结果到验收合同及方案选择的步骤责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q3-04：三个摘录未形成从含糊需求到具体方案的连续案例责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q3-05：缺需求无法满足时缩范围或不用模型的决定责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q3-06：未给检查澄清是否足够的反例。责任：教材研发员；状态：open，待返修及原例复验。

### Q4　工具调用、状态维护、规划和长期记忆，哪些取决于具体场景，并非每个 Agent 都需要？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:6566`。
- 已具备：正确区分会话、任务状态、上下文与长期记忆。
- AQS：AQS-01 not_met；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 not_met；AQS-06 not_met；AQS-07 pass；AQS-08 pass。
- 原文证据：Q4-E1 `textbooks/v12/n02-context-memory-prompt.md:9`。
- CR-Q4-01：没有回答工具、规划和记忆哪些是按场景选用责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q4-02：仅存储概念无法解释四种组件的必要性条件责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q4-03：缺按任务选择组件的判断流程责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q4-04：缺无须长期记忆或显式规划的例子及对照责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q4-05：未说明增加组件的成本与风险责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q4-06：缺检验组件是否必要的反例。责任：教材研发员；状态：open，待返修及原例复验。

### Q5　怎样判断增加自主决策带来的收益，足以抵消不确定性与运行成本？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:6632`。
- 已具备：有冻结任务/权限/模型、完整用量账目和公平实验要求。
- AQS：AQS-01 not_met；AQS-02 pass；AQS-03 not_met；AQS-04 not_met；AQS-05 not_met；AQS-06 pass；AQS-07 pass；AQS-08 pass。
- 原文证据：Q5-E1 `textbooks/v12/c01-selection.md:45`；Q5-E2 `textbooks/v12/p01-mvp.md:9`；Q5-E3 `textbooks/v12/e05.md:10`。
- CR-Q5-01：未明确怎样用收益与代价作采用或拒绝自主决策的结论责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q5-03：缺从实验记录到风险底线与净收益判断的计算/决策过程责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q5-04：没有一组教学比较结果展示何时接受、何时放弃责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q5-05：未落实收益不足或严重错误增多时的权衡规则。责任：教材研发员；状态：open，待返修及原例复验。

### Q6　如果需求可以用 SQL、规则或传统搜索解决，你如何解释自己的技术选择？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:6754`。
- 已具备：有稳定字段用普通程序的场景、动态性定义与ADR记录意识。
- AQS：AQS-01 pass；AQS-02 not_met；AQS-03 not_met；AQS-04 pass；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 pass。
- 原文证据：Q6-E1 `textbooks/v12/c01-selection.md:18`；Q6-E2 `textbooks/v12/c01-selection.md:53`；Q6-E3 `textbooks/v12/p01-mvp.md:51`。
- CR-Q6-02：未展开SQL、规则和传统搜索各自适合的数据与任务条件责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q6-03：缺先实现低复杂度基线、定位其不足再升级的操作路径责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q6-06：未给能否定模型增益的同任务测试与预期结果。责任：教材研发员；状态：open，待返修及原例复验。

### Q7　单 Agent 多工具与多 Agent 协作，在架构上有什么区别？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:6876`。
- 已具备：已有运行时/执行器/验收器责任分离与两项独立调查的说明。
- AQS：AQS-01 not_met；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 not_met；AQS-06 not_met；AQS-07 pass；AQS-08 not_met。
- 原文证据：Q7-E1 `textbooks/v12/c01-control-loop.md:26`；Q7-E2 `textbooks/v12/c01-control-loop.md:48`；Q7-E3 `textbooks/v12/c01-selection.md:35`。
- CR-Q7-01：未直接画清单Agent多工具与多Agent之间谁决定、谁持状态、如何通信责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q7-02：缺多Agent任务身份、各自上下文/状态与协调成本责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q7-03：未给输入输出和汇总合同责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q7-04：没有同一任务两种架构的完整运行对照责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q7-05：缺何时保持单Agent、何时分工的选择边界责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q7-06：缺验证协作是否有效及冲突如何处理的场景责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q7-08：首段以“工具注册表…：”终止，真正契约没有显示。责任：教材研发员；状态：open，待返修及原例复验。

### Q8　你会如何评估自研 Agent 运行时、开源框架和低代码平台？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:6998`。
- 已具备：给出自研显式状态机和持久任务表的局部方案。
- AQS：AQS-01 not_met；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 not_met；AQS-06 not_met；AQS-07 pass；AQS-08 pass。
- 原文证据：Q8-E1 `textbooks/v12/n06-graph-orchestration.md:82`。
- CR-Q8-01：没有完成自研、开源框架和低代码三类评估责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q8-02：缺扩展性、可观测/恢复语义、锁定成本与治理能力的共同维度责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q8-03：无同任务试做和核验流程责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q8-04：缺至少一组比较场景及结果解释责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q8-05：未给不同团队条件下的取舍责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q8-06：缺故障注入和退出/迁移验证。责任：教材研发员；状态：open，待返修及原例复验。

### Q9　从演示原型到可交付的 Agent 服务，需要补齐哪些工程能力？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:7064`。
- 已具备：涉及工程生命周期、角色交接、发布状态和版本化证据链。
- AQS：AQS-01 pass；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 pass。
- 原文证据：Q9-E1 `textbooks/v12/00-learning-route.md:46`；Q9-E2 `textbooks/v12/p01-mvp.md:63`；Q9-E3 `textbooks/v12/e04.md:138`；Q9-E4 `textbooks/v12/p02.md:10`。
- CR-Q9-02：没有把鉴权、持久恢复、故障边界、评测和运维作为可交付能力逐项解释责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q9-03：缺从演示到受限试点的实施优先级与放行条件责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q9-04：缺一个演示能跑但生产失败的完整反例责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q9-06：缺将能力清单转成可观察验收的实例。责任：教材研发员；状态：open，待返修及原例复验。

### Q10　请用一个真实项目说明：Agent 改善了谁的什么工作，你如何证明改善成立？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:7214`。
- 已具备：正确保留真实用户、本人贡献与比较证据边界，不编造个人经历。
- AQS：AQS-01 pass；AQS-02 pass；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 pass；AQS-07 pass；AQS-08 pass。
- 原文证据：Q10-E1 `textbooks/v12/p01-discovery.md:23`；Q10-E2 `textbooks/v12/p01-mvp.md:9`；Q10-E3 `textbooks/v12/p01-mvp.md:69`；Q10-E4 `textbooks/v12/n10-evaluation-projects.md:54`。
- CR-Q10-03：材料是分散的研究原则，缺一套如何从本人原始记录组织面试陈述与证据的路径责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q10-04：缺明确标注虚构的完整表达示例或可填写骨架，难以看出问题、本人动作、比较结果、局限如何连贯呈现。责任：教材研发员；状态：open，待返修及原例复验。
- 本人真实项目/事故证据仍由学习者提供；上述内容缺口不是要求作者虚构个人经历。

### Q11　ReAct 如何组织推理、行动与观察？它与一次性生成计划有什么不同？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:7364`。
- 已具备：当前段落仅解释固定状态机及其适用条件。
- AQS：AQS-01 not_met；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 not_met；AQS-06 not_met；AQS-07 pass；AQS-08 pass。
- 原文证据：Q11-E1 `textbooks/v12/n03-planning-reflection.md:11`。
- CR-Q11-01：没有解释ReAct的推理、行动、观察循环，也未比较一次性计划责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q11-02：缺观察如何改变下一步与运行时执行边界责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q11-03：缺最小循环及停止/失败路径责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q11-04：缺同一任务在新观察后改动作的轨迹责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q11-05：缺反馈收益、额外调用和失控风险的取舍责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q11-06：缺区分静态计划与反馈循环的反例。责任：教材研发员；状态：open，待返修及原例复验。

### Q12　ReAct、Plan-and-Execute 和固定状态机，你会如何按任务特征选择？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:7430`。
- 已具备：当前段落能说明固定状态机的路径稳定条件。
- AQS：AQS-01 not_met；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 not_met；AQS-06 not_met；AQS-07 pass；AQS-08 pass。
- 原文证据：Q12-E1 `textbooks/v12/n03-planning-reflection.md:11`。
- CR-Q12-01：没有回答ReAct和Plan-and-Execute的选择条件责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q12-02：缺三者计划粒度、反馈频率和执行控制的机制区别责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q12-03：无选择步骤责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q12-04：无三方案在同一业务约束下的对照责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q12-05：没有重规划、成本和可靠性权衡责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q12-06：缺同条件验证选择的场景。责任：教材研发员；状态：open，待返修及原例复验。

### Q13　不依赖现成框架，手写一个最小 Agent 控制循环，需要哪些状态和分支？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:7496`。
- 已具备：区分模型最终回答、运行时终态和业务成功，并说明伪代码限制。
- AQS：AQS-01 not_met；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 not_met。
- 原文证据：Q13-E1 `textbooks/v12/c01-control-loop.md:38`；Q13-E2 `textbooks/v12/c01-control-loop.md:299`；Q13-E3 `textbooks/v12/c01-control-loop.md:788`。
- CR-Q13-01：没有实际列出最小循环的主要状态和分支责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q13-02：状态迁移、工具反馈、异常/等待/停止机制缺失责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q13-03：介绍伪代码但显示区域没有伪代码责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q13-04：没有从开始到工具返回再结束的执行轨迹责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q13-06：无可检查各分支的输入与预期责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q13-08：“一轮决策可以写成：”后所需内容未被摘入。责任：教材研发员；状态：open，待返修及原例复验。

### Q14　如何区分“模型宣布完成”和“任务实际上完成”？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:7618`。
- 已具备：明确三种“完成”不是同一事实。
- AQS：AQS-01 pass；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 not_met。
- 原文证据：Q14-E1 `textbooks/v12/c01-control-loop.md:17`；Q14-E2 `textbooks/v12/c01-control-loop.md:733`；Q14-E3 `textbooks/v12/c01-control-loop.md:788`。
- CR-Q14-02：验收条件和回执如何结合并未展开责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q14-03：缺最终候选→校验→权威提交→用户反馈的步骤责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q14-04：声称已创建工单的反例只有开头，没有后续拒绝/等待决定及结果责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q14-06：缺模型声称成功但回执未知、以及真成功的判定对照责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q14-08：两段分别停在“同时满足：”与“不会…停止：”，关键列表缺失。责任：教材研发员；状态：open，待返修及原例复验。

### Q15　怎样设置最大步数、时间和费用限制，同时避免过早中止任务？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:7740`。
- 已具备：提到同一运行共享预算以及模型回答不等于业务成功。
- AQS：AQS-01 not_met；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 not_met；AQS-06 not_met；AQS-07 pass；AQS-08 not_met。
- 原文证据：Q15-E1 `textbooks/v12/c01-control-loop.md:278`；Q15-E2 `textbooks/v12/c01-control-loop.md:788`。
- CR-Q15-01：没有给步数、时间和费用限制怎样设置责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q15-02：缺预算预留、物理尝试/重试累计、恢复额度与截止时间关系责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q15-03：无扣计、续跑、耗尽与停止的操作流程责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q15-04：无预算耗尽但仍有未决副作用的处理轨迹责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q15-05：未解释软停止、恢复预留与过早中止的取舍责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q15-06：缺边界与超时测试责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q15-08：“预算至少拆成：”之后清单被省略。责任：教材研发员；状态：open，待返修及原例复验。

### Q16　面对带前置依赖的复杂任务，如何生成和验证可执行计划？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:7834`。
- 已具备：将目标拆为可核验产物，并要求模型/模板计划经过同一验证器。
- AQS：AQS-01 pass；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 not_met；AQS-06 not_met；AQS-07 pass；AQS-08 pass。
- 原文证据：Q16-E1 `textbooks/v12/n03-planning-reflection.md:28`。
- CR-Q16-02：未解释依赖边、状态前提和计划可行性责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q16-03：无环路检测、缺生产者检查、拓扑就绪及更新步骤责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q16-04：缺带具体依赖的计划及一项失败分支责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q16-05：缺计划粒度和变化时重算范围的取舍责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q16-06：没有无环但不可执行等反例与预期拒绝。责任：教材研发员；状态：open，待返修及原例复验。

### Q17　什么信号应触发 Replanning？如何避免反复改计划却没有实际进展？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:7900`。
- 已具备：列举新证据、目标、权限、预算和验收信号，区分限流重试。
- AQS：AQS-01 pass；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 not_met；AQS-06 not_met；AQS-07 pass；AQS-08 pass。
- 原文证据：Q17-E1 `textbooks/v12/n03-planning-reflection.md:64`。
- CR-Q17-02：没有解释已完成产物复用、失效传播及新计划如何承接旧状态责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q17-03：缺防止反复重规划的进展计量、上限和停止路径责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q17-04：没有一次触发→改计划→复验或停止的完整例子责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q17-05：未阐明局部修正与全部重建计划的选择责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q17-06：无“计划文字变多但没有进展”的检测反例。责任：教材研发员；状态：open，待返修及原例复验。

### Q18　Reflection 或自我纠错在哪些情况下有帮助，又可能怎样放大原始错误？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:7966`。
- 已具备：给出摘要丢失比较符的具体失败与基于证据的小步修正。
- AQS：AQS-01 pass；AQS-02 not_met；AQS-03 not_met；AQS-04 pass；AQS-05 not_met；AQS-06 not_met；AQS-07 pass；AQS-08 pass。
- 原文证据：Q18-E1 `textbooks/v12/n03-planning-reflection.md:93`。
- CR-Q18-02：没有解释自我强化、共享错误证据与未经外部验证的反思为何会放大错误责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q18-03：缺何时触发、如何保留原结果及独立验证后才接纳的流程责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q18-05：未给反思成本、可修问题与缺证问题的适用边界责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q18-06：仅提出重跑边界，未给对错误自信反思的对照判据。责任：教材研发员；状态：open，待返修及原例复验。

### Q19　工具结果与原计划冲突时，运行时应该如何更新状态和后续决策？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:8032`。
- 已具备：已有批次预检、动作尝试归约和重规划触发说明。
- AQS：AQS-01 pass；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 not_met。
- 原文证据：Q19-E1 `textbooks/v12/c01-control-loop.md:237`；Q19-E2 `textbooks/v12/c01-control-loop.md:359`；Q19-E3 `textbooks/v12/c01-control-loop.md:733`；Q19-E4 `textbooks/v12/n03-planning-reflection.md:64`。
- CR-Q19-02：缺冲突观察如何推翻旧假设、使依赖失效并生成新执行前沿责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q19-03：动作效果归约段被截断，无法走通所有尝试的状态决定责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q19-04：模型声称完成的反例未显示处理结尾责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q19-06：缺计划证据冲突时保留副作用事实而废弃推断的验证场景责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q19-08：E2句中结束于“确”，E3以冒号结束。责任：教材研发员；状态：open，待返修及原例复验。

### Q20　如何识别和处理重复动作、无效搜索以及循环卡死？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:8182`。
- 已具备：区分逻辑意图与参数相同，说明进展与总预算不能靠重规划重置。
- AQS：AQS-01 pass；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 not_met。
- 原文证据：Q20-E1 `textbooks/v12/c01-control-loop.md:175`；Q20-E2 `textbooks/v12/00-learning-route.md:42`；Q20-E3 `textbooks/v12/c01-control-loop.md:733`；Q20-E4 `textbooks/v12/c01-control-loop.md:278`；Q20-E5 `textbooks/v12/n03-planning-reflection.md:85`。
- CR-Q20-02：缺动作重复、搜索无收益及状态循环三类检测的不同依据责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q20-03：无记录签名/状态、判断重复后复用或停止的明确步骤责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q20-04：缺一次循环卡死的完整轨迹责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q20-06：没有“用户确实要两次相同动作”及误杀合法探索的反例责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q20-08：关键动作身份链接、预算列表和完成案例存在截断。责任：教材研发员；状态：open，待返修及原例复验。

### Q21　Function Calling 从模型输出到函数真正执行，中间经过哪些步骤？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:8360`。
- 已具备：有模型提议、完整响应后执行、协议与逻辑身份分离。
- AQS：AQS-01 pass；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 not_met。
- 原文证据：Q21-E1 `textbooks/v12/c03.md:10`；Q21-E2 `textbooks/v12/c01-control-loop.md:221`；Q21-E3 `textbooks/v12/c01-control-loop.md:183`。
- CR-Q21-02：未完整解释工具Schema/业务/权限校验和执行结果如何回到模型责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q21-03：缺带tool_call_id的往返接口与执行失败分支责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q21-04：无一轮完整请求、验证、调用、结果回传轨迹责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q21-06：缺半截流式参数、未知工具和多调用关联错位测试责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q21-08：官方链接被截断，关键调用流程并未展开。责任：教材研发员；状态：open，待返修及原例复验。

### Q22　如何设计工具名称、描述和参数 Schema，减少错选工具与错误参数？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:8483`。
- 已具备：例举process_data拆为搜索、读取、创建以明确动作对象。
- AQS：AQS-01 not_met；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 pass。
- 原文证据：Q22-E1 `textbooks/v12/n04-tools-mcp.md:9`。
- CR-Q22-01：只回答工具命名的一部分，Schema设计未回答责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q22-02：缺描述中的触发/排除条件、字段类型/枚举/必填与业务约束关系责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q22-03：无一份完整工具定义与校验步骤责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q22-04：缺错选和错参如何被修正的案例责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q22-06：无歧义名称、缺字段、额外字段等测试及预期。责任：教材研发员；状态：open，待返修及原例复验。

### Q23　工具参数的 JSON 格式正确，为什么不等于调用安全、业务合法？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:8550`。
- 已具备：说明模型工具提议、事实/假设区分及读前对象授权。
- AQS：AQS-01 pass；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 not_met。
- 原文证据：Q23-E1 `textbooks/v12/c03.md:10`；Q23-E2 `textbooks/v12/f02.md:20`；Q23-E3 `textbooks/v12/e03.md:36`。
- CR-Q23-02：未建立语法、Schema、业务不变量、授权和副作用控制的完整检查链责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q23-03：缺执行前逐层判断和拒绝返回的步骤责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q23-04：没有合法JSON但越权或业务无效的完整示例输入与处理责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q23-06：缺通过语法却必须被拒绝的反例集合责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q23-08：模型协议来源URL在句中被截断。责任：教材研发员；状态：open，待返修及原例复验。

### Q24　工具数量达到数百个时，怎样降低选择错误和上下文负担？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:8673`。
- 已具备：提出可信身份过滤、目录元数据和检索小候选集。
- AQS：AQS-01 pass；AQS-02 pass；AQS-03 not_met；AQS-04 not_met；AQS-05 not_met；AQS-06 not_met；AQS-07 pass；AQS-08 pass。
- 原文证据：Q24-E1 `textbooks/v12/n04-tools-mcp.md:23`。
- CR-Q24-03：缺候选未命中、歧义、Schema过期和最终执行复核的路径责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q24-04：无数百工具下从需求到实际工具选择的示范责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q24-05：缺候选集过小漏召回与过大增加干扰的取舍责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q24-06：无错选率、漏召回和token/延迟的对照验证。责任：教材研发员；状态：open，待返修及原例复验。

### Q25　工具超时、限流、参数错误和业务拒绝，应采用同一种重试策略吗？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:8740`。
- 已具备：有参数严格验证、事实错误反馈、超时核对及单层重试原则。
- AQS：AQS-01 not_met；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 not_met。
- 原文证据：Q25-E1 `textbooks/v12/f01.md:10`；Q25-E2 `textbooks/v12/f02.md:190`；Q25-E3 `textbooks/v12/c01-control-loop.md:243`；Q25-E4 `textbooks/v12/c01-control-loop.md:698`。
- CR-Q25-01：没有清楚按四种错误分别给重试决定责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q25-02：缺限流等待与业务拒绝不能机械重试的条件责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q25-03：无错误分类→查效果/等待/纠参/停止的完整决策表责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q25-04：缺相同任务的四类故障轨迹责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q25-06：无验证预算不重置、写超时不增效果等断言责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q25-08：退避来源URL截断。责任：教材研发员；状态：open，待返修及原例复验。

### Q26　对可能产生外部副作用的工具，如何防止重试导致重复执行？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:8891`。
- 已具备：区分tool_call_id、action_id与attempt_id，强调先核对已发生效果。
- AQS：AQS-01 pass；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 not_met；AQS-06 not_met；AQS-07 pass；AQS-08 not_met。
- 原文证据：Q26-E1 `textbooks/v12/c03.md:18`；Q26-E2 `textbooks/v12/c01-control-loop.md:243`；Q26-E3 `textbooks/v12/c01-control-loop.md:749`。
- CR-Q26-02：缺下游原子去重、同键同参、有效期及并发契约责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q26-03：动作槽位定义和回执丢失后的恢复分支未显示责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q26-04：故障案例只剩“改变后续时序”引子，没有事件与结果责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q26-05：下游不支持核对/幂等时的停止及取舍未说明责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q26-06：无重复副作用观测与并发/崩溃测试责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q26-08：两段在冒号处终止。责任：教材研发员；状态：open，待返修及原例复验。

### Q27　MCP 解决哪一层集成问题？它与模型的 Tool Calling 有什么关系？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:9014`。
- 已具备：正确画出host/client/server及模型提议经宿主执行的路径。
- AQS：AQS-01 pass；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 not_met；AQS-06 not_met；AQS-07 pass；AQS-08 pass。
- 原文证据：Q27-E1 `textbooks/v12/n04-tools-mcp.md:44`。
- CR-Q27-02：MCP的标准化工具/资源发现与消息/传输边界未展开责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q27-03：没有从发现能力到模型调用及返回关联的完整交互责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q27-04：缺具体工具与一项协议/业务失败的示例责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q27-05：没有协议不自动承担权限/业务幂等的边界说明责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q27-06：缺区分MCP连接成功和工具业务成功的反例。责任：教材研发员；状态：open，待返修及原例复验。

### Q28　MCP 中的 Tools、Resources 和 Prompts，各自适合表达什么能力？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:9081`。
- 已具备：能直接区分Tools、Resources、Prompts及控制取向不等于权限。
- AQS：AQS-01 pass；AQS-02 pass；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 pass。
- 原文证据：Q28-E1 `textbooks/v12/n04-tools-mcp.md:60`。
- CR-Q28-03：未展示三种能力的最小声明/请求或选择步骤责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q28-04：没有同一应用把操作、资料与模板分别暴露的案例责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q28-06：缺模板中指令、敏感资源与工具调用的边界核验反例。责任：教材研发员；状态：open，待返修及原例复验。

### Q29　接入第三方工具服务时，如何处理认证、权限、版本与错误契约？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:9148`。
- 已具备：区分协议错误、业务错误、版本不支持和内容合同拒绝。
- AQS：AQS-01 not_met；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 pass。
- 原文证据：Q29-E1 `textbooks/v12/n04-tools-mcp.md:99`；Q29-E2 `textbooks/v12/n04-tools-mcp.md:54`。
- CR-Q29-01：认证和权限两个核心子问没有回答责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q29-02：缺凭据来源、作用域、令牌受众及端点可信性责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q29-03：没有连接→协商→授权→调用→错误处理流程责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q29-04：缺第三方集成正常与认证失效的完整案例责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q29-06：无越权、版本变更与敏感错误泄露测试。责任：教材研发员；状态：open，待返修及原例复验。

### Q30　Tool Calling、MCP、Agent Skills（可复用技能说明与资源包）和 A2A，分别解决什么问题？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:9243`。
- 已具备：仅说明Skills目录/渐进读取以及指向A2A的链接。
- AQS：AQS-01 not_met；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 not_met；AQS-06 not_met；AQS-07 pass；AQS-08 not_met。
- 原文证据：Q30-E1 `textbooks/v12/n04-tools-mcp.md:124`。
- CR-Q30-01：Tool Calling和MCP职责未回答，四者不能形成对照责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q30-02：缺模型提议、工具协议、技能资料与远端Agent任务各自边界责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q30-03：无组合接入的流程责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q30-04：缺同一任务如何按需组合四者的例子责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q30-05：未说明何时无需新增协议层责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q30-06：无“技能即权限”“A2A即工具幂等”等反例责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q30-08：A2A协议URL与句子被截断。责任：教材研发员；状态：open，待返修及原例复验。

### Q31　会话历史、任务工作状态和长期记忆有什么不同？应分别存储什么？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:9310`。
- 已具备：概念性地区分会话历史、权威任务状态、上下文及长期记忆的用途。
- AQS：AQS-01 pass；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 pass。
- 原文证据：Q31-E1 `textbooks/v12/n02-context-memory-prompt.md:9`。
- CR-Q31-02：缺每种数据的生命周期、权威性和写入/失效规则责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q31-03：未展示各存储记录的必要字段及读取顺序责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q31-04：缺同一事实分别进入或不得进入各层的示例责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q31-06：无“删聊天等于删状态”或旧记忆授权的反例核对。责任：教材研发员；状态：open，待返修及原例复验。

### Q32　上下文不足时，如何在截断、摘要、检索和外部状态之间选择？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:9376`。
- 已具备：区分权威状态与本轮投影，并提出token预算先预留再分配。
- AQS：AQS-01 not_met；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 not_met；AQS-06 not_met；AQS-07 pass；AQS-08 pass。
- 原文证据：Q32-E1 `textbooks/v12/f02.md:10`；Q32-E2 `textbooks/v12/c01-control-loop.md:50`；Q32-E3 `textbooks/v12/n02-context-memory-prompt.md:76`。
- CR-Q32-01：未回答截断、摘要、检索和外部状态分别怎样选择责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q32-02：缺信息损失、引用回查与不可压缩约束之间的关系责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q32-03：缺预算不足时逐步缩减/回取的策略责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q32-04：没有同一长任务压缩前后的输入实例责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q32-05：未比较四种方式的损失和调用成本责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q32-06：无边界/否定丢失的验证。责任：教材研发员；状态：open，待返修及原例复验。

### Q33　摘要压缩如何避免丢失用户约束、未完成事项和关键事实？

- 结论：`pass_within_content_review_scope`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:9498`。
- 已具备：显示文本说明保留原文比较符、按损失选择压缩、结构化保护未决动作与约束，并用days<7及UNKNOWN冲突给出修正、拒绝和重测依据。
- AQS：AQS-01 pass；AQS-02 pass；AQS-03 pass；AQS-04 pass；AQS-05 pass；AQS-06 pass；AQS-07 pass；AQS-08 pass。
- 原文证据：Q33-E1 `textbooks/v12/c01-control-loop.md:50`；Q33-E2 `textbooks/v12/f02.md:14`；Q33-E3 `textbooks/v12/f02.md:202`；Q33-E4 `textbooks/v12/n02-context-memory-prompt.md:78`。
- AQS-01依据：直接回答摘要不能替换不可变证据，需结构化保留约束、未决动作及来源。
- AQS-02依据：区分原始证据、摘要、权威状态和投影，说明比较符丢失怎样改变判断。
- AQS-03依据：按无关删除、旧讨论摘要、大原文外置，列出摘要必要字段并与权威状态比对。
- AQS-04依据：days<7被压成“七天内”的反例有错误原因和修正；“已创建”对UNKNOWN时明确拒绝摘要。
- AQS-05依据：说明放不下时检索/分拆及允许压缩的信息类型，不用省token掩盖语义损失。
- AQS-06依据：要求提交变更前后请求和候选、重查边界；事实校验可能通过但根因仍错是明确反例。

### Q34　长期记忆应该在什么条件下写入、更新、合并或删除？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:9648`。
- 已具备：有候选抽取、过滤、作用域、冲突核对和事务写入顺序。
- AQS：AQS-01 pass；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 not_met。
- 原文证据：Q34-E1 `textbooks/v12/n02-context-memory-prompt.md:37`；Q34-E2 `textbooks/v12/n02-context-memory-prompt.md:62`。
- CR-Q34-02：合并判定、删除/撤回及派生依赖失效规则不完整责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q34-03：未展示同义合并与冲突不合并、删除后索引/缓存清理的流程责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q34-04：只有语言偏好例子，缺更新/删除对下游产物的完整作用链责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q34-06：无撤回后仍检索命中等反例及预期责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q34-08：状态合同段在“原创设计”处中断。责任：教材研发员；状态：open，待返修及原例复验。

### Q35　如何发现错误记忆对后续任务的持续污染，并修正受影响结果？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:9742`。
- 已具备：给出m1错误传播到o1与m2的清楚问题场景。
- AQS：AQS-01 not_met；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 not_met；AQS-06 not_met；AQS-07 pass；AQS-08 pass。
- 原文证据：Q35-E1 `textbooks/v12/n02-context-memory-prompt.md:45`。
- CR-Q35-01：只描述污染发生，未回答如何发现和修正责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q35-02：缺来源/反向依赖及证据失效传播责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q35-03：未说明隔离受影响产物、重算、重新审核及再启用的顺序责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q35-04：例子未完成更正后的状态和结果责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q35-05：缺保留历史与撤销当前可用性的区别责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q35-06：没有确认污染不再被召回的验证。责任：教材研发员；状态：open，待返修及原例复验。

### Q36　如何隔离不同用户、组织和会话的记忆？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:9808`。
- 已具备：有可信身份、检索前隔离、返回前复查及物理分区备选。
- AQS：AQS-01 pass；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 pass。
- 原文证据：Q36-E1 `textbooks/v12/n02-context-memory-prompt.md:68`。
- CR-Q36-02：组织、用户与会话的多层作用域和共享授权未展开责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q36-03：缺缓存/索引与撤权竞态一起执行隔离的路径责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q36-04：无两租户同词查询与会话切换的具体例子责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q36-06：缺跨租户候选不进入模型和缓存不得串用的检查。责任：教材研发员；状态：open，待返修及原例复验。

### Q37　检索材料、历史记忆与当前用户要求相冲突时，应如何处理？

- 结论：`pass_within_content_review_scope`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:9874`。
- 已具备：区分当前偏好覆盖、权限不可覆盖、事实冲突待确认；用“以后中文/本次英文”给出局部覆盖与持久更新的条件，限制模型投票及猜测写入。
- AQS：AQS-01 pass；AQS-02 pass；AQS-03 pass；AQS-04 pass；AQS-05 pass；AQS-06 pass；AQS-07 pass；AQS-08 pass。
- 原文证据：Q37-E1 `textbooks/v12/n02-context-memory-prompt.md:72`；Q37-E2 `textbooks/v12/n02-context-memory-prompt.md:37`。
- AQS-01依据：先按冲突种类区分本次偏好覆盖、权限不可覆盖和可信事实待确认。
- AQS-02依据：区分当前/长期、偏好/事实、资料/授权，说明为什么不能模型投票。
- AQS-03依据：当前明确要求本次执行，永久撤回才更新；写入要保留来源、过滤、分域和查冲突。
- AQS-04依据：“以后中文”与“这次英文”给出作用域不同的决定；同权威同时间事实冲突则请求确认。
- AQS-05依据：模型猜测职业/薪资不得变成已核事实；用户要求不能改变服务端权限。
- AQS-06依据：用本次英文不得自动改长期偏好、资料指令不得改变权限的可判定反例校验理解。

### Q38　如何设计系统提示，使角色、工具使用规则和输出要求清晰而可测试？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:9968`。
- 已具备：只呈现“提示模板分四层”的引导句。
- AQS：AQS-01 not_met；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 not_met。
- 原文证据：Q38-E1 `textbooks/v12/n02-context-memory-prompt.md:90`。
- CR-Q38-01：角色、工具规则和输出要求的具体设计未回答责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q38-02：四层内容及各自边界完全未显示责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q38-03：没有可用模板或变量/验证合同责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q38-04：无成功与违规输出例子责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q38-06：无提示变更测试责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q38-08：冒号后的主体缺失。责任：教材研发员；状态：open，待返修及原例复验。

### Q39　Few-shot 示例如何帮助工具选择？示例过多或失真会带来什么问题？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:10034`。
- 已具备：定义few-shot是推理时示范而非修改权重。
- AQS：AQS-01 not_met；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 not_met；AQS-06 not_met；AQS-07 pass；AQS-08 pass。
- 原文证据：Q39-E1 `textbooks/v12/n02-context-memory-prompt.md:86`。
- CR-Q39-01：没有解释示例如何帮助工具选择、过多/失真的问题责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q39-02：缺示范覆盖、诱导偏差、上下文成本与分布匹配机制责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q39-03：没有正确与错误工具调用的示例组织方式责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q39-04：无一组示范改变选择的案例责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q39-05：不说明增删示例的权衡责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q39-06：未给无示例/少示例/失真示例的比较。责任：教材研发员；状态：open，待返修及原例复验。

### Q40　如何验证一次提示或记忆策略调整确实改善了结果，而非只修好几个演示样例？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:10100`。
- 已具备：区分开发、回归和独立保留案例，并要求失败可追溯。
- AQS：AQS-01 pass；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 not_met；AQS-06 not_met；AQS-07 pass；AQS-08 pass。
- 原文证据：Q40-E1 `textbooks/v12/e02.md:65`；Q40-E2 `textbooks/v12/e02.md:243`。
- CR-Q40-02：未说明冻结提示/记忆配置、随机重复、污染控制与同条件比较责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q40-03：缺具体实验步骤和接受新策略的规则责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q40-04：无只修演示而保留集退化的教学结果责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q40-05：缺质量与成本/延迟退化的取舍责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q40-06：仅有数据集种类，没有观测项、预期和反转判据。责任：教材研发员；状态：open，待返修及原例复验。

### Q41　RAG、长上下文直接阅读和模型微调，分别适合解决哪些知识问题？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:10194`。
- 已具备：直接比较RAG、长上下文、微调的目标、代价及知识记忆限制。
- AQS：AQS-01 pass；AQS-02 pass；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 pass。
- 原文证据：Q41-E1 `textbooks/v12/n05-retrieval-ingestion.md:132`。
- CR-Q41-03：没有按规模、更新频率、任务行为和引用要求作选择的步骤责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q41-04：无同一知识需求采用不同方案的案例责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q41-06：缺查证选择是否有效及混合方案收益的测试。责任：教材研发员；状态：open，待返修及原例复验。

### Q42　一个完整 RAG 管线包含哪些环节？如何逐段定位回答错误？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:10260`。
- 已具备：有摄取版本链、无命中原因和事实/假设字段区分。
- AQS：AQS-01 pass；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 pass。
- 原文证据：Q42-E1 `textbooks/v12/c02.md:10`；Q42-E2 `textbooks/v12/c02.md:230`；Q42-E3 `textbooks/v12/f02.md:20`。
- CR-Q42-02：未串起查询、召回、过滤、重排、上下文、生成与支持核验全管线责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q42-03：缺逐段固定输入定位首个偏离的步骤责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q42-04：无回答错误到某一具体阶段原因的完整轨迹责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q42-06：缺检索有资料却生成错误的区分实验。责任：教材研发员；状态：open，待返修及原例复验。

### Q43　如何根据文档结构、查询类型和引用需求设计切块策略？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:10382`。
- 已具备：说明版本化摄取、公平检索比较及表格/跨页结构不能破坏。
- AQS：AQS-01 not_met；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 not_met；AQS-06 not_met；AQS-07 pass；AQS-08 pass。
- 原文证据：Q43-E1 `textbooks/v12/c02.md:10`；Q43-E2 `textbooks/v12/c02.md:238`；Q43-E3 `textbooks/v12/n05-retrieval-ingestion.md:23`。
- CR-Q43-01：没有完整回答按结构、查询类型与引用需求如何选切块策略责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q43-02：缺块大小、重叠、父子块与上下文完整性的机制关系责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q43-03：无分块规则及边界/引用字段示例责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q43-04：缺一个切断前提导致错误再修分块的走通案例责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q43-05：块长取舍未落实责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q43-06：缺比较不同切块参数的必要证据召回指标。责任：教材研发员；状态：open，待返修及原例复验。

### Q44　如何选择 Embedding 模型，评估领域术语、中文与多语言查询效果？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:10504`。
- 已具备：提醒相同维度不等于同空间，必须绑定编码配置与前缀。
- AQS：AQS-01 not_met；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 not_met；AQS-06 not_met；AQS-07 pass；AQS-08 not_met。
- 原文证据：Q44-E1 `textbooks/v12/n05-retrieval-ingestion.md:57`。
- CR-Q44-01：未说明怎样选择Embedding并评估术语、中文和多语言责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q44-02：缺任务域、词法基线、多语言配对及语义相关标签责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q44-03：无候选模型比较步骤责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q44-04：没有中文术语/混合语查询的实例责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q44-05：缺效果、尺寸、速度与迁移成本的选择责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q44-06：未给分层召回与下游效果指标责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q44-08：官方来源URL截断。责任：教材研发员；状态：open，待返修及原例复验。

### Q45　关键词检索、向量检索和混合检索分别有什么优势与盲区？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:10570`。
- 已具备：用测试名与自然语言查询解释词法/语义优势，并保持同过滤及预算比较。
- AQS：AQS-01 pass；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 not_met；AQS-06 not_met；AQS-07 pass；AQS-08 pass。
- 原文证据：Q45-E1 `textbooks/v12/c02.md:20`；Q45-E2 `textbooks/v12/c02.md:238`。
- CR-Q45-02：混合检索的融合机制及两路各自误召回尚未展开责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q45-03：缺两路召回到融合、去重、过滤与选证据的步骤责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q45-04：未给候选排名或一个词法/语义相反结果的完整对照责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q45-05：缺候选预算和权重选择的代价责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q45-06：未展示怎样判混合确实优于较强单路基线。责任：教材研发员；状态：open，待返修及原例复验。

### Q46　Reranker 改善的是哪一阶段？怎样衡量它带来的质量与时延代价？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:10664`。
- 已具备：区分双塔预计算与cross-encoder联合评分及先召回后重排。
- AQS：AQS-01 not_met；AQS-02 pass；AQS-03 not_met；AQS-04 not_met；AQS-05 not_met；AQS-06 not_met；AQS-07 pass；AQS-08 not_met。
- 原文证据：Q46-E1 `textbooks/v12/n05-retrieval-ingestion.md:77`。
- CR-Q46-01：时延代价如何量化尚未回答责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q46-03：没有候选集固定、计时边界、重排到最终答案的比较步骤责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q46-04：缺重排纠正或无法挽救漏召回的例子责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q46-05：未说明候选数与尾延迟的取舍责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q46-06：缺nDCG/排序或任务效果与p95增量的验证责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q46-08：来源链接截断。责任：教材研发员；状态：open，待返修及原例复验。

### Q47　查询改写、多查询和多跳检索什么时候有效，什么时候容易改变原意？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:10730`。
- 已具备：给出改写术语的用途，保护ID/时间/否定/版本，并以React否定为拒绝例。
- AQS：AQS-01 not_met；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 not_met；AQS-06 not_met；AQS-07 pass；AQS-08 pass。
- 原文证据：Q47-E1 `textbooks/v12/n05-retrieval-ingestion.md:85`。
- CR-Q47-01：多查询与多跳两个子问没有回答责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q47-02：缺多查询融合、多跳依赖及误差累积机制责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q47-03：无选择策略和跨跳证据连接步骤责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q47-04：无多跳成功与跑偏的完整例子责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q47-05：缺增加调用与召回收益的取舍责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q47-06：缺保持原意与链式证据有效的测试。责任：教材研发员；状态：open，待返修及原例复验。

### Q48　如何让答案引用与实际支持结论的原文、版本及位置对应？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:10796`。
- 已具备：区分引用身份一致与真正支持主张，给出days<7的支持边界。
- AQS：AQS-01 pass；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 not_met。
- 原文证据：Q48-E1 `textbooks/v12/c02.md:10`；Q48-E2 `textbooks/v12/c02.md:30`；Q48-E3 `textbooks/v12/c02.md:222`。
- CR-Q48-02：缺将答案拆成原子主张并逐项映射证据的完整机制责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q48-03：没有从生成引用到读回验证和不足处理的顺序责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q48-04：最后摘录由“预期…实际为空”开始但没有此前故障输入，案例不能独立读通责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q48-06：缺不存在引用、错版本和只支持半句的完整反例判定责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q48-08：E3断在“Source”，引入未展示的类型。责任：教材研发员；状态：open，待返修及原例复验。

### Q49　没有足够证据、资料互相矛盾或知识已经过期时，系统应怎样响应？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:10918`。
- 已具备：说明NO_HITS不是事实不存在，并对同权威资料冲突暂停核对。
- AQS：AQS-01 pass；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 pass。
- 原文证据：Q49-E1 `textbooks/v12/c02.md:230`；Q49-E2 `textbooks/v12/c01-selection.md:31`。
- CR-Q49-02：过期知识与当前有效版本的决定规则未展开责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q49-03：缺缺证、冲突、过期各分支的用户回应和补证步骤责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q49-04：没有完整冲突对象/时间与可接受输出例子责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q49-06：缺模型投票、旧版高分和拒绝泄露的核验。责任：教材研发员；状态：open，待返修及原例复验。

### Q50　Agentic RAG 相对固定 RAG 增加了什么决策能力？如何证明额外复杂度值得？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:11012`。
- 已具备：定义Agentic RAG新增子问题、资料域、工具和停止时机的选择权。
- AQS：AQS-01 not_met；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 not_met；AQS-06 not_met；AQS-07 pass；AQS-08 pass。
- 原文证据：Q50-E1 `textbooks/v12/n05-retrieval-ingestion.md:95`。
- CR-Q50-01：没有回答怎样证明额外复杂度值得责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q50-02：缺观察反馈如何改变检索和支持核验责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q50-03：无固定RAG对照实验与继续/停止路径责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q50-04：缺一次固定检索不足、追加检索后改善或仍停止的轨迹责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q50-05：没有质量收益与调用成本/错误面的权衡责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q50-06：缺同预算任务测试和无效扩展反例。责任：教材研发员；状态：open，待返修及原例复验。

### Q51　在你采用的版本中，LangChain 和 LangGraph 分别承担什么职责？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:11078`。
- 已具备：显示固定Python LangGraph/相关包版本和核查日期。
- AQS：AQS-01 not_met；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 not_met；AQS-06 not_met；AQS-07 pass；AQS-08 not_met。
- 原文证据：Q51-E1 `textbooks/v12/n06-graph-orchestration.md:5`。
- CR-Q51-01：关键句截在create_agent等处，没有说明两框架分别负责什么责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q51-02：缺模型/工具接口与图状态/调度/持久化的边界责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q51-03：没有最小调用关系或选择路径责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q51-04：无同一Agent中两者合作的示例责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q51-05：无不用其中一层的条件责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q51-06：缺用本版本可观察接口核实分工的验证责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q51-08：句中截断导致正文不完整。责任：教材研发员；状态：open，待返修及原例复验。

### Q52　用图表示 Agent 时，节点、边和共享状态分别应该包含什么？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:11144`。
- 已具备：说明节点返回局部更新、边选后继、reducer合并，警告TypedDict不做运行时业务校验。
- AQS：AQS-01 pass；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 not_met。
- 原文证据：Q52-E1 `textbooks/v12/n06-graph-orchestration.md:19`；Q52-E2 `textbooks/v12/n06-graph-orchestration.md:13`。
- CR-Q52-02：共享状态字段与控制数据/业务数据边界不完整责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q52-03：只显示request_id一行，没有能运行或可追踪的节点/路由/状态示例责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q52-04：缺两节点更新到终态的完整案例责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q52-06：无更新冲突、非法路由和类型误用的验证责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q52-08：表格只摘一行，Graph API链接在中途截断。责任：教材研发员；状态：open，待返修及原例复验。

### Q53　状态字段应如何建模，避免把全部消息和中间数据无限累积？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:11229`。
- 已具备：区分四类状态用途，提出大对象外置、配额、保留期与删除索引的方向。
- AQS：AQS-01 pass；AQS-02 pass；AQS-03 not_met；AQS-04 not_met；AQS-05 not_met；AQS-06 not_met；AQS-07 pass；AQS-08 not_met。
- 原文证据：Q53-E1 `textbooks/v12/n02-context-memory-prompt.md:9`；Q53-E2 `textbooks/v12/n02-context-memory-prompt.md:82`。
- CR-Q53-03：未展示状态Schema及消息追加/裁剪/引用存储的具体读写路径责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q53-04：缺一个长任务增长→外置→恢复读取的案例责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q53-05：历史审计与配额清理发生冲突时的处置未展开责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q53-06：无验证内存/存储不再无界增长且未决动作不丢失的测试责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q53-08：末句章节链接被截断。责任：教材研发员；状态：open，待返修及原例复验。

### Q54　并行节点同时更新状态时，如何处理合并规则和写入冲突？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:11323`。
- 已具备：解释覆盖会丢结果、简单追加会在重放时重复；提出不可变来源键和冲突中止及代数性质。
- AQS：AQS-01 pass；AQS-02 pass；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 pass。
- 原文证据：Q54-E1 `textbooks/v12/n06-graph-orchestration.md:21`；Q54-E2 `textbooks/v12/n06-graph-orchestration.md:34`。
- CR-Q54-03：未交代完整reducer输入/输出、冲突返回以及并发提交边界责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q54-04：缺两个节点先后次序交换与重放的具体数据轨迹责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q54-06：未给相同键不同内容、有序步骤和重复事件的验证预期。责任：教材研发员；状态：open，待返修及原例复验。

### Q55　条件路由由规则决定还是由模型决定，各有什么适用场景？

- 结论：`pass_within_content_review_scope`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:11408`。
- 已具备：覆盖规则与模型路由的控制权差异，用固定审批和动态调查组合、路径是否可枚举的案例给选择条件，并限定白名单与未知节点停止。
- AQS：AQS-01 pass；AQS-02 pass；AQS-03 pass；AQS-04 pass；AQS-05 pass；AQS-06 pass；AQS-07 pass；AQS-08 pass。
- 原文证据：Q55-E1 `textbooks/v12/c01-selection.md:9`；Q55-E2 `textbooks/v12/c01-selection.md:18`；Q55-E3 `textbooks/v12/c01-selection.md:20`；Q55-E4 `textbooks/v12/c01-selection.md:29`；Q55-E5 `textbooks/v12/n06-graph-orchestration.md:52`。
- AQS-01依据：直接提出权限/批准/预算等确定条件用规则，允许目标内的下一调查可交模型。
- AQS-02依据：把控制权、路径可枚举性、动态调查与固定写操作拆开，说明动态不等于无限授权。
- AQS-03依据：示例先判现有分支能否枚举，再选动态只读；模型输出映射白名单，未知节点澄清或停止。
- AQS-04依据：同一失败报告分别讨论已知实现/调用者路径和需观察后追踪新文件；创建仍固定审批。
- AQS-05依据：动态适用于无法合理穷举的调查，资料/预算不扩大，普通条件分支仍可包含循环。
- AQS-06依据：“模型用了while即动态Agent”与“未知节点名可执行”均给出拒绝理由和期望动作。

### Q56　Checkpoint 应保存什么，才能支持失败恢复与人工介入？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:11568`。
- 已具备：展开意图、发送前尝试、结果三个提交窗口，以及State内容和checkpointer边界。
- AQS：AQS-01 pass；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 not_met。
- 原文证据：Q56-E1 `textbooks/v12/e01.md:10`；Q56-E2 `textbooks/v12/e01.md:12`；Q56-E3 `textbooks/v12/e01.md:14`；Q56-E4 `textbooks/v12/c01-control-loop.md:52`；Q56-E5 `textbooks/v12/n06-graph-orchestration.md:60`。
- CR-Q56-02：人工介入的批准绑定、恢复输入和过期/冲突核查未完整展开责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q56-03：缺根据保存内容恢复到哪个状态、如何处理未决动作的顺序责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q56-04：未给跨崩溃加人工介入的完整轨迹责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q56-06：无重启、重复恢复及过期批准的检查用例责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q56-08：持久化来源链接截断。责任：教材研发员；状态：open，待返修及原例复验。

### Q57　恢复执行时，如何保证已经完成的外部操作不会再次产生副作用？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:11728`。
- 已具备：说明幂等契约条件、下游原子性、账本事件重放和interrupt节点重执行风险。
- AQS：AQS-01 pass；AQS-02 pass；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 not_met。
- 原文证据：Q57-E1 `textbooks/v12/c01-control-loop.md:256`；Q57-E2 `textbooks/v12/c01-control-loop.md:260`；Q57-E3 `textbooks/v12/e01.md:366`；Q57-E4 `textbooks/v12/n06-graph-orchestration.md:62`。
- CR-Q57-03：没有集中给已完成、未决、确认无效果的恢复决策以及稳定身份串联责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q57-04：interrupt计数示例和写成功回执丢失案例都未展示到结果责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q57-06：无完整输入/预期验证一次副作用与多次节点执行的区别责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q57-08：多段在来源URL、代次和“三次任”处截断。责任：教材研发员；状态：open，待返修及原例复验。

### Q58　子图怎样封装独立任务？父图与子图之间如何交接状态？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:11869`。
- 已具备：给出父findings、子evidence/summary的投影和回写，并提示同名字段不一定同义。
- AQS：AQS-01 pass；AQS-02 pass；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 not_met。
- 原文证据：Q58-E1 `textbooks/v12/n06-graph-orchestration.md:68`；Q58-E2 `textbooks/v12/n06-graph-orchestration.md:70`。
- CR-Q58-03：缺字段映射、失败返回及异步/恢复交接的完整合同责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q58-04：没有父子输入和输出实际值的走通例责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q58-06：无字段越界覆盖、缺证和私有状态泄露的测试责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q58-08：两段均在句子未结束处截断。责任：教材研发员；状态：open，待返修及原例复验。

### Q59　流式输出怎样区分文本、工具进度、暂停、错误和最终结果？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:11954`。
- 已具备：解释updates/values/messages/custom并给事件封套、顺序去重和缺口补回思路。
- AQS：AQS-01 pass；AQS-02 pass；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 not_met。
- 原文证据：Q59-E1 `textbooks/v12/n06-graph-orchestration.md:74`；Q59-E2 `textbooks/v12/n06-graph-orchestration.md:76`；Q59-E3 `textbooks/v12/n06-graph-orchestration.md:78`。
- CR-Q59-03：重连补事件与最终状态确认的末尾处理未完整呈现责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q59-04：缺token、工具、暂停、错误、final交错到UI状态的完整轨迹责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q59-06：虽然提及序号策略例，未给乱序/缺口/同序不同内容的完整测试输出责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q59-08：多段在来源URL、框架边界与“只能展示已”处截断。责任：教材研发员；状态：open，待返修及原例复验。

### Q60　如果去掉 LangGraph，你如何实现等价的状态机，并说明取舍？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:12058`。
- 已具备：提出任务表/CAS/lease和自研相对于LangGraph的维护取舍。
- AQS：AQS-01 pass；AQS-02 pass；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 not_met。
- 原文证据：Q60-E1 `textbooks/v12/n06-graph-orchestration.md:82`；Q60-E2 `textbooks/v12/n06-graph-orchestration.md:84`。
- CR-Q60-03：状态机只列字段和概括步骤，没有等价路由、暂停/恢复及结果提交的最小流程责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q60-04：无一次失败后恢复或人工批准的对照轨迹责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q60-06：只列测试主题，没有能判等价与不等价的具体预期责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q60-08：关键重放段截在“上”。责任：教材研发员；状态：open，待返修及原例复验。

### Q61　什么实验或业务证据会使你选择多 Agent，而不是给单 Agent 增加工具或步骤？

- 结论：`pass_within_content_review_scope`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:12143`。
- 已具备：以可独立核对的子问题、总预算不增、漏问题减少且无新增越权/无支持结论为可证伪假设；规定同条件实验与放弃条件。
- AQS：AQS-01 pass；AQS-02 pass；AQS-03 pass；AQS-04 pass；AQS-05 pass；AQS-06 pass；AQS-07 pass；AQS-08 pass。
- 原文证据：Q61-E1 `textbooks/v12/c01-selection.md:35`；Q61-E2 `textbooks/v12/c01-selection.md:41`；Q61-E3 `textbooks/v12/c01-selection.md:45`。
- AQS-01依据：直接用可证伪的业务/实验证据决定多Agent，而不是Agent数量。
- AQS-02依据：独立子问题、共同偏差、串行写瓶颈与多Agent收益的因果关系已解释。
- AQS-03依据：冻结同任务/输入/权限/配置/预算，记录完整目标、错误、用量、等待和成本。
- AQS-04依据：控制路径与夹具调查是可分问题；结果只变长不减少漏错则放弃，串行写瓶颈不升级。
- AQS-05依据：总预算不增且不增加越权/无支持结论是明确约束，不以更多引用代替价值。
- AQS-06依据：假设可由漏问题是否减少、错误是否增加推翻；共同资料错误反驳“两模型同意即证明”。

### Q62　Supervisor、交接式协作和共享讨论，分别适合什么任务？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:12256`。
- 已具备：三行已列协作控制方式、适合任务和典型风险。
- AQS：AQS-01 pass；AQS-02 pass；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 pass。
- 原文证据：Q62-E1 `textbooks/v12/n07-multiagent-a2a.md:9`；Q62-E2 `textbooks/v12/n07-multiagent-a2a.md:10`；Q62-E3 `textbooks/v12/n07-multiagent-a2a.md:11`。
- CR-Q62-03：未说明交接接收、共享状态冲突和协调停止如何落实责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q62-04：没有一个任务分别采用三种模式的执行例责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q62-06：无验证丢约束、转交循环和讨论不终止的反例。责任：教材研发员；状态：open，待返修及原例复验。

### Q63　如何定义各 Agent 的输入、输出、职责边界和完成条件？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:12360`。
- 已具备：交接字段覆盖身份、版本、证据、资源、产物和状态，区分子任务完成与父任务验收。
- AQS：AQS-01 pass；AQS-02 pass；AQS-03 pass；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 pass。
- 原文证据：Q63-E1 `textbooks/v12/c01-selection.md:37`；Q63-E2 `textbooks/v12/c01-selection.md:39`；Q63-E3 `textbooks/v12/n07-multiagent-a2a.md:35`。
- CR-Q63-04：缺一份具体子任务交接及接收/退回的完整示例责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q63-06：未给缺引用、版本冲突、子completed但父目标缺项的明确测试输入和预期。责任：教材研发员；状态：open，待返修及原例复验。

### Q64　如何把任务拆成可以并行的部分，并保留必要的依赖顺序？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:12473`。
- 已具备：说明可并行读取、依赖报告的正文、依赖批准的写入，以及可执行波次条件。
- AQS：AQS-01 pass；AQS-02 pass；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 not_met。
- 原文证据：Q64-E1 `textbooks/v12/c01-selection.md:35`；Q64-E2 `textbooks/v12/c01-control-loop.md:692`；Q64-E3 `textbooks/v12/c01-control-loop.md:694`。
- CR-Q64-03：部分超时后的独立记录和后续就绪计算没有完整展示责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q64-04：没有两路异步返回并一项失败的时序例责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q64-06：缺证明依赖未满足绝不提前发写、结果不按下标错配的测试责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q64-08：波次段在“必须各”处截断。责任：教材研发员；状态：open，待返修及原例复验。

### Q65　多 Agent 应共享完整上下文，还是只传递必要材料？怎样判断？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:12586`。
- 已具备：给完整共享与选择性交接的具体适用条件，强调相同权限/总预算比较。
- AQS：AQS-01 pass；AQS-02 pass；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 not_met。
- 原文证据：Q65-E1 `textbooks/v12/n07-multiagent-a2a.md:39`；Q65-E2 `textbooks/v12/n07-multiagent-a2a.md:41`。
- CR-Q65-03：清单缺项后的补齐和接收规则在关键处截断责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q65-04：无敏感资料不同权限或摘要漏条件的实际交接例责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q65-06：指标虽列出，未给错漏示例及可判定预期责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q65-08：E1以“不允”截断。责任：教材研发员；状态：open，待返修及原例复验。

### Q66　子 Agent 返回互相矛盾的结果时，协调者应如何处理？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:12671`。
- 已具备：拒绝多数投票和后到覆盖，提供两调查者同结论但版本不一致的反例。
- AQS：AQS-01 pass；AQS-02 not_met；AQS-03 not_met；AQS-04 pass；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 pass。
- 原文证据：Q66-E1 `textbooks/v12/c01-selection.md:31`；Q66-E2 `textbooks/v12/c01-selection.md:37`；Q66-E3 `textbooks/v12/c01-selection.md:57`。
- CR-Q66-02：未区分来源版本差异、适用条件差异与同条件真实冲突各自处理责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q66-03：缺重新取证、保留分歧与交权威裁定的顺序责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q66-06：无同版本相反结论或关键来源缺失的核验方案。责任：教材研发员；状态：open，待返修及原例复验。

### Q67　如何防止子 Agent 的错误结论在汇总过程中变成“已验证事实”？

- 结论：`pass_within_content_review_scope`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:12793`。
- 已具备：解释共同偏差、来源/版本核验和引用不等于支持，用days<7与事实/假设/执行结果拆分给出防止升级为事实的可用方法。
- AQS：AQS-01 pass；AQS-02 pass；AQS-03 pass；AQS-04 pass；AQS-05 pass；AQS-06 pass；AQS-07 pass；AQS-08 pass。
- 原文证据：Q67-E1 `textbooks/v12/c01-selection.md:35`；Q67-E2 `textbooks/v12/c01-selection.md:37`；Q67-E3 `textbooks/v12/c02.md:30`；Q67-E4 `textbooks/v12/c02.md:34`。
- AQS-01依据：答案提出原子主张、逐项证据和执行回执，避免子Agent结论自动变事实。
- AQS-02依据：解释共同偏差、版本/权限核对、引用存在与支持关系及内容/执行两类证据。
- AQS-03依据：交接携带主张/版本/输入哈希/状态，先核版本权限，拆分报告事实、根因假设、执行结果。
- AQS-04依据：days<7只证明代码比较而不证明业务规则；整句复合结论拆成三个对象再验证。
- AQS-05依据：不按投票或最后到达覆盖冲突，INCOMPLETE不当没有问题。
- AQS-06依据：对引用存在但推断越界以及报告不能证明工单创建的反例给出可判定边界。

### Q68　某个子 Agent 超时或失败时，整体任务应等待、重分派还是部分交付？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:12925`。
- 已具备：根据必要输入/可选贡献区分等待与有限交付，说明稳定身份、迟到结果和epoch。
- AQS：AQS-01 pass；AQS-02 pass；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 not_met。
- 原文证据：Q68-E1 `textbooks/v12/n07-multiagent-a2a.md:49`；Q68-E2 `textbooks/v12/n07-multiagent-a2a.md:51`。
- CR-Q68-03：epoch比较提交与旧worker淘汰规则被截断，无法完整执行重派路径责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q68-04：无等待→取消/重派→迟到结果拒绝的全时序责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q68-06：缺必要子任务失败不得父completed、迟到状态不得回退的具体测试责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q68-08：结尾在“按当前ep”中断。责任：教材研发员；状态：open，待返修及原例复验。

### Q69　多 Agent 的通信次数、费用和时延怎样纳入统一预算？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:13010`。
- 已具备：有父预算分配、原子预留、尝试计费、未决费用和恢复专用额度。
- AQS：AQS-01 pass；AQS-02 pass；AQS-03 pass；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 pass。
- 原文证据：Q69-E1 `textbooks/v12/c01-selection.md:39`；Q69-E2 `textbooks/v12/e05.md:10`；Q69-E3 `textbooks/v12/e05.md:196`；Q69-E4 `textbooks/v12/e05.md:198`；Q69-E5 `textbooks/v12/n07-multiagent-a2a.md:47`。
- CR-Q69-04：缺具体父额度、各子预留、部分返回/超时与结算的数字轨迹责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q69-06：无并发预留竞态、重复结算和取消但仍消耗的测试输入及不变量预期。责任：教材研发员；状态：open，待返修及原例复验。

### Q70　A2A 与应用内部的多 Agent 编排有何区别？跨系统任务交接需要哪些契约？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:13179`。
- 已具备：区分内部共享状态与跨系统任务，说明RPC/message/task/context身份及产物/取消安全边界。
- AQS：AQS-01 pass；AQS-02 pass；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 not_met。
- 原文证据：Q70-E1 `textbooks/v12/n07-multiagent-a2a.md:57`；Q70-E2 `textbooks/v12/n07-multiagent-a2a.md:73`；Q70-E3 `textbooks/v12/n07-multiagent-a2a.md:75`；Q70-E4 `textbooks/v12/n07-multiagent-a2a.md:77`。
- CR-Q70-03：首次请求超时未取得task_id、终态分类等关键恢复流程被截断责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q70-04：无发现→授权→提交→查询/输入补充→产物验收的完整交互责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q70-06：缺版本不兼容、迟到状态、重复通知和未知副作用验证责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q70-08：多处在AgentCard、首次超时、failed/rejected/can等关键位置中断。责任：教材研发员；状态：open，待返修及原例复验。

### Q71　如何定义 Agent 的任务成功率，避免把“生成了回答”当成任务成功？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:13302`。
- 已具备：区分正确停止与创建成功，保留分配分母及FAIL/INSUFFICIENT/HARNESS_ERROR。
- AQS：AQS-01 not_met；AQS-02 pass；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 pass；AQS-07 pass；AQS-08 not_met。
- 原文证据：Q71-E1 `textbooks/v12/e02.md:12`；Q71-E2 `textbooks/v12/e02.md:22`；Q71-E3 `textbooks/v12/e02.md:77`；Q71-E4 `textbooks/v12/e02.md:95`。
- CR-Q71-01：没有清晰完整地给出成功率的分子、分母及按任务类型报告公式责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q71-03：首个表格仅有表头，评估层级与汇总流程不全责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q71-04：缺一个包含成功、正确停止、缺证及测试故障的计算实例责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q71-08：最后状态定义段在评估器崩溃处中断。责任：教材研发员；状态：open，待返修及原例复验。

### Q72　最终结果评测和执行轨迹评测分别能够发现什么问题？

- 结论：`pass_within_content_review_scope`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:13443`。
- 已具备：用无依据根因、越权读取和二十次重复读取分别说明最终内容、过程安全与资源问题，并关联执行身份及受控账本的证据限制。
- AQS：AQS-01 pass；AQS-02 pass；AQS-03 pass；AQS-04 pass；AQS-05 pass；AQS-06 pass；AQS-07 pass；AQS-08 pass。
- 原文证据：Q72-E1 `textbooks/v12/e02.md:12`；Q72-E2 `textbooks/v12/e02.md:18`；Q72-E3 `textbooks/v12/e02.md:221`；Q72-E4 `textbooks/v12/e02.md:229`。
- AQS-01依据：区分内容结果、过程安全与资源使用能发现的不同错误。
- AQS-02依据：无依据根因、越权读取和重复调用分别是不同故障层，均分不能定位。
- AQS-03依据：以run/model_attempt/action/attempt身份将判断关联到相应事件，关键事实用完整账本。
- AQS-04依据：即便最终拒答仍可能先越权读到资料；读对文件却反复二十次的例子揭示资源问题。
- AQS-05依据：trace采样/导出失败不能证明没有违法动作，秘密不应进入普通trace。
- AQS-06依据：使用相同结果但不同轨迹的反例可区分两类评测，要求读取不同证据。

### Q73　如何构建包含正常、边界、歧义、失败和恶意输入的评测集？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:13575`。
- 已具备：给案例三要素、正常/缺证/丢回执家庭、保留集与批准边界及间接注入测试。
- AQS：AQS-01 pass；AQS-02 pass；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 pass；AQS-07 pass；AQS-08 pass。
- 原文证据：Q73-E1 `textbooks/v12/e02.md:26`；Q73-E2 `textbooks/v12/e02.md:61`；Q73-E3 `textbooks/v12/e02.md:65`；Q73-E4 `textbooks/v12/e03.md:62`；Q73-E5 `textbooks/v12/e03.md:296`；Q73-E6 `textbooks/v12/e03.md:298`。
- CR-Q73-03：未说明如何从风险/能力划分覆盖面并避免任务或来源泄漏责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q73-04：题目明确包含歧义，但没有歧义输入与澄清/停止预期的完整例子。责任：教材研发员；状态：open，待返修及原例复验。

### Q74　如何区分检索失败、规划失败、工具失败和最终表达失败？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:13763`。
- 已具备：用投影丢断言案例解释首偏离与根因，提出受控替换及端到端复验。
- AQS：AQS-01 pass；AQS-02 not_met；AQS-03 pass；AQS-04 not_met；AQS-05 pass；AQS-06 pass；AQS-07 pass；AQS-08 not_met。
- 原文证据：Q74-E1 `textbooks/v12/e02.md:221`；Q74-E2 `textbooks/v12/e02.md:225`；Q74-E3 `textbooks/v12/e02.md:227`；Q74-E4 `textbooks/v12/c02.md:24`；Q74-E5 `textbooks/v12/e04.md:164`。
- CR-Q74-02：检索、规划、工具和表达四类失效的区分判据未逐一展开责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q74-04：仅完整举了上下文投影问题，没有规划非法动作或工具失败的对照责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q74-08：夹入RRF融合参数段与主问诊断层次无衔接，且其来源链接截断。责任：教材研发员；状态：open，待返修及原例复验。

### Q75　如何使用 LLM-as-a-Judge，并控制评判偏差及与人工结论的不一致？

- 结论：`pass_within_content_review_scope`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:13923`。
- 已具备：涵盖位置/冗长/自偏好等风险、人审校准、误放/误拒数字例、独立新材料及裁判版本变化，明确虚构数字和人审边界。
- AQS：AQS-01 pass；AQS-02 pass；AQS-03 pass；AQS-04 pass；AQS-05 pass；AQS-06 pass；AQS-07 pass；AQS-08 pass。
- 原文证据：Q75-E1 `textbooks/v12/e02.md:233`；Q75-E2 `textbooks/v12/e02.md:235`；Q75-E3 `textbooks/v12/e02.md:237`；Q75-E4 `textbooks/v12/e02.md:239`。
- AQS-01依据：先说明模型评分能初筛但有偏差，不能把评分器当无误裁判。
- AQS-02依据：覆盖位置/冗长/自偏好、误放/误拒、校准过拟合与裁判版本变化。
- AQS-03依据：人先标多类样本并保留分歧，再比误放/误拒，高风险人审，独立新材料重验。
- AQS-04依据：10拒/20收的虚构样本给出2/10误放、6/20误拒和22/30一致，明确标虚构。
- AQS-05依据：安全争议优先人审，改变裁判要重评两版本，不外推论文基准成绩。
- AQS-06依据：始终拒绝可误放为零但功能失败，反例直接检验为何不能只看一致率。

### Q76　同一个任务多次运行结果不同，应该怎样报告成功率与稳定性？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:14046`。
- 已具备：给分配单位、逐案例配对差值、相关性/小样本边界及缺证不删分母的规则。
- AQS：AQS-01 pass；AQS-02 pass；AQS-03 pass；AQS-04 not_met；AQS-05 pass；AQS-06 pass；AQS-07 pass；AQS-08 not_met。
- 原文证据：Q76-E1 `textbooks/v12/e02.md:77`；Q76-E2 `textbooks/v12/e02.md:79`；Q76-E3 `textbooks/v12/e02.md:89`；Q76-E4 `textbooks/v12/e02.md:91`。
- CR-Q76-04：当前引用“这张表”但没有显示表或完整重复运行样本，读者无法跟算率与稳定性责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q76-08：相关样本段在“狭窄区”处截断。责任：教材研发员；状态：open，待返修及原例复验。

### Q77　一条 Agent Trace 应记录什么，才能定位问题且避免泄露敏感信息？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:14169`。
- 已具备：列运行/模型/动作/尝试身份，说明阶段字段、敏感值最小化与trace采样不能代替账本。
- AQS：AQS-01 pass；AQS-02 pass；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 not_met。
- 原文证据：Q77-E1 `textbooks/v12/e02.md:221`；Q77-E2 `textbooks/v12/e02.md:229`；Q77-E3 `textbooks/v12/e04.md:164`；Q77-E4 `textbooks/v12/e03.md:50`。
- CR-Q77-03：没有一个安全事件Schema、脱敏/访问/保留与关联查询的具体路径责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q77-04：缺由一组trace实际定位阶段的例子责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q77-06：无日志注入、秘密扫描和缺span条件的验证预期责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q77-08：OWASP来源链接截断。责任：教材研发员；状态：open，待返修及原例复验。

### Q78　如何设计模型、工具和检索组件的消融实验？

- 结论：`pass_within_content_review_scope`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:14310`。
- 已具备：说明单变量及四组合试验、不可行子集与oracle边界、独立数据和随机重复，能区分归因、交互及任务可解性。
- AQS：AQS-01 pass；AQS-02 pass；AQS-03 pass；AQS-04 pass；AQS-05 pass；AQS-06 pass；AQS-07 pass；AQS-08 pass。
- 原文证据：Q78-E1 `textbooks/v12/n10-evaluation-projects.md:19`；Q78-E2 `textbooks/v12/n10-evaluation-projects.md:28`；Q78-E3 `textbooks/v12/n10-evaluation-projects.md:30`。
- AQS-01依据：说明要分开模型、reranker和工具变化，不能从一起变好归因任一项。
- AQS-02依据：包含主效应、交互、不可行任务与oracle替身的不同解释边界。
- AQS-03依据：固定输入/资源，单变量比较及基础/新模型/重排/两者四组合，保留每次轨迹。
- AQS-04依据：去掉唯一订单工具导致不可解，不能当模型变弱；理想观察只能是oracle对照。
- AQS-05依据：共同可行子集与全量不可行标记分别报告，小样本不作精确统计承诺。
- AQS-06依据：联合变化与单项和对照、独立数据、重复运行与严重错误监控构成可证伪检验。

### Q79　模型、提示、工具或知识库升级后，如何判断新版本能否发布？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:14414`。
- 已具备：有冻结版本、风险硬门槛、原例/回归/保留集及新任务灰度与回退边界。
- AQS：AQS-01 pass；AQS-02 pass；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 not_met。
- 原文证据：Q79-E1 `textbooks/v12/e02.md:75`；Q79-E2 `textbooks/v12/e02.md:89`；Q79-E3 `textbooks/v12/e02.md:245`；Q79-E4 `textbooks/v12/e04.md:32`；Q79-E5 `textbooks/v12/e04.md:140`；Q79-E6 `textbooks/v12/e04.md:142`。
- CR-Q79-03：未将多类升级转为明确放行、暂停和回滚的连续决策责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q79-04：无一次升级因关键边界退化而停止/回退的完整轨迹责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q79-06：测试主题多但缺一组旧新样本结果如何判发布的具体示范责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q79-08：灰度标准段以逗号中断，所指比较表未显示。责任：教材研发员；状态：open，待返修及原例复验。

### Q80　用户报告一个偶发失败，但你本地无法复现，下一步怎么调查？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:14602`。
- 已具备：要求保留输入/版本、重复实验、阶段事件及区分环境缺依赖和缺外部权限。
- AQS：AQS-01 pass；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 pass。
- 原文证据：Q80-E1 `textbooks/v12/e02.md:243`；Q80-E2 `textbooks/v12/e02.md:77`；Q80-E3 `textbooks/v12/e04.md:164`；Q80-E4 `textbooks/v12/p02.md:125`。
- CR-Q80-02：缺偶发性与并发/时序/数据/依赖漂移之间的分层假设责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q80-03：没有先止损、收集最小安全证据、逐项缩小条件的调查顺序责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q80-04：缺一个本地不复现到找到条件的案例责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q80-06：无提高复现概率而不污染原现场的控制实验。责任：教材研发员；状态：open，待返修及原例复验。

### Q81　直接提示注入和来自网页、文档或工具结果的间接注入，有什么不同？

- 结论：`pass_within_content_review_scope`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:14752`。
- 已具备：以对话越权请求和PDF伪造授权区分直接/间接入口，解释文本指令与宿主权限、检测与隔离的不同职责，并区分提议越界率和实际越权率。
- AQS：AQS-01 pass；AQS-02 pass；AQS-03 pass；AQS-04 pass；AQS-05 pass；AQS-06 pass；AQS-07 pass；AQS-08 pass。
- 原文证据：Q81-E1 `textbooks/v12/n08-sandbox-security.md:7`；Q81-E2 `textbooks/v12/n08-sandbox-security.md:9`。
- AQS-01依据：明确直接来源于对话，间接来源于被处理资料。
- AQS-02依据：解释入口差异与权限不由文本文风产生；检测器与执行隔离职责不同。
- AQS-03依据：实际阻断点在可信身份下的工具资源/动作/预算和执行环境，而非仅引号包裹。
- AQS-04依据：对话要求读别账户、PDF伪造授权上传目录是两个可辨来源的反例，说明拒绝依据。
- AQS-05依据：用户也只能授权自己可控资源，检测漏过与模型可能被影响均不扩大执行权。
- AQS-06依据：分别记录提议越界和实际越权，防止“攻击未得逞=模型不受影响”的错误检验。

### Q82　Agent 为什么不能仅靠系统提示保证工具权限与数据安全？

- 结论：`pass_within_content_review_scope`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:14837`。
- 已具备：解释提示不能阻止读取服务返秘密或撤回已发写请求，给出看似合理的越权提议也应被拒绝的反例，定位读前/发前身份及对象核查。
- AQS：AQS-01 pass；AQS-02 pass；AQS-03 pass；AQS-04 pass；AQS-05 pass；AQS-06 pass；AQS-07 pass；AQS-08 pass。
- 原文证据：Q82-E1 `textbooks/v12/e03.md:3`；Q82-E2 `textbooks/v12/e03.md:20`；Q82-E3 `textbooks/v12/e03.md:36`；Q82-E4 `textbooks/v12/e03.md:40`。
- AQS-01依据：直接指出提示文本无法拦读取服务返回秘密，也无法撤回已发送操作。
- AQS-02依据：区分模型提议、外部资料、可信身份与对象授权；强调读前和发前两道控制点。
- AQS-03依据：由宿主取身份并按每次请求核对象/操作，不能使用模型提供tenant_id证明归属。
- AQS-04依据：完全合理的跨组织凭据读取仍拒绝；先读全部再让模型选会先泄露的反例解释结果。
- AQS-05依据：不能以注入检测成功为授权前提，内部工具请求同样要鉴权。
- AQS-06依据：改写攻击措辞后授权规则仍成立；最终拒答但资料已进入模型必须判读取边界失败。

### Q83　如何让工具执行权限与当前用户身份、资源归属和操作范围一致？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:14978`。
- 已具备：读前按宿主身份过滤，执行前比较任务对象，并说明撤权竞态与最终资源方能力令牌。
- AQS：AQS-01 pass；AQS-02 pass；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 pass。
- 原文证据：Q83-E1 `textbooks/v12/e03.md:36`；Q83-E2 `textbooks/v12/e03.md:40`；Q83-E3 `textbooks/v12/e03.md:42`。
- CR-Q83-03：缺身份→对象归属→具体动作→当前授权的完整校验输入输出责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q83-04：无正常调用、跨租户伪装及发送前撤权的同例轨迹责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q83-06：缺可证实拒绝无外部效果与合法仍可成功的测试。责任：教材研发员；状态：open，待返修及原例复验。

### Q84　高风险操作的人类确认应展示什么，才能构成有意义的批准？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:15082`。
- 已具备：批准内容包含工具、项目、正文、证据和效果数量，指纹绑定完整意图并说明规范化边界。
- AQS：AQS-01 pass；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 pass。
- 原文证据：Q84-E1 `textbooks/v12/e03.md:56`；Q84-E2 `textbooks/v12/e03.md:58`。
- CR-Q84-02：未完整解释批准主体、有效期、作用域及单次/原动作恢复的语义责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q84-03：无生成可审意图、取得批准、执行前比对的流程责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q84-04：没有用户所见与实际发送参数相同或变更须重批的例子责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q84-06：无参数篡改、到期与跨动作复用的验证。责任：教材研发员；状态：open，待返修及原例复验。

### Q85　如何防止确认后参数被修改，或一次确认被用于后续不同操作？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:15167`。
- 已具备：有意图指纹、正文/项目变更重批、时限与重复使用的测试，区分批准消费与原动作恢复。
- AQS：AQS-01 pass；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 pass；AQS-07 pass；AQS-08 not_met。
- 原文证据：Q85-E1 `textbooks/v12/e03.md:58`；Q85-E2 `textbooks/v12/e03.md:60`；Q85-E3 `textbooks/v12/e03.md:62`；Q85-E4 `textbooks/v12/e03.md:64`。
- CR-Q85-02：批准到期后原远端动作的允许行为边界在关键句中断责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q85-03：没有批准签发、原子消费及并发校验的一段完整执行路径责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q85-04：虽然有变更示例，缺原批准→并发提交/超时恢复→结果的完整轨迹责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q85-08：末段在“是否可以过期后”处中断，影响重要适用条件。责任：教材研发员；状态：open，待返修及原例复验。

### Q86　执行模型生成代码时，沙箱应限制哪些资源与外部访问？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:15290`。
- 已具备：覆盖CPU/墙钟、内存、进程、文件、网络、身份、输出以及容器/VM边界。
- AQS：AQS-01 pass；AQS-02 pass；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 not_met。
- 原文证据：Q86-E1 `textbooks/v12/n08-sandbox-security.md:24`；Q86-E2 `textbooks/v12/n08-sandbox-security.md:25`；Q86-E3 `textbooks/v12/n08-sandbox-security.md:29`；Q86-E4 `textbooks/v12/n08-sandbox-security.md:26`；Q86-E5 `textbooks/v12/n08-sandbox-security.md:27`；Q86-E6 `textbooks/v12/n08-sandbox-security.md:28`；Q86-E7 `textbooks/v12/n08-sandbox-security.md:31`；Q86-E8 `textbooks/v12/n08-sandbox-security.md:41`。
- CR-Q86-03：只给策略字段，未展示资源计划到实际隔离设置及终止/清理的完整路径责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q86-04：缺越界脚本在隔离层被阻断和正常脚本完成的例子责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q86-06：未给系统层实际读回/攻击反例检查与预期责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q86-08：执行合同末尾截断，声明不能替代可验证设置。责任：教材研发员；状态：open，待返修及原例复验。

### Q87　如何防止检索内容、日志和错误消息泄露跨租户资料或密钥？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:15498`。
- 已具备：区分读权限与内容转交授权，并要求检查模型输入、输出、工具载荷、日志四通道。
- AQS：AQS-01 pass；AQS-02 pass；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 not_met。
- 原文证据：Q87-E1 `textbooks/v12/e03.md:36`；Q87-E2 `textbooks/v12/e03.md:38`；Q87-E3 `textbooks/v12/e03.md:46`；Q87-E4 `textbooks/v12/e03.md:50`；Q87-E5 `textbooks/v12/e03.md:52`。
- CR-Q87-03：缺字段分类、最小化投影、敏感错误映射及审计访问的实施流程责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q87-04：无一个含令牌报告经四通道处理的完整例子责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q87-06：仅要求同时检查，未给种子秘密/跨租户输入的预期观测和漏检边界责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q87-08：OWASP链接段被截断。责任：教材研发员；状态：open，待返修及原例复验。

### Q88　外部工具声称操作成功，你如何核实真实状态？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:15649`。
- 已具备：要求匹配操作身份与内容指纹，强调下游去重和效果原子关联。
- AQS：AQS-01 pass；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 not_met。
- 原文证据：Q88-E1 `textbooks/v12/c01-control-loop.md:243`；Q88-E2 `textbooks/v12/c01-control-loop.md:245`；Q88-E3 `textbooks/v12/c01-control-loop.md:247`；Q88-E4 `textbooks/v12/c01-control-loop.md:260`；Q88-E5 `textbooks/v12/c03.md:174`。
- CR-Q88-02：只展示查询成功一支，未显示仍执行、未找到但不权威、冲突或不可查询时的决定责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q88-03：无完整核实步骤和等待/继续核对的分支责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q88-04：缺声称成功但事实未确认的完整轨迹责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q88-06：无伪造回执、同键异参和最终一致读不到的反例责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q88-08：两处来源链接截断。责任：教材研发员；状态：open，待返修及原例复验。

### Q89　多步骤任务部分成功后失败，如何设计补偿、恢复和用户告知？

- 结论：`pass_within_content_review_scope`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:15800`。
- 已具备：以预留→草稿→发布失败说明补偿是新动作，按依赖逆序处理；分别核对原效果与补偿未知状态，保留用户待办/责任且不把发起补偿当恢复成功。
- AQS：AQS-01 pass；AQS-02 pass；AQS-03 pass；AQS-04 pass；AQS-05 pass；AQS-06 pass；AQS-07 pass；AQS-08 pass。
- 原文证据：Q89-E1 `textbooks/v12/n09-runtime-delivery.md:24`；Q89-E2 `textbooks/v12/n09-runtime-delivery.md:26`；Q89-E3 `textbooks/v12/n09-runtime-delivery.md:30`。
- AQS-01依据：先说明补偿是新业务动作，不是数据库时光倒流。
- AQS-02依据：把原效果、补偿效果、依赖次序、未知状态和用户任务结果拆开。
- AQS-03依据：先判可撤/权限/窗口，按逆依赖撤草稿再释放预留，分别记原操作与补偿身份/回执。
- AQS-04依据：预留→草稿→发布失败有后续撤销次序；原unknown先查、补偿超时仍查原补偿动作。
- AQS-05依据：不能恢复排队位置或抹掉已读通知，持续失败交人工并保留责任。
- AQS-06依据：“发起补偿≠全部恢复”“原任务失败不因补偿成功变成功”提供具体状态反例。

### Q90　如何把安全反例纳入自动化回归，并验证修复没有破坏正常任务？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:15904`。
- 已具备：测试含正常批准、注入三入口、并发同动作/不同动作及原例与回归分离。
- AQS：AQS-01 pass；AQS-02 pass；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 not_met。
- 原文证据：Q90-E1 `textbooks/v12/e03.md:62`；Q90-E2 `textbooks/v12/e03.md:296`；Q90-E3 `textbooks/v12/e03.md:298`；Q90-E4 `textbooks/v12/e03.md:304`；Q90-E5 `textbooks/v12/e02.md:245`。
- CR-Q90-03：读者拿不到所指“开篇攻击文本”，无法按当前显示内容构造完整测试责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q90-04：四通道敏感值和跨租户具体夹具未展开责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q90-06：部分断言明确，但未知秘密覆盖边界句被截断，不构成全部题意所需安全回归责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q90-08：依赖未显示文本且E4句中断。责任：教材研发员；状态：open，待返修及原例复验。

### Q91　设计一个客服工单 Agent：如何确定自动处理范围、转人工条件及验收指标？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:16073`。
- 已具备：把客服请求分为四类，给出转人工合同、排队超时及正确解决/漏转/过转和人工负担指标。
- AQS：AQS-01 pass；AQS-02 pass；AQS-03 pass；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 pass。
- 原文证据：Q91-E1 `textbooks/v12/n10-evaluation-projects.md:7`；Q91-E2 `textbooks/v12/n10-evaluation-projects.md:11`；Q91-E3 `textbooks/v12/n10-evaluation-projects.md:13`。
- CR-Q91-04：缺同一真实形态客服任务从分类、自动步骤到转人工或完成的完整教学案例责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q91-06：没有将漏转、过转和错误动作变成明确样本及预期结果的演示。责任：教材研发员；状态：open，待返修及原例复验。

### Q92　设计一个企业知识 Agent：如何同时保证检索质量、权限和更新时效？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:16177`。
- 已具备：涵盖版本化摄取、分块证据完整性、读前权限过滤与公平检索比较。
- AQS：AQS-01 pass；AQS-02 pass；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 not_met。
- 原文证据：Q92-E1 `textbooks/v12/c02.md:10`；Q92-E2 `textbooks/v12/c02.md:14`；Q92-E3 `textbooks/v12/c02.md:16`；Q92-E4 `textbooks/v12/c02.md:238`；Q92-E5 `textbooks/v12/e03.md:36`。
- CR-Q92-03：缺增量发布/删除/撤权时仍保持当前快照及请求一致性的流程责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q92-04：没有一次政策更新与权限变更对查询结果的完整例子责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q92-06：未给质量、权限和新鲜度同时核验的输入及预期责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q92-08：过滤能力来源链接被截断。责任：教材研发员；状态：open，待返修及原例复验。

### Q93　设计一个长时间运行的研究 Agent：如何保存进度、取消任务和恢复执行？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:16337`。
- 已具备：任务/检查点字段、lease/epoch恢复与取消，明确不能重复检索或抹掉远端副作用。
- AQS：AQS-01 pass；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 not_met。
- 原文证据：Q93-E1 `textbooks/v12/n09-runtime-delivery.md:11`；Q93-E2 `textbooks/v12/n09-runtime-delivery.md:16`；Q93-E3 `textbooks/v12/n09-runtime-delivery.md:18`；Q93-E4 `textbooks/v12/n09-runtime-delivery.md:20`。
- CR-Q93-02：研究证据/依赖与重启后继续位置的对应关系未展开责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q93-03：取消后在途写核对和恢复/迁移路径在关键处中断责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q93-04：缺长研究任务暂停、变目标、取消后迟到的全时序责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q93-06：无重启不重做、迟到不提交和取消仍能核对的测试责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q93-08：最后段在“本地提交”处截断。责任：教材研发员；状态：open，待返修及原例复验。

### Q94　请求量增长十倍时，如何识别模型、工具、队列或存储中的主要瓶颈？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:16460`。
- 已具备：给开放/闭环负载差异、吞吐分母、接受/拒绝/在途及阶段资源指标。
- AQS：AQS-01 pass；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 pass。
- 原文证据：Q94-E1 `textbooks/v12/e05.md:136`；Q94-E2 `textbooks/v12/e05.md:138`；Q94-E3 `textbooks/v12/e05.md:142`；Q94-E4 `textbooks/v12/e04.md:177`。
- CR-Q94-02：没有模型、工具、队列、存储四种瓶颈的不同证据组合责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q94-03：缺观测→假设→最小变更→同负载验证的排查顺序责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q94-04：无十倍增长时某一实际瓶颈的示例及反证责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q94-06：没有瓶颈转移、负载发生器失真等验证预期。责任：教材研发员；状态：open，待返修及原例复验。

### Q95　如何设计并发限制、超时、退避和熔断，避免故障扩大？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:16592`。
- 已具备：包括有界队列、deadline、错误分类、指数退避与熔断状态及跨进程边界。
- AQS：AQS-01 pass；AQS-02 pass；AQS-03 pass；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 not_met。
- 原文证据：Q95-E1 `textbooks/v12/n09-runtime-delivery.md:34`；Q95-E2 `textbooks/v12/n09-runtime-delivery.md:36`；Q95-E3 `textbooks/v12/n09-runtime-delivery.md:38`；Q95-E4 `textbooks/v12/n09-runtime-delivery.md:40`。
- CR-Q95-04：缺在故障扩散下限流、超时、退避与熔断共同作用的完整事件例责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q95-06：无故障注入、半开仅一探测及旧代结果不得误关的可执行测试预期责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q95-08：离线例链接句被截断。责任：教材研发员；状态：open，待返修及原例复验。

### Q96　怎样分解一次任务的费用和时延，找到最值得优化的环节？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:16715`。
- 已具备：区分逻辑任务与物理尝试成本、金额与人工时间，说明等待时间及分位数不能相加。
- AQS：AQS-01 pass；AQS-02 pass；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 not_met。
- 原文证据：Q96-E1 `textbooks/v12/e05.md:10`；Q96-E2 `textbooks/v12/e05.md:12`；Q96-E3 `textbooks/v12/e05.md:30`；Q96-E4 `textbooks/v12/e05.md:32`；Q96-E5 `textbooks/v12/e05.md:142`。
- CR-Q96-03：没有把账目汇总为质量约束下优化优先级的具体计算步骤责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q96-04：缺带时间戳与费用的完整任务算例责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q96-06：未给重复计费、并行重叠与未知账单的核验样例责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q96-08：终态与响应耗时区别段在“速度数”处截断。责任：教材研发员；状态：open，待返修及原例复验。

### Q97　什么时候使用小模型路由、大模型升级或缓存？如何量化质量损失？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:16875`。
- 已具备：覆盖安全缓存键/不可复用副作用、小模型升级、自信错误与公平基线。
- AQS：AQS-01 pass；AQS-02 pass；AQS-03 pass；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 not_met。
- 原文证据：Q97-E1 `textbooks/v12/e05.md:148`；Q97-E2 `textbooks/v12/e05.md:150`；Q97-E3 `textbooks/v12/e05.md:184`；Q97-E4 `textbooks/v12/e05.md:188`；Q97-E5 `textbooks/v12/e05.md:190`。
- CR-Q97-04：缺一组接受、升级、错放和缓存失效的具体结果示例责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q97-06：没有展示质量损失如何相对于基线计算，缺错误路由与权限缓存反例的预期责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q97-08：跨用户缓存前提在句中截断。责任：教材研发员；状态：open，待返修及原例复验。

### Q98　从质量、成本和运维角度，怎样选择本地模型与托管 API？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:17026`。
- 已具备：比较本地/托管的运维、隐私、供应依赖以及每合格任务的完整成本口径。
- AQS：AQS-01 pass；AQS-02 pass；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 not_met。
- 原文证据：Q98-E1 `textbooks/v12/n09-runtime-delivery.md:56`；Q98-E2 `textbooks/v12/n09-runtime-delivery.md:58`。
- CR-Q98-03：缺从质量/数据硬约束到容量/总成本选择的步骤责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q98-04：没有相同负载与质量下本地/托管/混合的比较案例责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q98-06：无高峰、失效与低利用率条件的测试判断责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q98-08：混合路由预算句未完成。责任：教材研发员；状态：open，待返修及原例复验。

### Q99　请介绍一次实际 Agent 故障或失败案例：原因是什么，如何修复，怎样证明修复有效？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:17111`。
- 已具备：给本人贡献边界、事故时间线→根因→修复→原例/回归/监控框架，并允许如实标演练。
- AQS：AQS-01 pass；AQS-02 pass；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 pass。
- 原文证据：Q99-E1 `textbooks/v12/n10-evaluation-projects.md:58`。
- CR-Q99-03：只有字段式提示，缺如何把原始证据组织成可信面试回答与追问的流程责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q99-04：没有明确虚构/演练标签的完整示范，无法学习事实、假设、排除项与修复证据怎样连接责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q99-06：未展示一个修复后的原例和相邻合法行为如何被独立复验。责任：教材研发员；状态：open，待返修及原例复验。
- 本人真实项目/事故证据仍由学习者提供；上述内容缺口不是要求作者虚构个人经历。

### Q100　如果必须在两周内交付一个可用 Agent，你会怎样确定最小范围、基线、风险与上线条件？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:17177`。
- 已具备：有价值假设、最小有据路径、公平实验、风险硬门槛及灰度/回退策略。
- AQS：AQS-01 pass；AQS-02 pass；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 pass；AQS-07 pass；AQS-08 not_met。
- 原文证据：Q100-E1 `textbooks/v12/p01-mvp.md:3`；Q100-E2 `textbooks/v12/p01-mvp.md:9`；Q100-E3 `textbooks/v12/p01-mvp.md:19`；Q100-E4 `textbooks/v12/p01-mvp.md:51`；Q100-E5 `textbooks/v12/e02.md:245`；Q100-E6 `textbooks/v12/e04.md:32`；Q100-E7 `textbooks/v12/e04.md:140`；Q100-E8 `textbooks/v12/e04.md:142`。
- CR-Q100-03：题干强调两周，但未给关键依赖、减项顺序及时间内放行/延期的决定责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q100-04：没有两周计划遇到未解决关键风险后的完整案例责任：教材研发员；状态：open，待返修及原例复验。
- CR-Q100-08：ADR示例引子与灰度段不完整，散列材料未连成一个可执行交付方案。责任：教材研发员；状态：open，待返修及原例复验。

### M101　调用多个模型或工具API时，如何用Python asyncio组织并发？阻塞调用、无界任务创建和取消清理分别会导致什么问题，怎样用最小例定位？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:17430`。
- 已具备：介绍协程调度、阻塞影响与to_thread取消边界，指向离线例及其部分输出。
- AQS：AQS-01 pass；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 not_met。
- 原文证据：M101-E1 `textbooks/v12/n01-python-model-foundations.md:50`；M101-E2 `textbooks/v12/n01-python-model-foundations.md:136`。
- CR-M101-02：无界任务创建、背压和取消清理三个关键机制未完整显示责任：教材研发员；状态：open，待返修及原例复验。
- CR-M101-03：没有有界并发、timeout/finally和资源回收最小实现责任：教材研发员；状态：open，待返修及原例复验。
- CR-M101-04：缺阻塞、排队和取消的对照轨迹责任：教材研发员；状态：open，待返修及原例复验。
- CR-M101-06：输出说明不能代替各反例的预期及观察方法责任：教材研发员；状态：open，待返修及原例复验。
- CR-M101-08：两段分别在“CPU密集型”与“这”处中断。责任：教材研发员；状态：open，待返修及原例复验。

### M102　把请求状态放进Python列表或字典时，别名与浅拷贝会怎样污染另一个任务？请说明不可变容器的边界，并解释如何用装饰器封装工具日志而保持函数行为。

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:17527`。
- 已具备：浅拷贝嵌套列表别名的污染例子清楚。
- AQS：AQS-01 not_met；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 pass。
- 原文证据：M102-E1 `textbooks/v12/n01-python-model-foundations.md:9`。
- CR-M102-01：不可变容器边界与装饰器日志两个明确子问均未回答责任：教材研发员；状态：open，待返修及原例复验。
- CR-M102-02：缺深浅拷贝、嵌套可变值及同步/异步包装行为的关系责任：教材研发员；状态：open，待返修及原例复验。
- CR-M102-03：没有隔离状态与保持返回值/异常/签名的实现责任：教材研发员；状态：open，待返修及原例复验。
- CR-M102-04：缺不可变外层仍含可变列表及装饰器异常的示例责任：教材研发员；状态：open，待返修及原例复验。
- CR-M102-06：无两个请求互不污染和包装前后等价的测试。责任：教材研发员；状态：open，待返修及原例复验。

### M103　实现容量受限的LRU缓存，说明get/put复杂度，并给出容量为零、覆盖已有键和淘汰次序的测试。

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:17594`。
- 已具备：说明哈希表加双向链表、平均复杂度与条数/字节边界。
- AQS：AQS-01 pass；AQS-02 pass；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 pass。
- 原文证据：M103-E1 `textbooks/v12/n01-python-model-foundations.md:81`；M103-E2 `textbooks/v12/n01-python-model-foundations.md:140`。
- CR-M103-03：只告诉读者去实现，没有给题目要求的实现或关键操作完整伪代码责任：教材研发员；状态：open，待返修及原例复验。
- CR-M103-04：缺容量0、覆盖和淘汰的键顺序实例责任：教材研发员；状态：open，待返修及原例复验。
- CR-M103-06：要求提交测试却未提供输入序列与预期结果，不能当参考测试答案。责任：教材研发员；状态：open，待返修及原例复验。

### M104　Agent服务运行数小时后内存持续增长，但请求量平稳。如何区别对象仍被引用、缓存无界、待完成任务堆积与暂时内存峰值，并验证修复？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:17689`。
- 已具备：四类增长原因、热身快照、tracemalloc边界和保持吞吐的复验路径较完整。
- AQS：AQS-01 pass；AQS-02 pass；AQS-03 pass；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 not_met。
- 原文证据：M104-E1 `textbooks/v12/n09-runtime-delivery.md:46`；M104-E2 `textbooks/v12/n09-runtime-delivery.md:48`；M104-E3 `textbooks/v12/n09-runtime-delivery.md:50`；M104-E4 `textbooks/v12/n09-runtime-delivery.md:52`。
- CR-M104-04：有限例只描述三类对象，没有把悬挂任务积压与暂时峰值按同一时间线对照出观察结果责任：教材研发员；状态：open，待返修及原例复验。
- CR-M104-06：未完整展示修复前后读数或待完成任务不丢失的断言责任：教材研发员；状态：open，待返修及原例复验。
- CR-M104-08：关键结尾“不能以丢结果换低内存”语句在“低”处中断，需补全而非改写所有已有机制。责任：教材研发员；状态：open，待返修及原例复验。

### M105　余弦相似度、点积和欧氏距离如何计算？向量归一化会怎样改变它们的排序关系，零向量和维度不符怎样处理？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:17821`。
- 已具备：三种度量公式及零向量、维度、NaN拒绝清楚。
- AQS：AQS-01 not_met；AQS-02 not_met；AQS-03 pass；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 pass。
- 原文证据：M105-E1 `textbooks/v12/n05-retrieval-ingestion.md:49`。
- CR-M105-01：归一化如何改变排序关系这个核心子问没有回答责任：教材研发员；状态：open，待返修及原例复验。
- CR-M105-02：缺单位向量下L2平方与点积的关系及不归一化时范数效应责任：教材研发员；状态：open，待返修及原例复验。
- CR-M105-04：没有手算向量展示排序相同与反转责任：教材研发员；状态：open，待返修及原例复验。
- CR-M105-06：无零向量、错维及归一化前后排序测试。责任：教材研发员；状态：open，待返修及原例复验。

### M106　如何用精确向量检索建立基线，再比较HNSW与IVF的召回、内存、构建和查询代价？过滤条件加入后还需要怎样测量？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:17890`。
- 已具备：区分flat近邻真值与人工语义相关性，强调ANN有近似代价。
- AQS：AQS-01 not_met；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 not_met；AQS-06 not_met；AQS-07 pass；AQS-08 pass。
- 原文证据：M106-E1 `textbooks/v12/n05-retrieval-ingestion.md:65`。
- CR-M106-01：HNSW与IVF的比较及过滤影响未回答责任：教材研发员；状态：open，待返修及原例复验。
- CR-M106-02：缺图搜索/倒排聚类参数、构建/查询/内存机制责任：教材研发员；状态：open，待返修及原例复验。
- CR-M106-03：无固定向量与过滤集的对照实验步骤责任：教材研发员；状态：open，待返修及原例复验。
- CR-M106-04：缺同一查询在不同参数/过滤下的结果例责任：教材研发员；状态：open，待返修及原例复验。
- CR-M106-05：没有召回与资源的取舍责任：教材研发员；状态：open，待返修及原例复验。
- CR-M106-06：缺recall@k、时延、构建和过滤有效性测量口径。责任：教材研发员；状态：open，待返修及原例复验。

### M107　文档局部修改、删除或权限变化时，怎样增量更新分块和向量索引？如何检测漏删、重复块及新旧版本混用？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:17957`。
- 已具备：块身份绑定来源版本/位置/哈希，区分向量缓存与引用身份。
- AQS：AQS-01 not_met；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 pass。
- 原文证据：M107-E1 `textbooks/v12/n05-retrieval-ingestion.md:31`。
- CR-M107-01：更新、删除、撤权和漏删检测未完整回答责任：教材研发员；状态：open，待返修及原例复验。
- CR-M107-02：缺源manifest差分、墓碑、发布快照及缓存失效责任：教材研发员；状态：open，待返修及原例复验。
- CR-M107-03：无新增/变化/删除的逐步索引更新路径责任：教材研发员；状态：open，待返修及原例复验。
- CR-M107-04：缺同一文档修订与撤权后查询的完整例责任：教材研发员；状态：open，待返修及原例复验。
- CR-M107-06：未给重复块、旧引用、漏删和新旧混用的反例预期。责任：教材研发员；状态：open，待返修及原例复验。

### M108　包含扫描页、表格和跨页段落的PDF怎样进入RAG？如何保留页码与结构、测解析质量，并防止OCR错误被引用成原文事实？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:18026`。
- 已具备：解释PDF阅读顺序与扫描OCR的区别，要求逐页选解析策略。
- AQS：AQS-01 not_met；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 not_met。
- 原文证据：M108-E1 `textbooks/v12/n05-retrieval-ingestion.md:9`。
- CR-M108-01：页码结构、解析质量和OCR错误引用三个子问未回答责任：教材研发员；状态：open，待返修及原例复验。
- CR-M108-02：缺跨页表格/段落的来源身份与置信不等于事实责任：教材研发员；状态：open，待返修及原例复验。
- CR-M108-03：无像素/文本/OCR到保留页坐标及引用核验的完整管线责任：教材研发员；状态：open，待返修及原例复验。
- CR-M108-04：缺具体扫描页或跨页表格被误读的例子责任：教材研发员；状态：open，待返修及原例复验。
- CR-M108-06：缺字符/表格结构与引用定位评测责任：教材研发员；状态：open，待返修及原例复验。
- CR-M108-08：来源解释句截断。责任：教材研发员；状态：open，待返修及原例复验。

### M109　解释decoder-only Transformer从token到下一token分布的基本推理过程：因果注意力、多头、位置、前馈层各起什么作用？这与检索外部事实有什么区别？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:18095`。
- 已具备：介绍tokenizer、embedding、位置表示，声明decoder-only教学抽象。
- AQS：AQS-01 not_met；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 pass。
- 原文证据：M109-E1 `textbooks/v12/n01-python-model-foundations.md:114`。
- CR-M109-01：因果注意力、多头、前馈、下一token分布及外部检索区别均未回答责任：教材研发员；状态：open，待返修及原例复验。
- CR-M109-02：缺Q/K/V、因果掩码、层间更新与logits/softmax关系责任：教材研发员；状态：open，待返修及原例复验。
- CR-M109-03：没有从token到分布的完整推理路径责任：教材研发员；状态：open，待返修及原例复验。
- CR-M109-04：缺不能看到未来token或模型生成不等于读外部事实的示范责任：教材研发员；状态：open，待返修及原例复验。
- CR-M109-06：无区分自回归生成与外部检索的反例。责任：教材研发员；状态：open，待返修及原例复验。

### M110　提示模型返回JSON、使用JSON模式和按Schema约束生成分别能保证什么？遇到拒绝、截断、类型合法但语义错误时，应用怎样处理？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:18162`。
- 已具备：区分提示JSON、JSON模式和Schema约束，提醒厂商子集与完成状态。
- AQS：AQS-01 not_met；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 not_met。
- 原文证据：M110-E1 `textbooks/v12/n01-python-model-foundations.md:128`。
- CR-M110-01：拒绝、截断和合法但语义错误如何处理未回答责任：教材研发员；状态：open，待返修及原例复验。
- CR-M110-02：缺结构约束与业务/权限校验的边界责任：教材研发员；状态：open，待返修及原例复验。
- CR-M110-03：无按完成原因、解析、Schema、业务逐层处理流程责任：教材研发员；状态：open，待返修及原例复验。
- CR-M110-04：缺三类异常输出及明确处理结果责任：教材研发员；状态：open，待返修及原例复验。
- CR-M110-06：没有正常/拒绝/半截/错事实的验证样例责任：教材研发员；状态：open，待返修及原例复验。
- CR-M110-08：结构化输出来源链接被截断。责任：教材研发员；状态：open，待返修及原例复验。

### M111　同一Agent英语任务表现正常，中文或混合语言却失败，怎样分别检查分词/检索、提示、工具参数与评测样本，而不是直接换模型？

- 结论：`pass_within_content_review_scope`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:18229`。
- 已具备：从人工核等价的多语配对任务起步，按分词、检索、提示、工具及评价逐层诊断；以同政策不同订单参数和空检索两例给最小修正与跨语言回归，明确不能外推任意中文可靠。
- AQS：AQS-01 pass；AQS-02 pass；AQS-03 pass；AQS-04 pass；AQS-05 pass；AQS-06 pass；AQS-07 pass；AQS-08 pass。
- 原文证据：M111-E1 `textbooks/v12/n10-evaluation-projects.md:36`；M111-E2 `textbooks/v12/n10-evaluation-projects.md:42`；M111-E3 `textbooks/v12/n10-evaluation-projects.md:43`；M111-E4 `textbooks/v12/n10-evaluation-projects.md:44`；M111-E5 `textbooks/v12/n10-evaluation-projects.md:45`；M111-E6 `textbooks/v12/n10-evaluation-projects.md:46`；M111-E7 `textbooks/v12/n10-evaluation-projects.md:48`。
- AQS-01依据：明确先定位跨语言失效层，而非直接换模型。
- AQS-02依据：覆盖输入/分词、检索、提示、工具参数和评测偏差，并说明各层如何影响同一任务。
- AQS-03依据：先人工核等价配对，再逐层读观测，首偏离处最小修改，重测端到端及其他语言。
- AQS-04依据：同政策检索成功但订单ID被译成汉字先修参数；中文检索为空则不能把流畅回答当恢复。
- AQS-05依据：保护ID前导零、否定和业务约束，不以机器翻译或单例通过推任意语言可靠。
- AQS-06依据：配对任务包含长短句/否定/实体，观测召回、参数与评价标签，可推翻误归模型的解释。

### M112　用户在多轮任务中突然换话题，又用“继续刚才那个”返回，怎样识别任务切换、保存各自状态并澄清指代，防止旧任务动作误执行？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:18418`。
- 已具备：区分会话/任务身份，以T1/T2和歧义指代要求澄清并保留revision。
- AQS：AQS-01 pass；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 pass。
- 原文证据：M112-E1 `textbooks/v12/n02-context-memory-prompt.md:108`。
- CR-M112-02：缺切换时如何暂停在途动作、保存批准/预算和证据边界责任：教材研发员；状态：open，待返修及原例复验。
- CR-M112-03：无确定目标后恢复与旧worker迟到拒绝流程责任：教材研发员；状态：open，待返修及原例复验。
- CR-M112-04：没有澄清后恢复正确任务且旧动作不执行的完整时序责任：教材研发员；状态：open，待返修及原例复验。
- CR-M112-06：缺同名任务、模糊指代、取消旧任务与迟到结果的反例测试。责任：教材研发员；状态：open，待返修及原例复验。

### M113　部署本地推理服务时，怎样区分prefill与decode瓶颈，解释KV cache与批处理对吞吐、首token和尾延迟的影响，并设计公平比较而非先认定某框架更快？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:18485`。
- 已具备：解释prefill/decode、KV粗估、批处理取舍以及固定模型/硬件的公平指标。
- AQS：AQS-01 pass；AQS-02 pass；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 pass；AQS-08 not_met。
- 原文证据：M113-E1 `textbooks/v12/n09-runtime-delivery.md:62`；M113-E2 `textbooks/v12/n09-runtime-delivery.md:64`；M113-E3 `textbooks/v12/n09-runtime-delivery.md:68`；M113-E4 `textbooks/v12/n09-runtime-delivery.md:70`。
- CR-M113-03：未给用阶段计时/资源数据辨别真实瓶颈的具体实施步骤责任：教材研发员；状态：open，待返修及原例复验。
- CR-M113-04：缺一组长输入/长输出与并发变化的示例及判断责任：教材研发员；状态：open，待返修及原例复验。
- CR-M113-06：实验字段齐全但没有能区分prefill、decode、排队的样本和预期信号责任：教材研发员；状态：open，待返修及原例复验。
- CR-M113-08：KV缓存有效性与vLLM来源的句子截断，不能补猜未显示部分。责任：教材研发员；状态：open，待返修及原例复验。

### M114　面对客户工程团队，怎样交付一份可复现的Agent技术移交包，使对方能重建环境、运行评测、理解架构决策并报告失败？如何证明接手成功？

- 结论：`pass_within_content_review_scope`。当前答案：`sites/rolecraft/dist/learning-v13-data.js:18617`。
- 已具备：已覆盖冻结工件、环境/配置、架构决策、评测、运维与非作者干净环境接手；列正常/故障/恢复验证、缺依赖等诊断和修订后重新接收，明确无真实接手者不能称交接成功。
- AQS：AQS-01 pass；AQS-02 pass；AQS-03 pass；AQS-04 pass；AQS-05 pass；AQS-06 pass；AQS-07 pass；AQS-08 pass。
- 原文证据：M114-E1 `textbooks/v12/p02.md:16`；M114-E2 `textbooks/v12/p02.md:17`；M114-E3 `textbooks/v12/p02.md:121`；M114-E4 `textbooks/v12/p02.md:125`；M114-E5 `textbooks/v12/p01-mvp.md:51`；M114-E6 `textbooks/v12/e04.md:205`；M114-E7 `textbooks/v12/n10-evaluation-projects.md:64`；M114-E8 `textbooks/v12/n10-evaluation-projects.md:66`；M114-E9 `textbooks/v12/n10-evaluation-projects.md:68`；M114-E10 `textbooks/v12/n10-evaluation-projects.md:70`；M114-E11 `textbooks/v12/n10-evaluation-projects.md:72`。
- AQS-01依据：直接以接收者能独立重建、评测、解释架构及处理失败来定义接手成功。
- AQS-02依据：覆盖定义/工件、版本、环境、架构决策、运行证据、安全和运维责任。
- AQS-03依据：冻结包→非作者空环境重建→正常/故障/恢复验收→记录差异→作者修包→重新验收。
- AQS-04依据：无法启动、配置目标错、快照缺、外部服务没权限分别诊断并决定修订或保留缺证。
- AQS-05依据：不附密钥、不用口头补关键步骤后冒称独立复现，无真实接收者不称接手成功。
- AQS-06依据：验收含自选输入、失败例、架构说明、暂停恢复/回退，记录人/环境/版本/命令/输出。

### P01　Agent 与普通模型调用有什么区别？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/interview-prep-v1-prototype.html:44`。
- 已具备：指出目标、状态、观察、行动、授权和停止，并提醒固定流程足够时不升级。
- AQS：AQS-01 pass；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 not_met；AQS-08 pass。
- CR-P01-02：仅列要素，没有解释它们如何形成反馈与职责分离责任：教材研发员；状态：open，待返修及原例复验。
- CR-P01-03：“用一个任务串起”是写作指令，没有实际示范步骤责任：教材研发员；状态：open，待返修及原例复验。
- CR-P01-04：没有普通调用与Agent同任务对照责任：教材研发员；状态：open，待返修及原例复验。
- CR-P01-06：无误区反例及可观察区分责任：教材研发员；状态：open，待返修及原例复验。
- CR-P01-07：只有章节名，无当前版本、小节或主张出处绑定。责任：教材研发员；状态：open，待返修及原例复验。

### P02　工具调用超时，如何避免恢复时重复执行？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/interview-prep-v1-prototype.html:45`。
- 已具备：有超时不等于失败、稳定幂等键、待核对及回执丢失测试方向。
- AQS：AQS-01 pass；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 not_met；AQS-06 not_met；AQS-07 not_met；AQS-08 pass。
- CR-P02-02：缺逻辑动作/物理尝试、持久化窗口、下游原子性与并发的联系责任：教材研发员；状态：open，待返修及原例复验。
- CR-P02-03：无已成功/仍执行/确认未执行/未知/部分完成的恢复路径责任：教材研发员；状态：open，待返修及原例复验。
- CR-P02-04：没有操作成功但回执丢失的完整事件轨迹责任：教材研发员；状态：open，待返修及原例复验。
- CR-P02-05：未展开不支持幂等/查询及键过期时的代价与处理责任：教材研发员；状态：open，待返修及原例复验。
- CR-P02-06：只说验证对象数，未给并发恢复/断点输入与明确预期责任：教材研发员；状态：open，待返修及原例复验。
- CR-P02-07：没有教材版本/小节或原子性契约的精确来源。责任：教材研发员；状态：open，待返修及原例复验。

### P03　如何组织 Agent 的上下文和长期记忆？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/interview-prep-v1-prototype.html:46`。
- 已具备：区分当轮上下文、任务状态与长期记忆，保留来源/时间和撤回意识。
- AQS：AQS-01 pass；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 not_met；AQS-06 not_met；AQS-07 not_met；AQS-08 pass。
- CR-P03-02：缺各层权威性、写入判定和冲突/失效传播责任：教材研发员；状态：open，待返修及原例复验。
- CR-P03-03：没有选择信息、预算分配、写入与纠正的操作顺序责任：教材研发员；状态：open，待返修及原例复验。
- CR-P03-04：无跨任务记忆或旧授权错误的完整例子责任：教材研发员；状态：open，待返修及原例复验。
- CR-P03-05：未解释上下文成本与记忆污染取舍责任：教材研发员；状态：open，待返修及原例复验。
- CR-P03-06：缺过期或跨租户召回验证责任：教材研发员；状态：open，待返修及原例复验。
- CR-P03-07：章节标签不能支持具体主张。责任：教材研发员；状态：open，待返修及原例复验。

### P04　如何说明你为什么选择 RAG，而不是微调？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/interview-prep-v1-prototype.html:47`。
- 已具备：提醒按任务、更新/引用要求比较RAG与微调，也可组合并用固定测试集。
- AQS：AQS-01 pass；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 not_met；AQS-06 not_met；AQS-07 not_met；AQS-08 pass。
- CR-P04-02：没有解释检索提供外部证据与训练改变行为各自的机制责任：教材研发员；状态：open，待返修及原例复验。
- CR-P04-03：缺可执行选择步骤及数据/评价准备责任：教材研发员；状态：open，待返修及原例复验。
- CR-P04-04：无实际知识任务的方案对照责任：教材研发员；状态：open，待返修及原例复验。
- CR-P04-05：缺RAG召回漏失、微调成本/删除困难等具体边界责任：教材研发员；状态：open，待返修及原例复验。
- CR-P04-06：只列质量/成本/延迟，未给样本、指标与判据责任：教材研发员；状态：open，待返修及原例复验。
- CR-P04-07：无版本小节来源。责任：教材研发员；状态：open，待返修及原例复验。

### P05　介绍一个你做过的 Agent 项目，如何证明它有效？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/interview-prep-v1-prototype.html:48`。
- 已具备：强调真实问题、本人职责、失败改进与可复现证据，避免冒领团队贡献。
- AQS：AQS-01 pass；AQS-02 pass；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 not_met；AQS-08 pass。
- CR-P05-03：是表达提醒而非从原记录组织问题—动作—结果的完整方法责任：教材研发员；状态：open，待返修及原例复验。
- CR-P05-04：缺明确教学/虚构标注的完整项目陈述责任：教材研发员；状态：open，待返修及原例复验。
- CR-P05-06：没有如何核本人贡献、比较结果及反事实的证据核验路径责任：教材研发员；状态：open，待返修及原例复验。
- CR-P05-07：无来源绑定；真实个人经历仍须由学习者提供，不是本项不达标的理由。责任：教材研发员；状态：open，待返修及原例复验。
- 本人真实项目/事故证据仍由学习者提供；上述内容缺口不是要求作者虚构个人经历。

### P06　模型返回的 JSON 合法，为什么还不能直接执行？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/interview-prep-v1-prototype.html:49`。
- 已具备：指出JSON语法不能保证结构、业务、权限与来源，并保留可信执行层。
- AQS：AQS-01 pass；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 not_met；AQS-08 pass。
- CR-P06-02：没有解释各验证层检查什么对象和为何相互不能替代责任：教材研发员；状态：open，待返修及原例复验。
- CR-P06-03：缺输入示例、校验次序和错误处理责任：教材研发员；状态：open，待返修及原例复验。
- CR-P06-04：无语法合法但值/权限错误的完整例子责任：教材研发员；状态：open，待返修及原例复验。
- CR-P06-06：没有额外字段、引用错位及越权调用的具体测试责任：教材研发员；状态：open，待返修及原例复验。
- CR-P06-07：无对应教材小节和版本。责任：教材研发员；状态：open，待返修及原例复验。

### P07　如何评估一个 Agent 的改进是否真的有效？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/interview-prep-v1-prototype.html:50`。
- 已具备：提出同条件、全量失败记录、重复实验和边界回归。
- AQS：AQS-01 pass；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 not_met；AQS-06 not_met；AQS-07 not_met；AQS-08 pass。
- CR-P07-02：缺任务成功/正确停止/缺证分母以及配对、随机和评审偏差责任：教材研发员；状态：open，待返修及原例复验。
- CR-P07-03：没有实验设计到判断改进的步骤责任：教材研发员；状态：open，待返修及原例复验。
- CR-P07-04：无旧新结果计算与反例责任：教材研发员；状态：open，待返修及原例复验。
- CR-P07-05：未给质量提升但安全/成本退化时的取舍责任：教材研发员；状态：open，待返修及原例复验。
- CR-P07-06：测试建议没有明确输入与预期责任：教材研发员；状态：open，待返修及原例复验。
- CR-P07-07：无来源绑定。责任：教材研发员；状态：open，待返修及原例复验。

### P08　检索资料里出现要求执行工具的指令，你怎么处理？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/interview-prep-v1-prototype.html:51`。
- 已具备：把检索内容当资料，要求可信主体/对象/参数/许可，提出恶意文档测试。
- AQS：AQS-01 pass；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 pass；AQS-06 not_met；AQS-07 not_met；AQS-08 pass。
- CR-P08-02：没有解释读前过滤、投影与发前执行的不同边界责任：教材研发员；状态：open，待返修及原例复验。
- CR-P08-03：缺工具授权核验和拒绝的具体流程责任：教材研发员；状态：open，待返修及原例复验。
- CR-P08-04：没有恶意段落进入上下文到宿主拒绝的完整例子责任：教材研发员；状态：open，待返修及原例复验。
- CR-P08-06：未给正常/恶意对照及四通道观察预期责任：教材研发员；状态：open，待返修及原例复验。
- CR-P08-07：无版本小节来源。责任：教材研发员；状态：open，待返修及原例复验。

### P09　服务中断后，Agent 如何恢复到可靠的执行位置？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/interview-prep-v1-prototype.html:52`。
- 已具备：以持久化状态/事件恢复，先核在途动作，再核权限和预算。
- AQS：AQS-01 pass；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 not_met；AQS-06 not_met；AQS-07 not_met；AQS-08 pass。
- CR-P09-02：缺恢复身份、结果提交窗口、租约/并发与外部未知效果的机制责任：教材研发员；状态：open，待返修及原例复验。
- CR-P09-03：无检查点→账本→核对→继续/停止的明确状态步骤责任：教材研发员；状态：open，待返修及原例复验。
- CR-P09-04：没有崩溃点和恢复后事件轨迹责任：教材研发员；状态：open，待返修及原例复验。
- CR-P09-05：缺旧版本/过期授权/无查询能力时的边界处理责任：教材研发员；状态：open，待返修及原例复验。
- CR-P09-06：没有跨重启和双worker反例及预期责任：教材研发员；状态：open，待返修及原例复验。
- CR-P09-07：无教材版本/小节和来源绑定。责任：教材研发员；状态：open，待返修及原例复验。

### P10　项目成本增加时，你会如何定位并优化？

- 结论：`not_met`。当前答案：`sites/rolecraft/dist/interview-prep-v1-prototype.html:53`。
- 已具备：按完整任务费用、调用/上下文/重复工作定位，并要求质量成本时延同时验收。
- AQS：AQS-01 pass；AQS-02 not_met；AQS-03 not_met；AQS-04 not_met；AQS-05 not_met；AQS-06 not_met；AQS-07 not_met；AQS-08 pass。
- CR-P10-02：缺失败/未知计费、缓存命中有效性及队列/并行延迟关系责任：教材研发员；状态：open，待返修及原例复验。
- CR-P10-03：无账目归集、瓶颈确认和优化优先级步骤责任：教材研发员；状态：open，待返修及原例复验。
- CR-P10-04：没有可跟算的任务成本/时延案例责任：教材研发员；状态：open，待返修及原例复验。
- CR-P10-05：缺模型路由/缓存/流程简化的具体取舍责任：教材研发员；状态：open，待返修及原例复验。
- CR-P10-06：未给固定输入、基线、优化结果与失败信号责任：教材研发员；状态：open，待返修及原例复验。
- CR-P10-07：无当前教材版本和小节来源。责任：教材研发员；状态：open，待返修及原例复验。

## 交接与限制

作者只补公开题的当前参考材料；具体缺陷ID、原始题面、每项判定和来源位置保存在同名JSON。返修版本应逐题绑定来源、AQS位置及自查；审校员按原例复核，QA独立检内容和必要运行证据。13题已有可用内容无需机械扩写，但后续修改后须重新核对。

本轮没有改题库/教材/程序，没有应用或教材例执行，没有真实模型/外部业务调用。除注明的一手论文核查外，没有重新抓取全部旧外链。AI内容审校不等于真人专家、真实读者理解或实际学习成效。当前全部答案目标与完整产品目标均未达标。

领域自查：124个唯一ID、100/14/10分母、992项AQS记录完整；所有缺项都有具体说明与作者责任；同名JSON与逐条初判TSV一致；本岗只写`team/agent-interview-answer-content-review*`。
