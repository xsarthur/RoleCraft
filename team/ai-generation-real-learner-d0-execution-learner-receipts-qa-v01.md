# AI 生成工程师 D0-03 学习者收据独立 QA v0.1

- QA 身份：独立复核（不执行学习者本人操作、不修改原始收据）
- 收据目录：`ai-generation-real-learner-d0-execution-learner-receipts/`
- 复核时间：2026-10-16（Asia/Shanghai）
- 结论：`not_met`
- 等级结论：不授予 D0、L1 或 L2

## 已核对项

1. `SHA256SUMS` 对目录现有 29 项文件逐项校验通过；`BYTES` 与文件大小一致。
2. 四个场景的 run-1/run-2 stdout 逐字节一致，stderr 均为 0 bytes，退出码均为 0。
3. stdout SHA-256 与收据内记录一致：
   - A-normal：2211 bytes，`c4642281524913457c14032f5e3ae02d2fb66495324b6d64e0c89b28133adf4c`
   - B-tenant-denied：633 bytes，`2c4c40dc2f1e3837348dcc1ad45302b38ee3a483d309df6b0fcedba95a377d04`
   - source-missing：559 bytes，`fb9abbdccd671a82ea9c8c70dbc6e8fdfff8b9b98942d40895ebe5d0ec316fa7`
   - source-conflict：1063 bytes，`dc391a72f16526934eb9c90dd56305b09776b96461eecebcbac766f9c6760cf4`
4. 四个场景的首失败字段分别为 `SOURCE_SCOPE_DENIED`、`SOURCE_MISSING`、`SOURCE_VERSION_MISMATCH`，A-normal 无首失败。
5. A-normal 的两个 claim 均含来源 ID、版本、hash、定位和 claim_type；draft 状态为 `draft_ready_for_review`；`external_action=null`。
6. B-tenant-denied 收据包含 A/B 租户身份、拒绝状态和 `stop_before_draft=true`；输出未包含 B 文档正文，只保留拒绝元数据和未访问声明。
7. source-missing 标记未知并停止；source-conflict 在生成前停止并记录版本/hash 冲突。
8. `frozen-input.sha256` 与 `replay-verify.sha256` 均提供了冻结输入和回放脚本的哈希指针。

## 关键缺口

目录没有以下学习者归属文件：

- `learner-receipt.json`
- `learner-statement.txt`
- `handoff-to-qa.json`
- 独立的 `manifest.sha256`

目录内容只能证明一组可复核的命令、环境和输出收据，不能证明由学习者本人执行。目录没有匿名 learner_id、本人声明、本人执行确认、提交时间与交接签名；目录名、命令脚本和文件哈希不能替代归属证据。`command.txt` 指向共享脚本，且收据目录没有提交者身份绑定。

当前运行证据可以支持“工程回放/收据完整性部分满足”，不能支持“学习者能力已展示”。QA 也没有把代理或本地回放重新标记为学习者执行。

## 后续门槛

补齐学习者本人声明和 `learner-receipt.json`，绑定本收据目录、输入/脚本 hash、run-1/run-2、环境与时间；补齐 `handoff-to-qa.json` 后，QA 再独立重跑四场景和未公开 holdout，随后由接收方从交接包重建最小命令并签收或有据拒收。收据补齐前保持 `pending_learner_execution` / `remain_L0_guided`。
