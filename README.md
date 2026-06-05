# x402 × Claude Skills — Builder Meetup Kit

Avalanche L1 위에서 동작하는 x402 결제 프로토콜과 Claude Code Skills를 체험하는 빌더 밋업 운영 키트입니다.

참가자는 Claude Code CLI를 통해 퀘스트를 탐색하고, EIP-3009 서명으로 실제 온체인 결제를 수행합니다.

---

## 배포된 서비스
1. x402 skill - NPM 배포됨 : [npmjs.com/package/team1-x402](https://www.npmjs.com/package/team1-x402)
2. 발표자료 : [slides.abcfe.net](https://slides.abcfe.net/)
3. faciliator 서버 : [pay.abcfe.net](https://pay.abcfe.net/)
4. quest 서버 : [quest.abcfe.net](https://quest.abcfe.net/)

---

# 주요 내용은 QUICKSTART.md 를 확인하시는게 좋습니다

## 구조

```
x402-all-in-one/
├── x402-facilitator/   # x402 결제 검증·정산 서버 (EVM ExactEvmScheme)
├── x402-server/        # 퀘스트 API 서버 (메인)
├── x402-quests/        # 참가자용 퀘스트 UI (React, 브라우저)
├── lecture/            # 발표자용 강의 웹페이지 (로컬에서 열기)
└── docs/               # 워크샵 운영 문서
```

---

## API 엔드포인트

### x402-server

| 엔드포인트 | 설명 |
|---|---|
| `GET /health` | 서버 상태 확인 |
| `GET /llms.txt` | Claude가 읽는 서버 진입점 (`API_BASE_URL` 동적 주입) |
| `POST /v1/register` | 지갑 생성 + 100 USDC 초기 에어드랍 |
| `GET /v1/quest/:productId` | 퀘스트 목록 + 난이도 (인증 불필요) |
| `GET /v1/quest/:productId/:step` | 퀘스트 조회 — 결제 없으면 402 반환 |
| `POST /v1/quest/:productId/:step/answer` | 정답 제출 |
| `GET /v1/services` | 퀘스트 목록 + 사용자 진행 상태 (`?productId=&wallet=`) |

### `/v1/register` 응답

```json
{
  "walletAddress": "0x...",
  "privateKey": "0x...",
  "network": "eip155:402",
  "initialAirdrop": "100 USDC",
  "airdropTx": "0x..."
}
```

### `/v1/quest/:productId` 응답 (목록)

```json
[
  {
    "id": "quest-1",
    "name": "퀘스트 1 — 드래그앤드롭",
    "description": "...",
    "price": "10000000",
    "questType": "drag-drop",
    "difficulty": "very-easy",
    "entryPoint": true
  }
]
```

### `/v1/quest/:productId/:step` — 결제 후 응답

```json
{
  "id": "quest-2",
  "name": "퀘스트 2 — Claude 스킬",
  "questType": "theory-ox",
  "difficulty": "easy",
  "questUrl": "http://<quest-ui>/quest/<uuid>",
  "hint": "브라우저를 열어 이 URL을 방문하고 퀘스트를 완료하세요!",
  "settleTx": "0x..."
}
```

## 레퍼런스

- [x402 프로토콜 스펙](https://github.com/coinbase/x402)
- [Claude Code Skills 문서](https://docs.anthropic.com/claude-code)
- [EIP-3009](https://eips.ethereum.org/EIPS/eip-3009)
- [Avalanche L1 문서](https://docs.avax.network)
