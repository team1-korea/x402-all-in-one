import { useState } from 'react';
import type { QuestData, AnswerResult } from '../types';
import { submitAnswer } from '../api';
import ResultDisplay from '../components/ResultDisplay';

interface Props { quest: QuestData }

export default function FeedbackQuest({ quest }: Props) {
  const [good, setGood] = useState('');
  const [bad, setBad] = useState('');
  const [next, setNext] = useState('');
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit = good.trim() && bad.trim() && next.trim();

  const handleSubmit = async () => {
    if (!canSubmit || loading || result?.correct) return;
    setLoading(true);
    const res = await submitAnswer(quest.productId, quest.step, quest.walletAddress, {
      feedback: { good: good.trim(), bad: bad.trim(), next: next.trim() },
    });
    setResult(res);
    setLoading(false);
  };

  return (
    <div className="max-w-lg w-full mx-auto px-4 py-12">
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <span className="text-xs text-teal-400 uppercase tracking-widest">Quest {quest.step} · 피드백</span>
        <h1 className="text-xl font-bold mt-2 mb-1">{quest.name}</h1>
        <p className="text-slate-400 text-sm mb-6">오늘 밋업이 어떠셨나요? 솔직한 피드백을 남겨주세요 🙏</p>

        {[
          { label: '좋았던 점', value: good, setter: setGood, placeholder: '가장 좋았던 것은...' },
          { label: '아쉬웠던 점', value: bad, setter: setBad, placeholder: '개선하면 좋을 것은...' },
          { label: '다음엔 이걸!', value: next, setter: setNext, placeholder: '다음 밋업에서 경험하고 싶은 것은...' },
        ].map(({ label, value, setter, placeholder }) => (
          <div key={label} className="mb-4">
            <label className="text-xs text-slate-400 uppercase tracking-wider mb-1 block">{label}</label>
            <textarea
              value={value}
              onChange={(e) => setter(e.target.value)}
              placeholder={placeholder}
              rows={2}
              disabled={result?.correct}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500 resize-none"
            />
          </div>
        ))}

        {!result && (
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
            className="w-full py-3 bg-teal-600 hover:bg-teal-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
          >
            {loading ? '제출 중...' : '피드백 제출'}
          </button>
        )}

        {result && <ResultDisplay correct={result.correct} message={result.message} />}
      </div>
    </div>
  );
}
