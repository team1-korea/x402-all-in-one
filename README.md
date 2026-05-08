# x402 × Claude Skills — Builder Meetup Kit

Avalanche L1 위에서 동작하는 x402 결제 프로토콜과 Claude Code Skills를 체험하는 빌더 밋업 운영 키트입니다.

참가자는 Claude Code CLI를 통해 퀘스트를 탐색하고, EIP-3009 서명으로 실제 온체인 결제를 수행하며, 정답 시 ERC-20 토큰을 에어드랍 받습니다.

---

## 구조

```
x402-temp/
├── x402-facilitator/   # x402 결제 검증·정산 서버 (EVM ExactEvmScheme)
├── x402-server/        # 퀘스트 API 서버 (메인)
└── x402-skills/        # 참가자용 Claude Code 스킬 npm 패키지
```

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
x402-server — 퀘스트 목록·규칙 안내
    │
    │  POST /v1/register
    ▼
지갑 생성 + 초기 토큰 에어드랍
    │
    │  GET /v1/quest/quest-1  (무료)
    ▼
퀘스트 문제 수령 → 정답 제출 → 토큰 에어드랍
    │
    │  GET /v1/quest/quest-2  (EIP-3009 서명 결제)
    ▼
X-PAYMENT 헤더 생성 → x402-server → x402-facilitator (verify → settle)
    │
    ▼
퀘스트 문제 수령 → 정답 제출 → 토큰 에어드랍
    │
    ▼
quest-3 동일 반복 → 전체 완주
```

---

## 구성 요소

### 1. x402-facilitator

EVM 체인 위에서 x402 결제 페이로드를 검증하고 정산합니다.

- `POST /verify` — EIP-3009 서명 검증
- `POST /settle` — 온체인 `transferWithAuthorization` 실행
- `GET /supported` — 지원 스킴·네트워크 확인

자체 운영하거나 기존 facilitator URL을 `x402-server/.env`의 `FACILITATOR_URL`에 지정하면 됩니다.

### 2. x402-server

퀘스트 API 서버. 핵심 비즈니스 로직이 여기에 있습니다.

| 엔드포인트 | 설명 |
|---|---|
| `GET /llms.txt` | Claude가 읽는 서버 진입점. `API_BASE_URL`로 URL 동적 주입 |
| `GET /health` | 서버 상태 확인 |
| `POST /v1/register` | 지갑 생성 + 초기 토큰 에어드랍 |
| `GET /v1/services` | 퀘스트 목록 |
| `GET /v1/quest/:id` | 퀘스트 조회 (유료는 X-PAYMENT 헤더 필요) |
| `POST /v1/quest/:id/answer` | 정답 제출 → 토큰 에어드랍 |

### 3. x402-skills

참가자가 설치하는 Claude Code 스킬 패키지.

```bash
npx <package-name> --url=<server-url>
```

설치되는 스킬:

| 스킬 | 역할 |
|---|---|
| `/x402-quest` | 처음부터 끝까지 퀘스트 진행 안내 |
| `/x402-discover` | 퀘스트 목록 조회 |
| `/x402-pay` | EIP-3009 서명 + 결제 호출 방법 |

---

## 새 밋업 운영 가이드

### 준비물

- EVM 호환 Avalanche L1 (또는 다른 EVM 체인)
- EIP-3009 지원 ERC-20 토큰 컨트랙트 (`x402-server/contracts/ToneToken.sol` 참고)
- 에어드랍용 지갑 (토큰 충분히 보유)
- x402-facilitator 배포 (또는 기존 facilitator URL)
- x402-server 배포
- npm 계정 (스킬 패키지 배포용)

### Step 1. ERC-20 토큰 배포

`x402-server/contracts/ToneToken.sol`을 참고해 토큰을 배포합니다.  
EIP-3009 `transferWithAuthorization`이 구현되어 있어야 합니다.

```bash
# solc로 컴파일
solc --optimize --optimize-runs 200 --combined-json abi,bin \
  contracts/ToneToken.sol -o build/

# viem 등으로 배포 후 컨트랙트 주소 기록
```

배포 후 에어드랍 지갑에 초기 토큰을 충분히 발행해두세요.

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
npm install
npm run start   # 또는 systemd/docker로 배포
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
x402-server/src/quests.ts   — 문제·정답·가격·보상 수정
x402-server/llms.txt        — Claude에게 보여줄 서버 설명 수정
```

결제 토큰 정보 수정 (`x402-server/src/routes/quest.ts`의 `extra` 필드):

```ts
extra: {
  assetTransferMethod: "eip3009",
  name: "<토큰 EIP-712 name>",
  version: "<토큰 EIP-712 version>",
},
```

```bash
npm install
npm run dev
```

### Step 4. x402-skills 배포

스킬 파일에서 토큰 주소·이름 업데이트:

```
x402-skills/pay/SKILL.md     — 토큰 주소, EIP-712 name/version, 금액 수정
x402-skills/discover/SKILL.md — 서버 설명 수정 (필요 시)
x402-skills/quest/SKILL.md    — 퀘스트 목록·보상 수정
```

`package.json`에서 패키지 이름·버전 변경 후 배포:

```bash
cd x402-skills
npm publish
```

### Step 5. 밋업 당일 진행

1. 서버 URL을 참가자에게 공유
2. 참가자가 스킬 설치:
   ```bash
   npx <package-name> --url=<server-url>
   ```
3. Claude Code에서 `/x402-quest` 입력으로 시작

---

## 퀘스트 커스터마이징

`x402-server/src/quests.ts`에서 퀘스트를 자유롭게 수정할 수 있습니다.

```ts
{
  id: "quest-1",
  name: "퀘스트 이름",
  description: "목록에 표시될 설명",
  price: 0n,              // 0n = 무료, TONE(0.01) = 0.01 토큰
  question: "문제 내용",
  choices: ["선택지1", "선택지2", "선택지3", "선택지4"],
  answerIndex: 0,         // choices 배열의 정답 index (0-based)
  reward: TONE(0.015),    // 정답 시 에어드랍 금액
}
```

퀘스트 수나 가격 구조는 자유롭게 변경 가능합니다.  
단, 참가자가 퀘스트 1 보상으로 퀘스트 2 비용을 충당할 수 있도록 보상 ≥ 다음 퀘스트 비용으로 설정하세요.

---

## 기술 스택

| 항목 | 내용 |
|---|---|
| 결제 프로토콜 | [x402](https://github.com/coinbase/x402) v2 |
| 결제 스킴 | ExactEvmScheme (EIP-3009) |
| 체인 | EVM 호환 Avalanche L1 |
| 서버 | Node.js + Express + TypeScript |
| 지갑 라이브러리 | viem |
| AI 클라이언트 | Claude Code (Claude Code Skills) |

---

## 레퍼런스

- [x402 프로토콜 스펙](https://github.com/coinbase/x402)
- [Claude Code Skills 문서](https://docs.anthropic.com/claude-code)
- [EIP-3009](https://eips.ethereum.org/EIPS/eip-3009)
- [Avalanche L1 문서](https://docs.avax.network)
