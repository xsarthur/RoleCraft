"""Assemble Markdown only; never imports or executes textbook code."""
from pathlib import Path
from collections import Counter
import hashlib,json,re

ROOT=Path(__file__).resolve().parents[2]
TEAM=ROOT/'team'
BOOKDIR=ROOT/'textbooks/v09'
COURSE=TEAM/'textbook-v09-manifest.json'
OUT=BOOKDIR/'agent-engineering-textbook.md'
MANIFEST=TEAM/'textbook-v09-author-assembly-manifest.json'
def sha(data): return hashlib.sha256(data).hexdigest()
def read(path): return path.read_bytes().decode('utf-8')
def blocks(text):
    result=[]; opening=None; start=None; lines=text.splitlines(keepends=True)
    for no,line in enumerate(lines,1):
        match=re.match(r'^\s*(`{3,}|~{3,})([^\r\n]*)',line)
        if opening is None:
            if match:
                opening=match.group(1); start=no; language=match.group(2).strip()
        elif match and match.group(1)[0]==opening[0] and len(match.group(1))>=len(opening) and not match.group(2).strip():
            fence=''.join(lines[start-1:no]).encode('utf-8')
            body=''.join(lines[start:no-1]).encode('utf-8')
            result.append(dict(index=len(result)+1,startLine=start,endLine=no,language=language,
                               fullFenceSha256=sha(fence),bodySha256=sha(body),fullFenceBytes=len(fence),bodyBytes=len(body)))
            opening=None
    if opening is not None: raise ValueError('unclosed fence')
    return result

def rewrite_link(match,source):
    target=match.group(1)
    if target.startswith('<') and target.endswith('>'): target=target[1:-1]
    if re.match(r'^[A-Za-z][A-Za-z0-9+.-]*:',target) or target.startswith('/'):
        return match.group(0)
    suffix=''
    # None of the current source links use Markdown title attributes.
    base,sep,anchor=target.partition('#')
    dest=(source.parent/base).resolve() if base else source.resolve()
    if sep: suffix='#'+anchor
    return ']('+str(dest)+suffix+')'

def transform(text,source):
    result=[]; opening=None
    for line in text.splitlines(keepends=True):
        match=re.match(r'^\s*(`{3,}|~{3,})([^\r\n]*)',line)
        if opening is not None:
            result.append(line)
            if match and match.group(1)[0]==opening[0] and len(match.group(1))>=len(opening) and not match.group(2).strip(): opening=None
        elif match:
            opening=match.group(1); result.append(line)
        else:
            line=re.sub(r'^(#{1,6})([ \t]+)',lambda m: '#'*min(6,len(m.group(1))+1)+m.group(2),line)
            line=re.sub(r'\]\(([^)\r\n]+)\)',lambda m:rewrite_link(m,source),line)
            result.append(line)
    return ''.join(result)

course=json.loads(read(COURSE))
units=sorted(course['units'],key=lambda u:u['order'])
source_files=[]; origin_blocks=[]
for sf in course['sourceFiles']:
    path=ROOT/sf['path']; data=path.read_bytes()
    if sha(data)!=sf['sha256']: raise ValueError('authority source changed: '+str(path))
    source_files.append({**sf,'absolutePath':str(path.resolve()),'bytes':len(data)})
    for block in blocks(data.decode('utf-8')):
        origin_blocks.append({'sourcePath':sf['path'],'sourceSha256':sf['sha256'],**block})

front='# Agent 工程教材\n\n从 [学习入口]('+str((BOOKDIR/'00-learning-route.md').resolve())+') 确定起点，或用 [分章阅读目录]('+str((BOOKDIR/'README.md').resolve())+') 选择主题。本书依次连接问题证据、任务验收、基础组件、控制流程与独立交付。\n\n实际检查范围见 [内容审校]('+str((TEAM/'textbook-v09-content-review.md').resolve())+') 与 [教材 QA]('+str((TEAM/'textbook-v09-qa.md').resolve())+')。构造例子、离线验证、真实用户和专业判断分别记录。\n'
parts=[front]; records=[]; all_blocks=[]
for unit in units:
    source=(ROOT/unit['path']).resolve(); raw=read(source); data=raw.encode('utf-8')
    transformed=transform(raw,source)
    unit_blocks=blocks(raw); transformed_blocks=blocks(transformed)
    if [b['fullFenceSha256'] for b in unit_blocks]!=[b['fullFenceSha256'] for b in transformed_blocks]:
        raise ValueError('assembly changed fence: '+str(source))
    bound=[]
    for block in unit_blocks:
        origins=[o for o in origin_blocks if o['fullFenceSha256']==block['fullFenceSha256']]
        bound.append({**block,'origin':origins if origins else [{'kind':'new_v09_author_block','path':unit['path']}]})
    all_blocks.extend([b['fullFenceSha256'] for b in unit_blocks])
    prefix='\n---\n\n本章原文 ['+unit['title']+']('+str(source)+')\n\n'
    chunk=prefix+transformed
    parts.append(chunk)
    records.append(dict(unitId=unit['unitId'],order=unit['order'],title=unit['title'],coreQuestion=unit['coreQuestion'],
                        path=unit['path'],absolutePath=str(source),sha256=sha(data),bytes=len(data),lineCount=len(raw.splitlines()),
                        unitKind=unit['unitKind'],moduleIds=unit['moduleIds'],prerequisiteUnitIds=unit['prerequisiteUnitIds'],
                        migrationSources=unit['sources'],
                        editorialAdaptations='New opening, prerequisites, output handoff and local navigation; prose headings clarified; dangling old execution claims removed. New/split units implement the specified conceptual responsibility; unchanged legacy fences are separately bound below.',
                        blocks=bound,transformedBodySha256=sha(transformed.encode('utf-8')),assemblyChunkSha256=sha(chunk.encode('utf-8'))))
book=''.join(parts); book_data=book.encode('utf-8')
if Counter(all_blocks)!=Counter(b['fullFenceSha256'] for b in blocks(book)):
    raise ValueError('assembly fence count differs')
legacy=Counter(o['fullFenceSha256'] for o in origin_blocks)
if legacy-Counter(all_blocks): raise ValueError('legacy fence missing')

baseline_path=TEAM/'textbook-v09-author-history/frozen-baseline.json'
baseline=json.loads(read(baseline_path)); changed=[]
for record in baseline['files']:
    path=Path(record['path'])
    if not path.exists() or sha(path.read_bytes())!=record['sha256']: changed.append(record['path'])
if changed: raise ValueError('frozen historical file changed: '+str(changed))

# Mutations are limited to the new v09 book and the author's authorized manifest.
OUT.write_bytes(book_data)
manifest={
 'schemaVersion':1,'date':'2026-10-11','authorRole':'教材研发员','status':'author_handoff_pending_independent_review_and_QA',
 'courseManifest':{'path':str(COURSE.resolve()),'sha256':sha(COURSE.read_bytes())},
 'courseSpec':{'path':str((TEAM/'textbook-v09-spec.md').resolve()),'sha256':sha((TEAM/'textbook-v09-spec.md').read_bytes())},
 'navigation':{'path':str((BOOKDIR/'README.md').resolve()),'sha256':sha((BOOKDIR/'README.md').read_bytes())},
 'assemblyScript':{'path':str(Path(__file__).resolve()),'sha256':sha(Path(__file__).read_bytes())},
 'compiledBook':{'path':str(OUT.resolve()),'sha256':sha(book_data),'bytes':len(book_data),'lineCount':len(book.splitlines()),'unitCount':len(records),'fullFenceCount':len(blocks(book))},
 'assemblyRules':[
   'Read current authoritative v09 units in course manifest order, with exact UTF-8 bytes.',
   'Prepend a short navigation/scope introduction and each unit authority link.',
   'Only outside fences lower ATX heading levels by one (cap at six) and resolve local Markdown link destinations, including fragments, to absolute authoritative paths.',
   'Preserve all other unit text; preserve complete opening fence, body, closing fence and their newlines byte-for-byte.',
   'No textbook code is imported, executed or tested by this transformation.'
 ],
 'sourceFreeze':{'policy':'Current 13 individual authorities; current old compiled book is neither source nor restored. Historical QA remains bound to its original records.','authorBaselinePath':str(baseline_path.resolve()),'sha256':sha(baseline_path.read_bytes()),'frozenFileCount':len(baseline['files']),'authorFileComparisonChangedCount':len(changed)},
 'sourceFiles':source_files,'units':records,
 'authorMechanicalSelfCheck':{'notIndependentQA':True,'legacyFullFenceCount':len(origin_blocks),'v09FullFenceCount':len(all_blocks),'missingLegacyFenceCount':sum((legacy-Counter(all_blocks)).values()),'newFenceCount':sum((Counter(all_blocks)-legacy).values()),'allAssemblyFullFencesEqualSourceFullFences':True},
 'executionBoundary':{'authorExecutedTextbookCode':False,'legacyCode':'No new execution conclusion from byte-preserving migration; historical v08 Python3.12.14/SQLite3.53.1 remains its own scope.','newFoundationQA':'Independent QA reports system Python3.14.5, isolated temporary working directory, 14 parser/business inputs and CLI/checks/fault/restoration paths; use its source/code bindings and actual evidence.','pseudocode':'Fixed workflow and full dynamic loop unexecuted.','external':'No real model, embedding, issue provider or business action invoked.'}
}
MANIFEST.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'book':manifest['compiledBook'],'manifestSha256':sha(MANIFEST.read_bytes()),'oldFrozenFilesCompared':len(baseline['files']),'fences':manifest['authorMechanicalSelfCheck']},ensure_ascii=False,indent=2))
