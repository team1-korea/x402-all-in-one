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

    // 등수: 완료자만 completedAt 오름차순으로 별도 계산
    const rankMap = new Map<string, number>();
    [...users]
      .filter((u) => u.isCompleted && u.completedAt)
      .sort((a, b) => {
        const diff = new Date(a.completedAt!).getTime() - new Date(b.completedAt!).getTime();
        return diff !== 0 ? diff : a.walletAddress.localeCompare(b.walletAddress);
      })
      .forEach((u, i) => rankMap.set(u.walletAddress, i + 1));

    // 화면 순서: 항상 registeredAt 오름차순 고정
    const totalQuestAccesses = users.reduce(
      (sum, u) => sum + (u.purchasedSteps?.length ?? 0),
      0
    );

    res.json({
      totalUsers: users.length,
      completedUsers: users.filter((u) => u.isCompleted).length,
      totalQuestAccesses,
      marathonStartedAt: marathonState.startedAt,
      users: users.map((u) => ({
        nickname: u.nickname ?? truncateWallet(u.walletAddress),
        walletAddress: truncateWallet(u.walletAddress),
        purchasedSteps: u.purchasedSteps ?? [],
        completedSteps: u.completedSteps ?? [],
        isCompleted: u.isCompleted ?? false,
        completedAt: u.completedAt ?? null,
        registeredAt: u.registeredAt,
        rank: rankMap.get(u.walletAddress) ?? null,
      })),
    });
  } catch (e) {
    console.error("dashboard stats error:", e);
    res.status(500).json({ error: "internal error" });
  }
});

export default router;
