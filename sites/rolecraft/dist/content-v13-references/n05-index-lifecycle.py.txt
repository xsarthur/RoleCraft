"""Synthetic page blocks and manual vectors; no PDF/OCR/embedding/ANN service."""
from dataclasses import dataclass, replace
import hashlib
import json
import math


def digest(value):
    return hashlib.sha256(json.dumps(value,ensure_ascii=False,sort_keys=True).encode()).hexdigest()


def checked(v):
    if not isinstance(v,(list,tuple)) or not 0 < len(v) <= 1024:
        raise ValueError('VECTOR_DIMENSION')
    values=[]
    for x in v:
        if type(x) not in (int,float):
            raise ValueError('VECTOR_NUMBER')
        try:
            x=float(x)
        except (ValueError,OverflowError):
            raise ValueError('VECTOR_NUMBER') from None
        if not math.isfinite(x) or abs(x)>1e100:
            raise ValueError('VECTOR_FINITE_BOUND')
        values.append(x)
    return tuple(values)


def metrics(a,b):
    a=checked(a); b=checked(b)
    if len(a)!=len(b):
        raise ValueError('VECTOR_DIMENSION')
    na=math.hypot(*a); nb=math.hypot(*b)
    if na==0 or nb==0:
        raise ValueError('ZERO_VECTOR')
    dot=math.fsum(x*y for x,y in zip(a,b))
    return {'dot':dot,'cosine':math.fsum((x/na)*(y/nb) for x,y in zip(a,b)),
            'l2':math.hypot(*(x-y for x,y in zip(a,b)))}

@dataclass(frozen=True)
class Block:
    block_id: str
    page: int
    bbox: tuple
    text: str
    method: str
    verified: bool
    vector: tuple

@dataclass(frozen=True)
class Source:
    doc_id: str
    revision: str
    parser_version: str
    blocks: tuple[Block,...]

@dataclass(frozen=True)
class Chunk:
    chunk_id: str
    doc_id: str
    revision: str
    source_hash: str
    block_id: str
    page: int
    bbox: tuple
    text: str
    text_hash: str
    vector: tuple
    embedding_version: str

@dataclass(frozen=True)
class Snapshot:
    snapshot_id: str
    manifest: tuple
    chunks: tuple[Chunk,...]


def source_hash(source):
    return digest([source.doc_id,source.revision,source.parser_version,
        [[b.block_id,b.page,b.bbox,b.text,b.method,b.verified] for b in source.blocks]])


def content(snapshot):
    return [snapshot.manifest,[[c.chunk_id,c.doc_id,c.revision,c.source_hash,c.block_id,
             c.page,c.bbox,c.text,c.text_hash,c.vector,c.embedding_version] for c in snapshot.chunks]]


def build(sources, embedding_version):
    if len({s.doc_id for s in sources}) != len(sources):
        raise ValueError('DUPLICATE_DOCUMENT')
    chunks=[]; manifest=[]
    for src in sorted(sources,key=lambda x:x.doc_id):
        sh=source_hash(src)
        manifest.append((src.doc_id,src.revision,sh))
        if len({b.block_id for b in src.blocks}) != len(src.blocks):
            raise ValueError('DUPLICATE_BLOCK')
        for b in src.blocks:
            if not b.verified:
                continue
            vector=checked(b.vector)
            if math.hypot(*vector)==0:
                raise ValueError('ZERO_VECTOR')
            th=digest(b.text)
            cid=digest([src.doc_id,src.revision,b.block_id,th,src.parser_version])
            chunks.append(Chunk(cid,src.doc_id,src.revision,sh,b.block_id,b.page,b.bbox,
                                b.text,th,vector,embedding_version))
    snap=Snapshot('',tuple(manifest),tuple(chunks))
    return replace(snap,snapshot_id=digest(content(snap)))


def delta(old,new):
    a={c.chunk_id for c in old.chunks}; b={c.chunk_id for c in new.chunks}
    return {'keep':len(a&b),'add':len(b-a),'delete':len(a-b)}


def query(snapshot,expected_snapshot_id,vector,embedding_version,principal,acl,top_k=3):
    if snapshot.snapshot_id != expected_snapshot_id or digest(content(snapshot)) != snapshot.snapshot_id:
        raise ValueError('SNAPSHOT_MISMATCH')
    if type(top_k) is not int or top_k<1:
        raise ValueError('TOP_K')
    q=checked(vector)
    if math.hypot(*q)==0:
        raise ValueError('ZERO_VECTOR')
    rows=[]
    for c in snapshot.chunks:
        if principal not in acl.get(c.doc_id,frozenset()):
            continue
        if c.embedding_version != embedding_version:
            raise ValueError('MODEL_MISMATCH')
        rows.append((metrics(q,c.vector)['cosine'],c))
    rows.sort(key=lambda pair:(-pair[0],pair[1].chunk_id))
    # acl is a trusted current snapshot. Production reads must re-check at use-time.
    return [c for _,c in rows[:top_k]]



def control_gate(unresolved, conflict, calls_left, now, deadline,
                 rejected_proposals, max_rejections=2):
    """Checks already verified local evidence before admitting any new call.

    Empty unresolved means all local reference/version/permission checks passed.
    This fixture returns an evidence table, not a new LLM-written answer.
    """
    if conflict:
        return 'WAIT_INPUT'
    if not unresolved:
        return 'COMPLETE_EXISTING_EVIDENCE'
    if now >= deadline or calls_left <= 0:
        return 'INSUFFICIENT'
    if rejected_proposals >= max_rejections:
        return 'STOP_BAD_PLAN'
    return 'PROPOSE'


def expect(fn,code):
    try:
        fn()
    except ValueError as e:
        assert str(e)==code,(str(e),code)
    else:
        raise AssertionError(code)


def main():
    assert control_gate(set(),False,0,10,10,0) == 'COMPLETE_EXISTING_EVIDENCE'
    assert control_gate({'policy'},False,0,9,10,0) == 'INSUFFICIENT'
    assert control_gate(set(),True,0,9,10,0) == 'WAIT_INPUT'
    assert control_gate({'policy'},False,3,9,10,2) == 'STOP_BAD_PLAN'
    assert control_gate({'policy'},False,3,9,10,1) == 'PROPOSE'
    assert metrics([1,0],[2,0]) == {'dot':2.0,'cosine':1.0,'l2':1.0}
    a=(0.6,0.8); b=(1.0,0.0)
    m=metrics(a,b)
    assert math.isclose(m['l2']**2,2-2*m['dot'])
    expect(lambda:metrics([0,0],[1,0]),'ZERO_VECTOR')
    expect(lambda:metrics([1],[1,0]),'VECTOR_DIMENSION')
    expect(lambda:metrics([float('nan')],[1]),'VECTOR_FINITE_BOUND')
    block=Block('p1b1',1,(0,0,100,40),'refund rule is less than 7','native',True,(1,0))
    uncertain=Block('p2b1',2,(0,0,100,40),'refund rule is less than 1','ocr',False,(1,0))
    s1=Source('policy','r1','fixture-parser-1',(block,uncertain))
    s2=Source('guide','r1','fixture-parser-1',(replace(block,text='report reading',vector=(0,1)),))
    first=build([s1,s2],'manual-v1')
    assert len(first.chunks)==2
    acl={'policy':frozenset({'u1'}),'guide':frozenset({'u1'})}
    assert query(first,first.snapshot_id,(1,0),'manual-v1','u1',acl)[0].doc_id=='policy'
    changed=replace(s1,revision='r2',blocks=(replace(block,text='refund rule is at most 7'),))
    second=build([changed],'manual-v1')  # guide deleted
    assert delta(first,second)=={'keep':0,'add':1,'delete':2}
    hits=query(second,second.snapshot_id,(1,0),'manual-v1','u1',acl)
    assert all(c.revision=='r2' and c.doc_id=='policy' for c in hits)
    acl['policy']=frozenset()
    assert query(second,second.snapshot_id,(1,0),'manual-v1','u1',acl)==[]
    expect(lambda:query(replace(second,chunks=second.chunks+first.chunks),second.snapshot_id,
           (1,0),'manual-v1','u1',acl),'SNAPSHOT_MISMATCH')
    expect(lambda:build([s1,s1],'manual-v1'),'DUPLICATE_DOCUMENT')
    expect(lambda:build([replace(s1,blocks=(block,block))],'manual-v1'),'DUPLICATE_BLOCK')
    expect(lambda:query(second,first.snapshot_id,(1,0),'manual-v1','u1',acl),'SNAPSHOT_MISMATCH')
    print(json.dumps({'status':'SELF_CHECK_OK','delta':delta(first,second),
                     'unverified_ocr_excluded':True,'revoked_results':0,
                     'control_gate_cases':5},sort_keys=True))

if __name__ == '__main__':
    main()
