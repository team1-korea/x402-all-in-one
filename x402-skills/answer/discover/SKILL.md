---
name: x402-discover
description: Avalanche L1(Chain ID 402)에서 제공되는 x402 유료 서비스 목록을 탐색합니다. 어떤 퀘스트가 있는지 모를 때 가장 먼저 사용하세요.
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

## 전체 서비스 목록

```bash
curl http://localhost:4010/v1/services
```

## 키워드 검색

```bash
curl "http://localhost:4010/v1/services/search?q={검색어}"
```

## 응답 구조

```json
{
  "services": [
    {
      "id": "quest-1",
      "name": "퀘스트 1 — x402 첫 걸음",
      "description": "x402 프로토콜의 핵심 HTTP 상태 코드를 맞춰보세요. 무료입니다.",
      "category": "Quest",
      "networks": ["avalanche-l1-402"],
      "endpoints": [
        {
          "url": "http://localhost:4010/v1/quest/quest-1",
          "method": "GET",
          "pricing": { "amount": "0", "currency": "native", "note": "무료" }
        }
      ]
    },
    {
      "id": "quest-2",
      "name": "퀘스트 2 — Avalanche L1",
      "description": "이 이벤트가 돌아가는 Avalanche L1의 Chain ID를 맞춰보세요.",
      "category": "Quest",
      "networks": ["avalanche-l1-402"],
      "endpoints": [
        {
          "url": "http://localhost:4010/v1/quest/quest-2",
          "method": "GET",
          "pricing": { "amount": "10000000000000000", "currency": "native", "note": "0.01 APIX" }
        }
      ]
    },
    {
      "id": "quest-3",
      "name": "퀘스트 3 — Claude Skills",
      "description": "Claude Code의 스킬 시스템에 대한 마지막 문제입니다.",
      "category": "Quest",
      "networks": ["avalanche-l1-402"],
      "endpoints": [
        {
          "url": "http://localhost:4010/v1/quest/quest-3",
          "method": "GET",
          "pricing": { "amount": "10000000000000000", "currency": "native", "note": "0.01 APIX" }
        }
      ]
    }
  ]
}
```

응답에서 `endpoints[].url`, `endpoints[].method`, `pricing.amount`를 확인한 뒤
`x402-pay` 스킬로 넘어가세요.
