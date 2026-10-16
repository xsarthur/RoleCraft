# Agent 面试参考答案返修 · 派生数据交接

责任岗位：内容检索工程师。日期：2026-10-14。交付版本：`interview-answers-v1`。本岗仅整合已有答案、版本、来源和独立结论，没有编写答案或执行独立验收。

## 交付结果

已生成124题完整答案独立数据包、逐题阅读目录及合订本。三个集合分别为固定100题、市场14题、原型10题。原题ID、题面、原型追问、原来源和每题全部正文保留；旧327条教材证据数据没有被覆盖。

当前正文的内容审校与内容QA均对每题当前版本和SHA256绑定通过，合并状态为 `met_within_reviewed_scope`（100/14/10）。Q99使用 `interview-answers-v1.0.1`、SHA256 `5b98c7767017e76814c043904227829698d411af87070fce6123da8da8aed5a0`；初轮旧版的 `not_met` 与复验指针同时保留。此结论来自独立报告，本岗没有自签内容通过。

应用展示仍为 `pending_independent_integration_qa`；本文件与包内状态不包含后续客户端集成QA，避免产物与验证报告循环绑定。真人阅读、专家、面试表现、职业胜任及行业先进证据仍不由此产生，完整产品仍 `not_met`。

| 产物 | 用途 | SHA256 |
| --- | --- | --- |
| `textbooks/interview-answers-v1/README.md` | 124题分组目录与状态 | `3455af3c61cb020913010d1c6ee122cfc28f3cf82296bca34234f9e5aa2ca939` |
| `textbooks/interview-answers-v1/agent-interview-answers.md` | 全文合订 | `9ff887bb145f774a210517fc2ae9b02168e613da6f70b7341ee4e3041187a657` |
| `textbooks/interview-answers-v1/manifest.json` | 身份、版本、来源及独立报告绑定 | `e3bb9ecf56c525b57019af129a96159d258a21a1768c382ef536eb4430614fe5` |
| `dist/interview-answers-v1-data.js` | 客户端可读取的完整正文 | `4a9e3ce4f5067e77b26bdd551bed911a6efadb9fe905de206876f03c773dad7b` |

答案集身份摘要为 `2cd40dcca5342944ab7c0c7836e759054dc3b5d4aaf992508f78d9172473b61a`，由按产品顺序排列的每题ID、版本与正文哈希生成。输入和产物逐文件摘要见 [构建记录](agent-interview-answer-revision-data.json)。开发自检见 [检查记录](agent-interview-answer-revision-data-checks.json)。

## 构建与独立证据选择

构建脚本为 `server/retrieval/build-interview-answers-v1.mjs`，沿用现有教材构建脚本目录。运行 `node server/retrieval/build-interview-answers-v1.mjs --final` 生成本次定版；`--candidate` 允许输出尚未双审通过的候选，但不把待定项改成通过。`--review 路径`、`--qa 路径` 可追加新的独立复验报告，字段和题目身份必须完整；不会扫描或继承无关旧审计。

构建默认读取三份作者清单、产品与课程合同、当前v12阅读索引、初轮内容A/B与内容QA报告，以及存在时的Q99独立复验报告。每条通过状态必须同时匹配答案版本与SHA256；已过期的报告仍保留在引用历史，但不能批准新字节。`--final` 在任何一题没有当前内容审校和内容QA双通过时退出，且在该检查之前不写派生产物。

脚本核对124题唯一身份、100/14/10分母、原题面、原型追问、作者答案字节、366处本地来源绑定的当前哈希与行范围。它不代替审校员判断技术正确性。写入派生文件前再次核对全部读取输入没有在构建期间变化。

## 客户端消费合同

加载 `dist/interview-answers-v1-data.js` 得到 `globalThis.RolecraftInterviewAnswersV1`。`items` 按产品合同顺序排列；`byId[id]` 为同一条目对象；`prototypeMap` 把原型 `q1` 至 `q10` 映射到 `P01` 至 `P10`。包内没有网络请求或存储读写。

顶层包括 `schemaVersion=1`、`linkSchemaVersion=2`、`answerSetVersion`、`answerSetSha256`、`buildMode`、`contentStatus`、`counts`、`collections`、`items`、`byId`、`prototypeMap`。每题关键字段为：

| 字段 | 含义 |
| --- | --- |
| `id/collection/sourceId/question/followups` | 原题身份、分组、原型映射和完整题面/追问 |
| `answerPath/answerVersion/answerSha256` | 仓库相对源文件、作者版本及原始UTF-8字节摘要 |
| `bodyMarkdown` | 源文件全文，含正文、案例、表格、代码、追问和来源，不做三条或定长截断 |
| `sourceBindings/externalSources` | 作者提供的本地/外部来源原字段与原值 |
| `sourceReferences` | 本地来源的版本、行范围及当前教材 `readingHref`，优先对应标题，否则定位包含该行的已索引小节 |
| `sourceLinks` | 正文每次链接的 `label/originalHref/occurrence/sourceOffset/sourceEndOffset/sourceLine`、`kind` 与目标 `href`；本地另有 `localOccurrence/sourceReferenceIndexes/section/sectionId/resolutionMethod`，目标为现有 `#learn/agent/...`；外部限显式绑定的HTTPS来源。相同文件不同标签不去重 |
| `reviewReferences/qaReferences` | 独立报告路径、报告哈希、JSON Pointer、报告中的题目版本/哈希及是否匹配当前正文；保留失败历史 |
| `effectiveReviewReference/effectiveQaReference` | 当前字节适用的最后一份内容审校/内容QA引用 |
| `reviewStatus/qaStatus/contentStatus` | `pending`、`not_met`、`insufficient` 或 `met_within_reviewed_scope`；作者自查不能改变这些状态 |
| `displayStatus` | 留给外部集成QA的待验状态，不冒称当前界面已通过 |

前端按原始Markdown安全渲染完整正文，不执行正文HTML或代码、不固定截断。链接以原标签和原目标双字段匹配 `sourceLinks`，只有匹配项最终目标唯一时使用；不得按同文件首项代替。原型以 `index.html` 为教材链接前缀，主应用使用现有学习路由。`sourceBindings` 本身不被改写成不同的证据。正文中的版本提示仍忠实保留作者文字，当前独立状态另行显示。

现有 `questions/review/check` 延期入口保持。正式数据可增加完整解析引用，但327条原教材摘录及其身份继续保留；不能把新解析包装成旧摘录或覆盖用户答题状态。

## 阅读编排与开发自检

逐题答案文件保持原样。合订本只增加目录、题号锚点、源文件链接和版本/状态标注，并将逐题目录下的相对来源链接移到合订本目录。没有新增教学论断。包内 `bodyMarkdown` 保留所有原始字符。

首轮在Node.js 24.16.0完成本岗开发自检：124份包内正文与源文件UTF-8摘要逐一相同；合订本包含124份仅重定位链接的全文；124个阅读锚点和目录入口、366处本地来源摘要、273个去重链接和10个原型映射可对应。该自查遗漏同文件不同小节的链接身份，不能据此认定实际来源定位正确；随后独立QA发现REV-QA-LINK-01，详见下节。Q99旧内容失败仍在引用历史，两份当前内容复验只批准新哈希。

另在临时隔离副本执行三项拒绝反例：Q99缺当前哈希的QA复验时 `--final` 被拒绝；正文追加字符使作者哈希不匹配时被拒绝；原型追问身份改变时被拒绝。三项均退出1，临时副本已删除，真实答案和审校文件未修改。这些是构建防误用自检，不是应用浏览器验证、教材代码运行或独立QA。

首次开发运行还发现本岗对作者题头分隔样式作了过窄假设，构建在写产物前退出；已改为核原ID及完整题面、允许作者既有自然组织，未改任何答案以迎合构建器。

## 待办与责任

软件工程师完成最小内容接入并保持延期入口；测试工程师对实际客户端、原型十题全文、链接/刷新和旧证据保留独立验证。该集成QA从外部绑定本次数据包，不反写包内，以保持可复核的固定版本。若答案以后变化，由原作者更新版本，内容与QA对新字节复验后再构建；未经复验的新版本不能继承本次批准。

## REV-QA-LINK-01 修复与复验交接

独立QA发现首轮372次实际本地引用中118次跳到了同文件错误小节，涉及62题。原因是本岗把 `sourceLinks` 按 `originalHref` 去重、并按文件选首项；前端首条匹配延续了丢失的小节身份。366个原 `sourceReferences` 的目标本身正确。首轮自查仅核了允许目标形式和来源文件哈希，未比较每次链接标签与具体小节，检查维度不足。原始失败报告为 `team/agent-interview-answer-revision-qa/integration-data/link-label-result.json`；本岗修前八项产物及报告完整保存在 `team/agent-interview-answer-revision-data-history/candidate01/`，没有删除失败或替换历史哈希。

现在每次可渲染引用独立存储，共400条：372次本地、28次外部。构建忽略围栏代码和单反引号行内代码内的文本，其他现有单行Markdown链接按源顺序计数。`occurrence` 从1起覆盖所有链接；`localOccurrence` 只覆盖本地链接；`sourceOffset/sourceEndOffset` 是原始正文的JS UTF-16偏移。标签保留原文，不改作者文件。

定位先限制相同来源文件，再按标签包含的完整标题确定小节；允许省略明确的标题编号，或标签显式写第N节时按编号匹配。对标题括号内完整命名分项，只接受整项词元与标签结尾相符。所有规则均来自作者标签和 `sourceBindings`，不把QA预期表当路由表。最终候选必须只有一个实际目标；重复来源绑定指向同目标可合并其索引，缺少或存在多个目标则停止构建，不静默选首项。

P02“10.3 最关键的崩溃窗口”当前指向 `#learn/agent/c01-control-loop/s-8261016926be`；“三个提交点定义可恢复事实”指向 `#learn/agent/e01/s-c2209725ec11`。原前端已收到 `label+originalHref` 唯一目标合同及新版数据包，前端实际渲染由其独占修复。

本岗对QA原372条逐次预期进行开发对照：372一致、0差异，原118条全部一致。当前数据与修前相比，124题源字节、版本、内容审校/QA绑定及366来源对象不变；合订本字节也完全不变。四项派生产物复建哈希一致。在隔离副本中另给同文件不存在的标签及包含两个不同小节的标签，构建均显式拒绝，未选文件首条。

这一轮修复自检见 `team/agent-interview-answer-revision-data-link-fix-checks.json` 与更新后的 `data-checks.json`。首次对照脚本误把QA包含外链的总序号当成本地序号，造成28项计数错位；确认QA序号语义后改用全文序号，数据无需因此改动。该脚本计数问题不是正文或路由差异，实际原例结论以当前逐次记录及后续独立QA为准。

本岗状态：数据修复已交，**独立复验待测试工程师完成**。不在此把REV-QA-LINK-01签为关闭，也不把内容通过扩大为浏览器点击或用户效果通过。
