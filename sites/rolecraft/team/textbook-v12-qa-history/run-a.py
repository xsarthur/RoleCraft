import pathlib,subprocess,tempfile,sys,json,hashlib,datetime,platform,importlib.metadata as m,os
root=pathlib.Path.cwd();base=root/'sites/rolecraft/textbooks/v12/examples'; rows=[]
for name in ['n01-runtime-boundaries.py','n02-memory-routing.py','n03-plan-execution.py','n04-tool-catalog.py','n05-index-lifecycle.py']:
 p=base/name
 with tempfile.TemporaryDirectory(prefix='v12qa-') as work:
  r=subprocess.run([sys.executable,'-B',str(p)],cwd=work,capture_output=True,text=True,timeout=30,env={**os.environ,'LANGSMITH_TRACING':'false','LANGCHAIN_TRACING_V2':'false'})
 rows.append({'command':[sys.executable,'-B',str(p)],'cwd':'isolated temporary directory','sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'exit':r.returncode,'stdout':r.stdout,'stderr':r.stderr})
d={'at':datetime.datetime.now().astimezone().isoformat(),'python':sys.version,'platform':platform.platform(),'frameworks':{n:m.version(n) for n in ['langgraph','langgraph-checkpoint','langchain-core']},'safety':'先读全源码；固定有限夹具，无模型/网络/数据库/危险代码执行；临时工作目录；真实框架只内存checkpointer','runs':rows}
(root/'sites/rolecraft/team/textbook-v12-qa-history/a-r2-execution-first.json').write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
print([(pathlib.Path(x['command'][-1]).name,x['exit']) for x in rows])
