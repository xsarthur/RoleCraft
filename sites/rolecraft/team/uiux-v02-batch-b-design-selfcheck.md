# UI/UX v0.2 设计师批次B自查

日期：2026-10-16。岗位：设计师；范围：第05–08章四张独立SVG资产。

## 交付

- `textbooks/uiux-design-v02/assets/v02-batch-b-05-domain-ia.svg`：领域对象、关系与导航边界。
- `textbooks/uiux-design-v02/assets/v02-batch-b-06-task-recovery.svg`：任务快照、批量结果、按原因恢复。
- `textbooks/uiux-design-v02/assets/v02-batch-b-07-state-contract.svg`：界面/批准/运输/效果四维状态与请求身份守卫。
- `textbooks/uiux-design-v02/assets/v02-batch-b-08-fidelity-compare.svg`：结构线框、状态原型、视觉/实现的证据边界。

每张图包含 `title`、`desc`、`role="img"`、`aria-labelledby`，并以可读文字表达关键对象、动作、边界和来源字段；底部显式标注“教学构造·未验证”。未修改正文、旧资产、应用或数据库。

## 证据

- `xmllint --noout sites/rolecraft/textbooks/uiux-design-v02/assets/v02-batch-b-*.svg`：通过。
- 四文件尺寸均为 1600×1000，viewBox 与画布一致；SVG 文本包含章节 ID、资产 ID、来源类型与验证状态。
- 当前环境未提供 SVG 渲染器，因此未声明浏览器/PNG布局、字体回退、窄屏、键盘、读屏或真实用户理解已验证。独立QA需按当前版本渲染复核。

## 边界

图示为静态教学构造：对象关系不是数据库或权限证据；状态箭头不是原子事务；模拟回执不证明外部效果、幂等、并发隔离或生产接口；保真阶段不替代真实辅助技术检查。四张图需由独立QA逐图核对渲染与正文映射后，才能形成当前版本的视觉验收结论。
