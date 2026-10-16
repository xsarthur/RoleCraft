# 员工同步简报：Rolecraft 1.0 课程试点（P01-MVP）

- **岗位**：课程架构师
- **同步日期**：2026-10-16（Asia/Shanghai）
- **接收岗位**：产品经理、设计师、客户端、后端数据、内容检索、实训评估、测试
- **用途**：把 `V1-05` 的课程字段、作品状态、反馈层级和来源回链交给 1.0 实现；本文件不修改正文、代码、账户数据或 QA 结论。

## 已同步的来源与边界

| 来源 | 用途 | 身份/结论 |
|---|---|---|
| `sites/rolecraft/team/curriculum-v1.0-pilot.md` | P01 试点完整规格、失败路径、量规和字段合同 | `V1-PILOT-P01-MVP-001`；规格状态 `ready_for_product_and_engineering_handoff; learner_execution_not_assessed` |
| `sites/rolecraft/textbooks/v12/p01-mvp.md` | 学习题面、固定 fixture、MVP 契约和 ADR 教学依据 | `unit_id=p01-mvp`；收到正文 SHA-256 `deb98fa616e7d670108c86eca3b2a137e1183cf69bc3a5f5799a0b08f19b57d9` |
| `sites/rolecraft/team/product-v1.0-scope.md` | 1.0 主流程和 V1-05 验收条件 | 至少一个单元完成练习—作品—反馈，证据可回源；缺证不能显示通过/掌握 |
| `sites/rolecraft/team/design-v1.0-learning-workbench.md` | 当前任务卡、证据状态槽、反馈层级和状态视觉表达 | 视觉稿是设计证据，不是运行证据；状态不能只靠颜色 |
| `sites/rolecraft/team/app-v1.0-qa.md/.json` | 当前实现独立复核边界 | 总体 `insufficient`；V1-05 `insufficient`；本轮未启动服务、浏览器或正式数据库 |

P01 是**构造练习**：`defect-mvp-contract-01` 的退款边界快照只能用于学习者练习。它不是真实客户问题、真实退款规则、真实工单或真实用户反馈。1.0 仅允许本地隔离目录、只读输入、练习文件和静态检查；不改业务代码、不访问正式数据库、不创建真实工单、不发送通知、不调用付费/外部模型。

## 试点单元的固定身份和教学字段

实现必须将下面的身份作为只读内容绑定到每次练习，而不是让客户端自行重写题面：

```yaml
practice_id: V1-PILOT-P01-MVP-001
unit_id: p01-mvp
textbook_version: textbook-v12
source_path: sites/rolecraft/textbooks/v12/p01-mvp.md
source_sha256: deb98fa616e7d670108c86eca3b2a137e1183cf69bc3a5f5799a0b08f19b57d9
prerequisite_units: [p01-discovery, c01-selection, e02]
next_unit: e03
fixture_id: defect-mvp-contract-01
review_scope: limited_to_constructed_fixture
```

题面要求学习者在固定快照上：分开事实、推断和未知；写出允许/禁止动作、验收计划、停止条件和替代方案；解释为何不扩展为多 Agent 或自动改代码；让非作者复现正常路径及一条缺证/权限失败路径。

固定输入字段必须只读保存并在作品中可回链：

```yaml
input_snapshot:
  snapshot_id: defect-mvp-contract-01
  repo: repo@8e12
  source: src/refund.py
  source_ref: repo@8e12:src/refund.py:1-2
  report: test-report-71
  failure_ref: report-71:failure-1
known_facts:
  - 源文件 refund(days) 返回 days < 7
  - test_refund_day_7 输入 7，报告 expected=True、actual=False
allowed_actions: [read_source, read_test_report, create_issue]
trusted_scope: {tenant: tenant-dev, writable_project: refund-maintenance}
excluded_work: [修改应用代码, 新业务规则决策, 自动发布, 外发通知]
```

`expected=True` 只能标为报告事实，不能标为已确认退款规则；`days < 7` 与断言不一致只能支持“存在边界行为差异”。

## 作品提交字段和证据回链

客户端/后端保存的是**版本化提交**，不是一个可覆盖的项目备注。每次新版本、新来源或新题面都生成新的 `submission_id`，旧提交、旧意见和首失败只读保留。

```yaml
submission:
  submission_id: <new-id-per-revision>
  previous_submission_id: null
  practice_id: V1-PILOT-P01-MVP-001
  unit_id: p01-mvp
  textbook_version: textbook-v12
  source_sha256: deb98fa616e7d670108c86eca3b2a137e1183cf69bc3a5f5799a0b08f19b57d9
  artifact_version: <learner-revision>
  created_at: <iso-8601>
  updated_at: <iso-8601>
  workflow_status: 未开始
  record_types: [draft, self_report, ai_suggestion, professional_review, human_review]
  review_scope: limited_to_constructed_fixture
  source_refs: []
  evidence_refs: []
  reviewer_refs: []
  learner_claims: []
  unresolved_gaps: []
```

作品清单至少包含 `problem-evidence`、`task-contract`、`acceptance-plan`、`adr`、`reproduction-notes`、`evidence-index` 和 `reflection`。每个文件或内嵌作品项都带 `artifact_version`、`practice_id`、`created_at`、`source_refs` 和内容哈希。

证据索引应支持以下 receipt 类型，并逐项保存命令/路径/版本/哈希/状态；字段存在不代表证据已经取得：

- `source_receipt`：教材路径、单元/小节、教材版本、正文 hash、fixture ID；失配进入 `stale_version`/`证据不足`。
- `artifact_receipt`：作品路径、字节 hash、创建时间、作者和修订号；hash 只定位收到版本，不证明论断正确。
- `run_receipt`：命令、工作目录、运行时、stdout/stderr、退出码、网络/外部写状态；未执行写 `not_run`，不得补写预期输出。
- `failure_receipt`：失败 ID、首失败输入、实际反应、停止/恢复动作；至少覆盖一条缺证、权限或未知效果失败。
- `screenshot_receipt`：当前任务卡、作品字段、提交状态、版本徽章、反馈结果的截图；不替代源文件、日志或真人理解。
- `review_receipt`：评阅角色、rubric 版本、逐项意见、时间和回链；1.0 当前没有真人评审记录。

工程交接要求每条证据同时回链到 `practice_id`、`submission_id`、`artifact_version` 和 `source_sha256`。学习者可填写的链接、说明和运行记录不应直接写成系统已验证结论。

## 记录类型、作品状态和反馈状态

`record_type` 的含义固定如下：

| 类型 | 可写者 | 允许表达 | 不能推导 |
|---|---|---|---|
| `draft` | 学习者 | 可编辑作品、版本、未验证项 | 不能推导提交、掌握或审核 |
| `self_report` | 学习者 | 已做动作、困难、证据链接、下一步 | 不能推导独立正确、能力或真人认可 |
| `ai_suggestion` | 本地规则/模型适配器 | 缺项、来源或反例建议 | 不能覆盖原稿、批准或评分；无配置为 `not_run` |
| `professional_review` | 独立课程/实训/技术评阅者 | 按本规格和量规逐项核对、补证意见 | 不能冒充真人行业专家或真实用户反馈 |
| `human_review` | 真实且身份可记录的合资格专家 | 有范围的意见、质疑或认可 | 1.0 尚无记录，不得填造姓名或结论 |

每层记录带 `review_scope`、`source_version`、`evidence_refs` 和 `created_at`，界面/导出分层展示。

作品流程状态的课程语义：

| 状态 | 进入条件 | 状态含义和后续 |
|---|---|---|
| `未开始` | 没有该试点草稿或提交 | 只显示开始、输入和先修 |
| `已提交` | 清单、版本和最小字段齐全，学习者主动提交 | 收到作品包，尚未独立复验；不可覆盖旧提交 |
| `待独立复验` | 提交锁定且已进入独立复验队列 | 等待或查看范围；作者不能改写评阅意见 |
| `发现问题` | 独立复验发现事实、契约、证据、边界或复现问题 | 返修并按原例/受影响范围复验，保留原失败 |
| `证据不足` | 关键输入、运行、来源、独立评阅或真人意见缺失 | 补证、标记未运行、缩小主张或停止 |

产品界面可将 `发现问题` 显示为“复验发现问题”，但不得新增“通过/已掌握”状态。`review_outcome=met_within_scope` 只能作为限定范围评阅结果保存，不能转换为能力、岗位或职业结论。

反馈必须逐项指出：事实/推断/未知分类是否正确及来源是否可读；范围、停止或批准风险；缺失的正常/失败证据；方案与普通程序基线的可证伪理由；下一步是修订合同、补证、重跑原例还是进入 `e03`，并带责任人、版本和复验动作。

## 当前实现同步：已存在和仍缺的内容

已从当前 `dist/learning-workbench.js` 读取到：客户端身份为 `rolecraft-1.0`，当前教材为 `textbook-v12`，兼容字段仍是 `local-workbench-0.11`/`agent-system-v0.12`；项目页当前只保存通用 `project.title/problem/evidence/result/gap/next`，保存在浏览器 localStorage；页面显示“自述”“运行证据”“独立评价：未开始”三个状态槽，保存提示明确尚未独立评价。该实现可作为表单/视觉基础，但不能当作 P01 提交。

当前仍缺 `V1-05` 所需的实现证据：

1. P01 固定题面、先修、fixture 和正文 hash 的当前任务入口；
2. `submission_id`、`previous_submission_id`、`artifact_version`、不可覆盖提交及恢复路径；
3. 七个作品项、作品清单、证据索引和六类 receipt 的保存/导出；
4. 五类记录分层（尤其 AI 建议、专业评阅、真人评审的未运行/未开始/证据不足）；
5. 上述五种作品状态及缺证、无权限、无批准、未知效果七条关键失败路径；
6. 每次提交到教材小节、source hash、fixture、反馈和复盘的稳定回链；
7. 独立复验队列、原例复验和受影响范围复验的可恢复记录。

因此，现有通用项目档案保存、静态状态槽或作者自查均不能关闭 `V1-05`。测试报告已经将 V1-05 记为 `insufficient`，本同步文件不改写该结论。

## 1.0 实现接收条件与不可声称项

实现交接完成的最低条件是：当前任务能打开固定 P01 来源；学习者能保存草稿并生成新提交；提交后能恢复、查看版本和证据索引；缺证/权限/批准/未知效果至少一条失败路径能留下失败 receipt；反馈可回到作品和教材来源；旧提交不被覆盖；所有未执行层级明确显示 `not_run`、`未开始` 或 `证据不足`。

在这些条件由当前源和独立 QA 证实前，不得声称：学习者已掌握、试点成功、真实用户认可、真人专家审核、职业胜任、可录用、真实学习效果、真实模型生成、生产可靠或行业先进。完成课程交接也不等于练习执行、独立评阅、真实用户测试或产品 V1-05 通过。

### 岗位动作

- **客户端/后端**：只实现字段、版本化提交和状态/证据回链；不改 `p01-mvp` 正文、历史提交或正式账户。
- **内容检索**：仅提供当前教材小节和来源身份，不能为 P01 补写教材外答案。
- **实训评估/独立评阅**：按六维量规逐项引用作品位置与证据 ID；不代写作品。
- **测试**：在当前源冻结后独立执行提交、恢复、失败状态、版本失配和回链；不能以静态字段存在替代行为证据。
- **项目经理**：汇总交接、责任、复验和整体 `not_met`；不把本文件作为通过报告。

## 本岗位自查

- 只新增本同步文件，未修改 v12 正文、应用代码、账户/数据库、QA 或历史报告。
- 练习身份、固定输入、作品字段、记录层级、状态语义、receipt 和未完成边界均来自已收课程规格与 1.0 产品合同。
- 当前真实学习者执行、作品提交、独立复验、真人评审和浏览器/HTTP 行为仍未取得；本文件只完成跨岗位课程字段交接。
