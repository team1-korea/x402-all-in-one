import { Router, type Request, type Response } from 'express';
import { supabase } from '../supabase.js';
import { marathonState } from './marathon.js';
import { getUser, listUsers, updateQuestStatus } from '../db.js';
import { airdrop } from '../airdrop.js';

const router = Router();

function checkPassword(req: Request, res: Response): boolean {
  const { password } = req.body as { password?: string };
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ ok: false, error: 'unauthorized' });
    return false;
  }
  return true;
}

// POST /v1/admin/auth
router.post('/auth', (req: Request, res: Response) => {
  if (!checkPassword(req, res)) return;
  res.json({ ok: true });
});

// POST /v1/admin/users — 전체 유저 목록 (full wallet address 포함)
router.post('/users', async (req: Request, res: Response) => {
  if (!checkPassword(req, res)) return;
  try {
    const users = await listUsers();
    const rankMap = new Map<string, number>();
    [...users]
      .filter((u) => u.isCompleted && u.completedAt)
      .sort((a, b) => {
        const diff = new Date(a.completedAt!).getTime() - new Date(b.completedAt!).getTime();
        return diff !== 0 ? diff : a.walletAddress.localeCompare(b.walletAddress);
      })
      .forEach((u, i) => rankMap.set(u.walletAddress, i + 1));
    res.json({
      ok: true,
      marathonStartedAt: marathonState.startedAt,
      users: users.map((u) => ({
        walletAddress: u.walletAddress,
        nickname: u.nickname ?? `${u.walletAddress.slice(0, 6)}…${u.walletAddress.slice(-4)}`,
        purchasedSteps: u.purchasedSteps ?? [],
        completedSteps: u.completedSteps ?? [],
        isCompleted: u.isCompleted ?? false,
        completedAt: u.completedAt ?? null,
        registeredAt: u.registeredAt,
        rank: rankMap.get(u.walletAddress) ?? null,
      })),
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// POST /v1/admin/force-complete
router.post('/force-complete', async (req: Request, res: Response) => {
  if (!checkPassword(req, res)) return;
  const { walletAddress, step } = req.body as { walletAddress?: string; step?: number };
  if (!walletAddress || typeof step !== 'number') {
    res.status(400).json({ ok: false, error: 'walletAddress and step required' });
    return;
  }
  const user = await getUser(walletAddress);
  if (!user) {
    res.status(404).json({ ok: false, error: '유저를 찾을 수 없습니다' });
    return;
  }
  await updateQuestStatus(walletAddress, user.currentProductId ?? 'basic', step);
  res.json({ ok: true });
});

// POST /v1/admin/airdrop
router.post('/airdrop', async (req: Request, res: Response) => {
  if (!checkPassword(req, res)) return;
  const { walletAddress } = req.body as { walletAddress?: string };
  if (!walletAddress) {
    res.status(400).json({ ok: false, error: 'walletAddress required' });
    return;
  }
  try {
    const TWENTY_USDC = 20n * 10n ** 6n;
    const txHash = await airdrop(walletAddress, TWENTY_USDC);
    res.json({ ok: true, txHash });
  } catch (e) {
    res.status(500).json({ ok: false, error: e instanceof Error ? e.message : String(e) });
  }
});

// POST /v1/admin/interests
router.post('/interests', async (req: Request, res: Response) => {
  if (!checkPassword(req, res)) return;
  const { data, error } = await supabase.from('interests').select('wallet_address, tags');
  if (error) {
    res.status(500).json({ ok: false, error: error.message });
    return;
  }
  res.json({ ok: true, entries: data ?? [] });
});

// POST /v1/admin/reset (기존 — 비밀번호 검증 추가)
router.post('/reset', async (req: Request, res: Response) => {
  if (!checkPassword(req, res)) return;
  const tables = ['quest_answers', 'quest_tokens', 'feedback', 'interests', 'users'];
  const errors: string[] = [];
  for (const table of tables) {
    const { error } = await supabase.from(table).delete().neq('wallet_address', '__never__');
    if (error) errors.push(`${table}: ${error.message}`);
  }
  marathonState.started = false;
  if (errors.length > 0) {
    res.status(500).json({ ok: false, errors });
  } else {
    res.json({ ok: true, message: 'DB 초기화 완료, 마라톤 리셋' });
  }
});

export default router;
