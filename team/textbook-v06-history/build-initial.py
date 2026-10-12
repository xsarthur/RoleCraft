import copy
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE = ROOT / 'textbook-v05.json'
SPEC = ROOT / 'textbook-v06-spec.json'
book = json.loads(BASE.read_text())
old = copy.deepcopy(book)
spec = json.loads(SPEC.read_text())
c = next(ch for ch in book['chapters'] if ch['id'] == 'c01')
m = next(ch for ch in spec['modules'] if ch['id'] == 'c01')

def sha(text):
    return hashlib.sha256(text.encode()).hexdigest()

book['schemaVersion'] = '1.1'
book['version'] = spec['textbookVersion']
book['updatedAt'] = '2026-10-11'
book['specVersion'] = spec['version']
book['specSha256'] = hashlib.sha256(SPEC.read_bytes()).hexdigest()
book['changedChapterIds'] = ['c01']
book['unchangedChapterIds'] = spec['revisionScope']['unchangedModuleIds']
book['wholeBookRewriteComplete'] = False
book['authoringComplete'] = True
book['revisionScope'] = copy.deepcopy(spec['revisionScope'])
book['provenance'] = {
    'authorRole': '教材研发员', 'generationMode': 'agent_authored_draft',
    'baseTextbookVersion': old['version'],
    'baseTextbookSha256': hashlib.sha256(BASE.read_bytes()).hexdigest(),
    'changedChapterIds': ['c01'],
    'unchangedChapterIds': book['unchangedChapterIds'],
    'wholeBookRewriteComplete': False,
    'process': ['只读用户RTF表达参考', '依据冻结单主题示范规格', '原创c01四小课及同期九节详单', '其余十一章原样继承v0.5', '从同一JSON导出Markdown', '交独立审校和示例执行'],
    'limitations': ['本轮仅c01改写；其他十一章仍为v0.5原稿。', '本轮由作者代理编辑草稿，不是网站用户的真实供应商生成任务。', '作者未执行新示例；独立执行、文稿审校、用户理解反馈分别记录。', '未取得真人行业专家审核、真实学员能力或行业优势证据。']
}
book['limitations'] = list(book['provenance']['limitations'])
book['review'] = {'aiContentReview': 'not_reviewed', 'humanExpertReview': 'not_done', 'learnerValidation': 'not_done'}
vision = next(s for s in spec['sources'] if s['id'] == 'claude-vision-v06')
book['sources'].append(copy.deepcopy(vision))

c['version'] = book['version']
c['readingTitle'] = 'Agent 控制循环'
c['coreQuestion'] = m['coreQuestion']
c['changedInVersion'] = book['version']
c['readingIntro'] = {
    'problem': m['coreQuestion'],
    'learningOutcome': '跟着一次保修查询，说明系统为什么选择这一步、怎样核对结果，以及为什么继续或停止。',
    'prerequisiteSummary': '先修f02：知道模型返回的是建议，工具由应用执行。若还不能分清这两件事，先补读f02；阅读本章不要求先掌握复杂框架。',
    'caseSummary': '虚构案例：小林请海岚商城的售后知识助手查询星河耳机的保修期限，保存一份答复草稿。全章不发送消息、不退款。'
}
c['chapterCase'] = {
    'id': 'controlled-after-sales-assistant-c01-warranty',
    'title': '小林查询星河耳机保修期限',
    'summary': c['readingIntro']['caseSummary'],
    'names': copy.deepcopy(spec['pilotCase']['names']),
    'goal': spec['pilotCase']['oneTask'],
    'allowedActions': ['在题定权限内查保修手册', '询问缺少的产品型号', '形成答复草稿', '在内存工具替身中保存答复草稿'],
    'limits': '虚构资料与内存草稿，不连接商城、不发送消息、不承诺退款；只读操作也受对象权限限制。',
    'contentOrigin': 'original_design',
    'completionRule': spec['pilotCase']['completionRule'],
    'runtimeBounds': copy.deepcopy(spec['pilotCase']['runtimeBounds']),
    'fixtures': {'productModel': '星河-01', 'policyId': '星河保修-v1', 'policyText': '星河-01耳机的保修期限为购买之日起12个月。', 'draftId': '小林保修草稿-01'},
    'realUserEvidence': False
}
c['objectiveCoverage'] = copy.deepcopy(spec['objectiveCoverage'])
c['sourceIds'] = ['agent-patterns', 'owasp-injection', 'claude-vision-v06']
c['sourceRecheck'] = {
    'accessedAt': '2026-10-11',
    'scope': [{'sourceId': 'agent-patterns', 'locator': 'What are agents; When (and when not); Agents; Combining and customizing'}, {'sourceId': 'owasp-injection', 'locator': 'Prevention and Mitigation: privilege control, high-risk approval, external content'}, {'sourceId': 'claude-vision-v06', 'locator': 'Vision introduction; Send images to Claude'}],
    'limits': '实际访问机制资料，不是运行、真人专业审核或学习效果证据；案例、代码、字段、预算与停止优先级均为原创教学设计。'
}

prose = [
'''小林已经在消息里写清楚：“我的耳机型号是星河-01，请查保修期限，保存一份答复草稿。”假定海岚商城已经提供了适用手册，查询接口和草稿接口也很稳定。要完成这件事，程序可以照着事先安排的步骤执行，不必每一步都重新问模型该做什么。

```text
已知型号 → 查保修手册 → 形成答复 → 保存草稿 → 核对保存回执
```

这条线表示“固定查询流程”：开发者预先写好下一步。它并不意味着程序遇到错误还要盲目往下走。例如，没查到手册，就返回“暂时没有适用资料”；保存失败，就报告“答复已拟好，但尚未保存”。这些分支也可以提前写在程序里。程序复杂一些，仍然可能是一条固定流程。

现在把消息改成：“帮我查一下星河耳机的保修期限，给我保存一份答复草稿。”产品名称有了，具体型号却没给。此时，不能直接使用星河-01的手册。最简单的处理方式，是让固定流程增加一个缺项分支：先问小林型号，得到回答后再查询。缺一个字段，本身并不要求改成Agent。

如果实际售后问题变化很多，下一步需要结合返回的资料再选，例如返回的手册提示还要区分销售渠道，开发者可以考虑让模型在允许的动作中提出下一步，再由程序执行。课程把这种执行方式称为“根据反馈选择下一步的控制循环”。此处的关键差别，是**谁决定下一步**：固定查询流程主要按照预写路径走；动态控制让模型依据新观察提出行动。

两种方式都能包含判断和多次调用，不能只数调用次数来判断。三次模型调用若顺序始终固定，仍是一条预写流程。动态控制若让每轮选择更灵活，也会增加核对、测试和调用开销。因此，本例先保留固定查询流程作比较起点，再检查新增灵活性是否真的解决了固定流程难处理的情况。

你现在只需会选执行方式，不必同时学习多个框架。比较时让两种方案面对相同的请求、手册和权限；若一套做简单题，另一套做难题，就不能据此说哪套更好。这个比较尚未实际测量，案例中的判断是题定条件下的选择建议。''',
'''假设海岚商城选择了动态控制。小林提交任务后，模型可以建议“先查保修手册”，但建议还不是查询动作。需要有一段程序把建议接起来，核对允许范围、调用工具、收回结果，再决定是否进入下一轮。这里把这段程序的协调职责叫做**任务协调器**，英文常用 Orchestrator。

先看一轮，不急着记整个系统的组件清单：

```text
当前任务 → 选择下一步 → 应用核对 → 执行工具 → 读取实际结果
              ↑                                  │
              └──────── 未结束，进入下一轮 ──────────┘
```

读图时从左往右走。“选择下一步”可以由模型提出建议；“应用核对”由程序判断这项建议是否能执行。本例只允许查询题定手册和保存小林的草稿，模型若建议“给小林退款”，程序应拒绝，因为退款不在这次任务中。

把第一轮展开：输入是小林的请求和已知型号星河-01；模型提出查手册的建议；程序核对查询对象；查手册工具返回“找到星河保修-v1，保修期限为购买之日起12个月”。最后这条返回才是本轮的**实际观察**。模型在执行前猜“应该是12个月”，不能代替它。

第二轮的输入不再只有原请求，还增加了刚拿到的手册片段。模型可以据此拟出答复草稿，建议保存。程序调用草稿工具，取得“小林保修草稿-01已保存”的回执，核对内容确实引用了刚查到的手册，才把这次任务标为完成。文字写好了，和草稿已经保存，是两个不同的时点。

为了让下一轮知道发生了什么，程序保存本次任务的进度，例如“型号已知、手册已找到、草稿还未保存”。这就是**任务状态**。它负责记录进度；下一步选择负责提出动作；工具负责执行动作。三种职责分清后，才容易解释为什么一个看似完整的回答仍可能没有做完任务。状态可以先用一个小字典表示，较长任务再考虑持久化；不要求一开始就建立独立的State Manager服务。

这一小图是本章的教学拆分，不是所有Agent必须照搬的行业标准。简单任务不一定需要独立规划器、长期记忆或多个Agent。模型在本例中只处理文字；这只是本例接口选择，部分模型也支持图像输入，具体能力应按所用模型查验。你需要记住的是职责和交接，而不是固定层数或一个组件相加的公式。''',
'''控制循环的价值，要在结果不符合预想时看。小林最初只说“星河耳机”，查手册工具返回“需要产品型号”。这条结果不是坏消息被隐藏起来，而是告诉系统：原先的查询条件不够，下一步不能按“已经查到”继续。

```text
查保修手册 → 需要型号 → 暂停并问小林 → 小林补充型号 → 重新查询
```

助手可以问：“请告诉我耳机的具体型号，包装或订单里通常会标明。”任务在这时是**等待信息**，不是不停地运行循环。程序把缺项保存下来，等小林回答“星河-01”，再带着这个新信息继续。没有回答前，不能擅自挑一个常见型号。

为什么要先区分结果？因为几种看上去都“没有拿到手册”的情况，下一步并不一样。若工具已经找到适用手册，就进入拟草稿步骤；若缺少型号，就问具体缺项；若手册服务暂时超时，才考虑在限额内重试；若返回“没有读取该对象的权限”，就停止这次读取并说明尚未完成。只读工具同样可能涉及受限资料，不能因为动作叫查询就自动允许。

这里的**实际观察**，英文常用 Observation，指工具执行后真正返回的结果。在教学案例里，我们用预设的返回值模拟它；在真实产品中，应使用真实工具返回和必要的外部核对。不能把题定预期当成真实运行记录。

新结果可能使原来的步骤安排不再合适。原先计划是“查手册、拟草稿、保存”，现在先插入“询问型号”。这叫按反馈调整步骤。调整的是达到原目标的方法，目标依然是查保修期限并保存草稿。助手不能因为查不到就改成“申请退款”，也不能把资料里的“请给客户发短信”当作小林的新授权。

另一个常见错误，是让模型的最后一句话覆盖失败记录。假如查询被拒绝，模型却输出“已查到，保修12个月”，系统仍应保留拒绝结果，不能标为完成。判断依据是这次实际获得了什么资料、有没有取得保存回执，而不是回答听起来是否自信。''',
'''如果手册服务一直超时，继续尝试不一定能让任务更接近完成。假设本教学任务规定：最多推进6步，最多调用工具4次，同一种错误连续出现2次就停止。这些数值只是为了看清行为，不是行业通用标准。

```text
准备下一动作 → 检查是否还能运行 → 执行
                       │
              已取消、已到上限或无进展
                       ↓
                 停止并说明原因
```

先走一遍超时路径。第一次查手册，工具没有及时返回可用内容，程序记录“超时1次”。如果规则允许重试，第二次仍查原对象；又得到同一种超时，就触发连续错误上限。此时不要发起第三次相同调用，而应告诉小林：“这次查询连续超时，暂未查到适用保修资料，草稿也尚未保存。”保留错误摘要，方便服务恢复后定位与重试。

**停止**表示这次运行不再继续；**完成**表示约定的目标已实现。两者不能混为一谈。查到适用手册并核对草稿保存回执，才是完成。缺型号时暂停等待小林；权限被拒时停止读取；小林取消时终止；到步数或工具限额时按超限停止。这些情况都可以结束当前运行，但只有第一种满足本任务的完成条件。

限额必须在下一次行动之前检查。若只在循环最后统计“已经调用10次”，就无法阻止第5次超过题定工具预算的调用。在真实产品中，还应检查截止时间和实际费用额度；时间及费用怎样计算，要根据实际接口与预算实现，不能用本例的调用次数冒充真实账单。

终止时也可以交出已有成果。例如资料已找到，但草稿保存失败，可以给出“手册已找到、草稿未保存”的部分结果及失败说明。它帮助用户接手，却不能被统计为完整完成。运行记录保留任务阶段、状态与必要的错误摘要即可，不应无条件抄入所有用户原文、密钥和工具原始结果；敏感内容要最小化、脱敏并限制访问。

你在本课学的是准确停止，不是让系统永远坚持。更复杂的重试策略、费用核算或多角色协作，放在后续专题。本任务只围绕小林的一份草稿，添加更多角色也不能取代对实际结果的核对。'''
]

checks = [
    ('小林已提供星河-01型号，手册查询和草稿保存步骤稳定；异常也有明确分支。第一版该优先选择什么执行方式？说明一个理由。', '优先选择固定查询流程。需要做的步骤和异常分支都已明确，可以直接实现并测试；多次调用本身不要求动态控制。若后续出现预先难以列全的条件，再在相同任务上比较动态选择的收益，不是永久禁止Agent。'),
    ('模型说“我将查询星河-01的保修手册”。随后工具返回“找到星河保修-v1，保修期限12个月”。哪一句是建议，哪一句是实际观察？此时整个任务完成了吗？', '第一句是尚待执行的建议；第二句是查询工具返回的实际观察。此时仅完成资料查询，仍须拟草稿、执行保存并核对回执，才能完成小林的整项请求。这里的返回为教学预设，不是真实商城执行证据。'),
    ('查询星河-01手册返回“没有读取该对象的权限”。模型随后说“已查到12个月保修”。下一步应怎么做？', '停止这次受拒读取，记录权限拒绝，并说明尚未取得适用资料、任务未完成。模型的说法不能覆盖工具拒绝；不能换对象绕过权限。只有通过正规途径取得适当权限或获授权调整任务后，才可以发起新的合法查询。'),
    ('同一手册查询已连续超时2次，题定规则是连续同错2次停止。助手想再试一次。应允许吗？停止说明该写什么？', '不允许第三次相同调用，应在执行前触发无进展停止。说明“连续查询超时，尚未查到适用资料，草稿未保存”，保留安全的错误摘要。超时意味着本次没有可用查询结果，不意味着保修不存在；后续服务恢复后可以在新的受限运行中复验。')
]
c['readingLessons'] = []
for item, body, check in zip(m['readingLessonsSpec'], prose, checks):
    lesson = {k: copy.deepcopy(item[k]) for k in ['id', 'order', 'title', 'coreQuestion', 'learningAction', 'objectiveIds', 'knowledgePointIds', 'sourceIds']}
    lesson.update({'bodyMarkdown': body, 'checkQuestion': check[0], 'checkAnswer': check[1], 'contentOrigin': 'original_design_with_limited_source_paraphrase', 'bodySha256': sha(body)})
    c['readingLessons'].append(lesson)

kp_values = [
    {'explanation': '固定查询流程由程序安排步骤及分支；小林已给星河-01型号时，可以固定查手册、拟答复、保存及核回执。缺型号也可由预写分支询问，不能凭缺项就断定必须使用动态Agent。先保留这一简单基线，再在同一任务、手册和权限下比较控制方式。', 'answer': '先测固定查询流程，以便判断动态选择是否解决了实际缺口。', 'analysis': '题中型号与后续步骤已确定，固定查询流程是可实现、可复现的起点。记录完成结果、工具次数和错误分支，之后再加入动态控制，用相同条件比较。错因是把“先进”理解成“更复杂”。若新的售后条件使下一步难以预列，可比较动态选择；未知成绩不能先填成优势。', 'transfer': '小林没提供型号时，怎样给固定查询流程加一个明确缺项分支？'},
    {'explanation': '一次循环中，模型提出候选动作，应用核对可执行范围，工具执行后返回实际观察，程序保存任务状态并进入下一轮。三次预写模型调用仍可是一条固定流程；动态控制的判断依据是观察如何影响下一行动。协调、建议、执行和记录是职责，可在小程序中组合实现，不靠组件名定义资格。', 'answer': '不是；需要看谁安排下一步，以及实际观察是否进入下一次决策。', 'analysis': '若查手册、拟答复、保存三步始终按预写路径走，模型调用再多也不自动变为动态Agent。在课程所讲控制循环中，模型可以依据实际观察提出下一动作，但程序仍管允许范围及终止。固定与动态可以组合，不能以调用次数、层数或角色数替代控制方式分析。', 'transfer': '在同一个保修任务里，工具返回需要型号后，动态建议应如何改变下一步？'},
    {'explanation': '实际观察是工具执行后的返回，不是模型预想结果。查到适用手册后拟草稿；缺型号则暂停询问；暂时超时可按限额重试；权限拒绝则停止该次读取。按观察调整达到原目标的步骤，不擅自改成退款或外发。草稿文本已经生成不等于保存成功，须核保存回执。', 'answer': '以实际拒绝为准，保留未完成，停止该次受拒读取。', 'analysis': 'permission_denied没有提供可用手册，模型自称“已查到12个月”没有这个工具结果的支持。因此不能走保存成功路径，也不能换对象绕过拒绝。可以说明需要正规权限处理；若取得合法新权限，再发起新的受限查询。只读不等于无权限要求，计划和回答不等于执行。', 'transfer': '查得的资料显示适用型号不同，应怎样在不改变小林原目标的条件下调整步骤？'},
    {'explanation': '本例题定最多6步、4次工具调用、连续同错2次停止，行动前先查剩余预算和取消/截止条件。完成须有适用手册与正确草稿保存回执；等待型号、拒绝、取消、无进展及超限都不等于完成。进阶协作须累计各角色调用和交接成本，不以拆分规避总预算。', 'answer': '本例第二次相同错误后就应停止；若已经发生第三次，记录超限缺陷并阻止继续。', 'analysis': '题定连续同错上限为2，不能等到第三次才把规则当有效。应在第二次实际错误后进入no_progress，并在下一行动前阻止重试。若日志已有三次，应如实保留第三次作为实现缺陷，修正检查时机后复验；不能删除原失败记录。输出所缺资料和未保存事实，不把停止标成completed。', 'transfer': '若为同一保修任务增加一名资料复核助手，怎样把交接和复核调用纳入原总预算？'}
]
for k, vals in zip(c['knowledgePoints'], kp_values):
    k.update(vals)
    k['validationStatus'] = 'not_run'
    k['supportScope'] = 'agent-patterns仅支持固定路径与模型动态控制的区分、简单起点、环境反馈和停止措施；本章人物、保修内容、字段、预算、权限处理和题解是原创教学约定，不是来源制定的行业标准或运行成绩。'
    k['exerciseIds'] = ['c01-scaffold', 'c01-independent', 'c01-transfer']
    k['specExerciseIds'] = ['c01-scaffold', 'c01-independent', 'c01-transfer']

exercises = [
    {'id': 'c01-scaffold', 'title': '脚手架：给保修任务画执行路径', 'level': 'scaffold', 'task': '围绕小林同一请求，画固定查询流程与根据反馈选择下一步的控制循环；逐轮填输入、动作、观察和下一步。', 'input': '虚构请求：查询星河耳机保修期限并保存草稿。正常：型号星河-01，手册found，保存回执saved。边界：型号缺失，查询返回needs_product_model。失败：手册返回permission_denied，模型却说已查到。题定限额6步、4次工具调用、连续同错2次停止。', 'deliverables': ['两张有分支和停止位置的图', '正常/缺型号/权限拒绝三条手算轨迹', '相同任务下选择执行方式的理由'], 'knowledgePointIds': ['c01-k01', 'c01-k02', 'c01-k03', 'c01-k04'], 'referenceSolution': '固定方案可以预写缺型号分支；动态方案把实际观察送回下一轮，两者都受程序限制。正常先查资料再保存并核回执；缺型号暂停等待；权限拒绝保留未完成。每次行动前检查题定限额，不能用模型声明取代工具返回。', 'feedback': '若图里只有“智能执行”，补谁决定、谁执行、谁核对。若把needs_product_model当超时重试，改为询问缺项。若把停止写成成功，重新核目标和回执。', 'transferPrompt': '小林增加销售渠道信息后，两种路径怎样在相同条件下处理？', 'normal': {'input': '星河-01/适用手册/保存回执均齐全', 'expected': 'completed，资料与草稿回执对应'}, 'boundary': {'input': '型号缺失', 'expected': 'waiting_for_info，问型号；无草稿保存'}, 'failure': {'input': '读取返回permission_denied', 'expected': 'permission_denied，未查询成功、未保存'}, 'executionStatus': 'not_run'},
    {'id': 'c01-independent', 'title': '独立：实现保修任务的受限循环', 'level': 'independent', 'task': '在隔离内存工具中实现同一任务，分别运行固定查询流程和受限循环；核对观察、回执及运行上限，记录实际结果。', 'input': '仅用本章虚构手册与草稿工具。正常手册found；缺型号needs_product_model；持续timeout；权限permission_denied；将工具额度减至1或把最大步数减至1；开始前取消。最多6步、4次工具调用、连续同错2次停止为原始配置。不要接模型、网络或真实商城。', 'deliverables': ['两种方案的代码及环境说明', '同条件正常/失败/耗尽与取消的实际轨迹', '动作前预算检查断言', '预期与实际分开的比较表'], 'knowledgePointIds': ['c01-k01', 'c01-k02', 'c01-k03', 'c01-k04'], 'referenceSolution': '只使用本例动作。正常查手册、保存内存草稿并核回执；缺型号暂停；拒绝立即停止；两次同样超时无进展停止；下一工具调用会超额度时阻止调用。规则替身便于检查控制程序，它不能证明真实模型动态选择质量。固定流程不需要假扮自主模型。', 'feedback': '看到草稿文字就completed，补保存回执核对。额度1却有第2次工具调用，移动预算检查到执行前。把替身成绩称真实Agent效果，收窄结论并保留真实模型待测。', 'transferPrompt': '给保存工具增加题定save_failed返回，复验已查资料但未完成保存的说明。', 'normal': {'input': '星河-01/found/saved', 'expected': 'completed；查询与保存2次工具调用'}, 'boundary': {'input': 'tool_budget=1或max_steps=1', 'expected': '无第2次调用；分别tool_budget_exhausted或step_limit'}, 'failure': {'input': 'timeout连续2次', 'expected': 'no_progress；保留2次错误，未保存'}, 'executionStatus': 'not_run'},
    {'id': 'c01-transfer', 'title': '迁移：判断是否值得增加复核角色', 'level': 'transfer', 'task': '仍为小林这份保修草稿，比较单一执行助手与另加资料复核助手的计划；说明分工依赖、总预算和何时不值得拆分。', 'input': '单角色按同一手册生成和保存草稿；新增角色只读核对型号和保修片段，不保存草稿、不发送消息。两种方案使用相同请求、手册、权限与总额度。复核返回匹配、型号不符或超时三种题定观察，成绩尚未测量。此题为进阶扩展，不要求小课初学者先理解多Agent框架。', 'deliverables': ['同任务单/多角色比较计划', '每名角色唯一输入输出和依赖图', '总调用/交接成本记录方法', '匹配/不符/超限时的保存决定'], 'knowledgePointIds': ['c01-k01', 'c01-k02', 'c01-k03', 'c01-k04'], 'referenceSolution': '只有可能改善结果的独立核对才值得新增角色；先测单角色基线。复核职责只报告匹配情况，由原执行助手在核对通过且剩余额度内保存。型号不符先补正资料，超限保留部分结果，不让两人同时保存。总预算包含检索、复核、交接与最终保存；计划不等于已测优势。', 'feedback': '新增角色又查资料又写草稿，收窄唯一职责；把两个角色各4次算仍未超总4次，改为共享总额度；只比较角色数，补同条件结果及交接成本。', 'transferPrompt': '若资料复核没有发现新信息却占用更多调用，怎样提出一次可证伪的简化实验？', 'normal': {'input': '复核匹配且总额度足够', 'expected': '原执行助手保存，复核者不写入'}, 'boundary': {'input': '核对通过但保存前总额度已用尽', 'expected': '停止，草稿尚未保存，不授予完成'}, 'failure': {'input': '复核发现型号不符或持续超时', 'expected': '补正或有限停止，不沿用错误结论'}, 'executionStatus': 'not_run'}
]
c['exercises'] = exercises

CODE = '''# Python 3.10+，仅内存工具替身；不是实际模型或商城接口。
import json


def choose_action(state):
    # 确定性规则代替模型建议，只用于看清控制程序。
    return "read_policy" if state["policy"] is None else "save_draft"


def read_policy(model, scenario):
    if not model:
        return {"status": "needs_product_model"}
    if scenario in ("timeout", "permission_denied", "not_found"):
        return {"status": scenario}
    if model != "星河-01":
        return {"status": "not_found"}
    return {"status": "found", "model": model,
            "policy_id": "星河保修-v1", "months": 12}


def run_warranty(model="星河-01", scenario="found", max_steps=6,
                 tool_budget=4, cancelled=False, deadline_expired=False):
    # 输入先查类型。布尔值不能当整数预算。
    if model is not None and not isinstance(model, str):
        return {"status": "invalid_input", "trace": [], "tool_calls": 0}
    if not isinstance(scenario, str) or scenario not in {
            "found", "timeout", "permission_denied", "not_found", "save_failed"}:
        return {"status": "invalid_input", "trace": [], "tool_calls": 0}
    if any(type(n) is not int or not 0 <= n <= 20
           for n in (max_steps, tool_budget)):
        return {"status": "invalid_input", "trace": [], "tool_calls": 0}
    if type(cancelled) is not bool or type(deadline_expired) is not bool:
        return {"status": "invalid_input", "trace": [], "tool_calls": 0}
    model = model.strip() if model is not None else None
    state = {"model": model, "policy": None, "draft": None}
    trace, drafts = [], {}  # 本次运行的隔离内存；无文件/数据库写入。
    calls, same_errors, previous_error = 0, 0, None

    def stop(status):
        return {"status": status, "state": state,
                "trace": trace, "tool_calls": calls}

    for step in range(1, max_steps + 1):
        # 教学输入模拟已取消/截止到期，不是实际墙钟或异步取消实现。
        if cancelled:
            return stop("cancelled")
        if deadline_expired:
            return stop("deadline_exceeded")
        action = choose_action(state)
        if action not in {"read_policy", "save_draft"}:
            return stop("action_denied")
        if calls >= tool_budget:  # 在执行下一工具前阻止超额。
            return stop("tool_budget_exhausted")
        calls += 1
        if action == "read_policy":
            obs = read_policy(state["model"], scenario)
        elif scenario == "save_failed":
            obs = {"status": "save_failed"}
        else:
            policy = state["policy"]
            text = ("星河-01耳机保修期限为购买之日起"
                    + str(policy["months"]) + "个月。")
            drafts["小林保修草稿-01"] = text
            obs = {"status": "saved", "draft_id": "小林保修草稿-01",
                   "policy_id": policy["policy_id"],
                   "text": drafts["小林保修草稿-01"]}
        trace.append({"step": step, "action": action,
                      "observation": dict(obs)})
        status = obs["status"]
        if status == "needs_product_model":
            return stop("waiting_for_info")
        if status in {"permission_denied", "not_found", "save_failed"}:
            return stop(status)
        if status == "timeout":
            same_errors = same_errors + 1 if previous_error == status else 1
            previous_error = status
            if same_errors >= 2:
                return stop("no_progress")
            continue
        same_errors, previous_error = 0, None
        if status == "found":
            state["policy"] = dict(obs)
        elif status == "saved":
            policy = state["policy"]
            if (obs["policy_id"] != policy["policy_id"]
                    or obs["text"] != drafts[obs["draft_id"]]):
                return stop("receipt_mismatch")
            state["draft"] = dict(obs)
            return stop("completed")
    return stop("step_limit")


if __name__ == "__main__":
    normal = run_warranty()
    assert normal["status"] == "completed" and normal["tool_calls"] == 2
    assert run_warranty(model=None)["status"] == "waiting_for_info"
    assert run_warranty(scenario="permission_denied")["status"] == "permission_denied"
    assert run_warranty(scenario="timeout")["status"] == "no_progress"
    assert run_warranty(tool_budget=1)["status"] == "tool_budget_exhausted"
    assert run_warranty(max_steps=1)["status"] == "step_limit"
    assert run_warranty(cancelled=True)["tool_calls"] == 0
    assert run_warranty(deadline_expired=True)["tool_calls"] == 0
    assert run_warranty(model=[])["status"] == "invalid_input"
    assert run_warranty(tool_budget=True)["status"] == "invalid_input"
    print(json.dumps(normal, ensure_ascii=False, indent=2))
'''

example_text = '''这是可运行的离线控制程序，作者尚未执行。它放在进阶详单里，理解四小课不要求先读完代码。把下方完整代码存为c01_warranty_demo.py，在自己新建的空练习目录用Python 3.10+执行python3 c01_warranty_demo.py；仅标准库json，无第三方依赖、网络、实际模型或真实业务写入。

代码中的choose_action是确定性规则替身，负责给下一步建议；read_policy是查询工具替身；run_warranty负责约束、执行、收回观察和停止。drafts字典模拟草稿存储，saved回执只证明本次内存对象已保存，不是商城保存记录。真实模型需要另接候选动作接口，并验证建议质量与权限，不能把规则替身称为真实Agent表现。

```python
''' + CODE + '''```

正常题定预期：completed、tool_calls=2，轨迹依次read_policy/found与save_draft/saved。其他预期分别是缺型号waiting_for_info、拒绝permission_denied、持续超时no_progress、限额1时tool_budget_exhausted、步数1时step_limit。这里给的是预期，不是已运行结果。开始前cancelled或deadline_expired用于模拟停止信号；本示例没有真实墙钟计时、异步中途取消、费用账单、身份鉴别、持久化或恢复，不应用于真实商城。真实运行要在每个动作前接入可靠时钟/取消与预算，并核具体用户和对象权限。

作者实际结果为空；独立QA可以提取本节代码，核对代码hash和源稿hash后单独运行。旧v0.5三个示例的运行报告不能直接给本新版整体包授予“已执行”。'''
c['examples'] = [{'id': 'c01-example', 'title': '保修任务的内存控制循环', 'kind': 'unexecuted_code', 'environment': 'Python 3.10+；标准库json；本次运行内存隔离，无网络/模型/真实商城', 'expectedResult': '正常completed/2次工具调用；缺型号waiting_for_info；拒绝permission_denied；持续超时no_progress；额度和步数不足分别停止；取消/模拟截止到期不调用工具。', 'executionStatus': 'not_run', 'evidenceReferences': [], 'actualResults': [], 'codeSha256': sha(CODE), 'codeSectionId': 'example', 'limits': '规则替身不是实际模型；模拟开始前取消/到期，不实现异步取消或真实时间费用；内存回执非真实业务结果。作者未执行，独立证据另绑定。'}]

concepts = []
for k in c['knowledgePoints']:
    concepts.append('### ' + k['title'] + '\n\n' + k['explanation'] + '\n\n直接题：' + k['question'] + '\n\n参考结论：' + k['answer'] + '\n\n解析：' + k['analysis'] + '\n\n迁移：' + k['transfer'])
practice = []
for e in exercises:
    practice.append('### ' + e['title'] + '\n\n输入：' + e['input'] + '\n\n任务：' + e['task'] + '\n\n提交物：' + '；'.join(e['deliverables']) + '。\n\n参考解法：' + e['referenceSolution'] + '\n\n反馈：' + e['feedback'] + '\n\n迁移条件：' + e['transferPrompt'] + '\n\n范围：公开学习题；未取得独立学员答卷，作者未执行。')

bodies = {
    'scope': '本章只解决一个执行问题：售后知识助手怎样根据结果推进小林的保修查询，并准确结束。它沿用受控售后知识助手工程项目，但只使用小林、海岚商城和星河耳机这一个具体场景。任务产物是一份有资料依据、已保存的答复草稿；不扩展成退款、外发或维修安排。虚构手册和工具替身只用于教学。\n\n阅读先从四小课顺序进入；本九节是可以展开查阅的教案详单。固定查询流程也是合理起点，不以复杂架构作为先进性的证明。',
    'outcomes': '保留原模块目标：\n\n- 按任务不确定性选择固定流程或动态决策。\n- 根据工具反馈决策并设置停止预算。\n\n先修仍为f02。短诊断：模型说“我将保存草稿”时，是否已经保存？没有；那是建议，需要应用执行工具并核回执。如果还分不清，先补读f02的模型建议与应用执行。编程不熟者可先预览四小课，再回f01练习字典、if、for与断言。\n\n第一个目标对应“选择执行方式”“认识控制循环”，用同任务固定/动态方案比较核对；第二个目标对应“利用工具反馈”“限制任务运行”，用实际轨迹及正常/失败/耗尽记录核对。进阶协作迁移保留在c01-transfer，不插进循环入门。阅读完、小练习看答案或作者自查都不自动授予掌握。',
    'concepts': '\n\n'.join(concepts) + '\n\n技术补充：本章小图是一种按职责讲解的方法，不是八层强制规范。任务状态可以放在内存数据结构里，长任务的持久化和恢复另学e01。部分模型支持图像输入，本例仅用文字。日志遵循必要、最小化、脱敏和访问控制；不无条件记录用户原文或全部工具结果。',
    'case': '虚构输入：“帮我查一下星河耳机的保修期限，给我保存一份答复草稿。”小林是顾客，海岚商城是题定售后服务方，售后知识助手处理这次请求。\n\n正常路径：小林给出型号星河-01；工具查得星河保修-v1，片段为“购买之日起12个月”；助手形成同义答复；内存草稿工具返回小林保修草稿-01及相同资料引用；应用核回执后标completed。没有真实商城、用户或政策依据，这条保修内容是原创夹具。\n\n缺型号路径：工具返回needs_product_model；程序暂停，询问具体型号；收到合法新信息后另一次受限运行继续。示例本身不实现跨运行的对话持久化。超时路径：按允许上限重试，连续同错2次后no_progress；对象被拒绝时permission_denied，不绕过权限。\n\n完成条件：适用资料支持答复，且该答复的草稿保存回执已核对。仅有生成文字或完整计划不能证明完成。正常、缺项、失败、预算耗尽的所有过程在这里均为题定推演，actualResults保持空。',
    'example': example_text,
    'practice': '\n\n'.join(practice),
    'validation': '先按题定输入手算每步，再在自己的隔离实现中记录实际轨迹。至少检查正常found/saved、缺型号、拒绝读取、持续超时、额度不足、步数不足和开始前取消。把动作前额度判断放在能阻止下一次工具调用的位置。预算1时最多1次调用，不能先执行第2次再说超限。正常完成须核资料与草稿回执。\n\n比较固定查询流程与受限循环时冻结相同请求、资料、权限和额度，分别记录结果、调用、错误分支、实际时间以及实现成本；本章规则替身只验证程序路径，不能给真实模型选择能力评分。真实模型费用和波动需另外取得。\n\n沿用原量规：0无证据或关键错误；1依赖脚手架、证据不完整；2独立完成约定任务且可复现；3未知任务与异常下复现并解释改进。适用维度至少2且安全关键不失败，是未行业校准的教学规则，不是职业认证。公开答案不作为未知保留题。\n\n作者未执行；运行结果、独立AI文稿审校、人类行业审核和真实学习反馈分别记录，均须对应当前输入版本。',
    'sources': '本章机制参考：[Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)，Anthropic，2024-12-19，实际复访2026-10-11，定位What are agents、When (and when not)、Agents、Combining and customizing。只采用固定路径与动态控制、简单起点、环境反馈和停止控制的有限原理；网页也说明工具生态已变化，不据此推荐现行最佳框架。\n\n权限及外部资料边界参考：[OWASP LLM01:2025](https://genai.owasp.org/llmrisk/llm01-prompt-injection/)，实际访问2026-10-11，定位Prevention and Mitigation的最小权限、外部内容、高风险批准。不是本例权限字典已具备生产鉴权的证明。\n\n模型能力限定参考：[Vision](https://platform.claude.com/docs/en/build-with-claude/vision)，Anthropic滚动官方文档，实际访问2026-10-11，定位视觉输入介绍；只支持“部分模型可接受图像输入”，没有调用模型，不推广到所有输入输出模态。\n\n用户附件agent架构.rtf仅作“地图、职责、具体任务、分阶段”的表达参考。固定八层、组件相加公式、没有State Manager就不是Agent、读操作自动允许、无条件日志和无上限循环均未照抄为技术标准。\n\n人物、保修期限、字段、数字预算、图、代码、状态优先级、题目和解法为原创教学设计。作者仅做领域自查，不审校自己的作品；独立AI审校另附，人类行业专家及真实学员效果待取得。',
    'reflection': '复盘一个可观察的问题：查询超时却把任务写成completed。先保存原输入、当前代码、实际返回和错误状态，再提出原因假设，例如“程序把最后一句模型答复当作完成证据”。单项改动是改为核对适用手册与草稿回执；用原失败输入复验，然后增加“已查资料但保存失败”的新条件检查。\n\n比较另一项改进：给固定流程加明确缺型号分支，是否已经能处理小林请求？若能，先保留简单方案；若不能，再说明未知反馈具体在哪里造成限制。记录同条件结果，不用“多了一个Agent”代替优势。\n\n后续学习：c02学习怎样判断资料适用性；c03学习真实工具参数和对象授权；e01学习中断后的状态恢复；e02学习同条件评价；e05学习实际费用。当前示范没有完成这些后续能力，也没有证明真实用户更容易理解。'
}
for s in c['sections']:
    s['bodyMarkdown'] = bodies[s['id']]
    s['bodySha256'] = sha(s['bodyMarkdown'])
    s['sourceIds'] = ['agent-patterns'] if s['id'] == 'concepts' else (c['sourceIds'] if s['id'] == 'sources' else [])

c['claims'] = [
    {'id': 'c01-control-claim', 'text': '预写工作流与模型根据反馈选择下一步是两种控制方式；可组合，应按任务比较。', 'sourceIds': ['agent-patterns'], 'locators': [{'sourceId': 'agent-patterns', 'locator': 'What are agents; Combining and customizing'}], 'status': 'source_checked', 'limits': '限原理，非唯一Agent定义、规范或本项目运行成绩。'},
    {'id': 'c01-feedback-claim', 'text': '执行中需要环境反馈来核进展，可设置最大迭代等停止控制。', 'sourceIds': ['agent-patterns'], 'locators': [{'sourceId': 'agent-patterns', 'locator': 'Agents'}], 'status': 'source_checked', 'limits': '具体6步/4调用/2同错及完成条件为原创设计。'},
    {'id': 'c01-privilege-claim', 'text': '应用需限制实际工具能力，外部内容不能自动变成授权。', 'sourceIds': ['owasp-injection'], 'locators': [{'sourceId': 'owasp-injection', 'locator': 'Prevention and Mitigation: privilege control; segregate external content'}], 'status': 'source_checked', 'limits': '原则参考，不证明示例有可靠身份或完整注入防护。'},
    {'id': 'c01-modalities-claim', 'text': '部分模型支持图像输入，本例文本选择不能推广成所有模型只支持文本。', 'sourceIds': ['claude-vision-v06'], 'locators': [{'sourceId': 'claude-vision-v06', 'locator': 'Vision introduction; Send images to Claude'}], 'status': 'source_checked', 'limits': '未验证所有模型、音视频或图像输出。'},
    {'id': 'c01-case-design', 'text': '小林/海岚商城/星河耳机、保修12个月、内存草稿回执、预算与停止状态是原创教学约定。', 'sourceIds': [], 'locators': ['chapterCase; readingLessons; sections/example'], 'status': 'original_design', 'limits': '非实际商家政策、用户研究、真实模型/业务或行业标准。'}
]
c['review'] = copy.deepcopy(book['review'])
c['limits'] = ['本章为v0.6示范，十一章未改写。', '虚构只读查询与内存草稿；无真实模型、外发、退款或商城写入。', '新示例作者未执行，独立证据另绑定；原v0.5执行报告不继承给新包。', '用户理解反馈、真人行业专家、真实学习效果及行业优势尚无证据。']
c['verification'] = {'executionStatus': 'not_run', 'actualResults': [], 'normal': {'input': '星河-01/found/saved', 'expected': 'completed，2次工具调用'}, 'boundary': {'input': 'tool_budget=1或max_steps=1', 'expected': '分别tool_budget_exhausted或step_limit，不执行第2工具'}, 'failure': {'input': 'timeout连续2次或permission_denied', 'expected': 'no_progress或permission_denied，未完成'}, 'rubricVersion': old['curriculumVersion'], 'evidenceRequired': ['两种方案比较', '执行轨迹与停止说明'], 'independentEvidence': []}

# 作者领域一致性自查：不是独立审校、示例执行或应用验收。
assert [ch['id'] for ch in book['chapters']] == [ch['id'] for ch in old['chapters']]
assert book['rubric'] == old['rubric']
for before, after in zip(old['chapters'], book['chapters']):
    if before['id'] != 'c01':
        assert before == after
    assert before['objectives'] == after['objectives']
    assert before['prerequisites'] == after['prerequisites']
assert [s['id'] for s in c['sections']] == [s['id'] for s in next(ch for ch in old['chapters'] if ch['id'] == 'c01')['sections']]
assert [k['id'] for k in c['knowledgePoints']] == ['c01-k01', 'c01-k02', 'c01-k03', 'c01-k04']
assert [e['id'] for e in c['exercises']] == ['c01-scaffold', 'c01-independent', 'c01-transfer']
assert [l['id'] for l in c['readingLessons']] == m['readingLessonIds']
for l in c['readingLessons']:
    assert all(key in l for key in spec['readingLessonContract']['required'])
    assert l['checkQuestion'] not in l['bodyMarkdown']
    assert l['checkAnswer'] not in l['bodyMarkdown']
    assert '租户A' not in l['bodyMarkdown'] and '租户B' not in l['bodyMarkdown']

JSON = ROOT / 'textbook-v06.json'
JSON.write_text(json.dumps(book, ensure_ascii=False, indent=2) + '\n')

lines = ['# ' + book['title'], '', '教材包版本：' + book['version'] + '；课程规格：' + book['specVersion'] + '。', '', '**本轮只改写c01 Agent控制循环示范，其他十一章保持v0.5原稿。** AI作者草稿；人类行业专家审核、用户理解与真实学习效果待完成。新示例未由作者执行，独立记录另附且须匹配当前源稿。', '', '## 目录', '']
for ch in book['chapters']:
    lines.append('- ' + ch['id'] + ' · ' + ch.get('readingTitle', ch['title']) + '（' + ch['version'] + '）')
for ch in book['chapters']:
    lines.extend(['', '# ' + ch['id'] + ' · ' + ch.get('readingTitle', ch['title']), '', '章节版本：' + ch['version'] + '；AI作者草稿。', ''])
    if 'readingLessons' in ch:
        lines.extend([ch['readingIntro']['problem'], '', '学完能做什么：' + ch['readingIntro']['learningOutcome'], '', '需要哪些基础：' + ch['readingIntro']['prerequisiteSummary'], '', ch['readingIntro']['caseSummary'], ''])
        for lesson in ch['readingLessons']:
            lines.extend(['## ' + str(lesson['order']) + '. ' + lesson['title'], '', lesson['coreQuestion'], '', lesson['bodyMarkdown'], '', '### 小练习', '', lesson['checkQuestion'], '', '### 参考答案（公开学习资料）', '', lesson['checkAnswer'], ''])
        lines.extend(['## 来源、教案与验证详单', '', '以下保留原九节身份、原目标与练习量规，供查阅；不需要在入门主线上重复阅读。', ''])
    for section in ch['sections']:
        lines.extend(['## ' + section['title'], '', section['bodyMarkdown'], ''])
    lines.extend(['章节验证：' + ch['verification']['executionStatus'] + '；作者实际结果为空。独立结果须匹配输入；真人行业审核和学员效果待完成。', ''])
lines.extend(['## 本轮身份与来源包', '', '改写章节：c01。其余十一章正文逐值继承textbook-draft-0.5，旧案例及旧说明在其原章保留。原十二模块目标、先修与量规不变；全书改写尚未完成。', '', '来源与论断的详细定位、支持范围和未测状态保存在同版JSON。作者未做独立审校或独立运行；独立报告不写回作者源包。', ''])
MD = ROOT / 'textbook-v06.md'
MD.write_text('\n'.join(lines))
print(json.dumps({'jsonSha256': hashlib.sha256(JSON.read_bytes()).hexdigest(), 'mdSha256': hashlib.sha256(MD.read_bytes()).hexdigest(), 'codeSha256': sha(CODE), 'lessons': len(c['readingLessons']), 'readingBodyChars': sum(len(l['bodyMarkdown']) for l in c['readingLessons']), 'authorCodeExecution': 'not_run', 'wholeBookRewriteComplete': False}, ensure_ascii=False))
