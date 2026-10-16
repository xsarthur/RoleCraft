# v15 登录与多职业切换实现

更新时间：2026-10-15

## 已落地

- 本地邮箱 + 密码注册、登录、退出、当前会话查询，沿用现有 HttpOnly 会话和 CSRF 校验。
- 职业目录由服务启动时从 `server/careers/*.json` 读取，或通过 `ROLECRAFT_CAREERS_DIR` 指定目录；客户端没有新增、编辑、删除职业的入口。
- `/api/careers?q=` 支持职业名、关键词、自然语言目标检索。默认使用锁定的本地 BGE 中文向量模型，并返回 `matchSource=local_bge`；模型不可用时明确返回关键词降级状态，不伪装成语义结果。
- 当前账户保存 `active_career_id`；切换职业只接受已发布职业，首次登录自动关联默认职业。
- 已提供按 `user_id + career_id + textbook_version_id + unit_id + section_id` 约束的收藏、学习进度、最近阅读和笔记接口。最近阅读写入幂等，笔记更新校验所属用户和内容目标。
- 职业教材目录和章节入口支持 `/api/careers/:careerId/content`、`/catalog`、`/chapter/:unitId`，导入教材会校验单元原文哈希、教材 corpus hash 和路径范围。
- 工作台增加登录 / 注册入口、当前职业入口、职业自然语言检索与切换弹窗；已登录后本地收藏、进度、最近阅读和笔记会同步到账户，服务离线时保留浏览器记录。
- 暂不展示配套题目、复习和自评入口；后续开放时可重新接回题库页面。

## 当前边界

- Agent 开发者继续使用已校验的 v12 内置教材；导入职业只要提供独立、哈希校验通过的教材 corpus，阅读器就会按 active career 动态加载目录与章节，收藏、进度、最近阅读和笔记也按职业隔离。没有独立 corpus 的职业会显示教材不可用，不会回退到 Agent 内容。
- 当前阅读运行时只接受 `textbook-v12`；历史 v10 仍作为旧记录只读来源，尚未接入多职业动态阅读。
- 生成服务仍按原有配置要求运行；登录和职业切换不代表生成服务已配置。
- 账号密码只支持本地邮箱密码，未接短信、微信、OAuth 或找回密码流程。

## 验证

- `node --check`：`server/index.mjs`、`server/careers.mjs`、`dist/auth-career-v15.js`、`dist/learning-workbench.js`、`dist/learning-experience-v13.js` 全部通过。
- 隔离临时服务验证：注册 / 会话 / BGE 职业检索 / 职业切换 / 收藏 / 进度 / 最近阅读幂等 / 笔记 / 职业教材目录均通过；测试数据位于 `/private/tmp/rolecraft-v15-http`，未读取正式 `.runtime`。
- 动态职业回归：独立 Python corpus 的目录、章节正文和收藏记录均按 `python-engineer` 隔离；没有独立 corpus 的职业返回 `career_content_unavailable`，前端显示教材不可用，不回退到 Agent 内容。
- 浏览器验收：登录弹窗、账户状态、职业切换弹窗、自然语言推荐结果、动态职业目录/章节和题目导航隐藏均已通过本地页面检查。
