"""Independent public-static checks. Never imports author builders or textbook code."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib, json, re, sys, unicodedata
import xml.etree.ElementTree as ET
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[2]
H = Path(__file__).resolve().parent
OUT = H / 'stage04-final-artifacts'
OUT.mkdir(exist_ok=True)
digest = lambda data: hashlib.sha256(data).hexdigest()

def fence_lines(text):
    inside = None
    for n, line in enumerate(text.splitlines(keepends=True), 1):
        m = re.match(r'^ {0,3}(`{3,}|~{3,})([^\r\n]*)', line)
        literal = inside is not None or bool(m)
        if inside is None and m:
            inside = m[1]
        elif inside and m and m[1][0] == inside[0] and len(m[1]) >= len(inside) and not m[2].strip():
            inside = None
        yield n, line, literal
    assert inside is None, 'Unclosed complete fence'

def complete_fences(text):
    result, block = [], []
    for _, line, literal in fence_lines(text):
        if literal:
            block.append(line)
        elif block:
            result.append(digest(''.join(block).encode()))
            block = []
    if block:
        result.append(digest(''.join(block).encode()))
    return result

def permitted_body(text, source):
    result = []
    for _, line, literal in fence_lines(text):
        if literal:
            result.append(line)
            continue
        heading = re.match(r'^(#{1,6})([ \t]+)', line)
        if heading:
            line = '#' * min(6, len(heading[1]) + 1) + line[len(heading[1]):]
        def destination(m):
            target = m[1].strip('<>')
            if re.match(r'^[A-Za-z][A-Za-z0-9+.-]*:', target) or target.startswith('/'):
                return m[0]
            base, marker, fragment = target.partition('#')
            address = str((source.parent / base).resolve()) if base else str(source)
            if marker:
                address += '#' + fragment
            if ' ' in address:
                address = '<' + address + '>'
            return '](' + address + ')'
        result.append(re.sub(r'\]\(([^)\r\n]+)\)', destination, line))
    return ''.join(result)

def anchors(path):
    used, result = {}, set()
    for _, line, literal in fence_lines(path.read_bytes().decode('utf-8')):
        m = None if literal else re.match(r'^#{1,6}\s+(.+?)\s*$', line)
        if m:
            name = re.sub(r'`([^`]*)`', r'\1', m[1]).lower()
            name = ''.join(c for c in name if c in '_- ' or not unicodedata.category(c).startswith(('P', 'S')))
            name = name.replace(' ', '-')
            count = used.get(name, 0)
            used[name] = count + 1
            result.add(name + ('-' + str(count) if count else ''))
    return result

def local_links(path):
    records = []
    for n, line, literal in fence_lines(path.read_bytes().decode('utf-8')):
        if literal:
            continue
        for m in re.finditer(r'!?\[[^\]\n]*\]\((<[^>\n]+>|[^)\n]+)\)', line):
            target = m[1].strip('<>')
            if re.match(r'^[A-Za-z][A-Za-z0-9+.-]*:', target):
                continue
            base, marker, fragment = target.partition('#')
            base = re.sub(r':\d+$', '', unquote(base))
            dest = (path.parent / base).resolve() if base else path
            exists = dest.is_file()
            anchor_ok = None
            if marker and exists and dest.suffix == '.md':
                anchor_ok = unquote(fragment) in anchors(dest)
            records.append({'source': str(path), 'line': n, 'target': target,
                            'resolvedPath': str(dest), 'fileExists': exists,
                            'markdownAnchorExists': anchor_ok})
    return records

started = datetime.now(timezone.utc).isoformat()
spec_path = ROOT / 'team/textbook-v10-opening-spec.json'
spec = json.loads(spec_path.read_bytes().decode('utf-8'))
manifest_path = ROOT / 'team/textbook-v10-opening-author-assembly-manifest.json'
manifest = json.loads(manifest_path.read_bytes().decode('utf-8'))
units = spec['chapterMap']
book_path = ROOT / 'textbooks/v10/agent-engineering-textbook.md'
actual_book = book_path.read_bytes().decode('utf-8')
expected_book = '# Agent 工程教材\n\n'
rows, inherited = [], []
for u in units:
    source = ROOT / u['v10TargetPath']
    raw = source.read_bytes().decode('utf-8')
    body = permitted_body(raw, source)
    chunk = body + '\n本章原文 [' + u['v10ActualHeading'] + '](' + str(source) + ')\n'
    if u['order'] > 1:
        chunk = '\n---\n\n' + chunk
    expected_book += chunk
    claim = next(x for x in manifest['units'] if x['unitId'] == u['unitId'])
    blocks = complete_fences(raw)
    origin = ROOT / u['v09SourcePath']
    old = origin.read_bytes().decode('utf-8')
    same = raw == old.replace('[本轮记录](../../team/textbook-v09-qa.md)', '[原版验证记录](../../team/textbook-v09-qa.md)') if u['order'] > 1 else None
    inherited += blocks
    rows.append({'unitId': u['unitId'], 'order': u['order'], 'path': str(source),
                 'sha256': digest(source.read_bytes()), 'bytes': len(source.read_bytes()),
                 'h1MatchesSpec': raw.splitlines()[0] == '# ' + u['v10ActualHeading'],
                 'receivedOriginSha256MatchesSpec': digest(origin.read_bytes()) == u['v09SourceSha256'],
                 'retainedBodyOnlyPermittedHistoricalLabelChange': same,
                 'fullFencesEqualReceived': blocks == complete_fences(old),
                 'fullFenceSha256InOrder': blocks,
                 'manifestCurrentSourceMatches': claim['sha256'] == digest(source.read_bytes()),
                 'manifestFullFencesMatch': blocks == [b['fullFenceSha256'] for b in claim['blocks']],
                 'manifestPermittedBodyMatches': digest(body.encode()) == claim['transformedBodySha256']})
ns = {'s': 'http://www.w3.org/2000/svg'}
svg = ET.fromstring((ROOT / 'textbooks/v10/assets/agent-engineering-landscape.svg').read_bytes())
groups = {}
for group in svg.findall('.//s:g', ns):
    if group.get('class') == 'node':
        title = group.find('s:title', ns)
        for t in group.findall('s:text', ns):
            if t.text and re.match(r'^\d+ ', t.text):
                groups[int(t.text.split(' ', 1)[0])] = {'group': title.text, 'label': t.text}
aliases = {'decision': 'choice', 'execution': 'control', 'assurance': 'guard'}
map_rows = []
for u in units:
    found = groups[u['order']]
    normalized = lambda x: re.sub(r'\s+', '', x).replace('（学习入口）', '')
    map_rows.append({'order': u['order'], 'unitId': u['unitId'], **found,
                     'groupMatchesSpec': found['group'] == aliases.get(u['landscapeGroupId'], u['landscapeGroupId']),
                     'shortLabelMatches': normalized(found['label']) == normalized(u['diagramLabel'])})
asset_bindings = []
for claim in manifest['assets']:
    p = Path(claim['path'])
    asset_bindings.append({**claim, 'actualSha256': digest(p.read_bytes()),
                           'manifestMatches': digest(p.read_bytes()) == claim['sha256']})
paths = [ROOT / u['v10TargetPath'] for u in units] + [ROOT / 'textbooks/v10/README.md', book_path, ROOT / 'team/textbook-v10-opening-spec.md']
links = [row for p in paths for row in local_links(p)]
# Author/reviewer handoffs can still be writing; final link pass reruns after freeze.
result = {'readIntervalUtc': {'started': started, 'completed': datetime.now(timezone.utc).isoformat()},
          'mechanicalPythonVersion': sys.version, 'scriptSha256': digest(Path(__file__).read_bytes()),
          'method': 'Independent current-source reconstruction under the explicit heading/link/footer rules. Author builder is read as handoff data but never imported/executed.',
          'book': {'path': str(book_path), 'sha256': digest(book_path.read_bytes()), 'bytes': len(book_path.read_bytes()),
                   'entireBookEqualsOnlyPermittedSourceAssembly': actual_book == expected_book,
                   'fullFenceSha256InOrderMatches20Sources': complete_fences(actual_book) == inherited,
                   'fullFenceCount': len(inherited)},
          'sources': rows, 'all20CurrentSourceClaimsMatch': all(x['manifestCurrentSourceMatches'] and x['manifestFullFencesMatch'] and x['manifestPermittedBodyMatches'] for x in rows),
          'all19ProfessionalBodiesAnd39FullFencesPreserved': all(x['retainedBodyOnlyPermittedHistoricalLabelChange'] and x['fullFencesEqualReceived'] for x in rows[1:]) and len(inherited) == 39,
          'chapterDiagramGroups': map_rows, 'all20DiagramGroupsMatch': len(groups) == 20 and all(x['groupMatchesSpec'] and x['shortLabelMatches'] for x in map_rows),
          'assets': asset_bindings, 'allAuthorAssetClaimsMatch': all(x['manifestMatches'] for x in asset_bindings),
          'localLinks': links, 'localLinkOccurrenceCount': len(links),
          'missingLocalTargets': [x for x in links if not x['fileExists']],
          'invalidMarkdownAnchors': [x for x in links if x['markdownAnchorExists'] is False],
          'oldBehaviorRerun': False, 'textbookBehaviorExecutionsThisRound': 0,
          'scopeLimit': 'Static source/assembly/navigation preservation and chapter placement; not browser rendering, runtime behavior, expert or learner validation.'}
(OUT / 'artifacts.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'book': result['book'], 'all20CurrentSourceClaimsMatch': result['all20CurrentSourceClaimsMatch'],
                  'all19ProfessionalBodiesAnd39FullFencesPreserved': result['all19ProfessionalBodiesAnd39FullFencesPreserved'],
                  'all20DiagramGroupsMatch': result['all20DiagramGroupsMatch'], 'allAuthorAssetClaimsMatch': result['allAuthorAssetClaimsMatch'],
                  'localLinkOccurrenceCount': len(links), 'missingLocalTargets': result['missingLocalTargets'],
                  'invalidMarkdownAnchors': result['invalidMarkdownAnchors']}, ensure_ascii=False))
