"""Finite offline models: no service calls; journal is memory-only."""
from dataclasses import dataclass, field


@dataclass
class Breaker:
    failures: list = field(default_factory=list)
    state: str = "closed"
    reopen_at: float = 0
    probe_inflight: bool = False
    generation: int = 1
    sequence: int = 0
    pending: set = field(default_factory=set)

    def acquire(self, now):
        if self.state == "open":
            if now < self.reopen_at:
                return None
            self.state = "half_open"
        if self.state == "half_open":
            if self.probe_inflight:
                return None
            self.probe_inflight = True
        self.sequence += 1
        token = (self.generation, self.sequence, self.state == "half_open")
        self.pending.add(token)
        return token

    def outcome(self, now, token, success):
        if token not in self.pending:
            return "unknown_or_duplicate"
        self.pending.remove(token)
        if token[0] != self.generation:
            return "stale_generation"
        if self.state == "half_open":
            if not self.probe_inflight or not token[2]:
                raise ValueError("no probe")
            self.probe_inflight = False
            self.state = "closed" if success else "open"
            self.failures = []
            if not success:
                self.reopen_at = now + 5
            self.generation += 1
            return "probe_recorded"
        if self.state != "closed":
            return "ignored_open"
        self.failures = [t for t in self.failures if now - t <= 10]
        if not success:
            self.failures.append(now)
        if len(self.failures) >= 2:
            self.state, self.reopen_at = "open", now + 5
            self.generation += 1
        return "recorded"


class FixtureProvider:
    def __init__(self):
        self.effects = {"reserve": True, "draft": True}
        self.undo_results = {}
        self.lose_first_reply = True

    def undo(self, step, key):
        if key not in self.undo_results:
            self.effects[step] = False
            self.undo_results[key] = "confirmed"
            if self.lose_first_reply:
                self.lose_first_reply = False
                raise TimeoutError("effect occurred, reply lost")
        return self.undo_results[key]


def compensate(journal, provider):
    for row in reversed(journal):
        if row["effect"] != "confirmed":
            return "needs_original_effect_reconciliation"
        if row["undo"] == "confirmed":
            continue
        key = "undo:" + row["operation_id"]
        if row["undo"] == "unknown":
            observed = provider.undo_results.get(key)
            if observed != "confirmed":
                return "needs_compensation_reconciliation"
            row["undo"] = "confirmed"
            continue
        row["undo"] = "intent_recorded"
        try:
            row["undo"] = provider.undo(row["step"], key)
        except TimeoutError:
            row["undo"] = "unknown"
            return "paused_unknown_compensation"
    return "compensated"


@dataclass
class ResearchTask:
    epoch: int = 1
    status: str = "working"
    evidence: dict = field(default_factory=dict)

    def cancel(self):
        self.epoch += 1
        self.status = "canceled"

    def publish(self, epoch, evidence):
        if epoch != self.epoch or self.status != "working":
            return "stale_worker_rejected"
        self.evidence.update(evidence)
        self.status = "completed"
        return "published"


def self_test():
    b = Breaker()
    old_request = b.acquire(0)
    for t in (0, 1):
        token = b.acquire(t)
        assert token
        b.outcome(t, token, False)
    assert not b.acquire(2)
    probe = b.acquire(6)
    assert probe and not b.acquire(6)
    assert b.outcome(6, old_request, True) == "stale_generation"
    assert b.state == "half_open" and b.probe_inflight
    b.outcome(6, probe, False)
    assert not b.acquire(7)
    probe2 = b.acquire(11)
    assert probe2
    b.outcome(11, probe2, True)
    assert b.outcome(11, probe2, True) == "unknown_or_duplicate"
    assert b.state == "closed" and b.acquire(12)
    journal = [{"step": s, "operation_id": "t1:" + s,
                "effect": "confirmed", "undo": "pending"} for s in ("reserve", "draft")]
    provider = FixtureProvider()
    assert compensate(journal, provider) == "paused_unknown_compensation"
    assert journal[0]["undo"] == "pending"
    assert compensate(journal, provider) == "compensated"
    assert compensate(journal, provider) == "compensated"
    assert len(provider.undo_results) == 2 and not any(provider.effects.values())
    task = ResearchTask()
    old_epoch = task.epoch
    task.cancel()
    assert task.publish(old_epoch, {"p1": "late"}) == "stale_worker_rejected"
    assert task.evidence == {} and task.status == "canceled"
    print("n09 PASS: breaker probe, reopen, close; compensation unknown/reconcile; cancel fence")


if __name__ == "__main__":
    self_test()
