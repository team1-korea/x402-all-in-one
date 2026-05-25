import { randomUUID } from "node:crypto";
import { Router, type Request, type Response } from "express";
import { getQuest, getAllQuests } from "../quests.js";
import { verifyPayment, settlePayment } from "../facilitator.js";
import { marathonState } from "./marathon.js";
import {
  getUser,
  updateQuestStatus,
  addPurchasedStep,
  storeQuestToken,
  recordAnswer,
  recordFeedback,
  recordInterests,
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
  const API_BASE = process.env.API_BASE_URL || "http://localhost:40210";
  return {
    scheme: "exact",
    network: `eip155:${process.env.CHAIN_ID || "402"}`,
    asset: process.env.PAYMENT_TOKEN!,
    amount: price.toString(),
    payTo: process.env.PAY_TO!,
    maxTimeoutSeconds: 60,
    resource: `${API_BASE}/v1/quest/${productId}/${step}`,
    description: `Quest ${productId}/${step} access payment`,
    mimeType: "application/json",
    extra: {
      assetTransferMethod: "eip3009",
      name: process.env.TOKEN_NAME || "USDC",
      version: process.env.TOKEN_VERSION || "2",
    },
  };
}

// GET /v1/quest/:productId — 퀘스트 목록 + 난이도
router.get("/:productId", (req: Request, res: Response) => {
  const { productId } = req.params;
  const quests = getAllQuests(productId);
  if (!quests) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(
    quests.map((q) => ({
      id: q.id,
      name: q.name,
      description: q.description,
      price: q.price.toString(),
      questType: q.questType,
      difficulty: q.difficulty,
      ...(q.entryPoint && { entryPoint: true }),
    }))
  );
});

// GET /v1/quest/:productId/:step
router.get("/:productId/:step", async (req: Request, res: Response) => {
  const { productId, step } = req.params;
  const quest = getQuest(productId, step);

  if (!quest) {
    res.status(404).json({ error: "Quest not found" });
    return;
  }

  if (!quest.entryPoint && !marathonState.started) {
    res.status(403).json({ error: "마라톤이 아직 시작되지 않았습니다" });
    return;
  }

  // 무료 퀘스트
  if (quest.price === 0n) {
    res.json({ id: quest.id, name: quest.name, questType: quest.questType });
    return;
  }

  const paymentHeader = req.headers["x-payment"] as string | undefined;

  if (!paymentHeader) {
    const requirements = buildPaymentRequirements(productId, step, quest.price);
    const body: X402Response & { difficulty: string } = {
      x402Version: 2,
      accepts: [requirements],
      error: "결제가 필요합니다",
      difficulty: quest.difficulty,
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
    const user = await getUser(payer);
    const currentStepNum = parseInt(step, 10);

    if (!user) {
      res.status(403).json({
        error: "등록되지 않은 사용자입니다. POST /v1/register 로 먼저 등록하세요.",
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
    await addPurchasedStep(payer, productId, currentStepNum);
  }

  res.setHeader("X-PAYMENT-RESPONSE", settleResult.transaction);

  // All paid quests: issue UUID and return questUrl
  const QUEST_BASE = process.env.QUEST_BASE_URL || "http://localhost:3000";
  const uuid = randomUUID();
  await storeQuestToken({
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
    difficulty: quest.difficulty,
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
    answers,
    walletAddress,
    secretCode,
    feedback,
    interests,
  } = req.body as {
    answers?: number[];
    walletAddress?: string;
    secretCode?: string;
    feedback?: { good: string; bad: string; next: string };
    interests?: { nickname: string; interest: string }[];
  };

  if (!walletAddress) {
    res.status(400).json({ error: "walletAddress가 필요합니다" });
    return;
  }

  const currentStepNum = parseInt(step, 10);
  const isLastStep = currentStepNum === 10;

  if (quest.questType === "theory-ox" || quest.questType === "theory-mc") {
    if (!answers || !quest.questions || answers.length !== quest.questions.length) {
      res.status(400).json({
        error: `answers 배열이 필요합니다 (${quest.questions?.length ?? 1}개 항목)`,
      });
      return;
    }

    const allCorrect = quest.questions.every((q, i) => answers[i] === q.answerIndex);
    await recordAnswer(walletAddress, productId, currentStepNum, quest.questType, answers, allCorrect);

    if (!allCorrect) {
      res.json({ correct: false, message: "틀렸습니다. 다시 시도해보세요!" });
      return;
    }

    await updateQuestStatus(walletAddress, productId, currentStepNum, isLastStep);
    res.json({ correct: true, message: "정답입니다! 🎉" });
    return;
  }

  if (quest.questType === "staff-code") {
    if (!secretCode) {
      res.status(400).json({ error: "secretCode가 필요합니다" });
      return;
    }
    const correct = secretCode === quest.staffCode;
    await recordAnswer(walletAddress, productId, currentStepNum, quest.questType, { secretCode }, correct);
    if (!correct) {
      res.json({ correct: false, message: "코드가 틀렸습니다. 스태프에게 다시 확인하세요!" });
      return;
    }
    await updateQuestStatus(walletAddress, productId, currentStepNum, isLastStep);
    res.json({ correct: true, message: "스태프 인증 완료! 🎉" });
    return;
  }

  if (quest.questType === "threejs") {
    const { order } = req.body as { order?: number[] };
    if (!Array.isArray(order) || order.length !== 6) {
      res.status(400).json({ error: "order 배열(6개)이 필요합니다" });
      return;
    }
    const CORRECT = [0, 1, 2, 3, 4, 5];
    const correct = CORRECT.every((v, i) => order[i] === v);
    await recordAnswer(walletAddress, productId, currentStepNum, quest.questType, { order }, correct);
    if (!correct) {
      res.json({ correct: false, message: "순서가 맞지 않습니다. 다시 시도해보세요!" });
      return;
    }
    await updateQuestStatus(walletAddress, productId, currentStepNum, isLastStep);
    res.json({ correct: true, message: "완벽합니다! x402 흐름을 이해했습니다 🎉" });
    return;
  }

  if (quest.questType === "drag-drop") {
    const { participation } = req.body as { participation?: boolean };
    if (participation !== true) {
      res.status(400).json({ error: "participation 필드가 필요합니다" });
      return;
    }
    await recordAnswer(walletAddress, productId, currentStepNum, quest.questType, { participation }, true);
    await updateQuestStatus(walletAddress, productId, currentStepNum, isLastStep);
    res.json({ correct: true, message: "블록 연결 완료! x402 흐름을 파악했습니다 🧱" });
    return;
  }

  if (quest.questType === "snowman-sabotage") {
    const { participation } = req.body as { participation?: boolean };
    if (participation !== true) {
      res.status(400).json({ error: "participation 필드가 필요합니다" });
      return;
    }
    await recordAnswer(walletAddress, productId, currentStepNum, quest.questType, { participation }, true);
    await updateQuestStatus(walletAddress, productId, currentStepNum, isLastStep);
    res.json({ correct: true, message: "3라운드 완료! 합의는 항상 이깁니다 ❄️" });
    return;
  }

  if (quest.questType === "feedback") {
    if (!feedback?.good || !feedback?.bad || !feedback?.next) {
      res.status(400).json({ error: "모든 피드백 항목을 입력해주세요" });
      return;
    }
    await recordFeedback(walletAddress, feedback.good, feedback.bad, feedback.next);
    await updateQuestStatus(walletAddress, productId, currentStepNum, isLastStep);
    res.json({ correct: true, message: "피드백 감사합니다! 🎉" });
    return;
  }

  if (quest.questType === "interests") {
    const filled = interests?.filter(e => e.nickname && e.interest.trim()) ?? [];
    if (filled.length < 3) {
      res.status(400).json({ error: "3명 이상의 관심사를 입력해주세요" });
      return;
    }
    await recordInterests(walletAddress, filled);
    await updateQuestStatus(walletAddress, productId, currentStepNum, isLastStep);
    res.json({ correct: true, message: "관심사 수집 완료! 🎉" });
    return;
  }

  res.status(400).json({ error: "지원하지 않는 퀘스트 타입입니다" });
});

export default router;
