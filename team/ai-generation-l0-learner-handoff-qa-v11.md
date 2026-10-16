# AI L0 Learner Handoff QA v11

- Record: `AI-L0-LEARNER-HANDOFF-QA-20261015-V11`
- Target: `/private/tmp/ai-generation-l0-learner-handoff-v11`
- Diagnostic: `D0-AI-20261015-001`
- Conclusion: `met_with_limitations`
- Scope decision: `met_within_scope`
- Level decision: `not_assessed`

## Checks

### A normal output
Passes static receipt checks: command, captured-log claim, draft status, output hash, and source reference are present. The declared command uses `print`, which normally emits a newline, while the recorded hash equals the no-newline string `DEMO-42 draft A`; the command was not re-executed and no stdout file is supplied. Therefore this is static evidence with a reproducibility limitation, not runtime confirmation.

### B denial
Passes the denial contract: no output, `TENANT_SCOPE_DENIED`, zero downstream calls, receipt hash, and no draft are present. No external action is recorded.

### D0-04
All referenced baseline, first-failure, checkpoint, recovery, regression, holdout, idempotency, event-trace and tool I/O hash fields are present and resolve. The trace records tool call/return, checkpoint failure, recovery, replay and final; `side_effect` is null; checkpoint and idempotency receipts are linked; recovery chain is `recovery_required -> replayed -> draft_ready`; idempotency key is reused. Evidence is receipt-level only; tool hashes are placeholder labels and no live fault injection, external side-effect observation, or production durability/RPO/RTO was run.

### D0-05
The baseline, first_failure, regression and holdout matrix is present. Each state contains and asserts `schema_version`, `source_refs`, `tenant`, `source_version`, and `status`. Unknown-task/holdout execution was not independently run; holdout is a recorded recovery-required state.

### Manifest and state safety
JSON parses. All listed non-manifest relative paths resolve. Recomputed byte counts and SHA-256 values match every listed artifact; manifest self-reference is explicitly null for bytes/SHA. Evidence cards are readable and cover D0-01 through D0-05. The cards retain `V10` in their evidence IDs despite the v11 handoff, a traceability cleanliness limitation. State remains safe: `qa_status=pending`, `human_receipt=pending`, `self_signed=false`, `external_action=null`, D0/L0 not assessed, L1/L2 not granted.

## Limitations and follow-up

No real model/API call, tenant authorization, production recovery, unknown-task transfer, human receipt, learner execution, or competence/certification evidence was verified. Re-execute the declared A command with an explicit captured stdout/hash convention if runtime equivalence is required; preserve this static QA record and append a new receipt. Correct or explain the V10 evidence-card identifiers in a future handoff without changing this record.
