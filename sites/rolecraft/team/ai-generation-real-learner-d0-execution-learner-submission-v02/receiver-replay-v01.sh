#!/bin/zsh
# Independent receiver replay helper for Chenny.
# This script creates a fresh temporary directory and never writes to the
# learner's receipt directory. It does not perform a holdout or sign acceptance.

set -u

PROJECT="/Users/shengxiong/Desktop/One People Company"
SUBMISSION="$PROJECT/sites/rolecraft/team/ai-generation-real-learner-d0-execution-learner-submission-v02"
LEARNER_RAW="$SUBMISSION/raw-receipts-retry-02"
ROOT="$PROJECT/sites/rolecraft/team/ai-generation-real-learner-d0-execution-run-v01-artifacts"
RUNNER="$ROOT/implementation/d0_03_runner.py"
INPUT_SOURCE="$LEARNER_RAW/input-snapshot.json"

if [[ ! -f "$INPUT_SOURCE" || ! -f "$RUNNER" ]]; then
  print -u2 "Missing learner input or runner; refusing replay."
  exit 2
fi

REPLAY_DIR="$(mktemp -d /private/tmp/chenny-receiver-replay-v01.XXXXXX)" || exit 2
mkdir -p "$REPLAY_DIR/raw-replay"/run-1 "$REPLAY_DIR/raw-replay"/run-2
cp "$INPUT_SOURCE" "$REPLAY_DIR/raw-replay/input-snapshot.json"

print -r -- "receiver_replay_started=$(date -Iseconds)" > "$REPLAY_DIR/raw-replay/replay-metadata.txt"
print -r -- "fresh_temp_directory=$REPLAY_DIR" >> "$REPLAY_DIR/raw-replay/replay-metadata.txt"
print -r -- "input_source=$INPUT_SOURCE" >> "$REPLAY_DIR/raw-replay/replay-metadata.txt"
print -r -- "runner=$RUNNER" >> "$REPLAY_DIR/raw-replay/replay-metadata.txt"

for run in run-1 run-2; do
  for case in A-normal B-tenant-denied source-missing source-conflict; do
    command="python3 \"$RUNNER\" --case $case --run-id $run --input \"$REPLAY_DIR/raw-replay/input-snapshot.json\""
    started="$(date -Iseconds)"
    print -r -- "$started\t$run\t$case\t$command" >> "$REPLAY_DIR/raw-replay/commands.tsv"
    python3 "$RUNNER" --case "$case" --run-id "$run" --input "$REPLAY_DIR/raw-replay/input-snapshot.json" \
      > "$REPLAY_DIR/raw-replay/$run/$case.stdout" \
      2> "$REPLAY_DIR/raw-replay/$run/$case.stderr"
    code=$?
    ended="$(date -Iseconds)"
    print -r -- "$ended\t$run\t$case\t$code" >> "$REPLAY_DIR/raw-replay/exit-codes.tsv"
  done
done

print -r -- "receiver_replay_finished=$(date -Iseconds)" >> "$REPLAY_DIR/raw-replay/replay-metadata.txt"
python3 - "$REPLAY_DIR/raw-replay" <<'PY'
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
print -r -- "rebuild_command: zsh $SUBMISSION/receiver-replay-v01.sh"
print -r -- "replay_outputs: $REPLAY_DIR/raw-replay"
print -r -- "Do not mark accepted or sign until Chenny performs the independent holdout and records the evidence."
