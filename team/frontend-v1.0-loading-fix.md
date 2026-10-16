# 前端 1.0 请求等待加载交互修复

- **任务**：补齐“问教材”请求等待时的视觉、交互和可访问反馈。
- **范围**：仅客户端 `dist/learning-workbench.js` 与 `dist/learning-workbench.css`；未改后端、数据库、教材、远程服务器或历史报告。
- **触发原因**：既有版本在 `pending` 状态虽有简单状态文案，但发送按钮仍显示“发送”，没有明确的动态等待标识，也没有在事件层阻止键盘/程序化重复提交，用户无法确认请求是否已开始。

## 实现

1. 请求启动后立即进入 `pending`：结果区显示带旋转标记的“正在查找教材依据”状态卡，并显示不可定量的 indeterminate 轨道；没有倒计时、百分比或虚构模型阶段。
2. 表单和结果区同步标记 `aria-busy="true"`；状态卡使用 `role="status"`、`aria-live="polite"`、`aria-atomic="true"`，底部反馈使用同样的 live status。
3. 发送控件变为“正在查询…”，带 spinner、`disabled`、`aria-disabled="true"` 和 `aria-busy="true"`；Enter 和 form submit 在等待期间直接拦截，避免重复提交。
4. 等待提示明确说明正在向当前教材检索服务查询、完成后显示原文和出处，并告知等待期间不会重复提交；输入内容继续保留。
5. 重新渲染时保留输入框选区；若鼠标点击发送按钮触发等待，则焦点移到输入框，完成或失败后恢复到可用的发送按钮，避免键盘焦点丢失。
6. 成功、无匹配、澄清、失败和 120 秒 AbortController 超时都通过现有 `finally` 将 `pending` 清除并重新渲染，发送控件恢复；失败状态仍显示既有“重试本题”入口。
7. `prefers-reduced-motion: reduce` 下关闭 spinner/轨道动画，并将轨道显示为完整静态条，保留文字状态。

## 状态机

```text
idle/no response
  └─ submit valid query → pending
       ├─ response answered/no_match/needs_clarification → settled + corresponding result card
       ├─ HTTP/error/timeout/invalid source → unavailable + retry card
       └─ clear topic/abort → idle (old response is discarded)
```

任何等待期间的重复 form submit 或 Enter 都不会创建第二个请求；既有 requestId/AbortController 仍负责迟到响应隔离。

## 变更文件与版本证据

| 文件 | SHA-256 | 变更 |
|---|---|---|
| `dist/learning-workbench.js` | `9aebdadaab45e47f6f6dcd4d8fa2168f167bdb802ed22e022b087abd039a74d3` | pending 状态卡、动态发送按钮、ARIA、重复提交拦截 |
| `dist/learning-workbench.css` | `1a53e9fc115513b04404fa9656b626c9945efc483e36f5da30beb36e65b63c52` | spinner、indeterminate 轨道、按钮等待样式、减弱动画规则 |

## 本地验证

- `node --check dist/learning-workbench.js`：通过。
- `node --check dist/app.js`：通过（受影响入口未破坏）。
- `git diff --check`：通过。
- 临时 Node VM 夹具 `rolecraft-loading-check.mjs`：11 项通过，覆盖请求启动后的状态卡、spinner、`aria-busy`、按钮禁用、重复提交拦截、失败后恢复和失败卡显示。
- 运行范围：隔离 Node VM；未调用真实 HTTP、BGE、供应商模型、数据库或用户数据。

## 尚未验证

当前报告不是独立 UI/UX 验收。尚未在远程服务器或真实浏览器完成截图、键盘焦点、读屏、窄屏、200% 缩放、减弱动画和真实慢请求时序复验；远程部署由项目经理协调并需独立 QA 重新冻结当前文件 hash 后验收。加载态的代码与 VM 证据不能替代这些现场证据。
