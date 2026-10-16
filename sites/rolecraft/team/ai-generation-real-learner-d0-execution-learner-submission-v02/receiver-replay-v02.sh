#!/bin/zsh
# Independent receiver replay helper for the v02 dynamic-source runner.
# This creates fresh evidence under /private/tmp and never writes learner
# receipts or acceptance records.
set -u

PROJECT="/Users/shengxiong/Desktop/One People Company"
SUBMISSION="$PROJECT/sites/rolecraft/team/ai-generation-real-learner-d0-execution-learner-submission-v02"
LEARNER_RAW="$SUBMISSION/raw-receipts-retry-02"
ROOT="$PROJECT/sites/rolecraft/team/ai-generation-real-learner-d0-execution-run-v01-artifacts"
RUNNER="$ROOT/implementation/d0_03_runner-v02-dynamic.py"
INPUT_SOURCE="$LEARNER_RAW/input-snapshot.json"

if [[ ! -f "$INPUT_SOURCE" || ! -f "$RUNNER" ]]; then
  print -u2 -- "Missing learner input or v02 runner; refusing replay."
  exit 2
fi

REPLAY_DIR="$(mktemp -d /private/tmp/chenny-receiver-replay-v02.XXXXXX)" || exit 2
RAW="$REPLAY_DIR/raw-replay"
mkdir -p "$RAW/run-1" "$RAW/run-2"
cp "$INPUT_SOURCE" "$RAW/input-snapshot.json"

print -r -- "receiver_replay_started=$(date -Iseconds)" > "$RAW/replay-metadata.txt"
print -r -- "fresh_temp_directory=$REPLAY_DIR" >> "$RAW/replay-metadata.txt"
print -r -- "input_source=$INPUT_SOURCE" >> "$RAW/replay-metadata.txt"
print -r -- "runner=$RUNNER" >> "$RAW/replay-metadata.txt"
shasum -a 256 "$RUNNER" "$RAW/input-snapshot.json" > "$RAW/provenance.sha256"

for run in run-1 run-2; do
  for case in A-normal B-tenant-denied source-missing source-conflict; do
    command="python3 \"$RUNNER\" --case $case --run-id $run --input \"$RAW/input-snapshot.json\""
    started="$(date -Iseconds)"
    print -r -- "$started\t$run\t$case\t$command" >> "$RAW/commands.tsv"
    python3 "$RUNNER" --case "$case" --run-id "$run" --input "$RAW/input-snapshot.json" \
      > "$RAW/$run/$case.stdout" 2> "$RAW/$run/$case.stderr"
    code=$?
    ended="$(date -Iseconds)"
    print -r -- "$ended\t$run\t$case\t$code" >> "$RAW/exit-codes.tsv"
  done
done

print -r -- "receiver_replay_finished=$(date -Iseconds)" >> "$RAW/replay-metadata.txt"
python3 - "$RAW" <<'PY'
import hashlib, pathlib, sys
root = pathlib.Path(sys.argv[1])
excluded = {"SHA256SUMS", "BYTES"}
files = sorted(p for p in root.rglob("*") if p.is_file() and p.name not in excluded)
with (root / "SHA256SUMS").open("w", encoding="utf-8") as out:
    for p in files:
        out.write(f"{hashlib.sha256(p.read_bytes()).hexdigest()}  {p}\n")
with (root / "BYTES").open("w", encoding="utf-8") as out:
    for p in files:
        out.write(f"{p.stat().st_size:10d}  {p}\n")
PY

print -r -- "fresh_temp_directory: $REPLAY_DIR"
print -r -- "rebuild_command: zsh \"$SUBMISSION/receiver-replay-v02.sh\""
print -r -- "replay_outputs: $RAW"
print -r -- "Do not mark accepted or sign until Chenny performs the independent v02 holdout and records the evidence."
