# Agent 教材 v13 全套 QA v03（manifest v02 独立复验）

日期：2026-10-16（Asia/Shanghai）  
责任岗位：测试工程师  
前置报告：`textbook-v13-full-qa-v02.md/.json`  
范围：只读核对重建后的 `sites/rolecraft/textbooks/v13/assembly-manifest.json` 与当前磁盘；不修改正文、图片、应用或数据库。

## 结论

**manifest 与当前磁盘一致：`met_within_scope`。** manifest v02 声明 30 篇正文、62 个资产，contentSetSha256 为 `8580eba3ee39132c83c3744792e6ea62a86f9f30df6916fdc83939601487b704`。逐项比较结果为：30/30 正文路径存在且 SHA256/行数一致；62/62 资产存在且 SHA256/字节数一致；图片引用 0 断裂；manifest 的验证字段与实际结果一致。

此前 v02 报告中记录“当前资产 63 个”的口径来自 `ls -1 assets` 的目录项计数，其中包含一个名为 `preview` 的目录。按资产文件计数，当前为 62 个普通文件，与 manifest v02 一致；`preview` 不是遗漏或额外资产文件。

## 独立复验

| 项目 | 结果 | 证据 |
|---|---|---|
| 正文清单 | pass | manifest `chapterCount=30`，30 个路径逐一存在 |
| 正文哈希与行数 | pass | 30/30 与 manifest `sha256`、`lineCount` 一致 |
| 资产清单 | pass | manifest `assetCount=62`，62 个资产路径逐一存在 |
| 资产哈希与字节数 | pass | 62/62 与 manifest `sha256`、`bytes` 一致 |
| 正文图片引用 | pass | `brokenImageRefs=[]`；逐引用解析无缺失 |
| 内容集合哈希 | pass | manifest 当前值为 `8580eba3…`，保留完整值于本报告结论 |
| 版本隔离字段 | pass（manifest声明） | `v12RuntimeMutated=false`、`accountDatabaseMutated=false`、`deploymentPerformed=false` |

## 仍然未验证

本次只复验 manifest 与磁盘绑定，不新增浏览器真实渲染、窄屏布局、键盘/读屏、脚本禁用、Mermaid 实际渲染、代码执行、外部接口、模型调用、真人阅读或学习迁移证据。v02 中已关闭的 11 组链接、7 个长代码 details、9 个 Mermaid 文字降级仍以 v02 静态复验结论为准；完整产品与职业能力目标继续不等同于此项 manifest 通过。
