"""QA-only offline checks. Executed in a new temporary cwd with a minimal env."""
import ast
import contextlib
import importlib.util
import io
import json
import pathlib
import socket
import sys
import threading
import unittest
import urllib.request
from dataclasses import asdict, replace

records = []

def block_network(*args, **kwargs):
    raise RuntimeError("QA_NETWORK_BLOCKED")

def network_audit(event, args):
    if event in {"socket.connect", "socket.bind", "socket.getaddrinfo", "socket.sendto",
                 "subprocess.Popen", "os.system", "os.exec", "os.spawn"}:
        raise RuntimeError("QA_NETWORK_OR_PROCESS_BLOCKED:" + event)

sys.addaudithook(network_audit)
socket.create_connection = block_network
socket.getaddrinfo = block_network
urllib.request.urlopen = block_network

def check(name, actual, expected=True, detail=None):
    okay = actual == expected
    records.append({"name": name, "actual": actual, "expected": expected,
                    "pass": okay, "detail": detail})
    if not okay:
        raise AssertionError(name + ": " + repr(actual) + " != " + repr(expected))

def load(name):
    path = pathlib.Path.cwd() / (name + ".py")
    spec = importlib.util.spec_from_file_location("qa_" + name, path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)  # __name__ is never __main__
    return module

def main_body(module):
    tree = ast.parse(pathlib.Path(module.__file__).read_text())
    node = tree.body[-1]
    assert isinstance(node, ast.If) and ast.unparse(node.test) == "__name__ == '__main__'"
    stream = io.StringIO()
    with contextlib.redirect_stdout(stream):
        exec(compile(ast.Module(node.body, type_ignores=[]), module.__file__, "exec"), module.__dict__)
    return stream.getvalue().splitlines()

def f01_checks(m):
    stream = io.StringIO()
    result = unittest.TextTestRunner(stream=stream).run(unittest.defaultTestLoader.loadTestsFromTestCase(m.BoundaryTests))
    check("f01:author_five_tests", [result.testsRun, len(result.failures), len(result.errors)], [5, 0, 0], stream.getvalue())
    t = m.BoundaryTests(); t.setUp()
    variants = [("empty_path", {**t.raw, "path": ""}, "FIELD_INVALID"),
                ("extra_tenant", {**t.raw, "tenant": "other"}, "FIELDS_INVALID"),
                ("overlong_path", {**t.raw, "path": "x" * 201}, "FIELD_INVALID")]
    for name, raw, code in variants:
        out, calls = t.invoke(m.Reply(200, b"{}"), raw)
        check("f01:" + name, [out["code"], calls], [code, 0])
    for status, code in [(403,"REMOTE_DENIED"),(503,"REMOTE_TEMPORARY"),(404,"SOURCE_NOT_FOUND"),(302,"UNEXPECTED_STATUS")]:
        out, calls = t.invoke(m.Reply(status,b""))
        check("f01:http_" + str(status), [out["code"],calls], [code,1])
    for name, body, code in [("bad_json",b"{", "INVALID_JSON"),
            ("bad_hash",json.dumps({**t.source,"sha256":"wrong"}).encode(),"CONTENT_MISMATCH"),
            ("unpaired_surrogate",json.dumps({**t.source,"content":"\ud800"}).encode(),"CONTENT_NOT_UTF8"),
            ("overlarge",b"x"*(m.MAX_BYTES+1),"BODY_TOO_LARGE")]:
        out, calls = t.invoke(m.Reply(200,body))
        check("f01:"+name,[out["kind"],out["code"],calls],["INVALID_RESPONSE",code,1])

def f02_checks(m):
    ids = {x["id"] for x in m.EVIDENCE}
    good = {**m.FACTS,"source_refs":["report-71:failure-1"],"hypothesis":None,"missing_fields":[]}
    def response(value):
        return {"status":"completed","output":[{"type":"reasoning"},{"type":"message","role":"assistant","status":"completed","content":[{"type":"output_text","text":json.dumps(value)}]}]}
    fixtures = [("complete",response(good),"CANDIDATE",None),
        ("business_mismatch",response({**good,"actual":"True"}),"REJECTED","FACT_MISMATCH"),
        ("missing_facts",response({**good,"missing_fields":["rule_version"]}),"WAIT_INPUT",None),
        ("outside_evidence",response({**good,"source_refs":["private-ref"]}),"REJECTED","EVIDENCE_OUTSIDE_CONTEXT"),
        ("source_only",response({**good,"source_refs":[m.EVIDENCE[1]["id"]]}),"REJECTED","REPORT_CITATION_REQUIRED"),
        ("incomplete",{"status":"incomplete","output":response(good)["output"]},"REJECTED","PROTOCOL_NOT_COMPLETE"),
        ("refusal",{"status":"completed","output":[{"type":"message","role":"assistant","status":"completed","content":[{"type":"refusal","refusal":"fixture"}]}]},"REFUSED","MODEL_REFUSAL"),
        ("array",[],"REJECTED","PROTOCOL_OBJECT"),("null",None,"REJECTED","PROTOCOL_OBJECT")]
    for name, obj, kind, code in fixtures:
        out=m.consume_response(obj,m.FACTS,ids)
        check("f02:"+name,[out["kind"],out.get("code")],[kind,code])
    duplicate=response(good); duplicate["output"][1]["content"][0]["text"]='{"actual":"False","actual":"True"}'
    check("f02:duplicate_json_key",m.consume_response(duplicate,m.FACTS,ids)["code"],"CANDIDATE_JSON_INVALID")
    class Reply:
        def __init__(self,obj):self.raw=json.dumps(obj).encode()
        def __enter__(self):return self
        def __exit__(self,*args):return False
        def read(self,n):return self.raw[:n]
    for name,obj in [("array",[]),("null",None),("complete",response(good))]:
        m.urlopen=lambda req,timeout:Reply(obj)  # local fixture; no original urlopen called
        out=m.request_once("qa-dummy-not-a-credential","qa-not-a-real-model")
        check("f02:wrapper_"+name,out.get("code") if name!="complete" else out["verdict"]["kind"],"PROVIDER_PROTOCOL_OBJECT" if name!="complete" else "CANDIDATE")
    m.urlopen=block_network

def c02_checks(m):
    check("c02:default_outputs",main_body(m),["HITS","{'kind': 'SUPPORTED', 'scope': 'NORMALIZED_FIXTURE_FACT_ONLY'}","{'kind': 'UNSUPPORTED', 'reason': 'FACT_NOT_SUPPORTED'}"])
    snap,sources=m.fixture(); scope=m.QueryScope("tenant-dev","repo@8e12",snap.snapshot_id)
    def snap_for(chunks):return m.IndexSnapshot(m.snapshot_id(chunks),tuple(chunks))
    source=replace(snap.chunks[0],chunk_id="new-different-test",facts=(("new-report@days=7","actual","True"),))
    new=snap_for([*snap.chunks,source]); sc=replace(scope,index_snapshot_id=new.snapshot_id)
    pkg=m.retrieve("test_refund_day_7",sc,new,sources,top_k=1)
    check("c02:different_subject_not_conflict",pkg["known_conflicts"],{})
    contrary=replace(source,chunk_id="z-unmatched",text=snap.chunks[0].text,facts=(("report-71:failure-1@days=7","actual","True"),))
    conflict=snap_for([*snap.chunks,contrary]); sc=replace(scope,index_snapshot_id=conflict.snapshot_id)
    pkg=m.retrieve("test_refund_day_7",sc,conflict,sources,top_k=1)
    check("c02:top_k_hides_block_not_known_conflict",[len(pkg["chunks"]),m.judge_claim(pkg,"report-71:failure-1@days=7","actual","False",["report-71:failure-1"])["kind"]],[1,"CONFLICT"])
    stale=m.IndexSnapshot(snap.snapshot_id,tuple([*snap.chunks,source]))
    check("c02:snapshot_membership_binding",m.retrieve("refund",scope,stale,sources)["code"],"SNAPSHOT_MISMATCH")
    pkg=m.retrieve("refund",replace(scope,tenant="forbidden"),snap,sources)
    check("c02:forbidden_tenant_no_content",[pkg["retrieval_status"],len(pkg["chunks"]),pkg["known_conflicts"]],["NO_HITS",0,{}])
    revoked={k:replace(v,tenants=frozenset()) for k,v in sources.items()}
    check("c02:readback_revocation",m.retrieve("refund",scope,snap,revoked)["code"],"READBACK_SCOPE")
    old=replace(snap.chunks[0],chunk_id="old-refund",revision="repo@old")
    ss=snap_for([*snap.chunks,old]);pkg=m.retrieve("refund",replace(scope,index_snapshot_id=ss.snapshot_id),ss,sources)
    check("c02:old_revision_filtered",all(c.revision==scope.revision for c in pkg["chunks"]))

def c03_checks(m):
    args={"project":"refund-maintenance","title":"fixture","body":"hypothesis unverified","evidence_ids":["report-71:failure-1"]}
    stub=m.IssueStub();adapter=m.IssueAdapter(stub,frozenset({"attempt-1"}))
    dispatch=m.Dispatch("action-1","attempt-1","operation-1","fixture-intent",args)
    lost=adapter.create(dispatch)
    check("c03:effect_before_lost_reply",[lost["kind"],lost["attempt_id"],len(stub.issues)],["UNKNOWN","attempt-1",1])
    found=stub.lookup(dispatch.idempotency_key)
    check("c03:lookup_original_operation",[found["kind"],found["receipt"]["operation_id"]],["CONFIRMED_SUCCESS","operation-1"])
    retry=adapter.create(replace(dispatch,attempt_id="attempt-2"))
    check("c03:same_key_no_duplicate",[retry["kind"],len(stub.issues),retry["receipt"]["issue_id"]],["SUCCESS",1,found["receipt"]["issue_id"]])
    conflict=adapter.create(replace(dispatch,attempt_id="attempt-3",intent_hash="changed"))
    check("c03:key_argument_conflict_attempt_only",[conflict["kind"],conflict["proof_scope"],len(stub.issues)],["KNOWN_NO_EFFECT","THIS_ATTEMPT_ONLY",1])
    class WrongReceipt:
        def create(self,*args):return {"kind":"SUCCESS","receipt":{**found["receipt"],"operation_id":"another-operation"}}
    check("c03:other_operation_same_content_rejected",m.IssueAdapter(WrongReceipt()).create(dispatch)["code"],"UNTRUSTED_RECEIPT")
    adapter.create(replace(dispatch,attempt_id="attempt-4",idempotency_key="wrong-new-key"))
    check("c03:new_key_is_new_effect",len(stub.issues),2,"Deliberate negative control: proves why recovery must preserve key.")

def e02_checks(m):
    check("e02:default_outputs",main_body(m),["PASS","FAIL","INSUFFICIENT"])
    for name,change,code in [("known_wrong_outcome",{"outcome":"REFUSED"},"UNEXPECTED_OUTCOME"),
        ("known_semantic_reject",{"semantic_verdict":"REJECT"},"SEMANTIC_REVIEW_REJECTED"),
        ("known_receipt_mismatch",{"receipt_intent_digest":"other"},"RECEIPT_APPROVAL_MISMATCH")]:
        out=m.judge(m.case,replace(m.normal,trace_complete=False,unresolved_effects=1,**change))
        check("e02:"+name,[out.status,code in out.reasons,"PROCESS_EVIDENCE_MISSING" in out.reasons,"EFFECT_NOT_RESOLVED" in out.reasons],["FAIL",True,True,True])
    for count in [-1,True]:
        check("e02:invalid_effect_count_"+str(count),m.judge(m.case,replace(m.normal,unresolved_effects=count)).status,"HARNESS_ERROR")
    check("e02:harness_error_not_deleted",m.judge(m.case,replace(m.normal,harness_error="fixture-observer" )).status,"HARNESS_ERROR")
    denied=replace(m.normal,unauthorized_access=True,outcome="REFUSED")
    check("e02:refusal_after_unauthorized_read",m.judge(m.case,denied).status,"FAIL")

def e03_checks(m):
    check("e03:default_outputs",main_body(m),["CREATED","OBSERVED","DENIED:APPROVAL_EXPIRED","DENIED:PROJECT_DENIED"])
    marker='fixture-secret-"\\\nEND'
    raw={**m.raw,"debug":[{"secret_token":marker}],"failure_text":m.raw["failure_text"]+marker,"extra":"excluded"}
    context,markers=m.project_report(raw)
    check("e03:recursive_special_marker_redacted",[m.contains_marker(context,markers),"expected=True; actual=False" in context["failure_text"]],[False,True])
    desk=m.LocalIssueDesk();intent=m.intent
    desk.grant(m.Approval("approved",intent.action_id,m.digest(intent),110))
    for name,changed,now,ap in [("missing",intent,100,"none"),("expiry_equal",intent,110,"approved"),
        ("tenant",replace(intent,tenant_id="other"),100,"approved"),
        ("project",replace(intent,project="public-security"),100,"approved"),
        ("body",replace(intent,body="unapproved-change"),100,"approved"),
        ("tool",replace(intent,tool="delete_issue"),100,"approved"),
        ("secret",replace(intent,body=marker),100,"approved")]:
        out=desk.execute(m.principal,m.goal,changed,ap,now,markers)
        check("e03:deny_"+name,[out[0].startswith("DENIED:"),len(desk._state.receipts)],[True,0])
    out=desk.execute(m.principal,m.goal,intent,"approved",100,markers)
    check("e03:valid_after_denials",[out[0],len(desk._state.receipts)],["CREATED",1])
    out=desk.execute(m.principal,m.goal,replace(intent,action_id="new-action"),"approved",100,markers)
    check("e03:consumed_approval_new_action",[out[0],len(desk._state.receipts)],["DENIED:APPROVAL_CONSUMED",1])
    channels={"context":context,"output":m.user_output,"payload":asdict(intent),"logs":desk.events}
    check("e03:all_four_channels_and_useful_data",[not m.contains_marker(channels,markers),"report-71:failure-1" in m.user_output],[True,True])
    def compete(intents):
        local=m.LocalIssueDesk();barrier=threading.Barrier(len(intents));output=[]
        for i,x in enumerate(intents): local.grant(m.Approval("approval-"+str(i),x.action_id,m.digest(x),110))
        def work(i,x):barrier.wait();output.append(local.execute(m.principal,m.goal,x,"approval-"+str(i),100,markers)[0])
        threads=[threading.Thread(target=work,args=(i,x)) for i,x in enumerate(intents)]
        for t in threads:t.start()
        for t in threads:t.join()
        return output,len(local._state.receipts)
    output,n=compete([intent,intent])
    check("e03:same_action_concurrent",[sorted(output),n],[["CREATED","OBSERVED"],1])
    output,n=compete([intent,replace(intent,action_id="another-approved")])
    check("e03:distinct_approved_actions_same_slot",[sorted(output),n],[["CREATED","DENIED:EFFECT_SLOT_OCCUPIED"],1])

def e04_checks(m):
    check("e04:default_outputs",main_body(m),["HOLD ('run-18:STATE_SCHEMA',)","READY"])
    target=m.compatible;task=m.allowed
    variants=[("not_paused",[task],False,True,"NEW_WORK_NOT_PAUSED"),
        ("inventory_incomplete",[task],True,False,"INVENTORY_INCOMPLETE"),
        ("duplicate",[task,task],True,True,task.run_id+":DUPLICATE_INVENTORY"),
        ("owned",[replace(task,has_owner=True)],True,True,task.run_id+":OWNER_NOT_RELEASED_OR_FENCED"),
        ("no_resume_permission",[replace(task,approved_resume_releases=frozenset())],True,True,task.run_id+":RESUME_SEMANTICS_NOT_APPROVED")]
    for name,tasks,paused,complete,reason in variants:
        plan=m.plan_rollback(target,tasks,paused,complete)
        check("e04:"+name,[plan.status,list(plan.routes),reason in plan.blockers],["HOLD",[],True])
    missing=replace(target,reconcilers=frozenset())
    check("e04:unresolved_contract_needs_reconciler",m.plan_rollback(missing,[task],True,True).blockers,(task.run_id+":RECONCILER_MISSING",))

if __name__ == "__main__":
    try:
        for name in ("f01","f02","c02","c03","e02","e03","e04"):
            globals()[name+"_checks"](load(name))
        print(json.dumps({"status":"passed_within_offline_scope","records":records},ensure_ascii=False,indent=2))
    except Exception as error:
        print(json.dumps({"status":"failed","error":repr(error),"records":records},ensure_ascii=False,indent=2))
        raise
