# 显式两层收尾：单案例工具

范围固定为 2026-10-17 本轮案例。仅 Python 标准库；不安装依赖，不接模型、网络、Git 写入或后台事件。事件名为 `closeout.requested`，由明确命令发起。当前自然结束事件未接通；`Stop`、`SessionEnd` 或一轮完成不能由本工具冒充业务验收。

## 固定输入及输出

从 RoleCraft 内此脚本位置推导工程根。私有审计目录是本工作区 `review/closeout-stage3-20261017/`；方法库是相邻工作区已有的 `ai-team-handbook-loop-review`，不创建替代仓库。请求只接受该审计目录的 `request.json`，实际绝对路径仅保留在本机请求中；CLI 不提供任意根、输出、force 或配置接口。

新增共享输出只有：

- `team/task-closeout-20261017.md`：本轮项目记录。
- `team/task-closeout-20261017.json`：项目层发布时的不可变快照。
- 方法库 `proposals/entry-status-and-evidence-links-v01.md`：匿名 DRAFT，未正式采纳、不推送。

项目 JSON 的 `scope=before_method_attempt`、`method_at_publication=not_attempted` 描述发布当时，不是总体最终状态。最终状态须由工具核两层实际字节与本机 journal；不覆盖共享快照以追写结果。

## 命令与证据

使用 `python3 -B closeout.py MODE --request ABSOLUTE_REQUEST --expect-request-sha256 SHA256`。`MODE` 为 `plan`、`apply`、`resume` 或 `cancel`。`plan` 完全只读，不创建锁、目录或回执。先核 dry-run，再执行已授权保存。未完成运行只能由明确的 `resume` 继续，不自动重试。

请求 schema v1 包含 `case_id`、`event`、准确双库 `roots`、两库 HEAD/index/origin、固定保护文件清单（项目九项、方法一项）的 SHA、`evidence.source_versions`、逐项 `reading_checklist`，以及 `payloads.project_md/project_record/method_md`。来源版本、读取位置、应用点、局限、实际原调用证据分别记录。普通 `trace_ref` 字符串不能认证调用或理解。嵌套结构也不能预签自然加载 PASS、理解通过、正式采纳或成长。

`source_versions` 仅随请求及幂等键记录，不表示每项已被物理验证；实际机械验证覆盖 baseline 的 HEAD/index/origin 与项目九项、方法一项保护文件清单。第二阶段事实来源仍是父观察，本工具不认证每条 trace 或模型理解。

本轮自然加载结果必须保持 `FAIL/partial`。父观察但本机无原调用 trace 的事实使用 `parent_observation/local_trace_not_available`，缺读、后补和未验证分别记录。工具只核清单结构、版本及内容绑定，`reading_gate=insufficient`；保存成功不变成方法理解通过、专业成长、稳定性或产品验收。

## 保存与恢复边界

共同锁仅为项目 `team/.closeout.lock`，排他创建；不会移除其他进程的锁。持锁后、每层前及结束时重核两库 HEAD/index、原三项入口修改、AGENTS、两归档及原方法候选。新目标预期不存在。路径穿越及现存祖先软链接拒绝。

先持久化并读回 `preflight-backup.json`，记录原目标确实不存在、保护版本和预期输出哈希；原文件不改，因此不复制原文。三个新输出使用固定 `.tmp`、fsync、读回，再以排他 hard-link 发布，目标已存在即失败，绝不以 rename/replace 覆盖。逐级 O_NOFOLLOW 打开目录，持父目录描述符执行 open/link/stat/unlink，发布前后核父目录 inode 仍绑定批准树。若父目录瞬时被移走，只撤回本次 inode 且字节仍匹配的 link/tmp；并发修改过的内容保留现场，须人工核查。已确认发布文件消失立即停止，终检要求全部存在且哈希正确。单文件发布的完整字节不等于跨库原子事务。

`run-journal.json` 内容是 **JSON Lines** 追加日志（扩展名保留既定白名单），每行绑定请求 SHA 和幂等键；追加不覆盖已有字节。新建使用排他创建。恢复先核日志和现场字节，截断/损坏或漂移即停，不能自动修复；已发布但未记日志的文件可凭预期哈希识别。`complete` 重复调用只读回，不重写日志或输出。任意不配合进程仍可能制造版本校验后的竞态；工具不承诺对外部进程的全局事务隔离。

第二层文件系统失败返回 `project_saved_method_pending` 并保留实际目标哈希和错误码；不删除已保存的项目记录，也不换目标。SIGINT 在下一个安全检查点停止；`cancel` 在取得锁后记录取消，不能抢占另一活跃 writer。取消保留已完成层，明确 `resume` 可继续。若进程崩溃遗留锁或临时文件，先人工核身份和实际字节，不自动删除。权限审批由运行平台执行，本工具不扩权；拒绝后停止，不自动重试。

私有审计白名单仅 `request.json`、`preflight-backup.json`、`run-journal.json`、`synthetic-results.json`、`qa-receipt.json` 与 `fixtures/`。备份允许固定 `.tmp`；journal 只追加、不用临时替换。真实工具不会创建审计根。

## 合成检查

从本目录运行 `python3 -B test_closeout.py`。测试仅在已获准审计 `fixtures/` 下创建隔离目录，注入版本提供器和故障，不初始化/克隆 Git、不改变权限、不触碰真实输出。覆盖零写入 plan、锁、幂等、版本漂移、目标并发、软链接、备份、第二层失败、取消和恢复。合成故障不代表真实事故；作者自检须再由独立 QA 复核，真实保存另行核验。
