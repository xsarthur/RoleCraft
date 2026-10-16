# 项目经理长期记忆条目格式

## 必填字段

| 字段 | 要求 |
| --- | --- |
| `id` | 稳定唯一标识，例如 `PMO-MEM-0001`；替代旧条目时保留旧 ID 和关系。 |
| `title` | 简短描述协调偏好或协作约定，不把推测写成事实。 |
| `statement` | 可执行、可观察的偏好或约定；区分用户偏好和项目规则。 |
| `kind` | `coordination-style`、`handoff-format`、`evidence-threshold`、`change-control`、`delegation-style` 或 `reporting-style`。 |
| `evidence` | 用户原话、明确决策、重复项目记录或可定位的独立证据。 |
| `scope` | 适用的项目类型、岗位组合、阶段和限制；跨项目必须写清条件。 |
| `confidence` | `confirmed`、`strong`、`tentative` 或 `unknown`。 |
| `confirmation_status` | `user_confirmed`、`awaiting_user`、`inferred`、`superseded` 或 `rejected`。 |
| `version` | 语义版本，例如 `1.0.0`；内容变化时递增。 |
| `recorded_at` | 首次写入日期。 |

## 推荐字段

- `constraints`：例外、依赖、禁止事项和需要重新确认的条件。
- `non_inferences`：明确没有从证据推导出的相邻偏好。
- `last_reviewed_at`：最近复核日期。
- `related_projects`：证据所在项目；项目名称不等于跨项目推广授权。
- `supersedes`：被本条目替代的旧条目标识。
- `change_log`：版本、变更原因、证据和确认来源。

## 升级规则

1. 新观察先写入当前项目交接或 `memory-proposals/`，状态为 `awaiting_user` 或 `inferred`。
2. 用户明确确认时，记录原话和日期，可升级为 `user_confirmed`。
3. 多个项目的一致证据可以提高置信度，但不能替代用户确认对个人偏好的授权。
4. 记忆冲突时创建新版本或新条目，标记旧条目 `superseded`，不得静默覆盖。
5. 任何记忆都不能改变 AGENTS.md 的岗位边界、用户授权、产品门槛或独立测试职责。

## Markdown 模板

```markdown
### PMO-MEM-XXXX — 标题

- **偏好/约定**：
- **类型**：`coordination-style`
- **证据**：来源、日期、可定位记录
- **范围**：
- **限制**：
- **未作出的推断**：
- **置信度**：`tentative`
- **确认状态**：`awaiting_user`
- **版本**：`0.1.0`
- **记录日期**：YYYY-MM-DD
- **最近复核**：YYYY-MM-DD
- **关联项目**：
- **替代条目**：
- **变更记录**：
```
