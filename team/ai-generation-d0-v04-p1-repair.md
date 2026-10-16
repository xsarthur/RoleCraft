# AI 生成工程师 D0 P1 修复证据 v0.4

- 诊断：`D0-AI-20261015-001`；追加记录：`D0-AI-20261015-001-R3`
- 日期：2026-10-15（Asia/Shanghai）
- 岗位：AI 生成工程师（`AI`）
- 本轮局部结论：`met_within_scope`
- D0 结论：`not_assessed`；L1：`not_granted`
- 性质：本地无网络、确定性夹具的 P1 修复；保留 v0.1–v0.3，不构成真实模型/LangGraph/生产能力或岗位认证。

## 执行边界与可重建证据

唯一执行命令：

```text
python3 /private/tmp/ai_generation_d0_v04_p1_repair.py
```

| 物件 | 路径 | SHA-256 |
| --- | --- | --- |
| 夹具脚本 | `/private/tmp/ai_generation_d0_v04_p1_repair.py` | `68f3dc7078b50285f8729784e2c334688ee24ddd58944cb7a4e32a109ceff9d2` |
| 运行输出 | `/private/tmp/ai_generation_d0_v04_p1_repair_run.json` | `3c701a9e9815ea421a3f9d3698b6509c3d3bab19fb483bf201777b78081574fe` |
| manifest | `/private/tmp/ai_generation_d0_v04_p1_manifest.json` | `c663f3c9e1b0aac1504cedbd1d24ea8ed10357c9ffb9621322f67228ff152cf2` |
| checkpoint 目录 | `/private/tmp/ai_generation_d0_v04_p1_checkpoint_store` | 见 JSON `artifact.checkpoint_files` |

环境为 Python 3.14.5、macOS arm64。夹具未导入 LangGraph，未调用真实模型、网络、付费 API、云服务、真实密钥、真实用户数据或外部写入；`external_action` 全部为 `null`。

旧输入仅读并保留：

- `/Users/shengxiong/Desktop/One People Company/sites/rolecraft/team/ai-generation-d0-v03-content-review.md`：`5f707f301fae32730b80d0d0db1130cbc83ba86ab942339bd4e2e43745fb85e2`
- `/Users/shengxiong/Desktop/One People Company/sites/rolecraft/team/ai-generation-d0-v03-fault-transfer.json`：`1b4fcbe6f7dbbfb65c745558630d774321e9902406ea9744a113a7f8f2a93906`
- `/Users/shengxiong/Desktop/One People Company/sites/rolecraft/team/ai-generation-d0-v03-fault-transfer.md`：`7f85e10abd3adba65ea9951095563b96c85d91949d78dda4ac79b3843fc416a9`
- `/Users/shengxiong/Desktop/One People Company/sites/rolecraft/team/ai-generation-d0-v03-qa.md`：`eb331b3e06b72936f1a73a60a695178492c5403b3c4789f02121e54fb94991cf`

## 六项 P1 修复

### 1. 租户 B 拒绝路径

实际请求 `retrieve_authorized_doc(document_id=doc-B-private-v1, tenant=B)` 由租户 A 身份发起。工具在生成前返回 `status=rejected`、`code=TENANT_SCOPE_DENIED`，没有正文泄露、草稿或外部动作。拒绝收据包含 `document_id`、`source_version`、`location=unavailable://permission-denied` 和 ACL 描述哈希，未把 B 内容当作可读来源。另执行了 A 身份请求 B 文档但声明 tenant A 的 `SOURCE_SCOPE_DENIED` 路径。

### 2. 授权只读工具契约

工具契约固定为 `retrieve_authorized_doc`，`side_effect=none`，输入 `document_id:string + tenant:string`，输出含 `document_id/source_version/text/location/hash`。实际执行并留收据：

- A 读取 `doc-A-refund-v1`：`OK`，带内容 SHA-256 来源绑定；
- A 请求 B 租户：`TENANT_SCOPE_DENIED`；
- A 声明 A 但请求 B 文档：`SOURCE_SCOPE_DENIED`；
- 不存在文档：`DOCUMENT_NOT_FOUND`；
- 缺少 `document_id`：`INVALID_PARAMS`。

所有拒绝发生在草稿生成前；只读契约允许的修复只限有界重试，不能把拒绝转成来源。

### 3. 耐久 checkpoint、崩溃、不完整结果与重放

使用本地原子 JSON 文件实际写入三个 checkpoint：工具结果、崩溃时的部分草稿、重放后的完整草稿。崩溃点在 `after_partial_draft_before_source_refs`，部分结果缺少 `status` 且 `source_refs=[]`，首失败为 `INCOMPLETE_RESULT_AFTER_CRASH`。重启读取部分 checkpoint 后先记录 `manual_stop(decision=hold)`，阻止交接；随后只从已写入的工具结果 checkpoint 重放，重新绑定来源并通过 schema/来源/无发送检查，最终状态 `draft_ready_for_review`。

工具 checkpoint、部分 checkpoint、重启读取收据和最终 checkpoint 的路径及哈希见 JSON `durable_checkpoint_crash_recovery.durable_write_receipts`；manifest 另列文件字节数和哈希。这里的耐久性仅是本地原子文件证据，不是生产数据库、真实进程崩溃、LangGraph checkpoint、RPO/RTO 或并发恢复证据。

### 4. 每条来源绑定四元组

| 场景 | document_id | source_version | location | hash 类型 |
| --- | --- | --- | --- | --- |
| 授权来源 | `doc-A-refund-v1` | `fixture-source-v1` | `fixture://documents/doc-A-refund-v1#text` | 正文 SHA-256 |
| B 拒绝 | `doc-B-private-v1` | `fixture-source-v1` | `unavailable://permission-denied` | ACL 描述 SHA-256 |
| 来源范围拒绝 | `doc-B-private-v1` | `fixture-source-v1` | `unavailable://permission-denied` | ACL 描述 SHA-256 |

实际 hash 和 `hash_type` 已写入 JSON `source_bindings`、工具收据和完整草稿的 `source_refs`。B 的正文没有被读取或纳入生成。

### 5. 人工介入与留出迁移

留出任务 `U-AI-006-T2` 只改变一个约束：`human_approval_required_for_handoff: false → true`；输入、租户、文档、工具、副作用和输出 schema 均保持不变，JSON 给出 `changed_keys=[human_approval_required_for_handoff]`。状态经过 `awaiting_human_approval → human_intervention → handed_off`，人工收据明确检查租户、非空来源和 `external_action=null`，决定为 `approve_for_review_only`。这是一条本地确定性人工 gate 收据，不是实际学习者、真人专家或生产审批证据。

### 6. 原始失败保留

本轮重新执行并保留首失败、停止和修复路径：

| 场景 | 首失败 | 停止证据 | 修复 |
| --- | --- | --- | --- |
| schema 错误 | `SCHEMA_VALIDATION_ERROR`（缺 `run_id/status`，`source_refs` 为空） | 无交接、无外部动作 | 丢弃部分输出，补齐必需字段和来源绑定后再检查 |
| 空工具结果 | `EMPTY_TOOL_RESULT`，`tool_result_ref=null` | `tool_returned_empty → failed → stopped` | 只读契约下有界重试，再做 schema/来源检查 |
| 重复回调 | `DUPLICATE_CALLBACK`，`callback_id=dup-001` | 不创建第二个草稿、不产生外部动作 | 按 callback_id 去重，复用首个持久结果 |

v0.3 四类故障（含空工具/重复回调/旧 checkpoint/超时）的原文件哈希列在 `prior_files_preserved`，未覆盖历史首失败记录。

## 结论、交接与限制

本地夹具九项断言全部为 `true`：B 租户在生成前拒绝、授权只读契约实际执行、来源四元组完整、部分结果崩溃后人工停止并从耐久工具结果重放、留出任务只改一个约束、schema/空工具/重复回调首失败保留，且无外部动作。局部证据可记为 `met_within_scope`。

D0 仍为 `not_assessed`，L1 保持 `not_granted`。尚未验证真实 LangGraph/API、真实模型质量/费用/限流、真实数据库或队列崩溃恢复、RPO/RTO、真实人工或学习者迁移能力、外部工具副作用、真实用户数据、云服务和生产发布。测试工程师需独立重跑脚本与 hash，内容审校员需核对授权边界、schema 与恢复措辞；项目经理在两者完成后再评估 D0 是否达到门槛，不能以本地夹具直接授予 L1。
