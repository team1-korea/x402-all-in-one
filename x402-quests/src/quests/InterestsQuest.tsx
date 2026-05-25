import { useState, useEffect, useRef } from 'react';
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
  const [interestMap, setInterestMap] = useState<Record<string, string>>({});
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmEnabled, setConfirmEnabled] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/v1/dashboard/stats`)
      .then(r => r.json())
      .then((data: { users: DashboardUser[] }) => {
        const others = data.users.filter(u => u.walletAddress !== quest.walletAddress);
        setParticipants(others);
      })
      .catch(() => setFetchError(true));
  }, [quest.walletAddress]);

  const filledCount = Object.values(interestMap).filter(v => v.trim().length > 0).length;
  const canSubmit = filledCount >= 3 && !loading && !result?.correct;

  const handleSubmitClick = () => {
    if (!canSubmit) return;
    setShowConfirm(true);
    setConfirmEnabled(false);
    timerRef.current = setTimeout(() => setConfirmEnabled(true), 3000);
  };

  const handleConfirm = async () => {
    if (!confirmEnabled || loading) return;
    setShowConfirm(false);
    setLoading(true);
    const interests = Object.entries(interestMap)
      .filter(([, v]) => v.trim())
      .map(([nickname, interest]) => ({ nickname, interest: interest.trim() }));
    const res = await submitAnswer(quest.productId, quest.step, quest.walletAddress, { interests });
    setResult(res);
    setLoading(false);
  };

  const handleCancel = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setShowConfirm(false);
    setConfirmEnabled(false);
  };

  return (
    <div className="max-w-lg w-full mx-auto px-4 py-12">
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <span className="text-xs text-yellow-400 uppercase tracking-widest">Quest {quest.step} · 네트워킹</span>
        <h1 className="text-xl font-bold mt-2 mb-1">{quest.name}</h1>
        <p className="text-slate-400 text-sm mb-6">
          참가자와 직접 대화를 나누고, 3명 이상의 관심사를 입력하세요.
        </p>

        {fetchError && (
          <p className="text-red-400 text-sm mb-4">참가자 목록을 불러오지 못했습니다.</p>
        )}

        {!fetchError && participants.length === 0 && (
          <p className="text-slate-500 text-sm animate-pulse mb-4">참가자 목록 로딩 중...</p>
        )}

        <div className="space-y-3 mb-5">
          {participants.map(u => (
            <div key={u.walletAddress} className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-300 w-20 shrink-0 truncate">{u.nickname}</span>
              <input
                type="text"
                placeholder="관심사를 입력하세요"
                disabled={!!result?.correct}
                value={interestMap[u.nickname] || ''}
                onChange={e => setInterestMap(prev => ({ ...prev, [u.nickname]: e.target.value }))}
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500 disabled:opacity-50"
              />
            </div>
          ))}
        </div>

        <p className="text-xs text-slate-500 mb-4">
          {filledCount}/3명 이상 입력
          {filledCount < 3 ? ` · ${3 - filledCount}명 더 필요합니다` : ' · 제출 가능!'}
        </p>

        {!result && (
          <button
            onClick={handleSubmitClick}
            disabled={!canSubmit}
            className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
          >
            {loading ? '제출 중...' : `${filledCount}명 입력 완료 — 제출`}
          </button>
        )}

        {result && <ResultDisplay correct={result.correct} message={result.message} />}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-yellow-600 rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h2 className="text-lg font-bold text-yellow-400 mb-3">잠깐!</h2>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              정말로 대화를 하고 오신건가요?<br />
              이후 사실확인이 안될 경우{' '}
              <span className="text-yellow-400 font-medium">상위 상품은 취소</span>될 수 있습니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleConfirm}
                disabled={!confirmEnabled}
                className="flex-1 py-2 bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
              >
                {confirmEnabled ? '네, 제출합니다' : '잠시만요...'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
