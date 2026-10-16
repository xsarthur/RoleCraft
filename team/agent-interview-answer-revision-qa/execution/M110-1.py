import json

def consume(envelope, expected_id):
    status = envelope["status"]
    if status == "refused":
        return "REFUSED", None
    if status != "complete":
        return "INCOMPLETE", None
    try:
        obj = json.loads(envelope["text"])
    except (ValueError, TypeError):
        return "INVALID_JSON", None
    if type(obj) is not dict or set(obj) != {"report_id", "failed"}:
        return "INVALID_FIELDS", None
    if type(obj["report_id"]) is not str or type(obj["failed"]) is not bool:
        return "INVALID_TYPES", None
    if obj["report_id"] != expected_id:
        return "SEMANTIC_MISMATCH", None
    return "CANDIDATE_REQUIRES_EVIDENCE", obj
