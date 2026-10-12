# 教材重生成 v0.5 · 独立质量验证记录

日期：2026-10-10。测试工程师独立代理 `/root/qa_engineer_v05`；不修改作者正文、产品门槛、课程架构或应用代码。本记录持续追加实际执行与返修证据。作者自查、AI 内容审校、案例运行、人类专家、学习效果、正式系统八门槛分别记录。

## 准备阶段

已读取 `AGENTS.md`、B01 `textbook-v05-product.md`、B02 `textbook-v05-spec.json`/`textbook-v05-curriculum.md`、B03 `textbook-v05-frontend-contract.md`、原 `product-gates.json`、v0.4 独立报告和相关源码。采用 Sites 本地预览参考；不发布或上传，不读默认 SQLite，不访问账户接口，不清空真实浏览器存储，不调用付费模型。

独立脚本 `qa-v05-check.mjs` 规划验证十二原模块/九节正文、冻结目标先修量规、知识点与题/答案映射、来源关联、作者身份、包一致性、章节和全书路由、旧样例及状态保护、不可信内容转义和 URL 白名单、下载正文与证据状态、版本/hash 审校绑定、历史审计不继承、冻结模型及后端不变、公开 HTTP 资产。内容语义交内容审校岗独立报告；代码只对先读过、标准库/离线/无真实业务副作用的声明可运行例子在临时环境执行，伪代码不运行。

2026-10-10 准备态专项实际执行：Node 内联 ESM 导入隔离 VM，3/3 PASS，exit 0。仅检查当前教材源包为 null 时明确“尚未加载”且不伪装旧测验，危险 URL/HTML 转义，以及当前 v0.5 没有审计时不继承历史结论。未交付完整作者包，此结果不构成教材验收或质量通过。

## 当前状态

作者最终包、客户端原样打包和独立内容复核待交接；当前未判定完整书或正式系统通过。最终审计同时绑定网站 `local-mvp-0.5-textbook`、教材 `textbook-draft-0.5` 和作者源 JSON 原字节 SHA256。代码、浏览器、真实模型、学习者及行业专业/市场证据按实际执行记录，不由准备态结果推定。

## 初稿快照离线案例实际执行

收到八章 authoringComplete=false 快照，原字节 SHA256 `49642ab97b656d3e82efa28bd15f420fc1ab815945803a1c3b3a716cf3c827c4`。先逐行读取 f01、e02 的 Python 围栏代码，确认仅 json/纯函数/断言、无网络、凭据、业务副作用或默认库访问，再执行 `node sites/rolecraft/team/qa-v05-examples-check.mjs textbook-v05-authoring-snapshot.json`。Python 3.14.5，SQLite 3.50.4（仅版本查询，示例未使用数据库）。临时目录执行后删除。

f01 原样示例 exit 0，规范化边界空白、JSON 往返及空标题失败断言通过；另加独立变体：有效 high 优先级、列表输入、缺标题、数字标题、未知优先级均按契约通过。e02 原样示例 exit 0，total=3/success=2/critical=1/cost_per_success=3；另测空集分母、解除关键失败后 success=3、零成功成本为 None，exit 0。四次实际进程均通过，完整输出和正文/代码 hash 保存在 `qa-v05-example-snapshot-evidence.json`。

此为快照两个离线例子的实际 QA 运行，不是全书、模型、真实学员或生产证据。作者 `executionStatus=not_run` 未改动；独立记录与作者自查分开。最终书仍需按正文 hash 核对应代码是否一致，变更则复验；当前 e03 伪代码未执行。

## 浏览器准备首轮问题（未关闭）

已按 Sites portable/local preview 和 CUA `local-web-development` 参考选择现有 in-app browser 2。现有 `http://127.0.0.1:4318/#book/agent` 未找到，当前 tab 列表为空。随后新建后台临时公开教材页，实际返回 `net::ERR_CONNECTION_REFUSED`，没有读到教材正文。此为真实首轮连接失败，已交项目经理安排后端恢复原服务；没有另起替代代理/协议或访问用户 DB。

已读 `browser-troubleshooting`。失败时创建的临时 tab 1 为浏览器错误页；尝试按已知 ID 绑定以清理时，工具因其错误页 `data:` URL 返回 URL policy blocked，已停止操作，不绕过限制。该页未标 deliverable/handoff，属于工具默认临时页。恢复服务、最终教材到齐后需重新执行公开 HTTP/浏览器阅读验证；当前浏览器正文和原生下载未验证。

本阶段准备及快照例子抽验交付，释放并发，等待项目经理在最终包和服务恢复后再次指派独立验收。完整 v0.5 产品审计尚未交付，不能据此宣称完整 QA 或教材达标。

## 最终作者包首轮独立检查与夹具修正

作者二次返修最终 JSON SHA256 `bec38479047f9158ac0b218c3e3b921601a5ab90ed5caeddb9c1e370562796fd`，前端原样包装 hash `6fa6a704f46d26adc38bbdc90256d27919309e98177c69459899aa77a3413d73`。首次执行 `node sites/rolecraft/team/qa-v05-check.mjs`，实际 15/20 PASS，exit 1，原失败保留如下：

- T10/T11/T16：QA 点击夹具将所有 closest(selector) 都返回按钮，误把普通按钮当 `[data-textbook-anchor]`，导致按钮动作不执行。按真实 selector 语义修正夹具，保留原应用断言，专项 `--only=T10,T11,T16` 3/3 PASS，exit 0；未修应用或放宽要求。
- T15：审校岗源 JSON 已绑定最终稿，但包装仍为旧作者输入 `4c747...`，与源不深相等。旧报告在网页拒绝匹配符合要求，已交前端原样重包最终独立审校。等待复验，不先判通过。
- T19：默认沙盒 fetch 失败真实 cause=EPERM；仅公共 health/静态文件请求获自动批准后复核，真实 cause=ECONNREFUSED，已交后端恢复持久服务。没有访问账户/用户库/真实模型；这是连接失败，不是自动审批拒绝。

验收脚本在首次执行前按实际 CR03 映射交接核对 `specExerciseIds` 保留原规格与实际 exerciseIds 双向对应，避免将初始宽映射冒充实际练习覆盖；没有改规格或学习目标。T01—T09/T12—T14/T17—T18/T20 的实际通过只支持作者结构、静态/VM 阅读与证据身份，不能推出教学效果。

## 当前浏览器能力限制

后续最终验收重新启用 CUA 时前轮 binding 不存在；按文档选择公开 URL 返回 `No browser is available`，全启用表面库存 browsers=[]。因此无法继续实际 DOM、原生下载、视觉、键盘或读屏验收。项目经理已确认不等待浏览器、不安装或采用其他控制能力；继续公开 HTTP、隔离 VM 与代码实际检查。前轮 ERR_CONNECTION_REFUSED 与本轮无浏览器能力分别保留，不把模拟 DOM 说成浏览器实测。

## 最终稿三个离线示例实跑

逐行安全读取最终 f01/e02/e03 示例，确认标准库纯函数/内存夹具，无网络、外发、真实退款、默认库、账户或付费调用。执行 `node sites/rolecraft/team/qa-v05-examples-check.mjs textbook-v05.json --include-e03`，Python 3.14.5，原样三个进程和独立扰动三个进程全部 exit 0。证据 `qa-v05-examples-evidence.json` 同时绑定最终作者 hash、例 ID、example 节正文 hash 和 code hash，临时目录已删除；快照初测另存，未泛继承。

f01 独立检查所有 JSON priority 类型（null/布尔/数字/列表/对象/非法字符串）及原对象/标题结构错误，均按题定 ValueError 代码拒绝，修复 CRV05-07 的 list/dict TypeError；正常对象及空白边界仍通过。e02 检查关键失败变化、空集分母和零成功，未把合成 cost_units 当真实成本。e03 原样及扰动检查保存任务禁止发送、租户/对象/工具约束、准确批准及 recipient/payload 篡改、恰好到期拒绝/到期前成功、审批单次消费无二次追加、已分类敏感标记在 context/output/payload/logs 四通道排除，以及合法 message 保持。

这些结果仅是三个 Python 3.14.5 离线单线程夹具的独立 QA 证据；Python 3.10 兼容性未实际执行。其余伪代码、真实模型、检索/恢复/部署/性能、未知敏感编码/隐写、持久并发原子消费、真实身份与外部服务未执行。作者仍 not_run；文稿 AI 审校不冒充案例运行、人类专业或学员证据。

## 最终受影响范围复验与冻结

最终独立内容报告源 hash `9625c2c826f53bbcc1a20781cb093de20b9f214397069d35f7cf095062736b62`，状态 reviewed_with_limitations，绑定作者 bec384...；工程原样包装 review JS hash `9969bb86e62ffa5bd1709ea63a892410c13e99933f1ab3480553abbb268dd5ef`。`--only=T15` 实际 1/1 PASS，exit 0；正文版本或源 hash 不匹配时仍拒绝。显示专项 2/2 PASS：AI 文稿审校有范围限制、人类专家/学员未完成、剩余缺口及 f01 CRV05-07 可见；删去新增状态标签后 reader hash 恢复原 `470ac...`，确认只映射文案改动。初次内联显示检查用了报告并不存在的字面语“不将结构检查”，失败属 QA 文案假设；改为逐个核报告实际 remainingGaps 原文后复验通过，无应用修改或证据放宽。

后端按职责恢复 detached 服务，并结束该代理。随后在已获自动批准的只读公共 HTTP 下 `--only=T19` 实际 1/1 PASS，exit 0：health200/productVersion=local-mvp-0.4，index/textbook reader/教材数据/审校数据四资源200且与磁盘逐字相同。原 EPERM/ECONNREFUSED/浏览器连接拒绝均保留；这次真实公共 HTTP 通过不能推定真实浏览器/账户联合验收。

最终20项在分阶段执行中全部通过：首轮15/20；修正点击夹具原断言3/3；最终审校包装1/1；服务恢复后公共HTTP1/1。不是一次20/20完整运行。另准备态3/3、显示专项2/2，最终三个离线例的6进程各exit0；不重复跑无变化的0.4整套服务/模型测试，旧版本硬编码断言不修改来掩盖版本变化。

冻结 source hashes：app `84c8f04d28466132a40bdf2238d183c917371681271ff35bae67aba1dd618c43`；index `1aab6c6f461c162ccef31f223c24461b0e80b75fb797c12e28815b92e62abba1`；styles `3bbc6595e02bcf37a9bc924216d2edab67956a096a7207cf925c7bf69b5daeee`；reader `b9f543f2bd01c13335ca17d4700f9399cb4f7d97b20fcc7082a6e1de6a4ca0dd`；textbook data `6fa6a704f46d26adc38bbdc90256d27919309e98177c69459899aa77a3413d73`。原 backend/generator/e03受控输入、标准与课程规划 hash 均与0.4冻结值相同（T18）。

完整八门槛按当版证据重新判断，沿原标准而非继承0.4：真实生成与正式生产仍fail；完整十二章+AI文稿复核补齐后，教学质量改为insufficient（全书运行及人类专业确认仍缺），用户价值/行业比较/学员创造/经济运行仍缺证；当次产出追踪限定pass。因此整体not_met，2失败/5证据不足/1限定通过。本地作者包与只读阅读/导出VM、公开HTTP、三例有限运行范围可以met_within_scope，不能改正式产品结论。最终报告原样包装后另做专门一致性核对，不改冻结JSON形成循环。

## 最终报告包装独立关闭

执行 `node sites/rolecraft/team/qa-v05-package-check.mjs`（仅本机公共审计JS读取获自动批准），实际 **9/9 PASS，exit 0**。四份报告对象与 baseline/v03/v04/v05 源 JSON 完全相等，旧三份 hash 未变；当版网站+教材版本与 bec384... 源 hash 匹配，冻结全部源 hash 不变。完整 not_met/2fail5insufficient1pass 与有限 met_within_scope 两范围不混用；三例/6进程的具体正文/code hash 与最后作者代码相同，作者未执行、真人专业/学员状态保留。伪造用户存储或同版本错误教材 hash 无法授予当前独立/专业结论。公共 HTTP 最终审计资源200且与磁盘原样一致。

最终 `dist/product-audit-data.js` SHA256 `83f71b9865689c10efc350140c6ad63df344fc6606ef2e37511b39d16a539f0b`；冻结 `product-audit-v05.json` SHA256 `94d2228baaefecb72083c4a8c32cde7786defe1fbfd4a6355dae48e079875a75`。只追加此MD及当前审计MD关闭记录，未再修改JSON、教材、应用或旧报告；未重跑无变化全套或触碰真实账户/DB/浏览器storage。Codex公开教材页展示queued不计浏览器实测。

本轮作者包/所测只读阅读与导出内容/公共HTTP/三例离线运行已完成限定独立验收。完整职业学习产品仍未达标；真实模型、全书案例、人类专业、真实用户/学员/行业/生产/经济，以及实际浏览器/原生下载/视觉/键盘/读屏仍开放，由各对应岗位继续取得证据。
