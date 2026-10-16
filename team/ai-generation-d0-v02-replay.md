# AI生成工程师 D0 正式训练本地确定性替身重放证据 v0.2

- **诊断 ID**：`D0-AI-20261015-001`
- **重放 ID**：`D0-AI-20261015-001-R1`
- **日期/时区**：2026-10-15 / Asia/Shanghai
- **岗位**：AI生成工程师（`AI`）
- **状态**：`in_progress`；本地重放 `passed_local_fixture`；总体结论仍 `not_assessed`
- **记录性质**：这是在原始 D0 后追加的本地确定性替身重放证据，不覆盖原始输入，也不构成能力认证。

## 原始输入保留

原始 D0 记录保持不变，并已复制为本轮首次输入记录：

- 原始 Markdown：`sites/rolecraft/team/ai-generation-d0-v01.md`，SHA-256 `4a97347a91e96c07e2d84e37f22011be15890a5d955da950fd8b1a27c0aeef6d`。
- 首次输入副本：`sites/rolecraft/team/ai-generation-d0-v01-initial.md`，SHA-256 `4a97347a91e96c07e2d84e37f22011be15890a5d955da950fd8b1a27c0aeef6d`。
- 原始 JSON：`sites/rolecraft/team/ai-generation-d0-v01.json`，SHA-256 `069cee385c47889cadcfa32e4605cd368eb089d62c529af629ad443d2f1ebebf`。
- 首次输入副本：`sites/rolecraft/team/ai-generation-d0-v01-initial.json`，SHA-256 `069cee385c47889cadcfa32e4605cd368eb089d62c529af629ad443d2f1ebebf`。

两份 `initial` 副本与对应原始文件哈希一致；原始记录、教材、正式目录、应用和旧 QA 文件均未修改。

## 重放范围与限制

重放命令为：

```text
python3 /private/tmp/ai_generation_d0_fixture_v1.py > /private/tmp/ai_generation_d0_run_v2.json
```

运行的是已有 `F-AI-D0-S1-v1` 本地确定性替身：为虚构租户 A 的 `DEMO-42` 生成带来源的内部草稿，只读取 `doc-A-refund-v1`，拒绝租户 B 的 `doc-B-private-v1`，不发送任何外部动作。运行未使用网络、真实模型、付费 API、真实密钥、真实用户数据或外部写入。

证据哈希：

- 夹具脚本 `/private/tmp/ai_generation_d0_fixture_v1.py`：`fddcf6f9660b5c68079057ffb0fb170aa11e39e0c9379ff9ad95c32be7d39bde`。
- 夹具内容 `F-AI-D0-S1-v1`：`050e9dd30dcf55b680b5e8141dafd669f58ed271cc38e92fa011a1a975d3799f`。
- 本次输出 `/private/tmp/ai_generation_d0_run_v2.json`：`399797452164d129d1e733159545f757bf8ae665981a4728ef5ddda132bd268b`。
- Python 环境：`3.14.5`；平台：`macOS-26.6.2-arm64-arm-64bit-Mach-O`。

## 实际重放结果

实际状态序列为：

`start → tool_called → tool_returned → drafted → checked → handed_off`

序列与预期完全一致。断言结果：

1. **租户 A 边界**：身份租户为 `A`；只读取授权的 `doc-A-refund-v1`。`doc-B-private-v1` 及其 `B-PRIVATE` 内容不在生成结果中。
2. **来源引用**：结果包含 `document_id=doc-A-refund-v1`、`source_version=fixture-source-v1` 和原文引用“退款需复核。”。
3. **无外部动作**：`external_action=null`，交接状态为 `draft_ready_for_review`。
4. **结构化结果**：生成文本为“DEMO-42：退款需复核。”；所有本地断言通过。

因此，本次重放的有限结论是：该确定性本地替身能够复现状态推进、租户边界、来源绑定和无外发动作。它不能证明真实模型生成质量、真实 LangGraph 行为或生产恢复安全。

## 尚未验证与独立复核

以下内容仍未运行或未完成：

- 真实模型调用、模型输出质量、参数效果与费用；
- 真实 LangGraph 安装、版本与 API 兼容性；
- 真实外部工具副作用、发送/发布、生产存储与恢复；
- 未知迁移任务 `U-AI-D0-T1` 及留出变体；
- 内容审校员和测试工程师的独立复核；
- 学习者迁移、用户价值、生产准备度和岗位能力认证。

测试工程师应独立核对本记录中的哈希、状态序列、租户边界、来源引用和 `external_action=null`；内容审校员应核对机制论证及本地证据与真实模型/LangGraph 未验证边界。在独立复核完成前，训练仍是 `in_progress`、总体 `not_assessed`，不得据此授予 L0 以上能力或恢复真实模型/API 训练。
