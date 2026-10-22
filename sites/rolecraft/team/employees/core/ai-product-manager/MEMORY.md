# AI 产品经理长期记忆

本文件只保存经过确认、可跨项目复用的 AI 产品偏好或协作约定。项目专属的模型供应商、提示词、预算、验收结果、未验证假设和其他岗位的专业结论不写入这里。

## 已确认条目

目前没有用户明确确认、可跨项目复用的模型能力边界、拒答规则、引用要求、评估指标或 AI 范围划分偏好。

这不是默认策略。新项目应依据当前产品范围、授权和独立验证决定 AI 功能怎么承诺；不得把本项目的一次选型、离线样例或岗位自述写成用户的长期偏好。

## 待确认记忆候选

暂无。新的候选请先按 `MEMORY_SCHEMA.md` 记录证据、范围、置信度和确认状态，再请求用户确认。

## 培训证据同步（非授级）

本段记录来自独立培训项目「员工培训计划」的门禁结果，**不是**用户长期偏好，也**不**授予永久职级、生产权限或 RoleCraft 项目验收通过。读取时不得把 `training_completed` 解释为 `level_granted`。

### AIPM-TRAIN-20261022-001 — L1→L2 / L2→L3 同级门禁（real_agent）

- **约定/事实**：本岗位在 `digital_employee_only.real_agent` 范围内完成与优先十岗相同的 L1→L2 与 L2→L3 训练门禁；状态均为 `training_completed`，门禁均为 `passed_within_agent_runtime_scope`。
- **level_granted**：`false`（明确不永久授级；亦无正式 L2 授级）
- **范围**：仅限培训合同内的数字员工能力证据；不覆盖 RoleCraft 产品八门槛、真实用户任务、付费外模或生产发布。
- **证据**（Asia/Shanghai 进度日 `2026-10-22`；卡内时间戳多为 UTC Z）：
  - 进度汇总：`/Users/shengxiong/Documents/ChatGPT/员工培训计划/reports/ai-roles-l2-l3-progress-2026-10-22.json`（`report_id=ai-roles.l2-l3.progress.20261022.001`，顶层 `level_granted=false`，`scope=digital_employee_only.real_agent`）
  - L2 roster：`reports/l1-to-l2-role-roster-2026-10-22.json` · `report_hash=sha256:c0b0a0f3bba80bc1210f9c2d51e13d25a67a50715070e6d22718cad774fb11f4`
  - L3 roster：`reports/l2-to-l3-role-roster-2026-10-22.json` · `report_hash=sha256:63c68b138b02aceb938a630fadbf111335a4176612c35b520da5fe4c9658441c`
  - L2（`role_slug=ai_product_manager`）：`status=training_completed` · `gate_status=passed_within_agent_runtime_scope` · `evidence_card_hash=sha256:d5a32f9dad7c2bda6c02ed81ef63cb8eef32f01d57dab8319c388f95ffbbf4bf` · `run_id=run.l1-to-l2.ai_product_manager.20261022.001`
  - L3：`status=training_completed` · `gate_status=passed_within_agent_runtime_scope` · `run_hash=sha256:a1520a75ccb056e90efb600d56ff2f61411c79a092ba2e075ee3612c7ef8afb6` · `run_id=run.l2-to-l3.ai_product_manager.20261022.001` · `formal_l2_level_granted=false`
- **限制**：不改写已封存的 `*-2026-10-19` 十岗报告；不把本段写入「已确认条目」偏好区；后续永久授级须另开明确交接，不得从此段自动推断。
- **置信度**：`confirmed`（机器可读报告与哈希；培训项目内复跑可核）
- **确认状态**：`training_evidence_synced`（非 `user_confirmed` 偏好）
- **版本**：`1.0.0`
- **记录日期**：`2026-10-22`
- **最近复核**：`2026-10-22`
- **关联项目**：员工培训计划；RoleCraft PR #6 merge `a4107e087960a82f12366aca6ffc665e29455ca0`

## 记忆边界

- 用户已经确认各员工类型可拥有独立长期记忆，并共享已确认的通用偏好。该协作约定由 `../user-profile/approved-preferences.md` 维护，不在本文件重复写成 AI 产品策略。
- 产品经理、AI 设计师、产品设计师、AI 生成工程师、内容检索工程师、软件工程师、课程架构师和测试工程师的专业结论留在各自岗位，不抄进本文件。
- `AGENTS.md`、版本门槛和接口契约是工作约束，不是用户个人偏好；每个项目的交接中重新读取。
- 任何长期条目都不能改变本岗位边界，也不能把 AI 产品经理写成产品经理、AI 设计师或模型实现岗位的替代。
