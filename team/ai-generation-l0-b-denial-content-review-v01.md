# AI 生成工程师 L0 B-denial-transfer 内容审校 v0.1

## 范围与结论

本次独立内容审校只读核对 `ai-generation-l0-b-denial-transfer-v01` 的 README、主记录、EvidenceCard、manifest、实现夹具、拒绝收据、首失败收据及 holdout。重点检查租户边界、来源 scope、错误租户拒绝、非同构留出和限制措辞是否越过本地替身的证据范围。未修改学习者文件、教材、应用、账户数据或历史报告，不授 L1/L2、岗位等级或生产安全结论。

结论：**`reviewed_with_limitations`**。

材料一致地把结果限定为本地确定性夹具：A 对 A 的 `doc-A-refund-v2` 产生带来源绑定的草稿；A 请求 B 私有文档及 A 代表 requested tenant B 的请求均在生成前返回 `SOURCE_SCOPE_DENIED`，拒绝收据中的 `draft`、`handoff`、`external_action` 均为 `null`。`doc-B-private-v9` 改变 document id、版本和正文后仍被拒绝，支持拒绝决策不是写死单一文档字符串。manifest 的八项文件路径、bytes 与 SHA-256 均可解析并匹配实物；双次重放哈希相同。

## 核对结果

- **租户与来源边界：通过（本地范围）**。实现同时检查 actor/requested tenant 相等、文档 tenant 匹配和 `allow_read`；拒绝时不返回正文或来源位置，并记录 `unavailable://permission-denied`。
- **错误租户和来源 scope 拒绝：通过（本地范围）**。两条首失败收据均为 `SOURCE_SCOPE_DENIED`，且停止在草稿、handoff 和外部动作之前。
- **非同构留出：通过（本地范围）**。holdout 的文档 ID、source version、text 均变化，仍得到相同拒绝码；记录含 dynamic binding 标记和拒绝收据。
- **来源绑定基线：通过（本地范围）**。允许的 A 文档输出包含 document id、source version、location 和正文 hash；这证明本地收据结构具有来源绑定字段。
- **状态和限制措辞：通过**。README、主 JSON、EvidenceCard 明确无网络、真实模型/API、云、真实数据和生产权限系统，QA handoff 为 pending，self-signed=false，L1/L2 为 not_granted；没有把本地通过写成生产安全或权限认证。
- **工件可审计性：通过（静态范围）**。manifest 引用全部存在且哈希/字节数匹配；run-1/run-2 输出字节相同。
- **独立运行复验：未执行**。本岗只做内容和证据边界审校，不替代 QA/工程运行验证。

## 重要限制与后续

`retrieve_authorized_doc` 是进程内 Python 字典夹具；`allow_read`、租户身份和权限检查不是实际身份提供商、数据库行级安全、服务间授权或供应商来源 API。当前场景也没有证明 B 的合法读取路径、并发/恢复下拒绝仍成立、错误租户数据不会在日志/缓存中泄漏，或真实生成器在拒绝后绝不继续。因而本记录不能证明生产权限安全、跨租户隔离、保密性、真人审批/签收、真实模型行为或职业能力。QA 应独立重放成功、两类拒绝、非同构 holdout，并在后续真实集成中核对授权、日志、缓存、并发和恢复边界。

本审校结论只覆盖 v0.1 本地证据与措辞边界；`reviewed_with_limitations` 不授等级、生产发布或完整安全保证。
