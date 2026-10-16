# AGDEV 入组诊断 D0：学习者原始回答

- diagnostic_id: D0-AGDEV-20261015-LOCAL-01
- role_id: AGDEV（Agent 开发者）
- answer_version: d0-agdev-learner-responses-v0.2
- learner_identity: AGDEV-local-sandbox-learner（本次诊断身份，不是人事身份或能力认证）
- date: 2026-10-15（Asia/Shanghai）
- execution_scope: 仅本地文件和静态回答；没有调用外部服务、真实模型、网络、账户、数据库或应用入口
- independent_review: 未由 QA 复核；总体 insufficient_evidence

本文件记录原始回答、计划中的确定性 stub 工件、观察线索和补学问题。D0-03 的
AgentSpec 与事件轨迹是**拟运行夹具**，只用来说明可执行合同；本轮没有运行它，不能
写成应用、HTTP、检索服务或生产成功。所有涉及真实供应商、真实权限、持久任务、用户
价值和职业胜任的判断均为未验证。

## D0-01 职责边界

### 原始回答

我的唯一责任是实现 Agent 的运行循环和检索编排：把已确认的输入交给允许的只读检索
工具，校验返回的目标、来源、版本和权限，再驱动有限状态、工具调用、检查点、停止、
取消和可回放事件。模型（如获准存在）只能提出结构化候选；宿主负责验证和执行。我不
负责教材内容正确性、检索索引/召回算法、账户数据、权限数据库、模型供应商、客户端
界面或独立质量结论。

我明确不越界：

1. 不改教材正文、题意、课程结构或答案来源；交课程/教材/内容检索岗位。
2. 不改账户、权限、租约、任务表、数据库迁移或恢复存储；交后端数据工程师。
3. 不替模型服务岗位配置供应商、提示模板、计费或生成质量；只消费已批准的模型接口。
4. 不改客户端页面、视觉、路由或无障碍；只提供状态、错误和来源字段合同。
5. 不替 QA 验收、删除首轮失败、降低门槛或把自查写成独立证据。
6. 未获批准不调用外部网络、付费模型、有写副作用的工具、其他账户、上传或发布。

立即停止并升级的条件是：检索无匹配/歧义/缺少来源字段或版本冲突；工具超时而效果
未知；写工具权限、租户、批准或幂等键不明；输入、运行时、checkpoint 或权限版本
不兼容；预算、步数、时间耗尽；发现提示注入、无限循环或日志泄露。停止时保留原始
事件和失败原因，不补造答案、不换新幂等键重发。无匹配交内容检索和产品岗位澄清，
来源版本交内容检索复核，权限/效果账本交后端，模型不可用交 AI 生成岗位，独立复验
交 QA；项目经理只协调，不替责任岗位作结论。

### 职责—交接摘要

| 情形 | 我做的动作 | 接收岗位 | 本次证据边界 |
|---|---|---|---|
| no_match 或歧义 | 写入 needs_clarification，不生成补答 | 内容检索、产品经理 | 未验证索引是否真的缺内容 |
| 来源缺失/版本冲突 | 写入 source_version_conflict，阻断后续动作 | 内容检索、QA | 未核当前索引 manifest |
| 模型不可用/预算不足 | 写入 awaiting_model 或 budget_exhausted，不伪造成功 | AI 生成工程师、产品经理 | 未调用真实模型 |
| 权限或写副作用不明 | 发送前 permission_conflict；已发出且无回执为 unknown_effect | 后端数据工程师、QA | 未触达任何写工具 |
| 账户/任务迁移 | 只提交版本化迁移需求，停止跨数据边界 | 后端数据工程师、项目经理 | 未改数据库 |

## D0-02 机制解释

### 原始回答：状态、工具和检查

对于“按教材定位小节”的窄任务，我先选一次只读检索或固定 workflow；只有观察结果
会改变下一步问题，且步数、时限和预算有上限，才需要单 Agent 控制循环；没有互不
共享的安全子任务和可分配预算时不启用多 Agent。选择更简单的方案是为了可回放和低
成本，并不声称它已在用户场景中优于其他方案。

~~~text
received
  -> validating (输入、版本、权限、预算)
  -> retrieving (只读 retrieval.read)
  -> checking (schema、来源 path、source_hash、corpus/index 版本)
  -> committing (只提交已核事实和事件)
  -> succeeded

任何阶段 -> needs_clarification | source_version_conflict | permission_conflict
           -> failed | cancelled | paused | budget_exhausted
~~~

每轮循环只允许一个已授权工具调用；调用前检查 effect、资源范围、批准、租户和
幂等要求，调用后检查响应 schema、候选目标、来源版本、hash 和允许根目录。成功提交
递增 revision 和 checkpoint。重试只适用于合同允许的只读失败；写动作只能继续使用
原 action_id/idempotency_key。超时或丢失回执是 unknown_effect，必须查询效果账本
后再决定，不能直接当失败、也不能换 key 重发。取消停止新的本地动作，但迟到回执仍
按原 run 记录。满足成功标准、证据缺失/冲突、权限不足、无进展或预算/时间/步数耗尽
时停止，并记录 stop_reason 与下一责任岗位。

### 未验证的机制假设

上述机制假设教材根目录、来源清单、事件存储和运行时版本已冻结。它没有证明模型
输出质量、索引召回、数据库租约、外部写工具幂等、生产延迟/费用或真实学习效果。

## D0-03 熟悉任务：本地确定性 stub（未运行）

### AgentSpec（计划夹具 agent-spec-v1）

~~~json
{
  "schemaVersion": "agent-spec-v1",
  "agentId": "rolecraft-learning-local-sandbox",
  "agentVersion": "d0-agdev-sandbox-0.2",
  "taskType": "content_guidance",
  "goal": "根据版本化教材定位具体小节，不生成无来源答案",
  "inputSchema": {"query": "string", "corpusVersion": "string", "runId": "string"},
  "successCriteria": ["candidate exists", "source version and hash pass", "target section is present"],
  "stopCriteria": ["no_match", "source_version_conflict", "permission_conflict", "max_steps", "timeout"],
  "budget": {"maxSteps": 3, "timeoutMs": 1000, "maxCostUsd": 0},
  "allowedTools": [{"toolId": "retrieval.read", "effect": "read", "permission": "content:read"}],
  "allowedSources": [{"corpusVersion": "textbook-v12", "root": "sites/rolecraft/textbooks/v12"}],
  "outputSchema": {"status": "recommended|needs_clarification|no_match", "results": "array", "stopReason": "string"}
}
~~~

stub 只允许一个内存 retrieval.read，查询“控制循环如何停止”时返回固定的
c01-control-loop 候选；其他查询返回 no_match。宿主会检查 corpusVersion、
sectionId、sourcePath、sourceHash 和只读权限，然后才提交推荐。stub 不读任意
用户路径、不写文件/数据库、不联网、不调用模型。

### 计划事件轨迹（仅设计，execution_status: not_run）

**正常命中：**

| seq | event | state/result |
|---:|---|---|
| 1 | task_received | received，run_id 已生成 |
| 2 | state_changed | received -> validating |
| 3 | retrieval_requested | retrieval.read，effect=read |
| 4 | retrieval_returned | candidate=c01-control-loop |
| 5 | proposal_checked | schema、版本、path、hash、权限均待检查 |
| 6 | state_committed | revision 1、checkpoint 待写入 |
| 7 | task_succeeded | recommended，stopReason=evidence_bound_recommendation |

**无匹配：**

| seq | event | state/result |
|---:|---|---|
| 1 | task_received | received |
| 2 | state_changed | received -> validating |
| 3 | retrieval_requested | 仍为只读调用 |
| 4 | retrieval_returned | no_match，空结果 |
| 5 | stop_decided | needs_clarification，不请求模型 |
| 6 | task_finished | model_calls=0，tool_writes=0 |

这些是待运行的事件序列，不是收据；本轮没有执行命令、没有启动应用或服务、没有
计算源文件 hash，也没有 QA 回放。不能将其写成 T1/T2/T3 通过。

## D0-04 失败识别

| 情形 | 预期阻断动作 | 责任交接 | 最小验证证据 | 本轮状态 |
|---|---|---|---|---|
| 超时：读工具或动作无回执 | 读工具按合同有限重试；有副作用的动作进入 unknown_effect/WAIT_RESOLUTION，按原 action_id 查效果，禁止换 key 重发 | 后端数据工程师查效果账本；QA 核物理请求/业务效果 | 原始发送、超时、查询结果、调用计数和重复副作用证据 | 未运行 |
| 来源版本冲突：候选 corpus/index/source 与允许版本不一致 | 写 source_version_conflict，不提交推荐、不生成答案；保留候选与版本 | 内容检索工程师修索引/manifest；产品经理决定澄清；QA 复验 | 冻结 manifest、候选版本/hash、proposal_rejected、无后续模型/写调用 | 未运行 |
| 权限冲突：工具效果为 write、批准/租户/范围缺失 | 发送前 permission_conflict，工具调用计数为 0；已发送但未知则暂停并升级 | 后端数据工程师提供权限/效果账本；产品经理确认批准；QA 独立复验 | policy 判定、批准证据、实际请求计数、unknown_effect 查询记录 | 未运行 |

如果 no_match 后仍生成内容，或恢复时忽略旧 checkpoint，我也会停止并保留首次
失败；最终答案看似正确不能抵消无依据或重复副作用风险。上述三类阻断均未进行真实
故障注入，不能声称应用已经暴露或修复这些问题。

## D0-05 迁移计划

至少需要同时处理输入、内容版本和权限三类变化：

1. **输入变化**：将输入从 query、corpusVersion、runId 三字段扩为含 language 或
   intent。保留旧 schema 和旧事件；先在临时夹具做 schema 兼容检查，缺字段不得
   猜默认值。更新 inputSchema、预算和留出查询，再由 QA 复验正常、无匹配和恶意/歧义
   输入。
2. **教材/索引版本变化**：从 textbook-v12/retrieval-stub-v1 切到候选 v13 时，
   必须同时收到 v13 manifest、section 映射和 hash；升 AgentSpec、检索契约和输出
   contentVersion/indexVersion。版本不匹配立即 source_version_conflict，绝不混用
   v12 候选与 v13 标识。
3. **权限变化**：从只读推荐扩展到需用户确认的工具时，升 toolPolicy，增加批准人、
   租户、资源范围和幂等字段，预算减半也要升版本。没有有效批准或批准过期时调用数为
   0；未知效果沿用原 action_id 查询。

迁移顺序是：冻结旧 AgentSpec/来源/事件和首次失败；分叉新版本；静态比较输入、运行
时、语料、索引、工具效果、权限和预算；在临时目录做只读预演；由内容检索、后端、产品
和 QA 分别签收；仅把新 run 路由到新版本；异常时停止新任务、保留新旧事件和未决效果、
恢复旧只读路径；最后用原例、受影响回归和一个未提示变体复验。回滚不得删记录、重置
幂等键或把两个来源版本混称。该迁移计划目前**未运行、未证明可回滚**。

## D1–D7 观察线索

| 维度 | 本次线索 | 状态 |
|---|---|---|
| D1 边界与判断 | 能陈述只做运行循环/检索编排，列出禁止越界和升级责任 | self_reported_static |
| D2 机制 | 给出状态、工具前后检查、checkpoint、停止和 unknown_effect 语义 | self_reported_static |
| D3 受约束执行 | 提交了版本化 AgentSpec 和两条计划轨迹，但 stub 未运行 | not_observed |
| D4 失败与恢复 | 能描述超时、版本冲突、权限冲突的阻断，但未做故障注入 | self_reported_static |
| D5 协作与复现 | 指定内容检索、后端、AI、产品、QA 的接收边界；尚无签收 | handoff_unconfirmed |
| D6 产品与行业创造 | 仅围绕教材定位窄任务，暂无用户/行业比较或真实价值证据 | not_assessed |
| D7 迁移与教会他人 | 给出输入/版本/权限迁移顺序和回滚原则，尚未执行或讲解复演 | plan_only |

## 未运行、未验证和不外推声明

- 未启动 4318 或任何应用入口，未修改应用、教材、账户、权限、数据库和用户记录。
- 未调用网络、真实模型、付费服务、外部写工具或外部联系；模型调用和写工具调用均为 0。
- D0-03 AgentSpec、轨迹、hash、checkpoint 和效果账本均是待运行设计，不是执行收据。
- 未验证检索召回/排序、真实来源质量、供应商输出、权限系统、持久任务恢复、生产 SLA、
  成本、用户理解、学习效果、职业胜任或行业先进性。
- 未经 QA 独立复核；本文件不授予 L1/L2/L3，不关闭任何产品门槛。

## 补学问题

1. 在不改应用的临时目录里，如何把正常、无匹配、来源版本冲突和超时四条轨迹实际回放，
   并证明模型调用和写工具调用均为 0？
2. 如果超时后无法判断写动作是否发生，如何用效果账本、原 action_id 和幂等证据区分
   “未执行”“已执行”“效果未知”？
3. 内容检索提供新索引版本但缺一个 section hash 时，我应向谁升级，哪些事件必须保留，
   才能避免把旧版本摘录混入新推荐？
4. 工具权限从只读变为用户确认写入时，批准、租户、资源范围、预算和审计字段的最小合同
   是什么？
5. Node 或事件 schema 变更后，怎样设计一个不在原题中给出的恢复/回滚留出变体，并让 QA
   独立判断，而不是由我自证？
6. 哪些真实用户问题、行业对比和成本/延迟数据，才足以支持把本地沙箱证据提升为产品决策？

**暂定结论：insufficient_evidence。只可继续 L0 级本地、无副作用、可重置练习；需要
实际夹具运行、跨情境回放和 QA 独立复核后，才能重新评估。**

