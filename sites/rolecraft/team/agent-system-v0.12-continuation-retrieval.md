# Agent 双输入系统 v0.12 延续：内容检索职业—教材绑定交接

- **交接版本**：`agent-system-v0.12-continuation-retrieval-2026-10-15`
- **责任岗位**：内容检索工程师（版本化分节索引、召回、来源与只读接口）
- **范围**：`career_input` 的职业目录教材快照，以及 `learning_input` 按当前职业读取教材的 corpus/index 边界
- **状态**：`mapping_complete_with_source_mismatch_blocker`
- **限制**：本记录不修改检索实现、客户端、账户/数据库、教材正文、旧报告或产品合同；没有外部网络、上传、发布或付费模型调用。

## 1. 当前实际职业目录与绑定矩阵

我读取了当前工作区的默认持久库 `sites/rolecraft/.runtime/rolecraft.sqlite`。该库 `careers` 表当前只有一条 `status='published'` 记录：

| careerId | 标题 | 状态 | contentVersion | indexVersion | textbookVersionId | corpusHash | bookSha256 | 检索能力 |
|---|---|---|---|---|---|---|---|---|
| `agent-developer` | Agent 开发者 | `published` | `textbook-v12` | `content-retrieval-0.12-v12` | `agent-engineering-v12` | `1a385b179c0cb8a5b838d17b9d2606a0c1a7e27636d97db45dba5e2a52b284e0` | `25ce2aaa1be0ba0f2814dd1247ac6299d106c3d2e48f43867c49055490c2801e` | 逻辑上应绑定内置 v12 索引；当前因下述源—索引失配暂不可加载 |

这条记录来自服务启动时的内置 `seededCareer`，不是从 `server/careers/` 导入的动态职业。当前 `sites/rolecraft/server/careers/` 目录不存在，因此默认启动配置没有第二个已发布职业。`/private/tmp` 下的 `python-engineer`、`data-analyst` 等是隔离测试夹具，不能算当前目录中的已发布职业，也不能迁移为产品 corpus。

教材清单与内置索引的静态身份如下：`textbook-v12` 有 30 个单元；合订本 SHA256 为 `25ce2aaa1be0ba0f2814dd1247ac6299d106c3d2e48f43867c49055490c2801e`；内容索引声明的 corpus hash 为 `1a385b179c0cb8a5b838d17b9d2606a0c1a7e27636d97db45dba5e2a52b284e0`；assembly manifest SHA256 为 `16907987dcebb2195f9bae4df3f0648d566f597f49722e681fb589b87e32305e`。语义缓存声明 561 个 passage，模型为锁定的本地 `Xenova/bge-small-zh-v1.5` revision `75c43b069aac4d136ba6bc1122f995fedcfd2781`，不调用外部供应商。

## 2. 当前阻塞：源文件与 v12 索引不一致

`getContentCatalog('textbook-v12')` 和 `getContentReadiness('textbook-v12')` 在当前工作区不能成功完成来源核验。对 30 个单元逐一比对后，只有 `c01-selection` 不一致：

| unitId | 索引声明 SHA256 | 当前正文 SHA256 | 结果 |
|---|---|---|---|
| `c01-selection` | `123f00a89c54dc0e0b18f7752ec5dcb443bf5490c8388068d38b1e7b421b7cd4` | `4ee70a19c07d14a550ff9f1fbcfb46ec26a3e236aef30b5d3f2b1ce3f190d982` | `mismatch` |

索引中的该单元正文长度为 3,654 字符，当前正文为 3,857 字符；不只是 hash 字段误写。检索入口 `server/retrieval/index.mjs` 会在加载 corpus 时逐单元检查 `sourceSha256` 和 `bodyMarkdown`，因此当前真实行为是安全失败（`unavailable`/来源失配），不能把静态矩阵中的 v12 逻辑绑定写成当前查询已可用。任何修复都必须由教材/内容数据责任人更新派生索引并由 QA 重新核 hash；本岗不在本记录中重建或覆盖索引。

## 3. 动态职业能力边界

动态职业的目录元数据与学习检索是两个能力。`server/careers.mjs` 允许 `status='published'` 的导入记录使用独立 `corpusPath`；导入 corpus 会核 `corpusVersion`、每个单元/小节的正文 hash、`corpusHash` 和路径范围。没有 `corpusPath` 的非内置职业也可以进入职业目录（只要元数据声明的是已支持的 `textbook-v10`/`textbook-v12`），但它没有可读的独立教材。

在 `server/index.mjs` 当前实现中：

| 动态职业情况 | 职业目录推荐 | `/api/careers/:careerId/content/catalog` | `/api/agent/learning/query` | 检索结论 |
|---|---|---|---|---|
| `published`，没有独立 `corpusPath` | 可以作为目录候选，带自身版本快照 | `409 career_content_unavailable` | `200`，`status='unavailable'`、空结果、`providerCalled=false` | **不得回退 Agent 教材** |
| `published`，有独立且 hash 校验通过的 corpus | 可以作为目录候选 | 可读该职业独立目录/章节 | 当前仍 `200`、`status='unavailable'`；检索适配器只绑定内置 `agent-developer` | 目录可读不等于内容检索已接入 |
| `preparing`/`retired` | 不应进入 published 候选 | `careerRow` 拒绝（`career_unavailable`） | 不应查询 | 不得把历史/准备中内容当当前教材 |

因此产品延续交接中的“动态职业无专属 corpus 返回 `unavailable`”是正确且必要的；实际实现还更严格：即使动态职业有独立 corpus，当前 v0.12 learning adapter 也没有动态索引/向量绑定，仍必须返回 `unavailable`，直到新增独立检索交接和 QA 证据。孤立测试夹具曾证明 `python-engineer` 无 corpus 时服务返回 `career_content_unavailable`，但该记录属于历史隔离测试，不是当前默认服务的实时 socket 证据。

## 4. 检索只读接口与来源合同

检索岗位向后端/客户端提供的能力仍是只读的：

- `getContentReadiness(version)`：核 corpus、正文、教材合订本、manifest/课程源绑定，以及本机模型准备状态；失败时必须保留 `available=false`，不能使用旧缓存冒充当前版本。
- `getContentCatalog(version)`：返回去除正文的分节目录、`corpusVersion`、`corpusHash`、`bookSha256` 和带版本参数的稳定链接。
- `getContentChapter(unitId, version)`：返回指定单元原文和来源 hash；只接受已验证的 `textbook-v10`/`textbook-v12` 内置语料。
- `recommendContent(input)` / `dialogContent(input)`：仅在 corpus 来源核验成功后召回；每个肯定结果必须携带 `unitId`、`sectionId`、`sourcePath`、`sourceSha256`、原文摘录、`href`、版本和 corpus hash。规则、离线语义和外部 API 模式必须分开标识；当前实现的 `providerCalled` 应为 `false`。
- `closeContentRetrieval()`：仅清理本地检索资源，不写账户、职业、学习记录或教材。

Agent learning 路由对非内置职业的明确响应边界是：`status='unavailable'`、`results=[]`、`providerCalled=false`、保留当前职业的版本快照，并说明“当前职业的教材已发布，但 v0.12 本地检索适配器尚未为该职业准备独立索引；可以打开课程目录”。后端和 QA 应把这个状态与 `no_match`、`stale_version`、`career_content_unavailable` 分开记录。

## 5. 已存在证据与本轮验证结果

本轮只读核对的证据：

1. `careers` 表查询确认默认 `.runtime` 只有 `agent-developer` 一条 published 记录，且快照字段与 `seededCareer` 一致。
2. `server/careers.mjs` 静态阅读确认导入 corpus 的字段、正文 hash、corpus hash 和路径范围校验，以及没有 corpusPath 的动态元数据行为。
3. `server/retrieval/index.mjs` 静态阅读确认内置版本白名单、逐单元正文核验、source binding、结果来源字段和只读接口边界。
4. Node 24 `node --check` 对 `careers.mjs` 与 `retrieval/index.mjs` 通过；直接调用 `getContentCatalog('textbook-v12')` 发现上述 `c01-selection` 来源失配并抛出 `Current source differs; rebuild content`。这证明当前版本在完整来源核验前不能称为可检索通过。

未完成或不能由本岗声称的证据：真实 TCP/浏览器、动态职业专属向量索引、索引重建后的独立 QA、跨进程重启、用户理解、真实学习效果和生产部署。此前 v0.12 QA 的 43/43 是进程内 handler + 临时 SQLite 的限定证据，不能覆盖本轮发现的当前源—索引失配。

## 6. 给后端与 QA 的复验条件

- **后端**：保留动态职业没有 corpus 或没有检索适配器时的 `unavailable` 分支，不把任何动态 careerId 重写为 `agent-developer`；响应继续回显真实 career/content/index/textbook/corpus 快照，且 `providerCalled=false`。
- **内容数据/教材责任人**：先决定 `c01-selection` 当前正文是否为批准版本；若正文已批准，重新构建 `content-v12-index.json` 及受影响向量，并记录新 corpus/index/hash，不覆盖历史报告；若正文未批准，恢复正文也必须由相应责任人和 QA 记录，不由检索岗暗改。
- **QA**：在来源修复后重新核 30 单元、合订本、manifest、vector cache 和 561 passages 的身份；在隔离动态职业夹具中分别验证无 corpus（`career_content_unavailable`/learning `unavailable`）与有 corpus 但无检索适配器（learning `unavailable`），确认绝不返回 Agent 教材结果；同时复验 `no_match` 与 `stale_version` 的可区分性。
- **客户端**：只消费响应中真实的 `unavailable` 和版本快照，不用缓存的 Agent 卡片替代动态职业状态；本岗不改客户端。

### 结论

当前默认 published 职业只有 `agent-developer`；其预期绑定为 v12 内置 30 单元 corpus，但当前 `c01-selection` 正文与派生索引不一致，故当前检索能力应标为 `blocked_by_source_mismatch`。动态职业没有专属 corpus 时返回 `unavailable` 是当前合同要求；有独立 corpus 也不能在没有动态检索适配器和独立 QA 前宣称 learning 可用。该结论不改变旧报告，不代表完整职造产品达标。
