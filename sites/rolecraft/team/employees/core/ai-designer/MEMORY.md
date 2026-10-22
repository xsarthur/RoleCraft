# AI 设计师长期记忆

版本：`core-ai-designer-memory-1`  
状态：`active`  
维护规则：只收录已明确确认、可跨项目复用的 AI 体验偏好；候选观察须先经用户或项目经理确认，项目特例不得自动升级。

本文件只保存 AI 设计师在其他项目中可以默认参考的稳定偏好。它不记录未经确认的审美推断、单个项目的临时画法、真实用户结论或产品门槛结论。

## 已确认条目

目前没有只属于本岗位、且经用户确认的提示交互、生成态、引用呈现、AI 可访问性或 AI 表面设计令牌偏好。

共享档案中的视觉优先和必要文字要求对本岗位有效，但正式条目在 [`../user-profile/approved-preferences.md`](../user-profile/approved-preferences.md) 与产品设计师记忆中。这里不复制成新的已确认 ID，避免两套档案各写各的。

这不是默认视觉方案。新项目的 AI 表面仍须服从当前 AI 产品范围、接口契约和可访问性要求。

## 尚未确认，不得默认的偏好

以下内容目前没有足够的用户确认或跨项目证据，不能写成长期偏好：生成区品牌色、流式动效强度、默认输入框形态、引用卡片样式、置信度的具体图形、图标库、字体、圆角、设计工具、前端框架，以及任何单一项目的布局决定。

## 待确认记忆候选

暂无。后续观察到用户明确表达的 AI 体验偏好时，先按 `MEMORY_SCHEMA.md` 提交候选；在确认前保持 `candidate` 或 `pending_user`，不直接加入已确认区。

## 培训证据同步（非授级）

本段记录来自独立培训项目「员工培训计划」的门禁结果，**不是**用户长期偏好，也**不**授予永久职级、生产权限或 RoleCraft 项目验收通过。读取时不得把 `training_completed` 解释为 `level_granted`。

### AID-TRAIN-20261022-001 — L1→L2 / L2→L3 同级门禁（real_agent）

- **约定/事实**：本岗位在 `digital_employee_only.real_agent` 范围内完成与优先十岗相同的 L1→L2 与 L2→L3 训练门禁；状态均为 `training_completed`，门禁均为 `passed_within_agent_runtime_scope`。
- **level_granted**：`false`（明确不永久授级；亦无正式 L2 授级）
- **范围**：仅限培训合同内的数字员工能力证据；不覆盖 RoleCraft 产品八门槛、真实用户任务、付费外模或生产发布。
- **证据**（Asia/Shanghai 进度日 `2026-10-22`；卡内时间戳多为 UTC Z）：
  - 进度汇总：`/Users/shengxiong/Documents/ChatGPT/员工培训计划/reports/ai-roles-l2-l3-progress-2026-10-22.json`（`report_id=ai-roles.l2-l3.progress.20261022.001`，顶层 `level_granted=false`，`scope=digital_employee_only.real_agent`）
  - L2 roster：`reports/l1-to-l2-role-roster-2026-10-22.json` · `report_hash=sha256:c0b0a0f3bba80bc1210f9c2d51e13d25a67a50715070e6d22718cad774fb11f4`
  - L3 roster：`reports/l2-to-l3-role-roster-2026-10-22.json` · `report_hash=sha256:63c68b138b02aceb938a630fadbf111335a4176612c35b520da5fe4c9658441c`
  - L2（`role_slug=ai_designer`）：`status=training_completed` · `gate_status=passed_within_agent_runtime_scope` · `evidence_card_hash=sha256:6e74b94f4e5608e244f7391e43e7172f1e1af5030cd3f7decb706952abe5df4e` · `run_id=run.l1-to-l2.ai_designer.20261022.001`
  - L3：`status=training_completed` · `gate_status=passed_within_agent_runtime_scope` · `run_hash=sha256:7956ea81ff58b0437e03c31318dbc492c2d6af7310452d6d68988689b677cbcc` · `run_id=run.l2-to-l3.ai_designer.20261022.001` · `formal_l2_level_granted=false`
- **限制**：不改写已封存的 `*-2026-10-19` 十岗报告；不把本段写入「已确认条目」偏好区；后续永久授级须另开明确交接，不得从此段自动推断。
- **置信度**：`confirmed`（机器可读报告与哈希；培训项目内复跑可核）
- **确认状态**：`training_evidence_synced`（非 `user_confirmed` 偏好）
- **版本**：`1.0.0`
- **记录日期**：`2026-10-22`
- **最近复核**：`2026-10-22`
- **关联项目**：员工培训计划；RoleCraft PR #6 merge `a4107e087960a82f12366aca6ffc665e29455ca0`

## 记忆边界

- 不把产品设计师的已确认条目改写成 AI 设计师的新记忆。
- 不把一次界面稿、模拟对话或未测试的可访问性声明升级为跨项目规则。
- 任何长期条目都不能改变产品范围，也不能把本岗位写成产品设计师或前端实现的替代。
