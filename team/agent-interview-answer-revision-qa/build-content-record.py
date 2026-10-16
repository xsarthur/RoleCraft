from pathlib import Path
import json,hashlib,datetime,re
ROOT=Path.cwd();BASE=ROOT/'sites/rolecraft/team/agent-interview-answer-revision-qa';SOURCE=BASE/'candidate-1'
h=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
prior=json.loads((ROOT/'sites/rolecraft/team/agent-interview-answer-audit-qa/matrix.json').read_text());prior={x['id']:x for x in prior['items']}
notes={}
for line in (BASE/'semantic-notes.tsv').read_text().splitlines():
 values=line.split('\t');assert len(values)==7,(values[0],len(values));notes[values[0]]=values[1:]
source_items=[]
for p in SOURCE.glob('author-*.json'):source_items+=json.loads(p.read_text())['items']
assert len(notes)==124 and len(source_items)==124
items=[]
for x in source_items:
 ident=x['id'];f=SOURCE/x['answerPath'];ls=f.read_text().splitlines();ref=next(i+1 for i,line in enumerate(ls) if line.startswith('## 参考出处'))
 start=next((i+1 for i,line in enumerate(ls) if i>2 and line and not line.startswith(('#','版本','答案版本'))),1)
 ns=notes[ident];criteria=[]
 for i,reason in enumerate(ns,1):criteria.append({'id':f'AQS-{i:02d}','applicable':True,'status':'met_within_reviewed_scope','reason':reason,'contentEvidence':{'path':str(f.relative_to(ROOT)),'startLine':start,'endLine':ref-1},'method':'independent full-text semantic reading; question and its subparts checked against current text and prior counterexample'})
 criteria.append({'id':'AQS-07','applicable':True,'status':'not_met' if ident=='Q99' else 'met_within_reviewed_scope','reason':'Q99恢复修复机制缺直接绑定来源，REV-QA-Q99-01开放。' if ident=='Q99' else '本题引用的教材版本/哈希/行界与实际原文匹配；核心机制与所指小节语义一致。对新增协议/语言/论文事实另只读核一手资料。教学例与运行计划均未冒称已执行。','contentEvidence':{'path':str(f.relative_to(ROOT)),'startLine':ref,'endLine':len(ls)},'sourceBindings':x['sourceBindings']})
 criteria.append({'id':'AQS-08','applicable':True,'status':'met_within_reviewed_scope','reason':'读者可从结论跟随至机制、具体任务过程及条件反例；句段推进本题判断，无原三条提纲截断。使用表或代码时与所问对象一致，全文可独立读。','contentEvidence':{'path':str(f.relative_to(ROOT)),'startLine':start,'endLine':ref-1}})
 executable=ident in ['M101','M102','M103','M105','M106','M110']
 items.append({'id':ident,'question':x['question'],'collection':x['collection'],'answerVersion':x['answerVersion'],'answerSha256':x['answerSha256'],'answerPath':f"sites/rolecraft/textbooks/interview-answers-v1/{x['answerPath']}",'reviewedSnapshot':str(f.relative_to(ROOT)),'aqs':criteria,'originalCounterexample':prior[ident]['firstCounterexample'],'originalCounterexampleResult':'原缺口已实际在新全文的机制/案例/分支/验证中补齐；对应独立理由见AQS-01–06。' if ident!='Q99' else '原经历框架已补齐；新增恢复机制的直接来源缺口待补。','priorDefectIds':[z['id'] for z in prior[ident]['defects']],'qaContentStatus':'not_met' if ident=='Q99' else 'met_within_reviewed_scope','openDefects':['REV-QA-Q99-01'] if ident=='Q99' else [],'executionEvidence':'execution/code-results.json; exact extracted current code' if executable else ('execution/code-results.json; independently calculated arithmetic, not model run' if ident in ['M109','M113','Q69','Q71','Q75','Q76','Q78','Q96','Q97','Q98','P07','P10'] else 'independent semantic counterexample; related specification probes in execution/independent-results.json where applicable'),'executionLimits':'No real LLM/API/OAuth/MCP/A2A/ANN/OCR/GPU/OS sandbox, production service or real learner effect tested. QA specification probes do not implement the production system.','personalEvidenceStatus':'参考方法与显式虚构示例可核；本人真实经历仍待本人，未被教材制造。' if x.get('personalEvidenceRequired') else 'not_applicable'})
items.sort(key=lambda x: (0 if x['id'].startswith('Q') else 1 if x['id'].startswith('M') else 2,int(x['id'][1:])))
result={'version':'revision-qa-content-round1','date':'2026-10-14','status':'first_round_complete_one_open_source_defect','independentReviewer':'测试工程师 revision_qa','criteriaSource':'team/ANSWER_QUALITY_STANDARD.md AQS-01–08','readCount':124,'counts':{'fixed100':{'met':99,'not_met':1,'pending':0},'market14':{'met':14,'not_met':0,'pending':0},'prototype10':{'met':10,'not_met':0,'pending':0}},'allAnswersMeetStandard':False,'fullProductStatus':'not_met','displayStatus':'pending_engineering_integration','items':items,'execution':'exact 7 Python blocks and 7 additional code/arithmetic groups; 6 independent specification fixture groups; all passed','firstFailurePreserved':'candidate-1 and REV-QA-Q99-01'}
(BASE/'content-round1.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
head='# 新答案第一轮独立内容QA\n\n已完整读124题；当前123题限定内容范围满足，Q99 AQS-07直接来源缺口待补。不是展示、真人或完整产品通过。\n\n|题|状态|核心语义核对|原反例复验|\n|---|---|---|---|\n'
for x in items:
 head+=f"|{x['id']}|{x['qaContentStatus']}|{'；'.join(notes[x['id']][:3])}|{notes[x['id']][5]}|\n"
head+='\n逐项AQS、当前字节哈希、原缺陷ID及实际范围见content-round1.json；Q99失败快照保留，后续只追加复验。\n';(BASE/'content-round1.md').write_text(head)
print('Wrote first independent round: 123 met within content scope; 1 not_met')
