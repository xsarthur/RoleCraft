# AI-PRACTICE-DURABLE-002 v04 独立 QA

日期：2026-10-15。角色：测试工程师。范围：仅对 v04 本地确定性夹具、其三次 run、holdout、checkpoint manifest、恢复收据、四个首失败和交接/外部动作字段进行独立复验。未修改被测工件、旧 v03 报告或标准。

## 结论

**met_with_limitations**（在声明范围内通过，不能授予 L0/L1/L2 等级，也不等同真实生产耐久性）。

## 实际复验

- 逐字读取并重算 run-1/run-2/run-3 的 `final.json`：每份 302 bytes，SHA-256 `ae2cfd3f1ff449f5498fae75b96785086f6e184c1a4123642f9bde5ee8732496`；三次一致。
- 三份 `final_output.json` 均为 218 bytes，SHA-256 `24d7e9ba06340241e48be76b4ba06e4225c1c2511f09ab7efa972b7cf4bfc28f`；顶层 `scope=fixture-only`、`status=local_draft_ready`、`status_scope=deterministic_local_fixture_only` 均存在且一致。
- 三个 run manifest 的 checkpoint bytes/SHA 与实际文件一致：contract 224/f94daa…1339、tool 308/b4b620…8191a、draft 205/b2beab…47cd、final 302/ae2cfd…32496；checkpoint_manifest 对三 run 完整列出且哈希一致。
- 三 run `events_sha256=3087c33b…9ef9504`、`final_payload_sha256=21a15801…b0ccd8`、`event_count=6` 一致，根 manifest `run_byte_replay_equal=true`；run-1/2/3 文件级重放相等。
- 四个首失败证据均存在且语义符合：CHECKPOINT_CORRUPT（截断 tool，manual_stop）、INCOMPLETE_RESULT_AFTER_CRASH（缺 content_hash/final_checkpoint，handoff_denied）、DUPLICATE_CALLBACK_PAYLOAD_MISMATCH（不覆盖）、CHECKPOINT_VERSION_MISMATCH（v2→期望 v3）。
- recovery receipt 显示 `replay_required` 后 `replayed`；holdout 标记 event-order-only，独立 manifest/event/final payload 哈希存在，且最终输出仍为 fixture-only/local_draft_ready（holdout 未宣称生产完成）。
- run/holdout contract 的 `external_action` 均为 `null`；没有真实模型、网络、付费 API、云服务、密钥、用户数据或外部写入。handoff 只在本地人工 gate/收据语义中出现，不能视为真实审批或生产交接。

## 限制与未验证项

本证据只证明本地原子 JSON 替身中的幂等 callback、checkpoint 完整性、确定性重放、失败注入和 holdout 事件顺序。未验证生产数据库/真实进程崩溃、并发一致性、RPO/RTO、LangGraph checkpoint、真实供应商调用、网络重试、权限边界、真实学习者或真人专家效果；`external_action=null` 也不构成生产安全认证。旧 v03 结论与首轮失败记录保留，不被本报告覆盖。

责任后续：AI 生成工程师维持工件与版本；若要宣称生产耐久性，需由对应岗位提供真实运行与恢复证据，再由 QA 独立复验。
