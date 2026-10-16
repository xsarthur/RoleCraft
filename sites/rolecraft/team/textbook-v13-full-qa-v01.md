# Agent 教材 v13 全套 QA（独立文件与结构核验）

日期：2026-10-16（Asia/Shanghai）  
责任岗位：测试工程师  
范围：`sites/rolecraft/textbooks/v13/` 规格列出的 30 个阅读单元及其本地图片资产。

## 结论

**`met_with_findings`：30/30 单元文件存在，所有 Markdown 图片引用可达，`<details>` 标签成对；但当前不能交付部署。** 本次文件级核验发现 11 个不可达相对链接、7 个超过 10 行且未放在折叠中的非 Mermaid 代码块，以及 9 个 Mermaid 代码块未找到明确文字降级说明。

这些是可修复缺陷，不代表正文机制已经审校通过。正文、图稿和应用渲染需由对应责任人修复后重新复验。

## 覆盖与结构

| # | 单元 | 正文 | 图片数 | 缺图 | 折叠标签 | 长非 Mermaid 代码（未折叠） | Mermaid |
|---:|---|---|---:|---:|---:|---:|---:|
| 1 | `00-learning-route.md` | 存在 | 3 | 0 | 0/0 | 0 | 0 |
| 2 | `01-foundation.md` | 存在 | 1 | 0 | 1/1 | 0 | 0 |
| 3 | `n01-python-model-foundations.md` | 存在 | 1 | 0 | 3/3 | 0 | 0 |
| 4 | `p01-discovery.md` | 存在 | 1 | 0 | 1/1 | 0 | 0 |
| 5 | `02-task-acceptance.md` | 存在 | 2 | 0 | 1/1 | 0 | 2 |
| 6 | `03-trust-boundary.md` | 存在 | 2 | 0 | 0/0 | 0 | 2 |
| 7 | `f01.md` | 存在 | 2 | 0 | 1/1 | 0 | 0 |
| 8 | `f02.md` | 存在 | 2 | 0 | 1/1 | 0 | 0 |
| 9 | `n02-context-memory-prompt.md` | 存在 | 2 | 0 | 0/0 | 0 | 0 |
| 10 | `c01-selection.md` | 存在 | 1 | 0 | 0/0 | 0 | 1 |
| 11 | `c01-control-primer.md` | 存在 | 1 | 0 | 0/0 | 0 | 1 |
| 12 | `c02.md` | 存在 | 1 | 0 | 1/1 | 0 | 0 |
| 13 | `c03.md` | 存在 | 1 | 0 | 4/4 | 0 | 0 |
| 14 | `n04-tools-mcp.md` | 存在 | 2 | 0 | 0/0 | 0 | 0 |
| 15 | `e01.md` | 存在 | 1 | 0 | 1/1 | 0 | 1 |
| 16 | `c01-fixed-workflow.md` | 存在 | 1 | 0 | 1/1 | 0 | 1 |
| 17 | `c01-control-loop.md` | 存在 | 2 | 0 | 0/0 | 6 | 1 |
| 18 | `n03-planning-reflection.md` | 存在 | 2 | 0 | 0/0 | 0 | 0 |
| 19 | `n05-retrieval-ingestion.md` | 存在 | 2 | 0 | 1/1 | 0 | 0 |
| 20 | `n06-graph-orchestration.md` | 存在 | 2 | 0 | 0/0 | 0 | 0 |
| 21 | `n07-multiagent-a2a.md` | 存在 | 2 | 0 | 2/2 | 0 | 0 |
| 22 | `e02.md` | 存在 | 2 | 0 | 2/2 | 0 | 0 |
| 23 | `n10-evaluation-projects.md` | 存在 | 2 | 0 | 0/0 | 0 | 0 |
| 24 | `p01-mvp.md` | 存在 | 2 | 0 | 1/1 | 0 | 0 |
| 25 | `e03.md` | 存在 | 1 | 0 | 0/0 | 1 | 1 |
| 26 | `n08-sandbox-security.md` | 存在 | 2 | 0 | 0/0 | 0 | 0 |
| 27 | `e04.md` | 存在 | 1 | 0 | 1/1 | 0 | 1 |
| 28 | `e05.md` | 存在 | 2 | 0 | 2/2 | 0 | 0 |
| 29 | `n09-runtime-delivery.md` | 存在 | 2 | 0 | 0/0 | 0 | 0 |
| 30 | `p02.md` | 存在 | 2 | 0 | 1/1 | 0 | 0 |

## 缺陷清单

- **相对链接不可达：`00-learning-route.md`**：`README.md`。需要作者或构建岗补齐目标文件/锚点后复验。
- **Mermaid 降级说明未检出：`02-task-acceptance.md`**。需补充邻近的文字替代或脚本不可用说明；静态 SVG/PNG 存在不能替代文字降级。
- **Mermaid 降级说明未检出：`03-trust-boundary.md`**。需补充邻近的文字替代或脚本不可用说明；静态 SVG/PNG 存在不能替代文字降级。
- **相对链接不可达：`n02-context-memory-prompt.md`**：`examples/n02-memory-routing.py`。需要作者或构建岗补齐目标文件/锚点后复验。
- **Mermaid 降级说明未检出：`c01-selection.md`**。需补充邻近的文字替代或脚本不可用说明；静态 SVG/PNG 存在不能替代文字降级。
- **Mermaid 降级说明未检出：`c01-control-primer.md`**。需补充邻近的文字替代或脚本不可用说明；静态 SVG/PNG 存在不能替代文字降级。
- **相对链接不可达：`n04-tools-mcp.md`**：`examples/n04-tool-catalog.py`。需要作者或构建岗补齐目标文件/锚点后复验。
- **Mermaid 降级说明未检出：`e01.md`**。需补充邻近的文字替代或脚本不可用说明；静态 SVG/PNG 存在不能替代文字降级。
- **Mermaid 降级说明未检出：`c01-fixed-workflow.md`**。需补充邻近的文字替代或脚本不可用说明；静态 SVG/PNG 存在不能替代文字降级。
- **长代码未折叠：`c01-control-loop.md`**：6 个（起始行：104, 233, 344, 413, 582, 659）。按跨端合同，11 行及以上默认收起；产品/设计/开发/测试需同步处理。
- **Mermaid 降级说明未检出：`c01-control-loop.md`**。需补充邻近的文字替代或脚本不可用说明；静态 SVG/PNG 存在不能替代文字降级。
- **相对链接不可达：`n03-planning-reflection.md`**：`examples/n03-plan-execution.py`。需要作者或构建岗补齐目标文件/锚点后复验。
- **相对链接不可达：`n05-retrieval-ingestion.md`**：`examples/n05-index-lifecycle.py`。需要作者或构建岗补齐目标文件/锚点后复验。
- **相对链接不可达：`n06-graph-orchestration.md`**：`examples/n06-graph.py`、`examples/n06-graph-contracts.py`。需要作者或构建岗补齐目标文件/锚点后复验。
- **相对链接不可达：`n07-multiagent-a2a.md`**：`examples/n07-delegation.py`。需要作者或构建岗补齐目标文件/锚点后复验。
- **相对链接不可达：`n10-evaluation-projects.md`**：`examples/n10-evaluation-matrix.py`。需要作者或构建岗补齐目标文件/锚点后复验。
- **长代码未折叠：`e03.md`**：1 个（起始行：97）。按跨端合同，11 行及以上默认收起；产品/设计/开发/测试需同步处理。
- **Mermaid 降级说明未检出：`e03.md`**。需补充邻近的文字替代或脚本不可用说明；静态 SVG/PNG 存在不能替代文字降级。
- **相对链接不可达：`n08-sandbox-security.md`**：`examples/n08-sandbox-policy.py`。需要作者或构建岗补齐目标文件/锚点后复验。
- **Mermaid 降级说明未检出：`e04.md`**。需补充邻近的文字替代或脚本不可用说明；静态 SVG/PNG 存在不能替代文字降级。
- **相对链接不可达：`n09-runtime-delivery.md`**：`examples/n09-runtime-recovery.py`、`examples/n09-runtime-recovery.py`、`examples/n09-memory-diagnostic.py`。需要作者或构建岗补齐目标文件/锚点后复验。
- **相对链接不可达：`p02.md`**：`README.md`、`README.md`。需要作者或构建岗补齐目标文件/锚点后复验。

## 版本隔离与证据边界

- v13 读取范围为 30 个规格单元；QA 未改写 v13 正文、图片或 v12 文件。
- 本报告 JSON 记录了 v12 当前 32 个 Markdown 文件的字节数与 SHA256 快照；工作区没有本轮起始全量快照，因此不能把“当前快照”扩大解释为历史起止一致证明。
- 未执行浏览器渲染、窄屏布局、键盘/读屏、脚本不可用降级、Mermaid 实际渲染、代码示例、外部接口、模型调用或真人阅读测试。
- 仅文件与结构证据通过，不推导教材内容正确性、真实学习效果、职业能力、产品部署或行业先进性。

## 复验条件

1. 作者/内容岗补齐 11 个不可达链接并确认链接语义。
2. 作者与产品/设计/开发按跨端合同为长代码补齐折叠摘要和可用交互。
3. 作者为 9 个 Mermaid 单元补文字降级；设计/开发再验证 SVG/PNG 与窄屏布局。
4. 修复后重新执行本 QA，并另由浏览器/无障碍/真人岗位提供相应证据。

机器明细见 [`textbook-v13-full-qa-v01.json`](textbook-v13-full-qa-v01.json)。
