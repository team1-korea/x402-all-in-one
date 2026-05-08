import { Router, type Request, type Response } from "express";
import { getQuest } from "../quests.js";
import { verifyPayment, settlePayment } from "../facilitator.js";
import { airdrop } from "../airdrop.js";
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

function buildPaymentRequirements(questId: string, price: bigint): PaymentRequirements {
  const API_BASE = process.env.API_BASE_URL || "http://localhost:4010";
  return {
    scheme: "exact",
    network: `eip155:${process.env.CHAIN_ID || "402"}`,
    asset: "native",
    amount: price.toString(),
    payTo: process.env.PAY_TO!,
    maxTimeoutSeconds: 60,
    resource: `${API_BASE}/v1/quest/${questId}`,
    description: `Quest ${questId} access payment`,
    mimeType: "application/json",
  };
}

// GET /v1/quest/:id — 퀘스트 조회 (x402 게이팅)
router.get("/:id", async (req: Request, res: Response) => {
  const quest = getQuest(req.params.id);
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
      reward: `${Number(quest.reward) / 1e18} APIX`,
    });
    return;
  }

  const paymentHeader = req.headers["x-payment"] as string | undefined;

  // 결제 헤더 없음 → 표준 402 응답
  if (!paymentHeader) {
    const requirements = buildPaymentRequirements(quest.id, quest.price);
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

  const requirements = buildPaymentRequirements(quest.id, quest.price);

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

  // facilitator settle (비동기 — 응답은 먼저 보내도 되지만 여기선 대기)
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
      reward: `${Number(quest.reward) / 1e18} APIX`,
      settleTx: settleResult.transaction,
    });
  } catch (e) {
    res.status(502).json({ error: "facilitator settle 실패", detail: String(e) });
  }
});

// POST /v1/quest/:id/answer — 정답 제출
router.post("/:id/answer", async (req: Request, res: Response) => {
  const quest = getQuest(req.params.id);
  if (!quest) {
    res.status(404).json({ error: "Quest not found" });
    return;
  }

  const { answerIndex, walletAddress } = req.body as {
    answerIndex?: number;
    walletAddress?: string;
  };

  if (answerIndex === undefined || !walletAddress) {
    res.status(400).json({ error: "answerIndex와 walletAddress가 필요합니다" });
    return;
  }

  if (answerIndex !== quest.answerIndex) {
    res.json({ correct: false, message: "틀렸습니다. 다시 시도해보세요!" });
    return;
  }

  // 정답 — 에어드랍
  try {
    const txHash = await airdrop(walletAddress, quest.reward);
    res.json({
      correct: true,
      message: `정답입니다! ${Number(quest.reward) / 1e18} APIX를 에어드랍했습니다.`,
      airdropTx: txHash,
      nextQuestHint:
        quest.id === "quest-3"
          ? "모든 퀘스트를 완료했습니다! 🎉"
          : `다음: /v1/quest/${nextQuestId(quest.id)}`,
    });
  } catch (e) {
    res.status(500).json({ error: "에어드랍 실패", detail: String(e) });
  }
});

function nextQuestId(currentId: string): string {
  const num = parseInt(currentId.replace("quest-", ""), 10);
  return `quest-${num + 1}`;
}

export default router;
