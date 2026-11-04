#!/usr/bin/env bash
# Acceptance precondition scan for isolated QA fixtures.
# Paste stdout into evidence/scan-before.txt (and scan-after.txt at teardown).
#
# Exit 0: no undeclared residue, and BASE is not a fixture.
# Exit 1: undeclared listener/process, or BASE points at a fixture.
#
# Known residue ports: 4556 and 4557.
# Process fingerprint: command line contains qa-isolated.
# Intentional live session (does not excuse a fixture BASE):
#   QA_FIXTURE_SESSION_DECLARED=1
set -u

KNOWN_PORTS=(4556 4557)
STAMP="$(date -u +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date)"
HOST_NAME="$(hostname 2>/dev/null || echo unknown)"
DECLARED="${QA_FIXTURE_SESSION_DECLARED:-0}"
FAIL=0
REASONS=()

note() { REASONS+=("$1"); }

resolve_base() {
  if [ -n "${BASE:-}" ]; then
    printf '%s\n%s\n' "$BASE" "env:BASE"
    return
  fi
  if [ -n "${ROLECRAFT_BASE:-}" ]; then
    printf '%s\n%s\n' "$ROLECRAFT_BASE" "env:ROLECRAFT_BASE"
    return
  fi
  if [ -n "${LEARNING_BASE:-}" ]; then
    printf '%s\n%s\n' "$LEARNING_BASE" "env:LEARNING_BASE"
    return
  fi
  if [ -n "${QA_BASE:-}" ]; then
    printf '%s\n%s\n' "$QA_BASE" "env:QA_BASE"
    return
  fi
  local port="${ROLECRAFT_PORT:-4318}"
  printf 'http://127.0.0.1:%s\n%s\n' "$port" "default"
}

base_port() {
  local url="$1" rest port
  rest="${url#*://}"
  rest="${rest%%/*}"
  rest="${rest%%\?*}"
  case "$rest" in
    *:*) port="${rest##*:}" ;;
    *) port="" ;;
  esac
  case "$port" in
    ''|*[!0-9]*) printf '%s\n' "" ;;
    *) printf '%s\n' "$port" ;;
  esac
}

port_listeners() {
  local port="$1" hex inode pid args found=0
  hex="$(printf '%04X' "$port")"
  if [ -r /proc/net/tcp ] || [ -r /proc/net/tcp6 ]; then
    while read -r inode; do
      [ -n "$inode" ] || continue
      [ "$inode" = "0" ] && continue
      found=1
      pid=""
      args=""
      for fd in /proc/[0-9]*/fd/*; do
        [ -L "$fd" ] || continue
        if [ "$(readlink "$fd" 2>/dev/null || true)" = "socket:[$inode]" ]; then
          pid="${fd#/proc/}"
          pid="${pid%%/*}"
          args="$(tr '\0' ' ' < "/proc/$pid/cmdline" 2>/dev/null || true)"
          break
        fi
      done
      if [ -n "$pid" ]; then
        printf 'LISTEN pid=%s cmd=%s\n' "$pid" "${args:-unknown}"
      else
        printf 'LISTEN inode=%s cmd=unreadable\n' "$inode"
      fi
    done < <(awk -v suffix=":$hex" 'NR>1 && $4=="0A" && substr($2, length($2)-length(suffix)+1)==suffix { print $10 }' /proc/net/tcp /proc/net/tcp6 2>/dev/null)
  fi
  if [ "$found" -eq 0 ] && command -v ss >/dev/null 2>&1; then
    local line
    line="$(ss -ltn "sport = :$port" 2>/dev/null | awk 'NR>1 { print }')"
    if [ -n "$line" ]; then
      printf 'LISTEN ss=%s\n' "$line"
      found=1
    fi
  fi
  if [ "$found" -eq 0 ]; then
    printf 'clear\n'
  fi
}

qa_processes() {
  local pid args count=0
  for cmd in /proc/[0-9]*/cmdline; do
    [ -r "$cmd" ] || continue
    args="$(tr '\0' ' ' < "$cmd" 2>/dev/null || true)"
    case "$args" in
      *qa-isolated*)
        pid="${cmd#/proc/}"
        pid="${pid%%/*}"
        printf 'pid=%s cmd=%s\n' "$pid" "$args"
        count=$((count + 1))
        ;;
    esac
  done
  if [ "$count" -eq 0 ]; then
    printf 'none\n'
  fi
}

mapfile -t BASE_INFO < <(resolve_base)
BASE_URL="${BASE_INFO[0]}"
BASE_SOURCE="${BASE_INFO[1]}"
BASE_PORT="$(base_port "$BASE_URL")"

{
  echo "===== qa-env-guard evidence ====="
  echo "time: $STAMP"
  echo "host: $HOST_NAME"
  echo "BASE: $BASE_URL"
  echo "BASE_SOURCE: $BASE_SOURCE"
  echo "BASE_PORT: ${BASE_PORT:-unknown}"
  echo "QA_FIXTURE_SESSION_DECLARED: $DECLARED"
  echo "-- ports --"
} 

PORT_HITS=0
for port in "${KNOWN_PORTS[@]}"; do
  detail="$(port_listeners "$port")"
  echo "port $port: $detail"
  case "$detail" in
    clear) ;;
    *) PORT_HITS=$((PORT_HITS + 1)) ;;
  esac
done

echo "-- processes --"
PROCS="$(qa_processes)"
echo "qa-isolated processes:"
echo "$PROCS"
PROC_HITS=0
case "$PROCS" in
  none) ;;
  *) PROC_HITS=1 ;;
esac

echo "-- BASE probe --"
PROBE="skipped"
if [ "$BASE_PORT" = "4556" ] || [ "$BASE_PORT" = "4557" ]; then
  PROBE="fixture-port"
  FAIL=1
  note "BASE port $BASE_PORT is a known fixture port"
fi

if command -v curl >/dev/null 2>&1; then
  HDR="$(mktemp)"
  BODY="$(mktemp)"
  cleanup() { rm -f "$HDR" "$BODY"; }
  trap cleanup EXIT
  URL="${BASE_URL%/}/api/health"
  if curl -sS -D "$HDR" -o "$BODY" --max-time 3 --max-redirs 0 "$URL" >/dev/null 2>"$HDR.err"; then
    if grep -qi '^X-RoleCraft-QA-Fixture:[[:space:]]*1' "$HDR" \
      || grep -q '"error"[[:space:]]*:[[:space:]]*"qa_fixture"' "$BODY" \
      || grep -q '"fixture"[[:space:]]*:[[:space:]]*true' "$BODY" \
      || grep -q 'ISOLATED QA FIXTURE' "$BODY" \
      || grep -q 'qa_route_unavailable' "$BODY"; then
      PROBE="fixture"
      echo "BASE health: fixture markers present ($URL)"
      echo "header: $(grep -i 'X-RoleCraft-QA-Fixture' "$HDR" | tr -d '\r' || true)"
      FAIL=1
      note "BASE health response identifies an isolated QA fixture"
    else
      if [ "$PROBE" != "fixture-port" ]; then
        PROBE="not-fixture"
      fi
      echo "BASE health: no fixture marker ($URL)"
    fi
  else
    if [ "$PROBE" != "fixture-port" ]; then
      PROBE="unreachable"
    fi
    echo "BASE health: unreachable ($URL)"
    echo "curl: $(tr '\n' ' ' < "$HDR.err" 2>/dev/null || true)"
  fi
  rm -f "$HDR.err"
else
  echo "BASE health: curl missing; port check only"
  if [ "$PROBE" != "fixture-port" ]; then
    PROBE="skipped-no-curl"
  fi
fi
echo "BASE probe: $PROBE"

if [ "$PORT_HITS" -gt 0 ] || [ "$PROC_HITS" -gt 0 ]; then
  if [ "$DECLARED" = "1" ]; then
    echo "residue: present and declared (QA_FIXTURE_SESSION_DECLARED=1)"
  else
    FAIL=1
    note "undeclared fixture residue on 4556/4557 or qa-isolated process"
    echo "residue: present and NOT declared"
  fi
else
  echo "residue: none"
fi

echo "-- verdict --"
if [ "$FAIL" -ne 0 ]; then
  echo "verdict: FAIL"
  echo "exit: 1"
  echo "reasons:"
  for reason in "${REASONS[@]}"; do
    echo "- $reason"
  done
  echo "===== end qa-env-guard ====="
  exit 1
fi

echo "verdict: PASS"
echo "exit: 0"
if [ "$DECLARED" = "1" ] && { [ "$PORT_HITS" -gt 0 ] || [ "$PROC_HITS" -gt 0 ]; }; then
  echo "reasons:"
  echo "- intentional fixture session declared; BASE is not the fixture"
fi
echo "===== end qa-env-guard ====="
exit 0
