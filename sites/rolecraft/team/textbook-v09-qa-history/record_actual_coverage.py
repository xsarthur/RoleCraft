"""Serialize QA's independently read semantic locations and judgments; no textbook execution."""
import hashlib, json, re
from pathlib import Path
from datetime import datetime, timezone
ROOT=Path(__file__).resolve().parents[2]
OUT=Path(__file__).resolve().parent/'stage04-coverage'
OUT.mkdir(exist_ok=True)
sha=lambda b:hashlib.sha256(b).hexdigest()
old=json.loads((ROOT/'team/textbook-v08-manifest.json').read_text())
new=json.loads((ROOT/'team/textbook-v09-manifest.json').read_text())
historical_locations=json.loads((ROOT/'team/textbook-v08-qa-history/actual-coverage.json').read_text())
def norm(s):
    s=re.sub(r'^#{1,6}\s*','',s)
    s=re.sub(r'^\d+(?:\.\d+)*[. ]*','',s)
    return re.sub(r'[^\w]', '', s).lower()
def locate(unit,title):
    p=ROOT/'textbooks/v09'/f'{unit}.md'
    found=[]
    for line,t in enumerate(p.read_text().splitlines(),1):
        if re.match(r'^#{1,6} ',t) and norm(t)==norm(title):found.append({'unitId':unit,'path':str(p),'sourceSha256':sha(p.read_bytes()),'line':line,'heading':t.lstrip('# ').strip()})
    assert len(found)==1,(unit,title,found)
    return found[0]
special={
 'f01-k01':[('f01','成功需要跨过四道边界'),('f01','一个完整的只读适配器'),('01-foundation','完整短程序'),('01-foundation','顺着数据和控制流读程序')],
 'f01-k04':[('f01','一个完整的只读适配器'),('f01','三个推理与实作任务'),('01-foundation','根据失败补对应基础')],
 'c01-k01':[('c01-selection','同一任务 四种控制权'),('c01-selection','先固定共同任务条件'),('c01-fixed-workflow','完整任务与结果合同'),('c01-fixed-workflow','一个固定流程的完整决策骨架')],
 'c01-k02':[('c01-selection','三种输入暴露不同的必要性'),('c01-selection','用条件做选择的练习'),('c01-control-loop','12 选择最小足够的循环 而不是先选最复杂框架')],
 'c01-k03':[('c01-control-loop','8.2 主循环 先处理已有事实 再产生新决策'),('c01-control-loop','10.2 验收拒绝 把失败事实变为决策输入'),('c01-control-primer','一次创建后的超时轨迹')],
 'c01-k04':[('c01-selection','多 Agent 的升级点是可分工 而不是人数'),('c01-selection','怎样做一个公平且能定位原因的比较'),('c01-control-loop','7 审批 取消和预算都必须跨暂停保留'),('c01-control-loop','11 成功 等待和停止必须保留不同的含义')],
 'p01-k01':[('p01-discovery','问题证据与方案意图分成两条链'),('p01-discovery','取得证据时 让任务过程暴露反例'),('p01-discovery','重写一个不能失败的需求')],
 'p01-k02':[('p01-discovery','基线应代表用户现在真正能选的方案'),('p01-discovery','把差异写成能失败的假设'),('p01-mvp','预定义公平实验 而不是挑一次演示')],
 'p01-k03':[('p01-mvp','MVP 契约限制的是要验证的机制'),('p01-mvp','架构决定要能解释放弃了什么'),('p01-mvp','独立取得真实问题并交付实验契约')],
 'p01-k04':[('p01-mvp','同一决定交给业务与技术受众'),('p01-mvp','真实反馈改变假设 不能只变宣传'),('p01-mvp','用负面反馈作一次决策')]
}
judgments={
 'f01-k01':'专业边界继续区分可信身份与原始输入；新预备课先用文本解析、严格类型和零业务调用的拒绝路径补齐读代码能力。',
 'f01-k02':'只读适配器保持 HTTP、网络、解析和业务错误的分层；改写接口的练习要求重新判断未知效果，未把只读重试泛化到写动作。',
 'f01-k03':'复现段保留源快照与运行环境区别、运行时/依赖/配置/提交记录；预备课明确独立目录和退出码，补学不代替专业环境交接。',
 'f01-k04':'专业夹具断言及变更交接保留；新预备课新增故意错断言、定位、恢复和环境变更记录，实际 QA 只完成所列路径。',
 'f02-k01':'完整响应才能产生候选，拒绝/不完整/协议错误单独处理；正文仍要求真实调用的学习者证据，本轮不声称 provider 已调用。',
 'f02-k02':'schema 仅完成结构闸门，证据引用、项目/修订和断言事实继续由业务校验；候选不能自行证明根因。',
 'f02-k03':'状态与输入投影分离；外部资料只能供证，可信策略不由资料正文授予。早期信任导读支撑原则而未替代代码。',
 'f02-k04':'上下文选择须保留关键断言及必要环境；信息不足返回缺证，投影与裁剪不得伪造完整状态。',
 'c01-k01':'前篇先对比普通程序、一次调用、固定流程的控制权；完整合同和候选—审批—交付实作后移到工具/存储之后，完整原围栏未截断。',
 'c01-k02':'方案原则与条件练习不要求完整 Store；后置动态章节保留运行成本、重规划条件与退出/收回固定流程的取舍。',
 'c01-k03':'身份导读只追踪动作/尝试/效果短轨迹；完整循环后置，先处理持久事实、工具结果与验收反馈再产生新决策。',
 'c01-k04':'多 Agent 分工边界留在选型，审批/取消/预算跨暂停和完整等待状态留在动态章；人数不证明收益。',
 'c02-k01':'不可变修订、哈希、主体范围与检索前过滤仍为资料链前提，不用事后答案过滤替代授权。',
 'c02-k02':'全文/块身份和行范围核验与结论支持分开；正规化事实不能越过主体、来源与版本关系。',
 'c02-k03':'词法、语义、混合、融合和重排按查询类型比较；最小程序仍只是词交集，未冒称 BM25 或真实嵌入实验。',
 'c02-k04':'引用关联、必要事实缺失、环境缺失与版本冲突有不同缺证理由；练习保留无答案和越权对照。',
 'c03-k01':'模型调用是建议；Dispatch、物理发送和效果记录分开。导读提供名称前提，完整替身保留到工具章。',
 'c03-k02':'参数结构、项目语义与对象授权分开；不可变规范指纹和当前批准不由模型正文更改。',
 'c03-k03':'业务槽位/action 与协议 call/attempt 不混用；同键同内容重发、改内容冲突、旧批准失效的机制完整保留。',
 'c03-k04':'超时归未知，失败观察须绑定原 action/attempt/operation/hash；按下游契约决定核对与重发。',
 'e01-k01':'事件输入、持久动作和外部效果不是同一事实；最小 Store 解释意图、尝试和结果三个提交点。',
 'e01-k02':'持久状态与效果状态分开；最小存储和 Dispatch 桥接学习后才进入固定/动态整体流程，并明确未实现全模型账本。',
 'e01-k03':'窗口轨迹先核对原动作，真实效果已有但本地回执未提交不能解释为未发送；取消和未知事实分开。',
 'e01-k04':'版本快照与冲突拒绝保留；并发代次仅保护本地推进，外部旧请求仍需核对。',
 'e02-k01':'开发、回归和保留集控制信息使用；定向修复旧反例后仍需新独立任务，不能复用作者已见材料认证。',
 'e02-k02':'任务和比较条件先冻结，重复轮次、随机性及全分母保留；前置验收导读不替代完整评估器。',
 'e02-k03':'结果、轨迹、成本与已确认回执分别评价；缺证返回 INSUFFICIENT，安全但零功能不算正常任务完成。',
 'e02-k04':'Trace 调查与业务事实分开；受控替换只支持因果假设，模型评分需独立人审校准和新保留材料。',
 'e03-k01':'先明确攻击者可改的输入通道与资产；读取正文前执行授权，对抗与正常案例成对比较。',
 'e03-k02':'提示隔离不等于强制执行边界；可信宿主在数据读取和动作发送前实施最小权限，远端保证另验。',
 'e03-k03':'材料、候选、工具参数和日志四通道均需投影；有限字段策略不冒称识别未知秘密。',
 'e03-k04':'批准绑定精确逻辑意图、项目、主体、有效期和单次消费；远端未知不可沿用内存替身假设。',
 'e04-k01':'配置在启动前验证，发布绑定状态/工具/政策/提示与模型版本；新任务和旧任务分路不等于所有旧状态可迁移。',
 'e04-k02':'规划器依据暂停后的受控库存判断 HOLD/READY；程序不执行发布，回退须状态和契约兼容。',
 'e04-k03':'观测分模型、工具、存储、授权与业务验收阶段；回执/账本不能由 trace 成功状态替代。',
 'e04-k04':'runbook 要求实际故障身份、兼容目标、核对窗口及非作者复现；本轮未执行任何部署/runbook。',
 'e05-k01':'费用按逻辑任务汇总全部尝试；未知费用和预留分开，Decimal 教学 credit 不当作价格或账单。',
 'e05-k02':'分清接受延迟、终止等待和在途年龄；分母及观察截止不丢失败/超时，实际负载仍需另测。',
 'e05-k03':'缓存键绑定权限/版本/证据，缓存候选仍需当前批准；模型路由是待公平实测假设，不保证省钱。',
 'e05-k04':'开放/闭环负载区别、并发排队、全局预算、限流及重试开销仍保留；早期成本护栏只是计划。',
 'p01-k01':'问题发现独立取得真实任务、现有方法与反例，事实/判断/计划三分；教学案例不替真实用户证据。',
 'p01-k02':'问题篇保留现实可选基线与可失败假设，MVP 篇在 e02 后冻结同条件比较与指标，不靠演示结论。',
 'p01-k03':'组件教学后才决策自身 MVP，包含明确范围/验收与 ADR 的采用/放弃条件；并未先实现自身产品再补需求。',
 'p01-k04':'业务和技术同一决策分别交接，负反馈按原始任务改变假设和后续版本；真实反馈未被教材作者代做。',
 'p02-k01':'作品包绑定当前版本、来源、失败和独立复现；索引一致只证明路径/摘要/版本，不能证明真实性或认证。',
 'p02-k02':'真实使用和公平可比优势需作品外证据；自查、作者演示与用户认可分别保留。',
 'p02-k03':'重复工单原例按原因、行动、责任和原故障重验闭环，不用报告数量代替修复验证。',
 'p02-k04':'陌生权限/源/业务任务由非作者检查独立判断，认证范围限定于证据支持，不能由教材完成度推出胜任。'
}
assert len(judgments)==48
knowledge=[]
for k in new['knowledgePointMap']:
    ident=k['id']
    choices=special.get(ident)
    if choices is None:
        historic=next(r for r in historical_locations['knowledgePoints'] if r['id']==ident)
        choices=[(Path(l['path']).stem,l['heading']) for l in historic['locations']]
    locations=[locate(unit,title) for unit,title in choices]
    primary=set(k['v09PrimaryUnitIds'])
    assert primary <= {l['unitId'] for l in locations},(ident,primary,locations)
    knowledge.append({'id':ident,'originalTitle':k['originalTitle'],'objectiveIds':k['objectiveIds'],'actualPrimaryUnits':sorted(primary),'locations':locations,'currentQAReadingJudgment':judgments[ident], 'status':'observed_in_current_text_with_limits','learnerAchievement':'not_verified'})
oldmodules={r['moduleId']:r for r in old['moduleCapabilityMap']}
module_checks=[]
for n in new['moduleCapabilityMap']:
    o=oldmodules[n['moduleId']]
    fields=['moduleId','originalTitle','objectives','competencyIds','creationStageIds','knowledgePointIds']
    results={f:o[f]==n[f] for f in fields}
    results['historicalPrerequisites']=o['prerequisites']==n['historicalOriginalModulePrerequisites']
    module_checks.append({'module':n['moduleId'],'preservedFields':results})
    assert all(results.values())
oldk={k['id']:k for u in old['units'] for k in u.get('knowledgePointMapping',[])}
kchecks=[]
for k in new['knowledgePointMap']:
    fields=['id','originalTitle','objectiveIds','publicQuestionId','originalPrimaryQuestion','originalTransferQuestion']
    comparisons={f:oldk[k['id']][f]==k[f] for f in fields}; assert all(comparisons.values())
    kchecks.append({'id':k['id'],'preservedFields':comparisons})
reqs=[]
for r in new['priorProfessionalRequirements']:
    o=next(u for u in old['units'] if u['unitId']==r['historicalSourceUnitId'])
    fields=['mechanismRequirements','implementationRequirements','failureRequirements','tradeoffRequirements','practiceRequirements','originalEvidenceRequirements','originalValidationRequirements']
    comparisons={f:r[f]==o[f] for f in fields};assert all(comparisons.values())
    reqs.append({'module':r['moduleId'],'historicalSourceUnit':o['unitId'],'preservedFields':comparisons})
objectives=[]
for m in new['moduleCapabilityMap']:
    for o in m['objectives']:
        ks=[k['id'] for k in knowledge if o['id'] in k['objectiveIds']]
        assert ks
        objectives.append({'id':o['id'],'originalText':o['text'],'currentBodyKnowledgeEvidence':ks,'currentPrimaryUnits':sorted({u for k in knowledge if k['id'] in ks for u in k['actualPrimaryUnits']}),'textCoverage':'mechanism_practice_reference_analysis_observed_with_limits','actualLearnerCompletion':'not_verified','actualRuntimeCompletion':'provider_not_executed' if o['id']=='f02-o1' else 'only_selected_new_foundation_cases; professional_behavior_not_rerun'})
result={'recordedAt':datetime.now(timezone.utc).isoformat(),'status':'mapped_with_limitations','method':'QA read current twenty bodies and migration context, selected semantic locations and wrote new current judgments. Historical v08 headings supply location candidates only; no inherited judgment/pass and no keyword count quality test. Scripts resolve selected headings/hash and check metadata identity only.',
        'manifestSha256':sha((ROOT/'team/textbook-v09-manifest.json').read_bytes()),'historicalManifestSha256':sha((ROOT/'team/textbook-v08-manifest.json').read_bytes()),'moduleCount':len(module_checks),'objectiveCount':len(objectives),'knowledgePointCount':len(knowledge),'moduleIdentityComparisons':module_checks,'knowledgeIdentityComparisons':kchecks,'originalProfessionalRequirementComparisons':reqs,'knowledgePoints':knowledge,'objectives':objectives,'notLearnerOrIndustryAchievement':True}
(OUT/'actual-coverage.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'modules':len(module_checks),'objectives':len(objectives),'knowledgePoints':len(knowledge),'identityPreserved':True,'currentTextLocations':sum(len(k['locations']) for k in knowledge)},ensure_ascii=False))
