# D0 学习者执行收据 QA v01

- **岗位**：测试工程师
- **结论**：`met_with_limitations`
- **复核范围**：`ai-generation-real-learner-d0-execution-learner-receipts/` 与 `ai-generation-real-learner-d0-execution-learner-signoff-v01.txt`
- **写入边界**：仅新增本 QA 报告，未修改收据。

## 已通过的核对

- 29 个载荷文件的 `BYTES` 逐条匹配实际字节数；无缺失、额外或不一致。
- `SHA256SUMS` 逐条校验 29/29 通过。
- 四个场景（A-normal、B-tenant-denied、source-missing、source-conflict）各执行两轮；每轮均有 stdout/stderr，8/8 退出码为 0。
- A 场景两条事实均绑定 `doc-A-refund-v2` 的来源、版本和内容哈希，并保留未知项。
- B 场景首失败为 `SOURCE_SCOPE_DENIED`，停止生成，未产生 B 正文来源声明。
- 缺失源和版本冲突分别以 `SOURCE_MISSING`、`SOURCE_VERSION_MISMATCH` 首失败，并在草稿前停止；`external_action=null`。
- 四个场景两轮 stdout/stderr 均逐字节一致。

## 签收与限制

签收声明支持“学习者本人执行并提交收据”；姓名或内部标识未提供。

QA 未读取收据目录外的冻结输入、回放目标或其哈希依据，因而不能独立证明目录外输入/回放链 provenance。本报告核对的是本地收据与签收声明，不等同于真实外部模型服务、生产运行或学习效果验证。

后续如需身份可追溯性，补充姓名或内部标识后单独复核；原收据保持不变。
