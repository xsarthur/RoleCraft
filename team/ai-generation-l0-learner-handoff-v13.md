# Handoff v0.13

项目工作区写入被当前只读权限阻断，本版完整保存在 `/private/tmp`。A stdout 与 receipt 明确覆盖原始 stdout bytes；D0-04 tool input/output 使用实际 JSON SHA，并含事件序号、时间与 side_effect；holdout 独立只改变 outage_duration。manifest/EvidenceCards 使用相对路径并登记 path/bytes/SHA，JSON 校验通过。状态 pending/not_assessed/not_granted。
