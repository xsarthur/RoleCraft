# AI-PRACTICE-DURABLE-002 内容审校 v0.2

## 范围与依据

本次独立内容审校只读核对 `ai-generation-l0-practice-durable-002-v02.md/.json`、v02 工件目录（checkpoint manifest、三次运行、holdout、首失败、恢复收据、EvidenceCard、repair record）、v01 内容审校与 AI 生成工程师 practice pack v02。未修改学习者产物、教材、应用或历史报告；未授予 L1/L2 或岗位等级。

## 结论

**`reviewed_with_limitations`（本地练习范围；不构成生产耐久性、RPO/RTO 或发布定稿证据）**。

v02 的主要返修已真实落盘：根目录 checkpoint manifest 为非空 JSON，列出 run-1/run-2/run-3 每个 contract/tool/draft/final 的相对路径、bytes 与 SHA256；逐文件重算 12 项均匹配，manifest SHA256 为 `69d8daa4dc46c20db9641de727ae9e91e9bdf8c9cc7e367b9f58be268e77afe8`，与 v02 记录一致。三次 `final_output.json` 使用 `local_draft_ready` 并带 `deterministic_local_fixture_only` 范围，已避免把练习结果直接写成生产最终定稿。幂等 callback、不同 payload 拒绝、单 draft、从 tool checkpoint 重放、首失败保留和 holdout 事件顺序的论证与工件相互一致。

### 已核对的支持证据

- `checkpoint_manifest.json` 的 12 个条目实际 bytes/SHA256 全部通过；run-1/2/3 各自 manifest 与其 checkpoint 文件一致，三次运行文件内容可重放。
- `repair_record.json` 明确从 v01 到 v02 的两项修复、保留 v01/首失败、`self_signed=false` 与 `qa_status=pending`；EvidenceCard 的 `review_status=pending_QA`、L1/L2 `not_granted` 与交接状态一致。
- run-1/run-2/run-3 维持 callback 接受→重复复用→单 draft→final checkpoint 的顺序；四个首失败原件仍保留，包含不同 payload 不覆盖、损坏/版本不匹配拒绝、崩溃后不完整结果转 hold/replay。
- 恢复收据保留 restarted→manual_stop→replay_required→replayed→checked→handed_off；本地 `local_draft_ready` 语义明确为确定性夹具状态。

### 限制与待处理问题

1. **holdout 状态措辞仍有残留歧义（需 QA/作者修复或明确豁免）**：`holdout/final_output.json` 仍为 `status: "final"`，没有与三次主运行一致的 `local_draft_ready` 和范围字段。即使其余 EvidenceCard 已写明 fixture-only，这个文件名/状态仍可能被下游解读为生产最终结果。应改为本地范围状态并重算受影响哈希/复验，或在合同中明确 holdout 的 `final` 仅代表本地快照且由 QA 独立确认；在此之前不能宣称所有输出均已消除范围误读。
2. **恢复证据仍是确定性文件状态机**：没有真实进程 kill、生产数据库/队列、并发写入、fsync/rename 故障注入或 RPO/RTO 测量，不能推出生产 crash recovery、耐久性、恢复时间/恢复点目标或 LangGraph checkpoint 能力。
3. **本地幂等结论有适用边界**：callback_id 去重、payload hash 校验和单 draft 只在给定夹具与顺序下成立；未验证多进程并发、跨节点、重试竞态、数据库事务隔离、外部供应商重放及真实接收方签收。
4. **未完成独立 QA**：v02 明确 handoff pending、未自签收；内容审校不能替代 QA 的运行复验或真人专家/真实学习者证据。

## 复验要求

责任人：AI 生成工程师先统一 holdout 状态语义并更新受影响 manifest/fixture 绑定；测试工程师独立重跑主运行、holdout、四首失败及字节/hash 校验；内容审校员随后复核措辞是否仍把本地替身扩展为生产耐久性/RPO/RTO。缺陷关闭前结论保持 `reviewed_with_limitations`，不授等级。

## 保护边界

本报告不修改学习者目录、冻结教材、应用、账户数据库或历史审校；不构成生产验收、真人专家审核、职业认证或发布授权。
