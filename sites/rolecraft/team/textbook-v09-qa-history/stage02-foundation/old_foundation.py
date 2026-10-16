import json
import sys

def refund(days):
    return days < 7

def check_case(text):
    try:
        case = json.loads(text)
    except json.JSONDecodeError:
        return {"kind": "REJECTED", "code": "BAD_JSON"}
    if type(case) is not dict or set(case) != {"days", "expected"}:
        return {"kind": "REJECTED", "code": "FIELDS"}
    if type(case["days"]) is not int or not 0 <= case["days"] <= 365:
        return {"kind": "REJECTED", "code": "DAYS"}
    if type(case["expected"]) is not bool:
        return {"kind": "REJECTED", "code": "EXPECTED"}
    actual = refund(case["days"])
    return {"kind": "CHECKED", "days": case["days"],
            "expected": case["expected"], "actual": actual,
            "matches": actual == case["expected"]}

def checks():
    examples = [
        ('{"days":7,"expected":true}', "CHECKED", False),
        ('{"days":6,"expected":true}', "CHECKED", True),
        ('{"days":[7],"expected":true}', "REJECTED", None),
        ('{"days":true,"expected":true}', "REJECTED", None),
        ('{"days":7,', "REJECTED", None),
    ]
    for text, kind, matches in examples:
        result = check_case(text)
        assert result["kind"] == kind, (text, result)
        if kind == "CHECKED":
            assert result["matches"] is matches, (text, result)
    print("checks completed")

def main():
    if len(sys.argv) == 2 and sys.argv[1] == "--check":
        checks()
        return 0
    if len(sys.argv) > 2:
        print("usage: python3 foundation.py [JSON-text | --check]")
        return 2
    text = sys.argv[1] if len(sys.argv) == 2 else '{"days":7,"expected":true}'
    result = check_case(text)
    print(json.dumps(result, ensure_ascii=False, sort_keys=True))
    return 2 if result["kind"] == "REJECTED" else 0

if __name__ == "__main__":
    raise SystemExit(main())
