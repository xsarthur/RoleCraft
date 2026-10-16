# AI 生成工程师 L0 学习者交接 v19 独立 QA

日期：2026-10-16（Asia/Shanghai）  
范围：`ai-generation-l0-learner-handoff-v19`，包括隔离副本 `run_bundle.py` 重跑、五张 EvidenceCard、D0-05 工件、execution-log、manifest。仅作交接质量核验，不授 L0/L1/L2 或职业能力等级。

## 结论

**met_with_limitations**。运行、路径闭合、bytes/SHA、D0-05 holdout 与 first_failure 区分、日志字段及未授等级状态均通过；发现目录/卡片 ID 为 v19，但 manifest、EvidenceCard `version` 与脚本写入值仍为 `v18`，需修正后复验。真实模型/API、恢复行为、真人签收与学习效果未验证。

隔离副本 `/tmp/handoff-v19-qa` 执行 `python3 run_bundle.py` 返回 0。manifest 注册 11 个 JSON 工件；路径存在、bytes 与 SHA256 均匹配，自引用 bytes/SHA 为 null。holdout input/output 内容不同，holdout-output 与 first_failure 文本不同；matrix 路径闭合。五张 EvidenceCard 均存在且引用路径非空，无跨题或旧版本路径引用，ID 均为 V19。execution-log 含 command、time、environment、source_hash 及 source_refs，状态保持 `pending/not_assessed/not_granted`。

## 核查结果

- 隔离重跑与脚本断言：通过（退出码 0）。
- EvidenceCard 五张、路径存在/非空、manifest bytes/SHA：通过。
- D0-05 holdout input/output 与 first_failure 差异：通过。
- matrix、holdout、first_failure 路径闭合及题内隔离：通过。
- execution-log 命令、时间、环境、source_hash：通过（时间为 `local`，环境为 `python3`）。
- 等级与状态约束：通过，未授 L0/L1/L2。
- 版本标识一致性：限制项；包目录及 EvidenceCard ID 为 V19，但 manifest/卡片 `version` 和脚本写入为 V18。

## 复验与限制

未调用真实模型/API，未执行真实崩溃恢复、权限、并发、浏览器、真人签收或学习效果验证；`qa_status` 与 `human_receipt` 仍为 pending。责任人应统一 manifest、EvidenceCard 与脚本版本为 v19 后，重新运行脚本、重算绑定并复验；本记录不授等级或完整能力通过。
