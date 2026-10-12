# 100道Agent面试题对v10教材静态覆盖审校：1–50

日期：2026-10-11；责任：独立内容审校员A；状态：待QA独立复核。

依据team/interview100-coverage-product.md口径；跨章组合只使用正文已解释机制，不借外链/应用代码/历史报告补分；AI静态覆盖，不是学员答题、真实项目或就业效果证据。

统计：充分 24；部分 21；未覆盖 5。仅充分可算本批可建立完整回答；部分不算完整可答。

v10全部逐篇正文；重点全文读取00/c01-selection/c01-control-loop/c02/c03/f01/f02及产品、评测、安全、恢复、成本章对应段落。全正文检索MCP/A2A/Skills/ReAct/规划/重规划/Reflection/记忆/Few-shot/Embedding/RAG/微调/多跳/多查询。缺项所列为最接近段落，不表示该段可回答缺项。

## 逐题证据

### 1. 如何界定 LLM Agent？你会用哪些可观察行为区分它与普通聊天应用？

**充分**

支持要点：定义、目标/观察/工具交互，模型提议与宿主准入，观察驱动改变路径可用于区分聊天。

缺口：无本题关键内容缺口；不证明读者已掌握。

正文证据：

- [00-learning-route.md:3–7](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/00-learning-route.md:3)：“Agent 是一种围绕目标、依据新观察选择下一步，并通过工具与环境交互的软件系统。本书讨论基于大语言模型的 Agent：模型解释当前信息，提出下一步调查或候选结果；运行 Agent 的应用程序（下文称宿主程序）限定允许范围，决定能否执行，记录实际观察，再根据完成条件继续、等待或结束。它的价值来自把语言理解接到可核对的任”
- [c01-selection.md:9–19](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c01-selection.md:9)：““Agent”有不同用法。本文采用行为定义：普通程序由确定性代码决定路径；单次模型在已经组好的材料上生成一次候选；固定 workflow 允许模型完成局部语义任务，但步骤与分支由代码列出；动态 Agent 让模型依据观察提议新的调查动作，运行时仍掌握授权、执行和停止。这个 workflow/agent 控制权区分与 A”

### 2. 单次模型调用、固定 Workflow 和动态 Agent，分别适合什么业务条件？

**充分**

支持要点：材料一次齐备用单调用；可枚举分支用workflow；路径依赖新观察且难穷举才用动态Agent；比较相同目标。

缺口：无本题关键内容缺口。

正文证据：

- [c01-selection.md:9–31](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c01-selection.md:9)：““Agent”有不同用法。本文采用行为定义：普通程序由确定性代码决定路径；单次模型在已经组好的材料上生成一次候选；固定 workflow 允许模型完成局部语义任务，但步骤与分支由代码列出；动态 Agent 让模型依据观察提议新的调查动作，运行时仍掌握授权、执行和停止。这个 workflow/agent 控制权区分与 A”

### 3. 用户说“帮我做一个 Agent”时，你先澄清哪些需求，才能决定实现方案？

**充分**

支持要点：先问真实角色/任务、材料、困难、完成条件、权限和现有替代，再固定共同条件选型。

缺口：无本题关键内容缺口。

正文证据：

- [p01-discovery.md:9–35](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/p01-discovery.md:9)：““维护者需要更聪明的 Agent”已经把问题替换成方案。可研究的问题是：失败报告进入维护流程后，谁要根据它做什么决定，哪一步反复等待、复制、漏证或返工，什么结果才算可以交给下一位维护者。”
- [02-task-acceptance.md:7–41](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/02-task-acceptance.md:7)：“task: 从指定失败报告形成有据说明，经准确批准创建唯一缺陷工单”
- [c01-selection.md:22–31](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c01-selection.md:22)：“各方案应完成同一任务：取得相同输入、权限和验收条件，允许相同合理停止。完整接口类型后置于 [固定流程实作](c01-fixed-workflow.md)。模型配置是比较输入之一，不能让一个方案用更强模型、更多材料，然后把优势全部归于架构。”

### 4. 工具调用、状态维护、规划和长期记忆，哪些取决于具体场景，并非每个 Agent 都需要？

**部分**

支持要点：只读任务无需写工具，短时可重做任务可用内存；规划取决于依赖可表达和环境稳定。

缺口：没有长期记忆的适用条件及它与持久任务状态的明确区别，不能完整回答四类组件。

正文证据：

- [00-learning-route.md:23–23](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/00-learning-route.md:23)：“多 Agent 是可选的组织方式。可独立调查的子问题可能适合分工，但要加总预算、统一资料版本、处理交接失败，并保留唯一写入所有者。把一项任务交给多个模型，不会自动产生独立事实或更高正确率。只读任务也无需为配齐组件而增加写工具；短时、可重做的任务未必需要长期持久平台。”
- [c01-control-loop.md:808–817](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c01-control-loop.md:808)：“| 方案 | 适用条件 | 主要成本 | 升级或放弃条件 |”

### 5. 怎样判断增加自主决策带来的收益，足以抵消不确定性与运行成本？

**充分**

支持要点：冻结同条件任务和基线；按失败类别判断动态选路的收益；同时看合格率、错误完成、费用与等待，设升级/放弃条件。

缺口：无本题关键内容缺口；实际效益仍须实验。

正文证据：

- [c01-selection.md:43–59](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c01-selection.md:43)：“冻结相同任务集，分别标记材料完整、需动态调查、证据冲突；固定资料与工具版本、权限、验收器、模型快照与采样配置、总期限和资源上限。各方案可有不同路径，但不能偷偷取得测试集答案。记录每题的候选合格、完整目标合格、正确等待、错误完成、读/模型尝试、用量、端到端延迟和未知结果。”
- [p01-mvp.md:7–15](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/p01-mvp.md:7)：“实验先冻结任务集合、来源快照、权限、各方案配置、资源上限、人工后处理、判据、分配与停止规则。各方案取得同样必要信息及完成机会，输出按共同“有据初稿/准确批准/确认对象”的契约评价；资源的真实不同可以作为结果计量，但不能偷偷给候选更多资料和人力支持。”
- [e05.md:8–36](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/e05.md:8)：“一次逻辑任务可能有三次模型请求、两次读取、一次写后核对和十分钟人工确认。账本应把这些尝试归到同一 `run_id`，每次物理请求单独记录 `attempt_id`、配置/价格版本、用量、费用确认状态和时间。不能只计成功返回那次模型请求；超时请求可能已经计费，未决费用不能填零。”

### 6. 如果需求可以用 SQL、规则或传统搜索解决，你如何解释自己的技术选择？

**充分**

支持要点：普通程序已经满足目标则保留；稳定结构字段无需LLM；以同一任务、维护代价和真实替代写ADR，而非因技术流行选Agent。

缺口：无本题关键内容缺口；题目未要求SQL语法，故不因未教SQL扣分。

正文证据：

- [c01-selection.md:11–19](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c01-selection.md:11)：“| 方案 | 谁选下一步 | 同一缺陷任务中的可用实现 | 应放弃或升级的条件 |”
- [c01-selection.md:51–59](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c01-selection.md:51)：“**固定字段还是 Agent？**报告格式稳定、所需说明只有输入/预期/实际，维护者禁止推断根因。参考分析：普通程序加模板满足目标；LLM 和动态调查没有目标内收益。保留错误解析与缺项分支，不能因为不用模型就省掉验收。”
- [p01-mvp.md:49–57](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/p01-mvp.md:49)：“一份有效 ADR 包含问题、约束、实际备选、证据、选择、代价、反例和复查条件。它不只是“用了某框架”。下面是**暂定教学 ADR**，没有被真实试点认可。”

### 7. 单 Agent 多工具与多 Agent 协作，在架构上有什么区别？

**充分**

支持要点：一个运行时内多工具调用与可分工子任务/整合者不同；多Agent新增交接合同、版本与冲突检查、统一预算和唯一写所有者。

缺口：无本题关键内容缺口；不等于已学会具体多Agent框架。

正文证据：

- [c01-control-loop.md:26–34](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c01-control-loop.md:26)：“工具注册表先定义执行契约，再把可用工具说明给模型：”
- [c01-control-loop.md:48–58](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c01-control-loop.md:48)：“模型决定“下一步看哪个文件”“如何组织缺陷说明”，这些决定依赖语义判断。运行时决定工具是否注册、参数是否符合契约、身份能否访问对象、内容是否已获审批、现在是否还有预算。执行器决定如何隔离调用、施加超时、接收实际结果。验收器决定提交的产物是否满足本次目标。每一项都只有一个权威责任者；模型的文字不能覆盖策略或执行记录。”
- [c01-selection.md:33–41](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c01-selection.md:33)：“如果有两个可独立核对的证据子问题，例如实现控制路径与测试夹具生成方式，可以分别调查，再由一个分析整合者比对。但“两个模型都认为根因相同”不是独立事实：它们可能共享同一错误资料和推理偏差。”

### 8. 你会如何评估自研 Agent 运行时、开源框架和低代码平台？

**部分**

支持要点：提供最小方案、公平试验、ADR及恢复权限成本等评估维度。

缺口：没有自研、开源框架、低代码平台的能力边界与具体比较方法；通用ADR不能补成三类平台完整选型。

正文证据：

- [p01-mvp.md:49–57](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/p01-mvp.md:49)：“一份有效 ADR 包含问题、约束、实际备选、证据、选择、代价、反例和复查条件。它不只是“用了某框架”。下面是**暂定教学 ADR**，没有被真实试点认可。”
- [c01-control-loop.md:806–817](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c01-control-loop.md:806)：“| 方案 | 适用条件 | 主要成本 | 升级或放弃条件 |”

### 9. 从演示原型到可交付的 Agent 服务，需要补齐哪些工程能力？

**充分**

支持要点：正文全景连接需求/组件/运行/评价/安全/发布/经济/独立交付；具体状态、配置、回退与复現文档提供落地要求。

缺口：无本题关键内容缺口；真实生产能力尚需实践证据。

正文证据：

- [00-learning-route.md:46–81](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/00-learning-route.md:46)：“运行闭环回答一项任务怎样推进。工程全景回答怎样把这项能力设计、实现、验证、交付并持续改进；图中的分组和箭头表示工程关系，阅读仍按1至20进行。”
- [p01-mvp.md:63–65](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/p01-mvp.md:63)：“协作交接明确输入版本、产物、接收岗位和验收依据。产品负责人交任务契约和试点规则；课程或领域专家交专业判据；设计负责证据状态表达；工程交实现和自检；独立测试与评阅交实际结果。本文教学习者建立这条交接链，不以教材作者身份批准真实需求或专业规则。”
- [e04.md:136–193](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/e04.md:136)：“发布控制面使用 `PRECHECK → STAGED → CANARY → ACTIVE`，异常进入 `HOLD` 或 `DRAINING → ROLLBACK_READY → ROLLED_BACK`。这些是本章发布状态，不覆盖业务运行的 `WAIT_RESOLUTION` 等状态。”
- [p02.md:8–25](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/p02.md:8)：“作品文件和评价报告之间，需要一条能检查的关联链：目标与标准 → 冻结产物 → 环境和输入 → 运行记录 → 业务回执/内容判断 → 独立结论。报告写“全部通过”但找不到原记录，只有结论没有证明材料；只有原日志却不知道对应哪个版本与判据，也无法评阅。”

### 10. 请用一个真实项目说明：Agent 改善了谁的什么工作，你如何证明改善成立？

**部分**

支持要点：教真实问题研究、同条件价值实验和真实使用反馈，说明如何证明改善。

缺口：教材构造例不能生成个人真实项目经历；尚需本人项目、角色、效果原始证据。

正文证据：

- [p01-discovery.md:23–35](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/p01-discovery.md:23)：“这些材料能演示推理，不能进入“真实用户验证通过”的分子。正式 `ProblemEvidence` 保存来源类型、采集时间、任务场景、参与者角色、允许使用范围、原记录引用、直接观察、解释、反例和未确认项。资料脱敏后保留可核来源，敏感原记录按实际授权隔离；不能为了公开作业把用户私有仓库或录音放进公开附件。”
- [p01-mvp.md:7–15](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/p01-mvp.md:7)：“实验先冻结任务集合、来源快照、权限、各方案配置、资源上限、人工后处理、判据、分配与停止规则。各方案取得同样必要信息及完成机会，输出按共同“有据初稿/准确批准/确认对象”的契约评价；资源的真实不同可以作为结果计量，但不能偷偷给候选更多资料和人力支持。”
- [p01-mvp.md:67–88](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/p01-mvp.md:67)：“试点前约定采用观察：符合任务条件的人是否进入流程，在哪里退出，是否回到原方式，为什么返工，有没有未经允许的使用。满意话、实际行为和任务结果分别记录。用户仍把材料复制到另一个系统，可能是集成成本、资料权限、审阅信任或功能无价值，不能默认只改按钮样式。”

### 11. ReAct 如何组织推理、行动与观察？它与一次性生成计划有什么不同？

**部分**

支持要点：开篇说明推理/动作交错、环境信息更新，给观察驱动改查轨迹；后文有先规划后执行的适用条件。

缺口：ReAct仅短段提及，没有把其推理—行动—观察协议与一次性计划作完整结构对比或失败模式展开。

正文证据：

- [00-learning-route.md:33–43](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/00-learning-route.md:33)：“上下文是模型本次可见的信息，事实记录保存的是已有观察、动作与未决事项。模型可以从工具结果调整调查方向，不能凭摘要覆盖事实。ReAct研究展示了任务动作与推理交错、从环境追加信息的机制；本书把授权、记录和停止另交运行时兑现，不从该研究推导任何供应商或业务保证。[ReAct](https://arxiv.org/abs/2”
- [c01-control-loop.md:808–817](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c01-control-loop.md:808)：“| 方案 | 适用条件 | 主要成本 | 升级或放弃条件 |”

### 12. ReAct、Plan-and-Execute 和固定状态机，你会如何按任务特征选择？

**部分**

支持要点：对短反馈、先规划后执行局部重规划、固定workflow的任务条件与成本有比较。

缺口：未完整讲ReAct与Plan-and-Execute各自运行机制；读者需外部知识才能把名称对应到选择逻辑。

正文证据：

- [c01-control-loop.md:808–817](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c01-control-loop.md:808)：“| 方案 | 适用条件 | 主要成本 | 升级或放弃条件 |”
- [c01-selection.md:9–19](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c01-selection.md:9)：““Agent”有不同用法。本文采用行为定义：普通程序由确定性代码决定路径；单次模型在已经组好的材料上生成一次候选；固定 workflow 允许模型完成局部语义任务，但步骤与分支由代码列出；动态 Agent 让模型依据观察提议新的调查动作，运行时仍掌握授权、执行和停止。这个 workflow/agent 控制权区分与 A”

### 13. 不依赖现成框架，手写一个最小 Agent 控制循环，需要哪些状态和分支？

**充分**

支持要点：State/Context、TOOLS/FINAL/ASK_INPUT、准入执行、验收、等待/停止、预算及恢复有完整骨架与明确契约。

缺口：无本题关键内容缺口；伪代码未运行，不授实现熟练度。

正文证据：

- [c01-control-loop.md:36–58](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c01-control-loop.md:36)：“一轮决策可以写成：”
- [c01-control-loop.md:297–366](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c01-control-loop.md:297)：“下面的伪代码选择**单运行、单推进者、串行执行工具**作为基线。并发工具将在下一节按契约扩展。模型、数据库、工单服务和策略服务都通过接口接入；不假定它们共享事务。本篇伪代码未运行，实际外部服务契约也未实测。”
- [c01-control-loop.md:786–804](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c01-control-loop.md:786)：“模型最终回答是一个候选；运行时终态是一次已提交的决定；业务成功是有证据支持的结果。这三者不相等。”

### 14. 如何区分“模型宣布完成”和“任务实际上完成”？

**充分**

支持要点：模型最终答复只是候选；独立验收检查指定证据、批准和外部回执；同版本无未决动作才提交完成。

缺口：无本题关键内容缺口。

正文证据：

- [c01-control-loop.md:17–24](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c01-control-loop.md:17)：“本次验收需要同时满足：”
- [c01-control-loop.md:731–745](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c01-control-loop.md:731)：“假设第 4 步读取成功后，模型直接输出“已经创建工单，问题定位完成”。运行时不会通过搜索“完成”二字停止：”
- [c01-control-loop.md:786–804](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c01-control-loop.md:786)：“模型最终回答是一个候选；运行时终态是一次已提交的决定；业务成功是有证据支持的结果。这三者不相等。”

### 15. 怎样设置最大步数、时间和费用限制，同时避免过早中止任务？

**充分**

支持要点：分开模型/逻辑动作/工具尝试/恢复次数/绝对期限/费用；预留与实际结算跨暂停保持；恢复有独立额度及等待条件。

缺口：无本题关键内容缺口；具体额度须按实际任务决定。

正文证据：

- [c01-control-loop.md:278–295](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c01-control-loop.md:278)：“暂停后恢复的是同一个运行和预算账本。预算至少拆成：”
- [c01-control-loop.md:786–804](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c01-control-loop.md:786)：“模型最终回答是一个候选；运行时终态是一次已提交的决定；业务成功是有证据支持的结果。这三者不相等。”

### 16. 面对带前置依赖的复杂任务，如何生成和验证可执行计划？

**部分**

支持要点：有依赖无环检查、前置动作成功后可执行波次、资源/授权/写冲突验证。

缺口：没有复杂任务计划生成算法、任务分解及计划完整性验证教学；执行前检查不能覆盖生成问题。

正文证据：

- [c01-control-loop.md:532–536](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c01-control-loop.md:532)：“`preflight_batch` 必须逐项解析工具名和参数、拒绝未知字段或错误类型、核对访问对象、验证依赖构成无环图，并限制批次大小。工具 schema 只能证明结构合法，不能证明项目 ID 属于当前身份或正文获准。语义授权由策略判定，槽位与参数一致性由意图提交事务判断。工具注册表及当前目标之外的调用，作为拒绝反馈提”
- [c01-control-loop.md:690–707](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c01-control-loop.md:690)：“上面的基线串行执行，但不能据此推断并发一定危险。读取固定修订的源文件与读取已有报告，彼此没有数据依赖，允许并发；“根据报告生成正文”依赖报告；创建工单依赖最终正文和批准，不能提前并行。”
- [c01-control-loop.md:812–812](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c01-control-loop.md:812)：“| 先规划再执行，局部重规划 | 子任务依赖可表达，观察不会频繁使计划失效 | 维护计划版本、依赖与失效传播；旧计划容易过期 | 环境变更频繁、计划每步被推翻时改用短反馈步；关键动作前仍校验当前事实 |”

### 17. 什么信号应触发 Replanning？如何避免反复改计划却没有实际进展？

**部分**

支持要点：观察频繁推翻计划时切短反馈；保留版本/失效传播；拒绝反馈和上限防无限修正。

缺口：缺重规划触发分类、失效节点保留/撤销算法及进展指标，不足以回答反复重规划控制。

正文证据：

- [c01-control-loop.md:812–817](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c01-control-loop.md:812)：“| 先规划再执行，局部重规划 | 子任务依赖可表达，观察不会频繁使计划失效 | 维护计划版本、依赖与失效传播；旧计划容易过期 | 环境变更频繁、计划每步被推翻时改用短反馈步；关键动作前仍校验当前事实 |”
- [c01-control-loop.md:731–745](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c01-control-loop.md:731)：“假设第 4 步读取成功后，模型直接输出“已经创建工单，问题定位完成”。运行时不会通过搜索“完成”二字停止：”

### 18. Reflection 或自我纠错在哪些情况下有帮助，又可能怎样放大原始错误？

**部分**

支持要点：事实错位可反馈具体差异后受限修正；不能无限用同一模型评价自己的结论；独立评估器偏差需校准。

缺口：没有Reflection机制、何时增益及错误自强化的系统解释/对比实验，不能靠运行时验收代替反思教学。

正文证据：

- [f02.md:188–196](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/f02.md:188)：“**格式完整，事实错位。**模型输出 `actual=True`，JSON 与 Schema 都合法，却与报告矛盾。闸门返回 `FACT_MISMATCH(actual)`，可在剩余预算内把具体差异反馈给模型。不能把冲突响应修改成报告值后声称模型原来正确；修正产物应记录其来源。”
- [c01-control-loop.md:24–24](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c01-control-loop.md:24)：“模型可能对根因作出错误分析；验收器也可能无法确定某个推断是否真实。循环不能凭这些不确定内容创建一个“验证通过”的事实。可确定部分用确定性规则检查，例如修订号、证据标识、审批指纹和回执绑定；专业判断可以由人工或另外的评估器完成。自动验收失败后允许修正，但不能无限用同一个模型重新评价自己的同一结论。”
- [e02.md:231–239](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/e02.md:231)：“将语义评分交给另一个模型可以降低初筛成本，却会把评分器自身的偏差引入版本选择。MT-Bench/Chatbot Arena 的原始研究讨论位置、冗长、自我偏好和推理能力等限制；其在特定基准上的结果不能保证你的工单根因评分正确。[Zheng 等：Judging LLM-as-a-Judge，2023，访问于 2026-1”

### 19. 工具结果与原计划冲突时，运行时应该如何更新状态和后续决策？

**充分**

支持要点：工具观察与计划分开提交，逐动作保留部分效果；FinishPlan合并实际观察，验收拒绝写入下轮上下文，未知先核对不盲重做。

缺口：无本题关键内容缺口；此题按当前执行计划/动作冲突解释，不额外要求未提及的规划算法。

正文证据：

- [c01-control-loop.md:237–260](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c01-control-loop.md:237)：“在 `TOOLS` 分支，先对整批提议预检，再发出任何调用：检查工具、参数、对象授权、调用 ID 唯一性、依赖合法性和批次规模。预检发现错误，整批暂不执行，给模型结构化反馈。对于一批需要审批的合法动作，则先持久化计划，再等待批准；不是因为未批准就丢掉计划、重问模型。”
- [c01-control-loop.md:343–364](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c01-control-loop.md:343)：“| 事件 | 事务必须完成的工作 | 拒绝或并发语义 |”
- [c01-control-loop.md:731–745](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c01-control-loop.md:731)：“假设第 4 步读取成功后，模型直接输出“已经创建工单，问题定位完成”。运行时不会通过搜索“完成”二字停止：”

### 20. 如何识别和处理重复动作、无效搜索以及循环卡死？

**充分**

支持要点：唯一槽位/指纹识别重复写动作，返回已有回执；无新信息补来源/澄清/停止；具体失败反馈、拒绝计数及各类预算终止卡死。

缺口：无本题关键内容缺口；未授通用自动检测所有循环的保证。

正文证据：

- [c01-control-loop.md:175–187](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c01-control-loop.md:175)：“不能简单用参数哈希作为 `action_id`。相同参数可能代表用户真正希望创建两条相同工单，也可能代表同一操作重试。AWS 的幂等 API 设计同样强调调用者表达意图的请求 ID，并处理同一个 ID 的参数冲突。这里采用相同原则，具体槽位规则由本次业务目标定义。[AWS：Making retries safe wit”
- [00-learning-route.md:42–42](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/00-learning-route.md:42)：““继续”还须有目标内理由与资源额度。没有新信息时应补来源、请求澄清或合理停止；循环不是用重复请求掩盖未知的许可。第13篇 [固定流程](c01-fixed-workflow.md)使用相同组件与边界，但合法路径由代码规定；第14篇 [完整动态循环](c01-control-loop.md)解释观察驱动的控制与恢复。版本”
- [c01-control-loop.md:731–745](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c01-control-loop.md:731)：“假设第 4 步读取成功后，模型直接输出“已经创建工单，问题定位完成”。运行时不会通过搜索“完成”二字停止：”
- [c01-control-loop.md:278–295](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c01-control-loop.md:278)：“暂停后恢复的是同一个运行和预算账本。预算至少拆成：”

### 21. Function Calling 从模型输出到函数真正执行，中间经过哪些步骤？

**充分**

支持要点：模型调用只为提议；完整协议响应、工具/参数预检、可信授权/批准/预算、意图及尝试提交后执行，结果关联原调用。

缺口：无本题关键内容缺口；题目未要求特定SDK消息格式。

正文证据：

- [c03.md:8–24](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c03.md:8)：“模型返回 `create_issue`、参数和 `tool_call_id`，只是本次协议中的建议。执行器才调用业务实现，结果必须回传到同一次调用。OpenAI 的函数调用流程也明确区分模型返回调用、应用执行以及回传结果；其具体消息格式应由协议适配器转换成本文内部类型，不把内部 `Outcome` 当 SDK 返回。[”
- [c01-control-loop.md:219–239](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c01-control-loop.md:219)：“运行时在流式过程中可以显示文本，也可以增量拼接参数；默认不能提前执行副作用。一个看上去完整的 JSON 对象仍可能只是半轮响应：后续会追加另一动作、修正参数或以错误结束。本文规定适配器只在收到协议规定的完整响应结束信号、所有调用均完整且结束原因允许消费时，返回 `CompleteResponse`。”
- [c01-control-loop.md:183–211](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c01-control-loop.md:183)：“首次合法提议创建槽位记录和 `action_id`。后续同槽位同指纹提议映射到已有动作，不创建新的工单；同槽位不同指纹返回 `INTENT_CONFLICT`，不能静默替换已经审批、在途或已完成的动作。若用户确实要求另一条工单，必须以新的目标版本或明确的新槽位表达。数据库对槽位实施唯一约束，不能仅靠应用先查后写。”

### 22. 如何设计工具名称、描述和参数 Schema，减少错选工具与错误参数？

**部分**

支持要点：输入字段最小合同、未知字段拒绝、参数类型/大小/对象约束、工具注册范围和恢复合同。

缺口：缺名称与描述的辨识性设计、相近工具消歧及错选率验证，Schema校验仅答一部分。

正文证据：

- [c03.md:8–14](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c03.md:8)：“模型返回 `create_issue`、参数和 `tool_call_id`，只是本次协议中的建议。执行器才调用业务实现，结果必须回传到同一次调用。OpenAI 的函数调用流程也明确区分模型返回调用、应用执行以及回传结果；其具体消息格式应由协议适配器转换成本文内部类型，不把内部 `Outcome` 当 SDK 返回。[”
- [c01-control-loop.md:26–34](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c01-control-loop.md:26)：“工具注册表先定义执行契约，再把可用工具说明给模型：”

### 23. 工具参数的 JSON 格式正确，为什么不等于调用安全、业务合法？

**充分**

支持要点：结构合法不代表对象属于身份、不代表准确批准与业务事实成立；运行时注入身份、逐请求准入。

缺口：无本题关键内容缺口。

正文证据：

- [c03.md:8–14](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c03.md:8)：“模型返回 `create_issue`、参数和 `tool_call_id`，只是本次协议中的建议。执行器才调用业务实现，结果必须回传到同一次调用。OpenAI 的函数调用流程也明确区分模型返回调用、应用执行以及回传结果；其具体消息格式应由协议适配器转换成本文内部类型，不把内部 `Outcome` 当 SDK 返回。[”
- [f02.md:18–24](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/f02.md:18)：“本篇候选字段故意区分观察与推断：`failed_test/expected/actual` 必须来自报告；`source_refs` 只能引用本轮可见证据；`hypothesis` 是待核根因，允许为 `null`；`missing_fields` 表达哪些事实不能确定。模型不得用一段自然语言同时承担事实、批准和执行结”
- [e03.md:34–42](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/e03.md:34)：“第一道闸检查“这个身份可否读这个对象”。存储层或读取服务按宿主身份过滤，再返回内容；不能先检索全部组织，放进上下文后让模型选择自己的资料。即使最终答复拒绝，跨组织内容已经进入模型输入，读取边界仍失败。”

### 24. 工具数量达到数百个时，怎样降低选择错误和上下文负担？

**未覆盖**

支持要点：最接近的是三个教学工具的注册表与禁止任意执行器；没有百工具选择教学。

缺口：缺工具发现/检索/路由/渐进暴露、工具集消歧和上下文控制。

正文证据：

- [c01-control-loop.md:26–34](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c01-control-loop.md:26)：“工具注册表先定义执行契约，再把可用工具说明给模型：”

### 25. 工具超时、限流、参数错误和业务拒绝，应采用同一种重试策略吗？

**充分**

支持要点：超时写效果未知先查询；只读可有界重读；参数失败可反馈修正；限流需区分额度；凭据或权限拒绝不能盲重试；统一层退避和预算。

缺口：无本题关键内容缺口。

正文证据：

- [f01.md:9–15](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/f01.md:9)：“`{"path": ["src/refund.py"]}` 是合法 JSON，但不是本接口合法输入。`str(path)` 会把类型错误转为另一个资源名，随后得到“文件不存在”，把错误归因从调用者参数移到仓库。先检查类型，再检查范围；不要用自动转换掩盖输入错误。空字符串、缺字段和未知字段也分别处理，防止调用者悄悄塞入 ”
- [f02.md:188–196](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/f02.md:188)：“**格式完整，事实错位。**模型输出 `actual=True`，JSON 与 Schema 都合法，却与报告矛盾。闸门返回 `FACT_MISMATCH(actual)`，可在剩余预算内把具体差异反馈给模型。不能把冲突响应修改成报告值后声称模型原来正确；修正产物应记录其来源。”
- [c01-control-loop.md:243–258](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c01-control-loop.md:243)：“恢复顺序必须把事实核对放在新决策之前。模型不知道一个丢失回执的远端调用到底有没有成功。重新问模型，最多产生另一个看上去合理的提议，不能消除执行不确定性。”
- [c01-control-loop.md:698–698](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c01-control-loop.md:698)：“并行化减少等待链长度，同时提高瞬时请求压力、费用预留和失败组合数量。只有在轨迹证明工具等待构成主要延迟、工具契约能表达独立性时才值得升级。否则串行基线更容易审查恢复行为。无论是否并发，重试应由一层拥有：执行器内部若重试，必须把实际尝试暴露给账本；调度器和 SDK 各自独立重试会使实际请求数超过预算。退避与抖动用于减轻相”

### 26. 对可能产生外部副作用的工具，如何防止重试导致重复执行？

**充分**

支持要点：稳定逻辑动作ID和槽位、原参数/批准/下游键持久化；写后超时先核对，契约有效期内同键重发；本地去重不能替代下游原子效果绑定。

缺口：无本题关键内容缺口。

正文证据：

- [c03.md:16–24](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c03.md:16)：“`tool_call_id` 只关联一轮模型消息；`action_id` 是逻辑意图；`attempt_id` 是一次物理发送。模型第二次提出相同内容，会有新协议 ID，却应绑定同一动作。不能拿参数哈希直接当逻辑身份：两个真正不同的用户意图也可能有相同参数。本任务用唯一槽位表达“一条缺陷工单”：”
- [c01-control-loop.md:243–260](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c01-control-loop.md:243)：“恢复顺序必须把事实核对放在新决策之前。模型不知道一个丢失回执的远端调用到底有没有成功。重新问模型，最多产生另一个看上去合理的提议，不能消除执行不确定性。”
- [c01-control-loop.md:747–766](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c01-control-loop.md:747)：“沿用正常轨迹的第 7 步，改变后续时序：”

### 27. MCP 解决哪一层集成问题？它与模型的 Tool Calling 有什么关系？

**未覆盖**

支持要点：仅Function Calling的模型提议/宿主执行流程可作邻近背景。

缺口：无MCP架构或集成层说明，不能回答MCP与Tool Calling关系。

正文证据：

- [c03.md:8–14](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c03.md:8)：“模型返回 `create_issue`、参数和 `tool_call_id`，只是本次协议中的建议。执行器才调用业务实现，结果必须回传到同一次调用。OpenAI 的函数调用流程也明确区分模型返回调用、应用执行以及回传结果；其具体消息格式应由协议适配器转换成本文内部类型，不把内部 `Outcome` 当 SDK 返回。[”

### 28. MCP 中的 Tools、Resources 和 Prompts，各自适合表达什么能力？

**未覆盖**

支持要点：工具执行合同是邻近背景，不是MCP三类原语教学。

缺口：未讲MCP Tools、Resources、Prompts及适用能力。

正文证据：

- [c01-control-loop.md:26–34](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c01-control-loop.md:26)：“工具注册表先定义执行契约，再把可用工具说明给模型：”

### 29. 接入第三方工具服务时，如何处理认证、权限、版本与错误契约？

**部分**

支持要点：可信身份/对象权限、固定服务和TLS、版本固定、协议与错误分类、工具契约边界有教学。

缺口：生产认证明确不包含；未教第三方认证生命周期、凭据委派和完整接入契约验证，四子问不能全部回答。

正文证据：

- [f01.md:3–15](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/f01.md:3)：“把 HTTP 接口接进 Agent 前，应先建立一个确定性边界：输入符合契约且当前身份有权访问，才发请求；收到完整响应且对象、版本、内容一致，才产出可引用的结果；其余分支返回具体错误或未知状态。模型不能修补这个边界的事实缺口。这里选择一个只读接口实现它：读取 `repo@8e12` 下的文件，为已有失败报告 `test”
- [c01-control-loop.md:26–34](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c01-control-loop.md:26)：“工具注册表先定义执行契约，再把可用工具说明给模型：”
- [f02.md:188–196](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/f02.md:188)：“**格式完整，事实错位。**模型输出 `actual=True`，JSON 与 Schema 都合法，却与报告矛盾。闸门返回 `FACT_MISMATCH(actual)`，可在剩余预算内把具体差异反馈给模型。不能把冲突响应修改成报告值后声称模型原来正确；修正产物应记录其来源。”

### 30. Tool Calling、MCP、Agent Skills（可复用技能说明与资源包）和 A2A，分别解决什么问题？

**部分**

支持要点：Tool Calling有实质教学，可回答模型提出调用、宿主执行和回传结果这一子问。

缺口：MCP、Skills和A2A均无对应教学，无法完成四者职责对比。QA反例复核后按部分子问有覆盖归部分。

正文证据：

- [c03.md:8–14](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c03.md:8)：“模型返回 `create_issue`、参数和 `tool_call_id`，只是本次协议中的建议。执行器才调用业务实现，结果必须回传到同一次调用。OpenAI 的函数调用流程也明确区分模型返回调用、应用执行以及回传结果；其具体消息格式应由协议适配器转换成本文内部类型，不把内部 `Outcome` 当 SDK 返回。[”

### 31. 会话历史、任务工作状态和长期记忆有什么不同？应分别存储什么？

**部分**

支持要点：State是授权恢复依据，Context是当前投影，聊天文本不能替代动作账本；说明保存目标/证据/未决事项。

缺口：未定义长期记忆、跨会话用途及它和会话历史的存储边界。

正文证据：

- [c01-control-loop.md:50–58](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c01-control-loop.md:50)：“这里最重要的分离是 `State` 与 `Context`。”
- [f02.md:8–16](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/f02.md:8)：“权威状态保存可信目标、当前身份、资料版本、已经读取的证据和待处理事项。模型输入是本轮投影：它包含对当前判断足够的证据，却不承担身份授权。令模型输出一个 `tenant_id` 或 `approved=true` 并不能改变状态；工具层仍从可信运行时取身份与批准。”

### 32. 上下文不足时，如何在截断、摘要、检索和外部状态之间选择？

**充分**

支持要点：保留权威外部状态和不可变原文；探索日志可压缩；输入放不下先检索片段/拆分，拒绝静默截断，并记录上下文版本。

缺口：无本题关键内容缺口。

正文证据：

- [f02.md:8–16](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/f02.md:8)：“权威状态保存可信目标、当前身份、资料版本、已经读取的证据和待处理事项。模型输入是本轮投影：它包含对当前判断足够的证据，却不承担身份授权。令模型输出一个 `tenant_id` 或 `approved=true` 并不能改变状态；工具层仍从可信运行时取身份与批准。”
- [c01-control-loop.md:50–58](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c01-control-loop.md:50)：“这里最重要的分离是 `State` 与 `Context`。”

### 33. 摘要压缩如何避免丢失用户约束、未完成事项和关键事实？

**充分**

支持要点：用户目标/审批/未决动作存在权威状态，投影包含问题、已完成/未决和反馈；原文比较条件/引用不自由摘要；给摘要遗漏的反例和恢复约束。

缺口：无本题关键内容缺口。

正文证据：

- [c01-control-loop.md:50–58](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c01-control-loop.md:50)：“这里最重要的分离是 `State` 与 `Context`。”
- [f02.md:14–16](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/f02.md:14)：“上下文不足的失败不只来自窗口溢出。摘要可能把 `days < 7` 改写成“七天内可退款”，恰好删去边界条件；即便字符数大幅减少，业务判断已经改变。本文要求不可变证据原文不由自由摘要替代：投影保留比较操作、测试输入、预期和实际；探索日志可以压缩，引用必须仍能定位原文。如果材料放不下，应先检索相关片段、保留原文引用或拆分”
- [f02.md:202–202](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/f02.md:202)：“**摘要损失。**把源代码片段替成“七天内可退”，报告保持不变。说明为什么事实校验可能仍通过，而根因判断质量下降。参考分析：校验器仍可比对报告，但摘要没有比较符，无法判断边界实现；应保留源文件原行及修订，不能仅通过增加提示词修复消失的证据。提交改变前后的请求内容和候选，不虚构质量改善百分比。”

### 34. 长期记忆应该在什么条件下写入、更新、合并或删除？

**未覆盖**

支持要点：任务状态与上下文只是邻近主题。

缺口：缺长期记忆写入条件、抽取、去重合并、更新、过期和删除全生命周期。

正文证据：

- [c01-control-loop.md:50–58](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c01-control-loop.md:50)：“这里最重要的分离是 `State` 与 `Context`。”

### 35. 如何发现错误记忆对后续任务的持续污染，并修正受影响结果？

**部分**

支持要点：说明摘要丢事实导致重复动作、运行时以权威账本拒绝；已有记忆中的旧话不具当前批准权限。

缺口：未教跨任务错误记忆检测、来源依赖、失效传播、回收与受影响结果修复。

正文证据：

- [c01-control-loop.md:56–58](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c01-control-loop.md:56)：“例如，状态账本中已有工单 `ISSUE-218`，但摘要把它遗漏了，模型又提议创建工单。正确处理是运行时识别唯一工单槽位已经满足，返回原回执或冲突信息；不是相信模型“尚未创建”的摘要。把摘要当权威状态，会使上下文长度优化直接破坏副作用安全。”
- [e03.md:294–298](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/e03.md:294)：“将开篇攻击文本分别放入测试报告、`read_source` 返回和已有记忆。画出每种路径如何进入模型，标出真正有权限阻止读和写的组件，并给出正常路径的预期。不得接真实网络服务。”

### 36. 如何隔离不同用户、组织和会话的记忆？

**部分**

支持要点：可信宿主身份在存储读取前过滤、禁止跨组织内容入上下文；缓存带主体/授权版本。

缺口：缺记忆对象的user/session作用域、写入和跨会话继承控制；不能称已完整教授记忆隔离。

正文证据：

- [e03.md:22–42](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/e03.md:22)：“身份、对象和内容分类要在不同位置检查。”
- [e05.md:146–150](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/e05.md:146)：“本任务可以缓存不可变源读取或经核验的分析候选。工单副作用、批准或运行完成状态不能按问题文字复用；相同问题的另一个运行仍需自己的效果槽位与准确批准。”

### 37. 检索材料、历史记忆与当前用户要求相冲突时，应如何处理？

**部分**

支持要点：外部资料/历史记忆不获得指令权限；当前目标与策略控制动作；同级事实规则冲突先核版本/权威并请求确认。

缺口：未系统教历史用户偏好与当前明确要求的冲突更新、记忆失效和完整来源优先级。

正文证据：

- [c01-control-loop.md:56–58](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c01-control-loop.md:56)：“例如，状态账本中已有工单 `ISSUE-218`，但摘要把它遗漏了，模型又提议创建工单。正确处理是运行时识别唯一工单槽位已经满足，返回原回执或冲突信息；不是相信模型“尚未创建”的摘要。把摘要当权威状态，会使上下文长度优化直接破坏副作用安全。”
- [e03.md:294–298](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/e03.md:294)：“将开篇攻击文本分别放入测试报告、`read_source` 返回和已有记忆。画出每种路径如何进入模型，标出真正有权限阻止读和写的组件，并给出正常路径的预期。不得接真实网络服务。”
- [c02.md:228–234](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c02.md:228)：“`NO_HITS` 只说明当前检索没有候选；原因可能是未摄取、索引未更新、版本过滤、查询词面不匹配或确实缺资料。对用户可说当前可用证据不足，并提供允许的补证路径；内部运维记录层级原因。没有权限时，不应通过“搜到了机密规则但不能给你”泄露受限对象存在性。本篇选择对外统一不足，内部仅在获准审计通道记录权限拒绝原因。”

### 38. 如何设计系统提示，使角色、工具使用规则和输出要求清晰而可测试？

**部分**

支持要点：开发者指令定义输出任务，资料是数据；Schema与业务校验分离；协议/事实反例及冻结提示对照可用于测试。

缺口：缺一套同时包含角色、工具使用规则和输出约束的系统提示设计方法及相互冲突处理。

正文证据：

- [f02.md:10–24](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/f02.md:10)：“权威状态保存可信目标、当前身份、资料版本、已经读取的证据和待处理事项。模型输入是本轮投影：它包含对当前判断足够的证据，却不承担身份授权。令模型输出一个 `tenant_id` 或 `approved=true` 并不能改变状态；工具层仍从可信运行时取身份与批准。”
- [f02.md:198–205](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/f02.md:198)：“**协议与业务反例。**构造完整合法、完整但 `actual` 错位、`incomplete`、包含 `refusal` 四个 REST 文档，再加入顶层为数组/null的响应。给合法候选一个并不存在的引用 ID。参考分析：分别得到候选、事实拒绝、协议拒绝、模型拒绝、顶层对象拒绝和上下文引用拒绝。调用包装层也须检查对象”
- [e02.md:73–79](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/e02.md:73)：“一次版本对照至少冻结代码、系统提示、工具定义、上下文构建方式、资料快照、模型配置、预算、故障注入、判定器和案例集。能取得不可变模型修订就记录它；供应商只给滚动别名时，记录请求日期和响应中的可用身份，同时把无法完全冻结写为比较限制。不能凭相同别名声称底层模型一定相同。”

### 39. Few-shot 示例如何帮助工具选择？示例过多或失真会带来什么问题？

**未覆盖**

支持要点：有教学示例和评测泄漏，但不是模型few-shot工具选择机制。

缺口：缺示例选择、覆盖、排序、token代价、误导/失真以及工具选择行为实验。

正文证据：

- [e02.md:63–71](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/e02.md:63)：“开发案例帮助发现方案，允许查看答案、轨迹和失败原因。回归案例保存已知缺陷及正常路径，用来防止修复倒退。独立保留案例用于一个被冻结的版本判断尚未见过的条件，原始内容和参考判定由独立评阅者保管。”

### 40. 如何验证一次提示或记忆策略调整确实改善了结果，而非只修好几个演示样例？

**充分**

支持要点：冻结提示和上下文等版本，只改策略；开发/回归/独立保留分开；同案例重复配对比较，错误和缺证保留，原例/关联/未知条件三类复验。

缺口：无本题关键内容缺口；实际策略效果仍需运行；本题问验证方法而非记忆算法。

正文证据：

- [e02.md:63–91](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/e02.md:63)：“开发案例帮助发现方案，允许查看答案、轨迹和失败原因。回归案例保存已知缺陷及正常路径，用来防止修复倒退。独立保留案例用于一个被冻结的版本判断尚未见过的条件，原始内容和参考判定由独立评阅者保管。”
- [e02.md:241–247](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/e02.md:241)：“一份失败记录至少保留输入及快照、期望性质、实际证据、首次已知偏离阶段、原因假设、改动和复验。首次偏离与根因不同：首次发现答案错误，不代表错误从生成阶段开始。先沿证据反查，再给原因假设。”

### 41. RAG、长上下文直接阅读和模型微调，分别适合解决哪些知识问题？

**部分**

支持要点：检索相关片段、上下文放不下时拆分、版本和证据包可支持RAG部分。

缺口：没有微调与RAG/长上下文三者的知识更新、事实依据与成本适用性比较。

正文证据：

- [f02.md:14–16](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/f02.md:14)：“上下文不足的失败不只来自窗口溢出。摘要可能把 `days < 7` 改写成“七天内可退款”，恰好删去边界条件；即便字符数大幅减少，业务判断已经改变。本文要求不可变证据原文不由自由摘要替代：投影保留比较操作、测试输入、预期和实际；探索日志可以压缩，引用必须仍能定位原文。如果材料放不下，应先检索相关片段、保留原文引用或拆分”
- [c02.md:8–26](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c02.md:8)：“摄取链应是“取得完整源文件→固定版本及哈希→按确定规则分块→带权限与来源入索引→发布索引快照”。新文件取得成功不等于新索引已发布；新索引发布也不等于当前正在进行的回答使用了它。查询开始时冻结 `index_snapshot_id`，证据包同时记录源版本和索引版本。更新完成的通知不能改写已经生成的请求历史。”

### 42. 一个完整 RAG 管线包含哪些环节？如何逐段定位回答错误？

**充分**

支持要点：摄取固定源、分块、权限索引快照、词法/向量/融合、重排、读回、上下文和逐主张支持；按未入库/过滤/召回/裁剪/误读定位。

缺口：无本题关键内容缺口；不代表已有真实嵌入服务运行。

正文证据：

- [c02.md:8–38](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c02.md:8)：“摄取链应是“取得完整源文件→固定版本及哈希→按确定规则分块→带权限与来源入索引→发布索引快照”。新文件取得成功不等于新索引已发布；新索引发布也不等于当前正在进行的回答使用了它。查询开始时冻结 `index_snapshot_id`，证据包同时记录源版本和索引版本。更新完成的通知不能改写已经生成的请求历史。”
- [c02.md:228–247](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c02.md:228)：“`NO_HITS` 只说明当前检索没有候选；原因可能是未摄取、索引未更新、版本过滤、查询词面不匹配或确实缺资料。对用户可说当前可用证据不足，并提供允许的补证路径；内部运维记录层级原因。没有权限时，不应通过“搜到了机密规则但不能给你”泄露受限对象存在性。本篇选择对外统一不足，内部仅在获准审计通道记录权限拒绝原因。”
- [f02.md:18–24](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/f02.md:18)：“本篇候选字段故意区分观察与推断：`failed_test/expected/actual` 必须来自报告；`source_refs` 只能引用本轮可见证据；`hypothesis` 是待核根因，允许为 `null`；`missing_fields` 表达哪些事实不能确定。模型不得用一段自然语言同时承担事实、批准和执行结”

### 43. 如何根据文档结构、查询类型和引用需求设计切块策略？

**充分**

支持要点：按函数与定义、测试输入/预期/实际同组保留，块带哈希及行号；大小块的聚焦/丢前提取舍，邻块扩展；按查询必要块评估。

缺口：无本题关键内容缺口。

正文证据：

- [c02.md:10–16](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c02.md:10)：“摄取链应是“取得完整源文件→固定版本及哈希→按确定规则分块→带权限与来源入索引→发布索引快照”。新文件取得成功不等于新索引已发布；新索引发布也不等于当前正在进行的回答使用了它。查询开始时冻结 `index_snapshot_id`，证据包同时记录源版本和索引版本。更新完成的通知不能改写已经生成的请求历史。”
- [c02.md:236–247](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c02.md:236)：“先冻结合法资料集合和查询集，再为每题独立标出必要支持块，包含精确测试名、自然语言同义、需要实现与报告共同支持、规则缺失和冲突题。词法与语义使用同样的权限/修订过滤、`top_k` 和上下文上限；否则较大候选集的收益会被误归于算法。真实向量输入必须记录嵌入模型、维度、查询改写和编码版本；手工向量只能测排序实现。”

### 44. 如何选择 Embedding 模型，评估领域术语、中文与多语言查询效果？

**部分**

支持要点：相同模型空间/维度/编码版本要求；按精确词和同义查询分组测必要块召回；中文tokenizer局限须诚实基线。

缺口：缺Embedding选型维度/领域适配、中文和多语言对比集/编码策略与模型质量方法。

正文证据：

- [c02.md:18–26](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c02.md:18)：“精确文件路径、报告 ID、测试名优先做字段定位或词法检索。它们的字符形式本来就是身份信息，语义相近的另一个测试不能替代。自然语言“为什么第七天边界失败”可能没有出现 `test_refund_day_7` 的词面，需要查询改写、语义召回或混合。语义召回依靠相同嵌入模型空间中的相似性，不代表事实为真，也不能用一个高分解除”
- [c02.md:38–38](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c02.md:38)：“以下代码可保存为 `c02_evidence.py`。嵌入向量为可选外部输入：须由相同 `embedding_version` 对查询和块编码、维度一致、非零且有限；代码实现余弦和融合，但**没有嵌入服务，不能通过它得到真实语义比较成绩**。默认示例只做词法检索。源对象存储是本地可信夹具；真实服务应按当前身份读回，不能”
- [c02.md:236–247](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c02.md:236)：“先冻结合法资料集合和查询集，再为每题独立标出必要支持块，包含精确测试名、自然语言同义、需要实现与报告共同支持、规则缺失和冲突题。词法与语义使用同样的权限/修订过滤、`top_k` 和上下文上限；否则较大候选集的收益会被误归于算法。真实向量输入必须记录嵌入模型、维度、查询改写和编码版本；手工向量只能测排序实现。”

### 45. 关键词检索、向量检索和混合检索分别有什么优势与盲区？

**充分**

支持要点：精确ID用字段/词法，语义补同义但不证真，BM25机制及RRF融合避免分值直接相加；按查询分组公平比较。

缺口：无本题关键内容缺口。

正文证据：

- [c02.md:18–26](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c02.md:18)：“精确文件路径、报告 ID、测试名优先做字段定位或词法检索。它们的字符形式本来就是身份信息，语义相近的另一个测试不能替代。自然语言“为什么第七天边界失败”可能没有出现 `test_refund_day_7` 的词面，需要查询改写、语义召回或混合。语义召回依靠相同嵌入模型空间中的相似性，不代表事实为真，也不能用一个高分解除”
- [c02.md:236–247](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c02.md:236)：“先冻结合法资料集合和查询集，再为每题独立标出必要支持块，包含精确测试名、自然语言同义、需要实现与报告共同支持、规则缺失和冲突题。词法与语义使用同样的权限/修订过滤、`top_k` 和上下文上限；否则较大候选集的收益会被误归于算法。真实向量输入必须记录嵌入模型、维度、查询改写和编码版本；手工向量只能测排序实现。”

### 46. Reranker 改善的是哪一阶段？怎样衡量它带来的质量与时延代价？

**部分**

支持要点：明确重排只能看召回候选，不能修复漏召回；必要块进入上下文和逐主张支持可定位质量。

缺口：缺reranker评分机制、候选规模/模型成本/时延权衡及与无重排基线的专门实验。

正文证据：

- [c02.md:26–26](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c02.md:26)：“重排只看已经召回的候选，不能给从未召回的块打分。因此同义查询失败时，先检查资料是否入库、是否被正确过滤、候选是否出现，再查重排和上下文裁剪。正确片段已入上下文而模型误读，则改生成或支持检查层；继续扩大索引不对应这个原因。”
- [c02.md:236–239](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c02.md:236)：“先冻结合法资料集合和查询集，再为每题独立标出必要支持块，包含精确测试名、自然语言同义、需要实现与报告共同支持、规则缺失和冲突题。词法与语义使用同样的权限/修订过滤、`top_k` 和上下文上限；否则较大候选集的收益会被误归于算法。真实向量输入必须记录嵌入模型、维度、查询改写和编码版本；手工向量只能测排序实现。”

### 47. 查询改写、多查询和多跳检索什么时候有效，什么时候容易改变原意？

**部分**

支持要点：自然语言同义需改写/语义召回；改写版本须冻结，中文词法无命中可比较改写。

缺口：缺多查询、多跳检索的执行与终止、有效条件及改写偏离原意的保护和反例。

正文证据：

- [c02.md:20–20](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c02.md:20)：“精确文件路径、报告 ID、测试名优先做字段定位或词法检索。它们的字符形式本来就是身份信息，语义相近的另一个测试不能替代。自然语言“为什么第七天边界失败”可能没有出现 `test_refund_day_7` 的词面，需要查询改写、语义召回或混合。语义召回依靠相同嵌入模型空间中的相似性，不代表事实为真，也不能用一个高分解除”
- [c02.md:238–247](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c02.md:238)：“先冻结合法资料集合和查询集，再为每题独立标出必要支持块，包含精确测试名、自然语言同义、需要实现与报告共同支持、规则缺失和冲突题。词法与语义使用同样的权限/修订过滤、`top_k` 和上下文上限；否则较大候选集的收益会被误归于算法。真实向量输入必须记录嵌入模型、维度、查询改写和编码版本；手工向量只能测排序实现。”

### 48. 如何让答案引用与实际支持结论的原文、版本及位置对应？

**充分**

支持要点：原文源版本/块哈希/行范围和读回校验；引用合法不等于支持，拆原子主张核规范事实，冲突及未判断分开。

缺口：无本题关键内容缺口。

正文证据：

- [c02.md:8–16](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c02.md:8)：“摄取链应是“取得完整源文件→固定版本及哈希→按确定规则分块→带权限与来源入索引→发布索引快照”。新文件取得成功不等于新索引已发布；新索引发布也不等于当前正在进行的回答使用了它。查询开始时冻结 `index_snapshot_id`，证据包同时记录源版本和索引版本。更新完成的通知不能改写已经生成的请求历史。”
- [c02.md:28–38](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c02.md:28)：“一个引用可以通过“ID在包内、哈希与读回一致、位置有效”的关联检查，却仍不支持主张。`return days < 7` 支持“这个函数使用严格小于七的比较”，不独立支持“业务规则必须小于等于七”。报告支持“该报告中这项断言失败”，不证明修复后正确。”
- [c02.md:222–234](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c02.md:222)：“预期为 `HITS`、规范报告事实 `SUPPORTED`、业务规则 `UNSUPPORTED`；实际结果为空。`IndexSnapshot` 的成员不可变，内容地址绑定全部检索/支持元数据；查询同时检查可信Scope里的ID和成员重新计算的ID，混入后发布块不能继续回显旧ID。可信摄取方提供这份快照，模型不能自行构造”

### 49. 没有足够证据、资料互相矛盾或知识已经过期时，系统应怎样响应？

**充分**

支持要点：无命中不等于无知识，统一表达可用证据不足和补证；版本缺失不得回退旧源，同级权威冲突请确认，部分支持删无据部分。

缺口：无本题关键内容缺口。

正文证据：

- [c02.md:228–247](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c02.md:228)：“`NO_HITS` 只说明当前检索没有候选；原因可能是未摄取、索引未更新、版本过滤、查询词面不匹配或确实缺资料。对用户可说当前可用证据不足，并提供允许的补证路径；内部运维记录层级原因。没有权限时，不应通过“搜到了机密规则但不能给你”泄露受限对象存在性。本篇选择对外统一不足，内部仅在获准审计通道记录权限拒绝原因。”
- [c01-selection.md:31–31](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c01-selection.md:31)：“第三种输入有两份同级规则冲突，且无法判断哪份适用。更多 Agent 不会创造业务权威。正确输出是 `WAIT_INPUT`，列明冲突范围和需要的版本确认；若让几个模型投票选一个规则，只是给未经授权的裁决增加票数。”

### 50. Agentic RAG 相对固定 RAG 增加了什么决策能力？如何证明额外复杂度值得？

**部分**

支持要点：动态调查依观察选择新文件/问题；相同任务/权限/预算比较新增路径价值；静态证据包提供固定检索基线。

缺口：没有Agentic RAG专门循环（查询规划、检索充分性、自适应跳转/停止）与固定RAG一组完整对照，跨章仅有可迁移基础。

正文证据：

- [c01-selection.md:25–31](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c01-selection.md:25)：“第一种输入已有报告、实现和业务规则，且测试失败是固定字段。普通程序可输出失败事实；需要解释时一轮模型足够。动态 Agent 再读取同样材料只增加路径与失败面，除非比较表明它改善了事先定义的缺陷。”
- [c01-selection.md:43–59](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c01-selection.md:43)：“冻结相同任务集，分别标记材料完整、需动态调查、证据冲突；固定资料与工具版本、权限、验收器、模型快照与采样配置、总期限和资源上限。各方案可有不同路径，但不能偷偷取得测试集答案。记录每题的候选合格、完整目标合格、正确等待、错误完成、读/模型尝试、用量、端到端延迟和未知结果。”
- [c02.md:236–247](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v10/c02.md:236)：“先冻结合法资料集合和查询集，再为每题独立标出必要支持块，包含精确测试名、自然语言同义、需要实现与报告共同支持、规则缺失和冲突题。词法与语义使用同样的权限/修订过滤、`top_k` 和上下文上限；否则较大候选集的收益会被误归于算法。真实向量输入必须记录嵌入模型、维度、查询改写和编码版本；手工向量只能测排序实现。”

## 源版本与领域自查

全部v10 Markdown在报告生成时记录SHA256，正文未修改；哈希清单见JSON。报告写出时逐项重读一致。此记录不是早于首次读取的冻结起点，不冒充保护期全过程证据。

领域自查：50道连续编号；逐题保留问法、判定、正文定位、可答要点与缺项；没有用外部链接正文补分。Q10经历缺失单列。未调用真实模型、未运行教材代码、未作用户或真人专家认证。
