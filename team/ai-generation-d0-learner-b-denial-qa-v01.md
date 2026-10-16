# 独立 QA：学习者 B-denial 实作 v01

- diagnostic_id: `D0-AI-20261015-001`
- 结论：`met_within_scope`
- 检查：24 项通过，0 项失败
- QA 状态：complete；`self_signed=false`；不授等级

## 范围与结果

本次独立核对 A baseline、B-private、wrong-tenant、non-isomorphic holdout；确认 `TENANT_SCOPE_DENIED` 在生成前发生，首失败下游生成未执行；holdout 进入 `recovery_required` 并 `hold_for_human_review`，没有部分答案、来源或外部动作。A baseline 具来源绑定草稿，handoff 保持待审阅。

manifest 12 个制品逐项重算，字节数与 SHA-256 全部匹配，同一 diagnostic_id 绑定；execution_log 标记 network/real_api/real_model 均为 false。learner_raw 与 EvidenceCard 保持 `qa_status=pending`、`self_signed=false`、`decision=not_assessed`、`levels_granted=[]`，证明学习者证据与独立 QA 分离。

## 限制

- 仅验证本地固定夹具与脚本产物；未验证真实权限系统、真实模型/API、数据库、网络、生产恢复或真实用户效果。
- 本结论不授予 L0/L1/L2 等级，不替代内容审校、真人专家或产品达标评审。

## 逐项检查

- `manifest:fixture.json`: pass — bytes=208 sha256=b7058d622b464d78bfd45418192cbbb659b5664f5874fc20b1364151efe24d6d
- `manifest:A-baseline-input.json`: pass — bytes=116 sha256=2d8d60705e3edb98d3f859f04ccebb655d7253519cc9733a105e14915c23d9ec
- `manifest:A-baseline-output.json`: pass — bytes=342 sha256=34d1e1914ff71014524b61526a4ca417b98162a2e1ff982ead0ea7d44cbc7bf3
- `manifest:B-private-input.json`: pass — bytes=83 sha256=0cad0e9a2cc2d3bb4082b2b5530c1c52e5a942a9a32137eb3dedfb851b05a7a1
- `manifest:B-private-output.json`: pass — bytes=204 sha256=92a7e82d6052382cdd71661de96964b4100a2249c678caaf195c5055067271c3
- `manifest:wrong-tenant-input.json`: pass — bytes=82 sha256=2c1af9319002da315aca83b107f00c6e62a46546f8b65708b25a1af77bfeb91f
- `manifest:wrong-tenant-output.json`: pass — bytes=203 sha256=9d73c3c9413200b947a6af6438f509777f5e3d72e547439e9e2a2e3c10c4ae2b
- `manifest:holdout-nonisomorphic-input.json`: pass — bytes=129 sha256=ba90a0769ccf80555603ae167659205747b998a87e2918ebf4bfff0525ab2f04
- `manifest:holdout-nonisomorphic-output.json`: pass — bytes=182 sha256=be0ba8b30fb40d86cb3c2c9fdb82d58838622bec7b09676322a4b84d921a4f34
- `manifest:execution_log.json`: pass — bytes=562 sha256=7b39f77953c2d41384bd47a1047e5e4af0598f6c1a2010f40a5bf815ef46f3ed
- `manifest:learner_raw.json`: pass — bytes=298 sha256=dcdd193b5146ae642ce0874a39edf3a2dc55f88e7b1a9091d2ef6c53d9f86fa5
- `manifest:EvidenceCard.json`: pass — bytes=241 sha256=8fad229524b64b70bc35adfb52541037618266163a3e7de1eb48ca92dc81e99d
- `manifest-count`: pass — artifact_count=12 and 12 file entries
- `manifest-state`: pass — diagnostic/state fields preserved
- `A-baseline`: pass — A baseline produces source-bound draft with no external action
- `B-private-denial`: pass — status=denied_before_generation reason=tenant_scope_denied answer_null=True source_refs_empty=True
- `wrong-tenant-denial`: pass — status=denied_before_generation reason=tenant_scope_denied answer_null=True source_refs_empty=True
- `first-failure`: pass — first failure and downstream_generation=false
- `holdout-nonisomorphic`: pass — non-isomorphic mixed request held for human review with no partial output
- `handoff-null`: pass — draft_handoff=false and external_action=null
- `execution-log`: pass — execution log records isolated local fixture and four runs
- `evidence-binding`: pass — EvidenceCard binds cases and remains unsigned/pending
- `learner-separation`: pass — learner raw evidence does not self-assess or grant level
- `fixture-scope`: pass — fixture includes private B document denied to authorized A scope
