"""Offline LangGraph 1.2.4 teaching example; no model, network or business write."""
import hashlib
import json
import os
from typing import Annotated, TypedDict

os.environ["LANGSMITH_TRACING"] = "false"
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, StateGraph
from langgraph.types import Command, interrupt


def merge_findings(left, right):
    merged = dict(left)
    for key, value in right.items():
        if key in merged and merged[key] != value:
            raise ValueError("conflicting finding: " + key)
        merged[key] = value
    return merged


class State(TypedDict, total=False):
    request_id: str
    findings: Annotated[dict[str, str], merge_findings]
    draft: str
    digest: str
    approved: bool
    result: str


class ReviewState(TypedDict, total=False):
    evidence: list[str]
    summary: str


def build_graph():
    visits = {"approval": 0}
    child = StateGraph(ReviewState)
    child.add_node("summarize", lambda s: {"summary": " | ".join(sorted(s["evidence"]))})
    child.add_edge(START, "summarize")
    child.add_edge("summarize", END)
    review = child.compile()

    def propose(state):
        answer = review.invoke({"evidence": list(state["findings"].values())})
        draft = answer["summary"]
        payload = json.dumps([state["request_id"], draft], ensure_ascii=False).encode()
        return {"draft": draft, "digest": hashlib.sha256(payload).hexdigest()}

    def approve(state):
        # Deliberately observes re-entry; never place an unprotected write here.
        visits["approval"] += 1
        reply = interrupt({"request_id": state["request_id"],
                           "draft": state["draft"], "digest": state["digest"]})
        valid = (isinstance(reply, dict) and reply.get("digest") == state["digest"]
                 and reply.get("approve") is True)
        return {"approved": valid}

    graph = StateGraph(State)
    graph.add_node("read_report", lambda s: {"findings": {"report@71": "day 7: expected true, actual false"}})
    graph.add_node("read_source", lambda s: {"findings": {"repo@8e12": "refund returns days < 7"}})
    graph.add_node("propose", propose)
    graph.add_node("approve", approve)
    graph.add_node("accept", lambda s: {"result": "approved_candidate_only"})
    graph.add_node("stop", lambda s: {"result": "stopped_without_write"})
    graph.add_edge(START, "read_report")
    graph.add_edge(START, "read_source")
    graph.add_edge(["read_report", "read_source"], "propose")
    graph.add_edge("propose", "approve")
    graph.add_conditional_edges("approve", lambda s: "accept" if s["approved"] else "stop")
    graph.add_edge("accept", END)
    graph.add_edge("stop", END)
    return graph.compile(checkpointer=InMemorySaver()), visits


def self_test():
    graph, visits = build_graph()
    for name, approve, correct, expected in [
        ("allow", True, True, "approved_candidate_only"),
        ("deny", False, True, "stopped_without_write"),
        ("stale", True, False, "stopped_without_write"),
    ]:
        config = {"configurable": {"thread_id": "lesson-" + name}}
        chunks = list(graph.stream({"request_id": name, "findings": {}}, config,
                                   stream_mode="updates", subgraphs=True, version="v2"))
        paused = graph.get_state(config)
        assert paused.next == ("approve",)
        assert len(paused.values["findings"]) == 2
        assert any(chunk["ns"] for chunk in chunks), "child namespace absent"
        reply = {"approve": approve, "digest": paused.values["digest"] if correct else "stale"}
        done = graph.invoke(Command(resume=reply), config)
        assert done["result"] == expected
        assert graph.get_state(config).next == ()
        print(name, expected)
    assert visits["approval"] == 6, visits
    assert merge_findings({"x": "one"}, {"x": "one"}) == {"x": "one"}
    try:
        merge_findings({"x": "one"}, {"x": "two"})
    except ValueError:
        pass
    else:
        raise AssertionError("conflicting parallel result was accepted")
    print("n06 PASS: join, subgraph, interrupt/resume, deny, stale digest, conflict")


if __name__ == "__main__":
    self_test()
