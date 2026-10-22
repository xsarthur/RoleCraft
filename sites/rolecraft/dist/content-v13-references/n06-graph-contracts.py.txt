"""Application stream consumer model. Standard library; not SDK transport."""
from dataclasses import dataclass, field
import json


@dataclass
class Consumer:
    task: str
    seen: dict = field(default_factory=dict)
    events: list = field(default_factory=list)
    final: bool = False

    def accept(self, event):
        if set(event) != {"task_id", "seq", "kind", "payload"}:
            raise ValueError("schema")
        if event["task_id"] != self.task or type(event["seq"]) is not int:
            raise ValueError("identity")
        seq = event["seq"]
        encoded = json.dumps(event, sort_keys=True)
        if seq in self.seen:
            if self.seen[seq] != encoded:
                raise ValueError("sequence reused")
            return "duplicate"
        if self.final:
            raise ValueError("event after final")
        if seq != len(self.seen) + 1:
            return "replay_required"
        if event["kind"] not in {"text", "tool_progress", "pause", "error", "final"}:
            raise ValueError("kind")
        self.seen[seq] = encoded
        self.events.append(event)
        self.final = event["kind"] == "final"
        return "accepted"


def self_test():
    c = Consumer("t")
    def e(seq, kind):
        return {"task_id": "t", "seq": seq, "kind": kind, "payload": {}}
    assert c.accept(e(1, "text")) == "accepted" and not c.final
    assert c.accept(e(1, "text")) == "duplicate"
    assert c.accept(e(3, "final")) == "replay_required" and not c.final
    assert c.accept(e(2, "pause")) == "accepted"
    assert c.accept(e(3, "final")) == "accepted" and c.final
    try:
        c.accept(e(4, "text"))
    except ValueError:
        pass
    else:
        raise AssertionError("late event accepted")
    print("n06 contracts PASS: preview, duplicate, gap, replay, final")


if __name__ == "__main__":
    self_test()
