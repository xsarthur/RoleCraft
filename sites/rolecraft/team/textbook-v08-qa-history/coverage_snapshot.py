"""Save QA's manually selected semantic locations; no textbook or app mutation.

Selections and judgments below come from full reads, not keyword counting.
The script resolves selected headings to positions and hashes the read files.
This is a pre-final snapshot, requiring later alignment/recheck after CR08-10.
"""
import hashlib
import json
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[2]
book = root / "textbooks"
old = json.loads((root / "team/textbook-v05-spec.json").read_text())
final_mode = "--final" in sys.argv

# Each item is (manually chosen section indexes, concrete semantic rationale).
# Section indexes are 0-based top-level ## headings after a complete read.
chosen = {
    "f01": [
        ([0, 1, 5], "可信身份与raw分离；列表/空值/未知字段在请求前拒绝且零调用，诊断区解释JSON解析与业务类型的区别。"),
        ([0, 1, 3, 4], "适配器区分HTTP拒绝、无结果、响应非法与业务身份/内容错误；迁移写接口时明确撤回只读重试策略。"),
        ([2, 4], "解释Git源快照不等于环境，交接解释器/夹具/命令/输出；纯标准库不虚造锁文件，扩展第三方时要求版本锁定。"),
        ([1, 2, 4, 5], "五项基础测试与边界任务核实际值/调用数；要求保存失败、恢复断言及修改记录，反对成功截图作为证据。"),
    ],
    "f02": [
        ([2, 3, 4], "提供真实REST请求包装及完成状态消费，拒绝incomplete/refusal/非对象；真实请求作业要求获准环境和原响应记录，目前未执行。"),
        ([1, 2, 3, 4], "结构、事实身份/值、证据引用分别过闸，合法JSON不使候选成为真事实；根因仍保留未验证。"),
        ([0, 1], "运行时可信状态不从聊天恢复；资料/工具文字不能提权，模型候选与系统决定分开。"),
        ([0, 3, 4], "上下文投影保留源修订/关键比较符；摘要损失任务要求比较请求；缺规则明确WAIT_INPUT而非猜测。"),
    ],
    "c01": [
        ([0, 1, 2, 6], "同TaskContract比较普通程序、单调用及固定流程，固定依赖可程序决定；相同资源/权限/判据防止换题。"),
        ([0, 2, 3, 6], "固定多次调用并非自主控制；新增观察改变待选行动时才需要动态决策，并比较增加的状态和失败成本。"),
        ([], "冻结v07的主循环先核已有事实再计划，验收拒绝轨迹反馈新证据；工具拒绝不由模型自称成功覆盖。"),
        ([4, 5, 6], "v07保存预算/停止意图/等待原因；补篇仅在可独立分工时评估多Agent，协调和写槽位成本纳入同条件比较。"),
    ],
    "c02": [
        ([0, 3], "摄取版本/快照成员/租户/生效时点/读回ACL分开，入库不证明本次回答已看到；旧修订不能替当前资料。"),
        ([2, 3, 4], "引用存在只作关联检查，规范事实包含subject和条件身份；支持部分主张不能支持全部结论。"),
        ([1, 3, 5], "词法适用精确ID、语义适用改写，RRF有候选前提；要求分召回/排序/读回比较并保留失败分母。"),
        ([2, 3, 4], "冲突先在同事实身份内比较且不受最终top_k遮蔽；未摄取/无命中/越权/旧版本分别留状态，不选有利条款。"),
    ],
    "c03": [
        ([0, 1, 4, 5], "提议/协议调用/动作/物理尝试/业务效果分开，回执核操作身份且协议结果按当前call_id关联。"),
        ([0, 1, 2, 3], "Schema合法之后仍核可信主体与对象权限，批准绑定工具/参数/证据指纹；返修采用唯一issue-json-utf8-v1精确字节、UTF8及证据集合规范，不覆盖旧批准。"),
        ([1, 3, 4, 5], "唯一槽位复用逻辑动作，同参数新call不得换key；下游同key去重窗口与本地事务各负其责。"),
        ([3, 4, 5], "丢回复为UNKNOWN，对THIS_ATTEMPT_ONLY无效果不能推翻既有未知；按原操作查询，错误操作同内容回执不可信。"),
    ],
    "e01": [
        ([0, 1, 2], "事件重放结果与动作事实独立持久；预算/批准/候选身份来自事务记录而非对话。"),
        ([1, 2, 3, 4], "停止意图不删除晚到效果；完成事务需当前verdict绑定及无未决，租约epoch阻止旧工作者推进。"),
        ([0, 2, 3, 5], "发送前持久未决尝试，外部提交/本地结果危险窗口先核原key；双独立SQLite替身练习保留跨库非原子边界。"),
        ([4, 5], "未知metadata.version拒绝启动，迁移须保留原参数/批准/状态/版本；不能默认新字段扩批准，回退须可读新状态。"),
    ],
    "e02": [
        ([2, 8], "开发/回归/独立保留集由信息使用定义；提前见题转回归并换新集，公开题不作迁移证据。"),
        ([3, 8], "冻结版本/任务分配/资源及判据，配对重复报告全部尝试而非最好一次，相关性不能按独立样本处理。"),
        ([0, 1, 4, 5], "结果、过程、资源分别判定；已知越权或错效果FAIL优先且保留缺证，HARNESS_ERROR不当模型失败或通过。"),
        ([5, 6, 7, 8], "模型评分需与独立专业标签校准，不冒专家；按trace形成竞争原因，替换证据/干预定位，再复验原例和回归。"),
    ],
    "e03": [
        ([0, 1, 7], "文档/工具结果/持久记忆三个可控入口分别建威胁；恶意资料不取得动作许可，练习要求同注入跨入口对照。"),
        ([1, 4, 6], "不可信标签只提示模型；模型外对象授权/资料投影更早执行，先泄跨租户数据不能靠最终拒答补救。"),
        ([2, 4, 7], "上下文/输出/工具载荷/日志四通道允许字段；递归原叶值匹配特殊标记，说明不能发现未知/编码秘密。"),
        ([3, 4, 5, 7], "精确批准含参数、证据、权限、期限与动作消费；同槽并发最多一建；远端转移需持久意图及下游合同。"),
    ],
    "e04": [
        ([0, 1, 2], "环境配置启动前校验，秘密独立提供；版本清单包括模型/提示/工具/资料/schema/依赖，不把本地演示称生产。"),
        ([0, 2, 3, 4], "暂停/排空与新旧worker路由保护在途任务；schema不可读时回退HOLD，镜像旧不代表状态可回退。"),
        ([5, 6], "trace记录阶段及版本、请求/动作/操作关联；查检索/模型/工具最早偏离点而非最后错误文本。"),
        ([6, 7], "runbook要求安全权限、诊断依据、可执行恢复、复验和敏感日志处理；交非作者复现发布排空并留原记录，未实跑。"),
    ],
    "e05": [
        ([0, 2, 7], "逻辑任务归集全部尝试、失败/重试及人工等成本；credit是假设单位，未知费用不能记零，未取真实账单。"),
        ([1, 2, 3], "分别报候选/批准/最终验收等待，超时取消/在途注明分母；有限样本p95不是总体尾延迟保证。"),
        ([4, 5, 7], "缓存键含租户/资料/权限版本，只复用证据候选不复用批准；模型路由须同任务质量护栏、事实和成本比较。"),
        ([3, 6, 7], "开放/闭环负载可测不同队列效应；并发/限流/预算统一有界，速度不以丢失败或无界重试取得。"),
    ],
    "p01": [
        ([0, 1, 8, 9], "真实原任务/同意范围与作者解释/构造例分开；近期过程暴露反证，负反馈可缩范围或停止而非编用户肯定。"),
        ([2, 3, 4, 9], "现实替代与简单技术基线代表用户可选方案；差异假设可被推翻，版本/任务/资源/护栏预定义后才比较。"),
        ([5, 6, 9], "MVP按要验证的机制冻结TaskContract/AcceptancePlan；ADR解释普通程序/Agent取舍、替代和重新决策条件。"),
        ([7, 8, 9], "同决定分别交业务/技术受众，原反馈连回假设与实验；非作者复现/真实使用/维护文档仍需实际证据。"),
    ],
    "p02": [
        ([0, 1, 2, 3, 7], "证据索引只核字节/版本，独立评阅走实际任务和原专业意见；启动/INDEX_OK均不推出毕业或真实性。"),
        ([2, 4, 7], "真实使用失败/退出与抽样限制保留，有限满意自述与行业可比实测分开；当前证据不足不改原门槛。"),
        ([5, 7], "完整构造复盘有旧例/竞争原因/修订/原例复验/回归/开放真实合同；修代码不消除旧外部重复效果。"),
        ([6, 7], "非作者未见资料与约束、允许帮助及污染规则检验判断/实现/调试；正确停止可合格但不外推所有行业。"),
    ],
}

files = {}
for module in chosen:
    file = book / "v08" / ("c01-solution-selection.md" if module == "c01" else f"{module}.md")
    text = file.read_text()
    headings = [(i, line[3:]) for i, line in enumerate(text.splitlines(), 1) if line.startswith("## ")]
    files[module] = {"path": str(file), "sha256": hashlib.sha256(file.read_bytes()).hexdigest(), "headings": headings}
v07 = book / "agent-control-loop-v07.md"
v07sha = hashlib.sha256(v07.read_bytes()).hexdigest()
v07refs = {
    2: [367, 731],
    3: [262, 786],
}
records = []
objectives = []
for module in old["modules"]:
    mid = module["id"]
    info = files[mid]
    for index, kp in enumerate(module["knowledgePoints"]):
        sections, rationale = chosen[mid][index]
        refs = [{"path": info["path"], "readSha256": info["sha256"], "line": info["headings"][n][0], "heading": info["headings"][n][1]} for n in sections]
        if mid == "c01" and index in v07refs:
            refs += [{"path": str(v07), "readSha256": v07sha, "line": n, "heading": v07.read_text().splitlines()[n-1]} for n in v07refs[index]]
        records.append({"id": kp["id"], "originalTitle": kp["title"], "objectiveIds": kp["objectiveIds"], "judgment": rationale, "locations": refs, "status": "observed_in_final_text" if final_mode else "observed_in_text_pending_final_alignment", "qualityBlocker": None if final_mode else ("CR08-10" if mid in ("c03", "e01") else None)})
    for n, objective in enumerate(module["objectives"], 1):
        oid = f"{mid}-o{n}"
        selected = [r for r in records if oid in r["objectiveIds"] and r["id"].startswith(mid + "-")]
        objectives.append({"id": oid, "originalObjective": objective, "knowledgePointIds": [r["id"] for r in selected], "textCoverage": "mechanism_and_practice_present_with_review_limitations" if final_mode else "mechanism_and_practice_present_pending_final_review", "learnerAchievement": "not_verified", "executionLimit": "本次只测协议消费/校验夹具，原真实模型调用目标未完成" if oid == "f02-o1" else "见分篇离线执行范围；练习、真实使用、独立作品及真人专业评阅未替读者完成"})
assert len(records) == 48 and len(objectives) == 24
assert len(set(r["id"] for r in records)) == 48
out = {"status": "mapped_with_limitations" if final_mode else "in_progress", "method": "QA全文阅读后人工选择语义位置及解释，脚本仅解析所选标题定位和源hash；不是关键词计数或manifest自证。", "originalMetadataEvidence": "original-identity-comparison.json", "moduleCount": 12, "objectiveCount": 24, "knowledgePointCount": 48, "currentReadUnits": 13, "notLearnerAchievement": True, "notFinalFreeze": not final_mode, "openCrossChapterDefect": None if final_mode else "CR08-10 canonical fingerprint and DISPATCH-to-Dispatch mapping; c03/e01 locations require affected reread after repair", "knowledgePoints": records, "objectives": objectives}
(Path(__file__).parent / ("actual-coverage.json" if final_mode else "actual-coverage-pre-final.json")).write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n")
print(json.dumps({"modules": 12, "objectives": len(objectives), "knowledgePoints": len(records), "status": out["status"]}, ensure_ascii=False))
