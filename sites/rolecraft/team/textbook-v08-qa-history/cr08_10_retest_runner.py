"""Affected c03/e01 retest only, with fresh temp files and Python guards."""
import hashlib
import importlib.util
import json
import pathlib
import sqlite3
import sys
from dataclasses import replace
from types import SimpleNamespace

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
sys.path.insert(0, str(pathlib.Path.cwd().resolve()))  # only extracted, fully read teaching modules
import issue_contract as contract
import c03_issue as tool
store_module = guard.load("e01")

args = {"project": "refund-maintenance", "title": "第七天退款失败",
        "body": "根因待核实\n不自动退款", "evidence_ids": ["repo@8e12:src/refund.py:1-2", "report-71:failure-1"]}
version = contract.ISSUE_TOOL_VERSION
fingerprint = contract.canonical_issue_hash(version, args)
golden = ('{"arguments":{"body":"根因待核实\\n不自动退款",'
          '"evidence_ids":["repo@8e12:src/refund.py:1-2","report-71:failure-1"],'
          '"project":"refund-maintenance","title":"第七天退款失败"},'
          '"canonical_version":"issue-json-utf8-v1","tool_version":"create_issue/v1"}').encode()
guard.check("canonical:fixed_unicode_utf8_bytes", contract.canonical_issue_bytes(version, args).hex(), golden.hex())
guard.check("canonical:fixed_unicode_hash", fingerprint, hashlib.sha256(golden).hexdigest())
permuted = {**args, "evidence_ids": list(reversed(args["evidence_ids"]))}
duplicated = {**args, "evidence_ids": [*permuted["evidence_ids"], args["evidence_ids"][0]]}
guard.check("canonical:order_and_duplicate_set", [contract.canonical_issue_hash(version, value) for value in (permuted, duplicated)], [fingerprint, fingerprint])
escaped = json.loads(json.dumps(args, ensure_ascii=True))
guard.check("canonical:json_unicode_representation", contract.canonical_issue_hash(version, escaped), fingerprint)
guard.check("canonical:body_newline_is_content", contract.canonical_issue_hash(version, {**args, "body": args["body"] + "\n"}) != fingerprint)
guard.check("canonical:no_unicode_normalization", contract.canonical_issue_hash(version, {**args, "title": "é"}) != contract.canonical_issue_hash(version, {**args, "title": "e\u0301"}))
for name, value, code in [("surrogate", {**args, "body": "\ud800"}, "NOT_UTF8_BODY"),
                          ("utf8_title_limit", {**args, "title": "中" * 67}, "TOO_LARGE_TITLE"),
                          ("extra_identity", {**args, "tenant": "model-supplied"}, "ARGUMENT_FIELDS")]:
    try:
        contract.canonical_issue_hash(version, value)
        actual = "ACCEPTED"
    except contract.IssueContractError as error:
        actual = str(error)
    guard.check("canonical:" + name, actual, code)

# Original adapter behaviors, now using real shared fingerprints.
stub = tool.IssueStub()
adapter = tool.IssueAdapter(stub, frozenset({"attempt-1"}))
dispatch = tool.Dispatch("action-1", "attempt-1", "operation-1", fingerprint, args)
lost = adapter.create(dispatch)
guard.check("c03:effect_before_lost_reply", [lost["kind"], lost["attempt_id"], len(stub.issues)], ["UNKNOWN", "attempt-1", 1])
found = stub.lookup(dispatch.idempotency_key)
guard.check("c03:lookup_original_operation", [found["kind"], found["receipt"]["operation_id"]], ["CONFIRMED_SUCCESS", "operation-1"])
retry = adapter.create(replace(dispatch, attempt_id="attempt-2"))
guard.check("c03:same_key_no_duplicate", [retry["kind"], len(stub.issues), retry["receipt"]["issue_id"]], ["SUCCESS", 1, found["receipt"]["issue_id"]])
changed = {**args, "body": "changed"}
conflict = adapter.create(replace(dispatch, attempt_id="attempt-3", arguments=changed, intent_hash=contract.canonical_issue_hash(version, changed)))
guard.check("c03:key_argument_conflict_attempt_only", [conflict["kind"], conflict["proof_scope"], len(stub.issues)], ["KNOWN_NO_EFFECT", "THIS_ATTEMPT_ONLY", 1])
class WrongReceipt:
    def create(self, *unused):
        return {"kind": "SUCCESS", "receipt": {**found["receipt"], "operation_id": "another-operation"}}
guard.check("c03:other_operation_same_content_rejected", tool.IssueAdapter(WrongReceipt()).create(dispatch)["code"], "UNTRUSTED_RECEIPT")
adapter.create(replace(dispatch, attempt_id="attempt-4", idempotency_key="wrong-new-key"))
guard.check("c03:new_key_is_new_effect", len(stub.issues), 2, "Intentional negative control, all objects are in-memory fixtures.")
try:
    adapter.create(replace(dispatch, arguments=permuted))
    bad = "SENT"
except contract.IssueContractError as error:
    bad = str(error)
guard.check("c03:noncanonical_dispatch_never_sends", [bad, len(stub.issues)], ["DISPATCH_INTENT_MISMATCH", 2])

def runrow(store, run):
    return store.db.execute("SELECT * FROM runs WHERE run_id=?", (run,)).fetchone()
def event(store, run, epoch, kind, fields=None, eid=None):
    rev = runrow(store, run)["revision"]
    return store.transact(run, epoch, rev, eid or f"{run}-{kind}-{rev}", {"kind": kind, **(fields or {})}, 1)
def prepare(name):
    store = store_module.Store(name + ".sqlite")
    store.new_run(name, 100)
    epoch = store.acquire(name, 1)
    action = event(store, name, epoch, "intent", {"action_id": name + "-action", "operation_id": name + "-operation", "args": duplicated})
    return store, epoch, action
def reject(name, call, expected):
    try:
        call()
        actual = "ACCEPTED"
    except store_module.Rejected as error:
        actual = str(error)
    guard.check(name, actual, expected)
def approve(store, run, epoch, action):
    return event(store, run, epoch, "approve", {"action_id": action["action_id"], "approval_id": run + "-approval", "intent_hash": action["intent_hash"], "expires_at": 90})

store, epoch, action = prepare("set-equivalence")
stored = store.action(action["action_id"], "set-equivalence")
guard.check("cross:Store_and_adapter_same_fingerprint", [stored["intent_hash"], json.loads(stored["args_json"])], [fingerprint, args])
approve(store, "set-equivalence", epoch, action)
old_approval = dict(store.db.execute("SELECT * FROM approvals").fetchone())
for name, value in [("reordered", permuted), ("duplicate", duplicated)]:
    reused = event(store, "set-equivalence", epoch, "intent", {"action_id": name, "operation_id": name + "-op", "args": value})
    guard.check("cross:" + name + "_reuses_original_approved_action", [reused["action_id"], reused["intent_hash"], dict(store.db.execute("SELECT * FROM approvals").fetchone())], [action["action_id"], fingerprint, old_approval])
legacy_hash = store_module.digest({"tool_version": version, "args": args})
reject("cross:legacy_hash_approval_not_overwritten", lambda: event(store, "set-equivalence", epoch, "approve", {"action_id": action["action_id"], "approval_id": "old-hash", "intent_hash": legacy_hash, "expires_at": 90}), "APPROVAL_MISMATCH")
guard.check("cross:approval_unchanged_after_reject", dict(store.db.execute("SELECT * FROM approvals").fetchone()), old_approval)
store.db.execute("UPDATE actions SET intent_hash=?", (legacy_hash,))
store.db.execute("UPDATE approvals SET intent_hash=?", (legacy_hash,))
reject("cross:legacy_persisted_protocol_blocks_begin", lambda: event(store, "set-equivalence", epoch, "begin", {"action_id": action["action_id"], "attempt_id": "legacy-attempt", "authorized_project": "refund-maintenance"}), "INTENT_PROTOCOL_MISMATCH")
guard.check("cross:legacy_reject_does_not_migrate_approval", [store.db.execute("SELECT intent_hash,consumed FROM approvals").fetchone()[0], store.db.execute("SELECT count(*) FROM attempts").fetchone()[0]], [legacy_hash, 0])
store.db.close()

store, epoch, action = prepare("bridge")
approve(store, "bridge", epoch, action)
rev = runrow(store, "bridge")["revision"]
begin = {"kind": "begin", "action_id": action["action_id"], "attempt_id": "bridge-attempt", "authorized_project": "refund-maintenance"}
remote = tool.IssueStub()
real_adapter = tool.IssueAdapter(remote, frozenset({"bridge-attempt"}))
class Capturing:
    def __init__(self):
        self.calls = 0
    def create(self, value):
        self.calls += 1
        self.dispatch = value
        self.outcome = real_adapter.create(value)
        return self.outcome
capture = Capturing()
clock = SimpleNamespace(now=lambda: 1)
result = store_module.invoke_started_attempt(store, "bridge", epoch, rev, "bridge-begin", begin, "bridge-outcome", capture, clock)
saved = json.loads(store.db.execute("SELECT outcome_json FROM attempts").fetchone()[0])
guard.check("bridge:original_identifiers_and_unknown_committed", [capture.dispatch.action_id, capture.dispatch.attempt_id, capture.dispatch.idempotency_key, capture.dispatch.intent_hash, capture.dispatch.arguments, saved["kind"], saved["attempt_id"], len(remote.issues), store.action(action["action_id"], "bridge")["effect_resolution"]], [action["action_id"], "bridge-attempt", "bridge-operation", fingerprint, args, "UNKNOWN", "bridge-attempt", 1, "UNRESOLVED"])
reject("bridge:repeated_begin_cannot_resend", lambda: store_module.invoke_started_attempt(store, "bridge", epoch, rev, "bridge-begin", begin, "bridge-outcome", capture, clock), "EVENT_ALREADY_RECORDED")
guard.check("bridge:repeat_keeps_one_call_and_object", [capture.calls, len(remote.issues), runrow(store, "bridge")["attempts_used"]], [1, 1, 1])
for field in ("action_id", "attempt_id", "operation_id", "intent_hash"):
    # A new started attempt in a new isolated teaching DB, so only binding is wrong.
    name = "binding-" + field
    other, oe, oa = prepare(name)
    approve(other, name, oe, oa)
    started = event(other, name, oe, "begin", {"action_id": oa["action_id"], "attempt_id": name + "-attempt", "authorized_project": "refund-maintenance"})
    outcome = {"kind": "UNKNOWN", "action_id": oa["action_id"], "attempt_id": name + "-attempt", "operation_id": started["operation_id"], "intent_hash": started["intent_hash"]}
    outcome[field] = "wrong"
    reject("bridge:wrong_" + field + "_rollback", lambda: event(other, name, oe, "outcome", {"action_id": oa["action_id"], "attempt_id": name + "-attempt", "outcome": outcome}), "OUTCOME_BINDING")
    guard.check("bridge:wrong_" + field + "_keeps_started", other.db.execute("SELECT status FROM attempts").fetchone()[0], "STARTED")
    other.db.close()
replayed = store.transact("bridge", epoch, rev + 1, "bridge-outcome", {"kind": "outcome", "action_id": action["action_id"], "attempt_id": "bridge-attempt", "outcome": saved}, 1)
guard.check("bridge:outcome_replay_without_adapter", [replayed == result, capture.calls, len(remote.issues)], [True, 1, 1])
store.db.close()

store, epoch, action = prepare("attempt-no-effect")
approve(store, "attempt-no-effect", epoch, action)
rev = runrow(store, "attempt-no-effect")["revision"]
class ConflictStub:
    def create(self, *unused):
        return {"kind": "CONFLICT", "code": "KEY_ARGUMENT_CONFLICT"}
begin = {"kind": "begin", "action_id": action["action_id"], "attempt_id": "no-effect-attempt", "authorized_project": "refund-maintenance"}
store_module.invoke_started_attempt(store, "attempt-no-effect", epoch, rev, "no-effect-begin", begin, "no-effect-outcome", tool.IssueAdapter(ConflictStub()), clock)
attempt = store.db.execute("SELECT * FROM attempts").fetchone()
outcome = json.loads(attempt["outcome_json"])
guard.check("bridge:attempt_no_effect_preserves_unresolved_operation", [attempt["status"], outcome["kind"], outcome["proof_scope"], store.action(action["action_id"], "attempt-no-effect")["effect_resolution"]], ["FINISHED", "KNOWN_NO_EFFECT", "THIS_ATTEMPT_ONLY", "UNRESOLVED"])
reject("bridge:no_effect_does_not_enable_automatic_resend", lambda: event(store, "attempt-no-effect", epoch, "begin", {**begin, "attempt_id": "new-attempt"}), "NOT_DISPATCHABLE")
store.db.close()
print(json.dumps({"status": "affected_contract_and_bridge_checks_passed", "records": guard.records}, ensure_ascii=False, indent=2))
