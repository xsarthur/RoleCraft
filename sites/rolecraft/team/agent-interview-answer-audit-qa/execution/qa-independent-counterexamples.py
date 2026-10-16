"""Independent QA of frozen, finite local teaching functions. No network/provider/database."""
from pathlib import Path
import ast, asyncio, copy, importlib.util, itertools, json, sys
ROOT = Path(__file__).resolve().parent
RESULTS = []
def load(name):
    key = 'qa_' + name.replace('-', '_')
    spec = importlib.util.spec_from_file_location(key, ROOT/(name+'.py'))
    m = importlib.util.module_from_spec(spec)
    sys.modules[key] = m
    spec.loader.exec_module(m)
    return m
n1=load('n01-runtime-boundaries');n2=load('n02-memory-routing');n6=load('n06-graph-contracts');n7=load('n07-delegation');n9=load('n09-runtime-recovery')
# Execute only exact merge_findings AST; no LangGraph imports/runtime implied.
parsed=ast.parse((ROOT/'n06-graph.py').read_text())
fn=next(n for n in parsed.body if isinstance(n,ast.FunctionDef) and n.name=='merge_findings')
scope={};exec(compile(ast.Module(body=[fn],type_ignores=[]),'exact-source:merge_findings','exec'),scope);merge=scope['merge_findings']
def case(name, questions, action):
    try:
        detail=action()
    except Exception as e:
        RESULTS.append({'id':name,'questions':questions,'status':'FAIL','error':repr(e)})
        raise
    else:
        RESULTS.append({'id':name,'questions':questions,'status':'PASS','observation':detail})
def rejects(fn,typ=Exception):
    try:fn()
    except typ:return
    raise AssertionError('rejection missing')
def reducer_order():
    items=[{'a@1':'A'},{'b@1':'B'},{'c@1':'C'}]
    outcomes=[]
    for perm in itertools.permutations(items):
        result={}
        for item in perm: result=merge(result,item)
        outcomes.append(result)
    assert all(x=={'a@1':'A','b@1':'B','c@1':'C'} for x in outcomes)
    return {'orders':len(outcomes),'result':outcomes[0]}
def reducer_replay():
    first={'a@1':'A'}; before=copy.deepcopy(first)
    assert merge(first,first)==first
    rejects(lambda:merge(first,{'a@1':'wrong'}),ValueError)
    assert first==before
    return 'same-key same-content idempotent; conflicting value rejected; inputs unchanged'
def stream_gap():
    c=n6.Consumer('task')
    e=lambda s,k,p={}: {'task_id':'task','seq':s,'kind':k,'payload':p}
    assert c.accept(e(1,'text'))=='accepted'
    assert c.accept(e(3,'final'))=='replay_required' and not c.final and len(c.events)==1
    assert c.accept(e(2,'pause'))=='accepted'
    assert c.accept(e(3,'final'))=='accepted' and c.final
    assert c.accept(e(3,'final'))=='duplicate'
    rejects(lambda:c.accept(e(3,'final',{'changed':True})),ValueError)
    return 'gap final not consumed; replay completes once; conflicting duplicate rejected'
def stream_identity():
    c=n6.Consumer('a')
    rejects(lambda:c.accept({'task_id':'b','seq':1,'kind':'final','payload':{}}),ValueError)
    rejects(lambda:c.accept({'task_id':'a','seq':True,'kind':'final','payload':{}}),ValueError)
    assert not c.events and not c.final
    return 'wrong task and bool-as-sequence rejected without state change'
def lru():
    c=n1.LRU(2);c.put('A',1);c.put('B',2);assert c.get('A')==1;c.put('C',3)
    rejects(lambda:c.get('B'),KeyError);assert list(c.data)==['A','C']
    c.put('A',4);assert len(c.data)==2 and list(c.data)==['C','A'] and c.get('A')==4
    z=n1.LRU(0);z.put('x',1);assert len(z.data)==0
    rejects(lambda:n1.LRU(True),ValueError)
    return 'capacity0, hit promotion, overwrite and B eviction verified'
def schema():
    assert n1.consume('complete','{"report_id":"17","failed":true}','17')=='CANDIDATE'
    assert n1.consume('complete','{"report_id":"18","failed":true}','17')=='SEMANTIC_MISMATCH'
    assert n1.consume('refused','{"report_id":"17","failed":true}','17')=='REFUSED'
    assert n1.consume('partial','{"report_id":"17","failed":true}','17')=='INCOMPLETE'
    assert n1.consume('complete','{"report_id":"17","failed":true,"failed":false}','17')=='BAD_JSON'
    return 'shape-valid wrong identity, refused, incomplete, duplicate-key branches differ'
def alias():
    a={'messages':[]};b=a.copy();b['messages'].append('x');assert a['messages']==['x']
    frozen=([],);frozen[0].append('mutable');assert frozen==(['mutable'],)
    return 'shallow copy shares nested list; tuple does not freeze inner object'
def decorator():
    seen=[];err=RuntimeError('sentinel')
    @n1.logged(seen)
    def fail(x):raise err
    try:fail(1)
    except RuntimeError as got:assert got is err
    else:raise AssertionError('exception swallowed')
    assert fail.__name__=='fail' and fail.__wrapped__.__name__=='fail'
    assert len(seen)==1 and seen[0][1]=='raised'
    return 'exception identity, wrapped metadata and one failure log preserved'
def memory():
    s=n2.Store();a=n2.Scope('tenantA','user');b=n2.Scope('tenantB','user')
    mid=s.put(a,'language','zh','source1',100,0,True);s.record_output('o',a,[mid],1)
    assert s.read(b,'language',1) is None
    rejects(lambda:s.delete(b,mid),PermissionError)
    s.invalidate_source('source1');assert s.read(a,'language',1) is None and 'o' in s.invalid_outputs
    return 'same user different tenant hidden; foreign delete rejected; source invalidation blocks dependent consumption'
def routing():
    sc=n2.Scope('A','U');r=n2.Router([n2.Task('t1',sc,1,'paused'),n2.Task('t2',sc,2,'paused')])
    assert r.choose(sc,['t1','t2'])['status']=='CLARIFY'
    x=r.choose(sc,['t1','t2'],'t1');assert x['approval']=='RECHECK_REQUIRED'
    old=x['epoch'];r.choose(sc,['t2'],'t2');assert not r.accept_result('t1',1,old)
    return 'ambiguous continue asks; switching invalidates old task result and requests approval recheck'
def compensation():
    p=n9.FixtureProvider();j=[{'step':s,'operation_id':'x:'+s,'effect':'confirmed','undo':'pending'}for s in ('reserve','draft')]
    assert n9.compensate(j,p)=='paused_unknown_compensation'
    assert j[0]['undo']=='pending' and j[1]['undo']=='unknown'
    assert n9.compensate(j,p)=='compensated' and len(p.undo_results)==2
    snapshot=copy.deepcopy(p.undo_results);assert n9.compensate(j,p)=='compensated' and p.undo_results==snapshot
    p2=n9.FixtureProvider();j2=[{'step':'draft','operation_id':'u','effect':'unknown','undo':'pending'}]
    assert n9.compensate(j2,p2)=='needs_original_effect_reconciliation' and not p2.undo_results
    return 'lost undo receipt reconciles same key; repeat recovery adds none; unknown original effect forbids blind undo'
def breaker():
    b=n9.Breaker();old=b.acquire(0)
    for t in [0,1]:b.outcome(t,b.acquire(t),False)
    assert b.state=='open' and b.acquire(2) is None
    probe=b.acquire(6);assert b.acquire(6) is None
    assert b.outcome(6,old,True)=='stale_generation' and b.state=='half_open'
    b.outcome(6,probe,True);assert b.state=='closed'
    return 'single half-open probe; stale success cannot close new generation'
def delegation():
    t=n7.Task('task','rev1',3)
    e={'event_id':'1','task_id':'task','epoch':1,'version':'rev1','state':'working','cost':2,'claims':[]}
    assert t.apply(e)=='applied';assert t.apply(e)=='duplicate' and t.spent==2
    assert t.reassign(1)==2 and t.spent==2
    late=dict(e,event_id='late');rejects(lambda:t.apply(late),ValueError)
    over=dict(e,event_id='new',epoch=2,state='completed');rejects(lambda:t.apply(over),ValueError)
    assert t.spent==2
    return 'dedup does not double-charge; reassign keeps spent; old epoch/over-budget reject'
case('QA-CE01',['Q54'],reducer_order)
case('QA-CE02',['Q54'],reducer_replay)
case('QA-CE03',['Q59'],stream_gap)
case('QA-CE04',['Q59'],stream_identity)
case('QA-CE05',['M103'],lru)
case('QA-CE06',['M110','Q23'],schema)
case('QA-CE07',['M102'],alias)
case('QA-CE08',['M102'],decorator)
case('QA-CE09',['Q35','Q36','Q37'],memory)
case('QA-CE10',['M112'],routing)
case('QA-CE11',['Q89','P02'],compensation)
case('QA-CE12',['Q95'],breaker)
case('QA-CE13',['Q68','Q69'],delegation)
report={'scope':'13 independent finite counterexample groups, exact frozen teaching functions. Not an end-to-end Agent/service, protocol, OS sandbox, GPU or real user test.','runtime':sys.version,'results':RESULTS}
(ROOT/'qa-independent-counterexamples.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'status':'PASS','groups':len(RESULTS),'report':'qa-independent-counterexamples.json'}))
