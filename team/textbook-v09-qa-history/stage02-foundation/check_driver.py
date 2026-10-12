import sys, runpy, json, platform, hashlib
def deny(event, args):
    if event.startswith("socket.") or event in ("subprocess.Popen", "os.system", "os.exec", "os.spawn"):
        raise RuntimeError("QA_DENIED:" + event)
sys.addaudithook(deny)
ns = runpy.run_path("foundation.py", run_name="qa_non_main")
cases = json.loads(open("cases.json").read())
limit = sys.get_int_max_str_digits()
assert limit > 0, "default integer limit required for original counterexample"
long_text = '{"days":' + '9' * (limit + 1) + ',"expected":true}'
cases.append(["long_integer_parse_limit", long_text, {"kind":"REJECTED","code":"NUMBER_PARSE_LIMIT"}])
records = []
for name, text, expected in cases:
    calls = []
    actual_refund = ns["refund"]
    def observed_refund(days):
        calls.append(days)
        return actual_refund(days)
    ns["check_case"].__globals__["refund"] = observed_refund
    actual = ns["check_case"](text)
    ns["check_case"].__globals__["refund"] = actual_refund
    assert actual == expected, (name, actual, expected)
    if expected["kind"] == "REJECTED":
        assert calls == [], (name, calls)
    records.append({"name":name,"input":text if len(text)<1000 else {"bytes":len(text.encode()),"sha256":hashlib.sha256(text.encode()).hexdigest(),"construction":"default integer limit+1 nines"},"expected":expected,"actual":actual,"refundCalls":calls})
print(json.dumps({"python":platform.python_version(),"integerDigitLimit":limit,"assertions":records}, ensure_ascii=False))
