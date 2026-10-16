import runpy,pathlib
root=pathlib.Path(__file__).resolve().parents[2]/'textbooks/v12'
x=runpy.run_path(str(root/'examples/n05-index-lifecycle.py'));gate=x['control_gate']
unresolved={'policy'};calls=1
assert gate(unresolved,False,calls,0,10,0)=='PROPOSE'
calls-=1;unresolved.remove('policy')
assert gate(unresolved,False,calls,1,10,0)=='COMPLETE_EXISTING_EVIDENCE'
assert gate(unresolved,True,calls,1,10,0)=='WAIT_INPUT'
assert gate({'policy'},False,5,1,10,2)=='STOP_BAD_PLAN'
assert gate({'policy'},False,0,1,10,2)=='INSUFFICIENT'
print('CA-01 last allowed retrieval completes; conflict overrides; bad-plan bounded PASS')
y=runpy.run_path(str(root/'examples/n03-plan-execution.py'));N=y['Node'];invalidate=y['invalidate']
nodes=(N('rule',(),frozenset(),frozenset({'r'}),'read',1),N('draft',('rule',),frozenset({'r'}),frozenset({'d'}),'read',1),N('issue',('draft',),frozenset({'d'}),frozenset({'i'}),'write',1,'write'))
for status in ['unknown','in_flight','done','EFFECT_RECHECK','unrecognized']:
 after=invalidate(nodes,{'rule':'done','draft':'done','issue':status},{'rule'})
 assert after['issue']=='EFFECT_RECHECK'
 assert invalidate(nodes,after,{'rule'})['issue']=='EFFECT_RECHECK'
for status in ['pending','confirmed_no_effect']:
 assert invalidate(nodes,{'rule':'done','draft':'done','issue':status},{'rule'})['issue']=='stale'
print('CA-03 unknown/inflight effects and repeated invalidation PASS')
text=(root/'n02-context-memory-prompt.md').read_text();schema=text.split('MemoryRecord {',1)[1].split('}',1)[0]
assert 'requires_recheck' in schema
assert '读取只接受 `active` 记忆' in text and '产物另用 `candidate|verified|requires_recheck|withdrawn`' in text
print('CA-02 declared memory/output states and consumer contract STATIC PASS; recursive persistence not executed')
