# v14 第二次正式4318更新

内容检索工程师；2026-10-12（Asia/Shanghai）。DG14-05候选3真实HTTP/两按钮UI窄复验由QA通知通过后，按PM既有授权执行正常更新。源代码停写。

当前入口 `http://127.0.0.1:4318/#home`，新PID **47895**、PTY **10912**、Node24.16.0，沿原 `sites/rolecraft/.runtime` 保留服务供阅读。

更新前重新lsof/公开ps/cwd核PID45903为本项目4318服务，再向原PTY66851发送Ctrl-C，实际进程退出码 **0**，随后4318无监听；再启动候选3。首次preview1中原PID23034退出码不可取/null保持原记录，本次观测到PID45903退出0不改写前次结论。

当前有限公开操作核验均HTTP200：health仍声明既有账户服务local-mvp-0.4/v12-30/Node24；裸React返回needs_clarification及ReAct/前端React两完整选择；实际完整ReAct查询answered，前端React实现related_uncovered且无ReAct强推；原recommend仍recommended。本地BGE、providerCalled=false，无付费/外部模型调用。

服务三源实际hash与candidate3相符，dialog SHA256 `db17b415b6d53c82ce933c064dc21c6d0ea00d2567e63b8fb0c20653f6dee4f1`。四公开静态资源实取hash与当时工作区相符，其中learning-workbench.js为 `9099d3bbf6ea51816c01f422517ae5323fb0c1048854f4acc54caa88bff65cca`；静态运输只说明当前接收到的资源，不替代最后前端缓存UI独立复验。详情/缓存绑定由客户端和QA各自维护，DG14-06不能由服务更新关闭。

完整操作请求/公开原文响应/运输与源hash见 `app-v14-dialog-preview2.json`，preview1保留。未访问账户/任务接口、读取用户记录用于测试、迁移或删除实际DB；按既有服务正常启停沿用原runtime。未上传发布。本次不是前292项独立全量重跑、全旧产品或正式生产通过；完整培养/行业先进仍由原产品门槛另判。

最后前端binding4冻结后另做公开静态运输核验，六个dist入口/脚本/样式全部HTTP200且逐项hash等于binding4；当前服务三源等于检索candidate3绑定。收据为 `app-v14-dialog-preview-final-resources.json`，allMatch=true。该收据保留实际01:39:53Z时点，缓存真实UI最终判断仍由QA负责，无需为静态文件再次重启。
