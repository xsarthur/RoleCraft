# c01-selection 检索派生修复

- 版本：`app-v0.12-c01-retrieval-repair`
- 责任岗位：内容检索工程师
- 状态：`ready_for_independent_dual_input_qa`
- 运行时：Node v24.16.0；本机 CPU BGE-small-zh-v1.5 int8；`providerCalled=false`，未调用外部服务。

## 采用源与历史保留

本轮采用当前批准正文 `textbooks/v12/c01-selection.md`，SHA256 为 `4ee70a19c07d14a550ff9f1fbcfb46ec26a3e236aef30b5d3f2b1ce3f190d982`。旧索引声明的 c01 哈希为 `123f00a8…`，旧正文与当前正文不一致；旧 index、vectors、intent vectors、派生数据和 assembly manifest 已复制到 `team/app-v0.12-c01-retrieval-repair-history/received/`，未覆盖历史报告。assembly manifest 原 SHA256 为 `16907987dcebb2195f9bae4df3f0648d566f597f49722e681fb589b87e32305e`，本轮保持不变；canonical index 的 sourceBinding 明确记录 c01 current source override。

## canonical 重建结果

- 语料：30 单元、273 分节；新 corpusHash `c56def0f8eaf17207c10bc794a771650b0c9f52207815ce11aa7a7a00f29f757`。
- c01：源 SHA256 `4ee70a19c07d14a550ff9f1fbcfb46ec26a3e236aef30b5d3f2b1ce3f190d982`，3857 字符、8 分节；30 个单元逐一读取并核对，当前源哈希全部匹配。
- passage vectors：562 条，chunkHash `650101c27eb7db6bfe730fbc567fa08c3a1fcfb88cdf61acb91ee0b97b05014e`，corpusHash 与 index 一致。
- task vectors：56 条；意图描述、模型 revision 未变，缓存 SHA256 `cd0f1e55e25d9b275558baf1693f0721b6ae9eb896a7519c582e8e75a0b51431`，已由 Node24 语义入口校验。
- 派生文件新 SHA256：`server/retrieval/content-v12-index.json`=c005e8fd4071d14a8acc657a762e53359ea79cd785879bdbaceb52c4768b8142；`server/retrieval/vectors-v12.json`=56b81378723d8cd915abb848bc8ec6c4a84eeac0a52fe548ca711ae183f49e47；`dist/content-v12-data.js`=3eb094b460e0a1f545820232058d3b58b4c85d1353c87895709af3784d408b12。

## Node24 自检

已执行 `node server/retrieval/semantic.mjs` 重建受影响 passage vectors，并执行 `node server/retrieval/self-check-v12.mjs`。自检 12/12 通过（ReAct、规划、重规划、恢复、否定、前端 React 无关、歧义和题外问题等），结果记录于 `team/app-v12-textbook-integration-retrieval-self-check.json`；该自检不是独立 QA。

## 测试岗位复验入口

在 `sites/rolecraft` 使用 Node24 执行：

`/Users/shengxiong/.nvm/versions/node/v24.16.0/bin/node team/agent-system-v0.12-qa-check.mjs`

请按当前 canonical index/data/vectors 复验 career_input 与 learning_input 双路径，特别核对来源/版本合同、职业确认写入边界、上下文 opt-in、动态职业无专属检索时的 unavailable、旧路由回退及 `providerCalled=false`。测试岗位应保留既有 `app-v0.12-continuation-qa.*` 历史，并单独写当前版本结论。

## 限制

本修复没有修改正文、合订本、assembly manifest、客户端、账户/数据库、产品合同或旧报告。真实 TCP、浏览器焦点/滚动、中文输入法、窄屏、迟到响应、真人学习效果和完整产品目标仍需独立证据。
