# Agent 开发者教材阅读与实作路径

这版从问题、验收和风险开始，再学API、模型、证据、工具和存储，最后接固定流程及完整动态运行时。二十个阅读单元承载原十二模块，专业正文的深度与原能力目标保留。网站程序未接入这版独立教材。

先看[学习入口](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v09/00-learning-route.md)。零基础先完成[预备课](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v09/01-foundation.md)的短程序诊断与补学；已有基础者可用相同诊断证据跳过补学。预备通过只支持进入后续学习，不等于职业认证。

## 完整教材

[阅读完整教材](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v09/agent-engineering-textbook.md)

合订本按以下深读顺序组装，分章入口保留。组装不产生新的技术审校或学习效果结论，来源、版本和链接对应由本轮QA留证。

## 概要预览

[问题发现](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v09/p01-discovery.md) → [任务验收](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v09/02-task-acceptance.md) → [信任边界](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v09/03-trust-boundary.md)，先形成问题档案、任务范围和风险表。随后可预览[选型原则](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v09/c01-selection.md)与[动作身份](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v09/c01-control-primer.md)的概念，理解工程方案为何不同；这些预览不要求实现数据库、写工具或完整运行时。

## 专业深读目录

| 顺序 | 正文                                                                                                        | 本篇解决的问题            |
| -- | --------------------------------------------------------------------------------------------------------- | ------------------ |
| 1  | [学习入口](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v09/00-learning-route.md)     | 怎样确定起点与最终交付范围      |
| 2  | [基础预备](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v09/01-foundation.md)         | 怎样把文本输入变成可运行可判错的程序 |
| 3  | [问题发现](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v09/p01-discovery.md)         | 怎样从真实任务取得值得解决的问题证据 |
| 4  | [任务验收](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v09/02-task-acceptance.md)    | 动手前怎样定义成功与合理停止     |
| 5  | [信任边界](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v09/03-trust-boundary.md)     | 哪些输入能提供事实而不能授予权限   |
| 6  | [外部API](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v09/f01.md)                  | 怎样取得可校验可复现的外部结果    |
| 7  | [模型候选](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v09/f02.md)                   | 怎样可靠接收和校验一次模型响应    |
| 8  | [方案选择](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v09/c01-selection.md)         | 怎样选择最小足够方案         |
| 9  | [动作身份](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v09/c01-control-primer.md)    | 怎样在重复提议与发送中识别同一动作  |
| 10 | [检索证据](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v09/c02.md)                   | 怎样让检索结果成为符合权限的证据   |
| 11 | [写工具](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v09/c03.md)                    | 怎样授权去重并核对写动作       |
| 12 | [持久恢复](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v09/e01.md)                   | 重启后怎样准确保留动作事实      |
| 13 | [固定端到端流程](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v09/c01-fixed-workflow.md) | 怎样连接已具备的组件完成同一任务   |
| 14 | [完整动态循环](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v09/c01-control-loop.md)    | 怎样依据新观察推进受控可恢复的运行时 |
| 15 | [版本评价](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v09/e02.md)                   | 怎样证明版本改动真正改善任务     |
| 16 | [完整MVP决策](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v09/p01-mvp.md)            | 怎样依据问题与评价冻结可证伪方案   |
| 17 | [强制安全](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v09/e03.md)                   | 怎样在读取和发送前实际执行权限    |
| 18 | [发布回退](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v09/e04.md)                   | 怎样换版本而保住在途事实       |
| 19 | [性能成本](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v09/e05.md)                   | 怎样在质量护栏下比较工程经济性    |
| 20 | [独立交付与复盘](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v09/p02.md)                | 怎样以作品证据判交付并复验改进    |

完整固定流程放在工具与存储之后，完整动态循环再接这些组件。前面的选型与身份导读只建立理解它们所需的原则；问题发现前置，完整MVP决定在评价先修之后。每篇的正式依赖、产物和能力去向见[课程规格](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/team/textbook-v09-spec.md)。

## 从0到1实作

沿[阶段产物与补学路径](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/team/textbook-v09-curriculum.md)推进：问题与限制 → 教学工程可行性 → 评价与真实MVP决定 → 自己的MVP与强制边界 → 交付和真实使用 → 经济比较与迭代 → 独立作品和未知任务。前期教学夹具帮助学习机制；它不能代替真实问题、产品价值和行业比较的证据。真实敏感读取及外部写入之前，须完成强制安全与对应授权。

各阶段都交产物并复盘，发现不足回到对应单元补学。现有量规和产品门槛不变；公开习题不能当独立保留评价，教材完成不等于职业胜任或行业先进。

## 课程与检查依据

- [教学路径与阶段产物](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/team/textbook-v09-curriculum.md)
- [章节规格与精确拆分](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/team/textbook-v09-spec.md)
- [原目标知识点及新依赖图](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/team/textbook-v09-manifest.json)
- [专业正文写作标准](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/team/TEXTBOOK_WRITING_STANDARD.md)
- [原职业教学量规](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/team/curriculum-data.json)
- [产品创造标准](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/team/product-creation-standard.md)

原v07/v08及历史审校保留。v09拆章、导读、预备和链接的检查与其源文件历史验证分别记录；当前页面只提供阅读路径，不授予教学效果、真人专业评阅或完整产品通过结论。

## 本轮独立检查

- [内容审校与问题复核](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/team/textbook-v09-content-review.md)
- [教材交付与必要验证](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/team/textbook-v09-qa.md)

当前结论、实际检查范围与未验证项以对应报告为准；历史源检查不能自动授予新导读、拆章或合订本通过。
