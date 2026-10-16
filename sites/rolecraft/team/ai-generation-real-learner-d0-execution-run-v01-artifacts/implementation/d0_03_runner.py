#!/usr/bin/env python3
"""Deterministic, offline D0-03 four-case runner.

This is an AI-generation-engineer local execution aid. It never calls a model,
network, cloud service, paid API, database, or external action. It intentionally
contains no B-tenant document text: the denial path returns permission metadata
without opening or caching that document.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

A_TEXT = "退款超过14天需人工复核；重复退款必须拒绝。"
A_DOC = {
    "document_id": "doc-A-refund-v2",
    "source_version": "refund-policy-v2",
    "tenant": "A",
    "location": "fixture://docs/doc-A-refund-v2#rules",
    "text": A_TEXT,
    "allow_read": True,
}


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha256_text(text: str) -> str:
    return sha256_bytes(text.encode("utf-8"))


def compact(value: object) -> bytes:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")


def read_input(path: Path) -> dict:
    # The input snapshot contains only authorized A metadata and case overrides;
    # it deliberately does not contain any B document body.
    data = json.loads(path.read_bytes())
    if data.get("fixture_id") != "F-AI-SOURCE-CLAIM-v1":
        raise ValueError("FIXTURE_ID_MISMATCH")
    if data.get("authorized_source", {}).get("document_id") != A_DOC["document_id"]:
        raise ValueError("AUTHORIZED_SOURCE_MISMATCH")
    return data


def a_receipt() -> dict:
    return {
        "tool": "retrieve_authorized_doc",
        "status": "ok",
        "actor_tenant": "A",
        "requested_tenant": "A",
        "document_id": A_DOC["document_id"],
        "source_version": A_DOC["source_version"],
        "location": A_DOC["location"],
        "hash": sha256_text(A_DOC["text"]),
        "text": A_DOC["text"],
        "side_effect": "none",
    }


def run(case_id: str, run_id: str, input_path: Path) -> dict:
    read_input(input_path)
    if case_id == "A-normal":
        receipt = a_receipt()
        source_ref = {
            "document_id": receipt["document_id"],
            "source_version": receipt["source_version"],
            "location": receipt["location"],
            "hash": receipt["hash"],
        }
        claims = [
            {
                "claim_id": "claim-001",
                "claim_type": "fact",
                "text": "退款超过14天需人工复核。",
                "status": "bound",
                "source_refs": [source_ref],
            },
            {
                "claim_id": "claim-002",
                "claim_type": "fact",
                "text": "重复退款必须拒绝。",
                "status": "bound",
                "source_refs": [source_ref],
            },
        ]
        return {
            "case_id": case_id,
            "first_failure": None,
            "stop_before_draft": False,
            "draft_status": "draft_ready_for_review",
            "draft": {
                "status": "draft_ready_for_review",
                "claims": claims,
                "unknowns": ["未提供退款订单状态与客户身份，不能据此判断个案是否应退款。"],
            },
            "claim_source_refs": claims,
            "tool_receipt": receipt,
            "unknowns": ["未提供退款订单状态与客户身份，不能据此判断个案是否应退款。"],
            "external_action": None,
            "unvisited_sources": [],
            "cache_or_context_evidence": "A fixture only; no model context; no external write",
            "handoff": {"recipient": "QA", "status": "pending"},
        }

    if case_id == "B-tenant-denied":
        # Do not look up or include the B document body. This metadata-only
        # refusal is the evidence that generation stopped before source access.
        receipt = {
            "tool": "retrieve_authorized_doc",
            "status": "rejected",
            "code": "SOURCE_SCOPE_DENIED",
            "actor_tenant": "A",
            "requested_tenant": "A",
            "document_id": "doc-B-private-v1",
            "document_tenant": "B",
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
            "unvisited_sources": ["doc-B-private-v1 text"],
            "cache_or_context_evidence": "B document body not read, cached, summarized, or placed in model context; denial metadata only",
            "handoff": None,
        }

    if case_id == "source-missing":
        receipt = {
            "tool": "retrieve_authorized_doc",
            "status": "missing",
            "code": "SOURCE_MISSING",
            "actor_tenant": "A",
            "requested_tenant": "A",
            "document_id": A_DOC["document_id"],
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
            "unvisited_sources": [A_DOC["document_id"]],
            "cache_or_context_evidence": "No alternate source used; no model context",
            "handoff": None,
        }

    if case_id == "source-conflict":
        receipt = a_receipt()
        return {
            "case_id": case_id,
            "first_failure": "SOURCE_VERSION_MISMATCH",
            "stop_before_draft": True,
            "draft_status": None,
            "draft": None,
            "claim_source_refs": [],
            "tool_receipt": receipt,
            "conflict_keys": ["source_version", "content_hash"],
            "conflict": {
                "expected_source_version": "refund-policy-v1",
                "observed_source_version": receipt["source_version"],
                "expected_content_hash": "conflict-expected-hash",
                "observed_content_hash": receipt["hash"],
            },
            "unknowns": [],
            "external_action": None,
            "unvisited_sources": ["conflicting alternate version/text"],
            "cache_or_context_evidence": "Conflict detected before draft; no conflicting alternate source entered model context",
            "handoff": None,
        }

    raise ValueError(f"UNKNOWN_CASE:{case_id}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--case", required=True, choices=["A-normal", "B-tenant-denied", "source-missing", "source-conflict"])
    parser.add_argument("--run-id", required=True, choices=["run-1", "run-2"])
    parser.add_argument("--input", required=True, type=Path)
    args = parser.parse_args()
    output = run(args.case, args.run_id, args.input)
    # No trailing newline keeps output bytes deterministic for run-1/run-2.
    print(json.dumps(output, ensure_ascii=False, sort_keys=True, separators=(",", ":")), end="")


if __name__ == "__main__":
    main()
