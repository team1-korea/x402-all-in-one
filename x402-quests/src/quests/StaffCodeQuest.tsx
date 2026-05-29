import { useState } from 'react';
import type { QuestData, AnswerResult } from '../types';
import { submitAnswer } from '../api';
import ResultDisplay from '../components/ResultDisplay';

interface Props { quest: QuestData }

export default function StaffCodeQuest({ quest }: Props) {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!code.trim() || loading || result?.correct) return;
    setLoading(true);
    const res = await submitAnswer(quest.productId, quest.step, quest.walletAddress, {
      secretCode: code.trim().toUpperCase(),
    });
    setResult(res);
    setLoading(false);
  };

  return (
    <div className="max-w-lg w-full mx-auto px-4 py-12">
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <span className="text-xs text-purple-400 uppercase tracking-widest">Quest {quest.step} · 네트워킹</span>
        <h1 className="text-xl font-bold mt-2 mb-2">{quest.name}</h1>
        <p className="text-slate-400 text-sm mb-6">
          행사장에서 스태프를 찾아 비밀코드를 받아오세요! 스태프에게 이 화면을 보여주며 물어보세요.
        </p>

        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="비밀코드 입력"
          maxLength={16}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-center text-2xl tracking-widest focus:outline-none focus:border-purple-500 uppercase"
          disabled={result?.correct}
        />

        {!result && (
          <button
            onClick={handleSubmit}
            disabled={!code.trim() || loading}
            className="mt-4 w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
          >
            {loading ? '확인 중...' : '제출'}
          </button>
        )}

        {result && <ResultDisplay correct={result.correct} message={result.message} />}
      </div>
    </div>
  );
}
