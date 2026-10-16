from pathlib import Path
import json,hashlib,copy
b=Path("sites/rolecraft");o=b/"team/agent-interview-answer-revision-content-b"
first=json.loads((b/"team/agent-interview-answer-revision-content-b.json").read_text())
received=json.loads((o/"received-bindings.json").read_text())
manifest_path=b/"textbooks/interview-answers-v1/author-c.json"
m=json.loads(manifest_path.read_text());q=next(x for x in m["items"] if x["id"]=="Q99")
answer_path=b/"textbooks/interview-answers-v1/answers/Q99.md"
current_sha=hashlib.sha256(answer_path.read_bytes()).hexdigest()
assert current_sha==q["answerSha256"]=="5b98c7767017e76814c043904227829698d411af87070fce6123da8da8aed5a0"
assert q["answerVersion"]=="interview-answers-v1.0.1"
old_q=next(x for x in received if x["id"]=="Q99")
assert old_q["manifest"]["sourceBindings"]==q["sourceBindings"][:8]
changed=[]
for r in received:
 if r["id"]!="Q99" and hashlib.sha256(Path(r["path"]).read_bytes()).hexdigest()!=r["sha256"]:changed.append(r["id"])
assert not changed,changed
expected_first="34cc6530fed6361f2654b27304a05ef9e801ce238d4b68e8e76e5956f750a4fb"
assert hashlib.sha256((b/"team/agent-interview-answer-revision-content-b.json").read_bytes()).hexdigest()==expected_first
new_source_checks=[]
support=[
"c03第18/24/77/79行直接支持逻辑意图、物理尝试与模型调用关联分离、唯一槽位、稳定参数指纹和并发唯一约束。",
"e01第10–14行分别定义意图、发送前尝试和结果提交；第16行明确本地事务不包含网络发送。",
"控制循环第247–254行支持成功且指纹一致才采纳、处理中等待、暂空/超时仍未知与无效果证明要求。",
"控制循环第700–706行支持lease_epoch限制本地提交、旧回执由当前者核对、远端旧请求须另受下游合同约束。",
"c03第172–176行支持结果归约、同键同参/异参、下游去重与实际效果原子关联，以及保留期和错误语义限制。",
"控制循环第753–766行展开外部已成功本地未存、新键重放风险、原键核对及本地事件去重和外部效果去重的区别。"
]
for s,explanation in zip(q["sourceBindings"][8:],support):
 p=Path(s["path"]);raw=p.read_bytes();actual=hashlib.sha256(raw).hexdigest();ls=raw.decode().splitlines()
 assert actual==s["sha256"]
 assert 0<s["startLine"]<=s["endLine"]<=len(ls)
 new_source_checks.append({**s,"actualSha256":actual,"status":"supports_current_claim","reviewReason":explanation,"method":"实际完整读取给定行范围，静态判断其是否支持当前第9/11/13行主张"})
criteria=copy.deepcopy(next(x for x in first["items"] if x["id"]=="Q99")["criteria"])
locations={1:[5,5],2:[9,11],3:[7,13],4:[9,13],5:[5,15],6:[7,13],7:[9,38],8:[1,38]}
for i,c in enumerate(criteria,1):
 c["status"]="pass"
 c["evidenceLocation"]=str(answer_path)
 c["evidenceLineRange"]=locations[i]
 if i==7:
  c["reason"]="新增六项直接机制来源与正文第9/11行紧邻引用逐条匹配；原八项来源保留，来源哈希/行范围和作者manifest一致。未把教材自引扩张成真实下游合同已验。"
  c["sourceBindings"]=q["sourceBindings"]
  c.pop("externalCheckReference",None)
 if i==8:c["reason"]="保留完整题面、真实经历/教学虚构边界、时间线、修复与验证顺序；新增引用服务于邻近论证，未遮盖原例或删掉限制。"
final_bindings=[]
for r in received:
 if r["id"]=="Q99":
  final_bindings.append({"id":"Q99","answerPath":str(answer_path),"answerVersion":q["answerVersion"],"answerSha256":current_sha,"status":"met_within_reviewed_scope","reviewReference":str(o/"retest-q99.json")})
 else:
  final_bindings.append({"id":r["id"],"answerPath":r["path"],"answerVersion":r["manifest"]["answerVersion"],"answerSha256":r["sha256"],"status":"met_within_reviewed_scope","reviewReference":str(b/"team/agent-interview-answer-revision-content-b.json"),"bindingRechecked":"unchanged_since_independent_first_review"})
report={
"schemaVersion":1,"version":"agent-interview-answer-revision-content-b-retest-q99-1",
"date":"2026-10-14 Asia/Shanghai","reviewer":"原独立内容审校员B，未参与作者返修",
"scope":"RCB-Q99-07 / REV-QA-Q99-01来源缺口的原例和受影响全文静态复验；合并其余61题不变绑定",
"status":"met_within_reviewed_scope",
"id":"Q99","question":q["question"],"answerPath":str(answer_path),"answerVersion":q["answerVersion"],"answerSha256":current_sha,
"prior":{"answerVersion":old_q["manifest"]["answerVersion"],"answerSha256":old_q["sha256"],"status":"not_met","report":str(b/"team/agent-interview-answer-revision-content-b.json"),"reportSha256":expected_first,"defectId":"RCB-Q99-07","historyPreserved":True},
"defectRetest":{"id":"RCB-Q99-07","relatedQaId":"REV-QA-Q99-01","originalFinding":"核心恢复机制仅引用作品/评测/观测/问题发现，缺直接机制来源。",
"authorChange":"第9行补故障窗口引用，第11行补稳定身份、提交点、查询、lease及下游去重直接引用；原八项来源保留并新增六项sourceBindings。",
"independentResult":"closed_in_content_review_scope","why":"六项实际来源均直接说明当前相应机制，读者可从邻近引用追溯；旧事实/虚构边界及实际运行限制不变。",
"behaviorClaim":"未因此断言任何真实下游或代码已执行；本轮是文稿来源复验。"},
"criteria":criteria,
"sourceChecks":new_source_checks,
"integrity":{"currentAuthorManifestPath":str(manifest_path),"currentAuthorManifestSha256":hashlib.sha256(manifest_path.read_bytes()).hexdigest(),"answerAndManifestHashMatch":True,"originalEightSourceBindingsPreserved":True,"other61AnswersUnchanged":True,"other61ChangedIds":changed,"initialReportUnchanged":True},
"finalScope":{"total":62,"counts":{"metWithinReviewedScope":62,"notMet":0,"insufficient":0},"collections":{"fixed100":{"total":38,"metWithinReviewedScope":38},"market14":{"total":14,"metWithinReviewedScope":14},"prototype10":{"total":10,"metWithinReviewedScope":10}},"basis":"61题采用已独立审读且字节/版本不变的原结论，Q99采用本次新版本全文及来源复验；不继承历史教材或旧19题状态。","bindings":final_bindings},
"execution":{"applicationRuns":0,"textbookExampleRuns":0,"codeRuns":0,"modelCalls":0,"externalBusinessCalls":0},
"limits":["仅本岗当前静态内容审查范围；独立QA、代码有限执行、界面完整呈现须由测试岗位判断。","Q99为真实经历答题框架及明确虚构示例，真实个人经历由学习者提供。","真人专家、真实学习/用户效果、职业胜任、行业先进与生产证据未由本报告获得，完整产品仍not_met。"],
"writes":"仅本岗原前缀下复验报告和当前收到稿快照；初审与旧received不改。"
}
retest_dir=o/"retest-q99-received";retest_dir.mkdir(exist_ok=True)
(retest_dir/"Q99.md").write_bytes(answer_path.read_bytes())
(retest_dir/"author-c.json").write_bytes(manifest_path.read_bytes())
jp=o/"retest-q99.json";assert not jp.exists();jp.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")
md=["# Q99来源返修独立复验","","结论：Q99当前interview-answers-v1.0.1在静态内容审查范围内通过，RCB-Q99-07已按原引用缺口关闭。其余61题字节哈希与原独立审读版本一致，本岗62题现均为met_within_reviewed_scope。","","当前Q99 SHA256："+current_sha+"。","","复验实际重读Q99全文、第9/11行邻近引用和新增六项来源：","","|来源|实际支持的主张|","|---|---|"]
for s in new_source_checks:md.append("|"+s["path"]+":"+str(s["startLine"])+"–"+str(s["endLine"])+"|"+s["reviewReason"]+"|")
md+=["","原八项来源未替换；题意、真实经历/虚构边界和未执行限制保持。未凭作者自查通过，也未将教材来源绑定当真实下游合同验证。","","[机器可消费复验记录及62题当前绑定](retest-q99.json)。[初轮记录](../agent-interview-answer-revision-content-b.json)保留Q99的not_met；旧收到稿不变。","","本轮代码、应用、模型和外部业务运行均为0。独立QA及应用展示仍由测试岗位验收；真实学习效果、专家、职业与行业先进目标未由此通过，完整产品仍not_met。"]
(o/"retest-q99.md").write_text("\n".join(md)+"\n")
print(json.dumps({"report":str(jp),"reportSha256":hashlib.sha256(jp.read_bytes()).hexdigest(),"q99Status":report["status"],"answerVersion":q["answerVersion"],"answerSha256":current_sha,"finalCounts":report["finalScope"]["counts"],"other61Changed":changed},ensure_ascii=False))

