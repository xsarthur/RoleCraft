"""Only already-read pure foundation examples, fresh QA temp directory, isolated guarded children."""
import hashlib
import json
import os
import re
import subprocess
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
HISTORY = Path(__file__).resolve().parent
OUT = HISTORY / "stage02-foundation"
OUT.mkdir(exist_ok=True)
CURRENT = ROOT / "textbooks/v09/01-foundation.md"
OLD = ROOT / "team/textbook-v09-author-history/01-foundation-before-number-parse-repair.md"
INTERPRETER = "/Library/Frameworks/Python.framework/Versions/3.14/bin/python3"


def extract(path):
    raw = path.read_bytes()
    matches = list(re.finditer(r"^```python\n(.*?)^```\s*$", raw.decode(), re.M | re.S))
    assert len(matches) == 1
    code = matches[0].group(1)
    return raw, code


current_bytes, current_code = extract(CURRENT)
old_bytes, old_code = extract(OLD)
assert 'except ValueError:' in current_code and 'except ValueError:' not in old_code
assert current_code == old_code.replace('    except json.JSONDecodeError:\n        return {"kind": "REJECTED", "code": "BAD_JSON"}\n', '    except json.JSONDecodeError:\n        return {"kind": "REJECTED", "code": "BAD_JSON"}\n    except ValueError:\n        return {"kind": "REJECTED", "code": "NUMBER_PARSE_LIMIT"}\n')
faulty_code = current_code.replace("'CHECKED', False", "'CHECKED', True") if "'CHECKED', False" in current_code else current_code.replace('"CHECKED", False', '"CHECKED", True', 1)
assert faulty_code != current_code

GUARD = '''import sys, runpy, json, platform, hashlib
def deny(event, args):
    if event.startswith("socket.") or event in ("subprocess.Popen", "os.system", "os.exec", "os.spawn"):
        raise RuntimeError("QA_DENIED:" + event)
sys.addaudithook(deny)
'''
CASES = [
    ("known_day7_mismatch", '{"days":7,"expected":true}', {"kind":"CHECKED","days":7,"expected":True,"actual":False,"matches":False}),
    ("normal_day6", '{"days":6,"expected":true}', {"kind":"CHECKED","days":6,"expected":True,"actual":True,"matches":True}),
    ("normal_lower_boundary", '{"days":0,"expected":true}', {"kind":"CHECKED","days":0,"expected":True,"actual":True,"matches":True}),
    ("normal_upper_boundary", '{"days":365,"expected":false}', {"kind":"CHECKED","days":365,"expected":False,"actual":False,"matches":True}),
    ("malformed_json", '{"days":7,', {"kind":"REJECTED","code":"BAD_JSON"}),
    ("root_array", '[7,true]', {"kind":"REJECTED","code":"FIELDS"}),
    ("missing_field", '{"days":7}', {"kind":"REJECTED","code":"FIELDS"}),
    ("unknown_field", '{"days":7,"expected":true,"approved":true}', {"kind":"REJECTED","code":"FIELDS"}),
    ("boolean_day", '{"days":true,"expected":true}', {"kind":"REJECTED","code":"DAYS"}),
    ("list_day", '{"days":[7],"expected":true}', {"kind":"REJECTED","code":"DAYS"}),
    ("negative_day", '{"days":-1,"expected":true}', {"kind":"REJECTED","code":"DAYS"}),
    ("out_of_range_day", '{"days":366,"expected":true}', {"kind":"REJECTED","code":"DAYS"}),
    ("string_expected", '{"days":7,"expected":"true"}', {"kind":"REJECTED","code":"EXPECTED"}),
]
CHECK_DRIVER = GUARD + '''ns = runpy.run_path("foundation.py", run_name="qa_non_main")
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
'''
HIST_DRIVER = GUARD + '''ns = runpy.run_path("old_foundation.py", run_name="qa_non_main")
limit = sys.get_int_max_str_digits()
assert limit > 0
text = '{"days":' + '9' * (limit + 1) + ',"expected":true}'
try:
    ns["check_case"](text)
except ValueError as exc:
    print(json.dumps({"case":"CR09-02 original long integer", "digits":limit+1, "actualException":type(exc).__name__, "message":str(exc), "expectedHistoricalFailureObserved":True}))
else:
    raise AssertionError("original ValueError not observed")
'''
CLI_DRIVER = GUARD + '''source = sys.argv[1]
sys.argv = [source] + sys.argv[2:]
runpy.run_path(source, run_name="__main__")
'''
records = []
with tempfile.TemporaryDirectory(prefix="qa-v09-foundation-", dir="/private/tmp") as directory:
    work = Path(directory)
    for name, content in [("foundation.py",current_code),("old_foundation.py",old_code),("faulty_assertion.py",faulty_code),("cases.json",json.dumps(CASES)),("check_driver.py",CHECK_DRIVER),("historical_driver.py",HIST_DRIVER),("cli_driver.py",CLI_DRIVER)]:
        (work/name).write_text(content)
    env = {"PATH":"/usr/bin:/bin","LC_ALL":"C","TMPDIR":directory}
    commands = [
        ("current_cases", ["check_driver.py"], 0),
        ("historical_long_integer", ["historical_driver.py"], 0),
        ("default_cli", ["cli_driver.py","foundation.py"], 0),
        ("reject_cli", ["cli_driver.py","foundation.py",'{"days":true,"expected":true}'], 2),
        ("checks_cli", ["cli_driver.py","foundation.py","--check"], 0),
        ("intentional_assertion_failure", ["cli_driver.py","faulty_assertion.py","--check"], 1),
        ("restored_assertions", ["cli_driver.py","foundation.py","--check"], 0),
    ]
    for name, args, expected in commands:
        argv = [INTERPRETER,"-I","-B",*args]
        done = subprocess.run(argv,cwd=directory,env=env,text=True,capture_output=True)
        (OUT/(name+"-stdout.txt")).write_text(done.stdout)
        (OUT/(name+"-stderr.txt")).write_text(done.stderr)
        record={"name":name,"command":argv,"cwd":directory,"environment":env,"expectedExitCode":expected,"actualExitCode":done.returncode,"stdout":name+"-stdout.txt","stderr":name+"-stderr.txt"}
        records.append(record)
        assert done.returncode == expected, record
        if name=="default_cli":
            assert json.loads(done.stdout)["matches"] is False
        if name=="reject_cli":
            assert json.loads(done.stdout)["code"]=="DAYS"
        if name=="intentional_assertion_failure":
            assert "AssertionError" in done.stderr and "faulty_assertion.py" in done.stderr and '"matches": False' not in done.stdout
        if name in ("checks_cli","restored_assertions"):
            assert done.stdout.strip()=="checks completed"
    runtime=json.loads((OUT/"current_cases-stdout.txt").read_text())

for name, content in [("foundation.py",current_code),("old_foundation.py",old_code),("faulty_assertion.py",faulty_code),("check_driver.py",CHECK_DRIVER),("historical_driver.py",HIST_DRIVER),("cli_driver.py",CLI_DRIVER)]:
    (OUT/name).write_text(content)
source={"recordedAt":datetime.now(timezone.utc).isoformat(),"source":str(CURRENT),"sourceSha256":hashlib.sha256(current_bytes).hexdigest(),"codeSha256":hashlib.sha256(current_code.encode()).hexdigest(),"historicalSource":str(OLD),"historicalSourceSha256":hashlib.sha256(old_bytes).hexdigest(),"historicalCodeSha256":hashlib.sha256(old_code.encode()).hexdigest(),"faultInjection":"QA temp copy changes first CHECKED matches assertion False to True; original untouched; restored checks run from exact source","faultCopySha256":hashlib.sha256(faulty_code.encode()).hexdigest(),"safetyRead":"complete new and historical pure code; imports json/sys only; no file/network/model/secret access; guarded children; contract is CLI text, not arbitrary Python object library","notOSIsolationProof":True}
(OUT/"source.json").write_text(json.dumps(source,ensure_ascii=False,indent=2)+"\n")
(OUT/"execution.json").write_text(json.dumps({"recordedAt":source["recordedAt"],"pythonExecutable":INTERPRETER,"actualPythonVersion":runtime["python"],"defaultIntegerDigitLimit":runtime["integerDigitLimit"],"currentCaseRecords":len(runtime["assertions"]),"historicalCounterexamples":1,"records":records,"temporaryDirectoryRemoved":True,"sourceAndCodeShaBinding":source,"notFullBookExecution":True},ensure_ascii=False,indent=2)+"\n")
print(json.dumps({"python":runtime["python"],"currentCases":len(runtime["assertions"]),"historicalCases":1,"exitCodes":[r["actualExitCode"] for r in records],"sourceSha256":source["sourceSha256"],"codeSha256":source["codeSha256"]},ensure_ascii=False))
