# 참가자 퀵스타트 — x402 × Claude Skills

> 밋업 당일 참가자가 따라가는 순서입니다.  
> Claude Code CLI가 설치되어 있어야 합니다.

---

## 0. 스킬 설치

발표자가 공유한 서버 URL을 받아 터미널에서 실행합니다.

```bash
npx team1-x402 --url=<발표자가 알려준 서버 URL>
```

완료되면 Claude Code 슬래시 메뉴에 세 가지 스킬이 추가됩니다.

```
/x402-quest    퀘스트 진행 (등록 → 결제 → 완료)
/x402-pay      결제 흐름 직접 구현 (실습 파트)
/x402-discover 서비스 탐색
```

---

## 1. x402-pay 구멍 채우기 (실습 핵심)

스킬 파일에는 참가자가 직접 채워야 하는 `[TODO]` 4곳이 있습니다.

```bash
# 파일 열기
open ~/.claude/skills/x402-pay/SKILL.md
# 또는
code ~/.claude/skills/x402-pay/SKILL.md
```

### TODO 위치와 힌트

| # | TODO 위치 | 힌트 |
|---|-----------|------|
| ① | 네트워크 표 — Facilitator 칸 | 결제 검증·정산을 대신 해주는 외부 서버 |
| ② | 1단계 코드 블록 — 서버 응답 번호 | 결제가 필요할 때 HTTP가 돌려주는 상태 코드 |
| ③ | 2단계 `validBefore` 필드 | 지금 시각 + 서명이 유효한 최대 시간 |
| ④ | 3단계 헤더 변환 방법 | JSON을 바이너리 안전하게 텍스트로 바꾸는 방식 |

**자연어로 적어도 됩니다.** Claude가 의미를 해석해서 코드로 실행합니다.

예시:
```
Facilitator | https://unloc.kr/facilitator
[TODO] ②    | 402
[TODO] ③    | BigInt(Math.floor(Date.now()/1000)) + BigInt(maxTimeoutSeconds)
[TODO] ④    | base64
```

채운 뒤 Claude Code에서 `/x402-pay` 를 실행해 결제가 동작하는지 확인합니다.

---

## 2. 퀘스트 시작 — /x402-quest

```
Claude Code > /x402-quest
```

### Step 0 — 자동 등록 (최초 1회)

`.x402-wallet.json` 파일이 없으면 Claude가 자동으로 등록을 진행합니다.

```
POST /v1/register
→ walletAddress: 0x...
→ privateKey:    0x...
→ airdrop:       100 USDC (퀘스트 10개 × 10 USDC)
```

생성된 파일:
```json
// .x402-wallet.json  (절대 공유 금지)
{
  "walletAddress": "0x...",
  "privateKey":    "0x...",
  "network":       "eip155:402"
}
```

### Step 1 — 퀘스트 목록

Claude가 목록을 가져와 난이도와 함께 보여줍니다.

```
[very-easy] Q1  드래그앤드롭       ← 발표자와 함께 먼저!
[easy]      Q2  Claude 스킬 OX
[easy]      Q5  Anthropic & Claude MC
[easy]      Q6  스태프를 찾아라
[easy]      Q7  Kite AI & 아발란체 MC
[easy]      Q8  밋업 피드백
[medium]    Q3  x402 프로토콜 OX
[medium]    Q4  합의를 방해하라
[medium]    Q9  x402 흐름 정렬
[medium]    Q10 관심사 모으기
```

자연어로 선택할 수 있습니다:
- `"쉬운 퀘스트 줘"` → easy 미완료 중 추천
- `"제일 쉬운 거"` → very-easy → easy 순
- `"Q3 할게"` → 바로 Q3로 이동

---

## 3. 퀘스트 1개 전체 흐름

```
참가자 (Claude)                    서버 / 체인
─────────────────────────────────────────────────────
1. GET /v1/quest/product-a/2
                            ←  HTTP 402 + 결제 요건
                                (amount, payTo, asset)

2. EIP-3009 서명 생성
   (viem signTypedData)

3. X-PAYMENT 헤더 조립
   JSON → base64

4. GET /v1/quest/product-a/2
   X-PAYMENT: <base64>
                            →  facilitator verify
                            →  facilitator settle (온체인)
                            ←  questUrl + settleTx

5. 브라우저에서 questUrl 열기
   → 퀘스트 UI에서 문제 풀기
   → 브라우저가 자동으로 정답 제출
```

---

## 4. 퀘스트 타입별 정답 제출 형식

Claude가 대부분 자동으로 처리합니다. 참고용으로 정리합니다.

| 타입 | 제출 필드 | 비고 |
|------|-----------|------|
| `theory-ox` | `answers: [0]` or `[0, 0]` | 0=O, 1=X |
| `theory-mc` | `answers: [N]` | 0부터 시작하는 선택지 인덱스 |
| `drag-drop` | `participation: true` | 브라우저 UI 완료 후 자동 |
| `snowman-sabotage` | `participation: true` | 브라우저 UI 완료 후 자동 |
| `staff-code` | `secretCode: "AVAX402"` | 스태프에게 직접 받기 |
| `feedback` | `feedback: { good, bad, next }` | 브라우저 UI에서 입력 |
| `interests` | `interests: ["관심사1", ...]` | 3개 이상 |
| `threejs` | `order: [0,1,2,3,4,5]` | x402 흐름 6단계 순서 |

---

## 5. 에러 대처

| 상태 코드 | 원인 | 해결 |
|-----------|------|------|
| `402` 반복 | 서명 검증 실패 | x402-pay SKILL.md TODO 확인, validBefore 계산 재확인 |
| `400` | X-PAYMENT 파싱 실패 | base64 인코딩 방식 확인 |
| `403` | 미등록 사용자 | `/x402-quest` 재실행 → Step 0 자동 등록 |
| `502` | facilitator 연결 실패 | Facilitator URL이 SKILL.md에 올바르게 채워졌는지 확인 |

---

## 6. 체크리스트

```
□ npx team1-x402 설치 완료
□ ~/.claude/skills/x402-pay/SKILL.md TODO 4곳 채움
□ /x402-pay 실행 → 결제 동작 확인
□ /x402-quest → Step 0 등록 → .x402-wallet.json 생성 확인
□ Q1 발표자 데모 완료
□ 나머지 퀘스트 자유 진행
```
