# V1-04 题库/自评服务端数据接入调查

日期：2026-10-16（Asia/Shanghai）  
岗位：后端数据工程师  
范围：只读工作区源文件和 Node 隔离检查；未读取或修改正式数据库，未启动远程服务，未部署。

## 结论

当前远程页面显示“题库资料暂不可用；不会用演示题替代”和自评 0 题，根因是客户端派生题库包的教材 `corpusHash` 已过期，不是 SQLite、账户数据或检索服务没有返回题目。

`dist/learning-experience-v13.js` 在 `data()` 中强制要求：

- `corpusVersion` 与当前全文包相同；
- `corpusHash` 与 `RolecraftContentV12.corpusHash` 相同；
- `bookSha256` 相同；
- 30 个单元、114 道题、240 个知识点的数量一致。

当前数量和书稿 SHA 都满足，但题库派生包声明的 `corpusHash` 是旧值 `1a385b179c0cb8a5b838d17b9d2606a0c1a7e27636d97db45dba5e2a52b2840e`，当前全文包、后端职业元数据和检索索引均是 `c56def0f8eaf17207c10bc794a771650b0c9f52207815ce11aa7a7a00f29f757`。因此 `data()` 捕获校验错误并返回 `null`；题库页进入不可用空态，`eligible()` 没有题目可抽，自评显示 0 题。

## 隔离证据

### 客户端身份校验

隔离 VM 仅加载 `content-v12-data.js` 和 `learning-v13-data.js`，未执行页面、网络或存储写入，结果如下：

```json
{
  "contentVersionMatch": true,
  "corpusHashMatch": false,
  "bookShaMatch": true,
  "units": 30,
  "questions": 114,
  "knowledgePoints": 240,
  "dataValidation": "null/unavailable"
}
```

源码位置：`dist/learning-experience-v13.js:13-14`。题库空态位置：同文件 `questionPage()` 的 `!d` 分支；自评题池由同文件 `eligible()` 从 `data()?.questions` 计算。

### 当前服务端/检索身份

只读调用 `getContentCatalog('textbook-v12')` 和 `getContentReadiness('textbook-v12')` 返回：

- `corpusVersion=textbook-v12`
- `corpusHash=c56def0f8eaf17207c10bc794a771650b0c9f52207815ce11aa7a7a00f29f757`
- `bookSha256=25ce2aaa1be0ba0f2814dd1247ac6299d106c3d2e48f43867c49055490c2801e`
- 30 个单元、Node 24 运行时、检索资源就绪

`server/index.mjs` 的 `seededCareer` 也绑定同一 `corpusHash` 和书稿 SHA。服务器题材目录公开接口目前只提供教材单元/小节、资源与版本元数据，返回对象没有 `questions` 字段；这是当前应用教学交接约定的结果，题库由课程架构师交付的客户端派生包消费，不是后端数据库题目表缺失。

### 派生包绑定进一步失配

`learning-v13-data.js` 的 `sourceBindings` 仍声明 `dist/content-v12-data.js` SHA256 为 `bf9f65e85fde895fd819b2f8c5c581e4ec5339eeed2043fcc8cf21e757c12224`，当前文件实际 SHA256 为 `3eb094b460e0a1f545820232058d3b58b4c85d1353c87895709af3784d408b12`。该字段虽未参与当前 `data()` 运行时数量校验，但说明派生包没有随当前教材全文包重新绑定。

## 后端判断与交接

本次不新增题库 HTTP 接口，也不把 114 题复制进 SQLite：

1. 现行教学交接明确由课程架构师维护 `app-v13-prototype-learning-data.json`，客户端消费其 JS 序列化；后端题目表并非 V1-04 的既定来源。
2. 后端公开教材目录和检索接口已经返回一致的 `textbook-v12` 身份，新增一个未被客户端消费的接口不能修复当前空态，还会形成第二份题库来源。
3. 题目、证据和题组身份属于课程数据职责。应由课程架构师/客户端工程师在受保护的派生构建中更新 `corpusHash` 与 `sourceBindings`，不修改冻结教材正文、不降低客户端来源校验。

交接给课程架构师和客户端工程师：

- 以当前 `dist/content-v12-data.js`、检索 v12 索引和 `textbooks/v12/agent-engineering-textbook.md` 的同一版本身份重新生成/绑定 `learning-v13-data.js`；
- 保持 30 单元、240 知识点、114 题（fixed100 + market14）、Q10/Q99 的个人经历排除规则和逐题来源证据；
- 重新运行客户端数据校验，确认 `data()` 非空，再由 UI/QA 独立核题库一次点击、刷新、后退、窄屏与自评题数；
- 重新冻结新的派生包 SHA，并让 PM 更新 V1-04 复验绑定。旧的 V1-04 fail 记录保留，不能以本调查报告关闭。

若未来产品决定题库需要账户同步或跨设备共享，再由产品经理冻结新的公共只读题库合同（题组、版本、来源和权限）后，由后端数据工程师实现版本化 endpoint；本轮不自行扩大范围。

## 检查记录

- `node --check sites/rolecraft/server/index.mjs`：未修改服务端，语法沿用当前工作区；
- 隔离 VM 身份检查：完成，复现 `corpusHash` 不一致导致不可用；
- `getContentCatalog/getContentReadiness` 只读检查：完成，服务端 v12 内容身份一致；
- 正式数据库、用户记录、远程服务器：未读取、未写入；
- 本报告未修改客户端、教材正文或服务端代码。

