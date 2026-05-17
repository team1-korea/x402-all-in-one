---
name: x402-quest
description: Avalanche L1 x402 퀘스트를 처음부터 끝까지 진행합니다. 등록부터 결제 호출, 웹 앱 안내, 최종 완주까지 전체 흐름을 안내합니다.
user-invocable: true
disable-model-invocation: false
---

# x402 퀘스트 (Product Quest)

Avalanche L1(Chain ID 402) 위의 x402 퀘스트를 완주하여 상품을 획득합니다.

## 기본 규칙

- **1인 1경로**: 동시에 하나의 상품 경로에만 참여 가능합니다.
- **순서 진행**: 퀘스트는 1번부터 순서대로 진행합니다. 이전 퀘스트를 완료해야 다음이 열립니다.
- **선점 경쟁**: 누군가 먼저 취득하면 해당 경로는 종료됩니다.

## 전체 흐름

```
0. 등록       →  POST /v1/register → walletAddress + privateKey + 10 TONE 수령
1. 상태 확인  →  GET /v1/services?productId=product-a&wallet={walletAddress}
2. 퀘스트 접근 →  GET /v1/quest/product-a/{step}
               모든 퀘스트(1 TONE): 402 → X-PAYMENT 헤더로 재요청 → questUrl 수령
3. 웹 앱 안내 →  사용자에게 questUrl 전달 ("이 URL을 브라우저에서 열어주세요")
4. 완료 후    →  서비스 목록 재조회로 다음 퀘스트 확인
```

## 네트워크 정보

| 항목        | 값                                            |
|-------------|-----------------------------------------------|
| Chain ID    | 402                                           |
| 네트워크     | Avalanche APIX L1 Testnet                     |
| RPC URL     | https://subnets.avax.network/apix/testnet/rpc |
| Facilitator | https://unloc.kr/facilitator                  |
| API         | http://localhost:4010                         |

## 시작하기

### 0. 등록 (반드시 먼저!)

```bash
curl -X POST http://localhost:4010/v1/register
```

응답 예시:
```json
{
  "walletAddress": "0x...",
  "privateKey": "0x...",
  "initialAirdrop": "10 TONE"
}
```

**privateKey와 walletAddress를 반드시 저장하세요.** 이후 모든 결제에 사용합니다.

### 1. 서비스 목록 확인

```bash
curl "http://localhost:4010/v1/services?productId=product-a&wallet={walletAddress}"
```

`status: "available"` 인 퀘스트부터 진행합니다.

### 2. 퀘스트 1~10 (각 1 TONE) — x402 결제 흐름

1. `GET /v1/quest/product-a/{step}` → HTTP 402 + paymentRequirements 수신
2. `paymentRequirements` 기반으로 X-PAYMENT 헤더 생성 (`x402-pay` 스킬 참고)
3. `GET /v1/quest/product-a/{step}` + `X-PAYMENT` 헤더로 재요청 → questUrl 수신

```bash
curl http://localhost:4010/v1/quest/product-a/2 \
  -H "X-PAYMENT: {base64_encoded_payment_payload}"
```

성공 응답:
```json
{
  "id": "quest-2",
  "name": "퀘스트 2 — Claude 스킬",
  "questType": "theory-ox",
  "questUrl": "http://[퀘스트앱주소]/quest/{uuid}",
  "hint": "브라우저를 열어 이 URL을 방문하고 퀘스트를 완료하세요!",
  "settleTx": "0x..."
}
```

### 4. 웹 앱 안내

결제 성공 후 `questUrl`을 받으면 사용자에게 안내합니다:

> "이 URL을 브라우저에서 열어주세요: {questUrl}"
> "페이지에서 퀘스트를 완료하면 자동으로 다음 단계가 열립니다."

웹 앱이 퀘스트 UI(이론 학습, 정답 선택, 게임 등)와 정답 제출을 처리합니다.
Claude가 별도로 정답을 제출할 필요가 없습니다.

### 5. 다음 퀘스트 확인

사용자가 퀘스트를 완료한 후 서비스 목록을 재조회합니다:

```bash
curl "http://localhost:4010/v1/services?productId=product-a&wallet={walletAddress}"
```

`status: "available"` 인 다음 퀘스트로 진행합니다.

## 에이전트 행동 지침

1. 시작 전 반드시 `POST /v1/register` 호출 확인 (walletAddress, privateKey 보유 여부)
2. 퀘스트 진행 전 서비스 목록으로 현재 진행 가능 단계 파악
3. 유료 퀘스트는 `x402-pay` 스킬로 결제 처리
4. 결제 성공 후 `questUrl`을 사용자에게 전달하고, 완료 후 다음 단계 확인
5. TONE 잔액 부족 시 사용자에게 알림 (초기 10 TONE, 퀘스트 1~10 각 1 TONE)
