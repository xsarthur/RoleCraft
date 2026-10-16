import pathlib,json,hashlib,collections,datetime
root=pathlib.Path(__file__).resolve().parents[4];team=root/'sites/rolecraft/team';problems=[];rows=[]
fields='id set question sourceRefs sourceType publishedDate accessDate dedupGroup roleLevel capabilities baselineVersion baselineEvidence baselineSupport missingSubquestions finalVersion finalEvidence finalSupport methodSupport personalEvidenceStatus owner rationale reviewer dispute retest'.split()
for name in ['textbook-v12-content-a.json','textbook-v12-content-b.json']:
 p=team/name
 if not p.exists():problems.append(['pending_report',name]);continue
 d=json.loads(p.read_text());rows.extend(d['items'])
fixed=json.loads((team/'textbook-v12-qa-private/fixed100.json').read_text())['items'];market=json.loads((team/'textbook-v12-market.json').read_text())['questions'];questions={x['id']:x['question'] for x in fixed+market}
for r in rows:
 if set(fields)-set(r):problems.append(['missing_fields',r['id'],sorted(set(fields)-set(r))])
 if r['question']!=questions[r['id']]:problems.append(['question_changed',r['id']])
 for group in ['baselineEvidence','finalEvidence']:
  for e in r[group]:
   p=root/e['file'];txt=p.read_text();h=hashlib.sha256(p.read_bytes()).hexdigest()
   if e.get('sha256')!=h:problems.append(['hash',r['id'],group,e['file']])
   if e.get('quote','') not in txt:problems.append(['quote',r['id'],group,e['file']])
   line=e.get('line',e.get('start_line',e.get('startLine')))
   if line and e.get('quote','') not in '\n'.join(txt.splitlines()[line-1:line+10]):problems.append(['line',r['id'],group,e['file'],line])
counts={}
for group in ['fixed100','market14']:
 subset=[r for r in rows if r['set']==group];counts[group]={'n':len(subset),'baseline':dict(collections.Counter(r['baselineSupport'] for r in subset)),'final':dict(collections.Counter(r['finalSupport'] for r in subset))}
result={'at':datetime.datetime.now().astimezone().isoformat(),'rows':len(rows),'unique_ids':len(set(r['id'] for r in rows)),'missing_ids':sorted(set(range(1,115))-set(r['id'] for r in rows)),'counts':counts,'problems':problems}
(team/'textbook-v12-qa-history/matrix-first.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(json.dumps(result,ensure_ascii=False,indent=2))
