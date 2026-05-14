import type { Quest } from "./types.js";

const TONE1 = BigInt(1e18.toString());

export const PRODUCT_QUESTS: Record<string, Quest[]> = {
  "product-a": [
    {
      id: "quest-1",
      name: "퀘스트 1 — 무료 퀘스트",
      description: "이벤트에 참여하시겠습니까?",
      price: 0n,
      question: "이벤트에 참여하시겠습니까? (예/아니오)",
      choices: ["예", "아니오"],
      answerIndex: 0,
    },
    {
      id: "quest-2",
      name: "퀘스트 2 — 네트워킹형 (OX)",
      description: "Avalanche L1 지식 테스트",
      price: TONE1,
      question: "Avalanche L1(기존 서브넷)은 독립된 가상머신(VM)과 검증인 세트를 가질 수 있습니다. (O/X)",
      choices: ["O", "X"],
      answerIndex: 0,
    },
    {
      id: "quest-3",
      name: "퀘스트 3 — Avalanche 정보형 (OX)",
      description: "x402 프로토콜 지식 테스트",
      price: TONE1,
      question: "x402 프로토콜은 HTTP 402 Payment Required 상태 코드를 활용하여 온체인 결제와 컨텐츠 접근을 연동합니다. (O/X)",
      choices: ["O", "X"],
      answerIndex: 0,
    },
    {
      id: "quest-4",
      name: "퀘스트 4 — AI 활용형 (객관식)",
      description: "Claude 모델 지식 테스트",
      price: TONE1,
      question: "다음 중 Anthropic의 Claude 모델 시리즈가 아닌 것은?",
      choices: ["Claude 3 Opus", "Claude 3.5 Sonnet", "Claude 3 Haiku", "Claude 3.5 Pro"],
      answerIndex: 3,
    },
    {
      id: "quest-5",
      name: "퀘스트 5 — 네트워킹형 (OX)",
      description: "Claude System Prompt 지식 테스트",
      price: TONE1,
      question: "Claude의 System Prompt는 대화의 전반적인 규칙과 페르소나를 설정하는 데 사용됩니다. (O/X)",
      choices: ["O", "X"],
      answerIndex: 0,
    },
    {
      id: "quest-6",
      name: "퀘스트 6 — Avalanche 정보형 (OX)",
      description: "EIP-3009 지식 테스트",
      price: TONE1,
      question: "EIP-3009는 서명을 통해 가스비 없이 토큰 전송을 승인할 수 있는 표준입니다. (O/X)",
      choices: ["O", "X"],
      answerIndex: 0,
    },
    {
      id: "quest-7",
      name: "퀘스트 7 — AI 활용형 (객관식)",
      description: "AI Fluency 코스 지식 테스트",
      price: TONE1,
      question: "대규모 언어 모델(LLM)이 그럴듯하지만 사실이 아닌 정보를 생성하는 현상을 무엇이라 하나요?",
      choices: ["Hallucination (환각)", "Overfitting (과적합)", "Fine-tuning (미세조정)", "Prompt Injection"],
      answerIndex: 0,
    },
    {
      id: "quest-8",
      name: "퀘스트 8 — 네트워킹형 (OX)",
      description: "Claude Code 지식 테스트",
      price: TONE1,
      question: "Claude Code CLI는 터미널에서 직접 AI와 협업할 수 있는 도구입니다. (O/X)",
      choices: ["O", "X"],
      answerIndex: 0,
    },
    {
      id: "quest-9",
      name: "퀘스트 9 — Avalanche 정보형 (객관식)",
      description: "APIX L1 Testnet 지식 테스트",
      price: TONE1,
      question: "Avalanche APIX L1 Testnet의 체인 ID는 무엇인가요?",
      choices: ["1", "402", "43114", "137"],
      answerIndex: 1,
    },
    {
      id: "quest-10",
      name: "퀘스트 10 — 웹 연동형",
      description: "UUID URL로 웹 페이지를 방문하여 클리어 코드를 받으세요.",
      price: TONE1,
      question: "웹 페이지에서 받은 코드를 입력하세요.",
      choices: [],
      answerIndex: -1,
      isWebQuest: true,
    },
  ],
  "product-b": [],
};

export function getQuest(productId: string, step: string): Quest | undefined {
  const quests = PRODUCT_QUESTS[productId];
  return quests ? quests.find((q) => q.id === `quest-${step}`) : undefined;
}

export function getAllQuests(productId: string): Quest[] | undefined {
  return PRODUCT_QUESTS[productId];
}
