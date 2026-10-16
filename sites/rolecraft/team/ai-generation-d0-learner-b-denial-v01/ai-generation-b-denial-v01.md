# 学习者 B-denial 实作 v01

- diagnostic_id: `D0-AI-20261015-001`
- training_status: `L0_guided`; decision: `not_assessed`
- qa_status: `pending`; self_signed: `false`; external_action: `null`

## 执行

命令：`python3 /private/tmp/make_bdenial.py`。本地夹具 only，未调用真实模型、API、权限系统、数据库、云服务、付费服务或真实用户数据。

## 学习者本人运行

A 基线成功生成带来源草稿，handoff 保持待审阅且 external_action 为 null。B 私有文档请求在生成前拒绝；错误租户请求（租户 B 请求 A 文档）同样拒绝。非同构 holdout 同时包含 A 草稿需求和不可读取 B 文档，进入 recovery_required 并停止交接，不把部分结果交付。

首失败为 B-private 的 `TENANT_SCOPE_DENIED`，下游生成未执行。所有 input/output bytes 与 SHA-256 在 manifest 绑定同一 diagnostic_id。

## 分离与限制

本包是学习者原始实作证据，不替代独立 QA 或内容审校；二者尚未完成，保持 qa pending。不能据此授予 L1/L2，也不能推断真实权限系统、模型质量、生产恢复或用户效果。
