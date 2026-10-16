// Independent QA reports, preserved exactly as data. Historical reports do not transfer to new versions.
const productAuditData = {
  "reports": [
    {
      "schemaVersion": "1.0",
      "productVersion": "prototype-0.2",
      "standardVersion": "product-creation-2026-10-10",
      "auditedAt": "2026-10-10",
      "reviewer": "测试工程师独立代理 /root/qa_engineer",
      "assessmentScope": "formal_learning_product",
      "assessmentScopeLabel": "以正式职业学习系统八项必需门槛审计当前静态原型",
      "overall": "not_met",
      "overallLabel": "未达标",
      "decisionBasis": "八项均为必需项；teaching_quality、real_generation、reliable_delivery 存在本地材料可确认的缺失。其余五项证据不足。静态逻辑通过不能抵消必需失败。",
      "statusMeaning": {
        "fail": "已确认未满足要求",
        "insufficient": "未知或证据不足；未观察到有效结果，不推定成功或失败",
        "pass": "仅在规定范围及证据支持下通过"
      },
      "method": "只读核对门槛、README、应用源码、课程数据及既有独立执行报告；本轮没有新增功能运行、专业、用户或生产实测。未采用产品经理 initialStatus 作为独立判定证据。",
      "inputHashes": {
        "dist/app.js": "d2a68798542c493dc4ae1991e6e9d66eda6311df87c29352aa4f423e13a2bd3a",
        "team/product-gates.json": "93ef8940281aa173324c581e2fb23366d22026ff2bf3883ff5d0fe93e958ec06",
        "team/curriculum-data.json": "8eb4730321916a7b12f154f06b31444116657a59941e66c1d6fb34b19cf16609"
      },
      "staticVerification": {
        "scope": "隔离VM指定逻辑与课程JSON结构",
        "evidence": "team/qa-v02-review.md 修复后独立复验章节",
        "checks": {
          "legacyLogic": 22,
          "curriculumStructure": 20,
          "addedLogic": 26,
          "passed": 68
        },
        "limits": "这些既有实际执行结果不是本轮重新运行结果；不证明完整教材、实际浏览器、专业能力、用户价值或生产运行。"
      },
      "criteria": [
        {
          "id": "user_value",
          "required": true,
          "status": "insufficient",
          "evidence": [
            {
              "reference": "team/product-review.md 用户目标与现状",
              "observation": "描述目标人群与问题，未附真实用户访谈或观察结果。"
            },
            {
              "reference": "team/TASKS.md C05",
              "observation": "真实学习者试点及需求反馈仍是未执行后续任务。"
            }
          ],
          "limits": "用户提出产品目标不等于目标用户试验；本岗位未观察真实用户及预定义指标结果。",
          "gap": "缺实际用户记录、试验前指标及阈值、对应结果；无法判定达到用户价值门槛。",
          "owner": "产品经理",
          "nextAction": "定义目标用户、问题及试验前指标阈值，实施试点并交付原始记录。",
          "retest": {
            "status": "待补证据",
            "method": "核对预定义阈值与真实试点记录、样本及实际结果；不以演示或表单替代。"
          }
        },
        {
          "id": "teaching_quality",
          "required": true,
          "status": "fail",
          "evidence": [
            {
              "reference": "team/curriculum-validation.md 覆盖证据及待完成项",
              "observation": "20项结构检查通过，但e03、e05、p01、p02没有现有教材章节；其他八章仍为短示例，未证明满足九项结构与深度。"
            },
            {
              "reference": "team/curriculum-data.json fullTextbookStatus/modules/expertReview",
              "observation": "明确不包含完整教材，四模块existingChapterIds为空，专家审核未完成。"
            },
            {
              "reference": "dist/app.js curriculumPage/教材常量",
              "observation": "实际显示完整教材待编写，正文为八章固定短样例，示例测试和教学审核标未实施。"
            }
          ],
          "limits": "失败依据是标准要求的内容关联与覆盖未完整，而不是断言已存在内容专业事实错误；专业正确性、审核及教学效果仍未知。",
          "gap": "规划12模块没有完整教材、分层练习及对应验证证据；运行型示例和专业内容复核未完成。",
          "owner": "课程架构师",
          "nextAction": "按已确认范围补齐教材与练习、来源主张关联，组织示例执行与专业复核；工程提供受控执行证据。",
          "retest": {
            "status": "待改进及复核",
            "method": "逐模块对照已定覆盖和深度标准核对正文、练习、产物、来源及运行记录；由实际专业评审者提供审核结论。"
          }
        },
        {
          "id": "real_generation",
          "required": true,
          "status": "fail",
          "evidence": [
            {
              "reference": "dist/app.js modules/route/存储与导出函数",
              "observation": "教材为固定常量，路线按预设规则组合；没有模型请求、真实生成任务或资料收集实现。"
            },
            {
              "reference": "README.md 实际边界及本地加载说明",
              "observation": "明确没有真实模型或自动网页检索，静态JS读取课程数据。"
            }
          ],
          "limits": "源码与README证实本项目未接入生成，未对任何外部未提交服务作判断；固定内容生成HTML不是模型生成。",
          "gap": "没有真实模型按档案生成教材、任务/来源/版本链路或实际生成失败恢复证据。",
          "owner": "软件工程师",
          "nextAction": "接收产品、课程与设计交接后实现受控真实生成及过程持久化，提交实际调用、产物和失败记录。",
          "retest": {
            "status": "待实现",
            "method": "独立验证真实服务调用、档案与产物关联、来源及版本、故障恢复；示例验证另需真实执行。"
          }
        },
        {
          "id": "comparative_advantage",
          "required": true,
          "status": "insufficient",
          "evidence": [
            {
              "reference": "team/curriculum-data.json benchmark/sources",
              "observation": "一份招聘描述和三份技术参考为职业与教学能力方向，未包含行业产品同条件对照结果。"
            },
            {
              "reference": "team/product-gates.json benchmarkFields",
              "observation": "规定比较条件字段；本地交付未见对应产品、样本、资源和实际比较结果。"
            }
          ],
          "limits": "没有比较实证不能判存在优势，也不能推定产品一定劣于同行；本轮不联网核验行业基线。",
          "gap": "缺预定义差异化指标、行业产品及研究基线版本、公平比较条件、实测与专业评审。",
          "owner": "产品经理",
          "nextAction": "明确可比任务与领先产品/研究基线，在试验前冻结条件和阈值，收集实测及专业复核。",
          "retest": {
            "status": "待补比较证据",
            "method": "检查样本、资源、任务、评分条件一致性和原始实测，复核指标是否支持限定范围优势。"
          }
        },
        {
          "id": "learner_creation",
          "required": true,
          "status": "insufficient",
          "evidence": [
            {
              "reference": "dist/app.js projectsPage/standardsPage",
              "observation": "两个项目保存自查与文字备注，作品证据标用户自查；没有真实学习者MVP提交及独立评分结果。"
            },
            {
              "reference": "team/TASKS.md C05/C06",
              "observation": "真实学习者试点、未知任务和教学效果评价尚未执行。"
            }
          ],
          "limits": "未有学员成果不说明学员必然不能创造产品；项目目录及作者制作平台原型不能替代真实学习者证据。",
          "gap": "缺学习者作品版本、运行测试、目标用户验证、独立作品评审及适用评分记录。",
          "owner": "课程架构师",
          "nextAction": "按既定量规组织学习者MVP与未知任务，结合真实用户验证和独立作品评审保存原始证据。",
          "retest": {
            "status": "待真实学习证据",
            "method": "对照任务量规复现作品，核对用户验证和评审来源、评分、版本；不使用自查替代。"
          }
        },
        {
          "id": "reliable_delivery",
          "required": true,
          "status": "fail",
          "evidence": [
            {
              "reference": "dist/app.js storageKey/normalizeState/save",
              "observation": "持久化只有当前浏览器localStorage；无账户身份、权限隔离API及数据库。"
            },
            {
              "reference": "README.md 保存与故障边界/实际边界",
              "observation": "明确不跨设备同步且无账户数据库；保存失败内存不能抵抗关闭。"
            },
            {
              "reference": "team/qa-v02-review.md 修复后独立复验",
              "observation": "指定保存/恢复和版本字段逻辑通过，但报告明确不覆盖生产系统与浏览器。"
            }
          ],
          "limits": "原型本地存储功能改善确有证据；fail针对正式门槛中未实现账户隔离、系统持久化和运行体系，不是认定68项功能再次失败。",
          "gap": "正式运行范围、账户及隔离、服务端持久任务/恢复及生产版本追踪未建立。",
          "owner": "软件工程师",
          "nextAction": "明确运行范围后实现账户隔离、数据库、持久任务、失败恢复与版本记录，交独立验证。",
          "retest": {
            "status": "待实现",
            "method": "使用独立账户、故障注入和服务重启检验隔离、持久化、恢复及版本；补浏览器和真实运行证据。"
          }
        },
        {
          "id": "operating_economics",
          "required": true,
          "status": "insufficient",
          "evidence": [
            {
              "reference": "dist/app.js plannedHours/home/exportPlan",
              "observation": "时间取章节固定参考小时，未记录真实模型调用、交付耗时或维护成本。"
            },
            {
              "reference": "team/curriculum-review.md 工时限制",
              "observation": "参考时长没有真实学习耗时测量，不能充当运营指标。"
            }
          ],
          "limits": "没有运营数据不推定超预算；团队任务安排不是实际产品运营质量与经济性结果。",
          "gap": "缺试验前资源预算、真实成本/耗时/质量数据及已运行维护机制。",
          "owner": "产品经理",
          "nextAction": "明确预算和维护责任，与工程一起记录真实生成及服务交付的成本、耗时和质量。",
          "retest": {
            "status": "待真实运营证据",
            "method": "核对实际调用和交付日志与预算、运行范围和质量结果，不用课程时长或虚构数据。"
          }
        },
        {
          "id": "iteration_trace",
          "required": true,
          "status": "insufficient",
          "evidence": [
            {
              "reference": "team/RETROSPECTIVES.md R01/R02/R03与本轮复验结论",
              "observation": "实际保留目标、版本哈希、失败、原因、责任与修复复验，两类P2已有独立闭环；完整培养目标继续保留未验证。"
            },
            {
              "reference": "team/qa-v02-review.md 首次失败与复验",
              "observation": "旧/新原型逻辑缺陷确有首次与后续独立结果；不是只有一份完成声明。"
            },
            {
              "reference": "dist/app.js reflectionFields/reflectionsPage",
              "observation": "复盘保存版本和责任，但未记录新标准逐门槛ID/版本/实测结论；状态为自述与未独立审核。"
            },
            {
              "reference": "team/TASKS.md P01—P07",
              "observation": "新一轮正式门槛与版本达标复盘仍在交接，未形成每次产出的完整门槛证据链。"
            }
          ],
          "limits": "承认已执行的原型缺陷复盘，不把新增标准缺口倒算为既有复验失败；本基线是一次独立审计，不足证明所有产出均持续达标复盘。",
          "gap": "尚缺逐次产物与完整门槛版本、独立产品审计和专业审核的持续关联及复验记录。",
          "owner": "项目经理",
          "nextAction": "每次发布产物冻结版本，登记八门槛及证据、范围、责任与复验；保留自评/QA/专业审核身份分离。",
          "retest": {
            "status": "待持续追踪证据",
            "method": "逐产物抽核版本、门槛、原始结果、缺口、责任和复验；新版审计重做，不自动继承本基线。"
          }
        }
      ],
      "counts": {
        "required": 8,
        "fail": 3,
        "insufficient": 5,
        "pass": 0
      },
      "remainingItems": [
        "真实用户验证及预定义阈值",
        "完整教材覆盖与深度、运行型示例证据、专业审核",
        "真实模型生成及来源/任务/版本追踪",
        "可比行业产品/研究基线、同条件实测和专业评审",
        "真实学习者MVP、目标用户验证及独立作品评审",
        "账户隔离、服务端持久化、故障恢复和生产运行范围",
        "真实预算、成本、耗时、质量与维护证据",
        "每次产出的完整标准关联、独立审计及复验",
        "实际浏览器交互、视觉、读屏与可访问性"
      ],
      "professionalReviewStatus": "未专业审核",
      "advancedStatus": "无可比实证，不能认定行业先进",
      "limits": [
        "本结论基于当前本地材料及既有独立逻辑执行报告，不是行业专业、用户或生产验证。",
        "本次使用product-gates状态insufficient表示unknown/证据不足，保持门槛数据词汇一致。",
        "网站静态接口已测不能替代正式职业学习产品标准。",
        "下一版须对应新产物哈希与版本再次审计，本结论不自动继承。"
      ]
    },
    {
      "schemaVersion": "1.0",
      "productVersion": "prototype-0.3",
      "standardVersion": "product-creation-2026-10-10",
      "auditedAt": "2026-10-10",
      "reviewer": "测试工程师独立代理 /root/qa_engineer",
      "assessmentScope": "formal_learning_product",
      "assessmentScopeLabel": "按正式职业学习系统八门槛评估当前冻结静态原型",
      "overall": "not_met",
      "overallLabel": "未达标",
      "decisionBasis": "八项必需门槛：3项确认失败、4项证据不足、1项仅本次产出追踪通过。任一必需失败即整体未达标；静态逻辑通过不能抵消。",
      "method": "测试工程师重新只读核对当前0.3源码、专业JSON、README与本轮独立运行报告；未继承0.2结果或产品经理initialStatus。没有真实专业、用户、市场或生产实验。",
      "criteria": [
        {
          "id": "user_value",
          "required": true,
          "status": "insufficient",
          "evidence": [
            {
              "reference": "team/product-creation-standard.md 与 team/product-review.md",
              "observation": "有目标人群与用户问题要求，未附目标用户访谈、观察和阈值验证结果。"
            },
            {
              "reference": "team/TASKS.md C05；dist/app.js productReviewForm",
              "observation": "真实学习者试点仍为后续任务；当前字段仅用户自述，不构成用户试验。"
            }
          ],
          "limits": "未观察真实用户结果；不从缺结果推定用户价值必然失败。",
          "gap": "缺试验前用户、指标与阈值及真实记录。",
          "owner": "产品经理",
          "nextAction": "产品经理定义并冻结试点指标，组织用户验证，交付原始记录。",
          "retest": {
            "status": "待真实用户证据",
            "method": "核对样本、预定义阈值与实际用户结果，另行独立复核。"
          }
        },
        {
          "id": "teaching_quality",
          "required": true,
          "status": "fail",
          "evidence": [
            {
              "reference": "team/curriculum-data.json modules/fullTextbookStatus/expertReview",
              "observation": "四模块e03/e05/p01/p02无existingChapterIds；八章仍为短样例，数据明确不包含完整教材，专家审核未完成。"
            },
            {
              "reference": "team/creation-path.json formalLessonStatus；dist/app.js modules/creationPage",
              "observation": "七阶段均为正文待完成；网站展示规划、方法和固定短章，没有补齐完整教材。"
            },
            {
              "reference": "team/curriculum-validation.md 与本轮 curriculum-check.mjs",
              "observation": "20/20只确认结构与映射，不能确认章节教学深度、可执行示例或专业质量。"
            }
          ],
          "limits": "fail依据可确认的完整教学覆盖缺失；不声称现有内容事实错误。专业正确性、示例运行与学习效果仍未知。",
          "gap": "缺完整模块正文、分层练习、来源主张关联、运行验证和专业内容复核。",
          "owner": "课程架构师",
          "nextAction": "课程架构师补齐正文和练习、来源及验证记录，组织实际专业复核。",
          "retest": {
            "status": "待内容完善与专业复核",
            "method": "逐模块核对九项结构、覆盖、深度、案例运行及专业复核记录。"
          }
        },
        {
          "id": "real_generation",
          "required": true,
          "status": "fail",
          "evidence": [
            {
              "reference": "dist/app.js modules/route/exportPlan",
              "observation": "固定八章常量和规则路线，导出明确预设模板非实时AI生成；没有真实模型执行链。"
            },
            {
              "reference": "README.md 实际边界；team/engineering-v03-delivery.md",
              "observation": "明确未接入模型、资料抓取与代码沙箱；新增两页仍静态交互。"
            }
          ],
          "limits": "不评价未提交的外部系统；HTML渲染和表单不能视为真实教材生成。",
          "gap": "未实现真实模型依学习档案生成及来源、任务、版本与失败恢复。",
          "owner": "软件工程师",
          "nextAction": "软件工程师按专业交接实现受控真实生成及持久过程，提交调用与故障证据。",
          "retest": {
            "status": "待实现",
            "method": "独立观察真实调用、档案和产物关联、来源、版本、失败恢复；案例另须真实执行。"
          }
        },
        {
          "id": "comparative_advantage",
          "required": true,
          "status": "insufficient",
          "evidence": [
            {
              "reference": "team/curriculum-data.json sources/benchmark 与 team/creation-path.json sources",
              "observation": "公开岗位和官方技术、研究方法用于教学方向；没有同行产品同条件比较结果。"
            },
            {
              "reference": "dist/app.js productDecision/productReviewForm；team/qa-v03-review.md P08/P30",
              "observation": "11比较字段和缺证判定已测，但用户填写未核实内容；合成通过测试不是真实比较实验。"
            }
          ],
          "limits": "没有实证不能判优势，也不能推定必然落后；本轮没有联网核验行业动态。",
          "gap": "缺行业产品及研究基线版本、公平样本资源条件、预定义阈值、实测与专业评审。",
          "owner": "产品经理",
          "nextAction": "产品经理组织同条件比较，在实验前冻结任务、条件和指标，保存原始结果。",
          "retest": {
            "status": "待比较实证",
            "method": "检查比较公平性、基线可追踪性及原始实测和专业复核，仅认定证据支持范围。"
          }
        },
        {
          "id": "learner_creation",
          "required": true,
          "status": "insufficient",
          "evidence": [
            {
              "reference": "dist/app.js projectsPage/creationPage/productReviewForm",
              "observation": "项目自查、七阶段要求和产品自述已实现，没有真实学习者可运行MVP及独立作品评分。"
            },
            {
              "reference": "team/TASKS.md C05/C06",
              "observation": "学习者试点、未知任务和教学效果评价仍待执行。"
            }
          ],
          "limits": "作者制作网站不是学习者成果，完成率、自查和合成测试不认证职业能力。",
          "gap": "缺学习者MVP版本、运行测试、用户验证、预定评分与独立作品评审。",
          "owner": "课程架构师",
          "nextAction": "课程架构师按量规组织真实学习者作品、未知任务和独立评审，配合产品用户验证。",
          "retest": {
            "status": "待学习者实证",
            "method": "复现作品、核对真实用户结果与评分标准、评审者及产物版本。"
          }
        },
        {
          "id": "reliable_delivery",
          "required": true,
          "status": "fail",
          "evidence": [
            {
              "reference": "dist/app.js storageKey/normalizeState/save",
              "observation": "持久化为rolecraft-v1本地存储，没有服务端账户、权限隔离、数据库及生产任务体系。"
            },
            {
              "reference": "README.md 保存与故障边界；team/qa-v03-review.md P24",
              "observation": "内存输入与导出恢复逻辑已测，关闭仍不能保持未落盘内存；没有正式生产隔离与持续运行验证。"
            }
          ],
          "limits": "承认静态故障保护改善；fail针对正式账户及持久运行体系缺失，VM配额模拟不是生产可靠性。",
          "gap": "缺正式运行范围、账户权限、持久任务与服务端恢复、真实生产版本追踪。",
          "owner": "软件工程师",
          "nextAction": "软件工程师依确认范围实现服务端运行体系，提交账户、故障与版本证据。",
          "retest": {
            "status": "待正式体系实现",
            "method": "真实独立账户、服务重启、故障注入验证隔离和恢复，并补浏览器验收。"
          }
        },
        {
          "id": "operating_economics",
          "required": true,
          "status": "insufficient",
          "evidence": [
            {
              "reference": "dist/app.js plannedHours/exportPlan/productReviewForm",
              "observation": "时长为固定教学估算，基线成本仅文字字段；没有真实模型调用成本或交付运营数据。"
            },
            {
              "reference": "README.md 实际边界；team/engineering-v03-delivery.md",
              "observation": "尚未运行真实生成服务，未提交实际成本、耗时、质量及维护结果。"
            }
          ],
          "limits": "不能因无运营数据认定超预算；课程参考小时和开发任务安排不是运营经济实测。",
          "gap": "缺预先预算、实际成本耗时质量及已执行维护证据。",
          "owner": "产品经理",
          "nextAction": "产品经理冻结资源预算和维护指标，与工程收集实际运行账目与结果。",
          "retest": {
            "status": "待真实运营证据",
            "method": "核对原始日志、预算、质量和维护责任及执行结果。"
          }
        },
        {
          "id": "iteration_trace",
          "required": true,
          "status": "pass",
          "evidence": [
            {
              "reference": "team/RETROSPECTIVES.md R04/R05；team/engineering-v03-delivery.md 修复轮1",
              "observation": "本产物目标、版本、八门槛、首轮P11/P17差距、原因、责任、改进与复验条件均有记录；工程记录其漏检原因，未以自检关闭。"
            },
            {
              "reference": "team/qa-v03-review.md 首轮及修复冻结独立复验",
              "observation": "首次28/30及P2证据保留；修复冻结hash对应原30项独立通过，旧V09版本冲突保留，其他正式缺口未关闭。"
            },
            {
              "reference": "dist/app.js productReviewMarkdown/normalizeProductReview；team/qa-v03-check.mjs P18/P22/P26/P28",
              "observation": "逐产物标准/版本/门槛/差距/责任/复验字段刷新和导出通过；自评与只读QA隔离，专业审核仍未审核，0.2历史不继承。"
            }
          ],
          "limits": "仅当前prototype-0.3本轮产出的可追踪复盘闭环通过；不证明未来每次学习者使用已复盘、正式缺口完成或专业能力。最终报告打包仍待专项验证。",
          "gap": "本轮逻辑改进已验证；正式七项失败或缺证继续开放。未来产出须重新独立审计。",
          "owner": "项目经理",
          "nextAction": "项目经理登记本版限定闭环与未完成项；每次新产出冻结版本、证据和责任，不继承本结论。",
          "retest": {
            "status": "当前逻辑改进已独立验证；包装待专项验证",
            "method": "下一产物逐项检查门槛/版本/原因/责任/复验；当前报告打包后再专项核对一致性及两范围显示。"
          }
        }
      ],
      "counts": {
        "required": 8,
        "fail": 3,
        "insufficient": 4,
        "pass": 1
      },
      "inputHashes": {
        "dist/app.js": "a17d6db7aa11effe914c8b3c7a4f3e5989819550a60ec1e375fc111713bf8ed8",
        "dist/index.html": "5dc1e2070c0e74ce582f0948bd50a8482d2651e7d76063ca016b1f8efb13ed05",
        "dist/curriculum-data.js": "c3c93435d4417792182c1f98b450a1e1a5c23aa9a8136ddb03086570c03f1442",
        "dist/product-gates-data.js": "a331ad6c46adc7d463e9b56d918a8f96765ebaecfa1ff6c07c2c5e6c19e09b0e",
        "dist/creation-path-data.js": "24a814d9b098e23c698b924924f209dbf14bb5637d9b7cd0ccbe6200d721d2c4",
        "dist/product-audit-data.js": "0bbfa29213396404401baae81d38be134f5794919c71d284984d85c8a6042285",
        "team/product-gates.json": "93ef8940281aa173324c581e2fb23366d22026ff2bf3883ff5d0fe93e958ec06",
        "team/curriculum-data.json": "8eb4730321916a7b12f154f06b31444116657a59941e66c1d6fb34b19cf16609"
      },
      "staticVerification": {
        "productVersion": "prototype-0.3",
        "scope": "static_prototype",
        "conclusion": "met_within_scope",
        "standardVersion": "product-creation-2026-10-10",
        "reviewer": "测试工程师独立代理 /root/qa_engineer",
        "auditedAt": "2026-10-10",
        "appSha256": "a17d6db7aa11effe914c8b3c7a4f3e5989819550a60ec1e375fc111713bf8ed8",
        "evidence": [
          {
            "reference": "team/qa-v03-check.mjs 与 team/qa-v03-review.md",
            "observation": "测试工程师实际运行新30/30，P11/P17原断言复验通过；两页、七阶段/12模块、八门槛、范围/版本、CRUD、保存及错误数据逻辑通过。"
          },
          {
            "reference": "team/qa-check.mjs、team/curriculum-check.mjs、team/qa-v02-check.mjs",
            "observation": "分别22/22、20/20、25/26；V09旧版预期冲突保留，V23—25通过，P28补新版预填和旧版历史。"
          }
        ],
        "limits": "仅冻结版隔离Node VM逻辑、数据契约及结构。stub不模拟浏览器布局、原生表单、下载、焦点、读屏、历史栈和真实存储配额；未实测file页或用户存储。静态通过不证明完整教材、专业水平、行业先进、真实生成、用户价值、生产或运营。旧V09失败未抹去，最终报告包装尚未验证。",
        "tests": [
          {
            "command": "node sites/rolecraft/team/qa-check.mjs",
            "total": 22,
            "pass": 22,
            "fail": 0,
            "exitCode": 0
          },
          {
            "command": "node sites/rolecraft/team/curriculum-check.mjs",
            "total": 20,
            "pass": 20,
            "fail": 0,
            "exitCode": 0
          },
          {
            "command": "node sites/rolecraft/team/qa-v02-check.mjs",
            "total": 26,
            "pass": 25,
            "fail": 1,
            "exitCode": 1,
            "exception": "V09保留expected prototype-0.2/actual prototype-0.3；新版P28确认需求版本变化及历史保留"
          },
          {
            "command": "node sites/rolecraft/team/qa-v03-check.mjs",
            "total": 30,
            "pass": 30,
            "fail": 0,
            "exitCode": 0
          }
        ],
        "firstRound": {
          "appSha256": "562dc5f36e39f6e5fde132526f951c619ec1af7d8d8624c07c0b642cf1e9c13b",
          "newChecks": {
            "total": 30,
            "pass": 28,
            "fail": 2
          },
          "conclusion": "not_met",
          "failures": [
            "V03-01/P11",
            "V03-02/P17"
          ],
          "reference": "team/qa-v03-review.md"
        },
        "references": [
          "team/qa-v03-plan.md",
          "team/qa-v03-review.md",
          "team/curriculum-validation.md"
        ]
      },
      "remainingItems": [
        "真实用户验证及试验前阈值",
        "完整教材与分层练习、可运行案例及专业复核",
        "真实模型生成、来源任务版本及恢复",
        "同条件行业产品与研究基线比较和专业评审",
        "学习者MVP、实际用户验证和独立作品评审",
        "账户隔离、服务端持久化、异常恢复及正式运行范围",
        "真实预算、成本、耗时、质量和维护结果",
        "真实浏览器、视觉、键盘读屏和下载",
        "当前报告原样包装后的专项验证；未来每次产出重新审计"
      ],
      "professionalReviewStatus": "未专业审核",
      "advancedStatus": "无可比实证，不能认定行业先进",
      "limits": [
        "此结论基于本地材料和本轮已执行隔离逻辑，不是行业专业、用户或生产验证。",
        "insufficient表示未知/证据不足，缺结果不可改为通过；没有认定所有学习者必然失败。",
        "本版报告不自动继承到新版；静态与正式结论各自携带范围和版本。",
        "本报告交付阶段dist仅0.2历史报告；工程打包后另作专项复验。"
      ]
    },
    {
      "schemaVersion": "1.0",
      "productVersion": "local-mvp-0.4",
      "standardVersion": "product-creation-2026-10-10",
      "auditedAt": "2026-10-10",
      "reviewer": "测试工程师独立代理 /root/qa_engineer",
      "assessmentScope": "formal_learning_product",
      "assessmentScopeLabel": "按正式职业学习产品八门槛审计local-mvp-0.4本机研发闭环",
      "overall": "not_met",
      "overallLabel": "未达标",
      "decisionBasis": "3必需fail、4证据不足、1仅本次追踪pass；必需失败整体未达标。本地账户/SQLite/生成适配已实现，但不能替代真实教材生成、完整教学或正式生产实证。",
      "method": "独立读取冻结实际源码、课程包、审校与研究证据，并执行模型替身、本机HTTP/临时SQLite及客户端VM；重新逐门槛判断，不继承0.3报告。",
      "criteria": [
        {
          "id": "user_value",
          "required": true,
          "status": "insufficient",
          "evidence": [
            {
              "reference": "team/implementation-v04-product.md",
              "sha256": "834bd3086308a2b251d0497ce316c419cbdd22f07886b3104afe68d1b8d6ca27",
              "observation": "冻结单章MVP与试点边界，未附真实用户访谈或预定阈值结果。"
            },
            {
              "reference": "team/specialists/user-researcher.md",
              "sha256": "1d9f7407c66c5ea548684b21e46b7162b9e116452aca9d6a4a491b341a9e4aa3",
              "observation": "研究协议与空模板齐备，但真实招募、访谈、使用及价值结果未执行。"
            }
          ],
          "limits": "新本地账户及可操作网站不构成用户价值实验；本次QA是测试夹具账户。",
          "gap": "缺获授权真实样本、试验前阈值、原始观察及实际结果。",
          "owner": "产品经理（用户研究员执行）",
          "nextAction": "冻结试点指标和协议，收集真实用户原始证据。",
          "retest": {
            "status": "待真实实施或补证并独立复验",
            "method": "核对协议早于实测、样本与退出、实际用户结果及范围。"
          }
        },
        {
          "id": "teaching_quality",
          "required": true,
          "status": "fail",
          "evidence": [
            {
              "reference": "team/generation-curriculum-v04.json",
              "sha256": "4333cf72964a0fd3e315333fcf65e19b2b234a60e0d87a7dfdf327f68a40d415",
              "observation": "e03作者九节已按结构接收并完整提供；其他缺失模块和八章深化未完成，verification CR05/exampleExecution not_run、人类专家not_done。"
            },
            {
              "reference": "team/content-v04-review.md",
              "sha256": "d237e9d13e63efc819649eb19eeedadd439bdc0497e7204d573acbcaac14976a",
              "observation": "九节与作者hash/论断有专业来源定位，摘录计数原缺陷已复核；是AI辅助审校，未运行案例或审核模型新稿。"
            },
            {
              "reference": "dist/generation.js",
              "sha256": "4729f5caad5b17638b73f2cb7744a7aff1015e6a8e97f05b0efd3c5146c09b40",
              "observation": "作者正文可独立阅读，模型新稿明确未审/未运行；没有授予完整教学通过。"
            }
          ],
          "limits": "承认新增e03实质正文、课程接收和AI独立文稿复核；完整覆盖、示例运行、专业专家及教学效果仍缺，结构合法不是教学质量。",
          "gap": "缺其余正文深度、案例受控执行、真人专业审核和真实学习效果。",
          "owner": "课程架构师（教材研发员/内容审校员专项）",
          "nextAction": "补其他正文与练习，工程实现案例，组织内容及实际专家复核。",
          "retest": {
            "status": "待真实实施或补证并独立复验",
            "method": "逐模块按原结构/量规核覆盖深度，独立执行正常/边界/失败与未知案例，复核专业意见。"
          }
        },
        {
          "id": "real_generation",
          "required": true,
          "status": "fail",
          "evidence": [
            {
              "reference": "server/generation/index.mjs",
              "sha256": "52ef3ffefe3028187192fa7712693a1929949403f651daaeb09999a7a12d5beb",
              "observation": "已实现固定Responses真实协议适配、配置/预算阻止、来源/九节检查和失败处理；本轮仅模拟transport运行。"
            },
            {
              "reference": "team/qa-v04-review.md",
              "sha256": "77ea38c531142629fc1ca1995ca1eaea6f54618e0aa19985ccf520741ce6e8bd",
              "observation": "当前进程API_KEY和MODEL存在性均false，13组模拟验证及本机HTTP合成成功不是真实供应商执行。"
            },
            {
              "reference": "team/implementation-v04-product.md",
              "sha256": "834bd3086308a2b251d0497ce316c419cbdd22f07886b3104afe68d1b8d6ca27",
              "observation": "明确本轮无真实调用时real_generation仍未通过，不用教材或模拟报成功。"
            }
          ],
          "limits": "相比0.3已提供调用实现，失败依据为必需真实执行及产物关联证据尚无；不能声称模型服务未编写。声明预算并非供应商硬cap，无真实账单。",
          "gap": "缺明确模型/预算/安全凭据交接、实际请求ID/usage/教材及逐稿内容核对。",
          "owner": "AI生成工程师（后端/客户端接口协作）",
          "nextAction": "获得实际输入后按预算执行真实单章，保留请求与来源产物版本、失败恢复及新稿复核。",
          "retest": {
            "status": "待真实实施或补证并独立复验",
            "method": "独立核真实供应商调用、不同画像、请求ID与usage、来源/正文/任务关联、故障和专业内容；模拟不替代。"
          }
        },
        {
          "id": "comparative_advantage",
          "required": true,
          "status": "insufficient",
          "evidence": [
            {
              "reference": "team/specialists/benchmark-researcher.md",
              "sha256": "1685abace8c3f60dd1c33f9e744584c1e478eb13ec627b60bd2e4ac8f64df26f",
              "observation": "有官方候选和公平比较协议，403限制/未知版本如实，尚无同条件比较实测。"
            },
            {
              "reference": "team/product-gates.json",
              "sha256": "93ef8940281aa173324c581e2fb23366d22026ff2bf3883ff5d0fe93e958ec06",
              "observation": "11比较字段、失败优先及行业实证要求不变，本地服务实现没有产生比较结果。"
            }
          ],
          "limits": "不推定优于或差于同行；本岗位没有联网复核新行业动态或访问403页面。",
          "gap": "缺锁定行业/研究对象版本、同任务样本资源、预定义指标、实际比较和专业评审。",
          "owner": "产品经理（竞品研究员专项）",
          "nextAction": "与研究/评估/工程冻结公平比较并执行原始测量。",
          "retest": {
            "status": "待真实实施或补证并独立复验",
            "method": "复核基线、条件、样本、测量方法和专业评审，只判断证据支持的限定优势。"
          }
        },
        {
          "id": "learner_creation",
          "required": true,
          "status": "insufficient",
          "evidence": [
            {
              "reference": "server/index.mjs",
              "sha256": "f111fa0f17389a0b586d34f75748b844fa042f9ab88985189c77a30563daf0d8",
              "observation": "作品/自评可在真实本机SQLite保存，链接仅引用不抓取，evidenceStatus incomplete/self_reported，独立/专业固定unreviewed。"
            },
            {
              "reference": "team/specialists/practicum-evaluator.md",
              "sha256": "1f372912e0a68cac8fb9fc5443986f19ad6a975347b120cf39d7d599564f00e1",
              "observation": "既定量规与独立未知任务流程已有，没有真实学员作品、运行、用户验证或专业评分。"
            }
          ],
          "limits": "QA合成提交是软件记录验证，不是实际学员MVP或学习效果。",
          "gap": "缺学员作品版本、可运行证据、目标用户结果及独立评分。",
          "owner": "课程架构师（实训评估员专项）",
          "nextAction": "组织真实学员作品与未知任务，依原量规独立评分并保存用户结果。",
          "retest": {
            "status": "待真实实施或补证并独立复验",
            "method": "非作者复现作品，对照量规、帮助记录、保留集和真实用户证据。"
          }
        },
        {
          "id": "reliable_delivery",
          "required": true,
          "status": "fail",
          "evidence": [
            {
              "reference": "server/index.mjs",
              "sha256": "f111fa0f17389a0b586d34f75748b844fa042f9ab88985189c77a30563daf0d8",
              "observation": "本机研发账户/会话、CSRF、SQLite、任务版本与lease fence已实现；独立HTTP检验隔离、真实重启及SIGKILL恢复通过。"
            },
            {
              "reference": "server/README.md",
              "sha256": "f70de336bed80cf155da316e01a272a2595b0ebe083121574b6299bcad9052d4",
              "observation": "明确仅127.0.0.1研发；缺生产身份验证、TLS、找回、自动备份、多worker、全局限流及运维监控。"
            },
            {
              "reference": "team/qa-v04-review.md",
              "sha256": "77ea38c531142629fc1ca1995ca1eaea6f54618e0aa19985ccf520741ce6e8bd",
              "observation": "15组临时库/HTTP检查通过，未开展生产运行、真实供应商持久链或备份恢复验证。"
            }
          ],
          "limits": "不再以无账户或无数据库作为失败理由，承认本地真实系统改善；正式生产可靠交付仍未建立，服务启动不等于生产范围验收。",
          "gap": "正式生产运行范围、身份及运维/备份体系与独立真实运行证据未完成。",
          "owner": "后端数据工程师（原工程岗位接口整合）",
          "nextAction": "先由产品定义正式运行范围，补生产身份、恢复/备份与监控，再独立验证。",
          "retest": {
            "status": "待真实实施或补证并独立复验",
            "method": "独立账户与真实环境隔离、任务恢复、备份恢复及运行范围验证，真实模型链与浏览器另测。"
          }
        },
        {
          "id": "operating_economics",
          "required": true,
          "status": "insufficient",
          "evidence": [
            {
              "reference": "server/generation/index.mjs",
              "sha256": "52ef3ffefe3028187192fa7712693a1929949403f651daaeb09999a7a12d5beb",
              "observation": "记录真实usage协议与人工预算声明，actualCostUsd null、hardProviderCostCap false；模拟用量不是账单。"
            },
            {
              "reference": "team/specialists/operations-analyst.md",
              "sha256": "90f780edfe5a7505316fe532bfa16c25df47b44bcc1ea5f2f4f05e30334f9e51",
              "observation": "预算模板/成本与重试归因规格已有，真实账单、交付耗时质量、维护记录未提交。"
            }
          ],
          "limits": "不把QA执行耗时、固定教材时长或合成tokens当运营结果，不推定超预算。",
          "gap": "缺已批准实际预算、供应商费用账目、成功质量分母及维护结果。",
          "owner": "产品经理（运营分析员专项）",
          "nextAction": "冻结预算及质量条件，结合真实调用/任务日志与账单核算并保存维护记录。",
          "retest": {
            "status": "待真实实施或补证并独立复验",
            "method": "独立抽样重算，区分usage/估算/账单，核重试、未知费用、质量和维护证据。"
          }
        },
        {
          "id": "iteration_trace",
          "required": true,
          "status": "pass",
          "evidence": [
            {
              "reference": "team/qa-v04-review.md",
              "sha256": "77ea38c531142629fc1ca1995ca1eaea6f54618e0aa19985ccf520741ce6e8bd",
              "observation": "本产物范围、冻结hash、首次P2、修复和路径原断言复核、测试夹具适配与旧版本失败均保留；未拿开发自检代独立结果。"
            },
            {
              "reference": "team/implementation-v04-frontend.md",
              "sha256": "b1f6723b6f7ab734ec438b1f325d2a30192f7ab894b362d7373abe1a49e2b089",
              "observation": "真实file启动提示缺陷由原客户端岗位修复并冻结，局限与后续责任记录。"
            },
            {
              "reference": "team/content-v04-review.md",
              "sha256": "d237e9d13e63efc819649eb19eeedadd439bdc0497e7204d573acbcaac14976a",
              "observation": "原计数P3、课程改正和独立原问题复核保持，运行/教学缺口未关闭。"
            }
          ],
          "limits": "仅本次0.4产出的版本复盘证据链；不保证未来每次学习者产物已复盘，也不证明其他门槛完成。报告包装仍待专项核对。",
          "gap": "当前有限功能问题改进已验证；正式其他门槛及未来持续追踪开放。",
          "owner": "项目经理",
          "nextAction": "登记当前实际结果与未完成项；工程原样包装本报告后专项核对，新版本重新审计。",
          "retest": {
            "status": "当前限定追踪通过；其他门槛缺口开放",
            "method": "核本产物报告包装/版本与两范围结论，未来每次产出新证据、独立复验及责任。"
          }
        }
      ],
      "counts": {
        "required": 8,
        "fail": 3,
        "insufficient": 4,
        "pass": 1
      },
      "inputHashes": {
        "dist/app.js": "d147f189a81d7f6ebcdb8e6cb7f047e13c50b1146f9e0bde3a7995dacf27693c",
        "dist/generation.js": "4729f5caad5b17638b73f2cb7744a7aff1015e6a8e97f05b0efd3c5146c09b40",
        "dist/index.html": "70f5c5c0c5e9e645415b1032b5f6d33dc96d74153a010a590c00b454b829321b",
        "dist/styles.css": "9b99139a1362025c6d9ed7dc9463fb65cb306d90af4cedf6c9048487ae8de353",
        "dist/generation-curriculum-data.js": "3864bf34d4f15e89a1e8c44b692272d3febb387a704371703886a7621ce1cdbc",
        "dist/curriculum-data.js": "c3c93435d4417792182c1f98b450a1e1a5c23aa9a8136ddb03086570c03f1442",
        "dist/product-gates-data.js": "a331ad6c46adc7d463e9b56d918a8f96765ebaecfa1ff6c07c2c5e6c19e09b0e",
        "dist/creation-path-data.js": "24a814d9b098e23c698b924924f209dbf14bb5637d9b7cd0ccbe6200d721d2c4",
        "dist/product-audit-data.js": "d46faae2909d44c13df3a0a8fa01056560db0a69019c889cf959e7ceba015490",
        "server/index.mjs": "f111fa0f17389a0b586d34f75748b844fa042f9ab88985189c77a30563daf0d8",
        "server/generation/index.mjs": "52ef3ffefe3028187192fa7712693a1929949403f651daaeb09999a7a12d5beb",
        "server/CONTRACT.md": "feb23aef7f3de4f86f40db52a72356197f204e8fdfb3f7542ddebfd05e8de33f",
        "team/generation-curriculum-v04.json": "4333cf72964a0fd3e315333fcf65e19b2b234a60e0d87a7dfdf327f68a40d415",
        "team/product-gates.json": "93ef8940281aa173324c581e2fb23366d22026ff2bf3883ff5d0fe93e958ec06",
        "team/curriculum-data.json": "8eb4730321916a7b12f154f06b31444116657a59941e66c1d6fb34b19cf16609",
        "team/content-v04-review.md": "d237e9d13e63efc819649eb19eeedadd439bdc0497e7204d573acbcaac14976a"
      },
      "staticVerification": {
        "productVersion": "local-mvp-0.4",
        "scope": "static_prototype",
        "scopeLabel": "沿UI契约枚举；实际范围为本机HTTP/SQLite + 隔离客户端VM + 模拟模型协议",
        "standardVersion": "product-creation-2026-10-10",
        "conclusion": "met_within_scope",
        "reviewer": "测试工程师独立代理 /root/qa_engineer",
        "auditedAt": "2026-10-10",
        "evidence": [
          {
            "reference": "team/qa-v04-review.md",
            "sha256": "77ea38c531142629fc1ca1995ca1eaea6f54618e0aa19985ccf520741ce6e8bd",
            "observation": "独立13组模拟模型、15组真实本机HTTP/SQLite、12组客户端VM按阶段通过；包含真实子进程kill/restart及存储隔离。"
          },
          {
            "reference": "team/qa-v04-check.mjs",
            "sha256": "d8d0dd9f62350e6663f7dcc053c080f11a505dd3f99c9f85dcf8bffb75f49062",
            "observation": "可复现隔离脚本，供应商请求全被QA拦截，成功均合成fixture，未访问用户DB或真实浏览器。"
          }
        ],
        "limits": "scope static_prototype仅沿当前UI数据契约；实际验收是本地研发HTTP/SQLite、隔离客户端VM与模拟供应商协议。没有浏览器/视觉/键盘/读屏/原生下载或浏览器服务联合实测；没有真实模型调用、真实密钥/费用、生成内容专业审查、CR05教学执行、真实用户/学员/市场/账单或生产运行。budget是人工声明预估，不是供应商硬cap。HTTP fixture可能在默认fetch路径保存openai字段，仍是全拦截模拟且库已删除，绝非真实生成证据。旧脚本版本失败及首轮问题保留；最终报告包装尚待专项复验。",
        "tests": [
          {
            "command": "node sites/rolecraft/team/qa-v04-check.mjs",
            "scope": "模型13组通过；同次HTTP14/15为Host运输待核",
            "passed": 27,
            "total": 28,
            "exitCode": 1
          },
          {
            "command": "node sites/rolecraft/team/qa-v04-check.mjs --http-only",
            "scope": "修正为原生http发送Host；真实临时SQLite/loopbackHTTP",
            "passed": 15,
            "total": 15,
            "exitCode": 0
          },
          {
            "command": "node sites/rolecraft/team/qa-v04-check.mjs --client-only",
            "scope": "模拟fetch/DOM VM",
            "passed": 12,
            "total": 12,
            "exitCode": 0
          },
          {
            "command": "node sites/rolecraft/team/qa-check.mjs",
            "passed": 22,
            "total": 22,
            "exitCode": 0
          },
          {
            "command": "node sites/rolecraft/team/curriculum-check.mjs",
            "passed": 20,
            "total": 20,
            "exitCode": 0
          },
          {
            "command": "node sites/rolecraft/team/qa-v02-check.mjs",
            "passed": 25,
            "total": 26,
            "exitCode": 1,
            "exception": "V09固定prototype-0.2版本，当前0.4；C04独立接收新版与保留旧记录"
          },
          {
            "command": "node sites/rolecraft/team/qa-v03-check.mjs",
            "passed": 23,
            "total": 30,
            "exitCode": 1,
            "exception": "P01/P02/P12/P13/P16/P26/P28固定0.3/10导航/旧fixture；新C01/C03/C04/C05核对当前11入口与报告机制"
          }
        ],
        "references": [
          "team/qa-v04-review.md",
          "team/implementation-v04-product.md",
          "server/CONTRACT.md"
        ],
        "firstIssues": [
          {
            "id": "V04-01",
            "severity": "P2",
            "status": "原file提示路径存在断言C02复验通过",
            "owner": "网站客户端工程师"
          },
          {
            "id": "CV04-01",
            "severity": "P3",
            "status": "13/10空白计数和JS/JSON元数据已专项核对",
            "owner": "课程架构师"
          }
        ],
        "displayVerification": {
          "command": "Node ESM内联focused：标题逆替换hash比对、其他输入hash不变、当前实际QA JSON隔离呈现",
          "passed": 2,
          "total": 2,
          "exitCode": 0,
          "appSha256": "d147f189a81d7f6ebcdb8e6cb7f047e13c50b1146f9e0bde3a7995dacf27693c",
          "scope": "仅文案和VM显示，非浏览器",
          "reference": "team/qa-v04-review.md 最终显示文案专项冻结"
        }
      },
      "professionalReviewStatus": "未真人专业审核；输入作者稿有AI辅助文稿审校，生成新稿未审",
      "advancedStatus": "无同条件行业实测，行业先进性未验证",
      "remainingItems": [
        "真实模型配置/预算授权及实际请求产物证据",
        "完整教材与案例运行/逐稿审校/真人专业审核",
        "真实用户试点与阈值结果",
        "同条件行业基线和专业比较",
        "真实学员作品、用户验证和独立评分",
        "正式生产身份、备份恢复、监控及运行范围",
        "真实费用/耗时质量/维护数据",
        "真实浏览器和浏览器服务联合验证",
        "报告原样包装后专项核对；未来版本重新审计"
      ],
      "limits": [
        "本轮没有真实外网调用、收费或发布；模拟只支持程序机制。",
        "本地研发账户与真实SQLite恢复已验收，不承诺生产安全或远端恰好一次。",
        "新版本独立核对，旧报告仅历史；限定本地功能结论不能覆盖正式系统失败。",
        "本报告交付时dist只含0.2/0.3历史；工程包装后另核一致性，不改此历史输入hash。"
      ]
    },
    {
      "schemaVersion": "1.0",
      "productVersion": "local-mvp-0.5-textbook",
      "textbookVersion": "textbook-draft-0.5",
      "textbookInputSha256": "bec38479047f9158ac0b218c3e3b921601a5ab90ed5caeddb9c1e370562796fd",
      "standardVersion": "product-creation-2026-10-10",
      "assessmentScope": "formal_learning_product",
      "scopeLabel": "正式职业学习系统",
      "reviewer": "测试工程师独立代理 /root/qa_engineer_v05",
      "auditedAt": "2026-10-10",
      "overall": "not_met",
      "criteria": [
        {
          "id": "user_value",
          "required": true,
          "criterion": "目标人群、问题和验证指标在试验前定义，有真实用户证据且达到预定阈值。",
          "status": "insufficient",
          "evidence": [
            {
              "reference": "team/textbook-v05-product.md",
              "sha256": "7dd6515bb4a2fd447db360d9650d9f65ddc95659fc810180ab87d9b615eb7eb9",
              "observation": "明确三类读者和双培养目标；本轮没有真实用户问题/事前指标与结果。"
            }
          ],
          "limits": "作者原创虚构售后场景不是访谈；没有推定用户满意或不满意。",
          "gap": "缺真实目标用户证据、事前指标/阈值及结果。",
          "owner": "产品经理（用户研究员专项）",
          "nextAction": "按试点协议取得真实用户问题及行为记录，再核预定义结果。",
          "method": "复核协议日期、实际样本、退出及原始结果与范围。",
          "retest": {
            "status": "待取得真实实施或补证并独立复验",
            "method": "复核协议日期、实际样本、退出及原始结果与范围。"
          }
        },
        {
          "id": "teaching_quality",
          "required": true,
          "criterion": "能力、章节、练习和作品建立关联；内容覆盖、深度、来源与案例通过内容核对和专业复核。",
          "status": "insufficient",
          "evidence": [
            {
              "reference": "team/textbook-v05.json",
              "sha256": "bec38479047f9158ac0b218c3e3b921601a5ab90ed5caeddb9c1e370562796fd",
              "observation": "十二章/108正文节/48知识点与题解/36分层练习已写；原目标先修量规保留，作者所有例仍not_run。"
            },
            {
              "reference": "team/textbook-v05-content-review.json",
              "sha256": "9625c2c826f53bbcc1a20781cb093de20b9f214397069d35f7cf095062736b62",
              "observation": "独立AI文稿审校完成，七项文稿问题返修复核，12章绑定当前源hash；humanExpertReview与learnerValidation not_done。"
            },
            {
              "reference": "team/qa-v05-examples-evidence.json",
              "sha256": "74a310e0c1ac600c586103045e6338f4da7004d2b52c48dfb499cd7b70887632",
              "observation": "f01/e02/e03三例在Python3.14.5实际原样与独立变体6进程exit0，绑定正文与代码hash。"
            }
          ],
          "limits": "与0.4的缺章已知失败相比，正文完整性与AI文稿检查已改善，故不再以缺失章作为fail；专业确认与全书案例覆盖仍证据不足。三例离线运行不代表所有代码、Python3.10兼容、真实模型或学习效果。",
          "gap": "全书检索/恢复/部署/性能和真实模型案例执行、人类专业内容审核及真实学习结果仍缺。",
          "owner": "课程架构师（教材研发员/内容审校员专项）",
          "nextAction": "对其他章逐例实现与独立执行，取得有身份和范围的真人专业审核，组织真实学员未知任务。",
          "method": "按原九节/量规逐章核深度，正常/边界/失败/未知案例与专业意见分别复验。",
          "retest": {
            "status": "待取得真实实施或补证并独立复验",
            "method": "按原九节/量规逐章核深度，正常/边界/失败/未知案例与专业意见分别复验。"
          }
        },
        {
          "id": "real_generation",
          "required": true,
          "criterion": "真实模型依学习档案生成教材，保存生成过程、来源及版本，示例验证与失败状态真实。",
          "status": "fail",
          "evidence": [
            {
              "reference": "server/generation/index.mjs",
              "sha256": "52ef3ffefe3028187192fa7712693a1929949403f651daaeb09999a7a12d5beb",
              "observation": "已有真实模型协议适配器，文件未改；本轮没有按账户档案进行真实供应商调用。"
            },
            {
              "reference": "team/textbook-v05.json",
              "sha256": "bec38479047f9158ac0b218c3e3b921601a5ab90ed5caeddb9c1e370562796fd",
              "observation": "provenance明确agent_authored_draft；静态作者包不是网站账户供应商生成任务。"
            }
          ],
          "limits": "数字员工借助模型编写教材不能替代原门槛要求的档案/实际供应商任务关联；不声称适配器未实现，不伪造请求ID、usage或费用。",
          "gap": "缺安全配置/模型/明确预算以及真实请求、来源、产物、失败恢复与逐稿核验。",
          "owner": "AI生成工程师（后端数据与客户端接口协作）",
          "nextAction": "完成真实配置和预算交接后执行受控单章并独立核过程及新内容。",
          "method": "核实际供应商记录、档案、任务/版本、usage与来源，模拟不替代。",
          "retest": {
            "status": "待取得真实实施或补证并独立复验",
            "method": "核实际供应商记录、档案、任务/版本、usage与来源，模拟不替代。"
          }
        },
        {
          "id": "comparative_advantage",
          "required": true,
          "criterion": "选定行业产品及研究基线，在同任务、样本、资源与评分条件下验证差异化指标，并记录专业评审。",
          "status": "insufficient",
          "evidence": [
            {
              "reference": "team/textbook-v05.json",
              "sha256": "bec38479047f9158ac0b218c3e3b921601a5ab90ed5caeddb9c1e370562796fd",
              "observation": "p01/p02安排真实问题、比较条件、差异假设与反馈；教材未声称示范数据是行业实测。"
            },
            {
              "reference": "team/specialists/benchmark-researcher.md",
              "sha256": "1685abace8c3f60dd1c33f9e744584c1e478eb13ec627b60bd2e4ac8f64df26f",
              "observation": "候选基线/公平比较流程已有，尚无同条件实际优势结果。"
            }
          ],
          "limits": "领航结构参考、方法来源、章节多或AI审校不能证明优于行业。",
          "gap": "缺锁定对象/版本/场景/任务/样本/资源、事前指标、实际比较与专业评审。",
          "owner": "产品经理（竞品研究员专项）",
          "nextAction": "冻结同条件行业及研究基线并执行，保留负面与未知结果。",
          "method": "逐项核原11比较字段、实际测量、约束与专业评审，仅支持限定优势。",
          "retest": {
            "status": "待取得真实实施或补证并独立复验",
            "method": "逐项核原11比较字段、实际测量、约束与专业评审，仅支持限定优势。"
          }
        },
        {
          "id": "learner_creation",
          "required": true,
          "criterion": "学习者产出可运行 MVP，具备测试、目标用户验证和独立作品评审，并满足预定评分条件。",
          "status": "insufficient",
          "evidence": [
            {
              "reference": "team/textbook-v05.json",
              "sha256": "bec38479047f9158ac0b218c3e3b921601a5ab90ed5caeddb9c1e370562796fd",
              "observation": "三个学习层次、36练习/解析与未知任务/真实用户作业已有；公开答案不作为独立保留集。"
            },
            {
              "reference": "team/textbook-v05-content-review.json",
              "sha256": "9625c2c826f53bbcc1a20781cb093de20b9f214397069d35f7cf095062736b62",
              "observation": "真实学员未知任务与学习效果尚无证据；AI文稿检查不授予职业能力。"
            }
          ],
          "limits": "QA做题或运行作者代码不是学员MVP或用户验证。",
          "gap": "缺真实学员可运行作品、独立复现/评分及目标用户结果。",
          "owner": "课程架构师（实训评估员专项）",
          "nextAction": "组织真实学员独立作品与非作者未知任务，保留帮助量及真实用户反馈。",
          "method": "依原0—3量规与安全关键规则独立核作品和未知任务，不以阅读完成代替。",
          "retest": {
            "status": "待取得真实实施或补证并独立复验",
            "method": "依原0—3量规与安全关键规则独立核作品和未知任务，不以阅读完成代替。"
          }
        },
        {
          "id": "reliable_delivery",
          "required": true,
          "criterion": "真实系统的持久化、账户权限隔离、异常恢复及版本追踪经独立验证，满足明确运行范围。",
          "status": "fail",
          "evidence": [
            {
              "reference": "server/index.mjs",
              "sha256": "f111fa0f17389a0b586d34f75748b844fa042f9ab88985189c77a30563daf0d8",
              "observation": "本地研发账户/SQLite/持久任务和版本已有0.4独立验证，本轮原文件hash不变；没有正式生产范围。"
            },
            {
              "reference": "server/README.md",
              "sha256": "f70de336bed80cf155da316e01a272a2595b0ebe083121574b6299bcad9052d4",
              "observation": "本地127.0.0.1研发限制保留；生产身份/TLS/备份/监控/多worker尚缺。"
            },
            {
              "reference": "team/qa-v05-review.md",
              "observation": "本轮首轮连接拒绝、detached恢复后独立公开HTTP200/磁盘一致；浏览器能力不可用。"
            }
          ],
          "limits": "不再以无账户/数据库作为失败理由；承认本地改善，但本轮不重测私有数据/账户，不拿公开HTTP通过证明生产体系。",
          "gap": "正式生产身份/运行范围、备份恢复、监控与真实环境联合验证未建立。",
          "owner": "后端数据工程师（客户端及测试接口协作）",
          "nextAction": "由产品冻结正式运行范围，补身份/运维/备份并独立验证。",
          "method": "真实环境隔离、恢复/备份/监控及版本，浏览器与真实供应商链另外验证。",
          "retest": {
            "status": "待取得真实实施或补证并独立复验",
            "method": "真实环境隔离、恢复/备份/监控及版本，浏览器与真实供应商链另外验证。"
          }
        },
        {
          "id": "operating_economics",
          "required": true,
          "criterion": "真实调用与交付记录包含成本、耗时、质量及维护机制，达到预定资源预算。",
          "status": "insufficient",
          "evidence": [
            {
              "reference": "team/textbook-v05.json",
              "sha256": "bec38479047f9158ac0b218c3e3b921601a5ab90ed5caeddb9c1e370562796fd",
              "observation": "e05区分逻辑任务/尝试/质量成功与未知费用；案例cost_units为原创假设。"
            },
            {
              "reference": "team/specialists/operations-analyst.md",
              "sha256": "90f780edfe5a7505316fe532bfa16c25df47b44bcc1ea5f2f4f05e30334f9e51",
              "observation": "运营预算与核算模板已有，实际账单/维护/交付质量分母仍无。"
            }
          ],
          "limits": "QA耗时、文字长度、假设指标与模拟tokens不能作真实成本/运营结果，不能假定成本为零。",
          "gap": "缺预定义真实预算、供应商账单、任务成功/质量/耗时及维护数据。",
          "owner": "产品经理（运营分析员专项）",
          "nextAction": "与真实模型运行及使用记录关联账单，核重试/未知费用和质量。",
          "method": "独立重算实际成本与预算，分别记录usage/估计/真实账单与维护。",
          "retest": {
            "status": "待取得真实实施或补证并独立复验",
            "method": "独立重算实际成本与预算，分别记录usage/估计/真实账单与维护。"
          }
        },
        {
          "id": "iteration_trace",
          "required": true,
          "criterion": "每次产出记录版本、门槛、实际证据、差距、原因、责任人、下一步及复验条件与结果；自评、QA、专业审核分别记录。",
          "status": "pass",
          "evidence": [
            {
              "reference": "team/textbook-v05-content-review.json",
              "sha256": "9625c2c826f53bbcc1a20781cb093de20b9f214397069d35f7cf095062736b62",
              "observation": "7项文稿首次问题与两轮修订复核保持；当前源hash绑定，全文运行缺口开放。"
            },
            {
              "reference": "team/qa-v05-review.md",
              "observation": "实际首轮15/20、夹具修正3/3、审校包1/1、公共HTTP1/1、范围状态2/2与6进程，原失败/原因/责任/复验及残留保留。"
            },
            {
              "reference": "team/qa-v05-examples-evidence.json",
              "sha256": "74a310e0c1ac600c586103045e6338f4da7004d2b52c48dfb499cd7b70887632",
              "observation": "新稿绑定当前完整作者hash及例正文/codehash，快照记录另存，不泛继承。"
            }
          ],
          "limits": "只本次教材/网站产出追踪通过，不保证未来全部作品已复盘；新稿未继承旧audit。最终原样报告打包另做专项核对。",
          "gap": "当次有限改进已复核，正式其他门槛及未来持续追踪开放。",
          "owner": "项目经理",
          "nextAction": "原样包装当前报告并专项核对；按残留门槛安排下一轮实际证据。",
          "method": "核当前网站/教材/hash/两范围，未来每版重新审计、复验问题闭合。",
          "retest": {
            "status": "当次限定追踪通过；其他门槛开放",
            "method": "核当前网站/教材/hash/两范围，未来每版重新审计、复验问题闭合。"
          }
        }
      ],
      "counts": {
        "required": 8,
        "fail": 2,
        "insufficient": 5,
        "pass": 1
      },
      "inputHashes": {
        "dist/app.js": "84c8f04d28466132a40bdf2238d183c917371681271ff35bae67aba1dd618c43",
        "dist/index.html": "1aab6c6f461c162ccef31f223c24461b0e80b75fb797c12e28815b92e62abba1",
        "dist/styles.css": "3bbc6595e02bcf37a9bc924216d2edab67956a096a7207cf925c7bf69b5daeee",
        "dist/textbook.js": "b9f543f2bd01c13335ca17d4700f9399cb4f7d97b20fcc7082a6e1de6a4ca0dd",
        "dist/textbook-data.js": "6fa6a704f46d26adc38bbdc90256d27919309e98177c69459899aa77a3413d73",
        "dist/textbook-content-review-data.js": "9969bb86e62ffa5bd1709ea63a892410c13e99933f1ab3480553abbb268dd5ef",
        "dist/generation.js": "4729f5caad5b17638b73f2cb7744a7aff1015e6a8e97f05b0efd3c5146c09b40",
        "dist/generation-curriculum-data.js": "3864bf34d4f15e89a1e8c44b692272d3febb387a704371703886a7621ce1cdbc",
        "dist/curriculum-data.js": "c3c93435d4417792182c1f98b450a1e1a5c23aa9a8136ddb03086570c03f1442",
        "dist/product-gates-data.js": "a331ad6c46adc7d463e9b56d918a8f96765ebaecfa1ff6c07c2c5e6c19e09b0e",
        "dist/creation-path-data.js": "24a814d9b098e23c698b924924f209dbf14bb5637d9b7cd0ccbe6200d721d2c4",
        "server/index.mjs": "f111fa0f17389a0b586d34f75748b844fa042f9ab88985189c77a30563daf0d8",
        "server/generation/index.mjs": "52ef3ffefe3028187192fa7712693a1929949403f651daaeb09999a7a12d5beb",
        "team/textbook-v05.json": "bec38479047f9158ac0b218c3e3b921601a5ab90ed5caeddb9c1e370562796fd",
        "team/textbook-v05.md": "a8d8d30111ed865f6ab013e1a025f2d0907e73b9107cccdc854489211eb0b102",
        "team/textbook-v05-spec.json": "6872ea67963145ab859fda1d74822336382a9d6ffbc3c236c4bfacf97c712bfb",
        "team/textbook-v05-content-review.json": "9625c2c826f53bbcc1a20781cb093de20b9f214397069d35f7cf095062736b62",
        "team/product-gates.json": "93ef8940281aa173324c581e2fb23366d22026ff2bf3883ff5d0fe93e958ec06",
        "team/curriculum-data.json": "8eb4730321916a7b12f154f06b31444116657a59941e66c1d6fb34b19cf16609",
        "team/qa-v05-examples-evidence.json": "74a310e0c1ac600c586103045e6338f4da7004d2b52c48dfb499cd7b70887632"
      },
      "historicalAuditHashes": {
        "team/product-audit-baseline.json": "c0a127f0ee3b5ab5d21201ee47ae6f65392ebdbfa7a1f0c4e855ab5ad3a31155",
        "team/product-audit-v03.json": "e108f207fcebcd0456e9e001999b0f5f772ff77f8f4291aecfd3c17006583d0f",
        "team/product-audit-v04.json": "febc33a88cb0eb11bba58e2c422009cb4110f66a01f0e573b384acd73d47c020"
      },
      "staticVerification": {
        "productVersion": "local-mvp-0.5-textbook",
        "textbookVersion": "textbook-draft-0.5",
        "textbookInputSha256": "bec38479047f9158ac0b218c3e3b921601a5ab90ed5caeddb9c1e370562796fd",
        "scope": "static_prototype",
        "scopeLabel": "UI契约枚举；实际为教材作者包/只读阅读VM/公共HTTP/选定离线例",
        "standardVersion": "product-creation-2026-10-10",
        "reviewer": "/root/qa_engineer_v05",
        "auditedAt": "2026-10-10",
        "conclusion": "met_within_scope",
        "evidence": [
          {
            "reference": "team/qa-v05-review.md",
            "observation": "20项按阶段全部通过，首轮与复验保留；不是一次20/20整体运行。"
          },
          {
            "reference": "team/qa-v05-examples-evidence.json",
            "sha256": "74a310e0c1ac600c586103045e6338f4da7004d2b52c48dfb499cd7b70887632",
            "observation": "最终源hash绑定三个具体离线例及独立扰动6进程exit0。"
          }
        ],
        "limits": "独立源包/课程对应/隔离DOM+虚构storage VM阅读与Markdown内容导出、公开loopback HTTP资产，以及f01/e02/e03三个Python3.14.5离线例的已记录用例。不是实际浏览器、原生下载、真实模型、全书运行、人类专家/学习效果、用户/市场/成本或生产验证。",
        "tests": [
          {
            "command": "node sites/rolecraft/team/qa-v05-check.mjs",
            "passed": 15,
            "total": 20,
            "exitCode": 1,
            "scope": "首轮，T10/T11/T16夹具问题、T15旧审校包、T19沙盒/连接失败保留"
          },
          {
            "command": "node sites/rolecraft/team/qa-v05-check.mjs --only=T10,T11,T16",
            "passed": 3,
            "total": 3,
            "exitCode": 0,
            "scope": "修closest夹具，原应用断言不变"
          },
          {
            "command": "node sites/rolecraft/team/qa-v05-check.mjs --only=T15",
            "passed": 1,
            "total": 1,
            "exitCode": 0,
            "scope": "独立报告原样包+hash拒绝错误稿"
          },
          {
            "command": "node sites/rolecraft/team/qa-v05-check.mjs --only=T19",
            "passed": 1,
            "total": 1,
            "exitCode": 0,
            "scope": "自动批准的只读公共loopbackHTTP，后端detached后5资源一致"
          },
          {
            "command": "node sites/rolecraft/team/qa-v05-examples-check.mjs textbook-v05.json --include-e03",
            "passed": 6,
            "total": 6,
            "exitCode": 0,
            "scope": "三个原样+三个声明扰动的实际Python进程，仅离线夹具"
          }
        ],
        "displayVerification": {
          "passed": 2,
          "total": 2,
          "exitCode": 0,
          "scope": "AI审校状态/实际remainingGaps/仅状态映射变化；隔离VM"
        },
        "exampleExecution": {
          "reference": "team/qa-v05-examples-evidence.json",
          "inputSha256": "bec38479047f9158ac0b218c3e3b921601a5ab90ed5caeddb9c1e370562796fd",
          "environment": {
            "python": "3.14.5",
            "sqlite": "3.50.4"
          },
          "records": [
            {
              "chapterId": "f01",
              "phase": "verbatim_author_example",
              "bodySha256": "87406395e418c32da50f539f52e3904bbc60f56f1481d79404fc41891e8fe1a9",
              "codeSha256": "75035b4dab5d056186ccdc56225bad1aa0a862c3d329f97460fae403d0c7508c",
              "command": "python3 <temporary-dir>/f01_author_example.py",
              "exitCode": 0,
              "stdout": "expected: local contract checks passed",
              "stderr": "",
              "exampleId": "f01-example"
            },
            {
              "chapterId": "f01",
              "phase": "qa_declared_variants",
              "bodySha256": "87406395e418c32da50f539f52e3904bbc60f56f1481d79404fc41891e8fe1a9",
              "codeSha256": "75035b4dab5d056186ccdc56225bad1aa0a862c3d329f97460fae403d0c7508c",
              "command": "python3 <temporary-dir>/f01_author_example.py with QA appended assertions",
              "exitCode": 0,
              "stdout": "expected: local contract checks passed\nQA normal/schema-error/all JSON priority type variants passed",
              "stderr": "",
              "exampleId": "f01-example"
            },
            {
              "chapterId": "e02",
              "phase": "verbatim_author_example",
              "bodySha256": "973364d90ebd779000cfff0ac1c7bae78386e0afe475ae74595f5da1826624b2",
              "codeSha256": "6871896aca8d0c01c991b77c959a514eb58563da2bb498ea9590fc64d2872cd0",
              "command": "python3 <temporary-dir>/e02_author_example.py",
              "exitCode": 0,
              "stdout": "{'total': 3, 'success': 2, 'critical': 1, 'success_rate': 0.6666666666666666, 'cost_per_success': 3.0}",
              "stderr": "",
              "exampleId": "e02-example"
            },
            {
              "chapterId": "e02",
              "phase": "qa_declared_variants",
              "bodySha256": "973364d90ebd779000cfff0ac1c7bae78386e0afe475ae74595f5da1826624b2",
              "codeSha256": "6871896aca8d0c01c991b77c959a514eb58563da2bb498ea9590fc64d2872cd0",
              "command": "python3 <temporary-dir>/e02_author_example.py with QA appended assertions",
              "exitCode": 0,
              "stdout": "{'total': 3, 'success': 2, 'critical': 1, 'success_rate': 0.6666666666666666, 'cost_per_success': 3.0}\nQA critical-change/zero-success/empty variants passed",
              "stderr": "",
              "exampleId": "e02-example"
            },
            {
              "chapterId": "e03",
              "phase": "verbatim_author_example",
              "bodySha256": "33684bdf00dc3cece133c322a512fc0340ff8254f8b3dc47153ed3b2e7a0215d",
              "codeSha256": "bbc334db77a0de1630e4865f0341f96c3b4b59acaf2d5493989fa6c9fba99ccf",
              "command": "python3 <temporary-dir>/e03_author_example.py",
              "exitCode": 0,
              "stdout": "expected: CR03 four channels clear; CR04 valid once and denials passed",
              "stderr": "",
              "exampleId": "e03-example"
            },
            {
              "chapterId": "e03",
              "phase": "qa_declared_variants",
              "bodySha256": "33684bdf00dc3cece133c322a512fc0340ff8254f8b3dc47153ed3b2e7a0215d",
              "codeSha256": "bbc334db77a0de1630e4865f0341f96c3b4b59acaf2d5493989fa6c9fba99ccf",
              "command": "python3 <temporary-dir>/e03_author_example.py with QA appended assertions",
              "exitCode": 0,
              "stdout": "expected: CR03 four channels clear; CR04 valid once and denials passed\nQA scope/object/exact-approval/tamper/expiry/consumption/four-channel variants passed",
              "stderr": "",
              "exampleId": "e03-example"
            }
          ],
          "limits": [
            "Only read standard-library, offline, no business side-effect examples executed.",
            "Other pseudocode/integration/manual assignments not executed.",
            "Example execution is QA evidence, not real learners or end-to-end Agent results."
          ]
        }
      },
      "professionalReviewStatus": "未真人行业专业审核；当前作者稿有独立AI文稿审校（有范围限制）",
      "advancedStatus": "无同条件行业实测，行业先进性未验证",
      "remainingItems": [
        "全书剩余案例实现与运行、Python3.10兼容实测、人类专业审核",
        "真实档案供应商生成与新稿逐稿核验",
        "真实用户试点/学习者未知任务/作品与行业比较",
        "正式生产身份/运行范围/备份恢复/监控",
        "真实费用质量耗时与维护",
        "真实浏览器/原生下载/视觉/键盘/读屏验证",
        "当前报告原样包装的专项核对及未来版本重新审计"
      ],
      "limits": [
        "教材是数字员工AI作者草稿，与网站按账户实际供应商生成不同。",
        "原八门槛/判定规则不变，完整稿和AI审校不代替正式质量/能力/行业先进。",
        "独立源包/课程对应/隔离DOM+虚构storage VM阅读与Markdown内容导出、公开loopback HTTP资产，以及f01/e02/e03三个Python3.14.5离线例的已记录用例。不是实际浏览器、原生下载、真实模型、全书运行、人类专家/学习效果、用户/市场/成本或生产验证。",
        "本JSON在报告打包前冻结；最终原样包核对追加独立MD记录，避免改JSON的重复包装循环。"
      ]
    }
  ]
};
