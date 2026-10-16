# v12教材接入独立QA

2026-10-12（Asia/Shanghai）；独立测试工程师；冻结时间UTC `2026-10-11T17:00:13.834229+00:00`。

**已验证的静态、HTTP与隔离VM范围达标；全部必要接入条件为证据不足；完整培养与行业先进目标未达标。** 实际浏览器通道不可用，不能用接口、模拟文档或PM交付展示替代图示、点击、刷新后退与导出验收。

当前客户端 `local-workbench-0.12-textbook`，检索 `content-retrieval-0.12-v12`，教材 `textbook-v12`。30篇、273小节；corpus SHA256 `1a385b179c0cb8a5b838d17b9d2606a0c1a7e27636d97db45dba5e2a52b2840e`，冻结合订本SHA256 `25ce2aaa1be0ba0f2814dd1247ac6299d106c3d2e48f43867c49055490c2801e`。实际测试Node24.16.0，本机固定中文BGE量化512维CPU；没有外部收费API调用。

## 实际结果

- 30篇全文、正式阅读顺序、先修和源SHA全部核对；目录/正文API与展示包同源。新原文向量561段×512维覆盖30篇，未把v10向量换标签。5个图资产格式、20个公开引用/示例（共25目标）源字节、派生字节与HTTP字节一致。公开Python示例是只读text/plain，本轮没有执行教材例。
- 实际客户端渲染器在隔离Node VM生成273标题与410链接，目标有效。它证明静态标记和状态逻辑；实际DOM、视觉、图片放大、点击、下载和剪贴板未被验证。
- 首候选独立21查询为18过/3失败，其中产品固定12输入全部通过。三个独立新增漏检由原检索岗窄修；最终仅原3及4条直接相关对照共7条真实HTTP复验，7过/0失败。首候选输出和失败绑定保留，没有声称最终21全重跑或任意中文可靠。
- ReAct、Planning、Replanning有限输入推荐到n03真实相应机制小节；逐字摘录、源路径/SHA、版本及稳定小节href核对。恢复/成本、多意图、否定ReAct、前端React歧义和生活无匹配按有限约定检查。
- 174旧小节ID仍存在，但20旧篇新版全源SHA均变化。旧记录身份保留textbook-v10；明确旧链接使用`?version=textbook-v10`。隔离VM中v11旧键与rolecraft-v1原值保持，新n03记录单列v12与源SHA，模拟导出含旧原始值；实际浏览器查看、写入和导出未验。
- 仅临时公共源码副本制造旧corpusHash失配，真实HTTP返回unavailable而非no_match；当前服务随后真实BGE成功。VM拒旧响应和错误旧缓存。实际教材/模型/用户记录未被故障注入。

## 反例与复验

| 缺陷 | 首次事实与原因 | 唯一修复责任 | 最终有限复验 |
| --- | --- | --- | --- |
| QI12-RET01 / V12Q14 | 旧泛记忆澄清先于明确撤回任务，未推荐真实n02。 | 内容检索工程师 | 原输入实过，相关n02/n07/n10原文及小节目标核对；仅HTTP/来源范围关闭 |
| QI12-RET02 / V12Q18 | 明确A2A交接意图被最多三类预算挤出，未覆盖n07。 | 内容检索工程师 | 原输入实过，相关n02/n07/n10原文及小节目标核对；仅HTTP/来源范围关闭 |
| QI12-RET03 / V12Q21 | n10任务描述线索不足，跨语言证据偏离/移交被恢复等主题占据。 | 内容检索工程师 | 原输入实过，相关n02/n07/n10原文及小节目标核对；仅HTTP/来源范围关闭 |

首版核心SHA `7905edee26ab460c8a78accb4e3fcb0bd1ff97e0d44885ba3df7c7713b2fbfb6`；返修核心SHA `b3535b2249effdb0118713295ae9b86e117e0d86c86041aade3e8c33a0fc092d`。窄修明确专题与泛记忆澄清的优先级、有限意图预算和排错移交线索，仍使用实际BGE与真实正文；正文、原文向量及模型身份未因此变更。7条最终输入为V12Q07/08/14/15/18/21与泛“我想学记忆”对照V12C01。

QA夹具的URLSearchParams缺失、markdown调用参数、空选用例以及历史只读空存储壳的过严断言，均保留于harness-setup-notes与首产物；修正测试夹具后核同一客户端源，不把这些错误登记为应用缺陷。

## 必要条件分层

| 条件 | 已验证层 | 必要条件当前状态与限制 |
| --- | --- | --- |
| VI12-01 | 静态/HTTP/隔离VM通过，按对应范围 | insufficient；正式顺序/先修与30篇源全文、catalog和默认版本一致；隔离VM入口/阅读页身份正确。真实首页→路线→目录→第1/18/30篇及相邻点击未执行。 |
| VI12-02 | 静态/HTTP/隔离VM通过，按对应范围 | insufficient；30全文/273标题、25公开资源字节及410渲染链接目标核对通过；公开.py为text/plain，不执行示例。图视觉/放大、表格代码可读及实际引用点击待验。 |
| VI12-03 | 静态/HTTP/隔离VM通过，按对应范围 | pass；当前index/data/正文接口/561×512新原文向量及推荐源路径、SHA、逐字摘录和小节链接均为textbook-v12；没有将v10向量改标签。 |
| VI12-04 | 静态/HTTP/隔离VM通过，按对应范围 | pass；固定12新ReAct/Planning/Replanning与旧恢复/多意图/否定/前端React/无匹配均在首候选实过；独立新增9项首轮6过3失败，窄修后原3+直接相关4项实过。不宣称最终21全重跑或任意中文可靠。 |
| VI12-05 | 静态/HTTP/隔离VM通过，按对应范围 | insufficient；174旧小节ID保留，20旧单元新版全源SHA均不同。隔离VM中旧v11学习/query与rolecraft-v1原值保持，旧记录标v10/新n03记录附v12与源SHA，模拟JSON导出保存旧原值；真实查看/写入/导出/刷新后退未验。 |
| VI12-06 | 静态/HTTP/隔离VM通过，按对应范围 | pass；临时副本故意使用旧corpusHash，真实HTTP返回unavailable而非no_match；正常当前语料随后真实语义成功。VM拒旧响应与错误旧缓存，不混入当前推荐；没有破坏运行中模型、用户DB或实际缓存。 |

真实UI开放项：VIT12-01/02/03/08的页面与操作证据不足；其他VIT服务结论仅在HTTP范围通过。所有场景的实际浏览器层都未核。按产品VI12-01..06/VIT12-01..09原条件判定，完整接入为`insufficient`，没有降低必要条件。官方CUA inventory返回无browser；阅读官方故障文档后按公开ID2一次恢复仍不可用；新QA页0、未读改用户浏览器旧记录，未换驱动或改设置。

## 保护、绑定和运行清理

收到基线的实际命名名单是799项，原始端点对照797一致、2变化。基线元数据拟排除行政记录，但选择器实际纳入team/TASKS.md和RETROSPECTIVES.md：两者为PM授权追加AP12/R19，收到长度的完整字节前缀SHA均相同。**797项专业/公开保护文件全部一致；2项行政追加单列，不能称799全一致。** 原基线和原始对照未改，范围澄清附新证据。这是指定起止点的命名对照，不是持续监控或全工作区无变更声明。

58项收到可变实现中7项改变；当前工程109项与前端10项声明SHA共119项独立核全部相符。新文件没有伪造旧基线。教材v12/旧v10、历史专业报告/标准原样保留，原产品标准SHA与八ID不变。

QA自有4453首候选与返修服务分别SIGINT退出0（session89947、15820），最终lsof无监听；临时故障56352正常await close后退出0；请求CLI均退出0。没有关闭用户4318、读取或迁移用户数据库，新QA浏览器页为0。正式4318工程收据为Node24.16.0/PID23034/PTY13862，旧95893/81687本轮实际正常退出0，既有数据路径沿用；这是工程操作证据，不替QA浏览器验收。PM正式目录显示同样仅为交付展示。

## 原八门槛当前复盘

标准 `product-creation-2026-10-10`，原ID/条件不变。此表按当前证据判断，不自动继承旧报告通过。

| 门槛 | 状态 | 当前证据、差距及责任行动 |
| --- | --- | --- |
| user_value 用户价值 | insufficient | 已有真人react报障与本轮使用新版教材的请求；没有按预定义目标人群、问题、指标及阈值完成的价值试点结果。 用户研究员向产品经理交真实目标用户证据与预定义试点，再独立核结果。 |
| teaching_quality 教学覆盖与深度 | insufficient | v12已有30单元、独立AI内容审校及12新增有限离线例的历史证据；接入检查保留这些证据，未新增真人专家/全部外部技术契约/实际学习成效验证。 课程架构师整合内容审校员与实际行业专家/学习评估证据。 |
| real_generation 真实教材生成 | fail | 本轮实际BGE对固定教材做检索，未形成按学习档案真实生成教材并记录来源/示例验证/失败恢复的功能；工程正式服务generation配置仍false。QA未调用生成接口或付费供应商。 AI生成工程师负责模型与生成链路，后端数据工程师负责档案/任务/版本，交原软件工程责任域集成。 |
| comparative_advantage 可比差异化优势 | insufficient | 市场面试/岗位样本是已有研究依据；没有当前学习产品在公平同任务/样本/资源/评分条件下的行业基线实测与专业评审。 竞品研究员向产品经理交可比基线和实测，产品经理维持条件。 |
| learner_creation 学习者创造产品能力 | insufficient | 教材示例与结构完整并非真实学习者MVP；缺真实学习者作品、目标用户验证及独立评审达到既定评分的证据。 实训评估员向课程架构师交真实学员独立作品评价，不代作答。 |
| reliable_delivery 生产可靠交付 | fail | 本轮是本地只读内容接入/检索；旧账户数据库和任务服务有历史有限验证但不重认证。本版必要真实UI证据不足，也没有完整正式运行范围账户隔离/持久化/异常恢复的当前生产证据。 后端数据工程师与软件工程师按正式运行范围分别交付，QA独立核当前系统。 |
| operating_economics 成本与运营 | insufficient | 本机查询耗时仅为本次测试记录；缺实际生成成本账单、交付质量、事前预算和维护的运营结果。 运营分析员向产品经理交实际成本/耗时/质量及维护数据。 |
| iteration_trace 产出复盘与复验 | pass | 限定本轮：收到基线、3独立失败、原因/责任、作者窄修、原3与直接相关4实际复验、当前源/声明绑定、保护范围差异澄清与清理均记录；真实UI未验留开放。 项目经理按本轮实际证据维护AP12/R19，软件与QA后续仅完成开放浏览器范围。 |

`iteration_trace`仅授本轮有限反例改进闭环通过，开放UI明确保留。`real_generation`与`reliable_delivery`未通过，其他完整价值、专业、行业、学员与经济证据不足，因此完整目标为`not_met`。v12已有独立AI审校和有限例证据，并非正文完全缺失；它们不等于真人专家、学员作品、录用或行业先进。

## 证据入口

- [结构化最终报告](app-v12-textbook-integration-qa.json)，保留原标准逐字criterion、VI/VIT分层、原3失败及7复验。
- [收到基线](app-v12-textbook-integration-qa-baseline.json)、[原始保护端点](app-v12-textbook-integration-qa-history/protected-final.json)、[行政范围澄清及旧字节前缀证据](app-v12-textbook-integration-qa-history/baseline-scope-reconciliation.json)。
- [首21真实HTTP](app-v12-textbook-integration-qa-history/http-candidate.json)、[最终7有限复验](app-v12-textbook-integration-qa-history/http-repair.json)、[全文/资源HTTP](app-v12-textbook-integration-qa-history/transport-candidate.json)、[临时失配](app-v12-textbook-integration-qa-history/mismatch-http.json)。
- [客户端VM逻辑](app-v12-textbook-integration-qa-history/client-logic-final.json)、[实际UI通道限制](app-v12-textbook-integration-qa-history/ui-availability.json)、[运行清理](app-v12-textbook-integration-qa-history/cleanup-final.json)。
- [当前版本/119声明绑定](app-v12-textbook-integration-qa-history/final-version-binding.json)、[最终证据SHA绑定](app-v12-textbook-integration-qa-final-binding.json)。

下一步仅在官方浏览器可用后补真实图/点击/定位/刷新后退/历史记录与实际导出。专业生成、真人学习/专家与行业基线等缺口按原领域继续推进；本轮不扩大检索复验或重跑全书示例。
