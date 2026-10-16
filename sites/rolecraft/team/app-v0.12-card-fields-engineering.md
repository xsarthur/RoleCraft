# 双输入 v0.12 卡片字段工程交接

- 责任岗位：软件工程师（网站客户端实现）
- 日期：2026-10-15（Asia/Shanghai）
- 范围：仅修改 `dist/auth-career-v15.js`、`dist/learning-workbench.js`；不改后端、检索索引、产品需求、设计稿或 QA 报告。

## 收到源冻结

本次修改前已冻结收到字节：

| 文件 | 收到 SHA-256 |
|---|---|
| `sites/rolecraft/dist/auth-career-v15.js` | `119ee8cacf91587065e52d23e476c0ceab05a3d30017a93212c859ebbfa03cf6` |
| `sites/rolecraft/dist/learning-workbench.js` | `24d1963aa5737b825d4b718767960c359b7ef67050b2aba472dc0dee1a01e0d2` |

历史工程/QA 文件中的旧哈希保留，不以本次文件替换旧绑定。

## 实现

### 职业候选卡

- 继续只使用服务返回的 `matchedSignals`、`gaps`、`careerContent`、`actions` 与 `provenance`；没有字段时显示“服务未提供”，没有前端推测。
- 卡片补充匹配信号、待补能力、内容版本与索引版本。
- 对服务声明的 `browse_content` 提供只读“浏览教材”入口；`compare` 以只读“可比较”状态呈现，不触发职业确认、账户写入或未声明接口。
- 确认仍只由原“确认并切换职业”动作触发；推荐和只读入口不写账户。

### 学习结果卡

- 在本次问答身份详情和每个来源卡中展示服务返回的教材版本、教材身份、`indexVersion`、`corpusHash`。
- 来源详情继续展示服务返回的 `sourceSha256`、稳定 `href`、来源路径、小节与结果版本；原有 `validateSource`/`validateResponse` 版本、语料 hash、原文和定位核对未放宽。
- 无字段时以“服务未提供”呈现；不可用、无匹配、澄清、非法输入状态仍走原分支，不将失败转换为成功。
- 不新增写记录行为；迟到响应、旧路由和职业确认边界未改。

## 开发自检

- Node：`v24.16.0`
- `node --check sites/rolecraft/dist/auth-career-v15.js`：通过
- `node --check sites/rolecraft/dist/learning-workbench.js`：通过
- 隔离 `vm` 载入两脚本（隔离存储、静态页面、禁止网络调用）：均 `VM_OK`

## 修改后 SHA-256

| 文件 | 修改后 SHA-256 |
|---|---|
| `sites/rolecraft/dist/auth-career-v15.js` | `48f6b83354c89546cd884ab505e73653814f03cf323c20aad5d7561869be078c` |
| `sites/rolecraft/dist/learning-workbench.js` | `160d267bb5684a41c5a7c18b27ce2c7e30c8ea448f7e793f010f0e100e579b81` |

## 未验证与交接

当前只完成客户端静态/隔离运行自检。真实浏览器布局、屏幕阅读器、键盘焦点、中文输入法、窄屏与真实 HTTP 时序仍由测试工程师独立复验；本次未宣称职业卡字段质量、索引哈希修复或整体产品达标。
