#!/usr/bin/env python3
"""Read-only startup content/version checks; stdout is not an understanding certificate."""
import argparse
import hashlib
import json
import os
import posixpath
import re
import stat
import subprocess
import sys
from pathlib import Path, PurePosixPath
from urllib.parse import unquote, urlsplit

BASE = "sites/rolecraft/team/"
CORE = BASE + "employees/core/"
V12 = BASE + "employees/v12-evidence/"
CONFIG = BASE + "onboarding/startup/sources.json"
LOCATOR = BASE + "onboarding/startup/local-method-source.json"
PRIOR_VALIDATION = BASE + "validation/natural-read-20261017T1557Z/"
REPAIRED_VALIDATION = BASE + "validation/natural-read-repair-20261018T0110Z/"
LATEST_RECORDS = tuple(BASE + name for name in (
    "team-method-loop-20261017-archive.md", "team-method-loop-20261017-evidence.json",
    "task-closeout-20261017.md", "task-closeout-20261017.json")) + (
    PRIOR_VALIDATION + "README.md", PRIOR_VALIDATION + "validation-receipt.json",
    REPAIRED_VALIDATION + "README.md", REPAIRED_VALIDATION + "validation-receipt.json")
FIXED = "a848db9f9ab6605aa7379dddef3faa918e412f96"
ORIGIN = "git@github.com:chennyqian/ai-team-handbook.git"
PROJECT_SOURCES = (
    "AGENTS.md", *(BASE + "onboarding/" + name for name in (
        "README.md", "ROLE-MAPPING.md", "TEAM-ROUTING.md", "APPLICATION-NOTES.md",
        "TASK-LAYOUT3-READING-DIALOGUE.md")), CORE + "README.md", CORE + "manifest.json",
    CORE + "user-profile/approved-preferences.md", V12 + "manifest.json",
    *LATEST_RECORDS)
METHOD_FILES = ("README.md", "SOURCE-MANIFEST.md", "CHANGELOG.md", "roles.md", "methods.md",
                "adoption-and-change.md", "checklists/startup-receipt.md", "checklists/task-and-evidence.md",
                "examples/website-adapter.example.md", "examples/learning-product-adapter.example.md")
RETRIEVAL_ROLE = "content-retrieval-engineer"
RETRIEVAL_FILES = (BASE + "SPECIALISTS.md", BASE + "app-v14-dialog-retrieval.md")


class Rejected(Exception):
    pass


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def relative(name):
    if not isinstance(name, str) or not name or "\\" in name:
        raise Rejected("invalid_relative_path")
    path = PurePosixPath(name)
    if path.is_absolute() or any(part in ("..", ".git", ".aws", ".codex", ".agents") for part in path.parts):
        raise Rejected("unsafe_relative_path")
    return path.as_posix()


def open_directory(path):
    path = Path(path)
    if not path.is_absolute() or ".." in path.parts:
        raise Rejected("unsafe_root")
    flags = os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW
    fd = os.open("/", flags)
    try:
        for part in path.parts[1:]:
            newer = os.open(part, flags, dir_fd=fd)
            os.close(fd)
            fd = newer
        return fd
    except BaseException:
        os.close(fd)
        raise


def full_read(root, name):
    """Read complete regular-file bytes via descriptors; no follow, truncate, or writes."""
    name = relative(name)
    root = Path(root).absolute()
    parent = root / PurePosixPath(name).parent
    fd = open_directory(parent)
    source = None
    try:
        source = os.open(PurePosixPath(name).name, os.O_RDONLY | os.O_NOFOLLOW, dir_fd=fd)
        before = os.fstat(source)
        if not stat.S_ISREG(before.st_mode):
            raise Rejected("not_regular_file")
        chunks = []
        while True:
            chunk = os.read(source, 65536)
            if not chunk:
                break
            chunks.append(chunk)
        after = os.fstat(source)
        if (before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns) != (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns):
            raise Rejected("source_changed_during_read")
        # Re-open the entire parent chain to detect a renamed/symlinked ancestor.
        current = open_directory(parent)
        try:
            if (os.fstat(fd).st_dev, os.fstat(fd).st_ino) != (os.fstat(current).st_dev, os.fstat(current).st_ino):
                raise Rejected("parent_binding_changed")
            final = os.stat(PurePosixPath(name).name, dir_fd=current, follow_symlinks=False)
            if (final.st_dev, final.st_ino, final.st_size, final.st_mtime_ns) != (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns):
                raise Rejected("source_binding_changed")
        finally:
            os.close(current)
        raw = b"".join(chunks)
        if not raw:
            raise Rejected("empty_body")
        return raw
    finally:
        if source is not None:
            os.close(source)
        os.close(fd)


class GitRepository:
    def __init__(self, root):
        self.root = Path(root).absolute()
        fd = open_directory(self.root)
        os.close(fd)

    def git(self, *args):
        return subprocess.run(["git", "--no-optional-locks", "-C", str(self.root), *args],
                              check=True, capture_output=True,
                              env={**os.environ, "GIT_OPTIONAL_LOCKS": "0", "GIT_NO_REPLACE_OBJECTS": "1"}).stdout

    def metadata(self):
        return {"head": self.git("rev-parse", "HEAD").decode().strip(),
                "origin": self.git("remote", "get-url", "origin").decode().strip(),
                "branch": self.git("branch", "--show-current").decode().strip()}

    def tree(self, revision):
        result = {}
        for entry in self.git("ls-tree", "-r", "-z", revision).split(b"\0"):
            if entry:
                meta, name = entry.split(b"\t", 1)
                mode, kind, blob = meta.decode().split()
                result[name.decode()] = {"mode": mode, "kind": kind, "blob": blob}
        return result

    def blob(self, object_id):
        return self.git("cat-file", "blob", object_id)


def read_json(root, path):
    return json.loads(full_read(root, path).decode("utf-8"))


def verify_config(config):
    if not isinstance(config, dict):
        raise Rejected("invalid_source_config_object")
    if config.get("schema_version") != 1 or set(config.get("project_sources", [])) != set(PROJECT_SOURCES):
        raise Rejected("project_source_whitelist_mismatch")
    if config.get("role_catalogs") != {"core": CORE + "manifest.json", "v12": V12 + "manifest.json"}:
        raise Rejected("role_catalog_mismatch")
    if config.get("specialist_sources") != {RETRIEVAL_ROLE: list(RETRIEVAL_FILES)}:
        raise Rejected("specialist_source_whitelist_mismatch")
    method = config.get("method", {})
    if method.get("origin") != ORIGIN or method.get("revision") != FIXED or set(method.get("files", [])) != set(METHOD_FILES):
        raise Rejected("fixed_method_manifest_mismatch")


def resolve_method_root(project_root, explicit=None):
    """One explicit root or one approved local locator; never search, fetch or fall back."""
    if explicit is not None:
        root = Path(explicit).absolute()
        selection = {"mode": "explicit_cli", "root": str(root)}
    else:
        raw = full_read(project_root, LOCATOR)
        locator = json.loads(raw.decode("utf-8"))
        if not isinstance(locator, dict):
            raise Rejected("invalid_local_method_locator_object")
        required = {"schema_version": 1, "binding_scope": "RoleCraft_local_read_only_fixed_method_source",
                    "origin": ORIGIN, "revision": FIXED, "network": "never",
                    "method_adoption": "not_adopted_REVIEW_DRAFT"}
        if any(locator.get(key) != value for key, value in required.items()):
            raise Rejected("invalid_local_method_locator_binding")
        value = locator.get("local_root")
        if not isinstance(value, str) or not value or not Path(value).is_absolute():
            raise Rejected("invalid_local_method_root")
        root = Path(value)
        selection = {"mode": "local_locator", "locator": LOCATOR,
                     "locator_sha256": sha(raw), "root": str(root),
                     "scope": "this_authorized_local_source_only_not_other_user_access_proof"}
    fd = open_directory(root)
    os.close(fd)
    return root, selection


def verified_method_bodies(root, repository=GitRepository):
    """Validate the fixed pack before returning any body; no body is persisted here."""
    repo = repository(root)
    meta = repo.metadata()
    if meta["origin"] != ORIGIN or meta["head"] != FIXED:
        raise Rejected("wrong_method_origin_or_revision")
    tree = repo.tree(FIXED)
    if set(tree) != set(METHOD_FILES):
        raise Rejected("fixed_tree_file_set_mismatch")
    bodies = {}
    for path in METHOD_FILES:
        entry = tree[path]
        if entry["kind"] != "blob" or entry["mode"] not in ("100644", "100755"):
            raise Rejected("non_regular_git_entry")
        raw = full_read(root, path)
        raw.decode("utf-8")
        if raw != repo.blob(entry["blob"]):
            raise Rejected("method_body_not_fixed_blob")
        bodies[path] = raw
    if repo.metadata() != meta:
        raise Rejected("method_version_changed_during_check")
    return bodies, meta, tree


def local_links(text, origin_path, root, selected):
    result = []
    prose, fence = [], None
    for line in text.splitlines(keepends=True):
        plain = line.rstrip("\r\n")
        if fence:
            if re.fullmatch(r" {0,3}" + re.escape(fence[0]) + "{" + str(fence[1]) + r",}[ \t]*", plain):
                fence = None
            continue
        opening = re.match(r"^ {0,3}(`{3,}|~{3,})(.*)$", plain)
        if opening and not (opening[1][0] == "`" and "`" in opening[2]):
            fence = (opening[1][0], len(opening[1]))
            continue
        prose.append(line)
    for raw in re.findall(r"\[[^\]]*\]\(([^\s)]+)(?:\s+[^)]*)?\)", "".join(prose)):
        target = raw.strip("<>")
        parsed = urlsplit(target)
        if parsed.scheme or parsed.netloc:
            result.append({"target": target, "status": "external_not_fetched"})
            continue
        if parsed.path.startswith("/"):
            result.append({"target": "legacy_absolute_reference", "status": "legacy_absolute_not_followed"})
            continue
        resolved = posixpath.normpath(posixpath.join(posixpath.dirname(origin_path), unquote(parsed.path))) if parsed.path else origin_path
        try:
            resolved = relative(resolved)
            parent = open_directory(root / PurePosixPath(resolved).parent)
            try:
                item = os.stat(PurePosixPath(resolved).name, dir_fd=parent, follow_symlinks=False)
                if stat.S_ISLNK(item.st_mode):
                    raise Rejected("symlink_link_target")
            finally:
                os.close(parent)
            state = "local_target_exists"
            if parsed.fragment:
                state = "local_target_exists_fragment_unverified"
            result.append({"target": resolved, "status": state, "selected_body_read": resolved in selected})
        except (OSError, Rejected) as exc:
            result.append({"target": resolved, "status": "broken_or_unsafe", "reason": str(exc)})
    return result


def check(project_root, roles, method_root=None, evidence=None, include_content=False, repository=GitRepository):
    """Repository injection is only a synthetic-test seam, never a CLI bypass."""
    if not roles or len(set(roles)) != len(roles) or any(not re.fullmatch(r"[a-z0-9-]+", r) for r in roles):
        raise Rejected("explicit_distinct_task_roles_required")
    project_root = Path(project_root).absolute()
    config = read_json(project_root, CONFIG)
    verify_config(config)
    project = repository(project_root)
    start = project.metadata()
    tree = project.tree(start["head"])
    bodies, records = {}, {}
    problems = []

    def read_source(kind, root, path, repo, entries, fixed=False, required=True):
        source_id = kind + ":" + path
        if source_id in records:
            return source_id
        row = {"source_id": source_id, "path": path, "availability": "unavailable",
               "checker_content_read": False, "agent_readback": "unverified"}
        records[source_id] = row
        try:
            raw = full_read(root, path)
            text = raw.decode("utf-8")
            bodies[source_id] = text
            entry = entries.get(path)
            if entry is None:
                binding = "worktree_untracked"
                if fixed:
                    raise Rejected("not_in_fixed_tree")
            else:
                if entry["kind"] != "blob" or entry["mode"] not in ("100644", "100755"):
                    raise Rejected("non_regular_git_entry")
                matches = raw == repo.blob(entry["blob"])
                binding = "fixed_tree_blob_match" if fixed and matches else "HEAD_blob_match" if matches else "worktree_dirty_against_HEAD"
                row["git_blob"] = entry["blob"]
            row.update(availability="available", checker_content_read=True, bytes_read=len(raw),
                       sha256=sha(raw), line_count=len(text.splitlines()), version_binding=binding,
                       source_revision=FIXED if fixed else start["head"])
            if fixed and binding != "fixed_tree_blob_match":
                problems.append({"source_id": source_id, "issue": "method_body_not_fixed_blob"})
            if include_content:
                row["content"] = text
        except (OSError, Rejected, UnicodeError, subprocess.CalledProcessError) as exc:
            row["reason"] = str(exc)
            if required:
                problems.append({"source_id": source_id, "issue": "body_unavailable"})
        return source_id

    for path in PROJECT_SOURCES:
        read_source("project", project_root, path, project, tree)
    team_fd = open_directory(project_root / BASE)
    try:
        uncovered = sorted(BASE + name for name in os.listdir(team_fd)
                           if re.fullmatch(r"task-closeout-[A-Za-z0-9-]+\.(?:md|json)", name)
                           and BASE + name not in PROJECT_SOURCES)
    finally:
        os.close(team_fd)
    if uncovered:
        problems.append({"issue": "uncovered_project_records"})
    core = json.loads(bodies.get("project:" + CORE + "manifest.json", "{}"))
    v12 = json.loads(bodies.get("project:" + V12 + "manifest.json", "{}"))
    core_roles = {row["directory"]: row for row in core.get("employees", [])}
    fallback_roles = {row["role_id"]: row for row in v12.get("employees", [])}
    role_records = []
    for role in roles:
        row = {"role_id": role, "required_package": {}, "fallback_sources": [], "applicability": "unverified",
               "source_team": "original_project_team", "ownership": "unknown",
               "use": "authorized_collaboration_reference_only", "management_actions": "none"}
        role_records.append(row)
        if role in core_roles:
            original = core_roles[role]
            if original.get("memory_source") != role + "/MEMORY.md" or original.get("schema") != role + "/MEMORY_SCHEMA.md":
                raise Rejected("role_manifest_path_conflict")
            for label, suffix in (("ROLE", "ROLE.md"), ("MEMORY", "MEMORY.md"), ("SCHEMA", "MEMORY_SCHEMA.md")):
                row["required_package"][label] = read_source("project", project_root, CORE + role + "/" + suffix, project, tree, required=label == "ROLE")
            row["role_material_readable"] = records[row["required_package"]["ROLE"]]["checker_content_read"]
            memory_count = sum(records[row["required_package"][label]]["checker_content_read"] for label in ("MEMORY", "SCHEMA"))
            row["original_long_term_memory"] = "available" if memory_count == 2 else "partial" if memory_count else "missing"
        else:
            row["required_package"] = {label: "missing_original_package" for label in ("ROLE", "MEMORY", "SCHEMA")}
            row.update(role_material_readable=False, original_long_term_memory="missing")
        if role in fallback_roles and role not in core_roles:
            original = fallback_roles[role]
            for label, suffix in (("prompt", "prompt.md"), ("onboarding", "onboarding.md")):
                if original.get(label) != role + "/" + suffix:
                    raise Rejected("fallback_manifest_path_conflict")
                row["fallback_sources"].append(read_source("project", project_root, V12 + role + "/" + suffix, project, tree))
            row["package_status"] = "original_triplet_missing_v12_sources_separate"
            row["role_material_readable"] = all(records[s]["checker_content_read"] for s in row["fallback_sources"])
        elif role == RETRIEVAL_ROLE:
            for path in RETRIEVAL_FILES:
                row["fallback_sources"].append(read_source("project", project_root, path, project, tree))
            row["package_status"] = "historical_specialist_sources_not_ROLE_or_MEMORY"
            row["role_material_readable"] = all(records[s]["checker_content_read"] for s in row["fallback_sources"])
        else:
            row["package_status"] = "core_package_selected" if role in core_roles else "role_not_found_in_manifests"
        if not row["role_material_readable"]:
            problems.append({"role_id": role, "issue": "role_material_unavailable"})

    method_report = {"expected_revision": FIXED, "status": "blocked", "formal_adoption": False}
    method_repo = None
    try:
        method_root, selection = resolve_method_root(project_root, method_root)
        method_report["source_selection"] = selection
        method_repo = repository(method_root)
        meta = method_repo.metadata()
        method_report["observed"] = meta
        if meta["origin"] != ORIGIN or meta["head"] != FIXED:
            raise Rejected("wrong_method_origin_or_revision")
        method_tree = method_repo.tree(FIXED)
        if set(method_tree) != set(METHOD_FILES):
            raise Rejected("fixed_tree_file_set_mismatch")
        for path in METHOD_FILES:
            read_source("method", method_root, path, method_repo, method_tree, fixed=True)
        if all(records["method:" + p].get("version_binding") == "fixed_tree_blob_match" for p in METHOD_FILES):
            method_report["status"] = "fixed_tree_full_content_read"
        if method_repo.metadata() != meta:
            raise Rejected("method_version_changed_during_check")
    except (OSError, Rejected, ValueError, TypeError, subprocess.CalledProcessError) as exc:
        method_report.update(status="blocked", reason=str(exc))
        problems.append({"source_id": "method", "issue": "method_binding_failed"})

    # Check local references, without reading linked bodies or fetching anything.
    for source_id, text in bodies.items():
        kind, path = source_id.split(":", 1)
        selected = {s.split(":", 1)[1] for s in bodies if s.startswith(kind + ":")}
        records[source_id]["references"] = local_links(text, path, project_root if kind == "project" else method_root, selected)

    proof = check_evidence(evidence, roles, role_records, records, bodies, project_root)
    all_links = [link for row in records.values() for link in row.get("references", [])]
    reference_summary = {"status": "local_target_metadata_checked_not_semantic_review",
                         "broken_or_unsafe": sum(link["status"] == "broken_or_unsafe" for link in all_links),
                         "legacy_absolute_not_followed": sum(link["status"] == "legacy_absolute_not_followed" for link in all_links),
                         "external_not_fetched": sum(link["status"] == "external_not_fetched" for link in all_links),
                         "fragment_unverified": sum(link["status"] == "local_target_exists_fragment_unverified" for link in all_links)}
    if reference_summary["broken_or_unsafe"]:
        problems.append({"issue": "broken_or_unsafe_local_references"})
    if project.metadata() != start:
        problems.append({"source_id": "project", "issue": "project_version_changed_during_check"})
    if proof["scope_conflicts"]:
        problems.append({"issue": "role_scope_conflict"})
    return {"schema_version": 1, "mode": "read_only_startup_check", "writes": 0,
            "verified_user_owned_employees": [], "shared_method_scope": "shared_method_support_pool_not_employee_identity",
            "project": start, "sources": list(records.values()), "roles": role_records, "method": method_report,
            "mechanical_readiness": "partial" if problems else "full_content_and_versions_checked",
            "startup_connection": "not_connected", "model_understanding": "unverified",
            "agent_readback": "unverified; checker reads and optional stdout are not professional-agent receipt evidence",
            "include_content": include_content, "evidence": proof, "problems": problems,
            "normal_body_reading": {"mode": "required_flow", "command":
                "python3 -B " + BASE + "onboarding/startup/read_source.py --required-flow --roles " + ",".join(roles),
                "metadata_is_not_body_delivery": True},
            "reference_integrity": reference_summary, "uncovered_project_records": uncovered,
            "record_scope": {"status": "explicit_frozen_known_record_set_only",
                "records": list(LATEST_RECORDS), "validation_directory_autodiscovery": False,
                "project_latest_records_readable_means": "only the explicit current record list; not permanently latest"},
            "readability": {
                "role_material_readable": all(row["role_material_readable"] for row in role_records),
                "original_long_term_memory": {row["role_id"]: row["original_long_term_memory"] for row in role_records},
                "shared_method_readable": method_report["status"] == "fixed_tree_full_content_read",
                "project_latest_records_readable": not uncovered and all(records["project:" + p]["checker_content_read"] for p in LATEST_RECORDS)},
            "limitations": ["not a natural startup event test", "no platform trace authentication",
                            "no application quality or understanding certification", "no formal method adoption"]}


def check_evidence(evidence, roles, role_records, records, bodies, project_root):
    result = {"scope_conflicts": [], "scope_status": "unverified", "readback_references": [],
              "planned_application": [], "actual_reference_integrity": [], "application_quality": "unverified"}
    if evidence is None:
        return result
    if evidence.get("schema_version") != 1:
        raise Rejected("invalid_evidence_schema")
    scope = evidence.get("role_scope", [])
    for item in scope:
        role, applicability = item.get("role_id"), item.get("applicability")
        if (applicability == "required" and role not in roles) or (role in roles and applicability != "required"):
            result["scope_conflicts"].append({"role_id": role, "issue": "CLI_evidence_scope_conflict"})
    if len({s.get("role_id") for s in scope}) != len(scope):
        result["scope_conflicts"].append({"issue": "duplicate_scope_entry"})
    applicable = {item.get("role_id") for item in scope if item.get("applicability") == "required" and item.get("reason")}
    result["scope_status"] = "declared_unverified" if set(roles) <= applicable and not result["scope_conflicts"] else "unverified"
    for row in role_records:
        if row["role_id"] in applicable:
            row["applicability"] = "declared_required_unverified"
    for item in evidence.get("source_reads", []):
        source_id = item.get("source_id")
        row = {"source_id": source_id, "kind": item.get("kind"), "trace_ref": item.get("trace_ref"),
               "status": "unverified", "platform_trace_authenticated": False}
        try:
            text = bodies[source_id]
            lines = text.splitlines()
            start, end = item["start_line"], item["end_line"]
            quote = item["quote"]
            if not isinstance(start, int) or not isinstance(end, int) or start < 1 or end < start or end > len(lines):
                raise Rejected("invalid_line_range")
            if not quote or quote != "\n".join(lines[start - 1:end]) or item.get("sha256") != records[source_id].get("sha256"):
                raise Rejected("quote_or_version_not_bound")
            if item.get("kind") not in ("self_report", "external_trace"):
                raise Rejected("unrecognized_read_claim_kind")
            row["status"] = "content_bound_self_report_unverified" if item["kind"] == "self_report" else "content_bound_external_reference_unverified"
            row["quote_sha256"] = sha(quote.encode())
            row["line_range"] = [start, end]
        except (KeyError, TypeError, Rejected) as exc:
            row["reason"] = str(exc)
        result["readback_references"].append(row)
    for item in evidence.get("applications", []):
        if item.get("status") == "planned":
            result["planned_application"].append({"source_id": item.get("source_id"), "status": "planned_unverified"})
            continue
        row = {"source_id": item.get("source_id"), "status": "unverified"}
        try:
            if item["source_id"] not in bodies:
                raise Rejected("unknown_source")
            path = relative(item["artifact_path"])
            if (not path.startswith("sites/rolecraft/") or any(part.startswith(".") for part in PurePosixPath(path).parts)
                    or PurePosixPath(path).suffix.lower() not in {".md", ".json", ".py", ".js", ".mjs", ".ts", ".tsx", ".jsx", ".html", ".css", ".svg", ".txt"}):
                raise Rejected("artifact_outside_explicit_text_scope")
            raw = full_read(project_root, path)
            lines = raw.decode("utf-8").splitlines()
            start, end = item["start_line"], item["end_line"]
            if not isinstance(start, int) or not isinstance(end, int) or start < 1 or end < start or end > len(lines):
                raise Rejected("invalid_artifact_line_range")
            if sha(raw) != item["artifact_sha256"] or not item.get("quote") or item["quote"] != "\n".join(lines[start - 1:end]):
                raise Rejected("artifact_quote_or_hash_mismatch")
            row.update(status="artifact_locator_bound_unreviewed", artifact_path=path, artifact_sha256=sha(raw), line_range=[start, end])
        except (OSError, UnicodeError, KeyError, TypeError, Rejected) as exc:
            row["reason"] = str(exc)
        result["actual_reference_integrity"].append(row)
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--roles", required=True, help="comma-separated original manifest role ids; no all-roles default")
    parser.add_argument("--method-root", help="explicit authorized local override; default uses local-method-source.json only")
    parser.add_argument("--evidence", help="explicit local JSON only; no external trace/log fetching")
    parser.add_argument("--include-content", action="store_true", help="emit ALL selected UTF-8 bodies to stdout, including private method text")
    args = parser.parse_args()
    project_root = Path(__file__).absolute().parents[5]
    try:
        evidence = None
        if args.evidence:
            path = Path(args.evidence).absolute()
            evidence = read_json(path.parent, path.name)
        result = check(project_root, args.roles.split(","), args.method_root, evidence, args.include_content)
        print(json.dumps(result, ensure_ascii=False, sort_keys=True))
        return 2 if result["problems"] else 0
    except (OSError, Rejected, ValueError, KeyError, TypeError, subprocess.CalledProcessError) as exc:
        print(json.dumps({"mode": "read_only_startup_check", "writes": 0, "startup_connection": "not_connected", "reason": str(exc)}, ensure_ascii=False))
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
