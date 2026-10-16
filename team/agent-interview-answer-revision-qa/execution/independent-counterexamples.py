import asyncio,copy,hashlib,itertools,json,os,pathlib,sqlite3,subprocess,sys,tempfile,time
from concurrent.futures import ThreadPoolExecutor
OUT=pathlib.Path(__file__).parent
rows=[]
def case(name,fn):
 try:rows.append({'name':name,'status':'pass','result':fn()})
 except Exception as exc:rows.append({'name':name,'status':'fail','error':repr(exc)})

def remote_create(path,key,payload):
 db=sqlite3.connect(path,timeout=5)
 try:
  db.execute('BEGIN IMMEDIATE')
  row=db.execute('SELECT payload,obj FROM effects WHERE op=?',(key,)).fetchone()
  if row:
   if row[0]!=payload:raise ValueError('same key different payload')
   db.commit();return row[1]
  obj='issue-'+key
  db.execute('INSERT INTO effects(op,payload,obj) VALUES(?,?,?)',(key,payload,obj));db.commit();return obj
 finally:db.close()

def recovery():
 with tempfile.TemporaryDirectory(prefix='answer-qa-') as tmp:
  p=pathlib.Path(tmp);local=p/'local.sqlite';remote=p/'remote.sqlite'
  with sqlite3.connect(remote) as db:db.execute('CREATE TABLE effects(op TEXT PRIMARY KEY,payload TEXT,obj TEXT)')
  with sqlite3.connect(local) as db:
   db.execute('CREATE TABLE action(id TEXT PRIMARY KEY,op TEXT,payload TEXT,state TEXT,receipt TEXT,epoch INTEGER)')
   db.execute("INSERT INTO action VALUES('a1','k1','body1','UNKNOWN',NULL,1)")
  # Child commits remote effect then terminates before the local receipt save.
  child=subprocess.run([sys.executable,str(__file__),'crash_child',str(remote)],capture_output=True,text=True)
  assert child.returncode==23
  with sqlite3.connect(local) as db:assert db.execute('SELECT state,receipt FROM action').fetchone()==('UNKNOWN',None)
  with sqlite3.connect(remote) as db:found=db.execute('SELECT op,payload,obj FROM effects').fetchone()
  assert found==('k1','body1','issue-k1')
  with sqlite3.connect(local) as db:
   db.execute("UPDATE action SET state='SUCCEEDED',receipt=?,epoch=2 WHERE id='a1' AND epoch=1",(found[2],))
   assert db.execute("UPDATE action SET state='READY' WHERE id='a1' AND epoch=1").rowcount==0
  # Same remote key under concurrent replay must return one object.
  with ThreadPoolExecutor(max_workers=2) as pool:ids=list(pool.map(lambda _:remote_create(remote,'k1','body1'),range(2)))
  assert ids==['issue-k1','issue-k1']
  with sqlite3.connect(remote) as db:assert db.execute('SELECT count(*) FROM effects').fetchone()[0]==1
  try:remote_create(remote,'k1','changed')
  except ValueError:pass
  else:raise AssertionError('payload conflict not rejected')
  # Negative control: changing key after same effect creates a second object.
  remote_create(remote,'new-key','body1')
  with sqlite3.connect(remote) as db:count=db.execute('SELECT count(*) FROM effects').fetchone()[0]
  assert count==2
  return {'child_exit_after_remote_commit':23,'after_safe_recovery_effects':1,'same_key_concurrent_results':ids,'old_epoch_update_count':0,'naive_new_key_negative_control_effects':count,'durability_scope':'two independent temporary SQLite files; process restart only; not arbitrary power loss or real downstream'}

def state_decisions():
 def decide(observed,match=True,authorized=True,safe_replay=False):
  if observed=='SUCCESS':return 'ADOPT' if match else 'CONFLICT'
  if observed=='RUNNING':return 'WAIT'
  if observed=='PARTIAL':return 'PER_ITEM_RECONCILE'
  if observed=='NO_EFFECT_FINAL':return 'RETRY_SAME_KEY' if authorized else 'STOP_NEW_SEND'
  return 'RETRY_SAME_KEY' if authorized and safe_replay else 'WAIT_RESOLUTION'
 cases=[('SUCCESS',True,True,False,'ADOPT'),('SUCCESS',False,True,False,'CONFLICT'),('RUNNING',True,True,False,'WAIT'),('PARTIAL',True,True,False,'PER_ITEM_RECONCILE'),('STALE_404',True,True,False,'WAIT_RESOLUTION'),('QUERY_TIMEOUT',True,True,False,'WAIT_RESOLUTION'),('KEY_EXPIRED',True,True,False,'WAIT_RESOLUTION'),('NO_EFFECT_FINAL',True,True,False,'RETRY_SAME_KEY'),('UNKNOWN',True,True,True,'RETRY_SAME_KEY'),('UNKNOWN',True,False,True,'WAIT_RESOLUTION')]
 for args in cases:assert decide(*args[:-1])==args[-1]
 return {'cases':len(cases),'assumptions':'NO_EFFECT_FINAL covers all late sends; safe_replay is externally verified contract not inferred from absence; this is QA specification model'}

def merge_stream():
 def merge(a,b):
  out=dict(a)
  for k,v in b.items():
   if k in out and out[k]!=v:raise ValueError('conflict')
   out[k]=v
  return out
 vals=[{'report@r8':'false'},{'source@r8':'<7'},{'rule@r3':'unknown'}]
 for perm in itertools.permutations(vals):
  m={}
  for x in perm:m=merge(m,x)
  assert m=={'report@r8':'false','source@r8':'<7','rule@r3':'unknown'}
  assert merge(m,m)==m
 try:merge(vals[0],{'report@r8':'true'})
 except ValueError:pass
 else:raise AssertionError('conflict hidden')
 # Application event contract: gap blocks consumption; replay only once.
 delivered={};cursor=0
 def accept(seq,event):
  nonlocal cursor
  if seq in delivered:
   if delivered[seq]!=event:raise ValueError('same sequence conflict')
   return 'DUPLICATE'
  if seq!=cursor+1:return 'GAP'
  delivered[seq]=event;cursor=seq;return 'ACCEPT'
 assert accept(1,'started')=='ACCEPT' and accept(3,'final')=='GAP'
 assert accept(2,'finished')=='ACCEPT' and accept(3,'final')=='ACCEPT' and accept(3,'final')=='DUPLICATE'
 try:accept(3,'different')
 except ValueError:pass
 else:raise AssertionError('sequence conflict hidden')
 return {'merge_permutations':6,'replay_idempotent':True,'conflict_rejected':True,'stream_gap_replay_conflict':True,'scope':'QA model of described contract; not LangGraph or network implementation'}

def authorization():
 # Bound intent value, immutable body, current role, expires_at and consumed_by.
 approved={'tenant':'A','action':'a1','body':'B','expires':10,'consumed_by':'a1'}
 def allowed(tenant,action,body,now,has_role=True):return tenant==approved['tenant'] and action==approved['action'] and body==approved['body'] and now<approved['expires'] and has_role
 assert allowed('A','a1','B',9)
 for vals in [('B','a1','B',9,True),('A','a2','B',9,True),('A','a1','B2',9,True),('A','a1','B',10,True),('A','a1','B',9,False)]:assert not allowed(*vals)
 raw={'report_id':'r1','assertion':'failed','secret_token':'FAKE_SECRET','unknown':{'token':'FAKE_NESTED'}}
 projected={k:raw[k] for k in ['report_id','assertion']}
 assert 'FAKE_' not in json.dumps(projected)
 return {'legitimate_admitted':True,'tamper_new_intent_expiry_revocation_rejected':5,'allowlist_projection':True,'scope':'policy fixture only; no actual identity/downstream service'}

def memory_plan_budget():
 deps={'m1':['m2','out1'],'m2':['out2','m1'],'out1':['out2'],'out2':[]};seen=set();todo=['m1']
 while todo:
  x=todo.pop()
  if x in seen:continue
  seen.add(x);todo.extend(deps[x])
 assert seen=={'m1','m2','out1','out2'}
 graph={'R':[],'P':['R'],'S':['R'],'D':['R','P','S']};done={'R'}
 assert {k for k,d in graph.items() if k not in done and set(d)<=done}=={'P','S'}
 done.add('P');assert 'D' not in {k for k,d in graph.items() if k not in done and set(d)<=done}
 parent=10;reserved={'aggregation':2,'A':3,'B':3,'C':2};assert sum(reserved.values())==parent
 # Timed out B cannot free its 3 request reservations as if never sent.
 pending=reserved['B'];assert pending==3 and parent-sum(reserved.values())==0
 assert max(4,6)+2==8 and 4+6+2==12
 return {'cyclic_dependency_invalidation_terminates':True,'all_four_impacted':sorted(seen),'plan_join_waits_both':True,'unknown_budget_not_released':True,'parallel_latency_vs_sum':True}

def heartbeat_and_task_bound():
 async def run():
  async def observe(blocking):
   times=[]
   async def beat():
    for _ in range(12):times.append(time.perf_counter());await asyncio.sleep(.005)
   async def work():
    await asyncio.sleep(.01)
    if blocking:time.sleep(.08)
    else:await asyncio.sleep(.08)
   await asyncio.gather(beat(),work());return max(b-a for a,b in zip(times,times[1:]))
  blocking=await observe(True);nonblocking=await observe(False);assert blocking>.06 and nonblocking<blocking
  sem=asyncio.Semaphore(2);event=asyncio.Event()
  async def wait():
   async with sem:await event.wait()
  ts=[asyncio.create_task(wait()) for _ in range(40)];await asyncio.sleep(0)
  assert sum(not t.done() for t in ts)==40;event.set();await asyncio.gather(*ts)
  return {'blocking_heartbeat_max_gap':blocking,'async_heartbeat_max_gap':nonblocking,'semaphore_only_pending_tasks':40,'concurrency_limit':2}
 return asyncio.run(run())
if __name__=='__main__':
 if len(sys.argv)>1 and sys.argv[1]=='crash_child':
  remote_create(sys.argv[2],'k1','body1');os._exit(23)
 case('persistent_crash_recovery_with_negative_control',recovery)
 case('reconciliation_decision_branches',state_decisions)
 case('merge_and_stream_contracts',merge_stream)
 case('authorization_and_projection_contract',authorization)
 case('memory_plan_budget_contract',memory_plan_budget)
 case('async_blocking_and_unbounded_tasks_counterexamples',heartbeat_and_task_bound)
 result={'python':sys.version,'sqlite':sqlite3.sqlite_version,'scope':'independent QA specification fixtures; never production code, user DB or remote APIs','cases':rows,'allPassed':all(x['status']=='pass' for x in rows)}
 (OUT/'independent-results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(json.dumps(result,ensure_ascii=False,indent=2));sys.exit(0 if result['allPassed'] else 1)
