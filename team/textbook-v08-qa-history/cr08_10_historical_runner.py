"""Historical CR08-10 counterexample on saved e01 only; not a new-book pass."""
import importlib.util
import json
import pathlib
import sqlite3
import sys

spec = importlib.util.spec_from_file_location("guard", pathlib.Path.cwd() / "runner.py")
guard = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = guard
spec.loader.exec_module(guard)
original_connect = sqlite3.connect
def connect(path, *args, **kwargs):
    if pathlib.Path(path).resolve().parent != pathlib.Path.cwd().resolve():
        raise RuntimeError("QA_DATABASE_PATH_BLOCKED")
    return original_connect(path, *args, **kwargs)
sqlite3.connect = connect
old = guard.load("old_e01")
store = old.Store("historical.sqlite")
store.new_run("historical", 100)
epoch = store.acquire("historical", 1)
args = {"project": "refund-maintenance", "title": "第七天退款错误", "body": "根因仍待核实", "evidence_ids": ["repo@8e12:src/refund.py:1-2", "report-71:failure-1"]}
def intent(event_id, value):
    revision = store.db.execute("SELECT revision FROM runs WHERE run_id='historical'").fetchone()[0]
    return store.transact("historical", epoch, revision, event_id,
                          {"kind": "intent", "action_id": event_id, "operation_id": event_id + "-op", "args": value}, 1)
first = intent("first", args)
for name, ids in [("reordered_set", list(reversed(args["evidence_ids"]))),
                  ("duplicate_set", args["evidence_ids"] + args["evidence_ids"][:1])]:
    try:
        intent(name, {**args, "evidence_ids": ids})
        result = "ACCEPTED"
    except old.Rejected as error:
        result = str(error)
    guard.check("CR08-10:old_e01_" + name, result, "INTENT_CONFLICT",
                "Expected historical defect: evidence IDs have unchanged set membership but get a different intent hash.")
print(json.dumps({"status": "historical_counterexample_reproduced", "records": guard.records,
                  "originalIntent": args, "originalHash": first["intent_hash"],
                  "notFinalCodePass": True}, ensure_ascii=False, indent=2))
