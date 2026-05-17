import { Router, type Request, type Response } from "express";
import { listUsers } from "../db.js";

const router = Router();

function truncateWallet(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

// GET /v1/dashboard/stats
router.get("/stats", async (_req: Request, res: Response) => {
  try {
    const users = await listUsers();

    const sorted = [...users].sort(
      (a, b) => new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime()
    );

    const totalQuestAccesses = sorted.reduce(
      (sum, u) => sum + (u.purchasedSteps?.length ?? 0),
      0
    );

    res.json({
      totalUsers: sorted.length,
      completedUsers: sorted.filter((u) => u.isCompleted).length,
      totalQuestAccesses,
      users: sorted.map((u) => ({
        nickname: u.nickname ?? truncateWallet(u.walletAddress),
        walletAddress: truncateWallet(u.walletAddress),
        purchasedSteps: u.purchasedSteps ?? [],
        isCompleted: u.isCompleted ?? false,
        registeredAt: u.registeredAt,
      })),
    });
  } catch (e) {
    console.error("dashboard stats error:", e);
    res.status(500).json({ error: "internal error" });
  }
});

export default router;
