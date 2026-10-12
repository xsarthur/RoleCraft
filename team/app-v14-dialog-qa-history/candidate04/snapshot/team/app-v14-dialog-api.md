# v14 职业对话 HTTP 合同

内容检索工程师；2026-10-12；合同版本 `content-dialog-0.14-extractive`。依产品 app-v14-dialog-product 与 CL14-01/02，新增端点而不是改变既有推荐消费者。

`POST /api/content/dialog`（公共只读、同源、无账户调用）：JSON `{query,corpusVersion:'textbook-v12',startingPoint?,currentUnitId?,currentSectionId?,previousContext?}`。原字段意义沿用 recommend；`previousContext={unitId,sectionId,corpusVersion,sourceSha256?,focusTerm?}` 只接受字段白名单和canonical教材ID，任何提供hash仍要与真实公开源比较。focusTerm是可选2–40字符英文/数字/连字符公开术语，必须出现在该节真实正文，不能带指令；它避免同一节内ReAct追问漂到其他策略，仍不代表曾经执行的授权。上一主题用上一 answered 返回的 `dialog.context`，不传用户问题/任意历史/原回答/源路径/指令。短追问优先显式当前小节，再用上一已核主题；新主题不承接。缺主题澄清。版本/ID/hash不合法返回 invalid_input，无旧答。

响应保留顶层 status/results 等推荐字段，新 `dialog` 为：

```json
{
  "status": "answered",
  "answerMode": "extractive",
  "sentences": [{"text": "正文中的完整短句。", "citationIds": ["c1"]}],
  "citations": [{
    "id": "c1", "unitId": "existing-id", "sectionId": "existing-section",
    "sourcePath": "textbooks/v12/existing-id.md", "sourceSha256": "canonical-hash",
    "version": "textbook-v12", "corpusVersion": "textbook-v12", "corpusHash": "canonical-corpus",
    "unitTitle": "实际篇名", "sectionTitle": "实际小节", "href": "canonical-href",
    "evidenceExcerpt": "推荐原文摘录", "quote": "连续原文支持片段。", "quoteStart": 0, "quoteEnd": 13
  }],
  "scope": {
    "relatedSegments": ["保留的职业知识子句"],
    "filteredSegments": [{"text": "被排除子句", "reason": "outside_career_scope"}],
    "contextUsed": null,
    "classification": {"method": "local_bge_domain_comparison_with_explicit_scope_guards", "descriptionHash": "metadata-hash", "segments": []}
  },
  "message": "以下是教材中的简要回答。",
  "context": {"unitId": "existing-id", "sectionId": "existing-section", "corpusVersion": "textbook-v12", "sourceSha256": "canonical-hash"}
}
```

示例仅说明结构，非真实答案。quoteStart/End 是 canonical section.bodyMarkdown 的 JavaScript UTF-16 code-unit offset，end exclusive；`section.bodyMarkdown.slice(start,end)===quote`。sentence.text 是该小节和关联quote中的完整原文短句。`dialog.context`只由answered产生。contextUsed额外origin为 current_section 或 previous_answer；它是公开内容提示，不是用户认证/批准。classification内部相似度为工程判定证据，不是用户准确率/概率，无需在主UI显示。

| dialog.status | 顶层status | sentences/citations/results | 显示 |
| --- | --- | --- | --- |
| answered | recommended | 1–3简答句，1–3引用/入口 | 简答、出处入口；quote可展开 |
| related_uncovered | no_match | 空 | 相关但本教材尚无足够依据 |
| unrelated | no_match | 空 | 范围说明/已过滤 |
| needs_clarification | needs_clarification | 空 | dialog.message + 顶层clarification选项 |
| unavailable | unavailable | 空 | 暂不可用/重试 |
| invalid_input | invalid_input | 空 | 输入/上下文错误，不归无关 |

每句citationIds非空，引用id唯一且属于citations；引用对应results中的同一unit/section/source/href/version，需客户端使用当前教材包复核。保留语义provenance/providerCalled=false、querySentExternally=false。概念配置/纯静态可诚实暂不可用并继续提供原目录/检索，不能装成本地BGE短答。既有 `/api/content/recommend` 与本合同无新增必填字段，旧语义检索仍可用。

前端只在本会话保存最近有限问答与canonical主题，切页/清上下文/新主题不能将旧回答当新回答；已收到filteredSegments说明仅答保留部分。无论请求等待或失败，不能自动把旧答塞到当前问题。明确React前端实现相关但未覆盖，裸React澄清，ReAct机制可提取真实教材。此合同不包含题库/导航/新教材/生成服务/DB，独立QA另核当前绑定与必要反例。
