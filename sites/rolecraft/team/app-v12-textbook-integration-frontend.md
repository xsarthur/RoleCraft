# v12 教材接入 · 客户端交接

责任岗位：客户端软件工程师。日期：2026-10-12（Asia/Shanghai）。客户端版本：`local-workbench-0.12-textbook`。状态：首候选已完成开发自查，待独立 QA；不授真实 UI 或完整产品通过。

用户授权“先使用新版本教材”。本轮仅消费检索岗派生的已冻结 v12 教材，未改作者正文、课程先修、产品标准、检索核心/向量/服务、账户或数据库。实际改动为 `dist/index.html`、`dist/app.js`、`dist/learning-workbench.js`；两个 CSS 文件保持收到状态，保留既有布局和控件。未启动或停止正式 4318 服务，正式服务交由检索岗更新。

## 当前阅读与同版检索

默认加载 `globalThis.RolecraftContentV12`，包身份要求 `textbook-v12`、30 唯一单元、连续正式 order。首页路线、目录、正文、先修、相邻导航、下载和来源说明使用同一数据包；n03 为第 18 篇，p02 为第 30 篇。路线沿原六阶段表达新增单元，顺序与课程 `readingOrder` 一致。工程全景换为 `agent-engineering-landscape-v12.png`，正文运行图和新全景均按源定义消费；放大交互保留原设计。

HTTP 检索继续 POST `/api/content/recommend`，提交 `corpusVersion: textbook-v12`。每项肯定推荐核当前 corpus 版本/hash、源 path/hash、unit/section 标题、实际原文摘录与定位链接；失配显示明确不可用，不冒充无匹配。保留单需求最多 3 / 总最多 6。静态 `file:` 入口使用检索岗的概念降级，界面按实际响应说明模式，不伪称 HTTP 模型调用。

HTTP 图/参考资源使用派生合同中的版本化 `href`；静态文件入口使用 `staticHref`。内部链接按当前篇的真实 sourcePath 解析，再查同版正文/公开资源，先匹配完整资源 path，避免 `examples/README.md` 被误送到教材目录。公开 `.py` 链接仅打开源码 `text/plain` / `.py.txt`，不执行。正文仍使用原 escaped Markdown 渲染器，表格、围栏和原引用保持；源讲解未改写。

## 历史兼容与记录保留

新版学习记录独立键为 `rolecraft-learning-v12`。新版笔记为 `{text, corpusVersion, sourceSha256, updatedAt}`；足迹/收藏携带 `corpusVersion/corpusHash/sourceSha256`，只有实际匹配当前来源的记录才显示为当前阅读位置。旧同 ID 的笔记、收藏、足迹不借此升级为新版记录。新项目档案仍为本人自述、未独立评价。

旧 `rolecraft-learning-v11` 只读，学习记录页显示历史 v10 笔记/收藏/足迹/项目自述；无逐条版本字段按旧存储来源注明。整体 JSON 导出分别保存 current/historical，包含旧 storageValue 原始字符串，不转义改写原记录内容；旧记录损坏时保留原始字符串供导出。更早的 `rolecraft-v1` 仍由原更多工具查看/导出，客户端新模块不写旧键。

明确历史阅读路由：`#learn/agent/<unitId>/<sectionId>?version=textbook-v10`，旧记录链接使用该路由。历史页消费不变 `RolecraftContentV10`，显示历史版身份，历史跨章/图/先修继续带旧来源；历史页只读笔记且不新增新版足迹或收藏。当前链接无版本或显式 `version=textbook-v12` 时显示 v12；沿检索岗标题与同名 occurrence 稳定 ID，旧 e01/开篇同 ID 能定位当前同单元小节，显示当前 v12 身份，不声称 hash 或阅读证据相同。缺失小节明确提示并提供本章/可核历史入口，不静默跳到别章。未知版本显示资源不可用。

查询独立键 `rolecraft-content-query-v12`。旧 `rolecraft-content-query-v11` 不写、不导入其结果，界面提示已切换并要求重查。即便旧结果被置入新版缓存，响应核对也拒绝为不可用；旧结果不能显示“推荐阅读”。

## 开发自查及限制

本岗在 Node 24.16.0 执行 `team/app-v12-textbook-integration-frontend-check.mjs`，生成新 `*-frontend-check.json`。六组自查使用隔离 VM 和人工存储夹具：30 篇/正式顺序/先修及第 1/18/30 篇；全部当前正文公开链接、所有小节 ID 与 n03 表格/示例链接；旧键保持、历史/当前深链、缺失位置、新 n03 笔记/收藏/足迹分别保存；导出含不变旧原始值；当前来源接受与错版本/旧 hash/旧源拒绝；旧缓存不导入及当前键注入旧响应的失败呈现。两个 JS 的 Node 语法检查通过。开发自查基于实际派生 v12 corpus，未调用浏览器、HTTP 或模型，未读取真实浏览器用户记录，未执行任何教材示例；不是独立 QA。

当前消耗 corpusHash：`1a385b179c0cb8a5b838d17b9d2606a0c1a7e27636d97db45dba5e2a52b2840e`。教材合订身份仍为 `25ce2aaa1be0ba0f2814dd1247ac6299d106c3d2e48f43867c49055490c2801e`，其独立教材审校/运行范围不转写为应用验收。独立服务与模型复验由 QA 执行；真实图可读/放大、卡片点击、刷新/后退、旧记录操作与真正下载尚未由本岗验证。QA 当前官方浏览器通道不可用时，这些必要项保持证据不足，不能由本 VM 结果替代。

本轮只交付本地客户端候选。完整职业培养和行业先进目标仍 `not_met`：真实学习者作品、真人专家、真实个性化生成、行业比较、生产与经济性须由原责任岗位取得实际证据。客户端教材切换不会关闭这些缺口；独立应用验收仍待当前版本证据。
