# AI 生成工程师 L0 学习者交接 v15 独立 QA

日期：2026-10-16（Asia/Shanghai）  
范围：`ai-generation-l0-learner-handoff-v15`，包括 D0-05 holdout/first_failure、五张 EvidenceCard、manifest 及 `run_bundle.py` 的隔离重跑。仅作交接质量核验，不授 L0/L1/L2 或职业能力等级。

## 结论

**fail**（D0-05 holdout 注册证据未满足独立 fixture/内容要求；其余结构检查通过）。

隔离副本执行 `python3 run_bundle.py` 成功，实际生成的 `d0-05/holdout-input.json` 为 `doc-A-returns-v9` / `returns policy`，`holdout-output.json` 为同一 returns fixture 加 `recovery_required`；它们与 `d0-05/first_failure.json` 的 `doc-A-shipping-v3` / `shipping policy` 内容不同，说明脚本生成路径本身具备不同 holdout 输入与输出。但脚本没有生成或更新 `d0-05/holdout.json`，该文件仍与 `first_failure.json` 字节级相同（172 bytes，SHA `f0c82d…f4f1aa`），而 `matrix.json` 的 holdout 路径和 manifest 都注册为 `d0-05/holdout.json`。因此包中正式绑定的 holdout 不是独立 fixture，不能据此把 D0-05 作为通过证据。

## 核查结果

- **D0-05 holdout/first_failure：失败**：运行时新生成的 `holdout-input`/`holdout-output` 与 first failure 的 fixture/内容不同；但注册的 `holdout.json` 仍是 first failure 的 shipping fixture，且 matrix 的 holdout 状态为 `recovery_required`、路径指向该重复文件。未形成“实际运行输出 → 注册 holdout 工件”的闭合链。
- **字段断言与 bytes/SHA：部分通过**：holdout input/output 均包含 `document_id`、`source_version`、`text`、`tenant`、`schema_version`，输出另含 `status`；manifest 列出的 24 个非 manifest 工件在隔离重跑后实际存在，bytes/SHA 全部匹配。`manifest_bytes` 与 `manifest_sha256` 均为 null，符合 self-reference null 规则。
- **五张 EvidenceCard：通过（绑定完整性有限）**：d0-01 至 d0-05 均存在，路径、bytes、SHA 均能定位到包内工件并与实际值一致；各卡使用了不同的题目相关工件集合。d0-05 卡绑定新生成的 `holdout-output.json`，但 matrix/manifest 仍绑定旧的 `holdout.json`，存在卡片与 D0-05 状态矩阵不一致；d0-02/d0-04 共享 event-trace 属于跨题证据复用，不能替代每个状态独立运行证明。
- **manifest/状态：通过**：artifact 清单路径均为相对路径，无越界/缺失；self-reference 为 null；`qa_status=pending`、`human_receipt=pending`、`self_signed=false`、`external_action=null`、`l0_status/d0_status=not_assessed`、`l1_decision/l2_decision=not_granted` 保持未授级状态。manifest 的 `command` 与脚本一致。

## 复验与限制

本 QA 在 `/tmp/v15qa` 隔离副本重跑，未修改工作区交接工件；未调用真实模型/API，未运行真实崩溃恢复、权限、并发、浏览器或真人签收。修复条件：让 `run_bundle.py` 写入独立的 `d0-05/holdout.json`（或把 matrix/manifest 明确改绑 `holdout-output.json`），重新计算所有受影响 EvidenceCard、manifest bytes/SHA，并由独立 QA 重跑确认 holdout 与 first_failure 的 fixture、内容、字段和哈希链均不同且闭合。
