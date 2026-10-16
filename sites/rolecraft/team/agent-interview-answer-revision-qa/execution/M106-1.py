def exact_l2(q, rows, allowed_ids, k):
    if type(k) is not int or k < 1:
        raise ValueError("k")
    scored = []
    for doc_id, vector in rows:
        if doc_id not in allowed_ids:
            continue
        if len(q) != len(vector):
            raise ValueError("dimension")
        distance2 = sum((a-b)**2 for a, b in zip(q, vector))
        scored.append((distance2, doc_id))
    return sorted(scored)[:k]
