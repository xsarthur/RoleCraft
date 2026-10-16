# AI L0 learner handoff 内容审校 v19

## 范围与结论

本次独立内容审校静态读取 `ai-generation-l0-learner-handoff-v19/` 全部工件、`run_bundle.py`、v19 handoff 摘要及 v18 内容审校记录；并在 `/tmp` 可写隔离副本运行 `python3 run_bundle.py`。运行断言通过，且逐项核对 manifest 中登记的字节数与 SHA-256。未调用真实模型、API、云或付费服务，未修改教材、应用、账户数据或既有报告；本审校不授 D0/L0/L1/L2 等级。

结论为 **`reviewed_with_limitations`**，本 handoff 的证据范围结论为 **`not_met`**。

## 核对结果

- **脚本与 manifest：有限通过。** 隔离副本运行 `run_bundle.py` 返回成功，末尾路径存在/非空断言及 V19 字符串断言通过；当前 manifest 登记的 11 个 JSON 工件字节数与 SHA-256 也与文件一致。但脚本只验证文件存在、若干字段和文本差异，不验证来源独立性、EvidenceCard 的题内归属、manifest 完整绑定、执行收据真实性或 source hash 的可追溯性。
- **版本身份：未通过。** 目录和 EvidenceCard ID 使用 `v19`/`V19`，但 handoff JSON、manifest、所有 EvidenceCard 的 `version` 仍为 `v18`。因此脚本成功不能证明它验证的是 v19 版本合同；版本混用会使后续 QA 或接收方错误继承 v18 结论。
- **D0-05 execution-log：部分通过。** 相比 v18，日志有 `command`、`time`、`environment`、`source_refs`、64 位 `source_hash`、expected/observed/pass，且相关文件已登记。可是 `time:"local"` 不是可核对时间戳，`environment:"python3"` 缺精确解释器/版本，未记录运行者、工作目录、产出签名或 source hash 的算法/被哈希对象路径；在目录中没有与 `doc-A-shipping-v3` 对应的独立源文档可复核该 hash。`pass:true` 仍只是工件内声明。
- **holdout 独立性：未通过。** `holdout-input/output` 已补齐并被 manifest 登记，且 output 与 first_failure 文本不同并增加 `outage_duration`；但 holdout 与 first_failure 继续共用 `document_id:"doc-A-shipping-v3"` 和 `source_version:"shipping-v3"`，所谓 `independent` 只出现在文本。没有独立文档、来源快照、未知任务生成记录或隔离签收，不能支持独立 holdout/迁移泛化结论。
- **EvidenceCard 边界：未通过/部分通过。** D0-05 卡片引用了 input、output、matrix、execution-log，路径存在且非空；但卡片只有 evidence_id/version/artifacts，缺题目断言、观察值、通过条件、主体/运行上下文、来源 hash 绑定和产出签名。d0-01、d0-02、d0-04 仍共同引用 `d0-05/first_failure.json`，d0-03 引用 `d0-05/holdout.json`，未说明共享 fixture 的授权、题目归属、隔离边界或防止一题证据充当另一题证据的规则；v18 的跨题污染问题仍在。
- **matrix 与来源绑定：部分静态通过。** `matrix.holdout_path` 与内嵌 holdout 内容对应，first_failure 路径存在；但 matrix 没有独立 source/holdout identity、输入/输出 hash 或执行日志引用，脚本也未比较 matrix、EvidenceCard、manifest 三者的全量一一绑定。
- **状态措辞：通过其有限声明。** handoff 摘要与 manifest 维持 `pending`、`not_assessed`、`not_granted`，没有把脚本通过或静态证据写成学习者等级、真人签收、真实模型效果或职业能力。该措辞应继续保留。

## 必要行动

1. 统一 v19 身份：handoff JSON、manifest、所有 EvidenceCard 的 `version` 改为 v19，并让脚本验证该版本字段而不只验证证据 ID。
2. 为 holdout 提供与 first_failure 不同的文档/来源身份，或明确标注为同源语义 fixture 并撤回“独立 holdout/泛化”表述；记录来源快照、未知任务分配与隔离签收。
3. 补充可核对执行收据：UTC 时间戳、完整 Python 版本、工作目录/运行者、命令输出或产出摘要签名、source hash 算法及其对应源文件路径。
4. 将 EvidenceCard 扩展为逐题断言、预期/观察、通过条件、主体与运行上下文、来源和产出 hash；修正 d0-01/02/04 的共享 first_failure 引用，或登记明确的共享 fixture 规则、授权与题内隔离。
5. QA 在独立可写环境重新运行并逐项复验版本、来源独立性、题内边界、manifest/card/matrix 全量绑定；在此之前保持 D0/L0 `not_assessed`、L1/L2 `not_granted`。

## 限制

未验证真实模型/API、未知迁移、持久性、并发、外部副作用、真人签收、真实学习效果、职业能力、生产部署或成本。隔离副本脚本运行只能证明当前 Python 断言可执行，不能替代独立 QA 或真实学习者证据。
