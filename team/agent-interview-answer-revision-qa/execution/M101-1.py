import asyncio

async def bounded_map(items, call, workers=2, timeout_s=0.1):
    if type(workers) is not int or workers < 1:
        raise ValueError("workers must be positive int")
    queue = asyncio.Queue(maxsize=workers)
    results = {}
    sentinel = object()

    async def produce():
        for i, item in enumerate(items):
            await queue.put((i, item))
        for _ in range(workers):
            await queue.put(sentinel)

    async def consume():
        while True:
            entry = await queue.get()
            try:
                if entry is sentinel:
                    return
                i, item = entry
                try:
                    async with asyncio.timeout(timeout_s):
                        results[i] = ("ok", await call(item))
                except TimeoutError:
                    results[i] = ("timeout", None)
            finally:
                queue.task_done()

    async with asyncio.TaskGroup() as group:
        group.create_task(produce())
        for _ in range(workers):
            group.create_task(consume())
    return [results[i] for i in range(len(results))]

active = 0
peak = 0
async def fake_call(delay):
    global active, peak
    active += 1
    peak = max(peak, active)
    try:
        await asyncio.sleep(delay)
        return delay
    finally:
        active -= 1

async def main():
    result = await bounded_map([0.01, 0.02, 0.3], fake_call)
    assert [x[0] for x in result] == ["ok", "ok", "timeout"]
    assert active == 0 and peak <= 2
    task = asyncio.create_task(fake_call(1))
    await asyncio.sleep(0)  # 让替身进入try
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass
    assert active == 0
    print(result, "peak", peak, "active", active)

if __name__ == "__main__":
    asyncio.run(main())
