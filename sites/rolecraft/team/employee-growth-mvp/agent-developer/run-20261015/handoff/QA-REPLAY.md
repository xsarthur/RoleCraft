# QA replay package (not executed by agent-developer)

1. Use a fresh temporary directory and the frozen contracts `T1-v1.0`, `T2-v1.0`, `T3-v1.0`.
2. Copy only the run scripts and synthetic fixtures; keep the v12 source read-only.
3. Run the exact runner command in `RUN-REPORT.md`; compare event order and stop reasons with the retained JSONL logs.
4. Add one unseen T1 tool-error ordering/input variant, one T2 synonym or candidate-order variant, and one T3 changed missing field/permission variant.
5. Preserve all first-failure and retest files. QA must report `passed`, `failed`, or `insufficient`; it must not edit the implementation or contracts.
