# v0.12 c01 canonical 后端快照同步

日期：2026-10-15（Asia/Shanghai）
责任岗位：后端数据工程师
范围：只同步 `server/index.mjs` 的内置 Agent 职业快照与已验证教材身份；保留旧正文、旧索引和旧 QA 报告，不改客户端、教材正文、检索算法或测试报告。

## 变更

`seededCareer` 的 `textbook-v12` `corpusHash` 已由历史派生值
`1a385b179c0cb8a5b838d17b9d2606a0c1a7e27636d97db45dba5e2a52b284e0`
同步为当前 canonical corpus 的
`c56def0f8eaf17207c10bc794a771650b0c9f52207815ce11aa7a7a00f29f757`。
`verifiedContentIdentity['textbook-v12']` 通过 `seededCareer.corpusHash` 共享该新身份，因此服务启动时写入 `careers.corpus_hash`、职业推荐快照、学习响应快照和确认版本比较使用同一 hash。`bookSha256`、`contentVersion`、`indexVersion` 与 `textbookVersionId` 保持收到值。

历史值只在此前报告中保留，未覆盖：`team/agent-system-v0.12-qa*.json`、`team/agent-system-v0.12-continuation-retrieval.md` 等历史材料仍可见且不作为本次通过证据。

## 文件证据

| 文件 | 本次 SHA256 |
| --- | --- |
| `server/index.mjs` | `53d0eabed6dc490f772ba94df3d6a6cba8056eaa55388bb79463feb3ca4a7c3e` |
| `server/retrieval/index.mjs`（只读核对） | `c87dfde6c1ae60ee7594bf5f033ab4fc2a90554a55deabe8520f1045bfc43530` |
| `server/retrieval/content-v12-index.json`（只读核对） | `c005e8fd4071d14a8acc657a762e53359ea79cd785879bdbaceb52c4768b8142` |
| 当前 c01 正文（只读核对） | `4ee70a19c07d14a550ff9f1fbcfb46ec26a3e236aef30b5d3f2b1ce3f190d982` |

canonical 索引声明：`corpusVersion=textbook-v12`、30 个单元、`corpusHash=c56def0f8eaf17207c10bc794a771650b0c9f52207815ce11aa7a7a00f29f757`。c01 正文 SHA 与索引中的 c01 source binding 是否已由内容检索岗位重建，属于其交付范围；本后端同步不改正文或索引。

## Node24 隔离自检

运行时：`Node v24.16.0`。

- `node --check server/index.mjs`：通过。
- `node --check server/retrieval/index.mjs`：通过。
- `node --check server/retrieval/build-content-v12-c01-repair.mjs`：通过。
- 临时目录 `/private/tmp/rolecraft-v012-backend-sync-*`、临时 SQLite、进程内 HTTP handler：5/5 通过，随后关闭服务并删除临时数据库。
  - catalog corpus binding：目录返回 v12、30 单元和 canonical c56def0f…。
  - career recommend snapshot：`agent-developer` 候选返回 canonical corpus hash 及 `contentVersion/indexVersion/textbookVersionId`。
  - career confirm current version：使用推荐快照确认成功，写入回执仍绑定 canonical hash。
  - career confirm stale version：提交 `stale-hash` 返回 HTTP 409 `career_version_mismatch`，未写入。
  - learning snapshot binding：学习查询返回 v12/canonical hash，结果卡的 `corpusHash` 与来源 SHA 均存在。

以上为服务端数据层自检，不替代独立测试岗位的完整 QA；没有调用外部模型或供应商。

## 未验证与边界

真实 TCP 监听、浏览器职业卡/学习卡视觉展示、中文输入法、窄屏、迟到响应、跨进程/跨重启幂等恢复，以及真实用户理解仍未验证。当前证据只证明临时 SQLite 和进程内 handler 的版本绑定与冲突保护。完整产品目标仍由项目经理和测试岗位按当前版本独立判定，不能由本同步报告关闭。
