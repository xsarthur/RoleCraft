from collections import Counter
from dataclasses import dataclass
from decimal import Decimal
from math import ceil

STATUSES = {"ACCEPTED", "FAILED", "TIMED_OUT", "CANCELLED", "IN_FLIGHT"}

@dataclass(frozen=True)
class TaskAccounting:
    task_id: str
    status: str
    elapsed_ms: int
    known_cost: Decimal
    pending_reserved: Decimal
    cost_confirmed: bool
    physical_attempts: int

def quantile_nearest_rank(values, probability):
    if not 0 < probability <= 1:
        raise ValueError("QUANTILE_INVALID")
    if not values:
        return None
    ordered = sorted(values)
    return ordered[ceil(probability * len(ordered)) - 1]

def summarize(tasks):
    seen = set()
    for item in tasks:
        if item.task_id in seen:
            raise ValueError("DUPLICATE_LOGICAL_TASK")
        seen.add(item.task_id)
        if item.status not in STATUSES:
            raise ValueError("STATUS_INVALID")
        if type(item.elapsed_ms) is not int or item.elapsed_ms < 0:
            raise ValueError("LATENCY_INVALID")
        if type(item.physical_attempts) is not int or item.physical_attempts < 0:
            raise ValueError("ATTEMPT_COUNT_INVALID")
        if not item.known_cost.is_finite() or item.known_cost < 0:
            raise ValueError("COST_INVALID")
        if not item.pending_reserved.is_finite() or item.pending_reserved < 0:
            raise ValueError("RESERVATION_INVALID")
        if item.cost_confirmed and item.pending_reserved != 0:
            raise ValueError("CONFIRMED_WITH_PENDING_RESERVATION")
    counts = Counter(item.status for item in tasks)
    accepted = [item.elapsed_ms for item in tasks if item.status == "ACCEPTED"]
    observed_waits = [item.elapsed_ms for item in tasks if item.status != "IN_FLIGHT"]
    known = sum((item.known_cost for item in tasks), Decimal("0"))
    reserved = sum((item.pending_reserved for item in tasks), Decimal("0"))
    accepted_count = counts["ACCEPTED"]
    denominator_frozen = counts["IN_FLIGHT"] == 0
    final_cost_known = denominator_frozen and all(item.cost_confirmed for item in tasks)
    known_per_accepted = (known / accepted_count
                          if accepted_count and denominator_frozen else None)
    return {
        "assigned": len(tasks), "accepted": accepted_count, "status_counts": dict(counts),
        "accepted_p50_ms": quantile_nearest_rank(accepted, 0.50),
        "accepted_p95_ms": quantile_nearest_rank(accepted, 0.95),
        "observed_wait_p95_ms": quantile_nearest_rank(observed_waits, 0.95),
        "in_flight_ages_ms": [item.elapsed_ms for item in tasks if item.status == "IN_FLIGHT"],
        "confirmed_cost": known, "pending_reserved": reserved,
        "cost_per_assigned": known / len(tasks) if tasks and final_cost_known else None,
        "cost_per_accepted": known_per_accepted if final_cost_known else None,
        "confirmed_cost_per_accepted_lower_bound": known_per_accepted,
        "physical_attempts": sum(item.physical_attempts for item in tasks),
        "cost_per_attempt": (known / sum(item.physical_attempts for item in tasks)
                             if final_cost_known and any(item.physical_attempts for item in tasks)
                             else None),
    }

if __name__ == "__main__":
    data = [
        TaskAccounting("task-1", "ACCEPTED", 1000, Decimal("4"), Decimal("0"), True, 2),
        TaskAccounting("task-2", "FAILED", 2000, Decimal("2"), Decimal("0"), True, 1),
        TaskAccounting("task-3", "TIMED_OUT", 10000, Decimal("3"), Decimal("3"), False, 2),
        TaskAccounting("task-4", "ACCEPTED", 7000, Decimal("1"), Decimal("0"), True, 1),
    ]
    result = summarize(data)
    print(result["assigned"], result["accepted"])
    print(result["accepted_p50_ms"], result["accepted_p95_ms"], result["observed_wait_p95_ms"])
    print(result["cost_per_accepted"], result["confirmed_cost_per_accepted_lower_bound"],
          result["pending_reserved"])
