from pathlib import Path
import json,csv,subprocess,sys,copy
root=Path('sites/rolecraft/textbooks/uiux-design-v02/exercises/13-24'); ev=Path('sites/rolecraft/team/uiux-v02-qa-evidence'); tmp=ev/'tmp'
script=root/'analyze_experiment.py'; source=root/'synthetic-experiment.csv'
p=subprocess.run([sys.executable,str(script),str(source)],capture_output=True,text=True); result=json.loads(p.stdout); (ev/'csv-run-output.json').write_text(p.stdout)
expected={'00':(8,6,0,8,682.5,43.125,[725.625,725.625]),'10':(8,7,0,8,577.5,43.125,[620.625,620.625]),'01':(8,5,1,7,527.143,116.25,[615.0,802.5]),'11':(8,6,1,8,457.5,116.25,[573.75,573.75])}
keys=['assigned_tasks','safe_resolved','unsafe_count','observed_time_n','observed_active_mean','review_mean','combined_active_review_sensitivity_300_1800']
checks=[]
for a,vals in expected.items():
 for k,v in zip(keys,vals): checks.append({'arm':a,'metric':k,'expected':v,'actual':result[a][k],'pass':result[a][k]==v})
assert all(x['pass'] for x in checks)
assert result['contrasts']=={'scope_safe_rate':.125,'ai_safe_rate':-.125,'interaction_safe_rate':0.0}
assert result==json.loads((root/'calculation-output.json').read_text())
rows=list(csv.DictReader(source.open())); fields=list(rows[0]); tests=[]
cases=[('unsafe_also_safe',lambda r:r[20].update(safe_resolved_24h='1')),('duplicate_id',lambda r:r[1].update(row_id=r[0]['row_id'])),('real_data_rejected',lambda r:r[0].update(synthetic='0')),('dropped_assigned',lambda r:r[0].update(assigned='0'))]
for name,mutate in cases:
 rr=copy.deepcopy(rows);mutate(rr);path=tmp/(name+'.csv')
 with path.open('w') as f:w=csv.DictWriter(f,fields);w.writeheader();w.writerows(rr)
 p=subprocess.run([sys.executable,str(script),str(path)],capture_output=True,text=True)
 tests.append({'case':name,'exit':p.returncode,'error':p.stderr.strip().splitlines()[-1],'rejected':p.returncode!=0})
assert all(x['rejected'] for x in tests)
# Independent simple arithmetic from CSV identifies missing denominator and safety counts.
manual={}
for a in expected:
 g=[r for r in rows if r['arm']==a];obs=[int(r['active_seconds']) for r in g if r['active_seconds']];manual[a]={'rows':len(g),'assigned_sum':sum(int(r['assigned']) for r in g),'safe_count':sum(r['safe_resolved_24h']=='1' for r in g),'unsafe_count':sum(r['unsafe_refund']=='1' for r in g),'active_sum':sum(obs),'observed_n':len(obs),'missing_n':sum(not r['active_seconds'] for r in g),'review_sum':sum(int(r['review_seconds']) for r in g)}
out={'python':sys.version,'normal_exit':0,'expected_checks':checks,'manual_csv_counts':manual,'author_output_matches':True,'counterexamples':tests,'limits':'Synthetic fixed-format calculator, not generalized validator or real experiment/causal evidence'}
(ev/'csv-independent-check.json').write_text(json.dumps(out,ensure_ascii=False,indent=2));print(json.dumps(out,ensure_ascii=False,indent=2))
