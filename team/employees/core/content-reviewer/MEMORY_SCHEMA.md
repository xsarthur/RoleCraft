# 内容审校员记忆条目格式

版本：`core-content-reviewer-memory-schema-1`  
状态：`active`  
用途：约束可跨项目复用的内容审校员长期记忆，避免把教材版本结论、个人猜测或未验证专业判断当成用户稳定偏好。

## 记忆条目模板

每个条目使用稳定的 `memory_id`，并按以下字段记录：

```yaml
memory_id: CR-MEM-XXX
version: core-content-reviewer-memory-1
status: active | candidate | deprecated | superseded | unverified
preference: 用一句话写清跨项目可执行的审校协作偏好或约束
rationale: 说明它如何影响审校流程，以及不应越过的岗位边界
source:
  - path: /absolute/or/project/relative/path
    locator: 文件、章节、消息或记录位置
    evidence_type: user_statement | approved_profile | project_feedback | qa_observation | research | other
    captured_at: YYYY-MM-DD
scope:
  level: cross_project | project_only | artifact_only
  applies_to: [intake, claim_check, source_check, code_example, case_review, handoff, memory_update]
  conditions: 适用前提；没有条件时写 none
  exclusions: 明确不适用范围；没有时写 none
evidence:
  claim: 可核对的观察或用户决定
  support: 支持该条目的来源和具体证据
  limitations: 证据不能证明的内容
confidence: high | medium | low
confirmation:
  state: user_confirmed | pm_confirmed | evidence_supported | pending_user | pending_pm | rejected
  confirmed_by: 用户、项目经理或记录“未确认”
  confirmed_at: YYYY-MM-DD | null
  confirmation_note: 确认方式或待确认问题
versioning:
  recorded_in: 文件或记忆包版本
  first_recorded_at: YYYY-MM-DD
  last_verified_at: YYYY-MM-DD | null
  replaces: memory_id | null
  superseded_by: memory_id | null
  change_reason: 新证据、用户修正或范围变化；初次记录写 initial
privacy:
  contains_sensitive_data: false
  handling_note: 不保存密码、密钥、私有令牌或不必要个人敏感信息
```

## 字段要求

- `memory_id`、`version` 和 `status` 必须能追踪生命周期；修改既有条目时增加版本或填写替代关系，不复用旧ID掩盖变化。
- `preference` 必须可观察、可执行并指向审校协作；不要写“教材质量高”“用户喜欢”等无法核验的评价。
- `source` 至少包含一个可追溯来源和定位。用户明确表述优先记录原话或准确转述；项目审校、QA和研究只能支持适用范围，不能单独冒充用户确认。
- `scope.level` 必须区分跨项目、项目内和单一产物；`project_only` 或 `artifact_only` 条目不得合并进 `MEMORY.md` 的默认区。
- `scope.conditions` 和 `scope.exclusions` 必须说明版本、产物类型、岗位交接和不适用边界，防止记忆越权改变课程、产品或测试标准。
- `evidence.limitations` 必须写明不能由文稿审校推出的结论，例如真人专家认可、真实学习效果、行业先进性或生产稳定性。
- `confidence` 表示证据可信度，不是审校员主观把握；`high` 仍不等于内容已通过所有测试或达到完整产品目标。
- `confirmation.state` 明确由谁确认。没有用户或项目经理确认时只能保持 `pending_user`、`pending_pm`、`candidate` 或 `unverified`。
- `versioning.last_verified_at` 每次复核更新；历史替代关系必须保留，不能静默删除旧经验。
- `privacy.contains_sensitive_data` 默认必须为 `false`；记忆包不保存原始敏感材料，只保留必要的脱敏引用。

## 写入与晋级流程

1. 任务开始读取共享用户档案、本目录记忆、当前项目教材版本、作者交接和独立审校门槛；当前项目的特例优先于长期默认。
2. 任务结束先产生候选条目，附实际观察、来源、范围、置信度、证据限制和待确认问题；候选不能改变默认审校行为。
3. 由用户或项目经理确认后，才把跨项目条目写入 `MEMORY.md`。内容审校员不能为自己的作品提供独立确认，也不能替代测试工程师或真人专家。
4. 用户修正、范围缩小或证据冲突时，保留旧条目并标记 `superseded` 或 `deprecated`，填写替代条目和原因。
5. 任何记忆条目都不能改变课程目标、产品门槛、作者责任、实现合同或独立测试标准；遇到跨领域问题必须交接原责任岗位。
