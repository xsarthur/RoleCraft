# v10 开篇与教学图作者交接

本次把开篇改为“认识 Agent 工程”：先定义本书讨论的 Agent，再用具体任务判断普通程序、单次模型、固定流程与动态路径何时足够，随后用任务闭环和工程全景连接二十篇正文。原实作入口、诊断、阶段产物和选型练习保留在概念与全貌之后。

只写新增 v10 教材、教学图和本岗位记录。应用程序、服务、数据库和旧教材未修改；没有执行教学代码、发起模型请求、进行真实业务动作或上传发布。

## 当前交付

| 产物 | SHA256 |
| --- | --- |
| [开篇](../textbooks/v10/00-learning-route.md) | `d340011efd35ac0baade39165b238dda561f0cee19f226768e1538e3fc8be1ac` |
| [阅读目录](../textbooks/v10/README.md) | `6958afe2292ed024bf6fb7a526869a4ecce3c22bc124c9f8ae81ad8f8014a8cf` |
| [完整教材](../textbooks/v10/agent-engineering-textbook.md) | `6707a4f03b298a5b234ce56a88edcbd9d79af6d40cb978227461a9d9d522f76e` |
| [组装与来源清单](textbook-v10-opening-author-assembly-manifest.json) | `476bab05b50ca9753870a6db4ebba64dea53cd1b24558a4b9eca24dfcb388885` |

合订本为二十篇、392881字节、4388行；文首直接进入Agent定义，没有先放制作说明。每篇正文之后提供权威原文链接。清单保存二十篇源、旧源去向、每个完整围栏、两图及渲染工具的SHA；本报告本身的SHA由交接消息提供，避免循环绑定。

十九篇专业正文以当前v09逐篇文件为源。其中十篇只把末尾指向v09 QA的“本轮记录”改成“原版验证记录”，链接目的地保留。三十九个旧围栏的起始、正文、结束及换行逐字保留；没有增加教学程序，也没有重跑旧行为。原二十单元先修和能力映射沿用课程规格，不重定目标、门槛或产品结论。

## 两张图

| 教学图 | 原生源 / SVG / PNG 的 SHA256 |
| --- | --- |
| [任务运行闭环 DOT](../textbooks/v10/assets/agent-runtime-loop.dot) · [SVG](../textbooks/v10/assets/agent-runtime-loop.svg) · [PNG](../textbooks/v10/assets/agent-runtime-loop.png) | DOT `7fcde3319a3f611f3909472530a29e73480ab5a8049b65313be53278e312ee5b`；SVG `c1929a8021f331df4452e949272028fcde05c037b996453e883d3f84a83e5a15`；PNG `9497f77fa43566eb621549175ee55870a02b50e8ebd3144405e820d0ac2c7106` |
| [工程全景 DOT](../textbooks/v10/assets/agent-engineering-landscape.dot) · [SVG](../textbooks/v10/assets/agent-engineering-landscape.svg) · [PNG](../textbooks/v10/assets/agent-engineering-landscape.png) | DOT `7a280385d49ebefe9c4d82bd81630101f67692c8ea7ac5cfb61194b70f1c829b`；SVG `fd235b6f248af4ada7556044a7c393810832cde838f0945c98a7a22b3bd0a8f9`；PNG `7136b1c83c29f3ed357437e3c9885901b8b90238763e6263dead3fdd89249bd6` |

运行图区分模型提议、可信准入、工具、事实、任务判定和继续反馈；候选、拒绝或等待可以走不发工具的旁路。全景图用分组表达问题、选择、组件、控制、评价安全和交付成本复盘；二十实际章名的可点击对应表在开篇，工程关系不替代先修或阅读顺序。

两图使用Graphviz14.1.3（Viz.js3.25.0、neato）渲染SVG，sharp0.35.5生成PNG。中文字体估宽警告保留在[渲染记录](textbook-v10-opening-author-history/diagram-render-record.json)；以固定布局、独立旁注和图外反馈线路处理，不删关系。作者已查看当前PNG。QA已独立按原图反例复核PNG及760px SVG预览，通知QA10-01/02关闭；这是有限离线图示复核，未声称浏览器CSS实测。原稿和各次返修快照保留在本岗位history，完整独立结论以QA报告为准。

## 依据与复现

正文定义和足够方案参照实际读取的[Anthropic原文](https://www.anthropic.com/engineering/building-effective-agents)，仅采用控制路径与简单方案原则；环境信息与动作交错的有限说明参照[ReAct原论文摘要](https://arxiv.org/abs/2210.03629)。宿主准入、权威记录、未知效果与验收分工是本书设计约束，没有从概念来源推导供应商或业务保证。

按[课程窄规格](textbook-v10-opening-spec.md)组装；[组装脚本](textbook-v10-opening-author-history/assemble-v10.py)只读取Markdown/JSON、核摘要并写新书和作者清单。它按二十篇顺序拼接，只降低围栏外ATX标题一级、把本地Markdown链接及图片转换为指向原权威文件的绝对路径，再添加章末原文链接。可在工作区运行该脚本重新得到同一合订本；它不导入或执行教材代码。[图示渲染脚本](textbook-v10-opening-author-history/render-diagrams.cjs)仅消费两份DOT。

作者收到状态的46文件摘要在[基线](textbook-v10-opening-author-history/received-baseline.json)中；本次组装对照没有变化，属于作者文件自查。v09开篇收到的表格格式差异和v08合订本当前状态均保留，不恢复历史SHA、不归因。独立保护范围由QA另外核对。

本次没有新代码执行结论。v09基础程序的有限Python3.14.5记录、v08部分例子的Python3.12.14/SQLite3.53.1记录仍只适用原源与原路径；固定流程、完整动态循环和真实外部契约未由此次迁移验证。源字节不变也不授予新上下文、学习效果、真人专家或完整产品通过。

## 独立交接

作者完成规格、源字节、围栏与组装自查后冻结当前稿，交[内容审校](textbook-v10-opening-content-review.md)和[交付QA](textbook-v10-opening-qa.md)做最终当前绑定。作者不审校自己或自授通过。独立报告后若出现具体反例，由本岗保留前稿、修正文或教学图，再刷新清单和整书。
