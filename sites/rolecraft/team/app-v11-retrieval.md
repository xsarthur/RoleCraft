# v11 内容检索工程交接

责任：内容检索工程师。范围：公开 v10 语料、索引、受限意图识别、原文推荐、只读 HTTP 运输及该模型正常关闭；没有编写教材、产品条件、客户端或独立测试报告。状态：实现与开发自查完成，独立验收结论由本轮 QA 授予。

本轮默认服务真实运行 `Xenova/bge-small-zh-v1.5` 中文 int8 向量，CPU、CLS pooling、512 维。使用固定 commit `75c43b069aac4d136ba6bc1122f995fedcfd2781`；核心权重 SHA256 `b9837c19ce154ff0726d398ee77abbc03a7faf0476c6f93016c84e531be7ebb5`。当前完整教材 SHA256 `6707a4f03b298a5b234ce56a88edcbd9d79af6d40cb978227461a9d9d522f76e`，按二十篇原始独立正文生成 corpusHash `436ec1edab6c394d0d19ce3769e3a95eadb162d0d2f6564c7442988bd37328e5`。具体源与派生字节绑定见 [工程绑定清单](app-v11-retrieval-binding.json)。

## 已实现

- `server/retrieval/build-content.mjs` 核固定作者 source hash，只读二十篇，跳过代码围栏内部伪标题，形成 174 个真实标题定位节点。标题/重名次数哈希生成稳定小节 ID；全文未规范化或改写。衍生 `dist/content-v10-data.js`，两图的六个 PNG/SVG/DOT 副本，以及教材已引用的九份公开资料副本；不开放任意文件或私有 `.runtime`。
- `semantic.mjs` 本机真正生成 368 个原文片段向量及 32 条领域任务描述向量。任务描述是概念检索元数据，不是固定验收问句或伪回答。主要含义取整条正向上下文，强相关分句补多意图；否定排除和显式任务线索帮助避免相邻语义混淆，然后定位真实正文小节。
- `dist/content-retrieval-core.js` 提供共享的输入/上下文、排除、歧义、证据摘录和来源筛选。file 模式或显式 `ROLECRAFT_RETRIEVAL_MODE=concept` 仅是 `local_concept_retrieval`，不会冒充向量/模型理解；HTTP 默认 `local_semantic_retrieval`。
- 公开只读接口 `GET /api/content/catalog`、`/chapter/:unitId`、图/引用白名单及 `POST /api/content/recommend`。认证、账户、生成队列和数据库规则保留。query 限 1–1200 字，禁止调用者提供路径/owner/私有版本；陌生、空、歧义和资源错分别返回，不执行提问中的指令。
- 推荐按独立意图分组，保留明确排除，每组不超过三项、总计不超过六项。每项给 H1/小节、理由、逐字原文、源 path/hash 和稳定深链。初学者的基础诊断先行，先修只提示、不授掌握。
- 模型文件检查固定版本与 checksum，运行 `allowRemoteModels=false`。查询不发外部服务，无 API key、收费调用或真实生成成功状态。依赖和模型目录隔离且 gitignore；本机实测依赖约 377 MB，量化模型约 24 MB。首次准备下载公开资源，恢复方式见 [检索说明](../server/retrieval/README.md)。

## 已发现问题与返修

首版真实原文向量对生活化改述不足；只召回专业文本并设保守未知门槛，会丢掉 QA 未提前共享的恢复、资料有效性、版本比较和合理停止表达。另有否定范围、泛记忆澄清与初学排序反例。本岗据原例改为任务描述真实向量 + 全正向上下文/强分句识别 + 原文定位，并扩大否定作用域，不写逐问句特例。后续窄返修压掉弱分句误造的发布/产品发现主题，以及恢复请求里的未明示停止主题。QA 按原反例、受影响对照及其少量额外改述独立复验；其关闭记录与精确执行版本以 QA 产物为准，不由本岗代授。

正常关闭也有真实反例：推理后强制 `process.exit(0)` 在 QA 的 Node 24/26 精准 SIGINT 复验中都触发 native mutex / SIGABRT；初次直接自然退出 0 并不能代替这个反例。现等待在途推理、await pipeline.dispose，CLI 改用 `process.exitCode=0` 自然收尾。开发真实 CLI / Node 24.16.0 / 独立临时库 / HTTP200 真向量查询后 SIGINT 退出 0、stderr 空，记录 [关闭自查](../server/retrieval/shutdown-check-results.json)，仍须 QA 独立原例复核。项目本轮明确仅支持 Node 24：其他主版本在原生模型初始化前返回 `runtime_unsupported/unavailable`，launcher 给提示；版本保护不等于已修任意 Node 原生运行。

## 开发实际证据

- Apple NaturalLanguage 简/繁中文词和句向量在当前机器均返回 nil，Swift 与 Objective-C 探针一致；未把系统缺资源包装为语义能力。
- 本机固定 BGE 真推理初次原文向量构建约 5.9 秒，368 个片段、512 维；这是一次本机观察，不是生产性能基准或质量分数。
- [HTTP 开发自查](../server/retrieval/dev-check-results.json)：实际 Node 24.16.0、独立临时数据库，二十篇正文及公开资源、已知对照、排除/多意图、初学与输入边界；所有应用 fetch 限本机回环，外部尝试为 0。此记录属于其执行时点，后续排序改动只做四项 [受影响自查](../server/retrieval/affected-check-results.json)，不谎称全量重跑。
- [工程清单](app-v11-retrieval-binding.json) 记录当前源码/数据/模型锁/向量与派生公开文件身份。旧教材正文、历史审校和用户资料未因索引获得新通过身份。独立 QA 报告不是作者自查。

## 交接与限制

前端收到普通 script 全局 `RolecraftContentV10` 与 `RolecraftContentRetrieval` 合同、`#learn/agent/<unitId>/<sectionId>` 以及 assets/references 的 HTTP 与 staticHref 双定位。返回的 excerpt 是完整原句/原段，逐字可在该小节核对；不把摘要伪装引文。资源损坏或运行不支持显示 unavailable，不能包装成 no_match。

本轮是当前 Agent 教材的受限含义推荐，不能保证任意复杂中文/跨行业理解、真实专业认可或学习效果；本机推理、功能用例和源码 hash 不等于行业先进。没有检索私人数据、写业务工具、执行教材示例、付费调用、上传或发布。真实教材生成、专家审核、学习者作品、行业比较与生产运行仍分别由原责任岗位推进。

官方/发布者依据：[BGE 原模型与使用说明](https://huggingface.co/BAAI/bge-small-zh-v1.5)、[固定转换模型](https://huggingface.co/Xenova/bge-small-zh-v1.5)、[Transformers.js Node 与禁止远程模型](https://huggingface.co/docs/transformers.js/en/tutorials/node)。OpenAI Docs 已为早期真实外部模型候选核对协议；最终本轮采用离线中文向量，不调用付费 Responses。
