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
router.get("/", async (req: Request, res: Response) => {
  const QUEST_BASE = process.env.QUEST_BASE_URL || "http://localhost:3000";
  const productId = String(req.query.productId || "product-a");
  const wallet = req.query.wallet as string | undefined;

  const quests = getAllQuests(productId);
  if (!quests) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const user = wallet ? await getUser(wallet) : undefined;

  const services = await Promise.all(
    quests.map(async (q, idx) => {
      const stepNum = idx + 1;
      const status = getQuestStatus(stepNum, user);
      const base = {
        id: q.id,
        name: q.name,
        description: q.description,
        questType: q.questType,
        status,
        price: q.price === 0n ? "무료" : "10 USDC",
        difficulty: q.difficulty,
        endpoint: `http://localhost:4010/v1/quest/${productId}/${stepNum}`,
      };

      if ((status === "cleared" || status === "purchased") && user) {
        const token = await getQuestTokenByStep(user.walletAddress, productId, stepNum);
        if (token) {
          return { ...base, questUrl: `${QUEST_BASE}/quest/${token.uuid}` };
        }
      }

      return base;
    }),
  );

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
