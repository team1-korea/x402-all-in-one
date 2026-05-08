# 📑 x402-Escape API 명세서 v4.3.0 (Production Ready)

팀원들이 대시보드를 개발하거나 참가자용 프론트엔드를 확장할 때 참고하는 표준 명세입니다. 모든 API는 **APIX L1 Native** 통신 및 **App Router (Next.js 14)** 표준을 전제로 합니다.

---

## 1. 상품 관련 (Product)

### GET /api/products
전체 상품 목록과 실시간 재고를 조회합니다.
- **Response**: `200 OK`
```json
{
  "eventId": "x402-escape-2026",
  "products": [
    {
      "productId": "gift_01",
      "name": "스타벅스 기프티콘",
      "stock": 5,
      "status": "available"
    }
  ]
}
```

### POST /api/products
참가자가 특정 상품을 선택하고 경쟁 경로를 할당받습니다.
- **Request Body**:
```json
{
  "userId": "user_unique_id",
  "productId": "gift_01",
  "walletAddress": "0x..."
}
```
- **Response**: `200 OK` (선택된 `selectedPathId` 반환)

---

## 2. 퀴즈 도전 (Quiz Flow)

### GET /api/quizzes/active
현재 참가자가 풀어야 할 다음 퀴즈의 메타데이터를 조회합니다.
- **Headers**: `x-user-id` (필수)
- **Response**: `200 OK` (퀴즈 ID 및 다음 경로 반환)

### GET /api/quizzes/:id
퀴즈의 상세 내용(질문 등)을 조회합니다. **X402 결제 검증**과 **재고 체크**가 동시에 이루어집니다.

- **Headers**: 
    - `x-user-id`: 필수
    - `x-x402-token`: APIX L1 TxHash (결제 증명)
- **상태 1: Payment Required (402)**
    - 결제 토큰 누락 시 발생 (`payTo`, `amount` 정보 포함).
- **상태 2: Product Sold Out (410)** 
    - [UX Guard] 플레이 중 해당 상품의 재고가 소진되면 즉시 게임을 중단시킵니다.
- **상태 3: Success (200)** 
    - 결제 검증 성공 및 재고 존재 시 퀴즈 상세 데이터 반환.

### POST /api/quizzes/:id
정답을 제출하고 즉시 보상(APIX)을 청구합니다.
- **Request Body**: `{ "userId": "...", "answer": "..." }`
- **Response**: `200 OK` (보상 TxHash 포함)

---

## 3. 운영 및 시스템 (Admin)
*모든 관리자 API는 헤더에 `x-admin-key`가 필요합니다.*

### POST /api/paths/:id/reset
특정 경로의 유저들을 일괄 리셋합니다. 

### GET /api/event/status
현재 전체 행사 진행 현황 및 실시간 재고 로그를 반환합니다.

---

## 4. 공통 보안 정책
- **리플레이 방지**: 사용된 모든 `txHash`는 `actions.json`에 기록되어 중복 사용이 불가합니다.
- **원자성 보장**: 모든 재고 및 플레이어 상태 변경은 `withFileLock` 엔진으로 보호됩니다.
- **Admin Auth**: `ADMIN_API_KEY` 설정을 통해 외부로부터의 불법 리셋을 차단합니다.

---
**Author**: 2026 Avalanche Team1 Korea | **Ver**: 4.3.0
