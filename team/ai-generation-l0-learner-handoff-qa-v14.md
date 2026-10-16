# AI 生成 L0 学习者交接 v14 独立 QA

- **QA 结论：** `met_with_limitations`
- **范围：** 仅复核 `ai-generation-l0-learner-handoff-v14/` 的确定性本地交付、脚本重跑和证据绑定；不授 L0/D0 等级，不替代真人签收、真实模型/API/生产验证。
- **复核方式：** 将 v14 目录复制到隔离临时目录，执行 `python3 run_bundle.py`，随后执行 `python3 -m json.tool manifest.json`；读取原始交付并逐项重新计算 SHA-256 与字节数。

## 通过项

1. **运行与 stdout 口径**：重跑成功。`A-stdout.txt` 原始 bytes 为 `DEMO-42 draft A\n`，16 bytes，SHA-256 `05ba5f8a1023781b54a71930c2cdec298d8e0383b56d684f05d7f6bc42e31573`；`A-receipt.json` 以同一 stdout path/bytes/hash 绑定。
2. **D0-04 工件完整性**：event trace、tool input/output、checkpoint before/after、failure、recovery 均存在；重算的 bytes/hash 与 manifest 全部一致。事件序列包含 `tool_called → tool_returned → checkpoint_write_failed → recovery_required → replayed → final`，failure 为 `checkpoint_write_failed`，recovery 保留相同幂等键 `U-AI-L0-001` 且 `side_effect: null`。
3. **D0-05 四状态及新 fixture**：baseline、first_failure、regression、holdout 均使用 `document_id=doc-A-shipping-v3`、`source_version=v3`、tenant A、schema v1；matrix 的 path/status/source 字段与对应工件一致，四状态分别为 `tool_returned`、`recovery_required`、`draft_ready`、`recovery_required`。
4. **manifest 与运行记录**：manifest 可被 JSON 工具解析；所有登记工件 path、bytes、SHA-256 与实际文件一致。`manifest_bytes`/`manifest_sha256` 为 null，且 `self_reference_rule` 明确为 `null by construction`，没有不可能的自引用 hash。命令为 `python3 run_bundle.py`，环境记录为 `macOS-26.6.2-arm64-arm-64bit-Mach-O`；原始交付保持 `qa_status= pending`、`human_receipt=pending`、`self_signed=false`、`external_action=null`、L0/D0 `not_assessed`、L1/L2 `not_granted`。

## 限制与后续动作

- **D0-05 独立 holdout 不足（限制项）**：`holdout.json` 与 `first_failure.json` 字节级完全相同（同一 fixture、输入字段和 `recovery_required` 状态）。这证明了四状态文件存在和可重现，但不能证明 holdout 是独立样本或独立生成路径。后续应提供不同的 holdout 文档/版本或独立输入来源，并在 matrix 中记录其独立性。
- **EvidenceCard 逐工件绑定不足（限制项）**：五张 EvidenceCard 的 `artifacts` 数组均重复列出同一组 14 个 D0-04/D0-05/A 工件；它们各自有独立 `evidence_id`，但没有一张卡对一个明确工件或明确断言建立一对一/可解释映射。后续应为每张卡声明其断言、主工件及必要辅助工件，或增加可验证的 `claim`/`primary_artifact` 字段。
- 未发现 hash 漂移、manifest 解析错误、路径逃逸或自引用污染。运行是本地确定性脚本，未调用真实模型、API、云、付费服务、生产环境或真实数据；因此不能推出真实模型质量、学员能力、真人签收或生产可靠性。

### 复验记录

- 隔离重跑：通过。
- manifest 全部工件 bytes/hash：通过（含五张 EvidenceCard）。
- stdout receipt 同口径 hash：通过。
- D0-04 checkpoint/failure/recovery/event 链：通过结构和内容核对。
- D0-05 四状态/matrix/source fixture：通过；独立 holdout：未充分证明。
- 五 EvidenceCards：存在且可解析；逐工件可解释绑定：未充分证明。

责任交接：holdout 独立性与 EvidenceCard 绑定由 AI 生成工程师返修；返修后由测试工程师在新版本复验并保留本报告。
