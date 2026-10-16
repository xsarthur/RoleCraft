# Agent 双输入系统 v0.12 续测独立 QA

- 版本：app-v0.12-continuation-qa
- 范围：职业选择输入与学习内容输入；依据 project-handoff-2026-10-15 及 agent-system-v0.12 产品、UX、后端、客户端交接。
- 结论：not_met（10 项通过、4 项失败、3 项证据不足）。
- 独立性：只读检查；未修改应用代码、产品/工程交接、正式数据库、旧 QA 或历史证据。测试使用临时 SQLite 和临时动态职业导入夹具。

## 已确认的通过范围

职业路径的进程内 HTTP handler 检查通过：推荐只读且推荐前 user_preferences 为 0；Agent 返回已发布候选及教材/索引/版本快照；React 返回两个澄清选项；无匹配返回空候选；明确确认后才写入活动职业；重复幂等键可重放；篡改教材 hash 返回 409 career_version_mismatch。旧 GET /api/careers 回退仍可用。

客户端静态检查确认候选确认与旧 PUT 回退位于确认动作之后，并有搜索序号、选中请求号和版本快照检查。学习客户端默认不发送当前章节，显式开启后才加入位置；递增请求号和 AbortController 丢弃迟到响应；来源 hash、原文摘录、语料版本和定位链接均有校验。两份脚本在隔离 Node VM 中可加载并暴露预期接口。

动态职业隔离夹具证明：推荐可返回导入的 published 动态职业；没有独立检索适配器时，学习请求诚实返回 unavailable、空结果且 providerCalled=false，不回退冒充 Agent 教材。

## 当前失败与差距

getContentCatalog(textbook-v12) 直接抛出 Current source differs; rebuild content。定位到 textbooks/v12/c01-selection.md：索引声明 SHA256 123f00a8…，当前源 SHA256 4ee70a19…。因此 dialogContent 的 React 澄清、题外 no_match、来源查询以及 recommendContent 均被阻断；/api/agent/learning/query 普通查询返回 unavailable，显式当前章节上下文返回 500，旧 /api/content/dialog 也只能返回 unavailable。

责任人应先重建并绑定当前教材索引，保留版本和旧报告；之后由测试工程师在 Node24 复验学习问答、版本/来源合同、上下文开启、旧路由回退和动态职业不可用状态。

## 运行限制与未验证项

本轮尝试本地 TCP 监听，当前沙箱以 EPERM 拒绝，因此进程内 handler 证据不能替代真实 socket HTTP。未取得真实浏览器的职业弹层确认、焦点/滚动、中文输入法、窄屏布局或迟到网络响应证据。执行器为 Node v26.3.0，项目合同目标 Node24；本轮未将本地 Node24 语义模型路径标为通过。外部模型未调用，正式数据库未触碰。

## 复验清单

1. 内容检索责任人修复 c01-selection.md 与 content-v12-index.json 的版本绑定并保留 hash 证据。
2. QA 在 Node24 重新运行语料目录、React 澄清、题外 no_match、来源摘录、上下文 opt-in、版本冲突和旧路由。
3. 在可访问 TCP/浏览器环境完成真实 HTTP、职业确认交互、迟到响应、焦点/滚动/IME 与窄屏复验。

详细机器记录见 app-v0.12-continuation-qa.json。
