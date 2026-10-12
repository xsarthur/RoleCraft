import importlib.util
import json
import pathlib
import sys
from dataclasses import replace
from decimal import Decimal

spec=importlib.util.spec_from_file_location('guard',pathlib.Path.cwd()/'runner.py')
guard=importlib.util.module_from_spec(spec);sys.modules['guard']=guard;spec.loader.exec_module(guard)
m=guard.load('e05')
guard.check('e05:default_outputs',guard.main_body(m),['4 2','1000 7000 10000','None 5 3'])
normal=m.data[0]
unknown=m.summarize(m.data)
guard.check('e05:failures_and_timeouts_kept_in_denominator',[unknown['assigned'],unknown['physical_attempts'],unknown['confirmed_cost']],[4,6,Decimal('10')])
guard.check('e05:pending_reservation_not_upper_bound',[unknown['cost_per_accepted'],unknown['pending_reserved']],[None,Decimal('3')])
no_accept=m.summarize([replace(normal,status='FAILED')])
guard.check('e05:zero_accepted_cost_undefined',[no_accept['cost_per_accepted'],no_accept['accepted_p95_ms']],[None,None])
in_flight=m.summarize([normal,replace(normal,task_id='in-flight',status='IN_FLIGHT',elapsed_ms=12000)])
guard.check('e05:inflight_denominator_not_frozen',[in_flight['cost_per_accepted'],in_flight['confirmed_cost_per_accepted_lower_bound'],in_flight['in_flight_ages_ms']],[None,None,[12000]])
for name,tasks,code in [
    ('duplicate',[normal,normal],'DUPLICATE_LOGICAL_TASK'),
    ('negative_cost',[replace(normal,known_cost=Decimal('-1'))],'COST_INVALID'),
    ('nan_cost',[replace(normal,known_cost=Decimal('NaN'))],'COST_INVALID'),
    ('boolean_latency',[replace(normal,elapsed_ms=True)],'LATENCY_INVALID'),
    ('negative_attempt',[replace(normal,physical_attempts=-1)],'ATTEMPT_COUNT_INVALID'),
    ('confirmed_pending',[replace(normal,pending_reserved=Decimal('1'))],'CONFIRMED_WITH_PENDING_RESERVATION')]:
    try:m.summarize(tasks);observed='NOT_REJECTED'
    except ValueError as error:observed=str(error)
    guard.check('e05:'+name,observed,code)
guard.check('e05:empty_summary_not_false_cost_zero',[m.summarize([])['cost_per_accepted'],m.summarize([])['cost_per_assigned']],[None,None])
print(json.dumps({'status':'passed_within_offline_accounting_scope','records':guard.records},ensure_ascii=False,indent=2,default=str))
