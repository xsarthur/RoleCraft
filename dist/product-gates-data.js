// Static copy of team/product-gates.json; no runtime fetch.
const productGatesData = {
  "schemaVersion": "1.0",
  "standardVersion": "product-creation-2026-10-10",
  "title": "职造：从学习到创造产品的达标标准",
  "scope": "formal_learning_product",
  "scopeLabel": "正式职业学习系统",
  "basis": "用户目标与产品需求草案，尚未完成行业专业评审",
  "conclusions": {
    "not_met": "未达标",
    "insufficient": "证据不足",
    "met_within_scope": "在明确范围内达标"
  },
  "gateStatuses": {
    "fail": "未通过",
    "insufficient": "证据不足",
    "pass": "在该门槛范围内通过"
  },
  "decisionRules": {
    "requiredFailure": "任一必需项为 fail，结论为 not_met。不得以平均分抵消。",
    "missingEvidence": "没有失败但任一必需项证据缺失、不可追溯或状态不足，结论为 insufficient。",
    "allPassed": "全部必需项为 pass 且有对应证据，结论为 met_within_scope，必须显示范围和产物版本。",
    "selfClaim": "用户陈述和上传链接仅形成自评，记录不证明链接内容真实或已审核。",
    "advancedClaim": "必须有可比行业产品及研究基线、预定义指标和真实实测，缺失不得宣称行业先进。",
    "scopeIsolation": "静态功能验收仅证明本轮交互功能，不能改变正式系统门槛状态。",
    "auditIsolation": "用户自评不可修改独立 QA 审计与专业评审；无审计交付显示未独立审核。"
  },
  "benchmarkFields": [
    "source",
    "sourceType",
    "date",
    "version",
    "task",
    "sample",
    "resourceConstraints",
    "metric",
    "targetThreshold",
    "comparisonMethod",
    "actualResults"
  ],
  "benchmarkSourceTypes": [
    "industry_product",
    "research",
    "professional_review"
  ],
  "reviewFields": [
    "productGoal",
    "artifactId",
    "artifactVersion",
    "scope",
    "baseline",
    "gateEvidence",
    "actualResults",
    "gap",
    "cause",
    "owner",
    "nextAction",
    "retestConditions",
    "retestResult"
  ],
  "auditFields": [
    "artifactVersion",
    "scope",
    "standardVersion",
    "auditor",
    "date",
    "gateResults",
    "evidence",
    "conclusion",
    "remainingItems"
  ],
  "evidenceTypes": [
    "self_report",
    "learning_record",
    "project_artifact",
    "automated_evaluation",
    "independent_qa",
    "professional_review",
    "user_validation"
  ],
  "gates": [
    {
      "id": "user_value",
      "label": "用户价值",
      "required": true,
      "owner": "产品经理",
      "criterion": "目标人群、问题和验证指标在试验前定义，有真实用户证据且达到预定阈值。",
      "evidenceRequired": [
        "用户访谈或观察记录",
        "预定义指标与阈值",
        "实际验证结果"
      ],
      "staticLimit": "访谈表单及故事展示不等于真实用户验证",
      "initialStatus": "insufficient",
      "initialReason": "现有交付未提供真实目标用户验证结果"
    },
    {
      "id": "teaching_quality",
      "label": "教学覆盖与深度",
      "required": true,
      "owner": "课程架构师",
      "criterion": "能力、章节、练习和作品建立关联；内容覆盖、深度、来源与案例通过内容核对和专业复核。",
      "evidenceRequired": [
        "能力覆盖与深度矩阵",
        "章节及来源版本",
        "示例验证记录",
        "专业内容复核记录"
      ],
      "staticLimit": "目录、矩阵及短教材示例不证明完整教材质量",
      "initialStatus": "insufficient",
      "initialReason": "已有示例及标准草案，正式内容深度与专业审核尚未证实"
    },
    {
      "id": "real_generation",
      "label": "真实教材生成",
      "required": true,
      "owner": "软件工程师",
      "criterion": "真实模型依学习档案生成教材，保存生成过程、来源及版本，示例验证与失败状态真实。",
      "evidenceRequired": [
        "真实模型执行记录",
        "档案与产物关联",
        "主要论断来源",
        "示例验证结果",
        "失败及恢复记录"
      ],
      "staticLimit": "模板组合、预设文字、动画及表单不能视为模型生成",
      "initialStatus": "fail",
      "initialReason": "当前项目尚未接入真实模型与动态资料核对"
    },
    {
      "id": "comparative_advantage",
      "label": "可比差异化优势",
      "required": true,
      "owner": "产品经理",
      "criterion": "选定行业产品及研究基线，在同任务、样本、资源与评分条件下验证差异化指标，并记录专业评审。",
      "evidenceRequired": [
        "基线来源及日期版本",
        "预定义任务与指标",
        "公平比较条件",
        "实测结果",
        "专业评审"
      ],
      "staticLimit": "招聘标准、营销文案及自述优势不能代替竞争基线",
      "initialStatus": "insufficient",
      "initialReason": "现有交付没有同条件基线比较实证"
    },
    {
      "id": "learner_creation",
      "label": "学习者创造产品能力",
      "required": true,
      "owner": "课程架构师",
      "criterion": "学习者产出可运行 MVP，具备测试、目标用户验证和独立作品评审，并满足预定评分条件。",
      "evidenceRequired": [
        "学习者 MVP 版本",
        "运行与测试记录",
        "目标用户验证",
        "独立作品评审",
        "预定义评分标准"
      ],
      "staticLimit": "教材完成率、概念题及项目自查不证明产品创造能力",
      "initialStatus": "insufficient",
      "initialReason": "尚无真实学习者产品及独立评审结果"
    },
    {
      "id": "reliable_delivery",
      "label": "生产可靠交付",
      "required": true,
      "owner": "软件工程师",
      "criterion": "真实系统的持久化、账户权限隔离、异常恢复及版本追踪经独立验证，满足明确运行范围。",
      "evidenceRequired": [
        "正式运行范围",
        "账户与隔离验证",
        "持久化及异常恢复记录",
        "版本追踪",
        "独立 QA 结果"
      ],
      "staticLimit": "本地存储和静态页面验收不能代替账户数据库及生产运行验证",
      "initialStatus": "fail",
      "initialReason": "当前是静态交互原型，账户数据库及正式运行体系未实现"
    },
    {
      "id": "operating_economics",
      "label": "成本与运营",
      "required": true,
      "owner": "产品经理",
      "criterion": "真实调用与交付记录包含成本、耗时、质量及维护机制，达到预定资源预算。",
      "evidenceRequired": [
        "预定义资源预算",
        "真实成本与耗时",
        "质量数据",
        "维护机制与责任人"
      ],
      "staticLimit": "课程参考时长及虚构成本不能代表实际运营指标",
      "initialStatus": "insufficient",
      "initialReason": "没有真实生成与运营成本证据"
    },
    {
      "id": "iteration_trace",
      "label": "产出复盘与复验",
      "required": true,
      "owner": "项目经理",
      "criterion": "每次产出记录版本、门槛、实际证据、差距、原因、责任人、下一步及复验条件与结果；自评、QA、专业审核分别记录。",
      "evidenceRequired": [
        "产物版本与门槛",
        "实际证据及差距",
        "责任人与行动",
        "复验条件及状态",
        "独立检查记录"
      ],
      "staticLimit": "填写复盘报告不等于改进完成；未复验明确保留未完成状态",
      "initialStatus": "insufficient",
      "initialReason": "须逐轮核对交付及复验，本标准文件不代替复验记录"
    }
  ],
  "initialAssessment": {
    "kind": "product_document_review",
    "conclusion": "not_met",
    "scope": "formal_learning_product",
    "basis": [
      "AGENTS.md 当前项目边界",
      "README.md 实际边界",
      "team/product-review.md",
      "team/product-standard.md"
    ],
    "limitation": "产品经理基于交付文档评估，未执行功能测试或独立 QA 审计。",
    "advancedStatus": "无可比实证，不能认定行业先进",
    "professionalReviewStatus": "未专业审核"
  },
  "selfCheck": {
    "domain": "产品需求",
    "completed": [
      "双目标",
      "零到一闭环",
      "八项必需门槛",
      "失败优先且缺证不通过",
      "自评与独立审计分离",
      "交接与本轮范围"
    ],
    "pending": [
      "行业专业评审",
      "真实用户验证",
      "实现与独立功能验收"
    ]
  }
};
