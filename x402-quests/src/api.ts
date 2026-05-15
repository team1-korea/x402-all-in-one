import type { QuestData, AnswerResult } from './types';

const API_BASE = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:4010';

export async function fetchQuest(uuid: string): Promise<QuestData> {
  const res = await fetch(`${API_BASE}/quest-api/${uuid}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || '퀘스트를 불러오지 못했습니다');
  }
  return res.json() as Promise<QuestData>;
}

export async function submitAnswer(
  productId: string,
  step: number,
  walletAddress: string,
  body: {
    answers?: number[];
    secretCode?: string;
    feedback?: { good: string; bad: string; next: string };
    interests?: string[];
    participation?: boolean;
  },
): Promise<AnswerResult> {
  const res = await fetch(`${API_BASE}/v1/quest/${productId}/${step}/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletAddress, ...body }),
  });
  return res.json() as Promise<AnswerResult>;
}
