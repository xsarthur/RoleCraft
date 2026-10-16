# AI Generation L0 Learner Handoff v0.9 — Independent QA

- **Scope:** static and local artifact QA for `sites/rolecraft/team/ai-generation-l0-learner-handoff-v09/`; no level is granted.
- **Conclusion:** `met_with_limitations` within the declared local fixture scope.

## Results

| Area | Result | Evidence / issue |
|---|---|---|
| A normal output | pass | `d0-03-A-output.json` is readable JSON; declared command is present; output and source hashes are present. The command was not re-executed by this QA, so command-output equivalence is static only. |
| B denial | pass within scope | `d0-03-B-output.json` declares `no_output_by_contract=true`, has input and receipt hashes, and contains no draft. `b-denial-learner-execution.json` records `result=denied` and `external_action=null`; `output_sha256=unavailable-local-receipt` limits byte-level replay. |
| D0-04 | limited pass | Recovery chain records first failure, checkpoint labels, idempotency key, recovery input/output, schema/source assertions and `recovery_required → replayed → draft_ready`. Referenced `baseline.json`, `first_failure.json`, and `regression.json` are not present in the v09 directory; therefore the chain cannot be independently dereferenced from this handoff. |
| D0-05 | pass within scope | Assertion mapping covers schema, source refs, tenant, source version and status using v09 artifacts. Mapping is syntactic and does not prove an actual unknown-task run. |
| Manifest | limited pass | All 21 non-manifest artifact records resolve and their bytes/SHA-256 match. The manifest self-record is stale: declared 9,118 bytes/hash differs from observed 8,045 bytes/hash. The `evidence_cards` and `evidence_cards_v07` sections point to `/private/tmp/...` paths unavailable in the workspace, so those external references are not independently verifiable. |
| State/safety | pass | `qa_status=pending`, `self_signed=false`, `human_receipt=pending`, `external_action=null`, `d0_status/l0_status=not_assessed`, `l1/l2=not_granted`; no level is granted. |

## Required follow-up

Rebuild the manifest after finalizing v09 contents, using the self-reference rule (`bytes=null`, `sha256=null` or an explicit self-hash convention), and replace absolute v06/v07 evidence-card paths with resolvable preserved artifacts or explicitly mark them unavailable. Add the four D0-04 checkpoint/recovery artifacts (or direct valid paths) and rerun the manifest/hash check. Then perform an independent recheck; do not convert this report to a level decision.

Unverified remain: real model/API, production durability and RPO/RTO, real tenant authorization, human receipt, unknown-task transfer, and learner/job competence.
