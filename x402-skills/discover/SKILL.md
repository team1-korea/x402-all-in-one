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
| Facilitator | https://pay.abcfe.net                  |
| API         | http://localhost:4010                         |

## 전체 서비스 목록

```bash
curl "http://localhost:4010/v1/services?productId=product-a&wallet={walletAddress}"
```

## 응답 구조

```json
{
  "productId": "product-a",
  "services": [
    {
      "id": "quest-1",
      "name": "퀘스트 1 — 드래그앤드롭",
      "description": "x402 결제 흐름 순서 맞추기",
      "questType": "drag-drop",
      "status": "available",
      "price": "1 TONE",
      "endpoint": "http://localhost:4010/v1/quest/product-a/1"
    },
    {
      "id": "quest-2",
      "name": "퀘스트 2 — Claude 스킬",
      "description": "Claude Code와 스킬 시스템을 알아보세요",
      "questType": "theory-ox",
      "status": "locked",
      "price": "1 TONE",
      "endpoint": "http://localhost:4010/v1/quest/product-a/2"
    }
  ]
}
```

`status` 값:
- `available` — 지금 진행 가능
- `purchased` — 결제 완료, 웹 앱 방문 대기
- `cleared` — 완료
- `locked` — 이전 퀘스트 미완료

`status === "available"` 인 퀘스트부터 `x402-quest` 스킬로 진행하세요.
