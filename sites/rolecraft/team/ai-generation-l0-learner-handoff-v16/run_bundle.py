import json,hashlib,pathlib,subprocess
R=pathlib.Path(__file__).parent
def w(n,o):
 p=R/n;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(o,indent=2)+'\n');return p
def m(p):
 b=p.read_bytes();return {'path':str(p.relative_to(R)),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
hold={'document_id':'doc-A-returns-v9','source_version':'v9','text':'returns policy','tenant':'A','schema_version':'v1'}
w('d0-05/holdout-input.json',hold);w('d0-05/holdout-output.json',hold|{'status':'recovery_required'})
roles={1:['A-receipt.json'],2:['d0-04/checkpoint-before.json','d0-04/event-trace.json'],3:['A-receipt.json','d0-04/tool_output.json','d0-05/holdout-output.json'],4:['d0-04/tool_input.json','d0-04/tool_output.json','d0-04/event-trace.json','d0-04/recovery.json'],5:['d0-05/matrix.json','d0-05/holdout-input.json','d0-05/holdout-output.json','d0-04/checkpoint-after.json']}
arts={}
for p in R.rglob('*'):
 if p.is_file() and p.name not in ('manifest.json','run_bundle.py'): arts[str(p.relative_to(R))]=m(p)
for i,refs in roles.items():
 p=w(f'evidence_cards/d0-0{i}.json',{'evidence_id':f'EVID-D0-0{i}-V15','purpose':'learner evidence','artifacts':[arts[x] for x in refs]});arts[str(p.relative_to(R))]=m(p)
mani={'version':'v15','diagnostic_id':'D0-AI-20261015-001','artifacts':arts,'manifest_bytes':None,'manifest_sha256':None,'self_reference_rule':'null by construction','command':'python3 run_bundle.py','qa_status':'pending','human_receipt':'pending','self_signed':False,'external_action':None,'l0_status':'not_assessed','d0_status':'not_assessed','l1_decision':'not_granted','l2_decision':'not_granted'};w('manifest.json',mani)
