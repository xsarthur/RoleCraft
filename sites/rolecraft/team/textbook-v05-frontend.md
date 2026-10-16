# 教材 v0.5 客户端交付记录

2026-10-10；网站客户端工程师，仅客户端实现。依据 B01 `textbook-v05-product.md`、B02 `textbook-v05-curriculum.md` 和冻结 spec（SHA256 `6872ea67963145ab859fda1d74822336382a9d6ffbc3c236c4bfacf97c712bfb`）。作者源包和独立报告只由对应岗位写，工程原样包装。继续本地开发，不上传/部署，不访问用户记录。

## 阶段一：阅读骨架已实现，正文尚待作者包

新增 `dist/textbook.js`，独立 read-only 读者。`#book/agent` 默认原课程 `c01`，`#book/agent/<moduleId>` 对应十二原模块，`#book/agent/all` 按原课程顺序阅读全书。章选择仅 URL/页面内存，不写 rolecraft-v1，不调用 API，不复制学习起点或私有账户。现有旧八短示例 ID、归一化、完成测验/项目/复盘记录保留。旧 Agent 示例可经 `#book/sample/agent`；原其他旧 `#book/foundation` 等直达保留。旧示例的章节按钮显式 sample 路由；切新版不会标为掌握或完成。旧计划导出仍按 sample-0.1 输出。

每章九节原文、逐点讲解/情景题/解析/迁移、三层任务/参考解法/反馈、原案例与验证规格、来源和论断定位分别显示，长文有目录定位、上一章/下一章与全书模式。直接题解析及参考解法用折叠，正文不自动判卷。全书/单章 Markdown 导出带教材版本、作者身份与证据状态，原始正文保留，不包含档案、账户、作品、自述或密钥。

正文按不可信输入转义。仅允许本地 Markdown 标题/段落/列表/表格/代码围栏/粗体与行内代码；不执行 HTML、任意 Markdown 链接或图片。具体来源只给明确官方 HTTPS 白名单生成外链（无用户名密码和非标准端口、noopener noreferrer），内部参考显示文字。各类来源不受原十二来源 ID 限制，按作者实际交接读取；额外官方域名按课程及审校交接添加。

当版独立 AI 内容审校单独读 `textbook-content-review-data.js`，只有报告 `textbookVersion`（兼容 `version`）与源包版本、`inputSha256` 与工程包装 `sourceSha256` 都相等才展示为当前审校。缺报告或不匹配明确显示“未匹配当前稿”；作者 `review` 不改。人类专业审核、真实学员效果仍未完成/未验证。页面中的案例状态以作者记录为准，预期不转为实际运行。

QA 字段交接后，已兼容独立内容报告 `reviewScope/chapterResults/defects/remainingGaps` 的原样显示。当前产品审计及嵌入本地验证同时要求 `productVersion`、`textbookVersion` 与 `textbookInputSha256` 匹配；版本或教材源包哈希不匹配不授当版结论。未改判定规则、门槛或报告。

网站常量与页脚为 `local-mvp-0.5-textbook`；本地服务 health/生成服务仍 0.4，服务及 generation.js、generation-curriculum-data.js 完全未改。当前产品旧 0.2/0.3/0.4 报告仅历史，本版审计未交时显示未独立审计。`dist/textbook-data.js` 与 review JS 此刻明确为 null 准备态，缺包展示错误和旧例入口：**教材正文尚未接入，不能说完整教材已交付**。

## 开发自检（阶段一，非独立验收）

- `node --check dist/textbook.js` 与 `dist/app.js`：通过。
- 隔离 Node VM 合成测试内容 15/15：缺包提示；默认 c01/新网站版本；HTML/危险链接/代码/表格安全；官方 URL 允许及协议/凭据/端口/外域拒绝；十二章形态；逐章九节/全书按序阅读；读者导航不写旧存储/不改旧通过；旧 Agent 测验仍可读；旧直达/历史恢复；全书及单章原文导出且无用户信息；审校 version/hash 匹配；旧审计不继承；破坏包明确错误；未知章节不静默换章。
- 自检脚本 `/private/tmp/rolecraft-v05-client-selfcheck.mjs`，只有虚构 old state 和依据 spec 构造的合成占位夹具，绝不是作者教材、案例实际运行或学习证据。未运行真实浏览器、下载动作、服务/模型或默认数据库。

## 待交接与独立复核

作者交完整十二章 JSON 后工程原样包装及校验数据对象深相等，按实际字段修正展示；独立内容审校员交 report 后原样包装并核 version/hash；QA 当前产品报告交后原样追加包装，旧报告不改。最终 QA 应独立核正文可访问、下载内容、状态及安全、新旧版本/记录隔离、受影响生成/账户与现版报告绑定。最终完整稿未到，本阶段只交骨架供 QA 准备，不授教学/行业/生产通过。

## 阶段二：按实际候选包校正字段，仍待作者冻结

作者候选包已经含十二章、108节、48点、36练习。工程只读实际 JSON 并在隔离 VM 注入，**没有打包候选为网站完成稿、没有改作者源或审校报告**。已补充直接题 `questionId` 与 `question/primaryQuestion/directQuestion` 消费、条件解析及迁移、综合练习 `transferPrompt`、示例 `actualResults`、节来源、主项目、统一术语和作者审核元数据（明确不作为独立审核）；新增作者直接访问来源 `opentelemetry.io` 官方域，与 HTTP/Git/Python 域均安全消费，不按旧来源数量截断。

独立审校报告的 `reviewer` 是对象，现按准确 JSON 文本显示，避免 `[object Object]`；`defects.moduleIds` 按章筛选，`reviewScope/chapterResults/defects/remainingGaps` 保持原文。报告 `needs_revision` 显示“需返修”，不会写回作者 `review`，未匹配当前源 hash 时保持未匹配。

开发自检 `/private/tmp/rolecraft-v05-real-schema-selfcheck.mjs`：首轮实际 schema 自检先通过2项，随后发现 `questionId` 未显示（题正文仍显示），已修客户端并原断言复验；最终10/10通过。最后读取的**未冻结候选** hash为 `524cbdb08d6ba4e80c087f1a28426856bb234bb01fd16ae73ff23ad1857faada`，作者仍返修，不能当最终版本。覆盖全108节原文导出保留、48点题/解/条件分析/迁移、36练习解法/反馈/迁移、全部候选官方外链、实际源hash匹配、审校领域字段与身份、单章隔离、全书主项目/术语和未执行状态。所有运行仅客户端字段消费，未执行教材示例、浏览器、模型或默认数据库；案例真实执行归独立 QA 记录。

修订后 JS 语法通过；此前合成夹具15/15于字段校正前后的相关修订均通过。下一步等作者/审校最终冻结，再原样包装并将最终源hash和客户端hash交QA；当前 dist 作者/review 数据仍 null，正文尚未接入。

## 阶段三：获授权作者候选接入并交独立 QA

项目经理确认作者已暂冻结完整候选并允许接入后，工程核作者 JSON 原字节 SHA256 `524cbdb08d6ba4e80c087f1a28426856bb234bb01fd16ae73ff23ad1857faada` 再将全文原样包装至 `dist/textbook-data.js`，独立 meta 保存准确源路径/版本/hash。作者 MD `9473f444217af47acefe568fd081ebc210d48266e536c76754ae723568522924` 由作者持有，未改。十二章新正文现已实际接入，source 候选后续有新缺陷仍需新 hash 与独立复验，不能把暂冻结或接入当成专业通过。

现有独立内容审校 JSON（源 hash `60a4ef7a6bd753f98bc529a1cb8450ec87891697efa0a910fb8b72efa008790b`）亦原样包装，但它尚绑定旧源/需返修，页面按版本/hash显示“未匹配当前稿”；最终审校交后再替换，作者源 `review` 始终未改。当前产品审计 v0.5 尚未交，不匹配旧审计。

包装开发自检6/6通过：作者 JSON 与包装对象 deep equal、独立 review JSON 与包装对象 deep equal、原字节源 hash、十二章九节形态、review 精确匹配判定、默认只读页面。四份 JS 语法通过。未控制真实浏览器、启动/读取默认用户服务、执行教材代码、收费模型、学员或外网部署。已把实际源码及 hash 交独立 QA，可基于真实包验证；无需等待最终审校即可检查阅读功能。

冻结客户端输入（作者候选初次接入；后续最终 report JS 会更新）：

- textbook-data.js `0bbeb8766c5ac95dd25960aff2ea960e7ee2c8c9a9a9c209c02e993121d96040`
- textbook-content-review-data.js `175eff35a48d29cb5b5440d22555cbecb2b2644151a1383219a2f8132fc0c1e3`
- textbook.js `470ac6814b5347fdfd3050ba84475637a1d31b6ef6267effe7fa0442fde64fd5`
- app.js `84c8f04d28466132a40bdf2238d183c917371681271ff35bae67aba1dd618c43`
- index.html `1aab6c6f461c162ccef31f223c24461b0e80b75fb797c12e28815b92e62abba1`
- styles.css `3bbc6595e02bcf37a9bc924216d2edab67956a096a7207cf925c7bf69b5daeee`

## 阶段四：最终作者二次返修重包装

独立审校新发现 CRV05-07 的 f01 priority 非标量类型边界及 CRV05-03 的 f02-independent 映射残留，由教材研发员修正文/代码/映射，不由前端工程代写。项目经理交接最终源 JSON hash `bec38479047f9158ac0b218c3e3b921601a5ab90ed5caeddb9c1e370562796fd`、MD hash `a8d8d30111ed865f6ab013e1a025f2d0907e73b9107cccdc854489211eb0b102` 后，工程核源 hash再原样重新包装；前述524cb候选成为历史输入，不能当最终包。

最终作者 `textbook-data.js` hash `6fa6a704f46d26adc38bbdc90256d27919309e98177c69459899aa77a3413d73`。其余客户端源码及旧报告/生成输入/server不改。正文/meta立即同步提供QA实际网页验证；独立review仍旧包，未匹配最终源前保持明确未知，不授通过。README当前hash已更新，历史记录保留。

此次包装开发自检5/5：作者对象与源JSON deep equal；源原字节hash；十二章九节合法；108节导出逐项原文一致；默认新版阅读。数据JS语法通过。未运行教材代码/真实浏览器/服务账户/供应商；不把作者修复或包装当独立验收。最终独立内容与产品报告交接后再原样包装，保留历史版本并交QA focused复核。

## 阶段五：最终独立内容审校包装

内容审校岗位交最终源 `textbook-v05-content-review.json` hash `9625c2c826f53bbcc1a20781cb093de20b9f214397069d35f7cf095062736b62`，准确绑定 `textbook-draft-0.5` 与作者 `bec384...`。工程只原样包装，reader仅新增已交状态 `reviewed_with_limitations` 的中文显示“AI文稿审校完成（有范围限制）”，不改报告、不把文稿审校变成案例/真人专家/学习效果或完整教学通过。报告原七缺陷、返修复核、逐章和剩余范围仍可见。

- textbook-content-review-data.js 最终 hash `9969bb86e62ffa5bd1709ea63a892410c13e99933f1ab3480553abbb268dd5ef`
- textbook.js 最终 hash `b9f543f2bd01c13335ca17d4700f9399cb4f7d97b20fcc7082a6e1de6a4ca0dd`
- textbook-data.js 与 app/index/CSS 均保持阶段四最终作者接入的 hash；没有其他客户端逻辑改动。

包装开发专项最终7/7、两JS语法通过。首轮专项最后一项误将只关联 f01 的 CRV05-07 预期出现在 e03，按真实 `moduleIds` 校正隔离自检对象为 f01，并保留 e03 不显示该缺陷断言；应用无对应缺陷或筛选逻辑变更，不能借夹具校正宣称修改产品。已通知QA仅复验受影响匹配/领域显示/标签/源hash与 T15。README状态校正，最终产品审计待独立QA源交接再包装。

## 阶段六：独立产品审计最终包装

QA 交 `product-audit-v05.json` 冻结源 hash `94d2228baaefecb72083c4a8c32cde7786defe1fbfd4a6355dae48e079875a75` 后，工程只将 baseline/v03/v04/v05 四份对象依序原样包装，保留原完整报告；源报告、门槛、作者、独立内容审校与其他应用文件均未更改。新 `product-audit-data.js` hash `83f71b9865689c10efc350140c6ad63df344fc6606ef2e37511b39d16a539f0b`。开发专项8/8及数据JS语法通过：四份对象逐项 deep equal、4报告、最终教材hash、正式结论和本地范围结论一致。QA将仅复核最后显示/版本/哈希及自述身份隔离，不因包装重复执行全部测试。

正式职业学习系统结论 **not_met**：real_generation/reliable_delivery 2项失败；user_value/teaching_quality/comparative_advantage/learner_creation/operating_economics 5项证据不足；iteration_trace 1项只对本轮记录通过。本地限定范围 **met_within_scope**，实际为作者源包与原课程对应、隔离 DOM/虚构 storage VM 阅读及导出内容、公共 loopback HTTP，以及 f01/e02/e03 三个 Python 3.14.5 离线例和声明变体的6次独立进程执行；真实浏览器/原生下载、真模型、全书运行、真人专家、学习效果、市场经济和生产范围未验。作者 examples.not_run 保留，实际QA代码证据另附正文/代码hash，不能相互继承。

README当前结论按独立报告更新。最终包装专项尚等独立QA确认；源JSON无需再改避免打包循环。网站工程领域仅完成只读消费与报告包装，不能替专业审核或用户学习效果宣布达标。
