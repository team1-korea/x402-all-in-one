# Snowman Sabotage Quest Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Quest 4를 "합의 방해 챌린지"로 교체 — Slush 합의 SVG 시뮬레이션 안에서 유저가 악의적 노드를 주입하지만 결국 합의가 항상 이기는 체험형 퀘스트.

**Architecture:** 기존 `find-click` questType을 `snowman-sabotage`로 교체. 새 React 컴포넌트 `SnowmanSabotageQuest.tsx`는 ThreeJsQuest 패턴(useRef + useEffect SVG DOM 조작)으로 Slush 시뮬레이션 엔진을 이식. 서버는 `{ participation: true }` 수신 시 무조건 완료 처리.

**Tech Stack:** React 18, TypeScript, SVG DOM API, Tailwind CSS, Express (server)

---

## File Map

| 역할 | 파일 | 변경 |
|------|------|------|
| 클라이언트 퀘스트 타입 | `x402-quests/src/types.ts` | Modify |
| 클라이언트 API 함수 | `x402-quests/src/api.ts` | Modify |
| 신규 퀘스트 컴포넌트 | `x402-quests/src/quests/SnowmanSabotageQuest.tsx` | Create |
| 퀘스트 라우터 | `x402-quests/src/pages/QuestPage.tsx` | Modify |
| 삭제 대상 | `x402-quests/src/quests/FindClickQuest.tsx` | Delete |
| 서버 퀘스트 타입 | `x402-server/src/types.ts` | Modify |
| 서버 퀘스트 정의 | `x402-server/src/quests.ts` | Modify |
| 서버 답변 핸들러 | `x402-server/src/routes/quest.ts` | Modify |

---

## Task 1: 타입 정의 업데이트

**Files:**
- Modify: `x402-quests/src/types.ts`
- Modify: `x402-server/src/types.ts`
- Modify: `x402-quests/src/api.ts`

- [ ] **Step 1: 클라이언트 QuestType에 `snowman-sabotage` 추가**

`x402-quests/src/types.ts` 의 `QuestType` 유니온에 추가:

```typescript
export type QuestType =
  | 'drag-drop'
  | 'theory-ox'
  | 'theory-mc'
  | 'find-click'
  | 'snowman-sabotage'   // ← 추가
  | 'staff-code'
  | 'feedback'
  | 'threejs'
  | 'interests';
```

- [ ] **Step 2: 서버 QuestType에 `snowman-sabotage` 추가**

`x402-server/src/types.ts` 의 `QuestType` 유니온에 추가:

```typescript
export type QuestType =
  | 'drag-drop'
  | 'theory-ox'
  | 'theory-mc'
  | 'find-click'
  | 'snowman-sabotage'   // ← 추가
  | 'staff-code'
  | 'feedback'
  | 'threejs'
  | 'interests';
```

- [ ] **Step 3: API submitAnswer body에 `participation` 필드 추가**

`x402-quests/src/api.ts` 의 `submitAnswer` 함수 body 타입:

```typescript
export async function submitAnswer(
  productId: string,
  step: number,
  walletAddress: string,
  body: {
    answers?: number[];
    secretCode?: string;
    feedback?: { good: string; bad: string; next: string };
    interests?: string[];
    participation?: boolean;   // ← 추가
  },
): Promise<AnswerResult> {
```

- [ ] **Step 4: TypeScript 컴파일 확인**

```bash
cd x402-quests && npx tsc --noEmit
cd ../x402-server && npx tsc --noEmit
```

Expected: 오류 없음 (또는 기존과 동일한 오류만)

- [ ] **Step 5: Commit**

```bash
git add x402-quests/src/types.ts x402-server/src/types.ts x402-quests/src/api.ts
git commit -m "feat: add snowman-sabotage questType and participation field"
```

---

## Task 2: 서버 퀘스트 정의 + 답변 핸들러

**Files:**
- Modify: `x402-server/src/quests.ts` (lines 71-77, quest-4 교체)
- Modify: `x402-server/src/routes/quest.ts` (lines 245-258, find-click 블록 수정)

- [ ] **Step 1: quest-4 정의를 snowman-sabotage로 교체**

`x402-server/src/quests.ts` 에서 quest-4 객체 전체를 교체:

```typescript
{
  id: "quest-4",
  name: "퀘스트 4 — 합의를 방해하라",
  description: "아발란체 Slush 합의를 방해해보세요",
  price: TONE1,
  questType: "snowman-sabotage",
},
```

- [ ] **Step 2: 답변 핸들러에 snowman-sabotage 브랜치 추가**

`x402-server/src/routes/quest.ts` 에서 기존 `find-click || threejs` 블록(245번 줄 근처)을 수정:

```typescript
  if (quest.questType === "find-click" || quest.questType === "threejs") {
    if (!secretCode) {
      res.status(400).json({ error: "secretCode가 필요합니다" });
      return;
    }
    const correct = secretCode === quest.webCode;
    await recordAnswer(walletAddress, productId, currentStepNum, quest.questType, { secretCode }, correct);
    if (!correct) {
      res.json({ correct: false, message: "올바른 요소를 찾지 못했습니다!" });
      return;
    }
    await updateQuestStatus(walletAddress, productId, currentStepNum, isLastStep);
    res.json({ correct: true, message: "찾았습니다! 🎉" });
    return;
  }

  if (quest.questType === "snowman-sabotage") {
    const { participation } = req.body as { participation?: boolean };
    if (!participation) {
      res.status(400).json({ error: "participation 필드가 필요합니다" });
      return;
    }
    await recordAnswer(walletAddress, productId, currentStepNum, quest.questType, { participation }, true);
    await updateQuestStatus(walletAddress, productId, currentStepNum, isLastStep);
    res.json({ correct: true, message: "3라운드 완료! 합의는 항상 이깁니다 ❄️" });
    return;
  }
```

- [ ] **Step 3: 서버 재시작 후 curl로 검증**

```bash
# 서버가 실행 중이라면 재시작 필요
curl -s -X POST http://localhost:4010/v1/quest/product-a/4/answer \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"0x1234","participation":true}'
```

Expected: `{"correct":true,"message":"3라운드 완료! 합의는 항상 이깁니다 ❄️"}`

- [ ] **Step 4: Commit**

```bash
git add x402-server/src/quests.ts x402-server/src/routes/quest.ts
git commit -m "feat(server): replace quest-4 with snowman-sabotage, add participation handler"
```

---

## Task 3: SnowmanSabotageQuest 컴포넌트

**Files:**
- Create: `x402-quests/src/quests/SnowmanSabotageQuest.tsx`

- [ ] **Step 1: 컴포넌트 파일 생성 — 상수, 타입, 랜딩 phase**

`x402-quests/src/quests/SnowmanSabotageQuest.tsx` 를 아래 내용으로 생성:

```tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import type { QuestData, AnswerResult } from '../types';
import { submitAnswer } from '../api';
import ResultDisplay from '../components/ResultDisplay';

interface Props { quest: QuestData }

// ── 상수 ──────────────────────────────────────────────
const COLOR_RED = '#FF6B6B';
const COLOR_BLUE = '#4ECDC4';
const ROWS = 5;
const COLS = 7;
const K = 5;
const ALPHA = 3;
const TOTAL_ROUNDS = 3;
const ROUND_TIMEOUT_SEC = 60;
const TICK_NORMAL_MS = 300;
const TICK_HOVER_MS = 80;
const NS = 'http://www.w3.org/2000/svg';

type Phase = 'landing' | 'round-start' | 'game' | 'round-end' | 'result';

interface NodeData {
  id: number;
  x: number;
  y: number;
  pref: 0 | 1; // 0=red 1=blue
  baseEl: SVGCircleElement;
  headEl: SVGCircleElement;
}

// ── 컴포넌트 ───────────────────────────────────────────
export default function SnowmanSabotageQuest({ quest }: Props) {
  const [phase, setPhase] = useState<Phase>('landing');
  const [round, setRound] = useState(1);
  const [peakReds, setPeakReds] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIMEOUT_SEC);
  const [redCount, setRedCount] = useState(0);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [loading, setLoading] = useState(false);

  // SVG layer refs (svgRef 불필요 — 레이어 직접 접근)
  const linesLayerRef = useRef<SVGGElement | null>(null);
  const snowmenLayerRef = useRef<SVGGElement | null>(null);

  // Simulation state (not React state — avoids re-render on each tick)
  const nodesRef = useRef<NodeData[]>([]);
  const peakRedCurrentRef = useRef(0);
  const speedRef = useRef(TICK_NORMAL_MS);
  const tickIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef<Phase>('landing');
  const roundRef = useRef(1);

  // Keep refs in sync with state
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { roundRef.current = round; }, [round]);

  // ── 시뮬레이션 초기화 ─────────────────────────────────
  const initNodes = useCallback(() => {
    const linesLayer = linesLayerRef.current;
    const snowmenLayer = snowmenLayerRef.current;
    if (!linesLayer || !snowmenLayer) return;

    // Clear previous elements
    while (linesLayer.firstChild) linesLayer.removeChild(linesLayer.firstChild);
    while (snowmenLayer.firstChild) snowmenLayer.removeChild(snowmenLayer.firstChild);

    const SPACING_X = 90, SPACING_Y = 85;
    const START_X = (800 - (COLS - 1) * SPACING_X) / 2;
    const START_Y = (600 - (ROWS - 1) * SPACING_Y) / 2 + 30;
    const nodes: NodeData[] = [];

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const jitterX = (Math.random() - 0.5) * 20;
        const jitterY = (Math.random() - 0.5) * 20;
        const x = START_X + c * SPACING_X + jitterX;
        const y = START_Y + r * SPACING_Y + jitterY;
        const pref: 0 | 1 = Math.random() < 0.1 ? 0 : 1; // 90% blue

        const gOuter = document.createElementNS(NS, 'g');
        gOuter.setAttribute('transform', `translate(${x}, ${y})`);
        gOuter.style.cursor = 'pointer';

        const gInner = document.createElementNS(NS, 'g');
        gInner.style.transition = 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)';
        gInner.style.transformOrigin = '0px 15px';

        const shadow = document.createElementNS(NS, 'ellipse');
        shadow.setAttribute('cx', '0'); shadow.setAttribute('cy', '28');
        shadow.setAttribute('rx', '18'); shadow.setAttribute('ry', '6');
        shadow.setAttribute('fill', '#000'); shadow.setAttribute('opacity', '0.1');

        const base = document.createElementNS(NS, 'circle');
        base.setAttribute('cx', '0'); base.setAttribute('cy', '15'); base.setAttribute('r', '16');
        base.style.fill = pref === 0 ? COLOR_RED : COLOR_BLUE;
        base.style.transition = 'fill 0.4s ease';

        const head = document.createElementNS(NS, 'circle');
        head.setAttribute('cx', '0'); head.setAttribute('cy', '-2'); head.setAttribute('r', '12');
        head.style.fill = pref === 0 ? COLOR_RED : COLOR_BLUE;
        head.style.transition = 'fill 0.4s ease';

        const eyeL = document.createElementNS(NS, 'circle');
        eyeL.setAttribute('cx', '-4'); eyeL.setAttribute('cy', '-5');
        eyeL.setAttribute('r', '1.8'); eyeL.setAttribute('fill', '#333');
        const eyeR = document.createElementNS(NS, 'circle');
        eyeR.setAttribute('cx', '4'); eyeR.setAttribute('cy', '-5');
        eyeR.setAttribute('r', '1.8'); eyeR.setAttribute('fill', '#333');

        gInner.append(shadow, base, head, eyeL, eyeR);
        gOuter.appendChild(gInner);

        gOuter.addEventListener('mouseenter', () => { gInner.style.transform = 'scale(1.15)'; });
        gOuter.addEventListener('mouseleave', () => { gInner.style.transform = ''; });

        const node: NodeData = { id: nodes.length, x, y, pref, baseEl: base, headEl: head };
        nodes.push(node);

        gOuter.addEventListener('click', () => {
          if (phaseRef.current !== 'game') return;
          if (node.pref !== 1) return; // only blue → red
          node.pref = 0;
          base.style.fill = COLOR_RED;
          head.style.fill = COLOR_RED;
          const red = nodesRef.current.filter(n => n.pref === 0).length;
          if (red > peakRedCurrentRef.current) peakRedCurrentRef.current = red;
          setRedCount(red);
        });

        snowmenLayer.appendChild(gOuter);
      }
    }

    nodesRef.current = nodes;
    const initialRed = nodes.filter(n => n.pref === 0).length;
    peakRedCurrentRef.current = initialRed;
    setRedCount(initialRed);
  }, []);

  // ── Slush 틱 ─────────────────────────────────────────
  const runSlushTick = useCallback((onConsensus: () => void) => {
    const nodes = nodesRef.current;
    const linesLayer = linesLayerRef.current;
    if (!nodes.length || !linesLayer) return;

    for (let t = 0; t < 2; t++) {
      const qIdx = Math.floor(Math.random() * nodes.length);
      const qNode = nodes[qIdx];

      const peers: number[] = [];
      while (peers.length < K) {
        const cand = Math.floor(Math.random() * nodes.length);
        if (cand !== qIdx && !peers.includes(cand)) peers.push(cand);
      }

      let countRed = 0, countBlue = 0;
      peers.forEach(pIdx => {
        const peer = nodes[pIdx];
        if (peer.pref === 0) countRed++; else countBlue++;

        const path = document.createElementNS(NS, 'path');
        const midX = (qNode.x + peer.x) / 2;
        const midY = (qNode.y + peer.y) / 2 - 30;
        path.setAttribute('d', `M ${qNode.x} ${qNode.y} Q ${midX} ${midY} ${peer.x} ${peer.y}`);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', peer.pref === 0 ? COLOR_RED : COLOR_BLUE);
        path.setAttribute('stroke-width', '2');
        path.setAttribute('pathLength', '1');
        path.classList.add('smq-line');
        linesLayer.appendChild(path);
        setTimeout(() => path.parentNode?.removeChild(path), 400);
      });

      if (qNode.pref === 1 && countRed >= ALPHA) {
        qNode.pref = 0;
        qNode.baseEl.style.fill = COLOR_RED;
        qNode.headEl.style.fill = COLOR_RED;
      } else if (qNode.pref === 0 && countBlue >= ALPHA) {
        qNode.pref = 1;
        qNode.baseEl.style.fill = COLOR_BLUE;
        qNode.headEl.style.fill = COLOR_BLUE;
      }
    }

    const red = nodes.filter(n => n.pref === 0).length;
    if (red > peakRedCurrentRef.current) peakRedCurrentRef.current = red;
    setRedCount(red);

    if (nodes.every(n => n.pref === 1)) onConsensus();
  }, []);

  // ── 인터벌 정리 ───────────────────────────────────────
  const clearIntervals = useCallback(() => {
    if (tickIntervalRef.current !== null) {
      clearTimeout(tickIntervalRef.current);
      tickIntervalRef.current = null;
    }
    if (timerIntervalRef.current !== null) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  // ── 라운드 종료 처리 ──────────────────────────────────
  const endRound = useCallback(() => {
    clearIntervals();
    const peak = peakRedCurrentRef.current;
    setPeakReds(prev => [...prev, peak]);
    setPhase('round-end');

    setTimeout(() => {
      const currentRound = roundRef.current;
      if (currentRound < TOTAL_ROUNDS) {
        setRound(r => r + 1);
        setPhase('round-start');
      } else {
        setPhase('result');
      }
    }, 2000);
  }, [clearIntervals]);

  // ── game phase 진입 시 시뮬레이션 시작 ────────────────
  useEffect(() => {
    if (phase !== 'game') return;

    initNodes();
    setTimeLeft(ROUND_TIMEOUT_SEC);

    // 60초 안전망 타이머
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endRound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Slush 루프
    const loop = () => {
      if (phaseRef.current !== 'game') return;
      runSlushTick(endRound);
      tickIntervalRef.current = setTimeout(loop, speedRef.current);
    };
    tickIntervalRef.current = setTimeout(loop, speedRef.current);

    return () => clearIntervals();
  }, [phase, round, initNodes, runSlushTick, endRound, clearIntervals]);

  // ── round-start: 1.5초 후 game 진입 ──────────────────
  useEffect(() => {
    if (phase !== 'round-start') return;
    const id = setTimeout(() => setPhase('game'), 1500);
    return () => clearTimeout(id);
  }, [phase, round]);

  // ── 제출 ─────────────────────────────────────────────
  const handleSubmit = async () => {
    if (loading || result?.correct) return;
    setLoading(true);
    const res = await submitAnswer(quest.productId, quest.step, quest.walletAddress, {
      participation: true,
    });
    setResult(res);
    setLoading(false);
  };

  // ── 렌더링 ───────────────────────────────────────────
  return (
    <>
      <style>{`
        .smq-line {
          stroke-dasharray: 0.2 1;
          stroke-linecap: round;
          animation: smq-shoot 0.4s ease-in-out forwards;
        }
        @keyframes smq-shoot {
          0%   { stroke-dashoffset: 0.2; opacity: 0; }
          20%  { opacity: 0.8; }
          80%  { opacity: 0.8; }
          100% { stroke-dashoffset: -1; opacity: 0; }
        }
      `}</style>

      <div className="w-full max-w-2xl mx-auto px-4 py-10">
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">

          {/* ── 랜딩 ── */}
          {phase === 'landing' && (
            <LandingScreen onStart={() => setPhase('round-start')} />
          )}

          {/* ── 게임 / round-start / round-end ── */}
          {(phase === 'round-start' || phase === 'game' || phase === 'round-end') && (
            <GameScreen
              phase={phase}
              round={round}
              timeLeft={timeLeft}
              redCount={redCount}
              totalNodes={ROWS * COLS}
              linesLayerRef={linesLayerRef}
              snowmenLayerRef={snowmenLayerRef}
              peakRed={peakRedCurrentRef.current}
              onHoverStart={() => { speedRef.current = TICK_HOVER_MS; }}
              onHoverEnd={() => { speedRef.current = TICK_NORMAL_MS; }}
            />
          )}

          {/* ── 결과 ── */}
          {phase === 'result' && !result && (
            <ResultScreen
              peakReds={peakReds}
              totalNodes={ROWS * COLS}
              loading={loading}
              onSubmit={handleSubmit}
            />
          )}

          {result && (
            <ResultDisplay correct={result.correct} message={result.message} />
          )}
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 2: LandingScreen 서브컴포넌트 추가** (동일 파일 하단에 추가)

```tsx
function LandingScreen({ onStart }: { onStart: () => void }) {
  return (
    <>
      <span className="text-xs text-orange-400 uppercase tracking-widest">Quest · 인터랙션</span>
      <h1 className="text-2xl font-bold mt-2 mb-4">아발란체 합의를 방해하라!</h1>

      <div className="bg-gray-800 rounded-lg p-5 mb-6 text-slate-300 text-sm leading-7 space-y-3">
        <p>
          아발란체의 <strong className="text-white">Slush 합의</strong>는 확률적 샘플링으로 동작합니다.
          각 노드는 무작위로 <strong className="text-teal-400">K=5</strong>개 이웃을 샘플링하고,
          그 중 <strong className="text-teal-400">α=3개 이상</strong>이 같은 색이면 자신도 그 색으로 바뀝니다.
        </p>
        <p>
          <strong className="text-white">당신의 역할:</strong> 정상적으로 합의되고 있는{' '}
          <span className="text-teal-400 font-semibold">파란 눈사람(정직한 노드)</span>을 클릭해{' '}
          <span className="text-red-400 font-semibold">빨간 눈사람(악의적 트랜잭션)</span>으로 바꾸세요.
          총 3번의 블록 생성을 방해해보세요.
        </p>
        <p className="text-slate-500 text-xs">건투를 빕니다. 확률적으로 거의 불가능합니다.</p>
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

- [ ] **Step 3: GameScreen 서브컴포넌트 추가** (동일 파일 하단에 추가)

```tsx
interface GameScreenProps {
  phase: Phase;
  round: number;
  timeLeft: number;
  redCount: number;
  totalNodes: number;
  linesLayerRef: React.MutableRefObject<SVGGElement | null>;
  snowmenLayerRef: React.MutableRefObject<SVGGElement | null>;
  peakRed: number;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}

function GameScreen({
  phase, round, timeLeft, redCount, totalNodes,
  linesLayerRef, snowmenLayerRef,
  peakRed, onHoverStart, onHoverEnd,
}: GameScreenProps) {
  const blueCount = totalNodes - redCount;

  return (
    <>
      {/* HUD */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {Array.from({ length: TOTAL_ROUNDS }, (_, i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                i + 1 < round
                  ? 'bg-gray-600 text-gray-400'
                  : i + 1 === round
                  ? 'bg-orange-500 text-white'
                  : 'border-2 border-dashed border-gray-700 text-gray-600'
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>
        <span className="text-gray-600 text-xs tabular-nums">{timeLeft}s</span>
      </div>

      <p className="text-slate-400 text-xs mb-3 text-center">
        파란 눈사람을 클릭해 빨갛게 만드세요
      </p>

      {/* SVG 시뮬레이션 */}
      <div
        className="relative w-full rounded-xl overflow-hidden border border-gray-700 bg-[#F7F9F9]"
        style={{ aspectRatio: '4/3' }}
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverEnd}
      >
        <svg
          viewBox="0 0 800 600"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <rect width="800" height="600" fill="#F7F9F9" />
          <text x="400" y="38" fontSize="20" fontWeight="bold" fill="#333" textAnchor="middle">
            Block {round} / {TOTAL_ROUNDS}
          </text>
          <g ref={linesLayerRef} />
          <g ref={snowmenLayerRef} />
        </svg>

        {/* Round-start 오버레이 */}
        {phase === 'round-start' && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 rounded-xl">
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-400">Block {round}</p>
              <p className="text-slate-400 mt-1">합의 시작...</p>
            </div>
          </div>
        )}

        {/* Round-end 오버레이 */}
        {phase === 'round-end' && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 rounded-xl">
            <div className="text-center">
              <p className="text-xl font-bold text-teal-400">Block {round} 확정</p>
              <p className="text-slate-300 mt-1">합의가 이겼습니다</p>
              <p className="text-slate-500 text-sm mt-2">최고 방해: {peakRed} / {totalNodes}</p>
            </div>
          </div>
        )}
      </div>

      {/* 스탯 */}
      <div className="flex gap-3 mt-4">
        <div className="flex-1 bg-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-500 uppercase tracking-wider">파란 노드</p>
          <p className="text-lg font-bold text-teal-400">{blueCount} / {totalNodes}</p>
        </div>
        <div className="flex-1 bg-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-500 uppercase tracking-wider">빨간 노드</p>
          <p className="text-lg font-bold text-red-400">{redCount} / {totalNodes}</p>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 4: ResultScreen 서브컴포넌트 추가** (동일 파일 하단에 추가)

```tsx
function ResultScreen({
  peakReds, totalNodes, loading, onSubmit,
}: {
  peakReds: number[];
  totalNodes: number;
  loading: boolean;
  onSubmit: () => void;
}) {
  return (
    <>
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">❄️</div>
        <h2 className="text-xl font-bold">건투했지만… 합의는 멈추지 않습니다</h2>
      </div>

      {/* 라운드별 기록 */}
      <div className="flex gap-3 mb-5">
        {peakReds.map((peak, i) => (
          <div key={i} className="flex-1 bg-gray-800 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Block {i + 1}</p>
            <p className="text-base font-bold text-red-400 mt-1">{peak} / {totalNodes}</p>
            <p className="text-xs text-gray-600">최고 방해</p>
          </div>
        ))}
      </div>

      {/* 교육 텍스트 */}
      <div className="bg-gray-800 rounded-lg p-4 text-sm text-slate-300 leading-7 mb-5 space-y-2">
        <p>
          이것이 <strong className="text-white">Slush 합의</strong>의 힘입니다. 네트워크에 정직한 노드가
          다수라면, 악의적인 노드가 다수를 장악하기란 수학적으로 <strong className="text-white">지수적으로 불가능</strong>합니다.
        </p>
        <p>
          아발란체의 C-Chain과 P-Chain은 Slush에 confidence counter와 conviction counter를 더한{' '}
          <strong className="text-white">Snowman 합의</strong>를 실제로 사용합니다.
        </p>
      </div>

      <button
        onClick={onSubmit}
        disabled={loading}
        className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-semibold text-white transition-colors"
      >
        {loading ? '처리 중...' : '퀘스트 완료 제출 →'}
      </button>
    </>
  );
}
```

- [ ] **Step 5: dev 서버에서 렌더링 확인**

QuestPage를 일시적으로 수정해 SnowmanSabotageQuest를 하드코딩으로 띄워 시각 확인:

```bash
cd x402-quests && npm run dev
# 브라우저에서 http://localhost:25001 확인
# 랜딩 화면 → 게임 → 3라운드 → 결과 화면 전체 플로우 점검
```

- [ ] **Step 6: Commit**

```bash
git add x402-quests/src/quests/SnowmanSabotageQuest.tsx
git commit -m "feat(quests): add SnowmanSabotageQuest component with Slush simulation"
```

---

## Task 4: QuestPage 라우터 연결 + FindClickQuest 제거

**Files:**
- Modify: `x402-quests/src/pages/QuestPage.tsx`
- Delete: `x402-quests/src/quests/FindClickQuest.tsx`

- [ ] **Step 1: QuestPage에 SnowmanSabotageQuest import 추가, find-click 제거**

`x402-quests/src/pages/QuestPage.tsx` 전체를 아래로 교체:

```tsx
import { useEffect, useState, lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { fetchQuest } from '../api';
import type { QuestData } from '../types';
import TheoryQuiz from '../quests/TheoryQuiz';
import StaffCodeQuest from '../quests/StaffCodeQuest';
import FeedbackQuest from '../quests/FeedbackQuest';
import InterestsQuest from '../quests/InterestsQuest';
import SnowmanSabotageQuest from '../quests/SnowmanSabotageQuest';

const ThreeJsQuest = lazy(() => import('../quests/ThreeJsQuest'));

export default function QuestPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const [quest, setQuest] = useState<QuestData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uuid) return;
    fetchQuest(uuid)
      .then(setQuest)
      .catch((e: Error) => setError(e.message));
  }, [uuid]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <p className="text-5xl mb-4">404</p>
        <p className="text-slate-400">{error}</p>
        <p className="text-slate-600 text-sm mt-2">x402로 퀘스트를 구매하면 고유 URL을 받을 수 있습니다</p>
      </div>
    );
  }

  if (!quest) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-500 animate-pulse">퀘스트 로딩 중...</p>
      </div>
    );
  }

  const props = { quest };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {(quest.questType === 'theory-ox' || quest.questType === 'theory-mc') && (
        <TheoryQuiz {...props} />
      )}
      {quest.questType === 'snowman-sabotage' && <SnowmanSabotageQuest {...props} />}
      {quest.questType === 'staff-code' && <StaffCodeQuest {...props} />}
      {quest.questType === 'feedback' && <FeedbackQuest {...props} />}
      {quest.questType === 'interests' && <InterestsQuest {...props} />}
      {quest.questType === 'threejs' && (
        <Suspense fallback={<p className="text-slate-500 animate-pulse">3D 로딩 중...</p>}>
          <ThreeJsQuest {...props} />
        </Suspense>
      )}
      {quest.questType === 'drag-drop' && (
        <div className="text-slate-500 text-center p-8">이 퀘스트는 준비 중입니다.</div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: FindClickQuest.tsx 삭제**

```bash
rm x402-quests/src/quests/FindClickQuest.tsx
```

- [ ] **Step 3: TypeScript 컴파일 확인**

```bash
cd x402-quests && npx tsc --noEmit
```

Expected: 오류 없음

- [ ] **Step 4: 전체 플로우 E2E 확인**

```bash
# 터미널 1: 서버
cd x402-server && npm run dev

# 터미널 2: 프론트엔드
cd x402-quests && npm run dev

# 브라우저 확인 항목:
# 1. quest-4 UUID로 접근 시 SnowmanSabotageQuest 렌더링
# 2. 랜딩 → "합의 방해하러 가기" → Round 1 시작 오버레이
# 3. 파란 눈사람 클릭 → 빨간색 전환
# 4. 합의 자동 수렴 (파랑으로 돌아옴)
# 5. Round 1 종료 → Round 2 → Round 3 → 결과 화면
# 6. 결과 화면에서 "퀘스트 완료 제출" → correct: true
```

- [ ] **Step 5: Commit**

```bash
git add x402-quests/src/pages/QuestPage.tsx
git commit -m "feat(quests): wire SnowmanSabotageQuest, remove FindClickQuest"
```
