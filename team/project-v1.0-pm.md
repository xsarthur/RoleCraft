# Rolecraft 1.0 项目经理收口记录

- **日期**：2026-10-16（Asia/Shanghai）
- **版本**：`rolecraft-1.0` 本地候选
- **协调状态**：`implementation_delivered; qa_insufficient; overall_not_met`
- **依据**：`product-v1.0-scope.md`、`design-v1.0-learning-workbench.md`、`curriculum-v1.0-pilot.md`、`backend-v1.0-release.md`、`app-v1.0-qa.md/.json`

## 本轮实际交付

产品经理冻结了 1.0 范围合同：单一当前任务入口、职业确认边界、有出处的问教材、题库/复习/自评可发现性、练习—作品—反馈试点、统一发布身份和本地候选边界。设计师交付了五入口信息架构、当前任务卡、问教材七态、证据状态槽、阅读先修和 320/375/390/768/1280px 响应式/无障碍验收；视觉示意为 `design-v1.0-learning-workbench.svg`，只表示设计稿，不是运行截图。

课程架构师选定 v12 `p01-mvp` 作为 `V1-PILOT-P01-MVP-001`，绑定正文 SHA `deb98fa616e7d670108c86eca3b2a137e1183cf69bc3a5f5799a0b08f19b57d9`，交付问题、输入、产出、七项完成条件、七条失败路径、证据索引、六维诊断量规和五类记录/五种作品状态。当前仍是构造练习规格，未取得学习者执行或真人评审。

客户端实现岗位修改了 `dist/index.html`、`dist/app.js`、`dist/learning-workbench.js/.css`、`dist/learning-experience-v13.js/.css`：

- 主导航直接提供题库、复习和自评检验，真实页面不再渲染“后续开放”；首页/工作区显示唯一当前任务 CTA，并提供题库、复习、自评的次级入口。
- 当前任务卡显示起点、阅读事实、练习输入/产物/验证提示；项目工坊并列显示本人自述、运行证据、独立评价，避免百分比进度造成能力结论。
- 问教材继续消费既有检索合同，保留当前章节主动上下文、原文/来源/版本、规则降级和不可用状态；协议字段 `workbenchVersion=local-workbench-0.11`、`agent-system-v0.12` 未改。
- 客户端公开身份与导出身份统一为 `rolecraft-1.0`；历史 v10/v12、来源 hash、浏览器记录和既有题集身份保留。

后端数据工程师新增 `RELEASE_VERSION='rolecraft-1.0'`，JSON 响应、教材图/引用和静态资源响应统一提供 `releaseVersion`/`X-Rolecraft-Release-Version`；旧 `PRODUCT_VERSION='local-mvp-0.4'` 作为兼容字段保留，未改数据库、教材、检索算法或用户服务进程。

## 独立 QA 结果

测试工程师冻结当前源并执行了四个 `node --check` 与短静态断言，均通过；没有启动本轮服务、浏览器、正式数据库或付费/外部模型。此前同岗位隔离 TCP 收据覆盖 `127.0.0.1:47231` 的 health、catalog 和静态首页/资源，均带 `rolecraft-1.0` 发布字段与响应头；Node26 运行被版本守卫拒绝，浏览器验收未执行。

当前 QA 结论为 `insufficient`：V1-01～V1-08 均保留不足，V1-09 仅在静态/运输范围 `pass`。因此本轮不能把客户端代码、源码分支、旧 TCP 收据或设计稿写成 1.0 通过。待复验项包括当前源真实 HTTP 的职业/学习查询反例、题库点击/刷新/后退、练习提交/恢复、教材索引与题库链路、键盘/读屏/灰度/200% 缩放和 320/375/390/768/1280px 实际布局。

## 整体达标判断与责任

本轮“实现已交付”，但 `Rolecraft 1.0` 当前只能称**本地候选、限定范围可用，独立 QA 证据不足**；完整产品仍为 `not_met`。原八门槛不因本轮改变：真实生成与可靠生产交付仍 `fail`；用户价值、教学质量、比较优势、学员创造和运营经济仍 `insufficient`；改进轨迹只能按本轮实际证据重新复验。

责任与下一步如下：

| 缺口 | 责任岗位 | 复验条件 | 状态 |
|---|---|---|---|
| 当前源职业/学习检索、无匹配、澄清、版本失配 HTTP | 内容检索工程师 + 后端数据工程师 + QA | 临时账户/临时端口保存请求响应、来源 hash 和 releaseVersion | open |
| 题库/复习/自评主路径和刷新/后退 | 软件工程师 + QA | 当前源桌面/窄屏点击记录与截图 | open |
| `p01-mvp` 提交、恢复、反馈状态回链 | 软件工程师 + 课程架构师 + QA | 隔离 fixture 作品包、版本/证据 hash、失败路径和复验记录 | open |
| 先修、问教材抽屉、焦点、读屏、灰度和 200% 缩放 | 设计师 + 软件工程师 + QA | 320/375/390/768/1280px 浏览器矩阵和键盘/读屏收据 | open |
| 当前教材索引、题库、构建清单与 1.0 版本链 | 内容检索工程师 + 软件工程师 + QA | 1.0 发布清单、当前索引/题库 hash 与页面/API一致 | open |

不得用用户自述、设计示意、作者/工程自检、题库数量或静态通过数推导职业胜任、就业、真人专家认可、真实学习效果、行业先进性或生产可靠性。新证据必须针对当前版本重新独立验收；返修不得覆盖本轮 QA、不足项或历史来源。

## 全员同步后的第二批开发（2026-10-16）

产品、设计、课程三岗已将1.0合同、四态任务卡、问教材状态、P01字段和验收边界写入三份 `employee-sync-v1.0-*` 简报；项目经理另写全员同步矩阵，覆盖产品、课程、设计、教材、审校、客户端、后端、检索、测试、AI生成、用户研究、竞品、实训和运营岗位。

客户端本批增加四态任务恢复和 P01 本地版本化作品链；后端增加 P01 不可覆盖修订、字段别名、状态校验、客户端 verdict 拒绝及 learning/query 检索元数据透传；检索岗位核对 c01 正文/索引/向量 hash，补齐 recommend/dialog 的意图、结果类型、来源、版本、hash、理由、不确定性和引擎元数据，区分 `related_uncovered`、`no_match`、`clarification` 与 `unavailable`。工程自检、Node 语法和离线检索自检已通过。

当前独立复验仍未重新关闭 V1-01～V1-09：上一份 QA 的 V1-01～V1-08 仍是 `insufficient`，本批新增产物的真实 TCP、浏览器、键盘/读屏、窄屏、提交恢复和固定反例HTTP证据待测试岗位新报告。当前版本继续标记为 `implementation_delivered; qa_insufficient; overall_not_met`。

## 远程单环境开发策略与当前部署（2026-10-16）

根据用户最新决定，暂时只维护一套远程开发环境，服务器同时承载当前开发版与内测访问；数据库和接口服务的更新在本地完成必要自检后直接部署到该服务器，不再另建 staging/production。目标为 `ubuntu@111.231.8.78:/opt/rolecraft`，Node.js 24.20、PM2、Nginx 反代，应用绑定 `127.0.0.1:4318`，公网入口为 HTTP 80。

本次 `rolecraft-1.0` 已完成直推，部署和回滚证据见 `team/deployment-v1.0-current.md/.json`。部署前停止旧进程并保存 SQLite、环境文件副本和代码回滚包；同步只更新客户端、服务端、检索索引/教材当前源、部署与启动脚本，保留远端 `.runtime`、`.env`、依赖、模型和历史资料。当前公网 health、catalog、recommend、带工作台协议的 learning/query 均为 HTTP 200，检索 12/12 自检通过，生成服务仍标记为未配置且本轮未发生付费模型调用。

后续每次直接部署必须遵循同一顺序：先保存当前数据库和代码回滚点，核对源文件/索引/版本 hash，再同步并重启，最后重新做 health、catalog、recommend、learning/query 及受影响功能验证。单环境意味着开发更新可能影响内测访问，数据库回滚须先备份当前版本；本次部署的 TCP/API 冒烟证据不能替代测试工程师的独立浏览器、无障碍、真实用户、真人专家或完整产品达标判断，整体状态仍为 `implementation_delivered; qa_insufficient; overall_not_met`。

## UI/UX、产品最终验收与跨岗位推进（2026-10-16）

本轮已由设计师、产品经理和测试工程师分别完成远程单环境验收，报告保留独立身份：

- 设计验收：`team/design-v1.0-uiux-acceptance.md/.json`。1280px 桌面主任务、阅读、问教材有依据结果/无匹配恢复、390px 导航和焦点恢复已实际观察；320px 顶栏的职业选择与登录入口被裁切，题库显示“资料暂不可用”，自评当前为 0 题；完整键盘、读屏、200%缩放、灰度和软键盘仍未验证，结论 `insufficient`。
- 产品最终验收：`team/product-v1.0-final-acceptance.md/.json`。学习工作台、教材检索与出处版本、无匹配反馈、React 澄清、P01 状态表达在限定范围可用；题库页面实际不可用，四态恢复、浏览器 P01 提交/恢复、登录后职业确认写入、响应式与无障碍证据未闭合，结论 `overall_not_met`，限定范围 `met_within_scope_for_learning_workbench_and_retrieval; qa_followup_required`。
- 测试独立验收：`team/qa-v1.0-uiux-product-final.md/.json`。远程 health、目录、章节、推荐、学习查询、澄清/无匹配/错误和未登录权限边界通过；由于测试通道未能独立取得完整浏览器截图/AX树，导航点击、任务恢复、题库/复习/自评、P01账户链及全量可访问性结论保持 `insufficient`，不能把接口 200 代替现场交互通过。

项目经理已将缺口按责任岗位同步，下一批不得覆盖本轮失败记录：

| 门槛/缺口 | 主责岗位 | 协同岗位 | 交付后复验 |
|---|---|---|---|
| `V1-04` 题库与自评数据可用 | 产品经理、课程架构师、教材研发员、后端数据工程师 | 软件工程师、QA | 冻结题库版本/来源 hash，桌面与窄屏一次点击、刷新、后退并重新独立验收 |
| `DV1-RWD-02` 320px 顶栏裁切 | 软件工程师 | 设计师、产品经理、QA | 320/375/390px 截图、职业/账户入口可见可聚焦，无横向裁切 |
| `V1-01/V1-05` 四态任务、P01提交/修订/恢复 | 软件工程师、后端数据工程师 | 课程架构师、QA | 隔离账户或不写库夹具验证未开始/进行中/中断/已浏览，提交链与刷新恢复 |
| `V1-02/V1-08` 确认登录写入、来源失配/不可用/迟到响应 | 后端数据工程师、内容检索工程师 | 产品经理、软件工程师、QA | 固定请求响应与浏览器状态，确认版本/hash/幂等及错误恢复 |
| `V1-07` 可访问性和极端环境 | 测试工程师 | 设计师、软件工程师 | Tab/Shift+Tab、焦点环、读屏、200%缩放、灰度/对比度、软键盘和五视口收据 |

项目推进状态更新为 `implementation_delivered; product_scope_met_with_limitations; uiux_insufficient; qa_followup_required; overall_not_met`。各岗位沿上述门槛交付后，由原责任岗位整合、测试工程师独立复验，项目经理只维护依赖、版本、失败记录、复验状态和最终整体判断。用户价值仍按“丰富行业知识、帮助面试准备、提高应对市场面试的从容度”表达，不延伸为就业或职业认证承诺。

## P0 修复、远程部署与重新验收（2026-10-16）

后端调查确认题库空态根因是客户端派生包绑定漂移，而不是题库接口或数据库缺失：`learning-v13-data.js` 的旧 corpus/source hash 触发了严格校验，客户端因此安全地显示不可用。课程架构师完成了题库接入交接，保留固定 100 题、市场 14 题和原型 10 题的既有身份，不新增伪题；软件工程师将 114 题、240 个知识点和 327 条证据重新绑定到当前 v12 语料，并修复 320px 顶栏布局。具体交接见 `team/backend-v1.0-question-bank-investigation.md/.json`、`team/curriculum-v1.0-question-bank-handoff.md/.json`、`team/frontend-v1.0-p0-fixes.md/.json`。

P0 只更新了远程客户端 CSS 和题库派生数据，部署前保存了 SQLite 与静态资源回滚包，部署记录见 `team/deployment-v1.0-p0-fix.md/.json`。远程 Node VM 已只读验证 `questions=114`、`knowledgePoints=240`，health 与静态资源 HTTP 200，服务端、教材、数据库和生成配置未改动。

新版本三岗复验结果如下：

- 产品经理报告 `team/product-v1.0-p0-reacceptance.md/.json`：`V1-04` 已变为 `met_within_scope_static_data_and_route`，题库来源、版本与 hash 可核对；学习工作台、检索、无匹配、React 澄清和 P01 数据契约在限定范围可用；完整产品仍 `overall_not_met`。
- 设计师报告 `team/design-v1.0-p0-reacceptance.md/.json`：远程资源和题库结构通过 HTTP/静态核对，但子代理无法取得主会话浏览器标签，未把 320/375/390/1280 视觉、题库点击、问教材、移动菜单和焦点恢复写成通过，结论 `insufficient`。
- 测试报告 `team/qa-v1.0-p0-reacceptance.md/.json`：health、版本、目录、章节/出处、职业推荐与澄清、学习查询、权限边界、隔离账户 P01 首提/409 重复保护/修订链和客户端评审结论禁止均有独立 HTTP 证据；结论为 `met_within_scope_for_remote_http_and_p01_data_contract; browser_ui_and_accessibility_not_verified; overall_not_met`。

项目经理将当前状态更新为 `product_scope_met_with_limitations; browser_uiux_unverified; overall_not_met`。下一步只剩原门槛复验与剩余缺口：测试岗位需取得 320/375/390/768/1280 截图和 AX/键盘/读屏/200%证据，逐一操作题库、复习、自评、四态任务和 P01 浏览器提交/恢复；后端数据工程师需按单环境策略清理或标记 QA 隔离账户 fixture。没有这些独立现场证据，不能宣称 UI/UX 验收最终成功或完整 1.0 达标。

QA 隔离账户清理已完成，记录见 `team/backend-v1.0-qa-fixture-cleanup.md/.json`：只删除本轮拥有 `qa-p0-v1/v2` 的 `example.invalid` 账户及其关联会话、职业、偏好和提交，保留旧测试账户；删除前已备份 SQLite，事务后残留计数为 0，SQLite 完整性检查通过，公网 health 仍为 200、PM2 在线。

## 请求等待交互修复与远程同步（2026-10-16）

用户反馈请求等待时没有加载交互。项目经理协调设计、客户端和测试后确认：工作区此前已有 pending 状态逻辑，但远程服务器仍是旧 `learning-workbench.js/.css`，只显示静态省略号，发送按钮未禁用，且 file:// 静态入口会立即进入不可用分支，导致等待态来不及绘制。

软件工程师已修复并固定客户端版本：等待卡显示 spinner 和不可定量等待轨道，结果区/表单提供 `aria-busy`、`aria-live`、`aria-atomic`，发送按钮显示“正在查询…”并禁用，重复提交被拦截，焦点移到输入框并在完成/失败后恢复，120 秒超时和失败状态提供重试；不使用倒计时或伪造模型进度。修复报告见 `team/frontend-v1.0-loading-fix.md/.json`。

部署工程师已备份数据库和旧静态文件，只同步 `learning-workbench.js/.css`，PM2 重启在线；公网资源 hash 已与本地最终版本一致：JS `9aebdadaab45e47f6f6dcd4d8fa2168f167bdb802ed22e022b087abd039a74d3`，CSS `1a53e9fc115513b04404fa9656b626c9945efc483e36f5da30beb36e65b63c52`。部署证据见 `team/deployment-v1.0-loading-fix.md/.json`。

设计复核与首轮 QA 报告保留了旧远程资源的失败证据；修复后浏览器现场等待态、键盘/读屏和窄屏仍需独立测试岗位重新捕获，不能仅凭资源 hash 宣称 UI/UX 最终通过。

## v13 编辑同步与图片教材差异（2026-10-16）

用户反馈远程教材仍是旧文字版，核对结果确认反馈成立：远程 health/catalog 当前为 `textbook-v12`，而编辑同步后的新版位于 `textbooks/v13/`。v13 包含 30 篇优化正文、62 个视觉资产和约 50 个正文图片引用；当前 v12 正式入口只有既有 v12 内容与少量全局图，因此不能把远程 v12 当成 v13。

v13 项目交接明确要求先做隔离预览，不直接替换 v12：预览须显示 `Agent教材 v13 优化试读`，提供返回 v12、版本/来源 hash、图片 alt、折叠/无脚本降级和独立记录隔离。产品合同已落盘 `team/product-v1.0-v13-preview-scope.md/.json`，当前状态 `blocked_for_trial`。

当前阻塞：设计静态复核发现 `assets/f01-api-boundary-map-v01.svg` XML 根节点未闭合，可能整图不渲染；另有 14 个 SVG 缺少内嵌 title/desc，窄屏、折叠、读屏和真实浏览器渲染尚未验证。v13 不能直接部署或覆盖 v12。
