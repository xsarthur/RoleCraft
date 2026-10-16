# I09 · 受控 e03 教学输入独立审校

2026-10-10，内容审校员；AI 辅助技术审校，非真人行业专家。按 `implementation-v04-product.md` 核教学输入、作者来源和审核边界，不执行应用代码或独立软件测试。本次课程包 SHA256：`d2797a1c866879bf43c8bceb8bea5719464096362819e0f2f7278eee33526f71`。

**结论：教学输入一致，存在两处摘录计数元数据错误；完整 teaching_quality 未通过。** 单章 `accepted_as_draft` 是课程结构接收，不代表真人审核、案例执行或整本教材达标；本轮未取得真实模型输出，无法审查生成正文或学习效果。

| 检查 | 实际证据与状态 |
| --- | --- |
| 作者与九节 | 独立读取作者 draft-0.2，文件哈希 `3dec9e59898a0293810ff56825ea8679cbd6471376a23b8f24479d1bf9887edd`；原审校文件哈希 `d5851f8cd828ddba24296fefccdcdae5be43ded32490c0e0accde654d5d1810c`，均等于包内记录。九节 bodyMarkdown 与作者对应正文逐字一致，各 bodySha256 重新计算相符 |
| 原教学规格 | objectives、c02/c03/e02 先修、competencyIds、九项模板及完整原量规与 curriculum-data.json 相等；CR03/CR04 补文被保留，没有把预期改成实测 |
| 三种画像 | beginner/intermediate/advanced 的讲解步幅、提示和迁移深度可调整；先修、目标、模板、量规、来源及审核冻结。零基础诊断不足先补先修，可预览但不授予工程层通过；这仅为输入规则，实际输出遵守情况未观察 |
| 审核边界 | review 分列作者、AI 内容审校、课程初稿接收、真人专家 not_done、新输出 not_reviewed 且 inheritsSourceReview=false；verification 保持 not_run/空运行证据。新模型产物不得继承作者核验、示例运行或能力通过 |

来源：2026-10-10 实际再次访问 [OWASP LLM01:2025](https://genai.owasp.org/llmrisk/llm01-prompt-injection/) 的 Types、Prevention（本次抓取行19—22、34、45—58），支持 claim-injection 和最小权限部分；访问 [OWASP 防注入清单](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html) 的 Structured Prompts、HITL、Agent-Specific Defenses、Least Privilege、Monitoring（419—422、471—473、499—516），支持 claim-boundary、claim-permission、claim-exact-approval、claim-logs。两段短摘与原文相符；五项主张在上述范围有依据，夹具字段、时钟及消费规则仍属教学设计。滚动页无固定修订号；白名单和 claimId 不证明新生成句子语义正确。

缺陷 **CV04-01/P3**：`allowedSources[S1].excerptWords` 声称15，实际按英文空白分词13；S2声称11，实际10。均未超25词，但元数据应准确。已消息项目经理派课程架构师仅修计数并说明规则；本审校员不改课程包，修后限定核原计数、新包哈希及正文保持。首轮错误和哈希保留。

开放项与闭环：原 CR03/CR04 仅文稿修改已独立复核；CR05 仍缺锁定运行时、依赖、模型及工具版本与实际轨迹。工程岗位落实隔离案例后，QA 实际跑正常/越权/注入、前后脱敏、合法审批一次及未确认/过期/改单参数/重用拒绝，保存初次结果、失败与同条件复测；作者依据实际反馈补参考说明，审校员核对新版本。真实生成返回后逐节核来源支持、三画像不跳先修、参考解法与失败分支；真人专家和真实学员作品另收证据，不能用模拟输出关闭这些缺口。

领域自查：实际完成文本溯源、哈希和教学字段一致性核对及官方资料访问，只写本报告；未运行安全案例、模型、学习者评价或真人审核，不改作者、课程、代码、QA、产品门槛及历史审计。

## CV04-01/P3 · 修订专项复核

2026-10-10，实际读取修订课程包并重新计算 SHA256：`4333cf72964a0fd3e315333fcf65e19b2b234a60e0d87a7dfdf327f68a40d415`，与课程岗交接值一致。首轮错误和输入哈希保留在上文。

`allowedSources[S1].excerptWords=13`、S2 为10，逐段独立按空白分词计数分别为13/10，相符；两项各新增 `excerptWordCountRule="English whitespace tokens: len(excerpt.split())"`，规则与实际计数一致，均仍低于25词。两段摘录原文与首轮读取内容一致，未为降低计数删改引文。

作者文件哈希仍为 `3dec9e59898a0293810ff56825ea8679cbd6471376a23b8f24479d1bf9887edd`；九节正文分别与作者对应节逐字比较一致，各 `bodySha256` 实际计算相符。**CV04-01 元数据修改已独立复核，可关闭该文稿缺陷。** 本次仅复核原问题、摘录及作者内容保持，未扩大为新生成内容审校或软件测试。

自查身份仍为 AI 辅助技术审校，未升级为真人专家；未重新广泛浏览、执行案例或调用真实模型，只追加本报告，不改课程 JSON。CR05 实际运行、真实模型新稿审校、真人专家及学习效果缺证继续开放，`teaching_quality` 不因本次修订通过。
