# 全部Agent面试答案返修 · 项目状态

日期：2026-10-14。用户明确授权：“将所有题进行返修”。本文件仅由项目经理维护组织、交接与状态，不代写答案、产品条件或测试结论。

## 目标与范围

将当前124题改为符合AQS-01–08的完整参考解析：Q1–Q100、M101–M114、P01–P10（原型q1–q10）。保留题面/身份、正确内容与原始来源；前轮19题不机械重写，但仍进入本版逐题复核。前轮105未达标题及490有效缺口要在新版本中逐项处理。新独立稿位于 `textbooks/interview-answers-v1/`；旧v12正文、旧审校/QA/assessment保持。

产品先明确字段与验收，课程交逐题规格；编辑分不重叠批次编写。内容审校和测试独立检查新版本全部124题，不沿用旧19通过；必要的代码/反例按实际承诺验证。专业通过后由相应工程岗位构建派生答案包并更新当前数据/原型展示，维持延期题库入口状态，不改用户数据。

## 唯一写入与当前状态

| 任务 | 责任 | 授权写入 | 状态 |
| --- | --- | --- | --- |
| 产品合同 | 产品经理 | team/agent-interview-answer-revision-product.md/.json | 已交124题原身份和作者/汇总字段合同 |
| 教学交接 | 课程架构师 | team/agent-interview-answer-revision-curriculum.md/.json | 已交124题逐题推理链、原缺口与来源入口 |
| QA基线/新版本逐题验证 | 测试工程师 revision_qa | team/agent-interview-answer-revision-qa* | 最终独立QA为met_within_tested_scope；124题、数据包、原型10题、来源定位和延期入口均在声明范围内复验，报告已交 |
| 作者A | 教材研发员 answer_author_a | answers/Q1–Q40.md、author-a.json及本批交接 | 40题候选和自查已交，待独立审校/QA |
| 作者B | 教材研发员 answer_author_b | answers/Q41–Q80.md、author-b.json及本批交接 | 40题候选和自查已交，待独立审校/QA |
| 作者C | 教材研发员 answer_author_c | answers/Q81–Q100、M101–M114、P01–P10.md、author-c.json及本批交接 | 44题已交；Q99来源缺口已返修为v1.0.1，内容B及QA均独立复验关闭 |
| 内容审校A | 内容审校员 revision_content_a | team/agent-interview-answer-revision-content-a* | Q1–Q62共62题静态限定通过，当前报告已交 |
| 内容审校B | 内容审校员 revision_content_b | team/agent-interview-answer-revision-content-b* | 初轮61/1保留；Q99来源补齐后独立复验，当前62题均静态限定通过 |
| 派生构建 | 内容检索工程师 revision_data | 新构建脚本、总manifest/README/忠实合订、新独立答案数据包及本岗报告 | 已交124题完整包；LINK-01修复后372本地/28外链及歧义拒绝由QA复验 |
| 客户端接入 | 软件工程师 revision_frontend | index必要脚本、experience答案消费、原型参考全文及必要独立renderer/样式、本岗报告 | 已最小接入并修复逐次链接；真实Chrome范围通过，延期入口保持关闭 |
| 最终当前版本复盘 | 产品/测试出领域结论，PM汇总 | 本文件、TASKS、RETROSPECTIVES | 产品最终评估已收口：content=met_within_reviewed_scope、delivery=met_within_tested_scope、wholeProduct=not_met |

## 执行边界

不覆写旧教材/旧报告；不读取、迁移或删除真实数据库/用户笔记；不执行付费模型、不发布上传/外部联系。并行聊天的活跃客户端改动需读取收到状态并局部交接，不覆盖为旧快照。每批先交付完整可读正文，发现缺陷交原作者修复并记录原例复验，不以“报告完成”关闭答案改进。

当前完整目标：`not_met`。本轮124题内容与实际限定接入已完成，完整培养、真人学习/专家、行业比较、生产运行和经济性目标仍需各领域证据，不能由本轮文稿与有限页面测试推出。

产品最终文件合同优先：每题 `answers/{ID}.md`，三份 `author-a.json`、`author-b.json`、`author-c.json`，总 `manifest.json` 由数据工程单独生成。课程规格中的批次文件名如与产品合同有差异，作者遵循产品最终合同；不同时改同一文件。作者只写正文与来源/自查，不写独立通过状态。

## 首轮问题与复验安排

Q99：`REV-QA-Q99-01` / `RCB-Q99-07`。初轮正文中稳定操作身份、原操作查询、并发恢复等机制缺直接支持的教材小节引用，AQS-07不满足。原作者C已补邻近直接引用与6条sourceBindings，更新为`interview-answers-v1.0.1`，SHA256 `5b98c7767017e76814c043904227829698d411af87070fce6123da8da8aed5a0`。内容B及QA均已独立追加复验关闭，初轮收到稿和失败结论保留。当前124题全部为内容限定通过，展示接入尚未独立验证，不能写完整交付通过。

首轮QA实际执行环境为Python3.14.5/SQLite3.50.4，7新代码块、7组原函数/算例扩展及6组独立夹具与生产服务分开。具体输入/输出以本岗执行记录为准，PM不自行代测。用户数据库未用于测试。

集成QA首轮发现并登记`REV-QA-LINK-01`：同一答案多次引用同一教材文件的不同小节时，派生链接按文件合并，导致372次本地引用中118次错节，涉及62题。366条来源绑定本身正确；原数据岗与前端岗按逐次引用合同修复，测试已用原例、全量引用和真实Chrome复验关闭。首轮失败、修前包和复验报告均保留。

LINK-01修复按每次引用保留标签与位置，拒绝未明/歧义目标；372次本地加28次外部引用均已独立复验。124全文、20追问、327旧证据、22表格和13代码保留；主QA实际点击P02三个不同来源、核刷新、逐题查看P01–P10、390px表格和延期路由，最终报告为`met_within_tested_scope`。

## 当前内容交付

[124题目录](../textbooks/interview-answers-v1/README.md)、[完整合订本](../textbooks/interview-answers-v1/agent-interview-answers.md)已交；合订本SHA256 `9ff887bb145f774a210517fc2ae9b02168e613da6f70b7341ee4e3041187a657`。正文只Q99在首轮后补准确来源，全部124题的当前版本已独立审校及内容QA通过。原490个有效CR均有新稿复核；额外16个旧撤销ID及QA重复视角不计成新增独立关闭数。最终数据、渲染器与manifest绑定见QA `final-binding.json`。
