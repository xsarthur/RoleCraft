# AI 生成工程师 D0 P1 修复 · 内容审校 v0.4

- **审校 ID**：`AI-D0-V04-CONTENT-REVIEW-20261015-01`
- **审校日期**：2026-10-15（Asia/Shanghai）
- **审校责任**：内容审校员（独立，不代学习者作答）
- **目标岗位**：AI 生成工程师（`AI`）
- **内容审校结论**：`reviewed_with_limitations`
- **局部夹具结论**：`met_within_scope`
- **D0 结论**：`not_assessed`
- **L1/真实模型权限**：`not_granted`

## 范围与方法

本轮独立核对 v0.4 P1 修复稿、运行 JSON、checkpoint/manifest、作者报告和测试工程师 v0.4 独立 QA。内容审校员在同一工作区重新执行 `/private/tmp/ai_generation_d0_v04_p1_repair.py`，复制运行输出为审校重放记录，核对脚本/输出/manifest 哈希、拒绝收据、状态顺序、来源四元组、schema 停止、留出人工 gate 和历史记录保留。没有修改作者文件、教材、应用、账户或数据库。

| 输入 | 收到哈希/用途 |
| --- | --- |
| `sites/rolecraft/team/ai-generation-d0-v04-p1-repair.md` | `2b8a3ff519c3500cb124ed36ad655aff3c7eb9cbe3bce9d18cff4ab2dd3b95bb`；作者说明 |
| `sites/rolecraft/team/ai-generation-d0-v04-p1-repair.json` | `98f7dffc8ce9d8f6bb880f32ccc56fd92be681aa8e5121433407e1b8bb74f0ff`；结构证据 |
| `/private/tmp/ai_generation_d0_v04_p1_repair.py` | `68f3dc7078b50285f8729784e2c334688ee24ddd58944cb7a4e32a109ceff9d2`；可重建夹具 |
| `/private/tmp/ai_generation_d0_v04_p1_repair_run.json` | `3c701a9e9815ea421a3f9d3698b6509c3d3bab19fb483bf201777b78081574fe`；作者/重放运行输出 |
| `/private/tmp/ai_generation_d0_v04_p1_manifest.json` | `c663f3c9e1b0aac1504cedbd1d24ea8ed10357c9ffb9621322f67228ff152cf2`；文件清单 |
| `sites/rolecraft/team/ai-generation-d0-v04-qa.md/.json` | QA v0.4，原例与未预告来源均 `met_within_scope` |
| 审校独立重放 `/private/tmp/ai_generation_d0_v04_p1_content_review_rerun.json` | `3c701a9e9815ea421a3f9d3698b6509c3d3bab19fb483bf201777b78081574fe`，与作者输出字节相同 |

## 本轮支持的最强结论

### 授权、租户和来源边界

`retrieve_authorized_doc` 的本地函数确实接收 `document_id` 与 `tenant`，并依据 actor tenant、请求 tenant 和文档 tenant/可读标志返回 `OK` 或拒绝。A 读取 `doc-A-refund-v1` 返回正文哈希和 `fixture://` 位置；A 以 B 身份请求和 A 声明读取 B 文档分别返回 `TENANT_SCOPE_DENIED`、`SOURCE_SCOPE_DENIED`，缺参和不存在文档也有拒绝收据。拒绝收据没有 `result` 字段，生成函数没有被调用，局部授权路径可记为 `pass_local_fixture`。

允许来源和拒绝来源均带 `document_id/source_version/location/hash`；允许来源 hash 是正文 SHA-256，拒绝来源 hash 是 ACL 描述 SHA-256，`unavailable://permission-denied` 没有把 B 正文绑定为可读来源。QA 在 `doc-A-shipping-v9`/`doc-B-private-v9` 未预告变体中复验了 ID、版本、位置和 hash 随来源变化。

这里的“没有正文泄露”只适用于工具收据、草稿和恢复路径。运行 JSON 的 synthetic fixture 声明仍包含 B 的测试文本，这是测试输入而非真实用户数据；若将运行包对外共享，应去除或替换该字段，不能把此包当作生产级保密证明。

### checkpoint、停止和恢复

夹具以原子 JSON 文件实际写入工具结果、部分草稿和最终草稿，并保留路径、字节数和哈希。部分结果故意缺 `status` 且 `source_refs=[]`，状态顺序为 `crash_injected → restarted → manual_stop(hold) → replay_required → replayed → checked → handed_off`；重放读取工具 checkpoint，而不是信任部分草稿。该证据足以支持“本地文件介质上的确定性写入、读取、停止和重建路径”，比 v0.3 的内存字典证据更强。

脚本并没有让进程真正退出、由新进程加载或在电源/文件系统故障后恢复；`crash_injected`、`restarted` 和 `simulated-human-gate` 都是同一确定性程序里的状态分支。作者已明确标为本地原子 JSON 替身，因此不能写成真实 LangGraph checkpoint、数据库/队列恢复、RPO/RTO、并发一致性或生产崩溃恢复。

### schema、失败保留和人工 gate

v0.4 保留 schema 缺字段/空来源、空工具结果和重复回调的首次失败，均在停止和无外部动作后才进入恢复描述；v0.3 文件及其失败记录也保留。留出 `U-AI-006-T2` 只改变 `human_approval_required_for_handoff: false → true`，本地状态经过 `awaiting_human_approval → human_intervention → handed_off`，收据写明 `approve_for_review_only` 与 `not_production_approval=true`。QA 以未预告来源变体复验这些不变量。

但 `validate_output()` 只检查必需/允许键、非空来源列表、来源字段非空和 `external_action=null`；没有检查顶层字段类型、精确 `schema_version`、状态枚举、答案非空、hash 格式、来源引用额外键/重复引用或来源冲突。因此“schema/source checks passed”应理解为该窄夹具检查通过，不能当成通用 JSON Schema 或生产合同验证。

## P1 状态和仍未闭合项

| 关联缺陷 | 本轮判断 | 依据与后续要求 |
| --- | --- | --- |
| `AI-D0-V03-CR-01` 租户拒绝路径 | `closed_within_local_fixture` | A→B 和 A 声明读取 B 均有拒绝收据，拒绝先于生成；真实权限系统仍未验证。 |
| `AI-D0-V03-CR-02` checkpoint/恢复证据 | `closed_within_local_fixture` | 原子文件、哈希、重启读取和从工具 checkpoint 重放已出现；真实进程退出、存储故障、并发/RPO/RTO 仍未验证。 |
| `AI-D0-V03-CR-03` 逐条来源/版本绑定 | `partial` | fixture 文档的四元组和本地版本已绑定；没有 `claim_type`、外部课程/API 段落定位或 LangGraph 包版本，因此外部理论主张仍是 `insufficient_evidence`。 |
| `AI-D0-V03-CR-04` 授权工具契约 | `closed_within_local_fixture` | 输入、输出、side-effect 声明、授权/拒绝/缺参/不存在路径均有收据；工具是夹具函数，不是真实供应商工具。 |
| `AI-D0-V03-CR-05` 耐久结果复用措辞 | `partial` | 崩溃场景有实际文件 checkpoint；重复回调场景仍把内存字典标成 `persisted=true`，没有 callback 结果文件、并发竞态或相同/不同幂等键执行证据，需改写或补证。 |

## 其他 P2 和边界缺口

1. 空工具结果只记录了允许重试的规则，没有实际第二次 `tool_call`、重试耗尽、迟到回调或来源冲突；`side_effect=none` 是夹具元数据，不能证明供应商幂等性。
2. 状态仍使用 `tool_called/tool_returned/checked/handed_off` 等词，没有版本化 enum、转移条件及与旧 `source_checked/draft_ready` 的映射；跨版本复核需补合同。
3. “重复回调不创建第二草稿”是输出字典中的布尔断言，没有真正运行第二次 draft 竞态；需要持久 callback 记录或明确降级为状态机观察。
4. 人工 gate 是 `simulated-human-gate`，没有真人 approve/reject/escalate、学习者迁移或相邻岗位签收；留出只改变一项配置，不证明能力迁移。
5. 运行 JSON 的测试 fixture 包含拒绝文档的 synthetic `text` 字段；共享证据前需脱敏或明确 synthetic-only。

## 来源、版本和许可边界

本轮夹具只使用本地 synthetic fixture，`fixture-source-v1` 和 `ai-generation-d0-output-v3` 是测试版本标识，不是 LangGraph 或供应商发行版本。运行环境记录 Python 3.14.5/macOS arm64；`langgraph_imported=false`、`real_model=false`、`paid_api=false`、无网络、无外部写入均与脚本一致。v0.4 没有复制 DeepLearning.AI 课程正文或外部代码，因而没有新增课程许可主张；课程/框架许可、官方 API 版本、供应商费用和真实服务合同仍需在进入真实实现前单独核验。

## 交接结论

v0.4 相比 v0.3 **实质关闭了本地夹具中的租户拒绝、授权契约和文件 checkpoint/重放缺口，并新增了来源四元组、schema 首失败保留和单约束人工 gate 证据**。P1 的真实系统和外部来源证据没有因此自动闭合；逐条 claim 分类/外部版本绑定与重复 callback 的持久化措辞仍需返修或继续保留为局部证据。

因此内容审校结论为 `reviewed_with_limitations`，局部夹具可记 `met_within_scope`；D0 仍 `not_assessed`，L1、真实模型调用和无监督生产权限均不得授予。学习者 D0-01/02 原始回答、EvidenceCard、真实/留出作品和岗位签收仍需独立完成。后续复验须保留 v0.1–v0.4 首次失败与版本身份，不能用本地代理报告代替学习者能力证据。
