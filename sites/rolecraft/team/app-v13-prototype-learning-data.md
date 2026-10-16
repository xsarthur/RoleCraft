# 单职业应用教学映射交接

日期：2026-10-12（Asia/Shanghai）。岗位：课程架构师。只整理已冻结教学来源和应用学习对象，不编教材正文、题面、固定答案或评价标准，不改应用代码、旧 QA 矩阵、用户记录。

## 冻结产物与范围

主数据为 `team/app-v13-prototype-learning-data.json`，版本 `app-v13-prototype-learning-data-1`，SHA256 `2c0165b5013a88d5ae93fbe841901853cdf7d3cb184f576971e56ab2f572a394`。本岗来源映射自查为同前缀 `learning-data-source-check.json`；作者转换工具 `learning-data-source-map.py` 不是应用运行模块或独立 QA 测试，不接入网页。

| 对象 | 实际数量与含义 |
| --- | --- |
| 单元 | 30 篇，完全沿用 v12 正式 readingOrder 和 prerequisiteUnitIds |
| 原文索引小节 | 273 个真实 heading：30 根标题、210 二级标题、33 三级标题 |
| 一级学习对象 | 240 个真实根/二级点：30 unit_introduction、172 core、18 exercise、20 navigation |
| 三级归属 | 33 个三级 sectionId 通过父点 childSectionIds 明确归属；精确阅读目标不丢失 |
| 公开题目 | Q1–Q100（fixed100）和 M101–M114（market14），保留原 sourceQuestionId 1–114 |
| 教材证据 | 327 条原 finalEvidence 精确摘录，题面、引用和支持判断来自当前冻结矩阵 |
| 自评适用题 | 112 道；Q10/Q99 需本人真实经历，排除会/不会或答对/答错抽题 |
| 输入绑定 | 37 项：30 篇源、合订本/README/组装清单、课程规格、题目矩阵、同版索引和 JS 内容包 |
| QA 保留变体 | 0 道导入；没有读取或公开保留10变体题面 |

正文为 textbook-v12，corpusHash `1a385b179c0cb8a5b838d17b9d2606a0c1a7e27636d97db45dba5e2a52b2840e`；合订本 SHA256 `25ce2aaa1be0ba0f2814dd1247ac6299d106c3d2e48f43867c49055490c2801e`。旧来源、索引、矩阵和判断没有修改。本轮 112 条“充分”与 2 条“部分”是已经冻结的正文支持判断，不是学员答题成绩。

## 客户端消费合同

顶层字段：`schemaVersion`、`version`、`corpusVersion`、`corpusHash`、`bookSha256`、`sourceBindings`、`metadata`、`role`、`readingOrder`、`routeStages`、`units`、`knowledgePoints`、`questions`、`limitations`。输入绑定以工作区相对 `path` 和项目相对 `sourcePath` 双记，包含 sha256、bytes 和来源性质。应用消费资源的 JS 序列化由客户端工程师负责，本岗不修改 dist/server。

`units` 使用 `unitId`，携带原题名/短标题、顺序、原正式先修、合法章路由、sourcePath/sourceSha256、knowledgePointIds、coreKnowledgePointIds、questionIds。`units.questionIds` 是本篇浏览用的证据关系并集，**不能作为“已学习知识点”的自评池**。

`knowledgePoints.id` 为 `unitId:sectionId`，例如 `n03-planning-reflection:s-da63f3dcff17`。重复小节 ID 在不同篇中仍有不同知识对象身份。对象保持实际 title、sectionId、level、行范围、源 SHA、原文 href、kind、childSectionIds 和 questionIds。客户端可以按该显式表反查三级节的父知识点，不能根据同章、编号前缀、题名相似或最近标题自行猜归属。

| kind | 阅读与记录含义 |
| --- | --- |
| unit_introduction | 本篇章首实际段落，对应真实根 heading/根 sectionId；仅代表章首对象，绝不代表全章已学 |
| core | 真实二级正文知识点，按本人实际访问记录；同章其他点保持原状态 |
| exercise | 真实二级练习/运行作品段落；可作学习分支，引用仍定位真实内容，不改成新知识名称 |
| navigation | v12 衔接/新增训练导航；在完整目录保留，不能作为能力节点或将全章授为已学 |

这 273 个索引 heading 中没有独立 reference 类型标题；正文原来源/参考链接仍由同版内容包保留，不人为造“参考知识点”。所有实际二级标题都保留，不删除练习或导航来凑数量。root/二级/三级精确位置在当前索引及内容包都真实存在；当前索引给出的 href 为 `#learn/agent/<unitId>/<sectionId>`。新客户端必须保持这些合法目标可读，未知/失配目标明确失败，不能静默落到其他知识点。新 reader 的实际导航兼容由工程自查和 QA 操作验证，本岗不以索引存在代替浏览器通过。

正式主干仅由 readingOrder 的30篇决定。routeStages 原样复用已接入 v12 的6组名称和单元成员：起点与问题、程序与模型边界、选型与组件、固定与动态流程、评价与产品决定、交付与迭代。S1–S6 只是本数据的序列化键，连接说明为推荐阅读顺序，不是新先修或认证标准。阶段 provenance 中 receivedSourceSha256 是收到客户端旧源的历史参考绑定，注明不要求变更后的新运行源码维持旧 SHA。既有8实作阶段未重新归并或扩写。

## 题目与精确原文

每题保留稳定 id、sourceQuestionId、question、set/setLabel、capabilities、roleLevel、answerKind、supportStatus、methodSupport、knowledgeRefs、evidence、personalEvidenceRequired、selfTestEligible、excludeFromSelfTest、limitations 和 provenance。

```json
{
  "id": "Q1",
  "sourceQuestionId": 1,
  "set": "fixed100",
  "question": "如何界定 LLM Agent？你会用哪些可观察行为区分它与普通聊天应用？",
  "answerKind": "textbook_evidence",
  "knowledgeRefs": [
    {
      "unitId": "00-learning-route",
      "sectionId": "s-3b82fdeafaab",
      "knowledgePointId": "00-learning-route:s-3b82fdeafaab",
      "sourcePath": "textbooks/v12/00-learning-route.md",
      "sourceSha256": "452129591648ca6c146945fae000e3e905e87c2794315109c727592a7b16dced",
      "sectionTitle": "认识 Agent 工程",
      "href": "#learn/agent/00-learning-route/s-3b82fdeafaab"
    }
  ]
}
```

这只是字段例子，完整 Q1 还包含另一实际选型引用及两条证据，消费时使用 JSON 完整项，不能以例子替换数据。`knowledgeRefs` 以实际 unit/section 去重；`evidence` 不删减原327条。证据含同一精确定位、quote、startLine/endLine、usage、reviewSourceRange。quote 全部逐字来自冻结正文；startLine/endLine 指向引文本身，reviewSourceRange 原样保留旧矩阵的审校行范围和原节名。22 个原审校范围包含后续 heading，摘录本身仍位于原声明实际节；将精确引文范围另列不是改写旧证据。

答案区应表达为“教材参考分析（原文摘录）”。supportStatus 仅继承原 QA 的正文支持判断，不能解释为答案已完备、用户会了或机器通过考试。题目为原重组题与研究改写题，不显示无依据热度、企业真题认证或必考保证；sourceRefs 保留来源性质，没有本轮重新浏览外链或取得企业认证。

Q10/Q99 保留完整真实经历问法、方法摘录和未取得本人履历的限制。它们的 answerKind 为 personal_evidence_required、personalEvidenceRequired 为 true、selfTestEligible 为 false、excludeFromSelfTest 为 true。任何题都没有新增固定 answer 字段，不替学习者作答。

逐知识点“配套题目”和自评抽题严格使用该知识点的 questionIds；访问三级证据只通过本包的显式 knowledgePointId 更新其所属实际点。看某题的参考分析不批量标记其所有引用点，打开本篇也不把所有知识点标为已学。Q1 根知识点只关联 Q1，开篇全章浏览并集为 Q1/Q9/Q20；这个区别可作独立验收反例。自評抽题再核 selfTestEligible、去重和当前来源身份，题量不足使用实际题量，不用同章其他未访问点补足。

## 领域自查与交接限制

本岗完整核 114 题题面/稳定ID/题组、327 逐字摘录及原/精确行范围、引用SHA/真实heading和父归属、30篇 bodyMarkdown 与源字节、正式顺序/先修、273实际小节、同版 JS 包与索引结构一致、37 输入绑定及双向关系。第一次作者转换错误裁剪了一个收到三级标题末尾空格，触发自查断言且未写出数据；随后保持原标题精确值并完成转换，源和索引未改。此为作者转换检查错误，不是应用缺陷；自查记录保留说明。

自查没有执行程序验收、教材例、真实模型、浏览器操作、账户/数据库或用户存储读取，没有重新给原100题教学支持评分或读取保留变体。数据状态为 source_mapping_self_checked_pending_independent_qa；源映射自查不授专业审校、真实学习效果或完整目标通过。

客户端负责真实路线/目录、题↔原文、知识级状态、记录与抽题合同；QA独立核当前数据、来源与实际双向操作。如有数据源/归属缺陷交课程架构师原例修正，路由/状态/展示缺陷交客户端工程师。完整职业培养和从0到1行业先进产品目标仍未达标；真人专业审核、真实学员作品/效果及行业比较另需相应责任岗位取得证据。
