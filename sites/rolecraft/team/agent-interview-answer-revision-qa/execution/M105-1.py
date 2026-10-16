import math

def metrics(x, y):
    x, y = tuple(x), tuple(y)
    if not 1 <= len(x) <= 1024 or len(x) != len(y):
        raise ValueError("dimension")
    for v in x + y:
        if type(v) not in (int, float) or abs(v) > 1e100 or not math.isfinite(v):
            raise ValueError("finite bounded number required")
    nx, ny = math.hypot(*x), math.hypot(*y)
    if nx == 0 or ny == 0:
        raise ValueError("zero vector has no cosine")
    dot = math.fsum(a*b for a, b in zip(x, y))
    cosine = math.fsum((a/nx)*(b/ny) for a, b in zip(x, y))
    distance = math.hypot(*(a-b for a, b in zip(x, y)))
    return dot, cosine, distance

q, a, b = (1, 0), (2, 0.2), (1, 0)
ma, mb = metrics(q, a), metrics(q, b)
assert ma[0] > mb[0] and ma[1] < mb[1] and ma[2] > mb[2]
unit_a = tuple(v / math.hypot(*a) for v in a)
dot, cos, dist = metrics(q, unit_a)
assert math.isclose(dot, cos)
assert math.isclose(dist*dist, 2 - 2*dot)
for bad in [(0, 0), (float("nan"), 0), (1, 2, 3)]:
    try:
        metrics(q, bad)
    except ValueError:
        continue
    raise AssertionError("expected input rejection")
