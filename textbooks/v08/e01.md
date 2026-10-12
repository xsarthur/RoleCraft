# 持久恢复的提交边界：把动作事实留在数据库里

恢复不应从“上次聊天停在哪里”开始，而应从权威动作账本开始：哪些意图已固定，哪些尝试可能已发，哪个外部效果已确认，谁现在有权推进。数据库事务解决本地记录一致，外部查询解决远端效果不确定；两者没有共同原子点。进程重启时先核对未决动作，再允许模型产生新计划。

本篇把 [控制循环](../agent-control-loop-v07.md) 的存储语义落到一个最小 SQLite 实现，重点是 `create_issue` 生命周期：意图、批准、发送前尝试、结果、取消与核对。其目标仍为 `repo@8e12/test-report-71` 的唯一缺陷工单。作者编写时未执行原创 Python 3.14 示例；本轮独立 QA 在 Python 3.12.14/SQLite 3.53.1 仅检查共享规范、隔离教学库的 Store 与桥接、实际解释器退出后跨进程恢复及事件/代次/取消/verdict的所列有限路径，版本和具体范围见 [QA 记录](../../team/textbook-v08-qa.md)；真实工单、硬件故障、供应商协议及 Python 3.14 目标环境未测。它没有实现全套模型/计划账本、队列、长期租约续期或自动重发，不冒充整体生产运行时。

## 三个提交点定义可恢复事实

**意图提交。**保存准确参数、指纹、动作 ID、唯一槽位和下游操作键，批准绑定同一动作。创建事务成功前不发送。如果提交回执丢失，先按事件 ID读回，不分配另一组身份。模型上下文可引用这些事实，但不能反过来覆盖它们。

**发送前尝试提交。**保存新的 `attempt_id`，扣计尝试预算，设 `IN_FLIGHT + UNRESOLVED`。提交后、真正发送前仍可能崩溃，数据库只知道“可能已发”。这不是缺少一个 `sent=true`字段就能解决：设置它与发送之间仍有窗口。恢复默认核对，不能把 `IN_FLIGHT`当未执行。

**结果提交。**将回执、尝试观察和动作效果一次提交。外部成功、本地提交前崩溃时，核对原操作补齐事实；本地结果已提交但提交回执丢失时，按事件去重读回。完成状态与验收依据同一事务提交，取消与完成的竞态也由这次事务裁决。

SQLite 提供本地事务机制，`BEGIN IMMEDIATE`提前请求写事务，可能因已有写者返回 busy；它不会把网络发送纳入事务。[SQLite Transactions](https://www.sqlite.org/lang_transaction.html) 原子提交的持久性也依赖日志、同步及文件系统假设，不能把一个 `commit`调用推广成任意断电与硬件下都不丢数据。[SQLite Atomic Commit](https://www.sqlite.org/atomiccommit.html)

## 先分清调度状态与效果状态

`status`回答还能怎样调度，`effect_resolution`回答远端效果是否已核对。成功、拒绝、未知与取消不是单个枚举可互相覆盖的状态。本最小实现不启用自动重发：发送后未知只能核对成功或继续等待。完整运行时若加入有效同键重发，会出现 `READY + UNRESOLVED`，未决查询仍须看效果与未结算尝试，而不能只查 `status=UNKNOWN`。

取消先设 `stop_intent`，放弃尚未发送动作，禁止新的尝试。已发请求成功仍需记录为已发生效果；任务保留停止意图，不能因迟到回执变成完成。核对使用独立持久额度，恢复不能把尝试预算归零。额度耗尽而效果仍未知时保留 `WAIT_RESOLUTION`与责任人，不写“取消成功、无工单”。

租约解决谁能推进本地记录。单运行的递增 `lease_epoch`作为栅栏，旧代次不能写状态；它不会撤销旧工作者已经发出的网络请求。新代次按原动作核对，不能因为获得锁就分配新键再发。这里租约时间由可信时钟注入；多主机时钟偏差与数据库时钟语义须另设计，本例不提供分布式时钟保证。

## 一个可检查的存储最小实现

把下面代码保存为 `e01_store.py`。每个实例有独立连接，`isolation_level=None`使代码明确管理事务；SQL值用参数绑定，连接开启外键。本例只使用一个本地数据库文件，不把它放在未经核验的网络文件系统。Python事务/连接控制的依据见 [Python 3.14 sqlite3](https://docs.python.org/3.14/library/sqlite3.html)。运行时实际 Python/SQLite版本须另记录。

事件入口不是模型工具：`intent`接收 c03 校验后的参数，存储仍调用同一规范实现后固定；`approve`只能来自已核身份/范围的审批入口，`lookup_result`只能来自可信下游适配器。先按 [写工具的完整规范](c03.md) 保存 `issue_contract.py`；本篇直接导入它，不另定义意图摘要。下方 `digest`只用于内部事件和候选记录，JSON文本的转义方式不改变写意图协议。事件不可复用不同payload；同事件重复提交返回原结果。

```python
import hashlib
import json
import sqlite3
from issue_contract import (ISSUE_TOOL_VERSION, IssueContractError,
                            canonical_issue_arguments, canonical_issue_hash)

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
                        (run_id, ISSUE_TOOL_VERSION, attempts_max, lookups_max, deadline))

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
        self.issue_arguments(row)
        return row

    def issue_arguments(self, action):
        try:
            stored = json.loads(action["args_json"])
            args = canonical_issue_arguments(stored)
            fingerprint = canonical_issue_hash(action["tool_version"], args)
        except (ValueError, TypeError) as exc:
            raise Rejected("INTENT_PROTOCOL_MISMATCH") from exc
        if args != stored or fingerprint != action["intent_hash"]:
            raise Rejected("INTENT_PROTOCOL_MISMATCH")
        return args  # 校验，不UPDATE旧参数、指纹或批准。

    def transact(self, run_id, epoch, expected_revision, event_id, event, now, allow_replay=True):
        payload_hash = digest({"run_id": run_id, "event": event})
        self.db.execute("BEGIN IMMEDIATE")
        try:
            old = self.db.execute("SELECT * FROM events WHERE event_id=?", (event_id,)).fetchone()
            if old is not None:
                if old["payload_hash"] != payload_hash:
                    raise Rejected("EVENT_ID_CONFLICT")
                if not allow_replay:
                    raise Rejected("EVENT_ALREADY_RECORDED")
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
            try:
                args = canonical_issue_arguments(event["args"])
                intent_hash = canonical_issue_hash(run["tool_version"], args)
            except IssueContractError as exc:
                raise Rejected(str(exc)) from exc
            old = self.db.execute("SELECT * FROM actions WHERE run_id=? AND "
                                  "goal_revision=? AND slot='defect_issue'",
                                  (run_id, run["goal_revision"])).fetchone()
            if old is not None:
                self.issue_arguments(old)
                if old["intent_hash"] != intent_hash:
                    raise Rejected("INTENT_CONFLICT")
                return {"action_id": old["action_id"], "intent_hash": old["intent_hash"],
                        "reused": True}
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
                self.issue_arguments(item)
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
                    "verdict_ids": [json.loads(a["verdict_json"])["verdict_id"] for a in rows],
                    "actions": [{"action_id": a["action_id"],
                                 "receipt_ref": "actions/" + a["action_id"] + "/receipt"}
                                for a in rows]}
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
            return {"kind": "DISPATCH", "action_id": action["action_id"],
                    "attempt_id": event["attempt_id"], "operation_id": action["operation_id"],
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
            if kind == "outcome" and (
                    outcome.get("action_id") != action["action_id"]
                    or outcome.get("attempt_id") != event["attempt_id"]
                    or outcome.get("operation_id") != action["operation_id"]
                    or outcome.get("intent_hash") != action["intent_hash"]):
                raise Rejected("OUTCOME_BINDING")
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
            elif outcome["kind"] == "KNOWN_NO_EFFECT":
                if outcome.get("proof_scope") != "THIS_ATTEMPT_ONLY":
                    raise Rejected("PROOF_SCOPE_UNSUPPORTED")
                # 保存本次无效果证明；不清除操作未决，不开启自动重发。
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
```

这段代码用事务内读取与条件检查表达状态迁移，未在SQL事务里等待网络。动态SQL仅由两个代码内部常量表名/字段选择构成，业务值均参数化。执行例子只需临时文件路径；没有默认访问任何项目数据库的入口。

`candidate`保存最终候选正文及哈希；`verdict`保存相同目标版本、候选哈希、意图指纹、回执版本、独立证据引用与判断；`complete`重新检查这些关联再写终态。最小代码没有实现专业验收器，因此可信入口须确保判断与证据真实，不能开放模型自写accepted。存储负责证据绑定而非根因真伪，专业审核仍单独进行。

## 用一次恢复轨迹读懂提交边界

先创建run和意图，把意图事务返回的 `action_id/intent_hash`交给可信审批入口；批准必须回送这个入库指纹，不在审批端对显示JSON另算。唯一槽位同意图只返回原记录，`approve`使用唯一动作约束的 INSERT，已有批准不能被第二个事件覆盖。`begin`成功提交之后才能执行；以下桥接代码也保存到 `e01_store.py`，依赖 c03 的 `c03_issue.py`。它明确把入库身份映射到 `Dispatch`，结果只能提交给该 `attempt_id`。`now`及身份/项目许可来自可信运行时，不是模型字段。

```python
from c03_issue import Dispatch

def invoke_started_attempt(store, run_id, epoch, expected_revision,
                           begin_event_id, begin_event, outcome_event_id,
                           adapter, clock):
    if begin_event["kind"] != "begin":
        raise Rejected("BEGIN_REQUIRED")
    started = store.transact(run_id, epoch, expected_revision,
                             begin_event_id, begin_event, clock.now(), allow_replay=False)
    if started["kind"] != "DISPATCH":
        raise Rejected("DISPATCH_REQUIRED")
    dispatch = Dispatch(action_id=started["action_id"], attempt_id=started["attempt_id"],
                        idempotency_key=started["operation_id"],
                        intent_hash=started["intent_hash"], arguments=started["args"])
    outcome = adapter.create(dispatch)  # 网络/替身调用在数据库事务外。
    return store.transact(run_id, epoch, expected_revision + 1, outcome_event_id,
                          {"kind": "outcome", "action_id": dispatch.action_id,
                           "attempt_id": dispatch.attempt_id, "outcome": outcome}, clock.now())
```

桥接的 `allow_replay=False`使重复begin事件在事务内拒绝，不能从旧DISPATCH再次发送。事件回执丢失或工作者重启时，先读权威动作/attempt，再走核对。结果事务回执丢失时仅重放原outcome事件，不重调适配器；并发新事件导致revision变化则重新读账、保留同一结果与attempt再提交，不能递增尝试ID来绕过冲突。代次失效时留原观察给当前恢复者核对。若外部替身先创建工单再丢回执，适配器返回本次 `UNKNOWN`；若进程直接退出，本地attempt保持 `STARTED`。单次 `KNOWN_NO_EFFECT`也保存原proof/code并结算该观察，但动作仍未决，继续查原操作，不自动重发。

新工作者待租约失效后取得新代次，读取同一个动作、操作键与参数。提交 `begin_lookup`，用返回原键查询独立外部服务；确认回执匹配后交 `lookup_result(kind=SUCCESS)`。结果事务写回动作成功，同时将旧仍在等待的物理尝试记 `SUPERSEDED`，保留它原来未知响应与计数，不编一条“旧请求成功返回”。本例不结算供应商费用，费用记录须在完整模型/工具预算账本中另保留，不能当零。

如果查询没找到、超时或仍在执行，提交 `UNKNOWN`并退出等待。没有“查不到就发”的分支。本例不自动重发，故没有声称覆盖下游幂等窗口外的恢复；需要安全原键重发时，按 c03 的许可/批准/权限合同扩充事件与状态，不直接修改 `UNRESOLVED`为无效果。

取消发生后，核对成功仍可提交，效果账本变成功，但 `stop_intent=1`阻止 `complete`。当前工作者调用 `finish_stopped`：效果或物理观察仍未决则事务写 `WAIT_RESOLUTION`，否则写 `STOPPED`。`STOP_REQUESTED`只是停止意图，不是这两个终态之一；已确认工单不删除。

## 已实现的终态保证与版本变化

本例将当前结构化verdict放在动作记录中，包含 `verdict_id/goal_revision/candidate_hash/intent_hash/receipt_version/accepted/evidence_refs`；run保存最终候选。完成事务重读目标与候选，确认当前verdict关联、无未决效果与业务观察、无停止意图和未超期限，再写 `COMPLETED`及事件结果。历史专业意见与证据快照应另留不可变审计表，不能用覆盖当前verdict代表保存完整评审历史；本最小例尚未实现这项历史表。

停止事务的前置条件是所有写动作效果不再 `UNRESOLVED`，所有仍等待物理观察的attempt/lookup已经有结果或被操作级证据合法取代；否则仅保存 `WAIT_RESOLUTION`。满足时写 `STOPPED`，本例只保留布尔停止意图，实际停因与部分成果在事件输入/上层任务记录中另存。生产扩展须把原因和产物引用一起持久化；若需要补偿交另一个明确授权任务。这与 v07 的 `FinishStopped`语义相接，不把取消解释成回滚。

示例 `metadata.version=1`只接受本版。未知schema拒绝运行，旧记录也不能靠删除数据库解决。生产迁移先备份冻结数据，在事务中新增/变换字段，核每个未决动作的原操作键、参数/批准指纹、效果状态和工具版本保持，再提高schema。工具新增参数无法从旧记录确定时暂停补信息，新指纹重新批准；不能用任意默认项目把旧批准扩大。回退代码也要确认能读取新记录，schema迁移不等于程序可回退。

schema版本也不能证明意图字节协议相容。`issue_arguments`在批准、发送、结果和完成入口核已保存参数与共享规范指纹，发现旧 `ensure_ascii=True`摘要或未规范证据列表时返回 `INTENT_PROTOCOL_MISMATCH`，事务回滚，原批准不变。这是本教学v1合同澄清，不是旧批准迁移算法。兼容性未恢复前停止新发送；旧未决效果保留原键和旧协议，由兼容适配器或明确人工流程继续核对，不能删除历史后重新创建。

## 用故障位置验证，而不是只测正常重启

为每个场景保存当前文稿/实现哈希、数据库与外部替身的独立快照、注入点、真实进程退出/重启、模型请求次数、尝试数、操作键及对象数。只在同进程抛一个异常可以测分支，不能证明跨进程持久恢复。

| 注入点 | 恢复预期 | 必须独立核的证据 |
| --- | --- | --- |
| 意图提交后、begin前 | 原动作仍存在；等待原批准，不分配新键 | 意图与唯一槽位 |
| begin后、发送前 | 本地保守未决，按原键核对 | 未决attempt；替身明确是否接收 |
| 外部创建后、本地结果前 | 查询原回执，只有一条工单 | 外部对象与操作账本已持久 |
| 结果提交后、提交回执丢失 | 重复event返回同结果，不重复扣预算 | 事件ID、payload哈希及数据库结果 |
| 旧工作者恢复、新代次已推进 | 旧事件被NOT_OWNER拒绝，远端旧效果仍需核对 | 两工作者并存，不先杀旧者掩竞态 |
| 取消后成功迟到 | 记录效果，完成被拒；无未决后停止 | stop_intent、回执与最终状态分别核 |

**练习：可重启替身。**把 c03 内存替身改为独立临时SQLite文件，操作键与工单在该替身自己的事务中插入；运行时数据库用另一个文件。创建后终止工作者，重新启动读两个数据库，按原键补回执。参考分析：两个本地文件仍没有跨库事务，此练习故意保留危险窗口；单对象来自替身去重与核对，而非运行时checkpoint。所有实际文件限隔离练习目录，提交运行前后快照，未执行时不填写对象数。

**练习：并发与事件重放。**两连接同时acquire同run，保留旧者停顿，再令新者取得新epoch，旧者提交结果。参考分析：事务只允许一个有效租约；旧者提交新事件被拒。相同event同payload返回既有结果，不消耗二次预算；同ID不同payload冲突。已有成功不能由迟到UNKNOWN重新打开。检查这些行为，而不是只看函数无异常。

**练习：版本和取消。**旧记录缺新工具要求的 `recipient`，维护者此前批准旧正文；恢复者拟填默认值并继续。参考分析：字段无法确定与批准失配，暂停并明确迁移/补证；不能沿旧批准。另测试取消与完成同时提交，事务应决定先后，取消先写则不能完成；完成已经提交后收到取消，需要定义新任务/后续动作，不回写旧事实。这些结果只证明当前协议，真实下游与硬件故障模型仍待核验。
