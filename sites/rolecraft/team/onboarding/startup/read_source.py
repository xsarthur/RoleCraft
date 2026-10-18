#!/usr/bin/env python3
"""Read one bounded UTF-8 source page; output proves neither prior delivery nor understanding."""
import argparse
import json
import shlex
import subprocess
import sys
from pathlib import Path

import check_startup as c

DEFAULT_PAGE_BYTES = 2048
MAX_PAGE_BYTES = 4096
MAX_SERIALIZED_PAGE_BYTES = 8192
READER = c.BASE + "onboarding/startup/read_source.py"
BOOTSTRAP_SOURCES = (c.BASE + "onboarding/startup/README.md", c.CONFIG, c.LOCATOR)


def source_catalog(project_root, roles=()):
    """Known project inputs plus explicitly selected existing role packages; no arbitrary path."""
    config = c.read_json(project_root, c.CONFIG)
    c.verify_config(config)
    if len(set(roles)) != len(roles) or any(not c.re.fullmatch(r"[a-z0-9-]+", r) for r in roles):
        raise c.Rejected("invalid_explicit_task_roles")
    paths = list(c.PROJECT_SOURCES) + list(BOOTSTRAP_SOURCES)
    if roles:
        core = c.read_json(project_root, c.CORE + "manifest.json")
        v12 = c.read_json(project_root, c.V12 + "manifest.json")
        cores = {row["directory"]: row for row in core.get("employees", [])}
        fallbacks = {row["role_id"]: row for row in v12.get("employees", [])}
        for role in roles:
            if role in cores:
                row = cores[role]
                if row.get("memory_source") != role + "/MEMORY.md" or row.get("schema") != role + "/MEMORY_SCHEMA.md":
                    raise c.Rejected("role_manifest_path_conflict")
                paths.extend(c.CORE + role + "/" + suffix for suffix in ("ROLE.md", "MEMORY.md", "MEMORY_SCHEMA.md"))
            elif role in fallbacks:
                row = fallbacks[role]
                for label, suffix in (("prompt", "prompt.md"), ("onboarding", "onboarding.md")):
                    if row.get(label) != role + "/" + suffix:
                        raise c.Rejected("fallback_manifest_path_conflict")
                    paths.append(c.V12 + role + "/" + suffix)
            elif role == c.RETRIEVAL_ROLE:
                paths.extend(c.RETRIEVAL_FILES)
            else:
                raise c.Rejected("selected_role_not_found_in_existing_sources")
    return {"project": tuple(dict.fromkeys(paths)), "method": c.METHOD_FILES}


def page_ranges(text, limit):
    """Bound raw UTF-8 and JSON-escaped body bytes; never split a code point or lose a long line."""
    if isinstance(limit, bool) or not isinstance(limit, int) or not 256 <= limit <= MAX_PAGE_BYTES:
        raise c.Rejected("page_bytes_must_be_256_to_4096")
    ranges = []
    byte_start = char_start = byte_pos = char_pos = escaped_size = 0
    for char in text:
        cost = len(char.encode("utf-8"))
        escaped = len(json.dumps(char, ensure_ascii=False)[1:-1].encode("utf-8"))
        if byte_pos - byte_start + cost > limit or escaped_size + escaped > limit:
            ranges.append((byte_start, byte_pos, char_start, char_pos))
            byte_start, char_start, escaped_size = byte_pos, char_pos, 0
        byte_pos += cost
        char_pos += 1
        escaped_size += escaped
    if char_pos:
        ranges.append((byte_start, byte_pos, char_start, char_pos))
    return ranges


def read_page(project_root, source_id, page=1, page_bytes=DEFAULT_PAGE_BYTES, roles=(), method_root=None,
              expected_sha256=None, expected_project_head=None, previous_end=None, previous_page_sha256=None,
              repository=c.GitRepository):
    project_root = Path(project_root).absolute()
    catalog = source_catalog(project_root, roles)
    if not isinstance(source_id, str) or ":" not in source_id:
        raise c.Rejected("explicit_source_id_required")
    kind, path = source_id.split(":", 1)
    path = c.relative(path)
    if kind not in catalog or path not in catalog[kind]:
        raise c.Rejected("source_outside_explicit_catalog_or_role_scope")
    project = repository(project_root)
    project_start = project.metadata()
    if expected_project_head is not None and expected_project_head != project_start["head"]:
        raise c.Rejected("project_head_drift")
    method_meta = None
    selection = None
    if kind == "method":
        method_root, selection = c.resolve_method_root(project_root, method_root)
        bodies, method_meta, tree = c.verified_method_bodies(method_root, repository)
        raw = bodies[path]
        binding = "fixed_tree_blob_match"
        source_revision = c.FIXED
    else:
        raw = c.full_read(project_root, path)
        tree = project.tree(project_start["head"])
        entry = tree.get(path)
        if entry:
            if entry["kind"] != "blob" or entry["mode"] not in ("100644", "100755"):
                raise c.Rejected("non_regular_git_entry")
            binding = "HEAD_blob_match" if raw == project.blob(entry["blob"]) else "worktree_dirty_against_HEAD"
        else:
            binding = "worktree_untracked"
        source_revision = project_start["head"]
    digest = c.sha(raw)
    if expected_sha256 is not None and expected_sha256 != digest:
        raise c.Rejected("source_sha256_drift")
    text = raw.decode("utf-8")
    ranges = page_ranges(text, page_bytes)
    if isinstance(page, bool) or not isinstance(page, int) or not 1 <= page <= len(ranges):
        raise c.Rejected("page_out_of_range")
    start, end, char_start, char_end = ranges[page - 1]
    previous_hash = c.sha(raw[ranges[page - 2][0]:ranges[page - 2][1]]) if page > 1 else None
    if page > 1:
        if expected_sha256 is None or expected_project_head is None or previous_end is None or previous_page_sha256 is None:
            raise c.Rejected("continuation_bindings_required")
        if previous_end != start or previous_page_sha256 != previous_hash:
            raise c.Rejected("noncontiguous_previous_page_binding")
    elif previous_end is not None or previous_page_sha256 is not None:
        raise c.Rejected("first_page_must_not_claim_previous_page")
    body = text[char_start:char_end]
    page_hash = c.sha(raw[start:end])
    next_arguments = None
    if page < len(ranges):
        next_arguments = ["python3", "-B", READER, "--source", source_id, "--page", str(page + 1),
                          "--page-bytes", str(page_bytes), "--expected-sha256", digest,
                          "--expected-project-head", project_start["head"], "--previous-end", str(end),
                          "--previous-page-sha256", page_hash]
        if roles:
            next_arguments.extend(["--roles", ",".join(roles)])
        if selection and selection["mode"] == "explicit_cli":
            next_arguments.extend(["--method-root", str(method_root)])
    # Re-read exact selected bytes and repository metadata immediately before emitting.
    root = method_root if kind == "method" else project_root
    if c.full_read(root, path) != raw:
        raise c.Rejected("source_changed_before_page_output")
    if method_meta is not None:
        final_bodies, final_meta, _ = c.verified_method_bodies(method_root, repository)
        if final_meta != method_meta or final_bodies != bodies:
            raise c.Rejected("method_pack_changed_before_page_output")
        if selection["mode"] == "local_locator" and c.sha(c.full_read(project_root, c.LOCATOR)) != selection["locator_sha256"]:
            raise c.Rejected("local_method_locator_changed_before_page_output")
    if project.metadata() != project_start:
        raise c.Rejected("project_version_changed_before_page_output")
    result = {
        "schema_version": 1, "mode": "read_only_source_page", "writes": 0, "source_id": source_id,
        "source_revision": source_revision, "version_binding": binding, "project": project_start,
        "file_sha256": digest, "file_bytes": len(raw), "file_characters": len(text), "file_lines": len(text.splitlines()),
        "page": {"number": page, "total": len(ranges), "body_byte_limit": page_bytes,
                 "byte_start": start, "byte_end": end, "character_start": char_start, "character_end": char_end,
                 "start_line": text.count("\n", 0, char_start) + 1,
                 "end_line": text.count("\n", 0, char_end - 1) + 1,
                 "sha256": page_hash, "previous_page_sha256": previous_hash},
        "coverage": {"interval": "[byte_start,byte_end)", "unit": "utf8_bytes",
                     "previous_end_required": start if page > 1 else None, "next_start": end if page < len(ranges) else None,
                     "complete_file_requires_all_pages": True, "prior_delivery_authenticated": False,
                     "all_pages_consumed": "unverified"},
        "next_arguments": next_arguments, "next_command": shlex.join(next_arguments) if next_arguments else None,
        "content": body, "model_understanding": "unverified", "startup_connection": "not_connected",
        "ownership": "unknown; authorized collaboration reference only", **c.method_adoption_state(),
        "adoption_granted_by_tool": False,
        "serialized_page_byte_limit": MAX_SERIALIZED_PAGE_BYTES,
    }
    if selection:
        result["method_source_selection"] = selection
    # A caller cannot cause an oversized serialized response; never silently cut a page.
    encode_page(result)
    return result


def required_catalog(project_root, roles):
    """All shared baseline bodies are mandatory; roles add sources, never remove the baseline."""
    if not roles:
        raise c.Rejected("required_flow_needs_explicit_task_roles")
    catalog = source_catalog(project_root, roles)
    controls = ["AGENTS.md", *(c.BASE + "onboarding/" + name for name in (
        "README.md", "ROLE-MAPPING.md", "TEAM-ROUTING.md", "APPLICATION-NOTES.md",
        "TASK-LAYOUT3-READING-DIALOGUE.md")), *BOOTSTRAP_SOURCES,
        c.CORE + "README.md", c.CORE + "manifest.json", c.V12 + "manifest.json",
        c.CORE + "user-profile/approved-preferences.md"]
    supplements = [path for path in catalog["project"] if path not in controls and path not in c.LATEST_RECORDS]
    ordered = controls + supplements + list(c.LATEST_RECORDS)
    if len(ordered) != len(set(ordered)) or set(ordered) != set(catalog["project"]):
        raise c.Rejected("required_flow_catalog_coverage_conflict")
    return ["project:" + path for path in ordered] + ["method:" + path for path in catalog["method"]]


def required_plan(project_root, roles, page_bytes, method_root, repository):
    """Read only in memory. The digest binds current inputs, not previous tool delivery."""
    project_root = Path(project_root).absolute()
    source_ids = required_catalog(project_root, roles)
    project = repository(project_root)
    meta = project.metadata()
    root, selection = c.resolve_method_root(project_root, method_root)
    methods, method_meta, _ = c.verified_method_bodies(root, repository)
    items, pages = [], []
    for source_id in source_ids:
        kind, path = source_id.split(":", 1)
        raw = methods[path] if kind == "method" else c.full_read(project_root, path)
        text = raw.decode("utf-8")
        ranges = page_ranges(text, page_bytes)
        items.append({"source_id": source_id, "sha256": c.sha(raw), "bytes": len(raw), "pages": len(ranges)})
        for page_number, (start, end, _, _) in enumerate(ranges, 1):
            pages.append({"source_id": source_id, "source_number": len(items), "page": page_number,
                          "sha256": c.sha(raw[start:end]), "end": end})
    descriptor = {"schema_version": 1, "roles": list(roles), "page_bytes": page_bytes,
                  "project": meta, "method": method_meta, "method_selection": selection,
                  "sources": items,
                  "reader_sha256": c.sha(c.full_read(project_root, READER)),
                  "checker_sha256": c.sha(c.full_read(project_root, c.BASE + "onboarding/startup/check_startup.py"))}
    if project.metadata() != meta:
        raise c.Rejected("project_version_changed_during_flow_plan")
    digest = c.sha(json.dumps(descriptor, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode())
    return descriptor, pages, digest


def flow_position_sha256(plan_sha256, step, page):
    return c.sha(json.dumps({"plan_sha256": plan_sha256, "step": step, "page": page},
                            sort_keys=True, separators=(",", ":")).encode())


def read_required_page(project_root, roles, step=1, page_bytes=DEFAULT_PAGE_BYTES, method_root=None,
                       flow_sha256=None, previous_flow_page_sha256=None, repository=c.GitRepository):
    """One page and its cross-source next command. Stateless bindings are untrusted bookkeeping."""
    descriptor, pages, digest = required_plan(project_root, roles, page_bytes, method_root, repository)
    if isinstance(step, bool) or not isinstance(step, int) or not 1 <= step <= len(pages):
        raise c.Rejected("required_flow_step_out_of_range")
    if step == 1:
        if flow_sha256 is not None or previous_flow_page_sha256 is not None:
            raise c.Rejected("required_flow_first_step_must_not_claim_previous")
    else:
        if flow_sha256 is None or previous_flow_page_sha256 is None:
            raise c.Rejected("required_flow_continuation_bindings_required")
        if flow_sha256 != digest:
            raise c.Rejected("required_flow_inputs_or_roles_drift")
        if previous_flow_page_sha256 != flow_position_sha256(digest, step - 1, pages[step - 2]):
            raise c.Rejected("required_flow_noncontiguous_previous_page")
    current = pages[step - 1]
    source = descriptor["sources"][current["source_number"] - 1]
    previous = pages[step - 2] if current["page"] > 1 else None
    result = read_page(project_root, current["source_id"], current["page"], page_bytes, roles, method_root,
                       source["sha256"], descriptor["project"]["head"],
                       previous["end"] if previous else None, previous["sha256"] if previous else None, repository)
    _, final_pages, final_digest = required_plan(project_root, roles, page_bytes, method_root, repository)
    if final_digest != digest or final_pages != pages:
        raise c.Rejected("required_flow_inputs_changed_before_output")
    arguments = None
    if step < len(pages):
        arguments = ["python3", "-B", READER, "--required-flow", "--roles", ",".join(roles),
                     "--step", str(step + 1), "--page-bytes", str(page_bytes), "--flow-sha256", digest,
                     "--previous-flow-page-sha256", flow_position_sha256(digest, step, current)]
        if method_root is not None:
            arguments.extend(["--method-root", str(method_root)])
    result.update(mode="read_only_required_flow_page", next_arguments=arguments,
                  next_command=shlex.join(arguments) if arguments else None)
    result["required_flow"] = {
        "plan_sha256": digest, "position_sha256": flow_position_sha256(digest, step, current),
        "selected_roles": list(roles), "sources_total": len(descriptor["sources"]),
        "source_number": current["source_number"], "step": step, "steps_total": len(pages),
        "pages_after_this": len(pages) - step,
        "next_source_id": pages[step]["source_id"] if step < len(pages) else None,
        "position_only_not_received_count": True, "prior_delivery_authenticated": False,
        "all_required_bodies_received": "unverified", "model_understanding": "unverified",
        "continuation": "untrusted consistency parameters; reproducible by caller, not signed delivery evidence",
        "after_page": "Consume this content, then execute next_command separately. At queue end independently verify actual full delivery before business."
    }
    encode_page(result)
    return result


def encode_page(result):
    output = json.dumps(result, ensure_ascii=False, separators=(",", ":"))
    if len(output.encode("utf-8")) + 1 > MAX_SERIALIZED_PAGE_BYTES:
        raise c.Rejected("serialized_page_exceeds_safe_output_budget")
    return output


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    action = parser.add_mutually_exclusive_group(required=True)
    action.add_argument("--source", help="exact project: or method: source_id from --list")
    action.add_argument("--list", action="store_true", help="list controlled source ids without reading their bodies")
    action.add_argument("--required-flow", action="store_true", help="normal startup: all baseline bodies plus selected roles, one bounded page and next command")
    parser.add_argument("--roles", help="explicit necessary original role ids; only needed for role source ids")
    parser.add_argument("--method-root", help="explicit authorized override; default reads the local locator")
    parser.add_argument("--page", type=int, default=1)
    parser.add_argument("--page-bytes", type=int, default=DEFAULT_PAGE_BYTES)
    parser.add_argument("--expected-sha256")
    parser.add_argument("--expected-project-head")
    parser.add_argument("--previous-end", type=int)
    parser.add_argument("--previous-page-sha256")
    parser.add_argument("--step", type=int, default=1)
    parser.add_argument("--flow-sha256")
    parser.add_argument("--previous-flow-page-sha256")
    args = parser.parse_args()
    project_root = Path(__file__).absolute().parents[5]
    roles = tuple(args.roles.split(",")) if args.roles else ()
    try:
        page_bindings = (args.expected_sha256, args.expected_project_head, args.previous_end, args.previous_page_sha256)
        if args.required_flow and (args.page != 1 or any(value is not None for value in page_bindings)):
            raise c.Rejected("individual_page_flags_not_required_flow")
        if not args.required_flow and (args.step != 1 or args.flow_sha256 is not None or args.previous_flow_page_sha256 is not None):
            raise c.Rejected("flow_flags_require_required_flow_mode")
        if args.list:
            catalog = source_catalog(project_root, roles)
            result = {"mode": "read_only_source_catalog", "writes": 0,
                      "source_ids": [kind + ":" + path for kind, paths in catalog.items() for path in paths],
                      "availability": "unverified; this lists ids only", "selected_roles": list(roles),
                      "method_locator": c.LOCATOR, "startup_connection": "not_connected",
                      "normal_body_reading": "--required-flow --roles " + ",".join(roles) if roles else "--required-flow --roles ACTUAL_ROLE"}
            print(json.dumps(result, ensure_ascii=False))
        elif args.required_flow:
            result = read_required_page(project_root, roles, args.step, args.page_bytes, args.method_root,
                                        args.flow_sha256, args.previous_flow_page_sha256)
            print(encode_page(result))
        else:
            result = read_page(project_root, args.source, args.page, args.page_bytes, roles, args.method_root,
                               args.expected_sha256, args.expected_project_head, args.previous_end, args.previous_page_sha256)
            print(encode_page(result))
        return 0
    except (OSError, c.Rejected, ValueError, KeyError, TypeError, subprocess.CalledProcessError) as exc:
        print(json.dumps({"mode": "read_only_source_page", "writes": 0, "status": "blocked",
                          "startup_connection": "not_connected", "reason": str(exc)}, ensure_ascii=False))
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
