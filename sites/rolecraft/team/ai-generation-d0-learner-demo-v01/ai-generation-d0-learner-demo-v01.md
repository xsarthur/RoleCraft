# AI生成工程师 D0 学习者实际演示记录

- `diagnostic_id`: `D0-AI-20261015-001`
- `learner`: `local-sandbox-learner`
- `training_status`: `L0_guided`
- `decision`: `not_assessed`
- `qa_status`: `pending`
- `self_signed`: `false`
- `external_action`: `null`

本记录是学习者的本地确定性演示证据，不是内容审校、测试工程师验收或能力认证结论。

## 实际执行

生成命令：

```text
python3 /private/tmp/ai_demo_gen.py
```

脚本输出目录：`/private/tmp/ai-demo-out`。所有 JSON 以排序键和紧凑 JSON 编码写入；`manifest.json` 记录每个工件的字节数和 SHA-256。演示未使用真实模型、LangGraph、外部 API、数据库、云服务、付费调用或真实用户数据；未发生网络和外部写入。

## 13 个 JSON 工件

1. `SOURCE-001.json`：来源夹具、A 租户授权和 B 租户拒绝定义。
2. `D0-03-A-normal.json`：租户 A 的 DEMO-42 正常草稿。
3. `D0-03-B-denial.json`：租户 B 来源在生成前被拒绝。
4. `DURABLE-002-v04-tool.json`：工具结果持久化检查点。
5. `DURABLE-002-v04-first-failure.json`：检查点写入失败的首个失败记录。
6. `DURABLE-002-v04-recovery.json`：从耐久工具结果恢复并重新核对。
7. `DURABLE-002-v04-final.json`：恢复后的可审阅草稿。
8. `GATE-003-v06-baseline.json`：D0-05 正常基线。
9. `GATE-003-v06-first-failure.json`：只改变检查点可用性后的失败和停止。
10. `GATE-003-v06-regression.json`：恢复后的回归核对。
11. `GATE-003-v06-holdout.json`：只改变故障持续时间的留出变体。
12. `manifest.json`：13 个证据文件的绑定清单、大小和哈希。
13. `learner_raw.json`：学习者原始证据索引和未测范围。

## D0-03：来源与租户边界

A 路径读取 `doc-A-refund-v1`，生成结构化草稿，包含 `document_id`、`source_version`、`location` 和内容哈希；`external_action` 为 `null`。B 路径请求 `doc-B-private-v1`，在生成前以 `tenant_scope_denied` 拒绝，`answer` 为 `null` 且 `source_refs` 为空。两条路径均绑定同一诊断 ID。

## D0-04：首失败、恢复与幂等核对

工具结果先写入 `DURABLE-002-v04-tool.json`。随后模拟检查点写入失败，首失败记录状态为 `recovery_required`，不允许交付不完整草稿。恢复阶段从工具结果重放，保留同一幂等键，重新核对 schema、租户、来源版本、来源引用和无外发动作，最终状态为 `draft_ready_for_review`。这是本地 JSON 文件替身，不证明真实进程崩溃、生产数据库耐久性或 RPO/RTO。

## D0-05：单约束故障演示

基线先以 `checkpoint_available=true` 执行。故障仅改变一个约束：`checkpoint_available=false`；首次失败进入 `recovery_required` 并停止下游生成。回归记录恢复后重新检查 schema、来源版本和租户。holdout 仅改变检查点故障持续时间，达到重试预算后停止。模型、身份、输入和工具契约均未改变。

## 限制与等级状态

未测范围包括真实模型质量、LangGraph/API 兼容性、生产数据库恢复、外部副作用、真实用户数据、生产 RPO/RTO、真人专家审核、独立 QA 复验和学习迁移效果。学习者证据状态为 `L0_guided`；D0 仍 `not_assessed`，不授予 L1 或 L2。
