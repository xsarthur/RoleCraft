# AI生成工程师 D0-03 学习者执行合同 v0.1

- contract_id: `AI-REAL-LEARNER-D0-EXEC-20261016-001`
- diagnostic_id: `D0-AI-20261015-001`
- owner: 测试工程师（合同）；学习者本人执行
- status: `pending_learner_execution`
- fixture: `F-AI-SOURCE-CLAIM-v1` / SHA-256 `5dc9f33ed3972dbff5118bc6977a66ccbd376bc6fcc54f15c9b1e26fda8db5e0`
- isolation: network disabled; real_model=false; cloud=false; paid_api=false; real_user_data=false; external_action=null

## 目的与边界

学习者本人须在冻结的 SOURCE-001 本地夹具上证明来源绑定、租户边界、缺失/冲突处理和首个失败停止。不得读取、缓存、摘要、写入模型上下文或暴露 B 租户文档；不得调用真实模型/API、云、付费服务、生产数据、通知、退款、数据库写回或任何外部动作。本合同不构成能力评分、D0/L1/L2 授予或真人签收。

## 四个冻结场景

| case_id         | 输入/注入                                                | 预期首个结果                                                                     | 必须停止与收据                                                                  |
| --------------- | ---------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| A-normal        | tenant A，读取 `doc-A-refund-v2`，版本/hash/location 与夹具一致 | `draft_ready_for_review`；两条 A/v2 fact claim 均 bound；未提供订单状态/客户身份保持 unknown | claim source refs、tool receipt、`external_action=null`、handoff=QA pending |
| B-tenant-denied | 请求 `doc-B-private-v1` 或 tenant B                     | 首失败 `SOURCE_SCOPE_DENIED`（或等价受控 forbidden）                                 | 生成前停止；`draft=null`、`handoff=null`、`external_action=null`；证明未访问/缓存/入上下文   |
| source-missing  | A/v2 必需来源不可获得                                        | 首失败 `SOURCE_MISSING`/unknown-blocked                                       | 不猜测、不换源；`draft=null` 或 blocked；保留缺失与停止点收据                                |
| source-conflict | 冲突版本/文本或声明 hash 与文本不一致                               | `SOURCE_VERSION_MISMATCH`、`SOURCE_HASH_MISMATCH` 或等价 conflict              | 生成前停止；`draft=null`、`handoff=null`、`external_action=null`；列出冲突键           |

B 场景的 B 文本不得出现在任一输出或日志。

## 学习者本人执行命令

在项目根目录、隔离环境由学习者本人运行并保存原始 stdout/stderr：

```sh
pwd
sha256sum sites/rolecraft/team/ai-generation-l0-practice-source-001/frozen_input.json
sha256sum sites/rolecraft/team/ai-generation-l0-practice-source-001/replay_verify.py
<learner-run-command> --case A-normal 2>&1 | tee receipts/A-normal.stdout
<learner-run-command> --case B-tenant-denied 2>&1 | tee receipts/B-tenant-denied.stdout
<learner-run-command> --case source-missing 2>&1 | tee receipts/source-missing.stdout
<learner-run-command> --case source-conflict 2>&1 | tee receipts/source-conflict.stdout
sha256sum receipts/*.stdout
wc -c receipts/*.stdout
```

`<learner-run-command>` 必须由学习者填写实际入口，不得伪造或把 QA 命令当作本人执行。若使用 SOURCE-001 回放器，可运行 `python3 sites/rolecraft/team/ai-generation-l0-practice-source-001/replay_verify.py`；它只能证明夹具回放，不能替代四场景本人执行。每个场景保存原始输出 bytes、SHA-256、stderr、退出码和停止收据。

## run-1 / run-2 / unknown holdout

- **run-1**：完整执行四场景，保存输入快照、输出 bytes、stdout/stderr、退出码、来源/停止收据。
- **run-2**：从相同冻结输入和版本重新执行，不复制 run-1 输出；逐字节比较正常输出和四类错误收据。
- **unknown holdout**：QA 不预先公开的等价变体，仅改变 `document_id`、`source_version` 或 `text`；预期动态绑定新 hash 并保留人工复核标记，或在绑定失败时首失败停止。不得据此自行授等级。

## EvidenceCard 必填字段

`evidence_card_id`, `contract_id`, `diagnostic_id`, `case_id`, `run_id`, `fixture_id`, `fixture_sha256`, `input_path`, `input_sha256`, `command`, `environment`, `stdout_path`, `stdout_bytes`, `stdout_sha256`, `stderr_path`, `stderr_bytes`, `stderr_sha256`, `exit_code`, `first_failure`, `stop_before_draft`, `draft_status`, `claim_source_refs`, `tool_receipt`, `unknowns`, `external_action`, `unvisited_sources`, `cache_or_context_evidence`, `handoff_recipient`, `human_receipt_pending`。A 正常须含每条 claim 的 document_id/source_version/location/hash/text/status；失败须含 draft/handoff/external_action 空值收据。

## QA 复现步骤与判定

1. 冻结并核对 practice-pack、fixture、合同和学习者输入哈希；使用独立临时目录，不使用真实数据库或用户记录。
2. 按四 case 重放，保存原始 stdout/stderr bytes、SHA、退出码和时间；检查首失败在 draft 生成前。
3. A 核对两条来源四元组、unknown、tool receipt 与 `external_action=null`。
4. B 核对受控拒绝及 B 文本未出现在 stdout/stderr/缓存/上下文收据。
5. 缺失/冲突核对首失败键、`draft=null`、`handoff=null`、`external_action=null`，确认未换源或覆盖冲突。
6. 比较 run-1/run-2 bytes+SHA；用未公开 holdout 检查动态绑定/冲突停线。
7. 检查无网络、真实模型/API、云、付费、生产数据和外部动作；检查本人提交与接收方签收状态。

QA 结论只允许 `met_within_scope`、`met_with_limitations` 或 `not_met`，须列出未验证项。学习者签名和接收方签收在执行前均为 `human_receipt_pending=true`；QA 不得代签、代答或授等级。

## 未验证与保留

真实供应商来源 API、真实模型引用忠实度、缓存/并发/进程恢复、生产权限、真人审批、学习者迁移能力和职业能力均保持未验证。
