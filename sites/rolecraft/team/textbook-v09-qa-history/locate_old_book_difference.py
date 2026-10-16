"""Locate public Markdown byte differences without changing old books or executing examples."""
import difflib
import hashlib
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlsplit

history = Path(__file__).resolve().parent
root = history.parents[1]
manifest = json.loads((root / "team/textbook-v08-author-core-assembly-manifest.json").read_text())
book_path = Path(manifest["artifact"])
book_bytes = book_path.read_bytes()
book = book_bytes.decode("utf-8")
baseline = json.loads((history / "baseline.json").read_text())
baseline_book = next(r for r in baseline["frozenTextbookAndNavigation"]["records"] if r["path"] == str(book_path))
assert hashlib.sha256(book_bytes).hexdigest() == baseline_book["sha256"], "book changed after baseline"
parts = re.split(r"\n---\n\n来源：\[([^\]]+)\]\((<[^>]+>|[^)]+)\)\n\n", book)
assert len(parts) == 1 + 3 * len(manifest["sources"])


def transform(text, source):
    lines = []
    fenced = False
    marker = None
    for line in text.splitlines(True):
        fence = re.match(r"^(`{3,}|~{3,})", line)
        if fence:
            if not fenced:
                fenced, marker = True, fence.group(1)[0]
            elif fence.group(1)[0] == marker:
                fenced, marker = False, None
            lines.append(line)
            continue
        if fenced:
            lines.append(line)
            continue
        if re.match(r"^#{1,6} ", line):
            line = "#" + line

        def link(match):
            dest = match.group(2)
            dest = dest[1:-1] if dest.startswith("<") and dest.endswith(">") else dest
            parsed = urlsplit(dest)
            if parsed.scheme or parsed.netloc:
                return match.group(0)
            target = (source.parent / parsed.path).resolve() if parsed.path else source.resolve()
            absolute = str(target) + ("#" + parsed.fragment if parsed.fragment else "")
            formatted = "<" + absolute + ">" if " " in absolute else absolute
            return "[" + match.group(1) + "](" + formatted + ")"

        lines.append(re.sub(r"(?<!!)\[([^\]]+)\]\(([^)]+)\)", link, line))
    assert not fenced
    return "".join(lines)


def fences(text):
    result, block, marker = [], None, None
    for line in text.splitlines(True):
        match = re.match(r"^(`{3,}|~{3,})", line)
        if block is None and match:
            block, marker = [line], match.group(1)[0]
        elif block is not None:
            block.append(line)
            if match and match.group(1)[0] == marker:
                result.append("".join(block))
                block = None
    assert block is None
    return result


def describe(name, expected, actual):
    matcher = difflib.SequenceMatcher(a=expected.splitlines(True), b=actual.splitlines(True), autojunk=False)
    changes = []
    for kind, a, b, c, d in matcher.get_opcodes():
        if kind != "equal":
            changes.append({"kind": kind, "expectedLines": [a + 1, b], "currentLines": [c + 1, d], "expected": "".join(matcher.a[a:b]), "current": "".join(matcher.b[c:d])})
    diff = "".join(difflib.unified_diff(expected.splitlines(True), actual.splitlines(True), fromfile="frozen/" + name, tofile="current/" + name))
    return changes, diff


expected_header = (
    "# Agent 开发工程教材\n\n"
    f"[按主题选择分章阅读](<{root}/textbooks/v08/README.md>)。\n\n"
    "按课程阅读顺序合并当前十三篇正文；每篇开头保留权威源文件链接。正文只调整围栏外标题层级与本地链接，代码围栏字节保持原样。实际审校和执行范围见"
    f"[内容审校](<{root}/team/textbook-v08-content-review.md>)及[QA记录](<{root}/team/textbook-v08-qa.md>)。\n"
)
header_changes, header_diff = describe("book-header", expected_header, parts[0])
records, diffs = [], [header_diff]
for i, item in enumerate(manifest["sources"]):
    source = Path(item["source"])
    raw = source.read_bytes()
    assert hashlib.sha256(raw).hexdigest() == item["sourceSha256"]
    expected = transform(raw.decode("utf-8"), source)
    assert hashlib.sha256(expected.encode()).hexdigest() == item["transformedBodySha256"]
    label, source_link, actual = parts[i * 3 + 1:i * 3 + 4]
    changes, diff = describe(source.name, expected, actual)
    expected_link = "<" + str(source) + ">"
    records.append({"chapter": source.name, "sourceSha256": item["sourceSha256"], "labelSame": label == source.name, "sourceLinkExpected": expected_link, "sourceLinkCurrent": source_link, "bodyChanges": changes, "codeFencesByteSame": fences(expected) == fences(actual)})
    if diff:
        diffs.append(diff)
result = {
    "recordedAt": datetime.now(timezone.utc).isoformat(),
    "method": "read-only per-chapter text comparison against unchanged frozen source SHA and validated permitted transformed-body SHA; old assembly/audit scripts not run; no combined book reconstructed on disk",
    "book": str(book_path), "baselineCurrentSha256": baseline_book["sha256"], "previousFrozenSha256": manifest["artifactSha256"],
    "headerChanges": header_changes, "chapters": records,
    "chaptersWithBodyChanges": [r["chapter"] for r in records if r["bodyChanges"]],
    "all37CodeFencesByteSame": all(r["codeFencesByteSame"] for r in records),
    "sourceLinkWrapperChangedCount": sum(r["sourceLinkExpected"] != r["sourceLinkCurrent"] for r in records),
    "noOldInputFilesModified": True, "noTextbookOrApplicationExecuted": True,
    "attribution": "unknown pre-baseline user/external change; preserved; not assigned to v09 author",
    "notNewQualityOrExecutionAcceptance": True,
}
(history / "old-book-difference.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
(history / "old-book-difference.diff").write_text("\n".join(diffs))
print(json.dumps({k: v for k, v in result.items() if k not in ("headerChanges", "chapters")}, ensure_ascii=False, indent=2))
