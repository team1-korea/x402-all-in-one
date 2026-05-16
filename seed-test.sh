#!/usr/bin/env bash
# 테스트용 퀘스트 토큰 → Supabase 주입 + URL 출력

ROOT="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$ROOT/x402-server/.env"
QUEST_BASE="${QUEST_BASE_URL:-http://localhost:25001}"

# .env에서 Supabase 설정 읽기
SUPABASE_URL=$(grep '^SUPABASE_URL=' "$ENV_FILE" | cut -d= -f2-)
SUPABASE_ANON_KEY=$(grep '^SUPABASE_ANON_KEY=' "$ENV_FILE" | cut -d= -f2-)

if [[ -z "$SUPABASE_URL" || -z "$SUPABASE_ANON_KEY" ]]; then
  echo "❌ SUPABASE_URL / SUPABASE_ANON_KEY가 $ENV_FILE 에 없습니다"
  exit 1
fi

ENDPOINT="$SUPABASE_URL/rest/v1/quest_tokens"
HEADERS=(
  -H "apikey: $SUPABASE_ANON_KEY"
  -H "Authorization: Bearer $SUPABASE_ANON_KEY"
  -H "Content-Type: application/json"
  -H "Prefer: resolution=merge-duplicates"
)

upsert() {
  local uuid=$1 step=$2
  curl -s -o /dev/null -w "%{http_code}" -X POST "$ENDPOINT" \
    "${HEADERS[@]}" \
    -d "{\"uuid\":\"$uuid\",\"product_id\":\"product-a\",\"step\":$step,\"wallet_address\":\"0xtest\",\"created_at\":\"2026-05-15T00:00:00Z\"}"
}

echo ""
echo "Supabase에 테스트 토큰 주입 중..."

for step in 1 2 3 4 5 6 7 8 9 10; do
  code=$(upsert "test-$step" "$step")
  if [[ "$code" == "200" || "$code" == "201" ]]; then
    echo "  ✅ test-$step (step $step)"
  else
    echo "  ❌ test-$step 실패 (HTTP $code)"
  fi
done

echo ""
echo "아래 URL로 접속하세요:"
echo ""
echo "  Quest 1  (블록 연결 퍼즐)        → $QUEST_BASE/quest/test-1"
echo "  Quest 2  (OX - Claude 스킬)     → $QUEST_BASE/quest/test-2"
echo "  Quest 3  (OX - x402)            → $QUEST_BASE/quest/test-3"
echo "  Quest 4  (찾아서 클릭)           → $QUEST_BASE/quest/test-4"
echo "  Quest 5  (객관식 - Claude)       → $QUEST_BASE/quest/test-5"
echo "  Quest 6  (스태프 코드)           → $QUEST_BASE/quest/test-6"
echo "  Quest 7  (객관식 - Kite AI)      → $QUEST_BASE/quest/test-7"
echo "  Quest 8  (피드백 설문)           → $QUEST_BASE/quest/test-8"
echo "  Quest 9  (Three.js)             → $QUEST_BASE/quest/test-9"
echo "  Quest 10 (관심사 수집)           → $QUEST_BASE/quest/test-10"
echo ""
