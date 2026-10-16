# T1 Handoff — agent-developer MVP run 2026-10-15

- Contract: `T1-v1.0`
- Run IDs: `t1-normal-001`, `t1-tool-failure-001`
- Developer execution status: `handoff`
- Independent QA status: `not_started` (this package is not a QA conclusion)
- Growth status: `emerging`

## Executed evidence

- Normal fixture completed in 3 agent steps: [t1-normal-001.jsonl](../logs/t1-normal-001.jsonl).
- Tool error fixture produced exactly two tool attempts, one controlled retry, then `failed` with `tool_error_after_one_retry`: [t1-tool-failure-001.jsonl](../logs/t1-tool-failure-001.jsonl).
- Input fixture hashes and execution summary: [run-results.json](../run-results.json), [fixture-hashes.json](../hashes/fixture-hashes.json).
- Node runtime: `v24.16.0`; exact runner command is in [RUN-REPORT.md](../RUN-REPORT.md).

## First failure and rework

- `runner.mjs` first run exited `1` because URL pathname encoding (`%20`) produced an invalid run directory; the original stderr and exit code are retained in `../logs/runner.stderr` and `../logs/runner.exit`. Rework used `fileURLToPath`; retest exited `0` in `../logs/runner-retest.exit`.
- T1 draft fixture `t1-tool-failure-v0.json` had retry limit `2`; validator exited `1`. The retained rework fixture `t1-tool-failure-v1.json` has retry limit `1`; validator exited `0`. See [rework/](../rework/).

## QA replay request

From workspace root, run `node sites/rolecraft/team/employee-growth-mvp/agent-developer/run-20261015/scripts/runner.mjs` in an independent temporary directory, then inspect both JSONL logs. Add an unseen input or tool-error ordering variant. QA must preserve this first failure and determine `passed`, `failed`, or `insufficient` independently.

## Limits

Only deterministic in-memory stubs and synthetic inputs ran. No model, network, external tool, account, database, or production side effect ran. This evidence does not establish production reliability, user value, or occupational competence.

## Ownership and escalation

- Unfinished actions: QA must replay the original normal/error cases and one unseen variant; any failure returns to `agent-developer` for repair.
- Escalate contract or threshold changes to the product manager/project manager; do not silently alter `T1-v1.0`.
- Responsible interface owner for any future tool-contract issue is the tool owner; this run used only an in-memory stub.
- Replay command: `node sites/rolecraft/team/employee-growth-mvp/agent-developer/run-20261015/scripts/runner.mjs`.
