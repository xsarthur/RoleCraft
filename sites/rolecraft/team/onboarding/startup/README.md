# 任务开始：只读正文与版本检查

本工具只帮助取得本任务所需输入并核对引用，不认证专业理解、真实专业调用、应用质量或完整团队接通。没有启动事件、后台监听、安装器、网络请求、Git 写入、锁或回执保存。不会修改原 ROLE/MEMORY/SCHEMA、等级、closeout 旧案例或方法候选。

在本目录运行：

```bash
python3 -B check_startup.py --roles project-manager,backend-data-engineer,qa-engineer --method-root METHOD_LOCAL_ROOT
```

角色集合必须由任务明确选择，不默认要求十五/十六岗。上例只是参数格式。实际角色从原 core/v12 manifest 解析；core 包逐项读 ROLE、MEMORY、SCHEMA。缺 core 包时仅将确实存在的 v12 prompt/onboarding 单列为替代来源，三个原件仍标 missing；真实专项资料已读可报 `role_material_readable=true`，原长期记忆缺失单独报告，不因此把可读资料判不可读。内容检索岗只在显式选择 `content-retrieval-engineer` 时读原 `SPECIALISTS.md` 与 `app-v14-dialog-retrieval.md` 两件历史专项材料，不冒充 ROLE/MEMORY，不造档。

`--roles` 仅选择本任务需读的来源岗位，不给原项目员工派管理指令。当前没有可核的员工归属证据，所选来源均记 `source_team=original_project_team`、`ownership=unknown`、`use=authorized_collaboration_reference_only`、`management_actions=none`；`verified_user_owned_employees=[]`。证据 JSON 自述不能认证归属。仅管理有明确归属证据的自身员工，不干涉其他团队员工；unknown 不写入或变更其身份、职责、记忆、等级、管理规则。十六视角是共享方法支持池，不是员工身份。对本任务执行者的诚实报告要求不等于接管来源团队。

`readability` 只汇总四类事实：任务所选岗位资料是否可读、各岗原长期记忆是否存在且可读、固定共享方法是否可读、最新项目记录是否可读。缺原记忆与资料不可读取分别记录；只有真实岗位材料也不可读取才形成该岗位的机械缺项。四类字节事实不认证理解、应用或完整团队接通。

默认 stdout JSON 仅报告每份文件全文读取字节数、SHA256、行数、提交/工作树版本和覆盖状态。`checker_content_read` 是检查器本身读完，不是专业代理已收到正文。需要将原文交给接单代理时显式加 `--include-content`：全部所选项目资料、角色原文及固定方法正文完整进入 stdout，不静默截断。固定方法可能为私有内容，请只在获准上下文消费 stdout，不将正文重定向到共享项目文件或审计报告。仍须由真实执行者给出实际读回、应用点和独立复核。

## 固定来源与最新记录

`sources.json` 保留受控相对清单，包含五份接入文档、AGENTS、原目录入口、共享偏好、两份已提交 `team-method-loop` 归档及两个本地 `task-closeout` 记录。每份分别绑定 HEAD blob、dirty 工作树 SHA 或 untracked 工作树 SHA；HEAD 不能替代当前正文版本。只列举 `team/` 直接子级的 `task-closeout-*.md/.json` 文件名，发现清单未覆盖记录就报告 `uncovered_project_records`，不冒称清单永久代表最新。

共享方法只读指定本地库，要求固定 origin 和 `a848db9f9ab6605aa7379dddef3faa918e412f96` HEAD、完整十文件树、普通 Git blob 及全部工作树正文与对应 blob 字节一致。实际全文读取十件，包括 README、SOURCE-MANIFEST、方法与两个未应用示例；不读 proposals 充作正式方法。错误版本、缺件、脏正文、软链接不默认通过；不联网 fetch。

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

合成自检：`python3 -B test_check_startup.py`。测试只在已获准的本机审计 fixtures 内建文件、注入版本/blob 提供器，不初始化或克隆工程、不触碰真实案例。检查器运行本身零写入，不创建 pyc（按上述 `-B` 命令）。真实本机运行只核机制，不能冒充又一个无提示业务任务。

本轮组织入口的获准更新会使旧 closeout 案例的冻结保护哈希正常失配；旧案例是当时快照，不再可直接重跑。不得为适应启动检查器而重绑旧 request/journal、修改旧工具或归档；本工具也不接结束事件。
