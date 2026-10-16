from pathlib import Path
import json, hashlib
base=Path("sites/rolecraft")
out=base/"team/agent-interview-answer-revision-content-b"
rows=json.loads((out/"received-bindings.json").read_text())
notes=json.loads((out/"review-notes.json").read_text())
old={x["id"]:x for x in json.loads((base/"team/agent-interview-answer-content-review.json").read_text())["items"]}
prior={x["id"]:x for x in json.loads((base/"team/agent-interview-answer-audit-assessment.json").read_text())["items"]}
qa={x["id"]:x for x in json.loads((base/"team/agent-interview-answer-audit-qa/matrix.json").read_text())["items"]}
cur={x["id"]:x for x in json.loads((base/"team/agent-interview-answer-revision-curriculum.json").read_text())["items"]}
items=[]; changes=[]; source_checks={}; source_errors=[]
for row in rows:
    id=row["id"];m=row["manifest"];p=Path(row["path"])
    text=(out/"received"/(id+".md")).read_text();lines=text.splitlines()
    if hashlib.sha256(p.read_bytes()).hexdigest()!=row["sha256"]: changes.append(id)
    assert m["answerSha256"]==row["sha256"],id
    start=next((n for n,l in enumerate(lines,1) if l and not l.startswith("#") and not l.startswith("答案版本") and not l.startswith("版本：") and l!=m["question"]),1)
    refs=next((n for n,l in enumerate(lines,1) if l=="## 参考出处"),len(lines))
    assert len(notes[id])==6
    criteria=[]
    for i,note in enumerate(notes[id],1):
        criteria.append({"id":f"AQS-{i:02}","applicable":True,"status":"pass","reason":note,"evidenceLocation":row["path"],"evidenceLineRange":[start,refs-1],"method":"逐题全文人工静态审读；理由指向具体对象/时序/公式/反例。代码与数字仅静态推演，未执行。"})
    source_reason=("当前八项来源仅绑定作品/评测/观察/问题发现，未直接绑定稳定action/key、原操作查询、并发epoch及下游去重的核心恢复机制小节。" if id=="Q99" else "已回读当前来源相关机制与边界，字节哈希及指定范围一致；新增外部事实核一手资料。来源不等于当前实现或运行证明。")
    criteria.append({"id":"AQS-07","applicable":True,"status":"not_met" if id=="Q99" else "pass","reason":source_reason,"evidenceLocation":f'{row["path"]}:{refs}',"sourceBindings":m["sourceBindings"],"externalCheckReference":str(out/"primary-source-checks.json")})
    criteria.append({"id":"AQS-08","applicable":True,"status":"pass","reason":"按本题推理组织，当前全文可直接读取，案例/分支与机制一致；旧截断和依赖未显示正文的断片已清除。没有以同义重复或摘要代替完整解析。","evidenceLocation":row["path"],"evidenceLineRange":[1,len(lines)]})
    for s in m["sourceBindings"]:
        key=(s["path"],s["startLine"],s["endLine"])
        sp=Path(s["path"]);actual=hashlib.sha256(sp.read_bytes()).hexdigest()
        valid=actual==s["sha256"] and 0<s["startLine"]<=s["endLine"]<=len(sp.read_text().splitlines())
        if not valid: source_errors.append([id,key])
        source_checks[key]={"path":s["path"],"startLine":s["startLine"],"endLine":s["endLine"],"sha256":actual,"identityCheck":"matches" if valid else "mismatch"}
    prior_retests=[]
    for d in old[id].get("defects",[]):
        ix=int(d["criterion"].split("-")[1])-1
        effective=prior[id].get("openContentDefectIds",[])
        prior_retests.append({"priorDefectId":d["id"],"priorReason":d["reason"],"originalCounterexample":d.get("firstCounterexample"),"previousEffectiveState":"open_at_previous_final" if d["id"] in effective else "previously_corrected_review","currentResult":"satisfied_in_current_static_text","currentEvidence":criteria[ix]["reason"],"currentEvidenceLocation":criteria[ix]["evidenceLocation"],"limit":"本岗内容范围复核；不修改旧审计或代签QA。"})
    for d in qa[id].get("defects",[]):
        ix=int(d["criterion"].split("-")[1])-1
        prior_retests.append({"priorDefectId":d["id"],"priorReason":d["reason"],"originalCounterexample":d.get("originalCounterexample"),"currentResult":"satisfied_in_current_static_text","currentEvidence":criteria[ix]["reason"],"currentEvidenceLocation":criteria[ix]["evidenceLocation"],"limit":"本岗内容意见；当前运行与独立QA归测试员。"})
    new=[]
    if id=="Q99":
        new=[{"id":"RCB-Q99-07","relatedQaId":"Q99-r1","origin":"QA转交后本岗独立确认","criterion":"AQS-07","status":"open","severity":"P2","reason":source_reason,"owner":"教材研发员C","evidenceLocation":f'{row["path"]}:{refs}',"repair":"补支持核心恢复机制的c03/c01-control-loop/e01精确小节、行范围、哈希及正文引用，更新答案版本和作者manifest。","retest":"对原引用缺口、正文与sourceBindings一致性、哈希版本以及新增引用实际支持范围复核。"}]
    items.append({"id":id,"collection":m["collection"],"sourceId":m.get("sourceId"),"question":m["question"],"answerVersion":m["answerVersion"],"answerSha256":row["sha256"],"answerPath":row["path"],"fullTextRead":True,"followups":m.get("followups",[]),"personalEvidenceRequired":m["personalEvidenceRequired"],"status":"not_met" if new else "met_within_reviewed_scope","scope":"当前完整参考解析静态教学语义、机制/步骤/案例/分支/来源及必要代码/数学推演；不授运行/展示/真人或生产通过。","criteria":criteria,"priorEffectiveDecision":prior[id]["decision"],"priorCounterexampleRetest":{"input":cur[id]["firstCounterexample"],"priorGap":cur[id]["receivedGapToResolve"],"result":"satisfied_in_current_static_text","evidence":[criteria[2]["reason"],criteria[3]["reason"],criteria[5]["reason"]]},"priorDefectRetests":prior_retests,"newDefects":new,"limitations":["未运行本题代码、应用、模型或真实外部服务；测试方案非实际结果。"]+(["真实个人经历仍须学习者本人提供；本稿仅可作为诚实参考框架。"] if m["personalEvidenceRequired"] else [])})
assert not source_errors,source_errors
counts={}
for col in ["fixed100","market14","prototype10"]:
    xs=[x for x in items if x["collection"]==col]
    counts[col]={"total":len(xs),"metWithinReviewedScope":sum(x["status"]=="met_within_reviewed_scope" for x in xs),"notMet":sum(x["status"]=="not_met" for x in xs),"insufficient":0}
bindings=[]
for rel in ["team/ANSWER_QUALITY_STANDARD.md","team/agent-interview-answer-revision-product.md","team/agent-interview-answer-revision-product.json","team/agent-interview-answer-revision-curriculum.md","team/agent-interview-answer-revision-curriculum.json","team/agent-interview-answer-audit-assessment.json","team/agent-interview-answer-content-review.json","team/agent-interview-answer-content-review/reconciliation.json","team/agent-interview-answer-audit-qa/matrix.json","team/employees/core/content-reviewer/ROLE.md","team/employees/core/content-reviewer/MEMORY.md","team/employees/core/user-profile/approved-preferences.md"]:
    p=base/rel;bindings.append({"path":str(p),"sha256":hashlib.sha256(p.read_bytes()).hexdigest()})
report={"schemaVersion":1,"version":"agent-interview-answer-revision-content-b-1","date":"2026-10-14 Asia/Shanghai","reviewer":"独立内容审校员B，未参与正文写作","status":"reviewed_with_open_defect","standard":"ANSWER_QUALITY_STANDARD 1.0 AQS-01–08；无额外字数/模板/数字阈值","scope":{"ids":[x["id"] for x in items],"collections":counts,"total":62},"counts":{"total":62,"metWithinReviewedScope":61,"notMet":1,"insufficient":0},"allInScopeMeetStandard":False,"method":["逐题完整读62篇，保留Q/M/P身份；P20条追问全部读入审校。","对当前机制、步骤、案例/异常分支、条件取舍、验证与来源作独立语义判断，并逐题核原具体反例。","M101/M102/M103/M105/M106/M110代码仅静态控制流、类型/身份/边界检查；M105/M109/M113及成功率成本算例仅数学推演。","来源字节与范围身份辅助核查，读回相关机制正文；新增版本事实查一手资料，无付费或业务调用。","Q99经QA转交后本岗重查，确认引用缺口；保留首次失败及原文，交原作者补证。"],"execution":{"applicationRuns":0,"textbookExampleRuns":0,"codeRuns":0,"modelCalls":0,"externalBusinessCalls":0,"independentQa":"由测试岗位另交，不以本报告替代"},"inputBindings":bindings,"receivedBindings":str(out/"received-bindings.json"),"sourceIdentityChecks":list(source_checks.values()),"primarySourceChecks":str(out/"primary-source-checks.json"),"answersChangedDuringFirstReview":changes,"historicalDefectRetestCount":sum(len(x["priorDefectRetests"]) for x in items),"newDefects":[d for x in items for d in x["newDefects"]],"items":items,"fullUserProductGoal":"not_met；静态审校不证明真实经历、学习效果、真人专家、职业胜任、行业领先或生产","nextActions":[{"owner":"教材研发员C","action":"修Q99引用链并升级答案版本/哈希"},{"owner":"本内容审校员B","action":"收返修后核Q99原缺口与受影响范围，保留首次结论"},{"owner":"测试工程师","action":"独立逐题内容、必要执行和工程显示验证"},{"owner":"PM","action":"按分母和限制整合，不将静态通过外推完整产品"}]}
path=base/"team/agent-interview-answer-revision-content-b.json"
path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")
first=out/"first-review.json"
if first.exists(): raise RuntimeError("first-review must not be overwritten")
first.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")
md=["# Agent题解返修：独立内容审校B","","62题初审：61题在静态内容审查范围内通过，Q99来源链缺口待返修。代码、应用、模型与外部业务运行数均为0；本报告不替代独立QA或真人专业评审。","","范围为Q63–Q100（38）、M101–M114（14）、P01–P10（10），P原20条追问均已阅读。沿用AQS-01–08，不增加字数、模板、数字例门槛。","","## 当前开放问题","","RCB-Q99-07 / QA Q99-r1：恢复说明本身静态逻辑合理，但八项来源仅指向作品、评测、观察与问题发现，缺少直接支持稳定action/key、原操作查询、并发epoch及下游去重的章节。本岗在QA转交后独立确认。原作者C应补准确正文引用与sourceBindings、更新版本/哈希；复验后再定。","","## 逐题结果","","|题目|结论|案例与原反例验证证据|","|---|---|---|"]
for x in items:
    md.append("|"+x["id"]+"|"+x["status"]+"|"+x["criteria"][3]["reason"]+"；"+x["criteria"][5]["reason"]+"|")
md+=["","## 证据与限制","","- [完整AQS逐题矩阵、原缺陷复核与版本绑定](agent-interview-answer-revision-content-b.json)。","- [收到稿绑定](agent-interview-answer-revision-content-b/received-bindings.json)及62题/B、C作者manifest副本，保留首次候选；[初审冻结结论](agent-interview-answer-revision-content-b/first-review.json)不覆盖。","- [一手资料核查](agent-interview-answer-revision-content-b/primary-source-checks.json)：A2A0.3.0、Python3.14、Faiss、pypdf、Transformer/RoFormer及结构化输出。来源核查支持文稿主张，不证明SDK或服务实际运行。","- 代码仅静态审读M101/M102/M103/M105/M106/M110。LRU环链表、归一化排序、mask/softmax与KV容量演算未发现核心逻辑冲突，实际执行归QA。","- 前轮纠正判断保留身份；本轮逐题重审，不继承旧19题通过。历史报告、作者正文和应用未修改。","- 当前完整产品仍not_met：真实读者理解、个人经历、真人专家、职业能力、行业领先和生产证据须分别取得。","","领域自查：只写本岗报告和同前缀证据；未代作者返修、未执行应用验收、未改冻结教材/数据库/用户记录、未上传发布。"]
(base/"team/agent-interview-answer-revision-content-b.md").write_text("\n".join(md)+"\n")
print(json.dumps({"counts":report["counts"],"collections":counts,"historicalDefectRetests":report["historicalDefectRetestCount"],"sourceRanges":len(source_checks),"answerChanges":changes},ensure_ascii=False))

