# v14 本地4318服务更新记录

内容检索工程师；2026-10-12（Asia/Shanghai）。按PM在独立candidate2核心复验通过后授权执行本地更新。源代码保持冻结；本记录属于操作运输自查，不能替代独立QA、生产验收或完整培养目标。

当前供用户阅读的入口：`http://127.0.0.1:4318/#home`。新服务PID **45903**、PTY **66851**、PPID73824、Node24.16.0，工作目录为当前项目，正常启动日志确认沿用 `sites/rolecraft/.runtime`。

更新前重新实际核验：4318仅PID23034监听；公开argv为本项目 `sites/rolecraft/server/index.mjs`、Node24.16.0；cwd为本工作区。原PTY13862已不可用（工具返回Unknown process id），因此只向重新确认归属的PID23034发送SIGINT。信号命令退出0，随后lsof无4318监听、ps无旧PID，再启动新服务。旧进程真实退出码无法从已失效PTY取得，JSON中保留null；没有冒称取得旧进程退出0，也没有使用强制SIGKILL。

新服务启动后实际公开检查：

| 检查 | 结果 |
| --- | --- |
| GET /api/health | HTTP200；已有账户服务PRODUCT_VERSION仍local-mvp-0.4；v12/30、检索0.12、Node24/模型资源可用 |
| POST /api/content/dialog，ReAct是什么 | HTTP200；content-dialog-0.14-extractive；answered；真实本地BGE语义模式；引用n03对应小节；providerCalled=false |
| POST /api/content/recommend，react | HTTP200；原recommended合同，原文词项与语义通路保持；providerCalled=false |
| index.html、learning-workbench.js、learning-experience-v13.js/.css | 全HTTP200；四资源运输SHA256与本次实际工作区相符 |
| 服务三源文件 | 与candidate2冻结绑定相符：dialog f3acbc01…、retrieval/index c87dfde6…、server/index f8c24960… |

完整请求、响应（公开教材内容）、资源hash、源hash、旧停止限制与新PID/PTY均保存在 `app-v14-dialog-preview.json`。未访问账户/任务端点，未将实际数据库用作测试、读取个人记录、迁移或删除；应用按原正常启停机制沿用原.runtime。只运行本地BGE，无付费或外部模型请求、上传发布。

独立核心证据由QA维护：PM通知实际44请求/292机械核、8原语义反例及ReAct追问真实UI闭合，详情footer窄修另属客户端/UI复验。此操作记录仅验证当前公开运输及两个有限问题，没有授全量旧功能、任意中文语义、职业能力、真人专业认可或生产通过。服务已保留供用户使用，后续修改须按新版本独立验证。
