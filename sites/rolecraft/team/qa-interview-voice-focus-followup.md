# 语音练习页标题焦点与语音入口独立 QA

- 日期：2026-10-17（Asia/Shanghai）
- 岗位：测试工程师
- 被测分支：`codex/speech-context-correction`
- 被测入口：`http://127.0.0.1:4318/#interview`
- 范围：用户报告的进入页面绿色焦点框；当前 SpeechRecognition 默认入口、术语/上下文纠错可发现性；不修改应用代码。

## 结论

当前版本为 **`insufficient`**。绿色框是可稳定由源码解释的程序化标题焦点环，属于进入/切换页面时的可见界面异常；当前没有针对该视觉结果的截图与 `activeElement` 回归验收。历史语音 QA 覆盖了部分录音和 SpeechRecognition 状态，但不能代替这次当前版本的视觉验收。

当前版本的 SpeechRecognition 与纠错入口在静态结构上可发现：语音页明示“默认使用浏览器 SpeechRecognition 转写”，录音卡提供默认勾选项；转写页提供“术语与上下文纠错建议”“采纳”“一键采纳全部建议”。真实浏览器点击与中文识别准确率本轮未完成。

## 用户问题复现

1. 打开面试准备页。
2. 进入精选面试题，再打开 Q1 的直接练习，或在面板间切换。
3. 观察页面标题周围出现绿色矩形边框。

源码证据：

- `dist/app.js` 的 `focusTitle()` 对当前 `h1` 设置 `tabindex="-1"` 后调用 `focus({preventScroll:true})`。
- `interviewGo`、`interviewAction('voice')`、录音状态更新等路径在重绘后调用 `focusTitle()`。
- `dist/styles.css` 只对按钮、链接、选择框和输入框声明 `:focus-visible` 样式，没有标题焦点的明确视觉规则或 reset。

因此 h1 得到程序焦点后使用浏览器默认焦点环，截图中绿色框与该行为一致。它不是录音状态、识别文本或页面内容边框。

最小 VM 复现 `focusTitle()` 后输出：

```json
{"tabindex":"-1","focused":true,"focusOptions":{"preventScroll":true}}
```

该 VM 只证明焦点调用链，不替代真实浏览器的 CSS 绘制与屏幕阅读器现场；绿色绘制证据来自用户截图。

## 检查结果

| 检查 | 结果 | 证据/限制 |
|---|---|---|
| 标题焦点调用链 | **FAIL（视觉缺陷）** | 静态确认 h1 被自动 focus；用户截图提供现场证据；当前通道无法取得新的浏览器 AX/截图。 |
| 标题可达性语义 | `pass_with_limitations` | h1 被设置 `tabindex=-1`，可被程序聚焦；未完成真实读屏播报。 |
| 键盘控件焦点样式 | `not_verified` | CSS 声明了按钮、链接、select、input 的 3px `:focus-visible` 环；本轮未取得真实 Tab/Shift+Tab 截图。 |
| SpeechRecognition 入口可发现性 | `pass_static` | 页面文本、默认勾选项、状态/错误提示和浏览器处理未知边界存在。 |
| 纠错入口可发现性 | `pass_static` | `术语与上下文纠错建议`、单条采纳和一键采纳按钮存在；未完成真实中文识别到建议的浏览器现场。 |
| 当前语音静态/VM 回归 | **FAIL（测试合同过期）** | `interview-module-browser-speech-qa-v01-check.mjs`：13 pass / 2 fail；旧断言仍要求 consent prompt 和默认 opt-out，当前代码已改为默认启用。 |
| 当前本地 voice smoke | **FAIL** | `interview-voice-local-client-smoke.mjs` 在第 28 行断言失败；未将失败改写为通过。 |
| JavaScript 语法 | PASS | `node --check sites/rolecraft/dist/app.js` 退出 0。 |
| 差异格式 | PASS | `git diff --check -- dist/app.js dist/styles.css dist/interview-prep-v03.css` 退出 0。 |

## 修复责任与验收条件

责任领域：软件工程师处理焦点实现和样式；设计师确认标题焦点的视觉表达；测试工程师独立复验。

修复后必须同时满足：

1. 进入或切换面板后仍有可读屏可达的页面标题，但默认视觉不显示覆盖整行的绿色框。
2. 真实键盘 Tab/Shift+Tab 到按钮、链接、表单控件时，仍保留清晰的可见焦点环。
3. 录音开始、暂停、停止、转写、纠错采纳和重录的重绘不会重复制造标题焦点环或把焦点丢到不可操作节点。
4. 在桌面和 390px 窄屏分别取得 `document.activeElement`、AX 树和截图证据。
5. 更新 SpeechRecognition 合同：若产品保持默认启用，移除旧的默认 opt-out/consent 断言并补充默认启用、取消勾选、浏览器不支持、权限/网络错误、术语建议与采纳回归；若改回需同意后启用，则同步更新产品文案和实现后再验收。
6. 重新运行 `node --check`、当前 voice smoke、SpeechRecognition 回归脚本，并保留失败项关闭前后的输出。

## 边界

本报告未修改应用代码、录音、账户、数据库或教材；未宣称真实中文识别准确率、浏览器供应商/网络处理、读屏完整兼容或用户理解已通过。历史 QA 的录音生命周期和 VM 证据保留为历史证据，不自动继承为当前版本视觉通过。
