# AI 生成工程师 D0 故障注入与陌生约束迁移证据 v0.3

- **诊断 ID**：`D0-AI-20261015-001`
- **追加记录 ID**：`D0-AI-20261015-001-R2`
- **日期/时区**：2026-10-15 / Asia/Shanghai
- **岗位**：AI 生成工程师（`AI`）
- **训练状态**：`in_progress`
- **本轮局部结论**：`passed_local_fixture_with_limitations`
- **D0 总结论**：`not_assessed`；L1 `not_granted`
- **记录性质**：在 v0.1 原始输入和 v0.2 正常路径重放之后追加的本地确定性夹具证据；不覆盖旧文件，不构成能力认证。

## 范围、输入与保留

本轮针对理论核验包 `PLR-AI-006` 的 `E-AI-006-S1` 和 `U-AI-006-T1`，补运行四类故障与一个陌生任务。使用同一虚构租户 A、同一 `DEMO-42` 输入、同一只读工具契约、同一输出 schema；所有运行只生成本地草稿，不发布、不发送。

既有记录保持原样：

| 输入 | 收到 SHA-256 |
| --- | --- |
| `sites/rolecraft/team/ai-generation-d0-v02-replay.md` | `45d626847c22845c9f11f7777df094600336134e111d2f993f50de1f3eef070d` |
| `sites/rolecraft/team/ai-generation-d0-v02-replay.json` | `5475f74922ae12bbe7f07f690bd1ed61bb2cbf7075ce2074e02e2a9d2bd50d4b` |
| `sites/rolecraft/team/professional-learning-theory-check-v01.md` | `175b31a81ad4bc0692d7e1db22c57cec138b4b33ab509876a7e7138629b28749` |
| `sites/rolecraft/team/professional-learning-theory-check-v01.json` | `881a3a7cc11ca48010d8c84613d4ca93752aa1cdb3da39e5c0af2436a087eac0` |

原始 D0、v0.2 replay、教材、应用、账户/数据库和历史 QA 均未修改。

## 可重建命令与环境

```text
python3 /private/tmp/ai_generation_d0_fault_transfer_v1.py > /private/tmp/ai_generation_d0_fault_transfer_run_v3.json
```

| 物件 | SHA-256 |
| --- | --- |
| 夹具脚本 `/private/tmp/ai_generation_d0_fault_transfer_v1.py` | `37c18726cc2391bc7997b93e0bafa1bf626367d0d5686956316101e3f3f9ee34` |
| 夹具定义 `F-AI-D0-S1-v2-fault-transfer` | `c8f7884042d59e714d82f266a34ff17fe33faa7291160abb8647695e2db62239` |
| 运行输出 `/private/tmp/ai_generation_d0_fault_transfer_run_v3.json` | `6a74928b13d8fc28499b1d591d2ad5c0679852c4e9c52d9571e7f9a09d13c062` |

运行环境：Python `3.14.5`，macOS `26.6.2 arm64`。任务约束禁网；未导入真实 `langgraph`，未调用真实模型、付费 API、真实密钥、真实用户数据、云服务或外部写入。

## 故障注入结果

每一项都保留首个故障对象、状态序列、停止点和恢复证据。`stopped` 表示在故障被确认后禁止继续生成/外发；`recovery_required` 表示保留失败和旧状态后才能继续。夹具内的“耐久结果”是确定性状态机数据，不是生产数据库或真实 checkpoint 服务。

| 场景 | 首次故障 | 实际状态/停止证据 | 恢复证据 | 局部结论 |
| --- | --- | --- | --- | --- |
| `FI-AI-EMPTY-001` 空工具结果 | `EMPTY_TOOL_RESULT`，第 1 次，`tool_result_ref=null` | `start → tool_called → tool_returned_empty → failed → stopped → recovery_required`；无草稿、`external_action=null` | 只读工具契约声明无副作用，执行一次有界重试，得到 `doc-A-refund-v1`，经 schema/来源/无发送检查后交接 | `passed_local_fixture_with_limitations` |
| `FI-AI-DUP-001` 重复回调 | `DUPLICATE_CALLBACK`，`callback_id=cb-001` | 首回调已持久化后检测相同 callback；`stopped`，第二个逻辑草稿未创建，`external_action=null` | 以 `callback_id` 去重，复用首个结果，检查后交接 | `passed_local_fixture_with_limitations` |
| `FI-AI-OLD-001` 旧检查点 | `CHECKPOINT_INCONSISTENT`，旧版本 `v0` 标为 completed 但没有 `tool_result_ref/source_refs` | `old_checkpoint_loaded → failed → stopped → recovery_required`；未信任 completed，不生成空引用草稿 | 找到保存的工具结果，重建草稿，复核来源和 schema 后交接；旧检查点保留 | `passed_local_fixture_with_limitations` |
| `FI-AI-TIMEOUT-001` 超时 | `TOOL_TIMEOUT`，第 1 次，预算 50ms | `tool_called → timeout → stopped → recovery_required`；部分输出丢弃，无外发动作 | 只读工具允许一次有界重试，第 2 次返回来源，复核后交接 | `passed_local_fixture_with_limitations` |

四项故障均有首失败、停止和恢复状态；恢复前没有 `draft_ready_for_review` 或外部动作。

## 陌生任务 `U-AI-006-T1`

陌生任务只改变一个约束：**checkpoint storage 暂时不可用**。输入请求、租户身份、工具名称和副作用、输出 schema、来源版本、模型/网络边界均保持基线不变。状态序列为：

`start → tool_called → tool_returned → checkpoint_write_failed → stopped → recovery_required → checkpoint_write_recovered → drafted → checked → handed_off`

首失败记录：`CHECKPOINT_STORE_TRANSIENT_UNAVAILABLE`，第 1 次，建议等待 20ms。恢复时没有修改任务合同，也没有在 checkpoint 可用前发布草稿；第 2 次写入 `checkpoint_version=v2` 后才生成和检查草稿，最终 `draft_ready_for_review`，`external_action=null`。

迁移计划六步均执行：

1. 冻结身份、请求、工具合同和输出 schema，并保留基线 hash；
2. 保存首个 checkpoint 写入失败；
3. checkpoint 不可用时暂停下游生成和所有外部动作；
4. 在有界预算内等待并重试 checkpoint；
5. 恢复后重新核对 schema、来源版本、租户范围和无发送条件；
6. 将未知任务限定为本地夹具，不把它写成真实队列、LangGraph 或生产恢复证据。

`plan_executed=true`。该结果证明迁移步骤在确定性替身中按计划走通；不证明真实 checkpoint 服务的可用性、RPO/RTO、并发一致性或 LangGraph API 行为。

## 证据边界与后续交接

- 已运行：四类故障注入、一个只改变 checkpoint 可用性的陌生任务；每项有状态、首失败、停止、恢复和无外发证据。
- 未运行：真实 LangGraph 安装/API、真实模型与提示词质量、真实工具副作用、生产持久化/崩溃恢复、费用、云服务、真实用户数据和对外发布。
- 夹具没有模拟真实进程崩溃或真实耐久存储；“恢复”是本地确定性状态机重建，必须按 `passed_local_fixture_with_limitations` 表述。
- 不能用本记录替代学习者原始回答、岗位作品、内容审校或测试工程师独立签收；不能授予 L1 或无监督生产权限。

交接给内容审校员和测试工程师：独立核对脚本/输出 hash、四个故障的首失败与停止/恢复状态、迁移约束只改变 checkpoint 可用性，并按原例—受影响回归—未预告变体复验。真实模型、外部动作和付费调用仍需另行授权。

