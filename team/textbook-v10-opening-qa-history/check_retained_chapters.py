"""Public static migration check; never imports or executes textbook/application code."""
from pathlib import Path
from datetime import datetime, timezone
import json,hashlib,re,difflib
ROOT=Path(__file__).resolve().parents[2]
H=Path(__file__).resolve().parent
OUT=H/'stage01-migration'
OUT.mkdir(exist_ok=True)
sha=lambda b:hashlib.sha256(b).hexdigest()
def fences(text):
    rows=[];pending=[];marker=None;start=None
    for n,line in enumerate(text.splitlines(True),1):
        f=re.match(r'^ {0,3}(`{3,}|~{3,})([^\r\n]*)',line)
        if marker is None and f:marker=f[1];pending=[line];start=n
        elif marker:
            pending.append(line)
            if f and f[1][0]==marker[0] and len(f[1])>=len(marker) and not f[2].strip():
                rows.append({'index':len(rows)+1,'startLine':start,'fullFenceSha256':sha(''.join(pending).encode()),'bodySha256':sha(''.join(pending[1:-1]).encode())})
                marker=None;pending=[]
    assert marker is None
    return rows
s=ROOT/'team/textbook-v10-opening-spec.json';spec=json.loads(s.read_text())
baseline=json.loads((H/'baseline.json').read_text());received={r['path']:r['sha256'] for r in baseline['files']}
oldm=json.loads((ROOT/'team/textbook-v09-manifest.json').read_text());oldunits={u['unitId']:u for u in oldm['units']}
rows=[];deltas=[]
for u in spec['chapterMap'][1:]:
    old=ROOT/u['v09SourcePath'];new=ROOT/u['v10TargetPath'];before=old.read_text();after=new.read_text()
    assert sha(old.read_bytes())==received[str(old)]==u['v09SourceSha256']
    expected=before.replace('[本轮记录](../../team/textbook-v09-qa.md)','[原版验证记录](../../team/textbook-v09-qa.md)')
    diffs=''.join(difflib.unified_diff(before.splitlines(True),after.splitlines(True),fromfile=str(old),tofile=str(new),n=1))
    deltas.append(diffs)
    rows.append({'unitId':u['unitId'],'order':u['order'],'source':str(old),'sourceSha256':sha(old.read_bytes()),'current':str(new),'currentSha256':sha(new.read_bytes()),'entireBodyMatchesOnlyPermittedHistoricalLinkLabelChange':after==expected,'unchangedWholeFile':before==after,'actualFirstHeading':after.splitlines()[0].lstrip('# ').strip(),'titleMatchesSpec':after.splitlines()[0].lstrip('# ').strip()==u['v10ActualHeading'],'formalPrerequisitesUnchanged':u['retainedPrerequisiteUnitIds']==oldunits[u['unitId']]['prerequisiteUnitIds'],'oldFences':fences(before),'newFences':fences(after),'allCompleteFenceBytesUnchanged':fences(before)==fences(after),'behaviorExecutedInThisRound':False})
assert len(rows)==19
result={'recordedAt':datetime.now(timezone.utc).isoformat(),'specSha256':sha(s.read_bytes()),'baselineSha256':sha((H/'baseline.json').read_bytes()),'method':'Independent exact text comparison after only the specified historical QA link label clarification; relative chapter destinations naturally resolve in v10. Complete code fences compare entire opening/body/closing/newline bytes. No existing behavior or review result inherited.','rows':rows,'retainedUnits':19,'completeFenceCount':sum(len(r['newFences']) for r in rows),'allBodiesWithinAllowedChange':all(r['entireBodyMatchesOnlyPermittedHistoricalLinkLabelChange'] for r in rows),'allFormalPrerequisitesAndTitlesPreserved':all(r['formalPrerequisitesUnchanged'] and r['titleMatchesSpec'] for r in rows),'allCompleteFencesPreserved':all(r['allCompleteFenceBytesUnchanged'] for r in rows),'codeChanged':False,'oldBehaviorRerun':False,'original24And48Policy':'Original professional bodies/mechanisms/practices retained by byte comparison and original mapping remains unchanged; this is preservation evidence, not a new full technical quality or learner-achievement review.'}
(OUT/'retained-chapters.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
(OUT/'retained-navigation.diff').write_text(''.join(deltas))
print(json.dumps({k:result[k] for k in ['retainedUnits','completeFenceCount','allBodiesWithinAllowedChange','allFormalPrerequisitesAndTitlesPreserved','allCompleteFencesPreserved','oldBehaviorRerun']},ensure_ascii=False))
