# Agent Developer 两周 MVP 独立 QA 终审

- QA ID：`QA-FINAL-AGDEV-20261015-LOCAL-01`
- 独立复核岗位：`qa-engineer`
- 责任岗位：`agent-developer`（本报告不代写或修复其产物）
- 复核时间：2026-10-15（Asia/Shanghai）
- 合同版本：`T1-v1.0`、`T2-v1.0`、`T3-v1.0`
- 收到版本：`agent-developer-mvp-v1.0`

## 结论

**本地受限交付范围：`met_within_mvp_delivery_scope`。** T1、T2、T3 的 Delivery 均按原合同独立重放通过；每项 Growth 记为 `emerging`，因为本轮有原例、独立重放和留出变体，但没有连续周期、真实模型、真实用户、真人专家或生产证据。该结论只关闭本版本的本地确定性夹具门槛，不代表职业胜任、用户价值、生产可靠性、真实检索质量或行业先进性。

复核在新建临时目录完成：复制脚本、合成夹具和冻结的 v12 两个来源文件，运行时为 Node `v24.16.0`、Python `3.14.5`。网络、付费调用、真实模型、外部工具、账户/数据库写入和应用修改均为 0。开发者首次失败、返修文件和复验输出均保留。

## 收到版本冻结与完整性

QA 在运行前冻结了合同、执行脚本、夹具、交接包和 v12 来源；下列关键哈希与收到的 `hashes/` 清单一致：

| 输入 | SHA-256 |
| --- | --- |
| `T1-contract.md` | `071785c103fe1ce4f75ae023867747dfd4e6cc070556811bf1ca588227d076ca` |
| `T2-contract.md` | `2129504b860193cb6d0913e849266a7682b5bc8d92d200ab19ae52f264f9b55d` |
| `T3-contract.md` | `310215fb0c9ce7a63452dfc1421e5b5aeddc037c0fb0b7fc60f6cf0a798ee819` |
| `run-20261015/scripts/runner.mjs` | `a21b12a413f0bede18e6bdd9b87f28540f4fa5c61cd30bb0c54c4876816d2fa7` |
| `run-20261015/scripts/validate-t1-fixture.mjs` | `fdd406115347c5853b713ecbd0b68b1dd1514ba90797b8bd4c2a32accec22087` |
| `run-20261015/scripts/check_evidence.py` | `da9c69a270fff2b3c496a245443ad2619e7270ed848c54f2bb102e74d24ebb9c` |
| `textbooks/v12/c01-control-loop.md` | `f836af7e291cae69328e5e9fceb92c8734046906f6588bfd66edf2e0cf365fd8` |
| `textbooks/v12/e01.md` | `0b430171313c93a7e8b0e183f11297c158ad102bfcce86834f2ef675f194b35a` |
| 原 `run-results.json` | `fd625a559c53ece418ae205da0920e42985584b6c5427c95c9391052e87c3e8f` |
| `D0-evaluation.md` | `e61cf30e02a764a5f123705f7d2c4310d4241a7af9fbd5c9584ea847ded6baf3` |
| `D0-evaluation.json` | `407088bf4221a3c168fd513b4508723e610339f808d8d1b0860c0164dbdc850d` |
| `run-20261015/RUN-REPORT.md` | `776564880f8d920b3cf44c5352a4f77dc306ee180d92aa99215d2c8aa7fb71a6` |
| `run-20261015/RUN-REPORT.json` | `60db5c46d684292c531374dd6ab854f2391958f4beb78580fde1e94fd0a61301` |
| `run-20261015/handoff/T1-HANDOFF.md` | `35e6fb4f05c2fd957ae6b94e56271e16f6dccf3f660e490df5179f2cb8089149` |
| `run-20261015/handoff/T2-HANDOFF.md` | `7094fd29954bdc2590f82710312cc776387dd9d4f32dc87354983f27e81a7260` |
| `run-20261015/handoff/T3-HANDOFF.md` | `b0c0c28cc9b1c52ad8bd6a5370a35071d3ed27bbee856bde489c0a8cbf6de0b3` |
| `run-20261015/handoff/T1-HANDOFF.json` | `e762fbd6f64e6f3d1acd67dbb74b18fffafac8e521009745293b09fc903350b0` |
| `run-20261015/handoff/T2-HANDOFF.json` | `4639755d253cd10c63be0b6ef088a2d6e79142833808ccb2df9dee3b5e8fa3f7` |
| `run-20261015/handoff/T3-HANDOFF.json` | `4cb9a2e0ebb3f8838af7e8eecb5f81ed774024311d3d690d74eb35bfb1652306` |
| `run-20261015/handoff/QA-REPLAY.md` | `db1ae83bf6c7f34a6eee45af01086a5d29121b7e5cdd3de43a1cda3b8598d6e8` |

所有收到的 fixture/source/log 清单逐项比对通过；原应用、教材、账户、数据库和用户记录未写入。QA 复制的独立证据在 [`qa-replay/REPLAY-NOTES.md`](qa-replay/REPLAY-NOTES.md)，不覆盖开发者日志。

## 独立重放结果

QA 用原交接命令在新临时目录运行 runner，退出码为 `0`；去除临时工作区绝对路径后，独立 `run-results.json` 与收到结果完全一致，9 份原始 JSONL 日志哈希逐一一致。

Python 证据检查器在只复制“脚本+夹具”的新目录第一次退出 `1`，原因是输出目录 `hashes/` 未随最小复制清单创建；QA 只创建了该输出目录，没有修改检查器或实现，随后同一命令退出 `0`，报告 `11/11` checks passed。这是交接复制步骤的可复现性提示，不是实现返修，也未删除首次失败输出；原首次失败、返修和复验文件仍在收到目录。

### T1：控制循环

| 验收项 | QA 结果 | 证据与观察 |
| --- | --- | --- |
| `AC-T1-D1` 合同完整 | `passed` | 合同、版本、状态/事件、最大步数、工具权限和停止原因已冻结；日志字段可对应合同。 |
| `AC-T1-D2` 正常轨迹可回放 | `passed` | `t1-normal-001`：`received → planning → tool_call(start/result) → checking → completed`，3 个 Agent 步骤、1 次工具尝试、6 事件，退出码 0。 |
| `AC-T1-D3` 工具失败受控 | `passed` | `t1-tool-failure-001`：2 次工具尝试、`retry_count=1`，最后 `failed/tool_error_after_one_retry`，没有完成伪造或副作用。 |
| `AC-T1-D4` 日志可安全复验 | `passed` | 状态、步骤、工具、attempt、停止原因均可追溯；输入为合成摘要，无密钥或账户数据；独立目录可重放。 |
| `AC-T1-D5` 交接可接收 | `passed` | T1 handoff 列出已/未运行、依赖、首次失败、v0→v1返修、原例复验命令和 QA 步骤；QA 已补原例与留出变体证据。 |

留出变体仅改变任务输入；工具名、错误码和其余合同字段保持不变，仍然只重试一次并进入 `tool_error_after_one_retry`。T1 Delivery=`passed`，Growth=`emerging`。本轮证明的是受限确定性控制流，不能外推真实工具副作用安全或稳定职业能力。

### T2：教材检索与来源核验

| 验收项 | QA 结果 | 证据与观察 |
| --- | --- | --- |
| `AC-T2-D1` 接口字段保真 | `passed` | 命中推荐保留 query/interface、content/index version、section、path、excerpt；冲突事件保留候选 section/path/观察版本；输入 fixture 与哈希可追溯。歧义停止事件记录 candidate_count，完整候选字段仍保存在冻结 fixture；脱离 fixture 的日志本身不重建每个候选，列为后续可观测性改进。 |
| `AC-T2-D2` 正常命中可定位 | `passed` | `t2-hit-001` 实际只读打开 `v12/c01-control-loop.md`，摘录匹配，`source_sha256=f836af…`，事件含 section/version/run_id。 |
| `AC-T2-D3` 无匹配/歧义诚实停止 | `passed` | `no_match`→`needs_clarification/no_match`；`ambiguous`→`needs_clarification/ambiguous_candidates`；均无推荐或补写摘录。 |
| `AC-T2-D4` 版本失配拒绝 | `passed` | `v11`/`retrieval-stub-v0.9` 候选停止为 `source_version_conflict`，未进入 `recommended`。 |
| `AC-T2-D5` 只读和安全 | `passed` | 只读冻结来源和本地 stub；路径白名单、网络/外部/账户访问为 0；实际来源可从事件定位。 |

留出变体将查询改为语义近邻并把有效 `e01` 候选置于首位，QA 实际打开 `v12/e01.md`，摘录核验通过并推荐 `e01`。另一个故意不匹配摘录的保护变体停止为 `excerpt_not_found`、不推荐，说明来源核验不会接受流畅但错误的摘录；路径穿越保护变体停止为 `path_outside_allowed_root`。T2 Delivery=`passed`，Growth=`emerging`。本地 stub 不代表召回率、排序、教材专业正确性、真实模型或学习效果。

### T3：超时、缺证与权限冲突

| 验收项 | QA 结果 | 证据与观察 |
| --- | --- | --- |
| `AC-T3-D1` 超时停止 | `passed` | `t3-timeout-001` 对 25ms never-resolve stub 只等待一次，进入 `timeout/stopped`，`tool_calls_after_stop=0`。 |
| `AC-T3-D2` 缺证停止 | `passed` | 缺 `excerpt` 时进入 `evidence_missing`，列出缺失字段，`recommendation_emitted=false`。 |
| `AC-T3-D3` 权限冲突前置阻断 | `passed` | `external.write` 不在 `read_local_only` 范围内；调用前进入 `permission_conflict`，`tool_calls=0`。 |
| `AC-T3-D4` 保护和可观测 | `passed` | 三类事件顺序可重放，无账户/生产写入、外部消息或密钥泄露。 |
| `AC-T3-D5` 交接和责任 | `passed` | T3 handoff 列出未完成动作、责任岗位、升级对象、复验命令和残余风险；未把开发者 handoff 当 QA 结论。 |

留出变体将缺失字段改为 `source_path`、权限名改为 `identity.write`，仍分别停在 `evidence_missing` 与调用前 `permission_conflict/tool_calls=0`。T3 Delivery=`passed`，Growth=`emerging`。

## 首次失败、返修与复验保留

- runner 首次退出 `1`（URL pathname `%20` 路径问题），`runner-retest.exit=0`；两者均保留。
- T1 夹具 v0 的 `retry_limit=2` 首次校验退出 `1`，v1 改为 `1` 后退出 `0`；v0/v1 和退出记录均保留。
- Python checker 两次字段查找失败（退出 `1`、`1`），最终修正版退出 `0`；所有 stdout/stderr/exit 均保留。
- QA 没有删除、覆盖或改写任何首次失败、旧日志、合同、夹具或运行结果；QA 只新增本报告和 `qa-replay/` 证据副本。

## 双轨与总体限制

| 任务 | Delivery | Growth |
| --- | --- | --- |
| T1 | `passed` | `emerging` |
| T2 | `passed` | `emerging` |
| T3 | `passed` | `emerging` |

`emerging` 只表示本周期在正常/异常及至少一条留出变体中观察到可复现动作；不升级为 `independent_candidate` 或 `stable`。仍未验证：真实模型/供应商、真实外部工具与副作用、生产部署与持续运行、真实用户价值、真人专家审阅、跨周期迁移、职业胜任、成本和行业比较。下一周期若要提升 Growth，需由产品/课程责任人另行冻结真实或更接近真实形状的任务、本人贡献证据、跨周期复验和独立评审。

交接复制清单应补充“先创建 `run-20261015/hashes/` 输出目录”或让检查器自行创建；该低风险可复现性提示交由项目经理/责任岗位处理，不能以报告文字代替未来复验。
