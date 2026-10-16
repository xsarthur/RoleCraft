import json,hashlib,subprocess,platform,pathlib
R=pathlib.Path(__file__).parent
def write(rel,obj):
 p=R/rel;p.parent.mkdir(parents=True,exist_ok=True); b=obj if isinstance(obj,bytes) else (json.dumps(obj,indent=2)+'\n').encode();p.write_bytes(b);return p
def meta(p):
 b=p.read_bytes();return {'path':str(p.relative_to(R)),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
stdout=subprocess.check_output(['python3','-c','print("DEMO-42 draft A")']); write('A-stdout.txt',stdout)
write('A-receipt.json',{'command':'python3 -c print("DEMO-42 draft A")','stdout':meta(R/'A-stdout.txt'),'status':'draft_ready','source_refs':['doc-A-shipping-v3']})
base={'document_id':'doc-A-shipping-v3','source_version':'v3','text':'shipping policy','tenant':'A','schema_version':'v1'}
write('d0-04/tool_input.json',base|{'idempotency_key':'U-AI-L0-001'}); write('d0-04/tool_output.json',{'status':'draft_ready','source_refs':['doc-A-shipping-v3'],'side_effect':None})
write('d0-04/checkpoint-before.json',{'status':'tool_returned'});write('d0-04/checkpoint-after.json',{'status':'draft_ready'});write('d0-04/failure.json',{'status':'recovery_required','error':'checkpoint_write_failed'});write('d0-04/recovery.json',{'status':'draft_ready','idempotency_key':'U-AI-L0-001','side_effect':None})
write('d0-04/event-trace.json',{'events':['tool_called','tool_returned','checkpoint_write_failed','recovery_required','replayed','final']})
for s,st in [('baseline','tool_returned'),('first_failure','recovery_required'),('regression','draft_ready'),('holdout','recovery_required')]: write(f'd0-05/{s}.json',base|{'status':st})
write('d0-05/matrix.json',{s:{'path':f'd0-05/{s}.json','status':st,'schema_version':'v1','source_refs':['doc-A-shipping-v3'],'tenant':'A','source_version':'v3'} for s,st in [('baseline','tool_returned'),('first_failure','recovery_required'),('regression','draft_ready'),('holdout','recovery_required')]})
arts={}
for p in R.rglob('*'):
 if p.is_file() and p.name not in ('manifest.json','run_bundle.py'): arts[str(p.relative_to(R))]=meta(p)
cards={}
for i in range(1,6):
 p=write(f'evidence_cards/d0-0{i}.json',{'evidence_id':f'EVID-D0-0{i}-V14','diagnostic_id':'D0-AI-20261015-001','artifacts':list(arts)})
 cards[str(p.relative_to(R))]=meta(p)
manifest={'version':'v14','diagnostic_id':'D0-AI-20261015-001','artifacts':arts|cards,'manifest_bytes':None,'manifest_sha256':None,'self_reference_rule':'null by construction','command':'python3 run_bundle.py','environment':platform.platform(),'original_failure':'checkpoint_write_failed','qa_status':'pending','human_receipt':'pending','self_signed':False,'external_action':None,'l0_status':'not_assessed','d0_status':'not_assessed','l1_decision':'not_granted','l2_decision':'not_granted'}
write('manifest.json',manifest)
