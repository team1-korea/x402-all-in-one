import type { Quest } from "./types.js";

// 10 USDC (6 decimals)
const USDC10 = BigInt(10 * 1_000_000);

export const PRODUCT_QUESTS: Record<string, Quest[]> = {
  "product-a": [
    {
      id: "quest-1",
      name: "퀘스트 1 — 드래그앤드롭",
      description: "드래그앤드롭 인터랙션",
      price: USDC10,
      questType: "drag-drop",
      difficulty: "very-easy",
      entryPoint: true,
    },
    {
      id: "quest-2",
      name: "퀘스트 2 — Claude 스킬",
      description: "Claude Code와 스킬 시스템을 알아보세요",
      price: USDC10,
      difficulty: "easy",
      questType: "theory-ox",
      theory: `Claude Code **스킬(Skill)**은 마크다운 파일(.md)로 작성된 전문화된 지침 묶음입니다. 파일은 크게 두 부분으로 구성됩니다.

**프론트매터(Frontmatter):** 스킬의 메타데이터입니다.
- \`name\` — 슬래시 커맨드로 직접 호출할 때 쓰는 식별자 (예: \`/x402-quest\`)
- \`description\` — 스킬이 어떤 역할을 하는지 설명
- \`triggers\` — 자동 트리거 기준 키워드 목록. Claude가 대화 중 이 키워드를 감지하면 스킬을 자동으로 로드합니다.

**본문(Body):** 스킬이 실제로 수행할 워크플로와 지침이 담깁니다. Claude는 스킬을 로드하면 이 본문의 지침을 따릅니다.`,
      questions: [
        {
          question:
            "Claude Code 스킬 파일에는 슬래시 커맨드 식별자(name), 자동 트리거 키워드(triggers), 실제 지침(본문)이 포함된다. (O/X)",
          choices: ["O", "X"],
          answerIndex: 0,
        },
        {
          question:
            "triggers를 설정하지 않은 스킬은 슬래시 커맨드로도 호출할 수 없다. (O/X)",
          choices: ["O", "X"],
          answerIndex: 1,
        },
      ],
    },
    {
      id: "quest-3",
      name: "퀘스트 3 — x402 프로토콜",
      description: "HTTP 402와 온체인 결제",
      price: USDC10,
      difficulty: "medium",
      questType: "theory-ox",
      theory: `x402는 HTTP 402 Payment Required 상태 코드를 기반으로 한 온체인 결제 프로토콜입니다. AI 에이전트가 유료 API 서비스를 자율적으로 이용할 수 있도록 설계되었습니다.

**동작 흐름:**
1. 클라이언트가 보호된 리소스를 요청합니다.
2. 서버는 HTTP **402** 응답과 함께 결제 요구사항(금액·토큰·수신 주소)을 반환합니다.
3. 클라이언트(또는 AI 에이전트)는 블록체인 서명을 생성하여 \`X-PAYMENT\` 헤더에 담아 재요청합니다.
4. 서버는 Facilitator(검증·정산 서비스)를 통해 서명을 검증한 뒤 리소스를 제공합니다.

**EIP-3009**는 서명만으로 토큰 전송을 승인하는 이더리움 표준입니다. 수신자가 대신 트랜잭션을 제출하는 구조이기 때문에, **송신자(AI 에이전트)는 가스비를 직접 낼 필요가 없습니다.** 서명 생성만으로 결제가 완료되므로 x402 프로토콜과 자연스럽게 결합됩니다.`,
      questions: [
        {
          question:
            "x402 프로토콜에서 서버는 결제가 필요한 리소스에 HTTP 402 상태 코드와 결제 요구사항을 반환한다. (O/X)",
          choices: ["O", "X"],
          answerIndex: 0,
        },
        {
          question:
            "EIP-3009 기반 x402 결제 시 송신자(AI 에이전트)는 반드시 가스비(ETH/AVAX)를 직접 지불해야 한다. (O/X)",
          choices: ["O", "X"],
          answerIndex: 1,
        },
      ],
    },
    {
      id: "quest-4",
      name: "퀘스트 4 — 합의를 방해하라",
      description: "아발란체 Slush 합의를 방해해보세요",
      price: USDC10,
      difficulty: "medium",
      questType: "snowman-sabotage",
    },
    {
      id: "quest-5",
      name: "퀘스트 5 — Anthropic & Claude",
      description: "Claude 모델 패밀리를 맞혀보세요",
      price: USDC10,
      difficulty: "easy",
      questType: "theory-mc",
      theory: `지금 이 퀘스트를 진행하는 데 도움을 주고 있는 AI, Claude. 과연 누가 만들었을까요?`,
      questions: [
        {
          question: "Claude를 만든 회사는?",
          choices: ["Anthropic", "삼성전자", "OpenAI", "배달의민족"],
          answerIndex: 0,
        },
      ],
    },
    {
      id: "quest-6",
      name: "퀘스트 6 — 스태프를 찾아라",
      description: "스태프에게 비밀코드를 받아 입력하세요",
      price: USDC10,
      difficulty: "easy",
      questType: "staff-code",
      staffCode: "AVAX402",
    },
    {
      id: "quest-7",
      name: "퀘스트 7 — Kite AI & 아발란체",
      description: "아발란체 생태계와 Kite AI",
      price: USDC10,
      difficulty: "easy",
      questType: "theory-mc",
      theory: `아발란체(Avalanche)는 높은 처리량과 낮은 지연을 자랑하는 레이어1 블록체인 플랫폼입니다. 가장 큰 특징은 **서브넷(Subnet)** 기술로, 누구나 맞춤형 독립 블록체인(L1)을 구성하고 AVAX로 검증자를 보상할 수 있습니다.

**Kite AI**는 아발란체 위에 구축된 탈중앙화 AI 플랫폼입니다. AI 모델·데이터셋·컴퓨팅 자원을 온체인에서 거래하고 인센티브화하는 독자적인 L1을 운영합니다.

**APIX L1**은 오늘 이 밋업에서 활용하는 아발란체 기반 테스트 체인입니다. 고유한 **체인 ID 402**를 사용하며, x402 프로토콜의 결제 토큰(USDC)이 이 체인 위에서 동작합니다. 숫자 402는 HTTP 402 Payment Required와 같은 숫자로, x402 프로토콜과의 연결을 상징합니다.`,
      questions: [
        {
          question: "아발란체 APIX L1 테스트넷의 체인 ID는 무엇인가요?",
          choices: ["1", "137", "402", "43114"],
          answerIndex: 2,
        },
        {
          question: "Kite AI가 아발란체 위에 구축한 것은?",
          choices: [
            "탈중앙화 AI 플랫폼 (독자 L1)",
            "NFT 마켓플레이스",
            "스테이블코인 프로토콜",
            "크로스체인 브릿지",
          ],
          answerIndex: 0,
        },
      ],
    },
    {
      id: "quest-8",
      name: "퀘스트 8 — x402 흐름 정렬",
      description: "x402 결제 프로토콜의 단계를 올바른 순서로 정렬하세요",
      price: USDC10,
      difficulty: "hard",
      questType: "threejs",
    },
    {
      id: "quest-9",
      name: "퀘스트 9 — 관심사 모으기",
      description: "주변 참가자 3명의 관심사를 모아보세요",
      price: USDC10,
      difficulty: "medium",
      questType: "interests",
    },
    {
      id: "quest-10",
      name: "퀘스트 10 — 밋업 피드백",
      description: "오늘 밋업에 대한 피드백을 남겨주세요",
      price: USDC10,
      difficulty: "easy",
      questType: "feedback",
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
