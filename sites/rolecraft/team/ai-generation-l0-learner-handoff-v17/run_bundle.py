import json,hashlib,pathlib
R=pathlib.Path(__file__).parent
def w(n,o):
 p=R/n;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(o,indent=2)+'\n');return p
def meta(p):
 b=p.read_bytes();return {'path':str(p.relative_to(R)),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
first={'document_id':'doc-A-shipping-v3','source_version':'shipping-v3','text':'shipping first failure','status':'recovery_required'};w('d0-05/first_failure.json',first)
hold={'document_id':'doc-A-shipping-v3','source_version':'shipping-v3','text':'shipping holdout independent','outage_duration':7,'status':'recovery_required'};w('d0-05/holdout.json',hold);w('d0-05/matrix.json',{'holdout_path':'d0-05/holdout.json','holdout':hold,'first_failure_path':'d0-05/first_failure.json'})
for i in range(1,6): w(f'evidence_cards/d0-0{i}.json',{'evidence_id':f'EVID-D0-0{i}-V17','version':'v17','artifacts':['d0-05/matrix.json','d0-05/holdout.json'] if i==5 else ['d0-05/first_failure.json']})
arts={}
for p in R.rglob('*.json'):
 if p.name!='manifest.json':arts[str(p.relative_to(R))]=meta(p)
w('manifest.json',{'version':'v17','artifacts':arts,'self_reference_rule':'manifest self bytes/SHA null','manifest_bytes':None,'manifest_sha256':None,'qa_status':'pending','human_receipt':'pending','l0_status':'not_assessed','d0_status':'not_assessed','l1_decision':'not_granted','l2_decision':'not_granted'})
# delivery assertions
h=json.loads((R/'d0-05/holdout.json').read_text());f=json.loads((R/'d0-05/first_failure.json').read_text());m=json.loads((R/'d0-05/matrix.json').read_text());assert h['document_id']=='doc-A-shipping-v3' and h['source_version']=='shipping-v3' and 'outage_duration' in h;assert f['document_id']=='doc-A-shipping-v3' and f['text']!=h['text'];assert m['holdout_path']=='d0-05/holdout.json';assert all('V17' in json.loads(x.read_text())['evidence_id'] for x in (R/'evidence_cards').glob('*.json'))
