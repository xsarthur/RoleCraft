# 后端数据工程交接：Rolecraft 1.0 P01-MVP 版本化提交

- **日期**：2026-10-16（Asia/Shanghai）
- **责任岗位**：后端数据工程师
- **范围**：V1-05 练习—作品—反馈的最小服务端数据边界
- **实现**：`server/index.mjs`
- **状态**：`met_within_backend_scope; independent_qa_pending`

## 交付内容

在原有 `/api/submissions` 与 GET 读取路由上增加版本化提交字段，并保留旧版作品提交合同。版本化提交的数据库记录保存以下一等字段：

- `practiceId`、`unitId`、`textbookVersion`、`sourceSha`（读取时同时提供兼容别名 `sourceSha256`）
- `artifactVersion`、`previousSubmissionId`
- `workflowStatus` 及规范化的 `workflowStatusCode`
- `recordTypes`、`evidenceRefs`、`reviewScope`

请求同时接受课程 YAML 使用的 `snake_case` 别名，读取响应保留 camelCase 与 snake_case，避免客户端转换时丢失版本边界。

P01 身份 `V1-PILOT-P01-MVP-001` 会核对 `p01-mvp`、`textbook-v12` 和正文 SHA-256 `deb98fa616e7d670108c86eca3b2a137e1183cf69bc3a5f5799a0b08f19b57d9`；身份不匹配返回 `409 practice_version_mismatch`。其他练习仍要求提交完整的版本字段，但不会被错误标成 P01。

`POST /api/submissions` 在带版本字段时新增不可变记录。`PUT`/`PATCH /api/submissions/:id` 不更新旧行，而是以 `previousSubmissionId` 创建新修订；同一账户、练习和 `artifactVersion` 重复时返回 `409 artifact_version_conflict`。旧提交和首失败记录保留，可通过原 GET 列表或单条路由读取。

状态接受英文代码和课程交接中的中文标签，并保存原始标签及规范化代码：

| 语义 | 代码 | 中文标签 |
|---|---|---|
| 草稿/未开始 | `draft` | `未开始` |
| 已提交 | `submitted` | `已提交` |
| 待独立复验 | `pending_reverify` | `待独立复验` |
| 发现问题 | `issues_found` | `发现问题` |
| 证据不足 | `evidence_insufficient` | `证据不足` |

`recordTypes` 仅接受 `draft`、`self_report`、`ai_suggestion`、`professional_review`、`human_review`。客户端不能写入 `professionalVerdict`、`humanVerdict`、`reviewOutcome` 或同类结论字段，服务端返回 `400 client_verdict_forbidden`；读取版本化记录时专业状态固定为 `unreviewed`、真人状态为 `not_started`。这保留了记录层级，却不把学习者自述或客户端字段转成独立/真人结论。

## 数据兼容与安全边界

- 启动时对既有 `submissions` 表执行只增量的 nullable 列迁移；历史旧行仍按原 JSON 形状读取。
- 旧客户端的原字段 POST（`chapterId/moduleId/productTitle/productVersion/artifactUrl/runEvidence/actualResult`）仍可创建旧合同提交，未被强制套入 P01 身份。
- 版本化提交的 `moduleId` 缺省时使用 `unitId`，满足原表非空约束；不触碰正式账户、正式数据库以外的数据迁移。
- 练习证据只保存引用字符串，不抓取 URL、不执行作品、不授予批准或专业/真人审核。
- 所有 JSON 响应继续返回 `releaseVersion: rolecraft-1.0` 和 `X-Rolecraft-Release-Version: rolecraft-1.0`；旧 `productVersion`/工作台字段合同保持不变。

## 隔离自检（Node v24.16.0）

自检使用 `/private/tmp` 临时 SQLite 与进程内 Node HTTP handler，未绑定 TCP、未启动用户服务、未触碰正式数据库。执行结果：

1. 临时账户注册成功，响应含 `releaseVersion=rolecraft-1.0`。
2. 创建 P01 `draft` 版本 `r1`，读取时返回练习/教材/hash、证据引用和 `professionalStatus=unreviewed`。
3. `PUT /api/submissions/:id` 创建 `r2`，返回 `previousSubmissionId`；列表同时保留 `r1`、`r2`。
4. 客户端提交 `professionalVerdict` 被 `400 client_verdict_forbidden` 拒绝。
5. P01 正文 hash 错配被 `409 practice_version_mismatch` 拒绝。
6. 原六字段旧合同提交仍返回 `201`。

这组结果只证明后端字段、不可覆盖版本链、拒绝客户端评审结论及旧路由兼容的隔离行为；真实浏览器、真实 TCP、跨进程恢复、独立评阅队列、学习者执行和 V1-05 整体验收仍由测试岗位复验，不能由本岗位自检关闭。

## 本岗位自查

- 只修改 `server/index.mjs` 与本交接记录，未修改客户端、教材、检索、账户记录或 QA 报告。
- 新版本使用新 UUID 和不可变父链；读取保留旧提交，没有覆盖旧 JSON 或旧状态。
- 服务端未接受任何客户端自授 `professional`/`human` verdict；独立和真人状态仍是未开始/未审核。
- Node `--check` 已通过；当前源码 SHA-256：`9e97ecaf6a7b0c2c28c2d66f496b43a8e345afe6be27dd04a1478fbde9d7d17b`。
