"""Python 3.14 standard-library, offline teaching fixtures, no model calls."""
import asyncio
import copy
import functools
import gc
import inspect
import json
import math
import time
import tracemalloc
from collections import OrderedDict


class LRU:
    def __init__(self, capacity):
        if type(capacity) is not int or capacity < 0:
            raise ValueError('CAPACITY')
        self.capacity = capacity
        self.data = OrderedDict()

    def get(self, key):
        if key not in self.data:
            raise KeyError(key)
        self.data.move_to_end(key)
        return self.data[key]

    def put(self, key, value):
        if self.capacity == 0:
            return
        self.data[key] = value
        self.data.move_to_end(key)
        while len(self.data) > self.capacity:
            self.data.popitem(last=False)


def logged(events):
    """Only accepts a caller-owned in-memory list; never records arguments."""
    def decorate(fn):
        if inspect.iscoroutinefunction(fn):
            @functools.wraps(fn)
            async def async_wrapper(*args, **kwargs):
                started = time.monotonic()
                status = 'raised_or_cancelled'
                try:
                    value = await fn(*args, **kwargs)
                    status = 'returned'
                    return value
                finally:
                    events.append((fn.__name__, status, time.monotonic()-started))
            return async_wrapper
        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            started = time.monotonic()
            status = 'raised'
            try:
                value = fn(*args, **kwargs)
                status = 'returned'
                return value
            finally:
                events.append((fn.__name__, status, time.monotonic()-started))
        return wrapper
    return decorate


async def batch(delays, workers=2, timeout=0.05):
    """Finite fixture input; bounded queued work and fixed worker count."""
    if type(workers) is not int or workers < 1 or timeout <= 0:
        raise ValueError('LIMITS')
    if any(not math.isfinite(d) or d < 0 for d in delays):
        raise ValueError('DELAY')
    queue = asyncio.Queue(maxsize=workers)
    results = {}
    active = 0
    peak = 0
    cleaned = []

    async def producer():
        for idx, delay in enumerate(delays):
            await queue.put((idx, delay))
        for _ in range(workers):
            await queue.put(None)

    async def worker():
        nonlocal active, peak
        while True:
            item = await queue.get()
            try:
                if item is None:
                    return
                idx, delay = item
                active += 1
                peak = max(peak, active)
                try:
                    async with asyncio.timeout(timeout):
                        await asyncio.sleep(delay)  # local cooperative I/O stand-in
                        results[idx] = 'OK'
                except TimeoutError:
                    results[idx] = 'TIMEOUT'
                finally:
                    active -= 1
                    cleaned.append(idx)
            finally:
                queue.task_done()

    async with asyncio.TaskGroup() as group:
        group.create_task(producer())
        for _ in range(workers):
            group.create_task(worker())
    return {'results': results, 'peak': peak, 'active': active, 'cleaned': sorted(cleaned)}


def consume(status, payload, expected_id):
    """Our internal fixture envelope, not any vendor API response."""
    if status == 'refused':
        return 'REFUSED'
    if status != 'complete':
        return 'INCOMPLETE'
    def pairs(items):
        obj = {}
        for key, value in items:
            if key in obj:
                raise ValueError('DUPLICATE')
            obj[key] = value
        return obj
    try:
        obj = json.loads(payload, object_pairs_hook=pairs)
    except (ValueError, TypeError):
        return 'BAD_JSON'
    if type(obj) is not dict or set(obj) != {'report_id', 'failed'}:
        return 'FIELDS'
    if type(obj['report_id']) is not str or type(obj['failed']) is not bool:
        return 'TYPE'
    if obj['report_id'] != expected_id:
        return 'SEMANTIC_MISMATCH'
    return 'CANDIDATE'


def memory_probe():
    tracemalloc.start()
    before = tracemalloc.take_snapshot()
    held = [bytearray(2048) for _ in range(128)]
    after = tracemalloc.take_snapshot()
    retained = sum(x.size_diff for x in after.compare_to(before, 'lineno'))
    held.clear()
    gc.collect()
    released = tracemalloc.take_snapshot()
    change = sum(x.size_diff for x in released.compare_to(after, 'lineno'))
    tracemalloc.stop()
    return {'retained_bytes': retained, 'after_clear_delta_bytes': change}


async def async_checks():
    result = await batch([0.001, 0.002, 0.2], workers=2, timeout=0.05)
    assert result['results'] == {0:'OK', 1:'OK', 2:'TIMEOUT'}, result
    assert result['peak'] <= 2 and result['active'] == 0
    assert result['cleaned'] == [0,1,2]
    events = []
    entered = asyncio.Event()
    released = asyncio.Event()
    @logged(events)
    async def pending():
        try:
            entered.set()
            await asyncio.Event().wait()
        finally:
            released.set()
    task = asyncio.create_task(pending())
    await entered.wait()
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass
    else:
        raise AssertionError('cancellation swallowed')
    assert released.is_set()
    assert events[0][1] == 'raised_or_cancelled'
    peer_started = asyncio.Event()
    peer_cleaned = asyncio.Event()
    async def peer():
        try:
            peer_started.set()
            await asyncio.Event().wait()
        finally:
            peer_cleaned.set()
    async def failing():
        await peer_started.wait()
        raise RuntimeError('fixture failure')
    try:
        async with asyncio.TaskGroup() as group:
            group.create_task(peer())
            group.create_task(failing())
    except* RuntimeError:
        pass
    assert peer_cleaned.is_set(), 'peer not cleaned on ordinary failure'
    return result


def main():
    original = {'messages': []}
    shallow = original.copy()
    shallow['messages'].append('shared')
    assert original['messages'] == ['shared']
    isolated = copy.deepcopy(original)
    isolated['messages'].append('private')
    assert original['messages'] == ['shared']
    nested = ([],)
    nested[0].append('mutable inside tuple')
    assert nested[0] == ['mutable inside tuple']
    cache = LRU(2)
    cache.put('a', 1); cache.put('b', 2)
    assert cache.get('a') == 1
    cache.put('c', 3)
    assert list(cache.data) == ['a','c']
    cache.put('a', 4)
    assert list(cache.data) == ['c','a'] and cache.get('a') == 4
    zero = LRU(0); zero.put('x',1)
    assert len(zero.data) == 0
    try:
        cache.get('missing')
    except KeyError:
        pass
    else:
        raise AssertionError('miss not reported')
    events = []
    @logged(events)
    def divide(a, b):
        return a / b
    assert divide(4,2) == 2 and divide.__name__ == 'divide'
    try:
        divide(1,0)
    except ZeroDivisionError:
        pass
    else:
        raise AssertionError('exception swallowed')
    assert [e[1] for e in events] == ['returned','raised']
    assert consume('complete','{"report_id":"r1","failed":true}','r1') == 'CANDIDATE'
    assert consume('complete','{"report_id":"r2","failed":true}','r1') == 'SEMANTIC_MISMATCH'
    assert consume('complete','{"report_id":"r1","failed":1}','r1') == 'TYPE'
    assert consume('refused','{}','r1') == 'REFUSED'
    assert consume('truncated','{"report_id":','r1') == 'INCOMPLETE'
    assert consume('complete','{"report_id":"r1","failed":true,"failed":false}','r1') == 'BAD_JSON'
    report = {'async': asyncio.run(async_checks()), 'memory_fixture': memory_probe(), 'status':'SELF_CHECK_OK'}
    print(json.dumps(report, sort_keys=True))


if __name__ == '__main__':
    main()
