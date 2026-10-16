# 三岗跨项目长期记忆配置独立 QA

- **报告 ID**：`qa-memory-2026-10-14`
- **执行岗位**：测试工程师（独立配置 QA）
- **执行日期**：2026-10-14（Asia/Shanghai）
- **被测范围**：`manifest.json`、三个岗位的 `ROLE.md` / `MEMORY.md` / `MEMORY_SCHEMA.md`、共享用户偏好、`README.md`、`HANDOFF_TEMPLATE.md`
- **本次只写入**：本文件与 `qa-memory.json`

## 结论

配置在本次检查范围内为 **`met_within_configuration_scope`**。manifest 注册的产品经理、产品设计师、软件工程师目录及三件岗位档案均存在；三个岗位都定义了职责边界和跨项目读取/写入流程；记忆条目具备证据、范围、置信度、确认状态和版本约束；共享用户偏好与三岗的实际记忆内容一致，且没有把未确认的编码或相邻审美/产品偏好写成已确认事实；README 与交接模板说明了新项目读取、交接、候选记忆和确认后回写流程。

这只是文件配置和静态一致性结论。**实际长期经验是否在其他项目持续复用、用户是否长期认可这些偏好、以及代理是否在运行时正确读取/写回，均未由本次 QA 证明，状态为 `not_verified`。**产品经理当前唯一已确认的是“按岗位建立可跨项目复用的独立长期记忆”这一协作约定；产品设计师的三条视觉沟通偏好有用户确认记录；软件工程师没有被伪造的已确认编码偏好，符合保守写入规则。

## 检查记录

| 检查 ID | 检查项 | 状态 | 证据与结果 |
| --- | --- | --- | --- |
| CM-01 | manifest 中三个岗位文件都存在 | `pass` | `manifest.json` 的 `employees` 正好注册 `core-product-manager`、`core-product-designer`、`core-software-engineer`；三目录及各自 `ROLE.md`、`MEMORY.md`、`MEMORY_SCHEMA.md` 均存在，且 manifest 路径与实际相对路径一致。 |
| CM-02 | 每个 ROLE 有职责边界 | `pass` | 产品经理含“唯一责任领域/明确边界”；产品设计师含“身份与唯一责任/明确禁止”；软件工程师含“唯一责任领域/明确边界”。三者均声明不得代替其他岗位。 |
| CM-03 | 每个 ROLE 有跨项目读取/写入规则 | `pass` | 三份 ROLE 均有“跨项目”或“跨项目工作协议”：启动时读取共享偏好、岗位 ROLE/MEMORY/SCHEMA 和当前项目资料；结束时先提交候选，确认后才更新 MEMORY，并保留版本/来源。 |
| CM-04 | MEMORY 不把未确认的产品/设计/编码偏好伪装成 confirmed | `pass` | 产品经理的唯一 `confirmed` 条目有用户原话和 `user_confirmed`；设计师三条条目均有用户确认状态和共享档案依据；软件工程师明确写“目前没有用户明确确认的…偏好”，待确认区为空。各文件还列出不得推断的相邻偏好。 |
| CM-05 | MEMORY_SCHEMA 包含证据、范围、置信度、确认状态、版本 | `pass` | 三份 schema 均规定证据来源、适用范围、置信度、确认状态和稳定版本字段，并规定候选到确认后的升级流程和替代关系。 |
| CM-06 | 共享用户偏好与三岗内容一致 | `pass` | `user-profile/approved-preferences.md` 只列用户确认的跨项目复用、视觉优先及证据/边界规则；产品经理记忆只确认跨岗位记忆协作，设计师记忆逐条引用共享视觉偏好，软件工程师明确不从共享档案推导编码风格。没有相互冲突的已确认条目。 |
| CM-07 | README/HANDOFF_TEMPLATE 能说明新项目如何复用 | `pass` | README 要求新项目读取共享档案和对应三件岗位文件、创建项目 handoff、先写候选再确认回写；模板提供项目目标、输入、特例、已确认偏好、限制和候选所需证据/范围/置信度/确认字段。 |
| CM-08 | 不越过 AGENTS 中的岗位责任 | `pass` | 三个 ROLE 将产品、设计、客户端实现分别限定在对应领域，并把测试独立性、课程/检索/模型/数据等交给原责任岗位；记忆写入规则不改变产品门槛、用户授权或测试职责。 |

## 证据快照

以下是被测源文件在本次读取时的 SHA-256（用于复验；本报告不修改这些源文件）：

- `manifest.json`: `354a490b59784dfff096fe76743b401980586d2e615a7c4c0a9d9b61340dd4c1`
- `README.md`: `845ef557811091866daa280b792e9baaabe8aeb865974542d3186f05bff14ccb`
- `HANDOFF_TEMPLATE.md`: `daba2364648e4ff0b71aef784c5598d92749167a549401516f579040bdd7f5c3`
- `user-profile/approved-preferences.md`: `22c2d9ebce5a21ab06cffcbcd43702388bb37c49bebc3bce11feb5a21f409797`
- `product-manager/ROLE.md`: `56f932f3621b64469b3136ff3d1cafa3af900608f5c82947e33e0012ffd614c7`
- `product-designer/ROLE.md`: `c4cc977f33667beb98c15ac31aa4f11c5b8f147f9d5fe9e15fd103f1c64cffa2`
- `software-engineer/ROLE.md`: `56940700e435fe7bfe075d98c61481da245f196ab0f8786880436850c70d02dd`

## 未验证项与复验条件

- `not_verified`：没有运行时跨项目会话，未证明代理在新项目实际读取这些文件或成功写回候选/批准条目。
- `not_verified`：没有真实用户在多个项目中的持续反馈，不能把文件中的 `user_confirmed` 记录扩展解释为长期品味、职业胜任或真实用户效果。
- `not_verified`：没有验证 Codex 本地记忆、项目权限或并发写入对文件协议的影响；正式来源仍以版本化文件为准。
- 后续若要宣称“有经验的员工已在多个项目累积经验”，应由产品/用户研究提供跨项目实际任务证据，由测试工程师在新版本中复核读取、候选确认、版本变更和边界遵守；不得沿用本次配置 QA 结论代替运行证据。

## 文件变更声明

本测试工程师只创建了 `qa-memory.md` 与 `qa-memory.json`；被测 manifest、岗位档案、共享偏好、README 和交接模板未被本报告修改。
