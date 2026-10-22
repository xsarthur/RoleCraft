"""Deterministic DAG planning fixture. No LLM, tools, or external side effects."""
from dataclasses import dataclass, replace
import hashlib
import json

@dataclass(frozen=True)
class Node:
    name: str
    deps: tuple[str, ...]
    needs: frozenset[str]
    produces: frozenset[str]
    tool: str
    cost: int
    effect: str = 'read'


def build_plan(goals, initial, recipes):
    """One recipe per artifact in this fixture; ambiguous providers must be resolved upstream."""
    nodes = {}
    visiting = set()
    def ensure(artifact):
        if artifact in initial:
            return None
        if artifact not in recipes:
            raise ValueError('NO_RECIPE:'+artifact)
        node = recipes[artifact]
        if node.name in visiting:
            raise ValueError('RECIPE_CYCLE')
        if node.name in nodes:
            return node.name
        visiting.add(node.name)
        deps = set()
        for required in sorted(node.needs):
            name = ensure(required)
            if name:
                deps.add(name)
        visiting.remove(node.name)
        nodes[node.name] = replace(node, deps=tuple(sorted(deps)))
        return node.name
    for artifact in sorted(goals):
        ensure(artifact)
    return tuple(nodes.values())


def validate(nodes, initial, goals, allowed, budget):
    by_id = {n.name:n for n in nodes}
    if len(by_id) != len(nodes):
        raise ValueError('DUPLICATE_NODE')
    for n in nodes:
        if not set(n.deps) <= by_id.keys():
            raise ValueError('MISSING_DEP')
        if n.tool not in allowed or n.effect != 'read':
            raise ValueError('UNAUTHORIZED')
        if type(n.cost) is not int or n.cost < 0:
            raise ValueError('COST')
    if sum(n.cost for n in nodes) > budget:
        raise ValueError('BUDGET')
    done = set(); ancestors = {}; order = []
    while len(done) < len(nodes):
        ready = sorted(n.name for n in nodes if n.name not in done and set(n.deps) <= done)
        if not ready:
            raise ValueError('CYCLE')
        for name in ready:
            n = by_id[name]
            inherited = set(n.deps)
            for dep in n.deps:
                inherited.update(ancestors[dep])
            available = set(initial)
            for dep in inherited:
                available.update(by_id[dep].produces)
            if not n.needs <= available:
                raise ValueError('INPUT_NOT_REACHABLE:'+name)
            ancestors[name] = inherited
            done.add(name); order.append(name)
    all_outputs = set(initial)
    for n in nodes:
        all_outputs.update(n.produces)
    if not goals <= all_outputs:
        raise ValueError('GOAL_UNSATISFIED')
    return order


def invalidate(nodes, statuses, changed):
    invalid = set(changed)
    while True:
        more = {n.name for n in nodes if set(n.deps) & invalid}
        if more <= invalid:
            break
        invalid.update(more)
    updated = dict(statuses)
    by_id = {n.name:n for n in nodes}
    for name in invalid:
        if name not in by_id:
            raise ValueError('UNKNOWN_NODE')
        # A plan edit never proves an in-flight/unknown write had no effect.
        # Only explicit no-send/no-effect states may become runnable again.
        write_may_have_effect = (by_id[name].effect != 'read'
                                 and statuses.get(name) not in {'pending', 'confirmed_no_effect'})
        updated[name] = 'EFFECT_RECHECK' if write_may_have_effect else 'stale'
    return updated


class ProgressGuard:
    def __init__(self):
        self.seen = set()
    def observe(self, unresolved, evidence_versions, pending_effects):
        payload = [sorted(unresolved),sorted(evidence_versions),sorted(pending_effects)]
        signature = hashlib.sha256(json.dumps(payload).encode()).hexdigest()
        if signature in self.seen:
            return 'STOP_NO_PROGRESS'
        self.seen.add(signature)
        return 'CONTINUE'


def expect_error(fn, code):
    try:
        fn()
    except ValueError as e:
        assert str(e).startswith(code), (str(e),code)
    else:
        raise AssertionError('expected '+code)


def main():
    report = Node('report',(),frozenset({'report_id'}),frozenset({'failure'}),'read_report',1)
    rule = Node('rule',(),frozenset({'failure'}),frozenset({'policy'}),'read_policy',1)
    draft = Node('draft',(),frozenset({'failure','policy'}),frozenset({'analysis'}),'compose',1)
    recipes = {'failure':report,'policy':rule,'analysis':draft}
    initial = {'report_id'}; goals = {'analysis'}
    nodes = build_plan(goals, initial, recipes)
    allowed = {'read_report','read_policy','compose'}
    order = validate(nodes,initial,goals,allowed,3)
    assert order == ['report','rule','draft']
    by_id = {n.name:n for n in nodes}
    expect_error(lambda:validate([replace(n,deps=('absent',)) if n.name=='draft' else n for n in nodes],initial,goals,allowed,3),'MISSING_DEP')
    expect_error(lambda:validate([replace(n,deps=('draft',)) if n.name=='report' else n for n in nodes],initial,goals,allowed,3),'CYCLE')
    expect_error(lambda:validate([replace(n,deps=()) if n.name=='draft' else n for n in nodes],initial,goals,allowed,3),'INPUT_NOT_REACHABLE')
    expect_error(lambda:validate(nodes,initial,goals,allowed,2),'BUDGET')
    expect_error(lambda:validate(nodes,initial,goals,{'compose'},3),'UNAUTHORIZED')
    expect_error(lambda:build_plan({'unknown'},initial,recipes),'NO_RECIPE')
    statuses = invalidate(nodes,dict.fromkeys(order,'done'),{'rule'})
    assert statuses == {'report':'done','rule':'stale','draft':'stale'}
    effect_nodes = nodes + (Node('issue',('draft',),frozenset({'analysis'}),frozenset({'receipt'}),'write',1,'write'),)
    effect_status = invalidate(effect_nodes,dict.fromkeys(order+['issue'],'done'),{'rule'})
    assert effect_status['issue'] == 'EFFECT_RECHECK'
    for before in ('in_flight','unknown','EFFECT_RECHECK'):
        original = dict.fromkeys(order,'done') | {'issue':before}
        after = invalidate(effect_nodes,original,{'rule'})
        assert after['issue'] == 'EFFECT_RECHECK', (before,after)
    for before in ('pending','confirmed_no_effect'):
        original = dict.fromkeys(order,'done') | {'issue':before}
        after = invalidate(effect_nodes,original,{'rule'})
        assert after['issue'] == 'stale', (before,after)
    guard = ProgressGuard()
    assert guard.observe({'policy'}, {'report@1'},set()) == 'CONTINUE'
    assert guard.observe({'policy'}, {'report@1'},set()) == 'STOP_NO_PROGRESS'
    assert guard.observe(set(), {'report@1','policy@2'},set()) == 'CONTINUE'
    print(json.dumps({'status':'SELF_CHECK_OK','order':order,'after_change':statuses,
                      'external_effect_after_change':effect_status['issue'],
                      'inflight_unknown_recheck':True,'no_effect_can_stale':True},sort_keys=True))

if __name__ == '__main__':
    main()
