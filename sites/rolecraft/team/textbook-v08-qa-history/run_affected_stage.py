"""Offline controller for exact author-notified c03/e01, QA-owned files only."""
from pathlib import Path
import datetime
import hashlib
import json
import re
import shutil
import subprocess
import sys
import tempfile

root = Path(__file__).resolve().parents[2]
history = Path(__file__).resolve().parent
out = history / "stage06-affected"
out.mkdir(exist_ok=True)
units = {}
expected_sources = {
    "c03": "a2ffd0854b3ca757ac6597cbd1b89a242248c8d227ad9f6595260a18c5fb9180",
    "e01": "481401334bc735b28e9cee78715c6222da5bf524085179653d2d53a2440d0757",
}
for unit, expected in expected_sources.items():
    path = root / "textbooks/v08" / f"{unit}.md"
    data = path.read_bytes()
    assert hashlib.sha256(data).hexdigest() == expected, (unit, "source changed before extraction; no run")
    text = data.decode()
    blocks = []
    for number, match in enumerate(re.finditer(r"```([^\n]*)\n(.*?)```", text, re.S), 1):
        code = match.group(2)
        record = {"number": number, "language": match.group(1), "startLine": text[:match.start(2)].count("\n") + 1, "sha256": hashlib.sha256(code.encode()).hexdigest()}
        blocks.append((code, record))
    units[unit] = {"source": str(path), "sourceSha256": expected, "blocks": blocks}
contracts = [x for x in units["c03"]["blocks"] if "def canonical_issue_hash(" in x[0] and "import hashlib" in x[0]]
stub = [x for x in units["c03"]["blocks"] if "class IssueStub:" in x[0]]
adapter = [x for x in units["c03"]["blocks"] if "class IssueAdapter:" in x[0]]
stores = [x for x in units["e01"]["blocks"] if "class Store:" in x[0]]
bridges = [x for x in units["e01"]["blocks"] if "def invoke_started_attempt(" in x[0]]
assert len(contracts) == len(stub) == len(adapter) == len(stores) == len(bridges) == 1
files = {"issue_contract.py": contracts[0][0], "c03_issue.py": stub[0][0] + "\n" + adapter[0][0], "e01.py": stores[0][0] + "\n" + bridges[0][0]}
for name, code in files.items():
    (out / name).write_text(code)
source = {
    "at": datetime.datetime.now(datetime.timezone.utc).isoformat(), "python": sys.version,
    "sqliteVersion": __import__("sqlite3").sqlite_version,
    "units": [{"unit": unit, "source": data["source"], "sourceSha256": data["sourceSha256"],
               "executedBlocks": [record for code, record in data["blocks"] if (code, record) in (contracts + stub + adapter if unit == "c03" else stores + bridges)],
               "notExecuted": "runtime protocol pseudocode" if unit == "c03" else "real external services/hardware/model ledger"} for unit, data in units.items()],
    "assembly": {name: hashlib.sha256(code.encode()).hexdigest() for name, code in files.items()},
    "safetyRead": "full both current manuscripts/all code/imports read; c03 notified final two pseudocode dict-access changes read; only stdlib/teaching-module definitions and constrained SQLite IO; no main/network/credentials",
}
(out / "source.json").write_text(json.dumps(source, ensure_ascii=False, indent=2) + "\n")
phases = []
with tempfile.TemporaryDirectory(prefix="textbook-v08-qa-retest-") as directory:
    temporary = Path(directory)
    for name in files:
        shutil.copyfile(out / name, temporary / name)
    shutil.copyfile(history / "offline_runner.py", temporary / "runner.py")
    for name in ["e01_retest_runner.py", "cr08_10_retest_runner.py"]:
        shutil.copyfile(history / name, temporary / name)
    for phase, runner, expected in [("crash_after_external_commit", "e01_retest_runner.py", 23), ("restart_recover", "e01_retest_runner.py", 0), ("boundaries", "e01_retest_runner.py", 0), ("cross_contract_and_bridge", "cr08_10_retest_runner.py", 0)]:
        command = [sys.executable, "-I", "-B", str(temporary / runner)] + ([] if runner.startswith("cr08") else [phase])
        result = subprocess.run(command, cwd=temporary, env={"PATH": "/usr/bin:/bin", "LC_ALL": "C", "TMPDIR": directory}, capture_output=True)
        (out / f"{phase}-stdout.json").write_bytes(result.stdout)
        (out / f"{phase}-stderr.txt").write_bytes(result.stderr)
        phases.append({"phase": phase, "command": command, "cwd": directory, "exitCode": result.returncode, "expectedExitCode": expected, "runnerSha256": hashlib.sha256((history / runner).read_bytes()).hexdigest(), "stdoutSha256": hashlib.sha256(result.stdout).hexdigest(), "stderrSha256": hashlib.sha256(result.stderr).hexdigest()})
        if result.returncode != expected:
            break
    for path in temporary.glob("*.sqlite"):
        shutil.copyfile(path, out / path.name)
(out / "execution.json").write_text(json.dumps({"phases": phases, "minimalEnvironment": True, "sameGuardAsStage01": True, "sqlitePathRestricted": True, "tempRemovedAfterRun": True, "noBusinessDatabase": "only self-made isolated teaching DBs; archived snapshots are QA files", "scope": "affected e01 complete local recovery checks plus c03 adapter original checks and shared canonical/bridge; no other unit rerun"}, ensure_ascii=False, indent=2) + "\n")
counts = []
for phase in phases:
    print(phase["phase"], phase["exitCode"], phase["expectedExitCode"])
    if phase["exitCode"] != phase["expectedExitCode"]:
        print((out / f"{phase['phase']}-stderr.txt").read_text())
        print((out / f"{phase['phase']}-stdout.json").read_text())
        raise SystemExit(1)
    data = json.loads((out / f"{phase['phase']}-stdout.json").read_text())
    assert all(record["pass"] for record in data["records"])
    counts.append({"phase": phase["phase"], "assertionRecords": len(data["records"])})
print(json.dumps(counts))
