# Consolidated Learner Handoff v0.12

A normal 的真实 stdout 保存于 `A-stdout.txt`，固定命令为 `python3 -c print("DEMO-42 draft A")`，hash 覆盖原始 stdout bytes；A-receipt 与 manifest 绑定 stdout path/bytes/SHA/status/draft/source_refs。

D0-04 真实生成 tool_input/output、checkpoint before/after、failure/recovery event JSON，均有实际 bytes/SHA、idempotency_key 与 side_effect。D0-05 四状态矩阵逐项引用这些实际路径和值。所有路径相对 v12，manifest 自引用 bytes/SHA 为 null。状态保持 pending/not_assessed/not_granted。
