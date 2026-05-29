# Quest Progress Dashboard — Design Spec

**Date:** 2026-05-17  
**Status:** Approved

---

## Overview

워크샵 진행자가 프로젝터에 띄울 실시간 퀘스트 진행 대시보드. 참가자가 신규 등록하거나 퀘스트를 클리어할 때 화면이 자동 업데이트된다.

---

## Architecture

```
lecture app (Slide12Leaderboard.tsx)
    │  3초마다 폴링
    ▼
x402-server GET /v1/dashboard/stats
    │
    ▼
Supabase users 테이블
```

별도 앱 없이 기존 lecture + x402-server만 수정한다.

---

## 1. Database

**`users` 테이블에 컬럼 추가:**

```sql
ALTER TABLE users ADD COLUMN nickname TEXT;
```

- `nullable`: 미입력 시 지갑 주소 축약으로 대체 (서버에서 처리)
- 기존 데이터 영향 없음

---

## 2. x402-server 변경

### 2-1. `POST /v1/register` — 닉네임 수신

**Request body (추가):**
```json
{ "nickname": "홍길동" }
```

- `nickname` 없으면 DB에 null 저장 (허용)
- 기존 응답 구조 변경 없음

**`db.ts` 변경:**
- `UserRecord` 타입에 `nickname?: string` 추가
- `createUser` — `nickname` 필드 저장
- `listUsers` — `nickname` 포함 반환
- `toRecord` — `nickname` 매핑 추가

### 2-2. `GET /v1/dashboard/stats` — 신규 엔드포인트

**Response:**
```json
{
  "totalUsers": 12,
  "completedUsers": 3,
  "totalQuestAccesses": 47,
  "users": [
    {
      "nickname": "홍길동",
      "walletAddress": "0x1a2b…3c4d",
      "purchasedSteps": [1, 2, 3, 4],
      "isCompleted": false,
      "registeredAt": "2026-05-28T09:00:00Z"
    }
  ]
}
```

- `nickname` null이면 지갑 주소 앞 6자 + `…` + 뒤 4자로 대체
- `totalQuestAccesses` = 전체 유저의 `purchasedSteps` 길이 합계 (결제 완료 기준, 정답 제출 기준 아님)
- 등록 순서(`registeredAt` asc)로 정렬

**라우트:** `x402-server/src/routes/dashboard.ts` (신규 파일)  
**등록:** `index.ts`에 `app.use("/v1/dashboard", dashboardRouter)` 추가

### 2-3. x402-skills/quest/SKILL.md 업데이트

Step 0의 register curl 명령에 nickname 포함:
```bash
curl -X POST http://localhost:4010/v1/register \
  -H "Content-Type: application/json" \
  -d '{"nickname": "<사용자에게 닉네임 먼저 물어보고 입력>"}'
```

Claude가 register 전에 닉네임을 사용자에게 먼저 물어보도록 지침 추가.

---

## 3. lecture/Slide12Leaderboard.tsx — 완전 교체

### 레이아웃

```
┌──────────────────────────────────────────────────────────────┐
│  ● Quest Dashboard            총 12명  완료 3명  접근 47     │
├──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┐     │
│      │ 민준 │ 서연 │ 지훈 │ 유나 │ 현우 │ 지은 │ ...  │     │
│      │10/10 │ 4/10 │ 2/10 │ 1/10 │ 1/10 │ 0/10 │      │     │
├──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┤     │
│  Q1  │  ✓   │  ✓   │  ✓   │  ✓   │  ✓   │      │      │     │
│  Q2  │  ✓   │  ✓   │  ✓   │  ▶   │      │      │      │     │
│  Q3  │  ✓   │  ✓   │  ▶   │      │      │      │      │     │
│  ...  ...   ...   ...   ...   ...   ...   ...            │     │
│  Q10 │  ✓   │      │      │      │      │      │      │     │
└──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┘     │
└──────────────────────────────────────────────────────────────┘
```

**구조:** Q1~Q10이 세로(행), 참가자가 가로(컬럼). 참가자 헤더에 닉네임 + X/10 카운트.

**셀 색상:**
- 초록 `✓` — `purchasedSteps`에 포함 (결제 완료 = 퀘스트 접근 시작)
- 노랑 `▶` 깜박 — 가장 높은 purchasedStep이면서 `isCompleted: false` (현재 진행중)
- 어두움 — 미시작
- 파랑 테두리 헤더 — 신규 등록 (5분 이내 `registeredAt`)

**참가자 헤더:**
- `isCompleted: true` → 초록 테두리
- 신규 등록 5분 이내 → 파랑 테두리
- 그 외 → 기본 테두리

**스크롤:** 참가자가 많으면 가로 스크롤 (프로젝터는 16:9 기준 약 12~15명 가시 범위)

### 폴링

- `useEffect` + `setInterval` 3초마다 `/v1/dashboard/stats` fetch
- 언마운트 시 `clearInterval`
- 에러 시 마지막 성공 데이터 유지, 콘솔 경고만

### 환경변수

`lecture/.env` 파일 신규 생성 (현재 없음):
```
VITE_SERVER_URL=http://localhost:4010
```
없으면 `http://localhost:4010` 하드코딩 fallback.

---

## 4. 파일 변경 목록

| 파일 | 변경 |
|------|------|
| `supabase/schema.sql` | `nickname` 컬럼 ALTER 추가 (문서용) |
| `x402-server/src/types.ts` | `UserRecord.nickname` 추가 |
| `x402-server/src/db.ts` | nickname 필드 CRUD |
| `x402-server/src/routes/users.ts` | nickname body 파싱 |
| `x402-server/src/routes/dashboard.ts` | 신규 — stats 엔드포인트 |
| `x402-server/src/index.ts` | dashboard 라우터 등록 |
| `lecture/src/slides/Slide12Leaderboard.tsx` | 완전 교체 — 라이브 그리드 |
| `x402-skills/quest/SKILL.md` | Step 0에 nickname 지침 추가 |

---

## 5. Out of Scope

- 인증/접근 제어 (대시보드는 공개)
- 닉네임 수정 UI
- 퀘스트별 통과율 집계 뷰
- WebSocket / SSE (폴링으로 충분)
