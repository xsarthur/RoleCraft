// Generated from team/curriculum-data.json; no runtime fetch required.
const curriculumData = {
  "schemaVersion": "1.0",
  "version": "curriculum-draft-0.2",
  "updatedAt": "2026-10-10",
  "status": "课程地图与能力标准草案",
  "expertReview": "未完成",
  "fullTextbookStatus": "现有八章为短教材示例；本数据不包含完整教材",
  "benchmark": {
    "title": "生产级 Agent 应用工程",
    "aspiration": "以领先企业公开岗位中的工程能力作为培养方向，逐步形成独立交付、协作与改进的证据。",
    "basis": "一份公开企业岗位描述及三份官方技术参考；课程地图和量规是教学推导。",
    "limits": [
      "不代表任何企业认可或录用承诺",
      "公开岗位具有经验、顾问及地域要求，课程不能替代这些条件",
      "正式行业评审与学习效果验证尚未完成"
    ],
    "sourceIds": [
      "job-anthropic",
      "agent-patterns",
      "langgraph",
      "agent-evals"
    ]
  },
  "sources": [
    {
      "id": "job-anthropic",
      "type": "public_job_description",
      "typeLabel": "企业公开岗位描述",
      "title": "Applied AI Engineer, Startups",
      "organization": "Anthropic",
      "url": "https://job-boards.greenhouse.io/anthropic/jobs/5432575008",
      "accessedAt": "2026-10-10",
      "publishedAt": null,
      "sections": [
        "Responsibilities",
        "You may be a good fit if you have"
      ],
      "supports": [
        "Python 与生产应用经验",
        "上下文、Agent 架构、评估及规模化部署",
        "结对编程、架构评审、技术文档与客户协作"
      ],
      "limits": "伦敦岗位具有技术顾问职责，要求 4 年以上相关经验；只选取工程能力作为参考，不是完整招聘资格或课程认证。"
    },
    {
      "id": "agent-patterns",
      "type": "technical_reference",
      "typeLabel": "官方技术能力参考",
      "title": "Building effective agents",
      "organization": "Anthropic Engineering",
      "url": "https://www.anthropic.com/engineering/building-effective-agents",
      "accessedAt": "2026-10-10",
      "publishedAt": "2024-12-19",
      "sections": [
        "When (and when not) to use agents",
        "Building blocks, workflows, and agents",
        "Agents"
      ],
      "supports": [
        "工作流与动态决策的选择",
        "检索、工具与记忆的组合",
        "依据环境反馈执行并设停止条件"
      ],
      "limits": "页面提示工具生态已变化；用于原理和取舍，不用于断言当前 API 或最佳框架。"
    },
    {
      "id": "langgraph",
      "type": "technical_reference",
      "typeLabel": "官方技术能力参考",
      "title": "LangGraph overview",
      "organization": "LangChain",
      "url": "https://docs.langchain.com/oss/python/langgraph/overview",
      "accessedAt": "2026-10-10",
      "publishedAt": null,
      "sections": [
        "Core benefits"
      ],
      "supports": [
        "持久化和失败恢复",
        "人工介入与显式状态",
        "运行轨迹与状态观察"
      ],
      "limits": "框架概览不是完整可运行教材；具体实现仍需版本化 API 文档。"
    },
    {
      "id": "agent-evals",
      "type": "technical_reference",
      "typeLabel": "官方技术能力参考",
      "title": "Demystifying evals for AI agents",
      "organization": "Anthropic Engineering",
      "url": "https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents",
      "accessedAt": "2026-10-10",
      "publishedAt": null,
      "sections": [
        "Types of graders for agents",
        "Capability vs. regression evals",
        "Evaluating coding agents"
      ],
      "supports": [
        "结果及执行轨迹评价",
        "代码、模型与人工评审的组合及校准",
        "能力测评与回归区分，成本和延迟记录"
      ],
      "limits": "方法参考；本项目量规和数字阈值是教学草案，不是该企业标准。"
    }
  ],
  "competencies": [
    {
      "id": "software",
      "title": "编程与软件工程",
      "description": "独立实现、调试、测试并交接可复现服务",
      "sourceIds": [
        "job-anthropic"
      ]
    },
    {
      "id": "model-context",
      "title": "模型与上下文",
      "description": "调用与校验模型，管理信息边界并比较方案",
      "sourceIds": [
        "job-anthropic",
        "agent-patterns"
      ]
    },
    {
      "id": "retrieval-data",
      "title": "检索与数据",
      "description": "管理资料版本、检索证据并识别无答案情况",
      "sourceIds": [
        "agent-patterns"
      ]
    },
    {
      "id": "tools-state",
      "title": "工具与状态",
      "description": "用真实结果驱动动作，保证权限、停止与恢复",
      "sourceIds": [
        "agent-patterns",
        "langgraph"
      ]
    },
    {
      "id": "eval-safety",
      "title": "评估与安全",
      "description": "构建独立评估，验证轨迹、隔离与受控失败",
      "sourceIds": [
        "agent-evals",
        "agent-patterns"
      ]
    },
    {
      "id": "operations",
      "title": "部署、性能与成本",
      "description": "复现部署、监测运行并以数据比较服务取舍",
      "sourceIds": [
        "job-anthropic",
        "agent-evals"
      ]
    },
    {
      "id": "product-collaboration",
      "title": "产品与协作",
      "description": "把业务问题转成任务标准，解释方案并接受评审",
      "sourceIds": [
        "job-anthropic"
      ]
    }
  ],
  "levels": [
    {
      "id": "foundation",
      "title": "基础",
      "outcome": "能复现并解释一个小服务",
      "depth": "理解原理并在脚手架下实现",
      "gate": "新环境复现、非法输入处理、关键测试与口头解释"
    },
    {
      "id": "core",
      "title": "核心",
      "outcome": "能独立构建有据回答和工具任务",
      "depth": "独立实现，比较至少两种合理方案",
      "gate": "提交可运行项目、证据引用和真实工具轨迹"
    },
    {
      "id": "engineering",
      "title": "工程",
      "outcome": "能在受控异常下可靠运行并量化质量",
      "depth": "故障注入、回归、安全与性能分析",
      "gate": "恢复、安全边界、回归和性能报告得到独立复核"
    },
    {
      "id": "professional",
      "title": "职业交付",
      "outcome": "能围绕真实需求交付并解释改进",
      "depth": "综合交付、评审答辩与未知任务迁移",
      "gate": "他人复现，专业评审与保留案例评价；当前尚未实施"
    }
  ],
  "modules": [
    {
      "id": "f01",
      "title": "编程、HTTP 与软件测试",
      "level": "foundation",
      "competencyIds": [
        "software"
      ],
      "depth": "理解原理并在脚手架下实现",
      "prerequisites": [],
      "validation": [
        "陌生环境启动",
        "解释至少一种异常路径"
      ],
      "sourceIds": [
        "job-anthropic"
      ],
      "sourceScope": "来源支撑能力方向；具体练习与门槛是课程架构师提出的待评审草案。",
      "status": "课程地图草案",
      "expertReview": "未完成",
      "chapterTemplateId": "uniform-v1",
      "objectives": [
        "实现输入校验、异常处理与 API 请求",
        "使用 Git、依赖锁定和测试复现服务"
      ],
      "evidence": [
        "命令行或 API 服务",
        "有效与非法输入测试",
        "环境和提交记录"
      ],
      "existingChapterIds": [
        "foundation"
      ]
    },
    {
      "id": "f02",
      "title": "模型调用与上下文基础",
      "level": "foundation",
      "competencyIds": [
        "model-context",
        "software"
      ],
      "depth": "理解原理并在脚手架下实现",
      "prerequisites": [
        "f01"
      ],
      "validation": [
        "校验格式合法但业务无效的数据",
        "解释上下文截断风险"
      ],
      "sourceIds": [
        "job-anthropic",
        "agent-patterns"
      ],
      "sourceScope": "来源支撑能力方向；具体练习与门槛是课程架构师提出的待评审草案。",
      "status": "课程地图草案",
      "expertReview": "未完成",
      "chapterTemplateId": "uniform-v1",
      "objectives": [
        "完成真实模型调用及结构与业务双重校验",
        "区分用户输入、工具结果与指令来源"
      ],
      "evidence": [
        "请求与响应示例",
        "缺失信息处理",
        "超时和成本记录"
      ],
      "existingChapterIds": [
        "models"
      ]
    },
    {
      "id": "c01",
      "title": "工作流、Agent 循环与方案选择",
      "level": "core",
      "competencyIds": [
        "model-context",
        "tools-state"
      ],
      "depth": "独立实现，比较至少两种合理方案",
      "prerequisites": [
        "f02"
      ],
      "validation": [
        "正常、工具失败和预算耗尽场景",
        "说明复杂度与效果取舍"
      ],
      "sourceIds": [
        "agent-patterns"
      ],
      "sourceScope": "来源支撑能力方向；具体练习与门槛是课程架构师提出的待评审草案。",
      "status": "课程地图草案",
      "expertReview": "未完成",
      "chapterTemplateId": "uniform-v1",
      "objectives": [
        "按任务不确定性选择固定流程或动态决策",
        "根据工具反馈决策并设置停止预算"
      ],
      "evidence": [
        "两种方案比较",
        "执行轨迹与停止说明"
      ],
      "existingChapterIds": [
        "agent"
      ]
    },
    {
      "id": "c02",
      "title": "资料治理、检索与有据回答",
      "level": "core",
      "competencyIds": [
        "retrieval-data",
        "model-context"
      ],
      "depth": "独立实现，比较至少两种合理方案",
      "prerequisites": [
        "f02"
      ],
      "validation": [
        "旧版本、冲突资料与证据不足测试",
        "独立复核引用是否支持结论"
      ],
      "sourceIds": [
        "agent-patterns"
      ],
      "sourceScope": "来源支撑能力方向；具体练习与门槛是课程架构师提出的待评审草案。",
      "status": "课程地图草案",
      "expertReview": "未完成",
      "chapterTemplateId": "uniform-v1",
      "objectives": [
        "记录数据来源、版本与访问范围",
        "比较检索策略并验证引用与无答案行为"
      ],
      "evidence": [
        "带版本资料集",
        "检索实验与片段引用",
        "可答及不可答问题"
      ],
      "existingChapterIds": [
        "retrieval"
      ]
    },
    {
      "id": "c03",
      "title": "工具契约与业务动作",
      "level": "core",
      "competencyIds": [
        "tools-state",
        "software"
      ],
      "depth": "独立实现，比较至少两种合理方案",
      "prerequisites": [
        "c01",
        "f01"
      ],
      "validation": [
        "重复写入、错误参数和权限不足实验",
        "核对业务记录而非模型自述"
      ],
      "sourceIds": [
        "agent-patterns"
      ],
      "sourceScope": "来源支撑能力方向；具体练习与门槛是课程架构师提出的待评审草案。",
      "status": "课程地图草案",
      "expertReview": "未完成",
      "chapterTemplateId": "uniform-v1",
      "objectives": [
        "实现输入输出契约与授权规则",
        "验证幂等请求与失败反馈"
      ],
      "evidence": [
        "契约与业务工具",
        "授权和重复请求记录"
      ],
      "existingChapterIds": [
        "tools"
      ]
    },
    {
      "id": "e01",
      "title": "状态、检查点与失败恢复",
      "level": "engineering",
      "competencyIds": [
        "tools-state"
      ],
      "depth": "故障注入、回归、安全与性能分析",
      "prerequisites": [
        "c03"
      ],
      "validation": [
        "写入前后及通知阶段中断",
        "恢复不重复业务动作"
      ],
      "sourceIds": [
        "langgraph"
      ],
      "sourceScope": "来源支撑能力方向；具体练习与门槛是课程架构师提出的待评审草案。",
      "status": "课程地图草案",
      "expertReview": "未完成",
      "chapterTemplateId": "uniform-v1",
      "objectives": [
        "显式保存任务状态与已完成动作",
        "在中断后核对外部系统再恢复"
      ],
      "evidence": [
        "持久状态结构",
        "各阶段故障与恢复轨迹"
      ],
      "existingChapterIds": [
        "state"
      ]
    },
    {
      "id": "e02",
      "title": "评估集、追踪与回归",
      "level": "engineering",
      "competencyIds": [
        "eval-safety",
        "operations"
      ],
      "depth": "故障注入、回归、安全与性能分析",
      "prerequisites": [
        "c02",
        "c03"
      ],
      "validation": [
        "固定条件比较版本",
        "模型评分需要人工校准",
        "不得使用训练时见过的样例代替迁移评价"
      ],
      "sourceIds": [
        "agent-evals"
      ],
      "sourceScope": "来源支撑能力方向；具体练习与门槛是课程架构师提出的待评审草案。",
      "status": "课程地图草案",
      "expertReview": "未完成",
      "chapterTemplateId": "uniform-v1",
      "objectives": [
        "区分能力、回归和独立保留案例",
        "分别评价任务结果、轨迹和成本"
      ],
      "evidence": [
        "案例集与量规",
        "基线、改进和回归报告",
        "失败分类"
      ],
      "existingChapterIds": [
        "eval"
      ]
    },
    {
      "id": "e03",
      "title": "安全边界与对抗输入",
      "level": "engineering",
      "competencyIds": [
        "eval-safety",
        "tools-state",
        "retrieval-data"
      ],
      "depth": "故障注入、回归、安全与性能分析",
      "prerequisites": [
        "c02",
        "c03",
        "e02"
      ],
      "validation": [
        "注入、跨用户数据及未授权动作检查",
        "安全关键失败不能以平均分抵消"
      ],
      "sourceIds": [
        "agent-patterns",
        "agent-evals"
      ],
      "sourceScope": "来源支撑能力方向；具体练习与门槛是课程架构师提出的待评审草案。",
      "status": "课程地图草案",
      "expertReview": "未完成",
      "chapterTemplateId": "uniform-v1",
      "objectives": [
        "区分不可信资料与指令",
        "验证最小权限、敏感数据处理和人工介入"
      ],
      "evidence": [
        "威胁假设",
        "受控攻击样例",
        "权限拒绝与脱敏记录"
      ],
      "existingChapterIds": []
    },
    {
      "id": "e04",
      "title": "部署、可观测性与运行维护",
      "level": "engineering",
      "competencyIds": [
        "operations",
        "software"
      ],
      "depth": "故障注入、回归、安全与性能分析",
      "prerequisites": [
        "e01",
        "e02",
        "e03"
      ],
      "validation": [
        "他人按说明部署",
        "依赖失效、重启和回退复现"
      ],
      "sourceIds": [
        "job-anthropic",
        "langgraph"
      ],
      "sourceScope": "来源支撑能力方向；具体练习与门槛是课程架构师提出的待评审草案。",
      "status": "课程地图草案",
      "expertReview": "未完成",
      "chapterTemplateId": "uniform-v1",
      "objectives": [
        "提供分环境配置、可观测运行和回退",
        "用故障记录定位服务阶段"
      ],
      "evidence": [
        "部署说明",
        "监测日志",
        "故障与回退演示"
      ],
      "existingChapterIds": [
        "delivery"
      ]
    },
    {
      "id": "e05",
      "title": "性能、成本与规模取舍",
      "level": "engineering",
      "competencyIds": [
        "operations",
        "model-context"
      ],
      "depth": "故障注入、回归、安全与性能分析",
      "prerequisites": [
        "e02",
        "e04"
      ],
      "validation": [
        "注明模型、样本、重复次数与限制",
        "不得只展示最优单次结果"
      ],
      "sourceIds": [
        "job-anthropic",
        "agent-evals"
      ],
      "sourceScope": "来源支撑能力方向；具体练习与门槛是课程架构师提出的待评审草案。",
      "status": "课程地图草案",
      "expertReview": "未完成",
      "chapterTemplateId": "uniform-v1",
      "objectives": [
        "在约定负载下记录尾延迟与每任务成本",
        "比较缓存、模型选择或并发方案"
      ],
      "evidence": [
        "负载条件",
        "p50/p95 延迟、成功率与成本报告",
        "优化前后比较"
      ],
      "existingChapterIds": []
    },
    {
      "id": "p01",
      "title": "业务理解、技术协作与文档",
      "level": "professional",
      "competencyIds": [
        "product-collaboration",
        "software"
      ],
      "depth": "综合交付、评审答辩与未知任务迁移",
      "prerequisites": [
        "c01",
        "e02"
      ],
      "validation": [
        "非作者根据文档复现",
        "向技术和业务受众解释同一方案"
      ],
      "sourceIds": [
        "job-anthropic"
      ],
      "sourceScope": "来源支撑能力方向；具体练习与门槛是课程架构师提出的待评审草案。",
      "status": "课程地图草案",
      "expertReview": "未完成",
      "chapterTemplateId": "uniform-v1",
      "objectives": [
        "把用户问题映射为可衡量的技术任务",
        "通过架构评审和文档解释取舍"
      ],
      "evidence": [
        "场景和任务标准",
        "架构决策与评审修改",
        "使用与维护文档"
      ],
      "existingChapterIds": []
    },
    {
      "id": "p02",
      "title": "综合作品、答辩与复盘",
      "level": "professional",
      "competencyIds": [
        "software",
        "model-context",
        "retrieval-data",
        "tools-state",
        "eval-safety",
        "operations",
        "product-collaboration"
      ],
      "depth": "综合交付、评审答辩与未知任务迁移",
      "prerequisites": [
        "e01",
        "e03",
        "e04",
        "e05",
        "p01"
      ],
      "validation": [
        "按项目量规评审",
        "保留案例与修改任务",
        "说明当前适用边界"
      ],
      "sourceIds": [
        "job-anthropic",
        "agent-evals"
      ],
      "sourceScope": "来源支撑能力方向；具体练习与门槛是课程架构师提出的待评审草案。",
      "status": "课程地图草案",
      "expertReview": "未完成",
      "chapterTemplateId": "uniform-v1",
      "objectives": [
        "整合证据并完成外部评审",
        "用失败分析改进并迁移到未知任务"
      ],
      "evidence": [
        "可部署作品",
        "完整评价报告",
        "复盘与二次验证",
        "独立任务答辩"
      ],
      "existingChapterIds": []
    }
  ],
  "chapterStructure": {
    "id": "uniform-v1",
    "title": "每章统一教学结构",
    "sections": [
      {
        "id": "scope",
        "title": "职业任务与边界",
        "required": "明确一个主要任务、适用与不适用条件"
      },
      {
        "id": "outcomes",
        "title": "学习目标与先修",
        "required": "2—4 个可观察目标，列出先修能力与诊断方式"
      },
      {
        "id": "concepts",
        "title": "原理与方案取舍",
        "required": "关键概念、至少一个误区；涉及选择时比较方案"
      },
      {
        "id": "case",
        "title": "完整案例",
        "required": "输入、过程、结果与失败分支相互对应"
      },
      {
        "id": "example",
        "title": "示例与环境",
        "required": "注明可运行代码或伪代码；版本、输入、预期输出与验证记录"
      },
      {
        "id": "practice",
        "title": "分层练习",
        "required": "脚手架、独立实现、迁移各一类；明确提交物"
      },
      {
        "id": "validation",
        "title": "验证与反馈",
        "required": "至少正常、边界、失败三类；参考解法、评分依据与错因"
      },
      {
        "id": "sources",
        "title": "来源与审核",
        "required": "关键主张位置、来源版本、访问日期；审核状态分别记录"
      },
      {
        "id": "reflection",
        "title": "复盘与迁移",
        "required": "失败证据、原因假设、改进实验和新任务验证"
      }
    ]
  },
  "qualityRules": [
    {
      "id": "clarity",
      "title": "清晰",
      "measure": "100% 模块明确目标、先修、产物与验证；每章使用统一九项结构。"
    },
    {
      "id": "breadth",
      "title": "广",
      "measure": "7 个能力域均至少关联一个模块和一个可评估产物；不以篇幅或工具数量计覆盖。"
    },
    {
      "id": "precision",
      "title": "精",
      "measure": "每章至少一份任务案例、三类验证、分层练习和关键主张来源；未核验和伪代码明确标记。"
    },
    {
      "id": "review",
      "title": "可验证",
      "measure": "事实、示例、教学和专家审核分别留记录；未实施的审核不显示通过。"
    }
  ],
  "rubric": {
    "status": "教学量规草案，未由行业专家校准",
    "scoreScale": [
      {
        "score": 0,
        "label": "无证据或关键行为错误"
      },
      {
        "score": 1,
        "label": "依赖脚手架，证据不完整"
      },
      {
        "score": 2,
        "label": "独立完成约定任务，证据可复现"
      },
      {
        "score": 3,
        "label": "在未知任务和异常下复现，能解释与改进"
      }
    ],
    "dimensions": [
      {
        "id": "correctness",
        "title": "任务正确性",
        "evidence": "预期结果、引用或外部业务状态"
      },
      {
        "id": "reliability",
        "title": "可靠性与恢复",
        "evidence": "失败、重试、中断与恢复记录"
      },
      {
        "id": "safety",
        "title": "安全与权限",
        "evidence": "授权、数据边界与受控对抗测试"
      },
      {
        "id": "evaluation",
        "title": "评估与证据",
        "evidence": "基线、保留案例、轨迹与失败分类"
      },
      {
        "id": "operations",
        "title": "性能、成本与维护",
        "evidence": "约定负载、延迟、预算、部署与回退"
      },
      {
        "id": "communication",
        "title": "产品理解与协作",
        "evidence": "场景、取舍、文档、评审与答辩"
      }
    ],
    "gate": "适用维度至少 2 分且安全关键测试无失败；综合职业交付再经外部评审与未知案例。当前只展示量规，未授予通过状态。",
    "thresholdOrigin": "课程架构师提出，非企业招聘评分"
  },
  "projects": [
    {
      "id": "p1",
      "title": "有据可查的知识助手",
      "type": "基础综合实践",
      "competencyIds": [
        "software",
        "model-context",
        "retrieval-data",
        "eval-safety",
        "product-collaboration"
      ],
      "deliverables": [
        "至少 5 份有出处和版本的资料",
        "可运行应用和片段引用",
        "正常、无答案、旧版本与对抗输入案例",
        "评估、文档与复盘"
      ],
      "rubricDimensionIds": [
        "correctness",
        "safety",
        "evaluation",
        "communication"
      ],
      "criticalChecks": [
        "引用能支持结论",
        "不伪造无答案内容",
        "不泄露未授权资料"
      ],
      "status": "项目要求草案；现有检查项仍为自查"
    },
    {
      "id": "p2",
      "title": "可恢复的业务 Agent",
      "type": "职业交付综合作品",
      "competencyIds": [
        "software",
        "model-context",
        "retrieval-data",
        "tools-state",
        "eval-safety",
        "operations",
        "product-collaboration"
      ],
      "deliverables": [
        "真实工具、状态和权限边界",
        "中断恢复与重复请求实验",
        "回归和保留案例结果",
        "部署、性能成本与维护说明",
        "外部评审、答辩与改进复盘"
      ],
      "rubricDimensionIds": [
        "correctness",
        "reliability",
        "safety",
        "evaluation",
        "operations",
        "communication"
      ],
      "criticalChecks": [
        "无未授权写入",
        "无重复副作用",
        "恢复结果与实际业务状态一致",
        "敏感配置与数据边界正确"
      ],
      "status": "职业交付评价草案；尚无专家或真实学习者评审"
    }
  ],
  "reflection": {
    "title": "基于证据的复盘",
    "fields": [
      {
        "id": "expected",
        "label": "原目标与评价标准"
      },
      {
        "id": "actual",
        "label": "实际产出与运行证据"
      },
      {
        "id": "gap",
        "label": "差距与失败分类"
      },
      {
        "id": "hypothesis",
        "label": "原因假设及证据/未知"
      },
      {
        "id": "change",
        "label": "改进方案与取舍"
      },
      {
        "id": "retest",
        "label": "相同条件复测与回归"
      },
      {
        "id": "transfer",
        "label": "新任务迁移结果"
      },
      {
        "id": "remaining",
        "label": "遗留问题与下一次验证"
      }
    ],
    "minimum": "每个模块至少分析一项失败或限制；每个项目至少完成一次改进及二次验证。",
    "limits": "文案总结、自信评价和截图不能替代可复现证据。"
  },
  "statusVocabulary": [
    "未提交",
    "待评审",
    "证据不足",
    "达到本任务标准"
  ],
  "reviewStatusVocabulary": [
    "待核验",
    "已核验来源页面",
    "示例待测试",
    "教学待审核",
    "专家审核未完成"
  ]
};
