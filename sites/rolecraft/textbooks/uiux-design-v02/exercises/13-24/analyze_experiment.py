"""Python 3 standard-library teaching calculation; synthetic data only.
Usage: python3 analyze_experiment.py [synthetic-experiment.csv]
Reads local CSV and prints JSON. No network, models, payments or user data.
"""
import csv, json, math, statistics, sys
from pathlib import Path

def wilson(k,n,z=1.96):
    p=k/n; d=1+z*z/n
    center=(p+z*z/(2*n))/d
    half=z*math.sqrt(p*(1-p)/n+z*z/(4*n*n))/d
    return [round(center-half,4),round(center+half,4)]

def analyze(path):
    rows=list(csv.DictReader(path.open(newline='',encoding='utf-8')))
    if len(rows)!=32 or any(r['synthetic']!='1' for r in rows):
        raise ValueError('Expected 32 explicitly synthetic rows')
    if len({r['row_id'] for r in rows})!=len(rows):
        raise ValueError('Duplicate row identity')
    result={}
    for arm in ['00','10','01','11']:
        group=[r for r in rows if r['arm']==arm]
        n=sum(int(r['assigned']) for r in group)
        if n!=8: raise ValueError('Each arm must retain 8 assigned tasks')
        k=sum(int(r['safe_resolved_24h']) for r in group)
        unsafe=sum(int(r['unsafe_refund']) for r in group)
        if any(r['unsafe_refund']=='1' and r['safe_resolved_24h']=='1' for r in group):
            raise ValueError('Unsafe cannot count as safe resolution')
        observed=[int(r['active_seconds']) for r in group if r['active_seconds']!='']
        accepted=[int(r['active_seconds']) for r in group if r['draft_accepted']=='1' and r['active_seconds']!='']
        missing=n-len(observed)
        review=sum(int(r['review_seconds']) for r in group)
        result[arm]={
          'assigned_tasks':n,'safe_resolved':k,'safe_rate':k/n,
          'wilson_reference_only':wilson(k,n),
          'unsafe_count':unsafe,'unsafe_rate':unsafe/n,
          'observed_time_n':len(observed),'observed_active_mean':round(statistics.mean(observed),3),
          'missing_time_n':missing,
          'active_mean_sensitivity_300_1800':[round((sum(observed)+missing*v)/n,3) for v in [300,1800]],
          'review_mean':review/n,
          'combined_active_review_sensitivity_300_1800':[round((sum(observed)+review+missing*v)/n,3) for v in [300,1800]],
          'accepted_only_n':len(accepted),
          'accepted_only_mean':round(statistics.mean(accepted),3) if accepted else None,
          'ai_calls':sum(int(r['ai_calls']) for r in group)}
    r=result
    # A=scope UI; B=AI draft. Equal-sized cells only. Descriptive, not causal.
    result['contrasts']={
      'scope_safe_rate':((r['10']['safe_rate']-r['00']['safe_rate'])+(r['11']['safe_rate']-r['01']['safe_rate']))/2,
      'ai_safe_rate':((r['01']['safe_rate']-r['00']['safe_rate'])+(r['11']['safe_rate']-r['10']['safe_rate']))/2,
      'interaction_safe_rate':r['11']['safe_rate']-r['10']['safe_rate']-r['01']['safe_rate']+r['00']['safe_rate']}
    result['limitations']=['Synthetic allocation and outcomes, no causal or effectiveness claim',
      '32 repeated tasks from 8 constructed participants, not 32 independent people',
      'Wilson interval displayed only to show small denominators; repeated clustering invalidates independent-trial inference',
      'Active time excludes unobserved waiting; missing values not zero',
      'Sensitivity imputations are scenarios, not recovered observations']
    return result
if __name__=='__main__':
    target=Path(sys.argv[1]) if len(sys.argv)>1 else Path(__file__).with_name('synthetic-experiment.csv')
    print(json.dumps(analyze(target),ensure_ascii=False,indent=2))
