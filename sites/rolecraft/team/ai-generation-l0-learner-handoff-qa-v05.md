# AI Generation L0 Learner Handoff v05 — Independent QA

- **Scope:** independent package QA for `sites/rolecraft/team/ai-generation-l0-learner-handoff-v05/`; no level is granted.
- **Conclusion:** `met_with_limitations`
- **Diagnostic:** `D0-AI-20261015-001` (learner execution and independent review are separately labeled and the D0 demo artifacts bind to the same diagnostic id).

## Evidence checked

1. **Manifest integrity:** all 17 declared non-self artifacts exist. Recomputed bytes and SHA-256 match every declaration. The manifest self-reference is intentionally absent; no undeclared package files were found beyond the declared quality and U-AI trees.
2. **Role separation:** `learner_raw.json`, demo learner raw, source practice, B-denial execution and U-AI execution are learner evidence. Demo QA, B-denial QA, durable evidence card, gate manifest and D6 sample are independent-review/evidence artifacts. The package marks `self_signed=false`, `qa_status=pending`, `human_receipt=pending`, and `external_action=null`.
3. **D0:** D0-01 through D0-05 are present in learner evidence; D0 remains `not_assessed` and no level is granted. Demo QA independently verifies the v02 manifest and D0-03/04/05 structure within its stated scope.
4. **Practice evidence:** SOURCE, DURABLE and GATE references are version/hash bound. Normal, first-failure, recovery/regression and holdout records are present. The U-AI-001 command is fixture-only JSON validation; its own record leaves real process crash recovery, real model/API quality, production RPO/RTO and external contracts unmeasured.
5. **B denial:** the independent QA record verifies two denial cases, stop-before-draft, dynamic holdout binding, and byte-equal replay in the isolated fixture. The consolidated manifest explicitly keeps “B-tenant denial learner execution” unverified; therefore this evidence cannot be promoted to a learner pass.
6. **D6/quality:** source/version/tenant/schema fields are 1/1, but claim is 0/1 because the claim is absent in the negative B-denial sample. The declared stop/escalate line is therefore not fully demonstrated.
7. **Receipt/status:** no human receipt or external acceptance is present; learner and QA statuses remain pending, with L1/L2 not granted and all external/paid/network actions null or disabled.

## Limitations and follow-up

The package is internally coherent and reproducible within local fixtures, but it does not establish real model behavior, production persistence/recovery, real authorization, external API contracts, human receipt, or learner execution of the B-denial transfer. The D6 claim-field defect requires an explicit repaired sample and rerun; retain this report and the first-failure records rather than closing the gap by changing the threshold.
