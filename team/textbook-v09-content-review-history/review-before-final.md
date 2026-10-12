# v09 学习路径与正文独立内容审校

责任岗位：内容审校员。状态：`in_progress`；截至首批入口和预备课，完整正文、原24目标/48知识点实际覆盖及最终版本绑定尚未完成。此报告不授教学效果、用户认可或完整产品通过。

## 范围与方法

按本轮授权，只核当前 v09 的入口、必要预备、概要与完整实现拆分、实际阅读依赖、原能力语义去向，以及迁移后的关键机制是否完整。阅读原 v08/v07 只作为迁移来源与反例，不继承其质量结论；不重启旧版全套技术审计，不运行教材或应用代码，不改作者、课程或程序文件。

旧合订本起点差异见 QA 的 `textbook-v09-qa-history/baseline.json`：当前旧合订本与原归档哈希不同，13权威逐篇来源和旧报告稳定；本审校只以逐篇源核迁移，不修改或归因旧合订本差异。

## 首轮规格与新稿

已完整阅读 `textbook-v09-spec.md`、`00-learning-route.md`、`01-foundation.md`及首批任务验收、信任与动作身份导读。新规格明确选型原则不使用完整存储/批准接口、动作身份先于工具、工具和存储先于综合流程、问题与验收/信任前置、完整安全/交付前不进行真实敏感读取或写入。以上是待全部正文验证的设计，不以图表存在判定已改好。

入口已把教学夹具与真实问题分开，列明阶段工件、对应问题和诊断跳读条件；预备课有完整本地 JSON→校验→计算→结果程序、正常/错误输入、故意断言失败、退出状态和行为修改分析，不要求先读完整 API 适配器。它只支撑继续学习的必要起点，不冒充完整零基础软件工程训练。

首轮观察版本：

| 文件 | SHA256 |
| --- | --- |
| team/textbook-v09-spec.md | `4af00d73620995ca6ac20f8e860e903a7a9544ec1feee45252a156fb1915acfc` |
| textbooks/v09/00-learning-route.md | `5b61bb59a3db5973f2f8ed2312a6e61e5368b2fba34ba9a1c8853333e160defa` |
| textbooks/v09/01-foundation.md | `55d7b51fae97da9e30546af4bc06c528bc552fb4ba19b5d8a47c69f424b8c46e` |

## 待返修与复核

| ID | 原反例、影响与依据 | 责任人及必要修正 | 状态 |
| --- | --- | --- | --- |
| CR09-01 | 01入口诊断要求“在阅读程序前”推导 `refund(7)`、`check_case`分支，但函数定义尚只在后方完整代码出现；不看定义时返回值未由题干确定。读者无法判断是基础不足还是缺题面。 | 教材研发员已改为先浏览完整短程序、不读后续讲解；定义可得且诊断仍要求运行、改错和恢复。按原首次读者反例静态复核，修订稿SHA `54944a2e4c3959eca880caeff1598b1818fde04d957681c29595aa984e9505e1`。初稿保留在本轮review-history。 | `closed_static` |
| CR09-02 | 01程序只捕获 `JSONDecodeError`。合法JSON中days为超过解释器整数转换位数限制的长整数时，默认int解析可抛`ValueError`，在业务范围校验前逃出结果归约；输入合同尚未限定文本长度。依据Python json官方3.11起的限制说明，未执行该反例。 | 教材研发员：界定并拒绝过长输入，或明确处理该解析ValueError；不能笼统捕获全部程序错误。QA核必要受影响安全离线路径。 | 已交作者与QA，待修订和原反例静态复核 |

附加交接的官方环境入口已由作者补齐并静态核见；不要求作者安装/改动系统环境。正文稿尚在分批写作，未将未成稿路径登记成缺陷。

## 本轮一手依据

新增预备课的 JSON 对象/数组转换、解析异常、默认整数转换及重复键限制，已读 [Python 3.14 json](https://docs.python.org/3.14/library/json.html)；函数/分支依据[控制流](https://docs.python.org/3.14/tutorial/controlflow.html)，bool与int关系依据[内置类型](https://docs.python.org/3.14/library/stdtypes.html#boolean-type-bool)，异常分类与捕获依据 [Python 错误和异常](https://docs.python.org/3.14/tutorial/errors.html)；断言与优化移除的限制依据 [Python assert](https://docs.python.org/3.14/reference/simple_stmts.html#the-assert-statement)；退出语义依据 [sys.exit](https://docs.python.org/3.14/library/sys.html#sys.exit)。环境入口已读[Python Setup and Usage](https://docs.python.org/3.14/using/index.html)；新信任/身份导读的边界原则已读[OWASP提示注入防护](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html)及[AWS原操作幂等设计](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/)。检索日期为2026-10-11。这里只核文稿论断与局部代码的静态含义，实际执行交 QA，目标 Python 3.14 的实跑仍未知。

## 开放边界

待完整稿：逐单元先修/交接与首次顺读反例、全部24/48实际论证/练习/参考分析位置、专业块迁移语义、完整新版本哈希及作者/课程绑定。真实行业专家、实际学习者理解/迁移、真实问题价值与行业先进性不由本报告确认；用户完整产品目标仍 `not_met`。
