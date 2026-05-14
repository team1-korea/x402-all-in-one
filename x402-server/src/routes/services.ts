import { Router, type Request, type Response } from "express";
import { getAllQuests } from "../quests.js";
import { getUser, getQuest10TokenByWallet } from "../db.js";
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
      price: q.price === 0n ? "무료" : "1 TONE",
      endpoint: `${API_BASE}/v1/quest/${productId}/${stepNum}`,
    };

    if (status === "cleared" || status === "purchased") {
      const extra: Record<string, unknown> = {
        question: q.question,
        choices: q.choices,
      };
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

  res.json({
    results: results.map((quest) => ({
      id: quest.id,
      name: quest.name,
      description: quest.description,
    })),
  });
});

export default router;
