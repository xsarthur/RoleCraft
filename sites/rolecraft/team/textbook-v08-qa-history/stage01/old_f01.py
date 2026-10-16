import hashlib
import json
import socket
import unittest
from dataclasses import dataclass
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import HTTPRedirectHandler, Request, build_opener

MAX_BYTES = 64 * 1024

@dataclass(frozen=True)
class Principal:
    tenant_id: str
    allowed_resources: frozenset  # (repo, revision, path) 精确资源集合

@dataclass(frozen=True)
class Reply:
    status: int
    body: bytes

class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None

class HttpTransport:
    # 配置来自维护者，不能来自模型或本次请求参数。
    def __init__(self, base_url, token):
        if not base_url.startswith("https://"):
            raise ValueError("HTTPS_REQUIRED")
        self.base_url = base_url.rstrip("/")
        self.token = token
        self.opener = build_opener(NoRedirect())

    def get(self, fields):
        url = self.base_url + "/source?" + urlencode(fields)
        req = Request(url, method="GET", headers={
            "Accept": "application/json",
            "Authorization": "Bearer " + self.token,
        })
        try:
            with self.opener.open(req, timeout=5) as response:
                body = response.read(MAX_BYTES + 1)
                return Reply(response.status, body)
        except HTTPError as error:
            # 错误正文不需要进入模型上下文。
            error.close()
            return Reply(error.code, b"")

def result(kind, code, **data):
    return {"kind": kind, "code": code, **data}

def read_source(raw, principal, transport):
    if type(raw) is not dict:
        return result("REJECTED", "OBJECT_REQUIRED")
    if set(raw) != {"repo", "revision", "path"}:
        return result("REJECTED", "FIELDS_INVALID")
    for name in ("repo", "revision", "path"):
        value = raw[name]
        if type(value) is not str or not value or len(value) > 200:
            return result("REJECTED", "FIELD_INVALID", field=name)
    resource = (raw["repo"], raw["revision"], raw["path"])
    if resource not in principal.allowed_resources:
        return result("REJECTED", "RESOURCE_DENIED")
    try:
        reply = transport.get(raw)
    except (TimeoutError, socket.timeout, URLError):
        return result("UNAVAILABLE", "TRANSPORT_UNKNOWN", retryable=True)
    if reply.status in (401, 403):
        return result("REJECTED", "REMOTE_DENIED")
    if reply.status == 404:
        return result("UNAVAILABLE", "SOURCE_NOT_FOUND", retryable=False)
    if reply.status == 429 or 500 <= reply.status <= 599:
        return result("UNAVAILABLE", "REMOTE_TEMPORARY", retryable=True)
    if reply.status != 200:
        return result("INVALID_RESPONSE", "UNEXPECTED_STATUS")
    if len(reply.body) > MAX_BYTES:
        return result("INVALID_RESPONSE", "BODY_TOO_LARGE")
    try:
        value = json.loads(reply.body.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError):
        return result("INVALID_RESPONSE", "INVALID_JSON")
    fields = {"repo", "revision", "path", "content", "sha256"}
    if type(value) is not dict or set(value) != fields:
        return result("INVALID_RESPONSE", "RESPONSE_FIELDS")
    if any(type(value[k]) is not str for k in fields):
        return result("INVALID_RESPONSE", "RESPONSE_TYPES")
    if tuple(value[k] for k in ("repo", "revision", "path")) != resource:
        return result("INVALID_RESPONSE", "RESOURCE_MISMATCH")
    digest = hashlib.sha256(value["content"].encode("utf-8")).hexdigest()
    if value["sha256"] != digest:
        return result("INVALID_RESPONSE", "CONTENT_MISMATCH")
    return result("SUCCESS", "SOURCE_READ", source=value)

class StubTransport:
    def __init__(self, outcome):
        self.outcome = outcome
        self.calls = 0
    def get(self, fields):
        self.calls += 1
        if isinstance(self.outcome, Exception):
            raise self.outcome
        return self.outcome

class BoundaryTests(unittest.TestCase):
    def setUp(self):
        self.raw = {"repo": "repo", "revision": "8e12",
                    "path": "src/refund.py"}
        self.principal = Principal("tenant-dev", frozenset({
            ("repo", "8e12", "src/refund.py")}))
        content = "def refund(days):\n    return days < 7\n"
        self.source = {**self.raw, "content": content,
                       "sha256": hashlib.sha256(content.encode()).hexdigest()}

    def invoke(self, outcome, raw=None):
        stub = StubTransport(outcome)
        answer = read_source(self.raw if raw is None else raw,
                             self.principal, stub)
        return answer, stub.calls

    def test_success(self):
        answer, calls = self.invoke(Reply(200, json.dumps(self.source).encode()))
        self.assertEqual(answer["kind"], "SUCCESS")
        self.assertEqual(calls, 1)

    def test_invalid_type_never_calls_upstream(self):
        answer, calls = self.invoke(Reply(200, b"{}"),
                                   {**self.raw, "path": ["src/refund.py"]})
        self.assertEqual(answer["code"], "FIELD_INVALID")
        self.assertEqual(calls, 0)

    def test_denied_never_calls_upstream(self):
        answer, calls = self.invoke(Reply(200, b"{}"),
                                   {**self.raw, "revision": "other"})
        self.assertEqual(answer["code"], "RESOURCE_DENIED")
        self.assertEqual(calls, 0)

    def test_timeout_is_not_success(self):
        answer, _ = self.invoke(TimeoutError())
        self.assertEqual(answer["kind"], "UNAVAILABLE")

    def test_success_status_with_wrong_revision(self):
        wrong = {**self.source, "revision": "old"}
        answer, _ = self.invoke(Reply(200, json.dumps(wrong).encode()))
        self.assertEqual(answer["code"], "RESOURCE_MISMATCH")

if __name__ == "__main__":
    unittest.main()
