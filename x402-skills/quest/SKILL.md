---
name: x402-quest
description: Avalanche L1 x402 퀘스트를 처음부터 끝까지 진행합니다. 서비스 탐색부터 결제 호출, 정답 제출, 에어드랍 수령까지 전체 흐름을 안내합니다.
user-invocable: true
disable-model-invocation: false
---

# x402 퀘스트

Avalanche L1(Chain ID 402) 위의 x402 퀘스트를 완주합니다.

## 전체 흐름

```
1. x402-discover  →  GET /v1/services 로 퀘스트 목록 조회
2. x402-pay       →  GET /v1/quest/{id} 호출 (유료면 402 → X-PAYMENT 헤더로 재요청)
3. 정답 제출      →  POST /v1/quest/{id}/answer
4. 에어드랍 수령  →  정답 시 APIX 자동 지급
```

## 네트워크 정보

| 항목        | 값                                            |
|-------------|-----------------------------------------------|
| Chain ID    | 402                                           |
| 네트워크     | Avalanche APIX L1 Testnet                     |
| RPC URL     | https://subnets.avax.network/apix/testnet/rpc |
| Facilitator | https://unloc.kr/facilitator                  |
| API         | http://localhost:4010                         |

## 퀘스트 목록

| 퀘스트 | 엔드포인트 | 방식 | 가격 | 보상 |
|--------|-----------|------|------|------|
| 퀘스트 1 — x402 첫 걸음 | /v1/quest/quest-1 | GET | 무료 | 0.005 APIX |
| 퀘스트 2 — Avalanche L1 | /v1/quest/quest-2 | GET | 0.01 APIX | 0.015 APIX |
| 퀘스트 3 — Claude Skills | /v1/quest/quest-3 | GET | 0.01 APIX | 0.02 APIX |

## 시작하기

### 1. 퀘스트 목록 확인

```bash
curl http://localhost:4010/v1/services
```

### 2. 퀘스트 1 (무료) 접근

```bash
curl http://localhost:4010/v1/quest/quest-1
```

### 3. 정답 제출

```bash
curl -X POST http://localhost:4010/v1/quest/quest-1/answer \
  -H "Content-Type: application/json" \
  -d '{"answerIndex": <번호>, "walletAddress": "0x<내_지갑_주소>"}'
```

### 4. 퀘스트 2 이상 (유료) — x402 결제 흐름

1. `GET /v1/quest/quest-2` → HTTP 402 + paymentRequirements 수신
2. `paymentRequirements` 기반으로 X-PAYMENT 헤더 생성 (viem으로 서명)
3. `GET /v1/quest/quest-2` + `X-PAYMENT` 헤더로 재요청 → 문제 수신
4. `POST /v1/quest/quest-2/answer` 로 정답 제출 → APIX 에어드랍

자세한 결제 방법은 `x402-pay` 스킬을 참고하세요.
