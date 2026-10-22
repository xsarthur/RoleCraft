# AI 设计师记忆条目格式

版本：`core-ai-designer-memory-schema-1`  
状态：`active`  
用途：约束可跨项目复用的 AI 设计师长期记忆，避免把单次项目画法、猜测或未验证结果当成用户稳定偏好。

## 记忆条目模板

每个条目使用一个稳定的 `memory_id`，并按以下字段记录：

```yaml
memory_id: AID-MEM-XXX
version: core-ai-designer-memory-1
status: active | candidate | deprecated | superseded | unverified
preference: 用一句话写清偏好、方法或约束
rationale: 说明它影响的 AI 体验判断，以及不应越过的边界
source:
  - path: /absolute/or/project/relative/path
    locator: 文件、章节、记录或反馈位置
    evidence_type: user_statement | approved_profile | project_feedback | qa_observation | research | other
    captured_at: YYYY-MM-DD
scope:
  level: cross_project | project_only | component_only
  applies_to: [prompt_interaction, generative_states, trust_citation, accessibility, ai_surface_tokens, handoff]
  conditions: 适用前提；没有条件时写 none
  exclusions: 明确不适用范围；没有时写 none
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

- `memory_id` 和 `version` 必须稳定；修改既有条目时增加版本或记录替代关系，不复用旧 ID 掩盖变化。
- `preference` 只能写可执行、可观察的 AI 体验偏好，不写“界面更智能”“用户会更信任”等无法核验的评价。
- `source` 至少包含一个可追溯来源和定位。用户明确表述优先记录原话或准确转述；项目反馈和 QA 只能支持适用范围，不能单独冒充用户确认。
- `scope.level` 必须区分跨项目与项目内。`project_only` 或 `component_only` 条目不得合并进 `MEMORY.md` 的默认区。
- `scope.conditions` 和 `scope.exclusions` 用来防止把 AI 表面偏好误用到非 AI 界面、另一类产品或未授权的模型能力。
- `confidence` 是证据可信度，不是设计师自信程度；`high` 仍不等于真实用户理解或产品达标。
- `confirmation.state` 明确谁确认了条目。没有用户或项目经理确认时，默认只能保持 `pending_*`、`candidate` 或 `unverified`。
- `versioning.last_verified_at` 每次复核更新；历史替代关系必须保留。
- `privacy` 必须为 false，除非项目经理建立了合规且必要的脱敏引用；记忆包不保存原始敏感资料。

## 写入与晋级流程

1. 任务开始读取共享用户档案、本目录记忆和当前项目交接；项目交接优先处理项目特例。
2. 任务结束先产生候选条目，附实际观察、来源、范围、置信度和未验证项；候选不能改变默认行为。
3. 由用户或项目经理确认后，才把跨项目条目写入 `MEMORY.md`。产品范围、课程判断和独立验收仍由各自岗位负责。
4. 用户修正、范围缩小或新证据冲突时，保留旧条目并将其标记 `superseded` 或 `deprecated`，记录替代条目和原因。
5. 任何条目都不能改变 AI 或非 AI 产品范围、课程门槛、实现责任或测试结论；遇到跨领域问题必须交接原责任岗位。
