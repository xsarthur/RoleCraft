"""Standard-library coordinator policy, not an A2A server or transport test."""
from dataclasses import dataclass, field
import json

TERMINAL = {"completed", "failed", "canceled", "rejected"}
ALLOWED = {
    "submitted": {"working", "input-required", "auth-required", *TERMINAL},
    "working": {"working", "input-required", "auth-required", *TERMINAL},
    "input-required": {"working", "failed", "canceled"},
    "auth-required": {"working", "failed", "canceled"},
}


@dataclass
class Task:
    task_id: str
    source_version: str
    budget: int
    epoch: int = 1
    state: str = "submitted"
    spent: int = 0
    seen: dict = field(default_factory=dict)
    claims: list = field(default_factory=list)

    def reassign(self, expected_epoch):
        if self.state in TERMINAL or expected_epoch != self.epoch:
            raise ValueError("cannot reassign this revision")
        self.epoch += 1
        self.state = "submitted"
        self.claims.clear()
        # Spent and seen persist; reassign does not replenish a parent's budget.
        return self.epoch

    def apply(self, event):
        required = {"event_id", "task_id", "epoch", "version", "state", "cost", "claims"}
        if set(event) != required or event["task_id"] != self.task_id:
            raise ValueError("event schema or task mismatch")
        eid = event["event_id"]
        if not isinstance(eid, str) or not eid:
            raise ValueError("invalid event identity")
        frozen = json.dumps(event, sort_keys=True, separators=(",", ":"), allow_nan=False)
        if eid in self.seen:
            if self.seen[eid] != frozen:
                raise ValueError("event identity reused with different payload")
            return "duplicate"
        if event["epoch"] != self.epoch:
            raise ValueError("stale worker epoch")
        if self.state in TERMINAL or event["state"] not in ALLOWED.get(self.state, set()):
            raise ValueError("illegal transition")
        if event["version"] != self.source_version:
            raise ValueError("stale source")
        cost = event["cost"]
        if type(cost) is not int or cost < 0 or self.spent + cost > self.budget:
            raise ValueError("budget exceeded or invalid cost")
        if not isinstance(event["claims"], list):
            raise ValueError("claims must be a list")
        for claim in event["claims"]:
            if not isinstance(claim, dict) or set(claim) != {"key", "value", "source"} or not claim["source"]:
                raise ValueError("unsupported claim schema")
        self.spent += cost
        self.state = event["state"]
        self.claims.extend(dict(c) for c in event["claims"])
        self.seen[eid] = frozen
        return "applied"


def aggregate(tasks):
    facts, conflicts = {}, set()
    for task in tasks:
        if task.state != "completed":
            continue
        for claim in task.claims:
            key = claim["key"]
            if key in facts and facts[key]["value"] != claim["value"]:
                conflicts.add(key)
            else:
                facts[key] = claim
    # Neither voting nor removing the failed child establishes a disputed fact.
    return {"claims": {k: v for k, v in facts.items() if k not in conflicts},
            "conflicts": sorted(conflicts),
            "missing_tasks": [t.task_id for t in tasks if t.state != "completed"]}


def self_test():
    def event(eid, task, value, state="completed", cost=2):
        return {"event_id": eid, "task_id": task, "epoch": 1, "version": "policy@3",
                "state": state, "cost": cost,
                "claims": [{"key": "refund-day-7", "value": value, "source": "policy@3:p2"}]}
    one, two = Task("one", "policy@3", 3), Task("two", "policy@3", 3)
    original = event("e1", "one", True)
    assert one.apply(original) == "applied"
    assert one.apply(original) == "duplicate" and one.spent == 2
    reordered = dict(reversed(list(original.items())))
    reordered["claims"] = [dict(reversed(list(original["claims"][0].items())))]
    assert one.apply(reordered) == "duplicate" and one.spent == 2
    two.apply(event("e2", "two", False))
    result = aggregate([one, two])
    assert result["conflicts"] == ["refund-day-7"] and result["claims"] == {}
    cases = [event("late", "one", True, "working"),
             event("e1", "one", False), event("wrong", "other", True)]
    for bad in cases:
        try:
            one.apply(bad)
        except ValueError:
            pass
        else:
            raise AssertionError("invalid event accepted")
    fresh = Task("fresh", "policy@3", 1)
    try:
        fresh.apply(event("over", "fresh", True))
    except ValueError:
        pass
    else:
        raise AssertionError("over budget accepted")
    assert fresh.spent == 0 and fresh.state == "submitted"
    assert aggregate([one, fresh])["missing_tasks"] == ["fresh"]
    replacement = Task("replacement", "policy@3", 3)
    assert replacement.reassign(1) == 2
    late = event("late-old", "replacement", True)
    try:
        replacement.apply(late)
    except ValueError:
        pass
    else:
        raise AssertionError("old worker completed replacement task")
    assert replacement.state == "submitted" and replacement.spent == 0
    current = dict(late, event_id="current", epoch=2)
    assert replacement.apply(current) == "applied"
    print("n07 PASS: duplicate, conflict, terminal, identity, budget, partial outcome")


if __name__ == "__main__":
    self_test()
