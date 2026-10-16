# QA · v1.0 问教材请求等待交互复验（远程单环境）

- **测试角色**：测试工程师
- **测试时间**：2026-10-16（Asia/Shanghai）
- **目标环境**：`http://111.231.8.78/`，远程开发环境唯一实例
- **页面**：`/#learn/agent/e03`
- **发布标识**：响应头 `X-Rolecraft-Release-Version: rolecraft-1.0`
- **范围**：问教材抽屉从提交到返回期间的可见/可访问等待状态、发送控件防重复、旧答案处理、成功/无匹配/错误后的状态恢复。
- **本轮原则**：只读浏览器与 HTTP 检查，不修改客户端、服务、数据库或用户记录。

## 结论

当前远程版本的等待交互**未达到本轮验收要求（fail）**。原因是远程部署的 `learning-workbench.js/.css` 仍是旧等待交互：虽然有 `pending` 分支和 `aria-busy`（仅结果区），但只显示静态省略号与文字，发送按钮仍是普通可提交按钮，缺少请求中的 disabled/`aria-disabled`/`aria-busy`/查询中标签和加载动画。工作区当前客户端已经包含这些改进，但尚未同步到远程服务器，因此用户在远程版本看不到本次要求的加载交互。

本轮成功返回后的恢复路径已观察到；无匹配、错误和请求中的完整浏览器证据未全部取得，不能以静态代码替代实际状态证据。

## 实际观察

1. Chrome 只读打开远程页面 `111.231.8.78/#learn/agent/e03`，AX 树显示“问教材”按钮。打开抽屉后显示输入区和“发送”按钮。
2. 提交实际查询 `ReAct 是什么`，约 2 秒内返回。AX 树显示请求 ID、`教材原文提取 · 离线语义检索`、教材简答、来源链接，底部状态为“本题已完成”。这证明成功态能恢复并显示结果和出处。
3. 由于当前远程接口在本次浏览器环境中返回较快，未能在真实网络延迟期间取得独立 AX 截图/树；因此下述等待缺口同时以远程脚本静态证据和本地工作区对照确认，不把“未捕获到瞬时状态”写成已观察到完全没有 pending。
4. 远程 HTTP `/api/health` 返回 200，`releaseVersion` 为 `rolecraft-1.0`，内容检索可用；本轮没有向生成供应商发起调用。

## 远程版本静态证据（可复现）

远程脚本下载后 SHA256：

- `/tmp/remote-learning-workbench.js`：`2086c9ae26ee158e1bf4c89a296513b24b9173fb65a098bf03f9cd27c065668e`
- `/tmp/remote-learning-workbench.css`：`b35eaef44e73a56e2b1df0985fdfe8c960393ca086ffecaeba96b51bf798336c`

远程 `resultHTML()` 的 pending 分支只生成：

- `role="status" aria-live="polite"`
- 静态 `…`
- “正在查找教材依据”
- “保留当前阅读位置；你可以收起抽屉继续学习，结果返回后会保留在这里。”

远程 `assistantHTML()` 在 pending 时仍生成普通的：

```html
<button class="primary" type="submit">发送</button>
```

仅结果容器带 `aria-busy="true"`；表单没有 `aria-busy`，发送按钮没有 `disabled`、`aria-disabled`、`aria-busy`、查询中标签或 spinner。远程 CSS 也没有 `.lw-query-spinner`、`.lw-query-indeterminate`、`.lw-query-submit-spinner` 和相应动画规则。

请求开始时客户端代码会设置 `response = null; pending = true`，所以旧答案不会继续冒充当前答案；同 query/context 的重复调用在 `find()` 开头被直接返回。但这不能替代按钮禁用：发送按钮仍呈可操作状态，换一个问题可中止前一个请求并开始新请求，用户无法从控件状态得知是否正在等待。

## 工作区对照（尚未部署）

当前工作区 `sites/rolecraft/dist/learning-workbench.js` 已包含预期修复：

- pending 结果有 spinner 和 indeterminate 进度条；
- 文案明确“等待期间不会重复提交”；
- pending 时按钮为 `disabled aria-disabled="true" aria-busy="true"`，标签变为“正在查询…”；
- 表单带 `aria-busy="true"`，反馈文案明确“发送控件已暂时禁用”；
- CSS 包含 spinner、进度条和 reduced-motion 处理。

工作区脚本 SHA256：`8f3c434d9c6ab0daf02d2de69660922d1f04422dd5917528f8cc6bce0c34ceb9`；工作区 CSS SHA256：`1a53e9fc115513b04404fa9656b626c9945efc483e36f5da30beb36e65b63c52`。两组 hash 与远程不同，说明远程没有包含这次加载交互修改。

## 验收项

| ID | 验收项 | 结果 | 证据/限制 |
|---|---|---|---|
| L-01 | 提交到返回期间有明显加载提示 | **fail（远程版本）** | 远程只有静态省略号和普通文字，没有动画/进度；未取得延迟期间截图 |
| L-02 | 加载状态可被读屏识别 | **insufficient** | 结果区有 `role=status aria-live`，但表单没有 `aria-busy`，发送控件未表达 disabled/loading；需部署修复后复验 AX |
| L-03 | 发送按钮防重复 | **fail（远程版本）** | 远程按钮无 `disabled`；同 query 由代码 guard 拦截只是实现细节，不足以作为控件反馈 |
| L-04 | 等待期间旧答案不冒充新答案 | **pass（静态）** | `find()` 在新请求开始时清空 `response`，pending 分支优先渲染；未在慢请求中取得截图 |
| L-05 | 成功返回后恢复 | **pass（实际浏览器）** | `ReAct 是什么` 返回简答、出处、请求 ID，AX 状态“本题已完成” |
| L-06 | no_match 后恢复 | **insufficient** | 本轮未取得远程 no_match 的完整 AX 证据；代码有 no_match 分支，需部署后复验 |
| L-07 | error/timeout 后恢复与重试 | **insufficient** | 本轮未制造隔离超时；代码有 unavailable/重试分支，需部署后复验 |
| L-08 | 关闭抽屉期间状态可见、返回后保留 | **insufficient** | 代码有 pending launcher 状态，但远程实际延迟期间未捕获；需部署修复后复验 |

## 责任与复验条件

- **责任人**：软件工程师（客户端）同步工作区加载交互到远程唯一开发环境；项目经理协调部署与版本核对。
- **复验条件**：远程 `learning-workbench.js/.css` hash 与本轮工作区交付一致；浏览器在请求进行中能看到 spinner/进度条、按钮“正在查询…”且 disabled；AX 树包含表单/结果 `aria-busy` 与状态文案；成功、no_match、error/timeout 各至少一条实际浏览器证据；重复点击不新增请求或不覆盖当前请求。
- **独立性**：本报告只记录 QA 发现和证据，不修改应用代码；修复后应新增复验报告或追加独立复验段，不覆盖本报告的失败记录。

## 部署后独立复验（追加，保留上面的失败记录）

- **复验时间**：2026-10-16（Asia/Shanghai）
- **远程资源 hash**：`learning-workbench.js` = `9aebdadaab45e47f6f6dcd4d8fa2168f167bdb802ed22e022b087abd039a74d3`；`learning-workbench.css` = `1a53e9fc115513b04404fa9656b626c9945efc483e36f5da30beb36e65b63c52`。
- **关键标记**：远程脚本已出现 `lw-query-spinner`、`lw-query-indeterminate`、`等待期间不会重复提交`、`发送控件已暂时禁用`，以及 pending 时 `disabled aria-disabled="true" aria-busy="true"` 的 `正在查询…` 按钮；远程 CSS 已包含 spinner、不可定量进度轨道和 reduced-motion 规则。
- **浏览器成功态**：刷新远程页面后，实际提交“解释 Agent 的工具调用失败如何恢复”和“如何验证一次 Agent 改动是否真的变好了？”均返回教材简答、教材章节、原文来源和版本身份，AX 结束状态显示“本题已完成”。
- **等待态限制**：本次接口仍在约 2—4 秒内返回；虽捕获到请求提交后的视觉帧，未取得包含 `正在查找教材依据`、`正在查询…` 和 disabled 属性的独立 AX 快照，因此 pending 的浏览器视觉/读屏证据仍标 `not_verified`，不把静态源码当作实际屏幕证据。
- **复验结论**：部署缺口已关闭（资源和关键交互标记通过）；L-01/L-02/L-03 的远程实现静态证据通过，L-04/L-05 仍分别为静态通过/浏览器通过；L-06 no_match、L-07 error/timeout 和 L-08 收起期间 pending 尚未取得完整浏览器证据。问教材加载专项整体为 `met_with_limitations`，不能推导完整 1.0 产品通过。
