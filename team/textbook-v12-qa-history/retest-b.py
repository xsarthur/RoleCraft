import runpy,pathlib,json
root=pathlib.Path(__file__).resolve().parents[2]/'textbooks/v12/examples'
a=runpy.run_path(str(root/'n07-delegation.py'));Task=a['Task']
e={'event_id':'qa','task_id':'t','epoch':1,'version':'v','state':'working','cost':1,'claims':[{'key':'x','value':'yes','source':'s'}]}
t=Task('t','v',5);t.apply(e)
r=dict(reversed(list(e.items())));r['claims']=[dict(reversed(list(e['claims'][0].items())))]
assert t.apply(r)=='duplicate' and t.spent==1
before=(t.spent,t.state,len(t.claims))
try:t.apply(dict(e,cost=2))
except ValueError:pass
else:raise AssertionError('payload reuse accepted')
assert before==(t.spent,t.state,len(t.claims))
print('CB-01 original key ordering and changed-cost rejection PASS')
t.reassign(1)
t.apply(dict(e,event_id='newworking',epoch=2,claims=[]))
try:t.apply(dict(e,event_id='old-complete',state='completed'))
except ValueError:pass
else:raise AssertionError('stale worker accepted')
assert t.epoch==2 and t.state=='working' and t.spent==2
print('CB-04 original stale completion while replacement working PASS')
f=runpy.run_path(str(root/'n08-sandbox-policy.py'))['export_result']
assert not f('exited_zero','汉'*1000,1)['accepted']
assert not f('exited_zero',('汉'*1000).encode(),1)['accepted']
assert f('exited_zero',b'x'*1024,1)['accepted']
assert not f('exited_zero',b'x'*1025,1)['accepted']
assert not f('exited_zero',b'ok',True)['accepted']
print('CB-03 original unicode and byte exact-boundary/boolean-quota PASS')
B=runpy.run_path(str(root/'n09-runtime-recovery.py'))['Breaker'];b=B();old=b.acquire(0)
for now in [1,2]:
 token=b.acquire(now);b.outcome(now,token,False)
probe=b.acquire(7);state=(b.state,b.probe_inflight,b.generation)
assert b.outcome(7,old,True)=='stale_generation'
assert (b.state,b.probe_inflight,b.generation)==state
assert b.outcome(7,probe,False)=='probe_recorded' and b.state=='open'
assert b.outcome(7,probe,True)=='unknown_or_duplicate' and b.state=='open'
print('CB-05 original delayed old success and duplicate probe result PASS')
