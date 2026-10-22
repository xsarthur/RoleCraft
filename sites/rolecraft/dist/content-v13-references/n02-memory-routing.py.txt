"""Offline memory lifecycle and task routing; no semantic extraction or database."""
from dataclasses import dataclass, replace
import json

@dataclass(frozen=True)
class Scope:
    tenant: str
    user: str

@dataclass(frozen=True)
class Memory:
    memory_id: str
    scope: Scope
    key: str
    value: str
    source: str
    version: int
    expires_at: int
    status: str = 'active'
    supersedes: str | None = None

class Store:
    def __init__(self):
        self.rows = {}
        self.heads = {}
        self.outputs = {}
        self.invalid_outputs = set()
        self.counter = 0

    def _invalidate(self, memory_id, status):
        row = self.rows[memory_id]
        self.rows[memory_id] = replace(row, status=status)
        for output_id, dependencies in self.outputs.items():
            if memory_id in dependencies:
                self.invalid_outputs.add(output_id)

    def put(self, scope, key, value, source, expires_at, now,
            confirmed, expected_version=0):
        if not confirmed or not source or expires_at <= now or key == 'approval':
            raise ValueError('INELIGIBLE')
        slot = (scope, key)
        old_id = self.heads.get(slot)
        old = self.rows.get(old_id)
        version = old.version if old else 0
        if version != expected_version:
            raise ValueError('CONFLICT')
        if old and old.status == 'active' and old.value == value and old.source == source and old.expires_at == expires_at:
            return old.memory_id
        if old:
            self._invalidate(old.memory_id, 'superseded')
        self.counter += 1
        memory_id = f'm{self.counter}'
        self.rows[memory_id] = Memory(memory_id, scope, key, value, source,
                                     version+1, expires_at, supersedes=old_id)
        self.heads[slot] = memory_id
        return memory_id

    def read(self, scope, key, now):
        memory_id = self.heads.get((scope,key))
        if memory_id is None:
            return None
        row = self.rows[memory_id]
        if row.status != 'active':
            return None
        if row.expires_at <= now:
            self._invalidate(memory_id, 'expired')
            return None
        return row

    def delete(self, scope, memory_id):
        row = self.rows[memory_id]
        if row.scope != scope:
            raise PermissionError('SCOPE')
        self._invalidate(memory_id, 'deleted')

    def invalidate_source(self, source):
        for memory_id, row in list(self.rows.items()):
            if row.source == source and row.status == 'active':
                self._invalidate(memory_id, 'source_invalid')

    def record_output(self, output_id, scope, memory_ids, now):
        if output_id in self.outputs:
            raise ValueError('OUTPUT_IMMUTABLE')
        for mid in memory_ids:
            row = self.rows[mid]
            current = self.read(scope, row.key, now)
            if current is None or current.memory_id != mid:
                raise ValueError('STALE_OR_HIDDEN')
        self.outputs[output_id] = frozenset(memory_ids)

@dataclass(frozen=True)
class Task:
    task_id: str
    scope: Scope
    revision: int
    status: str

class Router:
    def __init__(self, tasks):
        self.tasks = {t.task_id:t for t in tasks}
        self.active = None
        self.epoch = 0

    def choose(self, scope, candidate_ids, confirmed_id=None):
        visible = [tid for tid in dict.fromkeys(candidate_ids)
                   if tid in self.tasks and self.tasks[tid].scope == scope
                   and self.tasks[tid].status == 'paused']
        if confirmed_id is None or confirmed_id not in visible:
            return {'status':'CLARIFY', 'candidates':visible}
        self.active = confirmed_id
        self.epoch += 1
        task = self.tasks[confirmed_id]
        return {'status':'ACTIVE', 'task_id':task.task_id,
                'revision':task.revision, 'epoch':self.epoch,
                'approval':'RECHECK_REQUIRED'}

    def accept_result(self, task_id, revision, epoch):
        task = self.tasks.get(task_id)
        return bool(task and self.active == task_id and task.revision == revision
                    and self.epoch == epoch)


def main():
    scope = Scope('t1','u1'); other = Scope('t2','u1')
    s = Store()
    m1 = s.put(scope,'language','zh','preference-event-1',100,0,True)
    assert s.read(other,'language',1) is None
    s.record_output('o1',scope,[m1],1)
    m2 = s.put(scope,'language','en','preference-event-2',100,2,True,1)
    assert s.read(scope,'language',3).value == 'en'
    assert s.rows[m1].status == 'superseded' and 'o1' in s.invalid_outputs
    try:
        s.put(scope,'language','fr','event-3',100,3,True,1)
    except ValueError as e:
        assert str(e) == 'CONFLICT'
    else:
        raise AssertionError('stale write')
    try:
        s.delete(other,m2)
    except PermissionError:
        pass
    else:
        raise AssertionError('cross tenant deletion')
    s.record_output('o2',scope,[m2],3)
    s.invalidate_source('preference-event-2')
    assert s.read(scope,'language',4) is None and 'o2' in s.invalid_outputs
    m3 = s.put(scope,'timezone','Asia/Shanghai','event-4',5,4,True)
    assert s.read(scope,'timezone',5) is None and s.rows[m3].status == 'expired'
    m4 = s.put(scope,'format','concise','event-5',100,4,True)
    s.delete(scope,m4)
    assert s.read(scope,'format',5) is None
    try:
        s.put(scope,'approval','all writes','event-6',100,5,True)
    except ValueError:
        pass
    else:
        raise AssertionError('approval retained')
    router = Router([Task('research',scope,1,'paused'),Task('issue',scope,2,'paused')])
    assert router.choose(scope,['research','issue'])['status'] == 'CLARIFY'
    first = router.choose(scope,['research'],'research')
    second = router.choose(scope,['issue'],'issue')
    assert not router.accept_result('research',1,first['epoch'])
    assert router.accept_result('issue',2,second['epoch'])
    print(json.dumps({'status':'SELF_CHECK_OK', 'invalid_outputs':sorted(s.invalid_outputs),
                      'memory_statuses':{k:v.status for k,v in s.rows.items()},
                      'routing':second}, ensure_ascii=False,sort_keys=True))

if __name__ == '__main__':
    main()
