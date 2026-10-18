"""Synthetic read-only startup tests; fixture setup alone writes, never Git init/clone."""
import copy
import json
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

import check_startup as c

FIXTURES = Path(tempfile.gettempdir()).resolve()


class StartupFixture(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="author-synthetic-", dir=FIXTURES)
        self.root = Path(self.temp.name)
        self.project, self.method = self.root / "project", self.root / "method"
        self.project.mkdir()
        self.method.mkdir()
        locator = json.loads((Path(__file__).parent / "local-method-source.json").read_text())
        locator["local_root"] = str(self.method)
        self.write(self.project, c.LOCATOR, json.dumps(locator))
        self.config = json.loads((Path(__file__).parent / "sources.json").read_text())
        self.write(self.project, c.CONFIG, json.dumps(self.config))
        for rel in c.PROJECT_SOURCES:
            self.write(self.project, rel, "# Synthetic source\nSecond line meaning.\n")
        core = {"employees": [{"directory": role, "memory_source": role + "/MEMORY.md", "schema": role + "/MEMORY_SCHEMA.md"}
                              for role in ("project-manager", "qa-engineer")]}
        v12 = {"employees": [{"role_id": "backend-data-engineer", "prompt": "backend-data-engineer/prompt.md",
                              "onboarding": "backend-data-engineer/onboarding.md"}]}
        self.write(self.project, c.CORE + "manifest.json", json.dumps(core))
        self.write(self.project, c.V12 + "manifest.json", json.dumps(v12))
        for role in ("project-manager", "qa-engineer"):
            for file in ("ROLE.md", "MEMORY.md", "MEMORY_SCHEMA.md"):
                self.write(self.project, c.CORE + role + "/" + file, "# " + role + "\nReal fixture body.\n")
        for file in ("prompt.md", "onboarding.md"):
            self.write(self.project, c.V12 + "backend-data-engineer/" + file, "# Backend original fallback fixture\n")
        for rel in c.RETRIEVAL_FILES:
            self.write(self.project, rel, "# Original retrieval specialist identity and handoff fixture\n")
        for rel in (c.BASE + "onboarding/startup/README.md", c.BASE + "onboarding/startup/read_source.py",
                    c.BASE + "onboarding/startup/check_startup.py"):
            self.write(self.project, rel, "# Synthetic workflow input\n")
        for rel in c.METHOD_FILES:
            self.write(self.method, rel, "# Synthetic method " + rel + "\nFull method fixture body.\n")
        self.metadata = {"project": {"head": "3" * 40, "origin": "git@github.com:xsarthur/RoleCraft.git", "branch": "synthetic"},
                         "method": {"head": c.FIXED, "origin": c.ORIGIN, "branch": "main"}}
        self.blobs = {}
        self.trees = {}
        for name, root in (("project", self.project), ("method", self.method)):
            self.trees[name] = {}
            for path in root.rglob("*"):
                if path.is_file():
                    raw = path.read_bytes()
                    key = c.sha(raw)
                    self.blobs[key] = raw
                    self.trees[name][path.relative_to(root).as_posix()] = {"mode": "100644", "kind": "blob", "blob": key}
        outer = self
        class FakeRepository:
            def __init__(self, root):
                self.name = "project" if root == outer.project else "method"
            def metadata(self):
                return copy.deepcopy(outer.metadata[self.name])
            def tree(self, revision):
                return copy.deepcopy(outer.trees[self.name])
            def blob(self, object_id):
                return outer.blobs[object_id]
        self.provider = FakeRepository

    def tearDown(self):
        self.temp.cleanup()

    def write(self, root, rel, text):
        path = root / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text)

    def run_check(self, roles=None, evidence=None, include=False):
        return c.check(self.project, ["project-manager"] if roles is None else roles, self.method,
                       evidence, include, self.provider)

    def tree_snapshot(self):
        return {p.relative_to(self.root).as_posix(): (p.read_bytes(), p.stat().st_mtime_ns)
                for p in self.root.rglob("*") if p.is_file()}

    def evidence(self, kind="self_report"):
        rel = c.CORE + "project-manager/ROLE.md"
        raw = (self.project / rel).read_bytes()
        return {"schema_version": 1, "task_id": "synthetic",
                "role_scope": [{"role_id": "project-manager", "applicability": "required", "reason": "fixture scope"}],
                "source_reads": [{"source_id": "project:" + rel, "kind": kind, "trace_ref": "ordinary-string-not-authenticated",
                                  "sha256": c.sha(raw), "start_line": 1, "end_line": 1, "quote": raw.decode().splitlines()[0],
                                  "summary": "fixture", "application": "planned"}]}


class StartupTests(StartupFixture):
    def test_no_roles_does_not_default_all(self):
        with self.assertRaisesRegex(c.Rejected, "explicit_distinct"):
            self.run_check(roles=[])

    def test_zero_writes_and_only_selected_role(self):
        before = self.tree_snapshot()
        result = self.run_check()
        self.assertEqual(before, self.tree_snapshot())
        self.assertEqual(result["writes"], 0)
        self.assertEqual([row["role_id"] for row in result["roles"]], ["project-manager"])
        self.assertFalse(any("qa-engineer/" in row["path"] for row in result["sources"]))

    def test_default_no_content_not_agent_readback(self):
        result = self.run_check()
        self.assertTrue(all("content" not in row for row in result["sources"]))
        self.assertEqual(result["startup_connection"], "not_connected")
        self.assertEqual(result["model_understanding"], "unverified")
        self.assertEqual(result["evidence"]["scope_status"], "unverified")

    def test_include_content_complete_no_silent_truncation(self):
        huge = "# 完整正文\n" + ("完整多字节内容\n" * 30000)
        path = "methods.md"
        self.write(self.method, path, huge)
        key = c.sha(huge.encode())
        self.blobs[key] = huge.encode()
        self.trees["method"][path]["blob"] = key
        before = self.tree_snapshot()
        result = self.run_check(include=True)
        self.assertEqual(before, self.tree_snapshot())
        method_rows = [row for row in result["sources"] if row["source_id"].startswith("method:")]
        self.assertEqual(len(method_rows), 10)
        for row in method_rows:
            self.assertEqual(row["content"], (self.method / row["path"]).read_text())
            self.assertEqual(row["bytes_read"], len(row["content"].encode()))
        self.assertEqual(result["method"]["status"], "fixed_tree_full_content_read")

    def test_missing_schema_separate_from_readable_role_material(self):
        (self.project / (c.CORE + "project-manager/MEMORY_SCHEMA.md")).unlink()
        result = self.run_check()
        self.assertTrue(result["readability"]["role_material_readable"])
        self.assertEqual(result["roles"][0]["original_long_term_memory"], "partial")
        self.assertFalse(any("MEMORY_SCHEMA" in p.get("source_id", "") for p in result["problems"]))

    def test_v12_fallback_not_original_triplet(self):
        result = self.run_check(["backend-data-engineer"])
        row = result["roles"][0]
        self.assertEqual(set(row["required_package"].values()), {"missing_original_package"})
        self.assertEqual(len(row["fallback_sources"]), 2)
        self.assertTrue(row["role_material_readable"])
        self.assertEqual(row["original_long_term_memory"], "missing")
        self.assertFalse(any(p["issue"] == "missing_original_package" for p in result["problems"]))
        self.assertEqual(result["startup_connection"], "not_connected")

    def test_retrieval_selected_reads_only_two_existing_specialist_sources(self):
        result = self.run_check([c.RETRIEVAL_ROLE])
        row = result["roles"][0]
        self.assertTrue(row["role_material_readable"])
        self.assertEqual(row["original_long_term_memory"], "missing")
        self.assertEqual(set(row["fallback_sources"]), {"project:" + p for p in c.RETRIEVAL_FILES})
        self.assertEqual(set(row["required_package"].values()), {"missing_original_package"})
        default = self.run_check()
        self.assertFalse(any(r["path"] in c.RETRIEVAL_FILES for r in default["sources"]))

    def test_unreadable_specialist_material_is_still_a_mechanical_gap(self):
        (self.project / c.RETRIEVAL_FILES[1]).unlink()
        result = self.run_check([c.RETRIEVAL_ROLE])
        self.assertFalse(result["readability"]["role_material_readable"])
        self.assertTrue(any(p["issue"] == "role_material_unavailable" for p in result["problems"]))

    def test_four_readability_facts_are_separate(self):
        result = self.run_check(["project-manager", "backend-data-engineer"])
        facts = result["readability"]
        self.assertTrue(facts["role_material_readable"])
        self.assertEqual(facts["original_long_term_memory"], {"project-manager": "available", "backend-data-engineer": "missing"})
        self.assertTrue(facts["shared_method_readable"])
        self.assertTrue(facts["project_latest_records_readable"])
        self.assertEqual(result["model_understanding"], "unverified")

    def test_source_role_selection_cannot_claim_employee_ownership_or_management(self):
        evidence = self.evidence()
        evidence["verified_user_owned_employees"] = ["project-manager"]
        evidence["role_scope"][0].update(ownership="user_owned", management_actions="promote")
        before = self.tree_snapshot()
        result = self.run_check(evidence=evidence)
        self.assertEqual(before, self.tree_snapshot())
        self.assertEqual(result["verified_user_owned_employees"], [])
        self.assertEqual(result["shared_method_scope"], "shared_method_support_pool_not_employee_identity")
        row = result["roles"][0]
        self.assertEqual(row["source_team"], "original_project_team")
        self.assertEqual(row["ownership"], "unknown")
        self.assertEqual(row["use"], "authorized_collaboration_reference_only")
        self.assertEqual(row["management_actions"], "none")

    def test_unknown_role_missing_no_identity_created(self):
        result = self.run_check(["unknown-specialist"])
        self.assertEqual(result["roles"][0]["package_status"], "role_not_found_in_manifests")

    def test_wrong_method_revision_no_body_pass(self):
        self.metadata["method"]["head"] = "0" * 40
        result = self.run_check()
        self.assertEqual(result["method"]["status"], "blocked")
        self.assertFalse(any(row["source_id"].startswith("method:") for row in result["sources"]))

    def test_wrong_method_origin(self):
        self.metadata["method"]["origin"] = "git@github.com:other/repo.git"
        self.assertEqual(self.run_check()["method"]["status"], "blocked")

    def test_dirty_method_body_rejected_against_actual_blob(self):
        self.write(self.method, "methods.md", "changed local body\n")
        result = self.run_check()
        self.assertEqual(result["method"]["status"], "blocked")
        row = next(r for r in result["sources"] if r["source_id"] == "method:methods.md")
        self.assertEqual(row["version_binding"], "worktree_dirty_against_HEAD")

    def test_missing_tracked_method_set(self):
        del self.trees["method"]["roles.md"]
        self.assertEqual(self.run_check()["method"]["status"], "blocked")

    def test_proposals_are_not_formal_method_sources(self):
        self.write(self.method, "proposals/private.md", "do not read proposal as fixed method\n")
        result = self.run_check(include=True)
        self.assertFalse(any("proposals" in row["path"] for row in result["sources"]))

    def test_source_symlink_is_not_followed(self):
        target = self.project / "AGENTS.md"
        target.unlink()
        other = self.root / "not-authorized-body"
        other.write_text("outside private source")
        target.symlink_to(other)
        result = self.run_check(include=True)
        row = next(r for r in result["sources"] if r["source_id"] == "project:AGENTS.md")
        self.assertFalse(row["checker_content_read"])
        self.assertNotIn("content", row)

    def test_ancestor_symlink_rejected(self):
        old = self.root / "old-method"
        self.method.rename(old)
        self.method.symlink_to(old, target_is_directory=True)
        self.assertEqual(self.run_check()["method"]["status"], "blocked")

    def test_required_not_in_CLI_and_selected_NA_scope_conflicts(self):
        evidence = self.evidence()
        evidence["role_scope"] = [{"role_id": "qa-engineer", "applicability": "required", "reason": "needed"},
                                  {"role_id": "project-manager", "applicability": "not_applicable", "reason": "skip"}]
        result = self.run_check(evidence=evidence)
        self.assertEqual(len(result["evidence"]["scope_conflicts"]), 2)
        self.assertTrue(any(p["issue"] == "role_scope_conflict" for p in result["problems"]))

    def test_hash_only_without_quote_not_content_bound(self):
        evidence = self.evidence()
        del evidence["source_reads"][0]["quote"]
        row = self.run_check(evidence=evidence)["evidence"]["readback_references"][0]
        self.assertEqual(row["status"], "unverified")

    def test_wrong_quote_or_version_not_content_bound(self):
        for field, value in (("quote", "fabricated"), ("sha256", "0" * 64)):
            evidence = self.evidence()
            evidence["source_reads"][0][field] = value
            row = self.run_check(evidence=evidence)["evidence"]["readback_references"][0]
            self.assertEqual(row["status"], "unverified")

    def test_content_bound_self_report_still_unverified(self):
        result = self.run_check(evidence=self.evidence())
        row = result["evidence"]["readback_references"][0]
        self.assertEqual(row["status"], "content_bound_self_report_unverified")
        self.assertFalse(row["platform_trace_authenticated"])
        self.assertEqual(result["startup_connection"], "not_connected")

    def test_external_trace_string_not_authenticated(self):
        row = self.run_check(evidence=self.evidence("external_trace"))["evidence"]["readback_references"][0]
        self.assertEqual(row["status"], "content_bound_external_reference_unverified")
        self.assertFalse(row["platform_trace_authenticated"])

    def test_planned_and_actual_application_separate(self):
        evidence = self.evidence()
        artifact = c.BASE + "explicit-artifact.md"
        text = "# Actual synthetic artifact\nSecond line.\n"
        self.write(self.project, artifact, text)
        source = evidence["source_reads"][0]["source_id"]
        evidence["applications"] = [{"source_id": source, "status": "planned"},
                                    {"source_id": source, "status": "actual", "artifact_path": artifact,
                                     "artifact_sha256": c.sha(text.encode()), "start_line": 1, "end_line": 1,
                                     "quote": text.splitlines()[0]}]
        result = self.run_check(evidence=evidence)["evidence"]
        self.assertEqual(result["planned_application"][0]["status"], "planned_unverified")
        self.assertEqual(result["actual_reference_integrity"][0]["status"], "artifact_locator_bound_unreviewed")
        self.assertEqual(result["application_quality"], "unverified")

    def test_unsafe_or_nontext_artifact_not_read(self):
        for path in ("../outside.md", "sites/personal-website/team-closeout.md", "sites/rolecraft/.env",
                     "sites/rolecraft/accounts.db", "sites/rolecraft/.aws/config.json"):
            evidence = self.evidence()
            evidence["applications"] = [{"source_id": evidence["source_reads"][0]["source_id"], "artifact_path": path,
                                         "artifact_sha256": "0" * 64, "start_line": 1, "end_line": 1, "quote": "x"}]
            self.assertEqual(self.run_check(evidence=evidence)["evidence"]["actual_reference_integrity"][0]["status"], "unverified")

    def test_untracked_record_and_dirty_source_own_hash(self):
        path = c.BASE + "task-closeout-20261017.json"
        del self.trees["project"][path]
        self.write(self.project, "AGENTS.md", "actual changed text\n")
        result = self.run_check()
        rows = {r["path"]: r for r in result["sources"] if r["source_id"].startswith("project:")}
        self.assertEqual(rows[path]["version_binding"], "worktree_untracked")
        self.assertEqual(rows["AGENTS.md"]["version_binding"], "worktree_dirty_against_HEAD")
        self.assertEqual(rows["AGENTS.md"]["sha256"], c.sha(b"actual changed text\n"))

    def test_future_closeout_record_is_uncovered_not_silently_latest(self):
        rel = c.BASE + "task-closeout-20261018.md"
        self.write(self.project, rel, "not selected, do not read body\n")
        result = self.run_check(include=True)
        self.assertEqual(result["uncovered_project_records"], [rel])
        self.assertFalse(any(row["path"] == rel for row in result["sources"]))
        self.assertEqual(result["mechanical_readiness"], "partial")

    def test_reference_metadata_and_legacy_absolute_not_followed(self):
        self.write(self.project, "AGENTS.md", "[missing](missing.md) [old](/private/person.md) [web](https://example.com)\n")
        report = self.run_check()["reference_integrity"]
        self.assertEqual(report["broken_or_unsafe"], 1)
        self.assertEqual(report["legacy_absolute_not_followed"], 1)
        self.assertEqual(report["external_not_fetched"], 1)

    def test_markdown_fence_examples_excluded_but_prose_links_still_checked(self):
        text = "```markdown\n[example](example-only-missing.md)\n```\n[valid](AGENTS.md)\n[broken](real-missing.md)\n"
        links = c.local_links(text, "AGENTS.md", self.project, {"AGENTS.md"})
        self.assertEqual([link["target"] for link in links], ["AGENTS.md", "real-missing.md"])
        self.assertEqual(links[0]["status"], "local_target_exists")
        self.assertEqual(links[1]["status"], "broken_or_unsafe")

    def test_tilde_fence_requires_same_character_and_sufficient_closing_length(self):
        text = "~~~~markdown\n[one](example-one.md)\n```\n[two](example-two.md)\n~~~\n[three](example-three.md)\n~~~~~  \n[valid](AGENTS.md)\n"
        links = c.local_links(text, "AGENTS.md", self.project, {"AGENTS.md"})
        self.assertEqual([link["target"] for link in links], ["AGENTS.md"])

    def test_backtick_fence_length_trailing_text_and_unclosed_block(self):
        text = "````python\n[one](example-one.md)\n```\n[two](example-two.md)\n```` trailing\n[three](example-three.md)\n`````\n[valid](AGENTS.md)\n~~~markdown\n[unclosed](example-four.md)\n"
        links = c.local_links(text, "AGENTS.md", self.project, {"AGENTS.md"})
        self.assertEqual([link["target"] for link in links], ["AGENTS.md"])

    def test_fence_indentation_and_invalid_backtick_info_do_not_hide_prose(self):
        valid = "   ~~~markdown\n[example](example-only.md)\n   ~~~\n[valid](AGENTS.md)\n"
        self.assertEqual([r["target"] for r in c.local_links(valid, "AGENTS.md", self.project, set())], ["AGENTS.md"])
        invalid = "```invalid`info\n[broken](still-real-missing.md)\n"
        links = c.local_links(invalid, "AGENTS.md", self.project, set())
        self.assertEqual(links[0]["target"], "still-real-missing.md")
        self.assertEqual(links[0]["status"], "broken_or_unsafe")

    def test_record_scope_is_known_frozen_set_not_permanent_latest_discovery(self):
        result = self.run_check()
        self.assertEqual(len(result["record_scope"]["records"]), 8)
        self.assertFalse(result["record_scope"]["validation_directory_autodiscovery"])
        self.assertEqual(result["record_scope"]["status"], "explicit_frozen_known_record_set_only")

    def test_config_cannot_omit_latest_required_records(self):
        self.config["project_sources"].remove(c.BASE + "task-closeout-20261017.json")
        self.write(self.project, c.CONFIG, json.dumps(self.config))
        with self.assertRaisesRegex(c.Rejected, "whitelist"):
            self.run_check()

    def test_git_replace_view_disabled_for_tree_and_blob_processes(self):
        original_id, replacement_id = "a" * 40, "b" * 40
        calls = []
        def injected(command, **kwargs):
            disabled = kwargs["env"].get("GIT_NO_REPLACE_OBJECTS") == "1"
            calls.append((command, kwargs["env"].copy()))
            if "ls-tree" in command:
                object_id = original_id if disabled else replacement_id
                return SimpleNamespace(stdout=("100644 blob " + object_id + "\tmethods.md\0").encode())
            if "cat-file" in command:
                return SimpleNamespace(stdout=b"original fixed method\n" if disabled else b"replacement method\n")
            raise AssertionError("unexpected subprocess call")
        with patch.dict(c.os.environ, {"GIT_NO_REPLACE_OBJECTS": "0"}), patch.object(c.subprocess, "run", side_effect=injected):
            repo = c.GitRepository(self.method)
            entries = repo.tree(c.FIXED)
            raw = repo.blob(entries["methods.md"]["blob"])
        self.assertEqual(entries["methods.md"]["blob"], original_id)
        self.assertEqual(raw, b"original fixed method\n")
        self.assertEqual(len(calls), 2)
        self.assertTrue(all(env["GIT_NO_REPLACE_OBJECTS"] == "1" and env["GIT_OPTIONAL_LOCKS"] == "0" for _, env in calls))


if __name__ == "__main__":
    unittest.main(verbosity=2)
