from pathlib import Path
import hashlib,json,datetime
r=Path('sites/rolecraft'); e=r/'team/uiux-v02-qa-evidence'; b=r/'textbooks/uiux-design-v02'
paths=[p for p in b.rglob('*') if p.is_file() and 'history' not in p.parts]
paths += [r/'team/uiux-v02-product.md',r/'team/UIUX_TEXTBOOK_WRITING_STANDARD.md',r/'team/uiux-v02-curriculum.json']
protected=list((r/'textbooks/uiux-design-v01').rglob('*.md'))+[r/'textbooks/uiux-design-v01/assets/uiux-state-map-v01.svg',r/'textbooks/v12/agent-engineering-textbook.md',r/'dist/app.js',r/'dist/index.html',r/'server/index.mjs',r/'dist/learning-workbench.js']
def record(p):return {'path':str(p),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
d={'at':datetime.datetime.now().astimezone().isoformat(),'sources':[record(p) for p in sorted(paths)],'protected_sample':[record(p) for p in sorted(protected)],'scope_note':'named sample only; excludes administrative AGENTS/PM files; not whole repository protection'}
(e/'received-baseline.json').write_text(json.dumps(d,ensure_ascii=False,indent=2))
print('source count',len(paths),'protected sample',len(protected))
