# D0-03 dynamic-source runner v0.2 — independent QA record

Date: 2026-10-16 (Asia/Shanghai)

## Scope

Independent QA covered the versioned `d0_03_runner-v02-dynamic.py`, its implementation self-check, and shell syntax/smoke for `receiver-replay-v02.sh` and `receiver-holdout-v02.sh`. The Chenny-only holdout was intentionally **not run** in this session. Learner files, v01 receipts, acceptance records, and signatures were not modified.

## Evidence and results

- Implementation self-check: `python3 -m unittest -v .../test_d0_03_runner_v02_dynamic.py` — 3 tests passed. This is an implementation self-check, not independent acceptance.
- `receiver-replay-v02.sh`: ran successfully into fresh `/private/tmp/chenny-receiver-replay-v02.OtcDn4/raw-replay`; all 8 invocations exited 0, all stderr files were empty, and run-1/run-2 stdout was byte-identical for `A-normal`, `B-tenant-denied`, `source-missing`, and `source-conflict`.
- Shell syntax: `zsh -n receiver-replay-v02.sh` and `zsh -n receiver-holdout-v02.sh` passed.
- v01 immutability: frozen `d0_03_runner.py` SHA-256 was `1003adf0ed363093d03fefbb78602b9a88c9f41f326baeaf49ee94287e008b49`; v01 receipt files had no working-tree changes. The v02 checks and replay wrote only temporary evidence.

## Independent QA conclusion

`met_within_scope`: the v02 runner and replay helper behaved as documented for the exercised implementation and replay scope, including deterministic output and pre-draft failure cases. Dynamic holdout binding remains unverified by this QA session because the holdout is restricted to Chenny's independent receiver session. Therefore this record does not establish holdout acceptance, learner performance, production readiness, or any signature/approval.

## Follow-up

Chenny must run `CHENNY_RECEIVER=true zsh .../receiver-holdout-v02.sh` independently and preserve its fresh evidence. Any holdout result must remain separate from this record and must not be inferred from the implementation self-check.
