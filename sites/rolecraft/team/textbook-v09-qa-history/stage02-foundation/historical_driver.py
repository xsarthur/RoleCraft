import sys, runpy, json, platform, hashlib
def deny(event, args):
    if event.startswith("socket.") or event in ("subprocess.Popen", "os.system", "os.exec", "os.spawn"):
        raise RuntimeError("QA_DENIED:" + event)
sys.addaudithook(deny)
ns = runpy.run_path("old_foundation.py", run_name="qa_non_main")
limit = sys.get_int_max_str_digits()
assert limit > 0
text = '{"days":' + '9' * (limit + 1) + ',"expected":true}'
try:
    ns["check_case"](text)
except ValueError as exc:
    print(json.dumps({"case":"CR09-02 original long integer", "digits":limit+1, "actualException":type(exc).__name__, "message":str(exc), "expectedHistoricalFailureObserved":True}))
else:
    raise AssertionError("original ValueError not observed")
