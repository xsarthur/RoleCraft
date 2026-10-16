# v13 教材渲染器交接说明

日期：2026-10-16  
岗位：软件工程师  
范围：本地学习工作台的 Markdown 渲染路径

## 这次改动

`sites/rolecraft/dist/learning-workbench.js` 的 `markdown()` 现在识别以下教材写法：

```html
<details>
<summary>展开示例（25 行；未运行）</summary>
```yaml
...
```
</details>
```

识别成功后，渲染为原生 HTML `details/summary` 折叠代码卡。代码超过 10 行默认收起，10 行及以下默认展开；摘要保留作者提供的用途、行数和验证状态。代码正文仍经过既有 HTML 转义，网页不会执行代码。

普通 fenced code 沿用原有可见代码块；图片链接沿用既有安全解析和静态资源路径；Mermaid fenced code 沿用源码降级显示，不引入运行时 Mermaid 依赖。格式不完整的 `details` 块会回到既有普通 Markdown 文本处理，避免静默丢内容。

`sites/rolecraft/dist/learning-experience-v13.css` 增加折叠代码卡的摘要、展开符号、元信息、边框和窄屏换行样式。控件使用原生 `summary`，继承现有焦点样式和键盘行为。

## 边界与责任交接

- 编辑提供摘要中的用途、代码行数和“已运行/未运行”状态；不由渲染器推断教学结论。
- 产品与设计负责确认默认展开规则、控件文案、颜色和窄屏信息密度。
- 开发负责本地预览渲染和无脚本降级；本次不改语料、账户、数据库或服务接口。
- QA 需要在实际页面复核长代码默认收起、短代码默认展开、键盘/读屏、深链刷新、普通代码、图片和 Mermaid 源码。

## 自检结果

- `node --check sites/rolecraft/dist/learning-workbench.js`：通过。
- 变更文件仅为本地预览渲染器、其 v13 样式和本交接说明。
- 未修改 `learning-v13-data.js`、v12 语料、账户存储、数据库或 API。
- 浏览器实际渲染、窄屏截图和读屏验证尚未在本岗位完成，需由 QA 按跨端合同复验。
