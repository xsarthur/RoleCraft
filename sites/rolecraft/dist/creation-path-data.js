// Static copy of team/creation-path.json; no runtime fetch.
const creationPathData = {
  "id": "agent-product-creation",
  "version": "creation-path-draft-0.1",
  "status": "新增教学路线草案，正式正文与专业审核待完成",
  "updatedAt": "2026-10-10",
  "title": "从 0 到 1 的 Agent 产品创造",
  "scope": "学习者从行业问题发现到可验证产品交付的教学路线；不决定职造网站产品范围。",
  "benchmarkSources": [
    {
      "id": "customer-discovery",
      "title": "FAQ: I-Corps Team Solicitation",
      "organization": "NSF",
      "type": "官方客户发现方法",
      "url": "https://www.nsf.gov/funding/information/faq-i-corpstm-team-solicitation",
      "accessedAt": "2026-10-10",
      "publishedAt": "2018-03-28",
      "scope": "Selection criteria、I-Corps curriculum：明确问题、利益相关者和价值假设，通过客户发现学习。",
      "limits": "历史项目 FAQ，仅引用方法；不套用其招生、资助、访谈数量或时长规定。"
    },
    {
      "id": "product-experiments",
      "title": "Patterns of Trustworthy Experimentation: Pre-Experiment Stage",
      "organization": "Microsoft Research",
      "type": "官方产品实验方法",
      "url": "https://www.microsoft.com/en-us/research/articles/patterns-of-trustworthy-experimentation-pre-experiment-stage/",
      "accessedAt": "2026-10-10",
      "publishedAt": null,
      "scope": "Formulate your Hypothesis and Success Metrics：可证伪假设、成功和护栏指标、实验设计及可比人群。",
      "limits": "主要针对在线受控实验；小样本访谈或单次试用不能据此推断因果和总体效果。"
    },
    {
      "id": "agent-evaluation",
      "title": "Demystifying evals for AI agents",
      "organization": "Anthropic Engineering",
      "type": "官方技术评估方法",
      "url": "https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents",
      "accessedAt": "2026-10-10",
      "publishedAt": "2026-01-09",
      "scope": "The structure of an evaluation、Capability vs. regression evals、How evals fit with other methods：真实结果、轨迹、多次试验及线上线下证据互补。",
      "limits": "不定义行业领先或商业成功；需按具体用户和应用制定指标。"
    }
  ],
  "stages": [
    {
      "id": "discover",
      "title": "行业问题与用户证据",
      "objectives": [
        "区分问题假设、用户陈述与观察行为",
        "从具体工作任务识别痛点及现有替代"
      ],
      "prerequisites": [
        "能记录资料与访谈出处"
      ],
      "deliverables": [
        "目标用户与场景",
        "真实访谈/观察记录及反例",
        "问题与证据对应表"
      ],
      "evaluation": {
        "success": "目标群体、具体问题和现有处理方式有可追溯证据，达到预先约定的发现标准。",
        "failure": "可靠证据反驳关键问题或目标群体假设；记录停止或转向依据。",
        "insufficient": "只有作者设想、朋友赞同或不可追溯摘要；样本范围不足且未说明。"
      },
      "retrospectiveQuestions": [
        "记录中哪些是事实，哪些是推断？",
        "是否主动寻找不需要产品的人？",
        "证据能支持何种范围的判断？"
      ],
      "moduleIds": [
        "p01"
      ],
      "benchmarkSourceIds": [
        "customer-discovery"
      ],
      "currentStatus": "未评估",
      "formalLessonStatus": "正文待完成",
      "professionalReview": "未完成"
    },
    {
      "id": "baseline",
      "title": "现有产品与研究基线",
      "objectives": [
        "检索当前可用替代和公开研究",
        "建立任务、版本、环境与评价口径相同的比较"
      ],
      "prerequisites": [
        "discover"
      ],
      "deliverables": [
        "官方资料和访问日期",
        "代表性替代方案/简单方案",
        "可比条件与基线结果"
      ],
      "evaluation": {
        "success": "相关方案选择有理由，比较任务与资源条件可核对，已建立可复现基线。",
        "failure": "对照不匹配、版本不明或测量失真；需修订比较后重测。",
        "insufficient": "只凭营销文案或论文标题，没有可比实测；无法访问的方案明确未知。"
      },
      "retrospectiveQuestions": [
        "是否遗漏人工或简单工作流替代？",
        "结果是直接测量还是厂商声称？",
        "比较环境或版本差异会怎样影响结论？"
      ],
      "moduleIds": [
        "c01",
        "c02",
        "e02"
      ],
      "benchmarkSourceIds": [
        "agent-evaluation",
        "product-experiments"
      ],
      "currentStatus": "未评估",
      "formalLessonStatus": "正文待完成",
      "professionalReview": "未完成"
    },
    {
      "id": "hypothesis",
      "title": "差异化与验证假设",
      "objectives": [
        "把用户价值差异写成可证伪假设",
        "预先定义目标、护栏与证据条件"
      ],
      "prerequisites": [
        "discover",
        "baseline"
      ],
      "deliverables": [
        "差异化假设",
        "主要指标及护栏",
        "实验计划与停止/转向规则"
      ],
      "evaluation": {
        "success": "差异对应用户问题，指标可测，阈值与比较条件在看结果前约定并有理由。",
        "failure": "差异与用户需求无关，假设不可检验或指标奖励错误行为。",
        "insufficient": "基线、样本可行性、阈值依据未知；明确待补数据，不造目标数。"
      },
      "retrospectiveQuestions": [
        "为什么这个差异值得用户改变行为？",
        "什么结果会使我们放弃假设？",
        "护栏是否覆盖安全、成本与关键体验？"
      ],
      "moduleIds": [
        "p01",
        "e02",
        "e05"
      ],
      "benchmarkSourceIds": [
        "customer-discovery",
        "product-experiments"
      ],
      "currentStatus": "未评估",
      "formalLessonStatus": "正文待完成",
      "professionalReview": "未完成"
    },
    {
      "id": "mvp",
      "title": "设计与 MVP 实现",
      "objectives": [
        "将假设转成最小端到端任务和失败分支",
        "实现可验证、可复现的版本并记录方案取舍"
      ],
      "prerequisites": [
        "hypothesis",
        "原模块 f01/f02 所需基础；依产物补 c01/c02/c03"
      ],
      "deliverables": [
        "任务与交互说明",
        "实现代码、版本与运行说明",
        "成功和失败演示",
        "需求到证据映射"
      ],
      "evaluation": {
        "success": "真实端到端任务可复现，满足预先约定的 MVP 学习验收及失败处理。",
        "failure": "核心任务无法完成或真实依赖被未标注的模拟替代。",
        "insufficient": "仅有截图、伪代码、单次 Demo 或无法复现的演示；尚无质量与用户效果结论。"
      },
      "retrospectiveQuestions": [
        "哪些假设已经实现并可测试？",
        "哪部分仍是假数据或人工干预？",
        "最小范围足以验证主要假设吗？"
      ],
      "moduleIds": [
        "f01",
        "f02",
        "c01",
        "c02",
        "c03",
        "p01"
      ],
      "benchmarkSourceIds": [
        "agent-evaluation"
      ],
      "currentStatus": "未评估",
      "formalLessonStatus": "正文待完成",
      "professionalReview": "未完成"
    },
    {
      "id": "quality",
      "title": "性能、安全、成本与质量评估",
      "objectives": [
        "在可比条件下评价结果、轨迹和故障行为",
        "量化性能成本，检查安全与回归护栏"
      ],
      "prerequisites": [
        "mvp",
        "原模块 e01/e02/e03/e04/e05 能力"
      ],
      "deliverables": [
        "固定案例与独立保留案例",
        "重复试验、版本与环境",
        "基线比较和不确定性",
        "权限/恢复与负载成本记录"
      ],
      "evaluation": {
        "success": "达到预先约定的任务与护栏标准，改善证据能重复，适用条件和不确定性完整。",
        "failure": "未达到关键目标、出现安全边界失败或回归；不得以其他平均优势抵消。",
        "insufficient": "只有最佳一次结果、训练样例或不可比测试；指标、成本或失败路径缺失。"
      },
      "retrospectiveQuestions": [
        "改进是否在相同条件重复出现？",
        "失败是系统、数据还是评分器造成？",
        "有无牺牲护栏换取更好分数？"
      ],
      "moduleIds": [
        "e01",
        "e02",
        "e03",
        "e04",
        "e05"
      ],
      "benchmarkSourceIds": [
        "agent-evaluation",
        "product-experiments"
      ],
      "currentStatus": "未评估",
      "formalLessonStatus": "正文待完成",
      "professionalReview": "未完成"
    },
    {
      "id": "usage",
      "title": "真实使用验证与交付",
      "objectives": [
        "观察目标用户完成真实任务和采用障碍",
        "区分试用可用性、产品效果与因果证据"
      ],
      "prerequisites": [
        "quality"
      ],
      "deliverables": [
        "真实使用计划与授权范围",
        "任务行为、反馈和负面记录",
        "交付、支持与退出说明",
        "对照或局限及效果报告"
      ],
      "evaluation": {
        "success": "真实用户任务与交付达到预先标准；有可追溯的价值效果及明确证据边界。",
        "failure": "有效观察显示价值不足、不可交付或重要体验护栏失败；登记改善或停止。",
        "insufficient": "无真实用户、只有自述满意或流量不足；不把定性试用提升为统计因果结论。"
      },
      "retrospectiveQuestions": [
        "谁成功，谁退出，为什么？",
        "实际收益与原假设一致吗？",
        "试用结果可推广到哪些人和场景？"
      ],
      "moduleIds": [
        "e04",
        "e05",
        "p01",
        "p02"
      ],
      "benchmarkSourceIds": [
        "customer-discovery",
        "product-experiments",
        "agent-evaluation"
      ],
      "currentStatus": "未评估",
      "formalLessonStatus": "正文待完成",
      "professionalReview": "未完成"
    },
    {
      "id": "iterate",
      "title": "持续迭代与复验",
      "objectives": [
        "用反馈与失败证据制定改进行动",
        "重测原目标、回归与新任务，更新适用范围"
      ],
      "prerequisites": [
        "usage"
      ],
      "deliverables": [
        "每次产出复盘记录",
        "问题—行动—责任人—版本",
        "复验与回归证据",
        "新任务和遗留限制"
      ],
      "evaluation": {
        "success": "改进行动产生可复核结果，原目标与护栏重新达标，结论范围随证据更新。",
        "failure": "改进无效或退化且未解决；记录失败，继续开放任务。",
        "insufficient": "只写总结、无行动或无复验；不能标完成、稳定改善或行业先进。"
      },
      "retrospectiveQuestions": [
        "本次产出达标、未达标还是证据不足？",
        "改进改变了什么实际证据？",
        "遗留问题由谁何时用什么方式复验？"
      ],
      "moduleIds": [
        "e02",
        "e04",
        "e05",
        "p01",
        "p02"
      ],
      "benchmarkSourceIds": [
        "product-experiments",
        "agent-evaluation"
      ],
      "currentStatus": "未评估",
      "formalLessonStatus": "正文待完成",
      "professionalReview": "未完成"
    }
  ],
  "evaluationPolicy": {
    "labels": {
      "success": "当次阶段产物按预先标准达标",
      "failure": "当次阶段关键标准未达标",
      "insufficient": "证据不足，暂不能判断"
    },
    "defaultStatus": "未评估",
    "distinction": "严谨证伪可体现学习能力，但产品假设依然失败；阶段学习达标不等于产品先进。",
    "advancedProductEvidence": "在明确行业任务、日期版本与适用范围内，与代表性现有方案按可比条件对比；用户价值改善经真实使用复核，技术质量及安全成本护栏达标，结论经独立专业审查并能复现。",
    "notEquivalent": [
      "教材读完",
      "概念题通过",
      "项目勾选",
      "作者自述",
      "Demo 可运行",
      "招聘能力对标",
      "单次最好分数"
    ],
    "thresholdPolicy": "各产物先约定指标定义、目标/护栏、样本与测量条件；未知值用 null 或待确认，不自动生成行业领先百分比。",
    "currentAdvancedAssessment": "尚无真实产品及比较、用户或专业评审证据，行业先进未验证"
  },
  "retrospectiveTemplate": {
    "fields": [
      "目标与预先标准",
      "产出版本",
      "证据与条件",
      "达标/未达标/证据不足",
      "差距与原因假设",
      "改进行动",
      "责任人",
      "复验方法",
      "复验结果与状态",
      "遗留限制"
    ],
    "rule": "每次产出填写；无复验仍为未完成。学习反思与团队项目复盘记录分别保存。"
  },
  "domainSelfCheck": {
    "completed": [
      "七阶段各有目标、先修、提交物、三种评价与复盘问题",
      "原 12 个模块均被路线关联",
      "三份官方方法资料已访问并记录范围",
      "未编造数据阈值、学习者结果或专家审核"
    ],
    "evidence": [
      "benchmarkSources 的访问日期和章节范围",
      "stages 的评价、moduleIds 与复盘字段"
    ],
    "remaining": [
      "完整教学正文",
      "专业行业评审",
      "真实学习者与产品效果验证"
    ],
    "independentReview": "待对应岗位复核"
  }
};
