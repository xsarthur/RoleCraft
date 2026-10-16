# UI2-MOBILE01 · 题库窄屏筛选横溢返修交接

日期：2026-10-12（Asia/Shanghai）。岗位：客户端软件工程师。状态：冻结CSS窄修完成源范围自查，待UI2真实390及直接影响复验；**当前共享dist/live未合入修复**。没有改旧冻结专业报告、教材、题数据、JS、服务、模型或实际用户记录。

## 原例与原因

UI2在 e731 体验JS + d190CSS 隔离候选、官方390×844视口观察：n03正文documentWidth390，表/代码内部横滚正确；切题库后documentWidth563、innerWidth390。原71号metrics显示知识点及题组label/select从x190起宽373，右边界563；清除筛选也被同网格推到该边界。原UI2 metrics与bank114-390截图保留，本岗只读，不改独立证据。

筛选区域在小屏仍为两列，label和原生select没有明确min-width:0和确定的width:100%，较长选项引起固有/最小内容宽度撑大网格项。修复实际尺寸约束，不以全页overflow:hidden或截掉题目内容掩盖错误。

## 冻结修稿与局部补丁

从主QA candidate02 CSS `d190bdc09f0fb9b3ae4eb308cd52b358c935f69d3b9b93ae16ea4418789654bd` 原字节只追加局部规则，独占修稿：

`team/app-v13-prototype-frontend-history/mobile01-repaired-client/learning-experience-v13.css`

修稿 SHA256：`87d7c3207eb615022b8298e2fa955f72227672c71d7d8fab47c70cad40dd15fd`。

追加 `v13-question-filters` 容器/label min-width:0；原生select width/max-width:100%、border-box和min-width:0；≤480px单列，480以上原双/四列规则保持；筛选按钮/清除链接保持至少44px。原正文字号、全文、长题面、目录、图/代码、宽屏框架都没有改写；原生选项文本及其无障碍名称完整保留。宽屏和390真实效果不能由这些声明推导。

局部补丁为 `app-v13-prototype-frontend-mobile01-patch.css`，SHA256 `5d188d186d4d5b1829ca0f344459548d10bca9b41507180fd3f1d1b255f825af`。将来只能由获PM稳定唯一写入交接的当前owner追加到实际最新CSS；不能用完整87d旧CSS覆盖另一轮v14/阅读详情新增样式。

## 自查及当前源边界

新source-check.py/.json只核追加字节、CSS声明/括号范围和约束：原d190全部字节保持、选择器只在筛选区域、窄屏单列、44px、无新增隐藏/溢出遮掩或字/正文变化。当前Python没有完整CSS解析器，本岗没有为此安装依赖；没有运行渲染引擎，不能称CSS全语法或实际视口通过。真实390下拉/筛选、docWidth、n03表代码及宽屏直接影响由UI2复验。没有重跑旧题/教材/检索案例。

本轮只读current CSS时，已经从47a端点继续变为 `fa64c8c55b7bf0bfe0d463641e7af27b9caf3ca418ba274af9b81114f3f6deee`，保留d190前缀并有后续v14/详情追加规则。这是跨轮变化记录，不作写入授权或停写推断。本岗没有写current dist。

新增mobile01-apply.mjs默认只读check；实际owner需明确 `--write --expected-sha256 <实际当前CSS SHA>` 才追加，已存在补丁或hash变化会拒绝。只读check在fa64上的拟新hash为 `50e00fd5569ddde5133bf7913d68db7b99feac9674c83648e9e9914f7bc75410`；**没有应用**，不能把它作为正在运行版本。本脚本不接触其他文件、数据库或服务。

UI2可在其4486现有隔离环境，仅替换87dCSS，维持e731JS及原其余依赖；真实原例/直接影响独立通过只授该冻结夹具。LIVE仍需用户交接授权/PM唯一owner稳定后局部合入和当前版本独立受影响复验。REVIEW01的冻结UI闭合不使当前live自动已修，本次也不以写报告关闭MOBILE01。完整职业培养与行业先进目标继续未达标。
