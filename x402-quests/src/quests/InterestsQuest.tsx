import { useState, useEffect } from 'react';
import type { QuestData, AnswerResult } from '../types';
import { submitAnswer } from '../api';
import ResultDisplay from '../components/ResultDisplay';

interface Props { quest: QuestData }

const API_BASE = (import.meta.env.VITE_API_BASE as string) || 'https://x402.abcfe.net';

interface DashboardUser {
  nickname: string;
  walletAddress: string;
}

export default function InterestsQuest({ quest }: Props) {
  const [participants, setParticipants] = useState<DashboardUser[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/v1/dashboard/stats`)
      .then(r => r.json())
      .then((data: { users: DashboardUser[] }) => {
        const others = data.users.filter(
          u => u.walletAddress !== quest.walletAddress
        );
        setParticipants(others);
      })
      .catch(() => setFetchError(true));
  }, [quest.walletAddress]);

  const toggle = (nickname: string) => {
    if (result?.correct) return;
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(nickname)) next.delete(nickname);
      else next.add(nickname);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (selected.size < 3 || loading || result?.correct) return;
    setLoading(true);
    const res = await submitAnswer(quest.productId, quest.step, quest.walletAddress, {
      interests: Array.from(selected),
    });
    setResult(res);
    setLoading(false);
  };

  return (
    <div className="max-w-lg w-full mx-auto px-4 py-12">
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <span className="text-xs text-yellow-400 uppercase tracking-widest">Quest {quest.step} · 네트워킹</span>
        <h1 className="text-xl font-bold mt-2 mb-1">{quest.name}</h1>
        <p className="text-slate-400 text-sm mb-6">
          아래 참가자들과 직접 대화를 나누고, 대화한 사람을 3명 이상 선택하세요.
        </p>

        {fetchError && (
          <p className="text-red-400 text-sm mb-4">참가자 목록을 불러오지 못했습니다.</p>
        )}

        {!fetchError && participants.length === 0 && (
          <p className="text-slate-500 text-sm animate-pulse mb-4">참가자 목록 로딩 중...</p>
        )}

        <div className="flex flex-wrap gap-2 mb-5">
          {participants.map(u => {
            const isSelected = selected.has(u.nickname);
            return (
              <button
                key={u.walletAddress}
                onClick={() => toggle(u.nickname)}
                disabled={result?.correct}
                className={[
                  'px-4 py-2 rounded-full text-sm font-medium border transition-colors',
                  isSelected
                    ? 'bg-yellow-600 border-yellow-500 text-white'
                    : 'bg-gray-800 border-gray-700 text-slate-300 hover:border-yellow-600',
                ].join(' ')}
              >
                {u.nickname}
              </button>
            );
          })}
        </div>

        <p className="text-xs text-slate-500 mb-4">
          {selected.size}/3 명 이상 선택 · {selected.size < 3 ? `${3 - selected.size}명 더 필요합니다` : '제출 가능!'}
        </p>

        {!result && (
          <button
            onClick={handleSubmit}
            disabled={selected.size < 3 || loading}
            className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
          >
            {loading ? '제출 중...' : `${selected.size}명 선택 완료 — 제출`}
          </button>
        )}

        {result && <ResultDisplay correct={result.correct} message={result.message} />}
      </div>
    </div>
  );
}
