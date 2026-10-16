# Rolecraft 1.0 P0 独立复验报告

- **报告时间**：2026-10-16（Asia/Shanghai）
- **测试岗位**：测试工程师（独立复验）
- **目标版本**：`rolecraft-1.0`
- **远程单环境**：`http://111.231.8.78/`（公网 HTTP，Nginx → `127.0.0.1:4318`）
- **复验边界**：只读远程 HTTP/API、远程静态资源下载及隔离 QA 账户写入；没有修改源码、部署文件、旧 QA 报告或正式账户数据。
- **报告身份**：本报告是本轮 P0 新证据，不覆盖 `app-v1.0-qa.*`、`qa-v1.0-uiux-product-final.*` 或产品/设计验收。

## 结论

本轮远程接口、发布身份、教材目录/章节/出处、职业推荐与澄清、学习查询版本校验、权限边界，以及隔离账户上的 P01 版本化提交链均取得独立 HTTP 证据。静态资源从远程下载后与当前工作区指定客户端包逐项 SHA-256 一致。结论为：

`met_within_scope_for_remote_http_and_p01_data_contract; browser_ui_and_accessibility_not_verified; overall_not_met`

“通过”只覆盖下表实际请求和响应，不代表题库/复习/自评页面的点击、刷新、后退、任务恢复、视觉布局、键盘/读屏、200% 缩放、灰度/对比度、软键盘或真实学习者效果通过。由于本子代理无法创建/显示 IAB（工具返回 `IAB visibility is not supported in a subagent thread`），本轮没有把接口 200 或静态 HTML 当作浏览器现场通过。

## 证据与结果

| ID | 检查 | 独立证据 | 结果 |
|---|---|---|---|
| P0-01 | 发布与健康 | `GET /api/health` HTTP 200；响应头 `X-Rolecraft-Release-Version: rolecraft-1.0`；Node `v24.20.0`、`contentRetrieval.available=true`、`providerCalled=false`、教材 `textbook-v12`、30 units、corpus hash `c56def0f…f757` | **pass** |
| P0-02 | 首页与静态响应 | `GET /`/`GET /#learn` HTTP 200；HTML SHA-256 `de8647133091a34e767816c02cc47d2d792d88ff41b5e851a1b6002bf2dc817b`，与工作区 `dist/index.html` 一致；静态响应含 release header | **pass**（仅传输） |
| P0-03 | CSS/数据/客户端包版本 | 远程下载 10 个 CSS/JS/data 资源，与当前工作区逐项 SHA-256 一致（见资源表） | **pass**（不等于视觉通过） |
| P0-04 | 教材目录/版本身份 | `GET /api/content/catalog` HTTP 200；`corpusVersion=textbook-v12`、book SHA `25ce2aaa…c2801e`、30 units、每章含 sourcePath/sourceSha256/sections/href | **pass** |
| P0-05 | 章节与出处 | `GET /api/content/chapter/00-learning-route`、`/c01-selection` HTTP 200；c01 source SHA `4ee70a19…d982`；`GET /api/content/reference/agent-engineering-textbook.md` HTTP 200；不存在章节 HTTP 404 | **pass** |
| P0-06 | 职业推荐 | `POST /api/agent/career/recommend`：“Agent 的 ReAct 方法”返回 `recommended`、Agent 开发者候选、`local_bge+catalog_keyword`、版本/corpus/index 信息、`providerCalled=false`、`writePolicy=confirm_required` | **pass** |
| P0-07 | 职业澄清/无匹配 | 查询 `react` 返回 `needs_clarification`，明确 ReAct 与前端 React 两个选项；“完全不相关的陶艺职业”返回 `no_match`、无候选和改写/浏览提示 | **pass** |
| P0-08 | 学习查询主路径 | `POST /api/agent/learning/query` 的 ReAct 查询 HTTP 200、`status=recommended`，结果带 unit/section/href、原文摘录、sourcePath/sourceSha256、`matchingBasis`、版本/corpus/index 信息；未调用外部模型 | **pass**（接口/来源） |
| P0-09 | 学习查询澄清 | `react` 及无关主题均返回受控 `needs_clarification`，没有伪造教材答案；结果为空且说明需要补充语境 | **pass** |
| P0-10 | 学习查询上下文/版本失败 | 合法 `useCurrentContext=true,currentUnitId=00-learning-route` 返回 HTTP 200；不存在 unit 返回 HTTP 404；`contentVersion=textbook-v0` 返回 HTTP 409；错误均带 releaseVersion | **pass** |
| P0-11 | 未登录权限边界 | 未带会话访问 `/api/chapters`、`/api/submissions`、`/api/reviews`、`/api/generation-jobs`、`/api/profile` 均 HTTP 401 `unauthenticated`；未登录调用旧 `/api/retrieval/recommend` 也 HTTP 401 | **pass** |
| P0-12 | 隔离账户登录/职业确认 | 使用一次性 `example.invalid` QA 账户；注册、`/api/auth/me`、推荐、带 CSRF 的职业确认及确认后的 `/api/auth/me` 均成功，active career 为 `agent-developer`，快照版本/hash 一致 | **pass**（隔离账户） |
| P0-13 | P01 首次提交 | 隔离账户 `POST /api/submissions`，P01 identity（practice/unit/textbook/source SHA）匹配，返回 HTTP 201；响应明确 `workflowStatus=draft`、`professionalStatus=unreviewed`、`humanStatus=not_started`、evidenceStatus=self_reported | **pass** |
| P0-14 | P01 重复版本保护 | 同一 `artifactVersion=qa-p0-v1` 再次提交返回 HTTP 409 `artifact_version_conflict`；旧提交未覆盖 | **pass** |
| P0-15 | P01 修订/恢复数据链 | `PUT /api/submissions/{v1}` 使用新 `artifactVersion=qa-p0-v2` 返回 HTTP 201；响应 `previousSubmissionId` 指向 v1；`GET /api/submissions` 同时保留 v1/v2，状态和 hash 可读 | **pass**（API 数据契约） |
| P0-16 | 客户端评审结论边界 | 提交 `professionalVerdict=pass` 返回 HTTP 400 `client_verdict_forbidden`，客户端不能写入专业/真人评审结论 | **pass** |
| P0-17 | 任务/题库数据可见性 | 隔离账户 `GET /api/chapters`、`/api/generation-jobs` 为 HTTP 200 空集合；这证明权限和空状态响应，不证明网页题库/复习/自评交互可用 | **limited pass** |
| P0-18 | 浏览器现场视觉/交互 | 无法在子代理创建 IAB；未取得 320/375/390/768/1280 截图、DOM/AX 树、点击/刷新/后退/Tab/读屏/200%/灰度证据 | **not verified** |

## 远程与本地资源 SHA-256 对照

远程下载后计算；左/右相同才记作资源传输一致。资源一致不能代替运行时布局或交互验收。

| 资源 | 远程 SHA-256 = 工作区 SHA-256 |
|---|---|
| `index.html` | `de8647133091a34e767816c02cc47d2d792d88ff41b5e851a1b6002bf2dc817b` |
| `styles.css` | `47850ba437e3598424846361bb10463fc83513a3eae4d5ff7f1abcd6ad404139` |
| `learning-workbench.css` | `b35eaef44e73a56e2b1df0985fdfe8c960393ca086ffecaeba96b51bf798336c` |
| `learning-experience-v13.css` | `bd29b71eed6e7742b1e39ac13dabc9ef07ac5dfd9bd018e2d16b82b4a55cf509` |
| `auth-career-v15.css` | `1d5c799bb641056b051bf4a522d960f6863fee8ab6686e55fbd42f297f0fb13a` |
| `curriculum-data.js` | `c3c93435d4417792182c1f98b450a1e1a5c23aa9a8136ddb03086570c03f1442` |
| `content-v12-data.js` | `3eb094b460e0a1f545820232058d3b58b4c85d1353c87895709af3784d408b12` |
| `content-retrieval-core.js` | `b3535b2249effdb0118713295ae9b86e117e0d86c86041aade3e8c33a0fc092d` |
| `learning-workbench.js` | `2086c9ae26ee158e1bf4c89a296513b24b9173fb65a098bf03f9cd27c065668e` |
| `learning-v13-data.js` | `6d27dabc1cedc15236de846c44dae8f66c4f82b77c2ede543941d3589e8772a4` |
| `app.js` | `68415ce3c8e2695cbb7807fb4ddb02abf929c76ab9b22563e791081002817289` |

> 以上哈希由远程下载和工作区文件分别计算，逐项一致；资源一致只说明部署传输一致，不代替运行时视觉和交互验收。

## 未完成验收及复验条件

1. 软件工程师修复后，由测试工程师重新取得真实浏览器截图/DOM/AX 收据：320、375、390、768、1280px；确认顶栏职业/账户入口无裁切、题库不显示错误空态。
2. 逐一点击题库、复习、自评；验证刷新/后退、四态任务恢复、P01 首次提交/修订/恢复与错误提示。
3. 运行键盘 Tab/Shift+Tab、焦点恢复、读屏、200% 缩放、灰度/对比度和软键盘矩阵；保存当前版本截图及 AX 证据。
4. 题库、复习、自评必须先有冻结的数据/来源 hash 和产品验收口径；本轮隔离账户空集合不能代替内容可用性。
5. 产品经理和项目经理应保留本报告的 `not verified` 与 `limited pass` 状态，不能把本报告改写为完整 1.0 通过或就业/职业认证结论。

## 账户与数据说明

本轮创建了一个仅用于 QA 的 `example.invalid` 隔离账户并写入两条 P01 版本化提交（v1/v2），没有使用或读取正式用户账户；报告不保存密码、会话 token 或完整用户 ID。该隔离账户数据用于证明权限/版本链，需由后端数据工程师按远程单环境的数据保留策略清理或标记为 QA fixture，再进行下一轮复验。
