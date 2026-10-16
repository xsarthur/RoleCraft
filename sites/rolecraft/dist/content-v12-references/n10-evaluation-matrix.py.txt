"""Synthetic evaluation bookkeeping, not actual model quality or learner assessment."""
from dataclasses import dataclass
from itertools import product


@dataclass(frozen=True)
class Case:
    id: str
    needs_tool: bool


def matrix(cases):
    rows = []
    for model, retrieval, tools in product(("baseline", "candidate"), (False, True), (False, True)):
        for case in cases:
            rows.append({"case": case.id, "model": model, "retrieval": retrieval,
                         "tools": tools, "feasible": not case.needs_tool or tools,
                         "reason": None if not case.needs_tool or tools else "required_tool_removed"})
    return rows


STAGES = ("semantic_input", "tokens_fit", "retrieved_ids", "prompt_contract", "tool_arguments", "result")


def first_divergence(reference, observed):
    for stage in STAGES:
        if stage not in reference or stage not in observed:
            return "missing_trace:" + stage
        if reference[stage] != observed[stage]:
            return stage
    return "no_observed_divergence"


def handover_missing(bundle):
    required = {"environment_lock", "config_template", "architecture_decisions",
                "data_versions_permissions", "evaluation_fixtures", "failure_reproduction",
                "monitor_rollback", "known_limits", "owners"}
    return sorted(required - set(bundle))


def self_test():
    rows = matrix([Case("knowledge", False), Case("lookup-order", True)])
    assert len(rows) == 16
    assert sum(not row["feasible"] for row in rows) == 4
    en = {"semantic_input": "lookup order 17", "tokens_fit": True,
          "retrieved_ids": ["policy@3"], "prompt_contract": "v1",
          "tool_arguments": {"order_id": "17"}, "result": "found"}
    zh = dict(en, tool_arguments={"order_id": "十七"}, result="invalid_id")
    assert first_divergence(en, zh) == "tool_arguments"
    mixed = dict(en, retrieved_ids=[], result="no_evidence")
    assert first_divergence(en, mixed) == "retrieved_ids"
    assert "environment_lock" in handover_missing({})
    # Merely having the required names is deliberately not treated as handover success.
    print("n10 PASS: feasible matrix, language-layer divergence, missing handover items")


if __name__ == "__main__":
    self_test()
