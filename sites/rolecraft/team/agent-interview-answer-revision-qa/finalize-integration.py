"""Write QA records only; never modifies answers or application code."""
from pathlib import Path
import json, hashlib
from datetime import datetime
from zoneinfo import ZoneInfo

root = Path.cwd()
out = root / 'sites/rolecraft/team/agent-interview-answer-revision-qa'
now = datetime.now(ZoneInfo('Asia/Shanghai')).isoformat()
def read(rel): return json.loads((root / rel).read_text())
def write(name, value): (out / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def binding(rel):
    p = root / rel
    return {'path': rel, 'bytes': p.stat().st_size, 'sha256': sha(p)}

baseline = read('sites/rolecraft/team/agent-interview-answer-revision-qa/baseline.json')
rows = []
for item in baseline['files']:
    p = root / item['path']
    current = sha(p) if p.exists() else None
    rows.append({**item, 'currentSha256': current, 'unchanged': current == item['sha256']})
changed = [r for r in rows if not r['unchanged']]
assert {r['path'] for r in changed} == {'sites/rolecraft/dist/index.html','sites/rolecraft/dist/interview-prep-v1-prototype.html','sites/rolecraft/dist/learning-experience-v13.js'}
assert all(r['category'] == 'active_app_observation_concurrent_changes_allowed' for r in changed)
write('integration-protection-check.json', {'checkedAt': now,'status':'met_within_scoped_protection','counts':{'total':172,'unchanged':169,'authorizedActiveClientChanges':3,'frozenTextbookUnchanged':52,'historicalAuditUnchanged':88,'qualityContractAndMemoryUnchanged':6,'otherActiveClientUnchanged':23},'files':rows,'interpretation':'Three explicitly authorized current client integrations changed. Other chat client work is preserved in the received engineering snapshot; no rollback or claim of a globally frozen client. PM administrative files are outside this 172-file set. No user database or real browser storage was read.'})

before = read('sites/rolecraft/team/agent-interview-answer-revision-qa/integration-data/received-binding.json')
write('integration-link01-first-failure.json',{
 'defectId':'REV-QA-LINK-01','discoveryStatus':'not_met','immutableDiscoveryRecord':True,
 'sourceBindings':[x for x in before['files'] if x['path'].endswith(('interview-answers-v1-data.js','interview-answer-renderer.js'))],
 'actual':'Different labels for separate sections of the same textbook file all selected the first file-level sourceLinks entry.',
 'impact':{'localOccurrences':372,'wrongTargets':118,'affectedAnswers':62},
 'browserOriginal':{'page':'http://127.0.0.1:4464/interview-prep-v1-prototype.html','answer':'P02','label':'10.3 最关键的崩溃窗口 工单创建成功 结果尚未提交','expected':'index.html#learn/agent/c01-control-loop/s-8261016926be','actual':'index.html#learn/agent/c01-control-loop/s-717cb810447d','observedFocus':'6 先核对未决动作 再让模型继续'},
 'additionalOriginals':[{'label':'2 控制权在运行时 聊天上下文只是一种投影','expectedSection':'s-81f9aaeecb60','actualSection':'s-717cb810447d'},{'label':'三个提交点定义可恢复事实','expectedSection':'s-c2209725ec11','actualSection':'s-2cd345377707'}],
 'evidence':['integration-data/assessment.md','integration-data/link-label-result.json'],
 'laterStatusLocation':'integration-report.json#/defects'
})

titles=['Agent 与普通模型调用有什么区别？','工具调用超时，如何避免恢复时重复执行？','如何组织 Agent 的上下文和长期记忆？','如何说明你为什么选择 RAG，而不是微调？','介绍一个你做过的 Agent 项目，如何证明它有效？','模型返回的 JSON 合法，为什么还不能直接执行？','如何评估一个 Agent 的改进是否真的有效？','检索资料里出现要求执行工具的指令，你怎么处理？','服务中断后，Agent 如何恢复到可靠的执行位置？','项目成本增加时，你会如何定位并优化？']
ui = {
 'recordedAt':now,'channel':'Official CUA native Google Chrome accessibility tree and screenshots',
 'environment':{'browser':'Google Chrome on macOS, QA-created incognito window','applicationOrigin':'http://127.0.0.1:4464','fixtureOrigin':'http://127.0.0.1:4465','viewport':'Desktop plus DevTools Responsive width 390 CSS px, height 1055','storage':'New isolated origins in a QA-created incognito window; no actual user database or storage inspection'},
 'currentBindings': [binding('sites/rolecraft/dist/'+f) for f in ['interview-answers-v1-data.js','interview-answer-renderer.js','interview-answer-reader.css','index.html','learning-experience-v13.js','interview-prep-v1-prototype.html']],
 'prototypeItems':[{'id':f'P{i+1:02d}','question':title,'openedCurrentFullReference':True,'referenceHeadingAndLastSourceVisibleInAX':True,'collapseHidesFullReference':True,'status':'pass'} for i,title in enumerate(titles)],
 'prototypeMethod':'Hard reload current data/renderer. Current original prototype plan was used; temporary local 60-minute plan exposed P01-P09 on day1 and P10 on day2. Every question was opened, complete article and final source were read from AX, and collapsed. No answer, rating, account or database was saved. Refresh returns the prototype to its predefined initial example state, consistent with existing in-memory prototype.',
 'sourceClicks':[
  {'answer':'P02','label':'10.3 最关键的崩溃窗口 工单创建成功 结果尚未提交','target':'#learn/agent/c01-control-loop/s-8261016926be','actualFocusedHeading':'10.3 最关键的崩溃窗口 工单创建成功 结果尚未提交','refreshRetainsHeading':True,'status':'pass'},
  {'answer':'P02','label':'三个提交点定义可恢复事实','target':'#learn/agent/e01/s-c2209725ec11','actualFocusedHeading':'三个提交点定义可恢复事实','status':'pass'},
  {'answer':'P02','label':'2 控制权在运行时 聊天上下文只是一种投影','target':'#learn/agent/c01-control-loop/s-81f9aaeecb60','actualFocusedHeading':'2 控制权在运行时 聊天上下文只是一种投影','status':'pass'}],
 'visualSamples':[
  {'id':'P02','surface':'actual prototype','width':390,'observation':'Five-row recovery fact/action table visually fits and wraps within the reference card; surrounding mechanism, trace and sources remain readable. Screenshot inspected in CUA transcript.','status':'pass'},
  {'id':'P06','surface':'actual prototype','width':390,'observation':'Reference article and JSON code block visibly render inside the mobile card; final followups and source section present.','status':'pass'},
  {'id':'M101','surface':'static QA fixture of current internal evidenceHTML','width':390,'observation':'Current full Python block has preserved indentation and horizontal overflow contained in its focusable pre. Right arrow scrolling visibly moves the long code horizontally without widening the whole page; subsequent paragraph and old textbook excerpts remain present.','status':'pass'},
  {'id':'M103','surface':'static QA fixture of current internal evidenceHTML','width':390,'observation':'LRU full Python block, sources and original textbook analysis are present in browser AX. This sample was not a separate full visual layout audit.','status':'pass'},
  {'id':'Q99','surface':'static QA fixture of current internal evidenceHTML','observation':'Current v1.0.1 hash 5b98c7767017e76814c043904227829698d411af87070fce6123da8da8aed5a0 appears in expanded review details; constructed example and personal-experience warning remain; complete analysis precedes the original textbook excerpt.','status':'pass'}],
 'deferredRoutes':[{'url':f'http://127.0.0.1:4464/index.html#{r}','visible':'该模块将在后续开放','completeAnswerAbsent':True,'status':'pass'} for r in ['questions','review','check']],
 'fixtureProvenance':'build-browser-fixture.cjs loads current public scripts in isolated Node VM, exposes evidenceHTML in memory only, and creates static snapshots. It is not a product route. 124 snapshots generated; actual browser samples Q99/M101/M103, not all 124.',
 'cleanup':{'incognitoWindowCloseIssued':True,'servers':[{'port':4464,'session':78179,'stop':'SIGINT','exitCode':0},{'port':4465,'session':85782,'stop':'SIGINT','exitCode':0}]},
 'limitations':['No attached browser extension was available; official native CUA was used successfully.','Screenshots were inspected in the tool transcript, not saved as separate PNG files.','400 links were checked from rendered HTML in isolated VM; only the three documented P02 source links were actually clicked in the browser.','Static server API/auth configuration endpoints return 404, as expected for this isolated static-only test. No real backend/auth/model/service validation or production claim.','No real user learning, interview performance or human expert assessment.']
}
write('browser-observations.json',ui)

approval=read('sites/rolecraft/team/agent-interview-answer-revision-qa/content-approval.json')
manifest=read('sites/rolecraft/textbooks/interview-answers-v1/manifest.json')
answers=[]
for item in approval['items']:
    m=next(m for m in manifest['items'] if m['id']==item['id'])
    assert sha(root/m['answerPath']) == item['answerSha256']
    answers.append({**item,'answerPath':m['answerPath'],'displayVMStatus':'pass','browserSample':item['id'].startswith('P') or item['id'] in ['Q99','M101','M103']})
report={
 'version':'agent-interview-answer-revision-integration-qa-final-1','checkedAt':now,'status':'met_within_tested_scope',
 'scope':'124 current reference answers, independent content QA and finite examples, derived data and bounded local presentation integration. Not full professional, market, user or production certification.',
 'answerSetSha256':manifest['answerSetSha256'],'counts':{'answers':124,'fixed':100,'market':14,'prototype':10,'contentApproved':124,'renderedVM':124,'actualBrowserPrototypeQuestions':10,'actualBrowserInternalFixtureSamples':3,'localLinkOccurrences':372,'externalLinkOccurrences':28,'originalWrongLinksReverified':118,'tables':22,'codeBlocks':13,'oldTextbookExcerpts':327,'prototypeFollowups':20},
 'items':answers,
 'defects':[{'id':'REV-QA-Q99-01','firstStatus':'not_met','currentStatus':'closed_after_author_revision_and_independent_retest','evidence':'retest-q99.json','retainedFirstRecord':'defects.json'}, {'id':'REV-QA-LINK-01','firstStatus':'not_met','currentStatus':'closed_after_data_frontend_revision_and_independent_retest','evidence':['integration-data/assessment-r2.json','browser-observations.json'],'retainedFirstRecord':'integration-link01-first-failure.json'}],
 'evidence':{'currentContent':'content-approval.json','semanticFirstRound':'content-round1.json','q99Retest':'retest-q99.json','codeExecution':'execution/code-results.json','independentCounterexamples':'execution/independent-results.json','integrationVM':'integration-data/assessment-r2.json','integrationVMFinalBinding':'integration-data/r2/final-binding.json','actualBrowser':'browser-observations.json','protection':'integration-protection-check.json'},
 'deliverySurface':{'all124':'sites/rolecraft/textbooks/interview-answers-v1/README.md and agent-interview-answers.md','prototype10':'sites/rolecraft/dist/interview-prep-v1-prototype.html','internal114':'Current evidenceHTML integration tested only in isolated fixture because product questions/review/check remain deferred'},
 'protectionSummary':{'protectedOrObserved':172,'unchanged':169,'authorizedActiveClientChanges':3,'frozenAndHistoricalAndContractChanges':0},
 'fullProductStatus':'not_met','limits':['Independent AI content review is not a human expert sign-off.','Actual code execution is confined to the documented current Python examples and deterministic counterexamples; no re-run of unchanged old curriculum code.','400 rendered links checked in VM, 3 P02 browser clicks; 10 prototype browser articles and 3 internal fixture samples, not 124 full visual audits.','No real API/model call, backend/account/database acceptance or publication.','Q10/Q99/P05 remain dependent on the learner’s true personal experience; no invented evidence or guarantee of interview/employment outcomes.','Eight original product gates, real user value, professional ability, industry advantage and production economics retain their own unresolved evidence.']
}
write('integration-report.json',report)
(out/'integration-report.md').write_text('''# Agent 124题返修：独立QA最终结果

结论：**`met_within_tested_scope`**。124题当前完整解析均已逐题独立内容核验；新数据及本地阅读展示在下述实际范围通过。完整培养、真实用户效果、真人专家、行业先进和生产交付仍为 **`not_met`**，不得从本轮通过推导。

## 当前交付与版本

可交付阅读入口为 `textbooks/interview-answers-v1/README.md` 与 `agent-interview-answers.md`，覆盖Q1–Q100、M101–M114、P01–P10。十题原型已经接入完整解析；内部114题参考解析已整合，但公共题库、复习、检验入口按产品约定仍延期。QA静态夹具是测试证据，不是另开产品功能。

答案集SHA256：`2cd40dcca5342944ab7c0c7836e759054dc3b5d4aaf992508f78d9172473b61a`。当前数据SHA256：`4a9e3ce4f5067e77b26bdd551bed911a6efadb9fe905de206876f03c773dad7b`；渲染器SHA256：`27c67c8ffa3e16249f96fea34880c405ee786424d0eec4a82f2f78f71c3e069a`；manifest SHA256：`e3bb9ecf56c525b57019af129a96159d258a21a1768c382ef536eb4430614fe5`。

## 实际独立核验

全部124题已读完整正文并核机制、因果、步骤、案例、边界、验证和来源，不按字数或字段给通过。第一轮123通过、Q99来源缺口失败保留；作者补直接来源后，原例独立复验关闭，另外123题字节未改。每题当前版本、hash和结果见 `content-approval.json`、`retest-q99.json` 和本报告JSON的items。7个当前Python围栏、7组原函数/算例和6组独立规格夹具的实际执行见原执行证据，未因展示集成重复跑未改内容。

隔离Node24.16 VM对124题共412,402字节、1,899非空行及22表/13代码块核保真；原327教材摘录、20原型追问和来源报告绑定保留。全部372本地链接与28外链按每次出现标签核实际生成HTML目标，均通过。详细结果见 `integration-data/assessment-r2.md/.json`。同标签不同目标、缺标签、未知标签、危险协议、HTML转义和未审核正文拒绝等反例已运行。

## 失败与复验

`REV-QA-LINK-01` 首轮发现同一文件的不同小节被错误地都映射到首个小节，372本地链接中118处错误，涉及62题。首轮数据/渲染器hash、P02实际点击错误和全量失败保留在 `integration-link01-first-failure.json` 与 `integration-data/assessment.md`；QA未修改程序。原数据和前端责任人修复后，118原例和其余全部引用独立复验通过。

真实Chrome无痕窗口中，P02“10.3最关键崩溃窗口”“2控制权”“三个提交点”已分别实际点击，URL及聚焦标题均为对应小节；10.3链接刷新后仍聚焦该节。不是只检查href或开发自查。首轮失败没有被覆盖。

## 浏览器覆盖与边界

使用官方CUA原生Chrome通道，QA自建隔离本地静态源4464/4465。P01–P10逐题打开当前完整解析、核末尾出处、再收起，均通过；临时60分钟原型计划用于访问十题，无真实用户记录。P02在390 CSS像素宽度下实际查看五行状态表，换行正常；P06代码/正文也作窄屏查看。Q99、M101、M103通过当前内部evidenceHTML的隔离静态快照在浏览器检查完整解析＋旧摘录；Q99版本hash及个人经历警示正常，M101长代码实际键盘横向滚动可见，缩进未损。M103为AX内容样本，并非另一次全面视觉审核。

真实打开主页面 `#questions`、`#review`、`#check` 均显示“该模块将在后续开放”，没有展示完整题解。内部114题函数只在隔离VM中暴露，未更改产品路由。400次引用是全量VM核对，实际点击限上面的3处；实际浏览器没有做124题全量视觉审核。截图已在CUA工具记录中目视检查，没有声称另存PNG证据。

原型刷新仍回到既有预置状态；未承诺新的练习持久恢复。静态服务的认证/配置请求404属于此隔离环境，没有连接真实后端，不据此签账号或生成服务通过。测试没有访问用户数据库或检查真实浏览器存储。两台QA临时静态服务均SIGINT退出0，QA无痕窗口关闭操作已发出，用户原服务未停止。

## 保护与后续结论

172命名起点中169一致；52冻结教材、88历史报告、6质量/记忆合同全部一致。3个授权活动客户端文件index、experience、prototype变更单列，不称客户端全不变；其余23活动观察文件一致。工程收到状态中的并行账户入口保留，QA不回滚、不为其额外签认证功能通过。PM后续行政记录不在这172项内。

本轮两个QA缺陷已按作者/工程返修与独立原例复验关闭，当前范围无开放阻断。真实学习、个人项目证据、行业专家、行业比较和生产经济性仍需原责任领域获得真实证据；该边界没有因全部题解返修完成而降低。最终精确文件绑定见 `final-binding.json`，本报告不是整套产品重新通过。
''')

final_files = {x['path'] for x in read('sites/rolecraft/team/agent-interview-answer-revision-qa/integration-data/r2/received-binding.json')['files']}
final_files.update(x['answerPath'] for x in manifest['items'])
final_files.update('sites/rolecraft/textbooks/interview-answers-v1/'+x for x in ['author-a.json','author-b.json','author-c.json'])
final_files.update('sites/rolecraft/team/agent-interview-answer-revision-qa/'+x for x in ['integration-report.md','integration-report.json','browser-observations.json','integration-protection-check.json','integration-link01-first-failure.json','content-round1.json','content-approval.json','retest-q99.json','execution/code-results.json','execution/independent-results.json','integration-data/assessment.md','integration-data/assessment-r2.md','integration-data/assessment-r2.json','integration-data/r2/final-binding.json','build-browser-fixture.cjs','browser-fixture/fixture-binding.json'])
write('final-binding.json',{'createdAt':now,'status':'met_within_tested_scope','answerSetSha256':manifest['answerSetSha256'],'files':[binding(x) for x in sorted(final_files)]})
print(json.dumps({'status':report['status'],'items':len(answers),'boundFiles':len(final_files),'protectionChanged':len(changed)},ensure_ascii=False))
