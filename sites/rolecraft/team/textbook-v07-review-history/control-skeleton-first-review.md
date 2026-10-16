# Agent 控制循环：设计一个可恢复、受控并能验收的运行时

模型负责提出下一步；运行时负责把提议变成有身份、有授权、有执行记录的动作。一个可靠的控制循环，必须能够回答三个问题：**这一步有没有资格执行？中断后怎样判断它是否已经执行？用什么证据判定整个任务完成？**

如果任务包含外部写操作、人工审批或进程重启，`while → 调模型 → 调工具` 不够。建议采用显式运行状态、持久动作记录和受限的反馈循环。这个建议的适用条件是：漏执行或重复执行的业务代价已经超过额外存储、恢复流程和维护的代价。短时、只读、允许重做的实验，可以先用内存循环；不能把这种简化带来的恢复缺口解释成模型能力问题。

本文只解决一个问题：怎样推进**一个任务运行**，让模型的不确定决策与工具的确定执行在中断、审批、超时和验收拒绝后仍有明确语义。默认读者已有软件工程、异步调用和 LLM 应用基础。下面的状态、接口和伪代码是本篇设计方案，不是某个 SDK 的 API，也不是可直接上线的实现。

## 1. 先固定完成条件，才能决定循环控制什么

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

## 2. 控制权在运行时，聊天上下文只是一种投影

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

## 3. 用动作账本表达进度，不要只保存聊天文本

下面是本方案最小数据模型。为突出关系，省去数据库列类型和索引实现；这些字段的语义不能省去。

```typescript
type RunStatus =
  | "ACTIVE" | "WAIT_INPUT" | "WAIT_APPROVAL" | "WAIT_RESOLUTION"
  | "COMPLETED" | "STOPPED" | "FAILED";

type ActionStatus =
  | "READY" | "WAIT_APPROVAL" | "IN_FLIGHT" | "UNKNOWN"
  | "SUCCEEDED" | "REJECTED" | "FAILED_FINAL" | "ABANDONED";

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
  outcome: Outcome | null;
}

type Outcome =
  | { kind: "SUCCESS"; receipt: Receipt }
  | { kind: "KNOWN_NO_EFFECT"; error: ToolError; retryable: boolean }
  | { kind: "FINAL_FAILURE"; error: ToolError; effect: "NONE" | "CONFIRMED" }
  | { kind: "UNKNOWN"; error: ToolError; operation_id: string | null };
```

这不是要求把每个字段放进一张表。关键是它们之间的身份、不可变性与提交约束。`FINAL_FAILURE` 的 `CONFIRMED` 用来表达确定已经发生但不满足目标的效果，例如工单创建了却内容错误；不能把它归为可直接重试的“失败”。

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

## 4. 提交边界决定哪些事情可以在崩溃后重做

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

## 5. 完整模型输出才有资格成为执行计划

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

## 6. 先核对未决动作，再让模型继续

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

## 7. 审批、取消和预算都必须跨暂停保留

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

## 8. 把这些约束落实到完整控制骨架

下面的伪代码选择**单运行、单推进者、串行执行工具**作为基线。并发工具将在下一节按契约扩展。模型、数据库、工单服务和策略服务都通过接口接入；不假定它们共享事务。

### 8.1 接口返回的是控制语义，不是任意异常字符串

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
| `ConsumeResponse` | 将完整响应标为已消费，且原子写入计划、候选、等待或协议反馈之一；工具提议均建立本轮 `CallBinding`，新动作创建身份，复用动作引用原账本 | 响应已消费则返回既有结果；同槽位意图冲突绑定拒绝观察，不建新动作 |
| `RequestStop` | 保存首个停止原因；放弃尚未发出的计划动作和未消费响应；保留已发动作 | 不把 `IN_FLIGHT/UNKNOWN` 改为“未执行”；既有成功回执不删除 |
| `BeginTool` | 检查动作可执行、前置动作成功、当前审批与授权检查结果适用；再次检查取消/期限；预留资源，计尝试，标在途 | 一旦拒绝，不返回发送令牌；批准过期转等待批准，权限撤销记录拒绝，预算不足转停止意图 |
| `RecordOutcome` | 保存尝试结果、结算资源、推进动作状态；成功回执和动作完成原子提交 | 当前取消不阻止记录既有结果；旧代次工作者不能直接写入，可由新推进者核对采纳 |
| `BeginLookup` | 检查未决动作；计核对次数，保存核对尝试和下一次期限 | 没到核对时间或核对额度不足返回 `WAIT`；不发无限查询 |
| `RecordLookup` | 保存核对证据；确认成功/确定失败可终结动作，允许重试时改为 `READY`；所有未决动作解决后清除对应核对等待 | `INDETERMINATE` 保持未知；有停止意图时禁止改为可重发，确认无效果后终结为失败 |
| `FinishPlan` | 仅在全部绑定都有终结观察时，按本轮调用 ID 生成结果，合并观察，清除当前计划 | 复用成功动作回传原回执；参数、权限、依赖失败同样保留观察；不把部分失败改为整批无效果 |
| `RecordVerdict` | 保存验收版本、具体反馈；拒绝可修则清除候选，等待则保存等待条件 | 验收结果只适用于所检查的候选/目标版本；存储条件已变化则拒绝该提交并重新检查 |
| `Complete` | 检查同一候选验收通过、目标版本一致、无未决动作/停止意图，原子保存成功终态与证据 | 审批/目标/取消变化不能沿用旧验收；取消竞态由事务决定是否还可完成 |
| `FinishStopped` / `Fail` | 在无未决动作时保存停止或失败原因及部分成果 | 仍有未决动作只能保持 `WAIT_RESOLUTION`；`Fail` 遇到新停止意图返回前置条件变化，由主循环按停止处理 |

`RecordOutcome` 对结果分类的具体归约如下：`SUCCESS → SUCCEEDED`；`UNKNOWN → UNKNOWN`；已知无效果且可重试、额度仍够、无停止意图，保持同一动作并置为 `READY`，同时保存退避时间；其他确定失败进入 `FAILED_FINAL`。已确认但错误的外部效果留存回执，并禁止同槽位自动重建。`REJECTED` 用于未获执行资格，`ABANDONED` 用于取消或停止后未发送的动作；它们都不是执行失败的同义词。

审批事件只允许把匹配动作从 `WAIT_APPROVAL` 改为 `READY`，或写入明确拒绝。澄清事件验证等待 ID、任务身份与字段，保存外部输入，清除对应等待；目标范围变化则生成新目标修订并使不再适用的审批失效。两类恢复事件都不重置预算，也不把用户输入当工具回执。

### 8.2 主循环：先处理已有事实，再产生新决策

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
            unresolved = state.actions_in({"IN_FLIGHT", "UNKNOWN"})
            if unresolved:
                result = await reconcile_actions(
                    run_id, lease, unresolved, store, executor, clock
                )
                if result == "WAIT":
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
                    return WorkerResult("WAIT_INPUT", verdict.request_id)
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
    finally:
        await store.release_if_owned_best_effort(run_id, lease)
```

其中 `cancellation_or_deadline` 只处理全局取消、总截止时间和已经明确触发的硬停止条件。模型尝试上限在 `BeginModel` 检查，工具尝试上限在 `BeginTool` 检查：最后一次获准的模型请求所产生的合法结果，仍然可以进入验收，不能因为模型计数刚达到上限就丢弃它。同理，拿到最后一次允许工具调用的成功结果后，不能错误地直接标为预算停止。

`wait_is_satisfied` 区分等待类型：外部输入/审批要有已验证的对应事件，延迟重试要到 `not_before` 时间，核对等待要有新的核对事实或到下一次核对时间。`resume_satisfied_wait` 在事务中重新检查条件、清除等待并恢复 `ACTIVE`；未满足就保留等待。它不授予额外权限。后台唤醒器按持久等待条件调度 `drive`，不是保持一个协程睡到用户批准。

`preflight_batch` 必须逐项解析工具名和参数、拒绝未知字段或错误类型、核对访问对象、验证依赖构成无环图，并限制批次大小。工具 schema 只能证明结构合法，不能证明项目 ID 属于当前身份或正文获准。语义授权由策略判定，槽位与参数一致性由意图提交事务判断。工具注册表及当前目标之外的调用，作为拒绝反馈提交，不交给执行器。

连续协议错误、验收拒绝和无进展也有单独计数或策略。无进展是启发式：在相同证据版本下，反复提出同一失败调用而没有新信息，才有充分理由停止；同一路径的第二次读取如果修订已经变化，不能只按字符串相同判为死循环。启发式不能替代硬预算。

验收服务不可用时，`Verifier.check` 返回 `WAIT` 或结构化可重试的验收故障，并使用受限的验收尝试额度；不返回 `ACCEPT`。它如果需要访问外部系统，同样要记录其请求/版本和可能的未知状态，但验收查询不能产生业务写操作。

### 8.3 工具执行：每次发送前再次过闸

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

    action = ready[0]                           # 本文基线是串行
    gate = await policy.authorize_current(state.goal, action)
    if gate.kind != "ALLOW":
        await store.record_gate_owned(run_id, lease, action.action_id, gate)
        return "CONTINUE"                      # 拒绝观察或等待审批均已保存

    begun = await store.transact(
        run_id, lease, BeginTool(action.action_id, gate.policy_version)
    )
    if begun.kind != "DISPATCH":
        return "CONTINUE"                      # 未返回发送令牌，不执行

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
    return "CONTINUE"
```

`record_gate_owned` 与其他存储操作遵循相同的租约检查、事件去重和事务约束。`DENY` 将动作设为未执行的 `REJECTED` 并保存原因；`APPROVAL_REQUIRED` 保存指定指纹的审批请求并设为 `WAIT_APPROVAL`。权限不能通过重新命名工具或让模型换一个对象绕过。`BeginTool` 如果发现停止意图、期限或预算已经变化，事务负责保存相应拒绝/停止状态，调用者不发请求。

执行器的已知无效果异常可以受限重试，例如本地参数验证在发送前失败，或下游明确拒绝且证明未开始操作。一般连接中断、请求超时或执行器进程死亡不能被归入这种类别：外部服务可能已经接受请求。执行器未能返回 `Outcome` 就被回收时，动作账本仍为 `IN_FLIGHT`，下一个推进者按未决动作恢复。

如果结果已到内存但 `RecordOutcome` 遇到存储故障，本工作者停止新动作。存储恢复后可以重提交同一结果事件；工作者已经死亡时由新推进者核对。不能在 `except` 里直接重新 `invoke`，因为那会把“结果提交失败”误变成“业务操作失败”。

### 8.4 恢复：未知状态不是可重试错误的别名

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
            # 这里只允许原逻辑动作 READY；绝不分配新键或新 action_id。
            event = RecordLookup.safe_replay(action.action_id, begun.lookup_id)
        else:
            event = RecordLookup.unknown(
                action.action_id, begun.lookup_id, lookup.reason
            )

        updated = await store.transact(run_id, lease, event)
        if updated.action_still_unresolved:
            waiting = True

    if waiting:
        await store.set_wait_owned(run_id, lease, "WAIT_RESOLUTION", "ACTION_UNRESOLVED")
        return "WAIT"
    return "CONTINUE"
```

恢复函数里的 `safe_replay` 不在这里发送请求，只将原动作置为候选可执行。之后仍必须经过当前权限、有效审批、尝试额度和 `BeginTool` 的取消检查。`RecordLookup` 的事务若看到停止意图，不允许这个迁移；有无效果证明的动作可以终结，没有证明的动作继续未知。否则取消任务会在恢复过程中被悄悄重新执行。

`retry_read` 只适用于本例的不可变输入；读取最新分支、实时库存或会推进游标的接口，不能自动套用。重新读取可获得另一版本观察，必须记录版本差异，必要时使已有分析或审批失效。

只有查询或安全重发都无法解决时，才转交人工核对。人工接口需要提交核对证据，例如外部操作 ID、工单版本和查验记录；“我觉得没执行”不能把未知状态改为可重试。人工确认成功后采纳原回执，确认未执行后才允许相同意图重试或终结；不明确时继续保持未知。
