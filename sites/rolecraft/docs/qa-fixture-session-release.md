# QA fixture session release

Acceptance sessions that start an isolated fixture must stop it before the session ends. An uncleared fixture is an acceptance-environment incident (AT-ENV-05 Fail), not a leftover to hand to the next reader.

This note covers `session-release-*-evidence` packages and any run of `sites/rolecraft/scripts/qa-isolated-server.py`.

## What must be stopped

| Item | Fingerprint |
|---|---|
| Known residue ports | **4556**, **4557** |
| Fixture listen port | The `port=` value printed in the `ISOLATED QA FIXTURE` banner. Default is an OS-assigned high port on **127.0.0.1**, not 4318. |
| Process name | Command line contains `qa-isolated` (the server file is `qa-isolated-server.py`) |

The learning service stays on its own port (default `http://127.0.0.1:4318`, `ROLECRAFT_PORT`). Do not stop that process to “clean” a fixture, and do not point `BASE` at a fixture port.

`ALLOW_ISOLATED_QA=1` only allows one intentional listen. It does not authorize leaving the process up after the session. `QA_FIXTURE_SESSION_DECLARED=1` only tells `qa-env-guard.sh` that a live fixture was declared for this scan. It does not replace teardown.

## End of session

1. Stop the fixture with the PID from its banner (`kill <pid>`), or send SIGINT/SIGTERM to the `qa-isolated-server.py` process.
2. Confirm the banner’s port and 4556/4557 are no longer listening.
3. Confirm no command line still contains `qa-isolated`.
4. Run the guard and paste the stdout into the evidence pack (`scan-after.txt`, same shape as `scan-before.txt`):

```bash
# BASE must be the learning service, not the fixture.
BASE=http://127.0.0.1:4318 sites/rolecraft/scripts/qa-env-guard.sh
```

5. A non-zero guard result, a surviving 4556/4557 listener, or a surviving `qa-isolated` process without a written handoff is an AT-ENV-05 failure. Do not mark the acceptance session released.

## Before the next acceptance

Run the same guard first and keep the stdout as `evidence/scan-before.txt`. Undeclared residue fails the guard (exit 1) and blocks the acceptance start (AT-ENV-01).

The product UI treats `X-RoleCraft-QA-Fixture: 1`, `fixture=true`, or `error=qa_fixture` as an acceptance fixture, not as a missing chapter. That signal does not make a fixture a valid learning base.
