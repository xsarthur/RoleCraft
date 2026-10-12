from pathlib import Path
import hashlib, json, re, datetime

root = Path(__file__).resolve().parents[2]
corpus_path = root / 'server/retrieval/content-v10-index.json'
corpus = json.loads(corpus_path.read_text())
spec = json.loads((root / 'team/textbook-v10-opening-spec.json').read_text())
errors = []
def check(value, name):
    if not value: errors.append(name)
check(corpus['corpusVersion'] == 'textbook-v10', 'corpusVersion')
check(len(corpus['units']) == 20, 'twenty units')
check([u['unitId'] for u in corpus['units']] == [u['unitId'] for u in spec['chapterMap']], 'formal order')
rows = []
for u, expected in zip(corpus['units'], spec['chapterMap']):
    p = root / u['sourcePath']
    body = p.read_text()
    check(body == u['bodyMarkdown'], u['unitId'] + ': full Markdown exact')
    check(hashlib.sha256(p.read_bytes()).hexdigest() == u['sourceSha256'], u['unitId'] + ': source hash')
    check(u['title'] == expected['v10ActualHeading'], u['unitId'] + ': actual H1')
    check(u['prerequisiteUnitIds'] == expected['retainedPrerequisiteUnitIds'], u['unitId'] + ': prerequisites')
    ids = set()
    for s in u['sections']:
        check(s['sectionId'] not in ids, u['unitId'] + ': unique section ID')
        ids.add(s['sectionId'])
        check(s['bodyMarkdown'] in body, u['unitId'] + '/' + s['sectionId'] + ': exact section body')
        check(s['href'] == f"#learn/agent/{u['unitId']}/{s['sectionId']}", u['unitId'] + ': route contract')
        check(re.match(r'^s-[a-f0-9]{12}$', s['sectionId']), u['unitId'] + ': safe section ID')
    rows.append({'unitId': u['unitId'], 'sourceSha256': u['sourceSha256'], 'sections': len(ids), 'markdownBytes': len(body.encode()), 'codeFences': len(re.findall(r'^```', body, re.M)) // 2})
for a in corpus['assets']:
    p = root / a['sourcePath']
    check(hashlib.sha256(p.read_bytes()).hexdigest() == a['sha256'], a['name'] + ': frozen asset hash')
    check(a['href'] == '/api/content/assets/' + a['name'], a['name'] + ': public allowlist URL')
check(hashlib.sha256((root / 'textbooks/v10/agent-engineering-textbook.md').read_bytes()).hexdigest() == corpus['bookSha256'], 'book hash')
result = {'checkedAtUtc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'kind': 'independent static current corpus check; not browser/rendered/runtime/source-code execution', 'indexSha256': hashlib.sha256(corpus_path.read_bytes()).hexdigest(), 'corpusHash': corpus['corpusHash'], 'unitRows': rows, 'assetCount': len(corpus['assets']), 'errors': errors, 'status': 'pass_static_corpus' if not errors else 'fail'}
dest = root / 'team/app-v11-qa-history/corpus-preflight.json'
dest.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'status': result['status'], 'units': len(rows), 'sections': sum(r['sections'] for r in rows), 'teachingCodeFencesPreservedNotExecuted': sum(r['codeFences'] for r in rows), 'errors': errors}, ensure_ascii=False))
