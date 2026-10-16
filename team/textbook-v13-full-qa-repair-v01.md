# Agent 教材 v13 全套 QA 修复记录

日期：2026-10-16（Asia/Shanghai）  
责任岗位：教材研发员（依据 `textbook-v13-full-qa-v01.md/.json` 修复）  
范围：仅 `sites/rolecraft/textbooks/v13/`，未修改 v12。

## 已修复

1. **11 组不可达相对链接**
   - 在 v13 内补齐 `examples/` 中被章节引用的离线示例：n02、n03、n04、n05、n06 两例、n07、n08、n09 两例、n10。
   - 新增 v13 `examples/README.md`，说明示例的版本边界、离线性质和未验证范围。
   - 新增 v13 `README.md`，使 `00-learning-route.md` 与 `p02.md` 的目录链接可达，并明确 v13 是优化试读版；未把 v12 目录或验证结论改写成 v13 结论。

2. **7 个长非 Mermaid 代码块**
   - `c01-control-loop.md` 的 6 个长代码块和 `e03.md` 的 1 个长 Python 代码块均包入 `<details>`。
   - 每个摘要包含用途/章节上下文、语言、行数和“未运行”状态；代码正文、关键输入输出和边界说明未删除。
   - Mermaid 块未折叠，保持可读的文字降级路径。

3. **9 个 Mermaid 单元的文字降级**
   - 在 `02-task-acceptance.md`、`03-trust-boundary.md`、`c01-selection.md`、`c01-control-primer.md`、`e01.md`、`c01-fixed-workflow.md`、`c01-control-loop.md`、`e03.md`、`e04.md` 的 Mermaid 图相邻位置补充“图像或脚本不可用时”的文字顺序、节点关系和停止/拒绝条件。
   - 文字说明不把静态图或 Mermaid 当作真实运行证据。

## 修复后检查

- 章节内相对链接均能解析到 v13 文件或 v13 `examples/` 文件。
- `c01-control-loop.md`：6/6 长非 Mermaid 代码块已折叠，`<details>` 与 `</details>` 成对。
- `e03.md`：1/1 长非 Mermaid 代码块已折叠，`<details>` 与 `</details>` 成对。
- 9 个 Mermaid 单元均存在明确的文字降级说明。

## 证据边界

本记录只证明文件结构、链接可达性、折叠标记和文字降级文本已补齐。未执行浏览器渲染、窄屏布局、键盘/读屏、脚本不可用的真实页面行为、Mermaid 实际渲染、代码运行、外部接口、模型调用或真人阅读测试。v13 仍不能据此声明整套教材内容正确、产品部署完成或职业能力达标。
