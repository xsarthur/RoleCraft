# 客户端 1.0 P0 修复交接

- 岗位：软件工程师（客户端）
- 任务：修复 320px 顶栏入口裁切，并定位/修复题库前端数据加载路径
- 依据：`team/qa-v1.0-uiux-product-final.md/.json`、`team/employee-sync-v1.0-design.md`
- 范围：仅 `sites/rolecraft/dist` 客户端样式与派生题库数据；未改后端、数据库、教材正文、产品门槛或远程服务器
- 状态：`implemented_pending_independent_ui_qa`

## 验收缺陷与根因

上一轮独立远程 UI/UX 验收将 DV1-RWD-02 记为 `fail`：320px 下任务内容可见，但顶栏右侧“选择职业”和“登录/注册”被屏幕边缘裁切。原顶栏使用固定高度和单行布局，账户/职业区域又受移动端最大宽度限制，两个入口无法在窄屏同时保留可见宽度。

题库空态不是服务端接口缺失。客户端 `learning-experience-v13.js` 的严格身份校验把 `RolecraftLearningV13` 判为不可用：派生包曾保留旧语料包哈希 `1a385b…2840e`，而当前 v12 内容包是 `c56def…f757`；c01-selection 的 54 个来源绑定/引用仍为旧源哈希 `123f00…bcd4`，当前正文和检索索引为 `4ee70a…d982`。因此 `data()` 返回 `null`，题库被渲染为“课程关联资料暂不可用”。这是派生包绑定漂移，未发现题面或数据库数据缺口。

## 已改动

1. `dist/auth-career-v15.css`
   - 在 `≤760px` 为顶栏启用自动高度和换行。
   - 账户/职业入口移到顶栏第二行，使用 `minmax(0,1fr) auto` 网格；按钮保留键盘焦点、最小触控高度和职业标题省略，不产生整页横向滚动。
   - `≤340px` 隐藏非关键的版本徽章，为 320px 的职业选择与登录/注册保留稳定宽度；版本身份仍在页脚及服务响应中展示。

2. `dist/learning-v13-data.js`
   - 将派生包 `corpusHash` 及 metadata 重绑到当前 v12：`c56def0f8eaf17207c10bc794a771650b0c9f52207815ce11aa7a7a00f29f757`。
   - 将 c01-selection 的来源哈希/字节数重绑到当前正文：`4ee70a19c07d14a550ff9f1fbcfb46ec26a3e236aef30b5d3f2b1ce3f190d982`、9639 bytes；题面、题号、题组未新增、删除或改写。
   - 327 条证据全部重新核当前正文；其中 17 条因 c01 正文行号变化更新了 `startLine/endLine`，Q6/Q66 的引用同步到正文实际编码文本。原题组身份和来源路径保留。

`dist/learning-experience-v13.js` 最终哈希与收到基线一致，严格版本校验未放宽；数据重绑后无需用宽松校验掩盖来源漂移。

## 本地验证

- `node --check dist/learning-v13-data.js`：通过。
- `node --check dist/learning-experience-v13.js`：通过。
- Node VM 以当前 `content-v12-data.js` 加载客户端包：`dataValid=true`、`questions=114`、`knowledgePoints=240`。
- 题库页面静态渲染：114 个题卡，包含 Q1、Q100、M101；不再出现“课程关联资料暂不可用”。
- 在隔离的单次阅读记录夹具下，访问一个含题知识点后 `eligibleQuestions()` 返回 1；无阅读记录时返回 0，仍是产品约定的诚实自评空态，不是题库丢失。
- 未启动远程服务、未部署、未写账户或数据库。

## 文件哈希

| 文件 | SHA-256 |
| --- | --- |
| `dist/auth-career-v15.css` | `1d5c799bb641056b051bf4a522d960f6863fee8ab6686e55fbd42f297f0fb13a` |
| `dist/learning-v13-data.js` | `6d27dabc1cedc15236de846c44dae8f66c4f82b77c2ede543941d3589e8772a4` |
| `dist/learning-experience-v13.js` | `3b17e6ce3b1d06c6aecea39f2f69a8745233f85192b275c7168016b556e89d65` |

## 尚未关闭

本交付没有独立浏览器截图、AX 树、键盘逐步记录或 320/375/390 实机渲染证据。测试工程师仍需在远程单环境复验 DV1-RWD-02、顶栏入口焦点和整页横向溢出，并确认题库页面、题目详情和自评流程的实际导航。自评题数在未访问知识点时保持 0；这需要产品/QA按“先阅读后抽题”流程验收，不应通过预填题目伪造可用性。
