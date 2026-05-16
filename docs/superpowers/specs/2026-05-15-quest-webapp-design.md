# Quest Web App — Design Spec
_2026-05-15_

## Overview

x402 결제 후 UUID URL로 접속하는 퀘스트 전용 React 웹앱. Claude가 퀘스트 선택/구매를 담당하고, 웹앱은 개별 퀘스트 페이지만 서빙.

## Architecture

```
홈서버
├── x402-server  (포트 4010) — API + UUID 발급
└── x402-quests  (포트 3000) — Vite React 퀘스트 웹앱
```

**진입 흐름:**
1. Claude → `/v1/services` 조회 → 유저가 퀘스트 선택
2. Claude → x402 결제 → 서버가 UUID 발급 → `questUrl` 반환
3. 유저가 `http://homeserver:3000/quest/:uuid` 브라우저 접속
4. 앱이 `GET /quest-api/:uuid` 호출 → 퀘스트 타입+콘텐츠 수신
5. 퀘스트 컴포넌트 렌더 → 완료 시 `POST /v1/quest/:productId/:step/answer` 제출

## Quest Lineup (10개)

| # | 타입 | 주제/내용 | 개발 대상 |
|---|------|-----------|-----------|
| 1 | 드래그앤드롭 | (별도 기획) | ❌ 제외 |
| 2 | OX 퀴즈 | Claude 스킬 | ✅ |
| 3 | OX 퀴즈 | x402 프로토콜 | ✅ |
| 4 | 찾아서 클릭 | 인터랙션 | ✅ |
| 5 | 객관식 | Claude / Anthropic | ✅ |
| 6 | 스태프 코드 | 네트워킹 | ✅ |
| 7 | 객관식 | Kite AI + 아발란체 | ✅ |
| 8 | 피드백 설문 | 밋업 피드백 (고정) | ✅ |
| 9 | Three.js | 3D 인터랙션 | ✅ |
| 10 | 참가자 관심사 | 네트워킹 | ✅ |

## Quest Types

### Theory/Quiz (OX + 객관식)
- "퀴즈 풀기" 버튼 클릭 → 이론 텍스트 표시
- 10초 카운트다운 타이머
- 타이머 완료 후 퀴즈 하단 언락
- OX: O/X 버튼 / 객관식: 보기 선택
- 제출 → `POST /v1/quest/:productId/:step/answer`

### Find & Click (#4)
- 화면에서 숨겨진 요소 찾아 클릭
- 클릭 시 정답 확인 → 서버 제출

### Staff Code (#6)
- 스태프에게 받은 코드 입력 필드
- 제출 → 서버 `secretCode` 검증

### Kite AI 객관식 (#7)
- 일반 객관식과 동일한 컴포넌트 (TheoryQuiz) 재사용
- 콘텐츠만 Kite AI + 아발란체 생태계 주제

### Feedback Survey (#8)
- 밋업 피드백 폼: 좋았던 점, 아쉬운 점, 다음에 원하는 경험
- 제출 완료 시 서버에 기록 + 퀘스트 클리어

### Three.js (#9)
- 3D 씬에서 특정 인터랙션으로 클리어
- lazy-load (번들 분리)

### Participant Interests (#10)
- 주변 참가자 관심사 태그 입력 (최소 N개)
- 제출 → 서버 저장 + 퀘스트 클리어

## Frontend Structure

```
x402-quests/
├── src/
│   ├── pages/
│   │   └── QuestPage.tsx        # /quest/:uuid 라우트, UUID로 퀘스트 판별
│   ├── quests/
│   │   ├── TheoryQuiz.tsx       # OX + 객관식 공용 (타이머 포함)
│   │   ├── FindClickQuest.tsx
│   │   ├── StaffCodeQuest.tsx
│   │   ├── FeedbackQuest.tsx
│   │   ├── ThreeJsQuest.tsx     # lazy-load
│   │   └── InterestsQuest.tsx
│   ├── components/              # 공통 UI (타이머, 버튼, 결과 표시 등)
│   └── api.ts                   # 서버 API 호출 모음
├── vite.config.ts
└── package.json
```

## Server Changes (x402-server)

1. **`storeQuestToken`** — quest10 전용 → 전체 퀘스트로 확장 (step 필드 추가)
2. **`GET /quest-api/:uuid`** — 신규 엔드포인트
   - UUID 조회 → `{ questType, step, productId, content }` 반환
3. **결제 성공 시 UUID 발급** — 현재 quest10만 → 모든 퀘스트로 확장
4. **`POST /v1/quest/:productId/:step/answer`** — 재사용, 변경 없음

## Out of Scope

- 퀘스트 로비/목록 페이지 (Claude가 `/v1/services`로 처리)
- Quest #1 드래그앤드롭 (별도 기획)
- 지갑 연결 UI (UUID 기반 인증 유지)
