import { useState, useRef } from 'react';
import type { QuestData, AnswerResult } from '../types';
import { submitAnswer } from '../api';
import ResultDisplay from '../components/ResultDisplay';

interface Props { quest: QuestData }

const STEPS = [
  { label: 'GET /api/data 요청', sub: '클라이언트 → 서버 (결제 헤더 없음)' },
  { label: '402 Payment Required', sub: '서버 → 클라이언트 (결제 금액·수신자·네트워크 포함)' },
  { label: '지갑으로 결제 서명', sub: '클라이언트가 EVM 트랜잭션 생성 & 서명' },
  { label: 'X-PAYMENT 헤더로 재요청', sub: '클라이언트 → 서버 (서명된 결제 포함)' },
  { label: '서버가 온체인 결제 검증', sub: '서버가 블록체인에서 결제 유효성 확인' },
  { label: '200 OK + X-PAYMENT-RESPONSE', sub: '서버 → 클라이언트 (데이터 응답 + 결제 확인)' },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ThreeJsQuest({ quest }: Props) {
  const [order, setOrder] = useState<number[]>(() => shuffle([0, 1, 2, 3, 4, 5]));
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [loading, setLoading] = useState(false);
  const dragIndexRef = useRef<number | null>(null);

  const handleDragStart = (index: number) => {
    dragIndexRef.current = index;
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const from = dragIndexRef.current;
    if (from === null || from === index) return;
    setOrder(prev => {
      const next = [...prev];
      [next[from], next[index]] = [next[index], next[from]];
      return next;
    });
    dragIndexRef.current = index;
  };

  const handleDragEnd = () => {
    dragIndexRef.current = null;
  };

  const handleSubmit = async () => {
    if (loading || result?.correct) return;
    setLoading(true);
    try {
      const res = await submitAnswer(quest.productId, quest.step, quest.walletAddress, { order });
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg w-full mx-auto px-4 py-12">
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <span className="text-xs text-blue-400 uppercase tracking-widest">Quest {quest.step} · x402 프로토콜</span>
        <h1 className="text-xl font-bold mt-2 mb-1">{quest.name}</h1>
        <p className="text-slate-400 text-sm mb-6">
          x402 결제 프로토콜이 동작하는 순서를 드래그해서 맞춰보세요.
        </p>

        {!result?.correct && (
          <div className="flex flex-col gap-2 mb-6">
            {order.map((stepIdx, position) => (
              <div
                key={position}
                draggable
                onDragStart={() => handleDragStart(position)}
                onDragOver={e => handleDragOver(e, position)}
                onDragEnd={handleDragEnd}
                className="flex items-start gap-3 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 cursor-grab active:cursor-grabbing select-none"
              >
                <span className="text-gray-500 text-sm font-mono mt-0.5 w-4 shrink-0">{position + 1}</span>
                <div>
                  <p className="text-sm font-medium text-white">{STEPS[stepIdx].label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{STEPS[stepIdx].sub}</p>
                </div>
                <span className="ml-auto text-gray-600 text-sm shrink-0">⠿</span>
              </div>
            ))}
          </div>
        )}

        {!result?.correct && (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-semibold text-white transition-colors"
          >
            {loading ? '확인 중...' : '순서 제출 →'}
          </button>
        )}

        {result && <ResultDisplay correct={result.correct} message={result.message} />}

        {result && !result.correct && (
          <button
            onClick={() => { setResult(null); setOrder(shuffle([0, 1, 2, 3, 4, 5])); }}
            className="w-full mt-3 py-2 border border-gray-700 hover:border-gray-500 rounded-lg text-sm text-slate-400 hover:text-white transition-colors"
          >
            다시 시도
          </button>
        )}
      </div>
    </div>
  );
}
