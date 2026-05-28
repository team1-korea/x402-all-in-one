import { Router } from 'express';

const router = Router();
export const marathonState: { started: boolean; startedAt: string | null } = {
  started: false,
  startedAt: null,
};

router.get('/status', (_req, res) => {
  res.json({ started: marathonState.started, startedAt: marathonState.startedAt });
});

router.post('/start', (_req, res) => {
  marathonState.started = true;
  if (!marathonState.startedAt) marathonState.startedAt = new Date().toISOString();
  res.json({ started: marathonState.started, startedAt: marathonState.startedAt });
});

router.post('/stop', (_req, res) => {
  marathonState.started = false;
  res.json({ started: marathonState.started, startedAt: marathonState.startedAt });
});

export default router;
