# AGDEV D0 正式诊断评定

- 评定 ID：`D0-EVAL-AGDEV-20261015-LOCAL-01`
- 诊断 ID：`D0-AGDEV-20261015-LOCAL-01`
- 岗位：`AGDEV`（Agent 开发工程师）
- 评定责任：课程架构师
- 独立复核：`qa-engineer`（本评定形成时尚未执行）
- 评定版本：`d0-agdev-evaluation-v0.1`
- 日期：2026-10-15（Asia/Shanghai）
- 结论：`insufficient_evidence`

## 评定口径与证据边界

本评定只评价学习者在五项D0题目中留下的回答和隔离工件，不把岗位契约、架构蓝图、历史QA或诊断规格当作个人能力。证据级别如下：

| 级别 | 含义 | 本轮是否存在 |
| --- | --- | --- |
| `E0_unobserved` | 没有个人回答、行为或产物 | 否；五题均有文字回答或工件说明 |
| `E1_written_static` | 个人静态回答、表格、计划或缺陷分析；没有独立执行复核 | 是（D0-01、02、04、05） |
| `E2_local_self_run` | 本地隔离的确定性stub由答题者运行，结果可回放但未由QA独立重放 | 是（仅D0-03两条内存stub轨迹） |
| `E3_independent_replay` | QA按原例独立重放并核对结果 | 否 |
| `E4_cross_context` | QA留出变体、跨情境或真实形状任务的独立证据 | 否 |

环境记录为本地隔离、Node `v24.16.0`、Python `3.14.5`，网络/付费模型/外部消息/账户和数据库写入均为0。D0-03的命中与`no_match`轨迹来自一次内存检索stub运行，未启动`4318`或应用模块；它证明该次夹具运行发生，不证明T1控制循环、生产检索、真实模型或工具副作用处理已经运行。D0-03也没有执行工具错误、受控重试、崩溃恢复或QA重放。

### 五项D0逐项评定

#### D0-01 职责边界

**观察与证据**

- D1：`pass_with_limitations`，`E1_written_static`。回答明确把AGDEV限定为运行契约、状态、工具准入、停止/恢复和证据事件，并列出对PROD、AI、RETR、BE、FE、QA的越界边界；没有在留出情境中观察到实际拒收。
- D2：`not_assessed`，`E0_unobserved`。本题未要求机制实现；不能从边界文字推出机制掌握。
- D3：`insufficient_evidence`，`E0_unobserved`。没有本题对应运行。
- D4：`pass_with_limitations`，`E1_written_static`。对`no_match`、模型不可用、写副作用、未知效果、迁移和无限循环均写出停止/升级动作；尚无实际故障注入。
- D5：`insufficient_evidence`，`E1_written_static`。交接表有岗位、版本和不可验证项，但接收岗位未签收，复验步骤未由他人执行。
- D6：`not_assessed`，`E0_unobserved`。未涉及用户/行业问题验证。
- D7：`insufficient_evidence`，`E1_written_static`。有升级原则但没有返修差异、迁移结果或教会他人的观察。

**不足与阻断风险**

- P1：边界判断尚未经过独立或留出变体；误把“提供字段合同”当成相邻岗位已经完成，可能导致越权交付。
- P1：`no_match`、权限冲突或未知效果只在文字中被正确描述，实际停止动作和事件保留尚未证明。
- 跨岗版本只是计划接收版本，不能写成接收岗位已批准。

**补学安排**

1. 在不改应用的临时目录，用“检索无匹配 + 需确认写工具”两个变体执行拒收，保留原事件和`stop_reason`。
2. 将交接表交给RETR、BE、PROD和QA，取得版本/范围/未验证项的实际接收记录；任一接收缺失则保持不足。
3. QA重放原题和一个未提示权限变体，核AGDEV没有调用模型、检索写入或数据库迁移路径。

**T1决定**：允许进入`T1`的**受限、导师/QA监督轨道**；不允许独立Agent交付或真实工具执行。进入前须冻结T1合同、独立复核人和隔离夹具。

#### D0-02 机制解释

**观察与证据**

- D1：`pass_with_limitations`，`E1_written_static`。回答把模型定位为提议者，把执行权保留给宿主，并将单调用、固定workflow、单Agent循环和多Agent按观察需求、状态共享和成本取舍区分。
- D2：`pass_with_limitations`，`E1_written_static`。状态、停止条件、来源hash、策略、checkpoint、重试/取消和`unknown_effect`的因果链完整；尚未在真实控制循环中证明状态转换。
- D3：`insufficient_evidence`，`E1_written_static`。只有伪代码和说明，没有T1合同要求的正常/工具错误运行。
- D4：`pass_with_limitations`，`E1_written_static`。正确区分`no_match`、`needs_clarification`、`unknown_effect`和`failed`，并拒绝盲目换key重发；未做故障注入。
- D5：`insufficient_evidence`，`E1_written_static`。接口字段可供交接，但没有接收或独立复现。
- D6：`insufficient_evidence`，`E1_written_static`。有方案取舍，却没有真实用户问题、可比行业证据或迭代反馈。
- D7：`insufficient_evidence`，`E1_written_static`。列出假设和未知，但没有迁移/教会他人结果。

**不足与阻断风险**

- P1：文字状态图未证明终态不可重复提交、步数上限可执行或恢复能读取旧checkpoint。
- P1：模型提议校验和`unknown_effect`处理未在工具错误夹具中运行；不能据此授予T1通过。
- 方案选择没有真实问题证据，不能推导产品架构优越性。

**补学安排**

1. 按T1合同实现最小控制循环，使用确定性正常stub和工具错误stub；最多一次重试，最终进入`failed/stopped`。
2. 增加一个未提前给出步骤的错误顺序变体，核状态、步骤、停止原因和日志脱敏。
3. QA独立运行原例、错误例和留出变体，保留首次失败与返修差异。

**T1决定**：可在监督下进入T1；D0-02本身不构成T1交付通过或独立候选。

#### D0-03 熟悉任务

**已运行部分（必须与未运行部分分开）**

- **已运行**：一次本地确定性内存stub运行生成两条轨迹：`run-d0-03-001`命中并以`succeeded`停止，`run-d0-03-002`为`no_match → needs_clarification`；事件摘要hash为`ce027414db800484149aa8e33095f4e228e8770f60dbb9291c3dc53d57ebdeb0`，命中源文件hash记录为`f836af7e291cae69328e5e9fceb92c8734046906f6588bfd66edf2e0cf365fd8`。这属于`E2_local_self_run`，未由QA重放。
- **未运行/未验证**：没有应用HTTP收据、生产`server/retrieval`接入、真实模型、工具错误/受控重试、超时/未知效果、崩溃恢复、版本冲突变体或独立QA重放；没有第二种可独立重建的控制循环工件。

**观察与证据**

- D1：`pass_with_limitations`，`E2_local_self_run`。`AgentSpec`限制只读工具、来源根、预算和停止条件；未验证宿主在越权输入下的拒绝。
- D2：`pass_with_limitations`，`E2_local_self_run`。输入/输出schema、版本字段和来源hash校验有明确设计；实跑只覆盖确定性命中/无匹配两条路径。
- D3：`insufficient_evidence`，`E2_local_self_run`。确有两条可回放stub轨迹，但它们是检索切片而非T1要求的`received → planning → tool_call → checking → completed`及工具错误控制循环，且没有QA独立复核。
- D4：`insufficient_evidence`，`E2_local_self_run`。`no_match`诚实停止已在stub轨迹出现；来源冲突、超时、重复副作用和恢复未运行。
- D5：`insufficient_evidence`，`E2_local_self_run`。事件包含版本/来源字段，但无接收签名、独立复验或相邻岗位交接。
- D6：`not_assessed`，`E0_unobserved`。熟悉任务不包含用户/行业创造证据。
- D7：`insufficient_evidence`，`E1_written_static`。有复验建议但未执行未知变体。

**不足与阻断风险**

- P1：内存stub可能掩盖应用边界、序列化、并发和真实检索问题；不得把它写成生产或T1成功。
- P1：没有工具错误和受控重试轨迹，无法证明失败停止和副作用安全。
- 伪代码中将`needs_clarification`封装为`task_failed`，需要在T1合同中明确终态语义，避免把澄清误记为执行失败。

**补学安排**

1. 保留现有两条stub轨迹及首次结果，另做T1正常/工具错误两个独立夹具；不得覆盖旧hash。
2. 由QA在临时目录重放命中、无匹配、来源版本冲突和一个留出查询；核`run_id`、步骤上限、停止原因和日志安全。
3. 只有在QA确认两种不同可回放工件且无P1后，才可记录L1候选；仍不授职业胜任。

**T1决定**：允许作为T1的先修观察材料进入监督轨道；D0-03现有stub不单独授权T1独立交付。

#### D0-04 失败识别

**观察与证据**

- D1：`pass_with_limitations`，`E1_written_static`。四个缺陷均被定位到正确的停止/升级边界；没有实际操作行为。
- D2：`pass_with_limitations`，`E1_written_static`。能解释来源失配、无依据生成、重复写副作用和checkpoint恢复风险；未由运行日志验证因果。
- D3：`insufficient_evidence`，`E1_written_static`。台账是给定轨迹的分析，不是学习者执行修复后的运行。
- D4：`pass_with_limitations`，`E1_written_static`。风险分级和动作基本符合合同：来源拒绝、`no_match`澄清、未知效果查原`action_id`、恢复先核checkpoint；未进行故障注入。
- D5：`pass_with_limitations`，`E1_written_static`。正确分派AI/RETR/BE/QA责任；无接收或复验签名。
- D6：`not_assessed`，`E0_unobserved`。未涉及产品/行业创造。
- D7：`insufficient_evidence`，`E1_written_static`。要求原例、受影响回归和盲变体，但没有返修/复盘实证。

**不足与阻断风险**

- P0/P1：工具超时后换新key重复发送属于重复副作用阻断；虽然回答识别了该风险，但没有证明执行器会阻断。
- P1：来源失配和`no_match`继续生成的停止动作未重放；“看起来正确”的最终答案不能抵消。
- P1：忽略旧checkpoint的恢复风险尚无崩溃注入证据。

**补学安排**

1. 在只读/内存夹具中分别注入四类缺陷，保留首次失败，记录事件、物理请求计数和业务效果查询。
2. QA用一个未提示的缺陷顺序变体重放，核停止、澄清、回滚、升级和首次失败保留。
3. 将P0/P1缺陷交给AGDEV返修；QA复验前不关闭风险、不升层级。

**T1决定**：允许在监督下把失败轨迹作为T1练习输入；P0/P1安全门槛未独立清除前不允许独立交付。

#### D0-05 迁移计划

**观察与证据**

- D1：`pass_with_limitations`，`E1_written_static`。能识别语料/索引、运行时、权限和预算变化造成的边界变化；未运行。
- D2：`pass_with_limitations`，`E1_written_static`。变更矩阵、升版契约、版本hash和兼容检查较完整；计划不能替代执行。
- D3：`insufficient_evidence`，`E1_written_static`。没有迁移或回滚命令的实际输出。
- D4：`pass_with_limitations`，`E1_written_static`。停止、冻结、切换、回滚和恢复顺序明确；未做重启/未知效果演练。
- D5：`pass_with_limitations`，`E1_written_static`。列出PROD/RETR/BE/AI/FE/QA/PM批准或接收角色；没有实际签收。
- D6：`insufficient_evidence`，`E1_written_static`。没有真实问题、用户反馈或行业可比结果。
- D7：`insufficient_evidence`，`E1_written_static`。有未知清单和复验计划，没有迁移结果或教会他人的观察。

**不足与阻断风险**

- P0/P1：未运行时若复用旧来源、权限或在途状态，可能越权、重复动作或无法回滚。
- P1：计划中的“可回滚”只能在实际恢复证据存在时成立；当前不能称可回滚或生产安全。
- D0迁移不应成为T1扩大范围的理由，T1仍限于本地无副作用控制循环。

**补学安排**

1. 先在临时目录执行语料版本冲突和Node运行时/重启恢复两个只读演练，保留旧版本和首次失败。
2. 由RETR、BE和QA分别签收版本、checkpoint和复验条件；未签收则保持不足。
3. 进行一个未提前给出约束组合的盲变体，再由课程架构师复评D7；不得把计划文字改成运行结果。

**T1决定**：不以迁移计划授权迁移工作；仅允许在T1监督轨道中继续本地固定版本练习。

## D1–D7 汇总评定

| 维度 | 已观察证据 | 证据级别 | 静态/局部判断 | 当前正式结果 | 关键缺口 |
| --- | --- | --- | --- | --- | --- |
| D1 职责、边界与判断 | 边界、停止和跨岗矩阵；D0-03 AgentSpec | E1 + E2 | 书面边界清晰，局部夹具契约合理 | `pass_with_limitations`（能力证据仍不足） | 独立拒收/升级和留出权限变体 |
| D2 专业知识与机制 | 方案选择、状态图、因果链；D0-03 schema/事件 | E1 + E2 | 机制解释较完整，stub范围内一致 | `pass_with_limitations`（未证明可运行控制循环） | T1正常/工具错误状态实跑、QA复放 |
| D3 受约束任务执行 | 两条内存检索stub轨迹 | E2 | 仅证明一次本地检索切片运行 | `insufficient_evidence` | T1控制循环、工具失败/重试、第二工件和独立重放 |
| D4 质量、风险与恢复 | 四缺陷静态台账、停止和升级建议 | E1 | 风险识别方向正确 | `pass_with_limitations`（无故障注入） | P0/P1副作用、checkpoint恢复和来源冲突复验 |
| D5 协作、交接与可复现 | 版本化交接表、迁移批准/接收计划 | E1 + E2 | 字段意识较强，尚无接收事实 | `insufficient_evidence` | 接收签名、复验命令、独立回放 |
| D6 产品与行业创造 | 无用户、行业比较、迭代反馈 | E0/E1（未覆盖） | 本轮未测 | `not_assessed` | 产品合同、真实问题/可比方案和反馈证据 |
| D7 复盘、迁移与教会他人 | 迁移计划、未知清单、复验顺序 | E1 | 计划意识存在，迁移/辅导未观察 | `insufficient_evidence` | 盲变体迁移、返修差异、他人复用或教学记录 |

“`pass_with_limitations`”只表示文字或受限局部内容达到当前观察点，不能替代QA的`passed`，也不能把学习者提升到产品L1。D3的E2运行证据与其他未运行部分严格分开；D0-03未运行/未验证项不得用回答中的伪代码、哈希或一次命中补齐。

## 起点、补学顺序与T1门槛

- **正式起点：`L0`。** 现有静态回答质量较好，并产生一条本地stub运行记录，但尚无E3独立复核、T1工具失败轨迹、跨情境工件或接收签收；因此不能授予L1。
- **L1：`candidate_pending`，不是已授予层级。** 只有完成两种不同、可重建的本地工件（至少一条正常、一条工具错误/受控重试），D1–D7均有初步观察，QA按原例→受影响回归→留出变体独立复核且无开放P0/P1，才可记录L1候选。
- **T1允许范围：`scoped_supervised_only`。** 可以进入T1作为导师/QA监督的本地练习；必须使用冻结T1-v1.0、临时目录、确定性无副作用stub、Node v24.16.0或记录兼容性，不接真实模型、网络、账户、数据库、外部写工具或应用发布。T1不得被解释成职业能力、用户价值、生产可靠性或行业先进性证据。
- **T1不允许范围：** 独立交付、真实供应商调用、持久任务/账户迁移、写副作用工具、跨岗代码越界、跳过QA或删除首次失败。

### 下一轮复验清单

1. QA冻结T1夹具和独立运行环境，先复放D0-03现有两条stub轨迹并保存结果；该复放只验证可重建性。
2. 学习者交付T1正常轨迹与工具错误/最多一次重试轨迹，包含合同、步骤、错误摘要、停止原因、环境和哈希。
3. QA跑T1原例、受影响回归和未提示留出变体；P0/P1、缺字段或只能人工猜测时结论保持`insufficient`。
4. 课程架构师据独立结果更新D1–D7和补学路径；旧回答、旧失败、旧哈希和本评定均保留。

本评定不宣称学习者职业胜任，不宣称L1已达成，不宣称真实模型、用户价值、专家认可、生产可靠性或行业先进性。
