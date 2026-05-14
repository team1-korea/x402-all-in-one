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
