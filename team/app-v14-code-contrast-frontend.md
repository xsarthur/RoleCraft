# v14 教材代码区低对比：客户端窄修

软件工程师；2026-10-12（Asia/Shanghai）。依据用户截图问题、`app-v14-code-contrast-design.md` 与 QA 收到基线放行，只改当前暖色主题的 `dist/learning-experience-v13.css`。不改教材、代码文本/运行逻辑、检索、账户/数据库、导航、既有专业报告或用户记录。

## 收到根因及改动

index CSS 载入顺序为 styles → learning-workbench → learning-experience-v13。旧 workbench 深色主题给 `.lw-code` 深绿底、pre 浅绿字 `#e7eee7`、语言说明 `#bbccbd` 和深绿分隔线；experience 只覆容器背景 `#f3f0ea`，未覆盖文字与分隔。pre 内 code 又 `color:inherit`，因此保留浅字。全局深色 `--ink` 无法越过 pre 的显式浅字声明。这是实际收到规则链的根因；实际浏览器 computed/style/图像与QA漏检原因由独立测试员登记。

按设计追加成组局部规则：围栏米底 `#f3f0ea`、pre 深字 `#3d3929`；内 code 透明底/继承深字，避免行内胶囊覆盖。语言标签 `#6b6356`，既有分隔线改 `#dcd7cc`，容器用内侧1px同色阴影表示边界，不增加几何边框。正文行内 code 显式深字 `#3d3929` 和浅底 `#ece7dd`；局部代码选区成对白字/棕底；可聚焦pre使用3px深棕内侧轮廓，避免 overflow 裁切外框。没有语法高亮token，当前渲染器仅输出转义纯文本code；未新增高亮或操作按钮。

未改变字号、间距、等宽字体、代码内容、水平滚动、手机布局或运行行为。只限现教材 `.lw-prose` / `.lw-code` 相关颜色与内侧视觉边界，旧工具深色 pre 主题不变。首收到三份 CSS 保存于 `app-v14-code-contrast-frontend-history/received/`；新CSS保留收到文件完整前缀，仅追加7条规则。源码自查核载入顺序、选择器优先级和pre内code透明继承，不编写实施镜像测试、不重跑旧11/15 VM、292HTTP或教材代码行为。

## 当前版本与运输范围

当前 CSS SHA256：`227e24bfc9c12a6c8254c4fbebfba65f3ddcb4d183a5405e803d5042c9ebe592`。收到 SHA256：`1f20aafb25a30842e660a18b2d51445efc6ab3527d359b95703131332fcb9aaf`。客户端声明仍 `local-workbench-0.14-dialog-detail`；本次视觉修补由新的 code-contrast binding 标识，不覆盖dialog/frontend绑定4及旧QA结论。

尝试读取公开 `http://127.0.0.1:4318/learning-experience-v13.css`：初次curl受环境代理7897影响未到应用；显式仅本机noproxy后4318仍无法连接，随后lsof该端口未发现监听。未取得HTTP资源，所以当前不能声称正式4318源码/运输一致；不可达收据单列保存。没有启动/重启/结束任何服务。QA在自有隔离服务独立核当前HTTP字节、computed前景背景/自动对比及用户原图真实渲染；正式服务恢复后可补公开静态资源收据。

## 交接和限制

独立QA复验用户原例 `v12/01-foundation/s-cdf0ad611ebb`、语言说明、行内code、选中/聚焦以及375px直接影响，核正文/下载原文本保持。本岗未运行实际浏览器或算色值比率来代验；设计给出的对比数值不等于实际加载/像素结果。新绑定和源码自查完成只是客户端交接；颜色可读性须看独立证据，用户认可仍需用户反馈。完整培养/行业先进目标继续not_met。本次无实际用户存储/DB访问、付费、外部联系、上传或发布。
