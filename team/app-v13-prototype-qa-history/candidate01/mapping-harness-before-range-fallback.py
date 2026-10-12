from pathlib import Path
import json, hashlib, re, datetime

SITE = Path(__file__).resolve().parents[2]
WORKSPACE = SITE.parents[1]
OUT = Path(__file__).parent / 'candidate01'
errors = []
def require(ok, name, details=''):
    if not ok: errors.append({'check': name, 'details': details})
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def datajs(name, symbol):
    text = (SITE / 'dist' / name).read_text()
    body = text.split('globalThis.' + symbol + '=', 1)[1].strip()
    require(body.endswith(';'), 'data serialization final delimiter', name)
    return json.loads(body[:-1])

data = json.loads((SITE/'team/app-v13-prototype-learning-data.json').read_text())
idx = json.loads((SITE/'server/retrieval/content-v12-index.json').read_text())
pack = datajs('content-v12-data.js', 'RolecraftContentV12')
derived = datajs('learning-v13-data.js', 'RolecraftLearningV13')
matrix = json.loads((SITE/'team/textbook-v12-qa-matrix.json').read_text())
curriculum = json.loads((SITE/'team/textbook-v12-curriculum.json').read_text())
require(derived == data, 'derived learning JS is exact curriculum object')
require(pack == idx, 'content JS is exact same corpus index object')
require(data['readingOrder'] == curriculum['readingOrder'], 'formal reading order')
require([u['unitId'] for u in data['units']] == data['readingOrder'], 'unit sequence')
require(len(data['units']) == 30, '30 actual units')
units = {u['unitId']:u for u in idx['units']}
points = {k['id']:k for k in data['knowledgePoints']}
require(len(points) == 240, '240 unique learning points')
sections = {}; lines = {}; source_shas = {}; heading_locations = {}
for u in idx['units']:
    path = SITE/u['sourcePath']; raw = path.read_bytes(); text = raw.decode('utf-8')
    source_shas[u['unitId']] = hashlib.sha256(raw).hexdigest()
    lines[u['unitId']] = text.splitlines()
    require(u['sourceSha256'] == source_shas[u['unitId']], 'unit source SHA', u['unitId'])
    require(u['bodyMarkdown'] == text.rstrip('\n'), 'complete source body', u['unitId'])
    fence = False; headings = []
    for n, line in enumerate(text.splitlines(),1):
        if line.startswith('```'): fence = not fence; continue
        if not fence:
            match = re.match(r'^(#{1,3})\s+(.+)$', line)
            if match: headings.append((n,len(match[1]),match[2]))
    heading_locations[u['unitId']] = headings
    require(len(headings) == len(u['sections']), 'all actual headings indexed', u['unitId'])
    for section, heading in zip(u['sections'], headings):
        require((section['startLine'],section['level'],section['title']) == heading,
                'section exact source heading', [u['unitId'],section['sectionId'],heading])
        sections[(u['unitId'],section['sectionId'])] = section
require(len(sections) == 273, '273 unique unit/section identities')
for binding in data['sourceBindings']:
    p=WORKSPACE/binding['path']
    require(p.exists() and p.stat().st_size == binding['bytes'] and sha(p) == binding['sha256'],
            'current sourceBinding identity', binding['path'])
curriculum_units = {u['id']:u for u in curriculum['units']}
children = {}; kind_counts = {}
for u in data['units']:
    original=units[u['unitId']]
    require(u['prerequisiteUnitIds'] == [p['unitId'] if isinstance(p,dict) else p for p in curriculum_units[u['unitId']]['prerequisites']], 'prerequisites preserved',u['unitId'])
    require(u['sourcePath'] == original['sourcePath'] and u['sourceSha256'] == original['sourceSha256'], 'unit mapped source',u['unitId'])
for k in points.values():
    section=sections.get((k['unitId'],k['sectionId']))
    require(section is not None,'point real exact section',k['id'])
    if not section: continue
    require(k['id']==k['unitId']+':'+k['sectionId'],'point composite identity',k['id'])
    require(k['level'] in (1,2) and k['level']==section['level'] and k['title']==section['title'] and k['startLine']==section['startLine'], 'point level/title/position',k['id'])
    require(k['sourceSha256']==source_shas[k['unitId']] and k['sourcePath']==units[k['unitId']]['sourcePath'] and k['href']==section['href'],'point source/href',k['id'])
    kind_counts[k['kind']]=kind_counts.get(k['kind'],0)+1
    for child in k['childSectionIds']:
        require((k['unitId'],child) not in children,'unique child parent',[k['unitId'],child])
        sec=sections.get((k['unitId'],child))
        require(sec is not None and sec['level']==3,'child real tertiary',child)
        preceding=[x for x in heading_locations[k['unitId']] if x[0]<sec['startLine'] and x[1]<=2]
        require(preceding[-1][0]==k['startLine'],'child actual explicit parent',child)
        children[(k['unitId'],child)]=k['id']
require(len(children)==33,'33 explicit tertiary memberships')
require(kind_counts=={'unit_introduction':30,'core':172,'exercise':18,'navigation':20},'point kind exact counts',kind_counts)
items={i['id']:i for i in matrix['items']}
questions={q['id']:q for q in data['questions']}
require(len(questions)==114 and set(questions)=={f'Q{i}' for i in range(1,101)}|{f'M{i}' for i in range(101,115)},'114 exact public IDs/no holdouts')
evidence_count=0; range_crossings=0; actual_sets={}; point_questions={k:[] for k in points}
for q in data['questions']:
    original=items[q['sourceQuestionId']]
    require(q['question']==original['question'] and q['set']==original['set'],'complete original question/set',q['id'])
    actual_sets[q['set']]=actual_sets.get(q['set'],0)+1
    require(q['supportStatus']==original['finalSupport'],'frozen support label retained not rescored',q['id'])
    require(len(q['evidence'])==len(original['finalEvidence']),'no lost evidence',q['id'])
    seen_refs=set()
    for ref in q['knowledgeRefs']:
        key=(ref['unitId'],ref['sectionId']);section=sections.get(key);k=points.get(ref['knowledgePointId'])
        require(key not in seen_refs,'question refs unique',q['id']);seen_refs.add(key)
        require(section is not None and k is not None,'question actual targets',q['id'])
        if not section or not k: continue
        expected_parent=k['id'] if k['sectionId']==ref['sectionId'] else children.get(key)
        require(ref['knowledgePointId']==expected_parent,'question exact core attribution',q['id'])
        require(ref['sourceSha256']==source_shas[ref['unitId']] and ref['sourcePath']==units[ref['unitId']]['sourcePath'] and ref['sectionTitle']==section['title'] and ref['href']==section['href'],'reference source/title/href',q['id'])
        if q['id'] not in point_questions[k['id']]: point_questions[k['id']].append(q['id'])
    for evidence,old in zip(q['evidence'],original['finalEvidence']):
        evidence_count+=1; key=(evidence['unitId'],evidence['sectionId']); section=sections.get(key)
        require(evidence['quote']==old['quote'] and evidence['usage']==old['usage'],'frozen precise quote retained',evidence['id'])
        require(evidence['sourcePath']=='/'.join(Path(old['file']).parts[2:]) and evidence['sourceSha256']==old['sha256'],'old source identity retained',evidence['id'])
        require(evidence['reviewSourceRange']=={'startLine':old['startLine'],'endLine':old['endLine'],'section':old['section']},'original wider review range retained',evidence['id'])
        source=lines[evidence['unitId']]
        selected='\n'.join(source[evidence['startLine']-1:evidence['endLine']])
        require(evidence['quote'] in selected and evidence['quote'] in section['bodyMarkdown'],'quote actual exact range/section',evidence['id'])
        require(evidence['sourceSha256']==source_shas[evidence['unitId']] and evidence['sectionTitle']==section['title'] and evidence['href']==section['href'],'evidence identity/href',evidence['id'])
        require(key in seen_refs,'evidence has declared ref',evidence['id'])
        if any(n>old['startLine'] and n<=old['endLine'] and n!=section['startLine'] for n,level,title in heading_locations[evidence['unitId']]):range_crossings+=1
    personal=q['id'] in {'Q10','Q99'}
    require(q['personalEvidenceRequired']==personal and q['excludeFromSelfTest']==personal and q['selfTestEligible']==(not personal),'personal question exclusion',q['id'])
    require('answer' not in q,'no fabricated fixed answer',q['id'])
for k in points.values():require(set(k['questionIds'])==set(point_questions[k['id']]),'exact bidirectional point/question mapping',k['id'])
for u in data['units']:
    union={q for k in points.values() if k['unitId']==u['unitId'] for q in k['questionIds']}
    require(set(u['questionIds'])==union,'unit question union for browsing',u['unitId'])
require(evidence_count==327,'327 actual evidence entries')
require(actual_sets=={'fixed100':100,'market14':14},'question groups split')
baseline=json.loads((Path(__file__).parent/'received-baseline.json').read_text())
changed=[]
for row in baseline['protected']:
    p=WORKSPACE/row['path']
    if not p.exists() or sha(p)!=row['sha256'] or p.stat().st_size!=row['bytes']:changed.append(row['path'])
require(not changed,'900 received protected files unchanged',changed)
result={'atUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'pass' if not errors else 'fail','scope':'Independent mapping/source/serialized-data mechanical check; not teaching support rescoring, browser, code examples, learner or expert evidence','runtime':'Python '+__import__('sys').version.split()[0],'counts':{'units':len(units),'sections':len(sections),'knowledgePoints':len(points),'tertiaryParents':len(children),'questions':len(questions),'evidence':evidence_count,'questionSets':actual_sets,'pointKinds':kind_counts,'pointsWithQuestions':sum(bool(k['questionIds']) for k in points.values()),'pointsWithoutQuestions':sum(not k['questionIds'] for k in points.values()),'sourceBindings':len(data['sourceBindings']),'protectedCompared':len(baseline['protected']),'protectedUnchanged':len(baseline['protected'])-len(changed),'widerReviewRangesCrossHeadings':range_crossings},'errors':errors,'learningDataSha256':sha(SITE/'team/app-v13-prototype-learning-data.json')}
(OUT/'independent-mapping.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(result,ensure_ascii=False,indent=2))
raise SystemExit(0 if not errors else 1)
