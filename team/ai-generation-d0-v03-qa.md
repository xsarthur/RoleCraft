# AI 生成工程师 D0 故障注入与陌生任务独立 QA v0.3

- QA ID：`AI-D0-V03-QA-20261015-01`
- 日期/时区：2026-10-15（Asia/Shanghai）
- 复核岗位：测试工程师（独立复验，不代学员作答，不修改作者文件）
- 目标岗位：AI 生成工程师（`role_id=AI`）
- 诊断：`D0-AI-20261015-001`
- 追加记录：`D0-AI-20261015-001-R2`
- 局部 QA 结论：`met_within_scope`
- D0 总结论：`not_assessed`
- L1 决定：`not_granted`（保持 L0/受指导状态）

## 范围与方法

本轮独立核对 v0.3 故障注入与陌生约束迁移记录、夹具脚本和输出。先按记录命令重跑原夹具，再比较输出字节和 JSON；随后对四个故障和一个陌生任务检查首失败、停止点、恢复顺序、来源/检查点约束及 `external_action=null`。最后在内存 QA 副本中将来源替换为未预告的 `doc-A-shipping-v9`/`fixture-source-unseen-v9`，不改作者脚本和项目文件，复验故障安全不变量及恢复结果。

## 收到版本与哈希

| 证据 | SHA-256 | QA 结果 |
| --- | --- | --- |
| `team/ai-generation-d0-v03-fault-transfer.md` | `7f85e10abd3adba65ea9951095563b96c85d91949d78dda4ac79b3843fc416a9` | 与收到版本一致 |
| `team/ai-generation-d0-v03-fault-transfer.json` | `1b4fcbe6f7dbbfb65c745558630d774321e9902406ea9744a113a7f8f2a93906` | 与收到版本一致 |
| `/private/tmp/ai_generation_d0_fault_transfer_v1.py` | `37c18726cc2391bc7997b93e0bafa1bf626367d0d5686956316101e3f3f9ee34` | 与 v0.3 记录一致 |
| `/private/tmp/ai_generation_d0_fault_transfer_run_v3.json` | `6a74928b13d8fc28499b1d591d2ad5c0679852c4e9c52d9571e7f9a09d13c062` | 与 v0.3 记录一致 |
| QA 独立重放 `/private/tmp/ai_generation_d0_fault_transfer_qa_rerun.json` | `6a74928b13d8fc28499b1d591d2ad5c0679852c4e9c52d9571e7f9a09d13c062` | 与 v3 输出字节相同 |

命令：

```text
python3 /private/tmp/ai_generation_d0_fault_transfer_v1.py > /private/tmp/ai_generation_d0_fault_transfer_qa_rerun.json
```

`cmp` 和 JSON 比较均通过。夹具仅导入 Python 标准库；未发现网络、真实模型、付费 API、真实 LangGraph、外部写入、账户或数据库调用。运行环境为 Python `3.14.5`、macOS `26.6.2 arm64`。

## 原例—回归—未预告变体

### 原例重放

五个收到场景与 v3 输出的 `fixture_payload`、四个故障场景、迁移场景逐项相等。所有场景都有 `first_failure`、`stopped` 且停止早于 `handed_off`；停止证据中的 `external_action` 均为 JSON `null`；恢复证据均以 `draft_ready_for_review` 结束。

### 受影响回归

四个故障场景均保留首次失败并在停止后恢复：

| 场景 | 首次失败 | 关键停止/恢复核对 | 结果 |
| --- | --- | --- | --- |
| `FI-AI-EMPTY-001` | `EMPTY_TOOL_RESULT`，第 1 次，空 `tool_result_ref` | `failed → stopped → recovery_required`；有界重试后才生成和检查，无外发 | `pass` |
| `FI-AI-DUP-001` | `DUPLICATE_CALLBACK`，`callback_id=cb-001` | 重复回调被停止并去重；第二个逻辑草稿为 false，复用耐久首结果 | `pass` |
| `FI-AI-OLD-001` | `CHECKPOINT_INCONSISTENT`，v0 completed 但缺少 `tool_result_ref/source_refs` | 不信任 completed，不生成空引用草稿；找回工具结果后重建并复核 | `pass` |
| `FI-AI-TIMEOUT-001` | `TOOL_TIMEOUT`，第 1 次，50ms | 部分输出丢弃，停止后只做一次有界只读重试 | `pass` |

陌生任务 `U-AI-006-T1` 只改变 checkpoint 可用性。状态为 `checkpoint_write_failed → stopped → recovery_required → checkpoint_write_recovered`，迁移六步全部标记执行；身份、请求、工具、副作用、schema 和模型/网络边界未改变，checkpoint 恢复前未发布草稿。

### 未预告变体

QA 在不修改作者夹具的内存副本中，将来源替换为 `doc-A-shipping-v9`、`fixture-source-unseen-v9`，并运行四个故障场景和 `U-AI-006-T1`。QA 变体脚本 `/private/tmp/ai_generation_d0_fault_qa_unseen.py` SHA-256 为 `7faf5c7756afa16b19c8f94ae2d388b1c6e35770fdb562905dc12cabe266e943`，输出 `/private/tmp/ai_generation_d0_fault_qa_unseen_output.json` SHA-256 为 `b865c9e72b3ca7aedc28fa4fe64d86a9c87027eb9c0b0aa3f7cd93ffc95c69ea`。

变体中所有场景仍有首失败、停止早于交接、无外部动作和最终 `draft_ready_for_review`；`drafted`/`recovered` 与 `checked` 的结果哈希随新来源变化，说明恢复检查没有只依赖旧固定哈希。该变体仍是本地确定性状态机，不是生产来源或真实模型测试。

## D0/L1 决定

| 项目 | 当前决定 | 依据 |
| --- | --- | --- |
| v0.3 局部夹具证据 | `met_within_scope` | 原例、受影响回归和未预告来源变体均可重建；四类故障均有首失败、停止、恢复和无外发证据 |
| D0 整体 | `not_assessed` | D0-01/02 仍主要是静态回答；真实学习者迁移、完整 EvidenceCard、内容审校和岗位签收尚未完成；本地状态机不能证明真实模型或 LangGraph |
| L1 | `not_granted` | 虽有正常路径与故障路径两个本地工件，仍缺完整学习者作品、相邻岗位签收、独立内容审校结论、真实/留出任务能力证据及 P1 清零 |
| 真实职业能力 | `not_assessed` | 未进行真实模型、生产持久化、成本、用户价值或专家验证 |

此前 v0.2 的状态名漂移（原计划 `source_checked`，夹具使用 `checked`）仍未由本轮作者合同迁移记录关闭，QA 保留为 P2，不影响本地重放等价性但影响跨版本追踪。

## 未验证与交接

- 未验证真实 LangGraph 安装/API 兼容性、模型输出质量、供应商错误/超时、费用、外部工具副作用、真实 checkpoint 持久化、RPO/RTO、并发一致性和进程崩溃恢复。
- “恢复”是本地确定性状态机重建；不能写成真实耐久存储或生产恢复。
- 未以任何代理输出代替学习者回答、岗位作品或能力认证；不能由本报告授予 L1 或无监督生产权限。
- 内容审校员仍需独立核对故障机制、迁移假设和 LangGraph 边界；AI 生成工程师需保留首次失败、返修和接收签收；PM 再依据独立复验更新训练状态。

本报告只记录测试工程师复验结果，未修改 v0.3 作者文件、教材、应用、账户或数据库。
