---
name: x402-quest
description: Avalanche L1 x402 퀘스트를 처음부터 끝까지 진행합니다. 서비스 탐색부터 결제 호출, 정답 제출, 에어드랍 수령까지 전체 흐름을 안내합니다. (상품별 독립 경로 반영)
user-invocable: true
disable-model-invocation: false
---

# x402 퀘스트 (Product Quest)

Avalanche L1(Chain ID 402) 위의 x402 퀘스트를 완주하여 상품을 획득합니다.

## 📋 기본 규칙 (Rules)
- **1인 1경로**: 사용자는 동시에 하나의 상품 경로에만 참여할 수 있습니다.
- **1인 1상품 제한**: 1개의 상품을 취득한 사용자는 종료되며, 다른 상품은 추가로 취득할 수 없습니다. (모두의 혜택을 위함)
- **선점 경쟁**: 누군가 먼저 상품을 취득하여 경로가 종료되면, 해당 경로에 있던 다른 사용자들은 상품 선택 단계부터 다시 시작해야 합니다.
- **식별자 관리**: 텔레그램 ID 또는 유저 ID를 기준으로 상태를 추적합니다.

## 🔄 전체 흐름

```
1. 상품 선택      →  사용 가능한 상품 경로 중 하나를 선택합니다. (productId 획득)
2. x402-discover  →  GET /v1/services 로 상품별 퀘스트 목록 조회
3. x402-pay       →  GET /v1/quest/{productId}/{step} 호출 (유료면 402 → X-PAYMENT 헤더로 재요청)
4. 정답 제출      →  POST /v1/quest/{productId}/{step}/answer
5. 에어드랍 수령  →  정답 시 TONE 자동 지급 (다음 퀘스트 비용으로 사용)
6. 완주 및 보상  →  10개 퀘스트 완료 시 최종 상품 지급
```

## 🌐 네트워크 정보

| 항목        | 값                                            |
|-------------|-----------------------------------------------|
| Chain ID    | 402                                           |
| 네트워크     | Avalanche APIX L1 Testnet                     |
| RPC URL     | https://subnets.avax.network/apix/testnet/rpc |
| Facilitator | https://unloc.kr/facilitator                  |
| API         | http://localhost:4010                         |

## 🗺️ 퀘스트 목록

모든 상품은 독립된 경로를 가지며, 엔드포인트에 `productId`가 포함됩니다.

| 퀘스트 | 엔드포인트 | 방식 | 가격 | 보상 | 유형 |
|--------|-----------|------|------|------|------|
| 퀘스트 1 | /v1/quest/{productId}/1 | GET | 무료 | 0.005 TONE | 무료 |
| 퀘스트 2 | /v1/quest/{productId}/2 | GET | 0.01 TONE | 0.015 TONE | 네트워킹형 (OX) |
| 퀘스트 3 | /v1/quest/{productId}/3 | GET | 0.01 TONE | 0.02 TONE | Avalanche 정보형 (OX) |
| 퀘스트 4 | /v1/quest/{productId}/4 | GET | 0.015 TONE | 0.025 TONE | AI 활용형 (객관식) |
| 퀘스트 5 | /v1/quest/{productId}/5 | GET | 0.015 TONE | 0.03 TONE | 네트워킹형 (OX) |
| 퀘스트 6 | /v1/quest/{productId}/6 | GET | 0.02 TONE | 0.035 TONE | Avalanche 정보형 (OX) |
| 퀘스트 7 | /v1/quest/{productId}/7 | GET | 0.02 TONE | 0.04 TONE | AI 활용형 (객관식) |
| 퀘스트 8 | /v1/quest/{productId}/8 | GET | 0.025 TONE | 0.045 TONE | 네트워킹형 (OX) |
| 퀘스트 9 | /v1/quest/{productId}/9 | GET | 0.025 TONE | 0.05 TONE | Avalanche 정보형 (객관식) |
| 퀘스트 10 | /v1/quest/{productId}/10 | GET | 0.03 TONE | 0.06 TONE | 웹 연동형 (비밀코드) |

*참고: 문제 내용과 정답은 상품별로 상이할 수 있으며, 서버가 해당 경로에 맞는 문제를 반환합니다.*

## 🚀 시작하기

### 1. 퀘스트 목록 확인

```bash
curl http://localhost:4010/v1/services
```

### 2. 퀘스트 1 (무료) 접근

```bash
curl http://localhost:4010/v1/quest/{productId}/1
```

### 3. 정답 제출

```bash
curl -X POST http://localhost:4010/v1/quest/{productId}/1/answer \
  -H "Content-Type: application/json" \
  -d '{"answerIndex": <번호>, "walletAddress": "0x<내_지갑_주소>"}'
```

### 4. 퀘스트 2 이상 (유료) — x402 결제 흐름

1. `GET /v1/quest/{productId}/2` → HTTP 402 + paymentRequirements 수신
2. `paymentRequirements` 기반으로 X-PAYMENT 헤더 생성 (viem으로 서명)
3. `GET /v1/quest/{productId}/2` + `X-PAYMENT` 헤더로 재요청 → 문제 수신
4. `POST /v1/quest/{productId}/2/answer` 로 정답 제출 → TONE 에어드랍

자세한 결제 방법은 `x402-pay` 스킬을 참고하세요.

## 📝 퀘스트 문제 초안 (예시)

### [Quest #2] 네트워킹형 (OX 예시)
- **문제**: "Avalanche L1(기존 서브넷)은 독립된 가상머신(VM)과 검증인 세트를 가질 수 있습니다. (O/X)"
- **정답**: O

### [Quest #4] AI 활용형 (객관식 예시)
- **문제**: "다음 중 Anthropic의 Claude 모델 시리즈가 아닌 것은?"
  1. Claude 3 Opus
  2. Claude 3.5 Sonnet
  3. Claude 3 Haiku
  4. Claude 3.5 Pro
- **정답**: 4

### [Quest #10] 웹 연동형 (비밀코드 예시)
- **내용**: 사용자가 직접 웹에 접근하여 비밀코드를 획득해야 합니다.
- **정답**: `AVAX_ESCAPE_SECRET_2026` (특정 정답 문자열 일치)

## 🤖 에이전트 행동 지침 (Agent Guidelines)

1. **상품 선택 선행**:
   - 퀘스트를 진행하기 전에 반드시 사용자가 어떤 상품(또는 `productId`)을 선택했는지 확인하거나 선택하도록 유도하세요.
2. **퀘스트 10 가이드**:
   - 퀘스트 10에 도달하면, 사용자에게 다음과 같이 안내하세요.
     > "이 퀘스트는 제가 직접 풀 수 없습니다. 브라우저를 열어 `http://localhost:4000/quest10` (가칭)에 접속하신 후, 페이지에서 '비밀코드'를 찾아 저에게 알려주세요!"
   - 사용자가 비밀코드를 입력하면, 이를 `{"secretCode": "사용자가_입력한_코드"}` 형태로 `/v1/quest/{productId}/10/answer`에 POST 요청으로 제출하세요.
