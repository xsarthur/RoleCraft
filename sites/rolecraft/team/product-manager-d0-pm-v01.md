# 产品经理 D0 项目经理协调与执行门禁 v0.1

- `contract_id`: `PROD-D0-001`
- `diagnostic_id`: `PROD-D0-001`
- `contract_version`: `product-manager-d0-v01`
- `role_id`: `product-manager`
- `status`: `planned`
- `assessment_status`: `not_assessed`
- `execution_gate`: `blocked`
- `learner_id`: `pending_anonymous_learner`
- `external_actions`: forbidden

## 已收到的岗位交付

产品经理岗位已在独占目录提交五题诊断规格和合成夹具草稿：

- `employee-growth-mvp/product-manager/D0-diagnostic.md`
- `employee-growth-mvp/product-manager/D0-diagnostic.json`
- `employee-growth-mvp/product-manager/fixtures/fixtures.product-recommendation-v01.json`

这些文件只定义题目、预期观察、证据字段和隔离场景。没有学习者原始回答、学习者执行收据、内容复核或接收签收，因此不能形成能力结论，也不授予 L0、L1 或 L2。

## 当前门禁

1. **夹具尚未冻结。** 夹具仍为 `draft_not_frozen`，`fixture_sha256` 为 `pending_freeze`。冻结前不得执行五题、生成学习者证据或用其他岗位夹具替代。
2. **产品专业标准缺少显式版本号。** `product-creation-standard.md` 有日期和当前 SHA，但正文没有版本字段。内容审校/课程架构师须决定可复核的版本标识；在此之前 D0-02 只能标 `blocked`/`insufficient_evidence`。
3. **学习者归属尚未提供。** 匿名 `learner_id`、本人签名/时间戳、实际命令或操作、原始 stdout/stderr、退出码和输入/输出快照均未采集。代理规格、夹具和 QA 回放不能代替本人执行。
4. **独立复核有范围限制。** 测试工程师已对规格与夹具完成只读复核，结论为 `overall=not_met`；报告标记 `learner_execution=false`、`derived_by=QA`。课程/内容复核、学习者执行和接收签收仍未完成。随后新增的外部哈希清单仍是 `pending_freeze`，需再做一次 QA 复验后才能作为当前快照。

## 来源冻结清单

以下 SHA 是本轮读取到的完整文件快照，只用于绑定规格，不证明学习者能力或当前产品效果：

| source_id | 工作区路径 | 当前绑定 | 版本风险 |
|---|---|---|---|
| `ROLE-PM` | `sites/rolecraft/team/employees/core/product-manager/ROLE.md` | `56f932f3621b64469b3136ff3d1cafa3af900608f5c82947e33e0012ffd614c7` | 使用 hash-bound 标识 |
| `GROWTH-CURRICULUM` | `sites/rolecraft/team/employee-growth-curriculum.md` | `d9d56934223ea7e63be768c9f0eb765761ea7da18d81267c3e74fa7defc1c5aa` | 文件标 `employee-growth-v1.0` |
| `PRODUCT-CREATION-CURRICULUM` | `sites/rolecraft/team/product-creation-curriculum.md` | `495520a042239de9ed3ec7544c496f42052d9e0eaff53b2f8e9450e09e74b9fd` | 文件标教学草案 v0.1 |
| `PRODUCT-CREATION-STANDARD` | `sites/rolecraft/team/product-creation-standard.md` | `b57e4ee78b58773377c73088068e6b036c8c52d53a48382424de5bdbcfd609ff` | **正文无显式版本，待内容岗位处理** |
| `PRODUCT-STANDARD` | `sites/rolecraft/team/product-standard.md` | `76d0aac23a5573112967a01061b0ee97db3877ced58ec41f758d96ee439f4eb6` | 日期/文件快照绑定 |

D0-02 的来源定位必须使用完整工作区路径，并在 EvidenceCard 中写 `source_version`、`source_sha256`、稳定标题/段落定位和适用边界。文件名 basename 不足以排除 `dist` 副本。课程方法或标准文档不能写成当前用户价值实测；“点击量不能证明价值”若无额外来源，应标为学习者推断而不是来源原话。

外部哈希记录位于 `employee-growth-mvp/product-manager/fixtures/fixture-hashes-v01.json`，当前 SHA-256 为 `5df3fc43c3c92cacb408e5d45fd63ca6b57d631fc9a626805047f9ab54a3d4d5`，状态仍为 `pending_freeze`；它只绑定了当前文件字节哈希，规范化内容和来源快照哈希仍未冻结。

## 责任与下一步

| 动作 | 责任岗位 | 接收/复验条件 | 状态 |
|---|---|---|---|
| 复核并冻结合成夹具，记录完整文件 SHA 与规范化对象口径 | 产品经理 → 测试工程师 | normal/boundary/failure 三类及注入缺陷齐全；任何变更升版 | open |
| 为 `product-creation-standard.md` 提供可复核版本标识或记录有据缺口 | 课程架构师/内容审校员 | 路径、版本、SHA、标题/段落定位可重建 | blocked |
| 提交匿名 learner_id 和五项本人原始提交 | 学习者本人 | `learner_execution=true`、本人声明/时间戳、禁止数据与外部动作声明 | blocked |
| 独立复核原例、首失败/停止、修复、回归和留出 | 测试工程师 | QA 派生文件标 `derived_by=QA`，不得改标学习者证据 | blocked |
| 复核机制、来源和事实/假设/推断分类 | 课程架构师/内容审校员 | D0-02 每项来源可定位，未知保留 | blocked |
| 重建最小交接步骤并签收或有据拒收 | 项目经理/指定接收岗位 | 接收包含版本/hash、未验证项、停止线和复验顺序 | blocked |

现有 QA 规格门禁报告：`team/product-manager-d0-qa-v01.md/.json`。由于哈希清单在该报告之后新增且仍待冻结，当前 QA 报告需要一次只读复验；不能把旧报告自动继承为当前版本的最终门禁。

## 复验顺序与关账规则

执行后只能按以下顺序保留证据：原例 → 首失败/停止 → 修复版本 → 原例回归 → 受影响回归 → QA 未公开留出。不得覆盖首失败，不得把退出码 0 当作业务成功，不得用 QA 回放改写 `learner_execution`。

只有五项本人原始回答、隔离收据、独立 QA、内容/产品复核和 D0-03 接收签收齐全，项目经理才可以更新 D0 起点；在此之前结论保持 `not_assessed` 或具体路径的 `blocked`/`insufficient_evidence`。D0 结论不表示真实用户价值、职业胜任、行业先进或正式产品达标。

## 交付物自查

- 产品岗位交付没有写学习者答案，也没有宣布 QA 通过。
- 合成夹具仅包含虚构用户、教材、版本和数据，外部动作仍禁止。
- 题目覆盖 D0-01 至 D0-05；正常、边界、失败和跨岗混淆均有场景入口。
- 当前阻断、责任人、接收条件和复验顺序已登记；未完成项未被关闭。
