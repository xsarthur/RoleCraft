# AI 生成工程师进阶方案 source_records 修复记录 v0.1

- 修复 ID：`AI-ADV-20261015-SR-001`
- 缺陷：`QA-AI-ADV-P2-001`（P2）
- 责任岗位：课程架构师
- 协调岗位：项目经理
- 日期：2026-10-15（Asia/Shanghai）
- 状态：`awaiting_independent_retest`

## 修复内容

`ai-generation-engineer-advancement-v02.json` 的 `source_records` 最后一项是裸字符串，无法与其他记录统一按 `path/status` 读取。本修复生成不可变的 v0.3 方案，保留 v0.1、v0.2、两轮 QA、首失败和训练状态；只将最后一项规范化为：

```json
{"path":"sites/rolecraft/team/ai-generation-engineer-advancement-qa-v01.json","status":"reviewed_with_limitations"}
```

本修复没有执行学习者训练、修改实训包、改变任何晋级决定、修改应用或访问外部服务。

## 文件与哈希

| 版本 | Markdown SHA-256 | JSON SHA-256 |
| --- | --- | --- |
| v0.2（保留） | `d61e2d71eede535e8df4ea25a526650390ce401e453fe63219fe1a8e5fd9e30e` | `0bdf99d6e679ec8755d0e79f29cf26e8df98b377d113a22f8c347d8bd9305f61` |
| v0.3（修复） | `29fd15a70ba1d590f7e5b4ca347117ba4c61f0077f5d83dabf666f6676364986` | `7135891eb9bf38da3c23022b334e5179ed6b81587116dbaef7ccf1ea4fd82850` |

## 保留范围

- v0.1/v0.2 方案文件不覆盖、不删除。
- `ai-generation-engineer-advancement-qa-v02.md/.json` 保留为首失败与原始 QA 证据。
- 训练状态保持 `L0_guided`、D0 `not_assessed`、L1 `not_granted`，生产权限仍 `not_granted`。
- `practice_crosswalk`、三项本地夹具和既有 P1 修复结论不变。

## 独立复验条件

QA 需在 v0.3 上独立检查：JSON 可解析；`source_records` 每项均为带非空 `path`、`status` 的对象；v0.2 哈希、首失败和 QA 记录未变；crosswalk 与状态未漂移。复验仅验证数据形状和版本保留，不得将其写成训练执行或能力晋级。
