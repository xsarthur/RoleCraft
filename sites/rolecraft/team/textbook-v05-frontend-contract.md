# 再生成 Agent 教材 · 客户端接入契约

2026-10-10；网站客户端工程师。本文是内容接入建议，不是课程架构、教材正文、专业审核或独立验收。实施需等待项目经理交接已冻结作者包及产品范围。

## 现状与兼容边界

- `dist/app.js` 的 `#book/agent` 当前是旧八章之一“Agent 机制与任务分解”的短示例。旧八模块 ID 为 `foundation/models/agent/tools/retrieval/state/eval/delivery`，对应 `rolecraft-v1` 的概念测验、最后章节及教材/练习复盘。
- `dist/curriculum-data.js` 是 `curriculum-draft-0.2` 的十二模块规划，ID 为 `f01/f02/c01/c02/c03/e01/e02/e03/e04/e05/p01/p02`，不包含完整正文。不得用新正文直接替换旧 `modules` 数组而继承旧完成、测验或审核。
- `dist/generation-curriculum-data.js` 与服务端受控 e03 输入属于另一条 `generation-curriculum-draft-0.4` 契约；本轮全书草稿单独接入，不改变这份输入、不改数据库/任务/模型协议、不把人工代理编写包说成网站真实模型调用结果。
- 本轮先做全书及章节阅读、受控来源/证据状态显示、Markdown 下载。新版学习进度、自动判卷及后端保存是另外的产品范围；本次不将新版阅读或练习自动转为旧测验通过。

## 内容包建议

作者维护 `team/textbook-v05.json`（最终文件名可由课程岗确认）；前端只原样包装为 `dist/textbook-data.js` 的 `const textbookData = {...}`，读取时不访问用户数据。建议总包字段如下，可保留领域岗位附加元数据；字段含义由课程/作者岗位决定：

```json
{
  "schemaVersion": "1.0",
  "id": "agent-developer-textbook",
  "version": "agent-textbook-draft-0.5",
  "title": "Agent 开发者教材",
  "updatedAt": "2026-10-10",
  "status": "draft",
  "curriculumVersion": "curriculum-draft-0.2",
  "provenance": {"authorRole": "教材研发员", "generationMode": "agent_authored_draft", "limitations": []},
  "review": {"aiContentReview": "not_reviewed", "humanExpertReview": "not_done", "learnerValidation": "not_done"},
  "learnerProfiles": [],
  "sources": [],
  "chapters": []
}
```

`chapters` 每项建议：

- `id/moduleId/title/version`：章 ID 必须使用原课程十二模块 `f01/f02/c01/c02/c03/e01/e02/e03/e04/e05/p01/p02`，不用旧八短示例 ID；版本单独展示。
- `prerequisites/objectives/competencyIds/creationStageIds`：数组；前端显示不重定义教学要求。
- `sections`：九项 `{id,title,bodyMarkdown}`，顺序固定为现有 `scope/outcomes/concepts/case/example/practice/validation/sources/reflection`。正文含完整教学解释，不以字段名占位。原文哈希可由作者附 `bodySha256`，前端显示不能变成审校证明。
- `knowledgePoints`：每项建议 `{id,title,objectiveIds,sectionIds,exerciseIds}`；若架构师使用另一映射形态，作者同时交付准确说明，前端消费而不自行补映射。
- `exercises`：每项建议 `{id,title,level,task,deliverables,knowledgePointIds,referenceSolution,feedback,transferPrompt}`，层级遵循课程规格；参考解析使用折叠，正文已有练习仍保留，不自行改写或设计题目。
- `claims`：每项建议 `{id,text,sourceIds,locators,status,limits}`；原创教学设计与技术外部论断分别标明。未核验保留未知；仅 ID 引用存在不代表语义已核验。
- `examples`：每项建议 `{id,title,kind,environment,expectedResult,executionStatus,evidenceReferences,limits}`；伪代码、预期结果、真实执行结果分别显示。独立测试记录由测试岗位或内容审校员交接，不由前端推断。
- `sourceIds/review/limits`：章引用、当版审校、限制。新草稿不得继承 e03 输入稿审核或上一版产品审计。

全局 `sources` 每项建议 `{id,title,organization,type,url,version,accessedAt,locator,supports,limits}`。领航本地教材作为内部参考，可用 `local_reference` 加相对标识和章节位置，不把桌面绝对路径发布成浏览器可点击链接；原文引用/摘要范围由教材及审校岗位确认。

## 阅读和下载的最小接入

- 保留现有主导航和页壳。项目经理交接确认：`#book/agent` 自然进入新版十二章阅读，默认定位 Agent 相关的原课程模块 `c01`；`#book/agent/<chapterId>` 可定位新版章节。旧八章保留“切回原短示例（sample-0.1）”入口及原历史测验/复盘，显式区分内容版本，不改旧记录的模块 ID。新版其他入口及旧示例 URL 细节在 B01/B02 后冻结。
- 新版章选择仅浏览器内存/URL，不写 `rolecraft-v1`、不调用 `/api`。新版章节按钮不用旧 `data-lesson`，防止旧最后章节/测验状态被误写。旧计划导出仍按旧样例输出，不偷偷替换成新书。
- 一页只呈现当前章九节及该章知识点、练习、来源和状态，长文按标题/代码块/段落排版。参考解法折叠，支持目录跳转和上一章/下一章。
- 读者必须看得到“代理编写草稿”“内容审校是否完成”“案例实际运行与学习效果状态”；当前产品整体门槛仍由独立产品审计决定，正文长度/章节覆盖不推导达标。
- 提供全书、当前章 Markdown 下载，文件名带教材版本。导出原始正文和资料/证据状态，不复制用户账户、作品、自评、浏览器档案或服务器密钥。下载不是教学效果认证。

## 内容安全

- 所有标题、正文、练习、JSON元数据先转义；不将作者或来源中的 HTML 直接 `innerHTML` 执行。最小 Markdown 解析器仅处理已转义段落、标题、列表、围栏代码，不启用内嵌 HTML、图片、任意链接或代码执行。
- 来源仅对明确 `https:`、无用户名密码、无非标准端口且属于已交接官方域名白名单的 URL 生成为外链，设置 `rel="noopener noreferrer"`。内部本地引用/无法确认 URL 只显示文字，拒绝 `javascript:/data:/file:`。
- 不读取默认服务 SQLite、浏览器真实 localStorage、用户账户和作品。开发自检只使用隔离 VM/虚构数据；真实浏览器操作与独立验收另交测试岗位。
- 缺包、非法版本/缺章或关键字段错误时明确显示资源问题，不回退短示例并伪装新版教材完成。

## 自查与下一步

本契约依据 `AGENTS.md`、现有 app 路由/状态归一化、课程地图、e03 生成阅读和客户端交付记录。此阶段仅阅读和写本文，没有改 dist/server/专业内容或运行测试。新版十二章同源静态展示，作者源 JSON 只由教材研发员写，dist 包装由网站客户端工程师写，独立 QA 报告只由测试工程师写。需 B01 产品/B02 课程交接及作者完整数据后完成接入；此前可准备缺包降级及阅读骨架。完成后将源 JSON 与包装 JS 一致性、安全、下载、十二章可访问、新旧状态隔离及当版审核显示交独立测试员复核。
