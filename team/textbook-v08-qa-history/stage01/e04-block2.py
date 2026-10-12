from dataclasses import dataclass

@dataclass(frozen=True)
class Release:
    release_id: str
    state_readers: frozenset[int]
    event_readers: frozenset[int]
    tools: frozenset[str]
    reconcilers: frozenset[str]

@dataclass(frozen=True)
class TaskInventory:
    run_id: str
    state_schema: int
    event_schema: int
    active_tool_contracts: frozenset[str]
    unresolved_tool_contracts: frozenset[str]
    approved_resume_releases: frozenset[str]
    has_owner: bool

@dataclass(frozen=True)
class RollbackPlan:
    status: str
    routes: tuple[tuple[str, str], ...]
    blockers: tuple[str, ...]

def plan_rollback(target, tasks, admission_paused, inventory_complete):
    blockers = []
    routes = []
    if not admission_paused:
        blockers.append("NEW_WORK_NOT_PAUSED")
    if not inventory_complete:
        blockers.append("INVENTORY_INCOMPLETE")
    seen = set()
    for task in tasks:
        if task.run_id in seen:
            blockers.append(task.run_id + ":DUPLICATE_INVENTORY")
            continue
        seen.add(task.run_id)
        local = []
        if task.state_schema not in target.state_readers:
            local.append("STATE_SCHEMA")
        if task.event_schema not in target.event_readers:
            local.append("EVENT_SCHEMA")
        if not task.active_tool_contracts <= target.tools:
            local.append("TOOL_CONTRACT")
        if not task.unresolved_tool_contracts <= target.reconcilers:
            local.append("RECONCILER_MISSING")
        if target.release_id not in task.approved_resume_releases:
            local.append("RESUME_SEMANTICS_NOT_APPROVED")
        if task.has_owner:
            local.append("OWNER_NOT_RELEASED_OR_FENCED")
        blockers.extend(task.run_id + ":" + reason for reason in local)
        if not local:
            routes.append((task.run_id, target.release_id))
    if blockers:
        return RollbackPlan("HOLD", (), tuple(blockers))
    return RollbackPlan("READY", tuple(routes), ())

if __name__ == "__main__":
    old = Release("runtime-r11", frozenset({1}), frozenset({1}),
                  frozenset({"create_issue/v1"}), frozenset({"create_issue/v1"}))
    task = TaskInventory("run-18", 2, 1, frozenset({"create_issue/v1"}),
                         frozenset({"create_issue/v1"}),
                         frozenset({"runtime-r11"}), False)
    blocked = plan_rollback(old, [task], True, True)
    print(blocked.status, blocked.blockers)
    compatible = Release("runtime-r11-reader-fix", frozenset({1, 2}),
                         frozenset({1}), old.tools, old.reconcilers)
    allowed = TaskInventory(task.run_id, task.state_schema, task.event_schema,
                            task.active_tool_contracts, task.unresolved_tool_contracts,
                            frozenset({"runtime-r11-reader-fix"}), False)
    print(plan_rollback(compatible, [allowed], True, True).status)
