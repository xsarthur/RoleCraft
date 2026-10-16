# 代码文字对比检查复用

此工具已实际检查本次官方浏览器最终样式快照；它是可复用检查工具及受影响样式必检项，未接入全站CI。读取五类代表元素：代码、pre、语言说明、行内code、正文。按实际祖先背景合成有效背景，用相对亮度计算比例；普通文字最低4.5:1，按未舍入值判断。[W3C SC1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)

从工作区根目录执行当前已冻原例（不要覆盖最终证据）：

```sh
python3 sites/rolecraft/team/app-v14-code-contrast-qa-history/check_contrast.py   sites/rolecraft/team/app-v14-code-contrast-ui-qa-history/candidate-desktop-rendered-snapshot.json   --binding sites/rolecraft/team/app-v14-code-contrast-qa-history/candidate-desktop-rendered-snapshot-binding.json   --root sites/rolecraft   --report /tmp/rolecraft-contrast-recheck.json
```

退出码：0全部样本达标；1存在实际低对比；2快照/源码失配或效果不支持。已实际保存旧3样本失败、新两宽各5样本通过、旧快照对当前CSS拒绝的JSON。复现旧失败时用received-rendered-snapshot.json、received-rendered-snapshot-binding.json及root=qa-history/received-project；旧绑定换成当前root会返回2。

下一次CSS/页面改动：先冻结当前公开CSS、reader/index、内容包及教材源hash，确认HTTP运输字节；在官方CUA正常加载目标页后，以capture_computed.js中的只读函数通过其已文档化evaluate读取新快照。保存原JSON，并用snapshotSha256及files路径→SHA256建立新绑定，再执行上面命令。改版不能对旧色值重新计算就声称当前通过；禁止只更新旧绑定hash。新增快照必须与该次实际加载来源对应。

需opacity=1、无图像背景/filter/blend/textShadow；不支持的效果拒绝，需要单独渲染分析。新主题存在时检查其实际最终cascade；当前只测暖浅色主题，不假设暗色模式。后续同类样式改动固定检查典型围栏/行内code/语言说明及窄屏，截图只用于原例确认，不要求全站截图矩阵。字体/选区/焦点/真实手机行为及整站可访问性不由本工具认证。
