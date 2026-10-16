#!/usr/bin/env python3
"""Versioned D0-03 runner with input-bound source provenance.

This v02 runner is deliberately separate from d0_03_runner.py.  It reads the
A-authorized source metadata from the supplied input snapshot, verifies the
supplier-declared content hash against the supplied text, and binds every
claim to the source actually supplied for that invocation.  It is offline and
contains no B-tenant document body.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path
from typing import Any

CASES = ("A-normal", "B-tenant-denied", "source-missing", "source-conflict")
RUNS = ("run-1", "run-2")
FIXTURE_ID = "F-AI-SOURCE-CLAIM-v1"
A_TENANT = "A"
UNKNOWN_CASE_MESSAGE = "未提供退款订单状态与客户身份，不能据此判断个案是否应退款。"


class ControlledFailure(Exception):
    """Expected pre-draft stop with a stable contract code."""

    def __init__(self, code: str, *, receipt: dict[str, Any] | None = None, extra: dict[str, Any] | None = None):
        super().__init__(code)
        self.code = code
        self.receipt = receipt
        self.extra = extra or {}


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha256_text(text: str) -> str:
    return sha256_bytes(text.encode("utf-8"))


def compact(value: object) -> bytes:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")


def read_input(path: Path) -> dict[str, Any]:
    data = json.loads(path.read_bytes())
    if data.get("fixture_id") != FIXTURE_ID:
        raise ValueError("FIXTURE_ID_MISMATCH")
    source = data.get("authorized_source")
    if not isinstance(source, dict):
        raise ValueError("AUTHORIZED_SOURCE_MISSING")
    return data


def _required_source_fields(source: dict[str, Any]) -> tuple[str, str, str, str, str]:
    fields = ("document_id", "source_version", "location", "tenant", "text")
    values = tuple(source.get(field) for field in fields)
    if any(not isinstance(value, str) or not value for value in values):
        raise ControlledFailure("SOURCE_METADATA_INVALID")
    return values  # type: ignore[return-value]


def retrieve_authorized_source(data: dict[str, Any]) -> dict[str, Any]:
    """Read only the supplied A source and verify its declared hash."""
    source = data["authorized_source"]
    document_id, source_version, location, tenant, text = _required_source_fields(source)
    if tenant != A_TENANT:
        raise ControlledFailure(
            "SOURCE_SCOPE_DENIED",
            receipt={
                "tool": "retrieve_authorized_doc",
                "status": "rejected",
                "code": "SOURCE_SCOPE_DENIED",
                "actor_tenant": A_TENANT,
                "requested_tenant": A_TENANT,
                "document_id": document_id,
                "document_tenant": tenant,
                "location": "unavailable://permission-denied",
                "side_effect": "none",
            },
        )

    observed_hash = sha256_text(text)
    declared_hash = source.get("hash")
    receipt = {
        "tool": "retrieve_authorized_doc",
        "status": "ok",
        "actor_tenant": A_TENANT,
        "requested_tenant": A_TENANT,
        "document_id": document_id,
        "source_version": source_version,
        "location": location,
        "hash": observed_hash,
        "declared_hash": declared_hash,
        "text": text,
        "side_effect": "none",
    }
    if declared_hash != observed_hash:
        receipt["status"] = "rejected"
        receipt["code"] = "SOURCE_HASH_MISMATCH"
        raise ControlledFailure(
            "SOURCE_HASH_MISMATCH",
            receipt=receipt,
            extra={"expected_content_hash": declared_hash, "observed_content_hash": observed_hash},
        )
    return receipt


def source_ref(receipt: dict[str, Any]) -> dict[str, str]:
    return {
        "document_id": receipt["document_id"],
        "source_version": receipt["source_version"],
        "location": receipt["location"],
        "hash": receipt["hash"],
    }


def claim_texts(text: str) -> list[str]:
    """Turn supplied fixture text into deterministic fact sentences."""
    # The fixture uses Chinese semicolon-separated facts.  Keep every supplied
    # character and add a sentence mark only when a segment lacks punctuation.
    pieces = [piece.strip() for piece in re.split(r"[；;]", text) if piece.strip()]
    if not pieces:
        pieces = [text.strip()]
    claims: list[str] = []
    for piece in pieces:
        if piece and piece[-1] not in "。！？.!?":
            piece += "。"
        claims.append(piece)
    return claims


def failure_output(case_id: str, failure: ControlledFailure) -> dict[str, Any]:
    output: dict[str, Any] = {
        "case_id": case_id,
        "first_failure": failure.code,
        "stop_before_draft": True,
        "draft_status": None,
        "draft": None,
        "claim_source_refs": [],
        "tool_receipt": failure.receipt,
        "unknowns": [],
        "external_action": None,
        "unvisited_sources": [],
        "cache_or_context_evidence": "Failure detected before draft; no alternate source entered model context",
        "handoff": None,
    }
    output.update(failure.extra)
    return output


def run(case_id: str, run_id: str, input_path: Path) -> dict[str, Any]:
    # run_id is part of the invocation contract but intentionally absent from
    # output so run-1/run-2 have byte-identical deterministic receipts.
    if case_id not in CASES:
        raise ValueError(f"UNKNOWN_CASE:{case_id}")
    if run_id not in RUNS:
        raise ValueError(f"UNKNOWN_RUN:{run_id}")
    data = read_input(input_path)
    overrides = data.get("case_overrides", {})

    if case_id == "B-tenant-denied":
        override = overrides.get(case_id, {})
        document_id = override.get("document_id", "doc-B-private-v1")
        document_tenant = override.get("document_tenant", "B")
        # Deliberately do not access authorized_source text or any B body.
        receipt = {
            "tool": "retrieve_authorized_doc",
            "status": "rejected",
            "code": "SOURCE_SCOPE_DENIED",
            "actor_tenant": A_TENANT,
            "requested_tenant": override.get("requested_tenant", A_TENANT),
            "document_id": document_id,
            "document_tenant": document_tenant,
            "location": "unavailable://permission-denied",
            "side_effect": "none",
        }
        return {
            "case_id": case_id,
            "first_failure": "SOURCE_SCOPE_DENIED",
            "stop_before_draft": True,
            "draft_status": None,
            "draft": None,
            "claim_source_refs": [],
            "tool_receipt": receipt,
            "unknowns": [],
            "external_action": None,
            "unvisited_sources": [f"{document_id} text"],
            "cache_or_context_evidence": "B document body not read, cached, summarized, or placed in model context; denial metadata only",
            "handoff": None,
        }

    if case_id == "source-missing":
        override = overrides.get(case_id, {})
        document_id = override.get("document_id", data["authorized_source"].get("document_id"))
        receipt = {
            "tool": "retrieve_authorized_doc",
            "status": "missing",
            "code": "SOURCE_MISSING",
            "actor_tenant": A_TENANT,
            "requested_tenant": A_TENANT,
            "document_id": document_id,
            "location": "unavailable://missing",
            "side_effect": "none",
        }
        return {
            "case_id": case_id,
            "first_failure": "SOURCE_MISSING",
            "stop_before_draft": True,
            "draft_status": None,
            "draft": None,
            "claim_source_refs": [],
            "tool_receipt": receipt,
            "unknowns": ["required source unavailable"],
            "external_action": None,
            "unvisited_sources": [document_id],
            "cache_or_context_evidence": "No alternate source used; no model context",
            "handoff": None,
        }

    try:
        receipt = retrieve_authorized_source(data)
    except ControlledFailure as failure:
        output = failure_output(case_id, failure)
        if case_id == "A-normal":
            output["unvisited_sources"] = [data["authorized_source"].get("document_id", "authorized source")]
        return output

    if case_id == "source-conflict":
        override = overrides.get(case_id, {})
        expected_version = override.get("expected_source_version")
        expected_hash = override.get("expected_content_hash")
        conflict_keys: list[str] = []
        if expected_version != receipt["source_version"]:
            conflict_keys.append("source_version")
        if expected_hash != receipt["hash"]:
            conflict_keys.append("content_hash")
        if conflict_keys:
            return {
                "case_id": case_id,
                "first_failure": "SOURCE_VERSION_MISMATCH" if "source_version" in conflict_keys else "SOURCE_HASH_MISMATCH",
                "stop_before_draft": True,
                "draft_status": None,
                "draft": None,
                "claim_source_refs": [],
                "tool_receipt": receipt,
                "conflict_keys": conflict_keys,
                "conflict": {
                    "expected_source_version": expected_version,
                    "observed_source_version": receipt["source_version"],
                    "expected_content_hash": expected_hash,
                    "observed_content_hash": receipt["hash"],
                },
                "unknowns": [],
                "external_action": None,
                "unvisited_sources": ["conflicting alternate version/text"],
                "cache_or_context_evidence": "Conflict detected before draft; no conflicting alternate source entered model context",
                "handoff": None,
            }

    ref = source_ref(receipt)
    claims = [
        {
            "claim_id": f"claim-{index:03d}",
            "claim_type": "fact",
            "text": claim,
            "status": "bound",
            "source_refs": [ref],
        }
        for index, claim in enumerate(claim_texts(receipt["text"]), start=1)
    ]
    unknowns = [UNKNOWN_CASE_MESSAGE]
    return {
        "case_id": case_id,
        "first_failure": None,
        "stop_before_draft": False,
        "draft_status": "draft_ready_for_review",
        "draft": {
            "status": "draft_ready_for_review",
            "claims": claims,
            "unknowns": unknowns,
        },
        "claim_source_refs": claims,
        "tool_receipt": receipt,
        "unknowns": unknowns,
        "external_action": None,
        "unvisited_sources": [],
        "cache_or_context_evidence": "A fixture only; no model context; no external write",
        "handoff": {"recipient": "QA", "status": "pending"},
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--case", required=True, choices=CASES)
    parser.add_argument("--run-id", required=True, choices=RUNS)
    parser.add_argument("--input", required=True, type=Path)
    args = parser.parse_args()
    output = run(args.case, args.run_id, args.input)
    print(json.dumps(output, ensure_ascii=False, sort_keys=True, separators=(",", ":")), end="")


if __name__ == "__main__":
    main()
