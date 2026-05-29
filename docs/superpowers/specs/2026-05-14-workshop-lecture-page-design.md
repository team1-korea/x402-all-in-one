# 워크샵 강의 웹페이지 설계

**날짜**: 2026-05-14  
**이벤트**: 금쪽같은 내 클로드의 첫 결제 교육 (feat. x402) — 2026-05-28  
**담당**: 실습 세션 발표자

---

## 개요

발표자가 프로젝터로 띄울 강의 웹페이지(PPT 대체)와, 그 과정에서 만들어지는 산출물들을 설계한다.

---

## 산출물 목록

| 산출물 | 경로 | 용도 |
|--------|------|------|
| 강의 웹페이지 | `lecture/index.html` | 발표자 로컬 브라우저에서 직접 열기 (배포 불필요) |
| 기틀 문서 | `docs/workshop-2026-05-28.md` | 발표 흐름, 스크립트, 기술 레퍼런스 |
| 구멍 스킬 | `x402-skills/pay/SKILL.md` 수정 | 참가자가 VSCode로 직접 편집 |
| 퀘스트10 페이지 | `x402-server` `GET /quest/:uuid` 라우트 | 참가자가 UUID URL로 브라우저 방문, 클리어 후 답 코드 수령 |

---

## 아키텍처

```
발표자 로컬
├── lecture/index.html              ← 강의 웹페이지 (정적, 서버 불필요)
└── x402-all-in-one/
    ├── x402-server/
    │   ├── src/routes/quest.ts     ← quest 10 UUID 발급 로직, airdrop 제거
    │   ├── src/routes/services.ts  ← 사용자 상태 인식 (wallet 쿼리 파라미터)
    │   ├── src/routes/users.ts     ← 초기 에어드랍 10 TONE
    │   ├── src/routes/quest10.ts   ← GET /quest/:uuid 페이지 + /quest/:uuid/code
    │   ├── src/db.ts               ← purchasedSteps[], quest10Tokens 추가
    │   ├── src/quests.ts           ← 가격 1 TONE 균일, reward 제거
    │   └── src/index.ts            ← /quest/:uuid 라우트 마운트
    └── x402-skills/
        └── quest/SKILL.md          ← register 단계 추가, quest 10 가이드 업데이트
```

---

## 강의 웹페이지 (`lecture/index.html`)

### 레이아웃
- **B 타입**: 좌측 고정 사이드바(목차) + 우측 스크롤 본문
- 단일 HTML 파일 (CSS/JS 인라인, 외부 의존성 없음)
- 다크 테마 (발표 환경 고려)

### 섹션 구성

| # | 섹션 | 내용 |
|---|------|------|
| 01 | 오늘 할 것들 | 목표 2줄 요약, 타임라인 (7:50~8:40), 참가자가 가져갈 것 |
| 02 | Claude Skills | 스킬이란 무엇인지 30초 설명, `/` 명령어 목록 보는 법, `.md` 파일 구조 |
| 03 | 스킬 설치 | `npx x402-meetup --url=...` 명령어, 설치 확인 방법, VSCode 없을 때 대안 |
| 04 | 스킬 살펴보기 | 스킬 파일 열어보기, 구멍 위치 확인, 왜 구멍이 있는지 설명 |
| 05 | x402 원리 | 아이폰 구매 스토리 → x402 흐름 대응표 8단계, 핵심 코드 조각 |
| 06 | 구멍 채우기 (실습) | 구멍 7개 위치와 힌트 표시, 에디터에서 채우기, Claude 실행 테스트 |
| 07 | 퀘스트 마라톤 (GO) | 실시간 순위판 URL, `/x402-quest` 입력하고 시작 |
| 08 | 보너스 | agentic.market 등록 방법 간략 소개 |

---

## 구멍 스킬 (`x402-skills/pay/SKILL.md`)

### 원칙
- 구멍은 **흐름 서술 텍스트**에만 — 코드 블록이 아님
- Claude가 자연어 답변을 읽고 viem으로 구현
- 정답이 하나로 고정되지 않음 — 비슷한 의미면 동작

### 고정값 (수정 불가)
다음은 자연어 답변으로 대체 불가 — 틀리면 facilitator에서 무조건 거부:

- `x402Version: 2` — facilitator가 버전 2만 수락
- `authorization.value` — JSON 직렬화 시 String (BigInt 아님)
- `nonce` — `0x` + 32바이트 hex 형식
- viem import 및 paymentPayload 구조 템플릿
- 네트워크/체인 정보, TONE 토큰 주소

### 구멍 7개 (아이폰 비유 대응)

| 구멍 | 물음 | 정답 예시 (대략 맞으면 OK) | 비유 대응 |
|------|------|---------------------------|-----------|
| ① | 몇 번 응답을 받나요? | "402 응답을 받는다" | 결제 필요 안내 |
| ② | 응답에 어떤 정보가 있나요? | "어느 체인, 얼마, 어느 지갑으로 보낼지" | 가격표 + 계좌번호 |
| ③ | to 필드에 뭘 넣나요? | "받는 지갑 주소 (payTo)" | 카드 단말기 |
| ④ | value 필드에 뭘 넣나요? | "요청한 금액 그대로" | 아이폰 13 가격 |
| ⑤ | validBefore에 뭘 넣나요? | "지금 + 60초 (maxTimeoutSeconds)" | 결제 타임아웃 |
| ⑥ | 서명을 어디에 담아 보내나요? | "X-PAYMENT 헤더에 base64로 담아 같은 URL로 재요청" | 카드 꽂기 |
| ⑦ | 검증은 누가 하나요? | "facilitator가 서명과 잔액을 확인한다" | 카드사 승인 |

---

## 토크노믹스 (변경)

| 항목 | 기존 | 변경 |
|------|------|------|
| 초기 에어드랍 | 0.03 TONE | **10 TONE** |
| 퀘스트 1 가격 | 0 TONE (무료) | 0 TONE (유지) |
| 퀘스트 2~10 가격 | 0.01~0.03 TONE (차등) | **1 TONE 균일** |
| 정답 보상 에어드랍 | 퀘스트별 0.015~0.06 TONE | **제거** |

참가자는 시작 시 10 TONE을 받아, 퀘스트 2~10 (9개 × 1 TONE = 9 TONE) 진행 후 1 TONE 잔여.

---

## 사용자 상태 인식 서비스 목록 (`GET /v1/services`)

### 쿼리 파라미터
- `wallet` (optional): 지갑 주소. 없으면 모든 퀘스트를 `locked`/`available` 상태로 반환.

### 퀘스트 상태

| 상태 | 조건 | 응답 포함 내용 |
|------|------|----------------|
| `cleared` | `step ≤ currentStep` | 메타데이터 + question + choices |
| `purchased` | `step ∈ purchasedSteps` AND `step > currentStep` | 메타데이터 + question + choices |
| `available` | `step = currentStep + 1` AND not purchased | 메타데이터만 (가격, 이름, 설명) |
| `locked` | `step > currentStep + 1` | 메타데이터만 |

Quest 10이 `purchased` 또는 `cleared` 상태일 때 `questUrl` UUID도 포함.

### DB 변경 (`UserRecord`)

```ts
interface UserRecord {
  // 기존 필드 유지
  walletAddress: string;
  privateKey: string;
  registeredAt: string;
  initialAirdropTx?: string;
  currentProductId?: string;
  currentStep?: number;
  isCompleted?: boolean;

  // 신규 추가
  purchasedSteps?: number[];  // 결제 성공한 step 번호 목록
}

// 별도 테이블
interface Quest10Token {
  uuid: string;
  productId: string;
  walletAddress: string;
  answerCode: string;  // 6자리 랜덤 코드, 클리어 시 페이지에서 반환
  createdAt: string;
}
```

`purchasedSteps` 업데이트 시점: `settlePayment` 성공 직후 (quest.ts GET 핸들러 내부).

---

## 퀘스트10 페이지 (`GET /quest/:uuid`)

### 흐름
```
Claude x402로 quest 10 구매
  → 서버: UUID + answerCode 생성, DB 저장
  → 응답: { questUrl: "/quest/{uuid}", hint: "브라우저로 방문하세요" }

참가자 브라우저로 /quest/{uuid} 방문
  → UUID 없으면 404
  → UUID 있으면 퀘스트10 페이지 렌더

페이지에서 "클리어" 버튼 클릭
  → GET /quest/{uuid}/code
  → 서버: { code: answerCode } 반환

참가자가 코드를 Claude에게 전달
  → POST /v1/quest/{productId}/10/answer { secretCode: "...", walletAddress: "..." }
  → 서버: DB의 answerCode와 대조
```

### `quests.ts` Quest 10 변경
- `secretCode` 필드 제거
- 서버가 quest 10 GET 응답 시 `questUrl` 포함, 실제 문제 내용은 웹 페이지에서 제공

---

## 스킬 변경 (`x402-skills/quest/SKILL.md`)

### 흐름에 register 단계 추가
```
0. 등록  →  POST /v1/register → { privateKey, walletAddress, initialAirdrop: "10 TONE" }
1. 상품 선택  →  ...
```

### Quest 10 에이전트 가이드 업데이트
- 퀘스트 10 GET 응답의 `questUrl` 필드를 사용자에게 안내
- 사용자가 브라우저에서 클리어 후 코드를 받으면 `secretCode`로 정답 제출

---

## 구현 순서

1. **서버 변경** (기반 작업 먼저)
   - `db.ts` — `purchasedSteps`, `Quest10Token` 추가
   - `quests.ts` — 가격 1 TONE 균일, reward 제거, quest 10 secretCode 제거
   - `routes/users.ts` — 초기 에어드랍 10 TONE
   - `routes/quest.ts` — airdrop 제거, purchasedSteps 업데이트, quest 10 UUID 발급
   - `routes/services.ts` — wallet 쿼리 파라미터, 상태별 응답
   - `routes/quest10.ts` — UUID 페이지 + /code 엔드포인트 (신규)
   - `index.ts` — /quest/:uuid 마운트
2. **스킬 변경**
   - `x402-skills/quest/SKILL.md` — register 단계, quest 10 가이드
   - `x402-skills/pay/SKILL.md` — 구멍 버전으로 교체
3. **강의 웹페이지** — `lecture/index.html`
4. **기틀 문서** — `docs/workshop-2026-05-28.md`
