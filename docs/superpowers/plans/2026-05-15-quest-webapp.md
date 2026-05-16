# Quest Web App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `x402-quests` (Vite React, port 3000) serving 9 quest pages (#2–#10, #1 excluded) accessed via UUID URL after x402 payment, with minimal x402-server changes.

**Architecture:** Claude purchases a quest via x402 → server issues UUID → frontend at `http://homeserver:3000/quest/:uuid` fetches quest data from `GET /quest-api/:uuid` → renders the correct quest component → submits answer to existing `POST /v1/quest/:productId/:step/answer`.

**Tech Stack:** Vite 5 + React 18 + TypeScript + Tailwind CSS 3 + React Router v6 + Three.js (lazy-loaded for quest 9)

---

## File Map

### x402-server (changes)
| File | Action | What changes |
|------|--------|-------------|
| `src/types.ts` | Modify | Add `QuestType`, update `Quest` interface |
| `src/quests.ts` | Modify | Add `questType`/`theory`/`staffCode`/`webCode` to all quests |
| `src/db.ts` | Modify | Generalize `Quest10Token` → `QuestToken` (add `step`, remove `answerCode`) |
| `src/routes/quest.ts` | Modify | UUID for all quests; handle new quest types in answer endpoint |
| `src/routes/services.ts` | Modify | Update renamed DB function calls |
| `src/routes/quest-api.ts` | Create | `GET /quest-api/:uuid` endpoint |
| `src/routes/quest10.ts` | Delete | Replaced by quest-api + x402-quests frontend |
| `src/index.ts` | Modify | Mount quest-api router, remove quest10 router |

### x402-quests (new app)
| File | Action | What it does |
|------|--------|-------------|
| `package.json` | Create | Vite + React + TS + Tailwind + React Router + Three.js |
| `vite.config.ts` | Create | Port 3000, path aliases |
| `tailwind.config.js` | Create | Dark theme config |
| `src/main.tsx` | Create | App entry |
| `src/App.tsx` | Create | Router setup |
| `src/types.ts` | Create | Shared types (QuestType, QuestData, AnswerResult) |
| `src/api.ts` | Create | `fetchQuest(uuid)`, `submitAnswer(...)` |
| `src/pages/QuestPage.tsx` | Create | UUID route handler, dispatches to quest components |
| `src/components/Timer.tsx` | Create | 10s countdown bar |
| `src/components/ResultDisplay.tsx` | Create | Success/failure feedback |
| `src/quests/TheoryQuiz.tsx` | Create | OX + MC with theory + timer (quests 2,3,5,7) |
| `src/quests/FindClickQuest.tsx` | Create | Hidden AVAX click hunt (quest 4) |
| `src/quests/StaffCodeQuest.tsx` | Create | Code input + submit (quest 6) |
| `src/quests/FeedbackQuest.tsx` | Create | Meetup feedback form (quest 8) |
| `src/quests/ThreeJsQuest.tsx` | Create | Three.js 3D interaction (quest 9, lazy) |
| `src/quests/InterestsQuest.tsx` | Create | Participant interests tag collector (quest 10) |

---

## Part 1: x402-server Changes

### Task 1: Update `types.ts` and `quests.ts`

**Files:**
- Modify: `x402-server/src/types.ts`
- Modify: `x402-server/src/quests.ts`

- [ ] **Step 1: Update `types.ts`**

Replace the `Quest` interface:

```typescript
// x402-server/src/types.ts

export type QuestType =
  | 'drag-drop'
  | 'theory-ox'
  | 'theory-mc'
  | 'find-click'
  | 'staff-code'
  | 'feedback'
  | 'threejs'
  | 'interests';

export interface Quest {
  id: string;
  name: string;
  description: string;
  price: bigint;
  questType: QuestType;
  // theory quests only
  theory?: string;
  question?: string;
  choices?: string[];
  answerIndex?: number;
  // staff-code quest
  staffCode?: string;
  // find-click / threejs quest
  webCode?: string;
}

// Keep PaymentRequirements, X402Response, FacilitatorVerifyRequest,
// FacilitatorVerifyResponse, FacilitatorSettleResponse unchanged.
export interface PaymentRequirements {
  scheme: "exact";
  network: string;
  asset: string;
  amount: string;
  payTo: string;
  maxTimeoutSeconds: number;
  resource: string;
  description: string;
  mimeType: string;
  extra?: {
    assetTransferMethod: "eip3009" | "permit2";
    name: string;
    version: string;
  };
}

export interface X402Response {
  x402Version: number;
  accepts: PaymentRequirements[];
  error: string;
}

export interface FacilitatorVerifyRequest {
  x402Version: number;
  paymentPayload: unknown;
  paymentRequirements: unknown;
}

export interface FacilitatorVerifyResponse {
  isValid: boolean;
  invalidReason?: string;
  invalidMessage?: string;
  payer?: string;
}

export interface FacilitatorSettleResponse {
  success: boolean;
  transaction: string;
  network: string;
  payer?: string;
  errorReason?: string;
  errorMessage?: string;
}
```

- [ ] **Step 2: Rewrite `quests.ts` with all 10 quests**

```typescript
// x402-server/src/quests.ts
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
```

- [ ] **Step 3: Typecheck**

```bash
cd x402-server && npm run typecheck
```

Expected: no errors (may show unused import warnings if `isWebQuest` is still referenced — fix in next task).

- [ ] **Step 4: Commit**

```bash
git add x402-server/src/types.ts x402-server/src/quests.ts
git commit -m "refactor(server): generalize Quest type with questType field, update all quest data"
```

---

### Task 2: Update `db.ts` — generalize QuestToken

**Files:**
- Modify: `x402-server/src/db.ts`

- [ ] **Step 1: Rewrite `db.ts`**

```typescript
// x402-server/src/db.ts
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data");
const DB_FILE = join(DATA_DIR, "users.json");
const TOKENS_FILE = join(DATA_DIR, "questtokens.json");

export interface UserRecord {
  walletAddress: string;
  privateKey: string;
  registeredAt: string;
  initialAirdropTx?: string;
  currentProductId?: string;
  currentStep?: number;
  isCompleted?: boolean;
  purchasedSteps?: number[];
}

export interface QuestToken {
  uuid: string;
  productId: string;
  step: number;
  walletAddress: string;
  createdAt: string;
}

function loadUsers(): Record<string, UserRecord> {
  if (!existsSync(DB_FILE)) return {};
  return JSON.parse(readFileSync(DB_FILE, "utf8"));
}

function saveUsers(data: Record<string, UserRecord>) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function loadTokens(): Record<string, QuestToken> {
  if (!existsSync(TOKENS_FILE)) return {};
  return JSON.parse(readFileSync(TOKENS_FILE, "utf8"));
}

function saveTokens(data: Record<string, QuestToken>) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(TOKENS_FILE, JSON.stringify(data, null, 2));
}

export function createUser(record: UserRecord): void {
  const db = loadUsers();
  db[record.walletAddress.toLowerCase()] = record;
  saveUsers(db);
}

export function getUser(walletAddress: string): UserRecord | undefined {
  return loadUsers()[walletAddress.toLowerCase()];
}

export function listUsers(): UserRecord[] {
  return Object.values(loadUsers());
}

export function updateQuestStatus(
  walletAddress: string,
  productId: string,
  step: number,
  isCompleted: boolean,
): void {
  const db = loadUsers();
  const user = db[walletAddress.toLowerCase()];
  if (user) {
    user.currentProductId = productId;
    user.currentStep = step;
    user.isCompleted = isCompleted;
    saveUsers(db);
  }
}

export function addPurchasedStep(
  walletAddress: string,
  productId: string,
  step: number,
): void {
  const db = loadUsers();
  const user = db[walletAddress.toLowerCase()];
  if (user) {
    if (!user.purchasedSteps) user.purchasedSteps = [];
    if (!user.purchasedSteps.includes(step)) {
      user.purchasedSteps.push(step);
    }
    if (!user.currentProductId) user.currentProductId = productId;
    saveUsers(db);
  }
}

export function storeQuestToken(token: QuestToken): void {
  const tokens = loadTokens();
  tokens[token.uuid] = token;
  saveTokens(tokens);
}

export function getQuestToken(uuid: string): QuestToken | undefined {
  return loadTokens()[uuid];
}

export function getQuestTokenByStep(
  walletAddress: string,
  productId: string,
  step: number,
): QuestToken | undefined {
  return Object.values(loadTokens()).find(
    (t) =>
      t.walletAddress.toLowerCase() === walletAddress.toLowerCase() &&
      t.productId === productId &&
      t.step === step,
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
cd x402-server && npm run typecheck
```

Expected: errors in `routes/quest.ts`, `routes/services.ts`, `routes/quest10.ts` — these reference old function names. Fix in next tasks.

- [ ] **Step 3: Commit**

```bash
git add x402-server/src/db.ts
git commit -m "refactor(server): generalize Quest10Token to QuestToken with step field"
```

---

### Task 3: Update `routes/quest.ts` — UUID for all quests + new answer types

**Files:**
- Modify: `x402-server/src/routes/quest.ts`

- [ ] **Step 1: Rewrite `routes/quest.ts`**

```typescript
// x402-server/src/routes/quest.ts
import { randomUUID } from "node:crypto";
import { Router, type Request, type Response } from "express";
import { getQuest } from "../quests.js";
import { verifyPayment, settlePayment } from "../facilitator.js";
import {
  getUser,
  updateQuestStatus,
  addPurchasedStep,
  storeQuestToken,
  getQuestTokenByStep,
} from "../db.js";
import type { PaymentRequirements, X402Response } from "../types.js";

const router = Router();

function parsePaymentHeader(header: string): unknown {
  try {
    return JSON.parse(Buffer.from(header, "base64").toString("utf8"));
  } catch {
    return null;
  }
}

function buildPaymentRequirements(
  productId: string,
  step: string,
  price: bigint,
): PaymentRequirements {
  const API_BASE = process.env.API_BASE_URL || "http://localhost:4010";
  return {
    scheme: "exact",
    network: `eip155:${process.env.CHAIN_ID || "402"}`,
    asset: process.env.TONE_TOKEN!,
    amount: price.toString(),
    payTo: process.env.PAY_TO!,
    maxTimeoutSeconds: 60,
    resource: `${API_BASE}/v1/quest/${productId}/${step}`,
    description: `Quest ${productId}/${step} access payment`,
    mimeType: "application/json",
    extra: {
      assetTransferMethod: "eip3009",
      name: "TONE",
      version: "1",
    },
  };
}

// GET /v1/quest/:productId/:step
router.get("/:productId/:step", async (req: Request, res: Response) => {
  const { productId, step } = req.params;
  const quest = getQuest(productId, step);

  if (!quest) {
    res.status(404).json({ error: "Quest not found" });
    return;
  }

  if (quest.price === 0n) {
    res.json({ id: quest.id, name: quest.name, questType: quest.questType });
    return;
  }

  const paymentHeader = req.headers["x-payment"] as string | undefined;

  if (!paymentHeader) {
    const requirements = buildPaymentRequirements(productId, step, quest.price);
    const body: X402Response = {
      x402Version: 1,
      accepts: [requirements],
      error: "결제가 필요합니다",
    };
    res.status(402).json(body);
    return;
  }

  const paymentPayload = parsePaymentHeader(paymentHeader);
  if (!paymentPayload) {
    res.status(400).json({ error: "X-PAYMENT 헤더 파싱 실패" });
    return;
  }

  const requirements = buildPaymentRequirements(productId, step, quest.price);

  let verifyResult;
  try {
    verifyResult = await verifyPayment(paymentPayload, requirements);
  } catch (e) {
    res.status(502).json({ error: "facilitator 연결 실패", detail: String(e) });
    return;
  }

  if (!verifyResult.isValid) {
    res.status(402).json({
      error: "결제 검증 실패",
      reason: verifyResult.invalidReason,
      message: verifyResult.invalidMessage,
    });
    return;
  }

  const payer = verifyResult.payer;
  if (payer) {
    const user = getUser(payer);
    const currentStepNum = parseInt(step, 10);

    if (!user) {
      res.status(403).json({
        error: "등록되지 않은 사용자입니다. POST /v1/register 로 먼저 등록하세요.",
      });
      return;
    }

    if (user.currentProductId && user.currentProductId !== productId) {
      res.status(403).json({ error: "다른 상품 경로를 진행 중입니다." });
      return;
    }

    const userStep = user.currentStep ?? 0;
    if (userStep !== currentStepNum - 1) {
      res.status(403).json({
        error: `이전 단계를 완료해야 합니다. 현재 진행 가능 단계: ${userStep + 1}`,
      });
      return;
    }
  }

  let settleResult;
  try {
    settleResult = await settlePayment(paymentPayload, requirements);
  } catch (e) {
    res.status(502).json({ error: "facilitator settle 실패", detail: String(e) });
    return;
  }

  if (!settleResult.success) {
    res.status(402).json({
      error: "결제 정산 실패",
      reason: settleResult.errorReason,
      message: settleResult.errorMessage,
    });
    return;
  }

  const currentStepNum = parseInt(step, 10);

  if (payer) {
    addPurchasedStep(payer, productId, currentStepNum);
  }

  res.setHeader("X-PAYMENT-RESPONSE", settleResult.transaction);

  // 모든 유료 퀘스트: UUID 발급 후 questUrl 반환
  const QUEST_BASE = process.env.QUEST_BASE_URL || "http://localhost:3000";
  const uuid = randomUUID();
  storeQuestToken({
    uuid,
    productId,
    step: currentStepNum,
    walletAddress: payer ?? "",
    createdAt: new Date().toISOString(),
  });

  res.json({
    id: quest.id,
    name: quest.name,
    questType: quest.questType,
    questUrl: `${QUEST_BASE}/quest/${uuid}`,
    hint: "브라우저를 열어 이 URL을 방문하고 퀘스트를 완료하세요!",
    settleTx: settleResult.transaction,
  });
});

// POST /v1/quest/:productId/:step/answer
router.post("/:productId/:step/answer", async (req: Request, res: Response) => {
  const { productId, step } = req.params;
  const quest = getQuest(productId, step);

  if (!quest) {
    res.status(404).json({ error: "Quest not found" });
    return;
  }

  const {
    answerIndex,
    walletAddress,
    secretCode,
    feedback,
    interests,
  } = req.body as {
    answerIndex?: number;
    walletAddress?: string;
    secretCode?: string;
    feedback?: { good: string; bad: string; next: string };
    interests?: string[];
  };

  if (!walletAddress) {
    res.status(400).json({ error: "walletAddress가 필요합니다" });
    return;
  }

  const currentStepNum = parseInt(step, 10);
  const isLastStep = currentStepNum === 10;

  if (quest.questType === "theory-ox" || quest.questType === "theory-mc") {
    if (answerIndex === undefined) {
      res.status(400).json({ error: "answerIndex가 필요합니다" });
      return;
    }
    if (answerIndex !== quest.answerIndex) {
      res.json({ correct: false, message: "틀렸습니다. 다시 시도해보세요!" });
      return;
    }
    updateQuestStatus(walletAddress, productId, currentStepNum, isLastStep);
    res.json({ correct: true, message: "정답입니다! 🎉" });
    return;
  }

  if (quest.questType === "staff-code") {
    if (!secretCode) {
      res.status(400).json({ error: "secretCode가 필요합니다" });
      return;
    }
    if (secretCode !== quest.staffCode) {
      res.json({ correct: false, message: "코드가 틀렸습니다. 스태프에게 다시 확인하세요!" });
      return;
    }
    updateQuestStatus(walletAddress, productId, currentStepNum, isLastStep);
    res.json({ correct: true, message: "스태프 인증 완료! 🎉" });
    return;
  }

  if (quest.questType === "find-click" || quest.questType === "threejs") {
    if (!secretCode) {
      res.status(400).json({ error: "secretCode가 필요합니다" });
      return;
    }
    if (secretCode !== quest.webCode) {
      res.json({ correct: false, message: "올바른 요소를 찾지 못했습니다!" });
      return;
    }
    updateQuestStatus(walletAddress, productId, currentStepNum, isLastStep);
    res.json({ correct: true, message: "찾았습니다! 🎉" });
    return;
  }

  if (quest.questType === "feedback") {
    if (!feedback?.good || !feedback?.bad || !feedback?.next) {
      res.status(400).json({ error: "모든 피드백 항목을 입력해주세요" });
      return;
    }
    updateQuestStatus(walletAddress, productId, currentStepNum, isLastStep);
    res.json({ correct: true, message: "피드백 감사합니다! 🎉" });
    return;
  }

  if (quest.questType === "interests") {
    if (!interests || interests.length < 3) {
      res.status(400).json({ error: "참가자 3명의 관심사를 입력해주세요" });
      return;
    }
    updateQuestStatus(walletAddress, productId, currentStepNum, isLastStep);
    res.json({ correct: true, message: "관심사 수집 완료! 🎉" });
    return;
  }

  res.status(400).json({ error: "지원하지 않는 퀘스트 타입입니다" });
});

export default router;
```

- [ ] **Step 2: Typecheck**

```bash
cd x402-server && npm run typecheck
```

Expected: errors in `services.ts` and `quest10.ts` still (not updated yet).

- [ ] **Step 3: Commit**

```bash
git add x402-server/src/routes/quest.ts
git commit -m "feat(server): issue UUID for all quests, handle new quest types in answer endpoint"
```

---

### Task 4: Update `routes/services.ts` + add `routes/quest-api.ts` + update `index.ts`

**Files:**
- Modify: `x402-server/src/routes/services.ts`
- Create: `x402-server/src/routes/quest-api.ts`
- Delete: `x402-server/src/routes/quest10.ts`
- Modify: `x402-server/src/index.ts`

- [ ] **Step 1: Fix `services.ts`** — update renamed imports

```typescript
// x402-server/src/routes/services.ts
import { Router, type Request, type Response } from "express";
import { getAllQuests } from "../quests.js";
import { getUser, getQuestTokenByStep } from "../db.js";
import type { UserRecord } from "../db.js";

const router = Router();

type QuestStatus = "cleared" | "purchased" | "available" | "locked";

function getQuestStatus(stepNum: number, user?: UserRecord): QuestStatus {
  if (!user) return stepNum === 1 ? "available" : "locked";
  const currentStep = user.currentStep ?? 0;
  const purchasedSteps = user.purchasedSteps ?? [];
  if (stepNum <= currentStep) return "cleared";
  if (purchasedSteps.includes(stepNum)) return "purchased";
  if (stepNum === currentStep + 1) return "available";
  return "locked";
}

// GET /v1/services?productId=product-a&wallet=0x...
router.get("/", (req: Request, res: Response) => {
  const QUEST_BASE = process.env.QUEST_BASE_URL || "http://localhost:3000";
  const productId = String(req.query.productId || "product-a");
  const wallet = req.query.wallet as string | undefined;

  const quests = getAllQuests(productId);
  if (!quests) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const user = wallet ? getUser(wallet) : undefined;

  const services = quests.map((q, idx) => {
    const stepNum = idx + 1;
    const status = getQuestStatus(stepNum, user);
    const base = {
      id: q.id,
      name: q.name,
      description: q.description,
      questType: q.questType,
      status,
      price: q.price === 0n ? "무료" : "1 TONE",
      endpoint: `http://localhost:4010/v1/quest/${productId}/${stepNum}`,
    };

    if ((status === "cleared" || status === "purchased") && user) {
      const token = getQuestTokenByStep(user.walletAddress, productId, stepNum);
      if (token) {
        return { ...base, questUrl: `${QUEST_BASE}/quest/${token.uuid}` };
      }
    }

    return base;
  });

  res.json({ productId, services });
});

// GET /v1/services/search?q=...
router.get("/search", (req: Request, res: Response) => {
  const q = String(req.query.q || "").toLowerCase();
  const productId = String(req.query.productId || "product-a");

  const quests = getAllQuests(productId) ?? [];
  const results = quests.filter(
    (quest) =>
      quest.name.toLowerCase().includes(q) ||
      quest.description.toLowerCase().includes(q),
  );

  res.json({
    results: results.map((quest) => ({
      id: quest.id,
      name: quest.name,
      description: quest.description,
      questType: quest.questType,
    })),
  });
});

export default router;
```

- [ ] **Step 2: Create `routes/quest-api.ts`**

```typescript
// x402-server/src/routes/quest-api.ts
import { Router, type Request, type Response } from "express";
import { getQuestToken } from "../db.js";
import { getQuest } from "../quests.js";

const router = Router();

// GET /quest-api/:uuid — frontend calls this to get quest data
router.get("/:uuid", (req: Request, res: Response) => {
  const { uuid } = req.params;
  const token = getQuestToken(uuid);

  if (!token) {
    res.status(404).json({ error: "유효하지 않은 퀘스트 UUID입니다" });
    return;
  }

  const quest = getQuest(token.productId, String(token.step));

  if (!quest) {
    res.status(404).json({ error: "퀘스트 데이터를 찾을 수 없습니다" });
    return;
  }

  // webCode / staffCode / answerIndex are NOT exposed to frontend
  res.json({
    questType: quest.questType,
    step: token.step,
    productId: token.productId,
    walletAddress: token.walletAddress,
    name: quest.name,
    description: quest.description,
    // theory quest fields (safe to expose)
    ...(quest.theory && { theory: quest.theory }),
    ...(quest.question && { question: quest.question }),
    ...(quest.choices && { choices: quest.choices }),
  });
});

export default router;
```

- [ ] **Step 3: Update `index.ts`**

```typescript
// x402-server/src/index.ts
import "dotenv/config";
import express from "express";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import servicesRouter from "./routes/services.js";
import questRouter from "./routes/quest.js";
import usersRouter from "./routes/users.js";
import questApiRouter from "./routes/quest-api.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());

app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-PAYMENT");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  next();
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    facilitator: process.env.FACILITATOR_URL,
    network: `eip155:${process.env.CHAIN_ID || "402"}`,
    payTo: process.env.PAY_TO,
  });
});

app.get("/llms.txt", (_req, res) => {
  const base = process.env.API_BASE_URL || "http://localhost:4010";
  const template = readFileSync(join(__dirname, "..", "llms.txt"), "utf8");
  const content = template.replaceAll("{{BASE_URL}}", base);
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.send(content);
});

app.use("/v1/register", usersRouter);
app.use("/v1/services", servicesRouter);
app.use("/v1/quest", questRouter);
app.use("/quest-api", questApiRouter);

const port = Number(process.env.PORT || 4010);
app.listen(port, () => {
  console.log(`x402-server listening on http://localhost:${port}`);
  console.log(`facilitator: ${process.env.FACILITATOR_URL}`);
  console.log(`network: eip155:${process.env.CHAIN_ID || "402"}`);
  console.log(`payTo: ${process.env.PAY_TO}`);
});
```

- [ ] **Step 4: Delete `routes/quest10.ts`**

```bash
rm x402-server/src/routes/quest10.ts
```

- [ ] **Step 5: Typecheck and run**

```bash
cd x402-server && npm run typecheck
```

Expected: zero errors.

- [ ] **Step 6: Smoke test the new endpoint**

```bash
cd x402-server && npm run dev
# In another terminal:
curl http://localhost:4010/health
# Expected: { status: "ok", ... }

curl http://localhost:4010/quest-api/nonexistent-uuid
# Expected: { "error": "유효하지 않은 퀘스트 UUID입니다" }
```

- [ ] **Step 7: Commit**

```bash
git add x402-server/src/routes/services.ts x402-server/src/routes/quest-api.ts x402-server/src/index.ts
git rm x402-server/src/routes/quest10.ts
git commit -m "feat(server): add /quest-api/:uuid endpoint, remove quest10 HTML route, fix services.ts"
```

---

## Part 2: x402-quests Frontend

### Task 5: Initialize `x402-quests` project

**Files:**
- Create: `x402-quests/package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.js`, `postcss.config.js`, `index.html`, `.env.example`

- [ ] **Step 1: Create project directory**

```bash
mkdir -p x402-quests/src/{pages,quests,components}
```

- [ ] **Step 2: Create `x402-quests/package.json`**

```json
{
  "name": "x402-quests",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview --port 3000"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.0",
    "three": "^0.169.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.1",
    "@types/react-dom": "^18.3.1",
    "@types/three": "^0.169.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.14",
    "typescript": "^5.5.3",
    "vite": "^5.4.10"
  }
}
```

- [ ] **Step 3: Create `x402-quests/vite.config.ts`**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 3000 },
});
```

- [ ] **Step 4: Create `x402-quests/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true
  },
  "include": ["src"]
}
```

- [ ] **Step 5: Create Tailwind config**

```javascript
// x402-quests/tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
};
```

```javascript
// x402-quests/postcss.config.js
export default {
  plugins: { tailwindcss: {}, autoprefixer: {} },
};
```

- [ ] **Step 6: Create `x402-quests/index.html`**

```html
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>x402 Quests</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 7: Create `x402-quests/.env.example`**

```
VITE_API_BASE=http://localhost:4010
```

Copy to `.env.local`:

```bash
cp x402-quests/.env.example x402-quests/.env.local
```

- [ ] **Step 8: Install dependencies**

```bash
cd x402-quests && npm install
```

- [ ] **Step 9: Commit**

```bash
git add x402-quests/
git commit -m "feat(quests): initialize x402-quests Vite React project"
```

---

### Task 6: Types + API layer + global styles

**Files:**
- Create: `x402-quests/src/types.ts`
- Create: `x402-quests/src/api.ts`
- Create: `x402-quests/src/index.css`
- Create: `x402-quests/src/main.tsx`
- Create: `x402-quests/src/App.tsx`

- [ ] **Step 1: Create `src/types.ts`**

```typescript
// x402-quests/src/types.ts
export type QuestType =
  | 'drag-drop'
  | 'theory-ox'
  | 'theory-mc'
  | 'find-click'
  | 'staff-code'
  | 'feedback'
  | 'threejs'
  | 'interests';

export interface QuestData {
  questType: QuestType;
  step: number;
  productId: string;
  walletAddress: string;
  name: string;
  description: string;
  // theory quests
  theory?: string;
  question?: string;
  choices?: string[];
}

export interface AnswerResult {
  correct: boolean;
  message: string;
}
```

- [ ] **Step 2: Create `src/api.ts`**

```typescript
// x402-quests/src/api.ts
import type { QuestData, AnswerResult } from './types';

const API_BASE = import.meta.env.VITE_API_BASE as string || 'http://localhost:4010';

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
    answerIndex?: number;
    secretCode?: string;
    feedback?: { good: string; bad: string; next: string };
    interests?: string[];
  },
): Promise<AnswerResult> {
  const res = await fetch(`${API_BASE}/v1/quest/${productId}/${step}/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletAddress, ...body }),
  });
  return res.json() as Promise<AnswerResult>;
}
```

- [ ] **Step 3: Create `src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-gray-950 text-slate-100 font-mono;
  min-height: 100vh;
}
```

- [ ] **Step 4: Create `src/main.tsx`**

```tsx
// x402-quests/src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
```

- [ ] **Step 5: Create `src/App.tsx`** (shell, QuestPage added in Task 11)

```tsx
// x402-quests/src/App.tsx
import { Routes, Route } from 'react-router-dom';
import QuestPage from './pages/QuestPage';

export default function App() {
  return (
    <Routes>
      <Route path="/quest/:uuid" element={<QuestPage />} />
      <Route path="*" element={
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-slate-500">잘못된 접근입니다. Claude에게 퀘스트 URL을 요청하세요.</p>
        </div>
      } />
    </Routes>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add x402-quests/src/
git commit -m "feat(quests): add types, API layer, global styles, app shell"
```

---

### Task 7: Common components — Timer + ResultDisplay

**Files:**
- Create: `x402-quests/src/components/Timer.tsx`
- Create: `x402-quests/src/components/ResultDisplay.tsx`

- [ ] **Step 1: Create `src/components/Timer.tsx`**

10초 카운트다운. `onComplete` 콜백으로 퀴즈 언락.

```tsx
// x402-quests/src/components/Timer.tsx
import { useEffect, useState } from 'react';

interface TimerProps {
  seconds: number;
  onComplete: () => void;
}

export default function Timer({ seconds, onComplete }: TimerProps) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) {
      onComplete();
      return;
    }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(id);
  }, [remaining, onComplete]);

  const pct = ((seconds - remaining) / seconds) * 100;

  return (
    <div className="w-full mt-4">
      <div className="flex justify-between text-xs text-slate-500 mb-1">
        <span>이론을 읽는 중...</span>
        <span>{remaining}s</span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/ResultDisplay.tsx`**

```tsx
// x402-quests/src/components/ResultDisplay.tsx
interface ResultDisplayProps {
  correct: boolean;
  message: string;
}

export default function ResultDisplay({ correct, message }: ResultDisplayProps) {
  return (
    <div className={`mt-6 p-4 rounded-lg border text-center ${
      correct
        ? 'bg-green-950 border-green-600 text-green-300'
        : 'bg-red-950 border-red-600 text-red-300'
    }`}>
      <p className="text-2xl mb-2">{correct ? '🎉' : '❌'}</p>
      <p>{message}</p>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add x402-quests/src/components/
git commit -m "feat(quests): add Timer and ResultDisplay common components"
```

---

### Task 8: TheoryQuiz component (OX + MC, quests 2, 3, 5, 7)

**Files:**
- Create: `x402-quests/src/quests/TheoryQuiz.tsx`

- [ ] **Step 1: Create `src/quests/TheoryQuiz.tsx`**

```tsx
// x402-quests/src/quests/TheoryQuiz.tsx
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

        {/* Theory */}
        <div className="bg-gray-800 rounded-lg p-4 text-sm text-slate-300 leading-relaxed">
          {quest.theory}
        </div>

        {/* Timer */}
        {!quizUnlocked && (
          <Timer seconds={10} onComplete={handleTimerComplete} />
        )}

        {/* Quiz */}
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
```

- [ ] **Step 2: Commit**

```bash
git add x402-quests/src/quests/TheoryQuiz.tsx
git commit -m "feat(quests): add TheoryQuiz component (OX + MC with timer)"
```

---

### Task 9: StaffCodeQuest component (quest 6)

**Files:**
- Create: `x402-quests/src/quests/StaffCodeQuest.tsx`

- [ ] **Step 1: Create `src/quests/StaffCodeQuest.tsx`**

```tsx
// x402-quests/src/quests/StaffCodeQuest.tsx
import { useState } from 'react';
import type { QuestData, AnswerResult } from '../types';
import { submitAnswer } from '../api';
import ResultDisplay from '../components/ResultDisplay';

interface Props { quest: QuestData }

export default function StaffCodeQuest({ quest }: Props) {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!code.trim() || loading || result?.correct) return;
    setLoading(true);
    const res = await submitAnswer(quest.productId, quest.step, quest.walletAddress, {
      secretCode: code.trim().toUpperCase(),
    });
    setResult(res);
    setLoading(false);
  };

  return (
    <div className="max-w-lg w-full mx-auto px-4 py-12">
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <span className="text-xs text-purple-400 uppercase tracking-widest">Quest {quest.step} · 네트워킹</span>
        <h1 className="text-xl font-bold mt-2 mb-2">{quest.name}</h1>
        <p className="text-slate-400 text-sm mb-6">
          행사장에서 스태프를 찾아 비밀코드를 받아오세요! 스태프에게 이 화면을 보여주며 물어보세요.
        </p>

        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="비밀코드 입력"
          maxLength={16}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-center text-2xl tracking-widest focus:outline-none focus:border-purple-500 uppercase"
          disabled={result?.correct}
        />

        {!result && (
          <button
            onClick={handleSubmit}
            disabled={!code.trim() || loading}
            className="mt-4 w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
          >
            {loading ? '확인 중...' : '제출'}
          </button>
        )}

        {result && <ResultDisplay correct={result.correct} message={result.message} />}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add x402-quests/src/quests/StaffCodeQuest.tsx
git commit -m "feat(quests): add StaffCodeQuest component"
```

---

### Task 10: FindClickQuest component (quest 4)

숨겨진 AVAX 토큰을 화면에서 찾아 클릭. 30개의 토큰 로고 중 AVAX만 회전 + 약간 투명.

**Files:**
- Create: `x402-quests/src/quests/FindClickQuest.tsx`

- [ ] **Step 1: Create `src/quests/FindClickQuest.tsx`**

```tsx
// x402-quests/src/quests/FindClickQuest.tsx
import { useState, useMemo } from 'react';
import type { QuestData, AnswerResult } from '../types';
import { submitAnswer } from '../api';
import ResultDisplay from '../components/ResultDisplay';

interface Props { quest: QuestData }

const TOKENS = ['ETH', 'BTC', 'SOL', 'MATIC', 'BNB', 'DOT', 'ADA', 'LINK', 'UNI', 'AAVE'];

function seededPosition(seed: number, i: number) {
  const x = ((seed * (i + 1) * 1234567) % 80) + 5;
  const y = ((seed * (i + 1) * 7654321) % 80) + 5;
  return { x, y };
}

export default function FindClickQuest({ quest }: Props) {
  const [found, setFound] = useState(false);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const seed = 42;
  const avaxPos = { x: 63, y: 47 };

  const decoys = useMemo(() =>
    Array.from({ length: 28 }, (_, i) => ({
      label: TOKENS[i % TOKENS.length],
      ...seededPosition(seed, i),
    })), []);

  const handleAvaxClick = async () => {
    if (loading || result?.correct) return;
    setFound(true);
    setLoading(true);
    const res = await submitAnswer(quest.productId, quest.step, quest.walletAddress, {
      secretCode: 'CLICK404',
    });
    setResult(res);
    setLoading(false);
  };

  const handleDecoyClick = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  return (
    <div className="max-w-lg w-full mx-auto px-4 py-12">
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <span className="text-xs text-orange-400 uppercase tracking-widest">Quest {quest.step} · 인터랙션</span>
        <h1 className="text-xl font-bold mt-2 mb-1">{quest.name}</h1>
        <p className="text-slate-400 text-sm mb-4">군중 속에 숨겨진 AVAX를 찾아 클릭하세요!</p>

        <div
          className={`relative w-full h-80 bg-gray-800 rounded-xl overflow-hidden border border-gray-700 ${shake ? 'animate-pulse' : ''}`}
        >
          {/* Decoys */}
          {decoys.map((d, i) => (
            <button
              key={i}
              onClick={handleDecoyClick}
              className="absolute text-xs text-slate-500 hover:text-slate-400 transition-colors select-none"
              style={{ left: `${d.x}%`, top: `${d.y}%`, transform: 'translate(-50%,-50%)' }}
            >
              {d.label}
            </button>
          ))}

          {/* Hidden AVAX */}
          {!found && (
            <button
              onClick={handleAvaxClick}
              className="absolute text-sm font-bold text-red-500/40 hover:text-red-400 transition-all duration-300 hover:scale-125 animate-spin select-none"
              style={{
                left: `${avaxPos.x}%`,
                top: `${avaxPos.y}%`,
                transform: 'translate(-50%,-50%)',
                animationDuration: '8s',
              }}
            >
              AVAX
            </button>
          )}

          {found && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800/80">
              <p className="text-green-400 text-lg font-bold">AVAX 발견! ✨</p>
            </div>
          )}
        </div>

        {result && <ResultDisplay correct={result.correct} message={result.message} />}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add x402-quests/src/quests/FindClickQuest.tsx
git commit -m "feat(quests): add FindClickQuest component (hidden AVAX hunt)"
```

---

### Task 11: FeedbackQuest component (quest 8)

**Files:**
- Create: `x402-quests/src/quests/FeedbackQuest.tsx`

- [ ] **Step 1: Create `src/quests/FeedbackQuest.tsx`**

```tsx
// x402-quests/src/quests/FeedbackQuest.tsx
import { useState } from 'react';
import type { QuestData, AnswerResult } from '../types';
import { submitAnswer } from '../api';
import ResultDisplay from '../components/ResultDisplay';

interface Props { quest: QuestData }

export default function FeedbackQuest({ quest }: Props) {
  const [good, setGood] = useState('');
  const [bad, setBad] = useState('');
  const [next, setNext] = useState('');
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit = good.trim() && bad.trim() && next.trim();

  const handleSubmit = async () => {
    if (!canSubmit || loading || result?.correct) return;
    setLoading(true);
    const res = await submitAnswer(quest.productId, quest.step, quest.walletAddress, {
      feedback: { good: good.trim(), bad: bad.trim(), next: next.trim() },
    });
    setResult(res);
    setLoading(false);
  };

  return (
    <div className="max-w-lg w-full mx-auto px-4 py-12">
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <span className="text-xs text-teal-400 uppercase tracking-widest">Quest {quest.step} · 피드백</span>
        <h1 className="text-xl font-bold mt-2 mb-1">{quest.name}</h1>
        <p className="text-slate-400 text-sm mb-6">오늘 밋업이 어떠셨나요? 솔직한 피드백을 남겨주세요 🙏</p>

        {[
          { label: '좋았던 점', value: good, setter: setGood, placeholder: '가장 좋았던 것은...' },
          { label: '아쉬웠던 점', value: bad, setter: setBad, placeholder: '개선하면 좋을 것은...' },
          { label: '다음엔 이걸!', value: next, setter: setNext, placeholder: '다음 밋업에서 경험하고 싶은 것은...' },
        ].map(({ label, value, setter, placeholder }) => (
          <div key={label} className="mb-4">
            <label className="text-xs text-slate-400 uppercase tracking-wider mb-1 block">{label}</label>
            <textarea
              value={value}
              onChange={(e) => setter(e.target.value)}
              placeholder={placeholder}
              rows={2}
              disabled={result?.correct}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500 resize-none"
            />
          </div>
        ))}

        {!result && (
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
            className="w-full py-3 bg-teal-600 hover:bg-teal-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
          >
            {loading ? '제출 중...' : '피드백 제출'}
          </button>
        )}

        {result && <ResultDisplay correct={result.correct} message={result.message} />}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add x402-quests/src/quests/FeedbackQuest.tsx
git commit -m "feat(quests): add FeedbackQuest component"
```

---

### Task 12: InterestsQuest component (quest 10)

참가자 3명의 관심사 태그 수집.

**Files:**
- Create: `x402-quests/src/quests/InterestsQuest.tsx`

- [ ] **Step 1: Create `src/quests/InterestsQuest.tsx`**

```tsx
// x402-quests/src/quests/InterestsQuest.tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add x402-quests/src/quests/InterestsQuest.tsx
git commit -m "feat(quests): add InterestsQuest component (participant tag collector)"
```

---

### Task 13: ThreeJsQuest component (quest 9, lazy-loaded)

3D 씬에서 회전하는 정육면체의 특정 면(빨간 면)을 찾아 클릭.

**Files:**
- Create: `x402-quests/src/quests/ThreeJsQuest.tsx`

- [ ] **Step 1: Create `src/quests/ThreeJsQuest.tsx`**

```tsx
// x402-quests/src/quests/ThreeJsQuest.tsx
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { QuestData, AnswerResult } from '../types';
import { submitAnswer } from '../api';
import ResultDisplay from '../components/ResultDisplay';

interface Props { quest: QuestData }

export default function ThreeJsQuest({ quest }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hint, setHint] = useState(false);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!mountRef.current || result?.correct) return;

    const el = mountRef.current;
    const w = el.clientWidth;
    const h = 320;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(window.devicePixelRatio);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
    camera.position.set(0, 0, 3);

    // Cube with 6 faces — face 4 (index 4) is the secret red face
    const materials = [
      new THREE.MeshStandardMaterial({ color: 0x1e40af }), // right
      new THREE.MeshStandardMaterial({ color: 0x1e40af }), // left
      new THREE.MeshStandardMaterial({ color: 0x1e40af }), // top
      new THREE.MeshStandardMaterial({ color: 0x1e40af }), // bottom
      new THREE.MeshStandardMaterial({ color: 0x7f1d1d, emissive: 0x3b0000 }), // front — secret
      new THREE.MeshStandardMaterial({ color: 0x1e40af }), // back
    ];

    const cube = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, 1.4), materials);
    scene.add(cube);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    // Raycaster for click
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = async (e: MouseEvent) => {
      if (loading || result?.correct) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObject(cube);
      if (!hits.length) return;
      const faceIndex = Math.floor(hits[0].faceIndex! / 2);
      if (faceIndex === 4) {
        // Correct face clicked
        setLoading(true);
        const res = await submitAnswer(quest.productId, quest.step, quest.walletAddress, {
          secretCode: '3DAVAX',
        });
        setResult(res);
        setLoading(false);
      } else {
        setHint(true);
        setTimeout(() => setHint(false), 1500);
      }
    };

    renderer.domElement.addEventListener('click', handleClick);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      cube.rotation.x += 0.005;
      cube.rotation.y += 0.008;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.domElement.removeEventListener('click', handleClick);
      el.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [quest, loading, result]);

  return (
    <div className="max-w-lg w-full mx-auto px-4 py-12">
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <span className="text-xs text-pink-400 uppercase tracking-widest">Quest {quest.step} · 3D 인터랙션</span>
        <h1 className="text-xl font-bold mt-2 mb-1">{quest.name}</h1>
        <p className="text-slate-400 text-sm mb-4">
          회전하는 큐브에서 <span className="text-red-400 font-medium">비밀 면</span>을 찾아 클릭하세요!
          {hint && <span className="text-yellow-400 ml-2">← 다른 면입니다</span>}
        </p>

        {!result?.correct && (
          <div ref={mountRef} className="w-full h-80 rounded-xl overflow-hidden bg-gray-950 cursor-pointer" />
        )}

        {result && <ResultDisplay correct={result.correct} message={result.message} />}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add x402-quests/src/quests/ThreeJsQuest.tsx
git commit -m "feat(quests): add ThreeJsQuest component (Three.js hidden face click)"
```

---

### Task 14: QuestPage router — wires everything together

**Files:**
- Modify: `x402-quests/src/pages/QuestPage.tsx`

- [ ] **Step 1: Create `src/pages/QuestPage.tsx`**

```tsx
// x402-quests/src/pages/QuestPage.tsx
import { useEffect, useState, lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { fetchQuest } from '../api';
import type { QuestData } from '../types';
import TheoryQuiz from '../quests/TheoryQuiz';
import FindClickQuest from '../quests/FindClickQuest';
import StaffCodeQuest from '../quests/StaffCodeQuest';
import FeedbackQuest from '../quests/FeedbackQuest';
import InterestsQuest from '../quests/InterestsQuest';

const ThreeJsQuest = lazy(() => import('../quests/ThreeJsQuest'));

export default function QuestPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const [quest, setQuest] = useState<QuestData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uuid) return;
    fetchQuest(uuid)
      .then(setQuest)
      .catch((e: Error) => setError(e.message));
  }, [uuid]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <p className="text-5xl mb-4">404</p>
        <p className="text-slate-400">{error}</p>
        <p className="text-slate-600 text-sm mt-2">x402로 퀘스트를 구매하면 고유 URL을 받을 수 있습니다</p>
      </div>
    );
  }

  if (!quest) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-500 animate-pulse">퀘스트 로딩 중...</p>
      </div>
    );
  }

  const props = { quest };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {(quest.questType === 'theory-ox' || quest.questType === 'theory-mc') && (
        <TheoryQuiz {...props} />
      )}
      {quest.questType === 'find-click' && <FindClickQuest {...props} />}
      {quest.questType === 'staff-code' && <StaffCodeQuest {...props} />}
      {quest.questType === 'feedback' && <FeedbackQuest {...props} />}
      {quest.questType === 'interests' && <InterestsQuest {...props} />}
      {quest.questType === 'threejs' && (
        <Suspense fallback={<p className="text-slate-500 animate-pulse">3D 로딩 중...</p>}>
          <ThreeJsQuest {...props} />
        </Suspense>
      )}
      {quest.questType === 'drag-drop' && (
        <div className="text-slate-500 text-center p-8">이 퀘스트는 준비 중입니다.</div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add x402-quests/src/pages/QuestPage.tsx
git commit -m "feat(quests): add QuestPage router with lazy-loaded ThreeJsQuest"
```

---

### Task 15: End-to-end smoke test

- [ ] **Step 1: Start x402-server**

```bash
cd x402-server && npm run dev
```

Expected: `x402-server listening on http://localhost:4010`

- [ ] **Step 2: Start x402-quests**

```bash
cd x402-quests && npm run dev
```

Expected: `Local: http://localhost:3000`

- [ ] **Step 3: Test 404 page**

Open `http://localhost:3000/quest/invalid-uuid` in browser.
Expected: 404 message with Korean error text.

- [ ] **Step 4: Test quest-api endpoint with a real UUID**

Manually insert a test token via the server:

```bash
# Create a test token directly in data/questtokens.json
mkdir -p x402-server/data
echo '{"test-uuid-123":{"uuid":"test-uuid-123","productId":"product-a","step":2,"walletAddress":"0x1234","createdAt":"2026-05-15T00:00:00Z"}}' > x402-server/data/questtokens.json
```

```bash
curl http://localhost:4010/quest-api/test-uuid-123
# Expected: { questType: "theory-ox", step: 2, name: "퀘스트 2 — Claude 스킬", theory: "...", question: "...", choices: ["O","X"] }
```

- [ ] **Step 5: Test quest page renders correctly**

Open `http://localhost:3000/quest/test-uuid-123` in browser.
Expected: OX quiz page with theory text, timer bar, and after 10s the O/X buttons appear.

- [ ] **Step 6: Test each quest type** — insert additional test tokens:

```bash
# Quest 4 (find-click)
echo '{"test-uuid-123":{"uuid":"test-uuid-123","productId":"product-a","step":2,"walletAddress":"0x1234","createdAt":"2026-05-15T00:00:00Z"},"test-uuid-4":{"uuid":"test-uuid-4","productId":"product-a","step":4,"walletAddress":"0x1234","createdAt":"2026-05-15T00:00:00Z"},"test-uuid-6":{"uuid":"test-uuid-6","productId":"product-a","step":6,"walletAddress":"0x1234","createdAt":"2026-05-15T00:00:00Z"},"test-uuid-8":{"uuid":"test-uuid-8","productId":"product-a","step":8,"walletAddress":"0x1234","createdAt":"2026-05-15T00:00:00Z"},"test-uuid-9":{"uuid":"test-uuid-9","productId":"product-a","step":9,"walletAddress":"0x1234","createdAt":"2026-05-15T00:00:00Z"},"test-uuid-10":{"uuid":"test-uuid-10","productId":"product-a","step":10,"walletAddress":"0x1234","createdAt":"2026-05-15T00:00:00Z"}}' > x402-server/data/questtokens.json
```

Visit each URL and verify rendering:
- `http://localhost:3000/quest/test-uuid-4` → FindClickQuest (AVAX hunt)
- `http://localhost:3000/quest/test-uuid-6` → StaffCodeQuest (code input)
- `http://localhost:3000/quest/test-uuid-8` → FeedbackQuest (form)
- `http://localhost:3000/quest/test-uuid-9` → ThreeJsQuest (3D cube)
- `http://localhost:3000/quest/test-uuid-10` → InterestsQuest (tags)

- [ ] **Step 7: Add `.env.example` to `.gitignore` exception + clean test data**

```bash
rm x402-server/data/questtokens.json
git add x402-quests/ x402-server/
git commit -m "feat: complete x402-quests frontend - all quest components wired up"
```
