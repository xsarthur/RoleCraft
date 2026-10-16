"""Bind completed scoped QA to the current public deliverables. No textbook/application execution."""
from pathlib import Path
from datetime import datetime, timezone
import json, hashlib
ROOT=Path(__file__).resolve().parents[2]
H=Path(__file__).resolve().parent
OUT=H/'stage05-final'
sha=lambda b:hashlib.sha256(b).hexdigest()
load=lambda p:json.loads(p.read_text())
mechanics=load(H/'stage03-mechanics/integrity-and-links.json')
assert not mechanics['localLinkProblems'] and not mechanics['oldMissingOccurrences']
assert mechanics['bookFenceMultisetMatches']
assert all(all(r[k] for k in ['wrapperMatches','wholeBodyMatchesOnlyPermittedTransformation','allFencesUnchanged','authorSourceShaMatches','authorTransformedShaMatches']) for r in mechanics['assemblyBodies'])
review_path=ROOT/'team/textbook-v09-content-review.json'
review=load(review_path)
assert review['status']=='reviewed_with_limitations'
assert all(f['status']=='closed_static' for f in review['findings'])
bound=review['courseAndAuthorBindings']+review['unitReads']
for r in bound:assert sha(Path(r['path']).read_bytes())==r['sha256'],r['path']
for u in mechanics['units']:assert sha(Path(u['path']).read_bytes())==u['sha256'],u['path']
coverage=load(H/'stage04-coverage/actual-coverage.json')
assert (coverage['moduleCount'],coverage['objectiveCount'],coverage['knowledgePointCount'])==(12,24,48)
for k in coverage['knowledgePoints']:
    for l in k['locations']:
        p=Path(l['path']);assert sha(p.read_bytes())==l['sourceSha256']
        assert p.read_text().splitlines()[l['line']-1].lstrip('# ').strip()==l['heading']
execution=load(H/'stage02-foundation/execution.json')
assert execution['actualPythonVersion']=='3.14.5' and execution['currentCaseRecords']==14
assert all(r['actualExitCode']==r['expectedExitCode'] for r in execution['records'])
source=load(H/'stage02-foundation/source.json')
assert sha(Path(source['source']).read_bytes())==source['sourceSha256']
point=load(OUT/'protected-final-point.json')
gate_path=ROOT/'team/product-gates.json';definition=load(gate_path)
assert sha(gate_path.read_bytes())=='93ef8940281aa173324c581e2fb23366d22026ff2bf3883ff5d0fe93e958ec06'
details={
 'user_value':('insufficient','缺本版真实目标用户证据、预定义指标实际结果；教材问题档案只是教学要求。','产品经理、用户研究员','取得允许使用的真实问题观察/访谈，事前冻结指标及阈值，检查本版实际使用结果。','真实原始证据及本版任务/版本绑定，依原门槛判定。'),
 'teaching_quality':('insufficient','本版20篇入口、先修、专业论证/练习与24/48静态覆盖可追溯；AI审校与有限新例不替真人专业复核或学习试验。','课程架构师、内容审校员、实际行业专家','组织当前源版本的真人专业评阅及真实学习者试读/补学效果，按实际反例返修。','原量规和门槛不变；当前源、原意见、修订与独立复核/真实学习证据。'),
 'real_generation':('fail','当前独立书由教材研发代理编写；未形成真实学习档案关联生成服务/provider调用、动态资料/来源和失败恢复记录。','软件工程师（原门槛）、AI生成工程师','依另行授权范围实施真实生成服务及档案/来源/版本/失败交接。','真实调用与完整输入产物关联及失败恢复证据；本轮未调用/付费。'),
 'comparative_advantage':('insufficient','缺固定行业对象/版本、同场景样本/资源/评分的实际比较与专业判断，未宣称行业先进。','产品经理、竞品研究员','冻结真实可比基线、任务/资源/指标并取得实际结果。','原benchmark字段与预定条件完整，原始结果和专业评审可追溯。'),
 'learner_creation':('insufficient','没有本版真实学习者独立MVP、目标用户验证、未知任务及作品评阅；示例执行不代表学员作品。','课程架构师、实训评估员','按原量规取得真实独立作品与未知任务记录并评价。','非作者/非模拟学习者原作品、运行、用户验证和独立评阅。'),
 'reliable_delivery':('fail','程序接入暂停；当前候选网站/教材/服务尚无完整正式运行范围的集成生产交付，旧本地后端验证不授当版生产通过。','软件工程师及AI生成/后端数据工程岗位','在明确后续范围和授权后完成本版集成交付、隔离/持久化/故障恢复和版本验证。','当前集成版本/正式运行范围与独立隔离、恢复、版本证据，不用旧局部报告关闭。'),
 'operating_economics':('insufficient','无本版真实调用账目、实际耗时/负载/质量及维护结果；Decimal credit和费用下界只是教学演算。','产品经理、运营分析员','冻结预算及质量护栏，取得实际调用/维护账目并按全逻辑任务分母统计。','价格/账目/未知费用与完整任务、延迟、质量和责任数据绑定。'),
 'iteration_trace':('pass','仅本版文稿轨迹：3内容原例返修/静态复核、2锚点原例修复、长整数历史失败/当前归约及最终QA均有当前版本证据；非旧版iteration pass继承。','项目经理协调；作者返修；内容审校/QA独立复核','遇新增阅读或实际学习反例，保留原输入/源版本，交责任岗修复并按受影响部分复验。','当前文稿产物/门槛/证据/缺口/原因/责任/下一步/原例重核已记录；真人/学习/完整产品仍未授通过。')
}
gates=[]
for g in definition['gates']:
    status,gap,owners,action,retest=details[g['id']]
    gates.append({'id':g['id'],'label':g['label'],'required':g['required'],'criterionReference':str(gate_path)+'#'+g['id'],'originalGateOwner':g['owner'],'status':status,'actualCurrentEvidenceAndGap':gap,'domainOwners':owners,'nextAction':action,'retestConditions':retest,'retestResult':'current_document_iteration_only' if g['id']=='iteration_trace' else 'missing_real_evidence_not_retested_as_complete','notInheritedV08Pass':True})
assert any(g['required'] and g['status']=='fail' for g in gates)
documents=[ROOT/'team'/n for n in ['textbook-v09-spec.md','textbook-v09-manifest.json','textbook-v09-curriculum.md','textbook-v09-author.md','textbook-v09-author-assembly-manifest.json','textbook-v09-content-review.md','textbook-v09-content-review.json','TEXTBOOK_WRITING_STANDARD.md','product-gates.json']]+[ROOT/'textbooks/v09/README.md',ROOT/'textbooks/v09/agent-engineering-textbook.md']
document_bindings=[{'path':str(p),'sha256':sha(p.read_bytes())} for p in documents]
evidence_paths=[H/'baseline.json',H/'old-book-difference.json',H/'stage01-read/source-and-graph.json',H/'stage02-foundation/source.json',H/'stage02-foundation/execution.json',H/'stage03-mechanics/before-anchor-repair.json',H/'stage03-mechanics/integrity-and-links.json',H/'stage03-mechanics/read-to-candidate.diff',H/'stage04-coverage/actual-coverage.json',H/'stage04-coverage/pathway-review.json',H/'stage04-coverage/migration-context.json',H/'stage04-coverage/migration-manual-review.json',OUT/'protected-final-point.json',OUT/'execution-and-migration-binding.json']
evidence=[{'path':str(p),'sha256':sha(p.read_bytes())} for p in evidence_paths]
before=load(H/'stage03-mechanics/before-anchor-repair.json')
findings=[]
for unit,number in [('e02',1),('p02',2)]:
    original=next(r for r in before['localLinkProblems'] if r['source'].endswith('/'+unit+'.md'))
    current=next(r for r in mechanics['localLinks'] if r['source'].endswith('/'+unit+'.md') and r['label']==original['label'])
    assert current['ok'] and current['anchorExists']
    findings.append({'id':'QA09-0'+str(number),'status':'closed_original_example_recheck','source':original['source'],'line':original['line'],'originalAnchor':original['raw'],'originalSourceSha256':next(u['sha256'] for u in before['units'] if u['unitId']==unit),'currentAnchor':current['raw'],'currentSourceSha256':next(u['sha256'] for u in mechanics['units'] if u['unitId']==unit),'repairOwner':'教材研发员','QAChangedTextbook':False,'beforeEvidence':str(H/'stage03-mechanics/before-anchor-repair.json'),'currentEvidence':str(H/'stage03-mechanics/integrity-and-links.json'),'bothIndividualAndCompiledRechecked':True,'codeChanged':False,'unaffectedBehaviorNotRepeated':True})
result={'schemaVersion':1,'version':'textbook-v09-pathway','recordedAt':datetime.now(timezone.utc).isoformat(),'role':'测试工程师','status':'complete_for_current_document_scope','documentScopeStatus':'met_with_limitations','fullProductStatus':'not_met','scope':'Current20-unit learning entry, prerequisites, split migration and original capabilities, stages, source/assembly/navigation/links, selected new safe offline foundation paths and explicit protected file points; no website integration or real learning/industry certification.',
        'currentDocumentBindings':document_bindings,'current20Sources':[{'unitId':u['unitId'],'path':u['path'],'sha256':u['sha256']} for u in mechanics['units']],'authorReviewerQACurrentSourceAgreement':True,'evidence':evidence,
        'structureSummary':{'formalGraph':load(H/'stage01-read/source-and-graph.json')['graph'],'actualReadUnits':20,'originalModules':12,'originalObjectives':24,'originalKnowledgePoints':48,'actualSemanticCoverage':'See current SHA/heading/manual judgments in stage04-coverage, not manifest counts','practiceStagesWithArtifactChecksAndRemediation':8,'coreLearningSequence':'problem/acceptance/trust and independent foundation; component contracts; fixed complete path; dynamic full runtime; evaluation then own MVP decision; enforced boundaries before sensitive read/write; deployment before real trial; complete cost comparison after economics'},
        'mechanicalSummary':{'bookSha256':mechanics['bookSha256'],'bookBytes':mechanics['bookBytes'],'whole20SourceBodiesMatchOnlyPermittedTransforms':True,'oldCompleteFencesMigrated':37,'newCompleteFences':2,'currentCompleteFences':39,'fullFencesUnchangedInAssembly':True,'localLinkCount':mechanics['localLinkCount'],'localLinkOrAnchorProblems':[],'remoteLinksNotFetchedByQA':True,'renderedBrowserNotTested':True},
        'newBehavior':{'actualPython':'3.14.5','scope':'foundation pure CLI string parsing/business validation/assertions only','currentInputCases':14,'childProcessRecords':7,'historicalLongIntegerCounterexample':1,'intentionalAssertionFailure':1,'countsOverlapNotAddedToPassTotal':True,'sourceSha256':source['sourceSha256'],'bodySha256':source['codeSha256'],'allRecordedExitsMatchExpected':True,'guardedChildMinimalEnvironmentTemporaryDirectory':True,'temporaryDirectoryRemoved':execution['temporaryDirectoryRemoved'],'notOSIsolationProof':True},
        'historicalBehavior':{'scope':'37 byte-identical complete fences migrated; unchanged executed bodies carry only original limited evidence; whole professional technical audit and behavior not redone','originalRuntime':'Python3.12.14/SQLite3.53.1','originalV08ValidRecords':139,'allHistoricalVersionsRecords':166,'archivedCounterexampleRecords':6,'newV09RunsOfThese':0,'notCountedAsNewOrTeachingAchievement':True,'oldConclusionInherited':False,'perUnitAndBlockEvidence':str(OUT/'execution-and-migration-binding.json')},
        'findings':findings,'contentReview':{'status':review['status'],'findings':[{'id':f['id'],'status':f['status']} for f in review['findings']],'QAActualLongIntegerHistoricalAndCurrentEvidenceReadSeparately':True,'allCurrentSHAValuesVerified':True,'notHumanIndustryExpertReview':True},'unresolvedKnownDocumentFindings':[],
        'protectedFilePoints':{'baselineReadIntervalUtc':point['baselineReadIntervalUtc'],'finalReadIntervalUtc':point['readIntervalUtc'],'explicitFileCount':55,'unchanged':54,'authorizedAdministrativeException':'AGENTS v09 authorization addition only; removing exact section reconstructs baseline SHA','program22Unchanged':True,'oldTextbooksAndReportsStandardGatesUnchanged':True,'v07Sha256':'996e5aeb084b66405a0dd1023a375743d2e359c335b29517ac923f9f6a033c5c','oldV08CombinedActualStartAndEndSha256':'f68f553bcd5fd6a86ef988fd780d5433cd305413111c5c4d08966a7fc39b3816','notRestoredToHistoricalAcceptedBook':True,'onlyTwoRecordedPointsNotAllTurnProof':True,'PMAdministrativeFinalFilesNotFrozenOrBound':True},
        'fullProductAssessment':{'standardVersion':definition['standardVersion'],'gateDefinitionsUnchangedSha256':sha(gate_path.read_bytes()),'appliesOriginalDecisionRules':True,'gateResults':gates,'conclusion':'not_met','reason':'Required real_generation/reliable_delivery fail; five other gates need actual evidence. Current document iteration trace only passed from new evidence, not inherited.','notUserApprovalOrLearnerOrIndustryProof':True},
        'unverified':['human industry expert review','user reading approval','actual first-time learner comprehension and remediation/transfer','real model generation and source-connected learning profile','actual embedding/tool/provider contracts','whole pseudocode/runtime/training execution','real business/user/industry comparison evidence','production deployment and bills/load/economics'],
        'QAWriteScope':['team/textbook-v09-qa.md','team/textbook-v09-qa.json','team/textbook-v09-qa-history/*','fresh QA temporary fixture directory (removed)'],'notModified':['textbook/course/product/author/reviewer files','application/service/website','business database/env/private configurations'],'notExecutedOrPerformed':['application/service/website','business database/env/private configuration reads','paid model/external business requests','upload/deploy/publish'],'nextReview':'Any new actual reading or learner failure retains original input/current SHA; original author/course fixes; independent reviewer/QA rechecks affected parts only. Formal product evidence stays with existing gate owners.'}
report_path=ROOT/'team/textbook-v09-qa.json'
report_path.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
md_path=ROOT/'team/textbook-v09-qa.md'
(OUT/'qa-final.md').write_bytes(md_path.read_bytes())
(OUT/'qa-final.json').write_bytes(report_path.read_bytes())
handoff={'recordedAt':datetime.now(timezone.utc).isoformat(),'status':'complete_for_current_document_scope','documentScopeStatus':'met_with_limitations','fullProductStatus':'not_met','reports':[{'path':str(p),'sha256':sha(p.read_bytes())} for p in [md_path,report_path]],'bookSha256':mechanics['bookSha256'],'protectedReadIntervals':{'start':point['baselineReadIntervalUtc'],'end':point['readIntervalUtc']},'noFurtherRequiredCurrentChecks':True,'parentAdministrativeRecordsNotBound':True}
(OUT/'handoff.json').write_text(json.dumps(handoff,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(handoff,ensure_ascii=False,indent=2))
