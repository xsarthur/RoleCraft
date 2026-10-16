# 本地教材内容检索

这是 v11 内容检索服务，唯一职责是把学习需求定位到公开 v10 教材小节。它不会编写新教材、回答业务问题、读取个人教材、执行工具或确认职业能力。

默认 `local_semantic_retrieval` 在本机 CPU 实际运行中文 BGE 向量模型。处理链是输入校验 → 正向/排除分句 → 任务概念向量召回 → 当前教材原文向量检索 → 来源与小节核验 → 推荐或澄清。32 条任务自然描述是检索元数据，不是预置问题答案；用户文本和原文都不会在查询时发往外部服务。陌生表达、复杂否定和相近任务仍可能需要澄清，不能把有限验收推广为任意中文理解保证。

## 本机准备与恢复

Node.js 24 是本轮支持范围，其他主版本在模型初始化前返回 `runtime_unsupported/unavailable`，启动脚本也给清晰提示。首次准备需要下载公开软件依赖和约 24 MB 模型文件；本机隔离依赖目录实测约 377 MB，量化模型约 24 MB。模型文件和 node_modules 已忽略，不会随源码自动传送。安装和模型准备不读取本地账户或正文，不需要 API key。

从此目录执行：

```sh
npm ci --ignore-scripts --no-audit --no-fund
node prepare-model.mjs
node build-content.mjs
node semantic.mjs
```

模型固定 `Xenova/bge-small-zh-v1.5`、commit `75c43b069aac4d136ba6bc1122f995fedcfd2781`、int8；来源和各文件 SHA256 在 `model-lock.json`。核心权重 SHA256 为 `b9837c19ce154ff0726d398ee77abbc03a7faf0476c6f93016c84e531be7ebb5`。运行仅允许固定本地模型路径，`allowRemoteModels=false`；缺失/损坏模型返回 `unavailable`，不会临时联网下载或冒充成功。`semantic.mjs` 可重新构建与当前 corpus/model/chunk hash 绑定的原文向量。任务描述向量在本地按元数据 hash 构建与复用。

启动项目现有服务即可消费新增路由；不需要改变现有账户或生成配置。`ROLECRAFT_RETRIEVAL_MODE=concept` 是管理员明确选择的规则降级，返回 `local_concept_retrieval`，不能包装成向量或大模型理解。`file://` 的纯静态阅读也只使用该诚实规则降级；本轮正式可体验入口是本地 HTTP。

从工作区根目录用 Node 24 运行 `node scripts/start-local.mjs`。这台机器可复现的启动命令是 `/Users/shengxiong/.nvm/versions/node/v24.16.0/bin/node scripts/start-local.mjs`；该绝对路径只是本机安装位置，其他机器自行使用其 Node 24 可执行文件。原端口/数据库默认位置和 launcher 信号转发不变。

## 接口

- `GET /api/content/catalog`：20 单元、正式顺序、先修和公开来源身份；无需登录。
- `GET /api/content/chapter/:unitId`：当前实际正文、章节 hash 与稳定小节。只接受既有公开 unitId。
- `POST /api/content/recommend`：`{query,startingPoint?,currentUnitId?,currentSectionId?,corpusVersion?}`；query 为 1–1200 字，startingPoint 为 `beginner|developer|practitioner|null`；版本只可为当前 `textbook-v10`。禁止自定文件、账号、owner 或旧版本字段。
- `GET /api/content/assets/:name`：6 项实际图 PNG/SVG/DOT 白名单。
- `GET /api/content/reference/:name`：9 项教材已经引用的公开规范/审校文件白名单。未引用文件、私有目录、环境文件和脚本都不开放。

推荐结果 `status` 分别为 `recommended|needs_clarification|no_match|invalid_input|unavailable`，同时含 `engineMode/providerCalled/corpusVersion/corpusHash/interpretedIntents/excludedIntents/results/clarification/limitations`。推荐卡给准确章节/小节、理由、逐字原文、源 path/hash 与 `#learn/agent/<unitId>/<sectionId>`。默认向量模式给 `semanticProvenance`，只描述实际本地模型与离线属性，不输出未经校准的匹配概率。最多 6 项，每意图最多 3 项。缺证或资源错误不能转换成无匹配。

`dist/content-v10-data.js` 是固定原文的派生展示包，`globalThis.RolecraftContentV10` 包含全文及小节。图与参考文件的 `href` 指向 HTTP 白名单路由，`staticHref` 指向派生公开副本。任何派生索引不改正文和既有文稿审校身份。题库、真实生成、专家审核、学习效果与行业产品结论仍是各自未完成工作。

## 证据与边界

`dev-check.mjs` 只做工程自查，采用临时独立 SQLite、禁止所有外部请求，核真实 HTTP/原文/版本/边界，并在关闭时释放 ONNX pipeline。实际独立验收由测试岗位维护，不能用开发自查代替。

QA 实际发现强制 `process.exit(0)` 在推理后正常停止时可触发原生 mutex 错误，Node 24 和 26 都曾复现；不能用版本保护声称这个旧反例已关闭。现已先等待在途推理、释放 pipeline，再设置 `process.exitCode=0` 让事件循环自然收尾。开发直接 CLI 推理后 SIGINT 退出 0；独立结论见本轮 QA 的原例复验。Node 26 原生运行能力仍不在本轮支持结论内。

本机 Apple NaturalLanguage 的简体、繁体中文词向量和句向量均不可用，已用 Swift/Objective-C 探针实际确认；因此没有把系统返回 nil 包装为语义能力。真中文向量由上述单独下载模型提供。

模型与运行方式依据：[模型原发布者](https://huggingface.co/BAAI/bge-small-zh-v1.5)、[固定转换模型](https://huggingface.co/Xenova/bge-small-zh-v1.5)、[Transformers.js Node 与禁用远程模型文档](https://huggingface.co/docs/transformers.js/en/tutorials/node)。原文向量用 CLS pooling/归一化，余弦只作内部排序；有限语料门槛用于保留不确定性，不是学习质量或行业门槛。
