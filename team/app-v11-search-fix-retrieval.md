# v0.11 教材术语搜索专项交接

责任岗位：内容检索工程师。检索版本：`content-retrieval-0.11.1-source-terms`。当前状态：实现已交，独立 QA 已在 HTTP/原文范围关闭原反例与两次返修缺陷；正式本地 4318 已恢复。SF11-11 的真实界面点击、刷新、复制链接仍证据不足，本轮不称全部产品条件通过。

## 原因与修复

v10 开篇正文实际存在 ReAct 论述。旧实现仅在已识别的任务意图内使用词项排序；未识别的短术语只能依赖段落向量相似度达到 0.66，因而 `react` 被判无匹配。修复增加通用英文词项倒排召回，不降低原语义阈值，不为单条问句预设结果。

倒排索引在运行时从批准的二十篇真实小节正文派生，归一 NFKC 与英文大小写，按完整英文词项匹配。围栏代码、行内程序标识、文件路径、链接目标与原已排除的行政小节不提供术语依据。命中依据保存到推荐卡的 `matchingBasis: source_term` 与 `matchedSourceTerms`，只返回原文存在的章节、小节和逐字摘录。索引不持久写回正文，不改变教材或派生阅读包。

单个术语需求优先展示真实提及；含多个任务分句时保留原任务意图组，再补术语组。原推荐每意图与全量数量约束、原文校验、章节身份、否定作用域、起点诊断和 BGE 语义通路保留。排除规则补齐“不要推荐”等表达，只有排除而无肯定需求时无匹配。

职业内裸 `react`、`ReAct`、`REACT` 定位到 `00-learning-route/s-7547e5ce91f8` 的“一次任务怎样形成反馈闭环”。理由明确为已有正文提及，摘录包含实际 ReAct 论述和论文链接，不称独立课程。明确前端 React、JSX、Hooks、网页组件不采用 Agent ReAct 候选；同时询问两种意义的选择时返回两个方向的澄清。对于相同主语的相邻对比分句，聚合肯定与排除语境，不要求每个分句重复英文名。此消歧是当前同形词的有限语境规则，不声称任意同名术语已完整理解。

## 接口、来源与实际模式

原 `POST /api/content/recommend` 输入及前端必需返回字段不变。新增 `retrievalVersion`、`matchingMethods`、推荐卡 `matchingBasis` 与 `matchedSourceTerms`，客户端无需修改即可消费原合同。

默认 HTTP 管线实际执行原 CPU BGE 模型，再结合原任务概念、原文词项与否定边界。它返回 `local_semantic_retrieval`、真实模型 `semanticProvenance`、`providerCalled: false`。澄清会在模型执行前返回 `local_concept_retrieval`；明确前端含义的无匹配仍经过默认真实语义推理，结果继续由语境边界限制。静态 file 和显式 concept 模式使用概念规则加原文术语查找，不声称运行模型。术语提及的查找属于文字证据召回，不能将其单独描述为语义推理。

教材版本仍为 `textbook-v10`，语料 SHA256 为 `436ec1edab6c394d0d19ce3769e3a95eadb162d0d2f6564c7442988bd37328e5`；完整教材 SHA256 为 `6707a4f03b298a5b234ce56a88edcbd9d79af6d40cb978227461a9d9d522f76e`。ReAct 源篇 SHA256 为 `d340011efd35ac0baade39165b238dda561f0cee19f226768e1538e3fc8be1ac`。模型、向量、正文及派生内容包未修改；相应实际绑定另见专项 JSON。

## 作者自查与交接

`server/retrieval/search-fix-dev-check.mjs` 在首候选使用真实 Node.js 24.16.0 直接执行推荐函数和本地推理，并正常释放资源、自然退出 0。首候选十九条作者用例均通过，涵盖原 react、大小写、明确 Agent 含义、前端与歧义、否定、旧恢复/费用多意图、OpenTelemetry 大小写、SQLite、`preact` 词边界、代码标识与装修无匹配。十八条实际返回模型 provenance，一条两义澄清在推理前返回。每张卡自查对应原文子串、源哈希、版本、稳定小节链接及总数；这是作者自查，不是独立验收或浏览器点击验证。

独立 QA 首轮发现提前冻结的 S09：`我想学 react，但不是 agent 的推理和行动，而是网页组件。` 仍误荐 Agent ReAct（QSF11-02）。原因是同形词语境只在含英文词的单一分句内判断，排除 Agent 与肯定网页组件落到别处分句未被聚合。第一次返修正负对比分句边界及共享主语的前端语境聚合；作者另外八条受影响实跑通过，含该反例、有限框架/组件/两义、否定恢复、明确 Agent 与原 react，证据为 `app-v11-search-fix-retrieval-repair-check.json`。

QA 第一次返修复验中 S09 已正确无匹配，但发现同批预冻结 S07 回归：`不是 React 前端框架，我指的是 ReAct 智能体方式。` 反而无匹配（QSF11-03）。否定前端分句未识别为排除，前端词被误当肯定语境。第二次返修将“不是 React …”与“不是 Agent …”置于相同主题极性规则，前端线索只由肯定分句提供，后续肯定的 ReAct 仍可召回。作者九条受影响实跑通过，含上轮八条和 S07，证据为 `app-v11-search-fix-retrieval-repair2-check.json`，绑定第二次返修代码。

十九条首版及八条第一次返修自查保持各自原哈希，不称全部在最终代码全量重跑，不以作者自查取代两项独立失败判断。QA 第二次返修独立十条原受影响集合实际通过，S07 找到 ReAct、S09 无匹配；QSF11-01/02/03 可在 HTTP/出处范围限定关闭。独立证据与限制以 `app-v11-search-fix-qa.md/.json` 的最终绑定为准，不继承旧 v11 全量检查。

实际完整输入、输出、运行版本、时间和源码绑定保存在 `app-v11-search-fix-retrieval-dev-check.json`。原 v11 工程报告、旧自查结果和独立 QA 记录均保留，本轮不重新运行会覆盖旧证据的脚本。产品增量合同为 `app-v11-search-fix-product.md`，独立 QA 使用提前冻结的有限输入复验。

## 正式本地预览

独立关键 HTTP 原例关闭后，只读核对 4318 当时无监听者、历史 PID83835 不存在，未停止其他进程。用本机 Node.js 24.16.0 启动原项目 `server/index.mjs`，新 PID95893、工具 PTY 会话81687；命令与工作目录经只读进程检查核对，监听仅 `127.0.0.1:4318`。沿用 `.runtime/rolecraft.sqlite`，未删除或迁移数据库，未更改账户规则。

工程点核正式服务的 health、`POST /api/content/recommend`（`react`）及对应只读章节均 HTTP200。实际模式为本地语义，固定模型禁用远程加载，检索版本、ReAct 原文摘录、源哈希和稳定小节目标正确；generation 仍 `configured:false`，未调用收费模型。证据为 `app-v11-search-fix-retrieval-preview.json`。这一操作检查不替代独立 QA 或浏览器行为验证。

阅读地址：`http://127.0.0.1:4318/#learn/agent/00-learning-route/s-7547e5ce91f8`。服务保留供用户试读；正常停止可向已核身份的新 PID 发送 SIGINT/SIGTERM，或对所属 PTY Ctrl-C，经过现有关闭与模型释放流程自然退出。后续停止前需再次核对当前 PID 归属，不能仅凭本报告的历史 PID。

当前 QA 通道无可用浏览器，SF11-11 明确保留 `insufficient`，HTTP 深链/原文检查不证明实际点击、刷新或复制已通过。教材系统 ReAct 教学、真实生成、专家及真实学员/行业效果不属于此修复，完整培养目标仍 `not_met`，不能由搜索修复关闭。
