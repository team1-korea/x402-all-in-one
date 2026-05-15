import { useState, useEffect, useCallback } from 'react';
import type { QuestData, AnswerResult } from '../types';
import { submitAnswer } from '../api';
import ResultDisplay from '../components/ResultDisplay';

interface Props {
  quest: QuestData;
}

const THEORY_WAIT_SEC = 30;

export default function TheoryQuiz({ quest }: Props) {
  const [quizUnlocked, setQuizUnlocked] = useState(false);
  const [selected, setSelected] = useState<(number | null)[]>([]);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [loading, setLoading] = useState(false);

  const questions = quest.questions ?? [];
  const isOX = quest.questType === 'theory-ox';

  useEffect(() => {
    const id = setTimeout(() => setQuizUnlocked(true), THEORY_WAIT_SEC * 1000);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (questions.length > 0) {
      setSelected(new Array(questions.length).fill(null));
    }
  }, [questions.length]);

  const pick = useCallback((qIdx: number, choiceIdx: number) => {
    if (result?.correct) return;
    setSelected((prev) => {
      const next = [...prev];
      next[qIdx] = choiceIdx;
      return next;
    });
  }, [result?.correct]);

  const allPicked = selected.length === questions.length && selected.every((s) => s !== null);

  const handleSubmit = async () => {
    if (!allPicked || loading || result?.correct) return;
    setLoading(true);
    const res = await submitAnswer(quest.productId, quest.step, quest.walletAddress, {
      answers: selected as number[],
    });
    setResult(res);
    setLoading(false);
  };

  return (
    <div className="max-w-lg w-full mx-auto px-4 py-12">
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <span className="text-xs text-blue-400 uppercase tracking-widest">
          Quest {quest.step} · {isOX ? 'OX 퀴즈' : '객관식'}
        </span>
        <h1 className="text-xl font-bold mt-2 mb-4">{quest.name}</h1>

        <div className="bg-gray-800 rounded-lg p-4 text-sm text-slate-300 leading-relaxed whitespace-pre-line">
          {quest.theory}
        </div>

        {!quizUnlocked && (
          <button
            disabled
            className="mt-6 w-full py-3 bg-gray-700 text-gray-400 cursor-not-allowed rounded-lg font-medium"
          >
            30초 이후에 열립니다
          </button>
        )}

        {quizUnlocked && (
          <div className="mt-6 space-y-6">
            {questions.map((q, qIdx) => (
              <div key={qIdx}>
                <p className="font-medium mb-3 text-slate-200">
                  {questions.length > 1 && (
                    <span className="text-blue-400 mr-2">Q{qIdx + 1}.</span>
                  )}
                  {q.question}
                </p>

                {isOX ? (
                  <div className="flex gap-4">
                    {q.choices.map((label, i) => (
                      <button
                        key={label}
                        onClick={() => pick(qIdx, i)}
                        className={`flex-1 py-6 text-3xl font-bold rounded-xl border-2 transition-colors ${
                          selected[qIdx] === i
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
                    {q.choices.map((choice, i) => (
                      <button
                        key={i}
                        onClick={() => pick(qIdx, i)}
                        className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                          selected[qIdx] === i
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
              </div>
            ))}

            {!result && (
              <button
                onClick={handleSubmit}
                disabled={!allPicked || loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
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
