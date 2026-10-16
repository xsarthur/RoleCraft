# 状态交叉映射

版本：`mvp-0.1`  
用途：把同一任务的生命周期、Delivery、Growth 与课程检查点放在同一张可追溯的状态表中。生命周期是项目协调字段；后三者是独立判断字段，不能互相自动覆盖。

## 状态词

### 任务生命周期（必须按证据推进）

`draft → scoped → in_progress → handoff → independent_review → rework → retested → closed`

允许因发现问题退回，但不得跳过独立复核。`closed` 只表示本版本已完成独立复核和必要复验的关账动作，不表示职业能力、用户价值或生产结果已达成。

### Delivery 状态

`not_started`、`in_progress`、`passed`、`failed`、`insufficient`

它只回答“本版本交付物是否按合同验收条件完成”。`failed` 与 `insufficient` 必须保留缺陷、证据缺口、责任人和下一步；不能改写成 `passed` 来配合关账。

### Growth 状态

`not_started`、`emerging`、`independent_candidate`、`stable`、`unverified`

它只回答“是否有指定能力在相应情境中出现可观察进步”。课程完成、字数、调用次数、自评或一次正常任务不能单独把状态升为 `independent_candidate` 或 `stable`；证据不足时保留 `unverified`。

### 课程检查点结果

`pass`、`pass_with_limitations`、`fail`、`insufficient_evidence`、`not_assessed`

`pass` 表示检查点条件在定义范围内全部满足；`pass_with_limitations` 表示满足但有明确限制；`fail` 表示条件未满足；`insufficient_evidence` 表示无法判定；`not_assessed` 表示尚未检查。该结果只属于课程检查点。

## 层级映射

产品流程只使用 L1–L3 三档成长层级；课程矩阵保留 L0–L4 五档。下表是两套口径的正式对应关系，**不是自动晋级规则**：课程完成或课程检查点通过，仍需满足产品合同、独立复核和对应轨道证据，才能记录产品层级。

| 产品层级 | 产品含义 | 对应课程层级 | 适用条件与边界 |
| --- | --- | --- | --- |
| `L1 跟随` | 能在明确示例、边界和复核下完成练习 | `L1` | 课程 L1 是产品 L1 的学习/证据口径；课程阅读、自评或一次提交不能单独授予产品 L1。 |
| `L2 独立交付` | 能在真实任务中独立完成，并通过反例或第二种情境复验 | `L2` | 必须有真实或隔离真实形状任务、变体/未知情境、交接和独立复核；正常路径一次通过不足以授予。 |
| `L3 设计/优化` | 能提出方案、解释取舍、改进流程并让他人复用 | `L3` | 必须有设计/优化产物、取舍依据、迁移或复用结果和独立复核；课程单元完成不自动授予。 |

课程 `L0` 是**入组准备前置**：用于诊断职责、边界、基础知识和补学路径，**不对应任何产品级别**，也不自动授予产品 L1。课程 `L4` 是需要真实问题、可比行业证据和外部反馈的**产品创造扩展**；它**不自动授予产品 L1–L3**，需要另行建立产品创造合同并取得独立外部证据。

证据不足时，产品 Growth 保持 `not_started`、`emerging` 或 `unverified`，课程检查点保持 `not_assessed` 或 `insufficient_evidence`；不得用课程层级覆盖交付缺陷，也不得用产品层级替代课程检查点记录。

## 逐项映射

下表是每个生命周期状态下各轨道**可出现的状态范围和最低记录**，不是自动赋值规则。真实记录必须引用对应证据账本、版本和复核人。

| 生命周期 | Delivery 轨道 | Growth 轨道 | 课程检查点 | 最低条件与边界 |
| --- | --- | --- | --- | --- |
| `draft` | `not_started` | `not_started` | `not_assessed` | 合同字段尚未齐全；不得宣称交付或能力结果。 |
| `scoped` | `not_started` | `not_started` 或已写基线但仍为 `not_started` | `not_assessed` | 范围、不做项、版本、唯一责任、验收条件和复核人齐全；课程检查可另行安排。 |
| `in_progress` | `in_progress`（尚未完成时）或仍为 `not_started` | `emerging` 或 `not_started` | `not_assessed`；若已检查则按检查证据记录 | 责任岗位执行并追加过程、来源和失败证据；不得把过程记录当独立复核。 |
| `handoff` | `in_progress`；独立复核前不得写最终 `passed` | `emerging` 或 `unverified` | 通常 `not_assessed`，已执行检查则独立记录结果 | 交接包完整，写明环境、版本、限制和最短复现步骤；交接包不是通过证明。 |
| `independent_review` | 复核进行中；完成后由独立复核实际判为 `passed`、`failed` 或 `insufficient` | 由独立证据决定，通常仍为 `emerging`/`unverified`；不得仅凭交付通过升级 | 由课程检查实际判为五种结果之一 | 复核人不得是责任岗位；结论须链接合同版本、验收条件、反例/未知任务和证据。 |
| `rework` | 保留首次结论（通常为 `failed` 或 `insufficient`），返修中可为 `in_progress` | 保留原状态；补证期间可为 `emerging`，不得删除 `unverified` | 保留首次结果；返修后重新检查，不得覆盖历史结果 | 有明确缺陷、责任人、修复版本和截止时间；旧产物、旧账本和失败原因必须保留。 |
| `retested` | 仅按复验结果记 `passed`、`failed` 或 `insufficient` | 仅按新情境和独立证据更新 | 仅按本次检查记 `pass`、`pass_with_limitations`、`fail`、`insufficient_evidence` 或 `not_assessed` | 复验须按原验收条件执行，并链接首次失败；不能因进入 `retested` 自动改轨道状态。 |
| `closed` | 可为 `passed`、`failed` 或 `insufficient`；关账不等于 `passed` | 可为任一合适状态，未有足够证据时必须是 `unverified` | 可为任一五种结果；未检查必须是 `not_assessed` | **必须存在独立复核记录，且返修项已复验或明确登记未完成下一步。** 关闭的是本版本门槛，不是完整职业或产品目标。 |

## 不自动互相覆盖

1. 生命周期变化不会自动写入 Delivery、Growth 或课程结果；每次变化都要由对应责任人依据该轨道证据记录。
2. `Delivery=passed` 不推出 `Growth=stable`，也不推出课程 `pass`、职业胜任、用户满意、专家认可或生产成功。
3. `Growth=stable` 或课程 `pass` 不推出本次 Delivery 合格；课程检查通过也不替代交付复核。
4. `closed` 不得清除失败记录、未验证项、版本差异或限制。若 Delivery 仍为 `failed/insufficient`，必须在关账中保留原因和后续任务。
5. `pass_with_limitations`、`insufficient_evidence` 和 `not_assessed` 都不得在汇总时静默折算为 `pass`。

## 真实结果单列

以下结果是独立字段，不能从上述任一状态推导，且要注明证据类型、版本、执行环境、日期、操作者和限制：

| 独立结果 | 记录要求 |
| --- | --- |
| 真实能力 | 至少覆盖跨情境或未知/反例任务，并有指定独立复核；不足时写 `unverified` 或 `insufficient_evidence`。 |
| 用户结果 | 使用真实用户反馈或真实使用数据；离线、模拟、内部自评不能写成用户结果。 |
| 专家结果 | 记录真实同行/行业专家身份范围、审查对象和结论；AI 自检不冒充专家审核。 |
| 生产结果 | 记录真实生产环境、运行版本、可靠性/成本/质量证据；本地演示或受控练习不能写成生产结果。 |

缺少上述证据时，各字段保持 `not_assessed` 或 `insufficient_evidence`，不因任务 `closed`、课程 `pass` 或内部流程完成而改变。
