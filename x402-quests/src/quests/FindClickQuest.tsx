import { useState, useMemo } from 'react';
import type { QuestData, AnswerResult } from '../types';
import { submitAnswer } from '../api';
import ResultDisplay from '../components/ResultDisplay';

interface Props { quest: QuestData }

const TOKENS = ['ETH', 'BTC', 'SOL', 'MATIC', 'BNB', 'DOT', 'ADA', 'LINK', 'UNI', 'AAVE'];

function seededPosition(seed: number, i: number) {
  const x = ((seed * (i + 1) * 1234567) % 80) + 5;
  const y = ((seed * (i + 1) * 7654321) % 80) + 5;
  return { x, y };
}

export default function FindClickQuest({ quest }: Props) {
  const [found, setFound] = useState(false);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const seed = 42;
  const avaxPos = { x: 63, y: 47 };

  const decoys = useMemo(() =>
    Array.from({ length: 28 }, (_, i) => ({
      label: TOKENS[i % TOKENS.length],
      ...seededPosition(seed, i),
    })), []);

  const handleAvaxClick = async () => {
    if (loading || result?.correct) return;
    setFound(true);
    setLoading(true);
    const res = await submitAnswer(quest.productId, quest.step, quest.walletAddress, {
      secretCode: 'CLICK404',
    });
    setResult(res);
    setLoading(false);
  };

  const handleDecoyClick = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  return (
    <div className="max-w-lg w-full mx-auto px-4 py-12">
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <span className="text-xs text-orange-400 uppercase tracking-widest">Quest {quest.step} · 인터랙션</span>
        <h1 className="text-xl font-bold mt-2 mb-1">{quest.name}</h1>
        <p className="text-slate-400 text-sm mb-4">군중 속에 숨겨진 AVAX를 찾아 클릭하세요!</p>

        <div
          className={`relative w-full h-80 bg-gray-800 rounded-xl overflow-hidden border border-gray-700 ${shake ? 'animate-pulse' : ''}`}
        >
          {decoys.map((d, i) => (
            <button
              key={i}
              onClick={handleDecoyClick}
              className="absolute text-xs text-slate-500 hover:text-slate-400 transition-colors select-none"
              style={{ left: `${d.x}%`, top: `${d.y}%`, transform: 'translate(-50%,-50%)' }}
            >
              {d.label}
            </button>
          ))}

          {!found && (
            <button
              onClick={handleAvaxClick}
              className="absolute text-sm font-bold text-red-500/40 hover:text-red-400 transition-all duration-300 hover:scale-125 animate-spin select-none"
              style={{
                left: `${avaxPos.x}%`,
                top: `${avaxPos.y}%`,
                transform: 'translate(-50%,-50%)',
                animationDuration: '8s',
              }}
            >
              AVAX
            </button>
          )}

          {found && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800/80">
              <p className="text-green-400 text-lg font-bold">AVAX 발견! ✨</p>
            </div>
          )}
        </div>

        {result && <ResultDisplay correct={result.correct} message={result.message} />}
      </div>
    </div>
  );
}
