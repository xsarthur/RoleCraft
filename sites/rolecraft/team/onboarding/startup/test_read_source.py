"""Synthetic locator/page regressions; no real method body is copied or persisted."""
import json
import unittest
from unittest.mock import patch

import check_startup as c
import read_source as p
from test_check_startup import StartupFixture


class PageTests(StartupFixture):
    def page(self, source="project:AGENTS.md", **kwargs):
        return p.read_page(self.project, source, repository=self.provider, **kwargs)

    def change_method(self, path, text):
        self.write(self.method, path, text)
        raw = text.encode()
        key = c.sha(raw)
        self.blobs[key] = raw
        self.trees["method"][path]["blob"] = key

    def test_default_locator_gets_fixed_method_without_cli_root(self):
        before = self.tree_snapshot()
        result = c.check(self.project, ["project-manager"], repository=self.provider)
        self.assertEqual(result["method"]["status"], "fixed_tree_full_content_read")
        self.assertEqual(result["method"]["source_selection"]["mode"], "local_locator")
        self.assertEqual(before, self.tree_snapshot())
        self.assertFalse(any("content" in row for row in result["sources"]))

    def test_missing_locator_no_guess_or_fallback(self):
        (self.project / c.LOCATOR).unlink()
        result = c.check(self.project, ["project-manager"], repository=self.provider)
        self.assertEqual(result["method"]["status"], "blocked")
        self.assertFalse(any(row["source_id"].startswith("method:") for row in result["sources"]))

    def test_wrong_locator_revision_origin_network_or_scope_blocked(self):
        original = c.read_json(self.project, c.LOCATOR)
        for key, value in (("revision", "0" * 40), ("origin", "wrong"), ("network", "fetch"),
                           ("binding_scope", "all_projects"), ("local_root", "../method")):
            with self.subTest(key=key):
                edited = dict(original, **{key: value})
                self.write(self.project, c.LOCATOR, json.dumps(edited))
                result = c.check(self.project, ["project-manager"], repository=self.provider)
                self.assertEqual(result["method"]["status"], "blocked")

    def test_nonobject_locator_is_blocked_and_governance_bootstrap_still_reads(self):
        for value in ([], None, "string", 7, False):
            with self.subTest(value=value):
                self.write(self.project, c.LOCATOR, json.dumps(value))
                result = c.check(self.project, ["project-manager"], repository=self.provider)
                self.assertEqual(result["method"]["status"], "blocked")
                self.assertIn("invalid_local_method_locator_object", result["method"]["reason"])
                self.assertFalse(any(row["source_id"].startswith("method:") for row in result["sources"]))
                with self.assertRaisesRegex(c.Rejected, "locator_object"):
                    self.page("method:README.md")
                self.assertTrue(self.page()["content"])

    def test_explicit_root_remains_compatible_without_locator(self):
        (self.project / c.LOCATOR).unlink()
        result = self.run_check(include=True)
        self.assertEqual(result["method"]["status"], "fixed_tree_full_content_read")
        self.assertEqual(result["method"]["source_selection"]["mode"], "explicit_cli")
        self.assertTrue(all("content" in row for row in result["sources"]))

    def test_bootstrap_AGENTS_requires_neither_roles_nor_method_source(self):
        (self.project / c.LOCATOR).unlink()
        self.metadata["method"]["head"] = "0" * 40
        result = self.page()
        self.assertEqual(result["content"], (self.project / "AGENTS.md").read_text())
        self.assertNotIn("method_source_selection", result)
        self.assertEqual(result["startup_connection"], "not_connected")

    def test_project_catalog_has_previous_trial_and_all_four_older_records(self):
        catalog = p.source_catalog(self.project)
        self.assertTrue(set(c.LATEST_RECORDS) <= set(catalog["project"]))
        self.assertEqual(len(c.LATEST_RECORDS), 8)
        self.assertFalse(any("project-manager/ROLE" in s for s in catalog["project"]))

    def test_latest_trial_cannot_be_omitted_from_config(self):
        self.config["project_sources"].remove(c.PRIOR_VALIDATION + "validation-receipt.json")
        self.write(self.project, c.CONFIG, json.dumps(self.config))
        with self.assertRaisesRegex(c.Rejected, "whitelist"):
            self.page()

    def test_only_selected_existing_role_paths_are_readable(self):
        source = "project:" + c.CORE + "project-manager/ROLE.md"
        with self.assertRaisesRegex(c.Rejected, "scope"):
            self.page(source)
        result = self.page(source, roles=("project-manager",))
        self.assertEqual(result["content"], (self.project / c.CORE / "project-manager/ROLE.md").read_text())
        for source in ("project:../outside.md", "project:.git/config", "method:proposals/private.md", "project:sites/personal-website/a.md"):
            with self.subTest(source=source), self.assertRaises(c.Rejected):
                self.page(source)

    def test_long_single_line_multibyte_and_json_control_text_complete_without_gap(self):
        text = '超长单行😀é' * 1000 + '\t\x00"\\' * 400 + '\n末行。\n'
        self.write(self.project, "AGENTS.md", text)
        before = self.tree_snapshot()
        result = self.page(page_bytes=512)
        pages = [result]
        while result["next_arguments"]:
            page = result["page"]
            result = self.page(page=page["number"] + 1, page_bytes=512,
                               expected_sha256=result["file_sha256"], expected_project_head=result["project"]["head"],
                               previous_end=page["byte_end"], previous_page_sha256=page["sha256"])
            pages.append(result)
        self.assertEqual("".join(row["content"] for row in pages), text)
        self.assertGreater(len(pages), 10)
        cursor = 0
        for index, row in enumerate(pages, 1):
            page = row["page"]
            self.assertEqual(page["number"], index)
            self.assertEqual(page["total"], len(pages))
            self.assertEqual(page["byte_start"], cursor)
            self.assertLessEqual(len(row["content"].encode()), 512)
            self.assertEqual(page["sha256"], c.sha(row["content"].encode()))
            self.assertLessEqual(len(p.encode_page(row).encode()) + 1, p.MAX_SERIALIZED_PAGE_BYTES)
            self.assertFalse(row["coverage"]["prior_delivery_authenticated"])
            cursor = page["byte_end"]
        self.assertEqual(cursor, len(text.encode()))
        self.assertIsNone(pages[-1]["next_command"])
        self.assertEqual(before, self.tree_snapshot())

    def test_page_parameters_out_of_range_rejected(self):
        for kwargs in ({"page":0}, {"page":2}, {"page":True}, {"page_bytes":255}, {"page_bytes":4097}):
            with self.subTest(kwargs=kwargs), self.assertRaises(c.Rejected):
                self.page(**kwargs)

    def test_continuation_needs_all_bindings_and_checks_previous_page(self):
        self.write(self.project, "AGENTS.md", "A" * 1000)
        row = self.page(page_bytes=256)
        good = {"page":2, "page_bytes":256, "expected_sha256":row["file_sha256"],
                "expected_project_head":row["project"]["head"], "previous_end":row["page"]["byte_end"],
                "previous_page_sha256":row["page"]["sha256"]}
        for field in ("expected_sha256", "expected_project_head", "previous_end", "previous_page_sha256"):
            missing = dict(good); del missing[field]
            with self.subTest(missing=field), self.assertRaisesRegex(c.Rejected, "bindings_required"):
                self.page(**missing)
        for changed in ({"previous_end":255}, {"previous_page_sha256":"0" * 64}, {"page_bytes":512}):
            with self.subTest(changed=changed), self.assertRaisesRegex(c.Rejected, "noncontiguous"):
                self.page(**dict(good, **changed))
        self.assertEqual(self.page(**good)["page"]["byte_start"], 256)

    def test_source_hash_and_head_drift_rejected_before_content(self):
        self.write(self.project, "AGENTS.md", "A" * 1000)
        row = self.page(page_bytes=256)
        good = {"page":2, "page_bytes":256, "expected_sha256":row["file_sha256"],
                "expected_project_head":row["project"]["head"], "previous_end":256,
                "previous_page_sha256":row["page"]["sha256"]}
        self.write(self.project, "AGENTS.md", "B" * 1000)
        with self.assertRaisesRegex(c.Rejected, "sha256_drift"):
            self.page(**good)
        self.metadata["project"]["head"] = "4" * 40
        with self.assertRaisesRegex(c.Rejected, "head_drift"):
            self.page(**good)

    def test_method_default_paged_all_ten_only_fixed_bodies(self):
        before = self.tree_snapshot()
        for path in c.METHOD_FILES:
            row = self.page("method:" + path)
            self.assertEqual(row["content"], (self.method / path).read_text())
            self.assertEqual(row["version_binding"], "fixed_tree_blob_match")
            self.assertEqual(row["source_revision"], c.FIXED)
            self.assertEqual(row["method_source_selection"]["mode"], "local_locator")
            self.assertFalse(row["formal_method_adoption"])
        self.assertEqual(before, self.tree_snapshot())

    def test_dirty_or_wrong_pack_blocks_page_even_if_selected_file_matches(self):
        self.write(self.method, "methods.md", "dirty not fixed\n")
        with self.assertRaisesRegex(c.Rejected, "not_fixed_blob"):
            self.page("method:README.md")
        self.metadata["method"]["head"] = "0" * 40
        with self.assertRaisesRegex(c.Rejected, "wrong_method"):
            self.page("method:README.md")

    def test_symlink_selected_source_and_ancestor_rejected(self):
        path = self.project / "AGENTS.md"; raw = path.read_bytes(); path.unlink()
        outside = self.root / "outside.md"; outside.write_bytes(raw); path.symlink_to(outside)
        with self.assertRaises(OSError):
            self.page()
        old = self.root / "real-method"; self.method.rename(old); self.method.symlink_to(old, target_is_directory=True)
        with self.assertRaises(OSError):
            self.page("method:README.md")

    def test_locator_symlink_rejected(self):
        path = self.project / c.LOCATOR; raw = path.read_bytes(); path.unlink()
        outside = self.root / "other-locator.json"; outside.write_bytes(raw); path.symlink_to(outside)
        with self.assertRaises(OSError):
            self.page("method:README.md")

    def test_read_denial_not_retried_or_replaced(self):
        original = c.full_read
        def denied(root, path):
            if path == "AGENTS.md":
                raise PermissionError("fixture access denied")
            return original(root, path)
        with patch.object(c, "full_read", side_effect=denied):
            with self.assertRaisesRegex(PermissionError, "access denied"):
                self.page()

    def test_page_output_budget_rejects_oversized_metadata_not_truncates(self):
        result = self.page()
        result["project"]["origin"] = "x" * p.MAX_SERIALIZED_PAGE_BYTES
        with self.assertRaisesRegex(c.Rejected, "safe_output_budget"):
            p.encode_page(result)


class RequiredFlowTests(StartupFixture):
    def flow(self, **kwargs):
        return p.read_required_page(self.project, kwargs.pop("roles", ("project-manager",)),
                                    repository=self.provider, **kwargs)

    def continuation(self, row):
        flow = row["required_flow"]
        return {"step": flow["step"] + 1, "page_bytes": row["page"]["body_byte_limit"],
                "flow_sha256": flow["plan_sha256"],
                "previous_flow_page_sha256": flow["position_sha256"]}

    def test_required_order_complete_baseline_role_and_latest_no_duplicates(self):
        ids = p.required_catalog(self.project, ("project-manager",))
        self.assertEqual(len(ids), 34)
        self.assertEqual(ids[0], "project:AGENTS.md")
        self.assertEqual(len(ids), len(set(ids)))
        self.assertEqual(set(ids), {kind + ":" + name for kind, names in p.source_catalog(self.project, ("project-manager",)).items() for name in names})
        self.assertTrue(all("project:" + name in ids for name in c.LATEST_RECORDS))
        self.assertTrue(ids.index("project:" + c.CORE + "project-manager/MEMORY.md") < ids.index("project:" + c.LATEST_RECORDS[0]))
        self.assertEqual(ids[-10:], ["method:" + name for name in c.METHOD_FILES])
        self.assertFalse(any("qa-engineer/" in name for name in ids))

    def test_full_queue_cross_source_next_commands_exact_all_bytes_zero_writes(self):
        before = self.tree_snapshot()
        row = self.flow(page_bytes=512)
        collected, seen, transitions = {}, [], 0
        while True:
            source = row["source_id"]
            if not seen or source != seen[-1]:
                seen.append(source)
            collected[source] = collected.get(source, "") + row["content"]
            self.assertLessEqual(len(p.encode_page(row).encode()) + 1, p.MAX_SERIALIZED_PAGE_BYTES)
            self.assertFalse(row["required_flow"]["prior_delivery_authenticated"])
            self.assertEqual(row["required_flow"]["all_required_bodies_received"], "unverified")
            self.assertEqual(row["startup_connection"], "not_connected")
            if row["next_arguments"] is None:
                self.assertEqual(row["required_flow"]["pages_after_this"], 0)
                break
            self.assertIn("--required-flow", row["next_arguments"])
            self.assertTrue(row["next_command"])
            if row["page"]["number"] == row["page"]["total"]:
                self.assertNotEqual(row["required_flow"]["next_source_id"], source)
                transitions += 1
            row = self.flow(**self.continuation(row))
        self.assertEqual(transitions, 33)
        self.assertEqual(seen, p.required_catalog(self.project, ("project-manager",)))
        for source, text in collected.items():
            kind, rel = source.split(":", 1)
            self.assertEqual(text.encode(), (self.project if kind == "project" else self.method).joinpath(rel).read_bytes())
        self.assertEqual(before, self.tree_snapshot())

    def test_flow_requires_actual_roles_and_rejects_unknown_or_duplicates(self):
        for roles in ((), ("unknown",), ("project-manager", "project-manager")):
            with self.subTest(roles=roles), self.assertRaises(c.Rejected):
                self.flow(roles=roles)

    def test_roles_add_sources_not_reduce_shared_baseline(self):
        one = set(p.required_catalog(self.project, ("project-manager",)))
        two = set(p.required_catalog(self.project, ("project-manager", "qa-engineer")))
        self.assertTrue(one < two)
        self.assertEqual(len(two - one), 3)

    def test_fallback_and_retrieval_read_actual_material_not_invented_memory(self):
        ids = p.required_catalog(self.project, ("backend-data-engineer", c.RETRIEVAL_ROLE))
        self.assertEqual(len(ids), 35)
        self.assertIn("project:" + c.V12 + "backend-data-engineer/prompt.md", ids)
        self.assertTrue(set("project:" + path for path in c.RETRIEVAL_FILES) <= set(ids))
        self.assertFalse(any("backend-data-engineer/MEMORY" in source for source in ids))

    def test_continuation_missing_bindings_or_invalid_positions_rejected(self):
        row = self.flow()
        args = self.continuation(row)
        for key in ("flow_sha256", "previous_flow_page_sha256"):
            missing = dict(args); missing.pop(key)
            with self.subTest(key=key), self.assertRaisesRegex(c.Rejected, "bindings_required"):
                self.flow(**missing)
        for step in (0, -1, True, row["required_flow"]["steps_total"] + 1):
            with self.subTest(step=step), self.assertRaisesRegex(c.Rejected, "out_of_range"):
                self.flow(step=step)
        with self.assertRaisesRegex(c.Rejected, "first_step"):
            self.flow(flow_sha256="0" * 64)

    def test_jump_position_changed_or_raw_page_hash_not_continuation_binding(self):
        row = self.flow()
        args = self.continuation(row)
        for changed in ({"step": 3}, {"previous_flow_page_sha256": row["page"]["sha256"]},
                        {"previous_flow_page_sha256": "forged"}, {"previous_flow_page_sha256": {}}):
            with self.subTest(changed=changed), self.assertRaisesRegex(c.Rejected, "noncontiguous"):
                self.flow(**dict(args, **changed))

    def test_reconstructed_last_position_still_unverified_not_delivery_certificate(self):
        descriptor, pages, digest = p.required_plan(self.project, ("project-manager",), 2048, None, self.provider)
        final = self.flow(step=len(pages), flow_sha256=digest,
                          previous_flow_page_sha256=p.flow_position_sha256(digest, len(pages) - 1, pages[-2]))
        self.assertIsNone(final["next_command"])
        self.assertFalse(final["required_flow"]["prior_delivery_authenticated"])
        self.assertEqual(final["required_flow"]["all_required_bodies_received"], "unverified")
        self.assertIn("not signed delivery", final["required_flow"]["continuation"])

    def test_role_set_or_order_and_pagination_drift_rejected(self):
        row = self.flow(roles=("project-manager", "qa-engineer"))
        args = self.continuation(row)
        for roles in (("qa-engineer",), ("qa-engineer", "project-manager")):
            with self.subTest(roles=roles), self.assertRaisesRegex(c.Rejected, "inputs_or_roles_drift"):
                self.flow(roles=roles, **args)
        with self.assertRaisesRegex(c.Rejected, "inputs_or_roles_drift"):
            self.flow(roles=("project-manager", "qa-engineer"), **dict(args, page_bytes=1024))

    def test_any_unread_source_dirty_config_tool_or_head_drift_rejected(self):
        for path in (c.LATEST_RECORDS[-1], c.CORE + "user-profile/approved-preferences.md", c.CONFIG, p.READER):
            row = self.flow(); args = self.continuation(row)
            target = self.project / path; raw = target.read_bytes(); target.write_bytes(raw + b" ")
            with self.subTest(path=path), self.assertRaisesRegex(c.Rejected, "inputs_or_roles_drift"):
                self.flow(**args)
            target.write_bytes(raw)
        row = self.flow(); args = self.continuation(row)
        self.metadata["project"]["head"] = "4" * 40
        with self.assertRaisesRegex(c.Rejected, "inputs_or_roles_drift"):
            self.flow(**args)

    def test_changed_other_source_during_page_blocks_before_output(self):
        original = p.read_page
        def changed(*args, **kwargs):
            result = original(*args, **kwargs)
            self.write(self.project, c.LATEST_RECORDS[-1], "source drift after selected page read\n")
            return result
        with patch.object(p, "read_page", side_effect=changed), self.assertRaisesRegex(c.Rejected, "changed_before_output"):
            self.flow()

    def test_missing_source_or_denial_blocks_no_fallback(self):
        path = self.project / c.LATEST_RECORDS[-1]; path.unlink()
        with self.assertRaises(FileNotFoundError):
            self.flow()
        self.write(self.project, c.LATEST_RECORDS[-1], "restored synthetic source\n")
        original = c.full_read; calls = []
        def denied(root, path):
            if path == c.CORE + "user-profile/approved-preferences.md":
                calls.append(path)
                raise PermissionError("fixture access denied")
            return original(root, path)
        with patch.object(c, "full_read", side_effect=denied), self.assertRaises(PermissionError):
            self.flow()
        self.assertEqual(calls, [c.CORE + "user-profile/approved-preferences.md"])

    def test_missing_locator_blocks_flow_but_governance_independent_entry_survives(self):
        (self.project / c.LOCATOR).unlink()
        with self.assertRaises(FileNotFoundError):
            self.flow()
        row = p.read_page(self.project, "project:AGENTS.md", repository=self.provider)
        self.assertTrue(row["content"])
        self.assertNotIn("method_source_selection", row)

    def test_old_manifest_cannot_omit_latest_two(self):
        self.config["project_sources"].remove(c.REPAIRED_VALIDATION + "README.md")
        self.write(self.project, c.CONFIG, json.dumps(self.config))
        with self.assertRaisesRegex(c.Rejected, "whitelist"):
            self.flow()

    def test_method_mismatch_and_symlink_block_entire_flow(self):
        self.write(self.method, "methods.md", "dirty fixed method\n")
        with self.assertRaisesRegex(c.Rejected, "not_fixed_blob"):
            self.flow()
        raw = self.blobs[self.trees["method"]["methods.md"]["blob"]]
        (self.method / "methods.md").write_bytes(raw)
        leaf = self.project / c.LATEST_RECORDS[-1]; raw = leaf.read_bytes(); leaf.unlink()
        outside = self.root / "outside-source"; outside.write_bytes(raw); leaf.symlink_to(outside)
        with self.assertRaises(OSError):
            self.flow()

    def test_long_line_controls_crlf_unicode_and_nonterminal_newline_bounded(self):
        text = ('长行😀é' * 250 + '\t\x00"\\' * 200 + '\r\n尾部')
        self.write(self.project, "AGENTS.md", text)
        row = self.flow(page_bytes=4096); combined = ""
        while row["source_id"] == "project:AGENTS.md":
            combined += row["content"]
            self.assertLessEqual(len(p.encode_page(row).encode()) + 1, p.MAX_SERIALIZED_PAGE_BYTES)
            self.assertLessEqual(len(row["content"].encode()), 4096)
            row = self.flow(**self.continuation(row))
        self.assertEqual(combined, text)

    def test_checker_metadata_directs_normal_flow_not_complete_agent_read(self):
        result = self.run_check()
        self.assertIn("--required-flow --roles project-manager", result["normal_body_reading"]["command"])
        self.assertTrue(result["normal_body_reading"]["metadata_is_not_body_delivery"])
        self.assertEqual(result["startup_connection"], "not_connected")


if __name__ == "__main__":
    unittest.main(verbosity=2)
