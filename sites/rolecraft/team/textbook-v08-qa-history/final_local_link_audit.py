"""QA-only local Markdown link audit; no network or application execution.

Run after final books and assembly exist. Reads only specified manuscripts and
local Markdown anchor targets within textbooks/team. Paths to other content
are checked for existence only. Fenced code is excluded from link discovery.
"""
import hashlib
import json
import re
import unicodedata
from pathlib import Path
from urllib.parse import unquote, urlsplit

root = Path(__file__).resolve().parents[2]
history = Path(__file__).resolve().parent

def without_fences(text):
    result = []
    active = None
    for line in text.splitlines():
        match = re.match(r"^\s*(`{3,}|~{3,})", line)
        if match:
            marker = match.group(1)[0]
            if active is None:
                active = marker
            elif marker == active:
                active = None
            result.append("")
        else:
            result.append("" if active else line)
    return result

def anchors(text):
    found = set()
    duplicate = {}
    for line in without_fences(text):
        found.update(re.findall(r'<a\s+[^>]*(?:id|name)=["\']([^"\']+)', line))
        heading = re.match(r"^#{1,6}\s+(.*?)\s*#*\s*$", line)
        if not heading:
            continue
        name = heading.group(1)
        name = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", name)
        name = re.sub(r"<[^>]+>", "", name).lower()
        # GitHub-like heading anchors preserve letters/numbers, '_' and '-'.
        name = "".join(c for c in name if not unicodedata.category(c).startswith(("P", "S")) or c in "_-")
        name = re.sub(r"\s", "-", name)
        count = duplicate.get(name, 0)
        duplicate[name] = count + 1
        found.add(name + (f"-{count}" if count else ""))
    return found

files = [root / "textbooks/v08/README.md", root / "textbooks/v08/agent-engineering-textbook.md"]
files += [root / "textbooks/v08" / ("c01-solution-selection.md" if u == "c01" else f"{u}.md") for u in ("f01", "f02", "c01", "c02", "c03", "e01", "e02", "e03", "e04", "e05", "p01", "p02")]
files += [root / "textbooks/agent-control-loop-v07.md"]
records = []
source_hashes = []
cache = {}
for source in files:
    data = source.read_bytes()
    source_hashes.append({"path": str(source), "sha256": hashlib.sha256(data).hexdigest()})
    lines = without_fences(data.decode())
    for line_number, line in enumerate(lines, 1):
        for match in re.finditer(r"!?\[[^\]]*\]\((<[^>]+>|[^)]+)\)", line):
            raw = match.group(1).strip()
            if raw.startswith("<") and raw.endswith(">"):
                raw = raw[1:-1]
            else:
                raw = re.sub(r'\s+["\'][^"\']*["\']$', "", raw)
            parsed = urlsplit(raw)
            if parsed.scheme or parsed.netloc:
                continue
            target = (source.parent / unquote(parsed.path)).resolve() if parsed.path else source.resolve()
            exists = target.exists()
            okay = exists
            reason = None if exists else "LOCAL_TARGET_MISSING"
            anchor = unquote(parsed.fragment)
            if exists and anchor:
                allowed = target.is_relative_to(root / "textbooks") or target.is_relative_to(root / "team")
                if target.suffix.lower() == ".md" and allowed:
                    if target not in cache:
                        cache[target] = anchors(target.read_text())
                    if anchor not in cache[target]:
                        okay = False
                        reason = "LOCAL_ANCHOR_MISSING"
                else:
                    okay = False
                    reason = "ANCHOR_NOT_CHECKED_OUTSIDE_MARKDOWN_SCOPE"
            records.append({"source": str(source), "line": line_number, "destination": raw, "target": str(target), "anchor": anchor or None, "pass": okay, "reason": reason})
out = {"scope": "README plus 13 source units and final combined-book local inline Markdown links; code fences ignored; no external URL retrieval", "sourceHashes": source_hashes, "records": records, "checkedLocalLinkCount": len(records), "failed": [r for r in records if not r["pass"]], "limitations": "GitHub-like Markdown anchor algorithm; no browser render or website test, no remote URL availability assertion; no non-Markdown anchor rendering claim"}
(history / "final-local-links.json").write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n")
print(json.dumps({"checkedLocalLinks": len(records), "failures": out["failed"]}, ensure_ascii=False))
raise SystemExit(1 if out["failed"] else 0)
