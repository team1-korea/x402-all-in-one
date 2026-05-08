# x402 Avalanche L1 — Entrance

에이전트(Claude)가 우리 Avalanche L1의 x402 서비스를 탐색하기 위해 읽는 진입점 파일 모음입니다.

## 한글로 작성한 이유

이 파일은 빌더 밋업 참가자들에게 직접 설명하고 함께 읽는 자료로도 활용됩니다.
Claude는 한글을 영어와 동일한 수준으로 파싱하므로 에이전트 동작에 영향이 없으며,
참가자들의 이해와 접근성을 높이기 위해 한글을 선택했습니다.

## 파일 설명

| 파일 | 설명 |
|------|------|
| `llms.txt` | 에이전트가 읽는 서비스 탐색 진입점. 네트워크 정보와 `/v1/services` 엔드포인트를 안내합니다. |

## llms.txt 동작 방식

1. 에이전트가 `llms.txt`를 읽어 네트워크 정보와 서비스 탐색 URL을 파악합니다.
2. `GET /v1/services`를 호출해 퀘스트 목록을 가져옵니다.
3. 각 퀘스트 엔드포인트를 x402 프로토콜로 호출합니다.

## 네트워크

| 항목        | 값                                            |
|-------------|-----------------------------------------------|
| Chain ID    | 402                                           |
| 네트워크     | Avalanche L1 testnet                          |
| RPC URL     | https://subnets.avax.network/apix/testnet/rpc |
| Facilitator | https://facilitator.YOUR_DOMAIN               |
