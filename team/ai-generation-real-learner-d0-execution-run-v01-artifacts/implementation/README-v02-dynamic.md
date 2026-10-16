# D0-03 dynamic-source runner v0.2

This versioned implementation is separate from the frozen `d0_03_runner.py` and its historical receipts. `d0_03_runner-v02-dynamic.py` reads `authorized_source` from the invocation input, verifies `sha256(text)` equals the declared `hash`, and builds the tool receipt and every claim `source_refs` from that source. A valid holdout can therefore change `document_id`, `source_version`, `location`, and `text` together and receive matching provenance.

Expected failures stop before draft creation with `draft=null`, `handoff=null`, and `external_action=null`:

- `B-tenant-denied`: metadata-only `SOURCE_SCOPE_DENIED`; no B body is read or emitted.
- `source-missing`: `SOURCE_MISSING` from the case override.
- `source-conflict`: `SOURCE_VERSION_MISMATCH` (or `SOURCE_HASH_MISMATCH`) when the expected source metadata conflicts with the dynamically read receipt.
- A declared text hash that does not match the supplied text: `SOURCE_HASH_MISMATCH`.

Run the implementation self-check from the project root:

```sh
python3 -m unittest -v sites/rolecraft/team/ai-generation-real-learner-d0-execution-run-v01-artifacts/implementation/test_d0_03_runner_v02_dynamic.py
```

The check covers the original input, byte-identical `run-1`/`run-2` outputs for all four cases, a valid holdout that changes all source fields and binds the new values, and a stale-hash pre-draft stop. These are engineering self-checks; they are not an independent QA acceptance.

For the independent receiver, use the versioned helpers in the learner submission package:

```sh
zsh sites/rolecraft/team/ai-generation-real-learner-d0-execution-learner-submission-v02/receiver-replay-v02.sh
CHENNY_RECEIVER=true zsh sites/rolecraft/team/ai-generation-real-learner-d0-execution-learner-submission-v02/receiver-holdout-v02.sh
```

The holdout helper must be run by the independent receiver. It writes a new temporary evidence directory and reports `pass_dynamic_binding` only when both runs exit cleanly, are byte-identical, and all receipt/claim source references match the generated holdout source. It never updates learner receipts or acceptance records.
