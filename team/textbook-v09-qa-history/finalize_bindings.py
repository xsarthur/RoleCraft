"""Public static final point and historical/new evidence bindings; never runs textbook code."""
from pathlib import Path
from datetime import datetime, timezone
import json,hashlib,sys
ROOT=Path(__file__).resolve().parents[2]
WORKSPACE=ROOT.parents[1]
H=Path(__file__).resolve().parent
OUT=H/'stage05-final'
OUT.mkdir(exist_ok=True)
sha=lambda b:hashlib.sha256(b).hexdigest()
load=lambda p:json.loads(p.read_text())
start=datetime.now(timezone.utc).isoformat()
baseline=load(H/'baseline.json')
comparisons=[]
for category in ['applicationWhitelist','frozenTextbookAndNavigation','priorReportsAndSpecifications','guidanceAndGates']:
    for r in baseline[category]['records']:
        p=Path(r['path']);raw=p.read_bytes()
        comparisons.append({'category':category,'path':str(p),'baselineSha256':r['sha256'],'currentSha256':sha(raw),'unchanged':r['sha256']==sha(raw)})
assert len(comparisons)==55
changed=[r for r in comparisons if not r['unchanged']]
assert len(changed)==1 and Path(changed[0]['path'])==WORKSPACE/'AGENTS.md',changed
agents=(WORKSPACE/'AGENTS.md').read_text()
begin=agents.index('### 当前授权：重构学习顺序')
end=agents.index('项目岗位交付与协调记录',begin)
admin_addition=agents[begin:end]
prior_reconstructed=agents[:begin]+agents[end:]
assert sha(prior_reconstructed.encode())==changed[0]['baselineSha256']
(OUT/'authorized-AGENTS-addition.md').write_text(admin_addition)
point={'readIntervalUtc':{'startedAt':start,'completedAt':datetime.now(timezone.utc).isoformat()},'baselineReadIntervalUtc':baseline['readIntervalUtc'],'baselineSha256':sha((H/'baseline.json').read_bytes()),'mechanicalRuntime':sys.version,'fileCount':55,'records':comparisons,'unchangedCount':54,'changedCount':1,
       'authorizedAdministrativeDifference':{'path':str(WORKSPACE/'AGENTS.md'),'addedSectionEvidence':'authorized-AGENTS-addition.md','removingExactNewSectionReconstructsBaselineSha256':sha(prior_reconstructed.encode()),'matchedBaseline':True,'authorizedBy':'PM direct message + current user v09 authorization','notFrozenAgainstLaterPMAdministrativeProgress':True},
       'programWhitelistUnchangedCount':sum(r['unchanged'] for r in comparisons if r['category']=='applicationWhitelist'),'oldCompiledBookPreexistingChangePreserved':{'path':str(ROOT/'textbooks/v08/agent-engineering-textbook.md'),'comparedToActualV09StartNotOldAcceptedHash':True,'sha256':sha((ROOT/'textbooks/v08/agent-engineering-textbook.md').read_bytes())},
       'limits':'Only the two recorded file read intervals; does not prove no intermediate mutation, directory-wide stability, service behavior or unseen files. Explicit static whitelist only; no database/env/runtime/private/cache/log reads or app execution.'}
(OUT/'protected-final-point.json').write_text(json.dumps(point,ensure_ascii=False,indent=2)+'\n')
mechanics=load(H/'stage03-mechanics/integrity-and-links.json')
assert not mechanics['localLinkProblems']
assert all(all(r[k] for k in ['wrapperMatches','wholeBodyMatchesOnlyPermittedTransformation','allFencesUnchanged','authorSourceShaMatches','authorTransformedShaMatches']) for r in mechanics['assemblyBodies'])
oldbinding_path=ROOT/'team/textbook-v08-qa-history/final-execution-binding.json'
oldbinding=load(oldbinding_path)
new_source=load(H/'stage02-foundation/source.json')
execution=load(H/'stage02-foundation/execution.json')
historical_by_sha={}
for b in oldbinding['bindings']:
    for e in b['executedBlocks']:
        assert e['byteIdentical'] and e['sha256']==e['executedSha256']
        historical_by_sha[e['sha256']]={'historicalUnit':b['unit'],'historicalFinalSource':b['finalSource'],'historicalFinalSourceSha256':b['finalSourceSha256'],'originalExecutionSourceSha256':b['executionSourceSha256'],'executionStage':b['executionStage'],'scope':b['scope']}
rows=[]
for u in mechanics['units']:
    p=Path(u['path']);assert sha(p.read_bytes())==u['sha256']
    for b in u['fences']:
        row={'unitId':u['unitId'],'currentSource':u['path'],'currentSourceSha256':u['sha256'],**b}
        if b['codeSha256'] in historical_by_sha:
            row.update({'executionStatus':'historical_exact_code_only_not_rerun_in_v09','historicalEvidence':historical_by_sha[b['codeSha256']],'runtime':oldbinding['runtime'],'noCurrent314ProfessionalClaim':True})
        elif u['unitId']=='01-foundation':
            assert b['codeSha256']=='bf605ae22047981acc2bfc68705d88c551fffe9d77f616a85eb6981986e4b456'
            row.update({'executionStatus':'current_new_safe_offline_selected_paths','executionEvidence':'../stage02-foundation/execution.json','executionSourceEvidence':'../stage02-foundation/source.json','runtime':'Python 3.14.5','inputCases':14,'notFullCourseOrProviderExecution':True})
        else:row.update({'executionStatus':'static_only_not_run','note':'YAML/design/interface pseudocode or other unexecuted fence; unchanged byte migration does not grant execution.'})
        rows.append(row)
result={'recordedAt':datetime.now(timezone.utc).isoformat(),'method':'Complete fence and body SHA bind current sources to unchanged historical code only; current foundation execution separately bound. Whole prose/new order is reviewed separately. Historical full module execution is not implied by a block SHA (notably f02 main).',
        'historicalBindingPath':str(oldbinding_path),'historicalBindingSha256':sha(oldbinding_path.read_bytes()),'historicalOriginalCounts':{'currentValidInV08':139,'allHistoricalVersions':166,'archivedCounterexamples':6,'newV09RunsOfThese':0,'notAddedToNewCaseCount':True},
        'newExecution':{'source':str(H/'stage02-foundation/source.json'),'sourceRecordSha256':sha((H/'stage02-foundation/source.json').read_bytes()),'execution':str(H/'stage02-foundation/execution.json'),'executionRecordSha256':sha((H/'stage02-foundation/execution.json').read_bytes()),'wholeSourceSha256':sha((ROOT/'textbooks/v09/01-foundation.md').read_bytes()),'bodySha256':'bf605ae22047981acc2bfc68705d88c551fffe9d77f616a85eb6981986e4b456','runtime':'Python 3.14.5','currentInputCases':14,'childProcessRecords':7,'historicalLongIntegerCounterexample':1,'intentionalAssertionFailure':1,'notDisjointAdditionalPassingTestCount':True},'fenceBindings':rows,'perUnit':[{'unitId':u['unitId'],'currentSourceSha256':u['sha256'],'scope':'new foundation selected local paths' if u['unitId']=='01-foundation' else 'current prose/ordering static review; legacy complete fences byte migration only; historical scopes only where explicitly bound','fences':len(u['fences'])} for u in mechanics['units']],
        'notExecuted':['actual provider API/main with credentials','embedding/reranker/actual semantic service','external issue operations or authorization services','complete fixed/dynamic pseudocode runtime','deployment/runbook/queues','actual bills/load/production','real learner work/user research/industry comparison/human expert review']}
(OUT/'execution-and-migration-binding.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'protected':55,'unchanged':54,'administrativeException':1,'unchangedProgramFiles':point['programWhitelistUnchangedCount'],'finalPointUtc':point['readIntervalUtc'],'fenceBindings':len(rows),'newCurrentCases':14,'oldBehaviorReruns':0},ensure_ascii=False))
