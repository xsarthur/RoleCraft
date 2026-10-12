"""QA fixtures for frozen e01. All sqlite files are restricted to this temp cwd."""
import importlib.util
import json
import os
import pathlib
import sqlite3
import sys
import threading

spec=importlib.util.spec_from_file_location('guard',pathlib.Path.cwd()/'runner.py')
guard=importlib.util.module_from_spec(spec);sys.modules['guard']=guard;spec.loader.exec_module(guard)
original_connect=sqlite3.connect
def isolated_connect(path,*args,**kwargs):
    if pathlib.Path(path).resolve().parent != pathlib.Path.cwd().resolve():
        raise RuntimeError('QA_DATABASE_PATH_BLOCKED')
    return original_connect(path,*args,**kwargs)
sqlite3.connect=isolated_connect
sys.path.insert(0, str(pathlib.Path.cwd().resolve()))  # only extracted, fully read teaching modules
m=guard.load('e01')
args={'project':'refund-maintenance','title':'fixture','body':'root cause remains unverified','evidence_ids':['report-71:failure-1']}
def runrow(s,run='run-qa'):
    return s.db.execute('SELECT * FROM runs WHERE run_id=?',(run,)).fetchone()
def event(s,epoch,kind,fields=None,now=1,run='run-qa',event_id=None):
    rev=runrow(s,run)['revision']
    return s.transact(run,epoch,rev,event_id or f'{run}-{kind}-{rev}',{'kind':kind,**(fields or {})},now)
def reject(name,call,code):
    try:call();observed='NOT_REJECTED'
    except m.Rejected as error:observed=str(error)
    guard.check(name,observed,code)
def prepared(path='runtime.sqlite',run='run-qa'):
    s=m.Store(path);s.new_run(run,100);epoch=s.acquire(run,1)
    action=event(s,epoch,'intent',{'action_id':run+'-action','operation_id':run+'-op','args':args},run=run)
    event(s,epoch,'approve',{'action_id':action['action_id'],'approval_id':run+'-approval','intent_hash':action['intent_hash'],'expires_at':90},run=run)
    return s,epoch,action
def begin(s,epoch,action,run='run-qa',now=1):
    return event(s,epoch,'begin',{'action_id':action['action_id'],'attempt_id':run+'-attempt','authorized_project':'refund-maintenance'},run=run,now=now)
def receipt(action,operation=None):
    return {'operation_id':operation or action['operation_id'],'intent_hash':action['intent_hash'],'project':'refund-maintenance','issue_id':'fixture-issue','version':1}
def snapshot(s):
    return {table:[dict(row) for row in s.db.execute('SELECT * FROM '+table)] for table in ['runs','actions','approvals','attempts','lookups','events']}

phase=sys.argv[1]
if phase=='crash_after_external_commit':
    s,epoch,action=prepared()
    event(s,epoch,'candidate',{'candidate':{'failure':'test_refund_day_7','refs':['report-71:failure-1']}})
    dispatch=begin(s,epoch,action)
    remote=sqlite3.connect('external-double.sqlite')
    remote.execute('CREATE TABLE effects(operation TEXT PRIMARY KEY,receipt TEXT NOT NULL)')
    remote.execute('INSERT INTO effects VALUES(?,?)',(dispatch['operation_id'],json.dumps(receipt(dispatch))))
    remote.commit();remote.close()
    guard.check('e01:before_crash_possible_sent',[s.action(action['action_id'],'run-qa')['effect_resolution'],runrow(s)['attempts_used']],['UNRESOLVED',1])
    print(json.dumps({'phase':phase,'records':guard.records,'snapshot':snapshot(s)},ensure_ascii=False),flush=True)
    os._exit(23)  # genuine interpreter exit before result commit; intentional expected result
elif phase=='restart_recover':
    s=m.Store('runtime.sqlite');old_epoch=runrow(s)['lease_epoch'];epoch=s.acquire('run-qa',12)
    action=dict(s.action('run-qa-action','run-qa'))
    guard.check('e01:restart_preserved_identity',[action['operation_id'],action['effect_resolution'],runrow(s)['attempts_used']],['run-qa-op','UNRESOLVED',1])
    reject('e01:old_owner_fenced',lambda:event(s,old_epoch,'stop',now=12),'NOT_OWNER')
    reject('e01:unknown_not_dispatchable',lambda:begin(s,epoch,action,now=12),'NOT_DISPATCHABLE')
    query=event(s,epoch,'begin_lookup',{'action_id':action['action_id'],'lookup_id':'lookup-qa'},now=12)
    remote=sqlite3.connect('external-double.sqlite');count=remote.execute('SELECT count(*) FROM effects').fetchone()[0]
    confirmed=json.loads(remote.execute('SELECT receipt FROM effects WHERE operation=?',(query['operation_id'],)).fetchone()[0]);remote.close()
    bad={'kind':'lookup_result','action_id':action['action_id'],'lookup_id':'lookup-qa','outcome':{'kind':'SUCCESS','receipt':{**confirmed,'operation_id':'wrong-operation'}}}
    reject('e01:wrong_receipt_rollback',lambda:s.transact('run-qa',epoch,runrow(s)['revision'],'bad-receipt',bad,12),'RECEIPT_MISMATCH')
    out=event(s,epoch,'lookup_result',{'action_id':action['action_id'],'lookup_id':'lookup-qa','outcome':{'kind':'SUCCESS','receipt':confirmed}},now=12)
    guard.check('e01:operation_confirmation_supersedes_old_attempt',[count,out['effect_confirmed'],s.db.execute('SELECT status FROM attempts').fetchone()[0],s.pending_observation('run-qa')],[1,True,'SUPERSEDED',False])
    reject('e01:complete_without_verdict',lambda:event(s,epoch,'complete',now=12),'VERDICT_STALE_OR_MISSING')
    verdict={'verdict_id':'verdict-qa','goal_revision':1,'candidate_hash':runrow(s)['candidate_hash'],'intent_hash':action['intent_hash'],'receipt_version':1,'accepted':True,'evidence_refs':['report-71:failure-1']}
    event(s,epoch,'verdict',{'action_id':action['action_id'],'verdict':verdict},now=12)
    guard.check('e01:complete_after_bound_verdict',event(s,epoch,'complete',now=12)['kind'],'COMPLETED')
    reject('e01:terminal_is_not_reopened',lambda:event(s,epoch,'stop',now=12),'RUN_TERMINAL')
    print(json.dumps({'phase':phase,'records':guard.records,'snapshot':snapshot(s)},ensure_ascii=False))
elif phase=='boundaries':
    s,epoch,action=prepared('boundaries.sqlite')
    event0={'kind':'candidate','candidate':{'facts':'fixture'}};rev=runrow(s)['revision']
    first=s.transact('run-qa',epoch,rev,'repeat-event',event0,1)
    second=s.transact('run-qa',epoch,rev,'repeat-event',event0,1)
    guard.check('e01:event_id_replay_does_not_advance', [first==second,runrow(s)['revision']], [True,rev+1])
    reject('e01:event_id_payload_conflict',lambda:s.transact('run-qa',epoch,rev,'repeat-event',{'kind':'stop'},1),'EVENT_ID_CONFLICT')
    reject('e01:stale_revision_rollback',lambda:s.transact('run-qa',epoch,rev,'stale',{'kind':'stop'},1),'STALE_REVISION')
    reused=event(s,epoch,'intent',{'action_id':'new-model-call-action','operation_id':'new-model-call-op','args':args})
    guard.check('e01:same_slot_reuses_original',[reused['action_id'],s.db.execute('SELECT count(*) FROM actions').fetchone()[0]],['run-qa-action',1])
    reject('e01:changed_intent_conflict',lambda:event(s,epoch,'intent',{'action_id':'other','operation_id':'other','args':{**args,'body':'changed'}}),'INTENT_CONFLICT')
    event(s,epoch,'stop');guard.check('e01:unsent_cancel_can_stop',event(s,epoch,'finish_stopped')['kind'],'STOPPED')
    s.db.close()
    s,epoch,action=prepared('cancel.sqlite');dispatch=begin(s,epoch,action)
    event(s,epoch,'stop');guard.check('e01:sent_cancel_remains_unresolved',event(s,epoch,'finish_stopped')['kind'],'WAIT_RESOLUTION')
    event(s,epoch,'outcome',{'action_id':action['action_id'],'attempt_id':'run-qa-attempt','outcome':{'kind':'SUCCESS','receipt':receipt(dispatch),'action_id':dispatch['action_id'],'attempt_id':dispatch['attempt_id'],'operation_id':dispatch['operation_id'],'intent_hash':dispatch['intent_hash']}})
    reject('e01:late_success_does_not_complete_cancel',lambda:event(s,epoch,'complete'),'CANNOT_COMPLETE')
    guard.check('e01:late_success_recorded_then_stop',[s.action(action['action_id'],'run-qa')['effect_resolution'],event(s,epoch,'finish_stopped')['kind']],['CONFIRMED_SUCCESS','STOPPED']);s.db.close()
    s=m.Store('schema.sqlite');s.db.execute('UPDATE metadata SET version=9');s.db.close()
    before=pathlib.Path('schema.sqlite').read_bytes()
    reject('e01:unknown_schema_rejected',lambda:m.Store('schema.sqlite'),'SCHEMA_UNSUPPORTED')
    guard.check('e01:unknown_schema_no_file_mutation',pathlib.Path('schema.sqlite').read_bytes()==before)
    s=m.Store('compete.sqlite');s.new_run('compete',100);s.db.close();barrier=threading.Barrier(2);results=[]
    def compete():
        own=m.Store('compete.sqlite');barrier.wait()
        try:results.append(['epoch',own.acquire('compete',1)])
        except m.Rejected as error:results.append(['rejected',str(error)])
        finally:own.db.close()
    threads=[threading.Thread(target=compete) for _ in range(2)]
    for thread in threads:thread.start()
    for thread in threads:thread.join()
    guard.check('e01:two_connections_one_current_lease',sorted(results),[['epoch',1],['rejected','LEASE_BUSY_OR_MISSING']])
    print(json.dumps({'phase':phase,'records':guard.records},ensure_ascii=False))
else:
    raise ValueError('UNKNOWN_QA_PHASE')
