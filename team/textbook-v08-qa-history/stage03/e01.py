import hashlib
import json
import sqlite3

def canonical(value):
    return json.dumps(value, sort_keys=True, ensure_ascii=True, separators=(",", ":"))

def digest(value):
    return hashlib.sha256(canonical(value).encode("utf-8")).hexdigest()

class Rejected(Exception):
    pass

SCHEMA = """
CREATE TABLE IF NOT EXISTS metadata(id INTEGER PRIMARY KEY CHECK(id=1),version INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS runs(
 run_id TEXT PRIMARY KEY, goal_revision INTEGER NOT NULL,
 tool_version TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 0,
 lease_epoch INTEGER NOT NULL DEFAULT 0, lease_until INTEGER NOT NULL DEFAULT 0,
 stop_intent INTEGER NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'ACTIVE',
 attempts_used INTEGER NOT NULL DEFAULT 0, attempts_max INTEGER NOT NULL,
 lookups_used INTEGER NOT NULL DEFAULT 0, lookups_max INTEGER NOT NULL,
 deadline INTEGER NOT NULL,candidate_json TEXT,candidate_hash TEXT);
CREATE TABLE IF NOT EXISTS actions(
 action_id TEXT PRIMARY KEY, run_id TEXT NOT NULL REFERENCES runs(run_id),
 slot TEXT NOT NULL, goal_revision INTEGER NOT NULL, tool_version TEXT NOT NULL,
 args_json TEXT NOT NULL, intent_hash TEXT NOT NULL, operation_id TEXT UNIQUE NOT NULL,
 status TEXT NOT NULL, effect_resolution TEXT NOT NULL, receipt_json TEXT,verdict_json TEXT,
 UNIQUE(run_id,goal_revision,slot));
CREATE TABLE IF NOT EXISTS approvals(
 approval_id TEXT PRIMARY KEY, action_id TEXT UNIQUE NOT NULL REFERENCES actions(action_id),
 intent_hash TEXT NOT NULL, expires_at INTEGER NOT NULL, revoked INTEGER NOT NULL DEFAULT 0,
 consumed INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS attempts(
 attempt_id TEXT PRIMARY KEY, action_id TEXT NOT NULL REFERENCES actions(action_id),
 lease_epoch INTEGER NOT NULL, status TEXT NOT NULL, outcome_json TEXT);
CREATE TABLE IF NOT EXISTS lookups(
 lookup_id TEXT PRIMARY KEY, action_id TEXT NOT NULL REFERENCES actions(action_id),
 lease_epoch INTEGER NOT NULL, status TEXT NOT NULL, outcome_json TEXT);
CREATE TABLE IF NOT EXISTS events(
 event_id TEXT PRIMARY KEY, run_id TEXT NOT NULL REFERENCES runs(run_id),
 payload_hash TEXT NOT NULL, result_json TEXT NOT NULL);
"""

class Store:
    def __init__(self, path):
        self.db = sqlite3.connect(path, isolation_level=None, timeout=2)
        self.db.row_factory = sqlite3.Row
        has_metadata = self.db.execute("SELECT 1 FROM sqlite_master WHERE type='table' "
                                       "AND name='metadata'").fetchone()
        if has_metadata:
            existing = self.db.execute("SELECT version FROM metadata WHERE id=1").fetchone()
            if existing is None or existing[0] != 1:
                self.db.close()
                raise Rejected("SCHEMA_UNSUPPORTED")
        self.db.execute("PRAGMA foreign_keys=ON")
        self.db.execute("PRAGMA journal_mode=DELETE")
        self.db.execute("PRAGMA synchronous=FULL")
        self.db.executescript(SCHEMA)
        self.db.execute("INSERT OR IGNORE INTO metadata VALUES(1,1)")
        row = self.db.execute("SELECT version FROM metadata WHERE id=1").fetchone()
        if row[0] != 1:
            raise Rejected("SCHEMA_UNSUPPORTED")

    def new_run(self, run_id, deadline, attempts_max=3, lookups_max=5):
        self.db.execute("INSERT INTO runs(run_id,goal_revision,tool_version,"
                        "attempts_max,lookups_max,deadline) VALUES(?,1,?,?,?,?)",
                        (run_id, "create_issue/v1", attempts_max, lookups_max, deadline))

    def acquire(self, run_id, now, ttl=10):
        self.db.execute("BEGIN IMMEDIATE")
        try:
            row = self.db.execute("SELECT * FROM runs WHERE run_id=?", (run_id,)).fetchone()
            if row is None or row["lease_until"] > now:
                raise Rejected("LEASE_BUSY_OR_MISSING")
            epoch = row["lease_epoch"] + 1
            self.db.execute("UPDATE runs SET lease_epoch=?,lease_until=? WHERE run_id=?",
                            (epoch, now + ttl, run_id))
            self.db.commit()
            return epoch
        except Exception:
            self.db.rollback()
            raise

    def action(self, action_id, run_id):
        row = self.db.execute("SELECT * FROM actions WHERE action_id=? AND run_id=?",
                              (action_id, run_id)).fetchone()
        if row is None:
            raise Rejected("ACTION_MISSING")
        return row

    def transact(self, run_id, epoch, expected_revision, event_id, event, now):
        payload_hash = digest({"run_id": run_id, "event": event})
        self.db.execute("BEGIN IMMEDIATE")
        try:
            old = self.db.execute("SELECT * FROM events WHERE event_id=?", (event_id,)).fetchone()
            if old is not None:
                if old["payload_hash"] != payload_hash:
                    raise Rejected("EVENT_ID_CONFLICT")
                self.db.commit()
                return json.loads(old["result_json"])
            run = self.db.execute("SELECT * FROM runs WHERE run_id=?", (run_id,)).fetchone()
            if run is None or run["lease_epoch"] != epoch or run["lease_until"] <= now:
                raise Rejected("NOT_OWNER")
            if run["revision"] != expected_revision:
                raise Rejected("STALE_REVISION")
            result = self.reduce(run, event, now)
            self.db.execute("UPDATE runs SET revision=revision+1 WHERE run_id=?", (run_id,))
            self.db.execute("INSERT INTO events VALUES(?,?,?,?)",
                            (event_id, run_id, payload_hash, canonical(result)))
            self.db.commit()
            return result
        except Exception:
            self.db.rollback()
            raise

    def reduce(self, run, event, now):
        run_id, kind = run["run_id"], event["kind"]
        if run["status"] in ("COMPLETED", "STOPPED", "FAILED"):
            raise Rejected("RUN_TERMINAL")
        if kind == "intent":
            if run["stop_intent"] or now >= run["deadline"]:
                raise Rejected("STOPPED_OR_DEADLINE")
            args = event["args"]  # c03已校验；此处重新固定指纹。
            intent_hash = digest({"tool_version": run["tool_version"], "args": args})
            old = self.db.execute("SELECT * FROM actions WHERE run_id=? AND "
                                  "goal_revision=? AND slot='defect_issue'",
                                  (run_id, run["goal_revision"])).fetchone()
            if old is not None:
                if old["intent_hash"] != intent_hash:
                    raise Rejected("INTENT_CONFLICT")
                return {"action_id": old["action_id"], "reused": True}
            self.db.execute("INSERT INTO actions(action_id,run_id,slot,goal_revision,"
                "tool_version,args_json,intent_hash,operation_id,status,effect_resolution) "
                "VALUES(?,?,'defect_issue',?,?,?,?,?,'WAIT_APPROVAL','NOT_SENT')",
                (event["action_id"], run_id, run["goal_revision"], run["tool_version"],
                 canonical(args), intent_hash, event["operation_id"]))
            return {"action_id": event["action_id"], "intent_hash": intent_hash}
        if kind == "stop":
            self.db.execute("UPDATE runs SET stop_intent=1 WHERE run_id=?", (run_id,))
            self.db.execute("UPDATE actions SET status='ABANDONED' WHERE run_id=? "
                            "AND effect_resolution='NOT_SENT'", (run_id,))
            return {"kind": "STOP_REQUESTED"}
        if kind == "candidate":
            if run["stop_intent"] or now >= run["deadline"]:
                raise Rejected("STOPPED_OR_DEADLINE")
            candidate_json = canonical(event["candidate"])
            candidate_hash = digest(event["candidate"])
            self.db.execute("UPDATE runs SET candidate_json=?,candidate_hash=? WHERE run_id=?",
                            (candidate_json, candidate_hash, run_id))
            return {"candidate_hash": candidate_hash}
        if kind == "finish_stopped":
            unresolved = self.db.execute("SELECT 1 FROM actions WHERE run_id=? AND "
                                        "effect_resolution='UNRESOLVED'", (run_id,)).fetchone()
            pending = self.pending_observation(run_id)
            if not run["stop_intent"]:
                raise Rejected("STOP_NOT_REQUESTED")
            status = "WAIT_RESOLUTION" if unresolved or pending else "STOPPED"
            self.db.execute("UPDATE runs SET status=? WHERE run_id=?", (status, run_id))
            return {"kind": status}
        if kind == "complete":
            rows = self.db.execute("SELECT * FROM actions WHERE run_id=?", (run_id,)).fetchall()
            pending = self.pending_observation(run_id)
            if (run["stop_intent"] or now >= run["deadline"] or not rows or pending or any(
                    a["effect_resolution"] != "CONFIRMED_SUCCESS" for a in rows)):
                raise Rejected("CANNOT_COMPLETE")
            for item in rows:
                verdict = json.loads(item["verdict_json"]) if item["verdict_json"] else None
                receipt = json.loads(item["receipt_json"])
                if (verdict is None or verdict["accepted"] is not True
                        or verdict["goal_revision"] != run["goal_revision"]
                        or verdict["candidate_hash"] != run["candidate_hash"]
                        or verdict["intent_hash"] != item["intent_hash"]
                        or verdict["receipt_version"] != receipt["version"]):
                    raise Rejected("VERDICT_STALE_OR_MISSING")
            self.db.execute("UPDATE runs SET status='COMPLETED' WHERE run_id=?", (run_id,))
            return {"kind": "COMPLETED", "candidate_hash": run["candidate_hash"],
                    "verdict_ids": [json.loads(a["verdict_json"])["verdict_id"] for a in rows]}
        action = self.action(event["action_id"], run_id)
        if action["goal_revision"] != run["goal_revision"] or action["tool_version"] != run["tool_version"]:
            raise Rejected("CONTRACT_VERSION")
        if kind == "approve":
            if (run["stop_intent"] or event["intent_hash"] != action["intent_hash"] or event["expires_at"] <= now
                    or action["effect_resolution"] != "NOT_SENT"):
                raise Rejected("APPROVAL_MISMATCH")
            self.db.execute("INSERT INTO approvals(approval_id,action_id,intent_hash,expires_at) "
                            "VALUES(?,?,?,?)", (event["approval_id"], action["action_id"],
                                               action["intent_hash"], event["expires_at"]))
            self.db.execute("UPDATE actions SET status='READY' WHERE action_id=?", (action["action_id"],))
            return {"kind": "APPROVED"}
        if kind == "verdict":
            verdict = event["verdict"]  # 可信独立验收入口给出专业判断与证据引用。
            if (not run["candidate_hash"] or verdict["candidate_hash"] != run["candidate_hash"]
                    or verdict["goal_revision"] != run["goal_revision"]
                    or verdict["intent_hash"] != action["intent_hash"]
                    or action["effect_resolution"] != "CONFIRMED_SUCCESS"
                    or verdict["receipt_version"] != json.loads(action["receipt_json"])["version"]
                    or type(verdict["accepted"]) is not bool or not verdict["evidence_refs"]):
                raise Rejected("VERDICT_BINDING")
            self.db.execute("UPDATE actions SET verdict_json=? WHERE action_id=?",
                            (canonical(verdict), action["action_id"]))
            return {"kind": "VERDICT_RECORDED", "accepted": verdict["accepted"]}
        if kind == "begin":
            approval = self.db.execute("SELECT * FROM approvals WHERE action_id=?",
                                       (action["action_id"],)).fetchone()
            if (run["stop_intent"] or now >= run["deadline"]
                    or run["attempts_used"] >= run["attempts_max"]):
                raise Rejected("STOPPED_OR_BUDGET")
            if action["status"] != "READY" or action["effect_resolution"] != "NOT_SENT":
                raise Rejected("NOT_DISPATCHABLE")
            if (approval is None or approval["revoked"] or approval["consumed"]
                    or approval["expires_at"] <= now or approval["intent_hash"] != action["intent_hash"]):
                raise Rejected("APPROVAL_INVALID")
            # 当前对象权限由可信入口在此事务/同策略版本下核；event不可由模型调用。
            if event["authorized_project"] != json.loads(action["args_json"])["project"]:
                raise Rejected("PROJECT_DENIED")
            self.db.execute("INSERT INTO attempts VALUES(?,?,?,'STARTED',NULL)",
                            (event["attempt_id"], action["action_id"], run["lease_epoch"]))
            self.db.execute("UPDATE approvals SET consumed=1 WHERE action_id=?", (action["action_id"],))
            self.db.execute("UPDATE actions SET status='IN_FLIGHT',effect_resolution='UNRESOLVED' "
                            "WHERE action_id=?", (action["action_id"],))
            self.db.execute("UPDATE runs SET attempts_used=attempts_used+1 WHERE run_id=?", (run_id,))
            return {"kind": "DISPATCH", "operation_id": action["operation_id"],
                    "intent_hash": action["intent_hash"], "args": json.loads(action["args_json"])}
        if kind == "begin_lookup":
            if action["effect_resolution"] != "UNRESOLVED" or run["lookups_used"] >= run["lookups_max"]:
                raise Rejected("LOOKUP_UNAVAILABLE")
            self.db.execute("INSERT INTO lookups VALUES(?,?,?,'STARTED',NULL)",
                            (event["lookup_id"], action["action_id"], run["lease_epoch"]))
            self.db.execute("UPDATE runs SET lookups_used=lookups_used+1 WHERE run_id=?", (run_id,))
            return {"operation_id": action["operation_id"]}
        if kind in ("outcome", "lookup_result"):
            table, key = ("attempts", "attempt_id") if kind == "outcome" else ("lookups", "lookup_id")
            row = self.db.execute("SELECT * FROM " + table + " WHERE " + key + "=? AND action_id=?",
                                  (event[key], action["action_id"])).fetchone()
            if row is None or row["status"] != "STARTED" or row["lease_epoch"] != run["lease_epoch"]:
                raise Rejected("ATTEMPT_OR_LOOKUP_MISMATCH")
            outcome = event["outcome"]
            if outcome["kind"] == "SUCCESS":
                receipt = outcome["receipt"]
                args = json.loads(action["args_json"])
                if (receipt["operation_id"] != action["operation_id"]
                        or receipt["intent_hash"] != action["intent_hash"]
                        or receipt["project"] != args["project"]):
                    raise Rejected("RECEIPT_MISMATCH")
                self.db.execute("UPDATE actions SET status='SUCCEEDED',effect_resolution="
                    "'CONFIRMED_SUCCESS',receipt_json=? WHERE action_id=?",
                    (canonical(receipt), action["action_id"]))
                # 操作级确认关闭旧观察等待，不伪造旧物理请求成功。
                self.db.execute("UPDATE attempts SET status='SUPERSEDED' WHERE action_id=? "
                    "AND status='STARTED'", (action["action_id"],))
                self.db.execute("UPDATE lookups SET status='SUPERSEDED' WHERE action_id=? "
                    "AND status='STARTED'", (action["action_id"],))
            elif outcome["kind"] != "UNKNOWN":
                raise Rejected("OUTCOME_UNSUPPORTED")
            self.db.execute("UPDATE " + table + " SET status='FINISHED',outcome_json=? WHERE " + key + "=?",
                            (canonical(outcome), event[key]))
            return {"kind": "RECORDED", "effect_confirmed": outcome["kind"] == "SUCCESS"}
        raise Rejected("EVENT_UNSUPPORTED")

    def pending_observation(self, run_id):
        for table in ("attempts", "lookups"):
            if self.db.execute("SELECT 1 FROM " + table + " JOIN actions USING(action_id) "
                "WHERE actions.run_id=? AND " + table + ".status='STARTED'", (run_id,)).fetchone():
                return True
        return False
