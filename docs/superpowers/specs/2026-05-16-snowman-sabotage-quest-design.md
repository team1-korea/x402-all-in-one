# Snowman Sabotage Quest — Design Spec

**Date:** 2026-05-16  
**Quest:** Quest 4 (기존 "숨은 AVAX 찾기" 대체)  
**Quest Type:** `snowman-sabotage` (신규 questType)

---

## 1. 목적

Avalanche의 확률적 합의 메커니즘(Slush)을 직접 체험하게 한다. 유저가 "악의적 검증자" 역할을 맡아 합의를 방해해보지만, 3라운드 모두 합의에 실패함으로써 Avalanche 합의의 견고성을 몸으로 이해한다.

---

## 2. 전체 플로우

```
랜딩 화면
  └─ "합의 방해하러 가기" 버튼 클릭
       └─ Round 1 시작 플래시 (1.5초)
            └─ 게임 진행 (합의 완료까지, 최대 60초)
                 └─ Round 종료 오버레이 (2초)
                      └─ Round 2 → Round 3 (동일 반복)
                           └─ 최종 결과 화면 + 제출
```

---

## 3. 화면별 상세

### 3-1. 랜딩 화면

- Quest 4 · 인터랙션 뱃지
- 제목: "아발란체 합의를 방해하라!"
- 설명 텍스트:
  - Slush 합의 원리 요약 (K=5 샘플링, α=3 임계값)
  - 유저의 역할: 악의적 검증자로서 빨간 눈사람(악의적 트랜잭션)을 유지
  - "건투를 빕니다" 유머 톤
- 배경: 눈사람 SVG 시뮬레이션을 흐리게 렌더링 (preview)
- CTA: "합의 방해하러 가기" 버튼

### 3-2. 게임 화면

**상단 HUD:**
- 라운드 인디케이터: `● ○ ○` (완료된 라운드 채움, 현재 라운드 강조)
- 안전망 타이머: 60초 카운트다운, 작게 회색으로 항상 표시

**시뮬레이션 영역:**
- 원본 HTML의 SVG 눈사람 그리드 (5행 × 7열 = 35개 노드) 그대로 이식
- 파란 눈사람 = 정직한 노드, 빨간 눈사람 = 악의적 노드
- 유저 클릭: **파란 노드만 빨간색으로 전환** (빨간 노드 클릭 시 아무 반응 없음)
- Hover 시 scale 애니메이션 유지

**하단 스탯:**
- 파랑 노드 수 / 빨강 노드 수 실시간 표시
- 빨강 비율 게이지 바

**인터랙션 안내:**
- "파란 눈사람을 클릭해 빨갛게 만드세요!"

### 3-3. Round 종료 오버레이

시뮬레이션 위에 반투명 오버레이로 2초간 표시 후 자동으로 다음 라운드 시작.

- 텍스트: `"Block N 확정 — 합의가 이겼습니다"`
- 이 라운드 달성한 최고 빨강 노드 수 표시 (예: "최고 방해: 12 / 35")

### 3-4. 최종 결과 화면

3라운드 종료 후 표시.

**상단:**
- 이모지 ❄️
- "건투했지만… 합의는 멈추지 않습니다"
- 각 라운드 최고 빨강 노드 수 요약 (Round 1: 8개, Round 2: 11개, Round 3: 6개)

**교육 텍스트:**
> 이것이 **Slush 합의**의 힘입니다. 아발란체는 각 라운드마다 K=5개의 무작위 노드를 샘플링하고, α=3개 이상이 같은 색이면 자신도 그 색으로 바뀝니다. 네트워크에 정직한 노드가 다수라면, 수학적으로 악의적인 노드가 다수를 장악하기 **지수적으로 불가능**합니다.
>
> 아발란체의 C-Chain과 P-Chain은 이 원리를 선형 체인에 적용한 **Snowman 합의**를 실제로 사용합니다. Slush에 confidence counter(Snowflake)와 conviction counter(Snowball)를 추가하여 Byzantine 내결함성을 강화한 버전입니다.

**하단:**
- "퀘스트 완료 제출" 버튼 → 서버 제출 → ResultDisplay

---

## 4. 게임 내부 로직

### 4-1. 라운드 초기화

```
- 노드 35개 전부 리셋
- 시작 분포: 90% 파랑(31~32개), 10% 빨강(3~4개) — 합의가 거의 완료된 상태
- 빨강 위치: 무작위
```

### 4-2. Slush 합의 루프 (원본 HTML 로직 그대로)

```
매 tick (300ms, hover 시 80ms):
  1. 무작위 노드 qNode 선택
  2. qNode를 제외한 K=5개 무작위 peer 선택
  3. peer 중 countA(빨강), countB(파랑) 집계
  4. qNode.pref=파랑이고 countA >= α(3) → qNode를 빨강으로
     qNode.pref=빨강이고 countB >= α(3) → qNode를 파랑으로
  5. 쿼리 라인 애니메이션 렌더링 (0.4초 후 제거)
```

### 4-3. 라운드 종료 조건

```
매 tick 후 체크:
  - 전체 35개 노드가 파란색 → 라운드 종료 (합의 완료)
  - 60초 타임아웃 도달 → 라운드 강제 종료 (safety valve)
```

유저 승리 조건: **없음**. 3라운드를 플레이하면 무조건 완료.

### 4-4. 라운드 간 상태

```
- 각 라운드의 peakRed(최고 빨강 노드 수) 기록
- 3라운드 후 peakRed[] 배열을 결과 화면에 표시
```

### 4-5. 퀘스트 완료 제출

```
submitAnswer(productId, step, walletAddress, { participation: true })
서버: { participation: true } payload 수신 시 무조건 correct:true 반환
     (secretCode 검증 없음 — 3라운드를 끝낸 클라이언트만 제출 버튼에 접근 가능)
```

---

## 5. 기술 구현 방향

### 5-1. 새 questType

`x402-quests/src/types.ts`:
```typescript
| 'snowman-sabotage'
```

### 5-2. 새 컴포넌트

`x402-quests/src/quests/SnowmanSabotageQuest.tsx`

- ThreeJsQuest.tsx 패턴 참고: `useRef<SVGSVGElement> + useEffect`
- SVG 조작은 DOM API 직접 사용 (원본 HTML 로직 이식)
- React state: `phase('landing'|'game'|'result')`, `round(1|2|3)`, `peakRed[]`
- 쿼리 라인 애니메이션: SVG `<path>` + CSS animation (원본 그대로)

### 5-3. 서버 변경

`x402-server/src/quests.ts`: quest-4 정의를 snowman-sabotage로 교체  
`x402-server/src/routes/quest-api.ts`: snowman-sabotage answer 핸들러 추가 (participation: true 확인)

### 5-4. QuestPage 라우터

`SnowmanSabotageQuest` 케이스 추가 (기존 find-click 제거)

---

## 6. 정확성 노트

이 시뮬레이션은 **Slush** (Avalanche 합의 4단계 중 1단계)를 구현합니다.  
실제 Snowman = Slush + Snowflake(confidence counter) + Snowball(conviction counter) → 선형 체인 적용.  
교육 목적상 핵심 원리(확률적 샘플링, 수렴성)는 정확히 재현합니다.

---

## 7. 범위 외

- 실제 Byzantine fault tolerance 수치 계산 표시
- 노드 수 / K / α 실시간 조정 UI
- 멀티플레이어 (여러 유저가 동시에 방해)
