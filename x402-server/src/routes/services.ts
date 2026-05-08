import { Router } from "express";
import { QUESTS } from "../quests.js";

const router = Router();

// GET /v1/services — 퀘스트 목록
router.get("/", (_req, res) => {
  const API_BASE = process.env.API_BASE_URL || "http://localhost:4010";

  const services = QUESTS.map((q) => ({
    id: q.id,
    name: q.name,
    description: q.description,
    category: "Quest",
    networks: ["avalanche-l1-402"],
    endpoints: [
      {
        url: `${API_BASE}/v1/quest/${q.id}`,
        method: "GET",
        description: q.description,
        pricing: {
          amount: q.price === 0n ? "0" : q.price.toString(),
          currency: "native",
          note: q.price === 0n ? "무료" : `${Number(q.price) / 1e18} TONE`,
        },
      },
    ],
  }));

  res.json({ services });
});

// GET /v1/services/search?q=...
router.get("/search", (req, res) => {
  const q = String(req.query.q || "").toLowerCase();
  const API_BASE = process.env.API_BASE_URL || "http://localhost:4010";

  const services = QUESTS.filter(
    (quest) =>
      quest.name.toLowerCase().includes(q) ||
      quest.description.toLowerCase().includes(q),
  ).map((quest) => ({
    id: quest.id,
    name: quest.name,
    description: quest.description,
    category: "Quest",
    networks: ["avalanche-l1-402"],
    endpoints: [
      {
        url: `${API_BASE}/v1/quest/${quest.id}`,
        method: "GET",
        description: quest.description,
        pricing: {
          amount: quest.price === 0n ? "0" : quest.price.toString(),
          currency: "native",
          note: quest.price === 0n ? "무료" : `${Number(quest.price) / 1e18} TONE`,
        },
      },
    ],
  }));

  res.json({ services });
});

export default router;
