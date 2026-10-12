# 软件工程师 · prototype-0.2 实施交付

日期：2026-10-10。唯一责任领域：软件实现。输入：工作区 AGENTS.md、产品 product-standard.md、课程 curriculum-standard.md 与 curriculum-data.json、设计 design-standard.md、质量 quality-standard.md 及原 qa-review.md。

## 交付范围与版本

网站 `prototype-0.2`；课程结构 `curriculum-draft-0.2`；原八章 `sample-0.1`。仅修改 `dist/app.js`、`dist/styles.css`、`dist/index.html`，新增 `dist/curriculum-data.js`，更新项目 README.md，并写本交付。未修改专业标准、课程 JSON、QA 脚本或项目经理记录。

| 目标 | 实现结果 | 证据与状态 |
| --- | --- | --- |
| 显示能力标准 | 7 能力域、4 层级、模块关联、四项真实参考来源及来源类型／日期／边界；0—3 项目量规和六维证据 | `standardsPage()`、课程数据；开发自检 E01/E02/E04，通过；独立功能／专业审核待责任岗位结论 |
| 显示课程地图 | 12 模块按层排列，目标、先修链接、证据、验证、深度、九项结构与来源；八章短示例入口；e03/e05/p01/p02 完整教材待编写 | `curriculumPage()`；E01/E03；数据生成一致性检查，通过；教材正文未扩写 |
| 两类复盘 | 学习的教材／练习／作品，电子员工产物及责任岗位／版本；目标、证据、结果、差距、原因、改进、责任人、计划日期、复验方法／结果、自述状态 | `reflectionsPage()`、`normalizeReflection()`；E05/E06/E09；通过；独立审核固定未独立审核 |
| 多记录与草稿 | 新增、编辑、删除、草稿保存、刷新恢复；编辑一条不覆盖其他条；未提交草稿单独列入导出，删除／草稿替换有确认 | `saveReflection()`、`readReflectionForm()`、相关事件；E07/E08/E15/E17/E18；通过 |
| 保存、导出与输入 | 必填仅产物／目标／实际结果；字段错误就地提示；故障持久提示，内存输入保留可导出，成功恢复状态；Markdown 保留所有复盘字段和状态 | `save()`、`saveReflection()`、`reflectionMarkdown()`；E06/E12/E13/E14；通过 |
| 数据与内容安全 | 存储结构规范化、集合去重、范围校验；复盘用户文字 HTML 转义，Markdown HTML 转义；审查字段不可由自述改变 | `normalizeState()`、`escapeHTML()`、`markdownText()`；E10/E11/E19/E20；通过；不是全面安全审计 |
| 交互与兼容 | 中文移动导航、标题焦点、模块／章节 URL、浏览器独立历史条目、持久保存状态；先加载课程静态 JS，file:// 无 fetch 依赖 | HTML/CSS 与导航函数；E16 和加载顺序检查通过；实际浏览器表现待独立验证 |

## 原问题修复与原因

| 原问题 | 根因／改进行动 | 工程复验结果 | 独立验收状态 |
| --- | --- | --- | --- |
| QA-01 | replaceState 覆盖导航历史；改为独立 pushState，加入 #book/章节、#curriculum/模块，hashchange／popstate 恢复与标题焦点 | 原 T16、新 E16 通过 | 待测试工程师复验，不自行关闭 |
| QA-02 | 导出直接对未知项目值调用 includes；加载规范化项目数组，导出也使用数组回退，异常备注只接收字符串 | 原 T17、E19 通过 | 待独立复验 |
| QA-03 | 已存集合未去重或检查范围；passed 去重并过滤章节 ID，checks 按项目合法整数索引去重 | 原 T18/T19 通过 | 待独立复验 |
| QA-04 | 保存成功未恢复 storageAvailable；成功时恢复 true 和就地成功状态，失败保留内存及持久提示 | 原 T20、E13/E14 通过 | 待独立复验 |

首轮开发回归原脚本为 21/22：T21 揭示旧 `#book` 返回时档案切换后的最近章节状态未同步。工程修正档案提交时持久化最近章节，再以相同脚本复验 22/22。此项是本轮开发中发现并修复的回归，未把首次失败省略为一直通过。

## 领域自查与实际执行证据

执行环境：本机 Node.js v24.16.0、Python 标准库；没有安装依赖。旧脚本使用 VM、内存 localStorage 与轻量 DOM stub，本岗位执行属开发回归，不代替测试工程师独立验收。新版开发自检同样使用隔离 VM，先加载课程 JS，再加载应用，不访问用户真实存储、浏览器、网络或模型。

实际命令与结果（工作区根目录）：

```text
node --check sites/rolecraft/dist/app.js
exit 0
node --check sites/rolecraft/dist/curriculum-data.js
exit 0
node sites/rolecraft/team/qa-check.mjs
TOTAL 22; PASS 22; FAIL 0  # exit 0；原脚本未经修改
node /private/tmp/rolecraft-engineering-check.mjs
TOTAL 20; PASS 20; FAIL 0  # exit 0；工程临时自检脚本
```

另用 Python 标准库解析 `curriculum-data.js` 的对象并与原 JSON 比较，结果相等；检查 index 中课程脚本先于 app.js，三个新增导航入口均存在，均通过。生成数据没有 runtime fetch。

旧脚本结果逐项为 T01—T22 通过；详尽用例定义仍以未修改的 `team/qa-check.mjs` 为准。

新增自检实际覆盖：

| ID | 实际检查 | 结果 |
| --- | --- | --- |
| E01 | 7 域／4 层／12 模块／9 结构项 | 通过 |
| E02 | 三个新增页面生成标题并明确草案边界 | 通过 |
| E03 | 四个无章节模块明确正文待编写 | 通过 |
| E04 | 来源、0—3 分及非认证状态可见 | 通过 |
| E05 | 章／练习／作品复盘入口与预填 | 通过 |
| E06 | 产物、目标、实际结果缺失拒绝提交 | 通过 |
| E07 | 新增两条、编辑一条，其他记录保留 | 通过 |
| E08 | 刷新恢复字段及旧学习记录 | 通过 |
| E09 | 员工产物责任岗位与版本保留 | 通过 |
| E10 | 自述与篡改存储不产生审核通过 | 通过 |
| E11 | 用户字段的 HTML 转义 | 通过 |
| E12 | Markdown 字段、版本、自述／审核状态与未复验 | 通过 |
| E13 | 写入失败仍保留内存并可导出，提示持续 | 通过 |
| E14 | 临时写入失败恢复后状态准确 | 通过 |
| E15 | 未提交草稿刷新恢复并可导出 | 通过 |
| E16 | 章节／模块 URL 与 popstate 恢复 | 通过 |
| E17 | 对象类型切换不丢目标／证据输入 | 通过 |
| E18 | 删除仅影响所选记录 | 通过 |
| E19 | 异常复盘结构、重复 ID、备注结构容错 | 通过 |
| E20 | Markdown 中用户 HTML 转义 | 通过 |

临时复现脚本 `/private/tmp/rolecraft-engineering-check.mjs`、输出 `/private/tmp/rolecraft-new-selfcheck.txt` 和旧回归输出 `/private/tmp/rolecraft-old-regression.txt` 可供本轮复核；它们是临时文件，本交付中的范围、结果与代码版本是持久记录。该脚本不写入 QA 所有文件。

源码冻结后的 SHA256：

```text
bcedeab27e9ba5e00b4eb6f32823e6028c8b141235a663cf1f56fde0b7caec05  dist/app.js
ca028c91034167ccf7aef93b08cc5145cea59c863cd11058f82c5209d8c37303  dist/styles.css
04b5cd9e1022d5b6164ecf11179624f73984aab1b344c31bcf90876a18c9ce2d  dist/index.html
c3c93435d4417792182c1f98b450a1e1a5c23aa9a8136ddb03086570c03f1442  dist/curriculum-data.js
```

## 交给测试工程师的可复测入口

实际 hash 入口：`#standards`、`#curriculum`、`#reflections`；定位示例 `#curriculum/e03`、`#book/tools`。本地文件为 `/Users/shengxiong/Documents/ChatGPT/一人公司建设/sites/rolecraft/dist/index.html`，也可使用 README 的 4173 静态服务。

1. 从能力标准点击模块进入课程地图，点击先修编号再定位模块，查看九项结构与四个缺正文模块；返回／前进后检查页面和焦点。
2. 从教材／练习／项目进入复盘；填写目标和实际结果，保存两条，编辑一条并刷新；检查版本、责任人、日期和原学习记录。
3. 从复盘中心切换员工类型，选择网站产物和软件工程师岗位；保存自述已改进，核对独立审核仍未独立审核。
4. 在无独立审核的情况下填写复验成功，核对状态仍固定；导出检查全部字段、草稿及未复验默认值。
5. 在隔离存储中模拟写入失败，输入后核对持久提示与导出，恢复存储后再次保存；模拟异常旧 checks、passed、notes，检查不崩溃／越界／丢失其他正常字段。
6. 实机验证移动 320／375／768、桌面、缩放、中文导航、键盘、弹窗、页面／模块焦点、下载和 file:// 打开；这些不由 VM 结果推导通过。

兼容说明：旧 QA VM 只执行 app.js，保持旧页测试可用。三个新增页面需要同一上下文先执行 curriculum-data.js；若未加载，显示数据未加载提示，不能据此判定三页数据功能通过。真实 index 已明确加载顺序。

## 差距、原因与下一步责任

- 已完成的是静态标准展示、证据复盘和可靠性修复；教学草案及八短章没有变成完整教材。真实模型、检索、账户、代码执行、自动作品评估和专家审核未实施，原因是本轮明确限定静态实现范围。
- 本岗位未操作用户浏览器，未进行真实布局、读屏、Safari file:// 存储或下载实测；VM 不能覆盖浏览器默认行为。测试工程师负责独立功能／浏览器复测，设计师负责截图信息层级复核；结果由项目经理登记并分派改进。
- 来源访问时间沿用课程架构师已经交付的核验信息，本工程没有重新核验技术主张或运行教材示例；教材专业性、量规校准和真实学习效果由课程责任人及专业评审者负责。
- 本地存储无账户同步；file:// 与 HTTP 可分别保存。保存失败的内存输入不能抵抗刷新或关闭，已提供持续提示与导出，但不承诺故障下持久化成功。
- 未同步源码到外部、未发布、未安装依赖或选择付费服务。工程任务状态为“已实现并开发自检，待独立验收”，不是正式系统完成或原问题已独立关闭。

## 独立验收反馈后的修复复盘 · v0.2 修复轮 1

日期：2026-10-10。输入为测试工程师 `qa-v02-review.md`、未经修改的 `qa-v02-check.mjs`，及项目经理分派的 V02-01／V02-02 两类 P2。首次独立验收的 23/26、三个失败 V23—25 和旧冻结哈希保留在测试报告中；本轮没有抹去失败或修改预期。

### 目标、根因与改进行动

| 问题 | 真实差距与原因 | 本轮改动 | 责任／状态 |
| --- | --- | --- | --- |
| V02-01，V23/V24 | 已保存记录后新建，应清空新表单；新对象预填应切换对象。原实现先建新 draft，再 navigate，navigate 从仍显示的旧表单 captureDraft，将新对象覆盖。旧工程自检的轻量表单模拟未覆盖这个连续序列，导致漏检。 | confirmDraftReplacement 先读取旧草稿并处理替换确认；建立新草稿后使用明确的内部导航选项，不再次从旧 DOM 捕获。普通导航仍捕获并保留正在编辑的草稿，取消替换保留旧编辑输入。 | 软件工程师已实现；独立复验待测试工程师 |
| V02-02，V25 | 配额故障提交后内存有产物但未持久化，原实现提前将 dirty 设为 false，关闭保护失效。此前工程自检验证内存与导出，未检查关闭事件，导致漏检。 | 提交保持 dirty=true；save 接收提交快照，仅实际 setItem 成功后清 dirty，成功快照也存为 clean。另设 persistencePending，失败时保留关闭保护，成功存储后解除；不依赖表单是否仍存在，因而保护其他未写入的内存变更。 | 软件工程师已实现；独立复验待测试工程师 |

授权改动仅 `dist/app.js` 与本交付追加。产品、课程、设计、质量标准、原 QA 及新 QA 脚本均未修改。没有使用浏览器、网络、模型或发布。

### 实际复验记录

在修改前执行测试工程师新脚本，实际复现：`TOTAL 26; PASS 23; FAIL 3`，exit 1；V23 实际 foundation／预期空，V24 实际 chapter／预期 project，V25 实际 false／预期 true。修改后使用相同用例与预期运行：

```text
node --check sites/rolecraft/dist/app.js
exit 0
node sites/rolecraft/team/qa-v02-check.mjs
TOTAL 26; PASS 26; FAIL 0        # exit 0，V23/V24/V25 原断言均通过
node sites/rolecraft/team/qa-check.mjs
TOTAL 22; PASS 22; FAIL 0        # exit 0，旧回归未修改
node /private/tmp/rolecraft-engineering-check.mjs
TOTAL 20; PASS 20; FAIL 0        # exit 0，本轮原开发自检
node /private/tmp/rolecraft-recovery-check.mjs
TOTAL 3; PASS 3; FAIL 0          # exit 0，表单感知的补充开发自检
```

补充自检 R01：提交写入失败时 dirty 和 persistencePending 均为 true；解除故障后重提同一 ID，不重复创建，内存与实际写入快照 dirty 为 false，关闭保护解除。R02：无当前复盘草稿时，其他记录写入失败仍保护关闭，成功后解除。R03：编辑已保存复盘后取消新建替换，编辑输入与原已提交记录分别保留。三项均通过；临时脚本位于 `/private/tmp/rolecraft-recovery-check.mjs`，执行环境仍是隔离 VM 与内存存储，不模拟实际浏览器弹窗规则。

新版 `app.js` SHA256：

```text
d2a68798542c493dc4ae1991e6e9d66eda6311df87c29352aa4f423e13a2bd3a
```

其余三个网站文件哈希与上轮冻结值相同；教材数据与网页 hash 入口均未改变（`#standards`、`#curriculum`、`#reflections`）。源码现已再次冻结，交测试工程师以相同 V23—25 和相关记录／恢复用例独立复验。项目经理登记关闭状态须关联测试工程师实际复验结果，工程自检通过不自行关闭 P2。

遗留验证：真实浏览器中连续新建、表单编辑、焦点、配额故障以及 beforeunload 实际弹窗仍待测试；浏览器可能按交互和平台规则抑制提示，不能保证阻止关闭。数据持久化失败仍应先导出；模板草案、职业能力证据和正式教材边界未改变。
