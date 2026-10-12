# AI生成工程师 · 首个真实章节交接

2026-10-10；唯一领域：模型生成服务。依据 AGENTS、SPECIALISTS、product-review、engineering-review、product-gates及0.3独立审计。旧工程审查是历史建议，当前结论以0.3审计为准：`real_generation`未通过。本文件为实施准备，不关闭门槛，不修改原审计。

## 实施边界与顺序

先由产品经理确认单章试点，课程架构师交付能力/模板/量规版本、首章主题及允许来源；教材研发员提供教学样本，内容审校员核对技术论断。生成工程师再实现服务端模型适配器及结构校验；后端岗位提供持久任务接口后联调，前端岗位消费任务与固定章节版本。独立QA取得真实调用、故障恢复及内容检查证据后复验。一个章节试点不代表整本教材或完整系统达标。

候选OpenAI接入按官方文档使用Responses结构化输出的`text.format`，仍单独处理拒绝、截断和内容错误；结构合法不证明教学或事实正确。[Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses)。凭据只放服务端，记录实际`x-request-id`；无法取得时保留为空，并用本地尝试标识关联，不能补造。[API Overview](https://developers.openai.com/api/reference/overview)。本轮已打开核对上述官方资料，未选模型、报价或SDK版本。

## 最小接口契约草案

后端API沿原建议：`POST /api/generation-jobs`提交主题及档案/标准版本、幂等键，返回202和job ID；查询任务，重试创建新attempt，读取固定章节版本。身份由后端会话确定，客户端不能传审核通过结果。

后端经认证的内部调用`generateChapter(input)`：`jobId, attemptId, leaseToken, inputHash, profileSnapshot, competencyVersion, templateVersion, rubricVersion, sourceBundleVersion, sourceSnippets[], promptVersion, generationConfigVersion, budgetLimit`。资料片段包含ID、URL、实际采集时间、原文位置、版本和哈希；缺必要资料返回`source_insufficient`，不造引用。

结果：`chapterDraft, claims[{id,text,snippetIds}], examples[{id,type,verificationStatus}], modelActual, providerResponseId, providerRequestId, usage, timings, outputHash, error{code,retryable}`。返回完整草稿前校验模板结构、长度、引用ID与位置；保存/审核成功由后端确认，模型服务不得自行设为已发布。

后端拥有job身份、幂等、租约、检查点、事务持久化及账户隔离；模型服务执行一次attempt，通过后端事件接口提交阶段与结果，写入携带租约防止过期worker覆盖。前端只读取真实阶段、错误、草稿及审核状态，不直接调用供应商或接触密钥。

## 状态、失败与证据链

任务`queued → running → succeeded/failed`由后端维护；模型阶段为资料加载、生成、结构检查、待保存。`succeeded`只表示草稿已持久保存。拒绝、无效结构、引用不足保留问题及原响应；认证/预算错误停止；超时/限流按已配置次数、时限与预算有限退避。不确定外部请求是否执行时标记未知，不能保证恰好一次或无重复计费。重试保留旧attempt；变更输入建关联新job。

不可变链：档案/能力/提示/资料快照 → job/attempt/实际调用 → 章节哈希与版本 → claim/片段/原文 → 独立核验。日志记录真实时间、阶段、输入输出哈希、HTTP状态、请求/响应ID、usage、错误与重试；脱敏内容留受控证据，密钥不进日志。usage不是账单，实际费用由运营分析员按有效价格/账单核算，未知不填零。

“片段存在”仅是关联检查；论断是否受支持交内容审校员，教学适切性交课程架构师。示例未受控运行标`not_run`，伪代码标明类型；实际专家复核单独记录，不以模型自检替代。

## 待输入、自查与复验

待输入：服务端模型供应商/可用模型及权限、安全凭据配置、单次/总预算、超时重试限额、资料授权、正式模板及审核条件、后端接口和测试环境。本轮未检查或读取任何凭据，缺项是未获交接，不断言用户不存在账号。

实际完成：只读审计诊断、官方文档核对、接口及证据交接。未做：应用实现、真实调用、付费操作、示例执行、账户持久化、浏览器或独立验收、外部发布。领域自查：职责/历史结论/状态分离/来源版本/失败/费用未知均已明确，方案仍待联调验证。

独立复验须核对真实供应商请求与产物关联、不同档案输入、来源支持与示例记录、拒绝/超时/预算故障及恢复、任务中断重复执行、旧版本保留；模拟响应仅验证程序，不证明真实生成。QA依原门槛判断，单章通过也不得自动关闭完整教材、专业审核或其他产品缺口。
