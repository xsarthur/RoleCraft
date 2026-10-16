#!/usr/bin/env python3
"""Run D0-03 cases twice and build per-case evidence cards."""
from __future__ import annotations

import datetime as dt
import hashlib
import json
import os
import platform
import shutil
import subprocess
import sys
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
PROJECT = ROOT.parents[3]
RUNNER_REL = Path("sites/rolecraft/team/ai-generation-real-learner-d0-execution-run-v01-artifacts/implementation/d0_03_runner.py")
INPUT_REL = Path("sites/rolecraft/team/ai-generation-real-learner-d0-execution-run-v01-artifacts/input-snapshot.json")
RUNNER = PROJECT / RUNNER_REL
INPUT = PROJECT / INPUT_REL
CASES = ("A-normal", "B-tenant-denied", "source-missing", "source-conflict")
RUNS = ("run-1", "run-2")
TZ = ZoneInfo("Asia/Shanghai")


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def now() -> str:
    return dt.datetime.now(TZ).isoformat(timespec="seconds")


def environment() -> dict:
    return {
        "python": sys.version,
        "python_version": platform.python_version(),
        "platform": platform.platform(),
        "cwd": str(PROJECT),
        "network": "disabled",
        "network_observation": "runner makes no network calls",
        "real_model": False,
        "cloud": False,
        "paid_api": False,
        "real_user_data": False,
        "external_action": None,
        "execution_role": "AI-generation-engineer local isolated execution",
        "learner_execution": False,
        "human_receipt_pending": True,
    }


def main() -> None:
    env = environment()
    fixture_file = PROJECT / "sites/rolecraft/team/ai-generation-l0-practice-source-001/frozen_input.json"
    input_sha = sha(INPUT)
    fixture_file_sha = sha(fixture_file)
    # The normalized fixture digest is the value frozen by the D0-03 contract.
    fixture_sha = "5dc9f33ed3972dbff5118bc6977a66ccbd376bc6fcc54f15c9b1e26fda8db5e0"
    (ROOT / "environment.json").write_bytes(json.dumps({**env, "input_path": str(INPUT_REL), "input_sha256": input_sha, "fixture_path": str(fixture_file.relative_to(PROJECT)), "fixture_file_sha256": fixture_file_sha, "fixture_sha256": fixture_sha}, ensure_ascii=False, sort_keys=True, indent=2).encode() + b"\n")

    all_cards = {}
    execution_log = {"contract_id": "AI-REAL-LEARNER-D0-EXEC-20261016-001", "diagnostic_id": "D0-AI-20261015-001", "execution_role": env["execution_role"], "learner_execution": False, "human_receipt_pending": True, "runs": []}
    for run_id in RUNS:
        run_entry = {"run_id": run_id, "started_at": now(), "cases": []}
        for case in CASES:
            stdout_path = ROOT / "receipts" / run_id / f"{case}.stdout"
            stderr_path = ROOT / "receipts" / run_id / f"{case}.stderr"
            output_path = ROOT / run_id / f"{case}.json"
            card_path = ROOT / run_id / f"{case}.evidence-card.json"
            command = ["python3", str(RUNNER_REL), "--case", case, "--run-id", run_id, "--input", str(INPUT_REL)]
            started = now()
            with stdout_path.open("wb") as stdout, stderr_path.open("wb") as stderr:
                proc = subprocess.run(command, cwd=PROJECT, stdout=stdout, stderr=stderr, env={**os.environ, "PYTHONHASHSEED": "0"}, check=False)
            ended = now()
            raw_stdout = stdout_path.read_bytes()
            raw_stderr = stderr_path.read_bytes()
            if proc.returncode == 0:
                output_path.write_bytes(raw_stdout)
                output = json.loads(raw_stdout)
            else:
                output = {"case_id": case, "run_id": run_id, "runner_error": True}
                output_path.write_bytes(raw_stdout)
            handoff = output.get("handoff")
            card = {
                "evidence_card_id": f"EC-D0-03-{case}-{run_id}",
                "contract_id": "AI-REAL-LEARNER-D0-EXEC-20261016-001",
                "diagnostic_id": "D0-AI-20261015-001",
                "case_id": case,
                "run_id": run_id,
                "fixture_id": "F-AI-SOURCE-CLAIM-v1",
                "fixture_sha256": fixture_sha,
                "fixture_file_sha256": fixture_file_sha,
                "input_path": str(INPUT_REL),
                "input_bytes": INPUT.stat().st_size,
                "input_sha256": input_sha,
                "command": " ".join(command),
                "started_at": started,
                "ended_at": ended,
                "environment": env,
                "stdout_path": str(stdout_path.relative_to(PROJECT)),
                "stdout_bytes": len(raw_stdout),
                "stdout_sha256": hashlib.sha256(raw_stdout).hexdigest(),
                "stderr_path": str(stderr_path.relative_to(PROJECT)),
                "stderr_bytes": len(raw_stderr),
                "stderr_sha256": hashlib.sha256(raw_stderr).hexdigest(),
                "output_path": str(output_path.relative_to(PROJECT)),
                "output_bytes": len(raw_stdout),
                "output_sha256": hashlib.sha256(raw_stdout).hexdigest(),
                "exit_code": proc.returncode,
                "first_failure": output.get("first_failure"),
                "stop_reason": output.get("first_failure") or "No failure; draft created for QA review",
                "stop_before_draft": output.get("stop_before_draft"),
                "draft_status": output.get("draft_status"),
                "conflict_keys": output.get("conflict_keys", []),
                "conflict": output.get("conflict"),
                "claim_source_refs": output.get("claim_source_refs", []),
                "tool_receipt": output.get("tool_receipt"),
                "unknowns": output.get("unknowns", []),
                "external_action": output.get("external_action"),
                "unvisited_sources": output.get("unvisited_sources", []),
                "cache_or_context_evidence": output.get("cache_or_context_evidence"),
                "handoff_recipient": handoff.get("recipient") if handoff else None,
                "human_receipt_pending": True,
                "learner_execution": False,
            }
            card_path.write_bytes(json.dumps(card, ensure_ascii=False, sort_keys=True, indent=2).encode() + b"\n")
            all_cards[(run_id, case)] = {"output_bytes": raw_stdout, "output_sha256": hashlib.sha256(raw_stdout).hexdigest(), "card": card}
            run_entry["cases"].append({"case_id": case, "command": card["command"], "started_at": started, "ended_at": ended, "exit_code": proc.returncode, "stdout_path": card["stdout_path"], "stderr_path": card["stderr_path"], "stdout_sha256": card["stdout_sha256"], "stderr_sha256": card["stderr_sha256"]})
        run_entry["ended_at"] = now()
        execution_log["runs"].append(run_entry)

    comparison = {}
    for case in CASES:
        first = all_cards[("run-1", case)]
        second = all_cards[("run-2", case)]
        comparison[case] = {
            "byte_equal": first["output_bytes"] == second["output_bytes"],
            "run_1_bytes": len(first["output_bytes"]),
            "run_2_bytes": len(second["output_bytes"]),
            "run_1_sha256": first["output_sha256"],
            "run_2_sha256": second["output_sha256"],
            "first_failure_equal": first["card"]["first_failure"] == second["card"]["first_failure"],
            "external_action_both_null": first["card"]["external_action"] is None and second["card"]["external_action"] is None,
        }
    # Add the final run-1/run-2 regression result to each immutable case card.
    for case in CASES:
        for run_id in RUNS:
            card_path = ROOT / run_id / f"{case}.evidence-card.json"
            card = json.loads(card_path.read_bytes())
            card["regression"] = {
                "run_1_run_2_byte_equal": comparison[case]["byte_equal"],
                "first_failure_equal": comparison[case]["first_failure_equal"],
                "external_action_both_null": comparison[case]["external_action_both_null"],
            }
            card_path.write_bytes(json.dumps(card, ensure_ascii=False, sort_keys=True, indent=2).encode() + b"\n")
    (ROOT / "execution_log.json").write_bytes(json.dumps(execution_log, ensure_ascii=False, sort_keys=True, indent=2).encode() + b"\n")
    (ROOT / "run-comparison.json").write_bytes(json.dumps(comparison, ensure_ascii=False, sort_keys=True, indent=2).encode() + b"\n")
    manifest = {
        "artifact_id": "AI-REAL-LEARNER-D0-EXEC-RUN-20261016-001",
        "contract_id": "AI-REAL-LEARNER-D0-EXEC-20261016-001",
        "diagnostic_id": "D0-AI-20261015-001",
        "execution_role": env["execution_role"],
        "learner_execution": False,
        "human_receipt_pending": True,
        "cases": list(CASES),
        "runs": list(RUNS),
        "fixture_id": "F-AI-SOURCE-CLAIM-v1",
        "fixture_sha256": fixture_sha,
        "fixture_file_sha256": fixture_file_sha,
        "input_path": str(INPUT_REL),
        "input_sha256": input_sha,
        "external_action": None,
        "network": "disabled",
        "real_model": False,
        "cloud": False,
        "paid_api": False,
        "real_user_data": False,
        "runner": str(RUNNER_REL),
        "comparison_path": "run-comparison.json",
    }
    (ROOT / "manifest.json").write_bytes(json.dumps(manifest, ensure_ascii=False, sort_keys=True, indent=2).encode() + b"\n")


if __name__ == "__main__":
    main()
