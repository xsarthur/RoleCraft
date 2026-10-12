"""Public text/version inventory, prerequisite graph and complete fence migration; no example execution."""
import collections
import hashlib
import json
import re
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
HISTORY = Path(__file__).resolve().parent
OUT = HISTORY / "stage01-read"
OUT.mkdir(exist_ok=True)


def digest(data):
    return hashlib.sha256(data).hexdigest()


def blocks(text):
    found, current, marker, language, start = [], None, None, None, None
    for n, line in enumerate(text.splitlines(True), 1):
        fence = re.match(r"^(`{3,}|~{3,})(.*)$", line)
        if current is None and fence:
            current, marker, language, start = [line], fence.group(1)[0], fence.group(2).strip(), n
        elif current is not None:
            current.append(line)
            if fence and fence.group(1)[0] == marker:
                full = "".join(current)
                code = "".join(current[1:-1])
                found.append({"number": len(found)+1, "language": language, "line": start, "fullFenceSha256": digest(full.encode()), "codeSha256": digest(code.encode()), "full": full, "code": code})
                current = None
    assert current is None
    return found


manifest_path = ROOT / "team/textbook-v09-manifest.json"
manifest = json.loads(manifest_path.read_text())
units = manifest["units"]
ids = {u["unitId"] for u in units}
assert len(ids) == len(units) == 20
by_id = {u["unitId"]: u for u in units}
visiting, visited = set(), set()
def visit(name):
    assert name not in visiting, "dependency cycle"
    if name in visited:
        return
    visiting.add(name)
    for previous in by_id[name]["prerequisiteUnitIds"]:
        assert previous in ids
        assert by_id[previous]["order"] < by_id[name]["order"]
        visit(previous)
    visiting.remove(name)
    visited.add(name)
for unit in units:
    visit(unit["unitId"])

old = {}
for item in manifest["sourceFiles"]:
    path = ROOT / item["path"]
    data = path.read_bytes()
    assert digest(data) == item["sha256"]
    for block in blocks(data.decode()):
        old.setdefault(block["fullFenceSha256"], []).append({"source": str(path), "sourceSha256": digest(data), **{k:v for k,v in block.items() if k not in ("full", "code")}})

records = []
for unit in units:
    source = ROOT / unit["path"]
    raw = source.read_bytes()
    saved = OUT / source.name
    if saved.exists():
        assert saved.read_bytes() == raw, "do not overwrite prior read version"
    else:
        saved.write_bytes(raw)
    record = {"unitId": unit["unitId"], "order": unit["order"], "path": str(source), "readSha256": digest(raw), "saved": str(saved), "prerequisites": unit["prerequisiteUnitIds"], "blocks": []}
    for block in blocks(raw.decode()):
        origins = old.get(block["fullFenceSha256"], [])
        record["blocks"].append({**{k:v for k,v in block.items() if k not in ("full", "code")}, "oldByteExactOrigins": origins, "execution": "historical_only_not_rerun" if origins else "new_not_yet_executed"})
    records.append(record)
old_counts = collections.Counter({key: len(value) for key,value in old.items()})
new_counts = collections.Counter(b["fullFenceSha256"] for r in records for b in r["blocks"])
result = {"recordedAt": datetime.now(timezone.utc).isoformat(), "manifestSha256": digest(manifest_path.read_bytes()), "units": records, "graph": {"acyclic": True, "allPrerequisitesEarlier": True, "nodes": len(visited), "edges": sum(len(u["prerequisiteUnitIds"]) for u in units)}, "oldCompleteFenceCount": sum(old_counts.values()), "oldFenceOccurrencesMissing": list((old_counts-new_counts).elements()), "newOrAdditionalFences": [{"unit": r["unitId"], **b} for r in records for b in r["blocks"] if not b["oldByteExactOrigins"]], "notCurrentExecutionOrLearningAcceptance": True}
(OUT / "source-and-graph.json").write_text(json.dumps(result, ensure_ascii=False, indent=2)+"\n")
print(json.dumps({"units":len(records), "graph":result["graph"], "oldFenceCount":result["oldCompleteFenceCount"], "missing":result["oldFenceOccurrencesMissing"], "newFences":[{"unit":b["unit"], "number":b["number"], "language":b["language"]} for b in result["newOrAdditionalFences"]]}, ensure_ascii=False))
