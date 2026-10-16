# AI L0→L1 B 租户拒绝迁移补充实操 v0.1

学习者执行了 `AI-PRACTICE-SOURCE-001` 的授权/租户拒绝路径补强。仅使用本地确定性 `retrieve_authorized_doc` 夹具；无网络、真实模型/API、LangGraph、云、付费服务或真实数据，所有 `external_action=null`。

A 租户正常读取 `doc-A-refund-v2` 作为基线并生成带来源四元组的草稿。B 私有文档请求与错误租户请求均在生成前返回 `SOURCE_SCOPE_DENIED`，首失败收据明确 `draft=null`、`handoff=null`、`external_action=null`。随后以不同文档 ID/版本/正文的 `doc-B-private-v9` 作为非同构留出变体，仍动态拒绝，未使用固定字符串白名单。

首失败原始 JSON 保存在 `first-failure/`，正常重放在 `runs/run-1`、`runs/run-2`，字节与哈希相同；`holdout/changed-keys.json` 记录留出 changed_keys。提交等待 QA，学习者不自签收；L1/L2 未授予。真实权限系统、进程/并发恢复、真实供应商来源 API 与真人接收未验证。
