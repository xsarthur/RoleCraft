"""Two-point read-only program snapshot comparison; never execute services."""
import datetime
import hashlib
import json
import os
from pathlib import Path

root = Path(__file__).resolve().parents[2]
history = Path(__file__).resolve().parent
initial_file = history / "stage01/source-and-baseline.json"
initial_record = json.loads(initial_file.read_text())
initial = initial_record["applicationBaseline"]
excluded_dirs = {"node_modules", ".git", ".runtime", "runtime", "cache", ".cache", "__pycache__", "private", "config", "configs", "secrets"}
def excluded_name(name):
    low = name.lower()
    return low.startswith(".env") or any(x in low for x in ("secret", "credential", "private", "token")) or Path(name).suffix.lower() in {".sqlite", ".sqlite3", ".db", ".log", ".pyc"}
inventory = []
for relative in ("dist", "server"):
    for directory, subdirs, files in os.walk(root / relative, followlinks=False):
        subdirs[:] = [name for name in subdirs if name not in excluded_dirs]
        for name in files:
            if not excluded_name(name):
                inventory.append(str((Path(directory) / name).relative_to(root)))
packaging_names = ["package.json", "package-lock.json", "npm-shrinkwrap.json", "yarn.lock", "pnpm-lock.yaml", "bun.lock", "bun.lockb", "pyproject.toml", "requirements.txt", "poetry.lock", "uv.lock"]
packaging = [name for name in packaging_names if (root / name).is_file()]
inventory.extend(packaging)
# Hash only the exact approved initial whitelist. Unknown additions are listed
# for follow-up, never opened automatically (they might contain private data).
records = []
for relative, expected in initial.items():
    path = root / relative
    observed = hashlib.sha256(path.read_bytes()).hexdigest() if path.is_file() else None
    records.append({"path": relative, "initialSha256": expected, "finalSha256": observed, "same": observed == expected})
added = sorted(set(inventory) - set(initial))
removed = sorted(set(initial) - set(inventory))
out = {"initialRecord": str(initial_file), "initialRecordedAt": initial_record["recordedAt"], "finalRecordedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(), "initialFileCount": len(initial), "finalWhitelistedFileCount": sum(r["finalSha256"] is not None for r in records), "records": records, "addedEligibleNamesNotOpened": added, "removedEligibleNames": removed, "packagingManifestsPresentAtFinal": packaging, "result": "same_at_two_record_points" if not added and not removed and all(r["same"] for r in records) else "changed_or_unreviewed", "noApplicationExecuted": True, "limitation": "Only exact file bytes/inventory at the two recorded points; no proof of every moment during the turn. Runtime/private/config/env/cache/log/databases excluded; unknown additions not read."}
(history / "final-application-baseline.json").write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n")
print(json.dumps({"result": out["result"], "files": len(records), "added": added, "removed": removed, "changed": [r["path"] for r in records if not r["same"]]}, ensure_ascii=False))
raise SystemExit(0 if out["result"] == "same_at_two_record_points" else 1)
