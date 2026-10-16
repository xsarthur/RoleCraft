"""Bounded tracemalloc experiment, at most a few MB; not a production RSS benchmark."""
import gc
import json
import tracemalloc
from collections import deque


def measure(mode):
    tracemalloc.start()
    cache = deque(maxlen=4) if mode == "bounded" else []
    samples = []
    for batch in range(4):
        for _ in range(32):
            value = bytearray(4096)
            if mode != "temporary":
                cache.append(value)
        del value
        gc.collect()
        current, peak = tracemalloc.get_traced_memory()
        samples.append({"batch": batch, "retained_items": len(cache),
                        "traced_current": current, "traced_peak": peak})
    locations = tracemalloc.take_snapshot().statistics("lineno")[:2]
    print(json.dumps({"mode": mode, "samples": samples,
                      "top_locations": [str(x) for x in locations]}, ensure_ascii=False))
    tracemalloc.stop()
    return samples


if __name__ == "__main__":
    retained = measure("retained")
    bounded = measure("bounded")
    temporary = measure("temporary")
    assert retained[-1]["retained_items"] == 128
    assert all(x["retained_items"] == 4 for x in bounded)
    assert all(x["retained_items"] == 0 for x in temporary)
    print("n09 memory PASS: finite retention, bounded-cache and temporary-allocation evidence")
