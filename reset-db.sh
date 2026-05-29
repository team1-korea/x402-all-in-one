#!/usr/bin/env bash
set -e

SERVER_URL="${1:-https://x402.abcfe.net}"

echo "[reset-db] 초기화 중... ($SERVER_URL)"

response=$(curl -s -X POST "$SERVER_URL/v1/admin/reset" \
  -H "Content-Type: application/json")

echo "[reset-db] $response"
