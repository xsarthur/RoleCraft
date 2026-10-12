# local-mvp-0.4 独立质量验证

2026-10-10，测试工程师。只执行授权QA文件、隔离临时库/账号、本机HTTP及VM；不修改应用、专业标准、历史测试和真实用户记录。依据 implementation-v04-product/curriculum/design、generation-curriculum-v04、server/CONTRACT 与各工程冻结交接。开发自检37/16/15项均未当作本岗位结果。

## 实际执行与结论

```text
node sites/rolecraft/team/qa-v04-check.mjs
初次沙盒：12/14，G02夹具问题与HTTP_ENVIRONMENT EPERM；HTTP未启动
隔离夹具修正后、loopback自动审批允许：27/28，G01—13均通过，H02 Host检查失败
node sites/rolecraft/team/qa-v04-check.mjs --http-only
原生http实际wire Host复核：15/15，exit0
node sites/rolecraft/team/qa-v04-check.mjs --client-only
冻结修复版：12/12，exit0；补当前版本有效审计正例后相同12/12
node sites/rolecraft/team/qa-check.mjs
22/22，exit0
node sites/rolecraft/team/curriculum-check.mjs
20/20，exit0
node sites/rolecraft/team/qa-v02-check.mjs
25/26，exit1，仅V09
node sites/rolecraft/team/qa-v03-check.mjs
23/30，exit1，P01/P02/P12/P13/P16/P26/P28
```

最终新范围为13组模型替身检查、15组真实loopback/SQLite、12组客户端VM均通过，不能把这些组数称作真实调用、浏览器或完整产品达标。分阶段执行，未声称一次40/40全套运行。旧脚本没有删断言：V09固定0.2，P01/P26/P28固定0.3，P02固定十导航，P12要求当前0.3未审计，P13/P16注入0.3报告成为当前。真实现在是local-mvp-0.4／11入口，旧报告为历史；C01/C03/C04/C05分别复核新版、历史及当前匹配/正式失败与限定静态通过、schema和汇总规则。其余旧断言仍过，包括V23—25、P11/P17/P24；没有把全部失败无条件归为升级。

G01—13独立覆盖配置/预算阻止、三起点、九节/先修不变、sourceId/URL/定位和双向引用、额外审核/执行字段拒绝、拒绝/截断、401/429/500、错误脱敏、超时/取消、大小/usage和课程正文hash/原量规。成功通过显式options.transport标simulation；所有案例结果仍未运行，语义/教法和新人作品未审核。运行前声明预算不是供应商费用硬上限，actualCostUsd仍null。

H01—15使用独立QA子进程启动原后端，临时SQLite及两真实研发会话；实际HTTP覆盖认证/CSRF/Origin/原生Host/自报身份、隔离及跨章关联、版本冲突/幂等、排队取消、迟到worker fence、模拟成功单章/attempt/event提交、失败显式关联retry、真实SIGKILL与重启后interrupted未知/queued恢复、保存与导出、注销、URL/请求大小/静态路径。所有供应商请求在QA专用子进程替换fetch拦截，无外网和实际收费；该路径测试产生的供应商字段即使写openai也只属QA合成fixture，不计真实模型证据。临时DB结束清除，无读取默认.runtime或用户存储。

C01—12使用真实冻结客户端代码、既有QA harness与模拟DOM/fetch。新增FormData迭代、十一导航与AbortController基础适配，不改旧断言或需求。验证作者稿原样包装、file不请求、启动路径、当前审计/旧历史、同源CSRF、配置阻止、HTML转义/受控URL/模拟标识、轮询不覆盖输入、保存故障保留、401/退出清私有输入、epoch拒旧响应、作品缺证、自評只读身份及当前账户导出。它不替代真实浏览器或浏览器与本机服务联合测试。

## 首轮问题、修复及测试适配

- **V04-01/P2（网站客户端）**：普通file模式提示 `cd sites/rolecraft` 后运行 `node scripts/start-local.mjs`，实际脚本位于工作区根scripts，项目子目录路径不存在。预期提示解析到真实启动脚本；首轮人工读取generationMount及文件定位复现。工程改 `node ../../scripts/start-local.mjs`，generation.js从271c64…变4729f5…；C02保留“提示路径存在”断言已复验。此次只验证路径与不发请求，不声称已跟随浏览器提示运行生产服务。
- **G02测试夹具适配**：原budgetUsd=0、estimate=0.1同时满足预算无效和超预算，实际budget_exceeded，不能以其归预算缺项分类bug。改缺项夹具为两值均0，保留budget_missing预期；另有效预算1/estimate2检查budget_exceeded。原失败和调整原因保留。
- **H02运输适配**：Node fetch自定义Host检查返回200；源码Host规则拒绝存在。改用node:http明确发送wire Host=evil.invalid，原400预期实际通过，其他CSRF/Origin/自报身份断言不变。不将未发送目标Header时的200登记为绕过Host缺陷。
- **CV04-01/P3（课程材料）**：审校员发现15/11摘录计数，课程修13/10并说明空白分词。QA另以Node断言实际split计数13/10且excerptWords匹配，exit0；C01检查最终JS与JSON原样相等，G13正文hash保持。审校原问题复核见content-v04-review。仅元数据任务关闭，不关教学运行门槛。

## 当前版本证据与限制

app.js `3419df6bd1c5597a0509016f0910fb74b265a01114a682e623f70b487cae95fe`；generation.js `4729f5caad5b17638b73f2cb7744a7aff1015e6a8e97f05b0efd3c5146c09b40`；server/index `f111fa0f17389a0b586d34f75748b844fa042f9ab88985189c77a30563daf0d8`；generator `52ef3ffefe3028187192fa7712693a1929949403f651daaeb09999a7a12d5beb`；课程JSON `4333cf72964a0fd3e315333fcf65e19b2b234a60e0d87a7dfdf327f68a40d415`，课程JS `3864bf34d4f15e89a1e8c44b692272d3febb387a704371703886a7621ce1cdbc`。其他输入hash见本版审计JSON。

真实进程仅变量存在性检查：OPENAI_API_KEY=false、OPENAI_MODEL=false，未读取值；不推断用户无账号。真实模型调用未执行。无浏览器、视觉/键盘/读屏/原生下载、实际真人作品或专家、市场比较、账单、生产身份/TLS/监控/备份测试。测试没有运行CR03/CR04知识助手/脱敏/审批教学实现，HTTP账户隔离不是教材案例的权限执行证明。

限定本地功能通过；正式八门槛仍未达标，详见product-audit-v04.json/.md。只读当前报告打包及两范围页面呈现尚待工程加入本版报告后专项验证；本次不预先宣称包装通过，不继承0.3结论。

## 最终显示文案专项冻结

2026-10-10，工程将“本轮静态原型：功能验收”单一标题改为“本轮本地功能：功能验收”。QA实际Node内联focused2/2（exit0）：把该唯一标题逆替换后SHA256恢复原3419df6…，证明其余app源码字节不变；其他审计inputHashes均与已测冻结值相等。读取当前真实QA JSON作为隔离报告输入，当前正式not_met、限定本地功能met_within_scope和全部限制原样显示。没有把该显示改进混成新功能失败，未重跑已过套件。

最终app SHA256 `d147f189a81d7f6ebcdb8e6cb7f047e13c50b1146f9e0bde3a7995dacf27693c`。上节3419df6…为首次冻结/原功能验收输入，历史保留；本版审计JSON已绑定最终app hash。此专项仍属VM，不是浏览器。真实数据包装未改，待工程仅原样加入本报告后再最后核对。

## 最终原样报告包装验收 · 2026-10-10

实际执行 `node sites/rolecraft/team/qa-v04-package-check.mjs`，FOCUSED TOTAL6／PASS6／FAIL0，exit0。F01包装对象逐字段等于baseline0.2、v03、v04三个原JSON；F02最终源码hash及课程JS/JSON匹配，审计JSON中的旧auditdatahash保持审计输入历史；F03仅0.4正式报告成为当前，3fail/4insufficient/1pass及整体not_met；F04本地功能限定met_within_scope、报告scopeLabel和实际显示限制明确真本机/VM/模拟及未测范围；F05两个旧版本仅历史；F06伪造本地自述审核不改变只读QA/专业或独立结论。

最终app hash `d147f189a81d7f6ebcdb8e6cb7f047e13c50b1146f9e0bde3a7995dacf27693c`，auditdata hash `4f809adb3e80a41189debb9d98e53f7beee5b298b49c3613929a1443696aeeed`。未改任何QA JSON，未访问PM正在运行服务的私有数据/默认DB，不再跑已通过无变动套件。所测本地功能交付和包装验证可关闭；八项完整产品缺口保持开放。

此追加是包装后的新证据，JSON证据hash仍为冻结时快照，不为追加文本循环重写报告/打包。浏览器、真实模型、内容案例运行、真人专业/学员/市场/生产及账单均仍未验证，scope static_prototype只用于兼容当前UI枚举。
