import { Router } from 'express';
import { supabase } from '../supabase.js';
import { marathonState } from './marathon.js';

const router = Router();

router.post('/reset', async (_req, res) => {
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
