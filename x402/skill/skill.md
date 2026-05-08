---
name: x402-escape
description: 상품을 선택하고 x402 결제로 10개 퀴즈를 통과해 Avalanche L1 상품을 획득하는 Claude Code CLI 스킬
agent: general-purpose
allowed-tools:
  - fetch
  - bash
  - read
  - write
---

# 🏔️ x402-Escape: The Avalanche Ascent

이 스킬은 **Avalanche L1** 기반의 마이크로 페이먼트 방탈출 게임을 진행합니다.
이 정보는 **에이전트가 서버(API_ROOT)와 통신**하여 유저를 인도하는 데 사용됩니다.

## ⚙️ Configuration
- **API_ROOT**: http://localhost:4000 (이 주소는 설치 시 동적으로 변경됩니다.)

## 🔐 주요 원칙
- **Remote First**: 모든 데이터(상품, 퀴즈, 재고)는 로컬 파일이 아닌 `${API_ROOT}`의 API를 통해 가져옵니다.
- **x402 표준**: 모든 컨텐츠 접근은 `402 Payment Required` 표준 흐름을 준수합니다.
- **보안**: 지갑의 개인키는 절대 직접 노출하지 않으며, 모든 트랜잭션은 추적 가능해야 합니다.

## 🎮 스킬 실행 시나리오

### 1단계: 초기화 및 상품 선택
1. `${API_ROOT}/api/products`에서 실시간 상품 목록을 가져와 사용자에게 보여줍니다.
2. 사용자가 상품을 선택하면 서버 (`POST ${API_ROOT}/api/products/select`)에 등록하고 `pathId`를 할당받습니다.
3. 이 단계에서 내부 지갑 생성 및 Faucet 수령 가이드를 제공합니다.

### 2단계: 퀴즈 도전 (10단계)
- 현재 퀴즈 정보(`GET ${API_ROOT}/api/quizzes/active`)를 요청합니다.
- **402 응답 시**: AI는 즉시 `x402-Token`을 생성하거나 결제 트랜잭션을 실행한 후 재요청합니다.
- **퀴즈 수령 시**: 사용자에게 문제를 제시하고 정답을 입력받습니다.
- **정답 제출**: 서버에서 받은 `next` 경로(예: `${API_ROOT}/api/quizzes/:quizId`)로 **POST** 요청을 보냅니다.
- **실시간 보호**: 만약 결과가 `410 Gone`(재고 소진)이라면 즉시 사용자에게 알리고 세션을 종료합니다.

### 3단계: 최종 보상 및 리셋
- 10번째 퀴즈를 통과하면 상품 획득 확정 메시지를 보여줍니다.
- 성공 시 온체인 트랜잭션 해시를 축하 문구와 함께 출력합니다.

## ⚠️ 주의사항
- 모든 `fetch` 요청 시 헤더에 필요한 경우 인증 정보를 포함합니다.
- 정답 형식은 서버 명세를 준수합니다.

---
**Status**: `REMOTE_OPERATIVE` | **Chain**: `APIX L1`
