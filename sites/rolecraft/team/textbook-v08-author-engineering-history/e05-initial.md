# 性能与成本：在任务质量不退步时，优化究竟省了什么

缓存、便宜模型和更高并发是否值得采用，应在相同任务分布、负载、权限与质量条件下比较完整任务。模型单价只是成本输入，单次响应时长只是延迟的一段；失败、重试、排队、人工返工和未决效果都会改变结果。先确认正确性与安全护栏，再比较单位任务成本和吞吐，才能避免把少做事、删慢样本或复用错误资料误称为优化。

本章解决工程经济性的比较，先修为 [e02](e02.md)、[e04](e04.md)。任务仍是核 `repo@8e12` 和 `test-report-71`，经批准在 `refund-maintenance` 创建唯一工单。本章所有数值都是虚构演算，计费单位 `credit` 是练习货币，不是供应商报价或实际账单。Python 最小计算代码未运行；没有实测模型、负载和优化收益。

## 成本归到逻辑任务，才能看见失败代价

一次逻辑任务可能有三次模型请求、两次读取、一次写后核对和十分钟人工确认。账本应把这些尝试归到同一 `run_id`，每次物理请求单独记录 `attempt_id`、配置/价格版本、用量、费用确认状态和时间。不能只计成功返回那次模型请求；超时请求可能已经计费，未决费用不能填零。

先分别保存金额、资源用量和人工时间。若需要将人工时间折算为金额，采用明确的题定或组织核定费率，并同时保留原始分钟；不能直接把美元、人民币和分钟相加。共享存储和维护成本若按任务分摊，要写清分摊窗口与依据；没有实际依据时列为未计入项，不制造精确总成本。

本章使用三个不同口径，定义如下：

```text
每分配任务成本 = 同一任务群的全部确认费用 / 已分配逻辑任务数
每接受任务成本 = 同一任务群的全部确认费用 / 满足结果与过程判据的任务数
每物理尝试成本 = 全部确认费用 / 物理请求尝试数
```

“接受”沿用事前任务契约，正确停止任务与成功创建任务分别分层，不能临时把所有拒绝纳入“成功”来压低成本。零接受任务时，每接受任务成本未定义，不是零。没有完成的任务已产生的费用仍在群体总费用中；预算预留只是资源控制记录，不是实际账单。

费用确认分为 `CONFIRMED`、`PENDING` 和实际已确认的退款等独立记账类型。下文示例只用非负已确认支出，不演示退款。待确认费用存在时，报告确认费用及待确认项；只有预留确实受可证明的请求硬上限约束，才可把它当未确认费用的上界。经验估计的预留值不能用来宣称最终金额一定落在某区间。

设旧版一百项逻辑任务，累计确认费用 240 credit，接受八十项；新版确认费用 180 credit，只接受五十项。每分配任务成本从 2.4 降到 1.8，每接受任务成本却从 3.0 升到 3.6。这是虚构算例；它说明两种分母回答不同问题。新版更便宜的请求不自动意味着更经济的业务结果。

## 延迟必须注明用户等到的是什么

本方案的任务时间线是：外部提交时刻 `submitted_at`；持久接受时刻 `accepted_at`；开始执行 `started_at`；用户得到本次终态或明确等待响应 `response_at`；最终业务效果确认 `effect_resolved_at`。对长期审批任务，“已接受、等待审批”的响应时长与最终完成时长都可有意义，但不能混成一个响应速度数字。

端到端等待包括排队、模型、工具、核对和人工等待。各阶段可以分别分析瓶颈；总体分位数不能直接由阶段 p95 相加，因为每个阶段的慢样本未必来自同一任务，并行阶段也不应求和。

成功任务的 p95 表示成功者中 95% 对应的某个分位位置。超时任务实际业务完成时间仍未知，只知道用户等待到了超时点；取消请求也不证明远端动作撤销。报告成功完成时间分布、所有已返回请求的观测等待分布、超时/取消/失败数量，以及仍在途任务的当前年龄。Google SRE 监测章节同样要求区分成功与失败请求延迟，因为快速错误响应可以扭曲整体时长。这里进一步把业务完成和观察终止分开，是本章口径。[Google SRE：Monitoring Distributed Systems，访问于 2026-10-11](https://sre.google/sre-book/monitoring-distributed-systems/)

分位数算法也要固定。下例采用最近秩：将 `n` 个观测值升序排序，`p` 分位数取第 `ceil(p*n)` 个值。四项样本的 p95 等于最大值，这不是稳定尾延迟估计。小样本可以用于核计算，不适合宣称长期服务 p95。

## 一个不把失败和未知费用丢掉的汇总器

下面是 Python 3.10+ 标准库代码。`TaskAccounting` 是一次分配的逻辑任务账目；输入已经按尝试账本去重汇总，并覆盖该任务所有已发生支出。`cost_confirmed=False` 表示还有未知收费，不表示已知支出是估计值。`elapsed_ms` 是从提交到观察终止或截止观察时刻的等待，不能拿超时值冒充真实业务完成时间。

保存为 `task_accounting.py` 后执行 `python3 task_accounting.py`，题定输出为：`4 2`，`1000 7000 10000`，`None 5 3`。`None` 表示最终每接受任务成本尚不能确认；5 为已确认非负支出的下界口径，3 为待确认项的预留总额，二者不能自动组成费用区间。本版未实际运行。

```python
from collections import Counter
from dataclasses import dataclass
from decimal import Decimal
from math import ceil

STATUSES = {"ACCEPTED", "FAILED", "TIMED_OUT", "CANCELLED", "IN_FLIGHT"}

@dataclass(frozen=True)
class TaskAccounting:
    task_id: str
    status: str
    elapsed_ms: int
    known_cost: Decimal
    pending_reserved: Decimal
    cost_confirmed: bool
    physical_attempts: int

def quantile_nearest_rank(values, probability):
    if not 0 < probability <= 1:
        raise ValueError("QUANTILE_INVALID")
    if not values:
        return None
    ordered = sorted(values)
    return ordered[ceil(probability * len(ordered)) - 1]

def summarize(tasks):
    seen = set()
    for item in tasks:
        if item.task_id in seen:
            raise ValueError("DUPLICATE_LOGICAL_TASK")
        seen.add(item.task_id)
        if item.status not in STATUSES:
            raise ValueError("STATUS_INVALID")
        if type(item.elapsed_ms) is not int or item.elapsed_ms < 0:
            raise ValueError("LATENCY_INVALID")
        if type(item.physical_attempts) is not int or item.physical_attempts < 0:
            raise ValueError("ATTEMPT_COUNT_INVALID")
        if not item.known_cost.is_finite() or item.known_cost < 0:
            raise ValueError("COST_INVALID")
        if not item.pending_reserved.is_finite() or item.pending_reserved < 0:
            raise ValueError("RESERVATION_INVALID")
        if item.cost_confirmed and item.pending_reserved != 0:
            raise ValueError("CONFIRMED_WITH_PENDING_RESERVATION")
    counts = Counter(item.status for item in tasks)
    accepted = [item.elapsed_ms for item in tasks if item.status == "ACCEPTED"]
    observed_waits = [item.elapsed_ms for item in tasks if item.status != "IN_FLIGHT"]
    known = sum((item.known_cost for item in tasks), Decimal("0"))
    reserved = sum((item.pending_reserved for item in tasks), Decimal("0"))
    accepted_count = counts["ACCEPTED"]
    denominator_frozen = counts["IN_FLIGHT"] == 0
    final_cost_known = denominator_frozen and all(item.cost_confirmed for item in tasks)
    known_per_accepted = (known / accepted_count
                          if accepted_count and denominator_frozen else None)
    return {
        "assigned": len(tasks), "accepted": accepted_count, "status_counts": dict(counts),
        "accepted_p50_ms": quantile_nearest_rank(accepted, 0.50),
        "accepted_p95_ms": quantile_nearest_rank(accepted, 0.95),
        "observed_wait_p95_ms": quantile_nearest_rank(observed_waits, 0.95),
        "in_flight_ages_ms": [item.elapsed_ms for item in tasks if item.status == "IN_FLIGHT"],
        "confirmed_cost": known, "pending_reserved": reserved,
        "cost_per_assigned": known / len(tasks) if tasks and final_cost_known else None,
        "cost_per_accepted": known_per_accepted if final_cost_known else None,
        "confirmed_cost_per_accepted_lower_bound": known_per_accepted,
        "physical_attempts": sum(item.physical_attempts for item in tasks),
        "cost_per_attempt": (known / sum(item.physical_attempts for item in tasks)
                             if final_cost_known and any(item.physical_attempts for item in tasks)
                             else None),
    }

if __name__ == "__main__":
    data = [
        TaskAccounting("task-1", "ACCEPTED", 1000, Decimal("4"), Decimal("0"), True, 2),
        TaskAccounting("task-2", "FAILED", 2000, Decimal("2"), Decimal("0"), True, 1),
        TaskAccounting("task-3", "TIMED_OUT", 10000, Decimal("3"), Decimal("3"), False, 2),
        TaskAccounting("task-4", "ACCEPTED", 7000, Decimal("1"), Decimal("0"), True, 1),
    ]
    result = summarize(data)
    print(result["assigned"], result["accepted"])
    print(result["accepted_p50_ms"], result["accepted_p95_ms"], result["observed_wait_p95_ms"])
    print(result["cost_per_accepted"], result["confirmed_cost_per_accepted_lower_bound"],
          result["pending_reserved"])
```

仍在途时，最终接受分母可能变化，示例因此不计算最终每接受任务成本或它的下界；当前等待和已确认支出仍可报告。

“所有支出都已归账”是该汇总器的外部输入契约，不由四个字段证明。实际导入时按任务查所有模型/工具尝试，验证事件序列、账单或供应商用量记录、价格版本与费用确认；丢了一次超时尝试会让结果偏低。代码只拒绝重复逻辑任务和非法数值，不伪称连接过账单服务。

同一任务的最终状态改变后，应以完整账目快照替换原记录，而不是另加一项 `task-3-retry-success`。重试是物理尝试，仍归原任务。若用户明确发起另一项独立任务，才分配新的逻辑身份；判定依据是业务意图，不是请求参数刚好相同。

## 负载决定并发实验测到了什么

工作负载至少规定任务家庭及比例、资料大小、到达过程、观察窗口、任务期限、客户端重试、人工审批安排和资源额度。固定并发用户的闭环测试在服务变慢时会自动减少新提交，适合观察固定用户数的系统，却可能掩盖同样外部到达量下的排队。独立时间表提交的开放负载可以固定提供量，但压力发生器本身必须记录迟发与漏发；不能把发生器来不及提交的任务从样本删除。

每个实验同时记录：计划提供量、实际提交量、被持久接受量、拒绝量、观察窗内终止量、被验收接受量和剩余在途量。吞吐采用某段明确窗口内完成并接受的任务数除以窗口秒数；窗口结束后排空的完成量另报。不能用最终排空的一百任务除以提交的十秒窗口，制造每秒十任务的假成绩。

冷缓存、预热和持续负载分别安排。预热输入、时长和排除规则在运行前决定，两版本一致；缓存命中依赖用户历史时，复放相同授权任务序列，并报告冷/热条件，而不是只截最快一段。重复实验需要重建一致初始状态，保存全部轮次及波动。安全故障与未决效果仍由[e02 的任务判定](e02.md)检查，性能汇总不能重新定义通过。

并发增加能减少独立请求的串行等待，也会增加队列、供应商限流、存储锁争用和重试。先用阶段等待及资源饱和证据定位瓶颈，再调整相关并发。若总时间主要用于人工批准，翻倍模型请求并发不一定改善最终工单时长；若模型服务额度固定，更多工作者可能只把请求从本地队列挪到供应商限流。

Google SRE 的过载处理讨论限制资源与请求、客户端节流以及重试预算；本文不照抄书中具体参数，而是把“重试也消耗负载”纳入逻辑任务账本和共享额度。[Google SRE：Handling Overload，访问于 2026-10-11](https://sre.google/sre-book/handling-overload/)

## 缓存应复用证据和候选，不能复用批准

本任务可以缓存不可变源读取或经核验的分析候选。工单副作用、批准或运行完成状态不能按问题文字复用；相同问题的另一个运行仍需自己的效果槽位与准确批准。

读取缓存键包含组织/主体或等价可读范围、授权版本、仓库修订、路径、源内容哈希和工具契约。生成候选还包含证据包、任务约束、上下文构建、提示及模型配置。对可变 `latest`，先解析成固定修订再访问缓存；不能把旧内容挂在 `latest` 键下长期返回。将主体纳入键会降低共享命中，却简化个性化资料的隔离；若要跨用户共享公开内容，必须证明缓存产物只含共同可读资料，并在每次返回前重验当前读取范围。

以下是接口级伪代码，`authorization` 和 `source_registry` 是受控服务。授权返回当前范围与政策版本；源注册表返回对象在本次任务快照的哈希，不是从缓存自己读出的版本。

```text
lookup_analysis(task, principal, now):
    scope = authorization.current_scope(principal, task.source_refs)
    if scope is DENY:
        return DENIED，缓存内容不返回
    snapshot = source_registry.resolve_and_verify(task.source_refs, scope)
    if snapshot is MISSING 或 CONFLICT:
        return NEED_EVIDENCE，不拿旧候选补空
    key = digest(tenant, principal, scope.policy_version,
                 task.semantic_constraints, snapshot.content_digests,
                 context_builder_version, prompt_version, model_config_version)
    entry = cache.get(key)
    if entry 不存在:
        return MISS
    if now >= entry.expires_at:
        cache.evict(key)
        return MISS
    if entry.evidence_digests != snapshot.content_digests:
        cache.evict(key)
        return MISS
    if entry.source_refs 不是 scope.allowed_refs 的子集:
        return DENIED，不返回缓存内容
    if entry.kind != ANALYSIS_CANDIDATE 或 entry.validation_version 不被接受:
        cache.evict(key)
        return MISS
    return CANDIDATE(entry.output, entry.evidence_refs)
```

缓存返回的是候选，不是本次业务已经完成。调用方仍校验引用及任务条件，形成本次意图、请求批准并核对真实工单。源注册表不可用时，是否可复用取决于资料本来是否不可变、权限能否当前核验，以及业务允许的陈旧性；没有这些依据则等待，不能以“缓存很快”绕过权限。

更大的缓存不一定更有价值。若同一内容很少复用，存储、失效与调查成本可能超过节省；若任务允许读取大量相同不可变源，读缓存比完整答案缓存更容易维持证据关系。选择时比较同样任务的命中、正确引用、权限检查、维护成本和端到端结果，不能只报命中率。

## 模型路由改变的不只是单价

便宜模型用于格式提取，较强模型用于复杂分析，是一种可测假设。它增加了路由判断、升级请求和维护两种配置的成本。应先用代表任务独立评估小模型是否满足结构、引用和语义要求；对不满足或不确定的候选升级，升级尝试也归同一账目。

若小模型错误但自信，单靠其“置信度”决定是否升级可能漏掉最重要样本。路由可以使用可观察任务条件及确定性检查，如报告长度、证据冲突、必要字段缺失；复杂语义仍需要经校准评阅。在冻结案例上比较：单一模型基线、路由方案、必要时的普通程序提取基线。保持最终任务判据、资料和总资源上限，列出各层接受率、升级率、错放和费用。

预定义“在哪个任务层改善、哪些失败不能接受、收益不足时撤销路由”，才能防止上线后只挑擅长层宣传。这里没有实际价格和试验数据，因此不能预先断言路由一定省钱。

## 预算与限流需要一个共同执行边界

预算预留必须覆盖所有子请求和重试。在一次发送前，调度事务检查任务剩余额度、共享供应商额度和在途数量，预留该次资源，写尝试后才发。结果返回结算实际确认用量；不确定请求保留待确认状态，不把全部预留释放成可再花预算。

可读查询和写后核对可以使用预留的恢复额度，避免正常预算耗尽时永远无法确认已发效果；额度大小由实际契约决定，不能以“核对不算任务”无限使用。供应商限流的请求次数和模型用量是不同约束，只有一个任务并发数字并不覆盖它们。

队列满或预计等待超过任务期限时，明确拒绝或返回可查询排队状态。无限入队会让吞吐看似稳定、等待持续增长。对重试设置共享预算及时间条件，避免工作者、HTTP 客户端和 SDK 每层各自重试导致乘法放大；需要先确认每层实际重试行为，再规定唯一责任层。这里没有指定 SDK，不能假定所有客户端默认值一样。

并发收益的证据应解释移动了哪个瓶颈：排队降低但供应商限流升高；模型时间相同但工具读取并行缩短；成功等待降低但错误拒绝增多。只报最快一次不能区分这些情况。

## 练习与参考分析

### 修正一份“省了一半”的报告

题定数据：旧版一百任务，接受九十，全部确认费用 450 credit；新版一百任务，接受六十，确认费用 210 credit，另有十次超时请求费用未知。新版只算六十个成功样本 p95，并宣称成本省一半、所有用户更快。请给出已成立口径与待确认口径。

参考分析：旧版每接受任务成本为 5 credit；新版已确认成本的对应下界是 3.5，最终值还不能确认。不能从未知费用为零计算节省比例；十次超时尝试也不能删掉。新版每分配任务的确认支出为 2.1，完整支出待核。成功 p95只描述六十位成功者，需报告失败、超时和在途等待。正确性降低是否违反事前护栏由原任务标准决定，不能为新结果降低门槛。追加人工返工后要单列原时间及费率口径。

### 独立比较两个可行优化

设计并实现无网络实验：基线每次读取固定源；候选使用不可变源缓存或将两个独立读取并行。使用同一任务契约、到达表、资源限制、故障顺序和验收器。提交冻结工作负载、冷/热规则、全轮次账目、p50/p95、状态分母、吞吐窗口及质量结果；不得把替身延迟解释成供应商实测。

参考方案：缓存实验用相同来源快照和授权状态，改变修订或政策时必须 miss/deny；并发实验只并行无依赖读取，批准和创建不能提前。故障夹具应包含读取失败、队列饱和、费用未知和任务超时。先检查结果/过程护栏，再比较完整群体的等待和费用。优化无收益也是合法结果；关键是数据能回答为什么。

### 在未知条件下推翻一个优化

独立评阅者让一部分任务改成新修订，同时撤销一个主体的资料权限，并在同一外部到达表中注入突发请求。你原来的热缓存方案更快，但有一项回答继续引用旧修订。说明处理、归因和复验。

参考分析：先停止错误复用，核 key 是否含快照及当前授权，查看解析 `latest` 与缓存 lookup 的先后；旧修订引用是结果缺陷，不能被速度抵消。核是否产生写动作并处理实际效果。修复后重跑冷/热、新修订、权限撤销和正常授权路径，再按同一到达量观察突发排队/拒绝/重试成本。若撤销权限的数据已经返回，单列数据边界事件；换 key 不是历史事件已关闭。公开参考只能指导练习，真实迁移另设未知条件。

一份可靠优化报告回答的是：在什么任务与负载上，哪些正确结果更便宜或更快，付出了什么维护及失败代价，还有哪些收费或效果未确认。没有实际测量时，方案保持可检验假设。
