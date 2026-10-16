# Independent QA replay evidence

These files were produced by qa-engineer in fresh temporary workspaces from the frozen scripts, fixtures, and read-only v12 source. They are evidence copies; no implementation, contract, source textbook, account, database, or user record was changed.

- `original/`: fresh replay of the developer handoff command. Runner exit 0. The first checker invocation was retained as `original/check.stdout`/`check.stderr` and failed only because the copied fresh directory did not contain `hashes/`; QA created that output directory and reran the unchanged checker, retained as `check2.*`, with 11/11 checks passed.
- `t1-variant-input-only/`: contract-faithful unseen input-only variant; one controlled retry then `tool_error_after_one_retry`.
- `t1-variant/`: additional changed-tool/error variant retained as a supplemental guard.
- `t2-variant-valid/`: unseen synonym/candidate-order variant; first candidate had a valid e01 source/excerpt and was independently opened and verified.
- `t2-variant-invalid/`: guard variant with a non-matching excerpt; stopped `excerpt_not_found` without recommendation.
- `t2-path-variant/`: path traversal guard; stopped `path_outside_allowed_root` without opening or recommending the source.
- `t3-variant/`: changed missing evidence field (`source_path`) and permission name (`identity.write`); stopped before recommendation/tool call.
