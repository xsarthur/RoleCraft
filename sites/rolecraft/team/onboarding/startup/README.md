# 任务开始：只读正文与版本检查

本工具只帮助取得本任务所需输入并核对引用，不认证专业理解、真实专业调用、应用质量或完整团队接通。没有启动事件、后台监听、安装器、网络请求、Git 写入、锁或回执保存。不会修改原 ROLE/MEMORY/SCHEMA、等级、closeout 旧案例或方法候选。

## 每项项目任务的必读启动流程（2026-10-18，本地修复）

**普通开工入口是完整必读队列，不是自行从目录挑“相关”文件。** 先按实际执行职责选择原岗位（下例产品岗只是参数示例），从工程根运行：

```bash
python3 -B sites/rolecraft/team/onboarding/startup/read_source.py --required-flow --roles product-manager --page-bytes 4096
```

上方正常入口推荐 `--page-bytes 4096`，仍受完整序列化页8,192字节硬上限保护；代码默认、旧checker/list提示和兼容入口仍为2,048，未显式选4,096时页数不同。当前冻结产品34件在推荐4,096参数下为83页，页数随当前文档版本变化，不是固定验收标准。

每次工具调用只消费这一页 `content`，随后把返回的 `next_command` 原样作为下一次独立调用；它会跨文件继续，不在一个来源末页停止。每个非队列终页都有下一命令。角色集合决定追加哪些实际原岗位资料，不能删减共同必读基线；不要把多个含正文页聚合成一次大工具输出，也不要把页存盘后仅打印摘要。

顺序固定为：完整AGENTS → 五份接入文档 → 本启动说明与两份启动JSON → 原core/v12目录和共享偏好 → 所选原岗包或实际专项资料 → 八份已冻结项目接续记录 → 十份固定方法。本轮“最新”仅指显式冻结的八份已知接续记录，不自动发现 validation 新目录；`project_latest_records_readable`只覆盖此清单。后续新归档需在下一轮另核后更新白名单，不能把本轮业务完成后产生的记录追溯当作本轮已读输入，也不声称永久代表最新。

产品岗当前至少 **34件**；上轮漏读14件全部保留为必读，不因“相关/必要/已读过摘要”而省略。八份接续记录包括原两归档、两收尾和两轮无提示验证各自README及最终回执；它们的FAIL/partial保持原结论。读取整份文档不等于每条方法都要应用；正式方法采纳仍须用户确认。

`required_flow` 给出所选岗位、来源总数、当前来源序号、全局页位置、剩余页、队列摘要和下一来源。计划摘要绑定完整有序清单、全部当前字节SHA（含dirty/untracked）、HEAD、固定方法版本、定位元数据、分页大小和当前读取器字节；后续调用若输入/岗位/版本漂移则拒绝，必须从头另起版本。延续参数只防误拼和意外跳页，是调用者可以重建的**不可信一致性参数**，不是签名、会话、先前实际调用或送达证明。访问拒绝、来源缺失、符号链接和固定方法不符立即blocked；不搜索、联网、扩权或换路径绕过。

只有逐件全部正文确实进入本执行上下文后才开展专业判断。终页仅表示请求位置到队尾，`all_required_bodies_received=unverified`、`prior_delivery_authenticated=false`，不认证收到全文、理解、应用或自然加载通过；实际调用输出中的完整连续覆盖须另经独立QA核对。未收到必读正文时保留未接通和缺件，不能以checker exit 0、仅方法十件、哈希或末页代替。回执记录来源版本/范围、各组读回要点、适用条目及具体业务产物位置，正文应用质量交独立QA。

`--list`、单源 `--source` 和 `check_startup.py` 保留兼容：前两者用于查来源/补读，检查器用于机械取得与版本检查，均不能替代正常完整队列。若方法源受阻仍需先读治理，可使用下面独立AGENTS入口；它不要求方法或角色，但不代表整套必读完成。**私有方法正文、可重组页缓存和原始工具日志不可另存**，包括临时目录；只在当前获准上下文逐页消费。工具本身零写入，也不接启动/结束事件。

## 独立治理补读与旧接口（保留兼容）

在 RoleCraft 工程根运行以下第一步；它不依赖岗位选择、方法源可用或全量启动检查：

```bash
python3 -B sites/rolecraft/team/onboarding/startup/read_source.py --source project:AGENTS.md --page 1
```

每次调用只输出一页 JSON。先实际消费本页 `content`，再把 `next_command` 作为下一次独立调用执行，直到最后一页 `next_command=null`。不要把所有页合并为一次大工具输出；行数不足以约束超长行，不能只用 `sed` 的行段数推断正文完整。页1之后必须携带工具给出的全文 SHA、项目 HEAD、上页结束字节及上页 SHA；缺项、页号越界、正文/HEAD漂移或不连续参数均拒绝。版本变更后从页1重新读取并另留版本，不拼接新旧正文。

以下旧接口仅作机械检查或查单源ID，正常项目开工继续使用上方完整必读流程。产品岗仅演示参数：

```bash
python3 -B sites/rolecraft/team/onboarding/startup/read_source.py --list --roles product-manager
python3 -B sites/rolecraft/team/onboarding/startup/check_startup.py --roles product-manager
```

`--list` 只给受控 `source_id`；不证明文件可读。单源补读仍不能删减完整必读队列中的共同项目资料；选中岗位原包或实际专项资料以及十件固定方法均须完整交付。每个来源从页1开始，重复使用该来源返回的下一页命令；方法正文的首个命令如下，无需协调者再给本地路径：

```bash
python3 -B sites/rolecraft/team/onboarding/startup/read_source.py --source method:README.md --page 1
```

仅单源补读时，十件固定方法 `source_id` 分别为 `method:` 加 `README.md`、`SOURCE-MANIFEST.md`、`CHANGELOG.md`、`roles.md`、`methods.md`、`adoption-and-change.md`、`checklists/startup-receipt.md`、`checklists/task-and-evidence.md`、`examples/website-adapter.example.md`、`examples/learning-product-adapter.example.md`。未应用示例仍标其原身份，不充作真实业务记录。岗位文件的读取命令须加同一显式 `--roles`，例如 `--source project:sites/rolecraft/team/employees/core/product-manager/ROLE.md --roles product-manager --page 1`；没有选中角色时不能读取其包，不能用任意路径替代来源清单。

`read_source.py` 默认正文每页最多2,048个UTF-8字节，同时限制JSON转义后的正文大小；允许 `--page-bytes` 256–4096，完整序列化页（含元数据）最多8,192字节，超限显式拒绝而不截断。分片按Unicode字符边界，超长单行仍完整覆盖。页中给出 source_id、总页/序号、整文件及本页SHA、字节/字符半开范围、起止行、上页绑定和下一页参数。范围与哈希可以供独立QA核连续覆盖，工具不认证之前的页真正交付或代理已理解。

私有方法正文只允许进入当前获准工具输出和执行上下文。**不要重定向stdout、保存页缓存、把可重组全文或逐页正文写入项目、业务产物或审计文件。** 回执仅保留来源版本、哈希、页/字节范围、必要摘要、适用条目与实际应用位置；合成测试夹具只用合成文本。真实执行者仍需给出读回和实际产物应用证据，独立QA另核其质量。

角色集合必须由任务明确选择，不默认要求十五/十六岗。上例只是参数格式。实际角色从原 core/v12 manifest 解析；core 包逐项读 ROLE、MEMORY、SCHEMA。缺 core 包时仅将确实存在的 v12 prompt/onboarding 单列为替代来源，三个原件仍标 missing；真实专项资料已读可报 `role_material_readable=true`，原长期记忆缺失单独报告，不因此把可读资料判不可读。内容检索岗只在显式选择 `content-retrieval-engineer` 时读原 `SPECIALISTS.md` 与 `app-v14-dialog-retrieval.md` 两件历史专项材料，不冒充 ROLE/MEMORY，不造档。

`--roles` 仅选择本任务需读的来源岗位，不给原项目员工派管理指令。当前没有可核的员工归属证据，所选来源均记 `source_team=original_project_team`、`ownership=unknown`、`use=authorized_collaboration_reference_only`、`management_actions=none`；`verified_user_owned_employees=[]`。证据 JSON 自述不能认证归属。仅管理有明确归属证据的自身员工，不干涉其他团队员工；unknown 不写入或变更其身份、职责、记忆、等级、管理规则。十六视角是共享方法支持池，不是员工身份。对本任务执行者的诚实报告要求不等于接管来源团队。

`readability` 只汇总四类事实：任务所选岗位资料是否可读、各岗原长期记忆是否存在且可读、固定共享方法是否可读、最新项目记录是否可读。缺原记忆与资料不可读取分别记录；只有真实岗位材料也不可读取才形成该岗位的机械缺项。四类字节事实不认证理解、应用或完整团队接通。

默认 stdout JSON 仅报告每份文件全文读取字节数、SHA256、行数、提交/工作树版本和覆盖状态。`checker_content_read` 是检查器本身读完，不是专业代理已收到正文。兼容旧 `--include-content` 参数时，检查器会将全部所选正文放入stdout；外部工具可能截断这份大输出，不能据检查器未截断或exit 0断言代理收到全文。常规读取使用上述单页工具，旧参数不再作为推荐传输方式；不要把私有正文重定向、缓存或写入审计。

## 固定来源与最新记录

`sources.json` 保留受控相对清单，包含五份接入文档、AGENTS、原目录入口、共享偏好、两份已提交 `team-method-loop` 归档、两份 `task-closeout` 记录，以及[首轮无提示验证README](../../validation/natural-read-20261017T1557Z/README.md)和[首轮回执](../../validation/natural-read-20261017T1557Z/validation-receipt.json)。另含[上轮读取修复后的验证README](../../validation/natural-read-repair-20261018T0110Z/README.md)和[上轮最终回执](../../validation/natural-read-repair-20261018T0110Z/validation-receipt.json)。两轮FAIL/partial与文稿返修各保留其原范围，新增流程不逆改旧结论。每份分别绑定 HEAD blob、dirty 工作树 SHA 或 untracked 工作树 SHA；HEAD 不能替代当前正文版本。只列举 `team/` 直接子级的 `task-closeout-*.md/.json` 文件名，发现清单未覆盖记录就报告 `uncovered_project_records`，不冒称清单永久代表最新。

[local-method-source.json](./local-method-source.json)只记录本轮获准的一个本地方法根、固定origin/revision和只读边界；不是凭据、通用发布配置或他人/跨设备访问证明。未提供旧 `--method-root` 参数时只读取该定位文件，不搜索磁盘、不使用环境变量寻找副本、不联网、不fetch，不尝试其他路径；定位不存在、访问拒绝或固定绑定不符即blocked。保留显式 `--method-root` 兼容入口，使用者另负该路径的有效授权；不自动扩权或修改网络/SSH配置。

共享方法只读该指定本地库，要求固定 origin 和 `615ec68815bdd58539bfc6e95d03604d9ca3eb91` HEAD、完整十文件树、普通 Git blob 及全部工作树正文与对应 blob 字节一致。实际全文读取十件，包括 README、SOURCE-MANIFEST、方法与两个未应用示例；不读 proposals 充作正式方法。错误版本、缺件、脏正文、软链接不默认通过；不联网 fetch。

相对链接仅核受控树内目标存在性；片段语义仍未核。外部 URL 不抓取，旧个人绝对链接不跟随，不把文件存在称为内容理解。源文件读取使用逐级 O_NOFOLLOW 的目录描述符并核读前后绑定，拒绝路径穿越及软链接。

## 可选证据 JSON

用 `--evidence LOCAL_JSON` 显式读取一份本机结构化输入，不自动打开它引用的会话或工具日志。schema 为：

```json
{
  "schema_version": 1,
  "task_id": "当前任务",
  "role_scope": [{"role_id": "project-manager", "applicability": "required", "reason": "当前任务职责"}],
  "source_reads": [{"source_id": "project:相对来源.md", "kind": "self_report", "trace_ref": null,
    "sha256": "当前正文SHA256", "start_line": 1, "end_line": 1, "quote": "该完整行原文",
    "summary": "实际读回要点", "application": "具体用途"}],
  "applications": [{"source_id": "project:相对来源.md", "status": "planned"}]
}
```

`source_id` 是 `project:` 或 `method:` 加对应库相对路径。行范围从 1 开始，quote 必须等于范围内全部行以换行符连接的内容；同时核正文 SHA。只有哈希、链接或自述不能得到内容绑定。`external_trace` 普通字符串仍只是未认证外部引用，不认证平台调用来源。工具不输出已理解或已接通 PASS。

证据中 required 角色遗漏在 CLI 集合外，或选中角色被标为 N/A，会报告 `scope_conflict`；没有适用性证据仍未核，不能借机械状态跳过。`applications.status=planned` 是计划，不要求尚不存在的产物；实际引用另给 `artifact_path`、`artifact_sha256`、行范围和 quote，只读 `sites/rolecraft/` 下显式相对文本产物，拒绝其他项目、隐藏配置、凭据路径和数据库。实际引用最多得到 `artifact_locator_bound_unreviewed`，不证明专业应用质量或理解。

`startup_connection=not_connected` 表示本检查器没有认证接通。机械读取完整、证据引用绑定、实际专业理解与应用分别审查。退出码 0 仅表示本次没有机械缺项，绝不表示团队接通；缺项退出 2。自然加载历史 FAIL/partial 不因运行本工具而改写。

## 验证及既有案例

在本目录合成自检：`python3 -B -m unittest test_check_startup test_read_source -v`。测试仅在系统临时目录的独立fixture中写合成文件（macOS临时路径别名只在fixture基目录解析），注入版本/blob提供器并清理；不初始化或克隆工程、不触碰旧审计fixture和真实案例。检查器运行本身零写入，不创建 pyc（按上述 `-B` 命令）。真实本机运行只核机制，不能冒充又一个无提示业务任务。

本轮组织入口的获准更新会使旧 closeout 案例的冻结保护哈希正常失配；旧案例是当时快照，不再可直接重跑。不得为适应启动检查器而重绑旧 request/journal、修改旧工具或归档；本工具也不接结束事件。
