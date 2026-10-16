# v0.6 Agent 架构示范 · 客户端消费契约

2026-10-11；网站客户端工程师。依据产品/阅读设计，只改 c01 阅读呈现；作者正文和课程字段由对应岗位冻结，本文是接入说明，不是教材内容或达标标准。

## 保留与版本

当前客户端拟用 `local-mvp-0.6-textbook-pilot`，当前教材 `textbook-draft-0.6-pilot`。原 v0.5 JSON 全书及独立AI文稿报告原样另包，变量分别为 `textbookV05Data/textbookV05PackageMeta/textbookV05ContentReviewData`。当前 `textbookData/textbookPackageMeta/textbookContentReviewData` 消费 v0.6；没有新稿时明确准备状态，新稿不借旧正文或审核充当完成。

十二章仍用原课程 ID，十一章对象应与作者 v0.5 对象深相等并保留各自 `version=textbook-draft-0.5`；包版本只说明混合阅读包。本轮只改写 c01。旧稿与新稿的作者、内容审校及执行记录按各自 hash/版本适用，不相互继承。审校 c01 范围明确，不说全书重新复核。

建议保持 `#book/agent` 默认新c01、`#book/agent/c01` 明确新示范；`#book/agent/c01/original` 显示原 v0.5 完整 c01；`#book/agent/all/original` 阅读 v0.5 全书；现有 `#book/agent/<十二章ID>`/all、旧八短示例 `#book/sample/agent` 保留。切换版本只 URL/页面内存，不写 rolecraft-v1、账户 API、进度或认证。

## 作者新增字段交接（最终以课程规格为准）

c01 保留原九节/四知识点/三层任务/来源/案例结构，同时新增独立作者 `readingLessons` 作为主线，不能由前端拼接旧知识点生成。每个小课须有 `id/title/bodyMarkdown`，一个主问题与学习动作；正文图/代码继续安全 Markdown。课程岗将补充冻结主问题、简介、课内练习与参考解析、衔接和目标去向字段，工程按冻结字段消费，不自行填缺文。

建议 `readingIntro` 保留主问题、学习结果、先修摘要、贯穿案例。课内小练习与参考解析采用作者结构字段，题目只出现一次，解析默认收起；原直接题与分层任务在扩展中可达。原目标映射、命名表、参考适用范围作为原样技术交接数据显示。

课程已冻结 `textbook-v06-spec.json`（SHA256 `d26744412162ac73416ff3ba3585470d118d61800d4477e72bb42715c4762925`）：`readingIntro` 为 `problem/learningOutcome/prerequisiteSummary/caseSummary`；小课字段为 `id/order/title/coreQuestion/learningAction/objectiveIds/knowledgePointIds/bodyMarkdown/checkQuestion/checkAnswer/sourceIds`。四课顺序 `c01-read-flow/loop/observation/stop`，课内题和解析只用 `checkQuestion/checkAnswer` 两字符串，不另发 exercise。c01 的 `chapterCase` 优先对应小林/海岚商城/星河耳机案例；顶层旧工程主项目只在扩展保留。章节主标题消费 `readingTitle`（若作者已将 title 改为阅读标题则直接消费），主问题只出现一次。

## 呈现与安全

新 c01 默认标题/单一主问题、简短AI草稿及真人/学习效果状态、最多三项入门说明、小课目录及完整连贯作者正文。单列约740px、桌面17px手机至少16px，行距/段距按设计。每课 h3，正文所需子标题 h4；锚点跳转焦点落标题，图/代码局部滚动。课内局部模拟/伪代码身份以作者正文为准。

一个默认收起“来源与验证说明”集中保留原目标、九节教案、知识点题解、分层任务、来源、案例预期/实际与证据、当版独立AI审校/缺陷复核、版本/hash与作者过程。默认主线不重复展示九节与知识点。同页工具保留新当前章/全书导出、旧c01/全书对照导出、课程/项目/复盘及短示例入口。新版导出包含新小课正文及完整范围/证据信息，十一章保留原v05身份；旧版导出消费原对象。

所有作者/来源文本转义；安全 Markdown 子集和官方 HTTPS 链接白名单沿用。没有新增代码执行、模型任务、用户数据读取或费用。current audit 始终按当前 v06 源包绑定，不能因切到旧稿而把旧审计作为当前版本；content review 则分别按实际阅读稿及报告hash/版本匹配。

## 验证交接

开发自检仅虚构 storage/隔离VM与作者源包包装一致性。QA独立核当前/旧稿单章及全书、正文优先与全部扩展可达、十一章原样、下载内容、缺包/审核hash失配、阅读无写入和当前审计。实际浏览器、窄屏/键盘/原生下载不可用时保持未测；用户是否更易理解待用户反馈，不由代码检查授通过。
