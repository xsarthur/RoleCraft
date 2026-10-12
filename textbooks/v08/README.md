# Agent 开发者教材：专业正文阅读入口

本轮按你提供的专业标准重写原课程，围绕可设计、可实现、可调试和可评估的问题展开。原12模块由13篇正文承载：方案选择和已交付的控制循环共同组成c01。程序保持暂停，正文先以独立文件阅读。

这是具备软件工程和LLM应用基础的专业阅读路线；缺少基础时先完成f01的诊断与补学。课程完成不等于职业胜任或行业先进产品认证；实际审校与示例执行状态以本轮独立记录为准。

## 完整合订本

[阅读完整教材：Agent 开发工程教材](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v08/agent-engineering-textbook.md)

合订本按下面的阅读顺序组装13篇正文，分章入口继续保留。章节来源、版本对应和链接检查记录在QA报告中；合订本不产生新的技术审校或示例运行结论。

## 阅读顺序

| 顺序 | 正文                                                                                                                              | 本篇解决的问题                                                    | 原模块      |
| -- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | -------- |
| 1  | [实现可复现、可判错的外部 API 边界](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v08/f01.md)                          | 怎样把类型不可信、网络会失败的外部请求，变成可校验、可判错、可复现的小服务？                     | f01      |
| 2  | [把模型响应变成可验收的候选结果](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v08/f02.md)                              | 怎样在响应可能拒绝、截断、结构合法但业务错误时，可靠接收一次模型调用的候选结果？                   | f02      |
| 3  | [按任务不确定性选择最小可行方案](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v08/c01-solution-selection.md)           | 怎样证明缺陷分析任务需要动态 Agent，而不是普通程序、单次模型、固定 workflow 或额外协作 Agent？ | c01（选型）  |
| 4  | [Agent 控制循环：设计一个可恢复、受控并能验收的运行时](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/agent-control-loop-v07.md) | 怎样在模型行动不确定、外部效果和中断下推进一个受控、可恢复、可验收运行？                       | c01（运行时） |
| 5  | [构造可追溯且符合权限的检索证据包](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v08/c02.md)                             | 怎样把仓库和测试资料检索结果变成符合修订、权限与支持范围的证据包，使回答有据或明确无据？               | c02      |
| 6  | [把模型提议收敛为可授权、可去重的写工具](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v08/c03.md)                          | 怎样设计 create_issue 的契约，使合法提议能执行、非法提议被拒、重复和未知结果能被正确核对？       | c03      |
| 7  | [把恢复语义落实为一致持久状态](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v08/e01.md)                               | 怎样让进程重启、竞争工作者和版本迁移后，持久状态仍能准确决定是否可以继续或核对一个动作？               | e01      |
| 8  | [判断 Agent 改动是否真正改善任务结果](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v08/e02.md)                        | 怎样在模型随机性、轨迹复杂性与评分误差下，证明一个 Agent 版本改动改善了任务而没有引入回归？          | e02      |
| 9  | [把不可信内容挡在数据和动作授权边界外](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v08/e03.md)                           | 怎样使源文件、检索片段或模型提议不能扩大数据权限、泄露秘密或触发未经准确批准的动作？                 | e03      |
| 10 | [发布和回退时保住在途任务与诊断事实](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v08/e04.md)                            | 怎样交付可由他人部署、观测和回退的 Agent 服务，同时不丢失或错误重放在途任务？                 | e04      |
| 11 | [在质量护栏下比较延迟、吞吐和任务成本](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v08/e05.md)                           | 怎样在固定任务分布与质量/安全护栏下，判断缓存、模型选择或并发是否改善 Agent 服务的经济性？          | e05      |
| 12 | [把真实问题证据转成可证伪的 MVP 契约](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v08/p01.md)                         | 怎样从目标用户的真实任务与替代方案出发，决定值得实现的 Agent MVP，并用契约和架构决策解释取舍？       | p01      |
| 13 | [用可复现作品证据完成交付判定与复盘](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v08/p02.md)                            | 怎样让独立评阅者根据可复现作品、真实使用和迁移证据作出有限交付结论，并验证一次改进确实关闭了原失败？         | p02      |

## 每篇的职责与交接

先用f01/f02建立程序与模型边界；c01先判断方案，再读控制循环如何维护授权、记录和恢复。c02把资料变为证据包，c03把拟议写动作变为受控工具，e01落实持久状态。e02判断改动效果，e03核数据和动作边界，e04交付可运维服务，e05比较质量护栏下的延迟与成本。p01把真实用户问题转成MVP决策，p02以作品、比较和使用证据作独立交付判定与改进复验。

p01可先预览真实问题与差异假设，再按原c01/e02先修完成设计任务。其余正式先修保留在课程映射中；阅读顺序没有撤掉原先修。未知任务必须由非作者另行安排，不能把这里公开题与参考解答当保留评价。

## 课程依据

- [专业正文写作与审校标准](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/team/TEXTBOOK_WRITING_STANDARD.md)
- [本轮完整课程规格和原知识点去向](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/team/textbook-v08-spec.md)
- [机器可读模块、正文和能力映射](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/team/textbook-v08-manifest.json)
- [从0到1产品创造路线](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/team/product-creation-curriculum.md)

新正文的作者编写、独立AI文稿审校、实际代码运行、真人行业专家审核、真实学习者作品、用户价值与行业比较分别留证据。旧版本的审校结果不自动适用于本轮；网站真实生成和完整产品达标仍需对应证据。

## 本轮独立检查记录

- [技术内容审校与问题复核](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/team/textbook-v08-content-review.md)
- [教材交付、版本与必要示例验证](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/team/textbook-v08-qa.md)

当前结论与实际检查范围以对应报告为准。目录、规划和文件数量不证明教学质量或学习效果；当前完整产品仍未达标。
