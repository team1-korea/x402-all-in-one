# ⚙️ 기술 명세서: x402-Escape (v4.3.0)

이 문서는 x402-escape 프레임워크의 기술적 표준, 데이터 스키마, 그리고 핵심 로직을 정의합니다. 모든 팀원 및 빌더는 본 명세서를 기준으로 시스템을 확장하고 유지보수해야 합니다.

---

## 1. 핵심 프로토콜 원칙
- **Product-First Flow**: 퀴즈 접근 전 상품 선택 및 경로 할당이 필수적으로 선행되어야 합니다.
- **X402 Standard Compliance**: 컨텐츠 게이팅 시 `402 Payment Required` 표준 응답 규격을 준수합니다.
- **Single-Token Economy**: 모든 보상(Earn)과 결제(Spend)는 APIX 네이티브 토큰을 통해 순환 구조를 이룹니다.

## 2. 데이터 스키마 (런타임 데이터)

### 플레이어 진행 정보 (`runtime/players.json`)
참가자의 경로, 진행 상태, 보상 수령 이력을 추적합니다.
```json
{
  "players": [{
    "userId": "string",
    "walletAddress": "string",
    "selectedProductId": "string",
    "currentQuizIndex": "number",
    "status": "in_progress | finished | reset"
  }]
}
```

### 상품 및 재고 정보 (`runtime/products.json`)
상품의 실시간 재고와 판매 가능 여부를 관리합니다.
```json
{
  "products": [{
    "productId": "string",
    "name": "string",
    "stock": "number",
    "status": "available | sold_out"
  }]
}
```

## 3. 원자적 상태 관리 (Atomic Logic)
- **파일 락킹**: 모든 쓰기 작업 전에는 `withFileLock`을 통해 잠금을 획득해야 합니다.
- **락 순서 정책 (Lock Ordering)**: 데드락을 방지하기 위해 항상 상위 계층인 `products.json`의 락을 먼저 획득한 후 `players.json`에 접근합니다.
- **원자적 리셋**: 재고 소진 시 발생하는 경로 리셋은 상품 업데이트와 동일한 원자적 트랜잭션 내에서 처리됩니다.
- **Fail-Fast 재고 보호 (UX Guard)**: 모든 퀴즈 진입(GET) 및 제출(POST) 단계에서 실시간 재고를 체크하여, 플레이 중 재고 소진 시 즉시 중단(410 에러) 처리함으로써 참가자의 시간 낭비를 방지합니다.

## 4. X402 결제 및 검증 (Hardening)
- **온체인 검증**: Avalanche SDK 및 JSON-RPC를 통해 실시간으로 결제 TxHash의 성공 여부, 수신 주소, 금액을 확인합니다.
- **멱등성 보장 (Idempotency)**: `runtime/actions.json`에 결제 이력을 기록하여, 동일한 TxHash를 이용한 중복 퀴즈 접근 시도를 원천 차단합니다.

## 5. API 시그니처
- **402 게이트**: 결제 필요 시 `X402-Pay-To`, `X402-Amount` 헤더와 함께 402 에러를 반환합니다.
- **410 조기 낙마**: 플레이 중 재고 소진 시 `410 Gone`과 함께 `Product Sold Out` 메시지를 반환합니다.
- **제출(Submit)**: 정답 검증 성공 시 `rewardTxHash`와 다음 퀴즈 ID를 반환합니다.
