# Consolidated Learner Handoff v0.11

v10历史与失败保留。A normal output新增独立运行命令、stdout日志、输出hash和status收据。D0-04新增完整event trace、工具输入输出hash、side_effect=null及checkpoint/idempotency收据。D0-05矩阵覆盖baseline/first_failure/regression/holdout四状态，逐字段记录schema_version、source_refs、tenant、source_version、status及断言。

所有路径均为v11相对路径；manifest采用self-reference规则，自身bytes/SHA为null，其他工件逐项登记bytes/SHA。状态保持human receipt pending、QA pending、self_signed=false、external_action=null、L0/D0 not_assessed、L1/L2 not_granted。
