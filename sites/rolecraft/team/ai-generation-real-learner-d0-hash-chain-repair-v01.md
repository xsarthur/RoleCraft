# AI 生成工程师 D0-03 fixture hash 链修复 v0.1

日期：2026-10-16（Asia/Shanghai）
诊断：`D0-AI-20261015-001`
责任岗位：测试工程师（QA 证据链修复）

## 发现

QA v02 使用的 `input-frozen.json` 是完整根对象，按 UTF-8、递归 `sort_keys`、紧凑 separators、无尾换行规范化后的 SHA-256 为：

`f6cc25edad6403c052f66167adecf666d770f12b82170f2fc996119ef118f446`

合同 fixture SHA `5dc9f33e3972dbff5118bc6977a66ccbd376bc6fcc54f15c9b1e26fda8db5e0` 对应同一文件的 `root["fixture"]` 子对象，使用完全相同的规范化规则。差异来自包装层，不是键顺序、编码或尾换行差异。完整根对象长度为 1388 bytes；fixture 子对象长度为 949 bytes。

## 修复口径

- 合同字段 `fixture_hash`：继续指向 `root.fixture`，保持既有 practice pack 合同和来源链。
- QA 字段 `input_frozen_hash`：指向完整 `input-frozen.json` 根对象。
- 两个哈希均保留，不相互覆盖；后续报告必须注明哈希对象路径。
- 原始学习者回答、D0 结论和历史 QA 文件不修改。

## 可复验命令

```python
json.dumps(obj, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
```

对完整根对象和 `root["fixture"]` 分别计算 SHA-256；不得把其中一个哈希写成另一个对象的哈希。

## 证据与边界

证据来源：D0-03 执行合同、QA v02 input-frozen 文件、SOURCE-001 fixture 与真实学习者原始回答记录。此修复只关闭 QA 哈希对象指向歧义，不证明学习者本人执行、答案质量、真实模型/API、生产权限/恢复、真人签收或职业能力。D0/L0 仍 `not_assessed`，L1/L2 仍 `not_granted`。
