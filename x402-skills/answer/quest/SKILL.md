---
name: x402-quest
description: Avalanche L1 x402 퀘스트를 처음부터 끝까지 진행합니다. 서비스 탐색부터 결제 호출, 정답 제출, 에어드랍 수령까지 전체 흐름을 안내합니다.
user-invocable: true
disable-model-invocation: false
---

# x402 퀘스트 (운영진용 정답 포함)

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

## 퀘스트 목록 및 정답

| 퀘스트 | 엔드포인트 | 가격 | 보상 | 정답 index |
|--------|-----------|------|------|-----------|
| 퀘스트 1 — x402 첫 걸음 | /v1/quest/quest-1 | 무료 | 0.005 APIX | **1** ("402") |
| 퀘스트 2 — Avalanche L1 | /v1/quest/quest-2 | 0.01 APIX | 0.015 APIX | **2** ("402") |
| 퀘스트 3 — Claude Skills | /v1/quest/quest-3 | 0.01 APIX | 0.02 APIX | **2** (".md") |

## 퀘스트별 문제 및 정답

### 퀘스트 1
- **문제**: x402 프로토콜에서 '결제가 필요합니다'를 나타내는 HTTP 상태 코드는 무엇인가요?
- **보기**: ["200", "402", "404", "500"]
- **정답**: index 1 → "402"

### 퀘스트 2
- **문제**: 이 빌더 밋업의 x402 서버가 올라간 Avalanche L1의 Chain ID는 무엇인가요?
- **보기**: ["43114", "43113", "402", "1"]
- **정답**: index 2 → "402"

### 퀘스트 3
- **문제**: Claude Code에서 사용자가 직접 호출할 수 있는 스킬을 정의하는 파일 확장자는 무엇인가요?
- **보기**: [".json", ".yaml", ".md", ".txt"]
- **정답**: index 2 → ".md"

## 정답 제출 형식

```bash
curl -X POST http://localhost:4010/v1/quest/{id}/answer \
  -H "Content-Type: application/json" \
  -d '{"answerIndex": <번호>, "walletAddress": "0x<내_지갑_주소>"}'
```
