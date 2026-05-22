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
  const [latestBlockHeight, setLatestBlockHeight] = useState<number | null>(null);
  const [hoveredBlock, setHoveredBlock] = useState<number | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [helpHovered, setHelpHovered] = useState(false);

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const blockRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const trainAnimRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ id: number; offsetX: number; offsetY: number } | null>(null);
  const submittedRef = useRef(false);

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
    submittedRef.current = false;
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
    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (!rect) return;
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
        const alreadyLinked = links.some(l => l.from === dragLine.fromId && l.to === id);
        if (!alreadyLinked && fromBlock && toBlock && fromBlock.hash === toBlock.prevHash) {
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
    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (!rect) return;
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;
    setDragLine({ fromId: id, startX, startY, endX: startX, endY: startY });
  };

  // ── Win condition ────────────────────────────────────────
  const checkWinCondition = (currentLinks: BlockLink[]) => {
    if (gameState !== 'playing' || currentLinks.length < 3) return;
    setGameState('won');
    setShowTooltip(false);
    setHoveredBlock(null);
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
          if (!submittedRef.current) {
            submittedRef.current = true;
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
                  <path key={`${link.from}-${link.to}`}
                    d={`M ${start.x} ${start.y} H ${midX} V ${end.y} H ${end.x}`}
                    stroke="#4ade80" strokeWidth="2" fill="none"
                    strokeLinecap="round" strokeLinejoin="round" markerEnd="url(#arrow)"
                  />
                );
              }
              return (
                <line key={`${link.from}-${link.to}`}
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
          {(() => {
            return blocks.map(block => (
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
                  <span>블록 #{block.realData.height}</span>
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
            ));
          })()}

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
