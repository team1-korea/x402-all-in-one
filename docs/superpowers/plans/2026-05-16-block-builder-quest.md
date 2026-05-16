# Block Builder Quest Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `drag-drop` questType에 블록 연결 퍼즐 미션을 구현한다.

**Architecture:** `BlockBuilderQuest.tsx` + `BlockBuilderQuest.module.css` 2개 파일을 신규 생성하고, `QuestPage.tsx`의 `drag-drop` 분기를 연결한다. 블록체인 데이터는 mock 전용(외부 API 없음), 기차 애니메이션은 목표 높이 800 고정, 완료 시 `submitAnswer({ participation: true })` 호출.

**Tech Stack:** React 18, TypeScript, Vite, CSS Modules, React Router v6, `submitAnswer` API (기존)

---

## 파일 맵

| 경로 | 작업 |
|------|------|
| `x402-quests/src/quests/BlockBuilderQuest.module.css` | 신규 생성 |
| `x402-quests/src/quests/BlockBuilderQuest.tsx` | 신규 생성 |
| `x402-quests/src/pages/QuestPage.tsx` | 수정 (drag-drop 분기) |

---

## Task 1: CSS Module 생성

**Files:**
- Create: `x402-quests/src/quests/BlockBuilderQuest.module.css`

- [ ] **Step 1: CSS 파일 생성**

`x402-quests/src/quests/BlockBuilderQuest.module.css` 를 아래 내용으로 생성한다.
(`var(--abcfe-white)` → `#ffffff`, `var(--abcfe-gray)` → `#666666` 치환 완료)

```css
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  text-align: center;
  user-select: none;
  position: relative;
  overflow: hidden;
}

.gameArea {
  position: relative;
  width: 100%;
  flex: 1;
  min-height: 500px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 20px;
  overflow: visible;
}

.blocksClip {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  border-radius: 20px;
  z-index: 10;
}

.gameArea::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 4px solid #ffffff;
  border-radius: 20px;
  pointer-events: none;
  z-index: 30;
}

.svgLayer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 5;
}

.blockCard {
  position: absolute;
  width: 220px;
  background: #1a1a1a;
  border: 2px solid #ffffff;
  border-radius: 10px;
  padding: 1rem;
  color: #fff;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 10;
  transition: transform 0.2s, box-shadow 0.2s;
  overflow: visible;
  will-change: left, filter, opacity;
}

.blockCard.connected {
  border-color: #4ade80;
  box-shadow: 0 0 15px rgba(74, 222, 128, 0.3);
}

.blockCard.arranging {
  transition: left 0.6s ease-out, top 0.6s ease-out, transform 0.2s, box-shadow 0.2s;
}

.blockCard.scrolling {
  transition: none !important;
}

.blockCard:hover {
  transform: scale(1.02);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.6);
  z-index: 20;
}

.blockHeader {
  font-weight: bold;
  font-size: 1.1rem;
  color: #a78bfa;
  border-bottom: 1px solid #333;
  padding-bottom: 0.5rem;
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: space-between;
}

.hashRow {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  font-size: 0.7rem;
  font-family: monospace;
  color: #888;
}

.hashValue {
  color: #fff;
  background: #333;
  padding: 2px 5px;
  border-radius: 4px;
  margin-top: 2px;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.socket {
  width: 20px;
  height: 20px;
  background: #333;
  border: 2px solid #fff;
  border-radius: 50%;
  position: absolute;
  cursor: crosshair;
  transition: all 0.2s;
  z-index: 60;
}

.socket:hover {
  transform: scale(1.2);
  background: #a78bfa;
}

.socket.input {
  top: 50%;
  left: -10px;
  transform: translateY(-50%);
}

.socket.output {
  top: 50%;
  right: -10px;
  transform: translateY(-50%);
}

.genesisBlock .output {
  background: #ef4444;
}

.invalidLine {
  animation: shakeAndFade 0.8s ease-out forwards;
}

@keyframes shakeAndFade {
  0% { opacity: 1; transform: translateX(0); }
  10% { transform: translateX(-5px); }
  20% { transform: translateX(5px); }
  30% { transform: translateX(-5px); }
  40% { transform: translateX(5px); }
  50% { transform: translateX(-3px); }
  60% { transform: translateX(3px); }
  70% { opacity: 0.7; transform: translateX(-2px); }
  80% { opacity: 0.4; transform: translateX(2px); }
  100% { opacity: 0; transform: translateX(0); }
}

.hintContainer {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  animation: hintSlideUp 0.4s ease-out;
}

.hintMessage {
  background: rgba(0, 0, 0, 0.9);
  border: 2px solid #a78bfa;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #fff;
  font-size: 1rem;
  box-shadow: 0 4px 20px rgba(167, 139, 250, 0.3);
}

.hintIcon {
  font-size: 1.5rem;
}

@keyframes hintSlideUp {
  from { opacity: 0; transform: translateX(-50%) translateY(20px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

.trainBlock {
  opacity: 0.85;
  border-color: #ffffff;
  transition: none;
}

.trainBlock:hover {
  transform: none;
}

.finalBlock {
  opacity: 1;
  border-color: #ffffff;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
}

.attachingBlock {
  animation: blockAttachSlideIn 0.8s ease-out forwards;
}

@keyframes blockAttachSlideIn {
  from { opacity: 0; transform: translateX(100px); }
  to { opacity: 1; transform: translateX(0); }
}

.latestBlock {
  border: 3px solid #ffd700 !important;
  box-shadow: 0 0 25px rgba(255, 215, 0, 0.5), 0 0 50px rgba(255, 215, 0, 0.2) !important;
  animation: latestBlockGlow 2s ease-in-out infinite;
}

@keyframes latestBlockGlow {
  0%, 100% { box-shadow: 0 0 25px rgba(255, 215, 0, 0.5), 0 0 50px rgba(255, 215, 0, 0.2); }
  50% { box-shadow: 0 0 35px rgba(255, 215, 0, 0.7), 0 0 70px rgba(255, 215, 0, 0.3); }
}

.latestBlockLabel {
  position: absolute;
  top: -32px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #ffd700, #ffaa00);
  color: #000;
  font-size: 0.75rem;
  font-weight: bold;
  padding: 4px 12px;
  border-radius: 12px;
  white-space: nowrap;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.4);
}

.pendingBlock {
  position: absolute;
  width: 220px;
  background: rgba(30, 30, 35, 0.6);
  border: 2px dashed rgba(255, 255, 255, 0.4);
  border-radius: 10px;
  padding: 1rem;
  color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 10;
  animation: pendingPulse 2s ease-in-out infinite;
}

.pendingBlock .blockHeader {
  color: rgba(167, 139, 250, 0.6);
  border-bottom-color: rgba(51, 51, 51, 0.5);
}

.pendingBlock .hashRow {
  color: rgba(136, 136, 136, 0.6);
}

.pendingBlock .hashValue {
  background: rgba(51, 51, 51, 0.5);
  color: rgba(255, 255, 255, 0.6);
}

.hashValuePending {
  color: rgba(255, 255, 255, 0.4);
  background: rgba(51, 51, 51, 0.5);
  padding: 2px 5px;
  border-radius: 4px;
  margin-top: 2px;
  width: 100%;
  text-align: center;
  font-style: italic;
  animation: hashBlink 1.5s ease-in-out infinite;
}

.pendingBlockLabel {
  position: absolute;
  top: -32px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(100, 100, 120, 0.8);
  color: #fff;
  font-size: 0.75rem;
  font-weight: bold;
  padding: 4px 12px;
  border-radius: 12px;
  white-space: nowrap;
  z-index: 100;
  animation: pendingLabelPulse 2s ease-in-out infinite;
}

.pendingSocket {
  background: rgba(51, 51, 51, 0.5) !important;
  border-color: rgba(255, 255, 255, 0.3) !important;
}

@keyframes pendingPulse {
  0%, 100% { opacity: 0.6; border-color: rgba(255, 255, 255, 0.3); }
  50% { opacity: 0.9; border-color: rgba(255, 255, 255, 0.5); }
}

@keyframes pendingLabelPulse {
  0%, 100% { background: rgba(100, 100, 120, 0.7); }
  50% { background: rgba(120, 120, 140, 0.9); }
}

@keyframes hashBlink {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}

.blockTooltip {
  position: absolute;
  transform: translateX(-50%) translateY(-100%);
  background: rgba(0, 0, 0, 0.95);
  border: 1px solid #a78bfa;
  border-radius: 10px;
  padding: 1rem;
  min-width: 220px;
  margin-top: -10px;
  z-index: 20000;
  animation: tooltipFadeIn 0.2s ease-out;
  pointer-events: none;
}

.blockTooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 8px solid transparent;
  border-top-color: #a78bfa;
}

.blockTooltipBelow {
  position: absolute;
  transform: translateX(-50%) translateY(0);
  background: rgba(0, 0, 0, 0.95);
  border: 1px solid #a78bfa;
  border-radius: 10px;
  padding: 1rem;
  min-width: 220px;
  margin-top: 10px;
  z-index: 20000;
  animation: tooltipFadeIn 0.2s ease-out;
  pointer-events: none;
}

.blockTooltipBelow::before {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 8px solid transparent;
  border-bottom-color: #a78bfa;
}

.tooltipTitle {
  font-size: 0.85rem;
  font-weight: bold;
  color: #a78bfa;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(167, 139, 250, 0.3);
  text-align: center;
}

.tooltipRow {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  padding: 0.25rem 0;
  color: #ccc;
}

.tooltipRow span:first-child { color: #888; }
.tooltipRow span:last-child { color: #fff; font-weight: 500; }

.tooltipHash {
  font-family: monospace;
  background: #333;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.65rem;
  max-width: 180px;
  text-align: right;
}

.tooltipDivider {
  height: 1px;
  background: rgba(167, 139, 250, 0.2);
  margin: 0.5rem 0;
}

@keyframes tooltipFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.helpButton {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 44px;
  height: 44px;
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  cursor: pointer;
  z-index: 40;
  transition: all 0.2s;
  font-size: 1.2rem;
  font-weight: bold;
}

.helpButton:hover {
  background: rgba(167, 139, 250, 0.3);
  border-color: #a78bfa;
  transform: scale(1.05);
}

.helpTooltip {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  background: rgba(0, 0, 0, 0.95);
  border: 2px solid #a78bfa;
  border-radius: 12px;
  padding: 1.25rem;
  min-width: 300px;
  z-index: 100;
  animation: helpTooltipFadeIn 0.2s ease-out;
}

.helpTooltip::before {
  content: '';
  position: absolute;
  bottom: 100%;
  right: 16px;
  border: 8px solid transparent;
  border-bottom-color: #a78bfa;
}

@keyframes helpTooltipFadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

.helpTooltipTitle {
  font-size: 1rem;
  font-weight: bold;
  color: #a78bfa;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(167, 139, 250, 0.3);
}

.helpTooltipList {
  margin: 0;
  padding: 0;
  list-style: none;
  counter-reset: hint-counter;
  text-align: left;
}

.helpTooltipList li {
  color: #ccc;
  font-size: 0.9rem;
  line-height: 1.5;
  padding: 0.5rem 0;
  padding-left: 1.5rem;
  position: relative;
  counter-increment: hint-counter;
}

.helpTooltipList li::before {
  content: counter(hint-counter) '.';
  position: absolute;
  left: 0;
  color: #a78bfa;
  font-weight: bold;
}

.successOverlay {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 50;
  animation: successSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.successCard {
  position: relative;
  background: linear-gradient(165deg, rgba(18, 18, 22, 0.98) 0%, rgba(12, 12, 14, 0.99) 100%);
  border: 1px solid rgba(74, 222, 128, 0.25);
  border-radius: 20px;
  padding: 2rem 2.25rem;
  text-align: center;
  backdrop-filter: blur(16px);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), 0 0 40px rgba(74, 222, 128, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.04);
  max-width: 380px;
}

.successCard::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #4ade80, transparent);
  border-radius: 0 0 4px 4px;
}

.successIcon {
  position: relative;
  width: 56px;
  height: 56px;
  margin: 0 auto 1.25rem;
  background: linear-gradient(145deg, #4ade80, #22c55e);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #000;
  font-weight: bold;
  box-shadow: 0 6px 20px rgba(74, 222, 128, 0.35);
}

.successTitle {
  font-size: 1.5rem;
  font-weight: 700;
  color: #4ade80;
  margin: 0 0 0.5rem 0;
}

.successDesc {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0 0 1.25rem 0;
}

.successDesc2 {
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.9rem;
  font-weight: 500;
  line-height: 1.6;
  margin: 0 0 1.25rem 0;
  padding: 0.875rem 1rem;
  background: rgba(74, 222, 128, 0.06);
  border: 1px solid rgba(74, 222, 128, 0.15);
  border-radius: 10px;
}

.highlightChain { color: #60a5fa; font-weight: bold; }
.highlightBlockchain { color: rgb(230, 72, 72); font-weight: bold; }

.successButtons {
  display: flex;
  gap: 0.625rem;
  justify-content: center;
  align-items: center;
}

.successBtn {
  height: 44px;
  padding: 0 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 10px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  text-decoration: none;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.successBtn.outline {
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.successBtn.outline:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.25);
}

@keyframes successSlideIn {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}
```

- [ ] **Step 2: 커밋**

```bash
git add x402-quests/src/quests/BlockBuilderQuest.module.css
git commit -m "feat(quests): add BlockBuilderQuest CSS module"
```

---

## Task 2: BlockBuilderQuest 컴포넌트 생성

**Files:**
- Create: `x402-quests/src/quests/BlockBuilderQuest.tsx`

- [ ] **Step 1: 컴포넌트 파일 생성**

`x402-quests/src/quests/BlockBuilderQuest.tsx` 를 아래 내용으로 생성한다.

```tsx
import { useState, useRef, useEffect } from 'react';
import type { QuestData } from '../types';
import { submitAnswer } from '../api';
import styles from './BlockBuilderQuest.module.css';

// ── Types ────────────────────────────────────────────────
interface Block {
  id: number;
  x: number;
  y: number;
  hash: string;
  prevHash: string;
  isGenesis: boolean;
  realData: { height: number; txCount: number };
}

interface BlockLink {
  from: number;
  to: number;
}

interface DragLine {
  fromId: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

type GameState = 'playing' | 'won';
type TrainPhase = 'idle' | 'arranging' | 'attaching' | 'starting' | 'scrolling' | 'done';

interface Props {
  quest: QuestData;
}

// ── Helpers ──────────────────────────────────────────────
const shortenHash = (hash: string): string =>
  hash ? hash.slice(0, 6) + '...' + hash.slice(-4) : '';

const generateMockHash = (height: number): string => {
  const chars = '0123456789abcdef';
  let hash = '';
  let seed = height * 12345 + 67890;
  for (let i = 0; i < 64; i++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    hash += chars[seed % 16];
  }
  return hash;
};

const easeInOutQuart = (t: number): number =>
  t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;

const MOCK_TARGET_HEIGHT = 800;
const TX_COUNTS = [5, 8, 3, 12];

// ── Component ────────────────────────────────────────────
export default function BlockBuilderQuest({ quest }: Props) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [links, setLinks] = useState<BlockLink[]>([]);
  const [gameState, setGameState] = useState<GameState>('playing');
  const [dragLine, setDragLine] = useState<DragLine | null>(null);
  const [showArrows, setShowArrows] = useState(true);
  const [invalidLink, setInvalidLink] = useState<{ from: number; to: number } | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const [trainPhase, setTrainPhase] = useState<TrainPhase>('idle');
  const [trainOffset, setTrainOffset] = useState(0);
  const [blurAmount, setBlurAmount] = useState(0);
  const [showExitButton, setShowExitButton] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [latestBlockHeight, setLatestBlockHeight] = useState<number | null>(null);
  const [hoveredBlock, setHoveredBlock] = useState<number | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [helpHovered, setHelpHovered] = useState(false);

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const blockRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const trainAnimRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ id: number; offsetX: number; offsetY: number } | null>(null);

  useEffect(() => {
    initializeMockBlocks();
    return () => {
      if (trainAnimRef.current) cancelAnimationFrame(trainAnimRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeMockBlocks = () => {
    const gameAreaWidth = gameAreaRef.current?.offsetWidth ?? 1200;
    const gameAreaHeight = gameAreaRef.current?.offsetHeight ?? 500;
    const centerX = gameAreaWidth / 2 - 110;
    const centerY = gameAreaHeight / 2 - 70;

    const positions = [
      { x: centerX - 200, y: centerY - 80 },
      { x: centerX + 150, y: centerY - 60 },
      { x: centerX - 150, y: centerY + 80 },
      { x: centerX + 200, y: centerY + 60 },
    ];
    const shuffled = [...positions].sort(() => Math.random() - 0.5);

    setBlocks(
      [0, 1, 2, 3].map((h, idx) => ({
        id: h,
        x: shuffled[idx].x,
        y: shuffled[idx].y,
        hash: generateMockHash(h),
        prevHash: h === 0 ? '0'.repeat(64) : generateMockHash(h - 1),
        isGenesis: h === 0,
        realData: { height: h, txCount: TX_COUNTS[h] },
      }))
    );
  };

  const initializeGame = () => {
    if (trainAnimRef.current) cancelAnimationFrame(trainAnimRef.current);
    setLinks([]);
    setGameState('playing');
    setShowArrows(true);
    setHintLevel(0);
    setTrainPhase('idle');
    setTrainOffset(0);
    setShowExitButton(false);
    setSubmitted(false);
    setLatestBlockHeight(null);
    initializeMockBlocks();
  };

  // ── Block drag ───────────────────────────────────────────
  const handleBlockMouseDown = (e: React.MouseEvent, id: number) => {
    if ((e.target as HTMLElement).classList.contains(styles.socket)) return;
    const block = blocks.find(b => b.id === id);
    if (!block) return;
    isDraggingRef.current = true;
    dragStartRef.current = { id, offsetX: e.clientX - block.x, offsetY: e.clientY - block.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = gameAreaRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDraggingRef.current && dragStartRef.current) {
      const { id, offsetX, offsetY } = dragStartRef.current;
      setBlocks(prev =>
        prev.map(b => b.id === id ? { ...b, x: e.clientX - offsetX, y: e.clientY - offsetY } : b)
      );
    } else if (dragLine) {
      setDragLine(prev => prev ? { ...prev, endX: x, endY: y } : null);
    }
  };

  const handleMouseUp = (e?: React.MouseEvent, id?: number, type?: 'input' | 'output') => {
    isDraggingRef.current = false;
    dragStartRef.current = null;

    if (dragLine) {
      if (id !== undefined && type === 'input' && dragLine.fromId !== id) {
        const fromBlock = blocks.find(b => b.id === dragLine.fromId);
        const toBlock = blocks.find(b => b.id === id);
        if (fromBlock && toBlock && fromBlock.hash === toBlock.prevHash) {
          const newLinks = [...links, { from: dragLine.fromId, to: id }];
          setLinks(newLinks);
          checkWinCondition(newLinks);
        } else {
          setInvalidLink({ from: dragLine.fromId, to: id });
          setTimeout(() => {
            setInvalidLink(null);
            setHintLevel(prev => Math.min(prev + 1, 2));
            setShowHint(true);
            setTimeout(() => setShowHint(false), 4000);
          }, 800);
        }
      }
      setDragLine(null);
    }
  };

  // ── Socket drag ──────────────────────────────────────────
  const handleSocketMouseDown = (e: React.MouseEvent, id: number, type: 'input' | 'output') => {
    e.stopPropagation();
    if (type !== 'output') return;
    const rect = gameAreaRef.current!.getBoundingClientRect();
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;
    setDragLine({ fromId: id, startX, startY, endX: startX, endY: startY });
  };

  // ── Win condition ────────────────────────────────────────
  const checkWinCondition = (currentLinks: BlockLink[]) => {
    if (currentLinks.length < blocks.length - 1) return;
    setGameState('won');
    setTimeout(() => {
      setShowArrows(false);
      arrangeBlocksInOrder();
    }, 1000);
  };

  // ── Socket position helper ───────────────────────────────
  const getSocketPos = (blockId: number, type: 'input' | 'output') => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return { x: 0, y: 0 };
    const blockEl = blockRefs.current[blockId];
    const blockHeight = blockEl?.offsetHeight ?? 140;
    return {
      x: type === 'input' ? block.x - 10 : block.x + 220 + 10,
      y: block.y + blockHeight / 2,
    };
  };

  // ── Arrange blocks in chain order ────────────────────────
  const arrangeBlocksInOrder = () => {
    const spacing = 240;
    const startX = 50;
    const gameAreaHeight = gameAreaRef.current?.offsetHeight ?? 500;
    const centerY = (gameAreaHeight - 140) / 2;

    const sorted = [...blocks].sort((a, b) => a.realData.height - b.realData.height);
    const targetPositions: Record<number, { x: number; y: number }> = {};
    sorted.forEach((block, idx) => {
      targetPositions[block.id] = { x: startX + idx * spacing, y: centerY };
    });

    blocks.forEach(block => {
      const el = blockRefs.current[block.id];
      if (el) {
        el.style.transition = 'left 0.6s cubic-bezier(0.33, 1, 0.68, 1), top 0.6s cubic-bezier(0.33, 1, 0.68, 1)';
        el.style.left = `${targetPositions[block.id].x}px`;
        el.style.top = `${targetPositions[block.id].y}px`;
      }
    });

    setTimeout(() => {
      blocks.forEach(block => {
        const el = blockRefs.current[block.id];
        if (el) el.style.transition = '';
      });
      setBlocks(prev => prev.map(b => ({ ...b, ...targetPositions[b.id] })));
      setTrainPhase('arranging');
      setTimeout(() => {
        setTrainPhase('attaching');
        setTimeout(() => startTrainAnimation(), 1000);
      }, 1000);
    }, 650);
  };

  // ── Train animation (mock) ───────────────────────────────
  const startTrainAnimation = () => {
    const targetHeight = MOCK_TARGET_HEIGHT;
    setTrainPhase('starting');
    setTrainOffset(0);
    setBlurAmount(0);

    setTimeout(() => {
      setTrainPhase('scrolling');
      const spacing = 240;
      const gameAreaWidth = gameAreaRef.current?.offsetWidth ?? 1200;
      const finalOffset = (50 + targetHeight * spacing) - (gameAreaWidth / 2 - 110);

      const startTime = performance.now();
      const duration = 4000;

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(1, elapsed / duration);
        const easedProgress = easeInOutQuart(progress);

        const t = progress;
        const speedFactor = t < 0.5 ? 16 * t * t * t : 16 * Math.pow(1 - t, 3);
        const blur = Math.min(5, Math.max(0, (speedFactor * (finalOffset / 300) - 15) / 10));

        setBlurAmount(blur);
        setTrainOffset(easedProgress * finalOffset);

        if (progress < 1) {
          trainAnimRef.current = requestAnimationFrame(animate);
        } else {
          setTrainPhase('done');
          setBlurAmount(0);
          setLatestBlockHeight(targetHeight);
          if (!submitted) {
            setSubmitted(true);
            submitAnswer(quest.productId, quest.step, quest.walletAddress, { participation: true })
              .catch(console.error);
          }
          setTimeout(() => setShowExitButton(true), 500);
        }
      };

      trainAnimRef.current = requestAnimationFrame(animate);
    }, 1000);
  };

  // ── Render ───────────────────────────────────────────────
  return (
    <div className={styles.container}>
      <div
        className={styles.gameArea}
        ref={gameAreaRef}
        onMouseMove={handleMouseMove}
        onMouseUp={() => handleMouseUp()}
      >
        {/* Help button */}
        {gameState === 'playing' && (
          <div
            className={styles.helpButton}
            onMouseEnter={() => setHelpHovered(true)}
            onMouseLeave={() => setHelpHovered(false)}
          >
            ?
            {helpHovered && (
              <div className={styles.helpTooltip}>
                <div className={styles.helpTooltipTitle}>힌트</div>
                <ul className={styles.helpTooltipList}>
                  <li>오른쪽 소켓을 드래그해 다른 블록의 왼쪽 소켓에 연결하세요</li>
                  <li>블록 위에 마우스를 올려 해시를 확인하세요</li>
                  <li>prevHash가 이전 블록의 hash와 같아야 연결됩니다</li>
                </ul>
              </div>
            )}
          </div>
        )}

        <div className={styles.blocksClip}>
          {/* SVG connection lines */}
          <svg className={styles.svgLayer}>
            <defs>
              <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,6 L6,3 z" fill="#4ade80" />
              </marker>
              <marker id="arrowWhite" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,6 L6,3 z" fill="#fff" />
              </marker>
              <marker id="arrowRed" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,6 L6,3 z" fill="#ef4444" />
              </marker>
            </defs>

            {showArrows && links.map((link, i) => {
              const start = getSocketPos(link.from, 'output');
              const end = getSocketPos(link.to, 'input');
              const yDiff = Math.abs(end.y - start.y);
              const xDiff = end.x - start.x;
              if (yDiff > 30 && xDiff > 50) {
                const midX = start.x + xDiff / 2;
                return (
                  <path key={i}
                    d={`M ${start.x} ${start.y} H ${midX} V ${end.y} H ${end.x}`}
                    stroke="#4ade80" strokeWidth="2" fill="none"
                    strokeLinecap="round" strokeLinejoin="round" markerEnd="url(#arrow)"
                  />
                );
              }
              return (
                <line key={i}
                  x1={start.x} y1={start.y} x2={end.x} y2={end.y}
                  stroke="#4ade80" strokeWidth="2" strokeLinecap="round" markerEnd="url(#arrow)"
                />
              );
            })}

            {dragLine && (
              <line
                x1={dragLine.startX} y1={dragLine.startY}
                x2={dragLine.endX} y2={dragLine.endY}
                stroke="rgba(255,255,255,0.6)" strokeWidth="2"
                strokeDasharray="4,4" strokeLinecap="round" markerEnd="url(#arrowWhite)"
              />
            )}

            {invalidLink && (() => {
              const start = getSocketPos(invalidLink.from, 'output');
              const end = getSocketPos(invalidLink.to, 'input');
              return (
                <line
                  x1={start.x} y1={start.y} x2={end.x} y2={end.y}
                  stroke="#ef4444" strokeWidth="3" strokeLinecap="round"
                  markerEnd="url(#arrowRed)" className={styles.invalidLine}
                />
              );
            })()}
          </svg>

          {/* Initial 4 blocks */}
          {blocks.map(block => {
            const showId = gameState === 'won';
            return (
              <div
                key={block.id}
                ref={(el: HTMLDivElement | null) => { blockRefs.current[block.id] = el; }}
                className={[
                  styles.blockCard,
                  block.isGenesis ? styles.genesisBlock : '',
                  links.some(l => l.to === block.id || l.from === block.id) ? styles.connected : '',
                  gameState === 'won' ? styles.arranging : '',
                  trainPhase === 'scrolling' ? styles.scrolling : '',
                ].join(' ')}
                style={{
                  left: gameState === 'won' ? block.x - trainOffset : block.x,
                  top: block.y,
                  cursor: 'grab',
                  filter: blurAmount > 1 ? `blur(${blurAmount}px)` : 'none',
                  opacity: blurAmount > 3 ? Math.max(0.5, 1 - (blurAmount - 3) / 10) : 1,
                }}
                onMouseDown={e => handleBlockMouseDown(e, block.id)}
                onMouseEnter={() => { setHoveredBlock(block.id); setShowTooltip(true); }}
                onMouseLeave={() => { setHoveredBlock(null); setShowTooltip(false); }}
              >
                <div className={styles.blockHeader}>
                  <span>{showId ? `블록 #${block.realData.height}` : '??? 블록'}</span>
                </div>
                <div className={styles.hashRow}>
                  <span>prevHash</span>
                  <div className={styles.hashValue}>{shortenHash(block.prevHash)}</div>
                </div>
                <div className={styles.hashRow}>
                  <span>hash</span>
                  <div className={styles.hashValue}>{shortenHash(block.hash)}</div>
                </div>
                {!block.isGenesis && (
                  <div
                    className={`${styles.socket} ${styles.input}`}
                    onMouseDown={e => e.stopPropagation()}
                    onMouseUp={e => handleMouseUp(e, block.id, 'input')}
                    onMouseEnter={() => { setHoveredBlock(null); setShowTooltip(false); }}
                  />
                )}
                <div
                  className={`${styles.socket} ${styles.output}`}
                  onMouseDown={e => handleSocketMouseDown(e, block.id, 'output')}
                  onMouseEnter={() => { setHoveredBlock(null); setShowTooltip(false); }}
                />
              </div>
            );
          })}

          {/* Train: mock blocks heights 4..MOCK_TARGET_HEIGHT */}
          {trainPhase !== 'idle' && trainPhase !== 'arranging' && (() => {
            const spacing = 240;
            const startX = 50;
            const gameAreaHeight = gameAreaRef.current?.offsetHeight ?? 500;
            const gameAreaWidth = gameAreaRef.current?.offsetWidth ?? 1200;
            const centerY = (gameAreaHeight - 140) / 2;

            const renderStart = trainPhase === 'attaching'
              ? 4
              : Math.max(4, Math.floor((trainOffset - 400 - startX) / spacing));
            const renderEnd = trainPhase === 'attaching'
              ? 8
              : Math.min(MOCK_TARGET_HEIGHT, Math.ceil((trainOffset + gameAreaWidth + 500 - startX) / spacing));

            const rendered = [];

            for (let h = renderStart; h <= renderEnd; h++) {
              const adjustedX = startX + h * spacing - trainOffset;
              const prevHash = h === 4
                ? (blocks.find(b => b.realData.height === 3)?.hash ?? generateMockHash(3))
                : generateMockHash(h - 1);
              const isLatest = trainPhase === 'done' && h === (latestBlockHeight ?? MOCK_TARGET_HEIGHT);
              const isFinal = h > MOCK_TARGET_HEIGHT - 3;

              rendered.push(
                <div
                  key={`mock-${h}`}
                  className={[
                    styles.blockCard,
                    isFinal ? styles.finalBlock : styles.trainBlock,
                    trainPhase === 'attaching' ? styles.attachingBlock : '',
                    trainPhase === 'scrolling' ? styles.scrolling : '',
                    isLatest ? styles.latestBlock : '',
                  ].join(' ')}
                  style={{
                    left: adjustedX,
                    top: centerY,
                    filter: blurAmount > 1 ? `blur(${blurAmount}px)` : 'none',
                    opacity: blurAmount > 3 ? Math.max(0.5, 1 - (blurAmount - 3) / 10) : 1,
                    cursor: 'default',
                  }}
                >
                  {isLatest && <div className={styles.latestBlockLabel}>최신 블록</div>}
                  <div className={styles.blockHeader}><span>블록 #{h}</span></div>
                  <div className={styles.hashRow}>
                    <span>prevHash</span>
                    <div className={styles.hashValue}>{shortenHash(prevHash)}</div>
                  </div>
                  <div className={styles.hashRow}>
                    <span>hash</span>
                    <div className={styles.hashValue}>{shortenHash(generateMockHash(h))}</div>
                  </div>
                  <div className={`${styles.socket} ${styles.input}`} />
                  <div className={`${styles.socket} ${styles.output}`} />
                </div>
              );
            }

            if (trainPhase === 'done') {
              const pendingH = (latestBlockHeight ?? MOCK_TARGET_HEIGHT) + 1;
              const pendingX = startX + pendingH * spacing - trainOffset;
              rendered.push(
                <div
                  key="pending"
                  className={styles.pendingBlock}
                  style={{ left: pendingX, top: centerY }}
                >
                  <div className={styles.pendingBlockLabel}>생성 중...</div>
                  <div className={styles.blockHeader}><span>블록 #{pendingH}</span></div>
                  <div className={styles.hashRow}>
                    <span>prevHash</span>
                    <div className={styles.hashValue}>{shortenHash(generateMockHash(pendingH - 1))}</div>
                  </div>
                  <div className={styles.hashRow}>
                    <span>hash</span>
                    <div className={styles.hashValuePending}>???</div>
                  </div>
                  <div className={`${styles.socket} ${styles.input}`} />
                  <div className={`${styles.socket} ${styles.output} ${styles.pendingSocket}`} />
                </div>
              );
            }

            return rendered;
          })()}
        </div>

        {/* Tooltip layer (above clip boundary) */}
        {showTooltip && hoveredBlock !== null && (() => {
          const block = blocks.find(b => b.id === hoveredBlock);
          if (!block) return null;
          const blockEl = blockRefs.current[block.id];
          const blockHeight = blockEl?.offsetHeight ?? 140;
          const displayX = gameState === 'won' ? block.x - trainOffset : block.x;
          const centerX = displayX + 110;
          const gameAreaH = gameAreaRef.current?.offsetHeight ?? 500;
          const showBelow = block.y < 200 && (gameAreaH - block.y - blockHeight) > block.y;

          return (
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 100000 }}>
              <div
                className={showBelow ? styles.blockTooltipBelow : styles.blockTooltip}
                style={{ left: centerX, top: showBelow ? block.y + blockHeight : block.y, position: 'absolute' }}
              >
                <div className={styles.tooltipTitle}>블록 정보</div>
                <div className={styles.tooltipRow}>
                  <span>높이:</span><span>#{block.realData.height}</span>
                </div>
                <div className={styles.tooltipDivider} />
                <div className={styles.tooltipRow}>
                  <span>hash:</span>
                  <span className={styles.tooltipHash}>{shortenHash(block.hash)}</span>
                </div>
                <div className={styles.tooltipRow}>
                  <span>prevHash:</span>
                  <span className={styles.tooltipHash}>{shortenHash(block.prevHash)}</span>
                </div>
                <div className={styles.tooltipDivider} />
                <div className={styles.tooltipRow}>
                  <span>트랜잭션:</span><span>{block.realData.txCount} txs</span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Success overlay */}
        {showExitButton && (
          <div className={styles.successOverlay}>
            <div className={styles.successCard}>
              <div className={styles.successIcon}>✓</div>
              <h2 className={styles.successTitle}>체인 완성!</h2>
              <p className={styles.successDesc}>블록들을 올바른 순서로 연결했습니다.</p>
              <p className={styles.successDesc2}>
                각 블록은 이전 블록의 해시를 담아{' '}
                <span className={styles.highlightChain}>"체인"</span>을 이룹니다.{' '}
                이것이 <span className={styles.highlightBlockchain}>"블록체인"</span>입니다.
              </p>
              <div className={styles.successButtons}>
                <button className={`${styles.successBtn} ${styles.outline}`} onClick={initializeGame}>
                  다시 하기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hint toast */}
      {showHint && (
        <div className={styles.hintContainer}>
          <div className={styles.hintMessage}>
            <span className={styles.hintIcon}>💡</span>
            <span>
              {hintLevel === 1
                ? '블록 위에 마우스를 올려 해시를 확인해보세요'
                : 'prevHash가 다른 블록의 hash와 같은지 비교해보세요'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 타입 체크**

```bash
cd x402-quests && npx tsc --noEmit
```

Expected: 에러 없음

- [ ] **Step 3: 커밋**

```bash
git add x402-quests/src/quests/BlockBuilderQuest.tsx
git commit -m "feat(quests): add BlockBuilderQuest component"
```

---

## Task 3: QuestPage 연결

**Files:**
- Modify: `x402-quests/src/pages/QuestPage.tsx`

- [ ] **Step 1: import 추가 및 drag-drop 분기 교체**

`x402-quests/src/pages/QuestPage.tsx` 에서:

1. 파일 상단 import 목록에 추가:
```tsx
import BlockBuilderQuest from '../quests/BlockBuilderQuest';
```

2. 아래 블록을 교체:
```tsx
// 기존
{quest.questType === 'drag-drop' && (
  <div className="text-slate-500 text-center p-8">이 퀘스트는 준비 중입니다.</div>
)}

// 변경
{quest.questType === 'drag-drop' && <BlockBuilderQuest {...props} />}
```

- [ ] **Step 2: 타입 체크**

```bash
cd x402-quests && npx tsc --noEmit
```

Expected: 에러 없음

- [ ] **Step 3: 커밋**

```bash
git add x402-quests/src/pages/QuestPage.tsx
git commit -m "feat(quests): wire BlockBuilderQuest to drag-drop questType"
```

---

## Task 4: 브라우저 검증

- [ ] **Step 1: 개발 서버 실행**

```bash
cd x402-quests && npm run dev
```

- [ ] **Step 2: 골든 패스 검증**

브라우저에서 `drag-drop` questType URL로 접근해 다음을 확인한다:

1. 4개 블록이 게임 영역에 랜덤 배치됨
2. 블록을 드래그해 이동할 수 있음
3. 오른쪽 소켓에서 드래그해 왼쪽 소켓으로 연결 시도 가능
4. 올바른 연결(hash → prevHash 일치) 시 초록 화살표 표시
5. 잘못된 연결 시 빨간 선 + 힌트 토스트 표시
6. 3개 연결 완료 시 블록이 줄 서고 기차 애니메이션 시작
7. ~5초 후 블록 #800까지 스크롤 후 `최신 블록` 금색 블록 표시
8. 성공 오버레이 표시

- [ ] **Step 3: ? 버튼 검증**

게임 중 우상단 `?` 버튼 호버 시 힌트 툴팁 3개 표시됨 확인

- [ ] **Step 4: 다시하기 검증**

성공 오버레이의 `다시 하기` 버튼 클릭 시 게임이 초기화됨 확인
