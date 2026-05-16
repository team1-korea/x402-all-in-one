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
  const [displayPeakRed, setDisplayPeakRed] = useState(0);

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
  const roundEndedRef = useRef(false);
  const timeLeftRef = useRef(ROUND_TIMEOUT_SEC);

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
    if (roundEndedRef.current) return;
    roundEndedRef.current = true;
    clearIntervals();
    const peak = peakRedCurrentRef.current;
    setPeakReds(prev => [...prev, peak]);
    setDisplayPeakRed(peak);
    setPhase('round-end');
  }, [clearIntervals]);

  // ── game phase 진입 시 시뮬레이션 시작 ────────────────
  useEffect(() => {
    if (phase !== 'game') return;

    roundEndedRef.current = false;
    setDisplayPeakRed(0);
    initNodes();
    timeLeftRef.current = ROUND_TIMEOUT_SEC;
    setTimeLeft(ROUND_TIMEOUT_SEC);

    // 60초 안전망 타이머
    timerIntervalRef.current = setInterval(() => {
      timeLeftRef.current -= 1;
      setTimeLeft(timeLeftRef.current);
      if (timeLeftRef.current <= 0) {
        endRound();
      }
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

  // ── round-end: 2초 후 다음 라운드 or 결과 ─────────────
  useEffect(() => {
    if (phase !== 'round-end') return;
    const id = setTimeout(() => {
      if (roundRef.current < TOTAL_ROUNDS) {
        setRound(r => r + 1);
        setPhase('round-start');
      } else {
        setPhase('result');
      }
    }, 2000);
    return () => clearTimeout(id);
  }, [phase]);

  // ── 제출 ─────────────────────────────────────────────
  const handleSubmit = async () => {
    if (loading || result?.correct) return;
    setLoading(true);
    try {
      const res = await submitAnswer(quest.productId, quest.step, quest.walletAddress, {
        participation: true,
      });
      setResult(res);
    } finally {
      setLoading(false);
    }
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
              peakRed={displayPeakRed}
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

function DemoSnowman({ label, divRef }: { label: string; divRef: { current: HTMLDivElement | null } }) {
  return (
    <div ref={divRef} className="flex flex-col items-center gap-1">
      <svg viewBox="0 0 40 52" className="w-9 h-12" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="20" cy="49" rx="14" ry="4" fill="#000" opacity="0.1"/>
        <circle className="smq-snow" cx="20" cy="36" r="13"/>
        <circle className="smq-snow" cx="20" cy="17" r="10"/>
        <circle cx="16" cy="14" r="1.6" fill="#2d3748"/>
        <circle cx="24" cy="14" r="1.6" fill="#2d3748"/>
      </svg>
      <span className="text-[9px] text-gray-600">{label}</span>
    </div>
  );
}

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
          /* 커서 화살표 끝 기준 */
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
          <DemoSnowman label="노드 1" divRef={sm1Ref} />
          <DemoSnowman label="노드 2" divRef={sm2Ref} />
          <DemoSnowman label="노드 3" divRef={sm3Ref} />
          <DemoSnowman label="노드 4" divRef={sm4Ref} />
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
