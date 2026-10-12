import hashlib
import json
import math
import re
from dataclasses import dataclass

def sha(text):
    return hashlib.sha256(text.encode("utf-8")).hexdigest()

@dataclass(frozen=True)
class SourceDocument:
    source_id: str
    revision: str
    tenants: frozenset
    text: str
    source_hash: str

@dataclass(frozen=True)
class Chunk:
    chunk_id: str
    source_id: str
    revision: str
    start_line: int
    end_line: int
    text: str
    chunk_hash: str
    source_hash: str
    tenants: frozenset
    # 可信夹具的规范事实；不是由本次回答模型编写。
    facts: tuple
    embedding: tuple = ()
    embedding_version: str = ""

@dataclass(frozen=True)
class QueryScope:
    tenant: str
    revision: str
    index_snapshot_id: str

@dataclass(frozen=True)
class IndexSnapshot:
    snapshot_id: str
    chunks: tuple

def snapshot_id(chunks):
    # 快照ID绑定成员及其所有本篇检索/支持元数据，而不只是一个名称。
    members = [{"id": c.chunk_id, "source": c.source_id, "revision": c.revision,
                "range": [c.start_line, c.end_line], "text": c.text,
                "chunk_hash": c.chunk_hash, "source_hash": c.source_hash,
                "tenants": sorted(c.tenants), "facts": list(c.facts),
                "embedding": list(c.embedding), "embedding_version": c.embedding_version}
               for c in sorted(chunks, key=lambda c: c.chunk_id)]
    return "index:" + sha(json.dumps(members, sort_keys=True, separators=(",", ":")))

def terms(text):
    # 教学分词，仅保留英文/代码标识；中文查询需另选分词器或改写。
    return set(re.findall(r"[a-z0-9_./@-]+", text.lower()))

def cosine(query, document):
    if not query or len(query) != len(document):
        raise ValueError("VECTOR_DIMENSION")
    if not all(math.isfinite(x) for x in (*query, *document)):
        raise ValueError("VECTOR_NOT_FINITE")
    left = math.sqrt(sum(x * x for x in query))
    right = math.sqrt(sum(x * x for x in document))
    if left == 0 or right == 0:
        raise ValueError("VECTOR_ZERO")
    return sum(x * y for x, y in zip(query, document)) / (left * right)

def ordered(scores):
    return [key for key, score in sorted(scores.items(), key=lambda x: (-x[1], x[0]))]

def retrieve(query, scope, snapshot, sources, top_k=4,
             query_vector=(), embedding_version=""):
    if top_k < 1:
        raise ValueError("TOP_K")
    if (scope.index_snapshot_id != snapshot.snapshot_id
            or snapshot_id(snapshot.chunks) != snapshot.snapshot_id):
        return {"kind": "INVALID_EVIDENCE", "code": "SNAPSHOT_MISMATCH"}
    chunks = snapshot.chunks
    if len({c.chunk_id for c in chunks}) != len(chunks):
        return {"kind": "INVALID_EVIDENCE", "code": "DUPLICATE_CHUNK_ID"}
    eligible = [c for c in chunks if scope.tenant in c.tenants
                and c.revision == scope.revision]
    fact_groups = {}
    for c in eligible:
        for subject, predicate, value in c.facts:
            fact_groups.setdefault((subject, predicate), set()).add(value)
    # 摄取标签中的已知冲突在top_k之前检查；不替代发现未知/未摄取来源。
    known_conflicts = {k: sorted(v) for k, v in fact_groups.items() if len(v) > 1}
    lexical_scores = {c.chunk_id: len(terms(query) & terms(c.text + " " + c.chunk_id))
                      for c in eligible}
    lexical = ordered({k: v for k, v in lexical_scores.items() if v > 0})
    semantic = []
    if query_vector:
        if not embedding_version:
            raise ValueError("EMBEDDING_VERSION_REQUIRED")
        scores = {}
        for c in eligible:
            if c.embedding_version != embedding_version:
                raise ValueError("EMBEDDING_VERSION_MISMATCH")
            scores[c.chunk_id] = cosine(query_vector, c.embedding)
        semantic = ordered(scores)
    fused = {}
    for ranking in (lexical, semantic):
        for rank, chunk_id in enumerate(ranking, start=1):
            fused[chunk_id] = fused.get(chunk_id, 0) + 1 / (60 + rank)
    ids = ordered(fused)[:top_k]
    selected = []
    by_id = {c.chunk_id: c for c in eligible}
    for chunk_id in ids:
        chunk = by_id[chunk_id]
        source = sources.get(chunk.source_id)
        if source is None:
            return {"kind": "INVALID_EVIDENCE", "code": "SOURCE_MISSING"}
        if scope.tenant not in source.tenants or source.revision != scope.revision:
            return {"kind": "INVALID_EVIDENCE", "code": "READBACK_SCOPE"}
        if sha(source.text) != source.source_hash or source.source_hash != chunk.source_hash:
            return {"kind": "INVALID_EVIDENCE", "code": "SOURCE_HASH"}
        lines = source.text.splitlines(keepends=True)
        if not (1 <= chunk.start_line <= chunk.end_line <= len(lines)):
            return {"kind": "INVALID_EVIDENCE", "code": "LINE_RANGE"}
        readback = "".join(lines[chunk.start_line - 1:chunk.end_line])
        if readback != chunk.text or sha(readback) != chunk.chunk_hash:
            return {"kind": "INVALID_EVIDENCE", "code": "CHUNK_HASH"}
        selected.append(chunk)
    return {"kind": "PACKAGE", "index_snapshot_id": scope.index_snapshot_id,
            "query": query, "revision": scope.revision, "chunks": selected,
            "known_conflicts": known_conflicts,
            "retrieval_status": "HITS" if selected else "NO_HITS"}

def judge_claim(package, subject, predicate, proposed_value, cited_ids):
    if package["kind"] != "PACKAGE":
        return {"kind": "UNDETERMINED", "reason": "PACKAGE_INVALID"}
    by_id = {c.chunk_id: c for c in package["chunks"]}
    if not cited_ids or any(x not in by_id for x in cited_ids):
        return {"kind": "UNSUPPORTED", "reason": "CITATION_NOT_IN_PACKAGE"}
    fact_id = (subject, predicate)
    if fact_id in package["known_conflicts"]:
        return {"kind": "CONFLICT", "values": package["known_conflicts"][fact_id]}
    # 冲突扫描包含整个包，避免回答者挑一个有利引用掩盖另一块。
    values = {value for c in package["chunks"] for obj, pred, value in c.facts
              if (obj, pred) == fact_id}
    if len(values) > 1:
        return {"kind": "CONFLICT", "values": sorted(values)}
    cited_values = {value for x in cited_ids for obj, pred, value in by_id[x].facts
                    if (obj, pred) == fact_id}
    if proposed_value in cited_values:
        return {"kind": "SUPPORTED", "scope": "NORMALIZED_FIXTURE_FACT_ONLY"}
    return {"kind": "UNSUPPORTED", "reason": "FACT_NOT_SUPPORTED"}

def fixture():
    source_text = "def refund(days):\n    return days < 7\n"
    report_text = "test_refund_day_7: days=7; expected=True; actual=False\n"
    source = SourceDocument("repo@8e12:src/refund.py", "repo@8e12",
                            frozenset({"tenant-dev"}), source_text, sha(source_text))
    report = SourceDocument("test-report-71", "repo@8e12",
                            frozenset({"tenant-dev"}), report_text, sha(report_text))
    chunks = [
        Chunk("repo@8e12:src/refund.py:1-2", source.source_id, source.revision,
              1, 2, source_text, sha(source_text), source.source_hash, source.tenants,
              (("repo@8e12:src/refund.py:refund", "comparison", "days < 7"),)),
        Chunk("report-71:failure-1", report.source_id, report.revision,
              1, 1, report_text, sha(report_text), report.source_hash, report.tenants,
              (("report-71:failure-1@days=7", "actual", "False"),
               ("report-71:failure-1@days=7", "expected", "True"))),
    ]
    snapshot = IndexSnapshot(snapshot_id(chunks), tuple(chunks))
    return snapshot, {source.source_id: source, report.source_id: report}

if __name__ == "__main__":
    snapshot, sources = fixture()
    scope = QueryScope("tenant-dev", "repo@8e12", snapshot.snapshot_id)
    package = retrieve("test_refund_day_7 refund", scope, snapshot, sources)
    print(package["retrieval_status"])
    print(judge_claim(package, "report-71:failure-1@days=7", "actual", "False",
                      ["report-71:failure-1"]))
    print(judge_claim(package, "refund_rule:unconfirmed_scope", "comparison", "days <= 7",
                      ["repo@8e12:src/refund.py:1-2"]))
