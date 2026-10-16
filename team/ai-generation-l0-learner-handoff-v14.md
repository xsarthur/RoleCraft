# Consolidated Learner Handoff v0.14

实际运行命令：`cd /private/tmp/ai-generation-l0-learner-handoff-v14 && python3 run_bundle.py && python3 -m json.tool manifest.json`，校验通过。

`run_bundle.py` 生成 A stdout 原始 bytes 与同口径 SHA、D0-04 tool input/output、checkpoint before/after、failure、recovery、event trace，D0-05 四状态工件与逐字段矩阵，以及五张 EvidenceCard。manifest 由脚本生成，逐项登记工件 path/bytes/SHA，并以 self-reference null 处理自身哈希。

D0-05 使用新 fixture：`document_id=doc-A-shipping-v3`、`source_version=v3`、`text=shipping policy`，仅保持合同与租户约束不变。

限制：仅本地确定性运行，未调用真实模型、API、云、付费服务、生产环境或真实数据；未伪造真人签收。原始失败为 `checkpoint_write_failed`。状态：QA/human receipt pending，`self_signed=false`，`external_action=null`，L0/D0 `not_assessed`，L1/L2 `not_granted`。
