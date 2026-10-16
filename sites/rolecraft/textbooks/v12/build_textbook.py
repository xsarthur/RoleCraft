"""Assemble v12 reading files from the frozen curriculum; never edits n01-n10."""
from pathlib import Path
import hashlib
import html
import json
import re
import shutil

ROOT = Path(__file__).resolve().parent
ROLE = ROOT.parent.parent
SOURCE = ROOT.parent / "v10"
CURRICULUM = ROLE / "team/textbook-v12-curriculum.json"
data = json.loads(CURRICULUM.read_text())
order = data["readingOrder"]
units = {u["id"]: u for u in data["units"]}
purposes = {
"00-learning-route": "Agent定义、适用需求与工程全貌",
"01-foundation": "程序、异常、断言与基础诊断",
"n01-python-model-foundations": "对象、并发、LRU与模型推理/输出契约",
"p01-discovery": "真实问题、现有方案与可证伪假设",
"02-task-acceptance": "任务成功、停止和证据条件",
"03-trust-boundary": "事实与授权来源分离",
"f01": "外部请求与受控错误边界", "f02": "模型候选结构与业务核验",
"n02-context-memory-prompt": "提示、记忆生命周期与任务切换",
"c01-selection": "普通程序、单调用、流程与Agent选型",
"c01-control-primer": "提议、动作、发送与效果身份",
"c02": "权限和版本正确的证据包", "c03": "授权、去重与效果核对",
"n04-tools-mcp": "工具目录、MCP与第三方接入",
"e01": "持久账本、恢复和并发事实",
"c01-fixed-workflow": "连接组件的固定路径",
"c01-control-loop": "依据观察推进的受控完整循环",
"n03-planning-reflection": "ReAct、计划、重规划与反思",
"n05-retrieval-ingestion": "摄取、向量/索引、重排与Agentic RAG",
"n06-graph-orchestration": "LangGraph状态、子图与流消费",
"n07-multiagent-a2a": "协作模式、交接和A2A",
"e02": "版本结果、轨迹与回归评测",
"n10-evaluation-projects": "客服/研究迁移、跨语排错、技术移交",
"p01-mvp": "依据问题和评价冻结MVP",
"e03": "数据与动作的强制权限", "n08-sandbox-security": "生成代码的隔离与准入",
"e04": "发布、迁移和回退", "e05": "质量约束下的性能与成本",
"n09-runtime-delivery": "长任务、补偿、熔断、内存与推理服务",
"p02": "真实作品、独立复验和迭代"
}
short_names = {
"00-learning-route":"认识Agent工程", "01-foundation":"基础预备",
"n01-python-model-foundations":"Python与模型基础", "p01-discovery":"问题发现",
"02-task-acceptance":"任务验收", "03-trust-boundary":"信任边界", "f01":"外部API",
"f02":"模型候选", "n02-context-memory-prompt":"上下文、记忆与提示", "c01-selection":"方案选择",
"c01-control-primer":"动作身份", "c02":"检索证据", "c03":"写工具", "n04-tools-mcp":"工具目录与MCP",
"e01":"持久恢复", "c01-fixed-workflow":"固定流程", "c01-control-loop":"动态循环",
"n03-planning-reflection":"规划与反思", "n05-retrieval-ingestion":"进阶检索与摄取",
"n06-graph-orchestration":"图编排", "n07-multiagent-a2a":"多Agent与A2A", "e02":"版本评价",
"n10-evaluation-projects":"跨场景评价与移交", "p01-mvp":"MVP决定", "e03":"强制安全",
"n08-sandbox-security":"代码沙箱", "e04":"发布回退", "e05":"性能成本",
"n09-runtime-delivery":"运行交付", "p02":"独立作品与复盘"
}


def title(unit):
    path = ROOT / (unit + ".md")
    if path.exists():
        return next(x[2:] for x in path.read_text().splitlines() if x.startswith("# "))
    source = SOURCE / (unit + ".md")
    if source.exists():
        return next(x[2:] for x in source.read_text().splitlines() if x.startswith("# "))
    return short_names[unit]


def link(unit):
    return f"[{short_names[unit]}]({unit}.md)"


def migrate_old():
    for unit in order:
        if unit == "00-learning-route" or unit.startswith("n"):
            continue
        source = SOURCE / (unit + ".md")
        original = source.read_text()
        index = order.index(unit)
        prereqs = units[unit]["prerequisites"]
        prior = ", ".join(link(x) for x in prereqs) or "无"
        next_link = link(order[index + 1]) if index + 1 < len(order) else "[全书目录](README.md)"
        note = ("\n\n---\n\n## v12 学习衔接\n\n"
                f"本单元为30单元路线的第{index+1}单元。正式先修：{prior}。"
                f"按v12完整路线，下一单元为{next_link}；上文保留的旧版关联仍可作主题参考。"
                "本篇原专业正文与代码完整迁移，历史验证仍只适用于原记录范围，不因复制获得新的执行结论。\n")
        (ROOT / source.name).write_text(original + note)
    assets = ROOT / "assets"
    assets.mkdir(exist_ok=True)
    for suffix in ("png", "svg", "dot"):
        shutil.copyfile(SOURCE / f"assets/agent-runtime-loop.{suffix}", assets / f"agent-runtime-loop.{suffix}")


def landscape():
    # Full unit coverage is visible as short labels. Arrows express engineering relationships.
    groups = [
        (30, 150, 330, 330, "问题与方案", [4, 5, 6, 10, 24]),
        (395, 150, 330, 330, "模型、资料与工具 · 按需选用", [7, 8, 9, 11, 12, 13, 14, 19]),
        (760, 150, 330, 330, "状态与执行组织 · 按需选用", [15, 16, 17, 18, 20, 21]),
        (30, 570, 510, 210, "评价与强制边界 · 贯穿实现", [22, 23, 25, 26]),
        (580, 570, 510, 210, "交付、成本与真实反馈", [27, 28, 29, 30]),
    ]
    parts = ['<svg xmlns="http://www.w3.org/2000/svg" width="1120" height="950" viewBox="0 0 1120 950" role="img" aria-labelledby="title desc">',
             '<title id="title">Agent工程全景：30单元的工程位置</title>',
             '<desc id="desc">学习支撑连接问题设计，组件和执行按需组合，评价与权限贯穿，真实交付反馈到问题与方案。图不是运行时必备链或先修图。</desc>',
             '<defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto-start-reverse"><path d="M0 0 L8 4 L0 8 Z" fill="#4B637B"/></marker></defs>',
             '<rect width="1120" height="950" fill="#FFFFFF"/>',
             '<g font-family="PingFang SC, Microsoft YaHei, sans-serif" fill="#142B43">',
             '<text x="30" y="38" font-size="26" font-weight="700">Agent工程全景与学习位置</text>',
             '<rect x="30" y="62" width="1060" height="58" rx="12" fill="#EEF4F8" stroke="#B9CAD8"/>',
             '<text x="50" y="98" font-size="21">学习支撑：01 认识Agent工程　02 基础预备　03 Python与模型基础</text>']
    for x, y, w, h, name, nums in groups:
        parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="14" fill="#F4F8FC" stroke="#7F9BB3" stroke-width="1.5"/>')
        parts.append(f'<text x="{x+18}" y="{y+36}" font-size="20" font-weight="700">{html.escape(name)}</text>')
        for i, num in enumerate(nums):
            label = f"{num:02} {short_names[order[num-1]]}"
            parts.append(f'<text x="{x+18}" y="{y+75+i*29}" font-size="20">{html.escape(label)}</text>')
    parts += [
        '<g fill="none" stroke="#4B637B" stroke-width="2" marker-end="url(#arrow)">',
        '<path d="M195 120 L195 148"/>',
        '<path d="M362 305 L393 305"/>',
        '<path d="M727 305 L758 305"/>',
        '<path d="M925 482 L925 568"/>',
        '<path d="M540 485 L540 522 L286 522 L286 568" stroke-dasharray="7 5"/>',
        '<path d="M130 568 L130 482" stroke-dasharray="7 5"/>',
        '<path d="M835 782 L835 845 L12 845 L12 300 L28 300" stroke-dasharray="7 5"/>',
        '</g>',
        '<text x="942" y="534" font-size="18">交付</text>',
        '<text x="302" y="552" font-size="18">核结果与边界</text>',
        '<text x="43" y="530" font-size="18">修订</text>',
        '<text x="292" y="837" font-size="19">真实使用与复盘反馈到问题、假设和方案</text>',
        '<text x="30" y="895" font-size="19">实线：工程依赖　虚线：评价/反馈　数字：阅读位置（完整先修见目录）</text>',
        '<text x="30" y="925" font-size="19">组件按任务选用；不要求每个产品采用长期记忆、多Agent、MCP或图框架。</text>',
        '</g></svg>']
    (ROOT / "assets/agent-engineering-landscape-v12.svg").write_text("\n".join(parts))


def chapter_table():
    rows = ["| 阅读位置 | 正文 | 工程环节 |", "| --- | --- | --- |"]
    rows += [f"| {i} | [{title(unit)}]({unit}.md) | {purposes[unit]} |" for i, unit in enumerate(order, 1)]
    return "\n".join(rows)


def opening_and_directory():
    original = (SOURCE / "00-learning-route.md").read_text()
    opening = original.split("## 一套可交付系统还需要哪些工程工作")[0]
    opening = opening.replace("第8篇 ", "").replace("第13篇 ", "").replace("第14篇 ", "")
    tail = original.split("## 从哪个起点进入实作", 1)[1]
    tail = tail.replace("可跳过补学正文，保留诊断记录后进入第3篇", "可跳过本基础预备正文，保留诊断记录后，仍按[Python与模型基础](n01-python-model-foundations.md)对应能力自检并补缺，再进入问题发现")
    tail = tail.replace("已有基础并留诊断证据者转到 [问题发现](p01-discovery.md)", "已有基础并留诊断证据者先按[Python与模型基础](n01-python-model-foundations.md)自检并补缺，再进入[问题发现](p01-discovery.md)")
    tail = tail.replace("../../team/textbook-v09-curriculum.md", "../../team/textbook-v12-curriculum.md")
    panorama = ("## 一套可交付系统还需要哪些工程工作\n\n"
      "运行闭环回答一次任务如何推进，工程全景回答怎样设计、实现、评价和交付这种能力。"
      "本版以30个阅读单元补齐软件/模型先修、记忆、规划、协议、检索、图编排和协作，并连接安全、运营与独立项目。"
      "图中的组件按任务选择，箭头不表示每个产品都必须使用全部组件，也不是先修顺序。\n\n"
      "![Agent工程全景：30单元的位置，问题与方案连接模型资料工具及执行组织，评价边界贯穿，交付反馈问题](assets/agent-engineering-landscape-v12.png)\n\n"
      "[查看全景SVG](assets/agent-engineering-landscape-v12.svg)。运行闭环仍使用上图，工程全景已独立扩展为本版30单元；没有把旧20单元图冒充新版。\n\n"
      "学习支撑并非线上部件。先用问题发现、任务验收和信任边界确定目标，再以安全教学夹具实现组件；"
      "固定流程先于完整动态循环，规划/检索策略、图编排与协作在理解状态之后展开。评价随后支持MVP决定；"
      "安全并不是到后期才考虑，首次真实敏感读取/写入前须完成强制边界并取得实际授权，运行生成代码还须完成沙箱。"
      "独立项目要有真实问题、已有方案比较、差异假设、实现、实际反馈和迭代，不能只呈现面试答案。\n\n"
      "### 章节在全景中的位置\n\n" + chapter_table() + "\n\n")
    extra = ("\n\n## v12新增训练如何接到原实作\n\n"
      "[Python与模型基础](n01-python-model-foundations.md)补对象/并发/输出边界；[记忆与提示](n02-context-memory-prompt.md)使跨轮数据有生命周期；"
      "[规划与反思](n03-planning-reflection.md)、[工具与MCP](n04-tools-mcp.md)、[进阶检索](n05-retrieval-ingestion.md)建立可检验组件；"
      "[图编排](n06-graph-orchestration.md)和[协作](n07-multiagent-a2a.md)按问题选择组织方式；"
      "[沙箱](n08-sandbox-security.md)与[运行交付](n09-runtime-delivery.md)限制代码和长任务风险；"
      "[跨场景实训](n10-evaluation-projects.md)要求把这些机制迁移到客服或研究任务，并交给独立者复现。\n\n"
      "每个新增单元给出机制、失败路径、练习及作品。原19篇专业正文完整保留，末尾新增当前导航；旧代码历史验证不能当本版新运行。"
      "新例区分标准库策略、真实离线框架和外部服务：策略模型不证明真实LLM、MCP/A2A互操作、系统沙箱或GPU性能。"
      "正文能够支持解释，仍需学员实际实现、未知任务评估、真人反馈与求职证据，才可进一步判断岗位能力。\n")
    (ROOT / "00-learning-route.md").write_text(opening + panorama + "## 从哪个起点进入实作" + tail + extra)
    prereq_table = ["| 单元 | 正式先修 |", "| --- | --- |"]
    for unit in order:
        prereq_table.append(f"| {link(unit)} | " + ("、".join(link(x) for x in units[unit]["prerequisites"]) or "无") + " |")
    readme = ("# Agent工程教材 v12\n\n"
      "先读[认识Agent工程](00-learning-route.md)，再按下表完成组件与集成；[完整合订本](agent-engineering-textbook.md)包含同一30单元。"
      "本版将市场面试样本暴露的能力缺口融入机制、实现和练习，专业正文保留深度，面试题不是章节组织方式。\n\n"
      "## 概要、补学与实作入口\n\n"
      "概要先看问题、任务验收、信任边界和方案选择。基础不足者先做[入口诊断](01-foundation.md#先做入口诊断)，再补[Python与模型基础](n01-python-model-foundations.md)。"
      "有基础者也应保留诊断记录，确认对象/并发/输出契约后再跳过对应补学。完整实现按先修推进；高级ANN与推理服务选读不自动成为初级门槛。\n\n"
      "实作从组件夹具进入固定流程，再按任务需要采用动态循环/图/协作，最后迁移到客服知识或研究任务。"
      "首次真实敏感读取或外部写入前须落实强制安全并取得实际授权；本教材和示例不自动授予真实服务调用或发布权限。\n\n"
      "## 30单元阅读顺序\n\n" + chapter_table() + "\n\n"
      "## 正式先修\n\n" + "\n".join(prereq_table) + "\n\n"
      "## 版本、练习和证据\n\n"
      "[能力与练习/作品映射](../../team/textbook-v12-curriculum.md)及[结构化规格](../../team/textbook-v12-curriculum.json)保留原12模块/24目标/48知识点，新增W-N01至W-N10。"
      "[示例运行说明](examples/README.md)区分作者自查与独立QA。19篇原专业正文完整迁移，仅追加v12导航；旧例未因复制重授运行。\n\n"
      "独立评审结论以team目录内当前v12内容审校和QA绑定为准。题目支持度、代码执行、真实学习者表现、专家认可及实际入行分别记录；"
      "本版不自动接入网站，不声称通过完整职业与产品目标。\n")
    (ROOT / "README.md").write_text(readme)


def bundle():
    missing = [unit for unit in order if not (ROOT / (unit + ".md")).exists()]
    if missing:
        raise SystemExit("Cannot assemble missing units: " + ", ".join(missing))
    parts = ["# Agent工程教材 v12 完整合订本\n\n[分章入口](README.md) · 30单元，正文与目录按同一课程顺序组装。\n\n"]
    for i, unit in enumerate(order, 1):
        parts.append(f"- [{i:02} {title(unit)}](#unit-{unit})\n")
    hashes = {}
    for unit in order:
        content = (ROOT / (unit + ".md")).read_text()
        hashes[unit + ".md"] = hashlib.sha256(content.encode()).hexdigest()
        # Headings outside fences get one level; fence bytes remain unchanged.
        fenced = False
        converted = []
        for line in content.splitlines(keepends=True):
            if line.lstrip().startswith("```"):
                fenced = not fenced
            if not fenced and re.match(r"^#{1,5} ", line):
                line = "#" + line
            converted.append(line)
        parts.append(f"\n\n---\n\n<a id=\"unit-{unit}\"></a>\n\n" + "".join(converted))
    (ROOT / "agent-engineering-textbook.md").write_text("".join(parts))
    hashes["agent-engineering-textbook.md"] = hashlib.sha256((ROOT / "agent-engineering-textbook.md").read_bytes()).hexdigest()
    manifest = {"version": "textbook-v12", "order": order, "hashes": hashes,
                "source": "received v10 chapter files", "oldBehaviorRerunByAssembly": False,
                "bundleHeadingTransform": "outside code fences, add one #; relative links stay within v12"}
    (ROOT / "assembly-manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")


if __name__ == "__main__":
    migrate_old()
    landscape()
    opening_and_directory()
    bundle()
    print("Assembled 30 v12 units. No application files or v10 sources modified.")
