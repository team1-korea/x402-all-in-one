---
name: x402-pay
description: x402 엔드포인트의 결제 요건을 확인하고 네이티브 코인(APIX)으로 결제하여 유료 API를 호출합니다.
user-invocable: true
disable-model-invocation: false
---

# x402 결제 및 호출

## 네트워크 정보

| 항목        | 값                                            |
|-------------|-----------------------------------------------|
| Chain ID    | 402                                           |
| RPC URL     | https://subnets.avax.network/apix/testnet/rpc |
| Facilitator | https://unloc.kr/facilitator                  |

## 1단계: 결제 요건 확인

결제 없이 유료 엔드포인트를 호출하면 402 응답으로 결제 요건이 반환됩니다:

```bash
curl -i http://localhost:4010/v1/quest/quest-2
```

응답 (HTTP 402):

```json
{
  "x402Version": 1,
  "accepts": [
    {
      "scheme": "exact",
      "network": "eip155:402",
      "asset": "native",
      "amount": "10000000000000000",
      "payTo": "0x7486fE46d82541ac4ae3b09b9a7061b8123A61Ba",
      "maxTimeoutSeconds": 60,
      "resource": "http://localhost:4010/v1/quest/quest-2",
      "description": "Quest quest-2 access payment",
      "mimeType": "application/json"
    }
  ],
  "error": "결제가 필요합니다"
}
```

## 2단계: X-PAYMENT 헤더 생성

`accepts[0]` 내용을 기반으로 viem 등 EVM 라이브러리로 서명된 결제 페이로드를 생성합니다.
페이로드를 base64로 인코딩하여 `X-PAYMENT` 헤더에 담습니다.

- `network`: `eip155:402`
- `asset`: `native` (APIX 네이티브 코인)
- `amount`: wei 단위 (10000000000000000 = 0.01 APIX)
- `payTo`: `0x7486fE46d82541ac4ae3b09b9a7061b8123A61Ba`

## 3단계: 결제 헤더 포함 재요청

```bash
curl http://localhost:4010/v1/quest/quest-2 \
  -H "X-PAYMENT: <base64_인코딩된_결제_페이로드>"
```

성공 응답:

```json
{
  "id": "quest-2",
  "name": "퀘스트 2 — Avalanche L1",
  "question": "이 빌더 밋업의 x402 서버가 올라간 Avalanche L1의 Chain ID는 무엇인가요?",
  "choices": ["43114", "43113", "402", "1"],
  "reward": "0.015 APIX",
  "settleTx": "0x..."
}
```

## 4단계: 정답 제출

```bash
curl -X POST http://localhost:4010/v1/quest/quest-2/answer \
  -H "Content-Type: application/json" \
  -d '{"answerIndex": 2, "walletAddress": "0x<내_지갑_주소>"}'
```

- `answerIndex`: choices 배열의 0-based index
- 퀘스트 2 정답: index 2 ("402")

정답 응답:

```json
{
  "correct": true,
  "message": "정답입니다! 0.015 APIX를 에어드랍했습니다.",
  "airdropTx": "0x...",
  "nextQuestHint": "다음: /v1/quest/quest-3"
}
```

## 네이티브 코인 단위 (wei)

| 단위 (wei)          | 실제 금액   |
|---------------------|------------|
| 1000000000000000000 | 1.0 APIX   |
| 100000000000000000  | 0.1 APIX   |
| 10000000000000000   | 0.01 APIX  |
| 5000000000000000    | 0.005 APIX |

## 에러 처리

- `402` — 결제 헤더 없음 또는 검증 실패. 1단계부터 다시 시작
- `400` — X-PAYMENT 페이로드 파싱 오류. base64 인코딩 확인
- `502` — facilitator 연결 실패. https://unloc.kr/facilitator/health 확인
