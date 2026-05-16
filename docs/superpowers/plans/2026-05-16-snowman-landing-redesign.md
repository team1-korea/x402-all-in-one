# Snowman Sabotage — 랜딩 화면 개선 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `SnowmanSabotageQuest.tsx`의 `LandingScreen` 컴포넌트를 교체해, 블록체인 비전문가도 이해할 수 있는 설명과 JS 기반 커서 애니메이션 데모를 추가한다.

**Architecture:** `LandingScreen` 함수 하나만 전면 교체. `useRef`로 데모 영역의 DOM 요소를 잡고 `useEffect` 안에서 async 루프를 돌려 커서를 `getBoundingClientRect` 기반으로 정확히 이동시킨다. 게임 로직(Slush 루프, GameScreen, ResultScreen)은 전혀 건드리지 않는다.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, SVG, CSS keyframe animations

---

### Task 1: LandingScreen 정적 구조 교체

**Files:**
- Modify: `x402-quests/src/quests/SnowmanSabotageQuest.tsx` (line 345–374, `LandingScreen` 함수 전체)

- [ ] **Step 1: 개발 서버 실행 확인**

```bash
cd x402-quests && npm run dev
```

브라우저에서 랜딩 화면이 열리는지 확인. 이후 작업은 HMR로 실시간 반영됨.

- [ ] **Step 2: `LandingScreen` 함수 전체 교체 (정적 구조 — 애니메이션 없음)**

`SnowmanSabotageQuest.tsx`의 `LandingScreen` 함수(line 345~374)를 아래로 완전히 교체한다.

```tsx
function LandingScreen({ onStart }: { onStart: () => void }) {
  const areaRef   = useRef<HTMLDivElement | null>(null);
  const sm1Ref    = useRef<HTMLDivElement | null>(null);
  const sm2Ref    = useRef<HTMLDivElement | null>(null);
  const sm3Ref    = useRef<HTMLDivElement | null>(null);
  const sm4Ref    = useRef<HTMLDivElement | null>(null);
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const rippleRef = useRef<HTMLDivElement | null>(null);

  return (
    <>
      <style>{`
        .smq-snow { fill: #4ECDC4; transition: fill 0.35s ease; }
        .smq-node-red .smq-snow { fill: #FF6B6B; }
        .smq-demo-cursor {
          position: absolute; width: 22px; height: 22px;
          pointer-events: none; z-index: 20; top: 0; left: 0;
          transform-origin: 3px 2px;
        }
        .smq-cursor-click { animation: smqCursorClick 0.22s ease-out forwards; }
        @keyframes smqCursorClick {
          0%   { transform: scale(1)    rotate(0deg); }
          30%  { transform: scale(0.72) rotate(-8deg); }
          70%  { transform: scale(1.18) rotate(4deg); }
          100% { transform: scale(1)    rotate(0deg); }
        }
        .smq-demo-ripple {
          position: absolute; width: 32px; height: 32px;
          border-radius: 50%; pointer-events: none; z-index: 19; opacity: 0;
        }
        .smq-ripple-pop { animation: smqRipplePop 0.45s ease-out forwards; }
        @keyframes smqRipplePop {
          0%   { opacity: 0.7; transform: scale(0.3); background: rgba(251,146,60,0.5); }
          60%  { opacity: 0.3; transform: scale(1.2); background: rgba(251,146,60,0.2); }
          100% { opacity: 0;   transform: scale(1.6); background: rgba(251,146,60,0); }
        }
      `}</style>

      <span className="text-xs text-orange-400 uppercase tracking-widest">Quest · 인터랙션</span>
      <h1 className="text-2xl font-bold mt-2 mb-4">아발란체 합의를 방해하라!</h1>

      <div className="bg-gray-800 rounded-lg p-5 mb-5 text-slate-300 text-sm leading-7 space-y-3">
        <p>
          블록체인이 작동하려면 수백 개의 컴퓨터(<strong className="text-white">노드</strong>)가{' '}
          <span className="text-green-400">"이 거래가 맞다"</span>고 동의해야 합니다.
          아발란체는 각 노드가 <strong className="text-white">무작위로 이웃 5개</strong>에게 물어보고,
          다수가 동의하면 자신도 따르는 방식으로 빠르게 합의합니다.
        </p>
        <p>
          <strong className="text-white">당신의 역할:</strong>{' '}
          <span className="text-teal-400 font-semibold">파란 눈사람(정직한 노드)</span>을 클릭해{' '}
          <span className="text-red-400 font-semibold">빨간 눈사람(악의적 노드)</span>으로 바꾸세요.
          합의가 완료되기 전에 다수를 장악하면 됩니다. 총 3번의 블록 생성을 방해해보세요.
        </p>
        <p className="text-slate-500 text-xs">확률적으로 거의 불가능합니다. 건투를 빕니다.</p>
      </div>

      {/* 데모 영역 */}
      <div ref={areaRef} className="relative bg-gray-800 rounded-lg p-4 mb-5 overflow-hidden">
        <p className="text-[10px] text-gray-600 text-center tracking-widest mb-4">
          ▸ 이렇게 클릭하면 됩니다
        </p>

        <div className="grid grid-cols-2 gap-y-3 gap-x-8 w-fit mx-auto">
          {/* 노드1 top-left */}
          <div ref={sm1Ref} className="flex flex-col items-center gap-1">
            <svg viewBox="0 0 40 52" className="w-9 h-12" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="20" cy="49" rx="14" ry="4" fill="#000" opacity="0.1"/>
              <circle className="smq-snow" cx="20" cy="36" r="13"/>
              <circle className="smq-snow" cx="20" cy="17" r="10"/>
              <circle cx="16" cy="14" r="1.6" fill="#2d3748"/>
              <circle cx="24" cy="14" r="1.6" fill="#2d3748"/>
            </svg>
            <span className="text-[9px] text-gray-600">노드 1</span>
          </div>
          {/* 노드2 top-right */}
          <div ref={sm2Ref} className="flex flex-col items-center gap-1">
            <svg viewBox="0 0 40 52" className="w-9 h-12" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="20" cy="49" rx="14" ry="4" fill="#000" opacity="0.1"/>
              <circle className="smq-snow" cx="20" cy="36" r="13"/>
              <circle className="smq-snow" cx="20" cy="17" r="10"/>
              <circle cx="16" cy="14" r="1.6" fill="#2d3748"/>
              <circle cx="24" cy="14" r="1.6" fill="#2d3748"/>
            </svg>
            <span className="text-[9px] text-gray-600">노드 2</span>
          </div>
          {/* 노드3 bottom-left — 항상 파란색 유지 */}
          <div ref={sm3Ref} className="flex flex-col items-center gap-1">
            <svg viewBox="0 0 40 52" className="w-9 h-12" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="20" cy="49" rx="14" ry="4" fill="#000" opacity="0.1"/>
              <circle className="smq-snow" cx="20" cy="36" r="13"/>
              <circle className="smq-snow" cx="20" cy="17" r="10"/>
              <circle cx="16" cy="14" r="1.6" fill="#2d3748"/>
              <circle cx="24" cy="14" r="1.6" fill="#2d3748"/>
            </svg>
            <span className="text-[9px] text-gray-600">노드 3</span>
          </div>
          {/* 노드4 bottom-right */}
          <div ref={sm4Ref} className="flex flex-col items-center gap-1">
            <svg viewBox="0 0 40 52" className="w-9 h-12" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="20" cy="49" rx="14" ry="4" fill="#000" opacity="0.1"/>
              <circle className="smq-snow" cx="20" cy="36" r="13"/>
              <circle className="smq-snow" cx="20" cy="17" r="10"/>
              <circle cx="16" cy="14" r="1.6" fill="#2d3748"/>
              <circle cx="24" cy="14" r="1.6" fill="#2d3748"/>
            </svg>
            <span className="text-[9px] text-gray-600">노드 4</span>
          </div>
        </div>

        {/* JS가 left/top으로 위치 제어 */}
        <div ref={cursorRef} className="smq-demo-cursor">
          <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 2L9 17L12 11.5L18 9L3 2Z" fill="white" stroke="#555"
              strokeWidth="1.2" strokeLinejoin="round"/>
          </svg>
        </div>
        <div ref={rippleRef} className="smq-demo-ripple" />
      </div>

      <button
        onClick={onStart}
        className="w-full py-3 bg-orange-600 hover:bg-orange-500 rounded-lg font-semibold text-white transition-colors"
      >
        합의 방해하러 가기 →
      </button>
    </>
  );
}
```

- [ ] **Step 3: 브라우저에서 정적 구조 확인**

- 설명 2문단 + 소문자 "건투를 빕니다" 한 줄 보임
- 2×2 눈사람 그리드 렌더됨 (모두 파란색)
- 커서/리플 DOM 요소 존재하나 화면에 보이지 않음 (top:0, left:0에 있음)
- TypeScript 컴파일 에러 없음 (`npm run build` 또는 vite overlay 확인)

- [ ] **Step 4: 커밋**

```bash
git add x402-quests/src/quests/SnowmanSabotageQuest.tsx
git commit -m "feat(quests): redesign LandingScreen with narrative copy and 2x2 demo grid"
```

---

### Task 2: JS 커서 애니메이션 루프 추가

**Files:**
- Modify: `x402-quests/src/quests/SnowmanSabotageQuest.tsx` (`LandingScreen` 내 `useEffect` 추가)

- [ ] **Step 1: `LandingScreen` 함수 안 `return` 바로 위에 `useEffect` 삽입**

Task 1에서 작성한 `LandingScreen` 함수의 `return (` 바로 위에 아래 블록을 추가한다.

```tsx
  useEffect(() => {
    const area   = areaRef.current;
    const cursor = cursorRef.current;
    const ripple = rippleRef.current;
    if (!area || !cursor || !ripple) return;

    const ORDER = [sm1Ref, sm4Ref, sm2Ref]; // 노드3은 파랗게 유지
    let cancelled = false;

    function getCenter(ref: { current: HTMLDivElement | null }) {
      const svg = ref.current?.querySelector('svg');
      if (!svg) return { x: 0, y: 0 };
      const aR = area.getBoundingClientRect();
      const sR = svg.getBoundingClientRect();
      // 눈사람 머리 중심: SVG viewBox 내 cy=17, 전체 높이 52
      return {
        x: sR.left - aR.left + sR.width / 2,
        y: sR.top  - aR.top  + sR.height * (17 / 52),
      };
    }

    function placeCursor(x: number, y: number, animate: boolean) {
      cursor.style.transition = animate
        ? 'left 0.55s cubic-bezier(0.25,0.46,0.45,0.94), top 0.55s cubic-bezier(0.25,0.46,0.45,0.94)'
        : 'none';
      cursor.style.left = `${x}px`;
      cursor.style.top  = `${y}px`;
    }

    const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

    async function doClick(ref: { current: HTMLDivElement | null }) {
      const { x, y } = getCenter(ref);

      // 커서 스쿼시 재시작 (reflow trick)
      cursor.classList.remove('smq-cursor-click');
      void cursor.offsetWidth;
      cursor.classList.add('smq-cursor-click');

      // 리플 재시작
      ripple.classList.remove('smq-ripple-pop');
      ripple.style.left = `${x - 16}px`;
      ripple.style.top  = `${y - 16}px`;
      void ripple.offsetWidth;
      ripple.classList.add('smq-ripple-pop');

      // 눈사람 빨갛게
      ref.current?.classList.add('smq-node-red');

      await sleep(450);
      cursor.classList.remove('smq-cursor-click');
      ripple.classList.remove('smq-ripple-pop');
    }

    async function runLoop() {
      // 시작 시 화면 밖에서 대기
      placeCursor(-40, -40, false);
      await sleep(400);

      while (!cancelled) {
        // 전체 리셋
        [sm1Ref, sm2Ref, sm3Ref, sm4Ref].forEach(r =>
          r.current?.classList.remove('smq-node-red')
        );
        await sleep(500);

        for (const ref of ORDER) {
          if (cancelled) return;
          const { x, y } = getCenter(ref);
          placeCursor(x - 2, y - 2, true);
          await sleep(620); // transition 완료 대기
          await doClick(ref);
          await sleep(650);
        }

        await sleep(1000); // 루프 간 대기
      }
    }

    runLoop();
    return () => { cancelled = true; };
  }, []);
```

- [ ] **Step 2: 브라우저에서 애니메이션 동작 확인**

다음을 순서대로 확인한다:
1. 페이지 로드 후 약 0.4초 뒤 커서가 노드1 머리 위에 나타남
2. 커서가 노드1에서 클릭 — 스쿼시(줄어들었다 튕김) + 오렌지 리플 + 노드1 파란→빨강
3. 커서가 노드4로 이동 → 클릭 → 노드4 빨강
4. 커서가 노드2로 이동 → 클릭 → 노드2 빨강
5. 잠시 후 노드1·2·4 모두 파랗게 리셋, 루프 반복
6. 노드3은 항상 파란색 유지
7. "합의 방해하러 가기" 버튼 클릭 시 게임 화면으로 정상 전환

- [ ] **Step 3: 창 크기를 바꿔서 커서 위치 재확인**

브라우저 창을 좁게 리사이즈(375px)했다가 다시 넓혀도 커서가 눈사람 머리를 정확히 가리키는지 확인. (루프가 매 tick마다 `getBoundingClientRect`를 호출하므로 리사이즈에 자동 대응됨)

- [ ] **Step 4: 커밋**

```bash
git add x402-quests/src/quests/SnowmanSabotageQuest.tsx
git commit -m "feat(quests): add JS cursor animation loop to landing demo"
```
