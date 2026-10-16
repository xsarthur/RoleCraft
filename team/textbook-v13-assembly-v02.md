# Agent 教材 v13 隔离预览组装复核 v02

日期：2026-10-16（Asia/Shanghai）  
责任岗位：软件工程师  
状态：`isolated_preview_only`

## 复核原因

QA v02 指出上一版 manifest 使用了修复前的 9 篇正文哈希/行数，并提示资产数量发生变化。本次按当前磁盘内容重新扫描 30 篇正文与 `assets/`，覆盖 manifest 中的正文记录与资产哈希。

## 当前结果

- 正文单元：**30**。
- 当前 `assets/` 文件：**62**。本次扫描实际得到 62 个文件；与 QA 提示的 63 个资产计数存在 1 个文件的计数差异，未凭空补记，需 PM/QA 指定缺失文件后再更新。
- 缺失正文：**0**。
- 断裂图片引用：**0**。
- 当前 contentSetSha256：`8580eba3ee39132c83c3744792e6ea62a86f9f30df6916fdc83939601487b704`。
- manifest 修订标记：`v02`。
- v12 正式语料、运行时入口、账户和数据库未修改；未执行部署。

## 本次发现的正文变更

以下 9 篇相较上一版组装记录的哈希或行数已更新，当前值以 manifest 为准：

- `02-task-acceptance.md`：161 行，SHA-256 `0ce1fda0c37b9aca0e84930c649fff000c9d59e9a7d45db1fc75387a41313dc4`。
- `03-trust-boundary.md`：131 行，SHA-256 `192aa0e59c71d04b66af3541c04b07c5bca84fc89336bf53a3f96cb56b0e093f`。
- `c01-selection.md`：179 行，SHA-256 `8c855a17b829681e0db27ee95b54a949eb631e8ef9477cd34aee2a9307ca0998`。
- `c01-control-primer.md`：82 行，SHA-256 `466f55ac221c6b6a2e9b1e80d1b795558446d23bb70bdde968c09e2de23c35d8`。
- `e01.md`：443 行，SHA-256 `864ad89d03d524cce11e4148e1beae093af428ac8f6a0170ee67eca27fa898ff`。
- `c01-fixed-workflow.md`：226 行，SHA-256 `9ca3f52939b3e9e8acbe0eb5b5f08f84db8463005365692717e9cfe63d9e33dd`。
- `c01-control-loop.md`：1027 行，SHA-256 `4daae1bd5f037129b84c927c7c69d7df9993886d1fda2e6cdc736c4a0bd31fc4`。
- `e03.md`：354 行，SHA-256 `07e89c7bdad3a161588c8df95e3cf69951812cdeb03f577279c8304b6ed82fde`。
- `e04.md`：257 行，SHA-256 `cd63c856973e2d9a5b0662439baa28174e6fdf446389f9d0174a67c9bc3fed8a`。

## 复核证据

- manifest：[`textbooks/v13/assembly-manifest.json`](../textbooks/v13/assembly-manifest.json)。
- 正文顺序仍按 v12 的 30 单元顺序登记；v13 仅作为隔离预览输入。
- 图片引用逐篇重新解析，当前全部可解析。
- 当前统计脚本将 `assets/` 下实际文件作为资产；空的 `assets/preview/` 目录不计为文件。

## 后续交接

项目经理需要协调 QA 确认多出的第 63 个资产文件路径或计数口径。收到明确路径后，只更新 manifest 和本复核记录，不修改 v12 或正式入口。产品、设计、开发、内容审校和测试的部署前验收仍未由本组装记录代替。
