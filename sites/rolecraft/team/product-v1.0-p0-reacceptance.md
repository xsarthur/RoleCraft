# Rolecraft 1.0 P0 产品复验记录

- **复验日期**：2026-10-16（Asia/Shanghai）
- **验收岗位**：产品经理（只读复验；不替代 UI/UX 或测试岗位）
- **目标环境**：`http://111.231.8.78/#learn`
- **发布身份**：`rolecraft-1.0`
- **本轮范围**：P0 修复后远程单开发环境；题库/自评数据、当前任务、问教材与职业边界、P01 入口和版本身份。
- **证据方式**：远程 HTTP 响应、远程静态资源与脚本的 DOM/渲染分支核对、远程题库数据解析。当前子任务没有可用的浏览器交互通道，因此现场点击、截图、焦点、窄屏和读屏证据保持未验证。

## 结论

P0 修复已补齐题库数据和题库页面的产品实现条件：远程 `learning-v13-data.js` 实际包含固定 100 题与市场补充 14 题，共 114 题；每题均有教材小节、原文证据、来源路径、`sourceSha256` 和稳定定位，题库详情、复习、自评和 P01 都有当前主流程入口。当前任务卡已实现未开始、进行中、已中断和已浏览四种事实状态；问教材、React 澄清、无匹配恢复和版本身份接口在远程 HTTP 上可用。

因此，本轮产品范围结论为 **`met_within_scope_for_p0_remote_product_contract`**，其中 V1-04 从上一份报告的 `fail` 修复到 **`met_within_scope_static_data_and_route`**。这不是完整产品通过：浏览器内 UI/UX 操作、P01 保存/提交/刷新恢复、登录后职业确认写入以及独立 QA 现场证据仍不足，完整目标继续为 **`overall_not_met`**。

产品定位继续按用户决定执行：丰富行业知识、教材定位、练习和面试准备，帮助用户更从容地应对市场面试；不承诺就业、职业认证、岗位胜任、真人专家认可或行业领先。

## 当前远程证据

### 题库与教材来源

- `GET /api/health` 返回 `releaseVersion=rolecraft-1.0`、`contentVersion=textbook-v12`、`indexVersion=content-retrieval-0.12-v12`、`providerCalled=false`。
- `GET /api/content/catalog` 返回当前 v12 目录；`GET /api/content/chapter/p01-mvp` 返回 P01-MVP 正文、来源路径和 `sourceSha256`。
- 远程 `/learning-v13-data.js` SHA-256：`6d27dabc1cedc15236de846c44dae8f66c4f82b77c2ede543941d3589e8772a4`。
- 解析 `RolecraftLearningV13`：`questions=114`，题组为 `fixed100=100`、`market14=14`；`units=30`、`knowledgePoints=240`、`evidence=327`、`selfTestEligible=112`、需真实经历题为 `Q10/Q99`。114 题均至少有一个 `knowledgeRef` 和一个 `evidence`，检查到的引用均有 `sourcePath`、`sourceSha256`、`href`，没有空来源绑定。
- 远程 `learning-experience-v13.js` 的页面分支实际提供 `#questions`、`#review`、`#check` 和 `#projects`；题库页文案明确显示“全部题组（100 + 14）”，题目详情通过教材参考分析、原文摘录和“阅读这一节”回链来源。

### 当前任务和 P01

- 远程 `learning-experience-v13.js` 的当前任务渲染分支覆盖 `not_started`、`in_progress`、`interrupted`、`browsed`，对应“开始学习/继续学习/恢复任务/回顾”唯一主行动；任务工具提供题库、复习、自评和“进入 P01 练习”。
- 远程 `learning-workbench.js` 固定 P01 `V1-PILOT-P01-MVP-001`，绑定 `textbook-v12`、`p01-mvp`、正文路径和来源 hash；保存版本化草稿、提交新 `artifact_version`、保留 `submission_id/previous_submission_id`、旧提交历史及“尚未独立复验”边界。
- P01 证据只能表达本人自述和记录层级，不自动显示“已掌握/已通过/可录用”。本轮仅核对页面分支和字段，未在浏览器提交。

### 职业边界与教材检索

以下请求均在远程 `rolecraft-1.0` HTTP 服务上复验，`workbenchVersion=local-workbench-0.11`、`agentVersion=agent-system-v0.12`：

- `POST /api/agent/career/recommend`，输入 `React`：返回 `needs_clarification`，明确给出“Agent 的 ReAct 方法”和“前端 React 框架”两个选项，无候选自动写入，`writePolicy=confirm_required`。
- `POST /api/agent/career/recommend`，输入“Agent开发者”：返回 `recommended`，候选 `agent-developer`，教材身份 `textbook-v12 / agent-engineering-v12 / content-retrieval-0.12-v12` 和语料 hash 齐全，并明确“不构成职业测评或就业承诺”。
- `POST /api/agent/learning/query`，输入“ReAct是什么”：返回 `recommended`，`dialog.answerMode=extractive`，包含小节、原文引用、来源路径/hash、教材/索引/语料版本、理由和 `providerCalled=false`。
- 同接口输入“量子化学实验设备维修”：返回 `no_match`、`retrievalResultType=related_uncovered`、空结果和高不确定性，没有编造教材答案；恢复动作由客户端静态分支提供改写和课程目录入口。
- `POST /api/content/dialog` 对上述 ReAct 与无匹配用例也分别返回可核对的 `answered` 与 `related_uncovered`，版本和语料身份一致。

## P0 验收矩阵

| ID | 上轮结论 | P0 产品复验结论 | 依据与剩余限制 |
|---|---|---|---|
| V1-01 | `insufficient` | `met_within_scope_state_logic` | 当前任务四态和唯一主行动已在远程脚本分支实现；仍缺浏览器实际切换、刷新、后退和恢复现场证据。 |
| V1-02 | `insufficient` | `met_within_scope_http_boundary` | React 澄清、已发布候选、版本快照和确认必需边界已由 HTTP 实测；未登录确认写入、冲突、取消和幂等现场未做浏览器复验。 |
| V1-03 | `met_within_scope` | `met_within_scope` | ReAct 检索结果实际返回意图/结果类型、教材小节、摘录、来源、版本、理由、不确定性和阅读定位。 |
| V1-04 | `fail` | `met_within_scope_static_data_and_route` | 远程题库 100+14=114，题目详情带教材来源；`#questions/#review/#check` 与 P01 主入口均存在。仍需独立 QA 点击、刷新、后退和窄屏现场复验。 |
| V1-05 | `insufficient` | `insufficient` | P01 版本化草稿、提交、历史、状态和来源字段已在客户端；未取得浏览器保存/提交/刷新恢复或账户 API 交接证据。 |
| V1-06 | `met_within_scope` | `met_within_scope` | health、目录、章节和静态资源携带 `rolecraft-1.0`；内容身份和题库语料 hash 一致。`productVersion=local-mvp-0.4` 是后端兼容字段，不能单独当发布版本。 |
| V1-07 | `insufficient` | `insufficient` | 代码含视觉状态/ARIA/窄屏分支；本轮无浏览器通道，未验证视觉布局、键盘、焦点、读屏和 200% 缩放。 |
| V1-08 | `insufficient` | `met_within_scope_http_boundary` | ReAct、无匹配和相关但未覆盖输入均返回真实状态、版本来源和恢复语义；来源失配、不可用、迟到响应仍待独立 QA 复验。 |
| V1-09 | `met_within_scope` | `met_within_scope` | 页面与服务保留本地开发、教材参考、本人自评和未调用外部模型边界；无就业/认证承诺。 |

## 未关闭缺口与岗位交接

- **设计师 + 客户端 + 测试工程师**：在当前远程版本完成桌面、`768/390/320 CSS px`、键盘/焦点/读屏/200% 缩放现场复验；记录截图、焦点元素和错误/加载/无匹配/成功七态。
- **客户端 + 后端数据工程师 + 测试工程师**：使用隔离测试账户完成 P01 草稿、首次提交、修订、刷新恢复和来源回链；保留旧提交和首失败记录。
- **产品经理 + 后端/检索 + 测试工程师**：补做登录后职业确认、取消、版本冲突和幂等现场复验；不把推荐结果当作确认写入。
- **测试工程师**：不得用本报告或静态脚本替代独立 UI/UX 验收；应在当前远程源冻结后重新核 V1-01～V1-09，并把现场结果单独记录。
- **项目经理**：协调以上岗位，保留本报告与上一份 `product-v1.0-final-acceptance`，返修后按同一验收 ID 复验，不能用题库补齐推断完整职业目标完成。

完整职业培养、真实用户价值、真人专家审核、真实学习效果、行业比较、真实模型生成、生产可靠性和成本运营仍属于原八门槛，当前整体不达标。
