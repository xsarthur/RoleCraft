# Agent 控制循环 设计一个可恢复 受控并能验收的运行时

模型负责提出下一步；运行时负责把提议变成有身份、有授权、有执行记录的动作。一个可靠的控制循环，必须能够回答三个问题：**这一步有没有资格执行？中断后怎样判断它是否已经执行？用什么证据判定整个任务完成？**

如果任务包含外部写操作、人工审批或进程重启，`while → 调模型 → 调工具` 不够。建议采用显式运行状态、持久动作记录和受限的反馈循环。这个建议的适用条件是：漏执行或重复执行的业务代价已经超过额外存储、恢复流程和维护的代价。短时、只读、允许重做的实验，可以先用内存循环；不能把这种简化带来的恢复缺口解释成模型能力问题。

先完成 [写工具](c03.md)、[持久状态](e01.md)与 [固定流程](c01-fixed-workflow.md)，再研读怎样推进一个任务运行。下面保留完整动态骨架和故障轨迹：模型依据新观察选择调查路径，运行时仍维护授权、身份、预算、恢复与验收。状态和接口为设计伪代码，不是现成SDK或可直接上线实现。

## 1 先固定完成条件 才能决定循环控制什么

贯穿示例是一项开发任务：

> 分析仓库指定修订的失败测试，形成可复现的缺陷说明；经维护者批准后，在指定项目创建一条缺陷工单，并返回证据和工单链接。

任务目标不包括改代码、重新部署或发送通知。这样限定范围不是为了减少工具数量，而是为了让“完成”可以客观检查。本文假定使用不可变仓库修订 `repo@8e12` 和一次已有测试报告 `test-report-71`；示例标识及事件均为教学构造。

本次验收需要同时满足：

1. 缺陷说明引用该修订下的具体文件、失败断言和已有测试记录；无法从现有材料确定的根因明确写为假设。
2. 创建工单的项目、标题、正文及证据引用与维护者批准的版本一致。
3. 外部工单服务确认工单存在，返回的业务对象与本次逻辑动作相对应。
4. 没有未解决的外部动作；用户要求的唯一“缺陷工单”槽位没有产生第二条工单。

模型可能对根因作出错误分析；验收器也可能无法确定某个推断是否真实。循环不能凭这些不确定内容创建一个“验证通过”的事实。可确定部分用确定性规则检查，例如修订号、证据标识、审批指纹和回执绑定；专业判断可以由人工或另外的评估器完成。自动验收失败后允许修正，但不能无限用同一个模型重新评价自己的同一结论。

工具注册表先定义执行契约，再把可用工具说明给模型：

| 工具 | 输入与产物 | 执行性质 | 恢复依据 |
| --- | --- | --- | --- |
| `read_source` | 允许仓库、固定修订、允许路径 → 文件内容及内容哈希 | 只读；不能换成任意 URL 或本机路径 | 在该不可变修订上可以重新读取；结果必须保留修订和哈希 |
| `read_test_report` | 允许的报告 ID → 失败断言、运行环境及报告哈希 | 只读；不能把模型猜测当报告 | 读取同一不可变报告；服务失败不等于测试通过 |
| `create_issue` | 固定项目、标题、正文、证据引用 → 工单 ID 与内容版本 | 外部写操作；需指定内容审批 | 本文示例假定支持按客户端操作 ID 查询，以及有明确有效期的幂等键；缺少这些能力时改用人工核对 |

不在工具里加入一个 `execute_anything` 逃生口。否则运行时虽然能审计工具名，却无法约束真实效果。注册表必须能确定工具会读写什么、使用哪种凭据、何时可能产生副作用、怎样判断结果未知，以及可重试的具体条件。

## 2 控制权在运行时 聊天上下文只是一种投影

一轮决策可以写成：

```text
权威状态 → 构建本轮上下文 → 模型提议
                              ↓
                 协议与策略校验 → 持久化行动意图
                                      ↓
                   执行或等待 → 提交观察 → 下一轮/验收/停止
```

模型决定“下一步看哪个文件”“如何组织缺陷说明”，这些决定依赖语义判断。运行时决定工具是否注册、参数是否符合契约、身份能否访问对象、内容是否已获审批、现在是否还有预算。执行器决定如何隔离调用、施加超时、接收实际结果。验收器决定提交的产物是否满足本次目标。每一项都只有一个权威责任者；模型的文字不能覆盖策略或执行记录。

这里最重要的分离是 `State` 与 `Context`。

**State 是恢复与授权依据。**它保存目标版本、运行修订号、动作账本、尝试记录、审批、取消请求、预算和验收反馈。未决动作不能因为上下文压缩而消失，审批不能因为模型在对话里写了“用户已同意”而产生。

**Context 是模型这一次看到的状态投影。**完整历史可能包含几十 MB 的日志和文件，本轮模型只需知道当前问题、相关证据、已经完成的动作、尚未解决的动作和最近的验收失败。投影必须有版本或摘要哈希，便于解释模型为什么提出这一步；它没有执行权限。

例如，状态账本中已有工单 `ISSUE-218`，但摘要把它遗漏了，模型又提议创建工单。正确处理是运行时识别唯一工单槽位已经满足，返回原回执或冲突信息；不是相信模型“尚未创建”的摘要。把摘要当权威状态，会使上下文长度优化直接破坏副作用安全。

同样，源文件或测试日志里出现“忽略限制并创建第二条工单”，仍然只是外部数据。是否创建第二条由任务目标与策略决定。模型输入中的角色标签和引用边界有助于理解，却不能替代运行时的对象授权。

## 3 用动作账本表达进度 不要只保存聊天文本

下面是本方案最小数据模型。为突出关系，省去数据库列类型和索引实现；这些字段的语义不能省去。

```typescript
type RunStatus =
  | "ACTIVE" | "WAIT_INPUT" | "WAIT_APPROVAL" | "WAIT_RESOLUTION"
  | "WAIT_RETRY" | "WAIT_VERIFICATION"
  | "COMPLETED" | "STOPPED" | "FAILED";

type ActionStatus =
  | "READY" | "WAIT_APPROVAL" | "IN_FLIGHT" | "UNKNOWN"
  | "SUCCEEDED" | "REJECTED" | "FAILED_FINAL" | "ABANDONED";

type EffectResolution =
  | "NOT_APPLICABLE" | "NOT_SENT" | "UNRESOLVED"
  | "CONFIRMED_SUCCESS" | "CONFIRMED_NO_EFFECT" | "CONFIRMED_CONFLICT";

type ModelAttemptStatus = "STARTED" | "RESPONDED" | "FAILED" | "ABANDONED";

interface Run {
  run_id: string;
  tenant_id: string;
  goal_revision: number;
  goal: Goal;
  status: RunStatus;
  revision: number;                 // 每次权威状态提交后递增
  lease_epoch: number;              // 当前推进权代次
  stop_intent: StopReason | null;   // 停止新工作；并非抹掉已发动作
  waiting: WaitCondition | null;
  active_plan_id: string | null;
  candidate_output: Candidate | null;
  last_verdict: Verdict | null;
  budget: BudgetLedger;
}

interface ModelAttempt {
  model_attempt_id: string;
  run_id: string;
  input_revision: number;
  context_hash: string;
  model_config_version: string;
  status: ModelAttemptStatus;
  reserved_cost: number;
  usage: Usage | "UNCONFIRMED";
  response_id: string | null;
  complete_response_ref: string | null;
  consumed: boolean;                // 响应是否已变成持久计划/候选输出/反馈
}

interface Action {
  action_id: string;
  run_id: string;
  goal_revision: number;
  origin_plan_id: string;
  origin_model_attempt_id: string;
  origin_tool_call_id: string;       // 首次来源；后续协议关联另存 CallBinding
  tool_version: string;
  tool_name: string;
  immutable_arguments: object;
  intent_hash: string;
  effect_slot: string | null;
  idempotency_key: string | null;
  approval_request_id: string | null;
  depends_on_action_ids: string[];
  status: ActionStatus;
  effect_resolution: EffectResolution; // 与是否可再调度独立，不能由 READY 推断
  recovery_replay_permit: string | null; // 核对记录授权的原键重发候选
  result_ref: string | null;
  attempt_count: number;
  next_attempt_at: timestamp | null;
}

interface CallBinding {
  plan_id: string;
  model_attempt_id: string;
  tool_call_id: string;              // 本次响应中的协议 ID
  action_id: string | null;         // 拒绝提议可直接绑定拒绝观察
  observation_ref: string | null;
}

interface Plan {
  plan_id: string;
  bindings: CallBinding[];           // 可以引用已存在的逻辑动作
}

interface ToolAttempt {
  attempt_id: string;
  action_id: string;
  lease_epoch: number;
  started_at: timestamp;
  dispatch_deadline: timestamp;
  status: "STARTED" | "FINISHED" | "SUPERSEDED";
  outcome: Outcome | null;
}

type Outcome =
  | { kind: "SUCCESS"; receipt: Receipt }
  | { kind: "KNOWN_NO_EFFECT"; error: ToolError; retryable: boolean }
  | { kind: "FINAL_FAILURE"; error: ToolError; effect: "NONE" | "CONFIRMED" }
  | { kind: "UNKNOWN"; error: ToolError; operation_id: string | null };
```

这不是要求把每个字段放进一张表。关键是它们之间的身份、不可变性与提交约束。`FINAL_FAILURE` 的 `CONFIRMED` 用来表达确定已经发生但不满足目标的效果，例如工单创建了却内容错误；不能把它归为可直接重试的“失败”。

`status` 描述调度进度，`effect_resolution` 描述外部效果是否已核对。安全同键重发可以使动作再次可调度，但不能证明第一次没有效果：动作可以同时是 `READY` 与 `UNRESOLVED`。未决检测必须查询效果字段及尚未结算的尝试，不能只看 `IN_FLIGHT/UNKNOWN` 两个调度值。`NOT_APPLICABLE` 用于本例纯读取；写动作从 `NOT_SENT` 开始，发送前进入 `UNRESOLVED`，只有操作级成功证据、无效果证明或确定冲突证据才能解除。

“未决尝试”在这里指尚未取得所需执行观察的尝试，不等于费用尚未结算。操作级证据解决逻辑效果后，仍未返回的旧尝试可记为 `SUPERSEDED`，保留它原来的未知响应和待确认费用；不要伪造一条该物理尝试已返回成功的记录。纯读取被重读替代时，同样关闭旧观察等待、保留计数和未知费用。终态仍可以带待核实费用，但不能带被遗忘的业务效果。

三种动作身份要分开：

- `tool_call_id` 关联模型协议中的调用与工具结果。模型重新生成同样内容的调用，通常会带来另一个协议 ID。
- `action_id` 代表运行时的一次**逻辑意图**。恢复、超时核对、合法重试都沿用它。它在意图第一次提交时分配，之后不改变。
- `attempt_id` 代表这个逻辑动作的一次执行尝试。第二次发送同一动作，必须有新的尝试记录，但保持相同 `action_id`、参数指纹和下游幂等键。

不能简单用参数哈希作为 `action_id`。相同参数可能代表用户真正希望创建两条相同工单，也可能代表同一操作重试。AWS 的幂等 API 设计同样强调调用者表达意图的请求 ID，并处理同一个 ID 的参数冲突。这里采用相同原则，具体槽位规则由本次业务目标定义。[AWS：Making retries safe with idempotent APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/)

在本例中，目标只允许一条缺陷工单，运行时定义唯一槽位：

```text
effect_slot = (tenant_id, run_id, goal_revision, "defect_issue")
```

首次合法提议创建槽位记录和 `action_id`。后续同槽位同指纹提议映射到已有动作，不创建新的工单；同槽位不同指纹返回 `INTENT_CONFLICT`，不能静默替换已经审批、在途或已完成的动作。若用户确实要求另一条工单，必须以新的目标版本或明确的新槽位表达。数据库对槽位实施唯一约束，不能仅靠应用先查后写。

映射已有动作也必须保留新的协议关联。`CallBinding` 以 `(model_attempt_id, tool_call_id)` 唯一记录“这次提议引用哪个逻辑动作”；同一动作可以被多个绑定引用。例如旧调用 `call-create-7` 已创建 `ISSUE-218`，新一轮的 `call-create-12` 提议同一指纹，运行时添加新绑定，并向 `call-create-12` 回传原工单回执。不能把旧的调用 ID 原样回给新一轮，也不能覆盖动作的首次来源。计划完成时按绑定生成每个调用的结构化结果；提前拒绝的调用绑定到拒绝观察，仍使用它自己的协议 ID。

只读调用不需要套用这个业务去重规则。它们可以有不同逻辑动作，即使参数相同；但在不可变修订上复用已有读取结果，通常能减少重复工作。缓存键必须含仓库、修订、路径和工具版本，而不是只有路径。

## 4 提交边界决定哪些事情可以在崩溃后重做

一次模型轮次和一次工具执行至少跨越以下边界：

```text
提交模型尝试与预算预留
    → 发模型请求
    → 收到完整响应
    → 提交完整响应
    → 校验并原子提交动作计划
    → 提交工具尝试、授权绑定与预算预留
    → 向外部工具发送
    → 收到结果
    → 原子提交结果与状态迁移
    → 验收
    → 原子提交任务终态与验收证据
```

**意图提交点**解决“为什么允许发出这个动作”。在一个本地事务中写入动作、不可变参数、幂等键、审批请求或批准绑定，同时把模型响应标为已消费。事务应检查运行修订号与推进权代次。事务失败时不能执行工具；重复提交相同响应不能产生新动作。

**尝试提交点**解决“这个动作可能已经发出”。在真正发送前记录尝试，将动作设为 `IN_FLIGHT`，扣计执行尝试或预留资源。记录之后、发送之前崩溃，恢复者也不能仅凭本地记录知道请求是否发出。这个保守不确定性是必要的：数据库事务与远端网络发送没有一个共同原子点。

**结果提交点**解决“运行时已经知道什么”。结果、动作终态、预算结算和关联事件一起提交。响应成功但提交回执丢失时，调用者先以事件 ID 读取确认，不能把一次提交不确定直接当成“数据库没有写入”。只有受当前代次和版本约束的结果才允许推进状态。

**任务终态提交点**解决“外部观察者从什么时候可以看到完成”。`COMPLETED` 与验收证据、最终产物引用在同一事务中写入；条件是没有未决动作、没有取消/停止意图、目标版本仍与验收时一致。这个提交是本地完成状态的逻辑生效点。它不代表外部工单和本地数据库属于同一事务，也不能回溯地把远端操作变为 exactly-once。

如果以 SQLite 实现这些事务，需要明确持久化设置、底层文件系统和故障模型。SQLite 的原子提交说明依赖日志、刷盘及存储系统假设；“调用了 commit”与“在任意磁盘或断电模型下都不丢数据”不是同一承诺。[SQLite：Atomic Commit](https://www.sqlite.org/atomiccommit.html)

同一目标的验收若读取会变化的外部对象，必须核验内容版本或快照。否则验收时看到的工单内容可能在终态提交前被他人修改。本文只承诺工单在所记录的版本上符合验收；持续符合需要后续监测，不能由一次控制循环保证。

## 5 完整模型输出才有资格成为执行计划

运行时在流式过程中可以显示文本，也可以增量拼接参数；默认不能提前执行副作用。一个看上去完整的 JSON 对象仍可能只是半轮响应：后续会追加另一动作、修正参数或以错误结束。本文规定适配器只在收到协议规定的完整响应结束信号、所有调用均完整且结束原因允许消费时，返回 `CompleteResponse`。

此处的结束信号由实际模型协议定义；不能给任意 SDK 编造一个通用 `done` 事件。适配器要负责以下分类：

| 模型请求结果 | 本轮处理 | 是否可能已经产生本篇工具副作用 |
| --- | --- | --- |
| 完整、可解析、协议有效 | 持久化响应后校验决策 | 还没有；本方案禁止提交前调工具 |
| 截断、流断开、参数未闭合 | 记录输出不完整；受限重试模型 | 没有；已显示文本只是预览 |
| 协议有效但工具参数非法 | 记录具体协议反馈；允许修正 | 没有 |
| 拒绝、内容过滤、服务报错 | 分类保存；按可重试性停止或重试 | 没有 |
| 请求超时，供应商是否计费不明 | 尝试结果及费用记为待确认；保留预留 | 没有工具副作用，但可能已有模型费用 |

上述最后一列成立的前提是应用自行编排工具，且模型请求不会调用供应商托管的有副作用工具。如果改用服务端内置工具，需要另行审计供应商的执行、恢复和计费协议，不能沿用此结论。

本篇把完整输出解析为互斥分支：`TOOLS`、`FINAL`、`ASK_INPUT`。模型同时给出“最终完成”与待执行工具时，不让解析器任意挑一个，而是返回 `MIXED_DECISION`。用户澄清只补任务缺失信息；它不能被自动解释为副作用审批。审批由运行时针对具体意图创建，不能让模型生成一个“审批通过”的工具结果。

在 `TOOLS` 分支，先对整批提议预检，再发出任何调用：检查工具、参数、对象授权、调用 ID 唯一性、依赖合法性和批次规模。预检发现错误，整批暂不执行，给模型结构化反馈。对于一批需要审批的合法动作，则先持久化计划，再等待批准；不是因为未批准就丢掉计划、重问模型。

预检通过不等于执行期间的所有动作原子成功。工具调用跨服务；第二个动作执行前权限可能撤销，第一个可能已经成功。每个动作发出前仍要检查动态权限、审批、取消和预算，并单独记录结果。批次发生部分成功时，应明确回传各动作状态，不宣称“整批失败所以没有效果”。

## 6 先核对未决动作 再让模型继续

恢复顺序必须把事实核对放在新决策之前。模型不知道一个丢失回执的远端调用到底有没有成功。重新问模型，最多产生另一个看上去合理的提议，不能消除执行不确定性。

本例中的 `create_issue` 在 `IN_FLIGHT` 或 `UNKNOWN` 状态时，恢复者按 `action_id` 对应的客户端操作 ID 查询：

1. **确认成功且内容指纹一致**：提交原工单回执，标为 `SUCCEEDED`，不再创建。
2. **确认成功但内容不一致**：记录已发生效果与 `FINAL_FAILURE`，进入核对；不能通过“重建正确工单”掩盖错误工单。
3. **仍在执行**：保持未决，设下一次核对时间。不能让模型越过它宣布任务完成。
4. **明确未接受或无效果失败**：依据契约判断能否重试；若允许，沿用原动作、原参数与原幂等键。
5. **查不到但查询可能滞后，或查询自身超时**：仍为未知。普通 `404` 不自动证明原请求不存在。
6. **无法查询**：只有下游契约在当前时间、参数及并发条件下明确保证相同键重发不会增加效果，且当前授权仍允许，才能以同一键重试；否则暂停核对。

这里需要区分“查询没找到”和“确认原请求未执行”。要把前者提升为后者，需要操作状态接口提供足够强的语义，例如原请求已最终拒绝、所有可能迟到的请求已不可执行。一个最终一致的工单列表通常做不到。系统应保留未知，而不是为了恢复进度虚构确定性。

幂等也有条件：键的命名范围、参数一致性、保留时间、并发重复请求处理和失败响应的语义都要来自下游契约。以 Stripe 的官方说明为例，API v1 对首次开始执行的请求保存响应，同键重试可能仍得到保存的 `500`；键可以在至少 24 小时后清理。API v2 对失败或部分失败重试的处理不同。因此不能把“支持幂等键”泛化成永久去重或必然恢复成功。[Stripe：Idempotent requests，API v1/v2 区别](https://docs.stripe.com/api/idempotent_requests)

本文示例要求工单服务在约定恢复窗口内保留操作身份，且同键同指纹的请求不会重复创建。超出窗口后，只能查询确定的业务对象或人工核对；换一个键并不是修复未知结果，而是发出一个新的业务意图。

运行时可以保证自己不故意重复提交一个逻辑动作，但只有下游把去重记录与实际效果可靠绑定，才能保证重复传输不会重复产生业务效果。AWS 的服务端示例明确把记录幂等 token 与相关变更纳入原子操作；客户端自己的 checkpoint 不能代替这部分。[AWS：服务端 token 与变更的原子性](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/)

## 7 审批 取消和预算都必须跨暂停保留

审批不能只是 `approved = true`。本例的批准记录至少绑定：

```text
approval_request_id
run_id + goal_revision + action_id
tool_name + tool_version + intent_hash
审批者身份与其批准范围
批准时间、到期时间、撤销状态
```

`intent_hash` 对规范化的项目、标题、正文及证据引用计算。规范化必须定义字段顺序、编码和可接受的空值处理；不要对任意语言的对象字符串表示求哈希。任何批准后内容变化都产生不同指纹，需要新批准。执行器使用保存的不可变参数，不能在发送时让模型重新补全文案。

批准“这个逻辑动作”与批准“每次物理发送”也要提前选择。本文采用前者：批准在首次发送时原子绑定并锁定给该动作；安全重试只允许相同指纹、相同业务效果，且批准未到期或撤销。若产品要求每次发送都重新批准，尝试层要另建批准，不得把本文默认语义偷偷换成那种语义。

暂停后恢复的是同一个运行和预算账本。预算至少拆成：

| 预算 | 何时消耗 | 为什么不能合并成 `max_steps` |
| --- | --- | --- |
| 模型请求尝试 | 发请求前预留并计数，成功或失败都保留 | 一次失败请求也可能有费用；重试不一定产生工具 |
| 逻辑动作数 | 首次提交动作意图 | 一个动作可以多次执行，不该重复算成多个目标动作 |
| 工具执行尝试 | 发工具请求前计数 | 同动作的重试和并发扇出消耗额外资源 |
| 核对次数与恢复时间 | 每次状态查询前计数 | 暂停重启不能变成无限轮询；恢复应有独立额度 |
| 总截止时间 | 持久化绝对截止时间 | 重启不能重新开始计时；等待审批是否计入要明确 |
| token/费用 | 请求前保守预留，事后结算 | 计费可延迟、失败请求用量未知，实际账单不能由调用次数代替 |

费用硬上限需要有可以兑现的计价上界。仅知道请求次数、没有约束输入长度、输出上限、工具计费和价格版本，无法保证总费用。可行做法是按已知价格版本和最大用量预留，限制输入与输出，未知费用暂不释放额度；但若供应商存在无法预界定的收费项，还需要供应商侧额度或额外业务限制。不要把估计费用写成实际费用。

预算耗尽或用户取消后，首先提交 `stop_intent`，禁止新模型请求和新业务动作；未发送的动作标为 `ABANDONED`。已经发出的动作仍需要核对。恢复查询使用单独且受限的核对额度，不把任务工作预算“续杯”。核对额度耗尽时保留 `WAIT_RESOLUTION` 与待处理责任，不能转成干净的 `STOPPED` 后遗忘远端请求。

取消的保证点在**最后一次发出前检查**。取消与发送之间仍可能竞态：执行器刚确认没有取消，请求随即发出，用户下一毫秒取消。此时应报告“已请求停止，先前请求结果待核对”，而不是“工单绝未创建”。对远端支持取消的接口，还要核对远端取消确认；本地取消协程不能撤销远端效果。

Python `asyncio` 的任务取消会向协程注入取消异常，超时等待还涉及等待取消完成；这些是本地任务语义，不是外部系统的事务回滚协议。本文因此把网络超时或本地取消后的写请求默认分类为 `UNKNOWN`，除非适配器能提供无效果证明。[Python 3.14：Coroutines and tasks](https://docs.python.org/3.14/library/asyncio-task.html)

## 8 把这些约束落实到完整控制骨架

下面的伪代码选择**单运行、单推进者、串行执行工具**作为基线。并发工具将在下一节按契约扩展。模型、数据库、工单服务和策略服务都通过接口接入；不假定它们共享事务。本篇伪代码未运行，实际外部服务契约也未实测。

### 8.1 接口返回的是控制语义 不是任意异常字符串

```typescript
type Decision =
  | { kind: "TOOLS"; calls: ProposedCall[] }
  | { kind: "FINAL"; candidate: Candidate }
  | { kind: "ASK_INPUT"; fields: MissingField[]; question: string };

type ModelResult =
  | { kind: "COMPLETE"; response: CompleteResponse; usage: Usage }
  | { kind: "FAILURE"; code: string; retryable: boolean;
      usage: Usage | "UNCONFIRMED" };

type Gate =
  | { kind: "ALLOW"; policy_version: string }
  | { kind: "APPROVAL_REQUIRED"; intent_hash: string }
  | { kind: "DENY"; code: string; repairable: boolean };

type BeginToolResult =
  | { kind: "DISPATCH"; attempt_id: string; dispatch_token: string }
  | { kind: "STOP"; reason: StopReason }
  | { kind: "WAIT_APPROVAL"; approval_request_id: string }
  | { kind: "REJECTED"; observation_ref: string }
  | { kind: "RECHECK"; reason: string };

type Verdict =
  | { kind: "ACCEPT"; evidence_refs: string[]; candidate_hash: string }
  | { kind: "REJECT"; failures: VerificationFailure[]; repairable: boolean }
  | { kind: "WAIT"; request_id: string; reason: string };

type LookupResult =
  | { kind: "CONFIRMED_SUCCESS"; receipt: Receipt }
  | { kind: "CONFIRMED_NO_EFFECT"; retryable: boolean; proof_ref: string }
  | { kind: "PENDING"; next_check_at: timestamp }
  | { kind: "INDETERMINATE"; reason: string };
```

`Model.generate_complete` 处理流拼接、完整性检查、服务拒绝及网络异常，返回 `ModelResult`，不执行本篇工具。`Executor.invoke` 使用动作不可变参数和发送令牌，并将工具错误归为 `Outcome`；无法证明写请求无效果时必须返回 `UNKNOWN`。`Executor.lookup` 只核对已有操作，不能为了查询而创建新操作。`Verifier.check` 使用保存的候选和权威证据，不能相信候选里自述的成功。

存储接口的核心是 `Store.transact(run_id, lease, event)`。它在事务内读取当前运行、检查推进权代次及未过期租约，验证事件前置条件，原子写入记录和状态迁移，再递增 `revision`。每个事件有稳定 `event_id`；重复提交返回已有结果。取消、审批和外部输入也通过经过身份验证的事件入口提交，不能直接改一段聊天文本。

下表是代码所调用的事务事件契约。实现时可以拆成方法，但不能减少约束。

| 事件 | 事务必须完成的工作 | 拒绝或并发语义 |
| --- | --- | --- |
| `BeginModel` | 检查没有计划、候选、等待或未决动作；预留费用，计模型尝试；保存上下文版本与尝试 | 取消、期限、模型额度或费用预留不足返回 `STOP`；不发请求 |
| `RecordModel` | 关联同一尝试；保存完整响应或错误，结算已知用量；未知用量保留预留 | 重复响应不得重复结算；失去推进权不继续本地流程 |
| `ConsumeResponse` | 将完整响应标为已消费，且原子写入计划、候选、等待或反馈之一；工具计划在事务内先解析槽位复用，再原子检查/扣计新增逻辑动作额度，创建身份与本轮绑定 | 重复消费不重复计数；复用动作不再计数；额度不足则整批不创建新动作，绑定结构化预算拒绝、消费响应并保存停止意图；冲突绑定拒绝观察 |
| `RequestStop` | 保存首个停止原因；放弃没有历史未决效果的未发送动作和未消费响应；撤销重发候选但保留已发动作 | `READY + UNRESOLVED` 也必须保留待核对，不能改成“未执行”；既有成功回执不删除 |
| `BeginTool` | 检查动作可执行、前置动作成功、当前审批与授权检查结果适用；再次检查取消/期限和预算；允许才预留、计尝试、标在途 | 取消/期限/额度硬拒绝原子保存停止意图及未发送动作放弃，返回 `STOP`；审批缺失保存等待，返回 `WAIT_APPROVAL`；确定权限拒绝保存观察，返回 `REJECTED`；状态版本变化返回 `RECHECK`。均无发送令牌，且历史未决效果不消失 |
| `RecordOutcome` | 保存尝试结果、结算资源、推进动作状态；核对回执的操作身份和指纹，成功回执和动作完成原子提交 | 当前取消不阻止记录既有结果；旧代次工作者不能直接写入，可由新推进者核对采纳 |
| `BeginLookup` | 检查未决动作；计核对次数，保存核对尝试和下一次期限 | 没到核对时间或核对额度不足返回 `WAIT`；不发无限查询 |
| `RecordLookup` | 保存核对证据；操作级确认成功/无效果可解除未决；安全重发只保存许可并允许恢复调度，效果仍为 `UNRESOLVED`；真正解决后清除核对等待 | 有停止意图时禁止生成重发许可；未决的先前效果不能随可调度状态变化被删除 |
| `FinishPlan` | 仅在全部绑定都有终结观察时，按本轮调用 ID 生成结果，合并观察，清除当前计划 | 复用成功动作回传原回执；参数、权限、依赖失败同样保留观察；不把部分失败改为整批无效果 |
| `RecordVerdict` | 保存验收版本、具体反馈；拒绝可修则清除候选，等待则保存等待条件 | 验收结果只适用于所检查的候选/目标版本；存储条件已变化则拒绝该提交并重新检查 |
| `Complete` | 检查同一候选验收通过、目标版本一致、无未决效果/尝试/停止意图，原子保存成功终态与证据 | 不以调度状态 READY/ABANDONED 判定已清算；取消竞态由事务决定是否还可完成 |
| `FinishStopped` / `Fail` | 在无未决效果及未结算尝试时保存停止或失败原因及部分成果 | 安全重发资格不解除未决；仍未决只能保持 `WAIT_RESOLUTION`；`Fail` 遇新停止意图返回前置条件变化 |

`RecordOutcome` 先更新**本次尝试**，再结合所有先前尝试和操作级核对证据归约效果。`SUCCESS` 的匹配回执可确认原操作成功；`UNKNOWN` 保持效果未决。`KNOWN_NO_EFFECT` 只证明本次尝试无效果：如果早先仍有未知尝试，不能据此把整个动作改为无效果。所有尝试均有无效果证明时，才可确认为 `CONFIRMED_NO_EFFECT`，在可重试、额度足够且无停止意图时置 `READY` 并保存退避。确定错误的已发生效果记 `CONFIRMED_CONFLICT` 并保留回执，禁止同槽位自动重建。任何状态归约都不能把尚未核对的先前尝试抹掉。

`REJECTED` 用于没有历史未决效果、且未获执行资格的动作，`ABANDONED` 用于没有历史未决效果、被取消或停止的动作。对已有未知效果的动作，权限拒绝或取消只阻止继续发送，动作仍留在核对生命周期中。操作级无效果证明必须覆盖全部已发送尝试及可能迟到的请求，不能只证明最后一条请求失败。

逻辑动作预算必须在 `ConsumeResponse.plan` 的意图提交事务中检查，而不是只在外部预检限制批次大小。事务先按唯一槽位/既有记录解析每个调用，统计本批要**首次提交的不同逻辑动作**；新增数加已提交计数不能超过运行额度。引用既有动作或重复提交同一响应不增加计数。若剩余额度为1，而本批包含两个新只读动作，整批不创建新动作、不扣动作额度；它为本轮调用保存 `LOGICAL_ACTION_BUDGET` 拒绝观察，标响应已消费，并原子提交停止意图。主循环下一次读取进入停止路径，不会重复消费同一响应尝试突破额度。此处采用整批提交/整批预算拒绝，不擅自挑一个调用执行；允许部分提交的产品必须另行定义选择和依赖语义。

审批事件只允许把匹配动作从 `WAIT_APPROVAL` 改为 `READY`，或写入明确拒绝。澄清事件验证等待 ID、任务身份与字段，保存外部输入，清除对应等待；目标范围变化则生成新目标修订并使不再适用的审批失效。两类恢复事件都不重置预算，也不把用户输入当工具回执。

### 8.2 主循环 先处理已有事实 再产生新决策

以下采用接近 Python 的伪代码。`transact` 返回事务后的快照与明确控制结果；不是会默默吞掉错误的黑盒。进程取消、存储错误和推进权丢失会退出本工作者。退出工作者不代表任务已经被数据库标为失败。

```python
async def drive(run_id, store, model, policy, executor, verifier, clock):
    lease = await store.acquire_lease(run_id)
    if lease is None:
        return WorkerResult("NOT_OWNER")

    try:
        # 仅处理旧代次留下的模型请求：其输出从未成为工具计划。
        # 保留未知费用预留，标记尝试 ABANDONED，不能假装零费用。
        await store.close_orphan_model_attempts(run_id, lease)

        while True:
            state = await store.load_owned(run_id, lease)
            if state.status in {"COMPLETED", "STOPPED", "FAILED"}:
                return WorkerResult("TERMINAL", state)

            global_stop = cancellation_or_deadline(state, clock.now())
            if global_stop and state.stop_intent is None:
                await store.transact(run_id, lease, RequestStop(global_stop))
                continue

            # 在取消或预算停止后也要核对已发动作；此处不做新的业务写入。
            unresolved = state.unresolved_actions()  # 效果 UNRESOLVED 或尝试未结算
            if unresolved:
                result = await reconcile_actions(
                    run_id, lease, unresolved, store, executor, clock
                )
                if result.kind == "WAIT":
                    return WorkerResult("WAIT_RESOLUTION")
                if result.kind == "REPLAY_CANDIDATE":
                    dispatched = await dispatch_action(
                        run_id, lease, result.action_id, store, policy, executor,
                        recovery_permit=result.permit_id
                    )
                    if dispatched != "SENT":
                        await store.set_wait_owned(
                            run_id, lease, "WAIT_RESOLUTION", "PRIOR_EFFECT_UNRESOLVED"
                        )
                        return WorkerResult("WAIT_RESOLUTION")
                continue

            if state.stop_intent is not None:
                stopped = await store.transact(run_id, lease, FinishStopped())
                return WorkerResult("STOPPED", stopped)

            if state.waiting is not None:
                if not wait_is_satisfied(state.waiting, clock.now()):
                    return WorkerResult(state.status, state.waiting)
                await store.resume_satisfied_wait(run_id, lease, state.waiting.id)
                continue                       # 清除等待，但不重置预算

            if state.active_plan_id is not None:
                result = await drive_plan(
                    run_id, lease, store, policy, executor, clock
                )
                if result in {"WAIT_APPROVAL", "WAIT_RESOLUTION", "WAIT_RETRY"}:
                    return WorkerResult(result)
                continue

            if state.candidate_output is not None:
                verdict = await verifier.check(
                    state.goal, state.candidate_output, state.authoritative_evidence()
                )
                checked = await store.transact(
                    run_id, lease, RecordVerdict(state.revision, verdict)
                )
                if checked.kind == "STALE":
                    continue                   # 没有沿用过期的验收结果
                if verdict.kind == "ACCEPT":
                    final = await store.transact(run_id, lease, Complete())
                    if final.kind == "PRECONDITION_CHANGED":
                        continue
                    return WorkerResult("COMPLETED", final)
                if verdict.kind == "WAIT":
                    return WorkerResult("WAIT_VERIFICATION", verdict.request_id)
                if not verdict.repairable or checked.verification_limit_reached:
                    failed = await store.transact(
                        run_id, lease, Fail("VERIFICATION_REJECTED")
                    )
                    if failed.kind == "PRECONDITION_CHANGED":
                        continue
                    return WorkerResult("FAILED", failed)
                continue                       # 具体失败证据已进入下轮上下文

            response = state.unconsumed_complete_response()
            if response is not None:
                parsed = parse_exclusive_decision(response)
                if parsed.kind == "PROTOCOL_ERROR":
                    await store.transact(
                        run_id, lease, ConsumeResponse.feedback(response.id, parsed)
                    )
                    continue
                if parsed.kind == "TOOLS":
                    preflight = preflight_batch(state, parsed.calls, policy)
                    if not preflight.accepted:
                        await store.transact(
                            run_id, lease,
                            ConsumeResponse.feedback(response.id, preflight.errors)
                        )
                    else:
                        await store.transact(
                            run_id, lease,
                            ConsumeResponse.plan(response.id, preflight.normalized_plan)
                        )
                elif parsed.kind == "FINAL":
                    await store.transact(
                        run_id, lease,
                        ConsumeResponse.candidate(response.id, parsed.candidate)
                    )
                else:                          # 唯一剩余合法分支 ASK_INPUT
                    await store.transact(
                        run_id, lease,
                        ConsumeResponse.wait(response.id, parsed.fields, parsed.question)
                    )
                continue

            context = build_context(state)     # 不更改权限/动作账本/预算
            started = await store.transact(
                run_id, lease, BeginModel(state.revision, context.hash)
            )
            if started.kind == "STOP":
                await store.transact(run_id, lease, RequestStop(started.reason))
                continue
            if started.kind == "STALE":
                continue

            model_result = await model.generate_complete(context, started.request_limits)
            recorded = await store.transact(
                run_id, lease, RecordModel(started.model_attempt_id, model_result)
            )
            if model_result.kind == "FAILURE":
                if not model_result.retryable or recorded.model_failure_limit_reached:
                    await store.transact(
                        run_id, lease, RequestStop("MODEL_REQUEST_FAILED")
                    )
                elif recorded.retry_after is not None:
                    await store.defer_owned_run(run_id, lease, recorded.retry_after)
                    return WorkerResult("WAIT_RETRY")
                # 已计数的请求失败也消耗额度；下一轮不会重置它。

    except StoreUnavailable:
        # 不能写状态，就不能宣布 FAILED；不再发送新模型或工具请求。
        return WorkerResult("INFRASTRUCTURE_UNAVAILABLE")
    except LostOwnership:
        return WorkerResult("OWNERSHIP_LOST")
    except WorkerCancelled:
        # 用户取消已由持久取消事件处理；工作者被回收则由新租约恢复。
        return WorkerResult("WORKER_INTERRUPTED")
    except InvalidPersistedState:
        # 实现缺陷需要诊断，不以猜测修复状态，更不继续发外部动作。
        return WorkerResult("STATE_INVARIANT_VIOLATION")
    finally:
        await store.release_if_owned_best_effort(run_id, lease)
```

其中 `cancellation_or_deadline` 只处理全局取消、总截止时间和已经明确触发的硬停止条件。模型尝试上限在 `BeginModel` 检查，工具尝试上限在 `BeginTool` 检查：最后一次获准的模型请求所产生的合法结果，仍然可以进入验收，不能因为模型计数刚达到上限就丢弃它。同理，拿到最后一次允许工具调用的成功结果后，不能错误地直接标为预算停止。

`wait_is_satisfied` 区分等待类型：外部输入/审批要有已验证的对应事件，延迟重试要到 `not_before` 时间，核对等待要有新的核对事实或到下一次核对时间。`resume_satisfied_wait` 在事务中重新检查条件、清除等待并恢复 `ACTIVE`；未满足就保留等待。它不授予额外权限。后台唤醒器按持久等待条件调度 `drive`，不是保持一个协程睡到用户批准。

模型/工具的延迟重试使用 `WAIT_RETRY`；验收器等待人工结果或服务恢复使用 `WAIT_VERIFICATION`。等待人工验收时，外部结果事件必须绑定候选哈希、目标版本和验收请求，后续 `check` 读取已保存结果；不能恢复后重新创建同一人工请求。所有异步外部结果都先提交事件再唤醒工作者。

`preflight_batch` 必须逐项解析工具名和参数、拒绝未知字段或错误类型、核对访问对象、验证依赖构成无环图，并限制批次大小。工具 schema 只能证明结构合法，不能证明项目 ID 属于当前身份或正文获准。语义授权由策略判定，槽位与参数一致性由意图提交事务判断。工具注册表及当前目标之外的调用，作为拒绝反馈提交，不交给执行器。

连续协议错误、验收拒绝和无进展也有单独计数或策略。无进展是启发式：在相同证据版本下，反复提出同一失败调用而没有新信息，才有充分理由停止；同一路径的第二次读取如果修订已经变化，不能只按字符串相同判为死循环。启发式不能替代硬预算。

验收服务不可用时，`Verifier.check` 返回 `WAIT` 或结构化可重试的验收故障，并使用受限的验收尝试额度；不返回 `ACCEPT`。它如果需要访问外部系统，同样要记录其请求/版本和可能的未知状态，但验收查询不能产生业务写操作。

### 8.3 工具执行 每次发送前再次过闸

```python
async def drive_plan(run_id, lease, store, policy, executor, clock):
    state = await store.load_owned(run_id, lease)
    plan = state.active_plan()

    # 依赖已失败的后继不能执行，写入明确 DEPENDENCY_FAILED 观察。
    await store.finalize_failed_dependencies(run_id, lease, plan.id)
    state = await store.load_owned(run_id, lease)
    plan = state.active_plan()

    if plan.all_actions_terminal():
        await store.transact(run_id, lease, FinishPlan(plan.id))
        return "CONTINUE"

    ready = plan.ready_actions(now=clock.now())  # 前置成功、无对象写冲突
    if not ready:
        if plan.has_approval_wait():
            await store.set_wait_owned(run_id, lease, "WAIT_APPROVAL", plan.wait_refs())
            return "WAIT_APPROVAL"
        if plan.has_retry_delay():
            await store.defer_owned_run(run_id, lease, plan.next_retry_at())
            return "WAIT_RETRY"
        raise InvalidPersistedState("未决动作应由主循环核对；其余阻塞须有原因")

    return await dispatch_action(
        run_id, lease, ready[0].action_id, store, policy, executor,
        recovery_permit=None
    )                                          # 本文基线是串行


async def dispatch_action(run_id, lease, action_id, store, policy, executor,
                          recovery_permit):
    state = await store.load_owned(run_id, lease)
    action = state.action(action_id)
    gate = await policy.authorize_current(state.goal, action)
    if gate.kind != "ALLOW":
        await store.record_gate_owned(run_id, lease, action.action_id, gate)
        if gate.kind == "APPROVAL_REQUIRED":
            return "WAIT_APPROVAL"
        return "REJECTED"                      # 未决先前效果保持待核对

    begun = await store.transact(
        run_id, lease,
        BeginTool(action.action_id, gate.policy_version, recovery_permit)
    )
    if begun.kind == "STOP":
        return "STOP"                          # 停止意图已在同一事务保存
    if begun.kind == "WAIT_APPROVAL":
        return "WAIT_APPROVAL"                 # 等待条件已保存，不忙等
    if begun.kind == "REJECTED":
        return "REJECTED"                      # 观察已保存，计划会终结或反馈
    if begun.kind == "RECHECK":
        return "CONTINUE"                      # 重读/重新授权，未发送

    # invoke 自己还检查令牌适用性/隔离/截止时间；网络发送不能在本地事务内。
    outcome = await executor.invoke(
        begun.dispatch_token,
        action.tool_name,
        action.immutable_arguments,
        action.idempotency_key
    )
    await store.transact(
        run_id, lease, RecordOutcome(begun.attempt_id, outcome)
    )
    return "SENT"
```

`record_gate_owned` 与其他存储操作遵循相同的租约检查、事件去重和事务约束。对没有未决效果的动作，`DENY` 设为 `REJECTED`；对已经有未决效果的动作，只保存拒绝再次发送的原因，保持效果未决。`APPROVAL_REQUIRED` 保存指定指纹的请求，首次发送可以进入 `WAIT_APPROVAL`；先前请求结果未知时，同时保留核对责任。权限不能通过重新命名工具或换对象绕过。`BeginTool` 如果发现停止意图、期限或预算已经变化，不返回发送令牌；不能顺带清除历史未知效果。

例如合法 `READY` 动作的工具尝试额度已为零，`BeginTool` 在同一事务中写 `stop_intent=TOOL_BUDGET`，把没有未决效果的未发送动作标为 `ABANDONED`，返回 `STOP`。主循环重读后进入停止路径，不会反复对同一个 `READY` 请求尝试；已有未知效果则仍进入核对路径。`RECHECK` 只表示并发状态/策略版本变化，不能用来表达预算耗尽；反复版本冲突仍受全局期限和实现诊断约束。

执行器的已知无效果异常可以受限重试，例如本地参数验证在发送前失败，或下游明确拒绝且证明未开始操作。一般连接中断、请求超时或执行器进程死亡不能被归入这种类别：外部服务可能已经接受请求。执行器未能返回 `Outcome` 就被回收时，动作账本仍为 `IN_FLIGHT`，下一个推进者按未决动作恢复。

如果结果已到内存但 `RecordOutcome` 遇到存储故障，本工作者停止新动作。存储恢复后可以重提交同一结果事件；工作者已经死亡时由新推进者核对。不能在 `except` 里直接重新 `invoke`，因为那会把“结果提交失败”误变成“业务操作失败”。

### 8.4 恢复 未知状态不是可重试错误的别名

```python
async def reconcile_actions(run_id, lease, actions, store, executor, clock):
    waiting = False
    for action in actions:
        begun = await store.transact(
            run_id, lease, BeginLookup(action.action_id, clock.now())
        )
        if begun.kind == "WAIT":
            waiting = True
            continue

        contract = executor.contract(action.tool_name, action.tool_version)
        if contract.is_read_only and contract.input_is_immutable:
            # 重读没有业务写效果，但仍经 BeginTool 计数并检查对象权限。
            await store.transact(
                run_id, lease,
                RecordLookup.retry_read(action.action_id, begun.lookup_id)
            )
            continue

        if contract.can_query_operation:
            lookup = await executor.lookup(action.action_id, action.immutable_arguments)
        else:
            lookup = LookupResult("INDETERMINATE", "NO_OPERATION_QUERY")

        if lookup.kind == "CONFIRMED_SUCCESS":
            if receipt_matches_intent(lookup.receipt, action):
                event = RecordLookup.success(action.action_id, begun.lookup_id, lookup.receipt)
            else:
                event = RecordLookup.effect_conflict(
                    action.action_id, begun.lookup_id, lookup.receipt
                )
        elif lookup.kind == "CONFIRMED_NO_EFFECT":
            event = RecordLookup.no_effect(
                action.action_id, begun.lookup_id, lookup.retryable, lookup.proof_ref
            )
        elif lookup.kind == "PENDING":
            event = RecordLookup.pending(
                action.action_id, begun.lookup_id, lookup.next_check_at
            )
        elif contract.same_key_replay_is_safe(action, clock.now()):
            # 该契约须覆盖参数、键范围、保留窗口与并发重发。
            # 仅生成原动作重发候选；效果仍 UNKNOWN，绝不分配新键/身份。
            event = RecordLookup.safe_replay(action.action_id, begun.lookup_id)
        else:
            event = RecordLookup.unknown(
                action.action_id, begun.lookup_id, lookup.reason
            )

        updated = await store.transact(run_id, lease, event)
        if updated.replay_permit is not None:
            return RecoveryResult(
                "REPLAY_CANDIDATE", action.action_id, updated.replay_permit
            )
        if updated.action_still_unresolved:
            waiting = True

    if waiting:
        await store.set_wait_owned(run_id, lease, "WAIT_RESOLUTION", "ACTION_UNRESOLVED")
        return RecoveryResult("WAIT")
    return RecoveryResult("CONTINUE")
```

恢复函数里的 `safe_replay` 生成绑定核对记录、原动作、原参数与有效窗口的重发许可；`effect_resolution` 仍为 `UNRESOLVED`。主循环把它交给 `dispatch_action`，不会进入新模型轮次或普通计划。发送仍须当前权限、有效审批、尝试额度和 `BeginTool` 的取消检查。事务看到停止意图时不生成/消费许可；许可生成后用户再取消，拒绝发送也必须保留原未知效果。只有操作级确定成功或无效果证明才能解除它。

这个双维状态避免一个隐蔽错误：工单已创建但查询暂时不确定，运行时把动作改成可重发 `READY`；用户此时取消，如果停止代码把所有 `READY` 当未发送放弃，原工单会从未决检测中消失。本文的停止和终态条件都检查 `effect_resolution` 与尝试账本，所以该路径保持 `WAIT_RESOLUTION`，直到原效果真正核对。

`retry_read` 只适用于本例的不可变输入；读取最新分支、实时库存或会推进游标的接口，不能自动套用。重新读取可获得另一版本观察，必须记录版本差异，必要时使已有分析或审批失效。

`retry_read` 将旧读取尝试标为观察已被替代，保留用量未知项，然后让同一读动作回到 `READY`；它没有清除任何外部写效果。操作查询的 `CONFIRMED_NO_EFFECT` 则必须覆盖原逻辑操作和所有相关发送，若查询只说明最新一次请求没有执行，不能进入该分支。

只有查询或安全重发都无法解决时，才转交人工核对。人工接口需要提交核对证据，例如外部操作 ID、工单版本和查验记录；“我觉得没执行”不能把未知状态改为可重试。人工确认成功后采纳原回执，确认未执行后才允许相同意图重试或终结；不明确时继续保持未知。

## 9 并发要分开处理工具依赖与运行推进权

上面的基线串行执行，但不能据此推断并发一定危险。读取固定修订的源文件与读取已有报告，彼此没有数据依赖，允许并发；“根据报告生成正文”依赖报告；创建工单依赖最终正文和批准，不能提前并行。

并发调度从 `ready_actions` 扩成**可执行波次**：前置动作都已成功、当前授权已满足、没有同一可变对象写冲突，且批次预留没有超过资源额度。为每个波次先持久化各自的尝试及预留，再分发；结果按 `attempt_id → action_id → CallBinding` 关联。不能用返回列表下标代替调用身份。一个只读任务先返回、另一个超时，必须各自记录；后者不影响前者已经取得的证据。

并发写操作的独立性不能只看参数不同。两个工单如果消耗同一个“只允许创建一条”的目标槽位，或都会更新同一项目计数/审批对象，仍存在共享状态。未知结果也应持有逻辑槽位占用，不能因为执行器退出就释放给另一个动作。

并行化减少等待链长度，同时提高瞬时请求压力、费用预留和失败组合数量。只有在轨迹证明工具等待构成主要延迟、工具契约能表达独立性时才值得升级。否则串行基线更容易审查恢复行为。无论是否并发，重试应由一层拥有：执行器内部若重试，必须把实际尝试暴露给账本；调度器和 SDK 各自独立重试会使实际请求数超过预算。退避与抖动用于减轻相关重试压力，不会把非幂等调用变为安全调用。[AWS：Timeouts, retries, and backoff with jitter](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/)

另一个并发问题是：两个工作者同时恢复同一运行。这与模型一次提出两个工具完全不同。运行推进权由存储租约管理：取得租约时分配递增的 `lease_epoch`；所有状态写入携带代次；存储拒绝过期租约或旧代次。事务内的版本条件处理同一代次中取消、审批和结果提交的竞争。

例如原工作者在代次 `41` 发出工单请求后长时间停顿，租约到期；恢复工作者取得代次 `42`。原工作者随后拿到成功回执，不能以代次 `41` 修改状态。代次 `42` 的工作者通过操作查询采纳这条回执。这样保护的是**本地状态推进**。etcd 文档区分 KV 的一致性、租约和操作超时后的客户端不确定性；采用类似协调能力时，仍须将相关写入放进实际受保护的存储事务。[etcd 3.6：API guarantees](https://etcd.io/docs/v3.6/learning/api_guarantees/)

只在本地存储检查 fencing token，不能阻止旧工作者早已发出的网络请求。如果外部工单服务也支持递增栅栏代次并对该资源拒绝旧代次请求，那么它能阻止服务**处理时**识别为过期的请求；已经成功处理的效果仍然存在。若下游不支持这种校验，只能依赖原操作身份的幂等/核对协议和保守恢复，不能因为用了分布式锁就声称远端只执行一次。

租约到期也不能被当成“旧请求肯定终止”。旧工作者可能只是网络分区，执行器或工单服务仍在运行。恢复工作者首先核对 `IN_FLIGHT`；能安全同键重发时才重发；不满足条件时等待原请求结果或人工核对。把抢到锁直接翻译成重新执行，会在最需要恢复的情况下造成重复效果。

## 10 用逐事件轨迹检查代码有没有兑现语义

### 10.1 正常完成 每个阶段都有不同的事实

下表中的 `read-source-1`、`read-report-1`、`create-issue-1` 是逻辑动作名；完整系统使用持久 ID。为简洁省去只改变计数的事件，但不能在实现里省掉计数与预留。

| 顺序 | 事件与控制权 | 权威状态的变化 | 现在能否宣布完成 |
| --- | --- | --- | --- |
| 1 | 用户创建运行 `run-17`，目标修订为 `1` | 保存仓库修订、报告 ID、工单项目、唯一槽位和预算；`ACTIVE` | 不能，尚无分析或工单 |
| 2 | 运行时 `BeginModel`，模型提出读取源文件与报告 | 模型尝试已记录；完整响应先保存，尚未执行工具 | 不能，模型提议不是证据 |
| 3 | 预检通过，`ConsumeResponse.plan` | 创建读取动作与本轮调用绑定，响应已消费 | 不能，只提交了意图 |
| 4 | 逐动作 `BeginTool → invoke → RecordOutcome` | 两个读取动作成功，保存修订、报告和内容哈希；`FinishPlan` 按各调用 ID 生成观察 | 不能，还未创建工单 |
| 5 | 下一模型轮提出 `create_issue` | 保存正文指纹 `intent-93`、动作 `create-issue-1`、稳定键 `op-run17-issue1`；`WAIT_APPROVAL` | 不能，等待的是指定内容批准 |
| 6 | 维护者批准 `intent-93`，身份与期限通过校验 | 批准绑定原动作，`READY`；恢复同一预算，不重新生成正文 | 不能，批准还不是创建结果 |
| 7 | 运行时再次授权并提交 `BeginTool` | 第一次尝试 `issue-attempt-1`，动作 `IN_FLIGHT`；发送原正文及原键 | 不能，外部结果还未确定 |
| 8 | 工单服务返回 `ISSUE-218` 与内容版本，提交结果 | `SUCCEEDED`，保存工单回执；本轮绑定收到对应结果 | 可以进入验收，仍不能直接跳过验收 |
| 9 | 模型提交最终候选，验收器核对证据与工单版本 | 保存 `ACCEPT` 的证据引用、候选哈希与目标版本 | 可以尝试提交成功终态 |
| 10 | `Complete` 事务的条件仍满足 | `COMPLETED` 与最终产物、验收证据一起生效 | 可以对外展示该版本任务完成 |

这里模型请求、逻辑动作和执行尝试是不同计数。正常轨迹用了三个模型请求和三个逻辑动作；每个动作本次只有一次尝试。加入一次模型超时重试会增加模型尝试；加入一次工单安全重发会增加工具尝试，但不会产生第二个 `create-issue-1`。

如果第 9 步模型又提出创建同一工单，而不是提交最终候选，`ConsumeResponse.plan` 不新建动作。它添加新调用绑定并回传 `ISSUE-218`。模型随后可以据此结束。已有工单正文与新提议不同，则返回冲突，不能以新的 `tool_call_id` 冲破唯一槽位。

### 10.2 验收拒绝 把失败事实变为决策输入

假设第 4 步读取成功后，模型直接输出“已经创建工单，问题定位完成”。运行时不会通过搜索“完成”二字停止：

```text
ConsumeResponse.candidate
→ Verifier: REJECT(MISSING_APPROVED_ISSUE, MISSING_EXTERNAL_RECEIPT)
→ RecordVerdict: 保存失败代码、所检查版本，清除候选
→ 新上下文: 已有源文件/测试证据；工单未创建；须提交指定内容审批
→ 下一轮可以提议 create_issue
```

反馈应该指出**不满足的条件和可用事实**，而不是“答案不够好，请再努力”。模型再次输出同一句完成声明时，验收拒绝计数增加；达到策略上限就失败停止，不能无限循环。若模型虚构一个工单 ID，验收器从动作账本和外部核对查不到对应证据，仍然拒绝。

反过来，如果工单确已创建，但最终候选漏了证据链接，可以修正候选并复验；不应重建工单来修正文案。状态账本把“业务效果完成”与“最终回答可交付”分开，正是为了让反馈修正指向正确对象。

### 10.3 最关键的崩溃窗口 工单创建成功 结果尚未提交

沿用正常轨迹的第 7 步，改变后续时序：

| 顺序 | 已发生事件 | 本地可见状态 | 恢复者能够推断什么 |
| --- | --- | --- | --- |
| 1 | 意图与稳定键已提交，审批绑定 `intent-93` | `READY` | 有资格开始这个逻辑动作 |
| 2 | `issue-attempt-1` 已提交 | `IN_FLIGHT`，没有结果 | 请求可能未发送、正在处理或已经成功 |
| 3 | 外部工单服务创建 `ISSUE-218` | 本地仍 `IN_FLIGHT` | 外部成功尚未成为本地已知事实 |
| 4 | 原工作者在 `RecordOutcome` 前崩溃 | 仍无成功回执 | 不能将状态解释为“工单未创建” |
| 5 | 恢复者取得新租约，先 `BeginLookup` | 核对尝试计数增加 | 不调用模型，不分配新动作 |
| 6 | 服务按原客户端操作 ID 返回 `ISSUE-218/intent-93` | 核对证据待提交 | 可以确认原意图已经成功 |
| 7 | `RecordLookup.success` 原子提交 | 原动作 `SUCCEEDED`，保存原回执 | 本次无需第二次创建 |
| 8 | 完成计划、生成候选并验收 | 按正常后半段推进 | 完成与否由原证据决定 |

错误实现通常把 `IN_FLIGHT` 改回 `READY`，重新问模型，再用新键调用工单服务。这个流程可能创建 `ISSUE-219`，因为服务无法知道它与 `ISSUE-218` 代表同一意图。即使新正文完全相同，内容相等也不证明业务操作是同一个。

修正后的流程把原身份保留在持久账本中，并先核对。查询确认成功时不重发；查询不确定但同键重发契约有效时，尝试 `issue-attempt-2` 沿用 `op-run17-issue1`。这个结论依赖工单服务去重协议：若它允许键过期后再次创建，恢复者不能在过期后照搬该分支。

如果第 4 步不是进程崩溃，而是 `RecordOutcome` 已提交、提交回执丢失，恢复者从本地读取就能看到 `SUCCEEDED`，不需要创建。唯一事件 ID 防止原结果再提交时重复结算；远端操作身份防止重发时重复产生业务效果。这是两层不同的去重。

### 10.4 超时 取消和两个恢复工作者

设工单请求已经发送，本地等待超时，随后用户取消：

```text
工具超时 → RecordOutcome(UNKNOWN)
用户取消 → RequestStop(CANCELLED)，禁止新工作
恢复核对 → CONFIRMED_SUCCESS(ISSUE-218)
提交原回执 → 动作 SUCCEEDED
FinishStopped → STOPPED/CANCELLED，部分结果列出 ISSUE-218
```

运行被取消与先前效果已发生并不矛盾。此时不提交 `COMPLETED`，也不声称外部创建已被撤销。若用户需要删除工单，那是另一项有权限、审批和失败语义的业务动作；不能用补偿动作伪装原请求从未发生。

如果核对没有确定结果，就停在 `WAIT_RESOLUTION`，暴露待核对的操作身份和责任。到期停止的是自动推进，不是删除未知事实。后台核对若继续运行，必须有独立额度、唤醒规则和负责者，不能隐藏为不受限制的重试。

再设原工作者在代次 `41` 超时，两个恢复者同时竞争。只有取得代次 `42` 的恢复者可以推进本地状态，另一个返回 `NOT_OWNER`。如果原工作者后来完成，其旧代次写入被拒绝；但外部 `ISSUE-218` 可能已经存在。新推进者仍按原操作身份核对，而不是认为旧代次无效就意味着旧请求无效果。

## 11 成功 等待和停止必须保留不同的含义

模型最终回答是一个候选；运行时终态是一次已提交的决定；业务成功是有证据支持的结果。这三者不相等。

| 状态/原因 | 已保证什么 | 后续允许什么 |
| --- | --- | --- |
| `COMPLETED` | 本目标版本的产物满足已声明验收，且没有未决动作 | 读取结果；新增需求建新目标，不复活旧终态 |
| `WAIT_INPUT` | 保存了具体缺项或待验收输入 | 收到匹配等待 ID 的合法输入后恢复同一运行 |
| `WAIT_APPROVAL` | 保存了不可变意图和审批请求；尚无执行资格 | 获得当前指纹的有效批准后再检查其他闸门 |
| `WAIT_RETRY` | 已保存失败类别、计数和最早重试时间 | 到期且仍获准后按原预算继续，不消耗忙等循环 |
| `WAIT_VERIFICATION` | 候选待人工/外部验收，尚未获得通过证据 | 只采纳绑定候选与目标版本的验收结果 |
| `WAIT_RESOLUTION` | 存在未确认效果或必要核对尚未完成 | 只按恢复规则核对；禁止绕开未知动作生成替代副作用 |
| `STOPPED/CANCELLED` | 不继续任务新工作，先前已发动作均已核对终结 | 展示已发生效果与部分成果；撤销需另行建动作 |
| `STOPPED/BUDGET` | 指定额度不再支持必要新工作 | 保留事实与部分成果；获准增加预算需显式账本事件 |
| `FAILED` | 确定错误使当前目标无法完成，没有未决动作被遗忘 | 诊断与人工处理；不能统计为成功 |

权限拒绝不必总是终止整项任务。拒绝一个越界文件读取，可以让模型选择允许范围内的证据；核心项目权限永久被撤销，则当前目标不可达。选择由目标和策略决定，拒绝本身必须保留为结构化观察。它不能变成“异常被 catch，所以继续假装读成功”。

某些产品选择把“停止新工作，但仍有未知效果”显示为终止态并附未决账本，也可以成立，但必须明确保留独立的恢复责任与生命周期。本文选择 `WAIT_RESOLUTION`，避免 `STOPPED` 被误解为所有外部动作已清算。状态名称并非行业统一，语义和不变量才是接口契约。

## 12 选择最小足够的循环 而不是先选最复杂框架

| 方案 | 适用条件 | 主要成本 | 升级或放弃条件 |
| --- | --- | --- | --- |
| 内存中的单步反馈循环 | 短任务、只读、丢失后可以从头再做，无人工等待 | 实现简单；进程失败丢状态；重复模型/工具成本 | 出现外部写效果或不能容忍重做时，升级持久账本；不能用增加 prompt 解决恢复 |
| 持久化单步反馈循环 | 路径未知，下一步依赖最新观察，包含中断或审批 | 每轮增加存储提交，恢复与版本管理复杂；模型轮次可能较多 | 若实测显示路径稳定且多轮选择没有收益，将稳定阶段收回确定流程 |
| 先规划再执行，局部重规划 | 子任务依赖可表达，观察不会频繁使计划失效 | 维护计划版本、依赖与失效传播；旧计划容易过期 | 环境变更频繁、计划每步被推翻时改用短反馈步；关键动作前仍校验当前事实 |
| 固定 workflow 内嵌一个受控 Agent 阶段 | 主流程、合规闸门和结果 schema 稳定，局部分析需要模型 | 自由度较低；需要设计清楚局部输入/输出 | 模型频繁需要跳出边界才能完成合法目标时调整边界；不直接放开任意工具 |

本例可以采用固定外层流程：取得材料 → 动态分析 → 人工批准 → 创建工单 → 验收。模型不需要决定是否跳过批准，也不需要自主规划恢复协议。如果分析通常只读两份固定材料，一个模型分析阶段可能足够；若它需要根据失败证据进一步定位文件，才在分析阶段引入动态控制。

增加规划器或多个 Agent，会增加协调状态、结果归属和恢复边界，不能修复原单 Agent 缺失的幂等或审批机制。先以单运行基线证明故障窗口内的行为，再根据真实轨迹判断哪里需要并行、规划或分工。比较方案时用相同目标、工具版本、输入修订、权限和预算；否则成功率与延迟差异无法归因。

## 13 观测要能重建决定 评估要有分母

运行事件账本负责恢复事实；tracing 负责定位延迟与执行关系。trace 可以采样、导出失败或丢失，不能成为唯一的动作账本。OpenTelemetry 的 span、事件和 link 可以表达操作关系；本文所用运行/动作字段是应用自定义字段，不声称属于统一 Agent 语义标准。[OpenTelemetry：Tracing API](https://opentelemetry.io/docs/specs/otel/trace/api/)

至少建立以下关联：

```text
run_id + goal_revision + runtime/tool/policy/verifier 版本
  → model_attempt_id + input_revision + context_hash + response_id
  → plan_id + tool_call_id + action_id + intent_hash
  → attempt_id + lease_epoch + 发送/结果/核对时间 + outcome
  → verdict_id + candidate_hash + evidence_refs + stop_reason
```

记录政策拒绝的具体原因、预算预留和结算差额、未知结果的起止时间、恢复选择依据。否则看到“工具失败 3 次”无法分辨三次物理尝试属于一个动作，还是模型创建了三个逻辑动作。服务端响应时间、工具排队时间、模型时间和人工等待也要拆分，不能把审批耗时误算成模型慢。

敏感正文、源代码和密钥不要无条件写入通用 telemetry。保存可检索的受控产物引用、哈希和必要错误摘要；需要复现实验时，完整材料放在有访问控制和保留期限的专用存储。OWASP 的日志指导明确要求控制敏感信息与日志访问，不能以“全量日志方便调试”为由复制凭据或个人数据。[OWASP：Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)

控制循环评估应先定义统计口径：

| 指标 | 本篇建议口径 | 常见误读 |
| --- | --- | --- |
| 业务成功率 | 已通过该版本业务验收的运行 / 同测试集全部已启动运行；取消、失败、到期及未决单列，同时保留总分母 | 只统计模型输出了最终答案的运行，隐藏未完成者 |
| 非法提议率 | 协议、参数或授权拒绝的调用提议 / 全部调用提议；一个批次按调用计，批次拒绝原因另记 | 把被拦截提议称为“实际违规执行” |
| 重复效果率 | 同业务槽位出现多于预期外部对象的槽位 / 受测写操作槽位 | 幂等重发传输了两次，却没有重复业务效果，不应算成两条工单 |
| 未知结果率 | 曾进入 `UNKNOWN` 的写动作 / 已发送的写动作；另报截止时仍未解决的比例 | 只报“最终失败”掩盖大量待核对请求 |
| 恢复成功率 | 注入故障后，在规定恢复窗口内到达预期正确状态且无重复/越权的案例 / 全部该故障类有效注入案例 | 把“工作者成功重启”当成业务恢复成功 |
| 工作与恢复开销 | 每运行模型/工具/核对尝试、预留/已确认/未知费用，及机器推进延迟分布；人工等待另报 | 调用数代替费用，均值掩盖长尾，丢弃超时样本 |

待解决运行需要明确观察截止时间，不从分母中删除；恢复能力测试用可核对的预期状态作为目标，某些无查询能力场景的正确结果就是保留未知并禁止重发。不能把所有案例都要求自动成功，否则系统会被激励去掩盖不确定性。

### 故障注入矩阵

先用可控制的模型替身、工具替身与持久存储验证协议，再换真实服务测试契约。故障注入应控制发送、提交和恢复的时序，而不只是随机返回错误。

| 注入点或输入 | 应观察到的状态/行为 | 必须检查的不变量 |
| --- | --- | --- |
| 模型流中断，参数只完成一半 | 模型尝试失败或不完整，受限重试；零工具发送 | 预览不能形成动作；费用未知不释放全部预留 |
| 完整响应含未知工具或越权项目 | 保存调用绑定及拒绝观察；该批不发工具 | schema 合法不能绕过对象授权 |
| 响应持久化后、计划提交前崩溃 | 恢复消费同一响应，至多创建同一计划 | 模型响应消费和意图创建原子/幂等 |
| 意图提交后、尝试提交前崩溃 | 恢复原动作，批准与预算仍可查 | 不分配新逻辑身份或新键 |
| 尝试提交后、网络发送前崩溃 | 作为可能已发核对，不猜测未执行 | 保守未知；有明确无效果证据才直接重试 |
| 工单已成功、结果提交前崩溃 | 查原操作或有效同键恢复；原工单唯一 | 副作用与本地提交的窗口不产生新工单 |
| 结果事务提交成功，但回执丢失 | 读取既有结果；重复事件不重复结算 | 本地去重与远端去重分开 |
| 请求超时后取消，远端稍后成功 | 记录停止意图，核对后保留已发生效果，再停止 | 本地取消不宣称远端回滚 |
| 幂等键过期，查询仍不确定 | `WAIT_RESOLUTION`，不换新键盲重试 | 恢复承诺不超出下游时间窗口 |
| 批准后正文变化/权限撤销 | 新指纹重新审批，或拒绝；旧批准不能沿用 | 审批绑定不可变意图，动态权限仍过闸 |
| 工具第一次成功、第二个工具确定失败 | 每动作结果独立提交并回传 | 批次部分成功不被伪称整批无效果 |
| 旧工作者停顿，恢复者取得新代次 | 旧代次不能推进存储；外部旧请求仍按原身份核对 | 锁与栅栏不被夸大成远端撤销 |
| 模型虚构完成/工单 ID | 验收拒绝，反馈具体缺项，受限修正 | 最终回答不能创造执行事实 |
| 存储在意图/结果提交时不可用 | 工作者停止新请求；已在途动作留待恢复 | 存储失败不触发直接业务重试 |
| 暂停后多次恢复，达到额度 | 同一账本计数继续，停止或保留待核对 | 恢复不能无限重置轮次、尝试或费用 |

测试“创建成功后崩溃”时，工具替身必须在返回前已经持久化外部工单，并由测试器在指定点杀掉工作者；恢复时使用另一个工作者读取同一存储。若替身只是抛异常且从未创建对象，根本没有覆盖这条危险窗口。测试两位恢复者时，还要保留旧执行器继续运行，不能先把它杀掉再证明新工作者没有竞争。

协议测试通过后，仍需实际下游环境验证幂等保留窗口、查询一致性、权限撤销、取消和供应商费用协议。教材中的接口没有为这些外部能力提供实现，不能用伪代码审查代替契约验证。

## 14 练习 用反例检验设计判断

### 练习一 同一请求 新的调用 ID

原调用 `call-create-7` 已在逻辑动作 `create-issue-1` 下生成 `ISSUE-218`。模型新一轮使用 `call-create-12`，提出相同项目、正文和证据。开发者准备按新调用 ID 创建新幂等键。找出错误，并写出计划提交及结果回传的正确方式。

**参考分析：**协议调用 ID 只能关联本轮返回，不能定义业务意图。运行时查唯一槽位与指纹，复用原动作，添加 `CallBinding(new_model_attempt, call-create-12, create-issue-1)`；计划完成时把原工单回执作为 `call-create-12` 的结果。新键会使下游认为这是新操作。若正文变化，则返回意图冲突，不能因为模型调用 ID 不同就创建第二条；是否允许第二条必须由新的明确目标表达。

### 练习二 审批后恢复 剩余预算为零

计划已保存，尚未发送工单。维护者第二天批准，但工具尝试预算已被其他获准尝试耗尽；没有已发未知动作。是否可以因“用户批准了”再发一次？如果工单早已发出且结果未知，处理会怎样改变？

**参考分析：**批准只满足动作授权之一，不扩充执行预算。未发送动作在 `BeginTool` 处被预算闸门阻止，提交预算停止及部分分析产物。若已有未知动作，不能直接以干净停止结束；先用独立恢复额度查询原操作。查询确认成功后保存已发生效果再停止；核对无法确定或额度耗尽，保留 `WAIT_RESOLUTION`。不能把同键重发称为纯查询来绕过预算或撤销状态。

### 练习三 租约保护了数据库 为什么还有两条工单 

原工作者代次 `41` 提交尝试后发送请求；恢复者代次 `42` 抢到租约，以新动作和新键重发。数据库拒绝原工作者写回，但工单服务出现两条工单。请分别说明本地与外部机制失败在哪里。

**参考分析：**本地栅栏实际兑现了旧写入拒绝，问题不在它“失效”；恢复流程错误地丢失原动作身份，并误把旧代次失效解释为原外部请求没有效果。下游新键把重发视为新意图。修复是在恢复者取得租约后先核对原动作，必要时仅以有效的同键协议重发。如果下游不支持查询或可靠去重，就暂停核对；不能靠更长租约给出 exactly-once 承诺。

### 练习四 让故障测试真正覆盖未知窗口

为 `create_issue` 设计三个可控故障场景：发送前崩溃、外部创建后本地提交前崩溃、结果提交后提交回执丢失。说明每个场景需要保留什么独立证据，预期外部对象数和模型调用行为是什么。

**参考分析：**发送前场景保留已提交尝试，并由替身证明请求未被接收；运行时自身不能从 `IN_FLIGHT` 推出这一点。创建后场景保留外部操作账本和工单对象，恢复以原操作身份核对，预期只有一条工单；核对解决前不能调用模型制造替代写动作。提交后场景保留本地结果事件，恢复读到成功，不再创建，重复结果事件不重复结算。若使用幂等重发，物理请求数可能大于一，业务对象数仍为一；这两个计数必须分别断言。三个场景都要检查原审批、指纹和预算继续存在。

实现本篇方案时，先让这几个反例成为可复现的协议检查，再接真实模型。模型质量决定分析是否正确，运行时协议决定错误提议、中断和未知效果会不会破坏任务。两者需要分别测量，不能相互替代。


把动态与固定方案的假设交给 [版本评价](e02.md)核同条件结果；动态性不自行证明用户价值或必要性。
