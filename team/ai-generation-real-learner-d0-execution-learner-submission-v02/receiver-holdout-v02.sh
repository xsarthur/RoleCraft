#!/bin/zsh
# Chenny-only independent holdout for the v02 dynamic-source runner.
# It changes document_id, source_version, and text together, updates the text
# hash, and records all evidence in a fresh /private/tmp directory.
set -u

PROJECT="/Users/shengxiong/Desktop/One People Company"
SUBMISSION="$PROJECT/sites/rolecraft/team/ai-generation-real-learner-d0-execution-learner-submission-v02"
ROOT="$PROJECT/sites/rolecraft/team/ai-generation-real-learner-d0-execution-run-v01-artifacts"
RUNNER="$ROOT/implementation/d0_03_runner-v02-dynamic.py"
INPUT_SOURCE="$SUBMISSION/raw-receipts-retry-02/input-snapshot.json"

if [[ "${CHENNY_RECEIVER:-}" != "true" ]]; then
  print -u2 -- "This holdout must be run by Chenny in her independent session (set CHENNY_RECEIVER=true)."
  exit 2
fi
if [[ ! -f "$INPUT_SOURCE" || ! -f "$RUNNER" ]]; then
  print -u2 -- "Missing learner input or v02 runner; refusing holdout."
  exit 2
fi

HOLDOUT_DIR="$(mktemp -d /private/tmp/chenny-receiver-holdout-v02.XXXXXX)" || exit 2
EVIDENCE="$HOLDOUT_DIR/evidence"
mkdir -p "$EVIDENCE"
cp "$INPUT_SOURCE" "$HOLDOUT_DIR/input-original.json"

# The selected values are recorded only in the private evidence directory.
python3 - "$INPUT_SOURCE" "$HOLDOUT_DIR/input-holdout.json" "$HOLDOUT_DIR/variant.json" <<'PY'
import hashlib, json, secrets, sys
src, dst, meta = sys.argv[1:]
data = json.loads(open(src, encoding="utf-8").read())
source = dict(data["authorized_source"])
suffix = secrets.token_hex(4)
source["document_id"] = f"doc-A-holdout-{suffix}"
source["source_version"] = f"holdout-policy-{suffix}"
source["location"] = f"fixture://docs/{source['document_id']}#rules"
source["text"] = "发货超过7天需人工复核；人工复核标记为必需。"
source["hash"] = hashlib.sha256(source["text"].encode("utf-8")).hexdigest()
data["authorized_source"] = source
with open(dst, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
with open(meta, "w", encoding="utf-8") as f:
    json.dump({
        "mutation_fields": ["document_id", "source_version", "text"],
        "variant_document_id": source["document_id"],
        "variant_source_version": source["source_version"],
        "variant_location": source["location"],
        "variant_text_sha256": source["hash"],
        "variant_input_sha256": hashlib.sha256(open(dst, "rb").read()).hexdigest(),
    }, f, ensure_ascii=False, sort_keys=True, indent=2)
PY

print -r -- "created_at=$(date -Iseconds)" > "$EVIDENCE/metadata.txt"
print -r -- "holdout_directory=$HOLDOUT_DIR" >> "$EVIDENCE/metadata.txt"
print -r -- "runner=$RUNNER" >> "$EVIDENCE/metadata.txt"
print -r -- "input=$HOLDOUT_DIR/input-holdout.json" >> "$EVIDENCE/metadata.txt"
shasum -a 256 "$RUNNER" "$HOLDOUT_DIR/input-original.json" "$HOLDOUT_DIR/input-holdout.json" "$HOLDOUT_DIR/variant.json" > "$EVIDENCE/provenance.sha256"

for run in run-1 run-2; do
  python3 "$RUNNER" --case A-normal --run-id "$run" --input "$HOLDOUT_DIR/input-holdout.json" \
    > "$EVIDENCE/$run.stdout" 2> "$EVIDENCE/$run.stderr"
  code=$?
  print -r -- "$code" > "$EVIDENCE/$run.exit-code"
    print -r -- "python3 \"$RUNNER\" --case A-normal --run-id $run --input \"$HOLDOUT_DIR/input-holdout.json\"" > "$EVIDENCE/$run.command"
done

python3 - "$HOLDOUT_DIR" "$EVIDENCE" <<'PY'
import hashlib, json, pathlib, sys
root, evidence = map(pathlib.Path, sys.argv[1:])
variant = json.loads((root / "variant.json").read_text(encoding="utf-8"))
source = variant["variant_document_id"], variant["variant_source_version"], variant["variant_text_sha256"]
expected = json.loads((root / "input-holdout.json").read_text(encoding="utf-8"))["authorized_source"]
expected_tuple = expected["document_id"], expected["source_version"], expected["hash"]
checks = {"variant_metadata_consistent": source == expected_tuple, "input_hash_matches_text": expected["hash"] == hashlib.sha256(expected["text"].encode("utf-8")).hexdigest()}
for run in ("run-1", "run-2"):
    raw = (evidence / f"{run}.stdout").read_bytes()
    err = (evidence / f"{run}.stderr").read_bytes()
    code = int((evidence / f"{run}.exit-code").read_text())
    result = json.loads(raw)
    checks[f"{run}_exit_zero"] = code == 0 and not err
    checks[f"{run}_draft_ready"] = result.get("draft_status") == "draft_ready_for_review" and result.get("first_failure") is None
    receipt = result.get("tool_receipt") or {}
    checks[f"{run}_receipt_dynamic"] = (receipt.get("document_id"), receipt.get("source_version"), receipt.get("hash")) == expected_tuple
    refs = [ref for claim in result.get("draft", {}).get("claims", []) for ref in claim.get("source_refs", [])]
    checks[f"{run}_claims_dynamic"] = bool(refs) and all((ref.get("document_id"), ref.get("source_version"), ref.get("hash")) == expected_tuple for ref in refs)
first = (evidence / "run-1.stdout").read_bytes()
second = (evidence / "run-2.stdout").read_bytes()
checks["run_1_run_2_byte_equal"] = first == second
status = "pass_dynamic_binding" if all(checks.values()) else "not_met_dynamic_binding"
(evidence / "checks.json").write_text(json.dumps({"status": status, "checks": checks}, ensure_ascii=False, sort_keys=True, indent=2) + "\n", encoding="utf-8")
(evidence / "holdout-status.txt").write_text(status + "\n", encoding="utf-8")
PY

shasum -a 256 "$HOLDOUT_DIR/input-holdout.json" "$HOLDOUT_DIR/variant.json" "$EVIDENCE"/* > "$EVIDENCE/SHA256SUMS"
wc -c "$HOLDOUT_DIR/input-holdout.json" "$HOLDOUT_DIR/variant.json" "$EVIDENCE"/* > "$EVIDENCE/BYTES"
holdout_status="$(cat "$EVIDENCE/holdout-status.txt")"
print -r -- "holdout_directory=$HOLDOUT_DIR"
print -r -- "status=$holdout_status"
print -r -- "evidence=$EVIDENCE"
