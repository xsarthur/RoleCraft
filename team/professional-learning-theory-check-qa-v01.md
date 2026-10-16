# 专业学习资料理论核验包 v0.1 · 独立 QA

- QA 日期：2026-10-15（Asia/Shanghai）
- QA 岗位：测试工程师（独立复验）
- QA 编号：`PLR-THEORY-QA-V01`
- 范围：四项理论核验规格的字段完整性、来源/版本绑定、评审职责边界和正式训练闸门。
- 本 QA 不执行课程、回答题目、云实验、法律判断或岗位能力评价；不修改课程架构师的核验包，也不替学习者补答案。

## 输入与冻结证据

| 输入 | SHA256 | 用途 |
|---|---|---|
| `professional-learning-theory-check-v01.md` | `175b31a81ad4bc0692d7e1db22c57cec138b4b33ab509876a7e7138629b28749` | 人读规格与四项版本边界 |
| `professional-learning-theory-check-v01.json` | `881a3a7cc11ca48010d8c84613d4ca93752aa1cdb3da39e5c0af2436a087eac0` | 结构化规格、逐项题目、来源绑定、评审范围和状态 |
| `professional-learning-resources-v02.json` | `fe03b43087ac42d708e4db9bc8c5ec16aa3eec18d9e184defac29581f1295dc9` | 四项 `resource_id`、来源元数据与训练前状态 |

四项目标 ID 为 `PLR-AI-006`、`PLR-COMP-004`、`PLR-BE-003`、`PLR-BE-004`，集合无增删。目录中的四项 `theory_check` 均为 `pending`，`training_eligibility` 均为 `not_ready_pending_final_qa_and_theory_check`；这与核验包的执行前 `planned` 状态一致。

## 检查结果

### 规格完整性：`met`

四项各自具备：

- 4 个机制问题、1 个反例、1 个取舍题；计数与正文一致。
- 岗位作品、隔离练习、失败/边界证据、迁移任务、先修和停止条件，字段均为非空字符串并能在 Markdown 找到对应说明。
- 8 类证据要求：逐题原始回答/引用、反例、取舍记录、岗位作品、隔离练习记录、首次失败与返修、留出迁移、停止/拒绝/升级。
- 四项均绑定 `L0→L1 theory_and_boundary`，且共同合同要求沙箱、无外部副作用和留出迁移。

抽查结果如下：

| 资源 | 机制题 | 反例 | 取舍 | 作品/练习/迁移/停止 | 结论 |
|---|---:|---:|---:|---|---|
| `PLR-AI-006` LangGraph | 4 | 1 | 1 | 齐全 | `pass` |
| `PLR-COMP-004` 欧盟相关市场定义 | 4 | 1 | 1 | 齐全 | `pass` |
| `PLR-BE-003` Google Cloud 数据工程路径 | 4 | 1 | 1 | 齐全 | `pass` |
| `PLR-BE-004` DDIA 第二版 | 4 | 1 | 1 | 齐全 | `pass` |

### 来源与版本绑定：`met`

- 四个检查对象通过稳定 `resource_id` 绑定到 `professional-learning-resources-v02.json`；目录四项的 `source_version`、`language`、`cost_and_access`、`prerequisites`、`license_or_usage`、`maintenance_or_publication_date`、`recheck_at` 均非空。
- JSON 每个 check 现在内嵌 `source_binding`，其 `resource_id`、`canonical_url`、`source_version`、`recheck_at`、语言、费用、先修、许可和 `training_eligibility` 与冻结目录逐项一致；版本绑定不依靠题目标题猜测。
- Markdown 对四项写明了当前来源边界：LangGraph 课程页未发布版本号、欧盟公告为 CELEX `52024XC01645`、Google Skills path 与认证页分离、DDIA 使用 ISBN `9781098119058` 并保留出版月份差异。第一版/历史页、认证页和框架许可没有被当成同一来源。
- 题目正文仍保留动态页面不可稳定复现、地区价格或许可细节不足等来源限制；这些是来源本身的限制，不是绑定失败。若目录变更，必须新建版本并重跑 QA。
- `PLR-COMP-004` 与 `PLR-BE-003` 的 `title` 是核验包中的可读简称，分别不是目录的完整标题；ID、canonical URL 与版本字段不冲突，但下一版宜保留目录规范标题或增加 `title_alias` 字段，避免人工交接误认。

来源绑定本身通过；但题包不能替代外部来源的再次联网核验，也不能把四项来源的动态价格、地区访问或版本变化视为永久稳定。

### 评审职责边界：`met`

- `reviewers` 在共同合同及四个 check 中均为 `内容审校员`、`测试工程师`，没有把课程架构师或学习者列为自己的独立评审。
- `content_reviewer` 明确负责概念、来源、版本、许可和论证边界；`qa_engineer` 明确负责夹具、环境、运行证据、反例、迁移和可复验性。
- 规格明确禁止两类评审替学习者补答案；课程架构师负责题目/练习规格，项目经理只协调批次和状态。职责没有越界到作者代写或测试代答。

### 正式训练准入闸门：`not_met`（阻断）

- 核验包顶层和四个 check 的 `status` 全部为 `planned`；这是执行前规格状态，不是通过结果。
- 当前只有题目、作品规格和证据要求，没有学习者逐题原始回答、隔离练习运行记录、首次失败/返修记录、留出迁移结果或停止升级记录。
- 共同合同把 `planned` 与 `pass`/`pass_with_limitations`/`fail`/`insufficient_evidence` 分开；完成阅读、提交作品草案或目录复核都不能跳过执行后的独立复验。
- 因此四项只能放在“待训练/候选输入”区，不能标为正式必修完成、岗位胜任、证书等价或能力认证。正式训练需先冻结实际夹具，再由内容审校员与测试工程师分别复核结果。

## 缺陷与复验条件

| 编号 | 严重度 | 状态 | 责任人 | 复验条件 |
|---|---|---|---|---|
| `PLR-TQA-V01-GATE` | P1 | `open_blocking` | 课程架构师组织训练；内容审校员与测试工程师独立复核 | 产生四项逐题、反例、取舍、作品、隔离练习、失败边界、迁移和停止记录；更新核验包/目录版本后重新 QA |
| `PLR-TQA-V01-TITLE` | P2 | `open_with_limitations` | 课程架构师 | 将两项简称与目录规范标题显式对齐或增加别名字段，再复核 Markdown/JSON 一致性 |
| `PLR-TQA-V01-FORMAT` | P2 | `open_with_limitations` | 课程架构师 | 下一版将作品 ID、说明拆为结构化字段后复核，避免 `role_artifact` 携带 Markdown 装饰符 |

## 最终判定

| 层次 | 结论 |
|---|---|
| 四项理论核验规格完整性 | `met` |
| 来源、版本与许可边界绑定 | `met` |
| 评审职责与独立性 | `met` |
| 正式训练准入 | `not_met`（阻断） |

本报告只证明规格和闸门被独立检查过。实际执行尚未开始；不得以本报告、理论题包或目录阅读记录推断学习者掌握、岗位能力、真实用户价值或行业先进性。
