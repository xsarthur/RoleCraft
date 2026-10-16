# rolecraft-1.0 远程 UI/UX 与产品独立验收

- 测试岗位：测试工程师（独立复核）
- 测试时间：2026-10-15T19:22:47Z
- 环境：`http://111.231.8.78/#learn`（远程单开发环境）
- 数据边界：仅只读 HTTP/公开检索请求；未登录、未创建账户、未写真实数据库、未调用付费模型。

## 结论

当前 HTTP 内容与检索范围为 `met_within_scope`：health、教材目录/章节、React 术语推荐、学习查询、无匹配/澄清/错误路径和未登录权限边界均获得当前远程响应证据。

完整 UI/UX 与产品最终验收为 `not_met`。本次子代理的 CUA/IAB 无法提供远程页面的截图或可访问性树（绑定现有标签页超时、创建可见标签页在子代理中不支持），所以没有独立观察真实渲染、点击、路由变化、响应式布局、键盘/读屏行为。账户绑定的任务状态/恢复、题库、复习、自评和 P01 提交也没有使用隔离账户实测。静态源代码和接口自检不能替代这些证据。

## 已通过的当前远程证据

- **UI-01 发布版本与健康：`pass`**。GET http://111.231.8.78/api/health -> HTTP 200; X-Rolecraft-Release-Version=rolecraft-1.0; nodeVersion=v24.20.0; contentVersion=textbook-v12; retrievalVersion/content index content-retrieval-0.12-v12; units=30; localSemanticPrepared=true; providerCalled=false.
  - 限制：generation configured=false; paid/external model was not invoked.

- **UI-02 客户端资源传输：`pass`**。index.html, styles.css, learning-workbench.css, learning-experience-v13.css, auth-career-v15.css, interview-answer-reader.css, learning-workbench.js, learning-experience-v13.js, auth-career-v15.js and app.js all returned HTTP 200 with X-Rolecraft-Release-Version=rolecraft-1.0. Remote SHA256 matched the local dist files listed in assetSha256.
  - 限制：HTTP transport only; browser parse/render not independently observed.

- **UI-03 教材目录与版本身份：`pass`**。GET /api/content/catalog -> 200; textbook-v12; 30 units, 5 assets, 20 references; corpusHash=c56def0f8eaf17207c10bc794a771650b0c9f52207815ce11aa7a7a00f29f757; bookSha256=25ce2aaa1be0ba0f2814dd1247ac6299d106c3d2e48f43867c49055490c2801e. Explicit v10 catalog -> 200; bogus version -> 400 content_version_invalid.
  - 限制：No visual check of the route map.

- **UI-04 教材章节定位：`pass`**。GET /api/content/chapter/00-learning-route -> 200 with 7 sections and stable href #learn/agent/00-learning-route/s-3b82fdeafaab; n03-planning-reflection -> 200 with 8 sections; c01-control-loop -> 200 with 29 sections. Missing unit -> 404 not_found.
  - 限制：Clicking a returned href and focus/scroll behavior were not browser-tested.

- **UI-05 内容推荐 React 术语与出处：`pass`**。POST /api/content/recommend {query:react} -> 200 status=recommended; matchingMethods include local_semantic_vectors, local_task_concepts, source_term_recall; first result n03-planning-reflection, sourcePath=textbooks/v12/n03-planning-reflection.md, sourceSha256=76b919dbb061348a5bc59b958f714a9fff814be618d390be48eba098751372dd, href=#learn/agent/n03-planning-reflection/s-dc2e15b8cffc; providerCalled=false.
  - 限制：No visual click-through to the source card.

- **UI-06 学习查询澄清：`pass`**。POST /api/agent/learning/query with valid requestId/workbenchVersion/local-workbench-0.11/agentVersion/agent-system-v0.12 and query=React -> 200 status=needs_clarification; asks Agent ReAct method vs frontend React framework and supplies two options; providerCalled=false.
  - 限制：No live form submission was performed.

- **UI-07 学习查询推荐：`pass`**。Same endpoint query=如何让模型根据新观察规划下一步 -> 200 status=recommended, resultType=plan, engineMode=local_semantic_retrieval, results=2, providerCalled=false; dialog is extractive and includes教材版本身份.
  - 限制：No DOM rendering or citation activation check.

- **UI-08 无匹配与输入错误：`pass`**。POST /api/content/recommend query=火星上的陶艺课程 -> 200 status=no_match, results=0. Learning query with same unrelated text -> 200 status=needs_clarification and asks for Agent/software/product relation. Empty query -> 400 input_invalid query format. No fabricated answer observed.
  - 限制：Only API responses; visual error and recovery affordances untested.

- **UI-09 账户/任务/记录边界：`pass`**。Unauthenticated GET /api/auth/me, /api/profile/career, /api/jobs, /api/chapters, /api/submissions, /api/reviews, /api/export each returned HTTP 401 unauthenticated with releaseVersion=rolecraft-1.0.
  - 限制：This confirms auth gating only; no account was created and no task/progress/recovery mutation was attempted.

## 尚未形成独立通过证据

- **UI-10 导航与入口可发现性：`insufficient`**。Current deployed index source contains nav buttons for 首页、课程学习、题库、复习、自评检验、学习记录、个人设置; mobile-menu has aria-controls/aria-expanded; onboarding dialog has labels and live status regions. This is static source evidence, not a live browser observation.
  - 限制：CUA/IAB in this sub-agent could not expose the existing remote tab; getTab/getAXState timed out and createBrowserTab visibility is unsupported. No screenshot/AX tree, click, route change or content load was independently observed.

- **UI-11 当前任务状态与恢复：`insufficient`**。Deployed learning-experience-v13.js contains explicit not_started/in_progress/interrupted/browsed states, actions 开始学习/继续学习/恢复任务/回顾, and save/resume links; learning-workbench.js contains data-lw-interrupt and local browser persistence.
  - 限制：No live browser state transition, reload, resume URL, interruption or localStorage persistence test.

- **UI-12 题库/复习/自评入口：`insufficient`**。Deployed client source contains filters for fixed100/market14, question detail, review state, self-check flow, source excerpts and links back to教材.
  - 限制：No live page interaction, answer entry, mark/review transition, or browser persistence was observed.

- **UI-13 P01项目提交/版本链：`insufficient`**。Client source exposes project fields and local save/export; server protected account endpoints are present and unauthenticated access is rejected.
  - 限制：No authenticated isolated account was available; no create/update/duplicate-version/recovery operation was attempted against the remote database.

- **UI-14 视觉响应式与可访问性：`insufficient`**。Source includes viewport meta, semantic nav/main/dialog, labels, aria-live/status, aria-controls and focusable map container.
  - 限制：Visual spacing, contrast, breakpoint behavior, keyboard-only traversal, focus order, screen reader output, reduced-motion and zoom were not tested because browser screenshot/AX channel was unavailable in this sub-agent.

## 版本与传输证据

health 返回 `releaseVersion=rolecraft-1.0`、Node `v24.20.0`、教材 `textbook-v12`、检索 `content-retrieval-0.12-v12`、`providerCalled=false`。远程以下客户端资源的 SHA256 与工作区 `sites/rolecraft/dist/` 对应文件一致：

- `index.html` — `de8647133091a34e767816c02cc47d2d792d88ff41b5e851a1b6002bf2dc817b`

- `styles.css` — `47850ba437e3598424846361bb10463fc83513a3eae4d5ff7f1abcd6ad404139`

- `learning-workbench.css` — `b35eaef44e73a56e2b1df0985fdfe8c960393ca086ffecaeba96b51bf798336c`

- `learning-experience-v13.css` — `bd29b71eed6e7742b1e39ac13dabc9ef07ac5dfd9bd018e2d16b82b4a55cf509`

- `auth-career-v15.css` — `7ee6e33b9cc7c1406b26143475b85c45d8a2cb67c7403bee616bf13e7bfb119`

- `interview-answer-reader.css` — `94a65d0e234357678da6d5d8dcce2ef9fee39f9004b3611764935e248e255bff`

- `learning-workbench.js` — `2086c9ae26ee158e1bf4c89a296513b24b9173fb65a098bf03f9cd27c065668e`

- `learning-experience-v13.js` — `3b17e6ce3b1d06c6aecea39f2f69a8745233f85192b275c7168016b556e89d65`

- `auth-career-v15.js` — `48f6b83354c89546cd884ab505e73653814f03cf323c20aad5d7561869be078c`

- `app.js` — `68415ce3c8e2695cbb7807fb4ddb02abf929c76ab9b22563e791081002817289`

## 浏览器限制与下一步

CUA 尝试：绑定现有 IAB 标签页后 `getAXState` 30 秒超时；在子代理中创建可见 IAB 被拒绝，创建不可见标签页超时。因此本报告将所有浏览器视觉/交互项目标为 `insufficient`，没有把源码中的 ARIA、任务状态和按钮定义冒充现场通过。

项目经理应协调可用的浏览器 AX/截图通道，先复验访客路径，再准备可回收隔离账户或不写库夹具复验任务、记录、复习、自评和 P01 版本链；新版本需要重新独立验收。

逐项 JSON 证据见同名 `.json` 文件。
