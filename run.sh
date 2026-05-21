#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

# ── 포트 ──────────────────────────────────────────────
SERVER_PORT=40210
FACILITATOR_PORT=40211
QUESTS_PORT=40212
LECTURE_PORT=40213

# ── 로그 prefix 출력 ──────────────────────────────────
log() { local prefix="$1"; shift; echo "[$prefix] $*"; }

# ── 컬러 prefix로 각 서비스 파이프 ──────────────────
stream() {
  local name="$1"
  while IFS= read -r line; do
    echo "[$name] $line"
  done
}

# ── 종료 시 모든 자식 프로세스 kill ──────────────────
trap 'echo; echo "[run] Shutting down all services..."; kill 0' EXIT INT TERM

install_if_needed() {
  local dir="$1"
  if [ ! -d "$dir/node_modules" ]; then
    log "install" "node_modules not found in $dir, running npm install..."
    (cd "$dir" && npm install)
  fi
}

start_all() {
  echo ""
  echo "╔══════════════════════════════════════════════╗"
  echo "║          x402-all-in-one  start-all          ║"
  echo "╠══════════════════════════════════════════════╣"
  echo "║  x402-facilitator  →  :$FACILITATOR_PORT              ║"
  echo "║  x402-server       →  :$SERVER_PORT              ║"
  echo "║  x402-quests       →  :$QUESTS_PORT            ║"
  echo "║  lecture           →  :$LECTURE_PORT             ║"
  echo "╚══════════════════════════════════════════════╝"
  echo ""

  # node_modules 체크
  for dir in x402-facilitator x402-server x402-quests lecture; do
    install_if_needed "$ROOT/$dir"
  done

  # 4개 서비스 동시 시작
  (cd "$ROOT/x402-facilitator" && npm run dev 2>&1 | stream "facilitator") &
  (cd "$ROOT/x402-server"      && npm run dev 2>&1 | stream "server     ") &
  (cd "$ROOT/x402-quests"      && npm run dev 2>&1 | stream "quests     ") &
  (cd "$ROOT/lecture"          && npm run dev 2>&1 | stream "lecture    ") &

  wait
}

case "${1:-start}" in
  start)
    start_all
    ;;
  facilitator)
    cd "$ROOT/x402-facilitator" && npm run dev
    ;;
  server)
    cd "$ROOT/x402-server" && npm run dev
    ;;
  quests)
    cd "$ROOT/x402-quests" && npm run dev
    ;;
  lecture)
    cd "$ROOT/lecture" && npm run dev
    ;;
  install)
    for dir in x402-facilitator x402-server x402-quests lecture; do
      log "install" "$dir..."
      (cd "$ROOT/$dir" && npm install)
    done
    log "install" "done."
    ;;
  *)
    echo "Usage: $0 [start|facilitator|server|quests|lecture|install]"
    exit 1
    ;;
esac
