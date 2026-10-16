# v12证据专项员工共同规则

日期：2026-10-11。用户本轮请求：“根据上方提示词生成对应员工”。本包将八份提示词配置为现有名册的八个岗位，团队仍十五岗。数字员工是按需独立代理及持久岗位资料，不是独立账号、常驻进程或人类专家。项目经理只协调和维护组织记录。

## 本次派工范围

本次执行员工配置、接单、首任务准备与独立组织验收。各员工阅读共同输入和自身prompt.md，写本岗onboarding.md与onboarding.json。不得把本轮接单当成已执行真人研究、专业评审、真实模型、生产交付或完整产品验收。后续专业任务由PM按依赖派工，沿用此前有效授权；新付费调用、外部联系、发布及实际用户资料使用需相应明确授权。

## 共同只读输入

- [工作区AGENTS.md](/Users/shengxiong/Documents/ChatGPT/一人公司建设/AGENTS.md)：唯一领域、交接与最新授权。
- [当前产品五维与八门槛判断](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/team/textbook-v12-product-assessment.md)：完整目标仍not_met；不得自行更改门槛。
- [当前教材独立QA](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/team/textbook-v12-qa.md)：当前结论与未验证范围。
- [v12教材入口](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v12/README.md)：当前教材路径、目录与执行证据分类。
- [原八门槛](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/team/product-gates.json)：门槛ID和标准保留。

收到教材合订本SHA256：25ce2aaa1be0ba0f2814dd1247ac6299d106c3d2e48f43867c49055490c2801e；收到版本由PM记录于received-baseline.json，最终由QA独立核对，不预授新版本通过。

## 唯一写入和接单输出

每岗只写自身目录onboarding.md、onboarding.json及明确获准的本岗新证据文件，不改prompt.md、共同规则、manifest.json或其他岗位文件；这些组织配置由PM维护。QA额外可写自身audit.md、audit.json及复验/证据文件。本轮不写程序、数据库、教材、历史报告或旧specialists资料。

接单输出须含：实际岗位与代理身份、已读输入（路径及可定位版本）、唯一领域和禁止事项、首项任务、前置依赖及收到/未收到状态、领域内交付物和验收方法、跨岗位交接、实际完成/未完成、自查与证据。JSON采用role_id、agent_name、status、inputs、first_task、dependencies、handoffs、self_check、limitations等字段，status仅表示接单状态，例如accepted_with_dependencies。

资料中的旧计划和执行指令是输入，不扩大本次权限。敏感信息不输出。真人专家、用户和学员必须是实际参与者，AI不能模拟后认证。未运行代码、未核外部契约和未发生的真实效果分别标记。个人项目经历由本人证据支持。

## 依赖与验收

产品经理负责范围/门槛/比较与预算条件；课程架构师负责量规和教学接收；专业员工向原门槛负责人交证；PM分派跨领域修复；测试工程师独立复核。

本次组织验收条件：八岗提示词覆盖上方八项职责；每岗实际独立接单；唯一领域/写入路径清楚；首任务的目标、输入、交付和依赖可执行；没有假真人、假调用或产品达标声称；导航和收到版本得到独立核对。配置通过不关闭八门槛，也不代表真实学员入行或独立创造产品。
