# P0 内容检索状态合同检查

日期：2026-10-15  
责任岗位：内容检索工程师  
范围：检索服务端接口与现有学习工作台消费约定；不修改客户端、教材、账户或数据库。

## 结论

当前检索接口已经能够为 P0 的四种可见状态提供可判定的响应依据，本次没有必要改动 `server/retrieval`：

| 产品状态 | 客户端判定 | 服务端证据/合同 |
| --- | --- | --- |
| 加载中 | 请求发出后由客户端 `pending=true`，响应返回后清除 | 服务端为同步 HTTP 请求；不伪造中间结果。客户端应保留当前阅读并允许收起抽屉。 |
| 无结果 | `dialog.status=related_uncovered` 或推荐 `status=no_match` | `results=[]`、`citations=[]`，并返回 `message`/`limitations`；不得把资源故障映射为无结果。 |
| 失败 | `dialog.status=unavailable` 或推荐 `status=unavailable` | 返回 `engineMode`、`providerCalled:false`、`limitations`，资源失配、Node 不支持、并发忙等原因均明确提示；客户端可重试或打开目录。 |
| 规则降级 | `engineMode` 含 `concept`/`rule` | `ROLECRAFT_RETRIEVAL_MODE=concept` 或静态入口使用本地概念与原文术语检索；客户端应明确标注“当前使用规则检索”，不得称为语义模型或外部模型。 |

## 已核对的接口

- `POST /api/content/recommend`：`recommended|needs_clarification|no_match|invalid_input|unavailable`；成功响应携带 `corpusVersion/corpusHash`、结果来源和 `providerCalled`。
- `POST /api/content/dialog`：`dialog.status` 为 `answered|related_uncovered|unrelated|needs_clarification|unavailable|invalid_input`，顶层状态与旧推荐合同保持映射；非 answered 状态不携带回答句、引用或结果。
- 规则降级由 `recommendContent(..., {mode:'concept'})` 或环境配置触发，返回 `engineMode:'local_concept_retrieval'`；既有客户端 `modeLabel()` 会将 `concept|rule` 标成“当前使用规则检索”。
- 失败响应使用 `unavailable()`，保留版本字段、空结果集合和限制说明；语义异常不会降级成 `no_match`。

## 自检证据

在 Node.js `v24.16.0` 下运行：

```text
node server/retrieval/self-check-v12.mjs
```

结果：12 个 v12 检索场景通过，包含推荐、无匹配、歧义澄清、否定和来源校验；无外部模型调用。

另运行了历史 `search-fix-dev-check.mjs`。该脚本当前仍按 v10 语料断言，却调用默认 v12 推荐，因此出现来源绑定失败；这是旧脚本与当前默认版本不一致的证据，不是本次 P0 合同回归依据。没有修改该历史脚本或覆盖其记录。

## 交接给客户端岗位

客户端可直接按上述状态渲染：加载状态不等待服务端“成功”字段；无结果显示改写提示或目录入口；失败显示原因、重试和目录入口；规则降级显示明确模式标签。服务端现有字段足以支持这些动作，本岗位不新增字段以避免改变既有来源校验合同。

## 限制

本检查是检索岗位自检，不是独立 QA，也不证明真实用户理解、学习效果或完整产品达标。加载态、抽屉尺寸与逐态截图由客户端实现并由测试岗位独立复验。
