# AI generation L0 learner handoff v06 — independent QA

- QA ID: AI-L0-LEARNER-HANDOFF-QA-20261015-V06
- Scope: independent structural/evidence review of the v06 consolidated learner handoff package. No level is granted.
- Conclusion: **met_with_limitations** (within the declared local-fixture scope).

## Evidence checked

1. Recomputed every non-self manifest artifact under `team/ai-generation-l0-learner-handoff-v06/`. All 19 declared artifact records matched observed bytes and SHA-256. The manifest itself is intentionally excluded from self-hash; its declared fixture hash matches `learner_raw.json` fixture hash.
2. D0-01 through D0-05 cards are present, valid JSON, carry the common diagnostic ID, point to `learner_raw.json` and `u-ai-l0-001/execution_log.json`, and include first-failure, stop, regression, holdout, and unverified fields. Their common learner execution binding is consistent with the consolidated raw answer; the demo and practice source/durable/gate evidence are separately listed in the raw answer.
3. The B-denial learner execution record is separate from `quality/b-denial-qa.json` (learner execution versus independent review), with `self_signed=false`, `qa_status=pending`, `external_action=null`, and denial result recorded. The independent QA record is not treated as learner execution.
4. D6 quality has positive claim/source/version/tenant/schema at 1/1 and the required negative sample at 0/1. The negative omission is retained as a failure sample and therefore does not count as a pass.
5. U-AI-L0-001 contains baseline, first failure, regression, holdout, stop decisions, and explicit unmeasured limits. Sandbox/environment records state network disabled, cloud/paid API/real model/real user data false. Handoff and human receipt remain pending; L1/L2 are not granted.

## Limitations and follow-up

The package is local deterministic fixture evidence. It does not establish real model/API behavior, production persistence or RPO/RTO, real tenant/source authorization, human receipt, or production external-action safety. The B-denial learner execution output hash is explicitly unavailable-local-receipt. The D6 negative claim omission remains a recorded failure sample. Re-run independent QA if the source/schema, model, application integration, or external environment changes.
