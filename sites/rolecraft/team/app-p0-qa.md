# P0 客户端独立 QA（2026-10-15）

审计岗位：测试工程师（独立验证）  
目标版本：`local-workbench-0.15-p0`  
范围：`dist/learning-workbench.js`、`dist/learning-workbench.css`；只读冻结后验证，未修改实现。

## 收到状态冻结

| 文件 | SHA-256 |
|---|---|
| `sites/rolecraft/dist/learning-workbench.js` | `0f55ffd8d227af03c94c3ff0f2950ed8cb466e6d85a8f37b34728f7475d299e5` |
| `sites/rolecraft/dist/learning-workbench.css` | `e158928612de4763a1d87434e770311556c7e043fa1b1ac9d0c501e8bab2a1b5` |

教材索引只读核对：`textbook-v12`、30 篇、hash `1a385b179c0cb8a5b838d17b9d2606a0c1a7e27636d97db45dba5e2a52b2840e`。

## 证据与结论

| 门槛 | 结论 | 证据 |
|---|---|---|
| 首页无记录/进行中/完整浏览使用单一主入口 | `met_within_scope` | 在 Node VM 隔离存储中渲染无记录态，出现一个 `.lw-entry`，文案“尚未开始/开始学习”；写入一条当前版本、hash、sourceSha256 合法足迹后渲染“学习进行中/继续学习”。代码 `homePage()` 通过 `progress.completed/latest` 只生成一个 `entryState`。完整浏览态静态分支为“当前课程已完整浏览/回顾最近学习”。 |
| 问教材胶囊与侧边抽屉 | `met_within_scope` | `assistantHTML()` 默认生成 `#lw-assistant-launcher`，`aria-expanded=false`、`aria-controls=lw-find-panel`；打开后生成 `aside.lw-assistant-drawer`、`role=dialog`，右下固定胶囊及窄屏宽度规则在 CSS P0 段。折叠调用 `collapse()` 保存结果滚动位置、重渲染并将焦点回到 launcher；打开后聚焦 `#lw-query`。 |
| 输入与上下文保留 | `met_within_scope` | 输入事件写入会话缓存 `rolecraft-content-dialog-v14`；当前章节上下文由 `currentContext()` 生成并随 POST 发送；抽屉收起/重开不会清空 `query/response/submission/dialogTopic`，结果区滚动位置保存在 `assistantScroll`。 |
| 加载态 | `met_within_scope` | `pending=true` 时输出 `role=status`、`aria-live=polite`，文案“正在查找教材依据”，明确可收起且结果保留；提交前/请求中状态由 `find()` 设置。 |
| 无结果态 | `met_within_scope` | `unrelated`/`related_uncovered` 输出 `lw-state-empty`，文案“没有找到匹配的教材内容”，提供改问示例和“打开课程目录”；无匹配不会渲染答案或来源卡。 |
| 失败态 | `met_within_scope` | `unavailable` 输出 `role=alert`、文案“检索暂时失败”，提供“重试本题”和课程目录入口；Abort、静态入口、HTTP 非 2xx 均归入可重试失败语义。 |
| 规则降级态 | `met_within_scope`（静态合同核对） | `isRuleFallback()` 对 `concept|rule|static_rules` 标识；无结果和回答前均插入“规则降级”提示，说明未调用外部模型/使用本地词项和规则，并保留版本与原文核对语义。 |
| 键盘/ARIA | `met_within_scope` | 查询 textarea 有 `label for=lw-query`、`aria-describedby`，非法输入加 `aria-invalid=true`；结果区 `aria-busy`；加载 `role=status`，失败 `role=alert`；Escape 收起并回焦胶囊；Enter（非 Shift/IME）提交；结果来源卡 `tabindex=-1`，引用链接带来源 aria-label。 |
| 窄屏响应式 | `met_within_scope` | CSS P0 在 `max-width:600px` 将抽屉设为 `width:calc(100vw - 20px)`、底部安全区、最大高度 `calc(100dvh - 28px)`，输入字号 16px，头部/上下文/结果区缩小内边距；默认胶囊右下定位。仅完成 CSS/静态核对，未完成真实浏览器截图。 |
| retrieval API 合同/版本校验 | `met_within_scope` | 客户端固定 `CURRENT='textbook-v12'`，POST `/api/content/dialog` 携带 `X-Rolecraft-Agent-Version: learning-content-agent-v1` 与 request id；`validateResponse()` 要求 dialog 状态映射、extractive 模式、scope 数组、当前 corpusVersion/hash、来源 path/hash/原文片段/href 全部一致，否则转 unavailable。服务端 `dialog.mjs` 返回 `content-retrieval-0.12-v12`、`textbook-v12` 并含规则/语义模式。 |

## 运行与限制

- `node --check sites/rolecraft/dist/learning-workbench.js`：通过（exit 0）。
- 既有 retrieval `dev-check.mjs`、`dialog-dev-check.mjs`、`dialog-clarification-check.mjs`、`dialog-repair-check.mjs`：对话/澄清/修复记录均报告 `failures:0` 或各条 `pass:true`；其中 `dev-check.mjs` 尝试启动监听时受当前执行环境 `listen EPERM` 阻断，不能把 HTTP 监听成功写成已验证。
- 隔离 Node VM 静态交互核验：无记录态和进行中态均输出单一 `.lw-entry`；助手默认闭合胶囊结构、状态文案/ARIA/版本合同通过静态检查。
- 本轮无法获得真实浏览器/HTTP 证据：`127.0.0.1:4318` 当前无监听，启动本地服务在沙箱中返回 `listen EPERM`；未声称点击、真实焦点顺序、窄屏渲染或实际四态网络切换已通过。

## 独立结论

当前 P0 客户端在静态代码、隔离 VM 和既有 retrieval 自检范围内为 **`met_within_scope`**。真实浏览器交互（胶囊开合、焦点回收、上下文保留、窄屏视觉）及真实 `/api/content/dialog` 请求仍为 **`insufficient`**，不应扩大为完整产品达标。复验条件：在允许监听的本地 Node24 服务上，用桌面与 ≤600px 浏览器逐项操作四种响应状态，记录网络响应、焦点元素、抽屉滚动位置和截图，再更新本报告。
