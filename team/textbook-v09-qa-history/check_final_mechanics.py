"""Independent public Markdown integrity check. Never imports textbook code or author assembler."""
from pathlib import Path
from collections import Counter
from datetime import datetime, timezone
import json, hashlib, re, html, urllib.parse

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parent / 'stage03-mechanics'
OUT.mkdir(exist_ok=True)
sha = lambda b: hashlib.sha256(b).hexdigest()
def load(p): return json.loads(p.read_text())
def prose_lines(text):
    marker = None
    for n, line in enumerate(text.splitlines(True), 1):
        m = re.match(r'^ {0,3}(`{3,}|~{3,})([^\r\n]*)', line)
        if marker:
            yield n, line, False
            if m and m[1][0] == marker[0] and len(m[1]) >= len(marker) and not m[2].strip(): marker = None
        elif m:
            marker = m[1]
            yield n, line, False
        else: yield n, line, True
    assert marker is None, 'unclosed code fence'
def fences(text):
    result = []; full = []; start = None
    for n, line, outside in prose_lines(text):
        if not outside:
            if not full: start = n
            full.append(line)
        elif full:
            result.append({'startLine': start, 'fullSha256': sha(''.join(full).encode()), 'codeSha256': sha(''.join(full[1:-1]).encode())})
            full = []
    if full: result.append({'startLine': start, 'fullSha256': sha(''.join(full).encode()), 'codeSha256': sha(''.join(full[1:-1]).encode())})
    return result
def anchor(text):
    text = html.unescape(re.sub(r'\[([^\]]+)\]\([^)]*\)', r'\1', text))
    text = re.sub(r'<[^>]+>', '', text).strip().lower()
    text = re.sub(r'[^\w\- ]', '', text)
    return text.replace(' ', '-')
def headings(p):
    counts = Counter(); result = []
    for n, line, outside in prose_lines(p.read_text()):
        m = re.match(r'^#{1,6}\s+(.+?)\s*#*\s*$', line) if outside else None
        if m:
            name = anchor(m[1]); generated = name if not counts[name] else name + '-' + str(counts[name])
            counts[name] += 1
            result.append({'line': n, 'heading': m[1], 'anchor': generated})
    return result
def links(p):
    for n, line, outside in prose_lines(p.read_text()):
        if not outside: continue
        for m in re.finditer(r'\[([^\]]*)\]\(([^)\r\n]+)\)', line):
            yield n, m[1], m[2].strip().strip('<>')
def absolute_dest(raw, source):
    if re.match(r'^[A-Za-z][A-Za-z0-9+.-]*:', raw): return raw
    base, sep, fragment = raw.partition('#')
    dest = (source.parent / base).resolve() if base else source.resolve()
    return str(dest) + ('#' + fragment if sep else '')
def allowed_transform(text, source):
    output = []
    for _, line, outside in prose_lines(text):
        if outside:
            m = re.match(r'^(#{1,6})(\s+.*)$', line)
            if m: line = '#' * min(len(m[1])+1, 6) + m[2] + ('\n' if line.endswith('\n') and not m[2].endswith('\n') else '')
            line = re.sub(r'\]\(([^)\r\n]+)\)', lambda m: '](' + absolute_dest(m[1].strip().strip('<>'), source) + ')', line)
        output.append(line)
    return ''.join(output)

manifest_path = ROOT/'team/textbook-v09-manifest.json'
manifest = load(manifest_path)
units = sorted(manifest['units'], key=lambda r:r['order'])
assembly_path = ROOT/'team/textbook-v09-author-assembly-manifest.json'
assembly = load(assembly_path)
book_path = ROOT/'textbooks/v09/agent-engineering-textbook.md'
book = book_path.read_text()
front, *chunks = book.split('\n---\n\n本章原文 ')
assert len(chunks) == len(units) == 20
assert front.startswith('# Agent 工程教材\n')
book_records = []; source_records = []
for u, chunk in zip(units, chunks):
    p = ROOT/u['path']; text = p.read_text(); raw = p.read_bytes()
    wrapper, body = chunk.split('\n\n', 1)
    expected_wrapper = '['+u['title']+']('+str(p.resolve())+')'
    expected = allowed_transform(text, p)
    record = {'unitId':u['unitId'], 'path':str(p), 'sha256':sha(raw), 'bytes':len(raw), 'headings':headings(p), 'fences':fences(text)}
    source_records.append(record)
    claimed = next(a for a in assembly['units'] if a['unitId']==u['unitId'])
    book_records.append({'unitId':u['unitId'], 'wrapperMatches':wrapper==expected_wrapper, 'wholeBodyMatchesOnlyPermittedTransformation':body==expected,
                         'allFencesUnchanged':fences(body)==[{**b,'startLine':b['startLine']} for b in fences(text)],
                         'authorSourceShaMatches':claimed['sha256']==sha(raw), 'transformedBodySha256':sha(expected.encode()),
                         'authorTransformedShaMatches':claimed['transformedBodySha256']==sha(expected.encode())})
old = []; old_sources=[]
for s in manifest['sourceFiles']:
    p=ROOT/s['path']; raw=p.read_bytes()
    old_sources.append({'path':str(p),'sha256':sha(raw),'manifestShaMatches':sha(raw)==s['sha256']})
    for b in fences(raw.decode()): old.append({'source':str(p),'sourceSha256':sha(raw), **b})
new_blocks=[{'unitId':r['unitId'], **b} for r in source_records for b in r['fences']]
old_count=Counter(b['fullSha256'] for b in old)
new_count=Counter(b['fullSha256'] for b in new_blocks)
book_count=Counter(b['fullSha256'] for b in fences(book))
paths=[ROOT/u['path'] for u in units] + [book_path,ROOT/'textbooks/v09/README.md',ROOT/'team/textbook-v09-spec.md',ROOT/'team/textbook-v09-curriculum.md',ROOT/'team/textbook-v09-author.md',ROOT/'team/textbook-v09-content-review.md',ROOT/'team/textbook-v09-qa.md']
cache={}; local=[]; external=[]
for p in paths:
    for n,label,raw in links(p):
        if re.match(r'^[A-Za-z][A-Za-z0-9+.-]*:', raw):
            external.append({'source':str(p),'line':n,'label':label,'url':raw,'status':'not_fetched_by_QA'})
            continue
        resolved=absolute_dest(raw,p); base,sep,frag=resolved.partition('#')
        # Desktop file links may carry a verified one-based source line after the filename.
        line_match=re.search(r':(\d+)$',base)
        target_line=int(line_match[1]) if line_match else None
        if line_match:base=base[:line_match.start()]
        target=Path(urllib.parse.unquote(base)); exists=target.is_file()
        anchors=None
        if exists and sep and target.suffix=='.md':
            if target not in cache:cache[target]={h['anchor'] for h in headings(target)}
            anchors=urllib.parse.unquote(frag) in cache[target]
        line_valid=None
        if exists and target_line is not None:
            line_valid=1<=target_line<=len(target.read_text().splitlines())
        local.append({'source':str(p),'line':n,'label':label,'raw':raw,'resolved':resolved,'fileExists':exists,'sourceLineExists':line_valid,'anchorExists':anchors,'ok':exists and anchors is not False and line_valid is not False})
result={'recordedAt':datetime.now(timezone.utc).isoformat(),'method':'Independent parser compares each actual assembly body character to current source allowing only ATX+1 and local link destination conversion outside complete fences; no author script/example execution.',
        'manifestSha256':sha(manifest_path.read_bytes()),'assemblyManifestSha256':sha(assembly_path.read_bytes()),'bookSha256':sha(book_path.read_bytes()),'bookBytes':len(book_path.read_bytes()),'units':source_records,'assemblyBodies':book_records,
        'oldSourceBindings':old_sources,'oldCompleteFences':len(old),'currentCompleteFences':len(new_blocks),'bookCompleteFences':sum(book_count.values()),'oldMissingOccurrences':list((old_count-new_count).elements()),'bookFenceMultisetMatches':new_count==book_count,
        'newFences':[b for b in new_blocks if b['fullSha256'] not in old_count],'oldFenceOrigins':old,'localLinks':local,'localLinkCount':len(local),'localLinkProblems':[x for x in local if not x['ok']],'externalLinks':external,'externalLinkCount':len(external),'frontMatterReadByQA':front,'notRenderedBrowserOrRemoteContractVerification':True}
(OUT/'integrity-and-links.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'bookSha256':result['bookSha256'],'units':len(source_records),'allBodiesMatch':all(b['wrapperMatches'] and b['wholeBodyMatchesOnlyPermittedTransformation'] and b['authorSourceShaMatches'] and b['authorTransformedShaMatches'] for b in book_records),'fences':[len(old),len(new_blocks),sum(book_count.values())],'missingOldFences':result['oldMissingOccurrences'],'localLinks':len(local),'problems':result['localLinkProblems']},ensure_ascii=False))
