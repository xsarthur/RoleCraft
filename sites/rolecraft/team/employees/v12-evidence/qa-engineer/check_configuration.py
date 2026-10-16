"""Read-only configuration checks; writes evidence only in this QA directory."""
from pathlib import Path
import datetime
import hashlib
import json
import re
import sys
from urllib.parse import unquote

QA = Path(__file__).resolve().parent
BASE = QA.parent
ROOT = BASE.parents[4]


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def resolve_input(value):
    p = Path(value)
    return p if p.is_absolute() else ROOT / p


phase = sys.argv[1]
if phase not in ("first", "retest-first", "final"):
    raise SystemExit("phase must be first, retest-first or final")
destination = QA / (phase + "-results.json")
if destination.exists():
    raise SystemExit("Do not overwrite recorded first or final results")

manifest = json.loads((BASE / "manifest.json").read_text())
received = json.loads((BASE / "received-baseline.json").read_text())
errors = []
protected = []
seen = set()
for item in received["files"]:
    p = (ROOT / item["path"]).resolve()
    if not p.is_relative_to(ROOT):
        errors.append({"kind": "baseline_path_outside_workspace", "path": item["path"]})
        continue
    current = sha(p) if p.is_file() else None
    state = "unchanged" if current == item["sha256"] else "changed_or_missing"
    if item["path"] in seen:
        errors.append({"kind": "baseline_duplicate", "path": item["path"]})
    seen.add(item["path"])
    protected.append({**item, "current_sha256": current, "result": state})
    if state != "unchanged":
        errors.append({"kind": "protected_file_change", "path": item["path"]})

prompts = []
for rel, expected in manifest["stable_prompt_bindings"].items():
    p = BASE / rel
    current = sha(p) if p.is_file() else None
    prompts.append({"path": rel, "expected_sha256": expected, "current_sha256": current,
                    "result": "match" if current == expected else "mismatch"})
    if current != expected:
        errors.append({"kind": "stable_config_change", "path": rel})

roles = []
input_checks = []
for role in manifest["employees"]:
    slug = role["role_id"]
    md = BASE / role["onboarding"]
    js = md.with_suffix(".json")
    prompt = BASE / role["prompt"]
    data = json.loads(js.read_text()) if js.is_file() else {}
    actual_name = data.get("role_name", data.get("role"))
    actual_domain = data.get("unique_domain", data.get("domain", ""))
    raw_id = data.get("role_id")
    explicit_employee_id = data.get("employee_id")
    normalized_raw_id = raw_id.replace("_", "-") if isinstance(raw_id, str) else raw_id
    normalization = (normalized_raw_id in (slug, role["employee_id"]) and
                     (explicit_employee_id is None or explicit_employee_id == role["employee_id"]) and
                     (actual_name is None or actual_name == role["name"]) and
                     role["name"] in prompt.read_text() and actual_domain == role["domain"] and
                     data.get("agent_name") == role["agent_name"])
    checks = {
        "prompt_exists": prompt.is_file(),
        "onboarding_md_exists": md.is_file(),
        "onboarding_json_exists": js.is_file(),
        "identity_normalized_match": normalization,
        "accepted": data.get("status") == "accepted_with_dependencies",
        "first_task_recorded": bool(data.get("first_task")),
        "dependencies_recorded": bool(data.get("dependencies")),
        "handoffs_recorded": bool(data.get("handoffs")),
        "self_check_recorded": bool(data.get("self_check")),
        "limitations_recorded": bool(data.get("limitations")),
        "inputs_recorded": bool(data.get("inputs")),
    }
    for name, okay in checks.items():
        if not okay:
            errors.append({"kind": "role_record", "role_id": slug, "check": name})
    roles.append({"employee_id": role["employee_id"], "role_id": slug,
                  "raw_onboarding_role_id": raw_id, "raw_employee_id": explicit_employee_id,
                  "name": actual_name if actual_name is not None else role["name"],
                  "name_source": "onboarding" if actual_name is not None else "prompt_and_manifest_with_employee_id_agent_domain_mapping",
                  "normalized_raw_role_id": normalized_raw_id, "domain": actual_domain,
                  "agent_name": data.get("agent_name"), "checks": checks})
    for row in data.get("inputs", []):
        p = resolve_input(row["path"])
        current = sha(p) if p.is_file() else None
        expected = row.get("sha256")
        item = {"role_id": slug, "path": str(p.relative_to(ROOT)) if p.is_relative_to(ROOT) else str(p),
                "recorded_sha256": expected, "current_sha256": current,
                "result": "match" if expected == current and current else "mismatch"}
        if item["result"] == "mismatch" and p == ROOT / "AGENTS.md":
            marker = "### 当前组织配置：v12证据专项员工".encode()
            raw = p.read_bytes()
            if marker in raw:
                before = raw.split(marker, 1)[0].rstrip(b"\n")
                for newline_count in range(5):
                    prefix_sha = hashlib.sha256(before + b"\n" * newline_count).hexdigest()
                    if prefix_sha == expected:
                        item["result"] = "authorized_administrative_append_original_prefix_matches"
                        item["original_prefix_sha256"] = prefix_sha
                        item["original_trailing_newlines"] = newline_count
                        item["administrative_change"] = "PM declared appended employee configuration paragraph; original bytes restored exactly by omitting appended tail."
                        break
        input_checks.append(item)
        if item["result"] == "mismatch":
            errors.append({"kind": "input_identity", **item})

navigation = []
pages = [BASE / "README.md", BASE / "COMMON.md"]
pages += sorted(BASE.glob("*/prompt.md")) + sorted(BASE.glob("*/onboarding.md"))
for page in pages:
    for target in re.findall(r"\[[^\]]*\]\(([^\n]*?)\)", page.read_text()):
        raw = target.strip().strip("<>")
        if re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*:", raw):
            continue
        filepart = unquote(raw.split("#", 1)[0])
        line_number = None
        line_suffix = re.search(r":([1-9][0-9]*)$", filepart)
        if line_suffix:
            line_number = int(line_suffix.group(1))
            filepart = filepart[:line_suffix.start()]
        p = (page.parent / filepart).resolve() if filepart else page
        okay = p.exists()
        line_in_range = None
        if okay and line_number is not None:
            line_in_range = line_number <= len(p.read_text().splitlines())
            if not line_in_range:
                errors.append({"kind": "navigation_line_out_of_range", "page": str(page.relative_to(ROOT)), "target": raw})
        navigation.append({"page": str(page.relative_to(ROOT)), "target": raw,
                           "file_exists": okay,
                           "line_number": line_number, "line_in_range": line_in_range,
                           "anchor_checked": False if "#" in raw else "not_applicable"})
        if not okay:
            errors.append({"kind": "navigation_target", "page": str(page.relative_to(ROOT)), "target": raw})

ids = [r["role_id"] for r in manifest["employees"]]
agents = [r["agent_name"] for r in manifest["employees"]]
if len(ids) != 8 or len(set(ids)) != 8 or len(set(agents)) != 8:
    errors.append({"kind": "roster_uniqueness", "ids": ids, "agents": agents})
if manifest["team_role_count"] != 15 or manifest["product_status"] != "not_met":
    errors.append({"kind": "declared_boundary"})
dispatch = (BASE / "dispatch-log.md").read_text()
for agent in agents:
    if agent not in dispatch:
        errors.append({"kind": "dispatch_identity_missing", "agent_name": agent})

result = {
    "phase": phase,
    "date": datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=8))).isoformat(),
    "auditor": "/root/employee_v12_qa",
    "configuration_candidate": manifest["configuration_candidate"],
    "scope": "eight_roles_configuration_onboarding_document_identity_and_named_file_protection",
    "protected_files": protected,
    "stable_prompt_bindings": prompts,
    "roles": roles,
    "input_identity_checks": input_checks,
    "navigation": navigation,
    "errors": errors,
    "summary": {"protected_named_files": len(protected),
                "protected_unchanged": sum(x["result"] == "unchanged" for x in protected),
                "stable_configs": len(prompts),
                "stable_config_matches": sum(x["result"] == "match" for x in prompts),
                "role_records": len(roles), "input_checks": len(input_checks),
                "navigation_file_targets": len(navigation), "errors": len(errors)},
    "limitations": ["Automated checks verify file identity and record structure, not human review or behavior.",
                    "Onboarding ID aliases (slug/underscore/EV12 ID) normalized against employee ID, available role name, unique directory, prompt role and agent name.",
                    "QA onboarding is this session's acceptance record; this does not independently audit its own QA conclusion.",
                    "Local Markdown anchor semantics need separate inspection where applicable.",
                    "No software behavior, database, external protocol or private configuration audited.",
                    "The 809-file baseline was received from PM; independent endpoint hashes were computed here."]
}
destination.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
print(json.dumps(result["summary"], ensure_ascii=False))
if errors:
    print(json.dumps(errors, ensure_ascii=False, indent=2))
