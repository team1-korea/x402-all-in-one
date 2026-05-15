# Workshop Build Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 2026-05-28 밋업을 위한 x402 워크샵 전체 스택 구축 — 서버 변경, 구멍 스킬, 강의 웹페이지, 기틀 문서.

**Architecture:** x402-server(Express/TypeScript)에 토크노믹스 단순화(10 TONE 초기 지급, 퀘스트당 1 TONE 균일), quest10 UUID 흐름, 사용자 상태 인식 서비스 목록을 추가한다. x402-skills/pay/SKILL.md를 구멍 버전으로 교체하고, 발표자용 강의 웹페이지(`lecture/index.html`)를 단일 HTML 파일로 제작한다.

**Tech Stack:** Node.js 22 ESM, Express 4, TypeScript 5, viem 2, node:crypto

---

## 파일 맵

| 파일 | 작업 |
|------|------|
| `x402-server/src/types.ts` | Quest 타입 수정 (reward 제거, isWebQuest 추가) |
| `x402-server/src/db.ts` | purchasedSteps, Quest10Token 스토리지 추가 |
| `x402-server/src/quests.ts` | 가격 1 TONE 균일, reward 제거, quest10 isWebQuest |
| `x402-server/src/routes/users.ts` | 초기 에어드랍 10 TONE |
| `x402-server/src/routes/quest.ts` | airdrop 제거, purchasedSteps 업데이트, quest10 UUID 발급 |
| `x402-server/src/routes/services.ts` | QUESTS 버그 수정, wallet 파라미터, 상태 인식 응답 |
| `x402-server/src/routes/quest10.ts` | 신규: UUID 페이지 + /code 엔드포인트 |
| `x402-server/src/index.ts` | /quest/:uuid 라우트 마운트 |
| `x402-skills/quest/SKILL.md` | register 단계 추가, quest10 가이드 업데이트 |
| `x402-skills/pay/SKILL.md` | 구멍 버전으로 전면 교체 |
| `lecture/index.html` | 신규: 강의용 웹페이지 (사이드바 + 본문) |
| `docs/workshop-2026-05-28.md` | 신규: 기틀 문서 |

---

### Task 1: Quest 타입 수정

**Files:**
- Modify: `x402-server/src/types.ts`

- [ ] **Step 1: Quest 인터페이스에서 `reward`, `secretCode` 제거, `isWebQuest` 추가**

```ts
// x402-server/src/types.ts

export interface Quest {
  id: string;
  name: string;
  description: string;
  price: bigint;
  question: string;
  choices: string[];
  answerIndex: number;
  isWebQuest?: boolean; // true면 UUID URL 방식으로 처리
}

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

- [ ] **Step 2: 타입체크**

```bash
cd x402-server && npx tsc --noEmit 2>&1 | head -30
```

quest10 answerIndex가 -1로 남아있어 에러가 나면 다음 task에서 수정될 예정.

- [ ] **Step 3: Commit**

```bash
git add x402-server/src/types.ts
git commit -m "feat: update Quest type — remove reward/secretCode, add isWebQuest"
```

---

### Task 2: DB 스키마 확장

**Files:**
- Modify: `x402-server/src/db.ts`

- [ ] **Step 1: Quest10Token 타입과 스토리지 추가**

`x402-server/src/db.ts` 전체를 다음으로 교체:

```ts
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data");
const DB_FILE = join(DATA_DIR, "users.json");
const TOKENS_FILE = join(DATA_DIR, "quest10tokens.json");

export interface UserRecord {
  walletAddress: string;
  privateKey: string;
  registeredAt: string;
  initialAirdropTx?: string;
  currentProductId?: string;
  currentStep?: number;
  isCompleted?: boolean;
  purchasedSteps?: number[]; // 결제 성공한 step 번호 목록
}

export interface Quest10Token {
  uuid: string;
  productId: string;
  walletAddress: string;
  answerCode: string; // 6자리 대문자 hex
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

function loadTokens(): Record<string, Quest10Token> {
  if (!existsSync(TOKENS_FILE)) return {};
  return JSON.parse(readFileSync(TOKENS_FILE, "utf8"));
}

function saveTokens(data: Record<string, Quest10Token>) {
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

export function storeQuest10Token(token: Quest10Token): void {
  const tokens = loadTokens();
  tokens[token.uuid] = token;
  saveTokens(tokens);
}

export function getQuest10Token(uuid: string): Quest10Token | undefined {
  return loadTokens()[uuid];
}

export function getQuest10TokenByWallet(
  walletAddress: string,
  productId: string,
): Quest10Token | undefined {
  return Object.values(loadTokens()).find(
    (t) =>
      t.walletAddress.toLowerCase() === walletAddress.toLowerCase() &&
      t.productId === productId,
  );
}
```

- [ ] **Step 2: 타입체크**

```bash
cd x402-server && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add x402-server/src/db.ts
git commit -m "feat: add purchasedSteps and Quest10Token storage to db"
```

---

### Task 3: 퀘스트 데이터 변경

**Files:**
- Modify: `x402-server/src/quests.ts`

- [ ] **Step 1: 가격 1 TONE 균일, reward 제거, quest10 isWebQuest**

```ts
// x402-server/src/quests.ts
import type { Quest } from "./types.js";

const TONE = (n: number) => BigInt(Math.round(n * 1e18));

export const PRODUCT_QUESTS: Record<string, Quest[]> = {
  "product-a": [
    {
      id: "quest-1",
      name: "퀘스트 1 — 시작",
      description: "이벤트에 참여하시겠습니까?",
      price: 0n,
      question: "이벤트에 참여하시겠습니까? (예/아니오)",
      choices: ["예", "아니오"],
      answerIndex: 0,
    },
    {
      id: "quest-2",
      name: "퀘스트 2 — Avalanche L1",
      description: "Avalanche L1 지식 테스트",
      price: TONE(1),
      question: "Avalanche L1(기존 서브넷)은 독립된 가상머신(VM)과 검증인 세트를 가질 수 있습니다. (O/X)",
      choices: ["O", "X"],
      answerIndex: 0,
    },
    {
      id: "quest-3",
      name: "퀘스트 3 — x402 프로토콜",
      description: "x402 프로토콜 지식 테스트",
      price: TONE(1),
      question: "x402 프로토콜은 HTTP 402 Payment Required 상태 코드를 활용하여 온체인 결제와 컨텐츠 접근을 연동합니다. (O/X)",
      choices: ["O", "X"],
      answerIndex: 0,
    },
    {
      id: "quest-4",
      name: "퀘스트 4 — Claude 모델",
      description: "Claude 모델 지식 테스트",
      price: TONE(1),
      question: "다음 중 Anthropic의 Claude 모델 시리즈가 아닌 것은?",
      choices: ["Claude 3 Opus", "Claude 3.5 Sonnet", "Claude 3 Haiku", "Claude 3.5 Pro"],
      answerIndex: 3,
    },
    {
      id: "quest-5",
      name: "퀘스트 5 — Claude System Prompt",
      description: "Claude System Prompt 지식 테스트",
      price: TONE(1),
      question: "Claude의 System Prompt는 대화의 전반적인 규칙과 페르소나를 설정하는 데 사용됩니다. (O/X)",
      choices: ["O", "X"],
      answerIndex: 0,
    },
    {
      id: "quest-6",
      name: "퀘스트 6 — EIP-3009",
      description: "EIP-3009 지식 테스트",
      price: TONE(1),
      question: "EIP-3009는 서명을 통해 가스비 없이 토큰 전송을 승인할 수 있는 표준입니다. (O/X)",
      choices: ["O", "X"],
      answerIndex: 0,
    },
    {
      id: "quest-7",
      name: "퀘스트 7 — LLM Hallucination",
      description: "AI Fluency 지식 테스트",
      price: TONE(1),
      question: "대규모 언어 모델(LLM)이 그럴듯하지만 사실이 아닌 정보를 생성하는 현상을 무엇이라 하나요?",
      choices: ["Hallucination (환각)", "Overfitting (과적합)", "Fine-tuning (미세조정)", "Prompt Injection"],
      answerIndex: 0,
    },
    {
      id: "quest-8",
      name: "퀘스트 8 — Claude Code",
      description: "Claude Code 지식 테스트",
      price: TONE(1),
      question: "Claude Code CLI는 터미널에서 직접 AI와 협업할 수 있는 도구입니다. (O/X)",
      choices: ["O", "X"],
      answerIndex: 0,
    },
    {
      id: "quest-9",
      name: "퀘스트 9 — APIX L1 Chain ID",
      description: "APIX L1 Testnet 지식 테스트",
      price: TONE(1),
      question: "Avalanche APIX L1 Testnet의 체인 ID는 무엇인가요?",
      choices: ["1", "402", "43114", "137"],
      answerIndex: 1,
    },
    {
      id: "quest-10",
      name: "퀘스트 10 — 웹 연동",
      description: "브라우저를 열어 비밀 URL을 방문하고 코드를 찾아오세요.",
      price: TONE(1),
      question: "결제 후 받은 URL을 브라우저에서 방문하세요.",
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
```

- [ ] **Step 2: 타입체크**

```bash
cd x402-server && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add x402-server/src/quests.ts
git commit -m "feat: uniform 1 TONE pricing, remove rewards, quest10 isWebQuest"
```

---

### Task 4: 초기 에어드랍 10 TONE

**Files:**
- Modify: `x402-server/src/routes/users.ts`

- [ ] **Step 1: INITIAL_AIRDROP 변경**

```ts
// x402-server/src/routes/users.ts
import { Router, type Request, type Response } from "express";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { airdrop } from "../airdrop.js";
import { createUser, getUser } from "../db.js";

const router = Router();

// 10 TONE: 9 quests × 1 TONE + 1 TONE 여유
const INITIAL_AIRDROP = 10000000000000000000n; // 10 * 10^18

router.post("/", async (_req: Request, res: Response) => {
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);
  const walletAddress = account.address;

  if (getUser(walletAddress)) {
    res.status(409).json({ error: "이미 등록된 주소입니다" });
    return;
  }

  let airdropTx: string | undefined;
  try {
    airdropTx = await airdrop(walletAddress, INITIAL_AIRDROP);
  } catch (e) {
    console.error("초기 에어드랍 실패:", String(e));
  }

  createUser({
    walletAddress,
    privateKey,
    registeredAt: new Date().toISOString(),
    initialAirdropTx: airdropTx,
  });

  res.json({
    walletAddress,
    privateKey,
    network: `eip155:${process.env.CHAIN_ID || "402"}`,
    initialAirdrop: "10 TONE",
    airdropTx,
    hint: "이 privateKey로 X-PAYMENT 서명을 생성하세요. 안전한 곳에 보관하세요.",
  });
});

export default router;
```

- [ ] **Step 2: 타입체크**

```bash
cd x402-server && npx tsc --noEmit 2>&1 | head -10
```

- [ ] **Step 3: Commit**

```bash
git add x402-server/src/routes/users.ts
git commit -m "feat: increase initial airdrop to 10 TONE"
```

---

### Task 5: quest.ts — airdrop 제거, purchasedSteps 추가, quest10 UUID

**Files:**
- Modify: `x402-server/src/routes/quest.ts`

- [ ] **Step 1: quest.ts 전체 교체**

```ts
// x402-server/src/routes/quest.ts
import { randomBytes, randomUUID } from "node:crypto";
import { Router, type Request, type Response } from "express";
import { getQuest } from "../quests.js";
import { verifyPayment, settlePayment } from "../facilitator.js";
import {
  getUser,
  updateQuestStatus,
  addPurchasedStep,
  storeQuest10Token,
  getQuest10TokenByWallet,
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

  // 무료 퀘스트
  if (quest.price === 0n) {
    res.json({
      id: quest.id,
      name: quest.name,
      question: quest.question,
      choices: quest.choices,
    });
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
      res.status(403).json({
        error: "다른 상품 경로를 진행 중입니다.",
      });
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

  // 결제 성공 — purchasedSteps 기록
  if (payer) {
    addPurchasedStep(payer, productId, parseInt(step, 10));
  }

  res.setHeader("X-PAYMENT-RESPONSE", settleResult.transaction);

  // Quest 10: UUID 발급 후 questUrl 반환
  if (quest.isWebQuest) {
    const API_BASE = process.env.API_BASE_URL || "http://localhost:4010";
    const uuid = randomUUID();
    const answerCode = randomBytes(3).toString("hex").toUpperCase();
    storeQuest10Token({
      uuid,
      productId,
      walletAddress: payer ?? "",
      answerCode,
      createdAt: new Date().toISOString(),
    });
    res.json({
      id: quest.id,
      name: quest.name,
      questUrl: `${API_BASE}/quest/${uuid}`,
      hint: "브라우저를 열어 이 URL을 방문하세요. 페이지에서 클리어 후 코드를 저에게 알려주세요!",
      settleTx: settleResult.transaction,
    });
    return;
  }

  res.json({
    id: quest.id,
    name: quest.name,
    question: quest.question,
    choices: quest.choices,
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

  const { answerIndex, walletAddress, secretCode } = req.body as {
    answerIndex?: number;
    walletAddress?: string;
    secretCode?: string;
  };

  if (!walletAddress) {
    res.status(400).json({ error: "walletAddress가 필요합니다" });
    return;
  }

  // Quest 10 웹 연동형
  if (quest.isWebQuest) {
    if (!secretCode) {
      res.status(400).json({ error: "secretCode가 필요합니다" });
      return;
    }
    const token = getQuest10TokenByWallet(walletAddress, productId);
    if (!token || secretCode !== token.answerCode) {
      res.json({ correct: false, message: "코드가 틀렸습니다. 다시 확인해보세요!" });
      return;
    }
    updateQuestStatus(walletAddress, productId, 10, true);
    res.json({
      correct: true,
      message: "퀘스트 완주! 🎉 상품을 수령하세요.",
    });
    return;
  }

  // 일반 객관식/OX
  if (answerIndex === undefined) {
    res.status(400).json({ error: "answerIndex가 필요합니다" });
    return;
  }
  if (answerIndex !== quest.answerIndex) {
    res.json({ correct: false, message: "틀렸습니다. 다시 시도해보세요!" });
    return;
  }

  const currentStepNum = parseInt(step, 10);
  const isLastStep = currentStepNum === 10;
  updateQuestStatus(walletAddress, productId, currentStepNum, isLastStep);

  res.json({
    correct: true,
    message: "정답입니다!",
    nextQuestHint: isLastStep
      ? "모든 퀘스트를 완료했습니다! 🎉"
      : `다음: /v1/quest/${productId}/${currentStepNum + 1}`,
  });
});

export default router;
```

- [ ] **Step 2: 타입체크**

```bash
cd x402-server && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add x402-server/src/routes/quest.ts
git commit -m "feat: remove per-quest airdrop, add purchasedSteps tracking, quest10 UUID flow"
```

---

### Task 6: services.ts — wallet 파라미터, 상태 인식 응답

**Files:**
- Modify: `x402-server/src/routes/services.ts`

- [ ] **Step 1: services.ts 전체 교체**

```ts
// x402-server/src/routes/services.ts
import { Router, type Request, type Response } from "express";
import { PRODUCT_QUESTS, getAllQuests } from "../quests.js";
import { getUser, getQuest10TokenByWallet } from "../db.js";
import type { UserRecord } from "../db.js";

const router = Router();

type QuestStatus = "cleared" | "purchased" | "available" | "locked";

function getQuestStatus(
  stepNum: number,
  user?: UserRecord,
): QuestStatus {
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
  const API_BASE = process.env.API_BASE_URL || "http://localhost:4010";
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
      status,
      price: q.price === 0n ? "무료" : `1 TONE`,
      endpoint: `${API_BASE}/v1/quest/${productId}/${stepNum}`,
    };

    // cleared/purchased: 문제 내용 포함
    if (status === "cleared" || status === "purchased") {
      const extra: Record<string, unknown> = {
        question: q.question,
        choices: q.choices,
      };
      // quest10: questUrl 포함
      if (q.isWebQuest && user) {
        const token = getQuest10TokenByWallet(user.walletAddress, productId);
        if (token) extra.questUrl = `${API_BASE}/quest/${token.uuid}`;
      }
      return { ...base, ...extra };
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

  res.json({ results: results.map((quest) => ({ id: quest.id, name: quest.name, description: quest.description })) });
});

export default router;
```

- [ ] **Step 2: 타입체크 및 서버 기동 확인**

```bash
cd x402-server && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add x402-server/src/routes/services.ts
git commit -m "feat: wallet-aware services endpoint with per-quest status"
```

---

### Task 7: quest10.ts 신규 라우트

**Files:**
- Create: `x402-server/src/routes/quest10.ts`

- [ ] **Step 1: quest10.ts 작성**

```ts
// x402-server/src/routes/quest10.ts
import { Router, type Request, type Response } from "express";
import { getQuest10Token } from "../db.js";

const router = Router();

// GET /quest/:uuid — quest10 웹 페이지
router.get("/:uuid", (req: Request, res: Response) => {
  const { uuid } = req.params;
  const token = getQuest10Token(uuid);

  if (!token) {
    res.status(404).send(`
      <!DOCTYPE html>
      <html lang="ko">
      <head><meta charset="UTF-8"><title>404</title>
      <style>body{background:#0f1117;color:#64748b;font-family:monospace;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;}</style>
      </head>
      <body><div style="text-align:center"><p style="font-size:48px">404</p><p>유효하지 않은 퀘스트 URL입니다.</p><p style="font-size:12px">x402로 Quest 10을 구매하면 고유 URL을 받을 수 있습니다.</p></div></body>
      </html>
    `);
    return;
  }

  res.send(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Quest 10 — x402 Avalanche Meetup</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          background: #0f1117;
          color: #f1f5f9;
          font-family: 'Courier New', monospace;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .card {
          background: #1e293b;
          border-radius: 12px;
          padding: 40px;
          max-width: 480px;
          width: 100%;
          text-align: center;
        }
        .badge {
          background: #1d4ed8;
          color: #bfdbfe;
          font-size: 11px;
          padding: 4px 12px;
          border-radius: 20px;
          display: inline-block;
          margin-bottom: 20px;
          letter-spacing: 2px;
          text-transform: uppercase;
        }
        h1 { font-size: 22px; margin-bottom: 12px; }
        .desc { color: #94a3b8; font-size: 14px; line-height: 1.6; margin-bottom: 32px; }
        .btn {
          background: #3b82f6;
          color: #fff;
          border: none;
          padding: 14px 32px;
          border-radius: 8px;
          font-size: 15px;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn:hover { background: #2563eb; }
        .btn:disabled { background: #374151; cursor: default; }
        .code-box {
          display: none;
          margin-top: 28px;
          background: #0f1117;
          border: 1px solid #3b82f6;
          border-radius: 8px;
          padding: 20px;
        }
        .code-box.visible { display: block; }
        .code-label { color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
        .code-value { color: #4ade80; font-size: 28px; letter-spacing: 6px; font-weight: bold; }
        .code-hint { color: #64748b; font-size: 12px; margin-top: 10px; }
        .chain-info { margin-top: 32px; color: #475569; font-size: 11px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="badge">Quest 10 · Avalanche x402</div>
        <h1>🔐 최종 퀘스트</h1>
        <p class="desc">
          여기까지 오셨군요!<br>
          아래 버튼을 눌러 클리어 코드를 받고,<br>
          Claude에게 알려주세요.
        </p>
        <button class="btn" id="clearBtn" onclick="clearQuest()">
          퀘스트 클리어!
        </button>
        <div class="code-box" id="codeBox">
          <div class="code-label">클리어 코드</div>
          <div class="code-value" id="codeValue">------</div>
          <div class="code-hint">이 코드를 Claude에게 입력하세요</div>
        </div>
        <div class="chain-info">
          Avalanche APIX L1 · Chain ID 402<br>
          x402 Payment Protocol
        </div>
      </div>
      <script>
        async function clearQuest() {
          const btn = document.getElementById('clearBtn');
          btn.disabled = true;
          btn.textContent = '확인 중...';
          try {
            const res = await fetch('/quest/${uuid}/code');
            const data = await res.json();
            document.getElementById('codeValue').textContent = data.code;
            document.getElementById('codeBox').classList.add('visible');
            btn.textContent = '✓ 클리어 완료';
          } catch (e) {
            btn.disabled = false;
            btn.textContent = '퀘스트 클리어!';
            alert('오류가 발생했습니다. 다시 시도해주세요.');
          }
        }
      </script>
    </body>
    </html>
  `);
});

// GET /quest/:uuid/code — answerCode 반환
router.get("/:uuid/code", (req: Request, res: Response) => {
  const { uuid } = req.params;
  const token = getQuest10Token(uuid);
  if (!token) {
    res.status(404).json({ error: "유효하지 않은 토큰입니다" });
    return;
  }
  res.json({ code: token.answerCode });
});

export default router;
```

- [ ] **Step 2: 타입체크**

```bash
cd x402-server && npx tsc --noEmit 2>&1 | head -10
```

- [ ] **Step 3: Commit**

```bash
git add x402-server/src/routes/quest10.ts
git commit -m "feat: add quest10 UUID page and /code endpoint"
```

---

### Task 8: index.ts에 quest10 라우트 마운트

**Files:**
- Modify: `x402-server/src/index.ts`

- [ ] **Step 1: /quest/:uuid 마운트 추가**

```ts
// x402-server/src/index.ts
import "dotenv/config";
import express from "express";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import servicesRouter from "./routes/services.js";
import questRouter from "./routes/quest.js";
import usersRouter from "./routes/users.js";
import quest10Router from "./routes/quest10.js";

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
app.use("/quest", quest10Router); // quest10 UUID 페이지

const port = Number(process.env.PORT || 4010);
app.listen(port, () => {
  console.log(`x402-server listening on http://localhost:${port}`);
  console.log(`facilitator: ${process.env.FACILITATOR_URL}`);
  console.log(`network: eip155:${process.env.CHAIN_ID || "402"}`);
  console.log(`payTo: ${process.env.PAY_TO}`);
});
```

- [ ] **Step 2: 전체 빌드 확인**

```bash
cd x402-server && npx tsc --noEmit 2>&1
```

에러 없어야 함.

- [ ] **Step 3: Commit**

```bash
git add x402-server/src/index.ts
git commit -m "feat: mount /quest/:uuid route for quest10 page"
```

---

### Task 9: x402-skills/quest/SKILL.md — register 단계 추가

**Files:**
- Modify: `x402-skills/quest/SKILL.md`

- [ ] **Step 1: register 단계 및 quest10 가이드 업데이트**

`x402-skills/quest/SKILL.md` 전체를 다음으로 교체:

```markdown
---
name: x402-quest
description: Avalanche L1 x402 퀘스트를 처음부터 끝까지 진행합니다. 등록부터 결제 호출, 정답 제출, 최종 완주까지 전체 흐름을 안내합니다.
user-invocable: true
disable-model-invocation: false
---

# x402 퀘스트 (Product Quest)

Avalanche L1(Chain ID 402) 위의 x402 퀘스트를 완주하여 상품을 획득합니다.

## 📋 기본 규칙

- **1인 1경로**: 동시에 하나의 상품 경로에만 참여 가능합니다.
- **1인 1상품 제한**: 1개 상품 취득 후 종료됩니다.
- **선점 경쟁**: 누군가 먼저 취득하면 해당 경로는 종료됩니다.

## 🔄 전체 흐름

```
0. 등록       →  POST /v1/register → privateKey + walletAddress + 10 TONE 수령
1. 상품 선택  →  사용 가능한 상품 경로 중 하나를 선택합니다. (productId 획득)
2. 서비스 조회 →  GET /v1/services?productId={productId}&wallet={walletAddress}
3. 퀘스트 접근 →  GET /v1/quest/{productId}/{step} (유료면 402 → X-PAYMENT 헤더로 재요청)
4. 정답 제출  →  POST /v1/quest/{productId}/{step}/answer
5. 완주       →  10개 퀘스트 완료 시 최종 상품 지급
```

## 🌐 네트워크 정보

| 항목        | 값                                            |
|-------------|-----------------------------------------------|
| Chain ID    | 402                                           |
| 네트워크     | Avalanche APIX L1 Testnet                     |
| RPC URL     | https://subnets.avax.network/apix/testnet/rpc |
| Facilitator | https://unloc.kr/facilitator                  |
| API         | http://localhost:4010                         |

## 🚀 시작하기

### 0. 등록 (반드시 먼저!)

```bash
curl -X POST http://localhost:4010/v1/register
```

응답 예시:
```json
{
  "walletAddress": "0x...",
  "privateKey": "0x...",
  "initialAirdrop": "10 TONE"
}
```

**privateKey와 walletAddress를 반드시 저장하세요.** 이후 모든 결제에 사용합니다.

### 1. 서비스 목록 확인

```bash
curl "http://localhost:4010/v1/services?productId=product-a&wallet={walletAddress}"
```

### 2. 퀘스트 1 (무료)

```bash
curl http://localhost:4010/v1/quest/product-a/1
```

### 3. 정답 제출

```bash
curl -X POST http://localhost:4010/v1/quest/product-a/1/answer \
  -H "Content-Type: application/json" \
  -d '{"answerIndex": 0, "walletAddress": "0x..."}'
```

### 4. 퀘스트 2 이상 (유료) — x402 결제 흐름

1. `GET /v1/quest/product-a/2` → HTTP 402 + paymentRequirements 수신
2. `paymentRequirements` 기반으로 X-PAYMENT 헤더 생성 (`x402-pay` 스킬 참고)
3. `GET /v1/quest/product-a/2` + `X-PAYMENT` 헤더로 재요청 → 문제 수신
4. `POST /v1/quest/product-a/2/answer` 로 정답 제출

### 5. 퀘스트 10 (웹 연동형)

1. x402 결제 후 응답에서 `questUrl` 수령
2. 사용자에게 안내:
   > "브라우저를 열어 이 URL을 방문하세요: {questUrl}"
   > "페이지에서 '퀘스트 클리어!' 버튼을 누르면 코드가 나옵니다. 코드를 저에게 알려주세요!"
3. 사용자가 코드를 전달하면 정답 제출:

```bash
curl -X POST http://localhost:4010/v1/quest/product-a/10/answer \
  -H "Content-Type: application/json" \
  -d '{"secretCode": "{사용자가_전달한_코드}", "walletAddress": "0x..."}'
```

## 🤖 에이전트 행동 지침

1. 퀘스트 시작 전 반드시 `POST /v1/register` 호출 확인 (walletAddress, privateKey 보유 여부)
2. `GET /v1/services` 로 현재 상태 확인 후 진행 가능한 퀘스트 파악
3. 유료 퀘스트는 `x402-pay` 스킬로 결제 처리
4. 퀘스트 10 도달 시 `questUrl` 을 사용자에게 전달하고 코드를 기다림
```

- [ ] **Step 2: Commit**

```bash
git add x402-skills/quest/SKILL.md
git commit -m "feat: add register step and update quest10 guide in quest skill"
```

---

### Task 10: x402-skills/pay/SKILL.md — 구멍 버전

**Files:**
- Modify: `x402-skills/pay/SKILL.md`

- [ ] **Step 1: 구멍 버전으로 전면 교체**

```markdown
---
name: x402-pay
description: x402 엔드포인트의 결제 요건을 확인하고 TONE 토큰(EIP-3009)으로 결제하여 유료 API를 호출합니다.
user-invocable: true
disable-model-invocation: false
---

# x402 결제 방법

## 네트워크 정보 (고정값 — 수정 금지)

| 항목            | 값                                                         |
|-----------------|-------------------------------------------------------------|
| Chain ID        | 402                                                         |
| RPC URL         | https://subnets.avax.network/apix/testnet/rpc               |
| Facilitator     | https://unloc.kr/facilitator                                |
| TONE 토큰       | 0x6ac929821e85970910f5dbafaee81823d71b17f3                  |
| EIP-712 name    | TONE                                                        |
| EIP-712 version | 1                                                           |
| x402Version     | 2 (paymentPayload에 반드시 2 사용)                          |

## 결제 페이로드 구조 (고정값 — 수정 금지)

```json
{
  "x402Version": 2,
  "resource": {
    "url": "<요청 URL>",
    "description": "<설명>",
    "mimeType": "application/json"
  },
  "accepted": {
    "scheme": "exact",
    "network": "eip155:402",
    "asset": "<TONE 토큰 주소>",
    "amount": "<wei 단위 금액 문자열>",
    "payTo": "<수신 지갑 주소>",
    "maxTimeoutSeconds": 60,
    "extra": { "assetTransferMethod": "eip3009", "name": "TONE", "version": "1" }
  },
  "payload": {
    "signature": "<EIP-712 서명>",
    "authorization": {
      "from": "<내 지갑>",
      "to": "<수신 지갑>",
      "value": "<금액 문자열 (BigInt 아님)>",
      "validAfter": "0",
      "validBefore": "<Unix timestamp 문자열>",
      "nonce": "<0x + 32바이트 hex>"
    }
  }
}
```

전체 paymentPayload를 **base64로 인코딩**하여 `X-PAYMENT` 헤더에 담는다.

---

## 전체 흐름 — 빈칸을 채워주세요

아래 흐름에서 `[TODO: ...]` 부분을 자연어로 채워주세요.
아이폰을 사러 애플스토어에 가는 것처럼 생각하면 됩니다.

---

**1단계.** 유료 엔드포인트에 X-PAYMENT 없이 GET 요청을 보낸다.

**2단계.** 서버가 HTTP `[TODO: 몇 번 응답을 돌려보내나요?]` 로 응답한다.  
응답 본문의 `accepts[0]` 에는 `[TODO: 어떤 정보들이 들어있나요? (어느 체인인지, 얼마인지, 어느 지갑으로 보내야 하는지)]` 가 담겨있다.

**3단계.** 그 정보를 꺼내 EIP-3009 `TransferWithAuthorization` 서명을 만든다.  
`authorization` 메시지에는:
- `from`: 내 지갑 주소
- `to`: `[TODO: 받는 지갑 주소는 응답의 어느 필드에서 가져오나요?]`
- `value`: `[TODO: 금액은 응답의 어느 필드에서 가져오나요?]` (BigInt로 변환)
- `validAfter`: `0`
- `validBefore`: `[TODO: 이 서명이 언제까지 유효해야 하나요?]` (Unix timestamp)
- `nonce`: `0x` + 32바이트 랜덤 hex (`randomBytes(32).toString('hex')`)

viem의 `account.signTypedData()` 로 서명한다.

**4단계.** `authorization.value` 를 **문자열로 변환**한 뒤 paymentPayload를 조립한다.  
전체를 `[TODO: 어떤 인코딩 방식으로 변환해야 하나요?]` 하여 `X-PAYMENT` 헤더에 담는다.

**5단계.** `[TODO: 어떤 HTTP 메서드로]` 같은 URL로 `X-PAYMENT` 헤더를 포함해 다시 요청한다.

**6단계.** 서버는 요청을 `[TODO: 누구에게 넘겨서 검증하나요?]` 에게 전달하여 검증을 맡긴다.

**7단계.** 검증과 정산이 완료되면 서버가 `[TODO: 최종적으로 우리에게 무엇을 돌려주나요?]` 를 응답으로 준다.

---

## 구현 코드 스켈레톤 (viem)

```js
import { privateKeyToAccount } from 'viem/accounts';
import { randomBytes } from 'crypto';

const account = privateKeyToAccount('<등록 시 받은 privateKey>');

// 1단계: 유료 엔드포인트 호출
const firstRes = await fetch('<URL>');
// 위 흐름 2단계에 따라 응답 처리 ...

const { accepts } = await firstRes.json();
const req = accepts[0];

const now = Math.floor(Date.now() / 1000);
const nonce = '0x' + randomBytes(32).toString('hex');

// 위 흐름 3단계에 따라 서명 생성 ...
const domain = {
  name: 'TONE', version: '1', chainId: 402,
  verifyingContract: req.asset,
};
const types = {
  TransferWithAuthorization: [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'validAfter', type: 'uint256' },
    { name: 'validBefore', type: 'uint256' },
    { name: 'nonce', type: 'bytes32' },
  ],
};
const message = {
  from: account.address,
  to: /* 흐름 3단계 참고 */,
  value: BigInt(/* 흐름 3단계 참고 */),
  validAfter: 0n,
  validBefore: BigInt(/* 흐름 3단계 참고 */),
  nonce,
};
const signature = await account.signTypedData({ domain, types, primaryType: 'TransferWithAuthorization', message });

// 위 흐름 4단계에 따라 paymentPayload 조립 후 인코딩 ...
const paymentPayload = {
  x402Version: 2,
  resource: { url: '<URL>', description: 'Quest access', mimeType: 'application/json' },
  accepted: req,
  payload: {
    signature,
    authorization: {
      from: account.address,
      to: /* 흐름 3단계 참고 */,
      value: String(BigInt(/* 흐름 3단계 참고 */)),
      validAfter: '0',
      validBefore: String(/* 흐름 3단계 참고 */),
      nonce,
    },
  },
};
const xPayment = Buffer.from(JSON.stringify(paymentPayload)).toString('base64');

// 위 흐름 5단계에 따라 재요청 ...
const finalRes = await fetch('<URL>', { headers: { 'X-PAYMENT': xPayment } });
const data = await finalRes.json();
```
```

- [ ] **Step 2: Commit**

```bash
git add x402-skills/pay/SKILL.md
git commit -m "feat: replace pay skill with holes version for workshop"
```

---

### Task 11: lecture/index.html — 강의 웹페이지

**Files:**
- Create: `lecture/index.html`

- [ ] **Step 1: lecture 디렉토리 생성 및 HTML 작성**

```bash
mkdir -p /Users/viviviviviid/Desktop/project/avalanche_team1/x402-all-in-one/lecture
```

`lecture/index.html` 을 다음 내용으로 작성 (단일 파일, 외부 의존성 없음):

```html
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>금쪽같은 내 클로드의 첫 결제 — x402 워크샵</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0f1117;color:#f1f5f9;font-family:'Courier New',monospace;display:flex;min-height:100vh}
/* 사이드바 */
nav{width:220px;min-height:100vh;background:#080c12;border-right:1px solid #1e293b;padding:24px 0;position:fixed;top:0;left:0;overflow-y:auto}
nav .logo{color:#3b82f6;font-size:13px;padding:0 20px 20px;border-bottom:1px solid #1e293b;margin-bottom:16px;line-height:1.5}
nav a{display:block;padding:8px 20px;color:#64748b;font-size:12px;text-decoration:none;border-left:2px solid transparent;transition:all .15s}
nav a:hover{color:#94a3b8;background:#0f1117}
nav a.active{color:#3b82f6;border-left-color:#3b82f6;background:#0f1929}
nav .section-num{color:#1e293b;margin-right:6px}
/* 본문 */
main{margin-left:220px;padding:48px 56px;max-width:860px;width:100%}
section{margin-bottom:80px;scroll-margin-top:32px}
h2{font-size:22px;color:#f1f5f9;margin-bottom:6px}
.section-tag{font-size:10px;color:#3b82f6;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px}
p{color:#94a3b8;font-size:14px;line-height:1.8;margin-bottom:12px}
h3{color:#e2e8f0;font-size:15px;margin:20px 0 8px}
pre{background:#1e293b;border-radius:6px;padding:16px;font-size:12px;color:#4ade80;overflow-x:auto;margin:12px 0}
code{background:#1e293b;padding:2px 6px;border-radius:3px;color:#60a5fa;font-size:12px}
.highlight{background:#1d3a5f;border-left:3px solid #3b82f6;padding:12px 16px;border-radius:0 6px 6px 0;margin:12px 0;font-size:13px;color:#bfdbfe}
table{width:100%;border-collapse:collapse;font-size:12px;margin:16px 0}
th{background:#1e293b;color:#94a3b8;padding:8px 12px;text-align:left}
td{border-top:1px solid #1e293b;padding:8px 12px;color:#cbd5e1}
.todo-box{background:#2d1b4e;border:1px dashed #7c3aed;border-radius:6px;padding:12px 16px;margin:8px 0;color:#c4b5fd;font-size:13px}
.tag{display:inline-block;padding:2px 8px;border-radius:12px;font-size:10px;margin-left:6px;vertical-align:middle}
.tag.lab{background:#14532d;color:#4ade80}
.tag.go{background:#064e3b;color:#6ee7b7}
.flow-row{display:flex;align-items:flex-start;gap:16px;margin:10px 0}
.flow-num{background:#1d4ed8;color:#bfdbfe;min-width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0;margin-top:2px}
.flow-text{color:#cbd5e1;font-size:13px;line-height:1.7}
.iphone{background:#1e293b;border-radius:8px;padding:16px;margin:8px 0}
.iphone-row{display:grid;grid-template-columns:1fr 24px 1fr;gap:8px;align-items:center;margin:6px 0;font-size:12px}
.iphone-left{color:#94a3b8}
.iphone-arrow{color:#3b82f6;text-align:center}
.iphone-right{color:#60a5fa}
hr{border:none;border-top:1px solid #1e293b;margin:32px 0}
</style>
</head>
<body>

<nav>
  <div class="logo">🔺 x402 Meetup<br>2026.05.28</div>
  <a href="#s01" class="active"><span class="section-num">01</span>오늘 할 것들</a>
  <a href="#s02"><span class="section-num">02</span>Claude Skills</a>
  <a href="#s03"><span class="section-num">03</span>스킬 설치</a>
  <a href="#s04"><span class="section-num">04</span>스킬 살펴보기</a>
  <a href="#s05"><span class="section-num">05</span>x402 원리</a>
  <a href="#s06"><span class="section-num">06</span>구멍 채우기 <span class="tag lab">실습</span></a>
  <a href="#s07"><span class="section-num">07</span>퀘스트 마라톤 <span class="tag go">GO</span></a>
  <a href="#s08"><span class="section-num">08</span>보너스</a>
</nav>

<main>

<section id="s01">
  <div class="section-tag">01 · Intro</div>
  <h2>오늘 할 것들</h2>
  <p>Claude가 직접 돈을 내고 서비스를 사오는 구조를 만들어봅니다.<br>x402 결제 프로토콜을 Claude Skills로 구현하고, 10개 퀘스트를 클리어하세요.</p>
  <div class="highlight">🎯 목표: 오늘 자리를 뜨면 "AI 에이전트가 내 플랫폼에 찾아와서 뭔가를 구매해갈 수 있다"는 감각을 가져가세요.</div>
  <h3>타임라인</h3>
  <table>
    <tr><th>시간</th><th>내용</th></tr>
    <tr><td>7:50 – 8:10</td><td>Claude Skills 소개 + 스킬 설치 + 구멍 채우기</td></tr>
    <tr><td>8:10 – 8:40</td><td>퀘스트 마라톤 (실시간 순위)</td></tr>
    <tr><td>8:40 – 9:00</td><td>네트워킹</td></tr>
  </table>
</section>

<section id="s02">
  <div class="section-tag">02 · Claude Skills</div>
  <h2>Claude Skills란?</h2>
  <p>Claude Code에서 <code>/</code> 를 입력하면 나오는 슬래시 명령어입니다. <code>.md</code> 파일 하나로 Claude에게 새로운 능력을 부여합니다.</p>
  <h3>스킬 목록 확인</h3>
  <pre>Claude Code에서: /    ← 슬래시만 입력하면 목록이 보입니다</pre>
  <h3>스킬 파일 구조</h3>
  <pre>---
name: x402-pay
description: x402 결제를 수행합니다.
---

# 결제 방법

1단계: 유료 엔드포인트에 GET 요청을 보낸다.
2단계: 402 응답을 받는다.
...</pre>
  <p>Claude는 이 <code>.md</code> 파일을 읽고 거기 적힌 지시대로 코드를 작성해 실행합니다.</p>
</section>

<section id="s03">
  <div class="section-tag">03 · Install</div>
  <h2>스킬 설치</h2>
  <h3>터미널에서 실행</h3>
  <pre>npx x402-meetup --url=https://api.x402-meetup.example.com</pre>
  <h3>설치 확인 (Claude Code에서)</h3>
  <pre>/    ← x402-pay, x402-discover, x402-quest 가 목록에 보이면 OK</pre>
  <div class="highlight">⚠ VSCode 없으신 분: <a href="https://vscode.dev" style="color:#60a5fa">vscode.dev</a> 또는 메모장으로도 됩니다.</div>
  <h3>스킬 파일 위치</h3>
  <pre>~/.claude/plugins/  또는
~/.claude/skills/</pre>
</section>

<section id="s04">
  <div class="section-tag">04 · Explore</div>
  <h2>스킬 살펴보기</h2>
  <p>설치된 <code>x402-pay/SKILL.md</code> 파일을 에디터로 열어보세요.</p>
  <p>흐름 설명 부분에 이런 빈칸들이 보일 거에요:</p>
  <div class="todo-box">[TODO: 몇 번 응답을 돌려보내나요?]</div>
  <div class="todo-box">[TODO: 받는 지갑 주소는 응답의 어느 필드에서 가져오나요?]</div>
  <p>이 빈칸들이 채워져야 Claude가 실제로 결제를 할 수 있습니다.<br>다음 섹션에서 x402 원리를 배우고 나서 채워봅시다.</p>
</section>

<section id="s05">
  <div class="section-tag">05 · Theory</div>
  <h2>x402 원리</h2>
  <h3>📱 아이폰 사러 애플스토어 가기</h3>
  <div class="flow-row"><div class="flow-num">1</div><div class="flow-text">아 아이폰 사고 싶다! → 필요한 게 생겼다</div></div>
  <div class="flow-row"><div class="flow-num">2</div><div class="flow-text">애플스토어 사이트에 접속 → 어디서 살 수 있는지 확인</div></div>
  <div class="flow-row"><div class="flow-num">3</div><div class="flow-text">가까운 오프라인 매장 찾기 → 목록에서 원하는 것 찾기</div></div>
  <div class="flow-row"><div class="flow-num">4</div><div class="flow-text">매장에 가서 "아이폰 13 주세요" → 원하는 것을 요청</div></div>
  <div class="flow-row"><div class="flow-num">5</div><div class="flow-text">"결제해주세요" → <strong style="color:#fbbf24">402 응답: 얼마를, 어디로, 언제까지</strong></div></div>
  <div class="flow-row"><div class="flow-num">6</div><div class="flow-text">카드 꽂기 → 서명 생성 + X-PAYMENT 헤더에 담아 재요청</div></div>
  <div class="flow-row"><div class="flow-num">7</div><div class="flow-text">카드사 승인 → facilitator가 서명/잔액 검증 + 블록체인 정산</div></div>
  <div class="flow-row"><div class="flow-num">8</div><div class="flow-text">아이폰 수령 → 요청한 서비스/퀘스트 응답 수신</div></div>

  <hr>

  <h3>x402 대응표</h3>
  <div class="iphone">
    <div class="iphone-row"><div class="iphone-left">아이폰 사고 싶다</div><div class="iphone-arrow">↔</div><div class="iphone-right">필요한 서비스 발견</div></div>
    <div class="iphone-row"><div class="iphone-left">애플스토어 접속</div><div class="iphone-arrow">↔</div><div class="iphone-right">GET /llms.txt → /v1/services</div></div>
    <div class="iphone-row"><div class="iphone-left">"아이폰 13 주세요"</div><div class="iphone-arrow">↔</div><div class="iphone-right">GET /v1/quest/{productId}/{step}</div></div>
    <div class="iphone-row"><div class="iphone-left">결제 필요 안내</div><div class="iphone-arrow">↔</div><div class="iphone-right"><strong>HTTP 402</strong> + accepts[0] (체인/금액/수신자)</div></div>
    <div class="iphone-row"><div class="iphone-left">카드 꽂기</div><div class="iphone-arrow">↔</div><div class="iphone-right">EIP-3009 서명 → X-PAYMENT 헤더 재요청</div></div>
    <div class="iphone-row"><div class="iphone-left">카드사 승인</div><div class="iphone-arrow">↔</div><div class="iphone-right">facilitator: 검증 + 온체인 정산</div></div>
    <div class="iphone-row"><div class="iphone-left">아이폰 수령</div><div class="iphone-arrow">↔</div><div class="iphone-right">퀘스트 문제 응답</div></div>
  </div>

  <div class="highlight">핵심: x402는 HTTP 표준 위에서 동작하는 결제 프로토콜입니다. 어떤 언어, 어떤 프레임워크로도 구현할 수 있습니다.</div>
</section>

<section id="s06">
  <div class="section-tag">06 · Lab <span class="tag lab">실습</span></div>
  <h2>구멍 채우기</h2>
  <p><code>x402-pay/SKILL.md</code>를 에디터로 열고, 아래 힌트를 참고해서 <code>[TODO: ...]</code> 부분을 채워주세요.</p>
  <table>
    <tr><th>#</th><th>구멍 질문</th><th>힌트</th></tr>
    <tr><td>①</td><td>몇 번 응답?</td><td>HTTP 상태 코드 — 이 프로토콜의 이름이기도 함</td></tr>
    <tr><td>②</td><td>응답에 뭐가 있나?</td><td>아이폰 비유의 "가격표 + 어느 지갑으로"</td></tr>
    <tr><td>③</td><td>to 필드?</td><td><code>accepts[0]</code>의 수신자 주소 필드명</td></tr>
    <tr><td>④</td><td>value 필드?</td><td><code>accepts[0]</code>의 금액 필드명</td></tr>
    <tr><td>⑤</td><td>validBefore?</td><td>지금 + maxTimeoutSeconds초</td></tr>
    <tr><td>⑥</td><td>어떻게 인코딩?</td><td>JSON → 바이너리 → 텍스트로 변환하는 방법</td></tr>
    <tr><td>⑦</td><td>누가 검증?</td><td>네트워크 정보 테이블에 있음</td></tr>
  </table>
  <div class="highlight">정확한 답이 아니어도 됩니다. 비슷한 의미면 Claude가 알아서 해석합니다.</div>
  <h3>채운 다음: Claude에서 테스트</h3>
  <pre>/x402-pay   ← 슬래시 명령어 실행</pre>
</section>

<section id="s07">
  <div class="section-tag">07 · Marathon <span class="tag go">GO</span></div>
  <h2>퀘스트 마라톤</h2>
  <p>10개 퀘스트를 가장 빨리 완료한 Top 3에게 특별한 선물을 드립니다!</p>
  <h3>시작하기</h3>
  <pre>Claude Code에서:

/x402-quest</pre>
  <h3>퀘스트 구성</h3>
  <table>
    <tr><th>퀘스트</th><th>가격</th><th>유형</th></tr>
    <tr><td>1</td><td>무료</td><td>시작</td></tr>
    <tr><td>2~9</td><td>1 TONE 각</td><td>OX / 객관식</td></tr>
    <tr><td>10</td><td>1 TONE</td><td>웹 연동 (브라우저 방문)</td></tr>
  </table>
  <div class="highlight">💡 초기 지급: 10 TONE. 9개 유료 퀘스트 = 9 TONE 소비. 1 TONE 남음.</div>
  <h3>실시간 순위</h3>
  <pre>http://[서버주소]/leaderboard   ← 발표 화면에서 보여드립니다</pre>
</section>

<section id="s08">
  <div class="section-tag">08 · Bonus</div>
  <h2>보너스 — 내 서비스를 x402로 등록하기</h2>
  <p>오늘 경험한 x402 프로토콜을 여러분의 서비스에도 붙일 수 있습니다.<br>AI 에이전트가 여러분의 플랫폼에 찾아와 구매해가는 구조를 만들 수 있습니다.</p>
  <h3>agentic.market 등록</h3>
  <pre>https://agentic.market/register</pre>
  <p>등록하면 AI 에이전트들이 탐색하는 마켓에 여러분의 서비스가 올라갑니다.</p>
  <div class="highlight">오늘 사용한 x402-server 코드가 그대로 x402 서버 구현 템플릿이 됩니다.<br>GitHub: <a href="https://github.com/avalanche-team1/x402-all-in-one" style="color:#60a5fa">avalanche-team1/x402-all-in-one</a></div>
</section>

</main>

<script>
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('nav a');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(a => a.classList.remove('active'));
      const active = document.querySelector(`nav a[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { threshold: 0.3 });
sections.forEach(s => observer.observe(s));
</script>
</body>
</html>
```

- [ ] **Step 2: 브라우저에서 열어서 확인**

```bash
open lecture/index.html
```

8개 섹션이 사이드바와 함께 표시되는지 확인.

- [ ] **Step 3: Commit**

```bash
git add lecture/index.html
git commit -m "feat: add lecture web page (sidebar layout, 8 sections)"
```

---

### Task 12: docs/workshop-2026-05-28.md — 기틀 문서

**Files:**
- Create: `docs/workshop-2026-05-28.md`

- [ ] **Step 1: 기틀 문서 작성**

```markdown
# 워크샵 기틀 문서 — 2026-05-28

> 실습 세션 발표자용. 발표 흐름, 대사 초안, 기술 레퍼런스를 하나로 묶음.

## 발표 요약

- **제목**: 금쪽같은 내 클로드의 첫 결제 (feat. x402)
- **일시**: 2026-05-28 (목) 19:00 – 21:00
- **장소**: 위워크 신논현점 6층
- **내 파트**: 실습 세션 (7:50 – 8:40)

---

## 발표 흐름 + 대사 초안

### [01] 오늘 할 것들 (2분)

> "방금 이론으로 배웠던 x402를 Claude 스킬로 만들어서, 여러분의 Claude가 결제를 하고 돌아다닐 수 있는 상태로 만들 거에요. 뭔가를 사오기도 할 거고요. 이 흐름을 알게 된다면, 추후 여러분들이 만든 플랫폼에도 AI가 접근해서 뭔가를 구매해갈 수 있는 구조도 만들 수 있습니다."

### [02] Claude Skills (3분)

> "Claude 스킬 여러분들도 아시겠지만 — Claude Code에서 슬래시를 입력하면 나오는 명령어입니다. .md 파일 하나로 Claude에게 새로운 능력을 부여할 수 있어요. 오늘 우리는 이걸 x402 결제에 쓸 거에요."

### [03] 스킬 설치 (3분)

> "자 화면에 명령어가 있습니다. 터미널에서 실행해주세요. 그리고 Claude 켜셔서 슬래시 입력하면 x402-pay, x402-discover, x402-quest 세 개가 목록에 보여야 해요. 없다면 스킬이 어디에 설치됐는지 같이 확인해봅시다."

### [04] 스킬 살펴보기 (3분)

> "자 설치된 x402-pay/SKILL.md 파일을 에디터로 열어보세요. 보면 흐름 설명 부분에 TODO 빈칸들이 있을 거에요. 이게 구멍입니다. 이걸 채워야 Claude가 실제로 결제를 할 수 있어요."

### [05] x402 원리 (10분)

> "자 제가 주식을 샀는데, 안타깝게도 삼성과 하이닉스만 빼고 사서... (이하 아이폰 비유 전개)"
>
> "이 흐름이랑 x402랑 거의 똑같아요. 화면 봐주세요."
>
> (대응표 설명)
>
> "핵심은 HTTP 402 응답이에요. 서버가 '돈 내야 해, 어디로, 얼마, 언제까지'를 알려주는 거죠. Claude가 그걸 읽고 서명을 만들어서 다시 요청하면 서비스를 받을 수 있어요."

### [06] 구멍 채우기 (15분)

> "자 이제 여러분들이 아까 봤던 이론을 바로 여기에 적용해봅시다. 정확한 답이 아니어도 돼요. 비슷한 의미면 Claude가 알아서 해석합니다."
>
> (힌트 테이블 보여주며 진행, 5분 후)
>
> "자 완성하셨으면 /x402-pay 해보세요. 동작하면 성공입니다!"

### [07] 퀘스트 마라톤 (30분)

> "자 여러분은 이제 방금 완성한 x402 스킬로 저희가 준비한 퀘스트를 사오게 만들 겁니다. 총 10개 퀘스트, 실시간으로 여러분 순위가 이 화면에 보여질 거에요. 상위 3명에게는 특별한 선물을! 자 시작해볼까요."

---

## 기술 상수

| 항목 | 값 |
|------|----|
| Chain ID | 402 |
| Network | Avalanche APIX L1 Testnet |
| RPC URL | https://subnets.avax.network/apix/testnet/rpc |
| Facilitator | https://unloc.kr/facilitator |
| TONE Token | 0x6ac929821e85970910f5dbafaee81823d71b17f3 |
| API Base | http://[배포 주소]:4010 |
| 초기 에어드랍 | 10 TONE |
| 퀘스트당 가격 | 1 TONE |

## 구멍 7개 정답 레퍼런스

| # | 질문 | 모범 답안 |
|---|------|-----------|
| ① | 몇 번 응답? | "402 응답을 받는다" |
| ② | 응답에 뭐가 있나? | "어느 체인, 얼마, 어느 지갑으로 보낼지" |
| ③ | to 필드? | "받는 지갑 주소 (payTo)" |
| ④ | value 필드? | "요청한 금액 그대로 (amount)" |
| ⑤ | validBefore? | "지금 + 60초" |
| ⑥ | 인코딩? | "base64로 인코딩" |
| ⑦ | 누가 검증? | "facilitator" |

## 당일 운영 체크리스트

- [ ] x402-server 배포 확인 (`GET /health`)
- [ ] x402-facilitator 연결 확인
- [ ] TONE 토큰 잔액 충분 (참가자 수 × 10 TONE)
- [ ] 강의 웹페이지 열기 (`lecture/index.html`)
- [ ] 순위판 URL 확인
- [ ] npm 패키지 배포 확인 (`npx x402-meetup --version`)
```

- [ ] **Step 2: Commit**

```bash
git add docs/workshop-2026-05-28.md
git commit -m "docs: add workshop foundation document"
```

---

## Self-Review

**스펙 커버리지 확인:**
- [x] 토크노믹스 단순화 (Task 3, 4)
- [x] Quest 10 UUID 흐름 (Task 5, 7, 8)
- [x] services.ts wallet 파라미터 + 상태별 응답 (Task 6)
- [x] purchasedSteps 추적 (Task 2, 5)
- [x] register 단계 스킬 추가 (Task 9)
- [x] pay 스킬 구멍 버전 (Task 10)
- [x] 강의 웹페이지 8개 섹션 (Task 11)
- [x] 기틀 문서 (Task 12)
- [x] services.ts QUESTS 버그 수정 (Task 6)

**플레이스홀더 없음 확인:** 모든 task에 실제 코드 포함됨.

**타입 일관성:**
- `Quest.isWebQuest?: boolean` — Task 1에서 정의, Task 3(quests.ts), Task 5(quest.ts)에서 사용
- `UserRecord.purchasedSteps?: number[]` — Task 2에서 정의, Task 5에서 `addPurchasedStep` 호출
- `Quest10Token` — Task 2에서 정의, Task 5에서 `storeQuest10Token`, Task 7에서 `getQuest10Token` 사용
- `addPurchasedStep(walletAddress, productId, step)` — Task 2 정의, Task 5 사용 ✓
