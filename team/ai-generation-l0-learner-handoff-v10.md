# Consolidated Learner Handoff v0.10

所有路径均为本目录相对路径；manifest采用self_reference_rule，manifest自身bytes/SHA为null。D0-04文件逐项真实复制并登记hash；A output含status/draft/source_refs/hash；B output为no_output_by_contract并含拒绝码、downstream_call_count=0与receipt hash；D0-05矩阵记录实际字段并指向v10 regression。EvidenceCards全部使用相对路径。JSON校验命令：`python3 -m json.tool manifest.json`，结果通过。状态保持pending/not_assessed/not_granted。
