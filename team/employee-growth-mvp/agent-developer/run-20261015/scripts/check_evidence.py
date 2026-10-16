#!/usr/bin/env python3
"""Deterministic local evidence checker; no network and no product writes."""
from __future__ import annotations
import hashlib, json, pathlib, sys

RUN = pathlib.Path(__file__).resolve().parent.parent
RESULTS = RUN / "run-results.json"
LOGS = RUN / "logs"
FIXTURES = RUN / "fixtures"
REWORK = RUN / "rework"

def sha256(path: pathlib.Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()

def load_lines(name: str):
    return [json.loads(x) for x in (LOGS / name).read_text().splitlines() if x.strip()]

def require(ok: bool, label: str, details: object = None):
    checks.append({"label": label, "status": "passed" if ok else "failed", "details": details})

checks = []
data = json.loads(RESULTS.read_text())
t1n, t1f = data["t1"]
require(t1n["status"] == "completed" and t1n["agent_steps"] <= 3, "T1 normal completed within three agent steps", t1n)
require(t1f["status"] == "failed" and t1f["tool_attempts"] == 2 and t1f["retry_count"] == 1, "T1 failure had one controlled retry then failed", t1f)
normal_log = load_lines("t1-normal-001.jsonl")
require([e["state"] for e in normal_log] == ["received", "planning", "tool_call", "tool_call", "checking", "completed"], "T1 normal state/event order", [e["state"] for e in normal_log])
fail_log = load_lines("t1-tool-failure-001.jsonl")
require(fail_log[-1]["stop_reason"] == "tool_error_after_one_retry", "T1 failure has explicit stop reason", fail_log[-1])

t2 = {x["case"]: x for x in data["t2"]}
require(t2["hit"]["status"] == "recommended" and bool(t2["hit"]["source_sha256"]), "T2 hit retained verified source hash", t2["hit"])
require(t2["no_match"]["status"] == "needs_clarification", "T2 no-match stopped for clarification", t2["no_match"])
require(t2["ambiguous"]["status"] == "needs_clarification", "T2 ambiguous result stopped for clarification", t2["ambiguous"])
require(t2["version_conflict"]["stop_reason"] == "source_version_conflict", "T2 version conflict rejected", t2["version_conflict"])

t3 = {x["stop_reason"]: x for x in data["t3"]}
require(t3["timeout"]["tool_attempts"] == 1 and t3["timeout"]["tool_calls_after_stop"] == 0, "T3 timeout stopped after one wait", t3["timeout"])
require(t3["evidence_missing"]["recommendation_emitted"] is False, "T3 missing evidence emitted no recommendation", t3["evidence_missing"])
require(t3["permission_conflict"]["tool_calls"] == 0, "T3 permission conflict blocked before tool call", t3["permission_conflict"])

# Save hashes for all deterministic inputs and evidence logs. This is local evidence only.
fixture_hashes = {}
for root in (FIXTURES, REWORK):
    for p in sorted(root.glob("*.json")):
        fixture_hashes[str(p.relative_to(RUN))] = sha256(p)
(RUN / "hashes" / "fixture-hashes.json").write_text(json.dumps(fixture_hashes, indent=2, ensure_ascii=False) + "\n")
log_hashes = {str(p.relative_to(RUN)): sha256(p) for p in sorted(LOGS.glob("*.jsonl"))}
(RUN / "hashes" / "log-hashes.json").write_text(json.dumps(log_hashes, indent=2) + "\n")
source_hashes = data["source_manifest"]
(RUN / "hashes" / "source-hashes.json").write_text(json.dumps(source_hashes, indent=2) + "\n")

report = {"checker": "python-local-evidence-check-v1", "python": sys.version.split()[0], "status": "passed" if all(c["status"] == "passed" for c in checks) else "failed", "checks": checks}
(RUN / "python-check.json").write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n")
print(json.dumps({"status": report["status"], "checks": len(checks), "failed": sum(c["status"] == "failed" for c in checks)}))
if report["status"] != "passed":
    raise SystemExit(1)
