# AI生成工程师进阶方案 v0.3 独立 QA

- QA 编号：AI-ADV-TRAINING-QA-20261015-03
- 日期：2026-10-15（Asia/Shanghai）
- 审核岗位：测试工程师
- 范围：独立复核 v0.3 进阶方案及其 source-records 修复回归；不代学员执行训练、不修改作者文件、不授予 L1/L2。

## 输入

- `ai-generation-engineer-advancement-v03.json`，SHA-256 `7135891eb9bf38da3c23022b334e5179ed6b81587116dbaef7ccf1ea4fd82850`
- `ai-generation-engineer-advancement-v03.md`，SHA-256 `29fd15a70ba1d590f7e5b4ca347117ba4c61f0077f5d83dabf666f6676364986`
- `ai-generation-engineer-advancement-source-records-repair-v01.json`，修复记录 `AI-ADV-20261015-SR-001`
- v0.2 参照：JSON SHA-256 `0bdf99d6e679ec8755d0e79f29cf26e8df98b377d113a22f8c347d8bd9305f61`；QA-v02 JSON SHA-256 `（按收到文件核对，未改写）`

## 实际检查与结果

1. v0.3 JSON 在 Python 3.14.5 `json.loads` 下解析成功；顶层 `schema_version=v0.3`、`plan_id=AI-ADV-20261015-003` 与修复记录一致。
2. `source_records` 为非空数组，共 7 项；7/7 均为对象，且每项 `path`、`status` 均为非空字符串。修复前 v0.2 最后一项裸字符串的问题已关闭。
3. v0.2 与 v0.3 的 `practice_crosswalk` 深度比较相等；行数、实践 ID、阶段 B 转移 ID 与证据卡 ID保持一致。
4. `current_state` 仍为 `level=L0_guided`、`d0_decision=not_assessed`、`l1_decision=not_granted`、`production_permission=not_granted`；没有因修复来源形状而授予训练等级或生产权限。
5. 修复记录声明的首失败保留、未执行训练/外部动作与输入保护均与文件状态一致；未见应用、账户、用户数据或历史 QA 被改写的证据。

## 结论

`P2 closed`（仅 source_records 形状修复范围）。本次修复满足约定的独立回归条件，来源记录现可统一机器索引，crosswalk 未漂移，训练状态未被误提升。

本结论不等于训练执行或能力认证通过：D0、三项实训、未知迁移、真实模型/API、费用/延迟/限流、持久恢复、真人审批及接收签收仍为 `not_assessed` 或未验证；L1/L2 与生产权限继续未授予。后续如开始训练，必须按 v0.3 合同另行提交学习者原始证据、EvidenceCard、运行/失败/回归/留出和独立复核。
