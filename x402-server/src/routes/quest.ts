import { Router, type Request, type Response } from "express";
import { getQuest } from "../quests.js";
import { verifyPayment, settlePayment } from "../facilitator.js";
import { airdrop } from "../airdrop.js";
import { getUser, updateQuestStatus } from "../db.js";
import type { PaymentRequirements, X402Response } from "../types.js";

const router = Router();

// X-PAYMENT 헤더 파싱 (base64 JSON)
function parsePaymentHeader(header: string): unknown {
  try {
    return JSON.parse(Buffer.from(header, "base64").toString("utf8"));
  } catch {
    return null;
  }
}

function buildPaymentRequirements(productId: string, step: string, price: bigint): PaymentRequirements {
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

// GET /v1/quest/:productId/:step — 퀘스트 조회 (x402 게이팅)
router.get("/:productId/:step", async (req: Request, res: Response) => {
  const { productId, step } = req.params;
  const quest = getQuest(productId, step);
  
  if (!quest) {
    res.status(404).json({ error: "Quest not found" });
    return;
  }

  // 무료 퀘스트는 바로 반환
  if (quest.price === 0n) {
    res.json({
      id: quest.id,
      name: quest.name,
      question: quest.question,
      choices: quest.choices,
      reward: `${Number(quest.reward) / 1e18} TONE`,
    });
    return;
  }

  const paymentHeader = req.headers["x-payment"] as string | undefined;

  // 결제 헤더 없음 → 표준 402 응답
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

  // 결제 헤더 파싱
  const paymentPayload = parsePaymentHeader(paymentHeader);
  if (!paymentPayload) {
    res.status(400).json({ error: "X-PAYMENT 헤더 파싱 실패" });
    return;
  }

  const requirements = buildPaymentRequirements(productId, step, quest.price);

  // facilitator verify
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

  // [상태 관리] 사용자가 이전 단계를 완료했는지 확인
  const payer = verifyResult.payer;
  if (payer) {
    const user = getUser(payer);
    const currentStepNum = parseInt(step, 10);
    
    if (!user) {
      res.status(403).json({ error: "등록되지 않은 사용자이거나 1단계를 완료하지 않았습니다." });
      return;
    }
    
    // 1인 1경로 제한 체크
    if (user.currentProductId && user.currentProductId !== productId) {
      res.status(403).json({ error: "다른 상품 경로를 진행 중입니다. 한 번에 하나의 경로만 참여 가능합니다." });
      return;
    }
    
    // 순차 진행 체크
    const userStep = user.currentStep || 0;
    if (userStep !== currentStepNum - 1) {
      res.status(403).json({ error: `이전 단계를 완료해야 합니다. 현재 진행 가능 단계: ${userStep + 1}` });
      return;
    }
  }

  // facilitator settle
  try {
    const settleResult = await settlePayment(paymentPayload, requirements);
    if (!settleResult.success) {
      res.status(402).json({
        error: "결제 정산 실패",
        reason: settleResult.errorReason,
        message: settleResult.errorMessage,
      });
      return;
    }

    // 정산 성공 → 퀘스트 내용 반환
    res.setHeader("X-PAYMENT-RESPONSE", settleResult.transaction);
    res.json({
      id: quest.id,
      name: quest.name,
      question: quest.question,
      choices: quest.choices,
      reward: `${Number(quest.reward) / 1e18} TONE`,
      settleTx: settleResult.transaction,
    });
  } catch (e) {
    res.status(502).json({ error: "facilitator settle 실패", detail: String(e) });
  }
});

// POST /v1/quest/:productId/:step/answer — 정답 제출
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

  // 비밀코드 검증 (Quest 10 등)
  if (quest.secretCode) {
    if (!secretCode) {
      res.status(400).json({ error: "secretCode가 필요합니다" });
      return;
    }
    if (secretCode !== quest.secretCode) {
      res.json({ correct: false, message: "비밀코드가 틀렸습니다. 다시 시도해보세요!" });
      return;
    }
  } else {
    // 일반 객관식/OX 검증
    if (answerIndex === undefined) {
      res.status(400).json({ error: "answerIndex가 필요합니다" });
      return;
    }
    if (answerIndex !== quest.answerIndex) {
      res.json({ correct: false, message: "틀렸습니다. 다시 시도해보세요!" });
      return;
    }
  }

  // 정답 — 에어드랍
  try {
    const txHash = await airdrop(walletAddress, quest.reward);
    
    const currentStepNum = parseInt(step, 10);
    const isLastStep = currentStepNum === 10;
    
    // [상태 관리] 진행 상태 저장
    updateQuestStatus(walletAddress, productId, currentStepNum, isLastStep);
    
    res.json({
      correct: true,
      message: `정답입니다! ${Number(quest.reward) / 1e18} TONE를 에어드랍했습니다.`,
      airdropTx: txHash,
      nextQuestHint: isLastStep
        ? "모든 퀘스트를 완료했습니다! 상품을 수령하세요. 🎉"
        : `다음: /v1/quest/${productId}/${currentStepNum + 1}`,
    });
  } catch (e) {
    res.status(500).json({ error: "에어드랍 실패", detail: String(e) });
  }
});

export default router;
