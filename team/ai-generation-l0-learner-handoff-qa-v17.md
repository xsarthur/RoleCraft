# AI 生成工程师 L0 学习者交接 v17 独立 QA

日期：2026-10-16（Asia/Shanghai）  
范围：`ai-generation-l0-learner-handoff-v17`，包括 `run_bundle.py` 隔离重跑、D0-05 holdout/first_failure、matrix、manifest 与五张 EvidenceCard。仅作交接质量核验，不授 L0/L1/L2 或职业能力等级。

## 结论

**met_with_limitations**（本轮指定的包内结构、注册路径、内容/bytes/SHA 差异与状态约束均通过；真实模型、恢复行为与学习者能力仍未验证）。

隔离副本 `/tmp/ai-v17-qa` 执行 `python3 run_bundle.py` 返回 0。holdout 175 bytes、SHA `a45b0f606fc47c2ce44274eccd01c27cd21c9eb4fcd005db43a90bde13a7e9da`；first_failure 145 bytes、SHA `f97d5d546055db5b3ec021aeae269e029425fea43cd53b48e6d38acc36b38341`，内容与字节均不同。matrix 与 D0-05 EvidenceCard 均绑定包内同一路径。

五张 EvidenceCard 均存在，ID 全部为 V17，无跨题旧版本引用。manifest 工件 bytes/SHA 与隔离副本一致，自引用 bytes/SHA 为 null；状态保持 pending/not_assessed/not_granted，未授等级。

## 核查结果

- 隔离重跑与脚本断言：通过（退出码 0）。
- D0-05 holdout 存在，且与 first_failure 内容、bytes、SHA 均不同：通过。
- matrix/manifest/EvidenceCard 路径闭合：通过。
- 五张卡 ID 均为 V17，未见旧版本或跨题旧引用：通过。
- manifest 哈希完整性及未授等级状态：通过。

## 复验与限制

未调用真实模型/API，未执行真实崩溃恢复、权限、并发、浏览器、真人签收或学习效果验证；`qa_status` 与 `human_receipt` 仍为 pending。若工件变更，需重新运行脚本、重算绑定并独立复验。
