---
name: x402-quest
description: Avalanche L1 x402 퀘스트를 처음부터 끝까지 진행합니다. 등록부터 결제 호출, 정답 제출, 최종 완주까지 전체 흐름을 안내합니다.
user-invocable: true
disable-model-invocation: false
---

# x402 퀘스트 (Product Quest)

Avalanche L1(Chain ID 402) 위의 x402 퀘스트를 완주하여 상품을 획득합니다.

## 📋 기본 규칙

- **1인 1경로**: 동시에 하나의 상품 경로에만 참여 가능합니다.
- **1인 1상품 제한**: 1개 상품 취득 후 종료됩니다.
- **선점 경쟁**: 누군가 먼저 취득하면 해당 경로는 종료됩니다.

## 🔄 전체 흐름

```
0. 등록       →  POST /v1/register → privateKey + walletAddress + 10 TONE 수령
1. 상품 선택  →  사용 가능한 상품 경로 중 하나를 선택합니다. (productId 획득)
2. 서비스 조회 →  GET /v1/services?productId={productId}&wallet={walletAddress}
3. 퀘스트 접근 →  GET /v1/quest/{productId}/{step} (유료면 402 → X-PAYMENT 헤더로 재요청)
4. 정답 제출  →  POST /v1/quest/{productId}/{step}/answer
5. 완주       →  10개 퀘스트 완료 시 최종 상품 지급
```

## 🌐 네트워크 정보

| 항목        | 값                                            |
|-------------|-----------------------------------------------|
| Chain ID    | 402                                           |
| 네트워크     | Avalanche APIX L1 Testnet                     |
| RPC URL     | https://subnets.avax.network/apix/testnet/rpc |
| Facilitator | https://unloc.kr/facilitator                  |
| API         | http://localhost:4010                         |

## 🚀 시작하기

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

### 2. 퀘스트 1 (무료)

```bash
curl http://localhost:4010/v1/quest/product-a/1
```

### 3. 정답 제출

```bash
curl -X POST http://localhost:4010/v1/quest/product-a/1/answer \
  -H "Content-Type: application/json" \
  -d '{"answerIndex": 0, "walletAddress": "0x..."}'
```

### 4. 퀘스트 2 이상 (유료) — x402 결제 흐름

1. `GET /v1/quest/product-a/2` → HTTP 402 + paymentRequirements 수신
2. `paymentRequirements` 기반으로 X-PAYMENT 헤더 생성 (`x402-pay` 스킬 참고)
3. `GET /v1/quest/product-a/2` + `X-PAYMENT` 헤더로 재요청 → 문제 수신
4. `POST /v1/quest/product-a/2/answer` 로 정답 제출

### 5. 퀘스트 10 (웹 연동형)

1. x402 결제 후 응답에서 `questUrl` 수령
2. 사용자에게 안내:
   > "브라우저를 열어 이 URL을 방문하세요: {questUrl}"
   > "페이지에서 '퀘스트 클리어!' 버튼을 누르면 코드가 나옵니다. 코드를 저에게 알려주세요!"
3. 사용자가 코드를 전달하면 정답 제출:

```bash
curl -X POST http://localhost:4010/v1/quest/product-a/10/answer \
  -H "Content-Type: application/json" \
  -d '{"secretCode": "{사용자가_전달한_코드}", "walletAddress": "0x..."}'
```

## 🤖 에이전트 행동 지침

1. 퀘스트 시작 전 반드시 `POST /v1/register` 호출 확인 (walletAddress, privateKey 보유 여부)
2. `GET /v1/services` 로 현재 상태 확인 후 진행 가능한 퀘스트 파악
3. 유료 퀘스트는 `x402-pay` 스킬로 결제 처리
4. 퀘스트 10 도달 시 `questUrl` 을 사용자에게 전달하고 코드를 기다림
