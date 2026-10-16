# local-mvp-0.4 客户端交付

2026-10-10；网站客户端工程师。仅修改dist、README和本文；不改服务、专业JSON或QA原脚本。依据本轮冻结产品/课程/设计与server/CONTRACT.md。交工程初稿时0.4未独立审计；现已完成独立审计及最终包装专项6/6，当前完整产品仍未达标；原0.2/0.3审核是历史，不能继承。

## 实际实现

新增# generation（URL写为`#generation`）“单章生成”，保留原十入口与rolecraft-v1。独立generation.js负责Cookie同源API+CSRF，研发账户注册/登录/me/退出，新的beginner/intermediate/advanced显式学习起点、服务器画像版本。原档案不迁移或传送。退出/401清所有新账户私有快照、任务、教材、作品、复盘和未提交表单，异步旧响应经epoch隔离；客户端没有密码/会话/密钥localStorage写入。

页面读取health/curriculum，配置缺项映射为模型服务、模型选择、调用额度等学习者提示。file模式不发生成API，普通静态服务器协议不匹配明确报错。真生成配置与画像未就绪按钮禁用；服务拒绝仍保留错误，不产生模拟成功。真实任务列表、事件/冻结输入/尝试、取消、关联重试、固定章节及哈希消费服务契约。轮询只更新状态区，不重建编辑表单；导航关闭轮询，回来从服务恢复。失败或取消明确保留外部供应商结果可能未知，不声称远端恰好一次。

模型result整包解析chapterDraft九节，并显示来源位置、课程/教材版本、hash、claims/examples/provenance/checks；checks/provenance模拟标识有明确测试模拟标签。新稿独立内容审核/示例运行/真人审核/效果保持未验证，不能继承输入稿审校。正文用转义纯文本Markdown，不执行HTML；来源URL仅允许官方受控OWASP HTTPS域，无凭据或非标准端口。作者九节由原专业JSON原样包装单独阅读，不是模型产物；初稿修订审校与CR05运行缺证分开。

作品表单保存章节引用、作品标题/版本/链接、运行证据引用、实际结果；提交为不可覆盖的新记录，服务不抓取链接。之后关联当次self_assessment，记录目标、证据、结果、差距、原因、责任人、下一步、复验；独立/专业状态固定未审核。数据导出只调用当前账户/api/export。未提交输入仅页面内存，离页/关闭提醒，网络失败保留输入。README记录启动、停止、存储位置、服务端环境配置、预算并非硬封顶和未完成范围。

## 开发自检（不是独立验收）

- node --check app.js / generation.js / generation-curriculum-data.js：通过。
- 原qa-check.mjs 22/22、curriculum-check.mjs 20/20：工程运行通过，分别是旧逻辑和原专业数据结构。
- 原qa-v02-check.mjs 25/26；V09仍预期prototype-0.2，实际当前local-mvp-0.4。原qa-v03-check.mjs 23/30；P01/P02/P12/P13/P16/P26/P28均旧0.3版本/十入口或匹配0.3审计夹具的固定预期冲突。原脚本保持不改；旧机制其余断言通过，需QA新版本独立接收/核对，不把版本冲突抹成通过。
- 隔离Node VM内联开发自检15/15：正文HTML转义，官方URL拒绝恶意协议/凭据/外域，九节作者稿与来源分离，11入口，同源CSRF，任意端点拒绝，file拒绝，配置可读映射，配置/画像缺失禁用，轮询保留未提交draft，模拟标注和正文转义，私有缓存全清，旧异步结果epoch拒绝，401清私有数据，无客户端localStorage密钥写入/直连供应商。测试仅模拟fetch与DOM节点，不冒充浏览器、真实服务或模型调用。

## 冻结输入摘要

- index.html `70f5c5c0c5e9e645415b1032b5f6d33dc96d74153a010a590c00b454b829321b`
- app.js `3419df6bd1c5597a0509016f0910fb74b265a01114a682e623f70b487cae95fe`
- generation.js `271c64e6ff9a2789ba8bda9711402376e86fba63593682f1c6939343b6fdcfda`
- styles.css `9b99139a1362025c6d9ed7dc9463fb65cb306d90af4cedf6c9048487ae8de353`
- generation-curriculum-data.js `446d57780f43e34810299e45c9d5449603d25c0ce97c5fd537d11870d3ed312f`

以上dist已冻结交QA。未控制用户浏览器，未绕过本地file浏览器政策，未触发真实收费请求，未发送源码或发布。

## 待独立验证与复盘

QA需验证新客户端完整加载、真实HTTP接口字段/认证/持久恢复/跨账户401退出及延迟请求隔离、任务/草稿/作品/复盘，内容与模拟标记、页面安全、旧记录保护及版本匹配审计。真实浏览器布局/键盘/读屏未测，必须保留未知。正文转义阅读尚无Markdown富排版；真实模型、内容执行、专家、学员、对比、经济和生产证据不能从静态逻辑推导。

本轮完成可接服务的客户端闭环，整体标准仍未达标。原因是端到端独立验证与真实运行/教学/市场证据尚未交接；客户端问题由网站工程师修复，服务问题交数据/生成岗位，当前版本结论由QA核对。下一步按QA实际缺陷修复并复验，不自评整个平台通过。

## QA反馈修订 · 启动路径及课程数据

独立QA发现真实P2：file模式提示进入sites/rolecraft后执行node scripts/start-local.mjs，无法找到根目录脚本。已仅修提示为项目目录执行`node ../../scripts/start-local.mjs`；README明确先进入工作区根目录执行`node scripts/start-local.mjs`，并列出项目目录等价命令。先前工程口头报告“脚本尚未创建”是查错路径，已纠正：脚本实际存在于工作区根scripts/，后端冻结与其自检不因本工程误查被否认。

课程岗修正excerptWords计数13/10并补充空白token规则后，工程仅原样重新包装generation-curriculum-data.js，未改正文、schema、审核或版本。源JSON新hash `4333cf72964a0fd3e315333fcf65e19b2b234a60e0d87a7dfdf327f68a40d415`。隔离VM比较包装对象与JSON全部深相等，项目目录与工作区根两个脚本路径实际存在，前端启动提示匹配正确路径、旧错误字符串不存在；两JS node --check通过。没有在此修订启动服务或请求模型；独立QA需复验原失败断言。

本次修订后冻结hash（取代上文对应文件旧输入，其他app/CSS/index未动）：

- generation.js `4729f5caad5b17638b73f2cb7744a7aff1015e6a8e97f05b0efd3c5146c09b40`
- generation-curriculum-data.js `3864bf34d4f15e89a1e8c44b692272d3febb387a704371703886a7621ce1cdbc`

未打包尚未生成的0.4审计；当前仍不继承历史结论。

## 独立QA后显示文案修订（未打包审计）

按QA/PM交接，仅将app.js中一个标题“本轮静态原型：功能验收”改为“本轮本地功能：功能验收”；scope兼容、审核逻辑、标准、网站版本及其他应用文件不变。node --check app.js通过，app最终hash `d147f189a81d7f6ebcdb8e6cb7f047e13c50b1146f9e0bde3a7995dacf27693c`。generation/index/CSS hash与上一冻结相同。

README依据独立报告记本轮真实本地HTTP15/15、模型协议模拟13/13、客户端12/12及启动P2复验；这些是不同范围，不能宣称原全部回归通过。后端员工在PM协调下已启动本地4318服务，浏览器未验收；实际供应商调用未执行，完整产品未达标。请QA将输入app hash及文案focused证据更新后冻结JSON，再由工程原样包装baseline/v03/v04审计；本次尚未修改product-audit-data.js。

## 最终独立审计数据包装

QA显示专项2/2通过并将final app hash冻结进product-audit-v04.json后，工程仅将baseline0.2、v0.3、v0.4三报告依序原样包装为productAuditData.reports。隔离VM对三份完整对象与原JSON逐项deep equal通过，版本分别prototype-0.2/prototype-0.3/local-mvp-0.4，未改独立结论/证据/输入hash。数据JS语法检查通过，新product-audit-data.js hash `4f809adb3e80a41189debb9d98e53f7beee5b298b49c3613929a1443696aeeed`。

app仍 `d147f189a81d7f6ebcdb8e6cb7f047e13c50b1146f9e0bde3a7995dacf27693c`；generation/index/CSS/课程JS均保持上一冻结hash。此次未改服务、专业数据或QA报告，未操作默认服务数据库/用户记录，无浏览器及收费调用。实际HTTP静态文件由运行服务读取；当前0.4完整报告结论未达标。包装一致性与当前匹配展示已由QA最终专项6/6复验通过，工程自检不替代独立确认。

## 交付文档最终校正

独立QA最终包装专项6/6通过，README现已注明完成本轮打包核对。服务实际由后端员工在项目经理协调下启动，URL为`http://127.0.0.1:4318/#generation`，浏览器实测未完成。完整产品仍未达标，真实供应商调用待实际配置与预算；历史0.3说明保留。此次仅更新README和本文，不改任何dist/server/审计JSON/QA文件，不重跑测试。
