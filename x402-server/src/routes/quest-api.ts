import { Router, type Request, type Response } from "express";
import { getQuestToken } from "../db.js";
import { getQuest } from "../quests.js";

const router = Router();

// GET /quest-api/:uuid — frontend calls this to get quest data
router.get("/:uuid", async (req: Request, res: Response) => {
  const { uuid } = req.params;
  const token = await getQuestToken(uuid);

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
    ...(quest.theory && { theory: quest.theory }),
    ...(quest.questions && {
      questions: quest.questions.map((q) => ({
        question: q.question,
        choices: q.choices,
      })),
    }),
  });
});

export default router;
