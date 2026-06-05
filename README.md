# x402 × Claude Skills — Builder Meetup Kit

Avalanche L1 위에서 동작하는 x402 결제 프로토콜과 Claude Code Skills를 체험하는 빌더 밋업 운영 키트입니다.

참가자는 Claude Code CLI를 통해 퀘스트를 탐색하고, EIP-3009 서명으로 실제 온체인 결제를 수행합니다.

---

## 배포된 서비스
1. x402 skill : https://www.npmjs.com/package/team1-x402
2. 발표자료 : [slides.abcfe.net](https://slides.abcfe.net/)
3. faciliator 서버 : pay.abcfe.net
4. quest 서버 : quest.abcfe.net

---

## 구조

```
x402-all-in-one/
├── x402-facilitator/   # x402 결제 검증·정산 서버 (EVM ExactEvmScheme)
├── x402-server/        # 퀘스트 API 서버 (메인)
├── x402-quests/        # 참가자용 퀘스트 UI (React, 브라우저)
├── lecture/            # 발표자용 강의 웹페이지 (로컬에서 열기)
└── docs/               # 워크샵 운영 문서
```

---

## 토크노믹스

| 항목 | 값 |
|------|-----|
| 결제 토큰 | **USDC** (EIP-3009, 6 decimals) |
| 초기 에어드랍 | **100 USDC** (등록 시 자동 지급) |
| 퀘스트 가격 | **10 USDC 균일** (10개 × 10 USDC = 100 USDC) |
| 정답 보상 | 없음 |

---

## 전체 흐름

```
참가자 (Claude Code)
    │
    │  npx team1-x402 --url=<server>
    ▼
x402-quest / x402-pay / x402-discover 스킬 설치
    │
    │  /x402-quest 실행
    ▼
Step 0: .x402-wallet.json 확인
        없으면 → POST /v1/register → 지갑 생성 + 100 USDC 에어드랍 → 파일 저장
    │
    │  GET /v1/quest/product-a  (난이도 포함 목록)
    ▼
퀘스트 선택 (순서 자유 — 난이도 필터 지원)
    │
    │  GET /v1/quest/product-a/:step  (X-PAYMENT 헤더, 10 USDC)
    ▼
x402-server → x402-facilitator (verify → settle) → questUrl 반환
    │
    │  브라우저에서 questUrl 열기 → 퀘스트 완료
    ▼
    │  POST /v1/quest/product-a/:step/answer
    ▼
완료 (다음 퀘스트 자유 선택)
```

---

## 퀘스트 목록

| # | 이름 | 타입 | 난이도 |
|---|------|------|--------|
| 1 | 드래그앤드롭 | drag-drop | very-easy ⭐ 필수 진입 (발표자 데모) |
| 2 | Claude 스킬 OX | theory-ox | easy |
| 3 | x402 프로토콜 OX | theory-ox | medium |
| 4 | 합의를 방해하라 | snowman-sabotage | medium |
| 5 | Anthropic & Claude MC | theory-mc | easy |
| 6 | 스태프를 찾아라 | staff-code | easy |
| 7 | Kite AI & 아발란체 MC | theory-mc | easy |
| 8 | 밋업 피드백 | feedback | easy |
| 9 | x402 흐름 정렬 | threejs | medium |
| 10 | 관심사 모으기 | interests | medium |

퀘스트 1은 발표자와 함께 진행. 이후 순서 없이 자유 선택.

---

## API 엔드포인트

### x402-server

| 엔드포인트 | 설명 |
|---|---|
| `GET /health` | 서버 상태 확인 |
| `GET /llms.txt` | Claude가 읽는 서버 진입점 (`API_BASE_URL` 동적 주입) |
| `POST /v1/register` | 지갑 생성 + 100 USDC 초기 에어드랍 |
| `GET /v1/quest/:productId` | 퀘스트 목록 + 난이도 (인증 불필요) |
| `GET /v1/quest/:productId/:step` | 퀘스트 조회 — 결제 없으면 402 반환 |
| `POST /v1/quest/:productId/:step/answer` | 정답 제출 |
| `GET /v1/services` | 퀘스트 목록 + 사용자 진행 상태 (`?productId=&wallet=`) |

### `/v1/register` 응답

```json
{
  "walletAddress": "0x...",
  "privateKey": "0x...",
  "network": "eip155:402",
  "initialAirdrop": "100 USDC",
  "airdropTx": "0x..."
}
```

### `/v1/quest/:productId` 응답 (목록)

```json
[
  {
    "id": "quest-1",
    "name": "퀘스트 1 — 드래그앤드롭",
    "description": "...",
    "price": "10000000",
    "questType": "drag-drop",
    "difficulty": "very-easy",
    "entryPoint": true
  }
]
```

### `/v1/quest/:productId/:step` — 결제 후 응답

```json
{
  "id": "quest-2",
  "name": "퀘스트 2 — Claude 스킬",
  "questType": "theory-ox",
  "difficulty": "easy",
  "questUrl": "http://<quest-ui>/quest/<uuid>",
  "hint": "브라우저를 열어 이 URL을 방문하고 퀘스트를 완료하세요!",
  "settleTx": "0x..."
}
```

---

## 구성 요소

### 1. x402-facilitator

EVM 체인 위에서 x402 결제 페이로드를 검증하고 정산합니다.

- `POST /verify` — EIP-3009 서명 검증
- `POST /settle` — 온체인 `transferWithAuthorization` 실행
- `GET /supported` — 지원 스킴·네트워크 확인

### 2. x402-server

퀘스트 API 서버. `src/quests.ts`에서 문제·가격·난이도를 수정합니다.

데이터 파일:
- `data/users.json` — 지갑·진행 상태
- `data/questtokens.json` — 결제 완료 UUID 토큰

컨트랙트:
- `contracts/UsdcToken.sol` — USDC (6 decimals, EIP-3009)
- APIX L1 배포 주소: `0x65e1ec07cdc00f18e11dd0370c6158029f61721e`

### 3. x402-quests

퀘스트 UI (React). 각 퀘스트는 `questUrl`로 접근하는 브라우저 페이지입니다.

### 4. lecture/

발표자용 강의 슬라이드 (13장). 서버 불필요, 브라우저에서 직접 열기.

---

## 새 밋업 운영 가이드

### 준비물

- EVM 호환 Avalanche L1 (또는 다른 EVM 체인)
- EIP-3009 지원 ERC-20 토큰 컨트랙트 (`x402-server/contracts/UsdcToken.sol` 참고)
- 에어드랍용 지갑 (참가자 수 × 100 USDC 이상 보유)
- x402-facilitator 배포 (또는 기존 facilitator URL)
- x402-server 배포

### Step 1. ERC-20 토큰 배포

`x402-server/contracts/UsdcToken.sol`을 참고해 토큰을 배포합니다.
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
QUEST_BASE_URL=<퀘스트 UI 공개 URL>
PAYMENT_TOKEN=<배포한 USDC 토큰 컨트랙트 주소>
TOKEN_NAME=<EIP-712 도메인 name (예: USD Coin)>
TOKEN_VERSION=<EIP-712 도메인 version (예: 2)>
```

퀘스트 내용 수정:

```
x402-server/src/quests.ts   — 문제·정답·가격·난이도 수정
x402-server/llms.txt        — Claude에게 보여줄 서버 설명 수정
```

### Step 4. 스킬 패키지 배포

```bash
cd x402-skills   # 또는 해당 npm 패키지 디렉터리
npm publish
```

### Step 5. 밋업 당일 진행

> 상세 대사·체크리스트는 `docs/workshop-2026-05-28.md` 참고.

**실습 세션 흐름 (약 50분)**

| # | 파트 | 시간 |
|---|------|------|
| ① | 스킬 설치 | 3분 |
| ② | x402-pay SKILL.md TODO 구멍 확인 | 3분 |
| ③ | x402 원리 설명 (강의 슬라이드) | 10분 |
| ④ | TODO 구멍 채우기 → `/x402-pay` 검증 | 15분 |
| ⑤ | Q1 발표자 데모 (드래그앤드롭) | 4분 |
| ⑥ | 자유 퀘스트 마라톤 (Q2–Q10) | 15분 |

**① 스킬 설치** — 참가자가 Claude Code 터미널에서 실행:

```bash
npx team1-x402 --url=<server-url>
```

Claude Code 슬래시 메뉴에 `x402-pay`, `x402-discover`, `x402-quest` 세 개가 보이면 성공.

**② TODO 구멍 확인** — `~/.claude/skills/x402-pay/SKILL.md`를 에디터로 열어 `[TODO]` 4곳 위치 파악:

| 구멍 | 힌트 |
|------|------|
| Facilitator | 결제를 검증·정산하는 외부 서버 |
| HTTP 상태코드 | 결제가 필요할 때 서버가 반환하는 응답 번호 |
| validBefore | 서명 만료 시각 계산법 |
| 인코딩 | X-PAYMENT 헤더에 넣기 전 변환 방식 |

**③ x402 원리 설명** — `lecture/` 슬라이드 진행 (서버 불필요, 브라우저에서 직접 열기).

**④ 구멍 채우기** — 참가자가 자연어로 SKILL.md 편집 → Claude Code에서 `/x402-pay` 실행해 결제 동작 확인.

**⑤ Q1 발표자 데모** — 발표자가 참가자와 함께 `/x402-quest` 입력:
- Step 0: `.x402-wallet.json` 없으면 자동 등록 + 100 USDC 에어드랍
- Q1 드래그앤드롭을 함께 진행하며 전체 흐름 시연

**⑥ 자유 퀘스트 마라톤** — Q2–Q10 순서 없이 자유 선택. "쉬운 퀘스트 줘" 등 자연어 필터 활용 가능.

---

## 퀘스트 커스터마이징

`x402-server/src/quests.ts`에서 퀘스트를 수정할 수 있습니다.

```ts
{
  id: "quest-1",
  name: "퀘스트 이름",
  description: "목록에 표시될 설명",
  price: USDC10,           // 10 USDC (BigInt(10 * 1_000_000))
  questType: "theory-ox",  // drag-drop | theory-ox | theory-mc | snowman-sabotage | staff-code | feedback | threejs | interests
  difficulty: "easy",      // very-easy | easy | medium
  entryPoint: true,        // 옵션: 필수 진입 퀘스트 표시
}
```

---

## 기술 스택

| 항목 | 내용 |
|---|---|
| 결제 프로토콜 | [x402](https://github.com/coinbase/x402) |
| 결제 스킴 | ExactEvmScheme (EIP-3009) |
| 결제 토큰 | USDC (6 decimals, EIP-712 name="USD Coin" version="2") |
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
