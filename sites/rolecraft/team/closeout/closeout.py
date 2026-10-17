#!/usr/bin/env python3
"""One-case explicit closeout. No event adapter, model call, or Git mutation."""
import argparse
import hashlib
import json
import os
import re
import signal
import stat
import subprocess
import sys
from contextlib import contextmanager
from dataclasses import dataclass
from pathlib import Path

CASE = "20261017"
PROJECT_HEAD = "33be2f73c893ae6262db359f4a51970bab51f67e"
METHOD_HEAD = "a848db9f9ab6605aa7379dddef3faa918e412f96"
BRANCH = "integration/peiyu-team-onboarding-20261017"
ORIGINS = {"project": "git@github.com:xsarthur/RoleCraft.git",
           "method": "git@github.com:chennyqian/ai-team-handbook.git"}
PROJECT_FILES = (
    "AGENTS.md", "sites/rolecraft/team/onboarding/README.md",
    "sites/rolecraft/team/onboarding/TEAM-ROUTING.md",
    "sites/rolecraft/team/onboarding/APPLICATION-NOTES.md",
    "sites/rolecraft/team/team-method-loop-20261017-archive.md",
    "sites/rolecraft/team/team-method-loop-20261017-evidence.json",
    "sites/rolecraft/team/closeout/closeout.py",
    "sites/rolecraft/team/closeout/test_closeout.py",
    "sites/rolecraft/team/closeout/README.md")
METHOD_FILES = ("proposals/version-bound-fact-claims-v01.md",)
OUTPUTS = {"project_md": "sites/rolecraft/team/task-closeout-20261017.md",
           "project_json": "sites/rolecraft/team/task-closeout-20261017.json",
           "method_md": "proposals/entry-status-and-evidence-links-v01.md"}
READ_STATES = {"actual_read_with_trace", "parent_observation", "missing", "observed",
               "partial", "unverified", "self_report", "hash_only", "not_applicable"}


class Refused(Exception):
    pass


def sha(data):
    return hashlib.sha256(data).hexdigest()


def encoded(value):
    return (json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2) + "\n").encode()


def safe(path):
    """Reject symlinks at every existing component; never resolve through one."""
    path = Path(path)
    if not path.is_absolute() or ".." in path.parts:
        raise Refused("unsafe_path")
    for item in (path, *path.parents):
        if item.is_symlink():
            raise Refused("symlink_rejected")
    return path


def digest(path):
    raw = read_file(path)
    return sha(raw) if raw is not None else None


def read_file(path):
    path = safe(path)
    with directory(path.parent) as fd:
        raw = read_at(fd, path.name)
        check_binding(fd, path.parent)
        return raw


@contextmanager
def directory(path):
    """Walk from / using descriptors; never follow a symlink in any component."""
    path = Path(path)
    if not path.is_absolute() or ".." in path.parts:
        raise Refused("unsafe_path")
    flags = os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW
    fd = os.open("/", flags)
    try:
        for part in path.parts[1:]:
            newer = os.open(part, flags, dir_fd=fd)
            os.close(fd)
            fd = newer
        yield fd
    finally:
        os.close(fd)


def check_binding(fd, path):
    try:
        with directory(path) as current:
            a, b = os.fstat(fd), os.fstat(current)
            if (a.st_dev, a.st_ino) != (b.st_dev, b.st_ino):
                raise Refused("directory_binding_changed")
    except OSError as exc:
        raise Refused("directory_binding_changed") from exc


def read_at(fd, name):
    try:
        source = os.open(name, os.O_RDONLY | os.O_NOFOLLOW, dir_fd=fd)
    except FileNotFoundError:
        return None
    try:
        if not stat.S_ISREG(os.fstat(source).st_mode):
            raise Refused("not_regular_file")
        with os.fdopen(source, "rb", closefd=False) as stream:
            return stream.read()
    finally:
        os.close(source)


def own_at(fd, name, identity):
    try:
        actual = os.stat(name, dir_fd=fd, follow_symlinks=False)
    except FileNotFoundError:
        return False
    return stat.S_ISREG(actual.st_mode) and (actual.st_dev, actual.st_ino) == identity


def validate_claims(value):
    """Reserved structured claims cannot contradict the bounded wrapper evidence."""
    fixed = {"natural_loading": "FAIL/partial", "formal_method_adopted": False,
             "growth_awarded": False, "natural_event_connected": False,
             "reading_gate": "insufficient"}
    if isinstance(value, dict):
        for key, child in value.items():
            label = key.lower()
            if label in fixed and (type(child) is not type(fixed[label]) or child != fixed[label]):
                raise Refused("contradictory_claim:" + label)
            if re.search(r"understand|comprehend|mastery", label) and child not in (None, False, "unverified", "insufficient", "not_proven"):
                raise Refused("unverified_understanding_claim")
            validate_claims(child)
    elif isinstance(value, list):
        for child in value:
            validate_claims(child)


@dataclass(frozen=True)
class Paths:
    project: Path
    method: Path
    audit: Path

    @classmethod
    def installed(cls):
        project = Path(__file__).absolute().parents[4]
        return cls(project, project.parent.parent / "task-3" / "ai-team-handbook-loop-review",
                   project.parent / "review" / "closeout-stage3-20261017")

    def target(self, key):
        return safe((self.method if key == "method_md" else self.project) / OUTPUTS[key])

    @property
    def lock(self):
        return safe(self.project / "sites/rolecraft/team/.closeout.lock")


def git_snapshot(root):
    def git(*args):
        result = subprocess.run(["git", "--no-optional-locks", "-C", str(root), *args],
                                check=True, capture_output=True, text=True,
                                env={**os.environ, "GIT_OPTIONAL_LOCKS": "0"})
        return result.stdout.strip()
    index = Path(git("rev-parse", "--git-path", "index"))
    if not index.is_absolute():
        index = root / index
    return {"head": git("rev-parse", "HEAD"), "branch": git("branch", "--show-current"),
            "origin": git("remote", "get-url", "origin"), "index_sha256": digest(index)}


class Closeout:
    """Fixture injection is an import-only test seam; CLI cannot change roots/providers."""

    def __init__(self, paths, request_sha, snapshot=git_snapshot, checkpoint=None):
        self.paths = paths
        self.snapshot = snapshot
        self.checkpoint = checkpoint or (lambda stage: False)
        request_path = safe(paths.audit / "request.json")
        raw = read_file(request_path)
        if sha(raw) != request_sha:
            raise Refused("request_hash_mismatch")
        self.request_sha = request_sha
        self.request = json.loads(raw)
        self.validate()
        payloads = self.request["payloads"]
        self.key = sha(encoded({"case": CASE, "baseline": self.request["baseline"],
                               "evidence": self.request["evidence"], "payloads": payloads}))
        receipt = {"schema_version": 1, "case_id": CASE, "event": "closeout.requested",
                   "idempotency_key": self.key, "project_record": payloads["project_record"],
                   "evidence": self.request["evidence"],
                   "record_kind": "project_layer_publication_snapshot", "scope": "before_method_attempt",
                   "method_at_publication": "not_attempted",
                   "final_resolution": "closeout tool must verify both layer bytes and private run-journal.json; this snapshot is not the final overall result",
                   "immutable_receipt": True, "natural_event_connected": False,
                   "formal_method_adopted": False, "growth_awarded": False}
        self.payloads = {"project_md": payloads["project_md"].encode(),
                         "project_json": encoded(receipt), "method_md": payloads["method_md"].encode()}
        self.hashes = {key: sha(value) for key, value in self.payloads.items()}
        self.events = []
        self.published = set()
        self.journal_hash = None
        self.lock_identity = None
        self.lock_parent = None
        self.lock_data = None

    def validate(self):
        req = self.request
        if req.get("schema_version") != 1 or req.get("event") != "closeout.requested" or req.get("case_id") != CASE:
            raise Refused("wrong_case_or_event")
        expected = {"project": str(self.paths.project), "method": str(self.paths.method)}
        if req.get("roots") != expected:
            raise Refused("roots_must_match_installed_targets")
        for path in (self.paths.project, self.paths.method, self.paths.audit):
            safe(path)
            if not path.is_dir():
                raise Refused("missing_existing_directory")
        baseline = req["baseline"]
        for name, files, head in (("project", PROJECT_FILES, PROJECT_HEAD), ("method", METHOD_FILES, METHOD_HEAD)):
            if baseline[name]["head"] != head or baseline[name]["origin"] != ORIGINS[name]:
                raise Refused("unapproved_baseline")
            if set(baseline["protected"][name]) != set(files):
                raise Refused("protected_whitelist_mismatch")
            for value in (*baseline["protected"][name].values(), baseline[name]["index_sha256"]):
                if not isinstance(value, str) or not re.fullmatch(r"[a-f0-9]{64}", value):
                    raise Refused("invalid_expected_hash")
        evidence = req["evidence"]
        validate_claims(evidence)
        if evidence.get("natural_loading") != "FAIL/partial":
            raise Refused("natural_loading_result_must_be_preserved")
        if evidence.get("observation_basis") != "parent_observation/local_trace_not_available":
            raise Refused("source_observation_basis_must_be_preserved")
        if not evidence.get("source_versions") or not evidence.get("reading_checklist"):
            raise Refused("missing_reading_evidence")
        for row in evidence["reading_checklist"]:
            if not all(field in row for field in ("source_id", "required", "status", "trace_ref", "summary", "application", "limitations")):
                raise Refused("incomplete_reading_row")
            if row["status"] not in READ_STATES:
                raise Refused("unknown_read_status")
            if row["status"] == "actual_read_with_trace" and not row["trace_ref"]:
                raise Refused("actual_read_requires_trace")
        payloads = req["payloads"]
        validate_claims(payloads["project_record"])
        if set(payloads) != {"project_md", "project_record", "method_md"} or not isinstance(payloads["project_record"], dict):
            raise Refused("payload_schema")
        shared = encoded({"payloads": payloads, "evidence": evidence}).decode()
        if len(shared.encode()) > 180000 or re.search(r"/Users/|/home/|chatgpt\.com/c/|(?:BEGIN .*PRIVATE KEY)", shared):
            raise Refused("shared_payload_privacy_or_size")
        if "DRAFT" not in payloads["method_md"] or "FAIL/partial" not in payloads["project_md"]:
            raise Refused("required_status_missing")

    def verify_sources(self):
        for name in ("project", "method"):
            root = getattr(self.paths, name)
            expected = self.request["baseline"][name]
            actual = self.snapshot(safe(root))
            if any(actual.get(key) != expected[key] for key in ("head", "index_sha256", "origin")):
                raise Refused(name + "_version_drift")
            if name == "project" and actual.get("branch") != BRANCH:
                raise Refused("project_branch_drift")
            for rel, expected_hash in self.request["baseline"]["protected"][name].items():
                if digest(root / rel) != expected_hash:
                    raise Refused(name + "_protected_file_drift")

    def read_events(self):
        path = safe(self.paths.audit / "run-journal.json")
        if not path.exists():
            self.events, self.journal_hash = [], None
            return
        raw = read_file(path)
        if not raw.endswith(b"\n"):
            raise Refused("incomplete_journal_requires_manual_review")
        try:
            self.events = [json.loads(line) for line in raw.splitlines()]
        except (ValueError, TypeError) as exc:
            raise Refused("invalid_journal_requires_manual_review") from exc
        if not self.events or any(e.get("key") != self.key or e.get("request_sha256") != self.request_sha for e in self.events):
            raise Refused("journal_bound_to_other_request")
        self.journal_hash = sha(raw)
        self.published.update(e["state"][6:] for e in self.events
                              if e.get("state", "").startswith("saved_") and e["state"][6:] in OUTPUTS)

    def append(self, state, **extra):
        path = safe(self.paths.audit / "run-journal.json")
        with directory(path.parent) as parent:
            raw = read_at(parent, path.name)
            if (sha(raw) if raw is not None else None) != self.journal_hash:
                raise Refused("journal_concurrent_change")
            flags = os.O_WRONLY | os.O_APPEND | os.O_NOFOLLOW
            if self.journal_hash is None:
                flags |= os.O_CREAT | os.O_EXCL
            check_binding(parent, path.parent)
            fd = os.open(path.name, flags, 0o600, dir_fd=parent)
            with os.fdopen(fd, "ab") as output:
                own = os.fstat(output.fileno())
                if not own_at(parent, path.name, (own.st_dev, own.st_ino)):
                    raise Refused("journal_replaced")
                check_binding(parent, path.parent)
                event = {"key": self.key, "request_sha256": self.request_sha, "state": state, **extra}
                line = (json.dumps(event, ensure_ascii=False, sort_keys=True) + "\n").encode()
                output.write(line)
                output.flush()
                os.fsync(output.fileno())
            check_binding(parent, path.parent)
            os.fsync(parent)
        self.read_events()

    def publish(self, path, data):
        """Publish without replacing any destination, even after a precheck race."""
        path = safe(path)
        name, temp = path.name, path.name + ".tmp"
        with directory(path.parent) as parent:
            check_binding(parent, path.parent)
            if read_at(parent, name) is not None or read_at(parent, temp) is not None:
                raise Refused("target_or_temp_already_exists")
            fd = os.open(temp, os.O_CREAT | os.O_EXCL | os.O_WRONLY | os.O_NOFOLLOW, 0o600, dir_fd=parent)
            info = os.fstat(fd)
            identity = (info.st_dev, info.st_ino)
            linked = False
            try:
                with os.fdopen(fd, "wb") as output:
                    output.write(data)
                    output.flush()
                    os.fsync(output.fileno())
                if read_at(parent, temp) != data:
                    raise Refused("temp_readback_failed")
                check_binding(parent, path.parent)
                os.link(temp, name, src_dir_fd=parent, dst_dir_fd=parent, follow_symlinks=False)
                linked = True
                check_binding(parent, path.parent)
                os.fsync(parent)
                if read_at(parent, name) != data:
                    raise Refused("output_readback_failed")
                check_binding(parent, path.parent)
            except BaseException:
                # A moved parent must not leave our new publication outside the approved tree.
                # Descriptor cleanup touches only the exact inode created by this call.
                if linked and own_at(parent, name, identity) and read_at(parent, name) == data:
                    os.unlink(name, dir_fd=parent)
                    os.fsync(parent)
                raise
            finally:
                if own_at(parent, temp, identity) and read_at(parent, temp) == data:
                    os.unlink(temp, dir_fd=parent)
                    os.fsync(parent)

    @staticmethod
    def sync_directory(path):
        with directory(path) as fd:
            os.fsync(fd)

    def verify_targets(self, resumed, require_all=False):
        for key in OUTPUTS:
            target = self.paths.target(key)
            observed = digest(target)
            if observed is None and (require_all or key in self.published):
                raise Refused("published_target_missing:" + key)
            if observed is not None and (not resumed or observed != self.hashes[key]):
                raise Refused("target_drift:" + key)
            if Path(str(target) + ".tmp").exists():
                raise Refused("leftover_temp_requires_manual_review")

    def plan(self):
        self.verify_sources()
        self.read_events()
        self.verify_targets(bool(self.events))
        return {"mode": "read_only_plan", "event": "closeout.requested", "key": self.key,
                "output_sha256": self.hashes, "natural_event_connected": False,
                "natural_loading": "FAIL/partial", "reading_gate": "insufficient",
                "prior_state": self.events[-1]["state"] if self.events else "not_started",
                "targets": OUTPUTS, "writes": 0}

    def acquire(self):
        path = self.paths.lock
        data = encoded({"pid": os.getpid(), "key": self.key, "request_sha256": self.request_sha})
        with directory(path.parent) as parent:
            check_binding(parent, path.parent)
            fd = os.open(path.name, os.O_CREAT | os.O_EXCL | os.O_WRONLY | os.O_NOFOLLOW, 0o600, dir_fd=parent)
            with os.fdopen(fd, "wb") as output:
                output.write(data)
                output.flush()
                os.fsync(output.fileno())
                info = os.fstat(output.fileno())
                self.lock_identity = (info.st_dev, info.st_ino)
            self.lock_parent, self.lock_data = os.dup(parent), data
            try:
                check_binding(parent, path.parent)
            except BaseException:
                self.release()
                raise

    def release(self):
        path = self.paths.lock
        if self.lock_parent is not None:
            parent, self.lock_parent = self.lock_parent, None
            try:
                if own_at(parent, path.name, self.lock_identity) and read_at(parent, path.name) == self.lock_data:
                    os.unlink(path.name, dir_fd=parent)
                    os.fsync(parent)
                else:
                    raise Refused("lock_replaced_not_removed")
            finally:
                os.close(parent)

    def backup(self):
        path = safe(self.paths.audit / "preflight-backup.json")
        expected = {"schema_version": 1, "key": self.key, "request_sha256": self.request_sha,
                    "baseline": self.request["baseline"], "original_targets": {key: None for key in OUTPUTS},
                    "output_sha256": self.hashes, "policy": "new immutable files only; no replacement"}
        data = encoded(expected)
        if path.exists():
            if read_file(path) != data:
                raise Refused("backup_drift")
        else:
            if self.events:
                raise Refused("missing_backup_on_resume")
            self.publish(path, data)
        if read_file(path) != data:
            raise Refused("backup_readback_failed")

    def execute(self, mode):
        self.acquire()
        try:
            self.verify_sources()
            self.read_events()
            resumed = bool(self.events)
            if mode == "apply" and resumed and self.events[-1]["state"] != "complete":
                raise Refused("explicit_resume_required")
            if mode == "resume" and not resumed:
                raise Refused("nothing_to_resume")
            self.verify_targets(resumed)
            self.backup()
            if resumed and self.events[-1]["state"] == "complete":
                if all(digest(self.paths.target(k)) == self.hashes[k] for k in OUTPUTS):
                    return self.result("complete", idempotent=True)
                raise Refused("completed_output_missing")
            if mode == "cancel":
                self.append("cancelled", saved=self.saved())
                return self.result("cancelled")
            if not resumed:
                self.append("started")
            for key in OUTPUTS:
                self.verify_sources()
                self.verify_targets(True)
                if self.checkpoint("before_" + key):
                    self.append("cancelled", saved=self.saved())
                    return self.result("cancelled")
                self.verify_sources()
                self.verify_targets(True)
                target = self.paths.target(key)
                if digest(target) is None:
                    try:
                        self.publish(target, self.payloads[key])
                    except OSError as exc:
                        state = "project_saved_method_pending" if key == "method_md" else "save_failed"
                        self.append(state, failed_target=key, errno=exc.errno, saved=self.saved())
                        return self.result(state, error="filesystem_operation_failed", errno=exc.errno)
                self.published.add(key)
                self.append("saved_" + key, sha256=self.hashes[key])
            self.verify_sources()
            self.verify_targets(True, require_all=True)
            self.append("complete", saved=self.saved())
            return self.result("complete")
        finally:
            self.release()

    def saved(self):
        return {key: digest(self.paths.target(key)) for key in OUTPUTS}

    def result(self, state, **extra):
        return {"state": state, "key": self.key, "saved_sha256": self.saved(),
                "natural_event_connected": False, "natural_loading": "FAIL/partial",
                "formal_method_adopted": False, "reading_gate": "insufficient", **extra}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("mode", choices=("plan", "apply", "resume", "cancel"))
    parser.add_argument("--request", required=True)
    parser.add_argument("--expect-request-sha256", required=True)
    args = parser.parse_args()
    paths = Paths.installed()
    if Path(args.request).absolute() != paths.audit / "request.json":
        parser.error("request must be the fixed private audit request.json")
    cancelled = [False]
    signal.signal(signal.SIGINT, lambda *_: cancelled.__setitem__(0, True))
    try:
        engine = Closeout(paths, args.expect_request_sha256, checkpoint=lambda _: cancelled[0])
        result = engine.plan() if args.mode == "plan" else engine.execute(args.mode)
        print(json.dumps(result, ensure_ascii=False, sort_keys=True))
        return 0 if result.get("state", "complete") == "complete" else 2
    except (Refused, OSError, ValueError, KeyError, TypeError, subprocess.CalledProcessError) as exc:
        print(json.dumps({"state": "refused", "reason": str(exc), "automatic_retry": False}), file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
