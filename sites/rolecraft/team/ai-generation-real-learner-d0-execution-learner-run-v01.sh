#!/bin/zsh
# D0-03 learner-owned receipt collector.
# The learner must run this file personally from the project root.

set -u

PROJECT="/Users/shengxiong/Desktop/One People Company"
ROOT="$PROJECT/sites/rolecraft/team/ai-generation-real-learner-d0-execution-run-v01-artifacts"
RUNNER="$ROOT/implementation/d0_03_runner.py"
INPUT="$ROOT/input-snapshot.json"
RECEIPTS="$PROJECT/sites/rolecraft/team/ai-generation-real-learner-d0-execution-learner-receipts"

cd "$PROJECT" || exit 2
mkdir -p "$RECEIPTS/run-1" "$RECEIPTS/run-2"
rm -f "$RECEIPTS/exit-codes.tsv" "$RECEIPTS/SHA256SUMS" "$RECEIPTS/BYTES"

date -Iseconds > "$RECEIPTS/started-at"
printf '%s\n' "zsh $PROJECT/sites/rolecraft/team/ai-generation-real-learner-d0-execution-learner-run-v01.sh" > "$RECEIPTS/command.txt"
pwd > "$RECEIPTS/pwd.txt"
python3 --version > "$RECEIPTS/python-version.txt" 2>&1
uname -a > "$RECEIPTS/uname.txt" 2>&1
shasum -a 256 sites/rolecraft/team/ai-generation-l0-practice-source-001/frozen_input.json > "$RECEIPTS/frozen-input.sha256"
shasum -a 256 sites/rolecraft/team/ai-generation-l0-practice-source-001/replay_verify.py > "$RECEIPTS/replay-verify.sha256"

for run in run-1 run-2; do
  date -Iseconds > "$RECEIPTS/$run.started-at"
  for case in A-normal B-tenant-denied source-missing source-conflict; do
    python3 "$RUNNER" --case "$case" --run-id "$run" --input "$INPUT" \
      > "$RECEIPTS/$run/$case.stdout" \
      2> "$RECEIPTS/$run/$case.stderr"
    code=$?
    printf '%s\t%s\t%s\n' "$run" "$case" "$code" >> "$RECEIPTS/exit-codes.tsv"
  done
  date -Iseconds > "$RECEIPTS/$run.ended-at"
done

date -Iseconds > "$RECEIPTS/ended-at"

python3 - "$RECEIPTS" <<'PY'
import hashlib
import pathlib
import sys

root = pathlib.Path(sys.argv[1])
excluded = {"SHA256SUMS", "BYTES"}
files = sorted(p for p in root.rglob("*") if p.is_file() and p.name not in excluded)
with (root / "SHA256SUMS").open("w", encoding="utf-8") as out:
    for path in files:
        out.write(f"{hashlib.sha256(path.read_bytes()).hexdigest()}  {path}\n")
with (root / "BYTES").open("w", encoding="utf-8") as out:
    for path in files:
        out.write(f"{path.stat().st_size:10d}  {path}\n")
PY

printf '%s\n' "Learner receipt collection complete: $RECEIPTS"
