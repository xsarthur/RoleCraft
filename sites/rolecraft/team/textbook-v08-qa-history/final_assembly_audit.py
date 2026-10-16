"""Independent exact source-to-assembly audit; no author assembler executed."""
import hashlib
import json
import re
from pathlib import Path
from urllib.parse import urlsplit

root = Path(__file__).resolve().parents[2]
history = Path(__file__).resolve().parent
artifact = root / "textbooks/v08/agent-engineering-textbook.md"
manifest_path = root / "team/textbook-v08-author-core-assembly-manifest.json"
manifest = json.loads(manifest_path.read_text())
order = ["v08/f01.md", "v08/f02.md", "v08/c01-solution-selection.md", "agent-control-loop-v07.md", "v08/c02.md", "v08/c03.md", "v08/e01.md", "v08/e02.md", "v08/e03.md", "v08/e04.md", "v08/e05.md", "v08/p01.md", "v08/p02.md"]
sources = [root / "textbooks" / part for part in order]
actual = artifact.read_text()
parts = re.split(r"\n---\n\n来源：\[([^\]]+)\]\(<([^>]+)>\)\n\n", actual)
assert len(parts) == 1 + 3 * len(sources), "unexpected chapter source markers"
assert [item["source"] for item in manifest["sources"]] == [str(p) for p in sources], "manifest order/path mismatch"

def digest(data):
    return hashlib.sha256(data).hexdigest()

def transform(text, source):
    # This separately implements the permitted rules, without author code.
    result = []
    fenced = False
    marker = None
    headings = 0
    links = []
    for line in text.splitlines(True):
        opening = re.match(r"^(`{3,}|~{3,})", line)
        if opening:
            if not fenced:
                fenced, marker = True, opening.group(1)[0]
            elif opening.group(1)[0] == marker:
                fenced, marker = False, None
            result.append(line)
            continue
        if fenced:
            result.append(line)
            continue
        if re.match(r"^#{1,6} ", line):
            line = "#" + line
            headings += 1
        def replace_link(match):
            dest = match.group(2)
            bare = dest[1:-1] if dest.startswith("<") and dest.endswith(">") else dest
            parsed = urlsplit(bare)
            if parsed.scheme or parsed.netloc:
                return match.group(0)
            target = (source.parent / parsed.path).resolve() if parsed.path else source.resolve()
            absolute = str(target) + ("#" + parsed.fragment if parsed.fragment else "")
            links.append({"from": bare, "to": absolute})
            formatted = f"<{absolute}>" if " " in absolute else absolute
            return f"[{match.group(1)}]({formatted})"
        line = re.sub(r"(?<!!)\[([^\]]+)\]\(([^)]+)\)", replace_link, line)
        result.append(line)
    assert not fenced, "unclosed source fence"
    return "".join(result), headings, links

def fences(text):
    result = []
    current = None
    marker = None
    for line in text.splitlines(True):
        opening = re.match(r"^(`{3,}|~{3,})", line)
        if current is None and opening:
            current, marker = [line], opening.group(1)[0]
        elif current is not None:
            current.append(line)
            if opening and opening.group(1)[0] == marker:
                result.append("".join(current).encode())
                current, marker = None, None
    assert current is None
    return result

records = []
for index, source in enumerate(sources):
    label, link, body = parts[index * 3 + 1:index * 3 + 4]
    raw = source.read_bytes()
    transformed, headings, links = transform(raw.decode(), source)
    srcf, bookf = fences(raw.decode()), fences(body)
    expected = manifest["sources"][index]
    independent_fences = [{"index": n + 1, "sha256": digest(data), "bytes": len(data)} for n, data in enumerate(srcf)]
    checks = {
        "chapterLabelAndSource": label == source.name and link == str(source),
        "sourceShaMatchesManifest": digest(raw) == expected["sourceSha256"],
        "sourceBytesMatch": len(raw) == expected["sourceBytes"],
        "entireBodyEqualsPermittedSourceTransform": body == transformed,
        "transformedDigestMatchesManifest": digest(transformed.encode()) == expected["transformedBodySha256"],
        "transformedBytesMatch": len(transformed.encode()) == expected["transformedBodyBytes"],
        "headingCountMatches": headings == expected["headingLevelsLowered"],
        "localLinkConversionsMatch": links == expected["localLinkConversions"],
        "fencesByteExact": srcf == bookf,
        "fenceDigestListMatchesManifest": independent_fences == expected["fencedBlocks"],
    }
    records.append({"order": index + 1, "source": str(source), "sourceSha256": digest(raw), "checks": checks, "headingTransforms": headings, "localLinkTransforms": links, "fullFences": independent_fences})
data = artifact.read_bytes()
overall = {"outputShaMatchesManifest": digest(data) == manifest["artifactSha256"], "outputBytesMatch": len(data) == manifest["artifactBytes"], "sourceCount": len(records) == 13, "frozenV07Unchanged": digest(sources[3].read_bytes()) == "996e5aeb084b66405a0dd1023a375743d2e359c335b29517ac923f9f6a033c5c"}
expected_prefix = ("# Agent 开发工程教材\n\n"
                   f"[按主题选择分章阅读](<{root}/textbooks/v08/README.md>)。\n\n"
                   "按课程阅读顺序合并当前十三篇正文；每篇开头保留权威源文件链接。正文只调整围栏外标题层级与本地链接，代码围栏字节保持原样。实际审校和执行范围见"
                   f"[内容审校](<{root}/team/textbook-v08-content-review.md>)及[QA记录](<{root}/team/textbook-v08-qa.md>)。\n")
overall["headerOnlyDeclaredNavigationAndScope"] = parts[0] == expected_prefix
failed = [{"source": r["source"], "failedChecks": [key for key, value in r["checks"].items() if not value]} for r in records if not all(r["checks"].values())]
out = {"method": "independent deterministic transformation from each actual source; compared entire transformed bodies and full fences byte-for-byte, then checked author manifest rather than accepting it as proof", "artifact": str(artifact), "artifactSha256": digest(data), "artifactBytes": len(data), "assemblyManifestSha256": digest(manifest_path.read_bytes()), "overall": overall, "chapters": records, "completeFenceCount": sum(len(r["fullFences"]) for r in records), "localLinkTransformCount": sum(len(r["localLinkTransforms"]) for r in records), "failed": failed, "notNewTechnicalReview": True, "codeExecutedByThisAudit": False}
(history / "final-assembly-binding.json").write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n")
print(json.dumps({"artifactSha256": out["artifactSha256"], "overall": overall, "chapters": len(records), "fences": out["completeFenceCount"], "linkTransforms": out["localLinkTransformCount"], "failed": failed}, ensure_ascii=False))
raise SystemExit(1 if failed or not all(overall.values()) else 0)
