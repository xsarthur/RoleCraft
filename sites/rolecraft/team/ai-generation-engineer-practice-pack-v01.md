# AI 生成工程师 D0→L1 补强实训包 v0.1

- 实训包 ID：`AI-PRACTICE-PACK-20261015-01`
- 日期：2026-10-15（Asia/Shanghai）
- 责任岗位：AI 生成工程师（`AI`）
- 独立复核：测试工程师（`QA`）；内容边界复核：内容审校员（`REV`）
- 协调：项目经理（`PM`）
- 状态：`training_specification_ready_not_assessed`
- 适用诊断：`D0-AI-20261015-001`，承接 `ai-generation-d0-v04` 的 P1 剩余缺口

## 1. 目的与边界

这组三个练习把 D0 中尚未由学习者独立证明的能力拆成可重放的本地任务：逐条来源/版本 claim 绑定、重复回调和 durable checkpoint、schema/人工审批/留出迁移。它们是进阶前的隔离证据，不是生产实现、真实 LangGraph/API、真实模型质量、真人审批或岗位认证。

练习只使用合成文档、虚构租户和本地确定性生成器。网络、收费 API、云服务、真实密钥、真实用户数据和外部写入必须关闭；任何 `external_action` 均应为 `null`。学员可以实现小型状态机或 Python 脚手架，但不能把伪代码、一次演示、阅读记录或代理输出当作能力证据。

每个练习都必须保存首失败，按“原例 → 受影响回归 → 留出变体”重放，并由 QA 在作者不改测试结论的情况下独立复验。缺字段、未运行、哈希不一致、停止条件未执行或接收方无法重建时，结论为 `insufficient_evidence` 或 `fail`，不授予 L1。

## 2. 通用练习合同

| 字段 | 本包要求 |
| --- | --- |
| `exercise_id` / `exercise_version` | ID 稳定，版本升级另建文件；不覆盖历史 D0 记录 |
| `owner` / `reviewer` | 学员是唯一执行人；QA 独立复核，REV 只核论证与边界 |
| `mode` | `sandbox_independent`；不接生产账户或真实模型 |
| `input_fixture_hash` | 对规范化 JSON（UTF-8、排序键、无尾换行）做 SHA-256；实际值写入 EvidenceCard |
| `expected` / `failure_injection` | 同时定义正常、边界、失败路径和可观察状态序列 |
| `stop_condition` | 规定何时拒绝生成、暂停交接、请求人工或回滚；停止优先于修复 |
| `submission` | 实现/配置、运行输出、首失败、修复差异、manifest、重放结果和交接说明 |
| `replay` | 至少运行原例两次并比较字节/hash；再运行一个非作者冻结的留出变体 |
| `decision` | `pass_with_limitations` 只代表本地范围；不自动改变 D0 或 L1 状态 |

通用执行顺序：

1. 学员先读任务合同，写出授权工具、来源范围、版本、停止条件和非目标。
2. QA 冻结夹具副本和哈希；学员在隔离目录实现，不读取本项目真实数据库。
3. 学员运行正常、边界和故障注入；保留首失败原始输出，修复不得删除或覆盖。
4. 学员提交 EvidenceCard；QA 先复验原例，再做受影响回归，最后替换一个约束做留出测试。
5. PM 只汇总证据和缺口。三个练习均通过且 D0-01/02 原始学习者诊断、交接和独立能力证据齐全后，才可评估 L1；本包本身不能授予等级。

## 3. 练习一：逐条来源与版本 claim 绑定

### 3.1 合同

- **ID/目标**：`AI-PRACTICE-SOURCE-001` / `v0.1`；补齐“外部来源与版本逐条 claim 绑定”缺口。
- **场景**：内部退款规则助手要生成一条仅供复核的草稿。输出中每个可核验断言都必须绑定到授权文档的 `document_id`、`source_version`、`location` 和内容 SHA-256；不能用整段来源引用掩盖未支持的句子。
- **先修**：D0 v04 的 `retrieve_authorized_doc` 只读契约、输出 schema `ai-generation-d0-output-v3`、来源四元组和租户范围；先能解释事实/推断/未知的区别。
- **夹具**：`F-AI-SOURCE-CLAIM-v1`（规范化 fixture SHA-256：`5dc9f33ed3972dbff5118bc6977a66ccbd376bc6fcc54f15c9b1e26fda8db5e0`），含租户 A 的 `refund-policy-v2`（两条退款规则）、同主题的 `refund-policy-v1`（旧规则）和租户 B 的私有文档。只读工具返回正文、版本、位置和内容 hash；B 文档只能返回拒绝收据。
- **输入**：请求 `run-source-001`、租户 A、目标“给出退款复核草稿”；文档版本清单；预定义 claim 分隔格式（每句一句，不把标题或客套话作为 claim）。
- **限制**：网络关闭；不得搜索未在夹具中的事实；不能读取 B 正文；不发送草稿；最多一次有界重试且只对 `side_effect=none` 工具允许。

### 3.2 预期行为与验收

**正常路径**：先冻结请求和来源版本 → 读取 A 的 v2 → 生成 2–3 条确定性草稿 claim → 每条 claim 恰好一个或明确多个来源引用 → 校验正文 hash 与引用 hash → 状态 `draft_ready_for_review`。claim—source 表中的版本、位置和 hash 必须与工具收据逐字相同。

**边界路径**：请求指定未收录的 v3（索引只有 v1/v2）；工具返回版本不匹配时不得静默改用 v2。应输出 `SOURCE_VERSION_MISMATCH`，状态 `stopped`，不产生草稿或交接。请求包含“如果资料没有说明请标记未知”时，输出可包含 `unknown` claim，但该 claim 不能伪造来源。

**失败注入**：

1. 将一条 claim 的 `source_version` 改为旧 v1，正文仍来自 v2。
2. 修改工具正文但保留旧 hash（内容篡改/过期缓存）。
3. 增加一条没有 `claim_id` 或 `source_refs` 的句子。
4. 请求 B 文档或把 A 文档声明成 B 租户。

每种注入的首失败代码至少分别为 `SOURCE_VERSION_MISMATCH`、`SOURCE_HASH_MISMATCH`、`UNBOUND_CLAIM`、`SOURCE_SCOPE_DENIED`；在失败状态下 `draft`、`handoff` 和 `external_action` 必须为空/null。

**通过条件**：所有正常 claim 通过四元组和内容 hash 检查；四类首失败被保留；拒绝发生在生成/交接前；原例两次输出字节一致；留出变体只替换文档 ID 和版本后仍能拒绝旧 hash、生成正确新绑定，不能依赖固定字符串白名单。

### 3.3 停止、提交和重放

- **停止条件**：来源版本未知、hash 不一致、claim 无来源、租户/权限不符或来源定位不可解析时，立即 `stopped`；不得以“看起来相同”继续生成。
- **提交物**：`claim_source_matrix.json`、确定性输出 JSON、工具/拒绝收据、首失败目录、修复 diff、规范化输入 manifest、`run-1`/`run-2` 输出和 SHA-256、README（说明事实/推断/未知和不做项）。
- **哈希/重放**：对 `fixture_manifest`、每个工具收据、claim 表和最终输出分别哈希；第二次运行必须与第一次同字节。重放从冻结输入重新读取工具结果，不能把上一次最终草稿当输入。
- **留出变体**：`doc-A-shipping-v3` 替换 `doc-A-refund-v2`，同时把一条规则改为“需人工复核”；学员须正确更新 claim 绑定并保留人工复核标记。QA 不预先告诉变体具体文本。
- **接收**：REV 核 claim 是否真的由来源支持；QA 核版本/hash/拒绝和字节重放；任一未测外部来源、真实模型或生产缓存均列 `unverified`。

## 4. 练习二：重复回调、durable checkpoint 与崩溃重放

### 4.1 合同

- **ID/目标**：`AI-PRACTICE-DURABLE-002` / `v0.1`；补齐重复回调去重、持久 checkpoint 和恢复顺序缺口。
- **场景**：只读检索工具返回后，生成流程可能收到同一 `callback_id` 两次，并可能在工具结果已持久化、草稿尚未完成时崩溃。恢复必须只使用最后一个完整且授权的 checkpoint，不创建第二份草稿。
- **夹具**：`F-AI-DURABLE-v1`（规范化 fixture SHA-256：`b186af6b08d2a5bf426a5529e19f4465452b620b98c802b8097b404e15d5efd2`）；事件 `tool_called`、`tool_returned(callback_id=cb-001)`、重复相同回调、故意 payload 不同的重复回调、`crash_after_tool_checkpoint`。本地 checkpoint 目录是临时隔离目录，原子写入由临时文件 + rename 模拟。
- **输入**：`run-durable-002`、工具结果版本 `fixture-source-v1`、输出 schema v3、授权租户 A。无真实队列、数据库、LangGraph 或进程 kill。
- **限制**：所有写入仅限隔离目录；不发送、不发布；callback_id 是幂等键的一部分；只能对 `side_effect=none` 工具重试；不得删除首失败 checkpoint。

### 4.2 预期行为与验收

**正常路径**：写入合同 checkpoint → 写入工具结果 checkpoint（含 callback_id、payload hash、来源四元组）→ 接受第一次回调 → 第二次完全相同回调得到 `duplicate_reused` 并复用同一持久结果 → 生成一个草稿 → 写入最终 checkpoint。结果文件只有一个逻辑 draft。

**崩溃路径**：在工具 checkpoint 成功、部分草稿 checkpoint 不完整时注入崩溃。重启先读取并校验 checkpoint manifest，再写 `manual_stop(reason=incomplete_checkpoint)`；只能从最后一个完整工具 checkpoint 重放，不可信任部分草稿；完成 schema/source/no-send 检查后才可 `draft_ready_for_review`。

**失败注入**：

1. 同一 `callback_id` 第二次 payload hash 不同：首失败 `DUPLICATE_CALLBACK_PAYLOAD_MISMATCH`，停止且不覆盖第一次结果。
2. 在写文件中途留下半 JSON：首失败 `CHECKPOINT_CORRUPT`，不得当作最新状态。
3. 把旧 fixture-source-v0 checkpoint 与 v1 合并：首失败 `CHECKPOINT_VERSION_MISMATCH`，回滚到合同起点。
4. 恢复后直接交接部分草稿：首失败 `INCOMPLETE_RESULT_AFTER_CRASH`，必须保持 hold。

**通过条件**：同 callback_id 只保留一个结果；payload 不同的重复回调被拒绝；所有 checkpoint 可按 manifest 验证；恢复顺序明确为 `restarted → manual_stop → replay_required → replayed → checked → handed_off`；第二次运行无第二 draft，输出和 manifest 字节一致。

### 4.3 停止、提交和重放

- **停止条件**：回调 payload 不一致、checkpoint 无法解析/版本不符、部分结果缺字段、状态来源不明时立即 hold；不得自动“猜测”最新结果。
- **提交物**：隔离 checkpoint 目录、事件日志、每个 checkpoint 的 hash/bytes manifest、首失败和停止收据、恢复后的最终输出、重复回调去重表、README（明确本地原子文件不是生产耐久性）。
- **哈希/重放**：每个事件使用规范化 JSON hash；checkpoint 命名带 `run_id` 和单调序号。原例运行两次后比较每个文件字节和 manifest；第三次从工具 checkpoint 重放，必须得到同一最终 payload hash。
- **留出变体**：只把 callback 顺序改为重复回调先到、原回调后到；崩溃点和其余输入保持不变。学员须仍按幂等键处理，不以到达顺序覆盖已持久结果。
- **接收**：QA 复验原例、篡改 checkpoint 和留出顺序；REV 检查“耐久”措辞没有扩大为生产 RPO/RTO、并发一致性或 LangGraph 证明。

## 5. 练习三：schema、人工审批与单约束迁移

### 5.1 合同

- **ID/目标**：`AI-PRACTICE-GATE-003` / `v0.1`；补齐通用 schema、人工 gate、版本迁移和留出约束的缺口。
- **场景**：生成结果只能在结构化输出通过、来源非空、租户一致且 `external_action=null` 时进入人工复核。历史 v2 checkpoint 需要迁移到 v3；迁移不能删除首失败，也不能偷偷放宽权限。
- **夹具**：`F-AI-GATE-MIGRATION-v1`（规范化 fixture SHA-256：`9002b8bcef99feaa63d88c4c4d8f3eb16d22107b0ceb61e3820240bf709fe364`）；v2 输出缺 `schema_version` 和 `status`，v3 要求 `run_id/tenant/schema_version/answer/source_refs/external_action/status` 以及来源四元组。人工 gate 有 `approval_required`、`reviewer`、`decision` 和 `reason` 字段。
- **输入**：有效 A 租户来源、一个 v2 部分 checkpoint、一个 v3 正常草稿、两个迁移候选（合法新增字段；非法改变 tenant/来源范围）。
- **限制**：人工审批只模拟本地 reviewer 收据，决策只能是 `approve_for_review_only` 或 `hold`；不得写生产审批或发送动作。迁移脚本必须显式列出字段变化和兼容策略。

### 5.2 预期行为与验收

**正常路径**：v2 checkpoint 先被识别为旧版 → 生成迁移计划 → 仅将 v2 明确记录的 `legacy_status=draft_ready_for_review` 映射为 v3 `status`，并补齐 `schema_version=v3`（来源四元组必须已有，不能凭空补）→ v3 schema 校验 → 若 `approval_required=true`，进入 `awaiting_human_approval` → 本地 reviewer 检查租户、来源、无外部动作后作 `approve_for_review_only` → `handed_off`。缺少 `legacy_status` 时必须停止，不能猜测。

**失败注入**：

1. 删除 `status`、清空 `source_refs` 或加入未知字段：`SCHEMA_VALIDATION_ERROR`，停止且不进 gate。
2. 人工 gate 被绕过或 reviewer 收据缺 reason：`HUMAN_APPROVAL_REQUIRED` / `INVALID_REVIEW_RECEIPT`，停止。
3. 迁移候选改变 tenant、source_version 或权限范围：`MIGRATION_SCOPE_VIOLATION`，拒绝迁移并保留旧 checkpoint。
4. v2 checkpoint 没有 `legacy_status`，无法推导 v3 状态：`MIGRATION_MISSING_STATE`，拒绝迁移并保留旧 checkpoint。
5. 在留出任务同时改 schema 版本和审批要求（超过一个约束）：`INVALID_HOLDOUT_CONTRACT`，不得把多变量结果当迁移能力。

**通过条件**：schema 失败先于人工 gate；人工审批是显式状态而非布尔旁路；合法迁移保留来源和 hash，非法迁移拒绝；首失败、旧/新 checkpoint 和人工收据均可重放；留出任务只改一个约束（`human_approval_required_for_handoff: false → true` 或单独版本变更，二选一）。

### 5.3 停止、提交和重放

- **停止条件**：必填字段缺失、来源为空或不匹配、外部动作非 null、人工批准缺少 reviewer/reason、迁移缺少可推导状态或改变权限/租户/来源时，立即停止；不能通过修改量规关闭。
- **提交物**：v2/v3 schema、迁移计划和 diff、validator 输出、人工审批/hold 收据、失败目录、原例与留出 EvidenceCard、哈希 manifest 和接收说明。
- **哈希/重放**：分别哈希输入 checkpoint、迁移后的 checkpoint、validator 输出和人工收据；原例两次必须字节一致；第三次从旧 v2 输入重新迁移，结果 hash 与第一次相同。
- **留出变体**：只把 `approval_required` 从 false 改为 true，其他字段/来源/租户完全相同；学员须停在 gate、等待 reviewer，不得把批准写成生产授权。QA 另选一个只改 schema 次版本的变体检查是否仍保留来源。
- **接收**：QA 核状态顺序、schema 和迁移边界；REV 核“人工审批/认证”措辞；PM 记录哪些能力仍需真实 LangGraph、数据库和真人证据。

## 6. 统一提交结构与独立复验

建议学员在隔离目录提交：

```text
ai-generation-practice/<exercise_id>/
  README.md
  implementation/                 # 可运行的确定性夹具或状态机；不含密钥
  fixtures/fixture.json
  runs/run-1/
  runs/run-2/
  failures/first-failure.json
  repairs/repair-diff.patch
  manifest.json                   # 文件大小、规范化输入和 SHA-256
  evidence-card.json
```

QA 复验必须写明环境、命令、夹具哈希、第一次失败、修复版本、原例回归、留出变体和未测范围。以下任一情况都不能向 L1 推荐：使用真实模型/外部网络；删除或覆盖首失败；输出不含来源/版本/hash；恢复生成第二份草稿；绕过人工 gate；将本地原子 JSON 说成生产 checkpoint；把代理或作者自评当独立能力证据。

## 7. 进阶决策与剩余缺口

三项练习完成并通过独立 QA 后，只能把对应 P1 局部证据标为 `met_within_scope`。还需补齐 D0-01/02 的学习者原始诊断、真实或明确授权的 LangGraph/API 练习、模型质量/成本/限流、真实持久存储/进程恢复、接收方签收和一个不由作者冻结的综合未知任务。PM 收齐这些证据后，才可与产品经理、课程架构师和 QA 共同评估是否达到 L1；本包不改变 `D0 not_assessed / L1 not_granted` 的既有结论。

