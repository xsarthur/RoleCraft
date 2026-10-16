# AI生成工程师 D0-03 哈希链修复独立 QA v0.3

- QA record: `AI-REAL-LEARNER-D0-EXEC-QA-20261016-003`
- Repair: `AI-REAL-LEARNER-D0-HASH-20261016-001`
- Contract: `AI-REAL-LEARNER-D0-EXEC-20261016-001`
- Decision: **`met_with_limitations`**
- Scope: D0-03 本地隔离确定性 QA 回放及哈希对象指向复验。

## 独立复验结论

修复口径正确：合同的 `fixture_sha256` 指向 `root.fixture`，哈希为
`5dc9f33e3972dbff5118bc6977a66ccbd376bc6fcc54f15c9b1e26fda8db5e0`；QA 的
`input_sha256` 指向完整 `input-frozen.json` 根对象，哈希为
`f6cc25edad6403c052f66167adecf666d770f12b82170f2fc996119ef118f446`。两者均使用 UTF-8、递归 `sort_keys`、紧凑 separators、无尾换行规范化；长度分别为 949 和 1388 bytes。未发现把一个对象的哈希误写为另一个对象哈希。

四场景在 run-1/run-2 均满足合同：A 绑定两条 A v2 claim、保留 unknown、无外部动作；B 首失败 `SOURCE_SCOPE_DENIED` 且 B 正文未进入输出/缓存/上下文；source-missing 首失败 `SOURCE_MISSING`；source-conflict 首失败 `SOURCE_VERSION_MISMATCH`；后三者均在 draft 前停止。四场景 JSON 均逐字节一致。

run-1/run-2 输出 SHA 分别为：A `a310a0bb7f4926393456b0ddd9abbd1d1737f0ec02ded39782730bfe051b2183`、B `5f2365a4b9f348709b90daf7504c2ddf0fa7bbccc005165121ab776d2dc3c1f9`、missing `4a217cbb921688cef819c52e98f4bbc872ed9db72a7918d1069ab06ce2a80897`、conflict `988c9bcecf929f7ebe2ff03836cfd9ede87654450fd3cb4fde6a2df3ae881c09`，每组 run-1/run-2 相同。收据 stdout/stderr SHA 也与 SHA256SUMS 一致：run-1 stdout `7f2a4be3f9c7a6cb84b8030ff12aa97fd5762fe65938df5c6e434e6cb5538e91`、stderr `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`；run-2 stdout `b63d73b8f33d26027de36aa2d44ad2a1f9f6fe5ed7e5247fcbfc6a5217fdf204`、stderr 同上。

holdout 修改 `document_id/source_version/text`，输出哈希 `478d4459cd21254d384c2f56dfb17bf9106cd406c64ba65acc8e8fc684fcaccc`，动态绑定和人工复核标记保留。

## 学习者边界与等级

原始学习者回答 `ai-generation-real-learner-d0-20261016-v01.md` 及其哈希保持不变；原记录仍 `not_assessed`、`self_signed=false`、未提供本人入口和本人 stdout/stderr。上述证据全部是 QA 回放，不能计为学习者本人执行。网络、真实模型/API、云、付费服务、真实用户数据和外部动作均关闭。

D0 仍 `not_assessed`，L0 仍为既有 `L0_guided`/未授能力结论，L1/L2 仍 `not_granted`；本报告不改变这些状态。未验证真实供应商来源 API、真实模型忠实度、生产权限、缓存并发恢复、真人签收及职业能力。

