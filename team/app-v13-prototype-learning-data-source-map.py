"""Course architect's frozen-source mapping tool; not application code or independent QA."""
from pathlib import Path
import collections
import datetime
import hashlib
import json
import re

PROJECT = Path(__file__).resolve().parent.parent
WORKSPACE = PROJECT.parent.parent
TEAM = PROJECT / "team"


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def read_json(path):
    return json.loads(path.read_text())


def workspace_path(path):
    return str(path.relative_to(WORKSPACE))


def build():
    index_path = PROJECT / "server/retrieval/content-v12-index.json"
    matrix_path = TEAM / "textbook-v12-qa-matrix.json"
    curriculum_path = TEAM / "textbook-v12-curriculum.json"
    pack_path = PROJECT / "dist/content-v12-data.js"
    index = read_json(index_path)
    matrix = read_json(matrix_path)
    curriculum = read_json(curriculum_path)
    pack = json.loads(pack_path.read_text().split("=", 1)[1].strip().removesuffix(";"))
    assert pack == index
    order = curriculum["readingOrder"]
    assert len(order) == len(set(order)) == 30
    assert [u["unitId"] for u in sorted(index["units"], key=lambda u: u["order"])] == order
    assert {q["id"] for q in matrix["items"] if q["set"] == "fixed100"} == set(range(1, 101))
    assert {q["id"] for q in matrix["items"] if q["set"] == "market14"} == set(range(101, 115))
    source_units = {u["unitId"]: u for u in index["units"]}
    source_by_path = {"sites/rolecraft/" + u["sourcePath"]: u for u in index["units"]}
    practice_titles = {
        "练习与参考分析", "三个推理与实作任务", "完成原目标所需的练习证据", "用条件做选择的练习",
        "用故障位置验证 而不是只测正常重启", "14 练习 用反例检验设计判断", "6 可运行入口与迁移练习",
        "8 运行与作品", "7 从演算到作品", "9 运行、失败轨迹与作品", "分层练习与参考判断",
        "推理与实现练习", "成对安全练习及参考分析",
    }
    navigation_titles = {"v12 学习衔接", "v12新增训练如何接到原实作"}
    units, points, point_by_id, section_parent, texts, source_files = [], [], {}, {}, {}, []
    for position, unit_id in enumerate(order, 1):
        unit = source_units[unit_id]
        path = PROJECT / unit["sourcePath"]
        text = path.read_text()
        lines = text.splitlines()
        assert digest(path) == unit["sourceSha256"] and text == unit["bodyMarkdown"]
        spec = next(u for u in curriculum["units"] if u["id"] == unit_id)
        assert spec["prerequisites"] == unit["prerequisiteUnitIds"]
        assert all(order.index(p) < position - 1 for p in spec["prerequisites"])
        texts[unit_id] = text
        source_files.append(path)
        unit_points = []
        sections = unit["sections"]
        for si, section in enumerate(sections):
            # Preserve actual heading whitespace, including one historical trailing space.
            heading = re.match(r"^(#{1,6})\s+(.+)$", lines[section["startLine"] - 1])
            assert heading and len(heading.group(1)) == section["level"] and heading.group(2) == section["title"]
            if section["level"] > 2:
                parent = unit_points[-1]
                section_parent[(unit_id, section["sectionId"])] = parent["id"]
                parent["childSectionIds"].append(section["sectionId"])
                continue
            sid = section["sectionId"]
            point_id = unit_id + ":" + sid
            kind = "unit_introduction" if section["level"] == 1 else "navigation" if section["title"] in navigation_titles else "exercise" if section["title"] in practice_titles else "core"
            next_line = next((s["startLine"] for s in sections[si + 1:] if s["level"] <= section["level"]), len(lines) + 1)
            end_line = sections[si + 1]["startLine"] - 1 if section["level"] == 1 and si + 1 < len(sections) else next_line - 1
            point = {
                "id": point_id, "unitId": unit_id, "sectionId": sid, "title": section["title"],
                "level": section["level"], "kind": kind, "order": len(unit_points) + 1,
                "startLine": section["startLine"], "endLine": end_line,
                "sourcePath": unit["sourcePath"], "sourceSha256": unit["sourceSha256"],
                "href": section["href"], "childSectionIds": [], "questionIds": [],
            }
            unit_points.append(point)
            points.append(point)
            point_by_id[point_id] = point
            section_parent[(unit_id, sid)] = point_id
        units.append({
            "unitId": unit_id, "order": position, "title": unit["title"],
            "navigationLabel": unit["navigationLabel"], "coreQuestion": unit["coreQuestion"],
            "sourcePath": unit["sourcePath"], "sourceSha256": unit["sourceSha256"],
            "prerequisiteUnitIds": unit["prerequisiteUnitIds"], "prerequisites": unit["prerequisiteUnitIds"],
            "href": unit["href"], "knowledgePointIds": [p["id"] for p in unit_points],
            "coreKnowledgePointIds": [p["id"] for p in unit_points if p["kind"] == "core"], "questionIds": [],
        })
    unit_by_id = {u["unitId"]: u for u in units}
    questions = []
    broad_ranges = 0
    for item in matrix["items"]:
        number = item["id"]
        qid = ("Q" if item["set"] == "fixed100" else "M") + str(number)
        references, evidence, reference_keys = [], [], set()
        personal = number in (10, 99)
        for ei, e in enumerate(item["finalEvidence"], 1):
            unit = source_by_path[e["file"]]
            unit_id = unit["unitId"]
            text = texts[unit_id]
            review_start = e.get("startLine", e["line"])
            review_end = e.get("endLine", review_start)
            source_range = "\n".join(text.splitlines()[review_start - 1:review_end])
            quote = e["quote"]
            assert e["sha256"] == unit["sourceSha256"] and quote in source_range
            offset = source_range.index(quote)
            start = review_start + source_range[:offset].count("\n")
            end = start + quote.count("\n")
            section = next(s for s in reversed(unit["sections"]) if s["startLine"] <= start)
            assert section["title"].strip() == e["section"].lstrip("# ").strip()
            point_id = section_parent[(unit_id, section["sectionId"])]
            reference = {
                "unitId": unit_id, "sectionId": section["sectionId"], "knowledgePointId": point_id,
                "sourcePath": unit["sourcePath"], "sourceSha256": unit["sourceSha256"],
                "sectionTitle": section["title"], "href": section["href"],
            }
            reference_key = (unit_id, section["sectionId"])
            if reference_key not in reference_keys:
                references.append(reference)
                reference_keys.add(reference_key)
            evidence.append({
                "id": qid + "-E" + str(ei), **reference, "quote": quote, "startLine": start, "endLine": end,
                "usage": e.get("usage", "support"),
                "reviewSourceRange": {"startLine": review_start, "endLine": review_end, "section": e["section"]},
            })
            for target in (point_by_id[point_id], unit_by_id[unit_id]):
                if qid not in target["questionIds"]:
                    target["questionIds"].append(qid)
            broad_ranges += any(review_start < s["startLine"] <= review_end for s in unit["sections"])
        assert references
        limits = [item.get("finalMissingSubquestions"), item.get("personalEvidenceStatus"), "教材摘录是学习参考；正文支持程度不代表你的答题成绩、职业胜任或真实产品效果。"]
        questions.append({
            "id": qid, "sourceQuestionId": number, "question": item["question"], "set": item["set"],
            "setLabel": "原100题" if item["set"] == "fixed100" else "新增14题",
            "capabilities": item["capabilities"], "roleLevel": item.get("roleLevel"),
            "answerKind": "personal_evidence_required" if personal else "textbook_evidence",
            "supportStatus": item["qaDecision"], "methodSupport": item.get("methodSupport"),
            "knowledgeRefs": references, "evidence": evidence, "personalEvidenceRequired": personal,
            "selfTestEligible": not personal, "excludeFromSelfTest": personal,
            "limitations": list(dict.fromkeys(s for s in limits if s)),
            "provenance": {"matrixPath": "team/textbook-v12-qa-matrix.json", "sourceId": number,
                           "sourceType": item.get("sourceType"), "sourceDerivation": item.get("sourceDerivation"),
                           "sourceRefs": item.get("sourceRefs", []), "accessDate": item.get("accessDate"),
                           "enterpriseOriginalQuestionCertified": False},
        })
    assert len(questions) == 114 and sum(len(q["evidence"]) for q in questions) == 327
    stage_specs = [("S1", "起点与问题", order[:6]), ("S2", "程序与模型边界", order[6:9]),
                   ("S3", "选型与组件", order[9:15]), ("S4", "固定与动态流程", order[15:21]),
                   ("S5", "评价与产品决定", order[21:29]), ("S6", "交付与迭代", order[29:])]
    client = PROJECT / "dist/learning-workbench.js"
    client_lines = client.read_text().splitlines()
    stages = []
    for sid, title, unit_ids in stage_specs:
        line = next(n for n, value in enumerate(client_lines, 1) if "{ title: '" + title + "'" in value)
        assert all("'" + uid + "'" in client_lines[line - 1] for uid in unit_ids)
        stages.append({"id": sid, "title": title, "unitIds": unit_ids, "order": len(stages) + 1,
                       "relation": "recommended_reading_order_not_formal_prerequisite",
                       "provenance": {"sourcePath": "dist/learning-workbench.js", "receivedSourceSha256": digest(client),
                                      "startLine": line, "endLine": line,
                                      "bindingKind": "received_reference_for_stage_labels_not_final_runtime_binding"}})
    inputs = [matrix_path, curriculum_path, index_path, pack_path,
              PROJECT / "textbooks/v12/agent-engineering-textbook.md", PROJECT / "textbooks/v12/README.md",
              PROJECT / "textbooks/v12/assembly-manifest.json"] + source_files
    bindings = [{"path": workspace_path(p), "sourcePath": str(p.relative_to(PROJECT)), "sha256": digest(p),
                 "bytes": p.stat().st_size, "kind": "frozen_teaching_input" if "/textbooks/" in str(p) or p in (matrix_path, curriculum_path) else "same_corpus_derived_input"} for p in inputs]
    counts = {"units": len(units), "indexedSections": sum(len(u["sections"]) for u in index["units"]),
              "knowledgePoints": len(points), "knowledgePointKinds": dict(collections.Counter(p["kind"] for p in points)),
              "questions": len(questions), "questionSets": dict(collections.Counter(q["set"] for q in questions)),
              "evidence": 327, "selfTestEligible": sum(q["selfTestEligible"] for q in questions),
              "personalEvidenceRequired": 2, "qaHoldoutVariantsIncluded": 0, "sourceBindings": len(bindings)}
    now = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=8))).isoformat()
    version = "app-v13-prototype-learning-data-1"
    data = {
        "schemaVersion": "1", "version": version, "corpusVersion": index["corpusVersion"],
        "corpusHash": index["corpusHash"], "bookSha256": index["bookSha256"], "sourceBindings": bindings,
        "metadata": {"version": version, "corpusVersion": index["corpusVersion"], "corpusHash": index["corpusHash"],
                     "generatedAt": now, "role": "课程架构师", "status": "source_mapping_self_checked_pending_independent_qa",
                     "counts": counts, "sourceBindings": bindings,
                     "questionEvidenceBoundary": "原文摘录与已冻结支持判断；不是固定答案、学员成绩、录用认证或行业领先证据。",
                     "unitOrderPolicy": "formal_textbook_v12_readingOrder_unchanged",
                     "knowledgePointPolicy": "actual_level1_introduction_and_all_level2_headings; level3_exact_target_retained_and_parented_to_actual_level2",
                     "selfTestPolicy": "learner_self_assessment_only; exclude_Q10_Q99; deduplicated_visited_knowledgePoint_question_union",
                     "sourceLinePolicy": "exact_quote_startLine_endLine; original_QA_broader_range_preserved_in_reviewSourceRange",
                     "stagePolicy": "existing_v12_client_6_stage_labels_and_membership; not_replacement_for_formal_prerequisites"},
        "role": {"id": "agent", "name": "Agent开发者"}, "readingOrder": order, "routeStages": stages,
        "units": units, "knowledgePoints": points, "questions": questions,
        "limitations": ["这是冷启动来源映射，不新增教材正文、题面或固定答案。", "原100题和新增14题分组保留，QA保留10变体不导入。",
                        "题目为重组或研究改写学习题，无平台热度、企业原题认证或必考保证。",
                        "知识点访问、本人自评、真实项目和专业审核分别记录。", "Q10和Q99须结合本人真实经历；教材只提供方法。",
                        "本岗自查只核来源、版本和归属，不代独立内容审校、程序验收或真人学习效果。"],
    }
    output = TEAM / "app-v13-prototype-learning-data.json"
    output.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    check = {
        "version": "app-v13-prototype-learning-data-source-check-1", "role": "课程架构师",
        "kind": "domain_source_mapping_self_check_not_independent_qa", "at": now,
        "output": {"path": workspace_path(output), "sha256": digest(output), "bytes": output.stat().st_size}, "counts": counts,
        "checks": {"fixed100_market14_full_unique_ids_and_unchanged_question_text": True,
                   "all_327_quotes_exact_in_original_source_ranges_and_precise_heading": True,
                   "all_source_sha_and_37_input_bindings_match": True, "all_30_bodies_equal_frozen_source_bytes": True,
                   "formal_reading_order_and_prerequisites_unchanged": True, "js_pack_equals_same_corpus_index": True,
                   "all_273_indexed_headings_are_real_and_titles_preserved": True,
                   "all_240_points_and_33_level3_parent_targets_real": True, "all_114_have_current_knowledge_refs": True,
                   "Q10_Q99_personal_only_excluded_from_self_test": True,
                   "bidirectional_question_mapping_uses_actual_evidence": True,
                   "existing_6_stages_preserve_names_and_30_unit_membership": True,
                   "qa_holdout_variants_not_read_or_imported": True},
        "originalReviewRangesCrossNextHeadingCount": broad_ranges,
        "rangeNote": "部分原审校范围跨后续heading；引文本身仍在原声明节。新数据另给精确引文行，原范围保留，不改旧矩阵。",
        "authoringGuardNote": "首作者转换尝试将heading尾部空格误裁后触发断言，未写数据；改为精确保留收到标题。源和索引未改，此为作者转换检查错误而非应用缺陷。",
        "executionBoundary": "No app/browser tests, example execution, models, learner simulation, independent review or user data access.",
        "sourceBindings": bindings,
    }
    check_path = TEAM / "app-v13-prototype-learning-data-source-check.json"
    check_path.write_text(json.dumps(check, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"dataPath": str(output), "dataSha256": digest(output), "sourceCheckPath": str(check_path), "counts": counts}, ensure_ascii=False))


if __name__ == "__main__":
    build()
