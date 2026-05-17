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
      theory: `Claude Code는 Anthropic이 만든 AI 기반 CLI 도구입니다. 터미널에서 직접 실행되며 파일 읽기·수정, 테스트 실행, Git 조작까지 실제 개발 작업을 수행할 수 있습니다.

Superpowers는 Claude Code를 확장하는 플러그인 시스템입니다. 그 핵심인 **스킬(Skill)** 은 특정 작업(브레인스토밍, TDD, 플랜 작성 등)에 대한 전문화된 지침을 Claude에게 주입합니다. 스킬을 호출하면 Claude는 해당 스킬의 워크플로를 따르며 더 체계적이고 고품질의 결과를 냅니다.

예를 들어 \`superpowers:brainstorming\` 스킬은 아이디어를 설계 문서로 발전시키는 대화형 절차를 정의하고, \`superpowers:subagent-driven-development\` 스킬은 구현 계획을 서브에이전트에게 분배하여 병렬 실행·검토하는 과정을 자동화합니다.`,
      questions: [
        {
          question:
            "Claude Code CLI를 사용하면 터미널에서 직접 파일 편집, 테스트 실행, Git 조작 등 실제 개발 작업을 수행할 수 있다. (O/X)",
          choices: ["O", "X"],
          answerIndex: 0,
        },
        {
          question:
            "Superpowers 스킬(Skill)은 Claude에게 특정 작업에 대한 전문화된 워크플로 지침을 제공하여 더 체계적인 결과를 만들어낸다. (O/X)",
          choices: ["O", "X"],
          answerIndex: 0,
        },
      ],
    },
    {
      id: "quest-3",
      name: "퀘스트 3 — x402 프로토콜",
      description: "HTTP 402와 온체인 결제",
      price: TONE1,
      questType: "theory-ox",
      theory: `x402는 HTTP 402 Payment Required 상태 코드를 기반으로 한 온체인 결제 프로토콜입니다. AI 에이전트가 유료 API 서비스를 자율적으로 이용할 수 있도록 설계되었습니다.

**동작 흐름:**
1. 클라이언트가 보호된 리소스를 요청합니다.
2. 서버는 HTTP **402** 응답과 함께 결제 요구사항(금액·토큰·수신 주소)을 반환합니다.
3. 클라이언트(또는 AI 에이전트)는 블록체인 서명을 생성하여 \`X-PAYMENT\` 헤더에 담아 재요청합니다.
4. 서버는 Facilitator(검증·정산 서비스)를 통해 서명을 검증한 뒤 리소스를 제공합니다.

**EIP-3009** 는 토큰 전송 승인에 메타트랜잭션 방식을 활용합니다. 수신자가 대신 트랜잭션을 제출할 수 있기 때문에 **송신자(사용자)는 가스비를 직접 낼 필요가 없습니다.** 이 덕분에 AI 에이전트가 가스 없이 서명만으로 결제를 완료할 수 있어 x402와 찰떡궁합입니다.`,
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
      price: TONE1,
      questType: "snowman-sabotage",
    },
    {
      id: "quest-5",
      name: "퀘스트 5 — Anthropic & Claude",
      description: "Claude 모델 패밀리를 맞혀보세요",
      price: TONE1,
      questType: "theory-mc",
      theory: `Anthropic은 AI 안전 연구를 중심으로 설립된 회사입니다. "Constitutional AI"라는 원칙 기반 정렬 방법론을 개발하였으며, 이를 통해 Claude 모델이 유해 출력을 스스로 줄이도록 훈련시킵니다.

**Claude 4 시리즈 (현재 최신):**
- **Claude Opus 4.7** — 가장 강력한 플래그십 모델. 복잡한 추론·코드·분석에 최적.
- **Claude Sonnet 4.6** — 성능과 속도의 균형. 일반 업무·Claude Code 기본 모델.
- **Claude Haiku 4.5** — 가장 빠르고 경제적. 간단한 질의응답·고속 처리에 적합.

Claude Code, claude.ai 등 다양한 제품에서 모델을 선택하여 사용할 수 있습니다.`,
      questions: [
        {
          question: "다음 중 Anthropic의 Claude 모델 시리즈가 아닌 것은?",
          choices: ["Claude Opus", "Claude Sonnet", "Claude Haiku", "Claude Gemini"],
          answerIndex: 3,
        },
      ],
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
      theory: `아발란체(Avalanche)는 높은 처리량과 낮은 지연을 자랑하는 레이어1 블록체인 플랫폼입니다. 가장 큰 특징은 **서브넷(Subnet)** 기술로, 누구나 맞춤형 독립 블록체인(L1)을 구성하고 AVAX로 검증자를 보상할 수 있습니다.

**Kite AI**는 아발란체 위에 구축된 탈중앙화 AI 플랫폼입니다. AI 모델·데이터셋·컴퓨팅 자원을 온체인에서 거래하고 인센티브화하는 독자적인 L1을 운영합니다.

**APIX L1**은 오늘 이 밋업에서 활용하는 아발란체 기반 테스트 체인입니다. 고유한 **체인 ID 402**를 사용하며, x402 프로토콜의 결제 토큰(TONE)이 이 체인 위에서 동작합니다. 숫자 402는 HTTP 402 Payment Required와 같은 숫자로, x402 프로토콜과의 연결을 상징합니다.`,
      questions: [
        {
          question: "아발란체 APIX L1 테스트넷의 체인 ID는 무엇인가요?",
          choices: ["1", "137", "402", "43114"],
          answerIndex: 2,
        },
      ],
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
      name: "퀘스트 9 — x402 흐름 정렬",
      description: "x402 결제 프로토콜의 단계를 올바른 순서로 정렬하세요",
      price: TONE1,
      questType: "threejs",
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
