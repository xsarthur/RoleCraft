# 当前候选2 · 独立后台本地预览

内容检索工程师；2026-10-12（Asia/Shanghai）。本岗仅核正式服务和公开运输，不改应用/服务代码、不执行语义或页面独立验收。

收到时实际lsof无4318监听，公开ps核旧PID50494不存在，同相对正式入口pgrep无进程；绕代理的Node原生HTTP直连返回ECONNREFUSED。没有向旧PID或未知进程发送信号，旧服务消失原因未查证。

按PM授权，用自有 `/private/tmp/rolecraft-prerequisite-preview.C8THrw/launch.py` 启动普通后台Node24.16.0。Python采用 `subprocess.Popen(start_new_session=True, close_fds=True)`，输入为/dev/null，stdout/stderr写自有同目录server.log。明确设置端口4318和原.runtime位置，既有环境正常继承且不检查或输出私有值；没有安装launchctl、开机自启或新守护服务。

启动父进程59517实际退出0并经ps核已不存在；服务PID **59518**、实际PPID **1**、PGID **59518**、无终端，lsof核stdin/devnull和两个日志输出，公开argv/cwd确认当前项目。当前入口 `http://127.0.0.1:4318/#home`，同workspace/原 `sites/rolecraft/.runtime`，已实际监听并保留。

公开health HTTP200。当前前端candidate2六资源实际HTTP200且逐项等于 `app-v14-prerequisite-copy-frontend-binding2.json`：index.html、app.js、learning-workbench.js、learning-experience-v13.js/.css、learning-v13-data.js；变动2JS分别9a30a208…/903e6092…，CSS cdd01499…。服务三源保持已冻检索c3 db17b415…/c87dfde6…/f8c24960…；未重跑未受影响语义测试。

完整启动/进程/health/六hash记录为 `app-v14-prerequisite-copy-preview.json`。没有读取用户记录、将实际DB用于测试、迁移或删除；沿既有正常应用启动读取runtime，未收费模型调用或上传发布。本记录只证明启动父进程退出后仍可达，**本员工会话结束后的存活复查尚待另一工程岗实际执行**；不能提前声称其通过。

## 给另一工程岗的后续公开复查

等本检索员工final之后，再实际执行一次lsof4318/公开ps59518、GET /api/health和同六公开静态资源，记录当时PID/时间/状态及与candidate2的hash比较。只看公开服务与进程元数据，不读环境或DB，不重跑语义。建议新证据保存 `app-v14-prerequisite-copy-preview-post-session.json`，不改本收到/启动历史；若已不可达或未知PID占用如实报告，不据旧PID停止未知进程。PM负责安排并合并该待验证状态。

需要以后停止本预览时，先重新核监听PID和当前项目公开argv/cwd归属，再对确认的Node PID发送SIGINT；沿既有Node信号处理正常停止，不发送SIGKILL。当前服务保持供用户阅读。
