---
name: x402-discover
description: Avalanche L1(Chain ID 402)에서 제공되는 x402 퀘스트 서비스 목록을 탐색합니다. 퀘스트 진행 전 현재 상태를 확인할 때 사용하세요.
user-invocable: true
disable-model-invocation: false
---

# x402 서비스 탐색

Avalanche L1 위에 등록된 x402 퀘스트 서비스 목록을 조회합니다.

## 네트워크 정보

| 항목        | 값                                            |
|-------------|-----------------------------------------------|
| Chain ID    | 402                                           |
| 네트워크     | Avalanche APIX L1 Testnet                     |
| RPC URL     | https://subnets.avax.network/apix/testnet/rpc |
| Facilitator | https://unloc.kr/facilitator                  |
| API         | http://localhost:4010                         |

## 전체 서비스 목록

```bash
curl "http://localhost:4010/v1/services?productId=product-a&wallet={walletAddress}"
```

## 응답 구조

```json
{
  "quests": [
    {
      "step": 1,
      "name": "퀘스트 1 — 드래그앤드롭",
      "price": "무료",
      "completed": false
    },
    {
      "step": 2,
      "name": "퀘스트 2 — Claude 스킬",
      "price": "1 TONE",
      "completed": false
    }
  ],
  "currentStep": 1,
  "completed": false
}
```

응답에서 `currentStep`을 확인한 뒤 `x402-quest` 스킬로 해당 퀘스트를 진행하세요.
