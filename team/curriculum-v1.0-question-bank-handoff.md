# Rolecraft 1.0 题库与自评接入交接

- **责任岗位**：课程架构师
- **版本**：`curriculum-v1.0-question-bank-handoff`
- **日期**：2026-10-16（Asia/Shanghai）
- **状态**：`handoff_ready_for_client_backend; independent_integration_qa_pending`
- **面向环境**：`rolecraft-1.0` 远程单开发环境，教材 `textbook-v12`

## 结论

现有 `interview-answers-v1` 保留了 1.0 题库的完整内容输入：固定100题、市场14题和原型10题共124题，题目 ID、完整题面、完整参考解析、当前答案版本、逐题 SHA256、教材章节/小节/来源 hash 及内容审校/QA引用都已在定版包内。但当前派生包的顶层 `sourceBinding` 指向旧产品/语料快照，不能直接作为当前发布数据。合法接入路径是以当前产品最终验收、当前 v12 索引/语料 hash 重绑定后重新构建；重绑定前只能作为候选源读取。保持题目身份和逐题来源不变、按包内 `bodyMarkdown` 渲染、把集成验收另行记录；这不表示浏览器题库已经通过，也不产生就业或认证结论。

产品最终验收中 V1-04 当前仍为 `fail`：远程页面显示“题库资料暂不可用；不会用演示题替代”。因此本交接把内容包交给客户端/后端消费，不能把已有内容审校状态当成产品功能通过。设计验收也记录题库/自评数据不可用，但当前空态本身是诚实表达。

## 可直接接入的定版输入

| 文件 | 用途 | 当前身份/证据 |
|---|---|---|
| [dist/interview-answers-v1-data.js](../dist/interview-answers-v1-data.js) | 当前候选运行包（需重绑定后使用） | SHA256 `4a9e3ce4f5067e77b26bdd551bed911a6efadb9fe905de206876f03c773dad7b`；answerSet `2cd40dcca5342944ab7c0c7836e759054dc3b5d4aaf992508f78d9172473b61a` |
| [textbooks/interview-answers-v1/manifest.json](../textbooks/interview-answers-v1/manifest.json) | 集合分母、题目顺序、答案/来源/审校绑定 | SHA256 `e3bb9ecf56c525b57019af129a96159d258a21a1768c382ef536eb4430614fe5`；answerSet `2cd40dcca5342944ab7c0c7836e759054dc3b5d4aaf992508f78d9172473b61a` |
| `textbooks/interview-answers-v1/answers/*.md` | 每题完整原文，不能三条截断或重写 | 124 个 ID：Q1–Q100、M101–M114、P01–P10；MVP 首批只启用 Q/M 的15题 |
| `server/retrieval/build-interview-answers-v1.mjs` | 定版构建及哈希/来源/报告一致性校验 | 只有当前内容审校+QA绑定才允许 `--final` |
| `textbooks/interview-answers-v1/author-manifest-{a,b,c}.json` | 逐题作者版本与 sourceBindings | 需按当前 v12 索引重绑后再 build |
| `team/agent-interview-answer-revision-product.json` | 构建脚本产品合同与分母 | 保留 100/14/10；sourceBindings需更新 |
| `team/product-v1.0-final-acceptance.json` | 当前 1.0 验收快照 | 作为重绑定证据，不替代集成QA |
| `team/agent-interview-answer-revision-curriculum.json` | 教学推理链、AQS-01–08、个人经历边界 | 作者交接，不替代独立内容审校 |
| `server/retrieval/content-v12-index.json` + `textbooks/v12/assembly-manifest.json` | 章节定位、教材版本和源 hash | `textbook-v12`，corpus hash 见下节 |

构建/部署输入还必须按 `textbook-v12` 目录索引重新核对；不得把旧 v10 的章节 hash 或历史 QA 当作当前来源。构建命令为：

```sh
cd sites/rolecraft
node server/retrieval/build-interview-answers-v1.mjs --final
```

本次接入不需要新的付费模型调用，不向题目答案写入用户账户或个人经历。

## 版本与来源身份与重绑定要求

- 题库包候选：`interview-answers-v1`，答案集合 hash：`2cd40dcca5342944ab7c0c7836e759054dc3b5d4aaf992508f78d9172473b61a`，内容状态：`met_within_reviewed_scope`。
- 教材：`textbook-v12`；合订教材 SHA256：`25ce2aaa1be0ba0f2814dd1247ac6299d106c3d2e48f43867c49055490c2801e`。
- 检索语料 hash：`c56def0f8eaf17207c10bc794a771650b0c9f52207815ce11aa7a7a00f29f757`；索引文件和合订本必须一起校验。
- 逐题来源对象保留 `receivedSha256`（包内收到值）与 `currentSha256`（工作区当前 v12 文件值）；本交接不静默覆盖旧证据，构建脚本必须在来源文件实际 hash 更新后重新生成并再审校。
- 当前抽样 MVP 来源中，工作区与包内收到 hash 不一致的绑定必须显式重绑（完整差异列表见 JSON `rebindRequired.sourceReferenceMismatches`）；不能用旧 hash 继续显示当前章节。
- 当前重绑定必须将包顶层 `sourceBinding.productPath/productSha256` 更新为 `product-v1.0-final-acceptance.json` 的当前 hash，将 corpus/index 指向当前 `content-v12-index.json` 与 corpus hash；不能只改显示文本。
- 每个答案项目必须保留 `answerVersion`、`answerSha256`、`sourceReferences[].unitId`、`sectionId`、`section`、`sha256` 和可回链的 `readingHref`。

## 最小可用题集提案：MVP-15

MVP-15 是首批可显示/可自评的内容窗口，不删除或覆盖其余89题（固定题组）和10题（市场补充题组）。它用 11 个固定题主题覆盖概念、选型、控制循环、工具、记忆、检索、图编排、协作、评测、安全和产品场景，再加 4 个市场工程题。原型 P01–P10 保持既有原型集，P01 的作品练习仍按现有练习合同接入；不在本题库 MVP 内新增或改写题目。Q10、Q99、P05 需要真实个人经历，明确排除自动自评；它们仍保留在完整数据包。

| ID | 集合 | 题目 | 主教材定位（`sectionId`） | 主来源 hash | 可用模式 |
|---|---|---|---|---|---|
| Q1 | fixed100 | 如何界定 LLM Agent？你会用哪些可观察行为区分它与普通聊天应用？ | 00-learning-route · 认识 Agent 工程（s-3b82fdeafaab） | `452129591648ca6c146945fae000e3e905e87c2794315109c727592a7b16dced` | question_bank、self_assessment |
| Q2 | fixed100 | 单次模型调用、固定 Workflow 和动态 Agent，分别适合什么业务条件？ | c01-selection · 同一任务 四种控制权（s-e458cc35eeb7） | `4ee70a19c07d14a550ff9f1fbcfb46ec26a3e236aef30b5d3f2b1ce3f190d982` | question_bank、self_assessment |
| Q11 | fixed100 | ReAct 如何组织推理、行动与观察？它与一次性生成计划有什么不同？ | n03-planning-reflection · 1 三种策略改变的是控制对象（s-da63f3dcff17） | `76b919dbb061348a5bc59b958f714a9fff814be618d390be48eba098751372dd` | question_bank、self_assessment |
| Q21 | fixed100 | Function Calling 从模型输出到函数真正执行，中间经过哪些步骤？ | c03 · 工具名与合法 JSON 都不能授执行权（s-9267960e504a） | `00efb05420c22e693c95bc3bebeec554ddbc064a4231d754ec2f13d2934b8fe3` | question_bank、self_assessment |
| Q31 | fixed100 | 会话历史、任务工作状态和长期记忆有什么不同？应分别存储什么？ | n02-context-memory-prompt · 1 四种保存对象，四种生命周期（s-e3ca8acc970e） | `1ede728a0c653ad60d457a05088e9807e46043a30654973e9c7d8d50fbfcc537` | question_bank、self_assessment |
| Q41 | fixed100 | RAG、长上下文直接阅读和模型微调，分别适合解决哪些知识问题？ | n05-retrieval-ingestion · 8 RAG、长上下文与微调按缺失能力选择（s-fd35c6e4f233） | `354bf1dbf80df77b368a1d2a1fa3a94798835c11c9b824c945b8028679c79a16` | question_bank、self_assessment |
| Q51 | fixed100 | 在你采用的版本中，LangChain 和 LangGraph 分别承担什么职责？ | n06-graph-orchestration · 把控制循环映射为可恢复的状态图（s-e5c879245a21） | `9bdb706675c572bec41f7c229f7c88c8b398bc5dd502900532fa6e5eb0212bbb` | question_bank、self_assessment |
| Q61 | fixed100 | 什么实验或业务证据会使你选择多 Agent，而不是给单 Agent 增加工具或步骤？ | c01-selection · 多 Agent 的升级点是可分工 而不是人数（s-8368c310c8e2） | `4ee70a19c07d14a550ff9f1fbcfb46ec26a3e236aef30b5d3f2b1ce3f190d982` | question_bank、self_assessment |
| Q71 | fixed100 | 如何定义 Agent 的任务成功率，避免把“生成了回答”当成任务成功？ | e02 · 把“好”拆成能被不同证据推翻的命题（s-7426c782eb02） | `ebadd9a70f6bdd59f0e97ed01d30550a9e34fc1afe3c57a21a202c801b93d89f` | question_bank、self_assessment |
| Q81 | fixed100 | 直接提示注入和来自网页、文档或工具结果的间接注入，有什么不同？ | n08-sandbox-security · 直接与间接提示注入究竟跨越什么边界（s-99f509e07cb8） | `16b1fe631c244ec394965f9443bc680380997cf4427a7555184c26cf3ee064f2` | question_bank、self_assessment |
| Q91 | fixed100 | 设计一个客服工单 Agent：如何确定自动处理范围、转人工条件及验收指标？ | n10-evaluation-projects · 客服系统先划业务责任，不先选Agent框架（s-e0fa3fd24686） | `ed5da5944202ccda7d0f6935b926dd4a827cecf24866e678e369baced0f3c95b` | question_bank、self_assessment |
| M101 | market14 | 调用多个模型或工具API时，如何用Python asyncio组织并发？阻塞调用、无界任务创建和取消清理分别会导致什么问题，怎样用最小例定位？ | n01-python-model-foundations · 2 固定工作者解决的是在途工作上限（s-f0f01fbbe638） | `9941d23b0d506ac87d6b032b1f15449b03a9fa74e6563bcd093e3f54af874e62` | question_bank、self_assessment |
| M104 | market14 | Agent服务运行数小时后内存持续增长，但请求量平稳。如何区别对象仍被引用、缓存无界、待完成任务堆积与暂时内存峰值，并验证修复？ | n09-runtime-delivery · 内存持续增长应先找到持有者（s-d50a141d5bb7） | `b621b838657aaa9915506a5bee6e25f7733b41085b08c50143e5965722157714` | question_bank、self_assessment |
| M110 | market14 | 提示模型返回JSON、使用JSON模式和按Schema约束生成分别能保证什么？遇到拒绝、截断、类型合法但语义错误时，应用怎样处理？ | n01-python-model-foundations · 5 合法结构是消费起点（s-21d70f768e2b） | `9941d23b0d506ac87d6b032b1f15449b03a9fa74e6563bcd093e3f54af874e62` | question_bank、self_assessment |
| M114 | market14 | 面对客户工程团队，怎样交付一份可复现的Agent技术移交包，使对方能重建环境、运行评测、理解架构决策并报告失败？如何证明接手成功？ | p02 · 一个证据包应使独立者从入口走到结论（s-84f7fade412d） | `ef1dd0ddd01026e0d012e05902f4b3357fc0d2e8d59f10e140761fa09fc3caa8` | question_bank、self_assessment |

完整多来源列表（包括同题多个小节及全部 hash）写入同名 JSON 的 `items[].sourceReferences`，软件工程师不得只保留首个来源。

## 三种用户模式与数据边界

- **题库浏览**：可显示 MVP-15；接入稳定后可切换为完整 124 题。题面、解析、来源和版本信息只读；不修改用户掌握状态。
- **练习**：首批使用 P01/P02/P06/P08/P10。练习要有题目来源、教材回链、草稿/提交证据和状态槽；`self_report`、`ai_suggestion`、`professional_review`、`human_review` 分层，不把答案展示当作品通过。
- **自评检验**：仅抽取当前用户已经访问的知识点，且从 `personalEvidenceRequired=false` 的当前版本题目中抽取；没有足够题目时显示真实数量。结果只标记本次自评，不改变专业审校、真人评审或职业状态。
- **复习**：只读当前版本且用户标记为 `weak` 的题，保留题目版本、时间和自评性质；新版本不覆盖历史答题。
- **个人经历题**：Q10、Q99、P05 仍显示“需要本人真实证据”，可以进入练习和作品提交，但不可由系统生成经历、不可自动判为掌握或通过。

## 答案深度与内容边界

每题按 AQS-01–AQS-08 展示和后续复验：直接回答、多角度机制、可操作路径、具体案例/分支、条件与取舍、验证方法、版本化来源/不确定性、可读可用。完整 `bodyMarkdown` 是参考解析，不能压缩成固定三条或按字数判通过。案例、伪代码和验证计划必须标注为教学构造/未运行；内容审校通过只覆盖绑定字节，不等于浏览器集成、真实模型、真实学习或真人专家审核。

产品定位在页面和答案旁保持一致：服务是行业知识丰富、教材定位、练习和面试准备支持，帮助用户更从容应对市场面试；不承诺就业、职业认证、岗位胜任、真人专家认可或行业领先。

## 缺口、后续任务与复验

| 缺口 | 责任岗位 | 最小动作 | 复验 |
|---|---|---|---|
| 题库页面仍显示资料不可用（V1-04 fail） | 软件工程师、后端数据工程师 | 消费重绑定后生成的 `dist/interview-answers-v1-data.js`，保留集合/版本/hash，移除占位空态，仅在真实不可用时显示 unavailable | QA 按主路径、刷新、后退、窄屏和版本身份复验 |
| 当前包尚未完成远程浏览器独立集成QA | 测试工程师、软件工程师 | 不改内容包，先冻结其 SHA256，再验证题面、完整答案、来源回链、历史集合和失败状态 | 独立 QA 绑定当前包，保留首失败 |
| 个人经历题不能由教材替代 | 产品经理、课程架构师、教材研发员 | 保留 Q10/Q99/P05 ID/题面；增加个人证据提示和真实作品入口；不伪造经历 | 自评排除；练习不显示通过/胜任 |
| 练习/自评状态需要与内容分开 | 课程架构师、后端数据工程师、软件工程师 | 用 MVP-15 的模式字段和访问门槛；不要求重写现有15题正文 | 隔离账户访问→自评→保存/提交→回源 |
| 历史 v10 覆盖 54/36/10 不能被新包覆盖 | 项目经理、课程架构师 | 旧统计仅作为历史基线；若补 24/27/28/34/39/51/58/62/70/86，另立作者任务和新版本 | 报告同时展示历史和当前，不合并分母 |

## 交接给软件/后端/QA

1. 软件工程师按 `items[].id` 和 `answerPath` 加载，只读渲染完整 `bodyMarkdown`，不重新摘要答案。
2. 后端数据工程师只保存用户模式状态（访问、weak、自评、草稿/提交）；不复制或修改正文、来源 hash 和历史集合。
3. 测试工程师在远程单环境冻结包 hash 后，独立验证 V1-04，并按 QB01–QB09 检查题库、练习、自评和来源回链。
4. 项目经理同步各岗位缺口，保留当前 `overall_not_met`，待 V1-04 和受影响验收项完成后重新做产品与 UI/UX 验收。

## 领域自查

本交接只维护题库教学结构、来源身份、答案深度和模式边界；未修改前端、后端、教材正文或旧冻结报告，未将内容审校状态写成产品通过，也未作就业/认证推断。
