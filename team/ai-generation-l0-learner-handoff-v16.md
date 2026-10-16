# Consolidated Learner Handoff v0.16

实际重跑命令：`cd /private/tmp/ai-generation-l0-learner-handoff-v16 && python3 run_bundle.py && python3 -m json.tool manifest.json`，校验通过。

脚本独立写入 `d0-05/holdout-input.json`、`d0-05/holdout-output.json` 与 `d0-05/holdout.json`，内容为 returns-v9 fixture（`doc-A-returns-v9`、`source_version=v9`、`text=returns policy`），不复制 first_failure；三者均纳入 manifest，记录 path/bytes/SHA。D0-05 EvidenceCard 仅绑定自身 matrix、holdout 与断言工件。

manifest/EvidenceCard 状态保持 QA pending、human receipt pending、`self_signed=false`、`external_action=null`、L0/D0 `not_assessed`、L1/L2 `not_granted`。仅本地确定性重跑，未调用真实模型/API/云/付费服务或生产环境。
