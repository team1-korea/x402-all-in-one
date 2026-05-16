import { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import type { QuestData, AnswerResult } from '../types';
import { submitAnswer } from '../api';
import ResultDisplay from '../components/ResultDisplay';

interface Props {
  quest: QuestData;
}

const THEORY_WAIT_SEC = 30;

export default function TheoryQuiz({ quest }: Props) {
  const [remaining, setRemaining] = useState(THEORY_WAIT_SEC);
  const [quizUnlocked, setQuizUnlocked] = useState(false);
  const [selected, setSelected] = useState<(number | null)[]>([]);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [loading, setLoading] = useState(false);

  const questions = quest.questions ?? [];
  const isOX = quest.questType === 'theory-ox';

  useEffect(() => {
    if (quizUnlocked) return;
    if (remaining <= 0) {
      setQuizUnlocked(true);
      return;
    }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(id);
  }, [remaining, quizUnlocked]);

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
    <div className="w-full max-w-3xl mx-auto px-6 py-10">
      <div className="bg-gray-900 rounded-xl p-8 border border-gray-800">
        <span className="text-xs text-blue-400 uppercase tracking-widest">
          Quest {quest.step} · {isOX ? 'OX 퀴즈' : '객관식'}
        </span>
        <h1 className="text-2xl font-bold mt-2 mb-6">{quest.name}</h1>

        <div className="bg-gray-800 rounded-lg p-6 mb-6
          prose prose-invert max-w-none
          [&_p]:text-slate-300 [&_p]:leading-8 [&_p]:my-6
          [&_strong]:text-white [&_strong]:font-semibold
          [&_li]:text-slate-300 [&_li]:leading-7 [&_li]:my-1
          [&_ol]:my-4 [&_ul]:my-4
          [&_code]:text-blue-300 [&_code]:bg-gray-900 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm
          [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
          <ReactMarkdown remarkPlugins={[remarkBreaks]}>{quest.theory ?? ''}</ReactMarkdown>
        </div>

        {!quizUnlocked && (
          <button
            disabled
            className="w-full py-3 bg-gray-700 text-gray-400 cursor-not-allowed rounded-lg font-medium"
          >
            {remaining}초 이후에 열립니다
          </button>
        )}

        {quizUnlocked && (
          <div className="space-y-6">
            {questions.map((q, qIdx) => (
              <div key={qIdx}>
                <div className="font-medium mb-3 text-slate-200 prose prose-invert prose-sm max-w-none">
                  {questions.length > 1 && (
                    <span className="text-blue-400 mr-2">Q{qIdx + 1}.</span>
                  )}
                  <ReactMarkdown>{q.question}</ReactMarkdown>
                </div>

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
                        <span className="prose prose-invert prose-sm inline [&>p]:inline">
                          <ReactMarkdown>{choice}</ReactMarkdown>
                        </span>
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
