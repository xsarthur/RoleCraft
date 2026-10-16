from dataclasses import asdict, dataclass, replace
from hashlib import sha256
import json
from threading import Lock

SENSITIVE_KEYS = {"secret_token", "private_email", "payment_card", "budget_notes"}
PUBLIC_FIELDS = ("repo_revision", "report_id", "failure_id", "failure_text")

def json_text(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))

def secret_values(value):
    found = set()
    def leaves(item):
        if isinstance(item, str) and item:
            found.add(item)
        elif isinstance(item, dict):
            for child in item.values():
                leaves(child)
        elif isinstance(item, list):
            for child in item:
                leaves(child)
    def visit(item):
        if isinstance(item, dict):
            for key, child in item.items():
                if key in SENSITIVE_KEYS:
                    leaves(child)
                else:
                    visit(child)
        elif isinstance(item, list):
            for child in item:
                visit(child)
    visit(value)
    return frozenset(found)

def contains_marker(value, markers):
    if isinstance(value, str):
        return any(marker in value for marker in markers)
    if isinstance(value, dict):
        return any(contains_marker(key, markers) or contains_marker(child, markers)
                   for key, child in value.items())
    if isinstance(value, (list, tuple)):
        return any(contains_marker(child, markers) for child in value)
    return False

def project_report(raw):
    markers = secret_values(raw)
    projected = {}
    for field in PUBLIC_FIELDS:
        value = raw.get(field)
        if not isinstance(value, str) or len(value) > 8000:
            raise ValueError("PUBLIC_FIELD_INVALID")
        for marker in sorted(markers, key=len, reverse=True):
            value = value.replace(marker, "[REDACTED]")
        projected[field] = value
    return projected, markers

@dataclass(frozen=True)
class Principal:
    tenant_id: str
    principal_id: str
    projects: frozenset[str]
    tools: frozenset[str]

@dataclass(frozen=True)
class Goal:
    run_id: str
    revision: int
    project: str
    allow_write: bool

@dataclass(frozen=True)
class Intent:
    tenant_id: str
    principal_id: str
    run_id: str
    goal_revision: int
    action_id: str
    tool: str
    tool_version: str
    project: str
    title: str
    body: str
    evidence_refs: tuple[str, ...]

def digest(intent):
    return sha256(json_text(asdict(intent)).encode("utf-8")).hexdigest()

@dataclass(frozen=True)
class Approval:
    approval_id: str
    action_id: str
    intent_digest: str
    expires_at: int
    consumed_by: str | None = None

@dataclass(frozen=True)
class State:
    approvals: dict
    receipts: dict
    slots: dict

class LocalIssueDesk:
    def __init__(self):
        self._lock = Lock()
        self._state = State({}, {}, {})
        self.events = []  # 只放宿主固定的事件代码，不放原始载荷

    def grant(self, approval):
        with self._lock:
            if approval.approval_id in self._state.approvals:
                raise ValueError("APPROVAL_ID_EXISTS")
            items = dict(self._state.approvals)
            items[approval.approval_id] = approval
            self._state = State(items, self._state.receipts, self._state.slots)

    def execute(self, principal, goal, intent, approval_id, now, markers):
        with self._lock:
            def deny(code):
                self.events.append({"stage": "gate", "code": code})
                return "DENIED:" + code, None
            if (intent.tenant_id != principal.tenant_id or
                    intent.principal_id != principal.principal_id):
                return deny("IDENTITY_MISMATCH")
            if (intent.run_id, intent.goal_revision) != (goal.run_id, goal.revision):
                return deny("GOAL_MISMATCH")
            if intent.tool != "create_issue" or intent.tool not in principal.tools:
                return deny("TOOL_DENIED")
            if intent.tool_version != "local-double-v1":
                return deny("TOOL_VERSION_DENIED")
            if intent.project != goal.project or intent.project not in principal.projects:
                return deny("PROJECT_DENIED")
            if not goal.allow_write:
                return deny("WRITE_OUT_OF_SCOPE")
            if contains_marker(asdict(intent), markers):
                return deny("SENSITIVE_PAYLOAD")
            current_digest = digest(intent)
            previous = self._state.receipts.get(intent.action_id)
            if previous is not None:
                if previous["intent_digest"] != current_digest:
                    return deny("ACTION_ARGUMENT_CONFLICT")
                return "OBSERVED", dict(previous)  # 无发送、无再次消费
            approval = self._state.approvals.get(approval_id)
            if approval is None:
                return deny("APPROVAL_MISSING")
            if approval.consumed_by is not None:
                return deny("APPROVAL_CONSUMED")
            if now >= approval.expires_at:
                return deny("APPROVAL_EXPIRED")
            if (approval.action_id != intent.action_id or
                    approval.intent_digest != current_digest):
                return deny("APPROVAL_INTENT_MISMATCH")
            slot = (intent.tenant_id, goal.run_id, goal.revision, "defect_issue")
            if slot in self._state.slots:
                return deny("EFFECT_SLOT_OCCUPIED")
            receipt = {"issue_id": "demo-" + intent.action_id,
                       "project": intent.project, "intent_digest": current_digest}
            approvals = dict(self._state.approvals)
            receipts = dict(self._state.receipts)
            slots = dict(self._state.slots)
            approvals[approval_id] = replace(approval, consumed_by=intent.action_id)
            receipts[intent.action_id] = receipt
            slots[slot] = intent.action_id
            self._state = State(approvals, receipts, slots)  # 局部生效点
            self.events.append({"stage": "commit", "code": "DEMO_ISSUE_CREATED"})
            return "CREATED", dict(receipt)

if __name__ == "__main__":
    raw = {"repo_revision": "repo@8e12", "report_id": "test-report-71",
           "failure_id": "report-71:failure-1", "failure_text": "test_refund_day_7: days=7; expected=True; actual=False",
           "debug": {"secret_token": "fixture-token-never-send",
                     "private_email": "private@example.invalid"}}
    context, markers = project_report(raw)
    user_output = "days=7 时断言 expected=True、actual=False；根因尚需核对，引用 report-71:failure-1。"
    principal = Principal("tenant-dev", "maintainer-lin",
                          frozenset({"refund-maintenance"}), frozenset({"create_issue"}))
    goal = Goal("run-17", 1, "refund-maintenance", True)
    intent = Intent(principal.tenant_id, principal.principal_id, goal.run_id,
                    goal.revision, "action-17", "create_issue", "local-double-v1",
                    goal.project, "退款第七天断言失败", user_output, ("report-71:failure-1",))
    desk = LocalIssueDesk()
    desk.grant(Approval("approval-17", intent.action_id, digest(intent), 110))
    print(desk.execute(principal, goal, intent, "approval-17", 100, markers)[0])
    print(desk.execute(principal, goal, intent, "approval-17", 120, markers)[0])
    fresh = LocalIssueDesk()
    fresh.grant(Approval("approval-17", intent.action_id, digest(intent), 110))
    print(fresh.execute(principal, goal, intent, "approval-17", 110, markers)[0])
    changed = replace(intent, project="public-security")
    print(fresh.execute(principal, goal, changed, "approval-17", 100, markers)[0])
    channels = {"context": context, "output": user_output,
                "payload": asdict(intent), "logs": desk.events + fresh.events}
    for channel, value in channels.items():
        assert not contains_marker(value, markers), channel
