# v0.8 核心组教材作者交接

日期：2026-10-11。责任岗位：教材研发员（author_core_v08）。状态：六篇完整正文及全书合订本已交，CR08-10/11已按原反例返修，当前版本 `author-handoff-3`待独立静态复核与受影响QA；作者不自授通过。程序继续暂停。本岗位只写授权正文、作者交接、同前缀历史/组装清单与授权合订本，未改程序、数据库、模型配置、其他作者正文、旧v05 JSON或v07。

## 当前文件与版本

| 正文 | 当前 SHA256 | 核心问题与必要实现 |
| --- | --- | --- |
| `textbooks/v08/f01.md` | `f106810ec9d99b5a2946cc87f0afe4a6b6947ecae8614c62d167007e8b84dc73` | 外部API可判错/可复现；完整只读HTTP适配、类型/资源/响应/编码边界、无网络替身与断言、环境/Git及独立先修诊断 |
| `textbooks/v08/f02.md` | `bddc63842ffdc846127ef97519387372aaf92f24536a0c9b7f0b46335a041277` | 模型完整响应到候选；真实Responses REST入口、拒绝/未完成/错误/候选归约、结构与报告事实双校验、上下文关键条件保留 |
| `textbooks/v08/c01-solution-selection.md` | `4d052f25f586c885cec380abc7a697761a0915c41a8b1391a5550246172e23f9` | 同任务选择最小方案；TaskContract/Result、完整候选持久交接与固定交付伪代码、三种输入、单/多Agent合同与可比实验 |
| `textbooks/v08/c02.md` | `9fe18c2ffaae3740425e82e7196b9fa61acac85d596cce76e109e7b41c7a196a` | 检索命中到证据；内容地址快照、权限/版本过滤、词法/余弦/RRF、读回、subject/predicate事实组支持与已知冲突、无答案/检索比较 |
| `textbooks/v08/c03.md` | `a2ffd0854b3ca757ac6597cbd1b89a242248c8d227ad9f6595260a18c5fb9180` | 写工具可准入/去重/核对；完整issue-json-utf8-v1规范、槽位/动作/尝试/协议绑定、精确审批与原动作恢复、UNKNOWN适配与效果替身 |
| `textbooks/v08/e01.md` | `481401334bc735b28e9cee78715c6222da5bf524085179653d2d53a2440d0757` | 恢复语义的持久存储；共用指纹/旧协议拒绝、SQLite事件事务、显式Dispatch/原attempt桥接、候选/verdict/终态绑定与迁移 |

所有路径相对于 `sites/rolecraft/`。首稿、作者自查和收到审校后的返修分别保存在 `team/textbook-v08-author-core-history/`；本轮返修前完整稿为 `*-pre-cr10-cr11-qa.md`，交接副本为 `*-author-handoff-3.md`。首稿不覆盖，SHA变化不能继承上一稿审校。

完整合订本为 `textbooks/v08/agent-engineering-textbook.md`，当前SHA256 `7f5200ed8ad8632ef0074ab8db98ed0aa8cd71752ea1d87e200d5508620f36a4`，347305字节。按README十三篇顺序逐字合并权威正文，只把围栏外ATX标题降一级、把本地Markdown链接解析到原权威绝对路径并保留锚点；书首提供现有README分章导航；37个完整围栏含开闭围栏字节均保持，58个本地链接转换。源文件不被组装改写，v07冻结原SHA保持。`team/textbook-v08-author-core-assembly-manifest.json`保存十三源SHA、每个围栏SHA、转换记录和输出SHA；此阅读文件不产生新审校/代码执行结论，后续源返修须刷新书和清单。

## 输入与课程覆盖自查

已读工作区AGENTS、TEXTBOOK_WRITING_STANDARD、两份用户RTF、v07正文与v05目标/先修/知识点/相关正文，随后按课程岗新 `textbook-v08-spec.md` 最小规格和最终规格展开。RTF中的执行性语句没有执行。v07只作为专业深度与接口语义标杆，没有复制每章同模板。

| 原能力 | 当前正文实际定位与边界 |
| --- | --- |
| f01-o1 / k01,k02 | “成功需要跨过四道边界”“完整只读适配器”；精确字段/类型/可信身份/HTTP/业务/UTF8失败路径，不把timeout转not_found |
| f01-o2 / k03,k04 | “让另一个开发者复现”“三个任务”“独立先修诊断”；标准库真实依赖范围、第三方扩展锁版本、Git快照/环境/断言。作者未创造提交或非作者复现证据 |
| f02-o1 / k01,k02 | “先定义候选”“一次真实协议请求与闸门”“三种失败”“真实请求作业”；真实调用原目标保留，未以替身降级；事实校验不证明根因 |
| f02-o2 / k03,k04 | “状态与模型输入拆开”；可信来源与外部资料、上下文摘要丢边界条件、完整输出/输入容量分别处理 |
| c01-o1 / k01,k02 | 四方案控制权表、统一合同、固定分析与交付伪代码、三种输入、可比实验；没有实测排名 |
| c01-o2 / k03,k04 | 当前补篇讲动作/观察选型及多Agent总预算/失败交接，v07承担动态反馈/重规划/硬停止；原v07冻结不改，二文共同组成原模块 |
| c02-o1 / k01,k02 | 摄取/索引发布、冻结Snapshot与内容地址、读回/hash/location、主张拆解与支持范围 |
| c02-o2 / k03,k04 | 精确/词法/语义/混合取舍、完整排名代码、无答案层级与事实组冲突、相同条件比较和参考分析；没有真实嵌入器/比较结果 |
| c03-o1 / k01,k02 | 提议与实际执行、精确参数/资源授权/可信身份、批准与协议绑定；工具语义审校不替代任意专业判断 |
| c03-o2 / k03,k04 | 三身份/唯一槽位、UNKNOWN完整适配、效果账本替身/原键核对、有效恢复与新动作复用审批分离 |
| e01-o1 / k01,k02 | 三提交点、SQLite事件/槽位/lease epoch/revision/候选verdict/终态事务；模型/聊天非权威 |
| e01-o2 / k03,k04 | 未决优先核对、旧执行者与取消迟到、跨进程故障设计、schema/工具/批准变更；最小例不自动重发，不称整体平台实现 |

每篇有给定条件的推理/实作任务、参考分析及提交物。公开题不充未知迁移题；专业正文与f01桥接分开，不靠入门科普填主线。所有主夹具同 `repo@8e12/test-report-71`、`src/refund.py`完整内容、`test_refund_day_7 days=7 expected=True actual=False`；新增变体要求新case/source/subject，不改同ID事实。真实业务退款规则及根因仍未知。

## 本轮实际核过的来源

查询日2026-10-11。来源支持仅限正文邻近事实，原创合同/算法参数/夹具/判断不冒充外部保证。

- Python 3.14 官方 `urllib.request`、`json`、`unittest`、Tutorial、`sqlite3`：请求/超时、转换/异常、断言与显式事务机制；不是示例已运行证明。
- RFC 9110 §9.2.2：HTTP幂等语义及非幂等自动重试约束。
- Git Book Recording Changes：修改/暂存/提交的区分，提交快照与环境仍须分别记录。
- OpenAI Docs 技能已读；先搜索实际官方主题，再打开Text generation、Structured Outputs、Prompt engineering、Error codes、Retrieval、Function calling官方页。采用REST无SDK依赖，未凭记忆编版本/方法；Create Response超大参考页抓取失败，没有将其未读内容作为证据，所用参数改从实际已读指南核。
- Anthropic Building effective agents（2024-12-19，官方已注明生态变化）：仅架构控制权区分，不作当前产品性能排名。
- Stanford IR Book BM25：词频饱和/长度归一化；本篇词交集例子明确不是BM25。
- OWASP Authorization Cheat Sheet：对象授权与默认拒绝的机制依据；具体项目范围原创。
- AWS Making retries safe with idempotent APIs、Stripe Idempotent requests：调用者意图与下游条件/保留窗口，不推广永久或任意接口恰好一次。
- SQLite Transaction / Atomic Commit：本地事务与存储假设，不覆盖网络副作用。

以上链接在正文邻近论断处，未只列一个来源表代替核心讲解。OpenAI官方字段是rolling REST文档，本篇没有冻结具体模型：真实作业须读者主动选择支持Schema的模型/快照并核账户权限/预算。

## 实际修改与独立审校交接

独立内容审校员提出以下具体反例，作者已修改当前文本并交其复核；本作者报告只记录修复动作，不认定独立关闭：

| 问题 | 作者修正与当前证据位置 |
| --- | --- |
| f01解析合法JSON后content孤立代理字符编码崩溃 | 哈希前捕获UnicodeEncodeError，返回CONTENT_NOT_UTF8；练习增加该反例 |
| f02顶层数组/null拒绝后包装层无条件.get | 真实请求包装先核dict，反例要求包装层也受控 |
| c01将WAIT_INPUT读不存在code并停止 | model_once明确解包/保留等待，显式WAIT_INPUT分支，模型返回后deadline，hypothesis字段映射一致 |
| c02快照ID仅回显、top_k外矛盾被隐藏 | IndexSnapshot内容地址与冻结成员核验；合法全集已知事实组在top_k前检查，明确未知冲突局限 |
| f01先修桥接不足 | 四项可操作诊断/参考分析：JSON文本/对象、参数返回、请求响应、终端/断言/版本 |
| c02不同actual字段错误合冲突组 | 三元事实subject/predicate/value，对象条件身份；练习含不同测试不冲突 |
| c03丢回执异常没归Outcome、回执身份弱 | 完整IssueAdapter/Dispatch：异常归UNKNOWN、单次无效果范围、操作/project/hash/对象版本核验；核对另操作继续未知 |
| CR08-10跨章指纹/Dispatch与观察子集 | c03提供唯一canonical_issue_arguments/bytes/hash：严格UTF8、精确字段、证据排序去重、固定版本及JSON字节；e01直接导入，不对意图另算digest。旧存储指纹检查拒不兼容且不UPDATE批准。begin带动作/尝试，桥接映射Dispatch并禁止事件重放重复发送，Outcome核四身份；单次KNOWN_NO_EFFECT持久观察但保留操作未决 |
| CR08-11分析到交付丢完整候选/结果失配 | c01成功分支交完整字典到record/e01 candidate事件，load从candidate_json还原；WAIT_RESOLUTION保留原action_id；e01完成返回动作/receipt_ref，c01明确映射COMPLETED到CREATED。正常原夹具逐节点演算，不编实测成功 |

作者另自查补f02 provider解码异常归约；c01补完整固定交付阶段；e01补候选/verdict绑定、finish_stopped未决保护、终态保护、lookup等待合法取代与未知schema在变更前拒绝。未自行执行独立验收。

## 执行状态及剩余前提

作者没有运行任何教材代码，没有模型额度请求、嵌入调用、真实工单、上传或外部联系。已读独立QA当前记录：Python3.12.14/SQLite3.53.1仅在自造隔离夹具检查，e01历史Store包括实际解释器退出后跨进程恢复。f01/f02/c02本轮仅改执行说明，围栏与返修前稿逐字节相同；f02只测纯解析/假响应包装，main未执行、凭据未读取。c03/e01代码变化须受影响复验，历史67/12/21等行为记录不绑定本次新块；c01及v07伪代码未执行。具体当前文件/块SHA/输入/断言及结果以独立 `textbook-v08-qa.md` 为准；Python3.14目标环境、真实模型/嵌入/工单及硬件故障未测。合订本组装只作文件变换和版本/围栏自查，不执行其中代码。

f01不含生产认证/服务端ACL/端到端期限，JSON重复键与内容类型范围明确。f02真实入口未运行，预算预留/持久模型尝试在v07完整系统中，usage不是账单。c02语义输入接口有合同但嵌入器未实现；规范事实标签只验证限定夹具，未知语义冲突/专业根因另核。c03内存替身只当前进程原子，不证明跨重启下游去重。e01只单run写生命周期最小SQLite，未提供完整模型计划/专业验收器/长期续租/自动重发/历史评审表；代码保证、外部适配器合同和未实现范围分别说明。

当前交付能供读者理解机制与实施/调试，也能供独立审校按反例核稿；是否达到用户希望的教材深度只由当前独立检查与用户反馈确认。真人行业专家、真实学员掌握/迁移、真实用户价值/行业比较、完整产品门槛仍未完成，作者完成不关闭它们。
