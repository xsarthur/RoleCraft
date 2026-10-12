"""Read-only source-fragment accounting and current context binding; no examples imported."""
from pathlib import Path
from datetime import datetime, timezone
import re, json, hashlib, difflib, collections
ROOT=Path(__file__).resolve().parents[2]
OUT=Path(__file__).resolve().parent/'stage04-coverage'
OUT.mkdir(exist_ok=True)
sha=lambda b:hashlib.sha256(b).hexdigest()
m=json.loads((ROOT/'team/textbook-v09-manifest.json').read_text())
def canonical(s):
    s=re.sub(r'\[([^\]]+)\]\([^)]+\)',r'\1',s)
    return re.sub(r'[^\w]','',s)
def prose_paragraphs(p):
    output=[];pending=[];start=None;marker=None
    for n,line in enumerate(p.read_text().splitlines(),1):
        f=re.match(r'^(`{3,}|~{3,})(.*)$',line)
        if marker:
            if f and f[1][0]==marker[0] and len(f[1])>=len(marker) and not f[2].strip(): marker=None
            continue
        if f:
            if pending:output.append((start,n-1,'\n'.join(pending)));pending=[]
            marker=f[1];continue
        if not line.strip() or re.match(r'^#{1,6}\s',line):
            if pending:output.append((start,n-1,'\n'.join(pending)));pending=[]
        else:
            if not pending:start=n
            pending.append(line)
    if pending:output.append((start,n,'\n'.join(pending)))
    return output
records=[];unmatched=[]
for u in m['units']:
    dest=ROOT/u['path'];normalized=canonical(dest.read_text())
    for source in u['sources']:
        p=ROOT/source['path']
        ranges=source['lineRanges']
        for start,end,paragraph in prose_paragraphs(p):
            # Opening version/reading announcements are editorial replacements, not core mechanisms.
            if start<7:continue
            if not any(start>=r['start'] and end<=r['end'] for r in ranges):continue
            found=canonical(paragraph) in normalized
            row={'source':str(p),'sourceSha256':sha(p.read_bytes()),'oldStartLine':start,'oldEndLine':end,'destinationUnit':u['unitId'],'destination':str(dest),'destinationSha256':sha(dest.read_bytes()),'comparison':'same_prose_words_with_only_heading_punctuation_whitespace_and_link_destination_ignored' if found else 'manual_context_review_required','paragraphSha256':sha(paragraph.encode())}
            records.append(row)
            if not found:unmatched.append({**row,'oldParagraph':paragraph})
# Every source line is either explicitly routed or an opening/section separator/blank line.
coverage=[]
for source in m['sourceFiles']:
    p=ROOT/source['path'];lines=p.read_text().splitlines();mapped=collections.defaultdict(list)
    for u in m['units']:
        for s in u['sources']:
            if s['path']==source['path']:
                for r in s['lineRanges']:
                    for n in range(r['start'],r['end']+1):mapped[n].append(u['unitId'])
    unmapped=[{'line':n,'text':line} for n,line in enumerate(lines,1) if n not in mapped and line.strip()]
    coverage.append({'source':str(p),'sha256':sha(p.read_bytes()),'lineCount':len(lines),'unroutedNonblankLines':unmapped,'destinations':sorted({d for ds in mapped.values() for d in ds})})
result={'recordedAt':datetime.now(timezone.utc).isoformat(),'method':'Original individual authority paragraphs are read within specified split ranges, compared to actual new destination prose; comparison is an aid to QA semantic review, not proof of teaching depth. All complete fences are checked separately byte-for-byte. Entire source line accounting exposes any unrouted nonblank lines.', 'sourceLineCoverage':coverage,'paragraphComparisons':records,'manualReviewRequired':unmatched,'notRuntimeOrLearnerVerification':True}
(OUT/'migration-context.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'routedParagraphs':len(records),'manualReviewRequired':len(unmatched),'unroutedNonblankBySource':{Path(r['source']).name:r['unroutedNonblankLines'] for r in coverage if r['unroutedNonblankLines']}},ensure_ascii=False))
print(json.dumps(unmatched,ensure_ascii=False,indent=2))
