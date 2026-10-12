# 为一个任务选择最小可用方案：程序、单次模型、流程与动态 Agent

需要解释自由文本，不代表需要动态 Agent；需要多个模型调用，也不代表需要多 Agent。只有当**下一步获取什么信息或执行哪个动作必须依赖新观察，而且预先列出的路径不能合理覆盖这些变化**，动态决策才有独立价值。应先冻结任务与验收，再比较能完成同一目标的最简单方案。若普通程序已经充分，不应为使用 Agent 而增加模型；若材料足够，只需一轮归纳，也没有必要加入自主探索。

本篇回答怎样证明复杂度增加有必要，作为 [控制循环](../agent-control-loop-v07.md) 的方案选择补篇。这里不重写其恢复实现：仍沿用 `repo@8e12`、`test-report-71`，先形成带证据的缺陷说明，经维护者批准后创建唯一工单。下面是原创比较合同和未执行的接口级伪代码；没有实测胜负或多 Agent 性能数据。

## 同一任务，四种控制权

“Agent”有不同用法。本文采用行为定义：普通程序由确定性代码决定路径；单次模型在已经组好的材料上生成一次候选；固定 workflow 允许模型完成局部语义任务，但步骤与分支由代码列出；动态 Agent 让模型依据观察提议新的调查动作，运行时仍掌握授权、执行和停止。这个 workflow/agent 控制权区分与 Anthropic 2024 年文章一致；该文章已注明生态发生变化，因此这里引用架构定义，不把它作为当前框架排名或性能基准。[Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)

| 方案 | 谁选下一步 | 同一缺陷任务中的可用实现 | 应放弃或升级的条件 |
| --- | --- | --- | --- |
| 普通程序 | 代码 | 解析固定测试格式，填报告与工单模板 | 必需解释无法用现有规则覆盖的语义，规则维护成本明显上升 |
| 单次模型 | 模型只写候选，输入由代码一次构造 | 已有文件、报告和规则齐全，一次生成缺陷说明 | 需要根据结果回到环境取得新证据，或必须多步分离不同验证 |
| 固定 workflow | 代码选分支，模型完成指定节点 | 读报告→读报告所列文件→生成→校验→等待审批→创建 | 相关文件选择无法由稳定规则表达，新增分支不断依赖新观察 |
| 动态 Agent | 模型提议调查路径；运行时裁定能否执行 | 先读失败报告，再判断需读实现、调用者或规则文件 | 额外探索没有提高合格率，权限/预算/恢复代价超过收益 |

“固定”不等于只有直线：代码可以有条件分支、循环、重试和审批。把 `while retry` 写进程序不会让它变成动态 Agent。区别在于循环内是否让模型重新决定业务行动路径。相反，一个动态 Agent 也可以被限制只读、最多调查数个文件；动态性不意味着无限授权。

同一个任务可以有两部分：分析阶段采用动态只读调查，创建阶段仍使用固定审批与单写者。这比把权限、预算和审批都交给模型更容易测量因果：探索效果来自哪里，副作用控制由谁兑现。

## 先冻结 TaskContract，避免比较不同题目

本篇所有实现接收同一 `TaskContract`，返回同一 `Result`。模型配置是比较输入之一，不能让一个方案用更强模型、更多材料，然后把优势全部归于架构。

```typescript
interface TaskContract {
  task_id: string;
  goal_revision: number;
  repo_revision: "repo@8e12";
  report_id: "test-report-71";
  readable_paths: string[];          // 可信运行时注入的资源范围
  supplied_evidence_ids: string[];
  target_project: string;
  effect_slot: "defect_issue";       // 每目标修订只允许一条工单
  required_claims: string[];
  analysis_deadline: number;
  max_model_attempts: number;
  max_read_attempts: number;
  model_config_version: string;
}
type AnalysisCandidate = {
  repo_revision: string; report_id: string; failed_test: string;
  expected: string; actual: string; hypothesis: string | null;
  source_refs: string[]; missing_fields: string[];
}
type Result =
  | { kind: "CANDIDATE"; analysis_candidate: AnalysisCandidate;
      candidate_hash: string; evidence_ids: string[];
      hypotheses: string[]; missing_fields: string[] }
  | { kind: "WAIT_INPUT"; missing_fields: string[]; reason: string }
  | { kind: "WAIT_APPROVAL"; action_id: string; intent_hash: string }
  | { kind: "CREATED"; action_id: string; receipt_ref: string }
  | { kind: "WAIT_RESOLUTION"; action_id: string; reason: string }
  | { kind: "STOPPED"; reason: string; partial_refs: string[] };
```

这里 `CANDIDATE` 只表示分析阶段产物，不算完整任务成功。完整目标还须批准匹配、实际回执、无未决效果和唯一工单槽位。只比较“写了一个好看答案”的方案与真正创建了工单的方案，会把任务不同误当架构优劣。更合理的是先比较分析阶段，再在所有方案上使用同一写工具与恢复路径，测端到端结果。

`required_claims` 由目标定义，例如“失败测试、输入、预期、实际与修订”；不是模型自己降低要求。根因可以保持假设，缺少业务规则时请求补证。不允许为了提高完成率删去证据不足题或把等待算成功。

## 一个固定流程的完整决策骨架

先假定报告已列出待读文件，而且关联路径不需要语义探索。固定流程一次性读报告、按已知映射读文件、生成候选并校验。以下伪代码仅表达分析阶段，不执行写操作；后续候选进入与 v07 相同的审批及动作账本。

外部接口的合同如下：`read_report/read_source` 返回 `OK` 加不可变证据或错误分类，不执行写；`parse_report` 按冻结报告格式返回失败事实及确切路径，拒绝无法解析的报告。`model_once` 适配 [模型响应闸门](f02.md)：将真实入口的 `verdict` 解包成内部结果；保留 `CANDIDATE.value`字典、`WAIT_INPUT.fields`、`REFUSED.code` 和 `REJECTED.code`，将网络/供应商错误归为带 `code` 的 `REQUEST_UNKNOWN/PROVIDER_ERROR`，不得丢掉等待。`verify` 核必需事实、证据归属和版本，专业未知列缺项。读取和模型接口都有有限阻塞/返回期限，调用前检查不是端到端期限保证，模型返回后还需检查是否超时。这里的模型和存储接口不是现成 SDK API。

`record`保存当前目标修订、报告/仓库修订、完整结果和已用证据清单。成功分支必须把完整 `analysis_candidate`字典提交为 [e01的candidate事件](e01.md)，不是只存摘要：同一run的 `candidate_json`保存候选全部字段，事务返回的 `candidate_hash`才是权威值。内部候选摘要使用 e01 的 `digest`：键排序、`ensure_ascii=True`、紧凑JSON的UTF-8摘要；它与 c03 写意图摘要是两种明确不同的身份。`record`在该事务成功后填入返回Result的candidate_hash；提交不确定时按同事件读回，不能返回未持久候选。`store.load(run_id)`从 `runs.candidate_json`还原 `state.analysis_candidate`，从同一run读goal_revision及candidate_hash，不依赖模型对象或进程全局变量。结果/证据清单审计由外层记录保存，本例e01保存完整候选及其source_refs，不提供全套调查日志。

```python
def fixed_analysis(contract, reader, model, verifier, record, clock):
    evidence = []
    read_attempts = 0
    model_attempts = 0

    def stop(reason):
        return record(contract, {
            "kind": "STOPPED", "reason": reason,
            "partial_refs": [item.id for item in evidence]})

    if clock.now() >= contract.analysis_deadline:
        return stop("DEADLINE")
    if contract.max_read_attempts < 1:
        return stop("READ_BUDGET")
    read_attempts += 1
    report = reader.read_report(contract.report_id, contract.repo_revision)
    if report.kind != "OK":
        return stop("REPORT_" + report.code)
    parsed = reader.parse_report(report)
    if parsed.kind != "OK":
        return record(contract, {"kind": "WAIT_INPUT",
            "missing_fields": ["supported_report"], "reason": parsed.code})
    evidence.append(report)
    paths = sorted(set(parsed.source_paths))
    if not paths:
        return record(contract, {"kind": "WAIT_INPUT",
            "missing_fields": ["source_mapping"], "reason": "NO_FIXED_MAPPING"})
    for path in paths:
        if path not in contract.readable_paths:
            return stop("RESOURCE_DENIED")
        if clock.now() >= contract.analysis_deadline:
            return stop("DEADLINE")
        if read_attempts >= contract.max_read_attempts:
            return stop("READ_BUDGET")
        read_attempts += 1
        source = reader.read_source(contract.repo_revision, path)
        if source.kind != "OK":
            return stop("SOURCE_" + source.code)
        evidence.append(source)
    if clock.now() >= contract.analysis_deadline:
        return stop("DEADLINE")
    if model_attempts >= contract.max_model_attempts:
        return stop("MODEL_BUDGET")
    model_attempts += 1
    generated = model.model_once(contract, evidence)
    if clock.now() >= contract.analysis_deadline:
        return stop("DEADLINE_AFTER_MODEL")
    if generated.kind == "WAIT_INPUT":
        return record(contract, {"kind": "WAIT_INPUT",
            "missing_fields": generated.fields, "reason": "MODEL_MISSING_FACTS"})
    if generated.kind != "CANDIDATE":
        return stop("MODEL_" + generated.code)
    verdict = verifier.verify(contract, generated.value, evidence)
    if verdict.kind == "MISSING":
        return record(contract, {"kind": "WAIT_INPUT",
            "missing_fields": verdict.fields, "reason": "EVIDENCE_INSUFFICIENT"})
    if verdict.kind != "ACCEPT":
        return stop("CANDIDATE_" + verdict.code)
    return record(contract, {
        "kind": "CANDIDATE", "analysis_candidate": generated.value,
        "evidence_ids": [item.id for item in evidence],
        "hypotheses": ([generated.value["hypothesis"]]
                       if generated.value["hypothesis"] is not None else []),
        "missing_fields": []})
```

这段流程没有把语义路径选择藏进 `parse_report`：报告须有冻结格式和确定映射，否则返回缺项。也没有让 `verify` 在拒绝后调用另一个模型偷偷继续探索。如果要增加修正次数，可明确定义固定反馈节点及总预算；一旦让模型从反馈中任意选新调查路径，就应按动态循环评估。

分析之后的固定交付顺序也必须完整。下面是同一run的持久流程节点，接口语义使用c03的提交/批准/发送/核对与e01的事务；它不再调用模型选择路径。`analysis_candidate`有报告事实、单独hypothesis和证据ID，固定渲染器按字段生成标题/正文，不创造新根因；批准绑定这份不可变文本。`verifier`检查原修订/报告/批准指纹与工单版本，返回通过、拒绝或等待。所有网络返回先持久记录再推进：

```python
def fixed_delivery(run_id, store, services):
    state = store.load(run_id)
    if state.unresolved_actions_or_attempts:
        # 只查询原操作；UNKNOWN仍写入等待，不分配另一动作。
        resolution = services.reconcile_original_operation(state)
        store.record_resolution(state, resolution)
        state = store.load(run_id)
        if state.unresolved_actions_or_attempts:
            return Result("WAIT_RESOLUTION", action_id=state.unresolved_action_id,
                          reason="ORIGINAL_EFFECT_UNKNOWN")
    if state.stop_intent:
        return store.finish_stopped(state)
    if state.analysis_candidate is None:
        return Result("WAIT_INPUT", missing_fields=["analysis_candidate"],
                      reason="ANALYSIS_NOT_ACCEPTED")
    candidate = state.analysis_candidate
    args = {
        "project": state.contract.target_project,
        "title": "Failure: " + candidate["failed_test"],
        "body": ("Revision: " + candidate["repo_revision"] + "\nReport: " + candidate["report_id"]
                 + "\nExpected: " + candidate["expected"] + "\nActual: " + candidate["actual"]
                 + "\nRoot-cause hypothesis: " + (candidate["hypothesis"] or "unconfirmed")),
        "evidence_ids": candidate["source_refs"],
    }
    action = store.commit_or_reuse_issue_intent(state, args)  # 唯一槽位/指纹原子检查
    if action.kind == "CONFLICT":
        return Result("STOPPED", reason="INTENT_CONFLICT", partial_refs=candidate["source_refs"])
    if not store.current_approval_matches(action):
        return Result("WAIT_APPROVAL", action_id=action.action_id, intent_hash=action.intent_hash)
    if action.effect_resolution == "NOT_SENT":
        dispatch = store.begin_authorized_attempt(action)    # 当前权限/期限/取消/预算
        if dispatch.kind != "DISPATCH":
            return dispatch.as_result()
        outcome = services.invoke_issue(dispatch)            # 含超时→UNKNOWN适配
        store.record_outcome(dispatch, outcome)
        action = store.load_action(action.action_id)
    if action.effect_resolution == "UNRESOLVED":
        return Result("WAIT_RESOLUTION", action_id=action.action_id, reason="RECEIPT_UNKNOWN")
    if action.effect_resolution != "CONFIRMED_SUCCESS":
        return Result("STOPPED", reason="ISSUE_NOT_ACCEPTED", partial_refs=candidate["source_refs"])
    verdict = services.verifier.check(state.contract, candidate, action)
    store.record_verdict(action, verdict)
    if verdict.kind != "ACCEPT":
        return verdict.as_result()                           # 等待/拒绝保留差异
    # 事务重读取消、目标/候选/回执版本与未决状态，过期verdict不可用。
    completed = store.complete_current_goal(run_id, verdict)
    if completed.kind != "COMPLETED":
        return completed.as_result()
    return Result("CREATED", action_id=completed.actions[0].action_id,
                  receipt_ref=completed.actions[0].receipt_ref)
```

这里存储/服务方法的原子性、错误及权限合同在[c03](c03.md)和[e01](e01.md)展开；不是可直接执行的SDK。`unresolved_action_id`来自权威账本，本任务只有一个写槽位；`complete_current_goal`把e01事件结果转换为内部记录。只有其 `COMPLETED`返回的唯一动作及回执引用，才能映射到对外 `CREATED`。`receipt_ref=actions/{action_id}/receipt`是本教学存储的记录引用，由获准读回入口解析到该动作的不可变已确认回执，不是供应商URL。WAIT_RESOLUTION保留原action_id，取消结果按STOPPED/WAIT_RESOLUTION映射，不因一个晚到回执宣告CREATED。

沿正常夹具演算：f02返回完整字典，`expected="True"/actual="False"`、两个冻结source_refs和允许为空的hypothesis；分析验收后 `record`提交完整candidate事件。交付重读字典，渲染准确参数，用 c03唯一规范计算意图，等待批准，再由 e01 begin/适配器/outcome记录同一动作。验收verdict绑定存储候选哈希、目标修订、意图及回执版本；complete重读这些绑定后返回同一action和receipt_ref，外层才返回CREATED。规则缺失而仍有必需字段时走WAIT_INPUT，不能把这条演算当实际成功数据。固定流程的控制路径仍由代码列举；动态Agent的不同只在调查路径决定权，共享写操作条件不能删减。

对这类输入，程序先提取事实，再让单次模型组织文本，通常能减少把基础字段交给模型猜测的机会。这是设计推理，不是测量结果。若最终说明仅由固定字段组成，连组织文字也可使用模板；是否需要模型取决于目标是否要求超出模板的解释。

## 三种输入暴露不同的必要性

第一种输入已有报告、实现和业务规则，且测试失败是固定字段。普通程序可输出失败事实；需要解释时一轮模型足够。动态 Agent 再读取同样材料只增加路径与失败面，除非比较表明它改善了事先定义的缺陷。

第二种输入报告只给栈位置，根因可能在调用者的日期单位或实现边界。若稳定规则能列出“实现与调用者”两处，固定 workflow 仍够用。只有当下一处相关文件需依据刚读到的参数来源来判断，路径树无法合理穷举时，动态只读 Agent 才有优势候选。它也必须在证据包、资源范围与预算内调查，不能从“不知道读哪里”推导“允许读所有东西”。

第三种输入有两份同级规则冲突，且无法判断哪份适用。更多 Agent 不会创造业务权威。正确输出是 `WAIT_INPUT`，列明冲突范围和需要的版本确认；若让几个模型投票选一个规则，只是给未经授权的裁决增加票数。

## 多 Agent 的升级点是可分工，而不是人数

如果有两个可独立核对的证据子问题，例如实现控制路径与测试夹具生成方式，可以分别调查，再由一个分析整合者比对。但“两个模型都认为根因相同”不是独立事实：它们可能共享同一错误资料和推理偏差。

一个可检查的交接至少包含 `subtask_id`、目标修订、输入证据清单与哈希、允许资源、输出主张与逐项引用、缺项、实际消耗、状态。整合者先查版本与权限，再整合结论；超时或 `INCOMPLETE` 不能当作“没有问题”。两位调查者对同一事实冲突时保留冲突，不按最后到达的答案覆盖。

写操作始终只有一个所有者，子代理只交建议。所有人的模型与读取尝试计入同一任务预算：并行可能降低关键路径等待，却不会自动降低总费用。调度器必须预留子任务额度；子任务取消后的在途用量仍可能未知。若交接上下文比直接分析更长、分工互相等待或反复重新解释同一证据，说明拆分没有带来有效并行。

升级多 Agent 的具体条件可写成可证伪假设：“两类证据能独立调查，在总预算不增的情况下减少漏掉测试夹具问题，且不会增加无支持根因和越权读取。”若实验只显示更长说明、更多引用而关键错误没有减少，就放弃升级。若瓶颈是一个不可并行的外部写调用，多 Agent 也不能移除它。

## 怎样做一个公平且能定位原因的比较

冻结相同任务集，分别标记材料完整、需动态调查、证据冲突；固定资料与工具版本、权限、验收器、模型快照与采样配置、总期限和资源上限。各方案可有不同路径，但不能偷偷取得测试集答案。记录每题的候选合格、完整目标合格、正确等待、错误完成、读/模型尝试、用量、端到端延迟和未知结果。

先按失败类型拆解：固定映射没覆盖的题，是路径表达能力问题；证据已齐却误读，是分析问题；候选正确但写入恢复失败，是共享工具边界问题。仅用平均成功率会把这三种因果混在一起。重复试验应保留每次输入与随机性，不用一个最好的轨迹代表稳定能力；测量方法与不确定性在 [评价章节](e02.md) 展开。

例如材料完整的教学题，普通程序零次模型、单次模型一次、动态模型可能多次；这只是允许路径的演算，实际调用数要从轨迹取得。没有运行数据，就不能填“快了30%”或给架构排名。选型报告应写明何类题的缺陷值得追加复杂度，并交下一轮实测验证。

## 用条件做选择的练习

**固定字段还是 Agent？**报告格式稳定、所需说明只有输入/预期/实际，维护者禁止推断根因。参考分析：普通程序加模板满足目标；LLM 和动态调查没有目标内收益。保留错误解析与缺项分支，不能因为不用模型就省掉验收。

**未知路径。**失败报告给 `service.py`，读后发现它调用动态注册的处理器，实际处理器随配置变化。固定流程读两处能否足够？参考分析：先看配置和注册是否能以确定规则解析；能则扩充固定流程。若名称与语义关系需要依据观察逐步判断，可试动态只读 Agent，但保持同一修订、资源范围和最大调查次数。一次题目复杂不足以证明整个产品应全面 Agent 化。

**协作失败。**代码调查员用 `repo@8e12`，测试调查员交来 `repo@9a01` 的报告，却两者结论一致。参考分析：交接版本不匹配，整合者应拒绝合并并重新取得同修订证据；一致结论没有消除条件差异。把第二位换为更强模型并不修复输入合同。

**升级实验。**设计一组同预算的固定流程与动态循环对照，写出会支持升级、会使你保留固定流程的结果。参考分析：支持升级需要目标内合格改善来自新观察选路，并且错误完成、越权和成本护栏仍满足事前要求；保留固定流程的结果包括材料完整题优势相近、动态题失败源于模型误读而非缺路径、或新增调查不带来可验证收益。具体产品通过门槛由产品责任人定义，本文不自创认证分数。
