---
name: x402-quest
description: Avalanche L1 x402 퀘스트를 진행합니다. 난이도별 퀘스트 선택, x402 결제, 정답 제출까지 전체 흐름을 안내합니다.
user-invocable: true
disable-model-invocation: false
---

# x402 퀘스트

Avalanche L1(Chain ID 402) 위의 x402 퀘스트를 진행합니다. 퀘스트는 순서 없이 자유롭게 선택할 수 있습니다.

## 전체 흐름

```
0. 등록        →  .x402-wallet.json 확인 → 없으면 POST /v1/register (100 USDC 에어드랍)
1. 목록 조회   →  GET /v1/quest/product-a  (난이도 포함 전체 퀘스트 리스트)
2. 퀘스트 선택 →  원하는 난이도·종류 선택
3. x402 결제   →  GET /v1/quest/product-a/{step}  (402 → X-PAYMENT → questUrl 수신)
4. 퀘스트 수행 →  브라우저에서 questUrl 열어 완료
5. 정답 제출   →  POST /v1/quest/product-a/{step}/answer
```

## 난이도 시스템

| 난이도 | 설명 |
|--------|------|
| `very-easy` | 발표자와 함께 진행하는 필수 진입 퀘스트 (Q1) |
| `easy` | 이론 퀴즈·피드백 등 빠르게 완료 가능 |
| `medium` | 인터랙티브 게임·소셜 퀘스트 등 시간 소요 |

"쉬운 퀘스트 줘" → `easy` 우선, 없으면 `medium` 순서로 미완료 퀘스트 선택
"제일 쉬운 거" → `very-easy` 우선, 없으면 `easy` 순서로 선택

## 네트워크 정보

| 항목        | 값                                            |
|-------------|-----------------------------------------------|
| Chain ID    | 402                                           |
| 네트워크     | Avalanche APIX L1 Testnet                     |
| RPC URL     | https://subnets.avax.network/apix/testnet/rpc |
| Facilitator | https://unloc.kr/facilitator                  |
| API         | http://localhost:4010                         |

## Step 0 — 등록 & 에어드랍 (최초 1회)

`.x402-wallet.json` 파일이 현재 디렉터리에 있는지 확인합니다.

**파일이 없으면:**

먼저 사용자에게 닉네임(대시보드에 표시될 이름)을 물어보세요. 예: "대시보드에 표시할 닉네임을 알려주세요 (예: 홍길동)".

닉네임을 받은 후 등록합니다:
```bash
curl -X POST http://localhost:4010/v1/register \
  -H "Content-Type: application/json" \
  -d '{"nickname": "<사용자가 입력한 닉네임>"}'
```
응답에서 `walletAddress`와 `privateKey`를 받아 `.x402-wallet.json`에 저장합니다:
```json
{
  "walletAddress": "0x...",
  "privateKey": "0x...",
  "network": "eip155:402"
}
```
등록 즉시 **100 USDC**가 에어드랍됩니다 (퀘스트 10개 × 10 USDC).

**파일이 이미 있으면:** 저장된 값을 그대로 사용하고 이 단계를 건너뜁니다.

> `.x402-wallet.json`은 `.gitignore`에 추가하세요.

## Step 1 — 퀘스트 목록 조회

```bash
curl http://localhost:4010/v1/quest/product-a
```

응답에 각 퀘스트의 `difficulty`, `questType`, `price`가 포함됩니다.
`entryPoint: true`인 퀘스트(Q1)는 발표자와 함께 먼저 진행합니다.

## Step 2 — 퀘스트 구매 (x402 결제)

**반드시 `x402-pay` 스킬을 invoke해서 결제를 진행합니다. 직접 결제 코드를 작성하지 않습니다.**

x402-pay 스킬은 실행 시 TODO 구멍이 남아있으면 결제를 거부하고 사용자에게 안내합니다. TODO가 채워진 경우에만 결제가 진행됩니다.

```bash
# 1. 402 응답 수신 (결제 요구사항 + difficulty 포함)
GET /v1/quest/product-a/{step}

# 2. x402-pay 스킬 invoke → X-PAYMENT 헤더 생성 → questUrl 수신
```

## Step 3 — 브라우저에서 퀘스트 수행

응답의 `questUrl`을 브라우저에서 열어 퀘스트를 완료하세요.

## Step 4 — 정답 제출

```bash
curl -X POST http://localhost:4010/v1/quest/product-a/{step}/answer \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "0x<내_지갑_주소>", ...}'
```

퀘스트 종류별 필드:
- `theory-ox` / `theory-mc`: `answers: number[]`
- `staff-code`: `secretCode: string`
- `feedback`: `feedback: { good, bad, next }`
- `interests`: `interests: string[]` (3개 이상)
- `drag-drop` / `snowman-sabotage`: `participation: true`
- `threejs`: `order: number[]` (6개, x402 흐름 순서)
