# 后端数据工程师 · v12证据专项接单

日期：2026-10-11。员工编号EV12-05；实际代理身份`/root/employee_v12_backend`；接单状态`accepted_with_dependencies`。唯一领域是服务端数据与任务。本次完成岗位接单和依赖确认，尚未执行后端实现或生产验证。

## 已读版本与证据定位

各输入的收到SHA256完整记录在[接单JSON](onboarding.json)中。已读共同规则、本岗提示词、AGENTS及下列当前/历史证据：

| 输入 | 定位与使用边界 |
| --- | --- |
| [textbook-v12-product-assessment.md](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/team/textbook-v12-product-assessment.md) | v12产品判断：final_evidence_assessed_with_limitations；仅在其当前报告范围使用 |
| [textbook-v12-qa.md](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/team/textbook-v12-qa.md) | v12独立教材QA：met_with_limitations，完整目标not_met；仅在其当前报告范围使用 |
| [README.md](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v12/README.md) | v12教材目录，30单元；仅在其当前报告范围使用 |
| [product-gates.json](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/team/product-gates.json) | product-creation-2026-10-10原八门槛；仅在其当前报告范围使用 |
| [implementation-v04-backend.md](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/team/implementation-v04-backend.md) | 2026-10-10 local-mvp-0.4后端实施历史；仅历史参考，不继承当前生产或配置结论 |
| [qa-v04-review.md](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/team/qa-v04-review.md) | 2026-10-10 local-mvp-0.4独立QA历史；仅历史参考，不继承当前生产或配置结论 |
| [backend-data-engineer.md](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/team/specialists/backend-data-engineer.md) | 2026-10-10后端准备历史；仅历史参考，不继承当前生产或配置结论 |

v12教材QA为`met_with_limitations`，完整产品为`not_met`，当前`reliable_delivery`为`fail`。原门槛文件责任人仍是软件工程师，本岗向其交后端证据，由PM协调；不修改原ID、标准或历史责任。历史v04报告记录了本地临时SQLite/loopback及真实重启的有限检查，其供应商成功路径使用替身；这些不能证明当前正式生产系统可靠或当前配置已具备。

## 唯一职责与首任务

本岗承担账户权限、持久任务、恢复、事务保存和数据版本。模型推理交AI生成工程师，客户端交软件工程师，独立验收交测试工程师。OS沙箱、GPU和生产平台跨域需求提交PM派工。

首任务已完成接单部分：核已有交接与隔离边界，登记生产缺证和后续条件。后续专业工作须收到产品范围、PM唯一写入派工及当前模型/客户端冻结合同，再用独立临时库与合成账户执行获准实现和自检。本次不改程序、数据库或教材，不读取实际用户记录，不测试或迁移默认数据库，不通过旧报告推断当前服务配置。

## 前置依赖

| 条件 | 责任岗位 | 当前收到状态 |
| --- | --- | --- |
| D01 后续账户、任务、恢复、版本与正式运行范围及验收条件 | 产品经理 | not_received_for_new_implementation；已读原八门槛与v12产品判断；不作为新生产范围交接 |
| D02 后续唯一写入路径、执行边界及隔离数据方案派工 | 项目经理 | pending_next_dispatch；本轮仅本岗接单两文件获准 |
| D03 冻结模型单attempt输入/输出、取消、稳定错误、调用状态和未知效果协议 | AI生成工程师 | current_contract_not_verified；历史实施/准备报告已读；未查当前程序或实际配置 |
| D04 当前客户端任务查询、版本冲突、重试与证据状态消费合同 | 软件工程师 | current_contract_not_verified；历史交接只作参考 |
| D05 后续新版本冻结、自检证据和独立QA故障注入环境 | 后端数据工程师与测试工程师 | not_executed；历史临时SQLite/loopback/重启证据可定位，不能继承 |
| D06 正式生产身份/TLS/备份恢复/监控范围及需要的部署或真实资料授权 | 产品经理、项目经理及用户授权输入 | not_received_or_not_verified；不读取私有用户记录；未核当前配置；本轮不部署 |

## 隔离验证与任务协议交接要求

收到后续派工后，模型接口须冻结任务/尝试身份、领取令牌、输入快照与版本、取消信号和资源限制；模型岗返回候选草稿、来源映射、调用证据引用、耗时/用量和稳定错误。后端负责账户归属、结构/大小/版本核验及原子保存，不能判定教学正确或保证供应商调用恰好一次。未知外部效果须保持可辨识状态，重试政策经模型岗与产品交接，不能凭超时自动重复收费动作。

客户端交接须明确任务查询、错误与显式重试、版本冲突和证据类型，不把落库成功展示为专业审核或用户掌握。隔离环境使用新临时目录、合成账户与独立库；测试数据不得导入真实库，不改变浏览器旧记录。

领域交付应保留版本、输入、故障时点、期望/实际、脱敏前后持久快照和复现命令，覆盖正常、并发幂等、输入冲突、崩溃/重启、失效租约、取消后的未知效果、原子提交、迁移备份与回滚。正式生产身份/TLS/监控/备份恢复及部署范围另按产品交接确认；没有运行的项目标为未验证。

后端自检只证明明确环境的开发结果。测试工程师在冻结新版本以独立环境运行正常与关键失败路径，对照业务最终状态、任务/尝试/事件/产物版本，保存首败、交责任人返修后按原输入复验；本岗不代其执行或出具独立验收。

## 实际完成、未完成与自查

实际完成：代理独立阅读10项输入、确认职责和写入边界、登记首任务及6项依赖、形成岗位接单两文件。所有输入哈希用于记录收到版本，不代表对内容事实再次认证。

尚未完成：当前代码/接口配置复核、后端新实现、隔离数据库行为运行、生产身份与恢复验证、独立QA。未访问私有数据或凭据，未进行模型调用、部署、外部联系或发布。

领域自查：只写获准两文件；当前与历史证据分开；自检与独立QA分开；模型、客户端和跨域事项有明确交接；没有用接单或报告完成关闭产品门槛。待QA检查本次组织配置与接单，后续专业产物重新独立复验。完整培养和行业先进目标仍`not_met`。
