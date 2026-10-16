# D0-03 four-case local execution artifacts

- `contract_id`: `AI-REAL-LEARNER-D0-EXEC-20261016-001`
- `diagnostic_id`: `D0-AI-20261015-001`
- `fixture_id`: `F-AI-SOURCE-CLAIM-v1`
- role: AI-generation-engineer local isolated execution
- `learner_execution`: `false`
- `human_receipt_pending`: `true`
- `external_action`: `null`
- network: disabled; `real_model=false`; cloud/paid API/real user data disabled

This directory is a fresh local execution artifact. It does not replace the learner-owned command required by the frozen contract and must not be reported as learner execution. The existing `replay_verify.py` is only a verifier for the older SOURCE-001 artifact and was not used as the four-case runner.

The runner is `implementation/d0_03_runner.py`. The harness command was:

```sh
python3 sites/rolecraft/team/ai-generation-real-learner-d0-execution-run-v01-artifacts/implementation/execute_cases.py
```

It ran each case once as `run-1` and once as `run-2` with the same A-only input snapshot. Each case has independent raw stdout/stderr files under `receipts/`, deterministic output JSON and an EvidenceCard under its run directory. The input snapshot contains the authorized A source and case metadata, while the B document body is intentionally absent. The runner's B path emits only denial metadata and does not open or cache B content.

Results from the local run:

| case | run result | first failure | stop | output SHA-256 (both runs) |
|---|---|---|---|---|
| `A-normal` | `draft_ready_for_review` | none | no | `c4642281524913457c14032f5e3ae02d2fb66495324b6d64e0c89b28133adf4c` |
| `B-tenant-denied` | rejected before generation | `SOURCE_SCOPE_DENIED` | yes | `2c4c40dc2f1e3837348dcc1ad45302b38ee3a483d309df6b0fcedba95a377d04` |
| `source-missing` | blocked | `SOURCE_MISSING` | yes | `fb9abbdccd671a82ea9c8c70dbc6e8fdfff8b9b98942d40895ebe5d0ec316fa7` |
| `source-conflict` | blocked | `SOURCE_VERSION_MISMATCH` | yes | `dc391a72f16526934eb9c90dd56305b09776b96461eecebcbac766f9c6760cf4` |

`run-comparison.json` records byte equality and first-failure equality for every case. All exits were 0 because the runner emits controlled JSON receipts for expected denials. All stderr files are empty (0 bytes) and hashed. A-normal has two bound A/v2 fact claims, with order status and customer identity left unknown and handoff `QA pending`. Failure cards have `draft=null`, `handoff=null`, and `external_action=null`. B evidence records `unvisited_sources: ["doc-B-private-v1 text"]` and a no-read/no-cache/no-context statement; its body is absent from this artifact directory.

The contract's normalized fixture SHA is `5dc9f33ed3972dbff5118bc6977a66ccbd376bc6fcc54f15c9b1e26fda8db5e0`; the frozen input file bytes SHA is recorded separately as `f6cc25edad6403c052f66167adecf666d770f12b82170f2fc996119ef118f446`. The A-only input snapshot SHA is recorded in `manifest.json` and every EvidenceCard.
