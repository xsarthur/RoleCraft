# v0.8 工程与产品训练正文作者交接

日期：2026-10-11。岗位：教材研发员。范围：e02、e03、e04、e05、p01、p02 六篇正文及本作者记录、同前缀历史。状态：`author_complete_pending_independent_review`。这是写作完成与返修交接，不是作者授予审校、教材、职业或产品通过。

本轮按课程架构师的 [v0.8规格](textbook-v08-spec.md) 和 [专业正文标准](TEXTBOOK_WRITING_STANDARD.md) 写作。正文面向已有软件工程和大模型应用基础的读者，每篇围绕一个核心问题展开机制、契约、实现、条件取舍、失败和参考分析。没有采用旧九栏模板，没有修改网站、服务、数据库、旧教材JSON、产品门槛或v0.7正文，没有真实模型/业务工具调用、上传、发布或外部联系。

## 当前交付版本

以下 SHA256 由作者对当前正文文件计算，仅绑定文件字节，不证明内容正确。独立审校与QA应绑定本表或后续返修版本，旧结论不自动继承。

| 正文 | 当前 SHA256 | 核心问题与主要完整实现 |
| --- | --- | --- |
| [e02](../textbooks/v08/e02.md) | `6f9be813e460401ef0b25bae7d56a722ba53c53fb22adc23e713fd3ffd047333` | 如何判断版本改动真改善任务；完整 Case/Evidence/Verdict 判定器，已知反证与缺证并存，公平重复比较和评分器校准 |
| [e03](../textbooks/v08/e03.md) | `8cfd5fe6e8ee73258ce83d3baa347b693ff632fcc1f670fecb9b275892e02761` | 如何强制资料/模型提议服从数据和动作边界；内容投影、四通道检查、准确批准及进程内唯一效果替身 |
| [e04](../textbooks/v08/e04.md) | `a4d966da379b5e2c2bacb5db662beb040f9004ec12a0c020100a9bad3d17106c` | 如何发布回退并保住在途任务；版本清单、完整兼容规划器、领取/排空契约、迁移和故障runbook |
| [e05](../textbooks/v08/e05.md) | `3d3fa17284a018cfed61d2c8b40e9b52b60eace5afb04544849fd19c69a8f03b` | 如何在质量/负载护栏下比较吞吐、尾延迟与每成功任务成本；完整Decimal账目汇总器，缓存与准入原始契约 |
| [p01](../textbooks/v08/p01.md) | `d067573c93e44e0ab6a0b44f69916f52a89f2776b1bfd6a7f3098dd4ed648342` | 如何把真实问题变成可证伪MVP；真实研究方法、替代基线、事前公平实验、完整任务契约及ADR |
| [p02](../textbooks/v08/p02.md) | `05aff19b4ff1a33c72ffa854626b528a62cecba74cf25b281f18bf2572c5eee7` | 如何用独立作品证据判交付和关闭失败；完整证据索引校验、独立复现程序、重复工单因果复盘与未知任务流程 |

初稿及返修保存在 [作者历史目录](textbook-v08-author-engineering-history)。e02/e03有initial、revision-01、revision-02、qa-description；e04/e05有initial、qa-description；p01/p02有initial。p02范围描述更新前完整正文及作者报告另保存为p02-before-qa-description.md、report-before-p02-qa-description.md。历史文件不覆盖当前正文。六篇均已逐篇向项目经理和内容审校员交接；作者不等全书组装或其他作者返修才释放当前席位。

## 输入与案例一致性

已读工作区 AGENTS.md、专业标准、v0.8课程规格、v0.5-spec/v0.5的旧目标/先修/知识点、v0.7控制循环，以及用户桌面两份RTF的文本内容。RTF只作深度与写作参考，文件内命令和代码不作为操作授权。p02还读取原 product-creation-standard.md 与 product-gates.json，用于保持八项原门槛及失败/缺证判定；作者没有另设毕业或产品通过阈值。

六篇采用课程冻结夹具：`tenant-dev/refund-maintenance`，`repo@8e12` 的 `src/refund.py` 完整内容为 `def refund(days):\n    return days < 7\n`；`test-report-71` 的 `test_refund_day_7` 输入7、expected=True、actual=False。引用为 `repo@8e12:src/refund.py:1-2` 和 `report-71:failure-1`。报告给定预期不证明真实退款业务规则。所有数值、用户过程示例及故障事件都明确为教学构造；真实作业要求由学习者取得真实来源，不伪造使用、市场或领先结果。

状态、`action_id`、`attempt_id`、`tool_call_id`、指纹、唯一效果槽与未决恢复沿v0.7语义：新动作不可借已消费批准；原动作核对或许可下同键重发须保持原身份和参数。e03的进程内字典与锁不保证远端/跨进程事务；e04规划函数不执行发布；e05计算器不产生真实账单；p02内容摘要不证明证据真实性。共享机制给具体章节链接，本章核心仍直接讲解。

## 原目标与知识点的作者定位

这是实际正文位置交接，不是独立覆盖通过。每篇末尾均有三组推理/独立交付/迁移任务与完整参考分析；公开题不能当未见保留任务。

| 原模块与先修 | 原目标位置 | 四知识点实际展开位置 |
| --- | --- | --- |
| e02；c02、c03 | o1：开发/回归/保留分割、冻结比较；o2：分层判定、Trace、成本及归因 | k01：开发/回归/保留；k02：成对重复、全分母及虚构分层例；k03：结果/过程/资源和判定器；k04：人工校准、位置偏差及失败干预归因 |
| e03；c02、c03、e02 | o1：威胁链与读取/执行边界；o2：内容投影、准确批准、人工停止和恢复 | k01：外部资料与记忆注入入口；k02：宿主身份、对象权限与每次请求；k03：四通道敏感数据及合法内容保留；k04：批准期限/消费/唯一槽位与未决人工核对 |
| e04；e01、e02、e03 | o1：清单、分环境、版本接管和回退；o2：阶段事件及具体runbook | k01：运行/配置/工具/状态版本清单；k02：启动验证、探针与领取兼容；k03：阶段事件、关联Trace及业务事实；k04：数据库迁移、排空/回退和故障手册 |
| e05；e02、e04 | o1：端点/分位/失败分母/成本；o2：缓存、路由、并发准入的比较方法 | k01：延迟、成功/全部任务及每成功任务费用；k02：负载窗口、接受/拒绝/完成/在途与吞吐；k03：缓存身份/版本/当前授权和模型路由；k04：并发预算、重试放大与固定质量护栏实验 |
| p01；c01、e02 | o1：原观察到可测任务和公平实验；o2：ADR与两种受众交接 | k01：真实任务研究、观察/解释分离；k02：可证伪价值假设和完整MVP YAML；k03：人工/程序/模型/Agent基线、ADR及升级条件；k04：业务/技术同事实说明、版本与角色交接 |
| p02；e01、e03、e04、e05、p01 | o1：证据包、原门槛、独立重建/专业评阅；o2：定位/干预/复验和未知任务 | k01：冻结产物、证据索引及摘要检查；k02：独立复现、真实使用/行业比较及专业身份；k03：重复工单完整失败链、竞争原因和复验矩阵；k04：未见任务封存、独立作答、污染处理和结论范围 |

p01直接串联原七阶段：真实问题发现→现有/行业基线→差异假设→MVP→质量经济比较→真实使用→依据反证迭代。p02要求独立作品、同条件优势证据及原例/回归/未知条件复验，不将任务通过扩展成完整行业职业标准。

## 返修与独立验证边界

1. 项目经理与课程发现e02/e03复用了主repo/report ID却使用parser事实。revision-01改为冻结refund夹具并保留初稿；这是跨章对象一致性返修，不是技术审校通过。
2. 内容审校发现e02部分已知错误被前置缺证返回遮成INSUFFICIENT。revision-02改为收集可独立确认的反证与缺证，已知反证优先FAIL且保留未知；非法负数/布尔效果计数进入HARNESS_ERROR。缺记录不能证明不存在时明确标缺证。
3. 内容审校发现e03对JSON编码文本查原敏感字符串漏掉引号/反斜杠/换行。revision-02改为递归检查原始字符串叶及键，在执行边界和四通道夹具使用同一检查，并增加特殊字符与正常信息的成对分析。已知标记检查不声称覆盖任意秘密或变换编码。
4. qa-description仅修改e02—e05及p02执行范围描述，未改代码块。作者编写时未运行；独立QA实际环境是Python3.12.14，结论限其所列离线夹具，不沿用正文支持的最低版本推成其他解释器实跑。

据截至本交接读取的 [QA阶段记录](textbook-v08-qa.md)，e02判定器、e03局部边界替身、e04纯规划器、e05Decimal汇总器已独立执行题定及若干拒绝/边界反例，进程按预期退出。stage01全组共67条行为断言、stage02账目12条是对应历史阶段记录，后续stage另列；计数不是工程组独立总数或质量评分。原e02/e03历史反例亦由QA复现，不能只以作者描述代替返修依据。完整代码摘要、输入/预期/实际/命令/环境在QA历史记录中。

p01以方法、契约和ADR为主，没有可运行模型/研究流程。p02作者编写时未运行；独立QA的stage04已在Python3.12.14对自造/tmp证据包作8条离线检查，题定INDEX_OK/HASH_MISMATCH/VERSION_MISMATCH及路径、分类等边界符合预期、退出0；代码块SHA256为`e68eab651b60fcfb76c7d5a947c0becca97d68e6cb4b7cb03c5b6f4b33930242`，记录见[stage04](textbook-v08-qa-history/stage04/execution.json)。范围说明更新未改代码块、不重复执行；INDEX_OK不证明真实性、专业认可或门槛通过。作者没有执行应用、部署、模型、负载、真实用户研究或毕业评价。QA报告仍为in_progress，完整当前hash文稿审校仍待各岗位汇总。

## 实际查阅的论断来源

以下外部资料均在本轮实际浏览，访问日期2026-10-11。正文就近引用并限定支持范围；原创接口、算法组织、虚构输入、任务阈值草案和参考分析不是官方API或外部已运行系统。六篇没有采用具体OpenAI SDK/API调用或价格事实，未触发SDK版本选用。

| 来源 | 本文采用的事实与适用范围 |
| --- | --- |
| [OpenTelemetry Traces](https://opentelemetry.io/docs/concepts/signals/traces/) | span/关联传播等观测概念；不证明持久账本或远端恰好一次 |
| [scikit-learn data leakage](https://scikit-learn.org/stable/common_pitfalls.html#data-leakage) | 测试信息参与选择会使估计偏乐观；应用于Agent调参明确是教学推论 |
| [Zheng等，LLM-as-a-Judge](https://arxiv.org/abs/2306.05685) | 研究中评分模型的偏差与局限；不授专业审核 |
| [OWASP Prompt Injection](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html) | 间接注入入口与模型之外的防护边界 |
| [OWASP Authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html) | 默认拒绝、每次请求权限检查 |
| [OWASP Logging](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html#data-to-exclude) | 密码、令牌、密钥等普通日志排除要求 |
| [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/) | readiness/liveness/startup的不同职责及错误探针风险 |
| [Kubernetes Deployment rollback](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#rolling-back-a-deployment) | Deployment回退PodTemplate的范围，不自动回退业务数据或外部效果 |
| [Google SRE monitoring](https://sre.google/sre-book/monitoring-distributed-systems/) | 成功/失败请求延迟应分开观察 |
| [Google SRE overload](https://sre.google/sre-book/handling-overload/) | 过载、重试放大及限流处理原则，未复制默认数值 |
| [GOV.UK user needs](https://www.gov.uk/service-manual/user-research/start-by-learning-user-needs) | 研究实际任务/渠道/困难，未有用户来源者作假设 |
| [GOV.UK interviews](https://www.gov.uk/service-manual/user-research/using-in-depth-interviews) | 中立开放访谈、实际经历和同意；无当前教材用户结果 |
| [GitHub Copilot on GitHub](https://docs.github.com/en/copilot/concepts/copilot-surfaces/copilot-on-github) | 仓库问答/多步骤工作作为待实测行业候选，无比较成绩 |
| [Anthropic effective agents](https://www.anthropic.com/engineering/building-effective-agents) | 固定workflow与动态Agent概念取舍，不使用其工具版本作当前实现保证 |
| [NeurIPS checklist](https://neurips.cc/public/guides/PaperChecklist) | 实验/基线复现所需条件、命令和限制；不授研究或行业资格 |

## 下一岗位与未关闭事项

内容审校员核当前版本论证、来源、跨章语义和深度；测试工程师核全部链接/原目标映射、当前代码摘要重绑、p02适用离线例和程序范围；课程架构师负责规格整合，项目经理协调最终复盘。作者只提供覆盖定位和返修，不关闭独立审校问题，不改变原门槛。

真实供应商、远端工具/批准/故障恢复、实际部署与负载、费用/用户研究、真人行业专家、学习者独立迁移和同条件行业比较均无本轮实证。用户对六篇质量也尚未反馈。六篇齐稿与有限离线例不能支持用户完整培养和先进产品标准已达标；当前交接保留这些缺口，后续缺陷按原作者范围再返修。
