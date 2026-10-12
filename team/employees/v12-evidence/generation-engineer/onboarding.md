# AI生成工程师 · 员工接单

日期：2026-10-11。员工编号EV12-04，实际代理`/root/employee_v12_generation`，状态`accepted_with_dependencies`。本次完成岗位接单与首任务准备；具体模型执行尚未开始。该身份为按需独立代理会话，不是常驻服务或独立账号。

## 已读输入与收到版本

已完整阅读下列共同及本岗资料。各文件实际SHA256与章节定位见[接单JSON](onboarding.json)的inputs；这些哈希是本次读取结果，不授予旧版审核结论。

- [AGENTS.md](/Users/shengxiong/Documents/ChatGPT/一人公司建设/AGENTS.md)：岗位与唯一责任领域；当前授权市场面试样本驱动的教材补齐v12；SHA256 `55e190a02d9d64ba1a1622b815d3c8282373a8d5292b1518f68ce6f2a08449a1`。
- [COMMON.md](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/team/employees/v12-evidence/COMMON.md)：本次派工范围；共同只读输入；唯一写入和接单输出；SHA256 `f2a8a5e935fd521030f0cc1a7445cb9a2138cc3b417c228cc9ab43cfacb67bf0`。
- [prompt.md](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/team/employees/v12-evidence/generation-engineer/prompt.md)：专业职责；本次首项派工；SHA256 `358494296b7c64fccc35dbdba075bb8a7794fe6c953f53e49be90bb13878ec77`。
- [textbook-v12-product-assessment.md](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/team/textbook-v12-product-assessment.md)：五维判断；原八门槛当前评估/real_generation；SHA256 `2a7a0e08cf959a6ad490d46a98128eebd0e82722c9d4ff1c104ea3fbead285eb`。
- [textbook-v12-qa.md](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/team/textbook-v12-qa.md)：实际执行范围；原八门槛当前复核；SHA256 `c2d6e7aae31d750ccc04a6c058251be097b8e3114638c004a455a053d37444d3`。
- [README.md](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/textbooks/v12/README.md)：版本、练习和证据；30单元阅读顺序；SHA256 `f6e8b37b318dd2a662c064f6681509fdf7873cbd7687a7b91a6f7ed3bf2683a6`。
- [product-gates.json](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/team/product-gates.json)：standardVersion=product-creation-2026-10-10；gates[id=real_generation]；SHA256 `93ef8940281aa173324c581e2fb23366d22026ff2bf3883ff5d0fe93e958ec06`。
- [implementation-v04-generation.md](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/team/implementation-v04-generation.md)：实际环境与缺口；I06实际实现交付；SHA256 `792bd88525d2a7403025116e54b5252df8e006caed8afbf6a8c21f22c5c744bb`。
- [external-services-config-pm.md](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/team/external-services-config-pm.md)：执行与交付；当前达标复盘；SHA256 `8ef42de35930ca16f461b5991183b41cca2792078e082c991fcfedb08a32cee1`。
- [generation-engineer.md](/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/team/specialists/generation-engineer.md)：实施边界与顺序；待输入、自查与复验；SHA256 `de258bd2e44d365655514fa7cf73dfe7b639112847b9100ea029685f68a576e5`。

教材只读取v12入口和当前评估/QA，没有声称读完合订本。上述QA记载的合订本SHA256为`25ce2aaa1be0ba0f2814dd1247ac6299d106c3d2e48f43867c49055490c2801e`；本岗未独立复验该冻结结论。

## 唯一领域与本次范围

负责模型生成服务：真实调用、学习档案到教材草稿执行链、来源关联、模型输出结构检查及生成失败处理。账户、权限、数据库、任务持久化归后端；客户端归软件工程师；课程规格归课程架构师；技术论证归内容审校员；独立验收归测试工程师。

本轮只写自身onboarding.md/json。没有修改程序、配置、教材、历史报告、用户数据库或其他岗位文件；没有读取密钥，没有外部请求或付费。原八门槛不变，real_generation的原门槛owner仍为软件工程师，本岗向其交付模型领域证据。

## 首任务与依赖状态

已完成本次首任务：接收职责，确认历史生成交接及配置迁入记录，列出后续输入。

| 依赖 | 收到状态与边界 | 责任人 |
| --- | --- | --- |
| 模型适配器/单attempt合同 | v04实施资料已收到；本轮未读当前代码、未重验运行 | AI生成工程师/后端数据工程师 |
| 真实服务配置 | 2026-10-11配置迁入记录记载六项配置及有限QA；当前文件/进程加载、变量兼容和连通性未核实 | AI生成工程师 |
| 模型、调用范围、预算与实际付费授权 | 本轮具体派工未收到；历史配置迁入不等于供应商调用授权 | 产品经理/PM |
| 当前生成输入包 | v12入口与产品规则已读；本次未交接冻结试点档案、来源包、章输出合同和生成规格 | 产品经理/课程架构师 |
| 当前后端任务/保存接口 | 历史合同已读；当前服务版本、接口运行状态和租约联调未核实 | 后端数据工程师 |
| 新产物独立审校/验收 | 后续交接；现有教材QA不替代当前生成链QA | 内容审校员/课程架构师/测试工程师 |

v04的“缺配置”只是当时检查结果。较新的迁入记录证明当轮配置交付，不能据此声称现机已加载或可调用，也不能继续把历史缺配置推断为当前缺配置。

后续首项专业任务：获得PM专业派工后，核对当前适配器与非秘密配置元数据，取得产品/课程输入包和后端契约；先形成准备度清单和分离的离线/真实验证范围。若获准真实调用，记录模型及供应商版本、安全请求/响应ID、输入/来源/提示/输出哈希、实际usage和耗时；正常、拒绝、截断、超时、限流、结构异常、来源不足、恢复分别留证。超时或取消不能证明未计费，外部效果未知保留未知；用量不是账单。

## 交付、验收和跨岗交接

- 产品经理/PM：提交配置、预算、调用范围与输入缺项；产品冻结范围，PM记录实际授权和唯一写入派工。
- 后端数据工程师：交单attempt输入/输出、阶段事件、稳定错误和来源版本绑定；后端拥有任务身份、租约、幂等、原子保存与重试。
- 软件工程师：交可消费阶段、草稿及错误合同，客户端经后端获取，不接触凭据。
- 内容审校员/课程架构师：交草稿与论断来源链，结构/引用ID检查不冒充语义正确、教学质量或专业审核。
- 运营分析员：交实际用量、耗时、尝试和未知效果，费用未核算保留未知。
- 测试工程师：交当前源哈希、自检与原始失败记录；显式离线夹具和获准真实调用回执分开，QA独立核正常与关键失败路径。本岗不自授验收。

验收要求：配置检查不输出秘密；学习档案→任务→模型→来源→检查→版本链可追溯；失败和恢复诚实；模拟与真实分别记录；新版本由QA按原门槛复核。无真实调用时仍标“待真实生成验证”。v04九节模板不可自动作为当前v12专业教材生成规格，须由课程岗位确认。

## 自查与未完成项

实际完成10份规定资料阅读、定位与哈希记录、角色接单、首任务和依赖/交接明确化。仅产生本岗两个接单文件。供应商请求0、付费调用0、程序/配置修改0。

未完成：当前配置和服务实际核查、真实模型执行、离线自检、后端联调、正文审校、新产物QA及所有真人/学习/就业/生产证据。本次组织独立验收待测试工程师。当前产品评估的real_generation为fail、完整目标not_met，本次员工配置不关闭这些缺口。
