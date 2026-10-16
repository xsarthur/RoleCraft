#!/bin/zsh
# Chenny-only independent dynamic holdout generator.
# Do not run as the learner. This creates evidence in /private/tmp only and
# never changes learner receipts or the acceptance record.
set -u

PROJECT="/Users/shengxiong/Desktop/One People Company"
SUBMISSION="$PROJECT/sites/rolecraft/team/ai-generation-real-learner-d0-execution-learner-submission-v02"
ROOT="$PROJECT/sites/rolecraft/team/ai-generation-real-learner-d0-execution-run-v01-artifacts"
RUNNER="$ROOT/implementation/d0_03_runner.py"
INPUT_SOURCE="$SUBMISSION/raw-receipts-retry-02/input-snapshot.json"

if [[ "${CHENNY_RECEIVER:-}" != "true" ]]; then
  print -u2 -- "This holdout must be run by Chenny in her independent session (set CHENNY_RECEIVER=true)."
  exit 2
fi
if [[ ! -f "$INPUT_SOURCE" || ! -f "$RUNNER" ]]; then
  print -u2 -- "Missing learner input or runner; refusing holdout."
  exit 2
fi

HOLDOUT_DIR="$(mktemp -d /private/tmp/chenny-receiver-holdout-v01.XXXXXX)" || exit 2
mkdir -p "$HOLDOUT_DIR/evidence"
cp "$INPUT_SOURCE" "$HOLDOUT_DIR/input-original.json"

# Select one source field without printing the chosen value. The mutation is
# intentionally secret from the learner and is recorded only in holdout evidence.
python3 - "$INPUT_SOURCE" "$HOLDOUT_DIR/input-holdout.json" "$HOLDOUT_DIR/variant.json" <<'PY'
import json, secrets, sys
src, dst, meta = sys.argv[1:]
data = json.loads(open(src, encoding='utf-8').read())
field = secrets.choice(['document_id', 'source_version', 'text'])
original = data['authorized_source'][field]
if field == 'document_id':
    value = original + '-holdout'
elif field == 'source_version':
    value = original + '-holdout'
else:
    value = original + '（独立holdout变体）'
data['authorized_source'][field] = value
with open(dst, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, sort_keys=True, separators=(',', ':'))
with open(meta, 'w', encoding='utf-8') as f:
    json.dump({'mutation_field': field, 'original_value_sha256': __import__('hashlib').sha256(str(original).encode()).hexdigest(), 'variant_value_sha256': __import__('hashlib').sha256(str(value).encode()).hexdigest()}, f, ensure_ascii=False, sort_keys=True, indent=2)
PY

print -r -- "created_at=$(date -Iseconds)" > "$HOLDOUT_DIR/evidence/metadata.txt"
print -r -- "holdout_directory=$HOLDOUT_DIR" >> "$HOLDOUT_DIR/evidence/metadata.txt"
print -r -- "runner=$RUNNER" >> "$HOLDOUT_DIR/evidence/metadata.txt"
print -r -- "input=$HOLDOUT_DIR/input-holdout.json" >> "$HOLDOUT_DIR/evidence/metadata.txt"
print -r -- "status=not_met_if_runner_rejects_dynamic_source" >> "$HOLDOUT_DIR/evidence/metadata.txt"

set +e
python3 "$RUNNER" --case A-normal --run-id run-1 --input "$HOLDOUT_DIR/input-holdout.json" \
  > "$HOLDOUT_DIR/evidence/holdout.stdout" 2> "$HOLDOUT_DIR/evidence/holdout.stderr"
code=$?
set -u
print -r -- "$code" > "$HOLDOUT_DIR/evidence/holdout.exit-code"
print -r -- "python3 $RUNNER --case A-normal --run-id run-1 --input $HOLDOUT_DIR/input-holdout.json" > "$HOLDOUT_DIR/evidence/holdout.command"

if [[ "$code" -eq 0 ]]; then
  holdout_status="not_met_implementation_limitation_dynamic_input_not_enforced"
else
  holdout_status="not_met_implementation_limitation_runner_rejected_dynamic_input"
fi
print -r -- "$holdout_status" > "$HOLDOUT_DIR/evidence/holdout-status.txt"

shasum -a 256 "$HOLDOUT_DIR/input-holdout.json" "$HOLDOUT_DIR/variant.json" "$HOLDOUT_DIR/evidence/holdout.stdout" "$HOLDOUT_DIR/evidence/holdout.stderr" "$HOLDOUT_DIR/evidence/holdout.exit-code" "$HOLDOUT_DIR/evidence/holdout.command" "$HOLDOUT_DIR/evidence/holdout-status.txt" > "$HOLDOUT_DIR/evidence/SHA256SUMS"
wc -c "$HOLDOUT_DIR/input-holdout.json" "$HOLDOUT_DIR/variant.json" "$HOLDOUT_DIR/evidence/holdout.stdout" "$HOLDOUT_DIR/evidence/holdout.stderr" "$HOLDOUT_DIR/evidence/holdout.exit-code" "$HOLDOUT_DIR/evidence/holdout.command" "$HOLDOUT_DIR/evidence/holdout-status.txt" > "$HOLDOUT_DIR/evidence/BYTES"
print -r -- "holdout_directory=$HOLDOUT_DIR"
print -r -- "status=$holdout_status"
print -r -- "evidence=$HOLDOUT_DIR/evidence"
