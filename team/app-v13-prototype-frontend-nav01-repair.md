# QI13-NAV01 · 题目回溯筛选返修

日期：2026-10-12（Asia/Shanghai）。岗位：客户端软件工程师。状态：原例及直接路径开发复验通过，待主QA/UI独立原例复验。产品/设计/课程/教材/检索/服务/数据库均未改；仅 `dist/learning-experience-v13.js` 改动。

收到独立主 QA 原例：从 `#questions/Q11?unit=n03-planning-reflection&kp=n03-planning-reflection%3As-da63f3dcff17` 打开参考原文，原链接只有 `?from=Q11`；正文回题丢失原 unit/kp，返回题库筛选无法保持。首候选源、报告、绑定及开发检查文件的10项完整快照保存于 `team/app-v13-prototype-frontend-history/before-QI13-NAV01/`，不改旧专业报告。

修复将题目参考阅读/关联知识跳转统一交给 `questionReadingHref`，传递真实题 ID 和已核合法的 unit/kp/state/set。正文回题由这些受限值重建内部 `#questions` 路由；未知 unit/kp、不同所属 unit/kp、未知状态/题组及任意外部 return 值不提升为返回目标。旧无筛选 `?from=Q11` 仍返回原 Q11；正文及版本身份没有改变。

第一次窄开发检查在“回题→返回筛选列表”的直接路径发现 `DEV13-BANK-01`：`question(undefined)` 的兼容字段 `q.questionId===undefined` 意外命中 Q1，导致无题 ID 的题库入口/筛选列表误显示 Q1 详情。已加非空字符串题 ID 守卫，这是原返回路径所必需。失败观察与守卫前窄修源保留在 `frontend-history/nav01-first-narrow-check-failure.json` 与 `nav01-filter-repair-before-bank-guard.js`，不是 QA 脚本错误，也不由开发自查关闭独立缺陷。

Node24实际执行新 `app-v13-prototype-frontend-nav01-check.mjs/.json`，四组有限隔离VM复验通过：原 Q11 的证据→原题→原筛选列表；知识点跳转与合法 state/set；无筛选题库114完整列表/原 Q11 返回兼容；非法参数和外部返回值拒绝。仅 Node 语法和窄路径开发验证，不重跑前轮11组、旧教材例或旧应用全量；未做真实浏览器操作、模型或HTTP测试。

修后原链为：

- 原题：`#questions/Q11?unit=n03-planning-reflection&kp=n03-planning-reflection%3As-da63f3dcff17`
- 原文：`#learn/agent/n03-planning-reflection/s-da63f3dcff17?from=Q11&fromUnit=n03-planning-reflection&fromKp=n03-planning-reflection%3As-da63f3dcff17`
- 回题：保持原题完整路由；返回题库：`#questions?unit=n03-planning-reflection&kp=n03-planning-reflection%3As-da63f3dcff17`

新源 SHA256：`7fc778e5d85702688caebf76370308ddee435b74acee7665666387a4dc902b9e`。当前候选教学包、corpus/原文和其他客户端源保持收到状态。主 QA 复验同一原输入与114列表直接路径，UI岗用其自有4474执行真实题→原文→题→筛选、刷新/后退；本岗不操作用户4318服务或实际存储。独立验收与完整目标仍待各自证据，完整培养/行业先进仍未达标。
