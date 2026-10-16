# 21 把设计交付变成接收方可以验证的合同

正式先修：11、12、15、17、19。层级：L2—L3。工件：T-1042交接包、事件/字段合同、接收与差异记录。

## 图片只能传外观，合同才能传后果

工程独立复述后仍能说清“何时可提交、什么算成功、错误后做什么”，才说明设计意图被传递。交稿不等于签收，签收不等于实现，实现不等于独立验收。设计师必须提供关键对象、状态、来源、事件和可观察验收；工程师对真实接口及运行负责，产品对范围负责，QA对独立结果负责。

本章包是合成设计交接，不是生产接口。原型热区只能证明跳转意图，无法证明R-81已经受理、权限有效或语义支持被核验。

## 交接包的具体内容

| 包项 | 本例版本与关键内容 | 接收人要能回答 |
| --- | --- | --- |
| 任务范围 | handoff-T1042@2：查证→草稿→审批→发送→核对 | 哪些步骤属于本次，哪些只是示意 |
| 页面与组件 | 02草稿图、03退款图、04响应式、05焦点、07异常 | 原文、状态和主动作是否一致 |
| 数据身份 | tenant/object/inputRevision/requestId | 迟到响应应该写到哪个任务 |
| 内容合同 | P-07@v3与claim-support表 | 引用可打开是否意味着支持 |
| 批准合同 | R-81@v4、O-7819、26800分、CNY、原因、政策 | 改币种为什么不能沿用批准 |
| 结果合同 | received/pending/succeeded/unknown/confirmed_no_effect | 哪种证据可出现成功提示 |
| 访问与焦点 | 只读/失权、弹层入口和返回目标 | 不能操作时如何解释、如何离开 |
| 未实现能力 | 操作查询若缺失则freeze_and_escalate | 是否需要诚实降级而非假实时 |

具体素材链接：[草稿证据](../assets/02-ticket-ai-evidence.svg)、[退款状态](../assets/03-refund-state-board.svg)、[重排](../assets/04-responsive-390-320.svg)、[组件焦点](../assets/05-components-tokens-focus.svg)。这些是当前静态教学稿；实现应逐项消费，不得只按截图抄外观。

## 事件与字段：不要用一个loading隐藏所有控制

```text
GenerateDraft:
  input {tenantId, ticketId, inputRevision, requestId}
  output {same binding, draftVersion, sourceIdentity[], claimSupport[]}
ApproveRefund:
  input {tenantId, actionId=R-81, expectedVersion=4, approvalFingerprint}
  rejects {permission_changed, version_conflict, support_missing}
SubmitRefund:
  input {same actionId, same approvedVersion, currentAuthority}
  output {attemptId, effect=accepted|pending|succeeded|unknown|confirmed_no_effect|failed}
QueryRefund:
  input {same actionId, authorizedScope}
  output {effect, matchesIntent, receiptRef, checkedAt, authority}
```

字段是教学协议草案，工程需要给出正式序列化、错误码及保证。若只得到HTTP200且没有effect，客户端不能自行推断退款完成。version_conflict应带允许查看的差异或刷新入口；permission_changed不泄露无权数据。QueryRefund返回not_found若没有覆盖所有尝试的保证，仍映射unknown；缺少查询API就不显示可点击“实时查询成功”的假动作。

前端本地状态还要区分dirty、saving、saved和save_failed；点击“保存”不能立即显示已保存。切租户时旧gen返回只能影响原绑定。重复点击提交应由UI阻断并由服务保障原动作身份，不能只加节流函数声称不会重复。

## 交给工程的可观察状态要求

T-1042详情主标题后依次呈现租户、客户、订单；客户原文与内部备注分别命名。Draft-17注明候选/编辑者/版本，逐句未支持项关联原文；主动作不应暗示已发送。R-81确认弹层完整展示金额币种和版本，首次焦点指向安全返回或标题，错误后焦点定位错误摘要且可回到具体字段，关闭后回原申请触发项。

APG对模态焦点、Tab和关闭回焦给出模式指导，但实际语义和目标辅助技术仍需工程验证。[APG Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)（查阅2026-10-14）。异步短通知要可被程序识别，不将整段生成内容每token播报；依据[WCAG状态消息解释](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)，结果全文与简短状态通知用途不同。设计交接应标明通知文本和触发时机，而不宣称加一个属性即达标。

## 可执行验收样例：交接的核心

| ID | 给定→动作 | 预期结果与需要的证据 |
| --- | --- | --- |
| H01 | t-lotus gen-17-1未返回→切t-maple→旧结果到 | 新租户无旧内容；原任务可追踪；日志绑定一致 |
| H02 | R-81@v4批准268 CNY→改成268 USD→提交 | 拒旧批准，指出币种差异；无发送尝试 |
| H03 | 已发送→超时→停止等待→查到匹配成功 | 停止等待保留unknown；成功回执后更新，未新增退款 |
| H04 | 旧政策支持被v4改变→客服已有手改 | 标过期与差异；手改保留；未默默重新生成 |
| H05 | 审批弹层报错→Esc关闭 | 回原工单触发项；若它不再存在则到可解释替代位置 |
| H06 | 十项批次中权限/冲突/未知并存 | 逐项结果与总分母10一致，只有合法集合可重试 |

这些是应运行场景，不是已执行测试。接收方可以要求模拟后端或隔离夹具，不能用真实客户退款测试。

## 失败修复与责任分离

构造差异记录DQ-03：工程把unknown映射为error并显示“再次退款”。设计师据H03指出后果，产品确认不能降低结果核对门槛，工程提供降级方案“只保存核对任务，不提供再发”。设计师更新交接差异，工程修实现，QA重跑H03与H06。最终签收必须列版本、证据和残留项，不能写“研发已看过”。

轻文档+可操作原型适合紧密小团队，但关键状态仍需留文档；版本化规格+组件合同适合异步多团队，代价是同步维护。两者都必须有人拥有当前唯一合同，不能不同群聊各存一版“成功”。

## 分层练习与参考解法

**基础：** 只有确认弹层截图，补什么？先补批准对象和指纹字段、输入变化规则、提交结果/超时分支，再补焦点与非视觉语义。仅标间距会使工程猜业务含义。把本章H02/H03交给接收方复述，比询问“看懂了吗”更能暴露遗漏。

**迁移：** 后端不能按动作查状态。删除假查询按钮，显示“结果待人工核对”、R-81摘要与H-81升级入口；保留用户停止意图和所有尝试，不退回可重新提交的初始页。要允许后续恢复，工程须提供持久未决记录和核对结果入口。这会增加运营成本，应交产品决定范围，不由设计隐藏。

**综合：** 接收人说“成功就是200”。要求其演练H03：200仅受理的情况下到底显示什么？若缺业务effect字段无法区分，只能降级为已受理/待核对而非已退款；把接口升级列依赖。接收会议应保存双方对正常/异常的复述和未决项。该过程不证明已实现，实际对照还需QA及设计师检查真实候选。
