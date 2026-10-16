# Agent 双输入 v0.12 c01 与卡片字段独立 QA

- 版本：`app-v0.12-c01-card-fields-qa`
- 日期：2026-10-15（Asia/Shanghai）
- 责任岗位：测试工程师（独立质量验证）
- 范围：c01-selection 索引重建、职业输入与学习输入双路径、职业卡/学习卡字段展示
- 结论：`met_with_limitations`（23/23 项通过；insufficient TCP；浏览器未运行）

## 执行环境与边界

- Node：`v24.16.0`；HTTP 证据为进程内 Node HTTP handler + 隔离临时 SQLite。
- 外部模型：未调用，所有响应 `providerCalled=false`。
- 正式数据库/用户服务：未触碰。
- 真实 TCP：未形成业务证据（本地 Node24 回环探针返回状态 2）。
- 真实浏览器、IME、焦点、窄屏和迟到响应：未运行，不能由本报告宣称通过。

## 关键版本绑定

- c01 正文 SHA256：`4ee70a19c07d14a550ff9f1fbcfb46ec26a3e236aef30b5d3f2b1ce3f190d982`
- c01 索引声明 SHA256：`4ee70a19c07d14a550ff9f1fbcfb46ec26a3e236aef30b5d3f2b1ce3f190d982`（一致）
- canonical corpusHash：`c56def0f8eaf17207c10bc794a771650b0c9f52207815ce11aa7a7a00f29f757`
- 索引：`c005e8fd4071d14a8acc657a762e53359ea79cd785879bdbaceb52c4768b8142`；vectors：`56b81378723d8cd915abb848bc8ec6c4a84eeac0a52fe548ca711ae183f49e47`；意图 vectors：`cd0f1e55e25d9b275558baf1693f0721b6ae9eb896a7519c582e8e75a0b51431`
- 客户端实际模板绑定：auth `48f6b83354c89546cd884ab505e73653814f03cf323c20aad5d7561869be078c`；learning `00164fb51872de3e91f61eca0730278495a29b22440e211690ba1826cbcd613d`
- 客户端工程交接报告中的旧 160d SHA 与本轮实际工作区字节不同，未覆盖本轮绑定；旧交接与中间字节均保留为历史证据。

## 双输入 QA 结果

- `catalog-rebuild-c01-hash`：**pass** — {"units":30,"c01IndexSha256":"4ee70a19c07d14a550ff9f1fbcfb46ec26a3e236aef30b5d3f2b1ce3f190d982","c01SourceSha256":"4ee70a19c07d14a550ff9f1fbcfb46ec26a3e236aef30b5d3f2b1ce3f190d982","corpusHash":"c56def0f8eaf17207c10bc794a771650b0c9f52207815ce11aa7a7a00f29f757","recomputedCorpusHash":"c56def0f8eaf17207c10bc794a771650b0c9f52207815ce11aa7a7a00f29f757"}
- `catalog-readiness-node24`：**pass** — {"available":true,"retrievalVersion":"content-retrieval-0.12-v12","corpusVersion":"textbook-v12","corpusHash":"c56def0f8eaf17207c10bc794a771650b0c9f52207815ce11aa7a7a00f29f757","units":30,"localSemanticPrepared":true,"runtimeSupported":true,"requiredNodeMajor":24,"nodeVersion":"v24.16.0","providerCalled":false}
- `career-recommend-card-contract`：**pass** — {"status":200,"requestId":"7a08c20d-0486-4931-80a0-c31bce0cd9ee","candidate":{"careerId":"agent-developer","matchedSignals":["Agent"],"gaps":["服务未提供差距说明"],"actions":["confirm","compare","browse_content"],"contentVersion":"textbook-v12","indexVersion":"content-retrieval-0.12-v12","corpusHash":"c56def0f8eaf17207c10bc794a771650b0c9f52207815ce11aa7a7a00f29f757"}}
- `career-react-clarification`：**pass** — {"status":200,"requestId":"58922890-8b64-499d-b82c-1a69e97d1fb9","options":["Agent 的 ReAct 方法","前端 React 框架"]}
- `career-no-match`：**pass** — {"status":200,"requestId":"1d5c397e-d271-4798-81eb-f8c6308bdcd3","statusValue":"no_match","candidateCount":0}
- `account-fixture`：**pass** — {"status":201,"hasCookie":true,"hasCsrf":true}
- `career-confirm-write`：**pass** — {"status":200,"body":{"requestId":"e7f9faaf-582c-4990-ac28-57fb8dee545d","recommendationRequestId":"300f3715-c7f9-47cc-bac2-fe6298194141","status":"confirmed","agentVersion":"agent-system-v0.12","career":{"careerId":"agent-developer","title":"Agent 开发者","status":"published","contentVersion":"textbook-v12","indexVersion":"content-retrieval-0.12-v12","textbookVersionId":"agent-engineering-v12","corpusHash":"c56def0f8eaf17207c10bc794a771650b0c9f52207815ce11aa7a7a00f29f757"},"write":{"target":"active_career","source":"agent_confirmed","idempotent":false,"idempotencyKey":"qa-card-confirm-1792078201394"},"next":{"open":"learning_home"}}}
- `career-confirm-idempotent`：**pass** — {"status":200,"idempotent":true}
- `career-confirm-version-conflict`：**pass** — {"status":409,"error":{"code":"career_version_mismatch","message":"职业目录或教材版本已变化，请重新推荐","requestId":"c9e10253-60d1-4c86-92a4-e0d128582b41"}}
- `learning-react-clarification`：**pass** — {"status":200,"statusValue":"needs_clarification","options":["Agent 的 ReAct 方法","前端 React 框架"],"providerCalled":false}
- `learning-unrelated-no-match`：**pass** — {"status":200,"statusValue":"no_match","dialogStatus":"unrelated","resultCount":0,"citationCount":0}
- `learning-source-excerpt`：**pass** — {"status":200,"statusValue":"recommended","result":{"unitId":"e01","sectionId":"s-172c0d686372","sourcePath":"textbooks/v12/e01.md","sourceSha256":"0b430171313c93a7e8b0e183f11297c158ad102bfcce86834f2ef675f194b35a","href":"#learn/agent/e01/s-172c0d686372","version":"textbook-v12","indexVersion":"content-retrieval-0.12-v12","corpusHash":"c56def0f8eaf17207c10bc794a771650b0c9f52207815ce11aa7a7a00f29f757","excerpt":"恢复不应从“上次聊天停在哪里”开始，而应从权威动作账本开始：哪些意图已固定，哪些尝试可能已发，哪个外部效果已确认，谁现在有权推进。"}}
- `learning-ordinary-query`：**pass** — {"status":200,"statusValue":"recommended","providerCalled":false,"resultType":"compare","resultCount":2}
- `learning-context-opt-in`：**pass** — {"status":200,"statusValue":"recommended","contextUsed":{"unitId":"c01-control-loop","sectionId":"s-81f9aaeecb60","corpusVersion":"textbook-v12","sourceSha256":"f836af7e291cae69328e5e9fceb92c8734046906f6588bfd66edf2e0cf365fd8"},"resultCount":2}
- `learning-context-opt-in-enforced`：**pass** — {"status":400,"error":{"code":"input_invalid","message":"只有用户开启当前章节上下文时才可发送章节位置","requestId":"13c7c49f-9f61-41b8-b8b8-bd1be2477175"}}
- `learning-version-conflict`：**pass** — {"status":409,"error":{"code":"content_version_mismatch","message":"学习内容版本已变化，请刷新职业教材后重试","requestId":"c8210502-b6f8-4c78-aeca-c3bbcdae1eff"}}
- `learning-legacy-route`：**pass** — {"status":200,"statusValue":"recommended","dialogStatus":"answered","corpusVersion":"textbook-v12"}
- `dynamic-career-unavailable`：**pass** — {"status":200,"statusValue":"unavailable","results":0,"providerCalled":false,"contentVersion":"textbook-v12","textbookVersionId":"data-analytics-v1"}
- `career-legacy-route`：**pass** — {"status":200,"statusValue":"recommended","count":1}
- `client-node-check`：**pass** — {"node":"v24.16.0","authStatus":0,"learningStatus":0}
- `career-card-field-template`：**pass** — {"tokens":["匹配信号","待补能力","索引","浏览教材","可比较","服务未提供"],"sha256":"48f6b83354c89546cd884ab505e73653814f03cf323c20aad5d7561869be078c"}
- `learning-card-field-template`：**pass** — {"tokens":["查看本次版本身份","教材身份","索引版本","语料 SHA256","查看出处与版本","稳定定位"],"sha256":"00164fb51872de3e91f61eca0730278495a29b22440e211690ba1826cbcd613d"}
- `client-protocol-version`：**pass** — {"runtimeVersion":"local-workbench-0.15-p0","protocolVersion":"local-workbench-0.11"}

## 整体判断与未完成项

索引来源失配已由当前 c01 正文重建为一致的派生索引，Node24 下 30 单元目录、职业推荐/澄清/无匹配/确认/幂等/版本冲突，以及学习 React 澄清、题外 no_match、来源摘录、普通查询、context opt-in、旧路由和动态职业 unavailable 均按限定合同通过。职业卡模板呈现匹配信号、待补能力、版本/索引和只读动作；学习卡模板呈现教材身份、索引版本、语料 SHA、来源 SHA 与稳定定位。

本报告的 `met_within_scope` 仅表示上述 Node24 进程内/隔离范围；真实 TCP 业务请求、浏览器交互、中文输入法、响应式布局、焦点和迟到响应仍无证据，跨重启幂等仍未证明。完整职造产品、真实学习效果、真人专家、职业胜任、行业先进性、生产部署和经济性仍保持 `not_met`，不得从本轮 QA 推导。

历史报告未覆盖：旧 `app-v0.12-continuation-qa.md/.json` 保留其 10/17、`not_met` 结论；本文件只记录索引/后端同步及卡片字段修复后的新版本证据。
