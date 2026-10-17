"""Synthetic filesystem tests. No Git repositories, real outputs, or permissions changed."""
import copy
import errno
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import closeout as c

FIXTURES = c.Paths.installed().audit / "fixtures"


class CloseoutTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="author-synthetic-", dir=FIXTURES)
        root = Path(self.temp.name)
        self.paths = c.Paths(root / "project", root / "method", root / "audit")
        for path in (self.paths.project, self.paths.method, self.paths.audit):
            path.mkdir()
        protected = {"project": {}, "method": {}}
        for name, files in (("project", c.PROJECT_FILES), ("method", c.METHOD_FILES)):
            for rel in files:
                path = getattr(self.paths, name) / rel
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text("synthetic protected " + rel)
                protected[name][rel] = c.digest(path)
        self.snapshots = {
            "project": {"head": c.PROJECT_HEAD, "origin": c.ORIGINS["project"], "index_sha256": "a" * 64, "branch": c.BRANCH},
            "method": {"head": c.METHOD_HEAD, "origin": c.ORIGINS["method"], "index_sha256": "b" * 64, "branch": "main"}}
        self.request = {
            "schema_version": 1, "case_id": c.CASE, "event": "closeout.requested",
            "roots": {"project": str(self.paths.project), "method": str(self.paths.method)},
            "baseline": {"project": copy.deepcopy(self.snapshots["project"]),
                         "method": copy.deepcopy(self.snapshots["method"]), "protected": protected},
            "evidence": {"natural_loading": "FAIL/partial", "observation_basis": "parent_observation/local_trace_not_available",
                         "source_versions": [{"source_id": "synthetic", "revision_or_sha256": c.PROJECT_HEAD}],
                         "reading_checklist": [{"source_id": "synthetic", "required": True, "status": "missing",
                                                "trace_ref": None, "summary": "fixture", "application": "not proven", "limitations": "synthetic only"}]},
            "payloads": {"project_md": "# Synthetic\nNatural loading FAIL/partial\n", "project_record": {"kind": "synthetic"},
                         "method_md": "# Synthetic DRAFT\nNot adopted.\n"}}
        self.write_request()

    def tearDown(self):
        self.temp.cleanup()

    def write_request(self):
        raw = c.encoded(self.request)
        (self.paths.audit / "request.json").write_bytes(raw)
        self.request_sha = c.sha(raw)

    def snapshot(self, root):
        return copy.deepcopy(self.snapshots["project" if root == self.paths.project else "method"])

    def engine(self, **kwargs):
        return c.Closeout(self.paths, self.request_sha, snapshot=self.snapshot, **kwargs)

    def tree(self):
        return {str(p.relative_to(Path(self.temp.name))): p.read_bytes()
                for p in Path(self.temp.name).rglob("*") if p.is_file()}

    def test_plan_writes_nothing(self):
        before = self.tree()
        result = self.engine().plan()
        self.assertEqual(result["writes"], 0)
        self.assertEqual(before, self.tree())
        self.assertEqual(result["reading_gate"], "insufficient")

    def test_complete_and_idempotence(self):
        first = self.engine().execute("apply")
        self.assertEqual(first["state"], "complete")
        before = self.tree()
        again = self.engine().execute("apply")
        self.assertTrue(again["idempotent"])
        self.assertEqual(before, self.tree())
        self.assertFalse(self.paths.lock.exists())
        self.assertFalse(list(Path(self.temp.name).rglob("*.tmp")))
        receipt = json.loads(self.paths.target("project_json").read_text())
        self.assertEqual(receipt["method_at_publication"], "not_attempted")
        self.assertEqual(receipt["record_kind"], "project_layer_publication_snapshot")

    def test_mutex_does_not_remove_other_lock(self):
        self.paths.lock.write_text("other writer")
        with self.assertRaises(FileExistsError):
            self.engine().execute("apply")
        self.assertEqual(self.paths.lock.read_text(), "other writer")

    def test_head_drift(self):
        self.snapshots["project"]["head"] = "0" * 40
        with self.assertRaisesRegex(c.Refused, "version_drift"):
            self.engine().execute("apply")
        self.assertFalse(self.paths.target("project_md").exists())
        self.assertFalse(self.paths.lock.exists())

    def test_index_drift(self):
        self.snapshots["method"]["index_sha256"] = "c" * 64
        with self.assertRaisesRegex(c.Refused, "version_drift"):
            self.engine().plan()

    def test_protected_file_drift(self):
        (self.paths.project / "AGENTS.md").write_text("concurrent")
        with self.assertRaisesRegex(c.Refused, "protected_file_drift"):
            self.engine().execute("apply")

    def test_existing_target_never_overwritten(self):
        target = self.paths.target("project_md")
        target.write_text("concurrent author")
        with self.assertRaisesRegex(c.Refused, "target_drift"):
            self.engine().execute("apply")
        self.assertEqual(target.read_text(), "concurrent author")

    def test_request_path_traversal_and_extra_protected_rejected(self):
        self.request["roots"]["project"] += "/../project"
        self.write_request()
        with self.assertRaisesRegex(c.Refused, "roots_must_match"):
            self.engine()
        self.request["roots"]["project"] = str(self.paths.project)
        self.request["baseline"]["protected"]["project"]["../outside"] = "a" * 64
        self.write_request()
        with self.assertRaisesRegex(c.Refused, "whitelist"):
            self.engine()

    def test_target_symlink_rejected(self):
        outside = Path(self.temp.name) / "outside"
        outside.write_text("preserve")
        self.paths.target("project_md").symlink_to(outside)
        with self.assertRaisesRegex(c.Refused, "symlink"):
            self.engine().plan()
        self.assertEqual(outside.read_text(), "preserve")

    def test_ancestor_symlink_rejected(self):
        proposal = self.paths.method / "proposals"
        saved = self.paths.method / "old-proposals"
        proposal.rename(saved)
        proposal.symlink_to(saved, target_is_directory=True)
        with self.assertRaisesRegex(c.Refused, "symlink"):
            self.engine().plan()

    def test_backup_absence_and_readback(self):
        self.engine().execute("apply")
        backup = json.loads((self.paths.audit / "preflight-backup.json").read_text())
        self.assertEqual(backup["original_targets"], {key: None for key in c.OUTPUTS})
        self.assertEqual(backup["request_sha256"], self.request_sha)
        (self.paths.audit / "preflight-backup.json").write_text("concurrent backup")
        with self.assertRaisesRegex(c.Refused, "backup_drift"):
            self.engine().execute("resume")

    def test_second_layer_failure_and_explicit_resume(self):
        original = c.Closeout.publish
        def failing(engine, path, data):
            if path == self.paths.target("method_md"):
                raise OSError(errno.EACCES, "synthetic injected, no permissions changed")
            return original(engine, path, data)
        with patch.object(c.Closeout, "publish", failing):
            result = self.engine().execute("apply")
        self.assertEqual(result["state"], "project_saved_method_pending")
        before_project = {k: self.paths.target(k).read_bytes() for k in ("project_md", "project_json")}
        with self.assertRaisesRegex(c.Refused, "explicit_resume"):
            self.engine().execute("apply")
        self.assertEqual(self.engine().execute("resume")["state"], "complete")
        self.assertEqual(before_project, {k: self.paths.target(k).read_bytes() for k in before_project})

    def test_cancel_and_resume(self):
        engine = self.engine(checkpoint=lambda stage: stage == "before_method_md")
        self.assertEqual(engine.execute("apply")["state"], "cancelled")
        self.assertFalse(self.paths.target("method_md").exists())
        self.assertEqual(self.engine().execute("resume")["state"], "complete")

    def test_explicit_cancel_before_first_output(self):
        self.assertEqual(self.engine().execute("cancel")["state"], "cancelled")
        self.assertTrue(all(not self.paths.target(k).exists() for k in c.OUTPUTS))
        self.assertEqual(self.engine().execute("resume")["state"], "complete")

    def test_resume_refuses_concurrent_method_bytes(self):
        self.engine(checkpoint=lambda stage: stage == "before_method_md").execute("apply")
        target = self.paths.target("method_md")
        target.write_text("outside writer")
        before = self.tree()
        with self.assertRaisesRegex(c.Refused, "target_drift"):
            self.engine().execute("resume")
        self.assertEqual(before, self.tree())
        self.assertEqual(target.read_text(), "outside writer")

    def test_publish_race_does_not_replace(self):
        target = self.paths.target("method_md")
        original_link = c.os.link
        def concurrent(source, destination, **kwargs):
            if destination == target.name:
                target.write_text("racing writer")
            return original_link(source, destination, **kwargs)
        with patch.object(c.os, "link", concurrent):
            result = self.engine().execute("apply")
        self.assertEqual(result["state"], "project_saved_method_pending")
        self.assertEqual(target.read_text(), "racing writer")
        self.assertFalse(Path(str(target) + ".tmp").exists())

    def test_output_published_before_journal_recovers_by_hash(self):
        engine = self.engine()
        original = engine.append
        def interrupted(state, **extra):
            if state == "saved_method_md":
                raise RuntimeError("synthetic interruption")
            return original(state, **extra)
        with patch.object(engine, "append", interrupted):
            with self.assertRaises(RuntimeError):
                engine.execute("apply")
        self.assertTrue(self.paths.target("method_md").exists())
        self.assertEqual(self.engine().execute("resume")["state"], "complete")

    def test_request_hash_and_privacy(self):
        with self.assertRaisesRegex(c.Refused, "request_hash"):
            c.Closeout(self.paths, "0" * 64, snapshot=self.snapshot)
        self.request["payloads"]["project_md"] += " /Users/example/private"
        self.write_request()
        with self.assertRaisesRegex(c.Refused, "privacy"):
            self.engine()

    def test_journal_truncation_not_repaired(self):
        self.engine().execute("cancel")
        journal = self.paths.audit / "run-journal.json"
        raw = journal.read_bytes() + b'{"unfinished":'
        journal.write_bytes(raw)
        with self.assertRaisesRegex(c.Refused, "incomplete_journal"):
            self.engine().execute("resume")
        self.assertEqual(journal.read_bytes(), raw)

    def test_no_reading_understanding_claim_from_trace_string(self):
        row = self.request["evidence"]["reading_checklist"][0]
        row.update(status="actual_read_with_trace", trace_ref="ordinary unverified string")
        self.write_request()
        self.assertEqual(self.engine().plan()["reading_gate"], "insufficient")
        self.request["evidence"]["natural_loading"] = "PASS"
        self.write_request()
        with self.assertRaisesRegex(c.Refused, "contradictory_claim:natural_loading"):
            self.engine()

    def test_published_file_deleted_before_next_layer_never_completes(self):
        def deletion(stage):
            if stage == "before_project_json":
                self.paths.target("project_md").unlink()
            return False
        with self.assertRaisesRegex(c.Refused, "published_target_missing"):
            self.engine(checkpoint=deletion).execute("apply")
        self.assertFalse(self.paths.target("project_md").exists())
        self.assertFalse(self.paths.target("method_md").exists())
        with self.assertRaisesRegex(c.Refused, "published_target_missing"):
            self.engine().execute("resume")

    def test_parent_swap_during_link_leaves_no_external_publication(self):
        target = self.paths.target("method_md")
        outside = Path(self.temp.name) / "moved-proposals"
        original_link = c.os.link
        def swap(source, destination, **kwargs):
            if destination == target.name:
                target.parent.rename(outside)
                target.parent.symlink_to(outside, target_is_directory=True)
            return original_link(source, destination, **kwargs)
        with patch.object(c.os, "link", swap):
            with self.assertRaisesRegex(c.Refused, "directory_binding_changed"):
                self.engine().execute("apply")
        self.assertFalse((outside / target.name).exists())
        self.assertFalse((outside / (target.name + ".tmp")).exists())

    def test_contradictory_nested_structured_claims_rejected(self):
        self.request["payloads"]["project_record"]["nested"] = {
            "natural_loading": "PASS", "formal_method_adopted": True, "growth_awarded": True}
        self.write_request()
        with self.assertRaisesRegex(c.Refused, "contradictory_claim"):
            self.engine()
        self.request["payloads"]["project_record"]["nested"] = {"understanding_verified": True}
        self.write_request()
        with self.assertRaisesRegex(c.Refused, "understanding_claim"):
            self.engine()

    def test_changed_own_inode_content_is_not_deleted_on_readback_failure(self):
        target = self.paths.target("method_md")
        original_link = c.os.link
        def changed(source, destination, **kwargs):
            result = original_link(source, destination, **kwargs)
            if destination == target.name:
                target.write_text("concurrent same inode changed bytes")
            return result
        with patch.object(c.os, "link", changed):
            with self.assertRaisesRegex(c.Refused, "output_readback_failed"):
                self.engine().execute("apply")
        self.assertEqual(target.read_text(), "concurrent same inode changed bytes")
        self.assertEqual(Path(str(target) + ".tmp").read_text(), "concurrent same inode changed bytes")


if __name__ == "__main__":
    unittest.main(verbosity=2)
