#!/usr/bin/env python3
"""Local self-checks for the versioned dynamic-source runner.

These tests are implementation checks only; they are not an independent QA
acceptance or learner receipt.
"""
from __future__ import annotations

import copy
import hashlib
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

PROJECT = Path(__file__).resolve().parents[5]
RUNNER = Path(__file__).with_name("d0_03_runner-v02-dynamic.py")
INPUT = PROJECT / "sites/rolecraft/team/ai-generation-real-learner-d0-execution-run-v01-artifacts/input-snapshot.json"
CASES = ("A-normal", "B-tenant-denied", "source-missing", "source-conflict")


def sha_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def invoke(case: str, run_id: str, input_path: Path) -> tuple[int, bytes, dict]:
    proc = subprocess.run(
        [sys.executable, str(RUNNER), "--case", case, "--run-id", run_id, "--input", str(input_path)],
        cwd=PROJECT,
        capture_output=True,
        check=False,
    )
    assert proc.stderr == b"", proc.stderr.decode()
    return proc.returncode, proc.stdout, json.loads(proc.stdout)


class DynamicRunnerTests(unittest.TestCase):
    def test_original_input_is_bound_and_two_runs_are_byte_equal(self) -> None:
        for case in CASES:
            code1, out1, result1 = invoke(case, "run-1", INPUT)
            code2, out2, result2 = invoke(case, "run-2", INPUT)
            self.assertEqual(code1, 0)
            self.assertEqual(code2, 0)
            self.assertEqual(out1, out2, case)
            self.assertEqual(result1.get("first_failure"), result2.get("first_failure"))
            self.assertIsNone(result1.get("external_action"))
            if case == "A-normal":
                self.assertEqual(result1["draft_status"], "draft_ready_for_review")
                self.assertEqual(result1["tool_receipt"]["document_id"], "doc-A-refund-v2")
                self.assertEqual(result1["tool_receipt"]["source_version"], "refund-policy-v2")
                self.assertEqual(result1["tool_receipt"]["hash"], json.loads(INPUT.read_text(encoding="utf-8"))["authorized_source"]["hash"])
                self.assertTrue(all(c["source_refs"][0]["document_id"] == "doc-A-refund-v2" for c in result1["draft"]["claims"]))
            else:
                self.assertTrue(result1["stop_before_draft"])
                self.assertIsNone(result1["draft"])

    def test_valid_holdout_changes_all_source_fields_and_binds_them(self) -> None:
        data = json.loads(INPUT.read_text(encoding="utf-8"))
        holdout_text = "发货超过7天需人工复核；人工复核标记为必需。"
        data["authorized_source"] = {
            **data["authorized_source"],
            "document_id": "doc-A-shipping-v3",
            "source_version": "shipping-v3",
            "location": "fixture://docs/doc-A-shipping-v3#rules",
            "text": holdout_text,
            "hash": sha_text(holdout_text),
        }
        with tempfile.TemporaryDirectory(prefix="d0-03-v02-test-") as tmp:
            path = Path(tmp) / "holdout.json"
            path.write_text(json.dumps(data, ensure_ascii=False, sort_keys=True), encoding="utf-8")
            code, raw, result = invoke("A-normal", "run-1", path)
        self.assertEqual(code, 0)
        self.assertEqual(result["draft_status"], "draft_ready_for_review")
        receipt = result["tool_receipt"]
        self.assertEqual(receipt["document_id"], "doc-A-shipping-v3")
        self.assertEqual(receipt["source_version"], "shipping-v3")
        self.assertEqual(receipt["hash"], sha_text(holdout_text))
        self.assertEqual({ref["document_id"] for claim in result["draft"]["claims"] for ref in claim["source_refs"]}, {"doc-A-shipping-v3"})
        self.assertEqual({ref["source_version"] for claim in result["draft"]["claims"] for ref in claim["source_refs"]}, {"shipping-v3"})
        self.assertEqual({ref["hash"] for claim in result["draft"]["claims"] for ref in claim["source_refs"]}, {sha_text(holdout_text)})
        self.assertIn("发货超过7天需人工复核", raw.decode("utf-8"))

    def test_stale_hash_stops_before_draft(self) -> None:
        data = json.loads(INPUT.read_text(encoding="utf-8"))
        data["authorized_source"]["text"] += "（篡改）"
        with tempfile.TemporaryDirectory(prefix="d0-03-v02-test-") as tmp:
            path = Path(tmp) / "stale-hash.json"
            path.write_text(json.dumps(data, ensure_ascii=False, sort_keys=True), encoding="utf-8")
            code, _, result = invoke("A-normal", "run-1", path)
        self.assertEqual(code, 0)
        self.assertEqual(result["first_failure"], "SOURCE_HASH_MISMATCH")
        self.assertTrue(result["stop_before_draft"])
        self.assertIsNone(result["draft"])
        self.assertIsNone(result["handoff"])


if __name__ == "__main__":
    unittest.main()
