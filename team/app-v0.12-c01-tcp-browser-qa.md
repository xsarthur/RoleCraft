# Agent 双输入 TCP 与浏览器补测记录

- **版本**：`app-v0.12-c01-tcp-browser-qa`
- **日期**：2026-10-15（Asia/Shanghai）
- **责任岗位**：测试工程师（独立执行）；项目经理仅归档与协调
- **旧限定证据**：`app-v0.12-c01-card-fields-qa.md/.json` 的 23/23、`met_with_limitations` 保持不变
- **本轮结论**：`met_with_limitations`

## 真实 TCP

测试岗位使用 Node `v24.16.0` 在隔离临时 SQLite 上启动真实服务并取得 socket 证据。已验证静态首页、注册、职业推荐、React 澄清、职业确认、确认幂等、ReAct 学习查询、当前章节上下文和版本快照。外部供应商调用为 0，正式数据库未触碰。

动态职业无专属检索适配器的 `unavailable` 分支另以隔离夹具核对；不回退 Agent 教材。

## 浏览器证据

测试岗位通过 Codex IAB 打开 `http://127.0.0.1:4391/#home`，可访问 `职造 · Agent 学习工作台`。已观察并操作：

- 职业自然语言推荐、`React` 两项澄清、候选确认前待确认界面；未登录确认转注册，隔离账户登录后确认成功并显示当前职业。
- “问教材”抽屉打开/收起，收起后焦点回到 launcher；输入保留。
- `Shift+Enter` 保留多行输入，`Enter` 提交并经历加载到回答；来源小节链接可见。
- 题外天气输入显示无匹配状态，不生成教材外答案。
- 在约 390px 与 320px 窄屏视口下，抽屉、输入、结果卡和确认/来源结构仍可操作，未观察到横向溢出。

浏览器真实页面、DOM/AX 状态和操作结果已由测试岗位执行记录；本轮未取得可复用的独立截图文件路径。

## 尚未闭合

- 中文输入法组合态（composition）期间 Enter 不提交尚未形成独立证据；已验证普通 Enter 与 Shift+Enter。
- VoiceOver/屏幕阅读器顺序与播报尚未运行。
- 可控延迟服务或网络拦截未建立，迟到响应隔离尚未形成浏览器证据。
- 真实 TCP 已通过的业务子集不能替代浏览器完整交互验收；本轮不改变完整产品 `not_met`。

本轮共 24 项：21 项通过、3 项证据不足、0 项失败，结论 `met_with_limitations`。三项不足为原生中文 IME composition、迟到响应隔离和屏幕阅读器顺序。

## 版本绑定

| 文件 | SHA-256 |
|---|---|
| `dist/auth-career-v15.js` | `48f6b83354c89546cd884ab505e73653814f03cf323c20aad5d7561869be078c` |
| `dist/learning-workbench.js` | `00164fb51872de3e91f61eca0730278495a29b22440e211690ba1826cbcd613d` |
| `server/index.mjs` | `53d0eabed6dc490f772ba94df3d6a6cba8056eaa55388bb79463feb3ca4a7c3e` |
| `server/retrieval/content-v12-index.json` | `c005e8fd4071d14a8acc657a762e53359ea79cd785879bdbaceb52c4768b8142` |

旧的 23/23 限定 QA、卡片工程交接中的旧客户端 hash、中间字节和历史失败报告均保留，未被本记录覆盖。

