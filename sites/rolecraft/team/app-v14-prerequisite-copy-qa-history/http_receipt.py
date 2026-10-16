from pathlib import Path
import json,urllib.request,hashlib,datetime,tempfile,sys
h=Path(__file__).resolve().parent;phase=sys.argv[1];rows=[]
for name in ['learning-workbench.js','learning-experience-v13.js','learning-experience-v13.css','content-v12-data.js','learning-v13-data.js','index.html']:
 with urllib.request.build_opener(urllib.request.ProxyHandler({})).open('http://127.0.0.1:4498/'+name)as response:b=response.read();status=response.status
 source=h/'received'/name if phase=='received' and name in ['learning-workbench.js','learning-experience-v13.js','learning-experience-v13.css'] else h.parents[1]/'dist'/name
 rows.append({'path':name,'status':status,'sha256':hashlib.sha256(b).hexdigest(),'matchesSource':b==source.read_bytes()})
d={'atUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'phase':phase,'port':4498,'node':'24.16.0','initialSandboxListen':'EPERM; own listener retry approved require_escalated','officialMainBrowser':'getState success apps-only,browsers=[]; no alternative surface','rows':rows,'taskTempDirsObserved':[str(p)for p in Path(tempfile.gettempdir()).glob('rolecraft-qa-prerequisite-*')]}
(h/(phase+'-http.json')).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'phase':phase,'allMatch':all(x['matchesSource']for x in rows),'rows':len(rows),'tempDbCount':len(d['taskTempDirsObserved'])}));raise SystemExit(not all(x['matchesSource']for x in rows))
