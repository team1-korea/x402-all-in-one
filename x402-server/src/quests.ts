import type { Quest } from "./types.js";

const TONE1 = BigInt(1e18.toString());

export const PRODUCT_QUESTS: Record<string, Quest[]> = {
  "product-a": [
    {
      id: "quest-1",
      name: "퀘스트 1 — 드래그앤드롭",
      description: "드래그앤드롭 인터랙션",
      price: 0n,
      questType: "drag-drop",
    },
    {
      id: "quest-2",
      name: "퀘스트 2 — Claude 스킬",
      description: "Claude Code와 스킬 시스템을 알아보세요",
      price: TONE1,
      questType: "theory-ox",
      theory:
        "Claude는 Anthropic이 개발한 AI 어시스턴트입니다. Claude Code는 터미널에서 직접 AI와 협업할 수 있는 CLI 도구로, 파일 편집·테스트 실행·코드 작성을 도와줍니다. Superpowers 플러그인의 스킬(Skill) 시스템은 특정 작업을 위한 전문화된 지침을 제공하여 Claude가 더 효과적으로 협업하게 해줍니다.",
      question:
        "Claude Code CLI를 사용하면 터미널에서 직접 AI와 협업하여 파일 편집, 테스트 실행 등을 할 수 있습니다. (O/X)",
      choices: ["O", "X"],
      answerIndex: 0,
    },
    {
      id: "quest-3",
      name: "퀘스트 3 — x402 프로토콜",
      description: "HTTP 402와 온체인 결제",
      price: TONE1,
      questType: "theory-ox",
      theory:
        "x402는 HTTP 402 Payment Required 상태 코드를 활용한 온체인 결제 프로토콜입니다. AI 에이전트가 자율적으로 API 서비스 결제를 처리할 수 있게 해주며, EIP-3009 기반 서명으로 가스비 없이 토큰 전송을 승인합니다. 서버는 결제 요구사항을 402 응답으로 반환하고, 클라이언트는 X-PAYMENT 헤더에 결제 증명을 담아 재요청합니다.",
      question:
        "x402 프로토콜에서 서버는 결제가 필요한 리소스에 HTTP 402 상태 코드와 결제 요구사항을 반환합니다. (O/X)",
      choices: ["O", "X"],
      answerIndex: 0,
    },
    {
      id: "quest-4",
      name: "퀘스트 4 — 숨은 AVAX 찾기",
      description: "화면에서 숨겨진 AVAX 토큰을 클릭하세요",
      price: TONE1,
      questType: "find-click",
      webCode: "CLICK404",
    },
    {
      id: "quest-5",
      name: "퀘스트 5 — Anthropic & Claude",
      description: "Claude 모델 패밀리를 맞혀보세요",
      price: TONE1,
      questType: "theory-mc",
      theory:
        "Anthropic은 AI 안전 연구에 집중하는 회사로 Claude 모델 패밀리를 개발했습니다. Claude 4 시리즈는 Opus(가장 강력), Sonnet(균형), Haiku(빠름) 세 티어로 구성됩니다. Claude는 대화·코드 작성·분석·창작 등 다양한 작업에 활용됩니다.",
      question: "다음 중 Anthropic의 Claude 모델 시리즈가 아닌 것은?",
      choices: ["Claude Opus", "Claude Sonnet", "Claude Haiku", "Claude Gemini"],
      answerIndex: 3,
    },
    {
      id: "quest-6",
      name: "퀘스트 6 — 스태프를 찾아라",
      description: "스태프에게 비밀코드를 받아 입력하세요",
      price: TONE1,
      questType: "staff-code",
      staffCode: "AVAX402",
    },
    {
      id: "quest-7",
      name: "퀘스트 7 — Kite AI & 아발란체",
      description: "아발란체 생태계와 Kite AI",
      price: TONE1,
      questType: "theory-mc",
      theory:
        "아발란체(Avalanche)는 고성능 블록체인 플랫폼으로, L1(레이어1) 서브넷 기술을 통해 독립적인 블록체인을 쉽게 생성할 수 있습니다. Kite AI는 아발란체 위에 구축된 분산형 AI 플랫폼으로 독자적인 L1을 운영합니다. APIX L1은 아발란체 기반 테스트 체인으로 체인 ID 402를 사용합니다.",
      question: "아발란체 APIX L1 테스트넷의 체인 ID는 무엇인가요?",
      choices: ["1", "137", "402", "43114"],
      answerIndex: 2,
    },
    {
      id: "quest-8",
      name: "퀘스트 8 — 밋업 피드백",
      description: "오늘 밋업에 대한 피드백을 남겨주세요",
      price: TONE1,
      questType: "feedback",
    },
    {
      id: "quest-9",
      name: "퀘스트 9 — 3D 챌린지",
      description: "3D 공간에서 숨겨진 오브젝트를 찾으세요",
      price: TONE1,
      questType: "threejs",
      webCode: "3DAVAX",
    },
    {
      id: "quest-10",
      name: "퀘스트 10 — 관심사 모으기",
      description: "주변 참가자 3명의 관심사를 모아보세요",
      price: TONE1,
      questType: "interests",
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
