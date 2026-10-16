# 职造 1.0 独立 QA（当前源快速复核）

- **日期**：2026-10-16（Asia/Shanghai）
- **岗位**：测试工程师
- **范围**：`team/product-v1.0-scope.md` 冻结的 V1-01～V1-09；当前 `dist/` 与 `server/` 源码的短静态复核。
- **当前源基线**：产品合同记录的 `local-workbench-0.15-p0`（本报告不把该收到基线自动标为发布通过）。
- **总体结论**：`insufficient`
- **总体说明**：本轮只运行四个 `node --check` 和短静态断言，未启动服务、未启动浏览器、未写账户/正式数据库。此前本岗位取得的隔离 TCP 收据（`127.0.0.1:47231`）仅覆盖 `health`、`catalog`、静态首页/资源的运输；其 `releaseVersion` 与 `X-Rolecraft-Release-Version` 均为 `rolecraft-1.0`。此前 Node26 运行被版本守卫拒绝，浏览器验收未执行。静态/运输证据不能替代当前版本的真实浏览器、键盘/窄屏、账户流程或逐场景 HTTP QA。

## 本轮实际执行

1. `node --check sites/rolecraft/server/index.mjs`
2. `node --check sites/rolecraft/dist/app.js`
3. `node --check sites/rolecraft/dist/learning-workbench.js`
4. `node --check sites/rolecraft/dist/learning-experience-v13.js`
5. 短 Node/Python 静态断言：核对 `product-v1.0-scope.md` 含 V1-01～V1-09；`index.html` 含 `rolecraft-1.0`、题库/复习/自评导航及四个客户端脚本；工作台/体验脚本含当前任务、练习证据槽、题库/复习/自评页面、版本身份/规则降级字样；服务端含 `RELEASE_VERSION`、JSON 发布字段和 `X-Rolecraft-Release-Version` 响应头。

四个语法检查均返回退出码 0；本轮静态断言返回通过。以上只证明源码可解析及所列合同/文案/分支存在，不证明运行时路径。

本轮绑定源 SHA-256：`server/index.mjs` `fad1ba848029ee6dfdf41a60d866df9a9d5561ee231689923990b61fe1d2ecfd`；`dist/index.html` `de8647133091a34e767816c02cc47d2d792d88ff41b5e851a1b6002bf2dc817b`；`dist/app.js` `68415ce3c8e2695cbb7807fb4ddb02abf929c76ab9b22563e791081002817289`；`dist/learning-workbench.js` `0c923df440467a12583431a9fc34b3a2459569622534f0bd8d604abbbcded4f4`；`dist/learning-experience-v13.js` `ff4ff28653553c0c61ad2050629a8a12d54ae0869fdbff8054ea80291f7661bf`；合同 `product-v1.0-scope.md` `d99cc91e1ee57170f0255841b2533802b0e6738ac58117a2f76e3d6808297af9`。

## V1-01～V1-09

| ID | 结论 | 当前证据与限制 |
|---|---|---|
| V1-01 | `insufficient` | `learning-experience-v13.js` 有未开始、进行中/可恢复、路线已浏览三类当前任务分支和唯一 CTA；本轮无浏览器，未独立确认首次/已有/中断/已浏览四态、刷新/后退/关闭后的唯一下一步。 |
| V1-02 | `insufficient` | `server/index.mjs` 保留 published 职业、React 澄清、无匹配/不可用/确认及版本核对代码；本轮没有职业输入的真实 HTTP/UI 场景、临时账户、取消/冲突/重启幂等证据。 |
| V1-03 | `insufficient` | 客户端结果卡源码包含意图、候选、摘录、教材/索引/语料身份、理由与限制；服务端有学习查询响应字段。此前隔离 TCP 收据未覆盖学习查询/对话结果，本轮未启动 HTTP，不能逐字段绑定页面卡与稳定定位。 |
| V1-04 | `insufficient` | `index.html` 主导航已包含题库、复习、自评检验；脚本含对应页面且静态源码未见“后续开放”占位。未执行当前版本点击、刷新、后退、窄屏浏览器和版本核对，故不能独立关闭。 |
| V1-05 | `insufficient` | `learning-workbench.js` 有项目档案保存、本人自述/运行证据/独立评价状态槽；产品合同要求至少一个试点单元的提交、恢复、回源证据。本轮未运行保存/提交/反馈路径，不能证明最小闭环。 |
| V1-06 | `insufficient` | 本轮静态核对客户端 `rolecraft-1.0` 与服务端 `RELEASE_VERSION`/响应头；此前 `127.0.0.1:47231` 的 health/catalog/static TCP 收据确认发布字段和响应头为 `rolecraft-1.0`。未核当前教材索引、题库、构建清单及页面运行时身份是否全链一致，不能把局部运输证据扩展为整体通过。 |
| V1-07 | `insufficient` | 设计交接要求抽屉、焦点、键盘、读屏、灰度、200% 缩放和 320/375/390/768/1280px；源码有部分 ARIA/响应式钩子。浏览器、读屏、缩放和软键盘均未执行，不能验证“不遮挡正文/提交”。 |
| V1-08 | `insufficient` | 服务端源码显式区分 `needs_clarification`、`no_match`、`unavailable`、`invalid_input`，客户端有规则降级/版本身份展示；本轮没有固定反例请求/响应和来源 hash 的 HTTP 收据，不能证明不存在旧答案/编造结果或迟到响应覆盖。 |
| V1-09 | `pass`（限定静态/运输范围） | 产品合同、客户端页脚/版本徽章和服务端响应均把 1.0 作为本地候选并保留 `providerCalled=false`/兼容字段边界；此前 TCP 收据仅为本机地址，未触碰公网、真人/专家、真实模型或生产承诺。本结论不授予完整产品通过或相关能力证据。 |

## 不得由本报告推导的结论

本报告不授予职业认证、岗位胜任、真人用户价值、真人专家审核、真实模型生成、生产恢复、成本经济性或行业先进性。产品合同原八门槛仍按其既有状态维护；V1-01～V1-08 的复验需在当前源冻结后执行真实 HTTP/浏览器和隔离临时账户场景。发现缺陷后应交唯一责任岗位返修，并按原例与受影响范围复验，不能用本报告的静态通过或旧版本 TCP 收据关闭缺口。
