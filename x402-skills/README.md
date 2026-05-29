# x402 Avalanche L1 — Skills

Avalanche L1(Chain ID 402) 위에서 동작하는 x402 퀘스트 스킬 모음입니다.
x402 프로토콜을 통해 서비스를 탐색하고, TONE 토큰으로 결제하여 유료 API를 호출하는 전체 흐름을 다룹니다.

## 한글로 작성한 이유

이 스킬은 한국어 사용자를 대상으로 한 빌더 밋업용으로 제작되었습니다.
참가자들이 직접 스킬 내용을 읽고, 수정하고, 완성하는 실습이 포함되어 있어
영어보다 한글이 이해와 참여에 더 적합하다고 판단했습니다.
Claude는 한글 지시문을 영어와 동일한 수준으로 처리합니다.

## 설치 (참가자용)

```bash
npx <package-name> --url=<server-url>
```

## 구조

```
skills/
├── discover/   ← 서비스 탐색 스킬
├── pay/        ← 결제 스킬 (워크샵 구멍 버전)
└── quest/      ← 전체 퀘스트 흐름 스킬
```

## 스킬 설명

| 스킬 | 설명 |
|------|------|
| `x402-discover` | `/v1/services`로 퀘스트 목록 탐색 |
| `x402-pay` | 402 응답 파싱 → EIP-3009 서명 → X-PAYMENT 헤더 재요청 |
| `x402-quest` | 등록(0단계)부터 완주까지 전체 흐름 안내 |

## x402-pay — 워크샵 구멍 버전

`pay/SKILL.md`는 흐름 설명 7곳이 `[TODO] ...`로 비워진 워크샵 전용 버전입니다.

```
[TODO] 몇 번 응답을 돌려보내나요?
[TODO] 어떤 정보들이 들어있나요?
[TODO] 받는 지갑 주소는 어느 필드에서 가져오나요?
...
```

참가자가 자연어로 빈칸을 채우면 Claude가 이를 읽고 실제 결제 코드를 생성해 실행합니다.
정확한 표현이 아니어도 비슷한 의미면 동작합니다.

고정값 (수정 시 결제 실패):
- `x402Version: 2`
- `authorization.value` — JSON 직렬화 시 문자열 (BigInt 아님)
- `nonce` — `0x` + 32바이트 hex 형식

## x402-quest — 전체 흐름

```
0. 등록    → POST /v1/register → privateKey + walletAddress + 10 TONE
1. 목록    → GET /v1/services?productId=...&wallet=...
2. 퀘스트  → GET /v1/quest/{productId}/{step}  (1~10 전부 1 TONE, x402-pay 사용)
3. 정답    → POST /v1/quest/{productId}/{step}/answer
4. Quest10 → 결제 후 수령한 URL 브라우저에서 방문 → 코드 받아 제출
```

## 네트워크

| 항목     | 값                                            |
|----------|-----------------------------------------------|
| Chain ID | 402                                           |
| 네트워크  | Avalanche APIX L1 Testnet                     |
| RPC URL  | https://subnets.avax.network/apix/testnet/rpc |
| Facilitator | https://pay.abcfe.net              |
