#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

trap 'kill 0' EXIT

case "${1:-start}" in
  start)
    echo "[run] Starting x402-server (port 25000) and x402-quests (port 25001)..."
    (cd "$ROOT/x402-server" && PORT=25000 QUEST_BASE_URL=http://localhost:25001 API_BASE_URL=http://localhost:25000 npm run dev) &
    (cd "$ROOT/x402-quests" && npm run dev) &
    wait
    ;;
  server)
    cd "$ROOT/x402-server" && PORT=25000 QUEST_BASE_URL=http://localhost:25001 API_BASE_URL=http://localhost:25000 npm run dev
    ;;
  quests)
    cd "$ROOT/x402-quests" && npm run dev
    ;;
  *)
    echo "Usage: $0 [start|server|quests]"
    exit 1
    ;;
esac
