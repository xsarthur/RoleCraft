# v09 教材作者交接

教材研发员已交出二十个阅读单元与完整合订本。新路线先问题、验收与信任，再建立程序、模型、证据、工具与存储，最后连接固定流程、完整动态循环及评价交付。原十二模块、二十四目标和四十八知识点的规划去向由课程岗维护；正文实际覆盖及顺读条件交独立审校，不由作者自授通过。

完整教材：[Agent 工程教材](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v09/agent-engineering-textbook.md)。分章目录由课程架构师维护：[阅读目录](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v09/README.md)。

## 实际写入范围

本轮只写 textbooks/v09 中的正文与合订本，以及本作者交接、组装清单和同前缀history；README、课程四件和独立检查报告由其责任人维护。没有修改网站程序、服务、数据库、旧教材包装或产品门槛，没有供应商请求、业务读取写入、上传发布或外部联系。作者未运行教材代码。

基线比较记录覆盖266个旧文件，当前无字节差异，见 [冻结基线](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/team/textbook-v09-author-history/frozen-baseline.json)。v07仍为996e5aeb084b66405a0dd1023a375743d2e359c335b29517ac923f9f6a033c5c；当前旧v08合订本为f68f553bcd5fd6a86ef988fd780d5433cd305413111c5c4d08966a7fc39b3816，与历史记录fd9f295不同。该差异作为收到的状态保留，本轮没有恢复、覆盖或套用旧整书结论；迁移依据课程冻结的十三个逐篇权威源。

## 新增和拆分的交接

- 学习入口明确教学夹具、真实问题、阶段产物与诊断路线。新预备用一个独立短程序练JSON文本、类型、函数返回、分支、异常、断言、终端及退出状态，附改错和参考分析，不先要求执行完整API实现。
- 问题发现取原p01问题、替代与可证伪假设；YAML为事前计划，经济实测后置。完整MVP篇接评价先修，冻结计划；首次真实敏感读取或写入须先完成e03并有实际授权，真实交付还需e04，完整费用比较在e05后补。
- 任务验收与信任导读给具体记录、允许停止和分类反例，完整grader、通道投影及批准替身留在后置专业章。
- 原c01选型取1至24、200至234行，完整类型、fixed_analysis及fixed_delivery取26至199行后置。动作身份导读新增短轨迹，完整v07循环在组件与存储后保留全文，未复制巨型类型作前置课。
- f01原208至217行的补学职责进入预备课，专业实现、复现、练习及完整块留在f01。其余主章只改新先修、导航、输出交接、标题及必要状态句。每个源范围、源SHA、目标SHA和完整围栏位置见组装清单。

## 原反例返修

基础诊断改为先浏览完整短程序再判断，避免题目前缺函数定义；补Python官方安装入口。JSON合法长整数可能在解析阶段触发ValueError，新增限定解析分支返回NUMBER_PARSE_LIMIT，业务可解析但超范围仍返回DAYS；没有笼统吞掉全部程序错误。完整返修前快照保留在history。

迁移删除e02/e03/e04/e05/p02中无当前依据的“上述QA”“本轮独立QA符合预期”等继承句，保留题定输出和适用限制，章末只指本轮记录。所有相关代码围栏保持原字节。独立内容审校已按原例复核CR09-01、CR09-02长整数解析、CR09-03执行来源句，静态关闭；实际覆盖和合订本检查仍以其最终报告为准。

QA导航原例：e02与p02两处链接少了新版标题空格对应的连字符。此次只补正确锚点，并同步合订本及源绑定；正文机制与39个围栏未改。前修文件、清单与报告完整保存在history，原例独立复核待QA登记。

## 作者文件自查与执行边界

作者仅做读取、编辑、哈希和组装自查：十三权威源SHA与课程源表一致，原37个完整围栏全部有新版去向；新增预备Python和任务记录YAML两个围栏，共39。合订时只降低围栏外标题层级、转换本地Markdown链接及增加章首权威链接，完整围栏逐字不改。该文件比较不是独立QA或教学行为验证。

独立QA已交新预备程序的有限执行证据：实际系统Python3.14.5、QA临时目录、最小环境及-I/-B，14组解析/结构/业务输入，默认、拒绝、断言、故意失败与恢复对应实际退出0/2/0/1/0；原长整数反例另留证。绑定当前01源9e21a39ca80ea9045111885d33f8a60e0c5fc403a43e74b86f0f58a23347abad，Python代码体SHA bf605ae22047981acc2bfc68705d88c551fffe9d77f616a85eb6981986e4b456。依据 [源绑定](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/team/textbook-v09-qa-history/stage02-foundation/source.json) 与 [实际执行](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/team/textbook-v09-qa-history/stage02-foundation/execution.json)；这不等于全书Python3.14验证。

旧37块未在本轮重跑，原v08 Python3.12.14/SQLite3.53.1的有限记录仍只属原源和原范围。固定流程、完整动态循环伪代码未执行；真实模型、嵌入、工单供应商、费用、学习者、用户市场及真人专业判断均不能从迁移和上述预备程序推得。最新本轮范围以 [独立QA](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/team/textbook-v09-qa.md) 与 [内容审校](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/team/textbook-v09-content-review.md) 为准。

## 当前版本与组装规则

合订本SHA256：`a211e6ef6372f66ba6cedb6a612f28e353b315f228cb974808be1c00abf75124`；381066字节，20单元，39完整围栏。

组装清单：[assembly manifest](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/team/textbook-v09-author-assembly-manifest.json)，SHA256 `7219a003a72ada236964f82ca041a1cd8722b70e2a875f861e959aeb7ef34b1e`。其含全部逐篇来源、拆分范围、源/目标/块SHA、转换后的正文及章块SHA。可复现组装脚本 [assemble-v09.py](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/team/textbook-v09-author-history/assemble-v09.py) 只读教材文本，不导入或执行围栏内容。

| 顺序 | 权威正文 | SHA256 |
| --- | --- | --- |
| 1 | [00-learning-route](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v09/00-learning-route.md) | `5b61bb59a3db5973f2f8ed2312a6e61e5368b2fba34ba9a1c8853333e160defa` |
| 2 | [01-foundation](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v09/01-foundation.md) | `9e21a39ca80ea9045111885d33f8a60e0c5fc403a43e74b86f0f58a23347abad` |
| 3 | [p01-discovery](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v09/p01-discovery.md) | `dfbaf177deeba2bd4f71a633764533a65dce7d14d036e75400744e8c0aee111b` |
| 4 | [02-task-acceptance](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v09/02-task-acceptance.md) | `73d4157f1db7a146b7f84c7913be05dadbb91d2a256560531a7ae748932bc5fc` |
| 5 | [03-trust-boundary](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v09/03-trust-boundary.md) | `ede8fbe33929ecceafe800fadcc20186c854f8b4bd4b8288e6b74d3690db1f53` |
| 6 | [f01](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v09/f01.md) | `a960288d8ffd5ba281ed3aec1366433533ba22ee7eddfc5c0537a84f6f4b3b6b` |
| 7 | [f02](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v09/f02.md) | `341f74e36852a020fb4633ee284396f95082e762a61010d6d10b1cedfb19fe05` |
| 8 | [c01-selection](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v09/c01-selection.md) | `355227e0afb68966bbe287db68fb5d3006607b16c8d12bc49a53dbff8ce2e03f` |
| 9 | [c01-control-primer](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v09/c01-control-primer.md) | `345dd67c5bd8165a9d77dc7de819133f50dfcf39f91f59dec05bf385aba3d8c8` |
| 10 | [c02](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v09/c02.md) | `dcc837358d21523fe5cfb16e91682220346b151ed86b84a294f48dd6aee7aff8` |
| 11 | [c03](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v09/c03.md) | `5784b4d0332cc9ddce2277fcdcae2f39b7d2c0887426a0e13f1db89081369d4b` |
| 12 | [e01](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v09/e01.md) | `86af5b074a277c5f2325e53767cea17218a75c4ce5529cec254c01e8a9858b11` |
| 13 | [c01-fixed-workflow](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v09/c01-fixed-workflow.md) | `d4f8ea6dd8065d0afc2a4c2176964161a03e23463397b2518036b7e11530822e` |
| 14 | [c01-control-loop](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v09/c01-control-loop.md) | `219153f9251e4de8bcfc3500d06c81c49d1fca11b297b0e6c0eafb289c6dca38` |
| 15 | [e02](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v09/e02.md) | `ee08b65f1bd78bf87324d7edac1a7642dae74f7fb1fadd41f4197410b32f4069` |
| 16 | [p01-mvp](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v09/p01-mvp.md) | `132588d00a4338c3791637ddefabcbe11841f51c02f0e50bc3901758510337c5` |
| 17 | [e03](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v09/e03.md) | `e91f8462415fe1c3906eb8b5740b94a59310adaee72bc20124d401f56a258dc0` |
| 18 | [e04](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v09/e04.md) | `de92b0f2c1de87aacf7a549c39965fb68e43f667e9f34804907895df6b5a6cd2` |
| 19 | [e05](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v09/e05.md) | `649430ad094793c4740c5fda6224d7917a5bf3cfe6b5b3136e1ede20915a67b1` |
| 20 | [p02](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v09/p02.md) | `edee96e191076ca60a182d830cdd60cab6d2054e1acc9bfa3a2009c53e3427a4` |

当前交接给内容审校与QA核新上下文、原能力覆盖、来源/导航和组装；读者认可、真实学习效果、真人专家和完整产品达标仍需各自证据。若原反例仍未解决，作者按其责任范围返修并同步合订本及清单，不改旧材料。
