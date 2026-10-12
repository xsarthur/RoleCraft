# v14 职业知识对话 · 内容检索交接

责任：内容检索工程师。日期：2026-10-12（Asia/Shanghai）。当前状态：产品合同与 QA 基线放行后实现，候选1已冻并交独立 QA；未授独立通过，未更新用户4318服务。

## 实际收到的实现

当前默认 v12：30 单元/273 小节，Node24 CPU 上固定中文 BGE-small-zh-v1.5 int8，现有原文向量与教材/模型 hash 绑定。`recommendContent` 通过任务概念、分句否定、正文向量与真实英文术语召回返回出处及精确 excerpt；`POST /api/content/recommend` 是公共只读接口。客户端仍把它当查教材而非简单问答。当前源码包含 v13 学习工作台，不以过时讨论稿认定尚无实现。

现实现无独立职业域/非职业域对比、混合意图过滤、简单答案对象或可验证的上一主题协议；页面上下文只是检索条件，不能用来把任何无关问题判为职业知识问题。BGE 是语义向量检索模型，不是生成式大模型。

## 建议服务与客户端合同

新增公共只读 `POST /api/content/dialog`；既有 recommend 请求和响应保持兼容。请求沿用 `{query,corpusVersion,startingPoint?,currentUnitId?,currentSectionId?}`，可加 `previousContext`：只接受现教材 canonical 单元/小节/版本/源 hash，以及经该节正文核实的2–40字符英文术语focusTerm，不能传任意历史消息、用户档案、URL、文件路径、系统提示或账号。query 继续为 1–1200 字。服务不保存对话，不接触账户/数据库；客户端本会话历史由前端负责。最终字段以 `app-v14-dialog-api.md` 为准；初稿所提 answer 对象已经合并为产品合同规定的 dialog.sentences/citations，不要求旧消费者变更。

建议状态按产品初交采用：`answered|related_uncovered|unrelated|needs_clarification|unavailable`，输入错误明确 `invalid_input`。`answered` 返回 1–3 句教材逐字短答、最多 3 个具体小节入口；`answer` 含短句文本与每句对应的 `unitId/sectionId/sourcePath/sourceSha256/version`、原文 offset；`results` 沿用现推荐卡出处字段。`corpusVersion/corpusHash/dialogVersion/engineMode/providerCalled/semanticProvenance` 说明资源和实际运行方式。答案句须为该小节 `bodyMarkdown` 的精确子串，入口须 canonical，不能使用预置字典答案、模型臆造来源或标题冒充正文。

无关返回范围说明且空 answer/results；职业相关但正文无足够支撑返回 related_uncovered，区别于无关与模型不可用。歧义先澄清，不借同名词强推 Agent 内容。混合输入仅职业知识子句参与回答，无关子句在 `filteredSegments` 中标记已过滤；否定子句不能作为 positive 意图。短追问只有可验证上一主题/显式当前小节才补全，显式新主题不继承旧主题；版本或来源失配不可使用。当前页与上一主题都是检索参考，不是执行授权。

## 可实施机制

1. 输入白名单与公开 corpus/source hash 核验；对未知版本、字段和上下文受控拒绝。
2. 正负分句；采用本机 BGE 对自然语言职业任务描述与无关领域描述作对比，结合可审查的源词/任务证据。描述是分类检索元数据，不是固定问句答案；不单凭关键词或高 cosine 就断言覆盖。职业域包含 Agent 机制、相关软件/模型/接口/安全/测试基础与产品创造，而不是只接受 Agent 名词。
3. 判定相关、不相关、需澄清；明确前端 React 与 ReAct 歧义、明确未收录职业知识、非知识执行请求、提示注入混入与否定/多意图。题外分句先过滤，只有保留子句用于检索。
4. 对保留表达运行原本 BGE 检索，复用原文/版本校验。候选小节再次校验职业主题与支持证据，不能因单个 Agent 词返回正文。
5. 从真实教学正文段落切出完整短句，去掉围栏/表格/标题/来源行政段和未完成 Markdown。使用向量与表达词证据选择句，不生成新的教材事实；每句精确回查原文 offset，1–3 句/1–3 入口。
6. 对资源不可用、忙碌和 unsupported runtime 返回 unavailable，绝不把模型失败当无关。concept 静态降级须显式标规则/保守澄清，不伪装语义推理。

阈值只属于待验证的工程拒答/排序参数，不是用户价值或职业能力门槛；实际效果要由 QA 的产品用例独立核验。当前方案未承诺任意中文语义可靠性，也不代表生成式辅导或真人专业结论。

## 文件所有权与自查

本岗可写新增 server/retrieval/dialog 模块/派生语义资源、共享 retrieval core 及 server/index.mjs 的对应只读路由；不写教材、前端、账户数据、产品标准或独立 QA。自查将使用 Node24 直接模块或隔离临时 HTTP、固定本地模型、有限相关/无关/混合/否定/注入/上下文反例及逐句 source 校验，不联网、不付费、不上传发布。正式4318仅在 PM 安排、工程归属核实后正常更新，沿用 .runtime 且不读取实际 DB。

收到源码绑定（只读时点）：

| 文件 | SHA256 |
| --- | --- |
| server/retrieval/index.mjs | acc8555c9b23603f04afa20ff7dd6eb2fc5429894b7474814d4b16114e1ded0d |
| server/retrieval/semantic.mjs | d101163e0934cac93309265c4949fccbc9fe304120c5954ef9466a4fe68a4115 |
| dist/content-retrieval-core.js | b3535b2249effdb0118713295ae9b86e117e0d86c86041aade3e8c33a0fc092d |
| server/index.mjs | 63cee03519aaeb53257108227d17464bc3fb8942a7636ea87fddd13a76d2182b |
| server/retrieval/content-v12-index.json | ac87bfa9c88f6e1709fc59c05fc3af1fcf98b7274aeb1be48a07e490578bdd6b |
| server/retrieval/vectors-v12.json | c28e1e27e7185638aeecc4357498ae19e99f5277e5d271a7d529e57aa1754164 |
| server/retrieval/model-lock.json | 4ca475a7d227148624e45c52df50cbe6c3ca0678a7ef4c9bb8b7a76e61f949e7 |

## 候选1实际实现与开发检查

新增 `server/retrieval/dialog.mjs` 及公共路由，retrieval/index包装公开corpus核验、在途问答计数及正常停止时等待/清缓存。`semantic.mjs`、共享原推荐core、v12索引/561正文向量/56任务向量/模型锁与教材不改。本岗未写前端或账户、未读实际DB。最终程序绑定在 `app-v14-dialog-retrieval-binding.json`，最终 API 文档在 `app-v14-dialog-api.md`；该绑定没有宣称绑定本报告，后补报告不改其历史证据。

实际语义链：25条自然语言职业/题外域描述在内存用固定本机BGE向量化；输入分句分别与两域描述对比，显式知识/独立生活请求/否定/注入另作约束。职业知识元数据同时映射已存在的教学主题，原recommend无法召回时才在dialog内部做主题向量补充和原文排序；既有recommend源代码行为不变。只提Agent词不能为烹饪/天气执行请求放行，含生活场景的软件工具机制可以相关。明确React前端实现是相关未覆盖，裸React先澄清，不用ReAct段硬答按钮实现。

回答是BGE排序后从候选教学段落提取1–2个完整原句，总代码限制320字符；非标题/代码/表格/行政段落。每句绑定引用ID，quote为所在节连续原文片段，quoteStart/End为该节UTF16位置，入口及源hash再由客户端核对。ReAct短追问保留经公开原文核验的focusTerm以约束同一节内不同策略；缺上下文追问澄清。所有非answered状态集中清空sentences/citations/results/context，模型异常不伪装无关。concept明确配置返回语义问答暂不可用，静态/原规则检索的用户体验由前端负责。

开发直接模块检查使用Node24.16.0，23普通公开/自拟输入、3上下文输入、1旧recommend兼容输入，共27项，最终状态/引用属性0失败，句子和quote均核真实小节子串/offset/hash，停止自然退出0。证据是 `app-v14-dialog-retrieval-dev-check.json` 与 `server/retrieval/dialog-dev-check.mjs`。该程序主要核有限状态和引用属性，实际答题相关性仍交QA，不能把0属性失败等同独立内容质量或任意中文可靠。

首轮公开中途失败/日志问题未召回、React前端误澄清、ReAct追问漂到同节其他策略；随后以职业主题向量补充、概念原文入口、明确前端语境和经源核术语/原段句排序窄修。前四次记录保存在 `app-v14-dialog-retrieval-history/dev-check-first/second/third/fourth.json`，不擦掉失败。首轮纯注入输出澄清在CL14-02允许范围内，后续改为无关范围提示。未读取独立QA保留变体，未固定完整问题到答案词典。最终ReAct追问提取ReAct定义及“轮次增加、上下文污染与短视；…不保证最终证据完整”的原句，相关未收录XQZ设备返回未覆盖。

候选代码语法检查通过，但本岗未对HTTP运输、真实UI、账户生成、旧题库/教材行为做独立验收或重跑；不执行付费/联网调用/上传发布。实际服务4475与真实UI验收由测试岗位控制，用户4318保持原进程等待项目经理安排。新文件不继承旧版独立QA。完整职业培养及行业先进仍not_met，真人专家、学员和生产/市场证据不由此生成。

领域自查：已区分现检索能力与新增短答/过滤机制；不将精确原文抽取冒称大模型生成；未改变旧合同、正文、八门槛或用户记录。代码停写等候独立反例，测试员给反例后按唯一职责返修并重冻新候选。

## 独立反例后的候选2

独立QA candidate01实际HTTP和人工核对给DG14-01/02/03：弱职业子句丢失导致恢复/比较/约束调整/工具确认/反思漏召回或包装错答，ReAct同节主语错配与日志顺序句缺参照，纯喜剧电影误澄清。268机械属性核验不能关闭这些质量反例，候选1仍失败；原QA文件保持。本岗只读取QA公开的8个失败输入和expected，未读取其他冻结变体。候选1本岗源码/绑定/开发记录保存在retrieval-history/candidate01。

候选2采用25条域描述外另8个职业细主题描述（恢复、版本比较、可观测、重规划、反思、ReAct、远端效果确认、候选规划），共33条固定本机BGE元数据；主题关联真实单元和章节语义，不含固定问题答案。职业整体和保留子句共同判断，弱相关后半句可依明确职业语境继承；我/请前缀否定正确排除。专属主题强于一般主题才改写新dialog的候选范围，避免用专属层挤掉Python/产品等既有知识。旧recommend机制仍保持。

源节和句同时排除v12学习衔接、迁移/未运行/导航包装；拒绝孤立的“这几个反例”等依赖句和半截Markdown；指代句只有同段明确主题支撑才选。ReAct自然表达亦由语义主题确定，固定状态机/先计划段不能冒充其主语；重复失败转向n03实质进展/状态指纹机制。日志取舍提取可独立理解的协议基线与事件账本/tracing职责句。远端工具确认回到c03成功回执/未知尝试/操作级核对，而不是预订流程模拟。电影/喜剧明确定域外；生活场景中的Agent可靠性保持职业域。

DG14-04前端丢focusTerm的独立反例由客户端岗负责，服务在当前页与上一主题同一源篇节时继承经源核术语；新主题不会继承。字段仍按既有API合同，未加入任意用户历史或指令。8公开失败返修开发核及27受影响原开发核最后均0状态/引用失败，返修检查另做有限机制词/行政错句排除；8与27分开，不作为独立语义通过。返修开发过程也发现模型/主题附加描述误影响句子问题类型标识、粗主题覆盖Python/产品及示例短句不独立等，已收敛为原问题定句型、一般主题竞争及自包含源句，不增加任意中文承诺。

候选2绑定为 `app-v14-dialog-retrieval-binding.json`（v2）；dialog.mjs SHA256 `f3acbc01a0973591cb0049bce26dbaf16ea96cf3e444b261c380f8ce9794008c`。新增 `dialog-repair-check.mjs` 和 `app-v14-dialog-retrieval-repair-check.json` 记录仅已公开失败的本岗复核。测试员正按原例/受影响范围独立复验，程序停写，不能由本岗自查关闭DG缺陷或完整目标。正式4318未操作、实际DB未读取、无外部/付费调用。

## DG14-05与候选3

候选2核心独立复验由PM转达44请求/292机械核与8语义反例通过、真实ReAct追问闭合后，已先正常更新4318，操作及旧退出码null限制单列preview1。随后QA真实UI发现DG14-05：裸React提示两含义，但第二按钮实际为Agent规划，不对应前端React。

按PM解除该窄修source lock，只改dialog的React澄清选项分支：Agent ReAct机制完整表达与React前端实现完整表达，分别引导answered和related_uncovered；分类、抽取、原recommend、非React裸规划收到对象保持。candidate2源码及绑定另存retrieval-history/candidate02。开发只核原裸React、两完整选择query、裸规划状态和旧recommend，共5项0失败，证据clarification-check.json及专用脚本；未重跑前292或8项独立结论。

候选3冻结dialog SHA256 `db17b415b6d53c82ce933c064dc21c6d0ea00d2567e63b8fb0c20653f6dee4f1`，绑定为retrieval-binding.json v3。代码再次停写，QA负责原UI与真实按钮提交/受影响规划窄复验；通过后才正常更新当前PID45903/PTY66851服务并写preview2，preview1保持原证据。

QA通知DG14-05在c3实际HTTP与真实UI两按钮完整提交通过后，已执行第二次正式更新：旧PID45903经PTY66851 Ctrl-C实际退出0，确认无监听，再启动PID47895/PTY10912，沿原.runtime。公开health、裸React/两完整选项、旧recommend与静态资源均完成限定运输核验；preview2与最后binding4六资源/服务c3收据单列。preview1旧PID23034不可取退出码null保留。DG14-06缓存链路由前端和QA单独关闭，服务更新不代该结论。实际DB不用于测试/迁移删除，服务保留；源代码保持候选3。
