import { useState, KeyboardEvent } from 'react';
import type { QuestData, AnswerResult } from '../types';
import { submitAnswer } from '../api';
import ResultDisplay from '../components/ResultDisplay';

interface Props { quest: QuestData }

export default function InterestsQuest({ quest }: Props) {
  const [input, setInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [loading, setLoading] = useState(false);

  const addTag = () => {
    const val = input.trim();
    if (!val || tags.includes(val) || tags.length >= 10) return;
    setTags((prev) => [...prev, val]);
    setInput('');
  };

  const removeTag = (tag: string) => {
    if (result?.correct) return;
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = async () => {
    if (tags.length < 3 || loading || result?.correct) return;
    setLoading(true);
    const res = await submitAnswer(quest.productId, quest.step, quest.walletAddress, {
      interests: tags,
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
          주변 참가자 최소 3명과 대화하고 그들의 관심사를 입력하세요.<br />
          <span className="text-slate-500">Enter 또는 쉼표로 태그 추가</span>
        </p>

        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="관심사 입력 후 Enter"
            disabled={result?.correct || tags.length >= 10}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-500"
          />
          <button
            onClick={addTag}
            disabled={!input.trim() || result?.correct}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-700 rounded-lg text-sm transition-colors"
          >
            추가
          </button>
        </div>

        <div className="flex flex-wrap gap-2 min-h-10 mb-4">
          {tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 bg-yellow-900/50 border border-yellow-700 text-yellow-300 text-sm px-3 py-1 rounded-full"
            >
              {tag}
              {!result?.correct && (
                <button onClick={() => removeTag(tag)} className="text-yellow-500 hover:text-yellow-300 ml-1">×</button>
              )}
            </span>
          ))}
        </div>

        <p className="text-xs text-slate-500 mb-4">
          {tags.length}/3 명 이상 · {tags.length < 3 ? `${3 - tags.length}명 더 필요합니다` : '제출 가능!'}
        </p>

        {!result && (
          <button
            onClick={handleSubmit}
            disabled={tags.length < 3 || loading}
            className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
          >
            {loading ? '제출 중...' : `${tags.length}개 관심사 제출`}
          </button>
        )}

        {result && <ResultDisplay correct={result.correct} message={result.message} />}
      </div>
    </div>
  );
}
