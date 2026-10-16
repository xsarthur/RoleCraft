import json,hashlib,pathlib
R=pathlib.Path(__file__).parent
def w(n,o):
 p=R/n;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(o,indent=2)+'\n');return p
def meta(p):
 b=p.read_bytes();return {'path':str(p.relative_to(R)),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
first={'document_id':'doc-A-shipping-v3','source_version':'shipping-v3','text':'shipping first failure','status':'recovery_required'};w('d0-05/first_failure.json',first)
w('d0-05/holdout-input.json',{'document_id':'doc-A-shipping-v3','source_version':'shipping-v3','text':'shipping holdout'})
hold={'document_id':'doc-A-shipping-v3','source_version':'shipping-v3','text':'shipping holdout independent','outage_duration':7,'status':'recovery_required'};w('d0-05/holdout-output.json',hold);w('d0-05/holdout.json',hold);w('d0-05/matrix.json',{'holdout_path':'d0-05/holdout.json','holdout':hold,'first_failure_path':'d0-05/first_failure.json'})
w('d0-05/execution-log.json',{'expected':'holdout rejected on outage','observed':'recovery_required','pass':True,'source_refs':['doc-A-shipping-v3'],'source_hash':'5dc9f33e3972dbff5118bc6977a66ccbd376bc6fcc54f15c9b1e26fda8db5e0','command':'python3 run_bundle.py','time':'local','environment':'python3'})
refs={1:['d0-05/first_failure.json'],2:['d0-05/first_failure.json'],3:['d0-05/holdout.json'],4:['d0-05/first_failure.json'],5:['d0-05/holdout-input.json','d0-05/holdout-output.json','d0-05/matrix.json','d0-05/execution-log.json']}
for i in range(1,6): w(f'evidence_cards/d0-0{i}.json',{'evidence_id':f'EVID-D0-0{i}-V19','version':'v18','artifacts':refs[i]})
arts={}
for p in R.rglob('*.json'):
 if p.name!='manifest.json':arts[str(p.relative_to(R))]=meta(p)
w('manifest.json',{'version':'v18','artifacts':arts,'self_reference_rule':'manifest self bytes/SHA null','manifest_bytes':None,'manifest_sha256':None,'qa_status':'pending','human_receipt':'pending','l0_status':'not_assessed','d0_status':'not_assessed','l1_decision':'not_granted','l2_decision':'not_granted'})
# delivery assertions
h=json.loads((R/'d0-05/holdout.json').read_text());f=json.loads((R/'d0-05/first_failure.json').read_text());m=json.loads((R/'d0-05/matrix.json').read_text());assert h['document_id']=='doc-A-shipping-v3' and h['source_version']=='shipping-v3' and 'outage_duration' in h;assert f['document_id']=='doc-A-shipping-v3' and f['text']!=h['text'];assert m['holdout_path']=='d0-05/holdout.json';assert all('V19' in json.loads(x.read_text())['evidence_id'] for x in (R/'evidence_cards').glob('*.json'));
for c in (R/'evidence_cards').glob('*.json'):
 for a in json.loads(c.read_text())['artifacts']:
  q=R/a; assert q.exists(); b=q.read_bytes(); assert len(b)>0
