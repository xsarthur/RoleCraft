from dataclasses import dataclass, replace
from hashlib import sha256
from pathlib import Path
from tempfile import TemporaryDirectory

@dataclass(frozen=True)
class EvidenceRef:
    evidence_id: str
    relative_path: str
    content_sha256: str
    artifact_version: str
    kind: str
    scope: str

def verify_index(root, artifact_version, entries):
    root = Path(root).resolve()
    issues = []
    seen_ids = set()
    for entry in entries:
        if entry.evidence_id in seen_ids:
            issues.append((entry.evidence_id, "DUPLICATE_EVIDENCE_ID"))
        seen_ids.add(entry.evidence_id)
        if entry.artifact_version != artifact_version:
            issues.append((entry.evidence_id, "VERSION_MISMATCH"))
        relative = Path(entry.relative_path)
        if relative.is_absolute():
            issues.append((entry.evidence_id, "PATH_NOT_RELATIVE"))
            continue
        candidate = (root / relative).resolve()
        try:
            candidate.relative_to(root)
        except ValueError:
            issues.append((entry.evidence_id, "PATH_ESCAPES_BUNDLE"))
            continue
        if not candidate.is_file():
            issues.append((entry.evidence_id, "FILE_MISSING"))
            continue
        try:
            content = candidate.read_bytes()
        except OSError:
            issues.append((entry.evidence_id, "FILE_UNREADABLE"))
            continue
        if sha256(content).hexdigest() != entry.content_sha256:
            issues.append((entry.evidence_id, "HASH_MISMATCH"))
        if not entry.kind or not entry.scope:
            issues.append((entry.evidence_id, "CLASSIFICATION_MISSING"))
    if issues:
        return "INDEX_INVALID", tuple(issues)
    return "INDEX_OK", ()

if __name__ == "__main__":
    with TemporaryDirectory() as directory:
        root = Path(directory)
        (root / "runs").mkdir()
        content = b'{"run_id":"demo-run-17","adapter":"local-double"}\n'
        (root / "runs/run-17.json").write_bytes(content)
        entry = EvidenceRef("demo-record-17", "runs/run-17.json",
                            sha256(content).hexdigest(), "demo-r1",
                            "constructed_fixture", "offline-demo")
        print(verify_index(root, "demo-r1", [entry])[0])
        (root / "runs/run-17.json").write_bytes(b'changed\n')
        print(verify_index(root, "demo-r1", [entry])[1][0][1])
        (root / "runs/run-17.json").write_bytes(content)
        old = replace(entry, artifact_version="demo-r0")
        print(verify_index(root, "demo-r1", [old])[1][0][1])
