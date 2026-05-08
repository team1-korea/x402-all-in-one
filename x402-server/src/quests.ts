import type { Quest } from "./types.js";

// 퀘스트 1: 무료 — x402 프로토콜 기초 개념
// 퀘스트 2: 0.01 TONE — Avalanche L1 지식
// 퀘스트 3: 0.01 TONE — Claude Skills 실전

const TONE = (n: number) => BigInt(Math.round(n * 1e18));

export const QUESTS: Quest[] = [
  {
    id: "quest-1",
    name: "퀘스트 1 — x402 첫 걸음",
    description: "x402 프로토콜의 핵심 HTTP 상태 코드를 맞춰보세요. 무료입니다.",
    price: 0n,
    question:
      "x402 프로토콜에서 '결제가 필요합니다'를 나타내는 HTTP 상태 코드는 무엇인가요?",
    choices: ["200", "402", "404", "500"],
    answerIndex: 1,
    reward: TONE(0.015),
  },
  {
    id: "quest-2",
    name: "퀘스트 2 — Avalanche L1",
    description: "이 이벤트가 돌아가는 Avalanche L1의 Chain ID를 맞춰보세요.",
    price: TONE(0.01),
    question:
      "이 빌더 밋업의 x402 서버가 올라간 Avalanche L1의 Chain ID는 무엇인가요?",
    choices: ["43114", "43113", "402", "1"],
    answerIndex: 2,
    reward: TONE(0.015),
  },
  {
    id: "quest-3",
    name: "퀘스트 3 — Claude Skills",
    description: "Claude Code의 스킬 시스템에 대한 마지막 문제입니다.",
    price: TONE(0.01),
    question:
      "Claude Code에서 사용자가 직접 호출할 수 있는 스킬을 정의하는 파일 확장자는 무엇인가요?",
    choices: [".json", ".yaml", ".md", ".txt"],
    answerIndex: 2,
    reward: TONE(0.02),
  },
];

export function getQuest(id: string): Quest | undefined {
  return QUESTS.find((q) => q.id === id);
}
