# 检索结果怎样成为证据：版本、权限、召回与主张支持

检索命中只表示某片段与查询相关。要成为回答依据，片段还须属于当前可读范围、适用版本和本轮快照，引用能读回同一内容，并且实际支持相邻主张。相似度、引用编号和模型信心都不能替代这条证据链。证据不足时应停止在不足；同级来源冲突时应暴露冲突，而不是选择更方便的结论。

本篇解决怎样从检索产出可追溯的证据包及有边界的回答。沿用 `repo@8e12/test-report-71`，可信租户为 `tenant-dev`。本轮对象、索引和标签均为教学设计。下方 Python 3.14 标准库最小实现未运行，外部嵌入服务和真实检索实验未配置。先修是 [模型候选](f02.md)：应能区分可解析、引用关联合法与事实已核实。

## 本次回答看到的是哪一个资料版本

摄取链应是“取得完整源文件→固定版本及哈希→按确定规则分块→带权限与来源入索引→发布索引快照”。新文件取得成功不等于新索引已发布；新索引发布也不等于当前正在进行的回答使用了它。查询开始时冻结 `index_snapshot_id`，证据包同时记录源版本和索引版本。更新完成的通知不能改写已经生成的请求历史。

每份源文档至少包含来源系统、对象 ID、修订、内容哈希、可信访问范围及生效区间。源代码以仓库修订确定版本；报告以报告 ID 和报告哈希确定版本；业务规则另有生效期和权威来源，不能用文件修改时间自动判定权威。`repo@8e12` 中的代码只证明该修订的实现，不证明“七天应退款”的真实业务规则。

块保留完整文件哈希、块哈希、行范围和可读主体。代码分块应尽量保留完整函数及其必要定义，测试记录保留输入、预期、实际同组事实。把 `return days < 7` 切到下一块，而只召回函数名，引用虽指向对的文件，却不能解释边界。更大块会增加输入、降低相似度的局部聚焦；更小块会丢前提，需要邻块扩展。选择应测必要证据是否进入上下文，不用统一块长代表所有资料。

权限范围由可信 `QueryScope` 派生，在检索前落实。应用不能把所有租户候选正文读到内存、传给重排器或模型后再删除越权项。对不能按对象权限过滤的索引，可选择租户隔离的索引或先取允许 ID 集合再检索；“有一个 metadata 字段”不证明实际过滤执行。OpenAI Retrieval 提供检索前 attribute filtering 与语义检索机制，这只是具体服务能力；身份来源与字段值正确性仍由应用负责。[OpenAI Retrieval：Attribute filtering](https://developers.openai.com/api/docs/guides/retrieval#attribute-filtering)

## 检索策略必须按查询类型比较

精确文件路径、报告 ID、测试名优先做字段定位或词法检索。它们的字符形式本来就是身份信息，语义相近的另一个测试不能替代。自然语言“为什么第七天边界失败”可能没有出现 `test_refund_day_7` 的词面，需要查询改写、语义召回或混合。语义召回依靠相同嵌入模型空间中的相似性，不代表事实为真，也不能用一个高分解除修订过滤。

词法排名可以从明确的词项统计发展为 BM25：它考虑词频饱和与文档长度归一化。下面为便于检查只用查询词交集计数，**没有把它称为 BM25**；需要真实 BM25 基线时按具体实现固定 tokenizer、参数和版本。[Stanford IR Book：Okapi BM25](https://nlp.stanford.edu/IR-book/html/htmledition/okapi-bm25-a-non-binary-model-1.html)

混合检索不宜直接相加来源不同尺度的原始分数。本篇用 reciprocal rank fusion（RRF）作为原创配置选择：每个候选按它在不同排序中的名次贡献 `1/(60+rank)`。常数60是本例参数，须实验验证；没有行业最优承诺。具体 OpenAI 检索服务也支持融合权重配置，本篇没有调用该服务，也不把自己的 Python 算法当成其内部实现。[OpenAI Retrieval：Ranking](https://developers.openai.com/api/docs/guides/retrieval#ranking)

重排只看已经召回的候选，不能给从未召回的块打分。因此同义查询失败时，先检查资料是否入库、是否被正确过滤、候选是否出现，再查重排和上下文裁剪。正确片段已入上下文而模型误读，则改生成或支持检查层；继续扩大索引不对应这个原因。

## 把关联检查与支持判断分别建模

一个引用可以通过“ID在包内、哈希与读回一致、位置有效”的关联检查，却仍不支持主张。`return days < 7` 支持“这个函数使用严格小于七的比较”，不独立支持“业务规则必须小于等于七”。报告支持“该报告中这项断言失败”，不证明修复后正确。

因此 `ClaimSupport` 至少分为：可确定支持、部分支持、不支持、冲突和未判断。任意自然语言蕴含难以完全确定验证，可用受约束评估器辅助，并交专业检查；本文最小代码只处理事先由可信数据解析得到的**规范事实键值**。标签不是作者对模型句子的自我肯定：真实资料接入时须交代解析器或独立标注的来源与误差。自由根因不得挤入这些事实键。

证据包中保留有序块、查询/范围/索引版本及拒绝原因；候选单独列原子主张。把“失败且根因已经确认且已创建工单”写成一句，只引用报告，会让部分支持被包装成整句成立。应拆成报告事实、根因假设、执行结果三个对象；工单效果来自动作回执，见 [写工具](c03.md)。

## 一个完整的过滤、排序、读回与事实支持链

以下代码可保存为 `c02_evidence.py`。嵌入向量为可选外部输入：须由相同 `embedding_version` 对查询和块编码、维度一致、非零且有限；代码实现余弦和融合，但**没有嵌入服务，不能通过它得到真实语义比较成绩**。默认示例只做词法检索。源对象存储是本地可信夹具；真实服务应按当前身份读回，不能凭缓存中有内容就忽略权限撤销。

```python
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
        for key, value in c.facts:
            fact_groups.setdefault(key, set()).add(value)
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

def judge_claim(package, fact_key, proposed_value, cited_ids):
    if package["kind"] != "PACKAGE":
        return {"kind": "UNDETERMINED", "reason": "PACKAGE_INVALID"}
    by_id = {c.chunk_id: c for c in package["chunks"]}
    if not cited_ids or any(x not in by_id for x in cited_ids):
        return {"kind": "UNSUPPORTED", "reason": "CITATION_NOT_IN_PACKAGE"}
    if fact_key in package["known_conflicts"]:
        return {"kind": "CONFLICT", "values": package["known_conflicts"][fact_key]}
    # 冲突扫描包含整个包，避免回答者挑一个有利引用掩盖另一块。
    values = {value for c in package["chunks"] for key, value in c.facts
              if key == fact_key}
    if len(values) > 1:
        return {"kind": "CONFLICT", "values": sorted(values)}
    cited_values = {value for x in cited_ids for key, value in by_id[x].facts
                    if key == fact_key}
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
              (("comparison", "days < 7"),)),
        Chunk("report-71:failure-1", report.source_id, report.revision,
              1, 1, report_text, sha(report_text), report.source_hash, report.tenants,
              (("actual", "False"), ("expected", "True"))),
    ]
    snapshot = IndexSnapshot(snapshot_id(chunks), tuple(chunks))
    return snapshot, {source.source_id: source, report.source_id: report}

if __name__ == "__main__":
    snapshot, sources = fixture()
    scope = QueryScope("tenant-dev", "repo@8e12", snapshot.snapshot_id)
    package = retrieve("test_refund_day_7 refund", scope, snapshot, sources)
    print(package["retrieval_status"])
    print(judge_claim(package, "actual", "False", ["report-71:failure-1"]))
    print(judge_claim(package, "business_rule", "days <= 7",
                      ["repo@8e12:src/refund.py:1-2"]))
```

预期为 `HITS`、规范报告事实 `SUPPORTED`、业务规则 `UNSUPPORTED`；实际结果为空。`IndexSnapshot` 的成员不可变，内容地址绑定全部检索/支持元数据；查询同时检查可信Scope里的ID和成员重新计算的ID，混入后发布块不能继续回显旧ID。可信摄取方提供这份快照，模型不能自行构造Scope或快照；哈希只检一致性，不授来源真实性。这里没有对任意中文问题自动判定支持，也没有完整生产索引。`SourceDocument` 与 `Chunk` 的权限和哈希在摄取时写入，读回再次检查；若真实存储更新，读回失败就停止使用该证据。

已知规范事实冲突在合法快照全集中、`top_k`之前检查，再随包交付。否则矛盾块排名低于截断点时会被隐藏。这个检查只涵盖当前已摄取、已规范化标签的事实组；未摄取来源、未标出的语义冲突和权限不可见资料仍未知。无已知冲突不能证明世界上没有冲突，真实任意主张还要补召回相关来源并作独立支持判断。

代码中的语义排序没有相关性阈值，向量可用时会返回候选，即使最高相似度也很低。这正是**不能用有命中代替有答案**的理由：只有后续支持检查可接受主张。若产品要减少低相关候选，应在验证集选阈值并记录召回损失；不能凭一个未校准数值认证无答案。

## 无答案应能解释是哪一层缺证

`NO_HITS` 只说明当前检索没有候选；原因可能是未摄取、索引未更新、版本过滤、查询词面不匹配或确实缺资料。对用户可说当前可用证据不足，并提供允许的补证路径；内部运维记录层级原因。没有权限时，不应通过“搜到了机密规则但不能给你”泄露受限对象存在性。本篇选择对外统一不足，内部仅在获准审计通道记录权限拒绝原因。

命中存在但支持缺失，应拆去不支持部分，而不是因为一个引用正确接受整段。两份报告同一断言有不同实际值，先核报告身份、修订和环境；若来自不同运行，保留条件区别；若声称同一不可变报告却内容哈希不同，标来源完整性冲突并调查。两份同级业务规则对边界矛盾，无法确定权威和生效期时请求责任方确认。模型挑一个、加多数投票或提高向量分数都没有产生权威。

缓存键包含身份范围版本、源修订、索引快照、查询处理配置与模型/嵌入版本。若仅按问题文本缓存，权限撤销后仍可能返回旧证据。缓存的安全性需要与当前授权相容，长期内容缓存不能当当前可读授权；正文中出现命令也不获得工具权限，见 [安全章节](e03.md)。

## 做一个能定位问题的检索比较

先冻结合法资料集合和查询集，再为每题独立标出必要支持块，包含精确测试名、自然语言同义、需要实现与报告共同支持、规则缺失和冲突题。词法与语义使用同样的权限/修订过滤、`top_k` 和上下文上限；否则较大候选集的收益会被误归于算法。真实向量输入必须记录嵌入模型、维度、查询改写和编码版本；手工向量只能测排序实现。

分别统计必要块召回、进入上下文的必要块、逐主张支持、错误可答与正确不足。报告按查询类型分组，不用总体平均掩盖精确编号被语义检索错替代。若两种召回都漏规则，问题可能是资料缺失；若混合召回了规则却裁掉例外，调整上下文组织。没有实际实验，就只保存比较设计与预期，不填提升百分比。

**练习：错版本引用。**给索引加入旧修订 `repo@7d00` 的同路径，并让它词法得分更高。参考分析：版本过滤在排序前移除它；如果新修订没入本快照，结果不足，不能回退“最新可用旧版”。交付过滤前元数据、过滤后合法ID、最终包和读回结果，普通日志不要记被拒正文。

**练习：部分支持与冲突。**候选写“该报告 actual=False，所以业务规定第七天不退款”。参考分析：第一部分由报告支持，第二部分无业务规则；拆成事实与待核假设。在独立 `case_id` 下加入同级规则冲突，令矛盾块落在 `top_k`之外，已知事实组仍应标冲突；未摄取的规则只能保留未知，不得宣称一致。新规则使用新来源 ID，不能改 `test-report-71` 的冻结事实。再把新成员塞进旧ID快照，预期 `SNAPSHOT_MISMATCH`；正确发布新ID不等于旧回答曾使用它。

**练习：实做两种策略。**先运行词法夹具，再接一个获准嵌入器实现 `encode(texts)->vectors`，其合同要求相同模型/版本、确定维度、逐输入顺序返回、失败时无假向量。冻结两个策略相同任务条件，记录实际必要块召回和引用支持；费用及权限未配置时语义比较保持未测。若中文词法查询无命中，先证明是本例 tokenizer 局限，再比较合适分词器或查询改写；不能拿故意不支持中文的基线证明语义策略行业先进。
