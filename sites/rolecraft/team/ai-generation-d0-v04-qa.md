# AI 生成工程师 D0 P1 修复独立 QA v0.4

- QA ID：`AI-D0-V04-QA-20261015-01`
- 日期/时区：2026-10-15（Asia/Shanghai）
- 目标岗位：AI 生成工程师（`AI`）
- 诊断：`D0-AI-20261015-001`；追加记录：`D0-AI-20261015-001-R3-QA`
- 局部夹具结论：`met_within_scope`
- D0 总结论：`not_assessed`
- L1 决定：`not_granted`（保持 `L0_guided`）

## 独立范围与边界

本报告只记录测试工程师独立复验，不代学员作答、不修改作者文件。QA 将作者脚本复制到隔离 `/private/tmp` 路径后运行两次，检查输入/输出/manifest/checkpoint 哈希；随后在内存/隔离副本中替换为未预告来源 `doc-A-shipping-v9` 与 `doc-B-private-v9`，重跑同一套状态机和安全断言。网络、真实模型、LangGraph、付费 API、云服务、真实用户数据和外部写入均保持关闭。

## 收到版本哈希

| 证据 | SHA-256 |
| --- | --- |
| `/Users/shengxiong/Desktop/One People Company/sites/rolecraft/team/ai-generation-d0-v04-p1-repair.md` | `2b8a3ff519c3500cb124ed36ad655aff3c7eb9cbe3bce9d18cff4ab2dd3b95bb` |
| `/Users/shengxiong/Desktop/One People Company/sites/rolecraft/team/ai-generation-d0-v04-p1-repair.json` | `98f7dffc8ce9d8f6bb880f32ccc56fd92be681aa8e5121433407e1b8bb74f0ff` |
| `/private/tmp/ai_generation_d0_v04_p1_repair.py` | `68f3dc7078b50285f8729784e2c334688ee24ddd58944cb7a4e32a109ceff9d2` |
| `/private/tmp/ai_generation_d0_v04_p1_repair_run.json` | `3c701a9e9815ea421a3f9d3698b6509c3d3bab19fb483bf201777b78081574fe` |
| `/private/tmp/ai_generation_d0_v04_p1_manifest.json` | `c663f3c9e1b0aac1504cedbd1d24ea8ed10357c9ffb9621322f67228ff152cf2` |

脚本和运行输出的哈希与作者 manifest/报告声明一致；JSON 可解析，报告与运行输出九项断言相等。

## 原例重放

QA 隔离脚本：`/private/tmp/ai_generation_d0_v04_p1_repair_qa.py`（SHA-256 `4c8ddf6c82418590fbe3136e1b8a81b25bd94a9b070e313a1562d39a9523b8f1`）。输出：`/private/tmp/ai_generation_d0_v04_p1_repair_qa_run.json`（SHA-256 `f2840ba2532dcc7425fd2134179985c841c2408cff5e67f05454f992f1dc2628`）。manifest：`/private/tmp/ai_generation_d0_v04_p1_qa_manifest.json`（SHA-256 `711606d54ce82b93ac6af82aa0c52e26871c86ddb014d7194a6de69dde02136a`）。同一隔离脚本第二次运行与第一次输出字节相等。

九项作者断言与 QA 结构检查均为 `true`：

- B 租户拒绝在生成前返回 `TENANT_SCOPE_DENIED`；没有 `result`、草稿或外部动作。
- `retrieve_authorized_doc` 的输入、输出、`side_effect=none` 和幂等键合同实际收据一致；A 授权读取返回带正文 SHA-256 的结果。
- checkpoint/崩溃路径按 `crash_injected → restarted → manual_stop(hold) → replay_required → replayed → checked → handed_off` 运行；停止早于恢复，部分结果缺 `status` 且 `source_refs=[]`，最终从工具 checkpoint 重放。
- 授权来源和拒绝来源均带 `document_id/source_version/location/hash`；拒绝只绑定 ACL 描述哈希和 `unavailable://permission-denied`，B 正文只存在于隔离 fixture 声明，没有出现在收据、草稿或恢复结果。
- schema 错误、空工具结果、重复回调均保留首失败；失败后停止且无下游生成/第二草稿/外部动作。
- 留出任务只改变 `human_approval_required_for_handoff`，经过 `awaiting_human_approval → human_intervention → handed_off`；人工收据仅批准本地 review handoff，明确 `not_production_approval=true`。

## 未预告来源留出重放

QA 仅在副本中把授权来源替换为 `doc-A-shipping-v9`、拒绝来源替换为 `doc-B-private-v9`、版本替换为 `fixture-source-v9`，并将任务/正文替换为未预告值。输出：`/private/tmp/ai_generation_d0_v04_p1_repair_qa_unseen_run.json`（SHA-256 `a4838bfc66e4c5009e28ca7b8e13a53bba63854e783c85e9d4af40588ff7be66`），脚本：`/private/tmp/ai_generation_d0_v04_p1_repair_qa_unseen.py`（SHA-256 `cb157de1323f664713a3849a939ec0601c565c439604c9ed779e8c25660f2382`），manifest：`/private/tmp/ai_generation_d0_v04_p1_qa_unseen_manifest.json`（SHA-256 `df02b41019a0a8ec82bdc60d92db5799569111acf5700aa06d9197b54a17ecfc`）。九项作者断言和 QA 结构检查仍全为 `true`，授权 source binding 的 ID/hash/location 随来源变化；拒绝和人工 gate 安全不变量保持。

## 五项 P1 和证据判断

| P1 | 局部判断 | 证据 |
| --- | --- | --- |
| B 租户拒绝 | `pass_local_fixture` | 实际拒绝收据、无正文 `result`、停止先于生成/交接 |
| 授权工具契约 | `pass_local_fixture` | 合同字段、A 成功读取及 B/范围/缺参/不存在拒绝收据 |
| checkpoint/崩溃恢复 | `pass_local_fixture` | 三个原子 JSON checkpoint、字节/hash、重启后 hold、工具结果重放 |
| 逐条来源绑定 | `pass_local_fixture` | 四元组和内容/ACL 哈希，最终草稿 schema 通过 |
| 人工介入/留出迁移 | `pass_local_fixture` | 单约束变更、人工检查收据、handoff gate 顺序 |

## D0/L1 决定

本轮局部夹具证据为 **`met_within_scope`**。D0 整体仍为 **`not_assessed`**，L1 仍 **`not_granted`**。P1 修复仅证明本地确定性状态机的安全和恢复不变量；没有证明真实 LangGraph/API、真实模型质量与费用、供应商失败、生产 checkpoint、真实人工审批、学习者迁移或岗位作品。D0-01/02 的学习者原始诊断与完整 EvidenceCard 仍需独立完成，不能以代理报告或本地夹具替代能力证据。

## 后续交接

内容审校员需独立核授权边界、schema、ACL/来源绑定和恢复措辞；AI 生成工程师若进入真实实现需补真实 API、耐久存储、成本和外部副作用证据；项目经理在收到独立内容审校和 D0 学习者证据后复盘是否达到 D0 门槛。本 QA 不授予 L1 或无监督生产权限。
