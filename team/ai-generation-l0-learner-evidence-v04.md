# AI生成工程师 L0 学习者证据 v0.4

诊断 ID `D0-AI-20261015-001`。v01–v03与首失败保留在工作区；本版仅写入 `/private/tmp`。

学习者本人执行的是 D0/D6/U 的本地确定性夹具；`quality/demo-v02-qa.json` 与 `quality/b-denial-qa.json` 是独立 QA 复核绑定，不是学习者自证。demo v02 与 B-denial v01 均绑定同一诊断 ID。真人接收签收仍 pending。

D6 字段计数见 `quality/d6-failure-sample.json`：claim 0/1（失败样本明确记录），source/version/tenant/schema 各1/1；正向阈值为100%，负向租户拒绝必须拒绝；任一正向字段低于100%或租户/版本未知即停止并升级。无真实模型对照，指标仅适用于本地 fixture。

状态：`qa_status=pending`、`self_signed=false`、`external_action=null`、L0/D0 `not_assessed`、L1/L2 `not_granted`。
