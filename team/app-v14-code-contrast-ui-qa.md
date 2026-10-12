# v14 代码对比：独立官方浏览器专项

测试工程师 UI 专项；2026-10-12（Asia/Shanghai）。只核用户截图对应的基础预备「完整短程序」及同篇受影响字类，不改程序、教材、原 QA 或用户数据。最终对比判定及本轮总验收由主 QA 合并原始快照后独立计算。本专项已完成真实 DOM 收到/候选读取与一次最终桌面渲染观察；不声称全站可访问性认证。

本次自己的官方 CUA `getState` 返回 Codex In-app Browser（id 2），没有已有页，创建后台自有 tab 1，使用主 QA 隔离服务 4497。由首页实际「02 基础预备」入口进入，展开「本篇小节」并点击「完整短程序」，真实路由为 `#learn/agent/01-foundation/s-cdf0ad611ebb`。未使用消息中另一种查询路由，也未切换 Chrome、原生 App 或其他自动化协议。

主 QA 先提供收到旧 CSS 服务，再正常退出并切候选。UI 同 tab 正常 `reload`，实际 CSSOM 确认 experience 后置相关规则从浅字覆为深字；源码字节身份由主 QA HTTP receipt 负责，候选主题 CSS SHA256 为 `227e24bfc9c12a6c8254c4fbebfba65f3ddcb4d183a5405e803d5042c9ebe592`。UI 快照里的该 hash 明确记为主 QA HTTP 交接值，未冒充浏览器可直接读源码原字节 hash。

| 同篇实际样本 | 收到最终字色 | 候选最终字色 | 候选实际有效背景 |
| --- | --- | --- | --- |
| `refund/check_case` pre 内 code | rgb(231,238,231) | rgb(61,57,41) | lw-code rgb(243,240,234) |
| 同块 pre | rgb(231,238,231) | rgb(61,57,41) | lw-code rgb(243,240,234) |
| python 语言标签 | rgb(187,204,189) | rgb(107,99,86) | lw-code rgb(243,240,234) |
| 正文行内 foundation.py | rgb(38,60,49) | rgb(61,57,41) | 自身 rgb(236,231,221) |
| 首普通正文段落 | rgb(38,60,49) | rgb(38,60,49) | body rgb(249,247,243) |

每类从目标到 HTML 逐级实际读取 background/opacity/backgroundImage/filter/mixBlendMode。透明层的祖先背景保留原值；所有所核祖先 opacity=1、backgroundImage=none、filter=none、mixBlendMode=normal。字号、字重、text-shadow 也保留到快照。对比数值不在本专项凭截图抗锯齿取样，由主 QA 工具使用这些最终颜色和实际背景计算。

1280×720 官方截图已由工具实际显示同篇标题、语言标签和退款短程序：文字呈深墨色，米白底上清晰可读。只取得一次最终原例图，图片留在官方工具原生输出；未伪造本地 JPG/PNG 路径或图片 hash。

按冻结必要范围另在同页用官方 viewport 临时设 375×812 批量核相同五类。最终色、祖先背景与透明属性均同桌面；文档 client/scroll 宽均 375，代码容器与 pre 宽 343，pre scrollWidth=638、overflow-x=auto、white-space=pre，横向长代码留在自己的滚动区。未调用水平滚读或其他交互。窄屏变宽重排后标题 y974.3125、pre y1306.296875，正常 reload 后仍在视口外；因此窄屏结论仅是真实 computed/布局读取，不授窄屏截图可读性或深链滚动通过，也不将它扩大为本轮导航修复。正文例没有在本轮执行，阅读配色不需要执行其 Python。

此前漏检有明确发现途径。历史 `app-v14-dialog-qa.md` 实际列了详情布局、先修、深链和来源检查，却未列围栏 code 与语言标签最终前景/背景的可读性检查；代码不运行是行为验证限制，不能代替颜色检查。本次收到 DOM 直接再现浅字加浅底，说明问题能用最终 computed color 与祖先有效背景的自动计算发现。后续应把受改阅读样式的 code/pre/label/inline/body 批量快照及低对比失败记录纳入必检；只搜索各 CSS 色值会遗漏覆盖顺序、inherit 和透明背景。

自查与清理：只写本专项 `app-v14-code-contrast-ui-qa.*` 及 history；两个渲染快照阶段真实发生，祖先数组仅压缩相同属性，不填造不存在的模型/主题/设备结果。已成功调用 viewport reset 与自有 tab close；4497 服务由主 QA 负责，未操作任何服务进程、正式 4318、实际数据库或用户浏览器存储。限于同篇代表字类和两宽，不做全站颜色、选区交互、真实手机系统、旧代码行为或完整培养目标验收。

证据：本专项 JSON 与 history 下 `received-rendered-snapshot.json`、`candidate-desktop-rendered-snapshot.json`、`candidate-narrow-rendered-snapshot.json`、`cleanup.json`。原完整职业培养及行业先进目标的领域缺口仍由主 QA/产品按既有八门槛汇总，不能因代码配色复验关闭。
