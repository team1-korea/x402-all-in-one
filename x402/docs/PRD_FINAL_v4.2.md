# 📄 x402-Escape 최종 제품 요구사항 정의서 (PRD v4.2.5)

이 문서는 **x402-escape**의 최종 확정된 기능 및 기술 명세를 담고 있습니다. 기존 v3.0에서 보안 및 운영 안정성이 대폭 강화된 버전입니다.

## 1. 제품 정의 (Product Definition)
**x402-escape**는 APIX L1 기반의 상품 구매형 방탈출 이벤트 시스템입니다. 참가자는 Claude Code CLI를 통해 10개의 퀴즈를 통과하고 실시간 재고를 선점하여 실제 상품을 획득합니다.

## 2. 핵심 변경 및 강화 사항 (v4.2+)
- **Product-First Flow**: 참가자는 첫 시작 시 반드시 상품을 선택해야 하며, 해당 상품에 연결된 경쟁 경로(Path)를 할당받습니다.
- **Atomic State Control**: JSON 파일 기반의 **File Locking(withFileLock)** 시스템을 도입하여 40명 이상의 동시 접속 시에도 재고 차감 및 플레이어 진행 상태의 원자성을 보장합니다.
- **Conditional Reset Policy**: 특정 상품의 재고가 모두 소진되면, 해당 상품의 경로에 있던 다른 참가자들만 자동으로 '상품 선택' 단계로 리셋됩니다.
- **X402 Standard Compliance**: 컨텐츠 접근 시 `402 Payment Required` 응답을 통한 유료화 흐름을 100% 준수합니다.

## 3. 상세 사용자 흐름 (User Flow)
1. **진입**: 참가자가 Claude Code를 통해 `x402-escape` 스킬을 실행합니다.
2. **선택**: 현재 실시간 재고가 있는 상품 목록을 확인하고 목표 상품을 고릅니다.
3. **온보딩**: AI가 내부 지갑을 생성하고 APIX L1 faucet 수령을 대행합니다.
4. **결제 및 퀴즈 (10회)**: 
   - 퀴즈 요청 시 서버가 402 반환.
   - AI가 x402 결제 토큰 생성 및 재요청.
   - 퀴즈 질문 노출 및 사용자 숫자 정답 입력.
5. **상품 확정 (Final Claim)**: 10번째 퀴즈 정답 시, 원자적 락을 통해 재고를 1 차감하고 당첨을 확정합니다.
6. **리셋 안내**: 경쟁자가 먼저 상품을 가져간 경우, AI가 상황을 설명하고 다시 상품 선택 단계로 안내합니다.

## 4. 기술 스택 및 구조
- **Smart Contract**: Solidity 0.8.20 (APIX L1 Native)
- **Backend API**: Next.js 14 (App Router), Node.js, Viem.sh
- **State Management**: Redis (속도) + JSON Persistence (영속성) + File Locking (동시성 보호)
- **CLI Tool**: Custom Binary (`bin/x402-escape.js`)
- **Testing**: Artillery (100 VU 고부하 테스트 지원)

## 5. 관리 및 운영 (Operator Guide)
- **Seed**: `npx x402-escape seed`를 통해 상품 정보 초기화 및 전역 리셋을 수행합니다.
- **Status**: `npx x402-escape status`로 실시간 당첨자 현황 및 재고를 모니터링합니다.
- **Validate**: `npx x402-escape validate`로 시스템의 기술적 결함을 사전에 진단합니다.

## 6. 비기능적 요구사항
- **응답 속도**: 모든 API 요청은 3초 이내 처리를 지향합니다.
- **보안**: 지갑 개인키는 메모리 상에서만 존재하며 절대 로깅되지 않습니다.
- **복구**: JSON 상태 기반 저장으로 서버 장애 시에도 즉각적인 복구가 가능합니다.

# x402-escape 개발 완성본 v4.2

## 1. 개발용 PRD

## 1-1. 제품 정의

`x402-escape`는 **APIX L1 위에서 상품을 선택하고, x402 결제로 퀴즈를 열어, 총 10개의 퀴즈를 통과한 뒤 실제 상품을 획득하는 행사형 CLI 게임**이다.  
사용자는 Claude Code CLI에서 스킬을 실행하고, AI는 지갑 생성, faucet 수령, 상품 선택 보조, 퀴즈 진행, 정답 제출, 보상 기록을 수행한다.  
핵심 경험은 “문제를 푼다”가 아니라 “상품을 사기 위해 퀴즈를 통과한다”는 구조다.

## 1-2. 제품 목표

- 상품 카탈로그가 있는 실제 구매형 경험을 제공한다.
- x402 결제 흐름을 행사 참가자가 체감하게 한다.
- 상품 재고와 경로 경쟁을 통해 게임성을 만든다.
- 40명 동시 접속에서도 상태 충돌 없이 동작해야 한다.
- 행사 종료 시 상품별 승자와 토큰 흐름을 명확히 보여준다.

## 1-3. 핵심 원칙

- 상품은 퀴즈보다 먼저 존재해야 한다.
- 유저는 먼저 상품을 선택해야 한다.
- 경로는 상품에 종속되고, 퀴즈는 상품 획득을 위한 관문이다.
- 퀴즈는 정확히 10개로 고정한다.
- 각 퀴즈 성공 시 L1 토큰을 지급한다.
- 마지막 상품을 가져가면 해당 경로의 다른 참여자만 리셋한다.
- 모든 상품이 매진되면 전체 이벤트가 종료된다.
- Go는 사용하지 않고 TypeScript 중심으로 구현한다.
- APIX L1 RPC와 배포된 컨트랙트는 이미 존재한다고 가정한다.

## 1-4. 사용자 흐름

1. 사용자가 Claude Code CLI에서 `x402-escape` 스킬을 호출한다.
2. AI가 지갑을 생성하고 APIX L1 faucet을 받는다.
3. 사용자가 Claude 대화에서 목표 상품을 고른다.
4. 시스템이 해당 상품의 경로를 배정한다.
5. 첫 퀴즈를 요청하면 서버가 402 응답을 반환한다.
6. AI가 x402 결제를 진행한다.
7. 서버가 퀴즈 내용을 반환한다.
8. AI가 유저에게 문제를 보여주고 숫자 정답을 입력받는다.
9. AI가 정답을 제출한다.
10. 정답 성공 시 L1 토큰 보상이 지급된다.
11. 이 과정을 10회 반복한다.
12. 최종 상품을 획득하면 해당 경로의 나머지 인원은 상품 선택 단계로 돌아간다.
13. 모든 상품이 매진되면 행사 종료 리포트가 출력된다.

## 1-5. 기능 범위

- 상품 목록 조회.
- 상품 선택.
- 경로 할당.
- 지갑 생성.
- faucet 수령.
- x402 결제 처리.
- 퀴즈 조회.
- 퀴즈 정답 제출.
- 보상 지급 기록.
- 경로 리셋.
- 전체 매진 판정.
- 운영 리포트.

## 1-6. 비기능 요구사항

- 40명 동시 사용자 처리.
- 재고/경로 업데이트 원자성 보장.
- 중복 제출 방지.
- 지갑 개인키 직접 노출 금지.
- 장애 시 JSON 백업 복구 가능.
- 로그에서 민감 정보 마스킹.
- x402 요청은 표준 흐름을 따라야 함.

---

## 2. 시스템 구조

## 2-1. 인터페이스 우선순위

이 프로젝트는 **CLI 우선**이다.  
Claude Code는 `SKILL.md`를 통해 스킬을 로드하고, 관련 시점에만 스킬 내용을 불러오기 때문에, 이 프로젝트에 매우 잘 맞는다.
즉, 유저는 CLI로 시작하고, 서버는 내부 API와 x402 검증만 담당한다.  
웹 프론트는 반드시 필요하지 않고, 운영 대시보드 정도만 있으면 충분하다.

## 2-2. 구성 요소

- **CLI**: 사용자 진입점.
- **Claude Skill**: 대화 흐름과 단계 제어.
- **TS 서버**: 상품, 경로, x402, 퀴즈, 보상 API.
- **APIX L1**: 실제 토큰 전송 및 상태 확정.
- **JSON 상태 저장소**: 상품, 유저, 퀴즈, 로그 저장.

---

## 3. 스킬 프롬프트

## 3-1. skill.md

```markdown
---
name: x402-escape
description: 상품을 선택하고 x402 결제로 10개 퀴즈를 통과해 APIX L1 상품을 획득하는 Claude Code CLI 스킬
agent: general-purpose
allowed-tools:
  - read
  - write
  - edit
  - bash
  - fetch
  - search
---

# x402-escape

## 🎯 목적
이 스킬은 상품 선택형 x402 방탈출을 진행한다.
유저는 먼저 상품을 고르고, AI는 지갑 생성과 faucet 수령을 수행한 뒤, 퀴즈를 10개 통과해 최종 상품을 획득한다.

## 🚫 절대 규칙
- **상품이 먼저다.**
- 퀴즈는 상품을 얻기 위한 관문이다.
- 각 퀴즈 성공 시 L1 토큰을 지급한다.
- **정답은 숫자만 받는다.**
- 마지막 상품을 가져가면 해당 경로의 다른 인원만 리셋한다.
- 모든 상품이 매진될 때까지 반복한다.
- **개인키를 절대 직접 노출하지 않는다.**

## 🏁 시작 절차
1. 상품 카탈로그를 불러온다.
2. 유저에게 상품을 고르게 한다.
3. 내부적으로 지갑을 생성한다.
4. APIX L1 faucet을 받는다.
5. 상품에 연결된 경로를 할당한다.

## 🔄 진행 규칙
- 각 상품 경로는 정확히 10개 퀴즈로 구성된다.
- 매 퀴즈마다 x402 결제가 필요할 수 있다.
- 서버가 402 응답을 주면 결제를 먼저 처리한다.
- 퀴즈를 받으면 유저에게 질문하고 숫자 답을 받는다.
- 정답 제출 성공 시 다음 퀴즈로 이동한다.
- 실패하면 같은 퀴즈를 다시 시도한다.

## 📺 출력 스타일
- 현재 상품명, 현재 퀴즈 번호, 남은 재고를 짧게 알려준다.
- 입력 요청은 숫자 중심으로 명확하게 한다.
- 진행 상태를 항상 한 줄로 요약한다.

## 🔚 종료 조건
- 10개 퀴즈 완료 시 상품 획득 여부를 확인한다.
- 재고가 0이면 `sold_out`로 전환한다.
- 해당 경로 인원만 상품 선택 단계로 리셋한다.
- 모든 상품이 매진되면 전체 이벤트를 종료한다.

## 📝 예시
유저: "상품 A 선택"
AI: "좋아, 상품 A 경로로 들어간다. 1/10 퀴즈를 시작할게."
유저: "42"
AI: "정답 제출 완료. L1 토큰 1개를 받았다. 다음 퀴즈로 이동한다."
```

---

## 4. JSON 스키마

## 4-1. products.json

```json
{
  "eventId": "x402-escape-2026",
  "products": [
    {
      "productId": "gift_001",
      "name": "스타벅스 기프티콘",
      "description": "가장 먼저 완주한 유저가 가져간다",
      "imageUrl": "/images/gift_001.png",
      "stock": 5,
      "status": "available",
      "pathIds": ["path_001", "path_002"],
      "rewardTokenAmount": 10
    }
  ]
}
```

## 4-2. paths.json

```json
{
  "paths": [
    {
      "pathId": "path_001",
      "productId": "gift_001",
      "title": "x402 첫 번째 길",
      "quizCount": 10,
      "currentQuizIndex": 1,
      "status": "active",
      "participantIds": ["user_1", "user_2"]
    }
  ]
}
```

## 4-3. quizzes.json

```json
{
  "quizzes": [
    {
      "quizId": "quiz_001",
      "pathId": "path_001",
      "order": 1,
      "question": "team1 발표 주제는 무엇인가?",
      "expectedAnswer": 402,
      "x402Amount": 10,
      "rewardTokenAmount": 1,
      "submitUrl": "/api/quizzes/quiz_001/submit"
    }
  ]
}
```

## 4-4. players.json
플레이어의 진행 상태와 온체인 잔액 현황을 기록합니다.
```json
{
  "players": [
    {
      "userId": "user_1",
      "displayName": "Tiger XR",
      "walletAddress": "0x0000000000000000000000000000000000000001",
      "selectedProductId": "gift_001",
      "selectedPathId": "path_001",
      "currentQuizIndex": 3,
      "status": "in_progress",
      "l1TokenBalance": 12,
      "createdAt": "2026-04-23T12:00:00Z"
    }
  ]
}
```

## 4-5. actions.json
유저가 수행한 모든 주요 액션(상품 선택, 정답 제출 등)을 로그로 남깁니다.
```json
{
  "actions": [
    {
      "actionId": "act_001",
      "userId": "user_1",
      "type": "select_product",
      "payload": {
        "productId": "gift_001"
      },
      "createdAt": "2026-04-23T12:01:00Z"
    }
  ]
}
```

## 4-6. inventory_log.json
상품 재고가 실제로 차감된 이력을 기록합니다. 리포트 생성의 기초 데이터가 됩니다.
```json
{
  "logs": [
    {
      "productId": "gift_001",
      "beforeStock": 5,
      "afterStock": 4,
      "reason": "final_claim",
      "userId": "user_1",
      "createdAt": "2026-04-23T12:10:00Z"
    }
  ]
}
```

---

## 5. API 명세

## 5-1. 공통 규칙

- 모든 API는 JSON을 반환한다.
- x402가 필요한 요청은 402 응답을 반환할 수 있다.
- 상품 선택과 재고 변경은 원자적으로 처리한다.
- 멱등성 키를 지원해 중복 제출을 방지한다.

## 5-2. 상품 API

### GET /api/products
현재 구매 가능한 상품 목록과 실시간 재고 정보를 조회합니다.
**Response**
```json
{
  "eventId": "x402-escape-2026",
  "products": [
    {
      "productId": "gift_001",
      "name": "스타벅스 기프티콘",
      "stock": 5,
      "status": "available",
      "rewardTokenAmount": 10
    }
  ]
}
```

### POST /api/products/select
유저가 목표 상품을 확정하고 전용 퀴즈 경로를 배정받습니다.
**Request**
```json
{
  "userId": "user_1",
  "productId": "gift_001"
}
```
**Response**
```json
{
  "ok": true,
  "selectedPathId": "path_001",
  "status": "selected"
}
```

## 5-3. 경로 API

### GET /api/paths/:pathId
배정된 경로의 세부 정보(퀴즈 개수, 소속 플레이어 등)를 확인합니다.

### POST /api/paths/:pathId/reset
특정 경로의 모든 미완료 유저를 상품 선택 단계로 강제 리셋합니다. (재고 소진 시 자동 호출)

## 5-4. 퀴즈 API

### GET /api/quizzes/current
참가자가 도전해야 할 현재 퀴즈 정보를 가져옵니다. **x402 온체인 검증**을 통해 권한을 부여합니다.
- 토큰(TxHash)이 유효하지 않을 경우 **402 Payment Required**를 반환합니다.

**402 Response 예시**
```json
{
  "error": "payment_required",
  "maxAmountRequired": "10",
  "network": "apix-l1",
  "asset": "APIX",
  "payTo": "0xYourGatewayAddress",
  "next": "/api/quizzes/current"
}
```

### POST /api/quizzes/:quizId/submit
유저가 입력한 숫자 정답을 검증하고, 정답일 경우 즉시 APIX 보상을 전송합니다.
**Request**
```json
{
  "userId": "user_1",
  "answer": 402
}
```
**Response**
```json
{
  "ok": true,
  "correct": true,
  "rewardTokenAmount": 1,
  "rewardTxHash": "0x...",
  "nextQuizId": "quiz_002",
  "playerStatus": "in_progress"
}
```

## 5-5. 보상 API
### POST /api/rewards/claim
최종 상품 획득 시 보상 지급 내역을 영구 기록하고 트랜잭션을 마무리합니다.

## 5-6. 이벤트 API
### GET /api/event/status
행사 전체의 매진 여부, 총 당첨자 수, 상품별 승자 목록을 담은 리포트를 반환합니다.

---

## 6. CLI 명세

## 6-1. CLI 이름

`x402-escape`

## 6-2. 목적

CLI는 사용자의 1차 인터페이스다.  
사용자는 서버 URL만 알고 있으면 되고, Claude Code CLI에서 스킬을 로드해 진행한다.

## 6-3. 명령어

### `x402-escape init`
서버 가동을 위한 필수 디렉토리 구조를 생성하고, `data/seed`의 템플릿을 기반으로 초기 런타임 JSON 데이터들을 구축합니다.

### `x402-escape seed`
전체 시스템 데이터 정화(Full Cleanup)를 수행합니다. 모든 플레이어 기록과 로그를 삭제하고 상품 재고를 이벤트 시작 시점의 초기 상태로 되돌립니다.

### `x402-escape validate`
프로젝트의 정합성을 진단합니다. JSON 스키마 유효성, 필수 환경 변수 누락 여부, 그리고 APIX L1 RPC와의 연결성을 실시간으로 체크합니다.

### `x402-escape skill`
참가자들이 Claude Code에서 이 게임을 즐길 수 있도록 하는 온보딩 instructions와 스킬 주소를 출력합니다.

### `x402-escape install-skill`
참가자의 로컬 환경에 Claude Code 전용 스킬 파일을 자동으로 복사하고 설정합니다.

### `x402-escape status`
현재 진행 중인 행사의 대시보드를 출력합니다. 상품별 남은 재고, 현재 해당 경로에서 경쟁 중인 인원수, 그리고 확정된 승자 명단을 실시간으로 보여줍니다.

## 6-4. 실행 예시
```bash
npx x402-escape init      # 프로젝트 초기화
npx x402-escape seed      # 데이터 팩토리 리셋
npx x402-escape validate  # 시스템 정밀 진단
npx x402-escape status    # 실시간 현황판 보기
```

## 6-5. 필수 환경 변수 (.env)
시스템 가동을 위해 루트 디렉토리에 반드시 존재해야 하는 설정값입니다.
```bash
# 1. APIX L1 네트워크 노드 주소
RPC_URL=https://your-apix-l1-rpc

# 2. x402 결제를 수신할 마스터 운영 지갑 (이 주소로 입금된 것만 인정)
GATEWAY_ADDRESS=0xYourMasterWalletAddress

# 3. 보상을 자동 전송할 관리자 지갑의 개인키 (APIX 잔액 필요)
ADMIN_PRIVATE_KEY=0xYourAdminPrivateKey

# 4. 참가자들이 접속할 백엔드 서버의 퍼블릭 URL
API_URL=http://your-server-ip:3000
```
- **주의**: `ADMIN_PRIVATE_KEY`는 보상 전송 시 가스비와 보상액을 소모하므로 충분한 APIX가 충전되어 있어야 합니다.

---

## 7. 리셋 및 재고 정책

## 7-1. 원자적 리셋 규칙 (Reset Policy)
경쟁의 공정성을 위해 상품 재고 소진 시 다음의 규칙을 따릅니다.
- **타겟팅**: 특정 상품의 재고가 0이 되는 순간, 해당 상품과 연결된 경로(`pathId`)에 있는 모든 참가자를 대상으로 합니다.
- **진행 단계**: 이미 완주(`finished`)한 승자는 영향을 받지 않으며, 진행 중인 유저들만 '상품 선택' 단계로 강제 전환됩니다.
- **데이터 보존**: 유저가 획득한 기존 보상(L1 토큰)은 유지되나, 현재 풀고 있던 퀴즈 경로는 초기화됩니다.

## 7-2. 재고 및 매진 규칙
- **재고 확정**: 행사가 시작된 이후에는 `products.json`의 전체 재고 수정을 금지합니다.
- **매진 판정**: `stock`이 1에서 0이 되는 순간, 원자적 락 내부에서 즉시 해당 상품의 상태를 `sold_out`으로 변경합니다.
- **조기 종료**: 모든 상품이 매진될 경우, 서버는 더 이상의 신규 진입을 막고 최종 리포트 모드로 진입합니다.

## 7-3. 보안 및 무결성 정책
- **개인키 보안**: `ADMIN_PRIVATE_KEY`는 메모리 상에서만 활용되며, 어떠한 로그 파일에도 절대 평문으로 기록되지 않습니다.
- **검증 우선**: 모든 보상 지급은 온체인 결제(x402) 검증이 선행된 경우에만 실행됩니다.
- **락 정책**: 데이터 오염 방지를 위해 모든 쓰기 작업 전에는 `withFileLock`을 통해 파일 시스템 잠금을 획득합니다.

- **멱등성 보장**: 동일한 TxHash를 이용한 중복 퀴즈 요청은 서버 단에서 즉시 거부됩니다.
- **검증 실패 처리**: x402 검증 실패 시 시스템은 어떠한 퀴즈 정답 정보도 반환하지 않습니다.

---

## 8. 운영 기준

- 40명 동시 접속 처리 (Atomic Lock 보장).
- 3초 이내 응답 목표 (RPC 호출 시간 제외).
- 상태 저장 실패 시 JSON 백업 복구 지원.
- 행사 종료 시 리포트 자동 생성.
- 상품별 승자와 토큰 흐름을 표시한다.

---

## 9. 기술 부록: L1 & X402 상세 구현 가이드

이 섹션은 빌더들이 실제 온체인 로직을 구현할 때의 표준 가이드라인입니다.

### 10. X402 결제 방식 (Payment Verification)
X402 표준은 **'컨텐츠 요청 → 402 응답 → 결제 → 재요청'**의 사이클을 따릅니다. 서버는 APIX L1 RPC를 통해 실제 입금 여부를 실시간 검증하며, 특히 다음 사항을 철저히 확인합니다.
- **입금 주소 대조**: Tx의 수신 주소가 설정된 `GATEWAY_ADDRESS`와 정확히 일치하는지 확인하여 타인에게 보낸 Tx로 승인받는 것을 방지합니다.
- **중복 사용 방지 (Idempotency)**: 이미 한 번 검증에 사용된 TxHash를 재사용하여 다른 퀴즈를 열려고 시도하는 경우 서버는 이를 즉시 차단합니다. 이를 위해 서버는 모든 결제 TxHash를 `actions.json`에 기록하고 중복 여부를 체크합니다.

### 10-1. 온체인 보상 및 확인 (Reward Tracking)
각 퀴즈 성공 시 지급되는 토큰은 시스템의 핵심 보상입니다. 서버와 CLI는 단순히 전송하는 것을 넘어 최종 확인까지 수행합니다.
- **자동 전송**: 백엔드에서 정답 확인 즉시 `ADMIN_PRIVATE_KEY`를 통해 APIX를 전송하고 `rewardTxHash`를 생성합니다.
- **참가자 확인**: 참가자 CLI는 서버로부터 받은 `rewardTxHash`를 익스플로러 링크와 함께 출력하며, 내부적으로 잔액이 실제로 업데이트되었는지 확인한 후 다음 퀴즈 진행을 허용합니다.

### 10-2. 지갑 및 가스 아키텍처 (Seed Faucet)
- **가스 토큰**: 본 시스템은 APIX를 L1의 네이티브 가스 토큰으로 활용하여 사용자 경험을 단순화합니다.
- **초기 진입 (Seed Faucet)**: 유저가 지갑 생성 후 첫 퀴즈에 진입할 때, 시스템은 1회성 **Seed Faucet(1 APIX)**을 지급하여 첫 트랜잭션 결제에 필요한 가스비와 결제원금을 보조합니다.
- **자급자족 흐름**: 이후 퀴즈 보상으로 획득하는 APIX가 다음 단계의 x402 결제액 및 가스비를 상회하므로, 외부 자산 없이 오직 APIX만으로 10단계를 완주할 수 있는 'Single-Token Flow'를 지향합니다.

### 10-3. 순환 경제 모델 (Circular Economy)
보상($X$)과 결제($Y$)가 맞물리는 순환 구조를 통해 사용자 체류를 강화합니다.
1. **Earning ($X$)**: 퀴즈 $N$ 정답 시 지급되는 보상량.
2. **Spending ($Y$)**: 퀴즈 $N+1$ 접근 시 요구되는 x402 결제액.
3. **밸런스 정책**: $X \geq Y + Gas$ 설정을 통해 정답을 맞히기만 하면 별도의 외부 충전 없이 완주할 수 있는 'Self-Sustaining' 흐름을 권장합니다.

### 10-4. 데드락 방지 및 락 순서 정책 (Lock Ordering)
다중 파일에 락을 걸 때 발생할 수 있는 데드락(Deadlock)을 방지하기 위해 다음 계층 순서를 엄격히 준수합니다.
1. **상위**: `products.json`
2. **하위**: `players.json`
두 파일 모두 수정 시 항상 상위 파일의 락을 먼저 획득한 후 하위 파일의 락을 요청해야 합니다.

### 10-5. 원자적 경로 리셋 (Atomic Path Reset)
특정 상품의 재고가 0이 되는 즉시 발생하는 리셋 로직은 상위 `products` 락 내부에서 `players` 데이터를 일괄 수정하는 'Atomic Transaction' 방식으로 수행됩니다.

### 10-6. 데이터 정화 및 팩토리 리셋 (Full Reset)
운영 효율성을 위해 `seed` 명령어는 모든 런타임 데이터를 `data/seed/`의 템플릿 상태로 되돌리고, 플레이어 로그 및 인벤토리 기록을 완전히 삭제하여 행사를 'Cold Start' 할 수 있게 돕습니다.

---
**Status**: `RELEASE_READY` | **Logic Version**: `4.2.5` | **Author**: `Avalanche Team1 Korea`