import { Router, type Request, type Response } from "express";
import { listUsers } from "../db.js";
import { marathonState } from "./marathon.js";

const router = Router();

function truncateWallet(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

// GET /v1/dashboard/stats
router.get("/stats", async (_req: Request, res: Response) => {
  try {
    const users = await listUsers();

    // 완료자: completedAt 오름차순, 미완료자: registeredAt 오름차순
    const sorted = [...users].sort((a, b) => {
      if (a.isCompleted && b.isCompleted) {
        return new Date(a.completedAt!).getTime() - new Date(b.completedAt!).getTime();
      }
      if (a.isCompleted) return -1;
      if (b.isCompleted) return 1;
      return new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime();
    });

    const totalQuestAccesses = sorted.reduce(
      (sum, u) => sum + (u.purchasedSteps?.length ?? 0),
      0
    );

    res.json({
      totalUsers: sorted.length,
      completedUsers: sorted.filter((u) => u.isCompleted).length,
      totalQuestAccesses,
      marathonStartedAt: marathonState.startedAt,
      users: sorted.map((u) => ({
        nickname: u.nickname ?? truncateWallet(u.walletAddress),
        walletAddress: truncateWallet(u.walletAddress),
        purchasedSteps: u.purchasedSteps ?? [],
        completedSteps: u.completedSteps ?? [],
        isCompleted: u.isCompleted ?? false,
        completedAt: u.completedAt ?? null,
        registeredAt: u.registeredAt,
      })),
    });
  } catch (e) {
    console.error("dashboard stats error:", e);
    res.status(500).json({ error: "internal error" });
  }
});

export default router;
