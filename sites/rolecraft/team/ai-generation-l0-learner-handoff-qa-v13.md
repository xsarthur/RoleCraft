# AI L0 Learner Handoff QA v13

- Record: `AI-L0-LEARNER-HANDOFF-QA-20261015-V13`
- Target: `sites/rolecraft/team/ai-generation-l0-learner-handoff-v13/`
- Diagnostic: `D0-AI-20261015-001`
- Conclusion: `met_with_limitations`
- Scope decision: `met_within_scope`
- Level decision: `not_assessed`

## Checks

### A stdout and normal output
`A-stdout.txt` exists with 16 raw bytes and its SHA-256 matches both the manifest and `A-receipt.json`; the receipt explicitly declares `stdout_hash_scope: raw stdout bytes`, and the captured bytes include the newline emitted by the declared print command. The normal draft, source reference and `draft_ready` status are present. `A-run-receipt.json` is a second receipt whose `output_hash` does not equal the raw stdout SHA and does not state the same hash scope, so the two receipts are not byte-equivalent. No command was independently re-executed; this is static evidence.

### B denial
`d0-03-B-output.json` records `no_output_by_contract`, `TENANT_SCOPE_DENIED`, zero downstream calls and no draft. Its manifest bytes/SHA recompute correctly; no external action is recorded.

### D0-04 tool, event and recovery evidence
All D0-04 files resolve and their listed JSON bytes/SHA match the manifest. `tool_input.json` and `tool_output.json` contain actual JSON SHA fields, event sequence numbers (1 and 2), deterministic timestamps and `side_effect: null`. The event trace records `tool_called -> tool_returned -> checkpoint_write_failed -> recovery_required -> replayed -> final`, links checkpoint/idempotency receipts, and the recovery chain reuses `U-AI-L0-001`. This establishes a coherent local receipt fixture. The trace-level `tool_input_hash` and `tool_output_hash` remain placeholder labels rather than recomputable references to the JSON files; no live fault injection, process crash, external side-effect observation, or production durability/RPO/RTO was run.

### D0-05 matrix and holdout
The four matrix states (baseline, first failure, regression and holdout) resolve to existing artifacts and each includes schema version, source refs, tenant, source version and status. The holdout explicitly changes `outage_duration` and stops at retry budget, but it reuses the same task/source/tenant and is not an independently executed unknown task. Matrix assertions are declaration-level mappings, not runtime evidence of a separate holdout execution.

### EvidenceCards and manifest
JSON parses. All 25 listed non-manifest artifact paths are relative, resolve, and have matching recomputed byte counts and SHA-256 values. Manifest self-reference is explicitly null (`manifest_bytes`/`manifest_sha256`). Five cards cover D0-01 through D0-05 and carry the diagnostic ID. Traceability is limited: cards D0-01/02 only bind `rebuild-receipt.json`, while D0-04/05 only bind `d0-04/regression.json`; cards do not carry per-artifact bytes/SHA and do not bind the new A stdout/receipt, event trace, tool I/O, idempotency, or D0-05 matrix directly.

### State safety
State fields remain safe and honest: `qa_status=pending`, `human_receipt=pending`, `self_signed=false`, `external_action=null`, D0/L0 `not_assessed`, and L1/L2 `not_granted`. No level or learner competence decision is granted.

## Limitations and follow-up

1. Reconcile `A-run-receipt.json` with the raw-stdout convention, or explicitly mark it as a separate non-byte-equivalent receipt and issue a new receipt if runtime equivalence is required.
2. Replace D0-04 trace placeholder hashes with references or recomputable hashes for the actual tool JSON, while retaining the fixture-only limitation.
3. Add an independently executed holdout/unknown task and field-level expected-versus-observed assertions if D0-05 transfer evidence is required.
4. Bind each EvidenceCard to the relevant new artifacts with path, bytes and SHA metadata; retain this QA record and do not infer learning, certification, production recovery, or model/API evidence.

This QA is an independent local artifact review. It does not grant L0/L1/L2, certify learner competence, or establish human expert, production, or industry evidence.
