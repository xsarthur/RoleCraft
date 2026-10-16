# T2 Handoff — agent-developer MVP run 2026-10-15

- Contract: `T2-v1.0`
- Run IDs: `t2-hit-001`, `t2-no_match-001`, `t2-ambiguous-001`, `t2-version_conflict-001`
- Developer execution status: `handoff`
- Independent QA status: `not_started` (this package is not a QA conclusion)
- Growth status: `emerging`

## Executed evidence

- Hit: source `sites/rolecraft/textbooks/v12/c01-control-loop.md` opened read-only, excerpt verified, and content/index versions retained: [t2-hit-001.jsonl](../logs/t2-hit-001.jsonl).
- No-match and ambiguity produce clarification stops: [t2-no_match-001.jsonl](../logs/t2-no_match-001.jsonl), [t2-ambiguous-001.jsonl](../logs/t2-ambiguous-001.jsonl).
- Content/index version mismatch is rejected as `source_version_conflict`: [t2-version_conflict-001.jsonl](../logs/t2-version_conflict-001.jsonl).
- Frozen source hashes are in [source-hashes.json](../hashes/source-hashes.json); fixture hashes and result fields are in [run-results.json](../run-results.json).

## QA replay request

Repeat the four cases from an independent temporary directory, open the hit source, and add an unseen synonym query or candidate-order variation. Verify no-match/ambiguity does not synthesize an excerpt and version conflict cannot reach `recommended`. QA must independently classify the result.

## Limits

The retrieval interface and responses are local deterministic stubs. This run does not measure recall, ranking quality, content correctness, learning effect, or real API behavior. No external URL or network access occurred.

## Ownership and escalation

- Unfinished actions: QA must open the hit source independently and run a synonym/candidate-order variant; any source or interface defect returns to `agent-developer` plus `content-retrieval-engineer` for the relevant interface handoff.
- Escalate contract or version changes to the product manager/project manager; do not silently accept stale content or index versions.
- Replay command: `node sites/rolecraft/team/employee-growth-mvp/agent-developer/run-20261015/scripts/runner.mjs`.
