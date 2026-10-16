# 客户端 P0 实现交接

- 责任岗位：软件工程师（网站客户端实现）
- 日期：2026-10-15（Asia/Shanghai）
- 目标版本：`local-workbench-0.15-p0`（在现有 `learning-workbench.js` 客户端上增量实现）
- 范围：学习首页唯一主入口、内容检索入口与抽屉、四种检索状态的呈现。
- 未修改：教材源、检索服务端、账户/数据库、既有响应校验与来源合同。

## 实现

### “继续学习”唯一主入口

`learning-workbench.js` 新增 `learningProgress()`，只使用当前教材版本且通过 `currentRecord` 核对的阅读足迹计算浏览篇数。首页的 `.lw-entry` 仍保留当前职业与课程链接关系，并按记录呈现三态：

1. 无记录：`尚未开始 / 开始你的第一步 / 开始学习`，目标为当前课程首篇。
2. 有记录但未浏览全部篇章：`学习进行中 / 继续学习 / 继续学习`，目标为最近有效阅读位置。
3. 当前教材所有篇章均有有效浏览记录：`当前课程已完整浏览 / 回顾最近学习 / 回顾学习`，目标为最近有效阅读位置。

卡片同时标出 `已浏览 x/y 篇`，并明确“学习记录仅表示浏览位置，不等于能力认证”。没有新增或迁移记录字段，完整浏览只代表本地浏览状态。

### 右下角入口与侧边抽屉

检索助手收起时只显示右下角 `问教材` 胶囊入口，已有结果会显示 `有结果` 状态；点击后展开固定右侧抽屉。抽屉保留原输入、当前章节/小节上下文、问答主题、结果滚动位置和会话缓存，关闭或按 `Esc` 后返回入口，不清空输入。桌面端抽屉宽度上限 430px，窄屏宽度为视口减 20px，结果区独立滚动，输入区固定在抽屉底部。

### 四种检索状态

- **加载**：`lw-state-loading`，显示正在查找教材依据，说明可收起继续学习且保留当前阅读。
- **无匹配**：`lw-state-empty`，覆盖 `unrelated` 与 `related_uncovered`，给出换问示例和课程目录入口。
- **失败**：`lw-state-error`，保留错误原因、重试按钮和课程目录入口。
- **规则降级**：识别现有 `engineMode` 中的 `concept/rule/static_rules`，以 `lw-fallback-notice` 明确说明使用本地规则，仍以教材版本和原文核对为准；规则模式下的无匹配也同时保留无匹配状态。

现有 `response`、`submission`、`queryHistory`、`dialog`、`engineMode` 和 `currentContext()` 合同未改动；只增加客户端展示分支与样式。

## 本地自检

- `node --check sites/rolecraft/dist/learning-workbench.js`：通过（JavaScript 语法无错误）。
- 静态结构核对：`learningProgress()`、三态 `.lw-entry` 文案、`.lw-assistant-launcher`、`.lw-assistant-drawer`、`lw-state-loading/empty/error`、`lw-fallback-notice` 均存在；CSS 覆盖规则追加在现有文件末尾。
- 尝试启动临时 Python 静态服务进行浏览器烟测时，当前受限环境禁止绑定本地端口（`PermissionError: [Errno 1] Operation not permitted`），因此未将浏览器渲染或软键盘结果写成通过证据。

## 待独立验证

测试岗位需在当前版本对三种首页记录状态、抽屉开启/收起与输入保留、键盘 `Esc`/焦点回收、桌面/390px/320px布局，以及四种检索状态进行独立验收。该交接不声称真实用户理解、读屏效果、语义检索质量或完整产品达标。
