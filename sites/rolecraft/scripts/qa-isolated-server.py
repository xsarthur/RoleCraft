#!/usr/bin/env python3
"""Isolated QA fixture. Not a learning service.

Refuses to listen unless ALLOW_ISOLATED_QA=1.
When allowed, binds 127.0.0.1 only and an OS-assigned high port
(QA_FIXTURE_PORT may override the port; the host cannot be overridden).

Every response carries X-RoleCraft-QA-Fixture: 1, fixture=true,
error=qa_fixture, and the visible marker ISOLATED QA FIXTURE.
Stop the process before acceptance ends. See
sites/rolecraft/docs/qa-fixture-session-release.md.
"""

from __future__ import annotations

import json
import os
import signal
import sys
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

MARKER = "ISOLATED QA FIXTURE"
HEADER = "X-RoleCraft-QA-Fixture"
KNOWN_RESIDUE_PORTS = (4556, 4557)
LOOPBACK = "127.0.0.1"


def allow_listen() -> bool:
    return os.environ.get("ALLOW_ISOLATED_QA", "").strip() == "1"


def fixture_body() -> dict:
    return {
        "error": "qa_fixture",
        "fixture": True,
        "marker": MARKER,
        "message": (
            "ISOLATED QA FIXTURE. This response is an isolated acceptance "
            "fixture, not the learning service and not a missing textbook."
        ),
    }


def html_page() -> str:
    payload = json.dumps(fixture_body(), ensure_ascii=False, indent=2)
    return (
        "<!doctype html>\n"
        '<html lang="zh-CN">\n'
        "<head><meta charset=\"utf-8\">"
        f"<title>{MARKER}</title></head>\n"
        "<body>\n"
        f"<header><strong>{MARKER}</strong>\n"
        "<p>当前连到验收夹具。这不是正式学习服务，也不是教材缺失。</p></header>\n"
        f"<pre>{payload}</pre>\n"
        "</body></html>\n"
    )


def banner(lines: list[str]) -> str:
    bar = "=" * 64
    return "\n".join([bar, *lines, bar])


def emit(text: str) -> None:
    sys.stdout.write(text + "\n")
    sys.stdout.flush()
    sys.stderr.write(text + "\n")
    sys.stderr.flush()


class FixtureHandler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def _write(self, status: int, body: bytes, content_type: str) -> None:
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header(HEADER, "1")
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(body)

    def _json(self, status: int) -> None:
        raw = json.dumps(fixture_body(), ensure_ascii=False).encode("utf-8")
        self._write(status, raw, "application/json; charset=utf-8")

    def _html(self) -> None:
        self._write(200, html_page().encode("utf-8"), "text/html; charset=utf-8")

    def _route(self) -> None:
        path = self.path.split("?", 1)[0]
        if path.startswith("/api/"):
            # Health is 200 so a probe can read the fixture marker.
            # It is not a learning-service health body.
            # Other API routes use 409 so they are not a production content 404.
            self._json(200 if path == "/api/health" else 409)
            return
        accept = self.headers.get("Accept", "")
        if "application/json" in accept and "text/html" not in accept:
            self._json(200)
            return
        self._html()

    def do_GET(self) -> None:  # noqa: N802
        self._route()

    def do_HEAD(self) -> None:  # noqa: N802
        self._route()

    def do_POST(self) -> None:  # noqa: N802
        self._json(409)

    def do_PUT(self) -> None:  # noqa: N802
        self._json(409)

    def do_PATCH(self) -> None:  # noqa: N802
        self._json(409)

    def do_DELETE(self) -> None:  # noqa: N802
        self._json(409)

    def log_message(self, fmt: str, *args) -> None:
        sys.stderr.write(f"{MARKER} {self.address_string()} {fmt % args}\n")


def requested_port() -> int:
    raw = os.environ.get("QA_FIXTURE_PORT", "0").strip() or "0"
    try:
        port = int(raw)
    except ValueError as exc:
        raise SystemExit(f"{MARKER} QA_FIXTURE_PORT is not an integer: {raw}") from exc
    if port < 0 or port > 65535:
        raise SystemExit(f"{MARKER} QA_FIXTURE_PORT out of range: {port}")
    return port


def main() -> int:
    pid = os.getpid()
    allowed = allow_listen()
    if not allowed:
        emit(banner([
            MARKER,
            "REFUSING TO LISTEN",
            "ALLOW_ISOLATED_QA is not 1",
            f"pid={pid}",
            "This process is not a learning service.",
            "Set ALLOW_ISOLATED_QA=1 only for an intentional fixture session,",
            "bind stays 127.0.0.1, and the session must be stopped before acceptance ends.",
        ]))
        return 2

    ignored_host = os.environ.get("HOST") or os.environ.get("QA_FIXTURE_HOST") or ""
    port = requested_port()
    try:
        server = ThreadingHTTPServer((LOOPBACK, port), FixtureHandler)
    except OSError as exc:
        emit(banner([
            MARKER,
            "FAILED TO BIND",
            f"host={LOOPBACK} port={port} pid={pid}",
            f"error={exc}",
            "ALLOW_ISOLATED_QA=1",
        ]))
        return 2

    bound_host, bound_port = server.server_address[:2]
    if bound_host not in (LOOPBACK, "::1"):
        server.server_close()
        emit(banner([
            MARKER,
            "REFUSING NON-LOOPBACK BIND",
            f"got={bound_host}:{bound_port} pid={pid}",
        ]))
        return 2

    lines = [
        MARKER,
        "NOT A LEARNING SERVICE — do not point the product UI here.",
        "ALLOW_ISOLATED_QA=1",
        f"bind={bound_host} port={bound_port} pid={pid}",
        "known residue ports (must not be left running): 4556 4557",
        f"stop: kill {pid}",
    ]
    if ignored_host and ignored_host not in (LOOPBACK, "localhost"):
        lines.append(f"ignored non-loopback host request: {ignored_host}")
    if bound_port in KNOWN_RESIDUE_PORTS:
        lines.append(
            f"WARNING: port {bound_port} is a known residue port. "
            "Stop this process before acceptance (AT-ENV-05)."
        )
    emit(banner(lines))

    def stop(signum, _frame) -> None:
        emit(banner([
            MARKER,
            "STOPPING",
            f"signal={signum} pid={pid} port={bound_port}",
        ]))
        # shutdown() waits for serve_forever, which is this thread.
        threading.Thread(target=server.shutdown, daemon=True).start()

    signal.signal(signal.SIGTERM, stop)
    signal.signal(signal.SIGINT, stop)
    try:
        server.serve_forever()
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
