# x402 Flow Sort Quest — Design Spec

**Date**: 2026-05-17  
**Quest slot**: `threejs` (QuestType 재활용, Three.js 컴포넌트 교체)  
**Component**: `ThreeJsQuest.tsx` → `X402FlowSortQuest.tsx` (파일 이름 변경)

---

## 목표

유저가 x402 결제 프로토콜의 동작 순서를 직접 드래그해서 맞추며, 프로토콜의 흐름을 체험적으로 학습한다.

---

## 인터랙션

- 단일 판 (1-shot): 카드 6장을 한 번 정렬하면 끝
- 드래그 앤 드롭으로 카드 순서 변경
- "제출" 버튼 클릭 → 서버 정답 검증 → ResultDisplay

---

## 카드 정의 (정답 순서)

| index | 카드 텍스트 (한국어) | 부가 설명 |
|-------|---------------------|-----------|
| 0 | `GET /api/data` 요청 | 클라이언트가 첫 API 요청 (결제 없음) |
| 1 | `402 Payment Required` 응답 | 서버가 결제 정보 반환 (금액, 수신자, 네트워크) |
| 2 | 지갑으로 결제 서명 | 클라이언트가 EVM 트랜잭션 생성 & 서명 |
| 3 | `X-PAYMENT` 헤더로 재요청 | 서명된 결제를 헤더에 담아 재시도 |
| 4 | 서버가 온체인 결제 검증 | 결제 유효성 확인 (블록체인) |
| 5 | `200 OK + X-PAYMENT-RESPONSE` | 데이터 응답 + 결제 확인 헤더 |

초기 렌더 시 카드 순서를 셔플해서 제시한다.

---

## 컴포넌트 구조

```
X402FlowSortQuest
├── 상단 설명 텍스트
├── SortableCardList        ← 드래그로 순서 변경
│   └── SortableCard × 6   ← 드래그 핸들 + 텍스트
├── 제출 버튼
└── ResultDisplay           ← 기존 컴포넌트 재사용
```

드래그 구현: 외부 라이브러리 없이 HTML5 `draggable` API 사용 (BlockBuilderQuest 패턴 참고).

---

## 서버 통신

```ts
submitAnswer(quest.productId, quest.step, quest.walletAddress, {
  order: [3, 0, 5, 1, 2, 4],  // 유저가 배치한 카드 원래 index 배열
})
```

서버는 `order`가 `[0, 1, 2, 3, 4, 5]`와 일치하는지 검증.

---

## 제약

- Three.js 의존성 제거 (bundle 크기 감소)
- `QuestType`에 새 타입 추가 불필요 — `threejs` 슬롯 그대로 사용
- `QuestPage.tsx`에서 `ThreeJsQuest` → `X402FlowSortQuest`로 import만 교체
- `lazy()` 래핑 제거 가능 (Three.js 없으므로 dynamic import 불필요)

---

## 서버사이드 변경

`x402-server/src/routes/quest.ts` L245–259 의 `threejs` 블록:
- `secretCode` 검증 → `order: number[]` 배열이 `[0,1,2,3,4,5]`인지 비교
- `quests.ts`의 `webCode: "3DAVAX"` 필드는 제거하거나 무시 (Quest 타입 변경 불필요)

---

## 범위 외

- 애니메이션 효과 (카드 드롭 시 snap 정도면 충분)
- 힌트 시스템
- 타이머
