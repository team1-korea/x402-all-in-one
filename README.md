# x402 × Claude Skills — Builder Meetup Kit

Avalanche L1 위에서 동작하는 x402 결제 프로토콜과 Claude Code Skills를 체험하는 빌더 밋업 운영 키트입니다.

참가자는 Claude Code CLI를 통해 퀘스트를 탐색하고, EIP-3009 서명으로 실제 온체인 결제를 수행합니다.

---

## 구조

```
x402-all-in-one/
├── x402-facilitator/   # x402 결제 검증·정산 서버 (EVM ExactEvmScheme)
├── x402-server/        # 퀘스트 API 서버 (메인)
├── x402-skills/        # 참가자용 Claude Code 스킬 npm 패키지
├── lecture/            # 발표자용 강의 웹페이지 (PPT 대체, 로컬에서 열기)
└── docs/               # 워크샵 운영 문서
```

---

## 토크노믹스

| 항목 | 값 |
|------|-----|
| 초기 에어드랍 | **10 TONE** (등록 시 자동 지급) |
| 퀘스트 1~10 | **1 TONE 균일** (10개 × 1 TONE = 10 TONE) |
| 정답 보상 에어드랍 | 없음 |
| 완주 후 잔여 | 0 TONE |

---

## 전체 흐름

```
참가자 (Claude Code)
    │
    │  npx <your-package> --url=<server>
    ▼
x402-skills 설치 (/x402-quest, /x402-pay, /x402-discover)
    │
    │  GET /llms.txt
    ▼
x402-server — 서버 설명 확인
    │
    │  POST /v1/register
    ▼
지갑 생성 + 10 TONE 초기 에어드랍
    │
    │  GET /v1/services?productId=product-a&wallet=0x...
    ▼
퀘스트 목록 + 상태 확인 (cleared/purchased/available/locked)
    │
    │  GET /v1/quest/product-a/1  (EIP-3009 서명 결제, 1 TONE)
    ▼
X-PAYMENT 헤더 생성 → x402-server → x402-facilitator (verify → settle)
    │
퀘스트 문제 수령 → 정답 제출 (answerIndex)
    │
    │  GET /v1/quest/product-a/2  (EIP-3009 서명 결제, 1 TONE)
    ▼
X-PAYMENT 헤더 생성 → x402-server → x402-facilitator (verify → settle)
    │
퀘스트 문제 수령 → 정답 제출
    │
    ▼  (quest-3 ~ quest-9 동일 반복)
    │
    │  GET /v1/quest/product-a/10  (웹 연동형, 1 TONE)
    ▼
UUID URL 수령 → 브라우저에서 /quest/:uuid 방문 → 클리어 코드 수령
    │
    │  POST /v1/quest/product-a/10/answer  { secretCode: "..." }
    ▼
완주
```

---

## API 엔드포인트

### x402-server

| 엔드포인트 | 설명 |
|---|---|
| `GET /llms.txt` | Claude가 읽는 서버 진입점. `API_BASE_URL`로 URL 동적 주입 |
| `GET /health` | 서버 상태 확인 |
| `POST /v1/register` | 지갑 생성 + 10 TONE 초기 에어드랍 |
| `GET /v1/services?productId=&wallet=` | 퀘스트 목록 + 사용자 상태 인식 응답 |
| `GET /v1/quest/:productId/:step` | 퀘스트 조회 (유료는 X-PAYMENT 헤더 필요) |
| `POST /v1/quest/:productId/:step/answer` | 정답 제출 |
| `GET /quest/:uuid` | Quest 10 전용 웹 페이지 (UUID 인증) |
| `GET /quest/:uuid/code` | Quest 10 클리어 코드 반환 |

### `/v1/services` 퀘스트 상태

`?wallet=0x...` 파라미터를 전달하면 사용자 진행 상황에 따라 상태를 반환합니다.

| 상태 | 조건 |
|------|------|
| `cleared` | 정답 제출 완료 |
| `purchased` | 결제 완료, 아직 정답 미제출 |
| `available` | 다음 도전 가능한 퀘스트 |
| `locked` | 아직 접근 불가 |

`cleared` / `purchased` 상태에는 `question`, `choices` 포함. Quest 10은 `questUrl` 추가 포함.

---

## 구성 요소

### 1. x402-facilitator

EVM 체인 위에서 x402 결제 페이로드를 검증하고 정산합니다.

- `POST /verify` — EIP-3009 서명 검증
- `POST /settle` — 온체인 `transferWithAuthorization` 실행
- `GET /supported` — 지원 스킴·네트워크 확인

### 2. x402-server

퀘스트 API 서버. `src/quests.ts`에서 문제·가격을 수정하고, `src/db.ts`가 JSON 파일로 상태를 관리합니다.

데이터 파일:
- `data/users.json` — 지갑·진행 상태 (`purchasedSteps` 포함)
- `data/quest10tokens.json` — Quest 10 UUID + 클리어 코드

### 3. x402-skills

참가자가 설치하는 Claude Code 스킬 패키지.

```bash
npx <package-name> --url=<server-url>
```

| 스킬 | 역할 |
|---|---|
| `/x402-quest` | 등록(0단계)부터 완주까지 전체 흐름 안내 |
| `/x402-discover` | 퀘스트 목록 조회 |
| `/x402-pay` | EIP-3009 서명 + 결제 호출 (구멍 버전 — TODO 7개) |

> **워크샵 모드**: `x402-pay/SKILL.md`에는 흐름 설명 7곳이 `[TODO: ...]`로 비워져 있습니다.
> 참가자가 직접 채운 뒤 Claude가 이를 읽고 실행합니다.

### 4. lecture/index.html

발표자용 강의 웹페이지 (PPT 대체). 서버 불필요, 브라우저에서 직접 열기.

```bash
open lecture/index.html
```

13장 슬라이드. ←/→ 키보드 또는 화면 클릭으로 이동.

---

## 새 밋업 운영 가이드

### 준비물

- EVM 호환 Avalanche L1 (또는 다른 EVM 체인)
- EIP-3009 지원 ERC-20 토큰 컨트랙트 (`x402-server/contracts/ToneToken.sol` 참고)
- 에어드랍용 지갑 (참가자 수 × 10 TONE 이상 보유)
- x402-facilitator 배포 (또는 기존 facilitator URL)
- x402-server 배포
- npm 계정 (스킬 패키지 배포용)

### Step 1. ERC-20 토큰 배포

`x402-server/contracts/ToneToken.sol`을 참고해 토큰을 배포합니다.
EIP-3009 `transferWithAuthorization`이 구현되어 있어야 합니다.

배포 후 에어드랍 지갑에 충분한 토큰을 발행해두세요.

### Step 2. x402-facilitator 설정

```bash
cd x402-facilitator
cp .env.example .env
```

`.env` 작성:

```env
EVM_CHAIN_ID=<체인 ID>
EVM_RPC_URL=<RPC 엔드포인트>
EVM_PRIVATE_KEY=<facilitator 전용 지갑 private key>
EVM_CHAIN_NAME=<체인 이름>
```

```bash
npm install && npm run start
```

### Step 3. x402-server 설정

```bash
cd x402-server
cp .env.example .env
```

`.env` 작성:

```env
PORT=4010
FACILITATOR_URL=<facilitator 주소>
PAY_TO=<결제 수신 지갑 주소>
CHAIN_ID=<체인 ID>
RPC_URL=<RPC 엔드포인트>
AIRDROP_MNEMONIC=<에어드랍 지갑 니모닉 12단어>
API_BASE_URL=<서버 공개 URL>
TONE_TOKEN=<배포한 ERC-20 토큰 주소>
```

퀘스트 내용 수정:

```
x402-server/src/quests.ts   — 문제·정답·가격 수정 (reward 필드 없음)
x402-server/llms.txt        — Claude에게 보여줄 서버 설명 수정
```

### Step 4. x402-skills 배포

`package.json`에서 패키지 이름·버전 변경 후 배포:

```bash
cd x402-skills
npm publish
```

### Step 5. 밋업 당일 진행

당일 체크리스트는 `docs/workshop-2026-05-28.md` 참고.

1. 서버 URL을 참가자에게 공유
2. 참가자가 스킬 설치:
   ```bash
   npx <package-name> --url=<server-url>
   ```
3. Claude Code에서 `/x402-quest` 입력으로 시작

---

## 퀘스트 커스터마이징

`x402-server/src/quests.ts`에서 퀘스트를 수정할 수 있습니다.

```ts
{
  id: "quest-1",
  name: "퀘스트 이름",
  description: "목록에 표시될 설명",
  price: 0n,            // 0n = 무료, 1000000000000000000n = 1 TONE
  question: "문제 내용",
  choices: ["선택지1", "선택지2"],
  answerIndex: 0,       // choices 배열의 정답 index (0-based)
  // isWebQuest: true   // Quest 10처럼 UUID URL 방식으로 처리할 경우
}
```

> `reward` 필드는 제거됐습니다. 정답 시 에어드랍은 없으며, 참가자는 초기 지급된 10 TONE으로만 진행합니다.

---

## 기술 스택

| 항목 | 내용 |
|---|---|
| 결제 프로토콜 | [x402](https://github.com/coinbase/x402) v2 |
| 결제 스킴 | ExactEvmScheme (EIP-3009) |
| 체인 | EVM 호환 Avalanche L1 (APIX Testnet, Chain ID 402) |
| 서버 | Node.js 22 + Express 4 + TypeScript 5 |
| 지갑 라이브러리 | viem 2 |
| AI 클라이언트 | Claude Code (Claude Code Skills) |

---

## 레퍼런스

- [x402 프로토콜 스펙](https://github.com/coinbase/x402)
- [Claude Code Skills 문서](https://docs.anthropic.com/claude-code)
- [EIP-3009](https://eips.ethereum.org/EIPS/eip-3009)
- [Avalanche L1 문서](https://docs.avax.network)
