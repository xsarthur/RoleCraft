# Agent Developer MVP — T1/T2/T3 local run report

- Run: `agent-developer-mvp-20261015`
- Date/time context: 2026-10-15, Asia/Shanghai
- Agent version: `agent-developer-mvp-v1.0`
- Contracts: `T1-v1.0`, `T2-v1.0`, `T3-v1.0`
- Scope: isolated deterministic Node/Python stubs and read-only v12 source checks only.
- Product/application/database/user records: unchanged.
- Network, paid calls, real model, external tools, accounts, and production side effects: not used.

## Runtime and exact commands

- Node: `v24.16.0` ([environment-node-version.txt](logs/environment-node-version.txt)), Python: `3.14.5` ([environment-python-version.txt](logs/environment-python-version.txt)).
- Every command, including non-zero first attempts and retests, is recorded in [commands.log](logs/commands.log).
- Main runner: `node sites/rolecraft/team/employee-growth-mvp/agent-developer/run-20261015/scripts/runner.mjs`.
- Evidence checker: `python3 sites/rolecraft/team/employee-growth-mvp/agent-developer/run-20261015/scripts/check_evidence.py`.
- Final checker exit code is `0` with 11/11 local checks passed: [python-check-retest2.exit](logs/python-check-retest2.exit), [python-check.json](python-check.json).

## T1 — control loop

Developer evidence is ready for handoff. The normal stub produced `received → planning → tool_call → checking → completed` with three agent steps. The error stub made two tool attempts (one controlled retry) and ended in `failed` with `tool_error_after_one_retry`; no side effect was used. Logs: [normal](logs/t1-normal-001.jsonl), [failure](logs/t1-tool-failure-001.jsonl). Summary and hashes: [run-results.json](run-results.json), [fixture-hashes.json](hashes/fixture-hashes.json).

Delivery status: `handoff` pending independent QA. Growth status: `emerging`; this single local cycle cannot establish stable occupational ability.

## T2 — local retrieval and source verification

The hit stub opened read-only `sites/rolecraft/textbooks/v12/c01-control-loop.md`, verified the excerpt and source SHA-256, and returned section/version/path fields. No-match and ambiguous responses stopped for clarification. A content/index version mismatch stopped as `source_version_conflict`. Logs: [hit](logs/t2-hit-001.jsonl), [no-match](logs/t2-no_match-001.jsonl), [ambiguous](logs/t2-ambiguous-001.jsonl), [conflict](logs/t2-version_conflict-001.jsonl). Source hashes: [source-hashes.json](hashes/source-hashes.json).

Delivery status: `handoff` pending independent QA. Growth status: `emerging`; no recall, ranking, content correctness, learning effect, or user value claim is made.

## T3 — failure-safe stops and escalation

The timeout stub waited once for 25 ms and stopped without another call. The missing-evidence stub named the missing `excerpt` and emitted no recommendation. The permission preflight stopped before invocation with `tool_calls: 0`. Logs: [timeout](logs/t3-timeout-001.jsonl), [evidence missing](logs/t3-evidence-missing-001.jsonl), [permission conflict](logs/t3-permission-conflict-001.jsonl).

Delivery status: `handoff` pending independent QA. Growth status: `emerging`; this does not establish comprehensive production safety.

## First failures, rework, and retest

1. Initial runner exited `1` because `new URL(import.meta.url).pathname` encoded the workspace space as `%20`, causing an `EPERM` path error. The fix used `fileURLToPath`; the retest exited `0`. Original and retest outputs remain in [runner.stderr](logs/runner.stderr), [runner.exit](logs/runner.exit), [runner-retest.exit](logs/runner-retest.exit).
2. T1 draft fixture `v0` declared two retries and failed validation (exit `1`); `v1` declares one retry and passed (exit `0`). Both are retained under [rework](rework/).
3. The first Python checker invocation exited `1` from a checker field lookup bug; the second exited `1` from another checker field lookup bug; the final corrected checker exited `0` with 11 checks passed. All outputs remain under [logs](logs/).

These are retained development harness failures and do not get deleted or rewritten as passes.

## Handoff and independent review boundary

Per-contract handoff packages: [T1](handoff/T1-HANDOFF.md), [T2](handoff/T2-HANDOFF.md), [T3](handoff/T3-HANDOFF.md), and [QA replay instructions](handoff/QA-REPLAY.md). Independent QA has not run in this agent session; QA must use a fresh temporary directory, preserve all first failures, add a not-preannounced variant, and conclude `passed`, `failed`, or `insufficient`. Until then, overall delivery remains `handoff`, not a QA pass.

## Limits and unresolved evidence

This run demonstrates deterministic local control-flow and source-field handling only. It does not prove real model behavior, production tool safety, retrieval quality, user comprehension, learning outcomes, expert review, cost, or occupational qualification. No external network or paid budget was authorized or used.

- Frozen contract/code hashes: [contract-and-code-hashes.json](hashes/contract-and-code-hashes.json).

- Unified first-failure/rework/retest index: [failure-rework-retest.json](failure-rework-retest.json).
