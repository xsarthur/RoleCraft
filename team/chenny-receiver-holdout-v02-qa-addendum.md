# Chenny receiver holdout v02 — independent QA addendum

**Scope.** Read-only verification of `/private/tmp/chenny-receiver-holdout-v02.fekHQb` evidence. This addendum covers the holdout evidence bundle only; it does not sign Chenny's work, modify learner records, or assess the wider product.

**Result: `met_within_scope` (`pass_dynamic_binding`).**

- `evidence/SHA256SUMS` validates all listed inputs and evidence files; every listed digest returned `OK`.
- `evidence/BYTES` matches the byte counts returned by `wc -c` for all listed files (including 2,405-byte stdout, zero-byte stderr, and two-byte exit-code files for each run).
- `evidence/checks.json` reports `status: pass_dynamic_binding`; all eleven checks are true. `holdout-status.txt` agrees.
- Both runs invoke the recorded `d0_03_runner-v02-dynamic.py` with the same holdout input and `A-normal` case. Each exits `0`, has empty stderr, and produces a `draft_ready_for_review` result. Run 1 and run 2 stdout/stderr/exit-code bytes are identical. The command files differ only in the expected run id (`run-1` versus `run-2`), so they are not treated as a byte-equality failure.
- Each run's `tool_receipt` and both claim source-reference sets bind to the variant document, hash, location, and source version in `variant.json`. Receipt and claim refs agree with the holdout input's authorized source. The dynamic output retains the explicit unknown and no external action (`null`).
- The bundle is a fixture-only, offline run (`network: disabled`, `paid_api: false`, `real_model: false`, `real_user_data: false`) and is evidenced by the recorded output; this is not a project-manager smoke check.

**Limitations.** This verifies the supplied holdout evidence and its recorded runner provenance. It does not establish live model quality, human review, Chenny signature, learner outcomes, or production readiness.

**QA evidence date:** 2026-10-16 (Asia/Shanghai).
