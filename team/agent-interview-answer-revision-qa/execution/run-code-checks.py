import asyncio,contextlib,importlib.util,io,json,math,pathlib,random,runpy,subprocess,sys,time,traceback
ROOT=pathlib.Path(__file__).parent
records=[]
def test(name,fn):
 t=time.perf_counter()
 try:
  result=fn();records.append({'name':name,'status':'pass','detail':result,'seconds':round(time.perf_counter()-t,4)})
 except BaseException as e:
  records.append({'name':name,'status':'fail','exception':repr(e),'traceback':traceback.format_exc()})
for item in json.loads((ROOT/'extracted-manifest.json').read_text()):
 path=pathlib.Path(item['file']).resolve();p=subprocess.run([sys.executable,str(path)],capture_output=True,text=True,timeout=15)
 records.append({'name':f"extracted_{item['id']}_{item['block']}",'status':'pass' if p.returncode==0 else 'fail','exit':p.returncode,'stdout':p.stdout,'stderr':p.stderr,'sourceSha256':item['sha256']})
def load(name):
 with contextlib.redirect_stdout(io.StringIO()):return runpy.run_path(str(ROOT/name),run_name='qa_import')
a=load('M101-1.py');b=load('M102-2.py');c=load('M103-1.py');d=load('M105-1.py');e=load('M106-1.py');f=load('M110-1.py')
def async_tests():
 async def run():
  # Exact published implementation, bounded workers with deliberately nontrivial order.
  result=await a['bounded_map']([.04,.01,.03],a['fake_call'],workers=2,timeout_s=.5)
  assert result==[('ok',.04),('ok',.01),('ok',.03)],result
  assert a['fake_call'].__globals__['active']==0
  assert await a['bounded_map']([],a['fake_call'])==[]
  for n in [0,-1,True,1.5]:
   try:await a['bounded_map']([],a['fake_call'],workers=n)
   except ValueError:pass
   else:raise AssertionError(n)
  entered=[]; cleaned=[]
  async def unexpected(i):
   entered.append(i)
   try:
    if i==0:
     await asyncio.sleep(.01);raise RuntimeError('fixture failure')
    await asyncio.sleep(2)
   finally:cleaned.append(i)
  try:await a['bounded_map'](range(100),unexpected,workers=2,timeout_s=4)
  except ExceptionGroup as exc:assert any(isinstance(x,RuntimeError) for x in exc.exceptions)
  else:raise AssertionError('ExceptionGroup lost')
  assert sorted(cleaned)==sorted(entered)
  assert len(asyncio.all_tasks())==1,'leftover tasks'
  # External cancellation while producer backpressured; cleanup must complete.
  entered.clear();cleaned.clear()
  async def slow(i):
   entered.append(i)
   try:await asyncio.sleep(2)
   finally:cleaned.append(i)
  t=asyncio.create_task(a['bounded_map'](range(1000),slow,workers=2,timeout_s=4));await asyncio.sleep(.01);t.cancel()
  try:await t
  except asyncio.CancelledError:pass
  else:raise AssertionError('cancel swallowed')
  assert sorted(cleaned)==sorted(entered) and len(asyncio.all_tasks())==1
  return {'order_and_empty':True,'bad_worker_values':4,'unexpected_exception_cleanup':True,'outer_cancel_cleanup':True,'leftoverTasks':0}
 return asyncio.run(run())
test('M101_order_bound_exceptions_cancel',async_tests)
def decorator_tests():
 logs=[];ret=object();err=ValueError('fixture');decor=b['logged'](logs.append)
 @decor
 def identity(x=ret):
  'fixture doc'
  return x
 assert identity() is ret and identity.__name__=='identity' and identity.__doc__=='fixture doc' and identity.__wrapped__() is ret
 @decor
 def boom():raise err
 try:boom()
 except ValueError as ex:assert ex is err
 else:raise AssertionError('exception swallowed')
 def emit_fail(_):raise RuntimeError('ordinary log failure')
 assert b['logged'](emit_fail)(lambda:ret)() is ret
 async def arun():
  @decor
  async def good():return ret
  assert await good() is ret
  @decor
  async def bad():raise err
  try:await bad()
  except ValueError as ex:assert ex is err
  else:raise AssertionError('async exception swallowed')
  @decor
  async def cancel():await asyncio.sleep(2)
  t=asyncio.create_task(cancel());await asyncio.sleep(0);t.cancel()
  try:await t
  except asyncio.CancelledError:pass
  else:raise AssertionError('cancel swallowed')
 asyncio.run(arun());assert ('cancel','cancelled') in logs
 return {'events':logs,'return_identity':True,'exception_identity':True,'metadata':True,'log_failure_noninterference':True}
test('M102_decorator_behavior',decorator_tests)
def lru_tests():
 from collections import OrderedDict
 rng=random.Random(431);ops=0
 for size in range(5):
  lru=c['LRU'](size);oracle=OrderedDict()
  for _ in range(250):
   key=rng.randrange(8);ops+=1
   if rng.randrange(2):
    value=rng.choice([None,0,5]);lru.put(key,value)
    if size:
     oracle[key]=value;oracle.move_to_end(key)
     if len(oracle)>size:oracle.popitem(last=False)
   elif key in oracle:
    assert lru.get(key)==oracle[key];oracle.move_to_end(key)
   else:c['must_miss'](lru,key)
   assert lru.keys_old_to_new()==list(oracle)
   assert len(lru)==len(oracle)<=size
   seen=[];node=lru.root
   for j in range(size+2):
    assert node.next.prev is node and node.prev.next is node
    node=node.next
    if node is lru.root:break
    seen.append(node)
   else:raise AssertionError('list cycle does not reach sentinel')
   assert len(seen)==len(lru.nodes) and set(map(id,seen))==set(map(id,lru.nodes.values()))
 for bad in [-1,True,1.1,'2']:
  try:c['LRU'](bad)
  except ValueError:pass
  else:raise AssertionError(bad)
 return {'random_operations':ops,'capacities':list(range(5)),'oracle':'OrderedDict','link_and_node_invariants_after_every_op':True}
test('M103_LRU_randomized_and_structural_invariants',lru_tests)
def metrics_tests():
 metrics=d['metrics'];rng=random.Random(900)
 for _ in range(200):
  x=[rng.uniform(-10,10) for _ in range(5)];y=[rng.uniform(-10,10) for _ in range(5)]
  ux=[v/math.hypot(*x) for v in x];uy=[v/math.hypot(*y) for v in y]
  dp,co,dist=metrics(ux,uy);assert math.isclose(dp,co,abs_tol=1e-14);assert math.isclose(dist**2,2-2*co,abs_tol=1e-14)
 assert math.isclose(metrics([1,0],[-1,0])[1],-1)
 assert metrics([1,0],[0,1])[1]==0
 for x,y in [([],[]),([1],[1,2]),([1],[float('inf')]),([1],[True]),([1],[10**1000]),([1],[0])]:
  try:metrics(x,y)
  except ValueError:pass
  else:raise AssertionError((x,y))
 return {'normalized_identities':200,'antiparallel_orthogonal':True,'invalid_cases':6}
test('M105_normalization_and_invalid_numbers',metrics_tests)
def exact_tests():
 exact=e['exact_l2'];rows=[('a',(0,1)),('b',(0,-1)),('forbidden',(0,0)),('far',(4,4))]
 assert exact((0,0),rows,{'a','b','far'},2)==[(1,'a'),(1,'b')]
 assert exact((0,0),rows,set(),3)==[]
 assert len(exact((0,0),rows,{'far'},5))==1
 assert exact((0,0),rows,{'far'},5)==[(32,'far')]
 assert not any(x[1]=='forbidden' for x in exact((0,0),rows,{'a','b','far'},20))
 try:exact((0,),rows,{'a'},1)
 except ValueError:pass
 else:raise AssertionError('dimension accepted')
 return {'filter_before_topk':True,'stable_tie_id':True,'small_allowed_count_and_empty':True,'dimension_check':True,'limits':'caller performs numeric contract; no real ANN'}
test('M106_exact_filtered_baseline',exact_tests)
def consume_tests():
 consume=f['consume'];cases=[({'status':'refused','text':''},'REFUSED'),({'status':'truncated','text':'{}'},'INCOMPLETE'),({'status':'complete','text':'not JSON'},'INVALID_JSON'),({'status':'complete','text':'[]'},'INVALID_FIELDS'),({'status':'complete','text':'{"report_id":"r1","failed":true,"admin":true}'},'INVALID_FIELDS'),({'status':'complete','text':'{"report_id":"r1","failed":1}'},'INVALID_TYPES'),({'status':'complete','text':'{"report_id":"r2","failed":true}'},'SEMANTIC_MISMATCH'),({'status':'complete','text':'{"report_id":"r1","failed":true}'},'CANDIDATE_REQUIRES_EVIDENCE')]
 for value,expect in cases:assert consume(value,'r1')[0]==expect
 return {'cases':len(cases),'all_expected_statuses':True,'no_side_effect_api_in_example':True,'semantic_truth_not_inferred':True}
test('M110_consumption_failure_matrix',consume_tests)
def arithmetic_tests():
 weights=[math.exp(x)/(1+math.exp(1/math.sqrt(2))) for x in (0,1/math.sqrt(2))]
 attn=[weights[0]*2,weights[1]*4];assert math.isclose(attn[0],.660,abs_tol=.001);assert math.isclose(attn[1],2.680,abs_tol=.001)
 probs=[math.exp(x-2)/sum(math.exp(y-2) for y in [2,1,0]) for x in [2,1,0]]
 assert all(math.isclose(a,b,abs_tol=.001) for a,b in zip(probs,[.665,.245,.090]))
 kv=2*32*4096*8*128*2;assert kv==536870912 and kv/1024**2==512
 assert 100*.2+40*2==100 and 100*.2+20*2==60
 assert math.isclose(3000/(.8-.1),4285.714285714285)
 assert 70+15+3+2==90 and math.isclose(70/90,.7777777778)
 assert 20+2==22 and math.isclose(22/30,.7333333333)
 return {'M109_attention':attn,'M109_softmax':probs,'M113_KV_bytes':kv,'cost_judge_success_arithmetic':True,'no_transformer_or_GPU_execution':True}
test('M109_M113_and_numerical_examples',arithmetic_tests)
result={'python':sys.version,'scope':'seven exact extracted Python blocks plus independent calls to their functions and separate arithmetic; no app/service/LLM/GPU','records':records,'allPassed':all(r['status']=='pass' for r in records)}
(ROOT/'code-results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(json.dumps(result,ensure_ascii=False,indent=2));sys.exit(0 if result['allPassed'] else 1)
