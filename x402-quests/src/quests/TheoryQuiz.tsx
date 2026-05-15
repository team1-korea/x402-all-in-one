import { useState, useCallback } from 'react';
import type { QuestData, AnswerResult } from '../types';
import { submitAnswer } from '../api';
import Timer from '../components/Timer';
import ResultDisplay from '../components/ResultDisplay';

interface Props {
  quest: QuestData;
}

export default function TheoryQuiz({ quest }: Props) {
  const [quizUnlocked, setQuizUnlocked] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTimerComplete = useCallback(() => setQuizUnlocked(true), []);

  const handleSubmit = async () => {
    if (selected === null || loading || result?.correct) return;
    setLoading(true);
    const res = await submitAnswer(quest.productId, quest.step, quest.walletAddress, {
      answerIndex: selected,
    });
    setResult(res);
    setLoading(false);
  };

  const isOX = quest.questType === 'theory-ox';

  return (
    <div className="max-w-lg w-full mx-auto px-4 py-12">
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <span className="text-xs text-blue-400 uppercase tracking-widest">
          Quest {quest.step} · {isOX ? 'OX 퀴즈' : '객관식'}
        </span>
        <h1 className="text-xl font-bold mt-2 mb-4">{quest.name}</h1>

        <div className="bg-gray-800 rounded-lg p-4 text-sm text-slate-300 leading-relaxed">
          {quest.theory}
        </div>

        {!quizUnlocked && (
          <Timer seconds={10} onComplete={handleTimerComplete} />
        )}

        {quizUnlocked && (
          <div className="mt-6">
            <p className="font-medium mb-4 text-slate-200">{quest.question}</p>

            {isOX ? (
              <div className="flex gap-4">
                {['O', 'X'].map((label, i) => (
                  <button
                    key={label}
                    onClick={() => !result?.correct && setSelected(i)}
                    className={`flex-1 py-6 text-3xl font-bold rounded-xl border-2 transition-colors ${
                      selected === i
                        ? 'border-blue-500 bg-blue-950 text-blue-300'
                        : 'border-gray-700 hover:border-gray-500'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {quest.choices?.map((choice, i) => (
                  <button
                    key={i}
                    onClick={() => !result?.correct && setSelected(i)}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                      selected === i
                        ? 'border-blue-500 bg-blue-950 text-blue-300'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <span className="text-slate-500 mr-2">{String.fromCharCode(65 + i)}.</span>
                    {choice}
                  </button>
                ))}
              </div>
            )}

            {!result && (
              <button
                onClick={handleSubmit}
                disabled={selected === null || loading}
                className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
              >
                {loading ? '확인 중...' : '제출'}
              </button>
            )}

            {result && <ResultDisplay correct={result.correct} message={result.message} />}
          </div>
        )}
      </div>
    </div>
  );
}
