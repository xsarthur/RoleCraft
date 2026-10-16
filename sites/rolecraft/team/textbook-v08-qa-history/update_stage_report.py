"""Update only QA-owned stage reports; preserve prior report snapshots."""
from pathlib import Path
import json
from datetime import datetime, timezone

history = Path(__file__).resolve().parent
team = history.parent
report_path = team / "textbook-v08-qa.json"
md_path = team / "textbook-v08-qa.md"
for src in (report_path, md_path):
    snapshot = history / ("report-before-stage03-04" + src.suffix)
    if not snapshot.exists():
        snapshot.write_bytes(src.read_bytes())
report = json.loads(report_path.read_text())
report["scope"] = "all 12 new manuscripts and frozen v07 fully read; pre-final artifact/evidence and safe offline example QA; CR08-10 and final review/assembly pending"
report["runtime"]["sqliteVersion"] = "3.53.1"
safe = report["safeExecution"]
current_files = [
    history / "stage01/stdout.json", history / "stage02/stdout.json",
    history / "stage03/crash_after_external_commit-stdout.json",
    history / "stage03/restart_recover-stdout.json",
    history / "stage03/boundaries-stdout.json", history / "stage04/stdout.json",
]
counts = []
for path in current_files:
    data = json.loads(path.read_text())
    records = data["records"]
    assert all(r["pass"] for r in records), path
    counts.append({"evidence": str(path.relative_to(team.parent)), "assertionRecords": len(records), "allExpected": True})
safe["currentAssertionRecords"] = sum(x["assertionRecords"] for x in counts)
safe["recordsByEvidence"] = counts
safe["result"] = "all 108 expected behaviors observed for the exact archived blocks; not final current-block acceptance for c03/e01 because CR08-10 is open"
for stage in ("stage03", "stage04"):
    names = ["source.json", "execution.json"]
    names += (["crash_after_external_commit-stdout.json", "restart_recover-stdout.json", "boundaries-stdout.json"] if stage == "stage03" else ["stdout.json"])
    for name in names:
        ref = f"team/textbook-v08-qa-history/{stage}/{name}"
        if ref not in safe["evidence"]:
            safe["evidence"].append(ref)
for stage, unit in (("stage03", "e01"), ("stage04", "p02")):
    source = json.loads((history / stage / "source.json").read_text())
    source["unit"] = unit
    source["finalBinding"] = "invalid_until_affected_repair_retest" if unit == "e01" else "pending_final_prose_and_block_alignment"
    if not any(s["unit"] == unit for s in safe["sources"]):
        safe["sources"].append(source)
for s in safe["sources"]:
    if s["unit"] == "c03":
        s["finalBinding"] = "invalid_until_affected_repair_retest"
safe["boundaries"] += [
    "e01: Store definitions only, SQLite filenames restricted to new QA temp directory; two independent teaching DBs, one intentional interpreter exit23 then new interpreter recovery. No business DB/hardware failure/real remote proof.",
    "p02: default fixture and malformed indexes only against QA-created temp files; no user evidence/business directory scanned; INDEX_OK only proves those bytes/version references consistent.",
    "c01/v07 original pseudocode, p01 research/experiments, all learner/human review work unexecuted.",
    "CR08-10 remains open: current e01/c03 cross-chapter canonical fingerprint and dispatch mapping require author repair and affected retest; old passes are retained only as historical version facts.",
]
report["actualCoverageEvidence"] = "team/textbook-v08-qa-history/actual-coverage-pre-final.json"
report["coverageStatus"] = "48 knowledge points and 24 objectives manually mapped to observed mechanisms/practice positions across 13 full read units; pre-final only, not learner achievement; CR08-10 quality blocker and final SHA/semantic alignment pending"
report.pop("partialActualCoverage", None)
report["frozenV07"]["currentFullCrossRead"] = "full 902 lines read; same frozen hash; same-scope original pseudocode remains not_run"
report["openDefects"] = [{
    "id": "CR08-10", "status": "awaiting_author_repair_and_affected_retest",
    "source": "current independent content review via PM",
    "scope": ["c03 canonical fingerprint", "e01 canonical fingerprint", "e01 DISPATCH to c03 Dispatch mapping"],
    "counterexamplesRequired": ["Chinese Unicode equal content", "evidence ID permutation/deduplication", "explicit Store-to-adapter mapped dispatch"],
    "preserveHistoricalEvidence": ["stage01 c03", "stage03 e01"],
    "doNotRepeatUnchangedChecks": True,
}]
report["finalChecksPending"] = [
    "CR08-10 author repair; full affected code reread; original c03/e01 behavior rerun plus cross-chapter canonical/mapping counterexamples",
    "final author/content-review SHA alignment and original issue closures; no old review inherited",
    "48-point/24-objective manual locations rebound to final sources, affected semantics rechecked",
    "execution-description changes and all executable block SHA aligned to final whole-file SHA",
    "README all local links and byte-exact combined-book source binding once generated",
    "final 22-file baseline comparison (two observation points only)",
    "current-version full product retrospective",
]
for gate in report["productGateAssessment"]:
    if gate["id"] == "teaching_quality":
        gate["reason"] = "12新稿与冻结v07已全文读并定位原目标；当前跨章CR08-10、最终审校/合订本绑定未完成，真人专业与真实学习评价缺失。"
report["recordedAt"] = datetime.now(timezone.utc).isoformat()
report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
print(json.dumps({"status": report["status"], "currentAssertionRecords": safe["currentAssertionRecords"], "historicalReproductions": safe["archivedDefectReproductions"], "openDefect": "CR08-10"}, ensure_ascii=False))
