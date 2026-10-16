# 八岗跨项目长期记忆配置独立 QA

- **报告 ID**：`qa-memory-pm-8roles-2026-10-14`
- **执行岗位**：测试工程师（独立配置 QA）
- **执行日期**：2026-10-14（Asia/Shanghai）
- **被测范围**：core manifest、八个岗位的 `ROLE.md` / `MEMORY.md` / `MEMORY_SCHEMA.md`、共享 `user-profile`、core README、`HANDOFF_TEMPLATE.md`、`sites/rolecraft/team/README.md`，并按工作区 `AGENTS.md` 核对唯一责任领域
- **本次只写入**：本文件与 `qa-memory-pm.json`

## 结论

八岗核心员工配置在文件和静态规则范围内为 **`met_within_configuration_scope`**。manifest 注册的项目经理、产品经理、产品设计师、软件工程师、课程架构师、教材研发员、内容审校员和实训评估员，八个目录的三类岗位档案均存在。八份 ROLE 均定义职责边界、跨项目读取顺序和“先提交候选、确认后写入长期记忆”的规则；八份 MEMORY_SCHEMA 均覆盖证据、适用范围、置信度、确认状态和版本/变更关系。各岗位的已确认条目有用户确认依据，未确认的产品、设计、编码、教学、写作、审校或评价偏好没有被伪装成已确认长期事实。

core README、共享用户偏好、交接模板和 `sites/rolecraft/team/README.md` 均已按八岗表述，岗位职责与工作区 `AGENTS.md` 的唯一责任领域相符。前次 team README 状态引用漂移已由项目经理修正，本次最终快照复验通过；本 QA 没有修改 team README。

**运行时跨项目读取/写回、记忆候选在其他项目的实际累积、真实用户长期偏好、真实岗位效果和真人专业证据均为 `not_verified`。**本次通过只证明静态配置和职责/记忆规则，不能证明代理已经成为常驻员工、自动跨项目记忆，或已经产生职业能力、课程效果和行业结论。

## 检查记录

| 检查 ID | 检查项 | 状态 | 证据与结果 |
| --- | --- | --- | --- |
| 8R-01 | manifest 注册八岗且三类文件存在 | `pass` | `manifest.json` 的八个 `employees` 与 `project-manager`、`product-manager`、`product-designer`、`software-engineer`、`curriculum-architect`、`textbook-developer`、`content-reviewer`、`practicum-evaluator` 目录和 `ROLE.md` / `MEMORY.md` / `MEMORY_SCHEMA.md` 一一对应。 |
| 8R-02 | 八份 ROLE 的职责边界符合 AGENTS | `pass` | 项目经理负责协调；产品经理负责产品需求；设计师负责 UX/视觉；软件工程师负责网站客户端；课程架构师负责能力/课程结构/规格；教材研发员负责正文/案例/练习；内容审校员负责技术论证和来源独立审校；实训评估员负责按批准量规评价学习者作品和未知任务。各岗均声明不越过相邻岗位。 |
| 8R-03 | 八份 ROLE 规定跨项目读取和候选写入 | `pass` | 八份 ROLE 均要求读取共享偏好、岗位 ROLE/MEMORY/SCHEMA 和当前项目资料；任务结束先提交带证据、范围、置信度、确认状态和版本的候选，获用户或项目经理确认后才更新 MEMORY，项目特例留在交接。 |
| 8R-04 | 八份 MEMORY 未把未确认偏好写成 confirmed | `pass` | 项目经理、产品经理、课程架构师、教材研发员、实训评估员的已确认条目均是用户确认的“员工独立记忆/跨项目复用”协作约定；产品设计师条目均 `user_confirmed` 且有共享档案依据；内容审校员条目为 `user_confirmed`；软件工程师没有已确认编码偏好。各文件均列出待确认内容或不得推断的项目特例。 |
| 8R-05 | 八份 MEMORY_SCHEMA 含证据、范围、置信度、确认状态、版本 | `pass` | 八个 schema 均定义来源/证据、scope、confidence、confirmation status、version/recorded date，并规定候选升级、冲突替代、降级或审计保留。 |
| 8R-06 | user-profile、core README、team README、handoff 一致 | `pass` | 共享档案、core README、HANDOFF_TEMPLATE 和 team README 均按八岗定义员工复用、交接和候选回写；team README 已更新为八岗 QA 状态，最终快照确认无旧四岗待完成表述。 |
| 8R-07 | 八岗与 AGENTS 唯一责任领域一致 | `pass` | 八份 ROLE 的唯一责任、禁止越界和跨岗交接逐项符合工作区 AGENTS：教材作者与审校分离、课程架构与正文分离、实训评价不代学员、不把自查当 QA，项目经理不代写专业产物或独立验收。 |

## 各岗位静态结果

| 岗位 | ROLE 边界 | MEMORY 纪律 | MEMORY_SCHEMA 字段 | 状态 |
| --- | --- | --- | --- | --- |
| 项目经理 | 协调、依赖、任务状态、交接、复盘；不代写专业产物/独立验收 | 用户确认仅为跨项目记忆协作约定 | 证据、范围、置信度、确认、版本及替代 | `pass` |
| 产品经理 | 用户问题、范围、流程、验收和产品门槛；不代设计/工程/测试 | 用户确认仅为独立记忆协作约定 | 同上 | `pass` |
| 产品设计师 | UX/视觉、可访问性和响应式；明确禁止写代码、改范围或代验收 | 三条视觉沟通偏好均 `user_confirmed`；其他审美/技术偏好待确认 | 同上 | `pass` |
| 软件工程师 | 网站客户端、状态和接口消费；不代模型、数据、检索或 QA | 没有已确认编码偏好，候选需确认 | 同上 | `pass` |
| 课程架构师 | 能力矩阵、课程结构、教材/练习规格、量规和交接；不写正文/代审校/代评价 | 仅确认教材相关员工的独立记忆协作约定 | 同上 | `pass` |
| 教材研发员 | 正文、案例、练习和参考解法；不改课程架构/产品门槛/代码/自审 | 仅确认教材员工的独立记忆协作约定；文风/深度待确认 | 同上 | `pass` |
| 内容审校员 | 技术论证、来源、机制、案例和代码独立审校；不改作者正文/自审 | 仅确认教材员工的独立记忆协作约定；审校标准待确认 | 同上 | `pass` |
| 实训评估员 | 按批准量规评价作品/未知任务；不编教材、代作答或认证能力 | 仅确认教材员工的独立记忆协作约定；评分/难度待确认 | 同上 | `pass` |

## 已关闭问题

- **PM-8R-F-001 / P2 / team README 状态引用漂移**：项目经理已将核心员工 QA 状态更新为八岗 `met_within_configuration_scope`，并删除教材四岗待完成表述；本次最终快照复验通过，8R-06 已关闭。

## 开放缺口

- **`not_verified` / 运行时**：尚未在另一个项目真实读取八岗档案、创建各岗 handoff、产生候选、确认并回写；未验证并发冲突或权限边界。
- **`not_verified` / 长期经验和真人证据**：没有跨项目真实用户持续反馈、真实岗位产出对比、学习者作品、真人专家审核或生产运行证据；文件中的 `user_confirmed` 只证明用户确认了记忆机制或设计沟通偏好，不能扩展为职业胜任或行业先进结论。

## 证据快照

被测源文件在本次读取时的 SHA-256（仅用于复验；本测试工程师没有修改这些源文件）：

- `team/README.md`: `0af47558ee10a783220e46b6bc1dccf204b9b16795d2f5bd82adfca790fc44c2`
- `core/manifest.json`: `42a9a92a50670b5add71f37b1a71e44375929d93965d2c4895eec27e2d7bdee1`
- `core/README.md`: `68130e4f96dd99af978552f105c074f5ca6afefd460500a2367837e2be04c1e4`
- `core/HANDOFF_TEMPLATE.md`: `daba2364648e4ff0b71aef784c5598d92749167a549401516f579040bdd7f5c3`
- `core/user-profile/approved-preferences.md`: `a3c9740587879e9777a92753f36e7db36d94844872d5da0aa2504a49d9823cf5`

### 项目经理（项目协调）
- `ROLE.md`: `5723ae959545b720cf5f63fc16de87a7133be9f9bb93eb294bc0a3862a17a48c`
- `MEMORY.md`: `62f904e7d6913adc7c7a557295e7d4c713931c93f9c37c3c62de999a1fb0e18a`
- `MEMORY_SCHEMA.md`: `8956275ccc33c35be84ceb90b1021f016b2f918c061c6e303bfdc0262d1ed6c1`
### 产品经理（产品需求）
- `ROLE.md`: `56f932f3621b64469b3136ff3d1cafa3af900608f5c82947e33e0012ffd614c7`
- `MEMORY.md`: `d992070fba035c1d3a5fb6f5734ed0922f011321c717cfb578b9b2e8209e38fe`
- `MEMORY_SCHEMA.md`: `4026b98355e6fc1332871eaa9d93bf532288125fea200f40c7c78fc041303c07`
### 产品设计师（用户体验与视觉设计）
- `ROLE.md`: `c4cc977f33667beb98c15ac31aa4f11c5b8f147f9d5fe9e15fd103f1c64cffa2`
- `MEMORY.md`: `064e9a326a2e639dd9ac2e899c78abaaa1e803be7f7381d3c82e7b1a0eb63d7e`
- `MEMORY_SCHEMA.md`: `eb13a5bdf1676aa9370e366f81e8c295d5271c064b674f831105434f4c8207f4`
### 软件工程师（网站客户端实现）
- `ROLE.md`: `56940700e435fe7bfe075d98c61481da245f196ab0f8786880436850c70d02dd`
- `MEMORY.md`: `656820a15b419f663aa0854c89c4e1e42cb4974af5e459874196538c723fc1cd`
- `MEMORY_SCHEMA.md`: `54140baacc232219a481a1c61dda3182cd0679d7b3394a5d240a19194685815a`
### 课程架构师（教学架构）
- `ROLE.md`: `27b6240f660d7b3956947e6e3d23a71adee0151e95cda7d073a1dd08a652b13e`
- `MEMORY.md`: `8978b4727d114cfac1d83eea03c7c2972f9013e97bfea7457bfe34bda1cadfcf`
- `MEMORY_SCHEMA.md`: `717d37acdbcfee1a37752aa0bb63760221827e820881e3e46992e94036be84b9`
### 教材研发员（教学内容编写）
- `ROLE.md`: `30dc5c7f39c3ad3a37ff55bd583c99e19002ee13a2a266004276d9d866c5bc7d`
- `MEMORY.md`: `27f07d092fcf75692bd464a4e80e96254f54421c93e8097f4efe88516a3ee420`
- `MEMORY_SCHEMA.md`: `759bb9f8ee4564d1a4976aaedee371c987e8f0c181abb8c2afe6f198291e49a5`
### 内容审校员（技术内容审校）
- `ROLE.md`: `66ac6d3003b94dc1ea45b42f92dd3ad206e6602d90ba547f7f1be6769839c72f`
- `MEMORY.md`: `8eddcb716d01674fa6088a9fbbbe3ae8cbc064edbb381740f30cb56f8da2ecbd`
- `MEMORY_SCHEMA.md`: `9d70c68fc61f9dbba0b87f81a9269ababba9fc9acf505738a6f06c205b48361f`
### 实训评估员（学习者实训评价）
- `ROLE.md`: `a40e6ff2d988c7258934338a055d4b8b585ef2a880c4953d013e2ee89ae42217`
- `MEMORY.md`: `d3beb07c359a21cf9f7b783a069305037bfaaf55133e2af7d657a70efc87f00e`
- `MEMORY_SCHEMA.md`: `b3494d99f618fb699f8069d9b64e3d8a10de34b683f79dd42c921fcb8c73c4be`

## 文件变更声明

本测试工程师只更新 `core/qa-memory-pm.md` 与 `core/qa-memory-pm.json`；没有修改八岗档案、manifest、共享偏好、core README、team README 或交接模板。
