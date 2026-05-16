# Block Builder Quest — Design Spec

**Date:** 2026-05-16  
**Status:** Approved  
**Scope:** x402-quests 앱에 `drag-drop` questType으로 Builder 미션 추가

---

## 배경

`QuestPage.tsx`의 `drag-drop` questType은 현재 "준비 중" 텍스트만 표시됨.  
`abcfe-fe` 프로젝트의 `/simulation/builder` 페이지(블록을 드래그해 체인 순서대로 연결하는 퍼즐)를 이식해 채움.

---

## 결정 사항

| 항목 | 결정 |
|------|------|
| 블록 데이터 | Mock 전용 (외부 API 없음) |
| 기차 애니메이션 | 유지 — mock 높이 800으로 고정 |
| 완료 처리 | `submitAnswer({ participation: true })` |

---

## 파일 구조

```
x402-quests/src/
  quests/
    BlockBuilderQuest.tsx         ← 신규
    BlockBuilderQuest.module.css  ← 신규
  pages/
    QuestPage.tsx                 ← drag-drop 분기 연결 (수정)
```

`types.ts`와 `api.ts`는 변경 없음 (`drag-drop`은 이미 QuestType에 존재, `submitAnswer`는 `participation` 필드 지원 중).

---

## 컴포넌트 설계

### Props

```ts
interface Props {
  quest: QuestData; // questType === 'drag-drop'
}
```

### 상태

| 상태 | 타입 | 설명 |
|------|------|------|
| `blocks` | `Block[]` | 4개 mock 블록 (높이 0~3) |
| `links` | `Link[]` | 연결된 블록 쌍 |
| `gameState` | `'playing' \| 'won'` | 퍼즐 상태 |
| `dragLine` | `DragLine \| null` | 드래그 중인 임시 선 |
| `trainAnimationPhase` | `'idle' \| 'starting' \| 'scrolling' \| 'done'` | 기차 애니메이션 단계 |
| `trainOffset` | `number` | 기차 스크롤 오프셋 (px) |
| `showExitButton` | `boolean` | 성공 오버레이 표시 여부 |
| `submitted` | `boolean` | API 제출 완료 여부 (중복 방지) |

### Mock 블록 데이터

블록체인 API 없이 결정적(deterministic) pseudo 해시 생성:

```ts
const generateMockHash = (height: number): string => {
  // 원본 코드 그대로: height를 시드로 한 64자 hex
};

const MOCK_BLOCKS = [0, 1, 2, 3].map(h => ({
  id: h,
  hash: generateMockHash(h),
  prevHash: h === 0 ? '0'.repeat(64) : generateMockHash(h - 1),
  isGenesis: h === 0,
  realData: { height: h, txCount: [5, 8, 3, 12][h] },
}));
```

초기 위치는 게임 영역 크기 기준으로 랜덤 셔플.

### 기차 애니메이션 (Mock)

- 목표 높이: **800** (고정)
- 원본의 `/api/status` 호출 제거 → `targetHeight = 800` 하드코딩
- WebSocket 신규 블록 수신 제거 → 애니메이션 완료 후 pending block 1개만 표시
- 나머지 로직(easing, blur, `requestAnimationFrame`) 원본 그대로

### 완료 흐름

```
퍼즐 완료 (links.length === 3)
→ gameState = 'won'
→ 1초 후: 블록 정렬 애니메이션
→ 기차 애니메이션 시작 (~4초)
→ 기차 완료: submitAnswer(productId, step, walletAddress, { participation: true })
→ showExitButton = true → 성공 오버레이
```

`submitAnswer`는 `won` 직후가 아니라 기차 애니메이션 완료(`trainAnimationPhase === 'done'`) 시점에 호출.  
`submitted` 플래그로 중복 호출 방지.

---

## CSS 전략

- `BlockBuilderQuest.module.css`로 원본 `builder.module.css` 직접 이식
- CSS 변수 치환:
  - `var(--abcfe-white)` → `#ffffff`
  - `var(--abcfe-gray)` → `#666666`
- 기존 애니메이션 전부 유지:
  - `latestBlockGlow`, `pendingPulse`, `shakeAndFade`, `hintSlideUp` 등
- Tailwind 혼용 없음 (CSS module 단독)

---

## 원본 대비 제거 항목

| 제거 항목 | 이유 |
|----------|------|
| `next/link`, `next/navigation` | Vite React 환경 |
| `useLanguage(t)` | 한국어 문자열 하드코딩으로 대체 |
| `useUser`, `updateEducationStep` | 퀘스트 앱에 user context 없음 |
| `useWebSocket`, `lastMessage` | Mock 데이터로 대체, 실시간 불필요 |
| `/api/block/:height`, `/api/status` API 호출 | Mock 전용 |
| `SimulationBriefing` 오버레이 | QuestPage가 이미 퀘스트 소개 처리 |
| Back → `/roadmap` 버튼 | 퀘스트 앱은 URL 기반, 뒤로가기 불필요 |

---

## QuestPage 수정

```tsx
// 기존
{quest.questType === 'drag-drop' && (
  <div className="text-slate-500 text-center p-8">이 퀘스트는 준비 중입니다.</div>
)}

// 변경
{quest.questType === 'drag-drop' && <BlockBuilderQuest {...props} />}
```

---

## 성공 오버레이 문구 (한국어)

- 제목: `체인 완성!`
- 설명1: `블록들을 올바른 순서로 연결했습니다.`
- 설명2: `각 블록은 이전 블록의 해시를 담아 "체인"을 이룹니다. 이것이 "블록체인"입니다.`
- 힌트 1차: `블록 위에 마우스를 올려 해시를 확인해보세요`
- 힌트 2차: `prevHash가 다른 블록의 hash와 같은지 비교해보세요`
