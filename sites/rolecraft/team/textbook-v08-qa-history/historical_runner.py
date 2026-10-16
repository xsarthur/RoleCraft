"""Reproduce already reported defects on archived author code; no external calls."""
import importlib.util
import json
import pathlib
import sys
from dataclasses import replace

spec=importlib.util.spec_from_file_location('guard',pathlib.Path.cwd()/'runner.py')
guard=importlib.util.module_from_spec(spec);sys.modules['guard']=guard;spec.loader.exec_module(guard)

f=guard.load('old_f01');t=f.BoundaryTests();t.setUp()
try:
    t.invoke(f.Reply(200,json.dumps({**t.source,'content':'\ud800'}).encode()))
    raised=False
except UnicodeEncodeError:
    raised=True
guard.check('CR08-01:archived_counterexample_raises',raised,True,'Historical defect reproduced; current stage01 returns CONTENT_NOT_UTF8.')

f=guard.load('old_f02')
class Reply:
    def __enter__(self):return self
    def __exit__(self,*args):return False
    def read(self,n):return b'[]'
f.urlopen=lambda req,timeout:Reply()
try:
    f.request_once('qa-dummy-not-a-credential','qa-not-a-real-model');raised=False
except AttributeError:
    raised=True
guard.check('CR08-02:archived_wrapper_array_crash',raised,True,'No original urlopen or main called; fake document only.')

f=guard.load('old_e02');guard.main_body(f)
result=f.judge(f.case,replace(f.normal,trace_complete=False,outcome='REFUSED',unresolved_effects=1))
guard.check('CR08-04:archived_known_failure_masked',result.status,'INSUFFICIENT','Known wrong outcome is masked; current stage01 gives FAIL and retains unknown.')

f=guard.load('old_e03');guard.main_body(f)
marker='fixture-secret-"\\\nEND'
intent=replace(f.intent,body=marker);desk=f.LocalIssueDesk()
desk.grant(f.Approval('ap',intent.action_id,f.digest(intent),110))
result=desk.execute(f.principal,f.goal,intent,'ap',100,frozenset({marker}))
guard.check('CR08-05:archived_special_marker_payload_leaks',[result[0],len(desk._state.receipts)],['CREATED',1],'Marker is synthetic; current stage01 denies SENSITIVE_PAYLOAD before an effect.')
print(json.dumps({'status':'historical_defects_reproduced_as_expected','records':guard.records},ensure_ascii=False,indent=2))
