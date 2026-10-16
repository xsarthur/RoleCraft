# AI Generation L0 Learner Handoff v0.10 — Independent QA

- **Scope:** independent local/static QA of `sites/rolecraft/team/ai-generation-l0-learner-handoff-v10/`; no level is granted.
- **Conclusion:** `met_with_limitations` within the declared local fixture scope; `scope_decision=met_within_scope`.

| Area | Result | Evidence |
|---|---|---|
| A normal output | pass with static limit | `d0-03-A-output.json` parses and contains readable `status`, `draft`, `source_refs`, `source_hash`, and output `hash`. No runtime command was re-executed. |
| B denial | pass within scope | `d0-03-B-output.json` has `no_output_by_contract=true`, `rejection_code=TENANT_SCOPE_DENIED`, `downstream_call_count=0`, a receipt hash, no draft, and `external_action=null`. |
| D0-04 | pass within scope | All seven D0-04 files resolve. Baseline, first failure, checkpoint, idempotency, holdout and recovery are present; regression records `draft_ready`; chain is `recovery_required → replayed → draft_ready`. Declared bytes/SHA-256 match recomputation. |
| D0-05 | pass within scope | Matrix contains the actual `schema_version`, `source_refs`, `tenant`, `source_version`, and `status` fields and points to `d0-04/regression.json`. This is a fixture mapping and does not prove an unknown-task runtime. |
| Manifest | pass with self-reference limit | JSON parses. Every non-manifest artifact (16 records) has a resolvable relative path and matching bytes/SHA-256. `manifest_bytes` and `manifest_sha256` are correctly null under the declared self-reference rule. |
| Evidence cards | pass within scope | Five readable cards cover D0-01 through D0-05, share the diagnostic ID, and use relative artifact references that resolve. |
| State/safety | pass | `qa_status=pending`, `self_signed=false`, `human_receipt=pending`, `external_action=null`, `d0_status/l0_status=not_assessed`, and `l1/l2=not_granted`. |

No defects were found in the requested handoff fixture checks. Limitations remain for runtime command replay, real model/API behavior, production durability/RPO/RTO, tenant authorization, human receipt, unknown-task transfer, and learner/job competence. Those limitations do not change the within-scope static result and do not grant a level.

Verification used local filesystem reads, JSON parsing, relative-path resolution, and independent byte/SHA-256 recomputation on 2026-10-15. Preserve this report; append runtime or human evidence as a new QA record if it becomes available.
