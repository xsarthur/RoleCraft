# v12 教材内容与检索接入工程交接

责任岗位：内容检索工程师。状态：候选已交独立 QA；本文件是工程实现与自查记录，不授独立验收结论。

默认内容已派生为 `textbook-v12` 的 30 个阅读单元、273 个标题小节。正文来自冻结逐篇源，不改教材。顺序采用 assembly manifest 与课程 `readingOrder` 的一致列表，先修采用课程 `units[].prerequisites`，不按该数组的原排列编号。新第 18 篇为 `n03-planning-reflection`，末篇为 `p02`。

- 当前 corpus SHA256：`1a385b179c0cb8a5b838d17b9d2606a0c1a7e27636d97db45dba5e2a52b2840e`。
- 当前完整教材 SHA256：`25ce2aaa1be0ba0f2814dd1247ac6299d106c3d2e48f43867c49055490c2801e`。
- 检索版本：`content-retrieval-0.12-v12`；浏览器阅读包：`dist/content-v12-data.js`，global 为 `RolecraftContentV12`。
- 新索引：`server/retrieval/content-v12-index.json`；新原文与任务向量分别为 `vectors-v12.json`、`intent-vectors-v12.json`。旧 v10 派生包、索引、向量和所有旧报告保留。

## 实现和接口

新构建脚本 `server/retrieval/build-content-v12.mjs` 校验逐篇 SHA、合订本 SHA、课程与正式顺序，再生成阅读包、分节索引及明确白名单的 5 幅图资源和 20 个参考文件。参考包括课程规格、已有公开依据、目录、合订本与 12 个示例源码；源码作为纯文本查看或下载，不执行。没有发布任意目录、用户数据、QA 保留输入、模型目录或依赖目录。

公共 GET `/api/content/catalog`、`/api/content/chapter/<unitId>`、`/api/content/assets/<name>`、`/api/content/reference/<name>` 默认选择 v12。明确历史请求使用 `?version=textbook-v10`；未知版本返回受控错误。POST `/api/content/recommend` 接受当前 `corpusVersion: "textbook-v12"`，返回保留既有 `status`、`interpretedIntents`、`results`、出处与定位字段，每项 `version` 对应响应的 `corpusVersion`。账户、数据库和生成规则未改；旧服务的 `PRODUCT_VERSION` 仍属于原账户/生成版本。

新包保持完整 `bodyMarkdown` 和精确小节正文。当前深链沿用 `#learn/agent/<unitId>/<sectionId>`；明确历史深链由客户端附上旧版本。20 个旧单元的 174 个 section ID 在新版保留，但 20 个源 SHA 均已不同，新包 `compatibility` 逐项记录两版源 SHA 和位置对应。该表只说明定位兼容，不把历史笔记或学习状态授给新版。客户端负责原记录保留及新版本存储，检索岗不读写用户记录。

## 实际离线向量与边界

本次实际在 Node.js 24.16.0、CPU 上使用已有的 `Xenova/bge-small-zh-v1.5`、revision `75c43b069aac4d136ba6bc1122f995fedcfd2781`、int8 权重，CLS 归一化 512 维。权重 SHA256 为 `b9837c19ce154ff0726d398ee77abbc03a7faf0476c6f93016c84e531be7ebb5`。模型没有更换或重新下载，`allowRemoteModels=false`，查询不出机，未调用外部收费 API。

实际生成 561 个 v12 原文分块向量，chunk SHA256 为 `28dee66a4473f780ebd60b4773a25c84e24e3518949f9fa8afbbdca38d4522ae`；生成 56 个任务描述向量，覆盖原 16 类与新增 12 类。首次 v12 原文准备约 8.9 秒，准备进程自然退出 0。向量与任务缓存绑定语料版本、正文分块/描述身份、模型版本和维度；不匹配的已存在资源拒绝使用，不自动把旧资源改标签或以 `no_match` 掩盖故障。

查询向量与正文向量相似度影响候选排序；查询与任务描述向量帮助识别任务。新增任务元数据覆盖规划/重规划、记忆上下文、工具目录、摄取、图编排、委派、沙箱、长任务与迁移评价，避免旧 16 类阻断新内容。原文英文术语召回、任务规则、否定及 React 语境规则继续作为补充。它仍是有限任务领域的混合检索，存在类别与阈值约束，不是自由问题的大模型解释或生成；术语命中也不意味着一门独立教程。明确概念模式与静态 file 入口仍诚实显示 `local_concept_retrieval`。

ReAct 查询实际覆盖 n03 的 `s-da63f3dcff17`（三种策略）；Planning 覆盖 `s-7b6b3d9e9b99` / `s-c9f93b25fb1f`（产生/验证计划）；Replanning 覆盖 `s-7ee14c15626d`（保留事实与失效假设）。英文 Planning / Replanning 是检索元数据的真实主题别名，原文论证为中文；未向教材补入英文词或生成说明。

## 工程自查和独立交接

`server/retrieval/self-check-v12.mjs` 仅运行本轮产品的 12 个有限术语/自然表达及受影响查询，记录实际响应、运行版本、来源绑定、摘录逐字性、href 与每组/总量限制。最终 12 项作者自查通过，Node24 自然退出 0；该记录不代独立 QA。最初自查脚本用了无效 startingPoint，随后将逐项版本字段误写为响应级字段，均为自查 harness 错误，两次原输出另存 `self-check-input-error.json` / `self-check-contract-error.json`，未隐藏为模型或程序缺陷。正确合同核对后通过，不因此重复旧全量测试。

已交 QA 当前真实 API、语料与向量，独立 HTTP / 静态结论待其原报告。当前浏览器通道不可用，真实点击、刷新、图放大与旧记录导出证据仍不足，不用 HTTP 或静态检查替代 UI 验收。正式 4318 的同版启动在关键独立核对后执行，另存工程预览证据；不接管 QA 自有测试端口。

完整培养与行业先进产品目标仍未获证明。此次接入不新增教材生成，不继承教材内容审校为应用通过，不改变原八门槛或旧结论。

## 本地复现

在 `sites/rolecraft` 中使用已支持 Node24：

```sh
node server/retrieval/build-content-v12.mjs
node server/retrieval/semantic.mjs
node server/retrieval/self-check-v12.mjs
node server/index.mjs
```

这些命令要求本机已有检索依赖和锁定模型；本轮没有安装或下载。前两条显式准备仅重建新派生内容/向量。服务正常 SIGINT / SIGTERM 会关闭 HTTP 并 dispose 本地模型，保持自然退出，不使用强制 `process.exit`。当前本机支持运行路径为 `/Users/shengxiong/.nvm/versions/node/v24.16.0/bin/node`；其他 Node 主版本会在本地模型初始化前受控不可用。
