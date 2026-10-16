# 测试工程师 · prototype-0.3 独立验收

日期：2026-10-10。依据：qa-v03-plan、产品／课程／设计交接和工程冻结交付。只进行隔离逻辑、数据与本地产物审计，未修改应用／上游标准，未访问用户浏览器或真实存储。

## 首轮结果：待修复

冻结 app.js SHA-256：`562dc5f36e39f6e5fde132526f951c619ec1af7d8d8624c07c0b642cf1e9c13b`。实际执行：

```text
node sites/rolecraft/team/qa-check.mjs
TOTAL 22; PASS 22; FAIL 0       # exit 0
node sites/rolecraft/team/curriculum-check.mjs
TOTAL 20; PASS 20; FAIL 0       # exit 0
node sites/rolecraft/team/qa-v02-check.mjs
TOTAL 26; PASS 25; FAIL 1       # exit 1
FAIL_DETAILS {"id":"V09","actual":"prototype-0.3","expected":"prototype-0.2"}
node sites/rolecraft/team/qa-v03-check.mjs
TOTAL 30; PASS 28; FAIL 2       # exit 1，P11/P17
```

不能称“原68全部通过”：旧 V09 将员工网站产物预填写死0.2，而当前产物升级0.3。独立新增 P28 验证新预填0.3、已存0.2历史保留并导出，通过，确认需求版本变化而非旧记录丢失。未改旧脚本、删断言或覆盖其失败结果。V23—V25 原草稿／保存保护问题的原用例继续通过。

## 新用例覆盖

P01—P04 验证真实数据先加载、与专业 JSON 一致、两页十导航、七阶段和十二模块引用及预填未知状态；P05—P10 覆盖八必需fail优先、每个缺证／结果／状态、十一比较字段逐个缺失、非法状态／范围／标准及关键schema缺失；P12—P16、P18、P29—P30 覆盖0.2历史隔离、当前无报告、正式／静态分栏、报告版本／字段／门槛校验和用户伪造审核拒绝；P19—P28 覆盖必填、多记录CRUD、连续新建、全部字段刷新、中文转义、输入与提交故障、导出和恢复、取消及旧记录共存。上述通过不代表行业先进。

测试采用 Node VM、真实打包数据、表单感知 stub 和独立内存存储。合成报告仅用于检验匹配／拒绝机制，不作为真实专业或功能报告。无依赖安装、联网或发布。

## V03-01 · P2 · 基线字段重复可绕过完整比较契约

- 用例 P11：将产品标准 benchmarkFields 换成十一份相同的 source，其他数据保持原标准；实际 productStandard 非 null，预期无有效标准。
- 依据：产品门槛明确十一种比较字段；设计要求标准不符不得产生通过。validProductStandard 只检查长度11，未检查字段唯一和完整，productDecision 依据此列表逐项检查，重复字段可漏掉原比较条件。
- 这属于合成损坏数据的稳健性问题，当前打包原标准字段完整；不是普通用户填写基线即可重写门槛，也不是用户存储越权。
- 责任：软件工程师。动作：核对十一字段唯一、完整及关键契约；复验保留 P11，不以取消异常检查获取通过。状态：已报告项目经理，待修复及独立复验。

## V03-02 · P2 · 未知嵌入静态范围仍可显示通过

- 用例 P17：合成有效当前正式审计，staticVerification 同版本、明确结论及文字证据／局限，但 scope=`unrecognized_scope`；实际页面显示“独立功能结论：在明确范围内达标”，预期拒绝该未知范围。
- 依据：设计要求正式／静态范围隔离及有效匹配报告；未知范围不得视为有效静态验收。productAuditSection 对嵌入范围只检查非空已知文字，未验证它为约定静态范围。
- 此测试使用合成损坏独立报告，不声称存在真实审核通过；当前打包只有0.2历史，没有0.3报告，更非自评能更改审计。
- 责任：软件工程师。动作：验证嵌入范围及版本／字段契约；保留 P17 复验，另确认正确静态范围仍显示且不覆盖正式失败。状态：已报告项目经理，待修复及独立复验。

## 证据与限制

首轮其他文件哈希：index.html `5dc1e2070c0e74ce582f0948bd50a8482d2651e7d76063ca016b1f8efb13ed05`；product-gates-data.js `a331ad6c46adc7d463e9b56d918a8f96765ebaecfa1ff6c07c2c5e6c19e09b0e`；creation-path-data.js `24a814d9b098e23c698b924924f209dbf14bb5637d9b7cd0ccbe6200d721d2c4`；product-audit-data.js `0bbfa29213396404401baae81d38be134f5794919c71d284984d85c8a6042285`。该审计脚本输入只有0.2历史，当前未独立审计显示正确。

stub 不模拟实际布局、原生表单、焦点、读屏、历史栈、下载或配额规则；这些均未验收。无浏览器截图。专业事实、真实生成、完整教材、用户／学习者成果、生产与市场运行未验证。后续修复结果追加于本报告，不删除首轮失败。最终QA报告原样打包后还须专门验证一致性及两范围显示；本轮首验尚未执行这一步。

## 修复冻结后的独立复验 · 已验证两项逻辑改进

日期：2026-10-10。再次核对 app.js SHA-256 为 `a17d6db7aa11effe914c8b3c7a4f3e5989819550a60ec1e375fc111713bf8ed8`。测试工程师实际重跑，与开发自检分别记录：

```text
node sites/rolecraft/team/qa-check.mjs
TOTAL 22; PASS 22; FAIL 0       # exit 0
node sites/rolecraft/team/curriculum-check.mjs
TOTAL 20; PASS 20; FAIL 0       # exit 0
node sites/rolecraft/team/qa-v02-check.mjs
TOTAL 26; PASS 25; FAIL 1       # exit 1，仍仅 V09 旧版硬编码期望
node sites/rolecraft/team/qa-v03-check.mjs
TOTAL 30; PASS 30; FAIL 0       # exit 0
```

P11 原十一份 source 输入现使 productStandard 为 null；P17 原未知嵌入范围输入现不显示静态达标。原用例和断言未修改，P16 合法 static_prototype 正例仍通过且不覆盖正式失败，P08 每个比较字段缺证仍不通过。V03-01／V03-02 在所列隔离逻辑范围内已验证改进。没有以修改测试预期或借用工程结果关闭问题。

本次无需修改 stub 或测试基础设施；旧三个脚本原样执行。V09 原 expected=prototype-0.2 的失败持续记录，不能宣称原68全部通过；新版 P28 验证预填0.3和保存0.2历史共存，说明它是需求版本变化。V23—V25 原草稿及未落盘保护继续通过。

本轮静态结论：**在明确范围内达标**，范围为当前冻结版的隔离VM逻辑、源数据契约和结构，不包含浏览器、视觉、下载及真实存储机制。新两页路线／门槛／版本隔离／CRUD及故障状态在该范围内通过；同一次产物仍须正式八門槛独立审计，见 product-audit-v03.json/.md，结论不能互换。完整正式学习系统未达标，行业先进性未验证。

打包前 product-audit-data.js SHA-256 仍为 `0bbfa29213396404401baae81d38be134f5794919c71d284984d85c8a6042285`，只有0.2历史；P12 检查本轮当前未审计展示正确。最终0.3独立报告交付后由工程仅打包，随后QA再核对报告原样一致、版本及两范围显示；本次不预先声明这一步通过。首轮28/30与两项P2保持历史，不覆盖为首次一直成功。

## 最终报告包装专项验收 · 2026-10-10

工程仅将独立0.2历史与0.3当前报告原样加入 product-audit-data.js。测试工程师实际执行：

```text
node sites/rolecraft/team/qa-v03-package-check.mjs
FOCUSED TOTAL 6; PASS 6; FAIL 0       # exit 0
SHA256 app.js a17d6db7aa11effe914c8b3c7a4f3e5989819550a60ec1e375fc111713bf8ed8
SHA256 product-audit-data.js d46faae2909d44c13df3a0a8fa01056560db0a69019c889cf959e7ceba015490
```

F01确认包装对象与两个原JSON逐字段完全一致，app及入口、样式、专业数据哈希未变；报告JSON中的旧auditdata哈希属于审计时输入，保留原样。F02确认当前匹配0.3正式审计为not_met／3fail、4insufficient、1pass，渲染“未达标”、未专业审核及不能认定行业先进。F03确认嵌入静态结论限定当前版本、static_prototype、明确结论、原证据与原限制，且不覆盖正式失败。F04确认仅一份0.2历史，不能继承为当前。F05—F06确认伪造本地审核和保存自评达标均不能改只读独立结论。

此6项是必要包装验证，未扩大或重跑原套件。脚本复用旧VM harness，在独立内存中运行真实当前打包数据；无用户存储、浏览器或外部动作。最终包装与隔离逻辑呈现已验证；浏览器／视觉／原生下载／读屏与真实存储仍未验，正式教材、模型、用户、专业、市场与生产缺口仍开放。product-audit-v03.json不修改，首轮失败历史和旧V09版本冲突不变。
