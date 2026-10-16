# AI生成工程师 L0 学习者原始证据 v0.3

诊断 ID `D0-AI-20261015-001`。仅本地确定性 fixture；QA pending，self_signed=false，external_action=null，L1/L2 not_granted。

D0-03 canonical fixture 为 `F-AI-SOURCE-CLAIM-v1` / `doc-A-refund-v1`，完整 SHA-256：`5dc9f33e3972dbff5118bc6977a66ccbd376bc6fcc54f15c9b1e26fda8db5e0`，与 JSON、SOURCE-001、manifest 一致。B 租户拒绝路径本轮未验证，明确不计为通过。

D6 的本地收据见 `u-ai-l0-001/execution_log.json`：fixture-only，CPU 1.84ms，p95 1.89ms，质量阈值为 schema/source completeness 100%，命令与输入/输出哈希均记录。仅当质量低于100%或p95超过2ms时停线；切换真实供应商还需预算、脱敏和QA批准。

U-AI-L0-001 已执行，命令、日志、输入/输出哈希见 `execution_log.json`。保留 baseline、first_failure、regression、holdout；首失败进入 recovery_required 并停止下游生成，留出超过重试预算即停止。真实进程恢复、真实模型/API、生产RPO/RTO仍未测。

manifest.json 登记 learner_raw、D6/U工件的 path、bytes、SHA-256。等待独立 QA 与内容审校。
