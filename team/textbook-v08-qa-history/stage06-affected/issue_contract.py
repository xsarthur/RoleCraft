import hashlib
import json

ISSUE_TOOL_VERSION = "create_issue/v1"
ISSUE_CANONICAL_VERSION = "issue-json-utf8-v1"

class IssueContractError(ValueError):
    pass

def issue_text(value, field, max_bytes):
    if type(value) is not str or not value.strip():
        raise IssueContractError("INVALID_" + field.upper())
    try:
        encoded = value.encode("utf-8", errors="strict")
    except UnicodeEncodeError as exc:
        raise IssueContractError("NOT_UTF8_" + field.upper()) from exc
    if len(encoded) > max_bytes:
        raise IssueContractError("TOO_LARGE_" + field.upper())
    return value

def canonical_issue_arguments(arguments):
    fields = {"project", "title", "body", "evidence_ids"}
    if type(arguments) is not dict or set(arguments) != fields:
        raise IssueContractError("ARGUMENT_FIELDS")
    evidence = arguments["evidence_ids"]
    if type(evidence) is not list or not 1 <= len(evidence) <= 32:
        raise IssueContractError("EVIDENCE_LIST")
    return {
        "project": issue_text(arguments["project"], "project", 100),
        "title": issue_text(arguments["title"], "title", 200),
        "body": issue_text(arguments["body"], "body", 10000),
        "evidence_ids": sorted(set(issue_text(item, "evidence_id", 200)
                                   for item in evidence)),
    }

def canonical_issue_bytes(tool_version, arguments):
    if tool_version != ISSUE_TOOL_VERSION or type(tool_version) is not str:
        raise IssueContractError("TOOL_VERSION")
    payload = {"canonical_version": ISSUE_CANONICAL_VERSION,
               "tool_version": tool_version,
               "arguments": canonical_issue_arguments(arguments)}
    return json.dumps(payload, sort_keys=True, ensure_ascii=False,
                      allow_nan=False, separators=(",", ":")).encode("utf-8", errors="strict")

def canonical_issue_hash(tool_version, arguments):
    return hashlib.sha256(canonical_issue_bytes(tool_version, arguments)).hexdigest()
