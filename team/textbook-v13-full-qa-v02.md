# Agent 教材 v13 全套 QA v02（v01 修复复验）

日期：2026-10-16（Asia/Shanghai）  
责任岗位：测试工程师  
范围：依据 `textbook-v13-full-qa-v01.md/.json`，只读复验 `sites/rolecraft/textbooks/v13/` 的 30 篇正文及其图片资产；核对 v12 未改动。未修改正文、图片、应用或数据库。

## 结论

**修复项静态复验：`met_within_scope`。** v01 列出的 11 组不可达相对链接、7 个未折叠长非 Mermaid 代码块和 9 个 Mermaid 文字降级缺陷均已关闭；30/30 正文仍存在，正文图片引用全部可达，v12 的 32 个 Markdown 文件与 v01 快照完全一致。

**版本绑定仍有缺口：`not_met`。** `textbooks/v13/assembly-manifest.json` 仍保留修复前 9 篇正文的哈希/行数，且当前资产目录为 63 个文件而 manifest 登记 62 个。因此不能把当前 manifest 当作修复后完整冻结证明，需要组装/开发岗位重新生成或明确更新清单后再做绑定复验。

## 复验结果

| 检查 | 结果 | 证据 |
|---|---|---|
| 30 篇规格正文存在 | pass | manifest `chapters` 仍登记 30 篇，逐文件可读 |
| v01 的 11 组不可达链接 | pass | 当前相对链接逐项解析，无不可达目标；新增 `README.md` 与 `examples/*.py` 均在 v13 内 |
| v01 的 7 个长代码块 | pass | `c01-control-loop.md` 的 6 块及 `e03.md` 的 1 块均有成对 `<details>`/`</details>` 和摘要；代码保留，摘要注明语言、行数、上下文和未运行状态 |
| v01 的 9 个 Mermaid 文字降级单元 | pass | `02-task-acceptance`、`03-trust-boundary`、`c01-selection`、`c01-control-primer`、`e01`、`c01-fixed-workflow`、`c01-control-loop`、`e03`、`e04` 均在 Mermaid 附近包含“图像或脚本不可用时”的文字顺序/条件说明 |
| 正文图片资产 | pass（静态） | 当前正文图片引用 50 个，全部解析到 `textbooks/v13/assets/`；无缺图 |
| v12 未改动 | pass | v01 记录的 32 个 v12 Markdown 文件逐一比较字节数和 SHA256，32/32 一致 |
| v13 manifest 修复后绑定 | not_met | 9 篇正文与 manifest 的哈希/行数不一致；当前资产 63 个，manifest 仍登记 62 个 |

## 逐项证据

链接复验覆盖 v01 的全部 11 组：`00-learning-route.md` 的 `README.md`；`n02-context-memory-prompt.md`、`n04-tools-mcp.md`、`n03-planning-reflection.md`、`n05-retrieval-ingestion.md`、`n06-graph-orchestration.md`（两例）、`n07-multiagent-a2a.md`、`n10-evaluation-projects.md`、`n08-sandbox-security.md`、`n09-runtime-delivery.md`（两例）以及 `p02.md` 的 `README.md` 引用均已找到目标。`n09` 与 `p02` 的重复引用也已逐个解析。

指定的 7 个折叠块当前起始位置已因插入说明发生行号移动，但结构复验通过：`c01-control-loop.md` 中为 96、11、32、152、64、60 行的 TypeScript/text/Python 块，`e03.md` 中为 193 行 Python 块；每块均处于 details 深度 1，关闭标签成对。该项只证明源文件结构，不证明浏览器中的默认展开/收起交互。

9 个 Mermaid 单元共 11 个 Mermaid 围栏均保留源码，并在图附近提供文字降级。文字说明包含节点/顺序、停止或拒绝条件及“图像或脚本不可用”边界；不把静态图片或 Mermaid 源码当作真实运行证据。

## 未验证与证据边界

- 未执行浏览器真实渲染、窄屏布局（包括 320px）、字体回退、图片裁切或 Mermaid 图形渲染。
- 未执行键盘操作、焦点顺序、读屏对 `details/summary`、图片替代文本或放大控件的验证。
- 未做脚本禁用或静态 file 页面行为验证；本次文字降级仅为源文件邻近文本证据。
- 未运行 30 篇中的代码示例，未验证外部接口、模型调用或供应商契约。
- 未做真人阅读、学习迁移、专家审核、职业能力或行业先进性验证。
- 当前应用仍需按渲染 QA 记录确认是否接入 v13；本报告不把隔离正文静态通过扩大为产品接入通过。

## 后续责任与复验条件

由组装/软件工程岗位更新 v13 manifest，使 30 篇修复后正文哈希、行数和当前 63 个资产清单一致，并保留本次旧清单差异记录；随后测试工程师重新核对 manifest 与正文。浏览器、窄屏、键盘/读屏、真实 Mermaid/图片呈现和真人理解证据分别交由对应岗位提供，不能由本报告的静态通过结论替代。

机器明细见 [`textbook-v13-full-qa-v02.json`](textbook-v13-full-qa-v02.json)。
