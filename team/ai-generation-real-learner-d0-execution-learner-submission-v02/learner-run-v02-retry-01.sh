#!/bin/zsh
# Learner-only runner for submission-v02.
# It refuses to touch the historical learner-receipts directory.

set -u

PROJECT="/Users/shengxiong/Desktop/One People Company"
SUBMISSION="$PROJECT/sites/rolecraft/team/ai-generation-real-learner-d0-execution-learner-submission-v02"
RAW="$SUBMISSION/raw-receipts-retry-01"
ROOT="$PROJECT/sites/rolecraft/team/ai-generation-real-learner-d0-execution-run-v01-artifacts"
RUNNER="$ROOT/implementation/d0_03_runner.py"
INPUT_SOURCE="$ROOT/input-snapshot.json"
LEARNER_ID="learner-7391842650"

cd "$PROJECT" || exit 2

if [[ -e "$RAW" ]]; then
  print -u2 "Refusing to overwrite existing learner raw receipts: $RAW"
  exit 3
fi

mkdir -p "$RAW"
date -Iseconds > "$RAW/started-at"
printf '%s\n' "zsh $SUBMISSION/learner-run-v02-retry-01.sh" > "$RAW/command.txt"
printf '%s\n' "$LEARNER_ID" > "$RAW/learner-id.txt"
pwd > "$RAW/pwd.txt"
python3 --version > "$RAW/python-version.txt" 2>&1
uname -a > "$RAW/uname.txt" 2>&1
cp "$INPUT_SOURCE" "$RAW/input-snapshot.json"
shasum -a 256 "$RAW/input-snapshot.json" > "$RAW/input-snapshot.sha256"
shasum -a 256 "$PROJECT/sites/rolecraft/team/ai-generation-l0-practice-source-001/frozen_input.json" > "$RAW/fixture.sha256"
shasum -a 256 "$PROJECT/sites/rolecraft/team/ai-generation-l0-practice-source-001/replay_verify.py" > "$RAW/replay-verify.sha256"
shasum -a 256 "$SUBMISSION/learner-run-v02.sh" > "$RAW/learner-entrypoint.sha256"

cat > "$RAW/environment.json" <<EOF
{
  "learner_id": "$LEARNER_ID",
  "execution_role": "learner local isolated execution",
  "network": "disabled",
  "real_model": false,
  "cloud": false,
  "paid_api": false,
  "real_user_data": false,
  "external_action": null,
  "learner_execution": true
}
EOF

for run in run-1 run-2; do
  mkdir -p "$RAW/$run"
  date -Iseconds > "$RAW/$run.started-at"
  for case in A-normal B-tenant-denied source-missing source-conflict; do
    python3 "$RUNNER" --case "$case" --run-id "$run" --input "$RAW/input-snapshot.json" \
      > "$RAW/$run/$case.stdout" \
      2> "$RAW/$run/$case.stderr"
    code=$?
    printf '%s\t%s\t%s\n' "$run" "$case" "$code" >> "$RAW/exit-codes.tsv"
  done
  date -Iseconds > "$RAW/$run.ended-at"
done

date -Iseconds > "$RAW/ended-at"

python3 - "$RAW" <<'PY'
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

print "Learner raw receipt collection complete: $RAW"
