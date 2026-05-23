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

  # 로그 디렉토리 생성
  mkdir -p "$ROOT/logs"
  log "run" "logs → $ROOT/logs/"

  # node_modules 체크
  for dir in x402-facilitator x402-server x402-quests lecture; do
    install_if_needed "$ROOT/$dir"
  done

  # 4개 서비스 동시 시작 (터미널 출력 + 파일 저장)
  (cd "$ROOT/x402-facilitator" && npm run dev 2>&1 | tee "$ROOT/logs/facilitator.log" | stream "facilitator") &
  (cd "$ROOT/x402-server"      && npm run dev 2>&1 | tee "$ROOT/logs/server.log"      | stream "server     ") &
  (cd "$ROOT/x402-quests"      && npm run dev 2>&1 | tee "$ROOT/logs/quests.log"      | stream "quests     ") &
  (cd "$ROOT/lecture"          && npm run dev 2>&1 | tee "$ROOT/logs/lecture.log"     | stream "lecture    ") &

  wait
}

start_pm2() {
  if ! command -v pm2 &>/dev/null; then
    echo "[pm2] pm2가 설치되지 않았습니다. 먼저 설치하세요:"
    echo "      npm install -g pm2"
    exit 1
  fi

  echo ""
  echo "╔══════════════════════════════════════════════╗"
  echo "║        x402-all-in-one  pm2 deploy           ║"
  echo "╠══════════════════════════════════════════════╣"
  echo "║  x402-facilitator  →  :$FACILITATOR_PORT              ║"
  echo "║  x402-server       →  :$SERVER_PORT              ║"
  echo "║  x402-quests       →  :$QUESTS_PORT            ║"
  echo "║  lecture           →  :$LECTURE_PORT             ║"
  echo "╚══════════════════════════════════════════════╝"
  echo ""

  mkdir -p "$ROOT/logs"

  # 의존성 설치
  for dir in x402-facilitator x402-server x402-quests lecture; do
    install_if_needed "$ROOT/$dir"
  done

  # 빌드
  log "pm2" "Building..."
  (cd "$ROOT/x402-facilitator" && npm run build) && log "pm2" "✓ x402-facilitator"
  (cd "$ROOT/x402-server"      && npm run build) && log "pm2" "✓ x402-server"
  (cd "$ROOT/x402-quests"      && npm run build) && log "pm2" "✓ x402-quests"
  (cd "$ROOT/lecture"          && npm run build) && log "pm2" "✓ lecture"

  # 기존 pm2 프로세스 정리 후 시작
  pm2 delete all 2>/dev/null || true
  pm2 start "$ROOT/ecosystem.config.js"
  pm2 save

  echo ""
  log "pm2" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  log "pm2" "  pm2 status       → 서비스 상태"
  log "pm2" "  pm2 logs         → 전체 로그"
  log "pm2" "  pm2 logs server  → 서버 로그만"
  log "pm2" "  ./run.sh stop    → 전체 종료"
  log "pm2" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

stop_all() {
  # pm2로 뜬 서비스가 있으면 pm2로 종료
  if command -v pm2 &>/dev/null && pm2 list 2>/dev/null | grep -qE "facilitator|server|quests|lecture"; then
    log "stop" "pm2 서비스 종료 중..."
    pm2 delete all 2>/dev/null || true
  fi

  # 포트 기반 kill (fallback)
  for port in $FACILITATOR_PORT $SERVER_PORT $QUESTS_PORT $LECTURE_PORT; do
    pids=$(lsof -ti tcp:$port 2>/dev/null) || true
    if [ -n "$pids" ]; then
      echo "$pids" | xargs kill -9 2>/dev/null || true
      log "stop" "killed process on :$port"
    fi
  done
  log "stop" "all services stopped."
}

case "${1:-start}" in
  start)
    start_all
    ;;
  pm2)
    start_pm2
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
  stop)
    stop_all
    ;;
  install)
    for dir in x402-facilitator x402-server x402-quests lecture; do
      log "install" "$dir..."
      (cd "$ROOT/$dir" && npm install)
    done
    log "install" "done."
    ;;
  *)
    echo "Usage: $0 [start|pm2|facilitator|server|quests|lecture|install|stop]"
    exit 1
    ;;
esac
