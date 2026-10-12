"""Assemble Markdown artifacts only; never import or run textbook code."""
from pathlib import Path
from collections import Counter
import hashlib
import json
import re

ROOT = Path(__file__).resolve().parents[2]
TEAM = ROOT / 'team'
BOOKDIR = ROOT / 'textbooks/v10'
SPEC = TEAM / 'textbook-v10-opening-spec.json'
OUT = BOOKDIR / 'agent-engineering-textbook.md'
MANIFEST = TEAM / 'textbook-v10-opening-author-assembly-manifest.json'
NAV_OLD = '[本轮记录](../../team/textbook-v09-qa.md)'
NAV_NEW = '[原版验证记录](../../team/textbook-v09-qa.md)'


def sha(data):
    return hashlib.sha256(data).hexdigest()


def read(path):
    return path.read_bytes().decode('utf-8')


def binding(path):
    data = path.read_bytes()
    return {'path': str(path.resolve()), 'sha256': sha(data), 'bytes': len(data)}


def blocks(text):
    result = []
    opening = None
    lines = text.splitlines(keepends=True)
    for no, line in enumerate(lines, 1):
        match = re.match(r'^\s*(`{3,}|~{3,})([^\r\n]*)', line)
        if opening is None:
            if match:
                opening = match.group(1)
                start = no
                language = match.group(2).strip()
        elif (match and match.group(1)[0] == opening[0]
              and len(match.group(1)) >= len(opening)
              and not match.group(2).strip()):
            fence = ''.join(lines[start - 1:no]).encode('utf-8')
            body = ''.join(lines[start:no - 1]).encode('utf-8')
            result.append({'index': len(result) + 1, 'startLine': start,
                           'endLine': no, 'language': language,
                           'fullFenceSha256': sha(fence), 'bodySha256': sha(body),
                           'fullFenceBytes': len(fence), 'bodyBytes': len(body)})
            opening = None
    if opening is not None:
        raise ValueError('unclosed Markdown fence')
    return result


def rewrite_link(match, source):
    target = match.group(1)
    if target.startswith('<') and target.endswith('>'):
        target = target[1:-1]
    if re.match(r'^[A-Za-z][A-Za-z0-9+.-]*:', target) or target.startswith('/'):
        return match.group(0)
    # Current authoritative units have no Markdown link title attributes.
    base, sep, anchor = target.partition('#')
    destination = (source.parent / base).resolve() if base else source.resolve()
    suffix = '#' + anchor if sep else ''
    address = str(destination) + suffix
    if ' ' in address:
        address = '<' + address + '>'
    return '](' + address + ')'


def transform(text, source):
    result = []
    opening = None
    for line in text.splitlines(keepends=True):
        match = re.match(r'^\s*(`{3,}|~{3,})([^\r\n]*)', line)
        if opening is not None:
            result.append(line)
            if (match and match.group(1)[0] == opening[0]
                    and len(match.group(1)) >= len(opening)
                    and not match.group(2).strip()):
                opening = None
        elif match:
            opening = match.group(1)
            result.append(line)
        else:
            line = re.sub(r'^(#{1,6})([ \t]+)',
                          lambda m: '#' * min(6, len(m.group(1)) + 1) + m.group(2), line)
            line = re.sub(r'\]\(([^)\r\n]+)\)',
                          lambda m: rewrite_link(m, source), line)
            result.append(line)
    return ''.join(result)


spec = json.loads(read(SPEC))
units = sorted(spec['chapterMap'], key=lambda unit: unit['order'])
if len(units) != 20 or [unit['order'] for unit in units] != list(range(1, 21)):
    raise ValueError('unexpected curriculum order')
old_assembly_path = TEAM / 'textbook-v09-author-assembly-manifest.json'
old_assembly = json.loads(read(old_assembly_path))
old_units = {unit['unitId']: unit for unit in old_assembly['units']}
source_bindings = []
for record in spec['sourceBindings']:
    path = ROOT / record['path']
    if sha(path.read_bytes()) != record['sha256']:
        raise ValueError('curriculum source changed: ' + str(path))
    source_bindings.append({**record, 'absolutePath': str(path.resolve())})

# The front of the complete book immediately enters the Agent opening.
parts = ['# Agent 工程教材\n\n']
records = []
all_fences = []
legacy_fences = []
navigation_changes = []
for unit in units:
    origin = (ROOT / unit['v09SourcePath']).resolve()
    origin_data = origin.read_bytes()
    if sha(origin_data) != unit['v09SourceSha256']:
        raise ValueError('received v09 source changed: ' + str(origin))
    source = (ROOT / unit['v10TargetPath']).resolve()
    raw = read(source)
    data = raw.encode('utf-8')
    if raw.splitlines()[0] != '# ' + unit['v10ActualHeading']:
        raise ValueError('chapter title does not match: ' + str(source))
    source_blocks = blocks(raw)
    origin_blocks = blocks(origin_data.decode('utf-8'))
    if unit['order'] == 1:
        if source_blocks:
            raise ValueError('opening unexpectedly contains executable examples')
        change_kind = 'new_concept_need_runtime_landscape_opening'
    else:
        expected = origin_data.decode('utf-8').replace(NAV_OLD, NAV_NEW).encode('utf-8')
        if data != expected:
            raise ValueError('professional unit changed beyond approved navigation: ' + str(source))
        count = origin_data.decode('utf-8').count(NAV_OLD)
        if count:
            navigation_changes.append({'unitId': unit['unitId'], 'count': count,
                                       'old': NAV_OLD, 'new': NAV_NEW})
        if [b['fullFenceSha256'] for b in source_blocks] != [b['fullFenceSha256'] for b in origin_blocks]:
            raise ValueError('migration changed a complete fence: ' + str(source))
        legacy_fences.extend(b['fullFenceSha256'] for b in origin_blocks)
        change_kind = 'body_retained_only_historical_QA_navigation_label_changed' if count else 'exact_received_v09_bytes'
    transformed = transform(raw, source)
    if [b['fullFenceSha256'] for b in source_blocks] != [b['fullFenceSha256'] for b in blocks(transformed)]:
        raise ValueError('assembly changed a complete fence: ' + str(source))
    # Authority is available at the end of each chapter, never before the opening definition.
    footer = '\n本章原文 [' + unit['v10ActualHeading'] + '](' + str(source) + ')\n'
    chunk = transformed + footer
    if unit['order'] > 1:
        chunk = '\n---\n\n' + chunk
    parts.append(chunk)
    bound_blocks = []
    historical = old_units[unit['unitId']]['blocks']
    for block in source_blocks:
        previous = next((item for item in historical if item['fullFenceSha256'] == block['fullFenceSha256']), None)
        if previous is None:
            raise ValueError('missing inherited block provenance')
        bound_blocks.append({**block, 'v09Origin': {'path': str(origin),
                            'sha256': unit['v09SourceSha256'],
                            'index': previous['index'], 'startLine': previous['startLine'],
                            'endLine': previous['endLine']},
                            'originalSourceOrigins': previous.get('origin', [])})
    all_fences.extend(b['fullFenceSha256'] for b in source_blocks)
    records.append({**unit, 'path': str(source), 'sha256': sha(data), 'bytes': len(data),
                    'lineCount': len(raw.splitlines()), 'changeKind': change_kind,
                    'v09OriginAbsolutePath': str(origin), 'blocks': bound_blocks,
                    'transformedBodySha256': sha(transformed.encode('utf-8')),
                    'assemblyChunkSha256': sha(chunk.encode('utf-8'))})

book = ''.join(parts)
book_data = book.encode('utf-8')
book_blocks = blocks(book)
if Counter(all_fences) != Counter(b['fullFenceSha256'] for b in book_blocks):
    raise ValueError('compiled book fence multiset differs')
if Counter(legacy_fences) != Counter(all_fences) or len(all_fences) != 39:
    raise ValueError('inherited fences missing or added')

baseline_path = TEAM / 'textbook-v10-opening-author-history/received-baseline.json'
baseline = json.loads(read(baseline_path))
received_differences = []
for item in baseline['files']:
    path = Path(item['path'])
    current = sha(path.read_bytes()) if path.exists() else None
    if current != item['sha256']:
        received_differences.append({'path': str(path), 'receivedSha256': item['sha256'],
                                     'currentSha256': current})
assets = [binding(path) for path in sorted((BOOKDIR / 'assets').iterdir()) if path.is_file()]
render_script = TEAM / 'textbook-v10-opening-author-history/render-diagrams.cjs'
render_record = TEAM / 'textbook-v10-opening-author-history/diagram-render-record.json'

# Only new v10 artifacts and this author's manifest are written.
OUT.write_bytes(book_data)
manifest = {
    'schemaVersion': 1, 'version': 'textbook-v10-opening', 'date': '2026-10-11',
    'authorRole': '教材研发员', 'status': 'author_handoff_for_independent_review_and_QA',
    'courseSpecMarkdown': binding(TEAM / 'textbook-v10-opening-spec.md'),
    'courseSpecJSON': binding(SPEC), 'curriculumSourceBindings': source_bindings,
    'navigation': binding(BOOKDIR / 'README.md'),
    'assemblyScript': binding(Path(__file__)),
    'compiledBook': {**binding(OUT), 'lineCount': len(book.splitlines()),
                     'unitCount': len(records), 'fullFenceCount': len(book_blocks)},
    'assemblyRules': [
        'Read the 20 current authoritative v10 units in the frozen specification order.',
        'Begin with the book title followed directly by the new Agent opening; place each chapter authority link after its body.',
        'Outside complete fences only, lower ATX heading levels by one (cap at six) and resolve local Markdown link/image destinations and fragments to absolute authoritative paths.',
        'Preserve all other body text, and every complete opening fence, body, closing fence and newline byte-for-byte.',
        'Do not import, execute or test any textbook example.'
    ],
    'migrationRules': {
        'opening': 'Replace v09 task-first opening with the specified definition, needs, two diagrams, chapter map and retained learning/practice route.',
        'professionalUnits': '19 received v09 units retained byte-for-byte except the exact footer historical-QA label replacement below.',
        'navigationChanges': navigation_changes,
        'authorityChain': binding(old_assembly_path)
    },
    'receivedBaseline': {**binding(baseline_path), 'fileCount': len(baseline['files']),
                         'authorComparisonOnlyNotIndependentQA': True,
                         'differencesAtAssembly': received_differences,
                         'policy': 'Keep received files, including v09 opening table-format differences and current v08 book; never restore historical hashes.'},
    'units': records, 'assets': assets,
    'diagramRendering': {'script': binding(render_script), 'record': binding(render_record),
                         'actualRendererRecord': json.loads(read(render_record)),
                         'semantics': 'DOT nodes and directed relations are native diagram source; detached captions and invisible points only control layout.',
                         'authorVisualInspection': 'Both current rendered PNGs viewed; independent visibility conclusion belongs to QA.'},
    'authorMechanicalSelfCheck': {
        'notIndependentQA': True, 'unitCount': 20, 'retainedProfessionalUnitCount': 19,
        'inheritedFullFenceCount': len(legacy_fences), 'compiledFullFenceCount': len(book_blocks),
        'allInheritedFullFencesEqual': True, 'allCompiledFullFencesEqualSource': True,
        'newExampleFenceCount': 0
    },
    'executionBoundary': {
        'authorExecutedTextbookCode': False,
        'newArtifactWork': 'Only text assembly, source hashing and Graphviz/sharp diagram rendering.',
        'historicalExecution': 'v09 foundation limited Python3.14.5 execution and v08 limited Python3.12.14/SQLite3.53.1 behavior remain bound to their original source records; migration does not grant a v10 execution result.',
        'pseudocode': 'Fixed workflow and complete dynamic loop remain unexecuted.',
        'external': 'No real model, embedding, issue provider, business service or sensitive data action invoked.'
    }
}
MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'book': manifest['compiledBook'], 'manifest': binding(MANIFEST),
                  'opening': {key: records[0][key] for key in ('path', 'sha256', 'bytes')},
                  'navigation': manifest['navigation'],
                  'authorMechanicalSelfCheck': manifest['authorMechanicalSelfCheck'],
                  'receivedDifferences': received_differences}, ensure_ascii=False, indent=2))
