# 软件工程师 D0 诊断与学习者执行合同 v0.1

- `contract_id`: `SW-REAL-LEARNER-D0-20261016-001`
- `diagnostic_id`: `D0-SW-20261016-001`
- `role_id`: `software-engineer`
- `owner`: 软件工程师；学习者本人执行
- `reviewer`: 测试工程师（独立 QA）
- `receiver`: 项目经理或指定接收岗位，须独立签收或有据拒收
- `status`: `pending_learner_execution`
- `target`: `L0` 起点诊断；不自动授予 D0、L1 或 L2
- `version`: `software-engineer-d0-contract-v01`

## 1. 责任边界与执行环境

学习者负责把已确认的产品范围、设计状态和只读客户端接口契约实现为可运行的隔离客户端。D0 只验证客户端状态机、接口消费、来源/版本展示、错误与恢复边界，以及交接可复现性。学习者不得自行改产品范围、视觉规范、模型生成逻辑、账户数据库、检索核心或测试门槛；发现跨岗问题须停下并记录接口缺陷。

D0 使用隔离临时数据和固定替身接口；`real_model=false`、`paid_api=false`、`real_user_data=false`、`production=false`、`external_action=null`。不得上传源码、发布、发送通知、改写真实用户记录或调用生产服务。替身接口结果必须标明为模拟，不能写成真实供应商或真实用户证据。

## 2. 冻结输入与接口合同

冻结版本由产品/设计交接和客户端只读接口组成：

- 客户端版本：`local-workbench-0.11`（具体 checkout、提交或目录哈希须由学习者填写）。
- 目标入口：本地隔离入口；实际地址和启动命令须写入收据。
- 响应字段：`status`、`query`、`items`、`source_id`、`source_version`、`section_id`、`locator`、`quote`、`uncertainty`、`error_code`、`retryable`、`request_id`。
- 允许状态：`idle`、`loading`、`ready`、`no_match`、`needs_clarification`、`error`、`restoring`。
- 客户端必须原样保留来源、版本、定位和不确定性字段；缺字段不得补造答案或引用。
- 接口输入、替身响应、设计状态合同和客户端版本的 SHA-256 必须在执行前冻结并写入 EvidenceCard。

若当前工作区没有可冻结的真实版本或接口交接，学习者必须首个失败停止并返回 `CONTRACT_MISSING`，不自行创造契约。

## 3. 五项 D0 诊断任务

### D0-01 边界复述

说明客户端职责、允许读取的接口、禁止越界的岗位和数据、升级条件；明确客户端不能调用模型、直接访问数据库或把模拟结果写成真实效果。

### D0-02 机制解释

解释一次查询从输入、请求、加载、成功、空结果/歧义、错误到恢复的状态转换；说明来源字段、版本字段、请求幂等/重试假设，以及这些假设未知时如何停止。必须绑定当前接口版本和具体状态合同。

### D0-03 脚手架小任务

在隔离替身接口上实现或修改一个最小客户端状态切片：提交查询、显示 loading、消费一个带来源和版本的成功响应、显示 no-match/clarification/error，并提供重试或返回入口。保留原始变更文件、启动命令、环境版本、输入响应快照和交接说明。不得改写服务响应语义。

### D0-04 首失败识别

使用预置故障夹具，至少覆盖：空响应、schema 缺字段、延迟/超时、旧版本来源、非 2xx 错误、重复请求或恢复刷新。记录预期与实际状态、首个失败点、风险和停止/降级动作。不得删除首失败或用成功截图替代运行收据。

### D0-05 未知迁移预告

对未公开的同能力变体（例如接口版本变化、空结果结构变化或刷新后恢复）写出执行计划、停止条件、所需证据和回滚方式；不预先调参，也不把计划当作执行能力。

## 4. 学习者原始证据包

执行者须提交不可变原始目录，至少包含：

- `learner-receipt.json`：匿名 `learner_id`、合同/诊断 ID、实际命令、checkout/版本、环境、执行时间、网络/外部动作声明；
- `d0-01-answer.md` 至 `d0-05-answer.md` 或等价原始回答/产物；
- `run-1/`、`run-2/`：输入快照、替身响应、stdout、stderr、退出码、浏览器/客户端观察记录和每个场景的 bytes/SHA-256；
- `manifest.sha256`：包内文件清单；
- `learner-statement.txt`：本人声明，说明哪些是本人执行、哪些是模拟、哪些未知；
- `handoff-to-qa.json`：交付目标、依赖、复现步骤、已验证/未验证、风险、QA 接收状态；
- `evidence-cards/*.json`：每项任务一张 EvidenceCard。

缺少匿名 `learner_id`、实际命令、原始输出或本人声明时，状态保持 `pending_learner_execution`；QA 派生副本不得冒充学习者原始文件。

EvidenceCard 必填字段：`evidence_card_id`、`contract_id`、`diagnostic_id`、`task_id`、`run_id`、`fixture_id`、`fixture_sha256`、`client_version`、`input_path`、`input_sha256`、`command`、`environment`、`stdout_path`、`stdout_bytes`、`stdout_sha256`、`stderr_path`、`stderr_bytes`、`stderr_sha256`、`exit_code`、`expected_state`、`actual_state`、`first_failure`、`stop_or_recovery`、`source_refs`、`unknowns`、`external_action`、`unvisited_sources`、`handoff_recipient`、`human_receipt_pending`。

## 5. 首失败与停止规则

首个无法确认产品/设计/接口版本、来源身份、权限范围、响应 schema 或客户端版本的条件为 `CONTRACT_MISSING`，立即停止受影响路径。空响应不得当作成功；schema 缺字段、旧版本来源、非 2xx、超时或恢复失败须保留原始错误并进入受控 `no_match`、`needs_clarification`、`error` 或 `restoring` 状态。客户端不得猜测来源、隐藏错误、无限重试、绕过权限或把旧响应当新版本。

若发现响应含未知字段、来源版本冲突、重复请求未定义或刷新恢复未定义，标记 `unknown` 并升级交接，不自行补全。

## 6. 独立 QA 与接收条件

QA 使用独立临时目录和未公开 holdout，冻结并核对合同、设计交接、接口夹具、客户端版本和学习者输入哈希；重跑原例、故障、修复回归、受影响回归和一个未公开变体。QA 必须核对状态转换、来源/版本原样展示、空/歧义/错误/恢复、首失败、网络与外部动作声明、文件哈希和学习者归属。QA 结论只能是 `met_within_scope`、`met_with_limitations` 或 `not_met`，不得代替学习者作答或签收。

接收方从 `handoff-to-qa.json` 的最小命令在干净临时目录重建客户端，确认版本、依赖、已验证/未验证和复验入口；填写 `accepted` 或有据 `rejected`。没有接收记录时，D0 仍未闭合。

## 7. 评估边界

本合同只产生 D0 起点证据。即使原例通过，也不能证明真实用户理解、真实模型行为、生产可靠性、职业胜任、行业先进性或 L1/L2。L1 还需两个不同隔离夹具、独立复验和未知迁移；L2 还需真实形状隔离任务、失败恢复、完整交接和独立证据。真实用户、生产、外部接口和费用均保持未验证，除非另行授权并取得对应收据。
