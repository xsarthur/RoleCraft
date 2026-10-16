# 写工具的契约：把提议变为可批准、可去重、可核对的动作

一个可靠的写工具应把三件事分开：模型提议、运行时准许的逻辑动作、下游实际发生的效果。提议通过结构校验还不够；当前身份须有对象权限，准确内容须获批准，逻辑身份和参数须持久固定。请求超时之后，先核对原动作，不能换一个请求 ID 再写。这个结论适用于重复效果有业务代价、操作不参与本地数据库事务的接口。

本篇只设计 `create_issue`：把 `repo@8e12/test-report-71` 的缺陷说明创建到 `refund-maintenance` 项目，可信租户 `tenant-dev`，每个目标修订只允许唯一缺陷工单。工具、回执和事件均为原创教学合同；作者编写时未执行。独立 QA 此前在 Python 3.12.14 检查了无网络替身与适配器，当前共享规范/适配返修待受影响复验，版本和具体范围见 [QA 记录](../../team/textbook-v08-qa.md)。接口级运行时伪代码、真实工单和 Python 3.14 目标环境未测。先修为 [方案选择](c01-solution-selection.md)、[API 边界](f01.md) 及 [控制循环](../agent-control-loop-v07.md) 的动作身份。

## 工具名与合法 JSON 都不能授执行权

模型返回 `create_issue`、参数和 `tool_call_id`，只是本次协议中的建议。执行器才调用业务实现，结果必须回传到同一次调用。OpenAI 的函数调用流程也明确区分模型返回调用、应用执行以及回传结果；其具体消息格式应由协议适配器转换成本文内部类型，不把内部 `Outcome` 当 SDK 返回。[OpenAI Function calling](https://developers.openai.com/api/docs/guides/function-calling)

输入合同只有 `project`、`title`、`body`、`evidence_ids`。租户、身份、批准和幂等键不开放给模型：可信运行时注入身份，首次意图事务分配键，审批入口保存批准。`project` 可作为资源选择，但须匹配当前允许项目。未知字段拒绝，不把模型传来的 `tenant=team-secret` 合并到身份。

正文不仅要有字符串，还要满足业务要求：非空、大小有界，引用属于已核证据包，根因未知明确为假设；是否能支持分析由证据/专业验收负责，工具执行前不能重新生成正文。工具层核动作合法性，不能包办任意语义证明。执行权限应在每次请求检查，默认拒绝和按对象授权的依据见 [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)；本文的具体项目范围是原创策略。

## 一个意图，多个协议调用与发送尝试

`tool_call_id` 只关联一轮模型消息；`action_id` 是逻辑意图；`attempt_id` 是一次物理发送。模型第二次提出相同内容，会有新协议 ID，却应绑定同一动作。不能拿参数哈希直接当逻辑身份：两个真正不同的用户意图也可能有相同参数。本任务用唯一槽位表达“一条缺陷工单”：

```text
effect_slot = (tenant-dev, run_id, goal_revision, defect_issue)
```

槽位内同指纹复用原动作；不同指纹返回 `INTENT_CONFLICT`，不静默替换已批准、在途或已成功的正文。新目标确实需要另一条时，由可信目标变更创建新版本或明确槽位；不得把一次旧批准迁移过去。

`intent_hash` 绑定工具版本与准确参数。本书采用唯一原创协议 `issue-json-utf8-v1`，下面的代码保存为 `issue_contract.py`，是本篇及 [持久恢复](e01.md) 共用的实现。正文和标题不修剪空白、不作 Unicode 归一化；证据 ID 是集合，排序去重后保存。约束按 UTF-8 字节计数：项目最多 100 字节、标题 200、正文 10000、每个证据 ID 200，输入证据列表最多 32 项且不得为空。这些上限是教学选择，不是供应商保证。

```python
import hashlib
import json

ISSUE_TOOL_VERSION = "create_issue/v1"
ISSUE_CANONICAL_VERSION = "issue-json-utf8-v1"

class IssueContractError(ValueError):
    pass

def issue_text(value, field, max_bytes):
    if type(value) is not str or not value.strip():
        raise IssueContractError("INVALID_" + field.upper())
    try:
        encoded = value.encode("utf-8", errors="strict")
    except UnicodeEncodeError as exc:
        raise IssueContractError("NOT_UTF8_" + field.upper()) from exc
    if len(encoded) > max_bytes:
        raise IssueContractError("TOO_LARGE_" + field.upper())
    return value

def canonical_issue_arguments(arguments):
    fields = {"project", "title", "body", "evidence_ids"}
    if type(arguments) is not dict or set(arguments) != fields:
        raise IssueContractError("ARGUMENT_FIELDS")
    evidence = arguments["evidence_ids"]
    if type(evidence) is not list or not 1 <= len(evidence) <= 32:
        raise IssueContractError("EVIDENCE_LIST")
    return {
        "project": issue_text(arguments["project"], "project", 100),
        "title": issue_text(arguments["title"], "title", 200),
        "body": issue_text(arguments["body"], "body", 10000),
        "evidence_ids": sorted(set(issue_text(item, "evidence_id", 200)
                                   for item in evidence)),
    }

def canonical_issue_bytes(tool_version, arguments):
    if tool_version != ISSUE_TOOL_VERSION or type(tool_version) is not str:
        raise IssueContractError("TOOL_VERSION")
    payload = {"canonical_version": ISSUE_CANONICAL_VERSION,
               "tool_version": tool_version,
               "arguments": canonical_issue_arguments(arguments)}
    return json.dumps(payload, sort_keys=True, ensure_ascii=False,
                      allow_nan=False, separators=(",", ":")).encode("utf-8", errors="strict")

def canonical_issue_hash(tool_version, arguments):
    return hashlib.sha256(canonical_issue_bytes(tool_version, arguments)).hexdigest()
```

规范载荷只含上述三个字段，嵌套参数也只含四字段；JSON 键按名称排序，证据按 Python 字符串码点顺序排序，分隔符不留空格，非 ASCII 字符直接编码 UTF-8。批准和下游都绑定这同一串字节的 SHA256 十六进制值，不对原始模型 JSON 或数据库 JSON 文本另算意图摘要。跨语言实现必须逐项复现该协议；新增字段、排序或编码规则必须换协议版本。旧指纹不能重新计算后覆盖批准：不兼容记录暂停发送，保留原键、参数和历史批准，另行迁移及重新审批。

数据库同时对槽位、动作键和 `(model_attempt_id, tool_call_id)` 绑定设置唯一约束。同参数重提得到原回执，但回传关联用**新的** `tool_call_id`。两个并发调用先查都为空的竞态，必须由事务和唯一约束裁决，不能用“模型通常不会重复”解释掉。

## 审批绑定不可变动作，重发资格另行核对

批准记录至少绑定 `approval_request_id/run_id/goal_revision/action_id/tool_version/intent_hash`、审批者范围、期限和撤销状态。可信审批入口必须核当前请求 ID、指纹和审批者权限。模型文字“用户已经批准”不能创建记录。执行时使用保存的参数，不让模型补写一个收件人或改正文后沿用旧指纹。

本篇采用批准逻辑动作：首次发送时将批准消费并绑定该动作；相同动作的合法恢复可沿原绑定，而另一动作不能复用已消费批准。恢复并非无条件第二次发送：须当前权限仍允许、批准未失效、原参数/键一致、下游去重窗口有效，并有核对记录产生的重发许可。若产品要求每次物理发送另批，另定义尝试级批准；不能在实现中混用这两种合同。

停止或权限撤销后不生成重发许可。已发送动作仍须查询：拒绝未来发送不证明过去没有效果。取消后查到成功，记录已发生工单，但不把任务转成完成。创建与补偿/删除也不是同一动作；本任务未授权删除错误工单。

## 本地事务和下游接口各承担哪一半

下面的运行时伪代码只展示一个写工具；存储事务的实际落地在 [持久恢复](e01.md)。`store.transaction` 同时检查目标版本、推进代次、当前修订，成功才提交。事务中的方法读写同一数据库，不调网络；失败即整体回滚。网络发送永远在事务外。

```python
def submit_issue_proposal(run, call, principal, evidence_package, store):
    try:
        args = canonical_issue_arguments(call.arguments)
    except IssueContractError as exc:
        return Observation(call.tool_call_id, "REJECTED", str(exc))
    if args["project"] not in principal.writable_projects:
        return Observation(call.tool_call_id, "REJECTED", "PROJECT_DENIED")
    if not set(args["evidence_ids"]).issubset(evidence_package.verified_ids):
        return Observation(call.tool_call_id, "REJECTED", "EVIDENCE_DENIED")
    intent_hash = canonical_issue_hash("create_issue/v1", args)
    slot = (principal.tenant_id, run.run_id, run.goal_revision, "defect_issue")
    with store.transaction(run.revision, run.lease_epoch) as tx:
        old = tx.find_slot(slot)
        if old is not None and old.intent_hash != intent_hash:
            tx.bind_rejection(call, "INTENT_CONFLICT")
            return Observation(call.tool_call_id, "REJECTED", "INTENT_CONFLICT")
        if old is None:
            # 本事务检查新增逻辑动作预算；不足则不创建任何新意图。
            if not tx.reserve_logical_action():
                tx.bind_rejection(call, "ACTION_BUDGET")
                tx.request_stop("ACTION_BUDGET")
                return Observation(call.tool_call_id, "REJECTED", "ACTION_BUDGET")
            old = tx.insert_action(slot, args, intent_hash,
                action_id=new_uuid(), idempotency_key=new_uuid(),
                tool_version="create_issue/v1", status="WAIT_APPROVAL",
                effect_resolution="NOT_SENT")
            tx.create_approval_request(old)
        tx.bind_call(call.model_attempt_id, call.tool_call_id, old.action_id)
        return ActionReference(old.action_id, old.status)

def dispatch_issue(run, action, policy, store, downstream, now):
    # policy返回当前项目/工具访问决定及其版本；不信模型传来的身份。
    gate = policy.check(run.principal, action.immutable_arguments["project"])
    with store.transaction(run.revision, run.lease_epoch) as tx:
        current = tx.reload_action(action.action_id)
        if tx.stop_intent() or now >= tx.deadline():
            tx.request_stop("CANCELLED_OR_DEADLINE")
            return Control("STOP")
        if gate.kind != "ALLOW" or not tx.policy_version_matches(gate.version):
            return Control("DENIED_OR_RECHECK")
        if not tx.approval_current_and_bound(current, now):
            return Control("WAIT_APPROVAL")
        if current.effect_resolution == "UNRESOLVED":
            if not tx.replay_permit_current(current, now):
                return Control("WAIT_RESOLUTION")
        elif current.status != "READY":
            return Control("NOT_DISPATCHABLE")
        if not tx.reserve_tool_attempt():
            tx.request_stop("TOOL_BUDGET")
            return Control("STOP")
        attempt = tx.begin_attempt(current, new_uuid())
        tx.set_effect(current, "IN_FLIGHT", "UNRESOLVED")
        tx.consume_approval_or_replay_permit(current, attempt)
        dispatch = tx.issue_dispatch_token(current, attempt)
    # token只准许这次attempt、原参数与原键；失去本地推进权不撤销已发请求。
    outcome = downstream.create(dispatch)
    # 结果提交核operation/action/intent_hash；迟到结果不直接覆盖新代次。
    return store.commit_outcome(dispatch.attempt_id, outcome, run.lease_epoch)

def reconcile_issue(action, downstream, store):
    lookup = downstream.lookup(action.idempotency_key)
    if lookup.kind == "CONFIRMED_SUCCESS":
        receipt = lookup.receipt
        if receipt.operation_id != action.idempotency_key:
            return store.wait_resolution(action, "RECEIPT_OPERATION_MISMATCH")
        if (receipt.intent_hash != action.intent_hash
                or receipt.project != action.immutable_arguments["project"]):
            return store.record_conflict(action, receipt)  # 已有效果，禁止重建
        return store.record_success(action, receipt)
    if lookup.kind == "CONFIRMED_NO_EFFECT":
        # 证明须覆盖全部已发尝试及可能迟到请求；只证明最后一次失败不够。
        return store.record_no_effect(action, lookup.proof, lookup.retryable)
    if lookup.kind == "SAFE_REPLAY_AVAILABLE":
        # 不解除UNRESOLVED；发出仍须dispatch的权限/批准/预算闸门。
        return store.record_replay_permit(action, lookup.permit)
    return store.wait_resolution(action, lookup.reason)
```

`commit_outcome` 的归约不是“最后一次结果获胜”。成功回执可确认逻辑动作；单次 `KNOWN_NO_EFFECT` 只证明该尝试，早先未知尝试仍保留；全部尝试的无效果证明或操作级终结证据才能清除未决。已发生却内容错位记 `CONFIRMED_CONFLICT`，不是普通可重试失败。旧代次回执可以留给当前恢复者核对采纳，不能无条件推进任务。

下游须明确提供操作级核对和去重合同：相同键同参数在保留窗口内不增加效果，同键不同参数冲突，去重记录与实际对象原子关联，并定义并发请求、错误结果和到期后的行为。AWS 的幂等 API 设计强调调用者意图标识及幂等记录与变更的一致性。[AWS Making retries safe](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/)

不能仅凭“支持 Idempotency-Key”假设永久恢复。Stripe API v1 的官方合同会保存开始执行后的结果，同键可能重得已保存错误，键存在清理窗口；真实工单接口要查它自己的合同，不能套支付服务语义。[Stripe Idempotent requests](https://docs.stripe.com/api/idempotent_requests)

## 一个有真实效果账本的无网络替身

为验证“创建成功但回执丢失”，替身必须先记录工单，再抛超时。将本节替身和随后适配器代码合并保存为 `c03_issue.py`，与 `issue_contract.py` 放在同一练习目录。代码使用 Python 3.14 标准库，`threading.Lock` 只保证当前进程内两张字典一起变化。它不是持久远端服务，进程退出就失去对象与去重记录；跨重启练习需换成独立持久替身。

```python
from copy import deepcopy
from threading import Lock

class IssueStub:
    def __init__(self):
        self.lock = Lock()
        self.operations = {}
        self.issues = {}

    def create(self, key, intent_hash, args, lose_reply=False):
        with self.lock:
            old = self.operations.get(key)
            if old is not None:
                if old["intent_hash"] != intent_hash:
                    return {"kind": "CONFLICT", "code": "KEY_ARGUMENT_CONFLICT"}
                return {"kind": "SUCCESS", "receipt": deepcopy(old)}
            issue_id = "ISSUE-" + str(len(self.issues) + 1)
            receipt = {"operation_id": key, "issue_id": issue_id,
                       "intent_hash": intent_hash, "project": args["project"], "version": 1}
            self.issues[issue_id] = deepcopy(args)
            self.operations[key] = receipt
        if lose_reply:
            raise TimeoutError("REPLY_LOST_AFTER_CREATE")
        return {"kind": "SUCCESS", "receipt": deepcopy(receipt)}

    def lookup(self, key):
        with self.lock:
            receipt = self.operations.get(key)
            if receipt is not None:
                return {"kind": "CONFIRMED_SUCCESS", "receipt": deepcopy(receipt)}
            # 本地查不到仍保守返回未知；真实接口的无效果证明另有合同。
            return {"kind": "INDETERMINATE", "reason": "NO_OPERATION_RECEIPT"}
```

接口伪代码的 `downstream.create(dispatch)`不是直接调用上述替身方法。下面是它的完整局部适配代码；发送令牌载荷由意图/尝试事务产生，字段不能来自模型，执行器还须校验令牌有效性。本替身没有网络异常，真实HTTP适配器遇连接断开或超时也按同样未知分支归约。未预料的本地程序错误不伪造成有证明的无效果：让工作者退出，已提交尝试继续保持未决。

```python
from dataclasses import dataclass
from issue_contract import (ISSUE_TOOL_VERSION, IssueContractError,
                            canonical_issue_arguments, canonical_issue_hash)

@dataclass(frozen=True)
class Dispatch:
    action_id: str
    attempt_id: str
    idempotency_key: str
    intent_hash: str
    arguments: dict

class IssueAdapter:
    def __init__(self, stub, lose_reply_attempts=frozenset()):
        self.stub = stub
        self.lose_reply_attempts = lose_reply_attempts

    def create(self, dispatch):
        args = canonical_issue_arguments(dispatch.arguments)
        if (args != dispatch.arguments
                or canonical_issue_hash(ISSUE_TOOL_VERSION, args) != dispatch.intent_hash):
            raise IssueContractError("DISPATCH_INTENT_MISMATCH")
        binding = {"action_id": dispatch.action_id, "attempt_id": dispatch.attempt_id,
                   "operation_id": dispatch.idempotency_key,
                   "intent_hash": dispatch.intent_hash}
        try:
            reply = self.stub.create(dispatch.idempotency_key, dispatch.intent_hash,
                                     dispatch.arguments,
                                     dispatch.attempt_id in self.lose_reply_attempts)
        except TimeoutError:
            return {**binding, "kind": "UNKNOWN", "code": "REPLY_UNKNOWN"}
        if reply["kind"] == "CONFLICT":
            # 只知本次参数冲突；此前同操作是否有效果仍由lookup核对。
            return {**binding, "kind": "KNOWN_NO_EFFECT",
                    "retryable": False, "proof_scope": "THIS_ATTEMPT_ONLY",
                    "code": reply["code"]}
        receipt = reply.get("receipt")
        if (reply["kind"] != "SUCCESS" or type(receipt) is not dict
                or receipt.get("operation_id") != dispatch.idempotency_key
                or receipt.get("intent_hash") != dispatch.intent_hash
                or receipt.get("project") != dispatch.arguments["project"]
                or type(receipt.get("issue_id")) is not str or not receipt["issue_id"]
                or type(receipt.get("version")) is not int or receipt["version"] < 1):
            return {**binding, "kind": "UNKNOWN", "code": "UNTRUSTED_RECEIPT"}
        return {**binding, "kind": "SUCCESS", "receipt": receipt}
```

`commit_outcome`接收上述映射并按原attempt/action查账，UNKNOWN也要提交；查询成功的采纳事务再次核操作ID、项目、指纹及对象版本。字段一致证明回执绑定同意图，实际内容符合批准仍须按下游回执保证或对象版本读回；没有这种保证就保留核对，不能只比较相同正文哈希采纳另一个操作。适配层的单次冲突不会解除历史未知尝试。

执行器将 `TimeoutError` 归为 `UNKNOWN`，而不是无效果失败。第一次 `lose_reply=True` 后，运行时只有未决，替身实际已有一条工单；按原键查询才能把它变成已确认成功。用新键调用会多出工单，这是故障断言必须检查的业务对象数。相同原键合法重试可返同回执，物理请求数增加而对象数不增；二者分别计数。

## 取舍与失效顺序

如果目标是保存本地草稿，意图、草稿与回执能放进同一个数据库事务，恢复简单得多；如果目标明确要求外部工单，这个替代不能冒充已完成目标。可选下游中，优先选择有稳定操作查询与清楚去重窗口的接口；仅有工单列表查询时，普通“没找到”可能受延迟和分页影响，不足以证无效果。完全不能查询也不能安全同键重发，就保留未决并由责任方核对，不能靠客户端重试实现恰好一次。

参数变更发生在批准后、发送前，应返回新指纹待批准；发生在发送后，不能以第二条正确工单抹去第一条错误工单。权限撤销发生在最后检查后、网络发送前，仍存在竞态：本篇保证检查点的准入，不保证远端立即撤销。若需要更强保证，下游也须按当时身份授权或接受可撤销授权令牌。

存储失败时停止新发送；结果事务失败时先确认提交事件是否已存在，再核外部效果。不要把数据库回执丢失归为“工具没有执行”。这些故障与租约的实际落地在 [持久恢复](e01.md)，本篇工具接口不提供生产数据库保证。

**练习：同意图新调用。**原 `call-create-7` 已建工单，新轮 `call-create-12` 内容一致。参考分析：唯一槽位与指纹复用原 `action_id`，新增协议绑定，用 `call-create-12` 回传原回执。换幂等键会把重提变成新效果；回传旧调用ID会破坏协议关联。若内容不同，返回意图冲突，不自动编辑。

**练习：字节协议与批准。**标题为“第七天退款失败”，正文含中文及换行；把两个冻结证据 ID 的顺序互换并重复一个。参考分析：规范参数及意图指纹相同，数据库保存同一排序去重列表。改正文末尾换行、使用视觉相同但码点不同的字符串，指纹不同；不能沿原批准。将 `\ud800` 放进合法解析 JSON 的正文仍必须在编码检查拒绝。旧实现使用 `ensure_ascii=True` 算出的摘要不得换成新值后继续执行：原批准绑定旧值，本协议拒不兼容，需要明确迁移及重批。

**练习：审批复用与合法恢复。**批准已绑定并消费给原动作；开发者拟拿它授权另一个动作。参考分析：拒绝新动作复用。原动作未知且核对允许有效同键重发时，可按本文逻辑动作批准合同继续，但仍查期限、撤销、当前权限、原指纹和重发许可。取消后仅核对，不重发。这两个分支不能用“批准只用一次”一句混掉。

**练习：证明未知窗口。**先给替身 `lose_reply=True`，记录运行时未决和替身对象，再查询；另试同键不同参数及越权项目。预期为核对后同一工单、参数冲突不增加对象、越权在执行前拒绝且零下游调用。提交尝试数、对象数、原参数/批准绑定及每个调用ID的观察。进程重启需使用下一章的独立持久替身，内存字典不能提供该证据。
