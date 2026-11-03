# 职造 · 产品交付底线索引

真源：[`PRODUCT_FLOOR.md`](../PRODUCT_FLOOR.md)（**v1.0 已冻结（待合入）**；尚未作为生产已发版）。

| 文件 | 用途 |
|---|---|
| [../PRODUCT_FLOOR.md](../PRODUCT_FLOOR.md) | P0 真源（43 条可观察 Pass/Fail） |
| [CHECKLIST-design.md](./CHECKLIST-design.md) | 设计高频 P0（遮挡、窄屏、图达、焦点非 debug、诚实 pending） |
| [CHECKLIST-qa.md](./CHECKLIST-qa.md) | QA 高频 P0、证据最低要求、邻近回归 |
| [CHECKLIST-eng.md](./CHECKLIST-eng.md) | 工程高频 P0（范围、pending 不建会话、部署保留配置、无 debug） |

## 门禁

**任一 P0 Fail → 禁止合入生产。缺证据 = Block。岗责切片不是豁免。**

双门：设计走读 → QA 抽检 → 决策板。决策板之前不合入、不部署。

来源：共创 Page + Sheng 于 2026-11-03（Asia/Shanghai）冻结 Step2（43 条全进硬门禁；暂不升 P1）。

本目录只收文档。不包含 PR #16 回滚、PR #17，也不改应用代码。
