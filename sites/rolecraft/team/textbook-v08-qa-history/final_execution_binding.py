"""Bind existing execution evidence to final manuscript block bytes; no rerun."""
from pathlib import Path
import datetime
import hashlib
import json
import re

root = Path(__file__).resolve().parents[2]
history = Path(__file__).resolve().parent
initial = json.loads((history / "stage01/source-and-baseline.json").read_text())
entries = {}
for entry in initial["sources"]:
    if entry["unit"] != "c03":
        entries[entry["unit"]] = {**entry, "stage": "stage01", "executedBlocks": entry["blocks"]}
for unit, stage in (("e05", "stage02"), ("p02", "stage04")):
    data = json.loads((history / stage / "source.json").read_text())
    entries[unit] = {**data, "stage": stage, "executedBlocks": [{"sha256": data["blockSha256"]}]}
for entry in json.loads((history / "stage06-affected/source.json").read_text())["units"]:
    entries[entry["unit"]] = {**entry, "stage": "stage06-affected"}
assert len(entries) == 10
scope = {
    "f01": "author five unittest plus offline input/HTTP/content boundaries; real HttpTransport not invoked",
    "f02": "non-main definitions, pure response consumption and local fake response wrapper only; no env key, actual provider or main",
    "c02": "lexical/source snapshot/ACL/version/normalized-fact fixture chain only; no actual embedding/semantic experiment",
    "c03": "shared canonical, IssueStub and IssueAdapter only; protocol runtime/store pseudocode not executed",
    "e01": "Store and explicit Dispatch bridge; QA-created temp SQLite and genuine interpreter termination/restart; no business DB/real remote/hardware claim",
    "e02": "fixture verdict classifier only; no actual model/professional semantic judge or statistical performance",
    "e03": "in-memory four-channel marker/approval/unique-slot fixture only; no unknown-secret DLP or remote persistence",
    "e04": "pure rollback planner only; no deployment/runbook/service execution",
    "e05": "Decimal fixture accounting only; no actual prices/billing/load/cache or scheduler execution",
    "p02": "QA-created temporary evidence index fixtures only; no user evidence scan or authenticity/gate acceptance",
}
bindings = []
for unit, entry in entries.items():
    path = root / "textbooks/v08" / f"{unit}.md"
    text = path.read_text()
    current_blocks = [{"number": n, "language": match.group(1), "startLine": text[:match.start(2)].count("\n") + 1, "sha256": hashlib.sha256(match.group(2).encode()).hexdigest()} for n, match in enumerate(re.finditer(r"```([^\n]*)\n(.*?)```", text, re.S), 1)]
    selected = []
    for expected in entry["executedBlocks"]:
        matches = [block for block in current_blocks if block["sha256"] == expected["sha256"]]
        assert len(matches) == 1, (unit, "executed block missing or ambiguous")
        selected.append({**matches[0], "executedSha256": expected["sha256"], "byteIdentical": True})
    bindings.append({"unit": unit, "finalSource": str(path), "finalSourceSha256": hashlib.sha256(path.read_bytes()).hexdigest(), "executionSourceSha256": entry["sourceSha256"], "executionStage": entry["stage"], "executedBlocks": selected, "unexecutedBlocks": [block for block in current_blocks if not any(block["number"] == chosen["number"] for chosen in selected)], "scope": scope[unit], "repeatedForProseOnlyChange": False})
current_records = [record for record in json.loads((history / "stage01/stdout.json").read_text())["records"] if not record["name"].startswith("c03:")]
all_record_count = len(json.loads((history / "stage01/stdout.json").read_text())["records"])
for stage, names, active in [("stage02", ["stdout.json"], True), ("stage03", ["crash_after_external_commit-stdout.json", "restart_recover-stdout.json", "boundaries-stdout.json"], False), ("stage04", ["stdout.json"], True), ("stage06-affected", ["crash_after_external_commit-stdout.json", "restart_recover-stdout.json", "boundaries-stdout.json", "cross_contract_and_bridge-stdout.json"], True)]:
    for name in names:
        records = json.loads((history / stage / name).read_text())["records"]
        assert all(record["pass"] for record in records)
        all_record_count += len(records)
        if active:
            current_records.extend(records)
assert len(current_records) == len({record["name"] for record in current_records}) == 139
assert all_record_count == 166
historical = sum(len(json.loads((history / ref).read_text())["records"]) for ref in ["stage01/historical-stdout.json", "stage05-historical/stdout.json"])
assert historical == 6
out = {"recordedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(), "method": "exact code block byte SHA matches bind prior executions to final prose; only c03/e01 were rerun for contract/code changes", "runtime": {"python": "3.12.14", "sqlite": "3.53.1", "not314Verification": True}, "currentValidBehaviorRecords": len(current_records), "allVersionBehaviorRecordsIncludingSuperseded": all_record_count, "archivedDefectCounterexampleRecords": historical, "harnessImportFailurePreserved": "stage06-harness-import-failure/execution.json", "notQualityOrGateScore": True, "bindings": bindings, "nonExecutableReadUnits": ["c01-solution-selection", "agent-control-loop-v07", "p01"], "noOtherCodeReexecuted": True}
(history / "final-execution-binding.json").write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n")
print(json.dumps({"units": len(bindings), "current": 139, "allVersions": 166, "historicalCounterexamples": 6}))
